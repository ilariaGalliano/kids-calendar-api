import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, IsNull } from 'typeorm';
import { Activity } from './activity.entity';
import { Children } from '../children/children.entity';
import { Routine } from '../routine/routine.entity';
import { RoutineTask } from '../routine/routine-task.entity';
import { TaskEntity } from '../tasks/task.entity';
import { RoutineActivityCompletion } from './routine-activity-completion.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Children)
    private readonly childrenRepository: Repository<Children>,
    @InjectRepository(Routine)
    private readonly routineRepository: Repository<Routine>,
    @InjectRepository(RoutineTask)
    private readonly routineTaskRepository: Repository<RoutineTask>,
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(RoutineActivityCompletion)
    private readonly completionRepository: Repository<RoutineActivityCompletion>,
  ) {}

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private combineDateAndTime(baseDate: Date, hhmm?: string | null): Date {
    const d = new Date(baseDate);
    d.setHours(8, 0, 0, 0);

    if (!hhmm) return d;

    const [h, m] = hhmm.split(':').map((v) => Number(v));
    if (Number.isFinite(h) && Number.isFinite(m)) {
      d.setHours(h, m, 0, 0);
    }
    return d;
  }

  private async buildRoutineActivitiesForChildren(
    childIds: string[],
    start: Date,
    end: Date,
  ): Promise<any[]> {
    if (!childIds.length) return [];

    const children = await this.childrenRepository.findBy({ id: In(childIds) });
    const childById = new Map(children.map((c) => [c.id, c]));

    const routines = await this.routineRepository.find({
      where: { child_id: In(childIds) },
      order: { created_at: 'ASC' },
    });
    if (!routines.length) return [];

    const routineIds = routines.map((r) => r.id);
    const links = await this.routineTaskRepository.find({
      where: { routine_id: In(routineIds) },
      order: { sort_order: 'ASC', id: 'ASC' },
      select: ['id', 'routine_id', 'task_id', 'sort_order', 'day_of_week'], // Explicitly select day_of_week
    });
    if (!links.length) return [];

    const taskIds = Array.from(new Set(links.map((l) => l.task_id)));
    const tasks = await this.taskRepository.findBy({ id: In(taskIds) });
    const taskById = new Map(tasks.map((t) => [t.id, t]));

    // Load completions for this date range
    const startDate = this.formatDate(start);
    const endDate = this.formatDate(end);
    const completions = await this.completionRepository
      .createQueryBuilder('c')
      .where('c.child_id IN (:...childIds)', { childIds })
      .andWhere('c.date >= :startDate', { startDate })
      .andWhere('c.date <= :endDate', { endDate })
      .andWhere('c.done = true')
      .getMany();

    // Create a Map for quick lookup: key = "routineId_taskId_date"
    const completionMap = new Map<string, RoutineActivityCompletion>();
    completions.forEach(c => {
      const key = `${c.routine_id}_${c.task_id}_${c.date}`;
      completionMap.set(key, c);
    });

    const linksByRoutine = new Map<string, RoutineTask[]>();
    for (const link of links) {
      const arr = linksByRoutine.get(link.routine_id) ?? [];
      arr.push(link);
      linksByRoutine.set(link.routine_id, arr);
    }

    const out: any[] = [];
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setHours(23, 59, 59, 999);

    while (cursor <= endDay) {
      const dayDow = cursor.getDay(); // 0=Sunday, 1=Monday, etc.
      const dayKey = this.formatDate(cursor);

      for (const routine of routines) {
        const routineLinks = linksByRoutine.get(routine.id) ?? [];
        const child = childById.get(routine.child_id);

        // Filter tasks for this specific day
        const tasksForToday = routineLinks.filter(link => {
          // If day_of_week is null, task applies to all days (legacy)
          if (link.day_of_week === null || link.day_of_week === undefined) {
            // For legacy tasks, check if routine.day_of_week matches
            return (routine.day_of_week ?? -1) === dayDow;
          }
          // For day-specific tasks, check if task's day_of_week matches
          return link.day_of_week === dayDow;
        });

        if (tasksForToday.length === 0) continue;

        // Calculate start time for tasks in sequence
        let currentTime = new Date(cursor);
        currentTime.setHours(8, 0, 0, 0); // Default start time

        for (const link of tasksForToday) {
          const task = taskById.get(link.task_id);
          if (!task || task.is_active === false) continue;

          const startAt = new Date(currentTime);
          const duration = Number(task.duration ?? 5);
          const endAt = new Date(startAt.getTime() + duration * 60 * 1000);

          // Update current time for next task
          currentTime = new Date(endAt);

          if (startAt < start || startAt > end) continue;

          // Check if this task was completed
          const completionKey = `${routine.id}_${task.id}_${dayKey}`;
          const isCompleted = completionMap.has(completionKey);

          out.push({
            id: `routine_${routine.id}_${task.id}_${dayKey}`,
            name_activity: task.title,
            value: task.reward ?? null,
            date_start: startAt,
            date_end: endAt,
            done: isCompleted,
            timer: duration,
            expire_time: null,
            description: task.description ?? routine.description,
            created_at: routine.created_at,
            updated_at: routine.updated_at,
            user_id: child?.user_id,
            children_id: routine.child_id,
            icon: task.icon ?? '🎯',
            source: 'routine',
            routine_id: routine.id,
            task_id: task.id,
            child_name: child?.name,
            sort_order: link.sort_order,
            day_of_week: link.day_of_week, // Include for debugging
          });
        }
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return out.sort(
      (a, b) =>
        new Date(a.date_start).getTime() - new Date(b.date_start).getTime() ||
        Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0),
    );
  }

  async create(data: Partial<Activity>): Promise<Activity> {
    const activity = this.activityRepository.create(data);
    return this.activityRepository.save(activity);
  }

  async findAll(): Promise<Activity[]> {
    return this.activityRepository.find();
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOneBy({ id } as any);
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }

  async update(id: string, data: Partial<Activity>): Promise<Activity> {
    // Check if this is a routine-generated activity (ID format: routine_{routineId}_{taskId}_{date})
    if (id.startsWith('routine_')) {
      return this.updateRoutineActivity(id, data);
    }

    // Normal activity update
    const activity = await this.activityRepository.findOneBy({ id } as any);
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    const updated = Object.assign(activity, data);
    return this.activityRepository.save(updated);
  }

  private async updateRoutineActivity(id: string, data: Partial<Activity>): Promise<Activity> {
    // Parse ID: routine_{routineId}_{taskId}_{date}
    const parts = id.split('_');
    if (parts.length < 4) {
      throw new NotFoundException(`Invalid routine activity ID format: ${id}`);
    }

    const routineId = parts[1];
    const taskId = parts[2];
    const date = parts[3];

    // Get child_id from routine
    const routine = await this.routineRepository.findOne({ where: { id: routineId } });
    if (!routine) {
      throw new NotFoundException(`Routine ${routineId} not found`);
    }

    // If marking as done, create/update completion record
    if (data.done !== undefined) {
      if (data.done) {
        // Mark as done
        await this.completionRepository.upsert(
          {
            routine_id: routineId,
            task_id: taskId,
            child_id: routine.child_id,
            date: date,
            done: true,
            completed_at: new Date(),
            uncompleted_at: null,
          },
          ['routine_id', 'task_id', 'child_id', 'date']
        );
      } else {
        // Mark as undone
        await this.completionRepository.upsert(
          {
            routine_id: routineId,
            task_id: taskId,
            child_id: routine.child_id,
            date: date,
            done: false,
            uncompleted_at: new Date(),
          },
          ['routine_id', 'task_id', 'child_id', 'date']
        );
      }
    }

    // Return a mock Activity object (since it doesn't exist in DB)
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    return {
      id,
      done: data.done ?? false,
      name_activity: task?.title ?? 'Task',
      // Add other required fields as needed
    } as Activity;
  }

  async delete(id: string): Promise<{ message: string }> {
    const result = await this.activityRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return { message: `Activity with ID ${id} has been deleted successfully!` };
  }

  // Trova activities per child ID
  async findByChildId(childId: string): Promise<Activity[]> {
    const db = await this.activityRepository.find({ 
      where: { children_id: childId },
      order: { date_start: 'ASC' }
    });

    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setDate(end.getDate() + 30);
    end.setHours(23, 59, 59, 999);

    const routine = await this.buildRoutineActivitiesForChildren([childId], start, end);
    return [...db, ...routine] as Activity[];
  }

//   // Trova activities per user ID
//   async findByUserId(userId: number): Promise<Activity[]> {
//     return this.activityRepository.find({ 
//       where: { user_id: userId },
//       order: { date_start: 'ASC' }
//     });
//   }

  // Trova activities per un giorno specifico
  async findByDay(childId: string, date: string): Promise<Activity[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const db = await this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.children_id = :childId', { childId })
      .andWhere('activity.date_start >= :start', { start: startOfDay })
      .andWhere('activity.date_start <= :end', { end: endOfDay })
      .orderBy('activity.date_start', 'ASC')
      .getMany();

    const routine = await this.buildRoutineActivitiesForChildren([childId], startOfDay, endOfDay);
    return [...db, ...routine]
      .sort((a: any, b: any) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()) as Activity[];
  }

  // Trova activities per una settimana
  async findByWeek(childId: string, startDate: string): Promise<Activity[]> {
    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setDate(end.getDate() + 7);

    const db = await this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.children_id = :childId', { childId })
      .andWhere('activity.date_start >= :start', { start })
      .andWhere('activity.date_start < :end', { end })
      .orderBy('activity.date_start', 'ASC')
      .getMany();

    const routine = await this.buildRoutineActivitiesForChildren([childId], start, end);
    return [...db, ...routine]
      .sort((a: any, b: any) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()) as Activity[];
  }

  // Trova activities per "now" (ora corrente +/- 2 ore)
  async findByNow(childId: string): Promise<Activity[]> {
    const now = new Date();
    const twoHoursBefore = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const twoHoursAfter = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const db = await this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.children_id = :childId', { childId })
      .andWhere('activity.date_start >= :before', { before: twoHoursBefore })
      .andWhere('activity.date_start <= :after', { after: twoHoursAfter })
      .orderBy('activity.date_start', 'ASC')
      .getMany();

    const routine = await this.buildRoutineActivitiesForChildren([childId], twoHoursBefore, twoHoursAfter);
    return [...db, ...routine]
      .sort((a: any, b: any) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()) as Activity[];
  }

  // Trova activities per un giorno specifico per tutti i children dell'utente
  async findDayForUser(userId: string, date: string): Promise<Activity[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const db = await this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.user_id = :userId', { userId })
      .andWhere('activity.date_start >= :start', { start: startOfDay })
      .andWhere('activity.date_start <= :end', { end: endOfDay })
      .orderBy('activity.date_start', 'ASC')
      .getMany();

    const children = await this.childrenRepository.find({ where: { user_id: userId } });
    const childIds = children.map((c) => c.id);
    const routine = await this.buildRoutineActivitiesForChildren(childIds, startOfDay, endOfDay);

    return [...db, ...routine]
      .sort((a: any, b: any) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()) as Activity[];
  }

  // Trova activities "ora corrente" (+/- 2h) per tutti i children dell'utente
  async findNowForUser(userId: string): Promise<Activity[]> {
    const now = new Date();
    const twoHoursBefore = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const twoHoursAfter = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const db = await this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.user_id = :userId', { userId })
      .andWhere('activity.date_start >= :before', { before: twoHoursBefore })
      .andWhere('activity.date_start <= :after', { after: twoHoursAfter })
      .orderBy('activity.date_start', 'ASC')
      .getMany();

    const children = await this.childrenRepository.find({ where: { user_id: userId } });
    const childIds = children.map((c) => c.id);
    const routine = await this.buildRoutineActivitiesForChildren(childIds, twoHoursBefore, twoHoursAfter);

    return [...db, ...routine]
      .sort((a: any, b: any) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()) as Activity[];
  }

  // Trova tutte le activities per tutti i children di un utente in una settimana
  async findWeekForUser(userId: string, startDate: string): Promise<Activity[]> {
    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setDate(end.getDate() + 7);

    const db = await this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.user_id = :userId', { userId })
      .andWhere('activity.date_start >= :start', { start })
      .andWhere('activity.date_start < :end', { end })
      .orderBy('activity.date_start', 'ASC')
      .getMany();

    const children = await this.childrenRepository.find({ where: { user_id: userId } });
    const childIds = children.map((c) => c.id);
    const routine = await this.buildRoutineActivitiesForChildren(childIds, start, end);

    return [...db, ...routine]
      .sort((a: any, b: any) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()) as Activity[];
  }

  // Aggiorna lo schedule quando l'utente sposta task via drag & drop
  async updateSchedule(
    userId: string,
    movedTasks: Array<{
      taskId: string;
      fromDay: string;
      toDay: string;
      fromChildId: string;
      toChildId: string;
    }>,
  ): Promise<{ updated: number; errors: string[] }> {
    const errors: string[] = [];
    let updated = 0;

    for (const move of movedTasks) {
      try {
        // Verifica che il bambino appartenga all'utente
        const child = await this.childrenRepository.findOne({
          where: { id: move.toChildId, user_id: userId },
        });

        if (!child) {
          errors.push(`Child ${move.toChildId} not found or not owned by user`);
          continue;
        }

        // Calcola day_of_week dalla data
        const toDayOfWeek = move.toDay === 'now' ? null : new Date(move.toDay).getDay();

        // Se il bambino è cambiato, dobbiamo gestire diversamente
        if (move.fromChildId !== move.toChildId) {
          // Trova la routine del bambino di destinazione
          let targetRoutine = await this.routineRepository.findOne({
            where: { child_id: move.toChildId },
          });

          // Se non esiste una routine per il bambino, creala
          if (!targetRoutine) {
            targetRoutine = this.routineRepository.create({
              child_id: move.toChildId,
              nametask: `Routine ${child.name}`,
              description: 'Routine',
              day_of_week: 0,
            });
            await this.routineRepository.save(targetRoutine);
          }

          // Trova la routine del bambino di origine
          const sourceRoutine = await this.routineRepository.findOne({
            where: { child_id: move.fromChildId },
          });

          if (!sourceRoutine) {
            errors.push(`Source routine not found for child ${move.fromChildId}`);
            continue;
          }

          // Rimuovi il task dalla routine di origine
          await this.routineTaskRepository.delete({
            routine_id: sourceRoutine.id,
            task_id: move.taskId,
          });

          // Verifica se il task esiste già nella routine di destinazione per quel giorno
          const existingLink = await this.routineTaskRepository.findOne({
            where: {
              routine_id: targetRoutine.id,
              task_id: move.taskId,
              day_of_week: toDayOfWeek === null ? IsNull() : toDayOfWeek,
            },
          });

          if (!existingLink) {
            // Aggiungi il task alla routine di destinazione
            const maxSortOrder = await this.routineTaskRepository
              .createQueryBuilder('rt')
              .where('rt.routine_id = :routineId', { routineId: targetRoutine.id })
              .andWhere('rt.day_of_week = :dayOfWeek', { dayOfWeek: toDayOfWeek })
              .select('MAX(rt.sort_order)', 'max')
              .getRawOne();

            const newSortOrder = (maxSortOrder?.max ?? -1) + 1;

            const newLink = this.routineTaskRepository.create({
              routine_id: targetRoutine.id,
              task_id: move.taskId,
              day_of_week: toDayOfWeek,
              sort_order: newSortOrder,
            });

            await this.routineTaskRepository.save(newLink);
          }
        } else {
          // Stesso bambino, giorno diverso - aggiorna solo day_of_week
          const routine = await this.routineRepository.findOne({
            where: { child_id: move.fromChildId },
          });

          if (!routine) {
            errors.push(`Routine not found for child ${move.fromChildId}`);
            continue;
          }

          const fromDayOfWeek = move.fromDay === 'now' ? null : new Date(move.fromDay).getDay();

          // Trova il link da aggiornare
          const link = await this.routineTaskRepository.findOne({
            where: {
              routine_id: routine.id,
              task_id: move.taskId,
              day_of_week: fromDayOfWeek === null ? IsNull() : fromDayOfWeek,
            },
          });

          if (!link) {
            errors.push(`Task ${move.taskId} not found in routine for day ${fromDayOfWeek}`);
            continue;
          }

          // Verifica che non esista già per il giorno di destinazione
          const existingLink = await this.routineTaskRepository.findOne({
            where: {
              routine_id: routine.id,
              task_id: move.taskId,
              day_of_week: toDayOfWeek === null ? IsNull() : toDayOfWeek,
            },
          });

          if (existingLink && existingLink.id !== link.id) {
            // Elimina il vecchio e mantieni il nuovo
            await this.routineTaskRepository.delete(link.id);
          } else {
            // Aggiorna il day_of_week
            link.day_of_week = toDayOfWeek;
            await this.routineTaskRepository.save(link);
          }
        }

        updated++;
      } catch (error) {
        errors.push(`Error moving task ${move.taskId}: ${error.message}`);
      }
    }

    return { updated, errors };
  }
}

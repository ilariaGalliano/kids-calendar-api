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
    // Use ISO string construction to avoid server timezone offset on Vercel (UTC)
    const dayStr = this.formatDate(baseDate); // "YYYY-MM-DD"
    const timeStr = hhmm ? hhmm.substring(0, 5) : '08:00'; // "HH:MM"
    return new Date(`${dayStr}T${timeStr}:00`);
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
      select: ['id', 'routine_id', 'task_id', 'sort_order', 'day_of_week', 'start_time', 'end_time'],
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
    cursor.setUTCHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setUTCHours(23, 59, 59, 999);

    while (cursor <= endDay) {
      const dayDow = cursor.getUTCDay(); // 0=Sunday, 1=Monday, etc. — UTC to match toISOString()
      const dayKey = this.formatDate(cursor);

      for (const routine of routines) {
        const routineLinks = linksByRoutine.get(routine.id) ?? [];
        const child = childById.get(routine.child_id);

        // Filter tasks for this specific day: usa SOLO routine_tasks.day_of_week
        const tasksForToday = routineLinks.filter(link => link.day_of_week === dayDow);

        if (tasksForToday.length === 0) continue;

        // Sort tasks: those with explicit start_time first (by time), then sequential tasks
        const tasksWithTime = tasksForToday.filter(l => l.start_time);
        const tasksSequential = tasksForToday.filter(l => !l.start_time);
        
        // Sort tasks with explicit time by their start_time
        tasksWithTime.sort((a, b) => {
          const timeA = a.start_time || '00:00:00';
          const timeB = b.start_time || '00:00:00';
          return timeA.localeCompare(timeB);
        });

        // Calculate start time for sequential tasks (wall-clock 08:00, timezone-independent)
        let currentTime = new Date(`${dayKey}T08:00:00`);

        // Process tasks with explicit time first
        for (const link of tasksWithTime) {
          const task = taskById.get(link.task_id);
          if (!task || task.is_active === false) continue;

          // Build dates as "YYYY-MM-DDTHH:MM:00" (no Z) so they are treated as
          // wall-clock time independent of server timezone (avoids UTC offset on Vercel)
          const startTimeStr = (link.start_time || '08:00').substring(0, 5); // "HH:MM"
          const startAt = new Date(`${dayKey}T${startTimeStr}:00`);

          let endAt: Date;
          if (link.end_time) {
            const endTimeStr = link.end_time.substring(0, 5);
            endAt = new Date(`${dayKey}T${endTimeStr}:00`);
          } else {
            const duration = Number(task.duration ?? 5);
            endAt = new Date(startAt.getTime() + duration * 60 * 1000);
          }

          const duration = Math.round((endAt.getTime() - startAt.getTime()) / 60000);

          if (startAt < start || startAt > end) continue;

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
            day_of_week: link.day_of_week,
            start_time: link.start_time,
            end_time: link.end_time,
          });
        }

        // Process sequential tasks (no explicit time)
        for (const link of tasksSequential) {
          const task = taskById.get(link.task_id);
          if (!task || task.is_active === false) continue;

          const startAt = new Date(currentTime);
          const duration = Number(task.duration ?? 5);
          const endAt = new Date(startAt.getTime() + duration * 60 * 1000);

          // Update current time for next task
          currentTime = new Date(endAt);

          if (startAt < start || startAt > end) continue;

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
            day_of_week: link.day_of_week,
            start_time: null,
            end_time: null,
          });
        }
      }

      cursor.setUTCDate(cursor.getUTCDate() + 1);
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
  async findByDay(childId: string, date: string): Promise<{ activities: Activity[]; point: number }> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const db = await this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.children_id = :childId', { childId })
      .andWhere('activity.date_start >= :start', { start: startOfDay })
      .andWhere('activity.date_start <= :end', { end: endOfDay })
      .orderBy('activity.date_start', 'ASC')
      .getMany();

    const routine = await this.buildRoutineActivitiesForChildren([childId], startOfDay, endOfDay);
    const activities = [...db, ...routine]
      .sort((a: any, b: any) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()) as Activity[];

    const child = await this.childrenRepository.findOneBy({ id: childId });
    return { activities, point: child?.point ?? 0 };
  }

  // Trova activities per una settimana
  async findByWeek(childId: string, startDate: string): Promise<{ activities: Activity[]; point: number }> {
    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setUTCDate(end.getUTCDate() + 7);

    const db = await this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.children_id = :childId', { childId })
      .andWhere('activity.date_start >= :start', { start })
      .andWhere('activity.date_start < :end', { end })
      .orderBy('activity.date_start', 'ASC')
      .getMany();

    const routine = await this.buildRoutineActivitiesForChildren([childId], start, end);
    const activities = [...db, ...routine]
      .sort((a: any, b: any) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()) as Activity[];

    const child = await this.childrenRepository.findOneBy({ id: childId });
    return { activities, point: child?.point ?? 0 };
  }

  // Trova activities per "now" (ora corrente +/- 2 ore)
  async findByNow(childId: string): Promise<{ activities: Activity[]; point: number }> {
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
    const activities = [...db, ...routine]
      .sort((a: any, b: any) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()) as Activity[];

    const child = await this.childrenRepository.findOneBy({ id: childId });
    return { activities, point: child?.point ?? 0 };
  }

  // Trova activities per un giorno specifico per tutti i children dell'utente
  async findDayForUser(userId: string, date: string): Promise<Activity[]> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

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
    end.setUTCDate(end.getUTCDate() + 7);

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
        errors.push(`Error moving task ${move.taskId}: ${error}`);
      }
    }

    return { updated, errors };
  }

  // Aggiorna l'ordine dei task (sort_order) per il riordino interno
  async updateTaskOrder(
    userId: string,
    orderUpdates: Array<{
      taskId: string;       // instanceId o task_id
      childId: string;
      day: string;          // data in formato YYYY-MM-DD
      newPosition: number;
    }>,
  ): Promise<{ updated: number; errors: string[] }> {
    const errors: string[] = [];
    let updated = 0;

    for (const update of orderUpdates) {
      try {
        // Verifica che il bambino appartenga all'utente
        const child = await this.childrenRepository.findOne({
          where: { id: update.childId, user_id: userId },
        });

        if (!child) {
          errors.push(`Child ${update.childId} not found or not owned by user`);
          continue;
        }

        // Trova la routine del bambino
        const routine = await this.routineRepository.findOne({
          where: { child_id: update.childId },
        });

        if (!routine) {
          errors.push(`Routine not found for child ${update.childId}`);
          continue;
        }

        // Estrai il task_id dall'instanceId se necessario
        // Formato instanceId: routine_{routine_id}_{task_id}_{date}
        let taskId = update.taskId;
        if (taskId.startsWith('routine_')) {
          const parts = taskId.split('_');
          // routine_UUID_UUID_DATE → UUID è in parti [1] e [2..6]
          // Format: routine_{routineId}_{taskId}_{date}
          // Ricostruisci il task_id (UUID)
          taskId = parts.slice(2, 7).join('-').replace(/-\d{4}-\d{2}-\d{2}$/, '');
          // Più semplice: prendi tutto tra il secondo _ e l'ultima data
          const match = update.taskId.match(/routine_[^_]+_([a-f0-9-]+)_\d{4}-\d{2}-\d{2}/);
          if (match) {
            taskId = match[1];
          }
        }

        const dayOfWeek = update.day === 'now' ? null : new Date(update.day).getDay();

        // Trova il link routine_task da aggiornare
        const link = await this.routineTaskRepository.findOne({
          where: {
            routine_id: routine.id,
            task_id: taskId,
            day_of_week: dayOfWeek === null ? IsNull() : dayOfWeek,
          },
        });

        if (!link) {
          // Prova senza il filtro day_of_week
          const linkAnyDay = await this.routineTaskRepository.findOne({
            where: {
              routine_id: routine.id,
              task_id: taskId,
            },
          });

          if (linkAnyDay) {
            linkAnyDay.sort_order = update.newPosition;
            await this.routineTaskRepository.save(linkAnyDay);
            updated++;
          } else {
            errors.push(`Task ${taskId} not found in routine for child ${update.childId}`);
          }
          continue;
        }

        // Aggiorna sort_order
        link.sort_order = update.newPosition;
        await this.routineTaskRepository.save(link);
        updated++;
      } catch (error) {
        errors.push(`Error updating order for task ${update.taskId}: ${error}`);
      }
    }

    return { updated, errors };
  }
}

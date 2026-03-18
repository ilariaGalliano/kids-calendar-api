import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { Children } from '../children/children.entity';
import { Routine } from '../routine/routine.entity';
import { RoutineTask } from '../routine/routine-task.entity';
import { TaskEntity } from '../tasks/task.entity';

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
      where: { child_id: In(childIds), isDone: false },
      order: { created_at: 'ASC' },
    });
    if (!routines.length) return [];

    const routineIds = routines.map((r) => r.id);
    const links = await this.routineTaskRepository.find({
      where: { routine_id: In(routineIds) },
      order: { sort_order: 'ASC', id: 'ASC' },
    });
    if (!links.length) return [];

    const taskIds = Array.from(new Set(links.map((l) => l.task_id)));
    const tasks = await this.taskRepository.findBy({ id: In(taskIds) });
    const taskById = new Map(tasks.map((t) => [t.id, t]));

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
      const dayDow = cursor.getDay();
      const dayKey = this.formatDate(cursor);

      for (const routine of routines) {
        if ((routine.day_of_week ?? -1) !== dayDow) continue;

        const routineLinks = linksByRoutine.get(routine.id) ?? [];
        const child = childById.get(routine.child_id);

        for (const link of routineLinks) {
          const task = taskById.get(link.task_id);
          if (!task || task.is_active === false) continue;

          const startAt = this.combineDateAndTime(cursor, routine.start_time);
          const duration = Number(task.duration ?? 5);
          const endAt = routine.end_time
            ? this.combineDateAndTime(cursor, routine.end_time)
            : new Date(startAt.getTime() + duration * 60 * 1000);

          if (startAt < start || startAt > end) continue;

          out.push({
            id: `routine_${routine.id}_${task.id}_${dayKey}`,
            name_activity: task.title,
            value: task.reward ?? null,
            date_start: startAt,
            date_end: endAt,
            done: false,
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
    const activity = await this.activityRepository.findOneBy({ id } as any);
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    const updated = Object.assign(activity, data);
    return this.activityRepository.save(updated);
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
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { Routine } from '../routine/routine.entity';
import { TaskEntity } from '../tasks/task.entity';
import { RoutineTask } from '../routine/routine-task.entity';

@Injectable()
export class RoutineService {
  constructor(
    @InjectRepository(Routine)
    private readonly routineRepository: Repository<Routine>,
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(RoutineTask)
    private readonly routineTasksRepository: Repository<RoutineTask>,
  ) {}

  private dayCodeToNumber(day?: string): number {
    const map: Record<string, number> = {
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
    };
    return map[(day ?? 'mon').toLowerCase()] ?? 1;
  }

  private extractTaskIds(input: any): string[] {
    if (!Array.isArray(input)) return [];

    const normalized = input
      .map((item: any) => {
        const raw = typeof item === 'object' && item !== null ? item.id : item;
        if (raw === null || raw === undefined) return null;
        const value = String(raw).trim();
        return value.length > 0 ? value : null;
      })
      .filter((id: string | null): id is string => id !== null);

    return Array.from(new Set(normalized));
  }

  private async attachTasks(routines: Routine[]): Promise<any[]> {
    if (!routines.length) return [];

    const routineIds = routines.map((r) => r.id);
    const links = await this.routineTasksRepository.find({
      where: { routine_id: In(routineIds) },
      order: { sort_order: 'ASC', id: 'ASC' },
    });

    const taskIds = Array.from(new Set(links.map((l) => l.task_id)));
    const tasks = taskIds.length
      ? await this.taskRepository.findBy({ id: In(taskIds) as any })
      : [];

    const taskById = new Map<string, TaskEntity>(tasks.map((task) => [String(task.id), task]));
    const linksByRoutine = new Map<string, RoutineTask[]>();

    for (const link of links) {
      const arr = linksByRoutine.get(link.routine_id) ?? [];
      arr.push(link);
      linksByRoutine.set(link.routine_id, arr);
    }

    return routines.map((routine) => ({
      ...routine,
      tasks: (linksByRoutine.get(routine.id) ?? [])
        .map((link) => taskById.get(String(link.task_id)))
        .filter(Boolean)
        .map((task) => ({
          id: task!.id,
          title: task!.title,
          description: task!.description ?? '',
          color: task!.color ?? '#4ECDC4',
          emoji: task!.icon ?? '🎯',
          duration: task!.duration ?? 5,
          reward: task!.reward ?? 0,
          isActive: task!.is_active ?? true,
        })),
    }));
  }

  async getRoutines(childId?: string, childIds?: string[]) {
    const where: any = {};

    if (Array.isArray(childIds) && childIds.length > 0) {
      where.child_id = In(childIds);
    } else if (childId) {
      where.child_id = childId;
    }

    const routines = await this.routineRepository.find({
      where,
      order: { created_at: 'DESC' },
    });

    return this.attachTasks(routines);
  }

  async createRoutine(dto: CreateRoutineDto & any) {
    const normalizedDay = typeof dto.day_of_week === 'number'
      ? dto.day_of_week
      : this.dayCodeToNumber(Array.isArray(dto.days) ? dto.days[0] : undefined);

    const routine = this.routineRepository.create({
      child_id: dto.childId ?? dto.child_id,
      nametask: dto.nametask ?? dto.name ?? 'Nuova routine',
      description: dto.description ?? '',
      day_of_week: normalizedDay,
    } as Partial<Routine>);

    const savedRoutine = await this.routineRepository.save(routine);

    const taskIds = this.extractTaskIds(dto.taskIds ?? dto.tasks);

    if (taskIds.length > 0) {
      await this.routineTasksRepository.save(
        taskIds.map((taskId, index) =>
          this.routineTasksRepository.create({
            routine_id: savedRoutine.id,
            task_id: taskId,
            sort_order: index,
          }),
        ),
      );
    }

    const enriched = await this.attachTasks([savedRoutine]);
    return enriched[0] ?? savedRoutine;
  }

  async updateRoutine(id: string, dto: UpdateRoutineDto & any) {
    const routine = await this.routineRepository.findOneBy({ id });
    if (!routine) return null;

    if (dto.nametask !== undefined || dto.name !== undefined) {
      routine.nametask = dto.nametask ?? dto.name;
    }
    if (dto.description !== undefined) {
      routine.description = dto.description;
    }
    if (dto.day_of_week !== undefined) {
      routine.day_of_week = dto.day_of_week;
    } else if (Array.isArray(dto.days) && dto.days.length > 0) {
      routine.day_of_week = this.dayCodeToNumber(dto.days[0]);
    }

    const savedRoutine = await this.routineRepository.save(routine);

    const hasTaskPatch = dto.taskIds !== undefined || dto.tasks !== undefined;

    if (hasTaskPatch) {
      const taskIds = this.extractTaskIds(dto.taskIds ?? dto.tasks);

      await this.routineTasksRepository.delete({ routine_id: id });

      if (taskIds.length > 0) {
        await this.routineTasksRepository.save(
          taskIds.map((taskId, index) =>
            this.routineTasksRepository.create({
              routine_id: savedRoutine.id,
              task_id: taskId,
              sort_order: index,
            }),
          ),
        );
      }
    }

    const enriched = await this.attachTasks([savedRoutine]);
    return enriched[0] ?? savedRoutine;
  }

  async deleteRoutine(id: string) {
    await this.routineTasksRepository.delete({ routine_id: id });
    const result = await this.routineRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { Routine } from 'src/routine/routine.entity';
import { Activity } from 'src/activities/activity.entity';
import { RoutineActivity } from 'src/routine/routine-activity.entity';

@Injectable()
export class RoutineService {
  constructor(
    @InjectRepository(Routine)
    private readonly routineRepository: Repository<Routine>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(RoutineActivity)
    private readonly routineActivitiesRepository: Repository<RoutineActivity>,
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

  private extractActivityIds(input: any): string[] {
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

  private async attachActivities(routines: Routine[]): Promise<any[]> {
    if (!routines.length) return [];

    const routineIds = routines.map((r) => r.id);
    const links = await this.routineActivitiesRepository.find({
      where: { routine_id: In(routineIds) },
      order: { sort_order: 'ASC', id: 'ASC' },
    });

    const activityIds = Array.from(new Set(links.map((l) => l.activity_id)));
    const activities = activityIds.length
      ? await this.activityRepository.findBy({ id: In(activityIds) as any })
      : [];

    const activityById = new Map<string, Activity>(activities.map((a) => [String(a.id), a]));
    const linksByRoutine = new Map<string, RoutineActivity[]>();

    for (const link of links) {
      const arr = linksByRoutine.get(link.routine_id) ?? [];
      arr.push(link);
      linksByRoutine.set(link.routine_id, arr);
    }

    return routines.map((routine) => ({
      ...routine,
      tasks: (linksByRoutine.get(routine.id) ?? [])
        .map((link) => activityById.get(String(link.activity_id)))
        .filter(Boolean),
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

    return this.attachActivities(routines);
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
      start_time: dto.start_time ?? dto.startTime ?? '08:00',
      end_time: dto.end_time ?? dto.endTime ?? null,
      isDone: dto.isDone ?? false,
    } as Partial<Routine>);

    const savedRoutine = await this.routineRepository.save(routine);

    const activityIds = this.extractActivityIds(
      dto.activityIds ?? dto.activities ?? dto.tasks,
    );

    if (activityIds.length > 0) {
      await this.routineActivitiesRepository.save(
        activityIds.map((activityId, index) =>
          this.routineActivitiesRepository.create({
            routine_id: savedRoutine.id,
            activity_id: activityId,
            sort_order: index,
          }),
        ),
      );
    }

    const enriched = await this.attachActivities([savedRoutine]);
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
    if (dto.start_time !== undefined || dto.startTime !== undefined) {
      routine.start_time = dto.start_time ?? dto.startTime;
    }
    if (dto.end_time !== undefined || dto.endTime !== undefined) {
      routine.end_time = dto.end_time ?? dto.endTime;
    }
    if (dto.isDone !== undefined) {
      routine.isDone = dto.isDone;
    } else if (dto.isActive !== undefined) {
      routine.isDone = !dto.isActive;
    }

    const savedRoutine = await this.routineRepository.save(routine);

    const hasActivityPatch =
      dto.activityIds !== undefined || dto.activities !== undefined || dto.tasks !== undefined;

    if (hasActivityPatch) {
      const activityIds = this.extractActivityIds(
        dto.activityIds ?? dto.activities ?? dto.tasks,
      );

      await this.routineActivitiesRepository.delete({ routine_id: id });

      if (activityIds.length > 0) {
        await this.routineActivitiesRepository.save(
          activityIds.map((activityId, index) =>
            this.routineActivitiesRepository.create({
              routine_id: savedRoutine.id,
              activity_id: activityId,
              sort_order: index,
            }),
          ),
        );
      }
    }

    const enriched = await this.attachActivities([savedRoutine]);
    return enriched[0] ?? savedRoutine;
  }

  async deleteRoutine(id: string) {
    await this.routineActivitiesRepository.delete({ routine_id: id });
    const result = await this.routineRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

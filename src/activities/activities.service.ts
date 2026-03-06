import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async create(data: Partial<Activity>): Promise<Activity> {
    const activity = this.activityRepository.create(data);
    return this.activityRepository.save(activity);
  }

  async findAll(): Promise<Activity[]> {
    return this.activityRepository.find();
  }

  async findOne(id: number): Promise<Activity> {
    const activity = await this.activityRepository.findOneBy({ id } as any);
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }

  async update(id: number, data: Partial<Activity>): Promise<Activity> {
    const activity = await this.activityRepository.findOneBy({ id } as any);
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    const updated = Object.assign(activity, data);
    return this.activityRepository.save(updated);
  }

  async delete(id: number): Promise<{ message: string }> {
    const result = await this.activityRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return { message: `Activity with ID ${id} has been deleted successfully!` };
  }

  // Trova activities per child ID
  async findByChildId(childId: string): Promise<Activity[]> {
    return this.activityRepository.find({ 
      where: { children_id: childId },
      order: { date_start: 'ASC' }
    });
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

    return this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.children_id = :childId', { childId })
      .andWhere('activity.date_start >= :start', { start: startOfDay })
      .andWhere('activity.date_start <= :end', { end: endOfDay })
      .orderBy('activity.date_start', 'ASC')
      .getMany();
  }

  // Trova activities per una settimana
  async findByWeek(childId: string, startDate: string): Promise<Activity[]> {
    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setDate(end.getDate() + 7);

    return this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.children_id = :childId', { childId })
      .andWhere('activity.date_start >= :start', { start })
      .andWhere('activity.date_start < :end', { end })
      .orderBy('activity.date_start', 'ASC')
      .getMany();
  }

  // Trova activities per "now" (ora corrente +/- 2 ore)
  async findByNow(childId: string): Promise<Activity[]> {
    const now = new Date();
    const twoHoursBefore = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const twoHoursAfter = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    return this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.children_id = :childId', { childId })
      .andWhere('activity.date_start >= :before', { before: twoHoursBefore })
      .andWhere('activity.date_start <= :after', { after: twoHoursAfter })
      .orderBy('activity.date_start', 'ASC')
      .getMany();
  }

  // Trova tutte le activities per tutti i children di un utente in una settimana
  async findWeekForUser(userId: number, startDate: string): Promise<Activity[]> {
    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setDate(end.getDate() + 7);

    return this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.user_id = :userId', { userId })
      .andWhere('activity.date_start >= :start', { start })
      .andWhere('activity.date_start < :end', { end })
      .orderBy('activity.date_start', 'ASC')
      .getMany();
  }
}

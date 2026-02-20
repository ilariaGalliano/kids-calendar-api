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

//   async findOne(id: string): Promise<Activity> {
//     const activity = await this.activityRepository.findOneBy({ id });
//     if (!activity) {
//       throw new NotFoundException(`Activity with ID ${id} not found`);
//     }
//     return activity;
//   }

//   async update(id: string, data: Partial<Activity>): Promise<Activity> {
//     const activity = await this.activityRepository.findOneBy({ id });
//     if (!activity) {
//       throw new NotFoundException(`Activity with ID ${id} not found`);
//     }
//     const updated = Object.assign(activity, data);
//     return this.activityRepository.save(updated);
//   }

  async delete(id: string): Promise<{ message: string }> {
    const result = await this.activityRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return { message: `Activity with ID ${id} has been deleted successfully!` };
  }
}

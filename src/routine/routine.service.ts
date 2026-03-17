import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Routine } from './routine.entity';

@Injectable()
export class RoutineService {
  constructor(
    @InjectRepository(Routine)
    private routineRepository: Repository<Routine>,
  ) {}

  async create(data: Partial<Routine>): Promise<Routine> {
    const routine = this.routineRepository.create(data);
    return this.routineRepository.save(routine);
  }

  async findAll(): Promise<Routine[]> {
    return this.routineRepository.find();
  }

  async findOne(id: number): Promise<Routine> {
    const routine = await this.routineRepository.findOneBy({ id: id.toString() });
    if (!routine) {
      throw new NotFoundException(`Routine with ID ${id} not found`);
    }
    return routine;
  }

  async findByChildId(childId: number): Promise<Routine[]> {
    return this.routineRepository.findBy({ child_id: childId.toString() });
  }

  async findByDayOfWeek(dayOfWeek: number): Promise<Routine[]> {
    return this.routineRepository.findBy({ day_of_week: dayOfWeek });
  }

  async update(id: number, data: Partial<Routine>): Promise<Routine> {
    const routine = await this.routineRepository.findOneBy({ id: id.toString() });
    if (!routine) {
      throw new NotFoundException(`Routine with ID ${id} not found`);
    }
    const updated = Object.assign(routine, data);
    return this.routineRepository.save(updated);
  }

  async delete(id: number): Promise<{ message: string }> {
    const result = await this.routineRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Routine with ID ${id} not found`);
    }
    return { message: `Routine with ID ${id} has been deleted successfully!` };
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from 'src/tasks/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
  ) {}

  async getTasks(userId?: string, _timeOfDay?: string) {
    const tasks = await this.taskRepository.find({
      where: userId ? { created_by_id: userId } : {},
      order: { created_at: 'DESC' },
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      emoji: task.icon ?? '🎯',
      color: task.color ?? '#4ECDC4',
      duration: task.duration ?? 5,
      isActive: task.is_active ?? true,
      description: task.description ?? '',
      reward: task.reward ?? 0,
    }));
  }

  async createTask(userId: string, dto: CreateTaskDto) {
    const task = this.taskRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      color: dto.color ?? '#4ECDC4',
      icon: dto.emoji ?? '🎯',
      duration: dto.duration ?? 5,
      reward: dto.reward ?? 0,
      is_active: dto.isActive ?? true,
      created_by_id: userId ?? null,
    });

    const saved = await this.taskRepository.save(task);
    return {
      id: saved.id,
      title: saved.title,
      emoji: saved.icon ?? '🎯',
      color: saved.color ?? '#4ECDC4',
      duration: saved.duration ?? 5,
      isActive: saved.is_active ?? true,
      description: saved.description ?? '',
      reward: saved.reward ?? 0,
    };
  }

  async updateTask(id: string, dto: UpdateTaskDto) {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) return null;

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.color !== undefined) task.color = dto.color;
    if (dto.emoji !== undefined) task.icon = dto.emoji;
    if (dto.duration !== undefined) task.duration = dto.duration;
    if (dto.isActive !== undefined) task.is_active = dto.isActive;
    if (dto.reward !== undefined) task.reward = dto.reward;

    const saved = await this.taskRepository.save(task);
    return {
      id: saved.id,
      title: saved.title,
      emoji: saved.icon ?? '🎯',
      color: saved.color ?? '#4ECDC4',
      duration: saved.duration ?? 5,
      isActive: saved.is_active ?? true,
      description: saved.description ?? '',
      reward: saved.reward ?? 0,
    };
  }

  async deleteTask(id: string) {
    const result = await this.taskRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

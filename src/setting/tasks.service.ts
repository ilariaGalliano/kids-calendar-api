import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  private tasks: any[] = [
    { id: 't1', title: 'Lavare i denti', emoji: '🦷', color: '#4ECDC4', duration: 5, isActive: true, description: 'Lava bene i denti!', reward: 1 },
    { id: 't2', title: 'Vestirsi', emoji: '👕', color: '#45B7D1', duration: 10, isActive: true, description: 'Scegli i vestiti!', reward: 2 },
    { id: 't3', title: 'Riordinare stanza', emoji: '�️', color: '#FFEAA7', duration: 7, isActive: true, description: 'Sistema i giochi e il letto.', reward: 3 }
  ];

  getTasks(timeOfDay?: string) {
    if (timeOfDay) {
      // Filtra per categoria se richiesto
      return this.tasks.filter(t => t.category === timeOfDay);
    }
    return this.tasks;
  }

  createTask(dto: CreateTaskDto) {
    const task = { ...dto, id: Date.now().toString(), reward: dto.reward ?? 0 };
    this.tasks.push(task);
    return task;
  }

  updateTask(id: string, dto: UpdateTaskDto) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.tasks[idx] = { ...this.tasks[idx], ...dto, reward: dto.reward ?? this.tasks[idx].reward };
    return this.tasks[idx];
  }

  deleteTask(id: string) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.tasks.splice(idx, 1);
    return true;
  }
}

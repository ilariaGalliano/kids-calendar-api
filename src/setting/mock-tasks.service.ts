import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class MockTasksService {
  private tasks: any[] = [
    {
      id: 't1',
      title: 'Lavare i denti',
      emoji: '🦷',
      color: '#4ECDC4',
      duration: 5,
      category: 'morning',
      isActive: true,
      description: 'Lava bene i denti!',
      householdId: 'h1',
      icon: null,
      schedule: null
    },
    {
      id: 't2',
      title: 'Vestirsi',
      emoji: '👕',
      color: '#45B7D1',
      duration: 10,
      category: 'morning',
      isActive: true,
      description: 'Scegli i vestiti!',
      householdId: 'h1',
      icon: null,
      schedule: null
    },
    {
      id: 't3',
      title: 'Riordinare stanza',
      emoji: '🛏️',
      color: '#FFEAA7',
      duration: 7,
      category: 'afternoon',
      isActive: true,
      description: 'Sistema i giochi e il letto.',
      householdId: 'h1',
      icon: null,
      schedule: null
    }
  ];

  getTasks(timeOfDay?: string) {
    if (timeOfDay) {
      return this.tasks.filter(t => t.timeOfDay === timeOfDay);
    }
    return this.tasks;
  }

  createTask(dto: CreateTaskDto) {
    const task = { id: Date.now().toString(), ...dto };
    this.tasks.push(task);
    return task;
  }

  updateTask(id: string, dto: UpdateTaskDto) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return null;
    Object.assign(task, dto);
    return task;
  }

  deleteTask(id: string) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.tasks.splice(idx, 1);
    return true;
  }
}

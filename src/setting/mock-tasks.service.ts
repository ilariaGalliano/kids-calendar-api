import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class MockTasksService {
  private tasks: any[] = [
    { id: '1', name: 'Colazione', timeOfDay: 'morning', timer: 15 },
    { id: '2', name: 'Compiti', timeOfDay: 'afternoon', timer: 60 }
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

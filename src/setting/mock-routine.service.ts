import { Injectable } from '@nestjs/common';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { MockTasksService } from './mock-tasks.service';

@Injectable()
export class MockRoutineService {
  private tasksService = new MockTasksService();
  private routines: any[] = [
    {
      id: 'r1',
      childId: '1',
      name: 'Routine Mattina',
      description: 'Routine mattutina',
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      startTime: '07:00',
      isActive: true,
      tasks: ['t1', 't2']
    },
    {
      id: 'r2',
      childId: '2',
      name: 'Routine Pomeriggio',
      description: 'Routine pomeridiana',
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      startTime: '16:00',
      isActive: true,
      tasks: ['t3']
    }
  ];

  getRoutines(childId: string) {
    const allTasks = this.tasksService.getTasks();
    return this.routines
      .filter(r => r.childId === childId)
      .map(routine => ({
        ...routine,
        tasks: routine.tasks.map((tid: string) => allTasks.find((t: any) => t.id === tid)).filter(Boolean)
      }));
  }

  createRoutine(dto: CreateRoutineDto) {
    const routine = { id: Date.now().toString(), ...dto };
    this.routines.push(routine);
    return routine;
  }

  updateRoutine(id: string, dto: UpdateRoutineDto) {
    const routine = this.routines.find(r => r.id === id);
    if (!routine) return null;
    Object.assign(routine, dto);
    return routine;
  }

  deleteRoutine(id: string) {
    const idx = this.routines.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.routines.splice(idx, 1);
    return true;
  }
}

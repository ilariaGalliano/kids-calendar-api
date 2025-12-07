import { Injectable } from '@nestjs/common';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';

@Injectable()
export class RoutineService {
  private routines: any[] = [
    {
      id: 'r1',
      childId: '1',
      name: 'Routine Mattina Alice',
      tasks: ['t1', 't2'],
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      startTime: '07:00',
      isActive: true
    },
    {
      id: 'r2',
      childId: '2',
      name: 'Routine Mattina Luca',
      tasks: ['t1'],
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      startTime: '07:30',
      isActive: true
    }
  ];

  getRoutines(childId: string) {
    return this.routines.filter(r => r.childId === childId);
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

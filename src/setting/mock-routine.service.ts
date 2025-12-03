import { Injectable } from '@nestjs/common';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';

@Injectable()
export class MockRoutineService {
  private routines: any[] = [
    { id: '1', childId: '1', name: 'Mattina', tasks: ['1'], description: 'Routine mattutina' },
    { id: '2', childId: '2', name: 'Pomeriggio', tasks: ['2'], description: 'Routine pomeridiana' }
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

import { Injectable } from '@nestjs/common';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { TasksService } from './tasks.service';

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
    // Ottieni i dettagli dei task
    const tasksService = new TasksService();
    const allTasks = tasksService.getTasks();
    return this.routines
      .filter(r => r.childId === childId)
      .map(routine => {
        // Support both legacy and new format
        if (routine.tasksByDay) {
          // Expand each day's tasks to full objects
          const expandedTasksByDay: Record<string, any[]> = {};
          Object.keys(routine.tasksByDay).forEach(day => {
            expandedTasksByDay[day] = routine.tasksByDay[day].map((task: any) => {
              if (typeof task === 'string') {
                return allTasks.find((t: any) => t.id === task) || task;
              }
              if (task && task.id) {
                // If already a full object, return as is
                return task;
              }
              return task;
            });
          });
          return {
            ...routine,
            tasksByDay: expandedTasksByDay
          };
        } else if (routine.tasks) {
          // Legacy format
          return {
            ...routine,
            tasks: routine.tasks.map((tid: string) => allTasks.find((t: any) => t.id === tid)).filter(Boolean)
          };
        } else {
          return routine;
        }
      });
  }

  createRoutine(dto: CreateRoutineDto) {
  const routine = { id: Date.now().toString(), ...dto };
  // Ensure days is present
  if (!routine.days) routine.days = [];
  this.routines.push(routine);
  return routine;
  }

  updateRoutine(id: string, dto: UpdateRoutineDto) {
  const routine = this.routines.find(r => r.id === id);
  if (!routine) return null;
  Object.assign(routine, dto);
  // Ensure days is present after update
  if (!routine.days) routine.days = [];
  return routine;
  }

  deleteRoutine(id: string) {
    const idx = this.routines.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.routines.splice(idx, 1);
    return true;
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutineService = void 0;
const common_1 = require("@nestjs/common");
const tasks_service_1 = require("./tasks.service");
let RoutineService = class RoutineService {
    routines = [
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
    getRoutines(childId) {
        const tasksService = new tasks_service_1.TasksService();
        const allTasks = tasksService.getTasks();
        return this.routines
            .filter(r => r.childId === childId)
            .map(routine => {
            if (routine.tasksByDay) {
                const expandedTasksByDay = {};
                Object.keys(routine.tasksByDay).forEach(day => {
                    expandedTasksByDay[day] = routine.tasksByDay[day].map((task) => {
                        if (typeof task === 'string') {
                            return allTasks.find((t) => t.id === task) || task;
                        }
                        if (task && task.id) {
                            return task;
                        }
                        return task;
                    });
                });
                return {
                    ...routine,
                    tasksByDay: expandedTasksByDay
                };
            }
            else if (routine.tasks) {
                return {
                    ...routine,
                    tasks: routine.tasks.map((tid) => allTasks.find((t) => t.id === tid)).filter(Boolean)
                };
            }
            else {
                return routine;
            }
        });
    }
    createRoutine(dto) {
        const routine = { id: Date.now().toString(), ...dto };
        if (!routine.days)
            routine.days = [];
        this.routines.push(routine);
        return routine;
    }
    updateRoutine(id, dto) {
        const routine = this.routines.find(r => r.id === id);
        if (!routine)
            return null;
        Object.assign(routine, dto);
        if (!routine.days)
            routine.days = [];
        return routine;
    }
    deleteRoutine(id) {
        const idx = this.routines.findIndex(r => r.id === id);
        if (idx === -1)
            return false;
        this.routines.splice(idx, 1);
        return true;
    }
};
exports.RoutineService = RoutineService;
exports.RoutineService = RoutineService = __decorate([
    (0, common_1.Injectable)()
], RoutineService);
//# sourceMappingURL=routine.service.js.map
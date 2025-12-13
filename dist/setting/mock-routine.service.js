"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockRoutineService = void 0;
const common_1 = require("@nestjs/common");
const mock_tasks_service_1 = require("./mock-tasks.service");
let MockRoutineService = class MockRoutineService {
    tasksService = new mock_tasks_service_1.MockTasksService();
    routines = [
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
    getRoutines(childId) {
        const allTasks = this.tasksService.getTasks();
        return this.routines
            .filter(r => r.childId === childId)
            .map(routine => ({
            ...routine,
            tasks: routine.tasks.map((tid) => allTasks.find((t) => t.id === tid)).filter(Boolean)
        }));
    }
    createRoutine(dto) {
        const routine = { id: Date.now().toString(), ...dto };
        this.routines.push(routine);
        return routine;
    }
    updateRoutine(id, dto) {
        const routine = this.routines.find(r => r.id === id);
        if (!routine)
            return null;
        Object.assign(routine, dto);
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
exports.MockRoutineService = MockRoutineService;
exports.MockRoutineService = MockRoutineService = __decorate([
    (0, common_1.Injectable)()
], MockRoutineService);
//# sourceMappingURL=mock-routine.service.js.map
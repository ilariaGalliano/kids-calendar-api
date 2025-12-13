"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockTasksService = void 0;
const common_1 = require("@nestjs/common");
let MockTasksService = class MockTasksService {
    tasks = [
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
    getTasks(timeOfDay) {
        if (timeOfDay) {
            return this.tasks.filter(t => t.timeOfDay === timeOfDay);
        }
        return this.tasks;
    }
    createTask(dto) {
        const task = { id: Date.now().toString(), ...dto };
        this.tasks.push(task);
        return task;
    }
    updateTask(id, dto) {
        const task = this.tasks.find(t => t.id === id);
        if (!task)
            return null;
        Object.assign(task, dto);
        return task;
    }
    deleteTask(id) {
        const idx = this.tasks.findIndex(t => t.id === id);
        if (idx === -1)
            return false;
        this.tasks.splice(idx, 1);
        return true;
    }
};
exports.MockTasksService = MockTasksService;
exports.MockTasksService = MockTasksService = __decorate([
    (0, common_1.Injectable)()
], MockTasksService);
//# sourceMappingURL=mock-tasks.service.js.map
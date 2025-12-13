"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
let TasksService = class TasksService {
    tasks = [
        { id: 't1', title: 'Lavare i denti', emoji: '🦷', color: '#4ECDC4', duration: 5, isActive: true, description: 'Lava bene i denti!', reward: 1 },
        { id: 't2', title: 'Vestirsi', emoji: '👕', color: '#45B7D1', duration: 10, isActive: true, description: 'Scegli i vestiti!', reward: 2 },
        { id: 't3', title: 'Riordinare stanza', emoji: '�️', color: '#FFEAA7', duration: 7, isActive: true, description: 'Sistema i giochi e il letto.', reward: 3 }
    ];
    getTasks(timeOfDay) {
        if (timeOfDay) {
            return this.tasks.filter(t => t.category === timeOfDay);
        }
        return this.tasks;
    }
    createTask(dto) {
        const task = { ...dto, id: Date.now().toString(), reward: dto.reward ?? 0 };
        this.tasks.push(task);
        return task;
    }
    updateTask(id, dto) {
        const idx = this.tasks.findIndex(t => t.id === id);
        if (idx === -1)
            return null;
        this.tasks[idx] = { ...this.tasks[idx], ...dto, reward: dto.reward ?? this.tasks[idx].reward };
        return this.tasks[idx];
    }
    deleteTask(id) {
        const idx = this.tasks.findIndex(t => t.id === id);
        if (idx === -1)
            return false;
        this.tasks.splice(idx, 1);
        return true;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)()
], TasksService);
//# sourceMappingURL=tasks.service.js.map
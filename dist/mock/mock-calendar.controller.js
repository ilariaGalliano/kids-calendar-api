"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockCalendarController = void 0;
const common_1 = require("@nestjs/common");
const mock_db_service_1 = require("./mock-db.service");
let MockCalendarController = class MockCalendarController {
    mockDb;
    constructor(mockDb) {
        this.mockDb = mockDb;
    }
    getCurrentTimeWindow(householdId, datetime) {
        const now = datetime ? new Date(datetime) : new Date();
        this.mockDb.ensureDemoDataForHousehold(householdId, now.toISOString().slice(0, 10));
        const start = new Date(now);
        start.setHours(now.getHours() - 2);
        const end = new Date(now);
        end.setHours(now.getHours() + 2);
        const tasks = this.mockDb.instances
            .filter(inst => {
            const task = this.mockDb.tasks.find(t => t.id === inst.taskId);
            return task && task.householdId === householdId && inst.date >= start && inst.date <= end;
        })
            .map(inst => ({
            ...inst,
            ...this.mockDb.tasks.find(t => t.id === inst.taskId)
        }));
        return {
            currentTime: now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
            currentDate: now.toISOString().slice(0, 10),
            timeWindow: {
                start: start.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                end: end.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
            },
            tasks,
            summary: {
                total: tasks.length,
                completed: tasks.filter(t => t.done).length,
                pending: tasks.filter(t => !t.done).length,
                current: tasks.filter(t => t.date.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)).length,
                upcoming: tasks.filter(t => t.date > now).length
            }
        };
    }
    getDayCalendar(householdId, date) {
        this.mockDb.ensureDemoDataForHousehold(householdId, date);
        const dayTasks = this.mockDb.instances
            .filter(inst => {
            const task = this.mockDb.tasks.find(t => t.id === inst.taskId);
            return task && task.householdId === householdId && inst.date.toISOString().slice(0, 10) === date;
        })
            .map(inst => ({
            ...inst,
            ...this.mockDb.tasks.find(t => t.id === inst.taskId)
        }));
        return {
            date,
            tasks: dayTasks,
            summary: {
                total: dayTasks.length,
                completed: dayTasks.filter(t => t.done).length,
                pending: dayTasks.filter(t => !t.done).length
            }
        };
    }
    getWeekCalendar(householdId, date) {
        this.mockDb.ensureDemoDataForHousehold(householdId, date);
        const inputDate = new Date(date);
        const dayOfWeek = inputDate.getDay();
        const monday = new Date(inputDate);
        monday.setDate(inputDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const days = [];
        for (let d = new Date(monday); d <= sunday; d.setDate(d.getDate() + 1)) {
            const dayStr = d.toISOString().slice(0, 10);
            const dayTasks = this.mockDb.instances
                .filter(inst => {
                const task = this.mockDb.tasks.find(t => t.id === inst.taskId);
                return task && task.householdId === householdId && inst.date.toISOString().slice(0, 10) === dayStr;
            })
                .map(inst => ({
                ...inst,
                ...this.mockDb.tasks.find(t => t.id === inst.taskId)
            }));
            days.push({ date: dayStr, tasks: dayTasks });
        }
        const allTasks = days.flatMap(day => day.tasks);
        return {
            weekStart: monday.toISOString().slice(0, 10),
            weekEnd: sunday.toISOString().slice(0, 10),
            days,
            summary: {
                total: allTasks.length,
                completed: allTasks.filter(t => t.done).length,
                pending: allTasks.filter(t => !t.done).length
            }
        };
    }
};
exports.MockCalendarController = MockCalendarController;
__decorate([
    (0, common_1.Get)('now'),
    __param(0, (0, common_1.Query)('householdId')),
    __param(1, (0, common_1.Query)('datetime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MockCalendarController.prototype, "getCurrentTimeWindow", null);
__decorate([
    (0, common_1.Get)('day'),
    __param(0, (0, common_1.Query)('householdId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MockCalendarController.prototype, "getDayCalendar", null);
__decorate([
    (0, common_1.Get)('week'),
    __param(0, (0, common_1.Query)('householdId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MockCalendarController.prototype, "getWeekCalendar", null);
exports.MockCalendarController = MockCalendarController = __decorate([
    (0, common_1.Controller)('mock/calendar'),
    __metadata("design:paramtypes", [mock_db_service_1.MockDbService])
], MockCalendarController);
//# sourceMappingURL=mock-calendar.controller.js.map
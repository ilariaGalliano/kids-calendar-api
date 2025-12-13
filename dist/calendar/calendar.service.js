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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CalendarService = class CalendarService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
        console.log('Prisma in CalendarService:', prisma.constructor.name);
    }
    list(householdId, from, to) {
        return this.prisma.taskInstance.findMany({
            where: {
                task: { householdId },
                date: { gte: new Date(from), lte: new Date(to) }
            },
            include: { task: true },
            orderBy: [{ date: 'asc' }]
        });
    }
    async getCalendar(householdId, year, month) {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);
        const startOfCalendar = this.getMonday(new Date(startOfMonth));
        const endOfCalendar = this.getSunday(new Date(endOfMonth));
        const taskInstances = await this.prisma.taskInstance.findMany({
            where: {
                task: { householdId },
                date: {
                    gte: startOfCalendar,
                    lte: endOfCalendar
                }
            },
            include: {
                task: true
            },
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
        });
        const profiles = await this.prisma.profile.findMany({
            where: { householdId },
            select: {
                id: true,
                displayName: true,
                color: true,
                avatarUrl: true
            }
        });
        const days = [];
        const currentDate = new Date(startOfCalendar);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        while (currentDate <= endOfCalendar) {
            const dateStr = this.formatDate(currentDate);
            const dayTasks = taskInstances
                .filter(instance => this.formatDate(instance.date) === dateStr)
                .map(instance => {
                const assigneeProfile = profiles.find(p => p.id === instance.assigneeProfileId) || null;
                return {
                    id: instance.id,
                    taskId: instance.taskId,
                    title: instance.task.title,
                    description: instance.task.description,
                    color: instance.task.color,
                    icon: instance.task.icon,
                    startTime: instance.startTime,
                    endTime: instance.endTime,
                    done: instance.done,
                    doneAt: instance.doneAt,
                    assigneeProfileId: instance.assigneeProfileId,
                    assigneeProfile
                };
            });
            days.push({
                date: dateStr,
                dayOfWeek: currentDate.getDay(),
                isToday: this.formatDate(currentDate) === this.formatDate(today),
                tasks: dayTasks
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        const weeks = [];
        for (let i = 0; i < days.length; i += 7) {
            const weekDays = days.slice(i, i + 7);
            weeks.push({
                weekStart: weekDays[0].date,
                weekEnd: weekDays[6].date,
                weekNumber: this.getWeekNumber(new Date(weekDays[0].date)),
                days: weekDays
            });
        }
        return {
            month,
            year,
            totalDays: endOfMonth.getDate(),
            weeks,
            dailyView: days.filter(day => {
                const dayDate = new Date(day.date);
                return dayDate.getMonth() === month - 1;
            })
        };
    }
    async getWeekCalendar(householdId, date) {
        const targetDate = new Date(date);
        const weekStart = this.getMonday(new Date(targetDate));
        const weekEnd = this.getSunday(new Date(targetDate));
        const taskInstances = await this.prisma.taskInstance.findMany({
            where: {
                task: { householdId },
                date: {
                    gte: weekStart,
                    lte: weekEnd
                }
            },
            include: {
                task: true
            },
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
        });
        const profiles = await this.prisma.profile.findMany({
            where: { householdId },
            select: {
                id: true,
                displayName: true,
                color: true,
                avatarUrl: true
            }
        });
        const days = [];
        const currentDate = new Date(weekStart);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < 7; i++) {
            const dateStr = this.formatDate(currentDate);
            const dayTasks = taskInstances
                .filter(instance => this.formatDate(instance.date) === dateStr)
                .map(instance => {
                const assigneeProfile = profiles.find(p => p.id === instance.assigneeProfileId) || null;
                return {
                    id: instance.id,
                    taskId: instance.taskId,
                    title: instance.task.title,
                    description: instance.task.description,
                    color: instance.task.color,
                    icon: instance.task.icon,
                    startTime: instance.startTime,
                    endTime: instance.endTime,
                    done: instance.done,
                    doneAt: instance.doneAt,
                    assigneeProfileId: instance.assigneeProfileId,
                    assigneeProfile
                };
            });
            days.push({
                date: dateStr,
                dayOfWeek: currentDate.getDay(),
                isToday: currentDate.getTime() === today.getTime(),
                tasks: dayTasks
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return {
            weekStart: this.formatDate(weekStart),
            weekEnd: this.formatDate(weekEnd),
            weekNumber: this.getWeekNumber(weekStart),
            days
        };
    }
    async getDayCalendar(householdId, date) {
        const targetDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskInstances = await this.prisma.taskInstance.findMany({
            where: {
                task: { householdId },
                date: targetDate
            },
            include: {
                task: true
            },
            orderBy: [{ startTime: 'asc' }]
        });
        const profiles = await this.prisma.profile.findMany({
            where: { householdId },
            select: {
                id: true,
                displayName: true,
                color: true,
                avatarUrl: true
            }
        });
        const dayTasks = taskInstances.map(instance => {
            const assigneeProfile = profiles.find(p => p.id === instance.assigneeProfileId) || null;
            return {
                id: instance.id,
                taskId: instance.taskId,
                title: instance.task.title,
                description: instance.task.description,
                color: instance.task.color,
                icon: instance.task.icon,
                startTime: instance.startTime,
                endTime: instance.endTime,
                done: instance.done,
                doneAt: instance.doneAt,
                assigneeProfileId: instance.assigneeProfileId,
                assigneeProfile
            };
        });
        return {
            date: this.formatDate(targetDate),
            dayOfWeek: targetDate.getDay(),
            isToday: targetDate.getTime() === today.getTime(),
            tasks: dayTasks
        };
    }
    markDone(instanceId, done) {
        return this.prisma.taskInstance.update({
            where: { id: instanceId },
            data: { done, doneAt: done ? new Date() : null }
        });
    }
    async getCurrentTimeWindow(householdId, datetime) {
        const now = datetime ? new Date(datetime) : new Date();
        const currentDate = this.formatDate(now);
        const currentTime = this.formatTime(now);
        const startWindow = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        const endWindow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const startTime = this.formatTime(startWindow);
        const endTime = this.formatTime(endWindow);
        const taskInstances = await this.prisma.taskInstance.findMany({
            where: {
                task: { householdId },
                date: new Date(currentDate)
            },
            include: {
                task: true
            },
            orderBy: [{ startTime: 'asc' }]
        });
        const profiles = await this.prisma.profile.findMany({
            where: { householdId },
            select: {
                id: true,
                displayName: true,
                color: true,
                avatarUrl: true
            }
        });
        const tasksInWindow = taskInstances
            .filter(instance => {
            if (!instance.startTime)
                return false;
            const [startHour, startMinute] = instance.startTime.split(':').map(Number);
            const taskMinutes = startHour * 60 + startMinute;
            const [startWinHour, startWinMinute] = startTime.split(':').map(Number);
            const [endWinHour, endWinMinute] = endTime.split(':').map(Number);
            let startWindowMinutes = startWinHour * 60 + startWinMinute;
            let endWindowMinutes = endWinHour * 60 + endWinMinute;
            if (startWindowMinutes > endWindowMinutes) {
                return taskMinutes >= startWindowMinutes || taskMinutes <= endWindowMinutes;
            }
            return taskMinutes >= startWindowMinutes && taskMinutes <= endWindowMinutes;
        })
            .map(instance => {
            const assigneeProfile = profiles.find(p => p.id === instance.assigneeProfileId) || null;
            const { timeStatus, minutesFromNow } = this.calculateTimeStatus(instance.startTime, instance.endTime, currentTime);
            return {
                id: instance.id,
                taskId: instance.taskId,
                title: instance.task.title,
                description: instance.task.description,
                color: instance.task.color,
                icon: instance.task.icon,
                startTime: instance.startTime,
                endTime: instance.endTime,
                done: instance.done,
                doneAt: instance.doneAt,
                assigneeProfileId: instance.assigneeProfileId,
                assigneeProfile,
                timeStatus,
                minutesFromNow
            };
        })
            .sort((a, b) => a.minutesFromNow - b.minutesFromNow);
        const summary = {
            total: tasksInWindow.length,
            completed: tasksInWindow.filter(t => t.done).length,
            pending: tasksInWindow.filter(t => !t.done).length,
            current: tasksInWindow.filter(t => t.timeStatus === 'current' && !t.done).length,
            upcoming: tasksInWindow.filter(t => t.timeStatus === 'upcoming' && !t.done).length
        };
        return {
            currentTime,
            currentDate,
            timeWindow: {
                start: startTime,
                end: endTime
            },
            tasks: tasksInWindow,
            summary
        };
    }
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    formatTime(date) {
        return date.toTimeString().slice(0, 5);
    }
    calculateTimeStatus(startTime, endTime, currentTime) {
        if (!startTime) {
            return { timeStatus: 'upcoming', minutesFromNow: 0 };
        }
        const [currentHour, currentMinute] = currentTime.split(':').map(Number);
        const currentMinutes = currentHour * 60 + currentMinute;
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        let endMinutes = startMinutes + 60;
        if (endTime) {
            const [endHour, endMin] = endTime.split(':').map(Number);
            endMinutes = endHour * 60 + endMin;
        }
        const minutesFromNow = startMinutes - currentMinutes;
        if (currentMinutes < startMinutes) {
            return { timeStatus: 'upcoming', minutesFromNow };
        }
        else if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
            return { timeStatus: 'current', minutesFromNow };
        }
        else {
            return { timeStatus: 'past', minutesFromNow };
        }
    }
    getMonday(date) {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date);
        monday.setDate(diff);
        return monday;
    }
    getSunday(date) {
        const monday = this.getMonday(new Date(date));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return sunday;
    }
    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CalendarService);
//# sourceMappingURL=calendar.service.js.map
import { Controller, Get, Query } from '@nestjs/common';
import { MockDbService } from './mock-db.service';

@Controller('mock/calendar')
export class MockCalendarController {
  constructor(private readonly mockDb: MockDbService) {}

  @Get('now')
  getCurrentTimeWindow(@Query('householdId') householdId: string, @Query('datetime') datetime?: string) {
    // Always ensure demo data for any householdId and date
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

  @Get('day')
  getDayCalendar(@Query('householdId') householdId: string, @Query('date') date: string) {
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

  @Get('week')
  getWeekCalendar(@Query('householdId') householdId: string, @Query('date') date: string) {
    this.mockDb.ensureDemoDataForHousehold(householdId, date);
    // Calculate start and end of week
    const inputDate = new Date(date);
    const dayOfWeek = inputDate.getDay();
    const monday = new Date(inputDate);
    monday.setDate(inputDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    // Get all days in the week
    const days: any[] = [];
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
}

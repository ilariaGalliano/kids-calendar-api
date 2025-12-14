import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarDay, CalendarWeek, CalendarResponse } from './calendar.interfaces';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {
    console.log('Prisma in CalendarService:', prisma.constructor.name);
  }

  // Metodo originale per compatibilità
  list(householdId: string, from: string, to: string) {
    return this.prisma.taskInstance.findMany({
      where: {
        task: { householdId },
        date: { gte: new Date(from), lte: new Date(to) }
      },
      include: { task: true },
      orderBy: [{ date: 'asc' }]
    });
  }

  // Nuovo metodo per calendario completo
  async getCalendar(householdId: string, year: number, month: number): Promise<CalendarResponse> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    
    // Estendi per includere la settimana completa
    const startOfCalendar = this.getMonday(new Date(startOfMonth));
    const endOfCalendar = this.getSunday(new Date(endOfMonth));

    // Ottieni tutte le task instances nel periodo
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

    // Ottieni tutti i profili del household per l'associazione
    const profiles = await this.prisma.profile.findMany({
      where: { householdId },
      select: {
        id: true,
        displayName: true,
        color: true,
        avatarUrl: true
      }
    });

    // Genera tutti i giorni del calendario
    const days: CalendarDay[] = [];
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

    // Organizza in settimane
    const weeks: CalendarWeek[] = [];
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

  // Ottieni calendario per una settimana specifica
  async getWeekCalendar(householdId: string, date: string): Promise<CalendarWeek> {
    const targetDate = new Date(date);
    const weekStart = this.getMonday(new Date(targetDate));
    const weekEnd = this.getSunday(new Date(targetDate));

    // Se householdId è demo-family, ignora il filtro householdId
    const taskInstances = await this.prisma.taskInstance.findMany({
      where: {
        ...(householdId !== 'demo-family' ? { task: { householdId } } : {}),
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

    const days: CalendarDay[] = [];
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

  // Ottieni tasks per un giorno specifico
  async getDayCalendar(householdId: string, date: string): Promise<CalendarDay> {
    const targetDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Se householdId è demo-family, ignora il filtro householdId
    const taskInstances = await this.prisma.taskInstance.findMany({
      where: {
        ...(householdId !== 'demo-family' ? { task: { householdId } } : {}),
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

  markDone(instanceId: string, done: boolean) {
    return this.prisma.taskInstance.update({
      where: { id: instanceId },
      data: { done, doneAt: done ? new Date() : null }
    });
  }

  // Nuovo metodo per vista "Ora Corrente"
  async getCurrentTimeWindow(householdId: string, datetime?: string) {
    const now = datetime ? new Date(datetime) : new Date();
    const currentDate = this.formatDate(now);
    const currentTime = this.formatTime(now);
    
    // Calcola finestra temporale: 2 ore prima - 2 ore dopo
    const startWindow = new Date(now.getTime() - 2 * 60 * 60 * 1000); // -2 ore
    const endWindow = new Date(now.getTime() + 2 * 60 * 60 * 1000);   // +2 ore
    
    const startTime = this.formatTime(startWindow);
    const endTime = this.formatTime(endWindow);
    
    // Ottieni task instances per oggi
    // Se householdId è demo-family, ignora il filtro householdId
    const taskInstances = await this.prisma.taskInstance.findMany({
      where: {
        ...(householdId !== 'demo-family' ? { task: { householdId } } : {}),
        date: new Date(currentDate)
      },
      include: {
        task: true
      },
      orderBy: [{ startTime: 'asc' }]
    });

    // Ottieni profili per l'associazione
    const profiles = await this.prisma.profile.findMany({
      where: { householdId },
      select: {
        id: true,
        displayName: true,
        color: true,
        avatarUrl: true
      }
    });

    // Filtra e arricchisci le task nella finestra temporale
    const tasksInWindow = taskInstances
      .filter(instance => {
        if (!instance.startTime) return false;
        
        // Converti startTime in minuti dall'inizio della giornata
        const [startHour, startMinute] = instance.startTime.split(':').map(Number);
        const taskMinutes = startHour * 60 + startMinute;
        
        // Converti finestra temporale in minuti
        const [startWinHour, startWinMinute] = startTime.split(':').map(Number);
        const [endWinHour, endWinMinute] = endTime.split(':').map(Number);
        
        let startWindowMinutes = startWinHour * 60 + startWinMinute;
        let endWindowMinutes = endWinHour * 60 + endWinMinute;
        
        // Gestisci il caso in cui la finestra attraversa la mezzanotte
        if (startWindowMinutes > endWindowMinutes) {
          // Finestra attraversa mezzanotte (es: 22:00 - 02:00)
          return taskMinutes >= startWindowMinutes || taskMinutes <= endWindowMinutes;
        }
        
        return taskMinutes >= startWindowMinutes && taskMinutes <= endWindowMinutes;
      })
      .map(instance => {
        const assigneeProfile = profiles.find(p => p.id === instance.assigneeProfileId) || null;
        
        // Calcola status temporale e minuti dall'ora corrente
        const { timeStatus, minutesFromNow } = this.calculateTimeStatus(
          instance.startTime, 
          instance.endTime, 
          currentTime
        );
        
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
      .sort((a, b) => a.minutesFromNow - b.minutesFromNow); // Ordina per prossimità temporale

    // Calcola statistiche
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

  // Utility methods
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5); // HH:MM
  }

  private calculateTimeStatus(startTime: string | null, endTime: string | null, currentTime: string): { timeStatus: 'past' | 'current' | 'upcoming', minutesFromNow: number } {
    if (!startTime) {
      return { timeStatus: 'upcoming', minutesFromNow: 0 };
    }

    // Converti tutti i tempi in minuti dall'inizio della giornata
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    const currentMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;

    let endMinutes = startMinutes + 60; // Default: 1 ora di durata
    if (endTime) {
      const [endHour, endMin] = endTime.split(':').map(Number);
      endMinutes = endHour * 60 + endMin;
    }

    const minutesFromNow = startMinutes - currentMinutes;

    // Determina lo status
    if (currentMinutes < startMinutes) {
      return { timeStatus: 'upcoming', minutesFromNow };
    } else if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      return { timeStatus: 'current', minutesFromNow };
    } else {
      return { timeStatus: 'past', minutesFromNow };
    }
  }

  private getMonday(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date);
    monday.setDate(diff);
    return monday;
  }

  private getSunday(date: Date): Date {
    const monday = this.getMonday(new Date(date));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return sunday;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}
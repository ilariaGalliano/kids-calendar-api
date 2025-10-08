// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';

// interface CalendarDay {
//   date: string; // YYYY-MM-DD
//   dayOfWeek: number; // 0=Sunday, 6=Saturday
//   isToday: boolean;
//   tasks: Array<{
//     id: string;
//     taskId: string;
//     title: string;
//     description?: string;
//     color?: string;
//     icon?: string;
//     startTime?: string;
//     endTime?: string;
//     done: boolean;
//     doneAt?: Date;
//     assigneeProfileId: string;
//     assigneeProfile?: {
//       id: string;
//       displayName: string;
//       color?: string;
//       avatarUrl?: string;
//     };
//   }>;
// }

// interface CalendarWeek {
//   weekStart: string; // YYYY-MM-DD (Monday)
//   weekEnd: string;   // YYYY-MM-DD (Sunday)
//   weekNumber: number;
//   days: CalendarDay[];
// }

// interface CalendarResponse {
//   month: number;
//   year: number;
//   totalDays: number;
//   weeks: CalendarWeek[];
//   dailyView: CalendarDay[];
// }

// @Injectable()
// export class CalendarService {
//   constructor(private prisma: PrismaService) {
//     console.log('Prisma in CalendarService:', prisma.constructor.name);
//   }


//   // Metodo originale per compatibilità
//   list(householdId: string, from: string, to: string) {
//     return this.prisma.taskInstance.findMany({
//       where: {
//         task: { householdId },
//         date: { gte: new Date(from), lte: new Date(to) }
//       },
//       include: { task: true },
//       orderBy: [{ date: 'asc' }]
//     });
//   }

//   // Nuovo metodo per calendario completo
//   async getCalendar(householdId: string, year: number, month: number): Promise<CalendarResponse> {
//     const startOfMonth = new Date(year, month - 1, 1);
//     const endOfMonth = new Date(year, month, 0);
    
//     // Estendi per includere la settimana completa
//     const startOfCalendar = this.getMonday(startOfMonth);
//     const endOfCalendar = this.getSunday(endOfMonth);

//     // Ottieni tutte le task instances nel periodo
//     const taskInstances = await this.prisma.taskInstance.findMany({
//       where: {
//         task: { householdId },
//         date: { 
//           gte: startOfCalendar, 
//           lte: endOfCalendar 
//         }
//       },
//       include: { 
//         task: true
//       },
//       orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
//     });

//     // Ottieni tutti i profili del household per l'associazione
//     const profiles = await this.prisma.profile.findMany({
//       where: { householdId },
//       select: {
//         id: true,
//         displayName: true,
//         color: true,
//         avatarUrl: true
//       }
//     });

//     // Genera tutti i giorni del calendario
//     const days: CalendarDay[] = [];
//     const currentDate = new Date(startOfCalendar);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     while (currentDate <= endOfCalendar) {
//       const dateStr = this.formatDate(currentDate);
//       const dayTasks = taskInstances
//         .filter(instance => this.formatDate(instance.date) === dateStr)
//         .map(instance => {
//           const assigneeProfile = profiles.find(p => p.id === instance.assigneeProfileId);
//           return {
//             id: instance.id,
//             taskId: instance.taskId,
//             title: instance.task.title,
//             description: instance.task.description || undefined,
//             color: instance.task.color || undefined,
//             icon: instance.task.icon || undefined,
//             startTime: instance.startTime || undefined,
//             endTime: instance.endTime || undefined,
//             done: instance.done,
//             doneAt: instance.doneAt || undefined,
//             assigneeProfileId: instance.assigneeProfileId,
//             assigneeProfile
//           };
//         });

//       days.push({
//         date: dateStr,
//         dayOfWeek: currentDate.getDay(),
//         isToday: currentDate.getTime() === today.getTime(),
//         tasks: dayTasks
//       });

//       currentDate.setDate(currentDate.getDate() + 1);
//     }

//     // Organizza in settimane
//     const weeks: CalendarWeek[] = [];
//     for (let i = 0; i < days.length; i += 7) {
//       const weekDays = days.slice(i, i + 7);
//       weeks.push({
//         weekStart: weekDays[0].date,
//         weekEnd: weekDays[6].date,
//         weekNumber: this.getWeekNumber(new Date(weekDays[0].date)),
//         days: weekDays
//       });
//     }

//     return {
//       month,
//       year,
//       totalDays: endOfMonth.getDate(),
//       weeks,
//       dailyView: days.filter(day => {
//         const dayDate = new Date(day.date);
//         return dayDate.getMonth() === month - 1;
//       })
//     };
//   }

//   // Ottieni calendario per una settimana specifica
//   async getWeekCalendar(householdId: string, date: string): Promise<CalendarWeek> {
//     const targetDate = new Date(date);
//     const weekStart = this.getMonday(targetDate);
//     const weekEnd = this.getSunday(targetDate);

//     const taskInstances = await this.prisma.taskInstance.findMany({
//       where: {
//         task: { householdId },
//         date: { 
//           gte: weekStart, 
//           lte: weekEnd 
//         }
//       },
//       include: { 
//         task: true,
//         assigneeProfile: {
//           select: {
//             id: true,
//             displayName: true,
//             color: true,
//             avatarUrl: true
//           }
//         }
//       },
//       orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
//     });

//     const days: CalendarDay[] = [];
//     const currentDate = new Date(weekStart);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     for (let i = 0; i < 7; i++) {
//       const dateStr = this.formatDate(currentDate);
//       const dayTasks = taskInstances
//         .filter(instance => this.formatDate(instance.date) === dateStr)
//         .map(instance => ({
//           id: instance.id,
//           taskId: instance.taskId,
//           title: instance.task.title,
//           description: instance.task.description,
//           color: instance.task.color,
//           icon: instance.task.icon,
//           startTime: instance.startTime,
//           endTime: instance.endTime,
//           done: instance.done,
//           doneAt: instance.doneAt,
//           assigneeProfileId: instance.assigneeProfileId,
//           assigneeProfile: instance.assigneeProfile
//         }));

//       days.push({
//         date: dateStr,
//         dayOfWeek: currentDate.getDay(),
//         isToday: currentDate.getTime() === today.getTime(),
//         tasks: dayTasks
//       });

//       currentDate.setDate(currentDate.getDate() + 1);
//     }

//     return {
//       weekStart: this.formatDate(weekStart),
//       weekEnd: this.formatDate(weekEnd),
//       weekNumber: this.getWeekNumber(weekStart),
//       days
//     };
//   }

//   // Ottieni tasks per un giorno specifico
//   async getDayCalendar(householdId: string, date: string): Promise<CalendarDay> {
//     const targetDate = new Date(date);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const taskInstances = await this.prisma.taskInstance.findMany({
//       where: {
//         task: { householdId },
//         date: targetDate
//       },
//       include: { 
//         task: true,
//         assigneeProfile: {
//           select: {
//             id: true,
//             displayName: true,
//             color: true,
//             avatarUrl: true
//           }
//         }
//       },
//       orderBy: [{ startTime: 'asc' }]
//     });

//     const dayTasks = taskInstances.map(instance => ({
//       id: instance.id,
//       taskId: instance.taskId,
//       title: instance.task.title,
//       description: instance.task.description,
//       color: instance.task.color,
//       icon: instance.task.icon,
//       startTime: instance.startTime,
//       endTime: instance.endTime,
//       done: instance.done,
//       doneAt: instance.doneAt,
//       assigneeProfileId: instance.assigneeProfileId,
//       assigneeProfile: instance.assigneeProfile
//     }));

//     return {
//       date: this.formatDate(targetDate),
//       dayOfWeek: targetDate.getDay(),
//       isToday: targetDate.getTime() === today.getTime(),
//       tasks: dayTasks
//     };
//   }

//   markDone(instanceId: string, done: boolean) {
//     return this.prisma.taskInstance.update({
//       where: { id: instanceId },
//       data: { done, doneAt: done ? new Date() : null }
//     });
//   }

//   // Utility methods
//   private formatDate(date: Date): string {
//     return date.toISOString().split('T')[0];
//   }

//   private getMonday(date: Date): Date {
//     const day = date.getDay();
//     const diff = date.getDate() - day + (day === 0 ? -6 : 1);
//     return new Date(date.setDate(diff));
//   }

//   private getSunday(date: Date): Date {
//     const monday = this.getMonday(new Date(date));
//     return new Date(monday.setDate(monday.getDate() + 6));
//   }

//   private getWeekNumber(date: Date): number {
//     const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
//     const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
//     return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
//   }
// }

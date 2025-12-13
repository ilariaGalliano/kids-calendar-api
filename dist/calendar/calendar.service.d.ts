import { PrismaService } from '../prisma/prisma.service';
import { CalendarDay, CalendarWeek, CalendarResponse } from './calendar.interfaces';
export declare class CalendarService {
    private prisma;
    constructor(prisma: PrismaService);
    list(householdId: string, from: string, to: string): import("@prisma/client").Prisma.PrismaPromise<({
        task: {
            id: string;
            householdId: string;
            createdAt: Date;
            color: string | null;
            createdById: string;
            title: string;
            description: string | null;
            icon: string | null;
            schedule: import("@prisma/client/runtime/library").JsonValue | null;
            isActive: boolean;
        };
    } & {
        id: string;
        taskId: string;
        assigneeProfileId: string;
        date: Date;
        startTime: string | null;
        endTime: string | null;
        done: boolean;
        doneAt: Date | null;
    })[]>;
    getCalendar(householdId: string, year: number, month: number): Promise<CalendarResponse>;
    getWeekCalendar(householdId: string, date: string): Promise<CalendarWeek>;
    getDayCalendar(householdId: string, date: string): Promise<CalendarDay>;
    markDone(instanceId: string, done: boolean): import("@prisma/client").Prisma.Prisma__TaskInstanceClient<{
        id: string;
        taskId: string;
        assigneeProfileId: string;
        date: Date;
        startTime: string | null;
        endTime: string | null;
        done: boolean;
        doneAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    getCurrentTimeWindow(householdId: string, datetime?: string): Promise<{
        currentTime: string;
        currentDate: string;
        timeWindow: {
            start: string;
            end: string;
        };
        tasks: {
            id: string;
            taskId: string;
            title: string;
            description: string | null;
            color: string | null;
            icon: string | null;
            startTime: string | null;
            endTime: string | null;
            done: boolean;
            doneAt: Date | null;
            assigneeProfileId: string;
            assigneeProfile: {
                id: string;
                displayName: string;
                avatarUrl: string | null;
                color: string | null;
            } | null;
            timeStatus: "past" | "current" | "upcoming";
            minutesFromNow: number;
        }[];
        summary: {
            total: number;
            completed: number;
            pending: number;
            current: number;
            upcoming: number;
        };
    }>;
    private formatDate;
    private formatTime;
    private calculateTimeStatus;
    private getMonday;
    private getSunday;
    private getWeekNumber;
}

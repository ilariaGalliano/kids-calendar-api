import { CalendarService } from './calendar.service';
import { CalendarDay, CalendarWeek, CalendarResponse, CurrentTimeWindowResponse } from './calendar.interfaces';
export declare class CalendarController {
    private readonly svc;
    private readonly logger;
    constructor(svc: CalendarService);
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
    getMonthCalendar(householdId: string, year: string, month: string): Promise<CalendarResponse>;
    getWeekCalendar(householdId: string, date: string): Promise<CalendarWeek>;
    getDayCalendar(householdId: string, date: string): Promise<CalendarDay>;
    getCurrentTimeWindow(householdId: string, datetime?: string): Promise<CurrentTimeWindowResponse>;
    done(id: string, body: {
        done: boolean;
    }): import("@prisma/client").Prisma.Prisma__TaskInstanceClient<{
        id: string;
        taskId: string;
        assigneeProfileId: string;
        date: Date;
        startTime: string | null;
        endTime: string | null;
        done: boolean;
        doneAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}

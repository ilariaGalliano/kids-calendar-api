import { MockDbService } from './mock-db.service';
export declare class MockCalendarController {
    private readonly mockDb;
    constructor(mockDb: MockDbService);
    getCurrentTimeWindow(householdId: string, datetime?: string): {
        currentTime: string;
        currentDate: string;
        timeWindow: {
            start: string;
            end: string;
        };
        tasks: {
            id: string;
            householdId?: string | undefined;
            title?: string | undefined;
            description?: string | null;
            color?: string | null;
            icon?: string | null;
            schedule?: any;
            createdById?: string | undefined;
            createdAt?: Date | undefined;
            isActive?: boolean | undefined;
            taskId: string;
            assigneeProfileId: string;
            date: Date;
            startTime?: string | null;
            endTime?: string | null;
            done: boolean;
            doneAt?: Date | null;
        }[];
        summary: {
            total: number;
            completed: number;
            pending: number;
            current: number;
            upcoming: number;
        };
    };
    getDayCalendar(householdId: string, date: string): {
        date: string;
        tasks: {
            id: string;
            householdId?: string | undefined;
            title?: string | undefined;
            description?: string | null;
            color?: string | null;
            icon?: string | null;
            schedule?: any;
            createdById?: string | undefined;
            createdAt?: Date | undefined;
            isActive?: boolean | undefined;
            taskId: string;
            assigneeProfileId: string;
            date: Date;
            startTime?: string | null;
            endTime?: string | null;
            done: boolean;
            doneAt?: Date | null;
        }[];
        summary: {
            total: number;
            completed: number;
            pending: number;
        };
    };
    getWeekCalendar(householdId: string, date: string): {
        weekStart: string;
        weekEnd: string;
        days: any[];
        summary: {
            total: number;
            completed: number;
            pending: number;
        };
    };
}

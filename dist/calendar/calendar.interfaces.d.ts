export interface CalendarDay {
    date: string;
    dayOfWeek: number;
    isToday: boolean;
    tasks: Array<{
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
            color: string | null;
            avatarUrl: string | null;
        } | null;
    }>;
}
export interface CalendarWeek {
    weekStart: string;
    weekEnd: string;
    weekNumber: number;
    days: CalendarDay[];
}
export interface CalendarResponse {
    month: number;
    year: number;
    totalDays: number;
    weeks: CalendarWeek[];
    dailyView: CalendarDay[];
}
export interface CurrentTimeWindowResponse {
    currentTime: string;
    currentDate: string;
    timeWindow: {
        start: string;
        end: string;
    };
    tasks: Array<{
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
            color: string | null;
            avatarUrl: string | null;
        } | null;
        timeStatus: 'past' | 'current' | 'upcoming';
        minutesFromNow: number;
    }>;
    summary: {
        total: number;
        completed: number;
        pending: number;
        current: number;
        upcoming: number;
    };
}

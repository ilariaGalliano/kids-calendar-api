export interface CalendarDay {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0=Sunday, 6=Saturday
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
  weekStart: string; // YYYY-MM-DD (Monday)  
  weekEnd: string;   // YYYY-MM-DD (Sunday)
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
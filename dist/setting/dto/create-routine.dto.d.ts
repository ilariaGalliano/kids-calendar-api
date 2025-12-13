export declare class CreateRoutineDto {
    childId: string;
    name: string;
    startTime: string;
    days: string[];
    tasksByDay: Record<string, any[]>;
    isActive: boolean;
    description: string;
}

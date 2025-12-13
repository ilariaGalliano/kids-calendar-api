export declare class UpdateRoutineDto {
    name?: string;
    description?: string;
    startTime?: string;
    isActive?: boolean;
    days?: string[];
    tasksByDay?: Record<string, any[]>;
    childId?: string;
}

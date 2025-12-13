export declare class CreateTaskDto {
    name: string;
    description?: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening';
    timer?: number;
    reward?: number;
}

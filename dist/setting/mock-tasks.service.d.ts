import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class MockTasksService {
    private tasks;
    getTasks(timeOfDay?: string): any[];
    createTask(dto: CreateTaskDto): {
        name: string;
        description?: string;
        timeOfDay: "morning" | "afternoon" | "evening";
        timer?: number;
        reward?: number;
        id: string;
    };
    updateTask(id: string, dto: UpdateTaskDto): any;
    deleteTask(id: string): boolean;
}

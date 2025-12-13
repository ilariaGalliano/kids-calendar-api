import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    getTasks(timeOfDay?: string): any[];
    createTask(dto: CreateTaskDto): {
        id: string;
        reward: number;
        name: string;
        description?: string;
        timeOfDay: "morning" | "afternoon" | "evening";
        timer?: number;
    };
    updateTask(id: string, dto: UpdateTaskDto): any;
    deleteTask(id: string): boolean;
}

import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { RoutineService } from './routine.service';
export declare class RoutineController {
    private readonly routineService;
    constructor(routineService: RoutineService);
    getRoutines(childId: string): any[];
    createRoutine(dto: CreateRoutineDto): {
        childId: string;
        name: string;
        startTime: string;
        days: string[];
        tasksByDay: Record<string, any[]>;
        isActive: boolean;
        description: string;
        id: string;
    };
    updateRoutine(id: string, dto: UpdateRoutineDto): any;
    deleteRoutine(id: string): boolean;
}

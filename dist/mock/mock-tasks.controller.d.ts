import { MockDbService } from './mock-db.service';
export declare class MockTasksController {
    private readonly mockDb;
    constructor(mockDb: MockDbService);
    getTasks(householdId: string): Promise<{
        id: string;
        householdId: string;
        title: string;
        description?: string | null;
        color?: string | null;
        icon?: string | null;
        schedule?: any;
        createdById: string;
        createdAt: Date;
        isActive: boolean;
    }[]>;
}

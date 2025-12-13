import { PrismaService } from '../prisma/prisma.service';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    list(householdId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        householdId: string;
        createdAt: Date;
        color: string | null;
        createdById: string;
        title: string;
        description: string | null;
        icon: string | null;
        schedule: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
    }[]>;
    create(householdId: string, dto: any): import("@prisma/client").Prisma.Prisma__TaskClient<{
        id: string;
        householdId: string;
        createdAt: Date;
        color: string | null;
        createdById: string;
        title: string;
        description: string | null;
        icon: string | null;
        schedule: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}

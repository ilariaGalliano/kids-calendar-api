import { HouseholdsService } from './households.service';
export declare class HouseholdsController {
    private readonly svc;
    constructor(svc: HouseholdsService);
    get(id: string): import("@prisma/client").Prisma.Prisma__HouseholdClient<{
        id: string;
        name: string;
        ownerId: string;
        createdAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    profiles(id: string): Promise<{
        id: string;
        householdId: string;
        createdAt: Date;
        displayName: string;
        type: import("@prisma/client").$Enums.ProfileType;
        role: import("@prisma/client").$Enums.ProfileRole;
        avatarUrl: string | null;
        color: string | null;
        pinned: boolean;
        createdById: string | null;
    }[]>;
}

import { PrismaService } from '../prisma/prisma.service';
export declare class HouseholdsService {
    private prisma;
    constructor(prisma: PrismaService);
    get(id: string): import("@prisma/client").Prisma.Prisma__HouseholdClient<{
        id: string;
        name: string;
        ownerId: string;
        createdAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    listProfiles(householdId: string): Promise<{
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

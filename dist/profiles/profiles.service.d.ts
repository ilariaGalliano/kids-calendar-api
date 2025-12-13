import { PrismaService } from '../prisma/prisma.service';
export declare class ProfilesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(householdId: string, data: {
        displayName: string;
        type: 'adult' | 'child';
        role: 'admin' | 'member';
        color?: string;
        avatar?: string;
    }): Promise<{
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
    }>;
    createChildProfile(householdId: string, displayName: string, avatar?: string): Promise<{
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
    }>;
}

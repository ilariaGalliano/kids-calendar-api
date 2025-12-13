import { ProfilesService } from './profiles.service';
export declare class ProfilesController {
    private readonly svc;
    constructor(svc: ProfilesService);
    create(householdId: string, dto: {
        displayName: string;
        type: 'adult' | 'child';
        role: 'admin' | 'member';
        color?: string;
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
    createProfile(body: {
        householdId: string;
        displayName: string;
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
}

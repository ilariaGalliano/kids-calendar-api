type AppUser = {
    id: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
};
type Household = {
    id: string;
    name: string;
    ownerId: string;
    createdAt: Date;
};
type Profile = {
    id: string;
    householdId: string;
    displayName: string;
    type: 'adult' | 'child';
    role: 'admin' | 'member';
    avatarUrl?: string | null;
    color?: string | null;
    pinned: boolean;
    createdAt: Date;
    createdById?: string | null;
};
type Task = {
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
};
type TaskInstance = {
    id: string;
    taskId: string;
    assigneeProfileId: string;
    date: Date;
    startTime?: string | null;
    endTime?: string | null;
    done: boolean;
    doneAt?: Date | null;
};
export declare class MockDbService {
    ensureDemoDataForHousehold(householdId: string, date?: string): void;
    users: AppUser[];
    households: Household[];
    profiles: Profile[];
    tasks: Task[];
    instances: TaskInstance[];
    appUser: {
        findUnique: ({ where: { email } }: any) => Promise<AppUser | null>;
        create: ({ data }: any) => Promise<AppUser>;
    };
    household: {
        create: ({ data }: any) => Promise<Household>;
        findUnique: ({ where: { id } }: any) => Promise<Household | null>;
    };
    profile: {
        count: ({ where: { householdId } }: any) => Promise<number>;
        create: ({ data }: any) => Promise<Profile>;
        findMany: ({ where: { householdId } }: any) => Promise<Profile[]>;
    };
    task: {
        findMany: ({ where, include, orderBy }: any) => Promise<any[]>;
        create: ({ data }: any) => Promise<Task>;
    };
    addSampleTasksForHousehold(householdId: string): void;
    taskInstance: {
        findMany: ({ where, include, orderBy }: any) => Promise<any[]>;
        update: ({ where: { id }, data }: any) => Promise<TaskInstance>;
    };
    seedDemo(): {
        user: AppUser;
        hh: Household;
        admin: Profile;
        kid1: Profile;
        kid2: Profile;
        tasks: Task[];
        instances: TaskInstance[];
    };
}
export {};

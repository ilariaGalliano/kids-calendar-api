// src/mock/mock-db.service.ts
import { randomUUID } from 'crypto';

type AppUser = { id: string; email: string; passwordHash: string; createdAt: Date };
type Household = { id: string; name: string; ownerId: string; createdAt: Date };
type Profile = {
  id: string; householdId: string; displayName: string;
  type: 'adult'|'child'; role: 'admin'|'member'; avatarUrl?: string|null; color?: string|null;
  pinned: boolean; createdAt: Date; createdById?: string|null;
};
type Task = {
  id: string; householdId: string; title: string; description?: string|null;
  color?: string|null; icon?: string|null; schedule?: any; createdById: string;
  createdAt: Date; isActive: boolean;
};
type TaskInstance = {
  id: string; taskId: string; assigneeProfileId: string; date: Date;
  startTime?: string|null; endTime?: string|null; done: boolean; doneAt?: Date|null;
};

function cuid() { return randomUUID(); }
function toDateOnly(d: string|Date) {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
}

/**
 * MockDbService mima un sottoinsieme dell'API Prisma usata nei tuoi services.
 * Espone "model delegates" con metodi: findUnique, create, count, findMany, update.
 */
export class MockDbService {
  // tabelle in-memory
  private users: AppUser[] = [];
  private households: Household[] = [];
  private profiles: Profile[] = [];
  private tasks: Task[] = [];
  private instances: TaskInstance[] = [];

  // -------------------- appUser --------------------
  appUser = {
    findUnique: async ({ where: { email } }: any): Promise<AppUser|null> => {
      return this.users.find(u => u.email === email) || null;
    },
    create: async ({ data }: any): Promise<AppUser> => {
      const row: AppUser = { id: cuid(), createdAt: new Date(), ...data };
      this.users.push(row);
      return row;
    },
  };

  // -------------------- household --------------------
  household = {
    create: async ({ data }: any): Promise<Household> => {
      const row: Household = { id: cuid(), createdAt: new Date(), ...data };
      this.households.push(row);
      return row;
    },
    findUnique: async ({ where: { id } }: any): Promise<Household|null> => {
      return this.households.find(h => h.id === id) || null;
    },
  };

  // -------------------- profile --------------------
  profile = {
    count: async ({ where: { householdId } }: any): Promise<number> => {
      return this.profiles.filter(p => p.householdId === householdId).length;
    },
    create: async ({ data }: any): Promise<Profile> => {
      const row: Profile = {
        id: cuid(),
        createdAt: new Date(),
        pinned: false,
        avatarUrl: null,
        color: null,
        createdById: null,
        ...data,
      };
      this.profiles.push(row);
      return row;
    },
    findMany: async ({ where: { householdId } }: any): Promise<Profile[]> => {
      return this.profiles.filter(p => p.householdId === householdId);
    },
  };

  // -------------------- task --------------------
  task = {
    findMany: async ({ where, include, orderBy }: any): Promise<any[]> => {
      let rows = this.tasks.filter(t => {
        if (where?.householdId !== undefined) {
          if (t.householdId !== where.householdId) return false;
        }
        if (where?.isActive !== undefined) {
          if (t.isActive !== where.isActive) return false;
        }
        return true;
      });
      if (orderBy) {
        // minimal ordering support if needed
      }
      // include not used in your tasks service; return as-is
      return rows;
    },
    create: async ({ data }: any): Promise<Task> => {
      const row: Task = {
        id: cuid(),
        createdAt: new Date(),
        isActive: true,
        ...data,
      };
      this.tasks.push(row);
      return row;
    },
  };

  // -------------------- taskInstance --------------------
  taskInstance = {
    findMany: async ({ where, include, orderBy }: any): Promise<any[]> => {
      let rows = this.instances.filter(inst => {
        if (where?.task?.householdId !== undefined) {
          const task = this.tasks.find(t => t.id === inst.taskId);
          if (!task || task.householdId !== where.task.householdId) return false;
        }
        if (where?.date?.gte) {
          if (toDateOnly(inst.date) < toDateOnly(where.date.gte)) return false;
        }
        if (where?.date?.lte) {
          if (toDateOnly(inst.date) > toDateOnly(where.date.lte)) return false;
        }
        return true;
      });

      if (orderBy?.length) {
        for (const o of orderBy) {
          const [key, dir] = Object.entries(o)[0] as [string, 'asc'|'desc'];
          rows = rows.sort((a: any, b: any) => {
            const av = a[key], bv = b[key];
            return (av > bv ? 1 : av < bv ? -1 : 0) * (dir === 'asc' ? 1 : -1);
          });
        }
      }

      if (include?.task) {
        return rows.map(r => ({ ...r, task: this.tasks.find(t => t.id === r.taskId) || null }));
      }
      return rows;
    },

    update: async ({ where: { id }, data }: any): Promise<TaskInstance> => {
      const idx = this.instances.findIndex(x => x.id === id);
      if (idx < 0) throw new Error('TaskInstance not found');
      const merged = { ...this.instances[idx], ...data };
      this.instances[idx] = merged;
      return merged;
    },
  };

  // -------------------- seed helpers --------------------
  /** opzionale: genera una famiglia demo con 3 profili e qualche task/istanza */
  seedDemo() {
    // user
    const user: AppUser = {
      id: cuid(), email: 'demo@demo.it', passwordHash: '$2b$10$hash', createdAt: new Date(),
    };
    this.users.push(user);
    // household
    const hh: Household = { id: cuid(), name: 'Famiglia Demo', ownerId: user.id, createdAt: new Date() };
    this.households.push(hh);
    // profiles
    const admin: Profile = {
      id: cuid(), householdId: hh.id, displayName: 'Mamma', type: 'adult', role: 'admin',
      color: '#6C8CFF', pinned: true, createdAt: new Date(), avatarUrl: null, createdById: null
    };
    const kid1: Profile = {
      id: cuid(), householdId: hh.id, displayName: 'Greta', type: 'child', role: 'member',
      color: '#9AD7FF', pinned: true, createdAt: new Date(), avatarUrl: null, createdById: null
    };
    const kid2: Profile = {
      id: cuid(), householdId: hh.id, displayName: 'Grace', type: 'child', role: 'member',
      color: '#FFD47A', pinned: false, createdAt: new Date(), avatarUrl: null, createdById: null
    };
    this.profiles.push(admin, kid1, kid2);
    // tasks
    const t1: Task = {
      id: cuid(), householdId: hh.id, title: 'Lavare i denti', description: null,
      color: '#7ED8A4', icon: 'tooth', schedule: { rrule: 'FREQ=DAILY;BYHOUR=8;BYMINUTE=0' },
      createdById: admin.id, createdAt: new Date(), isActive: true
    };
    const t2: Task = {
      id: cuid(), householdId: hh.id, title: 'Compiti', description: null,
      color: '#FFB5C2', icon: 'book', schedule: { rrule: 'FREQ=DAILY;BYHOUR=17;BYMINUTE=0' },
      createdById: admin.id, createdAt: new Date(), isActive: true
    };
    this.tasks.push(t1, t2);
    // instances (oggi e domani)
    const today = toDateOnly(new Date());
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

    const i1: TaskInstance = {
      id: cuid(), taskId: t1.id, assigneeProfileId: kid1.id,
      date: today, startTime: '08:00', endTime: '08:10', done: false, doneAt: null
    };
    const i2: TaskInstance = {
      id: cuid(), taskId: t2.id, assigneeProfileId: kid1.id,
      date: today, startTime: '17:00', endTime: '17:30', done: true, doneAt: new Date()
    };
    const i3: TaskInstance = {
      id: cuid(), taskId: t1.id, assigneeProfileId: kid2.id,
      date: tomorrow, startTime: '08:00', endTime: '08:10', done: false, doneAt: null
    };
    this.instances.push(i1, i2, i3);

    console.log('Seed HH_ID:', hh.id);


    return { user, hh, admin, kid1, kid2, t1, t2, i1, i2, i3 };
  }
}

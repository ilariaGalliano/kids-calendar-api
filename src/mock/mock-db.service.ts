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
    
    // household - usiamo un ID fisso per il test
    const hh: Household = { 
      id: '6fcd9bea3-d818-46b4-b04b-915b9b231049', // ID fisso per il test
      name: 'Famiglia Demo', 
      ownerId: user.id, 
      createdAt: new Date() 
    };
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
    
    // Task templates basati sui suggerimenti del frontend
    const taskTemplates = [
      { title: '🍎 Colazione', color: '#FFB84D', icon: 'restaurant', time: '07:30' },
      { title: '📚 Compiti', color: '#7ED8A4', icon: 'book', time: '16:00' },
      { title: '🎮 Gioco libero', color: '#FF6B6B', icon: 'game-controller', time: '18:00' },
      { title: '🛁 Bagno', color: '#4ECDC4', icon: 'water', time: '19:30' },
      { title: '🦷 Lavare i denti', color: '#45B7D1', icon: 'medical', time: '20:00' },
      { title: '🛏️ Andare a letto', color: '#96CEB4', icon: 'bed', time: '20:30' }
    ];

    // Crea le task
    const tasks: Task[] = [];
    taskTemplates.forEach(template => {
      const task: Task = {
        id: cuid(),
        householdId: hh.id,
        title: template.title,
        description: `Task giornaliera: ${template.title}`,
        color: template.color,
        icon: template.icon,
        schedule: { rrule: `FREQ=DAILY;BYHOUR=${template.time.split(':')[0]};BYMINUTE=${template.time.split(':')[1]}` },
        createdById: admin.id,
        createdAt: new Date(),
        isActive: true
      };
      tasks.push(task);
    });
    this.tasks.push(...tasks);

    // Genera istanze per una settimana (7 giorni partendo da oggi)
    const instances: TaskInstance[] = [];
    const today = toDateOnly(new Date());
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);
      
      // Per ogni giorno, crea 3-5 task random dai template
      const dailyTaskCount = Math.floor(Math.random() * 3) + 3; // 3-5 task
      const selectedTasks = tasks
        .sort(() => 0.5 - Math.random()) // shuffle
        .slice(0, dailyTaskCount);
        
      selectedTasks.forEach((task, index) => {
        // Alterna tra i bambini
        const assignee = index % 2 === 0 ? kid1 : kid2;
        
        // Calcola orari basati sul template + un po' di variazione
        const baseHour = parseInt(task.schedule?.rrule?.match(/BYHOUR=(\d+)/)?.[1] || '8');
        const startHour = Math.max(7, Math.min(21, baseHour + Math.floor(Math.random() * 2) - 1));
        const endHour = startHour + 1;
        
        // Alcune task sono già completate (30% di probabilità)
        const isDone = Math.random() < 0.3;
        
        const instance: TaskInstance = {
          id: cuid(),
          taskId: task.id,
          assigneeProfileId: assignee.id,
          date: currentDate,
          startTime: `${startHour.toString().padStart(2, '0')}:${(Math.floor(Math.random() * 6) * 10).toString().padStart(2, '0')}`,
          endTime: `${endHour.toString().padStart(2, '0')}:${(Math.floor(Math.random() * 6) * 10).toString().padStart(2, '0')}`,
          done: isDone,
          doneAt: isDone ? new Date(currentDate.getTime() + startHour * 60 * 60 * 1000) : null
        };
        
        instances.push(instance);
      });
    }
    
    this.instances.push(...instances);

    return { user, hh, admin, kid1, kid2, tasks, instances };
  }
}

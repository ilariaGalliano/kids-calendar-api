"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockDbService = void 0;
const crypto_1 = require("crypto");
function cuid() { return (0, crypto_1.randomUUID)(); }
function toDateOnly(d) {
    const x = new Date(d);
    return new Date(x.getFullYear(), x.getMonth(), x.getDate());
}
class MockDbService {
    ensureDemoDataForHousehold(householdId, date) {
        if (!this.households.find(h => h.id === householdId)) {
            this.households.push({
                id: householdId,
                name: 'Famiglia Test',
                ownerId: 'demo-owner',
                createdAt: new Date()
            });
        }
        if (!this.profiles.find(p => p.householdId === householdId && p.type === 'child')) {
            this.profiles.push({
                id: householdId + '-kid1',
                householdId,
                displayName: 'TestKid1',
                type: 'child',
                role: 'member',
                avatarUrl: null,
                color: '#9AD7FF',
                pinned: true,
                createdAt: new Date(),
                createdById: null
            }, {
                id: householdId + '-kid2',
                householdId,
                displayName: 'TestKid2',
                type: 'child',
                role: 'member',
                avatarUrl: null,
                color: '#FFD47A',
                pinned: false,
                createdAt: new Date(),
                createdById: null
            });
        }
        if (!this.tasks.find(t => t.householdId === householdId)) {
            this.addSampleTasksForHousehold(householdId);
        }
        const todayStr = date || new Date().toISOString().slice(0, 10);
        const today = new Date(todayStr);
        const hasInstances = this.instances.some(inst => inst.date.toISOString().slice(0, 10) === todayStr && this.tasks.find(t => t.id === inst.taskId && t.householdId === householdId));
        if (!hasInstances) {
            ['07:30', '16:00', '19:00'].forEach((startTime, i) => {
                this.instances.push({
                    id: householdId + '-inst-' + i,
                    taskId: this.tasks.find(t => t.householdId === householdId && t.title.includes('('))?.id
                        || this.tasks.find(t => t.householdId === householdId)?.id
                        || 'unknown-task-id',
                    assigneeProfileId: householdId + (i % 2 === 0 ? '-kid1' : '-kid2'),
                    date: today,
                    startTime,
                    endTime: (parseInt(startTime.split(':')[0]) + 1).toString().padStart(2, '0') + ':' + startTime.split(':')[1],
                    done: i === 0,
                    doneAt: i === 0 ? today : null
                });
            });
        }
    }
    users = [];
    households = [];
    profiles = [];
    tasks = [];
    instances = [];
    appUser = {
        findUnique: async ({ where: { email } }) => {
            return this.users.find(u => u.email === email) || null;
        },
        create: async ({ data }) => {
            const row = { id: cuid(), createdAt: new Date(), ...data };
            this.users.push(row);
            return row;
        },
    };
    household = {
        create: async ({ data }) => {
            const row = { id: cuid(), createdAt: new Date(), ...data };
            this.households.push(row);
            return row;
        },
        findUnique: async ({ where: { id } }) => {
            return this.households.find(h => h.id === id) || null;
        },
    };
    profile = {
        count: async ({ where: { householdId } }) => {
            return this.profiles.filter(p => p.householdId === householdId).length;
        },
        create: async ({ data }) => {
            const row = {
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
        findMany: async ({ where: { householdId } }) => {
            return this.profiles.filter(p => p.householdId === householdId);
        },
    };
    task = {
        findMany: async ({ where, include, orderBy }) => {
            let rows = this.tasks.filter(t => {
                if (where?.householdId !== undefined) {
                    if (t.householdId !== where.householdId)
                        return false;
                }
                if (where?.isActive !== undefined) {
                    if (t.isActive !== where.isActive)
                        return false;
                }
                return true;
            });
            if (orderBy) {
            }
            return rows;
        },
        create: async ({ data }) => {
            const row = {
                id: cuid(),
                createdAt: new Date(),
                isActive: true,
                ...data,
            };
            this.tasks.push(row);
            return row;
        },
    };
    addSampleTasksForHousehold(householdId) {
        const children = this.profiles.filter(p => p.householdId === householdId && p.type === 'child');
        children.forEach(child => {
            ['Riordina la stanza', 'Fai colazione', 'Leggi un libro'].forEach((title, i) => {
                this.tasks.push({
                    id: `${householdId}-task-${child.id}-${i}`,
                    householdId,
                    title: `${title} (${child.displayName})`,
                    description: `Attività per ${child.displayName}: ${title}`,
                    color: i === 0 ? '#FFD700' : i === 1 ? '#FF9BAA' : '#81C784',
                    icon: i === 0 ? 'home' : i === 1 ? 'restaurant' : 'library',
                    createdById: child.id,
                    createdAt: new Date(),
                    isActive: true
                });
            });
        });
    }
    taskInstance = {
        findMany: async ({ where, include, orderBy }) => {
            let rows = this.instances.filter(inst => {
                if (where?.task?.householdId !== undefined) {
                    const task = this.tasks.find(t => t.id === inst.taskId);
                    if (!task || task.householdId !== where.task.householdId)
                        return false;
                }
                if (where?.date?.gte) {
                    if (toDateOnly(inst.date) < toDateOnly(where.date.gte))
                        return false;
                }
                if (where?.date?.lte) {
                    if (toDateOnly(inst.date) > toDateOnly(where.date.lte))
                        return false;
                }
                return true;
            });
            if (orderBy?.length) {
                for (const o of orderBy) {
                    const [key, dir] = Object.entries(o)[0];
                    rows = rows.sort((a, b) => {
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
        update: async ({ where: { id }, data }) => {
            const idx = this.instances.findIndex(x => x.id === id);
            if (idx < 0)
                throw new Error('TaskInstance not found');
            const merged = { ...this.instances[idx], ...data };
            this.instances[idx] = merged;
            return merged;
        },
    };
    seedDemo() {
        const user = {
            id: cuid(), email: 'demo@demo.it', passwordHash: '$2b$10$hash', createdAt: new Date(),
        };
        this.users.push(user);
        const hh = {
            id: '6fcd9bea3-d818-46b4-b04b-915b9b231049',
            name: 'Famiglia Demo',
            ownerId: user.id,
            createdAt: new Date()
        };
        this.households.push(hh);
        const admin = {
            id: cuid(), householdId: hh.id, displayName: 'Mamma', type: 'adult', role: 'admin',
            color: '#6C8CFF', pinned: true, createdAt: new Date(), avatarUrl: null, createdById: null
        };
        const kid1 = {
            id: cuid(), householdId: hh.id, displayName: 'Greta', type: 'child', role: 'member',
            color: '#9AD7FF', pinned: true, createdAt: new Date(), avatarUrl: null, createdById: null
        };
        const kid2 = {
            id: cuid(), householdId: hh.id, displayName: 'Grace', type: 'child', role: 'member',
            color: '#FFD47A', pinned: false, createdAt: new Date(), avatarUrl: null, createdById: null
        };
        this.profiles.push(admin, kid1, kid2);
        const taskTemplates = [
            { title: '� Sveglia', color: '#FFD47A', icon: 'sunny', time: '07:00' },
            { title: '�🍎 Colazione', color: '#FFB84D', icon: 'restaurant', time: '07:30' },
            { title: '🧼 Lavarsi', color: '#4ECDC4', icon: 'water', time: '08:00' },
            { title: '� Vestirsi', color: '#FF9BAA', icon: 'shirt', time: '08:15' },
            { title: '🎒 Preparare zaino', color: '#6C8CFF', icon: 'backpack', time: '08:30' },
            { title: '�📚 Compiti di matematica', color: '#7ED8A4', icon: 'calculator', time: '16:00' },
            { title: '✏️ Compiti di italiano', color: '#FF6B6B', icon: 'pencil', time: '16:30' },
            { title: '🌍 Studio geografia', color: '#45B7D1', icon: 'globe', time: '17:00' },
            { title: '🔬 Esperimenti scientifici', color: '#9B59B6', icon: 'flask', time: '17:30' },
            { title: '🎨 Disegno libero', color: '#F39C12', icon: 'brush', time: '15:30' },
            { title: '🎮 Gioco libero', color: '#FF6B6B', icon: 'game-controller', time: '18:00' },
            { title: '🚴‍♀️ Bicicletta', color: '#2ECC71', icon: 'bicycle', time: '17:00' },
            { title: '⚽ Giocare a pallone', color: '#E74C3C', icon: 'football', time: '16:30' },
            { title: '🎵 Suonare strumento', color: '#9B59B6', icon: 'musical-notes', time: '17:15' },
            { title: '� Leggere libro', color: '#3498DB', icon: 'library', time: '19:00' },
            { title: '🧩 Puzzle/Giochi', color: '#E67E22', icon: 'extension-puzzle', time: '18:30' },
            { title: '🧹 Riordinare camera', color: '#1ABC9C', icon: 'home', time: '18:00' },
            { title: '🍽️ Apparecchiare tavola', color: '#F1C40F', icon: 'restaurant', time: '19:00' },
            { title: '🗑️ Buttare spazzatura', color: '#95A5A6', icon: 'trash', time: '18:45' },
            { title: '🐕 Dare da mangiare al cane', color: '#D35400', icon: 'paw', time: '17:30' },
            { title: '🌱 Innaffiare piante', color: '#27AE60', icon: 'leaf', time: '18:15' },
            { title: '🍝 Cena', color: '#E74C3C', icon: 'restaurant', time: '19:30' },
            { title: '📺 Tempo TV', color: '#8E44AD', icon: 'tv', time: '20:00' },
            { title: '�🛁 Bagno', color: '#4ECDC4', icon: 'water', time: '20:30' },
            { title: '🦷 Lavare i denti', color: '#45B7D1', icon: 'medical', time: '21:00' },
            { title: '👔 Preparare vestiti domani', color: '#FF9BAA', icon: 'shirt', time: '20:45' },
            { title: '🛏️ Andare a letto', color: '#96CEB4', icon: 'bed', time: '21:30' },
            { title: '🎭 Teatro/Cinema', color: '#8E44AD', icon: 'film', time: '15:00' },
            { title: '🏊‍♀️ Piscina', color: '#3498DB', icon: 'water', time: '14:00' },
            { title: '🍕 Pizza insieme', color: '#E67E22', icon: 'restaurant', time: '19:00' },
            { title: '👨‍👩‍👧‍👦 Tempo famiglia', color: '#FF9BAA', icon: 'people', time: '16:00' },
            { title: '🛍️ Spesa insieme', color: '#F39C12', icon: 'basket', time: '10:00' }
        ];
        const tasks = [];
        taskTemplates.forEach(template => {
            const task = {
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
        const instances = [];
        const today = toDateOnly(new Date());
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + dayOffset);
            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
            const dailyTaskCount = isWeekend ?
                Math.floor(Math.random() * 4) + 4 :
                Math.floor(Math.random() * 4) + 5;
            const morningTasks = tasks.filter(t => {
                const hour = parseInt(t.schedule?.rrule?.match(/BYHOUR=(\d+)/)?.[1] || '12');
                return hour >= 7 && hour <= 10;
            });
            const afternoonTasks = tasks.filter(t => {
                const hour = parseInt(t.schedule?.rrule?.match(/BYHOUR=(\d+)/)?.[1] || '12');
                return hour >= 15 && hour <= 18;
            });
            const eveningTasks = tasks.filter(t => {
                const hour = parseInt(t.schedule?.rrule?.match(/BYHOUR=(\d+)/)?.[1] || '12');
                return hour >= 19 && hour <= 22;
            });
            const selectedTasks = [];
            const morningCount = Math.floor(Math.random() * 2) + 1;
            selectedTasks.push(...morningTasks.sort(() => 0.5 - Math.random()).slice(0, morningCount));
            const afternoonCount = isWeekend ?
                Math.floor(Math.random() * 2) + 2 :
                Math.floor(Math.random() * 3) + 2;
            selectedTasks.push(...afternoonTasks.sort(() => 0.5 - Math.random()).slice(0, afternoonCount));
            const eveningCount = Math.floor(Math.random() * 2) + 1;
            selectedTasks.push(...eveningTasks.sort(() => 0.5 - Math.random()).slice(0, eveningCount));
            const remainingCount = dailyTaskCount - selectedTasks.length;
            if (remainingCount > 0) {
                const remainingTasks = tasks
                    .filter(t => !selectedTasks.includes(t))
                    .sort(() => 0.5 - Math.random())
                    .slice(0, remainingCount);
                selectedTasks.push(...remainingTasks);
            }
            selectedTasks.sort((a, b) => {
                const hourA = parseInt(a.schedule?.rrule?.match(/BYHOUR=(\d+)/)?.[1] || '12');
                const hourB = parseInt(b.schedule?.rrule?.match(/BYHOUR=(\d+)/)?.[1] || '12');
                return hourA - hourB;
            });
            selectedTasks.forEach((task, index) => {
                const assignee = index % 2 === 0 ? kid1 : kid2;
                const baseHour = parseInt(task.schedule?.rrule?.match(/BYHOUR=(\d+)/)?.[1] || '12');
                const variation = Math.floor(Math.random() * 3) - 1;
                const startHour = Math.max(7, Math.min(21, baseHour + variation));
                const duration = Math.floor(Math.random() * 90) + 30;
                const endHour = Math.min(22, startHour + Math.floor(duration / 60));
                const endMinute = duration % 60;
                const daysPassed = dayOffset;
                const completionRate = daysPassed < 2 ? 0.7 : daysPassed < 4 ? 0.4 : 0.1;
                const isDone = Math.random() < completionRate;
                const startMinute = Math.floor(Math.random() * 6) * 10;
                const instance = {
                    id: cuid(),
                    taskId: task.id,
                    assigneeProfileId: assignee.id,
                    date: currentDate,
                    startTime: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
                    endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
                    done: isDone,
                    doneAt: isDone ? new Date(currentDate.getTime() + startHour * 60 * 60 * 1000 + startMinute * 60 * 1000) : null
                };
                instances.push(instance);
            });
        }
        this.instances.push(...instances);
        return { user, hh, admin, kid1, kid2, tasks, instances };
    }
}
exports.MockDbService = MockDbService;
//# sourceMappingURL=mock-db.service.js.map
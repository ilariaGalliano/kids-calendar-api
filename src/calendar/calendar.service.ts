import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarService {
  // src/calendar/calendar.service.ts
constructor(private prisma: PrismaService) {
  console.log('Prisma in CalendarService:', prisma.constructor.name);
}


  list(householdId: string, from: string, to: string) {
    // per MVP: restituisce istanze già persistite nel range
    return this.prisma.taskInstance.findMany({
      where: {
        task: { householdId },
        date: { gte: new Date(from), lte: new Date(to) }
      },
      include: { task: true },
      orderBy: [{ date: 'asc' }]
    });
  }

  markDone(instanceId: string, done: boolean) {
    return this.prisma.taskInstance.update({
      where: { id: instanceId },
      data: { done, doneAt: done ? new Date() : null }
    });
  }
}

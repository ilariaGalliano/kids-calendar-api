import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  list(householdId: string) {
    return this.prisma.task.findMany({ where: { householdId, isActive: true } });
  }

  create(householdId: string, dto: any) {
    return this.prisma.task.create({
      data: { householdId, ...dto },
    });
  }
}

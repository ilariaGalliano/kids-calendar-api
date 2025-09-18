import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';

import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from './task.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}

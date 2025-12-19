import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';

// Usa SEMPRE questo import come tipo per il costruttore
import { PrismaService } from './prisma/prisma.service';

import { HouseholdsModule } from './households/households.module';
import { TasksModule } from './tasks/tasks.module';
import { CalendarModule } from './calendar/calendar.module';
import { ProfilesModule } from './profiles/profiles.modules';
import { ChildrenController } from './setting/children.controller';
import { ChildrenService } from './setting/children.service';
import { RoutineController } from './setting/routine.controller';
import { RoutineService } from './setting/routine.service';
import { TasksService } from './setting/tasks.service';
import { TasksController } from './setting/tasks.controller';
import { AppUsersModule } from './users/users.module';

// Import setting controllers and services

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,                 // <--- IMPORTANTE
    HouseholdsModule,
    ProfilesModule,
    TasksModule,
    CalendarModule,
    AppUsersModule
  ],
  controllers: [
    ChildrenController,
    TasksController,
    RoutineController,
  ],
  providers: [
    ChildrenService,
  TasksService,
    RoutineService,
  ],
})
export class AppModule {
  constructor(prisma: PrismaService) {
    // seed se mock
    if ((prisma as any).seedDemo) {
      (prisma as any).seedDemo();
    }
  }
}

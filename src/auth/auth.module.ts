// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CalendarModule } from '../calendar/calendar.module';
import { DatabaseModule } from '../database/database.module';
import { HouseholdsModule } from '../households/households.module';
import { PrismaService } from '../prisma/prisma.service';
import { ProfilesModule } from '../profiles/profiles.modules';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,            // <-- QUI
    HouseholdsModule,
    ProfilesModule,
    TasksModule,
    CalendarModule,
  ],
})
export class AppModule {
  constructor(prisma: PrismaService) {
    // seed solo se mock
    if ((prisma as any).seedDemo) {
      (prisma as any).seedDemo();
    }
  }
}

// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CalendarModule } from 'src/calendar/calendar.module';
import { DatabaseModule } from 'src/database/database.module';
import { HouseholdsModule } from 'src/households/households.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProfilesModule } from 'src/profiles/profiles.modules';
import { TasksModule } from 'src/tasks/tasks.module';

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
      console.log('✅ Mock DB seeded');
    }
    console.log('Prisma provider in AppModule:', prisma.constructor.name);
  }
}

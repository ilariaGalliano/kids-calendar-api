import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';

// Usa SEMPRE questo import come tipo per il costruttore
import { PrismaService } from './prisma/prisma.service';

import { HouseholdsModule } from './households/households.module';
import { TasksModule } from './tasks/tasks.module';
import { CalendarModule } from './calendar/calendar.module';
import { ProfilesModule } from './profiles/profiles.modules';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,                 // <--- IMPORTANTE
    HouseholdsModule,
    ProfilesModule,
    TasksModule,
    CalendarModule,
  ],
})
export class AppModule {
  constructor(prisma: PrismaService) {
    // seed se mock
    if ((prisma as any).seedDemo) {
      (prisma as any).seedDemo();
      console.log('✅ Mock DB seeded');
    }
    console.log('Prisma provider in AppModule:', prisma.constructor.name);
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';

// Usa SEMPRE questo import come tipo per il costruttore
import { PrismaService } from './prisma/prisma.service';

import { HouseholdsModule } from './households/households.module';
import { TasksModule } from './tasks/tasks.module';
import { CalendarModule } from './calendar/calendar.module';
import { RoutineController } from './setting/routine.controller';
import { RoutineService } from './setting/routine.service';
import { TasksService } from './setting/tasks.service';
import { TasksController } from './setting/tasks.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ChildrenModule } from './children/children.module';
import { ActivitiesModule } from './activities/activities.module';
import { RoutineModule } from './routine/routine.module';
import { ChildrenSettingModule } from './setting/children-setting.module';
import { Routine } from './routine/routine.entity';
import { TaskEntity } from './tasks/task.entity';
import { RoutineTask } from './routine/routine-task.entity';

// Import setting controllers and services

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting globale: 100 richieste per minuto per IP
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 1 minuto in millisecondi
      limit: 100,   // max 100 richieste per minuto
    }]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,  // IMPORTANTE: non sincronizzare in prod
      ssl: {
        rejectUnauthorized: false
      },
      // Ottimizzazioni per Vercel serverless
      poolSize: 1,
      connectTimeoutMS: 10000,
      extra: {
        max: 1,
        min: 0,
        idleTimeoutMillis: 10000,
        prepare: false, // richiesto per Supabase transaction mode pooler
      },
    }),
    TypeOrmModule.forFeature([Routine, TaskEntity, RoutineTask]),
    DatabaseModule,                 // <--- IMPORTANTE
    HouseholdsModule,
    TasksModule,
    CalendarModule,
    UserModule,
    ChildrenModule,
    ActivitiesModule,
    RoutineModule,
    ChildrenSettingModule,
    PrismaModule
  ],
  controllers: [
    TasksController,
    RoutineController,
  ],
  providers: [
    TasksService,
    RoutineService,
    // Rate limiting globale applicato a tutti gli endpoint
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
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

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './activity.entity';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { Children } from 'src/children/children.entity';
import { Routine } from 'src/routine/routine.entity';
import { RoutineTask } from 'src/routine/routine-task.entity';
import { TaskEntity } from 'src/tasks/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, Children, Routine, RoutineTask, TaskEntity])],
  providers: [ActivitiesService],
  controllers: [ActivitiesController],
})
export class ActivitiesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './activity.entity';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { Children } from '../children/children.entity';
import { Routine } from '../routine/routine.entity';
import { RoutineTask } from '../routine/routine-task.entity';
import { TaskEntity } from '../tasks/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, Children, Routine, RoutineTask, TaskEntity])],
  providers: [ActivitiesService],
  controllers: [ActivitiesController],
})
export class ActivitiesModule {}

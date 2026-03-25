import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './activity.entity';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { Children } from '../children/children.entity';
import { Routine } from '../routine/routine.entity';
import { RoutineTask } from '../routine/routine-task.entity';
import { TaskEntity } from '../tasks/task.entity';
import { RoutineActivityCompletion } from './routine-activity-completion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Activity, 
    Children, 
    Routine, 
    RoutineTask, 
    TaskEntity, 
    RoutineActivityCompletion
  ])],
  providers: [ActivitiesService],
  controllers: [ActivitiesController],
})
export class ActivitiesModule {}

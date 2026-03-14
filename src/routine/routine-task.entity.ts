import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Routine } from './routine.entity';
import { TaskEntity } from 'src/tasks/task.entity';

@Entity('routine_tasks')
@Unique(['routine_id', 'task_id'])
export class RoutineTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  routine_id: string;

  @Column({ type: 'uuid' })
  task_id: string;

  @Column({ type: 'integer', default: 0 })
  sort_order: number;

  @ManyToOne(() => Routine, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routine_id' })
  routine: Routine;

  @ManyToOne(() => TaskEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity;
}

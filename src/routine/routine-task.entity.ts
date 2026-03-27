import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Routine } from './routine.entity';
import { TaskEntity } from '../tasks/task.entity';

@Entity('routine_tasks')
// NOTE: Unique constraints are now managed by partial indexes in the database
// - routine_tasks_unique_per_specific_day: (routine_id, task_id, day_of_week) WHERE day_of_week IS NOT NULL
// - routine_tasks_unique_for_all_days: (routine_id, task_id) WHERE day_of_week IS NULL
export class RoutineTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  routine_id: string;

  @Column({ type: 'uuid' })
  task_id: string;

  @Column({ type: 'integer', default: 0 })
  sort_order: number;

  @Column({ type: 'integer', nullable: true })
  day_of_week: number | null;

  @Column({ type: 'time', nullable: true })
  start_time: string | null;

  @Column({ type: 'time', nullable: true })
  end_time: string | null;

  @Column({ type: 'integer', nullable: true })
  duration: number | null;

  @ManyToOne(() => Routine, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routine_id' })
  routine: Routine;

  @ManyToOne(() => TaskEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity;
}

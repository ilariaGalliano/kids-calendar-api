import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('routine_activity_completions')
@Index(['routine_id', 'task_id', 'date', 'child_id'], { unique: true })
export class RoutineActivityCompletion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  routine_id: string;

  @Column({ type: 'uuid' })
  task_id: string;

  @Column({ type: 'uuid' })
  child_id: string;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD

  @Column({ type: 'boolean', default: true })
  done: boolean;

  @CreateDateColumn()
  completed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  uncompleted_at: Date | null;
}

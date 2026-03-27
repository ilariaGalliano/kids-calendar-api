import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tasks')
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  color: string | null;

  @Column({ name: 'icon', type: 'text', nullable: true })
  icon: string | null;

  @Column({ type: 'integer', default: 5 })
  duration: number;

  @Column({ type: 'integer', default: 0 })
  reward: number;

  @Column({ name: 'start_time', type: 'time', nullable: true })
  start_time: string | null;

  @Column({ name: 'end_time', type: 'time', nullable: true })
  end_time: string | null;

  @Column({ name: 'created_by_id', type: 'uuid', nullable: true })
  created_by_id: string | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;
}

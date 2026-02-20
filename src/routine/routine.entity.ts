import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('routine')
export class Routine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  child_id: number;

  @Column({ type: 'integer' })
  user_id: number;

  @Column({ type: 'text' })
  nametask: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'integer' })
  day_of_week: number;

  @Column({ type: 'varchar', length: 5 })
  start_time: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  end_time: string;

  @Column({ default: false })
  isDone: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Routine } from './routine.entity';
import { Activity } from 'src/activities/activity.entity';

@Entity('routine_activities')
@Unique(['routine_id', 'activity_id'])
export class RoutineActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  routine_id: string;

  @Column({ type: 'uuid' })
  activity_id: string;

  @Column({ type: 'integer', default: 0 })
  sort_order: number;

  @ManyToOne(() => Routine, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routine_id' })
  routine: Routine;

  @ManyToOne(() => Activity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;
}

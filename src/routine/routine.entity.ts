import { Activity } from 'src/activities/activity.entity';
import { Children } from 'src/children/children.entity';
import { User } from 'src/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('routine')
export class Routine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ...existing code...

  @ManyToOne(() => Children, (child) => child.routine, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'child_id' })
  children: Children;

  @Column({ name: 'child_id', nullable: true })
  child_id: string;

  @ManyToOne(() => User, (user) => user.children, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Activity, (activity) => activity.children)
  activities: Activity[];

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

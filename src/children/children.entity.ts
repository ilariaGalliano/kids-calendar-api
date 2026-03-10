import { Activity } from "src/activities/activity.entity";
import { Routine } from "src/routine/routine.entity";
import { User } from "src/user/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class Children {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    user_id: string;

    @Column()
    name: string

    @Column()
    years: string;

    @Column({ nullable: true })
    sex: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ name: 'icon', nullable: true })
    icon: string;

    @ManyToOne(() => User, (user) => user.children, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Activity, (activity) => activity.children)
    activities: Activity[];

    @OneToMany(() => Routine, (routine) => routine.children)
    routine: Routine[];
}
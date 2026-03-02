import { Activity } from "src/activities/activity.entity";
import { User } from "src/user/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, PrimaryColumn, OneToMany } from "typeorm";

@Entity()
export class Children {
    @PrimaryColumn('uuid')
    id: string;

    @Column('uuid')
    user_id: string;

    @Column()
    name: string

    @Column()
    years: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ name: 'icon', nullable: true })
    icon: string;

    @ManyToOne(() => User, (user) => user.children, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Activity, (activity) => activity.children)
    activities: Activity[];
}
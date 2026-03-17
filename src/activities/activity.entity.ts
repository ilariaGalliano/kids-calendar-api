import { Children } from "src/children/children.entity";
import { User } from "src/user/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from "typeorm";

@Entity('activities')
export class Activity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    name_activity: string;

    @Column({ type: 'integer', nullable: true })
    value: number;

    @Column({ type: 'timestamptz' })
    date_start: Date;

    @Column({ type: 'timestamptz', nullable: true })
    date_end: Date;

    @Column({ default: false })
    done: boolean;

    @Column({ type: 'integer', nullable: true })
    timer: number;

    @Column({ type: 'timestamptz', nullable: true })
    expire_time: Date;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updated_at: Date;

    @Column({ type: 'uuid' })
    user_id: string;

    @Column({ type: 'uuid' })
    children_id: string;

    @ManyToOne(() => User, (user) => user.children, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Children, (children) => children.activities, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'children_id' })
    children: Children;
}

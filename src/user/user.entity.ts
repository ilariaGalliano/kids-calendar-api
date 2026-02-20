import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string

    @Column({ nullable: true })
    password_hash: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date

    @Column({ name: 'avatar', nullable: true })
    avatarUrl: string;

    @Column({ nullable: true })
    firstname: string

    @Column({ nullable: true })
    lastname: string
}
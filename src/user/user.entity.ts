import { Children } from "../children/children.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryColumn('uuid')
    id: string; // SAME AS auth.users.id

    @Column()
    email: string

    @Column({ nullable: true })
    password_hash: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date

    @Column({ name: 'avatar', nullable: true })
    avatar: string;

    @Column({ nullable: true })
    firstname: string

    @Column({ nullable: true })
    lastname: string

    @Column({ name: 'redemption_pin', type: 'text', nullable: true })
    redemption_pin: string | null;

    @OneToMany(() => Children, (child) => child.user)
    children: Children[];
}
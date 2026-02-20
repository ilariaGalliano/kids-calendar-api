import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Children{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @Column()
    years: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date

    @Column({ name: 'icon', nullable: true })
    icon: string;
}
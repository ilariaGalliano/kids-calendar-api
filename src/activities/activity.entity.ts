import { StringDecoder } from "node:string_decoder";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Activity {
    @PrimaryGeneratedColumn('uuid')
    id: StringDecoder;

    @Column({ type: 'text' })
    name_activity: string;

    @Column({ type: 'integer', nullable: true })
    value: number;

    @Column({ type: 'timestamptz' })
    date_start: Date;

    @Column({ type: 'timestamptz' })
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
}

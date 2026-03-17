import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum ProfileType {
    adult = 'adult',
    child = 'child'
}

export enum ProfileRole {
    admin = 'admin',
    member = 'member'
}

@Entity('profiles')
export class Profile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'household_id' })
    householdId: string;

    @Column({ name: 'display_name' })
    displayName: string;

    @Column({ name: 'avatar', nullable: true })
    avatarUrl: string;

    @Column({ nullable: true })
    color: string;

    @Column({ default: false })
    pinned: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'created_by_id', nullable: true })
    createdById: string;

    @Column({
        type: 'enum',
        enum: ProfileType
    })
    type: ProfileType;

    @Column({
        type: 'enum',
        enum: ProfileRole
    })
    role: ProfileRole;
}

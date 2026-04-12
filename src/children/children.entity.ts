import { Activity } from "../activities/activity.entity";
import { Routine } from "../routine/routine.entity";
import { User } from "../user/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class Children {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    user_id: string;

    @Column()
    name: string

    @Column({ nullable: true })
    years: string; // kept nullable for legacy, not used for new records

    @Column({ type: 'date', nullable: true })
    birth_date: string | null; // YYYY-MM-DD

    /** Computed age in years from birth_date (not a DB column) */
    get age(): number | null {
        if (!this.birth_date) return null;
        const today = new Date();
        const dob = new Date(this.birth_date);
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        return age;
    }

    @Column({ nullable: true })
    sex: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ name: 'icon', nullable: true })
    icon: string;

    @Column({ type: 'int', default: 0 })
    point: number;

    @ManyToOne(() => User, (user) => user.children, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Activity, (activity) => activity.children)
    activities: Activity[];

    @OneToMany(() => Routine, (routine) => routine.children)
    routine: Routine[];
}
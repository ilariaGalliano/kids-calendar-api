import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Children } from './children.entity';
import { User } from '../user/user.entity';

@Injectable()
export class ChildrenService {
    constructor(
        @InjectRepository(Children)
        private childrenRepository: Repository<Children>,
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {}

    /** Ensures the user row exists in public.user before any child insert (prevents FK violation) */
    private async upsertUser(userId: string, email?: string): Promise<void> {
        await this.userRepository
            .createQueryBuilder()
            .insert()
            .into(User)
            .values({ id: userId, email: email ?? `${userId}@unknown.local` })
            .orIgnore() // ON CONFLICT DO NOTHING
            .execute();
    }

    async create(userData: Partial<Children> & { user_email?: string }): Promise<Children> {
        if (userData.user_id) {
            await this.upsertUser(userData.user_id, userData.user_email);
        }
        const children = this.childrenRepository.create(userData);
        return this.childrenRepository.save(children);
    }

    async createBatch(childrenData: (Partial<Children> & { user_email?: string })[]): Promise<Children[]> {
        if (childrenData.length > 0 && childrenData[0].user_id) {
            await this.upsertUser(childrenData[0].user_id, childrenData[0].user_email);
        }
        const children = this.childrenRepository.create(childrenData);
        return this.childrenRepository.save(children);
    }

    async findAll(): Promise<Children[]> {
        return this.childrenRepository.find();
    }

    async findOne(id: string): Promise<Children> {
        const children = await this.childrenRepository.findOneBy({ id });
        if(!children) {
            throw new NotFoundException(`Children with ID ${id}not found`);
        }
        return children;
    }

    async update(id: string, updatedData: Partial<Children>): Promise<Children> {
        const children = await this.childrenRepository.findOneBy({ id });
        if(!children) {
            throw new NotFoundException(`Children with ID {id} not found`);
        }
        const updated = Object.assign(children, updatedData);
        return this.childrenRepository.save(updated);
    }

    async delete(id: string): Promise<{ message: string }> {
        const result = await this.childrenRepository.delete(id);

        if(result.affected === 0) {
            throw new NotFoundException(`Children with ID ${id} not found`);
        }
        return { message: `Children with ID ${id} has been deleted successfully!`}
    }

    async findByUserId(userId: string): Promise<Children[]> {
        return this.childrenRepository.find({ where: { user_id: userId } });
    }

    async search(filters: { name?: string; department?:string}): Promise<Children[]> {
        const query = this.childrenRepository.createQueryBuilder('children');

        if(filters.name){
            query.andWhere('children.name ILIKE :name', {name: `%${filters.name}%`});
        }
        if(filters.department){
            query.andWhere('children.department = :dept', {dept: filters.department});
        }
        return query.getMany();
    }
}

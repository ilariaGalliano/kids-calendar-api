import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {}

    async create(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: id.toString() });
        if(!user) {
            throw new NotFoundException(`User with ID ${id}not found`);
        }
        return user;
    }

    async update(id: number, updatedData: Partial<User>): Promise<User> {
        const user = await this.userRepository.findOneBy({ id: id.toString() });
        if(!user) {
            throw new NotFoundException(`User with ID {id} not found`);
        }
        const updated = Object.assign(user, updatedData);
        return this.userRepository.save(updated);
    }

    async delete(id: number): Promise<{ message: string }> {
        const result = await this.userRepository.delete(id);

        if(result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return { message: `User with ID ${id} has been deleted successfully!`}
    }

    async hasPin(userId: string): Promise<boolean> {
        const user = await this.userRepository.findOneBy({ id: userId });
        return !!(user?.parent_pin);
    }

    async setPin(userId: string, pin: string): Promise<void> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) throw new NotFoundException('User not found');
        const hash = await bcrypt.hash(pin, 10);
        user.parent_pin = hash;
        await this.userRepository.save(user);
    }

    async verifyPin(userId: string, pin: string): Promise<boolean> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user || !user.parent_pin) return false;
        return bcrypt.compare(pin, user.parent_pin);
    }

    async search(filters: { name?: string; department?:string}): Promise<User[]> {
        const query = this.userRepository.createQueryBuilder('user');

        if(filters.name){
            query.andWhere('user.name ILIKE :name', {name: `%${filters.name}%`});
        }
        if(filters.department){
            query.andWhere('user.department = :dept', {dept: filters.department});
        }
        return query.getMany();
    }
}

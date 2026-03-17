import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Children } from '../children/children.entity';

@Injectable()
export class ChildrenSettingService {
  constructor(
    @InjectRepository(Children)
    private childrenRepository: Repository<Children>
  ) {}

  async getAllChildrenByUserId(userId: string): Promise<Children[]> {
    return this.childrenRepository.find({ where: { user_id: userId } });
  }

  async addChild(dto: any): Promise<Children> {
    const child = this.childrenRepository.create({
      id: dto.id,
      name: dto.name,
      age: dto.age,
      years: dto.years !== undefined ? dto.years : 0, // Provide a default value if years is not present
      sex: dto.sex,
      avatar: dto.avatar,
      user_id: dto.user_id,
      icon: dto.icon,
      activities: dto.activities,
      created_at: dto.created_at,
      user: dto.user
    } as any);
    return await this.childrenRepository.save(child) as unknown as Children;
  }

  async updateChild(id: string, dto: any): Promise<Children> {
    const child = await this.childrenRepository.findOneBy({ id });
    if (!child) {
      throw new NotFoundException(`Child with ID ${id} not found`);
    }
    const updated = Object.assign(child, dto);
    return this.childrenRepository.save(updated);
  }

  async deleteChild(id: string): Promise<{ message: string }> {
    const result = await this.childrenRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Child with ID ${id} not found`);
    }
    return { message: `Child with ID ${id} has been deleted successfully` };
  }
}
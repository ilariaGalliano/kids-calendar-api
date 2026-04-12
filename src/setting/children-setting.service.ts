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

  async getAllChildrenByUserId(userId: string): Promise<any[]> {
    const children = await this.childrenRepository.find({ where: { user_id: userId } });
    return children.map((child) => {
      let years: number | null = null;
      if (child.birth_date) {
        const today = new Date();
        const dob = new Date(child.birth_date);
        years = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) years--;
      }
      return { ...child, years };
    });
  }

  async addChild(dto: any): Promise<Children> {
    const child = this.childrenRepository.create({
      name: dto.name,
      birth_date: dto.birth_date ?? null,
      sex: dto.sex,
      avatar: dto.avatar,
      user_id: dto.user_id,
      icon: dto.icon,
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
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Children } from '../children/children.entity';

@Injectable()
export class ChildrenSettingService {
  private supabase: SupabaseClient | null = null;

  constructor(
    @InjectRepository(Children)
    private childrenRepository: Repository<Children>
  ) {}

  private getSupabase(): SupabaseClient {
    if (!this.supabase) {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) {
        throw new InternalServerErrorException('Supabase storage not configured');
      }
      this.supabase = createClient(url, key);
    }
    return this.supabase;
  }

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
      avatar: dto.avatar ?? null,
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

  async uploadAvatarFile(childId: string, file: Express.Multer.File): Promise<Children> {
    const supabase = this.getSupabase();
    const bucketName = 'avatars';
    const path = childId;

    // Ensure the storage bucket exists (idempotent)
    const { error: bucketError } = await supabase.storage.createBucket(bucketName, { public: true });
    if (bucketError && !bucketError.message?.includes('already exists')) {
      throw new InternalServerErrorException(`Storage bucket creation failed: ${bucketError.message}`);
    }

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(path, file.buffer, { contentType: file.mimetype, upsert: true });

    if (error) {
      throw new InternalServerErrorException(`Storage upload failed: ${error.message}`);
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    // Append cache-buster so browsers pick up the new image after upsert
    const publicUrl = `${data.publicUrl}?v=${Date.now()}`;
    return this.updateChild(childId, { avatar: publicUrl });
  }
}
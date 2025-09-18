import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async create(householdId: string, data: { displayName: string; type: 'adult'|'child'; role: 'admin'|'member'; color?: string }) {
    const count = await this.prisma.profile.count({ where: { householdId } });
    if (count >= 8) throw new BadRequestException('Limite 8 profili raggiunto');
    return this.prisma.profile.create({ data: { householdId, ...data } });
  }
}

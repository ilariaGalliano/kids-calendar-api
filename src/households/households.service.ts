import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HouseholdsService {
  constructor(private prisma: PrismaService) {}

  get(id: string) {
    return this.prisma.household.findUnique({ where: { id } });
  }

  async listProfiles(householdId: string) {
    const hh = await this.get(householdId);
    if (!hh) throw new NotFoundException('Household non trovato');
    return this.prisma.profile.findMany({ where: { householdId } });
  }
}

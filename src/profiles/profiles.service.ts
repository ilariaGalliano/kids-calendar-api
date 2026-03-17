import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppUser, Household } from '@prisma/client';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) { }

  async create(
    householdId: string,
    data: { displayName: string; type: 'adult' | 'child'; role: 'admin' | 'member'; color?: string; avatar?: string }
  ) {
    const count = await this.prisma.profile.count({ where: { householdId } });
    if (count >= 8) throw new BadRequestException('Limite 8 profili raggiunto');
    return this.prisma.profile.create({ data: { householdId, ...data } });
  }

  // New method for API: create a child profile for a family
  async createChildProfile(householdId: string, displayName: string, avatar?: string) {
    return this.create(householdId, {
      displayName,
      type: 'child',
      role: 'member',
      avatar,
    });
  }

  async ensureAppUser(supabaseAppUser: any) {
    return this.prisma.appUser.upsert({
      where: { email: supabaseAppUser.email },
      update: {},
      create: {
        id: supabaseAppUser.sub,
        email: supabaseAppUser.email,
        passwordHash: 'SUPABASE'
      }
    });
  }
}
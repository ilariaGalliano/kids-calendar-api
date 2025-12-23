import { Injectable } from '@nestjs/common';
import { AppUser, Household, Profile } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

function clean(value: unknown): string {
  if (typeof value !== 'string') return '';
  
  // Remove null bytes and control characters
  return value
    .replace(/\0/g, '') // Remove null bytes (0x00)
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove all control characters
    .trim();
}

@Injectable()
export class AppUsersService {
  constructor(private prisma: PrismaService) {}

  async bootstrapAppUser(raw: any) {
    try {
      console.log('RAW USER:', raw);

      // Sanitize and validate input
      const userId = clean(raw.sub || raw.id);
      const userEmail = clean(raw.email);

      if (!userId || !userEmail) {
        throw new Error('Invalid user data: missing id or email');
      }

      const user = {
        id: userId,
        email: userEmail,
      };

      console.log('CLEAN USER:', user);

      const appUser = await this.prisma.appUser.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          createdAt: new Date(),
        },
        create: {
          id: user.id,
          email: user.email,
          passwordHash: 'SUPABASE',
        },
      });

      console.log('APP USER SAVED:', appUser);

      const household = await this.ensureHousehold(appUser);
      const profile = await this.ensureAdminProfile(appUser, household);

      return { appUser, household, profile };
    } catch (err) {
      console.error('🔥 BOOTSTRAP ERROR:', err);
      throw err;
    }
  }

  private async ensureHousehold(appUser: AppUser): Promise<Household> {
    const existing = await this.prisma.household.findFirst({
      where: { ownerId: appUser.id },
    });

    if (existing) return existing;

    return this.prisma.household.create({
      data: {
        name: 'La mia famiglia',
        ownerId: appUser.id,
      },
    });
  }

  private async ensureAdminProfile(
    appUser: AppUser,
    household: Household,
  ): Promise<Profile> {
    const existing = await this.prisma.profile.findFirst({
      where: {
        householdId: household.id,
        createdById: appUser.id,
      },
    });

    if (existing) return existing;

    return this.prisma.profile.create({
      data: {
        householdId: household.id,
        displayName: 'Admin',
        type: 'adult',
        role: 'admin',
        createdById: appUser.id,
        pinned: true,
      },
    });
  }
}
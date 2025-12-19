import { Injectable } from '@nestjs/common';
import { AppUser, Household } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AppUsersService {
    
    constructor(private prisma: PrismaService) { }
      
    async bootstrapAppUser(supabaseAppUser: any) {
        const AppUser = await this.ensureAppUser(supabaseAppUser);
        const household = await this.ensureHousehold(AppUser);
        const profile = await this.ensureAdminProfile(AppUser, household);

        return {
            AppUser,
            household,
            profile
        };
    }

    private async ensureAppUser(supabaseAppUser: any) {
        console.log('PRISMA KEYS:', Object.keys(this.prisma));
        return this.prisma.appUser.upsert({
            where: { email: supabaseAppUser.email },
            update: {},
            create: {
                id: supabaseAppUser.sub, // UUID Supabase
                email: supabaseAppUser.email,
                passwordHash: 'SUPABASE'
            }
        });
    }

    private async ensureHousehold(AppUser: AppUser) {
        const existing = await this.prisma.household.findFirst({
            where: { ownerId: AppUser.id }
        });

        if (existing) return existing;

        return this.prisma.household.create({
            data: {
                name: 'La mia famiglia',
                ownerId: AppUser.id
            }
        });
    }

    private async ensureAdminProfile(
        AppUser: AppUser,
        household: Household
    ) {
        const existing = await this.prisma.profile.findFirst({
            where: {
                householdId: household.id,
                createdById: AppUser.id
            }
        });

        if (existing) return existing;

        return this.prisma.profile.create({
            data: {
                householdId: household.id,
                displayName: AppUser.email.split('@')[0],
                type: 'adult',
                role: 'admin',
                createdById: AppUser.id,
                pinned: true
            }
        });
    }
}


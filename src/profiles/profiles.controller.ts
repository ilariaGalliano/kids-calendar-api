import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { Profile } from './profile.entity';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  // @Post()
  // async createProfile(@Body() body: Partial<Profile>): Promise<Profile> {
  //   if (!body.householdId) {
  //     throw new Error('householdId is required');
  //   }
  //   if (!body.displayName) {
  //     throw new Error('displayName is required');
  //   }
  //   return this.profilesService.create(
  //     body.householdId,
  //     {
  //       displayName: body.displayName,
  //       type: body.type || 'child',
  //       role: body.role || 'member',
  //       color: body.color,
  //       avatar: body.avatar,
  //     }
  //   );
  // }

  // @UseGuards(SupabaseJwtGuard)
  // @Get()
  // async findAll(@Query('householdId') householdId?: string): Promise<Profile[]> {
  //   return this.profilesService.findAll(householdId);
  // }

  // @Get('search')
  // async searchProfiles(
  //   @Query('displayName') displayName?: string,
  //   @Query('householdId') householdId?: string
  // ): Promise<Profile[]> {
  //   return this.profilesService.search({ displayName, householdId });
  // }

  // @Get(':id')
  // async findOne(@Param('id') id: string): Promise<Profile> {
  //   return this.profilesService.findOne(id);
  // }

  // @Put(':id')
  // async updateProfile(
  //   @Param('id') id: string,
  //   @Body() body: Partial<Profile>
  // ): Promise<Profile> {
  //   return this.profilesService.update(id, body);
  // }

  // @Delete(':id')
  // async deleteProfile(@Param('id') id: string): Promise<{ message: string }> {
  //   return this.profilesService.delete(id);
  // }
}

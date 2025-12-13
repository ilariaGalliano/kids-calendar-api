import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';

@UseGuards(JwtStrategy)
@Controller('households/:householdId/profiles')
export class ProfilesController {
  constructor(private readonly svc: ProfilesService) { }

  @Post()
  create(@Param('householdId') householdId: string, @Body() dto: { displayName: string; type: 'adult' | 'child'; role: 'admin' | 'member'; color?: string }) {
    return this.svc.create(householdId, dto);
  }

  @Post()
  async createProfile(
    @Body() body: { householdId: string; displayName: string; avatar?: string },
  ) {
    // Always create as child, not admin
    return this.svc.create(body.householdId, {
      displayName: body.displayName,
      type: 'child',
      role: 'member',
      color: body.avatar, // or handle avatar separately if needed
    });
  }
}

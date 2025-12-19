import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppUsersService } from './users.service';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';

@Controller('api/v1/AppUsers')
export class AppUsersController {
  constructor(private readonly AppUsersService: AppUsersService) {}

  @UseGuards(SupabaseJwtGuard)
  @Get('me')
  async me(@Req() req) {
    return this.AppUsersService.bootstrapAppUser(req.AppUser);
  }
}
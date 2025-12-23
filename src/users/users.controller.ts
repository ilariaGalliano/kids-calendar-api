import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppUsersService } from './users.service';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';

@Controller('api/v1/users')
@UseGuards(SupabaseJwtGuard)
export class AppUsersController {
  constructor(private readonly usersService: AppUsersService) {}

  @Get('me')
  async me(@Req() req) {
    return this.usersService.bootstrapAppUser(req.user);
  }
}

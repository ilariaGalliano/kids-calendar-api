import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { HouseholdsService } from './households.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';

@UseGuards(JwtStrategy)
@Controller('households')
export class HouseholdsController {
  constructor(private readonly svc: HouseholdsService) {}

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @Get(':id/profiles')
  profiles(@Param('id') id: string) {
    return this.svc.listProfiles(id);
  }
}

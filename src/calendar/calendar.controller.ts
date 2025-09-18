import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';

@UseGuards(JwtStrategy)
@Controller('calendar')
export class CalendarController {
  constructor(private readonly svc: CalendarService) {}

  @Get()
  list(@Query('householdId') householdId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.svc.list(householdId, from, to);
  }

  @Patch(':id/done')
  done(@Param('id') id: string, @Body() body: { done: boolean }) {
    return this.svc.markDone(id, body.done);
  }
}

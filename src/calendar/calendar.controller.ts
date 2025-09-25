import { Controller, Get, Patch, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';

@UseGuards(JwtStrategy)
@Controller('calendar')
export class CalendarController {
  private readonly logger = new Logger(CalendarController.name);

  constructor(private readonly svc: CalendarService) {}

  @Get()
  list(@Query('householdId') householdId: string, @Query('from') from: string, @Query('to') to: string) {
    this.logger.log(`GET /calendar household=${householdId} from=${from} to=${to}`);
    return this.svc.list(householdId, from, to);
  }

  @Patch(':id/done')
  done(@Param('id') id: string, @Body() body: { done: boolean }) {
    return this.svc.markDone(id, body.done);
  }
}

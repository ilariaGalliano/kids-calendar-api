import { Controller, Get, Patch, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { CalendarDay, CalendarWeek, CalendarResponse } from './calendar.interfaces';

@UseGuards(JwtStrategy)
@Controller('calendar')
export class CalendarController {
  private readonly logger = new Logger(CalendarController.name);

  constructor(private readonly svc: CalendarService) {}

  // Endpoint originale per compatibilità
  @Get()
  list(@Query('householdId') householdId: string, @Query('from') from: string, @Query('to') to: string) {
    this.logger.log(`GET /calendar household=${householdId} from=${from} to=${to}`);
    return this.svc.list(householdId, from, to);
  }

  // Nuovo endpoint per calendario mensile completo
  @Get('month')
  async getMonthCalendar(
    @Query('householdId') householdId: string,
    @Query('year') year: string,
    @Query('month') month: string
  ): Promise<CalendarResponse> {
    this.logger.log(`GET /calendar/month household=${householdId} year=${year} month=${month}`);
    return this.svc.getCalendar(householdId, parseInt(year), parseInt(month));
  }

  // Endpoint per calendario settimanale
  @Get('week')
  async getWeekCalendar(
    @Query('householdId') householdId: string,
    @Query('date') date: string
  ): Promise<CalendarWeek> {
    this.logger.log(`GET /calendar/week household=${householdId} date=${date}`);
    return this.svc.getWeekCalendar(householdId, date);
  }

  // Endpoint per calendario giornaliero
  @Get('day')
  async getDayCalendar(
    @Query('householdId') householdId: string,
    @Query('date') date: string
  ): Promise<CalendarDay> {
    this.logger.log(`GET /calendar/day household=${householdId} date=${date}`);
    return this.svc.getDayCalendar(householdId, date);
  }

  @Patch(':id/done')
  done(@Param('id') id: string, @Body() body: { done: boolean }) {
    return this.svc.markDone(id, body.done);
  }
}

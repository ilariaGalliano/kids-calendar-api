import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards, Req } from '@nestjs/common';
import { Activity } from './activity.entity';
import { ActivitiesService } from './activities.service';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import type { Request } from 'express';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  async create(@Body() body: Partial<Activity>): Promise<Activity> {
    return this.activitiesService.create(body);
  }

  @Get()
  async findAll(): Promise<Activity[]> {
    return this.activitiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Activity> {
    return this.activitiesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<Activity>,
  ): Promise<Activity> {
    return this.activitiesService.update(id, body);
  }

  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() body: Partial<Activity>,
  ): Promise<Activity> {
    return this.activitiesService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.activitiesService.delete(id);
  }

  // GET /activities/child/:childId - Tutte le activities per un child
  @Get('child/:childId')
  async findByChild(@Param('childId') childId: string): Promise<Activity[]> {
    return this.activitiesService.findByChildId(childId);
  }

  // GET /activities/child/:childId/day?date=2026-03-06
  @Get('child/:childId/day')
  async findByDay(
    @Param('childId') childId: string,
    @Query('date') date: string
  ): Promise<Activity[]> {
    return this.activitiesService.findByDay(childId, date);
  }

  // GET /activities/child/:childId/week?startDate=2026-03-03
  @Get('child/:childId/week')
  async findByWeek(
    @Param('childId') childId: string,
    @Query('startDate') startDate: string
  ): Promise<Activity[]> {
    return this.activitiesService.findByWeek(childId, startDate);
  }

  // GET /activities/child/:childId/now
  @Get('child/:childId/now')
  async findByNow(@Param('childId') childId: string): Promise<Activity[]> {
    return this.activitiesService.findByNow(childId);
  }

  // GET /activities/me/week?startDate=2026-03-03 - Tutte le activities per tutti i children dell'utente loggato
  @UseGuards(SupabaseJwtGuard)
  @Get('me/week')
  async findMyWeek(
    @Req() req: Request,
    @Query('startDate') startDate: string
  ): Promise<Activity[]> {
    const user = req.user as { sub?: string } | undefined;
    if (!user?.sub) return [];
    return this.activitiesService.findWeekForUser(user.sub, startDate);
  }

  // GET /activities/me/day?date=2026-03-14 - Giorno per tutti i children dell'utente loggato
  @UseGuards(SupabaseJwtGuard)
  @Get('me/day')
  async findMyDay(
    @Req() req: Request,
    @Query('date') date: string
  ): Promise<Activity[]> {
    const user = req.user as { sub?: string } | undefined;
    if (!user?.sub) return [];
    return this.activitiesService.findDayForUser(user.sub, date);
  }

  // GET /activities/me/now - Ora corrente per tutti i children dell'utente loggato
  @UseGuards(SupabaseJwtGuard)
  @Get('me/now')
  async findMyNow(@Req() req: Request): Promise<Activity[]> {
    const user = req.user as { sub?: string } | undefined;
    if (!user?.sub) return [];
    return this.activitiesService.findNowForUser(user.sub);
  }

  // POST /activities/update-schedule - Salva modifiche drag & drop
  @UseGuards(SupabaseJwtGuard)
  @Post('update-schedule')
  async updateSchedule(
    @Req() req: Request,
    @Body() updateScheduleDto: any
  ): Promise<{ success: boolean; updated: number; errors: string[] }> {
    const user = req.user as { sub?: string } | undefined;
    if (!user?.sub) {
      return { success: false, updated: 0, errors: ['User not authenticated'] };
    }

    const result = await this.activitiesService.updateSchedule(
      user.sub,
      updateScheduleDto.movedTasks
    );

    return {
      success: result.errors.length === 0,
      updated: result.updated,
      errors: result.errors
    };
  }

  // POST /activities/update-order - Aggiorna l'ordine dei task (sort_order)
  @UseGuards(SupabaseJwtGuard)
  @Post('update-order')
  async updateOrder(
    @Req() req: Request,
    @Body() updateOrderDto: { orderUpdates: Array<{ taskId: string; childId: string; day: string; newPosition: number }> }
  ): Promise<{ success: boolean; updated: number; errors: string[] }> {
    const user = req.user as { sub?: string } | undefined;
    if (!user?.sub) {
      return { success: false, updated: 0, errors: ['User not authenticated'] };
    }

    const result = await this.activitiesService.updateTaskOrder(
      user.sub,
      updateOrderDto.orderUpdates
    );

    return {
      success: result.errors.length === 0,
      updated: result.updated,
      errors: result.errors
    };
  }
}

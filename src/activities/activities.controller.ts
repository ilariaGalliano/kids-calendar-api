import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards, Req } from '@nestjs/common';
import { Activity } from './activity.entity';
import { ActivitiesService } from './activities.service';
import { SupabaseJwtGuard } from 'src/auth/supabase-jwt.guard';
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
    if (!user?.sub) {
      return [];
    }
    return this.activitiesService.findWeekForUser(user.sub, startDate);
  }
}

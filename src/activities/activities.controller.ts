import { Body, Controller, Delete, Get, Param, Patch, Post, Put, ParseIntPipe } from '@nestjs/common';
import { Activity } from './activity.entity';
import { ActivitiesService } from './activities.service';

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
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Activity> {
    return this.activitiesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Activity>,
  ): Promise<Activity> {
    return this.activitiesService.update(id, body);
  }

  @Patch(':id')
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Activity>,
  ): Promise<Activity> {
    return this.activitiesService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.activitiesService.delete(id);
  }
}

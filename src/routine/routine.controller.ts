import { Body, Controller, Delete, Get, Param, Patch, Post, Put, ParseIntPipe, Query } from '@nestjs/common';
import { RoutineService } from './routine.service';
import { Routine } from './routine.entity';

@Controller('routine')
export class RoutineController {
  constructor(private readonly routineService: RoutineService) {}

  @Post()
  async create(@Body() body: Partial<Routine>): Promise<Routine> {
    return this.routineService.create(body);
  }

  @Get()
  async findAll(): Promise<Routine[]> {
    return this.routineService.findAll();
  }

  @Get('by-child/:childId')
  async findByChild(@Param('childId', ParseIntPipe) childId: number): Promise<Routine[]> {
    return this.routineService.findByChildId(childId);
  }

  @Get('by-day/:dayOfWeek')
  async findByDay(@Param('dayOfWeek', ParseIntPipe) dayOfWeek: number): Promise<Routine[]> {
    return this.routineService.findByDayOfWeek(dayOfWeek);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Routine> {
    return this.routineService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Routine>,
  ): Promise<Routine> {
    return this.routineService.update(id, body);
  }

  @Patch(':id')
  async patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Routine>,
  ): Promise<Routine> {
    return this.routineService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.routineService.delete(id);
  }
}

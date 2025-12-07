import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { RoutineService } from './routine.service';

@Controller('settings/routine')
export class RoutineController {
  constructor(private readonly routineService: RoutineService) {}

  // 1. Get routines for a child
  @Get()
  getRoutines(@Query('childId') childId: string) {
    return this.routineService.getRoutines(childId);
  }

  // 2. Create a new routine for a child
  @Post()
  createRoutine(@Body() dto: CreateRoutineDto) {
    return this.routineService.createRoutine(dto);
  }

  // 3. Update a routine
  @Put(':id')
  updateRoutine(@Param('id') id: string, @Body() dto: UpdateRoutineDto) {
    return this.routineService.updateRoutine(id, dto);
  }

  // 4. Delete a routine
  @Delete(':id')
  deleteRoutine(@Param('id') id: string) {
    return this.routineService.deleteRoutine(id);
  }
}

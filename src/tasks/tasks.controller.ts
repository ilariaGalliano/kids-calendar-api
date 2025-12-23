import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TasksService } from './task.service';
import { SupabaseJwtGuard } from 'src/auth/supabase-jwt.guard';

@UseGuards(SupabaseJwtGuard)
@Controller('households/:householdId/tasks')
export class TasksController {
  constructor(private readonly svc: TasksService) {}

  @Get()
  list(@Param('householdId') householdId: string) {
    return this.svc.list(householdId);
  }

  @Post()
  create(@Param('householdId') householdId: string, @Body() dto: any) {
    return this.svc.create(householdId, dto);
  }
}

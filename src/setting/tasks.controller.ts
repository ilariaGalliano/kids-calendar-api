import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { SupabaseJwtGuard } from 'src/auth/supabase-jwt.guard';

@UseGuards(SupabaseJwtGuard)
@Controller('settings/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // 1. Get tasks by time of day (morning, afternoon, evening)
  @Get()
  getTasks(@Req() req: any, @Query('timeOfDay') timeOfDay?: string) {
    return this.tasksService.getTasks(req.user?.sub, timeOfDay);
  }

  // 2. Create a new task
  @Post()
  createTask(@Req() req: any, @Body() dto: CreateTaskDto) {
    const task = this.tasksService.createTask(req.user?.sub, dto);
    return task;
  }

  // 3. Update a task
  @Put(':id')
  updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.updateTask(id, dto);
  }

  // 4. Delete a task
  @Delete(':id')
  deleteTask(@Param('id') id: string) {
    return this.tasksService.deleteTask(id);
  }
}

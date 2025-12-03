import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('settings/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // 1. Get tasks by time of day (morning, afternoon, evening)
  @Get()
  getTasks(@Query('timeOfDay') timeOfDay?: string) {
    return this.tasksService.getTasks(timeOfDay);
  }

  // 2. Create a new task
  @Post()
  createTask(@Body() dto: CreateTaskDto) {
    return this.tasksService.createTask(dto);
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

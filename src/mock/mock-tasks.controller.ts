import { Controller, Get, Param } from '@nestjs/common';
import { MockDbService } from './mock-db.service';

@Controller('mock/tasks')
export class MockTasksController {
  constructor(private readonly mockDb: MockDbService) {}

  // Get all tasks for a household
  @Get(':householdId')
  async getTasks(@Param('householdId') householdId: string) {
    return this.mockDb.tasks.filter(t => t.householdId === householdId);
  }
}

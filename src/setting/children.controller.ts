import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';

@Controller('settings/children')
export class ChildrenController {
  // 1. Get all children
  @Get()
  getAllChildren() {
    // ...
  }

  // 2. Add a new child
  @Post()
  addChild(@Body() dto: any) {
    // ...
  }

  // 3. Update child info (number, name, etc.)
  @Put(':id')
  updateChild(@Param('id') id: string, @Body() dto: any) {
    // ...
  }

  // 4. Delete a child
  @Delete(':id')
  deleteChild(@Param('id') id: string) {
    // ...
  }
}

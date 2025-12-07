import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ChildrenService } from './children.service';

@Controller('settings/children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  // 1. Get all children
  @Get()
  getAllChildren() {
    return this.childrenService.getAllChildren();
  }

  // 2. Add a new child
  @Post()
  addChild(@Body() dto: any) {
    return this.childrenService.addChild(dto);
  }

  // 3. Update child info (number, name, etc.)
  @Put(':id')
  updateChild(@Param('id') id: string, @Body() dto: any) {
    return this.childrenService.updateChild(id, dto);
  }

  // 4. Delete a child
  @Delete(':id')
  deleteChild(@Param('id') id: string) {
    return this.childrenService.deleteChild(id);
  }
}

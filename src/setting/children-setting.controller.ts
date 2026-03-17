import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { SupabaseJwtGuard } from 'src/auth/supabase-jwt.guard';// Adjust path as needed
import { ChildrenSettingService } from './children-setting.service';

@Controller('settings/children')
export class ChildrenSettingController {
  constructor(private readonly childrenSettingService: ChildrenSettingService) {}

  // 1. Get all children
  @UseGuards(SupabaseJwtGuard)
  @Get()
  getAllChildren(@Req() req: any) {
    const userId = req.user.sub; // Get user ID from JWT token
    return this.childrenSettingService.getAllChildrenByUserId(userId);
  }

  // 2. Add a new child
  @UseGuards(SupabaseJwtGuard)
   @Post()
  addChild(@Body() dto: any, @Req() req: any) {
    const userId = req.user.sub;
    return this.childrenSettingService.addChild({ ...dto, user_id: userId });
  }

  // 3. Update child info
  @UseGuards(SupabaseJwtGuard)
  @Put(':id')
  updateChild(@Param('id') id: string, @Body() dto: any) {
    return this.childrenSettingService.updateChild(id, dto);
  }

  // 4. Delete a child
  @UseGuards(SupabaseJwtGuard)
  @Delete(':id')
  deleteChild(@Param('id') id: string) {
    return this.childrenSettingService.deleteChild(id);
  }
}
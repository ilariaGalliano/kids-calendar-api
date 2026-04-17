import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import { ChildrenSettingService } from './children-setting.service';

@Controller('settings/children')
export class ChildrenSettingController {
  constructor(private readonly childrenSettingService: ChildrenSettingService) {}

  // 1. Get all children
  @UseGuards(SupabaseJwtGuard)
  @Get()
  getAllChildren(@Req() req: any) {
    const userId = req.user.sub;
    return this.childrenSettingService.getAllChildrenByUserId(userId);
  }

  // 2. Add a new child
  @UseGuards(SupabaseJwtGuard)
  @Post()
  addChild(@Body() dto: any, @Req() req: any) {
    const userId = req.user.sub;
    return this.childrenSettingService.addChild({ ...dto, user_id: userId });
  }

  // 3. Update child info — avatar stripped, use POST :id/avatar for images
  @UseGuards(SupabaseJwtGuard)
  @Put(':id')
  updateChild(@Param('id') id: string, @Body() dto: any) {
    // Safety: never accept base64 avatar via JSON PUT — use multipart upload
    const { avatar, ...safeDto } = dto;
    return this.childrenSettingService.updateChild(id, safeDto);
  }

  // 4. Delete a child
  @UseGuards(SupabaseJwtGuard)
  @Delete(':id')
  deleteChild(@Param('id') id: string) {
    return this.childrenSettingService.deleteChild(id);
  }

  // 5. Upload avatar (multipart/form-data)
  @UseGuards(SupabaseJwtGuard)
  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('Solo immagini permesse'), false);
      }
      cb(null, true);
    },
  }))
  async uploadAvatar(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nessun file ricevuto');
    return this.childrenSettingService.uploadAvatarFile(id, file);
  }
}
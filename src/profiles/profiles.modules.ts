import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}

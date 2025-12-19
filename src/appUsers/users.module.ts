import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppUsersController } from 'src/users/users.controller';
import { AppUsersService } from 'src/users/users.service';

@Module({
  controllers: [AppUsersController],
  providers: [AppUsersService, PrismaService],
  exports: [AppUsersService],
})
export class AppUsersModule {}
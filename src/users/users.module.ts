import { Module } from '@nestjs/common';
import { AppUsersController } from './users.controller';
import { AppUsersService } from './users.service';

@Module({
  controllers: [AppUsersController],
  providers: [AppUsersService],
  exports: [AppUsersService],
})
export class AppUsersModule {}
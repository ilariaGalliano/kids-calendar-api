import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Children } from 'src/children/children.entity';
import { ChildrenSettingController } from './children-setting.controller';
import { ChildrenSettingService } from './children-setting.service';

@Module({
    imports: [TypeOrmModule.forFeature([Children])],
    providers: [ChildrenSettingService],
    controllers: [ChildrenSettingController]
})
export class ChildrenSettingModule { }

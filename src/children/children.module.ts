import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Children } from './children.entity';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Children])],
    providers: [ChildrenService],
    controllers: [ChildrenController]
})
export class ChildrenModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Children } from './children.entity';
import { User } from '../user/user.entity';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Children, User])],
    providers: [ChildrenService],
    controllers: [ChildrenController]
})
export class ChildrenModule { }

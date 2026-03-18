import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import { UsersService } from './user.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
    constructor(private readonly userervice: UsersService){}

    @Post()
    async createUser(@Body() body: Partial<User>): Promise<User>{
        return this.userervice.create(body);
    }

    @UseGuards(SupabaseJwtGuard)
    @Get()
    async findAll(): Promise<User[]> {
        return this.userervice.findAll();
    }
    @Get('search')
    async searchUsers(@Query('name') name?:string,
        @Query('department') department?:string,): Promise<User[]>{
        return this.userervice.search({ name, department })
    }
     @Get(':id')
    async findOne(@Param('id') id: number): Promise<User> {
        return this.userervice.findOne(id);
    }

    @Put(':id')
    async updateUser(
        @Param('id') id: number,
        @Body() body: Partial<User>,
    ): Promise<User>{
        return this.userervice.update(id, body);
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: number): Promise<{ message: string}> {
        return this.userervice.delete(id);
    }
}

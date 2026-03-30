import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Req } from '@nestjs/common';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import type { Request } from 'express';
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

    @UseGuards(SupabaseJwtGuard)
    @Get('me/pin/status')
    async getPinStatus(@Req() req: Request): Promise<{ hasPin: boolean }> {
        const user = req.user as { sub?: string };
        const hasPin = await this.userervice.hasPin(user.sub!);
        return { hasPin };
    }

    @UseGuards(SupabaseJwtGuard)
    @Post('me/pin')
    async setPin(@Body() body: { pin: string }, @Req() req: Request): Promise<{ success: boolean }> {
        const user = req.user as { sub?: string };
        await this.userervice.setPin(user.sub!, body.pin);
        return { success: true };
    }

    @UseGuards(SupabaseJwtGuard)
    @Post('me/pin/verify')
    async verifyPin(@Body() body: { pin: string }, @Req() req: Request): Promise<{ valid: boolean }> {
        const user = req.user as { sub?: string };
        const valid = await this.userervice.verifyPin(user.sub!, body.pin);
        return { valid };
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

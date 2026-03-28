import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Req, HttpCode } from '@nestjs/common';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import { UsersService } from './user.service';
import { User } from './user.entity';
import { Request } from 'express';

@Controller('users')
export class UsersController {
    constructor(private readonly userervice: UsersService){}

    /** GET /users/me/pin/status — il genitore sa se ha già impostato un PIN */
    @UseGuards(SupabaseJwtGuard)
    @Get('me/pin/status')
    async getPinStatus(@Req() req: Request & { user: any }): Promise<{ hasPin: boolean }> {
        const hasPin = await this.userervice.hasPin(req.user.sub);
        return { hasPin };
    }

    /** POST /users/me/pin — imposta o cambia il PIN */
    @UseGuards(SupabaseJwtGuard)
    @Post('me/pin')
    @HttpCode(200)
    async setPin(
        @Req() req: Request & { user: any },
        @Body() body: { pin: string }
    ): Promise<{ success: boolean }> {
        await this.userervice.setPin(req.user.sub, body.pin);
        return { success: true };
    }

    /** POST /users/me/pin/verify — verifica il PIN per riscuotere i punti */
    @UseGuards(SupabaseJwtGuard)
    @Post('me/pin/verify')
    @HttpCode(200)
    async verifyPin(
        @Req() req: Request & { user: any },
        @Body() body: { pin: string }
    ): Promise<{ valid: boolean }> {
        const valid = await this.userervice.verifyPin(req.user.sub, body.pin);
        return { valid };
    }

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

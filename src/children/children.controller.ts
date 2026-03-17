import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, ParseUUIDPipe, Req } from '@nestjs/common';
import { SupabaseAuthGuard } from 'src/auth/supabase-auth/supabase-auth.guard';
import { SupabaseJwtGuard } from 'src/auth/supabase-jwt.guard';
import type { Request } from 'express';
import { Children } from './children.entity';
import { ChildrenService } from './children.service';

@Controller('children')
export class ChildrenController {
    constructor(private readonly childrenSrv: ChildrenService){}

    @Post()
    async createChildren(@Body() body: Partial<Children>): Promise<Children>{
        return this.childrenSrv.create(body);
    }

    @UseGuards(SupabaseAuthGuard)
    @Get()
    async findAll(): Promise<Children[]> {
        return this.childrenSrv.findAll();
    }

    @UseGuards(SupabaseJwtGuard)
    @Get('me')
    async findMine(@Req() req: Request): Promise<Children[]> {
        const user = req.user as { sub?: string } | undefined;
        if (!user?.sub) {
            return [];
        }
        return this.childrenSrv.findByUserId(user.sub);
    }
    @Get('search')
    async searchChildren(@Query('name') name?:string,
        @Query('department') department?:string,): Promise<Children[]>{
        return this.childrenSrv.search({ name, department })
    }
     @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Children> {
        return this.childrenSrv.findOne(id);
    }

    @Put(':id')
    async updateChildren(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: Partial<Children>,
    ): Promise<Children>{
        return this.childrenSrv.update(id, body);
    }

    @Delete(':id')
    async deleteChildren(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string}> {
        return this.childrenSrv.delete(id);
    }
}

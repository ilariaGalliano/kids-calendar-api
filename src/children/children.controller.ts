import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, ParseUUIDPipe, Req } from '@nestjs/common';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import type { Request } from 'express';
import { Children } from './children.entity';
import { ChildrenService } from './children.service';

@Controller('children')
export class ChildrenController {
    constructor(private readonly childrenSrv: ChildrenService){}

    @UseGuards(SupabaseJwtGuard)
    @Post()
    async createChildren(@Body() body: Partial<Children>, @Req() req: Request): Promise<Children>{
        const user = req.user as { sub?: string } | undefined;
        if (!user?.sub) {
            throw new Error('User not authenticated');
        }
        // Assicura che user_id sia preso dal JWT
        const childData = { ...body, user_id: user.sub };
        return this.childrenSrv.create(childData);
    }

    @UseGuards(SupabaseJwtGuard)
    @Post('batch')
    async createChildrenBatch(@Body() body: { children: Partial<Children>[] }, @Req() req: Request): Promise<Children[]>{
        const user = req.user as { sub?: string } | undefined;
        if (!user?.sub) {
            throw new Error('User not authenticated');
        }
        // Aggiungi user_id a tutti i bambini
        const childrenWithUser = body.children.map(child => ({
            ...child,
            user_id: user.sub
        }));
        return this.childrenSrv.createBatch(childrenWithUser);
    }

    @UseGuards(SupabaseJwtGuard)
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

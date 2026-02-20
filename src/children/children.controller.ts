import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from 'src/auth/supabase-auth/supabase-auth.guard';
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
    @Get('search')
    async searchChildren(@Query('name') name?:string,
        @Query('department') department?:string,): Promise<Children[]>{
        return this.childrenSrv.search({ name, department })
    }
     @Get(':id')
    async findOne(@Param('id') id: number): Promise<Children> {
        return this.childrenSrv.findOne(id);
    }

    @Put(':id')
    async updateChildren(
        @Param('id') id: number,
        @Body() body: Partial<Children>,
    ): Promise<Children>{
        return this.childrenSrv.update(id, body);
    }

    @Delete(':id')
    async deleteChildren(@Param('id') id: number): Promise<{ message: string}> {
        return this.childrenSrv.delete(id);
    }
}

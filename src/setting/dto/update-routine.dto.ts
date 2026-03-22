import { IsArray, IsBoolean, IsInt, IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateRoutineDto {

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nametask?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  days?: string[];

  @IsOptional()
  @IsInt()
  day_of_week?: number;

  @IsOptional()
  @IsObject()
  tasksByDay?: Record<string, any[]>;

  @IsOptional()
  @IsArray()
  tasks?: any[];

  @IsOptional()
  @IsArray()
  taskIds?: any[];

  @IsOptional()
  @IsString()
  childId?: string;

  @IsOptional()
  @IsString()
  child_id?: string;
}

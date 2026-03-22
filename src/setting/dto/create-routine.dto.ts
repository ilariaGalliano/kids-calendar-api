import { IsArray, IsBoolean, IsInt, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateRoutineDto {

  @IsOptional()
  @IsString()
  childId: string;

  @IsOptional()
  @IsString()
  child_id?: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  nametask?: string;

  @IsOptional()
  @IsArray()
  days: string[];

  @IsOptional()
  @IsInt()
  day_of_week?: number;

  @IsOptional()
  @IsObject()
  tasksByDay: Record<string, any[]>;

  @IsOptional()
  @IsArray()
  tasks?: any[];

  @IsOptional()
  @IsArray()
  taskIds?: any[];

  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  description: string;
}

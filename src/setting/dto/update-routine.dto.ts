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
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  end_time?: string;

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
  activities?: any[];

  @IsOptional()
  @IsArray()
  activityIds?: any[];

  @IsOptional()
  @IsString()
  childId?: string;

  @IsOptional()
  @IsString()
  child_id?: string;

  @IsOptional()
  @IsBoolean()
  isDone?: boolean;
}

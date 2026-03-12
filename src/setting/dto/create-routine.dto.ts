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
  @IsString()
  startTime: string;

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
  activities?: any[];

  @IsOptional()
  @IsArray()
  activityIds?: any[];

  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsBoolean()
  isDone?: boolean;

  @IsOptional()
  @IsString()
  description: string;
}

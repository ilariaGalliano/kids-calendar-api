import { IsArray, IsBoolean, IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateRoutineDto {

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  days?: string[];

  @IsOptional()
  @IsObject()
  tasksByDay?: Record<string, any[]>;

  @IsOptional()
  @IsString()
  childId?: string;
}

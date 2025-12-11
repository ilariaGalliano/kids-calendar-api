import { IsArray, IsBoolean, IsObject, IsString } from 'class-validator';

export class CreateRoutineDto {

  @IsString()
  childId: string;

  @IsString()
  name: string;

  @IsString()
  startTime: string;

  @IsArray()
  days: string[];

  @IsObject()
  tasksByDay: Record<string, any[]>;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  description: string;
}

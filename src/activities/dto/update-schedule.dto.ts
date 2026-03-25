import { IsArray, IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MovedTaskDto {
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @IsString()
  @IsNotEmpty()
  fromDay: string;

  @IsString()
  @IsNotEmpty()
  toDay: string;

  @IsString()
  @IsNotEmpty()
  fromChildId: string;

  @IsString()
  @IsNotEmpty()
  toChildId: string;
}

export class UpdateScheduleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovedTaskDto)
  movedTasks: MovedTaskDto[];
}

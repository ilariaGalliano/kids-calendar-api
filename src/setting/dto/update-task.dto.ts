export class UpdateTaskDto {
  name?: string;
  description?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
}

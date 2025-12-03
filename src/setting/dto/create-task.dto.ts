export class CreateTaskDto {
  name: string;
  description?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  timer?: number; // duration in minutes or seconds
}

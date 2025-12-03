export class CreateRoutineDto {
  childId: string;
  name: string;
  description?: string;
  tasks: string[]; // array of task IDs or names
}

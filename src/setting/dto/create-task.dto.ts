export class CreateTaskDto {
  title: string;
  emoji?: string;
  color?: string;
  description?: string;
  duration?: number;
  isActive?: boolean;
  reward?: number;
}

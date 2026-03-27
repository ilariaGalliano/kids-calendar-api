export class UpdateTaskDto {
  title?: string;
  emoji?: string;
  color?: string;
  description?: string;
  duration?: number;
  isActive?: boolean;
  reward?: number;
  startTime?: string | null; // 'HH:mm' - ora inizio
  endTime?: string | null;   // 'HH:mm' - ora fine
}

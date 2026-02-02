export interface TimeEntry {
  id: string;
  userName: string;
  teamName?: string;
  task: string;
  subTask?: string;
  startTime: string;
  endTime: string;
  duration: number;
  formattedDuration: string;
}

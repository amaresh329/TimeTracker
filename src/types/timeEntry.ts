export interface TimeEntry {
  id: string;
  userName: string;
  teamName?: string;
  task: string;
  subTask?: string;
  assignedVolume?: number;
  processedVolume?: number;
  remainingDeficit?: number;
  startTime: string;
  endTime: string;
  duration: number;
  formattedDuration: string;
  notes?: string;
}

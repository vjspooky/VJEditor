export interface Caption {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  language: string;
  speaker?: string;
  styleId?: string;
}

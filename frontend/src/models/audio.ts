export interface AudioClip {
  id: string;
  mediaId: string;
  trackId: string;
  startTime: number;
  duration: number;
  sourceStartTime: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  muted: boolean;
}

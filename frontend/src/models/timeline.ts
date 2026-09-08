export interface TimelineClip {
  id: string;
  mediaId: string;
  trackId: string;
  startTime: number;
  duration: number;
  sourceStartTime: number;
  sourceDuration: number;
  type: "video" | "image" | "audio";
  name: string;
  volume: number;
  muted: boolean;
  visible: boolean;
  locked?: boolean;
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: "video" | "audio" | "text" | "caption";
  clips: TimelineClip[];
  muted: boolean;
  locked: boolean;
  visible: boolean;
}

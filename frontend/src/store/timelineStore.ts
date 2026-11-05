import { TimelineTrack, TimelineClip } from "../models/timeline";

export interface TimelineState {
  tracks: TimelineTrack[];
  currentTime: number;
  duration: number;
}

export function createDefaultTracks(): TimelineTrack[] {
  return [
    { id: "track-v1", name: "Video Track 1", type: "video", clips: [], muted: false, locked: false, visible: true },
    { id: "track-a1", name: "Audio Track 1", type: "audio", clips: [], muted: false, locked: false, visible: true },
    { id: "track-t1", name: "Text Track 1", type: "text", clips: [], muted: false, locked: false, visible: true },
    { id: "track-c1", name: "Captions Track", type: "caption", clips: [], muted: false, locked: false, visible: true },
  ];
}

import { TimelineClip } from "../models/timeline";

let clipClipboard: TimelineClip[] = [];

export function copyClips(clips: TimelineClip[]): void {
  clipClipboard = clips.map((c) => ({ ...c }));
}

export function pasteClips(targetTrackId: string, atTime: number): TimelineClip[] {
  if (clipClipboard.length === 0) return [];
  const baseStart = clipClipboard[0].startTime;

  return clipClipboard.map((c) => ({
    ...c,
    id: crypto.randomUUID(),
    trackId: targetTrackId,
    startTime: atTime + (c.startTime - baseStart),
  }));
}

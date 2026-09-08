import { TimelineClip } from "../models/timeline";

export function splitClip(
  clip: TimelineClip,
  splitTime: number
): [TimelineClip, TimelineClip] | null {
  const localTime = splitTime - clip.startTime;

  if (localTime <= 0 || localTime >= clip.duration) {
    return null;
  }

  const first: TimelineClip = {
    ...clip,
    id: crypto.randomUUID(),
    duration: localTime,
    sourceDuration: localTime,
  };

  const second: TimelineClip = {
    ...clip,
    id: crypto.randomUUID(),
    startTime: splitTime,
    duration: clip.duration - localTime,
    sourceStartTime: clip.sourceStartTime + localTime,
    sourceDuration: clip.sourceDuration - localTime,
  };

  return [first, second];
}

export function trimClip(
  clip: TimelineClip,
  newDuration: number
): TimelineClip {
  return {
    ...clip,
    duration: Math.max(0.1, newDuration),
    sourceDuration: Math.max(0.1, newDuration),
  };
}

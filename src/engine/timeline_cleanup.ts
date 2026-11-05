import type { AdvancedTrack } from '../models/timeline_advanced';

export interface TimelineGap {
  trackId: string;
  startTime: number;
  duration: number;
}

/**
 * Detects empty gaps between clips on a given track
 */
export function detectGaps(track: AdvancedTrack): TimelineGap[] {
  const gaps: TimelineGap[] = [];
  const sortedClips = [...track.clips].sort((a, b) => a.startTime - b.startTime);

  for (let i = 0; i < sortedClips.length - 1; i++) {
    const currentEnd = sortedClips[i].startTime + sortedClips[i].duration;
    const nextStart = sortedClips[i + 1].startTime;

    if (nextStart > currentEnd + 0.01) {
      gaps.push({
        trackId: track.id,
        startTime: currentEnd,
        duration: nextStart - currentEnd,
      });
    }
  }

  return gaps;
}

/**
 * Removes all detected gaps on a track by snapping subsequent clips
 */
export function autoCloseGaps(track: AdvancedTrack): AdvancedTrack {
  const sortedClips = [...track.clips].sort((a, b) => a.startTime - b.startTime);
  let accumulatedOffset = 0;

  const closedClips = sortedClips.map((clip, idx) => {
    if (idx === 0) return clip;
    const prevClip = sortedClips[idx - 1];
    const prevEnd = prevClip.startTime + prevClip.duration;

    if (clip.startTime > prevEnd) {
      const gap = clip.startTime - prevEnd;
      accumulatedOffset += gap;
    }

    return {
      ...clip,
      startTime: Math.max(0, clip.startTime - accumulatedOffset),
    };
  });

  return { ...track, clips: closedClips };
}

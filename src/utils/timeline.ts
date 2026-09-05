import type { TimelineItem, TimelineTrack } from '@/types';

export function findItem(
  tracks: TimelineTrack[],
  itemId: string | null,
): TimelineItem | undefined {
  if (!itemId) return undefined;
  for (const track of tracks) {
    const found = track.items.find((item) => item.id === itemId);
    if (found) return found;
  }
  return undefined;
}

export function findTrackForItem(
  tracks: TimelineTrack[],
  itemId: string | null,
): TimelineTrack | undefined {
  if (!itemId) return undefined;
  return tracks.find((track) => track.items.some((item) => item.id === itemId));
}

export function projectDurationMs(tracks: TimelineTrack[], fallbackSeconds: number): number {
  let max = fallbackSeconds * 1000;
  for (const track of tracks) {
    for (const item of track.items) {
      max = Math.max(max, item.startMs + item.durationMs);
    }
  }
  return max;
}

export function itemAtPlayhead(
  tracks: TimelineTrack[],
  playheadMs: number,
  kind: TimelineItem['kind'],
): TimelineItem | undefined {
  for (const track of tracks) {
    if (track.kind !== kind) continue;
    const match = track.items.find(
      (item) => playheadMs >= item.startMs && playheadMs < item.startMs + item.durationMs,
    );
    if (match) return match;
  }
  return undefined;
}

export function cloneTracks(tracks: TimelineTrack[]): TimelineTrack[] {
  return structuredClone(tracks);
}

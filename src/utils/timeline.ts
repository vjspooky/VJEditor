import type { FrameRate, TimelineItem, TimelineTrack, TrackKind } from '@/types';
import { snapMsToFrame } from '@/utils/frame';

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

export function isCompatibleTrack(trackKind: TrackKind, itemKind: TimelineItem['kind']): boolean {
  if (trackKind === 'video' && itemKind === 'video') return true;
  if (trackKind === 'audio' && itemKind === 'audio') return true;
  if (trackKind === 'text' && itemKind === 'text') return true;
  if (trackKind === 'caption' && itemKind === 'caption') return true;
  return false;
}

export function hasCollision(
  items: TimelineItem[],
  ignoreIds: string | string[],
  startMs: number,
  durationMs: number,
): boolean {
  const ignored = Array.isArray(ignoreIds) ? ignoreIds : [ignoreIds];
  const endMs = startMs + durationMs;
  return items.some((item) => {
    if (ignored.includes(item.id)) return false;
    const itemEnd = item.startMs + item.durationMs;
    // Overlap condition
    return startMs < itemEnd && endMs > item.startMs;
  });
}

/**
 * Calculates snapped time and determines whether a visual guide should be displayed.
 */
export function snapTimeWithGuides(
  targetMs: number,
  tracks: TimelineTrack[],
  ignoreItemIds: string[],
  playheadMs: number,
  snapEnabled: boolean,
  frameSnapEnabled: boolean,
  fps: FrameRate,
  thresholdMs = 120,
): { snappedMs: number; guideMs: number | null } {
  let value = Math.max(0, targetMs);

  if (frameSnapEnabled) {
    value = snapMsToFrame(value, fps);
  }

  if (!snapEnabled) {
    return { snappedMs: value, guideMs: null };
  }

  // Snap candidates:
  // 1. 0 (Timeline start)
  // 2. Playhead
  // 3. Other clip starts and ends across tracks
  const candidates: number[] = [0, playheadMs];
  for (const track of tracks) {
    for (const item of track.items) {
      if (ignoreItemIds.includes(item.id)) continue;
      candidates.push(item.startMs);
      candidates.push(item.startMs + item.durationMs);
    }
  }

  let nearestCandidate: number | null = null;
  let minDiff = Infinity;

  for (const c of candidates) {
    const diff = Math.abs(c - value);
    if (diff < minDiff && diff <= thresholdMs) {
      minDiff = diff;
      nearestCandidate = c;
    }
  }

  if (nearestCandidate !== null) {
    return { snappedMs: nearestCandidate, guideMs: nearestCandidate };
  }

  return { snappedMs: value, guideMs: null };
}

/**
 * Shifts following clips on the same track (Ripple)
 */
export function rippleShiftItems(
  items: TimelineItem[],
  cutoffStartMs: number,
  deltaMs: number,
  excludeIds: string[] = [],
): TimelineItem[] {
  return items.map((item) => {
    if (excludeIds.includes(item.id)) return item;
    if (item.startMs >= cutoffStartMs) {
      return {
        ...item,
        startMs: Math.max(0, item.startMs + deltaMs),
      };
    }
    return item;
  });
}


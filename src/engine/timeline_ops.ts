import type { AdvancedClip, AdvancedTrack } from '../models/timeline_advanced';

/**
 * 1. COMPOUND CLIP CREATION
 * Groups multiple clips across tracks into a single container clip.
 */
export function createCompoundClip(
  clipIds: string[],
  tracks: AdvancedTrack[],
  compoundName: string = 'Compound Clip'
): { updatedTracks: AdvancedTrack[]; compoundClip: AdvancedClip } | null {
  const selectedClips: AdvancedClip[] = [];

  // Extract selected clips
  for (const track of tracks) {
    for (const clip of track.clips) {
      if (clipIds.includes(clip.id)) {
        selectedClips.push(clip);
      }
    }
  }

  if (selectedClips.length === 0) return null;

  // Determine boundary timestamps
  const minStart = Math.min(...selectedClips.map((c) => c.startTime));
  const maxEnd = Math.max(...selectedClips.map((c) => c.startTime + c.duration));
  const compoundDuration = maxEnd - minStart;

  // Repackage internal tracks relative to compound time (t = 0)
  const nestedTracks: AdvancedTrack[] = tracks
    .map((track) => ({
      ...track,
      clips: track.clips
        .filter((c) => clipIds.includes(c.id))
        .map((c) => ({
          ...c,
          startTime: c.startTime - minStart,
        })),
    }))
    .filter((track) => track.clips.length > 0);

  const compoundClip: AdvancedClip = {
    id: `compound_${crypto.randomUUID()}`,
    trackId: selectedClips[0].trackId,
    name: compoundName,
    type: 'compound',
    startTime: minStart,
    duration: compoundDuration,
    sourceStartTime: 0,
    sourceDuration: compoundDuration,
    playbackRate: 1.0,
    nestedTracks,
    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 },
  };

  // Remove the grouped individual clips and insert compound clip
  const updatedTracks = tracks.map((track) => {
    const remainingClips = track.clips.filter((c) => !clipIds.includes(c.id));
    if (track.id === compoundClip.trackId) {
      return {
        ...track,
        clips: [...remainingClips, compoundClip].sort((a, b) => a.startTime - b.startTime),
      };
    }
    return { ...track, clips: remainingClips };
  });

  return { updatedTracks, compoundClip };
}

/**
 * 2. RIPPLE DELETE
 * Deletes a clip and shifts all subsequent clips backward to close the gap.
 */
export function rippleDeleteClip(
  clipId: string,
  tracks: AdvancedTrack[]
): AdvancedTrack[] {
  let targetStartTime = 0;
  let targetDuration = 0;
  let found = false;

  for (const track of tracks) {
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) {
      targetStartTime = clip.startTime;
      targetDuration = clip.duration;
      found = true;
      break;
    }
  }

  if (!found) return tracks;

  return tracks.map((track) => ({
    ...track,
    clips: track.clips
      .filter((c) => c.id !== clipId)
      .map((c) => {
        // Shift forward clips left by target duration
        if (c.startTime >= targetStartTime + targetDuration) {
          return { ...c, startTime: Math.max(0, c.startTime - targetDuration) };
        }
        return c;
      }),
  }));
}

/**
 * 3. ROLL EDIT
 * Adjusts the edit point between two adjacent clips.
 * Clip A end expands/contracts while Clip B start mirrors the change. Total duration stays unchanged.
 */
export function rollEdit(
  clipAId: string,
  clipBId: string,
  deltaSec: number,
  track: AdvancedTrack
): AdvancedTrack {
  const clipA = track.clips.find((c) => c.id === clipAId);
  const clipB = track.clips.find((c) => c.id === clipBId);

  if (!clipA || !clipB) return track;

  // Boundary checks: Clip A must have room to expand or not shrink below 0.1s
  const newDurationA = clipA.duration + deltaSec;
  const newDurationB = clipB.duration - deltaSec;
  const newStartB = clipB.startTime + deltaSec;
  const newSourceDurationA = clipA.sourceDuration + deltaSec;
  const newSourceStartB = clipB.sourceStartTime + deltaSec;

  if (newDurationA < 0.1 || newDurationB < 0.1) return track;
  if (newSourceStartB < 0) return track;

  return {
    ...track,
    clips: track.clips.map((c) => {
      if (c.id === clipAId) {
        return {
          ...c,
          duration: newDurationA,
          sourceDuration: newSourceDurationA,
        };
      }
      if (c.id === clipBId) {
        return {
          ...c,
          startTime: newStartB,
          duration: newDurationB,
          sourceStartTime: newSourceStartB,
        };
      }
      return c;
    }),
  };
}

/**
 * 4. SLIP EDIT
 * Slips the inner media content (sourceStartTime) without moving the clip's
 * position or changing its duration on the timeline.
 */
export function slipEdit(
  clipId: string,
  deltaSec: number,
  tracks: AdvancedTrack[]
): AdvancedTrack[] {
  return tracks.map((track) => ({
    ...track,
    clips: track.clips.map((clip) => {
      if (clip.id === clipId) {
        const potentialSourceStart = clip.sourceStartTime + deltaSec;
        // Ensure source trim does not slip past 0
        const updatedSourceStart = Math.max(0, potentialSourceStart);
        return {
          ...clip,
          sourceStartTime: updatedSourceStart,
        };
      }
      return clip;
    }),
  }));
}

/**
 * 5. SLIDE EDIT
 * Moves a middle clip along the timeline, shortening the preceding clip and
 * extending the following clip so project duration is preserved.
 */
export function slideEdit(
  prevClipId: string,
  activeClipId: string,
  nextClipId: string,
  deltaSec: number,
  track: AdvancedTrack
): AdvancedTrack {
  const prev = track.clips.find((c) => c.id === prevClipId);
  const active = track.clips.find((c) => c.id === activeClipId);
  const next = track.clips.find((c) => c.id === nextClipId);

  if (!prev || !active || !next) return track;

  if (prev.duration + deltaSec < 0.1 || next.duration - deltaSec < 0.1) {
    return track;
  }

  return {
    ...track,
    clips: track.clips.map((c) => {
      if (c.id === prevClipId) {
        return { ...c, duration: c.duration + deltaSec };
      }
      if (c.id === activeClipId) {
        return { ...c, startTime: c.startTime + deltaSec };
      }
      if (c.id === nextClipId) {
        return {
          ...c,
          startTime: c.startTime + deltaSec,
          duration: c.duration - deltaSec,
          sourceStartTime: c.sourceStartTime + deltaSec,
        };
      }
      return c;
    }),
  };
}

import { useState } from "react";
import { TimelineTrack, TimelineClip } from "../models/timeline";
import { createDefaultTracks } from "../store/timelineStore";

export function useTimeline() {
  const [tracks, setTracks] = useState<TimelineTrack[]>(createDefaultTracks);
  const [currentTime, setCurrentTime] = useState(0);

  const addClip = (trackId: string, clip: TimelineClip) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, clips: [...track.clips, clip] } : track
      )
    );
  };

  const removeClip = (clipId: string) => {
    setTracks((prev) =>
      prev.map((track) => ({
        ...track,
        clips: track.clips.filter((c) => c.id !== clipId),
      }))
    );
  };

  return { tracks, setTracks, currentTime, setCurrentTime, addClip, removeClip };
}

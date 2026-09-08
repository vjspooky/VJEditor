import { TimelineTrack as TTrack } from "../../models/timeline";
import TimelineClip from "./TimelineClip";

interface TimelineTrackProps {
  track: TTrack;
  pps: number;
  currentTime: number;
}

const TRACK_COLORS: Record<string, string> = {
  video: "rgba(108,99,255,0.25)",
  audio: "rgba(0,212,170,0.2)",
  text: "rgba(255,200,80,0.2)",
  caption: "rgba(255,120,80,0.2)",
};

export default function TimelineTrack({ track, pps, currentTime }: TimelineTrackProps) {
  return (
    <div
      id={`track-${track.id}`}
      style={{
        height: 48,
        position: "relative",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-bg)",
      }}
    >
      {track.clips.map((clip) => (
        <TimelineClip key={clip.id} clip={clip} pps={pps} trackColor={TRACK_COLORS[track.type] ?? "rgba(108,99,255,0.2)"} />
      ))}
    </div>
  );
}

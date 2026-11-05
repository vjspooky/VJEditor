import { useState } from "react";
import { TimelineTrack as TTrack } from "../../models/timeline";
import TimelineHeader from "./TimelineHeader";
import TimelineRuler from "./TimelineRuler";
import TimelineTrack from "./TimelineTrack";
import Playhead from "./Playhead";
import TimelineToolbar from "./TimelineToolbar";

interface TimelineProps {
  currentTime: number;
  onSeek: (time: number) => void;
  isPlaying: boolean;
}

const DEFAULT_TRACKS: TTrack[] = [
  { id: "track-v1", name: "Video 1", type: "video", clips: [], muted: false, locked: false, visible: true },
  { id: "track-a1", name: "Audio 1", type: "audio", clips: [], muted: false, locked: false, visible: true },
  { id: "track-t1", name: "Captions", type: "caption", clips: [], muted: false, locked: false, visible: true },
];

const PX_PER_SECOND = 80;

export default function Timeline({ currentTime, onSeek, isPlaying }: TimelineProps) {
  const [tracks, setTracks] = useState<TTrack[]>(DEFAULT_TRACKS);
  const [zoom, setZoom] = useState(1);
  const pps = PX_PER_SECOND * zoom;

  return (
    <div
      id="timeline-root"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg)",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <TimelineToolbar zoom={zoom} onZoomChange={setZoom} />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Track headers column */}
        <div style={{ width: 160, flexShrink: 0, borderRight: "1px solid var(--color-border)" }}>
          <TimelineHeader />
          {tracks.map((track) => (
            <div
              key={track.id}
              style={{
                height: 48,
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                borderBottom: "1px solid var(--color-border)",
                fontSize: "0.78rem",
                color: "var(--color-text-muted)",
                fontWeight: 500,
              }}
            >
              {track.name}
            </div>
          ))}
        </div>

        {/* Scrollable timeline area */}
        <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
          <TimelineRuler pps={pps} duration={60} currentTime={currentTime} onSeek={onSeek} />
          <Playhead currentTime={currentTime} pps={pps} />
          {tracks.map((track) => (
            <TimelineTrack key={track.id} track={track} pps={pps} currentTime={currentTime} />
          ))}
        </div>
      </div>
    </div>
  );
}

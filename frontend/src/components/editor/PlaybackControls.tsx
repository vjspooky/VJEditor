import { formatTime } from "../../utils/time";

interface PlaybackControlsProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
}

export default function PlaybackControls({
  currentTime,
  duration,
  isPlaying,
  onPlay,
  onPause,
  onSeek,
}: PlaybackControlsProps) {
  function handleScrub(e: React.ChangeEvent<HTMLInputElement>) {
    onSeek(parseFloat(e.target.value));
  }

  return (
    <div
      id="playback-controls"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 16px",
        borderTop: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        flexShrink: 0,
      }}
    >
      {/* Rewind */}
      <button
        id="playback-rewind"
        aria-label="Rewind to start"
        onClick={() => onSeek(0)}
        style={btnStyle}
        title="Rewind (↩)"
      >
        ⏮
      </button>

      {/* Play / Pause */}
      <button
        id="playback-play-pause"
        aria-label={isPlaying ? "Pause" : "Play"}
        onClick={isPlaying ? onPause : onPlay}
        style={{
          ...btnStyle,
          background: "var(--color-primary)",
          color: "#fff",
          width: 34,
          height: 34,
          borderRadius: "50%",
          fontSize: "1rem",
        }}
        title="Play / Pause (Space)"
      >
        {isPlaying ? "⏸" : "▶"}
      </button>

      {/* Time display */}
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "0.8rem",
          color: "var(--color-text-muted)",
          minWidth: 96,
          textAlign: "center",
        }}
      >
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      {/* Scrubber */}
      <input
        id="playback-scrubber"
        type="range"
        min={0}
        max={duration}
        step={0.01}
        value={currentTime}
        onChange={handleScrub}
        style={{
          flex: 1,
          accentColor: "var(--color-primary)",
          height: 4,
          cursor: "pointer",
          background: "transparent",
          border: "none",
          padding: 0,
          width: "auto",
        }}
        aria-label="Playback position"
      />
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "var(--color-text)",
  cursor: "pointer",
  fontSize: "1.1rem",
  padding: "4px",
  borderRadius: "var(--radius-sm)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "color var(--transition-fast)",
};

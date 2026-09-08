import React, { useState, useEffect } from "react";

interface AudioControlsProps {
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  masterVolume?: number;
  onMasterVolumeChange?: (volume: number) => void;
  isMasterMuted?: boolean;
  onToggleMasterMute?: () => void;
}

export default function AudioControls({
  isPlaying = false,
  onTogglePlay = () => {},
  masterVolume = 1,
  onMasterVolumeChange = () => {},
  isMasterMuted = false,
  onToggleMasterMute = () => {},
}: AudioControlsProps) {
  // Simulated dynamic VU meter activity when playing
  const [leftMeter, setLeftMeter] = useState(0);
  const [rightMeter, setRightMeter] = useState(0);

  useEffect(() => {
    if (!isPlaying || isMasterMuted) {
      setLeftMeter(0);
      setRightMeter(0);
      return;
    }

    const interval = setInterval(() => {
      const base = masterVolume * 0.7;
      setLeftMeter(Math.min(1, Math.max(0.05, base + (Math.random() * 0.3 - 0.15))));
      setRightMeter(Math.min(1, Math.max(0.05, base + (Math.random() * 0.3 - 0.15))));
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, isMasterMuted, masterVolume]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "10px 16px",
        background: "var(--color-surface, #1E293B)",
        borderTop: "1px solid var(--color-border, #334155)",
        fontSize: 13,
      }}
    >
      {/* Play/Pause Button */}
      <button
        onClick={onTogglePlay}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "var(--color-primary, #6366F1)",
          color: "#FFF",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>

      {/* Mute Button */}
      <button
        onClick={onToggleMasterMute}
        style={{
          background: "transparent",
          border: "none",
          color: isMasterMuted ? "#EF4444" : "#94A3B8",
          fontSize: 18,
          cursor: "pointer",
          padding: 4,
        }}
        title={isMasterMuted ? "Unmute Master" : "Mute Master"}
      >
        {isMasterMuted ? "🔇" : "🔊"}
      </button>

      {/* Master Volume Slider */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: 140 }}>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={isMasterMuted ? 0 : masterVolume}
          onChange={(e) => onMasterVolumeChange(Number(e.target.value))}
          style={{ width: "100%" }}
        />
        <span style={{ fontSize: 11, color: "#94A3B8", width: 32 }}>
          {isMasterMuted ? "0%" : `${Math.round(masterVolume * 100)}%`}
        </span>
      </div>

      {/* Stereo VU Peak Meter */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3, width: 90 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#64748B" }}>L</span>
          <div style={{ flex: 1, height: 4, background: "#334155", borderRadius: 2, overflow: "hidden" }}>
            <div
              style={{
                width: `${leftMeter * 100}%`,
                height: "100%",
                background: leftMeter > 0.85 ? "#EF4444" : leftMeter > 0.65 ? "#F59E0B" : "#10B981",
                transition: "width 0.08s ease",
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#64748B" }}>R</span>
          <div style={{ flex: 1, height: 4, background: "#334155", borderRadius: 2, overflow: "hidden" }}>
            <div
              style={{
                width: `${rightMeter * 100}%`,
                height: "100%",
                background: rightMeter > 0.85 ? "#EF4444" : rightMeter > 0.65 ? "#F59E0B" : "#10B981",
                transition: "width 0.08s ease",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

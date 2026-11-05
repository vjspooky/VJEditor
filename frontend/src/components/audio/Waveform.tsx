import React, { useMemo } from "react";

interface WaveformProps {
  duration?: number;
  currentTime?: number;
  peaks?: number[];
  height?: number;
  color?: string;
  progressColor?: string;
  onSeek?: (time: number) => void;
}

export default function Waveform({
  duration = 10,
  currentTime = 0,
  peaks,
  height = 60,
  color = "#475569",
  progressColor = "#6366F1",
  onSeek,
}: WaveformProps) {
  // Generate deterministic peaks if none provided
  const waveformPeaks = useMemo(() => {
    if (peaks && peaks.length > 0) return peaks;
    const count = 120;
    const generated: number[] = [];
    for (let i = 0; i < count; i++) {
      // Harmonic wave formula with pseudo-random variation
      const base = Math.sin(i * 0.15) * 0.4 + 0.5;
      const noise = (Math.sin(i * 2.3) + Math.cos(i * 4.1)) * 0.2;
      generated.push(Math.max(0.1, Math.min(1.0, base + noise)));
    }
    return generated;
  }, [peaks]);

  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  const activePeakIndex = Math.floor(progressRatio * waveformPeaks.length);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(clickRatio * duration);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        height: `${height}px`,
        width: "100%",
        cursor: onSeek ? "pointer" : "default",
        padding: "4px 0",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {waveformPeaks.map((peak, index) => {
        const isPast = index <= activePeakIndex;
        const barHeight = Math.max(4, peak * (height - 8));
        return (
          <div
            key={index}
            style={{
              flex: 1,
              height: `${barHeight}px`,
              backgroundColor: isPast ? progressColor : color,
              borderRadius: 2,
              transition: "height 0.1s ease, background-color 0.1s ease",
            }}
          />
        );
      })}

      {/* Scrubber needle */}
      <div
        style={{
          position: "absolute",
          left: `${progressRatio * 100}%`,
          top: 0,
          bottom: 0,
          width: 2,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 0 6px rgba(255, 255, 255, 0.8)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

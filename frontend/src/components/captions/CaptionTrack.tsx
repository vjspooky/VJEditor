import React from "react";
import { Caption } from "../../models/caption";

interface CaptionTrackProps {
  captions: Caption[];
  pps?: number; // pixels per second
  currentTime?: number;
  duration?: number;
  onSelectCaption?: (id: string) => void;
  selectedCaptionId?: string | null;
}

export default function CaptionTrack({
  captions = [],
  pps = 40,
  currentTime = 0,
  duration = 30,
  onSelectCaption = () => {},
  selectedCaptionId = null,
}: CaptionTrackProps) {
  const trackWidth = Math.max(800, duration * pps);

  return (
    <div
      style={{
        position: "relative",
        height: 36,
        width: `${trackWidth}px`,
        background: "var(--color-surface, #1E293B)",
        borderBottom: "1px solid var(--color-border, #334155)",
        overflow: "hidden",
      }}
    >
      {captions.map((cap) => {
        const left = cap.startTime * pps;
        const width = Math.max(16, (cap.endTime - cap.startTime) * pps);
        const isCurrent = currentTime >= cap.startTime && currentTime <= cap.endTime;
        const isSelected = cap.id === selectedCaptionId;

        return (
          <div
            key={cap.id}
            onClick={() => onSelectCaption(cap.id)}
            style={{
              position: "absolute",
              left: `${left}px`,
              width: `${width}px`,
              top: 4,
              bottom: 4,
              background: isSelected
                ? "var(--color-primary, #6366F1)"
                : isCurrent
                ? "var(--color-primary-subtle, #4F46E5)"
                : "#334155",
              borderRadius: 4,
              border: isSelected ? "1px solid #FFF" : "1px solid #475569",
              padding: "0 6px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              overflow: "hidden",
              userSelect: "none",
              boxSizing: "border-box",
            }}
            title={`${cap.startTime.toFixed(1)}s - ${cap.endTime.toFixed(1)}s: ${cap.text}`}
          >
            <span
              style={{
                fontSize: 11,
                color: "#FFF",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {cap.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

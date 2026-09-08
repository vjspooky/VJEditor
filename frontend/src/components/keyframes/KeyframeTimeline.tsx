import React from "react";
import { Keyframe } from "../../models/keyframe";
import KeyframePoint from "./KeyframePoint";

interface KeyframeTimelineProps {
  keyframes?: Keyframe[];
  currentTime?: number;
  duration?: number;
  pps?: number;
  selectedKeyframeId?: string | null;
  onSelectKeyframe?: (id: string) => void;
  onDragKeyframeTime?: (id: string, newTime: number) => void;
  onDeleteKeyframe?: (id: string) => void;
  onSeek?: (time: number) => void;
}

const ANIMATABLE_PROPERTIES = [
  { id: "position", label: "Position" },
  { id: "scale", label: "Scale" },
  { id: "rotation", label: "Rotation" },
  { id: "opacity", label: "Opacity" },
];

export default function KeyframeTimeline({
  keyframes = [],
  currentTime = 0,
  duration = 30,
  pps = 40,
  selectedKeyframeId = null,
  onSelectKeyframe = () => {},
  onDragKeyframeTime = () => {},
  onDeleteKeyframe = () => {},
  onSeek = () => {},
}: KeyframeTimelineProps) {
  const width = Math.max(600, duration * pps);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--color-surface, #1E293B)",
        border: "1px solid var(--color-border, #334155)",
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      {/* Header with time ruler markers */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-border, #334155)",
          background: "var(--color-surface-raised, #0F172A)",
        }}
      >
        <div style={{ width: 100, padding: "6px 12px", fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>
          PROPERTY
        </div>
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            onSeek(Math.max(0, clickX / pps));
          }}
          style={{
            flex: 1,
            height: 24,
            position: "relative",
            cursor: "pointer",
            overflow: "hidden",
          }}
        >
          {Array.from({ length: Math.ceil(duration) + 1 }).map((_, sec) => (
            <div
              key={sec}
              style={{
                position: "absolute",
                left: `${sec * pps}px`,
                top: 4,
                fontSize: 9,
                color: "#64748B",
                borderLeft: "1px solid #334155",
                paddingLeft: 2,
                height: 14,
              }}
            >
              {sec}s
            </div>
          ))}
        </div>
      </div>

      {/* Property rows */}
      {ANIMATABLE_PROPERTIES.map((prop) => {
        const propKeyframes = keyframes.filter((k) => k.property.toLowerCase().startsWith(prop.id));

        return (
          <div
            key={prop.id}
            style={{
              display: "flex",
              height: 32,
              borderBottom: "1px solid var(--color-border, #334155)",
              alignItems: "center",
            }}
          >
            {/* Label column */}
            <div
              style={{
                width: 100,
                padding: "0 12px",
                fontSize: 11,
                color: "#CBD5E1",
                borderRight: "1px solid var(--color-border, #334155)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{prop.label}</span>
              <span style={{ fontSize: 9, color: "#64748B" }}>({propKeyframes.length})</span>
            </div>

            {/* Keyframe track lane */}
            <div
              style={{
                flex: 1,
                height: "100%",
                position: "relative",
                overflowX: "auto",
                background: "rgba(15, 23, 42, 0.4)",
              }}
            >
              <div style={{ position: "relative", width: `${width}px`, height: "100%" }}>
                {/* Playhead needle */}
                <div
                  style={{
                    position: "absolute",
                    left: `${currentTime * pps}px`,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    background: "#EF4444",
                    zIndex: 5,
                    pointerEvents: "none",
                  }}
                />

                {/* Keyframe diamonds */}
                {propKeyframes.map((kf) => (
                  <KeyframePoint
                    key={kf.id}
                    keyframe={kf}
                    pps={pps}
                    isSelected={kf.id === selectedKeyframeId}
                    onSelect={onSelectKeyframe}
                    onDragTime={onDragKeyframeTime}
                    onDelete={onDeleteKeyframe}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

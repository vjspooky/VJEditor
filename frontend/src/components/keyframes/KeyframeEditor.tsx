import React, { useState } from "react";
import { Keyframe } from "../../models/keyframe";
import KeyframeTimeline from "./KeyframeTimeline";
import AnimationPanel from "./AnimationPanel";

interface KeyframeEditorProps {
  keyframes?: Keyframe[];
  currentTime?: number;
  duration?: number;
  onAddKeyframe?: (property: string, value: number, easing: Keyframe["easing"]) => void;
  onUpdateKeyframe?: (id: string, updates: Partial<Keyframe>) => void;
  onDeleteKeyframe?: (id: string) => void;
  onSeek?: (time: number) => void;
  onApplyPresetAnimation?: (presetName: string) => void;
}

export default function KeyframeEditor({
  keyframes = [],
  currentTime = 0,
  duration = 30,
  onAddKeyframe = () => {},
  onUpdateKeyframe = () => {},
  onDeleteKeyframe = () => {},
  onSeek = () => {},
  onApplyPresetAnimation = () => {},
}: KeyframeEditorProps) {
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>(null);

  const selectedKeyframe = keyframes.find((k) => k.id === selectedKeyframeId) || null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--color-background-secondary, #0F172A)",
        borderRight: "1px solid var(--color-border, #334155)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          background: "var(--color-surface, #1E293B)",
          borderBottom: "1px solid var(--color-border, #334155)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "#FFF" }}>Keyframe Animation Engine</span>
        <span style={{ fontSize: 11, color: "#94A3B8" }}>{keyframes.length} Keyframes</span>
      </div>

      {/* Main Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Timeline representation */}
        <div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Timeline Curve Lanes
          </span>
          <KeyframeTimeline
            keyframes={keyframes}
            currentTime={currentTime}
            duration={duration}
            selectedKeyframeId={selectedKeyframeId}
            onSelectKeyframe={setSelectedKeyframeId}
            onDragKeyframeTime={(id, newTime) => onUpdateKeyframe(id, { time: newTime })}
            onDeleteKeyframe={onDeleteKeyframe}
            onSeek={onSeek}
          />
        </div>

        {/* Animation Parameters & Presets Panel */}
        <AnimationPanel
          selectedKeyframe={selectedKeyframe}
          currentTime={currentTime}
          onAddKeyframe={onAddKeyframe}
          onUpdateKeyframe={onUpdateKeyframe}
          onDeleteKeyframe={onDeleteKeyframe}
          onApplyPresetAnimation={onApplyPresetAnimation}
        />
      </div>
    </div>
  );
}

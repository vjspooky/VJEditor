import React, { useState } from "react";
import { Transition } from "../../models/effects";

interface TransitionPanelProps {
  onApplyTransition?: (transition: Transition) => void;
  selectedTransition?: Transition | null;
}

interface TransitionOption {
  type: Transition["type"];
  label: string;
  icon: string;
  description: string;
}

const TRANSITIONS: TransitionOption[] = [
  { type: "fade", label: "Cross Fade", icon: "◪", description: "Smooth blend between scenes" },
  { type: "dissolve", label: "Film Dissolve", icon: "░", description: "Soft photographic cross-dissolve" },
  { type: "wipe", label: "Wipe Transition", icon: "⏩", description: "Directional wipe across the frame" },
  { type: "slide", label: "Push Slide", icon: "➡", description: "Incoming shot pushes the outgoing shot" },
  { type: "zoom", label: "Zoom In / Out", icon: "🔍", description: "Dynamic focal zoom transition" },
];

export default function TransitionPanel({
  onApplyTransition = () => {},
  selectedTransition,
}: TransitionPanelProps) {
  const [duration, setDuration] = useState(0.8);
  const [selectedType, setSelectedType] = useState<Transition["type"]>(
    selectedTransition?.type || "fade"
  );

  const handleApply = () => {
    onApplyTransition({
      id: `trans-${Date.now()}`,
      type: selectedType,
      duration,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary, #94A3B8)" }}>
        CLIP TRANSITIONS
      </div>

      {/* Grid of Transition Choices */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
        {TRANSITIONS.map((t) => {
          const isSelected = selectedType === t.type;
          return (
            <button
              key={t.type}
              onClick={() => setSelectedType(t.type)}
              style={{
                padding: "12px 10px",
                background: isSelected ? "var(--color-primary-subtle, #312E81)" : "var(--color-surface, #1E293B)",
                border: `1px solid ${isSelected ? "var(--color-primary, #6366F1)" : "var(--color-border, #334155)"}`,
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                textAlign: "center",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ fontSize: 24 }}>{t.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? "#FFF" : "#CBD5E1" }}>
                {t.label}
              </span>
              <span style={{ fontSize: 10, color: "#64748B" }}>{t.description}</span>
            </button>
          );
        })}
      </div>

      {/* Duration adjustment */}
      <div style={{ borderTop: "1px solid var(--color-border, #334155)", paddingTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "#94A3B8" }}>Transition Duration</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#FFF" }}>{duration.toFixed(2)}s</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={3.0}
          step={0.1}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          style={{ width: "100%" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748B" }}>
          <span>0.1s (Quick)</span>
          <span>1.0s (Normal)</span>
          <span>3.0s (Slow)</span>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        style={{
          padding: "10px 16px",
          background: "var(--color-primary, #6366F1)",
          color: "#FFF",
          border: "none",
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Apply Transition to Cut
      </button>
    </div>
  );
}

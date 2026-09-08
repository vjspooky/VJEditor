import React from "react";
import { Keyframe } from "../../models/keyframe";

interface AnimationPanelProps {
  selectedKeyframe?: Keyframe | null;
  currentTime?: number;
  onAddKeyframe?: (property: string, value: number, easing: Keyframe["easing"]) => void;
  onUpdateKeyframe?: (id: string, updates: Partial<Keyframe>) => void;
  onDeleteKeyframe?: (id: string) => void;
  onApplyPresetAnimation?: (presetName: string) => void;
}

interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const PRESET_ANIMATIONS: AnimationPreset[] = [
  { id: "fade-in", name: "Smooth Fade In", description: "Opacity from 0 to 100% over 0.5s", icon: "🌓" },
  { id: "zoom-in", name: "Dynamic Zoom In", description: "Scale from 0.8 to 1.0 with ease-out", icon: "🔎" },
  { id: "slide-left", name: "Slide In Left", description: "Enters from left boundary to center", icon: "⬅" },
  { id: "bounce", name: "Pop & Bounce", description: "Scale punch 1.15 returning to 1.0", icon: "⚡" },
];

export default function AnimationPanel({
  selectedKeyframe,
  currentTime = 0,
  onAddKeyframe = () => {},
  onUpdateKeyframe = () => {},
  onDeleteKeyframe = () => {},
  onApplyPresetAnimation = () => {},
}: AnimationPanelProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Add Keyframe Quick Action */}
      <div
        style={{
          padding: 12,
          background: "var(--color-surface, #1E293B)",
          border: "1px solid var(--color-border, #334155)",
          borderRadius: 6,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#FFF" }}>
            Add Keyframe @ {currentTime.toFixed(2)}s
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          <button
            onClick={() => onAddKeyframe("scale", 1.0, "ease-out")}
            style={{
              padding: "6px 8px",
              background: "var(--color-surface-raised, #334155)",
              color: "#FFF",
              border: "none",
              borderRadius: 4,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            + Scale
          </button>
          <button
            onClick={() => onAddKeyframe("opacity", 1.0, "linear")}
            style={{
              padding: "6px 8px",
              background: "var(--color-surface-raised, #334155)",
              color: "#FFF",
              border: "none",
              borderRadius: 4,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            + Opacity
          </button>
          <button
            onClick={() => onAddKeyframe("rotation", 0, "ease-in-out")}
            style={{
              padding: "6px 8px",
              background: "var(--color-surface-raised, #334155)",
              color: "#FFF",
              border: "none",
              borderRadius: 4,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            + Rotation
          </button>
        </div>
      </div>

      {/* Selected Keyframe Inspector */}
      {selectedKeyframe && (
        <div
          style={{
            padding: 14,
            background: "var(--color-surface, #1E293B)",
            border: "1px solid var(--color-primary, #6366F1)",
            borderRadius: 6,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#F59E0B" }}>
              Keyframe Inspector ({selectedKeyframe.property})
            </span>
            <button
              onClick={() => onDeleteKeyframe(selectedKeyframe.id)}
              style={{
                background: "#EF444422",
                color: "#EF4444",
                border: "1px solid #EF444444",
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 10,
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <span style={{ fontSize: 11, color: "#94A3B8" }}>Timestamp:</span>
              <input
                type="number"
                step={0.05}
                min={0}
                value={selectedKeyframe.time}
                onChange={(e) => onUpdateKeyframe(selectedKeyframe.id, { time: Number(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "4px 8px",
                  background: "#0F172A",
                  border: "1px solid #475569",
                  borderRadius: 4,
                  color: "#FFF",
                  marginTop: 4,
                }}
              />
            </div>
            <div>
              <span style={{ fontSize: 11, color: "#94A3B8" }}>Easing Curve:</span>
              <select
                value={selectedKeyframe.easing}
                onChange={(e) =>
                  onUpdateKeyframe(selectedKeyframe.id, { easing: e.target.value as Keyframe["easing"] })
                }
                style={{
                  width: "100%",
                  padding: "4px 8px",
                  background: "#0F172A",
                  color: "#FFF",
                  border: "1px solid #475569",
                  borderRadius: 4,
                  marginTop: 4,
                }}
              >
                <option value="linear">Linear</option>
                <option value="ease-in">Ease In</option>
                <option value="ease-out">Ease Out</option>
                <option value="ease-in-out">Ease In-Out</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Preset Animations */}
      <div>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary, #94A3B8)" }}>
          PRESET ANIMATIONS
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          {PRESET_ANIMATIONS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPresetAnimation(preset.id)}
              style={{
                padding: "10px 8px",
                background: "var(--color-surface, #1E293B)",
                border: "1px solid var(--color-border, #334155)",
                borderRadius: 6,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>{preset.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#FFF" }}>{preset.name}</span>
              </div>
              <span style={{ fontSize: 10, color: "#64748B" }}>{preset.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

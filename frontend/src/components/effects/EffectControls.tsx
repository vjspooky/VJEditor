import React from "react";
import { ClipEffect } from "../../models/effects";

interface EffectControlsProps {
  effects?: ClipEffect[];
  onUpdateEffect?: (id: string, updates: Partial<ClipEffect>) => void;
  onRemoveEffect?: (id: string) => void;
  onAddEffect?: (type: ClipEffect["type"]) => void;
}

const EFFECT_RANGES: Record<ClipEffect["type"], { min: number; max: number; step: number; unit: string }> = {
  blur: { min: 0, max: 20, step: 0.5, unit: "px" },
  brightness: { min: 0, max: 2, step: 0.05, unit: "x" },
  contrast: { min: 0, max: 2, step: 0.05, unit: "x" },
  saturation: { min: 0, max: 3, step: 0.05, unit: "x" },
  grayscale: { min: 0, max: 1, step: 0.05, unit: "%" },
  sepia: { min: 0, max: 1, step: 0.05, unit: "%" },
  vignette: { min: 0, max: 1, step: 0.05, unit: "%" },
};

export default function EffectControls({
  effects = [],
  onUpdateEffect = () => {},
  onRemoveEffect = () => {},
  onAddEffect = () => {},
}: EffectControlsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary, #94A3B8)" }}>
          ACTIVE CLIP EFFECTS ({effects.length})
        </span>
        <select
          onChange={(e) => {
            if (e.target.value) {
              onAddEffect(e.target.value as ClipEffect["type"]);
              e.target.value = "";
            }
          }}
          defaultValue=""
          style={{
            padding: "4px 8px",
            background: "var(--color-surface, #1E293B)",
            color: "#FFF",
            border: "1px solid var(--color-border, #334155)",
            borderRadius: 4,
            fontSize: 11,
          }}
        >
          <option value="" disabled>
            + Add Effect
          </option>
          <option value="blur">Blur</option>
          <option value="brightness">Brightness</option>
          <option value="contrast">Contrast</option>
          <option value="saturation">Saturation</option>
          <option value="grayscale">Grayscale</option>
          <option value="sepia">Sepia</option>
          <option value="vignette">Vignette</option>
        </select>
      </div>

      {effects.length === 0 ? (
        <div style={{ textAlign: "center", color: "#64748B", padding: "20px 0", fontSize: 13 }}>
          No active effects on this clip. Choose a filter or add an effect above.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {effects.map((effect) => {
            const range = EFFECT_RANGES[effect.type] || { min: 0, max: 1, step: 0.05, unit: "" };
            return (
              <div
                key={effect.id}
                style={{
                  padding: 12,
                  background: "var(--color-surface, #1E293B)",
                  border: "1px solid var(--color-border, #334155)",
                  borderRadius: 6,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {/* Header: Toggle, Name, Delete */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={effect.enabled}
                      onChange={(e) => onUpdateEffect(effect.id, { enabled: e.target.checked })}
                      id={`eff-${effect.id}`}
                    />
                    <label
                      htmlFor={`eff-${effect.id}`}
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        textTransform: "capitalize",
                        color: effect.enabled ? "#FFF" : "#94A3B8",
                        cursor: "pointer",
                      }}
                    >
                      {effect.type}
                    </label>
                  </div>
                  <button
                    onClick={() => onRemoveEffect(effect.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#64748B",
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                    title="Remove effect"
                  >
                    ✕
                  </button>
                </div>

                {/* Intensity Slider */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8" }}>
                    <span>Intensity</span>
                    <span>
                      {effect.intensity.toFixed(2)}
                      {range.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={range.min}
                    max={range.max}
                    step={range.step}
                    value={effect.intensity}
                    disabled={!effect.enabled}
                    onChange={(e) => onUpdateEffect(effect.id, { intensity: Number(e.target.value) })}
                    style={{ width: "100%", opacity: effect.enabled ? 1 : 0.5 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

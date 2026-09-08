import React from "react";
import { ClipEffect } from "../../models/effects";

interface FiltersPanelProps {
  onApplyFilter?: (type: ClipEffect["type"], intensity: number) => void;
  activeEffects?: ClipEffect[];
}

interface PresetFilter {
  type: ClipEffect["type"];
  label: string;
  defaultIntensity: number;
  cssFilter: string;
}

const PRESET_FILTERS: PresetFilter[] = [
  { type: "grayscale", label: "Black & White", defaultIntensity: 1, cssFilter: "grayscale(100%)" },
  { type: "sepia", label: "Vintage Sepia", defaultIntensity: 0.8, cssFilter: "sepia(80%)" },
  { type: "vignette", label: "Cinematic Vignette", defaultIntensity: 0.7, cssFilter: "contrast(120%) brightness(90%)" },
  { type: "contrast", label: "High Contrast", defaultIntensity: 1.4, cssFilter: "contrast(150%)" },
  { type: "brightness", label: "Bright Warm", defaultIntensity: 1.3, cssFilter: "brightness(130%) saturate(120%)" },
  { type: "saturation", label: "Vibrant Colors", defaultIntensity: 1.6, cssFilter: "saturate(180%)" },
  { type: "blur", label: "Soft Dream", defaultIntensity: 4, cssFilter: "blur(2px)" },
];

export default function FiltersPanel({ onApplyFilter = () => {}, activeEffects = [] }: FiltersPanelProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary, #94A3B8)" }}>
        COLOR & CINEMATIC FILTERS
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
        {PRESET_FILTERS.map((f) => {
          const isApplied = activeEffects.some((e) => e.type === f.type && e.enabled);
          return (
            <button
              key={f.type}
              onClick={() => onApplyFilter(f.type, f.defaultIntensity)}
              style={{
                padding: "8px",
                background: isApplied ? "var(--color-primary-subtle, #312E81)" : "var(--color-surface, #1E293B)",
                border: `1px solid ${isApplied ? "var(--color-primary, #6366F1)" : "var(--color-border, #334155)"}`,
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                transition: "all 0.15s ease",
              }}
            >
              {/* Preview swatch thumbnail */}
              <div
                style={{
                  width: "100%",
                  height: 60,
                  borderRadius: 4,
                  background: "linear-gradient(45deg, #FF5E3A, #FF2A68, #0575E6, #00F260)",
                  filter: f.cssFilter,
                }}
              />
              <span style={{ fontSize: 11, color: isApplied ? "#FFF" : "#CBD5E1", fontWeight: 500 }}>
                {f.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

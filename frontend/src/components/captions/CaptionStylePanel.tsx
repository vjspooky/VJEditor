import React, { useState } from "react";

export interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  position: "bottom" | "top" | "center";
  animation: "none" | "word-by-word" | "karaoke-bounce";
}

interface CaptionStylePanelProps {
  styleConfig?: CaptionStyle;
  onChangeStyle?: (style: CaptionStyle) => void;
}

const DEFAULT_STYLE: CaptionStyle = {
  fontFamily: "Inter, sans-serif",
  fontSize: 24,
  textColor: "#FFFFFF",
  backgroundColor: "rgba(0, 0, 0, 0.75)",
  position: "bottom",
  animation: "word-by-word",
};

export default function CaptionStylePanel({
  styleConfig = DEFAULT_STYLE,
  onChangeStyle = () => {},
}: CaptionStylePanelProps) {
  const [current, setCurrent] = useState<CaptionStyle>(styleConfig);

  const update = (patch: Partial<CaptionStyle>) => {
    const updated = { ...current, ...patch };
    setCurrent(updated);
    onChangeStyle(updated);
  };

  return (
    <div
      style={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        color: "var(--color-text-primary, #F8FAFC)",
        fontSize: 13,
      }}
    >
      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Caption Styling</h4>

      {/* Subtitle Preview Box */}
      <div
        style={{
          height: 90,
          background: "#020617",
          border: "1px solid var(--color-border, #334155)",
          borderRadius: 6,
          display: "flex",
          alignItems: current.position === "bottom" ? "flex-end" : current.position === "top" ? "flex-start" : "center",
          justifyContent: "center",
          padding: 12,
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            fontFamily: current.fontFamily,
            fontSize: `${current.fontSize * 0.7}px`,
            color: current.textColor,
            backgroundColor: current.backgroundColor,
            padding: "4px 8px",
            borderRadius: 4,
            fontWeight: 700,
          }}
        >
          AI Generated Captions Preview
        </span>
      </div>

      {/* Font Size & Family */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <span style={{ fontSize: 11, color: "#94A3B8" }}>Font Family:</span>
          <select
            value={current.fontFamily}
            onChange={(e) => update({ fontFamily: e.target.value })}
            style={{
              width: "100%",
              padding: "4px 8px",
              background: "var(--color-surface, #1E293B)",
              color: "#FFF",
              border: "1px solid var(--color-border, #334155)",
              borderRadius: 4,
              marginTop: 4,
            }}
          >
            <option value="Inter, sans-serif">Inter</option>
            <option value="Roboto, sans-serif">Roboto</option>
            <option value="Montserrat, sans-serif">Montserrat</option>
            <option value="Impact, sans-serif">Impact (Viral)</option>
          </select>
        </div>
        <div>
          <span style={{ fontSize: 11, color: "#94A3B8" }}>Font Size ({current.fontSize}px):</span>
          <input
            type="range"
            min={16}
            max={48}
            value={current.fontSize}
            onChange={(e) => update({ fontSize: Number(e.target.value) })}
            style={{ width: "100%", marginTop: 8 }}
          />
        </div>
      </div>

      {/* Colors */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#94A3B8" }}>Text Color:</span>
          <input
            type="color"
            value={current.textColor}
            onChange={(e) => update({ textColor: e.target.value })}
            style={{ width: 28, height: 28, border: "none", cursor: "pointer", borderRadius: 4 }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#94A3B8" }}>Background:</span>
          <input
            type="color"
            value={current.backgroundColor.startsWith("#") ? current.backgroundColor : "#000000"}
            onChange={(e) => update({ backgroundColor: e.target.value })}
            style={{ width: 28, height: 28, border: "none", cursor: "pointer", borderRadius: 4 }}
          />
        </div>
      </div>

      {/* Placement Preset */}
      <div>
        <span style={{ fontSize: 11, color: "#94A3B8" }}>Placement:</span>
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          {(["bottom", "center", "top"] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => update({ position: pos })}
              style={{
                flex: 1,
                padding: "6px 0",
                fontSize: 12,
                background: current.position === pos ? "var(--color-primary, #6366F1)" : "var(--color-surface, #1E293B)",
                color: "#FFF",
                border: "1px solid var(--color-border, #334155)",
                borderRadius: 4,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Viral / Motion Style */}
      <div>
        <span style={{ fontSize: 11, color: "#94A3B8" }}>Animation Mode:</span>
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          {[
            { id: "none", label: "Static" },
            { id: "word-by-word", label: "Word-by-Word" },
            { id: "karaoke-bounce", label: "Karaoke" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => update({ animation: mode.id as any })}
              style={{
                flex: 1,
                padding: "6px 0",
                fontSize: 11,
                background: current.animation === mode.id ? "var(--color-primary, #6366F1)" : "var(--color-surface, #1E293B)",
                color: "#FFF",
                border: "1px solid var(--color-border, #334155)",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

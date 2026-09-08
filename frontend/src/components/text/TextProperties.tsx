import React from "react";
import { TextElement } from "../../models/text";

interface TextPropertiesProps {
  element: TextElement;
  onUpdate: (updates: Partial<TextElement>) => void;
  onDelete: (id: string) => void;
}

export default function TextProperties({ element, onUpdate, onDelete }: TextPropertiesProps) {
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Text Properties</h4>
        <button
          onClick={() => onDelete(element.id)}
          style={{
            padding: "4px 8px",
            background: "#EF444422",
            color: "#EF4444",
            border: "1px solid #EF444444",
            borderRadius: 4,
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          Delete Element
        </button>
      </div>

      {/* Content Textarea */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 11, color: "var(--color-text-secondary, #94A3B8)", textTransform: "uppercase" }}>
          Text Content
        </label>
        <textarea
          value={element.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          rows={3}
          style={{
            padding: 8,
            background: "var(--color-surface, #1E293B)",
            border: "1px solid var(--color-border, #334155)",
            borderRadius: 6,
            color: "#FFF",
            resize: "vertical",
            fontFamily: "inherit",
            fontSize: 13,
          }}
        />
      </div>

      {/* Transform */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label style={{ fontSize: 11, color: "var(--color-text-secondary, #94A3B8)", textTransform: "uppercase" }}>
          Transform
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <span style={{ fontSize: 11, color: "#64748B" }}>X Position:</span>
            <input
              type="number"
              value={Math.round(element.x)}
              onChange={(e) => onUpdate({ x: Number(e.target.value) })}
              style={{
                width: "100%",
                padding: "4px 8px",
                background: "var(--color-surface, #1E293B)",
                border: "1px solid var(--color-border, #334155)",
                borderRadius: 4,
                color: "#FFF",
              }}
            />
          </div>
          <div>
            <span style={{ fontSize: 11, color: "#64748B" }}>Y Position:</span>
            <input
              type="number"
              value={Math.round(element.y)}
              onChange={(e) => onUpdate({ y: Number(e.target.value) })}
              style={{
                width: "100%",
                padding: "4px 8px",
                background: "var(--color-surface, #1E293B)",
                border: "1px solid var(--color-border, #334155)",
                borderRadius: 4,
                color: "#FFF",
              }}
            />
          </div>
          <div>
            <span style={{ fontSize: 11, color: "#64748B" }}>Scale:</span>
            <input
              type="range"
              min={0.2}
              max={3}
              step={0.05}
              value={element.scale}
              onChange={(e) => onUpdate({ scale: Number(e.target.value) })}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <span style={{ fontSize: 11, color: "#64748B" }}>Rotation ({element.rotation}°):</span>
            <input
              type="range"
              min={-180}
              max={180}
              value={element.rotation}
              onChange={(e) => onUpdate({ rotation: Number(e.target.value) })}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <span style={{ fontSize: 11, color: "#64748B" }}>Letter Spacing ({element.letterSpacing}px):</span>
          <input
            type="range"
            min={-2}
            max={20}
            step={0.5}
            value={element.letterSpacing}
            onChange={(e) => onUpdate({ letterSpacing: Number(e.target.value) })}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <span style={{ fontSize: 11, color: "#64748B" }}>Line Height ({element.lineHeight}):</span>
          <input
            type="range"
            min={0.8}
            max={2.5}
            step={0.05}
            value={element.lineHeight}
            onChange={(e) => onUpdate({ lineHeight: Number(e.target.value) })}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* Opacity */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#64748B" }}>Opacity</span>
          <span style={{ fontSize: 11, color: "#64748B" }}>{Math.round(element.opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={element.opacity}
          onChange={(e) => onUpdate({ opacity: Number(e.target.value) })}
          style={{ width: "100%" }}
        />
      </div>

      {/* Background Box */}
      <div style={{ borderTop: "1px solid var(--color-border, #334155)", paddingTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>Background Box</span>
          <input
            type="color"
            value={element.backgroundColor || "#000000"}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            style={{ width: 24, height: 24, border: "none", cursor: "pointer", borderRadius: 4 }}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <span style={{ fontSize: 11, color: "#64748B" }}>Padding:</span>
            <input
              type="number"
              min={0}
              max={40}
              value={element.padding || 0}
              onChange={(e) => onUpdate({ padding: Number(e.target.value) })}
              style={{
                width: "100%",
                padding: "4px 8px",
                background: "var(--color-surface, #1E293B)",
                border: "1px solid var(--color-border, #334155)",
                borderRadius: 4,
                color: "#FFF",
              }}
            />
          </div>
          <div>
            <span style={{ fontSize: 11, color: "#64748B" }}>Corner Radius:</span>
            <input
              type="number"
              min={0}
              max={30}
              value={element.borderRadius || 0}
              onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
              style={{
                width: "100%",
                padding: "4px 8px",
                background: "var(--color-surface, #1E293B)",
                border: "1px solid var(--color-border, #334155)",
                borderRadius: 4,
                color: "#FFF",
              }}
            />
          </div>
        </div>
      </div>

      {/* Shadow */}
      <div style={{ borderTop: "1px solid var(--color-border, #334155)", paddingTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            id="text-shadow-toggle"
            checked={!!element.shadow}
            onChange={(e) => onUpdate({ shadow: e.target.checked, shadowColor: element.shadowColor || "rgba(0,0,0,0.8)" })}
          />
          <label htmlFor="text-shadow-toggle" style={{ fontSize: 12, cursor: "pointer" }}>
            Drop Shadow
          </label>
        </div>
      </div>
    </div>
  );
}

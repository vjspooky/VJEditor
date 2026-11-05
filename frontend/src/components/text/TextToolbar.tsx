import React from "react";
import { TextElement } from "../../models/text";

interface TextToolbarProps {
  selectedElement?: TextElement | null;
  onUpdate?: (updates: Partial<TextElement>) => void;
  onAddText?: (type: "heading" | "subheading" | "body") => void;
}

const FONT_FAMILIES = [
  "Inter, sans-serif",
  "Roboto, sans-serif",
  "Montserrat, sans-serif",
  "Playfair Display, serif",
  "'Courier New', monospace",
  "Impact, sans-serif",
];

export default function TextToolbar({ selectedElement, onUpdate, onAddText }: TextToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        background: "var(--color-surface, #1E293B)",
        borderBottom: "1px solid var(--color-border, #334155)",
        overflowX: "auto",
        fontSize: 13,
      }}
    >
      {onAddText && (
        <div style={{ display: "flex", gap: 6, borderRight: "1px solid var(--color-border, #334155)", paddingRight: 10 }}>
          <button
            onClick={() => onAddText("heading")}
            style={{
              padding: "4px 8px",
              fontSize: 12,
              fontWeight: 700,
              background: "var(--color-surface-raised, #334155)",
              color: "#FFF",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            + Heading
          </button>
          <button
            onClick={() => onAddText("subheading")}
            style={{
              padding: "4px 8px",
              fontSize: 12,
              fontWeight: 500,
              background: "var(--color-surface-raised, #334155)",
              color: "#CBD5E1",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            + Subhead
          </button>
          <button
            onClick={() => onAddText("body")}
            style={{
              padding: "4px 8px",
              fontSize: 12,
              background: "var(--color-surface-raised, #334155)",
              color: "#94A3B8",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            + Body
          </button>
        </div>
      )}

      {selectedElement && onUpdate && (
        <>
          <select
            value={selectedElement.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            style={{
              padding: "4px 8px",
              background: "var(--color-surface-raised, #334155)",
              color: "#FFF",
              border: "1px solid var(--color-border, #475569)",
              borderRadius: 4,
              fontSize: 12,
            }}
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font} value={font}>
                {font.split(",")[0].replace(/['"]/g, "")}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={10}
            max={200}
            value={selectedElement.fontSize}
            onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
            style={{
              width: 50,
              padding: "4px 6px",
              background: "var(--color-surface-raised, #334155)",
              color: "#FFF",
              border: "1px solid var(--color-border, #475569)",
              borderRadius: 4,
              fontSize: 12,
              textAlign: "center",
            }}
          />

          <button
            onClick={() =>
              onUpdate({
                fontWeight: selectedElement.fontWeight >= 700 ? 400 : 700,
              })
            }
            style={{
              padding: "4px 8px",
              fontWeight: 800,
              background: selectedElement.fontWeight >= 700 ? "var(--color-primary, #6366F1)" : "var(--color-surface-raised, #334155)",
              color: "#FFF",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            B
          </button>

          <button
            onClick={() =>
              onUpdate({
                fontStyle: selectedElement.fontStyle === "italic" ? "normal" : "italic",
              })
            }
            style={{
              padding: "4px 8px",
              fontStyle: "italic",
              background: selectedElement.fontStyle === "italic" ? "var(--color-primary, #6366F1)" : "var(--color-surface-raised, #334155)",
              color: "#FFF",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            I
          </button>

          <div style={{ display: "flex", gap: 2, background: "var(--color-surface-raised, #334155)", borderRadius: 4, padding: 2 }}>
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                onClick={() => onUpdate({ alignment: align })}
                style={{
                  padding: "4px 8px",
                  fontSize: 11,
                  background: selectedElement.alignment === align ? "var(--color-primary, #6366F1)" : "transparent",
                  color: "#FFF",
                  border: "none",
                  borderRadius: 3,
                  cursor: "pointer",
                }}
              >
                {align[0].toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="color"
              value={selectedElement.color.startsWith("#") ? selectedElement.color : "#FFFFFF"}
              onChange={(e) => onUpdate({ color: e.target.value })}
              style={{
                width: 26,
                height: 26,
                padding: 0,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderRadius: 4,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

import React from "react";
import { TextElement } from "../../models/text";

export interface TextPreset {
  id: string;
  name: string;
  category: "Titles" | "Subtitles" | "Lower Thirds" | "Effects";
  previewText: string;
  element: Omit<TextElement, "id" | "x" | "y">;
}

export const TEXT_PRESETS: TextPreset[] = [
  {
    id: "preset-title-bold",
    name: "Modern Headline",
    category: "Titles",
    previewText: "BOLD TITLE",
    element: {
      content: "BOLD TITLE",
      fontFamily: "Inter, sans-serif",
      fontSize: 48,
      fontWeight: 800,
      fontStyle: "normal",
      color: "#FFFFFF",
      opacity: 1,
      alignment: "center",
      letterSpacing: 2,
      lineHeight: 1.1,
      width: 400,
      height: 70,
      scale: 1,
      rotation: 0,
      shadow: true,
      shadowColor: "rgba(0, 0, 0, 0.75)",
    },
  },
  {
    id: "preset-neon-glow",
    name: "Cyber Neon",
    category: "Effects",
    previewText: "CYBERPUNK",
    element: {
      content: "CYBERPUNK",
      fontFamily: "'Courier New', monospace",
      fontSize: 42,
      fontWeight: 700,
      fontStyle: "normal",
      color: "#00FFCC",
      opacity: 1,
      alignment: "center",
      letterSpacing: 4,
      lineHeight: 1.2,
      width: 380,
      height: 60,
      scale: 1,
      rotation: 0,
      shadow: true,
      shadowColor: "#00FFCC",
      strokeColor: "#003322",
      strokeWidth: 2,
    },
  },
  {
    id: "preset-subhead-minimal",
    name: "Clean Subtitle",
    category: "Subtitles",
    previewText: "Elegant Minimal Caption",
    element: {
      content: "Elegant Minimal Caption",
      fontFamily: "Inter, sans-serif",
      fontSize: 22,
      fontWeight: 400,
      fontStyle: "normal",
      color: "#F1F5F9",
      opacity: 0.95,
      alignment: "center",
      letterSpacing: 0.5,
      lineHeight: 1.3,
      width: 320,
      height: 40,
      scale: 1,
      rotation: 0,
      backgroundColor: "rgba(15, 23, 42, 0.75)",
      backgroundOpacity: 0.75,
      padding: 8,
      borderRadius: 6,
    },
  },
  {
    id: "preset-lower-third",
    name: "News Lower Third",
    category: "Lower Thirds",
    previewText: "Speaker Name | Title",
    element: {
      content: "SPEAKER NAME\nLead Creative Director",
      fontFamily: "Inter, sans-serif",
      fontSize: 20,
      fontWeight: 600,
      fontStyle: "normal",
      color: "#FFFFFF",
      opacity: 1,
      alignment: "left",
      letterSpacing: 1,
      lineHeight: 1.25,
      width: 360,
      height: 60,
      scale: 1,
      rotation: 0,
      backgroundColor: "#6366F1",
      backgroundOpacity: 0.9,
      padding: 10,
      borderRadius: 4,
    },
  },
  {
    id: "preset-pill-badge",
    name: "Highlight Badge",
    category: "Effects",
    previewText: "HOT TOPIC",
    element: {
      content: "FEATURED",
      fontFamily: "Inter, sans-serif",
      fontSize: 16,
      fontWeight: 700,
      fontStyle: "normal",
      color: "#0F172A",
      opacity: 1,
      alignment: "center",
      letterSpacing: 1.5,
      lineHeight: 1,
      width: 140,
      height: 32,
      scale: 1,
      rotation: 0,
      backgroundColor: "#F59E0B",
      backgroundOpacity: 1,
      padding: 6,
      borderRadius: 16,
    },
  },
];

interface TextPresetsProps {
  onSelectPreset: (preset: TextPreset) => void;
}

export default function TextPresets({ onSelectPreset }: TextPresetsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary, #94A3B8)" }}>
        PRESET STYLES
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
        {TEXT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset)}
            style={{
              padding: "12px 10px",
              background: "var(--color-surface, #1E293B)",
              border: "1px solid var(--color-border, #334155)",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.15s ease",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-primary, #6366F1)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border, #334155)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: preset.element.fontWeight,
                color: preset.element.color,
                background: preset.element.backgroundColor || "transparent",
                padding: preset.element.padding ? "2px 6px" : undefined,
                borderRadius: preset.element.borderRadius || 0,
                textShadow: preset.element.shadow ? `0 2px 4px ${preset.element.shadowColor}` : "none",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {preset.previewText}
            </div>
            <span style={{ fontSize: 11, color: "var(--color-text-muted, #64748B)" }}>
              {preset.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

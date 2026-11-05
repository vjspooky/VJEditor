import React from "react";
import { Caption } from "../../models/caption";

interface CaptionItemProps {
  caption: Caption;
  isActive?: boolean;
  onUpdate: (id: string, updates: Partial<Caption>) => void;
  onDelete: (id: string) => void;
  onSeekTo?: (time: number) => void;
}

export default function CaptionItem({
  caption,
  isActive = false,
  onUpdate,
  onDelete,
  onSeekTo,
}: CaptionItemProps) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: isActive ? "var(--color-primary-subtle, #312E81)" : "var(--color-surface, #1E293B)",
        border: `1px solid ${isActive ? "var(--color-primary, #6366F1)" : "var(--color-border, #334155)"}`,
        borderRadius: 6,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        transition: "all 0.15s ease",
      }}
    >
      {/* Top row: timestamps, speaker, jump & delete */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => onSeekTo && onSeekTo(caption.startTime)}
            title="Jump to time"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-primary, #6366F1)",
              fontSize: 12,
              cursor: "pointer",
              padding: 0,
              fontWeight: 600,
            }}
          >
            ▶ {caption.startTime.toFixed(2)}s → {caption.endTime.toFixed(2)}s
          </button>
          {caption.speaker && (
            <span
              style={{
                fontSize: 10,
                background: "#334155",
                color: "#CBD5E1",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              {caption.speaker}
            </span>
          )}
        </div>

        <button
          onClick={() => onDelete(caption.id)}
          style={{
            background: "transparent",
            border: "none",
            color: "#64748B",
            cursor: "pointer",
            fontSize: 14,
            padding: 2,
          }}
          title="Delete caption"
        >
          ✕
        </button>
      </div>

      {/* Editable subtitle text */}
      <textarea
        value={caption.text}
        onChange={(e) => onUpdate(caption.id, { text: e.target.value })}
        rows={2}
        style={{
          width: "100%",
          padding: "6px 8px",
          background: "var(--color-surface-raised, #0F172A)",
          border: "1px solid var(--color-border, #334155)",
          borderRadius: 4,
          color: "#FFF",
          fontSize: 13,
          fontFamily: "inherit",
          resize: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

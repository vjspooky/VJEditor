import React from "react";
import { AudioClip } from "../../models/audio";

interface AudioPropertiesProps {
  clip: AudioClip;
  onUpdate: (updates: Partial<AudioClip>) => void;
  onDelete?: (id: string) => void;
}

export default function AudioProperties({ clip, onUpdate, onDelete }: AudioPropertiesProps) {
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
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Audio Clip Properties</h4>
        {onDelete && (
          <button
            onClick={() => onDelete(clip.id)}
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
            Delete Clip
          </button>
        )}
      </div>

      {/* Volume Slider */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "#94A3B8" }}>Gain / Volume</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{Math.round(clip.volume * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={2}
          step={0.01}
          value={clip.volume}
          onChange={(e) => onUpdate({ volume: Number(e.target.value) })}
          style={{ width: "100%" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748B" }}>
          <span>0% (Mute)</span>
          <span>100% (Unity)</span>
          <span>200% (+6dB)</span>
        </div>
      </div>

      {/* Mute Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          type="checkbox"
          id={`mute-clip-${clip.id}`}
          checked={clip.muted}
          onChange={(e) => onUpdate({ muted: e.target.checked })}
        />
        <label htmlFor={`mute-clip-${clip.id}`} style={{ fontSize: 13, cursor: "pointer" }}>
          Mute this clip
        </label>
      </div>

      {/* Fades */}
      <div style={{ borderTop: "1px solid var(--color-border, #334155)", paddingTop: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase" }}>
          Envelope & Fades
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
          <div>
            <span style={{ fontSize: 11, color: "#64748B" }}>Fade In ({clip.fadeIn}s):</span>
            <input
              type="number"
              min={0}
              max={Math.min(10, clip.duration / 2)}
              step={0.1}
              value={clip.fadeIn}
              onChange={(e) => onUpdate({ fadeIn: Number(e.target.value) })}
              style={{
                width: "100%",
                padding: "4px 8px",
                background: "var(--color-surface, #1E293B)",
                border: "1px solid var(--color-border, #334155)",
                borderRadius: 4,
                color: "#FFF",
                marginTop: 4,
              }}
            />
          </div>
          <div>
            <span style={{ fontSize: 11, color: "#64748B" }}>Fade Out ({clip.fadeOut}s):</span>
            <input
              type="number"
              min={0}
              max={Math.min(10, clip.duration / 2)}
              step={0.1}
              value={clip.fadeOut}
              onChange={(e) => onUpdate({ fadeOut: Number(e.target.value) })}
              style={{
                width: "100%",
                padding: "4px 8px",
                background: "var(--color-surface, #1E293B)",
                border: "1px solid var(--color-border, #334155)",
                borderRadius: 4,
                color: "#FFF",
                marginTop: 4,
              }}
            />
          </div>
        </div>
      </div>

      {/* Timing Info */}
      <div style={{ borderTop: "1px solid var(--color-border, #334155)", paddingTop: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase" }}>
          Timeline Placement
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          <div style={{ background: "var(--color-surface, #1E293B)", padding: 8, borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: "#64748B" }}>Start Time</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{clip.startTime.toFixed(2)}s</div>
          </div>
          <div style={{ background: "var(--color-surface, #1E293B)", padding: 8, borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: "#64748B" }}>Duration</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{clip.duration.toFixed(2)}s</div>
          </div>
        </div>
      </div>
    </div>
  );
}

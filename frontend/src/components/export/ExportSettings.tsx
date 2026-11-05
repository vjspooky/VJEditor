import React from "react";
import { ExportSettings as TExportSettings } from "../../models/export";

interface ExportSettingsProps {
  settings: TExportSettings;
  onChange: (settings: TExportSettings) => void;
}

export default function ExportSettings({ settings, onChange }: ExportSettingsProps) {
  const update = (patch: Partial<TExportSettings>) => {
    onChange({ ...settings, ...patch });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Format & Resolution */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
            Container Format
          </label>
          <select
            value={settings.format}
            onChange={(e) => update({ format: e.target.value as TExportSettings["format"] })}
            style={{
              width: "100%",
              padding: "8px",
              background: "var(--color-surface, #1E293B)",
              color: "#FFF",
              border: "1px solid var(--color-border, #334155)",
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            <option value="mp4">MP4 (H.264 / AAC) — Universal</option>
            <option value="webm">WebM (VP9 / Opus) — Web Optimized</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
            Resolution
          </label>
          <select
            value={settings.resolution}
            onChange={(e) => update({ resolution: e.target.value as TExportSettings["resolution"] })}
            style={{
              width: "100%",
              padding: "8px",
              background: "var(--color-surface, #1E293B)",
              color: "#FFF",
              border: "1px solid var(--color-border, #334155)",
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            <option value="720p">720p HD (Fast Draft)</option>
            <option value="1080p">1080p Full HD (Recommended)</option>
            <option value="4K">4K Ultra HD (Master Quality)</option>
          </select>
        </div>
      </div>

      {/* Frame Rate & Aspect Ratio */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
            Frame Rate (FPS)
          </label>
          <select
            value={settings.fps}
            onChange={(e) => update({ fps: Number(e.target.value) as TExportSettings["fps"] })}
            style={{
              width: "100%",
              padding: "8px",
              background: "var(--color-surface, #1E293B)",
              color: "#FFF",
              border: "1px solid var(--color-border, #334155)",
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            <option value={24}>24 FPS (Cinematic)</option>
            <option value={25}>25 FPS (PAL Broadcast)</option>
            <option value={30}>30 FPS (Standard Online)</option>
            <option value={60}>60 FPS (Ultra Smooth Motion)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
            Aspect Ratio
          </label>
          <select
            value={settings.aspectRatio}
            onChange={(e) => update({ aspectRatio: e.target.value as TExportSettings["aspectRatio"] })}
            style={{
              width: "100%",
              padding: "8px",
              background: "var(--color-surface, #1E293B)",
              color: "#FFF",
              border: "1px solid var(--color-border, #334155)",
              borderRadius: 6,
              fontSize: 13,
            }}
          >
            <option value="16:9">16:9 (YouTube, Desktop)</option>
            <option value="9:16">9:16 (TikTok, Reels, Shorts)</option>
            <option value="1:1">1:1 (Square, Feed Post)</option>
            <option value="4:5">4:5 (Portrait, Instagram)</option>
          </select>
        </div>
      </div>

      {/* Quality Presets */}
      <div>
        <label style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
          Encoding Quality & Bitrate
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {(["draft", "standard", "high", "maximum"] as const).map((q) => (
            <button
              key={q}
              onClick={() => update({ quality: q })}
              style={{
                padding: "10px 4px",
                background: settings.quality === q ? "var(--color-primary, #6366F1)" : "var(--color-surface, #1E293B)",
                color: "#FFF",
                border: `1px solid ${settings.quality === q ? "var(--color-primary, #6366F1)" : "var(--color-border, #334155)"}`,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                textTransform: "capitalize",
                cursor: "pointer",
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

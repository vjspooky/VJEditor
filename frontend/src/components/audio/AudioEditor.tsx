import React, { useState } from "react";
import { AudioClip } from "../../models/audio";
import Waveform from "./Waveform";
import AudioProperties from "./AudioProperties";
import AudioControls from "./AudioControls";

interface AudioEditorProps {
  clips?: AudioClip[];
  currentTime?: number;
  duration?: number;
  isPlaying?: boolean;
  selectedClipId?: string | null;
  onSelectClip?: (id: string | null) => void;
  onUpdateClip?: (id: string, updates: Partial<AudioClip>) => void;
  onDeleteClip?: (id: string) => void;
  onSeek?: (time: number) => void;
  onTogglePlay?: () => void;
}

export default function AudioEditor({
  clips = [],
  currentTime = 0,
  duration = 30,
  isPlaying = false,
  selectedClipId = null,
  onSelectClip = () => {},
  onUpdateClip = () => {},
  onDeleteClip = () => {},
  onSeek = () => {},
  onTogglePlay = () => {},
}: AudioEditorProps) {
  const [masterVolume, setMasterVolume] = useState(1);
  const [isMasterMuted, setIsMasterMuted] = useState(false);

  const selectedClip = clips.find((c) => c.id === selectedClipId);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--color-background-secondary, #0F172A)",
        borderRight: "1px solid var(--color-border, #334155)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          background: "var(--color-surface, #1E293B)",
          borderBottom: "1px solid var(--color-border, #334155)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: "#FFF" }}>Audio Mixer</span>
        <span style={{ fontSize: 11, color: "#94A3B8" }}>{clips.length} Clips</span>
      </div>

      {/* Waveform Scrubber Section */}
      <div
        style={{
          padding: "12px 16px",
          background: "var(--color-surface-raised, #1E293B)",
          borderBottom: "1px solid var(--color-border, #334155)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>
          <span>Master Waveform</span>
          <span>
            {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
          </span>
        </div>
        <Waveform
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
          height={48}
        />
      </div>

      {/* Main Body: Clips List & Inspector */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Audio Clips Overview */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase" }}>
            Audio Tracks & Layers
          </span>
          {clips.length === 0 ? (
            <div style={{ textAlign: "center", color: "#64748B", padding: "24px 0", fontSize: 13 }}>
              No audio clips in project. Drag audio into the timeline to edit.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {clips.map((clip) => {
                const isSelected = clip.id === selectedClipId;
                return (
                  <div
                    key={clip.id}
                    onClick={() => onSelectClip(clip.id)}
                    style={{
                      padding: "8px 12px",
                      background: isSelected ? "var(--color-primary-subtle, #312E81)" : "var(--color-surface, #1E293B)",
                      border: `1px solid ${isSelected ? "var(--color-primary, #6366F1)" : "var(--color-border, #334155)"}`,
                      borderRadius: 6,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14 }}>🎵</span>
                      <div>
                        <div style={{ fontSize: 13, color: "#FFF", fontWeight: 500 }}>
                          Audio Clip ({clip.id.slice(0, 6)})
                        </div>
                        <div style={{ fontSize: 10, color: "#94A3B8" }}>
                          {clip.startTime.toFixed(1)}s - {(clip.startTime + clip.duration).toFixed(1)}s
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: clip.muted ? "#EF4444" : "#10B981" }}>
                      {clip.muted ? "Muted" : `${Math.round(clip.volume * 100)}%`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Clip Inspector */}
        {selectedClip && (
          <div style={{ borderTop: "1px solid var(--color-border, #334155)", paddingTop: 16 }}>
            <AudioProperties
              clip={selectedClip}
              onUpdate={(updates) => onUpdateClip(selectedClip.id, updates)}
              onDelete={(id) => {
                onDeleteClip(id);
                onSelectClip(null);
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom Master Audio Controls */}
      <AudioControls
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        masterVolume={masterVolume}
        onMasterVolumeChange={setMasterVolume}
        isMasterMuted={isMasterMuted}
        onToggleMasterMute={() => setIsMasterMuted(!isMasterMuted)}
      />
    </div>
  );
}

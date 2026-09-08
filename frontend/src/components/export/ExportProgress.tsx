import React from "react";

export interface RenderProgressData {
  stage: "preparing" | "video_rendering" | "audio_mixing" | "packaging" | "complete" | "failed";
  progressPercent: number; // 0 to 100
  elapsedSeconds: number;
  estimatedRemainingSeconds?: number;
  errorMessage?: string;
}

interface ExportProgressProps {
  progress: RenderProgressData;
  onCancel?: () => void;
  onDownload?: () => void;
}

const STAGES = [
  { key: "preparing", label: "Preparing Assets" },
  { key: "video_rendering", label: "Rendering Video Frames" },
  { key: "audio_mixing", label: "Mixing Audio Tracks" },
  { key: "packaging", label: "FFmpeg Multiplexing" },
  { key: "complete", label: "Ready to Download" },
];

export default function ExportProgress({ progress, onCancel, onDownload }: ExportProgressProps) {
  const isComplete = progress.stage === "complete" || progress.progressPercent >= 100;
  const isFailed = progress.stage === "failed";

  return (
    <div
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        background: "var(--color-surface, #1E293B)",
        borderRadius: 8,
        border: "1px solid var(--color-border, #334155)",
      }}
    >
      {/* Title / Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#FFF" }}>
            {isFailed ? "Export Failed" : isComplete ? "Export Complete! 🎉" : "Rendering Video..."}
          </h4>
          <span style={{ fontSize: 12, color: "#94A3B8" }}>
            Elapsed: {progress.elapsedSeconds.toFixed(1)}s
            {progress.estimatedRemainingSeconds && !isComplete && ` • Est. Remaining: ~${progress.estimatedRemainingSeconds.toFixed(0)}s`}
          </span>
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, color: isComplete ? "#10B981" : "var(--color-primary, #6366F1)" }}>
          {Math.round(progress.progressPercent)}%
        </span>
      </div>

      {/* Main Progress Bar */}
      <div style={{ width: "100%", height: 10, background: "#0F172A", borderRadius: 5, overflow: "hidden" }}>
        <div
          style={{
            width: `${Math.min(100, Math.max(0, progress.progressPercent))}%`,
            height: "100%",
            background: isFailed ? "#EF4444" : isComplete ? "#10B981" : "linear-gradient(90deg, #6366F1 0%, #A855F7 100%)",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Stage Steps Indicator */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {STAGES.map((s, idx) => {
          const isPassed =
            progress.progressPercent >= ((idx + 1) / STAGES.length) * 100 || isComplete;
          const isCurrent = progress.stage === s.key && !isComplete;

          return (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: isPassed ? "#10B981" : isCurrent ? "var(--color-primary, #6366F1)" : "#334155",
                  color: "#FFF",
                  fontSize: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                {isPassed ? "✓" : idx + 1}
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: isPassed ? "#CBD5E1" : isCurrent ? "#FFF" : "#64748B",
                  fontWeight: isCurrent ? 600 : 400,
                }}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {isFailed && progress.errorMessage && (
        <div style={{ padding: 10, background: "#EF444422", border: "1px solid #EF444444", borderRadius: 6, color: "#EF4444", fontSize: 12 }}>
          {progress.errorMessage}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
        {!isComplete && !isFailed && onCancel && (
          <button
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              background: "transparent",
              color: "#CBD5E1",
              border: "1px solid var(--color-border, #334155)",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Cancel Render
          </button>
        )}

        {isComplete && onDownload && (
          <button
            onClick={onDownload}
            style={{
              padding: "10px 20px",
              background: "var(--color-primary, #6366F1)",
              color: "#FFF",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Download Finished Video 📥
          </button>
        )}
      </div>
    </div>
  );
}

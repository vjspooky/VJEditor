import React, { useState } from "react";
import { ExportSettings as TExportSettings } from "../../models/export";
import Modal from "../common/Modal";
import ExportSettings from "./ExportSettings";
import ExportProgress, { RenderProgressData } from "./ExportProgress";
import ExportHistory, { PastExport } from "./ExportHistory";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  onStartExport?: (settings: TExportSettings) => Promise<void> | void;
}

const DEFAULT_SETTINGS: TExportSettings = {
  format: "mp4",
  resolution: "1080p",
  fps: 30,
  aspectRatio: "16:9",
  quality: "high",
};

export default function ExportModal({
  isOpen,
  onClose,
  projectName = "Untitled Video",
  onStartExport,
}: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<"settings" | "progress" | "history">("settings");
  const [settings, setSettings] = useState<TExportSettings>(DEFAULT_SETTINGS);

  const [progress, setProgress] = useState<RenderProgressData>({
    stage: "preparing",
    progressPercent: 0,
    elapsedSeconds: 0,
  });

  const [history, setHistory] = useState<PastExport[]>([
    {
      id: "exp-demo-1",
      projectName,
      resolution: "1080p",
      format: "mp4",
      fileSizeMb: 42.5,
      downloadUrl: "#",
      createdAt: "Today at 2:30 PM",
      status: "completed",
    },
  ]);

  const handleStartRender = async () => {
    setActiveTab("progress");
    setProgress({
      stage: "preparing",
      progressPercent: 10,
      elapsedSeconds: 0,
      estimatedRemainingSeconds: 25,
    });

    if (onStartExport) {
      await onStartExport(settings);
    }

    // Simulated progress transitions
    const stages: RenderProgressData["stage"][] = [
      "preparing",
      "video_rendering",
      "audio_mixing",
      "packaging",
      "complete",
    ];

    let currentStageIndex = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextPercent = prev.progressPercent + 15;
        if (nextPercent >= 100) {
          clearInterval(interval);
          setHistory((prevHist) => [
            {
              id: `exp-${Date.now()}`,
              projectName,
              resolution: settings.resolution,
              format: settings.format,
              fileSizeMb: 38.2,
              downloadUrl: "#",
              createdAt: "Just now",
              status: "completed",
            },
            ...prevHist,
          ]);
          return {
            stage: "complete",
            progressPercent: 100,
            elapsedSeconds: prev.elapsedSeconds + 1,
          };
        }

        currentStageIndex = Math.min(
          stages.length - 1,
          Math.floor((nextPercent / 100) * stages.length)
        );

        return {
          stage: stages[currentStageIndex],
          progressPercent: nextPercent,
          elapsedSeconds: prev.elapsedSeconds + 1,
          estimatedRemainingSeconds: Math.max(0, 10 - prev.elapsedSeconds),
        };
      });
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Export Project — ${projectName}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 520 }}>
        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--color-border, #334155)",
            gap: 12,
          }}
        >
          <button
            onClick={() => setActiveTab("settings")}
            style={{
              padding: "8px 12px",
              background: "transparent",
              color: activeTab === "settings" ? "var(--color-primary, #6366F1)" : "#94A3B8",
              border: "none",
              borderBottom: activeTab === "settings" ? "2px solid var(--color-primary, #6366F1)" : "2px solid transparent",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Export Settings
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            style={{
              padding: "8px 12px",
              background: "transparent",
              color: activeTab === "progress" ? "var(--color-primary, #6366F1)" : "#94A3B8",
              border: "none",
              borderBottom: activeTab === "progress" ? "2px solid var(--color-primary, #6366F1)" : "2px solid transparent",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Render Queue ({progress.progressPercent > 0 && progress.progressPercent < 100 ? "Rendering" : "Idle"})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            style={{
              padding: "8px 12px",
              background: "transparent",
              color: activeTab === "history" ? "var(--color-primary, #6366F1)" : "#94A3B8",
              border: "none",
              borderBottom: activeTab === "history" ? "2px solid var(--color-primary, #6366F1)" : "2px solid transparent",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            History ({history.length})
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ExportSettings settings={settings} onChange={setSettings} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #334155", paddingTop: 14 }}>
              <button
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  color: "#94A3B8",
                  border: "1px solid #334155",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleStartRender}
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
                Start Render 🚀
              </button>
            </div>
          </div>
        )}

        {activeTab === "progress" && (
          <ExportProgress
            progress={progress}
            onCancel={() => {
              setProgress({ stage: "failed", progressPercent: 0, elapsedSeconds: 0, errorMessage: "Cancelled by user" });
            }}
            onDownload={() => alert("Downloading finished video!")}
          />
        )}

        {activeTab === "history" && (
          <ExportHistory
            history={history}
            onDownload={(item) => alert(`Downloading ${item.projectName}`)}
            onDelete={(id) => setHistory(history.filter((h) => h.id !== id))}
          />
        )}
      </div>
    </Modal>
  );
}

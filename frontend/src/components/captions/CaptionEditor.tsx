import React, { useState } from "react";
import { Caption } from "../../models/caption";
import CaptionItem from "./CaptionItem";
import CaptionStylePanel, { CaptionStyle } from "./CaptionStylePanel";

interface CaptionEditorProps {
  captions?: Caption[];
  currentTime?: number;
  onUpdateCaption?: (id: string, updates: Partial<Caption>) => void;
  onDeleteCaption?: (id: string) => void;
  onAddCaption?: (caption: Caption) => void;
  onSeekTo?: (time: number) => void;
  onGenerateAutoCaptions?: (language: string) => Promise<void> | void;
}

export default function CaptionEditor({
  captions = [],
  currentTime = 0,
  onUpdateCaption = () => {},
  onDeleteCaption = () => {},
  onAddCaption = () => {},
  onSeekTo = () => {},
  onGenerateAutoCaptions,
}: CaptionEditorProps) {
  const [activeTab, setActiveTab] = useState<"list" | "style">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!onGenerateAutoCaptions) return;
    setIsGenerating(true);
    try {
      await onGenerateAutoCaptions(selectedLanguage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddNewManual = () => {
    const newCaption: Caption = {
      id: `cap-${Date.now()}`,
      text: "New subtitle line",
      startTime: currentTime,
      endTime: currentTime + 2.5,
      language: selectedLanguage,
    };
    onAddCaption(newCaption);
  };

  const handleExportSRT = () => {
    let srtContent = "";
    captions.forEach((cap, index) => {
      const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600).toString().padStart(2, "0");
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
        const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
        const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, "0");
        return `${hrs}:${mins}:${secs},${ms}`;
      };

      srtContent += `${index + 1}\n${formatTime(cap.startTime)} --> ${formatTime(cap.endTime)}\n${cap.text}\n\n`;
    });

    const blob = new Blob([srtContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subtitles.srt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredCaptions = captions.filter((c) =>
    c.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Top Header */}
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
        <span style={{ fontSize: 14, fontWeight: 600, color: "#FFF" }}>Captions & Subtitles</span>
        <button
          onClick={handleExportSRT}
          disabled={captions.length === 0}
          style={{
            padding: "4px 8px",
            fontSize: 11,
            background: "transparent",
            color: captions.length > 0 ? "var(--color-primary, #6366F1)" : "#475569",
            border: "1px solid var(--color-border, #334155)",
            borderRadius: 4,
            cursor: captions.length > 0 ? "pointer" : "not-allowed",
          }}
        >
          Export SRT
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-border, #334155)",
          padding: "0 12px",
          gap: 8,
          background: "var(--color-surface, #1E293B)",
        }}
      >
        <button
          onClick={() => setActiveTab("list")}
          style={{
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 600,
            background: "transparent",
            color: activeTab === "list" ? "var(--color-primary, #6366F1)" : "var(--color-text-secondary, #94A3B8)",
            border: "none",
            borderBottom: activeTab === "list" ? "2px solid var(--color-primary, #6366F1)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Subtitle Lines ({captions.length})
        </button>
        <button
          onClick={() => setActiveTab("style")}
          style={{
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 600,
            background: "transparent",
            color: activeTab === "style" ? "var(--color-primary, #6366F1)" : "var(--color-text-secondary, #94A3B8)",
            border: "none",
            borderBottom: activeTab === "style" ? "2px solid var(--color-primary, #6366F1)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          Style & Placement
        </button>
      </div>

      {activeTab === "style" ? (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <CaptionStylePanel />
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* AI Auto-Generation Banner */}
          <div
            style={{
              padding: 14,
              background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",
              border: "1px solid #4338CA",
              borderRadius: 8,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>✨</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#EEF2FF" }}>
                Auto-Transcribe Speech (Whisper AI)
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                style={{
                  padding: "6px 8px",
                  background: "#0F172A",
                  color: "#FFF",
                  border: "1px solid #475569",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
              </select>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  flex: 1,
                  padding: "6px 12px",
                  background: "var(--color-primary, #6366F1)",
                  color: "#FFF",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: isGenerating ? "wait" : "pointer",
                }}
              >
                {isGenerating ? "Transcribing Audio..." : "Generate Captions"}
              </button>
            </div>
          </div>

          {/* Search & Add row */}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Search captions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: "6px 10px",
                background: "var(--color-surface, #1E293B)",
                border: "1px solid var(--color-border, #334155)",
                borderRadius: 4,
                color: "#FFF",
                fontSize: 12,
              }}
            />
            <button
              onClick={handleAddNewManual}
              style={{
                padding: "6px 10px",
                background: "var(--color-surface, #1E293B)",
                color: "#CBD5E1",
                border: "1px solid var(--color-border, #334155)",
                borderRadius: 4,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              + Line
            </button>
          </div>

          {/* Subtitle Rows List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredCaptions.length === 0 ? (
              <div style={{ textAlign: "center", color: "#64748B", padding: "30px 0", fontSize: 13 }}>
                {searchQuery ? "No captions match search" : "No captions yet. Click Generate or + Line."}
              </div>
            ) : (
              filteredCaptions.map((caption) => {
                const isActive = currentTime >= caption.startTime && currentTime <= caption.endTime;
                return (
                  <CaptionItem
                    key={caption.id}
                    caption={caption}
                    isActive={isActive}
                    onUpdate={onUpdateCaption}
                    onDelete={onDeleteCaption}
                    onSeekTo={onSeekTo}
                  />
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

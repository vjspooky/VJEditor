import { useState } from "react";
import EditorHeader from "./EditorHeader";
import Toolbar from "./Toolbar";
import PreviewPanel from "./PreviewPanel";
import PropertiesPanel from "./PropertiesPanel";
import PlaybackControls from "./PlaybackControls";
import Timeline from "../timeline/Timeline";
import MediaLibrary from "../media/MediaLibrary";

export default function Editor() {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(60);

  return (
    <div
      id="editor-root"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "var(--color-bg)",
      }}
    >
      <EditorHeader />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left panel — Toolbar + Media */}
        <aside style={{
          width: 220,
          borderRight: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          <Toolbar />
          <MediaLibrary />
        </aside>

        {/* Center — Preview */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <PreviewPanel currentTime={currentTime} />
          <PlaybackControls
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onSeek={setCurrentTime}
          />
        </main>

        {/* Right panel — Properties */}
        <aside style={{
          width: 260,
          borderLeft: "1px solid var(--color-border)",
          overflow: "auto",
        }}>
          <PropertiesPanel />
        </aside>
      </div>

      {/* Bottom — Timeline */}
      <div style={{ height: 260, borderTop: "1px solid var(--color-border)" }}>
        <Timeline
          currentTime={currentTime}
          onSeek={setCurrentTime}
          isPlaying={isPlaying}
        />
      </div>
    </div>
  );
}

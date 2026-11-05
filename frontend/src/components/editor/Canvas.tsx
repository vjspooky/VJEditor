interface CanvasProps {
  currentTime: number;
  width?: number;
  height?: number;
}

export default function Canvas({ currentTime, width = 1920, height = 1080 }: CanvasProps) {
  // Aspect ratio box — fills container preserving 16:9
  return (
    <div
      id="editor-canvas"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: `${width} / ${height}`,
        background: "#000",
        borderRadius: "var(--radius-sm)",
        overflow: "hidden",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      {/* Canvas render layer — clips will be composited here */}
      <div
        id="canvas-render-layer"
        style={{ position: "absolute", inset: 0 }}
      />
      {/* Overlay: current time display (dev aid) */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          right: 10,
          fontSize: "0.65rem",
          color: "rgba(255,255,255,0.35)",
          fontFamily: "monospace",
          pointerEvents: "none",
        }}
      >
        {currentTime.toFixed(2)}s
      </div>
    </div>
  );
}

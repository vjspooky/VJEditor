import Canvas from "./Canvas";

interface PreviewPanelProps {
  currentTime: number;
}

export default function PreviewPanel({ currentTime }: PreviewPanelProps) {
  return (
    <div
      id="preview-panel"
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0b0e",
        padding: "20px 24px",
        overflow: "hidden",
      }}
    >
      <div style={{ width: "min(100%, calc((100vh - 360px) * (16/9)))" }}>
        <Canvas currentTime={currentTime} />
      </div>
    </div>
  );
}

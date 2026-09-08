interface TimelineToolbarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export default function TimelineToolbar({ zoom, onZoomChange }: TimelineToolbarProps) {
  return (
    <div
      id="timeline-toolbar"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 12px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        flexShrink: 0,
        height: 36,
      }}
    >
      <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", fontWeight: 600 }}>TIMELINE</span>
      <div style={{ flex: 1 }} />

      {/* Zoom controls */}
      <button
        id="timeline-zoom-out"
        aria-label="Zoom out timeline"
        onClick={() => onZoomChange(Math.max(0.25, zoom - 0.25))}
        style={zoomBtnStyle}
      >
        −
      </button>
      <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", minWidth: 32, textAlign: "center" }}>
        {Math.round(zoom * 100)}%
      </span>
      <button
        id="timeline-zoom-in"
        aria-label="Zoom in timeline"
        onClick={() => onZoomChange(Math.min(8, zoom + 0.25))}
        style={zoomBtnStyle}
      >
        +
      </button>
    </div>
  );
}

const zoomBtnStyle: React.CSSProperties = {
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: "var(--radius-sm)",
  padding: "2px 8px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: 600,
};

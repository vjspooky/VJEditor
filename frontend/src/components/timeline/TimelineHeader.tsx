export default function TimelineHeader() {
  return (
    <div
      style={{
        height: 32,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        fontSize: "0.72rem",
        color: "var(--color-text-muted)",
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      Tracks
    </div>
  );
}

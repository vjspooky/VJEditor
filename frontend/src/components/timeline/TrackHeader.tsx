interface TrackHeaderProps {
  name: string;
  muted: boolean;
  locked: boolean;
  visible: boolean;
  onToggleMute: () => void;
  onToggleLock: () => void;
  onToggleVisible: () => void;
}

export default function TrackHeader({
  name,
  muted,
  locked,
  visible,
  onToggleMute,
  onToggleLock,
  onToggleVisible,
}: TrackHeaderProps) {
  return (
    <div
      style={{
        height: 48,
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        gap: 4,
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <span style={{ flex: 1, fontSize: "0.75rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {name}
      </span>
      <button
        aria-label={visible ? "Hide track" : "Show track"}
        title={visible ? "Hide" : "Show"}
        onClick={onToggleVisible}
        style={{ ...iconBtnStyle, color: visible ? "var(--color-text-muted)" : "var(--color-text-dim)" }}
      >
        {visible ? "👁" : "🙈"}
      </button>
      <button
        aria-label={muted ? "Unmute track" : "Mute track"}
        title={muted ? "Unmute" : "Mute"}
        onClick={onToggleMute}
        style={{ ...iconBtnStyle, color: muted ? "var(--color-danger)" : "var(--color-text-muted)" }}
      >
        {muted ? "🔇" : "🔊"}
      </button>
      <button
        aria-label={locked ? "Unlock track" : "Lock track"}
        title={locked ? "Unlock" : "Lock"}
        onClick={onToggleLock}
        style={{ ...iconBtnStyle, color: locked ? "var(--color-warning)" : "var(--color-text-muted)" }}
      >
        {locked ? "🔒" : "🔓"}
      </button>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: "0.8rem",
  padding: "2px",
  borderRadius: "var(--radius-sm)",
  lineHeight: 1,
};

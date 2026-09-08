import { TimelineClip as TClip } from "../../models/timeline";

interface TimelineClipProps {
  clip: TClip;
  pps: number;
  trackColor: string;
}

export default function TimelineClip({ clip, pps, trackColor }: TimelineClipProps) {
  const left = clip.startTime * pps;
  const width = clip.duration * pps;

  return (
    <div
      id={`clip-${clip.id}`}
      draggable
      role="button"
      tabIndex={0}
      aria-label={`Clip: ${clip.name}`}
      title={clip.name}
      style={{
        position: "absolute",
        top: 4,
        bottom: 4,
        left,
        width: Math.max(width, 4),
        background: trackColor,
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 4,
        cursor: "grab",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        paddingLeft: 6,
        transition: "border-color var(--transition-fast)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
    >
      <span style={{ fontSize: "0.68rem", fontWeight: 500, color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {clip.name}
      </span>
    </div>
  );
}

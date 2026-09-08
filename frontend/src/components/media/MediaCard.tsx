import { MediaAsset } from "../../models/media";

interface MediaCardProps {
  asset: MediaAsset;
  onClick: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  video: "🎥",
  image: "🖼️",
  audio: "🎵",
};

export default function MediaCard({ asset, onClick }: MediaCardProps) {
  return (
    <button
      id={`media-card-${asset.id}`}
      onClick={onClick}
      title={asset.name}
      style={{
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        padding: 0,
        overflow: "hidden",
        cursor: "pointer",
        textAlign: "left",
        transition: "border-color var(--transition-fast)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
      draggable
      onDragStart={(e) => e.dataTransfer.setData("mediaId", asset.id)}
    >
      <div
        style={{
          height: 64,
          background: asset.thumbnail
            ? `url(${asset.thumbnail}) center/cover`
            : "var(--color-surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.6rem",
        }}
      >
        {!asset.thumbnail && TYPE_ICONS[asset.type]}
      </div>
      <div style={{ padding: "5px 7px" }}>
        <div style={{
          fontSize: "0.7rem",
          fontWeight: 500,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {asset.name}
        </div>
        {asset.duration != null && (
          <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>
            {asset.duration.toFixed(1)}s
          </div>
        )}
      </div>
    </button>
  );
}

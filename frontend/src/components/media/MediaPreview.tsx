import { MediaAsset } from "../../models/media";

interface MediaPreviewProps {
  asset: MediaAsset;
  onClose: () => void;
}

export default function MediaPreview({ asset, onClose }: MediaPreviewProps) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.8)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          maxWidth: 720,
          width: "90%",
          boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600 }}>{asset.name}</span>
          <button id="media-preview-close" onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--color-text-muted)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
        </div>
        <div style={{ padding: 20, textAlign: "center" }}>
          {asset.type === "video" && (
            <video src={asset.url} controls style={{ maxWidth: "100%", borderRadius: "var(--radius-md)" }} />
          )}
          {asset.type === "image" && (
            <img src={asset.url} alt={asset.name} style={{ maxWidth: "100%", borderRadius: "var(--radius-md)" }} />
          )}
          {asset.type === "audio" && (
            <audio src={asset.url} controls style={{ width: "100%" }} />
          )}
          <div style={{ marginTop: 12, fontSize: "0.8rem", color: "var(--color-text-muted)", display: "flex", gap: 16, justifyContent: "center" }}>
            <span>{asset.type.toUpperCase()}</span>
            {asset.duration != null && <span>{asset.duration.toFixed(1)}s</span>}
            <span>{(asset.size / 1024 / 1024).toFixed(1)} MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { MediaAsset } from "../../models/media";
import { useMediaUpload } from "../../hooks/useMediaUpload";
import MediaCard from "./MediaCard";
import UploadArea from "./UploadArea";

export default function MediaLibrary() {
  const { assets, upload } = useMediaUpload();
  const [preview, setPreview] = useState<MediaAsset | null>(null);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>Media Library</span>
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{assets.length} assets</span>
      </div>

      <UploadArea onUpload={upload} />

      <div style={{ flex: 1, overflow: "auto", padding: "8px" }}>
        {assets.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
            Drop media files above to import
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {assets.map((asset) => (
            <MediaCard key={asset.id} asset={asset} onClick={() => setPreview(asset)} />
          ))}
        </div>
      </div>
    </div>
  );
}

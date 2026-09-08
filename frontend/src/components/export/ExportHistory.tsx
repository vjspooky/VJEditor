import React from "react";

export interface PastExport {
  id: string;
  projectName: string;
  resolution: string;
  format: string;
  fileSizeMb?: number;
  downloadUrl?: string;
  createdAt: string;
  status: "completed" | "failed" | "processing";
}

interface ExportHistoryProps {
  history?: PastExport[];
  onDownload?: (exportItem: PastExport) => void;
  onDelete?: (id: string) => void;
}

export default function ExportHistory({
  history = [],
  onDownload = () => {},
  onDelete = () => {},
}: ExportHistoryProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary, #94A3B8)" }}>
        EXPORT HISTORY & DOWNLOADS ({history.length})
      </div>

      {history.length === 0 ? (
        <div style={{ textAlign: "center", color: "#64748B", padding: "24px 0", fontSize: 13 }}>
          No previous exports yet. Videos exported from this project will appear here.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {history.map((item) => (
            <div
              key={item.id}
              style={{
                padding: "12px 16px",
                background: "var(--color-surface, #1E293B)",
                border: "1px solid var(--color-border, #334155)",
                borderRadius: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>🎬</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#FFF" }}>
                    {item.projectName} ({item.resolution} {item.format.toUpperCase()})
                  </div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>
                    {item.createdAt} {item.fileSizeMb && ` • ${item.fileSizeMb} MB`}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 4,
                    textTransform: "uppercase",
                    background:
                      item.status === "completed"
                        ? "#10B98122"
                        : item.status === "failed"
                        ? "#EF444422"
                        : "#3B82F622",
                    color:
                      item.status === "completed"
                        ? "#10B981"
                        : item.status === "failed"
                        ? "#EF4444"
                        : "#3B82F6",
                  }}
                >
                  {item.status}
                </span>

                {item.status === "completed" && item.downloadUrl && (
                  <button
                    onClick={() => onDownload(item)}
                    style={{
                      padding: "6px 12px",
                      background: "var(--color-primary, #6366F1)",
                      color: "#FFF",
                      border: "none",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Download
                  </button>
                )}

                <button
                  onClick={() => onDelete(item.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#64748B",
                    fontSize: 14,
                    cursor: "pointer",
                    padding: 4,
                  }}
                  title="Delete record"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

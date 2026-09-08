import { useRef, useEffect } from "react";
import { MediaAsset } from "../../models/media";

interface MediaContextMenuProps {
  asset: MediaAsset;
  x: number;
  y: number;
  onClose: () => void;
  onPreview: () => void;
  onDelete: () => void;
}

export default function MediaContextMenu({ asset, x, y, onClose, onPreview, onDelete }: MediaContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const items = [
    { id: "ctx-preview", label: "Preview", icon: "👁️", action: onPreview },
    { id: "ctx-delete", label: "Remove", icon: "🗑️", action: onDelete, danger: true },
  ];

  return (
    <div
      ref={ref}
      role="menu"
      style={{
        position: "fixed", top: y, left: x,
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-lg)",
        zIndex: 300, minWidth: 140,
        overflow: "hidden",
        animation: "fadeIn 0.12s ease",
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          id={item.id}
          role="menuitem"
          onClick={() => { item.action(); onClose(); }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", background: "transparent", border: "none",
            padding: "9px 14px",
            color: item.danger ? "var(--color-danger)" : "var(--color-text)",
            cursor: "pointer", fontSize: "0.85rem", textAlign: "left",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

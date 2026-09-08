import { useEffect, useRef } from "react";
import { Project } from "../../models/project";

interface ProjectMenuProps {
  project: Project;
  onDelete: () => void;
  onClose: () => void;
}

export default function ProjectMenu({ project, onDelete, onClose }: ProjectMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const menuItems = [
    {
      id: `menu-rename-${project.id}`,
      label: "Rename",
      icon: "✏️",
      action: () => { alert("Rename: " + project.name); onClose(); },
    },
    {
      id: `menu-duplicate-${project.id}`,
      label: "Duplicate",
      icon: "📋",
      action: () => { alert("Duplicate: " + project.name); onClose(); },
    },
    {
      id: `menu-delete-${project.id}`,
      label: "Delete",
      icon: "🗑️",
      action: () => { onDelete(); onClose(); },
      danger: true,
    },
  ];

  return (
    <div
      ref={ref}
      role="menu"
      style={{
        position: "absolute",
        top: 40,
        right: 12,
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-lg)",
        zIndex: 100,
        minWidth: 160,
        overflow: "hidden",
        animation: "fadeIn 0.15s ease",
      }}
    >
      {menuItems.map((item) => (
        <button
          key={item.id}
          id={item.id}
          role="menuitem"
          onClick={item.action}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            background: "transparent",
            border: "none",
            padding: "10px 16px",
            color: item.danger ? "var(--color-danger)" : "var(--color-text)",
            cursor: "pointer",
            fontSize: "0.875rem",
            textAlign: "left",
            transition: "background var(--transition-fast)",
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

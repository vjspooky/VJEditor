import { useState } from "react";
import { Project } from "../../models/project";
import { deleteProject } from "../../store/projectStore";
import ProjectMenu from "./ProjectMenu";

interface ProjectCardProps {
  project: Project;
  onRefresh: () => void;
}

export default function ProjectCard({ project, onRefresh }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleDelete() {
    deleteProject(project.id);
    onRefresh();
  }

  const thumb = project.thumbnail || null;
  const initials = project.name.slice(0, 2).toUpperCase();
  const dateStr = new Date(project.updatedAt).toLocaleDateString();

  return (
    <article
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color var(--transition-base), transform var(--transition-base)",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-primary)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          height: 140,
          background: thumb
            ? `url(${thumb}) center/cover`
            : "linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,170,0.1))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!thumb && (
          <span style={{ fontSize: "2rem", fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>
            {initials}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontWeight: 600,
              fontSize: "0.9rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "calc(100% - 32px)",
            }}
          >
            {project.name}
          </span>
          <button
            id={`project-menu-${project.id}`}
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: "1.2rem",
              lineHeight: 1,
              padding: "2px 4px",
              borderRadius: "var(--radius-sm)",
            }}
            aria-label="Project options"
          >
            ⋯
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.7rem", color: "var(--color-text-dim)", background: "var(--color-surface-2)", borderRadius: 4, padding: "2px 6px" }}>
            {project.aspectRatio}
          </span>
          <span style={{ fontSize: "0.7rem", color: "var(--color-text-dim)" }}>{dateStr}</span>
        </div>
      </div>

      {menuOpen && (
        <ProjectMenu
          project={project}
          onDelete={handleDelete}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </article>
  );
}

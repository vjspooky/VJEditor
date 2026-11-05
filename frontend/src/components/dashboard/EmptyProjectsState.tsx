interface EmptyProjectsStateProps {
  onCreate: () => void;
}

export default function EmptyProjectsState({ onCreate }: EmptyProjectsStateProps) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 32px",
        background: "var(--color-surface)",
        borderRadius: "var(--radius-xl)",
        border: "2px dashed var(--color-border)",
      }}
    >
      <div style={{ fontSize: "4rem", marginBottom: 16, opacity: 0.5 }}>🎬</div>
      <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>No projects yet</h3>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: 24 }}>
        Create your first project to get started
      </p>
      <button
        id="empty-create-project"
        onClick={onCreate}
        style={{
          background: "var(--color-primary)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius-md)",
          padding: "10px 24px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "background var(--transition-fast)",
        }}
      >
        Create Project
      </button>
    </div>
  );
}

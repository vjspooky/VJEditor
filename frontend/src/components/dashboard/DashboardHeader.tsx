interface DashboardHeaderProps {
  onNewProject: () => void;
}

export default function DashboardHeader({ onNewProject }: DashboardHeaderProps) {
  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>VJEditor</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: 2 }}>
          AI-powered video creation workspace
        </p>
      </div>
      <button
        id="dashboard-new-project"
        onClick={onNewProject}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--color-primary)", color: "#fff", border: "none",
          borderRadius: "var(--radius-md)", padding: "9px 18px",
          fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
          transition: "background var(--transition-fast)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-primary)")}
      >
        <span>+</span> New Project
      </button>
    </header>
  );
}

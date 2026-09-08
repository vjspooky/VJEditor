import { Link } from "react-router-dom";

export default function EditorHeader() {
  return (
    <header
      style={{
        height: "var(--topbar-height)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        gap: 16,
        flexShrink: 0,
      }}
    >
      <Link
        to="/"
        style={{
          color: "var(--color-text-muted)",
          fontSize: "0.8rem",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
        title="Back to Dashboard"
      >
        ← Dashboard
      </Link>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span
          id="editor-project-name"
          style={{ fontWeight: 600, fontSize: "0.9rem", cursor: "text" }}
          title="Click to rename"
        >
          Untitled Project
        </span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          id="editor-save-btn"
          style={{
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
            borderRadius: "var(--radius-md)",
            padding: "6px 14px",
            fontSize: "0.8rem",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Save
        </button>
        <button
          id="editor-export-btn"
          style={{
            background: "var(--color-primary)",
            border: "none",
            color: "#fff",
            borderRadius: "var(--radius-md)",
            padding: "6px 14px",
            fontSize: "0.8rem",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Export
        </button>
      </div>
    </header>
  );
}

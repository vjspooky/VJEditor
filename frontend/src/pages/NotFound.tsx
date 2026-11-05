import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        background: "var(--color-bg)",
      }}
    >
      <div style={{ fontSize: "6rem", lineHeight: 1 }}>🎬</div>
      <h1 style={{ fontSize: "2rem", color: "var(--color-text)" }}>
        404 — Page Not Found
      </h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        The scene you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        style={{
          background: "var(--color-primary)",
          color: "#fff",
          padding: "10px 24px",
          borderRadius: "var(--radius-md)",
          fontWeight: 600,
          transition: "background var(--transition-fast)",
        }}
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

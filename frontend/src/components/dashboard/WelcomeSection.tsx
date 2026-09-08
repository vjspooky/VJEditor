export default function WelcomeSection() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <section
      style={{
        background: "linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,170,0.08))",
        border: "1px solid rgba(108,99,255,0.2)",
        borderRadius: "var(--radius-xl)",
        padding: "28px 32px",
        marginBottom: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 600 }}>{greeting} 👋</h2>
        <p style={{ color: "var(--color-text-muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Ready to create something amazing today?
        </p>
      </div>
      <div style={{ fontSize: "3.5rem", opacity: 0.6 }}>🎬</div>
    </section>
  );
}

interface QuickCreateProps {
  onBlank: () => void;
  onAI: () => void;
}

const cards = [
  {
    id: "qc-blank",
    icon: "📄",
    title: "Blank Project",
    desc: "Start with a clean canvas",
    action: "onBlank" as const,
    accent: "var(--color-primary)",
  },
  {
    id: "qc-ai",
    icon: "🤖",
    title: "AI-Assisted",
    desc: "Generate a project from a prompt",
    action: "onAI" as const,
    accent: "var(--color-accent)",
  },
];

export default function QuickCreate({ onBlank, onAI }: QuickCreateProps) {
  const handlers = { onBlank, onAI };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
      {cards.map((card) => (
        <button
          key={card.id}
          id={card.id}
          onClick={handlers[card.action]}
          style={{
            background: "var(--color-surface)",
            border: `1px solid var(--color-border)`,
            borderRadius: "var(--radius-lg)",
            padding: "24px 20px",
            cursor: "pointer",
            textAlign: "left",
            transition: "border-color var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = card.accent;
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `0 6px 24px rgba(0,0,0,0.4)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>{card.icon}</div>
          <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 4 }}>{card.title}</div>
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>{card.desc}</div>
        </button>
      ))}
    </div>
  );
}

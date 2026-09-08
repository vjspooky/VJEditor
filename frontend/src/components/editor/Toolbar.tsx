const TOOLS = [
  { id: "tool-select", icon: "↖", label: "Select", key: "V" },
  { id: "tool-cut", icon: "✂", label: "Cut / Razor", key: "C" },
  { id: "tool-text", icon: "T", label: "Text", key: "T" },
  { id: "tool-hand", icon: "✋", label: "Pan", key: "H" },
  { id: "tool-zoom", icon: "🔍", label: "Zoom", key: "Z" },
];

interface ToolbarProps {
  activeTool?: string;
  onToolChange?: (tool: string) => void;
}

export default function Toolbar({ activeTool = "tool-select", onToolChange }: ToolbarProps) {
  return (
    <div
      id="editor-toolbar"
      role="toolbar"
      aria-label="Editor tools"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "8px 6px",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {TOOLS.map((tool) => {
        const active = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            id={tool.id}
            title={`${tool.label} (${tool.key})`}
            aria-pressed={active}
            onClick={() => onToolChange?.(tool.id)}
            style={{
              background: active ? "rgba(108,99,255,0.2)" : "transparent",
              border: active ? "1px solid var(--color-primary)" : "1px solid transparent",
              borderRadius: "var(--radius-sm)",
              color: active ? "var(--color-primary)" : "var(--color-text-muted)",
              padding: "7px",
              cursor: "pointer",
              fontSize: "1rem",
              transition: "all var(--transition-fast)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.color = "var(--color-text)";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.color = "var(--color-text-muted)";
            }}
          >
            {tool.icon}
          </button>
        );
      })}
    </div>
  );
}

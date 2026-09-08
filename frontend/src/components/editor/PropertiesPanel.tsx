export default function PropertiesPanel() {
  return (
    <div
      id="properties-panel"
      style={{
        height: "100%",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <div
        style={{
          padding: "8px 4px 12px",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: 16,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>Properties</span>
      </div>

      {/* Empty state when no clip selected */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-dim)",
          fontSize: "0.8rem",
          textAlign: "center",
          gap: 8,
        }}
      >
        <div style={{ fontSize: "1.5rem", opacity: 0.4 }}>🎞️</div>
        <span>Select a clip to edit its properties</span>
      </div>
    </div>
  );
}

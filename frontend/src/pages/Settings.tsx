import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";

export default function Settings() {
  const [displayName, setDisplayName] = useState("Jane Doe");
  const [email, setEmail] = useState("jane@example.com");
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Call authService.updateProfile({ displayName, email })
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 560, margin: "48px auto", padding: "0 24px" }}>
        <h1 style={{ marginBottom: 8 }}>Settings</h1>
        <p className="text-muted text-sm" style={{ marginBottom: 32 }}>Manage your account preferences</p>

        <div className="glass-card" style={{ padding: 32 }}>
          <h2 style={{ fontSize: "1rem", marginBottom: 24, borderBottom: "1px solid var(--color-border)", paddingBottom: 12 }}>
            Profile
          </h2>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: 6, color: "var(--color-text-muted)" }}>
                Display Name
              </label>
              <input id="settings-name" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: 6, color: "var(--color-text-muted)" }}>
                Email
              </label>
              <input id="settings-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                id="settings-save"
                type="submit"
                style={{
                  background: "var(--color-primary)", color: "#fff", border: "none",
                  borderRadius: "var(--radius-md)", padding: "9px 20px", fontWeight: 600,
                  cursor: "pointer", transition: "background var(--transition-fast)",
                }}
              >
                Save Changes
              </button>
              {saved && <span style={{ color: "var(--color-success)", fontSize: "0.85rem" }}>✓ Saved</span>}
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

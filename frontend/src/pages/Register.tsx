import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      // Replace with authService.register(name, email, password) once backend is wired
      await new Promise((r) => setTimeout(r, 800));
      navigate("/");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
      <div className="glass-card" style={{ width: 400, padding: "40px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>🎬</div>
          <h1 style={{ fontSize: "1.5rem" }}>Create account</h1>
          <p className="text-muted text-sm" style={{ marginTop: 4 }}>Start editing with VJEditor</p>
        </div>

        {error && (
          <div style={{
            background: "rgba(255,77,109,0.12)", border: "1px solid var(--color-danger)",
            borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: 16,
            fontSize: "0.875rem", color: "var(--color-danger)",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: 6, color: "var(--color-text-muted)" }}>
              Full Name
            </label>
            <input id="reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required autoComplete="name" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: 6, color: "var(--color-text-muted)" }}>
              Email
            </label>
            <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: 6, color: "var(--color-text-muted)" }}>
              Password
            </label>
            <input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required autoComplete="new-password" />
          </div>
          <button
            id="reg-submit"
            type="submit"
            disabled={loading}
            style={{
              background: "var(--color-primary)", color: "#fff", border: "none",
              borderRadius: "var(--radius-md)", padding: "11px", fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
              transition: "background var(--transition-fast)", fontSize: "0.9rem",
            }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

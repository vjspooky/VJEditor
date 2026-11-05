import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Replace with authService.login(email, password) once backend is wired
      await new Promise((r) => setTimeout(r, 800));
      navigate("/");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
      <div className="glass-card" style={{ width: 400, padding: "40px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>🎬</div>
          <h1 style={{ fontSize: "1.5rem" }}>Welcome back</h1>
          <p className="text-muted text-sm" style={{ marginTop: 4 }}>Sign in to your VJEditor account</p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(255,77,109,0.12)",
              border: "1px solid var(--color-danger)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: "0.875rem",
              color: "var(--color-danger)",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: 6, color: "var(--color-text-muted)" }}>
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: 6, color: "var(--color-text-muted)" }}>
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={{
              background: "var(--color-primary)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "11px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "background var(--transition-fast)",
              fontSize: "0.9rem",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--color-primary)", fontWeight: 500 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

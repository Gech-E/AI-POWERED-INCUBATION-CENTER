"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      {/* bg glow */}
      <div style={{ position: "fixed", top: "20%", left: "30%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div className="card animate-in" style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span className="gradient-text" style={{ fontSize: "1.4rem", fontWeight: 800 }}>MU Innovation Hub</span>
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0.75rem 0 0.25rem" }}>Welcome Back</h1>
          <p style={{ color: "var(--clr-muted)", fontSize: "0.9rem" }}>Sign in to your account</p>
        </div>

        {error && (
          <div style={{ padding: "0.6rem 1rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-sm)", color: "var(--clr-danger)", fontSize: "0.85rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label className="label" htmlFor="login-email">Email</label>
            <input id="login-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@mu.edu.et" required />
          </div>
          <div>
            <label className="label" htmlFor="login-password">Password</label>
            <input id="login-password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", marginTop: "0.5rem" }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.25rem", color: "var(--clr-muted)", fontSize: "0.85rem" }}>
          Don&apos;t have an account? <Link href="/register" style={{ color: "var(--clr-primary-l)", textDecoration: "none", fontWeight: 600 }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";

const ROLES = [
  { value: "student", label: " Student" },
  { value: "mentor", label: " Mentor" },
  { value: "investor", label: " Investor" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "student", university: "Mekelle University", department: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ position: "fixed", top: "10%", right: "20%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,214,160,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div className="card animate-in" style={{ width: "100%", maxWidth: 480, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span className="gradient-text" style={{ fontSize: "1.4rem", fontWeight: 800 }}>MU Innovation Hub</span>
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0.75rem 0 0.25rem" }}>Create Account</h1>
          <p style={{ color: "var(--clr-muted)", fontSize: "0.9rem" }}>Join the innovation ecosystem</p>
        </div>

        {error && (
          <div style={{ padding: "0.6rem 1rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-sm)", color: "var(--clr-danger)", fontSize: "0.85rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <div>
            <label className="label" htmlFor="reg-name">Full Name</label>
            <input id="reg-name" className="input" value={form.full_name} onChange={set("full_name")} placeholder="Abebe Kebede" required />
          </div>
          <div>
            <label className="label" htmlFor="reg-email">Email</label>
            <input id="reg-email" className="input" type="email" value={form.email} onChange={set("email")} placeholder="abebe@mu.edu.et" required />
          </div>
          <div>
            <label className="label" htmlFor="reg-password">Password</label>
            <input id="reg-password" className="input" type="password" value={form.password} onChange={set("password")} placeholder="Minimum 8 characters" required minLength={8} />
          </div>
          <div>
            <label className="label" htmlFor="reg-role">I am a</label>
            <select id="reg-role" className="select" value={form.role} onChange={set("role")}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label className="label" htmlFor="reg-uni">University</label>
              <input id="reg-uni" className="input" value={form.university} onChange={set("university")} />
            </div>
            <div>
              <label className="label" htmlFor="reg-dept">Department</label>
              <input id="reg-dept" className="input" value={form.department} onChange={set("department")} placeholder="Computer Science" />
            </div>
          </div>
          <button type="submit" className="btn btn-accent" disabled={loading} style={{ width: "100%", marginTop: "0.5rem" }}>
            {loading ? "Creating account…" : "🚀 Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.25rem", color: "var(--clr-muted)", fontSize: "0.85rem" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--clr-primary-l)", textDecoration: "none", fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const FEATURES = [
  { icon: "", title: "AI Idea Evaluation", desc: "Submit your startup idea and get instant AI-powered scoring across market potential, technical feasibility, innovation, and team capability." },
  { icon: "", title: "AI Mentor Chatbot", desc: "Get 24/7 guidance on business models, MVP planning, pitch preparation, and market validation from our AI startup mentor." },
  { icon: "", title: "Smart Matchmaking", desc: "AI-powered matching connects you with the perfect mentors, investors, and industry partners based on your startup domain." },
  { icon: "", title: "Progress Dashboard", desc: "Track milestones, KPIs, and development stages as your startup grows from ideation to scale." },
  { icon: "", title: "Mentor Marketplace", desc: "Browse experienced mentors with expertise matching your startup's needs and book mentorship sessions." },
  { icon: "", title: "Investor Portal", desc: "Connect with investors actively looking for startups in your sector with compatible funding interests." },
];

const STEPS = [
  { num: "01", title: "Submit Your Idea", desc: "Describe your problem, solution, market, and team." },
  { num: "02", title: "AI Evaluates", desc: "NLP analysis scores viability across 4 dimensions." },
  { num: "03", title: "Get Matched", desc: "AI recommends mentors, investors, and resources." },
  { num: "04", title: "Build & Grow", desc: "Track progress with dashboards and mentor support." },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/*  Nav  */}
      <nav className="glass" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "0.75rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: "1.2rem", textDecoration: "none" }}>
          <span className="gradient-text">MU Innovation Hub</span>
        </Link>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <ThemeToggle />
          <Link href="/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/*  Hero  */}
      <section style={{ padding: "8rem 2rem 4rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* bg glow */}
        <div style={{ position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="animate-in" style={{ maxWidth: 800, margin: "0 auto", position: "relative" }}>
          <span className="tag" style={{ marginBottom: "1rem", display: "inline-block" }}>🎓 Mekelle University</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "1.25rem" }}>
            Transform Your Ideas Into<br />
            <span className="gradient-text">Successful Startups</span>
          </h1>
          <p style={{ fontSize: "1.15rem", color: "var(--clr-muted)", maxWidth: 600, margin: "0 auto 2rem" }}>
            AI-powered evaluation, smart mentorship matching, and structured guidance to take your innovation from concept to scale.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: "0.85rem 2rem", fontSize: "1rem" }}>
              Start Your Journey
            </Link>
            <Link href="#features" className="btn btn-outline" style={{ padding: "0.85rem 2rem", fontSize: "1rem" }}>
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/*  Stats  */}
      <section style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
          {[
            { val: "500+", lbl: "Student Ideas" },
            { val: "85%", lbl: "AI Accuracy" },
            { val: "120+", lbl: "Mentors" },
            { val: "30+", lbl: "Funded Startups" },
          ].map((s) => (
            <div key={s.lbl} className="card stat-card">
              <div className="stat-value gradient-text">{s.val}</div>
              <div className="stat-label">{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/*  Features  */}
      <section id="features" style={{ padding: "4rem 2rem", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Everything You Need to <span className="gradient-text">Succeed</span>
        </h2>
        <p style={{ textAlign: "center", color: "var(--clr-muted)", marginBottom: "2.5rem" }}>
          Powered by AI to accelerate your entrepreneurial journey.
        </p>
        <div className="grid-cards">
          {FEATURES.map((f) => (
            <div key={f.title} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ fontSize: "2rem" }}>{f.icon}</span>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{f.title}</h3>
              <p style={{ color: "var(--clr-muted)", fontSize: "0.9rem", margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/*  How It Works  */}
      <section style={{ padding: "4rem 2rem", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", fontWeight: 800, marginBottom: "2.5rem" }}>
          How It <span className="gradient-text">Works</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          {STEPS.map((s) => (
            <div key={s.num} className="card" style={{ textAlign: "center" }}>
              <div className="gradient-text" style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "0.5rem" }}>{s.num}</div>
              <h3 style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{s.title}</h3>
              <p style={{ color: "var(--clr-muted)", fontSize: "0.85rem", margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/*  CTA  */}
      <section style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <div className="card" style={{ maxWidth: 700, margin: "0 auto", background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,214,160,0.08))", border: "1px solid rgba(99,102,241,0.2)" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.75rem" }}>Ready to Build the Future?</h2>
          <p style={{ color: "var(--clr-muted)", marginBottom: "1.5rem" }}>Join Mekelle University&apos;s innovation ecosystem and turn your idea into reality.</p>
          <Link href="/register" className="btn btn-accent" style={{ padding: "0.85rem 2.5rem", fontSize: "1rem" }}>
            Submit Your Idea
          </Link>
        </div>
      </section>

      {/*  Footer  */}
      <footer style={{ padding: "2rem", textAlign: "center", borderTop: "1px solid var(--clr-border)", color: "var(--clr-muted)", fontSize: "0.85rem" }}>
        <p>© 2026 MU Innovation Hub — Mekelle University. Powered by AI.</p>
      </footer>
    </div>
  );
}

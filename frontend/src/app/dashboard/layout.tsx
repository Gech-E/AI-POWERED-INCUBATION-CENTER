"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearToken, getUser } from "@/lib/api";
import ChatbotWidget from "@/components/ChatbotWidget";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "", label: "Dashboard" },
  { href: "/dashboard/submit-idea", icon: "", label: "Submit Idea" },
  { href: "/dashboard/ideas", icon: "", label: "My Ideas" },
  { href: "/dashboard/chatbot", icon: "", label: "AI Mentor Chatbot" },
  { href: "/dashboard/progress", icon: "", label: "Progress Dashboard" },
  { href: "/dashboard/mentors", icon: "", label: "Mentors" },
  { href: "/dashboard/investors", icon: "", label: "Investors" },
  { href: "/dashboard/networking", icon: "", label: "Networking" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Record<string, string> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
  }, [router]);

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Sidebar  */}
      <aside className="glass" style={{ width: sidebarOpen ? 240 : 60, transition: "width 0.3s ease", display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 40, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--clr-border)" }}>
          {sidebarOpen && <span className="gradient-text" style={{ fontWeight: 800, fontSize: "1rem", whiteSpace: "nowrap" }}>MU Hub</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-ghost btn-sm" style={{ padding: "0.3rem" }}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>
        <nav style={{ flex: 1, padding: "0.75rem 0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 0.75rem", borderRadius: "var(--radius-sm)", textDecoration: "none", color: active ? "var(--clr-text)" : "var(--clr-muted)", background: active ? "rgba(99,102,241,0.15)" : "transparent", fontWeight: active ? 600 : 400, fontSize: "0.9rem", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && item.label}
              </Link>
            );
          })}

          {user.role === "admin" && (
            <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 0.75rem", borderRadius: "var(--radius-sm)", textDecoration: "none", color: pathname === "/admin" ? "var(--clr-text)" : "var(--clr-muted)", background: pathname === "/admin" ? "rgba(99,102,241,0.15)" : "transparent", fontSize: "0.9rem", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: "1.1rem" }}>⚙️</span>
              {sidebarOpen && "Admin"}
            </Link>
          )}
        </nav>
        <div style={{ padding: "0.75rem", borderTop: "1px solid var(--clr-border)" }}>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: sidebarOpen ? "flex-start" : "center" }}>
            🚪 {sidebarOpen && "Logout"}
          </button>
        </div>
      </aside>

      {/* ── Main content  */}
      <main style={{ flex: 1, marginLeft: sidebarOpen ? 240 : 60, transition: "margin-left 0.3s ease" }}>
        {/* top bar */}
        <header className="glass" style={{ padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 30 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
            {NAV_ITEMS.find((n) => n.href === pathname)?.label || "Dashboard"}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span className="tag">{user.role}</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{user.full_name}</span>
          </div>
        </header>
        <div className="page-container">{children}</div>
      </main>
      <ChatbotWidget />
    </div>
  );
}

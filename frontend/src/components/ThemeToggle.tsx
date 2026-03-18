"use client";

import { useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light" | "aurora";

const THEMES: { id: Theme; label: string }[] = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "aurora", label: "Aurora" },
];

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem("theme") as Theme | null;
  if (stored && (stored === "dark" || stored === "light" || stored === "aurora")) return stored;
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches;
  return prefersLight ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme === "dark" ? "" : theme;
  // For convenience, keep "dark" as default :root and use explicit data-theme for others.
  if (theme === "dark") {
    delete (document.documentElement.dataset as any).theme;
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const t = getPreferredTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("theme", theme);
    applyTheme(theme);
  }, [theme]);

  const activeIdx = useMemo(() => THEMES.findIndex((t) => t.id === theme), [theme]);

  return (
    <div
      aria-label="Theme toggle"
      style={{
        position: "fixed",
        right: 16,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 80,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 10,
        borderRadius: 999,
      }}
      className="glass"
    >
      <div
        style={{
          position: "absolute",
          left: 10,
          right: 10,
          top: 10 + activeIdx * 40,
          height: 36,
          borderRadius: 999,
          background: "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(6,214,160,0.16))",
          border: "1px solid rgba(99,102,241,0.22)",
          transition: "top 180ms ease",
          pointerEvents: "none",
        }}
      />

      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setTheme(t.id)}
          style={{
            width: 84,
            justifyContent: "center",
            color: theme === t.id ? "var(--clr-text)" : "var(--clr-muted)",
            position: "relative",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

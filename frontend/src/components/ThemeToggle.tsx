"use client";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "mu-hub-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  // Prevent hydration mismatch flash
  if (!mounted) return <div style={{ width: 44, height: 44 }} />;

  return (
    <button
      id="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "var(--radius-sm)",
        border: "1.5px solid var(--clr-border)",
        background: "var(--clr-surface)",
        color: "var(--clr-text)",
        cursor: "pointer",
        fontSize: "1.2rem",
        transition: "all 0.25s ease",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--clr-primary)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 12px rgba(99,102,241,0.25)";
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--clr-border)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
      }}
    >
      <span
        style={{
          display: "inline-block",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: theme === "light" ? "rotate(180deg)" : "rotate(0deg)",
        }}
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </span>
    </button>
  );
}

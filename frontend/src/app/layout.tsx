import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MU Innovation Hub — AI-Powered Startup Incubation",
  description:
    "Mekelle University's AI-powered platform that helps students transform innovative ideas into successful startups through intelligent evaluation, mentorship matching, and structured guidance.",
  keywords: ["startup", "incubation", "Mekelle University", "AI", "innovation", "mentorship"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

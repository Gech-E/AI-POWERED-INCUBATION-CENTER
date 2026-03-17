/**
 * API service layer — centralised fetch wrapper with JWT auth.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/* ── token helpers ─────────────────────────────────────────────── */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
export function setToken(token: string) {
  localStorage.setItem("token", token);
}
export function clearToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
export function getUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}
export function setUser(user: Record<string, unknown>) {
  localStorage.setItem("user", JSON.stringify(user));
}

/* ── generic fetch ─────────────────────────────────────────────── */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error ${res.status}`);
  }
  return res.json();
}

/* ── Auth ──────────────────────────────────────────────────────── */
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: Record<string, unknown>;
}

export async function register(data: {
  email: string;
  password: string;
  full_name: string;
  role?: string;
  university?: string;
  department?: string;
}) {
  const res = await apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setToken(res.access_token);
  setUser(res.user);
  return res;
}

export async function login(email: string, password: string) {
  const res = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(res.access_token);
  setUser(res.user);
  return res;
}

export async function getProfile() {
  return apiFetch<Record<string, unknown>>("/auth/me");
}

/* ── Ideas ─────────────────────────────────────────────────────── */
export async function submitIdea(data: Record<string, unknown>) {
  return apiFetch<Record<string, unknown>>("/ideas/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function getIdeas(params?: string) {
  return apiFetch<Record<string, unknown>[]>(`/ideas/${params ? "?" + params : ""}`);
}
export async function getIdea(id: string) {
  return apiFetch<Record<string, unknown>>(`/ideas/${id}`);
}
export async function evaluateIdea(id: string) {
  return apiFetch<Record<string, unknown>>(`/ideas/${id}/evaluate`, { method: "POST" });
}

/* ── Mentors ───────────────────────────────────────────────────── */
export async function getMentors() {
  return apiFetch<Record<string, unknown>[]>("/mentors/");
}
export async function bookMentorSession(data: {
  mentor_id: string;
  idea_id: string;
  session_date: string; // ISO
  duration_minutes?: number;
  notes?: string;
}) {
  return apiFetch<Record<string, unknown>>("/mentors/sessions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function getMentorSessions(ideaId: string) {
  return apiFetch<Record<string, unknown>[]>(`/mentors/sessions/${ideaId}`);
}

/* ── Investors ─────────────────────────────────────────────────── */
export async function getInvestors() {
  return apiFetch<Record<string, unknown>[]>("/investors/");
}

/* ── Partners ──────────────────────────────────────────────────── */
export async function getPartners(params?: string) {
  return apiFetch<Record<string, unknown>[]>(`/partners/${params ? "?" + params : ""}`);
}

/* ── Networking ────────────────────────────────────────────────── */
export async function getRecommendedMentors(ideaId: string) {
  return apiFetch<Record<string, unknown>[]>(`/networking/recommend/mentors/${ideaId}`, { method: "POST" });
}
export async function getRecommendedInvestors(ideaId: string) {
  return apiFetch<Record<string, unknown>[]>(`/networking/recommend/investors/${ideaId}`, { method: "POST" });
}
export async function getRecommendedPartners(ideaId: string) {
  return apiFetch<Record<string, unknown>[]>(`/networking/recommend/partners/${ideaId}`, { method: "POST" });
}
export async function getMyMatches() {
  return apiFetch<Record<string, unknown>[]>("/networking/matches");
}
export async function requestMatch(data: {
  idea_id: string;
  matched_user_id: string;
  match_type: "mentor" | "investor" | "partner";
  message?: string;
}) {
  return apiFetch<Record<string, unknown>>("/networking/match", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* ── Dashboard ─────────────────────────────────────────────────── */
export async function getDashboardStats() {
  return apiFetch<Record<string, unknown>>("/dashboard/stats");
}
export async function getMilestones(ideaId: string) {
  return apiFetch<Record<string, unknown>[]>(`/dashboard/milestones/${ideaId}`);
}
export async function createMilestone(data: Record<string, unknown>) {
  return apiFetch<Record<string, unknown>>("/dashboard/milestones", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function completeMilestone(milestoneId: string) {
  return apiFetch<Record<string, unknown>>(`/dashboard/milestones/${milestoneId}/complete`, { method: "PUT" });
}
export async function updateMilestone(milestoneId: string, data: Record<string, unknown>) {
  return apiFetch<Record<string, unknown>>(`/dashboard/milestones/${milestoneId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/* ── Chatbot ───────────────────────────────────────────────────── */
export async function chatWithMentor(message: string, ideaId?: string) {
  return apiFetch<{ reply: string; suggestions?: string[] }>("/chatbot/chat", {
    method: "POST",
    body: JSON.stringify({ message, idea_id: ideaId }),
  });
}

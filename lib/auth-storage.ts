import type { AuthUser } from "@/lib/auth-types";

const TOKEN_KEY = "migr8_token";
const USER_KEY = "migr8_user";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24; // 24h — matches backend default JWT expiry

function canUseDom() {
  return typeof window !== "undefined";
}

function setCookie(token: string) {
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function clearCookie() {
  document.cookie = `${TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getToken(): string | null {
  if (!canUseDom()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (!canUseDom()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AuthUser) {
  if (!canUseDom()) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setCookie(token);
}

export function clearSession() {
  if (!canUseDom()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearCookie();
}

import type { AuthUser } from "@/lib/auth-types";

const USER_KEY = "migr8_user";
const SESSION_COOKIE = "migr8_session";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function canUseDom() {
  return typeof window !== "undefined";
}

function setSessionFlag() {
  document.cookie = `${SESSION_COOKIE}=1; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function clearSessionFlag() {
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getToken(): string | null {
  return null;
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

export function setSession(_token: string | null, user: AuthUser) {
  if (!canUseDom()) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setSessionFlag();
}

export function clearSession() {
  if (!canUseDom()) return;
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("migr8_token");
  clearSessionFlag();
  document.cookie = "migr8_token=; Path=/; Max-Age=0; SameSite=Lax";
}

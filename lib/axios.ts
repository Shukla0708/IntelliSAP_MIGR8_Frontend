import axios, { type AxiosError, type AxiosInstance } from "axios";
import { clearSession } from "@/lib/auth-storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
  withCredentials: true,
});

const SKIP_401_REDIRECT_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/refresh",
];

function shouldSkip401Redirect(url?: string) {
  if (!url) return false;
  return SKIP_401_REDIRECT_PATHS.some((path) => url.includes(path));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

apiClient.interceptors.request.use(
  (config) => {
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as
      | (AxiosError["config"] & { _retryCount?: number })
      | undefined;
    const status = error.response?.status;
    const method = (config?.method || "get").toLowerCase();
    if (
      axios.isAxiosError(error) &&
      config &&
      method === "get" &&
      (status === 502 || status === 503) &&
      (config._retryCount ?? 0) < 2
    ) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      await sleep(300 * config._retryCount);
      return apiClient.request(config);
    }

    if (
      axios.isAxiosError(error) &&
      status === 401 &&
      typeof window !== "undefined" &&
      !shouldSkip401Redirect(config?.url)
    ) {
      clearSession();
      const next = `${window.location.pathname}${window.location.search}`;
      const redirect =
        next && next !== "/sign-in"
          ? `/sign-in?next=${encodeURIComponent(next)}`
          : "/sign-in";
      if (window.location.pathname !== "/sign-in") {
        window.location.assign(redirect);
      }
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(
  error: unknown,
  fallback = "Request failed",
): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return "Cannot reach MIGR8. Check your connection or try again.";
  }
  if (error.code === "ECONNABORTED" || error.message.toLowerCase().includes("timeout")) {
    return "MIGR8 took too long to respond. Try again.";
  }

  const status = error.response?.status;
  if (status === 429) {
    return "Too many attempts. Wait a minute and try again.";
  }
  if (status && status >= 500) {
    return "MIGR8 is having trouble right now. Please try again.";
  }

  const data = error.response?.data;
  if (typeof data === "object" && data !== null) {
    const envelope = data as {
      error?: { message?: unknown; code?: unknown };
      detail?: unknown;
      message?: unknown;
    };
    if (typeof envelope.error?.message === "string" && envelope.error.message) {
      return envelope.error.message;
    }
    if ("detail" in envelope) {
      const detail = envelope.detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail)) {
        return detail
          .map((item) =>
            typeof item === "object" && item !== null && "msg" in item
              ? String((item as { msg: unknown }).msg)
              : String(item),
          )
          .join(", ");
      }
    }
    if (typeof envelope.message === "string") {
      return envelope.message;
    }
  }

  return fallback;
}

export default apiClient;

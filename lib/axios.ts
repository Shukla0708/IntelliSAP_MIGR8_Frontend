import axios, { type AxiosError, type AxiosInstance } from "axios";
import { clearSession, getToken } from "@/lib/auth-storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

const SKIP_401_REDIRECT_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
];

function shouldSkip401Redirect(url?: string) {
  if (!url) return false;
  return SKIP_401_REDIRECT_PATHS.some((path) => url.includes(path));
}

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let the browser set multipart boundary for FormData uploads
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !shouldSkip401Redirect(error.config?.url)
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

  const data = error.response?.data;
  if (typeof data === "object" && data !== null) {
    if ("detail" in data) {
      const detail = (data as { detail?: unknown }).detail;
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
    if (
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
    ) {
      return (data as { message: string }).message;
    }
  }

  return error.message || fallback;
}

export default apiClient;

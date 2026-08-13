import apiClient from "@/lib/axios";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/lib/auth-types";

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/auth/login", payload);
  return data;
}

export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(
    "/api/auth/register",
    payload,
  );
  return data;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>("/api/auth/me");
  return data;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post("/api/auth/logout");
}

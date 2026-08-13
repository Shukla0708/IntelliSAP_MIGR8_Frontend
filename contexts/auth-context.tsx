"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchMe,
  login as loginRequest,
  logoutRequest,
  register as registerRequest,
} from "@/lib/auth-api";
import {
  clearSession,
  getStoredUser,
  getToken,
  setSession,
} from "@/lib/auth-storage";
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/lib/auth-types";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const storedToken = getToken();
      const storedUser = getStoredUser();

      if (!storedToken) {
        if (!cancelled) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setToken(storedToken);
        if (storedUser) setUser(storedUser);
      }

      try {
        const me = await fetchMe();
        if (!cancelled) {
          setUser(me);
          setSession(storedToken, me);
        }
      } catch {
        if (!cancelled) {
          clearSession();
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await loginRequest(payload);
    setSession(response.token, response.user);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await registerRequest(payload);
    setSession(response.token, response.user);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Always clear local session even if the API call fails
    } finally {
      clearSession();
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role?: "admin" | "member";
};

export type AuthResponse = {
  user: AuthUser;
  token?: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

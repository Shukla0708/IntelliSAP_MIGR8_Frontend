export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
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

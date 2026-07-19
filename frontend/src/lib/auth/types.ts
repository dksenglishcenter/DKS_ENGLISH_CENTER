export type UserRole = "USER" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  createdAt: string;
};

export type AuthResponse = {
  message: string;
  user: AuthUser;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type ForgotPasswordResponse = {
  message: string;
};

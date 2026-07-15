import { apiFetch } from "@/lib/api/client";
import type {
  AuthResponse,
  AuthUser,
  ForgotPasswordResponse,
  LoginPayload,
  RegisterPayload,
} from "./types";

export async function registerUser(payload: RegisterPayload) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    json: payload,
  });
}

export async function loginUser(payload: LoginPayload) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    json: payload,
  });
}

export async function logoutUser() {
  return apiFetch<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}

export async function refreshSession() {
  return apiFetch<{ message: string }>("/auth/refresh", {
    method: "POST",
    skipAuthRefresh: true,
  });
}

export async function getCurrentUser() {
  return apiFetch<{ user: AuthUser }>("/auth/me", {
    method: "GET",
  });
}

export async function forgotPassword(email: string) {
  return apiFetch<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    json: { email },
  });
}

export async function resetPassword(token: string, password: string) {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    json: { token, password },
  });
}

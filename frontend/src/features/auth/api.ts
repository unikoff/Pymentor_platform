import { apiRequest } from "../../shared/api/client";
import type { UserProfile } from "../../shared/api/contracts/user";
import { loginWithRetry } from "./login-retry";

export function getCurrentUser() {
  return apiRequest<{ user: UserProfile }>("/user/me");
}

export function registerUser(payload: { username: string; email: string; password: string }) {
  return apiRequest<{ user: UserProfile }>("/user/register", payload);
}

export function loginUser(payload: { email: string; password: string }) {
  return loginWithRetry(payload);
}

export function logoutUser() {
  return apiRequest("/user/logout", {});
}

export function requestEmailVerification() {
  return apiRequest<{ message: string }>("/user/email-verification/request", {});
}

export function confirmEmailVerification(token: string) {
  return apiRequest<{ message: string }>("/user/email-verification/confirm", { token });
}

export function updateProfile(username: string) {
  return apiRequest<{ user: UserProfile }>("/user/profile", { username }, "PATCH");
}

export async function requestEmailChange(email: string) {
  try {
    const capabilities = await apiRequest<{ confirmations_required: number }>("/user/email-change/capabilities");
    if (capabilities.confirmations_required !== 2) throw new Error("unsupported");
  } catch {
    throw new Error("Смена почты временно недоступна. Попробуйте после обновления сервера.");
  }
  return apiRequest<{ message: string }>("/user/email-change/request", { email });
}

export function confirmEmailChange(token: string) {
  return apiRequest<{ message: string; verification_sent: boolean; completed: boolean }>("/user/email-change/confirm", { token });
}

export function requestPasswordChange() {
  return apiRequest<{ message: string }>("/user/password-change/request", {});
}

export function requestPasswordReset(email: string) {
  return apiRequest<{ message: string }>("/user/password-reset/request", { email });
}

export function confirmPasswordReset(token: string, new_password: string) {
  return apiRequest<{ message: string }>("/user/password-reset/confirm", { token, new_password });
}

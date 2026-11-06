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

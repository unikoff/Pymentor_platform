import { apiRequest } from "../../shared/api/client";
import type { UserProfile } from "../../shared/api/contracts/user";

type LoginPayload = { email: string; password: string };
type LoginResponse = { user: UserProfile };
type LoginCapabilities = { idempotent_login?: unknown };

const API_PREFIX = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";
type PendingAttempt = { key: string; uncertain: boolean };
const pendingAttempts = new Map<string, PendingAttempt>();
const MAX_PENDING_ATTEMPTS = 8;
const PENDING_STORAGE_KEY = "pymentor.login.pending.v1";

async function accountKey(email: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
  return Array.from(new Uint8Array(bytes), (value) => value.toString(16).padStart(2, "0")).join("");
}

function loadPendingAttempts(): boolean {
  try {
    if (!globalThis.sessionStorage) return false;
    const raw = globalThis.sessionStorage.getItem(PENDING_STORAGE_KEY);
    if (!raw) return true;
    const entries: unknown = JSON.parse(raw);
    if (!Array.isArray(entries) || entries.length > MAX_PENDING_ATTEMPTS) return false;
    for (const entry of entries) {
      if (!Array.isArray(entry) || entry.length !== 2) return false;
      const [account, key] = entry;
      if (typeof account !== "string" || !/^[0-9a-f]{64}$/.test(account)
          || typeof key !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(key)) return false;
      if (!pendingAttempts.has(account)) pendingAttempts.set(account, { key, uncertain: true });
    }
    return true;
  } catch {
    return false;
  }
}

function savePendingAttempts(): boolean {
  try {
    if (!globalThis.sessionStorage) return false;
    const entries = Array.from(pendingAttempts, ([account, attempt]) => [account, attempt.key]);
    if (entries.length) globalThis.sessionStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(entries));
    else globalThis.sessionStorage.removeItem(PENDING_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

class LoginHttpError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  if (!response.headers.get("Content-Type")?.includes("application/json")) {
    throw new Error(response.ok
      ? "Сервер вернул страницу вместо данных. Перезапустите бэкенд после обновления платформы и повторите загрузку."
      : "Не удалось получить данные от сервера. Повторите загрузку.");
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("Сервер вернул повреждённые данные. Повторите загрузку.");
  }

  if (!response.ok) {
    const errorData = data as { detail?: string; message?: string } | null;
    throw new LoginHttpError(errorData?.detail || errorData?.message || "Запрос не выполнен", response.status);
  }

  return data as T;
}

async function supportsIdempotentLogin(): Promise<boolean> {
  const response = await fetch(API_PREFIX + "/user/login-capabilities", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (response.status === 404) {
    return false;
  }

  const capabilities = await readJsonResponse<LoginCapabilities>(response);
  return capabilities?.idempotent_login === true;
}

async function loginWithIdempotencyKey(
  payload: LoginPayload,
  attempt: PendingAttempt,
): Promise<LoginResponse> {
  const body = JSON.stringify(payload);
  const options: RequestInit = {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Idempotency-Key": attempt.key,
    },
    body,
  };

  let hasRetried = false;
  while (true) {
    let response: Response;
    try {
      response = await fetch(API_PREFIX + "/user/login", options);
    } catch (error) {
      if (error instanceof TypeError) attempt.uncertain = true;
      if (!hasRetried && error instanceof TypeError) {
        hasRetried = true;
        continue;
      }
      throw error;
    }

    if (!hasRetried && response.status === 503) {
      attempt.uncertain = true;
      hasRetried = true;
      continue;
    }
    if (response.status >= 500) attempt.uncertain = true;
    try {
      return await readJsonResponse<LoginResponse>(response);
    } catch (error) {
      if (response.ok) attempt.uncertain = true;
      throw error;
    }
  }
}

export async function loginWithRetry(payload: LoginPayload): Promise<LoginResponse> {
  const supportsRetry = await supportsIdempotentLogin();
  const storageAvailable = loadPendingAttempts();
  if (!supportsRetry && pendingAttempts.size === 0) {
    return apiRequest<LoginResponse>("/user/login", payload);
  }
  const account = await accountKey(payload.email);
  if (!supportsRetry) {
    if (pendingAttempts.has(account)) {
      throw new Error("Не удалось подтвердить предыдущий вход. Повторите попытку позже.");
    }
    return apiRequest<LoginResponse>("/user/login", payload);
  }
  if (!storageAvailable) {
    throw new Error("Для безопасного входа включите хранилище вкладки браузера.");
  }

  let attempt = pendingAttempts.get(account);
  if (!attempt) {
    if (pendingAttempts.size >= MAX_PENDING_ATTEMPTS) {
      throw new Error("Слишком много неподтверждённых входов. Повторите прежние попытки.");
    }
    attempt = { key: crypto.randomUUID(), uncertain: false };
    pendingAttempts.set(account, attempt);
  }
  // Store only a pseudonymous account hash and operation ID before sending;
  // after a reload any saved request must be treated as possibly committed.
  if (!savePendingAttempts()) {
    throw new Error("Для безопасного входа включите хранилище вкладки браузера.");
  }
  try {
    const result = await loginWithIdempotencyKey(payload, attempt);
    if (pendingAttempts.get(account) === attempt) pendingAttempts.delete(account);
    savePendingAttempts();
    return result;
  } catch (error) {
    if (error instanceof LoginHttpError && error.status >= 400 && error.status < 500
        && (!attempt.uncertain || error.status === 409)
        && pendingAttempts.get(account) === attempt) pendingAttempts.delete(account);
    savePendingAttempts();
    throw error;
  }
}

const API_PREFIX = "/api";

export async function apiRequest<T>(url: string, body?: unknown, method?: string): Promise<T> {
  const response = await fetch(API_PREFIX + url, {
    method: method ?? (body ? "POST" : "GET"),
    credentials: "include",
    // Never reuse a cached SPA response (or another session's API response).
    cache: "no-store",
    headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.headers.get("Content-Type")?.includes("application/json")) {
    throw new Error(response.ok
      ? "Сервер вернул страницу вместо данных. Перезапустите бэкенд после обновления платформы и повторите загрузку."
      : "Не удалось получить данные от сервера. Повторите загрузку.");
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Сервер вернул повреждённые данные. Повторите загрузку.");
  }
  if (!response.ok) {
    throw new Error(data?.detail || data?.message || "Запрос не выполнен");
  }

  return data as T;
}

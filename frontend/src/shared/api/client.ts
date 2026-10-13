const API_PREFIX = import.meta.env.BASE_URL.replace(/\/+$/, "");

export async function apiRequest<T>(url: string, body?: unknown, method?: string): Promise<T> {
  const response = await fetch(API_PREFIX + url, {
    method: method ?? (body ? "POST" : "GET"),
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.message || "Запрос не выполнен");
  }

  return data as T;
}

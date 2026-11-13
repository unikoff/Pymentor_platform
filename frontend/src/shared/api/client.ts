const API_PREFIX = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

export async function apiRequest<T>(
  url: string,
  body?: unknown,
  method?: string,
  extraHeaders: Record<string, string> = {},
): Promise<T> {
  const response = await fetch(API_PREFIX + url, {
    method: method ?? (body ? "POST" : "GET"),
    credentials: "include",
    // Never reuse a cached SPA response (or another session's API response).
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...extraHeaders,
    },
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
    const detail = typeof data?.detail === "string" ? data.detail :
      typeof data?.message === "string" ? data.message : "Проверьте введённые данные и попробуйте снова";
    throw new Error(detail);
  }

  return data as T;
}

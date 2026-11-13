export type EmailAction = "verify_email" | "change_password" | "reset_password" | "change_email";
export type EmailLink = { action: EmailAction; token: string };
const storageKey = "pymentor.email-action";

export function readEmailLink(url: URL, storage: Pick<Storage, "getItem" | "setItem">): EmailLink | null {
  const action = url.searchParams.get("email_action");
  if (action !== "verify_email" && action !== "change_password" && action !== "reset_password" && action !== "change_email") return null;
  const token = new URLSearchParams(url.hash.slice(1)).get("token");
  if (token) {
    const link: EmailLink = { action, token };
    try { storage.setItem(storageKey, JSON.stringify(link)); } catch { /* private browsing may block storage */ }
    return link;
  }
  try {
    const saved: unknown = JSON.parse(storage.getItem(storageKey) ?? "null");
    if (saved && typeof saved === "object" && "action" in saved && "token" in saved &&
        saved.action === action && typeof saved.token === "string" && saved.token) {
      return { action, token: saved.token };
    }
  } catch { /* a missing or malformed link can be requested again */ }
  return null;
}

export function clearEmailLink(): void {
  try { sessionStorage.removeItem(storageKey); } catch { /* storage is optional */ }
  const url = new URL(window.location.href);
  url.searchParams.delete("email_action");
  url.hash = "";
  window.history.replaceState(window.history.state, "", url);
}

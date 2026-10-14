// Optional browser storage must never prevent editing or opening the workspace.
export function readStoredString(key: string, fallback: string): string {
  try { return window.localStorage.getItem(key) ?? fallback; }
  catch { return fallback; }
}

export function readStoredNumber(key: string, fallback: number): number {
  const stored = readStoredString(key, "");
  const value = stored.trim() ? Number(stored) : NaN;
  return Number.isFinite(value) ? value : fallback;
}

export function writeStoredValue(key: string, value: string | number) {
  try { window.localStorage.setItem(key, String(value)); }
  catch { /* Keep the current state when storage is unavailable. */ }
}

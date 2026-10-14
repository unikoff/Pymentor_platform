import { readStoredNumber, readStoredString } from "../../../shared/lib/storage";

export function readPracticeEditorHeight(key: string, fallback: number) {
  const workbenchHeight = typeof window === "undefined"
    ? 700
    : Math.max(380, Math.min(820, window.innerHeight * 0.68));
  const maxEditorHeight = Math.max(180, Math.floor(workbenchHeight - 192));
  const value = readStoredNumber(key, fallback);
  return Math.min(maxEditorHeight, value >= 180 ? value : fallback);
}

export function getDefaultEditorHeight() {
  const viewportHeight = typeof window === "undefined" ? 900 : window.innerHeight;
  const workbenchHeight = Math.max(380, Math.min(820, viewportHeight * 0.68));
  return Math.max(180, Math.floor(workbenchHeight - 194));
}

export function readStoredPercent(key: string, fallback: number) {
  const value = Number(readStoredString(key, String(fallback)));
  return Number.isFinite(value) ? Math.min(66, Math.max(32, value)) : fallback;
}

export function getPracticeBriefWidthRange(workspaceWidth: number) {
  const safeWidth = Math.max(640, workspaceWidth);
  const minWidth = Math.max(280, safeWidth * 0.32);
  const maxWidth = Math.max(minWidth, Math.min(safeWidth * 0.66, safeWidth - 352));
  return {
    workspaceWidth: safeWidth,
    minWidth,
    maxWidth,
    minPercent: minWidth / safeWidth * 100,
    maxPercent: maxWidth / safeWidth * 100,
  };
}

export function clampPracticeBriefPercent(percent: number, workspaceWidth: number, minPercent?: number, maxPercent?: number) {
  const range = getPracticeBriefWidthRange(workspaceWidth);
  const min = minPercent ?? range.minPercent;
  const max = maxPercent ?? range.maxPercent;
  return Math.min(max, Math.max(min, percent));
}

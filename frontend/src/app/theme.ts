import type { ThemeMode } from "../shared/ui/theme-toggle/types";

export function getInitialTheme(): ThemeMode {
  try {
    const theme = window.localStorage.getItem("pymentor-theme") === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    return theme;
  } catch {
    return "dark";
  }
}

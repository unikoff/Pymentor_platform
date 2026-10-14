import { darkPalette, lightPalette, type ThemePalette } from "./palettes";

export type ColorScheme = "dark" | "light";
type ThemeDefinition = { label: string; colorScheme: ColorScheme; palette: ThemePalette };

// A new theme inherits a complete palette and overrides only its differences.
export const themes = {
  dark: { label: "Тёмная", colorScheme: "dark", palette: darkPalette },
  light: { label: "Светлая", colorScheme: "light", palette: lightPalette },
} satisfies Record<string, ThemeDefinition>;

export type ThemeId = keyof typeof themes;
export const themeIds = Object.keys(themes) as ThemeId[];
export const DEFAULT_THEME: ThemeId = "dark";
export const THEME_STORAGE_KEY = "pymentor-theme";

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(themes, value);
}

export function applyTheme(id: ThemeId) {
  const { colorScheme, palette } = themes[id];
  const root = document.documentElement;
  root.dataset.theme = id;
  root.dataset.colorScheme = colorScheme;
  root.style.colorScheme = colorScheme;
  for (const [name, value] of Object.entries(palette)) root.style.setProperty(`--${name}`, value);
}

import { createContext, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { applyTheme, DEFAULT_THEME, isThemeId, THEME_STORAGE_KEY, themes, type ThemeId } from "./catalog";
import { readStoredString, writeStoredValue } from "../lib/storage";

type ThemeContextValue = { theme: ThemeId; setTheme: (theme: ThemeId) => void; colorScheme: "dark" | "light" };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(() => {
    const stored = readStoredString(THEME_STORAGE_KEY, DEFAULT_THEME);
    const initial = isThemeId(stored) ? stored : DEFAULT_THEME;
    applyTheme(initial);
    return initial;
  });

  useLayoutEffect(() => {
    applyTheme(theme);
    writeStoredValue(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, colorScheme: themes[theme].colorScheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("ThemeProvider is missing");
  return context;
}

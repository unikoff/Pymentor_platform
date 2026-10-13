import { Moon, Sun } from "lucide-react";
import type { ThemeMode } from "./types";

export function ThemeToggle({ theme, onToggleTheme }: { theme: ThemeMode; onToggleTheme: () => void }) {
  const isDark = theme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      className="theme-switch"
      type="button"
      onClick={onToggleTheme}
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
    >
      <Icon size={16} />
      <span>{isDark ? "Светлая" : "Тёмная"}</span>
    </button>
  );
}

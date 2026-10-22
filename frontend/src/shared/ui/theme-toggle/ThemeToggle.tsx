import { Moon, Sun } from "lucide-react";
import { themeIds, themes, useTheme } from "../../theme";
import "./theme-toggle.css";

export function ThemeToggle() {
  const { theme, setTheme, colorScheme } = useTheme();
  const isDark = colorScheme === "dark";

  if (themeIds.length > 2) return (
    <select className="theme-select" aria-label="Тема оформления" value={theme}
      onChange={(event) => {
        const next = themeIds.find((id) => id === event.target.value);
        if (next) setTheme(next);
      }}>
      {themeIds.map((id) => <option key={id} value={id}>{themes[id].label}</option>)}
    </select>
  );
  const nextTheme = themeIds[(themeIds.indexOf(theme) + 1) % themeIds.length];

  return (
    <button
      className="theme-switch"
      type="button"
      role="switch"
      aria-checked={!isDark}
      onClick={() => setTheme(nextTheme)}
      aria-label="Светлая тема"
      title={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
    >
      <span className="theme-switch__thumb" aria-hidden="true" />
      <span className="theme-switch__option" aria-hidden="true"><Moon size={14} /></span>
      <span className="theme-switch__option" aria-hidden="true"><Sun size={14} /></span>
    </button>
  );
}

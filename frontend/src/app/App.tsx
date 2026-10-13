import { useEffect, useState } from "react";
import { AuthScreen, getCurrentUser } from "../features/auth";
import { Workspace } from "./Workspace";
import { getInitialTheme } from "./theme";
import type { UserProfile } from "../shared/api/contracts";
import type { ThemeMode } from "../shared/ui/theme-toggle/types";

export function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setIsCheckingSession(false));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("pymentor-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  if (isCheckingSession) {
    return <div className="boot-screen">Pymentor</div>;
  }

  if (!user && isAuthOpen) {
    return (
      <AuthScreen
        onAuth={(nextUser) => {
          setUser(nextUser);
          setIsAuthOpen(false);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
        onBack={() => setIsAuthOpen(false)}
      />
    );
  }

  return (
    <Workspace
      user={user}
      theme={theme}
      onToggleTheme={toggleTheme}
      onLogout={() => setUser(null)}
      onRequireAuth={() => setIsAuthOpen(true)}
    />
  );
}

import { useEffect, useState } from "react";
import { AuthScreen, getCurrentUser } from "../features/auth";
import { Workspace } from "./Workspace";
import type { UserProfile } from "../shared/api/contracts";
import { AsyncBoundary } from "../shared/ui/async-boundary/AsyncBoundary";
import { NotFoundPage } from "./NotFoundPage";
import { StartupScreen } from "./StartupScreen";
import "./status-pages.css";

const basePath = new URL(import.meta.env.BASE_URL, window.location.origin).pathname;
const appPath = basePath.length > 1 ? basePath.replace(/\/+$/, "") : "/";

function isAppEntry(pathname: string) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  return path === appPath;
}

export function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    if (!isAppEntry(window.location.pathname)) return;
    getCurrentUser()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setIsCheckingSession(false));
  }, []);

  if (!isAppEntry(window.location.pathname)) return <NotFoundPage />;

  if (isCheckingSession) {
    return <StartupScreen />;
  }

  if (!user && isAuthOpen) {
    return (
      <AsyncBoundary fallback={<StartupScreen />}><AuthScreen
        onAuth={(nextUser) => {
          setUser(nextUser);
          setIsAuthOpen(false);
        }}
        onBack={() => setIsAuthOpen(false)}
      /></AsyncBoundary>
    );
  }

  return (
    <Workspace
      key={user ? String(user.id) : "guest"}
      user={user}
      onLogout={() => setUser(null)}
      onRequireAuth={() => setIsAuthOpen(true)}
    />
  );
}

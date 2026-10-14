import { useEffect, useState } from "react";
import { AuthScreen, getCurrentUser } from "../features/auth";
import { Workspace } from "./Workspace";
import type { UserProfile } from "../shared/api/contracts";
import { AsyncBoundary } from "../shared/ui/async-boundary/AsyncBoundary";

export function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setIsCheckingSession(false));
  }, []);

  if (isCheckingSession) {
    return <div className="boot-screen">Pymentor</div>;
  }

  if (!user && isAuthOpen) {
    return (
      <AsyncBoundary fallback={<div className="boot-screen" role="status">Загружаем вход…</div>}><AuthScreen
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

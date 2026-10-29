import { lazy, useEffect, useState } from "react";
import { AuthScreen, getCurrentUser } from "../features/auth";
import type { UserProfile } from "../shared/api/contracts";
import { AsyncBoundary } from "../shared/ui/async-boundary/AsyncBoundary";
import { NotFoundPage } from "./NotFoundPage";
import { StartupScreen } from "./StartupScreen";
import "./status-pages.css";

const Workspace = lazy(() => import("./Workspace").then(({ Workspace }) => ({ default: Workspace })));
const BackendLandingRoute = lazy(() => import("./BackendLandingRoute").then(({ BackendLandingRoute }) => ({ default: BackendLandingRoute })));

function normalizePath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "");
  return normalized || "/";
}

const basePath = new URL(import.meta.env.BASE_URL, window.location.origin).pathname;
const appPath = normalizePath(basePath);
const landingPath = `${appPath === "/" ? "" : appPath}/backend`;

function isAppEntry(pathname: string) {
  return normalizePath(pathname) === appPath;
}

export function App() {
  const pathname = window.location.pathname;

  if (normalizePath(pathname) === landingPath) {
    return <AsyncBoundary fallback={<StartupScreen />}><BackendLandingRoute /></AsyncBoundary>;
  }

  if (!isAppEntry(pathname)) return <NotFoundPage />;

  return <PlatformEntry />;
}

function PlatformEntry() {
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
    <AsyncBoundary fallback={<StartupScreen />}>
      <Workspace
        key={user ? String(user.id) : "guest"}
        user={user}
        onLogout={() => setUser(null)}
        onRequireAuth={() => setIsAuthOpen(true)}
      />
    </AsyncBoundary>
  );
}

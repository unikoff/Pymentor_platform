import { lazy, useEffect, useState } from "react";
import { AuthScreen, getCurrentUser } from "../features/auth";
import type { UserProfile } from "../shared/api/contracts";
import { AsyncBoundary } from "../shared/ui/async-boundary/AsyncBoundary";
import { landingUrl, platformUrl } from "../shared/paths";
import { NotFoundPage } from "./NotFoundPage";
import { StartupScreen } from "./StartupScreen";
import { EmailActionScreen } from "../features/auth/EmailActionScreen";
import { clearEmailLink, readEmailLink } from "../features/auth/email-link";
import "./status-pages.css";

const Workspace = lazy(() => import("./Workspace").then(({ Workspace }) => ({ default: Workspace })));
const BackendLandingRoute = lazy(() => import("./BackendLandingRoute").then(({ BackendLandingRoute }) => ({ default: BackendLandingRoute })));

function normalizePath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "");
  return normalized || "/";
}

const appPath = normalizePath(new URL(platformUrl, window.location.origin).pathname);
const landingPath = normalizePath(new URL(landingUrl, window.location.origin).pathname);

function isAppEntry(pathname: string) {
  return normalizePath(pathname) === appPath;
}

export function App() {
  const pathname = window.location.pathname;

  if (import.meta.env.DEV && normalizePath(pathname) === `${appPath}/preview-loading`) {
    return <StartupScreen />;
  }

  if (normalizePath(pathname) === landingPath || ["reviews", "platform", "pricing", "personal-data", "privacy-policy"].some((page) => [landingPath, appPath].some((path) => normalizePath(pathname) === `${path}/${page}`))) {
    return <AsyncBoundary fallback={<StartupScreen />}><BackendLandingRoute /></AsyncBoundary>;
  }

  if (!isAppEntry(pathname)) return <NotFoundPage />;

  return <PlatformEntry />;
}

function PlatformEntry() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [emailAction, setEmailAction] = useState(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("email_action")) return undefined;
    let result = null;
    try { result = readEmailLink(url, window.sessionStorage); }
    catch { result = readEmailLink(url, { getItem: () => null, setItem: () => {} }); }
    if (url.hash) {
      url.hash = "";
      window.history.replaceState(window.history.state, "", url);
    }
    return result;
  });

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setIsCheckingSession(false));
  }, []);

  if (isCheckingSession) {
    return <StartupScreen />;
  }

  if (emailAction !== undefined) {
    return <EmailActionScreen link={emailAction} user={user} onUserChange={setUser} onClose={() => {
      clearEmailLink();
      setEmailAction(undefined);
      if (!user) setIsAuthOpen(true);
    }} />;
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
        onUserChange={setUser}
        onLogout={() => setUser(null)}
        onRequireAuth={() => setIsAuthOpen(true)}
      />
    </AsyncBoundary>
  );
}

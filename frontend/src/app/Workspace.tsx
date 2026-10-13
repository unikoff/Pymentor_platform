import React, { useEffect, useMemo, useState } from "react";
import { CalendarClock, CalendarPlus, Clock, LogOut, Moon, Search, Sun, Trash2 } from "lucide-react";
import { AccountDrawer, useAccountSchedule } from "../features/account";
import { logoutUser } from "../features/auth";
import { getInitialCalendarMonth } from "../shared/lib/dates";
import { AdminScreen } from "../features/admin";
import { PYTHON_TRACK_NAME, useLearningCourse, type WorkspaceView } from "../features/learning";
import { WorkspaceActivityBar } from "./workspace/WorkspaceActivityBar";
import { LessonExplorer } from "./workspace/LessonExplorer";
import { DEFAULT_OPEN_VIEWS, WorkspaceWorkbench } from "./workspace/WorkspaceWorkbench";
import type { UserProfile, CalendarMonth } from "../shared/api/contracts";
import type { ThemeMode } from "../shared/ui/theme-toggle/types";

const EXPLORER_MIN_WIDTH = 220;
const EXPLORER_MAX_WIDTH = 480;
const EXPLORER_DEFAULT_WIDTH = 320;

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getInitialExplorerWidth(): number {
  try {
    const storedWidth = Number(window.localStorage.getItem("pymentor-explorer-width"));
    if (Number.isFinite(storedWidth)) {
      return clampNumber(storedWidth, EXPLORER_MIN_WIDTH, EXPLORER_MAX_WIDTH);
    }
  } catch {
    // localStorage can be unavailable in restricted browser modes.
  }

  return EXPLORER_DEFAULT_WIDTH;
}

export function Workspace({
  user,
  theme,
  onToggleTheme,
  onLogout,
  onRequireAuth,
}: {
  user: UserProfile | null;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout: () => void;
  onRequireAuth: () => void;
}) {
  const {
    tracks,
    activeTrackId,
    setActiveTrackId,
    isLessonsLoading,
    displayLessons,
    lessonModules,
    progress,
    handleLessonCompleted,
  } = useLearningCourse(user);
  const [isTrackMenuOpen, setIsTrackMenuOpen] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState(`${PYTHON_TRACK_NAME}-lesson-01`);
  const [activeView, setActiveView] = useState<WorkspaceView>("theory");
  const [openViews, setOpenViews] = useState<WorkspaceView[]>(DEFAULT_OPEN_VIEWS);
  const [isExplorerOpen, setIsExplorerOpen] = useState(() => window.innerWidth > 900);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isResizingExplorer, setIsResizingExplorer] = useState(false);
  const [explorerWidth, setExplorerWidth] = useState(getInitialExplorerWidth);
  const [calendarMonth, setCalendarMonth] = useState<CalendarMonth>(getInitialCalendarMonth);
  const { activityDays, bookingSlots, bookingQuota, bookSlot, cancelSlotBooking } = useAccountSchedule(user?.id ?? null, calendarMonth);
  const [openModules, setOpenModules] = useState<Set<string>>(() => new Set());
  const activeLesson = displayLessons.find((lesson) => lesson.id === activeLessonId) ?? displayLessons[0];
  const nextLesson = useMemo(() => {
    const currentIndex = displayLessons.findIndex((lesson) => lesson.id === activeLesson?.id);
    return currentIndex >= 0 ? displayLessons[currentIndex + 1] : undefined;
  }, [activeLesson?.id, displayLessons]);
  const workspaceStyle = { "--explorer": `${explorerWidth}px` } as React.CSSProperties;

  useEffect(() => {
    try {
      window.localStorage.setItem("pymentor-explorer-width", String(explorerWidth));
    } catch {
      // localStorage can be unavailable in restricted browser modes.
    }
  }, [explorerWidth]);

  useEffect(() => {
    if (!isResizingExplorer) {
      return undefined;
    }

    function handlePointerMove(event: PointerEvent) {
      const activityWidth = document.querySelector(".activity-bar")?.getBoundingClientRect().width ?? 54;
      setExplorerWidth(clampNumber(event.clientX - activityWidth, EXPLORER_MIN_WIDTH, EXPLORER_MAX_WIDTH));
    }

    function handlePointerUp() {
      setIsResizingExplorer(false);
    }

    document.body.classList.add("is-resizing-panel");
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });

    return () => {
      document.body.classList.remove("is-resizing-panel");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isResizingExplorer]);

  useEffect(() => {
    setOpenModules((current) => {
      const availableModules = new Set(lessonModules);
      const retainedModules = Array.from(current).filter((moduleName) => availableModules.has(moduleName));
      return new Set(retainedModules.length > 0 ? retainedModules : lessonModules);
    });
    if (!displayLessons.some((lesson) => lesson.id === activeLessonId) && displayLessons[0]) {
      setActiveLessonId(displayLessons[0].id);
    }
  }, [activeLessonId, displayLessons, lessonModules]);

  function toggleModule(moduleName: string) {
    setOpenModules((current) => {
      const next = new Set(current);
      if (next.has(moduleName)) {
        next.delete(moduleName);
      } else {
        next.add(moduleName);
      }
      return next;
    });
  }

  function openView(view: WorkspaceView) {
    setOpenViews((current) => (current.includes(view) ? current : [...current, view]));
    setActiveView(view);
    if (window.innerWidth <= 900) {
      setIsExplorerOpen(false);
    }
  }

  function closeView(view: WorkspaceView) {
    const next = openViews.filter((item) => item !== view);
    setOpenViews(next);
    if (activeView === view) {
      setActiveView(next[next.length - 1] ?? "theory");
    }
  }

  function openNextLesson() {
    if (!nextLesson) {
      return;
    }
    setActiveLessonId(nextLesson.id);
    openView("theory");
  }

  async function handleLogout() {
    await logoutUser().catch(() => undefined);
    onLogout();
  }

  function openAccount() {
    if (!user) {
      onRequireAuth();
      return;
    }
    setIsAccountOpen(true);
  }

  return (
    <main className={`workspace ${isExplorerOpen ? "workspace--explorer-open" : "workspace--explorer-closed"}`} style={workspaceStyle}>
      <WorkspaceActivityBar
        isExplorerOpen={isExplorerOpen}
        isAdmin={Boolean(user?.is_admin)}
        isAdminOpen={isAdminOpen}
        activeView={activeView}
        onOpenLessons={() => setIsExplorerOpen(true)}
        onOpenPractice={() => openView("practice")}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAccount={openAccount}
      />
      <LessonExplorer
        tracks={tracks}
        activeTrackId={activeTrackId}
        isTrackMenuOpen={isTrackMenuOpen}
        progress={progress}
        lessonModules={lessonModules}
        displayLessons={displayLessons}
        activeLessonId={activeLessonId}
        openModules={openModules}
        isGuest={!user}
        onToggleTrackMenu={() => setIsTrackMenuOpen((current) => !current)}
        onSelectTrack={(trackId) => {
          setActiveTrackId(trackId);
          setIsTrackMenuOpen(false);
          if (window.innerWidth <= 900) {
            setIsExplorerOpen(false);
          }
        }}
        onToggleModule={toggleModule}
        onSelectLesson={(lesson) => {
          setActiveLessonId(lesson.id);
          openView("theory");
        }}
        onRequireAuth={onRequireAuth}
        onCollapse={() => setIsExplorerOpen(false)}
        onResizeStart={(event) => {
          event.preventDefault();
          setIsExplorerOpen(true);
          setIsResizingExplorer(true);
        }}
      />
      <WorkspaceWorkbench
        user={user}
        theme={theme}
        activeLesson={activeLesson}
        nextLesson={nextLesson}
        isExplorerOpen={isExplorerOpen}
        isLessonsLoading={isLessonsLoading}
        activeView={activeView}
        openViews={openViews}
        onToggleTheme={onToggleTheme}
        onOpenAccount={openAccount}
        onOpenExplorer={() => setIsExplorerOpen(true)}
        onOpenView={openView}
        onCloseView={closeView}
        onSetActiveView={setActiveView}
        onOpenNextLesson={openNextLesson}
        onLessonCompleted={handleLessonCompleted}
        onRequireAuth={onRequireAuth}
      />
      {user && (
        <AccountDrawer
          isOpen={isAccountOpen}
          progress={progress}
          user={user}
          calendarMonth={calendarMonth}
          activityDays={activityDays}
          bookingSlots={bookingSlots}
          bookingQuota={bookingQuota}
          onMonthChange={setCalendarMonth}
          onBookSlot={bookSlot}
          onCancelSlot={cancelSlotBooking}
          onClose={() => setIsAccountOpen(false)}
          onLogout={handleLogout}
        />
      )}
      {user?.is_admin && isAdminOpen && <AdminScreen onClose={() => setIsAdminOpen(false)} />}
    </main>
  );
}

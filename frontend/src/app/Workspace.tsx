import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarClock, CalendarPlus, Clock, LogOut, Moon, Search, Sun, Trash2 } from "lucide-react";
import { getTracks, getLessons } from "../features/learning/api";
import { useAccountSchedule } from "../features/account/useAccountSchedule";
import { logoutUser } from "../features/auth/api";
import { getInitialCalendarMonth } from "../shared/lib/dates";
import { getDisplayModule, lessons, PYTHON_MODULE_ORDER, PYTHON_TRACK_NAME } from "../features/learning/course";
import { AdminScreen } from "../features/admin/AdminScreen";
import { AccountDrawer } from "../features/account/AccountDrawer";
import { WorkspaceActivityBar } from "./workspace/WorkspaceActivityBar";
import { LessonExplorer } from "./workspace/LessonExplorer";
import { DEFAULT_OPEN_VIEWS, WorkspaceWorkbench } from "./workspace/WorkspaceWorkbench";
import type { UserProfile, CalendarMonth } from "../shared/api/contracts";
import type { Track, Lesson, WorkspaceView } from "../features/learning/types";
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

















// Префикс, под которым смонтирована платформа: "/platform" на проде, "" в dev.
// Vite подставляет сюда значение base из vite.config.ts.





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
  const [courseLessons, setCourseLessons] = useState<Lesson[]>(lessons);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<string>(() => {
    try {
      return window.localStorage.getItem("pymentor-track") ?? "";
    } catch {
      return "";
    }
  });
  const [loadedTrackId, setLoadedTrackId] = useState(PYTHON_TRACK_NAME);
  const [isLessonsLoading, setIsLessonsLoading] = useState(false);
  const lessonsRequestId = useRef(0);
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
  const isCurrentTrackLoaded = loadedTrackId === activeTrackId;
  const displayLessons = useMemo(
    () => (isCurrentTrackLoaded ? courseLessons : []).map((lesson) => ({ ...lesson, module: getDisplayModule(lesson, activeTrackId) })),
    [activeTrackId, courseLessons, isCurrentTrackLoaded],
  );
  const lessonModules = useMemo(() => {
    const available = new Set(displayLessons.map((lesson) => lesson.module));
    return [
      ...PYTHON_MODULE_ORDER.filter((moduleName) => available.has(moduleName)),
      ...Array.from(available).filter((moduleName) => !PYTHON_MODULE_ORDER.includes(moduleName)),
    ];
  }, [displayLessons]);
  const moduleKey = lessonModules.join("|");
  const activeLesson = displayLessons.find((lesson) => lesson.id === activeLessonId) ?? displayLessons[0];
  const nextLesson = useMemo(() => {
    const currentIndex = displayLessons.findIndex((lesson) => lesson.id === activeLesson?.id);
    return currentIndex >= 0 ? displayLessons[currentIndex + 1] : undefined;
  }, [activeLesson?.id, displayLessons]);
  const workspaceStyle = { "--explorer": `${explorerWidth}px` } as React.CSSProperties;

  const progress = useMemo(() => {
    // Прогресс считаем только по «зачётным» урокам: с практикой или self_check.
    // Обзорные страницы вроде «Карты обучения» зачесть нельзя: они не в счёте.
    const countable = courseLessons.filter((lesson) => (lesson.tasks?.length ?? 0) > 0 || lesson.self_check);
    if (countable.length === 0) {
      return 0;
    }
    const done = countable.filter((lesson) => lesson.completed).length;
    return Math.round((done / countable.length) * 100);
  }, [courseLessons]);

  const loadTracks = useCallback(() => {
    getTracks()
      .then((data) => {
        setTracks(data.tracks);
        setActiveTrackId((current) =>
          current && data.tracks.some((track) => track.id === current) ? current : data.default_track ?? "",
        );
      })
      .catch(() => undefined);
  }, []);

  const loadLessons = useCallback(() => {
    if (!activeTrackId) {
      setCourseLessons([]);
      setLoadedTrackId("");
      return;
    }

    const requestedTrackId = activeTrackId;
    const requestId = lessonsRequestId.current + 1;
    lessonsRequestId.current = requestId;
    setIsLessonsLoading(true);
    setLoadedTrackId((loadedTrack) => (loadedTrack === requestedTrackId ? loadedTrack : ""));

    getLessons(requestedTrackId)
      .then((data) => {
        if (requestId !== lessonsRequestId.current || data.track !== requestedTrackId) {
          return;
        }
        setCourseLessons(data.lessons);
        setLoadedTrackId(data.track);
      })
      .catch(() => {
        if (requestId !== lessonsRequestId.current) {
          return;
        }
        setCourseLessons([]);
        setLoadedTrackId(requestedTrackId);
      })
      .finally(() => {
        if (requestId === lessonsRequestId.current) {
          setIsLessonsLoading(false);
        }
      });
  }, [activeTrackId]);
  const handleLessonCompleted = useCallback(() => {
    loadLessons();
    loadTracks();
  }, [loadLessons, loadTracks]);

  useEffect(() => {
    loadTracks();
  }, [loadTracks, user?.id]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons, user?.id, user?.has_active_subscription, user?.subscription_until]);

  useEffect(() => {
    if (!activeTrackId) {
      return;
    }
    try {
      window.localStorage.setItem("pymentor-track", activeTrackId);
    } catch {
      // localStorage может быть недоступен в приватных режимах браузера.
    }
  }, [activeTrackId]);

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
  }, [activeLessonId, displayLessons, lessonModules, moduleKey]);

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

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ChevronRight, User } from "lucide-react";
import { useRecordActivityVisit } from "../features/account";
import { logoutUser } from "../features/auth";
import { PracticeSessionProvider, useLearningCourse, type Lesson } from "../features/learning";
import { formatSubscriptionDate, getInitialCalendarMonth } from "../shared/lib/dates";
import { ThemeToggle } from "../shared/ui/theme-toggle/ThemeToggle";
import type { UserProfile, CalendarMonth } from "../shared/api/contracts";
import { WorkspaceActivityBar } from "./workspace/WorkspaceActivityBar";
import { WorkspaceWorkbench, type ActiveWorkspacePanel, type WorkspaceCommands } from "./workspace/WorkspaceWorkbench";
import { LessonsDrawerContent, WorkspacePanelContext } from "./workspace/WorkspacePanels";
import { useContentSwitch } from "../shared/ui/motion/useContentSwitch";
import type { LessonPanelKind, LessonTarget } from "./workspace/layout";

const EXPLORER_MIN_WIDTH = 220;
const EXPLORER_MAX_WIDTH = 480;
const EXPLORER_DEFAULT_WIDTH = 320;

function formatLessonHeading(lesson: Lesson, trackTitle?: string) {
  const chapterNumber = trackTitle?.match(/^Глава\s+(\d+)/i)?.[1]
    ?? lesson.source_file?.match(/chapter_(\d+)/i)?.[1]
    ?? lesson.module.match(/(?:Блок|Глава)\s+(\d+)/i)?.[1];
  const lessonMatch = lesson.title.match(/^(\d+(?:\.\d+)*)\.?\s+(.+)$/);
  return {
    chapter: chapterNumber ? `Глава ${Number(chapterNumber)}` : undefined,
    number: lessonMatch?.[1],
    title: lessonMatch ? lessonMatch[2].replace(/^[.)\-–—]\s*/, "") : lesson.title,
  };
}

function getProfileHint(user: UserProfile | null): { tier?: string; detail: string } {
  if (!user) return { detail: "Гостевой доступ" };
  if (user.has_active_subscription) {
    const endDate = user.subscription_until
      ? formatSubscriptionDate(user.subscription_until).match(/^(\d{2}\.\d{2})\./)?.[1]
      : undefined;
    return { tier: "pro", detail: endDate ? `до ${endDate}` : "активен" };
  }
  return { detail: user.is_admin ? "Администратор" : "Нет подписки" };
}

function getInitialExplorerWidth() {
  try {
    const width = Number(localStorage.getItem("pymentor-explorer-width"));
    if (Number.isFinite(width)) return Math.min(EXPLORER_MAX_WIDTH, Math.max(EXPLORER_MIN_WIDTH, width));
  } catch { /* Storage is optional. */ }
  return EXPLORER_DEFAULT_WIDTH;
}

export function Workspace({ user, onLogout, onRequireAuth }: {
  user: UserProfile | null;
  onLogout: () => void;
  onRequireAuth: () => void;
}) {
  const ownerKey = user ? String(user.id) : "guest";
  const course = useLearningCourse(user);
  const [calendarMonth, setCalendarMonth] = useState<CalendarMonth>(getInitialCalendarMonth);
  useRecordActivityVisit(user?.id ?? null);
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 900px)").matches);
  const [activePanel, setActivePanel] = useState<ActiveWorkspacePanel>();
  const [lessonTarget, setLessonTarget] = useState<LessonTarget>();
  const [isExplorerOpen, setIsExplorerOpen] = useState(!compact);
  const [lessonMenuPeek, setLessonMenuPeek] = useState<"closed" | "open" | "closing">("closed");
  const [explorerWidth, setExplorerWidth] = useState(getInitialExplorerWidth);
  const [isResizingExplorer, setIsResizingExplorer] = useState(false);
  const lessonMenuTimers = useRef<number[]>([]);
  const commands = useRef<WorkspaceCommands | null>(null);
  const workspaceRef = useRef<HTMLElement>(null);
  const switchContent = useContentSwitch();
  const clearLessonMenuTimers = useCallback(() => {
    lessonMenuTimers.current.forEach((timer) => window.clearTimeout(timer));
    lessonMenuTimers.current = [];
  }, []);
  const firstAvailable = course.displayLessons.find((lesson) => lesson.is_available !== false);
  const initialLesson = useMemo(() => firstAvailable ? { trackId: course.activeTrackId, lessonId: firstAvailable.id } : undefined,
    [course.activeTrackId, firstAvailable?.id]);
  const entry = course.courses[course.activeTrackId];
  const ready = Boolean(course.tracksError || (course.tracksLoaded && (!course.activeTrackId || (entry && !entry.loading))));
  const workspaceStyle = { "--explorer": `${explorerWidth}px` } as CSSProperties;

  useEffect(() => {
    try { localStorage.setItem("pymentor-explorer-width", String(explorerWidth)); }
    catch { /* Storage is optional. */ }
  }, [explorerWidth]);

  useEffect(() => {
    if (!isResizingExplorer) return;
    const move = (event: globalThis.PointerEvent) => {
      const activityWidth = document.querySelector(".activity-bar")?.getBoundingClientRect().width ?? 54;
      setExplorerWidth(Math.min(EXPLORER_MAX_WIDTH, Math.max(EXPLORER_MIN_WIDTH, event.clientX - activityWidth)));
    };
    const finish = () => setIsResizingExplorer(false);
    document.body.classList.add("is-resizing-panel");
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish, { once: true });
    return () => {
      document.body.classList.remove("is-resizing-panel");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
    };
  }, [isResizingExplorer]);

  useEffect(() => clearLessonMenuTimers, [clearLessonMenuTimers]);
  useEffect(() => {
    if (!compact) return;
    clearLessonMenuTimers();
    setLessonMenuPeek("closed");
  }, [clearLessonMenuTimers, compact]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const update = () => setCompact(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const onActivePanel = useCallback((panel?: ActiveWorkspacePanel) => {
    setActivePanel(panel);
  }, []);
  const onLessonChange = useCallback((target?: LessonTarget) => {
    setLessonTarget(target);
    if (target && compact) setIsExplorerOpen(false);
  }, [compact]);
  const previewLessonsOnHover = useCallback((pointerType: string) => {
    if (pointerType !== "mouse" || compact || isExplorerOpen) return;
    clearLessonMenuTimers();
    setLessonMenuPeek("open");
  }, [clearLessonMenuTimers, compact, isExplorerOpen]);
  const closeLessonPreview = useCallback((pointerType: string) => {
    if (pointerType !== "mouse" || compact || isExplorerOpen) return;
    clearLessonMenuTimers();
    lessonMenuTimers.current.push(window.setTimeout(() => {
      setLessonMenuPeek("closing");
      lessonMenuTimers.current.push(window.setTimeout(() => {
        setLessonMenuPeek("closed");
        lessonMenuTimers.current = [];
      }, 170));
    }, 110));
  }, [clearLessonMenuTimers, compact, isExplorerOpen]);
  const toggleLessons = useCallback(() => {
    clearLessonMenuTimers();
    setLessonMenuPeek("closed");
    setIsExplorerOpen((value) => !value);
  }, [clearLessonMenuTimers]);
  const closeLessons = useCallback(() => {
    clearLessonMenuTimers();
    setLessonMenuPeek("closed");
    setIsExplorerOpen(false);
  }, [clearLessonMenuTimers]);
  const openLesson = useCallback((kind: LessonPanelKind, target: LessonTarget) => {
    const changingLesson = lessonTarget?.trackId !== target.trackId || lessonTarget?.lessonId !== target.lessonId;
    const current = changingLesson
      ? Array.from(workspaceRef.current?.querySelectorAll<HTMLElement>(".dock-lesson:not(.content-switch-snapshot)") ?? [])
        .filter((panel) => panel.getClientRects().length > 0 && getComputedStyle(panel).visibility === "visible")
      : null;
    switchContent("lesson", current ?? null, () => commands.current?.openLesson(kind, target));
  }, [lessonTarget, switchContent]);
  function onSelectLesson(lesson: Lesson) {
    openLesson("theory", { trackId: course.activeTrackId, lessonId: lesson.id });
  }
  function openStudy(kind: LessonPanelKind) {
    const target = lessonTarget ?? initialLesson;
    if (target) openLesson(kind, target);
    else setIsExplorerOpen(true);
  }
  function openAccount() {
    if (!user) { onRequireAuth(); return; }
    commands.current?.openAccount();
  }
  async function handleLogout() {
    try { await logoutUser(); onLogout(); }
    catch (error) { window.alert(error instanceof Error ? error.message : "Не удалось выйти из аккаунта"); }
  }
  const activeLesson = activePanel?.kind && lessonTarget ? course.courses[lessonTarget.trackId]?.lessons.find((lesson) => lesson.id === lessonTarget.lessonId) : undefined;
  const activeTrackTitle = lessonTarget ? course.tracks.find((track) => track.id === lessonTarget.trackId)?.title : undefined;
  const workspaceHeading = activeLesson ? formatLessonHeading(activeLesson, activeTrackTitle) : undefined;
  const profileHint = getProfileHint(user);
  return <PracticeSessionProvider>
    <WorkspacePanelContext.Provider value={{ user, course, calendarMonth, setCalendarMonth,
      selectedLessonId: lessonTarget?.trackId === course.activeTrackId ? lessonTarget.lessonId : "", onSelectLesson, openLesson, onRequireAuth, onLogout: handleLogout,
      onCloseLessons: closeLessons }}>
      <main ref={workspaceRef} className={`workspace workspace--dock ${compact ? "workspace--compact" : ""} ${isExplorerOpen ? "workspace--explorer-open" : "workspace--explorer-closed"}`} style={workspaceStyle}>
        <WorkspaceActivityBar isExplorerOpen={isExplorerOpen || lessonMenuPeek !== "closed"} isAdmin={Boolean(user?.is_admin)}
          isAdminOpen={activePanel?.id === "admin"} isAccountOpen={activePanel?.id === "account"} isInterpreterOpen={activePanel?.id === "interpreter"} activeView={activePanel?.kind}
          onOpenLessons={toggleLessons} onLessonsPointerEnter={previewLessonsOnHover} onLessonsPointerLeave={closeLessonPreview}
          onOpenTheory={() => openStudy("theory")} onOpenPractice={() => openStudy("practice")}
          onOpenAdmin={() => commands.current?.openAdmin()} onOpenAccount={openAccount} onOpenInterpreter={() => commands.current?.openInterpreter()} />
        {(isExplorerOpen || lessonMenuPeek !== "closed") && <aside
          className={`workspace-drawer${lessonMenuPeek !== "closed" && !isExplorerOpen ? ` workspace-drawer--peek workspace-drawer--peek-${lessonMenuPeek}` : ""}`}
          aria-label="Список занятий"
          onPointerEnter={(event) => previewLessonsOnHover(event.pointerType)}
          onPointerLeave={(event) => closeLessonPreview(event.pointerType)}>
          <LessonsDrawerContent />
        </aside>}
        {isExplorerOpen && !compact && <button className="explorer-resizer" type="button" aria-label="Изменить ширину списка занятий"
          onPointerDown={(event: PointerEvent<HTMLButtonElement>) => { event.preventDefault(); setIsResizingExplorer(true); }} />}
        <div className="workspace-body">
          <header className="top-bar">
            <div className="breadcrumbs" title={workspaceHeading ? [workspaceHeading.chapter, workspaceHeading.number, workspaceHeading.title].filter(Boolean).join(" · ") : undefined}>
              {workspaceHeading?.chapter && <span className="workspace-chapter">{workspaceHeading.chapter}</span>}
              {workspaceHeading?.number && <span className="workspace-lesson-number">{workspaceHeading.number}</span>}
              <strong className="workspace-title">{workspaceHeading?.title ?? (activePanel?.id === "account" ? "Личный кабинет" : activePanel?.id === "admin" ? "Админ-панель" : activePanel?.id === "interpreter" ? "Интерпретатор Python" : "Pymentor")}</strong>
            </div>
            <div className="top-actions">
              <ThemeToggle />
              <button className="profile-button" type="button" onClick={openAccount} aria-label={user ? `Личный кабинет: ${user.username}` : "Войти в личный кабинет"} aria-current={activePanel?.id === "account" ? "page" : undefined}>
                <span className="profile-button__avatar" aria-hidden="true">{user ? user.username.slice(0, 1).toUpperCase() : <User size={16} />}</span>
                <span className="profile-button__text">
                  <strong>{user?.username ?? "Войти"}</strong>
                  <span className="profile-button__meta" title={[profileHint.tier, profileHint.detail].filter(Boolean).join(" ")}>
                    {profileHint.tier && <span className="profile-button__tier">{profileHint.tier}</span>}
                    <small>{profileHint.detail}</small>
                  </span>
                </span>
                <ChevronRight className="profile-button__chevron" size={14} aria-hidden="true" />
              </button>
            </div>
          </header>
          <WorkspaceWorkbench key={compact ? "mobile" : "desktop"} ownerKey={ownerKey} compact={compact}
            isAuthenticated={Boolean(user)} isAdmin={Boolean(user?.is_admin)} ready={ready} initialLesson={initialLesson}
            selectedLesson={lessonTarget} commands={commands} onActivePanel={onActivePanel}
            onLessonChange={onLessonChange} onOpenLessons={() => setIsExplorerOpen(true)} />
        </div>
      </main>
    </WorkspacePanelContext.Provider>
  </PracticeSessionProvider>;
}

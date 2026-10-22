import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { IDockviewPanelProps } from "dockview-react";
import { AccountWorkspace } from "../../features/account";
import { AdminScreen } from "../../features/admin";
import { isLessonUnavailable, LearningPracticeView, LearningTheoryView, LessonNavigationProvider, LockedLessonView,
  useLearningCourse, OnlineInterpreter, type Lesson } from "../../features/learning";
import type { UserProfile, CalendarMonth } from "../../shared/api/contracts";
import { LessonExplorer } from "./LessonExplorer";
import { AsyncBoundary } from "../../shared/ui/async-boundary/AsyncBoundary";
import { LessonLoading, LessonTransition } from "../../features/learning/LessonLoading";
import { usePanelOpened } from "./usePanelOpened";
import { withPanelTransition } from "./PanelTransition";
import { isLessonTarget, type LessonPanelKind, type LessonTarget } from "./layout";

export type WorkspacePanelContextValue = {
  user: UserProfile | null;
  course: ReturnType<typeof useLearningCourse>;
  calendarMonth: CalendarMonth;
  setCalendarMonth: (month: CalendarMonth) => void;
  selectedLessonId: string;
  onSelectLesson: (lesson: Lesson) => void;
  openLesson: (kind: LessonPanelKind, target: LessonTarget) => void;
  onRequireAuth: () => void;
  onLogout: () => void;
  onCloseLessons: () => void;
};
export const WorkspacePanelContext = createContext<WorkspacePanelContextValue | null>(null);
function useWorkspace() {
  const context = useContext(WorkspacePanelContext);
  if (!context) throw new Error("WorkspacePanelContext is missing");
  return context;
}

export function LessonsDrawerContent() {
  const context = useWorkspace();
  const { course } = context;
  const [isTrackMenuOpen, setIsTrackMenuOpen] = useState(false);
  const [openModules, setOpenModules] = useState<Set<string>>(() => new Set(course.lessonModules));
  useEffect(() => { setOpenModules(new Set(course.lessonModules)); }, [course.lessonModules]);
  const entry = course.courses[course.activeTrackId];
  if (!course.tracksLoaded && !course.tracksError) return <div className="dock-explorer"><LessonLoading /></div>;
  return <div className="dock-explorer">
    {(course.tracksError || entry?.error) && <div className="panel-message" role="alert">
      <p>{course.tracksError || entry?.error}</p>
      <button className="secondary-action" onClick={() => { void course.loadTracks(); void course.ensureTrack(course.activeTrackId, true); }}>Повторить загрузку</button>
    </div>}
    {course.isLessonsLoading && <p className="panel-status" role="status">Загружаем занятия…</p>}
    <LessonExplorer tracks={course.tracks} activeTrackId={course.activeTrackId} isTrackMenuOpen={isTrackMenuOpen}
      progress={course.progress} lessonModules={course.lessonModules} displayLessons={course.displayLessons}
      activeLessonId={context.selectedLessonId} openModules={openModules} isGuest={!context.user}
      isAuthenticated={Boolean(context.user)} hasActiveSubscription={Boolean(context.user?.has_active_subscription)}
      onToggleTrackMenu={() => setIsTrackMenuOpen((value) => !value)}
      onSelectTrack={(trackId) => { course.setActiveTrackId(trackId); setIsTrackMenuOpen(false); }}
      onToggleModule={(name) => setOpenModules((current) => { const next = new Set(current); if (next.has(name)) next.delete(name); else next.add(name); return next; })}
      onSelectLesson={context.onSelectLesson} onRequireAuth={context.onRequireAuth} onCollapse={context.onCloseLessons} />
  </div>;
}

function LearningPanel({ kind, ...props }: IDockviewPanelProps & { kind: LessonPanelKind }) {
  const { course, user, openLesson, onRequireAuth } = useWorkspace();
  const opened = usePanelOpened(props.api);
  const target = isLessonTarget(props.params) ? props.params : null;
  const trackId = target?.trackId ?? "";
  const lessonId = target?.lessonId ?? "";
  const entry = course.courses[trackId];
  const summary = entry?.lessons.find((item) => item.id === lessonId);
  const material = course.materials[lessonId];
  const lesson = useMemo(() => summary ? { ...material?.lesson, ...summary } : undefined, [summary, material?.lesson]);
  const locked = Boolean(summary && (isLessonUnavailable(summary) || (summary.access === "registered" && !user) || (summary.access === "subscription" && !user?.has_active_subscription)));
  useEffect(() => {
    if (opened && summary && !locked) void course.ensureLesson(trackId, lessonId);
  }, [opened, Boolean(summary), locked, trackId, lessonId, course.ensureLesson]);
  const lessonNumber = lesson?.title.match(/^(\d+(?:\.\d+)*)\s*\./)?.[1];
  useEffect(() => {
    if (lesson) props.api.setTitle(`${lessonNumber ? `${lessonNumber} ` : ""}${kind === "theory" ? "Теория" : "Практика"}`);
  }, [props.api, kind, lesson, lessonNumber]);

  if (!opened) return null;
  if (!target) return <div className="panel-message">Материал недоступен.</div>;
  if (!entry && course.tracksError) return <div className="panel-message" role="alert">
    <p>{course.tracksError}</p><button className="secondary-action" onClick={() => void course.loadTracks()}>Повторить загрузку</button>
  </div>;
  if (!entry || (entry.loading && !lesson)) return <LessonLoading />;
  if (entry.error) return <div className="panel-message" role="alert">
    <p>{entry.error}</p><button className="secondary-action" onClick={() => void course.ensureTrack(trackId, true)}>Повторить загрузку</button>
  </div>;
  if (!lesson) return <div className="panel-message">
    <h2>Материал недоступен</h2><p>Урок удалён или больше не входит в этот курс.</p>
    <button className="secondary-action" onClick={() => props.api.close()}>Закрыть вкладку</button>
  </div>;
  if (!locked && material?.error) return <div className="panel-message" role="alert">
    <p>{material.error}</p><button className="secondary-action" onClick={() => void course.ensureLesson(trackId, lessonId, true)}>Повторить загрузку</button>
  </div>;
  if (!locked && !material?.lesson) return <LessonLoading />;
  const nextLesson = entry.lessons[entry.lessons.findIndex((item) => item.id === lessonId) + 1];
  return <article className="lesson-stage dock-lesson" aria-label={`${kind === "theory" ? "Теория" : "Практика"}: ${lesson.title}`}>
    <LessonTransition key={`${kind}:${trackId}:${lessonId}`}>{isLessonUnavailable(lesson) || (lesson.access === "registered" && !user) || (lesson.access === "subscription" && !user?.has_active_subscription) ? <LockedLessonView lesson={lesson} onRequireAuth={onRequireAuth} isGuest={!user} /> :
      kind === "theory" ? <AsyncBoundary key={`theory:${trackId}:${lessonId}`} fallback={<LessonLoading />}><LessonNavigationProvider nextLesson={nextLesson}
        onNextLesson={() => { if (nextLesson) openLesson("theory", { trackId, lessonId: nextLesson.id }); }}>
        <LearningTheoryView key={`${trackId}:${lessonId}`} lesson={lesson} />
      </LessonNavigationProvider></AsyncBoundary> :
      <AsyncBoundary key={`practice:${trackId}:${lessonId}`} fallback={<LessonLoading />}>
      <LearningPracticeView key={`${trackId}:${lessonId}`} lesson={lesson} isAuthenticated={Boolean(user)} onRequireAuth={onRequireAuth}
        onLessonCompleted={() => course.handleLessonCompleted(trackId, lessonId)} progressOwnerKey={user ? String(user.id) : "guest"} /></AsyncBoundary>}</LessonTransition>
  </article>;
}
function TheoryPanel(props: IDockviewPanelProps) { return <LearningPanel {...props} kind="theory" />; }
function PracticePanel(props: IDockviewPanelProps) { return <LearningPanel {...props} kind="practice" />; }

function AccountDockPanel({ api }: IDockviewPanelProps) {
  const context = useWorkspace();
  const opened = usePanelOpened(api);
  if (!context.user || !opened) return null;
  return <div className="dock-scroll"><AsyncBoundary><AccountWorkspace user={context.user} progress={context.course.progress}
    calendarMonth={context.calendarMonth} onMonthChange={context.setCalendarMonth} onLogout={context.onLogout} /></AsyncBoundary></div>;
}
function AdminDockPanel({ api }: IDockviewPanelProps) {
  const { user } = useWorkspace();
  const opened = usePanelOpened(api);
  return user?.is_admin && opened ? <div className="dock-scroll"><AsyncBoundary><AdminScreen /></AsyncBoundary></div> : null;
}
function InterpreterDockPanel({ api }: IDockviewPanelProps) {
  const { user } = useWorkspace();
  const opened = usePanelOpened(api);
  const ownerKey = user ? String(user.id) : "guest";
  return opened ? <AsyncBoundary><OnlineInterpreter key={ownerKey} ownerKey={ownerKey} /></AsyncBoundary> : null;
}
export const workspacePanels = {
  theory: withPanelTransition(TheoryPanel),
  practice: withPanelTransition(PracticePanel),
  account: withPanelTransition(AccountDockPanel),
  admin: withPanelTransition(AdminDockPanel),
  interpreter: withPanelTransition(InterpreterDockPanel),
};

import { ChevronRight, FileText, PanelLeftOpen, Terminal, User, X } from "lucide-react";
import { ThemeToggle } from "../../shared/ui/theme-toggle/ThemeToggle";
import { LessonNavigationProvider } from "../../features/learning/navigation/LessonNavigation";
import { LearningPracticeView } from "../../features/learning/practice/LearningPracticeView";
import { LearningTheoryView, LockedLessonView } from "../../features/learning/theory/MarkdownView";
import { isLessonUnavailable } from "../../features/learning/access";
import type { Lesson, WorkspaceView } from "../../features/learning/types";
import type { UserProfile } from "../../shared/api/contracts";
import type { ThemeMode } from "../../shared/ui/theme-toggle/types";

export const DEFAULT_OPEN_VIEWS: WorkspaceView[] = ["theory", "practice"];

const viewMeta = {
  theory: { label: "theory.md", Icon: FileText },
  practice: { label: "practice.py", Icon: Terminal },
} satisfies Record<WorkspaceView, { label: string; Icon: typeof FileText }>;

export function WorkspaceWorkbench({
  user,
  theme,
  activeLesson,
  nextLesson,
  isExplorerOpen,
  isLessonsLoading,
  activeView,
  openViews,
  onToggleTheme,
  onOpenAccount,
  onOpenExplorer,
  onOpenView,
  onCloseView,
  onSetActiveView,
  onOpenNextLesson,
  onLessonCompleted,
  onRequireAuth,
}: {
  user: UserProfile | null;
  theme: ThemeMode;
  activeLesson?: Lesson;
  nextLesson?: Lesson;
  isExplorerOpen: boolean;
  isLessonsLoading: boolean;
  activeView: WorkspaceView;
  openViews: WorkspaceView[];
  onToggleTheme: () => void;
  onOpenAccount: () => void;
  onOpenExplorer: () => void;
  onOpenView: (view: WorkspaceView) => void;
  onCloseView: (view: WorkspaceView) => void;
  onSetActiveView: (view: WorkspaceView) => void;
  onOpenNextLesson: () => void;
  onLessonCompleted: () => void;
  onRequireAuth: () => void;
}) {
  return (
    <section className="workbench" aria-label="Рабочая область">
      <header className="top-bar">
        {!isExplorerOpen && (
          <button className="icon-button" type="button" onClick={onOpenExplorer} title="Открыть занятия">
            <PanelLeftOpen size={18} />
          </button>
        )}
        <div className="breadcrumbs">
          {activeLesson ? (
            <>
              <span>{activeLesson.module}</span>
              <ChevronRight size={14} />
              <strong>{activeLesson.title}</strong>
            </>
          ) : (
            <strong>{isLessonsLoading ? "Загружаем занятия..." : "В курсе пока нет занятий"}</strong>
          )}
        </div>
        <div className="top-actions">
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          <button className="profile-button" type="button" onClick={onOpenAccount}>
            <User size={17} />
            <span>{user ? user.username : "Войти"}</span>
          </button>
        </div>
      </header>

      <div className="tab-strip" role="tablist" aria-label="Открытые материалы">
        {openViews.map((view) => {
          const { Icon, label } = viewMeta[view];
          const isActive = activeView === view;

          return (
            <div className={`tab ${isActive ? "is-active" : ""}`} key={view}>
              <button className="tab-main" type="button" role="tab" aria-selected={isActive} onClick={() => onSetActiveView(view)}>
                <Icon size={15} />
                <span>{label}</span>
              </button>
              <button className="tab-close" type="button" onClick={() => onCloseView(view)} aria-label={`Закрыть ${label}`}>
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {openViews.length > 0 && activeLesson ? (
        <article className="lesson-stage" key={`${activeLesson.id}:${user?.id ?? "guest"}`}>
          {isLessonUnavailable(activeLesson) ? (
            <LockedLessonView lesson={activeLesson} onRequireAuth={onRequireAuth} isGuest={!user} />
          ) : (
            <>
              {openViews.includes("theory") && (
                <div hidden={activeView !== "theory"}>
                  <LessonNavigationProvider nextLesson={nextLesson} onNextLesson={onOpenNextLesson}>
                    <LearningTheoryView lesson={activeLesson} />
                  </LessonNavigationProvider>
                </div>
              )}
              {openViews.includes("practice") && (
                <div hidden={activeView !== "practice"}>
                  <LearningPracticeView
                    lesson={activeLesson}
                    isAuthenticated={Boolean(user)}
                    onRequireAuth={onRequireAuth}
                    onLessonCompleted={onLessonCompleted}
                    progressOwnerKey={user ? String(user.id) : "guest"}
                  />
                </div>
              )}
            </>
          )}
        </article>
      ) : (
        <div className="empty-workbench">
          <div>
            <span>Все вкладки закрыты</span>
            <h2>Откройте материал, видео или практику</h2>
            <p>Рабочая область останется чистой, пока вы не выберете нужный формат занятия.</p>
            <div className="empty-actions">
              {DEFAULT_OPEN_VIEWS.map((view) => {
                const { Icon, label } = viewMeta[view];
                return (
                  <button className="secondary-action" type="button" onClick={() => onOpenView(view)} key={view}>
                    <Icon size={16} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

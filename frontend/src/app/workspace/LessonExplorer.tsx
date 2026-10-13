import { CheckCircle2, ChevronDown, ChevronRight, Lock, PanelLeftClose, Play } from "lucide-react";
import type { Lesson, Track } from "../../features/learning/types";
import { getLessonAccessLabel, isLessonUnavailable } from "../../features/learning/access";

export function LessonExplorer({
  tracks,
  activeTrackId,
  isTrackMenuOpen,
  progress,
  lessonModules,
  displayLessons,
  activeLessonId,
  openModules,
  isGuest,
  onToggleTrackMenu,
  onSelectTrack,
  onToggleModule,
  onSelectLesson,
  onRequireAuth,
  onCollapse,
  onResizeStart,
}: {
  tracks: Track[];
  activeTrackId: string;
  isTrackMenuOpen: boolean;
  progress: number;
  lessonModules: string[];
  displayLessons: Lesson[];
  activeLessonId: string;
  openModules: Set<string>;
  isGuest: boolean;
  onToggleTrackMenu: () => void;
  onSelectTrack: (trackId: string) => void;
  onToggleModule: (moduleName: string) => void;
  onSelectLesson: (lesson: Lesson) => void;
  onRequireAuth: () => void;
  onCollapse: () => void;
  onResizeStart: (event: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <aside className="explorer-panel" aria-label="Занятия">
      <div className="panel-title">
        <span>Занятия</span>
        <button className="icon-button" type="button" onClick={onCollapse} title="Свернуть">
          <PanelLeftClose size={18} />
        </button>
      </div>
      <div className="track-status">
        <button
          className="track-switch"
          type="button"
          onClick={onToggleTrackMenu}
          aria-expanded={isTrackMenuOpen}
          aria-label="Выбрать трек"
        >
          <span>{tracks.find((track) => track.id === activeTrackId)?.title ?? "Курс"}</span>
          <ChevronDown size={14} className={isTrackMenuOpen ? "is-flipped" : ""} />
        </button>
        <strong>{progress}%</strong>
        <div className="progress-line">
          <i style={{ width: `${progress}%` }} />
        </div>
        {isTrackMenuOpen && (
          <div className="track-menu" role="listbox" aria-label="Треки">
            {tracks.map((track) => {
              const trackProgress = track.lessons_countable
                ? Math.round((track.lessons_completed / track.lessons_countable) * 100)
                : 0;
              return (
                <button
                  key={track.id}
                  type="button"
                  role="option"
                  aria-selected={track.id === activeTrackId}
                  className={track.id === activeTrackId ? "is-active" : ""}
                  onClick={() => onSelectTrack(track.id)}
                >
                  <div>
                    <strong>{track.title}</strong>
                    {track.tagline && <small>{track.tagline}</small>}
                  </div>
                  <span>{trackProgress}%</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <nav className="lesson-tree" aria-label="Модули">
        {lessonModules.map((moduleName) => {
          const isOpen = openModules.has(moduleName);
          const moduleLessons = displayLessons.filter((lesson) => lesson.module === moduleName);

          return (
            <div className="module-group" key={moduleName}>
              <button className="module-toggle" type="button" title={moduleName} onClick={() => onToggleModule(moduleName)}>
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span>{moduleName}</span>
              </button>
              <div className={`module-lessons ${isOpen ? "is-open" : ""}`}>
                {moduleLessons.map((lesson) => {
                  const isUnavailable = isLessonUnavailable(lesson);

                  return (
                    <button
                      className={`lesson-row ${lesson.id === activeLessonId ? "is-active" : ""} ${isUnavailable ? "is-locked" : ""}`}
                      type="button"
                      key={lesson.id}
                      title={lesson.locked_reason || lesson.title}
                      onClick={() => {
                        if (isUnavailable) {
                          if (isGuest) {
                            onRequireAuth();
                          }
                          return;
                        }
                        onSelectLesson(lesson);
                      }}
                    >
                      {isUnavailable ? <Lock size={15} /> : lesson.completed ? <CheckCircle2 size={15} className="lesson-done-icon" /> : <Play size={15} />}
                      <span>{lesson.title}</span>
                      <small>{getLessonAccessLabel(lesson)}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <button className="explorer-resizer" type="button" aria-label="Изменить ширину панели занятий" onPointerDown={onResizeStart} />
    </aside>
  );
}

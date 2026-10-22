import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, ChevronDown, ChevronRight, Lock, PanelLeftClose, Play } from "lucide-react";
import { getLessonAccessLabel, isLessonUnavailable, type Lesson, type Track } from "../../features/learning";

function formatTrackTitle(track: Track) {
  const match = track.title.match(/^(?:Глава\s*)?(\d+)\s*[:.·-]?\s*(.+)$/i);
  const chapterNumber = match?.[1] ?? track.id.match(/chapter[_-]?(\d+)/i)?.[1];
  const chapterTitle = match?.[2]?.trim() ?? track.title.trim();
  return chapterNumber ? `${Number(chapterNumber)}: ${chapterTitle}` : track.title;
}

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
  isAuthenticated,
  hasActiveSubscription,
  onToggleTrackMenu,
  onSelectTrack,
  onToggleModule,
  onSelectLesson,
  onRequireAuth,
  onCollapse,
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
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
  onToggleTrackMenu: () => void;
  onSelectTrack: (trackId: string) => void;
  onToggleModule: (moduleName: string) => void;
  onSelectLesson: (lesson: Lesson) => void;
  onRequireAuth: () => void;
  onCollapse: () => void;
}) {
  const trackStatusRef = useRef<HTMLDivElement>(null);
  const [trackMenuStyle, setTrackMenuStyle] = useState<CSSProperties>();
  const [keepTrackMenu, setKeepTrackMenu] = useState(isTrackMenuOpen);
  useEffect(() => {
    if (isTrackMenuOpen) { setKeepTrackMenu(true); return; }
    const timer = window.setTimeout(() => setKeepTrackMenu(false), 140);
    return () => window.clearTimeout(timer);
  }, [isTrackMenuOpen]);

  useLayoutEffect(() => {
    if (!isTrackMenuOpen) return;

    const updatePosition = () => {
      const anchor = trackStatusRef.current?.getBoundingClientRect();
      if (!anchor) return;

      const margin = 12;
      const width = Math.min(anchor.width, window.innerWidth - margin * 2);
      const left = Math.min(Math.max(margin, anchor.left), window.innerWidth - width - margin);
      const preferredTop = anchor.bottom + 8;
      const maxHeight = Math.min(672, Math.max(120, window.innerHeight - preferredTop - margin));
      const top = Math.min(preferredTop, window.innerHeight - maxHeight - margin);
      setTrackMenuStyle({ top, left, width, maxHeight });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    const resizeObserver = new ResizeObserver(updatePosition);
    if (trackStatusRef.current) resizeObserver.observe(trackStatusRef.current);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      resizeObserver.disconnect();
    };
  }, [isTrackMenuOpen]);

  return (
    <aside className="explorer-panel" aria-label="Занятия">
      <div className="track-status" ref={trackStatusRef}>
        <div className="track-status__header">
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
          <button className="icon-button" type="button" onClick={onCollapse} title="Свернуть список занятий" aria-label="Свернуть список занятий">
            <PanelLeftClose size={18} />
          </button>
        </div>
        <strong>{progress}%</strong>
        <div className="progress-line">
          <i style={{ width: `${progress}%` }} />
        </div>
        {(isTrackMenuOpen || keepTrackMenu) && trackMenuStyle && createPortal(
          <div className={`track-menu track-menu--overlay${isTrackMenuOpen ? "" : " is-closing"}`} aria-hidden={!isTrackMenuOpen} style={trackMenuStyle} role="dialog" aria-label="Выбор программы обучения">
            <div className="track-menu__header">
              <strong>Учебные программы</strong>
              <span>Выберите главу</span>
            </div>
            <div className="track-menu__list" role="listbox" aria-label="Курсы">
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
                      <strong>{formatTrackTitle(track)}</strong>
                    </div>
                    <span>{trackProgress}%</span>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
      </div>
      <nav className="lesson-tree" aria-label="Модули">
        {lessonModules.map((moduleName) => {
          const isOpen = openModules.has(moduleName);
          const moduleLessons = displayLessons.filter((lesson) => lesson.module === moduleName);

          return (
            <div className="module-group" key={moduleName}>
              <button className="module-toggle" type="button" aria-expanded={isOpen} title={moduleName} onClick={() => onToggleModule(moduleName)}>
                <ChevronRight size={16} />
                <span>{moduleName}</span>
              </button>
              <div className={`module-lessons ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}><div className="module-lessons__inner">
                {moduleLessons.map((lesson) => {
                  const isUnavailable = isLessonUnavailable(lesson);
                  const accessLabel = getLessonAccessLabel(lesson, isAuthenticated, hasActiveSubscription);

                  return (
                    <button
                      className={`lesson-row ${lesson.id === activeLessonId ? "is-active" : ""} ${lesson.completed && !isUnavailable ? "is-completed" : ""} ${isUnavailable ? "is-locked" : ""}`}
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
                      {accessLabel && <small>{accessLabel}</small>}
                    </button>
                  );
                })}
              </div></div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

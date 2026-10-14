import "./progress.css";
import React, { useEffect, useState } from "react";
import { BookOpen, CalendarClock, CalendarPlus, CheckCircle2, ChevronDown, ChevronRight, Clock, Code2, FileText, Lock, LogOut, PanelLeftClose, PanelLeftOpen, Play, Moon, Search, ShieldCheck, Sun, Terminal, Trash2, User, X } from "lucide-react";
import { getDisplayModule } from "../../learning/course";
import { ADMIN_LEVEL_LABELS, ADMIN_LEVELS } from "../../../shared/api/contracts";
import type { AdminProgressTrack } from "../../../shared/api/contracts";

export function AdminLearningProgress({ progress }: { progress: AdminProgressTrack[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (progress.length === 0) {
      return;
    }
    setExpanded((current) => {
      if (current.size > 0) {
        return current;
      }
      const firstTrack = progress[0];
      const firstModule = firstTrack.modules[0];
      return new Set([firstTrack.id, firstModule?.id].filter((key): key is string => Boolean(key)));
    });
  }, [progress]);

  function toggle(key: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const completed = progress.reduce((sum, track) => sum + track.completed, 0);
  const total = progress.reduce((sum, track) => sum + track.total, 0);
  const levelStats = ADMIN_LEVELS.map((level) => {
    let levelTotal = 0;
    let levelCompleted = 0;
    progress.forEach((track) => {
      track.modules.forEach((module) => {
        module.lessons.forEach((lesson) => {
          lesson.tasks.forEach((task) => {
            if (task.level === level) {
              levelTotal += 1;
              if (task.completed) {
                levelCompleted += 1;
              }
            }
          });
        });
      });
    });
    return { level, total: levelTotal, completed: levelCompleted };
  });

  return (
    <section className="profile-learning-progress" aria-label="Пройденный материал">
      <div className="profile-learning-progress-head">
        <div>
          <span>Материал и уровни</span>
          <strong>{total > 0 ? `${completed} из ${total} уроков` : "Отметок пока нет"}</strong>
        </div>
        <BookOpen size={17} aria-hidden="true" />
      </div>

      {levelStats.some((item) => item.total > 0) && (
        <div className="admin-progress-levels" aria-label="Прогресс по уровням заданий">
          {levelStats.map((item) => (
            <span className={`admin-progress-level admin-progress-level--${item.level}`} key={item.level}>
              <i aria-hidden="true" />
              <strong>{ADMIN_LEVEL_LABELS[item.level]}</strong>
              <small>{item.completed}/{item.total}</small>
            </span>
          ))}
        </div>
      )}

      {progress.length === 0 ? (
        <p className="admin-note">Учебные материалы не найдены.</p>
      ) : (
        <div className="admin-progress-tree">
          {progress.map((track) => {
            const trackExpanded = expanded.has(track.id);
            return (
              <div className="admin-progress-track" key={track.id}>
                <button
                  className={`admin-progress-toggle admin-progress-track-toggle ${trackExpanded ? "is-expanded" : ""}`}
                  type="button"
                  aria-expanded={trackExpanded}
                  onClick={() => toggle(track.id)}
                >
                  <ChevronRight size={15} aria-hidden="true" />
                  <span className="admin-progress-toggle-copy">
                    <strong>{track.title}</strong>
                    <small>{track.lessons_total} уроков</small>
                  </span>
                  <span className="admin-progress-count">{track.total > 0 ? `${track.completed}/${track.total}` : "нет отметок"}</span>
                </button>

                {trackExpanded && (
                  <div className="admin-progress-modules">
                    {track.modules.map((module) => {
                      const moduleExpanded = expanded.has(module.id);
                      return (
                        <div className="admin-progress-module" key={module.id}>
                          <button
                            className={`admin-progress-toggle admin-progress-module-toggle ${moduleExpanded ? "is-expanded" : ""}`}
                            type="button"
                            aria-expanded={moduleExpanded}
                            onClick={() => toggle(module.id)}
                          >
                            <ChevronRight size={14} aria-hidden="true" />
                            <span className="admin-progress-toggle-copy">
                              <strong>{module.title}</strong>
                              <small>{module.lessons_total} уроков</small>
                            </span>
                            <span className="admin-progress-count">{module.total > 0 ? `${module.completed}/${module.total}` : "нет отметок"}</span>
                          </button>

                          {moduleExpanded && (
                            <div className="admin-progress-lessons">
                              {module.lessons.map((lesson) => {
                                const lessonKey = `${module.id}:${lesson.id}`;
                                const lessonExpanded = expanded.has(lessonKey);
                                const completedTasks = lesson.tasks.filter((task) => task.completed).length;
                                const lessonMeta = lesson.countable
                                  ? `${completedTasks} из ${lesson.tasks.length} заданий`
                                  : "без отметки";
                                return (
                                  <div className="admin-progress-lesson" key={lesson.id}>
                                    <button
                                      className={`admin-progress-toggle admin-progress-lesson-toggle ${lessonExpanded ? "is-expanded" : ""}`}
                                      type="button"
                                      aria-expanded={lessonExpanded}
                                      onClick={() => toggle(lessonKey)}
                                    >
                                      <ChevronRight size={13} aria-hidden="true" />
                                      <span className={`admin-progress-status ${lesson.completed ? "is-done" : lesson.countable ? "is-pending" : "is-neutral"}`} aria-hidden="true" />
                                      <span className="admin-progress-toggle-copy">
                                        <strong>{lesson.title}</strong>
                                        <small>{lessonMeta}</small>
                                      </span>
                                    </button>

                                    {lessonExpanded && lesson.tasks.length > 0 && (
                                      <div className="admin-progress-tasks">
                                        {lesson.tasks.map((task) => (
                                          <div className="admin-progress-task" key={task.id}>
                                            {task.completed ? (
                                              <CheckCircle2 size={13} className="is-done" aria-hidden="true" />
                                            ) : (
                                              <span className="admin-progress-task-dot" aria-hidden="true" />
                                            )}
                                            <span className="admin-progress-task-title">{task.title}</span>
                                            <span className={`admin-progress-task-level ${task.level ? `is-${task.level}` : "is-manual"}`}>
                                              {task.level ? ADMIN_LEVEL_LABELS[task.level] : "Самопроверка"}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

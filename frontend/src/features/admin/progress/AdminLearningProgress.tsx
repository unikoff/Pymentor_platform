import "../../account/account-tabs.css";
import "./progress.css";
import { Check, CheckCircle2, ChevronDown } from "lucide-react";
import { ADMIN_LEVEL_LABELS } from "../../../shared/api/contracts";
import type { AdminProgressTrack } from "../../../shared/api/contracts";

function getProgressPercent(completed: number, total: number) {
  return total > 0 ? Math.max(0, Math.min(100, Math.round((completed / total) * 100))) : 0;
}

export function AdminLearningProgress({ progress }: { progress: AdminProgressTrack[] }) {
  return (
    <section className="account-surface account-detail-card account-course-progress-card admin-learning-progress"
      aria-label="Прогресс по направлениям">
      <header>
        <div>
          <h3>Прогресс по направлениям</h3>
          <p>Выполненные уроки в каждом курсе</p>
        </div>
      </header>

      {progress.length ? (
        <div className="account-course-list">
          {progress.map((track) => {
            const trackPercent = getProgressPercent(track.completed, track.total);
            return (
              <details className="account-course-accordion" key={track.id}>
                <summary>
                  <span className="account-course-accordion__heading">
                    <strong>{track.title}</strong>
                    <span>{track.completed} / {track.total}</span>
                  </span>
                  <ChevronDown className="account-course-accordion__chevron" size={18} aria-hidden="true" />
                  <span className="account-progress-track" role="progressbar" aria-label={`Прогресс: ${track.title}`}
                    aria-valuemin={0} aria-valuemax={Math.max(1, track.total)}
                    aria-valuenow={Math.max(0, Math.min(track.completed, track.total))}>
                    <span style={{ width: `${trackPercent}%` }} />
                  </span>
                </summary>

                {track.modules.length ? (
                  <div className="account-course-accordion__blocks">
                    {track.modules.map((module) => {
                      const modulePercent = getProgressPercent(module.completed, module.total);
                      return (
                        <details className="account-course-block" key={module.id}>
                          <summary>
                            <span className="account-course-block__heading">
                              <strong>{module.title}</strong>
                              <span>{module.completed} / {module.total}</span>
                            </span>
                            <ChevronDown className="account-course-block__chevron" size={16} aria-hidden="true" />
                            <span className="account-progress-track" role="progressbar"
                              aria-label={`Прогресс блока ${module.title} в курсе ${track.title}`}
                              aria-valuemin={0} aria-valuemax={Math.max(1, module.total)}
                              aria-valuenow={Math.max(0, Math.min(module.completed, module.total))}>
                              <span style={{ width: `${modulePercent}%` }} />
                            </span>
                          </summary>

                          {module.lessons.length ? (
                            <ul className="account-course-block__lessons">
                              {module.lessons.map((lesson) => {
                                const completedTasks = lesson.tasks.filter((task) => task.completed).length;
                                const lessonMeta = lesson.countable
                                  ? lesson.completed ? "Выполнено" : `${completedTasks} из ${lesson.tasks.length} заданий`
                                  : "Без отметки";
                                const lessonContent = (
                                  <>
                                    <span className={`account-course-lesson__mark ${lesson.completed ? "is-complete" : ""}`} aria-hidden="true">
                                      {lesson.completed && <Check size={12} strokeWidth={2.7} />}
                                    </span>
                                    <span className="account-course-lesson__title">{lesson.title}</span>
                                    <span className={`account-course-lesson__status ${lesson.completed ? "is-complete" : ""}`}>
                                      {lessonMeta}
                                    </span>
                                  </>
                                );

                                return (
                                  <li className={lesson.tasks.length ? "admin-progress-lesson" : "account-course-lesson"} key={lesson.id}>
                                    {lesson.tasks.length ? (
                                      <details>
                                        <summary className="admin-progress-lesson__summary">
                                          {lessonContent}
                                          <ChevronDown className="admin-progress-lesson__chevron" size={14} aria-hidden="true" />
                                        </summary>
                                        <div className="admin-progress-tasks" aria-label={`Задания урока: ${lesson.title}`}>
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
                                      </details>
                                    ) : lessonContent}
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="account-course-block__empty">В этом модуле уроков пока нет.</p>
                          )}
                        </details>
                      );
                    })}
                  </div>
                ) : (
                  <p className="account-course-accordion__empty">В этом направлении модулей пока нет.</p>
                )}
              </details>
            );
          })}
        </div>
      ) : (
        <p className="account-course-accordion__empty">Учебные материалы не найдены.</p>
      )}
    </section>
  );
}

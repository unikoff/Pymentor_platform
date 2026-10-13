import { useEffect, useState } from "react";
import {
  BookOpen, CalendarClock, CalendarPlus, CheckCircle2, ChevronDown, ChevronRight, Clock,
  Code2, FileText, Lock, LogOut, PanelLeftClose, PanelLeftOpen, Play, Moon, Search,
  ShieldCheck, Sun, Terminal, Trash2, User, X,
} from "lucide-react";
import { completeLesson } from "../api";
import { formatManualPracticeResult, renderPracticeText } from "./text-format";
import type { Lesson } from "../types";

function readStoredStringSet(key: string, signature: string): Set<string> {
  try {
    const value = window.localStorage.getItem(key);
    const parsed: unknown = value ? JSON.parse(value) : null;
    if (
      typeof parsed === "object" && parsed !== null &&
      "signature" in parsed && parsed.signature === signature &&
      "checked" in parsed && Array.isArray(parsed.checked) &&
      parsed.checked.every((item) => typeof item === "string")
    ) {
      return new Set(parsed.checked);
    }
    return new Set();
  } catch {
    return new Set();
  }
}

export function readStoredString(key: string, fallback: string): string {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function SelfCheckPanel({
  lesson,
  isAuthenticated,
  onRequireAuth,
  onLessonCompleted,
  progressOwnerKey,
  requiredTasksComplete = true,
  requiredTaskCount = 0,
  completedTaskCount = 0,
}: {
  lesson: Lesson;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onLessonCompleted: () => void;
  progressOwnerKey: string;
  requiredTasksComplete?: boolean;
  requiredTaskCount?: number;
  completedTaskCount?: number;
}) {
  const manualPractice = lesson.manual_practice ?? [];
  const manualPracticeSignature = JSON.stringify(manualPractice) ?? "";
  const progressStorageKey = `pymentor:manual-progress:${progressOwnerKey}:${lesson.id}`;
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(
    () => readStoredStringSet(progressStorageKey, manualPracticeSignature),
  );
  const [openTaskPanels, setOpenTaskPanels] = useState<Record<string, "hint" | "answer" | undefined>>({});
  const [activeTaskIndexes, setActiveTaskIndexes] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCheckedSteps(readStoredStringSet(progressStorageKey, manualPracticeSignature));
  }, [manualPracticeSignature, progressStorageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        progressStorageKey,
        JSON.stringify({ signature: manualPracticeSignature, checked: Array.from(checkedSteps) }),
      );
    } catch {
      // Сохранение локальных отметок необязательно, если хранилище недоступно.
    }
  }, [checkedSteps, manualPracticeSignature, progressStorageKey]);

  const totalStepCount = manualPractice.reduce(
    (total, exercise) => total + (exercise.tasks?.length ?? exercise.steps?.length ?? 0),
    0,
  );
  const checkedStepCount = checkedSteps.size;
  const isManualPracticeComplete = totalStepCount === 0 || checkedStepCount === totalStepCount;
  const isPracticeComplete = isManualPracticeComplete && requiredTasksComplete;

  function toggleStep(stepId: string) {
    setCheckedSteps((current) => {
      const next = new Set(current);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }

  function toggleTaskPanel(taskId: string, panel: "hint" | "answer") {
    setOpenTaskPanels((current) => ({
      ...current,
      [taskId]: current[taskId] === panel ? undefined : panel,
    }));
  }

  function switchPracticeTask(exerciseId: string, currentIndex: number, direction: -1 | 1, taskCount: number) {
    const nextIndex = Math.max(0, Math.min(taskCount - 1, currentIndex + direction));
    setActiveTaskIndexes((current) => ({ ...current, [exerciseId]: nextIndex }));
  }

  async function markCompleted() {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    if (!isPracticeComplete) {
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await completeLesson(lesson.id);
      onLessonCompleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить отметку");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {manualPractice.length > 0 && (
        <section className="manual-practice-list" aria-label="Практические задания урока">
          {manualPractice.map((exercise, exerciseIndex) => {
            const exerciseId = [lesson.id, exerciseIndex].join(":");
            const taskCount = exercise.tasks?.length ?? 0;
            const activeTaskIndex = taskCount > 0
              ? Math.min(activeTaskIndexes[exerciseId] ?? 0, taskCount - 1)
              : 0;
            const practiceTask = exercise.tasks?.[activeTaskIndex];

            return (
              <article className="manual-practice-card" key={`${lesson.id}-${exercise.title}`}>
              <div className="manual-practice-card__head">
                <span>Практика {exerciseIndex + 1}</span>
                <h2>{renderPracticeText(exercise.title)}</h2>
              </div>
              <div className="manual-practice-card__task">{renderPracticeText(exercise.task)}</div>
              {practiceTask && (
                <div className="manual-practice-task-list">
                  {(() => {
                    const taskId = [lesson.id, exerciseIndex, activeTaskIndex].join(":");
                    const isDone = checkedSteps.has(taskId) || lesson.completed === true;
                    const activePanel = openTaskPanels[taskId];

                    return (
                      <article className={["manual-practice-task", isDone ? "is-done" : ""].filter(Boolean).join(" ")} key={taskId}>
                        <div className="manual-practice-task__toolbar">
                          <span>Задача {activeTaskIndex + 1} из {taskCount}</span>
                          <div className="practice-task-navigation" aria-label="Переключение задач">
                            <button
                              className="practice-task-navigation__button"
                              type="button"
                              disabled={activeTaskIndex === 0}
                              onClick={() => switchPracticeTask(exerciseId, activeTaskIndex, -1, taskCount)}
                            >
                              Назад
                            </button>
                            <button
                              className="practice-task-navigation__button practice-task-navigation__button--next"
                              type="button"
                              disabled={activeTaskIndex === taskCount - 1}
                              onClick={() => switchPracticeTask(exerciseId, activeTaskIndex, 1, taskCount)}
                            >
                              Следующая
                            </button>
                          </div>
                        </div>

                        <div className="manual-practice-task__head">
                          <h3>{renderPracticeText(practiceTask.title)}</h3>
                        </div>
                        <div className="manual-practice-task__summary">
                          {renderPracticeText(practiceTask.task)}
                        </div>

                        <section className="manual-practice-task__requirements" aria-label={"Техническое задание: " + practiceTask.title}>
                          <h4>Техническое задание</h4>
                          <ol>
                            {practiceTask.requirements.map((requirement) => (
                              <li key={requirement}>{renderPracticeText(requirement)}</li>
                            ))}
                          </ol>
                        </section>

                        <div className="manual-practice-task__actions">
                          <button
                            className={["manual-practice-task__action", activePanel === "answer" ? "is-active" : ""].filter(Boolean).join(" ")}
                            type="button"
                            aria-pressed={activePanel === "answer"}
                            onClick={() => toggleTaskPanel(taskId, "answer")}
                          >
                            Ответ
                          </button>
                          <button
                            className={["manual-practice-task__action", activePanel === "hint" ? "is-active" : ""].filter(Boolean).join(" ")}
                            type="button"
                            aria-pressed={activePanel === "hint"}
                            onClick={() => toggleTaskPanel(taskId, "hint")}
                          >
                            Подсказка
                          </button>
                          <button
                            className={["manual-practice-task__action", "manual-practice-task__done", isDone ? "is-done" : ""].filter(Boolean).join(" ")}
                            type="button"
                            aria-pressed={isDone}
                            disabled={lesson.completed}
                            onClick={() => toggleStep(taskId)}
                          >
                            {lesson.completed ? "Задача выполнена" : isDone ? "Снять отметку" : "Отметить готовым"}
                          </button>
                        </div>

                        {activePanel === "hint" && (
                          <aside className="manual-practice-task__panel manual-practice-task__panel--hint">
                            <strong>Подсказка</strong>
                            <div className="manual-practice-task__text">
                              {renderPracticeText(practiceTask.hint)}
                            </div>
                          </aside>
                        )}

                        {activePanel === "answer" && (
                          <aside className="manual-practice-task__panel manual-practice-task__panel--answer">
                            <strong>Разбор решения</strong>
                            <div className="manual-practice-task__text">
                              {renderPracticeText(practiceTask.answer.explanation)}
                            </div>
                            <ol>
                              {practiceTask.answer.steps.map((step) => (
                                <li key={step}>{renderPracticeText(step)}</li>
                              ))}
                            </ol>
                            {practiceTask.answer.code && (
                              <pre className="manual-practice-task__code">
                                <code>{practiceTask.answer.code}</code>
                              </pre>
                            )}
                            {practiceTask.answer.checks && practiceTask.answer.checks.length > 0 && (
                              <div className="manual-practice-task__checks">
                                <strong>Самопроверка</strong>
                                <ul>
                                  {practiceTask.answer.checks.map((check) => (
                                    <li key={check}>{renderPracticeText(check)}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </aside>
                        )}
                      </article>
                    );
                  })()}
                </div>
              )}

              {(!exercise.tasks || exercise.tasks.length === 0) && (
                <div className="manual-practice-steps">
                  {(exercise.steps ?? []).map((step, stepIndex) => {
                    const stepId = `${lesson.id}:${exerciseIndex}:${stepIndex}`;
                    const stepTextId = `${stepId}:text`;
                    return (
                      <div
                        className="manual-practice-step"
                        key={stepId}
                        onClick={(event) => {
                          if (event.target instanceof HTMLElement && event.target.closest("input, label")) {
                            return;
                          }
                          if (!lesson.completed) toggleStep(stepId);
                        }}
                      >
                        <input
                          id={stepId}
                          type="checkbox"
                          aria-labelledby={stepTextId}
                          checked={checkedSteps.has(stepId) || lesson.completed === true}
                          disabled={lesson.completed}
                          onChange={() => toggleStep(stepId)}
                        />
                        <div className="manual-practice-step__text" id={stepTextId}>
                          <label htmlFor={stepId}><strong>Шаг {stepIndex + 1}.</strong></label>{" "}
                          {renderPracticeText(step)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="manual-practice-card__result">
                <strong>Готово, если:</strong>{" "}
                {renderPracticeText(formatManualPracticeResult(exercise.result))}
              </div>
              </article>
            );
          })}
        </section>
      )}

      {!lesson.completed && (
        <section className="self-check-card self-check-card--complete">
          <div>
            <h2>Зафиксируем результат</h2>
            <p>
              {requiredTaskCount > 0
                ? `Редакторские задания: ${completedTaskCount} из ${requiredTaskCount}. Ручные шаги: ${checkedStepCount} из ${totalStepCount}.`
                : totalStepCount > 0
                  ? `Отмечено шагов: ${checkedStepCount} из ${totalStepCount}.`
                  : "После самостоятельной практики отметим занятие выполненным."}
            </p>
            {error && <div className="form-error">{error}</div>}
          </div>
          <button
            className="primary-action"
            type="button"
            onClick={markCompleted}
            disabled={isSaving || (isAuthenticated && !isPracticeComplete)}
          >
            <CheckCircle2 size={17} />
            {isSaving
              ? "Сохраняем..."
              : !isAuthenticated
                ? "Войти и отметить"
                : !requiredTasksComplete
                  ? "Сначала решим задания в редакторе"
                  : isPracticeComplete
                    ? "Задание выполнено"
                    : "Сначала отметим все ручные шаги"}
          </button>
        </section>
      )}
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Lightbulb } from "lucide-react";
import { completeLesson, getManualPracticeAnswer } from "../api";
import { formatManualPracticeResult, renderPracticeText } from "./text-format";
import { usePracticeState } from "./session";
import { useContentSwitch, focusTaskNavigation } from "./useContentSwitch";
import { readStoredString, writeStoredValue } from "../../../shared/lib/storage";
import type { Lesson, ManualPracticeTaskAnswer } from "../types";

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
  const manualListRef = useRef<HTMLElement>(null);
  const pendingAnswers = useRef(new Set<string>());
  const switchContent = useContentSwitch();
  const pendingFocus = useRef(new Map<string, "next" | "previous">());
  const manualPractice = lesson.manual_practice ?? [];
  const manualPracticeSignature = JSON.stringify(manualPractice) ?? "";
  const progressStorageKey = `pymentor:manual-progress:${progressOwnerKey}:${lesson.id}`;
  const sessionKey = `${progressStorageKey}:${manualPracticeSignature}`;
  const [checkedSteps, setCheckedSteps] = usePracticeState<Set<string>>(`${sessionKey}:checked`,
    () => readStoredStringSet(progressStorageKey, manualPracticeSignature),
  );
  const [openTaskPanels, setOpenTaskPanels] = usePracticeState<Record<string, "hint" | "answer" | undefined>>(`${sessionKey}:panels`, () => ({}));
  const [manualAnswers, setManualAnswers] = useState<Record<string, ManualPracticeTaskAnswer>>({});
  const [loadingAnswer, setLoadingAnswer] = useState<string | null>(null);
  const [answerErrors, setAnswerErrors] = useState<Record<string, string>>({});
  const [activeTaskIndexes, setActiveTaskIndexes] = usePracticeState<Record<string, number>>(`${sessionKey}:tasks`, () => ({}));
  const [isSaving, setIsSaving] = usePracticeState(`${sessionKey}:saving`, () => false);
  const [error, setError] = usePracticeState(`${sessionKey}:error`, () => "");
  const completionAttemptKey = useRef("");
  const [completionRetry, setCompletionRetry] = useState(0);

  useEffect(() => {
    setCheckedSteps(readStoredStringSet(progressStorageKey, manualPracticeSignature));
  }, [manualPracticeSignature, progressStorageKey]);

  useEffect(() => {
    writeStoredValue(progressStorageKey, JSON.stringify({ signature: manualPracticeSignature, checked: Array.from(checkedSteps) }));
  }, [checkedSteps, manualPracticeSignature, progressStorageKey]);

  const totalStepCount = manualPractice.reduce(
    (total, exercise) => total + (exercise.tasks?.length ?? exercise.steps?.length ?? 0),
    0,
  );
  const checkedStepCount = checkedSteps.size;
  const isManualPracticeComplete = totalStepCount === 0 || checkedStepCount === totalStepCount;
  const isPracticeComplete = isManualPracticeComplete && requiredTasksComplete;
  const trackedItemCount = totalStepCount + requiredTaskCount;
  const completedItemCount = checkedStepCount + completedTaskCount;
  const completionPercent = trackedItemCount > 0
    ? Math.min(100, Math.round(completedItemCount / trackedItemCount * 100))
    : 0;

  useEffect(() => {
    if (
      trackedItemCount === 0 || !isAuthenticated || !isPracticeComplete || lesson.completed || isSaving
    ) {
      return;
    }

    const attemptKey = `${sessionKey}:${completionRetry}`;
    if (completionAttemptKey.current === attemptKey) {
      return;
    }
    completionAttemptKey.current = attemptKey;
    setIsSaving(true);
    setError("");

    void completeLesson(lesson.id)
      .then(() => onLessonCompleted())
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Не удалось сохранить выполнение занятия");
      })
      .finally(() => setIsSaving(false));
  }, [
    completionRetry,
    isAuthenticated,
    isPracticeComplete,
    isSaving,
    lesson.completed,
    lesson.id,
    onLessonCompleted,
    sessionKey,
    setError,
    setIsSaving,
    trackedItemCount,
  ]);

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

  async function loadManualAnswer(taskId: string, exerciseIndex: number, taskIndex: number) {
    if (manualAnswers[taskId] || pendingAnswers.current.has(taskId)) return;
    pendingAnswers.current.add(taskId);
    setLoadingAnswer(taskId);
    setAnswerErrors((current) => ({ ...current, [taskId]: "" }));
    try {
      const response = await getManualPracticeAnswer(lesson.id, exerciseIndex, taskIndex);
      setManualAnswers((current) => ({ ...current, [taskId]: response.answer }));
    } catch (err: unknown) {
      setAnswerErrors((current) => ({
        ...current,
        [taskId]: err instanceof Error ? err.message : "Не удалось загрузить разбор решения",
      }));
    } finally {
      pendingAnswers.current.delete(taskId);
      setLoadingAnswer((current) => current === taskId ? null : current);
    }
  }

  function toggleTaskPanel(
    taskId: string,
    panel: "hint" | "answer",
    exerciseIndex?: number,
    taskIndex?: number,
    hasInlineAnswer = false,
  ) {
    setOpenTaskPanels((current) => ({
      ...current,
      [taskId]: current[taskId] === panel ? undefined : panel,
    }));
    if (
      panel === "answer" && !hasInlineAnswer && !manualAnswers[taskId] &&
      exerciseIndex !== undefined && taskIndex !== undefined
    ) {
      void loadManualAnswer(taskId, exerciseIndex, taskIndex);
    }
  }

  useEffect(() => {
    manualPractice.forEach((exercise, exerciseIndex) => {
      exercise.tasks?.forEach((task, taskIndex) => {
        const taskId = [lesson.id, exerciseIndex, taskIndex].join(":");
        if (openTaskPanels[taskId] === "answer" && !task.answer && !manualAnswers[taskId]) {
          void loadManualAnswer(taskId, exerciseIndex, taskIndex);
        }
      });
    });
  }, [lesson.id, manualPractice, manualAnswers, openTaskPanels]);

  useEffect(() => {
    pendingFocus.current.forEach((direction, exerciseId) => {
      const card = Array.from(manualListRef.current?.querySelectorAll<HTMLElement>("[data-exercise-id]") ?? [])
        .find((element) => element.dataset.exerciseId === exerciseId);
      focusTaskNavigation(card, direction);
    });
    pendingFocus.current.clear();
  }, [activeTaskIndexes]);

  function switchPracticeTask(exerciseId: string, currentIndex: number, direction: -1 | 1, taskCount: number, element: HTMLElement | null) {
    const nextIndex = Math.max(0, Math.min(taskCount - 1, currentIndex + direction));
    if (nextIndex === currentIndex) return;
    switchContent(exerciseId, element?.closest<HTMLElement>(".manual-practice-task-list") ?? null, () => {
      pendingFocus.current.set(exerciseId, direction === 1 ? "next" : "previous");
      setActiveTaskIndexes((current) => ({ ...current, [exerciseId]: nextIndex }));
    });
  }

  async function markCompleted() {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    if (trackedItemCount > 0 || !isPracticeComplete) {
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
        <section ref={manualListRef} className="manual-practice-list" aria-label="Практические задания урока">
          {manualPractice.map((exercise, exerciseIndex) => {
            const exerciseId = [lesson.id, exerciseIndex].join(":");
            const taskCount = exercise.tasks?.length ?? 0;
            const activeTaskIndex = taskCount > 0
              ? Math.min(activeTaskIndexes[exerciseId] ?? 0, taskCount - 1)
              : 0;
            const practiceTask = exercise.tasks?.[activeTaskIndex];

            return (
              <article className="manual-practice-card" data-exercise-id={exerciseId} key={`${lesson.id}-${exercise.title}`}>
              <header className="manual-practice-card__head">
                <h2>{renderPracticeText(exercise.title)}</h2>
              </header>
              <section className="manual-practice-card__context" aria-label="Контекст занятия">
                <span className="manual-practice-section-label">Контекст</span>
                <p>{renderPracticeText(exercise.task)}</p>
              </section>
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
                              onClick={(event) => switchPracticeTask(exerciseId, activeTaskIndex, -1, taskCount, event.currentTarget.closest<HTMLElement>(".manual-practice-task"))}
                              aria-label="Предыдущая задача"
                              title="Предыдущая задача"
                            >
                              <ArrowLeft size={16} strokeWidth={1.9} aria-hidden="true" />
                            </button>
                            <button
                              className="practice-task-navigation__button practice-task-navigation__button--next"
                              type="button"
                              disabled={activeTaskIndex === taskCount - 1}
                              onClick={(event) => switchPracticeTask(exerciseId, activeTaskIndex, 1, taskCount, event.currentTarget.closest<HTMLElement>(".manual-practice-task"))}
                              aria-label="Следующая задача"
                              title="Следующая задача"
                            >
                              <ArrowRight size={16} strokeWidth={1.9} aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        <div className="manual-practice-task__head">
                          <h3>{renderPracticeText(practiceTask.title)}</h3>
                        </div>
                        <div className="manual-practice-task__sections">
                          <section className="manual-practice-task__summary-section" aria-label="Условие задачи">
                            <span className="manual-practice-section-label">Условие</span>
                            <p className="manual-practice-task__summary">
                              {renderPracticeText(practiceTask.task)}
                            </p>
                          </section>

                          <section className="manual-practice-task__requirements" aria-label={"Техническое задание: " + practiceTask.title}>
                            <h4>Техническое задание</h4>
                            <ol>
                              {practiceTask.requirements.map((requirement) => (
                                <li key={requirement}>{renderPracticeText(requirement)}</li>
                              ))}
                            </ol>
                          </section>

                          <section className="manual-practice-task__criterion" aria-label="Критерий готовности">
                            <CheckCircle2 size={17} aria-hidden="true" />
                            <div>
                              <strong>Критерий готовности</strong>
                              <p>{renderPracticeText(formatManualPracticeResult(practiceTask.result ?? exercise.result))}</p>
                            </div>
                          </section>
                        </div>

                        <div className="manual-practice-task__actions">
                          <button
                            className={["manual-practice-task__action", activePanel === "hint" ? "is-active" : ""].filter(Boolean).join(" ")}
                            type="button"
                            aria-pressed={activePanel === "hint"}
                            onClick={() => toggleTaskPanel(taskId, "hint")}
                          >
                            <Lightbulb size={16} />
                            Подсказка
                          </button>
                          <button
                            className={["manual-practice-task__action", activePanel === "answer" ? "is-active" : ""].filter(Boolean).join(" ")}
                            type="button"
                            aria-pressed={activePanel === "answer"}
                            onClick={() => toggleTaskPanel(taskId, "answer", exerciseIndex, activeTaskIndex, Boolean(practiceTask.answer))}
                          >
                            <BookOpen size={16} />
                            Разбор
                          </button>
                          <button
                            className={["manual-practice-task__action", "manual-practice-task__done", isDone ? "is-done" : ""].filter(Boolean).join(" ")}
                            type="button"
                            aria-pressed={isDone}
                            disabled={lesson.completed || isSaving}
                            onClick={() => toggleStep(taskId)}
                          >
                            <CheckCircle2 size={16} />
                            {lesson.completed ? "Выполнено" : isDone ? "Снять отметку" : "Отметить шаг"}
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
                            {(() => {
                              const answer = practiceTask.answer ?? manualAnswers[taskId];
                              if (!answer) {
                                return <p role="status">{loadingAnswer === taskId ? "Загружаем разбор…" : answerErrors[taskId] || "Разбор пока не загружен."}</p>;
                              }
                              return <>
                                <strong>Разбор решения</strong>
                                <div className="manual-practice-task__text">
                                  {renderPracticeText(answer.explanation)}
                                </div>
                                <ol>
                                  {answer.steps.map((step) => (
                                    <li key={step}>{renderPracticeText(step)}</li>
                                  ))}
                                </ol>
                                {answer.code && (
                                  <pre className="manual-practice-task__code">
                                    <code>{answer.code}</code>
                                  </pre>
                                )}
                                {answer.checks && answer.checks.length > 0 && (
                                  <div className="manual-practice-task__checks">
                                    <strong>Самопроверка</strong>
                                    <ul>
                                      {answer.checks.map((check) => (
                                        <li key={check}>{renderPracticeText(check)}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </>;
                            })()}
                          </aside>
                        )}
                      </article>
                    );
                  })()}
                </div>
              )}

              {(!exercise.tasks || exercise.tasks.length === 0) && (
                <>
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
                            if (!lesson.completed && !isSaving) toggleStep(stepId);
                          }}
                        >
                          <input
                            id={stepId}
                            type="checkbox"
                            aria-labelledby={stepTextId}
                            checked={checkedSteps.has(stepId) || lesson.completed === true}
                            disabled={lesson.completed || isSaving}
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
                  <section className="manual-practice-card__result" aria-label="Критерий готовности">
                    <CheckCircle2 size={17} aria-hidden="true" />
                    <div>
                      <strong>Критерий готовности</strong>
                      <p>{renderPracticeText(formatManualPracticeResult(exercise.result))}</p>
                    </div>
                  </section>
                </>
              )}
              </article>
            );
          })}
        </section>
      )}

      {!lesson.completed && trackedItemCount > 0 && (
        <div className="self-check-status" aria-live="polite">
          <div className="self-check-status__summary">
            <CheckCircle2 size={17} aria-hidden="true" />
            <span>
              {isSaving
                ? "Все задания выполнены — сохраняем результат"
                : error
                  ? "Не удалось сохранить результат"
                  : isPracticeComplete
                    ? (isAuthenticated ? "Все задания выполнены" : "Все задания выполнены — войдите, чтобы сохранить")
                    : `Выполнено ${Math.min(completedItemCount, trackedItemCount)} из ${trackedItemCount}`}
            </span>
          </div>
          <div
            className="self-check-progress"
            role="progressbar"
            aria-label="Прогресс выполнения занятия"
            aria-valuemin={0}
            aria-valuemax={trackedItemCount}
            aria-valuenow={Math.min(completedItemCount, trackedItemCount)}
          >
            <span style={{ width: `${completionPercent}%` }} />
          </div>
          {error && (
            <div className="self-check-status__error">
              <span className="form-error">{error}</span>
              {isAuthenticated && isPracticeComplete && (
                <button className="self-check-status__retry" type="button" onClick={() => setCompletionRetry((value) => value + 1)}>
                  Повторить сохранение
                </button>
              )}
            </div>
          )}
          {isPracticeComplete && !isAuthenticated && (
            <button className="self-check-status__login" type="button" onClick={onRequireAuth}>
              Войти и сохранить прогресс
            </button>
          )}
        </div>
      )}
      {!lesson.completed && trackedItemCount === 0 && (
        <section className="self-check-card self-check-card--complete">
          <div className="self-check-card__content">
            <span className="self-check-card__eyebrow">Самопроверка</span>
            <p>Проверили себя и готовы закрыть урок? Оставьте след: «Я тут был, читал :)»</p>
            {error && <div className="form-error">{error}</div>}
          </div>
          <button className="primary-action" type="button" onClick={markCompleted} disabled={isSaving}>
            <CheckCircle2 size={17} />
            {isSaving ? "Сохраняем..." : isAuthenticated ? "Я тут был, читал :)" : "Войти и сохранить"}
          </button>
        </section>
      )}
    </>
  );
}

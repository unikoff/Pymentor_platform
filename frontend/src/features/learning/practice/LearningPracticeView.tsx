import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen, CalendarClock, CalendarPlus, CheckCircle2, ChevronDown, ChevronRight, Clock,
  Code2, FileText, Lock, LogOut, PanelLeftClose, PanelLeftOpen, Play, Moon, Search,
  ShieldCheck, Sun, Terminal, Trash2, User, X,
} from "lucide-react";
import { runTask, submitTask } from "../api";
import { getLessonTasks } from "../access";
import { CodeEditor } from "../../../shared/ui/code-editor/CodeEditor";
import { renderPracticeText } from "./text-format";
import { readStoredString, SelfCheckPanel } from "./SelfCheckPanel";
import type { Lesson, LessonTask, TaskRunResponse, TaskSubmitResponse, TaskContract, TaskRequirements, TaskTestResult } from "../types";

export function LearningPracticeView({
  lesson,
  isAuthenticated,
  onRequireAuth,
  onLessonCompleted,
  progressOwnerKey,
}: {
  lesson: Lesson;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onLessonCompleted: () => void;
  progressOwnerKey: string;
}) {
  const tasks = getLessonTasks(lesson);
  const manualPractice = lesson.manual_practice ?? [];
  const hasMixedPractice = tasks.length > 0 && manualPractice.length > 0;
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [solvedTaskIds, setSolvedTaskIds] = useState<Set<string>>(
    () => new Set(tasks.filter((task) => task.completed).map((task) => task.id)),
  );

  useEffect(() => {
    setSolvedTaskIds(new Set(getLessonTasks(lesson).filter((task) => task.completed).map((task) => task.id)));
  }, [lesson.id]);

  const completedTaskCount = tasks.filter((task) => task.completed || solvedTaskIds.has(task.id)).length;

  function handleMixedTaskSolved(taskId: string) {
    setSolvedTaskIds((current) => new Set(current).add(taskId));
    onLessonCompleted();
  }

  return (
    <div className="practice-stack">
      <div className="practice-intro">
        <span>{lesson.module}</span>
        <h1>Задания: {lesson.title}</h1>
        <p>
          {hasMixedPractice
            ? "Сначала решим задания в редакторе, затем выполним ручную часть практики. После обеих частей зафиксируем результат."
            : lesson.self_check
            ? "Здесь практика проходит вне интерпретатора. Последовательно выполним задачи, отметим готовые пункты и зафиксируем результат."
            : tasks[0]?.mode === "script"
              ? "Напишем полноценную программу в редакторе. Backend запустит её в изолированном интерпретаторе и сверит вывод."
              : "Реализуем функцию solve. Backend запустит код в отдельном процессе и проверит её на скрытых тестах."}
        </p>
      </div>
      {tasks.length > 0 && (
        <div className="task-list">
          {tasks.map((task, taskIndex) => (
            <TaskRunner
              task={task}
              key={`${task.id}:${task.revision}`}
              taskNumber={taskIndex + 1}
              taskTotal={tasks.length}
              isActive={taskIndex === Math.min(activeTaskIndex, tasks.length - 1)}
              onNavigateTask={setActiveTaskIndex}
              progressOwnerKey={progressOwnerKey}
              onSolved={hasMixedPractice ? () => handleMixedTaskSolved(task.id) : onLessonCompleted}
            />
          ))}
        </div>
      )}
      {lesson.self_check ? (
        <SelfCheckPanel
          lesson={lesson}
          isAuthenticated={isAuthenticated}
          onRequireAuth={onRequireAuth}
          onLessonCompleted={onLessonCompleted}
          progressOwnerKey={progressOwnerKey}
          requiredTasksComplete={!hasMixedPractice || completedTaskCount === tasks.length}
          requiredTaskCount={hasMixedPractice ? tasks.length : 0}
          completedTaskCount={hasMixedPractice ? completedTaskCount : 0}
        />
      ) : tasks.length === 0 ? (
        <div className="empty-task-card">
          <h2>Задания скоро появятся</h2>
          <p>Для этого урока пока нет практических задач. Можно выбрать другой урок или вернуться к теории.</p>
        </div>
      ) : null}
    </div>
  );
}

function TaskRunner({
  task,
  taskNumber,
  taskTotal,
  isActive,
  onNavigateTask,
  progressOwnerKey,
  onSolved,
}: {
  task: LessonTask;
  taskNumber: number;
  taskTotal: number;
  isActive: boolean;
  onNavigateTask: (taskIndex: number) => void;
  progressOwnerKey: string;
  onSolved?: () => void;
}) {
  const draftStorageKey = `pymentor:task-draft:${progressOwnerKey}:${task.id}:${task.revision}`;
  const [code, setCode] = useState(() => readStoredString(draftStorageKey, task.starter_code));
  const [result, setResult] = useState<TaskSubmitResponse | null>(null);
  const [runResult, setRunResult] = useState<TaskRunResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [visibleHintCount, setVisibleHintCount] = useState(0);
  const isBusy = isRunning || isChecking;
  const taskPrompt = useMemo(() => splitTaskPrompt(task.prompt), [task.prompt]);
  const taskContract: TaskContract = task.contract ?? {
    given:
      task.mode === "script"
        ? "Переменные из условия подготовит интерпретатор."
        : "Автопроверка вызовет solve с разными скрытыми данными.",
    todo: taskPrompt.description,
    check: task.mode === "script" ? "Сверим вывод программы." : "Сверим результат, который вернёт solve.",
  };
  const requirementItems = task.requirements?.items ?? [];
  const hints = task.hints ?? [];

  useEffect(() => {
    try {
      window.localStorage.setItem(draftStorageKey, code);
    } catch {
      // Редактор продолжает работать, даже если браузер запрещает localStorage.
    }
  }, [code, draftStorageKey]);

  function revealNextHint() {
    setVisibleHintCount((current) => Math.min(current + 1, hints.length));
  }

  async function runCode() {
    setIsRunning(true);
    setResult(null);
    setRunResult(null);
    try {
      const data = await runTask(task.id, code, task.revision);
      setRunResult(data);
    } catch (err) {
      setRunResult({
        ok: false,
        stdout: "",
        error: err instanceof Error ? err.message : "Не удалось запустить код",
      });
    } finally {
      setIsRunning(false);
    }
  }

  async function submitCode() {
    setIsChecking(true);
    setResult(null);
    setRunResult(null);
    try {
      const data = await submitTask(task.id, code, task.revision);
      setResult(data);
      if (data.ok) {
        onSolved?.();
      }
    } catch (err) {
      setResult({
        ok: false,
        score: 0,
        tests: [],
        stdout: "",
        error: err instanceof Error ? err.message : "Не удалось проверить код",
      });
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <section className="task-card task-card--editor" hidden={!isActive}>
      <div className="task-head">
        <div className="task-head__topline">
          <div className="task-head__meta">
            <span>Задача {taskNumber} из {taskTotal}</span>
            <span>{task.mode === "script" ? "Программа Python" : "Функция solve"}</span>
            {task.completed && <span className="task-head__meta-completed">Проверено</span>}
          </div>
          <div className="practice-task-navigation" aria-label="Переключение задач">
            <button
              className="practice-task-navigation__button"
              type="button"
              disabled={taskNumber === 1}
              onClick={() => onNavigateTask(taskNumber - 2)}
            >
              Назад
            </button>
            <button
              className="practice-task-navigation__button practice-task-navigation__button--next"
              type="button"
              disabled={taskNumber === taskTotal}
              onClick={() => onNavigateTask(taskNumber)}
            >
              Следующая
            </button>
          </div>
        </div>
        <h2>{renderPracticeText(task.title)}</h2>
      </div>
      <div className="task-workspace">
        <div className="task-brief" aria-label="Техническое задание">
          <div className="task-brief__head">
            <span>Техническое задание</span>
            <p>Сначала разберите договор, затем соберите решение в редакторе.</p>
          </div>
          <div className="task-spec">
            <section className="task-spec__item">
              <span>Дано</span>
              <div className="task-spec__text">{renderPracticeText(taskContract.given)}</div>
              {taskContract.given_items && taskContract.given_items.length > 0 && (
                <ul className="task-spec__list">
                  {taskContract.given_items.map((item) => (
                    <li key={item}>{renderPracticeText(item)}</li>
                  ))}
                </ul>
              )}
            </section>
            <section className="task-spec__item">
              <span>Нужно сделать</span>
              <div className="task-spec__text">{renderPracticeText(taskContract.todo)}</div>
              {taskContract.todo_items && taskContract.todo_items.length > 0 && (
                <ol className="task-spec__list task-spec__list--ordered">
                  {taskContract.todo_items.map((item) => (
                    <li key={item}>{renderPracticeText(item)}</li>
                  ))}
                </ol>
              )}
            </section>
            <section className="task-spec__item task-spec__item--check">
              <span>Как проверим</span>
              <div className="task-spec__text">{renderPracticeText(taskContract.check)}</div>
              {taskContract.check_items && taskContract.check_items.length > 0 && (
                <ul className="task-spec__list">
                  {taskContract.check_items.map((item) => (
                    <li key={item}>{renderPracticeText(item)}</li>
                  ))}
                </ul>
              )}
            </section>
          </div>
          {requirementItems.length > 0 && (
            <section className="task-requirements" aria-label="Обязательные элементы решения">
              <span>Опорные условия</span>
              <ol>
                {requirementItems.map((item) => (
                  <li key={item}>{renderPracticeText(item)}</li>
                ))}
              </ol>
            </section>
          )}
          {taskPrompt.examples.length > 0 && (
            <div className="task-examples" aria-label="Примеры ввода и вывода">
              <span className="task-examples-title">Пример ввода и вывода</span>
              {taskPrompt.examples.map((example, index) => (
                <div className="task-example" key={`${example.input}-${example.output}-${index}`}>
                  <div className="task-example-cell">
                    <span>Ввод</span>
                    <code>{example.input}</code>
                  </div>
                  <i className="task-example-arrow" aria-hidden="true">→</i>
                  <div className="task-example-cell task-example-cell--output">
                    <span>Вывод</span>
                    <code>{example.output}</code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <section className="task-code-panel" aria-label="Редактор решения">
          <div className="task-code-panel__head">
            <div>
              <span>Редактор решения</span>
               <p>Сначала запустим один пример, затем отправим решение на полную проверку.</p>
            </div>
            <code>Python</code>
          </div>
          <CodeEditor value={code} onChange={setCode} ariaLabel={`Код для задания ${task.title}`} />
          <div className="task-editor-actions">
            <p>Демонстрационный запуск не засчитывает урок.</p>
            <div className="task-actions">
              {hints.length > 0 && (
                <button
                  className="run-button run-button--hint"
                  type="button"
                  onClick={revealNextHint}
                  disabled={isBusy || visibleHintCount === hints.length}
                >
                  {visibleHintCount === 0
                    ? "Подсказка"
                    : visibleHintCount === hints.length
                      ? "Все подсказки открыты"
                      : `Ещё подсказка ${visibleHintCount + 1} из ${hints.length}`}
                </button>
              )}
              <button
                className="run-button run-button--ghost"
                type="button"
                onClick={runCode}
                disabled={isBusy}
                title="Демонстрационный запуск: проверка выполнит один пример без зачёта урока"
              >
                <Terminal size={16} />
                {isRunning ? "Запуск..." : "Запустить пример"}
              </button>
              <button className="run-button" type="button" onClick={submitCode} disabled={isBusy}>
                <Play size={16} />
                {isChecking ? "Проверка..." : "Проверить решение"}
              </button>
            </div>
          </div>
          {visibleHintCount > 0 && (
            <aside className="task-hints" aria-label="Подсказки к заданию">
              <div className="task-hints__head">
                <strong>Подсказки</strong>
                <span>{visibleHintCount} из {hints.length}</span>
              </div>
              <ol>
                {hints.slice(0, visibleHintCount).map((hint) => (
                  <li key={hint}>{renderPracticeText(hint)}</li>
                ))}
              </ol>
            </aside>
          )}
          {runResult && <RunOutput result={runResult} />}
          {result && <TaskResult result={result} />}
        </section>
      </div>
    </section>
  );
}

function splitTaskPrompt(prompt: string): { description: string; examples: Array<{ input: string; output: string }> } {
  const exampleMatch = /\*\*Пример(?:ы)?:\*\*\s*([^\n]+)/i.exec(prompt);
  if (!exampleMatch) {
    return { description: prompt, examples: [] };
  }

  const examples = exampleMatch[1]
    .replace(/\.$/, "")
    .split(/;\s*/)
    .map((item) => item.trim())
    .map((item) => {
      const separatorIndex = item.indexOf("->");
      if (separatorIndex === -1) {
        return null;
      }
      return {
        input: cleanTaskExample(item.slice(0, separatorIndex)),
        output: cleanTaskExample(item.slice(separatorIndex + 2)),
      };
    })
    .filter((item): item is { input: string; output: string } => item !== null && Boolean(item.input) && Boolean(item.output));

  const description = prompt
    .replace(exampleMatch[0], "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { description, examples };
}

function cleanTaskExample(value: string): string {
  return value.trim().replace(/^`+|`+$/g, "").replace(/\.$/, "").trim();
}

function formatCompilerMessage(message?: string | null) {
  if (!message) {
    return "";
  }

  if (message.includes("solve") && (message.includes("�") || message.includes("РќСѓ"))) {
    return "Нужно объявить функцию solve.";
  }

  return message;
}

function RunOutput({ result }: { result: TaskRunResponse }) {
  const errorMessage = formatCompilerMessage(result.error);

  return (
    <div className={`task-result ${result.ok ? "is-neutral" : "is-failed"}`}>
      <div className="task-result-summary">
        <strong>{result.ok ? "Код выполнен" : "Ошибка выполнения"}</strong>
      </div>
      {errorMessage && <p>{errorMessage}</p>}
      <pre className="task-output">
        <code>{result.stdout?.trim() ? result.stdout : "Программа ничего не вывела."}</code>
      </pre>
      {result.stderr && (
        <pre className="task-output task-output--stderr">
          <code>{result.stderr}</code>
        </pre>
      )}
    </div>
  );
}

function formatTestValue(value: unknown): string {
  if (value === undefined) {
    return "undefined";
  }

  try {
    const serialized = JSON.stringify(value, null, 2);
    return serialized ?? String(value);
  } catch {
    return String(value);
  }
}

function TaskResult({ result }: { result: TaskSubmitResponse }) {
  const errorMessage = formatCompilerMessage(result.error);
  const hasExecutionError = Boolean(errorMessage);

  return (
    <div className={`task-result ${result.ok ? "is-success" : "is-failed"}`}>
      <div className="task-result-summary">
        <strong>{result.ok ? "Задание принято" : hasExecutionError ? "Ошибка в коде" : "Нужно доработать"}</strong>
        <span>{result.score}%</span>
      </div>
      {errorMessage && <p className="task-result__error">{errorMessage}</p>}
      {result.stdout && (
        <pre className="task-output">
          <code>{result.stdout}</code>
        </pre>
      )}
      {result.stderr && (
        <pre className="task-output task-output--stderr">
          <code>{result.stderr}</code>
        </pre>
      )}
      {result.tests.length > 0 && (
        <ul className="test-list">
          {result.tests.map((test) => (
            <li className={test.passed ? "is-success" : "is-failed"} key={test.name}>
              <span>{test.passed ? "passed" : "failed"}</span>
              <strong>{test.name}</strong>
              {!test.passed && (
                test.error ? (
                  <p className="test-diff__error">Выполнение прервано: {formatCompilerMessage(test.error)}</p>
                ) : (
                  <div className="test-diff">
                    <div>
                      <span>Ожидалось</span>
                      <pre>
                        <code>{formatTestValue(test.expected)}</code>
                      </pre>
                    </div>
                    <div>
                      <span>Получено</span>
                      <pre>
                        <code>{formatTestValue(test.actual)}</code>
                      </pre>
                    </div>
                  </div>
                )
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

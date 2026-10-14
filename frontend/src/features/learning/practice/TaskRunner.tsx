import { useEffect, useMemo, useRef, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { runTask, submitTask } from "../api";
import { CodeToolbar, CodeWorkbench, RunOutput } from "../code-workbench";
import { readStoredString, writeStoredValue } from "../../../shared/lib/storage";
import { usePracticeState } from "./session";
import { splitTaskPrompt } from "./task-prompt";
import { readPracticeEditorHeight, getDefaultEditorHeight, readStoredPercent, getPracticeBriefWidthRange, clampPracticeBriefPercent } from "./pane-layout";
import { TaskResult, formatCompilerMessage } from "./TaskResult";
import { TaskBrief } from "./TaskBrief";
import type { LessonTask, TaskRunResponse, TaskSubmitResponse, TaskContract } from "../types";

export function TaskRunner({
  task,
  lessonId,
  taskNumber,
  taskTotal,
  isActive,
  onNavigateTask,
  progressOwnerKey,
  onSolved,
}: {
  task: LessonTask;
  lessonId: string;
  taskNumber: number;
  taskTotal: number;
  isActive: boolean;
  onNavigateTask: (taskIndex: number) => void;
  progressOwnerKey: string;
  onSolved?: () => void;
}) {
  const draftStorageKey = `pymentor:task-draft:${progressOwnerKey}:${task.id}:${task.revision}`;
  const sessionKey = `${progressOwnerKey}:${lessonId}:${task.id}:${task.revision}`;
  const editorHeightStorageKey = `pymentor:practice-editor-height:${progressOwnerKey}`;
  const briefWidthStorageKey = `pymentor:practice-brief-width:${progressOwnerKey}`;
  const taskWorkspaceRef = useRef<HTMLDivElement | null>(null);
  const briefSplitterDrag = useRef<{ pointerId: number; startX: number; startWidth: number; workspaceWidth: number } | null>(null);
  const [code, setCode] = usePracticeState(`${sessionKey}:code`, () => readStoredString(draftStorageKey, task.starter_code));
  const [result, setResult] = usePracticeState<TaskSubmitResponse | null>(`${sessionKey}:result`, () => null);
  const [runResult, setRunResult] = usePracticeState<TaskRunResponse | null>(`${sessionKey}:run-result`, () => null);
  const [isRunning, setIsRunning] = usePracticeState(`${sessionKey}:running`, () => false);
  const [isChecking, setIsChecking] = usePracticeState(`${sessionKey}:checking`, () => false);
  const [isTerminalOpen, setIsTerminalOpen] = usePracticeState(`${sessionKey}:terminal-open`, () => true);
  const [editorPaneHeight, setEditorPaneHeight] = usePracticeState(
    `practice-editor-height:${progressOwnerKey}`,
    () => readPracticeEditorHeight(editorHeightStorageKey, getDefaultEditorHeight()),
  );
  const [briefPanePercent, setBriefPanePercent] = usePracticeState(
    `practice-brief-width:${progressOwnerKey}`,
    () => readStoredPercent(briefWidthStorageKey, 42),
  );
  const [visibleHintCount, setVisibleHintCount] = usePracticeState(`${sessionKey}:hints`, () => 0);
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
  const hints = task.hints ?? [];

  function getBriefPaneRange() {
    const workspaceWidth = taskWorkspaceRef.current?.clientWidth || 1200;
    return getPracticeBriefWidthRange(workspaceWidth);
  }

  function clampBriefPanePercent(percent: number) {
    const { minPercent, maxPercent, workspaceWidth } = getBriefPaneRange();
    return clampPracticeBriefPercent(percent, workspaceWidth, minPercent, maxPercent);
  }

  function updateBriefPanePercent(percent: number, persist = false) {
    const nextPercent = clampBriefPanePercent(percent);
    setBriefPanePercent(nextPercent);
    if (persist) {
      writeStoredValue(briefWidthStorageKey, nextPercent);
    }
  }

  function handleBriefSplitterPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const workspace = taskWorkspaceRef.current;
    const brief = workspace?.querySelector<HTMLElement>(".task-brief");
    if (!workspace || !brief) return;
    event.preventDefault();
    briefSplitterDrag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: brief.getBoundingClientRect().width,
      workspaceWidth: workspace.clientWidth,
    };
    event.currentTarget.focus();
  }

  function handleBriefSplitterKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const { minPercent, maxPercent, workspaceWidth } = getBriefPaneRange();
    const step = (event.shiftKey ? 64 : 24) / workspaceWidth * 100;
    if (event.key === "ArrowLeft") updateBriefPanePercent(briefPanePercent - step, true);
    else if (event.key === "ArrowRight") updateBriefPanePercent(briefPanePercent + step, true);
    else if (event.key === "Home") updateBriefPanePercent(minPercent, true);
    else if (event.key === "End") updateBriefPanePercent(maxPercent, true);
    else return;
    event.preventDefault();
  }

  useEffect(() => {
    function getWidthPercent(clientX: number, drag: NonNullable<typeof briefSplitterDrag.current>) {
      const { minWidth, maxWidth } = getPracticeBriefWidthRange(drag.workspaceWidth);
      const nextWidth = Math.min(maxWidth, Math.max(minWidth, drag.startWidth + clientX - drag.startX));
      return nextWidth / drag.workspaceWidth * 100;
    }

    function handlePointerMove(event: PointerEvent) {
      const drag = briefSplitterDrag.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      event.preventDefault();
      setBriefPanePercent(getWidthPercent(event.clientX, drag));
    }

    function finishPointerDrag(event: PointerEvent) {
      const drag = briefSplitterDrag.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const nextPercent = getWidthPercent(event.clientX, drag);
      setBriefPanePercent(nextPercent);
      briefSplitterDrag.current = null;
      writeStoredValue(briefWidthStorageKey, nextPercent);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", finishPointerDrag);
    window.addEventListener("pointercancel", finishPointerDrag);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishPointerDrag);
      window.removeEventListener("pointercancel", finishPointerDrag);
    };
  }, [briefWidthStorageKey, setBriefPanePercent]);

  useEffect(() => {
    writeStoredValue(draftStorageKey, code);
  }, [code, draftStorageKey]);

  function revealNextHint() {
    setVisibleHintCount((current) => Math.min(current + 1, hints.length));
  }

  async function runCode() {
    if (isBusy) return;
    setIsTerminalOpen(true);
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
    if (isBusy) return;
    setIsTerminalOpen(true);
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
      <div
        className="task-workspace"
        ref={taskWorkspaceRef}
        style={{ "--practice-brief-width": `${clampBriefPanePercent(briefPanePercent)}%` } as CSSProperties}
      >
        <div className="task-brief" aria-label="Техническое задание">
          <div className="task-brief__toolbar">
            <div className="task-head__meta">
              <span>Задача {taskNumber} из {taskTotal}</span>
              {task.completed && <span className="task-head__meta-completed">Проверено</span>}
            </div>
            <div className="practice-task-navigation" aria-label="Переключение задач">
              <button
                className="practice-task-navigation__button"
                type="button"
                disabled={taskNumber === 1}
                onClick={() => onNavigateTask(taskNumber - 2)}
                aria-label="Предыдущая задача"
                title="Предыдущая задача"
              >
                <ArrowLeft size={16} strokeWidth={1.9} aria-hidden="true" />
              </button>
              <button
                className="practice-task-navigation__button practice-task-navigation__button--next"
                type="button"
                disabled={taskNumber === taskTotal}
                onClick={() => onNavigateTask(taskNumber)}
                aria-label="Следующая задача"
                title="Следующая задача"
              >
                <ArrowRight size={16} strokeWidth={1.9} aria-hidden="true" />
              </button>
            </div>
          </div>
          <TaskBrief title={task.title} contract={taskContract} examples={taskPrompt.examples}
            hints={hints} visibleHintCount={visibleHintCount} isBusy={isBusy} onRevealHint={revealNextHint} />
        </div>

        <div
          className="task-workspace-splitter"
          role="separator"
          tabIndex={0}
          aria-label="Изменить ширину условия и редактора"
          aria-orientation="vertical"
          aria-valuemin={Math.round(getBriefPaneRange().minPercent)}
          aria-valuemax={Math.round(getBriefPaneRange().maxPercent)}
          aria-valuenow={Math.round(clampBriefPanePercent(briefPanePercent))}
          aria-valuetext={`${Math.round(clampBriefPanePercent(briefPanePercent))}% ширины условия`}
          onPointerDown={handleBriefSplitterPointerDown}
          onKeyDown={handleBriefSplitterKeyDown}
        >
          <span />
        </div>

        <section className="task-code-panel" aria-label="Редактор решения">
          <CodeToolbar onRun={runCode} onCheck={submitCode} isRunning={isRunning} isChecking={isChecking} disabled={isBusy} />
          <CodeWorkbench code={code} onCodeChange={setCode} label={`Код для задания ${task.title}`}
            height={editorPaneHeight} onHeightChange={setEditorPaneHeight} heightStorageKey={editorHeightStorageKey}
            terminalOpen={isTerminalOpen} onToggleTerminal={() => setIsTerminalOpen((open) => !open)}
            status={isRunning ? "Выполняется" : isChecking ? "Проверка" : result ? (result.ok ? "Принято" : "Есть ошибки") : runResult ? (runResult.ok ? "Завершено" : "Ошибка") : "Вывод"}>
            {runResult && <RunOutput result={runResult} errorMessage={formatCompilerMessage(runResult.error)} />}
            {result && <TaskResult result={result} />}
            {!runResult && !result && <pre className="task-terminal__empty"><code>{isBusy ? "Выполняется…" : "$ Запустите пример, чтобы увидеть вывод"}</code></pre>}
          </CodeWorkbench>
        </section>
      </div>
    </section>
  );
}

import "./toolbar.css";
import { CheckCircle2, Code2, LoaderCircle, Play } from "lucide-react";

export function CodeToolbar({ onRun, onCheck, isRunning, isChecking = false, disabled,
  runLabel = isRunning ? "примера" : "пример", className = "" }: {
  onRun: () => void; onCheck?: () => void; isRunning: boolean; isChecking?: boolean;
  disabled: boolean; runLabel?: string; className?: string;
}) {
  const runTitle = `${isRunning ? "Запуск" : "Запустить"} ${runLabel}${isRunning ? "…" : ""}`;
  const checkTitle = isChecking ? "Проверка решения…" : "Проверить решение";
  return <div className={`task-code-toolbar ${className}`}>
    <span><Code2 size={15} /> Python</span>
    <div className="task-code-toolbar__actions" role="group" aria-label="Действия с кодом">
      <button className="task-code-action" type="button" onClick={onRun} disabled={disabled}
        aria-busy={isRunning} aria-label={runTitle.replace("…", "")} title={runTitle}>
        {isRunning ? <LoaderCircle size={16} aria-hidden="true" /> : <Play size={16} fill="currentColor" aria-hidden="true" />}
      </button>
      {onCheck && <button className="task-code-action task-code-action--check" type="button" onClick={onCheck}
        disabled={disabled} aria-busy={isChecking} aria-label={checkTitle.replace("…", "")} title={checkTitle}>
        {isChecking ? <LoaderCircle size={17} aria-hidden="true" /> : <CheckCircle2 size={17} aria-hidden="true" />}
      </button>}
    </div>
  </div>;
}

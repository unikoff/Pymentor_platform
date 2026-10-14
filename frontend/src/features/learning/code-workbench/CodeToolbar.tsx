import "./toolbar.css";
import { CheckCircle2, Code2, Play } from "lucide-react";

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
        aria-label={runTitle.replace("…", "")} title={runTitle}>
        <Play size={16} fill="currentColor" aria-hidden="true" />
      </button>
      {onCheck && <button className="task-code-action task-code-action--check" type="button" onClick={onCheck}
        disabled={disabled} aria-label={checkTitle.replace("…", "")} title={checkTitle}>
        <CheckCircle2 size={17} aria-hidden="true" />
      </button>}
    </div>
  </div>;
}

import { useEffect, useState } from "react";
import { runInterpreter } from "../api";
import { CodeToolbar, CodeWorkbench, RunOutput } from "../code-workbench";
import { readStoredNumber, readStoredString, writeStoredValue } from "../../../shared/lib/storage";
import type { TaskRunResponse } from "../types";
import "./interpreter.css";

const STARTER_CODE = 'print("Привет, мир!")';

function readEditorHeight(key: string) {
  const fallback = Math.round((typeof window === "undefined" ? 900 : window.innerHeight) * 0.46);
  const value = readStoredNumber(key, fallback);
  return value > 0 ? value : fallback;
}

export function OnlineInterpreter({ ownerKey }: { ownerKey: string }) {
  const storageKey = `pymentor:interpreter:${ownerKey}`;
  const editorHeightStorageKey = `pymentor:interpreter-editor-height:${ownerKey}`;
  const [code, setCode] = useState(() => readStoredString(storageKey, STARTER_CODE));
  const [result, setResult] = useState<TaskRunResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [editorPaneHeight, setEditorPaneHeight] = useState(() => readEditorHeight(editorHeightStorageKey));

  useEffect(() => {
    writeStoredValue(storageKey, code);
  }, [code, storageKey]);

  async function execute() {
    if (isRunning) return;
    setIsTerminalOpen(true);
    setIsRunning(true);
    setResult(null);
    try { setResult(await runInterpreter(code)); }
    catch (error) {
      setResult({ ok: false, stdout: "", error: error instanceof Error ? error.message : "Не удалось запустить код" });
    } finally { setIsRunning(false); }
  }

  return <div className="online-interpreter dock-scroll">
    <CodeToolbar className="online-interpreter__toolbar" onRun={() => void execute()} isRunning={isRunning}
      disabled={isRunning} runLabel={isRunning ? "интерпретатора" : "интерпретатор"} />
    <CodeWorkbench className="online-interpreter__workbench" code={code} onCodeChange={setCode} label="Код для интерпретатора Python"
      height={editorPaneHeight} onHeightChange={setEditorPaneHeight} heightStorageKey={editorHeightStorageKey}
      terminalOpen={isTerminalOpen} onToggleTerminal={() => setIsTerminalOpen((open) => !open)}
      status={isRunning ? "Выполняется" : result ? (result.ok ? "Завершено" : "Ошибка") : "Вывод"}>
      {result ? <RunOutput result={result} errorClassName="task-result__error" />
        : <pre className="task-terminal__empty"><code>{isRunning ? "Выполняется…" : "$ Запустите код, чтобы увидеть вывод"}</code></pre>}
    </CodeWorkbench>
  </div>;
}

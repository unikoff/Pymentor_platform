import type { TaskRunResponse } from "../types";

export function RunOutput({ result, errorMessage = result.error, errorClassName }: {
  result: TaskRunResponse; errorMessage?: string | null; errorClassName?: string;
}) {
  return <div className={`task-result ${result.ok ? "is-neutral" : "is-failed"}`}>
    <div className="task-result-summary"><strong>{result.ok ? "Код выполнен" : "Ошибка выполнения"}</strong></div>
    {errorMessage && <p className={errorClassName}>{errorMessage}</p>}
    <pre className="task-output"><code>{result.stdout?.trim() ? result.stdout : "Программа ничего не вывела."}</code></pre>
    {result.stderr && <pre className="task-output task-output--stderr"><code>{result.stderr}</code></pre>}
  </div>;
}

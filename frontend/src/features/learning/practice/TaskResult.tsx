import type { TaskSubmitResponse } from "../types";

export function formatCompilerMessage(message?: string | null) {
  if (!message) {
    return "";
  }

  if (message.includes("solve") && (message.includes("�") || message.includes("РќСѓ"))) {
    return "Нужно объявить функцию solve.";
  }

  return message;
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

export function TaskResult({ result }: { result: TaskSubmitResponse }) {
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

import React, { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Play, Sparkles, Split, Terminal, X } from "lucide-react";
import { CodeBlock } from "../../shared/ui/code-editor/CodeEditor";
import { highlightPython } from "../../shared/lib/python-highlight";

export function PredictOutput({ code, output, hint }: { code: string; output: string; hint?: string }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="predict-card">
      <div className="predict-label">
        <Play size={14} /> Что напечатает этот код?
      </div>
      <CodeBlock code={code} />
      {shown ? (
        <pre className="predict-output">
          <code>{output}</code>
        </pre>
      ) : (
        <>
          {hint && <p className="predict-hint">Подсказка: {hint}</p>}
          <button className="predict-btn" type="button" onClick={() => setShown(true)}>
            Показать вывод
          </button>
        </>
      )}
    </div>
  );
}

// ---------- Интерактив: пошаговое выполнение (трассировщик) ----------

type TraceStep = { line: number; note: string; vars?: Record<string, string> };

export function StepThrough({ code, steps }: { code: string; steps: TraceStep[] }) {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const lines = code.split("\n");

  return (
    <div className="tracer">
      <div className="tracer-code">
        {lines.map((line, idx) => (
          <div className={`tracer-line ${idx === step.line ? "is-current" : ""}`} key={idx}>
            <span className="tracer-ln">{idx + 1}</span>
            <code dangerouslySetInnerHTML={{ __html: highlightPython(line) || "&nbsp;" }} />
          </div>
        ))}
      </div>
      <div className="tracer-panel">
        <p className="tracer-note">{step.note}</p>
        {step.vars && Object.keys(step.vars).length > 0 && (
          <div className="tracer-vars">
            {Object.entries(step.vars).map(([name, value]) => (
              <span key={name}>
                <b>{name}</b> = {value}
              </span>
            ))}
          </div>
        )}
        <div className="tracer-nav">
          <button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)}>
            <ChevronLeft size={14} /> Назад
          </button>
          <span>
            шаг {index + 1} из {steps.length}
          </span>
          <button type="button" disabled={index === steps.length - 1} onClick={() => setIndex(index + 1)}>
            Дальше <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Интерактив: заполни пропуск ----------

export function FillBlank({
  prompt,
  before,
  after,
  options,
  answer,
  explanation,
}: {
  prompt: string;
  before: string;
  after: string;
  options: string[];
  answer: string;
  explanation: string;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const isCorrect = picked === answer;

  return (
    <div className="fill-card">
      <div className="fill-prompt">
        <Sparkles size={15} /> {prompt}
      </div>
      <pre className="fill-code">
        <code>
          {before}
          <span className={`fill-gap ${picked ? (isCorrect ? "is-correct" : "is-wrong") : ""}`}>{picked ?? "____"}</span>
          {after}
        </code>
      </pre>
      <div className="fill-options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`fill-option ${picked === option ? (isCorrect ? "is-correct" : "is-wrong") : ""}`}
            disabled={isCorrect}
            onClick={() => setPicked(option)}
          >
            <code>{option}</code>
          </button>
        ))}
      </div>
      {picked && (
        <p className={`fill-explanation ${isCorrect ? "is-correct" : "is-wrong"}`}>
          {isCorrect ? <Check size={14} /> : <X size={14} />} {isCorrect ? explanation : "Пробуем другой вариант."}
        </p>
      )}
    </div>
  );
}

// ---------- Интерактив: терминал ----------

export function TerminalDemo({ title, lines }: { title?: string; lines: { cmd?: string; out?: string }[] }) {
  return (
    <div className="terminal-demo">
      <div className="terminal-bar">
        <Terminal size={13} />
        <span>{title ?? "terminal"}</span>
      </div>
      <div className="terminal-body">
        {lines.map((line, index) =>
          line.cmd !== undefined ? (
            <div className="terminal-cmd" key={index}>
              <span className="terminal-prompt">$</span> {line.cmd}
            </div>
          ) : (
            <div className="terminal-out" key={index}>
              {line.out}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

// ---------- Интерактив: соедини пары ----------
type BranchScenario = { label: string; activeLine: number; output: string };

export function BranchExplorer({ code, scenarios }: { code: string; scenarios: BranchScenario[] }) {
  const [active, setActive] = useState(0);
  const scenario = scenarios[active];
  const lines = code.split("\n");

  return (
    <section className="branch-card">
      <div className="interactive-heading">
        <Split size={17} />
        <div>
          <span>ВЕТВЛЕНИЕ</span>
          <h3>Какая ветка выполнится?</h3>
        </div>
      </div>
      <div className="branch-scenarios">
        {scenarios.map((item, index) => (
          <button
            key={item.label}
            type="button"
            className={`branch-chip ${active === index ? "is-active" : ""}`}
            onClick={() => setActive(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="branch-code">
        {lines.map((line, idx) => (
          <div className={`branch-line ${idx === scenario.activeLine ? "is-active" : ""}`} key={idx}>
            <code dangerouslySetInnerHTML={{ __html: highlightPython(line) || "&nbsp;" }} />
          </div>
        ))}
      </div>
      <div className="branch-output">
        <span>результат</span>
        <code>{scenario.output}</code>
      </div>
    </section>
  );
}

// ---------- Интерактив: карточки-перевёртыши ----------

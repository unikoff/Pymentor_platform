import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  Brain,
  Bug,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Layers,
  Lightbulb,
  Link2,
  ListChecks,
  ListOrdered,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Scale,
  Scissors,
  Sparkles,
  Split,
  Terminal,
  X,
} from "lucide-react";
import { CodeBlock } from "../CodeEditor";
import { highlightPython } from "../highlight";

export { CodeBlock };

/**
 * Переиспользуемые кубики для rich-страниц уроков + интерактивные механики.
 * Дизайн-страницы собираются из этих компонентов (см. lessons/block*.tsx).
 */

// ---------- Каркас ----------

export function RichLesson({ children }: { children: React.ReactNode }) {
  return <div className="rich-lesson">{children}</div>;
}

export function RichHero({
  chip,
  title,
  intro,
  tags,
  variant,
}: {
  chip: string;
  title: string;
  intro: React.ReactNode;
  tags?: { icon: React.ReactNode; label: string }[];
  variant?: "bool" | "project";
}) {
  return (
    <header className={`rich-hero ${variant ? `rich-hero--${variant}` : ""}`}>
      <span className="rich-hero-chip">{chip}</span>
      <h1>{title}</h1>
      <p>{intro}</p>
      {tags && tags.length > 0 && (
        <div className="rich-hero-tags">
          {tags.map((tag) => (
            <span key={tag.label}>
              {tag.icon} {tag.label}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}

export function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rich-section">
      <div className="rich-section-title">
        <span>{number}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="rich-lead">{children}</p>;
}

export function Callout({ children, tone }: { children: React.ReactNode; tone?: "warn" | "info" }) {
  return (
    <aside className={`lesson-callout ${tone === "info" ? "lesson-callout--info" : ""}`}>
      <Lightbulb size={18} />
      <p>{children}</p>
    </aside>
  );
}

export function TypeCards({ children }: { children: React.ReactNode }) {
  return <div className="type-cards">{children}</div>;
}

export function TypeCard({
  badge,
  badgeTone,
  title,
  children,
  code,
}: {
  badge: string;
  badgeTone?: "float" | "str";
  title: string;
  children: React.ReactNode;
  code?: string;
}) {
  return (
    <article className="type-card">
      <span className={`type-card-badge ${badgeTone ? `type-card-badge--${badgeTone}` : ""}`}>{badge}</span>
      <h3>{title}</h3>
      <p>{children}</p>
      {code && <CodeBlock code={code} />}
    </article>
  );
}

export function MethodGrid({ rows }: { rows: [React.ReactNode, React.ReactNode][] }) {
  return (
    <div className="method-grid">
      {rows.map((row, index) => (
        <div className="method-row" key={index}>
          <code>{row[0]}</code>
          <span>{row[1]}</span>
        </div>
      ))}
    </div>
  );
}

export function PracticeCta({ text }: { text?: string }) {
  return (
    <div className="practice-cta">
      <div>
        <strong>Теперь — код</strong>
        <p>{text ?? "Откройте вкладку practice.py: решите задание и проверьте его прямо в браузере."}</p>
      </div>
      <ArrowRight size={20} />
    </div>
  );
}

// ---------- Интерактив: собрать код (Parsons-подобное задание) ----------

type CodeSequencePiece = {
  id: string;
  code: string;
  note?: string;
};

export function CodeSequence({
  prompt,
  pieces,
  correctOrder,
  explanation,
  title = "Соберите программу",
}: {
  prompt: string;
  pieces: CodeSequencePiece[];
  correctOrder: string[];
  explanation: string;
  title?: string;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const selectedPieces = selectedIds.map((id) => pieces.find((piece) => piece.id === id)).filter(Boolean) as CodeSequencePiece[];
  const availablePieces = pieces.filter((piece) => !selectedIds.includes(piece.id));
  const isCorrect =
    selectedIds.length === correctOrder.length && selectedIds.every((id, index) => id === correctOrder[index]);

  function addPiece(id: string) {
    setSelectedIds((current) => [...current, id]);
    setIsChecked(false);
  }

  function removePiece(id: string) {
    setSelectedIds((current) => current.filter((pieceId) => pieceId !== id));
    setIsChecked(false);
  }

  function reset() {
    setSelectedIds([]);
    setIsChecked(false);
  }

  return (
    <section className="sequence-card">
      <div className="interactive-heading">
        <ListOrdered size={17} />
        <div>
          <span>СОБЕРИТЕ КОД</span>
          <h3>{title}</h3>
        </div>
      </div>
      <p className="interactive-prompt">{prompt}</p>

      <div className="sequence-workspace">
        <div className="sequence-panel">
          <span className="sequence-label">Фрагменты</span>
          <div className="sequence-pieces">
            {availablePieces.map((piece) => (
              <button className="sequence-piece" type="button" key={piece.id} onClick={() => addPiece(piece.id)}>
                <code>{piece.code}</code>
                {piece.note && <small>{piece.note}</small>}
              </button>
            ))}
            {availablePieces.length === 0 && <p className="sequence-empty">Все фрагменты добавлены.</p>}
          </div>
        </div>

        <div className="sequence-panel sequence-panel--target">
          <span className="sequence-label">Ваш порядок</span>
          <div className="sequence-target" aria-live="polite">
            {selectedPieces.length > 0 ? (
              selectedPieces.map((piece, index) => (
                <button
                  className="sequence-selected"
                  type="button"
                  key={piece.id}
                  onClick={() => removePiece(piece.id)}
                  aria-label={`Убрать строку ${index + 1}: ${piece.code}`}
                >
                  <span>{index + 1}</span>
                  <code>{piece.code}</code>
                  <X size={14} />
                </button>
              ))
            ) : (
              <p className="sequence-empty">Нажимайте на фрагменты слева в порядке выполнения.</p>
            )}
          </div>
        </div>
      </div>

      <div className="interactive-actions">
        <button className="interactive-secondary" type="button" onClick={reset} disabled={selectedIds.length === 0}>
          <RotateCcw size={15} /> Сбросить
        </button>
        <button className="interactive-primary" type="button" onClick={() => setIsChecked(true)} disabled={selectedIds.length === 0}>
          Проверить порядок
        </button>
      </div>

      {isChecked && (
        <p className={`interactive-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}>
          {isCorrect ? <Check size={16} /> : <X size={16} />}
          {isCorrect ? explanation : "Проверьте последовательность: Python выполняет инструкции сверху вниз, а лишние фрагменты можно не добавлять."}
        </p>
      )}
    </section>
  );
}

// ---------- Интерактив: найди ошибку ----------

export function BugHunt({
  code,
  question,
  options,
  correctIndex,
  explanation,
  fix,
}: {
  code: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  fix?: string;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const isDone = picked !== null;
  const isCorrect = picked === correctIndex;

  return (
    <section className="bug-hunt">
      <div className="interactive-heading">
        <Bug size={17} />
        <div>
          <span>ОТЛАДКА</span>
          <h3>Найдите причину ошибки</h3>
        </div>
      </div>
      <CodeBlock code={code} />
      <p className="interactive-prompt">{question}</p>
      <div className="bug-options">
        {options.map((option, index) => (
          <button
            className={`bug-option ${isDone && index === correctIndex ? "is-correct" : ""} ${isDone && index === picked && !isCorrect ? "is-wrong" : ""}`}
            type="button"
            key={option}
            disabled={isDone}
            onClick={() => setPicked(index)}
          >
            <span>{String.fromCharCode(65 + index)}</span>
            {option}
          </button>
        ))}
      </div>
      {isDone && (
        <div className={`bug-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}>
          <p>
            {isCorrect ? <Check size={16} /> : <X size={16} />}
            {isCorrect ? "Верно. " : "Почти. "}
            {explanation}
          </p>
          {isCorrect && fix && <CodeBlock caption="исправленный вариант" code={fix} />}
        </div>
      )}
    </section>
  );
}

// ---------- Интерактив: сравнение решений ----------

type SolutionVariant = {
  title: string;
  code: string;
  note: string;
};

export function CompareSolutions({
  question,
  left,
  right,
  preferred,
  explanation,
}: {
  question: string;
  left: SolutionVariant;
  right: SolutionVariant;
  preferred: "left" | "right" | "both";
  explanation: string;
}) {
  const [picked, setPicked] = useState<"left" | "right" | null>(null);
  const variants = [
    ["left", left] as const,
    ["right", right] as const,
  ];
  // "both" — оба варианта приемлемы: любой выбор считается верным.
  const isPreferred = (side: "left" | "right") => preferred === "both" || side === preferred;

  return (
    <section className="comparison-card">
      <div className="interactive-heading">
        <Scale size={17} />
        <div>
          <span>СРАВНЕНИЕ</span>
          <h3>Какой вариант лучше подходит?</h3>
        </div>
      </div>
      <p className="interactive-prompt">{question}</p>
      <div className="comparison-options">
        {variants.map(([side, variant]) => (
          <article className={`comparison-option ${picked === side ? "is-picked" : ""} ${picked !== null && isPreferred(side) ? "is-preferred" : ""}`} key={side}>
            <div>
              <span>{side === "left" ? "ВАРИАНТ A" : "ВАРИАНТ B"}</span>
              <h4>{variant.title}</h4>
            </div>
            <CodeBlock code={variant.code} />
            <p>{variant.note}</p>
            <button type="button" onClick={() => setPicked(side)} disabled={picked !== null}>
              Выбрать этот вариант
            </button>
          </article>
        ))}
      </div>
      {picked !== null && (
        <p className={`interactive-feedback ${isPreferred(picked) ? "is-correct" : "is-wrong"}`}>
          {isPreferred(picked) ? <Check size={16} /> : <Lightbulb size={16} />}
          {isPreferred(picked) ? "Точно. " : "Сравните ещё раз. "}
          {explanation}
        </p>
      )}
    </section>
  );
}

// ---------- Интерактив: активное воспроизведение ----------

export function RecallCard({ question, answer, hint }: { question: string; answer: React.ReactNode; hint?: string }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [reflection, setReflection] = useState<"remembered" | "repeat" | null>(null);

  return (
    <section className="recall-card">
      <div className="interactive-heading">
        <Brain size={17} />
        <div>
          <span>ВОСПРОИЗВЕДЕНИЕ</span>
          <h3>Сформулируйте ответ без подсказки</h3>
        </div>
      </div>
      <p className="recall-question">{question}</p>
      {!isRevealed ? (
        <>
          {hint && <p className="recall-hint">Подсказка: {hint}</p>}
          <button className="interactive-primary" type="button" onClick={() => setIsRevealed(true)}>
            Показать ориентир
          </button>
        </>
      ) : (
        <>
          <div className="recall-answer">{answer}</div>
          <div className="recall-actions">
            <button className={reflection === "remembered" ? "is-picked" : ""} type="button" onClick={() => setReflection("remembered")}>
              <Check size={15} /> Вспомнил сам
            </button>
            <button className={reflection === "repeat" ? "is-picked" : ""} type="button" onClick={() => setReflection("repeat")}>
              <RotateCcw size={15} /> Повторю позже
            </button>
          </div>
          {reflection === "remembered" && <p className="recall-status is-correct">Отлично. Сверните ответ и попробуйте объяснить его своими словами.</p>}
          {reflection === "repeat" && <p className="recall-status">Нормально: вернитесь к этой карточке после следующего раздела.</p>}
        </>
      )}
    </section>
  );
}

// ---------- Интерактив: квиз ----------

export function QuizCard({
  question,
  options,
  correctIndex,
  explanation,
}: {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const isDone = picked !== null;

  return (
    <div className="quiz-card">
      <div className="quiz-question">
        <Sparkles size={16} />
        <strong>{question}</strong>
      </div>
      <div className="quiz-options">
        {options.map((option, index) => {
          let stateClass = "";
          if (isDone && index === correctIndex) stateClass = "is-correct";
          else if (isDone && index === picked) stateClass = "is-wrong";
          return (
            <button
              key={option}
              type="button"
              className={`quiz-option ${stateClass}`}
              disabled={isDone}
              onClick={() => setPicked(index)}
            >
              <code>{option}</code>
            </button>
          );
        })}
      </div>
      {isDone && (
        <p className={`quiz-explanation ${picked === correctIndex ? "is-correct" : "is-wrong"}`}>
          {picked === correctIndex ? "Верно! " : "Не совсем. "}
          {explanation}
        </p>
      )}
    </div>
  );
}

// ---------- Интерактив: угадай вывод ----------

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
          {isCorrect ? <Check size={14} /> : <X size={14} />} {isCorrect ? explanation : "Попробуйте другой вариант."}
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

function shuffleOnce<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function MatchPairs({
  prompt,
  pairs,
  leftTitle = "Слева",
  rightTitle = "Справа",
  explanation,
}: {
  prompt: string;
  pairs: { left: React.ReactNode; right: React.ReactNode }[];
  leftTitle?: string;
  rightTitle?: string;
  explanation?: string;
}) {
  const rights = useMemo(() => shuffleOnce(pairs.map((pair, id) => ({ id, label: pair.right }))), [pairs]);
  const [activeLeft, setActiveLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(() => new Set());
  const [wrongId, setWrongId] = useState<number | null>(null);
  const allDone = matched.size === pairs.length;

  function pickRight(rightId: number) {
    if (activeLeft === null || matched.has(rightId)) return;
    if (activeLeft === rightId) {
      setMatched((current) => new Set(current).add(rightId));
      setActiveLeft(null);
      setWrongId(null);
    } else {
      setWrongId(rightId);
      window.setTimeout(() => setWrongId(null), 500);
    }
  }

  return (
    <section className="match-card">
      <div className="interactive-heading">
        <Link2 size={17} />
        <div>
          <span>СОПОСТАВЛЕНИЕ</span>
          <h3>Соедините пары</h3>
        </div>
      </div>
      <p className="interactive-prompt">{prompt}</p>
      <div className="match-grid">
        <div className="match-col">
          <span className="match-col-title">{leftTitle}</span>
          {pairs.map((pair, id) => (
            <button
              key={id}
              type="button"
              className={`match-item ${matched.has(id) ? "is-matched" : ""} ${activeLeft === id ? "is-active" : ""}`}
              disabled={matched.has(id)}
              onClick={() => setActiveLeft(id)}
            >
              <code>{pair.left}</code>
            </button>
          ))}
        </div>
        <div className="match-col">
          <span className="match-col-title">{rightTitle}</span>
          {rights.map((right) => (
            <button
              key={right.id}
              type="button"
              className={`match-item ${matched.has(right.id) ? "is-matched" : ""} ${wrongId === right.id ? "is-wrong" : ""}`}
              disabled={matched.has(right.id)}
              onClick={() => pickRight(right.id)}
            >
              <code>{right.label}</code>
            </button>
          ))}
        </div>
      </div>
      {allDone && (
        <p className="interactive-feedback is-correct">
          <Check size={16} /> {explanation ?? "Все пары соединены верно!"}
        </p>
      )}
    </section>
  );
}

// ---------- Интерактив: исследователь срезов ----------

export function SliceExplorer({ text, initialStart = 0, initialEnd }: { text: string; initialStart?: number; initialEnd?: number }) {
  const chars = [...text];
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd ?? chars.length);
  const result = chars.slice(start, end).join("");

  const clampStart = (value: number) => Math.max(0, Math.min(value, chars.length));
  const clampEnd = (value: number) => Math.max(0, Math.min(value, chars.length));

  return (
    <section className="slice-card">
      <div className="interactive-heading">
        <Scissors size={17} />
        <div>
          <span>СРЕЗЫ</span>
          <h3>Поиграйте с границами среза</h3>
        </div>
      </div>
      <div className="slice-strip" aria-hidden="true">
        {chars.map((char, index) => (
          <div className={`slice-char ${index >= start && index < end ? "is-selected" : ""}`} key={index}>
            <span className="slice-symbol">{char === " " ? "␣" : char}</span>
            <span className="slice-index">{index}</span>
          </div>
        ))}
        <div className="slice-char slice-char--edge">
          <span className="slice-symbol"> </span>
          <span className="slice-index">{chars.length}</span>
        </div>
      </div>

      <div className="slice-controls">
        <div className="slice-stepper">
          <span>start</span>
          <button type="button" onClick={() => setStart(clampStart(start - 1))} aria-label="start минус">
            <Minus size={14} />
          </button>
          <strong>{start}</strong>
          <button type="button" onClick={() => setStart(clampStart(start + 1))} aria-label="start плюс">
            <Plus size={14} />
          </button>
        </div>
        <div className="slice-stepper">
          <span>end</span>
          <button type="button" onClick={() => setEnd(clampEnd(end - 1))} aria-label="end минус">
            <Minus size={14} />
          </button>
          <strong>{end}</strong>
          <button type="button" onClick={() => setEnd(clampEnd(end + 1))} aria-label="end плюс">
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="slice-result">
        <code>
          text[{start}:{end}]
        </code>
        <ArrowRight size={16} />
        <code className="slice-output">"{result}"</code>
      </div>
      <p className="slice-note">Правая граница не включается: символ с индексом end в срез не попадает.</p>
    </section>
  );
}

// ---------- Интерактив: исследователь ветвлений ----------

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

export function FlipCards({ cards }: { cards: { front: React.ReactNode; back: React.ReactNode }[] }) {
  const [flipped, setFlipped] = useState<Set<number>>(() => new Set());

  function toggle(index: number) {
    setFlipped((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <section className="flip-section">
      <div className="interactive-heading">
        <Layers size={17} />
        <div>
          <span>КАРТОЧКИ</span>
          <h3>Нажмите, чтобы перевернуть</h3>
        </div>
      </div>
      <div className="flip-grid">
        {cards.map((card, index) => (
          <button
            key={index}
            type="button"
            className={`flip-card ${flipped.has(index) ? "is-flipped" : ""}`}
            onClick={() => toggle(index)}
          >
            <div className="flip-inner">
              <div className="flip-front">{card.front}</div>
              <div className="flip-back">{card.back}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

// ---------- Интерактив: правда или ложь ----------

export function TrueFalse({ statement, isTrue, explanation }: { statement: React.ReactNode; isTrue: boolean; explanation: string }) {
  const [answer, setAnswer] = useState<boolean | null>(null);
  const isCorrect = answer === isTrue;

  return (
    <section className="truefalse-card">
      <div className="truefalse-head">
        <CircleHelp size={16} />
        <p>{statement}</p>
      </div>
      <div className="truefalse-buttons">
        <button
          type="button"
          className={`${answer === true ? (isTrue ? "is-correct" : "is-wrong") : ""}`}
          disabled={answer !== null}
          onClick={() => setAnswer(true)}
        >
          Правда
        </button>
        <button
          type="button"
          className={`${answer === false ? (!isTrue ? "is-correct" : "is-wrong") : ""}`}
          disabled={answer !== null}
          onClick={() => setAnswer(false)}
        >
          Ложь
        </button>
      </div>
      {answer !== null && (
        <p className={`interactive-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}>
          {isCorrect ? <Check size={16} /> : <X size={16} />}
          {isCorrect ? "Верно. " : "На самом деле нет. "}
          {explanation}
        </p>
      )}
    </section>
  );
}

// ---------- Итоги раздела ----------

export function KeyTakeaways({ points }: { points: React.ReactNode[] }) {
  return (
    <aside className="takeaways">
      <div className="takeaways-head">
        <ListChecks size={17} />
        <strong>Главное из урока</strong>
      </div>
      <ul>
        {points.map((point, index) => (
          <li key={index}>
            <Check size={15} />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

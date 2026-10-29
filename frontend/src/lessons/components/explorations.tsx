import React, { useMemo, useState } from "react";
import { ArrowRight, Check, Layers, Link2, Minus, Plus, Scissors } from "lucide-react";

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
          <h3>Сопоставляем пары</h3>
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
              <span>{pair.left}</span>
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
              <span>{right.label}</span>
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
            aria-pressed={flipped.has(index)}
            aria-label={`Карточка ${index + 1}: ${flipped.has(index) ? "показан ответ" : "показан вопрос"}. Нажмите, чтобы перевернуть`}
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

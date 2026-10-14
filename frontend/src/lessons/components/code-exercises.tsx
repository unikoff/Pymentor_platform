import React, { useState } from "react";
import { Bug, Check, Lightbulb, ListOrdered, RotateCcw, Scale, X } from "lucide-react";
import { CodeBlock } from "../../shared/ui/code-editor/CodeEditor";

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
  title = "Собираем программу",
  label = "СОБИРАЕМ КОД",
  incorrectExplanation = "Проверьте последовательность: Python выполняет инструкции сверху вниз, а лишние фрагменты можно не добавлять.",
}: {
  prompt: string;
  pieces: CodeSequencePiece[];
  correctOrder: string[];
  explanation: string;
  title?: string;
  label?: string;
  incorrectExplanation?: string;
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
          <span>{label}</span>
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
          <span className="sequence-label">Наш порядок</span>
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
              <p className="sequence-empty">Выбираем фрагменты слева в порядке выполнения.</p>
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
          {isCorrect ? explanation : incorrectExplanation}
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
          <h3>Ищем причину ошибки</h3>
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

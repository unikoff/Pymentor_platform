import React, { useState } from "react";
import { Brain, Check, CircleHelp, RotateCcw, Sparkles, X } from "lucide-react";

export function RecallCard({ question, answer, hint }: { question: string; answer: React.ReactNode; hint?: string }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [reflection, setReflection] = useState<"remembered" | "repeat" | null>(null);

  return (
    <section className="recall-card">
      <div className="interactive-heading">
        <Brain size={17} />
        <div>
          <span>ВОСПРОИЗВЕДЕНИЕ</span>
          <h3>Формулируем ответ без подсказки</h3>
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
          {reflection === "remembered" && <p className="recall-status is-correct">Отлично. Сворачиваем ответ и объясняем его своими словами.</p>}
          {reflection === "repeat" && <p className="recall-status">Нормально: возвращаемся к этой карточке после следующего раздела.</p>}
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
              key={`${index}-${option}`}
              type="button"
              className={`quiz-option ${stateClass}`}
              disabled={isDone}
              onClick={() => setPicked(index)}
            >
              <span>{option}</span>
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

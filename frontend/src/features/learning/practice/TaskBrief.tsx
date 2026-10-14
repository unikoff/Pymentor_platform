import { Lightbulb } from "lucide-react";
import { renderPracticeText } from "./text-format";
import type { TaskContract } from "../types";

export function TaskBrief({ title, contract, examples, hints, visibleHintCount, isBusy, onRevealHint }: {
  title: string; contract: TaskContract; examples: Array<{ input: string; output: string }>;
  hints: string[]; visibleHintCount: number; isBusy: boolean; onRevealHint: () => void;
}) {
  return <>
          <h2 className="task-brief__title">{renderPracticeText(title)}</h2>
          <div className="task-spec">
            <section className="task-spec__item task-spec__item--given" aria-label="Дано">
              <span>Дано</span>
              <div className="task-spec__text">{renderPracticeText(contract.given)}</div>
              {contract.given_items && contract.given_items.length > 0 && (
                <ul className="task-spec__list">
                  {contract.given_items.map((item) => (
                    <li key={item}>{renderPracticeText(item)}</li>
                  ))}
                </ul>
              )}
            </section>
            <section className="task-spec__item task-spec__item--todo" aria-label="Нужно сделать">
              <span>Нужно сделать</span>
              <div className="task-spec__text">{renderPracticeText(contract.todo)}</div>
              {contract.todo_items && contract.todo_items.length > 0 && (
                <ol className="task-spec__list task-spec__list--ordered">
                  {contract.todo_items.map((item) => (
                    <li key={item}>{renderPracticeText(item)}</li>
                  ))}
                </ol>
              )}
              {hints.length > 0 && visibleHintCount < hints.length && (
                <button
                  className="task-hint-trigger"
                  type="button"
                  onClick={onRevealHint}
                  disabled={isBusy}
                  aria-label={visibleHintCount === 0 ? "Показать подсказку" : "Показать следующую подсказку"}
                  title={visibleHintCount === 0 ? "Показать подсказку" : "Показать следующую подсказку"}
                >
                  <Lightbulb size={14} aria-hidden="true" />
                  {visibleHintCount === 0 ? "Подсказка" : "Ещё подсказка"}
                </button>
              )}
            </section>
          </div>
          {examples.length > 0 && (
            <div className="task-examples" aria-label="Примеры ввода и вывода">
              <span className="task-examples-title">Пример ввода и вывода</span>
              {examples.map((example, index) => (
                <div className="task-example" key={`${example.input}-${example.output}-${index}`}>
                  <div className="task-example-cell">
                    <span>Ввод</span>
                    <code>{example.input}</code>
                  </div>
                  <i className="task-example-arrow" aria-hidden="true">→</i>
                  <div className="task-example-cell task-example-cell--output">
                    <span>Вывод</span>
                    <code>{example.output}</code>
                  </div>
                </div>
              ))}
            </div>
          )}
          {visibleHintCount > 0 && (
            <aside className="task-hints" aria-label="Подсказки к заданию">
              <div className="task-hints__head">
                <strong>Подсказки</strong>
                <span>{visibleHintCount} из {hints.length}</span>
              </div>
              <ol>
                {hints.slice(0, visibleHintCount).map((hint) => (
                  <li key={hint}>{renderPracticeText(hint)}</li>
                ))}
              </ol>
            </aside>
          )}
  </>;
}

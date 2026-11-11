import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, MessageSquare } from 'lucide-react';
import { highlightPython } from '../../../shared/lib/python-highlight';
import '../styles/code-review-demo.css';

type ReviewExample = {
  title: string;
  fileName: string;
  explanation: string;
  afterComment: string;
  before: string[];
  after: string[];
  fixedLines: number[];
  commentLineBefore: number;
  commentLineAfter: number;
};

const examples: ReviewExample[] = [
  {
    title: 'Сумма оценок',
    fileName: 'scores.py',
    explanation: 'На каждом шаге total заменяется текущей оценкой, поэтому предыдущая сумма теряется. Как сделать так, чтобы она сохранялась?',
    afterComment: 'Теперь total сохраняет сумму после каждого прохода, а не заменяется текущей оценкой.',
    before: ['scores = [4, 5, 3]', 'total = 0', 'for score in scores:', '    total = score', 'print(total)'],
    after: ['scores = [4, 5, 3]', 'total = 0', 'for score in scores:', '    total += score', 'print(total)'],
    fixedLines: [3],
    commentLineBefore: 3,
    commentLineAfter: 3,
  },
  {
    title: 'Среднее значение',
    fileName: 'averages.py',
    explanation: 'Если values пустой, его длина равна нулю и в этой строке происходит деление на ноль. Как функция должна вести себя в таком случае?',
    afterComment: 'Пустой список обработан заранее: для него функция возвращает None, для остальных считает среднее.',
    before: ['def average(values):', '    return sum(values) / len(values)', '', 'print(average([]))'],
    after: ['def average(values):', '    if not values:', '        return None', '    return sum(values) / len(values)', '', 'print(average([]))'],
    fixedLines: [1, 2, 3],
    commentLineBefore: 1,
    commentLineAfter: 1,
  },
  {
    title: 'Проверка дедлайна',
    fileName: 'tasks/service.py',
    before: ['def create_task(db, deadline):', '    item = Task(deadline=deadline)', '    db.add(item)', '    db.commit()', '    if deadline < now:', '        raise ValueError("Срок прошёл")', '    return item'],
    after: ['def create_task(db, deadline):', '    if deadline < now:', '        raise ValueError("Срок прошёл")', '    item = Task(deadline=deadline)', '    db.add(item)', '    db.commit()', '    return item'],
    fixedLines: [1, 2],
    explanation: 'Сейчас commit сохраняет запись до проверки срока. При просроченном дедлайне возникнет ошибка, но запись уже останется в базе. Как изменить порядок действий?',
    afterComment: 'Проверяем дедлайн до создания записи: в базу попадёт только задача, прошедшая проверку.',
    commentLineBefore: 4,
    commentLineAfter: 1,
  },
];

export function CodeReviewDemo() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showFixed, setShowFixed] = useState(false);
  const [commentOpen, setCommentOpen] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const restoreActionFocus = useRef(false);
  const commentId = useId();
  const example = examples[selectedIndex];
  const lines = showFixed ? example.after : example.before;
  const commentLine = showFixed ? example.commentLineAfter : example.commentLineBefore;

  const selectExample = (index: number) => {
    setSelectedIndex(index);
    setShowFixed(false);
    setCommentOpen(true);
    if (editorRef.current) {
      editorRef.current.scrollTop = 0;
      editorRef.current.scrollLeft = 0;
    }
  };

  useEffect(() => {
    if (restoreActionFocus.current) {
      const action = actionRef.current;
      const editor = editorRef.current;
      action?.focus({ preventScroll: true });
      if (action && editor) {
        const actionBounds = action.getBoundingClientRect();
        const editorBounds = editor.getBoundingClientRect();
        const offset = actionBounds.bottom > editorBounds.bottom - 12
          ? actionBounds.bottom - editorBounds.bottom + 12
          : actionBounds.top < editorBounds.top + 12 ? actionBounds.top - editorBounds.top - 12 : 0;
        if (offset) editor.scrollBy({ top: offset, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
      restoreActionFocus.current = false;
    }
  }, [showFixed]);

  return (
    <section className="code-review-demo" aria-label="Интерактивный пример индивидуального code review">
      <nav className="code-review-demo__examples" aria-label="Примеры код-ревью">
        {examples.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className="code-review-demo__example-button"
            aria-pressed={selectedIndex === index}
            onClick={() => selectExample(index)}
          >
            <span className="code-review-demo__example-title">{item.title}</span>
          </button>
        ))}
      </nav>

      <div className="code-review-demo__code-heading">
        <div className="code-review-demo__file"><span className="code-review-demo__filename"><span aria-hidden="true">●</span> {example.fileName}</span></div>
        <span className="code-review-demo__status" data-fixed={showFixed}>{showFixed ? <Check size={13} aria-hidden="true" /> : <MessageSquare size={13} aria-hidden="true" />}<span>{showFixed ? 'Исправлено' : 'Разбираем код'}</span></span>
      </div>
      <div className="code-review-demo__editor" ref={editorRef} role="group" tabIndex={0} aria-label={`Демонстрационный код: ${showFixed ? 'после' : 'до'} разбора`}>
        <div className="code-review-demo__code" key={selectedIndex}>{lines.map((line, index) => (
          <div className="code-review-demo__line-group" key={`code-line-${index}`}>
            <div className={`code-review-demo__line${showFixed && example.fixedLines.includes(index) ? ' code-review-demo__line--fixed' : !showFixed && index === commentLine ? ' code-review-demo__line--issue' : ''}`}>
              <span className={`code-review-demo__line-number${index === commentLine ? ' code-review-demo__line-number--commented' : ''}`}>
                {index === commentLine && <button className="code-review-demo__comment-toggle" type="button" aria-label={`${commentOpen ? 'Скрыть' : 'Показать'} комментарий к строке ${index + 1}`} title={commentOpen ? 'Скрыть комментарий' : 'Показать комментарий'} aria-expanded={commentOpen} aria-controls={commentId} onClick={() => setCommentOpen(current => !current)}><ChevronRight size={16} aria-hidden="true" /></button>}
                {index + 1}
              </span><code className="code-review-demo__line-text" key={showFixed ? 'after' : 'before'} dangerouslySetInnerHTML={{ __html: highlightPython(line || ' ') }} />
            </div>
            {index === commentLine && <div id={commentId} className={`code-review-demo__thread-wrap${commentOpen ? ' code-review-demo__thread-wrap--open' : ''}`} aria-hidden={!commentOpen}>
              <div className="code-review-demo__thread-clip"><div className="code-review-demo__thread" data-fixed={showFixed}>
              <div className="code-review-demo__thread-heading">
                <strong>Никита</strong>
                <button ref={actionRef} className="code-review-demo__action" type="button" tabIndex={commentOpen ? 0 : -1} aria-label={showFixed ? 'Вернуться к замечанию' : 'Показать исправление'} title={showFixed ? 'Вернуться к замечанию' : 'Показать исправление'} onClick={() => { restoreActionFocus.current = true; setShowFixed(current => !current); }}>
                  {showFixed ? <><ArrowLeft size={14} aria-hidden="true" /> К замечанию</> : <>Исправление <ArrowRight size={14} aria-hidden="true" /></>}
                </button>
              </div>
              <div className="code-review-demo__thread-body">
                <p className="code-review-demo__thread-text" aria-live="polite"><span key={showFixed ? 'after' : 'before'}>{showFixed ? example.afterComment : example.explanation}</span></p>
              </div>
            </div></div></div>}
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}

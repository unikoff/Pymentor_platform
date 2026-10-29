import { useState } from 'react';
import './code-review-demo.css';
import mentorPhoto from './assets/mentor.jpg';

type ReviewExample = {
  level: 'Простой' | 'Средний' | 'Сложный';
  title: string;
  fileName: string;
  topic: string;
  explanation: string;
  afterComment: string;
  before: string[];
  after: string[];
  commentLineBefore: number;
  commentLineAfter: number;
};

const examples: ReviewExample[] = [
  {
    level: 'Простой',
    title: 'Сумма оценок',
    fileName: 'scores.py',
    topic: 'Цикл · накопление значения',
    explanation: 'Здесь предыдущая сумма теряется: присваивание заменяет её текущей оценкой. Нужно прибавить значение к накопителю.',
    afterComment: 'Теперь total сохраняет сумму после каждого прохода, а не заменяется текущей оценкой.',
    before: ['scores = [4, 5, 3]', 'total = 0', 'for score in scores:', '    total = score', 'print(total)'],
    after: ['scores = [4, 5, 3]', 'total = 0', 'for score in scores:', '    total += score', 'print(total)'],
    commentLineBefore: 3,
    commentLineAfter: 3,
  },
  {
    level: 'Средний',
    title: 'Среднее значение',
    fileName: 'averages.py',
    topic: 'Функция · граничный случай',
    explanation: 'До деления проверь граничный случай: у пустого списка нет длины, на которую можно делить.',
    afterComment: 'Пустой список обработан заранее: для него функция возвращает None, для остальных считает среднее.',
    before: ['def average(values):', '    return sum(values) / len(values)', '', 'print(average([]))'],
    after: ['def average(values):', '    if not values:', '        return None', '    return sum(values) / len(values)', '', 'print(average([]))'],
    commentLineBefore: 1,
    commentLineAfter: 1,
  },
  {
    level: 'Сложный',
    title: 'Проверка дедлайна',
    fileName: 'tasks/service.py',
    topic: 'База данных · порядок операций',
    before: ['def create_task(db, deadline):', '    item = Task(deadline=deadline)', '    db.add(item)', '    db.commit()', '    if deadline < now:', '        raise ValueError("Срок прошёл")', '    return item'],
    after: ['def create_task(db, deadline):', '    if deadline < now:', '        raise ValueError("Срок прошёл")', '    item = Task(deadline=deadline)', '    db.add(item)', '    db.commit()', '    return item'],
    explanation: 'К этому моменту commit уже зафиксировал запись. Если проверка отклонит дедлайн, задача всё равно останется в базе.',
    afterComment: 'Проверяем дедлайн до создания записи: в базу попадёт только задача, прошедшая проверку.',
    commentLineBefore: 4,
    commentLineAfter: 1,
  },
];

export function CodeReviewDemo() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showFixed, setShowFixed] = useState(false);
  const example = examples[selectedIndex];
  const lines = showFixed ? example.after : example.before;
  const commentLine = showFixed ? example.commentLineAfter : example.commentLineBefore;

  const selectExample = (index: number) => {
    setSelectedIndex(index);
    setShowFixed(false);
  };

  return (
    <section className="code-review-demo" aria-label="Интерактивный пример индивидуального code review">
      <div className="code-review-demo__intro">
        <p className="code-review-demo__eyebrow">Разбор под ваш код и уровень</p>
        <p>Диагноз, объяснение и безопасный вариант исправления.</p>
      </div>
      <nav className="code-review-demo__examples" aria-label="Уровень сложности примера">
        {examples.map((item, index) => (
          <button
            key={item.level}
            type="button"
            className="code-review-demo__example-button"
            aria-pressed={selectedIndex === index}
            onClick={() => selectExample(index)}
          >
            <span className="code-review-demo__example-level">{item.level}</span>
            <span className="code-review-demo__example-title">{item.title}</span>
          </button>
        ))}
      </nav>

      <div className="code-review-demo__card">
        <div className="code-review-demo__code-card">
          <div className="code-review-demo__code-heading">
            <span className="code-review-demo__filename"><span aria-hidden="true">●</span> {example.fileName}</span>
            <span className="code-review-demo__topic">{example.topic}</span>
            <div className="code-review-demo__toggle" role="group" aria-label="Показать код до или после разбора">
              <button type="button" aria-pressed={!showFixed} onClick={() => setShowFixed(false)}>До</button>
              <button type="button" aria-pressed={showFixed} onClick={() => setShowFixed(true)}>После</button>
            </div>
          </div>
          <div className="code-review-demo__editor" role="group" aria-label={`Демонстрационный код: ${showFixed ? 'после' : 'до'} разбора`}>
            <pre className="code-review-demo__code" key={`${selectedIndex}-${showFixed ? 'after' : 'before'}`}><code>{lines.map((line, index) => (
              <span className="code-review-demo__review-group" key={`code-line-${selectedIndex}-${showFixed}-${index}`}>
                <span className={`code-review-demo__line${index === commentLine ? ` code-review-demo__line--${showFixed ? 'fixed' : 'issue'}` : ''}`}>
                  <span className="code-review-demo__line-number">{index + 1}</span><span className="code-review-demo__line-text">{line || ' '}</span>
                </span>
                {index === commentLine && (
                  <span className={`code-review-demo__thread${showFixed ? ' code-review-demo__thread--fixed' : ''}`} aria-live="polite" aria-atomic="true">
                    <span className="code-review-demo__thread-connector" aria-hidden="true" />
                    <img className="code-review-demo__avatar" src={mentorPhoto} alt="" />
                    <span className="code-review-demo__thread-body">
                      <strong>Никита <span>· наставник</span></strong>
                      <span className="code-review-demo__thread-text">{showFixed ? example.afterComment : example.explanation}</span>
                    </span>
                  </span>
                )}
              </span>
            ))}</code></pre>
          </div>
        </div>
      </div>
      <p className="code-review-demo__note">Пример демонстрационный: код не выполняется, результат показан для объяснения разбора.</p>
    </section>
  );
}

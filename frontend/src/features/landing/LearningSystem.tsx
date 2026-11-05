import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowDown, ArrowUpRight, BarChart3, BookOpen, Code2, Lightbulb, ListChecks, Map, MessagesSquare, Search, Terminal, UserRound, Wrench } from 'lucide-react';
import { CodeReviewDemo } from './CodeReviewDemo';
import { PlatformVideo } from './PlatformVideo';
import temporaryPlatformPreview from './assets/platform-preview-placeholder.webm';
import './learning-system.css';

const learningTabs = [
  { label: 'Платформа', icon: BookOpen },
  { label: 'Код-ревью', icon: Code2 },
  { label: 'Личные занятия', icon: MessagesSquare },
] as const;

const platformFeatures = [
  { icon: Map, title: 'План занятий', detail: 'Маршрут по темам' },
  { icon: BookOpen, title: 'Теория', detail: 'Материалы к занятиям' },
  { icon: ListChecks, title: 'Практика', detail: 'Задачи по темам' },
  { icon: Terminal, title: 'Интерпретатор Python', detail: 'Запуск кода' },
  { icon: UserRound, title: 'Личный кабинет', detail: 'Прогресс обучения' },
  { icon: BarChart3, title: 'Аналитика', detail: 'Активность · время обучения' },
] as const;

// Temporary video: Jet d'Eau Short Video, Michael, Wikimedia Commons, CC0.
const platformVideoUrl = import.meta.env.VITE_LANDING_PLATFORM_VIDEO_URL?.trim();
const tabForHash = (hash: string) => hash === '#platform' ? 0 : hash === '#demo' ? 1 : null;

const lessonTopics = [
  {
    icon: BookOpen, title: 'Теория', summary: 'Пройденное и следующий шаг',
    detail: 'На встрече сверяем, какие темы вы уже прошли и что осталось непонятным.',
    points: ['Разбираем сложную часть теории на примерах.', 'Связываем её с тем, что вы изучили раньше.', 'Обсуждаем, какую тему пройдём дальше и зачем.'],
  },
  {
    icon: Code2, title: 'Задания и проект', summary: 'Практика с наставником',
    detail: 'На созвоне подводим итог работы над заданиями и проектом: что получилось, а где возникли трудности.',
    points: ['Смотрим выполненные задачи и текущий этап проекта.', 'Обсуждаем ошибки и замечания после code review.', 'Разбираем сложные места и определяем следующий шаг.'],
  },
  {
    icon: Search, title: 'Ваши вопросы', summary: 'Помощь, когда застряли',
    detail: 'На встречу можно принести вопросы по теории, коду или самому процессу обучения.',
    points: ['Выясняем, что именно вызывает затруднение.', 'Разбираем причину на вашем примере.', 'Обсуждаем, как продолжить работу самостоятельно.'],
  },
  {
    icon: MessagesSquare, title: 'Собеседования', summary: 'Подготовка к работе',
    detail: 'Если готовитесь к работе, на встрече разбираем вопросы и задачи для собеседований.',
    points: ['Возвращаемся к темам, в которых не хватает уверенности.', 'При необходимости решаем задачи, в том числе на LeetCode.', 'Обсуждаем, как объяснить ход мыслей и решение.'],
  },
] as const;

export function LearningSystem() {
  const [active, setActive] = useState(() => tabForHash(window.location.hash) ?? 0);
  const [lessonTopic, setLessonTopic] = useState(0);
  const id = useId();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const syncHash = () => {
      const next = tabForHash(window.location.hash);
      if (next !== null) setActive(next);
    };
    const onLinkClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement) || link.origin !== window.location.origin || link.pathname !== window.location.pathname) return;
      const next = tabForHash(link.hash);
      if (next !== null) setActive(next);
    };
    window.addEventListener('hashchange', syncHash);
    document.addEventListener('click', onLinkClick);
    return () => {
      window.removeEventListener('hashchange', syncHash);
      document.removeEventListener('click', onLinkClick);
    };
  }, []);

  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % learningTabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + learningTabs.length) % learningTabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = learningTabs.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return <section className="landing-section learning-system" id="learning-system" aria-label="Обучение">
    <span className="learning-system__anchor" id="platform" aria-hidden="true" />
    <span className="learning-system__anchor" id="demo" aria-hidden="true" />
    <div className="learning-system__layout">
    <div className="learning-system__tabs" role="tablist" aria-label="Обучение" aria-orientation="horizontal">
      {learningTabs.map((tab, index) => {
        const Icon = tab.icon;
        return <button key={tab.label} ref={element => { tabs.current[index] = element; }} className="learning-system__tab" id={`${id}-tab-${index}`} type="button" role="tab" aria-selected={active === index} aria-controls={`${id}-panel-${index}`} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => moveFocus(event, index)}>
          <Icon size={19} strokeWidth={1.7} aria-hidden="true" /><span>{tab.label}</span>
        </button>;
      })}
    </div>
    <div className="learning-system__panels">{learningTabs.map((tab, index) => <div key={tab.label} className="learning-system__panel" id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} hidden={active !== index}>
      <div className="learning-system__panel-inner">
        {index === 0 && <>
          <div className="learning-system__copy learning-system__copy--platform">
            <h3>Изучите платформу бесплатно</h3>
            <p>Занятия и практика в одном пространстве. Посмотрите, как устроено обучение на платформе.</p>
            <ul className="learning-system__features">
              {platformFeatures.map(({ icon: Icon, title, detail }) => <li key={title}><Icon size={17} strokeWidth={1.7} aria-hidden="true" /><div><strong>{title}</strong><span>{detail}</span></div></li>)}
            </ul>
            <a className="primary-action landing-action learning-system__platform-cta" href={import.meta.env.BASE_URL}>Попробовать бесплатно <ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
          <div className="learning-system__media learning-system__media--platform">
            <PlatformVideo src={platformVideoUrl || temporaryPlatformPreview} temporary={!platformVideoUrl} />
          </div>
        </>}
        {index === 1 && <>
          <div className="learning-system__copy learning-system__copy--review">
            <h3>Учимся на вашем коде</h3>
            <p>Я не даю ответ сразу. Мы вместе разбираем решение и шаг за шагом приходим к исправлению.</p>
            <ol className="learning-system__review-steps">
              <li><Search size={22} strokeWidth={1.7} aria-hidden="true" /><div><strong>Находим ошибку</strong><span>Смотрим, где код работает не так</span></div></li>
              <li><Lightbulb size={22} strokeWidth={1.7} aria-hidden="true" /><div><strong>Разбираем причину</strong><span>Объясняю, почему она возникла</span></div></li>
              <li><Wrench size={22} strokeWidth={1.7} aria-hidden="true" /><div><strong>Ищем решение</strong><span>Вместе исправляем и проверяем код</span></div></li>
            </ol>
            <a className="primary-action landing-action learning-system__review-cta" href="#path">Обсудить свой код с наставником <ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
          <div className="learning-system__media learning-system__media--review"><CodeReviewDemo /></div>
        </>}
        {index === 2 && <>
          <div className="learning-system__copy learning-system__copy--lessons">
            <h3>Личные занятия с наставником</h3>
            <p>На созвоне разбираем то, что вызвало трудности: от теории и заданий до вопросов по проекту. Вместе подводим итоги и определяем следующий шаг, чтобы вы понимали, как двигаться дальше.</p>
            <a className="primary-action landing-action learning-system__lessons-cta" href="#path">Обсудить занятия <ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
          <div className="learning-system__media learning-system__lessons">
            <div className="learning-system__lessons-grid" role="group" aria-label="Темы личных занятий">
              {lessonTopics.map(({ icon: Icon, title, summary }, index) => <button className="learning-system__lesson-card" key={title} type="button" aria-pressed={lessonTopic === index} onClick={() => setLessonTopic(index)}>
                <Icon size={22} strokeWidth={1.7} aria-hidden="true" /><span><strong>{title}</strong><small>{summary}</small></span><ArrowDown className="learning-system__lesson-arrow" size={16} aria-hidden="true" />
              </button>)}
            </div>
            <div className="learning-system__detail-stack" aria-live="polite" aria-atomic="true">{lessonTopics.map((topic, index) => <section className="learning-system__lesson-detail" key={topic.title} hidden={lessonTopic !== index} aria-label={topic.title}>
              <strong>{topic.title}</strong><p>{topic.detail}</p><ul>{topic.points.map(point => <li key={point}>{point}</li>)}</ul>
            </section>)}</div>
          </div>
        </>}
      </div>
    </div>)}</div>
    </div>
  </section>;
}

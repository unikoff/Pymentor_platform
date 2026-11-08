import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowDown, ArrowUpRight, BarChart3, BookOpen, Code2, ListChecks, Map, MessagesSquare, Search, UserRound } from 'lucide-react';
import { CodeReviewDemo } from './CodeReviewDemo';
import { PlatformVideo } from './PlatformVideo';
import temporaryPlatformPreview from './assets/platform-preview-placeholder.webm';
import './learning-system.css';
import './platform-overview.css';
import './review-overview.css';

const learningTabs = [
  { label: 'Платформа', anchor: 'platform' },
  { label: 'Код-ревью', anchor: 'demo' },
  { label: 'Личные занятия', anchor: 'lessons' },
] as const;

const platformFeatures = [
  { icon: Map, title: 'Выберите следующую тему', detail: 'Двигайтесь по программе: от основ к новым задачам.' },
  { icon: BookOpen, title: 'Разберитесь на примерах', detail: 'Читайте объяснение и смотрите, как идея работает в коде.' },
  { icon: ListChecks, title: 'Закрепите своим решением', detail: 'Решайте задачи и запускайте Python прямо в браузере.' },
  { icon: UserRound, title: 'Ваш прогресс', detail: 'В личном кабинете' },
  { icon: BarChart3, title: 'Ваш ритм', detail: 'Активность и время занятий' },
] as const;

// Temporary video: Jet d'Eau Short Video, Michael, Wikimedia Commons, CC0.
const platformVideoUrl = import.meta.env.VITE_LANDING_PLATFORM_VIDEO_URL?.trim();
const tabForHash = (hash: string) => {
  const index = learningTabs.findIndex(tab => hash === `#${tab.anchor}`);
  return index < 0 ? null : index;
};

const lessonTopics = [
  {
    icon: BookOpen, title: 'Теория', summary: 'Понимаем сложные темы', heading: 'Разложим тему по шагам',
    detail: 'На встрече сверяем, какие темы вы уже прошли и что осталось непонятным.',
    points: ['Разбираем сложную часть теории на примерах.', 'Связываем её с тем, что вы изучили раньше.', 'Обсуждаем, какую тему пройдём дальше и зачем.'],
  },
  {
    icon: Code2, title: 'Задания и проект', summary: 'Двигаемся в разработке', heading: 'Продвинем ваш проект',
    detail: 'На созвоне подводим итог работы над заданиями и проектом: что получилось, а где возникли трудности.',
    points: ['Смотрим выполненные задачи и текущий этап проекта.', 'Обсуждаем ошибки и замечания после code review.', 'Разбираем сложные места и определяем следующий шаг.'],
  },
  {
    icon: Search, title: 'Ваши вопросы', summary: 'Находим точку затруднения', heading: 'Разберёмся там, где застряли',
    detail: 'На встречу можно принести вопросы по теории, коду или самому процессу обучения.',
    points: ['Выясняем, что именно вызывает затруднение.', 'Разбираем причину на вашем примере.', 'Обсуждаем, как продолжить работу самостоятельно.'],
  },
  {
    icon: MessagesSquare, title: 'Собеседования', summary: 'Готовимся к работе', heading: 'Подготовимся к техническому разговору',
    detail: 'Если готовитесь к работе, на встрече разбираем вопросы и задачи для собеседований.',
    points: ['Возвращаемся к темам, в которых не хватает уверенности.', 'При необходимости решаем задачи, в том числе на LeetCode.', 'Обсуждаем, как объяснить ход мыслей и решение.'],
  },
] as const;

export function LearningSystem() {
  const [active, setActive] = useState(() => tabForHash(window.location.hash) ?? 0);
  const [lessonTopic, setLessonTopic] = useState(0);
  const id = useId();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectTab = (index: number) => {
    setActive(index);
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#${learningTabs[index].anchor}`);
  };

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
    selectTab(next);
    tabs.current[next]?.focus({ preventScroll: true });
  };

  return <section className="landing-section learning-system" id="learning-system" aria-label="Обучение">
    <span className="learning-system__anchor" id="platform" aria-hidden="true" />
    <span className="learning-system__anchor" id="demo" aria-hidden="true" />
    <span className="learning-system__anchor" id="lessons" aria-hidden="true" />
    <div className="learning-system__layout">
    <div className="learning-system__tabs" role="tablist" aria-label="Обучение" aria-orientation="horizontal">
      {learningTabs.map((tab, index) => {
        return <button key={tab.label} ref={element => { tabs.current[index] = element; }} className="learning-system__tab" id={`${id}-tab-${index}`} type="button" role="tab" aria-label={tab.label} aria-selected={active === index} aria-controls={`${id}-panel-${index}`} tabIndex={active === index ? 0 : -1} onClick={() => selectTab(index)} onKeyDown={event => moveFocus(event, index)}>
          <span className="learning-system__tab-label"><strong>{tab.label}</strong></span>
        </button>;
      })}
    </div>
    <div className="learning-system__panels">{learningTabs.map((tab, index) => <div key={tab.label} className="learning-system__panel" id={`${id}-panel-${index}`} role="tabpanel" aria-labelledby={`${id}-tab-${index}`} hidden={active !== index}>
      <div className="learning-system__panel-inner">
        {index === 0 && <>
          <div className="learning-system__copy learning-system__copy--platform platform-overview">
            <div className="platform-overview__header">
              <h3>Изучайте Python.<br /><span>Сразу применяйте.</span></h3>
              <p>Теория и практика собраны в один маршрут. Разбирайтесь на примерах, закрепляйте каждую тему задачами и пишите код прямо в браузере.</p>
            </div>
            <div className="platform-overview__content">
              <ol className="platform-overview__route" aria-label="Как проходит занятие">
                {platformFeatures.slice(0, 3).map(({ title, detail }, index) => <li key={title}>
                  <span className="platform-overview__step-number" aria-hidden="true">0{index + 1}</span>
                  <div><strong>{title}</strong><span>{detail}</span></div>
                </li>)}
              </ol>
              <ul className="platform-overview__tools" aria-label="Прогресс и активность">
                {platformFeatures.slice(3).map(({ icon: Icon, title, detail }) => <li key={title}>
                  <Icon size={19} strokeWidth={1.6} aria-hidden="true" />
                  <div><strong>{title}</strong><span>{detail}</span></div>
                </li>)}
              </ul>
            </div>
            <div className="platform-overview__start"><a className="primary-action landing-action learning-system__platform-cta" href={import.meta.env.BASE_URL}>Попробовать платформу бесплатно <ArrowUpRight size={17} aria-hidden="true" /></a></div>
          </div>
          <div className="learning-system__media learning-system__media--platform">
            <PlatformVideo src={platformVideoUrl || temporaryPlatformPreview} temporary={!platformVideoUrl} active={active === 0} />
          </div>
        </>}
        {index === 1 && <>
          <div className="learning-system__copy learning-system__copy--review review-overview">
            <div className="review-overview__header">
              <span className="review-overview__eyebrow">КОД-РЕВЬЮ С НАСТАВНИКОМ</span>
              <h3>Понимайте свой код.<br /><span>Улучшайте решения.</span></h3>
              <p>Разбираю ваш код из задач и проекта: отмечаю проблемные места, объясняю причины и помогаю найти исправление.</p>
            </div>
            <div className="review-overview__content">
              <ol className="review-overview__steps" aria-label="Что даёт код-ревью">
                <li><span aria-hidden="true">01</span><div><strong>Видите, где ошибка</strong><p>Замечание привязано к конкретной строке вашего кода.</p></div></li>
                <li><span aria-hidden="true">02</span><div><strong>Разбираетесь в причине</strong><p>Обсуждаем логику решения и проверяем предположения.</p></div></li>
                <li><span aria-hidden="true">03</span><div><strong>Дорабатываете осознанно</strong><p>Вносите правку и проверяете, что изменилось в работе кода.</p></div></li>
              </ol>
              <div className="review-overview__takeaway"><Code2 size={22} strokeWidth={1.6} aria-hidden="true" /><div><span>НАВЫК, КОТОРЫЙ РАЗВИВАЕМ</span><p>Объяснять свои решения и замечать похожие ошибки в следующих задачах.</p></div></div>
            </div>
            <div className="review-overview__start"><a className="primary-action landing-action learning-system__review-cta" href="#path">Обсудить обучение с ревью <ArrowUpRight size={17} aria-hidden="true" /></a><span>На первой встрече обсудим ваш уровень и задачи</span></div>
          </div>
          <div className="learning-system__media learning-system__media--review"><CodeReviewDemo /></div>
        </>}
        {index === 2 && <>
          <div className="learning-system__copy learning-system__copy--lessons">
            <h3>Личные занятия <span>с наставником</span></h3>
            <p>На встречах разбираем сложные темы, ваш код и вопросы по проекту. В конце намечаем следующий шаг, чтобы между занятиями вы знали, над чем работать.</p>
            <a className="primary-action landing-action learning-system__lessons-cta" href="#path">Обсудить занятия <ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
          <div className="learning-system__media learning-system__lessons">
            <div className="learning-system__lessons-grid" role="group" aria-label="Темы личных занятий">
              {lessonTopics.map(({ icon: Icon, title, summary }, index) => <button className="learning-system__lesson-card" key={title} type="button" aria-pressed={lessonTopic === index} onClick={() => setLessonTopic(index)}>
                <Icon size={22} strokeWidth={1.7} aria-hidden="true" /><span><strong>{title}</strong><small>{summary}</small></span><ArrowDown className="learning-system__lesson-arrow" size={16} aria-hidden="true" />
              </button>)}
            </div>
            <div className="learning-system__detail-stack" aria-live="polite" aria-atomic="true">{lessonTopics.map((topic, index) => <section className="learning-system__lesson-detail" key={topic.title} hidden={lessonTopic !== index} aria-label={topic.title}>
              <strong>{topic.heading}</strong><p>{topic.detail}</p><ul>{topic.points.map((point, pointIndex) => <li key={point}><span aria-hidden="true">0{pointIndex + 1}</span>{point}</li>)}</ul>
            </section>)}</div>
          </div>
        </>}
      </div>
    </div>)}</div>
    </div>
  </section>;
}

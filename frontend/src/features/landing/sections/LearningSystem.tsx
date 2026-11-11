import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowRight, ArrowUpRight, BarChart3, BookOpen, Code2, ListChecks, Map, MessageCircle, UserRound } from 'lucide-react';
import { CodeReviewDemo } from '../components/CodeReviewDemo';
import { PlatformVideo } from '../components/PlatformVideo';
import { platformUrl } from '../../../shared/paths';
import platformPreview from '../assets/platform-overview-portrait.mp4';
import '../styles/learning-system.css';
import '../styles/platform-overview.css';
import '../styles/review-overview.css';
import '../styles/lessons-overview.css';

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

const platformVideoUrl = import.meta.env.VITE_LANDING_PLATFORM_VIDEO_URL?.trim();
const tabForHash = (hash: string) => {
  const index = learningTabs.findIndex(tab => hash === `#${tab.anchor}`);
  return index < 0 ? null : index;
};

const lessonTopics = [
  {
    title: 'Сложная тема', question: 'Понимаю функции по отдельности, но теряюсь, когда они работают вместе',
    steps: ['Уточним, на каких данных возникает сложность.', 'На примере проследим, что одна функция передаёт другой.', 'Вернёмся к вашему коду и попробуем тот же подход.'],
    flow: ['Данные', 'Функции', 'Результат'],
    next: 'Примените подход в новой задаче.',
    wrapup: 'Повторим, как данные идут по цепочке.',
    check: 'Что вернёт функция с другими данными?',
  },
  {
    title: 'Проект', question: 'Застрял на задаче в проекте и не понимаю, с какой части начать?',
    steps: ['Посмотрим на текущий код и найдём место, где возникла сложность.', 'Разделим задачу на небольшие части и выберем, с чего начать.', 'Вместе попробуем первый шаг и обсудим результат.'],
    flow: ['Задача', 'Разбор', 'Первый шаг'],
    next: 'Продолжите работу с выбранного шага.',
    wrapup: 'Определим следующий шаг в проекте.',
    check: 'Что заработает после первого шага?',
  },
  {
    title: 'Собеседование', question: 'Решаю задачи, но сложно объяснить вслух, почему выбрал именно такой способ',
    steps: ['Вы расскажете о решении и объясните ход мыслей.', 'Обсудим вопросы, которые могут возникнуть на собеседовании.', 'Уточним ответ и попробуем объяснить решение ещё раз.'],
    flow: ['Решение', 'Вопрос', 'Объяснение'],
    next: 'Объясните решение другой задачи.',
    wrapup: 'Обсудим, что улучшить в ответе.',
    check: 'Почему выбрано это решение?',
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
              <h3>Изучайте Python<br /><span>Сразу применяйте</span></h3>
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
            <div className="platform-overview__start"><a className="primary-action landing-action learning-system__platform-cta" href={platformUrl}>Попробовать платформу бесплатно <ArrowUpRight size={17} aria-hidden="true" /></a></div>
          </div>
          <div className="learning-system__media learning-system__media--platform">
            <PlatformVideo src={platformVideoUrl || platformPreview} temporary={false} active={active === 0} />
          </div>
        </>}
        {index === 1 && <>
          <div className="learning-system__copy learning-system__copy--review review-overview">
            <div className="review-overview__header">
              <h3>Разбирайте свой код<br /><span>Улучшайте решения</span></h3>
              <p>Разбираю ваши решения и код проекта: показываю проблемные места, объясняю причины и помогаю найти исправление.</p>
            </div>
            <div className="review-overview__content">
              <ol className="review-overview__steps" aria-label="Что даёт код-ревью">
                <li><span aria-hidden="true">01</span><div><strong>Находите проблемное место</strong><p>Видите замечание рядом с конкретной строкой кода.</p></div></li>
                <li><span aria-hidden="true">02</span><div><strong>Понимаете причину</strong><p>Разбираете, как работает решение и почему возникает ошибка.</p></div></li>
                <li><span aria-hidden="true">03</span><div><strong>Дорабатываете решение</strong><p>Исправляете код и проверяете, что изменилось.</p></div></li>
              </ol>
              <div className="review-overview__takeaway"><Code2 size={22} strokeWidth={1.6} aria-hidden="true" /><div><span>НАВЫК, КОТОРЫЙ РАЗВИВАЕМ</span><p>Объяснять свои решения и замечать похожие ошибки в следующих задачах.</p></div></div>
            </div>
            <div className="review-overview__start"><button className="primary-action landing-action learning-system__review-cta" type="button" data-consultation-trigger>Обсудить обучение с ревью <ArrowUpRight size={17} aria-hidden="true" /></button></div>
          </div>
          <div className="learning-system__media learning-system__media--review"><CodeReviewDemo /></div>
        </>}
        {index === 2 && <>
          <div className="learning-system__copy lesson-overview">
            <div className="lesson-overview__header">
              <h3>Разберём сложное<br /><span>вместе</span></h3>
              <p>На личных занятиях идём от ваших вопросов: разбираем тему, работаем с кодом и находим следующий шаг в проекте.</p>
            </div>
            <div className="lesson-overview__benefits" aria-label="Как проходят занятия">
              <div><span className="lesson-overview__number" aria-hidden="true">01</span><p><strong>Один на один</strong><span>Объясняю в вашем темпе и возвращаюсь к тому, что осталось непонятным.</span></p></div>
              <div><span className="lesson-overview__number" aria-hidden="true">02</span><p><strong>На ваших задачах</strong><span>Вместе разбираем конкретный код, вопросы и трудности в проекте.</span></p></div>
              <div><span className="lesson-overview__number" aria-hidden="true">03</span><p><strong>С пониманием следующего шага</strong><span>В конце встречи намечаем, над чем работать дальше.</span></p></div>
            </div>
            <button className="primary-action landing-action learning-system__lessons-cta" type="button" data-consultation-trigger>Обсудить занятия <ArrowUpRight size={17} aria-hidden="true" /></button>
          </div>
          <div className="learning-system__media lesson-preview">
            <div className="lesson-preview__intro"><h4>С чем хотите разобраться?</h4></div>
            <div className="lesson-preview__choices" role="group" aria-label="Примеры запросов на занятие">
              {lessonTopics.map(({ title }, index) => <button key={title} type="button" aria-pressed={lessonTopic === index} onClick={() => setLessonTopic(index)}>{title}</button>)}
            </div>
            <div className="lesson-preview__example" aria-live="polite" aria-atomic="true">
              <div className="lesson-preview__question"><span>ПРИМЕР ВАШЕГО ЗАПРОСА</span><p>«{lessonTopics[lessonTopic].question}»</p></div>
              <div className="lesson-preview__path">
                <div className="lesson-preview__stage lesson-preview__stage--meeting"><div className="lesson-preview__stage-title"><span className="lesson-preview__stage-icon" aria-hidden="true"><MessageCircle size={20} strokeWidth={1.7} /></span><strong>На встрече</strong></div><div className="lesson-preview__flow" key={lessonTopic} aria-hidden="true">{lessonTopics[lessonTopic].flow.map((item, index) => <span className="lesson-preview__flow-item" key={item}><span>{item}</span>{index < 2 && <ArrowRight size={16} />}</span>)}</div><ul>{lessonTopics[lessonTopic].steps.map(step => <li key={step}>{step}</li>)}</ul></div>
                <div className="lesson-preview__stage lesson-preview__stage--after"><div className="lesson-preview__stage-title"><span className="lesson-preview__stage-icon" aria-hidden="true"><ArrowUpRight size={20} strokeWidth={1.7} /></span><strong>В конце занятия</strong></div><div className="lesson-preview__bridge" aria-hidden="true"><span>Встреча</span><ArrowRight size={16} /><span>Практика</span></div><p>{lessonTopics[lessonTopic].wrapup}</p><div className="lesson-preview__stage-note"><strong>После встречи</strong><span>{lessonTopics[lessonTopic].next}</span></div><div className="lesson-preview__stage-check"><strong>Для самопроверки</strong><span>{lessonTopics[lessonTopic].check}</span></div></div>
              </div>
            </div>
            <div className="lesson-preview__foot"><span className="lesson-preview__dot" aria-hidden="true" /> Содержание встречи зависит от вашего запроса</div>
          </div>
        </>}
      </div>
    </div>)}</div>
    </div>
  </section>;
}

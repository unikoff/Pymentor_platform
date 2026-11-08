import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, CircleCheck, CircleX, X } from 'lucide-react';
import candidatePhotoBefore from './assets/resume-before.jpeg';
import candidatePhotoAfter from './assets/resume-after.jpeg';
import './career-launch.css';

type Side = 'before' | 'after';
type Field = 'summary' | 'about' | 'experience' | 'skills' | 'soft';
type HintKey = `${Side}-${Field}`;
const explanations: Record<Side, Partial<Record<Field, string>>> = {
  before: {
    summary: 'До: резюме не задаёт целевую роль и не показывает, почему кандидата стоит позвать на backend-вакансию.',
    about: 'Общие качества не доказывают уровень: непонятно, что кандидат умеет делать в backend.',
    experience: 'Обязанности перечислены без результата. Рекрутер не видит личный вклад и релевантность backend-позиции.',
    skills: 'Технологии и личные качества смешаны: неясно, чем кандидат реально владеет и где это применял.',
  },
  after: {
    summary: 'После: с первой строки понятны роль, стек и критерий, по которому оценивать кандидата.',
    about: 'Позиционирование сразу называет роль, стек и тип задач, за которые кандидат готов отвечать.',
    skills: 'Технический стек вынесен отдельно: рекрутер сопоставляет его с требованиями вакансии за несколько секунд.',
    soft: 'Soft skills подтверждены действием в работе, а не словами «ответственный» или «коммуникабельный».',
    experience: 'Каждая роль раскрывает контекст, действие, стек и измеримый эффект для команды.',
  },
};
const fieldNames: Record<Field, string> = { summary: 'Позиционирование', about: 'О себе', experience: 'Опыт работы', skills: 'Навыки', soft: 'Soft skills в действии' };
type Hint = { key: HintKey; text: string };
type Point = { x: number; y: number };
function ResumeField({ field, side, active, onShow, onHide, tooltipId, children, className = '' }: {
  field: Field; side: Side; active: HintKey | undefined; onShow: (hint: Hint, trigger: HTMLElement, point?: Point) => void; onHide: (key: HintKey) => void; tooltipId: string; children: ReactNode; className?: string;
}) {
  const key: HintKey = `${side}-${field}`;
  const hint = { key, text: explanations[side][field] ?? '' };
  return <button type="button" className={`career-cv__field ${className}`} aria-label={`${side === 'before' ? 'До' : 'После'}: ${fieldNames[field]}`} data-active={active === key || undefined} aria-describedby={active === key ? tooltipId : undefined}
    onPointerEnter={event => { if (event.pointerType !== 'touch') onShow(hint, event.currentTarget, { x: event.clientX, y: event.clientY }); }}
    onPointerMove={event => { if (event.pointerType !== 'touch') onShow(hint, event.currentTarget, { x: event.clientX, y: event.clientY }); }}
    onPointerLeave={event => { if (event.pointerType !== 'touch') onHide(key); }} onFocus={event => onShow(hint, event.currentTarget)} onBlur={() => onHide(key)} onClick={event => onShow(hint, event.currentTarget, event.detail ? { x: event.clientX, y: event.clientY } : undefined)}>{children}</button>;
}
export function CareerLaunch() {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const dialogBody = useRef<HTMLDivElement>(null);
  const backdropPress = useRef(false);
  const [side, setSide] = useState<Side>('after');
  const [hint, setHint] = useState<Hint | null>(null);
  const activeHint = useRef<HintKey | null>(null);
  const hintTrigger = useRef<HTMLElement | null>(null);
  const pointerDriven = useRef(false);
  const tooltip = useRef<HTMLDivElement>(null);
  const pointer = useRef<Point>({ x: 0, y: 0 });
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const positionFrame = useRef<number>();
  const tooltipId = `${id}-tooltip`;
  const clearHideTimer = () => window.clearTimeout(hideTimer.current);
  const hideHint = useCallback(() => {
    window.clearTimeout(hideTimer.current);
    if (positionFrame.current !== undefined) cancelAnimationFrame(positionFrame.current);
    positionFrame.current = undefined;
    activeHint.current = null;
    hintTrigger.current = null;
    setHint(null);
  }, []);
  const positionTooltip = useCallback(() => {
    if (!tooltip.current || !dialog.current || !activeHint.current) return;
    const bounds = dialog.current.getBoundingClientRect();
    const size = tooltip.current.getBoundingClientRect();
    const padding = 12;
    let left = pointer.current.x + 12;
    let top = pointer.current.y + 12;
    if (left + size.width > bounds.right - padding) left = pointer.current.x - size.width - 12;
    if (top + size.height > bounds.bottom - padding) top = pointer.current.y - size.height - 12;
    left = Math.max(bounds.left + padding, Math.min(left, bounds.right - size.width - padding));
    top = Math.max(bounds.top + padding, Math.min(top, bounds.bottom - size.height - padding));
    tooltip.current.style.setProperty('--tooltip-x', `${left}px`);
    tooltip.current.style.setProperty('--tooltip-y', `${top}px`);
  }, []);
  const showHint = (next: Hint, trigger: HTMLElement, point?: Point) => {
    clearHideTimer();
    hintTrigger.current = trigger;
    pointerDriven.current = !!point;
    if (point) pointer.current = point;
    else {
      const bounds = trigger.getBoundingClientRect();
      pointer.current = { x: bounds.left + bounds.width / 2, y: bounds.top + Math.min(bounds.height / 2, 28) };
    }
    if (activeHint.current !== next.key) {
      activeHint.current = next.key;
      setHint(next);
    } else if (positionFrame.current === undefined) {
      positionFrame.current = requestAnimationFrame(() => { positionFrame.current = undefined; positionTooltip(); });
    }
  };
  const scheduleHide = (key: HintKey) => {
    if (activeHint.current !== key) return;
    clearHideTimer();
    hideTimer.current = setTimeout(hideHint, 120);
  };
  const handleResumeScroll = () => {
    const trigger = hintTrigger.current;
    if (activeHint.current && !pointerDriven.current && document.activeElement === trigger && trigger) {
      const bounds = trigger.getBoundingClientRect();
      pointer.current = { x: bounds.left + bounds.width / 2, y: bounds.top + Math.min(bounds.height / 2, 28) };
      positionTooltip();
    } else hideHint();
  };
  useLayoutEffect(() => { if (hint) positionTooltip(); }, [hint, positionTooltip]);
  useEffect(() => {
    window.addEventListener('resize', hideHint);
    return () => {
      window.removeEventListener('resize', hideHint);
      window.clearTimeout(hideTimer.current);
      if (positionFrame.current !== undefined) cancelAnimationFrame(positionFrame.current);
    };
  }, [hideHint]);
  const openComparison = () => {
    if (dialog.current?.open) return;
    dialog.current?.showModal();
    dialogBody.current?.scrollTo({ top: 0 });
  };
  const resumeField = (resumeSide: Side, name: Field, children: ReactNode, className = '') => <ResumeField side={resumeSide} field={name} active={hint?.key} onShow={showHint} onHide={scheduleHide} tooltipId={tooltipId} className={className}>{children}</ResumeField>;
  return <section className="landing-section career-launch landing-reveal" id="career" aria-labelledby={`${id}-title`} data-reveal>
    <h2 id={`${id}-title`}>Менторство<br /><span>ваш ключ к работе</span></h2>
    <div className="career-launch__offer">
      <article className="career-card">
        <div className="career-card__top"><span className="career-card__number">01</span><span>Легенда</span></div>
        <h3>Разработка легенды<br /><span>для трудоустройства</span></h3>
        <p className="career-card__text">Составим историю вашего опыта: проекты, задачи и личный вклад. Подготовим ответы на вопросы работодателя.</p>
        <p className="career-card__result">Готовая самопрезентация для интервью</p>
      </article>
      <button className="career-card career-card--resume" type="button" aria-label="Сравнить резюме до и после" aria-haspopup="dialog" aria-controls={`${id}-dialog`} onClick={openComparison}>
        <span className="career-card__top"><span className="career-card__number">02</span><span>Резюме</span><span className="career-card__versions">До / После</span></span>
        <strong className="career-card__title">Разбор резюме<br /><span>на личных встречах</span></strong>
        <span className="career-card__text">Вместе соберём резюме под ваши вакансии и доработаем каждый раздел.</span>
        <span className="career-card__action"><span>Сравнить резюме</span><ArrowUpRight size={21} aria-hidden="true" /></span>
      </button>
      <article className="career-card">
        <div className="career-card__top"><span className="career-card__number">03</span><span>Рассылка</span></div>
        <h3>Доступ к каналам<br /><span>с вакансиями</span></h3>
        <p className="career-card__text">Подключим к нашим рассылкам с предложениями, которые сложно найти на обычных площадках.</p>
        <p className="career-card__result">Новые возможности для откликов</p>
      </article>
    </div>
    <div className="career-launch__cta">
      <p><strong>Учимся с целью выйти на работу</strong></p>
      <a href="#path">Обсудить подготовку к работе <ArrowUpRight size={20} aria-hidden="true" /></a>
    </div>
    <dialog ref={dialog} id={`${id}-dialog`} className="career-dialog" aria-labelledby={`${id}-dialog-title`} aria-describedby={`${id}-dialog-description`}
      onScroll={handleResumeScroll}
      onClose={() => { setSide('after'); hideHint(); backdropPress.current = false; }}
      onCancel={event => { if (activeHint.current) { event.preventDefault(); hideHint(); } }}
      onPointerDown={event => { const bounds = event.currentTarget.getBoundingClientRect(); backdropPress.current = event.target === event.currentTarget && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom); }}
      onClick={event => { if (event.target === event.currentTarget && backdropPress.current) event.currentTarget.close(); if (!(event.target instanceof Element) || !event.target.closest('.career-cv__field, .career-tooltip')) hideHint(); backdropPress.current = false; }}>
      <div className="career-dialog__header">
        <div><p className="career-dialog__eyebrow">Разбор резюме</p><h3 id={`${id}-dialog-title`}>Ваше резюме <span>до и после</span></h3><p id={`${id}-dialog-description`}>Наведите курсор на раздел или нажмите на него, чтобы увидеть пояснение.</p></div>
        <button className="career-dialog__close" type="button" autoFocus aria-label="Закрыть сравнение резюме" onClick={() => dialog.current?.close()}><X size={22} aria-hidden="true" /></button>
      </div>
      <div className="career-dialog__body" ref={dialogBody} onScroll={handleResumeScroll}>
        <div className="career-dialog__switch" role="group" aria-label="Версия резюме">
          <button type="button" aria-pressed={side === 'before'} onClick={() => { setSide('before'); hideHint(); }}>До</button>
          <button type="button" aria-pressed={side === 'after'} onClick={() => { setSide('after'); hideHint(); }}>После</button>
        </div>
        <div className="career-dialog__documents" data-mobile-side={side}>
          <article className="career-cv career-cv--before" aria-label="Резюме до доработки">
            {resumeField('before', 'summary', <><span>01 / До</span><span>Ценность скрыта</span></>, 'career-cv__label')}
            <div className="career-cv__person"><img src={candidatePhotoBefore} alt="" width="44" height="44" /><strong>Лёша Иванов</strong></div>
            <p className="career-cv__role">Программист</p>
            {resumeField('before', 'about', <><span className="career-cv__heading">О себе</span><span>Ищу работу backend-разработчиком. Быстро учусь, коммуникабельный, ответственный. Готов выполнять любые задачи.</span></>)}
            {resumeField('before', 'experience', <><span className="career-cv__heading">Опыт работы</span><span className="career-cv__job career-cv__job--irrelevant"><span className="career-cv__date">2019–2021</span><strong>Курьер, доставка еды</strong><span>Работал курьером в сервисе доставки еды. Забирал заказы в ресторанах и развозил их по разным районам города. Поддерживал связь с клиентами при задержках. Соблюдал график смен и требования сервиса.</span></span><span className="career-cv__job"><span className="career-cv__date">2022–2023</span><strong>Оператор поддержки</strong><span>Принимал обращения клиентов в чате и по почте. Проверял статусы заявок во внутренних системах. Заполнял рабочие таблицы и передавал ошибки разработчикам. Отвечал на вопросы менеджеров по проблемным заказам.</span></span><span className="career-cv__job"><span className="career-cv__date">2024</span><strong>Стажёр backend</strong><span>Делал задачи на Python в учебном сервисе. Работал с FastAPI и PostgreSQL. Исправлял ошибки в API и добавлял новые endpoints. Писал тесты и участвовал в код-ревью.</span></span></>)}
            {resumeField('before', 'skills', <><span className="career-cv__heading">Навыки</span><span>Python, FastAPI, PostgreSQL, Docker, Git, коммуникабельность, ответственность.</span></>)}
            <p className="career-cv__verdict"><CircleX size={17} aria-hidden="true" /><span>Рекрутер видит опыт, но не понимает твой уровень и пользу для команды.</span></p>
          </article>
          <article className="career-cv career-cv--after" aria-label="Резюме после доработки">
            {resumeField('after', 'summary', <><span>02 / После</span><span>Язык вакансии</span></>, 'career-cv__label')}
            <div className="career-cv__person"><img src={candidatePhotoAfter} alt="" width="44" height="44" /><strong>Алексей Иванов</strong></div>
            <p className="career-cv__role">Junior Backend Developer</p>
            {resumeField('after', 'about', <><span className="career-cv__heading">О себе</span><span>Junior Backend Developer с практикой в Python, FastAPI, REST API, PostgreSQL и Docker. Собираю сервисы, которые снимают ручную работу, и отвечаю за результат задачи до релиза.</span></>)}
            {resumeField('after', 'skills', <><span className="career-cv__heading">Hard skills</span><span className="career-cv__skills">{['FastAPI', 'PostgreSQL', 'SQLAlchemy', 'Docker', 'Pytest'].map(skill => <span key={skill}>{skill}</span>)}</span></>)}
            {resumeField('after', 'soft', <><span className="career-cv__heading">Soft skills в действии</span><span>Декомпозирую задачи, фиксирую риски в PR, синхронизируюсь с командой и довожу изменение до релиза.</span></>)}
            {resumeField('after', 'experience', <><span className="career-cv__heading">Опыт и результат</span><span className="career-cv__job"><span className="career-cv__date">2022–2023</span><strong>Оператор поддержки · автоматизация</strong><span>Разобрал повторяющиеся причины задержек в доставке. Написал Python-скрипт, который собирал статусы заявок из выгрузок. Добавил проверку пустых данных перед формированием отчёта. Сократил подготовку ежедневной сводки с двух часов до 25 минут. Решение освободило команде около шести часов в неделю и показало опыт работы с данными.</span></span><span className="career-cv__job"><span className="career-cv__date">2024</span><strong>Стажёр backend · FastAPI</strong><span>На стажировке разделил API- и сервисный слои, чтобы бизнес-правила тестировались отдельно от HTTP. Вынес проверку тарифов и статусов в FastAPI-сервис. Это ускорило обработку заявок на <b>38%</b>. Добавил Pydantic-валидацию, логирование и единый формат ошибок. Покрыл критические сценарии Pytest-тестами и подготовил Docker-окружение для запуска проекта.</span></span></>)}
            <p className="career-cv__verdict"><CircleCheck size={17} aria-hidden="true" /><span>За 20 секунд рекрутер видит роль, стек, вклад и подтверждённый результат.</span></p>
          </article>
        </div>
        <p className="career-dialog__disclaimer">Учебный пример. Цифры иллюстрируют результат кандидата. В вашем резюме указываем только реальный опыт и подтверждённые результаты.</p>
      </div>
      <div ref={tooltip} id={tooltipId} className="career-tooltip" role="tooltip" hidden={!hint} onPointerEnter={clearHideTimer} onPointerLeave={() => { if (hint) scheduleHide(hint.key); }}>{hint?.text}</div>
    </dialog>
  </section>;
}

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import candidatePhoto from './assets/resume-example-portrait.png';
import './career-launch.css';

type Side = 'before' | 'after';
type Field = 'role' | 'about' | 'experience' | 'skills' | 'soft';
type Note = { side: Side; field: Field; left: number; top: number; below: boolean };

const explanations: Record<Side, Record<Field, string>> = {
  before: {
    role: 'До: резюме не задаёт целевую роль и не показывает, почему кандидата стоит позвать на backend-вакансию.',
    about: 'До: общие качества и готовность к любой работе не объясняют, какие задачи кандидат уже умеет решать.',
    experience: 'До: перечислены обязанности, но не видны вклад кандидата, используемые технологии и результат работы.',
    skills: 'До: технологии и личные качества смешаны в один список. Их связь с реальными задачами остаётся неясной.',
    soft: 'До: слова о коммуникабельности и ответственности ничем не подкреплены.',
  },
  after: {
    role: 'После: целевая роль и направление разработки видны сразу. Рекрутеру проще сопоставить резюме с вакансией.',
    about: 'После: коротко обозначены специализация, стек и задачи, которые кандидат умеет доводить до результата.',
    experience: 'После: показываем задачу, своё действие и подтверждённый результат. Цифры используем только тогда, когда можем их объяснить.',
    skills: 'После: прикладной стек вынесен отдельно и подтверждается описанием проекта и выполненных задач.',
    soft: 'После: личные качества показаны через действия — декомпозицию, работу с рисками и взаимодействие с командой.',
  },
};

const services = [
  { label: 'Позиционирование', title: 'Твой опыт звучит убедительно', text: 'Упаковываем реальные задачи, проекты и стек. Никакой выдумки, только понятная польза для команды.' },
  { label: 'Первые отклики', title: 'Не отпускаем после резюме', text: 'Делаем версии под вакансии и сообщения рекрутерам. Разбираем ответы и сразу меняем стратегию.' },
  { label: 'Поддержка в поиске', title: 'Каждый шаг под контролем', text: 'Трекер, приоритеты и следующий ход всегда под рукой. Поиск не превращается в одиночный марафон.' },
];

function ResumeJob({ date, title, children, muted = false }: { date: string; title: string; children: ReactNode; muted?: boolean }) {
  return <span className={`career-resume__job${muted ? ' career-resume__job--muted' : ''}`}>
    <span className="career-resume__date">{date}</span><span><strong>{title}</strong><span className="career-resume__job-text">{children}</span></span>
  </span>;
}

export function CareerLaunch() {
  const id = useId();
  const compare = useRef<HTMLDivElement>(null);
  const pinned = useRef<string | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const [mobileSide, setMobileSide] = useState<Side>('after');

  const closeNote = () => { pinned.current = null; setNote(null); };

  useEffect(() => {
    const outside = (event: Event) => {
      if (event.target instanceof Element && compare.current?.contains(event.target) && event.target.closest('[data-resume-note]')) return;
      pinned.current = null;
      setNote(null);
    };
    const resize = () => { pinned.current = null; setNote(null); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    window.addEventListener('resize', resize);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const showNote = (side: Side, field: Field, target: HTMLButtonElement) => {
    const shell = compare.current?.getBoundingClientRect();
    if (!shell) return;
    const bounds = target.getBoundingClientRect();
    const width = Math.min(350, shell.width - 24);
    const below = (bounds.top < 200 || bounds.top - shell.top < 90) && bounds.bottom + 180 < window.innerHeight;
    const anchorTop = below ? bounds.bottom + 10 : Math.max(275, Math.min(bounds.top - 10, window.innerHeight - 12));
    const anchorLeft = side === 'before' ? bounds.right - width * .6 : bounds.left - width * .4;
    setNote({
      side, field, below,
      left: Math.max(12, Math.min(shell.width - width - 12, anchorLeft - shell.left)),
      top: anchorTop - shell.top,
    });
  };

  const zone = (side: Side, field: Field, label: string, children: ReactNode, className = '') => {
    const key = `${side}-${field}`;
    const active = note?.side === side && note.field === field;
    return <button className={`career-resume__zone ${className}`} type="button" data-resume-note={key} data-active={active} aria-label={`Пояснение: ${side === 'before' ? 'до' : 'после'} — ${label}`} aria-describedby={active ? `${id}-note` : undefined}
      onPointerEnter={event => { if (event.pointerType !== 'touch' && !pinned.current) showNote(side, field, event.currentTarget); }}
      onPointerLeave={() => { if (!pinned.current) setNote(null); }}
      onFocus={event => { if (pinned.current !== key) pinned.current = null; showNote(side, field, event.currentTarget); }}
      onBlur={() => { if (!pinned.current) setNote(null); }}
      onClick={event => { if (pinned.current === key) closeNote(); else { pinned.current = key; showNote(side, field, event.currentTarget); } }}>
      {children}
    </button>;
  };

  return <section className="landing-section career-launch landing-reveal" id="career" aria-labelledby={`${id}-title`} data-reveal onKeyDown={event => { if (event.key === 'Escape') closeNote(); }}>
    <div className="career-launch__copy">
      <p className="career-launch__eyebrow"><Circle size={7} fill="currentColor" aria-hidden="true" />Выход на рынок</p>
      <h2 id={`${id}-title`}>Превращаем<br />опыт в аргументы<br />для найма</h2>
      <p className="career-launch__lead">Собираем позиционирование, усиливаем резюме реальными проектами и сопровождаем первые отклики до интервью.</p>
      <div className="career-launch__services">{services.map(service => <article className="career-service" key={service.label}>
        <Circle className="career-service__dot" size={6} fill="currentColor" aria-hidden="true" /><span className="career-service__label">{service.label}</span><h3>{service.title}</h3><p>{service.text}</p>
      </article>)}</div>
      <p className="career-launch__support"><Circle size={7} fill="currentColor" aria-hidden="true" /><span>С действующими HR-специалистами сверяем позиционирование, читаемость резюме и ожидания рынка до активных откликов.</span></p>
    </div>

    <figure className="career-launch__example">
      <div className="career-launch__mobile-switch" role="group" aria-label="Версия резюме">
        <button type="button" aria-pressed={mobileSide === 'before'} onClick={() => { closeNote(); setMobileSide('before'); }}>01 / До</button>
        <button type="button" aria-pressed={mobileSide === 'after'} onClick={() => { closeNote(); setMobileSide('after'); }}>02 / После</button>
      </div>
      <div className="career-resume" ref={compare} data-mobile-side={mobileSide}>
        <div className="career-resume__columns">
          <article className="career-resume__page career-resume__page--before" aria-label="Резюме до доработки">
            {zone('before', 'role', 'целевая роль', <><span>01 / До</span><span className="career-resume__badge">Ценность скрыта</span></>, 'career-resume__legend')}
            <div className="career-resume__identity"><img src={candidatePhoto} alt="" width="42" height="42" loading="lazy" /><div><strong>Алексей Иванов</strong><span>Программист</span></div></div>
            {zone('before', 'about', 'о себе', <><span className="career-resume__heading">О себе</span><span>Ищу работу backend-разработчиком. Быстро учусь, коммуникабельный, ответственный. Готов выполнять любые задачи.</span></>)}
            {zone('before', 'experience', 'опыт работы', <><span className="career-resume__heading">Опыт работы</span>
              <ResumeJob date={'2019–\n2021'} title="Курьер, доставка еды" muted>Работал курьером в сервисе доставки еды. Забирал заказы в ресторанах и развозил их по разным районам города. Поддерживал связь с клиентами при задержках. Соблюдал график смен и требования сервиса.</ResumeJob>
              <ResumeJob date={'2022–\n2023'} title="Оператор поддержки">Принимал обращения клиентов в чате и по почте. Проверял статусы заявок во внутренних системах. Заполнял рабочие таблицы и передавал ошибки разработчикам. Отвечал на вопросы менеджеров по проблемным заказам.</ResumeJob>
              <ResumeJob date="2024" title="Стажёр backend">Делал задачи на Python в учебном сервисе. Работал с FastAPI и PostgreSQL. Исправлял ошибки в API и добавлял новые endpoints. Писал тесты и участвовал в код-ревью.</ResumeJob>
            </>)}
            {zone('before', 'skills', 'навыки', <><span className="career-resume__heading">Навыки</span><span className="career-resume__quote">Python, FastAPI, PostgreSQL, Docker, Git, коммуникабельность, ответственность.</span></>)}
            <p className="career-resume__outcome"><XCircle size={17} aria-hidden="true" /><span>Рекрутер видит опыт, но не понимает твой уровень и пользу для команды.</span></p>
          </article>

          <article className="career-resume__page career-resume__page--after" aria-label="Резюме после доработки">
            {zone('after', 'role', 'целевая роль', <><span>02 / После</span><span className="career-resume__badge">Язык вакансии</span></>, 'career-resume__legend')}
            <div className="career-resume__identity"><img src={candidatePhoto} alt="" width="42" height="42" loading="lazy" /><div><strong>Алексей Иванов</strong><span>Junior Backend Developer</span></div></div>
            {zone('after', 'about', 'о себе', <><span className="career-resume__heading">О себе</span><span>Junior Backend Developer с практикой в Python, FastAPI, REST API, PostgreSQL и Docker. Собираю сервисы, которые снимают ручную работу, и отвечаю за результат задачи до релиза.</span></>)}
            {zone('after', 'skills', 'hard skills', <><span className="career-resume__heading">Hard skills</span><span className="career-resume__skills">{['FastAPI', 'PostgreSQL', 'SQLAlchemy', 'Docker', 'Pytest'].map(skill => <span key={skill}>{skill}</span>)}</span></>)}
            {zone('after', 'soft', 'soft skills в действии', <><span className="career-resume__heading">Soft skills в действии</span><span className="career-resume__quote">Декомпозирую задачи, фиксирую риски в PR, синхронизируюсь с командой и довожу изменение до релиза.</span></>)}
            {zone('after', 'experience', 'опыт и результат', <><span className="career-resume__heading">Опыт и результат</span>
              <ResumeJob date={'2022–\n2023'} title="Оператор поддержки · автоматизация">Разобрал повторяющиеся причины задержек в доставке. Написал Python-скрипт, который собирал статусы заявок из выгрузок. Добавил проверку пустых данных перед формированием отчёта. Сократил подготовку ежедневной сводки с двух часов до 25 минут. Решение освободило команде около шести часов в неделю и показало опыт работы с данными.</ResumeJob>
              <ResumeJob date="2024" title="Стажёр backend · FastAPI">На стажировке разделил API- и сервисный слои, чтобы бизнес-правила тестировались отдельно от HTTP. Вынес проверку тарифов и статусов в FastAPI-сервис. Это ускорило обработку заявок <em>на 38%</em>. Добавил Pydantic-валидацию, логирование и единый формат ошибок. Покрыл критические сценарии Pytest-тестами и подготовил Docker-окружение для запуска проекта.</ResumeJob>
            </>)}
            <p className="career-resume__outcome"><CheckCircle2 size={17} aria-hidden="true" /><span>За 20 секунд рекрутер видит роль, стек, вклад и подтверждённый результат.</span></p>
          </article>
        </div>
        {note && <div className="career-resume__note" id={`${id}-note`} role="tooltip" data-side={note.side} data-below={note.below} style={{ left: note.left, top: note.top }}>{explanations[note.side][note.field]}</div>}
      </div>
      <figcaption>Демонстрационный пример. В реальном резюме используем только подтверждённый опыт и результаты.</figcaption>
    </figure>
  </section>;
}

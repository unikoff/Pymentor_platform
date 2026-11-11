import { useEffect, useId, useState, type PointerEvent } from 'react';
import { ArrowDownRight } from 'lucide-react';
import { ProgrammingBackground } from './components/ProgrammingBackground';
import { LearningSystem } from './sections/LearningSystem';
import { CareerLaunch } from './sections/CareerLaunch';
import { LandingFaq } from './sections/LandingFaq';
import { AboutSection } from './sections/AboutSection';
import { LandingNav, PricingSection, ReviewsSection, landingUrl } from './LandingPages';
import { ConsultationForm } from './components/ConsultationForm';
import { platformUrl } from '../../shared/paths';
import mentorPhoto from './assets/mentor-portrait.png';
import './styles/landing.css';
import './styles/programming-background.css';
import './styles/start-offer.css';

function trackMetricLight(event: PointerEvent<HTMLLIElement>) {
  if (event.pointerType === 'touch' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const card = event.currentTarget;
  const bounds = card.getBoundingClientRect();
  card.style.setProperty('--metric-x', `${event.clientX - bounds.left}px`);
  card.style.setProperty('--metric-y', `${event.clientY - bounds.top}px`);
}

const mentoringAudiences = [
  {
    title: 'Начинаете с нуля',
    points: ['Первое знакомство с программированием', 'Основы Python', 'Первые задачи и практика'],
  },
  {
    title: 'Продолжаете обучение',
    points: ['Самостоятельное изучение Python', 'Обучение после курсов', 'Пробелы в основах', 'Больше практики и обратной связи'],
  },
  {
    title: 'Развиваетесь в backend',
    points: ['Углубление навыков Python', 'Разработка backend-проектов', 'Подготовка к собеседованиям', 'Переход на новую позицию'],
  },
  {
    title: 'Переходите в разработку',
    points: ['Смена профессии', 'Переход из смежной сферы в IT', 'Учёба параллельно с работой', 'Подготовка к первой работе в backend'],
  },
];

function MentoringAudiences() {
  const [active, setActive] = useState<number | null>(null);
  const id = useId();

  return <div className="mentoring-choice__cases">{mentoringAudiences.map((audience, index) => {
    const isOpen = active === index;
    const buttonId = `${id}-audience-${index}`;
    const panelId = `${id}-panel-${index}`;
    return <article className={`mentoring-choice__case${isOpen ? ' mentoring-choice__case--open' : ''}`} key={audience.title}>
      <button className="mentoring-choice__case-toggle" id={buttonId} type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setActive(isOpen ? null : index)}>
        <span>{audience.title}</span><span className="mentoring-choice__case-icon" aria-hidden="true">+</span>
      </button>
      <div className="mentoring-choice__case-content" id={panelId} role="region" aria-labelledby={buttonId} aria-hidden={!isOpen}>
        <div className="mentoring-choice__case-inner"><ul>{audience.points.map(point => <li key={point}>{point}</li>)}</ul></div>
      </div>
    </article>;
  })}</div>;
}

export function BackendLandingPage() {
  const [activeComparison, setActiveComparison] = useState<string | null>(null);
  const comparisonHeading = (label: string) => <th scope="row"><button className="mentoring-choice__row-toggle" type="button" aria-label={`Выделить строку: ${label}`} aria-pressed={activeComparison === label} onClick={() => setActiveComparison(current => current === label ? null : label)}><span>{label}</span><i aria-hidden="true" /></button></th>;

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    const metadata = [
      ['name', 'description', 'Backend с личным наставником: индивидуальные занятия, практика на knowi и персональный разбор кода.'],
      ['property', 'og:title', 'Backend с личным наставником | knowi'],
      ['property', 'og:description', 'Начните с нуля или развивайте навыки с личным наставником.'],
    ] as const;
    const originalMetadata = metadata.map(([attribute, name]) => {
      const selector = `meta[${attribute}="${name}"]`;
      const element = document.head.querySelector<HTMLMetaElement>(selector);
      return { selector, element, content: element?.content ?? null };
    });

    document.title = 'Backend с личным наставником | knowi';
    metadata.forEach(([attribute, name, content], index) => {
      const current = originalMetadata[index].element ?? document.createElement('meta');
      current.setAttribute(attribute, name);
      current.content = content;
      if (!current.isConnected) document.head.append(current);
    });

    return () => {
      document.title = previousTitle;
      originalMetadata.forEach(({ selector, element, content }) => {
        const current = document.head.querySelector<HTMLMetaElement>(selector);
        if (!element) {
          current?.remove();
        } else if (current) {
          current.content = content ?? '';
        }
      });
    };
  }, []);

  useEffect(() => {
    const root = document.querySelector('.backend-landing');
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>('[data-reveal]');
    const revealAll = () => targets.forEach((target) => target.classList.add('landing-reveal--visible'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('landing-reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { root, rootMargin: '0px 0px -36px 0px', threshold: 0.08 });

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);


  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.backend-landing');
    if (!root) return;
    const desktop = window.matchMedia('(min-width: 901px) and (min-height: 701px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const sections = Array.from(root.querySelectorAll<HTMLElement>('.backend-landing__inner > .landing-opening, .backend-landing__inner > section, .backend-landing__inner > .landing-ending'));
    let lastWheel = 0;
    let lastDirection = 0;
    const onWheel = (event: WheelEvent) => {
      if (root.querySelector('dialog[open]')) return;
      if (!desktop.matches || event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY) || !event.deltaY) return;
      if (event.deltaMode === 0 && Math.abs(event.deltaY) < 80) return;
      const direction = Math.sign(event.deltaY);
      let element = event.target instanceof HTMLElement ? event.target : null;
      while (element && element !== root) {
        if (element.scrollHeight > element.clientHeight + 1 &&
          (direction < 0 ? element.scrollTop > 0 : element.scrollTop + element.clientHeight < element.scrollHeight - 1) &&
          /(auto|scroll)/.test(window.getComputedStyle(element).overflowY)) return;
        element = element.parentElement;
      }
      const bounds = root.getBoundingClientRect();
      const header = root.querySelector<HTMLElement>('.landing-header')?.getBoundingClientRect();
      const inset = Math.max(0, (header?.bottom ?? bounds.top) - bounds.top + 10);
      const availableHeight = root.clientHeight - inset;
      const center = bounds.top + inset + availableHeight / 2;
      const index = sections.findIndex((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= center && rect.bottom >= center;
      });
      if (index < 0) return;
      const current = sections[index].getBoundingClientRect();
      if (current.height > availableHeight && (direction > 0 ? current.bottom > bounds.bottom + 8 : current.top < bounds.top + inset - 8)) return;
      const target = sections[index + direction];
      if (!target) return;
      event.preventDefault();
      const now = performance.now();
      if (direction === lastDirection && now - lastWheel < 160) return;
      lastWheel = now;
      lastDirection = direction;
      const rect = target.getBoundingClientRect();
      const top = root.scrollTop + rect.top - bounds.top;
      const destination = rect.height > availableHeight
        ? (direction > 0 ? top - inset : top + rect.height - root.clientHeight)
        : top - inset + (rect.height - availableHeight) / 2;
      root.scrollTo({ top: Math.max(0, Math.min(root.scrollHeight - root.clientHeight, destination)), behavior: 'smooth' });
    };
    root.addEventListener('wheel', onWheel, { passive: false });
    return () => root.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <main className="backend-landing" aria-labelledby="landing-title">
      <div className="backend-landing__scene">
        <ProgrammingBackground />
        <div className="backend-landing__inner">
        <div className="landing-header-layer"><header className="landing-header">
          <a className="landing-brand" href={landingUrl}>Никита Кирюхин</a>
          <LandingNav />
        </header></div>

        <div className="landing-opening">
        <section className="landing-hero" aria-labelledby="landing-title" data-scene="hero">
          <div className="hero-main">
            <h1 id="landing-title">Backend с ментором<span>Вместе к первой работе в IT</span></h1>
            <p className="hero-main__lead">Хотите начать с нуля или застряли в самостоятельном обучении? Вместе найдём понятный путь: разберём сложные темы, напишем код и создадим проекты. Я помогу вам двигаться дальше и увереннее идти к цели.</p>
            <div className="hero-features">
              <div className="hero-features__heading"><p className="hero-mentor__label">Почему выбирают меня</p></div>
              <ul aria-label="Преимущества обучения">
                <li><a href="#lessons"><strong>1:1 <ArrowDownRight size={16} aria-hidden="true" /></strong><span>Занимаемся один на один: подстрою темп под вас и помогу разобраться в сложных темах.</span></a></li>
                <li><a href="#platform"><strong>knowi <ArrowDownRight size={16} aria-hidden="true" /></strong><span>Теория и практика собраны в понятный маршрут. Загляните на платформу и посмотрите сами.</span></a></li>
                <li><a href="#demo"><strong>Code review <ArrowDownRight size={16} aria-hidden="true" /></strong><span>Проверяю каждое изменение в вашем проекте: покажу ошибки и объясню, как их исправить.</span></a></li>
              </ul>
            </div>
          </div>
          <aside className="hero-mentor" aria-label="Ваш ментор Никита Кирюхин">
            <div className="hero-mentor__profile">
              <img src={mentorPhoto} alt="Никита Кирюхин, backend-ментор" />
              <div><p className="hero-mentor__label">Ваш личный ментор</p><h2>Никита Кирюхин</h2><p className="hero-mentor__bio">Мой опыт в разработке и менторстве помогает вам расти в backend.</p><a className="hero-mentor__more" href="#about">Подробнее обо мне <span aria-hidden="true">↗</span></a></div>
            </div>
            <div className="hero-mentor__experience">
              <ul>
                <li onPointerMove={trackMetricLight}><strong>30+</strong><span>учеников уже работают backend-разработчиками</span><span className="hero-mentor__caption">От обучения к работе</span></li>
                <li onPointerMove={trackMetricLight}><strong>180 000 ₽</strong><span>средний оффер в месяц после менторства</span></li>
                <li onPointerMove={trackMetricLight}><strong>100%</strong><span>учеников получили заметный результат и ясный следующий шаг</span></li>
              </ul>
            </div>
          </aside>
        </section>
        </div>

        <section className="landing-section landing-path landing-reveal" id="path" aria-labelledby="path-title" data-reveal data-scene="path">
          <div className="landing-path__intro">
            <h2 id="path-title">Начать можно с простого <span>разговора</span></h2>
            <p className="landing-path__lead">Оставьте заявку — я свяжусь с вами, чтобы обсудить ваши цели и договориться о бесплатной консультации.</p>
            <ConsultationForm />
          </div>
          <div className="landing-path__invitation">
            <div className="landing-path__invitation-heading">
              <div><h3>Первая<br />встреча</h3><p>Подготовка не нужна. Просто расскажите, что хотите изучить.</p></div>
              <div className="landing-path__price">
                <strong>0<span>₽</span></strong>
              </div>
            </div>
            <ol className="landing-path__journey">
              <li><span className="landing-path__marker landing-path__marker--connected"><span>01 · СОЗВОН</span><span className="landing-path__flow" aria-hidden="true" /></span><div><strong>Обсудим ваши цели</strong><p>Познакомимся, разберём ваш опыт и определим первый шаг.</p></div></li>
              <li><span className="landing-path__marker">02 · ДОСТУП</span><div><strong>Посмотрите knowi</strong><p>Открою бесплатный доступ на несколько дней. Вы изучите платформу и решите, подходит ли формат.</p></div></li>
            </ol>
            <div className="landing-path__optional"><a className="landing-inline-link" href="#start">«Старт в Python» для новичков <span aria-hidden="true">↓</span></a></div>
          </div>
        </section>

        <section className="landing-section mentoring-choice landing-reveal" id="mentoring" aria-labelledby="mentoring-title" data-reveal>
          <div className="mentoring-choice__side">
            <div className="mentoring-choice__heading"><h2 id="mentoring-title">Ваш путь в backend с наставником</h2></div>
            <div className="mentoring-choice__bridge"><div><span>Кому подходит</span></div></div>
            <MentoringAudiences />
          </div>
          <div className="mentoring-choice__comparison">
          <p className="mentoring-choice__swipe-hint" id="comparison-swipe-hint">Листайте таблицу в стороны <span aria-hidden="true">↔</span></p>
          <div className="mentoring-choice__table-wrap" role="region" aria-label="Сравнение форматов обучения" aria-describedby="comparison-swipe-hint" tabIndex={0}><table className="mentoring-choice__table">
            <thead><tr><th scope="col">Что получаете</th><th className="choice-featured" scope="col">С наставником</th><th scope="col">Курсы</th><th scope="col">Самостоятельно</th></tr></thead>
            <tbody>
              <tr>{comparisonHeading('План обучения')}<td className="choice-featured"><span>С наставником</span><div>Под вашу цель и опыт</div></td><td><span>Курсы</span><div>По программе курса</div></td><td><span>Самостоятельно</span><div>Составляете сами</div></td></tr>
              <tr>{comparisonHeading('Проект для портфолио')}<td className="choice-featured"><span>С наставником</span><div className="choice-check" role="img" aria-label="Есть">✓</div></td><td><span>Курсы</span><div>Зависит от курса</div></td><td><span>Самостоятельно</span><div className="choice-cross" role="img" aria-label="Срок не указан">×</div></td></tr>
              <tr>{comparisonHeading('Навыки вайбкодинга')}<td className="choice-featured"><span>С наставником</span><div>С пониманием Backend</div></td><td><span>Курсы</span><div className="choice-cross" role="img" aria-label="Срок не указан">×</div></td><td><span>Самостоятельно</span><div className="choice-cross" role="img" aria-label="Срок не указан">×</div></td></tr>
              <tr>{comparisonHeading('Разбор кода проекта')}<td className="choice-featured"><span>С наставником</span><div className="choice-check" role="img" aria-label="Есть">✓</div></td><td><span>Курсы</span><div className="choice-cross" role="img" aria-label="Срок не указан">×</div></td><td><span>Самостоятельно</span><div className="choice-cross" role="img" aria-label="Не входит в самостоятельный формат">×</div></td></tr>
              <tr>{comparisonHeading('Подготовка к собеседованию')}<td className="choice-featured"><span>С наставником</span><div>С практиками из IT</div></td><td><span>Курсы</span><div className="choice-cross" role="img" aria-label="Срок не указан">×</div></td><td><span>Самостоятельно</span><div className="choice-cross" role="img" aria-label="Срок не указан">×</div></td></tr>
              <tr>{comparisonHeading('Составление легенды')}<td className="choice-featured"><span>С наставником</span><div className="choice-check" role="img" aria-label="Есть">✓</div></td><td><span>Курсы</span><div className="choice-cross" role="img" aria-label="Срок не указан">×</div></td><td><span>Самостоятельно</span><div className="choice-cross" role="img" aria-label="Срок не указан">×</div></td></tr>
              <tr>{comparisonHeading('Время до оффера')}<td className="choice-featured"><span>С наставником</span><div>До 9 месяцев</div></td><td><span>Курсы</span><div className="choice-cross" role="img" aria-label="Срок не указан">×</div></td><td><span>Самостоятельно</span><div className="choice-cross" role="img" aria-label="Срок не указан">×</div></td></tr>
              <tr>{comparisonHeading('Оплата')}<td className="choice-featured"><span>С наставником</span><div>Ежемесячно, без рассрочек</div></td><td><span>Курсы</span><div>Полная оплата, либо рассрочка</div></td><td><span>Самостоятельно</span><div className="choice-cross" role="img" aria-label="Срок не указан">×</div></td></tr>
            </tbody>
          </table></div>
          </div>
        </section>

        <ReviewsSection />

        <LearningSystem />

        <CareerLaunch />

        <AboutSection />

        <section className="landing-section landing-offer landing-reveal" id="start" aria-labelledby="offer-title" data-reveal data-scene="offer">
          <div className="landing-offer__heading">
            <h2 id="offer-title">Ваш первый шаг <span>в Python</span></h2>
            <p>Пробный формат для новых учеников: за 30 дней вы познакомитесь с наставником и платформой и поймёте, подходит ли вам обучение.</p>
            <ul className="landing-offer__benefits" aria-label="Что даст вам старт">
              <li><strong>Личный план</strong><span>Поймёте, с чего начать и куда двигаться.</span></li>
              <li><strong>Практика с первых шагов</strong><span>Закрепите основы на задачах.</span></li>
              <li><strong>Разбор ошибок</strong><span>Обсудите сложные места с наставником.</span></li>
            </ul>
          </div>
          <article className="landing-offer__card">
            <svg className="landing-offer__constellation" viewBox="0 0 180 100" fill="none" aria-hidden="true" focusable="false">
              <path className="landing-offer__constellation-path" d="M8 82 48 54 90 68 132 24 171 37" />
              <path className="landing-offer__constellation-star landing-offer__constellation-star--one" d="m48 49 1.3 3.7L53 54l-3.7 1.3L48 59l-1.3-3.7L43 54l3.7-1.3z" />
              <path className="landing-offer__constellation-star landing-offer__constellation-star--two" d="m132 18 1.6 4.4L138 24l-4.4 1.6L132 30l-1.6-4.4L126 24l4.4-1.6z" />
              <path className="landing-offer__constellation-star landing-offer__constellation-star--three" d="m171 33 1 3 3 1-3 1-1 3-1-3-3-1 3-1z" />
            </svg>
            <div className="landing-offer__price"><strong>5 000 <span>₽</span></strong></div>
            <div className="landing-offer__features">
              <div><strong>4 + 4</strong><span><small>Встречи с наставником по 60 минут + код-ревью</small></span></div>
              <div><strong>30<small>дней</small></strong><span><small>Подписки на платформу</small></span></div>
              <div><strong>60<small>%</small></strong><span><small>Выгоды относительно обычного месячного сопровождения</small></span></div>
            </div>
            <button className="primary-action landing-action landing-offer__action" type="button" data-consultation-trigger>Обсудить старт <span aria-hidden="true">↗</span></button>
          </article>
        </section>

        <PricingSection />

        <div className="landing-ending">
          <LandingFaq />
          <footer className="landing-footer"><a className="landing-brand" href={platformUrl}>knowi</a><a href={`${landingUrl}/privacy-policy`}>Политика обработки данных</a><a href={`${landingUrl}/personal-data`}>Согласие на обработку данных</a><span>ИП КИРЮХИН Н.А. ИНН 230109261735</span></footer>
        </div>
        </div>
      </div>
    </main>
  );
}

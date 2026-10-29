import { useEffect } from 'react';
import { ProgrammingBackground } from './ProgrammingBackground';
import { CodeReviewDemo } from './CodeReviewDemo';
import mentorPhoto from './assets/mentor.jpg';
import './landing.css';
import './programming-background.css';

const platformUrl = import.meta.env.BASE_URL;

const questions = [
  {
    question: 'С чего начать, если я совсем новичок?',
    answer: 'С бесплатной консультации. Обсудим вашу точку старта и вопросы — предварительно разбираться в Python не нужно.',
  },
  {
    question: 'Как я смогу посмотреть Pymentor?',
    answer: 'На бесплатной консультации я открою доступ на несколько дней. Это бесплатно и ни к чему не обязывает.',
  },
  {
    question: 'Кому подойдёт «Старт в Python»?',
    answer: '«Старт в Python» — предложение для новичков: демо-версия полноценного месяца с 4 индивидуальными занятиями по 60 минут, доступом к платформе на 30 дней, практикой, разбором ошибок и личным планом. Стоимость — 5 000 ₽.',
  },
  {
    question: 'Что если я застряну или не пойму тему?',
    answer: 'На индивидуальных занятиях можно остановиться на сложном месте, разобрать ошибку в коде и вместе наметить следующий шаг.',
  },
  {
    question: 'Можно ли оплатить пакет на этой странице?',
    answer: 'Онлайн-оплата здесь не подключена. Начните с консультации, чтобы узнать о следующем шаге.',
  },
];

export function BackendLandingPage() {
  useEffect(() => {
    const previousTitle = document.title;
    const metadata = [
      ['name', 'description', 'Путь в backend с нуля: личное менторство, практика на проектах и обучение на Pymentor.'],
      ['property', 'og:title', 'В backend — вместе | Pymentor'],
      ['property', 'og:description', 'От основ до подготовки к первой работе: проекты, code review и поддержка ментора.'],
    ] as const;
    const originalMetadata = metadata.map(([attribute, name]) => {
      const selector = `meta[${attribute}="${name}"]`;
      const element = document.head.querySelector<HTMLMetaElement>(selector);
      return { selector, element, content: element?.content ?? null };
    });

    document.title = 'В backend — вместе | Pymentor';
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

  return (
    <main className="backend-landing" aria-labelledby="landing-title">
      <div className="backend-landing__scene">
        <ProgrammingBackground />
        <div className="backend-landing__inner">
        <header className="landing-header">
          <a className="landing-brand" href={platformUrl}>Pymentor</a>
          <nav className="landing-header__nav" aria-label="Навигация по странице">
            <a href="#path">Как начать</a>
            <a href="#demo">Code review</a>
            <a href="#start">Старт в Python</a>
            <a href="#faq">Вопросы</a>
          </nav>
          <a className="landing-header__link" href={platformUrl}>Перейти на Pymentor <span aria-hidden="true">↗</span></a>
        </header>

        <section className="landing-hero" aria-labelledby="landing-title" data-scene="hero">
          <div className="landing-hero__copy">
            <h1 id="landing-title">Backend с нуля.<br /><span>Вместе — к первой работе.</span></h1>
            <p className="landing-hero__lead">Не нужно заранее знать, с чего начать: пойдём по понятному плану. Вы будете писать код, а я — разбирать его с вами и помогать увидеть следующий шаг.</p>
            <ul className="landing-hero__benefits" aria-label="Как устроено менторство">
              <li><span>01</span><div><strong>Практика на своих проектах</strong><small>Закрепляете основы в backend-задачах и коде.</small></div></li>
              <li><span>02</span><div><strong>Личный разбор кода</strong><small>Понимаете причину ошибки и учитесь находить решение.</small></div></li>
              <li><span>03</span><div><strong>Портфолио и путь к работе</strong><small>Практика и план обучения собраны на Pymentor.</small></div></li>
            </ul>
            <p className="landing-hero__promise">Дальше покажу занятия, code review и платформу, на которой будем учиться.</p>
          </div>
          <aside className="landing-hero__mentor-card" aria-label="Ваш ментор">
            <p className="landing-hero__mentor-label">Ваш ментор</p>
            <div className="landing-hero__profile">
              <div className="landing-hero__portrait"><img src={mentorPhoto} alt="Никита Кирюхин, backend-ментор" /></div>
              <div className="landing-hero__identity"><strong>Никита Кирюхин</strong><small>Лично сопровождаю обучение backend</small></div>
            </div>
            <p className="landing-hero__mentor-note">Вместе разберём, где проект буксует, и определим следующий шаг.</p>
          </aside>
        </section>

        <section className="landing-section landing-path landing-reveal" id="path" aria-labelledby="path-title" data-reveal data-scene="path">
          <div className="landing-path__intro">
            <p className="landing-overline">Как начать</p>
            <h2 id="path-title">Начать можно с простого <span>разговора</span></h2>
            <p className="landing-path__lead">Напишите мне, чтобы договориться о времени консультации.</p>
            <a className="primary-action landing-action landing-path__cta" href="https://t.me/unikoff" target="_blank" rel="noopener noreferrer">Написать в Telegram <span aria-hidden="true">↗</span></a>
            <p className="landing-path__reassurance">Бесплатная консультация <span aria-hidden="true">·</span> ни к чему не обязывает</p>
          </div>
          <div className="landing-path__invitation">
            <div className="landing-path__invitation-top"><span>ПЕРВОЕ ЗНАКОМСТВО</span><span>БЕСПЛАТНО</span></div>
            <div className="landing-path__invitation-heading">
              <div><h3>Первая<br />встреча</h3><p>Подготовка не нужна. Просто расскажите, что хотите изучить.</p></div>
              <div className="landing-path__price">
                <strong>0<span>₽</span></strong>
                <small>КОНСУЛЬТАЦИЯ</small>
              </div>
            </div>
            <ol className="landing-path__journey">
              <li><span className="landing-path__marker">01 · СОЗВОН</span><div><strong>Обсудим ваши цели</strong><p>Познакомимся, разберём ваш опыт и определим первый шаг.</p></div></li>
              <li><span className="landing-path__marker">02 · ДОСТУП</span><div><strong>Посмотрите Pymentor</strong><p>Открою бесплатный доступ на несколько дней. Вы изучите платформу и решите, подходит ли формат.</p></div></li>
            </ol>
            <div className="landing-path__optional"><span>После знакомства сами решите, продолжать ли обучение.</span><a className="landing-inline-link" href="#start">«Старт в Python» для новичков <span aria-hidden="true">↓</span></a></div>
          </div>
        </section>

        <section className="landing-section landing-demo landing-reveal" id="demo" aria-labelledby="demo-title" data-reveal data-scene="demo">
          <div className="landing-demo__intro">
            <p className="landing-overline">Индивидуальное code review</p>
            <h2 id="demo-title">Разберём код — <span>поймёте, что делать дальше.</span></h2>
            <p className="landing-demo__lead">Найдём причину ошибки, спокойно разберём решение и наметим следующий шаг для вашего проекта. Не просто готовый ответ — понимание, которое можно применить самому.</p>
            <a className="landing-inline-link landing-demo__consult" href="#path">Обсудить свой код с наставником <span aria-hidden="true">↑</span></a>
          </div>
          <div className="landing-demo__content">
            <CodeReviewDemo />
          </div>
        </section>

        <section className="landing-section landing-format landing-reveal" id="format" aria-labelledby="format-title" data-reveal data-scene="format">
          <div className="landing-section__intro">
            <p className="landing-overline">03 · Формат занятий</p>
            <h2 id="format-title">Месяц обучения, который можно сначала попробовать</h2>
            <p>«Старт в Python» — демо-версия полноценного месяца: занятия один на один, практика и платформа в одном формате.</p>
          </div>
          <div className="landing-format__content">
            <div className="landing-format__facts">
              <article><span className="landing-fact-icon" aria-hidden="true">◷</span><div><h3>Четыре занятия</h3><p>Индивидуальные встречи по 60 минут.</p></div></article>
              <article><span className="landing-fact-icon" aria-hidden="true">⌘</span><div><h3>Доступ к платформе</h3><p>В течение 30 дней.</p></div></article>
              <article><span className="landing-fact-icon" aria-hidden="true">↗</span><div><h3>Практика и разбор</h3><p>Практика, разбор ошибок и личный план.</p></div></article>
            </div>
            <a className="landing-inline-link landing-format__next" href="#start">Посмотреть состав «Старта» <span aria-hidden="true">↓</span></a>
          </div>
        </section>

        <section className="landing-section landing-platform landing-reveal" id="platform" aria-labelledby="platform-title" data-reveal data-scene="platform">
          <div className="landing-platform__copy">
            <p className="landing-overline">04 · Знакомство с платформой</p>
            <h2 id="platform-title">Сначала посмотрите, как устроен Pymentor</h2>
            <p>Прямо на консультации я открою доступ на несколько дней. Посмотрите Pymentor в своём темпе и решите, удобно ли вам здесь учиться. К «Старту» можно перейти позже.</p>
            <a className="primary-action landing-action" href={platformUrl}>Открыть Pymentor <span aria-hidden="true">↗</span></a>
          </div>
          <div className="landing-platform__card" role="group" aria-label="Иллюстрация формата: практика, разбор ошибок, личный план">
            <div className="landing-platform__card-head">Практика, разбор и личный план</div>
            <div className="landing-platform__row"><span className="landing-platform__icon" aria-hidden="true">{'{}'}</span><span><strong>Практика</strong><small>Закрепить новые строки кода</small></span><span className="landing-platform__chevron" aria-hidden="true">›</span></div>
            <div className="landing-platform__row"><span className="landing-platform__icon" aria-hidden="true">✓</span><span><strong>Разбор ошибок</strong><small>Понять, что можно улучшить</small></span><span className="landing-platform__chevron" aria-hidden="true">›</span></div>
            <div className="landing-platform__row"><span className="landing-platform__icon" aria-hidden="true">↗</span><span><strong>Личный план</strong><small>Держать в поле зрения следующий шаг</small></span><span className="landing-platform__chevron" aria-hidden="true">›</span></div>
            <p className="landing-platform__disclaimer">Иллюстрация элементов формата, не скриншот интерфейса.</p>
          </div>
        </section>

        <section className="landing-section landing-offer landing-reveal" id="start" aria-labelledby="offer-title" data-reveal data-scene="offer">
          <div className="landing-offer__heading">
            <p className="landing-overline">05 · Предложение для новичков</p>
            <h2 id="offer-title">Попробуйте полноценный месяц обучения по небольшой цене</h2>
            <p>«Старт в Python» — для тех, кто начинает с нуля. Это демо-версия месяца, чтобы попробовать формат на практике и понять, хотите ли продолжать.</p>
          </div>
          <article className="landing-offer__card">
            <div className="landing-offer__top"><div><p>Разовый пакет на 30 дней</p><h3>Старт в Python</h3></div><strong className="landing-price">5 000 <span>₽</span></strong></div>
            <ul>
              <li>4 индивидуальных занятия по 60 минут</li>
              <li>Доступ к платформе на 30 дней</li>
              <li>Практика и разбор ошибок</li>
              <li>Личный план обучения</li>
            </ul>
            <a className="primary-action landing-action landing-offer__action" href={platformUrl}>Перейти на Pymentor <span aria-hidden="true">↗</span></a>
            <p className="landing-offer__note">Знакомство начинается с бесплатной консультации. Онлайн-оплата на этой странице не подключена.</p>
          </article>
        </section>

        <section className="landing-section landing-faq landing-reveal" id="faq" aria-labelledby="faq-title" data-reveal data-scene="faq">
          <div className="landing-section__intro">
            <p className="landing-overline">06 · Частые вопросы</p>
            <h2 id="faq-title">Что важно узнать до старта?</h2>
          </div>
          <div className="landing-faq__content">
            <div className="landing-faq__list">
              {questions.map((item) => (
                <details className="landing-faq__item" key={item.question}>
                  <summary>{item.question}<span aria-hidden="true">+</span></summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
            <a className="landing-inline-link landing-faq__next" href={platformUrl}>Перейти на Pymentor <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section className="landing-final landing-reveal" aria-labelledby="final-title" data-reveal data-scene="final">
          <p className="landing-overline">07 · Первый шаг</p>
          <h2 id="final-title">Хотите сначала познакомиться с форматом?</h2>
          <p>Бесплатно познакомимся и обсудим вашу цель. Затем вы получите несколько дней доступа к Pymentor — без оплаты и обязательств.</p>
          <a className="primary-action landing-action" href="#path">Посмотреть три шага <span aria-hidden="true">↓</span></a>
        </section>

          <footer className="landing-footer"><a className="landing-brand" href={platformUrl}>Pymentor</a><span>Путь в Python начинается с одного шага.</span></footer>
        </div>
      </div>
    </main>
  );
}

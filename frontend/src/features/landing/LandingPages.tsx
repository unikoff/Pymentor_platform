import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowUpRight, BookOpen, Compass, FolderCode, MessageCircle, Target } from 'lucide-react';
import { ProgrammingBackground } from './components/ProgrammingBackground';
import { ConsultationForm } from './components/ConsultationForm';
import dmitriyPhoto from './assets/Dmitriy.jpg';
import varvaraPhoto from './assets/Varvara.jpg';
import zaharPhoto from './assets/Zahar.jpg';
import './styles/landing.css';
import './styles/programming-background.css';
import './styles/landing-pages.css';
import './styles/pricing.css';

import { landingUrl, platformUrl } from '../../shared/paths';
export { landingUrl } from '../../shared/paths';

const plans = [
  {
    hours: 12, reviewCount: 12, label: 'Главный формат', price: 20000,
    items: [
      { icon: Compass, title: 'Личный план обучения', description: 'Поймёте, с чего начать и к чему двигаться дальше.' },
      { icon: FolderCode, title: 'Проект шаг за шагом', description: 'Вместе разбираем каждый этап создания вашего проекта.' },
      { icon: MessageCircle, title: 'Приоритетная поддержка', description: 'Пишите в Telegram в любое время. Ваши вопросы в приоритете.' },
      { icon: BookOpen, title: 'Все темы по порядку', description: 'Последовательно разбираем каждую тему на понятных примерах.' },
    ],
  },
  {
    hours: 6, reviewCount: 6, label: 'Стабильный ритм', price: 15000,
    items: [
      { icon: Target, title: 'Ключевые затруднения', description: 'На встречах сосредоточимся на самых важных вопросах.' },
      { icon: FolderCode, title: 'Работа над проектом', description: 'Обсудим ключевые трудности, которые возникают в проекте.' },
      { icon: Compass, title: 'План практики', description: 'Темы и задачи для самостоятельной работы между встречами.' },
    ],
  },
];

export function LandingNav() {
  return <>
    <nav className="landing-header__nav" aria-label="Навигация по лендингу">
      <a href={`${landingUrl}#reviews`}>Отзывы</a><a href={`${landingUrl}#platform`}>Программа</a><a href={`${landingUrl}#about`}>Обо мне</a><a href={`${landingUrl}#pricing`}>Тарифы</a>
    </nav>
    <button className="landing-header__action" type="button" data-consultation-trigger>Оставить заявку</button>
  </>;
}

function MetricTicks({ count }: { count: number }) {
  return <div className="landing-plan__ticks" aria-hidden="true">{Array.from({ length: 12 }, (_, tick) => <span className={tick < count ? 'is-filled' : ''} style={{ animationDelay: `${tick * 120}ms` }} key={tick} />)}</div>;
}

function movePlanLight(event: PointerEvent<HTMLElement>) {
  if (event.pointerType === 'touch') return;
  const bounds = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--plan-light-x', `${event.clientX - bounds.left}px`);
  event.currentTarget.style.setProperty('--plan-light-y', `${event.clientY - bounds.top}px`);
}

const formatPrice = (price: number) => price.toLocaleString('ru-RU');

export function PricingSection() {
  const compareRef = useRef<HTMLDialogElement>(null);
  const [mainPlan, steadyPlan] = plans;
  return <section className="landing-section landing-pricing" id="pricing" aria-label="Тарифы">
    <div className="landing-pricing__grid">{plans.map((plan, index) => <article className={`landing-plan${index === 0 ? ' landing-plan--featured' : ''}`} key={plan.label} onPointerMove={movePlanLight}>
      <div className="landing-plan__label"><h3>{plan.label}</h3></div>
      <div className="landing-plan__cost"><p className="landing-plan__price">{formatPrice(plan.price)} <span>₽</span></p><p className="landing-plan__term">в месяц</p></div>
      <div className="landing-plan__metrics" aria-label="В месяц входит"><div><div className="landing-plan__metric-heading"><span>Индивидуальные занятия</span><strong>{plan.hours} <small>ч / месяц</small></strong></div><MetricTicks count={plan.hours} /></div><div><div className="landing-plan__metric-heading"><span>Код-ревью</span><strong>{plan.reviewCount} <small>/ месяц</small></strong></div><MetricTicks count={plan.reviewCount} /></div></div>
      <ul className="landing-plan__benefits">{plan.items.map(item => <li key={item.title}><span className="landing-plan__benefit-icon" aria-hidden="true"><item.icon size={17} strokeWidth={1.7} /></span><div><strong>{item.title}</strong><span>{item.description}</span></div></li>)}</ul>
      <button className="landing-plan__action" type="button" data-consultation-trigger>{index === 0 ? 'Обсудить главный формат' : 'Обсудить стабильный ритм'} <span className="landing-plan__action-arrow" aria-hidden="true"><ArrowUpRight size={17} strokeWidth={2} /></span></button>
    </article>)}</div>
    <button className="landing-pricing__compare-trigger" type="button" onClick={() => compareRef.current?.showModal()} aria-haspopup="dialog">Сравнить форматы <span aria-hidden="true">↗</span></button>
    <dialog className="pricing-dialog" ref={compareRef} aria-labelledby="pricing-dialog-title" onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      <button className="pricing-dialog__close" type="button" onClick={() => compareRef.current?.close()} aria-label="Закрыть сравнение"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
      <div className="pricing-dialog__content">
        <h3 id="pricing-dialog-title" tabIndex={-1} autoFocus>Сравните форматы</h3>
        <div className="pricing-dialog__table-wrap"><table><thead><tr><th scope="col">Условия</th>{plans.map(plan => <th scope="col" key={plan.label}><span>{plan.label}</span><strong>{formatPrice(plan.price)} ₽ <small>/ месяц</small></strong></th>)}</tr></thead><tbody>
          <tr className="pricing-dialog__shared"><th scope="row">Занятия</th><td>Индивидуально с наставником</td><td>Индивидуально с наставником</td></tr>
          <tr className="pricing-dialog__shared"><th scope="row">Платформа</th><td>Доступ на месяц</td><td>Доступ на месяц</td></tr>
          <tr className="pricing-dialog__shared"><th scope="row">Проект</th><td>Работа над проектом</td><td>Работа над проектом</td></tr>
          <tr><th scope="row">Индивидуальные занятия, часов в месяц</th><td><div className="pricing-dialog__quantity"><strong>{mainPlan.hours}</strong></div></td><td><div className="pricing-dialog__quantity"><strong>{steadyPlan.hours}</strong></div></td></tr>
          <tr><th scope="row">Код-ревью, проверок в месяц</th><td><div className="pricing-dialog__quantity"><strong>{mainPlan.reviewCount}</strong></div></td><td><div className="pricing-dialog__quantity"><strong>{steadyPlan.reviewCount}</strong></div></td></tr>
          <tr><th scope="row">Разбор кода</th><td>Каждое задание, до {mainPlan.reviewCount} проверок</td><td>Разбор важных решений</td></tr>
          <tr><th scope="row">План и практика</th><td>Личный маршрут под вашу цель</td><td>План самостоятельной практики</td></tr>
          <tr><th scope="row">Темы</th><td>Последовательно разбираем каждую тему</td><td>Сосредоточимся на ключевых затруднениях</td></tr>
          <tr><th scope="row">Работа над проектом</th><td>Разбираем проект на каждом этапе</td><td>Обсуждаем ключевые трудности</td></tr>
          <tr><th scope="row">Поддержка</th><td>Пишите в Telegram в любое время. Ваши вопросы в приоритете</td><td>Не указана отдельно</td></tr>
        </tbody></table></div>
      </div>
    </dialog>
  </section>;
}

const reviews = [
  { name: 'Дмитрий Вострецов', handle: 'dimkalu46i', role: 'Backend-разработчик в Ozon', photo: dmitriyPhoto, context: 'Для тех, у кого уже есть база', mentorStory: ['Дмитрий пришёл ко мне с хорошей базой после ИТМО. Он хотел понять, что мешает проходить на более сильные вакансии.', 'Мы начали с разбора его знаний, чтобы не тратить время на знакомые темы. Затем работали над Python, архитектурой и тем, как объяснять решения на собеседовании.'], caseOutcome: 'Через три месяца подготовки Дмитрий получил оффер в Ozon.', text: 'Сначала мы просто разобрали, что я уже умею, а где начинаю плавать. Заново проходить знакомые темы не пришлось. Больше всего времени ушло на Python, архитектурные вопросы и на то, чтобы нормально объяснять свои решения, а не только писать код.', result: 'Подготовка: 3 месяца · Тренировочных интервью: 5', paragraphs: ['После ИТМО я, если честно, думал, что хорошей базы уже должно хватить. Но на практике я работал на позиции, которая мне не нравилась, получал около 100 000 ₽ и не понимал, почему на более сильные вакансии всё ещё не прохожу.', 'Сначала мы просто разобрали, что я уже умею, а где начинаю плавать. Заново проходить знакомые темы не пришлось. Больше всего времени ушло на Python, архитектурные вопросы и на то, чтобы нормально объяснять свои решения, а не только писать код. Тренировочные интервью хорошо показали, где я пока не готов и что ещё нужно подтянуть.', 'После подготовки я получил оффер в Ozon на 250 000 ₽. До сих пор работаю в компании, а сейчас получаю уже больше 300 000 ₽.'] },
  { name: 'Варвара Николаева', handle: 'varznik', role: 'Из поддержки в Python-разработку', photo: varvaraPhoto, context: 'Для тех, кто учится самостоятельно', mentorStory: ['Варвара пришла ко мне после самостоятельного обучения. Она изучала курсы и статьи, но ей не хватало уверенности, когда нужно было написать код самой.', 'Мы сосредоточились на практике: Варвара приносила решения, получала замечания и дорабатывала код. Постепенно она собрала свой API и подготовилась к техническим интервью.'], caseOutcome: 'За пять месяцев Варвара получила первую работу Python-разработчиком.', text: 'Я приносила код, получала замечания и переделывала решение. Иногда хотелось оставить «и так работает», но именно на таких доработках я наконец начала понимать, почему одно решение нормальное, а другое развалится при первой же правке.', result: 'Подготовка: 5 месяцев · Код-ревью каждую неделю', paragraphs: ['У меня долго было ощущение, что я всё время учусь, но разработчиком так и не становлюсь. Я работала в поддержке, проходила курсы, сохраняла статьи, делала конспекты, а когда нужно было написать что-то самой, уверенности всё равно не было.', 'Здесь уже не получалось просто посмотреть урок и поставить галочку. Я приносила код, получала замечания и переделывала решение. Иногда хотелось оставить «и так работает», но именно на таких доработках я наконец начала понимать, почему одно решение нормальное, а другое развалится при первой же правке.', 'За пять месяцев я собрала API, подготовилась к техническим интервью и получила первую работу Python-разработчиком с зарплатой 170 000 ₽. Для меня самым важным было то, что я наконец перестала считать себя человеком, который только учится.'] },
  { name: 'Захар Казначеев', handle: 'kaz_zax', role: 'Со склада в удалённый backend', photo: zaharPhoto, context: 'Для тех, кто совмещает работу и учёбу', mentorStory: ['Захар пришёл ко мне, когда работал на складе. Ему было важно учиться, не увольняясь и не подстраивая всю жизнь под занятия.', 'Мы выстроили обучение вокруг его смен: небольшие задачи в рабочие дни, проект в выходные. Если он выпадал из ритма, возвращались к ближайшему понятному шагу.'], caseOutcome: 'Захар сменил работу после оффера и стал junior backend-разработчиком на удалёнке.', text: 'Поэтому график собирали вокруг моей реальной жизни, а не вокруг идеальной недели из расписания. В рабочие дни я делал небольшие задачи, в выходные садился за проект.', result: 'Нагрузка: 15 часов в неделю · Не увольнялся до оффера', paragraphs: ['Я работал на складе и получал около 150 000 ₽. Деньги были нормальные, поэтому вариант «увольняйся и полгода только учись» мне вообще не подходил. После смены сил часто оставалось максимум на короткое занятие, а иногда не оставалось совсем.', 'Поэтому график собирали вокруг моей реальной жизни, а не вокруг идеальной недели из расписания. В рабочие дни я делал небольшие задачи, в выходные садился за проект. Если выпадал, не пытался за один вечер наверстать всё сразу, возвращался к ближайшей понятной точке и продолжал.', 'Со склада я ушёл только после оффера. Устроился junior backend-разработчиком на удалёнку с зарплатой 160 000 ₽. По деньгам рост был не огромным, зато исчезли дорога и физические смены, а главное, появилась профессия, в которой я вижу, куда расти дальше.'] },
];

function StoryPhoto({ src, alt = '', lazy = false }: { src: string; alt?: string; lazy?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return <img src={src} alt={alt} loading={lazy ? 'lazy' : 'eager'} className={`story-photo${loaded ? ' story-photo--loaded' : ''}`} onLoad={() => setLoaded(true)} onError={() => setLoaded(false)} />;
}

export function ReviewsSection() {
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (active !== null && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
  }, [active]);
  const review = active === null ? null : reviews[active];
  return <section className="landing-section landing-stories" id="reviews" aria-labelledby="stories-title">
    <div className="landing-stories__heading"><h2 id="stories-title">Три показательных кейса</h2></div>
    <div className="story-portraits">{reviews.map((item, index) => <button type="button" className="story-portrait" key={item.handle} onClick={() => setActive(index)} aria-label={`Прочитать историю: ${item.name}`}>
      <StoryPhoto src={item.photo} lazy /><span className="story-portrait__shade" aria-hidden="true" />
      <span className="story-portrait__info"><span className="story-portrait__context">{item.context}</span><strong>{item.name}</strong><span className="story-portrait__role">{item.role}</span><span className="story-portrait__teaser">«{item.text}»</span><span className="story-portrait__action">Открыть историю <span aria-hidden="true">↗</span></span></span>
    </button>)}</div>
    <dialog className="story-dialog" ref={dialogRef} onClose={() => setActive(null)} aria-labelledby="story-dialog-title" onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      {review && <><button className="story-dialog__close" type="button" autoFocus onClick={() => dialogRef.current?.close()} aria-label="Закрыть историю"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></button><div className="story-dialog__layout"><div className="story-dialog__photo"><img src={review.photo} alt={`Портрет: ${review.name}`} /><div><span>История ученика</span><strong>{review.name}</strong></div></div><div className="story-dialog__content"><p className="landing-overline">{review.context}</p><h3 id="story-dialog-title">{review.role}</h3><div className="story-dialog__author"><strong>{review.name}</strong><a href={`https://t.me/${review.handle}`} target="_blank" rel="noopener noreferrer">@{review.handle} ↗</a></div><section className="story-dialog__guide" aria-label="О чём этот кейс"><p className="case-path__eyebrow">Как проходило обучение</p><div className="case-path__story">{review.mentorStory.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><div className="case-path__outcome"><p>{review.caseOutcome}</p></div></section><div className="story-dialog__text"><h4>История ученика</h4>{review.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><p className="story-dialog__result">{review.result}</p></div></div></>}
    </dialog>
  </section>;
}

type Page = 'reviews' | 'platform' | 'pricing';
const titles: Record<Page, string> = { reviews: 'Истории учеников', platform: 'О платформе', pricing: 'Тарифы' };

export function LandingDetailPage({ page }: { page: Page }) {
  useEffect(() => { const previous = document.title; document.title = `${titles[page]} | knowi`; return () => { document.title = previous; }; }, [page]);
  return <main className="backend-landing" aria-labelledby="detail-title"><div className="backend-landing__scene"><ProgrammingBackground /><div className="backend-landing__inner">
    <div className="landing-header-layer"><header className="landing-header"><a className="landing-brand" href={landingUrl}>Никита Кирюхин</a><LandingNav /></header></div><ConsultationForm showActions={false} />
    <div className="landing-detail"><a className="landing-detail__back" href={landingUrl}>← На главную</a>
      {page === 'reviews' && <><div className="landing-detail__intro"><p className="landing-overline">Истории учеников</p><h1 id="detail-title">Разные точки старта — свои пути в backend</h1><p>Истории учеников о практике, обратной связи и движении к своим целям.</p></div><div className="landing-reviews">{reviews.map(review => <article className="landing-review" key={review.name}><img src={review.photo} alt="" loading="lazy" /><div><p className="landing-overline">{review.context}</p><h2>{review.role}</h2><div className="landing-review__context"><p className="case-path__eyebrow">Как проходило обучение</p><div className="case-path__story">{review.mentorStory.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div><div className="case-path__outcome"><p>{review.caseOutcome}</p></div></div><blockquote>{review.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</blockquote><p>{review.result}</p><strong>{review.name}</strong> · <a href={`https://t.me/${review.handle}`} target="_blank" rel="noopener noreferrer">@{review.handle} ↗</a></div></article>)}</div></>}
      {page === 'platform' && <><div className="landing-detail__intro"><p className="landing-overline">Учебная платформа</p><h1 id="detail-title">knowi: теория, практика и обратная связь в одном месте</h1><p>Здесь удобно учиться в своём темпе, возвращаться к материалам и видеть следующий шаг.</p></div><section className="landing-detail__block landing-platform-detail"><div><p className="landing-overline">Знакомство с платформой</p><h2>Посмотрите, как устроено обучение</h2><p>Здесь появится видео с обзором платформы и рабочего пространства ученика.</p><a className="primary-action landing-action" href={platformUrl}>Открыть платформу <span aria-hidden="true">↗</span></a></div><div className="landing-video-placeholder" aria-label="Место для видеообзора платформы"><div className="landing-video-placeholder__bar" aria-hidden="true"><span /><span /><span /><small>knowi / видеообзор</small></div><div className="landing-video-placeholder__content"><span className="landing-video-placeholder__play" aria-hidden="true">▶</span><strong>Знакомство с knowi</strong><small>Здесь будет видео о платформе</small></div><div className="landing-video-placeholder__timeline" aria-hidden="true"><span /></div></div></section><section className="landing-detail__block"><h2>Что внутри</h2><div className="landing-detail__columns"><p><strong>Теория и практика.</strong> Материалы и задания собраны в одном учебном пространстве.</p><p><strong>Разбор решений.</strong> Код-ревью помогает увидеть ошибки и понять, как двигаться дальше.</p><p><strong>Прогресс.</strong> Можно вернуться к пройденным материалам и продолжить обучение.</p></div></section></>}
      {page === 'pricing' && <><div className="landing-detail__intro"><p className="landing-overline">Тарифы</p><h1 id="detail-title">Формат под вашу цель</h1><p>Выберите подходящий ритм и обсудите детали на бесплатной консультации.</p></div><PricingSection /></>}
    </div><footer className="landing-footer"><a className="landing-brand" href={landingUrl}>knowi</a><a href={`${landingUrl}/privacy-policy`}>Политика обработки данных</a><a href={`${landingUrl}/personal-data`}>Согласие на обработку данных</a><span>ИП КИРЮХИН Н.А. ИНН 230109261735</span></footer>
  </div></div></main>;
}

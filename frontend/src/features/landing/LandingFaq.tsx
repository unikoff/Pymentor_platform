import { useId, useState } from 'react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import mentorPhoto from './assets/mentor-portrait.png';
import './landing-faq.css';

type FaqQuestion = {
  question: string;
  lead: string;
  answer: string;
  href?: string;
  link?: string;
};

const questions: FaqQuestion[] = [
  {
    question: 'Я никогда не писал код. С чего начнём?',
    lead: 'С основ Python и первых небольших задач.',
    answer: 'Разберём новые темы на примерах и сразу закрепим их кодом. На личных занятиях подстроим темп под вас и вернёмся к тому, что пока непонятно. Опыт программирования для старта не нужен.',
  },
  {
    question: 'Уже учу Python. Придётся начинать заново?',
    lead: 'Оттолкнёмся от того, что вы уже умеете.',
    answer: 'Обсудим ваш опыт и цель, найдём пробелы и выберем следующие темы. Вместо повторения всей программы сосредоточимся на том, где вам нужны практика и обратная связь.',
  },
  {
    question: 'Как совмещать обучение с работой?',
    lead: 'Подберём ритм под ваш график.',
    answer: 'На консультации обсудим время на встречи и самостоятельную практику. Между занятиями вы сможете заниматься на Pymentor в удобное время. Регулярная работа с кодом остаётся важной частью обучения.',
  },
  {
    question: 'Что делать, если застряну в задаче?',
    lead: 'Разберём ваш код и ход решения.',
    answer: 'На код-ревью покажу, где возникла ошибка, объясню её причину и предложу, что улучшить. На личной встрече разберём сложные места, а затем вы доработаете решение и закрепите подход на практике.',
  },
  {
    question: 'Можно сначала попробовать?',
    lead: 'Да. Начните со знакомства с Pymentor.',
    answer: 'Откройте платформу и посмотрите, как устроены занятия. После бесплатной консультации я открою пробный доступ на несколько дней, чтобы вы попробовали обучение и оценили формат.',
    href: import.meta.env.BASE_URL,
    link: 'Посмотреть платформу',
  },
  {
    question: 'Что будет на бесплатной консультации?',
    lead: 'Обсудим вашу цель и определим первый шаг.',
    answer: 'Расскажите, что уже пробовали, чего хотите достичь и какие вопросы накопились. Обсудим подходящий формат и темп занятий. Специально готовиться к встрече не нужно.',
    href: '#path',
    link: 'Перейти к записи',
  },
  {
    question: 'Что входит в «Старт в Python» за 5 000 ₽?',
    lead: '30 дней, чтобы познакомиться с форматом.',
    answer: 'В пакет для новых учеников входят 4 индивидуальных занятия по 60 минут, 4 код-ревью и доступ к Pymentor на 30 дней. Попробуете личные встречи, практику и разбор своих решений.',
    href: '#start',
    link: 'Посмотреть стартовый пакет',
  },
  {
    question: 'Поможете подготовиться к работе в backend?',
    lead: 'От проекта — к резюме и собеседованиям.',
    answer: 'Будем развивать backend-проект, разбирать технические темы, дорабатывать резюме и готовиться объяснять свои решения на интервью. Срок поиска работы зависит от вашего уровня, практики и ситуации на рынке.',
    href: '#career',
    link: 'Как готовимся к работе',
  },
];

function AnswerContent({ item, sizing = false }: { item: FaqQuestion; sizing?: boolean }) {
  return <div className="faq-redesign__answer-copy">
    <p><strong>{item.lead}</strong>{item.answer}</p>
    {item.href && item.link && (sizing
      ? <span className="faq-redesign__answer-link">{item.link}<ArrowUpRight size={15} aria-hidden="true" /></span>
      : <a className="faq-redesign__answer-link" href={item.href}>{item.link}<ArrowUpRight size={15} aria-hidden="true" /></a>)}
  </div>;
}

export function LandingFaq() {
  const [active, setActive] = useState<number | null>(0);
  const id = useId();

  return <section className="landing-section faq-redesign landing-reveal" id="faq" aria-labelledby={`${id}-title`} data-reveal data-scene="faq">
    <div className="faq-redesign__intro">
      <div className="faq-redesign__heading">
        <h2 id={`${id}-title`}>Всё, что важно <span>до старта</span></h2>
        <p>Ваш уровень, время на учёбу, помощь с кодом. Отвечаю на вопросы, которые возникают перед первым шагом.</p>
      </div>
      <div className="faq-redesign__contact">
        <div className="faq-redesign__mentor">
          <img src={mentorPhoto} alt="" width="52" height="52" loading="lazy" />
          <div><strong>Никита Кирюхин</strong><span>Ваш будущий наставник</span></div>
        </div>
        <p>Есть вопрос о вашей ситуации?</p>
        <span className="faq-redesign__contact-note">Расскажите о своей цели — помогу понять, с чего начать.</span>
        <a href="https://t.me/unikoff" target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" /><span>Задать вопрос в Telegram</span><ArrowUpRight size={18} aria-hidden="true" /></a>
      </div>
    </div>
    <div className="faq-redesign__list-frame">
      <div className="faq-redesign__list">
        {questions.map((item, index) => {
          const open = active === index;
          const questionId = `${id}-question-${index}`;
          const answerId = `${id}-answer-${index}`;
          return <article className={`faq-redesign__item${open ? ' faq-redesign__item--open' : ''}`} key={item.question}>
            <h3><button id={questionId} type="button" aria-expanded={open} aria-controls={answerId} onClick={() => setActive(current => current === index ? null : index)}>
              <span className="faq-redesign__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <span className="faq-redesign__question">{item.question}</span>
              <i aria-hidden="true" />
            </button></h3>
            <div id={answerId} className="faq-redesign__answer" role="region" aria-labelledby={questionId} hidden={!open}>
              <AnswerContent item={item} />
            </div>
          </article>;
        })}
      </div>
      {/* Reserve the tallest answer so the surrounding scroll-snap section stays still. */}
      <div className="faq-redesign__list faq-redesign__reserve" aria-hidden="true">
        {questions.map((item, index) => <div className="faq-redesign__item" key={item.question}>
          <div className="faq-redesign__sizer-question"><span className="faq-redesign__number">{String(index + 1).padStart(2, '0')}</span><span className="faq-redesign__question">{item.question}</span><i /></div>
        </div>)}
        <div className="faq-redesign__answer-sizes">{questions.map(item => <AnswerContent item={item} sizing key={item.question} />)}</div>
      </div>
    </div>
  </section>;
}

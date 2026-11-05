import { useId, useState } from 'react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import './landing-faq.css';

const questions = [
  { question: 'Подойдёт ли обучение с нуля?', answer: 'Да. Начнём с вашего уровня и будем разбирать основы Python на практике. Вы можете бесплатно познакомиться с платформой ещё до консультации.' },
  { question: 'Я уже изучаю Python. Можно продолжить с моего уровня?', answer: 'Да. Обсудим, что вы уже знаете и куда хотите двигаться. Сосредоточимся на ваших вопросах и практике, не возвращаясь ко всем знакомым темам.' },
  { question: 'Можно ли совмещать обучение с работой?', answer: 'Да. На консультации обсудим ваш график и доступное время, чтобы подобрать подходящий формат занятий.' },
  { question: 'Можно ли попробовать платформу бесплатно?', answer: 'Да. Откройте Pymentor и познакомьтесь с занятиями и практикой в удобное время.', href: import.meta.env.BASE_URL, link: 'Открыть платформу' },
  { question: 'Как проходит бесплатная консультация?', answer: 'Познакомимся, обсудим ваш опыт, цель и вопросы. Вместе определим, какой формат обучения вам подходит.', href: '#path', link: 'Подробнее о консультации' },
  { question: 'Что входит в «Старт в Python»?', answer: 'Четыре индивидуальных занятия по 60 минут, четыре код-ревью и доступ к Pymentor на 30 дней. Стартовый пакет для новых учеников стоит 5 000 ₽.' },
  { question: 'Как наставник помогает с кодом?', answer: 'Я разбираю ваши решения, показываю ошибки и объясняю, что можно улучшить. Вы сможете доработать код и применить обратную связь в следующих задачах.' },
  { question: 'Можно ли подготовиться к работе в backend?', answer: 'Да. Мы можем работать над проектом, разбирать технические темы и готовиться к собеседованиям. Результат зависит от вашего опыта, практики и ситуации на рынке.' },
] as const;

export function LandingFaq() {
  const [active, setActive] = useState<number | null>(0);
  const id = useId();

  return <section className="landing-section faq-redesign landing-reveal" id="faq" aria-labelledby={`${id}-title`} data-reveal data-scene="faq">
    <div className="faq-redesign__intro">
      <h2 id={`${id}-title`}>Остались вопросы?</h2>
      <p>Собрал ответы о занятиях, платформе и первых шагах в обучении.</p>
      <div className="faq-redesign__contact"><MessageCircle size={19} aria-hidden="true" /><div><strong>Не нашли свой вопрос?</strong><span>Напишите мне, всё обсудим лично.</span><a href="#path">Связаться со мной <ArrowUpRight size={16} aria-hidden="true" /></a></div></div>
    </div>
    <div className="faq-redesign__list-frame">
    <div className="faq-redesign__list">
      {questions.map((item, index) => {
        const open = active === index;
        const questionId = `${id}-question-${index}`;
        const answerId = `${id}-answer-${index}`;
        return <article className={`faq-redesign__item${open ? ' faq-redesign__item--open' : ''}`} key={item.question}>
          <h3><button id={questionId} type="button" aria-expanded={open} aria-controls={answerId} onClick={() => setActive(current => current === index ? null : index)}><span>{item.question}</span><i aria-hidden="true" /></button></h3>
          <div id={answerId} className="faq-redesign__answer" role="region" aria-labelledby={questionId} aria-hidden={!open}><div className="faq-redesign__answer-inner"><p>{item.answer}{'href' in item && <> <a href={item.href}>{item.link} <ArrowUpRight size={14} aria-hidden="true" /></a></>}</p></div></div>
        </article>;
      })}
    </div>
    <div className="faq-redesign__list faq-redesign__reserve" aria-hidden="true">
      {questions.map(item => <div className="faq-redesign__item" key={item.question}><div className="faq-redesign__sizer-question"><span>{item.question}</span><i /></div></div>)}
      <div className="faq-redesign__answer-sizes">{questions.map(item => <p key={item.question}>{item.answer}{'link' in item && <> <span>{item.link} ↗</span></>}</p>)}</div>
    </div>
    </div>
  </section>;
}

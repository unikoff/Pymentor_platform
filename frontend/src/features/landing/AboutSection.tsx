import portrait from './assets/mentor-portrait.png';
import './about-section.css';

export function AboutSection() {
  return <section className="mentor-about" id="about" aria-labelledby="mentor-about-title">
    <div className="mentor-about__portrait">
      <img src={portrait} alt="Никита Кирюхин, backend-разработчик и наставник" loading="lazy" />
      <div className="mentor-about__identity">
        <strong>Никита Кирюхин</strong>
      </div>
    </div>

    <div className="mentor-about__content">
      <h2 id="mentor-about-title">Станьте backend-разработчиком <span>с наставником</span></h2>
      <p className="mentor-about__intro">Я опытный backend-разработчик. Делюсь опытом реальной разработки, чтобы вы освоили нужные технологии и научились применять их в своих проектах.</p>

      <div className="mentor-about__experience">
        <div><h3>Опыт разработки</h3><p>Работал над большим количеством коммерческих продуктов. Основной стек: Python, FastAPI, PostgreSQL, Redis и Docker. Помогу разобраться, как создавать backend-приложения на этих технологиях.</p></div>
        <div><h3>Опыт преподавания</h3><p>Преподавал в онлайн-школах. Объясняю сложные темы понятным языком, разбираю ваш код и выстраиваю обучение под вашу цель.</p></div>
      </div>

      <div className="mentor-about__stats" aria-label="Опыт разработки и руководства">
        <div><strong>5 <small>лет</small></strong><span>в разработке</span></div>
        <div><strong>CEO</strong><span>опыт руководства</span></div>
        <div><strong className="mentor-about__stats-title">Стартап</strong><span>собственный проект</span></div>
      </div>
      <div className="mentor-about__actions">
        <a className="primary-action landing-action" href="#path">Отправить заявку <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </section>;
}

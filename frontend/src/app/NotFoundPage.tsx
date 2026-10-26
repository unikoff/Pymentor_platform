export function NotFoundPage() {
  return (
    <main className="status-page status-page--not-found">
      <div className="status-page__glow status-page__glow--one" aria-hidden="true" />
      <div className="status-page__glow status-page__glow--two" aria-hidden="true" />
      <section className="not-found-card" aria-labelledby="not-found-title">
        <div className="status-brand">
          <span className="status-brand__mark" aria-hidden="true"><i /><i /><i /><i /></span>
          <span>pymentor<span className="status-brand__dot">.</span></span>
        </div>

        <div className="not-found-illustration" aria-hidden="true">
          <div className="not-found-illustration__halo" />
          <span className="not-found-illustration__four">4</span>
          <span className="not-found-illustration__planet">0</span>
          <span className="not-found-illustration__four">4</span>
          <i className="not-found-illustration__star not-found-illustration__star--one" />
          <i className="not-found-illustration__star not-found-illustration__star--two" />
          <i className="not-found-illustration__star not-found-illustration__star--three" />
          <span className="not-found-illustration__orbit-label">ПОИСК НЕ ДАЛ РЕЗУЛЬТАТА</span>
        </div>

        <p className="status-kicker">ПОХОЖЕ, МЫ ЗАБЛУДИЛИСЬ</p>
        <h1 id="not-found-title">Такой страницы<br /><em>пока нет</em></h1>
        <p className="not-found-copy">Ссылка могла измениться или в ней закралась опечатка. Вернёмся к занятиям и продолжим путь.</p>
        <a className="status-home-link" href={import.meta.env.BASE_URL}>
          <span aria-hidden="true">←</span> Вернуться на платформу
        </a>
        <p className="not-found-hint">Всё нужное для обучения уже на главной</p>
      </section>
      <footer className="status-footer">УЧИТЬСЯ · ПРОБОВАТЬ · СОЗДАВАТЬ</footer>
    </main>
  );
}

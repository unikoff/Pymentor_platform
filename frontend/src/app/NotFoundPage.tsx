import { platformUrl } from "../shared/paths";

export function NotFoundPage() {
  return (
    <main className="status-page status-page--not-found">
      <section className="not-found-card" aria-labelledby="not-found-title">
        <div className="status-brand">
          <span className="status-brand__mark" aria-hidden="true"><i /><i /><i /><i /></span>
          <span>knowi<span className="status-brand__dot">.</span></span>
        </div>

        <div className="not-found-illustration" aria-hidden="true">
          <span className="not-found-illustration__four">4</span>
          <span className="not-found-illustration__planet">0</span>
          <span className="not-found-illustration__four">4</span>
        </div>

        <h1 id="not-found-title">Такой страницы<br /><em>пока нет</em></h1>
        <a className="status-home-link" href={platformUrl}>
          <span aria-hidden="true">←</span> Вернуться на платформу
        </a>
      </section>
    </main>
  );
}

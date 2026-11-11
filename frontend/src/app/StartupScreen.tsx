export function StartupScreen() {
  return (
    <main className="status-page status-page--loading" aria-labelledby="startup-title">
      <section className="startup-card" role="status" aria-live="polite">
        <div className="status-brand">
          <span className="status-brand__mark" aria-hidden="true"><i /><i /><i /><i /></span>
          <span>knowi<span className="status-brand__dot">.</span></span>
        </div>

        <div className="startup-art" aria-hidden="true">
          <div className="startup-art__orbit startup-art__orbit--inner" />
          <div className="startup-art__book">
            <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <rect x="10" y="7" width="30" height="34" rx="4" />
              <path d="M17 7v34" />
              <path className="startup-art__line startup-art__line--first" d="M23 17h10" pathLength="1" />
              <path className="startup-art__line startup-art__line--second" d="M23 23h10" pathLength="1" />
              <path className="startup-art__line startup-art__line--third" d="M23 29h7" pathLength="1" />
            </svg>
          </div>
        </div>

        <h1 id="startup-title">Собираем ваши<br /><em>идеи в навыки</em></h1>
        <p className="startup-copy">Открываем платформу</p>
      </section>
    </main>
  );
}

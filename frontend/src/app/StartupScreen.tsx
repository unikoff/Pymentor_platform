export function StartupScreen() {
  return (
    <main className="status-page status-page--loading" aria-labelledby="startup-title">
      <div className="status-page__glow status-page__glow--one" aria-hidden="true" />
      <div className="status-page__glow status-page__glow--two" aria-hidden="true" />
      <section className="startup-card" role="status" aria-live="polite">
        <div className="status-brand">
          <span className="status-brand__mark" aria-hidden="true"><i /><i /><i /><i /></span>
          <span>pymentor<span className="status-brand__dot">.</span></span>
        </div>

        <div className="startup-art" aria-hidden="true">
          <div className="startup-art__orbit startup-art__orbit--outer" />
          <div className="startup-art__orbit startup-art__orbit--inner" />
          <div className="startup-art__book"><span /><span /><i /></div>
          <i className="startup-art__spark startup-art__spark--one" />
          <i className="startup-art__spark startup-art__spark--two" />
          <i className="startup-art__spark startup-art__spark--three" />
        </div>

        <p className="status-kicker">ВАШЕ ПРОСТРАНСТВО ДЛЯ РОСТА</p>
        <h1 id="startup-title">Собираем ваши<br /><em>идеи в навыки</em></h1>
        <p className="startup-copy">Подготавливаем занятия, редактор и всё необходимое для нового шага.</p>

        <div className="startup-progress" aria-hidden="true"><span /></div>
        <div className="startup-loading-note"><span className="startup-loading-note__pulse" />Открываем платформу</div>

        <div className="startup-preview" aria-hidden="true">
          <div className="startup-preview__line startup-preview__line--short" />
          <div className="startup-preview__line" />
          <div className="startup-preview__line startup-preview__line--medium" />
          <div className="startup-preview__badge"><span />Ваш следующий шаг</div>
        </div>
      </section>
      <footer className="status-footer">УЧИТЬСЯ · ПРОБОВАТЬ · СОЗДАВАТЬ</footer>
    </main>
  );
}

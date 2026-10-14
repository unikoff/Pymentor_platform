import { Component, Suspense, type ReactNode } from "react";

class LoadErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }

  render() {
    if (this.state.failed) return <div className="form-error" role="alert">
      <p>Не удалось загрузить эту часть платформы. Обновите страницу, чтобы попробовать снова.</p>
      <button className="secondary-action" type="button" onClick={() => window.location.reload()}>Обновить страницу</button>
    </div>;
    return this.props.children;
  }
}

export function AsyncBoundary({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <LoadErrorBoundary>
    <Suspense fallback={fallback ?? <div className="panel-message" role="status">Загружаем панель…</div>}>{children}</Suspense>
  </LoadErrorBoundary>;
}

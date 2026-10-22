import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import "./lesson-loading.css";

export function LessonLoading() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 180);
    return () => window.clearTimeout(timer);
  }, []);
  if (!visible) return <div className="lesson-loading lesson-loading--pending" role="status" aria-busy="true" />;
  return <div className="lesson-loading" role="status" aria-live="polite">
    <div className="lesson-loading__visual" aria-hidden="true">
      <span className="lesson-loading__orbit" />
      <span className="lesson-loading__code">{'{ }'}</span>
      <i /><i /><i />
    </div>
    <strong>Собираем следующий шаг</strong>
    <span>Подготавливаем занятие</span>
    <div className="lesson-loading__track" aria-hidden="true"><span /></div>
  </div>;
}

// Reveal ready material immediately; each content root owns its entry animation.
export function LessonTransition({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const stage = root.current?.closest<HTMLElement>(".lesson-stage");
    if (stage) stage.scrollTop = 0;
  }, []);
  return <div ref={root} className="lesson-transition">
    <div className="lesson-transition__content">{children}</div>
  </div>;
}

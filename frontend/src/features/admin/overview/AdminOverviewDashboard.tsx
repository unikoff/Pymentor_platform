import "./overview.css";
import { useEffect, useState, type ReactNode } from "react";
import { Activity, BookOpenCheck, CalendarClock, ChevronRight, RefreshCw, ShieldAlert } from "lucide-react";
import { getAdminOverview } from "../api";
import type { AdminOverview } from "../../../shared/api/contracts";

type Props = { onOpenStudent: (studentId: number) => void };

function formatDayMonth(value: string) {
  const match = value.slice(0, 10).match(/^\d{4}-(\d{2})-(\d{2})$/);
  if (!match) return value;
  return `${match[2]}.${match[1]}`;
}

function formatMonth(value: string) {
  const match = value.slice(0, 10).match(/^(\d{4})-(\d{2})-/);
  if (!match) return "";
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

function formatStudentCount(count: number) {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  const noun = lastTwoDigits >= 11 && lastTwoDigits <= 14
    ? "учеников"
    : lastDigit === 1
      ? "ученик"
      : lastDigit >= 2 && lastDigit <= 4
        ? "ученика"
        : "учеников";
  const verb = count === 1 ? "заходил" : "заходили";
  return `${count.toLocaleString("ru-RU")} ${noun} ${verb}`;
}

function formatPlan(value: string) {
  return value.charAt(0).toLocaleUpperCase("ru-RU") + value.slice(1);
}

function MetricCard({ icon, title, value, tone = "green" }: {
  icon: ReactNode;
  title: string;
  value: string;
  tone?: "green" | "amber";
}) {
  return (
    <article className={`admin-overview__metric is-${tone}`}>
      <span className="admin-overview__metric-icon" aria-hidden="true">{icon}</span>
      <div className="admin-overview__metric-content">
        <h2>{title}</h2>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function TrendChart({ points }: {
  points: AdminOverview["daily_active_students"];
}) {
  const maximum = Math.max(0, ...points.map((point) => point.active_students));
  const dateLabels = new Set(points.flatMap((point, index) => {
    const day = Number(point.date.slice(8, 10));
    return day === 1 || day % 5 === 0 ? [index] : [];
  }));
  const month = formatMonth(points[0]?.date ?? "");
  const scaleLabels = maximum > 1 ? [maximum, Math.ceil(maximum / 2), 0] : maximum === 1 ? [1, 0] : [0];
  const accessibleSummary = points
    .map((point) => `${formatDayMonth(point.date)}: ${formatStudentCount(point.active_students)}`)
    .join("; ");

  return (
    <section className="admin-overview__trends" aria-label={`Активность учеников за ${month}`}>
      <div className="admin-overview__section-heading">
        <h2>Активные ученики по дням</h2>
        <span>{month}</span>
      </div>
      <div className="admin-overview__plot">
        <div className={`admin-overview__y-axis ${maximum === 0 ? "is-empty" : ""}`} aria-hidden="true">
          {scaleLabels.map((value, index) => <span key={`${value}-${index}`}>{value}</span>)}
        </div>
        <div className="admin-overview__bars" role="group" aria-label={accessibleSummary}
          style={{ gridTemplateColumns: `repeat(${Math.max(points.length, 1)}, minmax(0, 1fr))` }}>
          {points.map((point, index) => {
            const value = point.active_students;
            const height = maximum ? (value / maximum) * 100 : 0;
            const date = formatDayMonth(point.date);
            const description = `${date}: ${formatStudentCount(value)}`;
            return (
              <div className="admin-overview__bar-column" key={point.date} role="img" tabIndex={0}
                title={description} aria-label={description}>
                <span className="admin-overview__bar-track">
                  <span className="admin-overview__bar" style={{ height: `${height}%` }} />
                </span>
                <span className="admin-overview__bar-date">
                  {dateLabels.has(index) ? date : " "}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function AdminOverviewDashboard({ onOpenStudent }: Props) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError("");

    getAdminOverview()
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Не удалось загрузить обзор");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [reloadKey]);

  return (
    <section className="admin-overview" aria-label="Обзор показателей платформы">
      <header className="admin-overview__header">
        <button type="button" className="admin-overview__refresh" onClick={() => setReloadKey((key) => key + 1)} disabled={isLoading}>
          <RefreshCw size={14} className={isLoading ? "is-spinning" : ""} /> Обновить
        </button>
      </header>

      {error && <div className="form-error" role="alert">{error}</div>}
      {isLoading && !overview ? (
        <p className="admin-note">Загружаем показатели...</p>
      ) : overview ? (
        <>
          <div className="admin-overview__metrics">
            <MetricCard
              icon={<Activity size={18} />}
              title="Активные ученики · 7 дней"
              value={overview.active_students_7d.toLocaleString("ru-RU")}
            />
            <MetricCard
              icon={<BookOpenCheck size={18} />}
              title="Завершили уроки · 7 дней"
              value={overview.lessons_completed_7d.toLocaleString("ru-RU")}
            />
            <MetricCard
              icon={<ShieldAlert size={18} />}
              title="Подписки истекают · 7 дней"
              value={overview.expiring_subscriptions_count.toLocaleString("ru-RU")}
              tone="amber"
            />
            <MetricCard
              icon={<CalendarClock size={18} />}
              title="Загрузка слотов · 30 дней"
              value={overview.slots_30d.occupancy_percent === null ? "—" : `${overview.slots_30d.occupancy_percent}%`}
            />
          </div>

          <div className="admin-overview__body">
            <TrendChart points={overview.daily_active_students} />

            <section className="admin-overview__expiring">
              <div className="admin-overview__section-heading">
                <h2>Скоро заканчиваются</h2>
              </div>
              {overview.expiring_subscriptions.length ? (
                <div className="admin-overview__student-list">
                  {overview.expiring_subscriptions.map((student) => (
                    <button type="button" key={student.id} onClick={() => onOpenStudent(student.id)}>
                      <span className="admin-overview__student-name">
                        <strong>{student.username}</strong>
                        <small>{formatPlan(student.subscription_plan)}</small>
                      </span>
                      <time dateTime={student.subscription_until}>{formatDayMonth(student.subscription_until)}</time>
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="admin-overview__empty">В ближайшие 7 дней подписки не заканчиваются.</p>
              )}
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
}

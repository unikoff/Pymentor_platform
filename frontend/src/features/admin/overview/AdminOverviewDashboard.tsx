import "./overview.css";
import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  CalendarClock,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { formatSlotTimeRange } from "../../../shared/lib/dates";
import { getAdminOverview } from "../api";
import type { AdminOverview } from "../../../shared/api/contracts";

type Props = { onOpenStudent: (studentId: number) => void };
type TrendPoint = { date: string; value: number };

function formatDayMonth(value: string) {
  const match = value.slice(0, 10).match(/^\d{4}-(\d{2})-(\d{2})$/);
  if (!match) return value;
  return `${match[2]}.${match[1]}`;
}

function formatDateRange(startValue: string, endValue: string) {
  const parseDate = (value: string) => {
    const match = value.slice(0, 10).match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
    if (!match) return null;
    return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  };
  const start = parseDate(startValue);
  const end = parseDate(endValue);
  if (!start || !end) return "";

  const shortDate = new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", timeZone: "UTC" });
  const fullDate = new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
  const startLabel = start.getUTCFullYear() === end.getUTCFullYear()
    ? shortDate.format(start)
    : fullDate.format(start);
  return `${startLabel} — ${fullDate.format(end)}`;
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
  return `${count.toLocaleString("ru-RU")} ${noun}`;
}

function formatLessonCount(count: number) {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  const noun = lastTwoDigits >= 11 && lastTwoDigits <= 14
    ? "уроков"
    : lastDigit === 1
      ? "урок"
      : lastDigit >= 2 && lastDigit <= 4
        ? "урока"
        : "уроков";
  return `${count.toLocaleString("ru-RU")} ${noun}`;
}

function getChartScale(maximum: number) {
  if (maximum <= 0) return { maximum: 1, ticks: [0] };

  let step = 1;
  if (maximum > 5) {
    const roughStep = maximum / 4;
    const magnitude = 10 ** Math.floor(Math.log10(roughStep));
    const normalizedStep = roughStep / magnitude;
    const niceStep = normalizedStep <= 1 ? 1 : normalizedStep <= 2.5 ? 2 : normalizedStep <= 5 ? 5 : 10;
    step = Math.max(1, niceStep * magnitude);
  }

  const axisMaximum = Math.ceil(maximum / step) * step;
  const ticks = Array.from({ length: Math.floor(axisMaximum / step) + 1 }, (_, index) => index * step);
  return { maximum: axisMaximum, ticks };
}

function buildSmoothLinePath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;

  const slopes = points.slice(0, -1).map((point, index) =>
    (points[index + 1].y - point.y) / (points[index + 1].x - point.x));
  const tangents = Array<number>(points.length).fill(0);
  tangents[0] = slopes[0];
  tangents[tangents.length - 1] = slopes[slopes.length - 1];

  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = slopes[index - 1];
    const next = slopes[index];
    if (previous * next > 0) tangents[index] = (2 * previous * next) / (previous + next);
  }

  const segments = points.slice(0, -1).map((point, index) => {
    const next = points[index + 1];
    const distance = next.x - point.x;
    const control1 = { x: point.x + distance / 3, y: point.y + tangents[index] * distance / 3 };
    const control2 = { x: next.x - distance / 3, y: next.y - tangents[index + 1] * distance / 3 };
    return `C${control1.x},${control1.y} ${control2.x},${control2.y} ${next.x},${next.y}`;
  });

  return `M${points[0].x},${points[0].y} ${segments.join(" ")}`;
}

function formatPlan(value: string) {
  return value.charAt(0).toLocaleUpperCase("ru-RU") + value.slice(1);
}

function MetricCard({ title, value, note, tone = "green" }: {
  title: string;
  value: string;
  note: string;
  tone?: "green" | "amber";
}) {
  return (
    <div className={`admin-overview__metric is-${tone}`}>
      <small>{title}</small>
      <strong>{value}</strong>
      <span>{note}</span>
    </div>
  );
}

function TrendChart({ points, title, description, kind = "activity" }: {
  points: TrendPoint[];
  title: string;
  description: (value: number) => string;
  kind?: "activity" | "lessons";
}) {
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const maximum = Math.max(0, ...points.map((point) => point.value));
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const activeDays = points.filter((point) => point.value > 0).length;
  const peakPoint = points.find((point) => point.value === maximum);
  const labelInterval = Math.max(1, Math.ceil(points.length / 6));
  const dateLabels = new Set(points.flatMap((_, index) =>
    index === 0 || index === points.length - 1 || index % labelInterval === 0 ? [index] : []));
  const dateRange = formatDateRange(points[0]?.date ?? "", points[points.length - 1]?.date ?? "");
  const scale = getChartScale(maximum);
  const chart = { width: 720, height: 260, left: 46, right: 14, top: 16, bottom: 34 };
  const plotWidth = chart.width - chart.left - chart.right;
  const plotHeight = chart.height - chart.top - chart.bottom;
  const coordinates = points.map((point, index) => ({
    ...point,
    x: chart.left + (points.length <= 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth),
    y: chart.top + plotHeight - (point.value / scale.maximum) * plotHeight,
  }));
  const linePath = buildSmoothLinePath(coordinates);
  const areaPath = maximum > 0 && coordinates.length > 0
    ? `${linePath} L${coordinates[coordinates.length - 1].x},${chart.top + plotHeight} L${coordinates[0].x},${chart.top + plotHeight} Z`
    : "";
  const activePoint = activePointIndex === null ? null : coordinates[activePointIndex];
  const tooltipId = `admin-overview-chart-tooltip-${kind}`;

  return (
    <section className={`admin-overview__trends ${kind === "lessons" ? "is-lessons" : ""}`} aria-label={`${title}${dateRange ? ` · ${dateRange}` : ""}`}>
      <div className="admin-overview__section-heading">
        <h2>{title}</h2>
        {dateRange && <span>{dateRange}</span>}
      </div>
      {points.length > 0 && (
        <div className="admin-overview__chart-summary" aria-label="Сводка за 30 дней">
          <span><small>{kind === "lessons" ? "Уроков за 30 дней" : "Активностей за 30 дней"}</small><strong>{total.toLocaleString("ru-RU")}</strong></span>
          <span><small>Активных дней</small><strong>{activeDays} из {points.length}</strong></span>
          <span>
            <small>{peakPoint && maximum > 0 ? `Пик · ${formatDayMonth(peakPoint.date)}` : "Пиковый день"}</small>
            <strong>{maximum > 0 ? description(maximum) : "Нет активности"}</strong>
          </span>
        </div>
      )}
      {points.length > 0 ? (
        <div className="admin-overview__plot">
          <svg className="admin-overview__chart" viewBox={`0 0 ${chart.width} ${chart.height}`}
            role="group" aria-label={`${title}${dateRange ? ` · ${dateRange}` : ""}`}>
            <g className="admin-overview__chart-grid" aria-hidden="true">
              {coordinates.map((point, index) => dateLabels.has(index) ? (
                <line key={point.date} className="is-date" x1={point.x} x2={point.x}
                  y1={chart.top} y2={chart.top + plotHeight} />
              ) : null)}
              {scale.ticks.map((value) => {
                const y = chart.top + plotHeight - (value / scale.maximum) * plotHeight;
                return (
                  <g key={value}>
                    <line className={value === 0 ? "is-zero" : ""} x1={chart.left} x2={chart.width - chart.right} y1={y} y2={y} />
                  </g>
                );
              })}
            </g>
            {areaPath && <path className="admin-overview__chart-area" d={areaPath} aria-hidden="true" />}
            {linePath && <path className={`admin-overview__chart-line ${maximum === 0 ? "is-empty" : ""}`} d={linePath} aria-hidden="true" />}
            <g className="admin-overview__chart-points">
              {coordinates.map((point, index) => {
                const summary = `${formatDayMonth(point.date)}: ${description(point.value)}`;
                const isPeak = maximum > 0 && point.value === maximum;
                return (
                  <g key={point.date} className="admin-overview__chart-point" role="img"
                    tabIndex={point.value > 0 ? 0 : -1} aria-label={summary}
                    aria-describedby={activePointIndex === index ? tooltipId : undefined}
                    onPointerEnter={() => setActivePointIndex(index)}
                    onPointerLeave={(event) => {
                      if (event.currentTarget !== document.activeElement) setActivePointIndex(null);
                    }}
                    onFocus={() => setActivePointIndex(index)}
                    onBlur={() => setActivePointIndex(null)}>
                    <circle className="admin-overview__chart-point-hit-area" cx={point.x} cy={point.y} r={12} />
                    <circle className={`admin-overview__chart-point-marker ${point.value > 0 ? "is-active" : "is-zero"} ${isPeak ? "is-peak" : ""}`}
                      cx={point.x} cy={point.y} r={isPeak ? 5.5 : point.value > 0 ? 4 : 1.75} />
                  </g>
                );
              })}
            </g>
          </svg>
          <div className="admin-overview__chart-y-labels" aria-hidden="true">
            {scale.ticks.map((value) => {
              const y = chart.top + plotHeight - (value / scale.maximum) * plotHeight;
              return <span key={value} style={{ top: `${(y / chart.height) * 100}%` }}>{value}</span>;
            })}
          </div>
          <div className="admin-overview__chart-x-labels" aria-hidden="true">
            {coordinates.map((point, index) => dateLabels.has(index) ? (
              <span key={point.date} style={{ left: `${(point.x / chart.width) * 100}%` }}>{point.date.slice(-2)}</span>
            ) : null)}
          </div>
          {activePoint && (
            <div id={tooltipId} className={`admin-overview__chart-tooltip ${activePointIndex === 0 ? "is-start" : ""} ${activePointIndex === coordinates.length - 1 ? "is-end" : ""} ${activePoint.y < chart.top + 56 ? "is-below" : ""}`}
              role="tooltip" style={{ left: `${(activePoint.x / chart.width) * 100}%`, top: `${(activePoint.y / chart.height) * 100}%` }}>
              <strong>{formatDayMonth(activePoint.date)}</strong>
              <span>{description(activePoint.value)}</span>
            </div>
          )}
          {maximum === 0 && <span className="admin-overview__chart-empty-label">За последние 30 дней событий не было</span>}
        </div>
      ) : (
        <div className="admin-overview__chart-empty">
          <strong>Пока нет данных</strong>
          <span>За последние 30 дней график ещё не сформирован.</span>
        </div>
      )}
    </section>
  );
}

function StudentList({ students, onOpenStudent, emptyMessage }: {
  students: { id: number; username: string; detail: string; meta: string }[];
  onOpenStudent: (studentId: number) => void;
  emptyMessage: string;
}) {
  if (!students.length) return <p className="admin-overview__empty">{emptyMessage}</p>;

  return (
    <div className="admin-overview__student-list">
      {students.map((student) => (
        <button type="button" key={student.id} onClick={() => onOpenStudent(student.id)}>
          <span className="admin-overview__student-name">
            <strong>{student.username}</strong>
            <small>{student.detail}</small>
          </span>
          <span className="admin-overview__student-meta">{student.meta}</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export function AdminOverviewDashboard({ onOpenStudent }: Props) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, []);

  return (
    <section className="admin-overview" aria-label="Обзор показателей платформы">
      {error && <div className="form-error" role="alert">{error}</div>}
      {isLoading && !overview ? (
        <p className="admin-note">Загружаем показатели...</p>
      ) : overview ? (
        <>
          <div className="admin-overview__groups">
            <section className="admin-overview__group">
              <div className="admin-overview__group-heading">
                <h2><Users size={17} aria-hidden="true" /> Ученики</h2>
              </div>
              <div className="admin-overview__group-metrics is-three">
                <MetricCard
                  title="Всего учеников"
                  value={overview.total_students?.toLocaleString("ru-RU") ?? "—"}
                  note="без администраторов"
                />
                <MetricCard
                  title="Активны · 7 дней"
                  value={overview.active_students_7d.toLocaleString("ru-RU")}
                  note="были на платформе"
                />
                <MetricCard
                  title="Без активности · 7 дней"
                  value={overview.inactive_students_7d?.toLocaleString("ru-RU") ?? "—"}
                  note="требуют внимания"
                  tone="amber"
                />
              </div>
              <TrendChart
                points={overview.daily_active_students.map((point) => ({ date: point.date, value: point.active_students }))}
                title="Посещения по дням"
                description={formatStudentCount}
              />
            </section>

            <section className="admin-overview__group">
              <div className="admin-overview__group-heading">
                <h2><BookOpenCheck size={17} aria-hidden="true" /> Обучение</h2>
                <span>{formatLessonCount(overview.lessons_completed_7d)} · 7 дней</span>
              </div>
              <TrendChart
                points={(overview.daily_lessons_completed ?? []).map((point) => ({ date: point.date, value: point.lessons_completed }))}
                title="Завершённые уроки по дням"
                description={formatLessonCount}
                kind="lessons"
              />
              <section className="admin-overview__group-list">
                <div className="admin-overview__section-heading">
                  <h3><TrendingUp size={15} aria-hidden="true" /> Ученики с завершёнными уроками</h3>
                  <span>7 дней</span>
                </div>
                <StudentList
                  students={(overview.most_active_students ?? []).map((student) => ({
                    id: student.id,
                    username: student.username,
                    detail: "завершено за неделю",
                    meta: formatLessonCount(student.lessons_completed),
                  }))}
                  onOpenStudent={onOpenStudent}
                  emptyMessage="За последние 7 дней завершённых уроков нет."
                />
              </section>
            </section>

            <section className="admin-overview__group is-subscriptions">
              <div className="admin-overview__group-heading">
                <h2><ShieldCheck size={17} aria-hidden="true" /> Подписки</h2>
              </div>
              <div className="admin-overview__group-metrics">
                <MetricCard
                  title="Активные"
                  value={overview.active_subscriptions_count?.toLocaleString("ru-RU") ?? "—"}
                  note="действуют сейчас"
                />
                <MetricCard
                  title="Истекают · 7 дней"
                  value={overview.expiring_subscriptions_count.toLocaleString("ru-RU")}
                  note="нужно продление"
                  tone="amber"
                />
              </div>
              <section className="admin-overview__group-list">
                <div className="admin-overview__section-heading">
                  <h3>Скоро заканчиваются</h3>
                  <span>7 дней</span>
                </div>
                <StudentList
                  students={overview.expiring_subscriptions.map((student) => ({
                    id: student.id,
                    username: student.username,
                    detail: formatPlan(student.subscription_plan),
                    meta: formatDayMonth(student.subscription_until),
                  }))}
                  onOpenStudent={onOpenStudent}
                  emptyMessage="В ближайшие 7 дней подписки не заканчиваются."
                />
              </section>
            </section>

            <section className="admin-overview__group">
              <div className="admin-overview__group-heading">
                <h2><CalendarClock size={17} aria-hidden="true" /> Расписание</h2>
              </div>
              <div className="admin-overview__group-metrics">
                <MetricCard
                  title="Записи · 7 дней"
                  value={overview.slots_7d ? `${overview.slots_7d.booked} / ${overview.slots_7d.total}` : "—"}
                  note={overview.slots_7d ? `${overview.slots_7d.free} свободно` : "нет данных о расписании"}
                />
                <MetricCard
                  title="Загрузка слотов · 30 дней"
                  value={overview.slots_30d.occupancy_percent === null ? "—" : `${overview.slots_30d.occupancy_percent}%`}
                  note={`${overview.slots_30d.booked} занято · ${overview.slots_30d.free} свободно`}
                />
              </div>
              <section className="admin-overview__group-list">
                <div className="admin-overview__section-heading">
                  <h3>Ближайшие занятия</h3>
                  <span>7 дней</span>
                </div>
                {overview.upcoming_bookings?.length ? (
                  <div className="admin-overview__booking-list">
                    {overview.upcoming_bookings.map((booking) => (
                      <button type="button" key={booking.id} onClick={() => onOpenStudent(booking.student.id)}>
                        <span className="admin-overview__booking-time">
                          <strong>{formatDayMonth(booking.date)}</strong>
                          <small>{formatSlotTimeRange(booking.start_time, booking.duration_minutes)}</small>
                        </span>
                        <span className="admin-overview__student-name">
                          <strong>{booking.student.username}</strong>
                          <small>{booking.student.email}</small>
                        </span>
                        <ChevronRight size={16} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="admin-overview__empty">В ближайшие 7 дней записей нет.</p>
                )}
              </section>
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
}

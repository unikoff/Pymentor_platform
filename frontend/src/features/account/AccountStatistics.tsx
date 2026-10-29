import { useId, useLayoutEffect, useRef, useState } from "react";
import { Activity, BarChart3, BookCheck, CalendarDays, Check, ChevronDown, Flame, TrendingUp } from "lucide-react";
import type { QuotaStatus } from "../../shared/api/contracts/account";

type CourseLessonProgress = { id: string; title: string; completed: boolean };
type CourseBlockProgress = {
  id: string;
  title: string;
  completed: number;
  total: number;
  lessons: CourseLessonProgress[];
};

export interface AccountStatisticsData {
  tracksLoaded: boolean;
  completedLessons: number;
  totalLessons: number;
  overallProgress: number;
  activeDays: number | null;
  currentStreak: number | null;
  weeklyActivity: { activity_date: string; active: boolean }[] | null;
  weeklyLessonsCompleted: { activity_date: string; lessons_completed: number }[] | null;
  courses: { id: string; title: string; completed: number; total: number; blocks: CourseBlockProgress[] }[];
}

export type WeeklyChartPoint = { activity_date: string; value: number | null };

function formatDayCount(value: number): string {
  const lastTwo = value % 100;
  const last = value % 10;
  const unit = lastTwo >= 11 && lastTwo <= 14 ? "дней" : last === 1 ? "день" : last >= 2 && last <= 4 ? "дня" : "дней";
  return `${value} ${unit}`;
}

function formatWeekday(value: string): { short: string; day: string; full: string } {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return { short: "—", day: "—", full: value };
  return {
    short: new Intl.DateTimeFormat("ru-RU", { weekday: "short" }).format(date).replace(".", ""),
    day: String(date.getDate()),
    full: new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }).format(date),
  };
}

function formatLessonCount(value: number): string {
  const lastTwo = value % 100;
  const last = value % 10;
  const unit = lastTwo >= 11 && lastTwo <= 14 ? "уроков" : last === 1 ? "урок" : last >= 2 && last <= 4 ? "урока" : "уроков";
  return `${value} ${unit}`;
}

function formatMinuteCount(value: number): string {
  const lastTwo = value % 100;
  const last = value % 10;
  const unit = lastTwo >= 11 && lastTwo <= 14 ? "минут" : last === 1 ? "минута" : last >= 2 && last <= 4 ? "минуты" : "минут";
  return `${value} ${unit}`;
}

function buildSmoothLinePath(points: Array<{ x: number; y: number }>): string {
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

export function WeeklyTrendChart({ points, title, unit, demo = false, valueDescription, totalDescription }: {
  points: WeeklyChartPoint[] | null;
  title: string;
  unit: "уроков" | "мин";
  demo?: boolean;
  valueDescription?: (value: number) => string;
  totalDescription?: (total: number) => string;
}) {
  const chartPoints = points ?? [];
  const canvasRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width: 280, height: 120 });
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const tooltipId = useId();

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return;

    const updateSize = () => {
      const { width: nextWidth, height: nextHeight } = canvas.getBoundingClientRect();
      if (nextWidth < 1 || nextHeight < 1) return;
      setChartSize((current) => Math.abs(current.width - nextWidth) < 0.5 && Math.abs(current.height - nextHeight) < 0.5
        ? current
        : { width: nextWidth, height: nextHeight });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [chartPoints.length]);

  const width = chartSize.width;
  const height = chartSize.height;
  const padX = Math.min(12, width * 0.05);
  const padTop = Math.min(16, height * 0.12);
  const padBottom = Math.min(12, height * 0.14);
  const plotHeight = height - padTop - padBottom;
  const numericPoints = chartPoints.filter((point): point is WeeklyChartPoint & { value: number } => point.value !== null);
  const maximum = Math.max(1, ...numericPoints.map((point) => point.value));
  const coordinates = chartPoints.flatMap((point, index) => point.value === null ? [] : [{
    ...point,
    value: point.value,
    x: chartPoints.length <= 1 ? width / 2 : padX + index / (chartPoints.length - 1) * (width - padX * 2),
    y: padTop + plotHeight - point.value / maximum * plotHeight,
  }]);
  const linePath = buildSmoothLinePath(coordinates);
  const areaPath = coordinates.length
    ? `${linePath} L${coordinates[coordinates.length - 1].x},${height - padBottom} L${coordinates[0].x},${height - padBottom} Z`
    : "";
  const total = chartPoints.reduce((sum, point) => sum + (point.value ?? 0), 0);
  const describeValue = valueDescription ?? ((value: number) => unit === "мин" ? formatMinuteCount(value) : formatLessonCount(value));
  const describeTotal = totalDescription ?? ((value: number) => demo
    ? `Примерные данные · ${value} мин за 7 дней`
    : `${formatLessonCount(value)} за 7 дней`);
  const activePoint = activePointIndex === null ? null : coordinates[activePointIndex];
  const chartLabel = `${title}: ${chartPoints.map((point) => {
    const weekday = formatWeekday(point.activity_date);
    if (point.value === null) return `${weekday.full} — нет данных`;
    return `${weekday.full} — ${describeValue(point.value)}`;
  }).join("; ")}`;

  return (
    <section className={`account-weekly-trend ${demo ? "is-demo" : ""}`}>
      <header>
        <div><h4>{title}</h4><p>{describeTotal(total)}</p></div>
        {demo && <span className="account-weekly-trend__badge">Демо</span>}
      </header>
      {chartPoints.length ? (
        <div className="account-weekly-trend__plot">
          <div className="account-weekly-trend__canvas" ref={canvasRef}>
            <svg viewBox={`0 0 ${width} ${height}`} role="group" aria-label={chartLabel}>
              <line className="account-weekly-trend__baseline" x1={padX} x2={width - padX} y1={height - padBottom} y2={height - padBottom} aria-hidden="true" />
              {areaPath && <path className="account-weekly-trend__area" d={areaPath} aria-hidden="true" />}
              {linePath && <path className="account-weekly-trend__line" d={linePath} aria-hidden="true" />}
              {coordinates.map((point, index) => {
                const pointLabel = `${formatWeekday(point.activity_date).full}: ${describeValue(point.value)}`;
                const isPeak = maximum > 0 && point.value === maximum;
                return (
                  <g className="account-weekly-trend__point" key={point.activity_date} role="img" tabIndex={0}
                    aria-label={pointLabel} aria-describedby={activePointIndex === index ? tooltipId : undefined}
                    onPointerEnter={() => setActivePointIndex(index)}
                    onPointerLeave={(event) => {
                      if (event.currentTarget !== document.activeElement) setActivePointIndex(null);
                    }}
                    onFocus={() => setActivePointIndex(index)}
                    onBlur={() => setActivePointIndex(null)}>
                    <circle className="account-weekly-trend__point-hit-area" cx={point.x} cy={point.y} r={10} />
                    <circle className={`account-weekly-trend__point-marker ${point.value > 0 ? "is-active" : "is-zero"} ${isPeak ? "is-peak" : ""}`}
                      cx={point.x} cy={point.y} r={isPeak ? 4.5 : point.value > 0 ? 4 : 3} />
                  </g>
                );
              })}
            </svg>
            {activePoint && (
              <div id={tooltipId} className={`account-weekly-trend__tooltip ${activePointIndex === 0 ? "is-start" : ""} ${activePointIndex === coordinates.length - 1 ? "is-end" : ""} ${activePoint.y < padTop + 24 ? "is-below" : ""}`}
                role="tooltip" style={{ left: `${activePoint.x / width * 100}%`, top: `${activePoint.y / height * 100}%` }}>
                <strong>{formatWeekday(activePoint.activity_date).full}</strong>
                <span>{describeValue(activePoint.value)}</span>
              </div>
            )}
          </div>
          <div className="account-weekly-trend__labels" aria-hidden="true">
            {chartPoints.map((point) => (
              <span key={point.activity_date}>
                <strong>{point.value ?? "—"}</strong>
                <small>{formatWeekday(point.activity_date).short}</small>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="account-weekly-trend__empty">Данные появятся после загрузки активности за последние 7 дней.</p>
      )}
    </section>
  );
}

export function AccountStatistics({ data, bookingQuota }: {
  data: AccountStatisticsData;
  bookingQuota: QuotaStatus | null;
}) {
  const statsReady = data.tracksLoaded;
  const activeWeekCount = data.weeklyActivity?.filter((day) => day.active).length ?? null;
  const lessonPoints = data.weeklyLessonsCompleted?.map((day) => ({
    activity_date: day.activity_date,
    value: day.lessons_completed,
  })) ?? null;
  const demoMinutes = [24, 38, 16, 52, 43, 18, 31];
  const timePoints = data.weeklyActivity?.map((day, index) => ({ activity_date: day.activity_date, value: demoMinutes[index] })) ?? null;
  const metrics = [
    {
      label: "Серия занятий",
      value: data.currentStreak === null ? "—" : formatDayCount(data.currentStreak),
      note: "подряд с активностью",
      icon: Flame,
      tone: "mint",
    },
    {
      label: "Занятий осталось",
      value: bookingQuota ? `${bookingQuota.remaining} / ${bookingQuota.granted}` : "—",
      note: "лимит на этот месяц",
      icon: CalendarDays,
      tone: "blue",
    },
    {
      label: "Прогресс курса",
      value: statsReady ? `${data.overallProgress}%` : "—",
      note: statsReady ? `${data.completedLessons} из ${data.totalLessons} уроков` : "загружаем прогресс",
      icon: TrendingUp,
      tone: "amber",
      progress: statsReady ? data.overallProgress : null,
    },
    {
      label: "Дней на платформе",
      value: data.activeDays === null ? "—" : data.activeDays.toLocaleString("ru-RU"),
      note: "за всё время",
      icon: Activity,
      tone: "mint",
    },
    {
      label: "Уроков завершено",
      value: statsReady ? data.completedLessons.toLocaleString("ru-RU") : "—",
      note: statsReady ? "по всем направлениям" : "загружаем прогресс",
      icon: BookCheck,
      tone: "blue",
    },
  ];

  return (
    <div className="account-section-stack">
      <div className="account-metrics">
        {metrics.map(({ label, value, note, icon: Icon, tone, progress }) => (
          <section className={`account-surface account-metric account-metric--${tone}`} key={label}>
            <span className="account-metric__label"><Icon size={17} aria-hidden="true" />{label}</span>
            <strong>{value}</strong>
            {progress !== undefined && progress !== null && (
              <span className="account-progress-track" role="progressbar" aria-label="Прогресс по всем направлениям"
                aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                <span style={{ width: `${progress}%` }} />
              </span>
            )}
            <small>{note}</small>
          </section>
        ))}
      </div>

      <div className="account-detail-grid">
        <section className="account-surface account-detail-card account-weekly-activity">
          <header>
            <div><h3>Активность по дням</h3><p>Последние 7 дней, включая сегодня</p></div>
              <span>{activeWeekCount === null ? "—" : `${activeWeekCount} из 7 дней`}</span>
          </header>
          {data.weeklyActivity ? (
            <div className="account-week-chart" role="list" aria-label="Активность за последние 7 дней">
              {data.weeklyActivity.map((day) => {
                const weekday = formatWeekday(day.activity_date);
                return (
                  <div className={`account-week-chart__day ${day.active ? "is-active" : ""}`} role="listitem"
                    aria-label={`${weekday.full}: ${day.active ? "была активность" : "без активности"}`} key={day.activity_date}>
                    <span>{weekday.short}</span>
                    <strong>{weekday.day}</strong>
                    <i aria-hidden="true">{day.active ? <Check size={12} strokeWidth={2.5} /> : null}</i>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="account-empty-state account-empty-state--compact">
              <span className="account-empty-state__icon"><BarChart3 size={24} aria-hidden="true" /></span>
              <strong>Активность пока недоступна</strong>
              <p>Когда данные загрузятся, здесь появятся учебные дни за последние 7 дней.</p>
            </div>
          )}
          <div className="account-weekly-trends">
            <WeeklyTrendChart points={lessonPoints} title="Завершено уроков" unit="уроков" />
            <WeeklyTrendChart points={timePoints} title="Время на платформе" unit="мин" demo />
          </div>
        </section>

        <section className="account-surface account-detail-card account-course-progress-card">
          <header><div><h3>Прогресс по направлениям</h3><p>Выполненные уроки в каждом курсе</p></div></header>
          {data.courses.length ? (
            <div className="account-course-list">
              {data.courses.map((course) => {
                const percent = course.total ? Math.round(course.completed / course.total * 100) : 0;
                return (
                  <details className="account-course-accordion" key={course.id}>
                    <summary>
                      <span className="account-course-accordion__heading">
                        <strong>{course.title}</strong>
                        <span>{course.completed} / {course.total}</span>
                      </span>
                      <ChevronDown className="account-course-accordion__chevron" size={18} aria-hidden="true" />
                      <span className="account-progress-track" role="progressbar" aria-label={`Прогресс: ${course.title}`}
                        aria-valuemin={0} aria-valuemax={Math.max(1, course.total)}
                        aria-valuenow={Math.max(0, Math.min(course.completed, course.total))}>
                        <span style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
                      </span>
                    </summary>
                    {course.blocks.length ? (
                      <div className="account-course-accordion__blocks">
                        {course.blocks.map((block) => {
                          const blockPercent = block.total ? Math.round(block.completed / block.total * 100) : 0;
                          return (
                            <details className="account-course-block" key={block.id}>
                              <summary>
                                <span className="account-course-block__heading">
                                  <strong>{block.title}</strong>
                                  <span>{block.completed} / {block.total}</span>
                                </span>
                                <ChevronDown className="account-course-block__chevron" size={16} aria-hidden="true" />
                                <span className="account-progress-track" role="progressbar"
                                  aria-label={`Прогресс блока ${block.title} в курсе ${course.title}`}
                                  aria-valuemin={0} aria-valuemax={Math.max(1, block.total)}
                                  aria-valuenow={Math.max(0, Math.min(block.completed, block.total))}>
                                  <span style={{ width: `${Math.max(0, Math.min(100, blockPercent))}%` }} />
                                </span>
                              </summary>
                              {block.lessons.length ? (
                                <ul className="account-course-block__lessons">
                                  {block.lessons.map((lesson) => (
                                    <li className="account-course-lesson" key={lesson.id}>
                                      <span className={`account-course-lesson__mark ${lesson.completed ? "is-complete" : ""}`} aria-hidden="true">
                                        {lesson.completed && <Check size={12} strokeWidth={2.7} />}
                                      </span>
                                      <span className="account-course-lesson__title">{lesson.title}</span>
                                      <span className={`account-course-lesson__status ${lesson.completed ? "is-complete" : ""}`}>
                                        {lesson.completed ? "Выполнено" : "Не выполнено"}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="account-course-block__empty">Список занятий сейчас недоступен.</p>
                              )}
                            </details>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="account-course-accordion__empty">Прогресс по блокам появится после обновления каталога.</p>
                    )}
                  </details>
                );
              })}
            </div>
          ) : (
            <div className="account-empty-state account-empty-state--compact">
              <span className="account-empty-state__icon"><BookCheck size={24} aria-hidden="true" /></span>
              <strong>{statsReady ? "Курсы ещё не добавлены" : "Загружаем курсы"}</strong>
              <p>{statsReady ? "Прогресс появится здесь после начала обучения." : "Подождите немного — скоро покажем ваши результаты."}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

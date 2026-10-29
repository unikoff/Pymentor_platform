import { Check, Flame } from "lucide-react";
import { WeeklyTrendChart, type WeeklyChartPoint } from "../../account/AccountStatistics";
import type { ActivitySummaryResponse } from "../../../shared/api/contracts/account";

function formatDayCount(value: number) {
  const lastTwo = value % 100;
  const last = value % 10;
  const unit = lastTwo >= 11 && lastTwo <= 14 ? "дней" : last === 1 ? "день" : last >= 2 && last <= 4 ? "дня" : "дней";
  return `${value} ${unit}`;
}

function formatWeekday(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return { short: "—", day: "—", full: value };
  return {
    short: new Intl.DateTimeFormat("ru-RU", { weekday: "short" }).format(date).replace(".", ""),
    day: String(date.getDate()),
    full: new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }).format(date),
  };
}

export function AdminStudentActivity({ summary }: { summary?: ActivitySummaryResponse | null }) {
  const weeklyActivity = summary?.weekly_activity ?? null;
  const activeDayCount = weeklyActivity?.filter((day) => day.active).length ?? 0;
  const demoMinutes = [24, 38, 16, 52, 43, 18, 31];
  const platformTimePoints: WeeklyChartPoint[] | null = weeklyActivity?.map((day, index) => ({
    activity_date: day.activity_date,
    value: demoMinutes[index] ?? null,
  })) ?? null;
  const lessonPoints: WeeklyChartPoint[] | null = summary?.weekly_lessons_completed?.map((day) => ({
    activity_date: day.activity_date,
    value: day.lessons_completed,
  })) ?? null;

  return (
    <section className="account-surface account-detail-card account-weekly-activity admin-profile-activity"
      aria-label="Активность ученика по дням">
      <header>
        <div>
          <h3>Активность по дням</h3>
          <p>{weeklyActivity
            ? `Последние 7 дней, включая сегодня · ${activeDayCount} из 7 дней с активностью`
            : "Последние 7 дней, включая сегодня"}</p>
        </div>
        <span className="account-history-streak">
          <Flame size={14} aria-hidden="true" />
          Серия: {summary ? formatDayCount(summary.current_streak) : "—"}
        </span>
      </header>

      {weeklyActivity ? (
        <div className="account-week-chart" role="list" aria-label="Активность за последние 7 дней">
          {weeklyActivity.map((day) => {
            const weekday = formatWeekday(day.activity_date);
            return (
              <div className={`account-week-chart__day ${day.active ? "is-active" : ""}`} role="listitem"
                aria-label={`${weekday.full}: ${day.active ? "был на платформе" : "не был на платформе"}`}
                key={day.activity_date}>
                <span>{weekday.short}</span>
                <strong>{weekday.day}</strong>
                <i aria-hidden="true">{day.active ? <Check size={12} strokeWidth={2.5} /> : null}</i>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="admin-profile-activity__empty">Данные активности за последние 7 дней недоступны.</p>
      )}

      <div className="account-weekly-trends admin-profile-activity__trends">
        <WeeklyTrendChart points={lessonPoints} title="Завершено уроков" unit="уроков" />
        <WeeklyTrendChart
          points={platformTimePoints}
          title="Время на платформе"
          unit="мин"
          demo
        />
      </div>
    </section>
  );
}

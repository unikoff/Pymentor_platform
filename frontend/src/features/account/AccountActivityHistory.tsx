import { CalendarCheck2, CalendarX2, History, Flame } from "lucide-react";

type ActivityDay = { activity_date: string; active: boolean };

function formatActivityDay(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function AccountActivityHistory({ weeklyActivity, currentStreak }: {
  weeklyActivity: ActivityDay[] | null;
  currentStreak: number | null;
}) {
  const activeCount = weeklyActivity?.filter((day) => day.active).length ?? 0;
  const activeCountLabel = activeCount === 1 ? "день с активностью"
    : activeCount >= 2 && activeCount <= 4 ? "дня с активностью" : "дней с активностью";

  return (
    <div className="account-section-stack">
      <section className="account-surface account-history-card">
        <header>
          <div><h3>Последние 7 дней</h3><p>{weeklyActivity ? `${activeCount} ${activeCountLabel}` : "Данные загружаются"}</p></div>
          <span className="account-history-streak"><Flame size={14} aria-hidden="true" /> Серия: {currentStreak ?? "—"}</span>
        </header>
        {weeklyActivity ? (
          <div className="account-history-list">
            {weeklyActivity.map((day) => (
              <div className="account-history-row" key={day.activity_date}>
                <span className={`account-history-row__icon ${day.active ? "is-active" : ""}`}>
                  {day.active ? <CalendarCheck2 size={17} aria-hidden="true" /> : <CalendarX2 size={17} aria-hidden="true" />}
                </span>
                <strong>{formatActivityDay(day.activity_date)}</strong>
                <span className={`account-history-row__status ${day.active ? "is-active" : ""}`}>
                  {day.active ? "Учились" : "Без активности"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="account-empty-state account-empty-state--compact">
            <span className="account-empty-state__icon"><History size={24} aria-hidden="true" /></span>
            <strong>История загружается</strong>
            <p>Данные появятся, как только сервер вернёт статистику активности.</p>
          </div>
        )}
      </section>
    </div>
  );
}

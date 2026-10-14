import { buildMonthCells, getLocalDateKey, getMonthTitle } from "../../lib/dates";
import type { CalendarMonth } from "../../api/contracts/account";

type CalendarMarker = "is-activity" | "is-free" | "is-booking";

type CalendarMonthGridProps = {
  month: CalendarMonth;
  activityDays: Set<string>;
  freeDays?: Set<string>;
  bookingDays?: Set<string>;
  selectableDays?: Set<string>;
  selectedDay?: string | null;
  onSelectDay?: (dateKey: string) => void;
  legend: Array<{ marker: CalendarMarker; label: string }>;
};

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function CalendarMonthGrid({
  month,
  activityDays,
  freeDays = new Set(),
  bookingDays = new Set(),
  selectableDays = new Set(),
  selectedDay = null,
  onSelectDay,
  legend,
}: CalendarMonthGridProps) {
  const today = getLocalDateKey();

  return (
    <>
      <div className="account-calendar__weekdays" aria-hidden="true">
        {weekdays.map((weekday) => <span key={weekday}>{weekday}</span>)}
      </div>
      <div className="account-calendar__grid" role="grid" aria-label={`События за ${getMonthTitle(month)}`}>
        {buildMonthCells(month).map((cell, index) => {
          if (!cell) return <span className="account-calendar__day is-empty" key={`empty-${index}`} aria-hidden="true" />;

          const hasActivity = activityDays.has(cell.dateKey);
          const hasFree = freeDays.has(cell.dateKey);
          const hasBooking = bookingDays.has(cell.dateKey);
          const isSelected = selectedDay === cell.dateKey;
          const dayClass = [
            "account-calendar__day",
            cell.dateKey === today ? "is-today" : "",
            hasActivity ? "has-activity" : "",
            hasFree ? "has-free" : "",
            hasBooking ? "has-booking" : "",
            isSelected ? "is-selected" : "",
          ].filter(Boolean).join(" ");
          const dateLabel = new Date(month.year, month.month - 1, cell.day)
            .toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
          const statusLabel = [
            hasFree && "есть свободные занятия",
            hasBooking && "есть запись на занятие",
            hasActivity && "была активность",
          ].filter(Boolean).join(", ");
          const markers = (
            <span className="account-calendar__markers" aria-hidden="true">
              {hasActivity && <i className="is-activity" />}
              {hasFree && <i className="is-free" />}
              {hasBooking && <i className="is-booking" />}
            </span>
          );
          const dayContent = <><span className="account-calendar__day-number">{cell.day}</span>{markers}</>;

          if (onSelectDay && selectableDays.has(cell.dateKey)) {
            return (
              <button
                className={dayClass}
                key={cell.key}
                type="button"
                role="gridcell"
                aria-pressed={isSelected}
                aria-label={`${dateLabel}${statusLabel ? `, ${statusLabel}` : ""}`}
                onClick={() => onSelectDay(cell.dateKey)}
              >
                {dayContent}
              </button>
            );
          }

          return (
            <span
              className={dayClass}
              key={cell.key}
              role="gridcell"
              title={statusLabel ? `${dateLabel}: ${statusLabel}` : undefined}
              aria-label={`${dateLabel}${statusLabel ? `, ${statusLabel}` : ""}`}
            >
              {dayContent}
            </span>
          );
        })}
      </div>
      <div className="account-calendar__legend" aria-label="Обозначения календаря">
        {legend.map(({ marker, label }) => <span key={marker}><i className={marker} /> {label}</span>)}
      </div>
    </>
  );
}

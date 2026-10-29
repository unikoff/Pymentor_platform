import { buildMonthCells, getLocalDateKey, getMonthTitle } from "../../lib/dates";
import { Check } from "lucide-react";
import type { CalendarMonth } from "../../api/contracts/account";

type CalendarMarker = "is-activity" | "is-free" | "is-booking" | "is-completed";

type CalendarMonthGridProps = {
  month: CalendarMonth;
  activityDays: Set<string>;
  freeDays?: Set<string>;
  freeSlotCounts?: ReadonlyMap<string, number>;
  bookingDays?: Set<string>;
  completedDays?: Set<string>;
  showCellEvents?: boolean;
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
  freeSlotCounts,
  bookingDays = new Set(),
  completedDays = new Set(),
  showCellEvents = true,
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
      <div key={`${month.year}:${month.month}`} className="account-calendar__grid" role="grid" aria-label={`События за ${getMonthTitle(month)}`}>
        {buildMonthCells(month).map((cell, index) => {
          if (!cell) return <span className="account-calendar__day is-empty" key={`empty-${index}`} aria-hidden="true" />;

          const hasActivity = activityDays.has(cell.dateKey);
          const hasFree = freeDays.has(cell.dateKey);
          const freeSlotCount = freeSlotCounts?.get(cell.dateKey) ?? 1;
          const hasBooking = bookingDays.has(cell.dateKey);
          const hasCompleted = completedDays.has(cell.dateKey);
          const isSelected = selectedDay === cell.dateKey;
          const dayClass = [
            "account-calendar__day",
            cell.dateKey === today ? "is-today" : "",
            hasActivity ? "has-activity" : "",
            hasFree ? "has-free" : "",
            hasBooking ? "has-booking" : "",
            hasCompleted ? "has-completed" : "",
            isSelected ? "is-selected" : "",
          ].filter(Boolean).join(" ");
          const dateLabel = new Date(month.year, month.month - 1, cell.day)
            .toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
          const statusLabel = [
            hasFree && `есть свободные окна: ${freeSlotCount}`,
            hasBooking && "есть запись на занятие",
            hasCompleted && "время занятия прошло",
            hasActivity && "была активность",
          ].filter(Boolean).join(", ");
          const dayEvents = showCellEvents ? (
            <span className="account-calendar__day-events" aria-hidden="true">
              {hasFree && <span className="account-calendar__day-event is-free">Свободно · {freeSlotCount}</span>}
              {hasBooking && <span className="account-calendar__day-event is-booking">Ваша запись</span>}
              {hasCompleted && <span className="account-calendar__day-event is-completed">Занятие прошло</span>}
            </span>
          ) : (
            <span className="account-calendar__markers" aria-hidden="true">
              {hasFree && <i className="is-free" />}
              {hasBooking && <i className="is-booking" />}
              {hasCompleted && <i className="is-completed" />}
            </span>
          );
          const dayContent = <>
            <span className="account-calendar__day-heading">
              <span className="account-calendar__day-number">{cell.day}</span>
              {hasActivity && <Check className="account-calendar__visit-check" size={15} aria-hidden="true" />}
            </span>
            {dayEvents}
          </>;

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

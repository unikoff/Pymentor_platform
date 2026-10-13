import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Clock } from "lucide-react";
import { buildMonthCells, formatSlotDate, formatSlotTimeRange, getMonthTitle, shiftCalendarMonth } from "../../shared/lib/dates";
import type { CalendarMonth, StudentSlot, QuotaStatus } from "../../shared/api/contracts/account";

export function CalendarPanel({
  calendarMonth,
  activityDays,
  bookingSlots,
  bookingQuota,
  onMonthChange,
  onBookSlot,
  onCancelSlot,
}: {
  calendarMonth: CalendarMonth;
  activityDays: Set<string>;
  bookingSlots: StudentSlot[];
  bookingQuota: QuotaStatus | null;
  onMonthChange: (calendarMonth: CalendarMonth) => void;
  onBookSlot: (slotId: number) => Promise<void>;
  onCancelSlot: (slotId: number) => Promise<void>;
}) {
  const cells = buildMonthCells(calendarMonth);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [busySlotId, setBusySlotId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Группируем слоты по дню: где есть свободные окна, где есть моя запись.
  const { freeDays, myDays, slotsByDay } = useMemo(() => {
    const free = new Set<string>();
    const mine = new Set<string>();
    const byDay = new Map<string, StudentSlot[]>();
    for (const slot of bookingSlots) {
      if (!byDay.has(slot.date)) {
        byDay.set(slot.date, []);
      }
      byDay.get(slot.date)!.push(slot);
      if (slot.status === "mine") {
        mine.add(slot.date);
      } else {
        free.add(slot.date);
      }
    }
    return { freeDays: free, myDays: mine, slotsByDay: byDay };
  }, [bookingSlots]);

  // Сбрасываем выбранный день при смене месяца, если его слотов больше нет.
  useEffect(() => {
    if (selectedDay && !slotsByDay.has(selectedDay)) {
      setSelectedDay(null);
    }
  }, [selectedDay, slotsByDay]);

  const selectedSlots = selectedDay ? slotsByDay.get(selectedDay) ?? [] : [];

  async function handleSlotAction(slot: StudentSlot) {
    setBusySlotId(slot.id);
    setError("");
    try {
      if (slot.status === "mine") {
        await onCancelSlot(slot.id);
      } else {
        await onBookSlot(slot.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось изменить запись");
    } finally {
      setBusySlotId(null);
    }
  }

  return (
    <aside className="calendar-panel" aria-label="Календарь занятий">
      <div className="calendar-card">
        <div className="calendar-head">
          <div>
            <span>Занятия</span>
            <strong>{getMonthTitle(calendarMonth)}</strong>
          </div>
          <div className="calendar-nav">
            <button type="button" onClick={() => onMonthChange(shiftCalendarMonth(calendarMonth, -1))} aria-label="Предыдущий месяц">
              ‹
            </button>
            <button type="button" onClick={() => onMonthChange(shiftCalendarMonth(calendarMonth, 1))} aria-label="Следующий месяц">
              ›
            </button>
          </div>
        </div>

        <div className="calendar-weekdays" aria-hidden="true">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>

        <div className="calendar-grid">
          {cells.map((cell, index) => {
            if (!cell) {
              return <span className="calendar-day is-empty" key={`empty-${index}`} />;
            }
            const hasFree = freeDays.has(cell.dateKey);
            const hasMine = myDays.has(cell.dateKey);
            const clickable = hasFree || hasMine;
            const classes = [
              "calendar-day",
              activityDays.has(cell.dateKey) ? "is-active" : "",
              hasFree ? "has-free" : "",
              hasMine ? "has-booking" : "",
              clickable ? "is-clickable" : "",
              selectedDay === cell.dateKey ? "is-selected" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return clickable ? (
              <button
                className={classes}
                key={cell.key}
                type="button"
                onClick={() => setSelectedDay((current) => (current === cell.dateKey ? null : cell.dateKey))}
                title={hasMine ? "У вас есть запись" : "Есть свободные окна"}
              >
                {cell.day}
              </button>
            ) : (
              <span className={classes} key={cell.key} title={activityDays.has(cell.dateKey) ? "Вы заходили" : undefined}>
                {cell.day}
              </span>
            );
          })}
        </div>

        <div className="calendar-legend">
          <span><i className="dot dot-free" /> свободно</span>
          <span><i className="dot dot-booking" /> ваша запись</span>
          <span><i className="dot dot-activity" /> заходили</span>
        </div>

        {bookingQuota && (
          <div className={`quota-badge ${bookingQuota.remaining <= 0 ? "is-empty" : ""}`}>
            <CalendarClock size={15} />
            {bookingQuota.granted === 0 ? (
              <span>Занятия на этот месяц не выданы. Обратитесь к преподавателю.</span>
            ) : (
              <span>
                Осталось занятий: <strong>{bookingQuota.remaining}</strong> из {bookingQuota.granted}
              </span>
            )}
          </div>
        )}

        {selectedDay ? (
          <div className="slot-picker">
            <strong>{formatSlotDate(selectedDay)}</strong>
            {error && <div className="form-error">{error}</div>}
            <div className="slot-picker-list">
              {selectedSlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  className={`slot-chip ${slot.status === "mine" ? "is-mine" : ""}`}
                  disabled={busySlotId === slot.id || (slot.status === "mine" && !slot.can_cancel)}
                  onClick={() => handleSlotAction(slot)}
                  title={
                    slot.status === "mine" && !slot.can_cancel
                      ? "Отменить занятие можно не позднее чем за 36 часов до начала"
                      : undefined
                  }
                >
                  <Clock size={13} />
                  <span className="slot-chip-time">{formatSlotTimeRange(slot.start_time, slot.duration_minutes)}</span>
                  <small>
                    {slot.duration_minutes} мин · {slot.status === "mine" ? (slot.can_cancel ? "отменить" : "отмена закрыта: меньше 36 ч") : "записаться"}
                  </small>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="calendar-note">
            Кликните на день с кружком, чтобы выбрать время занятия. Свободные окна выставляет преподаватель.
          </p>
        )}
      </div>
    </aside>
  );
}

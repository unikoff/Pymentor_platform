import "./calendar-base.css";
import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { formatSlotDate, formatSlotTimeRange, getMonthTitle, shiftCalendarMonth } from "../../shared/lib/dates";
import { CalendarMonthGrid } from "../../shared/ui/calendar/CalendarMonthGrid";
import type { CalendarMonth, StudentSlot, QuotaStatus } from "../../shared/api/contracts/account";

export function CalendarPanel({
  calendarMonth,
  activityDays,
  activityTimes,
  bookingSlots,
  bookingQuota,
  onMonthChange,
  onBookSlot,
  onCancelSlot,
}: {
  calendarMonth: CalendarMonth;
  activityDays: Set<string>;
  activityTimes: Record<string, string | null>;
  bookingSlots: StudentSlot[];
  bookingQuota: QuotaStatus | null;
  onMonthChange: (calendarMonth: CalendarMonth) => void;
  onBookSlot: (slotId: number) => Promise<void>;
  onCancelSlot: (slotId: number) => Promise<void>;
}) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [busySlotId, setBusySlotId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const { freeDays, myDays, slotsByDay } = useMemo(() => {
    const free = new Set<string>();
    const mine = new Set<string>();
    const byDay = new Map<string, StudentSlot[]>();
    for (const slot of bookingSlots) {
      const daySlots = byDay.get(slot.date) ?? [];
      daySlots.push(slot);
      byDay.set(slot.date, daySlots);
      if (slot.status === "mine") mine.add(slot.date);
      else free.add(slot.date);
    }
    for (const daySlots of byDay.values()) daySlots.sort((a, b) => a.start_time.localeCompare(b.start_time));
    return { freeDays: free, myDays: mine, slotsByDay: byDay };
  }, [bookingSlots]);

  useEffect(() => {
    if (selectedDay && !slotsByDay.has(selectedDay) && !activityDays.has(selectedDay)) setSelectedDay(null);
  }, [selectedDay, slotsByDay, activityDays]);

  useEffect(() => {
    setSelectedDay(null);
    setError("");
  }, [calendarMonth.month, calendarMonth.year]);

  const selectedSlots = selectedDay ? slotsByDay.get(selectedDay) ?? [] : [];
  const selectedActivityTime = selectedDay && activityTimes[selectedDay]
    ? formatActivityTime(activityTimes[selectedDay]!)
    : null;
  const usedQuotaPercent = bookingQuota && bookingQuota.granted > 0
    ? Math.min(100, Math.max(0, Math.round((bookingQuota.used / bookingQuota.granted) * 100)))
    : 0;

  async function handleSlotAction(slot: StudentSlot) {
    setBusySlotId(slot.id);
    setError("");
    try {
      if (slot.status === "mine") await onCancelSlot(slot.id);
      else await onBookSlot(slot.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось изменить запись");
    } finally {
      setBusySlotId(null);
    }
  }

  return (
    <section className="account-calendar" aria-label="Календарь занятий">
      <header className="account-calendar__header">
        <div className="account-calendar__title">
          <span className="account-calendar__icon"><CalendarDays size={19} /></span>
          <div>
            <span className="account-calendar__eyebrow">РАСПИСАНИЕ</span>
            <h2>{getMonthTitle(calendarMonth)}</h2>
          </div>
        </div>
        <div className="account-calendar__navigation" aria-label="Навигация по месяцам">
          <button type="button" onClick={() => onMonthChange(shiftCalendarMonth(calendarMonth, -1))} aria-label="Предыдущий месяц">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => onMonthChange(shiftCalendarMonth(calendarMonth, 1))} aria-label="Следующий месяц">
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      <div className="account-calendar__layout">
        <div className="account-calendar__main">
          <CalendarMonthGrid
            month={calendarMonth}
            activityDays={activityDays}
            freeDays={freeDays}
            bookingDays={myDays}
            selectableDays={new Set([...freeDays, ...myDays, ...activityDays])}
            selectedDay={selectedDay}
            onSelectDay={(dateKey) => setSelectedDay((current) => current === dateKey ? null : dateKey)}
            legend={[
              { marker: "is-free", label: "Свободное время" },
              { marker: "is-booking", label: "Ваша запись" },
              { marker: "is-activity", label: "Были на платформе" },
            ]}
          />
        </div>

        <aside className="account-calendar__details" aria-live="polite">
          <div className="account-calendar__details-heading">
            <span className="account-calendar__details-icon"><Clock size={16} /></span>
            <div>
              <span className="account-calendar__eyebrow">ВЫБРАННЫЙ ДЕНЬ</span>
              <h3>{selectedDay ? formatSlotDate(selectedDay) : "Занятия и запись"}</h3>
            </div>
          </div>

          {selectedDay && activityDays.has(selectedDay) && (
            <p className="account-calendar__activity-time">
              <Clock size={15} aria-hidden="true" />
              {selectedActivityTime
                ? <>Первый визит: <time dateTime={activityTimes[selectedDay] ?? undefined}>{selectedActivityTime}</time></>
                : "Время активности для этой даты не сохранено"}
            </p>
          )}

          {selectedDay ? (
            selectedSlots.length > 0 ? (
              <div className="account-calendar__slots">
                <p>{selectedSlots.length === 1 ? "Доступно одно время" : `Доступно вариантов: ${selectedSlots.length}`}</p>
                {error && <div className="form-error" role="alert">{error}</div>}
                {selectedSlots.map((slot) => {
                  const isMine = slot.status === "mine";
                  const cannotCancel = isMine && !slot.can_cancel;
                  const actionLabel = isMine ? (slot.can_cancel ? "Отменить запись" : "Отмена закрыта") : "Записаться";
                  return (
                    <button key={slot.id} type="button" className={`account-calendar__slot ${isMine ? "is-booked" : ""}`}
                      disabled={busySlotId === slot.id || cannotCancel}
                      onClick={() => void handleSlotAction(slot)}
                      title={cannotCancel ? "Отменить занятие можно не позднее чем за 36 часов до начала" : undefined}>
                      <span className="account-calendar__slot-time">{formatSlotTimeRange(slot.start_time, slot.duration_minutes)}</span>
                      <span className="account-calendar__slot-action">{busySlotId === slot.id ? "Сохраняем…" : actionLabel}</span>
                    </button>
                  );
                })}
              </div>
            ) : activityDays.has(selectedDay) ? null : <p className="account-calendar__empty">На этот день пока нет доступных окон.</p>
          ) : <p className="account-calendar__empty">Выберите день с отметкой, чтобы увидеть время активности или запись.</p>}

          {bookingQuota && (
            <div className={`account-calendar__quota ${bookingQuota.remaining <= 0 ? "is-empty" : ""}`}>
              <div className="account-calendar__quota-heading">
                <CalendarClock size={16} />
                <span>Занятия в этом месяце</span>
              </div>
              {bookingQuota.granted === 0 ? (
                <p>Занятия на этот месяц не выданы. Обратитесь к преподавателю.</p>
              ) : (
                <>
                  <strong><span>{bookingQuota.remaining}</span> из {bookingQuota.granted} осталось</strong>
                  <div className="account-calendar__quota-track" role="progressbar" aria-label="Использовано занятий"
                    aria-valuemin={0} aria-valuemax={bookingQuota.granted}
                    aria-valuenow={Math.min(bookingQuota.granted, Math.max(0, bookingQuota.used))}>
                    <span style={{ width: `${usedQuotaPercent}%` }} />
                  </div>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function formatActivityTime(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

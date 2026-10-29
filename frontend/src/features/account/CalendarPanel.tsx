import "./calendar-base.css";
import { useEffect, useMemo, useState } from "react";
import { CalendarCheck2, CalendarClock, CalendarDays, Check, ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { formatSlotDate, formatSlotTimeRange, getInitialCalendarMonth, getMonthTitle, shiftCalendarMonth } from "../../shared/lib/dates";
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
  const [notice, setNotice] = useState("");

  const { freeDays, myDays, completedDays, slotsByDay, freeSlotCounts } = useMemo(() => {
    const free = new Set<string>();
    const mine = new Set<string>();
    const completed = new Set<string>();
    const byDay = new Map<string, StudentSlot[]>();
    for (const slot of bookingSlots) {
      const daySlots = byDay.get(slot.date) ?? [];
      daySlots.push(slot);
      byDay.set(slot.date, daySlots);
      if (slot.status === "mine") {
        if (slot.is_completed) completed.add(slot.date);
        else mine.add(slot.date);
      } else free.add(slot.date);
    }
    for (const daySlots of byDay.values()) daySlots.sort((a, b) => a.start_time.localeCompare(b.start_time));
    const freeCounts = new Map<string, number>();
    for (const [day, daySlots] of byDay) freeCounts.set(day, daySlots.filter((slot) => slot.status === "free").length);
    return { freeDays: free, myDays: mine, completedDays: completed, slotsByDay: byDay, freeSlotCounts: freeCounts };
  }, [bookingSlots]);

  useEffect(() => {
    if (selectedDay && !slotsByDay.has(selectedDay) && !activityDays.has(selectedDay)) setSelectedDay(null);
  }, [selectedDay, slotsByDay, activityDays]);

  useEffect(() => {
    setSelectedDay(null);
    setError("");
    setNotice("");
  }, [calendarMonth.month, calendarMonth.year]);

  const selectedSlots = selectedDay ? slotsByDay.get(selectedDay) ?? [] : [];
  const freeSlotCount = selectedSlots.filter((slot) => slot.status === "free").length;
  const completedSlotCount = selectedSlots.filter((slot) => slot.is_completed).length;
  const bookedSlotCount = selectedSlots.filter((slot) => slot.status === "mine" && !slot.is_completed).length;
  const isCompletedOnlyDay = selectedSlots.length > 0 && selectedSlots.every((slot) => slot.is_completed);
  const completedMonthCount = bookingSlots.filter((slot) => slot.is_completed).length;
  const plannedMonthCount = bookingSlots.filter((slot) => slot.status === "mine" && !slot.is_completed).length;
  const nextBooking = bookingSlots.find((slot) => slot.status === "mine" && !slot.is_completed);
  const selectedActivityTime = selectedDay && activityTimes[selectedDay]
    ? formatActivityTime(activityTimes[selectedDay]!)
    : null;
  const usedQuotaPercent = bookingQuota && bookingQuota.granted > 0
    ? Math.min(100, Math.max(0, Math.round((bookingQuota.used / bookingQuota.granted) * 100)))
    : 0;

  async function handleSlotAction(slot: StudentSlot) {
    if (slot.is_completed) return;
    setBusySlotId(slot.id);
    setError("");
    setNotice("");
    try {
      if (slot.status === "mine") await onCancelSlot(slot.id);
      else await onBookSlot(slot.id);
      setNotice(slot.status === "mine"
        ? `Запись на ${formatSlotDate(slot.date)} отменена.`
        : `Вы записаны на ${formatSlotDate(slot.date)} · ${formatSlotTimeRange(slot.start_time, slot.duration_minutes)}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось изменить запись");
    } finally {
      setBusySlotId(null);
    }
  }

  function showCurrentMonth() {
    onMonthChange(getInitialCalendarMonth());
    setSelectedDay(null);
    setError("");
    setNotice("");
  }

  return (
    <section className="account-calendar account-calendar--booking" aria-label="Календарь занятий">
      <header className="account-calendar__header">
        <div className="account-calendar__title">
          <span className="account-calendar__icon"><CalendarDays size={19} /></span>
          <div>
            <span className="account-calendar__eyebrow">РАСПИСАНИЕ</span>
            <h2>{getMonthTitle(calendarMonth)}</h2>
          </div>
        </div>
        <div className="account-calendar__navigation" aria-label="Навигация по месяцам">
          <button className="account-calendar__today" type="button" onClick={showCurrentMonth}>Сегодня</button>
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
          <div className="account-calendar__month-frame">
            <CalendarMonthGrid
              month={calendarMonth}
              activityDays={activityDays}
              freeDays={freeDays}
              freeSlotCounts={freeSlotCounts}
              bookingDays={myDays}
              completedDays={completedDays}
              showCellEvents={false}
              selectableDays={new Set([...freeDays, ...myDays, ...completedDays, ...activityDays])}
              selectedDay={selectedDay}
              onSelectDay={(dateKey) => {
                setNotice("");
                setError("");
                setSelectedDay((current) => current === dateKey ? null : dateKey);
              }}
              legend={[
                { marker: "is-free", label: "Свободное время" },
                { marker: "is-booking", label: "Ваша запись" },
                { marker: "is-completed", label: "Время занятия прошло" },
                { marker: "is-activity", label: "Были на платформе" },
              ]}
            />
          </div>
        </div>

        <aside className={`account-calendar__details ${isCompletedOnlyDay ? "is-completed-day" : ""}`} aria-live="polite">
          <header className="account-calendar__details-heading">
            <span className="account-calendar__details-icon"><CalendarCheck2 size={17} /></span>
            <div>
              <span className="account-calendar__eyebrow">{selectedDay ? "ДЕНЬ В РАСПИСАНИИ" : "МОЁ РАСПИСАНИЕ"}</span>
              <h3>{selectedDay ? formatSlotDate(selectedDay) : "Выберите дату"}</h3>
            </div>
            {selectedDay && (
              <button className="account-calendar__clear-day" type="button" aria-label="Сбросить выбранный день"
                title="Сбросить выбор" onClick={() => { setSelectedDay(null); setError(""); setNotice(""); }}>
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </header>

          {selectedDay && activityDays.has(selectedDay) && (
            <div className="account-calendar__activity-time">
              <span className="account-calendar__activity-icon"><Clock size={16} aria-hidden="true" /></span>
              <div><strong>Вы заходили</strong><span>Время визита</span></div>
              {selectedActivityTime
                ? <time dateTime={activityTimes[selectedDay] ?? undefined}>{selectedActivityTime}</time>
                : <time>не сохранено</time>}
            </div>
          )}

          {notice && <p className="account-calendar__notice" role="status">{notice}</p>}
          {error && <div className="form-error" role="alert">{error}</div>}

          {selectedDay && selectedSlots.length > 0 ? (
            <>
              <div className="account-calendar__slots-heading">
                <div>
                  <strong>Занятия и свободное время</strong>
                  <span>{[
                    completedSlotCount ? formatCompletedSlotCount(completedSlotCount) : "",
                    bookedSlotCount ? `${bookedSlotCount} запланировано` : "",
                    freeSlotCount ? formatFreeSlotCount(freeSlotCount) : "",
                  ].filter(Boolean).join(" · ")}</span>
                </div>
                <span>{selectedSlots.length}</span>
              </div>
              <div className="account-calendar__slots">
                {selectedSlots.map((slot) => {
                  const isMine = slot.status === "mine";
                  const isCompleted = Boolean(slot.is_completed);
                  const cannotCancel = isMine && !slot.can_cancel;
                  const actionLabel = isMine ? (slot.can_cancel ? "Отменить" : "Отмена закрыта") : "Записаться";
                  const timeRange = formatSlotTimeRange(slot.start_time, slot.duration_minutes);
                  if (isCompleted) {
                    return (
                      <article key={slot.id} className="account-calendar__slot is-completed"
                        aria-label={`Занятие завершено, ${timeRange}`}>
                        <span className="account-calendar__slot-time">
                          <span className="account-calendar__slot-completed-icon"><Check size={15} aria-hidden="true" /></span>
                          <span className="account-calendar__slot-completed-copy">
                            <strong>{timeRange}</strong>
                            <span>Занятие состоялось</span>
                          </span>
                        </span>
                        <span className="account-calendar__slot-action"><Check size={13} aria-hidden="true" />Завершено</span>
                      </article>
                    );
                  }
                  return (
                    <button key={slot.id} type="button" className={`account-calendar__slot ${isMine ? "is-booked" : ""}`}
                      disabled={busySlotId === slot.id || cannotCancel}
                      onClick={() => void handleSlotAction(slot)}
                      title={cannotCancel ? "Отменить занятие можно не позднее чем за 36 часов до начала" : undefined}>
                      <span className="account-calendar__slot-time"><Clock size={15} aria-hidden="true" />{timeRange}</span>
                      <span className="account-calendar__slot-action">{busySlotId === slot.id ? "Сохраняем…" : actionLabel}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : selectedDay ? (
            <div className="account-calendar__empty-state">
              <CalendarDays size={21} aria-hidden="true" />
              <div><strong>{activityDays.has(selectedDay) ? "Свободных слотов нет" : "На этот день пока нет окон"}</strong>
                <span>{activityDays.has(selectedDay) ? "История визита показана выше. Выберите другой день для записи." : "Выберите другой день, чтобы посмотреть расписание."}</span></div>
            </div>
          ) : (
            <div className="account-calendar__overview">
              <div className="account-calendar__overview-intro">
                <span className="account-calendar__overview-icon"><CalendarDays size={18} aria-hidden="true" /></span>
                <div><strong>Расписание месяца</strong><span>Выберите отмеченную дату, чтобы увидеть слоты и визиты.</span></div>
              </div>
              <div className="account-calendar__overview-stats">
                <div><strong>{completedMonthCount}</strong><span>Время занятий прошло</span></div>
                <div><strong>{plannedMonthCount}</strong><span>Запланировано</span></div>
              </div>
              {nextBooking && (
                <div className="account-calendar__next-booking">
                  <Clock size={15} aria-hidden="true" />
                  <span>Ближайшая запись</span>
                  <strong>{formatSlotDate(nextBooking.date)} · {formatSlotTimeRange(nextBooking.start_time, nextBooking.duration_minutes)}</strong>
                </div>
              )}
            </div>
          )}

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
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow" });
}

function formatFreeSlotCount(value: number): string {
  const lastTwo = value % 100;
  const last = value % 10;
  const unit = lastTwo >= 11 && lastTwo <= 14 ? "свободных слотов"
    : last === 1 ? "свободный слот" : last >= 2 && last <= 4 ? "свободных слота" : "свободных слотов";
  return `${value} ${unit}`;
}

function formatCompletedSlotCount(value: number): string {
  const lastTwo = value % 100;
  const last = value % 10;
  const phrase = lastTwo >= 11 && lastTwo <= 14 ? "занятий прошло"
    : last === 1 ? "занятие прошло" : last >= 2 && last <= 4 ? "занятия прошли" : "занятий прошло";
  return `${value} ${phrase}`;
}

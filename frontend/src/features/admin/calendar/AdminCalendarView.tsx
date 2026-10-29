import "./calendar.css";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { getAdminSlots } from "../api";
import { buildMonthCells, formatSlotDate, formatSlotTimeRange, getInitialCalendarMonth, getLocalDateKey, getMonthTitle, shiftCalendarMonth } from "../../../shared/lib/dates";
import type { AdminSlot } from "../../../shared/api/contracts";

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function AdminCalendarView({ onOpenStudent }: { onOpenStudent: (id: number) => void }) {
  const [month, setMonth] = useState(getInitialCalendarMonth);
  const [slots, setSlots] = useState<AdminSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const today = getLocalDateKey();
  const monthCells = useMemo(() => buildMonthCells(month), [month.year, month.month]);
  const weekCount = Math.ceil(monthCells.length / 7);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError("");
    setSelectedDay(null);
    setSlots([]);
    getAdminSlots(month, true).then((data) => {
      if (!cancelled) setSlots(data.slots.filter((slot) => slot.student !== null));
    }).catch((err) => {
      if (!cancelled) setError(err instanceof Error ? err.message : "Не удалось загрузить календарь");
    }).finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [month.year, month.month, reloadKey]);

  const bookingsByDay = useMemo(() => {
    const grouped = new Map<string, AdminSlot[]>();
    for (const slot of [...slots].sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`))) {
      const bookings = grouped.get(slot.date) ?? [];
      bookings.push(slot);
      grouped.set(slot.date, bookings);
    }
    return grouped;
  }, [slots]);
  const visibleBookings = selectedDay ? bookingsByDay.get(selectedDay) ?? [] : [...bookingsByDay.values()].flat();

  return (
    <section className="admin-calendar" aria-label="Календарь записей на занятия">
      <header className="admin-calendar__header">
        <div className="admin-calendar__title">
          <span className="admin-summary-icon"><CalendarDays size={20} aria-hidden="true" /></span>
          <div><h2>{getMonthTitle(month)}</h2><p>Записи учеников · время московское, UTC+3</p></div>
        </div>
        <div className="admin-calendar__navigation">
          <button type="button" onClick={() => setMonth(getInitialCalendarMonth())}>Сегодня</button>
          <button type="button" aria-label="Предыдущий месяц" onClick={() => setMonth(shiftCalendarMonth(month, -1))}><ChevronLeft size={18} /></button>
          <button type="button" aria-label="Следующий месяц" onClick={() => setMonth(shiftCalendarMonth(month, 1))}><ChevronRight size={18} /></button>
        </div>
      </header>

      {error ? <div className="form-error" role="alert">{error} <button type="button" onClick={() => setReloadKey((key) => key + 1)}>Повторить</button></div>
        : isLoading ? <p className="admin-note" role="status">Загружаем расписание…</p> : <>
          <div className="admin-calendar__scroll" tabIndex={0} role="region" aria-label="Месячный календарь занятий">
            <div className="admin-calendar__month">
              <div className="admin-calendar__weekdays" aria-hidden="true">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
              <div className="admin-calendar__grid" style={{ gridTemplateRows: `repeat(${weekCount}, minmax(0, 1fr))` }}>
                {monthCells.map((cell, index) => {
                  if (!cell) return <div className="admin-calendar__blank" key={`empty-${index}`} aria-hidden="true" />;
                  const bookings = bookingsByDay.get(cell.dateKey) ?? [];
                  return <article key={cell.key} className={`admin-calendar__day ${cell.dateKey === today ? "is-today" : ""} ${selectedDay === cell.dateKey ? "is-selected" : ""}`}>
                    <button className="admin-calendar__date" type="button" aria-pressed={selectedDay === cell.dateKey}
                      aria-label={`${formatSlotDate(cell.dateKey)}, записей: ${bookings.length}`}
                      onClick={() => setSelectedDay((current) => current === cell.dateKey ? null : cell.dateKey)}>
                      <span>{cell.day}</span>{bookings.length > 0 && <small>{bookings.length}</small>}
                    </button>
                    <div className="admin-calendar__day-events">
                      {bookings.slice(0, 3).map((slot) => <button key={slot.id} type="button"
                        className={`admin-calendar__event ${slot.is_past ? "is-past" : ""}`}
                        title={`${formatSlotTimeRange(slot.start_time, slot.duration_minutes)} · ${slot.student?.username}`}
                        onClick={() => setSelectedDay(cell.dateKey)}>
                        <strong>{formatSlotTimeRange(slot.start_time, slot.duration_minutes)}</strong>
                        <span>{slot.student?.username}</span>
                      </button>)}
                      {bookings.length > 3 && <button className="admin-calendar__more" type="button" onClick={() => setSelectedDay(cell.dateKey)}>Ещё {bookings.length - 3}</button>}
                    </div>
                  </article>;
                })}
              </div>
            </div>
          </div>
          <div className="admin-calendar__agenda">
            <div className="admin-calendar__agenda-title">
              <h3>{selectedDay ? `Записи · ${formatSlotDate(selectedDay)}` : "Все записи за месяц"} <small>{visibleBookings.length}</small></h3>
              {selectedDay && <button type="button" onClick={() => setSelectedDay(null)}>Показать весь месяц</button>}
            </div>
            {visibleBookings.length === 0 ? <p className="admin-note">{selectedDay ? "На этот день записей нет." : "На этот месяц занятий пока не запланировано. Свободные окна доступны во вкладке «Слоты записи»."}</p>
              : visibleBookings.map((slot) => <button className="admin-calendar__booking" key={slot.id} type="button" onClick={() => slot.student && onOpenStudent(slot.student.id)}>
                <Clock size={17} aria-hidden="true" />
                <div><strong>{formatSlotDate(slot.date)} · {formatSlotTimeRange(slot.start_time, slot.duration_minutes)}</strong><small>{slot.duration_minutes} мин · {slot.is_past ? "Прошедшее занятие" : "Запланировано"}</small></div>
                <div><strong>{slot.student?.username}</strong><small>{slot.student?.email}</small></div>
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>)}
          </div>
        </>}
    </section>
  );
}

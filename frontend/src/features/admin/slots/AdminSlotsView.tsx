import "./slots-form.css";
import "./slots-list.css";
import React, { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { BookOpen, CalendarClock, CalendarPlus, CheckCircle2, ChevronDown, ChevronRight, Clock, Code2, FileText, Lock, LogOut, PanelLeftClose, PanelLeftOpen, Play, Moon, Search, ShieldCheck, Sun, Terminal, Trash2, User, X } from "lucide-react";
import { getAdminSlots, createAdminSlot, deleteAdminSlot } from "../api";
import { formatSlotDate, formatSlotTimeRange, getInitialCalendarMonth, getLocalDateKey, getMonthTitle, shiftCalendarMonth } from "../../../shared/lib/dates";
import type { AdminSlot } from "../../../shared/api/contracts";
import type { CalendarMonth } from "../../../shared/api/contracts/account";

export function AdminSlotsView() {
  const [month, setMonth] = useState<CalendarMonth>(getInitialCalendarMonth);
  const [slots, setSlots] = useState<AdminSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingSlotIds, setDeletingSlotIds] = useState<number[]>([]);
  const mountedRef = useRef(true);
  const loadRequestRef = useRef(0);
  const [form, setForm] = useState(() => ({
    date: getLocalDateKey(),
    time: "18:00",
    duration: 60,
  }));

  const loadSlots = useCallback(() => {
    const requestId = ++loadRequestRef.current;
    setIsLoading(true);
    setError("");
    getAdminSlots(month)
      .then((data) => {
        if (mountedRef.current && requestId === loadRequestRef.current) setSlots(data.slots ?? []);
      })
      .catch((err) => {
        if (mountedRef.current && requestId === loadRequestRef.current) {
          setError(err instanceof Error ? err.message : "Не удалось загрузить слоты");
        }
      })
      .finally(() => {
        if (mountedRef.current && requestId === loadRequestRef.current) setIsLoading(false);
      });
  }, [month.year, month.month]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      loadRequestRef.current += 1;
    };
  }, []);

  const slotGroups = React.useMemo(() => {
    const grouped = new Map<string, AdminSlot[]>();
    for (const slot of [...slots].sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`))) {
      const daySlots = grouped.get(slot.date) ?? [];
      daySlots.push(slot);
      grouped.set(slot.date, daySlots);
    }
    return [...grouped.entries()].map(([date, daySlots]) => ({ date, slots: daySlots }));
  }, [slots]);
  const bookedCount = slots.filter((slot) => slot.student !== null).length;

  async function addSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      await createAdminSlot({ slot_date: form.date, start_time: form.time, duration_minutes: Number(form.duration) });
      if (mountedRef.current) loadSlots();
    } catch (err) {
      if (mountedRef.current) setError(err instanceof Error ? err.message : "Не удалось создать слот");
    } finally {
      if (mountedRef.current) setIsSaving(false);
    }
  }

  async function removeSlot(slotId: number) {
    if (deletingSlotIds.includes(slotId)) return;
    setDeletingSlotIds((current) => [...current, slotId]);
    setError("");
    try {
      await deleteAdminSlot(slotId);
      if (mountedRef.current) setSlots((current) => current.filter((slot) => slot.id !== slotId));
    } catch (err) {
      if (mountedRef.current) setError(err instanceof Error ? err.message : "Не удалось удалить слот");
    } finally {
      if (mountedRef.current) setDeletingSlotIds((current) => current.filter((id) => id !== slotId));
    }
  }

  return (
    <div className="admin-slots">
      <form className="slot-form" onSubmit={addSlot}>
        <label>
          Дата
          <input
            type="date"
            value={form.date}
            min={getLocalDateKey()}
            onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            required
          />
        </label>
        <label>
          Время
          <input
            type="time"
            value={form.time}
            onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
            required
          />
        </label>
        <label>
          Длительность
          <select
            value={form.duration}
            onChange={(event) => setForm((current) => ({ ...current, duration: Number(event.target.value) }))}
          >
            <option value={60}>60 мин</option>
            <option value={90}>90 мин</option>
            <option value={120}>120 мин</option>
          </select>
        </label>
        <button className="primary-action" type="submit" disabled={isSaving}>
          <CalendarPlus size={16} />
          {isSaving ? "..." : "Добавить"}
        </button>
      </form>

      <section className="slots-schedule" aria-label={`Расписание слотов за ${getMonthTitle(month)}`}>
        <header className="calendar-head slots-month-head">
          <div className="slots-month-heading">
            <strong>{getMonthTitle(month)}</strong>
            {!isLoading && !error && (
              <div className="slot-summary" aria-label="Сводка по слотам за месяц">
                <span><strong>{slots.length}</strong> слотов</span>
                <span className="is-free"><strong>{slots.length - bookedCount}</strong> свободно</span>
                <span className="is-booked"><strong>{bookedCount}</strong> занято</span>
              </div>
            )}
          </div>
          <div className="calendar-nav">
            <button type="button" onClick={() => setMonth(shiftCalendarMonth(month, -1))} aria-label="Предыдущий месяц">
              ‹
            </button>
            <button type="button" onClick={() => setMonth(shiftCalendarMonth(month, 1))} aria-label="Следующий месяц">
              ›
            </button>
          </div>
        </header>

        {error && <div className="form-error" role="alert">{error}</div>}

        <div className="admin-list">
          {isLoading ? (
            <p className="admin-note" role="status">Загружаем слоты...</p>
          ) : slots.length === 0 ? (
            <p className="admin-note">На этот месяц слотов нет. Добавьте свободное окно выше.</p>
          ) : (
            <div className="slot-days">
              {slotGroups.map((group) => {
                const dayBooked = group.slots.filter((slot) => slot.student !== null).length;
                return (
                  <section className="slot-day-group" key={group.date} aria-label={`Слоты на ${formatSlotDate(group.date)}`}>
                    <header className="slot-day-head">
                      <strong>{formatSlotDate(group.date)}</strong>
                      <span>{group.slots.length} слотов</span>
                      <small>{group.slots.length - dayBooked} свободно · {dayBooked} занято</small>
                    </header>
                    <div className="slot-day-items">
                      {group.slots.map((slot) => (
                        <article className={`slot-row ${slot.is_past ? "is-past" : ""}`} key={slot.id}>
                          <div className="slot-row-when">
                            <Clock size={15} aria-hidden="true" />
                            <div>
                              <strong>{formatSlotTimeRange(slot.start_time, slot.duration_minutes)}</strong>
                              <small>{slot.duration_minutes} мин</small>
                            </div>
                          </div>
                          <div className="slot-row-status">
                            {slot.student ? (
                              <span className="slot-booked">
                                <strong>{slot.student.username}</strong>
                                <small>{slot.student.email}</small>
                              </span>
                            ) : (
                              <span className="slot-free">Свободно</span>
                            )}
                          </div>
                          <button
                            className="icon-button slot-delete"
                            type="button"
                            onClick={() => removeSlot(slot.id)}
                            title={deletingSlotIds.includes(slot.id) ? "Удаляем слот" : "Удалить слот"}
                            aria-label={deletingSlotIds.includes(slot.id) ? "Удаляем слот" : "Удалить слот"}
                            disabled={deletingSlotIds.includes(slot.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </article>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

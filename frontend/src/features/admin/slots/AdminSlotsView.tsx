import React, { useCallback, useEffect, useState, type FormEvent } from "react";
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
  const [form, setForm] = useState(() => ({
    date: getLocalDateKey(),
    time: "18:00",
    duration: 60,
  }));

  const loadSlots = useCallback(() => {
    setIsLoading(true);
    getAdminSlots(month)
      .then((data) => setSlots(data.slots ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Не удалось загрузить слоты"))
      .finally(() => setIsLoading(false));
  }, [month.year, month.month]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  async function addSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      await createAdminSlot({ slot_date: form.date, start_time: form.time, duration_minutes: Number(form.duration) });
      loadSlots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать слот");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeSlot(slotId: number) {
    setError("");
    try {
      await deleteAdminSlot(slotId);
      setSlots((current) => current.filter((slot) => slot.id !== slotId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить слот");
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

      <div className="calendar-head slots-month-head">
        <strong>{getMonthTitle(month)}</strong>
        <div className="calendar-nav">
          <button type="button" onClick={() => setMonth(shiftCalendarMonth(month, -1))} aria-label="Предыдущий месяц">
            ‹
          </button>
          <button type="button" onClick={() => setMonth(shiftCalendarMonth(month, 1))} aria-label="Следующий месяц">
            ›
          </button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="admin-list">
        {isLoading ? (
          <p className="admin-note">Загружаем слоты...</p>
        ) : slots.length === 0 ? (
          <p className="admin-note">На этот месяц слотов нет. Добавьте свободное окно выше.</p>
        ) : (
          slots.map((slot) => (
            <article className={`slot-row ${slot.is_past ? "is-past" : ""}`} key={slot.id}>
              <div className="slot-row-when">
                <Clock size={15} />
                <div>
                  <strong>{formatSlotDate(slot.date)}</strong>
                  <small>
                    {formatSlotTimeRange(slot.start_time, slot.duration_minutes)} · {slot.duration_minutes} мин
                  </small>
                </div>
              </div>
              <div className="slot-row-status">
                {slot.student ? (
                  <span className="slot-booked">
                    записан: {slot.student.username}
                    <small>{slot.student.email}</small>
                  </span>
                ) : (
                  <span className="slot-free">свободно</span>
                )}
              </div>
              <button
                className="icon-button slot-delete"
                type="button"
                onClick={() => removeSlot(slot.id)}
                title="Удалить слот"
              >
                <Trash2 size={16} />
              </button>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

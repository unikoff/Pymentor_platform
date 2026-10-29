import "../../account/calendar-base.css";
import "../../account/calendar.css";
import "./profile.css";
import "./profile-actions.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, BookOpenCheck, CalendarCheck, CalendarDays, ChevronLeft, ChevronRight, Clock, Trash2 } from "lucide-react";
import { getStudentProfile, changeStudentSubscription, addStudentQuota, deleteStudent } from "../api";
import { formatSlotDate, formatSlotTimeRange, getInitialCalendarMonth, getMonthTitle, shiftCalendarMonth, formatSubscriptionDate } from "../../../shared/lib/dates";
import { CalendarMonthGrid } from "../../../shared/ui/calendar/CalendarMonthGrid";
import { AdminLearningProgress } from "../progress/AdminLearningProgress";
import { AdminStudentActivity } from "./AdminStudentActivity";
import type { StudentProfile as StudentProfileData } from "../../../shared/api/contracts";
import type { CalendarMonth } from "../../../shared/api/contracts/account";

const DELETE_KEYWORD = "УДАЛИТЬ";
type StudentProfile = StudentProfileData;

export function AdminStudentProfile({
  studentId,
  onDeleted,
}: {
  studentId: number;
  onBack: () => void;
  onDeleted: () => void;
}) {
  const [month, setMonth] = useState<CalendarMonth>(getInitialCalendarMonth);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => setSelectedDay(null), [month.year, month.month]);

  const loadProfile = useCallback(() => {
    setIsLoading(true);
    getStudentProfile(studentId, month)
      .then((data) => setProfile(data.profile))
      .catch((err) => setError(err instanceof Error ? err.message : "Не удалось загрузить профиль"))
      .finally(() => setIsLoading(false));
  }, [studentId, month.year, month.month]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function mutate(request: Promise<unknown>) {
    setIsBusy(true);
    setError("");
    try {
      await request;
      loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось выполнить действие");
    } finally {
      setIsBusy(false);
    }
  }

  function changeSubscription(days: number | null) {
    mutate(changeStudentSubscription(studentId, days));
  }

  function addQuota(amount: number) {
    mutate(addStudentQuota(studentId, month, amount));
  }

  async function deleteUser() {
    setIsBusy(true);
    setError("");
    try {
      await deleteStudent(studentId);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить аккаунт");
      setIsBusy(false);
    }
  }

  const activityDays = useMemo(() => new Set(profile?.activity_days ?? []), [profile?.activity_days]);
  const bookingsByDay = useMemo(() => {
    const byDay = new Map<string, StudentProfile["bookings"]>();
    for (const booking of profile?.bookings ?? []) {
      const bookings = byDay.get(booking.date) ?? [];
      bookings.push(booking);
      byDay.set(booking.date, bookings);
    }
    return byDay;
  }, [profile?.bookings]);
  const bookingDays = useMemo(() => new Set(bookingsByDay.keys()), [bookingsByDay]);

  if (isLoading && !profile) {
    return (
      <div className="admin-profile">
        <p className="admin-note">Загружаем профиль...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="admin-profile">
        <div className="form-error">{error || "Профиль не найден"}</div>
      </div>
    );
  }

  const selectedBookings = selectedDay ? bookingsByDay.get(selectedDay) ?? [] : [];
  const totalActivityDays = profile.total_activity_days ?? profile.activity_days_count;
  const totalBookings = profile.total_bookings ?? profile.bookings.length;
  const quotaPercent = profile.quota.granted > 0
    ? Math.min(100, (profile.quota.used / profile.quota.granted) * 100)
    : 0;

  return (
    <div className="admin-profile">
      <div className="profile-head">
        <span className="avatar">{profile.username.slice(0, 2).toUpperCase()}</span>
        <div>
          <strong>
            {profile.username}
            {profile.is_admin && <span className="admin-badge">admin</span>}
          </strong>
          <small>{profile.email}</small>
        </div>
        <div className="profile-head__meta">
          <span>ID · {profile.id}</span>
          <span className={`profile-state-pill ${profile.has_active_subscription ? "is-active" : "is-inactive"}`}>
            {profile.has_active_subscription ? "Подписка активна" : "Подписка не активна"}
          </span>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <section className="profile-summary-grid" aria-label="Основные показатели ученика">
        <article className="profile-summary-card profile-summary-card--lessons">
          <span className="profile-summary-card__label"><BookOpenCheck size={17} aria-hidden="true" />Уроков завершено</span>
          <strong>{profile.completed_lessons.toLocaleString("ru-RU")}</strong>
          <small>+{profile.completed_lessons_7d ?? 0} за 7 дней</small>
        </article>
        <article className="profile-summary-card profile-summary-card--quota">
          <span className="profile-summary-card__label"><CalendarCheck size={17} aria-hidden="true" />Занятий осталось</span>
          <strong>{profile.quota.remaining} / {profile.quota.granted}</strong>
          <small>лимит на этот месяц</small>
        </article>
        <article className="profile-summary-card profile-summary-card--activity">
          <span className="profile-summary-card__label"><Activity size={17} aria-hidden="true" />Дней на платформе</span>
          <strong>{totalActivityDays.toLocaleString("ru-RU")}</strong>
          <small>{profile.activity_days_count} в {getMonthTitle(month)}</small>
        </article>
        <article className="profile-summary-card profile-summary-card--bookings">
          <span className="profile-summary-card__label"><CalendarDays size={17} aria-hidden="true" />Занятия</span>
          <strong>{totalBookings.toLocaleString("ru-RU")}</strong>
          <small>{profile.bookings.length} в {getMonthTitle(month)}</small>
        </article>
      </section>

      <div className="profile-statistics-grid">
        <div className="profile-calendar-stack">
          <section className="account-calendar admin-profile-calendar" aria-label="Календарь активности и записей пользователя">
            <header className="account-calendar__header">
              <div className="account-calendar__title">
                <span className="account-calendar__icon"><CalendarDays size={19} /></span>
                <div>
                  <span className="account-calendar__eyebrow">АКТИВНОСТЬ ПО ДНЯМ</span>
                  <h2>{getMonthTitle(month)}</h2>
                  <span className="admin-profile-calendar__count">Активных дней: {profile.activity_days_count}</span>
                </div>
              </div>
              <div className="account-calendar__navigation" aria-label="Навигация по месяцам">
                <button type="button" onClick={() => setMonth(shiftCalendarMonth(month, -1))} aria-label="Предыдущий месяц">
                  <ChevronLeft size={18} />
                </button>
                <button type="button" onClick={() => setMonth(shiftCalendarMonth(month, 1))} aria-label="Следующий месяц">
                  <ChevronRight size={18} />
                </button>
              </div>
            </header>

            <div className="account-calendar__layout">
              <div className="account-calendar__main">
                <CalendarMonthGrid
                  month={month}
                  activityDays={activityDays}
                  bookingDays={bookingDays}
                  selectableDays={bookingDays}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                  legend={[
                    { marker: "is-activity", label: "Был на платформе" },
                    { marker: "is-booking", label: "Запись на занятие" },
                  ]}
                />
              </div>

              <aside className="account-calendar__details" aria-live="polite">
                <div className="account-calendar__details-heading">
                  <span className="account-calendar__details-icon"><Clock size={16} /></span>
                  <div>
                    <span className="account-calendar__eyebrow">ЗАПИСЬ НА ЗАНЯТИЕ</span>
                    <h3>{selectedDay ? formatSlotDate(selectedDay) : "Занятия пользователя"}</h3>
                  </div>
                </div>
                {selectedBookings.length > 0 ? (
                  <div className="admin-profile-calendar__bookings">
                    {selectedBookings.map((booking) => (
                      <div className="admin-profile-calendar__booking" key={booking.id}>
                        <Clock size={14} />
                        <strong>{formatSlotTimeRange(booking.start_time, booking.duration_minutes)}</strong>
                        <span>{booking.duration_minutes} мин</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="account-calendar__empty">
                    {profile.bookings.length === 0
                      ? "В этом месяце записей нет."
                      : "Выберите день с отметкой записи, чтобы посмотреть время занятия."}
                  </p>
                )}
              </aside>
            </div>
          </section>
          <AdminStudentActivity summary={profile.activity_summary} />
        </div>

        <AdminLearningProgress progress={profile.learning_progress ?? []} />
      </div>

      <section className="profile-management-grid" aria-label="Подписка и квота занятий">
        <article className="profile-management-card">
          <div className="profile-management-card__head">
            <div>
              <span className="profile-card-eyebrow">ПОДПИСКА</span>
              <strong className={profile.has_active_subscription ? "is-active-subscription" : ""}>
                {profile.has_active_subscription ? `До ${formatSubscriptionDate(profile.subscription_until)}` : "Не активна"}
              </strong>
              <small>
                {profile.has_active_subscription
                  ? `Тариф: ${profile.subscription_plan ?? "не указан"}`
                  : profile.subscription_until
                    ? `Истекла ${formatSubscriptionDate(profile.subscription_until)}`
                    : profile.subscription_plan ? `Тариф: ${profile.subscription_plan}` : "Тариф не задан"}
              </small>
            </div>
          </div>
          <div className="profile-actions">
            <button type="button" disabled={isBusy} onClick={() => changeSubscription(1)}>Продлить на 1 день</button>
            <button type="button" disabled={isBusy} onClick={() => changeSubscription(30)}>Продлить на 30 дней</button>
            <button type="button" className="is-danger" disabled={isBusy || !profile.subscription_until} onClick={() => changeSubscription(null)}>
              Сбросить
            </button>
          </div>
        </article>

        <article className="profile-management-card">
          <div className="profile-management-card__head">
            <div>
              <span className="profile-card-eyebrow">КВОТА · {getMonthTitle(month)}</span>
              <strong>{profile.quota.used} из {profile.quota.granted} использовано</strong>
              <small>{profile.quota.remaining} осталось</small>
            </div>
          </div>
          <div className="profile-quota-track" role="progressbar" aria-label="Использовано занятий по квоте"
            aria-valuemin={0} aria-valuemax={Math.max(profile.quota.granted, profile.quota.used, 1)} aria-valuenow={profile.quota.used}>
            <span style={{ width: `${quotaPercent}%` }} />
          </div>
          <div className="profile-actions">
            <button type="button" aria-label="Добавить 1 занятие к квоте" disabled={isBusy} onClick={() => addQuota(1)}>+1 занятие</button>
            <button type="button" aria-label="Добавить 6 занятий к квоте" disabled={isBusy} onClick={() => addQuota(6)}>+6</button>
            <button type="button" aria-label="Добавить 12 занятий к квоте" disabled={isBusy} onClick={() => addQuota(12)}>+12</button>
          </div>
        </article>
      </section>

      <div className="profile-danger">
        <span className="profile-bookings-title">Опасная зона</span>
        {isDeleteOpen ? (
          <>
            <p className="admin-note">
              Аккаунт <strong>{profile.email}</strong> и весь его прогресс будут удалены безвозвратно.
              Забронированные им занятия освободятся. Введите <strong>{DELETE_KEYWORD}</strong>, чтобы подтвердить.
            </p>
            <input
              className="profile-danger-input"
              value={deleteConfirm}
              onChange={(event) => setDeleteConfirm(event.target.value)}
              placeholder={DELETE_KEYWORD}
              autoFocus
            />
            <div className="profile-actions">
              <button
                type="button"
                className="is-danger"
                disabled={isBusy || deleteConfirm.trim() !== DELETE_KEYWORD}
                onClick={deleteUser}
              >
                <Trash2 size={14} /> Удалить навсегда
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeleteConfirm("");
                }}
              >
                Отмена
              </button>
            </div>
          </>
        ) : (
          <div className="profile-actions">
            <button type="button" className="is-danger" disabled={isBusy} onClick={() => setIsDeleteOpen(true)}>
              <Trash2 size={14} /> Удалить пользователя
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

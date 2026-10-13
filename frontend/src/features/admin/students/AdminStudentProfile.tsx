import React, { useCallback, useEffect, useState } from "react";
import { CalendarClock, ChevronDown, ChevronRight, Clock, Search, Trash2, X } from "lucide-react";
import { getStudentProfile, changeStudentSubscription, addStudentQuota, deleteStudent } from "../api";
import { buildMonthCells, formatSlotDate, formatSlotTimeRange, getInitialCalendarMonth, getMonthTitle, shiftCalendarMonth, formatSubscriptionDate } from "../../../shared/lib/dates";
import { AdminLearningProgress } from "../progress/AdminLearningProgress";
import type { StudentProfile as StudentProfileData } from "../../../shared/api/contracts";
import type { CalendarMonth } from "../../../shared/api/contracts/account";

const DELETE_KEYWORD = "УДАЛИТЬ";
type StudentProfile = StudentProfileData;

export function AdminStudentProfile({
  studentId,
  onBack,
  onDeleted,
}: {
  studentId: number;
  onBack: () => void;
  onDeleted: () => void;
}) {
  const [month, setMonth] = useState<CalendarMonth>(getInitialCalendarMonth);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

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

  if (isLoading && !profile) {
    return (
      <div className="admin-profile">
        <button className="admin-back" type="button" onClick={onBack}>
          ‹ К списку
        </button>
        <p className="admin-note">Загружаем профиль...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="admin-profile">
        <button className="admin-back" type="button" onClick={onBack}>
          ‹ К списку
        </button>
        <div className="form-error">{error || "Профиль не найден"}</div>
      </div>
    );
  }

  const activityDays = new Set(profile.activity_days);

  return (
    <div className="admin-profile">
      <button className="admin-back" type="button" onClick={onBack}>
        ‹ К списку
      </button>

      <div className="profile-head">
        <span className="avatar">{profile.username.slice(0, 2).toUpperCase()}</span>
        <div>
          <strong>
            {profile.username}
            {profile.is_admin && <span className="admin-badge">admin</span>}
          </strong>
          <small>{profile.email}</small>
        </div>
      </div>

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

      <div className="profile-metric">
        <div>
          <span>Подписка</span>
          <strong className={profile.has_active_subscription ? "is-active-subscription" : ""}>
            {profile.has_active_subscription ? `до ${formatSubscriptionDate(profile.subscription_until)}` : "не активна"}
          </strong>
        </div>
        <div className="profile-actions">
          <button type="button" disabled={isBusy} onClick={() => changeSubscription(1)}>+1 день</button>
          <button type="button" disabled={isBusy} onClick={() => changeSubscription(30)}>+30 дн</button>
          <button type="button" className="is-danger" disabled={isBusy || !profile.subscription_until} onClick={() => changeSubscription(null)}>
            Сбросить
          </button>
        </div>
      </div>

      <div className="profile-metric">
        <div>
          <span>Занятий в этом месяце</span>
          <strong>
            использовано {profile.quota.used} из {profile.quota.granted}
          </strong>
        </div>
        <div className="profile-actions">
          <button type="button" disabled={isBusy} onClick={() => addQuota(1)}>+1</button>
          <button type="button" disabled={isBusy} onClick={() => addQuota(6)}>+6</button>
          <button type="button" disabled={isBusy} onClick={() => addQuota(12)}>+12</button>
        </div>
      </div>

      <div className="profile-overview-grid">
        <section className="profile-activity-calendar" aria-label="Календарь активности">
          <div className="profile-activity-calendar-head">
            <div>
              <span>Активность</span>
              <strong>{profile.activity_days_count} дней заходил в этом месяце</strong>
            </div>
            <span className="profile-activity-legend">Заходил</span>
          </div>
          <div className="calendar-weekdays" aria-hidden="true">
            <span>Пн</span>
            <span>Вт</span>
            <span>Ср</span>
            <span>Чт</span>
            <span>Пт</span>
            <span>Сб</span>
            <span>Вс</span>
          </div>
          <div className="calendar-grid" role="grid" aria-label={`Активность за ${getMonthTitle(month)}`}>
            {buildMonthCells(month).map((cell, index) => {
              if (!cell) {
                return <span className="calendar-day is-empty" key={`empty-${index}`} aria-hidden="true" />;
              }

              const wasActive = activityDays.has(cell.dateKey);
              return (
                <span
                  className={`calendar-day ${wasActive ? "is-active" : ""}`}
                  key={cell.key}
                  role="gridcell"
                  title={wasActive ? "Заходил" : undefined}
                  aria-label={`${cell.day}: ${wasActive ? "заходил" : "не заходил"}`}
                >
                  {cell.day}
                </span>
              );
            })}
          </div>
        </section>

        <AdminLearningProgress progress={profile.learning_progress ?? []} />
      </div>

      <div className="profile-bookings">
        <span className="profile-bookings-title">Записи на занятия</span>
        {profile.bookings.length === 0 ? (
          <p className="admin-note">В этом месяце записей нет.</p>
        ) : (
          profile.bookings.map((booking) => (
            <div className="profile-booking-row" key={booking.id}>
              <Clock size={14} />
              <strong>{formatSlotDate(booking.date)}</strong>
              <span>
                {formatSlotTimeRange(booking.start_time, booking.duration_minutes)} · {booking.duration_minutes} мин
              </span>
            </div>
          ))
        )}
      </div>

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

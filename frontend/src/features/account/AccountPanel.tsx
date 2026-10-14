import "./calendar.css";
import { BookOpen, CreditCard, LogOut, UserRound } from "lucide-react";
import { CalendarPanel } from "./CalendarPanel";
import { formatSubscriptionDate } from "../../shared/lib/dates";
import type { UserProfile } from "../../shared/api/contracts";
import type { CalendarMonth, StudentSlot, QuotaStatus } from "../../shared/api/contracts/account";

export function AccountPanel({
  progress,
  user,
  calendarMonth,
  activityDays,
  bookingSlots,
  bookingQuota,
  onMonthChange,
  onBookSlot,
  onCancelSlot,
  onLogout,
}: {
  progress: number;
  user: UserProfile;
  calendarMonth: CalendarMonth;
  activityDays: Set<string>;
  bookingSlots: StudentSlot[];
  bookingQuota: QuotaStatus | null;
  onMonthChange: (calendarMonth: CalendarMonth) => void;
  onBookSlot: (slotId: number) => Promise<void>;
  onCancelSlot: (slotId: number) => Promise<void>;
  onLogout: () => void;
}) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <section className="account-panel account-dashboard" aria-label="Личный кабинет">
      <header className="account-dashboard__header">
        <div>
          <span className="account-dashboard__eyebrow"><UserRound size={15} /> МОЙ ПРОФИЛЬ</span>
          <h1>Личный кабинет</h1>
          <p>Профиль, прогресс обучения и расписание занятий — в одном месте.</p>
        </div>
        <button className="account-dashboard__logout" type="button" onClick={onLogout}>
          <LogOut size={16} /> Выйти из аккаунта
        </button>
      </header>

      <div className="account-overview">
        <section className="account-profile-card" aria-label="Профиль пользователя">
          <span className="account-profile-card__avatar" aria-hidden="true">
            {user.username.slice(0, 2).toUpperCase()}
          </span>
          <div className="account-profile-card__identity">
            <span>Ваш аккаунт</span>
            <h2>{user.username}</h2>
            <p>{user.email}</p>
          </div>
        </section>

        <section className="account-stat-card account-stat-card--progress" aria-label={`Прогресс обучения: ${safeProgress}%`}>
          <div className="account-stat-card__label"><BookOpen size={17} /> Прогресс обучения</div>
          <strong className="account-stat-card__value">{safeProgress}<small>%</small></strong>
          <div className="account-progress-track" role="progressbar" aria-label="Прогресс обучения"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeProgress}>
            <span style={{ width: `${safeProgress}%` }} />
          </div>
          <span className="account-stat-card__hint">Продолжайте с того места, где остановились</span>
        </section>

        <section className={`account-stat-card account-stat-card--subscription ${user.has_active_subscription ? "is-active" : "is-inactive"}`}>
          <div className="account-stat-card__label"><CreditCard size={17} /> Подписка</div>
          <strong className="account-stat-card__value account-stat-card__value--subscription">
            {user.has_active_subscription ? "Активна" : "Не активна"}
          </strong>
          <span className="account-stat-card__hint">
            {user.has_active_subscription ? `Действует до ${formatSubscriptionDate(user.subscription_until)}` : "Продлите подписку, чтобы открыть все занятия"}
          </span>
        </section>
      </div>

      <CalendarPanel
        calendarMonth={calendarMonth}
        activityDays={activityDays}
        bookingSlots={bookingSlots}
        bookingQuota={bookingQuota}
        onMonthChange={onMonthChange}
        onBookSlot={onBookSlot}
        onCancelSlot={onCancelSlot}
      />
    </section>
  );
}

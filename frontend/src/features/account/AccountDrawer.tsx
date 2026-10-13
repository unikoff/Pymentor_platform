import { LogOut, User, X } from "lucide-react";
import { CalendarPanel } from "./CalendarPanel";
import { formatSubscriptionDate } from "../../shared/lib/dates";
import type { UserProfile } from "../../shared/api/contracts";
import type { CalendarMonth, StudentSlot, QuotaStatus } from "../../shared/api/contracts/account";

export function AccountDrawer({
  isOpen,
  progress,
  user,
  calendarMonth,
  activityDays,
  bookingSlots,
  bookingQuota,
  onMonthChange,
  onBookSlot,
  onCancelSlot,
  onClose,
  onLogout,
}: {
  isOpen: boolean;
  progress: number;
  user: UserProfile;
  calendarMonth: CalendarMonth;
  activityDays: Set<string>;
  bookingSlots: StudentSlot[];
  bookingQuota: QuotaStatus | null;
  onMonthChange: (calendarMonth: CalendarMonth) => void;
  onBookSlot: (slotId: number) => Promise<void>;
  onCancelSlot: (slotId: number) => Promise<void>;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <div className={`drawer-layer ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
      <button
        className="drawer-backdrop"
        type="button"
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
        aria-label="Закрыть личный кабинет"
      />
      <aside className="account-drawer" role="dialog" aria-modal={isOpen} aria-label="Личный кабинет">
        <div className="drawer-head">
          <strong>Личный кабинет</strong>
          <button className="icon-button" type="button" onClick={onClose} title="Закрыть" tabIndex={isOpen ? 0 : -1}>
            <X size={18} />
          </button>
        </div>
        <div className="account-card">
          <span className="avatar">{user.username.slice(0, 2).toUpperCase()}</span>
          <div>
            <strong>{user.username}</strong>
            <small>{user.email}</small>
          </div>
        </div>
        <div className="account-metric">
          <span>Прогресс</span>
          <strong>{progress}%</strong>
        </div>
        <div className={`account-metric ${user.has_active_subscription ? "is-active-subscription" : "is-expired-subscription"}`}>
          <span>Подписка</span>
          <strong>{user.has_active_subscription ? `до ${formatSubscriptionDate(user.subscription_until)}` : "нужно продлить"}</strong>
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
        <button className="secondary-action" type="button" onClick={onLogout} tabIndex={isOpen ? 0 : -1}>
          <LogOut size={17} />
          Выйти
        </button>
      </aside>
    </div>
  );
}

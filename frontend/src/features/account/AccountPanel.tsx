import "./calendar.css";
import "./account-tabs.css";
import { useId, useState, type KeyboardEvent } from "react";
import { BarChart3, BookOpen, CalendarClock, CalendarDays, CreditCard, Flame, Settings } from "lucide-react";
import { CalendarPanel } from "./CalendarPanel";
import { AccountStatistics, type AccountStatisticsData } from "./AccountStatistics";
import { AccountPayments, type AccountPaymentsData } from "./AccountPayments";
import { AccountSettings, type AccountSettingsData } from "./AccountSettings";
import type { UserProfile } from "../../shared/api/contracts";
import type { ActivitySummaryResponse, CalendarMonth, StudentSlot, QuotaStatus } from "../../shared/api/contracts/account";

const accountTabs = [
  { id: "booking", label: "Запись", icon: CalendarDays },
  { id: "statistics", label: "Статистика", icon: BarChart3 },
  { id: "payments", label: "Оплата", icon: CreditCard },
  { id: "settings", label: "Настройки", icon: Settings },
] as const;
type AccountTab = typeof accountTabs[number]["id"];

function formatStreak(days: number) {
  const lastTwoDigits = days % 100;
  const lastDigit = days % 10;
  const unit = lastTwoDigits >= 11 && lastTwoDigits <= 14
    ? "дней"
    : lastDigit === 1 ? "день" : lastDigit >= 2 && lastDigit <= 4 ? "дня" : "дней";
  return `${days} ${unit}`;
}

export function AccountPanel({
  progress,
  user,
  calendarMonth,
  activityDays,
  activityTimes,
  activitySummary,
  bookingSlots,
  bookingQuota,
  onMonthChange,
  onBookSlot,
  onCancelSlot,
  onLogout,
  statisticsData,
  paymentsData,
  settingsData,
  onCheckout,
}: {
  progress: number;
  user: UserProfile;
  calendarMonth: CalendarMonth;
  activityDays: Set<string>;
  activityTimes: Record<string, string | null>;
  activitySummary: ActivitySummaryResponse | null;
  bookingSlots: StudentSlot[];
  bookingQuota: QuotaStatus | null;
  onMonthChange: (calendarMonth: CalendarMonth) => void;
  onBookSlot: (slotId: number) => Promise<void>;
  onCancelSlot: (slotId: number) => Promise<void>;
  onLogout: () => void;
  statisticsData?: AccountStatisticsData | null;
  paymentsData?: AccountPaymentsData | null;
  settingsData?: AccountSettingsData | null;
  onCheckout?: () => void;
}) {
  const safeProgress = Math.min(100, Math.max(0, progress));
  const [activeTab, setActiveTab] = useState<AccountTab>("booking");
  const tabsId = useId();
  const streak = activitySummary?.current_streak;
  const streakLabel = streak === undefined ? "—" : formatStreak(streak);

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % accountTabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index + accountTabs.length - 1) % accountTabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = accountTabs.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(accountTabs[nextIndex].id);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus();
  }

  return (
    <section className="account-panel account-dashboard" aria-label="Личный кабинет">
      <div className="account-overview">
        <section className="account-summary-item" aria-label={`Серия занятий: ${streakLabel}`}>
          <span className="account-summary-item__label"><Flame size={15} aria-hidden="true" /> Серия</span>
          <strong className="account-summary-item__value">{streakLabel}</strong>
        </section>

        <section className="account-summary-item" aria-label={bookingQuota
          ? `Занятий осталось: ${bookingQuota.remaining} из ${bookingQuota.granted} за выбранный месяц`
          : "Лимит занятий: данные загружаются"}>
          <span className="account-summary-item__label"><CalendarClock size={15} aria-hidden="true" /> Занятий осталось</span>
          <strong className="account-summary-item__value">{bookingQuota ? `${bookingQuota.remaining} / ${bookingQuota.granted}` : "—"}</strong>
        </section>

        <section className="account-summary-item account-summary-item--progress" aria-label={`Прогресс обучения: ${safeProgress}%`}>
          <span className="account-summary-item__label"><BookOpen size={15} aria-hidden="true" /> Прогресс</span>
          <strong className="account-summary-item__value">{safeProgress}%</strong>
          <div className="account-progress-track" role="progressbar" aria-label="Прогресс обучения"
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeProgress}>
            <span style={{ width: `${safeProgress}%` }} />
          </div>
        </section>

        <section className="account-summary-item" aria-label={activitySummary
          ? `Дней на платформе всего: ${activitySummary.total_active_days}`
          : "Общее число дней на платформе загружается"}>
          <span className="account-summary-item__label"><CalendarDays size={15} aria-hidden="true" /> Дней на платформе</span>
          <strong className="account-summary-item__value">{activitySummary?.total_active_days ?? "—"}</strong>
          <span className="account-summary-item__note">за всё время</span>
        </section>
      </div>

      <div className="account-tabs" role="tablist" aria-label="Разделы личного кабинета">
        {accountTabs.map(({ id, label, icon: Icon }, index) => (
          <button key={id} type="button" role="tab" id={`${tabsId}-tab-${id}`}
            aria-selected={activeTab === id} aria-controls={`${tabsId}-panel-${id}`}
            tabIndex={activeTab === id ? 0 : -1} onClick={() => setActiveTab(id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}>
            <Icon size={18} aria-hidden="true" /><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="account-tab-panel" role="tabpanel" id={`${tabsId}-panel-booking`}
        aria-labelledby={`${tabsId}-tab-booking`} hidden={activeTab !== "booking"} tabIndex={0}>
        <CalendarPanel
          calendarMonth={calendarMonth}
          activityDays={activityDays}
          activityTimes={activityTimes}
          bookingSlots={bookingSlots}
          bookingQuota={bookingQuota}
          onMonthChange={onMonthChange}
          onBookSlot={onBookSlot}
          onCancelSlot={onCancelSlot}
        />
      </div>
      <div className="account-tab-panel" role="tabpanel" id={`${tabsId}-panel-statistics`}
        aria-labelledby={`${tabsId}-tab-statistics`} hidden={activeTab !== "statistics"} tabIndex={0}>
        <AccountStatistics data={statisticsData} />
      </div>
      <div className="account-tab-panel" role="tabpanel" id={`${tabsId}-panel-payments`}
        aria-labelledby={`${tabsId}-tab-payments`} hidden={activeTab !== "payments"} tabIndex={0}>
        <AccountPayments data={paymentsData} onCheckout={onCheckout} />
      </div>
      <div className="account-tab-panel" role="tabpanel" id={`${tabsId}-panel-settings`}
        aria-labelledby={`${tabsId}-tab-settings`} hidden={activeTab !== "settings"} tabIndex={0}>
        <AccountSettings user={user} data={settingsData} onLogout={onLogout} />
      </div>
    </section>
  );
}

import "./calendar.css";
import "./account-tabs.css";
import { useId, useState, type KeyboardEvent } from "react";
import { Award, BarChart3, CalendarDays, CreditCard, History, Settings } from "lucide-react";
import { CalendarPanel } from "./CalendarPanel";
import { AccountStatistics, type AccountStatisticsData } from "./AccountStatistics";
import { AccountAchievements } from "./AccountAchievements";
import { AccountActivityHistory } from "./AccountActivityHistory";
import { AccountPayments, type AccountPaymentsData } from "./AccountPayments";
import { AccountSettings, type AccountSettingsData } from "./AccountSettings";
import type { UserProfile } from "../../shared/api/contracts";
import type { CalendarMonth, StudentSlot, QuotaStatus } from "../../shared/api/contracts/account";

const accountTabs = [
  { id: "booking", label: "Запись", icon: CalendarDays },
  { id: "statistics", label: "Статистика", icon: BarChart3 },
  { id: "payments", label: "Оплата", icon: CreditCard },
  { id: "settings", label: "Настройки", icon: Settings },
  { id: "achievements", label: "Достижения", icon: Award },
  { id: "history", label: "История", icon: History },
] as const;
type AccountTab = typeof accountTabs[number]["id"];

export function AccountPanel({
  user,
  calendarMonth,
  activityDays,
  activityTimes,
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
  user: UserProfile;
  calendarMonth: CalendarMonth;
  activityDays: Set<string>;
  activityTimes: Record<string, string | null>;
  bookingSlots: StudentSlot[];
  bookingQuota: QuotaStatus | null;
  onMonthChange: (calendarMonth: CalendarMonth) => void;
  onBookSlot: (slotId: number) => Promise<void>;
  onCancelSlot: (slotId: number) => Promise<void>;
  onLogout: () => void;
  statisticsData: AccountStatisticsData;
  paymentsData?: AccountPaymentsData | null;
  settingsData?: AccountSettingsData | null;
  onCheckout?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<AccountTab>("booking");
  const tabsId = useId();

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

      <div className="account-tab-panel account-tab-panel--booking" role="tabpanel" id={`${tabsId}-panel-booking`}
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
        <AccountStatistics data={statisticsData} bookingQuota={bookingQuota} />
      </div>
      <div className="account-tab-panel" role="tabpanel" id={`${tabsId}-panel-payments`}
        aria-labelledby={`${tabsId}-tab-payments`} hidden={activeTab !== "payments"} tabIndex={0}>
        <AccountPayments user={user} data={paymentsData} onCheckout={onCheckout} />
      </div>
      <div className="account-tab-panel" role="tabpanel" id={`${tabsId}-panel-settings`}
        aria-labelledby={`${tabsId}-tab-settings`} hidden={activeTab !== "settings"} tabIndex={0}>
        <AccountSettings user={user} data={settingsData} onLogout={onLogout} />
      </div>
      <div className="account-tab-panel" role="tabpanel" id={`${tabsId}-panel-achievements`}
        aria-labelledby={`${tabsId}-tab-achievements`} hidden={activeTab !== "achievements"} tabIndex={0}>
        <AccountAchievements data={statisticsData} />
      </div>
      <div className="account-tab-panel" role="tabpanel" id={`${tabsId}-panel-history`}
        aria-labelledby={`${tabsId}-tab-history`} hidden={activeTab !== "history"} tabIndex={0}>
        <AccountActivityHistory weeklyActivity={statisticsData.weeklyActivity} currentStreak={statisticsData.currentStreak} />
      </div>
    </section>
  );
}

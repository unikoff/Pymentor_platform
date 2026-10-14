import { AccountPanel } from "./AccountPanel";
import { useAccountSchedule } from "./useAccountSchedule";
import type { CalendarMonth, UserProfile } from "../../shared/api/contracts";

export function AccountWorkspace({ user, progress, calendarMonth, onMonthChange, onLogout }: {
  user: UserProfile; progress: number; calendarMonth: CalendarMonth;
  onMonthChange: (month: CalendarMonth) => void; onLogout: () => void;
}) {
  const schedule = useAccountSchedule(user.id, calendarMonth);
  return <AccountPanel user={user} progress={progress} calendarMonth={calendarMonth} onMonthChange={onMonthChange}
    activityDays={schedule.activityDays} bookingSlots={schedule.bookingSlots} bookingQuota={schedule.bookingQuota}
    onBookSlot={schedule.bookSlot} onCancelSlot={schedule.cancelSlotBooking} onLogout={onLogout} />;
}

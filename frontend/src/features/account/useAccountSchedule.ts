import { useCallback, useEffect, useState } from "react";
import { cancelStudentBooking, bookStudentSlot, getActivityCalendar, getStudentSlots } from "./api";
import type { CalendarMonth, QuotaStatus, StudentSlot } from "../../shared/api/contracts/account";

export function useAccountSchedule(userId: number | null, calendarMonth: CalendarMonth) {
  const [activityDays, setActivityDays] = useState<Set<string>>(() => new Set());
  const [bookingSlots, setBookingSlots] = useState<StudentSlot[]>([]);
  const [bookingQuota, setBookingQuota] = useState<QuotaStatus | null>(null);

  useEffect(() => {
    if (userId === null) {
      setActivityDays(new Set());
      return;
    }

    let cancelled = false;
    getActivityCalendar(calendarMonth)
      .then((data) => { if (!cancelled) setActivityDays(new Set(data.days)); })
      .catch(() => { if (!cancelled) setActivityDays(new Set()); });
    return () => { cancelled = true; };
  }, [userId, calendarMonth.year, calendarMonth.month]);

  const loadBookingSlots = useCallback(async () => {
    if (userId === null) {
      setBookingSlots([]);
      setBookingQuota(null);
      return;
    }

    try {
      const data = await getStudentSlots(calendarMonth);
      setBookingSlots(data.slots ?? []);
      setBookingQuota(data.quota ?? null);
    } catch {
      setBookingSlots([]);
      setBookingQuota(null);
    }
  }, [userId, calendarMonth.year, calendarMonth.month]);

  useEffect(() => {
    void loadBookingSlots();
  }, [loadBookingSlots]);

  const bookSlot = useCallback(async (slotId: number) => {
    await bookStudentSlot(slotId);
    await loadBookingSlots();
  }, [loadBookingSlots]);

  const cancelSlotBooking = useCallback(async (slotId: number) => {
    await cancelStudentBooking(slotId);
    await loadBookingSlots();
  }, [loadBookingSlots]);

  return { activityDays, bookingSlots, bookingQuota, bookSlot, cancelSlotBooking };
}

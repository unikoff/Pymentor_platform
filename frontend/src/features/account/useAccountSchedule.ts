import { useCallback, useEffect, useState } from "react";
import { cancelStudentBooking, bookStudentSlot, getActivityCalendar, getStudentSlots, recordActivityVisit } from "./api";
import { getLocalDateKey } from "../../shared/lib/dates";
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

    recordActivityVisit(getLocalDateKey())
      .then((data) => {
        setActivityDays((currentDays) => new Set(currentDays).add(data.activity_date));
      })
      .catch(() => undefined);
  }, [userId]);

  useEffect(() => {
    if (userId === null) {
      setActivityDays(new Set());
      return;
    }

    getActivityCalendar(calendarMonth)
      .then((data) => setActivityDays(new Set(data.days)))
      .catch(() => setActivityDays(new Set()));
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

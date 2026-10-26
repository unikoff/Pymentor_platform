import { useCallback, useEffect, useState } from "react";
import { cancelStudentBooking, bookStudentSlot, getActivityCalendar, getActivitySummary, getStudentSlots } from "./api";
import type { ActivitySummaryResponse, CalendarMonth, QuotaStatus, StudentSlot } from "../../shared/api/contracts/account";

export function useAccountSchedule(userId: number | null, calendarMonth: CalendarMonth) {
  const [activityDays, setActivityDays] = useState<Set<string>>(() => new Set());
  const [activityTimes, setActivityTimes] = useState<Record<string, string | null>>({});
  const [activitySummary, setActivitySummary] = useState<ActivitySummaryResponse | null>(null);
  const [bookingSlots, setBookingSlots] = useState<StudentSlot[]>([]);
  const [bookingQuota, setBookingQuota] = useState<QuotaStatus | null>(null);

  useEffect(() => {
    if (userId === null) {
      setActivityDays(new Set());
      setActivityTimes({});
      return;
    }

    let cancelled = false;
    const loadActivityCalendar = () => {
      getActivityCalendar(calendarMonth)
        .then((data) => {
          if (cancelled) return;
          setActivityDays(new Set(data.days));
          setActivityTimes(Object.fromEntries(data.visits.map((visit) => [visit.activity_date, visit.visited_at])));
        })
        .catch(() => {
          if (cancelled) return;
          setActivityDays(new Set());
          setActivityTimes({});
        });
    };
    loadActivityCalendar();
    window.addEventListener("pymentor:activity-updated", loadActivityCalendar);
    return () => {
      cancelled = true;
      window.removeEventListener("pymentor:activity-updated", loadActivityCalendar);
    };
  }, [userId, calendarMonth.year, calendarMonth.month]);

  useEffect(() => {
    if (userId === null) {
      setActivitySummary(null);
      return;
    }

    let cancelled = false;
    const loadSummary = () => {
      getActivitySummary()
        .then((data) => { if (!cancelled) setActivitySummary(data); })
        .catch(() => { if (!cancelled) setActivitySummary(null); });
    };
    loadSummary();
    window.addEventListener("pymentor:activity-updated", loadSummary);
    return () => {
      cancelled = true;
      window.removeEventListener("pymentor:activity-updated", loadSummary);
    };
  }, [userId]);

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

  return { activityDays, activityTimes, activitySummary, bookingSlots, bookingQuota, bookSlot, cancelSlotBooking };
}

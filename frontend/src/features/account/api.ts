import { apiRequest } from "../../shared/api/client";
import type { ActivityCalendarResponse, ActivityVisitResponse, CalendarMonth, QuotaStatus, StudentSlot } from "../../shared/api/contracts/account";

export function recordActivityVisit(date: string) {
  return apiRequest<ActivityVisitResponse>("/user/activity/visit", { activity_date: date });
}

export function getActivityCalendar(month: CalendarMonth) {
  return apiRequest<ActivityCalendarResponse>(`/user/activity?year=${month.year}&month=${month.month}`);
}

export function getStudentSlots(month: CalendarMonth) {
  return apiRequest<{ slots: StudentSlot[]; quota: QuotaStatus }>(`/user/slots?year=${month.year}&month=${month.month}`);
}

export function bookStudentSlot(slotId: number) {
  return apiRequest(`/user/slots/${slotId}/book`, {});
}

export function cancelStudentBooking(slotId: number) {
  return apiRequest(`/user/slots/${slotId}/cancel`, {});
}

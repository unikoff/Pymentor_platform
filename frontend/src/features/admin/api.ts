import { apiRequest } from "../../shared/api/client";
import type { AdminAccount, AdminSlot, StudentProfile } from "../../shared/api/contracts";
import type { CalendarMonth } from "../../shared/api/contracts/account";

export function searchAdminAccounts(search: string) {
  return apiRequest<{ users: AdminAccount[] }>(`/admin/users?search=${encodeURIComponent(search.trim())}`);
}

export function getStudentProfile(studentId: number, month: CalendarMonth) {
  return apiRequest<{ profile: StudentProfile }>(`/admin/users/${studentId}/profile?year=${month.year}&month=${month.month}`);
}

export function changeStudentSubscription(studentId: number, days: number | null) {
  return apiRequest(`/admin/users/${studentId}/subscription`, { days }, "PATCH");
}

export function addStudentQuota(studentId: number, month: CalendarMonth, amount: number) {
  return apiRequest(`/admin/users/${studentId}/quota`, { year: month.year, month: month.month, add: amount });
}

export function deleteStudent(studentId: number) {
  return apiRequest(`/admin/users/${studentId}`, undefined, "DELETE");
}

export function getAdminSlots(month: CalendarMonth) {
  return apiRequest<{ slots: AdminSlot[] }>(`/admin/slots?year=${month.year}&month=${month.month}`);
}

export function createAdminSlot(payload: { slot_date: string; start_time: string; duration_minutes: number }) {
  return apiRequest("/admin/slots", payload);
}

export function deleteAdminSlot(slotId: number) {
  return apiRequest(`/admin/slots/${slotId}`, undefined, "DELETE");
}

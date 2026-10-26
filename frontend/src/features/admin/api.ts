import { apiRequest } from "../../shared/api/client";
import type { AdminAccountsResponse, AdminOverview, AdminSlot, StudentProfile } from "../../shared/api/contracts";
import type { CalendarMonth } from "../../shared/api/contracts/account";
import type { AdminAccountFilters } from "../../shared/api/contracts/admin";

export function searchAdminAccounts(search: string, filters: AdminAccountFilters, month: CalendarMonth) {
  const query = new URLSearchParams({ search: search.trim(), ...filters, year: String(month.year), month: String(month.month) });
  return apiRequest<AdminAccountsResponse>(`/admin/users?${query}`);
}

export function getAdminOverview() {
  return apiRequest<AdminOverview>("/admin/overview");
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

export function getAdminSlots(month: CalendarMonth, includePast = false) {
  return apiRequest<{ slots: AdminSlot[] }>(`/admin/slots?year=${month.year}&month=${month.month}&include_past=${includePast}`);
}

export function createAdminSlot(payload: { slot_date: string; start_time: string; duration_minutes: number }) {
  return apiRequest("/admin/slots", payload);
}

export function deleteAdminSlot(slotId: number) {
  return apiRequest(`/admin/slots/${slotId}`, undefined, "DELETE");
}

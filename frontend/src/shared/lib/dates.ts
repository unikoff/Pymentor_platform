import type { CalendarMonth } from "../api/contracts";

export function getInitialCalendarMonth(): CalendarMonth {
  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() + 1 };
}

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMonthTitle(calendarMonth: CalendarMonth): string {
  return new Date(calendarMonth.year, calendarMonth.month - 1, 1).toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });
}

export function shiftCalendarMonth(calendarMonth: CalendarMonth, offset: number): CalendarMonth {
  const nextDate = new Date(calendarMonth.year, calendarMonth.month - 1 + offset, 1);
  return { year: nextDate.getFullYear(), month: nextDate.getMonth() + 1 };
}

export function buildMonthCells(calendarMonth: CalendarMonth): Array<{ key: string; day: number; dateKey: string } | null> {
  const firstDay = new Date(calendarMonth.year, calendarMonth.month - 1, 1);
  const daysInMonth = new Date(calendarMonth.year, calendarMonth.month, 0).getDate();
  const leadingEmptyCells = (firstDay.getDay() + 6) % 7;
  const cells: Array<{ key: string; day: number; dateKey: string } | null> = [];

  for (let index = 0; index < leadingEmptyCells; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${calendarMonth.year}-${String(calendarMonth.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ key: dateKey, day, dateKey });
  }

  return cells;
}

export function formatSubscriptionDate(value?: string | null): string {
  if (!value) {
    return "не активна";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatSlotDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export function formatSlotTimeRange(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = (hours * 60 + minutes + durationMinutes) % (24 * 60);
  const endHours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const endMinutes = String(totalMinutes % 60).padStart(2, "0");
  return `${startTime}–${endHours}:${endMinutes}`;
}

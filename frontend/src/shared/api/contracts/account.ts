export type StudentSlot = {
  id: number;
  date: string;
  start_time: string;
  duration_minutes: number;
  status: "free" | "mine";
  can_cancel: boolean;
};

export type QuotaStatus = {
  granted: number;
  used: number;
  remaining: number;
};

export type CalendarMonth = {
  year: number;
  month: number;
};

export type ActivityCalendarResponse = {
  days: string[];
};

export type ActivityVisitResponse = {
  activity_date: string;
};

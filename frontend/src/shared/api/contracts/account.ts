export type StudentSlot = {
  id: number;
  date: string;
  start_time: string;
  duration_minutes: number;
  status: "free" | "mine";
  can_cancel: boolean;
  is_completed?: boolean;
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
  visits: { activity_date: string; visited_at: string | null }[];
};

export type ActivityVisitResponse = {
  activity_date: string;
  visited_at: string | null;
};

export type ActivitySummaryResponse = {
  current_streak: number;
  visited_today: boolean;
  total_active_days: number;
  weekly_activity?: { activity_date: string; active: boolean }[];
  weekly_lessons_completed?: { activity_date: string; lessons_completed: number }[];
};

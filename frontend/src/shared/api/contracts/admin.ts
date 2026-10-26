import type { UserProfile } from "./user";
import type { QuotaStatus } from "./account";

export type AdminAccount = UserProfile & {
  completed_lessons: number;
  completed_lessons_7d: number;
  quota?: QuotaStatus;
};

export type AdminAccountsResponse = {
  completed_since: string;
  users: AdminAccount[];
};

export type AdminOverview = {
  active_students_7d: number;
  lessons_completed_7d: number;
  expiring_subscriptions_count: number;
  expiring_subscriptions: {
    id: number;
    username: string;
    subscription_plan: string;
    subscription_until: string;
  }[];
  slots_30d: {
    booked: number;
    total: number;
    free: number;
    occupancy_percent: number | null;
  };
  daily_active_students: {
    date: string;
    active_students: number;
  }[];
};

export type AdminAccountFilters = {
  subscription: "all" | "active" | "inactive";
  lessons: "all" | "none" | "low" | "many";
};

export type AdminSlot = {
  id: number;
  date: string;
  start_time: string;
  duration_minutes: number;
  is_past: boolean;
  student: { id: number; username: string; email: string } | null;
};

export type AdminProgressTask = {
  id: string;
  title: string;
  level: "easy" | "medium" | "hard" | null;
  completed: boolean;
};

export type AdminProgressLesson = {
  id: string;
  title: string;
  completed: boolean;
  countable: boolean;
  tasks: AdminProgressTask[];
};

export type AdminProgressModule = {
  id: string;
  title: string;
  completed: number;
  total: number;
  lessons_total: number;
  lessons: AdminProgressLesson[];
};

export type AdminProgressTrack = {
  id: string;
  title: string;
  completed: number;
  total: number;
  lessons_total: number;
  modules: AdminProgressModule[];
};

export const ADMIN_LEVEL_LABELS = {
  easy: "Старт",
  medium: "Практика",
  hard: "Вызов",
} as const;

export const ADMIN_LEVELS = ["easy", "medium", "hard"] as const;

export type StudentProfile = AdminAccount & {
  quota: QuotaStatus;
  activity_days_count: number;
  activity_days: string[];
  learning_progress: AdminProgressTrack[];
  bookings: { id: number; date: string; start_time: string; duration_minutes: number }[];
};

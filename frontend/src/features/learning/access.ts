import type { Lesson, LessonTask } from "./types";

export function getLessonTasks(lesson: Lesson): LessonTask[] {
  return lesson.tasks ?? [];
}

export function isLessonUnavailable(lesson: Lesson): boolean {
  return lesson.is_available === false;
}

export function getLessonAccessLabel(
  lesson: Lesson,
  isAuthenticated = false,
  hasActiveSubscription = false,
): string {
  if (lesson.access === "free") return "";
  if (lesson.access === "registered") return isAuthenticated ? "" : "account";
  if (lesson.access === "subscription") return hasActiveSubscription ? "" : "pro";
  return "";
}

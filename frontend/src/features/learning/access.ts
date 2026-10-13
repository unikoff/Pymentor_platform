import type { Lesson, LessonTask } from "./types";

export function getLessonTasks(lesson: Lesson): LessonTask[] {
  return lesson.tasks ?? [];
}

export function isLessonUnavailable(lesson: Lesson): boolean {
  return lesson.is_available === false;
}

export function getLessonAccessLabel(lesson: Lesson): string {
  if (lesson.access === "free") {
    return "free";
  }
  if (lesson.access === "registered") {
    return "account";
  }
  if (lesson.access === "subscription") {
    return "pro";
  }
  return lesson.duration;
}

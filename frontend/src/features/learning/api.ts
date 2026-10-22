import { apiRequest } from "../../shared/api/client";
import type { Lesson, LessonTheoryResponse, TaskRunResponse, TaskSubmitResponse, Track } from "./types";

export function getTracks() {
  return apiRequest<{ tracks: Track[]; default_track: string | null }>("/learning/tracks");
}

export async function getCatalog() {
  const data = await apiRequest<{ tracks: Track[]; courses: Record<string, Lesson[]>; default_track: string | null }>("/learning/catalog");
  if (!data || !Array.isArray(data.tracks) || !data.courses || typeof data.courses !== "object" ||
    !data.tracks.every((track) => track && typeof track.id === "string" && Array.isArray(data.courses[track.id]))) {
    throw new Error("Не удалось получить каталог занятий. Перезапустите бэкенд после обновления платформы и повторите загрузку.");
  }
  return data;
}

export async function getLesson(lessonId: string) {
  const data = await apiRequest<{ lesson: Lesson }>(`/learning/lessons/${encodeURIComponent(lessonId)}`);
  if (!data?.lesson || typeof data.lesson.id !== "string") {
    throw new Error("Не удалось получить материал занятия. Обновите сервер платформы и повторите загрузку.");
  }
  return data;
}

export function getLessons(trackId: string) {
  return apiRequest<{ track: string; lessons: Lesson[] }>(`/learning/lessons?track=${encodeURIComponent(trackId)}`);
}

export function getLessonTheory(lessonId: string) {
  return apiRequest<LessonTheoryResponse>(`/learning/lessons/${lessonId}/theory`);
}

export function completeLesson(lessonId: string) {
  return apiRequest(`/learning/lessons/${lessonId}/complete`, {});
}

export function runTask(taskId: string, code: string, revision: string) {
  return apiRequest<TaskRunResponse>(`/learning/tasks/${taskId}/run`, { code, task_revision: revision });
}

export function runInterpreter(code: string) {
  return apiRequest<TaskRunResponse>("/learning/interpreter/run", { code });
}

export function submitTask(taskId: string, code: string, revision: string) {
  return apiRequest<TaskSubmitResponse>(`/learning/tasks/${taskId}/submit`, { code, task_revision: revision });
}

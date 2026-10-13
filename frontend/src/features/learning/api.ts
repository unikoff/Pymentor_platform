import { apiRequest } from "../../shared/api/client";
import type { Lesson, LessonTheoryResponse, TaskRunResponse, TaskSubmitResponse, Track } from "./types";

export function getTracks() {
  return apiRequest<{ tracks: Track[]; default_track: string | null }>("/learning/tracks");
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

export function submitTask(taskId: string, code: string, revision: string) {
  return apiRequest<TaskSubmitResponse>(`/learning/tasks/${taskId}/submit`, { code, task_revision: revision });
}

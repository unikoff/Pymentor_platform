type TaskCompletionMetadata = {
  id: string;
  required?: boolean;
};

// Stable IDs of optional practice tasks; other tasks remain required by default.
const OPTIONAL_TASK_IDS = new Set(["lesson-b504d05e6763add4db882bfe-task-05"]);

export function isRequiredPracticeTask(task: TaskCompletionMetadata): boolean {
  return task.required !== false && !OPTIONAL_TASK_IDS.has(task.id);
}

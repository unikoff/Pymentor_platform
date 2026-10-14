import "./practice.css";
import { useEffect } from "react";
import { getLessonTasks } from "../access";
import { SelfCheckPanel } from "./SelfCheckPanel";
import { TaskRunner } from "./TaskRunner";
import { usePracticeState } from "./session";
import type { Lesson } from "../types";

export function LearningPracticeView({
  lesson,
  isAuthenticated,
  onRequireAuth,
  onLessonCompleted,
  progressOwnerKey,
}: {
  lesson: Lesson;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onLessonCompleted: () => void;
  progressOwnerKey: string;
}) {
  const tasks = getLessonTasks(lesson);
  const manualPractice = lesson.manual_practice ?? [];
  const hasMixedPractice = tasks.length > 0 && manualPractice.length > 0;
  const sessionKey = `${progressOwnerKey}:${lesson.id}:${tasks.map((task) => `${task.id}:${task.revision}`).join("|")}`;
  const [activeTaskIndex, setActiveTaskIndex] = usePracticeState(`${sessionKey}:active-task`, () => 0);
  const [solvedTaskIds, setSolvedTaskIds] = usePracticeState<Set<string>>(`${sessionKey}:solved`,
    () => new Set(tasks.filter((task) => task.completed).map((task) => task.id)),
  );

  useEffect(() => {
    setSolvedTaskIds(new Set(getLessonTasks(lesson).filter((task) => task.completed).map((task) => task.id)));
  }, [lesson.id]);

  const completedTaskCount = tasks.filter((task) => task.completed || solvedTaskIds.has(task.id)).length;

  function handleMixedTaskSolved(taskId: string) {
    setSolvedTaskIds((current) => new Set(current).add(taskId));
    onLessonCompleted();
  }

  return (
    <main className="practice-stack practice-dashboard" aria-label={`Практика: ${lesson.title}`}>
      {tasks.length > 0 && (
        <div className="task-list">
          {tasks.map((task, taskIndex) => (
            <TaskRunner
              task={task}
              lessonId={lesson.id}
              key={`${task.id}:${task.revision}`}
              taskNumber={taskIndex + 1}
              taskTotal={tasks.length}
              isActive={taskIndex === Math.min(activeTaskIndex, tasks.length - 1)}
              onNavigateTask={setActiveTaskIndex}
              progressOwnerKey={progressOwnerKey}
              onSolved={hasMixedPractice ? () => handleMixedTaskSolved(task.id) : onLessonCompleted}
            />
          ))}
        </div>
      )}
      {lesson.self_check ? (
        <SelfCheckPanel
          lesson={lesson}
          isAuthenticated={isAuthenticated}
          onRequireAuth={onRequireAuth}
          onLessonCompleted={onLessonCompleted}
          progressOwnerKey={progressOwnerKey}
          requiredTasksComplete={!hasMixedPractice || completedTaskCount === tasks.length}
          requiredTaskCount={hasMixedPractice ? tasks.length : 0}
          completedTaskCount={hasMixedPractice ? completedTaskCount : 0}
        />
      ) : tasks.length === 0 ? (
        <div className="empty-task-card">
          <h2>Задания скоро появятся</h2>
          <p>Для этого урока пока нет практических задач. Можно выбрать другой урок или вернуться к теории.</p>
        </div>
      ) : null}
    </main>
  );
}

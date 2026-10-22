import "./practice.css";
import { useEffect, useRef } from "react";
import { getLessonTasks } from "../access";
import { SelfCheckPanel } from "./SelfCheckPanel";
import { TaskRunner } from "./TaskRunner";
import { usePracticeState } from "./session";
import { useContentSwitch, focusTaskNavigation } from "./useContentSwitch";
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
  const taskListRef = useRef<HTMLDivElement>(null);
  const switchContent = useContentSwitch();
  const pendingFocus = useRef<"next" | "previous" | null>(null);
  const tasks = getLessonTasks(lesson);
  const manualPractice = lesson.manual_practice ?? [];
  const isLearningRoadmap = lesson.title === "Карта обучения";
  const hasMixedPractice = tasks.length > 0 && manualPractice.length > 0;
  const sessionKey = `${progressOwnerKey}:${lesson.id}:${tasks.map((task) => `${task.id}:${task.revision}`).join("|")}`;
  const [activeTaskIndex, setActiveTaskIndex] = usePracticeState(`${sessionKey}:active-task`, () => 0);
  const [solvedTaskIds, setSolvedTaskIds] = usePracticeState<Set<string>>(`${sessionKey}:solved`,
    () => new Set(tasks.filter((task) => task.completed).map((task) => task.id)),
  );

  useEffect(() => {
    setSolvedTaskIds(new Set(getLessonTasks(lesson).filter((task) => task.completed).map((task) => task.id)));
  }, [lesson.id]);

  useEffect(() => {
    const direction = pendingFocus.current;
    pendingFocus.current = null;
    const card = taskListRef.current?.querySelector<HTMLElement>(".task-card:not([hidden])");
    if (direction) focusTaskNavigation(card, direction);
  }, [activeTaskIndex]);

  const completedTaskCount = tasks.filter((task) => task.completed || solvedTaskIds.has(task.id)).length;

  function navigateTask(index: number) {
    const nextIndex = Math.max(0, Math.min(index, tasks.length - 1));
    if (nextIndex === Math.min(activeTaskIndex, tasks.length - 1)) return;
    switchContent("task", taskListRef.current, () => {
      pendingFocus.current = nextIndex > activeTaskIndex ? "next" : "previous";
      setActiveTaskIndex(nextIndex);
    });
  }

  function handleMixedTaskSolved(taskId: string) {
    setSolvedTaskIds((current) => new Set(current).add(taskId));
    onLessonCompleted();
  }

  return (
    <main className="practice-stack practice-dashboard" aria-label={`Практика: ${lesson.title}`}>
      {tasks.length > 0 && (
        <div className="task-list" ref={taskListRef}>
          {tasks.map((task, taskIndex) => (
            <TaskRunner
              task={task}
              lessonId={lesson.id}
              key={`${task.id}:${task.revision}`}
              taskNumber={taskIndex + 1}
              taskTotal={tasks.length}
              isActive={taskIndex === Math.min(activeTaskIndex, tasks.length - 1)}
              onNavigateTask={navigateTask}
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
          <h2>{isLearningRoadmap ? "Карта на руках :)" : "Задания скоро появятся"}</h2>
          <p>
            {isLearningRoadmap
              ? "Здесь собран маршрут по главе, а задания ждут внутри занятий. Выберите первое слева и отправляйтесь в путь!"
              : "Для этого урока пока нет практических задач. Можно выбрать другой урок или вернуться к теории."}
          </p>
        </div>
      ) : null}
    </main>
  );
}

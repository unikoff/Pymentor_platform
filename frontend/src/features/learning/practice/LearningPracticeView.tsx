import "./practice.css";
import { useEffect, useRef } from "react";
import { getLessonTasks } from "../access";
import { SelfCheckPanel } from "./SelfCheckPanel";
import { TaskRunner } from "./TaskRunner";
import { usePracticeState } from "./session";
import { useContentSwitch, focusTaskNavigation } from "./useContentSwitch";
import { isRequiredPracticeTask } from "../required-tasks";
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
  const requiredTasks = tasks.filter(isRequiredPracticeTask);
  const manualPractice = lesson.manual_practice ?? [];
  const isLearningRoadmap = lesson.title === "Карта обучения";
  const hasMixedPractice = tasks.length > 0 && manualPractice.length > 0;
  const sourceFile = lesson.source_file;
  const isChapterOneLesson = typeof sourceFile === "string" && sourceFile.startsWith("chapter_01/");
  const isSafeSubmitFeedback =
    typeof sourceFile !== "string" || !sourceFile.trim() || sourceFile.startsWith("chapter_01/");
  const sessionKey = `${progressOwnerKey}:${lesson.id}:${tasks.map((task) => `${task.id}:${task.revision}`).join("|")}`;
  const [activeTaskIndex, setActiveTaskIndex] = usePracticeState(`${sessionKey}:active-task`, () => 0);
  const [solvedTaskIds, setSolvedTaskIds] = usePracticeState<Set<string>>(`${sessionKey}:solved`,
    () => new Set(tasks.filter((task) => task.completed).map((task) => task.id)),
  );
  const solvedTaskIdsRef = useRef(solvedTaskIds);
  const chapterOneCompletionNotified = useRef<string | null>(null);

  useEffect(() => {
    const next = new Set(getLessonTasks(lesson).filter((task) => task.completed).map((task) => task.id));
    solvedTaskIdsRef.current = next;
    chapterOneCompletionNotified.current = null;
    setSolvedTaskIds(next);
  }, [lesson.id]);

  useEffect(() => {
    solvedTaskIdsRef.current = solvedTaskIds;
  }, [solvedTaskIds]);

  useEffect(() => {
    const direction = pendingFocus.current;
    pendingFocus.current = null;
    const card = taskListRef.current?.querySelector<HTMLElement>(".task-card:not([hidden])");
    if (direction) focusTaskNavigation(card, direction);
  }, [activeTaskIndex]);

  const completedTaskCount = requiredTasks.filter((task) => task.completed || solvedTaskIds.has(task.id)).length;

  function navigateTask(index: number) {
    const nextIndex = Math.max(0, Math.min(index, tasks.length - 1));
    if (nextIndex === Math.min(activeTaskIndex, tasks.length - 1)) return;
    switchContent("task", taskListRef.current, () => {
      pendingFocus.current = nextIndex > activeTaskIndex ? "next" : "previous";
      setActiveTaskIndex(nextIndex);
    });
  }

  function handleTaskSolved(taskId: string) {
    setSolvedTaskIds((current) => new Set(current).add(taskId));
    onLessonCompleted();
  }

  function handleChapterOneTaskSolved(taskId: string) {
    const current = solvedTaskIdsRef.current;
    if (current.has(taskId)) return;

    const wasComplete = requiredTasks.every((task) => task.completed || current.has(task.id));
    const next = new Set(current).add(taskId);
    solvedTaskIdsRef.current = next;
    setSolvedTaskIds(next);

    const isComplete = requiredTasks.every((task) => task.completed || next.has(task.id));
    if (!wasComplete && isComplete && chapterOneCompletionNotified.current !== sessionKey) {
      chapterOneCompletionNotified.current = sessionKey;
      onLessonCompleted();
    }
  }

  const manualPanel = (
    <SelfCheckPanel
          lesson={lesson}
          isAuthenticated={isAuthenticated}
          onRequireAuth={onRequireAuth}
          onLessonCompleted={onLessonCompleted}
          progressOwnerKey={progressOwnerKey}
          requiredTasksComplete={!hasMixedPractice || completedTaskCount === requiredTasks.length}
          requiredTaskCount={hasMixedPractice ? requiredTasks.length : 0}
          completedTaskCount={hasMixedPractice ? completedTaskCount : 0}
        />
  );

  return (
    <main className="practice-stack practice-dashboard" aria-label={`Практика: ${lesson.title}`}>
      {tasks.length > 0 && (
        <div className="task-list" ref={taskListRef}>
          {tasks.map((task, taskIndex) => (
            <TaskRunner
              task={task}
              lessonId={lesson.id}
              isSafeSubmitFeedback={isSafeSubmitFeedback}
              key={`${task.id}:${task.revision}`}
              taskNumber={taskIndex + 1}
              taskTotal={tasks.length}
              completedTasks={tasks.map((item) => Boolean(item.completed || solvedTaskIds.has(item.id)))}
              isActive={taskIndex === Math.min(activeTaskIndex, tasks.length - 1)}
              onNavigateTask={navigateTask}
              progressOwnerKey={progressOwnerKey}
              onSolved={
                isChapterOneLesson
                  ? () => handleChapterOneTaskSolved(task.id)
                  : () => handleTaskSolved(task.id)
              }
            />
          ))}
        </div>
      )}
      {lesson.self_check ? (
        manualPanel
      ) : !lesson.self_check && tasks.length === 0 ? (
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

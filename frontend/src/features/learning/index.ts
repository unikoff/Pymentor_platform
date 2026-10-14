export { getLessonAccessLabel, isLessonUnavailable } from "./access";
export { PYTHON_TRACK_NAME } from "./course";
export { useLearningCourse } from "./useLearningCourse";
export { PracticeSessionProvider } from "./practice/session";
export { LessonNavigationProvider } from "./navigation/LessonNavigation";
export { LockedLessonView } from "./theory/LockedLessonView";
import { lazyNamed } from "../../shared/ui/async-boundary/lazyNamed";

export const LearningPracticeView = lazyNamed(() => import("./practice/LearningPracticeView"), "LearningPracticeView");
export const LearningTheoryView = lazyNamed(() => import("./theory/MarkdownView"), "LearningTheoryView");
export const OnlineInterpreter = lazyNamed(() => import("./interpreter/OnlineInterpreter"), "OnlineInterpreter");
export type { Lesson, Track, WorkspaceView } from "./types";

export type Track = {
  id: string;
  title: string;
  tagline: string;
  lessons_total: number;
  lessons_countable: number;
  lessons_completed: number;
};

export type LessonStatus = "done" | "current" | "locked";

export type LessonAccess = "free" | "registered" | "subscription";

export type WorkspaceView = "theory" | "practice";

export type LessonVideo = {
  title: string;
  youtube_id: string;
  embed_url: string;
};

export type TaskContract = {
  given: string;
  todo: string;
  check: string;
  given_items?: string[];
  todo_items?: string[];
  check_items?: string[];
};

export type TaskRequirements = {
  items?: string[];
};

export type LessonTask = {
  id: string;
  revision: string;
  title: string;
  level: "easy" | "medium" | "hard";
  mode?: "solve" | "script";
  prompt: string;
  contract?: TaskContract | null;
  requirements?: TaskRequirements;
  hints?: string[];
  starter_code: string;
  completed?: boolean;
};

export type ManualPracticeTaskAnswer = {
  explanation: string;
  steps: string[];
  code?: string;
  checks?: string[];
};

export type ManualPracticeTask = {
  title: string;
  task: string;
  requirements: string[];
  hint: string;
  answer: ManualPracticeTaskAnswer;
  result?: string;
};

export type LessonManualPractice = {
  title: string;
  task: string;
  steps?: string[];
  tasks?: ManualPracticeTask[];
  result: string;
};

export type Lesson = {
  id: string;
  module: string;
  title: string;
  duration: string;
  status: LessonStatus;
  access?: LessonAccess;
  is_available?: boolean;
  locked_reason?: string | null;
  theory?: string[];
  video?: LessonVideo | null;
  tasks?: LessonTask[];
  source_file?: string;
  self_check?: boolean;
  manual_practice?: LessonManualPractice[];
  completed?: boolean;
};

export type TaskTestResult = {
  name: string;
  passed: boolean;
  expected?: unknown;
  actual?: unknown;
  error?: string;
};

export type TaskSubmitResponse = {
  ok: boolean;
  score: number;
  tests: TaskTestResult[];
  stdout?: string;
  stderr?: string;
  error?: string;
  traceback?: string;
};

export type TaskRunResponse = {
  ok: boolean;
  stdout?: string;
  stderr?: string;
  error?: string;
  traceback?: string;
};

export type LessonTheoryResponse = {
  lesson_id: string;
  title: string;
  theory_markdown: string;
};

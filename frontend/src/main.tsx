import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  BookOpen,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  FileText,
  Lock,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  Terminal,
  Trash2,
  User,
  X,
} from "lucide-react";
import "./styles.css";
import { CodeEditor } from "./CodeEditor";
import { richLessonPages } from "./lessonPages";

declare global {
  interface Window {
    __pymentorRoot?: Root;
  }
}

type UserProfile = {
  id: number;
  username: string;
  email: string;
  subscription_until?: string | null;
  has_active_subscription?: boolean;
  is_admin?: boolean;
};

type AdminAccount = UserProfile & {
  completed_lessons: number;
};

type Track = {
  id: string;
  title: string;
  tagline: string;
  lessons_total: number;
  lessons_countable: number;
  lessons_completed: number;
};

type AdminSlot = {
  id: number;
  date: string;
  start_time: string;
  duration_minutes: number;
  is_past: boolean;
  student: { id: number; username: string; email: string } | null;
};

type StudentSlot = {
  id: number;
  date: string;
  start_time: string;
  duration_minutes: number;
  status: "free" | "mine";
  can_cancel: boolean;
};

type QuotaStatus = {
  granted: number;
  used: number;
  remaining: number;
};

type StudentProfile = AdminAccount & {
  quota: QuotaStatus;
  activity_days_count: number;
  bookings: { id: number; date: string; start_time: string; duration_minutes: number }[];
};

type AuthMode = "login" | "register";
type LessonStatus = "done" | "current" | "locked";
type LessonAccess = "free" | "registered" | "subscription";
type ThemeMode = "dark" | "light";
type WorkspaceView = "theory" | "practice";

type LessonVideo = {
  title: string;
  youtube_id: string;
  embed_url: string;
};

type TaskContract = {
  given: string;
  todo: string;
  check: string;
};

type TaskRequirements = {
  items?: string[];
};

type LessonTask = {
  id: string;
  title: string;
  level: "easy" | "medium" | "hard";
  mode?: "solve" | "script";
  prompt: string;
  contract?: TaskContract | null;
  requirements?: TaskRequirements;
  starter_code: string;
};

type LessonManualPractice = {
  title: string;
  task: string;
  steps: string[];
  result: string;
};

type Lesson = {
  id: string;
  module: string;
  title: string;
  duration: string;
  status: LessonStatus;
  access?: LessonAccess;
  is_available?: boolean;
  locked_reason?: string | null;
  theory?: string[];
  video?: LessonVideo;
  tasks?: LessonTask[];
  source_file?: string;
  self_check?: boolean;
  manual_practice?: LessonManualPractice[];
  completed?: boolean;
};

type TaskTestResult = {
  name: string;
  passed: boolean;
  expected?: unknown;
  actual?: unknown;
  error?: string;
};

type TaskSubmitResponse = {
  ok: boolean;
  score: number;
  tests: TaskTestResult[];
  stdout?: string;
  stderr?: string;
  error?: string;
  traceback?: string;
};

type TaskRunResponse = {
  ok: boolean;
  stdout?: string;
  stderr?: string;
  error?: string;
  traceback?: string;
};

type LessonTheoryResponse = {
  lesson_id: string;
  title: string;
  theory_markdown: string;
};

type CalendarMonth = {
  year: number;
  month: number;
};

type ActivityCalendarResponse = {
  days: string[];
};

type ActivityVisitResponse = {
  activity_date: string;
};

const PYTHON_TRACK_NAME = "Основы Python и мышление программиста";
const PYTHON_MODULE_ORDER = [
  "00 Обзор",
  "Блок 1. Старт и работа с данными",
  "Блок 2. Текст, логика и повторение",
  "Блок 3. Данные проекта и функции",
  "Блок 4. Сборка и защита проекта",
];

const PYTHON_NAVIGATION: Array<{ id: string; module: string; title: string }> = [
  { id: `${PYTHON_TRACK_NAME}-lesson-01`, module: "00 Обзор", title: "Карта обучения" },
  { id: `${PYTHON_TRACK_NAME}-lesson-02`, module: "00 Обзор", title: "Теория месяца 1: подробная база Python для новичка" },
  { id: `${PYTHON_TRACK_NAME}-lesson-03`, module: PYTHON_MODULE_ORDER[1], title: "01. Как Python выполняет программу" },
  { id: `${PYTHON_TRACK_NAME}-lesson-04`, module: PYTHON_MODULE_ORDER[1], title: "02. Терминал, файлы и запуск скрипта" },
  { id: `${PYTHON_TRACK_NAME}-lesson-05`, module: PYTHON_MODULE_ORDER[1], title: "03. Git, GitHub и история изменений" },
  { id: `${PYTHON_TRACK_NAME}-lesson-06`, module: PYTHON_MODULE_ORDER[1], title: "04. Переменные и базовые типы" },
  { id: `${PYTHON_TRACK_NAME}-lesson-07`, module: PYTHON_MODULE_ORDER[1], title: "05. Числа, операции и преобразование типов" },
  { id: `${PYTHON_TRACK_NAME}-lesson-08`, module: PYTHON_MODULE_ORDER[2], title: "06. Строки и форматирование" },
  { id: `${PYTHON_TRACK_NAME}-lesson-09`, module: PYTHON_MODULE_ORDER[2], title: "07. Boolean, сравнения и логика" },
  { id: `${PYTHON_TRACK_NAME}-lesson-10`, module: PYTHON_MODULE_ORDER[2], title: "08. Ветвления if elif else" },
  { id: `${PYTHON_TRACK_NAME}-lesson-11`, module: PYTHON_MODULE_ORDER[2], title: "09. Цикл for и последовательности" },
  { id: `${PYTHON_TRACK_NAME}-lesson-12`, module: PYTHON_MODULE_ORDER[2], title: "10. Цикл while и проверка ввода" },
  { id: `${PYTHON_TRACK_NAME}-lesson-13`, module: PYTHON_MODULE_ORDER[3], title: "11. Списки, кортежи и множества" },
  { id: `${PYTHON_TRACK_NAME}-lesson-14`, module: PYTHON_MODULE_ORDER[3], title: "12. Словари и модель задачи" },
  { id: `${PYTHON_TRACK_NAME}-lesson-15`, module: PYTHON_MODULE_ORDER[3], title: "13. Функции, параметры и return" },
  { id: `${PYTHON_TRACK_NAME}-lesson-16`, module: PYTHON_MODULE_ORDER[3], title: "14. Декомпозиция и чистые функции" },
  { id: `${PYTHON_TRACK_NAME}-lesson-17`, module: PYTHON_MODULE_ORDER[3], title: "15. Ошибки, traceback и отладка" },
  { id: `${PYTHON_TRACK_NAME}-lesson-18`, module: PYTHON_MODULE_ORDER[4], title: "16. Проектное меню и валидация" },
  { id: `${PYTHON_TRACK_NAME}-lesson-19`, module: PYTHON_MODULE_ORDER[4], title: "17. Проект: добавление и вывод задач" },
  { id: `${PYTHON_TRACK_NAME}-lesson-20`, module: PYTHON_MODULE_ORDER[4], title: "18. Проект: поиск, статус и статистика" },
  { id: `${PYTHON_TRACK_NAME}-lesson-21`, module: PYTHON_MODULE_ORDER[4], title: "19. README, .gitignore и публикация" },
  { id: `${PYTHON_TRACK_NAME}-lesson-22`, module: PYTHON_MODULE_ORDER[4], title: "20. Контрольная точка месяца" },
];

const lessons: Lesson[] = PYTHON_NAVIGATION.map((lesson, index) => ({
  ...lesson,
  duration: index < 2 ? "12 мин" : "45 мин",
  status: index === 2 ? "current" : index < 2 ? "done" : "locked",
  access: "free",
}));

function getDisplayModule(lesson: Lesson, trackId: string): string {
  if (trackId !== PYTHON_TRACK_NAME) {
    return lesson.module;
  }

  const lessonNumber = Number(lesson.title.match(/^(\d{2})\./)?.[1]);
  if (!Number.isNaN(lessonNumber)) {
    if (lessonNumber <= 5) return PYTHON_MODULE_ORDER[1];
    if (lessonNumber <= 10) return PYTHON_MODULE_ORDER[2];
    if (lessonNumber <= 15) return PYTHON_MODULE_ORDER[3];
    return PYTHON_MODULE_ORDER[4];
  }

  return PYTHON_MODULE_ORDER.includes(lesson.module) ? lesson.module : PYTHON_MODULE_ORDER[0];
}

const defaultOpenViews: WorkspaceView[] = ["theory", "practice"];
const EXPLORER_MIN_WIDTH = 220;
const EXPLORER_MAX_WIDTH = 480;
const EXPLORER_DEFAULT_WIDTH = 320;

const viewMeta = {
  theory: { label: "theory.md", Icon: FileText },
  practice: { label: "practice.py", Icon: Terminal },
} satisfies Record<WorkspaceView, { label: string; Icon: typeof FileText }>;

function isLessonUnavailable(lesson: Lesson): boolean {
  return lesson.is_available === false;
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getInitialExplorerWidth(): number {
  try {
    const storedWidth = Number(window.localStorage.getItem("pymentor-explorer-width"));
    if (Number.isFinite(storedWidth)) {
      return clampNumber(storedWidth, EXPLORER_MIN_WIDTH, EXPLORER_MAX_WIDTH);
    }
  } catch {
    // localStorage can be unavailable in restricted browser modes.
  }

  return EXPLORER_DEFAULT_WIDTH;
}

function getInitialCalendarMonth(): CalendarMonth {
  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() + 1 };
}

function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthTitle(calendarMonth: CalendarMonth): string {
  return new Date(calendarMonth.year, calendarMonth.month - 1, 1).toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });
}

function shiftCalendarMonth(calendarMonth: CalendarMonth, offset: number): CalendarMonth {
  const nextDate = new Date(calendarMonth.year, calendarMonth.month - 1 + offset, 1);
  return { year: nextDate.getFullYear(), month: nextDate.getMonth() + 1 };
}

function buildMonthCells(calendarMonth: CalendarMonth): Array<{ key: string; day: number; dateKey: string } | null> {
  const firstDay = new Date(calendarMonth.year, calendarMonth.month - 1, 1);
  const daysInMonth = new Date(calendarMonth.year, calendarMonth.month, 0).getDate();
  const leadingEmptyCells = (firstDay.getDay() + 6) % 7;
  const cells: Array<{ key: string; day: number; dateKey: string } | null> = [];

  for (let index = 0; index < leadingEmptyCells; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${calendarMonth.year}-${String(calendarMonth.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ key: dateKey, day, dateKey });
  }

  return cells;
}

function getLessonAccessLabel(lesson: Lesson): string {
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

function formatSubscriptionDate(value?: string | null): string {
  if (!value) {
    return "не активна";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getInitialTheme(): ThemeMode {
  try {
    const theme = window.localStorage.getItem("pymentor-theme") === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    return theme;
  } catch {
    return "dark";
  }
}

// Префикс, под которым смонтирована платформа: "/platform" на проде, "" в dev.
// Vite подставляет сюда значение base из vite.config.ts.
const API_PREFIX = import.meta.env.BASE_URL.replace(/\/+$/, "");

async function apiRequest<T>(url: string, body?: unknown, method?: string): Promise<T> {
  const response = await fetch(API_PREFIX + url, {
    method: method ?? (body ? "POST" : "GET"),
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || data.message || "Запрос не выполнен");
  }

  return data as T;
}

function ThemeToggle({ theme, onToggleTheme }: { theme: ThemeMode; onToggleTheme: () => void }) {
  const isDark = theme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      className="theme-switch"
      type="button"
      onClick={onToggleTheme}
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      title={isDark ? "Светлая тема" : "Тёмная тема"}
    >
      <Icon size={16} />
      <span>{isDark ? "Светлая" : "Тёмная"}</span>
    </button>
  );
}

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    apiRequest<{ user: UserProfile }>("/user/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setIsCheckingSession(false));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("pymentor-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  if (isCheckingSession) {
    return <div className="boot-screen">Pymentor</div>;
  }

  if (!user && isAuthOpen) {
    return (
      <AuthScreen
        onAuth={(nextUser) => {
          setUser(nextUser);
          setIsAuthOpen(false);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
        onBack={() => setIsAuthOpen(false)}
      />
    );
  }

  return (
    <Workspace
      user={user}
      theme={theme}
      onToggleTheme={toggleTheme}
      onLogout={() => setUser(null)}
      onRequireAuth={() => setIsAuthOpen(true)}
    />
  );
}

function AuthScreen({
  onAuth,
  theme,
  onToggleTheme,
  onBack,
}: {
  onAuth: (user: UserProfile) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onBack?: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const emailValue = email.trim();
      const loginPayload = { email: emailValue, password };

      if (mode === "register") {
        const usernameValue = username.trim();
        if (usernameValue.length < 3) {
          throw new Error("Имя должно быть не короче 3 символов");
        }

        await apiRequest<{ user: UserProfile }>("/user/register", {
          username: usernameValue,
          ...loginPayload,
        });
      }

      const data = await apiRequest<{ user: UserProfile }>("/user/login", loginPayload);
      onAuth(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось выполнить вход");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <div className="auth-header">
          <div className="auth-brand">
            <span>pymentor</span>
            <strong>Learning workspace</strong>
          </div>
          <div className="auth-actions">
            {onBack && (
              <button className="secondary-action secondary-action--compact" type="button" onClick={onBack}>
                Вернуться к урокам
              </button>
            )}
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          </div>
        </div>

        <div className="auth-tabs" aria-label="Авторизация">
          <button className={mode === "login" ? "is-active" : ""} type="button" onClick={() => setMode("login")}>
            Вход
          </button>
          <button className={mode === "register" ? "is-active" : ""} type="button" onClick={() => setMode("register")}>
            Регистрация
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Имя
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                minLength={3}
                maxLength={40}
                autoComplete="name"
                required
              />
            </label>
          )}
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required />
          </label>
          <label>
            Пароль
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              minLength={8}
              maxLength={128}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button className="primary-action" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Проверка..." : mode === "login" ? "Войти в кабинет" : "Создать кабинет"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Workspace({
  user,
  theme,
  onToggleTheme,
  onLogout,
  onRequireAuth,
}: {
  user: UserProfile | null;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout: () => void;
  onRequireAuth: () => void;
}) {
  const [courseLessons, setCourseLessons] = useState<Lesson[]>(lessons);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<string>(() => {
    try {
      return window.localStorage.getItem("pymentor-track") ?? "";
    } catch {
      return "";
    }
  });
  const [isTrackMenuOpen, setIsTrackMenuOpen] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState(`${PYTHON_TRACK_NAME}-lesson-01`);
  const [activeView, setActiveView] = useState<WorkspaceView>("theory");
  const [openViews, setOpenViews] = useState<WorkspaceView[]>(defaultOpenViews);
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isResizingExplorer, setIsResizingExplorer] = useState(false);
  const [explorerWidth, setExplorerWidth] = useState(getInitialExplorerWidth);
  const [calendarMonth, setCalendarMonth] = useState<CalendarMonth>(getInitialCalendarMonth);
  const [activityDays, setActivityDays] = useState<Set<string>>(() => new Set());
  const [bookingSlots, setBookingSlots] = useState<StudentSlot[]>([]);
  const [bookingQuota, setBookingQuota] = useState<QuotaStatus | null>(null);
  const [openModules, setOpenModules] = useState<Set<string>>(() => new Set());
  const displayLessons = useMemo(
    () => courseLessons.map((lesson) => ({ ...lesson, module: getDisplayModule(lesson, activeTrackId) })),
    [activeTrackId, courseLessons],
  );
  const lessonModules = useMemo(() => {
    const available = new Set(displayLessons.map((lesson) => lesson.module));
    return [
      ...PYTHON_MODULE_ORDER.filter((moduleName) => available.has(moduleName)),
      ...Array.from(available).filter((moduleName) => !PYTHON_MODULE_ORDER.includes(moduleName)),
    ];
  }, [displayLessons]);
  const moduleKey = lessonModules.join("|");
  const activeLesson = displayLessons.find((lesson) => lesson.id === activeLessonId) ?? displayLessons[0] ?? lessons[0];
  const workspaceStyle = { "--explorer": `${explorerWidth}px` } as React.CSSProperties;

  const progress = useMemo(() => {
    // Прогресс считаем только по «зачётным» урокам: с практикой или self_check.
    // Обзорные страницы вроде «Карты обучения» зачесть нельзя — они не в счёте.
    const countable = courseLessons.filter((lesson) => (lesson.tasks?.length ?? 0) > 0 || lesson.self_check);
    if (countable.length === 0) {
      return 0;
    }
    const done = countable.filter((lesson) => lesson.completed).length;
    return Math.round((done / countable.length) * 100);
  }, [courseLessons]);

  const loadTracks = useCallback(() => {
    apiRequest<{ tracks: Track[]; default_track: string | null }>("/learning/tracks")
      .then((data) => {
        setTracks(data.tracks);
        setActiveTrackId((current) =>
          current && data.tracks.some((track) => track.id === current) ? current : data.default_track ?? "",
        );
      })
      .catch(() => undefined);
  }, []);

  const loadLessons = useCallback(() => {
    if (!activeTrackId) {
      return;
    }
    apiRequest<{ lessons: Lesson[] }>(`/learning/lessons?track=${encodeURIComponent(activeTrackId)}`)
      .then((data) => {
        if (data.lessons.length > 0) {
          setCourseLessons(data.lessons);
        }
      })
      .catch(() => undefined);
  }, [activeTrackId]);

  const handleLessonCompleted = useCallback(() => {
    loadLessons();
    loadTracks();
  }, [loadLessons, loadTracks]);

  useEffect(() => {
    loadTracks();
  }, [loadTracks, user?.id]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons, user?.id, user?.has_active_subscription, user?.subscription_until]);

  useEffect(() => {
    if (!activeTrackId) {
      return;
    }
    try {
      window.localStorage.setItem("pymentor-track", activeTrackId);
    } catch {
      // localStorage может быть недоступен в приватных режимах браузера.
    }
  }, [activeTrackId]);

  useEffect(() => {
    try {
      window.localStorage.setItem("pymentor-explorer-width", String(explorerWidth));
    } catch {
      // localStorage can be unavailable in restricted browser modes.
    }
  }, [explorerWidth]);

  useEffect(() => {
    if (!isResizingExplorer) {
      return undefined;
    }

    function handlePointerMove(event: PointerEvent) {
      const activityWidth = document.querySelector(".activity-bar")?.getBoundingClientRect().width ?? 54;
      setExplorerWidth(clampNumber(event.clientX - activityWidth, EXPLORER_MIN_WIDTH, EXPLORER_MAX_WIDTH));
    }

    function handlePointerUp() {
      setIsResizingExplorer(false);
    }

    document.body.classList.add("is-resizing-panel");
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });

    return () => {
      document.body.classList.remove("is-resizing-panel");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isResizingExplorer]);

  useEffect(() => {
    if (!user) {
      setActivityDays(new Set());
      return;
    }

    const todayKey = getLocalDateKey();
    apiRequest<ActivityVisitResponse>("/user/activity/visit", { activity_date: todayKey })
      .then((data) => {
        setActivityDays((currentDays) => {
          const nextDays = new Set(currentDays);
          nextDays.add(data.activity_date);
          return nextDays;
        });
      })
      .catch(() => undefined);
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      setActivityDays(new Set());
      return;
    }

    apiRequest<ActivityCalendarResponse>(`/user/activity?year=${calendarMonth.year}&month=${calendarMonth.month}`)
      .then((data) => setActivityDays(new Set(data.days)))
      .catch(() => setActivityDays(new Set()));
  }, [user?.id, calendarMonth.year, calendarMonth.month]);

  const loadBookingSlots = useCallback(async () => {
    if (!user) {
      setBookingSlots([]);
      setBookingQuota(null);
      return;
    }
    try {
      const data = await apiRequest<{ slots: StudentSlot[]; quota: QuotaStatus }>(
        `/user/slots?year=${calendarMonth.year}&month=${calendarMonth.month}`,
      );
      setBookingSlots(data.slots ?? []);
      setBookingQuota(data.quota ?? null);
    } catch {
      setBookingSlots([]);
      setBookingQuota(null);
    }
  }, [user?.id, calendarMonth.year, calendarMonth.month]);

  useEffect(() => {
    loadBookingSlots();
  }, [loadBookingSlots]);

  const bookSlot = useCallback(
    async (slotId: number) => {
      await apiRequest(`/user/slots/${slotId}/book`, {});
      await loadBookingSlots();
    },
    [loadBookingSlots],
  );

  const cancelSlotBooking = useCallback(
    async (slotId: number) => {
      await apiRequest(`/user/slots/${slotId}/cancel`, {});
      await loadBookingSlots();
    },
    [loadBookingSlots],
  );

  useEffect(() => {
    setOpenModules((current) => {
      const availableModules = new Set(lessonModules);
      const retainedModules = Array.from(current).filter((moduleName) => availableModules.has(moduleName));
      return new Set(retainedModules.length > 0 ? retainedModules : lessonModules);
    });
    if (!courseLessons.some((lesson) => lesson.id === activeLessonId) && courseLessons[0]) {
      setActiveLessonId(courseLessons[0].id);
    }
  }, [activeLessonId, courseLessons, lessonModules, moduleKey]);

  function toggleModule(moduleName: string) {
    setOpenModules((current) => {
      const next = new Set(current);
      if (next.has(moduleName)) {
        next.delete(moduleName);
      } else {
        next.add(moduleName);
      }
      return next;
    });
  }

  function openView(view: WorkspaceView) {
    setOpenViews((current) => (current.includes(view) ? current : [...current, view]));
    setActiveView(view);
  }

  function closeView(view: WorkspaceView) {
    const next = openViews.filter((item) => item !== view);
    setOpenViews(next);
    if (activeView === view) {
      setActiveView(next[next.length - 1] ?? "theory");
    }
  }

  async function handleLogout() {
    await apiRequest("/user/logout", {}).catch(() => undefined);
    onLogout();
  }

  function openAccount() {
    if (!user) {
      onRequireAuth();
      return;
    }
    setIsAccountOpen(true);
  }

  return (
    <main className={`workspace ${isExplorerOpen ? "workspace--explorer-open" : "workspace--explorer-closed"}`} style={workspaceStyle}>
      <aside className="activity-bar" aria-label="Навигация">
        <button
          className={`activity-button ${isExplorerOpen ? "activity-button--active" : ""}`}
          type="button"
          title="Курс"
          aria-label="Открыть список занятий"
          onClick={() => setIsExplorerOpen(true)}
        >
          <BookOpen size={20} />
        </button>
        <button
          className={`activity-button ${activeView === "practice" ? "activity-button--active" : ""}`}
          type="button"
          title="Практика"
          aria-label="Открыть практику"
          onClick={() => openView("practice")}
        >
          <Code2 size={20} />
        </button>
        {user?.is_admin && (
          <button
            className={`activity-button activity-button--bottom ${isAdminOpen ? "activity-button--active" : ""}`}
            type="button"
            title="Админ-панель"
            aria-label="Открыть админ-панель"
            onClick={() => setIsAdminOpen(true)}
          >
            <ShieldCheck size={20} />
          </button>
        )}
        <button
          className={`activity-button ${user?.is_admin ? "" : "activity-button--bottom"}`}
          type="button"
          title="Личный кабинет"
          aria-label="Открыть личный кабинет"
          onClick={openAccount}
        >
          <User size={20} />
        </button>
      </aside>

      <aside className="explorer-panel" aria-label="Занятия">
        <div className="panel-title">
          <span>Занятия</span>
          <button className="icon-button" type="button" onClick={() => setIsExplorerOpen(false)} title="Свернуть">
            <PanelLeftClose size={18} />
          </button>
        </div>
        <div className="track-status">
          <button
            className="track-switch"
            type="button"
            onClick={() => setIsTrackMenuOpen((current) => !current)}
            aria-expanded={isTrackMenuOpen}
            aria-label="Выбрать трек"
          >
            <span>{tracks.find((track) => track.id === activeTrackId)?.title ?? "Курс"}</span>
            <ChevronDown size={14} className={isTrackMenuOpen ? "is-flipped" : ""} />
          </button>
          <strong>{progress}%</strong>
          <div className="progress-line">
            <i style={{ width: `${progress}%` }} />
          </div>
          {isTrackMenuOpen && (
            <div className="track-menu" role="listbox" aria-label="Треки">
              {tracks.map((track) => {
                const trackProgress = track.lessons_countable
                  ? Math.round((track.lessons_completed / track.lessons_countable) * 100)
                  : 0;
                return (
                  <button
                    key={track.id}
                    type="button"
                    role="option"
                    aria-selected={track.id === activeTrackId}
                    className={track.id === activeTrackId ? "is-active" : ""}
                    onClick={() => {
                      setActiveTrackId(track.id);
                      setIsTrackMenuOpen(false);
                    }}
                  >
                    <div>
                      <strong>{track.title}</strong>
                      {track.tagline && <small>{track.tagline}</small>}
                    </div>
                    <span>{trackProgress}%</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <nav className="lesson-tree" aria-label="Модули">
          {lessonModules.map((moduleName) => {
            const isOpen = openModules.has(moduleName);
            const moduleLessons = displayLessons.filter((lesson) => lesson.module === moduleName);

            return (
              <div className="module-group" key={moduleName}>
                <button className="module-toggle" type="button" onClick={() => toggleModule(moduleName)}>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span>{moduleName}</span>
                </button>
                <div className={`module-lessons ${isOpen ? "is-open" : ""}`}>
                  {moduleLessons.map((lesson) => {
                    const isUnavailable = isLessonUnavailable(lesson);

                    return (
                      <button
                        className={`lesson-row ${lesson.id === activeLessonId ? "is-active" : ""} ${isUnavailable ? "is-locked" : ""}`}
                        type="button"
                        key={lesson.id}
                        title={lesson.locked_reason || lesson.title}
                        onClick={() => {
                          if (isUnavailable) {
                            if (!user) {
                              onRequireAuth();
                            }
                            return;
                          }
                          setActiveLessonId(lesson.id);
                          openView("theory");
                        }}
                      >
                        {isUnavailable ? <Lock size={15} /> : lesson.completed ? <CheckCircle2 size={15} className="lesson-done-icon" /> : <Play size={15} />}
                        <span>{lesson.title}</span>
                        <small>{getLessonAccessLabel(lesson)}</small>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        <button
          className="explorer-resizer"
          type="button"
          aria-label="Изменить ширину панели занятий"
          onPointerDown={(event) => {
            event.preventDefault();
            setIsExplorerOpen(true);
            setIsResizingExplorer(true);
          }}
        />
      </aside>

      <section className="workbench" aria-label="Рабочая область">
        <header className="top-bar">
          {!isExplorerOpen && (
            <button className="icon-button" type="button" onClick={() => setIsExplorerOpen(true)} title="Открыть занятия">
              <PanelLeftOpen size={18} />
            </button>
          )}
          <div className="breadcrumbs">
            <span>{activeLesson.module}</span>
            <ChevronRight size={14} />
            <strong>{activeLesson.title}</strong>
          </div>
          <div className="top-actions">
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
            <button className="profile-button" type="button" onClick={openAccount}>
              <User size={17} />
              <span>{user ? user.username : "Войти"}</span>
            </button>
          </div>
        </header>

        <div className="tab-strip" role="tablist" aria-label="Открытые материалы">
          {openViews.map((view) => {
            const { Icon, label } = viewMeta[view];
            const isActive = activeView === view;

            return (
              <div className={`tab ${isActive ? "is-active" : ""}`} key={view}>
                <button className="tab-main" type="button" role="tab" aria-selected={isActive} onClick={() => setActiveView(view)}>
                  <Icon size={15} />
                  <span>{label}</span>
                </button>
                <button className="tab-close" type="button" onClick={() => closeView(view)} aria-label={`Закрыть ${label}`}>
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>

        {openViews.length > 0 ? (
          <article className="lesson-stage" key={`${activeLesson.id}-${activeView}`}>
            {isLessonUnavailable(activeLesson) ? (
              <LockedLessonView lesson={activeLesson} onRequireAuth={onRequireAuth} isGuest={!user} />
            ) : (
              <>
                {activeView === "theory" && <LearningTheoryView lesson={activeLesson} />}
                {activeView === "practice" && (
                  <LearningPracticeView
                    lesson={activeLesson}
                    isAuthenticated={Boolean(user)}
                    onRequireAuth={onRequireAuth}
                    onLessonCompleted={handleLessonCompleted}
                  />
                )}
              </>
            )}
          </article>
        ) : (
          <div className="empty-workbench">
            <div>
              <span>Все вкладки закрыты</span>
              <h2>Откройте материал, видео или практику</h2>
              <p>Рабочая область останется чистой, пока вы не выберете нужный формат занятия.</p>
              <div className="empty-actions">
                {defaultOpenViews.map((view) => {
                  const { Icon, label } = viewMeta[view];
                  return (
                    <button className="secondary-action" type="button" onClick={() => openView(view)} key={view}>
                      <Icon size={16} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {user && (
        <AccountDrawer
          isOpen={isAccountOpen}
          progress={progress}
          user={user}
          calendarMonth={calendarMonth}
          activityDays={activityDays}
          bookingSlots={bookingSlots}
          bookingQuota={bookingQuota}
          onMonthChange={setCalendarMonth}
          onBookSlot={bookSlot}
          onCancelSlot={cancelSlotBooking}
          onClose={() => setIsAccountOpen(false)}
          onLogout={handleLogout}
        />
      )}

      {user?.is_admin && isAdminOpen && <AdminScreen onClose={() => setIsAdminOpen(false)} />}
    </main>
  );
}

function AdminScreen({ onClose }: { onClose: () => void }) {
  const [adminTab, setAdminTab] = useState<"accounts" | "slots">("accounts");
  const [openStudentId, setOpenStudentId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // Меняется после удаления аккаунта, чтобы список перезапросился.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError("");

    const timer = window.setTimeout(() => {
      apiRequest<{ users: AdminAccount[] }>(`/admin/users?search=${encodeURIComponent(search.trim())}`)
        .then((data) => {
          if (!cancelled) {
            setAccounts(data.users ?? []);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : "Не удалось загрузить аккаунты");
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoading(false);
          }
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, reloadKey]);

  return (
    <div className="admin-layer" role="dialog" aria-modal="true" aria-label="Админ-панель">
      <div className="admin-panel">
        <header className="admin-head">
          <div className="admin-title">
            <ShieldCheck size={20} />
            <div>
              <strong>Админ-панель</strong>
              <small>Аккаунты и подписки</small>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={onClose} title="Закрыть">
            <X size={18} />
          </button>
        </header>

        <div className="admin-tabs">
          <button
            type="button"
            className={adminTab === "accounts" ? "is-active" : ""}
            onClick={() => setAdminTab("accounts")}
          >
            <User size={15} /> Аккаунты
          </button>
          <button
            type="button"
            className={adminTab === "slots" ? "is-active" : ""}
            onClick={() => setAdminTab("slots")}
          >
            <CalendarClock size={15} /> Слоты записи
          </button>
        </div>

        {adminTab === "slots" ? (
          <AdminSlotsView />
        ) : openStudentId !== null ? (
          <AdminStudentProfile
            studentId={openStudentId}
            onBack={() => setOpenStudentId(null)}
            onDeleted={() => {
              setOpenStudentId(null);
              setReloadKey((key) => key + 1);
            }}
          />
        ) : (
          <>
            <label className="admin-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск по имени или email..."
                autoFocus
              />
            </label>

            {error && <div className="form-error">{error}</div>}

            <div className="admin-list">
              {isLoading ? (
                <p className="admin-note">Загружаем аккаунты...</p>
              ) : accounts.length === 0 ? (
                <p className="admin-note">Ничего не найдено.</p>
              ) : (
                accounts.map((account) => (
                  <button className="admin-row admin-row--clickable" key={account.id} type="button" onClick={() => setOpenStudentId(account.id)}>
                    <div className="admin-row-user">
                      <strong>
                        {account.username}
                        {account.is_admin && <span className="admin-badge">admin</span>}
                      </strong>
                      <small>{account.email}</small>
                    </div>
                    <div className="admin-row-meta">
                      <span className={account.has_active_subscription ? "is-active-subscription" : ""}>
                        {account.has_active_subscription
                          ? `подписка до ${formatSubscriptionDate(account.subscription_until)}`
                          : "подписка не активна"}
                      </span>
                      <small>{account.completed_lessons} ур. пройдено</small>
                    </div>
                    <ChevronRight size={18} className="admin-row-chevron" />
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Слово, которое админ обязан ввести, чтобы удалить аккаунт.
const DELETE_KEYWORD = "УДАЛИТЬ";

function AdminStudentProfile({
  studentId,
  onBack,
  onDeleted,
}: {
  studentId: number;
  onBack: () => void;
  onDeleted: () => void;
}) {
  const [month, setMonth] = useState<CalendarMonth>(getInitialCalendarMonth);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const loadProfile = useCallback(() => {
    setIsLoading(true);
    apiRequest<{ profile: StudentProfile }>(`/admin/users/${studentId}/profile?year=${month.year}&month=${month.month}`)
      .then((data) => setProfile(data.profile))
      .catch((err) => setError(err instanceof Error ? err.message : "Не удалось загрузить профиль"))
      .finally(() => setIsLoading(false));
  }, [studentId, month.year, month.month]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function mutate(request: Promise<unknown>) {
    setIsBusy(true);
    setError("");
    try {
      await request;
      loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось выполнить действие");
    } finally {
      setIsBusy(false);
    }
  }

  function changeSubscription(days: number | null) {
    mutate(apiRequest(`/admin/users/${studentId}/subscription`, { days }, "PATCH"));
  }

  function addQuota(amount: number) {
    mutate(apiRequest(`/admin/users/${studentId}/quota`, { year: month.year, month: month.month, add: amount }));
  }

  async function deleteUser() {
    setIsBusy(true);
    setError("");
    try {
      await apiRequest(`/admin/users/${studentId}`, undefined, "DELETE");
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить аккаунт");
      setIsBusy(false);
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="admin-profile">
        <button className="admin-back" type="button" onClick={onBack}>
          ‹ К списку
        </button>
        <p className="admin-note">Загружаем профиль...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="admin-profile">
        <button className="admin-back" type="button" onClick={onBack}>
          ‹ К списку
        </button>
        <div className="form-error">{error || "Профиль не найден"}</div>
      </div>
    );
  }

  return (
    <div className="admin-profile">
      <button className="admin-back" type="button" onClick={onBack}>
        ‹ К списку
      </button>

      <div className="profile-head">
        <span className="avatar">{profile.username.slice(0, 2).toUpperCase()}</span>
        <div>
          <strong>
            {profile.username}
            {profile.is_admin && <span className="admin-badge">admin</span>}
          </strong>
          <small>{profile.email}</small>
        </div>
      </div>

      <div className="calendar-head slots-month-head">
        <strong>{getMonthTitle(month)}</strong>
        <div className="calendar-nav">
          <button type="button" onClick={() => setMonth(shiftCalendarMonth(month, -1))} aria-label="Предыдущий месяц">
            ‹
          </button>
          <button type="button" onClick={() => setMonth(shiftCalendarMonth(month, 1))} aria-label="Следующий месяц">
            ›
          </button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="profile-metric">
        <div>
          <span>Подписка</span>
          <strong className={profile.has_active_subscription ? "is-active-subscription" : ""}>
            {profile.has_active_subscription ? `до ${formatSubscriptionDate(profile.subscription_until)}` : "не активна"}
          </strong>
        </div>
        <div className="profile-actions">
          <button type="button" disabled={isBusy} onClick={() => changeSubscription(1)}>+1 день</button>
          <button type="button" disabled={isBusy} onClick={() => changeSubscription(30)}>+30 дн</button>
          <button type="button" className="is-danger" disabled={isBusy || !profile.subscription_until} onClick={() => changeSubscription(null)}>
            Сбросить
          </button>
        </div>
      </div>

      <div className="profile-metric">
        <div>
          <span>Занятий в этом месяце</span>
          <strong>
            использовано {profile.quota.used} из {profile.quota.granted}
          </strong>
        </div>
        <div className="profile-actions">
          <button type="button" disabled={isBusy} onClick={() => addQuota(1)}>+1</button>
          <button type="button" disabled={isBusy} onClick={() => addQuota(6)}>+6</button>
          <button type="button" disabled={isBusy} onClick={() => addQuota(12)}>+12</button>
        </div>
      </div>

      <div className="profile-metric">
        <div>
          <span>Активность</span>
          <strong>{profile.activity_days_count} дней заходил в этом месяце</strong>
        </div>
      </div>

      <div className="profile-bookings">
        <span className="profile-bookings-title">Записи на занятия</span>
        {profile.bookings.length === 0 ? (
          <p className="admin-note">В этом месяце записей нет.</p>
        ) : (
          profile.bookings.map((booking) => (
            <div className="profile-booking-row" key={booking.id}>
              <Clock size={14} />
              <strong>{formatSlotDate(booking.date)}</strong>
              <span>
                {formatSlotTimeRange(booking.start_time, booking.duration_minutes)} · {booking.duration_minutes} мин
              </span>
            </div>
          ))
        )}
      </div>

      <div className="profile-danger">
        <span className="profile-bookings-title">Опасная зона</span>
        {isDeleteOpen ? (
          <>
            <p className="admin-note">
              Аккаунт <strong>{profile.email}</strong> и весь его прогресс будут удалены безвозвратно.
              Забронированные им занятия освободятся. Введите <strong>{DELETE_KEYWORD}</strong>, чтобы подтвердить.
            </p>
            <input
              className="profile-danger-input"
              value={deleteConfirm}
              onChange={(event) => setDeleteConfirm(event.target.value)}
              placeholder={DELETE_KEYWORD}
              autoFocus
            />
            <div className="profile-actions">
              <button
                type="button"
                className="is-danger"
                disabled={isBusy || deleteConfirm.trim() !== DELETE_KEYWORD}
                onClick={deleteUser}
              >
                <Trash2 size={14} /> Удалить навсегда
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeleteConfirm("");
                }}
              >
                Отмена
              </button>
            </div>
          </>
        ) : (
          <div className="profile-actions">
            <button type="button" className="is-danger" disabled={isBusy} onClick={() => setIsDeleteOpen(true)}>
              <Trash2 size={14} /> Удалить пользователя
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminSlotsView() {
  const [month, setMonth] = useState<CalendarMonth>(getInitialCalendarMonth);
  const [slots, setSlots] = useState<AdminSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    date: getLocalDateKey(),
    time: "18:00",
    duration: 60,
  }));

  const loadSlots = useCallback(() => {
    setIsLoading(true);
    apiRequest<{ slots: AdminSlot[] }>(`/admin/slots?year=${month.year}&month=${month.month}`)
      .then((data) => setSlots(data.slots ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Не удалось загрузить слоты"))
      .finally(() => setIsLoading(false));
  }, [month.year, month.month]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  async function addSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      await apiRequest("/admin/slots", {
        slot_date: form.date,
        start_time: form.time,
        duration_minutes: Number(form.duration),
      });
      loadSlots();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать слот");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeSlot(slotId: number) {
    setError("");
    try {
      await apiRequest(`/admin/slots/${slotId}`, undefined, "DELETE");
      setSlots((current) => current.filter((slot) => slot.id !== slotId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить слот");
    }
  }

  return (
    <div className="admin-slots">
      <form className="slot-form" onSubmit={addSlot}>
        <label>
          Дата
          <input
            type="date"
            value={form.date}
            min={getLocalDateKey()}
            onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            required
          />
        </label>
        <label>
          Время
          <input
            type="time"
            value={form.time}
            onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
            required
          />
        </label>
        <label>
          Длительность
          <select
            value={form.duration}
            onChange={(event) => setForm((current) => ({ ...current, duration: Number(event.target.value) }))}
          >
            <option value={60}>60 мин</option>
            <option value={90}>90 мин</option>
            <option value={120}>120 мин</option>
          </select>
        </label>
        <button className="primary-action" type="submit" disabled={isSaving}>
          <CalendarPlus size={16} />
          {isSaving ? "..." : "Добавить"}
        </button>
      </form>

      <div className="calendar-head slots-month-head">
        <strong>{getMonthTitle(month)}</strong>
        <div className="calendar-nav">
          <button type="button" onClick={() => setMonth(shiftCalendarMonth(month, -1))} aria-label="Предыдущий месяц">
            ‹
          </button>
          <button type="button" onClick={() => setMonth(shiftCalendarMonth(month, 1))} aria-label="Следующий месяц">
            ›
          </button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="admin-list">
        {isLoading ? (
          <p className="admin-note">Загружаем слоты...</p>
        ) : slots.length === 0 ? (
          <p className="admin-note">На этот месяц слотов нет. Добавьте свободное окно выше.</p>
        ) : (
          slots.map((slot) => (
            <article className={`slot-row ${slot.is_past ? "is-past" : ""}`} key={slot.id}>
              <div className="slot-row-when">
                <Clock size={15} />
                <div>
                  <strong>{formatSlotDate(slot.date)}</strong>
                  <small>
                    {formatSlotTimeRange(slot.start_time, slot.duration_minutes)} · {slot.duration_minutes} мин
                  </small>
                </div>
              </div>
              <div className="slot-row-status">
                {slot.student ? (
                  <span className="slot-booked">
                    записан: {slot.student.username}
                    <small>{slot.student.email}</small>
                  </span>
                ) : (
                  <span className="slot-free">свободно</span>
                )}
              </div>
              <button
                className="icon-button slot-delete"
                type="button"
                onClick={() => removeSlot(slot.id)}
                title="Удалить слот"
              >
                <Trash2 size={16} />
              </button>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function formatSlotDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function formatSlotTimeRange(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = (hours * 60 + minutes + durationMinutes) % (24 * 60);
  const endHours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const endMinutes = String(totalMinutes % 60).padStart(2, "0");
  return `${startTime}–${endHours}:${endMinutes}`;
}

type MarkdownBlock =
  | { type: "code"; lang: string; text: string }
  | { type: "heading"; level: number; text: string }
  | { type: "hr" }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "paragraph"; text: string };

function parseMarkdownBlocks(source: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  let codeLines: string[] | null = null;
  let codeLang = "";
  let list: { ordered: boolean; items: string[] } | null = null;

  function flushParagraph() {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  }

  function flushList() {
    if (list) {
      blocks.push({ type: "list", ordered: list.ordered, items: list.items });
      list = null;
    }
  }

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (codeLines !== null) {
      if (trimmed.startsWith("```")) {
        blocks.push({ type: "code", lang: codeLang, text: codeLines.join("\n") });
        codeLines = null;
        codeLang = "";
      } else {
        codeLines.push(rawLine);
      }
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushList();
      codeLang = trimmed.slice(3).trim();
      codeLines = [];
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: headingMatch[1].length, text: headingMatch[2] });
      continue;
    }

    if (trimmed === "---" || trimmed === "***") {
      flushParagraph();
      flushList();
      blocks.push({ type: "hr" });
      continue;
    }

    const listMatch = /^(?:[-*+]|\d+[.)])\s+(.*)$/.exec(trimmed);
    if (listMatch) {
      flushParagraph();
      const ordered = /^\d/.test(trimmed);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push(listMatch[1]);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  if (codeLines !== null) {
    blocks.push({ type: "code", lang: codeLang, text: codeLines.join("\n") });
  }
  flushParagraph();
  flushList();

  return blocks;
}

function renderInlineMarkdown(text: string, keyPrefix: string): React.ReactNode[] {
  const cleaned = text.replace(/\[\[(.*?)\]\]/g, "$1");
  const nodes: React.ReactNode[] = [];
  const tokenRe = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let lastIndex = 0;
  let tokenIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRe.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(cleaned.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("`")) {
      nodes.push(<code key={`${keyPrefix}-inline-${tokenIndex}`}>{token.slice(1, -1)}</code>);
    } else {
      nodes.push(<strong key={`${keyPrefix}-inline-${tokenIndex}`}>{token.slice(2, -2)}</strong>);
    }
    lastIndex = match.index + token.length;
    tokenIndex += 1;
  }

  if (lastIndex < cleaned.length) {
    nodes.push(cleaned.slice(lastIndex));
  }

  return nodes;
}

function MarkdownView({ source }: { source: string }) {
  const blocks = useMemo(() => parseMarkdownBlocks(source), [source]);

  return (
    <div className="markdown-body">
      {blocks.map((block, index) => {
        const key = `md-${index}`;

        if (block.type === "code") {
          return (
            <pre className="markdown-code" data-lang={block.lang || "code"} key={key}>
              <code>{block.text}</code>
            </pre>
          );
        }
        if (block.type === "heading") {
          const level = Math.min(Math.max(block.level, 1), 4);
          const HeadingTag = `h${level}` as keyof React.JSX.IntrinsicElements;
          return <HeadingTag key={key}>{renderInlineMarkdown(block.text, key)}</HeadingTag>;
        }
        if (block.type === "hr") {
          return <hr key={key} />;
        }
        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag key={key}>
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-item-${itemIndex}`}>{renderInlineMarkdown(item, `${key}-item-${itemIndex}`)}</li>
              ))}
            </ListTag>
          );
        }
        return <p key={key}>{renderInlineMarkdown(block.text, key)}</p>;
      })}
    </div>
  );
}

function getLessonTheory(lesson: Lesson): string[] {
  return lesson.theory?.length
    ? lesson.theory
    : [
        "Теория для этого урока скоро появится. Пока используйте практику и видео как рабочий черновик.",
        "Каждый урок будет состоять из короткого объяснения, видео и нескольких заданий с автоматической проверкой.",
      ];
}

function LockedLessonView({
  lesson,
  onRequireAuth,
  isGuest,
}: {
  lesson: Lesson;
  onRequireAuth: () => void;
  isGuest: boolean;
}) {
  return (
    <div className="locked-lesson-view">
      <Lock size={34} />
      <span>{getLessonAccessLabel(lesson)}</span>
      <h1>{lesson.title}</h1>
      <p>{lesson.locked_reason || "Это занятие закрыто. Проверьте доступ к аккаунту или подписке."}</p>
      {isGuest && (
        <button className="primary-action" type="button" onClick={onRequireAuth}>
          Войти или зарегистрироваться
        </button>
      )}
    </div>
  );
}

function getLessonVideo(lesson: Lesson): LessonVideo {
  return (
    lesson.video ?? {
      title: "Видео к уроку",
      youtube_id: "rfscVS0vtbw",
      embed_url: "https://www.youtube.com/embed/rfscVS0vtbw",
    }
  );
}

function getLessonTasks(lesson: Lesson): LessonTask[] {
  return lesson.tasks ?? [];
}

function LearningTheoryView({ lesson }: { lesson: Lesson }) {
  const video = getLessonVideo(lesson);
  const RichLessonPage = lesson.source_file ? richLessonPages[lesson.source_file] : undefined;
  const [theoryMarkdown, setTheoryMarkdown] = useState<string | null>(null);
  const [isTheoryLoading, setIsTheoryLoading] = useState(true);

  useEffect(() => {
    if (RichLessonPage) {
      return;
    }

    let cancelled = false;
    setIsTheoryLoading(true);
    setTheoryMarkdown(null);

    apiRequest<LessonTheoryResponse>(`/learning/lessons/${lesson.id}/theory`)
      .then((data) => {
        if (!cancelled) {
          setTheoryMarkdown(data.theory_markdown);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTheoryMarkdown(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsTheoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lesson.id, RichLessonPage]);

  if (RichLessonPage) {
    return (
      <div className="document-view document-view--rich">
        <RichLessonPage module={lesson.module} />
        <section className="lesson-video-card">
          <div>
            <span>Видео из YouTube</span>
            <h2>{video.title}</h2>
          </div>
          <iframe
            src={video.embed_url}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </section>
      </div>
    );
  }

  return (
    <div className="document-view">
      <div className="lesson-meta">
        <span>{lesson.module}</span>
        <span>{lesson.duration}</span>
      </div>
      <h1>{lesson.title}</h1>
      {theoryMarkdown ? (
        <MarkdownView source={theoryMarkdown.replace(/^\s*#\s+[^\n]*\n/, "")} />
      ) : isTheoryLoading ? (
        <p className="theory-loading">Загружаем материал урока...</p>
      ) : (
        getLessonTheory(lesson).map((paragraph) => <p key={paragraph}>{paragraph}</p>)
      )}
      <section className="lesson-video-card">
        <div>
          <span>Видео из YouTube</span>
          <h2>{video.title}</h2>
        </div>
        <iframe
          src={video.embed_url}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </section>
      <section className="note-panel">
        <h2>Практика после теории</h2>
        <p>Откройте вкладку practice.py, выполните задания по порядку и сверяйтесь с критерием «Готово, если».</p>
      </section>
    </div>
  );
}

function SelfCheckPanel({
  lesson,
  isAuthenticated,
  onRequireAuth,
  onLessonCompleted,
}: {
  lesson: Lesson;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onLessonCompleted: () => void;
}) {
  const manualPractice = lesson.manual_practice ?? [];
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(() => new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCheckedSteps(new Set());
    setError("");
  }, [lesson.id]);

  const totalStepCount = manualPractice.reduce((total, exercise) => total + exercise.steps.length, 0);
  const checkedStepCount = checkedSteps.size;
  const isPracticeComplete = totalStepCount === 0 || checkedStepCount === totalStepCount;

  function toggleStep(stepId: string) {
    setCheckedSteps((current) => {
      const next = new Set(current);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }

  async function markCompleted() {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }

    if (!isPracticeComplete) {
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await apiRequest(`/learning/lessons/${lesson.id}/complete`, {});
      onLessonCompleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить отметку");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <section className="self-check-card self-check-card--intro">
        <div>
          <h2>{lesson.completed ? "Практика занятия пройдена" : "Практика без автоматической проверки"}</h2>
          <p>
            {manualPractice.length > 0
              ? `Выполните ${manualPractice.length} задания по порядку. Отмечайте каждый сделанный шаг — после этого занятие можно зачесть в прогресс.`
              : "Изучите теорию и выполните упражнения из урока самостоятельно, затем отметьте занятие выполненным."}
          </p>
        </div>
        {lesson.completed && <CheckCircle2 className="lesson-done-icon" size={28} aria-label="Занятие зачтено" />}
      </section>

      {manualPractice.length > 0 && (
        <section className="manual-practice-list" aria-label="Практические задания урока">
          {manualPractice.map((exercise, exerciseIndex) => (
            <article className="manual-practice-card" key={`${lesson.id}-${exercise.title}`}>
              <div className="manual-practice-card__head">
                <span>Практика {exerciseIndex + 1}</span>
                <h2>{exercise.title}</h2>
              </div>
              <p className="manual-practice-card__task">{exercise.task}</p>
              <div className="manual-practice-steps">
                {exercise.steps.map((step, stepIndex) => {
                  const stepId = `${lesson.id}:${exerciseIndex}:${stepIndex}`;
                  return (
                    <label className="manual-practice-step" key={stepId}>
                      <input
                        type="checkbox"
                        checked={checkedSteps.has(stepId) || lesson.completed === true}
                        disabled={lesson.completed}
                        onChange={() => toggleStep(stepId)}
                      />
                      <span>
                        <strong>Шаг {stepIndex + 1}.</strong> {step}
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="manual-practice-card__result">
                <strong>Готово, если:</strong> {exercise.result}
              </p>
            </article>
          ))}
        </section>
      )}

      {!lesson.completed && (
        <section className="self-check-card self-check-card--complete">
          <div>
            <h2>Зафиксируйте результат</h2>
            <p>
              {totalStepCount > 0
                ? `Отмечено шагов: ${checkedStepCount} из ${totalStepCount}.`
                : "После самостоятельной практики отметьте занятие выполненным."}
            </p>
            {error && <div className="form-error">{error}</div>}
          </div>
          <button
            className="primary-action"
            type="button"
            onClick={markCompleted}
            disabled={isSaving || (isAuthenticated && !isPracticeComplete)}
          >
            <CheckCircle2 size={17} />
            {isSaving
              ? "Сохраняем..."
              : !isAuthenticated
                ? "Войти и отметить"
                : isPracticeComplete
                  ? "Задание выполнено"
                  : "Отметьте все шаги"}
          </button>
        </section>
      )}
    </>
  );
}

function LearningPracticeView({
  lesson,
  isAuthenticated,
  onRequireAuth,
  onLessonCompleted,
}: {
  lesson: Lesson;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onLessonCompleted: () => void;
}) {
  const tasks = getLessonTasks(lesson);

  return (
    <div className="practice-stack">
      <div className="practice-intro">
        <span>{lesson.module}</span>
        <h1>Задания: {lesson.title}</h1>
        <p>
          {lesson.self_check
            ? "Здесь практика выполняется вне интерпретатора. Пройдите шаги по порядку и только затем зафиксируйте результат."
            : tasks[0]?.mode === "script"
              ? "Напишите полноценную программу в редакторе. Backend запустит её в изолированном интерпретаторе и сверит вывод."
              : "Напишите функцию solve. Backend запустит код в отдельном процессе и проверит её на скрытых тестах."}
        </p>
      </div>
      {lesson.self_check ? (
        <SelfCheckPanel
          lesson={lesson}
          isAuthenticated={isAuthenticated}
          onRequireAuth={onRequireAuth}
          onLessonCompleted={onLessonCompleted}
        />
      ) : tasks.length > 0 ? (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskRunner task={task} key={task.id} onSolved={onLessonCompleted} />
          ))}
        </div>
      ) : (
        <div className="empty-task-card">
          <h2>Задания скоро появятся</h2>
          <p>Для этого урока пока нет практических задач. Выберите другой урок или вернитесь к теории.</p>
        </div>
      )}
    </div>
  );
}

function TaskRunner({ task, onSolved }: { task: LessonTask; onSolved?: () => void }) {
  const [code, setCode] = useState(task.starter_code);
  const [result, setResult] = useState<TaskSubmitResponse | null>(null);
  const [runResult, setRunResult] = useState<TaskRunResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const isBusy = isRunning || isChecking;
  const taskPrompt = useMemo(() => splitTaskPrompt(task.prompt), [task.prompt]);
  const taskContract: TaskContract = task.contract ?? {
    given:
      task.mode === "script"
        ? "Переменные из условия подготовит интерпретатор."
        : "Автопроверка вызовет solve с разными скрытыми данными.",
    todo: taskPrompt.description,
    check: task.mode === "script" ? "Сверим вывод программы." : "Сверим результат, который вернёт solve.",
  };
  const requirementItems = task.requirements?.items ?? [];

  async function runCode() {
    setIsRunning(true);
    setResult(null);
    setRunResult(null);
    try {
      const data = await apiRequest<TaskRunResponse>(`/learning/tasks/${task.id}/run`, { code });
      setRunResult(data);
    } catch (err) {
      setRunResult({
        ok: false,
        stdout: "",
        error: err instanceof Error ? err.message : "Не удалось запустить код",
      });
    } finally {
      setIsRunning(false);
    }
  }

  async function submitCode() {
    setIsChecking(true);
    setResult(null);
    setRunResult(null);
    try {
      const data = await apiRequest<TaskSubmitResponse>(`/learning/tasks/${task.id}/submit`, { code });
      setResult(data);
      if (data.ok) {
        onSolved?.();
      }
    } catch (err) {
      setResult({
        ok: false,
        score: 0,
        tests: [],
        stdout: "",
        error: err instanceof Error ? err.message : "Не удалось проверить код",
      });
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <section className="task-card">
      <div className="task-head">
        <div>
          <span>
            {task.level === "easy" ? "Старт" : task.level === "medium" ? "Практика" : "Вызов"}
          </span>
          <h2>{task.title}</h2>
        </div>
        <div className="task-actions">
          <button
            className="run-button run-button--ghost"
            type="button"
            onClick={runCode}
            disabled={isBusy}
            title="Демонстрационный запуск: проверка выполнит один пример без зачёта урока"
          >
            <Terminal size={16} />
            {isRunning ? "Запуск..." : "Запустить пример"}
          </button>
          <button className="run-button" type="button" onClick={submitCode} disabled={isBusy}>
            <Play size={16} />
            {isChecking ? "Проверка..." : "Проверить"}
          </button>
        </div>
      </div>
      <div className="task-spec" aria-label="Техническое задание">
        <section className="task-spec__item">
          <span>Дано</span>
          <p>{taskContract.given}</p>
        </section>
        <section className="task-spec__item">
          <span>Нужно сделать</span>
          <p>{taskContract.todo}</p>
        </section>
        <section className="task-spec__item task-spec__item--check">
          <span>Как проверим</span>
          <p>{taskContract.check}</p>
        </section>
      </div>
      {requirementItems.length > 0 && (
        <section className="task-requirements" aria-label="Обязательные элементы решения">
          <span>В решении должно быть</span>
          <ul>
            {requirementItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
      {taskPrompt.examples.length > 0 && (
        <div className="task-examples" aria-label="Примеры ввода и вывода">
          <span className="task-examples-title">Пример ввода и вывода</span>
          {taskPrompt.examples.map((example, index) => (
            <div className="task-example" key={`${example.input}-${example.output}-${index}`}>
              <div className="task-example-cell">
                <span>Ввод</span>
                <code>{example.input}</code>
              </div>
              <i className="task-example-arrow" aria-hidden="true">→</i>
              <div className="task-example-cell task-example-cell--output">
                <span>Вывод</span>
                <code>{example.output}</code>
              </div>
            </div>
          ))}
        </div>
      )}
      <CodeEditor value={code} onChange={setCode} ariaLabel={`Код для задания ${task.title}`} />
      {runResult && <RunOutput result={runResult} />}
      {result && <TaskResult result={result} />}
    </section>
  );
}

function splitTaskPrompt(prompt: string): { description: string; examples: Array<{ input: string; output: string }> } {
  const exampleMatch = /\*\*Пример(?:ы)?:\*\*\s*([^\n]+)/i.exec(prompt);
  if (!exampleMatch) {
    return { description: prompt, examples: [] };
  }

  const examples = exampleMatch[1]
    .replace(/\.$/, "")
    .split(/;\s*/)
    .map((item) => item.trim())
    .map((item) => {
      const separatorIndex = item.indexOf("->");
      if (separatorIndex === -1) {
        return null;
      }
      return {
        input: cleanTaskExample(item.slice(0, separatorIndex)),
        output: cleanTaskExample(item.slice(separatorIndex + 2)),
      };
    })
    .filter((item): item is { input: string; output: string } => item !== null && Boolean(item.input) && Boolean(item.output));

  const description = prompt
    .replace(exampleMatch[0], "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { description, examples };
}

function cleanTaskExample(value: string): string {
  return value.trim().replace(/^`+|`+$/g, "").replace(/\.$/, "").trim();
}

function formatCompilerMessage(message?: string | null) {
  if (!message) {
    return "";
  }

  if (message.includes("solve") && (message.includes("�") || message.includes("РќСѓ"))) {
    return "Нужно объявить функцию solve.";
  }

  return message;
}

function RunOutput({ result }: { result: TaskRunResponse }) {
  const errorMessage = formatCompilerMessage(result.error);

  return (
    <div className={`task-result ${result.ok ? "is-neutral" : "is-failed"}`}>
      <div className="task-result-summary">
        <strong>{result.ok ? "Код выполнен" : "Ошибка выполнения"}</strong>
      </div>
      {errorMessage && <p>{errorMessage}</p>}
      <pre className="task-output">
        <code>{result.stdout?.trim() ? result.stdout : "— программа ничего не вывела —"}</code>
      </pre>
      {result.stderr && (
        <pre className="task-output task-output--stderr">
          <code>{result.stderr}</code>
        </pre>
      )}
    </div>
  );
}

function TaskResult({ result }: { result: TaskSubmitResponse }) {
  const errorMessage = formatCompilerMessage(result.error);

  return (
    <div className={`task-result ${result.ok ? "is-success" : "is-failed"}`}>
      <div className="task-result-summary">
        <strong>{result.ok ? "Задание принято" : "Нужно доработать"}</strong>
        <span>{result.score}%</span>
      </div>
      {errorMessage && <p>{errorMessage}</p>}
      {result.stdout && (
        <pre className="task-output">
          <code>{result.stdout}</code>
        </pre>
      )}
      {result.stderr && (
        <pre className="task-output task-output--stderr">
          <code>{result.stderr}</code>
        </pre>
      )}
      {result.tests.length > 0 && (
        <ul className="test-list">
          {result.tests.map((test) => (
            <li className={test.passed ? "is-success" : "is-failed"} key={test.name}>
              <span>{test.passed ? "passed" : "failed"}</span>
              <strong>{test.name}</strong>
              {!test.passed && (
                <small>
                  ожидалось: {String(test.expected)}; получено: {String(test.actual)}
                  {test.error ? `; ошибка: ${test.error}` : ""}
                </small>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CalendarPanel({
  calendarMonth,
  activityDays,
  bookingSlots,
  bookingQuota,
  onMonthChange,
  onBookSlot,
  onCancelSlot,
}: {
  calendarMonth: CalendarMonth;
  activityDays: Set<string>;
  bookingSlots: StudentSlot[];
  bookingQuota: QuotaStatus | null;
  onMonthChange: (calendarMonth: CalendarMonth) => void;
  onBookSlot: (slotId: number) => Promise<void>;
  onCancelSlot: (slotId: number) => Promise<void>;
}) {
  const cells = buildMonthCells(calendarMonth);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [busySlotId, setBusySlotId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Группируем слоты по дню: где есть свободные окна, где есть моя запись.
  const { freeDays, myDays, slotsByDay } = useMemo(() => {
    const free = new Set<string>();
    const mine = new Set<string>();
    const byDay = new Map<string, StudentSlot[]>();
    for (const slot of bookingSlots) {
      if (!byDay.has(slot.date)) {
        byDay.set(slot.date, []);
      }
      byDay.get(slot.date)!.push(slot);
      if (slot.status === "mine") {
        mine.add(slot.date);
      } else {
        free.add(slot.date);
      }
    }
    return { freeDays: free, myDays: mine, slotsByDay: byDay };
  }, [bookingSlots]);

  // Сбрасываем выбранный день при смене месяца, если его слотов больше нет.
  useEffect(() => {
    if (selectedDay && !slotsByDay.has(selectedDay)) {
      setSelectedDay(null);
    }
  }, [selectedDay, slotsByDay]);

  const selectedSlots = selectedDay ? slotsByDay.get(selectedDay) ?? [] : [];

  async function handleSlotAction(slot: StudentSlot) {
    setBusySlotId(slot.id);
    setError("");
    try {
      if (slot.status === "mine") {
        await onCancelSlot(slot.id);
      } else {
        await onBookSlot(slot.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось изменить запись");
    } finally {
      setBusySlotId(null);
    }
  }

  return (
    <aside className="calendar-panel" aria-label="Календарь занятий">
      <div className="calendar-card">
        <div className="calendar-head">
          <div>
            <span>Занятия</span>
            <strong>{getMonthTitle(calendarMonth)}</strong>
          </div>
          <div className="calendar-nav">
            <button type="button" onClick={() => onMonthChange(shiftCalendarMonth(calendarMonth, -1))} aria-label="Предыдущий месяц">
              ‹
            </button>
            <button type="button" onClick={() => onMonthChange(shiftCalendarMonth(calendarMonth, 1))} aria-label="Следующий месяц">
              ›
            </button>
          </div>
        </div>

        <div className="calendar-weekdays" aria-hidden="true">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>

        <div className="calendar-grid">
          {cells.map((cell, index) => {
            if (!cell) {
              return <span className="calendar-day is-empty" key={`empty-${index}`} />;
            }
            const hasFree = freeDays.has(cell.dateKey);
            const hasMine = myDays.has(cell.dateKey);
            const clickable = hasFree || hasMine;
            const classes = [
              "calendar-day",
              activityDays.has(cell.dateKey) ? "is-active" : "",
              hasFree ? "has-free" : "",
              hasMine ? "has-booking" : "",
              clickable ? "is-clickable" : "",
              selectedDay === cell.dateKey ? "is-selected" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return clickable ? (
              <button
                className={classes}
                key={cell.key}
                type="button"
                onClick={() => setSelectedDay((current) => (current === cell.dateKey ? null : cell.dateKey))}
                title={hasMine ? "У вас есть запись" : "Есть свободные окна"}
              >
                {cell.day}
              </button>
            ) : (
              <span className={classes} key={cell.key} title={activityDays.has(cell.dateKey) ? "Вы заходили" : undefined}>
                {cell.day}
              </span>
            );
          })}
        </div>

        <div className="calendar-legend">
          <span><i className="dot dot-free" /> свободно</span>
          <span><i className="dot dot-booking" /> ваша запись</span>
          <span><i className="dot dot-activity" /> заходили</span>
        </div>

        {bookingQuota && (
          <div className={`quota-badge ${bookingQuota.remaining <= 0 ? "is-empty" : ""}`}>
            <CalendarClock size={15} />
            {bookingQuota.granted === 0 ? (
              <span>Занятия на этот месяц не выданы — обратитесь к преподавателю</span>
            ) : (
              <span>
                Осталось занятий: <strong>{bookingQuota.remaining}</strong> из {bookingQuota.granted}
              </span>
            )}
          </div>
        )}

        {selectedDay ? (
          <div className="slot-picker">
            <strong>{formatSlotDate(selectedDay)}</strong>
            {error && <div className="form-error">{error}</div>}
            <div className="slot-picker-list">
              {selectedSlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  className={`slot-chip ${slot.status === "mine" ? "is-mine" : ""}`}
                  disabled={busySlotId === slot.id || (slot.status === "mine" && !slot.can_cancel)}
                  onClick={() => handleSlotAction(slot)}
                  title={
                    slot.status === "mine" && !slot.can_cancel
                      ? "Отменить занятие можно не позднее чем за 36 часов до начала"
                      : undefined
                  }
                >
                  <Clock size={13} />
                  <span className="slot-chip-time">{formatSlotTimeRange(slot.start_time, slot.duration_minutes)}</span>
                  <small>
                    {slot.duration_minutes} мин · {slot.status === "mine" ? (slot.can_cancel ? "отменить" : "отмена закрыта: меньше 36 ч") : "записаться"}
                  </small>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="calendar-note">
            Кликните на день с кружком, чтобы выбрать время занятия. Свободные окна выставляет преподаватель.
          </p>
        )}
      </div>
    </aside>
  );
}

function AccountDrawer({
  isOpen,
  progress,
  user,
  calendarMonth,
  activityDays,
  bookingSlots,
  bookingQuota,
  onMonthChange,
  onBookSlot,
  onCancelSlot,
  onClose,
  onLogout,
}: {
  isOpen: boolean;
  progress: number;
  user: UserProfile;
  calendarMonth: CalendarMonth;
  activityDays: Set<string>;
  bookingSlots: StudentSlot[];
  bookingQuota: QuotaStatus | null;
  onMonthChange: (calendarMonth: CalendarMonth) => void;
  onBookSlot: (slotId: number) => Promise<void>;
  onCancelSlot: (slotId: number) => Promise<void>;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <div className={`drawer-layer ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
      <button
        className="drawer-backdrop"
        type="button"
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
        aria-label="Закрыть личный кабинет"
      />
      <aside className="account-drawer" role="dialog" aria-modal={isOpen} aria-label="Личный кабинет">
        <div className="drawer-head">
          <strong>Личный кабинет</strong>
          <button className="icon-button" type="button" onClick={onClose} title="Закрыть" tabIndex={isOpen ? 0 : -1}>
            <X size={18} />
          </button>
        </div>
        <div className="account-card">
          <span className="avatar">{user.username.slice(0, 2).toUpperCase()}</span>
          <div>
            <strong>{user.username}</strong>
            <small>{user.email}</small>
          </div>
        </div>
        <div className="account-metric">
          <span>Прогресс</span>
          <strong>{progress}%</strong>
        </div>
        <div className={`account-metric ${user.has_active_subscription ? "is-active-subscription" : "is-expired-subscription"}`}>
          <span>Подписка</span>
          <strong>{user.has_active_subscription ? `до ${formatSubscriptionDate(user.subscription_until)}` : "нужно продлить"}</strong>
        </div>
        <CalendarPanel
          calendarMonth={calendarMonth}
          activityDays={activityDays}
          bookingSlots={bookingSlots}
          bookingQuota={bookingQuota}
          onMonthChange={onMonthChange}
          onBookSlot={onBookSlot}
          onCancelSlot={onCancelSlot}
        />
        <button className="secondary-action" type="button" onClick={onLogout} tabIndex={isOpen ? 0 : -1}>
          <LogOut size={17} />
          Выйти
        </button>
      </aside>
    </div>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found");
}

const root = window.__pymentorRoot ?? createRoot(rootElement);
window.__pymentorRoot = root;

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCatalog, getLesson } from "./api";
import { getDisplayModule, PYTHON_MODULE_ORDER } from "./course";
import type { Lesson, Track } from "./types";
import type { UserProfile } from "../../shared/api/contracts";

export type CourseEntry = { lessons: Lesson[]; loading: boolean; error?: string };
type MaterialEntry = { lesson?: Lesson; loading: boolean; error?: string };
type LearningUser = Pick<UserProfile, "id" | "has_active_subscription" | "subscription_until"> | null;
const EMPTY_LESSONS: Lesson[] = [];
const emptyCourses = (): Record<string, CourseEntry> => Object.create(null);

export function useLearningCourse(user: LearningUser) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksError, setTracksError] = useState<string>();
  const [tracksLoaded, setTracksLoaded] = useState(false);
  const ownerKey = user ? String(user.id) : "guest";
  const [activeTrackId, setActiveTrackId] = useState(() => {
    try { return window.localStorage.getItem(`pymentor:track:${ownerKey}`) ?? window.localStorage.getItem("pymentor-track") ?? ""; }
    catch { return ""; }
  });
  const [courses, setCourses] = useState(emptyCourses);
  const [materials, setMaterials] = useState<Record<string, MaterialEntry>>({});
  const materialCache = useRef<Record<string, MaterialEntry>>({});
  const pendingMaterials = useRef(new Map<string, Promise<void>>());
  const refreshQueued = useRef(new Set<string>());
  const catalogRequest = useRef<Promise<void> | null>(null);
  const generation = useRef(0);
  const alive = useRef(false);

  // Publish the complete menu together. Changing chapters never requests content.
  const loadTracks = useCallback((): Promise<void> => {
    if (!alive.current) return Promise.resolve();
    if (catalogRequest.current) return catalogRequest.current;
    const scope = generation.current;
    const request = (async () => {
      try {
        const data = await getCatalog();
        if (scope !== generation.current) return;
        const next = emptyCourses();
        for (const track of data.tracks) {
          if (!data.courses[track.id]) throw new Error("Не получен список занятий курса");
          next[track.id] = { lessons: data.courses[track.id].map((lesson) => ({ ...lesson, module: getDisplayModule(lesson, track.id) })), loading: false };
        }
        setCourses(next);
        setTracks(data.tracks);
        setTracksLoaded(true);
        setTracksError(undefined);
        setActiveTrackId((current) => data.tracks.some((track) => track.id === current) ? current : data.default_track ?? "");
      } catch (error) {
        if (scope === generation.current) setTracksError(error instanceof Error ? error.message : "Не удалось загрузить курсы");
      } finally {
        if (scope === generation.current) catalogRequest.current = null;
      }
    })();
    catalogRequest.current = request;
    return request;
  }, []);

  // Kept for the workspace's navigation/retry commands; all tracks arrive together.
  const ensureTrack = useCallback((_trackId: string, refresh = false) => {
    return refresh ? loadTracks() : catalogRequest.current ?? Promise.resolve();
  }, [loadTracks]);

  const ensureLesson = useCallback(function loadMaterial(trackId: string, lessonId: string, refresh = false): Promise<void> {
    if (!alive.current || !lessonId) return Promise.resolve();
    const existing = pendingMaterials.current.get(lessonId);
    if (existing) {
      if (refresh) refreshQueued.current.add(lessonId);
      return existing;
    }
    if (materialCache.current[lessonId] && !refresh) return Promise.resolve();
    const scope = generation.current;
    const publish = (entry: MaterialEntry) => {
      if (scope !== generation.current) return;
      materialCache.current = { ...materialCache.current, [lessonId]: entry };
      setMaterials(materialCache.current);
    };
    publish({ lesson: materialCache.current[lessonId]?.lesson, loading: true });
    const request = (async () => {
      try {
        const data = await getLesson(lessonId);
        if (data.lesson.id !== lessonId) throw new Error("Получены материалы другого занятия");
        publish({ lesson: { ...data.lesson, module: getDisplayModule(data.lesson, trackId) }, loading: false });
      } catch (error) {
        publish({ lesson: materialCache.current[lessonId]?.lesson, loading: false, error: error instanceof Error ? error.message : "Не удалось загрузить занятие" });
      } finally {
        if (scope === generation.current) {
          pendingMaterials.current.delete(lessonId);
          if (refreshQueued.current.delete(lessonId)) void loadMaterial(trackId, lessonId, true);
        }
      }
    })();
    pendingMaterials.current.set(lessonId, request);
    return request;
  }, []);

  useEffect(() => {
    alive.current = true;
    generation.current += 1;
    catalogRequest.current = null;
    materialCache.current = {};
    pendingMaterials.current.clear();
    refreshQueued.current.clear();
    setMaterials({});
    setTracksLoaded(false);
    setTracksError(undefined);
    setCourses(emptyCourses());
    void loadTracks();
    return () => { alive.current = false; generation.current += 1; };
  }, [loadTracks, user?.id, user?.has_active_subscription, user?.subscription_until]);

  useEffect(() => {
    if (!activeTrackId) return;
    try { window.localStorage.setItem(`pymentor:track:${ownerKey}`, activeTrackId); } catch { /* Storage is optional. */ }
  }, [activeTrackId, ownerKey]);

  const displayLessons = courses[activeTrackId]?.lessons ?? EMPTY_LESSONS;
  const lessonModules = useMemo(() => {
    const available = new Set(displayLessons.map((lesson) => lesson.module));
    return [...PYTHON_MODULE_ORDER.filter((name) => available.has(name)), ...Array.from(available).filter((name) => !PYTHON_MODULE_ORDER.includes(name))];
  }, [displayLessons]);
  const activeTrack = tracks.find((track) => track.id === activeTrackId);
  const progress = activeTrack?.lessons_countable ? Math.round(activeTrack.lessons_completed / activeTrack.lessons_countable * 100) : 0;
  const handleLessonCompleted = useCallback((trackId: string, lessonId: string) => {
    // The catalog stays visible while progress is refreshed.
    const wasPending = Boolean(catalogRequest.current);
    const scope = generation.current;
    void loadTracks().then(() => {
      if (wasPending && alive.current && scope === generation.current) void loadTracks();
    });
    void ensureLesson(trackId, lessonId, true);
  }, [ensureLesson, loadTracks]);

  return { tracks, tracksLoaded, tracksError, loadTracks, activeTrackId, setActiveTrackId, courses, ensureTrack,
    materials, ensureLesson, displayLessons, lessonModules, progress,
    isLessonsLoading: !tracksLoaded && !tracksError, handleLessonCompleted };
}

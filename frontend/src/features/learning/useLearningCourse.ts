import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getLessons, getTracks } from "./api";
import { getDisplayModule, PYTHON_MODULE_ORDER } from "./course";
import type { Lesson, Track } from "./types";
import type { UserProfile } from "../../shared/api/contracts";

export type CourseEntry = { lessons: Lesson[]; loading: boolean; error?: string };
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
  const cache = useRef(emptyCourses());
  const pending = useRef(new Map<string, Promise<void>>());
  const refreshQueued = useRef(new Set<string>());
  const generation = useRef(0);
  const alive = useRef(false);
  const tracksRequest = useRef(0);

  const loadTracks = useCallback(async () => {
    if (!alive.current) return;
    const scope = generation.current;
    const requestId = ++tracksRequest.current;
    try {
      const data = await getTracks();
      if (scope !== generation.current || requestId !== tracksRequest.current) return;
      setTracks(data.tracks);
      setTracksLoaded(true);
      setTracksError(undefined);
      setActiveTrackId((current) => data.tracks.some((track) => track.id === current) ? current : data.default_track ?? "");
    } catch (error) {
      if (scope === generation.current && requestId === tracksRequest.current) {
        setTracksError(error instanceof Error ? error.message : "Не удалось загрузить курсы");
      }
    }
  }, []);

  const ensureTrack = useCallback(function loadTrack(trackId: string, refresh = false): Promise<void> {
    if (!alive.current || !trackId) return Promise.resolve();
    const existing = pending.current.get(trackId);
    if (existing) {
      if (refresh) refreshQueued.current.add(trackId);
      return existing;
    }
    if (cache.current[trackId] && !refresh) return Promise.resolve();
    const scope = generation.current;
    const publish = (entry: CourseEntry) => {
      if (scope !== generation.current) return;
      cache.current = Object.assign(emptyCourses(), cache.current, { [trackId]: entry });
      setCourses(cache.current);
    };
    publish({ lessons: cache.current[trackId]?.lessons ?? [], loading: true });
    const request = (async () => {
      try {
        const data = await getLessons(trackId);
        if (data.track !== trackId) throw new Error("Получены материалы другого курса");
        publish({ lessons: data.lessons.map((lesson) => ({ ...lesson, module: getDisplayModule(lesson, trackId) })), loading: false });
      } catch (error) {
        publish({ lessons: cache.current[trackId]?.lessons ?? [], loading: false, error: error instanceof Error ? error.message : "Не удалось загрузить занятия" });
      } finally {
        if (scope === generation.current) {
          pending.current.delete(trackId);
          if (refreshQueued.current.delete(trackId)) void loadTrack(trackId, true);
        }
      }
    })();
    pending.current.set(trackId, request);
    return request;
  }, []);

  useEffect(() => {
    alive.current = true;
    generation.current += 1;
    const loadedTracks = Object.keys(cache.current);
    cache.current = emptyCourses();
    pending.current.clear();
    refreshQueued.current.clear();
    setCourses(emptyCourses());
    void loadTracks();
    loadedTracks.forEach((trackId) => void ensureTrack(trackId));
    return () => { alive.current = false; generation.current += 1; };
  }, [loadTracks, ensureTrack, user?.id, user?.has_active_subscription, user?.subscription_until]);

  useEffect(() => { void ensureTrack(activeTrackId); }, [activeTrackId, ensureTrack]);
  useEffect(() => {
    if (!activeTrackId) return;
    try { window.localStorage.setItem(`pymentor:track:${ownerKey}`, activeTrackId); } catch { /* Storage is optional. */ }
  }, [activeTrackId, ownerKey]);

  const displayLessons = courses[activeTrackId]?.lessons ?? EMPTY_LESSONS;
  const lessonModules = useMemo(() => {
    const available = new Set(displayLessons.map((lesson) => lesson.module));
    return [...PYTHON_MODULE_ORDER.filter((name) => available.has(name)), ...Array.from(available).filter((name) => !PYTHON_MODULE_ORDER.includes(name))];
  }, [displayLessons]);
  const countable = displayLessons.filter((lesson) => (lesson.tasks?.length ?? 0) > 0 || lesson.self_check);
  const progress = countable.length ? Math.round(countable.filter((lesson) => lesson.completed).length / countable.length * 100) : 0;
  const handleLessonCompleted = useCallback((trackId: string) => {
    void ensureTrack(trackId, true);
    void loadTracks();
  }, [ensureTrack, loadTracks]);

  return { tracks, tracksLoaded, tracksError, loadTracks, activeTrackId, setActiveTrackId, courses, ensureTrack, displayLessons, lessonModules, progress,
    isLessonsLoading: courses[activeTrackId]?.loading ?? Boolean(activeTrackId), handleLessonCompleted };
}

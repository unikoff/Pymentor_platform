import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getLessons, getTracks } from "./api";
import { getDisplayModule, lessons as fallbackLessons, PYTHON_MODULE_ORDER, PYTHON_TRACK_NAME } from "./course";
import type { Lesson, Track } from "./types";
import type { UserProfile } from "../../shared/api/contracts";

type LearningUser = Pick<UserProfile, "id" | "has_active_subscription" | "subscription_until"> | null;

export function useLearningCourse(user: LearningUser) {
  const [courseLessons, setCourseLessons] = useState<Lesson[]>(fallbackLessons);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<string>(() => {
    try {
      return window.localStorage.getItem("pymentor-track") ?? "";
    } catch {
      return "";
    }
  });
  const [loadedTrackId, setLoadedTrackId] = useState(PYTHON_TRACK_NAME);
  const [isLessonsLoading, setIsLessonsLoading] = useState(false);
  const lessonsRequestId = useRef(0);

  const isCurrentTrackLoaded = loadedTrackId === activeTrackId;
  const displayLessons = useMemo(
    () => (isCurrentTrackLoaded ? courseLessons : []).map((lesson) => ({ ...lesson, module: getDisplayModule(lesson, activeTrackId) })),
    [activeTrackId, courseLessons, isCurrentTrackLoaded],
  );
  const lessonModules = useMemo(() => {
    const available = new Set(displayLessons.map((lesson) => lesson.module));
    return [
      ...PYTHON_MODULE_ORDER.filter((moduleName) => available.has(moduleName)),
      ...Array.from(available).filter((moduleName) => !PYTHON_MODULE_ORDER.includes(moduleName)),
    ];
  }, [displayLessons]);
  const progress = useMemo(() => {
    const countable = courseLessons.filter((lesson) => (lesson.tasks?.length ?? 0) > 0 || lesson.self_check);
    if (countable.length === 0) {
      return 0;
    }
    const done = countable.filter((lesson) => lesson.completed).length;
    return Math.round((done / countable.length) * 100);
  }, [courseLessons]);

  const loadTracks = useCallback(() => {
    getTracks()
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
      setCourseLessons([]);
      setLoadedTrackId("");
      return;
    }

    const requestedTrackId = activeTrackId;
    const requestId = lessonsRequestId.current + 1;
    lessonsRequestId.current = requestId;
    setIsLessonsLoading(true);
    setLoadedTrackId((loadedTrack) => (loadedTrack === requestedTrackId ? loadedTrack : ""));

    getLessons(requestedTrackId)
      .then((data) => {
        if (requestId !== lessonsRequestId.current || data.track !== requestedTrackId) {
          return;
        }
        setCourseLessons(data.lessons);
        setLoadedTrackId(data.track);
      })
      .catch(() => {
        if (requestId !== lessonsRequestId.current) {
          return;
        }
        setCourseLessons([]);
        setLoadedTrackId(requestedTrackId);
      })
      .finally(() => {
        if (requestId === lessonsRequestId.current) {
          setIsLessonsLoading(false);
        }
      });
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

  return {
    tracks,
    activeTrackId,
    setActiveTrackId,
    isLessonsLoading,
    displayLessons,
    lessonModules,
    progress,
    handleLessonCompleted,
  };
}

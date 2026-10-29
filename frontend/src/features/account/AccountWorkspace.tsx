import { useMemo } from "react";
import { AccountPanel } from "./AccountPanel";
import { useAccountSchedule } from "./useAccountSchedule";
import type { AccountStatisticsData } from "./AccountStatistics";
import type { Track } from "../learning/types";
import type { CourseEntry } from "../learning/useLearningCourse";
import type { CalendarMonth, UserProfile } from "../../shared/api/contracts";

export function AccountWorkspace({ user, tracks, courseEntries, tracksLoaded, calendarMonth, onMonthChange, onLogout }: {
  user: UserProfile; tracks: Track[]; courseEntries: Record<string, CourseEntry>; tracksLoaded: boolean; calendarMonth: CalendarMonth;
  onMonthChange: (month: CalendarMonth) => void; onLogout: () => void;
}) {
  const schedule = useAccountSchedule(user.id, calendarMonth);
  const statisticsData = useMemo<AccountStatisticsData>(() => {
    const courses = tracks.map((track) => ({
      id: track.id,
      title: track.title,
      completed: track.lessons_completed,
      total: track.lessons_countable,
      blocks: (track.blocks ?? []).map((block) => {
        const lessonIds = new Set(block.lesson_ids ?? []);
        const lessons = courseEntries[track.id]?.lessons ?? [];
        return {
          ...block,
          lessons: lessons.filter((lesson) => lessonIds.has(lesson.id)).map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            completed: Boolean(lesson.completed),
          })),
        };
      }),
    }));
    const completedLessons = courses.reduce((total, course) => total + course.completed, 0);
    const totalLessons = courses.reduce((total, course) => total + course.total, 0);
    return {
      tracksLoaded,
      completedLessons,
      totalLessons,
      overallProgress: totalLessons ? Math.round(completedLessons / totalLessons * 100) : 0,
      activeDays: schedule.activitySummary?.total_active_days ?? null,
      currentStreak: schedule.activitySummary?.current_streak ?? null,
      weeklyActivity: schedule.activitySummary?.weekly_activity ?? null,
      weeklyLessonsCompleted: schedule.activitySummary?.weekly_lessons_completed ?? null,
      courses,
    };
  }, [tracks, courseEntries, tracksLoaded, schedule.activitySummary]);

  return <AccountPanel user={user} calendarMonth={calendarMonth} onMonthChange={onMonthChange}
    activityDays={schedule.activityDays} activityTimes={schedule.activityTimes}
    bookingSlots={schedule.bookingSlots} bookingQuota={schedule.bookingQuota}
    onBookSlot={schedule.bookSlot} onCancelSlot={schedule.cancelSlotBooking} onLogout={onLogout}
    statisticsData={statisticsData} />;
}

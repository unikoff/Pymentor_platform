import { Award, BookCheck, Flame, Layers3, Sparkles, Trophy } from "lucide-react";
import type { AccountStatisticsData } from "./AccountStatistics";

export function AccountAchievements({ data }: { data: AccountStatisticsData }) {
  const achievements = [
    {
      id: "first-lesson",
      title: "Первый урок",
      description: "Завершите первое занятие",
      current: data.tracksLoaded ? data.completedLessons : null,
      goal: 1,
      suffix: "",
      icon: BookCheck,
    },
    {
      id: "five-lessons",
      title: "Уверенный старт",
      description: "Пройдите пять занятий",
      current: data.tracksLoaded ? data.completedLessons : null,
      goal: 5,
      suffix: "",
      icon: Sparkles,
    },
    {
      id: "seven-days",
      title: "7 учебных дней",
      description: "Возвращайтесь к занятиям семь дней",
      current: data.activeDays,
      goal: 7,
      suffix: "",
      icon: Award,
    },
    {
      id: "week-streak",
      title: "Неделя без пауз",
      description: "Занимайтесь семь дней подряд",
      current: data.currentStreak,
      goal: 7,
      suffix: "",
      icon: Flame,
    },
    {
      id: "quarter-course",
      title: "Четверть пути",
      description: "Освойте 25% программы",
      current: data.tracksLoaded ? data.overallProgress : null,
      goal: 25,
      suffix: "%",
      icon: Layers3,
    },
    {
      id: "course-complete",
      title: "Финиш",
      description: "Завершите всю программу",
      current: data.tracksLoaded ? data.overallProgress : null,
      goal: 100,
      suffix: "%",
      icon: Trophy,
    },
  ];
  const earnedCount = achievements.filter((item) => item.current !== null && item.current >= item.goal).length;
  const allKnown = achievements.every((item) => item.current !== null);

  return (
    <div className="account-section-stack">
      <div className="account-achievements-summary">
        <span className="account-achievements-count">{allKnown ? `${earnedCount} из ${achievements.length} получено` : "Собираем статистику"}</span>
      </div>

      <div className="account-achievements-grid">
        {achievements.map(({ id, title, description, current, goal, suffix = "", icon: Icon }) => {
          const unlocked = current !== null && current >= goal;
          const progress = current === null ? 0 : Math.min(goal, Math.max(0, current));
          return (
            <article className={`account-surface account-achievement ${unlocked ? "is-earned" : ""}`} key={id}>
              <span className="account-achievement__icon"><Icon size={19} aria-hidden="true" /></span>
              <div className="account-achievement__copy">
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
              <span className={`account-achievement__state ${unlocked ? "is-earned" : ""}`}>
                {current === null ? "Нет данных" : unlocked ? "Получено" : `${current}${suffix} / ${goal}${suffix}`}
              </span>
              <span className="account-achievement__track" aria-hidden="true">
                <i style={{ width: `${current === null ? 0 : progress / goal * 100}%` }} />
              </span>
            </article>
          );
        })}
      </div>
    </div>
  );
}

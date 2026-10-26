import { BarChart3, BookCheck, Clock3, Flame, TrendingUp } from "lucide-react";

export interface AccountStatisticsData {
  completedLessons: number;
  studyMinutes: number;
  activeDays: number;
  currentStreak: number;
  weeklyActivity: { label: string; minutes: number }[];
  courses: { id: string; title: string; completed: number; total: number }[];
}

export function AccountStatistics({ data = null }: { data?: AccountStatisticsData | null }) {
  const metrics = [
    { label: "Завершено занятий", value: data?.completedLessons, unit: "занятий", icon: BookCheck },
    { label: "Время обучения", value: data ? Math.round(data.studyMinutes / 60 * 10) / 10 : undefined, unit: "часов", icon: Clock3 },
    { label: "Дней с обучением", value: data?.activeDays, unit: "дней", icon: TrendingUp },
    { label: "Серия занятий", value: data?.currentStreak, unit: "дней подряд", icon: Flame },
  ];
  const maxMinutes = Math.max(1, ...(data?.weeklyActivity.map((day) => day.minutes) ?? []));

  return (
    <div className="account-section-stack">
      <header className="account-section-heading">
        <div><h2>Статистика обучения</h2><p>Ваш темп, активность и достижения.</p></div>
        {!data && <span className="account-coming-soon">Скоро</span>}
      </header>
      <div className="account-metrics">
        {metrics.map(({ label, value, unit, icon: Icon }) => (
          <section className="account-surface account-metric" key={label}>
            <span className="account-metric__label"><Icon size={17} aria-hidden="true" />{label}</span>
            <strong>{value === undefined ? "—" : value.toLocaleString("ru-RU")}</strong>
            <small>{unit}</small>
          </section>
        ))}
      </div>
      <div className="account-detail-grid">
        <section className="account-surface account-detail-card">
          <header><h3>Активность за неделю</h3><span>Время обучения</span></header>
          {data?.weeklyActivity.length ? (
            <div className="account-week-chart" role="list" aria-label="Время обучения по дням, в минутах">
              {data.weeklyActivity.map((day, index) => (
                <div className="account-week-chart__day" role="listitem" key={`${day.label}-${index}`}>
                  <span>{day.minutes} мин</span>
                  <div className="account-week-chart__track"><i style={{ height: `${Math.max(0, day.minutes) / maxMinutes * 100}%` }} /></div>
                  <small>{day.label}</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="account-empty-state">
              <span className="account-empty-state__icon"><BarChart3 size={26} aria-hidden="true" /></span>
              <strong>Каждое занятие — шаг вперёд</strong>
              <p>Здесь появится график активности и времени, посвящённого обучению.</p>
            </div>
          )}
        </section>
        <section className="account-surface account-detail-card">
          <header><h3>Прогресс по главам</h3><span>Пройденные занятия</span></header>
          {data?.courses.length ? (
            <div className="account-course-list">
              {data.courses.map((course) => (
                <div className="account-course-progress" key={course.id}>
                  <div><strong>{course.title}</strong><span>{course.completed} / {course.total}</span></div>
                  <div className="account-progress-track" role="progressbar" aria-label={course.title} aria-valuemin={0} aria-valuemax={Math.max(1, course.total)} aria-valuenow={Math.max(0, Math.min(course.completed, course.total))}>
                    <span style={{ width: `${course.total > 0 ? Math.max(0, Math.min(100, course.completed / course.total * 100)) : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="account-empty-state">
              <span className="account-empty-state__icon"><BookCheck size={26} aria-hidden="true" /></span>
              <strong>Вся картина вашего прогресса</strong>
              <p>Подробная статистика по главам станет доступна в этом разделе.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

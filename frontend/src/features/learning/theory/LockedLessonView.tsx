import { Lock } from "lucide-react";
import { getLessonAccessLabel } from "../access";
import type { Lesson } from "../types";
import { getLessonHeadingTitle } from "../course";

export function LockedLessonView({
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
      <h1>{getLessonHeadingTitle(lesson)}</h1>
      <p>{lesson.locked_reason || "Это занятие закрыто. Проверьте доступ к аккаунту или подписке."}</p>
      {isGuest && (
        <button className="primary-action" type="button" onClick={onRequireAuth}>
          Войти или зарегистрироваться
        </button>
      )}
    </div>
  );
}

import { createContext, useContext, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";

type NextLessonTarget = {
  title: string;
};

type LessonNavigation = {
  nextLesson?: NextLessonTarget;
  onNextLesson: () => void;
};

const LessonNavigationContext = createContext<LessonNavigation | null>(null);

export function LessonNavigationProvider({
  nextLesson,
  onNextLesson,
  children,
}: LessonNavigation & { children: ReactNode }) {
  return (
    <LessonNavigationContext.Provider value={{ nextLesson, onNextLesson }}>
      {children}
    </LessonNavigationContext.Provider>
  );
}

export function NextLessonLink() {
  const navigation = useContext(LessonNavigationContext);
  if (!navigation?.nextLesson) {
    return null;
  }

  return (
    <button className="lesson-next-link" type="button" onClick={navigation.onNextLesson}>
      <div>
        <span>Следующее занятие</span>
        <strong>{navigation.nextLesson.title}</strong>
      </div>
      <ArrowRight size={22} aria-hidden="true" />
    </button>
  );
}

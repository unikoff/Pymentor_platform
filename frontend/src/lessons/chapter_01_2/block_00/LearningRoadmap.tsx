import { BookOpen, Route } from "lucide-react";
import { Lead, RichHero, RichLesson, Section } from "../../shared";

// Overview page placeholder for the temporary 01.2 course.
export function LearningRoadmap() {
  return (
    <RichLesson>
      <RichHero chip="ГЛАВА 1 · ВЕРСИЯ 01.2" title="Python с нуля" intro="Карта обучения будет добавлена по концепту новой первой главы." tags={[{ icon: <BookOpen size={14} />, label: "45 занятий" }, { icon: <Route size={14} />, label: "4 блока" }]} />
      <Section number="00" title="Карта готовится"><Lead>Пустышка обзора для курса 01.2.</Lead></Section>
    </RichLesson>
  );
}

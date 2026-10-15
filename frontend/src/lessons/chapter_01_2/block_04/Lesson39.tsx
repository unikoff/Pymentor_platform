import { Lead, RichHero, RichLesson, Section } from "../../shared";

// 39. Показываем список задач
export function Lesson39({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero chip={module ?? "Блок 4 · Собираем свой Planner"} title="Показываем список задач" intro="Материал занятия будет добавлен по концепту курса 01.2." />
      <Section number="00" title="Материал готовится">
        <Lead>Пустышка для нового курса 01.2.</Lead>
      </Section>
    </RichLesson>
  );
}

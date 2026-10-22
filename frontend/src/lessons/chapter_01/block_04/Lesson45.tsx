import { Lead, RichHero, RichLesson, Section } from "../../shared";

// 45. Проверяем чистую копию
export function Lesson45({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero chip={module ?? "Блок 4 · Собираем свой Planner"} title="Проверяем чистую копию" intro="Материал занятия будет добавлен по концепту курса." />
      <Section number="00" title="Материал готовится">
        <Lead>Материал занятия будет добавлен.</Lead>
      </Section>
    </RichLesson>
  );
}

import { Lead, RichHero, RichLesson, Section } from "../../shared";

// 30. Название задачи и Git
export function Lesson30({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero chip={module ?? "Блок 3 · Функции и инструменты"} title="Название задачи и Git" intro="Материал занятия будет добавлен по концепту курса 01.2." />
      <Section number="00" title="Материал готовится">
        <Lead>Пустышка для нового курса 01.2.</Lead>
      </Section>
    </RichLesson>
  );
}

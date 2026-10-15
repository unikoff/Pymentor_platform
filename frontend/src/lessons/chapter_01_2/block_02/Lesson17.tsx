import { Lead, RichHero, RichLesson, Section } from "../../shared";

// 17. Список записей и копии
export function Lesson17({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero chip={module ?? "Блок 2 · Условия, данные и циклы"} title="Список записей и копии" intro="Материал занятия будет добавлен по концепту курса 01.2." />
      <Section number="00" title="Материал готовится">
        <Lead>Пустышка для нового курса 01.2.</Lead>
      </Section>
    </RichLesson>
  );
}

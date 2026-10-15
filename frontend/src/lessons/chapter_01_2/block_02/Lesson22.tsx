import { Lead, RichHero, RichLesson, Section } from "../../shared";

// 22. Пишем программу с циклами
export function Lesson22({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero chip={module ?? "Блок 2 · Условия, данные и циклы"} title="Пишем программу с циклами" intro="Материал занятия будет добавлен по концепту курса 01.2." />
      <Section number="00" title="Материал готовится">
        <Lead>Пустышка для нового курса 01.2.</Lead>
      </Section>
    </RichLesson>
  );
}

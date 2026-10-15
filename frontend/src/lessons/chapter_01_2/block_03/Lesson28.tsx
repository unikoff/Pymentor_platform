import { Lead, RichHero, RichLesson, Section } from "../../shared";

// 28. Первый коммит в Git
export function Lesson28({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero chip={module ?? "Блок 3 · Функции и инструменты"} title="Первый коммит в Git" intro="Материал занятия будет добавлен по концепту курса 01.2." />
      <Section number="00" title="Материал готовится">
        <Lead>Пустышка для нового курса 01.2.</Lead>
      </Section>
    </RichLesson>
  );
}

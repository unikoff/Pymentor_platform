import { Lead, RichHero, RichLesson, Section } from "../../shared";

// 34. Ввод и обработка ошибок
export function Lesson34({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero chip={module ?? "Блок 3 · Функции и инструменты"} title="Ввод и обработка ошибок" intro="Материал занятия будет добавлен по концепту курса 01.2." />
      <Section number="00" title="Материал готовится">
        <Lead>Пустышка для нового курса 01.2.</Lead>
      </Section>
    </RichLesson>
  );
}

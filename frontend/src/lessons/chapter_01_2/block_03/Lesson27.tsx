import { Lead, RichHero, RichLesson, Section } from "../../shared";

// 27. Создаём проект и репозиторий
export function Lesson27({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero chip={module ?? "Блок 3 · Функции и инструменты"} title="Создаём проект и репозиторий" intro="Материал занятия будет добавлен по концепту курса 01.2." />
      <Section number="00" title="Материал готовится">
        <Lead>Пустышка для нового курса 01.2.</Lead>
      </Section>
    </RichLesson>
  );
}

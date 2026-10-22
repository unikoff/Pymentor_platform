import { Lead, RichHero, RichLesson, Section } from "../../shared";

export function Lesson29_1({ module }: { module?: string }) {
  return <RichLesson><RichHero chip={module ?? "Блок 6 · Ошибки, модули и JSON"} title="29.1. JSON-представление настоящих задач" intro="Это занятие предусмотрено маршрутом. Материал и практика готовятся." /><Section number="00" title="Материал готовится"><Lead>Здесь появится объяснение JSON и преобразования задач существующего Planner в текст и обратно. Этот шаг пока не содержит готового занятия и не подтверждает освоение темы.</Lead></Section></RichLesson>;
}

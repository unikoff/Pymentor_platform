import { Lead, RichHero, RichLesson, Section } from "../../shared";

export function Lesson37_3({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero chip={module ?? "Блок 8 · Интеграция и тесты"} title="37.3. Виртуальное окружение проекта" intro="Это занятие предусмотрено маршрутом перед установкой pytest. Материал готовится, задания пока нет." />
      <Section number="00" title="Материал готовится">
        <Lead>Здесь разберём, зачем проекту отдельное окружение, как создать .venv в существующем Planner, выбрать его Python в VS Code и не отправить локальные пакеты в Git. Сторонний пакет установим в следующем занятии. Эта заглушка пока не заменяет объяснение настройки.</Lead>
      </Section>
    </RichLesson>
  );
}

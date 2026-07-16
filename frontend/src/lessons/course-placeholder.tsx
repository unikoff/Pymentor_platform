import { BookOpen, Construction, FolderTree } from "lucide-react";
import { Callout, Lead, RichHero, RichLesson, Section } from "./shared";

type PlaceholderLessonProps = {
  courseLabel: string;
  number: number;
  title: string;
  module?: string;
};

export function CourseLessonPlaceholder({ courseLabel, number, title, module }: PlaceholderLessonProps) {
  return (
    <RichLesson>
      <RichHero
        chip={`УРОК ${number.toString().padStart(2, "0")}`}
        title={title}
        intro="Страница урока создана. Основной материал и практика добавляются в рамках производства курса."
        tags={[
          { icon: <BookOpen size={14} />, label: courseLabel },
          ...(module ? [{ icon: <FolderTree size={14} />, label: module }] : []),
        ]}
      />
      <Section number={`${number}.01`} title="Материал готовится">
        <Lead>Здесь появятся теория, примеры, интерактивы и практическая часть урока.</Lead>
        <Callout tone="info">
          Структура страницы и её связь с уроком уже настроены. Можно заполнять этот компонент без изменения импортов или реестра курса.
        </Callout>
      </Section>
    </RichLesson>
  );
}

type PlaceholderOverviewProps = {
  month: string;
  title: string;
  project: string;
};

export function CourseOverviewPlaceholder({ month, title, project }: PlaceholderOverviewProps) {
  return (
    <RichLesson>
      <RichHero
        chip={month}
        title={title}
        intro={`Маршрут подготовлен. Итоговый проект месяца: ${project}.`}
        tags={[{ icon: <Construction size={14} />, label: "контент в производстве" }]}
      />
      <Section number="00" title="Структура готова">
        <Lead>Файлы уроков, модули и точки подключения уже существуют. Сюда можно добавлять содержание по мере готовности.</Lead>
      </Section>
    </RichLesson>
  );
}

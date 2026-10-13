import type { Lesson } from "./types";

export const PYTHON_TRACK_NAME = "Основы Python и мышление программиста";
export const PYTHON_MODULE_ORDER = [
  "00 Обзор",
  "Блок 1. Старт и работа с данными",
  "Блок 2. Текст, логика и повторение",
  "Блок 3. Данные проекта и функции",
  "Блок 4. Сборка и защита проекта",
];

const PYTHON_NAVIGATION: Array<{ id: string; module: string; title: string }> = [
  { id: `${PYTHON_TRACK_NAME}-lesson-01`, module: "00 Обзор", title: "Карта обучения" },
  { id: `${PYTHON_TRACK_NAME}-lesson-03`, module: PYTHON_MODULE_ORDER[1], title: "01. Как Python выполняет программу" },
  { id: `${PYTHON_TRACK_NAME}-lesson-04`, module: PYTHON_MODULE_ORDER[1], title: "02. Терминал, файлы и запуск скрипта" },
  { id: `${PYTHON_TRACK_NAME}-lesson-05`, module: PYTHON_MODULE_ORDER[1], title: "03. Git, GitHub и история изменений" },
  { id: `${PYTHON_TRACK_NAME}-lesson-06`, module: PYTHON_MODULE_ORDER[1], title: "04. Переменные и базовые типы" },
  { id: `${PYTHON_TRACK_NAME}-lesson-07`, module: PYTHON_MODULE_ORDER[1], title: "05. Числа, операции и преобразование типов" },
  { id: `${PYTHON_TRACK_NAME}-lesson-08`, module: PYTHON_MODULE_ORDER[2], title: "06. Строки и форматирование" },
  { id: `${PYTHON_TRACK_NAME}-lesson-09`, module: PYTHON_MODULE_ORDER[2], title: "07. Boolean, сравнения и логика" },
  { id: `${PYTHON_TRACK_NAME}-lesson-10`, module: PYTHON_MODULE_ORDER[2], title: "08. Ветвления if elif else" },
  { id: `${PYTHON_TRACK_NAME}-lesson-11`, module: PYTHON_MODULE_ORDER[2], title: "09. Цикл for и последовательности" },
  { id: `${PYTHON_TRACK_NAME}-lesson-12`, module: PYTHON_MODULE_ORDER[2], title: "10. Цикл while и проверка ввода" },
  { id: `${PYTHON_TRACK_NAME}-lesson-13`, module: PYTHON_MODULE_ORDER[3], title: "11. Списки, кортежи и множества" },
  { id: `${PYTHON_TRACK_NAME}-lesson-14`, module: PYTHON_MODULE_ORDER[3], title: "12. Словари и модель задачи" },
  { id: `${PYTHON_TRACK_NAME}-lesson-15`, module: PYTHON_MODULE_ORDER[3], title: "13. Функции, параметры и return" },
  { id: `${PYTHON_TRACK_NAME}-lesson-16`, module: PYTHON_MODULE_ORDER[3], title: "14. Декомпозиция и чистые функции" },
  { id: `${PYTHON_TRACK_NAME}-lesson-17`, module: PYTHON_MODULE_ORDER[3], title: "15. Ошибки, traceback и отладка" },
  { id: `${PYTHON_TRACK_NAME}-lesson-18`, module: PYTHON_MODULE_ORDER[4], title: "16. Проектное меню и валидация" },
  { id: `${PYTHON_TRACK_NAME}-lesson-19`, module: PYTHON_MODULE_ORDER[4], title: "17. Проект: добавление и вывод задач" },
  { id: `${PYTHON_TRACK_NAME}-lesson-20`, module: PYTHON_MODULE_ORDER[4], title: "18. Проект: поиск, статус и статистика" },
  { id: `${PYTHON_TRACK_NAME}-lesson-21`, module: PYTHON_MODULE_ORDER[4], title: "19. README, .gitignore и публикация" },
  { id: `${PYTHON_TRACK_NAME}-lesson-22`, module: PYTHON_MODULE_ORDER[4], title: "20. Контрольная точка месяца" },
];

export const lessons: Lesson[] = PYTHON_NAVIGATION.map((lesson, index) => ({
  ...lesson,
  duration: index === 0 ? "12 мин" : "45 мин",
  status: index === 1 ? "current" : index === 0 ? "done" : "locked",
  access: "free",
}));

export function getDisplayModule(lesson: Lesson, trackId: string): string {
  if (trackId !== PYTHON_TRACK_NAME) {
    return lesson.module;
  }

  const lessonNumber = Number(lesson.title.match(/^(\d{2})\./)?.[1]);
  if (!Number.isNaN(lessonNumber)) {
    if (lessonNumber <= 5) return PYTHON_MODULE_ORDER[1];
    if (lessonNumber <= 10) return PYTHON_MODULE_ORDER[2];
    if (lessonNumber <= 15) return PYTHON_MODULE_ORDER[3];
    return PYTHON_MODULE_ORDER[4];
  }

  return PYTHON_MODULE_ORDER.includes(lesson.module) ? lesson.module : PYTHON_MODULE_ORDER[0];
}

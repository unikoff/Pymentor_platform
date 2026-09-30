import type { ComponentType } from "react";
import { Lesson01, Lesson02, Lesson03, Lesson04, Lesson05 } from "./block1";
import { Lesson06, Lesson07, Lesson08, Lesson09, Lesson10 } from "./block2";
import { Lesson11, Lesson12, Lesson13, Lesson14, Lesson15 } from "./block3";
import { Lesson16, Lesson17, Lesson18, Lesson19, Lesson20 } from "./block4";
import { LearningRoadmap, MonthTheory } from "./overview";

/**
 * Дизайн-страницы курса «Основы Python и мышление программиста».
 * Ключ — source_file урока из бэкенда (папка трека + имя .md).
 * Всё, что относится к курсу, лежит в этой папке.
 */

const COURSE = "foundations";
const source = (file: string) => {
  const filename = file.split("/").pop() ?? file;
  const lessonNumber = Number(filename.match(/^\d+/)?.[0] ?? 0);
  const block = lessonNumber === 0 ? "block_00" : `block_${String(Math.ceil(lessonNumber / 5)).padStart(2, "0")}`;
  return `${COURSE}/${block}/${filename}`;
};

export const pages: Record<string, ComponentType<{ module?: string }>> = {
  [source('План обучения.md')]: LearningRoadmap,
  [source('Теория месяца.md')]: MonthTheory,
  [source('01 - Как Python выполняет программу.md')]: Lesson01,
  [source('02 - Терминал, файлы и запуск скрипта.md')]: Lesson02,
  [source('03 - Git, GitHub и история изменений.md')]: Lesson03,
  [source('04 - Переменные и базовые типы.md')]: Lesson04,
  [source('05 - Числа, операции и преобразование типов.md')]: Lesson05,
  [source('06 - Строки и форматирование.md')]: Lesson06,
  [source('07 - Boolean, сравнения и логика.md')]: Lesson07,
  [source('08 - Ветвления if elif else.md')]: Lesson08,
  [source('09 - Цикл for и последовательности.md')]: Lesson09,
  [source('10 - Цикл while и проверка ввода.md')]: Lesson10,
  [source('11 - Списки, кортежи и множества.md')]: Lesson11,
  [source('12 - Словари и модель задачи.md')]: Lesson12,
  [source('13 - Функции, параметры и return.md')]: Lesson13,
  [source('14 - Декомпозиция и чистые функции.md')]: Lesson14,
  [source('15 - Ошибки, traceback и отладка.md')]: Lesson15,
  [source('16 - Проектное меню и валидация.md')]: Lesson16,
  [source('17 - Проект добавление и вывод задач.md')]: Lesson17,
  [source('18 - Проект поиск, статус и статистика.md')]: Lesson18,
  [source('19 - README, .gitignore и публикация.md')]: Lesson19,
  [source('20 - Контрольная точка месяца.md')]: Lesson20,
};

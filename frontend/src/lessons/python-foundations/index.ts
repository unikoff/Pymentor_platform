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

const COURSE = "Основы Python и мышление программиста";

export const pages: Record<string, ComponentType<{ module?: string }>> = {
  [`${COURSE}/План обучения.md`]: LearningRoadmap,
  [`${COURSE}/Теория месяца.md`]: MonthTheory,
  [`${COURSE}/01 - Как Python выполняет программу.md`]: Lesson01,
  [`${COURSE}/02 - Терминал, файлы и запуск скрипта.md`]: Lesson02,
  [`${COURSE}/03 - Git, GitHub и история изменений.md`]: Lesson03,
  [`${COURSE}/04 - Переменные и базовые типы.md`]: Lesson04,
  [`${COURSE}/05 - Числа, операции и преобразование типов.md`]: Lesson05,
  [`${COURSE}/06 - Строки и форматирование.md`]: Lesson06,
  [`${COURSE}/07 - Boolean, сравнения и логика.md`]: Lesson07,
  [`${COURSE}/08 - Ветвления if elif else.md`]: Lesson08,
  [`${COURSE}/09 - Цикл for и последовательности.md`]: Lesson09,
  [`${COURSE}/10 - Цикл while и проверка ввода.md`]: Lesson10,
  [`${COURSE}/11 - Списки, кортежи и множества.md`]: Lesson11,
  [`${COURSE}/12 - Словари и модель задачи.md`]: Lesson12,
  [`${COURSE}/13 - Функции, параметры и return.md`]: Lesson13,
  [`${COURSE}/14 - Декомпозиция и чистые функции.md`]: Lesson14,
  [`${COURSE}/15 - Ошибки, traceback и отладка.md`]: Lesson15,
  [`${COURSE}/16 - Проектное меню и валидация.md`]: Lesson16,
  [`${COURSE}/17 - Проект добавление и вывод задач.md`]: Lesson17,
  [`${COURSE}/18 - Проект поиск, статус и статистика.md`]: Lesson18,
  [`${COURSE}/19 - README, .gitignore и публикация.md`]: Lesson19,
  [`${COURSE}/20 - Контрольная точка месяца.md`]: Lesson20,
};

import type { ComponentType } from "react";
import { Lesson01, Lesson02, Lesson03, Lesson03_1, Lesson03_2, Lesson03_3, Lesson04, Lesson05 } from "./block1";
import { Lesson06, Lesson07, Lesson08, Lesson09, Lesson09_1, Lesson10, Lesson10_1 } from "./block2";
import { Lesson11, Lesson11_1, Lesson12, Lesson12_1, Lesson13, Lesson13_1, Lesson14, Lesson15 } from "./block3";
import { Lesson16, Lesson16_1, Lesson17, Lesson17_1, Lesson18, Lesson18_1, Lesson18_2, Lesson19, Lesson19_1, Lesson20 } from "./block4";
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
  [source('03.1 - Состояния файлов, staging и diff.md')]: Lesson03_1,
  [source('03.2 - GitHub, remote, авторизация и push.md')]: Lesson03_2,
  [source('03.3 - Clone и получение своего проекта заново.md')]: Lesson03_3,
  [source('04 - Переменные и базовые типы.md')]: Lesson04,
  [source('05 - Числа, операции и преобразование типов.md')]: Lesson05,
  [source('06 - Строки и форматирование.md')]: Lesson06,
  [source('07 - Boolean, сравнения и логика.md')]: Lesson07,
  [source('08 - Ветвления if elif else.md')]: Lesson08,
  [source('09 - Цикл for и последовательности.md')]: Lesson09,
  [source('09.1 - Накопление, счётчик и итог после цикла.md')]: Lesson09_1,
  [source('10 - Цикл while и проверка ввода.md')]: Lesson10,
  [source('10.1 - Повторный ввод и безопасный выход.md')]: Lesson10_1,
  [source('11 - Списки, кортежи и множества.md')]: Lesson11,
  [source('11.1 - Другие коллекции, текст и распаковка.md')]: Lesson11_1,
  [source('12 - Словари и модель задачи.md')]: Lesson12,
  [source('12.1 - Список словарей и границы копирования.md')]: Lesson12_1,
  [source('13 - Функции, параметры и return.md')]: Lesson13,
  [source('13.1 - Результат функции, локальные имена и состояние.md')]: Lesson13_1,
  [source('14 - Декомпозиция и чистые функции.md')]: Lesson14,
  [source('15 - Ошибки, traceback и отладка.md')]: Lesson15,
  [source('16 - Проектное меню и валидация.md')]: Lesson16,
  [source('16.1 - Ввод данных и границы отказа.md')]: Lesson16_1,
  [source('17 - Проект добавление и вывод задач.md')]: Lesson17,
  [source('17.1 - Полный вывод и пустое состояние.md')]: Lesson17_1,
  [source('18 - Проект поиск, статус и статистика.md')]: Lesson18,
  [source('18.1 - Поиск по части названия.md')]: Lesson18_1,
  [source('18.2 - Статистика и проверка согласованности.md')]: Lesson18_2,
  [source('19 - README, .gitignore и публикация.md')]: Lesson19,
  [source('19.1 - Проверка передачи из чистой копии.md')]: Lesson19_1,
  [source('20 - Контрольная точка месяца.md')]: Lesson20,
};

import type { ComponentType } from "react";
import { LearningRoadmap } from "./block_00/LearningRoadmap";
import { MonthTheory } from "./block_00/MonthTheory";
import { Lesson01 } from "./block_01/Lesson01";
import { Lesson02 } from "./block_01/Lesson02";
import { Lesson03 } from "./block_01/Lesson03";
import { Lesson03_1 } from "./block_01/Lesson03_1";
import { Lesson03_2 } from "./block_01/Lesson03_2";
import { Lesson03_3 } from "./block_01/Lesson03_3";
import { Lesson04 } from "./block_01/Lesson04";
import { Lesson05 } from "./block_01/Lesson05";
import { Lesson06 } from "./block_02/Lesson06";
import { Lesson07 } from "./block_02/Lesson07";
import { Lesson08 } from "./block_02/Lesson08";
import { Lesson09 } from "./block_02/Lesson09";
import { Lesson09_1 } from "./block_02/Lesson09_1";
import { Lesson10 } from "./block_02/Lesson10";
import { Lesson10_1 } from "./block_02/Lesson10_1";
import { Lesson11 } from "./block_03/Lesson11";
import { Lesson11_1 } from "./block_03/Lesson11_1";
import { Lesson12 } from "./block_03/Lesson12";
import { Lesson12_1 } from "./block_03/Lesson12_1";
import { Lesson13 } from "./block_03/Lesson13";
import { Lesson13_1 } from "./block_03/Lesson13_1";
import { Lesson14 } from "./block_03/Lesson14";
import { Lesson15 } from "./block_03/Lesson15";
import { Lesson16 } from "./block_04/Lesson16";
import { Lesson16_1 } from "./block_04/Lesson16_1";
import { Lesson17 } from "./block_04/Lesson17";
import { Lesson17_1 } from "./block_04/Lesson17_1";
import { Lesson18 } from "./block_04/Lesson18";
import { Lesson18_1 } from "./block_04/Lesson18_1";
import { Lesson18_2 } from "./block_04/Lesson18_2";
import { Lesson19 } from "./block_04/Lesson19";
import { Lesson19_1 } from "./block_04/Lesson19_1";
import { Lesson20 } from "./block_04/Lesson20";

/**
 * Дизайн-страницы курса «Основы Python и мышление программиста».
 * Ключ — source_file урока из бэкенда (папка трека, блок и имя .md).
 * Всё, что относится к курсу, лежит в этой папке.
 */

const COURSE = "chapter_01";
const source = (file: string) => {
  const parts = file.split("/");
  const filename = parts[parts.length - 1] ?? file;
  const lessonNumber = Number(filename.match(/^\d+/)?.[0] ?? 0);
  const block = parts.length > 1
    ? parts[parts.length - 2]
    : lessonNumber === 0
      ? "block_00"
      : `block_${String(Math.ceil(lessonNumber / 5)).padStart(2, "0")}`;
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

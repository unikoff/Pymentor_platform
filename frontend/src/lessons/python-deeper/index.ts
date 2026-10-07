import type { ComponentType } from "react";
import { Lesson21 } from "./block_05/Lesson21";
import { Lesson22 } from "./block_05/Lesson22";
import { Lesson23 } from "./block_05/Lesson23";
import { Lesson24 } from "./block_05/Lesson24";
import { Lesson24_1 } from "./block_05/Lesson24_1";
import { Lesson25 } from "./block_05/Lesson25";
import { Lesson26 } from "./block_05/Lesson26";
import { Lesson27_1 } from "./block_05/Lesson27_1";
import { Lesson26_1 } from "./block_05/Lesson26_1";
import { Lesson27 } from "./block_05/Lesson27";
import { Lesson28 } from "./block_06/Lesson28";
import { Lesson29 } from "./block_06/Lesson29";
import { Lesson30 } from "./block_06/Lesson30";
import { Lesson30_1 } from "./block_06/Lesson30_1";
import { Lesson31 } from "./block_06/Lesson31";
import { Lesson32 } from "./block_06/Lesson32";
import { Lesson35 as Lesson35Persistence } from "./block_06/Lesson35";
import { Lesson35_2 } from "./block_06/Lesson35_2";
import { Lesson33 } from "./block_06/Lesson33";
import { Lesson34 } from "./block_06/Lesson34";
import { Lesson35_1 } from "./block_06/Lesson35_1";
import { Lesson36 } from "./block_07/Lesson36";
import { Lesson36_1 } from "./block_07/Lesson36_1";
import { Lesson36_2 } from "./block_07/Lesson36_2";
import { Lesson37 } from "./block_07/Lesson37";
import { Lesson37_1 } from "./block_07/Lesson37_1";
import { Lesson37_2 } from "./block_07/Lesson37_2";
import { Lesson38 } from "./block_07/Lesson38";
import { Lesson38_1 } from "./block_07/Lesson38_1";
import { Lesson38_2 } from "./block_07/Lesson38_2";
import { Lesson39 } from "./block_08/Lesson39";
import { Lesson39_1 } from "./block_08/Lesson39_1";
import { Lesson40 } from "./block_08/Lesson40";
import { Lesson40_1 } from "./block_08/Lesson40_1";
import { Lesson40_2 } from "./block_08/Lesson40_2";
import { Lesson41 } from "./block_08/Lesson41";
import { Lesson41_1 } from "./block_08/Lesson41_1";
import { Lesson41_2 } from "./block_08/Lesson41_2";
import { Lesson42 } from "./block_08/Lesson42";
import { Lesson42_1 } from "./block_08/Lesson42_1";
import { Lesson43 } from "./block_08/Lesson43";
import { Lesson44 } from "./block_08/Lesson44";
import { LearningRoadmap } from "./block_00/LearningRoadmap";
import { MonthTheory } from "./block_00/MonthTheory";

const COURSE_FOLDER = "chapter_02";
const LESSON_BLOCKS = [[21, 27, "block_05"], [28, 35, "block_06"], [36, 38, "block_07"], [39, 44, "block_08"]] as const;
const source = (file: string) => {
  const filename = file.split("/").pop() ?? file;
  const lessonNumber = Number(filename.match(/^\d+/)?.[0] ?? 0);
  const block = LESSON_BLOCKS.find(([first, last]) => lessonNumber >= first && lessonNumber <= last)?.[2] ?? "block_00";
  return `${COURSE_FOLDER}/${block}/${filename}`;
};
const sourceInBlock = (block: string, file: string) => `${COURSE_FOLDER}/${block}/${file}`;
export const pages: Record<string, ComponentType<{ module?: string }>> = {
  [source("План обучения.md")]: LearningRoadmap,
  [source("Теория месяца.md")]: MonthTheory,
  [source("21 - Переход от первого месяца, разбираем Console Planner.md")]: Lesson21,
  [source("22 - Функция как контракт, вход, правило, результат.md")]: Lesson22,
  [source("23 - Позиционные, именованные аргументы и значения по умолчанию.md")]: Lesson23,
  [source("24 - Область видимости и изменяемые объекты.md")]: Lesson24,
  [source("24.1 - Состояние запуска и изменяемый default.md")]: Lesson24_1,
  [source("25 - args, kwargs и распаковка.md")]: Lesson25,
  [source("26 - Функция как значение, callbacks и замыкания.md")]: Lesson26,
  [sourceInBlock("block_05", "27.1 - Синтаксис @ и границы применения.md")]: Lesson27_1,
  [source("26.1 - Вложенная функция и замыкание.md")]: Lesson26_1,
  [sourceInBlock("block_05", "27 - Диагностическая обёртка существующей функции.md")]: Lesson27,
  [source("28 - Как возникает исключение и как читать traceback.md")]: Lesson28,
  [source("29 - try и конкретные except.md")]: Lesson29,
  [source("30 - else, finally, raise и собственные исключения.md")]: Lesson30,
  [sourceInBlock("block_06", "30.1 - Собственная ошибка и обязательное получение задачи.md")]: Lesson30_1,
  [source("31 - Модули, импорты и точка входа.md")]: Lesson31,
  [source("32 - Пакеты, init.py и направление импортов.md")]: Lesson32,
  [sourceInBlock("block_06", "35.2 - Ошибки хранения и сохранность данных.md")]: Lesson35_2,
  [source("33 - Отделить CLI от сборки.md")]: Lesson33,
  [source("34 - Файл как ресурс, путь, режим, with и UTF-8.md")]: Lesson34,
  [sourceInBlock("block_06", "35 - Подключить загрузку и сохранение после изменения.md")]: Lesson35Persistence,
  [sourceInBlock("block_06", "35.1 - Проверить форму восстановленного состояния.md")]: Lesson35_1,
  [source("36 - Класс, объект, init и self.md")]: Lesson36,
  [source("36.1 - Обычная Task в настоящем пакете.md")]: Lesson36_1,
  [sourceInBlock("block_07", "36.2 - Экземпляр, атрибут класса и общие ссылки.md")]: Lesson36_2,
  [source("37 - Атрибуты, методы и str.md")]: Lesson37,
  [source("37.1 - Представление, инкапсуляция и вычисляемое property.md")]: Lesson37_1,
  [source("37.2 - Task на границе словаря.md")]: Lesson37_2,
  [source("38 - Инкапсуляция, геттеры, сеттеры и property.md")]: Lesson38,
  [sourceInBlock("block_07", "38.1 - Независимые tags и совместимость записи.md")]: Lesson38_1,
  [sourceInBlock("block_07", "38.2 - Выбор формы и базовая композиция.md")]: Lesson38_2,
  [source("39 - Включить Task в существующий Planner.md")]: Lesson39,
  [sourceInBlock("block_08", "39.1 - JsonStorage вокруг готового хранения.md")]: Lesson39_1,
  [source("40 - MemoryStorage и один договор.md")]: Lesson40,
  [sourceInBlock("block_08", "40.1 - PlannerService и перенос чтения.md")]: Lesson40_1,
  [source("40.2 - Единое изменение и тонкий CLI.md")]: Lesson40_2,
  [source("41 - Первые тесты через pytest.md")]: Lesson41,
  [sourceInBlock("block_08", "41.1 - Свежая fixture и параметризация.md")]: Lesson41_1,
  [sourceInBlock("block_08", "41.2 - Файловая интеграция через tmp_path.md")]: Lesson41_2,
  [source("42 - SOLID и проверяемая граница CLI.md")]: Lesson42,
  [source("42.1 - Регрессия команд, сохранений и безопасной сборки.md")]: Lesson42_1,
  [source("43 - Финальный проект 2, модель, сервисы и хранение.md")]: Lesson43,
  [source("44 - Финальный проект 3, тесты, README, GitHub Release и защита.md")]: Lesson44,
};

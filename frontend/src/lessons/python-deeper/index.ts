import type { ComponentType } from "react";
import { Lesson21 } from "./block_05/Lesson21";
import { Lesson22 } from "./block_05/Lesson22";
import { Lesson23 } from "./block_05/Lesson23";
import { Lesson24 } from "./block_05/Lesson24";
import { Lesson25 } from "./block_05/Lesson25";
import { Lesson26 } from "./block_05/Lesson26";
import { Lesson27 } from "./block_06/Lesson27";
import { Lesson28 } from "./block_06/Lesson28";
import { Lesson29 } from "./block_06/Lesson29";
import { Lesson30 } from "./block_06/Lesson30";
import { Lesson31 } from "./block_06/Lesson31";
import { Lesson32 } from "./block_06/Lesson32";
import { Lesson33 } from "./block_07/Lesson33";
import { Lesson34 } from "./block_07/Lesson34";
import { Lesson35 } from "./block_07/Lesson35";
import { Lesson36 } from "./block_07/Lesson36";
import { Lesson37 } from "./block_07/Lesson37";
import { Lesson38 } from "./block_07/Lesson38";
import { Lesson39 } from "./block_08/Lesson39";
import { Lesson40 } from "./block_08/Lesson40";
import { Lesson41 } from "./block_08/Lesson41";
import { Lesson42 } from "./block_08/Lesson42";
import { Lesson43 } from "./block_08/Lesson43";
import { Lesson44 } from "./block_08/Lesson44";
import { LearningRoadmap } from "./block_00/LearningRoadmap";
import { MonthTheory } from "./block_00/MonthTheory";

const COURSE_FOLDER = "deeper";
const LESSON_BLOCKS = [[21, 26, "block_05"], [27, 32, "block_06"], [33, 38, "block_07"], [39, 44, "block_08"]] as const;
const source = (file: string) => {
  const filename = file.split("/").pop() ?? file;
  const lessonNumber = Number(filename.match(/^\d+/)?.[0] ?? 0);
  const block = LESSON_BLOCKS.find(([first, last]) => lessonNumber >= first && lessonNumber <= last)?.[2] ?? "block_00";
  return `${COURSE_FOLDER}/${block}/${filename}`;
};

export const pages: Record<string, ComponentType<{ module?: string }>> = {
  [source("План обучения.md")]: LearningRoadmap,
  [source("Теория месяца.md")]: MonthTheory,
  [source("21 - Переход от первого месяца, разбираем Console Planner.md")]: Lesson21,
  [source("22 - Функция как контракт, вход, правило, результат.md")]: Lesson22,
  [source("23 - Позиционные, именованные аргументы и значения по умолчанию.md")]: Lesson23,
  [source("24 - Область видимости и изменяемые объекты.md")]: Lesson24,
  [source("25 - args, kwargs и распаковка.md")]: Lesson25,
  [source("26 - Функция как значение, callbacks и замыкания.md")]: Lesson26,
  [source("27 - Декораторы, от обычной обёртки к синтаксису at.md")]: Lesson27,
  [source("28 - Как возникает исключение и как читать traceback.md")]: Lesson28,
  [source("29 - try и конкретные except.md")]: Lesson29,
  [source("30 - else, finally, raise и собственные исключения.md")]: Lesson30,
  [source("31 - Модули, импорты и точка входа.md")]: Lesson31,
  [source("32 - Пакеты, init.py и направление импортов.md")]: Lesson32,
  [source("33 - Ответственность файлов небольшого проекта.md")]: Lesson33,
  [source("34 - Файлы, pathlib, with и кодировка.md")]: Lesson34,
  [source("35 - JSON, сериализация и десериализация.md")]: Lesson35,
  [source("36 - Класс, объект, init и self.md")]: Lesson36,
  [source("37 - Атрибуты, методы и str.md")]: Lesson37,
  [source("38 - Инкапсуляция, геттеры, сеттеры и property.md")]: Lesson38,
  [source("39 - dataclass, композиция и границы наследования.md")]: Lesson39,
  [source("40 - SOLID на примере StudyHub.md")]: Lesson40,
  [source("41 - Первые тесты через pytest.md")]: Lesson41,
  [source("42 - Финальный проект 1, архитектура Persistent Planner.md")]: Lesson42,
  [source("43 - Финальный проект 2, модель, сервисы и хранение.md")]: Lesson43,
  [source("44 - Финальный проект 3, тесты, README, GitHub Release и защита.md")]: Lesson44,
};

import type { ComponentType } from "react";
import { Lesson21, Lesson22, Lesson23, Lesson24, Lesson25, Lesson26 } from "./block5";
import { Lesson27, Lesson28, Lesson29, Lesson30, Lesson31, Lesson32 } from "./block6";
import { Lesson33, Lesson34, Lesson35, Lesson36, Lesson37, Lesson38 } from "./block7";
import { Lesson39, Lesson40, Lesson41, Lesson42, Lesson43, Lesson44 } from "./block8";
import { LearningRoadmap, MonthTheory } from "./overview";

const COURSE_FOLDER = "Python глубже, файлы и структура небольшого проекта";
const source = (file: string) => `${COURSE_FOLDER}/${file}`;

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

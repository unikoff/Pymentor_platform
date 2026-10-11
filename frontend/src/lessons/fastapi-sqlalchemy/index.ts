import type { ComponentType } from "react";
import { Lesson69 } from "./block_13/Lesson69";
import { Lesson70 } from "./block_13/Lesson70";
import { Lesson71 } from "./block_13/Lesson71";
import { Lesson72 } from "./block_13/Lesson72";
import { Lesson73 } from "./block_13/Lesson73";
import { Lesson74 } from "./block_13/Lesson74";
import { Lesson75 } from "./block_13/Lesson75";
import { Lesson76 } from "./block_13/Lesson76";
import { Lesson77 } from "./block_13/Lesson77";
import { Lesson78 } from "./block_14/Lesson78";
import { Lesson79 } from "./block_14/Lesson79";
import { Lesson80 } from "./block_14/Lesson80";
import { Lesson81 } from "./block_14/Lesson81";
import { Lesson82 } from "./block_14/Lesson82";
import { Lesson83 } from "./block_14/Lesson83";
import { Lesson84 } from "./block_14/Lesson84";
import { Lesson85 } from "./block_14/Lesson85";
import { Lesson86 } from "./block_14/Lesson86";
import { Lesson87 } from "./block_14/Lesson87";
import { Lesson88 } from "./block_14/Lesson88";
import { Lesson89 } from "./block_14/Lesson89";
import { Lesson90 } from "./block_15/Lesson90";
import { Lesson91 } from "./block_15/Lesson91";
import { Lesson92 } from "./block_15/Lesson92";
import { Lesson93 } from "./block_15/Lesson93";
import { Lesson94 } from "./block_15/Lesson94";
import { Lesson95 } from "./block_15/Lesson95";
import { Lesson96 } from "./block_15/Lesson96";
import { Lesson97 } from "./block_15/Lesson97";
import { Lesson98 } from "./block_15/Lesson98";
import { Lesson99 } from "./block_15/Lesson99";
import { Lesson100 } from "./block_16/Lesson100";
import { Lesson101 } from "./block_16/Lesson101";
import { Lesson102 } from "./block_16/Lesson102";
import { Lesson103 } from "./block_16/Lesson103";
import { Lesson104 } from "./block_16/Lesson104";
import { Lesson105 } from "./block_16/Lesson105";
import { LearningRoadmap } from "./block_00/LearningRoadmap";
import { MonthTheory } from "./block_00/MonthTheory";

const COURSE_FOLDER = "chapter_04";
const LESSON_BLOCKS = [[69, 77, "block_13"], [78, 89, "block_14"], [90, 99, "block_15"], [100, 105, "block_16"]] as const;
const source = (file: string) => {
  const filename = file.split("/").pop() ?? file;
  const lessonNumber = Number(filename.match(/^\d+/)?.[0] ?? 0);
  const block = LESSON_BLOCKS.find(([first, last]) => lessonNumber >= first && lessonNumber <= last)?.[2] ?? "block_00";
  return `${COURSE_FOLDER}/${block}/${filename}`;
};

export const pages: Record<string, ComponentType<{ module?: string }>> = {
  [source("00 Обзор/План обучения.md")]: LearningRoadmap,
  [source("00 Обзор/Теория месяца.md")]: MonthTheory,
  [source("Блок 13 - FastAPI как цельное приложение (9 занятий)/69 - Путь HTTP-запроса внутри FastAPI.md")]: Lesson69,
  [source("Блок 13 - FastAPI как цельное приложение (9 занятий)/70 - Окружение и .env.md")]: Lesson70,
  [source("Блок 13 - FastAPI как цельное приложение (9 занятий)/71 - Централизованные настройки.md")]: Lesson71,
  [source("Блок 13 - FastAPI как цельное приложение (9 занятий)/72 - Depends — получение готового сервиса.md")]: Lesson72,
  [source("Блок 13 - FastAPI как цельное приложение (9 занятий)/73 - Заголовки, cookies и Response.md")]: Lesson73,
  [source("Блок 13 - FastAPI как цельное приложение (9 занятий)/74 - Middleware и CORS.md")]: Lesson74,
  [source("Блок 13 - FastAPI как цельное приложение (9 занятий)/75 - Headers и Response.md")]: Lesson75,
  [source("Блок 13 - FastAPI как цельное приложение (9 занятий)/76 - Cookie-настройка представления.md")]: Lesson76,
  [source("Блок 13 - FastAPI как цельное приложение (9 занятий)/77 - Границы доверия и безопасность cookie.md")]: Lesson77,
  [source("Блок 14 - Подготовка базы и новой границы хранения (12 занятий)/78 - Почему одного JSON становится мало.md")]: Lesson78,
  [source("Блок 14 - Подготовка базы и новой границы хранения (12 занятий)/79 - SQLite и минимальный SQL.md")]: Lesson79,
  [source("Блок 14 - Подготовка базы и новой границы хранения (12 занятий)/80 - Engine и адрес базы.md")]: Lesson80,
  [source("Блок 14 - Подготовка базы и новой границы хранения (12 занятий)/81 - ORM-модель и исходная схема.md")]: Lesson81,
  [source("Блок 14 - Подготовка базы и новой границы хранения (12 занятий)/82 - Session — первая сохранённая запись.md")]: Lesson82,
  [source("Блок 14 - Подготовка базы и новой границы хранения (12 занятий)/83 - Транзакция, отмена и закрытие.md")]: Lesson83,
  [source("Блок 14 - Подготовка базы и новой границы хранения (12 занятий)/84 - SELECT и преобразование результата.md")]: Lesson84,
  [source("Блок 14 - Подготовка базы и новой границы хранения (12 занятий)/85 - Новая граница хранения — чтение.md")]: Lesson85,
  [source("Блок 14 - Подготовка базы и новой границы хранения (12 занятий)/86 - Новая граница хранения — изменения.md")]: Lesson86,
  [source("Блок 14 - Подготовка базы и новой границы хранения (12 занятий)/87 - SQL-репозиторий чтения.md")]: Lesson87,
  [source("Блок 14 - Подготовка базы и новой границы хранения (12 занятий)/88 - Ресурс на запрос и ресурс на команду.md")]: Lesson88,
  [source("Блок 14 - Подготовка базы и новой границы хранения (12 занятий)/89 - Однократный перенос прежних задач.md")]: Lesson89,
  [source("Блок 15 - Полный SQL-путь и единое переключение (10 занятий)/90 - Создание и серверный id из базы.md")]: Lesson90,
  [source("Блок 15 - Полный SQL-путь и единое переключение (10 занятий)/91 - PUT — замена без потери внутренних данных.md")]: Lesson91,
  [source("Блок 15 - Полный SQL-путь и единое переключение (10 занятий)/92 - PATCH — только переданные изменения.md")]: Lesson92,
  [source("Блок 15 - Полный SQL-путь и единое переключение (10 занятий)/93 - Завершение и удаление.md")]: Lesson93,
  [source("Блок 15 - Полный SQL-путь и единое переключение (10 занятий)/94 - Выборка и статистика запросами.md")]: Lesson94,
  [source("Блок 15 - Полный SQL-путь и единое переключение (10 занятий)/95 - Поиск в базе без смены его смысла.md")]: Lesson95,
  [source("Блок 15 - Полный SQL-путь и единое переключение (10 занятий)/96 - CLI — отдельный ресурс на команду.md")]: Lesson96,
  [source("Блок 15 - Полный SQL-путь и единое переключение (10 занятий)/97 - Готовность к переключению.md")]: Lesson97,
  [source("Блок 15 - Полный SQL-путь и единое переключение (10 занятий)/98 - Единое переключение JSON → SQLite.md")]: Lesson98,
  [source("Блок 15 - Полный SQL-путь и единое переключение (10 занятий)/99 - Удаление JSON-backend и проверка независимости.md")]: Lesson99,
  [source("Блок 16 - Надёжность, запросы и передача (6 занятий)/100 - Ошибка БД и граница ответственности.md")]: Lesson100,
  [source("Блок 16 - Надёжность, запросы и передача (6 занятий)/101 - Проверки отказов и восстановление работы.md")]: Lesson101,
  [source("Блок 16 - Надёжность, запросы и передача (6 занятий)/102 - Какие SQL-запросы делает Planner.md")]: Lesson102,
  [source("Блок 16 - Надёжность, запросы и передача (6 занятий)/103 - Обоснованное улучшение запросов.md")]: Lesson103,
  [source("Блок 16 - Надёжность, запросы и передача (6 занятий)/104 - Сквозная проверка готового продукта.md")]: Lesson104,
  [source("Блок 16 - Надёжность, запросы и передача (6 занятий)/105 - Передача работающего DB Planner.md")]: Lesson105,
};

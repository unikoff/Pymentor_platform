import type { ComponentType } from "react";
import { Lesson69 } from "./block_13/Lesson69";
import { Lesson70 } from "./block_13/Lesson70";
import { Lesson71 } from "./block_13/Lesson71";
import { Lesson72 } from "./block_13/Lesson72";
import { Lesson73 } from "./block_13/Lesson73";
import { Lesson74 } from "./block_13/Lesson74";
import { Lesson75 } from "./block_14/Lesson75";
import { Lesson76 } from "./block_14/Lesson76";
import { Lesson77 } from "./block_14/Lesson77";
import { Lesson78 } from "./block_14/Lesson78";
import { Lesson79 } from "./block_14/Lesson79";
import { Lesson80 } from "./block_14/Lesson80";
import { Lesson81 } from "./block_15/Lesson81";
import { Lesson82 } from "./block_15/Lesson82";
import { Lesson83 } from "./block_15/Lesson83";
import { Lesson84 } from "./block_15/Lesson84";
import { Lesson85 } from "./block_15/Lesson85";
import { Lesson86 } from "./block_15/Lesson86";
import { Lesson87 } from "./block_16/Lesson87";
import { Lesson88 } from "./block_16/Lesson88";
import { Lesson89 } from "./block_16/Lesson89";
import { Lesson90 } from "./block_16/Lesson90";
import { Lesson91 } from "./block_16/Lesson91";
import { Lesson92 } from "./block_16/Lesson92";
import { LearningRoadmap } from "./block_00/LearningRoadmap";
import { MonthTheory } from "./block_00/MonthTheory";

const COURSE_FOLDER = "chapter_04";
const LESSON_BLOCKS = [[69, 74, "block_13"], [75, 80, "block_14"], [81, 86, "block_15"], [87, 92, "block_16"]] as const;
const source = (file: string) => {
  const filename = file.split("/").pop() ?? file;
  const lessonNumber = Number(filename.match(/^\d+/)?.[0] ?? 0);
  const block = LESSON_BLOCKS.find(([first, last]) => lessonNumber >= first && lessonNumber <= last)?.[2] ?? "block_00";
  return `${COURSE_FOLDER}/${block}/${filename}`;
};

export const pages: Record<string, ComponentType<{ module?: string }>> = {
  [source("00 Обзор/План обучения.md")]: LearningRoadmap,
  [source("00 Обзор/Теория месяца.md")]: MonthTheory,
  [source("Блок 13 - FastAPI как цельное приложение (6 занятий)/69 - Путь HTTP-запроса внутри FastAPI.md")]: Lesson69,
  [source("Блок 13 - FastAPI как цельное приложение (6 занятий)/70 - Первая зависимость через Depends.md")]: Lesson70,
  [source("Блок 13 - FastAPI как цельное приложение (6 занятий)/71 - Annotated и цепочки зависимостей.md")]: Lesson71,
  [source("Блок 13 - FastAPI как цельное приложение (6 занятий)/72 - Настройки и переменные окружения.md")]: Lesson72,
  [source("Блок 13 - FastAPI как цельное приложение (6 занятий)/73 - Заголовки, cookies и Response.md")]: Lesson73,
  [source("Блок 13 - FastAPI как цельное приложение (6 занятий)/74 - Middleware и CORS.md")]: Lesson74,
  [source("Блок 14 - SQLite и основы SQLAlchemy (6 занятий)/75 - Зачем API нужна база данных.md")]: Lesson75,
  [source("Блок 14 - SQLite и основы SQLAlchemy (6 занятий)/76 - Engine, URL базы и подключение.md")]: Lesson76,
  [source("Блок 14 - SQLite и основы SQLAlchemy (6 занятий)/77 - Declarative Base и ORM-модель.md")]: Lesson77,
  [source("Блок 14 - SQLite и основы SQLAlchemy (6 занятий)/78 - Создание таблиц и просмотр SQLite.md")]: Lesson78,
  [source("Блок 14 - SQLite и основы SQLAlchemy (6 занятий)/79 - Session, add, commit, refresh, rollback, close.md")]: Lesson79,
  [source("Блок 14 - SQLite и основы SQLAlchemy (6 занятий)/80 - get_db и первая запись из FastAPI.md")]: Lesson80,
  [source("Блок 15 - CRUD и запросы SQLAlchemy (6 занятий)/81 - SELECT, список и объект по id.md")]: Lesson81,
  [source("Блок 15 - CRUD и запросы SQLAlchemy (6 занятий)/82 - Создание, обновление и удаление.md")]: Lesson82,
  [source("Блок 15 - CRUD и запросы SQLAlchemy (6 занятий)/83 - WHERE и динамические фильтры.md")]: Lesson83,
  [source("Блок 15 - CRUD и запросы SQLAlchemy (6 занятий)/84 - Сортировка, limit, offset и пагинация.md")]: Lesson84,
  [source("Блок 15 - CRUD и запросы SQLAlchemy (6 занятий)/85 - COUNT, EXISTS и уникальность.md")]: Lesson85,
  [source("Блок 15 - CRUD и запросы SQLAlchemy (6 занятий)/86 - Транзакция, IntegrityError и rollback.md")]: Lesson86,
  [source("Блок 16 - Связи, Alembic и Database API (6 занятий)/87 - Foreign key и one-to-many.md")]: Lesson87,
  [source("Блок 16 - Связи, Alembic и Database API (6 занятий)/88 - relationship и связанные объекты.md")]: Lesson88,
  [source("Блок 16 - Связи, Alembic и Database API (6 занятий)/89 - Загрузка связей и первое N+1.md")]: Lesson89,
  [source("Блок 16 - Связи, Alembic и Database API (6 занятий)/90 - Alembic, первая миграция.md")]: Lesson90,
  [source("Блок 16 - Связи, Alembic и Database API (6 занятий)/91 - Изменение схемы и downgrade.md")]: Lesson91,
  [source("Блок 16 - Связи, Alembic и Database API (6 занятий)/92 - Итоговый проект этапа 4.md")]: Lesson92,
};

import type { ComponentType } from "react";
import { Lesson69, Lesson70, Lesson71, Lesson72, Lesson73, Lesson74 } from "./block13";
import { Lesson75, Lesson76, Lesson77, Lesson78, Lesson79, Lesson80 } from "./block14";
import { Lesson81, Lesson82, Lesson83, Lesson84, Lesson85, Lesson86 } from "./block15";
import { Lesson87, Lesson88, Lesson89, Lesson90, Lesson91, Lesson92 } from "./block16";
import { LearningRoadmap, MonthTheory } from "./overview";

const COURSE_FOLDER = "FastAPI, SQLite и SQLAlchemy - StudyHub Database API";
const source = (file: string) => `${COURSE_FOLDER}/${file}`;

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

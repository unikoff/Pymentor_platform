import type { ComponentType } from "react";
import { Lesson117 } from "./block_21/Lesson117";
import { Lesson118 } from "./block_21/Lesson118";
import { Lesson119 } from "./block_21/Lesson119";
import { Lesson120 } from "./block_21/Lesson120";
import { Lesson121 } from "./block_21/Lesson121";
import { Lesson122 } from "./block_21/Lesson122";
import { Lesson123 } from "./block_22/Lesson123";
import { Lesson124 } from "./block_22/Lesson124";
import { Lesson125 } from "./block_22/Lesson125";
import { Lesson126 } from "./block_22/Lesson126";
import { Lesson127 } from "./block_22/Lesson127";
import { Lesson128 } from "./block_22/Lesson128";
import { Lesson129 } from "./block_23/Lesson129";
import { Lesson130 } from "./block_23/Lesson130";
import { Lesson131 } from "./block_23/Lesson131";
import { Lesson132 } from "./block_23/Lesson132";
import { Lesson133 } from "./block_23/Lesson133";
import { Lesson134 } from "./block_23/Lesson134";
import { Lesson135 } from "./block_24/Lesson135";
import { Lesson136 } from "./block_24/Lesson136";
import { Lesson137 } from "./block_24/Lesson137";
import { Lesson138 } from "./block_24/Lesson138";
import { Lesson139 } from "./block_24/Lesson139";
import { Lesson140 } from "./block_24/Lesson140";
import { LearningRoadmap } from "./block_00/LearningRoadmap";
import { MonthTheory } from "./block_00/MonthTheory";

const COURSE_FOLDER = "chapter_06";
const LESSON_BLOCKS = [[117, 122, "block_21"], [123, 128, "block_22"], [129, 134, "block_23"], [135, 140, "block_24"]] as const;
const source = (file: string) => {
  const filename = file.split("/").pop() ?? file;
  const lessonNumber = Number(filename.match(/^\d+/)?.[0] ?? 0);
  const block = LESSON_BLOCKS.find(([first, last]) => lessonNumber >= first && lessonNumber <= last)?.[2] ?? "block_00";
  return `${COURSE_FOLDER}/${block}/${filename}`;
};

export const pages: Record<string, ComponentType<{ module?: string }>> = {
  [source("00 Обзор/План обучения.md")]: LearningRoadmap,
  [source("00 Обзор/Теория месяца.md")]: MonthTheory,
  [source("Блок 21 - SQL как язык работы с данными (6 занятий)/117 - Реляционная модель и SQL под ORM.md")]: Lesson117,
  [source("Блок 21 - SQL как язык работы с данными (6 занятий)/118 - CREATE TABLE и ограничения данных.md")]: Lesson118,
  [source("Блок 21 - SQL как язык работы с данными (6 занятий)/119 - INSERT и безопасные параметры.md")]: Lesson119,
  [source("Блок 21 - SQL как язык работы с данными (6 занятий)/120 - SELECT, WHERE, ORDER BY, LIMIT и OFFSET.md")]: Lesson120,
  [source("Блок 21 - SQL как язык работы с данными (6 занятий)/121 - UPDATE и DELETE без опасных ошибок.md")]: Lesson121,
  [source("Блок 21 - SQL как язык работы с данными (6 занятий)/122 - SQL и SQLAlchemy, две формы одного запроса.md")]: Lesson122,
  [source("Блок 22 - PostgreSQL и перенос StudyHub (6 занятий)/123 - PostgreSQL, сервер, база, схема и подключение.md")]: Lesson123,
  [source("Блок 22 - PostgreSQL и перенос StudyHub (6 занятий)/124 - Установка, psql и первая база.md")]: Lesson124,
  [source("Блок 22 - PostgreSQL и перенос StudyHub (6 занятий)/125 - Roles, ownership и минимальные права.md")]: Lesson125,
  [source("Блок 22 - PostgreSQL и перенос StudyHub (6 занятий)/126 - DATABASE_URL и SQLAlchemy Engine для PostgreSQL.md")]: Lesson126,
  [source("Блок 22 - PostgreSQL и перенос StudyHub (6 занятий)/127 - Alembic на чистой PostgreSQL-базе.md")]: Lesson127,
  [source("Блок 22 - PostgreSQL и перенос StudyHub (6 занятий)/128 - Перенос данных и проверка неизменного API.md")]: Lesson128,
  [source("Блок 23 - JOIN, агрегаты и транзакции (6 занятий)/129 - INNER JOIN и связанные строки.md")]: Lesson129,
  [source("Блок 23 - JOIN, агрегаты и транзакции (6 занятий)/130 - LEFT JOIN и отсутствующие связи.md")]: Lesson130,
  [source("Блок 23 - JOIN, агрегаты и транзакции (6 занятий)/131 - Many-to-many через таблицу связи.md")]: Lesson131,
  [source("Блок 23 - JOIN, агрегаты и транзакции (6 занятий)/132 - COUNT, GROUP BY и статистика StudyHub.md")]: Lesson132,
  [source("Блок 23 - JOIN, агрегаты и транзакции (6 занятий)/133 - HAVING, EXISTS и подзапросы.md")]: Lesson133,
  [source("Блок 23 - JOIN, агрегаты и транзакции (6 занятий)/134 - Транзакция из нескольких изменений.md")]: Lesson134,
  [source("Блок 24 - Индексы, планы запросов и модели хранения (6 занятий)/135 - Почему запрос становится медленным.md")]: Lesson135,
  [source("Блок 24 - Индексы, планы запросов и модели хранения (6 занятий)/136 - Одиночные и составные индексы.md")]: Lesson136,
  [source("Блок 24 - Индексы, планы запросов и модели хранения (6 занятий)/137 - EXPLAIN и EXPLAIN ANALYZE без магии.md")]: Lesson137,
  [source("Блок 24 - Индексы, планы запросов и модели хранения (6 занятий)/138 - Backup, restore и проверка восстановления.md")]: Lesson138,
  [source("Блок 24 - Индексы, планы запросов и модели хранения (6 занятий)/139 - MongoDB и документная модель.md")]: Lesson139,
  [source("Блок 24 - Индексы, планы запросов и модели хранения (6 занятий)/140 - Redis, TTL и итоговый аудит хранилищ.md")]: Lesson140,
};

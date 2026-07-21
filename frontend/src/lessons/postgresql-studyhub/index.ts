import type { ComponentType } from "react";
import { Lesson117, Lesson118, Lesson119, Lesson120, Lesson121, Lesson122 } from "./block21";
import { Lesson123, Lesson124, Lesson125, Lesson126, Lesson127, Lesson128 } from "./block22";
import { Lesson129, Lesson130, Lesson131, Lesson132, Lesson133, Lesson134 } from "./block23";
import { Lesson135, Lesson136, Lesson137, Lesson138, Lesson139, Lesson140 } from "./block24";
import { LearningRoadmap, MonthTheory } from "./overview";

const COURSE_FOLDER = 
"SQL, PostgreSQL и выбор хранилища - PostgreSQL StudyHub"
;
const source = (file: string) => `${COURSE_FOLDER}/${file}`;

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

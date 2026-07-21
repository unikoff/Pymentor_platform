import type { ComponentType } from "react";
import { Lesson141, Lesson142, Lesson143, Lesson144, Lesson145, Lesson146 } from "./block25";
import { Lesson147, Lesson148, Lesson149, Lesson150, Lesson151, Lesson152 } from "./block26";
import { Lesson153, Lesson154, Lesson155, Lesson156, Lesson157, Lesson158 } from "./block27";
import { Lesson159, Lesson160, Lesson161, Lesson162, Lesson163, Lesson164 } from "./block28";
import { LearningRoadmap, MonthTheory } from "./overview";

const COURSE_FOLDER = 
"Асинхронность и производительность backend - Async StudyHub"
;
const source = (file: string) => `${COURSE_FOLDER}/${file}`;

export const pages: Record<string, ComponentType<{ module?: string }>> = {
  [source("00 Обзор/План обучения.md")]: LearningRoadmap,
  [source("00 Обзор/Теория месяца.md")]: MonthTheory,
  [source("Блок 25 - Coroutine, event loop и async,await (6 занятий)/141 - Блокирующее выполнение, CPU и I,O.md")]: Lesson141,
  [source("Блок 25 - Coroutine, event loop и async,await (6 занятий)/142 - async def и coroutine object.md")]: Lesson142,
  [source("Блок 25 - Coroutine, event loop и async,await (6 занятий)/143 - asyncio.run, event loop и первый await.md")]: Lesson143,
  [source("Блок 25 - Coroutine, event loop и async,await (6 занятий)/144 - Последовательные await и иллюзия асинхронности.md")]: Lesson144,
  [source("Блок 25 - Coroutine, event loop и async,await (6 занятий)/145 - Ошибки async-кода, забытый await и блокировка loop.md")]: Lesson145,
  [source("Блок 25 - Coroutine, event loop и async,await (6 занятий)/146 - Мини-проект, трассировка асинхронного загрузчика.md")]: Lesson146,
  [source("Блок 26 - Конкурентные задачи, timeout и cancellation (6 занятий)/147 - asyncio.create_task и жизненный цикл Task.md")]: Lesson147,
  [source("Блок 26 - Конкурентные задачи, timeout и cancellation (6 занятий)/148 - asyncio.gather и сбор результатов.md")]: Lesson148,
  [source("Блок 26 - Конкурентные задачи, timeout и cancellation (6 занятий)/149 - Timeout через asyncio.wait_for.md")]: Lesson149,
  [source("Блок 26 - Конкурентные задачи, timeout и cancellation (6 занятий)/150 - Cancellation и обязательная очистка.md")]: Lesson150,
  [source("Блок 26 - Конкурентные задачи, timeout и cancellation (6 занятий)/151 - Semaphore и ограничение concurrency.md")]: Lesson151,
  [source("Блок 26 - Конкурентные задачи, timeout и cancellation (6 занятий)/152 - Частичные ошибки и итоговый async-агрегатор.md")]: Lesson152,
  [source("Блок 27 - Асинхронный FastAPI и внешние HTTP-сервисы (6 занятий)/153 - def и async def внутри FastAPI.md")]: Lesson153,
  [source("Блок 27 - Асинхронный FastAPI и внешние HTTP-сервисы (6 занятий)/154 - Первый запрос через httpx.AsyncClient.md")]: Lesson154,
  [source("Блок 27 - Асинхронный FastAPI и внешние HTTP-сервисы (6 занятий)/155 - HTTP timeout, network errors и безопасный response.md")]: Lesson155,
  [source("Блок 27 - Асинхронный FastAPI и внешние HTTP-сервисы (6 занятий)/156 - Dependency для внешнего клиента.md")]: Lesson156,
  [source("Блок 27 - Асинхронный FastAPI и внешние HTTP-сервисы (6 занятий)/157 - Lifespan и переиспользование AsyncClient.md")]: Lesson157,
  [source("Блок 27 - Асинхронный FastAPI и внешние HTTP-сервисы (6 занятий)/158 - Агрегирующий endpoint и mock внешнего API.md")]: Lesson158,
  [source("Блок 28 - Async SQLAlchemy, нагрузка и наблюдаемость (6 занятий)/159 - AsyncEngine и async driver PostgreSQL.md")]: Lesson159,
  [source("Блок 28 - Async SQLAlchemy, нагрузка и наблюдаемость (6 занятий)/160 - async_sessionmaker и get_db.md")]: Lesson160,
  [source("Блок 28 - Async SQLAlchemy, нагрузка и наблюдаемость (6 занятий)/161 - Асинхронный SELECT и CRUD.md")]: Lesson161,
  [source("Блок 28 - Async SQLAlchemy, нагрузка и наблюдаемость (6 занятий)/162 - Асинхронные транзакции и rollback.md")]: Lesson162,
  [source("Блок 28 - Async SQLAlchemy, нагрузка и наблюдаемость (6 занятий)/163 - Связи, N+1 и connection pool.md")]: Lesson163,
  [source("Блок 28 - Async SQLAlchemy, нагрузка и наблюдаемость (6 занятий)/164 - Нагрузочная проверка и финальный Async StudyHub.md")]: Lesson164,
};

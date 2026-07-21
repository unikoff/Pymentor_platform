import type { ComponentType } from "react";
import { Lesson189, Lesson190, Lesson191, Lesson192, Lesson193, Lesson194 } from "./block33";
import { Lesson195, Lesson196, Lesson197, Lesson198, Lesson199, Lesson200 } from "./block34";
import { Lesson201, Lesson202, Lesson203, Lesson204, Lesson205, Lesson206 } from "./block35";
import { Lesson207, Lesson208, Lesson209, Lesson210, Lesson211, Lesson212 } from "./block36";
import { LearningRoadmap, MonthTheory } from "./overview";

const COURSE_FOLDER = 
"StudyHub LMS, Redis, портфолио и собеседования - StudyHub LMS Release"
;
const source = (file: string) => `${COURSE_FOLDER}/${file}`;

export const pages: Record<string, ComponentType<{ module?: string }>> = {
  [source("00 Обзор/План обучения.md")]: LearningRoadmap,
  [source("00 Обзор/Теория месяца.md")]: MonthTheory,
  [source("Блок 33 - Проектирование StudyHub LMS Core (6 занятий)/189 - От Planner к LMS, требования и границы MVP.md")]: Lesson189,
  [source("Блок 33 - Проектирование StudyHub LMS Core (6 занятий)/190 - Course, Module и Lesson, структура учебного контента.md")]: Lesson190,
  [source("Блок 33 - Проектирование StudyHub LMS Core (6 занятий)/191 - Enrollment как отдельная сущность связи.md")]: Lesson191,
  [source("Блок 33 - Проектирование StudyHub LMS Core (6 занятий)/192 - Progress и инварианты прохождения.md")]: Lesson192,
  [source("Блок 33 - Проектирование StudyHub LMS Core (6 занятий)/193 - Ownership, роли и permissions matrix.md")]: Lesson193,
  [source("Блок 33 - Проектирование StudyHub LMS Core (6 занятий)/194 - API contract, ER-диаграмма и migration plan.md")]: Lesson194,
  [source("Блок 34 - Курсы, зачисление и прогресс (6 занятий)/195 - Teacher создаёт и редактирует Course.md")]: Lesson195,
  [source("Блок 34 - Курсы, зачисление и прогресс (6 занятий)/196 - Modules, Lessons и устойчивый порядок.md")]: Lesson196,
  [source("Блок 34 - Курсы, зачисление и прогресс (6 занятий)/197 - Draft, publish и публичный каталог курсов.md")]: Lesson197,
  [source("Блок 34 - Курсы, зачисление и прогресс (6 занятий)/198 - Enrollment и защита от повторной записи.md")]: Lesson198,
  [source("Блок 34 - Курсы, зачисление и прогресс (6 занятий)/199 - Завершение Lesson и расчёт Progress.md")]: Lesson199,
  [source("Блок 34 - Курсы, зачисление и прогресс (6 занятий)/200 - End-to-end LMS flow и отрицательные тесты.md")]: Lesson200,
  [source("Блок 35 - Redis, кеш и фоновые операции (6 занятий)/201 - Redis key,value, TTL и source of truth.md")]: Lesson201,
  [source("Блок 35 - Redis, кеш и фоновые операции (6 занятий)/202 - Cache-aside для каталога курсов.md")]: Lesson202,
  [source("Блок 35 - Redis, кеш и фоновые операции (6 занятий)/203 - Cache invalidation после изменения курса.md")]: Lesson203,
  [source("Блок 35 - Redis, кеш и фоновые операции (6 занятий)/204 - Простой rate limit через Redis.md")]: Lesson204,
  [source("Блок 35 - Redis, кеш и фоновые операции (6 занятий)/205 - BackgroundTasks и действие после response.md")]: Lesson205,
  [source("Блок 35 - Redis, кеш и фоновые операции (6 занятий)/206 - Тестирование кеша, rate limit и фоновых ошибок.md")]: Lesson206,
  [source("Блок 36 - Финальное качество, портфолио и интервью (6 занятий)/207 - Единый API error contract и versioning.md")]: Lesson207,
  [source("Блок 36 - Финальное качество, портфолио и интервью (6 занятий)/208 - Аудит безопасности и производительности.md")]: Lesson208,
  [source("Блок 36 - Финальное качество, портфолио и интервью (6 занятий)/209 - Финальный test suite и quality gate.md")]: Lesson209,
  [source("Блок 36 - Финальное качество, портфолио и интервью (6 занятий)/210 - README, ER-диаграмма и архитектурный рассказ.md")]: Lesson210,
  [source("Блок 36 - Финальное качество, портфолио и интервью (6 занятий)/211 - Interview lab, Python, SQL, API и code review.md")]: Lesson211,
  [source("Блок 36 - Финальное качество, портфолио и интервью (6 занятий)/212 - StudyHub LMS Release и финальная защита.md")]: Lesson212,
};

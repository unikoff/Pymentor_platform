import type { ComponentType } from "react";
import { Lesson165, Lesson166, Lesson167, Lesson168, Lesson169, Lesson170 } from "./block29";
import { Lesson171, Lesson172, Lesson173, Lesson174, Lesson175, Lesson176 } from "./block30";
import { Lesson177, Lesson178, Lesson179, Lesson180, Lesson181, Lesson182 } from "./block31";
import { Lesson183, Lesson184, Lesson185, Lesson186, Lesson187, Lesson188 } from "./block32";
import { LearningRoadmap, MonthTheory } from "./overview";

const COURSE_FOLDER = 
"Docker, CI-CD и первый стабильный деплой - Deployable StudyHub"
;
const source = (file: string) => `${COURSE_FOLDER}/${file}`;

export const pages: Record<string, ComponentType<{ module?: string }>> = {
  [source("00 Обзор/План обучения.md")]: LearningRoadmap,
  [source("00 Обзор/Теория месяца.md")]: MonthTheory,
  [source("Блок 29 - Linux, процессы, окружения и логи (6 занятий)/165 - Linux-путь проекта и базовая навигация.md")]: Lesson165,
  [source("Блок 29 - Linux, процессы, окружения и логи (6 занятий)/166 - Процессы, PID, порты и сигналы.md")]: Lesson166,
  [source("Блок 29 - Linux, процессы, окружения и логи (6 занятий)/167 - Environment variables и конфигурация окружений.md")]: Lesson167,
  [source("Блок 29 - Linux, процессы, окружения и логи (6 занятий)/168 - stdout, stderr и структурированные логи.md")]: Lesson168,
  [source("Блок 29 - Linux, процессы, окружения и логи (6 занятий)/169 - Healthcheck, readiness и graceful shutdown.md")]: Lesson169,
  [source("Блок 29 - Linux, процессы, окружения и логи (6 занятий)/170 - Linux-runbook и диагностика запуска StudyHub.md")]: Lesson170,
  [source("Блок 30 - Dockerfile и контейнер приложения (6 занятий)/171 - Image, container и изоляция процесса.md")]: Lesson171,
  [source("Блок 30 - Dockerfile и контейнер приложения (6 занятий)/172 - Первый Dockerfile для FastAPI.md")]: Lesson172,
  [source("Блок 30 - Dockerfile и контейнер приложения (6 занятий)/173 - Build context, layers и кеш сборки.md")]: Lesson173,
  [source("Блок 30 - Dockerfile и контейнер приложения (6 занятий)/174 - Ports, environment и файловое состояние container.md")]: Lesson174,
  [source("Блок 30 - Dockerfile и контейнер приложения (6 занятий)/175 - dockerignore, непривилегированный пользователь и чистый image.md")]: Lesson175,
  [source("Блок 30 - Dockerfile и контейнер приложения (6 занятий)/176 - Диагностика container и релизный Dockerfile.md")]: Lesson176,
  [source("Блок 31 - Docker Compose, API, PostgreSQL и Redis (6 занятий)/177 - Compose services и внутренняя сеть.md")]: Lesson177,
  [source("Блок 31 - Docker Compose, API, PostgreSQL и Redis (6 занятий)/178 - PostgreSQL service и DATABASE_URL внутри Compose.md")]: Lesson178,
  [source("Блок 31 - Docker Compose, API, PostgreSQL и Redis (6 занятий)/179 - Volumes и постоянные данные PostgreSQL.md")]: Lesson179,
  [source("Блок 31 - Docker Compose, API, PostgreSQL и Redis (6 занятий)/180 - Readiness, healthcheck и запуск migrations.md")]: Lesson180,
  [source("Блок 31 - Docker Compose, API, PostgreSQL и Redis (6 занятий)/181 - Redis service как будущая инфраструктура.md")]: Lesson181,
  [source("Блок 31 - Docker Compose, API, PostgreSQL и Redis (6 занятий)/182 - Полный local stack и сценарии восстановления.md")]: Lesson182,
  [source("Блок 32 - GitHub Actions, CI,CD и первый деплой (6 занятий)/183 - Continuous Integration и quality gates.md")]: Lesson183,
  [source("Блок 32 - GitHub Actions, CI,CD и первый деплой (6 занятий)/184 - Первый workflow GitHub Actions.md")]: Lesson184,
  [source("Блок 32 - GitHub Actions, CI,CD и первый деплой (6 занятий)/185 - PostgreSQL service и migrations в CI.md")]: Lesson185,
  [source("Блок 32 - GitHub Actions, CI,CD и первый деплой (6 занятий)/186 - Автоматическая сборка и tagging Docker image.md")]: Lesson186,
  [source("Блок 32 - GitHub Actions, CI,CD и первый деплой (6 занятий)/187 - Deployment, secrets и production configuration.md")]: Lesson187,
  [source("Блок 32 - GitHub Actions, CI,CD и первый деплой (6 занятий)/188 - Smoke test, rollback и Release StudyHub.md")]: Lesson188,
};

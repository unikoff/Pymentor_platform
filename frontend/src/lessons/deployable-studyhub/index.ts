import type { ComponentType } from "react";
import { Lesson165 } from "./block_29/Lesson165";
import { Lesson166 } from "./block_29/Lesson166";
import { Lesson167 } from "./block_29/Lesson167";
import { Lesson168 } from "./block_29/Lesson168";
import { Lesson169 } from "./block_29/Lesson169";
import { Lesson170 } from "./block_29/Lesson170";
import { Lesson171 } from "./block_30/Lesson171";
import { Lesson172 } from "./block_30/Lesson172";
import { Lesson173 } from "./block_30/Lesson173";
import { Lesson174 } from "./block_30/Lesson174";
import { Lesson175 } from "./block_30/Lesson175";
import { Lesson176 } from "./block_30/Lesson176";
import { Lesson177 } from "./block_31/Lesson177";
import { Lesson178 } from "./block_31/Lesson178";
import { Lesson179 } from "./block_31/Lesson179";
import { Lesson180 } from "./block_31/Lesson180";
import { Lesson181 } from "./block_31/Lesson181";
import { Lesson182 } from "./block_31/Lesson182";
import { Lesson183 } from "./block_32/Lesson183";
import { Lesson184 } from "./block_32/Lesson184";
import { Lesson185 } from "./block_32/Lesson185";
import { Lesson186 } from "./block_32/Lesson186";
import { Lesson187 } from "./block_32/Lesson187";
import { Lesson188 } from "./block_32/Lesson188";
import { LearningRoadmap } from "./block_00/LearningRoadmap";
import { MonthTheory } from "./block_00/MonthTheory";

const COURSE_FOLDER = "chapter_08";
const LESSON_BLOCKS = [[165, 170, "block_29"], [171, 176, "block_30"], [177, 182, "block_31"], [183, 188, "block_32"]] as const;
const source = (file: string) => {
  const filename = file.split("/").pop() ?? file;
  const lessonNumber = Number(filename.match(/^\d+/)?.[0] ?? 0);
  const block = LESSON_BLOCKS.find(([first, last]) => lessonNumber >= first && lessonNumber <= last)?.[2] ?? "block_00";
  return `${COURSE_FOLDER}/${block}/${filename}`;
};

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

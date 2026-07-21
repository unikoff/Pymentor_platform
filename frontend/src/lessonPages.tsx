import type { ComponentType } from "react";
import { pages as asyncStudyhub } from "./lessons/async-studyhub";
import { pages as deployableStudyhub } from "./lessons/deployable-studyhub";
import { pages as fastapiAuth } from "./lessons/fastapi-auth";
import { pages as fastapiSqlalchemy } from "./lessons/fastapi-sqlalchemy";
import { pages as plannerApi } from "./lessons/planner-api";
import { pages as postgresqlStudyhub } from "./lessons/postgresql-studyhub";
import { pages as pythonDeeper } from "./lessons/python-deeper";
import { pages as pythonFoundations } from "./lessons/python-foundations";
import { pages as studyhubLmsRelease } from "./lessons/studyhub-lms-release";

/**
 * Общий реестр дизайн-страниц уроков.
 *
 * Каждый курс держит свой набор страниц в собственной папке
 * lessons/<курс>/ и экспортирует их через index.ts. Здесь реестры
 * курсов просто объединяются. Уроки, которых нет в реестре, на сайте
 * показываются как обычный markdown.
 *
 * Новый курс = новая папка lessons/<курс>/ + одна строка в объекте ниже.
 */
export const richLessonPages: Record<string, ComponentType<{ module?: string }>> = {
  ...pythonFoundations,
  ...pythonDeeper,
  ...plannerApi,
  ...fastapiSqlalchemy,
  ...fastapiAuth,
  ...postgresqlStudyhub,
  ...asyncStudyhub,
  ...deployableStudyhub,
  ...studyhubLmsRelease,
};

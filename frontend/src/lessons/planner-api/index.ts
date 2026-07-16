import type { ComponentType } from "react";
import { Lesson45, Lesson46, Lesson47, Lesson48, Lesson49, Lesson50 } from "./block9";
import { Lesson51, Lesson52, Lesson53, Lesson54, Lesson55, Lesson56 } from "./block10";
import { Lesson57, Lesson58, Lesson59, Lesson60, Lesson61, Lesson62 } from "./block11";
import { Lesson63, Lesson64, Lesson65, Lesson66, Lesson67, Lesson68 } from "./block12";
import { LearningRoadmap, MonthTheory } from "./overview";

const COURSE_FOLDER = "HTTP, API и FastAPI - Planner API";
const source = (file: string) => `${COURSE_FOLDER}/${file}`;

export const pages: Record<string, ComponentType<{ module?: string }>> = {
  [source("План обучения.md")]: LearningRoadmap,
  [source("Теория месяца.md")]: MonthTheory,
  [source("45 - Почему CLI недостаточно, клиент и сервер.md")]: Lesson45,
  [source("46 - HTTP request, адрес, метод, headers и body.md")]: Lesson46,
  [source("47 - HTTP response, status, headers, body и Content-Type.md")]: Lesson47,
  [source("48 - Методы GET, POST, PUT, PATCH, DELETE.md")]: Lesson48,
  [source("49 - REST, ресурс, endpoint и URL.md")]: Lesson49,
  [source("50 - Path, query, body и контракт API.md")]: Lesson50,
  [source("51 - Postman, отправляем запрос вручную.md")]: Lesson51,
  [source("52 - Первое FastAPI-приложение, Uvicorn и Swagger.md")]: Lesson52,
  [source("53 - GET-endpoints и ответы FastAPI.md")]: Lesson53,
  [source("54 - Path-параметры и поиск объекта.md")]: Lesson54,
  [source("55 - Query-параметры, фильтрация, сортировка и границы.md")]: Lesson55,
  [source("56 - Pydantic BaseModel и request body.md")]: Lesson56,
  [source("57 - Pydantic-валидация и ошибка 422.md")]: Lesson57,
  [source("58 - Разные схемы, TaskCreate, TaskUpdate, TaskRead.md")]: Lesson58,
  [source("59 - Хранилище в памяти и генерация идентификатора.md")]: Lesson59,
  [source("60 - CRUD, создать, получить список и найти по id.md")]: Lesson60,
  [source("61 - PUT и PATCH, полная и частичная замена.md")]: Lesson61,
  [source("62 - DELETE, 204 и HTTPException.md")]: Lesson62,
  [source("63 - APIRouter, prefix, tags и include_router.md")]: Lesson63,
  [source("64 - Тесты FastAPI через TestClient.md")]: Lesson64,
  [source("65 - Финальный проект 1, контракт и архитектура Planner API.md")]: Lesson65,
  [source("66 - Финальный проект 2, schemas, storage, crud и routers.md")]: Lesson66,
  [source("67 - Финальный проект 3, полная CRUD-логика.md")]: Lesson67,
  [source("68 - Финальный проект 4, Postman, тесты, README и GitHub Release.md")]: Lesson68,
};

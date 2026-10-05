import type { ComponentType } from "react";
import { LearningRoadmap } from "./block_00/LearningRoadmap";
import { MonthTheory } from "./block_00/MonthTheory";
import { Lesson45 } from "./block_09/Lesson45";
import { Lesson46 } from "./block_09/Lesson46";
import { Lesson47 } from "./block_09/Lesson47";
import { Lesson48 } from "./block_09/Lesson48";
import { Lesson49 } from "./block_09/Lesson49";
import { Lesson50 } from "./block_09/Lesson50";
import { Lesson51 } from "./block_10/Lesson51";
import { Lesson52 } from "./block_10/Lesson52";
import { Lesson53 } from "./block_10/Lesson53";
import { Lesson54 } from "./block_10/Lesson54";
import { Lesson55 } from "./block_10/Lesson55";
import { Lesson56 } from "./block_10/Lesson56";
import { Lesson57 } from "./block_11/Lesson57";
import { Lesson58 } from "./block_11/Lesson58";
import { Lesson59 } from "./block_11/Lesson59";
import { Lesson60 } from "./block_11/Lesson60";
import { Lesson61 } from "./block_11/Lesson61";
import { Lesson62 } from "./block_11/Lesson62";
import { Lesson63 } from "./block_12/Lesson63";
import { Lesson64 } from "./block_12/Lesson64";
import { Lesson65 } from "./block_12/Lesson65";
import { Lesson66 } from "./block_12/Lesson66";
import { Lesson67 } from "./block_12/Lesson67";
import { Lesson68 } from "./block_12/Lesson68";

const COURSE_FOLDER = "planner_api";
const BLOCK_FOLDERS = [
  { first: 45, last: 50, folder: "block_09" },
  { first: 51, last: 56, folder: "block_10" },
  { first: 57, last: 62, folder: "block_11" },
  { first: 63, last: 68, folder: "block_12" },
];
const source = (file: string) => {
  const lessonNumber = Number.parseInt(file, 10);
  const block = BLOCK_FOLDERS.find(({ first, last }) => lessonNumber >= first && lessonNumber <= last);
  return `${COURSE_FOLDER}/${block?.folder ?? "block_00"}/${file}`;
};

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
  [source("63 - Тесты FastAPI через TestClient и независимое состояние.md")]: Lesson63,
  [source("64 - APIRouter, prefix, tags и include_router.md")]: Lesson64,
  [source("65 - Финальный проект 1, контракт и архитектура Planner API.md")]: Lesson65,
  [source("66 - Финальный проект 2, schemas, storage, crud и routers.md")]: Lesson66,
  [source("67 - Финальный проект 3, полная CRUD-логика.md")]: Lesson67,
  [source("68 - Финальный проект 4, Postman, тесты, README и GitHub Release.md")]: Lesson68,
};

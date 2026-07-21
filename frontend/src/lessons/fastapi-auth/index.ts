import type { ComponentType } from "react";
import { Lesson93, Lesson94, Lesson95, Lesson96, Lesson97, Lesson98 } from "./block17";
import { Lesson99, Lesson100, Lesson101, Lesson102, Lesson103, Lesson104 } from "./block18";
import { Lesson105, Lesson106, Lesson107, Lesson108, Lesson109, Lesson110 } from "./block19";
import { Lesson111, Lesson112, Lesson113, Lesson114, Lesson115, Lesson116 } from "./block20";
import { LearningRoadmap, MonthTheory } from "./overview";

const COURSE_FOLDER = "Аутентификация, сессии, токены и завершение FastAPI - Personal StudyHub API";
const source = (file: string) => `${COURSE_FOLDER}/${file}`;

export const pages: Record<string, ComponentType<{ module?: string }>> = {
  [source("00 Обзор/План обучения.md")]: LearningRoadmap,
  [source("00 Обзор/Теория месяца.md")]: MonthTheory,
  [source("Блок 17 - Пользователь и основы безопасности (6 занятий)/93 - Идентификация, аутентификация и авторизация.md")]: Lesson93,
  [source("Блок 17 - Пользователь и основы безопасности (6 занятий)/94 - Карта способов аутентификации.md")]: Lesson94,
  [source("Блок 17 - Пользователь и основы безопасности (6 занятий)/95 - Модель User и схемы.md")]: Lesson95,
  [source("Блок 17 - Пользователь и основы безопасности (6 занятий)/96 - Пароль и хеширование.md")]: Lesson96,
  [source("Блок 17 - Пользователь и основы безопасности (6 занятий)/97 - Регистрация.md")]: Lesson97,
  [source("Блок 17 - Пользователь и основы безопасности (6 занятий)/98 - Проверка credentials.md")]: Lesson98,
  [source("Блок 18 - Cookie и server-side sessions (6 занятий)/99 - Cookie в браузере.md")]: Lesson99,
  [source("Блок 18 - Cookie и server-side sessions (6 занятий)/100 - Server-side session и session_id.md")]: Lesson100,
  [source("Блок 18 - Cookie и server-side sessions (6 занятий)/101 - Session login.md")]: Lesson101,
  [source("Блок 18 - Cookie и server-side sessions (6 занятий)/102 - get_current_user через session.md")]: Lesson102,
  [source("Блок 18 - Cookie и server-side sessions (6 занятий)/103 - Logout, expiration и revocation.md")]: Lesson103,
  [source("Блок 18 - Cookie и server-side sessions (6 занятий)/104 - Владение задачами и session-тесты.md")]: Lesson104,
  [source("Блок 19 - Bearer, JWT, refresh и права (6 занятий)/105 - Bearer token и JWT.md")]: Lesson105,
  [source("Блок 19 - Bearer, JWT, refresh и права (6 занятий)/106 - Access token.md")]: Lesson106,
  [source("Блок 19 - Bearer, JWT, refresh и права (6 занятий)/107 - Token endpoint и OAuth2PasswordBearer.md")]: Lesson107,
  [source("Блок 19 - Bearer, JWT, refresh и права (6 занятий)/108 - Current user из JWT.md")]: Lesson108,
  [source("Блок 19 - Bearer, JWT, refresh и права (6 занятий)/109 - Refresh token, rotation и revocation.md")]: Lesson109,
  [source("Блок 19 - Bearer, JWT, refresh и права (6 занятий)/110 - Роли, разрешения, 401 и 403.md")]: Lesson110,
  [source("Блок 20 - Остальные возможности и Personal StudyHub (6 занятий)/111 - HTTP Basic и API key.md")]: Lesson111,
  [source("Блок 20 - Остальные возможности и Personal StudyHub (6 занятий)/112 - Form, multipart и UploadFile.md")]: Lesson112,
  [source("Блок 20 - Остальные возможности и Personal StudyHub (6 занятий)/113 - Финальный проект 1, контракт и архитектура.md")]: Lesson113,
  [source("Блок 20 - Остальные возможности и Personal StudyHub (6 занятий)/114 - Финальный проект 2, database, schemas и auth services.md")]: Lesson114,
  [source("Блок 20 - Остальные возможности и Personal StudyHub (6 занятий)/115 - Финальный проект 3, маршруты, ошибки и тесты.md")]: Lesson115,
  [source("Блок 20 - Остальные возможности и Personal StudyHub (6 занятий)/116 - Финальный проект 4, документация и защита.md")]: Lesson116,
};

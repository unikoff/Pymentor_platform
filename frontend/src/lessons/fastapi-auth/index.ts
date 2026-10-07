import type { ComponentType } from "react";
import { Lesson93 } from "./block_17/Lesson93";
import { Lesson94 } from "./block_17/Lesson94";
import { Lesson95 } from "./block_17/Lesson95";
import { Lesson96 } from "./block_17/Lesson96";
import { Lesson97 } from "./block_17/Lesson97";
import { Lesson98 } from "./block_17/Lesson98";
import { Lesson99 } from "./block_18/Lesson99";
import { Lesson100 } from "./block_18/Lesson100";
import { Lesson101 } from "./block_18/Lesson101";
import { Lesson102 } from "./block_18/Lesson102";
import { Lesson103 } from "./block_18/Lesson103";
import { Lesson104 } from "./block_18/Lesson104";
import { Lesson105 } from "./block_19/Lesson105";
import { Lesson106 } from "./block_19/Lesson106";
import { Lesson107 } from "./block_19/Lesson107";
import { Lesson108 } from "./block_19/Lesson108";
import { Lesson109 } from "./block_19/Lesson109";
import { Lesson110 } from "./block_19/Lesson110";
import { Lesson111 } from "./block_20/Lesson111";
import { Lesson112 } from "./block_20/Lesson112";
import { Lesson113 } from "./block_20/Lesson113";
import { Lesson114 } from "./block_20/Lesson114";
import { Lesson115 } from "./block_20/Lesson115";
import { Lesson116 } from "./block_20/Lesson116";
import { LearningRoadmap } from "./block_00/LearningRoadmap";
import { MonthTheory } from "./block_00/MonthTheory";

const COURSE_FOLDER = "chapter_05";
const LESSON_BLOCKS = [[93, 98, "block_17"], [99, 104, "block_18"], [105, 110, "block_19"], [111, 116, "block_20"]] as const;
const source = (file: string) => {
  const filename = file.split("/").pop() ?? file;
  const lessonNumber = Number(filename.match(/^\d+/)?.[0] ?? 0);
  const block = LESSON_BLOCKS.find(([first, last]) => lessonNumber >= first && lessonNumber <= last)?.[2] ?? "block_00";
  return `${COURSE_FOLDER}/${block}/${filename}`;
};

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

import{t as e}from"./jsx-runtime-lw2jiZar.js";import{A as t,D as n,E as r,I as i,L as a,M as o,N as s,O as c,P as l,T as u,b as d,f,j as p,p as m,w as h,x as g}from"./shared-UmZHo_CQ.js";import{t as _}from"./folder-git-2-CZqyCk4j.js";import{D as v}from"./index-3E7rQLz6.js";import{t as y}from"./CodeEditor-BZlrvoTL.js";var b=e(),x=`Блок 20 · Остальные возможности FastAPI и Personal StudyHub`;function S({module:e}){return(0,b.jsxs)(s,{children:[(0,b.jsx)(o,{variant:`project`,chip:e??x,title:`Финальный проект 1: контракт и архитектура`,intro:`Перед финальной сборкой Personal StudyHub зафиксируем обязательные сценарии, OpenAPI-контракт, таблицы, границы модулей, формат ошибок и базовую модель угроз — без преждевременного написания маршрутов.`,tags:[{icon:(0,b.jsx)(_,{size:14}),label:`контракт и дерево проекта`},{icon:(0,b.jsx)(v,{size:14}),label:`модель угроз`}]}),(0,b.jsxs)(r,{tone:`info`,children:[(0,b.jsx)(`strong`,{children:`Связь с курсом.`}),` `,`За этапы 4–5 накопились модели, миграции, session login, JWT, роли и upload. Теперь отдельные механизмы нужно объединить в один ограниченный и проверяемый продукт.`,` `,(0,b.jsx)(`strong`,{children:`Важно не перепутать:`}),` `,`Архитектура не равна количеству папок. Сначала фиксируются пользовательские сценарии и контракты, затем только те модули, которые отвечают за реальные причины изменения.`]}),(0,b.jsxs)(`div`,{className:`lesson-route`,children:[(0,b.jsxs)(`ol`,{children:[(0,b.jsxs)(`li`,{children:[(0,b.jsx)(`strong`,{children:`Ограничить продукт.`}),` `,`перечислить обязательные сценарии и явно записать то, что не входит в релиз.`]}),(0,b.jsxs)(`li`,{children:[(0,b.jsx)(`strong`,{children:`Спроектировать контракт.`}),` `,`согласовать маршруты, статусы, схемы ответов и единый формат ошибок.`]}),(0,b.jsxs)(`li`,{children:[(0,b.jsx)(`strong`,{children:`Нарисовать данные.`}),` `,`связать User, Task, Category, Session, RefreshSession и Attachment.`]}),(0,b.jsxs)(`li`,{children:[(0,b.jsx)(`strong`,{children:`Проверить угрозы.`}),` `,`проследить IDOR, утечку credential, повтор refresh token и опасный upload.`]})]}),(0,b.jsx)(`p`,{children:`Маршрут занятия проходит от знакомой проблемы к проверяемому изменению сквозного проекта.`})]}),(0,b.jsxs)(a,{children:[(0,b.jsx)(i,{badge:`до`,title:`Состояние проекта`,code:`механизмы существуют по отдельности`,children:`механизмы существуют по отдельности`}),(0,b.jsx)(i,{badge:`+`,badgeTone:`float`,title:`Изменение урока`,code:`единый контракт Personal StudyHub`,children:`единый контракт Personal StudyHub`}),(0,b.jsx)(i,{badge:`после`,badgeTone:`str`,title:`Новый результат`,code:`реализация получает ясные границы`,children:`реализация получает ясные границы`})]}),(0,b.jsxs)(l,{number:`01`,title:`Финальный проект начинается со списка обещаний`,children:[(0,b.jsx)(c,{children:`Проект завершает этап 5, поэтому новая функциональность больше не добавляется «потому что можно». Сначала команда записывает, какие пользовательские действия обязаны работать с чистой базой.`}),(0,b.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,b.jsx)(`h3`,{children:`Вход`}),(0,b.jsx)(`p`,{children:`регистрация, session login, token login, refresh, logout и профиль.`}),(0,b.jsx)(`h3`,{children:`Предметная часть`}),(0,b.jsx)(`p`,{children:`CRUD собственных задач, категории, фильтры и вложение.`}),(0,b.jsx)(`h3`,{children:`Права`}),(0,b.jsx)(`p`,{children:`current user, ownership и один admin endpoint.`})]}),(0,b.jsx)(y,{caption:`обязательный scope финального релиза`,code:`mandatory_scenarios = [
    "register user",
    "login with session cookie",
    "login with bearer token",
    "refresh token with rotation",
    "logout and revoke access",
    "read own profile",
    "CRUD only own tasks",
    "admin reads system statistics",
    "upload one safe task attachment",
]

for scenario in mandatory_scenarios:
    print(f"[required] {scenario}")`}),(0,b.jsxs)(a,{children:[(0,b.jsx)(i,{badge:`auth`,title:`Доказать личность`,code:`register/login/refresh/logout`,children:`Сценарии входа имеют отдельные транспортные механизмы, но общий User и password service.`}),(0,b.jsx)(i,{badge:`domain`,badgeTone:`float`,title:`Работать со своими данными`,code:`tasks/categories/attachments`,children:`Каждый запрос получает current user и не доверяет user_id из body.`}),(0,b.jsx)(i,{badge:`admin`,badgeTone:`str`,title:`Проверить разрешение`,code:`GET /admin/stats`,children:`Один узкий endpoint показывает разницу между аутентификацией и авторизацией.`})]}),(0,b.jsx)(r,{tone:`info`,children:`Не входят социальный OAuth, email-подтверждение, Docker, Redis, async и облачное файловое хранилище. Эти темы не нужны для доказательства целей этапа 5.`})]}),(0,b.jsxs)(l,{number:`02`,title:`Карта маршрутов до реализации`,children:[(0,b.jsx)(c,{children:`Маршрут проектируется как публичное обещание: method, path, credential, request schema, response schema, status code и ожидаемые ошибки. Такая таблица предотвращает расхождения между routers.`}),(0,b.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,b.jsx)(`h3`,{children:`Auth routes`}),(0,b.jsx)(`p`,{children:`отделяют регистрацию, cookie-session и bearer token flow.`}),(0,b.jsx)(`h3`,{children:`Resource routes`}),(0,b.jsx)(`p`,{children:`защищают задачи и вложения через current user.`}),(0,b.jsx)(`h3`,{children:`Admin route`}),(0,b.jsx)(`p`,{children:`требует отдельную dependency разрешения.`})]}),(0,b.jsx)(y,{caption:`публичная карта API`,code:`POST   /auth/register             -> 201 UserRead
POST   /auth/session/login        -> 204 + Set-Cookie
POST   /auth/session/logout       -> 204 + delete cookie
POST   /auth/token                -> 200 TokenPair
POST   /auth/refresh              -> 200 TokenPair
POST   /auth/token/logout         -> 204
GET    /users/me                  -> 200 UserRead
GET    /tasks                     -> 200 Page[TaskRead]
POST   /tasks                     -> 201 TaskRead
PATCH  /tasks/{task_id}           -> 200 TaskRead
DELETE /tasks/{task_id}           -> 204
POST   /tasks/{task_id}/attachments -> 201 AttachmentRead
GET    /admin/stats               -> 200 AdminStats`}),(0,b.jsx)(t,{rows:[[(0,b.jsx)(b.Fragment,{children:`POST /auth/register`}),`создаёт пользователя, но не возвращает password_hash`],[(0,b.jsx)(b.Fragment,{children:`POST /auth/session/login`}),`создаёт server-side session и cookie`],[(0,b.jsx)(b.Fragment,{children:`POST /auth/token`}),`возвращает access и refresh pair`],[(0,b.jsx)(b.Fragment,{children:`GET /tasks`}),`читает только задачи current user`],[(0,b.jsx)(b.Fragment,{children:`GET /admin/stats`}),`требует разрешение admin`]]}),(0,b.jsx)(r,{tone:`info`,children:`Одинаковое действие не обязано использовать одинаковый транспорт: session logout удаляет cookie, token logout отзывает refresh-session.`})]}),(0,b.jsxs)(l,{number:`03`,title:`Единый формат ошибок`,children:[(0,b.jsx)(c,{children:`Клиенту трудно обрабатывать API, если один router возвращает detail строкой, второй — произвольный dict, а третий — внутренний traceback. Финальный проект выбирает одну внешнюю форму.`}),(0,b.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,b.jsx)(`h3`,{children:`code`}),(0,b.jsx)(`p`,{children:`стабильный машинный идентификатор ошибки.`}),(0,b.jsx)(`h3`,{children:`message`}),(0,b.jsx)(`p`,{children:`безопасное пояснение для человека.`}),(0,b.jsx)(`h3`,{children:`request_id`}),(0,b.jsx)(`p`,{children:`необязательная связь с логом без выдачи внутренних деталей.`})]}),(0,b.jsx)(y,{caption:`контракт ошибки`,code:`from pydantic import BaseModel


class ErrorBody(BaseModel):
    code: str
    message: str
    request_id: str | None = None


class ErrorResponse(BaseModel):
    error: ErrorBody


example = ErrorResponse(
    error=ErrorBody(
        code="task_not_found",
        message="Task was not found",
        request_id="req-42",
    )
)`}),(0,b.jsx)(u,{question:`Какой ответ стабильнее для клиента?`,left:{title:`Случайный detail`,code:`{"detail": "something failed in service.py:81"}`,note:`Выдаёт внутреннюю деталь и не имеет стабильного кода.`},right:{title:`Единый envelope`,code:`{"error":{"code":"task_not_found","message":"Task was not found"}}`,note:`Форма одинакова для всех доменных отказов.`},preferred:`right`,explanation:`Клиент опирается на code, а внутренний traceback остаётся только в серверном логе.`}),(0,b.jsx)(r,{tone:`info`,children:`422 от Pydantic тоже нужно осознанно привести к внешнему контракту или честно документировать как отдельный стандартный формат.`})]}),(0,b.jsxs)(l,{number:`04`,title:`Схема данных и связи`,children:[(0,b.jsx)(c,{children:`Таблицы проектируются от сценариев. User владеет задачами и credentials, Category группирует задачи, Session и RefreshSession хранят отзывное состояние, Attachment связан с задачей и владельцем.`}),(0,b.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,b.jsx)(`h3`,{children:`User`}),(0,b.jsx)(`p`,{children:`id, email, username, password_hash, is_active, role.`}),(0,b.jsx)(`h3`,{children:`Auth state`}),(0,b.jsx)(`p`,{children:`server sessions и refresh sessions имеют token hash, expiry и revoked_at.`}),(0,b.jsx)(`h3`,{children:`Domain`}),(0,b.jsx)(`p`,{children:`Task с owner_id и category_id, Attachment с task_id и storage_name.`})]}),(0,b.jsx)(y,{caption:`ER-карта Personal StudyHub`,code:`users 1 ─────── * tasks
  │               │
  │               ├──── * attachments
  │               │
  │               └──── 0..1 category
  │
  ├──── * sessions
  └──── * refresh_sessions

categories 1 ─── * tasks`}),(0,b.jsx)(m,{prompt:`Соедините таблицу с причиной её существования.`,leftTitle:`Таблица`,rightTitle:`Ответственность`,pairs:[{left:`users`,right:`личность, парольный хеш и роль`},{left:`sessions`,right:`отзывная cookie-session на сервере`},{left:`refresh_sessions`,right:`rotation и revocation refresh token`},{left:`tasks`,right:`учебные задачи конкретного владельца`},{left:`attachments`,right:`метаданные файла и связь с task`}],explanation:`Каждая таблица поддерживает конкретный пользовательский или security-сценарий.`}),(0,b.jsx)(r,{tone:`info`,children:`Access token не обязательно хранить в базе. Отзывное состояние сосредоточено в refresh-session, а access живёт коротко.`})]}),(0,b.jsxs)(l,{number:`05`,title:`Дерево проекта и направление зависимостей`,children:[(0,b.jsx)(c,{children:`Папки нужны только там, где упрощают поиск ответственности. Routers знают HTTP, services знают сценарии, repositories или crud знают SQLAlchemy, models описывают таблицы, schemas — внешние данные.`}),(0,b.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,b.jsx)(`h3`,{children:`Верхний слой`}),(0,b.jsx)(`p`,{children:`main и routers связывают FastAPI, dependencies и response models.`}),(0,b.jsx)(`h3`,{children:`Средний слой`}),(0,b.jsx)(`p`,{children:`auth/task services реализуют сценарии и поднимают доменные исключения.`}),(0,b.jsx)(`h3`,{children:`Нижний слой`}),(0,b.jsx)(`p`,{children:`database, models и repositories выполняют хранение.`})]}),(0,b.jsx)(y,{caption:`минимальное дерево финального проекта`,code:`app/
├── main.py
├── config.py
├── database.py
├── models/
│   ├── user.py
│   ├── task.py
│   └── auth.py
├── schemas/
│   ├── auth.py
│   ├── task.py
│   └── error.py
├── services/
│   ├── password.py
│   ├── session.py
│   ├── token.py
│   └── task.py
├── dependencies/
│   ├── auth.py
│   └── permissions.py
├── routers/
│   ├── auth.py
│   ├── users.py
│   ├── tasks.py
│   └── admin.py
└── exceptions.py
tests/
alembic/`}),(0,b.jsx)(h,{title:`Соберите направление запроса`,prompt:`Расположите слои для PATCH /tasks/{task_id}.`,pieces:[{id:`router`,code:`router валидирует HTTP-контракт`},{id:`dependency`,code:`dependency получает current user`},{id:`service`,code:`service проверяет сценарий update`},{id:`repository`,code:`repository ищет task_id + owner_id`},{id:`db`,code:`Session выполняет SQL и commit`},{id:`reverse`,code:`model импортирует router`,note:`обратная зависимость`}],correctOrder:[`router`,`dependency`,`service`,`repository`,`db`],explanation:`HTTP-слой направляет запрос вниз, а модели хранения не импортируют routers.`}),(0,b.jsx)(r,{tone:`info`,children:`Для учебного проекта допустим простой crud.py вместо абстрактного repository-интерфейса. Название не важнее ясной ответственности.`})]}),(0,b.jsxs)(l,{number:`06`,title:`Базовая модель угроз`,children:[(0,b.jsx)(c,{children:`Security проектируется через конкретные злоупотребления. Для каждого актива называются нарушитель, путь атаки, защита и тест, который доказывает ожидаемый отказ.`}),(0,b.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,b.jsx)(`h3`,{children:`Credential theft`}),(0,b.jsx)(`p`,{children:`пароль, cookie, API key и refresh token не попадают в логи и ответы.`}),(0,b.jsx)(`h3`,{children:`IDOR`}),(0,b.jsx)(`p`,{children:`task ищется по task_id + current_user.id, а не только по id.`}),(0,b.jsx)(`h3`,{children:`Upload abuse`}),(0,b.jsx)(`p`,{children:`лимит, allowlist, серверное имя и ownership защищают файловый маршрут.`})]}),(0,b.jsx)(y,{caption:`минимальный threat register`,code:`threat_register = [
    {
        "asset": "task",
        "attack": "second user requests foreign task id",
        "control": "query by id and owner_id",
        "test": "two-user isolation test",
    },
    {
        "asset": "refresh session",
        "attack": "reuse old refresh token",
        "control": "rotation + revoked_at",
        "test": "old token returns 401",
    },
    {
        "asset": "upload directory",
        "attack": "path traversal filename",
        "control": "server-generated storage name",
        "test": "malicious filename stays inside directory",
    },
]`}),(0,b.jsx)(f,{cards:[{front:(0,b.jsx)(`strong`,{children:`IDOR`}),back:(0,b.jsx)(`span`,{children:`Запрашивать чужой task id и проверять owner_id на каждом read/update/delete.`})},{front:(0,b.jsx)(`strong`,{children:`Token replay`}),back:(0,b.jsx)(`span`,{children:`После rotation старый refresh token должен быть отозван и давать 401.`})},{front:(0,b.jsx)(`strong`,{children:`Path traversal`}),back:(0,b.jsx)(`span`,{children:`Не использовать клиентский filename как путь на диске.`})},{front:(0,b.jsx)(`strong`,{children:`Credential leak`}),back:(0,b.jsx)(`span`,{children:`Маскировать заголовки и не включать секреты в detail или логи.`})}]}),(0,b.jsx)(r,{tone:`info`,children:`Модель угроз не доказывает абсолютную безопасность. Она делает ключевые риски видимыми и превращает их в проверяемые требования.`})]}),(0,b.jsxs)(l,{number:`07`,title:`План реализации маленькими вертикальными срезами`,children:[(0,b.jsx)(c,{children:`Финальный проект нельзя безопасно собрать одним огромным коммитом. Вертикальный срез проходит от migration до TestClient и оставляет приложение запускаемым.`}),(0,b.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,b.jsx)(`h3`,{children:`Срез 1`}),(0,b.jsx)(`p`,{children:`config, database, migrations и health check на чистой базе.`}),(0,b.jsx)(`h3`,{children:`Срез 2`}),(0,b.jsx)(`p`,{children:`registration + password service + tests.`}),(0,b.jsx)(`h3`,{children:`Срез 3`}),(0,b.jsx)(`p`,{children:`session flow, затем JWT flow, затем protected tasks.`})]}),(0,b.jsx)(y,{caption:`порядок вертикальных срезов`,code:`implementation_order = [
    "clean database + alembic upgrade head",
    "register + duplicate email test",
    "session login/logout + cookie tests",
    "token login/refresh/revoke + rotation tests",
    "owned task CRUD + two-user tests",
    "admin permission + 403 tests",
    "attachment upload + boundary tests",
    "README + clean-room verification",
]`}),(0,b.jsx)(u,{question:`Какой план легче отлаживать?`,left:{title:`Сначала весь код`,code:`models -> all services -> all routers -> tests at end`,note:`Ошибки накапливаются, а рабочей контрольной точки долго нет.`},right:{title:`Вертикальные срезы`,code:`migration -> endpoint -> test -> commit`,note:`Каждый сценарий проходит полный путь и остаётся проверяемым.`},preferred:`right`,explanation:`Вертикальный срез даёт маленький diff и ранний интеграционный результат.`}),(0,b.jsx)(r,{tone:`info`,children:`Рефакторинг и изменение внешнего контракта лучше разделять по коммитам, чтобы причина регрессии была видна в истории.`})]}),(0,b.jsxs)(l,{number:`08`,title:`Контрольная точка архитектуры`,children:[(0,b.jsx)(c,{children:`До Lesson114 проект должен иметь согласованные артефакты: route map, schema map, tree, threat register, error contract и acceptance criteria. Они станут чек-листом реализации.`}),(0,b.jsxs)(`div`,{className:`lesson-practice-steps`,children:[(0,b.jsx)(`h3`,{children:`Проверяемость`}),(0,b.jsx)(`p`,{children:`для каждого обязательного сценария назван минимум один негативный тест.`}),(0,b.jsx)(`h3`,{children:`Связность`}),(0,b.jsx)(`p`,{children:`каждая таблица и папка поддерживает конкретное обещание продукта.`}),(0,b.jsx)(`h3`,{children:`Граница`}),(0,b.jsx)(`p`,{children:`отложенные темы перечислены явно и не попадают в текущий scope.`})]}),(0,b.jsx)(y,{caption:`definition of ready`,code:`architecture_done = all([
    route_map_is_complete,
    database_schema_is_drawn,
    errors_have_one_shape,
    threats_have_controls,
    acceptance_tests_are_named,
    out_of_scope_is_written,
])`}),(0,b.jsx)(g,{question:`Почему дерево папок нельзя считать архитектурой само по себе?`,hint:`Нужны причины существования и направление зависимостей.`,answer:(0,b.jsx)(`p`,{children:`Папки только размещают файлы. Архитектура появляется, когда понятны сценарии, контракты, ответственность каждого слоя, направление зависимостей и проверяемые границы.`})}),(0,b.jsx)(r,{tone:`info`,children:`К реализации переходят не после «идеальной схемы», а после достаточной ясности, чтобы следующий шаг был маленьким и проверяемым.`}),(0,b.jsxs)(`div`,{className:`lesson-check-group`,children:[(0,b.jsx)(d,{question:`С чего начинается финальный проект?`,options:[`с обязательных сценариев и границ`,`с максимального числа папок`,`с Dockerfile`],correctIndex:0,explanation:`Сначала фиксируется обещанное поведение и scope.`}),(0,b.jsx)(d,{question:`Что должно быть стабильным в ошибке?`,options:[`машинный code и форма envelope`,`полный traceback`,`имя Python-файла`],correctIndex:0,explanation:`Клиенту нужен предсказуемый внешний контракт.`}),(0,b.jsx)(d,{question:`Как защитить задачу от IDOR?`,options:[`искать по task_id и owner_id`,`скрыть id в документации`,`добавить длинное название`],correctIndex:0,explanation:`Ownership проверяется в запросе к данным, а не доверием к URL.`}),(0,b.jsx)(d,{question:`Что даёт вертикальный срез?`,options:[`полный проверяемый сценарий маленьким изменением`,`только новые модели`,`отсутствие тестов`],correctIndex:0,explanation:`Срез проходит от хранения до HTTP и автоматической проверки.`})]}),(0,b.jsx)(n,{points:[(0,b.jsx)(b.Fragment,{children:`Финальный проект начинается с обязательных сценариев и out-of-scope.`}),(0,b.jsx)(b.Fragment,{children:`Route map фиксирует method, path, credential, schemas и statuses.`}),(0,b.jsx)(b.Fragment,{children:`Единый error envelope отделяет внешний контракт от внутренних ошибок.`}),(0,b.jsx)(b.Fragment,{children:`Таблицы появляются из пользовательских и security-сценариев.`}),(0,b.jsx)(b.Fragment,{children:`Направление зависимостей идёт от HTTP-слоя к хранению.`}),(0,b.jsx)(b.Fragment,{children:`Threat register превращает риски в controls и тесты.`}),(0,b.jsx)(b.Fragment,{children:`Вертикальные срезы уменьшают область поиска ошибки.`}),(0,b.jsx)(b.Fragment,{children:`Definition of ready предшествует реализации Lesson114.`})]}),(0,b.jsx)(p,{text:`Подготовьте route map, ER-схему, дерево проекта, error envelope, threat register и список acceptance tests для Personal StudyHub. Не пишите маршруты до проверки этих артефактов.`})]})]})}export{S as Lesson113};
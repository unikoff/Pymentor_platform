# Архитектура и структура Pymentor Platform

Этот документ описывает, где находится продуктовый код, как части приложения связаны друг с другом и куда вносить типичные изменения. Инструкции по наполнению уроков приведены в [руководстве по контенту](../backend/learning/course_content/README.md), а frontend-слои и темы — в [README фронтенда](../frontend/src/README.md).

## Слои приложения

```text
Браузер
  └─ React + TypeScript (frontend/src)
       ├─ GET /learning/tracks, /learning/lessons
       ├─ POST /learning/tasks/... и /user/...
       └─ cookie сессии
            ↓
FastAPI (backend/main.py)
  ├─ routers/ — HTTP, проверка доступа и API-схемы
  ├─ learning/ — загрузка учебных материалов и запуск проверок
  ├─ services/ — внешние уведомления и фоновые задачи
  └─ DataBase/ — SQLAlchemy и постоянные данные
       ├─ SQLite по умолчанию
       └─ Redis helper в DataBase/session.py (не используется текущими user routes)

Учебный каталог (backend/learning/course_content)
  ├─ Markdown — теория и исходные материалы
  └─ Python-каталоги — ручные и автоматически проверяемые задания
```

В разработке Vite обслуживает интерфейс отдельно и проксирует `/user`, `/learning` и `/admin` на FastAPI. В production FastAPI раздаёт сохранённую сборку `frontend/dist`, поэтому браузер обращается к интерфейсу и API с одного origin.

## Карта репозитория

```text
.
├── backend/
│   ├── DataBase/                 модели, подключение и фабрика SQLAlchemy-сессий
│   ├── learning/
│   │   ├── course_content/       девять треков и каталоги практики
│   │   │   └── chapter_NN/block_NN/
│   │   │       ├── *.md          уроки и обзорные материалы
│   │   │       ├── manual.py     задания с ручной отметкой
│   │   │       └── code_tasks.py задания с автопроверкой
│   │   ├── content.py            сборка каталога уроков для API
│   │   ├── code_runner.py        проверка и запуск кода ученика
│   │   ├── runner_executor.py    ограничение параллельных запусков
│   │   └── runner_runtime.py     лимиты и протокол дочернего процесса
│   ├── routers/
│   │   ├── admin/                API администрирования
│   │   ├── learning/             API курсов, занятий и запуска кода
│   │   └── user/                 регистрация, профиль, прогресс и записи
│   ├── services/                 уведомления и интеграции
│   ├── tests/                    backend-регрессии
│   └── main.py                   создание FastAPI-приложения и подключение областей
├── frontend/
│   ├── config/                   конфигурация Vite и TypeScript
│   ├── src/
│   │   ├── app/                  оболочка приложения и рабочее пространство
│   │   ├── features/             функциональные области интерфейса
│   │   ├── lessons/              React-страницы отдельных уроков
│   │   └── shared/               общие API, темы, UI и утилиты
│   ├── index.html                HTML-точка входа Vite
│   └── dist/                     собранный frontend для production
├── docs/                         инструкции проекта и учебные концепции
├── .github/                      автоматизация и выпуск production-версии
├── requirements.txt              Python-зависимости
├── start.bat / start.sh          запуск backend и frontend для разработки
└── passenger_wsgi.py             точка подключения FastAPI к Passenger
```

`.venv`, `frontend/node_modules`, базы данных и кэши создаются локально и не являются исходным кодом. Файл `frontend/dist` генерируется Vite, но хранится в Git: production-хостинг раздаёт именно эту сборку и не компилирует frontend на сервере. Изменять нужно `frontend/src`, затем собирать `dist` по инструкции ниже.

## Backend

### `backend/DataBase/`

- `engine.py` загружает `backend/.env`, выбирает `DATABASE_URL` и создаёт SQLAlchemy `engine`, `SessionLocal` и базовый класс моделей. Без настройки используется SQLite-файл `backend/test.db`.
- `model.py` описывает пользователей, сессии, отметки активности и прогресса, слоты и квоты записи, а также события outbox уведомлений.
- `session.py` содержит Redis-функции сессий. Текущая HTTP-аутентификация из `routers/user/crud.py` работает с таблицей `Session` из `model.py`; `session.py` не импортируется активными роутами.

### `backend/learning/`

- `content.py` читает каталоги курсов и формирует список треков, модулей, уроков, правил доступа, стабильных ID и ревизий заданий.
- `course_content/` — источник учебного содержания. Каждый `chapter_NN/` содержит метаданные трека в `track.json`, подключение каталогов практики и папки `block_NN/` с Markdown и Python-файлами заданий. Подробная схема добавления треков и занятий описана в его [README](../backend/learning/course_content/README.md).
- `practice_helpers.py` содержит общие конструкторы данных для каталогов практики.
- `rich_practice.py` хранит ручную практику, а `rich_code_tasks.py` — задания для автоматической проверки.
- `code_runner.py` проверяет решение и строит результат выполнения; код запускается в дочернем процессе.
- `runner_executor.py` ограничивает конкурентные запуски между потоками и процессами приложения.
- `runner_runtime.py` задаёт лимиты ресурсов, обмен результатами и вспомогательный код дочернего процесса.

### `backend/routers/`

Каждая область разделяет HTTP-маршруты, функции работы с данными и схемы входа/выхода:

- `user/routers.py`, `crud.py`, `schemas.py` — регистрация и вход, cookie-сессия, профиль, учебная активность, квоты и бронирование.
- `learning/routers.py`, `schemas.py` — каталог курсов, содержимое занятия, контроль доступа, выполнение/отправка заданий и интерактивный интерпретатор.
- `admin/routers.py`, `schemas.py` — администраторские endpoints, управление аккаунтами и подписками, прогрессом и слотами.

`backend/main.py` подключает роутеры под префиксами `/user`, `/learning`, `/admin`, применяет CORS в режиме разработки, создаёт таблицы и выполняет совместимые обновления схемы. Если `frontend/dist/index.html` существует, он также подключает static assets и SPA fallback.

В `routers/admin/` операции сейчас реализованы непосредственно в `routers.py`; `schemas.py` содержит входные контракты. Для user-области обработчики обращаются к функциям в `crud.py`. В learning-области проверка доступа и работа с учебными данными находятся в `routers.py`, а формы ответов — в `schemas.py`.

### `backend/services/` и `backend/tests/`

- `telegram.py` форматирует и отправляет сообщения в Telegram.
- `notification_worker.py` выбирает события из outbox, удерживает блокировку worker-процесса, выполняет доставку и планирует повторные попытки.
- `local_notifications.py` запускает локальный цикл доставки вместе с FastAPI lifespan в поддерживаемом режиме.
- `tests/` содержит регрессии для runner, расписания/бронирований и уведомлений. CI запускает их командой `PYTHONPATH=backend python -m unittest discover -s backend/tests -v`.
- `fill_booking_slots.py` заполняет расписание слотами; `make_admin.py` — служебная команда для назначения администратора.

## Frontend

`app` собирает интерфейс из функциональных областей; `features/` и `lessons/` содержат поведение и страницы, а `shared/` — нижний слой общих модулей. Общие модули не должны импортировать `app`, `features` или `lessons`.

### `frontend/src/app/`

- `frontend/src/main.tsx` подключает глобальные стили и монтирует React вместе с `ThemeProvider`.
- `App.tsx` проверяет серверную сессию и выбирает экран входа или рабочее пространство.
- `Workspace.tsx` связывает выбранный курс, навигацию, боковую панель и Dockview.
- `workspace/WorkspaceWorkbench.tsx` настраивает панели Dockview и общие команды открытия.
- `workspace/WorkspacePanels.tsx` связывает пользовательские области с панелями Dockview; `workspace/WorkspaceActivityBar.tsx` и `workspace/LessonExplorer.tsx` отвечают за навигацию и список занятий.
- `workspace/layout.ts` хранит типы и операции над целями панелей; `workspace/usePanelOpened.ts` синхронизирует состояние при открытии панели.
- `styles/` разделяет базовые правила (`base.css`), дизайн-токены (`tokens.css`) и стили оболочки/панелей/адаптивности. `styles.css` собирает stylesheet-модули в нужном порядке. `workspace/dockview.css` оформляет Dockview.

### `frontend/src/features/`

- `auth/` — экран входа/регистрации и запросы сессии.
- `learning/` — API и состояние учебного каталога, теория, практика, навигация и онлайн-интерпретатор.
  - `theory/` загружает Markdown и отображает специальные страницы уроков.
  - `practice/` управляет автопроверяемыми заданиями, ручной практикой, состоянием редактора и результатами.
  - `code-workbench/` объединяет редактор, панель запуска, разделитель и вывод кода; интерпретатор и практика используют общий каркас.
  - `interpreter/` содержит собственный сценарий запуска кода без учебного задания.
  - `navigation/` обеспечивает переход между занятиями.
- `account/` — личный кабинет, календарь, загрузка расписания и регистрация посещения.
- `admin/` — административная панель. Вложенные `students/`, `progress/`, `slots/` владеют профилем ученика, прогрессом и расписанием соответственно.

У каждой области свой API/типизированный контракт и `index.ts`, который задаёт публичную поверхность для `app`. Подробнее о владельцах файлов и правилах темы — в [frontend/src/README.md](../frontend/src/README.md).

### `frontend/src/lessons/`

- `chapter_01/` … `chapter_09/` хранят страницы уроков по курсам; внутри `block_NN/` лежат компоненты занятий и относящиеся к ним изображения.
- `chapter_NN/index.ts` связывает путь Markdown из backend с компонентом конкретного урока.
- `page-registry.ts` создаёт общие ленивые React-компоненты по манифестам; Vite делает отдельные чанки, которые загружаются при открытии соответствующей страницы.
- `registry.ts` объединяет манифесты всех курсов.
- `components/` содержит повторно используемые блоки теории: макеты, демонстрации кода, диаграммы, вопросы и интерактивные упражнения. `components/styles/` — их стили.
- `shared.ts` сохраняет единый импорт общих учебных компонентов для файлов уроков.
- `course-placeholder.tsx` отображает состояние, когда страница занятия ещё не имеет специального компонента.

Если компонент занятия не зарегистрирован, теория рендерится из Markdown. Специальная страница дополняет это представление; она не заменяет источник материала в `backend/learning/course_content`.

### `frontend/src/shared/`

- `api/client.ts` добавляет production-префикс, отправляет cookie сессии и нормализует HTTP-ошибки.
- `api/contracts/` содержит общие типы запросов и ответов для аккаунта, администратора и пользователя.
- `theme/palettes.ts` задаёт семантические цвета; `catalog.ts` регистрирует темы и выбирает светлую/тёмную базовую схему; `ThemeProvider.tsx` применяет тему и хранит её выбор.
- `ui/async-boundary/` содержит границу ошибок и отложенной загрузки; `ui/calendar/` — календарную сетку; `ui/code-editor/` — редактор; `ui/theme-toggle/` — переключатель темы.
- `lib/` содержит независимые от интерфейса утилиты, например форматирование дат, подсветку Python и безопасное локальное хранилище.

Новая тема добавляется в `shared/theme/catalog.ts` и наследует полную палитру, переопределяя только нужные цвета. CSS использует смысловые переменные, а не привязку к названию темы. Это позволяет иметь несколько тем с одной базовой схемой и поддерживать схемы, не добавляя условие под каждый theme ID.

### `docs/`, конфигурация и выпуск

- `docs/manual/LESSON_AUTHORING_GUIDE.md` и `docs/manual/LESSON_PLAN_GUIDE.md` описывают подготовку содержания и планов занятий; `docs/PROJECT_CONTEXT.md` и `docs/manual/STUDYHUB_LEARNING_WORKFLOW.md` содержат контекст и процесс разработки учебной программы.
- `docs/concept/` хранит учебные концепции и паспорта блоков. Внутри `chapter_01/` … `chapter_04/` находятся `COURSE.md` и `BLOCK_N.md`; `chapter_01new/` — отдельная версия концепции первого курса. Эти документы задают план и не загружаются runtime-кодом приложения.
- `docs/manual/COURSE_CONCEPT_GUIDE.md` и `docs/manual/BLOCK_CONCEPT_GUIDE.md` задают формат концепций и паспортов блоков.
- `frontend/config/vite.config.ts` задаёт dev proxy и production base path; `tsconfig.json` проверяет исходники приложения, `tsconfig.node.json` — конфигурацию сборки.
- `frontend/package.json` описывает frontend-команды и зависимости; `package-lock.json` фиксирует версии npm-зависимостей.
- `requirements.txt` фиксирует Python-зависимости. Локальные настройки и секреты загружаются из неотслеживаемого `backend/.env`.
- `.github/workflows/release-production.yml` запускает проверки backend, production-сборку frontend и проверку опубликованной версии. `.github/PRODUCTION_AUTOMATION.md` описывает автоматизацию выпуска.
- `start.bat` и `start.sh` запускают frontend и backend локально; `passenger_wsgi.py` адаптирует FastAPI для Passenger на production-хостинге.

## Основные потоки

### Загрузка курса и страницы занятия

1. `App` открывает рабочее пространство; `useLearningCourse` запрашивает список треков через `features/learning/api.ts`.
2. При выборе трека frontend загружает список его занятий с `/learning/lessons`. Backend `learning/content.py` собирает его из Markdown и Python-каталогов практики.
3. Теория по умолчанию отображается из Markdown. Для отдельных страниц frontend сопоставляет `source_file` с ленивым компонентом из `lessons/chapter_NN/index.ts`; загрузчик забирает chunk при открытии.
4. Backend повторно проверяет доступ к теории и практике по статусу пользователя и подписке. UI-состояние не считается проверкой прав.

### Проверка кода и прогресс

```text
LearningPracticeView / OnlineInterpreter
  → features/learning/api.ts
  → backend/routers/learning/routers.py
  → права доступа + ревизия задания
  → runner_executor.py → code_runner.py → дочерний процесс Python
  → ответ / результат проверки
  → user_lesson_progress и user_task_progress (успешная отправка)
```

Операция запуска (`/run`) возвращает вывод без отметки о прохождении. Отправка решения (`/submit`) проверяет тесты и при успехе сохраняет прогресс. Исполнитель ограничивает время/объём вывода; CPU и память ограничиваются средствами ОС там, где они доступны. Это не полноценный контейнерный sandbox.

### Запись и уведомления

Пользовательский API проверяет слот и квоту в транзакции, сохраняет бронирование и событие уведомления. Worker отдельно забирает событие из outbox и доставляет его в Telegram. Сбой доставки сохраняет состояние и время повторной попытки, поэтому HTTP-запрос бронирования не зависит от доступности Telegram.

## Архитектурные решения

- **Контент отдельно от интерфейса.** Markdown и каталоги практики можно изменять, не встраивая тексты уроков в API и компоненты оболочки.
- **Стабильные идентификаторы.** ID урока строится по исходному файлу, а не по позиции в списке; карта совместимости в `learning/content.py` переносит старый прогресс.
- **Проверка доступа на backend.** Роутеры проверяют сессию, роль, подписку и доступность задания перед выдачей закрытого содержания или записью результата.
- **Функциональные области на frontend.** API, контракты, состояние и UI одной области находятся рядом; `app` знает о них через `index.ts`.
- **Повторно используемые компоненты по назначению.** Практика и интерпретатор делят каркас запуска/вывода, а предметное состояние остаётся у своего владельца.
- **Тема состоит из каталога и палитры.** ID темы не равен светлой/тёмной схеме; CSS-цвета описываются семантическими ролями.
- **Production-frontend собирается в CI.** Результат хранится в `frontend/dist`; workflow проверяет backend, собирает frontend с `/platform/` и публикует проверенную production-ветку.
- **Фоновые уведомления используют outbox.** Состояние доставки хранится в базе, а отправка и повторы выполняются отдельно от транзакции бронирования.

## Куда вносить изменения

| Нужно изменить | Начать отсюда |
| --- | --- |
| Текст или структуру теории | `backend/learning/course_content/chapter_NN/block_NN/*.md` и [LESSON_AUTHORING_GUIDE.md](manual/LESSON_AUTHORING_GUIDE.md) |
| Ручное упражнение или самопроверку | `backend/learning/course_content/.../manual.py` |
| Автоматически проверяемое задание | `backend/learning/course_content/.../code_tasks.py`; правила запуска — `backend/learning/code_runner.py` |
| Специальную React-страницу занятия | `frontend/src/lessons/chapter_NN/`, затем манифест `index.ts`; см. [README учебного контента](../backend/learning/course_content/README.md) |
| API учебного процесса | `backend/routers/learning/` и `frontend/src/features/learning/` |
| Личный кабинет/расписание | `backend/routers/user/`, `frontend/src/features/account/` |
| Админ-панель | `backend/routers/admin/`, `frontend/src/features/admin/` |
| Новую тему или цвет | `frontend/src/shared/theme/`; правила описаны в [README фронтенда](../frontend/src/README.md) |
| Оболочку, навигацию или вкладки | `frontend/src/app/` и `frontend/src/app/styles/` |
| Telegram-доставку | `backend/services/telegram.py`, `local_notifications.py`, `notification_worker.py` |

## Локальная разработка и проверки

Для обычного запуска на Windows подготовьте зависимости один раз:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
cd frontend
npm ci
cd ..
```

Запуск `start.bat` поднимает backend на `http://127.0.0.1:8001` и frontend на `http://127.0.0.1:5173` в двух окнах. Скрипт использует корневой `.venv` и уже установленный npm-пакет frontend. Для ручного запуска API-команду нужно выполнять из `backend`, потому что Python-пакеты backend импортируются оттуда:

```powershell
cd backend
..\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

Frontend запускается из `frontend` командой `npm run dev`. По умолчанию Vite проксирует API на `http://127.0.0.1:8001`; адрес можно изменить через `VITE_API_TARGET`. Настройки базы и секреты задаются в локальном `backend/.env`. Не добавляйте секреты в Git.

```powershell
# Backend-регрессии из корня репозитория
$env:PYTHONPATH = "backend"
python -m unittest discover -s backend/tests -v

# Проверка типов и production-сборка frontend
cd frontend
npm run build

# Сборка с URL-префиксом production-хостинга
$env:VITE_BASE = "/platform/"
npm run build
```

Не редактируйте сгенерированные файлы в `frontend/dist` вручную. Для production соберите frontend с `/platform/`; GitHub Actions выполняет эту сборку и проверяет, что задеплоена версия API с ожидаемым отпечатком контента. Правила выпуска описаны в [production workflow](../.github/workflows/release-production.yml).


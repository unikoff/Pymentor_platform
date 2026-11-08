# Core API

Единственный рабочий пакет — `pymentor_core`. Старый хостинг и новый профиль
используют одну реализацию. Это модульный монолит с границами для дальнейшего
выделения сервисов. Отдельный HTTP сервис курсов реализуется в MC2, не этим переносом.

```text
services/core-api/
  pymentor_core/
    app/                  factory, настройки, lifespan, сборка зависимостей, ASGI/WSGI/worker
    modules/
      identity/           аккаунты, права, вход и восстановление повторного запроса
      learning/           каталог, доступ и правила учебного прогресса
      practice/           отправка решения и порт исполнения
      bookings/           время, квоты и публичные операции бронирования
      landings/           заявки и представления
      notifications/      контракты, retry-политика и сервис очереди
      administration/     проверка доступа и административные HTTP сценарии
    adapters/
      sql/                общие модели, UoW и SQL реализации команд
      postgres/           async sessions, cleanup и защита импортированного outbox
      redis/              хранилище сеансов
      legacy_sqlite/      временный bootstrap/engine/triggers/SQL sessions
      course_local/       чтение существующих файлов через CourseCatalog/LessonContent/PracticeSpec
      legacy_runner/      текущий subprocess interpreter за портом
      telegram/           транспорт уведомлений
    shared/               внутренние порты, ошибки, неизменяемые bindings
  migrations/             один Alembic; выпущенные revisions сохранены
  tools/migration/        snapshot, preflight, import, recovery и ACL
  tools/maintenance/      явные команды администратора и слотов
  tools/lab/              probes и сохранённые исследовательские варианты
  tests/regression/       сохранённые сценарии API, данных, курсов и отказов
  tests/architecture/     автоматические проверки границ
```

HTTP выполняет валидацию/авторизацию и вызывает сценарий. Политика не импортирует
ORM/Redis. Адаптер фиксирует данные в UoW; outbox записывается вместе с бизнес-записью,
Telegram отправляется worker вне бизнес-транзакции. Код/токены не становятся событиями
аналитики. Shared — только внутренняя часть Core, не общий ORM-пакет микросервисов.

## Как ориентироваться и добавлять код

- `app/factory.py` собирает HTTP-приложение, `app/worker.py` запускает обработчик уведомлений.
- `app/wiring.py` подключает реализации; `app/paths.py` задаёт все пути к коду, контенту и writable state.
- `app/schema_policy.py` хранит единственную ожидаемую ревизию/набор таблиц и правила SQLite bootstrap.
- `modules/<область>/` содержит правила и операции области. `api/` — её HTTP-граница:
  роуты, модели запроса/ответа, авторизация и перевод ошибок.
- `adapters/<технология>/` содержит SQL, Redis, файловые и сетевые реализации. Блокировки,
  транзакции и внутренние SQL-функции не публикуются через HTTP-фасады.
- В `course_local` чтение практики и теории находится в `practice.py` и `theory.py`.
  Сценарии `complete_lesson.py` и `save_progress.py` лежат прямо в своих бизнес-модулях.
- `contracts/` — сохранённые внешние контракты; `shared/` — небольшие внутренние контракты Core.

Новый файл добавляется по ответственности, новая подпапка — когда в ней действительно
несколько связанных частей. Не нужны отдельные `application/` или `src/` ради одного файла.
Публичные границы и транзакционные гарантии сохраняются; количество файлов само по себе
не является поводом объединять разные бизнес-области или удалять проверки отказов.

Проверка зависимостей из корня проекта:

```powershell
python services/core-api/tools/check_architecture.py
```

Она анализирует реальный пакет, включая относительные импорты, и завершается с ошибкой
при пустом/отсутствующем каталоге, синтаксической ошибке или запрещённой зависимости.
Runtime не зависит от tools/tests; модули не импортируют адаптеры/Redis; shared не зависит
от приложения и бизнес-модулей. Чистые бизнес-правила не импортируют SQLAlchemy/FastAPI.
Динамические импорты проверяются отдельными тестами запуска, а не этим AST-анализатором.

## Два профиля

`legacy_sqlite`: прежний hosting/Passenger, SQL-сеансы, исходная `backend/test.db`.
`backend/main.py` явно выбирает его. Passenger инициализирует схему один раз при первом
HTTP запросе, поскольку WSGI-адаптер не запускает ASGI lifespan.

`postgres_redis`: явные `DATABASE_URL` (`postgresql+psycopg` или `postgresql+asyncpg`),
`REDIS_URL`, отдельный `PYMENTOR_REDIS_PREFIX`, `PYMENTOR_LOGIN_RECOVERY_KEY` (64 hex).
Секреты передаются окружением. Startup/readiness проверяют готовую схему и Redis;
скрытого перехода к SQLite/SQL-only входу нет. Профиль выбирается **до импорта** и меняется
только перезапуском процесса. Часть бизнес-запросов ещё использует sync PostgreSQL pool:
полный async — PYM-37, реальные replicas/load — PYM-250/252.

Content transport сейчас только `local`, адреса/ID/ревизии и frontend API сохранены.
`course_http` отклоняется до реализации MC2/PYM-481. Материалы остаются в
`../../backend/content/materials`; чистые authoring helpers принадлежат этим ресурсам.

## Локальные команды

Из корня проекта в PowerShell, с активированным существующим Python окружением:

```powershell
$env:PYTHONPATH="$PWD\services\core-api;$PWD\backend"
$env:PYMENTOR_PROFILE="legacy_sqlite"
# Для безопасного пробного запуска используйте отдельную копию, не рабочую test.db:
$env:DATABASE_URL="sqlite:///C:/temp/pymentor-demo.sqlite3"
python -m uvicorn pymentor_core.app.asgi:create_app --factory --host 127.0.0.1 --port 8001
```

Каталог C:/temp предварительно должен существовать. Приложение будет на
http://127.0.0.1:8001; `/health/live`, `/health/ready`, `/docs` доступны для проверки.
Для PostgreSQL задать перечисленное окружение, `PYMENTOR_PROFILE=postgres_redis` и
использовать ту же команду. Схема должна быть подготовлена отдельно; текущие migration
инструменты сохраняют строгую allowlist локальной лаборатории и не пригодны для VPS
без отдельного этапа принятия целевого сервера.

```powershell
python -m pymentor_core.app.worker --stats
python -m pytest services/core-api/tests -p no:cacheprovider
```

`--stats` не отправляет сообщения. Worker без этого флага отправляет реальную очередь;
не запускайте его на рабочей базе для пробной проверки. Перед тестами задайте
`DATABASE_URL=sqlite:///:memory:` и `PYTHON_DOTENV_DISABLED=1`. Окружения PG/Redis
выбираются отдельно, пропущенные тесты не являются PASS.

Старые команды `uvicorn main:app`, `python -m notifications.worker --stats` и
`python -m services.notification_worker --stats` из backend сохранены как короткие
переходники. Исследовательские алгоритмы больше не импортируются runtime.

## Tools и состояние

Из `services/core-api`, добавив текущий каталог и `../../backend` в PYTHONPATH:

```text
python -m tools.maintenance.make_admin user@example.test --database-url URL --dry-run
python -m tools.maintenance.fill_booking_slots 2027 01 --database-url URL --dry-run
```

Для применения заменить `--dry-run` на `--apply`. Целевая БД обязательна;
fill_booking_slots сохраняет прежнее ограничение SQLite. Никакого выбора рабочей
базы по умолчанию нет. Lab/probe команды запускаются `python -m tools.lab.NAME`,
миграционные — `python -m tools.migration.NAME`; их guards/ACL обязательны.

`PYMENTOR_STATE_DIR` — абсолютный каталог writable state вне пакета. Новый профиль
по умолчанию использует `data/core-api`; образ — `/app/data/core-api`. Старый профиль
сохраняет прежние lock/log пути backend, чтобы координироваться с работающими старыми
процессами. Логи и locks не включаются в образ. Исторический backend/output сохранён.

## Образ и выпуск

Из корня проекта:

```text
docker build -f services/core-api/Dockerfile --build-arg PROFILE=legacy_sqlite -t pymentor/core-api:local .
```

`PROFILE=postgres_redis` добавляет отдельные драйверы. Сборка копирует только canonical
pymentor_core и course resources, работает от UID 10001 и не содержит БД/.env/tests/tools/lab/
frontend/Git metadata. Публичные production данные в образ не попадают.

**Release gate:** существующий CI использует прежний context `./backend`. Его необходимо
отдельно переключить на этот Dockerfile и корень проекта перед выпуском. Git/CI/CD/сервер
этой работой не обновлялись. История проверок и реальные ограничения —
`../../docs/assistant/backend-modularity/final-acceptance.md`.

## Масштабирование

Сохраняются отдельные точки запуска API и notification worker. В PostgreSQL/Redis-профиле
они используют общие хранилища; файлы курса подключены через заменяемый адаптер. Это
позволяет развивать и размещать процессы отдельно, сохраняя одну реализацию правил.
SQLite остаётся переходным режимом для одного экземпляра. Эта структурная переработка
не измеряет допустимое число реплик или пользователей: нагрузка, полный async и выделение
сервиса курсов остаются отдельными задачами PYM-250/252, PYM-37 и MC2.

Результаты текущего упрощения: [structure-simplification.md](../../docs/assistant/backend-modularity/structure-simplification.md).

## Что удалить после принятого переезда (C5/PYM-56/PYM-480)

Удалить `adapters/legacy_sqlite`, старые main/Passenger/cron переходники, SQLite-настройки
и compatibility manifests только после принятого переключения. Сами базы/резервные копии
не удаляются автоматически. Course-local и legacy-runner имеют собственные этапы замены;
их нельзя удалить вместе с SQLite. Retention резервных копий остаётся открытым решением Jira.

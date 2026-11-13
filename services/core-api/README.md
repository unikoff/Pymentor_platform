# Core API

Единственный рабочий пакет — `pymentor_core`, runtime — PostgreSQL и Redis.
Это модульный монолит с границами для дальнейшего
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
- `app/schema_policy.py` хранит ожидаемую ревизию/набор таблиц; runtime не выполняет DDL.
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

## Единственный runtime

Явные `DATABASE_URL` (`postgresql+psycopg` или `postgresql+asyncpg`),
`REDIS_URL`, отдельный `PYMENTOR_REDIS_PREFIX`, `PYMENTOR_LOGIN_RECOVERY_KEY` (64 hex).
Секреты передаются окружением. Startup/readiness проверяют готовую схему и Redis;
скрытого перехода к SQLite/SQL-only входу нет. PYMENTOR_PROFILE не требуется;
старые значения отклоняются. Смена целевой DB требует нового процесса.
Часть бизнес-запросов ещё использует sync PostgreSQL pool:
полный async — PYM-37, реальные replicas/load — PYM-250/252.

Для постепенного переименования настроек сессий Core принимает
`KNOWI_REDIS_PREFIX` и `KNOWI_LOGIN_RECOVERY_KEY` как равнозначные имена для
`PYMENTOR_REDIS_PREFIX` и `PYMENTOR_LOGIN_RECOVERY_KEY`. Если заданы оба имени,
их значения должны совпадать, иначе запуск завершится ошибкой без вывода секрета.
До вывода старых версий из эксплуатации сохраняйте прежние имена и точные значения:
смена значения префикса или ключа влияет на существующие сессии и повторный вход.
Подписанные ссылки пока выпускаются в прежнем формате, а новая версия умеет
читать прежний и подготовленный `knowi`-формат; переключение выпуска — отдельный этап.

Content transport сейчас только `local`, адреса/ID/ревизии и frontend API сохранены.
`course_http` отклоняется до реализации MC2/PYM-481. Материалы остаются в
`../../backend/content/materials`; чистые authoring helpers принадлежат этим ресурсам.

## Локальные команды

Из корня проекта в PowerShell, с активированным существующим Python окружением:

```powershell
$env:PYTHONPATH="$PWD\services\core-api;$PWD\backend"
$env:DATABASE_URL="postgresql+psycopg://<user>:<secret>@<host>:5432/<database>"
$env:REDIS_URL="redis://<host>:6379/0"
$env:KNOWI_REDIS_PREFIX="<environment>:"
$env:KNOWI_LOGIN_RECOVERY_KEY="<64 hex characters>"
python -m uvicorn pymentor_core.app.asgi:create_app --factory --host 127.0.0.1 --port 8001
```

Приложение будет на http://127.0.0.1:8001. Схему предварительно применяет отдельная
операция: `python -m alembic -c services/core-api/alembic-runtime.ini upgrade head`.
Перед ней задать KNOWI_MIGRATION_URL (asyncpg), KNOWI_MIGRATION_HOST,
KNOWI_MIGRATION_DATABASE и KNOWI_MIGRATION_USER с совпадающей явной целью.
Миграционная роль имеет DDL-права; runtime роль не обязана их иметь.
Старые lab-инструменты сохраняют свою строгую allowlist.

Полный disposable smoke из корня репозитория (Docker Compose):

```powershell
pwsh -File scripts/local-postgres-redis/smoke.ps1
```

Команда собирает canonical runtime и отдельный migration target, запускает PostgreSQL
и Redis без постоянных volumes/публичных портов, применяет миграции, проверяет
health → login/cookie → PostgreSQL write/read → logout → worker --stats, затем удаляет
только свой Compose project. Все данные/ключи в этом stack синтетические.
Canonical build: `docker build -f services/core-api/Dockerfile --target runtime -t knowi/core-local:pg06 .`.
Runtime зависимости: requirements-runtime.txt; Alembic только в target migrations.
Legacy SQLite adapter/WSGI wrappers исключены из build context, контент курса включён.

```powershell
python -m pymentor_core.app.worker --stats
# CI runner with actual disposable PG/Redis services provisioned by release.yml:
python scripts/ci/preview_checks.py
```

Целевые test groups заданы в `tests/runtime_suites.json`: unit/contract,
реальные PG/Redis scenarios и HTTP modules с отдельной DB identity/процессом.
CI требует PostgreSQL на loopback57382 (DB/user pymentor_test) и Redis57381;
создаёт только именованные disposable DB через отдельный migration operation.
Для собственного disposable стенда задать KNOWI_TEST_PG_URL и
KNOWI_TEST_REDIS_URL по этому ограниченному контракту. Скрипт откажется при
отсутствии сервисов, пустом результате или skipped critical tests.
Старые lab/import/recovery tests сохраняют собственные guards и выполняются
отдельно; весь исторический tests tree не является одной runtime-матрицей.

`python scripts/ci/check_single_runtime.py` проверяет production sources/config,
а `--image IMAGE` дополнительно запускает network-disabled nonroot assembly check.
`python scripts/ci/image_smoke.py` выполняет canonical build и disposable smoke.

`--stats` не отправляет сообщения. Worker без этого флага отправляет реальную очередь;
не запускайте его на рабочей базе для пробной проверки. Перед тестами задайте
`DATABASE_URL=sqlite:///:memory:` и `PYTHON_DOTENV_DISABLED=1`. Окружения PG/Redis
выбираются отдельно, пропущенные тесты не являются PASS.

Старые команды `uvicorn main:app`, `python -m notifications.worker --stats` и
`python -m services.notification_worker --stats` из backend сохранены как короткие
переходники. Исследовательские алгоритмы больше не импортируются runtime.

## Tools и состояние

### Почта аккаунта

Для подтверждения почты и смены пароля через ссылку задаются переменные из
`backend/.env.example`: `PYMENTOR_EMAIL_TOKEN_SECRET` (случайный секрет не менее
32 байт), `PYMENTOR_EMAIL_PUBLIC_URL` (публичный HTTPS-адрес входа в платформу),
`PYMENTOR_SMTP_HOST`, `PYMENTOR_SMTP_PORT`, `PYMENTOR_SMTP_FROM`,
`PYMENTOR_SMTP_USERNAME`, `PYMENTOR_SMTP_PASSWORD`, `PYMENTOR_SMTP_STARTTLS`.
Секрет и пароль хранятся в защищённом окружении, а не в репозитории.
Локальный SMTP-приёмник на loopback можно использовать с `PYMENTOR_SMTP_STARTTLS=0`
и локальным HTTP URL; для удалённого SMTP требуется STARTTLS, для публичного URL — HTTPS.

Письма отправляются синхронно с сетевым таймаутом; при сбое пользователь может
запросить письмо повторно. Подтверждение действительно 24 часа, ссылка пароля —
30 минут; после успешной смены старые ссылки пароля и подтверждения недействительны. Публичное
восстановление разрешено только для `verified=true` и возвращает одинаковый ответ
для неподтверждённого и неизвестного адреса. Смена из действующей сессии доступна
также при `verified=false` и сама по себе не подтверждает адрес.
Одинаковый текст и HTTP-ответ не устраняют различия во времени ответа: для
подтверждённого адреса запрос ожидает синхронную отправку через SMTP.

В PostgreSQL/Redis ограничения частоты общие для процессов через Redis и при его
ошибке запрос отклоняется. В legacy SQLite ограничения находятся в памяти процесса:
для нескольких процессов/хостов они не образуют общий лимит. Перед публичным
использованием такого профиля нужен проверенный общий лимит на входном прокси.
Старый C232 lab importer намеренно закреплён за предыдущей схемой; его совместимость
с переносом нового поля необходимо подтвердить отдельно перед такой миграцией данных.
Тестовая Alembic-среда по-прежнему ограничена разрешённой локальной БД; новая ревизия
`c501_verified` не является проведённой миграцией рабочего окружения.

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

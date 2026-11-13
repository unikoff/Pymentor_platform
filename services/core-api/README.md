# Core API

Единственный рабочий пакет — `pymentor_core`, runtime — PostgreSQL и Redis.
Это модульный монолит с границами для дальнейшего
выделения сервисов. Отдельный HTTP сервис курсов реализуется в MC2, не этим переносом.

```text
services/core-api/
  pymentor_core/
    app/                  factory, настройки, lifespan, сборка зависимостей, ASGI/worker
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

Core требует явные `DATABASE_URL` (PostgreSQL), `REDIS_URL`, Redis prefix и login recovery key.
SQLite default/fallback, SQL-only auth и выбор двух DB-профилей отсутствуют.
`PYMENTOR_PROFILE` не нужен; старые значения отклоняются. Приложение не загружает `.env`
и не применяет DDL на startup/readiness. Настройки передаются окружением/Secret store.

На AlphaVPS уже актуальные данные. Этот спринт удаляет legacy-код; новый перенос,
importer, переинициализация сессий и повторный cutover не требуются.
Пример переменных без секретов: [`backend/.env.example`](../../backend/.env.example).

| Настройка | Контракт |
| --- | --- |
| `DATABASE_URL` | `postgresql+psycopg://...` или `postgresql+asyncpg://...`; обязательна |
| `REDIS_URL` | `redis://...` или `rediss://...`; обязательна |
| `KNOWI_REDIS_PREFIX` | Отдельный namespace окружения; сохранить текущее значение |
| `KNOWI_LOGIN_RECOVERY_KEY` | 64 hex символа; сохранить текущий ключ для повторов входа |
| `PYMENTOR_STATE_DIR` | Writable абсолютный каталог для локальных locks; не база данных |
| `PYMENTOR_CONTENT_TRANSPORT` | Сейчас `local`; HTTP transport принадлежит MC2 |

`PYMENTOR_REDIS_PREFIX` и `PYMENTOR_LOGIN_RECOVERY_KEY` остаются равнозначными aliases.
При одновременном задании KNOWI/PYMENTOR значения должны совпадать. Изменение prefix/key
затрагивает существующие сессии; cleanup сохраняет текущие Secret references и значения.
PostgreSQL `sessions` хранит digests/revocation/committed-operation evidence; это не SQL-only
способ входа. HTTP auth требует Redis. При его недоступности возвращается контролируемый
отказ; восстановление потерянной проекции допускается только по подтверждённой операции.

Общие SQL models/UoW, sync PostgreSQL и Alembic history сохраняются. Полный async,
нагрузка/HA и отдельный сервис курсов — самостоятельные задачи. Контент остаётся в
`backend/content`; ID, ревизии, API и независимая ось local/HTTP content не меняются.

## Установка и запуск

Из корня проекта, в активном Python окружении (canonical image использует Python3.12):

```powershell
python -m pip install -r services/core-api/requirements-runtime.txt
$env:PYTHONPATH="$PWD\services\core-api;$PWD\backend"
$env:DATABASE_URL="postgresql+psycopg://<app-role>:<secret>@<host>:5432/<database>"
$env:REDIS_URL="redis://<host>:6379/0"
$env:KNOWI_REDIS_PREFIX="<environment>:"
$env:KNOWI_LOGIN_RECOVERY_KEY="<existing 64 hex characters>"
python -m uvicorn pymentor_core.app.asgi:create_app --factory --host 127.0.0.1 --port 8001
```

Для разработки API+Vite доступны корневые `start.bat`/`start.sh` через `scripts/start.*`.
Они требуют экспортированное окружение и запускают тот же canonical ASGI factory.
Backend автоматически не выбирает SQLite и не читает локальную `.env`.

### Схема PostgreSQL

Ожидаемая ревизия — `c503_dual_email_change`, включая verified/email-change state.
У текущего AlphaVPS она уже применена; cleanup новых revisions не добавляет.
Runtime-роль использует DML, отдельная migration-роль — DDL. При выпуске с новой схемой
оператор отдельно применяет проверенный migration image/command к явной цели, до старта API:

```powershell
python -m pip install -r services/core-api/requirements-migration.txt
# Через защищённое окружение задать совпадающие KNOWI_MIGRATION_URL (asyncpg),
# KNOWI_MIGRATION_HOST, KNOWI_MIGRATION_DATABASE, KNOWI_MIGRATION_USER.
python -m alembic -c services/core-api/alembic-runtime.ini upgrade head
```

Это не команда импорта данных и не обязательный шаг текущего cleanup на AlphaVPS.
Не подменять runtime DSN migration credentials. Исторические revision IDs и проверенный
additive schema bridge сохраняются. Старые lab/import инструменты имеют отдельные guards;
они не являются альтернативным runtime и не запускаются обычным install/start.

### Worker и health

```powershell
python -m pymentor_core.app.worker --stats
```

`--stats` читает статистику без отправок. Обычный worker без этого флага обрабатывает
настоящий outbox; API не запускает sender автоматически. Пробные сценарии используют
синтетические данные и sinks. Telegram/SMTP credentials не копируются в тестовую среду.

`GET /health/live` — процесс жив; `GET /health/startup` — startup окончен;
`GET /health/ready` — доступны необходимые PostgreSQL schema/Redis. Ошибка зависимости
не включает SQLite fallback. Перед проверками отказов используется disposable среда.

## Образ, smoke и CI

```powershell
docker build -f services/core-api/Dockerfile --target runtime -t knowi/core-local:pg06 .
docker build -f services/core-api/Dockerfile --target migrations -t knowi/core-local-migrations:pg06 .
pwsh -File scripts/local-postgres-redis/smoke.ps1
```

Один Dockerfile, без build-time DB profile. Runtime работает от UID10001, содержит Core
и материалы курса, исключает SQLite adapter/wrappers, БД, `.env`, Git/tests/lab и Alembic.
Migration tooling находится в отдельном target. Smoke поднимает только свой временный
Compose project (PG/Redis, без host ports/постоянных volumes), проверяет health → login/
cookie → PG write/read → logout → worker stats и убирает только свои ресурсы.

```powershell
python scripts/ci/check_single_runtime.py
python scripts/ci/check_single_runtime.py --image knowi/core-local:pg06
python scripts/ci/image_smoke.py
# Сервисные test groups требуют отдельные disposable PG/Redis по release.yml:
python scripts/ci/preview_checks.py
```

Группы: `tests/runtime_suites.json`. Required CI использует loopback57382 (DB/user
pymentor_test), Redis57381, внешнюю подготовку только именованных test DB и отдельные
процессы HTTP suites. Пустой/failed/skipped JUnit, недоступные сервисы и SQLite import/DSN
блокируют gate. Исторические lab/archive проверки отделены от runtime-матрицы.

Canonical pipeline — `.github/workflows/release.yml`, candidate через PR в `Release`.
Checks обязательны; images/publish выполняются только разрешённым push в Release.
Успешный PR CI не означает merge или deployment. Для выпуска фиксируются source SHA,
runtime/migration digests и config revision; фактический rollout проверяется отдельно.

## Почта и состояние

Email links: `PYMENTOR_EMAIL_TOKEN_SECRET` (не менее32байт),
`PYMENTOR_EMAIL_PUBLIC_URL` (HTTPS), `PYMENTOR_SMTP_HOST/PORT/FROM/USERNAME/PASSWORD/STARTTLS`.
Секреты хранятся вне Git. Для loopback SMTP sink разрешены локальный HTTP и STARTTLS0;
удалённый SMTP требует STARTTLS. Общие rate limits находятся в Redis, отказ не включает
process-local limiter. Формат подписанных ссылок/сроки и проверка verified сохраняются.

`PYMENTOR_STATE_DIR` по умолчанию `data/core-api`, в образе `/app/data/core-api`.
Для worker/Runner с локальными locks каталог должен быть writable; локальные файлы не
заменяют PostgreSQL transactional state и Redis. Логи/locks не включаются в image.

## Работа с уже существующими данными

Cleanup не меняет PostgreSQL tables/roles, Secret values/prefixes, данные и действующие
сессии. Старые SQLite/PG backup, приватные snapshot и существующие import/recovery tools
сохраняются отдельно; перенос из них не входит в этот спринт. Снятие template с desired
state не является разрешением удалить фактический PVC/архив.

Backup/restore текущего PostgreSQL выполняются по существующему операторскому runbook
и политике CORP-426; это отдельная операция с проверкой целевой БД и сохранением новых
записей. Возврат runtime DSN к старому SQLite snapshot не является recovery.

Read-only baseline AlphaVPS13.11: `knowi01`, namespace`pymentor`, PostgreSQL revisionc503,
Redis PING/readiness200; Core/worker используют Secret`preview-migrated-runtime`, без
SQLite mounts. Подробные checks и ограничения — CORP-519 в Jira. Данные/секреты не
дублируются в документации. SQLite adapter, Passenger/cron wrappers и старые build profiles удалены;
course-local/Runner сохраняются до своих отдельных переходов.

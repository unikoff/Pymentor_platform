# C2.2.4 — локальный baseline бюджетов PostgreSQL-пулов

Статус: начальный source baseline; задача не закрыта.

Дата сбора: 2026-11-05. Среда: изолированный worktree `core-legacy-release/Pymentor_platform`.

## Источники текущего кода

| Путь | Наблюдаемый предел одного Engine | Назначение/оговорка |
|---|---:|---|
| `backend/infrastructure/async_pg.py` | `pool_size=5`, `max_overflow=5`, `pool_timeout=10s`; максимум **10** одновременных checked-out соединений | Generic async adapter; ограничения аргументов: pool size 1..20, overflow 0..10. Вызовы по репозиторию нужно отличать от production wiring. |
| `backend/infrastructure/dual_async_pg.py` | По умолчанию 5+5=**10**; `pool_timeout=10s`; `pool_pre_ping=True` | Отдельный loopback-only local async adapter. |
| `backend/dual_local.py` | Явно `pool_size=3`, `max_overflow=0`; максимум **3** на экземпляр; timeout 3s | Опциональный локальный legacy/API integration harness, URL жёстко ограничен disposable PostgreSQL `127.0.0.1:57152/pymentor_test`, пользователь `pymentor_test`. |
| `backend/db/engine.py` | В dual local режиме sync Engine: явно 3+0=**3**, timeout 3s. Иначе pool options не заданы | При PostgreSQL URL вне dual local SQLAlchemy QueuePool по умолчанию — 5+10=**15**. Это библиотечный default, не явная настройка проекта; см. заметку о документации ниже. |
| `backend/tests/c216_uvicorn_fixture.py` / `c216_crash_fixture.py` | 2+0=**2** / 1+0=**1** | Специальные тестовые процессы, не нормативная настройка приложения. |

`AsyncDatabase` в `backend/infrastructure/async_pg.py` пока обнаружен как отдельный adapter; найденные явные сборки локального runtime используют `dual_async_pg.AsyncDatabase`. Не считать generic defaults доказанным runtime budget до фиксации того, какой adapter подключён к целевой конфигурации.

## Репличный бюджет (арифметика конфигурации, не измерение)

При `R` одинаковых одновременно работающих процессах/репликах верхняя граница соединений равна `R × (pool_size + max_overflow)` для каждого Engine в процессе. Предполагается один экземпляр Engine на процесс; дополнительные Engine, миграции, фоновые процессы, health checks с подключением и внешние клиенты в таблице не учтены.

| Конфигурация | 1 экземпляр | 2 экземпляра | 3 экземпляра |
|---|---:|---:|---:|
| Generic async defaults 5+5 | 10 | 20 | 30 |
| `dual_local.py` async 3+0 | 3 | 6 | 9 |
| `db.engine` в dual local sync 3+0 | 3 | 6 | 9 |
| `db.engine` с неявным SQLAlchemy QueuePool default 5+10 | 15 | 30 | 45 |

Эти числа — ceiling для приложения, не рекомендованный размер PostgreSQL и не результат нагрузки. Async и sync бюджеты нужно суммировать, только если обе стороны реально открыты к одному серверу одновременно. Для тестов, создающих несколько Engine, учитывать каждый Engine отдельно.

## Что подтверждают deployment-профили

В `deploy/helm/pymentor/values-local-single.yaml`, `values-local-multinode.yaml`, `values-production-single-vps.yaml`, `values-future-production-ha.yaml` и `values.yaml` Core имеет `replicaCount: 1`. Даже файл с именем `future-production-ha` явно называет себя scaffold; его комментарий говорит, что PostgreSQL и Stage 2 migration — prerequisites для Core replicas > 1. `templates/deployment-core.yaml` передаёт `DATABASE_URL` из Secret, но chart не задаёт PostgreSQL workload и пул. Поэтому приложение с 2+ Core replicas и PostgreSQL не подтверждено этими профилями; арифметика выше является расчётом сценария, не активной конфигурацией.

## Локальная доступность БД и безопасная граница

- `Test-NetConnection 127.0.0.1 -Port 57152 -InformationLevel Quiet` вернул `True`: TCP-порт слушает.
- Без расширенных прав `docker ps` вернул `permission denied`; после разрешённого запуска с расширенными правами обнаружен работающий контейнер `pymentor-c2-local-postgres`, отображающий `127.0.0.1:57152` на порт PostgreSQL.
- Read-only запрос внутри контейнера показал `current_database=pymentor_test`, `current_user=pymentor_test`, PostgreSQL `16.15`, `max_connections=100`. Запросы не изменяли данные. Имена и порт подтверждают тестовое назначение, но сами по себе не доказывают, что текущие данные можно уничтожать: все измерения с изменением данных требуют отдельной disposable базы.
- В проекте есть runtime guard для disposable базы: `backend/dual_local.py` принимает только loopback `127.0.0.1:57152`, database/user `pymentor_test`, без query parameters, а затем read-only проверяет `current_database()`, `current_user` и `alembic_version`. Текущий порт сам по себе не доказывает прохождение этого guard.

## Воспроизводимые команды для последующего замера

Команды ниже намеренно не содержат пароля/URL. Выполнять только после выдачи `PYMENTOR_TEST_PG_URL` на подтверждённую disposable test DB (guard уже есть в `backend/tests/c222_pg_guard.py`). Не использовать production/development URL. Не печатать значение переменной в логи/отчёт.

```powershell
# В текущей backend-среде с установленными async-test requirements:
$env:PYMENTOR_TEST_PG_URL = Read-Host 'Вставьте URL только disposable pymentor_test DB'
python -m pytest -q backend/tests/test_c2_2_3_async_pg.py
Remove-Item Env:PYMENTOR_TEST_PG_URL
```

Для наблюдения исключительно серверных read-only метрик через `psql` (только после того, как локальный `pg_service.conf` service `pymentor-disposable` настроен на disposable test DB и пароль берётся из отдельного passfile; не использовать default connection settings и не передавать URL аргументом командной строки):

```powershell
$env:PGSERVICE = 'pymentor-disposable'
psql -X -v ON_ERROR_STOP=1 -c "SELECT current_database(), current_user, version();"
# Продолжать только если identity совпала с disposable DB и тестовой ролью.
psql -X -v ON_ERROR_STOP=1 -c "SHOW max_connections;"
psql -X -v ON_ERROR_STOP=1 -c "SELECT state, count(*) FROM pg_stat_activity WHERE datname = current_database() GROUP BY state ORDER BY state;"
Remove-Item Env:PGSERVICE
```

Для воспроизводимого плана разрешён только `EXPLAIN (ANALYZE, BUFFERS)` над заранее выбранными read-only `SELECT` на disposable DB с synthetic seed. `ANALYZE` действительно исполняет запрос; не применять к DML/DDL или неизвестной базе. Команду конкретного запроса, schema/data volume, PostgreSQL version, план, buffers и повторения нужно сохранить в следующем evidence документе. Этот baseline не запускал EXPLAIN.

## Что ещё требуется для закрытия C2.2.4

1. Зафиксировать от ответственного runtime пути фактически используемые adapter/Engine, количество процессов (включая worker-настройку и фоновые workers), Core replicas и серверный `max_connections`; сейчас chart оставляет Core на одной реплике и PostgreSQL в нём не развёрнут.
2. На идентифицированной disposable PostgreSQL с synthetic dataset выполнить нужные реальные `EXPLAIN (ANALYZE, BUFFERS)` для целевых запросов, записать версию, DDL/индексы, размер данных, планы и buffers. Никаких `ANALYZE` над рабочими данными.
3. Выполнить конкурентную нагрузку сначала на 1, затем на согласованном числе реплик/процессов с фиксированным профилем запросов, duration, concurrency, dataset и версии. Снять throughput, error/timeout rate, pool wait/checkout saturation, PostgreSQL connection counts/CPU/I/O, и p50/p95/p99 latency; повторить достаточно раз, чтобы сообщить разброс.
4. Проверить поведение при достижении лимита пула и сопоставить суммарные бюджеты всех процессов с `max_connections` за вычетом резерва администрирования и прочих клиентов. Не выводить capacity/SLO из одних лишь pool ceilings.

## Источники и точность

Значения и deployment-факты сняты из указанных локальных файлов текущего worktree. Для неявного sync default использована официальная документация SQLAlchemy 2.0 `QueuePool`: `pool_size=5`, `max_overflow=10`, `timeout=30s`; это документированный default, а не параметр, записанный в `backend/db/engine.py`. См. [SQLAlchemy 2.0 QueuePool documentation](https://github.com/sqlalchemy/sqlalchemy/blob/rel_2_0_55/doc/build/core/pooling.rst) и [Engine pooling](https://github.com/sqlalchemy/sqlalchemy/blob/rel_2_0_55/doc/build/core/engines.rst). Версия зависимости в `backend/requirements-async-local.txt` — `SQLAlchemy==2.0.51`; справка Context7 была для близкой официальной версии 2.0.55. Измерения производительности, планы, p95 и результаты нагрузочных тестов отсутствуют.

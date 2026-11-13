# Email: локальная проверка спринта

Проверено 11 ноября 2026 года на синтетических аккаунтах. Это не отчёт о
развёртывании и не подтверждение доставки через реального почтового провайдера.

## Результаты

- PostgreSQL 16 в отдельном Docker-контейнере: миграция с `c426_deletion_outbox`
  до `c501_verified` сохранила созданного до миграции пользователя и установила
  `verified=false`.
- Python 3.12: 85 проверок сессий и Redis прошли, одна проверка рестарта Redis
  пропущена: она требует отдельного специально именованного контейнера. Отказы
  Redis и сохранность сессий проверяются остальными тестами набора.
- Интеграционный сценарий PostgreSQL/Redis прошёл: регистрация, подтверждение,
  смена и восстановление пароля, отзыв двух сессий, параллельное применение
  одной ссылки и вход со старым паролем, начатый до смены.
- Python 3.12: 58 проверок SQLite, контрактов API и локального SMTP прошли.
- Frontend: 11 тестов, проверка TypeScript и production-сборка прошли.
- В отдельном Linux Chromium на локальной SQLite и тестовом SMTP пройден полный
  пользовательский путь от регистрации до входа после восстановления пароля.
  Мобильное отображение и плашка для обоих состояний проверены отдельно.

## Команды для повторения

Из корня репозитория в отдельном Python-окружении с зависимостями проекта и
тестовыми `pytest`, `httpx`, `asyncpg`, `psycopg` и `alembic`:

```powershell
$env:PYTHONPATH='services/core-api;services/core-api/tests/regression'
python -m pytest services/core-api/tests/regression/test_email_verified_state.py services/core-api/tests/regression/test_email_tokens.py services/core-api/tests/regression/test_account_email_transport.py services/core-api/tests/regression/test_c2_1_4_auth_legacy.py services/core-api/tests/regression/test_c435_login_operations_schema.py services/core-api/tests/regression/test_c2_1_4_principal.py services/core-api/tests/regression/test_c2_1_3_errors.py services/core-api/tests/regression/test_c2_1_3_api_contracts.py -q
```

Для следующих проверок нужны только отдельные тестовые PostgreSQL и Redis,
разрешённые встроенными ограничениями: PostgreSQL на `127.0.0.1:57152`, база и
пользователь `pymentor_test`; Redis на `127.0.0.1:57146/0`. К PostgreSQL заранее
применяются миграции из `services/core-api/alembic.ini` через
`PYMENTOR_MIGRATION_URL`. Не указывать рабочие базы.

```powershell
$env:PYMENTOR_TEST_PG_URL='postgresql+asyncpg://pymentor_test@127.0.0.1:57152/pymentor_test'
$env:PYMENTOR_TEST_REDIS_URL='redis://127.0.0.1:57146/0'
$env:PYTHONPATH='services/core-api;services/core-api/tests/regression'
python -m pytest services/core-api/tests/regression/test_c216_session_flow.py services/core-api/tests/regression/test_c216_redis_store.py -q
$env:PYTHONPATH='services/core-api;backend'
python -m pytest services/core-api/tests/integration/test_email_postgres_redis.py -q
```

Интеграционный тест запускается отдельно, в свежем процессе: локальная фабрика
проверяет адрес, пользователя и ревизию схемы до импорта приложения.

## Границы

- Для настоящих писем ещё необходимы настройки провайдера и проверка доставки;
  переменные окружения перечислены в README. Реальные секреты в тесты не входят.
- В legacy SQLite ограничение частоты действует на процесс; для нескольких
  процессов перед публичным использованием необходим общий проверенный лимит.
- Общий ответ восстановления не скрывает различий времени синхронной SMTP-отправки.
- Исторический C232 lab importer закреплён за старой схемой и синтетической
  фикстурой; перед его адаптацией к переносу `verified` нужна отдельная проверка.

# Operator tools

Пакет tools не входит в production image и не импортируется runtime.
`check_architecture.py` проверяет границы модулей. `lab/postgres_runtime.py`
проверяет disposable PostgreSQL/Redis и запускает единственную рабочую factory.
`python -m tools.maintenance.make_admin` требует явную PostgreSQL БД и выбор
`--dry-run`/`--apply`. Подробности — ../README.md.

Импортёры SQLite, snapshot/rollback, переходные ASGI-приложения и экспериментальные
модели сессий удалены. Для слотов используется действующий административный API.
Применённая история PostgreSQL Alembic находится в `migrations/`; повторный импорт
данных для очистки не нужен.

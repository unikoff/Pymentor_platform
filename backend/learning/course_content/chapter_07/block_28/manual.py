from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    159: [{'title': 'Подключите AsyncEngine к PostgreSQL',
        'task': 'Создайте отдельный async database vertical slice, не удаляя рабочий sync Engine до завершения '
                'regression.',
        'steps': ['Добавьте async PostgreSQL driver, выбранный проектом, в зависимости.',
                  'Добавьте ASYNC_DATABASE_URL в .env.example без реального password.',
                  'Создайте app/database/async_engine.py.',
                  'Создайте AsyncEngine через create_async_engine с pool_pre_ping=True.',
                  'Не передавайте SQLite-specific connect_args.',
                  'Создайте scripts/check_async_database.py.',
                  "В async with engine.connect выполните await connection.execute(text('SELECT 1')).",
                  'Выведите только result, dialect name и безопасные host/database без password.',
                  'В finally выполните await engine.dispose().',
                  'Проверьте успешное подключение и неверный port.',
                  'Оставьте sync Engine доступным для сравнения до конца блока.'],
        'result': 'Готово, если async SELECT 1 выполняется через async driver, engine корректно dispose, ошибка '
                  'подключения диагностируется без утечки credentials, а sync baseline сохранён.'}],
    160: [{'title': 'Создайте request-scoped AsyncSession',
        'task': 'Добавьте async_sessionmaker и dependency get_async_db. Одна AsyncSession принадлежит одному request '
                'и не разделяется между concurrent tasks.',
        'steps': ['Создайте async_sessionmaker(bind=async_engine, expire_on_commit=False).',
                  'Реализуйте async dependency get_async_db через async with session_factory() as session.',
                  'В dependency не выполняйте commit автоматически.',
                  'Создайте type alias AsyncSessionDep через Annotated и Depends.',
                  'Переведите один read-only endpoint GET /tasks/{task_id} на AsyncSession.',
                  'Используйте await session.get либо await session.execute.',
                  'Добавьте test с dependency override на test AsyncSession factory.',
                  'Добавьте instrumentation session_opened/session_closed.',
                  'Выполните несколько sequential requests и проверьте разные session identities.',
                  'Не запускайте две concurrent operations на одной Session.',
                  'Добавьте отрицательный документированный test/design note о запрете shared global AsyncSession.'],
        'result': 'Готово, если каждый request получает и закрывает собственную AsyncSession, read endpoint '
                  'сохраняет контракт, а одна mutable Session не используется одновременно несколькими Tasks.'}],
    161: [{'title': 'Переведите CRUD на AsyncSession',
        'task': 'Перенесите один полный Task CRUD без изменения HTTP contract. Сначала переносится способ database '
                'I/O, а не вся архитектура.',
        'steps': ['Переведите list через result = await session.execute(select(Task)) и result.scalars().all().',
                  'Переведите create: session.add без await, затем await commit и await refresh.',
                  'Переведите get через await session.get.',
                  'Переведите patch и после изменений выполните await commit и await refresh.',
                  'Переведите delete через await session.delete и await commit.',
                  'Сохраните ownership filters и response schemas.',
                  'Добавьте tests POST → GET → PATCH → DELETE → GET 404.',
                  'Добавьте test duplicate constraint и обязательный await rollback.',
                  'Сравните JSON и statuses с sync baseline.',
                  'Посчитайте SQL statements для list endpoint.',
                  'Удаляйте sync CRUD только после полного regression.'],
        'result': 'Готово, если async CRUD сохраняет внешний контракт, ownership и constraint behavior, все I/O '
                  'methods awaited, rollback протестирован, а SQL count не вырос.'}],
    164: [{'title': 'Выпустите Async StudyHub',
        'task': 'Проведите финальную приёмку этапа из чистого окружения. Вывод о производительности должен опираться '
                'на одинаковый сценарий, а не на наличие async def.',
        'steps': ['Клонируйте repository в новую временную директорию и установите зависимости по README.',
                  'Настройте PostgreSQL и local mock recommendation service.',
                  'Выполните Alembic upgrade head.',
                  'Запустите Async StudyHub и проверьте /health.',
                  'Выполните dashboard success, optional upstream timeout, upstream error и database error.',
                  'Проверьте cancellation laboratory и cleanup.',
                  'Запустите async CRUD и relation endpoint с query counter.',
                  'Проведите одинаковый load scenario для сохранённого sync baseline и async vertical slice.',
                  'Зафиксируйте concurrency, duration, input data, p50, p95, throughput, errors и pool size.',
                  'Не объявляйте async лучше, если разница не подтверждена.',
                  'Проверьте request id в endpoint, integration и database logs.',
                  'Запустите pytest -q два раза.',
                  'Обновите README: event loop model, AsyncClient lifecycle, AsyncSession scope, tests и benchmark.',
                  'Создайте docs/async-decisions.md с таблицей def/async def и известными границами.',
                  'Создайте commit release: Async StudyHub, tag v5.0.0 и GitHub Release.',
                  'Проведите защиту: coroutine object, sequential await, Task, cancellation, timeout, semaphore, '
                  'lifespan, AsyncSession и N+1.'],
        'result': 'Готово, если чистая установка воспроизводима, success/error/timeout/cancellation протестированы, '
                  'AsyncClient и AsyncSession имеют корректный lifecycle, measurements документированы, а Release '
                  'v5.0.0 опубликован без недоказанных claims.'}]
}

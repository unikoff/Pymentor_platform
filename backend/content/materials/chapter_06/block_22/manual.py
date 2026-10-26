from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    124: [{'title': 'Создайте local PostgreSQL и первую database',
        'task': 'Запустите PostgreSQL server и выполните диагностику через psql. GUI можно использовать '
                'дополнительно, но доказательство должно включать команды клиента.',
        'steps': ['Установите PostgreSQL либо используйте уже установленный local server; Docker на этом этапе не '
                  'требуется.',
                  'Проверьте состояние server process средствами своей ОС.',
                  'Выполните psql --version и запишите версию в docs/postgresql-local.md.',
                  'Подключитесь к server по явным host, port и role.',
                  'Выполните \\l и найдите список databases.',
                  'Создайте database studyhub_dev.',
                  'Подключитесь через \\c studyhub_dev.',
                  'Создайте временную таблицу connection_check с одной text column.',
                  'Выполните \\dt и \\d connection_check.',
                  'Вставьте строку connected и прочитайте её SELECT-запросом.',
                  'Остановите server, повторите подключение и зафиксируйте connection refused.',
                  'Снова запустите server, удалите connection_check и подтвердите восстановленное подключение.'],
        'result': 'Готово, если ученик подключается к studyhub_dev по явным параметрам, находит таблицу через psql, '
                  'воспроизводит connection refused и объясняет различие server, database и table.'}],
    125: [{'title': 'Создайте отдельную роль приложения',
        'task': 'Настройте PostgreSQL так, чтобы StudyHub не подключался superuser-ролью. Права должны позволять '
                'работу приложения и блокировать административные действия.',
        'steps': ['Под административной ролью создайте login role studyhub_app с новым local password.',
                  'Создайте databases studyhub_dev и studyhub_test либо смените их owner на studyhub_app.',
                  'Проверьте owner через psql meta-command или PostgreSQL catalog.',
                  'Подключитесь к studyhub_dev как studyhub_app и создайте таблицу permission_check.',
                  'Вставьте и прочитайте одну строку.',
                  'Попробуйте создать новую database ролью studyhub_app и зафиксируйте ожидаемый отказ.',
                  'Попробуйте прочитать system password data либо выполнить другую заранее выбранную '
                  'административную операцию и зафиксируйте отказ.',
                  'Удалите permission_check.',
                  'Сохраните DATABASE_URL templates в .env.example без настоящего password.',
                  'Проверьте git diff и убедитесь, что реальный password отсутствует.',
                  'Создайте docs/postgresql-roles.md: роль, owner, разрешённая операция, запрещённая операция и '
                  'причина запрета.'],
        'result': 'Готово, если StudyHub role подключается к dev/test databases и работает со своей schema, но не '
                  'имеет superuser/createdb полномочий, а credentials отсутствуют в Git.'}],
    126: [{'title': 'Переключите Engine на PostgreSQL через Settings',
        'task': 'Добавьте sync PostgreSQL driver и переключаемый DATABASE_URL, не вшивая host, port, role и password '
                'в Python modules.',
        'steps': ['Добавьте psycopg binary package, совместимый с SQLAlchemy sync Engine, в зависимости проекта.',
                  'Обновите .env.example строкой '
                  'DATABASE_URL=postgresql+psycopg://studyhub_app:change-me@localhost:5432/studyhub_dev.',
                  'Убедитесь, что Settings читает DATABASE_URL как строку и не печатает её целиком в logs.',
                  'Удалите SQLite-specific connect_args при PostgreSQL dialect либо применяйте их только условно для '
                  'SQLite tests.',
                  'Создайте Engine через create_engine(settings.database_url, pool_pre_ping=True).',
                  'Создайте scripts/check_postgresql.py.',
                  'Внутри engine.connect выполните SELECT 1 через text или exec_driver_sql и выведите только '
                  'результат и dialect name.',
                  'Запустите script с правильным URL.',
                  'Измените port на неверный и зафиксируйте diagnostic без публикации password.',
                  'Верните правильный URL и запустите один read-only API endpoint.',
                  'Добавьте test Settings, который проверяет, что test DATABASE_URL переопределяет development '
                  'value.'],
        'result': 'Готово, если Engine подключается к PostgreSQL из environment, SELECT 1 проходит, ошибка host/port '
                  'диагностируется, а SQLite-specific config не применяется безусловно.'}],
    127: [{'title': 'Восстановите schema из Alembic на чистой PostgreSQL',
        'task': 'Докажите, что repository содержит полную историю schema. Запрещено создавать таблицы вручную и '
                'затем отмечать migration выполненной.',
        'steps': ['Создайте disposable database studyhub_migration_check с owner studyhub_app.',
                  'Настройте DATABASE_URL на эту database.',
                  'Выполните alembic current; до upgrade текущая revision должна отсутствовать.',
                  'Выполните alembic history и сохраните список revisions.',
                  'Выполните alembic upgrade head.',
                  'Проверьте alembic current и значение в таблице alembic_version.',
                  'Через \\dt и information_schema проверьте все ожидаемые tables.',
                  'Проверьте foreign keys, unique constraints и indexes минимум у User, Task и AuthSession.',
                  'Запустите smoke test приложения на studyhub_migration_check.',
                  'Создайте вторую чистую database и повторите upgrade head автоматически из test/script.',
                  'Намеренно укажите database с неверным password и зафиксируйте, что migration не изменила другую '
                  'database.',
                  'Удалите disposable databases только после сохранения результатов.'],
        'result': 'Готово, если две чистые PostgreSQL databases получают одинаковую schema только через upgrade '
                  'head, current указывает на head, а ошибки подключения не приводят к частично изменённой другой '
                  'базе.'}],
    128: [{'title': 'Перенесите seed и докажите неизменный HTTP-контракт',
        'task': 'Перенесите небольшой связанный набор Personal StudyHub из SQLite в PostgreSQL и сравните responses '
                'с baseline блока 00.',
        'steps': ['Подготовьте seed dataset: два users, две categories, не меньше четырёх tasks, одна session-safe '
                  'запись без реальных tokens и один avatar metadata record без файла.',
                  'Зафиксируйте порядок вставки по foreign keys: users → categories → tasks → зависимые records.',
                  'Создайте scripts/seed_postgresql.py с идемпотентной проверкой существующих natural keys.',
                  'Не переносите password plaintext, session ids и реальные refresh tokens из development данных.',
                  'Запустите alembic upgrade head на чистой studyhub_dev.',
                  'Запустите seed script два раза; второй запуск не должен создавать дубли.',
                  'Запустите полный pytest suite на отдельной studyhub_test.',
                  'Выполните тот же Postman/Swagger-сценарий, который сохранён в stage6-baseline.',
                  'Сравните methods, statuses и JSON schemas; generated ids могут отличаться, если контракт не '
                  'обещает конкретные значения.',
                  'Добавьте regression test на ключевые endpoints после смены dialect.',
                  'Обновите README разделом SQLite → PostgreSQL migration и troubleshooting connection.',
                  'Создайте Git commit feat: migrate StudyHub to PostgreSQL.'],
        'result': 'Готово, если PostgreSQL StudyHub поднимается с нуля, seed идемпотентен, tests зелёные, а внешний '
                  'HTTP-контракт совпадает с baseline без зависимости от SQLite.'}]
}

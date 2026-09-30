from typing import Any

OVERVIEW_PRACTICE: dict[str, list[dict[str, Any]]] = {
    'План обучения.md': [{'title': 'Зафиксируйте baseline Personal StudyHub API',
                       'task': 'До переноса на PostgreSQL сохраните проверяемое состояние проекта на SQLite. Цель — '
                               'доказать, что смена database и усиление SQL не изменили внешний HTTP-контракт.',
                       'steps': ['Создайте docs/stage6-baseline.md.',
                                 'Запишите точную команду запуска API, команду alembic upgrade head и команду pytest '
                                 '-q.',
                                 'Составьте таблицу endpoints: method, path, success status, request schema и '
                                 'response schema.',
                                 'Запишите текущий DATABASE_URL без password и фактический database dialect.',
                                 'Через API создайте двух пользователей, две категории и не меньше четырёх задач с '
                                 'разными owners и statuses.',
                                 'Сохраните JSON ключевых responses create, list, stats и protected get в '
                                 'tests/baseline-responses/ либо в документе.',
                                 'Запустите pytest -q два раза и запишите число прошедших tests.',
                                 'Зафиксируйте Git commit docs: record PostgreSQL migration baseline.'],
                       'result': 'Готово, если baseline содержит HTTP-контракт, тестовые данные, database dialect и '
                                 'зелёный test suite, по которым после переноса можно провести регрессионное '
                                 'сравнение.'}],
    '00 - План обучения.md': [{'title': 'Зафиксируйте baseline Personal StudyHub API',
                            'task': 'До переноса на PostgreSQL сохраните проверяемое состояние проекта на SQLite. '
                                    'Цель — доказать, что смена database и усиление SQL не изменили внешний '
                                    'HTTP-контракт.',
                            'steps': ['Создайте docs/stage6-baseline.md.',
                                      'Запишите точную команду запуска API, команду alembic upgrade head и команду '
                                      'pytest -q.',
                                      'Составьте таблицу endpoints: method, path, success status, request schema и '
                                      'response schema.',
                                      'Запишите текущий DATABASE_URL без password и фактический database dialect.',
                                      'Через API создайте двух пользователей, две категории и не меньше четырёх '
                                      'задач с разными owners и statuses.',
                                      'Сохраните JSON ключевых responses create, list, stats и protected get в '
                                      'tests/baseline-responses/ либо в документе.',
                                      'Запустите pytest -q два раза и запишите число прошедших tests.',
                                      'Зафиксируйте Git commit docs: record PostgreSQL migration baseline.'],
                            'result': 'Готово, если baseline содержит HTTP-контракт, тестовые данные, database '
                                      'dialect и зелёный test suite, по которым после переноса можно провести '
                                      'регрессионное сравнение.'}],
    'Теория месяца.md': [{'title': 'Нарисуйте карту данных PostgreSQL StudyHub',
                       'task': 'До SQL-лабораторий свяжите ORM, SQL, PostgreSQL server, transactions, indexes и '
                               'дополнительные хранилища в одну карту с явными границами ответственности.',
                       'steps': ['Создайте docs/stage6-data-map.md.',
                                 'Нарисуйте путь одного request: endpoint → service → Session → SQLAlchemy statement '
                                 '→ driver → PostgreSQL server → database → public schema → table.',
                                 'Для каждого шага подпишите конкретный вход и выход, например ORM Task → INSERT '
                                 'statement → generated id.',
                                 'Нарисуйте отдельный lifecycle schema: ORM model → Alembic revision → upgrade → '
                                 'PostgreSQL catalog.',
                                 'Добавьте transaction boundary для операции complete task + progress event и '
                                 'покажите rollback обоих изменений.',
                                 'Добавьте storage matrix для PostgreSQL, MongoDB и Redis: единица хранения, source '
                                 'of truth, TTL, relations и подходящий StudyHub-сценарий.',
                                 'Отдельно отметьте, что migrations не являются backup, а Redis cache не является '
                                 'основным хранилищем продуктовых данных.',
                                 'Добавьте один ошибочный путь connection refused и один ошибочный путь constraint '
                                 'violation.'],
                       'result': 'Готово, если по карте можно проследить данные от HTTP request до row и обратно, '
                                 'объяснить изменение schema, transaction rollback и выбор каждого storage.'}],
    '00 - Теория месяца.md': [{'title': 'Нарисуйте карту данных PostgreSQL StudyHub',
                            'task': 'До SQL-лабораторий свяжите ORM, SQL, PostgreSQL server, transactions, indexes и '
                                    'дополнительные хранилища в одну карту с явными границами ответственности.',
                            'steps': ['Создайте docs/stage6-data-map.md.',
                                      'Нарисуйте путь одного request: endpoint → service → Session → SQLAlchemy '
                                      'statement → driver → PostgreSQL server → database → public schema → table.',
                                      'Для каждого шага подпишите конкретный вход и выход, например ORM Task → '
                                      'INSERT statement → generated id.',
                                      'Нарисуйте отдельный lifecycle schema: ORM model → Alembic revision → upgrade '
                                      '→ PostgreSQL catalog.',
                                      'Добавьте transaction boundary для операции complete task + progress event и '
                                      'покажите rollback обоих изменений.',
                                      'Добавьте storage matrix для PostgreSQL, MongoDB и Redis: единица хранения, '
                                      'source of truth, TTL, relations и подходящий StudyHub-сценарий.',
                                      'Отдельно отметьте, что migrations не являются backup, а Redis cache не '
                                      'является основным хранилищем продуктовых данных.',
                                      'Добавьте один ошибочный путь connection refused и один ошибочный путь '
                                      'constraint violation.'],
                            'result': 'Готово, если по карте можно проследить данные от HTTP request до row и '
                                      'обратно, объяснить изменение schema, transaction rollback и выбор каждого '
                                      'storage.'}]
}

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
}

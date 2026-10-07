from typing import Any

OVERVIEW_PRACTICE: dict[str, list[dict[str, Any]]] = {
    'План обучения.md': [{'title': 'Зафиксируйте исходную версию Planner API',
                       'task': 'До подключения базы сохраните проверяемое состояние проекта. Эта работа нужна, чтобы '
                               'отличать изменение способа хранения от случайного изменения HTTP-контракта.',
                       'steps': ['Создайте файл docs/stage4-baseline.md.',
                                 'Запишите название проекта Planner API и текущую команду запуска.',
                                 'Составьте таблицу endpoints: method, path, успешный status, request schema и '
                                 'response schema.',
                                 'Отдельно перечислите ограничения in-memory storage: данные исчезают после restart, '
                                 'процессы не разделяют список, база не защищает constraints.',
                                 'Запустите pytest -q и запишите число прошедших тестов.',
                                 'Через Postman или Swagger выполните create, list, get и delete одной задачи.',
                                 'Создайте Git-коммит docs: record Planner API baseline.'],
                       'result': 'Готово, если один документ фиксирует HTTP-контракт, ограничения хранения и зелёный '
                                 'baseline tests. После этапа этот документ позволит доказать, что внешний API '
                                 'сохранился.'}],
    '00 - План обучения.md': [{'title': 'Зафиксируйте исходную версию Planner API',
                            'task': 'До подключения базы сохраните проверяемое состояние проекта. Эта работа нужна, '
                                    'чтобы отличать изменение способа хранения от случайного изменения '
                                    'HTTP-контракта.',
                            'steps': ['Создайте файл docs/stage4-baseline.md.',
                                      'Запишите название проекта Planner API и текущую команду запуска.',
                                      'Составьте таблицу endpoints: method, path, успешный status, request schema и '
                                      'response schema.',
                                      'Отдельно перечислите ограничения in-memory storage: данные исчезают после '
                                      'restart, процессы не разделяют список, база не защищает constraints.',
                                      'Запустите pytest -q и запишите число прошедших тестов.',
                                      'Через Postman или Swagger выполните create, list, get и delete одной задачи.',
                                      'Создайте Git-коммит docs: record Planner API baseline.'],
                            'result': 'Готово, если один документ фиксирует HTTP-контракт, ограничения хранения и '
                                      'зелёный baseline tests. После этапа этот документ позволит доказать, что '
                                      'внешний API сохранился.'}],
    'Теория месяца.md': [{'title': 'Нарисуйте два жизненных цикла StudyHub',
                       'task': 'До написания SQLAlchemy-кода свяжите HTTP request и изменение schema в две '
                               'последовательные схемы. Не используйте абстрактные слова без конкретного результата '
                               'каждого шага.',
                       'steps': ['Создайте docs/stage4-data-path.md.',
                                 'Первая схема должна содержать: client, middleware before, router, validation, '
                                 'dependency get_db, Session, statement, transaction, response model, middleware '
                                 'after, client.',
                                 'Для каждого шага подпишите один конкретный результат, например Session создана или '
                                 'statement выполнен.',
                                 'Вторая схема должна содержать: ORM model, Base.metadata, Alembic revision, '
                                 'upgrade, database schema, следующая revision.',
                                 'Отдельно запишите три границы: Pydantic проверяет HTTP-данные, SQLAlchemy '
                                 'описывает ORM и запросы, Alembic изменяет schema во времени.',
                                 'Добавьте один ошибочный путь: commit завершился IntegrityError, затем требуется '
                                 'rollback перед следующим запросом.'],
                       'result': 'Готово, если по первой схеме можно проследить один POST request, а по второй — '
                                 'объяснить, почему изменение Python-модели само не меняет существующую database.'}],
    '00 - Теория месяца.md': [{'title': 'Нарисуйте два жизненных цикла StudyHub',
                            'task': 'До написания SQLAlchemy-кода свяжите HTTP request и изменение schema в две '
                                    'последовательные схемы. Не используйте абстрактные слова без конкретного '
                                    'результата каждого шага.',
                            'steps': ['Создайте docs/stage4-data-path.md.',
                                      'Первая схема должна содержать: client, middleware before, router, validation, '
                                      'dependency get_db, Session, statement, transaction, response model, '
                                      'middleware after, client.',
                                      'Для каждого шага подпишите один конкретный результат, например Session '
                                      'создана или statement выполнен.',
                                      'Вторая схема должна содержать: ORM model, Base.metadata, Alembic revision, '
                                      'upgrade, database schema, следующая revision.',
                                      'Отдельно запишите три границы: Pydantic проверяет HTTP-данные, SQLAlchemy '
                                      'описывает ORM и запросы, Alembic изменяет schema во времени.',
                                      'Добавьте один ошибочный путь: commit завершился IntegrityError, затем '
                                      'требуется rollback перед следующим запросом.'],
                            'result': 'Готово, если по первой схеме можно проследить один POST request, а по второй '
                                      '— объяснить, почему изменение Python-модели само не меняет существующую '
                                      'database.'}]
}

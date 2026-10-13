from typing import Any

OVERVIEW_PRACTICE: dict[str, list[dict[str, Any]]] = {
    'План обучения.md': [{'title': 'Зафиксируйте security baseline StudyHub',
                       'task': 'До добавления пользователей сохраните проверяемое состояние StudyHub Database API. '
                               'Нужно отделить будущие изменения безопасности от уже работающего CRUD и database '
                               'layer.',
                       'steps': ['Создайте файл docs/stage5-security-baseline.md.',
                                 'Запишите текущую команду запуска, команду миграций и команду тестов.',
                                 'Составьте таблицу всех endpoints: method, path, успешный status и текущая '
                                 'доступность без аутентификации.',
                                 'Отдельно перечислите данные, которые нельзя отдавать клиенту: password, '
                                 'password_hash, session id, refresh token, SECRET_KEY и API key.',
                                 'Создайте двух условных пользователей Alice и Bob и опишите четыре будущих '
                                 'отрицательных сценария: нет credentials, неверные credentials, чужая задача, '
                                 'обычный user в admin endpoint.',
                                 'Запустите pytest -q два раза и запишите число прошедших тестов.',
                                 'Через Swagger или Postman выполните текущую CRUD-цепочку задачи и сохраните '
                                 'фактические statuses.',
                                 'Создайте Git-коммит docs: record stage 5 security baseline.'],
                       'result': 'Готово, если один документ фиксирует открытый HTTP-контракт, запрещённые к выдаче '
                                 'данные, четыре будущих security-сценария и зелёный baseline тестов.'}],
    '00 - План обучения.md': [{'title': 'Зафиксируйте security baseline StudyHub',
                            'task': 'До добавления пользователей сохраните проверяемое состояние StudyHub Database '
                                    'API. Нужно отделить будущие изменения безопасности от уже работающего CRUD и '
                                    'database layer.',
                            'steps': ['Создайте файл docs/stage5-security-baseline.md.',
                                      'Запишите текущую команду запуска, команду миграций и команду тестов.',
                                      'Составьте таблицу всех endpoints: method, path, успешный status и текущая '
                                      'доступность без аутентификации.',
                                      'Отдельно перечислите данные, которые нельзя отдавать клиенту: password, '
                                      'password_hash, session id, refresh token, SECRET_KEY и API key.',
                                      'Создайте двух условных пользователей Alice и Bob и опишите четыре будущих '
                                      'отрицательных сценария: нет credentials, неверные credentials, чужая задача, '
                                      'обычный user в admin endpoint.',
                                      'Запустите pytest -q два раза и запишите число прошедших тестов.',
                                      'Через Swagger или Postman выполните текущую CRUD-цепочку задачи и сохраните '
                                      'фактические statuses.',
                                      'Создайте Git-коммит docs: record stage 5 security baseline.'],
                            'result': 'Готово, если один документ фиксирует открытый HTTP-контракт, запрещённые к '
                                      'выдаче данные, четыре будущих security-сценария и зелёный baseline тестов.'}],
}

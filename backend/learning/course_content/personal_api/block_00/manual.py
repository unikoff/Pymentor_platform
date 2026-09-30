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
    'Теория месяца.md': [{'title': 'Нарисуйте четыре потока доступа',
                       'task': 'До реализации свяжите identity, authentication, transport, server state и '
                               'authorization в четыре отдельные схемы. Схемы должны показывать конкретные данные, а '
                               'не только названия технологий.',
                       'steps': ['Создайте docs/stage5-auth-flows.md.',
                                 'Нарисуйте registration flow: UserCreate → validation → hash_password → User row → '
                                 'UserRead.',
                                 'Нарисуйте cookie-session flow: credentials → AuthSession row → Set-Cookie → Cookie '
                                 '→ get_current_user → owner check.',
                                 'Нарисуйте JWT flow: credentials → access claims → signed token → Authorization '
                                 'Bearer → decode → current user.',
                                 'Нарисуйте refresh flow: refresh record → rotation → новый access и refresh → '
                                 'revoke старого refresh.',
                                 'Для каждой схемы подпишите, где находится состояние: browser, Authorization '
                                 'header, SQLite row или application settings.',
                                 'Добавьте четыре ошибочных пути с точными statuses: неверные credentials 401, нет '
                                 'token 401, чужой resource 403 или скрытый 404 по принятому контракту, duplicate '
                                 'email 409.',
                                 'Отдельно запишите, почему JWT подписан, но payload не является секретным '
                                 'хранилищем.'],
                       'result': 'Готово, если по схемам можно проследить registration, session request, '
                                 'access-token request и refresh rotation, а для каждого отказа указана точная '
                                 'граница и status.'}],
    '00 - Теория месяца.md': [{'title': 'Нарисуйте четыре потока доступа',
                            'task': 'До реализации свяжите identity, authentication, transport, server state и '
                                    'authorization в четыре отдельные схемы. Схемы должны показывать конкретные '
                                    'данные, а не только названия технологий.',
                            'steps': ['Создайте docs/stage5-auth-flows.md.',
                                      'Нарисуйте registration flow: UserCreate → validation → hash_password → User '
                                      'row → UserRead.',
                                      'Нарисуйте cookie-session flow: credentials → AuthSession row → Set-Cookie → '
                                      'Cookie → get_current_user → owner check.',
                                      'Нарисуйте JWT flow: credentials → access claims → signed token → '
                                      'Authorization Bearer → decode → current user.',
                                      'Нарисуйте refresh flow: refresh record → rotation → новый access и refresh → '
                                      'revoke старого refresh.',
                                      'Для каждой схемы подпишите, где находится состояние: browser, Authorization '
                                      'header, SQLite row или application settings.',
                                      'Добавьте четыре ошибочных пути с точными statuses: неверные credentials 401, '
                                      'нет token 401, чужой resource 403 или скрытый 404 по принятому контракту, '
                                      'duplicate email 409.',
                                      'Отдельно запишите, почему JWT подписан, но payload не является секретным '
                                      'хранилищем.'],
                            'result': 'Готово, если по схемам можно проследить registration, session request, '
                                      'access-token request и refresh rotation, а для каждого отказа указана точная '
                                      'граница и status.'}]
}

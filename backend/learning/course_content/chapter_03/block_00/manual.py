"""Учебная практика блока. Редактируйте задания здесь."""

from __future__ import annotations

from typing import Any


OVERVIEW_PRACTICE: dict[str, list[dict[str, Any]]] = {
    'План обучения.md': [{'title': 'Зафиксируйте переход от CLI к Planner API',
                       'task': 'Подготовьте воспроизводимую исходную точку третьего курса. Persistent Planner должен '
                               'остаться рабочим, а новый HTTP-проект начинается в отдельной ветке.',
                       'steps': ['Создайте Git-ветку course-3-planner-api от последнего принятого релиза Persistent '
                                 'Planner.',
                                 'Запустите Persistent Planner и выполните сценарий: создать две задачи, найти одну, '
                                 'завершить её и показать статистику.',
                                 'Создайте файл docs/course-3-baseline.md и запишите команды CLI, входные значения и '
                                 'наблюдаемые результаты сценария.',
                                 'Ниже добавьте таблицу будущих endpoints: GET /health, GET /tasks, GET '
                                 '/tasks/{task_id}, POST /tasks, PUT /tasks/{task_id}, PATCH /tasks/{task_id}, '
                                 'DELETE /tasks/{task_id}.',
                                 'Для каждого endpoint запишите одно предложение о пользовательском результате, не '
                                 'описывая реализацию FastAPI.',
                                 'Создайте пустую папку studyhub-api рядом со старой версией или в отдельном '
                                 'репозитории и зафиксируйте решение в README.',
                                 'Выполните git status и создайте коммит docs: record Planner API baseline.'],
                       'result': 'Готово, если старый CLI-сценарий повторяется без ошибок, будущий HTTP-контракт '
                                 'перечислен полностью, ветка и граница нового проекта зафиксированы, а рабочая '
                                 'директория чистая.'}],
    '00 - План обучения.md': [{'title': 'Зафиксируйте переход от CLI к Planner API',
                            'task': 'Подготовьте воспроизводимую исходную точку третьего курса. Persistent Planner '
                                    'должен остаться рабочим, а новый HTTP-проект начинается в отдельной ветке.',
                            'steps': ['Создайте Git-ветку course-3-planner-api от последнего принятого релиза '
                                      'Persistent Planner.',
                                      'Запустите Persistent Planner и выполните сценарий: создать две задачи, найти '
                                      'одну, завершить её и показать статистику.',
                                      'Создайте файл docs/course-3-baseline.md и запишите команды CLI, входные '
                                      'значения и наблюдаемые результаты сценария.',
                                      'Ниже добавьте таблицу будущих endpoints: GET /health, GET /tasks, GET '
                                      '/tasks/{task_id}, POST /tasks, PUT /tasks/{task_id}, PATCH /tasks/{task_id}, '
                                      'DELETE /tasks/{task_id}.',
                                      'Для каждого endpoint запишите одно предложение о пользовательском результате, '
                                      'не описывая реализацию FastAPI.',
                                      'Создайте пустую папку studyhub-api рядом со старой версией или в отдельном '
                                      'репозитории и зафиксируйте решение в README.',
                                      'Выполните git status и создайте коммит docs: record Planner API baseline.'],
                            'result': 'Готово, если старый CLI-сценарий повторяется без ошибок, будущий '
                                      'HTTP-контракт перечислен полностью, ветка и граница нового проекта '
                                      'зафиксированы, а рабочая директория чистая.'}],
    'Карта обучения.md': [{'title': 'Зафиксируйте переход от CLI к Planner API',
                        'task': 'Подготовьте воспроизводимую исходную точку третьего курса. Persistent Planner '
                                'должен остаться рабочим, а новый HTTP-проект начинается в отдельной ветке.',
                        'steps': ['Создайте Git-ветку course-3-planner-api от последнего принятого релиза Persistent '
                                  'Planner.',
                                  'Запустите Persistent Planner и выполните сценарий: создать две задачи, найти '
                                  'одну, завершить её и показать статистику.',
                                  'Создайте файл docs/course-3-baseline.md и запишите команды CLI, входные значения '
                                  'и наблюдаемые результаты сценария.',
                                  'Ниже добавьте таблицу будущих endpoints: GET /health, GET /tasks, GET '
                                  '/tasks/{task_id}, POST /tasks, PUT /tasks/{task_id}, PATCH /tasks/{task_id}, '
                                  'DELETE /tasks/{task_id}.',
                                  'Для каждого endpoint запишите одно предложение о пользовательском результате, не '
                                  'описывая реализацию FastAPI.',
                                  'Создайте пустую папку studyhub-api рядом со старой версией или в отдельном '
                                  'репозитории и зафиксируйте решение в README.',
                                  'Выполните git status и создайте коммит docs: record Planner API baseline.'],
                        'result': 'Готово, если старый CLI-сценарий повторяется без ошибок, будущий HTTP-контракт '
                                  'перечислен полностью, ветка и граница нового проекта зафиксированы, а рабочая '
                                  'директория чистая.'}],
    '00 - Карта обучения.md': [{'title': 'Зафиксируйте переход от CLI к Planner API',
                             'task': 'Подготовьте воспроизводимую исходную точку третьего курса. Persistent Planner '
                                     'должен остаться рабочим, а новый HTTP-проект начинается в отдельной ветке.',
                             'steps': ['Создайте Git-ветку course-3-planner-api от последнего принятого релиза '
                                       'Persistent Planner.',
                                       'Запустите Persistent Planner и выполните сценарий: создать две задачи, найти '
                                       'одну, завершить её и показать статистику.',
                                       'Создайте файл docs/course-3-baseline.md и запишите команды CLI, входные '
                                       'значения и наблюдаемые результаты сценария.',
                                       'Ниже добавьте таблицу будущих endpoints: GET /health, GET /tasks, GET '
                                       '/tasks/{task_id}, POST /tasks, PUT /tasks/{task_id}, PATCH /tasks/{task_id}, '
                                       'DELETE /tasks/{task_id}.',
                                       'Для каждого endpoint запишите одно предложение о пользовательском '
                                       'результате, не описывая реализацию FastAPI.',
                                       'Создайте пустую папку studyhub-api рядом со старой версией или в отдельном '
                                       'репозитории и зафиксируйте решение в README.',
                                       'Выполните git status и создайте коммит docs: record Planner API baseline.'],
                             'result': 'Готово, если старый CLI-сценарий повторяется без ошибок, будущий '
                                       'HTTP-контракт перечислен полностью, ветка и граница нового проекта '
                                       'зафиксированы, а рабочая директория чистая.'}],
    '00 - Карта обучения месяца 3.md': [{'title': 'Зафиксируйте переход от CLI к Planner API',
                                      'task': 'Подготовьте воспроизводимую исходную точку третьего курса. Persistent '
                                              'Planner должен остаться рабочим, а новый HTTP-проект начинается в '
                                              'отдельной ветке.',
                                      'steps': ['Создайте Git-ветку course-3-planner-api от последнего принятого '
                                                'релиза Persistent Planner.',
                                                'Запустите Persistent Planner и выполните сценарий: создать две '
                                                'задачи, найти одну, завершить её и показать статистику.',
                                                'Создайте файл docs/course-3-baseline.md и запишите команды CLI, '
                                                'входные значения и наблюдаемые результаты сценария.',
                                                'Ниже добавьте таблицу будущих endpoints: GET /health, GET /tasks, '
                                                'GET /tasks/{task_id}, POST /tasks, PUT /tasks/{task_id}, PATCH '
                                                '/tasks/{task_id}, DELETE /tasks/{task_id}.',
                                                'Для каждого endpoint запишите одно предложение о пользовательском '
                                                'результате, не описывая реализацию FastAPI.',
                                                'Создайте пустую папку studyhub-api рядом со старой версией или в '
                                                'отдельном репозитории и зафиксируйте решение в README.',
                                                'Выполните git status и создайте коммит docs: record Planner API '
                                                'baseline.'],
                                      'result': 'Готово, если старый CLI-сценарий повторяется без ошибок, будущий '
                                                'HTTP-контракт перечислен полностью, ветка и граница нового проекта '
                                                'зафиксированы, а рабочая директория чистая.'}],
    'Теория месяца.md': [{'title': 'Опишите полный путь одного HTTP request',
                       'task': 'До реализации FastAPI составьте два точных контракта Planner API: создание задачи и '
                               'чтение задачи по id. Описание должно позволять другому разработчику понять вход и '
                               'результат без чтения будущего кода.',
                       'steps': ['Создайте файл docs/http-contract-draft.md.',
                                 'Для POST /tasks запишите клиента, method, path, header Content-Type, JSON body с '
                                 'title и priority, ожидаемый status 201 и JSON response с id, title, priority, '
                                 'is_done.',
                                 'Добавьте ошибочный POST-сценарий: пустой title или priority вне диапазона. '
                                 'Зафиксируйте ожидаемый status 422 и наличие detail в response.',
                                 'Для GET /tasks/{task_id} запишите path-параметр, успешный status 200 и body '
                                 'найденной задачи.',
                                 'Добавьте отсутствующий task_id: ожидаемый status 404 и понятный detail.',
                                 'Нарисуйте текстовый маршрут: client → Uvicorn → FastAPI → validation → Python rule '
                                 '→ storage → response → client.',
                                 'Проверьте, что в документе отдельно названы method, path, headers, body, '
                                 'validation, storage, status и response body.'],
                       'result': 'Готово, если два endpoints имеют успешный и ошибочный сценарии, все части '
                                 'request/response названы явно, а маршрут не смешивает HTTP-контракт с деталями '
                                 'будущих файлов.'}],
    '00 - Теория месяца.md': [{'title': 'Опишите полный путь одного HTTP request',
                            'task': 'До реализации FastAPI составьте два точных контракта Planner API: создание '
                                    'задачи и чтение задачи по id. Описание должно позволять другому разработчику '
                                    'понять вход и результат без чтения будущего кода.',
                            'steps': ['Создайте файл docs/http-contract-draft.md.',
                                      'Для POST /tasks запишите клиента, method, path, header Content-Type, JSON '
                                      'body с title и priority, ожидаемый status 201 и JSON response с id, title, '
                                      'priority, is_done.',
                                      'Добавьте ошибочный POST-сценарий: пустой title или priority вне диапазона. '
                                      'Зафиксируйте ожидаемый status 422 и наличие detail в response.',
                                      'Для GET /tasks/{task_id} запишите path-параметр, успешный status 200 и body '
                                      'найденной задачи.',
                                      'Добавьте отсутствующий task_id: ожидаемый status 404 и понятный detail.',
                                      'Нарисуйте текстовый маршрут: client → Uvicorn → FastAPI → validation → Python '
                                      'rule → storage → response → client.',
                                      'Проверьте, что в документе отдельно названы method, path, headers, body, '
                                      'validation, storage, status и response body.'],
                            'result': 'Готово, если два endpoints имеют успешный и ошибочный сценарии, все части '
                                      'request/response названы явно, а маршрут не смешивает HTTP-контракт с '
                                      'деталями будущих файлов.'}],
    '00 - Теория месяца 3 HTTP API и FastAPI.md': [{'title': 'Опишите полный путь одного HTTP request',
                                                 'task': 'До реализации FastAPI составьте два точных контракта '
                                                         'Planner API: создание задачи и чтение задачи по id. '
                                                         'Описание должно позволять другому разработчику понять вход '
                                                         'и результат без чтения будущего кода.',
                                                 'steps': ['Создайте файл docs/http-contract-draft.md.',
                                                           'Для POST /tasks запишите клиента, method, path, header '
                                                           'Content-Type, JSON body с title и priority, ожидаемый '
                                                           'status 201 и JSON response с id, title, priority, '
                                                           'is_done.',
                                                           'Добавьте ошибочный POST-сценарий: пустой title или '
                                                           'priority вне диапазона. Зафиксируйте ожидаемый status '
                                                           '422 и наличие detail в response.',
                                                           'Для GET /tasks/{task_id} запишите path-параметр, '
                                                           'успешный status 200 и body найденной задачи.',
                                                           'Добавьте отсутствующий task_id: ожидаемый status 404 и '
                                                           'понятный detail.',
                                                           'Нарисуйте текстовый маршрут: client → Uvicorn → FastAPI '
                                                           '→ validation → Python rule → storage → response → '
                                                           'client.',
                                                           'Проверьте, что в документе отдельно названы method, '
                                                           'path, headers, body, validation, storage, status и '
                                                           'response body.'],
                                                 'result': 'Готово, если два endpoints имеют успешный и ошибочный '
                                                           'сценарии, все части request/response названы явно, а '
                                                           'маршрут не смешивает HTTP-контракт с деталями будущих '
                                                           'файлов.'}],
}

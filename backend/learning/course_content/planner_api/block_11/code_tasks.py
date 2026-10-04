"""Учебная практика блока. Редактируйте задания здесь."""

from __future__ import annotations

from typing import Any


CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    59: [{'title': 'Добавьте запись в in-memory storage',
       'level': 'medium',
       'mode': 'solve',
       'prompt': 'Создайте новый список из копий существующих задач. Найдите next_id: 1 для пустого списка или '
                 'максимальный существующий id плюс 1. Очистите title через strip(), создайте задачу с is_done=False '
                 'и добавьте её в новый список. Верните словарь с ключами created и items.',
       'contract': {'given': 'Автопроверка вызывает solve(tasks, title, priority). tasks — список словарей с ключами '
                             'id, title, priority, is_done. Идентификаторы могут идти с пропусками, список может '
                             'быть пустым.',
                    'todo': 'Создайте новый список из копий существующих задач. Найдите next_id: 1 для пустого '
                            'списка или максимальный существующий id плюс 1. Очистите title через strip(), создайте '
                            'задачу с is_done=False и добавьте её в новый список. Верните словарь с ключами created '
                            'и items.',
                    'check': 'Проверяются пустое хранилище, обычные id и пропуск id. Новый id должен зависеть от '
                             'максимального id, а исходный список не должен изменяться.'},
       'requirements': {'items': ['копии записей',
                                  'next_id по максимальному id',
                                  'title.strip()',
                                  'is_done=False',
                                  'created и items'],
                        'names': ['tasks', 'title', 'priority', 'updated', 'next_id', 'new_task'],
                        'nodes': ['FunctionDef', 'For', 'If'],
                        'attributes': ['copy', 'strip', 'append']},
       'starter_code': 'def solve(tasks, title, priority):\n'
                       '    # Скопируйте storage, найдите next_id и добавьте задачу\n'
                       '    pass\n',
       'tests': [{'name': 'пустое хранилище',
                  'args': [[], '  HTTP  ', 4],
                  'expected': {'created': {'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False},
                               'items': [{'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False}]}},
                 {'name': 'последовательные id',
                  'args': [[{'id': 1, 'title': 'HTTP', 'priority': 3, 'is_done': False}], 'FastAPI', 5],
                  'expected': {'created': {'id': 2, 'title': 'FastAPI', 'priority': 5, 'is_done': False},
                               'items': [{'id': 1, 'title': 'HTTP', 'priority': 3, 'is_done': False},
                                         {'id': 2, 'title': 'FastAPI', 'priority': 5, 'is_done': False}]}},
                 {'name': 'пропуск id',
                  'args': [[{'id': 2, 'title': 'HTTP', 'priority': 3, 'is_done': False},
                            {'id': 7, 'title': 'Tests', 'priority': 2, 'is_done': True}],
                           '  Swagger ',
                           1],
                  'expected': {'created': {'id': 8, 'title': 'Swagger', 'priority': 1, 'is_done': False},
                               'items': [{'id': 2, 'title': 'HTTP', 'priority': 3, 'is_done': False},
                                         {'id': 7, 'title': 'Tests', 'priority': 2, 'is_done': True},
                                         {'id': 8, 'title': 'Swagger', 'priority': 1, 'is_done': False}]}}],
       'reference_code': 'def solve(tasks, title, priority):\n'
                         '    updated = []\n'
                         '    next_id = 1\n'
                         '    for task in tasks:\n'
                         '        updated.append(task.copy())\n'
                         '        if task["id"] >= next_id:\n'
                         '            next_id = task["id"] + 1\n'
                         '    new_task = {\n'
                         '        "id": next_id,\n'
                         '        "title": title.strip(),\n'
                         '        "priority": priority,\n'
                         '        "is_done": False,\n'
                         '    }\n'
                         '    updated.append(new_task)\n'
                         '    return {"created": new_task, "items": updated}\n'}],
    60: [{'title': 'Соедините create, list и get',
       'level': 'medium',
       'mode': 'solve',
       'prompt': 'Скопируйте существующие задачи, вычислите следующий id и добавьте новую задачу с очищенным title и '
                 'is_done=False. Затем найдите lookup_id в обновлённом списке. Верните словарь с ключами created, '
                 'items, found. found — копия найденной задачи или None.',
       'contract': {'given': 'Автопроверка вызывает solve(tasks, title, priority, lookup_id). tasks — текущее '
                             'in-memory storage. Нужно создать одну задачу, получить итоговый список и найти в нём '
                             'задачу с id, равным lookup_id.',
                    'todo': 'Скопируйте существующие задачи, вычислите следующий id и добавьте новую задачу с '
                            'очищенным title и is_done=False. Затем найдите lookup_id в обновлённом списке. Верните '
                            'словарь с ключами created, items, found. found — копия найденной задачи или None.',
                    'check': 'Проверяется поиск новой задачи, поиск старой задачи и отсутствующий id. Сравнивается '
                             'весь результат, а исходный tasks не должен быть изменён.'},
       'requirements': {'items': ['create новой задачи', 'полный items', 'поиск lookup_id', 'None при отсутствии'],
                        'names': ['tasks', 'title', 'priority', 'lookup_id', 'items', 'next_id', 'created', 'found'],
                        'nodes': ['FunctionDef', 'For', 'If'],
                        'attributes': ['copy', 'strip', 'append']},
       'starter_code': 'def solve(tasks, title, priority, lookup_id):\n'
                       '    # CREATE: добавьте задачу\n'
                       '    # LIST: подготовьте items\n'
                       '    # GET: найдите lookup_id\n'
                       '    pass\n',
       'tests': [{'name': 'найдена новая задача',
                  'args': [[], '  HTTP  ', 4, 1],
                  'expected': {'created': {'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False},
                               'items': [{'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False}],
                               'found': {'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False}}},
                 {'name': 'найдена старая задача',
                  'args': [[{'id': 5, 'title': 'Swagger', 'priority': 2, 'is_done': True}], 'Tests', 3, 5],
                  'expected': {'created': {'id': 6, 'title': 'Tests', 'priority': 3, 'is_done': False},
                               'items': [{'id': 5, 'title': 'Swagger', 'priority': 2, 'is_done': True},
                                         {'id': 6, 'title': 'Tests', 'priority': 3, 'is_done': False}],
                               'found': {'id': 5, 'title': 'Swagger', 'priority': 2, 'is_done': True}}},
                 {'name': 'id отсутствует',
                  'args': [[{'id': 2, 'title': 'HTTP', 'priority': 1, 'is_done': False}], 'FastAPI', 5, 99],
                  'expected': {'created': {'id': 3, 'title': 'FastAPI', 'priority': 5, 'is_done': False},
                               'items': [{'id': 2, 'title': 'HTTP', 'priority': 1, 'is_done': False},
                                         {'id': 3, 'title': 'FastAPI', 'priority': 5, 'is_done': False}],
                               'found': None}}],
       'reference_code': 'def solve(tasks, title, priority, lookup_id):\n'
                         '    items = []\n'
                         '    next_id = 1\n'
                         '    for task in tasks:\n'
                         '        items.append(task.copy())\n'
                         '        if task["id"] >= next_id:\n'
                         '            next_id = task["id"] + 1\n'
                         '    created = {\n'
                         '        "id": next_id,\n'
                         '        "title": title.strip(),\n'
                         '        "priority": priority,\n'
                         '        "is_done": False,\n'
                         '    }\n'
                         '    items.append(created)\n'
                         '    found = None\n'
                         '    for task in items:\n'
                         '        if task["id"] == lookup_id:\n'
                         '            found = task.copy()\n'
                         '            break\n'
                         '    return {"created": created, "items": items, "found": found}\n'}],
    61: [{'title': 'Разделите PUT и PATCH',
       'level': 'medium',
       'mode': 'solve',
       'prompt': 'Для PUT создайте новый словарь только с id исходной задачи и тремя полями из payload. Это полная '
                 'замена: посторонние старые поля не сохраняются. Для PATCH создайте copy() исходной задачи и '
                 'измените только переданные разрешённые поля title, priority, is_done. Когда title передан, '
                 'очистите его через strip(). Верните итоговый словарь.',
       'contract': {'given': 'Автопроверка вызывает solve(task, method, payload). task — существующий словарь '
                             'задачи, method — PUT или PATCH, payload — словарь данных. Для PUT payload всегда '
                             'содержит title, priority и is_done. Для PATCH может содержать только часть полей.',
                    'todo': 'Для PUT создайте новый словарь только с id исходной задачи и тремя полями из payload. '
                            'Это полная замена: посторонние старые поля не сохраняются. Для PATCH создайте copy() '
                            'исходной задачи и измените только переданные разрешённые поля title, priority, is_done. '
                            'Когда title передан, очистите его через strip(). Верните итоговый словарь.',
                    'check': 'Проверяется, что PUT удаляет старое дополнительное поле, а PATCH сохраняет '
                             'непереданные значения. Также проверяются разные частичные payload.'},
       'requirements': {'items': ['отдельная ветка PUT',
                                  'copy() для PATCH',
                                  'только разрешённые поля',
                                  'strip() переданного title'],
                        'names': ['task', 'method', 'payload', 'updated', 'field', 'value'],
                        'nodes': ['FunctionDef', 'For', 'If'],
                        'attributes': ['copy', 'strip']},
       'starter_code': 'def solve(task, method, payload):\n'
                       '    # PUT: полная замена с сохранением id\n'
                       '    # PATCH: копия и изменение только переданных полей\n'
                       '    pass\n',
       'tests': [{'name': 'PUT удаляет старое поле',
                  'args': [{'id': 4, 'title': 'Old', 'priority': 1, 'is_done': False, 'note': 'legacy'},
                           'PUT',
                           {'title': '  New title  ', 'priority': 5, 'is_done': True}],
                  'expected': {'id': 4, 'title': 'New title', 'priority': 5, 'is_done': True}},
                 {'name': 'PATCH только title',
                  'args': [{'id': 2, 'title': 'Old', 'priority': 3, 'is_done': False, 'note': 'keep'},
                           'PATCH',
                           {'title': '  HTTP API  '}],
                  'expected': {'id': 2, 'title': 'HTTP API', 'priority': 3, 'is_done': False, 'note': 'keep'}},
                 {'name': 'PATCH только status',
                  'args': [{'id': 9, 'title': 'Tests', 'priority': 2, 'is_done': False}, 'PATCH', {'is_done': True}],
                  'expected': {'id': 9, 'title': 'Tests', 'priority': 2, 'is_done': True}},
                 {'name': 'PATCH пустой payload',
                  'args': [{'id': 1, 'title': 'FastAPI', 'priority': 4, 'is_done': False}, 'PATCH', {}],
                  'expected': {'id': 1, 'title': 'FastAPI', 'priority': 4, 'is_done': False}}],
       'reference_code': 'def solve(task, method, payload):\n'
                         '    if method == "PUT":\n'
                         '        return {\n'
                         '            "id": task["id"],\n'
                         '            "title": payload["title"].strip(),\n'
                         '            "priority": payload["priority"],\n'
                         '            "is_done": payload["is_done"],\n'
                         '        }\n'
                         '    updated = task.copy()\n'
                         '    for field in ("title", "priority", "is_done"):\n'
                         '        if field in payload:\n'
                         '            value = payload[field]\n'
                         '            if field == "title":\n'
                         '                value = value.strip()\n'
                         '            updated[field] = value\n'
                         '    return updated\n'}],
}

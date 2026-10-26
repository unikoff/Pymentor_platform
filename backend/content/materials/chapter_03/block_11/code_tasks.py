"""Учебная практика блока. Редактируйте задания здесь."""

from __future__ import annotations

from typing import Any


CODE_TASKS: dict[int, list[dict[str, Any]]] = {
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

}

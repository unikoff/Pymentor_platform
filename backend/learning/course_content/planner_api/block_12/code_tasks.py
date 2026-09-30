"""Учебная практика блока. Редактируйте задания здесь."""

from __future__ import annotations

from typing import Any


CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    67: [{'title': 'Выполните полную CRUD-цепочку',
       'level': 'medium',
       'mode': 'solve',
       'prompt': 'Работайте с копиями исходных задач и последовательно выполните operations. create содержит title и '
                 'priority: создайте задачу с новым id и is_done=False, результат status 201. get содержит id: '
                 'верните копию task и status 200 либо task=None и status 404. patch содержит id и data: измените '
                 'только title, priority, is_done; status 200 или 404. delete содержит id: удалите найденную задачу; '
                 'status 204 или 404. Для каждого действия добавьте результат в results, затем верните словарь items '
                 'и results.',
       'contract': {'given': 'Автопроверка вызывает solve(tasks, operations). tasks — начальный список задач. '
                             'operations — список словарей действий create, get, patch и delete. Форматы операций '
                             'полностью перечислены в условии.',
                    'todo': 'Работайте с копиями исходных задач и последовательно выполните operations. create '
                            'содержит title и priority: создайте задачу с новым id и is_done=False, результат status '
                            '201. get содержит id: верните копию task и status 200 либо task=None и status 404. '
                            'patch содержит id и data: измените только title, priority, is_done; status 200 или 404. '
                            'delete содержит id: удалите найденную задачу; status 204 или 404. Для каждого действия '
                            'добавьте результат в results, затем верните словарь items и results.',
                    'check': 'Проверяются создание с последующим чтением, частичное обновление и удаление, а также '
                             'операции с отсутствующим id. Сравнивается полный журнал results и финальный items.'},
       'requirements': {'items': ['копии исходного storage',
                                  'create/get/patch/delete',
                                  'status для каждого действия',
                                  'журнал results'],
                        'names': ['tasks', 'operations', 'items', 'results', 'operation', 'action'],
                        'nodes': ['FunctionDef', 'For', 'If'],
                        'calls': ['range', 'len'],
                        'attributes': ['copy', 'append', 'strip', 'pop']},
       'starter_code': 'def solve(tasks, operations):\n'
                       '    items = []\n'
                       '    results = []\n'
                       '    # Скопируйте storage и выполните операции по порядку\n'
                       '    pass\n',
       'tests': [{'name': 'create и get',
                  'args': [[],
                           [{'action': 'create', 'title': '  HTTP  ', 'priority': 4}, {'action': 'get', 'id': 1}]],
                  'expected': {'items': [{'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False}],
                               'results': [{'action': 'create', 'status': 201, 'id': 1},
                                           {'action': 'get',
                                            'status': 200,
                                            'task': {'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False}}]}},
                 {'name': 'patch и delete',
                  'args': [[{'id': 2, 'title': 'HTTP', 'priority': 2, 'is_done': False},
                            {'id': 5, 'title': 'Old', 'priority': 1, 'is_done': False}],
                           [{'action': 'patch', 'id': 5, 'data': {'title': '  FastAPI  ', 'is_done': True}},
                            {'action': 'delete', 'id': 2}]],
                  'expected': {'items': [{'id': 5, 'title': 'FastAPI', 'priority': 1, 'is_done': True}],
                               'results': [{'action': 'patch', 'status': 200, 'id': 5},
                                           {'action': 'delete', 'status': 204, 'id': 2}]}},
                 {'name': 'отсутствующие объекты',
                  'args': [[{'id': 1, 'title': 'HTTP', 'priority': 2, 'is_done': False}],
                           [{'action': 'get', 'id': 99},
                            {'action': 'patch', 'id': 99, 'data': {'priority': 5}},
                            {'action': 'delete', 'id': 99}]],
                  'expected': {'items': [{'id': 1, 'title': 'HTTP', 'priority': 2, 'is_done': False}],
                               'results': [{'action': 'get', 'status': 404, 'task': None},
                                           {'action': 'patch', 'status': 404, 'id': 99},
                                           {'action': 'delete', 'status': 404, 'id': 99}]}}],
       'reference_code': 'def solve(tasks, operations):\n'
                         '    items = []\n'
                         '    for task in tasks:\n'
                         '        items.append(task.copy())\n'
                         '    results = []\n'
                         '    for operation in operations:\n'
                         '        action = operation["action"]\n'
                         '        if action == "create":\n'
                         '            next_id = 1\n'
                         '            for task in items:\n'
                         '                if task["id"] >= next_id:\n'
                         '                    next_id = task["id"] + 1\n'
                         '            new_task = {\n'
                         '                "id": next_id,\n'
                         '                "title": operation["title"].strip(),\n'
                         '                "priority": operation["priority"],\n'
                         '                "is_done": False,\n'
                         '            }\n'
                         '            items.append(new_task)\n'
                         '            results.append({"action": "create", "status": 201, "id": next_id})\n'
                         '        elif action == "get":\n'
                         '            found = None\n'
                         '            for task in items:\n'
                         '                if task["id"] == operation["id"]:\n'
                         '                    found = task.copy()\n'
                         '                    break\n'
                         '            status = 200 if found is not None else 404\n'
                         '            results.append({"action": "get", "status": status, "task": found})\n'
                         '        elif action == "patch":\n'
                         '            found = False\n'
                         '            for task in items:\n'
                         '                if task["id"] == operation["id"]:\n'
                         '                    for field in ("title", "priority", "is_done"):\n'
                         '                        if field in operation["data"]:\n'
                         '                            value = operation["data"][field]\n'
                         '                            if field == "title":\n'
                         '                                value = value.strip()\n'
                         '                            task[field] = value\n'
                         '                    found = True\n'
                         '                    break\n'
                         '            status = 200 if found else 404\n'
                         '            results.append({"action": "patch", "status": status, "id": operation["id"]})\n'
                         '        elif action == "delete":\n'
                         '            delete_index = None\n'
                         '            for index in range(len(items)):\n'
                         '                if items[index]["id"] == operation["id"]:\n'
                         '                    delete_index = index\n'
                         '                    break\n'
                         '            if delete_index is None:\n'
                         '                status = 404\n'
                         '            else:\n'
                         '                items.pop(delete_index)\n'
                         '                status = 204\n'
                         '            results.append({"action": "delete", "status": status, "id": operation["id"]})\n'
                         '    return {"items": items, "results": results}\n'}],
}

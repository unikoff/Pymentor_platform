from typing import Any

# Add interpreter/code tasks for each lesson after authoring its concept-based material.
CODE_TASKS: dict[int | str, list[dict[str, Any]]] = {number: [] for number in (16, "16.1", 17, "17.1", 18, "18.1", 19, "19.1", 20, "20.1")}

# Независимая миниработа выполняется отдельно от передаваемого Planner.
CODE_TASKS["20.1"] = [{'title': 'Самостоятельная миниработа: отчёт по открытым задачам',
  'level': 'medium',
  'mode': 'script',
  'prompt': 'В tasks находятся задачи Planner. Выведите число незавершённых задач, затем наибольшее числовое '
            'значение priority только среди них, затем исходный список tasks. Каждый результат с новой строки. '
            'Если незавершённых задач нет, нужны 0 и None. Данные не меняются. План, промежуточные значения и '
            'необходимость функций выберите самостоятельно. Используйте только изученные средства; функции '
            'могут быть любыми по числу и именам. Рабочий main.py Planner для этой миниработы менять не нужно.',
  'contract': {'given': 'tasks — отдельный список полных записей с id, title, priority (int от 1 до 5) и '
                        'is_done (bool), заданный платформой. Сравниваем числовые приоритеты; выполненные '
                        'задачи не участвуют в максимуме.',
               'todo': 'В tasks находятся задачи Planner. Выведите число незавершённых задач, затем наибольшее '
                       'числовое значение priority только среди них, затем исходный список tasks. Каждый '
                       'результат с новой строки. Если незавершённых задач нет, нужны 0 и None. Данные не '
                       'меняются. План, промежуточные значения и необходимость функций выберите '
                       'самостоятельно. Используйте только изученные средства; функции могут быть любыми по '
                       'числу и именам. Рабочий main.py Planner для этой миниработы менять не нужно.',
               'check': 'Проверяется весь вывод на разных данных, включая граничные случаи. Исходные данные '
                        'заданы платформой.'},
  'requirements': {'nodes': ['For'], 'calls': ['print']},
  'starter_code': '# Исходные данные заданы платформой. Напишите программу самостоятельно.\n',
  'hints': ['Сначала запишите, какие записи относятся к отчёту, какие два результата нужны и что означает '
            'отсутствие подходящих записей.',
            'Проверьте вручную список, где наибольший priority принадлежит выполненной задаче. Совпадение '
            'результата на одном наборе не гарантирует правильный отбор.',
            'Можно пройти исходные задачи и обновлять состояния только для незавершённых, либо сначала '
            'получить отдельную выборку. Счётчик пустого набора равен нулю; кандидата на максимум ещё нет.'],
  'tests': [{'name': 'Пустой список',
             'namespace': {'tasks': []},
             'expected': '0\nNone\n[]',
             'assert': 'stdout'},
            {'name': 'Все выполнены',
             'namespace': {'tasks': [{'id': 3, 'title': 'Задача 3', 'priority': 5, 'is_done': True},
                                     {'id': 8, 'title': 'Задача 8', 'priority': 2, 'is_done': True}]},
             'expected': '0\n'
                         'None\n'
                         "[{'id': 3, 'title': 'Задача 3', 'priority': 5, 'is_done': True}, {'id': 8, 'title': "
                         "'Задача 8', 'priority': 2, 'is_done': True}]",
             'assert': 'stdout'},
            {'name': 'Одна открытая',
             'namespace': {'tasks': [{'id': 11, 'title': 'Задача 11', 'priority': 1, 'is_done': False}]},
             'expected': "1\n1\n[{'id': 11, 'title': 'Задача 11', 'priority': 1, 'is_done': False}]",
             'assert': 'stdout'},
            {'name': 'Максимум выполненной не участвует',
             'namespace': {'tasks': [{'id': 4, 'title': 'Задача 4', 'priority': 5, 'is_done': True},
                                     {'id': 9, 'title': 'Задача 9', 'priority': 2, 'is_done': False},
                                     {'id': 12, 'title': 'Задача 12', 'priority': 3, 'is_done': False}]},
             'expected': '2\n'
                         '3\n'
                         "[{'id': 4, 'title': 'Задача 4', 'priority': 5, 'is_done': True}, {'id': 9, 'title': "
                         "'Задача 9', 'priority': 2, 'is_done': False}, {'id': 12, 'title': 'Задача 12', "
                         "'priority': 3, 'is_done': False}]",
             'assert': 'stdout'},
            {'name': 'Максимум не последний',
             'namespace': {'tasks': [{'id': 5, 'title': 'Задача 5', 'priority': 4, 'is_done': False},
                                     {'id': 2, 'title': 'Задача 2', 'priority': 1, 'is_done': False},
                                     {'id': 7, 'title': 'Задача 7', 'priority': 2, 'is_done': False}]},
             'expected': '3\n'
                         '4\n'
                         "[{'id': 5, 'title': 'Задача 5', 'priority': 4, 'is_done': False}, {'id': 2, 'title': "
                         "'Задача 2', 'priority': 1, 'is_done': False}, {'id': 7, 'title': 'Задача 7', "
                         "'priority': 2, 'is_done': False}]",
             'assert': 'stdout'},
            {'name': 'Повторные значения',
             'namespace': {'tasks': [{'id': 8, 'title': 'Задача 8', 'priority': 3, 'is_done': False},
                                     {'id': 13, 'title': 'Задача 13', 'priority': 3, 'is_done': False},
                                     {'id': 20, 'title': 'Задача 20', 'priority': 1, 'is_done': True}]},
             'expected': '2\n'
                         '3\n'
                         "[{'id': 8, 'title': 'Задача 8', 'priority': 3, 'is_done': False}, {'id': 13, "
                         "'title': 'Задача 13', 'priority': 3, 'is_done': False}, {'id': 20, 'title': 'Задача "
                         "20', 'priority': 1, 'is_done': True}]",
             'assert': 'stdout'}],
  'reference_code': 'open_count = 0\n'
                    'largest_priority = None\n'
                    'for task in tasks:\n'
                    '    if not task["is_done"]:\n'
                    '        open_count += 1\n'
                    '        if largest_priority is None:\n'
                    '            largest_priority = task["priority"]\n'
                    '        elif task["priority"] > largest_priority:\n'
                    '            largest_priority = task["priority"]\n'
                    'print(open_count)\n'
                    'print(largest_priority)\n'
                    'print(tasks)\n'}]


# Контракт функций проверяется до интеграции в локальное меню.
CODE_TASKS["19.1"] = [{'title': 'Закрепим интерфейсы статистики Planner',
  'level': 'medium',
  'mode': 'script',
  'prompt': 'Платформа задаёт tasks. Напишите build_statistics(tasks), возвращающую словарь с ключами total, '
            'completed, left, и completion_percent(statistics), принимающую один словарь. Процент округлите '
            'до одного знака; для total == 0 верните 0.0. Сохраните проверочные вызовы из стартового кода: '
            'они печатают три счётчика, процент, процент для отдельно заданной сводки и исходный список. '
            'Функции ничего не печатают и не меняют входные данные. После проверки перенесите только '
            'определения функций в локальный main.py; проверочные строки не входят в Planner.',
  'contract': {'given': 'Список tasks с четырьмя полями каждой задачи: id, title, priority, is_done.',
               'todo': 'Определите две функции перед готовыми проверочными вызовами.',
               'todo_items': ['build_statistics возвращает именно словарь total/completed/left, не кортеж.',
                              'completion_percent получает один словарь; проверяется также словарь, '
                              'созданный без build_statistics.',
                              'Не меняйте список задач и записи; печать выполняется только в проверочных '
                              'строках.'],
               'check': 'Проверяются пустота, открытые и выполненные задачи, смешанные наборы, округление и '
                        'неизменность исходных данных.'},
  'requirements': {'items': ['Два точных интерфейса сохранены.',
                             'Сводка отражает текущие задачи, не предыдущие вызовы.',
                             'Пустая сводка возвращает 0.0; входы не меняются.'],
                   'nodes': ['FunctionDef', 'Return'],
                   'calls': ['build_statistics', 'completion_percent', 'print']},
  'hints': ['Сначала получите total и completed, затем верните словарь с тремя точными ключами.',
            'Во второй функции прочитайте total из словаря и проверьте ноль до деления.',
            'Используйте один переданный словарь; левый счётчик равен total - completed. Округлите долю '
            'completed / total * 100.'],
  'starter_code': '# Определите обе функции выше проверочных вызовов.\n'
                  '\n'
                  'statistics = build_statistics(tasks)\n'
                  'print(statistics["total"])\n'
                  'print(statistics["completed"])\n'
                  'print(statistics["left"])\n'
                  'print(completion_percent(statistics))\n'
                  'print(completion_percent({"total": 3, "completed": 1, "left": 2}))\n'
                  'print(tasks)\n',
  'tests': [{'name': 'Пустой список',
             'namespace': {'tasks': []},
             'assert': 'stdout',
             'expected': '0\n0\n0\n0.0\n33.3\n[]'},
            {'name': 'Все открыты',
             'namespace': {'tasks': [{'id': 1, 'title': 'Задача 1', 'priority': 1, 'is_done': False},
                                     {'id': 2, 'title': 'Задача 2', 'priority': 2, 'is_done': False}]},
             'assert': 'stdout',
             'expected': '2\n'
                         '0\n'
                         '2\n'
                         '0.0\n'
                         '33.3\n'
                         "[{'id': 1, 'title': 'Задача 1', 'priority': 1, 'is_done': False}, {'id': 2, "
                         "'title': 'Задача 2', 'priority': 2, 'is_done': False}]"},
            {'name': 'Смешанный',
             'namespace': {'tasks': [{'id': 1, 'title': 'Задача 1', 'priority': 1, 'is_done': True},
                                     {'id': 2, 'title': 'Задача 2', 'priority': 2, 'is_done': False}]},
             'assert': 'stdout',
             'expected': '2\n'
                         '1\n'
                         '1\n'
                         '50.0\n'
                         '33.3\n'
                         "[{'id': 1, 'title': 'Задача 1', 'priority': 1, 'is_done': True}, {'id': 2, "
                         "'title': 'Задача 2', 'priority': 2, 'is_done': False}]"},
            {'name': 'Округление трети',
             'namespace': {'tasks': [{'id': 1, 'title': 'Задача 1', 'priority': 1, 'is_done': False},
                                     {'id': 2, 'title': 'Задача 2', 'priority': 2, 'is_done': True},
                                     {'id': 3, 'title': 'Задача 3', 'priority': 3, 'is_done': False}]},
             'assert': 'stdout',
             'expected': '3\n'
                         '1\n'
                         '2\n'
                         '33.3\n'
                         '33.3\n'
                         "[{'id': 1, 'title': 'Задача 1', 'priority': 1, 'is_done': False}, {'id': 2, "
                         "'title': 'Задача 2', 'priority': 2, 'is_done': True}, {'id': 3, 'title': 'Задача "
                         "3', 'priority': 3, 'is_done': False}]"},
            {'name': 'Все выполнены',
             'namespace': {'tasks': [{'id': 1, 'title': 'Задача 1', 'priority': 1, 'is_done': True},
                                     {'id': 2, 'title': 'Задача 2', 'priority': 2, 'is_done': True}]},
             'assert': 'stdout',
             'expected': '2\n'
                         '2\n'
                         '0\n'
                         '100.0\n'
                         '33.3\n'
                         "[{'id': 1, 'title': 'Задача 1', 'priority': 1, 'is_done': True}, {'id': 2, "
                         "'title': 'Задача 2', 'priority': 2, 'is_done': True}]"},
            {'name': 'Одна открытая',
             'namespace': {'tasks': [{'id': 1, 'title': 'Задача 1', 'priority': 1, 'is_done': False}]},
             'assert': 'stdout',
             'expected': '1\n'
                         '0\n'
                         '1\n'
                         '0.0\n'
                         '33.3\n'
                         "[{'id': 1, 'title': 'Задача 1', 'priority': 1, 'is_done': False}]"}],
  'reference_code': 'def build_statistics(tasks):\n'
                    '    total = len(tasks)\n'
                    '    completed = 0\n'
                    '    for task in tasks:\n'
                    '        if task["is_done"]:\n'
                    '            completed += 1\n'
                    '    return {"total": total, "completed": completed, "left": total - completed}\n'
                    '\n'
                    'def completion_percent(statistics):\n'
                    '    if statistics["total"] == 0:\n'
                    '        return 0.0\n'
                    '    return round(statistics["completed"] / statistics["total"] * 100, 1)\n'
                    '\n'
                    'statistics = build_statistics(tasks)\n'
                    'print(statistics["total"])\n'
                    'print(statistics["completed"])\n'
                    'print(statistics["left"])\n'
                    'print(completion_percent(statistics))\n'
                    'print(completion_percent({"total": 3, "completed": 1, "left": 2}))\n'
                    'print(tasks)\n'}]

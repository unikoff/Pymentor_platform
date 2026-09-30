from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    16: [{'title': 'Одна итерация меню',
       'level': 'easy',
       'mode': 'script',
       'prompt': 'Получите clean_title = raw_title.strip(). Для add: если clean_title пуст, выведите Ошибка: пустой '
                 'заголовок, иначе Добавить: <clean_title>. Для list выведите Показать задачи, для exit — Выход, для '
                 'другой команды — Неизвестная команда.',
       'contract': {'given': 'Платформа создаёт command и raw_title. command может быть add, list, exit или '
                             'неизвестной строкой. raw_title используется для add и может состоять из пробелов.',
                    'todo': 'Получите clean_title = raw_title.strip(). Для add: если clean_title пуст, выведите '
                            'Ошибка: пустой заголовок, иначе Добавить: <clean_title>. Для list выведите Показать '
                            'задачи, для exit — Выход, для другой команды — Неизвестная команда.',
                    'check': 'Проверяются пять сценариев. Каждый запуск должен дать ровно одну строку.'},
       'requirements': {'items': ['clean_title через strip()',
                                  'команды add/list/exit',
                                  'пустой заголовок',
                                  'неизвестная команда'],
                        'names': ['command', 'raw_title', 'clean_title'],
                        'attributes': ['strip'],
                        'nodes': ['If'],
                        'calls': ['print']},
       'starter_code': '# command и raw_title уже созданы\n'
                       '# Получите clean_title и обработайте add, list, exit, неизвестную команду\n',
       'tests': [{'name': 'add',
                  'namespace': {'command': 'add', 'raw_title': '  Изучить функции  '},
                  'expected': 'Добавить: Изучить функции',
                  'assert': 'stdout'},
                 {'name': 'пустой add',
                  'namespace': {'command': 'add', 'raw_title': '   '},
                  'expected': 'Ошибка: пустой заголовок',
                  'assert': 'stdout'},
                 {'name': 'list',
                  'namespace': {'command': 'list', 'raw_title': ''},
                  'expected': 'Показать задачи',
                  'assert': 'stdout'},
                 {'name': 'exit',
                  'namespace': {'command': 'exit', 'raw_title': ''},
                  'expected': 'Выход',
                  'assert': 'stdout'},
                 {'name': 'unknown',
                  'namespace': {'command': 'remove', 'raw_title': ''},
                  'expected': 'Неизвестная команда',
                  'assert': 'stdout'}],
       'reference_code': 'clean_title = raw_title.strip()\n'
                         "if command == 'add':\n"
                         "    if clean_title == '':\n"
                         "        print('Ошибка: пустой заголовок')\n"
                         '    else:\n'
                         "        print(f'Добавить: {clean_title}')\n"
                         "elif command == 'list':\n"
                         "    print('Показать задачи')\n"
                         "elif command == 'exit':\n"
                         "    print('Выход')\n"
                         'else:\n'
                         "    print('Неизвестная команда')\n"}],
    17: [{'title': 'Добавление задачи со стабильным id',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Начните с next_id = 1. Циклом найдите id больше максимального существующего. Очистите title через '
                 'strip(). Создайте новую задачу с next_id, title, priority и done=False. Добавьте её через append() '
                 'и верните обновлённый tasks.',
       'contract': {'given': 'Автопроверка вызывает solve(tasks, title, priority). tasks — список словарей с ключами '
                             'id, title, priority, done. Список может быть пустым или иметь пропуски в id.',
                    'todo': 'Начните с next_id = 1. Циклом найдите id больше максимального существующего. Очистите '
                            'title через strip(). Создайте новую задачу с next_id, title, priority и done=False. '
                            'Добавьте её через append() и верните обновлённый tasks.',
                    'check': 'Проверяется пустой список и список с пропуском id. Новый id должен быть больше '
                             'максимального id, а не равен len(tasks)+1.'},
       'requirements': {'items': ['поиск next_id циклом',
                                  'title.strip()',
                                  'словарь новой задачи',
                                  'append()',
                                  'return tasks'],
                        'names': ['tasks', 'title', 'priority', 'next_id', 'new_task'],
                        'nodes': ['FunctionDef', 'For', 'If'],
                        'attributes': ['strip', 'append']},
       'starter_code': 'def solve(tasks, title, priority):\n'
                       '    next_id = 1\n'
                       '    # Найдите следующий id\n'
                       '    # Создайте и добавьте задачу\n'
                       '    # Верните tasks\n'
                       '    pass\n',
       'tests': [{'name': 'пустой',
                  'args': [[], '  Изучить списки  ', 2],
                  'expected': [{'id': 1, 'title': 'Изучить списки', 'priority': 2, 'done': False}]},
                 {'name': 'обычные id',
                  'args': [[{'id': 1, 'title': 'Код', 'priority': 1, 'done': False},
                            {'id': 2, 'title': 'Git', 'priority': 3, 'done': True}],
                           'README',
                           4],
                  'expected': [{'id': 1, 'title': 'Код', 'priority': 1, 'done': False},
                               {'id': 2, 'title': 'Git', 'priority': 3, 'done': True},
                               {'id': 3, 'title': 'README', 'priority': 4, 'done': False}]},
                 {'name': 'пропуск id',
                  'args': [[{'id': 1, 'title': 'Код', 'priority': 1, 'done': False},
                            {'id': 4, 'title': 'Релиз', 'priority': 5, 'done': False}],
                           'Тесты',
                           3],
                  'expected': [{'id': 1, 'title': 'Код', 'priority': 1, 'done': False},
                               {'id': 4, 'title': 'Релиз', 'priority': 5, 'done': False},
                               {'id': 5, 'title': 'Тесты', 'priority': 3, 'done': False}]}],
       'reference_code': 'def solve(tasks, title, priority):\n'
                         '    next_id = 1\n'
                         '    for task_item in tasks:\n'
                         "        if task_item['id'] >= next_id:\n"
                         "            next_id = task_item['id'] + 1\n"
                         "    new_task = {'id': next_id, 'title': title.strip(), 'priority': priority, 'done': "
                         'False}\n'
                         '    tasks.append(new_task)\n'
                         '    return tasks\n'}],
    18: [{'title': 'Поиск, завершение и статистика',
       'level': 'medium',
       'mode': 'solve',
       'prompt': 'Найдите task_id и установите done=True; сохраните found. Соберите matches из заголовков, '
                 'содержащих query без учёта регистра. После изменения посчитайте открытые и выполненные задачи. '
                 'Верните словарь с ключами found, matches, open, done.',
       'contract': {'given': 'Автопроверка вызывает solve(tasks, task_id, query). tasks содержит словари id, title, '
                             'done. task_id — задача для завершения, query — часть заголовка для поиска без учёта '
                             'регистра.',
                    'todo': 'Найдите task_id и установите done=True; сохраните found. Соберите matches из '
                            'заголовков, содержащих query без учёта регистра. После изменения посчитайте открытые и '
                            'выполненные задачи. Верните словарь с ключами found, matches, open, done.',
                    'check': 'Проверяются найденный id, отсутствующий id и пустой список. Статистика считается после '
                             'изменения статуса, порядок matches сохраняется.'},
       'requirements': {'items': ['поиск по id',
                                  'done=True',
                                  'поиск без регистра',
                                  'два счётчика',
                                  'четыре ключа результата'],
                        'names': ['tasks', 'task_id', 'query', 'found', 'matches', 'open_count', 'done_count'],
                        'nodes': ['FunctionDef', 'For', 'If'],
                        'attributes': ['lower', 'append']},
       'starter_code': 'def solve(tasks, task_id, query):\n'
                       '    found = False\n'
                       '    matches = []\n'
                       '    open_count = 0\n'
                       '    done_count = 0\n'
                       '    # Измените статус, соберите matches и статистику\n'
                       "    return {'found': found, 'matches': matches, 'open': open_count, 'done': done_count}\n",
       'tests': [{'name': 'найдена',
                  'args': [[{'id': 1, 'title': 'Сделать README', 'done': False},
                            {'id': 2, 'title': 'Написать тесты', 'done': False},
                            {'id': 3, 'title': 'Git практика', 'done': True}],
                           2,
                           'read'],
                  'expected': {'found': True, 'matches': ['Сделать README'], 'open': 1, 'done': 2}},
                 {'name': 'id отсутствует',
                  'args': [[{'id': 1, 'title': 'Код', 'done': False}, {'id': 2, 'title': 'Код-ревью', 'done': True}],
                           99,
                           'КОД'],
                  'expected': {'found': False, 'matches': ['Код', 'Код-ревью'], 'open': 1, 'done': 1}},
                 {'name': 'пустой',
                  'args': [[], 1, 'python'],
                  'expected': {'found': False, 'matches': [], 'open': 0, 'done': 0}}],
       'reference_code': 'def solve(tasks, task_id, query):\n'
                         '    found = False\n'
                         '    for task_item in tasks:\n'
                         "        if task_item['id'] == task_id:\n"
                         "            task_item['done'] = True\n"
                         '            found = True\n'
                         '    matches = []\n'
                         '    open_count = 0\n'
                         '    done_count = 0\n'
                         '    normalized_query = query.lower()\n'
                         '    for task_item in tasks:\n'
                         "        if normalized_query in task_item['title'].lower():\n"
                         "            matches.append(task_item['title'])\n"
                         "        if task_item['done']:\n"
                         '            done_count += 1\n'
                         '        else:\n'
                         '            open_count += 1\n'
                         "    return {'found': found, 'matches': matches, 'open': open_count, 'done': "
                         'done_count}\n'}]
}

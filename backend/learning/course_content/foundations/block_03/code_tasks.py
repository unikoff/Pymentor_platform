from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    11: [{'title': 'Коллекции учебного проекта',
       'level': 'easy',
       'mode': 'script',
       'prompt': "Добавьте new_task в tasks через append(). Создайте кортеж statuses = ('new', 'done'). Создайте "
                 'unique_tags = set(tags). Выведите: длину tasks, элемент statuses с индексом 1, количество '
                 'уникальных тегов — каждое значение с новой строки.',
       'contract': {'given': 'Платформа создаёт список tasks, строку new_task и список tags с повторами.',
                    'todo': "Добавьте new_task в tasks через append(). Создайте кортеж statuses = ('new', 'done'). "
                            'Создайте unique_tags = set(tags). Выведите: длину tasks, элемент statuses с индексом 1, '
                            'количество уникальных тегов — каждое значение с новой строки.',
                    'check': 'Проверяются разные списки. Ожидаются три строки: новая длина tasks, слово done, число '
                             'уникальных тегов.'},
       'requirements': {'items': ['append(new_task)', 'кортеж statuses', 'множество unique_tags', 'три строки'],
                        'names': ['tasks', 'new_task', 'tags', 'statuses', 'unique_tags'],
                        'attributes': ['append'],
                        'calls': ['set', 'len', 'print']},
       'starter_code': '# tasks, new_task и tags уже созданы\n'
                       '# Добавьте задачу, создайте statuses и unique_tags, выведите три значения\n',
       'tests': [{'name': 'два тега',
                  'namespace': {'tasks': ['Код'], 'new_task': 'README', 'tags': ['python', 'git', 'python']},
                  'expected': '2\ndone\n2',
                  'assert': 'stdout'},
                 {'name': 'три тега',
                  'namespace': {'tasks': ['Код', 'Тесты', 'Git'],
                                'new_task': 'Релиз',
                                'tags': ['api', 'api', 'test', 'git']},
                  'expected': '4\ndone\n3',
                  'assert': 'stdout'}],
       'reference_code': 'tasks.append(new_task)\n'
                         "statuses = ('new', 'done')\n"
                         'unique_tags = set(tags)\n'
                         'print(len(tasks))\n'
                         'print(statuses[1])\n'
                         'print(len(unique_tags))\n'}],
    12: [{'title': 'Словарь одной задачи',
       'level': 'easy',
       'mode': 'script',
       'prompt': 'Создайте словарь task: ключ title получает переменную title, priority получает priority, done '
                 "сначала равен False. Затем замените task['done'] на new_done. Выведите значения по ключам title, "
                 'priority, done — каждое с новой строки.',
       'contract': {'given': 'Платформа создаёт title, priority и логическое значение new_done.',
                    'todo': 'Создайте словарь task: ключ title получает переменную title, priority получает '
                            "priority, done сначала равен False. Затем замените task['done'] на new_done. Выведите "
                            'значения по ключам title, priority, done — каждое с новой строки.',
                    'check': 'Проверяются два набора данных. Ключи должны называться точно title, priority, done.'},
       'requirements': {'items': ['словарь task с тремя ключами',
                                  'done = False',
                                  'обновление done',
                                  'чтение по ключам'],
                        'names': ['title', 'priority', 'new_done', 'task'],
                        'calls': ['print']},
       'starter_code': '# title, priority и new_done уже созданы\n'
                       '# Создайте task, обновите done, выведите три значения\n',
       'tests': [{'name': 'открытая',
                  'namespace': {'title': 'Код', 'priority': 1, 'new_done': False},
                  'expected': 'Код\n1\nFalse',
                  'assert': 'stdout'},
                 {'name': 'выполненная',
                  'namespace': {'title': 'README', 'priority': 3, 'new_done': True},
                  'expected': 'README\n3\nTrue',
                  'assert': 'stdout'}],
       'reference_code': "task = {'title': title, 'priority': priority, 'done': False}\n"
                         "task['done'] = new_done\n"
                         "print(task['title'])\n"
                         "print(task['priority'])\n"
                         "print(task['done'])\n"}],
    13: [{'title': 'Функция форматирования задачи',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Внутри solve верните строку Задача: <title> | приоритет: <priority> через return и f-строку. '
                 'Используйте оба параметра. Не вызывайте print().',
       'contract': {'given': 'Автопроверка вызывает solve(title, priority) с разными строками и целыми числами. Тело '
                             'функции пока пустое.',
                    'todo': 'Внутри solve верните строку Задача: <title> | приоритет: <priority> через return и '
                            'f-строку. Используйте оба параметра. Не вызывайте print().',
                    'check': "Проверяются минимум три набора аргументов. Например, solve('Код', 1) должна вернуть "
                             'Задача: Код | приоритет: 1.'},
       'requirements': {'items': ['solve(title, priority)', 'оба параметра', 'f-строка', 'return вместо print'],
                        'names': ['title', 'priority'],
                        'nodes': ['FunctionDef', 'JoinedStr']},
       'starter_code': 'def solve(title, priority):\n    # Верните готовую строку\n    pass\n',
       'tests': [{'name': 'код', 'args': ['Код', 1], 'expected': 'Задача: Код | приоритет: 1'},
                 {'name': 'README', 'args': ['README', 3], 'expected': 'Задача: README | приоритет: 3'},
                 {'name': 'длинный заголовок',
                  'args': ['Повторить функции', 5],
                  'expected': 'Задача: Повторить функции | приоритет: 5'}],
       'reference_code': "def solve(title, priority):\n    return f'Задача: {title} | приоритет: {priority}'\n"}],
    14: [{'title': 'Две функции с разными обязанностями',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Создайте normalize_title(title), которая возвращает title.strip().title(). В solve вызовите '
                 'normalize_title(raw_title) и верните словарь с ключами title, priority, done: очищенный заголовок, '
                 'переданный priority и False.',
       'contract': {'given': 'Автопроверка вызывает solve(raw_title, priority). raw_title может содержать пробелы и '
                             'разный регистр, priority — целое число.',
                    'todo': 'Создайте normalize_title(title), которая возвращает title.strip().title(). В solve '
                            'вызовите normalize_title(raw_title) и верните словарь с ключами title, priority, done: '
                            'очищенный заголовок, переданный priority и False.',
                    'check': 'Сравнивается весь словарь. Также проверяется, что solve действительно вызывает '
                             'normalize_title.'},
       'requirements': {'items': ['normalize_title()',
                                  'strip() и title()',
                                  'вызов helper из solve',
                                  'словарь с тремя ключами'],
                        'names': ['raw_title', 'priority'],
                        'calls': ['normalize_title'],
                        'attributes': ['strip', 'title'],
                        'nodes': ['FunctionDef']},
       'starter_code': 'def normalize_title(title):\n'
                       '    # Верните очищенный заголовок\n'
                       '    pass\n'
                       '\n'
                       '\n'
                       'def solve(raw_title, priority):\n'
                       '    # Вызовите normalize_title и верните словарь\n'
                       '    pass\n',
       'tests': [{'name': 'пробелы',
                  'args': ['  сделать readme  ', 2],
                  'expected': {'title': 'Сделать Readme', 'priority': 2, 'done': False}},
                 {'name': 'регистр',
                  'args': ['  PYTHON ПРАКТИКА ', 4],
                  'expected': {'title': 'Python Практика', 'priority': 4, 'done': False}},
                 {'name': 'одно слово',
                  'args': ['git', 1],
                  'expected': {'title': 'Git', 'priority': 1, 'done': False}}],
       'reference_code': 'def normalize_title(title):\n'
                         '    return title.strip().title()\n'
                         '\n'
                         '\n'
                         'def solve(raw_title, priority):\n'
                         '    clean_title = normalize_title(raw_title)\n'
                         "    return {'title': clean_title, 'priority': priority, 'done': False}\n"}],
    15: [{'title': 'Исправьте NameError и TypeError',
       'level': 'easy',
       'mode': 'script',
       'prompt': 'Исправьте две строки: используйте правильное имя task_title и преобразуйте raw_priority через '
                 'int() перед сложением. После исправления программа выводит Сделать README, затем 3.',
       'contract': {'given': 'В редакторе программа с двумя ошибками. Переменная называется task_title, но в print '
                             "написано task_titel. raw_priority хранит строку '2', поэтому её нельзя складывать с "
                             'числом 1.',
                    'todo': 'Исправьте две строки: используйте правильное имя task_title и преобразуйте raw_priority '
                            'через int() перед сложением. После исправления программа выводит Сделать README, затем '
                            '3.',
                    'check': 'Сравниваются две строки и проверяется вызов int(). Не переименовывайте исходные '
                             'переменные и не заменяйте вычисление готовым print(3).'},
       'requirements': {'items': ['правильное имя task_title', 'int(raw_priority)', 'две строки вывода'],
                        'names': ['task_title', 'raw_priority'],
                        'calls': ['int', 'print']},
       'starter_code': "task_title = 'Сделать README'\n"
                       "raw_priority = '2'\n"
                       '\n'
                       'print(task_titel)\n'
                       'print(raw_priority + 1)\n',
       'tests': [{'name': 'обе ошибки исправлены', 'expected': 'Сделать README\n3', 'assert': 'stdout'}],
       'reference_code': "task_title = 'Сделать README'\n"
                         "raw_priority = '2'\n"
                         '\n'
                         'print(task_title)\n'
                         'print(int(raw_priority) + 1)\n'}]
}

from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    22: [{'title': 'Контракт создания задачи',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Объявите solve(title, priority=2). Получите clean_title через title.strip(). Если clean_title '
                 'пуст, верните None. Иначе верните словарь с ключами title, priority и done. Для done установите '
                 'False. Функция ничего не печатает.',
       'contract': {'given': 'Автопроверка вызывает solve(title, priority) или solve(title). title — строка, иногда '
                             'только из пробелов. priority — целое число от 1 до 5; когда аргумент не передан, '
                             'должно использоваться значение 2.',
                    'todo': 'Объявите solve(title, priority=2). Получите clean_title через title.strip(). Если '
                            'clean_title пуст, верните None. Иначе верните словарь с ключами title, priority и done. '
                            'Для done установите False. Функция ничего не печатает.',
                    'check': 'Проверяются вызов со значением по умолчанию, явный priority, заголовок с пробелами и '
                             'пустой заголовок. Сравнивается return. Лишний print не нужен.'},
       'requirements': {'items': ['параметр priority со значением 2',
                                  'title.strip()',
                                  'return None для пустой строки',
                                  'словарь задачи'],
                        'nodes': ['FunctionDef', 'If'],
                        'attributes': ['strip']},
       'starter_code': 'def solve(title, priority=2):\n'
                       '    # Получите clean_title\n'
                       '    # Верните None или словарь задачи\n'
                       '    pass\n',
       'tests': [{'name': 'значение по умолчанию',
                  'args': ['  Изучить функции  '],
                  'expected': {'title': 'Изучить функции', 'priority': 2, 'done': False}},
                 {'name': 'явный приоритет',
                  'args': ['README', 5],
                  'expected': {'title': 'README', 'priority': 5, 'done': False}},
                 {'name': 'именованный приоритет',
                  'args': ['  Тесты '],
                  'kwargs': {'priority': 3},
                  'expected': {'title': 'Тесты', 'priority': 3, 'done': False}},
                 {'name': 'пустой заголовок', 'args': ['   '], 'expected': None}],
       'reference_code': 'def solve(title, priority=2):\n'
                         '    clean_title = title.strip()\n'
                         "    if clean_title == '':\n"
                         '        return None\n'
                         "    return {'title': clean_title, 'priority': priority, 'done': False}\n"}],
    23: [{'title': 'Позиционные и именованные вызовы',
       'level': 'easy',
       'mode': 'script',
       'prompt': 'Объявите create_task(title, priority=2, done=False), которая возвращает словарь title, priority, '
                 'done. Создайте first вызовом только с first_title. Создайте second, передав second_title '
                 'позиционно, а second_priority именованно. Создайте third, передав third_title позиционно, а '
                 'priority и done именованно в обратном порядке: done=third_done, priority=third_priority. Выведите '
                 'first, second и third с новой строки.',
       'contract': {'given': 'Интерпретатор создаёт first_title, second_title, second_priority, third_title, '
                             'third_priority и third_done. Значения меняются в проверках.',
                    'todo': 'Объявите create_task(title, priority=2, done=False), которая возвращает словарь title, '
                            'priority, done. Создайте first вызовом только с first_title. Создайте second, передав '
                            'second_title позиционно, а second_priority именованно. Создайте third, передав '
                            'third_title позиционно, а priority и done именованно в обратном порядке: '
                            'done=third_done, priority=third_priority. Выведите first, second и third с новой '
                            'строки.',
                    'check': 'Программа запускается с двумя наборами данных. Сравниваются три строки целиком. '
                             'Проверяется функция со значениями по умолчанию и использование всех подготовленных '
                             'переменных.'},
       'requirements': {'items': ['create_task с двумя значениями по умолчанию',
                                  'позиционный title',
                                  'именованные priority и done',
                                  'три результата'],
                        'nodes': ['FunctionDef'],
                        'calls': ['print'],
                        'names': ['first_title',
                                  'second_title',
                                  'second_priority',
                                  'third_title',
                                  'third_priority',
                                  'third_done']},
       'starter_code': '# Все входные переменные уже созданы\n# Объявите create_task и выполните три разных вызова\n',
       'tests': [{'name': 'основной набор',
                  'namespace': {'first_title': 'Python',
                                'second_title': 'SQL',
                                'second_priority': 4,
                                'third_title': 'Git',
                                'third_priority': 1,
                                'third_done': True},
                  'expected': "{'title': 'Python', 'priority': 2, 'done': False}\n"
                              "{'title': 'SQL', 'priority': 4, 'done': False}\n"
                              "{'title': 'Git', 'priority': 1, 'done': True}",
                  'assert': 'stdout'},
                 {'name': 'другие значения',
                  'namespace': {'first_title': 'README',
                                'second_title': 'Тесты',
                                'second_priority': 5,
                                'third_title': 'Релиз',
                                'third_priority': 3,
                                'third_done': False},
                  'expected': "{'title': 'README', 'priority': 2, 'done': False}\n"
                              "{'title': 'Тесты', 'priority': 5, 'done': False}\n"
                              "{'title': 'Релиз', 'priority': 3, 'done': False}",
                  'assert': 'stdout'}],
       'reference_code': 'def create_task(title, priority=2, done=False):\n'
                         "    return {'title': title, 'priority': priority, 'done': done}\n"
                         '\n'
                         'first = create_task(first_title)\n'
                         'second = create_task(second_title, priority=second_priority)\n'
                         'third = create_task(third_title, done=third_done, priority=third_priority)\n'
                         'print(first)\n'
                         'print(second)\n'
                         'print(third)\n'}],
    24: [{'title': 'Копия списка без скрытого изменения',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Создайте updated через tasks.copy(). Добавьте в updated очищенный title через append(). Не '
                 'изменяйте tasks. Верните словарь с ключами original и updated: original должен ссылаться на '
                 'неизменённое содержимое tasks, updated — на новый список с добавленным заголовком.',
       'contract': {'given': 'Автопроверка вызывает solve(tasks, title). tasks — список строк. Вызывающий код должен '
                             'сохранить исходный список без изменений.',
                    'todo': 'Создайте updated через tasks.copy(). Добавьте в updated очищенный title через append(). '
                            'Не изменяйте tasks. Верните словарь с ключами original и updated: original должен '
                            'ссылаться на неизменённое содержимое tasks, updated — на новый список с добавленным '
                            'заголовком.',
                    'check': 'Проверяются пустой и заполненный списки, а также заголовок с пробелами. Сравнивается '
                             'return. Решение через tasks.append(title) не пройдёт, потому что original тоже '
                             'изменится.'},
       'requirements': {'items': ['отдельная копия списка', 'append только в копию', 'исходный список без изменения'],
                        'nodes': ['FunctionDef'],
                        'attributes': ['copy', 'append', 'strip']},
       'starter_code': 'def solve(tasks, title):\n'
                       '    # Создайте отдельный список updated\n'
                       '    # Добавьте очищенный title\n'
                       '    # Верните original и updated\n'
                       '    pass\n',
       'tests': [{'name': 'заполненный список',
                  'args': [['Python', 'Git'], '  SQL  '],
                  'expected': {'original': ['Python', 'Git'], 'updated': ['Python', 'Git', 'SQL']}},
                 {'name': 'пустой список',
                  'args': [[], 'README'],
                  'expected': {'original': [], 'updated': ['README']}},
                 {'name': 'одно значение',
                  'args': [['Тесты'], '  Релиз'],
                  'expected': {'original': ['Тесты'], 'updated': ['Тесты', 'Релиз']}}],
       'reference_code': 'def solve(tasks, title):\n'
                         '    updated = tasks.copy()\n'
                         '    updated.append(title.strip())\n'
                         "    return {'original': tasks, 'updated': updated}\n"}],
    25: [{'title': 'Сводка через args и kwargs',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Объявите вспомогательную функцию make_summary(total, label, multiplier), возвращающую словарь '
                 'label, total и adjusted. Затем объявите solve(*durations, **settings). Получите total через '
                 'sum(durations). Из settings получите label со значением StudyHub и multiplier со значением 1 по '
                 'умолчанию. Соберите config с ключами label и multiplier и вызовите make_summary(total, **config). '
                 'Верните полученный словарь.',
       'contract': {'given': 'Автопроверка вызывает solve с произвольным количеством позиционных длительностей и '
                             'именованными настройками label и multiplier. Настройки могут отсутствовать.',
                    'todo': 'Объявите вспомогательную функцию make_summary(total, label, multiplier), возвращающую '
                            'словарь label, total и adjusted. Затем объявите solve(*durations, **settings). Получите '
                            'total через sum(durations). Из settings получите label со значением StudyHub и '
                            'multiplier со значением 1 по умолчанию. Соберите config с ключами label и multiplier и '
                            'вызовите make_summary(total, **config). Верните полученный словарь.',
                    'check': 'Проверяются ноль, два и четыре позиционных значения, настройки по умолчанию и '
                             'именованные настройки. Сравнивается return. В решении должны быть *durations, '
                             '**settings и распаковка словаря при вызове make_summary.'},
       'requirements': {'items': ['*durations',
                                  '**settings',
                                  'sum(durations)',
                                  'settings.get()',
                                  'распаковка **config'],
                        'nodes': ['FunctionDef'],
                        'calls': ['sum', 'make_summary'],
                        'attributes': ['get']},
       'starter_code': 'def make_summary(total, label, multiplier):\n'
                       '    # Верните словарь сводки\n'
                       '    pass\n'
                       '\n'
                       '\n'
                       'def solve(*durations, **settings):\n'
                       '    # Посчитайте total и подготовьте config\n'
                       '    # Вызовите make_summary(total, **config)\n'
                       '    pass\n',
       'tests': [{'name': 'значения по умолчанию',
                  'args': [30, 45],
                  'expected': {'label': 'StudyHub', 'total': 75, 'adjusted': 75}},
                 {'name': 'именованные настройки',
                  'args': [10, 20, 30],
                  'kwargs': {'label': 'Неделя', 'multiplier': 2},
                  'expected': {'label': 'Неделя', 'total': 60, 'adjusted': 120}},
                 {'name': 'без длительностей',
                  'kwargs': {'label': 'Пустой план'},
                  'expected': {'label': 'Пустой план', 'total': 0, 'adjusted': 0}},
                 {'name': 'четыре значения',
                  'args': [5, 10, 15, 20],
                  'kwargs': {'multiplier': 3},
                  'expected': {'label': 'StudyHub', 'total': 50, 'adjusted': 150}}],
       'reference_code': 'def make_summary(total, label, multiplier):\n'
                         "    return {'label': label, 'total': total, 'adjusted': total * multiplier}\n"
                         '\n'
                         'def solve(*durations, **settings):\n'
                         '    total = sum(durations)\n'
                         "    label = settings.get('label', 'StudyHub')\n"
                         "    multiplier = settings.get('multiplier', 1)\n"
                         "    config = {'label': label, 'multiplier': multiplier}\n"
                         '    return make_summary(total, **config)\n'}],
    26: [{'title': 'Callback внутри замыкания',
       'level': 'medium',
       'mode': 'solve',
       'prompt': 'Внутри solve объявите double(value) и square(value). Объявите make_transformer(operation, offset), '
                 'внутри неё — transform(value), которая вызывает переданную operation, прибавляет сохранённый '
                 'offset и возвращает результат. Выберите callback по mode, получите transformer через '
                 'make_transformer и примените его к каждому числу. Верните новый список.',
       'contract': {'given': 'Автопроверка вызывает solve(values, mode, offset). values — список чисел. mode равен '
                             'double или square. offset — число, которое нужно прибавить после основной операции.',
                    'todo': 'Внутри solve объявите double(value) и square(value). Объявите '
                            'make_transformer(operation, offset), внутри неё — transform(value), которая вызывает '
                            'переданную operation, прибавляет сохранённый offset и возвращает результат. Выберите '
                            'callback по mode, получите transformer через make_transformer и примените его к каждому '
                            'числу. Верните новый список.',
                    'check': 'Проверяются оба callback, разные offset и пустой список. Сравнивается return. Исходный '
                             'values менять не нужно.'},
       'requirements': {'items': ['callback без немедленного вызова',
                                  'вложенная transform',
                                  'замыкание хранит operation и offset',
                                  'новый список результата'],
                        'nodes': ['FunctionDef', 'For'],
                        'attributes': ['append']},
       'starter_code': 'def solve(values, mode, offset):\n'
                       '    def double(value):\n'
                       '        pass\n'
                       '\n'
                       '    def square(value):\n'
                       '        pass\n'
                       '\n'
                       '    def make_transformer(operation, offset):\n'
                       '        def transform(value):\n'
                       '            pass\n'
                       '        return transform\n'
                       '\n'
                       '    # Выберите callback, создайте transformer и соберите result\n'
                       '    pass\n',
       'tests': [{'name': 'удвоение', 'args': [[1, 2, 3], 'double', 1], 'expected': [3, 5, 7]},
                 {'name': 'квадрат', 'args': [[2, 3], 'square', 0], 'expected': [4, 9]},
                 {'name': 'квадрат со смещением', 'args': [[-2, 0, 4], 'square', 5], 'expected': [9, 5, 21]},
                 {'name': 'пустой список', 'args': [[], 'double', 10], 'expected': []}],
       'reference_code': 'def solve(values, mode, offset):\n'
                         '    def double(value):\n'
                         '        return value * 2\n'
                         '\n'
                         '    def square(value):\n'
                         '        return value * value\n'
                         '\n'
                         '    def make_transformer(operation, offset):\n'
                         '        def transform(value):\n'
                         '            return operation(value) + offset\n'
                         '        return transform\n'
                         '\n'
                         "    callback = double if mode == 'double' else square\n"
                         '    transformer = make_transformer(callback, offset)\n'
                         '    result = []\n'
                         '    for value in values:\n'
                         '        result.append(transformer(value))\n'
                         '    return result\n'}]
}

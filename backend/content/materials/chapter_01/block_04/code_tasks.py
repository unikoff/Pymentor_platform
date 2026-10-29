from typing import Any

# Add interpreter/code tasks for each lesson after authoring its concept-based material.
CODE_TASKS: dict[int | str, list[dict[str, Any]]] = {number: [] for number in (16, "16.1", 17, "17.1", 18, "18.1", 19, "19.1", 20, "20.1")}

# Независимая миниработа выполняется отдельно от передаваемого Planner.
CODE_TASKS["20.1"] = [{'title': 'Самостоятельная миниработа: отчёт по открытым задачам',
  'level': 'medium',
  'mode': 'script',
  'prompt': 'Отдельная миниработа в редакторе платформы: список tasks уже содержит словари задач. '
            'Выведите ровно три строки: (1) количество открытых задач (is_done == False); (2) '
            'наибольшее числовое значение priority среди открытых или None, если таких задач нет; '
            '(3) исходный tasks в неизменённом виде. Если tasks пуст или все задачи выполнены, '
            'первые две строки должны быть 0 и None. Высокий priority выполненной задачи '
            'игнорируйте. Используйте изученный цикл for и функцию print; порядок действий, '
            'промежуточные переменные и свои функции выберите самостоятельно. Не меняйте записи, '
            'их порядок или основной main.py Planner.',
  'contract': {'given': 'tasks: отдельный список полных записей с id, title, priority (int от 1 '
                        'до 5) и is_done (bool), заданный платформой. Сравниваем числовые '
                        'приоритеты; выполненные задачи не участвуют в максимуме.',
               'todo': 'Отдельная миниработа в редакторе платформы: список tasks уже содержит '
                       'словари задач. Выведите ровно три строки: (1) количество открытых задач '
                       '(is_done == False); (2) наибольшее числовое значение priority среди '
                       'открытых или None, если таких задач нет; (3) исходный tasks в неизменённом '
                       'виде. Если tasks пуст или все задачи выполнены, первые две строки должны '
                       'быть 0 и None. Высокий priority выполненной задачи игнорируйте. '
                       'Используйте изученный цикл for и функцию print; порядок действий, '
                       'промежуточные переменные и свои функции выберите самостоятельно. Не '
                       'меняйте записи, их порядок или основной main.py Planner.',
               'check': 'Платформа запускает решение на разных списках: пустом, целиком '
                        'выполненном, с одной открытой записью, со смешанными статусами и '
                        'повторяющимися приоритетами. Сравниваются все три строки вывода и '
                        'неизменность tasks. Проверяйте числовой максимум только среди открытых '
                        'записей; готовые данные тестов заранее неизвестны.'},
  'requirements': {'nodes': ['For'], 'calls': ['print']},
  'starter_code': '# Исходные данные заданы платформой. Напишите программу самостоятельно.\n',
  'hints': ['Сначала запишите, какие записи относятся к отчёту, какие два результата нужны и что '
            'означает отсутствие подходящих записей.',
            'Проверьте вручную список, где наибольший priority принадлежит выполненной задаче. '
            'Совпадение результата на одном наборе не гарантирует правильный отбор.',
            'Можно пройти исходные задачи и обновлять состояния только для незавершённых, либо '
            'сначала получить отдельную выборку. Счётчик пустого набора равен нулю; кандидата на '
            'максимум ещё нет.'],
  'tests': [{'name': 'Пустой список',
             'namespace': {'tasks': []},
             'expected': '0\nNone\n[]',
             'assert': 'stdout'},
            {'name': 'Все выполнены',
             'namespace': {'tasks': [{'id': 3, 'title': 'Задача 3', 'priority': 5, 'is_done': True},
                                     {'id': 8,
                                      'title': 'Задача 8',
                                      'priority': 2,
                                      'is_done': True}]},
             'expected': '0\n'
                         'None\n'
                         "[{'id': 3, 'title': 'Задача 3', 'priority': 5, 'is_done': True}, {'id': "
                         "8, 'title': 'Задача 8', 'priority': 2, 'is_done': True}]",
             'assert': 'stdout'},
            {'name': 'Одна открытая',
             'namespace': {'tasks': [{'id': 11,
                                      'title': 'Задача 11',
                                      'priority': 1,
                                      'is_done': False}]},
             'expected': '1\n'
                         '1\n'
                         "[{'id': 11, 'title': 'Задача 11', 'priority': 1, 'is_done': False}]",
             'assert': 'stdout'},
            {'name': 'Максимум выполненной не участвует',
             'namespace': {'tasks': [{'id': 4, 'title': 'Задача 4', 'priority': 5, 'is_done': True},
                                     {'id': 9,
                                      'title': 'Задача 9',
                                      'priority': 2,
                                      'is_done': False},
                                     {'id': 12,
                                      'title': 'Задача 12',
                                      'priority': 3,
                                      'is_done': False}]},
             'expected': '2\n'
                         '3\n'
                         "[{'id': 4, 'title': 'Задача 4', 'priority': 5, 'is_done': True}, {'id': "
                         "9, 'title': 'Задача 9', 'priority': 2, 'is_done': False}, {'id': 12, "
                         "'title': 'Задача 12', 'priority': 3, 'is_done': False}]",
             'assert': 'stdout'},
            {'name': 'Максимум не последний',
             'namespace': {'tasks': [{'id': 5,
                                      'title': 'Задача 5',
                                      'priority': 4,
                                      'is_done': False},
                                     {'id': 2,
                                      'title': 'Задача 2',
                                      'priority': 1,
                                      'is_done': False},
                                     {'id': 7,
                                      'title': 'Задача 7',
                                      'priority': 2,
                                      'is_done': False}]},
             'expected': '3\n'
                         '4\n'
                         "[{'id': 5, 'title': 'Задача 5', 'priority': 4, 'is_done': False}, {'id': "
                         "2, 'title': 'Задача 2', 'priority': 1, 'is_done': False}, {'id': 7, "
                         "'title': 'Задача 7', 'priority': 2, 'is_done': False}]",
             'assert': 'stdout'},
            {'name': 'Повторные значения',
             'namespace': {'tasks': [{'id': 8,
                                      'title': 'Задача 8',
                                      'priority': 3,
                                      'is_done': False},
                                     {'id': 13,
                                      'title': 'Задача 13',
                                      'priority': 3,
                                      'is_done': False},
                                     {'id': 20,
                                      'title': 'Задача 20',
                                      'priority': 1,
                                      'is_done': True}]},
             'expected': '2\n'
                         '3\n'
                         "[{'id': 8, 'title': 'Задача 8', 'priority': 3, 'is_done': False}, {'id': "
                         "13, 'title': 'Задача 13', 'priority': 3, 'is_done': False}, {'id': 20, "
                         "'title': 'Задача 20', 'priority': 1, 'is_done': True}]",
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
  'prompt': 'Список tasks с полями id, title, priority, is_done уже передан платформой. Напишите '
            'две функции над готовыми проверочными вызовами. build_statistics(tasks) за один '
            'проход считает все карточки и карточки с is_done == True, возвращает словарь с '
            'точными ключами total, completed, left (left = total - completed). '
            'completion_percent(statistics) получает один такой словарь, для total == 0 возвращает '
            'число 0.0, иначе процент с округлением до 1 знака. Функции не печатают, не изменяют '
            'tasks и не хранят результаты между вызовами. Проверочные print из стартера оставьте '
            'на месте: они показывают три счётчика, два процента и исходный список. Сначала '
            'сравните с ожидаемыми данными, после успешной проверки перенесите только определения '
            'функций в прежний локальный main.py. Там замените заглушку stats: используйте полный '
            'tasks из run(), вычислите сводку, процент и распечатайте Всего, Выполнено, Осталось, '
            'Процент выполнения. Проверьте пустой список, две задачи после одного done, повтор '
            'done того же id, поиск одной задачи и stats всего списка, третью новую невыполненную '
            'задачу. Не создавайте новый run или новый tasks.',
  'contract': {'given': 'Платформа передаёт tasks: список словарей с id, title, priority, is_done. '
                        'is_done является True или False. Стартер содержит готовые вызовы ниже '
                        'места для функций.',
               'todo': 'Самостоятельно определите две функции перед уже готовыми вызовами. В '
                       'локальном проекте после проверки замените только ветвь stats.',
               'todo_items': ['Для каждой карточки в цикле увеличьте total, а completed только при '
                              'истинном is_done. Счётчики начинаются с нуля при новом вызове.',
                              'Верните словарь с ключами total, completed, left; не печатайте '
                              'внутри функций и не меняйте исходные словари.',
                              'В функции процента сначала проверьте total == 0, потом делите; '
                              'результатом будет число, а не строка со знаком %.',
                              'В Planner команда stats должна брать весь tasks даже после search; '
                              'повтор done не увеличивает число завершённых задач.'],
               'check': 'Платформа проверяет [] → 0/0/0 и 0.0; две задачи с одной True → 2/1/1 и '
                        '50.0; одну из трёх → 3/1/2 и 33.3; две из трёх → 3/2/1 и 66.7; все True → '
                        '100.0. Печатный tasks должен оставаться прежним. В локальном Planner '
                        'отдельная проверка: после search по одной задаче stats всё равно '
                        'учитывает полный список.'},
  'requirements': {'items': ['build_statistics(tasks) за один проход возвращает словарь с ровно '
                             'указанными счётчиками, не изменяя tasks.',
                             'completion_percent(statistics) получает один словарь; пустота '
                             'возвращает 0.0 до деления; округление до одного знака.',
                             'Повторное применение функций не использует прежние счётчики; обе '
                             'ничего не печатают.',
                             'После переноса в прежний main.py stats читает полный список, а '
                             'поиск/повтор done не искажают числа.'],
                   'nodes': ['FunctionDef', 'Return'],
                   'calls': ['build_statistics', 'completion_percent', 'print']},
  'hints': ['Начните оба счётчика с нуля до for. Внутри цикла total растёт всегда, а completed '
            'только если поле is_done у этой карточки True.',
            'После прохода вычислите left вычитанием и верните три числа по ключам. Удобно '
            'проверить: total = completed + left.',
            'Для процента возьмите total из словаря: сначала разберите пустоту, а для остальных '
            'значений разделите completed на total, умножьте на 100 и округлите в конце.'],
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
             'namespace': {'tasks': [{'id': 1,
                                      'title': 'Задача 1',
                                      'priority': 1,
                                      'is_done': False},
                                     {'id': 2,
                                      'title': 'Задача 2',
                                      'priority': 2,
                                      'is_done': False}]},
             'assert': 'stdout',
             'expected': '2\n'
                         '0\n'
                         '2\n'
                         '0.0\n'
                         '33.3\n'
                         "[{'id': 1, 'title': 'Задача 1', 'priority': 1, 'is_done': False}, {'id': "
                         "2, 'title': 'Задача 2', 'priority': 2, 'is_done': False}]"},
            {'name': 'Смешанный',
             'namespace': {'tasks': [{'id': 1, 'title': 'Задача 1', 'priority': 1, 'is_done': True},
                                     {'id': 2,
                                      'title': 'Задача 2',
                                      'priority': 2,
                                      'is_done': False}]},
             'assert': 'stdout',
             'expected': '2\n'
                         '1\n'
                         '1\n'
                         '50.0\n'
                         '33.3\n'
                         "[{'id': 1, 'title': 'Задача 1', 'priority': 1, 'is_done': True}, {'id': "
                         "2, 'title': 'Задача 2', 'priority': 2, 'is_done': False}]"},
            {'name': 'Округление трети',
             'namespace': {'tasks': [{'id': 1,
                                      'title': 'Задача 1',
                                      'priority': 1,
                                      'is_done': False},
                                     {'id': 2, 'title': 'Задача 2', 'priority': 2, 'is_done': True},
                                     {'id': 3,
                                      'title': 'Задача 3',
                                      'priority': 3,
                                      'is_done': False}]},
             'assert': 'stdout',
             'expected': '3\n'
                         '1\n'
                         '2\n'
                         '33.3\n'
                         '33.3\n'
                         "[{'id': 1, 'title': 'Задача 1', 'priority': 1, 'is_done': False}, {'id': "
                         "2, 'title': 'Задача 2', 'priority': 2, 'is_done': True}, {'id': 3, "
                         "'title': 'Задача 3', 'priority': 3, 'is_done': False}]"},
            {'name': 'Все выполнены',
             'namespace': {'tasks': [{'id': 1, 'title': 'Задача 1', 'priority': 1, 'is_done': True},
                                     {'id': 2,
                                      'title': 'Задача 2',
                                      'priority': 2,
                                      'is_done': True}]},
             'assert': 'stdout',
             'expected': '2\n'
                         '2\n'
                         '0\n'
                         '100.0\n'
                         '33.3\n'
                         "[{'id': 1, 'title': 'Задача 1', 'priority': 1, 'is_done': True}, {'id': "
                         "2, 'title': 'Задача 2', 'priority': 2, 'is_done': True}]"},
            {'name': 'Одна открытая',
             'namespace': {'tasks': [{'id': 1,
                                      'title': 'Задача 1',
                                      'priority': 1,
                                      'is_done': False}]},
             'assert': 'stdout',
             'expected': '1\n'
                         '0\n'
                         '1\n'
                         '0.0\n'
                         '33.3\n'
                         "[{'id': 1, 'title': 'Задача 1', 'priority': 1, 'is_done': False}]"},
            {'name': 'Две выполнены из трёх',
             'namespace': {'tasks': [{'id': 10,
                                      'title': 'Задача 10',
                                      'priority': 1,
                                      'is_done': True},
                                     {'id': 3, 'title': 'Задача 3', 'priority': 2, 'is_done': True},
                                     {'id': 24,
                                      'title': 'Задача 24',
                                      'priority': 3,
                                      'is_done': False}]},
             'assert': 'stdout',
             'expected': '3\n'
                         '2\n'
                         '1\n'
                         '66.7\n'
                         '33.3\n'
                         "[{'id': 10, 'title': 'Задача 10', 'priority': 1, 'is_done': True}, "
                         "{'id': 3, 'title': 'Задача 3', 'priority': 2, 'is_done': True}, {'id': "
                         "24, 'title': 'Задача 24', 'priority': 3, 'is_done': False}]"},
            {'name': 'Четыре задачи с двумя True',
             'namespace': {'tasks': [{'id': 8, 'title': 'Задача 8', 'priority': 1, 'is_done': True},
                                     {'id': 19,
                                      'title': 'Задача 19',
                                      'priority': 2,
                                      'is_done': False},
                                     {'id': 2, 'title': 'Задача 2', 'priority': 3, 'is_done': True},
                                     {'id': 27,
                                      'title': 'Задача 27',
                                      'priority': 4,
                                      'is_done': False}]},
             'assert': 'stdout',
             'expected': '4\n'
                         '2\n'
                         '2\n'
                         '50.0\n'
                         '33.3\n'
                         "[{'id': 8, 'title': 'Задача 8', 'priority': 1, 'is_done': True}, {'id': "
                         "19, 'title': 'Задача 19', 'priority': 2, 'is_done': False}, {'id': 2, "
                         "'title': 'Задача 2', 'priority': 3, 'is_done': True}, {'id': 27, "
                         "'title': 'Задача 27', 'priority': 4, 'is_done': False}]"},
            {'name': 'Единственная выполнена',
             'namespace': {'tasks': [{'id': 42,
                                      'title': 'Задача 42',
                                      'priority': 1,
                                      'is_done': True}]},
             'assert': 'stdout',
             'expected': '1\n'
                         '1\n'
                         '0\n'
                         '100.0\n'
                         '33.3\n'
                         "[{'id': 42, 'title': 'Задача 42', 'priority': 1, 'is_done': True}]"}],
  'reference_code': 'def build_statistics(tasks):\n'
                    '    total = 0\n'
                    '    completed = 0\n'
                    '    for task in tasks:\n'
                    '        total += 1\n'
                    '        if task["is_done"]:\n'
                    '            completed += 1\n'
                    '    left = total - completed\n'
                    '    return {"total": total, "completed": completed, "left": left}\n'
                    '\n'
                    '\n'
                    'def completion_percent(statistics):\n'
                    '    total = statistics["total"]\n'
                    '    if total == 0:\n'
                    '        return 0.0\n'
                    '    return round(statistics["completed"] / total * 100, 1)\n'
                    '\n'
                    'statistics = build_statistics(tasks)\n'
                    'print(statistics["total"])\n'
                    'print(statistics["completed"])\n'
                    'print(statistics["left"])\n'
                    'print(completion_percent(statistics))\n'
                    'print(completion_percent({"total": 3, "completed": 1, "left": 2}))\n'
                    'print(tasks)\n'}]

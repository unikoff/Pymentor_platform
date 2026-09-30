from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    6: [{'title': 'Короткий код и карточка задачи',
      'level': 'easy',
      'mode': 'script',
      'prompt': 'Получите clean_title = raw_title.strip(). Возьмите первые три символа, переведите их в верхний '
                'регистр и сохраните в short_code. Через f-строку выведите [КОД] Заголовок | приоритет: число.',
      'contract': {'given': 'Платформа создаёт raw_title с пробелами по краям и минимум тремя буквами после очистки, '
                            'а также целое число priority.',
                   'todo': 'Получите clean_title = raw_title.strip(). Возьмите первые три символа, переведите их в '
                           'верхний регистр и сохраните в short_code. Через f-строку выведите [КОД] Заголовок | '
                           'приоритет: число.',
                   'check': 'Проверяются разные заголовки. Нужны strip(), срез [:3], upper() и f-строка. '
                            'Сравнивается весь текст.'},
      'requirements': {'items': ['strip()', 'срез первых трёх символов', 'upper()', 'f-строка'],
                       'names': ['raw_title', 'priority', 'clean_title', 'short_code'],
                       'attributes': ['strip', 'upper'],
                       'nodes': ['JoinedStr'],
                       'calls': ['print']},
      'starter_code': '# raw_title и priority уже созданы\n# Получите clean_title, short_code и выведите карточку\n',
      'tests': [{'name': 'Python',
                 'namespace': {'raw_title': '  Python практика  ', 'priority': 2},
                 'expected': '[PYT] Python практика | приоритет: 2',
                 'assert': 'stdout'},
                {'name': 'README',
                 'namespace': {'raw_title': '  README проекта ', 'priority': 4},
                 'expected': '[REA] README проекта | приоритет: 4',
                 'assert': 'stdout'}],
      'reference_code': 'clean_title = raw_title.strip()\n'
                        'short_code = clean_title[:3].upper()\n'
                        "print(f'[{short_code}] {clean_title} | приоритет: {priority}')\n"}],
    7: [{'title': 'Попадает ли задача в срочные',
      'level': 'easy',
      'mode': 'script',
      'prompt': 'Создайте is_urgent. Значение должно быть True только когда priority не меньше 4, задача не '
                'выполнена и days_left больше 0. Используйте and и not. Выведите только is_urgent.',
      'contract': {'given': 'Платформа создаёт priority от 1 до 5, is_done как bool и days_left как целое число.',
                   'todo': 'Создайте is_urgent. Значение должно быть True только когда priority не меньше 4, задача '
                           'не выполнена и days_left больше 0. Используйте and и not. Выведите только is_urgent.',
                   'check': 'Проверяются срочная, выполненная, просроченная и низкоприоритетная задачи. Ожидается '
                            'одна строка True или False.'},
      'requirements': {'items': ['priority >= 4', 'not is_done', 'days_left > 0', 'единое выражение с and'],
                       'names': ['priority', 'is_done', 'days_left', 'is_urgent'],
                       'nodes': ['BoolOp'],
                       'calls': ['print']},
      'starter_code': '# priority, is_done и days_left уже созданы\n# Создайте и выведите is_urgent\n',
      'tests': [{'name': 'срочная',
                 'namespace': {'priority': 4, 'is_done': False, 'days_left': 2},
                 'expected': 'True',
                 'assert': 'stdout'},
                {'name': 'выполненная',
                 'namespace': {'priority': 5, 'is_done': True, 'days_left': 1},
                 'expected': 'False',
                 'assert': 'stdout'},
                {'name': 'просроченная',
                 'namespace': {'priority': 5, 'is_done': False, 'days_left': 0},
                 'expected': 'False',
                 'assert': 'stdout'},
                {'name': 'низкий приоритет',
                 'namespace': {'priority': 3, 'is_done': False, 'days_left': 2},
                 'expected': 'False',
                 'assert': 'stdout'}],
      'reference_code': 'is_urgent = priority >= 4 and not is_done and days_left > 0\nprint(is_urgent)\n'}],
    8: [{'title': 'Понятный статус задачи',
      'level': 'easy',
      'mode': 'script',
      'prompt': 'Напишите одну цепочку if / elif / else. Если is_done истинно, выведите Выполнена. Иначе, если '
                'priority не меньше 4, выведите Срочно. Иначе, если priority не меньше 2, выведите В работе. Во всех '
                'остальных случаях выведите Низкий приоритет.',
      'contract': {'given': 'Платформа создаёт priority от 1 до 5 и is_done со значением True или False.',
                   'todo': 'Напишите одну цепочку if / elif / else. Если is_done истинно, выведите Выполнена. Иначе, '
                           'если priority не меньше 4, выведите Срочно. Иначе, если priority не меньше 2, выведите В '
                           'работе. Во всех остальных случаях выведите Низкий приоритет.',
                   'check': 'Проверяются все четыре ветки. Для каждого набора данных должна появиться ровно одна '
                            'строка.'},
      'requirements': {'items': ['одна цепочка if / elif / else', 'четыре точных сообщения'],
                       'names': ['priority', 'is_done'],
                       'nodes': ['If'],
                       'calls': ['print']},
      'starter_code': '# priority и is_done уже созданы\n# Напишите одну цепочку if / elif / elif / else\n',
      'tests': [{'name': 'выполненная',
                 'namespace': {'priority': 5, 'is_done': True},
                 'expected': 'Выполнена',
                 'assert': 'stdout'},
                {'name': 'срочная',
                 'namespace': {'priority': 4, 'is_done': False},
                 'expected': 'Срочно',
                 'assert': 'stdout'},
                {'name': 'обычная',
                 'namespace': {'priority': 2, 'is_done': False},
                 'expected': 'В работе',
                 'assert': 'stdout'},
                {'name': 'низкий приоритет',
                 'namespace': {'priority': 1, 'is_done': False},
                 'expected': 'Низкий приоритет',
                 'assert': 'stdout'}],
      'reference_code': 'if is_done:\n'
                        "    print('Выполнена')\n"
                        'elif priority >= 4:\n'
                        "    print('Срочно')\n"
                        'elif priority >= 2:\n'
                        "    print('В работе')\n"
                        'else:\n'
                        "    print('Низкий приоритет')\n"}],
    9: [{'title': 'Нумерованный список задач',
      'level': 'easy',
      'mode': 'script',
      'prompt': 'Не создавайте tasks заново. Циклом for и range(len(tasks)) пройдите по индексам. Для каждой задачи '
                "выведите <номер>. <заголовок>, начиная с номера 1. Например, ['Код', 'README'] даёт 1. Код и 2. "
                'README.',
      'contract': {'given': 'Платформа создаёт список строк tasks. Его длина меняется в проверках.',
                   'todo': 'Не создавайте tasks заново. Циклом for и range(len(tasks)) пройдите по индексам. Для '
                           "каждой задачи выведите <номер>. <заголовок>, начиная с номера 1. Например, ['Код', "
                           "'README'] даёт 1. Код и 2. README.",
                   'check': 'Количество строк должно совпадать с len(tasks), порядок сохраняется, нумерация '
                            'начинается с 1.'},
      'requirements': {'items': ['цикл for', 'range(len(tasks))', 'нумерация index + 1', 'f-строка'],
                       'names': ['tasks'],
                       'nodes': ['For', 'JoinedStr'],
                       'calls': ['range', 'len', 'print']},
      'starter_code': '# tasks уже создан\n# Используйте for и range(len(tasks))\n',
      'tests': [{'name': 'две задачи',
                 'namespace': {'tasks': ['Код', 'README']},
                 'expected': '1. Код\n2. README',
                 'assert': 'stdout'},
                {'name': 'три задачи',
                 'namespace': {'tasks': ['Python', 'Git', 'Тесты']},
                 'expected': '1. Python\n2. Git\n3. Тесты',
                 'assert': 'stdout'}],
      'reference_code': "for index in range(len(tasks)):\n    print(f'{index + 1}. {tasks[index]}')\n"}],
    10: [{'title': 'Повторная проверка команды',
       'level': 'easy',
       'mode': 'script',
       'prompt': 'Пока command не равна expected_command, выведите Неизвестная команда: <command>, затем присвойте '
                 'command значение expected_command. После while выведите Принято: <command>. Обе строки соберите '
                 'через f-строки.',
       'contract': {'given': 'Runner не использует input(), поэтому повторный ввод моделируется переменными. '
                             'Платформа создаёт неверную command и правильную expected_command.',
                    'todo': 'Пока command не равна expected_command, выведите Неизвестная команда: <command>, затем '
                            'присвойте command значение expected_command. После while выведите Принято: <command>. '
                            'Обе строки соберите через f-строки.',
                    'check': 'Проверяются разные команды. Ожидаются ровно две строки. Цикл должен завершиться, '
                             'потому что command изменяется внутри while.'},
       'requirements': {'items': ['цикл while', 'изменение command внутри цикла', 'две f-строки'],
                        'names': ['command', 'expected_command'],
                        'nodes': ['While', 'JoinedStr'],
                        'calls': ['print']},
       'starter_code': '# command и expected_command уже созданы\n# Напишите завершаемый while и итоговый вывод\n',
       'tests': [{'name': 'list',
                  'namespace': {'command': 'show', 'expected_command': 'list'},
                  'expected': 'Неизвестная команда: show\nПринято: list',
                  'assert': 'stdout'},
                 {'name': 'exit',
                  'namespace': {'command': 'stop', 'expected_command': 'exit'},
                  'expected': 'Неизвестная команда: stop\nПринято: exit',
                  'assert': 'stdout'}],
       'reference_code': 'while command != expected_command:\n'
                         "    print(f'Неизвестная команда: {command}')\n"
                         '    command = expected_command\n'
                         "print(f'Принято: {command}')\n"}]
}

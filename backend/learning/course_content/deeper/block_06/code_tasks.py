from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    27: [{'title': 'Декоратор сохраняет вызов и результат',
       'level': 'medium',
       'mode': 'script',
       'prompt': 'Объявите декоратор log_call(operation). Внутри создайте wrapper(*args, **kwargs), который печатает '
                 'START <имя функции>, вызывает operation(*args, **kwargs), печатает DONE <результат> и возвращает '
                 'результат. Примените @log_call к create_task(title, priority=2), возвращающей строку '
                 '<title>:<priority>. Вызовите create_task(title, priority=priority), сохраните result и выведите '
                 'RESULT <result>.',
       'contract': {'given': 'Интерпретатор создаёт title и priority. Они меняются в проверках.',
                    'todo': 'Объявите декоратор log_call(operation). Внутри создайте wrapper(*args, **kwargs), '
                            'который печатает START <имя функции>, вызывает operation(*args, **kwargs), печатает '
                            'DONE <результат> и возвращает результат. Примените @log_call к create_task(title, '
                            'priority=2), возвращающей строку <title>:<priority>. Вызовите create_task(title, '
                            'priority=priority), сохраните result и выведите RESULT <result>.',
                    'check': 'Проверяются два набора title и priority. Сравниваются три строки целиком. Обязательны '
                             'декоратор, wrapper с *args и **kwargs, передача аргументов дальше и return '
                             'результата.'},
       'requirements': {'items': ['функция-декоратор',
                                  'wrapper(*args, **kwargs)',
                                  'operation(*args, **kwargs)',
                                  'return result',
                                  '@log_call'],
                        'nodes': ['FunctionDef'],
                        'calls': ['print'],
                        'names': ['args', 'kwargs', 'operation']},
       'starter_code': '# title и priority уже созданы\n'
                       '# Напишите log_call, декорируйте create_task и выведите RESULT\n',
       'tests': [{'name': 'Python',
                  'namespace': {'title': 'Python', 'priority': 3},
                  'expected': 'START create_task\nDONE Python:3\nRESULT Python:3',
                  'assert': 'stdout'},
                 {'name': 'README',
                  'namespace': {'title': 'README', 'priority': 5},
                  'expected': 'START create_task\nDONE README:5\nRESULT README:5',
                  'assert': 'stdout'}],
       'reference_code': 'def log_call(operation):\n'
                         '    def wrapper(*args, **kwargs):\n'
                         "        print(f'START {operation.__name__}')\n"
                         '        result = operation(*args, **kwargs)\n'
                         "        print(f'DONE {result}')\n"
                         '        return result\n'
                         '    return wrapper\n'
                         '\n'
                         '@log_call\n'
                         'def create_task(title, priority=2):\n'
                         "    return f'{title}:{priority}'\n"
                         '\n'
                         'result = create_task(title, priority=priority)\n'
                         "print(f'RESULT {result}')\n"}],
    29: [{'title': 'Конкретный except для приоритета',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'В try выполните int(raw_priority). Перехватите только ValueError и верните None. После успешного '
                 'преобразования верните число, если оно находится от 1 до 5 включительно; иначе верните None. Не '
                 'используйте общий except Exception.',
       'contract': {'given': 'Автопроверка вызывает solve(raw_priority). raw_priority — строка, которую нужно '
                             'преобразовать в целое число.',
                    'todo': 'В try выполните int(raw_priority). Перехватите только ValueError и верните None. После '
                            'успешного преобразования верните число, если оно находится от 1 до 5 включительно; '
                            'иначе верните None. Не используйте общий except Exception.',
                    'check': 'Проверяются числа 1 и 5, значения вне диапазона, пустая строка и произвольный текст. '
                             'Сравнивается return.'},
       'requirements': {'items': ['try вокруг int()', 'except ValueError', 'проверка диапазона 1-5'],
                        'nodes': ['FunctionDef', 'Try', 'If'],
                        'calls': ['int']},
       'starter_code': 'def solve(raw_priority):\n'
                       '    # Преобразуйте строку в try\n'
                       '    # Перехватите ValueError\n'
                       '    # Проверьте диапазон 1-5\n'
                       '    pass\n',
       'tests': [{'name': 'нижняя граница', 'args': ['1'], 'expected': 1},
                 {'name': 'верхняя граница', 'args': ['5'], 'expected': 5},
                 {'name': 'вне диапазона', 'args': ['8'], 'expected': None},
                 {'name': 'текст', 'args': ['high'], 'expected': None},
                 {'name': 'пустая строка', 'args': [''], 'expected': None}],
       'reference_code': 'def solve(raw_priority):\n'
                         '    try:\n'
                         '        priority = int(raw_priority)\n'
                         '    except ValueError:\n'
                         '        return None\n'
                         '    if 1 <= priority <= 5:\n'
                         '        return priority\n'
                         '    return None\n'}],
    30: [{'title': 'Собственная ошибка и обязательное завершение',
       'level': 'medium',
       'mode': 'script',
       'prompt': 'Объявите UnknownCommandError как подкласс ValueError. Объявите execute(command): для add верните '
                 'Задача добавлена, для list верните Список задач, иначе выполните raise '
                 'UnknownCommandError(command). В try вызовите execute. В except UnknownCommandError выведите ERROR '
                 '<command>. В else выведите OK <result>. В finally всегда выведите CLEANUP.',
       'contract': {'given': 'Интерпретатор создаёт command. Допустимы add, list и неизвестные строки.',
                    'todo': 'Объявите UnknownCommandError как подкласс ValueError. Объявите execute(command): для '
                            'add верните Задача добавлена, для list верните Список задач, иначе выполните raise '
                            'UnknownCommandError(command). В try вызовите execute. В except UnknownCommandError '
                            'выведите ERROR <command>. В else выведите OK <result>. В finally всегда выведите '
                            'CLEANUP.',
                    'check': 'Проверяются успешные add и list, а также неизвестная команда. Каждый запуск должен '
                             'дать ровно две строки. CLEANUP обязана появиться во всех сценариях.'},
       'requirements': {'items': ['собственный класс ошибки',
                                  'raise UnknownCommandError',
                                  'except конкретного типа',
                                  'else для успеха',
                                  'finally для общего действия'],
                        'nodes': ['ClassDef', 'FunctionDef', 'If', 'Try', 'Raise'],
                        'calls': ['print']},
       'starter_code': '# command уже создана\n'
                       '# Объявите UnknownCommandError и execute\n'
                       '# Обработайте вызов через try / except / else / finally\n',
       'tests': [{'name': 'add',
                  'namespace': {'command': 'add'},
                  'expected': 'OK Задача добавлена\nCLEANUP',
                  'assert': 'stdout'},
                 {'name': 'list',
                  'namespace': {'command': 'list'},
                  'expected': 'OK Список задач\nCLEANUP',
                  'assert': 'stdout'},
                 {'name': 'unknown',
                  'namespace': {'command': 'remove'},
                  'expected': 'ERROR remove\nCLEANUP',
                  'assert': 'stdout'}],
       'reference_code': 'class UnknownCommandError(ValueError):\n'
                         '    pass\n'
                         '\n'
                         'def execute(command):\n'
                         "    if command == 'add':\n"
                         "        return 'Задача добавлена'\n"
                         "    if command == 'list':\n"
                         "        return 'Список задач'\n"
                         '    raise UnknownCommandError(command)\n'
                         '\n'
                         'try:\n'
                         '    result = execute(command)\n'
                         'except UnknownCommandError:\n'
                         "    print(f'ERROR {command}')\n"
                         'else:\n'
                         "    print(f'OK {result}')\n"
                         'finally:\n'
                         "    print('CLEANUP')\n"}]
}

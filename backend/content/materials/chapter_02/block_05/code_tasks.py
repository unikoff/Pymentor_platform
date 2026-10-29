from typing import Any

CODE_TASKS: dict[int | str, list[dict[str, Any]]] = {
    "24.1": [
        {
            "title": "Два callback с отдельными настройками",
            "level": "easy",
            "mode": "solve",
            "prompt": (
                "Внутри solve(first_message, second_message) самостоятельно создайте "
                "make_labeler(prefix) с вложенной label(message), которая возвращает "
                "строку '{prefix}: {message}'. Фабрика возвращает функцию для "
                "позднего вызова. Получите notice для 'Важно' и question для 'Вопрос'. "
                "Верните список в порядке notice(first_message), "
                "question(second_message), notice(second_message). "
                "Два одинаковых сообщения не делают префиксы одинаковыми."
            ),
            "contract": {
                "given": (
                    "Платформа вызывает solve(first_message, second_message), "
                    "где оба значения строки; возможны совпадающие и пустые строки."
                ),
                "todo": (
                    "Создайте внутреннюю make_labeler(prefix) и вложенную label(message), "
                    "верните саму функцию, затем два callback и список трёх результатов."
                ),
                "check": (
                    "Проверяются разные и совпадающие сообщения, пустая строка "
                    "в любой позиции, сохранение настройки при повторном notice, "
                    "тип и порядок возвращённых значений."
                ),
            },
            "requirements": {
                "items": [
                    "make_labeler принимает prefix и объявлена внутри solve",
                    "вложенная label(message) использует prefix",
                    "возврат функции label без скобок",
                    "две независимые настройки 'Важно' и 'Вопрос'",
                    "list из трёх возвращённых строк в заданном порядке",
                ],
                "nodes": ["FunctionDef"],
                "calls": ["make_labeler"],
                "names": ["first_message", "second_message"],
            },
            "starter_code": (
                "def solve(first_message, second_message):\n"
                "    def make_labeler(prefix):\n"
                "        # Объявите вложенную label(message)\n"
                "        # Верните функцию для позднего вызова\n"
                "        pass\n"
                "\n"
                "    # Создайте два callback с разными настройками\n"
                "    # Верните список из трёх строк в указанном порядке\n"
                "    pass\n"
            ),
            "hints": [
                "prefix задаётся при вызове фабрики, а message приходит при позднем вызове возвращённой функции.",
                "Верните имя вложенной функции без скобок, чтобы сохранить возможность вызывать её с другими сообщениями.",
                "После question вызовите прежнюю notice ещё раз со вторым сообщением: настройка не должна смешаться.",
            ],
            "tests": [
                {
                    "name": "разные сообщения",
                    "args": ["Сохранить файл", "Где лежит файл?"],
                    "expected": ["Важно: Сохранить файл", "Вопрос: Где лежит файл?", "Важно: Где лежит файл?"],
                },
                {
                    "name": "другие сообщения",
                    "args": ["Запустить тесты", "Проверить результат"],
                    "expected": ["Важно: Запустить тесты", "Вопрос: Проверить результат", "Важно: Проверить результат"],
                },
                {
                    "name": "совпадающие сообщения",
                    "args": ["одинаково", "одинаково"],
                    "expected": ["Важно: одинаково", "Вопрос: одинаково", "Важно: одинаково"],
                },
                {
                    "name": "пустые сообщения",
                    "args": ["", ""],
                    "expected": ["Важно: ", "Вопрос: ", "Важно: "],
                },
                {
                    "name": "первое пустое",
                    "args": ["", "готово"],
                    "expected": ["Важно: ", "Вопрос: готово", "Важно: готово"],
                },
                {
                    "name": "второе пустое",
                    "args": ["файл", ""],
                    "expected": ["Важно: файл", "Вопрос: ", "Важно: "],
                },
            ],
            "reference_code": (
                "def solve(first_message, second_message):\n"
                "    def make_labeler(prefix):\n"
                "        def label(message):\n"
                "            return f'{prefix}: {message}'\n"
                "        return label\n"
                "\n"
                "    notice = make_labeler('Важно')\n"
                "    question = make_labeler('Вопрос')\n"
                "    return [notice(first_message), question(second_message), notice(second_message)]\n"
            ),
        },
    ],
    "25.1": [{'title': 'Сравниваем ручное применение и @',
           'level': 'easy',
           'mode': 'script',
           'prompt': 'Реализуйте observe(operation): при применении появляется НАСТРОЙКА, а при последующем '
                     'вызове: ОБЁРТКА, один вызов исходной функции, её результат и возврат того же значения. '
                     'Сначала примените observe вручную к manual_operation, затем через @ к '
                     'decorated_operation. Выведите READY до вызовов, затем оба результата. Сохраните '
                     'заданные подписи исходных операций.',
           'contract': {'given': 'Интерпретатор задаёт manual_value и decorated_value. Проверки подставляют '
                                 'другие строки.',
                        'todo': 'Полный вывод показывает обе настройки до READY, затем отдельный вызов и '
                                'результат каждой функции.',
                        'check': 'Проверяются два набора значений, порядок сообщений, один запуск каждой '
                                 'исходной операции и сохранение её результата.'},
           'requirements': {'items': ['observe принимает функцию и возвращает вызываемую версию для позднего '
                                      'запуска',
                                      'manual_operation декорируется присваиванием, decorated_operation: '
                                      'записью @',
                                      'исходные операции запускаются после READY и по одному разу',
                                      'результаты обеих операций сохранены'],
                            'nodes': ['FunctionDef'],
                            'calls': ['print', 'operation'],
                            'names': ['manual_value', 'decorated_value']},
           'hints': ['Отделите сообщение при применении observe от сообщений внутри возвращённой функции.',
                     'После ручной формы manual_operation должно ссылаться на результат observe; @ связывает '
                     'так же при определении.',
                     'Сверьте READY с выводом исходных операций: их тела должны начаться только после '
                     'READY.'],
           'starter_code': '# manual_value и decorated_value подготовлены платформой\n'
                           'def observe(operation):\n'
                           "    print('НАСТРОЙКА')\n"
                           '    def wrapped():\n'
                           '        # Сообщите о вызове, запустите operation, сохраните и верните результат\n'
                           '        pass\n'
                           '    # Верните вызываемое значение для более позднего вызова\n'
                           '    pass\n'
                           '\n'
                           'def manual_operation():\n'
                           "    print('ИСХОДНАЯ manual')\n"
                           '    return manual_value\n'
                           '\n'
                           '# Примените observe к manual_operation вручную\n'
                           '\n'
                           '@observe\n'
                           'def decorated_operation():\n'
                           "    print('ИСХОДНАЯ decorated')\n"
                           '    return decorated_value\n'
                           '\n'
                           "print('READY')\n"
                           '# Вызовите обе функции и выведите их результаты\n',
           'tests': [{'name': 'первый набор',
                      'namespace': {'manual_value': 'карточка A', 'decorated_value': 'карточка B'},
                      'expected': 'НАСТРОЙКА\n'
                                  'НАСТРОЙКА\n'
                                  'READY\n'
                                  'ОБЁРТКА\n'
                                  'ИСХОДНАЯ manual\n'
                                  'карточка A\n'
                                  'ОБЁРТКА\n'
                                  'ИСХОДНАЯ decorated\n'
                                  'карточка B\n'
                                  'карточка A\n'
                                  'карточка B',
                      'assert': 'stdout'},
                     {'name': 'изменившиеся значения',
                      'namespace': {'manual_value': 'задача', 'decorated_value': 'поиск'},
                      'expected': 'НАСТРОЙКА\n'
                                  'НАСТРОЙКА\n'
                                  'READY\n'
                                  'ОБЁРТКА\n'
                                  'ИСХОДНАЯ manual\n'
                                  'задача\n'
                                  'ОБЁРТКА\n'
                                  'ИСХОДНАЯ decorated\n'
                                  'поиск\n'
                                  'задача\n'
                                  'поиск',
                      'assert': 'stdout'}],
           'reference_code': 'def observe(operation):\n'
                             "    print('НАСТРОЙКА')\n"
                             '    def wrapped():\n'
                             "        print('ОБЁРТКА')\n"
                             '        result = operation()\n'
                             '        print(result)\n'
                             '        return result\n'
                             '    return wrapped\n'
                             '\n'
                             'def manual_operation():\n'
                             "    print('ИСХОДНАЯ manual')\n"
                             '    return manual_value\n'
                             '\n'
                             'manual_operation = observe(manual_operation)\n'
                             '\n'
                             '@observe\n'
                             'def decorated_operation():\n'
                             "    print('ИСХОДНАЯ decorated')\n"
                             '    return decorated_value\n'
                             '\n'
                             "print('READY')\n"
                             'manual_result = manual_operation()\n'
                             'decorated_result = decorated_operation()\n'
                             'print(manual_result)\n'
                             'print(decorated_result)\n'},
          {'title': 'Декоратор с нуля: @ и ручное применение после МЕЖДУ',
           'level': 'medium',
           'mode': 'script',
           'prompt': 'После первого задания откройте отдельный пустой файл: напишите САМИ оба def декоратора '
                     'observe(operation) и вложенной wrapped(). При применении печатайте НАСТРОЙКА, при '
                     'позднем вызове ОБЁРТКА, запустите исходную operation ровно один раз, покажите её '
                     'результат и верните этот же результат. Определите сначала decorated_operation с '
                     '@observe, затем обычную manual_operation. Ниже определений напечатайте МЕЖДУ и лишь '
                     'ПОСЛЕ маркера примените observe вручную к manual_operation. Напечатайте READY, '
                     'вызовите обе функции ровно по разу (сначала manual, затем decorated), сохраните '
                     'результаты и выведите их в указанном порядке. Исходные функции должны печатать '
                     'ИСХОДНАЯ decorated и ИСХОДНАЯ manual и возвращать подготовленные платформой значения. '
                     'После успешной проверки локально перенесите только ручное присваивание перед МЕЖДУ и '
                     'объясните изменение порядка: в платформу сдайте первую версию.',
           'contract': {'given': 'Интерпретатор задаёт manual_value и decorated_value. Стартовый файл '
                                 'намеренно без def и без готовой обёртки.',
                        'todo': 'С нуля два вложенных def, оба способа применения, маркер МЕЖДУ и сохранение '
                                'результатов.',
                        'check': 'В обоих наборах строк @ настраивается до МЕЖДУ, ручной вызов observe: '
                                 'после него; операции вызываются по разу после READY.'},
           'requirements': {'items': ['observe и wrapped целиком самостоятельно объявлены в пустом стартере',
                                      'декорируемая функция определяется раньше маркера МЕЖДУ и применяет '
                                      '@observe',
                                      'ручное присваивание строго после МЕЖДУ, до READY',
                                      'каждая исходная операция вызывается один раз после READY',
                                      'обёртка возвращает исходный результат, а результаты обеих операций '
                                      'сохраняются'],
                            'nodes': ['FunctionDef'],
                            'calls': ['print', 'operation'],
                            'names': ['manual_value', 'decorated_value']},
           'hints': ["Сначала напишите observe с print('НАСТРОЙКА'); внутри неё def wrapped, в конце observe "
                     'верните wrapped без скобок.',
                     'Над decorated_operation поставьте @observe. Выведите МЕЖДУ после обоих определений и '
                     'лишь затем присвойте manual_operation = observe(manual_operation).',
                     'В wrapped поместите ОБЁРТКА, затем один operation(), print результата и return '
                     'результата; вызовы операций: строго после READY.'],
           'starter_code': '# ДАНО: manual_value и decorated_value задаёт платформа.\n'
                           '# Новый пустой файл: напишите observe(operation) И def wrapped() с нуля.\n'
                           '# Далее создайте decorated_operation c @observe и manual_operation без @.\n'
                           '# Напечатайте МЕЖДУ; ниже примените observe вручную.\n'
                           '# Затем READY, два вызова, сохранение и печать результатов.\n',
           'tests': [{'name': 'OK и X',
                      'namespace': {'manual_value': 'OK', 'decorated_value': 'X'},
                      'expected': 'НАСТРОЙКА\n'
                                  'МЕЖДУ\n'
                                  'НАСТРОЙКА\n'
                                  'READY\n'
                                  'ОБЁРТКА\n'
                                  'ИСХОДНАЯ manual\n'
                                  'OK\n'
                                  'ОБЁРТКА\n'
                                  'ИСХОДНАЯ decorated\n'
                                  'X\n'
                                  'OK\n'
                                  'X',
                      'assert': 'stdout'},
                     {'name': 'новые строки',
                      'namespace': {'manual_value': 'карточка', 'decorated_value': 'поиск'},
                      'expected': 'НАСТРОЙКА\n'
                                  'МЕЖДУ\n'
                                  'НАСТРОЙКА\n'
                                  'READY\n'
                                  'ОБЁРТКА\n'
                                  'ИСХОДНАЯ manual\n'
                                  'карточка\n'
                                  'ОБЁРТКА\n'
                                  'ИСХОДНАЯ decorated\n'
                                  'поиск\n'
                                  'карточка\n'
                                  'поиск',
                      'assert': 'stdout'}],
           'reference_code': 'def observe(operation):\n'
                             "    print('НАСТРОЙКА')\n"
                             '    def wrapped():\n'
                             "        print('ОБЁРТКА')\n"
                             '        result = operation()\n'
                             '        print(result)\n'
                             '        return result\n'
                             '    return wrapped\n'
                             '\n'
                             '@observe\n'
                             'def decorated_operation():\n'
                             "    print('ИСХОДНАЯ decorated')\n"
                             '    return decorated_value\n'
                             '\n'
                             'def manual_operation():\n'
                             "    print('ИСХОДНАЯ manual')\n"
                             '    return manual_value\n'
                             '\n'
                             "print('МЕЖДУ')\n"
                             'manual_operation = observe(manual_operation)\n'
                             "print('READY')\n"
                             'manual_result = manual_operation()\n'
                             'decorated_result = decorated_operation()\n'
                             'print(manual_result)\n'
                             'print(decorated_result)\n'}],
}

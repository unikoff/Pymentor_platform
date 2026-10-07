from typing import Any

CODE_TASKS: dict[int | str, list[dict[str, Any]]] = {
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
    "26.1": [{'title': 'Два callback с отдельными настройками',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Внутри solve объявите make_labeler(prefix). В ней объявите label(message), которая возвращает строку «{prefix}: {message}». Верните саму label, не вызывая её. Создайте notice и question с разными префиксами, затем верните список из трёх результатов: notice(first_message), question(second_message), notice(second_message).',
       'contract': {'given': 'Автопроверка вызывает solve(first_message, second_message). Сообщения могут быть разными.',
                    'todo': 'Внутри solve объявите make_labeler(prefix). В ней объявите label(message), которая возвращает строку «{prefix}: {message}». Верните саму label, не вызывая её. Создайте notice с префиксом «Важно» и question с префиксом «Вопрос», затем верните список результатов notice(first_message), question(second_message), notice(second_message).',
                    'check': 'Проверяются разные сообщения в двух наборах данных и повторный вызов notice. Сравнивается возвращённый список строк. Внешний вызов должен вернуть функцию, а не уже готовую строку.'},
       'requirements': {'items': ['make_labeler принимает настройку prefix',
                                  'вложенная label принимает message',
                                  'return самой функции label',
                                  'две функции с разными префиксами',
                                  'возвращаемый список из трёх строк'],
                        'nodes': ['FunctionDef'],
                        'calls': ['make_labeler'],
                        'names': ['first_message', 'second_message']},
       'starter_code': 'def solve(first_message, second_message):\n'
                       '    def make_labeler(prefix):\n'
                       '        # Объявите вложенную label(message)\n'
                       '        # Верните функцию для позднего вызова\n'
                       '        pass\n'
                       '\n'
                       '    # Создайте две функции с разными настройками\n'
                       '    # Верните три результата в заданном порядке\n'
                       '    pass\n',
       'tests': [{'name': 'разные сообщения',
                  'args': ['Сохранить файл', 'Где лежит файл?'],
                  'expected': ['Важно: Сохранить файл', 'Вопрос: Где лежит файл?', 'Важно: Где лежит файл?']},
                 {'name': 'сообщения меняются',
                  'args': ['Запустить тесты', 'Проверить результат'],
                  'expected': ['Важно: Запустить тесты', 'Вопрос: Проверить результат', 'Важно: Проверить результат']}],
       'reference_code': 'def solve(first_message, second_message):\n'
                         '    def make_labeler(prefix):\n'
                         '        def label(message):\n'
                         '            return f"{prefix}: {message}"\n'
                         '        return label\n'
                         '\n'
                         "    notice = make_labeler('Важно')\n"
                         "    question = make_labeler('Вопрос')\n"
                         '    return [notice(first_message), question(second_message), notice(second_message)]\n'}],
    '27.1': [
    {
        "title": "Сравниваем ручное применение и @",
        "level": "easy",
        "mode": "script",
        "prompt": "Реализуйте observe(operation): при применении появляется НАСТРОЙКА, а при последующем вызове: ОБЁРТКА, один вызов исходной функции, её результат и возврат того же значения. Сначала примените observe вручную к manual_operation, затем через @ к decorated_operation. Выведите READY до вызовов, затем оба результата. Сохраните заданные подписи исходных операций.",
        "contract": {
            "given": "Интерпретатор задаёт manual_value и decorated_value. Проверки подставляют другие строки.",
            "todo": "Полный вывод показывает обе настройки до READY, затем отдельный вызов и результат каждой функции.",
            "check": "Проверяются два набора значений, порядок сообщений, один запуск каждой исходной операции и сохранение её результата."
        },
        "requirements": {
            "items": [
                "observe принимает функцию и возвращает вызываемую версию для позднего запуска",
                "manual_operation декорируется присваиванием, decorated_operation: записью @",
                "исходные операции запускаются после READY и по одному разу",
                "результаты обеих операций сохранены"
            ],
            "nodes": [
                "FunctionDef"
            ],
            "calls": [
                "print",
                "operation"
            ],
            "names": [
                "manual_value",
                "decorated_value"
            ]
        },
        "hints": [
            "Отделите сообщение при применении observe от сообщений внутри возвращённой функции.",
            "После ручной формы manual_operation должно ссылаться на результат observe; @ связывает так же при определении.",
            "Сверьте READY с выводом исходных операций: их тела должны начаться только после READY."
        ],
        "starter_code": "# manual_value и decorated_value подготовлены платформой\ndef observe(operation):\n    print('НАСТРОЙКА')\n    def wrapped():\n        # Сообщите о вызове, запустите operation, сохраните и верните результат\n        pass\n    # Верните вызываемое значение для более позднего вызова\n    pass\n\ndef manual_operation():\n    print('ИСХОДНАЯ manual')\n    return manual_value\n\n# Примените observe к manual_operation вручную\n\n@observe\ndef decorated_operation():\n    print('ИСХОДНАЯ decorated')\n    return decorated_value\n\nprint('READY')\n# Вызовите обе функции и выведите их результаты\n",
        "tests": [
            {
                "name": "первый набор",
                "namespace": {
                    "manual_value": "карточка A",
                    "decorated_value": "карточка B"
                },
                "expected": "НАСТРОЙКА\nНАСТРОЙКА\nREADY\nОБЁРТКА\nИСХОДНАЯ manual\nкарточка A\nОБЁРТКА\nИСХОДНАЯ decorated\nкарточка B\nкарточка A\nкарточка B",
                "assert": "stdout"
            },
            {
                "name": "изменившиеся значения",
                "namespace": {
                    "manual_value": "задача",
                    "decorated_value": "поиск"
                },
                "expected": "НАСТРОЙКА\nНАСТРОЙКА\nREADY\nОБЁРТКА\nИСХОДНАЯ manual\nзадача\nОБЁРТКА\nИСХОДНАЯ decorated\nпоиск\nзадача\nпоиск",
                "assert": "stdout"
            }
        ],
        "reference_code": "def observe(operation):\n    print('НАСТРОЙКА')\n    def wrapped():\n        print('ОБЁРТКА')\n        result = operation()\n        print(result)\n        return result\n    return wrapped\n\ndef manual_operation():\n    print('ИСХОДНАЯ manual')\n    return manual_value\n\nmanual_operation = observe(manual_operation)\n\n@observe\ndef decorated_operation():\n    print('ИСХОДНАЯ decorated')\n    return decorated_value\n\nprint('READY')\nmanual_result = manual_operation()\ndecorated_result = decorated_operation()\nprint(manual_result)\nprint(decorated_result)\n"
    }
],
}

"""Автопроверяемые задания для интерпретатора в rich Python-курсах."""

from __future__ import annotations

import re
from typing import Any


FOUNDATIONS_TRACK = "Основы Python и мышление программиста"
DEEPER_TRACK = "Python глубже, файлы и структура небольшого проекта"


def _contract(given: str, todo: str, check: str) -> dict[str, str]:
    return {"given": given, "todo": todo, "check": check}


def _script(title: str, prompt: str, starter_code: str, expected: str, reference_code: str) -> dict[str, Any]:
    return {
        "title": title,
        "level": "easy",
        "mode": "script",
        "prompt": prompt,
        "contract": _contract(
            "Интерпретатор подготовит переменные из условия. В проверке их значения могут меняться.",
            prompt,
            "Программа запускается на нескольких скрытых наборах данных. Сравнивается весь вывод.",
        ),
        "requirements": {},
        "starter_code": starter_code,
        "tests": [{"name": "ожидаемый вывод", "expected": expected, "assert": "stdout"}],
        "reference_code": reference_code,
    }


def _solve(
    title: str,
    prompt: str,
    starter_code: str,
    tests: list[dict[str, Any]],
    reference_code: str,
    *,
    level: str = "easy",
) -> dict[str, Any]:
    return {
        "title": title,
        "level": level,
        "mode": "solve",
        "prompt": prompt,
        "contract": _contract(
            "Автопроверка несколько раз вызовет функцию solve с разными скрытыми данными.",
            prompt,
            "Верните результат через return. Проверяются несколько скрытых сценариев, а не один пример.",
        ),
        "requirements": {},
        "starter_code": starter_code,
        "tests": tests,
        "reference_code": reference_code,
    }


def _dynamic_script(
    task: dict[str, Any],
    *,
    given: str,
    todo: str,
    starter_code: str,
    tests: list[dict[str, Any]],
    reference_code: str,
    requirements: dict[str, Any],
) -> None:
    task.update(
        prompt=todo,
        contract=_contract(
            given,
            todo,
            "Интерпретатор запустит программу на нескольких скрытых наборах данных и сверит весь вывод.",
        ),
        starter_code=starter_code,
        tests=tests,
        reference_code=reference_code,
        requirements=requirements,
    )


FOUNDATIONS_CODE_TASKS: dict[int, list[dict[str, Any]]] = {1: [{'title': 'Стартовый экран StudyHub',
      'level': 'easy',
      'mode': 'script',
      'prompt': 'Напишите три отдельные команды print(). Первая выводит StudyHub, вторая — Начинаем обучение, '
                'третья — Программа запущена. Сохраните именно этот порядок. Не добавляйте другой текст и пустые '
                'строки.',
      'contract': {'given': 'Редактор пуст. Никакие переменные и готовые команды не созданы. Напишите программу '
                            'полностью, используя print().',
                   'todo': 'Напишите три отдельные команды print(). Первая выводит StudyHub, вторая — Начинаем '
                           'обучение, третья — Программа запущена. Сохраните именно этот порядок. Не добавляйте '
                           'другой текст и пустые строки.',
                   'check': 'Сравнивается весь вывод. Ожидаются ровно три строки: StudyHub, Начинаем обучение, '
                            'Программа запущена. Другой регистр, порядок или лишняя строка считаются ошибкой.'},
      'requirements': {'items': ['три отдельные команды print()', 'три точные строки', 'порядок сверху вниз'],
                       'calls': ['print']},
      'starter_code': '# Первая строка: StudyHub\n'
                      '# Вторая строка: Начинаем обучение\n'
                      '# Третья строка: Программа запущена\n',
      'tests': [{'name': 'точный стартовый экран',
                 'expected': 'StudyHub\nНачинаем обучение\nПрограмма запущена',
                 'assert': 'stdout'}],
      'reference_code': 'print("StudyHub")\nprint("Начинаем обучение")\nprint("Программа запущена")\n'}],
 4: [{'title': 'Паспорт учебной задачи',
      'level': 'easy',
      'mode': 'script',
      'prompt': 'Создайте title, priority, progress, is_done и присвойте им соответствующие source-значения. '
                'Выведите четыре значения в этом порядке. Затем выведите названия их типов через '
                'type(...).__name__ в том же порядке.',
      'contract': {'given': 'Платформа создаёт source_title (str), source_priority (int), source_progress '
                            '(float) и source_done (bool). Их значения меняются в проверках.',
                   'todo': 'Создайте title, priority, progress, is_done и присвойте им соответствующие '
                           'source-значения. Выведите четыре значения в этом порядке. Затем выведите названия их '
                           'типов через type(...).__name__ в том же порядке.',
                   'check': 'Ожидаются восемь строк: четыре текущих значения, затем str, int, float, bool. '
                            'Нельзя подставлять значения примера напрямую.'},
      'requirements': {'items': ['четыре переменные', 'четыре значения', 'названия четырёх типов'],
                       'names': ['source_title',
                                 'source_priority',
                                 'source_progress',
                                 'source_done',
                                 'title',
                                 'priority',
                                 'progress',
                                 'is_done'],
                       'calls': ['type', 'print']},
      'starter_code': '# source_title, source_priority, source_progress и source_done уже созданы\n'
                      '# Создайте четыре переменные, выведите значения и названия типов\n',
      'tests': [{'name': 'первая задача',
                 'namespace': {'source_title': 'Сделать README',
                               'source_priority': 2,
                               'source_progress': 0.0,
                               'source_done': False},
                 'expected': 'Сделать README\n2\n0.0\nFalse\nstr\nint\nfloat\nbool',
                 'assert': 'stdout'},
                {'name': 'другие значения',
                 'namespace': {'source_title': 'Повторить циклы',
                               'source_priority': 4,
                               'source_progress': 37.5,
                               'source_done': True},
                 'expected': 'Повторить циклы\n4\n37.5\nTrue\nstr\nint\nfloat\nbool',
                 'assert': 'stdout'}],
      'reference_code': 'title = source_title\n'
                        'priority = source_priority\n'
                        'progress = source_progress\n'
                        'is_done = source_done\n'
                        'print(title)\n'
                        'print(priority)\n'
                        'print(progress)\n'
                        'print(is_done)\n'
                        'print(type(title).__name__)\n'
                        'print(type(priority).__name__)\n'
                        'print(type(progress).__name__)\n'
                        'print(type(is_done).__name__)\n'}],
 5: [{'title': 'Длительность учебной сессии',
      'level': 'easy',
      'mode': 'script',
      'prompt': 'Преобразуйте raw_lessons через int() в lessons_count. Рассчитайте study_minutes = lessons_count '
                '* minutes_per_lesson, затем total_minutes = study_minutes + break_minutes. Выведите только '
                'total_minutes.',
      'contract': {'given': 'Платформа создаёт raw_lessons как строку, minutes_per_lesson и break_minutes как '
                            'целые числа. Не присваивайте им собственные значения.',
                   'todo': 'Преобразуйте raw_lessons через int() в lessons_count. Рассчитайте study_minutes = '
                           'lessons_count * minutes_per_lesson, затем total_minutes = study_minutes + '
                           'break_minutes. Выведите только total_minutes.',
                   'check': 'Код запускается с тремя наборами данных. Проверяется итоговое число и использование '
                            'int(raw_lessons). Фиксированный ответ не пройдёт.'},
      'requirements': {'items': ['int(raw_lessons)', 'lessons_count', 'study_minutes', 'total_minutes'],
                       'names': ['raw_lessons',
                                 'minutes_per_lesson',
                                 'break_minutes',
                                 'lessons_count',
                                 'study_minutes',
                                 'total_minutes'],
                       'calls': ['int', 'print']},
      'starter_code': '# raw_lessons, minutes_per_lesson и break_minutes уже созданы\n'
                      '# Рассчитайте lessons_count, study_minutes и total_minutes\n',
      'tests': [{'name': 'два занятия',
                 'namespace': {'raw_lessons': '2', 'minutes_per_lesson': 40, 'break_minutes': 10},
                 'expected': '90',
                 'assert': 'stdout'},
                {'name': 'три занятия',
                 'namespace': {'raw_lessons': '3', 'minutes_per_lesson': 35, 'break_minutes': 15},
                 'expected': '120',
                 'assert': 'stdout'},
                {'name': 'без перерыва',
                 'namespace': {'raw_lessons': '1', 'minutes_per_lesson': 50, 'break_minutes': 0},
                 'expected': '50',
                 'assert': 'stdout'}],
      'reference_code': 'lessons_count = int(raw_lessons)\n'
                        'study_minutes = lessons_count * minutes_per_lesson\n'
                        'total_minutes = study_minutes + break_minutes\n'
                        'print(total_minutes)\n'}],
 6: [{'title': 'Короткий код и карточка задачи',
      'level': 'easy',
      'mode': 'script',
      'prompt': 'Получите clean_title = raw_title.strip(). Возьмите первые три символа, переведите их в верхний '
                'регистр и сохраните в short_code. Через f-строку выведите [КОД] Заголовок | приоритет: число.',
      'contract': {'given': 'Платформа создаёт raw_title с пробелами по краям и минимум тремя буквами после '
                            'очистки, а также целое число priority.',
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
      'contract': {'given': 'Платформа создаёт priority от 1 до 5, is_done как bool и days_left как целое '
                            'число.',
                   'todo': 'Создайте is_urgent. Значение должно быть True только когда priority не меньше 4, '
                           'задача не выполнена и days_left больше 0. Используйте and и not. Выведите только '
                           'is_urgent.',
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
                'priority не меньше 4, выведите Срочно. Иначе, если priority не меньше 2, выведите В работе. Во '
                'всех остальных случаях выведите Низкий приоритет.',
      'contract': {'given': 'Платформа создаёт priority от 1 до 5 и is_done со значением True или False.',
                   'todo': 'Напишите одну цепочку if / elif / else. Если is_done истинно, выведите Выполнена. '
                           'Иначе, если priority не меньше 4, выведите Срочно. Иначе, если priority не меньше 2, '
                           'выведите В работе. Во всех остальных случаях выведите Низкий приоритет.',
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
      'prompt': 'Не создавайте tasks заново. Циклом for и range(len(tasks)) пройдите по индексам. Для каждой '
                "задачи выведите <номер>. <заголовок>, начиная с номера 1. Например, ['Код', 'README'] даёт 1. "
                'Код и 2. README.',
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
                    'todo': 'Пока command не равна expected_command, выведите Неизвестная команда: <command>, '
                            'затем присвойте command значение expected_command. После while выведите Принято: '
                            '<command>. Обе строки соберите через f-строки.',
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
                         "print(f'Принято: {command}')\n"}],
 11: [{'title': 'Коллекции учебного проекта',
       'level': 'easy',
       'mode': 'script',
       'prompt': "Добавьте new_task в tasks через append(). Создайте кортеж statuses = ('new', 'done'). Создайте "
                 'unique_tags = set(tags). Выведите: длину tasks, элемент statuses с индексом 1, количество '
                 'уникальных тегов — каждое значение с новой строки.',
       'contract': {'given': 'Платформа создаёт список tasks, строку new_task и список tags с повторами.',
                    'todo': "Добавьте new_task в tasks через append(). Создайте кортеж statuses = ('new', 'done'). "
                            'Создайте unique_tags = set(tags). Выведите: длину tasks, элемент statuses с индексом '
                            '1, количество уникальных тегов — каждое значение с новой строки.',
                    'check': 'Проверяются разные списки. Ожидаются три строки: новая длина tasks, слово done, '
                             'число уникальных тегов.'},
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
                    'check': 'Проверяются два набора данных. Ключи должны называться точно title, priority, '
                             'done.'},
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
       'contract': {'given': 'Автопроверка вызывает solve(title, priority) с разными строками и целыми числами. '
                             'Тело функции пока пустое.',
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
                 'normalize_title(raw_title) и верните словарь с ключами title, priority, done: очищенный '
                 'заголовок, переданный priority и False.',
       'contract': {'given': 'Автопроверка вызывает solve(raw_title, priority). raw_title может содержать пробелы '
                             'и разный регистр, priority — целое число.',
                    'todo': 'Создайте normalize_title(title), которая возвращает title.strip().title(). В solve '
                            'вызовите normalize_title(raw_title) и верните словарь с ключами title, priority, '
                            'done: очищенный заголовок, переданный priority и False.',
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
                             "написано task_titel. raw_priority хранит строку '2', поэтому её нельзя "
                             'складывать с числом 1.',
                    'todo': 'Исправьте две строки: используйте правильное имя task_title и преобразуйте raw_priority '
                            'через int() перед сложением. После исправления программа выводит Сделать README, '
                            'затем 3.',
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
                         'print(int(raw_priority) + 1)\n'}],
 16: [{'title': 'Одна итерация меню',
       'level': 'easy',
       'mode': 'script',
       'prompt': 'Получите clean_title = raw_title.strip(). Для add: если clean_title пуст, выведите Ошибка: '
                 'пустой заголовок, иначе Добавить: <clean_title>. Для list выведите Показать задачи, для exit '
                 '— Выход, для другой команды — Неизвестная команда.',
       'contract': {'given': 'Платформа создаёт command и raw_title. command может быть add, list, exit '
                             'или неизвестной строкой. raw_title используется для add и может состоять из пробелов.',
                    'todo': 'Получите clean_title = raw_title.strip(). Для add: если clean_title пуст, выведите '
                            'Ошибка: пустой заголовок, иначе Добавить: <clean_title>. Для list выведите '
                            'Показать задачи, для exit — Выход, для другой команды — Неизвестная команда.',
                    'check': 'Проверяются пять сценариев. Каждый запуск должен дать ровно одну строку.'},
       'requirements': {'items': ['clean_title через strip()',
                                  'команды add/list/exit',
                                  'пустой заголовок',
                                  'неизвестная команда'],
                        'names': ['command', 'raw_title', 'clean_title'],
                        'attributes': ['strip'],
                        'nodes': ['If', 'JoinedStr'],
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
       'prompt': 'Начните с next_id = 1. Циклом найдите id больше максимального существующего. Очистите title '
                 'через strip(). Создайте новую задачу с next_id, title, priority и done=False. Добавьте её через '
                 'append() и верните обновлённый tasks.',
       'contract': {'given': 'Автопроверка вызывает solve(tasks, title, priority). tasks — список словарей с '
                             'ключами id, title, priority, done. Список может быть пустым или иметь пропуски в id.',
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
       'contract': {'given': 'Автопроверка вызывает solve(tasks, task_id, query). tasks содержит словари id, '
                             'title, done. task_id — задача для завершения, query — часть заголовка для поиска без '
                             'учёта регистра.',
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
                         'done_count}\n'}]}

DEEPER_CODE_TASKS: dict[int, list[dict[str, Any]]] = {22: [{'title': 'Контракт создания задачи',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Объявите solve(title, priority=2). Получите clean_title через title.strip(). Если clean_title пуст, '
                 'верните None. Иначе верните словарь с ключами title, priority и done. Для done установите False. '
                 'Функция ничего не печатает.',
       'contract': {'given': 'Автопроверка вызывает solve(title, priority) или solve(title). title — строка, иногда '
                             'только из пробелов. priority — целое число от 1 до 5; когда аргумент не передан, должно '
                             'использоваться значение 2.',
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
                 'done. Создайте first вызовом только с first_title. Создайте second, передав second_title позиционно, '
                 'а second_priority именованно. Создайте third, передав third_title позиционно, а priority и done '
                 'именованно в обратном порядке: done=third_done, priority=third_priority. Выведите first, second и '
                 'third с новой строки.',
       'contract': {'given': 'Интерпретатор создаёт first_title, second_title, second_priority, third_title, '
                             'third_priority и third_done. Значения меняются в проверках.',
                    'todo': 'Объявите create_task(title, priority=2, done=False), которая возвращает словарь title, '
                            'priority, done. Создайте first вызовом только с first_title. Создайте second, передав '
                            'second_title позиционно, а second_priority именованно. Создайте third, передав '
                            'third_title позиционно, а priority и done именованно в обратном порядке: done=third_done, '
                            'priority=third_priority. Выведите first, second и third с новой строки.',
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
       'prompt': 'Создайте updated через tasks.copy(). Добавьте в updated очищенный title через append(). Не изменяйте '
                 'tasks. Верните словарь с ключами original и updated: original должен ссылаться на неизменённое '
                 'содержимое tasks, updated — на новый список с добавленным заголовком.',
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
                 {'name': 'пустой список', 'args': [[], 'README'], 'expected': {'original': [], 'updated': ['README']}},
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
       'prompt': 'Объявите вспомогательную функцию make_summary(total, label, multiplier), возвращающую словарь label, '
                 'total и adjusted. Затем объявите solve(*durations, **settings). Получите total через sum(durations). '
                 'Из settings получите label со значением StudyHub и multiplier со значением 1 по умолчанию. Соберите '
                 'config с ключами label и multiplier и вызовите make_summary(total, **config). Верните полученный '
                 'словарь.',
       'contract': {'given': 'Автопроверка вызывает solve с произвольным количеством позиционных длительностей и '
                             'именованными настройками label и multiplier. Настройки могут отсутствовать.',
                    'todo': 'Объявите вспомогательную функцию make_summary(total, label, multiplier), возвращающую '
                            'словарь label, total и adjusted. Затем объявите solve(*durations, **settings). Получите '
                            'total через sum(durations). Из settings получите label со значением StudyHub и multiplier '
                            'со значением 1 по умолчанию. Соберите config с ключами label и multiplier и вызовите '
                            'make_summary(total, **config). Верните полученный словарь.',
                    'check': 'Проверяются ноль, два и четыре позиционных значения, настройки по умолчанию и '
                             'именованные настройки. Сравнивается return. В решении должны быть *durations, **settings '
                             'и распаковка словаря при вызове make_summary.'},
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
                 'внутри неё — transform(value), которая вызывает переданную operation, прибавляет сохранённый offset '
                 'и возвращает результат. Выберите callback по mode, получите transformer через make_transformer и '
                 'примените его к каждому числу. Верните новый список.',
       'contract': {'given': 'Автопроверка вызывает solve(values, mode, offset). values — список чисел. mode равен '
                             'double или square. offset — число, которое нужно прибавить после основной операции.',
                    'todo': 'Внутри solve объявите double(value) и square(value). Объявите make_transformer(operation, '
                            'offset), внутри неё — transform(value), которая вызывает переданную operation, прибавляет '
                            'сохранённый offset и возвращает результат. Выберите callback по mode, получите '
                            'transformer через make_transformer и примените его к каждому числу. Верните новый список.',
                    'check': 'Проверяются оба callback, разные offset и пустой список. Сравнивается return. Исходный '
                             'values менять не нужно.'},
       'requirements': {'items': ['callback без немедленного вызова',
                                  'вложенная transform',
                                  'замыкание хранит operation и offset',
                                  'новый список результата'],
                        'nodes': ['FunctionDef', 'IfExp', 'For'],
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
                         '    return result\n'}],
 27: [{'title': 'Декоратор сохраняет вызов и результат',
       'level': 'medium',
       'mode': 'script',
       'prompt': 'Объявите декоратор log_call(operation). Внутри создайте wrapper(*args, **kwargs), который печатает '
                 'START <имя функции>, вызывает operation(*args, **kwargs), печатает DONE <результат> и возвращает '
                 'результат. Примените @log_call к create_task(title, priority=2), возвращающей строку '
                 '<title>:<priority>. Вызовите create_task(title, priority=priority), сохраните result и выведите '
                 'RESULT <result>.',
       'contract': {'given': 'Интерпретатор создаёт title и priority. Они меняются в проверках.',
                    'todo': 'Объявите декоратор log_call(operation). Внутри создайте wrapper(*args, **kwargs), который '
                            'печатает START <имя функции>, вызывает operation(*args, **kwargs), печатает DONE '
                            '<результат> и возвращает результат. Примените @log_call к create_task(title, priority=2), '
                            'возвращающей строку <title>:<priority>. Вызовите create_task(title, priority=priority), '
                            'сохраните result и выведите RESULT <result>.',
                    'check': 'Проверяются два набора title и priority. Сравниваются три строки целиком. Обязательны '
                             'декоратор, wrapper с *args и **kwargs, передача аргументов дальше и return результата.'},
       'requirements': {'items': ['функция-декоратор',
                                  'wrapper(*args, **kwargs)',
                                  'operation(*args, **kwargs)',
                                  'return result',
                                  '@log_call'],
                        'nodes': ['FunctionDef', 'JoinedStr'],
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
                            'успешного преобразования верните число, если оно находится от 1 до 5 включительно; иначе '
                            'верните None. Не используйте общий except Exception.',
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
                 'Задача добавлена, для list верните Список задач, иначе выполните raise UnknownCommandError(command). '
                 'В try вызовите execute. В except UnknownCommandError выведите ERROR <command>. В else выведите OK '
                 '<result>. В finally всегда выведите CLEANUP.',
       'contract': {'given': 'Интерпретатор создаёт command. Допустимы add, list и неизвестные строки.',
                    'todo': 'Объявите UnknownCommandError как подкласс ValueError. Объявите execute(command): для add '
                            'верните Задача добавлена, для list верните Список задач, иначе выполните raise '
                            'UnknownCommandError(command). В try вызовите execute. В except UnknownCommandError '
                            'выведите ERROR <command>. В else выведите OK <result>. В finally всегда выведите CLEANUP.',
                    'check': 'Проверяются успешные add и list, а также неизвестная команда. Каждый запуск должен дать '
                             'ровно две строки. CLEANUP обязана появиться во всех сценариях.'},
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
                         "    print('CLEANUP')\n"}],
 36: [{'title': 'Первый объект Task',
       'level': 'easy',
       'mode': 'script',
       'prompt': 'Объявите класс Task. В __init__(self, task_id, title, priority) сохраните id, очищенный title, '
                 'priority и done=False в атрибутах объекта. Создайте task из подготовленных значений. Выведите '
                 'task.id, task.title, task.priority и task.done — каждое значение с новой строки.',
       'contract': {'given': 'Интерпретатор создаёт task_id, title и priority. Значения меняются в проверках.',
                    'todo': 'Объявите класс Task. В __init__(self, task_id, title, priority) сохраните id, очищенный '
                            'title, priority и done=False в атрибутах объекта. Создайте task из подготовленных '
                            'значений. Выведите task.id, task.title, task.priority и task.done — каждое значение с '
                            'новой строки.',
                    'check': 'Проверяются два набора данных и заголовок с пробелами. Сравниваются четыре строки '
                             'целиком. Обязательны класс, __init__, self и title.strip().'},
       'requirements': {'items': ['класс Task', '__init__ с self', 'четыре атрибута экземпляра', 'очистка title'],
                        'nodes': ['ClassDef'],
                        'attributes': ['strip'],
                        'calls': ['print']},
       'starter_code': '# task_id, title и priority уже созданы\n'
                       '# Опишите Task, создайте объект и выведите четыре атрибута\n',
       'tests': [{'name': 'первая задача',
                  'namespace': {'task_id': 1, 'title': '  Python  ', 'priority': 2},
                  'expected': '1\nPython\n2\nFalse',
                  'assert': 'stdout'},
                 {'name': 'вторая задача',
                  'namespace': {'task_id': 7, 'title': 'README', 'priority': 5},
                  'expected': '7\nREADME\n5\nFalse',
                  'assert': 'stdout'}],
       'reference_code': 'class Task:\n'
                         '    def __init__(self, task_id, title, priority):\n'
                         '        self.id = task_id\n'
                         '        self.title = title.strip()\n'
                         '        self.priority = priority\n'
                         '        self.done = False\n'
                         '\n'
                         'task = Task(task_id, title, priority)\n'
                         'print(task.id)\n'
                         'print(task.title)\n'
                         'print(task.priority)\n'
                         'print(task.done)\n'}],
 37: [{'title': 'Методы и читаемое представление',
       'level': 'medium',
       'mode': 'script',
       'prompt': 'Объявите Task с id, title и done=False. Метод rename(new_title) должен сохранять new_title.strip(). '
                 'Метод mark_done() устанавливает done=True. Метод __str__ возвращает строку #<id> | <title> | open '
                 'для незавершённой задачи и #<id> | <title> | done для завершённой. Создайте объект, вызовите '
                 'rename(next_title), при истинном should_complete вызовите mark_done(), затем напечатайте объект.',
       'contract': {'given': 'Интерпретатор создаёт task_id, title, next_title и should_complete.',
                    'todo': 'Объявите Task с id, title и done=False. Метод rename(new_title) должен сохранять '
                            'new_title.strip(). Метод mark_done() устанавливает done=True. Метод __str__ возвращает '
                            'строку #<id> | <title> | open для незавершённой задачи и #<id> | <title> | done для '
                            'завершённой. Создайте объект, вызовите rename(next_title), при истинном should_complete '
                            'вызовите mark_done(), затем напечатайте объект.',
                    'check': 'Проверяются завершённая и открытая задачи. Сравнивается одна итоговая строка. '
                             'Обязательны два предметных метода и __str__.'},
       'requirements': {'items': ['rename', 'mark_done', '__str__', 'изменение состояния конкретного объекта'],
                        'nodes': ['ClassDef', 'If', 'IfExp', 'JoinedStr'],
                        'attributes': ['strip', 'rename', 'mark_done'],
                        'calls': ['print']},
       'starter_code': '# Все входные значения уже созданы\n# Опишите Task, измените объект и напечатайте его\n',
       'tests': [{'name': 'открытая задача',
                  'namespace': {'task_id': 2,
                                'title': 'Черновик',
                                'next_title': '  README  ',
                                'should_complete': False},
                  'expected': '#2 | README | open',
                  'assert': 'stdout'},
                 {'name': 'завершённая задача',
                  'namespace': {'task_id': 5, 'title': 'Код', 'next_title': 'Тесты', 'should_complete': True},
                  'expected': '#5 | Тесты | done',
                  'assert': 'stdout'}],
       'reference_code': 'class Task:\n'
                         '    def __init__(self, task_id, title):\n'
                         '        self.id = task_id\n'
                         '        self.title = title\n'
                         '        self.done = False\n'
                         '\n'
                         '    def rename(self, new_title):\n'
                         '        self.title = new_title.strip()\n'
                         '\n'
                         '    def mark_done(self):\n'
                         '        self.done = True\n'
                         '\n'
                         '    def __str__(self):\n'
                         "        status = 'done' if self.done else 'open'\n"
                         "        return f'#{self.id} | {self.title} | {status}'\n"
                         '\n'
                         'task = Task(task_id, title)\n'
                         'task.rename(next_title)\n'
                         'if should_complete:\n'
                         '    task.mark_done()\n'
                         'print(task)\n'}],
 38: [{'title': 'Property защищает приоритет',
       'level': 'medium',
       'mode': 'script',
       'prompt': 'Объявите Task. В __init__ создайте _priority и присвойте начальное значение через публичное свойство '
                 'priority. Getter возвращает _priority. Setter разрешает только числа от 1 до 5 и иначе выполняет '
                 'raise ValueError с текстом priority должен быть от 1 до 5. Создайте task. В try присвойте '
                 'next_priority. В except ValueError выведите ERROR <текст ошибки>. После try выведите PRIORITY '
                 '<сохранённое значение>.',
       'contract': {'given': 'Интерпретатор создаёт initial_priority и next_priority. initial_priority всегда от 1 до '
                             '5. next_priority может быть корректным или выходить за диапазон.',
                    'todo': 'Объявите Task. В __init__ создайте _priority и присвойте начальное значение через '
                            'публичное свойство priority. Getter возвращает _priority. Setter разрешает только числа '
                            'от 1 до 5 и иначе выполняет raise ValueError с текстом priority должен быть от 1 до 5. '
                            'Создайте task. В try присвойте next_priority. В except ValueError выведите ERROR <текст '
                            'ошибки>. После try выведите PRIORITY <сохранённое значение>.',
                    'check': 'Проверяются корректное изменение и два некорректных значения. При ошибке старое значение '
                             'должно сохраниться. Сравнивается весь вывод.'},
       'requirements': {'items': ['закрытый атрибут _priority',
                                  'getter и setter',
                                  'проверка 1-5',
                                  'старое значение сохраняется при ошибке'],
                        'nodes': ['ClassDef', 'If', 'Try', 'Raise', 'JoinedStr'],
                        'names': ['property'],
                        'calls': ['print']},
       'starter_code': '# initial_priority и next_priority уже созданы\n'
                       '# Опишите Task с property и безопасно измените priority\n',
       'tests': [{'name': 'корректное изменение',
                  'namespace': {'initial_priority': 2, 'next_priority': 5},
                  'expected': 'PRIORITY 5',
                  'assert': 'stdout'},
                 {'name': 'слишком большое',
                  'namespace': {'initial_priority': 2, 'next_priority': 8},
                  'expected': 'ERROR priority должен быть от 1 до 5\nPRIORITY 2',
                  'assert': 'stdout'},
                 {'name': 'слишком маленькое',
                  'namespace': {'initial_priority': 4, 'next_priority': 0},
                  'expected': 'ERROR priority должен быть от 1 до 5\nPRIORITY 4',
                  'assert': 'stdout'}],
       'reference_code': 'class Task:\n'
                         '    def __init__(self, priority):\n'
                         '        self._priority = 1\n'
                         '        self.priority = priority\n'
                         '\n'
                         '    @property\n'
                         '    def priority(self):\n'
                         '        return self._priority\n'
                         '\n'
                         '    @priority.setter\n'
                         '    def priority(self, value):\n'
                         '        if not 1 <= value <= 5:\n'
                         "            raise ValueError('priority должен быть от 1 до 5')\n"
                         '        self._priority = value\n'
                         '\n'
                         'task = Task(initial_priority)\n'
                         'try:\n'
                         '    task.priority = next_priority\n'
                         'except ValueError as error:\n'
                         "    print(f'ERROR {error}')\n"
                         "print(f'PRIORITY {task.priority}')\n"}],
 40: [{'title': 'Сервис зависит от контракта хранилища',
       'level': 'medium',
       'mode': 'script',
       'prompt': 'Объявите MemoryStorage: __init__ сохраняет отдельную копию initial, load() возвращает копию данных, '
                 'save(items) сохраняет копию items. Объявите PlannerService(storage): add_task(title) загружает '
                 'список, добавляет title.strip(), сохраняет список через storage и возвращает добавленный заголовок; '
                 'list_tasks() возвращает storage.load(). Создайте storage из initial_titles и service через передачу '
                 'зависимости. Добавьте new_title. Выведите добавленный заголовок, затем итоговый список.',
       'contract': {'given': 'Интерпретатор создаёт initial_titles — список строк и new_title — строку с возможными '
                             'пробелами.',
                    'todo': 'Объявите MemoryStorage: __init__ сохраняет отдельную копию initial, load() возвращает '
                            'копию данных, save(items) сохраняет копию items. Объявите PlannerService(storage): '
                            'add_task(title) загружает список, добавляет title.strip(), сохраняет список через storage '
                            'и возвращает добавленный заголовок; list_tasks() возвращает storage.load(). Создайте '
                            'storage из initial_titles и service через передачу зависимости. Добавьте new_title. '
                            'Выведите добавленный заголовок, затем итоговый список.',
                    'check': 'Проверяются пустое и заполненное хранилища. Сравниваются две строки. PlannerService не '
                             'должен наследоваться от MemoryStorage и не должен обращаться к его внутреннему списку '
                             'напрямую.'},
       'requirements': {'items': ['MemoryStorage отвечает только за данные',
                                  'PlannerService получает storage через конструктор',
                                  'load и save вместо доступа к _items',
                                  'копии списков на границе'],
                        'nodes': ['ClassDef'],
                        'attributes': ['copy', 'append', 'strip', 'load', 'save'],
                        'calls': ['print']},
       'starter_code': '# initial_titles и new_title уже созданы\n'
                       '# Опишите MemoryStorage и PlannerService, затем выполните сценарий\n',
       'tests': [{'name': 'заполненное хранилище',
                  'namespace': {'initial_titles': ['Python', 'Git'], 'new_title': '  SQL  '},
                  'expected': "SQL\n['Python', 'Git', 'SQL']",
                  'assert': 'stdout'},
                 {'name': 'пустое хранилище',
                  'namespace': {'initial_titles': [], 'new_title': 'README'},
                  'expected': "README\n['README']",
                  'assert': 'stdout'}],
       'reference_code': 'class MemoryStorage:\n'
                         '    def __init__(self, initial):\n'
                         '        self._items = initial.copy()\n'
                         '\n'
                         '    def load(self):\n'
                         '        return self._items.copy()\n'
                         '\n'
                         '    def save(self, items):\n'
                         '        self._items = items.copy()\n'
                         '\n'
                         '\n'
                         'class PlannerService:\n'
                         '    def __init__(self, storage):\n'
                         '        self.storage = storage\n'
                         '\n'
                         '    def add_task(self, title):\n'
                         '        items = self.storage.load()\n'
                         '        clean_title = title.strip()\n'
                         '        items.append(clean_title)\n'
                         '        self.storage.save(items)\n'
                         '        return clean_title\n'
                         '\n'
                         '    def list_tasks(self):\n'
                         '        return self.storage.load()\n'
                         '\n'
                         'storage = MemoryStorage(initial_titles)\n'
                         'service = PlannerService(storage)\n'
                         'added = service.add_task(new_title)\n'
                         'print(added)\n'
                         'print(service.list_tasks())\n'}]}

def get_code_tasks(track_id: str, filename: str) -> list[dict[str, Any]]:
    """Возвращает задачи редактора только для тем, проверяемых без доступа к ОС."""
    match = re.match(r"^(\d+)\s+-\s+", filename)
    if match is None:
        return []

    lesson_number = int(match.group(1))
    tasks_by_track = {
        FOUNDATIONS_TRACK: FOUNDATIONS_CODE_TASKS,
        DEEPER_TRACK: DEEPER_CODE_TASKS,
    }.get(track_id, {})
    return tasks_by_track.get(lesson_number, [])

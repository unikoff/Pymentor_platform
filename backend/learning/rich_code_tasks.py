"""Автопроверяемые задания для rich Python-курсов."""

from __future__ import annotations

import re
from typing import Any


FOUNDATIONS_TRACK = "Основы Python и мышление программиста"
DEEPER_TRACK = "Python глубже, файлы и структура небольшого проекта"
PLANNER_API_TRACK = "HTTP, API и FastAPI - Planner API"
DATABASE_API_TRACK = "FastAPI, SQLite и SQLAlchemy - StudyHub Database API"


def _contract(given: str, todo: str, check: str) -> dict[str, str]:
    return {"given": given, "todo": todo, "check": check}


def _script(
    title: str,
    prompt: str,
    starter_code: str,
    expected: str,
    reference_code: str,
) -> dict[str, Any]:
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
      'prompt': 'Напишите три отдельные команды print(). Первая выводит StudyHub, вторая — Начинаем обучение, третья '
                '— Программа запущена. Сохраните именно этот порядок. Не добавляйте другой текст и пустые строки.',
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
                'Выведите четыре значения в этом порядке. Затем выведите названия их типов через type(...).__name__ '
                'в том же порядке.',
      'contract': {'given': 'Платформа создаёт source_title (str), source_priority (int), source_progress (float) и '
                            'source_done (bool). Их значения меняются в проверках.',
                   'todo': 'Создайте title, priority, progress, is_done и присвойте им соответствующие '
                           'source-значения. Выведите четыре значения в этом порядке. Затем выведите названия их '
                           'типов через type(...).__name__ в том же порядке.',
                   'check': 'Ожидаются восемь строк: четыре текущих значения, затем str, int, float, bool. Нельзя '
                            'подставлять значения примера напрямую.'},
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
      'prompt': 'Преобразуйте raw_lessons через int() в lessons_count. Рассчитайте study_minutes = lessons_count * '
                'minutes_per_lesson, затем total_minutes = study_minutes + break_minutes. Выведите только '
                'total_minutes.',
      'contract': {'given': 'Платформа создаёт raw_lessons как строку, minutes_per_lesson и break_minutes как целые '
                            'числа. Не присваивайте им собственные значения.',
                   'todo': 'Преобразуйте raw_lessons через int() в lessons_count. Рассчитайте study_minutes = '
                           'lessons_count * minutes_per_lesson, затем total_minutes = study_minutes + break_minutes. '
                           'Выведите только total_minutes.',
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
                         "print(f'Принято: {command}')\n"}],
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
                         'print(int(raw_priority) + 1)\n'}],
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
                         'done_count}\n'}]}

DEEPER_CODE_TASKS: dict[int, list[dict[str, Any]]] = {22: [{'title': 'Контракт создания задачи',
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
       'prompt': 'Объявите Task с id, title и done=False. Метод rename(new_title) должен сохранять '
                 'new_title.strip(). Метод mark_done() устанавливает done=True. Метод __str__ возвращает строку '
                 '#<id> | <title> | open для незавершённой задачи и #<id> | <title> | done для завершённой. Создайте '
                 'объект, вызовите rename(next_title), при истинном should_complete вызовите mark_done(), затем '
                 'напечатайте объект.',
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
       'prompt': 'Объявите Task. В __init__ создайте _priority и присвойте начальное значение через публичное '
                 'свойство priority. Getter возвращает _priority. Setter разрешает только числа от 1 до 5 и иначе '
                 'выполняет raise ValueError с текстом priority должен быть от 1 до 5. Создайте task. В try '
                 'присвойте next_priority. В except ValueError выведите ERROR <текст ошибки>. После try выведите '
                 'PRIORITY <сохранённое значение>.',
       'contract': {'given': 'Интерпретатор создаёт initial_priority и next_priority. initial_priority всегда от 1 '
                             'до 5. next_priority может быть корректным или выходить за диапазон.',
                    'todo': 'Объявите Task. В __init__ создайте _priority и присвойте начальное значение через '
                            'публичное свойство priority. Getter возвращает _priority. Setter разрешает только числа '
                            'от 1 до 5 и иначе выполняет raise ValueError с текстом priority должен быть от 1 до 5. '
                            'Создайте task. В try присвойте next_priority. В except ValueError выведите ERROR <текст '
                            'ошибки>. После try выведите PRIORITY <сохранённое значение>.',
                    'check': 'Проверяются корректное изменение и два некорректных значения. При ошибке старое '
                             'значение должно сохраниться. Сравнивается весь вывод.'},
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
       'prompt': 'Объявите MemoryStorage: __init__ сохраняет отдельную копию initial, load() возвращает копию '
                 'данных, save(items) сохраняет копию items. Объявите PlannerService(storage): add_task(title) '
                 'загружает список, добавляет title.strip(), сохраняет список через storage и возвращает добавленный '
                 'заголовок; list_tasks() возвращает storage.load(). Создайте storage из initial_titles и service '
                 'через передачу зависимости. Добавьте new_title. Выведите добавленный заголовок, затем итоговый '
                 'список.',
       'contract': {'given': 'Интерпретатор создаёт initial_titles — список строк и new_title — строку с возможными '
                             'пробелами.',
                    'todo': 'Объявите MemoryStorage: __init__ сохраняет отдельную копию initial, load() возвращает '
                            'копию данных, save(items) сохраняет копию items. Объявите PlannerService(storage): '
                            'add_task(title) загружает список, добавляет title.strip(), сохраняет список через '
                            'storage и возвращает добавленный заголовок; list_tasks() возвращает storage.load(). '
                            'Создайте storage из initial_titles и service через передачу зависимости. Добавьте '
                            'new_title. Выведите добавленный заголовок, затем итоговый список.',
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

PLANNER_API_CODE_TASKS: dict[int, list[dict[str, Any]]] = {46: [{'title': 'Соберите модель HTTP request',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Создайте словарь headers с Accept: application/json и X-Client-Version со значением '
                 'client_version. Когда body не равен None, добавьте Content-Type: application/json. Верните словарь '
                 'с точными ключами method, path, headers, body. Значение method переведите в верхний регистр через '
                 'upper(), path и body верните без изменения.',
       'contract': {'given': 'Автопроверка вызывает solve(method, path, client_version, body). method и path — '
                             'строки, client_version — строка версии клиента, body — словарь или None. Все значения '
                             'передаются готовыми, сетевой запрос отправлять не нужно.',
                    'todo': 'Создайте словарь headers с Accept: application/json и X-Client-Version со значением '
                            'client_version. Когда body не равен None, добавьте Content-Type: application/json. '
                            'Верните словарь с точными ключами method, path, headers, body. Значение method '
                            'переведите в верхний регистр через upper(), path и body верните без изменения.',
                    'check': 'Проверяются GET без body, POST с JSON body и PATCH с другим path. Сравнивается весь '
                             'возвращённый словарь, включая отсутствие Content-Type у request без body.'},
       'requirements': {'items': ['словарь headers',
                                  'условное добавление Content-Type',
                                  'method.upper()',
                                  'четыре точных ключа результата'],
                        'names': ['method', 'path', 'client_version', 'body', 'headers'],
                        'nodes': ['FunctionDef', 'If'],
                        'attributes': ['upper']},
       'starter_code': 'def solve(method, path, client_version, body):\n'
                       '    # Соберите headers\n'
                       '    # Верните четыре части request\n'
                       '    pass\n',
       'tests': [{'name': 'GET без body',
                  'args': ['get', '/tasks', '1.0', None],
                  'expected': {'method': 'GET',
                               'path': '/tasks',
                               'headers': {'Accept': 'application/json', 'X-Client-Version': '1.0'},
                               'body': None}},
                 {'name': 'POST с JSON',
                  'args': ['post', '/tasks', '1.1', {'title': 'HTTP', 'priority': 4}],
                  'expected': {'method': 'POST',
                               'path': '/tasks',
                               'headers': {'Accept': 'application/json',
                                           'X-Client-Version': '1.1',
                                           'Content-Type': 'application/json'},
                               'body': {'title': 'HTTP', 'priority': 4}}},
                 {'name': 'PATCH другого ресурса',
                  'args': ['patch', '/tasks/7', '2.0', {'is_done': True}],
                  'expected': {'method': 'PATCH',
                               'path': '/tasks/7',
                               'headers': {'Accept': 'application/json',
                                           'X-Client-Version': '2.0',
                                           'Content-Type': 'application/json'},
                               'body': {'is_done': True}}}],
       'reference_code': 'def solve(method, path, client_version, body):\n'
                         '    headers = {\n'
                         '        "Accept": "application/json",\n'
                         '        "X-Client-Version": client_version,\n'
                         '    }\n'
                         '    if body is not None:\n'
                         '        headers["Content-Type"] = "application/json"\n'
                         '    return {\n'
                         '        "method": method.upper(),\n'
                         '        "path": path,\n'
                         '        "headers": headers,\n'
                         '        "body": body,\n'
                         '    }\n'}],
 47: [{'title': 'Соберите модель HTTP response',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Создайте headers с X-Request-ID, равным request_id. Если body не равен None, добавьте '
                 'Content-Type: application/json. Верните словарь с точными ключами status, headers, body. Не '
                 'заменяйте None пустым словарём и не печатайте результат.',
       'contract': {'given': 'Автопроверка вызывает solve(status, body, request_id). status — целое число '
                             'HTTP-статуса, body — словарь или None, request_id — строка. Нужно представить готовый '
                             'response обычным словарём Python.',
                    'todo': 'Создайте headers с X-Request-ID, равным request_id. Если body не равен None, добавьте '
                            'Content-Type: application/json. Верните словарь с точными ключами status, headers, '
                            'body. Не заменяйте None пустым словарём и не печатайте результат.',
                    'check': 'Проверяются успешный ответ 200, ошибка 404 с JSON body и ответ 204 без body. Для 204 в '
                             'headers должен остаться только X-Request-ID.'},
       'requirements': {'items': ['заголовок X-Request-ID',
                                  'Content-Type только для body',
                                  'status и body без подмены'],
                        'names': ['status', 'body', 'request_id', 'headers'],
                        'nodes': ['FunctionDef', 'If']},
       'starter_code': 'def solve(status, body, request_id):\n    # Соберите headers и response\n    pass\n',
       'tests': [{'name': 'успешный JSON',
                  'args': [200, {'id': 1, 'title': 'HTTP'}, 'req-101'],
                  'expected': {'status': 200,
                               'headers': {'X-Request-ID': 'req-101', 'Content-Type': 'application/json'},
                               'body': {'id': 1, 'title': 'HTTP'}}},
                 {'name': 'ошибка not found',
                  'args': [404, {'detail': 'Task not found'}, 'req-202'],
                  'expected': {'status': 404,
                               'headers': {'X-Request-ID': 'req-202', 'Content-Type': 'application/json'},
                               'body': {'detail': 'Task not found'}}},
                 {'name': 'успех без body',
                  'args': [204, None, 'req-303'],
                  'expected': {'status': 204, 'headers': {'X-Request-ID': 'req-303'}, 'body': None}}],
       'reference_code': 'def solve(status, body, request_id):\n'
                         '    headers = {"X-Request-ID": request_id}\n'
                         '    if body is not None:\n'
                         '        headers["Content-Type"] = "application/json"\n'
                         '    return {"status": status, "headers": headers, "body": body}\n'}],
 48: [{'title': 'Выберите HTTP method по действию',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Создайте словарь methods со следующими парами: list → GET, get → GET, create → POST, replace → '
                 'PUT, update → PATCH, delete → DELETE. Верните method по ключу action. Не используйте print().',
       'contract': {'given': 'Автопроверка вызывает solve(action). action — одна из строк: list, get, create, '
                             'replace, update, delete. Каждому действию соответствует один HTTP method.',
                    'todo': 'Создайте словарь methods со следующими парами: list → GET, get → GET, create → POST, '
                            'replace → PUT, update → PATCH, delete → DELETE. Верните method по ключу action. Не '
                            'используйте print().',
                    'check': 'Проверяются все шесть действий. Сравнивается возвращённая строка в верхнем регистре. '
                             'Названия действий и методов должны совпасть с условием точно.'},
       'requirements': {'items': ['словарь methods', 'шесть действий', 'return выбранного метода'],
                        'names': ['action', 'methods'],
                        'nodes': ['FunctionDef']},
       'starter_code': 'def solve(action):\n    # Создайте таблицу соответствий action → HTTP method\n    pass\n',
       'tests': [{'name': 'collection read', 'args': ['list'], 'expected': 'GET'},
                 {'name': 'item read', 'args': ['get'], 'expected': 'GET'},
                 {'name': 'create', 'args': ['create'], 'expected': 'POST'},
                 {'name': 'full replace', 'args': ['replace'], 'expected': 'PUT'},
                 {'name': 'partial update', 'args': ['update'], 'expected': 'PATCH'},
                 {'name': 'delete', 'args': ['delete'], 'expected': 'DELETE'}],
       'reference_code': 'def solve(action):\n'
                         '    methods = {\n'
                         '        "list": "GET",\n'
                         '        "get": "GET",\n'
                         '        "create": "POST",\n'
                         '        "replace": "PUT",\n'
                         '        "update": "PATCH",\n'
                         '        "delete": "DELETE",\n'
                         '    }\n'
                         '    return methods[action]\n'}],
 49: [{'title': 'Постройте endpoint ресурса',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Если resource_id равен None, endpoint должен иметь вид /resource, а scope — collection. Иначе '
                 'endpoint должен иметь вид /resource/id, а scope — item. Верните словарь с точными ключами '
                 'resource, endpoint, scope.',
       'contract': {'given': 'Автопроверка вызывает solve(resource, resource_id). resource — имя collection во '
                             'множественном числе, например tasks или users. resource_id — целое число для одного '
                             'объекта или None для всей collection.',
                    'todo': 'Если resource_id равен None, endpoint должен иметь вид /resource, а scope — collection. '
                            'Иначе endpoint должен иметь вид /resource/id, а scope — item. Верните словарь с точными '
                            'ключами resource, endpoint, scope.',
                    'check': 'Проверяются collection и отдельные объекты разных ресурсов. Сравнивается весь словарь, '
                             'включая начальный символ / и отсутствие лишнего / в конце.'},
       'requirements': {'items': ['ветка collection',
                                  'ветка item',
                                  'endpoint через f-строку',
                                  'три ключа результата'],
                        'names': ['resource', 'resource_id', 'endpoint', 'scope'],
                        'nodes': ['FunctionDef', 'If', 'JoinedStr']},
       'starter_code': 'def solve(resource, resource_id):\n    # Постройте endpoint и определите scope\n    pass\n',
       'tests': [{'name': 'tasks collection',
                  'args': ['tasks', None],
                  'expected': {'resource': 'tasks', 'endpoint': '/tasks', 'scope': 'collection'}},
                 {'name': 'one task',
                  'args': ['tasks', 7],
                  'expected': {'resource': 'tasks', 'endpoint': '/tasks/7', 'scope': 'item'}},
                 {'name': 'one user',
                  'args': ['users', 3],
                  'expected': {'resource': 'users', 'endpoint': '/users/3', 'scope': 'item'}}],
       'reference_code': 'def solve(resource, resource_id):\n'
                         '    if resource_id is None:\n'
                         '        endpoint = f"/{resource}"\n'
                         '        scope = "collection"\n'
                         '    else:\n'
                         '        endpoint = f"/{resource}/{resource_id}"\n'
                         '        scope = "item"\n'
                         '    return {"resource": resource, "endpoint": endpoint, "scope": scope}\n'}],
 50: [{'title': 'Разделите path, query и body',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Верните словарь API-контракта с тремя точными ключами. В path поместите словарь с task_id. В query '
                 'поместите is_done и limit. В body поместите title и priority. Не перемещайте значения между '
                 'частями request.',
       'contract': {'given': 'Автопроверка вызывает solve(task_id, is_done, limit, title, priority). task_id '
                             'выбирает конкретную задачу, is_done и limit настраивают запрос, title и priority '
                             'описывают передаваемые данные задачи.',
                    'todo': 'Верните словарь API-контракта с тремя точными ключами. В path поместите словарь с '
                            'task_id. В query поместите is_done и limit. В body поместите title и priority. Не '
                            'перемещайте значения между частями request.',
                    'check': 'Проверяются два разных набора значений, включая is_done=None. Сравнивается вся '
                             'вложенная структура и точные имена ключей.'},
       'requirements': {'items': ['отдельный path', 'отдельный query', 'отдельный body', 'точные имена пяти полей'],
                        'names': ['task_id', 'is_done', 'limit', 'title', 'priority'],
                        'nodes': ['FunctionDef']},
       'starter_code': 'def solve(task_id, is_done, limit, title, priority):\n'
                       '    # Верните path, query и body как три вложенных словаря\n'
                       '    pass\n',
       'tests': [{'name': 'фильтр открытых задач',
                  'args': [42, False, 10, 'Изучить HTTP', 4],
                  'expected': {'path': {'task_id': 42},
                               'query': {'is_done': False, 'limit': 10},
                               'body': {'title': 'Изучить HTTP', 'priority': 4}}},
                 {'name': 'фильтр не задан',
                  'args': [3, None, 25, 'FastAPI', 2],
                  'expected': {'path': {'task_id': 3},
                               'query': {'is_done': None, 'limit': 25},
                               'body': {'title': 'FastAPI', 'priority': 2}}}],
       'reference_code': 'def solve(task_id, is_done, limit, title, priority):\n'
                         '    return {\n'
                         '        "path": {"task_id": task_id},\n'
                         '        "query": {"is_done": is_done, "limit": limit},\n'
                         '        "body": {"title": title, "priority": priority},\n'
                         '    }\n'}],
 54: [{'title': 'Найдите объект по path-параметру',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Циклом найдите первую задачу, у которой task["id"] равен task_id. Верните поверхностную копию '
                 'найденного словаря через copy(). Когда задача отсутствует, верните None. Не изменяйте исходный '
                 'список.',
       'contract': {'given': 'Автопроверка вызывает solve(tasks, task_id). tasks — список словарей, каждый словарь '
                             'содержит ключ id. task_id — целое число из path. Список может быть пустым, а нужного '
                             'id может не существовать.',
                    'todo': 'Циклом найдите первую задачу, у которой task["id"] равен task_id. Верните поверхностную '
                            'копию найденного словаря через copy(). Когда задача отсутствует, верните None. Не '
                            'изменяйте исходный список.',
                    'check': 'Проверяются первый элемент, элемент в середине, отсутствующий id и пустой список. '
                             'Сравнивается return, а не печать.'},
       'requirements': {'items': ['цикл по tasks', 'сравнение id', 'copy() найденной задачи', 'None при отсутствии'],
                        'names': ['tasks', 'task_id'],
                        'nodes': ['FunctionDef', 'For', 'If'],
                        'attributes': ['copy']},
       'starter_code': 'def solve(tasks, task_id):\n    # Найдите задачу по id\n    pass\n',
       'tests': [{'name': 'первый элемент',
                  'args': [[{'id': 1, 'title': 'HTTP'}, {'id': 2, 'title': 'FastAPI'}], 1],
                  'expected': {'id': 1, 'title': 'HTTP'}},
                 {'name': 'элемент в середине',
                  'args': [[{'id': 1, 'title': 'HTTP'}, {'id': 4, 'title': 'Swagger'}, {'id': 8, 'title': 'Tests'}],
                           4],
                  'expected': {'id': 4, 'title': 'Swagger'}},
                 {'name': 'id отсутствует', 'args': [[{'id': 1, 'title': 'HTTP'}], 99], 'expected': None},
                 {'name': 'пустой список', 'args': [[], 1], 'expected': None}],
       'reference_code': 'def solve(tasks, task_id):\n'
                         '    for task in tasks:\n'
                         '        if task["id"] == task_id:\n'
                         '            return task.copy()\n'
                         '    return None\n'}],
 55: [{'title': 'Примените query-фильтр, сортировку и limit',
       'level': 'medium',
       'mode': 'solve',
       'prompt': 'Скопируйте подходящие задачи в новый список. Ограничьте limit диапазоном от 1 до 50 через min() и '
                 'max(). Отсортируйте результат по id: по возрастанию при sort_desc=False и по убыванию при True. '
                 'Верните первые safe_limit элементов. Исходный список менять нельзя.',
       'contract': {'given': 'Автопроверка вызывает solve(tasks, is_done, sort_desc, limit). Каждая задача содержит '
                             'id и is_done. is_done может быть True, False или None. Если фильтр равен None, нужно '
                             'оставить задачи обоих статусов.',
                    'todo': 'Скопируйте подходящие задачи в новый список. Ограничьте limit диапазоном от 1 до 50 '
                            'через min() и max(). Отсортируйте результат по id: по возрастанию при sort_desc=False и '
                            'по убыванию при True. Верните первые safe_limit элементов. Исходный список менять '
                            'нельзя.',
                    'check': 'Проверяются отсутствие фильтра, фильтр выполненных задач, оба направления сортировки и '
                             'значения limit вне допустимых границ. Сравнивается итоговый список словарей.'},
       'requirements': {'items': ['фильтр is_done', 'копии задач', 'limit от 1 до 50', 'сортировка по id'],
                        'names': ['tasks', 'is_done', 'sort_desc', 'limit', 'filtered', 'safe_limit', 'ordered'],
                        'nodes': ['FunctionDef', 'For', 'If'],
                        'calls': ['min', 'max', 'sorted'],
                        'attributes': ['copy', 'append']},
       'starter_code': 'def solve(tasks, is_done, sort_desc, limit):\n'
                       '    # Отфильтруйте копии задач\n'
                       '    # Ограничьте limit, отсортируйте и верните страницу\n'
                       '    pass\n',
       'tests': [{'name': 'без фильтра, первые две',
                  'args': [[{'id': 3, 'is_done': True}, {'id': 1, 'is_done': False}, {'id': 2, 'is_done': True}],
                           None,
                           False,
                           2],
                  'expected': [{'id': 1, 'is_done': False}, {'id': 2, 'is_done': True}]},
                 {'name': 'только выполненные по убыванию',
                  'args': [[{'id': 3, 'is_done': True}, {'id': 1, 'is_done': False}, {'id': 2, 'is_done': True}],
                           True,
                           True,
                           10],
                  'expected': [{'id': 3, 'is_done': True}, {'id': 2, 'is_done': True}]},
                 {'name': 'limit меньше единицы',
                  'args': [[{'id': 2, 'is_done': False}, {'id': 1, 'is_done': False}], False, False, 0],
                  'expected': [{'id': 1, 'is_done': False}]},
                 {'name': 'limit больше пятидесяти',
                  'args': [[{'id': 2, 'is_done': False}, {'id': 1, 'is_done': False}], None, False, 100],
                  'expected': [{'id': 1, 'is_done': False}, {'id': 2, 'is_done': False}]}],
       'reference_code': 'def solve(tasks, is_done, sort_desc, limit):\n'
                         '    filtered = []\n'
                         '    for task in tasks:\n'
                         '        if is_done is None or task["is_done"] == is_done:\n'
                         '            filtered.append(task.copy())\n'
                         '    safe_limit = min(max(limit, 1), 50)\n'
                         '    ordered = sorted(\n'
                         '        filtered,\n'
                         '        key=lambda item: item["id"],\n'
                         '        reverse=sort_desc,\n'
                         '    )\n'
                         '    return ordered[:safe_limit]\n'}],
 59: [{'title': 'Добавьте запись в in-memory storage',
       'level': 'medium',
       'mode': 'solve',
       'prompt': 'Создайте новый список из копий существующих задач. Найдите next_id: 1 для пустого списка или '
                 'максимальный существующий id плюс 1. Очистите title через strip(), создайте задачу с is_done=False '
                 'и добавьте её в новый список. Верните словарь с ключами created и items.',
       'contract': {'given': 'Автопроверка вызывает solve(tasks, title, priority). tasks — список словарей с ключами '
                             'id, title, priority, is_done. Идентификаторы могут идти с пропусками, список может '
                             'быть пустым.',
                    'todo': 'Создайте новый список из копий существующих задач. Найдите next_id: 1 для пустого '
                            'списка или максимальный существующий id плюс 1. Очистите title через strip(), создайте '
                            'задачу с is_done=False и добавьте её в новый список. Верните словарь с ключами created '
                            'и items.',
                    'check': 'Проверяются пустое хранилище, обычные id и пропуск id. Новый id должен зависеть от '
                             'максимального id, а исходный список не должен изменяться.'},
       'requirements': {'items': ['копии записей',
                                  'next_id по максимальному id',
                                  'title.strip()',
                                  'is_done=False',
                                  'created и items'],
                        'names': ['tasks', 'title', 'priority', 'updated', 'next_id', 'new_task'],
                        'nodes': ['FunctionDef', 'For', 'If'],
                        'attributes': ['copy', 'strip', 'append']},
       'starter_code': 'def solve(tasks, title, priority):\n'
                       '    # Скопируйте storage, найдите next_id и добавьте задачу\n'
                       '    pass\n',
       'tests': [{'name': 'пустое хранилище',
                  'args': [[], '  HTTP  ', 4],
                  'expected': {'created': {'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False},
                               'items': [{'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False}]}},
                 {'name': 'последовательные id',
                  'args': [[{'id': 1, 'title': 'HTTP', 'priority': 3, 'is_done': False}], 'FastAPI', 5],
                  'expected': {'created': {'id': 2, 'title': 'FastAPI', 'priority': 5, 'is_done': False},
                               'items': [{'id': 1, 'title': 'HTTP', 'priority': 3, 'is_done': False},
                                         {'id': 2, 'title': 'FastAPI', 'priority': 5, 'is_done': False}]}},
                 {'name': 'пропуск id',
                  'args': [[{'id': 2, 'title': 'HTTP', 'priority': 3, 'is_done': False},
                            {'id': 7, 'title': 'Tests', 'priority': 2, 'is_done': True}],
                           '  Swagger ',
                           1],
                  'expected': {'created': {'id': 8, 'title': 'Swagger', 'priority': 1, 'is_done': False},
                               'items': [{'id': 2, 'title': 'HTTP', 'priority': 3, 'is_done': False},
                                         {'id': 7, 'title': 'Tests', 'priority': 2, 'is_done': True},
                                         {'id': 8, 'title': 'Swagger', 'priority': 1, 'is_done': False}]}}],
       'reference_code': 'def solve(tasks, title, priority):\n'
                         '    updated = []\n'
                         '    next_id = 1\n'
                         '    for task in tasks:\n'
                         '        updated.append(task.copy())\n'
                         '        if task["id"] >= next_id:\n'
                         '            next_id = task["id"] + 1\n'
                         '    new_task = {\n'
                         '        "id": next_id,\n'
                         '        "title": title.strip(),\n'
                         '        "priority": priority,\n'
                         '        "is_done": False,\n'
                         '    }\n'
                         '    updated.append(new_task)\n'
                         '    return {"created": new_task, "items": updated}\n'}],
 60: [{'title': 'Соедините create, list и get',
       'level': 'medium',
       'mode': 'solve',
       'prompt': 'Скопируйте существующие задачи, вычислите следующий id и добавьте новую задачу с очищенным title и '
                 'is_done=False. Затем найдите lookup_id в обновлённом списке. Верните словарь с ключами created, '
                 'items, found. found — копия найденной задачи или None.',
       'contract': {'given': 'Автопроверка вызывает solve(tasks, title, priority, lookup_id). tasks — текущее '
                             'in-memory storage. Нужно создать одну задачу, получить итоговый список и найти в нём '
                             'задачу с id, равным lookup_id.',
                    'todo': 'Скопируйте существующие задачи, вычислите следующий id и добавьте новую задачу с '
                            'очищенным title и is_done=False. Затем найдите lookup_id в обновлённом списке. Верните '
                            'словарь с ключами created, items, found. found — копия найденной задачи или None.',
                    'check': 'Проверяется поиск новой задачи, поиск старой задачи и отсутствующий id. Сравнивается '
                             'весь результат, а исходный tasks не должен быть изменён.'},
       'requirements': {'items': ['create новой задачи', 'полный items', 'поиск lookup_id', 'None при отсутствии'],
                        'names': ['tasks', 'title', 'priority', 'lookup_id', 'items', 'next_id', 'created', 'found'],
                        'nodes': ['FunctionDef', 'For', 'If'],
                        'attributes': ['copy', 'strip', 'append']},
       'starter_code': 'def solve(tasks, title, priority, lookup_id):\n'
                       '    # CREATE: добавьте задачу\n'
                       '    # LIST: подготовьте items\n'
                       '    # GET: найдите lookup_id\n'
                       '    pass\n',
       'tests': [{'name': 'найдена новая задача',
                  'args': [[], '  HTTP  ', 4, 1],
                  'expected': {'created': {'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False},
                               'items': [{'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False}],
                               'found': {'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False}}},
                 {'name': 'найдена старая задача',
                  'args': [[{'id': 5, 'title': 'Swagger', 'priority': 2, 'is_done': True}], 'Tests', 3, 5],
                  'expected': {'created': {'id': 6, 'title': 'Tests', 'priority': 3, 'is_done': False},
                               'items': [{'id': 5, 'title': 'Swagger', 'priority': 2, 'is_done': True},
                                         {'id': 6, 'title': 'Tests', 'priority': 3, 'is_done': False}],
                               'found': {'id': 5, 'title': 'Swagger', 'priority': 2, 'is_done': True}}},
                 {'name': 'id отсутствует',
                  'args': [[{'id': 2, 'title': 'HTTP', 'priority': 1, 'is_done': False}], 'FastAPI', 5, 99],
                  'expected': {'created': {'id': 3, 'title': 'FastAPI', 'priority': 5, 'is_done': False},
                               'items': [{'id': 2, 'title': 'HTTP', 'priority': 1, 'is_done': False},
                                         {'id': 3, 'title': 'FastAPI', 'priority': 5, 'is_done': False}],
                               'found': None}}],
       'reference_code': 'def solve(tasks, title, priority, lookup_id):\n'
                         '    items = []\n'
                         '    next_id = 1\n'
                         '    for task in tasks:\n'
                         '        items.append(task.copy())\n'
                         '        if task["id"] >= next_id:\n'
                         '            next_id = task["id"] + 1\n'
                         '    created = {\n'
                         '        "id": next_id,\n'
                         '        "title": title.strip(),\n'
                         '        "priority": priority,\n'
                         '        "is_done": False,\n'
                         '    }\n'
                         '    items.append(created)\n'
                         '    found = None\n'
                         '    for task in items:\n'
                         '        if task["id"] == lookup_id:\n'
                         '            found = task.copy()\n'
                         '            break\n'
                         '    return {"created": created, "items": items, "found": found}\n'}],
 61: [{'title': 'Разделите PUT и PATCH',
       'level': 'medium',
       'mode': 'solve',
       'prompt': 'Для PUT создайте новый словарь только с id исходной задачи и тремя полями из payload. Это полная '
                 'замена: посторонние старые поля не сохраняются. Для PATCH создайте copy() исходной задачи и '
                 'измените только переданные разрешённые поля title, priority, is_done. Когда title передан, '
                 'очистите его через strip(). Верните итоговый словарь.',
       'contract': {'given': 'Автопроверка вызывает solve(task, method, payload). task — существующий словарь '
                             'задачи, method — PUT или PATCH, payload — словарь данных. Для PUT payload всегда '
                             'содержит title, priority и is_done. Для PATCH может содержать только часть полей.',
                    'todo': 'Для PUT создайте новый словарь только с id исходной задачи и тремя полями из payload. '
                            'Это полная замена: посторонние старые поля не сохраняются. Для PATCH создайте copy() '
                            'исходной задачи и измените только переданные разрешённые поля title, priority, is_done. '
                            'Когда title передан, очистите его через strip(). Верните итоговый словарь.',
                    'check': 'Проверяется, что PUT удаляет старое дополнительное поле, а PATCH сохраняет '
                             'непереданные значения. Также проверяются разные частичные payload.'},
       'requirements': {'items': ['отдельная ветка PUT',
                                  'copy() для PATCH',
                                  'только разрешённые поля',
                                  'strip() переданного title'],
                        'names': ['task', 'method', 'payload', 'updated', 'field', 'value'],
                        'nodes': ['FunctionDef', 'For', 'If'],
                        'attributes': ['copy', 'strip']},
       'starter_code': 'def solve(task, method, payload):\n'
                       '    # PUT: полная замена с сохранением id\n'
                       '    # PATCH: копия и изменение только переданных полей\n'
                       '    pass\n',
       'tests': [{'name': 'PUT удаляет старое поле',
                  'args': [{'id': 4, 'title': 'Old', 'priority': 1, 'is_done': False, 'note': 'legacy'},
                           'PUT',
                           {'title': '  New title  ', 'priority': 5, 'is_done': True}],
                  'expected': {'id': 4, 'title': 'New title', 'priority': 5, 'is_done': True}},
                 {'name': 'PATCH только title',
                  'args': [{'id': 2, 'title': 'Old', 'priority': 3, 'is_done': False, 'note': 'keep'},
                           'PATCH',
                           {'title': '  HTTP API  '}],
                  'expected': {'id': 2, 'title': 'HTTP API', 'priority': 3, 'is_done': False, 'note': 'keep'}},
                 {'name': 'PATCH только status',
                  'args': [{'id': 9, 'title': 'Tests', 'priority': 2, 'is_done': False}, 'PATCH', {'is_done': True}],
                  'expected': {'id': 9, 'title': 'Tests', 'priority': 2, 'is_done': True}},
                 {'name': 'PATCH пустой payload',
                  'args': [{'id': 1, 'title': 'FastAPI', 'priority': 4, 'is_done': False}, 'PATCH', {}],
                  'expected': {'id': 1, 'title': 'FastAPI', 'priority': 4, 'is_done': False}}],
       'reference_code': 'def solve(task, method, payload):\n'
                         '    if method == "PUT":\n'
                         '        return {\n'
                         '            "id": task["id"],\n'
                         '            "title": payload["title"].strip(),\n'
                         '            "priority": payload["priority"],\n'
                         '            "is_done": payload["is_done"],\n'
                         '        }\n'
                         '    updated = task.copy()\n'
                         '    for field in ("title", "priority", "is_done"):\n'
                         '        if field in payload:\n'
                         '            value = payload[field]\n'
                         '            if field == "title":\n'
                         '                value = value.strip()\n'
                         '            updated[field] = value\n'
                         '    return updated\n'}],
 62: [{'title': 'Удалите задачу и выберите status',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Создайте новый список remaining из копий всех задач, кроме задачи с task_id. Если задача найдена, '
                 'deleted=True и status=204. Если не найдена, deleted=False и status=404. Верните словарь с точными '
                 'ключами deleted, status, items.',
       'contract': {'given': 'Автопроверка вызывает solve(tasks, task_id). tasks — список словарей с ключом id. '
                             'Нужно смоделировать DELETE без FastAPI imports.',
                    'todo': 'Создайте новый список remaining из копий всех задач, кроме задачи с task_id. Если '
                            'задача найдена, deleted=True и status=204. Если не найдена, deleted=False и status=404. '
                            'Верните словарь с точными ключами deleted, status, items.',
                    'check': 'Проверяются удаление существующей записи, отсутствующий id и пустой список. Исходные '
                             'словари не должны использоваться в items напрямую: нужны copy().'},
       'requirements': {'items': ['новый список remaining', 'флаг deleted', '204 или 404', 'копии оставшихся задач'],
                        'names': ['tasks', 'task_id', 'remaining', 'deleted', 'status'],
                        'nodes': ['FunctionDef', 'For', 'If'],
                        'attributes': ['copy', 'append']},
       'starter_code': 'def solve(tasks, task_id):\n    # Соберите remaining и определите status\n    pass\n',
       'tests': [{'name': 'удаление найдено',
                  'args': [[{'id': 1, 'title': 'HTTP'}, {'id': 2, 'title': 'FastAPI'}], 1],
                  'expected': {'deleted': True, 'status': 204, 'items': [{'id': 2, 'title': 'FastAPI'}]}},
                 {'name': 'id отсутствует',
                  'args': [[{'id': 1, 'title': 'HTTP'}], 7],
                  'expected': {'deleted': False, 'status': 404, 'items': [{'id': 1, 'title': 'HTTP'}]}},
                 {'name': 'пустой список',
                  'args': [[], 1],
                  'expected': {'deleted': False, 'status': 404, 'items': []}}],
       'reference_code': 'def solve(tasks, task_id):\n'
                         '    remaining = []\n'
                         '    deleted = False\n'
                         '    for task in tasks:\n'
                         '        if task["id"] == task_id:\n'
                         '            deleted = True\n'
                         '        else:\n'
                         '            remaining.append(task.copy())\n'
                         '    status = 204 if deleted else 404\n'
                         '    return {"deleted": deleted, "status": status, "items": remaining}\n'}],
 67: [{'title': 'Выполните полную CRUD-цепочку',
       'level': 'medium',
       'mode': 'solve',
       'prompt': 'Работайте с копиями исходных задач и последовательно выполните operations. create содержит title и '
                 'priority: создайте задачу с новым id и is_done=False, результат status 201. get содержит id: '
                 'верните копию task и status 200 либо task=None и status 404. patch содержит id и data: измените '
                 'только title, priority, is_done; status 200 или 404. delete содержит id: удалите найденную задачу; '
                 'status 204 или 404. Для каждого действия добавьте результат в results, затем верните словарь items '
                 'и results.',
       'contract': {'given': 'Автопроверка вызывает solve(tasks, operations). tasks — начальный список задач. '
                             'operations — список словарей действий create, get, patch и delete. Форматы операций '
                             'полностью перечислены в условии.',
                    'todo': 'Работайте с копиями исходных задач и последовательно выполните operations. create '
                            'содержит title и priority: создайте задачу с новым id и is_done=False, результат status '
                            '201. get содержит id: верните копию task и status 200 либо task=None и status 404. '
                            'patch содержит id и data: измените только title, priority, is_done; status 200 или 404. '
                            'delete содержит id: удалите найденную задачу; status 204 или 404. Для каждого действия '
                            'добавьте результат в results, затем верните словарь items и results.',
                    'check': 'Проверяются создание с последующим чтением, частичное обновление и удаление, а также '
                             'операции с отсутствующим id. Сравнивается полный журнал results и финальный items.'},
       'requirements': {'items': ['копии исходного storage',
                                  'create/get/patch/delete',
                                  'status для каждого действия',
                                  'журнал results'],
                        'names': ['tasks', 'operations', 'items', 'results', 'operation', 'action'],
                        'nodes': ['FunctionDef', 'For', 'If'],
                        'calls': ['range', 'len'],
                        'attributes': ['copy', 'append', 'strip', 'pop']},
       'starter_code': 'def solve(tasks, operations):\n'
                       '    items = []\n'
                       '    results = []\n'
                       '    # Скопируйте storage и выполните операции по порядку\n'
                       '    pass\n',
       'tests': [{'name': 'create и get',
                  'args': [[],
                           [{'action': 'create', 'title': '  HTTP  ', 'priority': 4}, {'action': 'get', 'id': 1}]],
                  'expected': {'items': [{'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False}],
                               'results': [{'action': 'create', 'status': 201, 'id': 1},
                                           {'action': 'get',
                                            'status': 200,
                                            'task': {'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False}}]}},
                 {'name': 'patch и delete',
                  'args': [[{'id': 2, 'title': 'HTTP', 'priority': 2, 'is_done': False},
                            {'id': 5, 'title': 'Old', 'priority': 1, 'is_done': False}],
                           [{'action': 'patch', 'id': 5, 'data': {'title': '  FastAPI  ', 'is_done': True}},
                            {'action': 'delete', 'id': 2}]],
                  'expected': {'items': [{'id': 5, 'title': 'FastAPI', 'priority': 1, 'is_done': True}],
                               'results': [{'action': 'patch', 'status': 200, 'id': 5},
                                           {'action': 'delete', 'status': 204, 'id': 2}]}},
                 {'name': 'отсутствующие объекты',
                  'args': [[{'id': 1, 'title': 'HTTP', 'priority': 2, 'is_done': False}],
                           [{'action': 'get', 'id': 99},
                            {'action': 'patch', 'id': 99, 'data': {'priority': 5}},
                            {'action': 'delete', 'id': 99}]],
                  'expected': {'items': [{'id': 1, 'title': 'HTTP', 'priority': 2, 'is_done': False}],
                               'results': [{'action': 'get', 'status': 404, 'task': None},
                                           {'action': 'patch', 'status': 404, 'id': 99},
                                           {'action': 'delete', 'status': 404, 'id': 99}]}}],
       'reference_code': 'def solve(tasks, operations):\n'
                         '    items = []\n'
                         '    for task in tasks:\n'
                         '        items.append(task.copy())\n'
                         '    results = []\n'
                         '    for operation in operations:\n'
                         '        action = operation["action"]\n'
                         '        if action == "create":\n'
                         '            next_id = 1\n'
                         '            for task in items:\n'
                         '                if task["id"] >= next_id:\n'
                         '                    next_id = task["id"] + 1\n'
                         '            new_task = {\n'
                         '                "id": next_id,\n'
                         '                "title": operation["title"].strip(),\n'
                         '                "priority": operation["priority"],\n'
                         '                "is_done": False,\n'
                         '            }\n'
                         '            items.append(new_task)\n'
                         '            results.append({"action": "create", "status": 201, "id": next_id})\n'
                         '        elif action == "get":\n'
                         '            found = None\n'
                         '            for task in items:\n'
                         '                if task["id"] == operation["id"]:\n'
                         '                    found = task.copy()\n'
                         '                    break\n'
                         '            status = 200 if found is not None else 404\n'
                         '            results.append({"action": "get", "status": status, "task": found})\n'
                         '        elif action == "patch":\n'
                         '            found = False\n'
                         '            for task in items:\n'
                         '                if task["id"] == operation["id"]:\n'
                         '                    for field in ("title", "priority", "is_done"):\n'
                         '                        if field in operation["data"]:\n'
                         '                            value = operation["data"][field]\n'
                         '                            if field == "title":\n'
                         '                                value = value.strip()\n'
                         '                            task[field] = value\n'
                         '                    found = True\n'
                         '                    break\n'
                         '            status = 200 if found else 404\n'
                         '            results.append({"action": "patch", "status": status, "id": operation["id"]})\n'
                         '        elif action == "delete":\n'
                         '            delete_index = None\n'
                         '            for index in range(len(items)):\n'
                         '                if items[index]["id"] == operation["id"]:\n'
                         '                    delete_index = index\n'
                         '                    break\n'
                         '            if delete_index is None:\n'
                         '                status = 404\n'
                         '            else:\n'
                         '                items.pop(delete_index)\n'
                         '                status = 204\n'
                         '            results.append({"action": "delete", "status": status, "id": operation["id"]})\n'
                         '    return {"items": items, "results": results}\n'}]}

DATABASE_API_CODE_TASKS: dict[int, list[dict[str, Any]]] = {69: [{'title': 'Маршрут HTTP-запроса',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Создайте список steps и последовательно смоделируйте путь запроса. Всегда сначала добавьте '
                 'middleware_before и route_matching. Если route не найден, верните status 404 после '
                 'middleware_after. Если route найден, добавьте validation. При невалидных данных верните 422 после '
                 'middleware_after. При валидных данных добавьте dependencies. Если dependency завершилась ошибкой, '
                 'верните 403 после middleware_after. При успешной dependency добавьте endpoint, serialization и '
                 'middleware_after, затем верните status 200. Результат solve — словарь с ключами status и steps.',
       'contract': {'given': 'Автопроверка вызывает solve(route_found, input_valid, dependency_ok). Все три '
                             'аргумента имеют тип bool. Они описывают три последовательные проверки FastAPI: найден '
                             'ли route, прошла ли валидация входных данных и успешно ли выполнилась dependency.',
                    'todo': 'Создайте список steps и последовательно смоделируйте путь запроса. Всегда сначала '
                            'добавьте middleware_before и route_matching. Если route не найден, верните status 404 '
                            'после middleware_after. Если route найден, добавьте validation. При невалидных данных '
                            'верните 422 после middleware_after. При валидных данных добавьте dependencies. Если '
                            'dependency завершилась ошибкой, верните 403 после middleware_after. При успешной '
                            'dependency добавьте endpoint, serialization и middleware_after, затем верните status '
                            '200. Результат solve — словарь с ключами status и steps.',
                    'check': 'Платформа проверит четыре пути: неизвестный route, ошибка валидации, ошибка dependency '
                             'и успешный request. Сравниваются status и полный порядок steps. Этапы после возникшей '
                             'ошибки не должны выполняться.'},
       'requirements': {'items': ['список steps',
                                  'ветки 404, 422, 403 и 200',
                                  'ранний return после ошибки',
                                  'middleware_after в каждом результате'],
                        'names': ['route_found', 'input_valid', 'dependency_ok', 'steps'],
                        'nodes': ['FunctionDef', 'If'],
                        'attributes': ['append']},
       'starter_code': 'def solve(route_found, input_valid, dependency_ok):\n'
                       '    steps = []\n'
                       '    # Добавьте этапы в фактическом порядке\n'
                       '    # Верните словарь status и steps\n'
                       '    pass\n',
       'tests': [{'name': 'route не найден',
                  'args': [False, True, True],
                  'expected': {'status': 404, 'steps': ['middleware_before', 'route_matching', 'middleware_after']}},
                 {'name': 'ошибка валидации',
                  'args': [True, False, True],
                  'expected': {'status': 422,
                               'steps': ['middleware_before', 'route_matching', 'validation', 'middleware_after']}},
                 {'name': 'ошибка dependency',
                  'args': [True, True, False],
                  'expected': {'status': 403,
                               'steps': ['middleware_before',
                                         'route_matching',
                                         'validation',
                                         'dependencies',
                                         'middleware_after']}},
                 {'name': 'успешный request',
                  'args': [True, True, True],
                  'expected': {'status': 200,
                               'steps': ['middleware_before',
                                         'route_matching',
                                         'validation',
                                         'dependencies',
                                         'endpoint',
                                         'serialization',
                                         'middleware_after']}}],
       'reference_code': 'def solve(route_found, input_valid, dependency_ok):\n'
                         "    steps = ['middleware_before', 'route_matching']\n"
                         '    if not route_found:\n'
                         "        steps.append('middleware_after')\n"
                         "        return {'status': 404, 'steps': steps}\n"
                         "    steps.append('validation')\n"
                         '    if not input_valid:\n'
                         "        steps.append('middleware_after')\n"
                         "        return {'status': 422, 'steps': steps}\n"
                         "    steps.append('dependencies')\n"
                         '    if not dependency_ok:\n'
                         "        steps.append('middleware_after')\n"
                         "        return {'status': 403, 'steps': steps}\n"
                         "    steps.append('endpoint')\n"
                         "    steps.append('serialization')\n"
                         "    steps.append('middleware_after')\n"
                         "    return {'status': 200, 'steps': steps}\n"}],
 70: [{'title': 'Одна функция подготовки для двух обработчиков',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Создайте отдельную функцию get_client_name(headers, default_name). Она получает значение через '
                 'headers.get, убирает пробелы через strip и возвращает default_name, если результат пуст. В solve '
                 'вызовите get_client_name ровно как общий источник данных и верните словарь с двумя ключами: '
                 'profile и summary. Значение каждого ключа — словарь client_name с одинаковым подготовленным '
                 'именем.',
       'contract': {'given': 'Автопроверка вызывает solve(headers, default_name). headers — словарь HTTP-заголовков. '
                             'Имя клиента может находиться по ключу X-Client-Name. default_name — строка, которую '
                             'нужно использовать при отсутствующем или пустом заголовке.',
                    'todo': 'Создайте отдельную функцию get_client_name(headers, default_name). Она получает '
                            'значение через headers.get, убирает пробелы через strip и возвращает default_name, если '
                            'результат пуст. В solve вызовите get_client_name ровно как общий источник данных и '
                            'верните словарь с двумя ключами: profile и summary. Значение каждого ключа — словарь '
                            'client_name с одинаковым подготовленным именем.',
                    'check': 'Проверяются переданный заголовок, строка с пробелами, пустая строка и отсутствие '
                             'ключа. Сравнивается структура для двух условных endpoints. Также проверяется отдельная '
                             'функция get_client_name и её вызов из solve.'},
       'requirements': {'items': ['функция get_client_name',
                                  'headers.get',
                                  'очистка через strip',
                                  'один подготовленный результат для profile и summary'],
                        'names': ['headers', 'default_name', 'client_name'],
                        'nodes': ['FunctionDef', 'If'],
                        'calls': ['get_client_name'],
                        'attributes': ['get', 'strip']},
       'starter_code': 'def get_client_name(headers, default_name):\n'
                       '    # Прочитайте и очистите заголовок\n'
                       '    pass\n'
                       '\n'
                       '\n'
                       'def solve(headers, default_name):\n'
                       '    # Получите имя через get_client_name\n'
                       '    # Верните ответы profile и summary\n'
                       '    pass\n',
       'tests': [{'name': 'заголовок передан',
                  'args': [{'X-Client-Name': '  Nikita  '}, 'anonymous'],
                  'expected': {'profile': {'client_name': 'Nikita'}, 'summary': {'client_name': 'Nikita'}}},
                 {'name': 'пустой заголовок',
                  'args': [{'X-Client-Name': '   '}, 'anonymous'],
                  'expected': {'profile': {'client_name': 'anonymous'}, 'summary': {'client_name': 'anonymous'}}},
                 {'name': 'заголовок отсутствует',
                  'args': [{}, 'guest'],
                  'expected': {'profile': {'client_name': 'guest'}, 'summary': {'client_name': 'guest'}}}],
       'reference_code': 'def get_client_name(headers, default_name):\n'
                         "    raw_name = headers.get('X-Client-Name', '')\n"
                         '    clean_name = raw_name.strip()\n'
                         "    if clean_name == '':\n"
                         '        return default_name\n'
                         '    return clean_name\n'
                         '\n'
                         '\n'
                         'def solve(headers, default_name):\n'
                         '    client_name = get_client_name(headers, default_name)\n'
                         '    return {\n'
                         "        'profile': {'client_name': client_name},\n"
                         "        'summary': {'client_name': client_name},\n"
                         '    }\n'}],
 71: [{'title': 'Цепочка получения текущего клиента',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Создайте get_token(headers), которая возвращает token из строки Bearer token или None при другом '
                 'формате. Создайте get_current_client(token, clients), которая возвращает clients.get(token) или '
                 'None. В solve вызовите обе функции по порядку и верните словарь order и client. order всегда '
                 'должен содержать get_token, затем get_current_client.',
       'contract': {'given': 'Автопроверка вызывает solve(headers, clients). headers — словарь заголовков. '
                             'Authorization может иметь формат Bearer token. clients — словарь, где token является '
                             'ключом, а значение содержит данные клиента.',
                    'todo': 'Создайте get_token(headers), которая возвращает token из строки Bearer token или None '
                            'при другом формате. Создайте get_current_client(token, clients), которая возвращает '
                            'clients.get(token) или None. В solve вызовите обе функции по порядку и верните словарь '
                            'order и client. order всегда должен содержать get_token, затем get_current_client.',
                    'check': 'Проверяется корректный token, неизвестный token, отсутствующий header и неверная схема '
                             'Authorization. Сравниваются порядок цепочки и итоговый client. Автопроверка требует '
                             'вызовы обеих вспомогательных функций.'},
       'requirements': {'items': ['get_token',
                                  'get_current_client',
                                  'порядок двух dependencies',
                                  'None для отсутствующего клиента'],
                        'names': ['headers', 'clients', 'order', 'token', 'client'],
                        'nodes': ['FunctionDef', 'If'],
                        'calls': ['get_token', 'get_current_client', 'len'],
                        'attributes': ['get', 'split', 'append']},
       'starter_code': 'def get_token(headers):\n'
                       '    # Верните token или None\n'
                       '    pass\n'
                       '\n'
                       '\n'
                       'def get_current_client(token, clients):\n'
                       '    # Верните клиента или None\n'
                       '    pass\n'
                       '\n'
                       '\n'
                       'def solve(headers, clients):\n'
                       '    order = []\n'
                       '    # Вызовите dependencies по порядку\n'
                       '    pass\n',
       'tests': [{'name': 'клиент найден',
                  'args': [{'Authorization': 'Bearer token-1'}, {'token-1': {'id': 7, 'name': 'Nikita'}}],
                  'expected': {'order': ['get_token', 'get_current_client'], 'client': {'id': 7, 'name': 'Nikita'}}},
                 {'name': 'неизвестный token',
                  'args': [{'Authorization': 'Bearer missing'}, {'token-1': {'id': 7, 'name': 'Nikita'}}],
                  'expected': {'order': ['get_token', 'get_current_client'], 'client': None}},
                 {'name': 'header отсутствует',
                  'args': [{}, {'token-1': {'id': 7, 'name': 'Nikita'}}],
                  'expected': {'order': ['get_token', 'get_current_client'], 'client': None}},
                 {'name': 'неверная схема',
                  'args': [{'Authorization': 'Basic token-1'}, {'token-1': {'id': 7, 'name': 'Nikita'}}],
                  'expected': {'order': ['get_token', 'get_current_client'], 'client': None}}],
       'reference_code': 'def get_token(headers):\n'
                         "    authorization = headers.get('Authorization', '')\n"
                         '    parts = authorization.split()\n'
                         '    if len(parts) != 2:\n'
                         '        return None\n'
                         "    if parts[0] != 'Bearer':\n"
                         '        return None\n'
                         '    return parts[1]\n'
                         '\n'
                         '\n'
                         'def get_current_client(token, clients):\n'
                         '    return clients.get(token)\n'
                         '\n'
                         '\n'
                         'def solve(headers, clients):\n'
                         '    order = []\n'
                         "    order.append('get_token')\n"
                         '    token = get_token(headers)\n'
                         "    order.append('get_current_client')\n"
                         '    client = get_current_client(token, clients)\n'
                         "    return {'order': order, 'client': client}\n"}],
 72: [{'title': 'Безопасный preview настроек',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Создайте parse_debug(value). Она возвращает True для строк 1, true, yes, on без учёта регистра, '
                 'False для остальных строк и сохраняет готовые bool. В solve получите APP_NAME и DEBUG сначала из '
                 'env, затем из defaults. DATABASE_URL можно прочитать для внутренней конфигурации, но запрещено '
                 'возвращать его клиенту. Верните только словарь app_name и debug.',
       'contract': {'given': 'Автопроверка вызывает solve(env, defaults). Оба аргумента — словари. Возможные ключи: '
                             'APP_NAME, DEBUG и DATABASE_URL. Значения env должны иметь приоритет над defaults. '
                             'DEBUG может быть bool или строкой.',
                    'todo': 'Создайте parse_debug(value). Она возвращает True для строк 1, true, yes, on без учёта '
                            'регистра, False для остальных строк и сохраняет готовые bool. В solve получите APP_NAME '
                            'и DEBUG сначала из env, затем из defaults. DATABASE_URL можно прочитать для внутренней '
                            'конфигурации, но запрещено возвращать его клиенту. Верните только словарь app_name и '
                            'debug.',
                    'check': 'Проверяются значения по умолчанию, переопределение через env и разные записи DEBUG. В '
                             'результате не должно быть DATABASE_URL. Также проверяется отдельная функция '
                             'parse_debug.'},
       'requirements': {'items': ['функция parse_debug',
                                  'приоритет env',
                                  'преобразование DEBUG',
                                  'DATABASE_URL отсутствует в результате'],
                        'names': ['env', 'defaults', 'app_name', 'raw_debug', 'debug'],
                        'nodes': ['FunctionDef', 'If'],
                        'calls': ['parse_debug', 'str'],
                        'attributes': ['get', 'strip', 'lower']},
       'starter_code': 'def parse_debug(value):\n'
                       '    # Верните bool\n'
                       '    pass\n'
                       '\n'
                       '\n'
                       'def solve(env, defaults):\n'
                       '    # Примените приоритет env над defaults\n'
                       '    # Не возвращайте DATABASE_URL\n'
                       '    pass\n',
       'tests': [{'name': 'только defaults',
                  'args': [{}, {'APP_NAME': 'StudyHub', 'DEBUG': False, 'DATABASE_URL': 'sqlite:///default.db'}],
                  'expected': {'app_name': 'StudyHub', 'debug': False}},
                 {'name': 'env переопределяет значения',
                  'args': [{'APP_NAME': 'StudyHub Dev', 'DEBUG': 'yes', 'DATABASE_URL': 'sqlite:///secret.db'},
                           {'APP_NAME': 'StudyHub', 'DEBUG': False, 'DATABASE_URL': 'sqlite:///default.db'}],
                  'expected': {'app_name': 'StudyHub Dev', 'debug': True}},
                 {'name': 'строковый false',
                  'args': [{'DEBUG': 'off'},
                           {'APP_NAME': 'StudyHub', 'DEBUG': True, 'DATABASE_URL': 'sqlite:///default.db'}],
                  'expected': {'app_name': 'StudyHub', 'debug': False}}],
       'reference_code': 'def parse_debug(value):\n'
                         '    if value is True:\n'
                         '        return True\n'
                         '    if value is False:\n'
                         '        return False\n'
                         '    normalized = str(value).strip().lower()\n'
                         "    return normalized in ('1', 'true', 'yes', 'on')\n"
                         '\n'
                         '\n'
                         'def solve(env, defaults):\n'
                         "    app_name = env.get('APP_NAME', defaults.get('APP_NAME', 'StudyHub'))\n"
                         "    raw_debug = env.get('DEBUG', defaults.get('DEBUG', False))\n"
                         "    database_url = env.get('DATABASE_URL', defaults.get('DATABASE_URL', ''))\n"
                         '    debug = parse_debug(raw_debug)\n'
                         "    return {'app_name': app_name, 'debug': debug}\n"}],
 75: [{'title': 'Аудит временного хранилища',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Определите три свойства. persists равно True, если непустое состояние after_restart совпадает с '
                 'before_restart. shared_state равно True, если worker_a и worker_b видят одинаковые данные. '
                 'has_duplicates равно True, если после strip и lower встречаются одинаковые titles. Соберите '
                 'requirements: добавьте persistence, если persists равно False; shared_state, если shared_state '
                 'равно False; uniqueness, если has_duplicates равно True. Верните словарь с четырьмя ключами '
                 'persists, shared_state, has_duplicates и requirements.',
       'contract': {'given': 'Автопроверка вызывает solve(before_restart, after_restart, worker_a, worker_b, '
                             'titles). Первые четыре аргумента — списки идентификаторов задач. titles — список '
                             'заголовков, в котором могут быть дубликаты с разным регистром и пробелами.',
                    'todo': 'Определите три свойства. persists равно True, если непустое состояние after_restart '
                            'совпадает с before_restart. shared_state равно True, если worker_a и worker_b видят '
                            'одинаковые данные. has_duplicates равно True, если после strip и lower встречаются '
                            'одинаковые titles. Соберите requirements: добавьте persistence, если persists равно '
                            'False; shared_state, если shared_state равно False; uniqueness, если has_duplicates '
                            'равно True. Верните словарь с четырьмя ключами persists, shared_state, has_duplicates и '
                            'requirements.',
                    'check': 'Проверяются потеря данных после restart, расхождение двух workers, дубли и полностью '
                             'устойчивый сценарий. Порядок requirements должен быть persistence, shared_state, '
                             'uniqueness.'},
       'requirements': {'items': ['сравнение состояния до и после restart',
                                  'сравнение workers',
                                  'нормализация titles',
                                  'список requirements'],
                        'names': ['before_restart',
                                  'after_restart',
                                  'worker_a',
                                  'worker_b',
                                  'titles',
                                  'requirements'],
                        'nodes': ['FunctionDef', 'For', 'If'],
                        'calls': ['len', 'set'],
                        'attributes': ['append', 'strip', 'lower']},
       'starter_code': 'def solve(before_restart, after_restart, worker_a, worker_b, titles):\n'
                       '    requirements = []\n'
                       '    # Рассчитайте три свойства\n'
                       '    # Добавьте требования в установленном порядке\n'
                       '    pass\n',
       'tests': [{'name': 'все ограничения памяти',
                  'args': [[1, 2], [], [1, 2], [1], ['  README', 'readme  ']],
                  'expected': {'persists': False,
                               'shared_state': False,
                               'has_duplicates': True,
                               'requirements': ['persistence', 'shared_state', 'uniqueness']}},
                 {'name': 'только persistence',
                  'args': [[1], [], [1], [1], ['Код', 'README']],
                  'expected': {'persists': False,
                               'shared_state': True,
                               'has_duplicates': False,
                               'requirements': ['persistence']}},
                 {'name': 'устойчивый сценарий',
                  'args': [[1, 2], [1, 2], [1, 2], [1, 2], ['Код', 'README']],
                  'expected': {'persists': True, 'shared_state': True, 'has_duplicates': False, 'requirements': []}}],
       'reference_code': 'def solve(before_restart, after_restart, worker_a, worker_b, titles):\n'
                         '    persists = len(after_restart) > 0 and before_restart == after_restart\n'
                         '    shared_state = worker_a == worker_b\n'
                         '    normalized_titles = []\n'
                         '    for title in titles:\n'
                         '        normalized_titles.append(title.strip().lower())\n'
                         '    has_duplicates = len(set(normalized_titles)) != len(normalized_titles)\n'
                         '    requirements = []\n'
                         '    if not persists:\n'
                         "        requirements.append('persistence')\n"
                         '    if not shared_state:\n'
                         "        requirements.append('shared_state')\n"
                         '    if has_duplicates:\n'
                         "        requirements.append('uniqueness')\n"
                         '    return {\n'
                         "        'persists': persists,\n"
                         "        'shared_state': shared_state,\n"
                         "        'has_duplicates': has_duplicates,\n"
                         "        'requirements': requirements,\n"
                         '    }\n'}],
 79: [{'title': 'Состояния Session',
       'level': 'medium',
       'mode': 'solve',
       'prompt': 'Начальные значения: dirty=False, persisted=False, usable=True, closed=False, log=[]. add при '
                 'usable и незакрытой Session делает dirty=True и добавляет pending. commit при usable и dirty '
                 'делает persisted=True, dirty=False и добавляет committed. commit_error делает usable=False и '
                 'добавляет failed. refresh при usable и persisted добавляет refreshed. rollback делает usable=True, '
                 'dirty=False и добавляет rolled_back. close делает closed=True, usable=False и добавляет closed. '
                 'Операция add или commit при unusable либо closed добавляет blocked. Верните все пять состояний.',
       'contract': {'given': 'Автопроверка вызывает solve(events). events — список строк add, commit, commit_error, '
                             'refresh, rollback и close. Нужно смоделировать только учебный lifecycle, без '
                             'SQLAlchemy imports.',
                    'todo': 'Начальные значения: dirty=False, persisted=False, usable=True, closed=False, log=[]. '
                            'add при usable и незакрытой Session делает dirty=True и добавляет pending. commit при '
                            'usable и dirty делает persisted=True, dirty=False и добавляет committed. commit_error '
                            'делает usable=False и добавляет failed. refresh при usable и persisted добавляет '
                            'refreshed. rollback делает usable=True, dirty=False и добавляет rolled_back. close '
                            'делает closed=True, usable=False и добавляет closed. Операция add или commit при '
                            'unusable либо closed добавляет blocked. Верните все пять состояний.',
                    'check': 'Проверяется успешная transaction, ошибка с rollback и попытка продолжить работу без '
                             'rollback. Сравнивается полный log и итоговые flags.'},
       'requirements': {'items': ['обработка events циклом',
                                  'commit_error блокирует Session',
                                  'rollback восстанавливает Session',
                                  'close завершает lifecycle'],
                        'names': ['events', 'dirty', 'persisted', 'usable', 'closed', 'log'],
                        'nodes': ['FunctionDef', 'For', 'If'],
                        'attributes': ['append']},
       'starter_code': 'def solve(events):\n'
                       '    dirty = False\n'
                       '    persisted = False\n'
                       '    usable = True\n'
                       '    closed = False\n'
                       '    log = []\n'
                       '    # Обработайте events по порядку\n'
                       '    pass\n',
       'tests': [{'name': 'успешный lifecycle',
                  'args': [['add', 'commit', 'refresh', 'close']],
                  'expected': {'dirty': False,
                               'persisted': True,
                               'usable': False,
                               'closed': True,
                               'log': ['pending', 'committed', 'refreshed', 'closed']}},
                 {'name': 'ошибка и rollback',
                  'args': [['add', 'commit_error', 'rollback', 'add', 'commit', 'close']],
                  'expected': {'dirty': False,
                               'persisted': True,
                               'usable': False,
                               'closed': True,
                               'log': ['pending', 'failed', 'rolled_back', 'pending', 'committed', 'closed']}},
                 {'name': 'без rollback',
                  'args': [['add', 'commit_error', 'add', 'commit', 'close']],
                  'expected': {'dirty': True,
                               'persisted': False,
                               'usable': False,
                               'closed': True,
                               'log': ['pending', 'failed', 'blocked', 'blocked', 'closed']}}],
       'reference_code': 'def solve(events):\n'
                         '    dirty = False\n'
                         '    persisted = False\n'
                         '    usable = True\n'
                         '    closed = False\n'
                         '    log = []\n'
                         '    for event in events:\n'
                         "        if event == 'add':\n"
                         '            if usable and not closed:\n'
                         '                dirty = True\n'
                         "                log.append('pending')\n"
                         '            else:\n'
                         "                log.append('blocked')\n"
                         "        elif event == 'commit':\n"
                         '            if usable and not closed and dirty:\n'
                         '                persisted = True\n'
                         '                dirty = False\n'
                         "                log.append('committed')\n"
                         '            else:\n'
                         "                log.append('blocked')\n"
                         "        elif event == 'commit_error':\n"
                         '            usable = False\n'
                         "            log.append('failed')\n"
                         "        elif event == 'refresh':\n"
                         '            if usable and persisted and not closed:\n'
                         "                log.append('refreshed')\n"
                         '            else:\n'
                         "                log.append('blocked')\n"
                         "        elif event == 'rollback':\n"
                         '            usable = True\n'
                         '            dirty = False\n'
                         "            log.append('rolled_back')\n"
                         "        elif event == 'close':\n"
                         '            closed = True\n'
                         '            usable = False\n'
                         "            log.append('closed')\n"
                         '    return {\n'
                         "        'dirty': dirty,\n"
                         "        'persisted': persisted,\n"
                         "        'usable': usable,\n"
                         "        'closed': closed,\n"
                         "        'log': log,\n"
                         '    }\n'}]}

def get_code_tasks(track_id: str, filename: str) -> list[dict[str, Any]]:
    """Возвращает задачи редактора только для тем, проверяемых без доступа к ОС."""
    match = re.match(r"^(\d+)\s+-\s+", filename)
    if match is None:
        return []

    lesson_number = int(match.group(1))
    tasks_by_track = {
        FOUNDATIONS_TRACK: FOUNDATIONS_CODE_TASKS,
        DEEPER_TRACK: DEEPER_CODE_TASKS,
        PLANNER_API_TRACK: PLANNER_API_CODE_TASKS,
        DATABASE_API_TRACK: DATABASE_API_CODE_TASKS,
    }.get(track_id, {})
    return tasks_by_track.get(lesson_number, [])

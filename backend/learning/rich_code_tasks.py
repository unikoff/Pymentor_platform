"""Автопроверяемые задания для rich Python-курсов."""

from __future__ import annotations

import re
from typing import Any


FOUNDATIONS_TRACK = "Основы Python и мышление программиста"
DEEPER_TRACK = "Python глубже, файлы и структура небольшого проекта"
PLANNER_API_TRACK = "HTTP, API и FastAPI - Planner API"
DATABASE_API_TRACK = "FastAPI, SQLite и SQLAlchemy - StudyHub Database API"
PERSONAL_API_TRACK = "Аутентификация, сессии и токены - Personal StudyHub API"
POSTGRESQL_TRACK = "SQL, PostgreSQL и модели хранения - PostgreSQL StudyHub"
POSTGRESQL_TRACK_ALIASES = (
    POSTGRESQL_TRACK,
    "SQL, PostgreSQL и выбор хранилища - PostgreSQL StudyHub",
)
ASYNC_TRACK = "Асинхронность и производительность backend - Async StudyHub"
ASYNC_TRACK_ALIASES = (
    ASYNC_TRACK,
    "Асинхронность, FastAPI и Async SQLAlchemy - Async StudyHub",
    "Асинхронность и Async SQLAlchemy - Async StudyHub",
)
DEPLOY_TRACK = "Docker, CI/CD и первый стабильный деплой - Deployable StudyHub"
DEPLOY_TRACK_ALIASES = (
    DEPLOY_TRACK,
    "Docker, CI/CD и деплой - Deployable StudyHub",
    "Docker и CI/CD - Deployable StudyHub",
)


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

PERSONAL_API_CODE_TASKS: dict[int, list[dict[str, Any]]] = {93: [{'title': 'Три проверки доступа',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Верните словарь stage и status. Если user_id равен None, верните stage identification и status '
                 '401. Если credentials_valid равно False, верните stage authentication и status 401. Если '
                 'permission_granted равно False, верните stage authorization и status 403. Во всех остальных '
                 'случаях верните stage access и status 200. Проверки выполняйте именно в этом порядке.',
       'contract': {'given': 'Автопроверка вызывает solve(user_id, credentials_valid, permission_granted). user_id — '
                             'идентификатор пользователя или None. credentials_valid и permission_granted имеют тип '
                             'bool.',
                    'todo': 'Верните словарь stage и status. Если user_id равен None, верните stage identification и '
                            'status 401. Если credentials_valid равно False, верните stage authentication и status '
                            '401. Если permission_granted равно False, верните stage authorization и status 403. Во '
                            'всех остальных случаях верните stage access и status 200. Проверки выполняйте именно в '
                            'этом порядке.',
                    'check': 'Платформа проверит отсутствие личности, неверные credentials, недостаток права и '
                             'успешный доступ. Сравниваются оба поля результата. Сценарий без подтверждённой '
                             'личности не должен доходить до проверки разрешения.'},
       'requirements': {'items': ['проверка отсутствующего user_id',
                                  'отдельная проверка credentials',
                                  'отдельная проверка permission',
                                  'различие status 401 и 403'],
                        'names': ['user_id', 'credentials_valid', 'permission_granted'],
                        'nodes': ['FunctionDef', 'If']},
       'starter_code': 'def solve(user_id, credentials_valid, permission_granted):\n'
                       '    # Выполните три проверки по порядку\n'
                       '    pass\n',
       'tests': [{'name': 'личность не определена',
                  'args': [None, True, True],
                  'expected': {'stage': 'identification', 'status': 401}},
                 {'name': 'credentials неверны',
                  'args': [7, False, True],
                  'expected': {'stage': 'authentication', 'status': 401}},
                 {'name': 'право отсутствует',
                  'args': [7, True, False],
                  'expected': {'stage': 'authorization', 'status': 403}},
                 {'name': 'доступ разрешён',
                  'args': [7, True, True],
                  'expected': {'stage': 'access', 'status': 200}}],
       'reference_code': 'def solve(user_id, credentials_valid, permission_granted):\n'
                         '    if user_id is None:\n'
                         "        return {'stage': 'identification', 'status': 401}\n"
                         '    if not credentials_valid:\n'
                         "        return {'stage': 'authentication', 'status': 401}\n"
                         '    if not permission_granted:\n'
                         "        return {'stage': 'authorization', 'status': 403}\n"
                         "    return {'stage': 'access', 'status': 200}\n"}],
 94: [{'title': 'Сравнительная карта способов входа',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Для каждого method верните словарь transport, state и logout. Для http_basic: transport '
                 'Authorization: Basic, state credentials_each_request, logout client_forgets_credentials. Для '
                 'api_key: transport X-API-Key, state server_key_record, logout revoke_key. Для cookie_session: '
                 'transport Cookie: session_id, state server_session, logout revoke_session. Для jwt_access_refresh: '
                 'transport Authorization: Bearer, state access_token_and_refresh_record, logout revoke_refresh. Для '
                 'неизвестного method верните None.',
       'contract': {'given': 'Автопроверка вызывает solve(method). method принимает одно из четырёх значений: '
                             'http_basic, api_key, cookie_session или jwt_access_refresh.',
                    'todo': 'Для каждого method верните словарь transport, state и logout. Для http_basic: transport '
                            'Authorization: Basic, state credentials_each_request, logout '
                            'client_forgets_credentials. Для api_key: transport X-API-Key, state server_key_record, '
                            'logout revoke_key. Для cookie_session: transport Cookie: session_id, state '
                            'server_session, logout revoke_session. Для jwt_access_refresh: transport Authorization: '
                            'Bearer, state access_token_and_refresh_record, logout revoke_refresh. Для неизвестного '
                            'method верните None.',
                    'check': 'Платформа проверит все четыре способа и неизвестное значение. Сравнивается точная '
                             'карта свойств. Задание не выбирает один универсально лучший способ: оно фиксирует '
                             'различия транспорта, состояния и logout.'},
       'requirements': {'items': ['четыре явные ветки',
                                  'transport',
                                  'state',
                                  'logout',
                                  'None для неизвестного способа'],
                        'names': ['method'],
                        'nodes': ['FunctionDef', 'If']},
       'starter_code': 'def solve(method):\n    # Верните карту свойств выбранного способа\n    pass\n',
       'tests': [{'name': 'HTTP Basic',
                  'args': ['http_basic'],
                  'expected': {'transport': 'Authorization: Basic',
                               'state': 'credentials_each_request',
                               'logout': 'client_forgets_credentials'}},
                 {'name': 'API key',
                  'args': ['api_key'],
                  'expected': {'transport': 'X-API-Key', 'state': 'server_key_record', 'logout': 'revoke_key'}},
                 {'name': 'cookie session',
                  'args': ['cookie_session'],
                  'expected': {'transport': 'Cookie: session_id',
                               'state': 'server_session',
                               'logout': 'revoke_session'}},
                 {'name': 'JWT access и refresh',
                  'args': ['jwt_access_refresh'],
                  'expected': {'transport': 'Authorization: Bearer',
                               'state': 'access_token_and_refresh_record',
                               'logout': 'revoke_refresh'}},
                 {'name': 'неизвестный способ', 'args': ['magic_link'], 'expected': None}],
       'reference_code': 'def solve(method):\n'
                         "    if method == 'http_basic':\n"
                         '        return {\n'
                         "            'transport': 'Authorization: Basic',\n"
                         "            'state': 'credentials_each_request',\n"
                         "            'logout': 'client_forgets_credentials',\n"
                         '        }\n'
                         "    if method == 'api_key':\n"
                         '        return {\n'
                         "            'transport': 'X-API-Key',\n"
                         "            'state': 'server_key_record',\n"
                         "            'logout': 'revoke_key',\n"
                         '        }\n'
                         "    if method == 'cookie_session':\n"
                         '        return {\n'
                         "            'transport': 'Cookie: session_id',\n"
                         "            'state': 'server_session',\n"
                         "            'logout': 'revoke_session',\n"
                         '        }\n'
                         "    if method == 'jwt_access_refresh':\n"
                         '        return {\n'
                         "            'transport': 'Authorization: Bearer',\n"
                         "            'state': 'access_token_and_refresh_record',\n"
                         "            'logout': 'revoke_refresh',\n"
                         '        }\n'
                         '    return None\n'}],
 98: [{'title': 'Безопасная проверка credentials',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Если user равен None, password_matches равно False или user is_active равно False, верните None. '
                 'При успехе верните безопасный словарь только с ключами id, email и role. Не возвращайте '
                 'password_hash и не сообщайте наружу, какая именно проверка не прошла.',
       'contract': {'given': 'Автопроверка вызывает solve(user, password_matches). user равен None или словарю с '
                             'ключами id, email, password_hash, is_active и role. password_matches — результат '
                             'работы настоящего password service.',
                    'todo': 'Если user равен None, password_matches равно False или user is_active равно False, '
                            'верните None. При успехе верните безопасный словарь только с ключами id, email и role. '
                            'Не возвращайте password_hash и не сообщайте наружу, какая именно проверка не прошла.',
                    'check': 'Проверяются отсутствующий пользователь, неверный пароль, неактивный пользователь и '
                             'успешный вход. Все три ошибки должны возвращать одинаковый результат None. Успешный '
                             'ответ не должен содержать password_hash.'},
       'requirements': {'items': ['одинаковый результат для ошибок credentials',
                                  'проверка is_active',
                                  'безопасный словарь',
                                  'password_hash не возвращается'],
                        'names': ['user', 'password_matches'],
                        'nodes': ['FunctionDef', 'If']},
       'starter_code': 'def solve(user, password_matches):\n'
                       '    # Верните безопасные данные пользователя или None\n'
                       '    pass\n',
       'tests': [{'name': 'пользователь отсутствует', 'args': [None, False], 'expected': None},
                 {'name': 'пароль неверный',
                  'args': [{'id': 1,
                            'email': 'student@example.com',
                            'password_hash': 'stored-hash',
                            'is_active': True,
                            'role': 'user'},
                           False],
                  'expected': None},
                 {'name': 'пользователь неактивен',
                  'args': [{'id': 1,
                            'email': 'student@example.com',
                            'password_hash': 'stored-hash',
                            'is_active': False,
                            'role': 'user'},
                           True],
                  'expected': None},
                 {'name': 'успешная проверка',
                  'args': [{'id': 1,
                            'email': 'student@example.com',
                            'password_hash': 'stored-hash',
                            'is_active': True,
                            'role': 'user'},
                           True],
                  'expected': {'id': 1, 'email': 'student@example.com', 'role': 'user'}}],
       'reference_code': 'def solve(user, password_matches):\n'
                         '    if user is None:\n'
                         '        return None\n'
                         '    if not password_matches:\n'
                         '        return None\n'
                         "    if not user['is_active']:\n"
                         '        return None\n'
                         '    return {\n'
                         "        'id': user['id'],\n"
                         "        'email': user['email'],\n"
                         "        'role': user['role'],\n"
                         '    }\n'}],
 103: [{'title': 'Отзыв одной или всех sessions',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Найдите current session. Если она отсутствует, уже revoked или expires_at не больше now, верните '
                  'status 401, delete_cookie True и пустой revoked_ids. При logout_all=False отзовите только current '
                  'session. При logout_all=True отзовите все ещё активные sessions того же user_id. Верните status '
                  '204, delete_cookie True, revoked_ids в порядке списка и обновлённый sessions.',
        'contract': {'given': 'Автопроверка вызывает solve(sessions, current_session_id, now, logout_all). sessions '
                              '— список словарей id, user_id, expires_at и revoked. now — текущее целое время, '
                              'logout_all — bool.',
                     'todo': 'Найдите current session. Если она отсутствует, уже revoked или expires_at не больше '
                             'now, верните status 401, delete_cookie True и пустой revoked_ids. При logout_all=False '
                             'отзовите только current session. При logout_all=True отзовите все ещё активные '
                             'sessions того же user_id. Верните status 204, delete_cookie True, revoked_ids в '
                             'порядке списка и обновлённый sessions.',
                     'check': 'Проверяется logout одного устройства, logout всех устройств, просроченная session и '
                              'неизвестный session id. Сравнивается полный список отозванных id и новые значения '
                              'revoked.'},
        'requirements': {'items': ['поиск current session',
                                   'проверка expiration и revoked',
                                   'logout одного устройства',
                                   'logout всех устройств пользователя'],
                         'names': ['sessions', 'current_session_id', 'now', 'logout_all'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['append']},
        'starter_code': 'def solve(sessions, current_session_id, now, logout_all):\n'
                        '    # Найдите текущую session\n'
                        '    # Отзовите одну или все sessions пользователя\n'
                        '    pass\n',
        'tests': [{'name': 'logout одного устройства',
                   'args': [[{'id': 's1', 'user_id': 7, 'expires_at': 200, 'revoked': False},
                             {'id': 's2', 'user_id': 7, 'expires_at': 200, 'revoked': False},
                             {'id': 's3', 'user_id': 8, 'expires_at': 200, 'revoked': False}],
                            's1',
                            100,
                            False],
                   'expected': {'status': 204,
                                'delete_cookie': True,
                                'revoked_ids': ['s1'],
                                'sessions': [{'id': 's1', 'user_id': 7, 'expires_at': 200, 'revoked': True},
                                             {'id': 's2', 'user_id': 7, 'expires_at': 200, 'revoked': False},
                                             {'id': 's3', 'user_id': 8, 'expires_at': 200, 'revoked': False}]}},
                  {'name': 'logout всех устройств',
                   'args': [[{'id': 's1', 'user_id': 7, 'expires_at': 200, 'revoked': False},
                             {'id': 's2', 'user_id': 7, 'expires_at': 200, 'revoked': False},
                             {'id': 's3', 'user_id': 8, 'expires_at': 200, 'revoked': False}],
                            's1',
                            100,
                            True],
                   'expected': {'status': 204,
                                'delete_cookie': True,
                                'revoked_ids': ['s1', 's2'],
                                'sessions': [{'id': 's1', 'user_id': 7, 'expires_at': 200, 'revoked': True},
                                             {'id': 's2', 'user_id': 7, 'expires_at': 200, 'revoked': True},
                                             {'id': 's3', 'user_id': 8, 'expires_at': 200, 'revoked': False}]}},
                  {'name': 'session просрочена',
                   'args': [[{'id': 's1', 'user_id': 7, 'expires_at': 100, 'revoked': False}], 's1', 100, False],
                   'expected': {'status': 401, 'delete_cookie': True, 'revoked_ids': []}},
                  {'name': 'session не найдена',
                   'args': [[{'id': 's1', 'user_id': 7, 'expires_at': 200, 'revoked': False}], 'missing', 100, False],
                   'expected': {'status': 401, 'delete_cookie': True, 'revoked_ids': []}}],
        'reference_code': 'def solve(sessions, current_session_id, now, logout_all):\n'
                          '    current = None\n'
                          '    for session in sessions:\n'
                          "        if session['id'] == current_session_id:\n"
                          '            current = session\n'
                          '            break\n'
                          '    if current is None:\n'
                          "        return {'status': 401, 'delete_cookie': True, 'revoked_ids': []}\n"
                          "    if current['revoked'] or current['expires_at'] <= now:\n"
                          "        return {'status': 401, 'delete_cookie': True, 'revoked_ids': []}\n"
                          '    revoked_ids = []\n'
                          '    for session in sessions:\n'
                          "        same_user = session['user_id'] == current['user_id']\n"
                          "        should_revoke = session['id'] == current_session_id\n"
                          '        if logout_all and same_user:\n'
                          '            should_revoke = True\n'
                          "        if should_revoke and not session['revoked']:\n"
                          "            session['revoked'] = True\n"
                          "            revoked_ids.append(session['id'])\n"
                          '    return {\n'
                          "        'status': 204,\n"
                          "        'delete_cookie': True,\n"
                          "        'revoked_ids': revoked_ids,\n"
                          "        'sessions': sessions,\n"
                          '    }\n'}],
 104: [{'title': 'Изоляция задач по владельцу',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Для action list верните status 200 и ids только задач current_user_id в исходном порядке. Для get '
                  'и update найдите задачу одновременно по id и user_id; при успехе верните status 200 и её id. Для '
                  'delete при успехе верните status 204 и её id. Если задача не принадлежит current user или '
                  'отсутствует, верните status 404 и id None. Не возвращайте 403 для чужой задачи: этот контракт не '
                  'раскрывает существование чужого id.',
        'contract': {'given': 'Автопроверка вызывает solve(tasks, current_user_id, action, task_id). tasks — список '
                              'словарей id, user_id и title. action равен list, get, update или delete. Для list '
                              'значение task_id равно None.',
                     'todo': 'Для action list верните status 200 и ids только задач current_user_id в исходном '
                             'порядке. Для get и update найдите задачу одновременно по id и user_id; при успехе '
                             'верните status 200 и её id. Для delete при успехе верните status 204 и её id. Если '
                             'задача не принадлежит current user или отсутствует, верните status 404 и id None. Не '
                             'возвращайте 403 для чужой задачи: этот контракт не раскрывает существование чужого id.',
                     'check': 'Проверяется список двух пользователей, собственная задача, чужая задача и неизвестный '
                              'id. Сравниваются status и ids либо id.'},
        'requirements': {'items': ['фильтрация list по current_user_id',
                                   'поиск одновременно по id и user_id',
                                   '404 для чужого id',
                                   '204 для успешного delete'],
                         'names': ['tasks', 'current_user_id', 'action', 'task_id'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['append']},
        'starter_code': 'def solve(tasks, current_user_id, action, task_id):\n'
                        '    # Ограничьте данные владельцем\n'
                        '    pass\n',
        'tests': [{'name': 'список только своих задач',
                   'args': [[{'id': 1, 'user_id': 7, 'title': 'Python'},
                             {'id': 2, 'user_id': 8, 'title': 'Чужая'},
                             {'id': 3, 'user_id': 7, 'title': 'README'}],
                            7,
                            'list',
                            None],
                   'expected': {'status': 200, 'ids': [1, 3]}},
                  {'name': 'собственная задача',
                   'args': [[{'id': 1, 'user_id': 7, 'title': 'Python'}, {'id': 2, 'user_id': 8, 'title': 'Чужая'}],
                            7,
                            'update',
                            1],
                   'expected': {'status': 200, 'id': 1}},
                  {'name': 'чужая задача скрыта',
                   'args': [[{'id': 1, 'user_id': 7, 'title': 'Python'}, {'id': 2, 'user_id': 8, 'title': 'Чужая'}],
                            7,
                            'delete',
                            2],
                   'expected': {'status': 404, 'id': None}},
                  {'name': 'собственная задача удаляется',
                   'args': [[{'id': 1, 'user_id': 7, 'title': 'Python'}], 7, 'delete', 1],
                   'expected': {'status': 204, 'id': 1}},
                  {'name': 'id отсутствует',
                   'args': [[{'id': 1, 'user_id': 7, 'title': 'Python'}], 7, 'get', 99],
                   'expected': {'status': 404, 'id': None}}],
        'reference_code': 'def solve(tasks, current_user_id, action, task_id):\n'
                          "    if action == 'list':\n"
                          '        ids = []\n'
                          '        for task in tasks:\n'
                          "            if task['user_id'] == current_user_id:\n"
                          "                ids.append(task['id'])\n"
                          "        return {'status': 200, 'ids': ids}\n"
                          '    for task in tasks:\n'
                          "        same_id = task['id'] == task_id\n"
                          "        same_owner = task['user_id'] == current_user_id\n"
                          '        if same_id and same_owner:\n'
                          "            if action == 'delete':\n"
                          "                return {'status': 204, 'id': task['id']}\n"
                          "            return {'status': 200, 'id': task['id']}\n"
                          "    return {'status': 404, 'id': None}\n"}],
 106: [{'title': 'Claims access token',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Создайте claims с ключами sub, type, iat и exp. sub должен быть строкой user_id, type равен '
                  'access, iat равен issued_at, exp равен issued_at + ttl_seconds. valid равно True только когда '
                  'issued_at не больше now и now строго меньше exp. Верните словарь claims и valid.',
        'contract': {'given': 'Автопроверка вызывает solve(user_id, issued_at, ttl_seconds, now). Все значения '
                              'времени — целые секунды. Задание моделирует только claims; подпись JWT должна '
                              'выполняться готовой библиотекой в проектной практике.',
                     'todo': 'Создайте claims с ключами sub, type, iat и exp. sub должен быть строкой user_id, type '
                             'равен access, iat равен issued_at, exp равен issued_at + ttl_seconds. valid равно True '
                             'только когда issued_at не больше now и now строго меньше exp. Верните словарь claims и '
                             'valid.',
                     'check': 'Проверяется действующий token, точная граница expiration и время раньше iat. '
                              'Сравниваются claims и valid. Задание не реализует собственную подпись и не выдаёт '
                              'этот словарь за готовый JWT.'},
        'requirements': {'items': ['sub как строка', 'type access', 'iat и exp', 'строгая проверка expiration'],
                         'names': ['user_id', 'issued_at', 'ttl_seconds', 'now', 'claims', 'valid'],
                         'nodes': ['FunctionDef', 'BoolOp'],
                         'calls': ['str']},
        'starter_code': 'def solve(user_id, issued_at, ttl_seconds, now):\n'
                        '    # Соберите claims и вычислите valid\n'
                        '    pass\n',
        'tests': [{'name': 'token действует',
                   'args': [7, 1000, 300, 1200],
                   'expected': {'claims': {'sub': '7', 'type': 'access', 'iat': 1000, 'exp': 1300}, 'valid': True}},
                  {'name': 'token истёк на границе',
                   'args': [7, 1000, 300, 1300],
                   'expected': {'claims': {'sub': '7', 'type': 'access', 'iat': 1000, 'exp': 1300}, 'valid': False}},
                  {'name': 'token ещё не выпущен',
                   'args': [12, 2000, 60, 1999],
                   'expected': {'claims': {'sub': '12', 'type': 'access', 'iat': 2000, 'exp': 2060},
                                'valid': False}}],
        'reference_code': 'def solve(user_id, issued_at, ttl_seconds, now):\n'
                          '    claims = {\n'
                          "        'sub': str(user_id),\n"
                          "        'type': 'access',\n"
                          "        'iat': issued_at,\n"
                          "        'exp': issued_at + ttl_seconds,\n"
                          '    }\n'
                          "    valid = issued_at <= now and now < claims['exp']\n"
                          "    return {'claims': claims, 'valid': valid}\n"}],
 109: [{'title': 'Rotation и повторное использование refresh token',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Найдите record по presented_jti. Если record отсутствует, верните status 401, reuse_detected '
                  'False и пустой revoked_ids. Если token истёк, отзовите его и верните 401. Если token уже revoked '
                  'и replaced_by не равен None, считайте это повторным использованием: отзовите все ещё активные '
                  'records того же user_id и верните reuse_detected True. Если token действующий, отзовите его, '
                  'запишите replaced_by=new_jti, добавьте новый active record с тем же user_id и new_expires_at, '
                  'затем верните status 200 и issued_jti.',
        'contract': {'given': 'Автопроверка вызывает solve(records, presented_jti, now, new_jti, new_expires_at). '
                              'records — список словарей jti, user_id, expires_at, revoked и replaced_by.',
                     'todo': 'Найдите record по presented_jti. Если record отсутствует, верните status 401, '
                             'reuse_detected False и пустой revoked_ids. Если token истёк, отзовите его и верните '
                             '401. Если token уже revoked и replaced_by не равен None, считайте это повторным '
                             'использованием: отзовите все ещё активные records того же user_id и верните '
                             'reuse_detected True. Если token действующий, отзовите его, запишите '
                             'replaced_by=new_jti, добавьте новый active record с тем же user_id и new_expires_at, '
                             'затем верните status 200 и issued_jti.',
                     'check': 'Проверяется обычная rotation, reuse старого token, expired token и неизвестный jti. '
                              'Сравниваются изменённые records, revoked_ids и issued_jti. Порядок records '
                              'сохраняется, новый record добавляется в конец.'},
        'requirements': {'items': ['поиск presented_jti',
                                   'expiration',
                                   'rotation с replaced_by',
                                   'reuse detection',
                                   'отзыв token family'],
                         'names': ['records', 'presented_jti', 'now', 'new_jti', 'new_expires_at'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['append']},
        'starter_code': 'def solve(records, presented_jti, now, new_jti, new_expires_at):\n'
                        '    # Реализуйте rotation и reuse detection\n'
                        '    pass\n',
        'tests': [{'name': 'обычная rotation',
                   'args': [[{'jti': 'r1', 'user_id': 7, 'expires_at': 500, 'revoked': False, 'replaced_by': None}],
                            'r1',
                            100,
                            'r2',
                            600],
                   'expected': {'status': 200,
                                'reuse_detected': False,
                                'revoked_ids': ['r1'],
                                'issued_jti': 'r2',
                                'records': [{'jti': 'r1',
                                             'user_id': 7,
                                             'expires_at': 500,
                                             'revoked': True,
                                             'replaced_by': 'r2'},
                                            {'jti': 'r2',
                                             'user_id': 7,
                                             'expires_at': 600,
                                             'revoked': False,
                                             'replaced_by': None}]}},
                  {'name': 'reuse старого token',
                   'args': [[{'jti': 'r1', 'user_id': 7, 'expires_at': 500, 'revoked': True, 'replaced_by': 'r2'},
                             {'jti': 'r2', 'user_id': 7, 'expires_at': 600, 'revoked': False, 'replaced_by': None},
                             {'jti': 'x1', 'user_id': 8, 'expires_at': 600, 'revoked': False, 'replaced_by': None}],
                            'r1',
                            200,
                            'r3',
                            700],
                   'expected': {'status': 401,
                                'reuse_detected': True,
                                'revoked_ids': ['r2'],
                                'issued_jti': None,
                                'records': [{'jti': 'r1',
                                             'user_id': 7,
                                             'expires_at': 500,
                                             'revoked': True,
                                             'replaced_by': 'r2'},
                                            {'jti': 'r2',
                                             'user_id': 7,
                                             'expires_at': 600,
                                             'revoked': True,
                                             'replaced_by': None},
                                            {'jti': 'x1',
                                             'user_id': 8,
                                             'expires_at': 600,
                                             'revoked': False,
                                             'replaced_by': None}]}},
                  {'name': 'refresh истёк',
                   'args': [[{'jti': 'r1', 'user_id': 7, 'expires_at': 100, 'revoked': False, 'replaced_by': None}],
                            'r1',
                            100,
                            'r2',
                            600],
                   'expected': {'status': 401,
                                'reuse_detected': False,
                                'revoked_ids': ['r1'],
                                'issued_jti': None,
                                'records': [{'jti': 'r1',
                                             'user_id': 7,
                                             'expires_at': 100,
                                             'revoked': True,
                                             'replaced_by': None}]}},
                  {'name': 'jti отсутствует',
                   'args': [[], 'missing', 100, 'r2', 600],
                   'expected': {'status': 401, 'reuse_detected': False, 'revoked_ids': [], 'issued_jti': None}}],
        'reference_code': 'def solve(records, presented_jti, now, new_jti, new_expires_at):\n'
                          '    current = None\n'
                          '    for record in records:\n'
                          "        if record['jti'] == presented_jti:\n"
                          '            current = record\n'
                          '            break\n'
                          '    if current is None:\n'
                          '        return {\n'
                          "            'status': 401,\n"
                          "            'reuse_detected': False,\n"
                          "            'revoked_ids': [],\n"
                          "            'issued_jti': None,\n"
                          '        }\n'
                          "    if current['expires_at'] <= now:\n"
                          "        current['revoked'] = True\n"
                          '        return {\n'
                          "            'status': 401,\n"
                          "            'reuse_detected': False,\n"
                          "            'revoked_ids': [current['jti']],\n"
                          "            'issued_jti': None,\n"
                          "            'records': records,\n"
                          '        }\n'
                          "    if current['revoked']:\n"
                          '        revoked_ids = []\n'
                          "        reuse_detected = current['replaced_by'] is not None\n"
                          '        if reuse_detected:\n'
                          '            for record in records:\n'
                          "                same_user = record['user_id'] == current['user_id']\n"
                          "                if same_user and not record['revoked']:\n"
                          "                    record['revoked'] = True\n"
                          "                    revoked_ids.append(record['jti'])\n"
                          '        return {\n'
                          "            'status': 401,\n"
                          "            'reuse_detected': reuse_detected,\n"
                          "            'revoked_ids': revoked_ids,\n"
                          "            'issued_jti': None,\n"
                          "            'records': records,\n"
                          '        }\n'
                          "    current['revoked'] = True\n"
                          "    current['replaced_by'] = new_jti\n"
                          '    new_record = {\n'
                          "        'jti': new_jti,\n"
                          "        'user_id': current['user_id'],\n"
                          "        'expires_at': new_expires_at,\n"
                          "        'revoked': False,\n"
                          "        'replaced_by': None,\n"
                          '    }\n'
                          '    records.append(new_record)\n'
                          '    return {\n'
                          "        'status': 200,\n"
                          "        'reuse_detected': False,\n"
                          "        'revoked_ids': [current['jti']],\n"
                          "        'issued_jti': new_jti,\n"
                          "        'records': records,\n"
                          '    }\n'}],
 110: [{'title': 'Решение 401, 403 или доступ',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Если user равен None или user is_active равно False, верните status 401 и decision '
                  'unauthenticated. Активный admin получает status 200 для любого известного action. Активный user '
                  'может выполнить create_task без resource. Для read_task, update_task и delete_task сначала '
                  'верните 404, если resource равен None. Владелец resource получает 200, другой пользователь '
                  'получает 403. Для admin_users обычный user получает 403. Неизвестный action также возвращает 403.',
        'contract': {'given': 'Автопроверка вызывает solve(user, resource, action). user равен None или словарю id, '
                              'role и is_active. resource равен None или словарю id и user_id. action равен '
                              'create_task, read_task, update_task, delete_task или admin_users.',
                     'todo': 'Если user равен None или user is_active равно False, верните status 401 и decision '
                             'unauthenticated. Активный admin получает status 200 для любого известного action. '
                             'Активный user может выполнить create_task без resource. Для read_task, update_task и '
                             'delete_task сначала верните 404, если resource равен None. Владелец resource получает '
                             '200, другой пользователь получает 403. Для admin_users обычный user получает 403. '
                             'Неизвестный action также возвращает 403.',
                     'check': 'Проверяется отсутствие личности, неактивный пользователь, owner, чужой resource, '
                              'admin и admin-only endpoint. Сравниваются status и decision.'},
        'requirements': {'items': ['401 без активной личности',
                                   'admin bypass',
                                   'owner check',
                                   '403 при отсутствии права',
                                   '404 при отсутствующем resource'],
                         'names': ['user', 'resource', 'action', 'known_actions'],
                         'nodes': ['FunctionDef', 'If', 'BoolOp']},
        'starter_code': 'def solve(user, resource, action):\n    # Верните status и decision\n    pass\n',
        'tests': [{'name': 'нет пользователя',
                   'args': [None, None, 'create_task'],
                   'expected': {'status': 401, 'decision': 'unauthenticated'}},
                  {'name': 'неактивный пользователь',
                   'args': [{'id': 7, 'role': 'user', 'is_active': False}, None, 'create_task'],
                   'expected': {'status': 401, 'decision': 'unauthenticated'}},
                  {'name': 'создание своей будущей задачи',
                   'args': [{'id': 7, 'role': 'user', 'is_active': True}, None, 'create_task'],
                   'expected': {'status': 200, 'decision': 'allowed'}},
                  {'name': 'владелец обновляет задачу',
                   'args': [{'id': 7, 'role': 'user', 'is_active': True}, {'id': 4, 'user_id': 7}, 'update_task'],
                   'expected': {'status': 200, 'decision': 'owner'}},
                  {'name': 'чужая задача',
                   'args': [{'id': 7, 'role': 'user', 'is_active': True}, {'id': 4, 'user_id': 8}, 'delete_task'],
                   'expected': {'status': 403, 'decision': 'forbidden'}},
                  {'name': 'resource отсутствует',
                   'args': [{'id': 7, 'role': 'user', 'is_active': True}, None, 'read_task'],
                   'expected': {'status': 404, 'decision': 'not_found'}},
                  {'name': 'обычный user в admin endpoint',
                   'args': [{'id': 7, 'role': 'user', 'is_active': True}, None, 'admin_users'],
                   'expected': {'status': 403, 'decision': 'forbidden'}},
                  {'name': 'admin',
                   'args': [{'id': 1, 'role': 'admin', 'is_active': True}, {'id': 4, 'user_id': 8}, 'delete_task'],
                   'expected': {'status': 200, 'decision': 'admin'}}],
        'reference_code': 'def solve(user, resource, action):\n'
                          "    if user is None or not user['is_active']:\n"
                          "        return {'status': 401, 'decision': 'unauthenticated'}\n"
                          '    known_actions = (\n'
                          "        'create_task',\n"
                          "        'read_task',\n"
                          "        'update_task',\n"
                          "        'delete_task',\n"
                          "        'admin_users',\n"
                          '    )\n'
                          '    if action not in known_actions:\n'
                          "        return {'status': 403, 'decision': 'forbidden'}\n"
                          "    if user['role'] == 'admin':\n"
                          "        return {'status': 200, 'decision': 'admin'}\n"
                          "    if action == 'create_task':\n"
                          "        return {'status': 200, 'decision': 'allowed'}\n"
                          "    if action == 'admin_users':\n"
                          "        return {'status': 403, 'decision': 'forbidden'}\n"
                          '    if resource is None:\n'
                          "        return {'status': 404, 'decision': 'not_found'}\n"
                          "    if resource['user_id'] == user['id']:\n"
                          "        return {'status': 200, 'decision': 'owner'}\n"
                          "    return {'status': 403, 'decision': 'forbidden'}\n"}]}

POSTGRESQL_CODE_TASKS: dict[int, list[dict[str, Any]]] = {117: [{'title': 'Сопоставление ORM-полей и колонок',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Сравните поля по имени. Верните словарь matched и differences. В matched добавляйте имена, для '
                  'которых type и nullable совпадают. В differences добавляйте словари field и problem. problem '
                  'равен missing_column, если колонки нет; type_mismatch, если отличается type; nullable_mismatch, '
                  'если отличается nullable. Сохраняйте порядок model_fields.',
        'contract': {'given': 'Автопроверка вызывает solve(model_fields, table_columns). Оба аргумента — списки '
                              'словарей с ключами name, type и nullable. model_fields описывает ORM-модель, '
                              'table_columns — фактическую таблицу.',
                     'todo': 'Сравните поля по имени. Верните словарь matched и differences. В matched добавляйте '
                             'имена, для которых type и nullable совпадают. В differences добавляйте словари field и '
                             'problem. problem равен missing_column, если колонки нет; type_mismatch, если '
                             'отличается type; nullable_mismatch, если отличается nullable. Сохраняйте порядок '
                             'model_fields.',
                     'check': 'Платформа проверит полное совпадение, отсутствующую колонку и два вида несовпадений. '
                              'Сравниваются порядок matched и точные словари differences.'},
        'requirements': {'items': ['индекс колонок по name',
                                   'проверка missing_column',
                                   'проверка type_mismatch',
                                   'проверка nullable_mismatch'],
                         'names': ['model_fields', 'table_columns', 'matched', 'differences'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['get', 'append']},
        'starter_code': 'def solve(model_fields, table_columns):\n'
                        '    matched = []\n'
                        '    differences = []\n'
                        '    # Сопоставьте ORM-поля и колонки\n'
                        '    pass\n',
        'tests': [{'name': 'полное совпадение',
                   'args': [[{'name': 'id', 'type': 'INTEGER', 'nullable': False},
                             {'name': 'title', 'type': 'VARCHAR', 'nullable': False}],
                            [{'name': 'id', 'type': 'INTEGER', 'nullable': False},
                             {'name': 'title', 'type': 'VARCHAR', 'nullable': False}]],
                   'expected': {'matched': ['id', 'title'], 'differences': []}},
                  {'name': 'отсутствующая колонка',
                   'args': [[{'name': 'id', 'type': 'INTEGER', 'nullable': False},
                             {'name': 'priority', 'type': 'INTEGER', 'nullable': False}],
                            [{'name': 'id', 'type': 'INTEGER', 'nullable': False}]],
                   'expected': {'matched': ['id'],
                                'differences': [{'field': 'priority', 'problem': 'missing_column'}]}},
                  {'name': 'тип и nullable отличаются',
                   'args': [[{'name': 'id', 'type': 'INTEGER', 'nullable': False},
                             {'name': 'title', 'type': 'VARCHAR', 'nullable': False},
                             {'name': 'description', 'type': 'VARCHAR', 'nullable': True}],
                            [{'name': 'id', 'type': 'BIGINT', 'nullable': False},
                             {'name': 'title', 'type': 'VARCHAR', 'nullable': True},
                             {'name': 'description', 'type': 'VARCHAR', 'nullable': True}]],
                   'expected': {'matched': ['description'],
                                'differences': [{'field': 'id', 'problem': 'type_mismatch'},
                                                {'field': 'title', 'problem': 'nullable_mismatch'}]}}],
        'reference_code': 'def solve(model_fields, table_columns):\n'
                          '    matched = []\n'
                          '    differences = []\n'
                          '    columns_by_name = {}\n'
                          '    for column in table_columns:\n'
                          "        columns_by_name[column['name']] = column\n"
                          '    for field in model_fields:\n'
                          "        column = columns_by_name.get(field['name'])\n"
                          '        if column is None:\n'
                          '            differences.append({\n'
                          "                'field': field['name'],\n"
                          "                'problem': 'missing_column',\n"
                          '            })\n'
                          "        elif column['type'] != field['type']:\n"
                          '            differences.append({\n'
                          "                'field': field['name'],\n"
                          "                'problem': 'type_mismatch',\n"
                          '            })\n'
                          "        elif column['nullable'] != field['nullable']:\n"
                          '            differences.append({\n'
                          "                'field': field['name'],\n"
                          "                'problem': 'nullable_mismatch',\n"
                          '            })\n'
                          '        else:\n'
                          "            matched.append(field['name'])\n"
                          "    return {'matched': matched, 'differences': differences}\n"}],
 119: [{'title': 'INSERT отдельно от значений',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните словарь statement и params. statement должен быть постоянной строкой INSERT INTO tasks '
                  '(title, priority, is_done) VALUES (:title, :priority, :is_done) RETURNING id. params должен '
                  'содержать переданные значения по ключам title, priority и is_done. Не вставляйте пользовательский '
                  'title внутрь SQL-строки.',
        'contract': {'given': 'Автопроверка вызывает solve(title, priority, is_done). title — пользовательская '
                              'строка, priority — целое число, is_done — bool.',
                     'todo': 'Верните словарь statement и params. statement должен быть постоянной строкой INSERT '
                             'INTO tasks (title, priority, is_done) VALUES (:title, :priority, :is_done) RETURNING '
                             'id. params должен содержать переданные значения по ключам title, priority и is_done. '
                             'Не вставляйте пользовательский title внутрь SQL-строки.',
                     'check': 'Платформа вызовет solve с обычным текстом, кавычкой и фрагментом, похожим на SQL '
                              'injection. Во всех случаях statement должен остаться одинаковым, а пользовательские '
                              'значения должны находиться только в params.'},
        'requirements': {'items': ['постоянный SQL statement',
                                   'именованные placeholders',
                                   'отдельный params',
                                   'пользовательский title не склеивается с SQL'],
                         'names': ['title', 'priority', 'is_done', 'statement', 'params'],
                         'nodes': ['FunctionDef']},
        'starter_code': 'def solve(title, priority, is_done):\n'
                        '    # Верните parameterized statement и params\n'
                        '    pass\n',
        'tests': [{'name': 'обычная задача',
                   'args': ['Изучить SQL', 3, False],
                   'expected': {'statement': 'INSERT INTO tasks (title, priority, is_done) VALUES (:title, '
                                             ':priority, :is_done) RETURNING id',
                                'params': {'title': 'Изучить SQL', 'priority': 3, 'is_done': False}}},
                  {'name': 'кавычка в заголовке',
                   'args': ["Авторская задача O'Reilly", 2, False],
                   'expected': {'statement': 'INSERT INTO tasks (title, priority, is_done) VALUES (:title, '
                                             ':priority, :is_done) RETURNING id',
                                'params': {'title': "Авторская задача O'Reilly", 'priority': 2, 'is_done': False}}},
                  {'name': 'опасный текст остаётся значением',
                   'args': ["x'); DELETE FROM tasks; --", 5, True],
                   'expected': {'statement': 'INSERT INTO tasks (title, priority, is_done) VALUES (:title, '
                                             ':priority, :is_done) RETURNING id',
                                'params': {'title': "x'); DELETE FROM tasks; --", 'priority': 5, 'is_done': True}}}],
        'reference_code': 'def solve(title, priority, is_done):\n'
                          '    statement = (\n'
                          "        'INSERT INTO tasks (title, priority, is_done) '\n"
                          "        'VALUES (:title, :priority, :is_done) RETURNING id'\n"
                          '    )\n'
                          '    params = {\n'
                          "        'title': title,\n"
                          "        'priority': priority,\n"
                          "        'is_done': is_done,\n"
                          '    }\n'
                          "    return {'statement': statement, 'params': params}\n"}],
 120: [{'title': 'SELECT из последовательных частей',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Начните со строки SELECT id, title, priority, is_done FROM tasks. Если is_done не None, добавьте '
                  'условие is_done = :is_done. Если min_priority не None, добавьте priority >= :min_priority. Если '
                  'условий два, соедините их через AND. Добавьте ORDER BY priority DESC, id ASC при descending=True, '
                  'иначе ORDER BY priority ASC, id ASC. В конце добавьте LIMIT :limit OFFSET :offset. Верните '
                  'statement и params только с реально используемыми filters, а также limit и offset.',
        'contract': {'given': 'Автопроверка вызывает solve(is_done, min_priority, descending, limit, offset). '
                              'is_done равен True, False или None. min_priority равен целому числу или None. '
                              'descending — bool, limit и offset — целые числа.',
                     'todo': 'Начните со строки SELECT id, title, priority, is_done FROM tasks. Если is_done не '
                             'None, добавьте условие is_done = :is_done. Если min_priority не None, добавьте '
                             'priority >= :min_priority. Если условий два, соедините их через AND. Добавьте ORDER BY '
                             'priority DESC, id ASC при descending=True, иначе ORDER BY priority ASC, id ASC. В '
                             'конце добавьте LIMIT :limit OFFSET :offset. Верните statement и params только с '
                             'реально используемыми filters, а также limit и offset.',
                     'check': 'Проверяется запрос без filters, с одним и с двумя filters. Сравниваются точная '
                              'SQL-строка и params. Порядок частей должен быть FROM → WHERE → ORDER BY → LIMIT → '
                              'OFFSET.'},
        'requirements': {'items': ['динамический список conditions',
                                   'AND только между существующими filters',
                                   'стабильный tie-breaker id ASC',
                                   'limit и offset в params'],
                         'names': ['is_done',
                                   'min_priority',
                                   'descending',
                                   'limit',
                                   'offset',
                                   'conditions',
                                   'params',
                                   'statement'],
                         'nodes': ['FunctionDef', 'If'],
                         'attributes': ['append', 'join']},
        'starter_code': 'def solve(is_done, min_priority, descending, limit, offset):\n'
                        '    conditions = []\n'
                        '    params = {}\n'
                        '    # Соберите SELECT по этапам\n'
                        '    pass\n',
        'tests': [{'name': 'без filters',
                   'args': [None, None, False, 20, 0],
                   'expected': {'statement': 'SELECT id, title, priority, is_done FROM tasks ORDER BY priority ASC, '
                                             'id ASC LIMIT :limit OFFSET :offset',
                                'params': {'limit': 20, 'offset': 0}}},
                  {'name': 'один filter',
                   'args': [False, None, True, 10, 20],
                   'expected': {'statement': 'SELECT id, title, priority, is_done FROM tasks WHERE is_done = '
                                             ':is_done ORDER BY priority DESC, id ASC LIMIT :limit OFFSET :offset',
                                'params': {'is_done': False, 'limit': 10, 'offset': 20}}},
                  {'name': 'два filters',
                   'args': [True, 3, False, 5, 0],
                   'expected': {'statement': 'SELECT id, title, priority, is_done FROM tasks WHERE is_done = '
                                             ':is_done AND priority >= :min_priority ORDER BY priority ASC, id ASC '
                                             'LIMIT :limit OFFSET :offset',
                                'params': {'is_done': True, 'min_priority': 3, 'limit': 5, 'offset': 0}}}],
        'reference_code': 'def solve(is_done, min_priority, descending, limit, offset):\n'
                          '    conditions = []\n'
                          '    params = {}\n'
                          '    if is_done is not None:\n'
                          "        conditions.append('is_done = :is_done')\n"
                          "        params['is_done'] = is_done\n"
                          '    if min_priority is not None:\n'
                          "        conditions.append('priority >= :min_priority')\n"
                          "        params['min_priority'] = min_priority\n"
                          "    statement = 'SELECT id, title, priority, is_done FROM tasks'\n"
                          '    if conditions:\n'
                          "        statement += ' WHERE ' + ' AND '.join(conditions)\n"
                          '    if descending:\n'
                          "        statement += ' ORDER BY priority DESC, id ASC'\n"
                          '    else:\n'
                          "        statement += ' ORDER BY priority ASC, id ASC'\n"
                          "    statement += ' LIMIT :limit OFFSET :offset'\n"
                          "    params['limit'] = limit\n"
                          "    params['offset'] = offset\n"
                          "    return {'statement': statement, 'params': params}\n"}],
 121: [{'title': 'Защита UPDATE и DELETE',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Если has_where равно False или task_id равно None, верните decision blocked, status 400 и '
                  'statement None. Если matched_count равно 0, верните decision not_found, status 404 и statement '
                  'None. Если matched_count больше 1, верните decision suspicious, status 409 и statement None. Для '
                  'безопасного update верните status 200 и statement UPDATE tasks SET is_done = :is_done WHERE id = '
                  ':task_id RETURNING id. Для безопасного delete верните status 204 и statement DELETE FROM tasks '
                  'WHERE id = :task_id RETURNING id. В успешном результате добавьте params с task_id.',
        'contract': {'given': 'Автопроверка вызывает solve(operation, task_id, has_where, matched_count). operation '
                              'равен update или delete. task_id — целое число или None. has_where — bool, '
                              'matched_count — число строк, которые затронула бы операция.',
                     'todo': 'Если has_where равно False или task_id равно None, верните decision blocked, status '
                             '400 и statement None. Если matched_count равно 0, верните decision not_found, status '
                             '404 и statement None. Если matched_count больше 1, верните decision suspicious, status '
                             '409 и statement None. Для безопасного update верните status 200 и statement UPDATE '
                             'tasks SET is_done = :is_done WHERE id = :task_id RETURNING id. Для безопасного delete '
                             'верните status 204 и statement DELETE FROM tasks WHERE id = :task_id RETURNING id. В '
                             'успешном результате добавьте params с task_id.',
                     'check': 'Проверяется запрос без WHERE, отсутствующий id, 0/1/несколько совпадений и обе '
                              'операции. Любая неоднозначная mutation должна блокироваться до выполнения.'},
        'requirements': {'items': ['блокировка без WHERE',
                                   'различие 0/1/много строк',
                                   'parameterized UPDATE',
                                   'parameterized DELETE'],
                         'names': ['operation', 'task_id', 'has_where', 'matched_count'],
                         'nodes': ['FunctionDef', 'If', 'BoolOp']},
        'starter_code': 'def solve(operation, task_id, has_where, matched_count):\n'
                        '    # Проверьте безопасность mutation\n'
                        '    pass\n',
        'tests': [{'name': 'нет WHERE',
                   'args': ['delete', 7, False, 20],
                   'expected': {'decision': 'blocked', 'status': 400, 'statement': None}},
                  {'name': 'строка не найдена',
                   'args': ['update', 99, True, 0],
                   'expected': {'decision': 'not_found', 'status': 404, 'statement': None}},
                  {'name': 'слишком много строк',
                   'args': ['delete', 7, True, 3],
                   'expected': {'decision': 'suspicious', 'status': 409, 'statement': None}},
                  {'name': 'безопасный UPDATE',
                   'args': ['update', 7, True, 1],
                   'expected': {'decision': 'allowed',
                                'status': 200,
                                'statement': 'UPDATE tasks SET is_done = :is_done WHERE id = :task_id RETURNING id',
                                'params': {'task_id': 7}}},
                  {'name': 'безопасный DELETE',
                   'args': ['delete', 5, True, 1],
                   'expected': {'decision': 'allowed',
                                'status': 204,
                                'statement': 'DELETE FROM tasks WHERE id = :task_id RETURNING id',
                                'params': {'task_id': 5}}}],
        'reference_code': 'def solve(operation, task_id, has_where, matched_count):\n'
                          '    if not has_where or task_id is None:\n'
                          '        return {\n'
                          "            'decision': 'blocked',\n"
                          "            'status': 400,\n"
                          "            'statement': None,\n"
                          '        }\n'
                          '    if matched_count == 0:\n'
                          '        return {\n'
                          "            'decision': 'not_found',\n"
                          "            'status': 404,\n"
                          "            'statement': None,\n"
                          '        }\n'
                          '    if matched_count > 1:\n'
                          '        return {\n'
                          "            'decision': 'suspicious',\n"
                          "            'status': 409,\n"
                          "            'statement': None,\n"
                          '        }\n'
                          "    if operation == 'update':\n"
                          '        return {\n'
                          "            'decision': 'allowed',\n"
                          "            'status': 200,\n"
                          "            'statement': (\n"
                          "                'UPDATE tasks SET is_done = :is_done '\n"
                          "                'WHERE id = :task_id RETURNING id'\n"
                          '            ),\n'
                          "            'params': {'task_id': task_id},\n"
                          '        }\n'
                          '    return {\n'
                          "        'decision': 'allowed',\n"
                          "        'status': 204,\n"
                          "        'statement': 'DELETE FROM tasks WHERE id = :task_id RETURNING id',\n"
                          "        'params': {'task_id': task_id},\n"
                          '    }\n'}],
 123: [{'title': 'Маршрут подключения к PostgreSQL',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Соберите connection_url в формате postgresql+psycopg://role:password@host:port/database. Верните '
                  'также layers в точном порядке: client, driver, server, database, schema. Добавьте target со '
                  'значениями server=host:port, database, schema и role. Не включайте password в target.',
        'contract': {'given': 'Автопроверка вызывает solve(role, password, host, port, database, schema). Все '
                              'аргументы кроме port — строки, port — целое число.',
                     'todo': 'Соберите connection_url в формате '
                             'postgresql+psycopg://role:password@host:port/database. Верните также layers в точном '
                             'порядке: client, driver, server, database, schema. Добавьте target со значениями '
                             'server=host:port, database, schema и role. Не включайте password в target.',
                     'check': 'Проверяются разные host, port, database и role. Сравниваются URL, порядок layers и '
                              'безопасный target без password.'},
        'requirements': {'items': ['postgresql+psycopg URL',
                                   'явный host и port',
                                   'пять уровней подключения',
                                   'password отсутствует в target'],
                         'names': ['role',
                                   'password',
                                   'host',
                                   'port',
                                   'database',
                                   'schema',
                                   'connection_url',
                                   'layers',
                                   'target'],
                         'nodes': ['FunctionDef', 'JoinedStr']},
        'starter_code': 'def solve(role, password, host, port, database, schema):\n'
                        '    # Соберите URL и карту уровней подключения\n'
                        '    pass\n',
        'tests': [{'name': 'локальная база',
                   'args': ['studyhub_app', 'secret', 'localhost', 5432, 'studyhub_dev', 'public'],
                   'expected': {'connection_url': 'postgresql+psycopg://studyhub_app:secret@localhost:5432/studyhub_dev',
                                'layers': ['client', 'driver', 'server', 'database', 'schema'],
                                'target': {'server': 'localhost:5432',
                                           'database': 'studyhub_dev',
                                           'schema': 'public',
                                           'role': 'studyhub_app'}}},
                  {'name': 'другой server',
                   'args': ['app_test', 'testpass', 'db.internal', 5544, 'studyhub_test', 'app'],
                   'expected': {'connection_url': 'postgresql+psycopg://app_test:testpass@db.internal:5544/studyhub_test',
                                'layers': ['client', 'driver', 'server', 'database', 'schema'],
                                'target': {'server': 'db.internal:5544',
                                           'database': 'studyhub_test',
                                           'schema': 'app',
                                           'role': 'app_test'}}}],
        'reference_code': 'def solve(role, password, host, port, database, schema):\n'
                          '    connection_url = (\n'
                          "        f'postgresql+psycopg://{role}:{password}'\n"
                          "        f'@{host}:{port}/{database}'\n"
                          '    )\n'
                          "    layers = ['client', 'driver', 'server', 'database', 'schema']\n"
                          '    target = {\n'
                          "        'server': f'{host}:{port}',\n"
                          "        'database': database,\n"
                          "        'schema': schema,\n"
                          "        'role': role,\n"
                          '    }\n'
                          '    return {\n'
                          "        'connection_url': connection_url,\n"
                          "        'layers': layers,\n"
                          "        'target': target,\n"
                          '    }\n'}],
 129: [{'title': 'INNER JOIN трёх наборов',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Соберите результат INNER JOIN. Включайте только task, для которой найдены и user, и category. '
                  'Каждая строка результата содержит task_id, title, username и category_name. Сохраняйте порядок '
                  'tasks.',
        'contract': {'given': 'Автопроверка вызывает solve(tasks, users, categories). tasks содержит id, title, '
                              'user_id и category_id. users содержит id и username. categories содержит id и name.',
                     'todo': 'Соберите результат INNER JOIN. Включайте только task, для которой найдены и user, и '
                             'category. Каждая строка результата содержит task_id, title, username и category_name. '
                             'Сохраняйте порядок tasks.',
                     'check': 'Проверяются полные связи, отсутствующий user и отсутствующая category. Строка с любой '
                              'отсутствующей правой связью не должна попасть в INNER JOIN result.'},
        'requirements': {'items': ['индексы users и categories по id',
                                   'две foreign-key проверки',
                                   'строка только при обеих найденных связях',
                                   'порядок tasks'],
                         'names': ['tasks', 'users', 'categories', 'rows'],
                         'nodes': ['FunctionDef', 'For', 'If', 'BoolOp'],
                         'attributes': ['get', 'append']},
        'starter_code': 'def solve(tasks, users, categories):\n'
                        '    rows = []\n'
                        '    # Соедините три набора по foreign keys\n'
                        '    pass\n',
        'tests': [{'name': 'все связи найдены',
                   'args': [[{'id': 1, 'title': 'SQL', 'user_id': 7, 'category_id': 10},
                             {'id': 2, 'title': 'JOIN', 'user_id': 8, 'category_id': 11}],
                            [{'id': 7, 'username': 'alice'}, {'id': 8, 'username': 'bob'}],
                            [{'id': 10, 'name': 'database'}, {'id': 11, 'name': 'backend'}]],
                   'expected': [{'task_id': 1, 'title': 'SQL', 'username': 'alice', 'category_name': 'database'},
                                {'task_id': 2, 'title': 'JOIN', 'username': 'bob', 'category_name': 'backend'}]},
                  {'name': 'часть связей отсутствует',
                   'args': [[{'id': 1, 'title': 'SQL', 'user_id': 7, 'category_id': 10},
                             {'id': 2, 'title': 'No user', 'user_id': 99, 'category_id': 10},
                             {'id': 3, 'title': 'No category', 'user_id': 7, 'category_id': 77}],
                            [{'id': 7, 'username': 'alice'}],
                            [{'id': 10, 'name': 'database'}]],
                   'expected': [{'task_id': 1, 'title': 'SQL', 'username': 'alice', 'category_name': 'database'}]}],
        'reference_code': 'def solve(tasks, users, categories):\n'
                          '    users_by_id = {}\n'
                          '    for user in users:\n'
                          "        users_by_id[user['id']] = user\n"
                          '    categories_by_id = {}\n'
                          '    for category in categories:\n'
                          "        categories_by_id[category['id']] = category\n"
                          '    rows = []\n'
                          '    for task in tasks:\n'
                          "        user = users_by_id.get(task['user_id'])\n"
                          "        category = categories_by_id.get(task['category_id'])\n"
                          '        if user is not None and category is not None:\n'
                          '            rows.append({\n'
                          "                'task_id': task['id'],\n"
                          "                'title': task['title'],\n"
                          "                'username': user['username'],\n"
                          "                'category_name': category['name'],\n"
                          '            })\n'
                          '    return rows\n'}],
 130: [{'title': 'LEFT JOIN и отсутствующие связи',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Для каждой task верните строку task_id, title и category_name. Если category не найдена или '
                  'category_id равен None, category_name должен быть None. Также верните users_without_tasks — id '
                  'пользователей, на которых не ссылается ни одна task. Сохраняйте порядок tasks и users.',
        'contract': {'given': 'Автопроверка вызывает solve(tasks, users, categories). category_id у task может быть '
                              'None. Нужно сохранить все tasks и отдельно найти users без задач.',
                     'todo': 'Для каждой task верните строку task_id, title и category_name. Если category не '
                             'найдена или category_id равен None, category_name должен быть None. Также верните '
                             'users_without_tasks — id пользователей, на которых не ссылается ни одна task. '
                             'Сохраняйте порядок tasks и users.',
                     'check': 'Проверяются task без category, неизвестная category и user без tasks. В отличие от '
                              'INNER JOIN ни одна task не должна исчезнуть.'},
        'requirements': {'items': ['все tasks остаются в result',
                                   'None для отсутствующей category',
                                   'множество used_user_ids',
                                   'users_without_tasks в исходном порядке'],
                         'names': ['tasks', 'users', 'categories', 'task_rows', 'users_without_tasks'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['set'],
                         'attributes': ['get', 'add', 'append']},
        'starter_code': 'def solve(tasks, users, categories):\n'
                        '    task_rows = []\n'
                        '    users_without_tasks = []\n'
                        '    # Смоделируйте два LEFT JOIN сценария\n'
                        '    pass\n',
        'tests': [{'name': 'nullable category и user без задач',
                   'args': [[{'id': 1, 'title': 'SQL', 'user_id': 7, 'category_id': 10},
                             {'id': 2, 'title': 'Без категории', 'user_id': 7, 'category_id': None}],
                            [{'id': 7, 'username': 'alice'}, {'id': 8, 'username': 'bob'}],
                            [{'id': 10, 'name': 'database'}]],
                   'expected': {'task_rows': [{'task_id': 1, 'title': 'SQL', 'category_name': 'database'},
                                              {'task_id': 2, 'title': 'Без категории', 'category_name': None}],
                                'users_without_tasks': [8]}},
                  {'name': 'неизвестная category',
                   'args': [[{'id': 3, 'title': 'Broken link', 'user_id': 9, 'category_id': 99}],
                            [{'id': 9, 'username': 'carol'}],
                            []],
                   'expected': {'task_rows': [{'task_id': 3, 'title': 'Broken link', 'category_name': None}],
                                'users_without_tasks': []}}],
        'reference_code': 'def solve(tasks, users, categories):\n'
                          '    categories_by_id = {}\n'
                          '    for category in categories:\n'
                          "        categories_by_id[category['id']] = category\n"
                          '    task_rows = []\n'
                          '    used_user_ids = set()\n'
                          '    for task in tasks:\n'
                          "        used_user_ids.add(task['user_id'])\n"
                          "        category = categories_by_id.get(task['category_id'])\n"
                          '        category_name = None\n'
                          '        if category is not None:\n'
                          "            category_name = category['name']\n"
                          '        task_rows.append({\n'
                          "            'task_id': task['id'],\n"
                          "            'title': task['title'],\n"
                          "            'category_name': category_name,\n"
                          '        })\n'
                          '    users_without_tasks = []\n'
                          '    for user in users:\n'
                          "        if user['id'] not in used_user_ids:\n"
                          "            users_without_tasks.append(user['id'])\n"
                          '    return {\n'
                          "        'task_rows': task_rows,\n"
                          "        'users_without_tasks': users_without_tasks,\n"
                          '    }\n'}],
 132: [{'title': 'GROUP BY и агрегаты StudyHub',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Верните by_user и avg_priority_by_category. by_user — список по возрастанию user_id со значениями '
                  'user_id, total и done. avg_priority_by_category — список по возрастанию category_id со значениями '
                  'category_id и average, округлённым round(..., 2). Каждая task участвует ровно в одной группе '
                  'пользователя и одной группе категории.',
        'contract': {'given': 'Автопроверка вызывает solve(tasks). Каждая task содержит user_id, category_id, '
                              'priority и is_done. Списки могут быть пустыми.',
                     'todo': 'Верните by_user и avg_priority_by_category. by_user — список по возрастанию user_id со '
                             'значениями user_id, total и done. avg_priority_by_category — список по возрастанию '
                             'category_id со значениями category_id и average, округлённым round(..., 2). Каждая '
                             'task участвует ровно в одной группе пользователя и одной группе категории.',
                     'check': 'Проверяются несколько групп, одна группа и пустой список. Сравниваются counts, '
                              'averages и стабильный порядок групп.'},
        'requirements': {'items': ['группировка по user_id',
                                   'COUNT total и done',
                                   'группировка по category_id',
                                   'AVG priority'],
                         'names': ['tasks', 'users', 'categories', 'by_user', 'avg_priority_by_category'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['sorted', 'round'],
                         'attributes': ['append']},
        'starter_code': 'def solve(tasks):\n    # Соберите две группировки\n    pass\n',
        'tests': [{'name': 'несколько групп',
                   'args': [[{'user_id': 7, 'category_id': 10, 'priority': 2, 'is_done': True},
                             {'user_id': 7, 'category_id': 10, 'priority': 4, 'is_done': False},
                             {'user_id': 8, 'category_id': 11, 'priority': 5, 'is_done': True}]],
                   'expected': {'by_user': [{'user_id': 7, 'total': 2, 'done': 1},
                                            {'user_id': 8, 'total': 1, 'done': 1}],
                                'avg_priority_by_category': [{'category_id': 10, 'average': 3.0},
                                                             {'category_id': 11, 'average': 5.0}]}},
                  {'name': 'пустой список',
                   'args': [[]],
                   'expected': {'by_user': [], 'avg_priority_by_category': []}}],
        'reference_code': 'def solve(tasks):\n'
                          '    users = {}\n'
                          '    categories = {}\n'
                          '    for task in tasks:\n'
                          "        user_id = task['user_id']\n"
                          '        if user_id not in users:\n'
                          "            users[user_id] = {'total': 0, 'done': 0}\n"
                          "        users[user_id]['total'] += 1\n"
                          "        if task['is_done']:\n"
                          "            users[user_id]['done'] += 1\n"
                          "        category_id = task['category_id']\n"
                          '        if category_id not in categories:\n'
                          "            categories[category_id] = {'sum': 0, 'count': 0}\n"
                          "        categories[category_id]['sum'] += task['priority']\n"
                          "        categories[category_id]['count'] += 1\n"
                          '    by_user = []\n'
                          '    for user_id in sorted(users):\n'
                          '        by_user.append({\n'
                          "            'user_id': user_id,\n"
                          "            'total': users[user_id]['total'],\n"
                          "            'done': users[user_id]['done'],\n"
                          '        })\n'
                          '    avg_priority_by_category = []\n'
                          '    for category_id in sorted(categories):\n'
                          '        values = categories[category_id]\n'
                          "        average = round(values['sum'] / values['count'], 2)\n"
                          '        avg_priority_by_category.append({\n'
                          "            'category_id': category_id,\n"
                          "            'average': average,\n"
                          '        })\n'
                          '    return {\n'
                          "        'by_user': by_user,\n"
                          "        'avg_priority_by_category': avg_priority_by_category,\n"
                          '    }\n'}],
 133: [{'title': 'WHERE, HAVING и EXISTS',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Верните три результата. users_with_min_tasks — id пользователей, у которых COUNT(tasks) не меньше '
                  'min_tasks; это модель HAVING после GROUP BY. categories_without_active — id категорий, для '
                  'которых не существует task с is_done=False; это модель NOT EXISTS. email_exists — True, если '
                  'существует user с email без учёта регистра. Сохраняйте порядок users и categories.',
        'contract': {'given': 'Автопроверка вызывает solve(users, tasks, categories, min_tasks, email). users '
                              'содержит id и email. tasks содержит user_id, category_id и is_done. categories '
                              'содержит id.',
                     'todo': 'Верните три результата. users_with_min_tasks — id пользователей, у которых '
                             'COUNT(tasks) не меньше min_tasks; это модель HAVING после GROUP BY. '
                             'categories_without_active — id категорий, для которых не существует task с '
                             'is_done=False; это модель NOT EXISTS. email_exists — True, если существует user с '
                             'email без учёта регистра. Сохраняйте порядок users и categories.',
                     'check': 'Проверяются группы выше и ниже порога, пустая category, category только с '
                              'завершёнными tasks и поиск email в другом регистре.'},
        'requirements': {'items': ['COUNT по user_id',
                                   'фильтр групп по min_tasks',
                                   'NOT EXISTS активной task',
                                   'EXISTS email без учёта регистра'],
                         'names': ['users', 'tasks', 'categories', 'min_tasks', 'email'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['get', 'append', 'lower']},
        'starter_code': 'def solve(users, tasks, categories, min_tasks, email):\n'
                        '    # Реализуйте HAVING и два EXISTS-подобных вопроса\n'
                        '    pass\n',
        'tests': [{'name': 'полный сценарий',
                   'args': [[{'id': 7, 'email': 'alice@example.com'},
                             {'id': 8, 'email': 'bob@example.com'},
                             {'id': 9, 'email': 'carol@example.com'}],
                            [{'user_id': 7, 'category_id': 10, 'is_done': False},
                             {'user_id': 7, 'category_id': 10, 'is_done': True},
                             {'user_id': 7, 'category_id': 11, 'is_done': True},
                             {'user_id': 8, 'category_id': 11, 'is_done': True}],
                            [{'id': 10}, {'id': 11}, {'id': 12}],
                            2,
                            'ALICE@EXAMPLE.COM'],
                   'expected': {'users_with_min_tasks': [7],
                                'categories_without_active': [11, 12],
                                'email_exists': True}},
                  {'name': 'ничего не найдено',
                   'args': [[{'id': 1, 'email': 'one@example.com'}], [], [{'id': 5}], 1, 'missing@example.com'],
                   'expected': {'users_with_min_tasks': [],
                                'categories_without_active': [5],
                                'email_exists': False}}],
        'reference_code': 'def solve(users, tasks, categories, min_tasks, email):\n'
                          '    counts = {}\n'
                          '    for task in tasks:\n'
                          "        user_id = task['user_id']\n"
                          '        counts[user_id] = counts.get(user_id, 0) + 1\n'
                          '    users_with_min_tasks = []\n'
                          '    for user in users:\n'
                          "        if counts.get(user['id'], 0) >= min_tasks:\n"
                          "            users_with_min_tasks.append(user['id'])\n"
                          '    categories_without_active = []\n'
                          '    for category in categories:\n'
                          '        active_exists = False\n'
                          '        for task in tasks:\n'
                          "            same_category = task['category_id'] == category['id']\n"
                          "            if same_category and not task['is_done']:\n"
                          '                active_exists = True\n'
                          '                break\n'
                          '        if not active_exists:\n'
                          "            categories_without_active.append(category['id'])\n"
                          '    normalized_email = email.lower()\n'
                          '    email_exists = False\n'
                          '    for user in users:\n'
                          "        if user['email'].lower() == normalized_email:\n"
                          '            email_exists = True\n'
                          '            break\n'
                          '    return {\n'
                          "        'users_with_min_tasks': users_with_min_tasks,\n"
                          "        'categories_without_active': categories_without_active,\n"
                          "        'email_exists': email_exists,\n"
                          '    }\n'}],
 134: [{'title': 'Атомарное завершение задачи',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Смоделируйте одну transaction: изменить task is_done на True и добавить progress event с task_id '
                  "и event='completed'. Если fail_event_insert равно True, верните исходные task и progress_events "
                  'без частичного изменения, status rolled_back и committed False. Иначе верните оба изменения, '
                  'status committed и committed True. Не изменяйте входные объекты напрямую: сначала создайте '
                  'copies.',
        'contract': {'given': 'Автопроверка вызывает solve(task, progress_events, fail_event_insert). task — словарь '
                              'id и is_done. progress_events — список словарей. fail_event_insert моделирует ошибку '
                              'второго SQL statement.',
                     'todo': 'Смоделируйте одну transaction: изменить task is_done на True и добавить progress event '
                             "с task_id и event='completed'. Если fail_event_insert равно True, верните исходные "
                             'task и progress_events без частичного изменения, status rolled_back и committed False. '
                             'Иначе верните оба изменения, status committed и committed True. Не изменяйте входные '
                             'объекты напрямую: сначала создайте copies.',
                     'check': 'Платформа проверит успешный commit и ошибку второго шага. При rollback task должна '
                              'остаться незавершённой, а event не должен появиться.'},
        'requirements': {'items': ['copies входных данных',
                                   'два связанных изменения',
                                   'полный rollback при ошибке',
                                   'commit только после обоих шагов'],
                         'names': ['task', 'progress_events', 'fail_event_insert'],
                         'nodes': ['FunctionDef', 'If'],
                         'calls': ['dict', 'list'],
                         'attributes': ['append']},
        'starter_code': 'def solve(task, progress_events, fail_event_insert):\n'
                        '    # Выполните оба изменения атомарно\n'
                        '    pass\n',
        'tests': [{'name': 'успешная transaction',
                   'args': [{'id': 5, 'is_done': False}, [], False],
                   'expected': {'status': 'committed',
                                'committed': True,
                                'task': {'id': 5, 'is_done': True},
                                'progress_events': [{'task_id': 5, 'event': 'completed'}]}},
                  {'name': 'ошибка второго шага',
                   'args': [{'id': 5, 'is_done': False}, [], True],
                   'expected': {'status': 'rolled_back',
                                'committed': False,
                                'task': {'id': 5, 'is_done': False},
                                'progress_events': []}},
                  {'name': 'сохраняются прежние events',
                   'args': [{'id': 8, 'is_done': False}, [{'task_id': 3, 'event': 'completed'}], False],
                   'expected': {'status': 'committed',
                                'committed': True,
                                'task': {'id': 8, 'is_done': True},
                                'progress_events': [{'task_id': 3, 'event': 'completed'},
                                                    {'task_id': 8, 'event': 'completed'}]}}],
        'reference_code': 'def solve(task, progress_events, fail_event_insert):\n'
                          '    original_task = dict(task)\n'
                          '    original_events = list(progress_events)\n'
                          '    working_task = dict(task)\n'
                          '    working_events = list(progress_events)\n'
                          "    working_task['is_done'] = True\n"
                          '    if fail_event_insert:\n'
                          '        return {\n'
                          "            'status': 'rolled_back',\n"
                          "            'committed': False,\n"
                          "            'task': original_task,\n"
                          "            'progress_events': original_events,\n"
                          '        }\n'
                          '    working_events.append({\n'
                          "        'task_id': working_task['id'],\n"
                          "        'event': 'completed',\n"
                          '    })\n'
                          '    return {\n'
                          "        'status': 'committed',\n"
                          "        'committed': True,\n"
                          "        'task': working_task,\n"
                          "        'progress_events': working_events,\n"
                          '    }\n'}],
 136: [{'title': 'Leftmost prefix составного индекса',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Определите usable_prefix по правилу leftmost prefix. Идите по index_columns слева направо. '
                  'Колонка входит в prefix, если она есть в equality_filters. Первая колонка range_column также '
                  'входит и завершает prefix. При первой колонке без equality/range остановитесь. supports_order '
                  'равно True, если order_by — следующая колонка после equality prefix или уже последняя колонка '
                  'usable_prefix как range/order column. Верните usable_prefix и supports_order.',
        'contract': {'given': 'Автопроверка вызывает solve(index_columns, equality_filters, range_column, order_by). '
                              'index_columns — порядок колонок составного индекса. equality_filters — список колонок '
                              'с условием равенства. range_column и order_by — строка или None.',
                     'todo': 'Определите usable_prefix по правилу leftmost prefix. Идите по index_columns слева '
                             'направо. Колонка входит в prefix, если она есть в equality_filters. Первая колонка '
                             'range_column также входит и завершает prefix. При первой колонке без equality/range '
                             'остановитесь. supports_order равно True, если order_by — следующая колонка после '
                             'equality prefix или уже последняя колонка usable_prefix как range/order column. '
                             'Верните usable_prefix и supports_order.',
                     'check': 'Проверяется полный prefix, пропуск первой колонки, range после equality и сортировка '
                              'по следующей колонке. Индекс не должен считаться полезным только потому, что filter '
                              'содержит правую колонку.'},
        'requirements': {'items': ['left-to-right обход index_columns',
                                   'stop на первой дырке',
                                   'range завершает prefix',
                                   'order_by после equality prefix'],
                         'names': ['index_columns',
                                   'equality_filters',
                                   'range_column',
                                   'order_by',
                                   'usable_prefix',
                                   'supports_order'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['set', 'len'],
                         'attributes': ['append']},
        'starter_code': 'def solve(index_columns, equality_filters, range_column, order_by):\n'
                        '    usable_prefix = []\n'
                        '    # Примените leftmost-prefix rule\n'
                        '    pass\n',
        'tests': [{'name': 'полный equality prefix',
                   'args': [['owner_id', 'is_done', 'created_at'], ['owner_id', 'is_done'], None, 'created_at'],
                   'expected': {'usable_prefix': ['owner_id', 'is_done'], 'supports_order': True}},
                  {'name': 'пропущена первая колонка',
                   'args': [['owner_id', 'is_done', 'created_at'], ['is_done'], None, 'created_at'],
                   'expected': {'usable_prefix': [], 'supports_order': False}},
                  {'name': 'range завершает prefix',
                   'args': [['owner_id', 'is_done', 'created_at'], ['owner_id'], 'is_done', 'created_at'],
                   'expected': {'usable_prefix': ['owner_id', 'is_done'], 'supports_order': False}},
                  {'name': 'order по первой колонке',
                   'args': [['owner_id', 'is_done', 'created_at'], [], None, 'owner_id'],
                   'expected': {'usable_prefix': [], 'supports_order': True}}],
        'reference_code': 'def solve(index_columns, equality_filters, range_column, order_by):\n'
                          '    equality_set = set(equality_filters)\n'
                          '    usable_prefix = []\n'
                          '    stopped_by_range = False\n'
                          '    for column in index_columns:\n'
                          '        if column in equality_set:\n'
                          '            usable_prefix.append(column)\n'
                          '        elif column == range_column:\n'
                          '            usable_prefix.append(column)\n'
                          '            stopped_by_range = True\n'
                          '            break\n'
                          '        else:\n'
                          '            break\n'
                          '    supports_order = False\n'
                          '    if order_by is not None and not stopped_by_range:\n'
                          '        next_index = len(usable_prefix)\n'
                          '        if next_index < len(index_columns):\n'
                          '            supports_order = index_columns[next_index] == order_by\n'
                          '    if stopped_by_range and usable_prefix:\n'
                          '        supports_order = usable_prefix[-1] == order_by\n'
                          '    return {\n'
                          "        'usable_prefix': usable_prefix,\n"
                          "        'supports_order': supports_order,\n"
                          '    }\n'}]}

ASYNC_CODE_TASKS: dict[int, list[dict[str, Any]]] = {141: [{'title': 'Разделите работу и ожидание',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните словарь cpu_ms, io_wait_ms, blocking_total_ms и async_opportunity_ms. cpu_ms — сумма '
                  'duration_ms всех cpu operations. io_wait_ms — сумма duration_ms всех io operations. '
                  'blocking_total_ms — сумма всех durations. async_opportunity_ms — только io_wait_ms, потому что '
                  'await сам по себе не ускоряет CPU work.',
        'contract': {'given': 'Автопроверка вызывает solve(operations). operations — список словарей name, kind и '
                              'duration_ms. kind равен cpu или io.',
                     'todo': 'Верните словарь cpu_ms, io_wait_ms, blocking_total_ms и async_opportunity_ms. cpu_ms — '
                             'сумма duration_ms всех cpu operations. io_wait_ms — сумма duration_ms всех io '
                             'operations. blocking_total_ms — сумма всех durations. async_opportunity_ms — только '
                             'io_wait_ms, потому что await сам по себе не ускоряет CPU work.',
                     'check': 'Проверяются смешанный список, только CPU, только I/O и пустой список. Сравниваются '
                              'четыре итоговых числа. CPU duration не должна попадать в async_opportunity_ms.'},
        'requirements': {'items': ['отдельная сумма CPU work',
                                   'отдельная сумма I/O wait',
                                   'blocking total',
                                   'async opportunity содержит только I/O'],
                         'names': ['operations', 'cpu_ms', 'io_wait_ms'],
                         'nodes': ['FunctionDef', 'For', 'If']},
        'starter_code': 'def solve(operations):\n'
                        '    cpu_ms = 0\n'
                        '    io_wait_ms = 0\n'
                        '    # Просуммируйте два вида операций\n'
                        '    pass\n',
        'tests': [{'name': 'смешанный flow',
                   'args': [[{'name': 'validate', 'kind': 'cpu', 'duration_ms': 5},
                             {'name': 'postgres', 'kind': 'io', 'duration_ms': 40},
                             {'name': 'serialize', 'kind': 'cpu', 'duration_ms': 3},
                             {'name': 'http', 'kind': 'io', 'duration_ms': 60}]],
                   'expected': {'cpu_ms': 8,
                                'io_wait_ms': 100,
                                'blocking_total_ms': 108,
                                'async_opportunity_ms': 100}},
                  {'name': 'только CPU',
                   'args': [[{'name': 'hash', 'kind': 'cpu', 'duration_ms': 50},
                             {'name': 'sort', 'kind': 'cpu', 'duration_ms': 20}]],
                   'expected': {'cpu_ms': 70, 'io_wait_ms': 0, 'blocking_total_ms': 70, 'async_opportunity_ms': 0}},
                  {'name': 'пустой flow',
                   'args': [[]],
                   'expected': {'cpu_ms': 0, 'io_wait_ms': 0, 'blocking_total_ms': 0, 'async_opportunity_ms': 0}}],
        'reference_code': 'def solve(operations):\n'
                          '    cpu_ms = 0\n'
                          '    io_wait_ms = 0\n'
                          '    for operation in operations:\n'
                          "        if operation['kind'] == 'cpu':\n"
                          "            cpu_ms += operation['duration_ms']\n"
                          '        else:\n'
                          "            io_wait_ms += operation['duration_ms']\n"
                          '    return {\n'
                          "        'cpu_ms': cpu_ms,\n"
                          "        'io_wait_ms': io_wait_ms,\n"
                          "        'blocking_total_ms': cpu_ms + io_wait_ms,\n"
                          "        'async_opportunity_ms': io_wait_ms,\n"
                          '    }\n'}],
 142: [{'title': 'Состояния coroutine до и после запуска',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Начальные значения: coroutine_created=False, scheduled=False, body_started=False, done=False, '
                  'result_ready=False. call_async_function создаёт coroutine object, но не запускает body. '
                  'await_coroutine создаёт coroutine при необходимости, планирует её и запускает body. create_task '
                  'создаёт coroutine при необходимости и делает scheduled=True, но body_started меняется только '
                  'после event_loop_tick. event_loop_tick запускает scheduled coroutine. collect_result делает '
                  'done=True и result_ready=True только если body_started=True. Верните все пять flags.',
        'contract': {'given': 'Автопроверка вызывает solve(events). events — список строк call_async_function, '
                              'await_coroutine, create_task, event_loop_tick и collect_result.',
                     'todo': 'Начальные значения: coroutine_created=False, scheduled=False, body_started=False, '
                             'done=False, result_ready=False. call_async_function создаёт coroutine object, но не '
                             'запускает body. await_coroutine создаёт coroutine при необходимости, планирует её и '
                             'запускает body. create_task создаёт coroutine при необходимости и делает '
                             'scheduled=True, но body_started меняется только после event_loop_tick. event_loop_tick '
                             'запускает scheduled coroutine. collect_result делает done=True и result_ready=True '
                             'только если body_started=True. Верните все пять flags.',
                     'check': 'Проверяется простой вызов без запуска, прямой await, create_task до tick и полный '
                              'lifecycle Task. Обычный вызов async function не должен обозначаться как выполненное '
                              'тело.'},
        'requirements': {'items': ['coroutine object не запускает body',
                                   'await запускает coroutine',
                                   'Task ждёт event loop tick',
                                   'result готов только после body'],
                         'names': ['events',
                                   'coroutine_created',
                                   'scheduled',
                                   'body_started',
                                   'done',
                                   'result_ready'],
                         'nodes': ['FunctionDef', 'For', 'If']},
        'starter_code': 'def solve(events):\n'
                        '    coroutine_created = False\n'
                        '    scheduled = False\n'
                        '    body_started = False\n'
                        '    done = False\n'
                        '    result_ready = False\n'
                        '    # Обработайте события по порядку\n'
                        '    pass\n',
        'tests': [{'name': 'только создан object',
                   'args': [['call_async_function']],
                   'expected': {'coroutine_created': True,
                                'scheduled': False,
                                'body_started': False,
                                'done': False,
                                'result_ready': False}},
                  {'name': 'прямой await',
                   'args': [['await_coroutine', 'collect_result']],
                   'expected': {'coroutine_created': True,
                                'scheduled': True,
                                'body_started': True,
                                'done': True,
                                'result_ready': True}},
                  {'name': 'Task ещё не получил tick',
                   'args': [['create_task']],
                   'expected': {'coroutine_created': True,
                                'scheduled': True,
                                'body_started': False,
                                'done': False,
                                'result_ready': False}},
                  {'name': 'полный Task lifecycle',
                   'args': [['create_task', 'event_loop_tick', 'collect_result']],
                   'expected': {'coroutine_created': True,
                                'scheduled': True,
                                'body_started': True,
                                'done': True,
                                'result_ready': True}}],
        'reference_code': 'def solve(events):\n'
                          '    coroutine_created = False\n'
                          '    scheduled = False\n'
                          '    body_started = False\n'
                          '    done = False\n'
                          '    result_ready = False\n'
                          '    for event in events:\n'
                          "        if event == 'call_async_function':\n"
                          '            coroutine_created = True\n'
                          "        elif event == 'await_coroutine':\n"
                          '            coroutine_created = True\n'
                          '            scheduled = True\n'
                          '            body_started = True\n'
                          "        elif event == 'create_task':\n"
                          '            coroutine_created = True\n'
                          '            scheduled = True\n'
                          "        elif event == 'event_loop_tick' and scheduled:\n"
                          '            body_started = True\n'
                          "        elif event == 'collect_result' and body_started:\n"
                          '            done = True\n'
                          '            result_ready = True\n'
                          '    return {\n'
                          "        'coroutine_created': coroutine_created,\n"
                          "        'scheduled': scheduled,\n"
                          "        'body_started': body_started,\n"
                          "        'done': done,\n"
                          "        'result_ready': result_ready,\n"
                          '    }\n'}],
 144: [{'title': 'Последовательное и конкурентное ожидание',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните total_ms и timeline. В sequential total_ms равен сумме delays; timeline содержит словари '
                  'operation, start_ms и finish_ms, где каждая operation начинается после предыдущей. В concurrent '
                  'все operations стартуют в 0, finish_ms равен собственной delay, а total_ms равен максимальной '
                  'delay или 0 для пустого списка. Порядок timeline соответствует delays_ms.',
        'contract': {'given': 'Автопроверка вызывает solve(delays_ms, mode). delays_ms — список длительностей '
                              'независимых I/O operations. mode равен sequential или concurrent.',
                     'todo': 'Верните total_ms и timeline. В sequential total_ms равен сумме delays; timeline '
                             'содержит словари operation, start_ms и finish_ms, где каждая operation начинается '
                             'после предыдущей. В concurrent все operations стартуют в 0, finish_ms равен '
                             'собственной delay, а total_ms равен максимальной delay или 0 для пустого списка. '
                             'Порядок timeline соответствует delays_ms.',
                     'check': 'Платформа сравнит одинаковый набор delays в двух modes, одну operation и пустой '
                              'список. Два последовательных await должны давать сумму ожиданий, а конкурентный '
                              'запуск — максимум.'},
        'requirements': {'items': ['sequential total как сумма',
                                   'concurrent total как максимум',
                                   'явные start и finish',
                                   'пустой список'],
                         'names': ['delays_ms', 'mode', 'timeline'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['enumerate', 'max'],
                         'attributes': ['append']},
        'starter_code': 'def solve(delays_ms, mode):\n'
                        '    timeline = []\n'
                        '    # Постройте timeline и total_ms\n'
                        '    pass\n',
        'tests': [{'name': 'sequential',
                   'args': [[40, 70, 20], 'sequential'],
                   'expected': {'total_ms': 130,
                                'timeline': [{'operation': 1, 'start_ms': 0, 'finish_ms': 40},
                                             {'operation': 2, 'start_ms': 40, 'finish_ms': 110},
                                             {'operation': 3, 'start_ms': 110, 'finish_ms': 130}]}},
                  {'name': 'concurrent',
                   'args': [[40, 70, 20], 'concurrent'],
                   'expected': {'total_ms': 70,
                                'timeline': [{'operation': 1, 'start_ms': 0, 'finish_ms': 40},
                                             {'operation': 2, 'start_ms': 0, 'finish_ms': 70},
                                             {'operation': 3, 'start_ms': 0, 'finish_ms': 20}]}},
                  {'name': 'пустой', 'args': [[], 'concurrent'], 'expected': {'total_ms': 0, 'timeline': []}}],
        'reference_code': 'def solve(delays_ms, mode):\n'
                          '    timeline = []\n'
                          "    if mode == 'sequential':\n"
                          '        current_ms = 0\n'
                          '        for index, delay in enumerate(delays_ms, start=1):\n'
                          '            finish_ms = current_ms + delay\n'
                          '            timeline.append({\n'
                          "                'operation': index,\n"
                          "                'start_ms': current_ms,\n"
                          "                'finish_ms': finish_ms,\n"
                          '            })\n'
                          '            current_ms = finish_ms\n'
                          "        return {'total_ms': current_ms, 'timeline': timeline}\n"
                          '    for index, delay in enumerate(delays_ms, start=1):\n'
                          '        timeline.append({\n'
                          "            'operation': index,\n"
                          "            'start_ms': 0,\n"
                          "            'finish_ms': delay,\n"
                          '        })\n'
                          '    total_ms = max(delays_ms) if delays_ms else 0\n'
                          "    return {'total_ms': total_ms, 'timeline': timeline}\n"}],
 147: [{'title': 'Жизненный цикл Task',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Начальное state равно new, result равно None, cleanup=False. create переводит new → scheduled. '
                  'loop_tick переводит scheduled → running. await_io переводит running → waiting. io_ready переводит '
                  'waiting → running. cancel из scheduled, running или waiting переводит state в cancelled и '
                  "cleanup=True. collect из running переводит state в done и result='success'. События после done "
                  'или cancelled не меняют результат. Верните state, result и cleanup.',
        'contract': {'given': 'Автопроверка вызывает solve(events). events — список строк create, loop_tick, '
                              'await_io, io_ready, cancel, collect.',
                     'todo': 'Начальное state равно new, result равно None, cleanup=False. create переводит new → '
                             'scheduled. loop_tick переводит scheduled → running. await_io переводит running → '
                             'waiting. io_ready переводит waiting → running. cancel из scheduled, running или '
                             'waiting переводит state в cancelled и cleanup=True. collect из running переводит state '
                             "в done и result='success'. События после done или cancelled не меняют результат. "
                             'Верните state, result и cleanup.',
                     'check': 'Проверяются успешный Task, Task в ожидании, отмена во время I/O и события после '
                              'завершения. Отмена должна включать cleanup и не создавать success.'},
        'requirements': {'items': ['states scheduled/running/waiting',
                                   'cancelled terminal state',
                                   'cleanup при cancellation',
                                   'success только после collect'],
                         'names': ['events', 'state', 'result', 'cleanup'],
                         'nodes': ['FunctionDef', 'For', 'If']},
        'starter_code': 'def solve(events):\n'
                        "    state = 'new'\n"
                        '    result = None\n'
                        '    cleanup = False\n'
                        '    # Выполните переходы состояний\n'
                        '    pass\n',
        'tests': [{'name': 'успешный Task',
                   'args': [['create', 'loop_tick', 'await_io', 'io_ready', 'collect']],
                   'expected': {'state': 'done', 'result': 'success', 'cleanup': False}},
                  {'name': 'ожидает I/O',
                   'args': [['create', 'loop_tick', 'await_io']],
                   'expected': {'state': 'waiting', 'result': None, 'cleanup': False}},
                  {'name': 'отменён во время ожидания',
                   'args': [['create', 'loop_tick', 'await_io', 'cancel', 'io_ready', 'collect']],
                   'expected': {'state': 'cancelled', 'result': None, 'cleanup': True}}],
        'reference_code': 'def solve(events):\n'
                          "    state = 'new'\n"
                          '    result = None\n'
                          '    cleanup = False\n'
                          '    for event in events:\n'
                          "        if state in ('done', 'cancelled'):\n"
                          '            continue\n'
                          "        if event == 'create' and state == 'new':\n"
                          "            state = 'scheduled'\n"
                          "        elif event == 'loop_tick' and state == 'scheduled':\n"
                          "            state = 'running'\n"
                          "        elif event == 'await_io' and state == 'running':\n"
                          "            state = 'waiting'\n"
                          "        elif event == 'io_ready' and state == 'waiting':\n"
                          "            state = 'running'\n"
                          "        elif event == 'cancel' and state in ('scheduled', 'running', 'waiting'):\n"
                          "            state = 'cancelled'\n"
                          '            cleanup = True\n'
                          "        elif event == 'collect' and state == 'running':\n"
                          "            state = 'done'\n"
                          "            result = 'success'\n"
                          "    return {'state': state, 'result': result, 'cleanup': cleanup}\n"}],
 148: [{'title': 'Порядок результатов gather',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните completion_order и gathered_results. completion_order — names по возрастанию duration_ms; '
                  'при равной duration сохраняйте исходный порядок. gathered_results — values result в исходном '
                  'порядке jobs, независимо от времени завершения. Также верните total_ms как максимальную duration '
                  'или 0.',
        'contract': {'given': 'Автопроверка вызывает solve(jobs). jobs — список словарей name, duration_ms и result. '
                              'Все jobs запускаются одновременно.',
                     'todo': 'Верните completion_order и gathered_results. completion_order — names по возрастанию '
                             'duration_ms; при равной duration сохраняйте исходный порядок. gathered_results — '
                             'values result в исходном порядке jobs, независимо от времени завершения. Также верните '
                             'total_ms как максимальную duration или 0.',
                     'check': 'Проверяется различающийся порядок завершения, одинаковая duration и пустой список. '
                              'Главная проверка: gather сохраняет порядок входных awaitables, а не completion '
                              'order.'},
        'requirements': {'items': ['completion order по duration',
                                   'стабильность при равной duration',
                                   'gather result в исходном порядке',
                                   'total как максимум'],
                         'names': ['jobs', 'completion_order', 'gathered_results', 'total_ms'],
                         'nodes': ['FunctionDef', 'For', 'Lambda'],
                         'calls': ['enumerate', 'max'],
                         'attributes': ['append', 'sort']},
        'starter_code': 'def solve(jobs):\n    # Верните два разных порядка и total_ms\n    pass\n',
        'tests': [{'name': 'разный порядок',
                   'args': [[{'name': 'profile', 'duration_ms': 80, 'result': 'P'},
                             {'name': 'stats', 'duration_ms': 20, 'result': 'S'},
                             {'name': 'recommendations', 'duration_ms': 50, 'result': 'R'}]],
                   'expected': {'completion_order': ['stats', 'recommendations', 'profile'],
                                'gathered_results': ['P', 'S', 'R'],
                                'total_ms': 80}},
                  {'name': 'равная duration',
                   'args': [[{'name': 'a', 'duration_ms': 10, 'result': 1},
                             {'name': 'b', 'duration_ms': 10, 'result': 2}]],
                   'expected': {'completion_order': ['a', 'b'], 'gathered_results': [1, 2], 'total_ms': 10}},
                  {'name': 'пустой',
                   'args': [[]],
                   'expected': {'completion_order': [], 'gathered_results': [], 'total_ms': 0}}],
        'reference_code': 'def solve(jobs):\n'
                          '    indexed_jobs = []\n'
                          '    for index, job in enumerate(jobs):\n'
                          "        indexed_jobs.append((job['duration_ms'], index, job))\n"
                          '    indexed_jobs.sort(key=lambda item: (item[0], item[1]))\n'
                          '    completion_order = []\n'
                          '    for _, _, job in indexed_jobs:\n'
                          "        completion_order.append(job['name'])\n"
                          '    gathered_results = []\n'
                          '    for job in jobs:\n'
                          "        gathered_results.append(job['result'])\n"
                          "    total_ms = max([job['duration_ms'] for job in jobs]) if jobs else 0\n"
                          '    return {\n'
                          "        'completion_order': completion_order,\n"
                          "        'gathered_results': gathered_results,\n"
                          "        'total_ms': total_ms,\n"
                          '    }\n'}],
 149: [{'title': 'Timeout как отдельный исход',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Для каждой operation верните словарь name, status и value. Если duration_ms строго меньше '
                  "timeout_ms, status='success', value получает result. Если duration_ms не меньше timeout_ms, "
                  "status='timeout', value=None. Верните results в исходном порядке, success_count и timeout_count. "
                  'Timeout не является retry: не запускайте operation второй раз.',
        'contract': {'given': 'Автопроверка вызывает solve(operations, timeout_ms). operations — список словарей '
                              'name, duration_ms и result.',
                     'todo': 'Для каждой operation верните словарь name, status и value. Если duration_ms строго '
                             "меньше timeout_ms, status='success', value получает result. Если duration_ms не меньше "
                             "timeout_ms, status='timeout', value=None. Верните results в исходном порядке, "
                             'success_count и timeout_count. Timeout не является retry: не запускайте operation '
                             'второй раз.',
                     'check': 'Проверяется success, точная граница timeout, несколько operations и пустой список. '
                              'Operation на границе duration_ms == timeout_ms считается timeout.'},
        'requirements': {'items': ['строгая граница duration < timeout',
                                   'success и timeout как разные statuses',
                                   'value None для timeout',
                                   'два счётчика'],
                         'names': ['operations', 'timeout_ms', 'results', 'success_count', 'timeout_count'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['append']},
        'starter_code': 'def solve(operations, timeout_ms):\n'
                        '    results = []\n'
                        '    success_count = 0\n'
                        '    timeout_count = 0\n'
                        '    # Классифицируйте каждую operation\n'
                        '    pass\n',
        'tests': [{'name': 'смешанный результат',
                   'args': [[{'name': 'fast', 'duration_ms': 20, 'result': 'ok'},
                             {'name': 'edge', 'duration_ms': 50, 'result': 'late'},
                             {'name': 'slow', 'duration_ms': 90, 'result': 'very late'}],
                            50],
                   'expected': {'results': [{'name': 'fast', 'status': 'success', 'value': 'ok'},
                                            {'name': 'edge', 'status': 'timeout', 'value': None},
                                            {'name': 'slow', 'status': 'timeout', 'value': None}],
                                'success_count': 1,
                                'timeout_count': 2}},
                  {'name': 'все успешны',
                   'args': [[{'name': 'a', 'duration_ms': 1, 'result': 1},
                             {'name': 'b', 'duration_ms': 2, 'result': 2}],
                            10],
                   'expected': {'results': [{'name': 'a', 'status': 'success', 'value': 1},
                                            {'name': 'b', 'status': 'success', 'value': 2}],
                                'success_count': 2,
                                'timeout_count': 0}}],
        'reference_code': 'def solve(operations, timeout_ms):\n'
                          '    results = []\n'
                          '    success_count = 0\n'
                          '    timeout_count = 0\n'
                          '    for operation in operations:\n'
                          "        if operation['duration_ms'] < timeout_ms:\n"
                          '            results.append({\n'
                          "                'name': operation['name'],\n"
                          "                'status': 'success',\n"
                          "                'value': operation['result'],\n"
                          '            })\n'
                          '            success_count += 1\n'
                          '        else:\n'
                          '            results.append({\n'
                          "                'name': operation['name'],\n"
                          "                'status': 'timeout',\n"
                          "                'value': None,\n"
                          '            })\n'
                          '            timeout_count += 1\n'
                          '    return {\n'
                          "        'results': results,\n"
                          "        'success_count': success_count,\n"
                          "        'timeout_count': timeout_count,\n"
                          '    }\n'}],
 151: [{'title': 'Ограниченная concurrency',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Смоделируйте выполнение по batches. Каждый batch содержит не больше limit operations и длится '
                  'столько, сколько самая медленная operation в batch. Верните batches как список исходных '
                  'durations, total_ms как сумму длительностей batches и max_active как min(limit, количество '
                  'operations). При пустом списке max_active и total_ms равны 0.',
        'contract': {'given': 'Автопроверка вызывает solve(durations_ms, limit). durations_ms — список длительностей '
                              'независимых operations, limit — максимальное число одновременно активных operations.',
                     'todo': 'Смоделируйте выполнение по batches. Каждый batch содержит не больше limit operations и '
                             'длится столько, сколько самая медленная operation в batch. Верните batches как список '
                             'исходных durations, total_ms как сумму длительностей batches и max_active как '
                             'min(limit, количество operations). При пустом списке max_active и total_ms равны 0.',
                     'check': 'Проверяется limit 1, limit 2, limit больше числа operations и пустой список. Решение '
                              'должно показать, что меньший semaphore limit уменьшает одновременную нагрузку, но '
                              'может увеличить общее время.'},
        'requirements': {'items': ['не больше limit в batch',
                                   'batch duration как maximum',
                                   'total как сумма batches',
                                   'max_active'],
                         'names': ['durations_ms', 'limit', 'batches', 'total_ms', 'max_active'],
                         'nodes': ['FunctionDef', 'While', 'IfExp'],
                         'calls': ['len', 'max', 'min'],
                         'attributes': ['append']},
        'starter_code': 'def solve(durations_ms, limit):\n'
                        '    batches = []\n'
                        '    # Разбейте операции на ограниченные batches\n'
                        '    pass\n',
        'tests': [{'name': 'limit два',
                   'args': [[40, 70, 20, 50, 10], 2],
                   'expected': {'batches': [[40, 70], [20, 50], [10]], 'total_ms': 130, 'max_active': 2}},
                  {'name': 'последовательно',
                   'args': [[40, 70, 20], 1],
                   'expected': {'batches': [[40], [70], [20]], 'total_ms': 130, 'max_active': 1}},
                  {'name': 'limit больше списка',
                   'args': [[40, 70, 20], 10],
                   'expected': {'batches': [[40, 70, 20]], 'total_ms': 70, 'max_active': 3}},
                  {'name': 'пустой', 'args': [[], 3], 'expected': {'batches': [], 'total_ms': 0, 'max_active': 0}}],
        'reference_code': 'def solve(durations_ms, limit):\n'
                          '    batches = []\n'
                          '    total_ms = 0\n'
                          '    index = 0\n'
                          '    while index < len(durations_ms):\n'
                          '        batch = durations_ms[index:index + limit]\n'
                          '        batches.append(batch)\n'
                          '        total_ms += max(batch)\n'
                          '        index += limit\n'
                          '    max_active = min(limit, len(durations_ms)) if durations_ms else 0\n'
                          '    return {\n'
                          "        'batches': batches,\n"
                          "        'total_ms': total_ms,\n"
                          "        'max_active': max_active,\n"
                          '    }\n'}],
 152: [{'title': 'Структурированный частичный результат',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Верните items, summary и overall_status. Для success сохраните value. Для error и timeout '
                  'установите value=None. summary содержит counts success, error и timeout. overall_status равен '
                  'success, если все operations успешны; partial, если есть хотя бы один success и хотя бы один '
                  'failure; failed, если success нет. Пустой список считается failed.',
        'contract': {'given': 'Автопроверка вызывает solve(operations). operations — список словарей name, outcome и '
                              'value. outcome равен success, error или timeout.',
                     'todo': 'Верните items, summary и overall_status. Для success сохраните value. Для error и '
                             'timeout установите value=None. summary содержит counts success, error и timeout. '
                             'overall_status равен success, если все operations успешны; partial, если есть хотя бы '
                             'один success и хотя бы один failure; failed, если success нет. Пустой список считается '
                             'failed.',
                     'check': 'Проверяются полный успех, partial response, полный failure и пустой список. Порядок '
                              'items сохраняется.'},
        'requirements': {'items': ['три явных status',
                                   'value только для success',
                                   'summary counts',
                                   'overall success/partial/failed'],
                         'names': ['operations', 'items', 'summary', 'overall_status'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['len'],
                         'attributes': ['append']},
        'starter_code': 'def solve(operations):\n'
                        '    items = []\n'
                        "    summary = {'success': 0, 'error': 0, 'timeout': 0}\n"
                        '    # Соберите структурированный итог\n'
                        '    pass\n',
        'tests': [{'name': 'partial',
                   'args': [[{'name': 'profile', 'outcome': 'success', 'value': {'id': 7}},
                             {'name': 'stats', 'outcome': 'timeout', 'value': {'count': 4}},
                             {'name': 'recommendations', 'outcome': 'error', 'value': ['x']}]],
                   'expected': {'items': [{'name': 'profile', 'status': 'success', 'value': {'id': 7}},
                                          {'name': 'stats', 'status': 'timeout', 'value': None},
                                          {'name': 'recommendations', 'status': 'error', 'value': None}],
                                'summary': {'success': 1, 'error': 1, 'timeout': 1},
                                'overall_status': 'partial'}},
                  {'name': 'всё успешно',
                   'args': [[{'name': 'a', 'outcome': 'success', 'value': 1},
                             {'name': 'b', 'outcome': 'success', 'value': 2}]],
                   'expected': {'items': [{'name': 'a', 'status': 'success', 'value': 1},
                                          {'name': 'b', 'status': 'success', 'value': 2}],
                                'summary': {'success': 2, 'error': 0, 'timeout': 0},
                                'overall_status': 'success'}},
                  {'name': 'нет успехов',
                   'args': [[{'name': 'a', 'outcome': 'error', 'value': 1},
                             {'name': 'b', 'outcome': 'timeout', 'value': 2}]],
                   'expected': {'items': [{'name': 'a', 'status': 'error', 'value': None},
                                          {'name': 'b', 'status': 'timeout', 'value': None}],
                                'summary': {'success': 0, 'error': 1, 'timeout': 1},
                                'overall_status': 'failed'}}],
        'reference_code': 'def solve(operations):\n'
                          '    items = []\n'
                          "    summary = {'success': 0, 'error': 0, 'timeout': 0}\n"
                          '    for operation in operations:\n'
                          "        status = operation['outcome']\n"
                          '        summary[status] += 1\n'
                          "        value = operation['value'] if status == 'success' else None\n"
                          '        items.append({\n'
                          "            'name': operation['name'],\n"
                          "            'status': status,\n"
                          "            'value': value,\n"
                          '        })\n'
                          "    failures = summary['error'] + summary['timeout']\n"
                          "    if summary['success'] == len(operations) and operations:\n"
                          "        overall_status = 'success'\n"
                          "    elif summary['success'] > 0 and failures > 0:\n"
                          "        overall_status = 'partial'\n"
                          '    else:\n'
                          "        overall_status = 'failed'\n"
                          '    return {\n'
                          "        'items': items,\n"
                          "        'summary': summary,\n"
                          "        'overall_status': overall_status,\n"
                          '    }\n'}],
 153: [{'title': 'Выбор def или async def',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните endpoint_style, execution_place и reason. awaitable + io → async def, event_loop, '
                  'awaitable_io. blocking + io → def, threadpool, blocking_library. Любой cpu → def, '
                  'process_or_worker, cpu_bound. Не выбирайте async def только по названию endpoint.',
        'contract': {'given': 'Автопроверка вызывает solve(library_kind, work_kind). library_kind равен blocking или '
                              'awaitable. work_kind равен io или cpu.',
                     'todo': 'Верните endpoint_style, execution_place и reason. awaitable + io → async def, '
                             'event_loop, awaitable_io. blocking + io → def, threadpool, blocking_library. Любой cpu '
                             '→ def, process_or_worker, cpu_bound. Не выбирайте async def только по названию '
                             'endpoint.',
                     'check': 'Проверяются awaitable network client, blocking library и CPU-heavy calculation. '
                              'Сравниваются все три поля.'},
        'requirements': {'items': ['CPU boundary имеет приоритет',
                                   'async def только для awaitable I/O',
                                   'blocking I/O остаётся def',
                                   'явное место выполнения'],
                         'names': ['library_kind', 'work_kind'],
                         'nodes': ['FunctionDef', 'If']},
        'starter_code': 'def solve(library_kind, work_kind):\n'
                        '    # Выберите форму endpoint по типу работы\n'
                        '    pass\n',
        'tests': [{'name': 'awaitable I/O',
                   'args': ['awaitable', 'io'],
                   'expected': {'endpoint_style': 'async def',
                                'execution_place': 'event_loop',
                                'reason': 'awaitable_io'}},
                  {'name': 'blocking I/O',
                   'args': ['blocking', 'io'],
                   'expected': {'endpoint_style': 'def',
                                'execution_place': 'threadpool',
                                'reason': 'blocking_library'}},
                  {'name': 'CPU work',
                   'args': ['awaitable', 'cpu'],
                   'expected': {'endpoint_style': 'def',
                                'execution_place': 'process_or_worker',
                                'reason': 'cpu_bound'}}],
        'reference_code': 'def solve(library_kind, work_kind):\n'
                          "    if work_kind == 'cpu':\n"
                          '        return {\n'
                          "            'endpoint_style': 'def',\n"
                          "            'execution_place': 'process_or_worker',\n"
                          "            'reason': 'cpu_bound',\n"
                          '        }\n'
                          "    if library_kind == 'awaitable':\n"
                          '        return {\n'
                          "            'endpoint_style': 'async def',\n"
                          "            'execution_place': 'event_loop',\n"
                          "            'reason': 'awaitable_io',\n"
                          '        }\n'
                          '    return {\n'
                          "        'endpoint_style': 'def',\n"
                          "        'execution_place': 'threadpool',\n"
                          "        'reason': 'blocking_library',\n"
                          '    }\n'}],
 155: [{'title': 'Карта сетевых ошибок в HTTP',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните status, code и retryable. success → 200, ok, False. connect_timeout и read_timeout → 504, '
                  'upstream_timeout, True. connection_error → 503, upstream_unavailable, True. http_error со status '
                  '404 → 502, upstream_not_found, False. Остальной http_error → 502, upstream_error, upstream_status '
                  'не меньше 500. Не возвращайте traceback.',
        'contract': {'given': 'Автопроверка вызывает solve(outcome, upstream_status). outcome равен success, '
                              'connect_timeout, read_timeout, connection_error или http_error. upstream_status — '
                              'целое число или None.',
                     'todo': 'Верните status, code и retryable. success → 200, ok, False. connect_timeout и '
                             'read_timeout → 504, upstream_timeout, True. connection_error → 503, '
                             'upstream_unavailable, True. http_error со status 404 → 502, upstream_not_found, False. '
                             'Остальной http_error → 502, upstream_error, upstream_status не меньше 500. Не '
                             'возвращайте traceback.',
                     'check': 'Проверяются все виды outcome и upstream statuses 404, 422 и 503. Сравниваются '
                              'безопасный status, code и retryable.'},
        'requirements': {'items': ['504 для timeout',
                                   '503 для недоступной сети',
                                   '502 для upstream HTTP error',
                                   'retryable зависит от вида сбоя'],
                         'names': ['outcome', 'upstream_status'],
                         'nodes': ['FunctionDef', 'If', 'BoolOp']},
        'starter_code': 'def solve(outcome, upstream_status):\n'
                        '    # Преобразуйте upstream outcome в StudyHub contract\n'
                        '    pass\n',
        'tests': [{'name': 'success',
                   'args': ['success', 200],
                   'expected': {'status': 200, 'code': 'ok', 'retryable': False}},
                  {'name': 'read timeout',
                   'args': ['read_timeout', None],
                   'expected': {'status': 504, 'code': 'upstream_timeout', 'retryable': True}},
                  {'name': 'connection error',
                   'args': ['connection_error', None],
                   'expected': {'status': 503, 'code': 'upstream_unavailable', 'retryable': True}},
                  {'name': 'upstream 404',
                   'args': ['http_error', 404],
                   'expected': {'status': 502, 'code': 'upstream_not_found', 'retryable': False}},
                  {'name': 'upstream 503',
                   'args': ['http_error', 503],
                   'expected': {'status': 502, 'code': 'upstream_error', 'retryable': True}}],
        'reference_code': 'def solve(outcome, upstream_status):\n'
                          "    if outcome == 'success':\n"
                          "        return {'status': 200, 'code': 'ok', 'retryable': False}\n"
                          "    if outcome in ('connect_timeout', 'read_timeout'):\n"
                          '        return {\n'
                          "            'status': 504,\n"
                          "            'code': 'upstream_timeout',\n"
                          "            'retryable': True,\n"
                          '        }\n'
                          "    if outcome == 'connection_error':\n"
                          '        return {\n'
                          "            'status': 503,\n"
                          "            'code': 'upstream_unavailable',\n"
                          "            'retryable': True,\n"
                          '        }\n'
                          '    if upstream_status == 404:\n'
                          '        return {\n'
                          "            'status': 502,\n"
                          "            'code': 'upstream_not_found',\n"
                          "            'retryable': False,\n"
                          '        }\n'
                          '    return {\n'
                          "        'status': 502,\n"
                          "        'code': 'upstream_error',\n"
                          "        'retryable': upstream_status is not None and upstream_status >= 500,\n"
                          '    }\n'}],
 162: [{'title': 'Async transaction без частичного commit',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Создайте copies входных данных. В transaction измените is_done на True и добавьте audit event '
                  'task_completed. При fail_audit_insert верните исходные данные, status rolled_back, '
                  'committed=False и rollback_awaited=True. При успехе верните оба изменения, status committed, '
                  'committed=True и rollback_awaited=False.',
        'contract': {'given': 'Автопроверка вызывает solve(task, audit_events, fail_audit_insert). task — словарь id '
                              'и is_done. audit_events — список словарей. fail_audit_insert моделирует '
                              'IntegrityError второго database statement.',
                     'todo': 'Создайте copies входных данных. В transaction измените is_done на True и добавьте '
                             'audit event task_completed. При fail_audit_insert верните исходные данные, status '
                             'rolled_back, committed=False и rollback_awaited=True. При успехе верните оба '
                             'изменения, status committed, committed=True и rollback_awaited=False.',
                     'check': 'Проверяется успешный transaction и ошибка второго statement. Асинхронный способ '
                              'выполнения не отменяет атомарность: при ошибке не должно оставаться частично '
                              'изменённой Task.'},
        'requirements': {'items': ['copies входных данных',
                                   'два связанных изменения',
                                   'полный rollback',
                                   'явный rollback_awaited'],
                         'names': ['task', 'audit_events', 'fail_audit_insert'],
                         'nodes': ['FunctionDef', 'If'],
                         'calls': ['dict', 'list'],
                         'attributes': ['append']},
        'starter_code': 'def solve(task, audit_events, fail_audit_insert):\n'
                        '    # Смоделируйте transaction boundary\n'
                        '    pass\n',
        'tests': [{'name': 'commit',
                   'args': [{'id': 5, 'is_done': False}, [], False],
                   'expected': {'status': 'committed',
                                'committed': True,
                                'rollback_awaited': False,
                                'task': {'id': 5, 'is_done': True},
                                'audit_events': [{'task_id': 5, 'event': 'task_completed'}]}},
                  {'name': 'rollback',
                   'args': [{'id': 5, 'is_done': False}, [], True],
                   'expected': {'status': 'rolled_back',
                                'committed': False,
                                'rollback_awaited': True,
                                'task': {'id': 5, 'is_done': False},
                                'audit_events': []}}],
        'reference_code': 'def solve(task, audit_events, fail_audit_insert):\n'
                          '    original_task = dict(task)\n'
                          '    original_events = list(audit_events)\n'
                          '    working_task = dict(task)\n'
                          '    working_events = list(audit_events)\n'
                          "    working_task['is_done'] = True\n"
                          '    if fail_audit_insert:\n'
                          '        return {\n'
                          "            'status': 'rolled_back',\n"
                          "            'committed': False,\n"
                          "            'rollback_awaited': True,\n"
                          "            'task': original_task,\n"
                          "            'audit_events': original_events,\n"
                          '        }\n'
                          '    working_events.append({\n'
                          "        'task_id': working_task['id'],\n"
                          "        'event': 'task_completed',\n"
                          '    })\n'
                          '    return {\n'
                          "        'status': 'committed',\n"
                          "        'committed': True,\n"
                          "        'rollback_awaited': False,\n"
                          "        'task': working_task,\n"
                          "        'audit_events': working_events,\n"
                          '    }\n'}],
 163: [{'title': 'N+1 и давление на connection pool',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Рассчитайте sql_queries: для lazy это 1 + parent_count, для selectin это 1 при parent_count=0, '
                  'иначе 2. active_connections равно min(concurrent_requests, pool_size). queued_requests равно '
                  'max(concurrent_requests - pool_size, 0). Верните sql_queries, active_connections, queued_requests '
                  'и n_plus_one, который True только для lazy и parent_count > 0.',
        'contract': {'given': 'Автопроверка вызывает solve(parent_count, loading_strategy, concurrent_requests, '
                              'pool_size). loading_strategy равен lazy или selectin.',
                     'todo': 'Рассчитайте sql_queries: для lazy это 1 + parent_count, для selectin это 1 при '
                             'parent_count=0, иначе 2. active_connections равно min(concurrent_requests, pool_size). '
                             'queued_requests равно max(concurrent_requests - pool_size, 0). Верните sql_queries, '
                             'active_connections, queued_requests и n_plus_one, который True только для lazy и '
                             'parent_count > 0.',
                     'check': 'Проверяются lazy/selectin, пустой список и pool pressure. Async не должен скрывать '
                              'N+1 и не создаёт бесконечный connection pool.'},
        'requirements': {'items': ['lazy query count',
                                   'selectin query count',
                                   'pool size ограничивает active connections',
                                   'остальные requests ждут в очереди'],
                         'names': ['parent_count',
                                   'loading_strategy',
                                   'concurrent_requests',
                                   'pool_size',
                                   'sql_queries',
                                   'active_connections',
                                   'queued_requests',
                                   'n_plus_one'],
                         'nodes': ['FunctionDef', 'If', 'BoolOp'],
                         'calls': ['min', 'max']},
        'starter_code': 'def solve(parent_count, loading_strategy, concurrent_requests, pool_size):\n'
                        '    # Посчитайте SQL и состояние pool\n'
                        '    pass\n',
        'tests': [{'name': 'lazy и очередь',
                   'args': [5, 'lazy', 12, 4],
                   'expected': {'sql_queries': 6, 'active_connections': 4, 'queued_requests': 8, 'n_plus_one': True}},
                  {'name': 'selectin',
                   'args': [5, 'selectin', 3, 10],
                   'expected': {'sql_queries': 2,
                                'active_connections': 3,
                                'queued_requests': 0,
                                'n_plus_one': False}},
                  {'name': 'нет parents',
                   'args': [0, 'selectin', 0, 5],
                   'expected': {'sql_queries': 1,
                                'active_connections': 0,
                                'queued_requests': 0,
                                'n_plus_one': False}}],
        'reference_code': 'def solve(parent_count, loading_strategy, concurrent_requests, pool_size):\n'
                          "    if loading_strategy == 'lazy':\n"
                          '        sql_queries = 1 + parent_count\n'
                          '    else:\n'
                          '        sql_queries = 2 if parent_count > 0 else 1\n'
                          '    active_connections = min(concurrent_requests, pool_size)\n'
                          '    queued_requests = max(concurrent_requests - pool_size, 0)\n'
                          "    n_plus_one = loading_strategy == 'lazy' and parent_count > 0\n"
                          '    return {\n'
                          "        'sql_queries': sql_queries,\n"
                          "        'active_connections': active_connections,\n"
                          "        'queued_requests': queued_requests,\n"
                          "        'n_plus_one': n_plus_one,\n"
                          '    }\n'}]}

DEPLOY_CODE_TASKS: dict[int, list[dict[str, Any]]] = {166: [{'title': 'Диагностика process и port',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Найдите running process, который слушает target_port. Если process не найден, верните status '
                  'free, pid None и shutdown graceful=False. Если найден, верните status occupied и его pid. Для '
                  "SIGINT и SIGTERM shutdown graceful=True и final_state='stopped'. Для SIGKILL shutdown "
                  "graceful=False и final_state='killed'. Не изменяйте входной список.",
        'contract': {'given': 'Автопроверка вызывает solve(processes, target_port, signal). processes — список '
                              'словарей pid, name, port и state. signal равен SIGINT, SIGTERM или SIGKILL.',
                     'todo': 'Найдите running process, который слушает target_port. Если process не найден, верните '
                             'status free, pid None и shutdown graceful=False. Если найден, верните status occupied '
                             "и его pid. Для SIGINT и SIGTERM shutdown graceful=True и final_state='stopped'. Для "
                             "SIGKILL shutdown graceful=False и final_state='killed'. Не изменяйте входной список.",
                     'check': 'Платформа проверит свободный port, занятый port, корректный SIGTERM и принудительный '
                              'SIGKILL. Stopped process не должен считаться слушающим.'},
        'requirements': {'items': ['поиск только running process',
                                   'сопоставление target_port',
                                   'SIGINT и SIGTERM как graceful',
                                   'SIGKILL как forced'],
                         'names': ['processes', 'target_port', 'signal', 'found', 'graceful', 'final_state'],
                         'nodes': ['FunctionDef', 'For', 'If', 'BoolOp']},
        'starter_code': 'def solve(processes, target_port, signal):\n'
                        '    # Найдите process и определите результат сигнала\n'
                        '    pass\n',
        'tests': [{'name': 'port свободен',
                   'args': [[{'pid': 10, 'name': 'uvicorn', 'port': 8000, 'state': 'stopped'}], 8000, 'SIGTERM'],
                   'expected': {'status': 'free', 'pid': None, 'graceful': False, 'final_state': None}},
                  {'name': 'graceful SIGTERM',
                   'args': [[{'pid': 11, 'name': 'uvicorn', 'port': 8000, 'state': 'running'},
                             {'pid': 12, 'name': 'worker', 'port': 9000, 'state': 'running'}],
                            8000,
                            'SIGTERM'],
                   'expected': {'status': 'occupied', 'pid': 11, 'graceful': True, 'final_state': 'stopped'}},
                  {'name': 'принудительный SIGKILL',
                   'args': [[{'pid': 21, 'name': 'uvicorn', 'port': 8080, 'state': 'running'}], 8080, 'SIGKILL'],
                   'expected': {'status': 'occupied', 'pid': 21, 'graceful': False, 'final_state': 'killed'}}],
        'reference_code': 'def solve(processes, target_port, signal):\n'
                          '    found = None\n'
                          '    for process in processes:\n'
                          "        if process['state'] == 'running' and process['port'] == target_port:\n"
                          '            found = process\n'
                          '            break\n'
                          '    if found is None:\n'
                          '        return {\n'
                          "            'status': 'free',\n"
                          "            'pid': None,\n"
                          "            'graceful': False,\n"
                          "            'final_state': None,\n"
                          '        }\n'
                          "    graceful = signal in ('SIGINT', 'SIGTERM')\n"
                          "    final_state = 'stopped' if graceful else 'killed'\n"
                          '    return {\n'
                          "        'status': 'occupied',\n"
                          "        'pid': found['pid'],\n"
                          "        'graceful': graceful,\n"
                          "        'final_state': final_state,\n"
                          '    }\n'}],
 167: [{'title': 'Сборка Settings из environment',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Соберите config: значения env имеют приоритет над defaults. Пустая строка после strip считается '
                  'отсутствующим значением. Верните config, missing и safe_preview. missing содержит обязательные '
                  'ключи без значения в порядке required. safe_preview содержит APP_ENV, LOG_LEVEL и DATABASE_URL, '
                  "но DATABASE_URL нужно заменить строкой 'configured', если значение есть, иначе 'missing'. "
                  'SECRET_KEY запрещено включать в safe_preview.',
        'contract': {'given': 'Автопроверка вызывает solve(env, defaults, required). env и defaults — словари '
                              'строковых значений. required — список обязательных ключей.',
                     'todo': 'Соберите config: значения env имеют приоритет над defaults. Пустая строка после strip '
                             'считается отсутствующим значением. Верните config, missing и safe_preview. missing '
                             'содержит обязательные ключи без значения в порядке required. safe_preview содержит '
                             'APP_ENV, LOG_LEVEL и DATABASE_URL, но DATABASE_URL нужно заменить строкой '
                             "'configured', если значение есть, иначе 'missing'. SECRET_KEY запрещено включать в "
                             'safe_preview.',
                     'check': 'Проверяются default values, environment override, пустая строка и отсутствующий '
                              'SECRET_KEY. Секрет не должен появиться в preview.'},
        'requirements': {'items': ['environment имеет приоритет',
                                   'пустые строки удаляются',
                                   'missing сохраняет порядок required',
                                   'SECRET_KEY отсутствует в preview'],
                         'names': ['env', 'defaults', 'required', 'config', 'missing', 'safe_preview'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['str'],
                         'attributes': ['items', 'strip', 'pop', 'append', 'get']},
        'starter_code': 'def solve(env, defaults, required):\n'
                        '    # Соберите config, missing и безопасный preview\n'
                        '    pass\n',
        'tests': [{'name': 'env переопределяет defaults',
                   'args': [{'APP_ENV': 'production', 'DATABASE_URL': 'postgresql://prod', 'SECRET_KEY': 'secret'},
                            {'APP_ENV': 'development', 'LOG_LEVEL': 'INFO'},
                            ['DATABASE_URL', 'SECRET_KEY']],
                   'expected': {'config': {'APP_ENV': 'production',
                                           'LOG_LEVEL': 'INFO',
                                           'DATABASE_URL': 'postgresql://prod',
                                           'SECRET_KEY': 'secret'},
                                'missing': [],
                                'safe_preview': {'APP_ENV': 'production',
                                                 'LOG_LEVEL': 'INFO',
                                                 'DATABASE_URL': 'configured'}}},
                  {'name': 'пустой secret',
                   'args': [{'SECRET_KEY': '   '},
                            {'APP_ENV': 'test', 'LOG_LEVEL': 'DEBUG', 'DATABASE_URL': 'postgresql://test'},
                            ['DATABASE_URL', 'SECRET_KEY']],
                   'expected': {'config': {'APP_ENV': 'test',
                                           'LOG_LEVEL': 'DEBUG',
                                           'DATABASE_URL': 'postgresql://test'},
                                'missing': ['SECRET_KEY'],
                                'safe_preview': {'APP_ENV': 'test',
                                                 'LOG_LEVEL': 'DEBUG',
                                                 'DATABASE_URL': 'configured'}}}],
        'reference_code': 'def solve(env, defaults, required):\n'
                          '    config = {}\n'
                          '    for key, value in defaults.items():\n'
                          "        if str(value).strip() != '':\n"
                          '            config[key] = value\n'
                          '    for key, value in env.items():\n'
                          "        if str(value).strip() == '':\n"
                          '            config.pop(key, None)\n'
                          '        else:\n'
                          '            config[key] = value\n'
                          '    missing = []\n'
                          '    for key in required:\n'
                          '        if key not in config:\n'
                          '            missing.append(key)\n'
                          "    database_state = 'configured' if 'DATABASE_URL' in config else 'missing'\n"
                          '    safe_preview = {\n'
                          "        'APP_ENV': config.get('APP_ENV'),\n"
                          "        'LOG_LEVEL': config.get('LOG_LEVEL'),\n"
                          "        'DATABASE_URL': database_state,\n"
                          '    }\n'
                          '    return {\n'
                          "        'config': config,\n"
                          "        'missing': missing,\n"
                          "        'safe_preview': safe_preview,\n"
                          '    }\n'}],
 168: [{'title': 'Безопасное структурированное событие',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните словарь level, message и context. level приведите к верхнему регистру. Из context '
                  'исключите все секретные ключи. Оставшиеся ключи отсортируйте по алфавиту и сохраните значения без '
                  'изменения. message не должна содержать traceback или секреты из удалённых полей.',
        'contract': {'given': 'Автопроверка вызывает solve(level, message, context). context — словарь произвольных '
                              'полей request. Секретными считаются password, token, access_token, refresh_token, '
                              'secret_key и authorization без учёта регистра.',
                     'todo': 'Верните словарь level, message и context. level приведите к верхнему регистру. Из '
                             'context исключите все секретные ключи. Оставшиеся ключи отсортируйте по алфавиту и '
                             'сохраните значения без изменения. message не должна содержать traceback или секреты из '
                             'удалённых полей.',
                     'check': 'Проверяются обычный request, несколько secret fields и регистр ключей. Сравнивается '
                              'точное безопасное событие.'},
        'requirements': {'items': ['уровень в верхнем регистре',
                                   'secret keys без учёта регистра',
                                   'стабильный порядок context',
                                   'безопасное событие'],
                         'names': ['level', 'message', 'context', 'secret_keys', 'safe_context'],
                         'nodes': ['FunctionDef', 'For', 'If', 'Set'],
                         'calls': ['sorted'],
                         'attributes': ['lower', 'upper']},
        'starter_code': 'def solve(level, message, context):\n    # Удалите секреты и соберите log event\n    pass\n',
        'tests': [{'name': 'request event',
                   'args': ['info',
                            'request_completed',
                            {'request_id': 'req-7', 'path': '/tasks', 'status': 200, 'user_id': 4}],
                   'expected': {'level': 'INFO',
                                'message': 'request_completed',
                                'context': {'path': '/tasks', 'request_id': 'req-7', 'status': 200, 'user_id': 4}}},
                  {'name': 'секреты удалены',
                   'args': ['error',
                            'login_failed',
                            {'Request_ID': 'req-8',
                             'password': 'plain',
                             'Authorization': 'Bearer token',
                             'refresh_token': 'hidden',
                             'email': 'user@example.com'}],
                   'expected': {'level': 'ERROR',
                                'message': 'login_failed',
                                'context': {'Request_ID': 'req-8', 'email': 'user@example.com'}}}],
        'reference_code': 'def solve(level, message, context):\n'
                          '    secret_keys = {\n'
                          "        'password',\n"
                          "        'token',\n"
                          "        'access_token',\n"
                          "        'refresh_token',\n"
                          "        'secret_key',\n"
                          "        'authorization',\n"
                          '    }\n'
                          '    safe_context = {}\n'
                          '    for key in sorted(context):\n'
                          '        if key.lower() not in secret_keys:\n'
                          '            safe_context[key] = context[key]\n'
                          '    return {\n'
                          "        'level': level.upper(),\n"
                          "        'message': message,\n"
                          "        'context': safe_context,\n"
                          '    }\n'}],
 169: [{'title': 'Liveness, readiness и draining',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните health_status, ready_status и state. health_status равен 200, если process_running=True, '
                  'иначе 503. ready_status равен 200 только когда process работает, startup завершён, database '
                  'доступна и draining=False; иначе 503. state выбирается в порядке: stopped, starting, draining, '
                  'dependency_failed, ready.',
        'contract': {'given': 'Автопроверка вызывает solve(process_running, startup_complete, database_ok, '
                              'draining). Все аргументы имеют тип bool.',
                     'todo': 'Верните health_status, ready_status и state. health_status равен 200, если '
                             'process_running=True, иначе 503. ready_status равен 200 только когда process работает, '
                             'startup завершён, database доступна и draining=False; иначе 503. state выбирается в '
                             'порядке: stopped, starting, draining, dependency_failed, ready.',
                     'check': 'Проверяются stopped, startup, недоступная database, draining и ready. Health может '
                              'быть 200, когда readiness уже 503.'},
        'requirements': {'items': ['health зависит только от process',
                                   'readiness зависит от startup и database',
                                   'draining выключает readiness',
                                   'явный lifecycle state'],
                         'names': ['process_running',
                                   'startup_complete',
                                   'database_ok',
                                   'draining',
                                   'health_status',
                                   'ready_status',
                                   'state'],
                         'nodes': ['FunctionDef', 'If', 'BoolOp', 'IfExp']},
        'starter_code': 'def solve(process_running, startup_complete, database_ok, draining):\n'
                        '    # Определите liveness, readiness и lifecycle state\n'
                        '    pass\n',
        'tests': [{'name': 'process остановлен',
                   'args': [False, False, False, False],
                   'expected': {'health_status': 503, 'ready_status': 503, 'state': 'stopped'}},
                  {'name': 'startup',
                   'args': [True, False, True, False],
                   'expected': {'health_status': 200, 'ready_status': 503, 'state': 'starting'}},
                  {'name': 'database недоступна',
                   'args': [True, True, False, False],
                   'expected': {'health_status': 200, 'ready_status': 503, 'state': 'dependency_failed'}},
                  {'name': 'graceful draining',
                   'args': [True, True, True, True],
                   'expected': {'health_status': 200, 'ready_status': 503, 'state': 'draining'}},
                  {'name': 'готов',
                   'args': [True, True, True, False],
                   'expected': {'health_status': 200, 'ready_status': 200, 'state': 'ready'}}],
        'reference_code': 'def solve(process_running, startup_complete, database_ok, draining):\n'
                          '    health_status = 200 if process_running else 503\n'
                          '    ready = process_running and startup_complete and database_ok and not draining\n'
                          '    ready_status = 200 if ready else 503\n'
                          '    if not process_running:\n'
                          "        state = 'stopped'\n"
                          '    elif not startup_complete:\n'
                          "        state = 'starting'\n"
                          '    elif draining:\n'
                          "        state = 'draining'\n"
                          '    elif not database_ok:\n'
                          "        state = 'dependency_failed'\n"
                          '    else:\n'
                          "        state = 'ready'\n"
                          '    return {\n'
                          "        'health_status': health_status,\n"
                          "        'ready_status': ready_status,\n"
                          "        'state': state,\n"
                          '    }\n'}],
 171: [{'title': 'Image, container и process',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Начальные значения image_exists=False, container_exists=False, process_running=False, '
                  'runtime_file=False. build_image создаёт image. create_container возможно только при image_exists. '
                  'start запускает process только внутри существующего container. write_file создаёт runtime_file '
                  'только при running process. stop останавливает process. remove_container удаляет container и '
                  'runtime_file, но image сохраняется. create_from_same_image создаёт новый container без '
                  'runtime_file, если image существует. Верните все четыре flags.',
        'contract': {'given': 'Автопроверка вызывает solve(events). events — список строк build_image, '
                              'create_container, start, write_file, stop, remove_container и create_from_same_image.',
                     'todo': 'Начальные значения image_exists=False, container_exists=False, process_running=False, '
                             'runtime_file=False. build_image создаёт image. create_container возможно только при '
                             'image_exists. start запускает process только внутри существующего container. '
                             'write_file создаёт runtime_file только при running process. stop останавливает '
                             'process. remove_container удаляет container и runtime_file, но image сохраняется. '
                             'create_from_same_image создаёт новый container без runtime_file, если image '
                             'существует. Верните все четыре flags.',
                     'check': 'Проверяется сборка без запуска, полный lifecycle и пересоздание из того же image. '
                              'Файл, созданный только внутри container, не должен пережить remove.'},
        'requirements': {'items': ['image живёт отдельно от container',
                                   'process запускается внутри container',
                                   'runtime file принадлежит container',
                                   'remove не удаляет image'],
                         'names': ['events', 'image_exists', 'container_exists', 'process_running', 'runtime_file'],
                         'nodes': ['FunctionDef', 'For', 'If']},
        'starter_code': 'def solve(events):\n'
                        '    image_exists = False\n'
                        '    container_exists = False\n'
                        '    process_running = False\n'
                        '    runtime_file = False\n'
                        '    # Выполните lifecycle Docker objects\n'
                        '    pass\n',
        'tests': [{'name': 'только image',
                   'args': [['build_image']],
                   'expected': {'image_exists': True,
                                'container_exists': False,
                                'process_running': False,
                                'runtime_file': False}},
                  {'name': 'container запущен',
                   'args': [['build_image', 'create_container', 'start', 'write_file']],
                   'expected': {'image_exists': True,
                                'container_exists': True,
                                'process_running': True,
                                'runtime_file': True}},
                  {'name': 'пересоздание теряет runtime file',
                   'args': [['build_image',
                             'create_container',
                             'start',
                             'write_file',
                             'stop',
                             'remove_container',
                             'create_from_same_image',
                             'start']],
                   'expected': {'image_exists': True,
                                'container_exists': True,
                                'process_running': True,
                                'runtime_file': False}}],
        'reference_code': 'def solve(events):\n'
                          '    image_exists = False\n'
                          '    container_exists = False\n'
                          '    process_running = False\n'
                          '    runtime_file = False\n'
                          '    for event in events:\n'
                          "        if event == 'build_image':\n"
                          '            image_exists = True\n'
                          "        elif event in ('create_container', 'create_from_same_image') and image_exists:\n"
                          '            container_exists = True\n'
                          '            process_running = False\n'
                          '            runtime_file = False\n'
                          "        elif event == 'start' and container_exists:\n"
                          '            process_running = True\n'
                          "        elif event == 'write_file' and process_running:\n"
                          '            runtime_file = True\n'
                          "        elif event == 'stop':\n"
                          '            process_running = False\n'
                          "        elif event == 'remove_container':\n"
                          '            container_exists = False\n'
                          '            process_running = False\n'
                          '            runtime_file = False\n'
                          '    return {\n'
                          "        'image_exists': image_exists,\n"
                          "        'container_exists': container_exists,\n"
                          "        'process_running': process_running,\n"
                          "        'runtime_file': runtime_file,\n"
                          '    }\n'}],
 173: [{'title': 'Инвалидация Docker layers',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Идите по layers сверху вниз. Первый layer, чей inputs пересекается с changed_inputs, становится '
                  'cache miss. Все последующие layers тоже miss, даже если их собственные inputs не менялись. '
                  'Предыдущие layers остаются hit. Верните список словарей name и cache.',
        'contract': {'given': 'Автопроверка вызывает solve(layers, changed_inputs). layers — список словарей name и '
                              'inputs. changed_inputs — список изменённых файлов или значений.',
                     'todo': 'Идите по layers сверху вниз. Первый layer, чей inputs пересекается с changed_inputs, '
                             'становится cache miss. Все последующие layers тоже miss, даже если их собственные '
                             'inputs не менялись. Предыдущие layers остаются hit. Верните список словарей name и '
                             'cache.',
                     'check': 'Проверяются изменение source, dependency-файла, отсутствие изменений и изменение '
                              'раннего base input. Порядок layers сохраняется.'},
        'requirements': {'items': ['первое изменение инвалидирует layer',
                                   'все следующие layers miss',
                                   'предыдущие layers hit',
                                   'порядок сохраняется'],
                         'names': ['layers', 'changed_inputs', 'changed', 'invalidated', 'result'],
                         'nodes': ['FunctionDef', 'For', 'If', 'IfExp'],
                         'calls': ['set'],
                         'attributes': ['intersection', 'append']},
        'starter_code': 'def solve(layers, changed_inputs):\n'
                        '    # Определите cache hit и miss по порядку layers\n'
                        '    pass\n',
        'tests': [{'name': 'изменился source',
                   'args': [[{'name': 'base', 'inputs': ['python:3.12-slim']},
                             {'name': 'dependencies', 'inputs': ['requirements.txt']},
                             {'name': 'source', 'inputs': ['app/']},
                             {'name': 'user', 'inputs': ['Dockerfile:USER']}],
                            ['app/']],
                   'expected': [{'name': 'base', 'cache': 'hit'},
                                {'name': 'dependencies', 'cache': 'hit'},
                                {'name': 'source', 'cache': 'miss'},
                                {'name': 'user', 'cache': 'miss'}]},
                  {'name': 'изменились dependencies',
                   'args': [[{'name': 'base', 'inputs': ['python:3.12-slim']},
                             {'name': 'dependencies', 'inputs': ['requirements.txt']},
                             {'name': 'source', 'inputs': ['app/']}],
                            ['requirements.txt']],
                   'expected': [{'name': 'base', 'cache': 'hit'},
                                {'name': 'dependencies', 'cache': 'miss'},
                                {'name': 'source', 'cache': 'miss'}]},
                  {'name': 'ничего не изменилось',
                   'args': [[{'name': 'base', 'inputs': ['python:3.12-slim']},
                             {'name': 'source', 'inputs': ['app/']}],
                            []],
                   'expected': [{'name': 'base', 'cache': 'hit'}, {'name': 'source', 'cache': 'hit'}]}],
        'reference_code': 'def solve(layers, changed_inputs):\n'
                          '    changed = set(changed_inputs)\n'
                          '    invalidated = False\n'
                          '    result = []\n'
                          '    for layer in layers:\n'
                          "        if not invalidated and changed.intersection(layer['inputs']):\n"
                          '            invalidated = True\n'
                          '        result.append({\n'
                          "            'name': layer['name'],\n"
                          "            'cache': 'miss' if invalidated else 'hit',\n"
                          '        })\n'
                          '    return result\n'}],
 177: [{'title': 'Service DNS внутри Compose',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Если source_service или target_service отсутствует, верните reachable=False и url=None. Если оба '
                  'существуют, внутренний URL равен target_service:target_port и не использует host published port. '
                  'Верните reachable=True, internal_url и host_url. host_url существует только когда target_service '
                  'есть в published_ports и имеет вид localhost:host_port.',
        'contract': {'given': 'Автопроверка вызывает solve(services, source_service, target_service, target_port, '
                              'published_ports). services — список имён Compose services. published_ports — словарь '
                              'service → host port.',
                     'todo': 'Если source_service или target_service отсутствует, верните reachable=False и '
                             'url=None. Если оба существуют, внутренний URL равен target_service:target_port и не '
                             'использует host published port. Верните reachable=True, internal_url и host_url. '
                             'host_url существует только когда target_service есть в published_ports и имеет вид '
                             'localhost:host_port.',
                     'check': 'Проверяются API → db, API → redis, unpublished internal service и неизвестное имя. '
                              'Внутренний URL запрещено строить через localhost.'},
        'requirements': {'items': ['проверка существования двух services',
                                   'service name как hostname',
                                   'container port внутри сети',
                                   'published port только для host'],
                         'names': ['services',
                                   'source_service',
                                   'target_service',
                                   'target_port',
                                   'published_ports',
                                   'service_names',
                                   'internal_url',
                                   'host_url'],
                         'nodes': ['FunctionDef', 'If', 'BoolOp', 'JoinedStr'],
                         'calls': ['set']},
        'starter_code': 'def solve(services, source_service, target_service, target_port, published_ports):\n'
                        '    # Соберите внутренний и host URL\n'
                        '    pass\n',
        'tests': [{'name': 'API подключается к db',
                   'args': [['api', 'db', 'redis'], 'api', 'db', 5432, {'api': 8000}],
                   'expected': {'reachable': True, 'internal_url': 'db:5432', 'host_url': None}},
                  {'name': 'API опубликован на host',
                   'args': [['api', 'db'], 'db', 'api', 8000, {'api': 8080}],
                   'expected': {'reachable': True, 'internal_url': 'api:8000', 'host_url': 'localhost:8080'}},
                  {'name': 'service отсутствует',
                   'args': [['api', 'db'], 'api', 'redis', 6379, {'api': 8000}],
                   'expected': {'reachable': False, 'internal_url': None, 'host_url': None}}],
        'reference_code': 'def solve(services, source_service, target_service, target_port, published_ports):\n'
                          '    service_names = set(services)\n'
                          '    if source_service not in service_names or target_service not in service_names:\n'
                          '        return {\n'
                          "            'reachable': False,\n"
                          "            'internal_url': None,\n"
                          "            'host_url': None,\n"
                          '        }\n'
                          "    internal_url = f'{target_service}:{target_port}'\n"
                          '    host_url = None\n'
                          '    if target_service in published_ports:\n'
                          '        host_url = f"localhost:{published_ports[target_service]}"\n'
                          '    return {\n'
                          "        'reachable': True,\n"
                          "        'internal_url': internal_url,\n"
                          "        'host_url': host_url,\n"
                          '    }\n'}],
 179: [{'title': 'Lifecycle container и named volume',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Начальные flags: volume_exists=False, container_exists=False, database_running=False, '
                  'row_exists=False. create_volume создаёт volume. start_db создаёт container и запускает database; '
                  'если volume уже существует, row state сохраняется. write_row возможно только при running database '
                  'и существующем volume. stop выключает database. remove_container и compose_down удаляют '
                  'container, но сохраняют volume и row. compose_down_v удаляет container, volume и row. Верните '
                  'четыре flags.',
        'contract': {'given': 'Автопроверка вызывает solve(events). events — список строк create_volume, start_db, '
                              'write_row, stop, remove_container, compose_down и compose_down_v.',
                     'todo': 'Начальные flags: volume_exists=False, container_exists=False, database_running=False, '
                             'row_exists=False. create_volume создаёт volume. start_db создаёт container и запускает '
                             'database; если volume уже существует, row state сохраняется. write_row возможно только '
                             'при running database и существующем volume. stop выключает database. remove_container '
                             'и compose_down удаляют container, но сохраняют volume и row. compose_down_v удаляет '
                             'container, volume и row. Верните четыре flags.',
                     'check': 'Проверяются recreate с сохранением данных и полный reset через down -v. Named volume '
                              'не считается backup.'},
        'requirements': {'items': ['container lifecycle отдельно от volume',
                                   'compose down сохраняет data',
                                   'down -v удаляет volume',
                                   'row живёт вместе с volume'],
                         'names': ['events', 'volume_exists', 'container_exists', 'database_running', 'row_exists'],
                         'nodes': ['FunctionDef', 'For', 'If', 'BoolOp']},
        'starter_code': 'def solve(events):\n'
                        '    volume_exists = False\n'
                        '    container_exists = False\n'
                        '    database_running = False\n'
                        '    row_exists = False\n'
                        '    # Выполните lifecycle\n'
                        '    pass\n',
        'tests': [{'name': 'данные переживают recreate',
                   'args': [['create_volume', 'start_db', 'write_row', 'stop', 'remove_container', 'start_db']],
                   'expected': {'volume_exists': True,
                                'container_exists': True,
                                'database_running': True,
                                'row_exists': True}},
                  {'name': 'down сохраняет volume',
                   'args': [['create_volume', 'start_db', 'write_row', 'compose_down']],
                   'expected': {'volume_exists': True,
                                'container_exists': False,
                                'database_running': False,
                                'row_exists': True}},
                  {'name': 'down v удаляет данные',
                   'args': [['create_volume', 'start_db', 'write_row', 'compose_down_v']],
                   'expected': {'volume_exists': False,
                                'container_exists': False,
                                'database_running': False,
                                'row_exists': False}}],
        'reference_code': 'def solve(events):\n'
                          '    volume_exists = False\n'
                          '    container_exists = False\n'
                          '    database_running = False\n'
                          '    row_exists = False\n'
                          '    for event in events:\n'
                          "        if event == 'create_volume':\n"
                          '            volume_exists = True\n'
                          "        elif event == 'start_db':\n"
                          '            container_exists = True\n'
                          '            database_running = True\n'
                          "        elif event == 'write_row' and database_running and volume_exists:\n"
                          '            row_exists = True\n'
                          "        elif event == 'stop':\n"
                          '            database_running = False\n'
                          "        elif event in ('remove_container', 'compose_down'):\n"
                          '            container_exists = False\n'
                          '            database_running = False\n'
                          "        elif event == 'compose_down_v':\n"
                          '            container_exists = False\n'
                          '            database_running = False\n'
                          '            volume_exists = False\n'
                          '            row_exists = False\n'
                          '    return {\n'
                          "        'volume_exists': volume_exists,\n"
                          "        'container_exists': container_exists,\n"
                          "        'database_running': database_running,\n"
                          "        'row_exists': row_exists,\n"
                          '    }\n'}],
 180: [{'title': 'Порядок db, migrations и API',
        'level': 'easy',
        'mode': 'solve',
        'prompt': "Верните allowed_step и stack_ready. Если db не started, allowed_step='start_db'. Если db started, "
                  "но не healthy, allowed_step='wait_db'. Если migration pending, allowed_step='run_migrations'. "
                  "Если migration failed, allowed_step='stop_deployment'. Если migration success и API не started, "
                  "allowed_step='start_api'. Иначе allowed_step='serve_traffic'. stack_ready=True только в последнем "
                  'случае.',
        'contract': {'given': 'Автопроверка вызывает solve(db_started, db_healthy, migration_status, api_started). '
                              'migration_status равен pending, success или failed.',
                     'todo': "Верните allowed_step и stack_ready. Если db не started, allowed_step='start_db'. Если "
                             "db started, но не healthy, allowed_step='wait_db'. Если migration pending, "
                             "allowed_step='run_migrations'. Если migration failed, allowed_step='stop_deployment'. "
                             "Если migration success и API не started, allowed_step='start_api'. Иначе "
                             "allowed_step='serve_traffic'. stack_ready=True только в последнем случае.",
                     'check': 'Проверяется каждый этап startup timeline. API нельзя считать готовым до успешных '
                              'migrations.'},
        'requirements': {'items': ['database сначала запускается',
                                   'healthcheck до migrations',
                                   'failed migration блокирует deploy',
                                   'traffic только после API'],
                         'names': ['db_started', 'db_healthy', 'migration_status', 'api_started', 'allowed_step'],
                         'nodes': ['FunctionDef', 'If']},
        'starter_code': 'def solve(db_started, db_healthy, migration_status, api_started):\n'
                        '    # Определите следующий допустимый шаг\n'
                        '    pass\n',
        'tests': [{'name': 'database не запущена',
                   'args': [False, False, 'pending', False],
                   'expected': {'allowed_step': 'start_db', 'stack_ready': False}},
                  {'name': 'ожидание healthcheck',
                   'args': [True, False, 'pending', False],
                   'expected': {'allowed_step': 'wait_db', 'stack_ready': False}},
                  {'name': 'нужны migrations',
                   'args': [True, True, 'pending', False],
                   'expected': {'allowed_step': 'run_migrations', 'stack_ready': False}},
                  {'name': 'migration failed',
                   'args': [True, True, 'failed', False],
                   'expected': {'allowed_step': 'stop_deployment', 'stack_ready': False}},
                  {'name': 'stack готов',
                   'args': [True, True, 'success', True],
                   'expected': {'allowed_step': 'serve_traffic', 'stack_ready': True}}],
        'reference_code': 'def solve(db_started, db_healthy, migration_status, api_started):\n'
                          '    if not db_started:\n'
                          "        allowed_step = 'start_db'\n"
                          '    elif not db_healthy:\n'
                          "        allowed_step = 'wait_db'\n"
                          "    elif migration_status == 'pending':\n"
                          "        allowed_step = 'run_migrations'\n"
                          "    elif migration_status == 'failed':\n"
                          "        allowed_step = 'stop_deployment'\n"
                          '    elif not api_started:\n'
                          "        allowed_step = 'start_api'\n"
                          '    else:\n'
                          "        allowed_step = 'serve_traffic'\n"
                          '    return {\n'
                          "        'allowed_step': allowed_step,\n"
                          "        'stack_ready': allowed_step == 'serve_traffic',\n"
                          '    }\n'}],
 183: [{'title': 'Quality gates для commit',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните status, stopped_at и executed. Идите по gates по порядку и добавляйте name в executed. '
                  "При первом passed=False остановитесь, status='failed', stopped_at получает name. Если все gates "
                  "прошли, status='passed', stopped_at=None. Steps после первого failure не выполняются.",
        'contract': {'given': 'Автопроверка вызывает solve(gates). gates — список словарей name и passed в '
                              'фактическом порядке pipeline.',
                     'todo': 'Верните status, stopped_at и executed. Идите по gates по порядку и добавляйте name в '
                             "executed. При первом passed=False остановитесь, status='failed', stopped_at получает "
                             "name. Если все gates прошли, status='passed', stopped_at=None. Steps после первого "
                             'failure не выполняются.',
                     'check': 'Проверяются полный success, format failure, test failure и пустой pipeline. '
                              'Сравнивается точный executed order.'},
        'requirements': {'items': ['gates выполняются по порядку',
                                   'остановка на первом failure',
                                   'последующие steps не выполняются',
                                   'полный success'],
                         'names': ['gates', 'executed'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['append']},
        'starter_code': 'def solve(gates):\n    executed = []\n    # Выполните gates до первого failure\n    pass\n',
        'tests': [{'name': 'зелёный pipeline',
                   'args': [[{'name': 'format', 'passed': True},
                             {'name': 'lint', 'passed': True},
                             {'name': 'tests', 'passed': True},
                             {'name': 'image', 'passed': True}]],
                   'expected': {'status': 'passed',
                                'stopped_at': None,
                                'executed': ['format', 'lint', 'tests', 'image']}},
                  {'name': 'format failure',
                   'args': [[{'name': 'format', 'passed': False},
                             {'name': 'lint', 'passed': True},
                             {'name': 'tests', 'passed': True}]],
                   'expected': {'status': 'failed', 'stopped_at': 'format', 'executed': ['format']}},
                  {'name': 'tests failure',
                   'args': [[{'name': 'format', 'passed': True},
                             {'name': 'lint', 'passed': True},
                             {'name': 'tests', 'passed': False},
                             {'name': 'image', 'passed': True}]],
                   'expected': {'status': 'failed', 'stopped_at': 'tests', 'executed': ['format', 'lint', 'tests']}}],
        'reference_code': 'def solve(gates):\n'
                          '    executed = []\n'
                          '    for gate in gates:\n'
                          "        executed.append(gate['name'])\n"
                          "        if not gate['passed']:\n"
                          '            return {\n'
                          "                'status': 'failed',\n"
                          "                'stopped_at': gate['name'],\n"
                          "                'executed': executed,\n"
                          '            }\n'
                          '    return {\n'
                          "        'status': 'passed',\n"
                          "        'stopped_at': None,\n"
                          "        'executed': executed,\n"
                          '    }\n'}],
 186: [{'title': 'Прослеживаемый image tag',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Если tests_passed=False, верните publish=False и пустой tags. Иначе всегда добавьте tag '
                  'sha-<первые 12 символов commit_sha>. Для branch main добавьте tag main. Если release_tag не None '
                  'и начинается с v, добавьте его последним. latest не добавляйте. Верните publish=True, tags и '
                  'traceable_to=commit_sha.',
        'contract': {'given': 'Автопроверка вызывает solve(commit_sha, release_tag, branch, tests_passed). '
                              'commit_sha — полная строка SHA, release_tag — строка или None, branch — имя branch.',
                     'todo': 'Если tests_passed=False, верните publish=False и пустой tags. Иначе всегда добавьте '
                             'tag sha-<первые 12 символов commit_sha>. Для branch main добавьте tag main. Если '
                             'release_tag не None и начинается с v, добавьте его последним. latest не добавляйте. '
                             'Верните publish=True, tags и traceable_to=commit_sha.',
                     'check': 'Проверяются feature branch, main, release tag и failed tests. Каждый опубликованный '
                              'image должен ссылаться на конкретный commit.'},
        'requirements': {'items': ['публикация только после tests',
                                   'SHA tag обязателен',
                                   'release tag добавляется явно',
                                   'latest не используется'],
                         'names': ['commit_sha', 'release_tag', 'branch', 'tests_passed', 'tags'],
                         'nodes': ['FunctionDef', 'If', 'JoinedStr'],
                         'attributes': ['append', 'startswith']},
        'starter_code': 'def solve(commit_sha, release_tag, branch, tests_passed):\n'
                        '    # Соберите список безопасных image tags\n'
                        '    pass\n',
        'tests': [{'name': 'feature branch',
                   'args': ['abcdef1234567890', None, 'feature/logs', True],
                   'expected': {'publish': True, 'tags': ['sha-abcdef123456'], 'traceable_to': 'abcdef1234567890'}},
                  {'name': 'main release',
                   'args': ['1234567890abcdef', 'v6.0.0', 'main', True],
                   'expected': {'publish': True,
                                'tags': ['sha-1234567890ab', 'main', 'v6.0.0'],
                                'traceable_to': '1234567890abcdef'}},
                  {'name': 'tests failed',
                   'args': ['abcdef1234567890', 'v6.0.0', 'main', False],
                   'expected': {'publish': False, 'tags': [], 'traceable_to': None}}],
        'reference_code': 'def solve(commit_sha, release_tag, branch, tests_passed):\n'
                          '    if not tests_passed:\n'
                          '        return {\n'
                          "            'publish': False,\n"
                          "            'tags': [],\n"
                          "            'traceable_to': None,\n"
                          '        }\n'
                          '    tags = [f"sha-{commit_sha[:12]}"]\n'
                          "    if branch == 'main':\n"
                          "        tags.append('main')\n"
                          "    if release_tag is not None and release_tag.startswith('v'):\n"
                          '        tags.append(release_tag)\n'
                          '    return {\n'
                          "        'publish': True,\n"
                          "        'tags': tags,\n"
                          "        'traceable_to': commit_sha,\n"
                          '    }\n'}],
 188: [{'title': 'Решение после smoke test',
        'level': 'medium',
        'mode': 'solve',
        'prompt': "Если все четыре проверки True, верните action='keep', active_tag=current_tag и incident=False. "
                  "Если любая проверка False и previous_tag существует, верните action='rollback', "
                  'active_tag=previous_tag и incident=True. Если previous_tag отсутствует, верните '
                  "action='stop_traffic', active_tag=None и incident=True. Добавьте failed_checks в порядке health, "
                  'readiness, migration, key_scenario.',
        'contract': {'given': 'Автопроверка вызывает solve(current_tag, previous_tag, health_ok, readiness_ok, '
                              'migration_ok, key_scenario_ok). Tags — строки или None, остальные аргументы — bool.',
                     'todo': "Если все четыре проверки True, верните action='keep', active_tag=current_tag и "
                             'incident=False. Если любая проверка False и previous_tag существует, верните '
                             "action='rollback', active_tag=previous_tag и incident=True. Если previous_tag "
                             "отсутствует, верните action='stop_traffic', active_tag=None и incident=True. Добавьте "
                             'failed_checks в порядке health, readiness, migration, key_scenario.',
                     'check': 'Проверяются успешный deploy, один failure, несколько failures и отсутствие предыдущей '
                              'версии. Rollback должен указывать конкретный known-good tag.'},
        'requirements': {'items': ['четыре smoke checks',
                                   'known-good previous tag',
                                   'rollback при failure',
                                   'stop traffic без previous version'],
                         'names': ['current_tag',
                                   'previous_tag',
                                   'health_ok',
                                   'readiness_ok',
                                   'migration_ok',
                                   'key_scenario_ok',
                                   'checks',
                                   'failed_checks'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['append']},
        'starter_code': 'def solve(current_tag, previous_tag, health_ok, readiness_ok, migration_ok, '
                        'key_scenario_ok):\n'
                        '    # Определите keep, rollback или stop_traffic\n'
                        '    pass\n',
        'tests': [{'name': 'deploy успешен',
                   'args': ['v6.0.0', 'v5.0.0', True, True, True, True],
                   'expected': {'action': 'keep', 'active_tag': 'v6.0.0', 'incident': False, 'failed_checks': []}},
                  {'name': 'rollback',
                   'args': ['v6.0.1', 'v6.0.0', True, True, True, False],
                   'expected': {'action': 'rollback',
                                'active_tag': 'v6.0.0',
                                'incident': True,
                                'failed_checks': ['key_scenario']}},
                  {'name': 'несколько failures',
                   'args': ['v6.0.1', 'v6.0.0', False, False, True, False],
                   'expected': {'action': 'rollback',
                                'active_tag': 'v6.0.0',
                                'incident': True,
                                'failed_checks': ['health', 'readiness', 'key_scenario']}},
                  {'name': 'нет previous tag',
                   'args': ['v1.0.0', None, False, False, False, False],
                   'expected': {'action': 'stop_traffic',
                                'active_tag': None,
                                'incident': True,
                                'failed_checks': ['health', 'readiness', 'migration', 'key_scenario']}}],
        'reference_code': 'def solve(current_tag, previous_tag, health_ok, readiness_ok, migration_ok, '
                          'key_scenario_ok):\n'
                          '    checks = [\n'
                          "        ('health', health_ok),\n"
                          "        ('readiness', readiness_ok),\n"
                          "        ('migration', migration_ok),\n"
                          "        ('key_scenario', key_scenario_ok),\n"
                          '    ]\n'
                          '    failed_checks = []\n'
                          '    for name, passed in checks:\n'
                          '        if not passed:\n'
                          '            failed_checks.append(name)\n'
                          '    if not failed_checks:\n'
                          '        return {\n'
                          "            'action': 'keep',\n"
                          "            'active_tag': current_tag,\n"
                          "            'incident': False,\n"
                          "            'failed_checks': [],\n"
                          '        }\n'
                          '    if previous_tag is not None:\n'
                          "        action = 'rollback'\n"
                          '        active_tag = previous_tag\n'
                          '    else:\n'
                          "        action = 'stop_traffic'\n"
                          '        active_tag = None\n'
                          '    return {\n'
                          "        'action': action,\n"
                          "        'active_tag': active_tag,\n"
                          "        'incident': True,\n"
                          "        'failed_checks': failed_checks,\n"
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
        PERSONAL_API_TRACK: PERSONAL_API_CODE_TASKS,
    }
    for track_name in POSTGRESQL_TRACK_ALIASES:
        tasks_by_track[track_name] = POSTGRESQL_CODE_TASKS
    for track_name in ASYNC_TRACK_ALIASES:
        tasks_by_track[track_name] = ASYNC_CODE_TASKS
    for track_name in DEPLOY_TRACK_ALIASES:
        tasks_by_track[track_name] = DEPLOY_CODE_TASKS

    return tasks_by_track.get(track_id, {}).get(lesson_number, [])

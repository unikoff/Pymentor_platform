from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    1: [{'title': 'Стартовый экран StudyHub',
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
                        'print(total_minutes)\n'}]
}

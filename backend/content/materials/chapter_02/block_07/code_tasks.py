from typing import Any

CODE_TASKS: dict[int | str, list[dict[str, Any]]] = {
    31: [   {   'title': 'Два экземпляра ReadingPlan',
        'level': 'easy',
        'mode': 'script',
        'prompt': 'Опишите ReadingPlan с конструктором __init__(self, topic, days). До запуска '
                  'предскажите значения параметров и атрибутов при двух вызовах класса; затем '
                  'создайте два экземпляра с подготовленными значениями и выведите topic и '
                  'days каждого через точку. После запуска объясните, почему присваивание '
                  'локальному имени не сохраняет поле объекта и какие действия Planner '
                  'остаются за его функциями.',
        'contract': {   'given': 'Интерпретатор создаёт topic, days, second_topic и '
                                 'second_days. Значения меняются в проверках.',
                        'todo': 'Опишите ReadingPlan с конструктором __init__(self, topic, '
                                'days). До запуска предскажите значения параметров и атрибутов '
                                'при двух вызовах класса; затем создайте два экземпляра с '
                                'подготовленными значениями и выведите topic и days каждого '
                                'через точку.',
                        'check': 'Сравниваются четыре строки: два поля первого и второго '
                                 'экземпляров. Оба объекта должны получить свои значения, '
                                 'доступные через атрибуты.'},
        'requirements': {   'items': [   'класс ReadingPlan',
                                         '__init__ с self',
                                         'два экземпляра с независимыми полями'],
                            'nodes': ['ClassDef'],
                            'attributes': ['topic', 'days'],
                            'calls': ['print']},
        'starter_code': '# topic, days, second_topic и second_days уже созданы\n'
                        '# Опишите ReadingPlan, создайте два экземпляра и выведите их поля\n',
        'tests': [   {   'name': 'разные планы',
                         'namespace': {   'topic': 'functions',
                                          'days': 3,
                                          'second_topic': 'lists',
                                          'second_days': 5},
                         'expected': 'functions\n3\nlists\n5',
                         'assert': 'stdout'},
                     {   'name': 'другие значения',
                         'namespace': {   'topic': 'classes',
                                          'days': 2,
                                          'second_topic': 'files',
                                          'second_days': 7},
                         'expected': 'classes\n2\nfiles\n7',
                         'assert': 'stdout'}],
        'reference_code': 'class ReadingPlan:\n'
                          '    def __init__(self, topic, days):\n'
                          '        self.topic = topic\n'
                          '        self.days = days\n'
                          '\n'
                          'first = ReadingPlan(topic, days)\n'
                          'second = ReadingPlan(second_topic, second_days)\n'
                          'print(first.topic)\n'
                          'print(first.days)\n'
                          'print(second.topic)\n'
                          'print(second.days)\n'},
    {   'title': 'Свой класс StudySession',
        'level': 'easy',
        'mode': 'script',
        'prompt': 'Самостоятельно создайте класс StudySession для одной учебной сессии. Пусть '
                  '__init__ принимает subject и minutes и сохраняет их как атрибуты '
                  'экземпляра. Создайте две сессии из заданных значений. Перед запуском '
                  'предскажите все четыре поля, затем выведите их по порядку. После успешной '
                  'проверки во временной копии замените сохранение minutes на minutes = '
                  'minutes: создайте новый экземпляр, объясните AttributeError при чтении '
                  'minutes и исправьте строку. Сравните результат с тем, какие операции '
                  'Planner по-прежнему выполняет отдельными функциями.',
        'contract': {   'given': 'Интерпретатор задаёт subject, minutes, second_subject и '
                                 'second_minutes. При проверке входные значения меняются.',
                        'todo': 'Опишите класс StudySession с __init__, создайте два разных '
                                'экземпляра из заданных переменных. Выведите сначала subject и '
                                'minutes первого, затем subject и minutes второго, каждое '
                                'значение с новой строки.',
                        'check': 'Проверяется порядок четырёх строк и значения атрибутов двух '
                                 'независимых экземпляров. Временный опыт с AttributeError '
                                 'выполняется отдельно от отправляемого решения.'},
        'requirements': {   'items': [   'класс StudySession',
                                         '__init__ с self',
                                         'атрибуты subject и minutes',
                                         'два экземпляра и чтение атрибутов'],
                            'nodes': ['ClassDef'],
                            'attributes': ['subject', 'minutes'],
                            'calls': ['print']},
        'starter_code': '# subject, minutes, second_subject и second_minutes уже заданы\n'
                        '# Напишите StudySession, создайте две сессии и выведите четыре поля\n',
        'tests': [   {   'name': 'две учебные сессии',
                         'namespace': {   'subject': 'Python',
                                          'minutes': 25,
                                          'second_subject': 'SQL',
                                          'second_minutes': 40},
                         'expected': 'Python\n25\nSQL\n40',
                         'assert': 'stdout'},
                     {   'name': 'новые входные значения',
                         'namespace': {   'subject': 'Git',
                                          'minutes': 10,
                                          'second_subject': 'Python',
                                          'second_minutes': 55},
                         'expected': 'Git\n10\nPython\n55',
                         'assert': 'stdout'}],
        'reference_code': 'class StudySession:\n'
                          '    def __init__(self, subject, minutes):\n'
                          '        self.subject = subject\n'
                          '        self.minutes = minutes\n'
                          '\n'
                          'first = StudySession(subject, minutes)\n'
                          'second = StudySession(second_subject, second_minutes)\n'
                          'print(first.subject)\n'
                          'print(first.minutes)\n'
                          'print(second.subject)\n'
                          'print(second.minutes)\n'}],
    34: [{'title': 'Повторяем сигнатуру конструктора ReadingPlan',
          'level': 'easy',
          'mode': 'script',
          'prompt': 'В уроке @dataclass создаёт __init__ по объявленным полям: topic обязателен, а minutes '
                    'имеет значение по умолчанию 25. Чтобы увидеть, как ведут себя эти аргументы, '
                    'повторите эту сигнатуру вручную в учебном классе ReadingPlan. Сохраните значения в '
                    'атрибутах self.topic и self.minutes.\n'
                    '\n'
                    'Если use_default равно True, создайте объект ReadingPlan(topic), не передавая '
                    'minutes. Иначе создайте ReadingPlan(topic, minutes).\n'
                    '\n'
                    'Выведите тему и количество минут на отдельных строках. Обратите внимание: явно '
                    'переданный 0 должен сохраниться, а значение 25 используется только при пропуске '
                    'аргумента.',
          'contract': {'given': 'Интерпретатор заранее создаёт переменные topic (строка), minutes (целое '
                                'число) и use_default (bool). Когда use_default=True, аргумент minutes '
                                'необходимо пропустить при создании объекта.',
                       'todo': 'Объявите обычный учебный класс ReadingPlan и вручную повторите сигнатуру '
                               '__init__, которую @dataclass создаёт для этих полей: topic обязателен, '
                               'minutes по умолчанию равен 25. Сохраните оба атрибута. Создайте объект в '
                               'зависимости от use_default и выведите plan.topic и plan.minutes.',
                       'check': 'Проверяются значение по умолчанию, явно переданное количество минут, '
                                'сохранение нуля и создание объекта с другой темой. Сравнивается весь '
                                'вывод программы.'},
          'requirements': {'items': ['Класс ReadingPlan',
                                     'Конструктор __init__(self, topic, minutes=25)',
                                     'Атрибуты self.topic и self.minutes',
                                     'Различие между пропущенным аргументом и явно переданным значением',
                                     'Вывод обоих атрибутов через print()'],
                           'nodes': ['ClassDef', 'FunctionDef', 'If'],
                           'calls': ['print'],
                           'attributes': ['topic', 'minutes']},
          'starter_code': '# Переменные topic, minutes и use_default уже созданы.\n'
                          '\n'
                          '# 1. Объявите класс ReadingPlan.\n'
                          '# 2. Добавьте конструктор с minutes=25.\n'
                          '# 3. Сохраните topic и minutes в атрибутах объекта.\n'
                          '# 4. Создайте plan с учётом use_default.\n'
                          '# 5. Выведите plan.topic и plan.minutes.\n',
          'tests': [{'name': 'Значение minutes по умолчанию',
                     'namespace': {'topic': 'Словари', 'minutes': 60, 'use_default': True},
                     'expected': 'Словари\n25',
                     'assert': 'stdout'},
                    {'name': 'Явно переданные минуты',
                     'namespace': {'topic': 'Циклы', 'minutes': 40, 'use_default': False},
                     'expected': 'Циклы\n40',
                     'assert': 'stdout'},
                    {'name': 'Явный ноль не заменяется значением по умолчанию',
                     'namespace': {'topic': 'Файлы', 'minutes': 0, 'use_default': False},
                     'expected': 'Файлы\n0',
                     'assert': 'stdout'},
                    {'name': 'Другая тема без передачи minutes',
                     'namespace': {'topic': 'Классы', 'minutes': 5, 'use_default': True},
                     'expected': 'Классы\n25',
                     'assert': 'stdout'}],
          'reference_code': 'class ReadingPlan:\n'
                            '    def __init__(self, topic: str, minutes: int = 25):\n'
                            '        self.topic = topic\n'
                            '        self.minutes = minutes\n'
                            '\n'
                            '\n'
                            'if use_default:\n'
                            '    plan = ReadingPlan(topic)\n'
                            'else:\n'
                            '    plan = ReadingPlan(topic, minutes)\n'
                            '\n'
                            'print(plan.topic)\n'
                            'print(plan.minutes)\n'}]}

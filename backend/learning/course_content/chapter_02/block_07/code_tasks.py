from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    36: [{'title': 'Два экземпляра ReadingPlan',
       'level': 'easy',
       'mode': 'script',
       'prompt': 'Опишите ReadingPlan с конструктором __init__(self, topic, days). До запуска предскажите значения '
                 'параметров и атрибутов при двух вызовах класса; затем создайте два экземпляра с подготовленными '
                 'значениями и выведите topic и days каждого через точку. После запуска объясните, почему присваивание '
                 'локальному имени не сохраняет поле объекта и какие действия Planner остаются за его функциями.',
       'contract': {'given': 'Интерпретатор создаёт topic, days, second_topic и second_days. Значения меняются в проверках.',
                    'todo': 'Опишите ReadingPlan с конструктором __init__(self, topic, days). До запуска предскажите значения '
                            'параметров и атрибутов при двух вызовах класса; затем создайте два экземпляра с подготовленными '
                            'значениями и выведите topic и days каждого через точку.',
                    'check': 'Сравниваются четыре строки: два поля первого и второго экземпляров. Оба объекта должны '
                             'получить свои значения, доступные через атрибуты.'},
       'requirements': {'items': ['класс ReadingPlan', '__init__ с self', 'два экземпляра с независимыми полями'],
                        'nodes': ['ClassDef'],
                        'attributes': ['topic', 'days'],
                        'calls': ['print']},
       'starter_code': '# topic, days, second_topic и second_days уже созданы\n'
                       '# Опишите ReadingPlan, создайте два экземпляра и выведите их поля\n',
       'tests': [{'name': 'разные планы',
                  'namespace': {'topic': 'functions', 'days': 3, 'second_topic': 'lists', 'second_days': 5},
                  'expected': 'functions\n3\nlists\n5',
                  'assert': 'stdout'},
                 {'name': 'другие значения',
                  'namespace': {'topic': 'classes', 'days': 2, 'second_topic': 'files', 'second_days': 7},
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
                         'print(second.days)\n'}],
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
                        'nodes': ['ClassDef', 'If', 'Try', 'Raise'],
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
                         "print(f'PRIORITY {task.priority}')\n"}]}

from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
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
                        'nodes': ['ClassDef', 'If'],
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
                         "print(f'PRIORITY {task.priority}')\n"}]
}

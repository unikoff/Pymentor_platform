"""Учебная практика блока. Редактируйте задания здесь."""

from __future__ import annotations

from typing import Any


CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    49: [
{       'title': 'Выборка задач внутри PlannerService',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Добавьте в PlannerService метод select_tasks. Он получает задачи через '
                  'list_tasks и возвращает выборку, не изменяя исходный список.',
        'hints': [       'Сначала получите задачи через list_tasks. None означает, что статусный '
                         'фильтр не задан.',
                         'Подготовьте результат фильтрации и сортировки до того, как ограничите '
                         'его длину.',
                         'Проверьте оба направления сортировки и сравните список PlannerService до '
                         'и после вызова.'],
        'contract': {       'given': 'solve(tasks, is_done=None, sort_desc=False, limit=None) '
                                     'получает список словарей с полями id и is_done. Он передаёт '
                                     'параметры новому PlannerService.select_tasks; хранение и '
                                     'HTTP не используются.',
                            'todo': 'Реализуйте только select_tasks. None оставляет оба статуса, '
                                    'True и False выбирают точные совпадения; затем задачи '
                                    'сортируются по id и при заданном limit ограничиваются. '
                                    'Исходные задачи не меняются. solve возвращает выбранные '
                                    'записи и состояние исходного списка.',
                            'check': 'Проверяются все значения статуса, оба направления, '
                                     'limit=None и limit=1, включая различие порядка filter → sort '
                                     '→ limit. Сравниваются исходные данные; stdout не '
                                     'используется.'},
        'requirements': {       'items': [       'Метод начинает работу с self.list_tasks().',
                                                 'None оставляет оба статуса; True и False '
                                                 'выбирают точные совпадения.',
                                                 'Сортировка по id выполняется до применения '
                                                 'limit.',
                                                 'limit=None не ограничивает результат, limit=1 '
                                                 'берёт первый элемент подготовленной выборки.',
                                                 'Исходный список и задачи не изменяются.',
                                                 'solve вызывает select_tasks и возвращает '
                                                 'результат без вывода.'],
                                'names': ['Task', 'PlannerService'],
                                'nodes': ['ClassDef', 'FunctionDef'],
                                'attributes': ['list_tasks']},
        'starter_code': 'class Task:\n'
                        '    def __init__(self, task_id, is_done):\n'
                        '        self.id = task_id\n'
                        '        self.is_done = is_done\n'
                        '\n'
                        '\n'
                        'class PlannerService:\n'
                        '    def __init__(self, tasks):\n'
                        '        self._tasks = tasks\n'
                        '\n'
                        '    def list_tasks(self):\n'
                        '        return self._tasks\n'
                        '\n'
                        '    def select_tasks(self, is_done=None, sort_desc=False, limit=None):\n'
                        '        # TODO: верните новую выборку, не меняя список из list_tasks\n'
                        '        pass\n'
                        '\n'
                        '\n'
                        'def solve(tasks, is_done=None, sort_desc=False, limit=None):\n'
                        '    planner = PlannerService([Task(item["id"], item["is_done"]) for item '
                        'in tasks])\n'
                        '    selected = planner.select_tasks(is_done, sort_desc, limit)\n'
                        '    return {\n'
                        '        "selected": [{"id": task.id, "is_done": task.is_done} for task in '
                        'selected],\n'
                        '        "original": [{"id": task.id, "is_done": task.is_done} for task in '
                        'planner.list_tasks()],\n'
                        '    }\n',
        'tests': [       {       'name': 'оба статуса, по возрастанию',
                                 'args': [       [       {'id': 8, 'is_done': False},
                                                         {'id': 3, 'is_done': True},
                                                         {'id': 17, 'is_done': True},
                                                         {'id': 5, 'is_done': False}],
                                                 None,
                                                 False,
                                                 None],
                                 'preserve_inputs': True,
                                 'no_stdout': True,
                                 'expected': {       'selected': [       {'id': 3, 'is_done': True},
                                                                         {       'id': 5,
                                                                                 'is_done': False},
                                                                         {       'id': 8,
                                                                                 'is_done': False},
                                                                         {       'id': 17,
                                                                                 'is_done': True}],
                                                     'original': [       {       'id': 8,
                                                                                 'is_done': False},
                                                                         {'id': 3, 'is_done': True},
                                                                         {       'id': 17,
                                                                                 'is_done': True},
                                                                         {       'id': 5,
                                                                                 'is_done': False}]}},
                         {       'name': 'только завершённые',
                                 'args': [       [       {'id': 8, 'is_done': False},
                                                         {'id': 3, 'is_done': True},
                                                         {'id': 17, 'is_done': True},
                                                         {'id': 5, 'is_done': False}],
                                                 True,
                                                 False,
                                                 None],
                                 'preserve_inputs': True,
                                 'no_stdout': True,
                                 'expected': {       'selected': [       {'id': 3, 'is_done': True},
                                                                         {       'id': 17,
                                                                                 'is_done': True}],
                                                     'original': [       {       'id': 8,
                                                                                 'is_done': False},
                                                                         {'id': 3, 'is_done': True},
                                                                         {       'id': 17,
                                                                                 'is_done': True},
                                                                         {       'id': 5,
                                                                                 'is_done': False}]}},
                         {       'name': 'только открытые',
                                 'args': [       [       {'id': 8, 'is_done': False},
                                                         {'id': 3, 'is_done': True},
                                                         {'id': 17, 'is_done': True},
                                                         {'id': 5, 'is_done': False}],
                                                 False,
                                                 False,
                                                 None],
                                 'preserve_inputs': True,
                                 'no_stdout': True,
                                 'expected': {       'selected': [       {       'id': 5,
                                                                                 'is_done': False},
                                                                         {       'id': 8,
                                                                                 'is_done': False}],
                                                     'original': [       {       'id': 8,
                                                                                 'is_done': False},
                                                                         {'id': 3, 'is_done': True},
                                                                         {       'id': 17,
                                                                                 'is_done': True},
                                                                         {       'id': 5,
                                                                                 'is_done': False}]}},
                         {       'name': 'все задачи по убыванию',
                                 'args': [       [       {'id': 8, 'is_done': False},
                                                         {'id': 3, 'is_done': True},
                                                         {'id': 17, 'is_done': True},
                                                         {'id': 5, 'is_done': False}],
                                                 None,
                                                 True,
                                                 None],
                                 'preserve_inputs': True,
                                 'no_stdout': True,
                                 'expected': {       'selected': [       {       'id': 17,
                                                                                 'is_done': True},
                                                                         {       'id': 8,
                                                                                 'is_done': False},
                                                                         {       'id': 5,
                                                                                 'is_done': False},
                                                                         {       'id': 3,
                                                                                 'is_done': True}],
                                                     'original': [       {       'id': 8,
                                                                                 'is_done': False},
                                                                         {'id': 3, 'is_done': True},
                                                                         {       'id': 17,
                                                                                 'is_done': True},
                                                                         {       'id': 5,
                                                                                 'is_done': False}]}},
                         {       'name': 'завершённые по убыванию',
                                 'args': [       [       {'id': 8, 'is_done': False},
                                                         {'id': 3, 'is_done': True},
                                                         {'id': 17, 'is_done': True},
                                                         {'id': 5, 'is_done': False}],
                                                 True,
                                                 True,
                                                 None],
                                 'preserve_inputs': True,
                                 'no_stdout': True,
                                 'expected': {       'selected': [       {       'id': 17,
                                                                                 'is_done': True},
                                                                         {       'id': 3,
                                                                                 'is_done': True}],
                                                     'original': [       {       'id': 8,
                                                                                 'is_done': False},
                                                                         {'id': 3, 'is_done': True},
                                                                         {       'id': 17,
                                                                                 'is_done': True},
                                                                         {       'id': 5,
                                                                                 'is_done': False}]}},
                         {       'name': 'открытые по убыванию',
                                 'args': [       [       {'id': 8, 'is_done': False},
                                                         {'id': 3, 'is_done': True},
                                                         {'id': 17, 'is_done': True},
                                                         {'id': 5, 'is_done': False}],
                                                 False,
                                                 True,
                                                 None],
                                 'preserve_inputs': True,
                                 'no_stdout': True,
                                 'expected': {       'selected': [       {       'id': 8,
                                                                                 'is_done': False},
                                                                         {       'id': 5,
                                                                                 'is_done': False}],
                                                     'original': [       {       'id': 8,
                                                                                 'is_done': False},
                                                                         {'id': 3, 'is_done': True},
                                                                         {       'id': 17,
                                                                                 'is_done': True},
                                                                         {       'id': 5,
                                                                                 'is_done': False}]}},
                         {       'name': 'limit=1 после фильтра и сортировки',
                                 'args': [       [       {'id': 8, 'is_done': False},
                                                         {'id': 3, 'is_done': True},
                                                         {'id': 17, 'is_done': True},
                                                         {'id': 5, 'is_done': False}],
                                                 False,
                                                 False,
                                                 1],
                                 'preserve_inputs': True,
                                 'no_stdout': True,
                                 'expected': {       'selected': [{'id': 5, 'is_done': False}],
                                                     'original': [       {       'id': 8,
                                                                                 'is_done': False},
                                                                         {'id': 3, 'is_done': True},
                                                                         {       'id': 17,
                                                                                 'is_done': True},
                                                                         {       'id': 5,
                                                                                 'is_done': False}]}},
                         {       'name': 'limit=1 после сортировки по убыванию',
                                 'args': [       [       {'id': 8, 'is_done': False},
                                                         {'id': 3, 'is_done': True},
                                                         {'id': 17, 'is_done': True},
                                                         {'id': 5, 'is_done': False}],
                                                 None,
                                                 True,
                                                 1],
                                 'preserve_inputs': True,
                                 'no_stdout': True,
                                 'expected': {       'selected': [{'id': 17, 'is_done': True}],
                                                     'original': [       {       'id': 8,
                                                                                 'is_done': False},
                                                                         {'id': 3, 'is_done': True},
                                                                         {       'id': 17,
                                                                                 'is_done': True},
                                                                         {       'id': 5,
                                                                                 'is_done': False}]}}],
        'reference_code': 'class Task:\n'
                          '    def __init__(self, task_id, is_done):\n'
                          '        self.id = task_id\n'
                          '        self.is_done = is_done\n'
                          '\n'
                          '\n'
                          'class PlannerService:\n'
                          '    def __init__(self, tasks):\n'
                          '        self._tasks = tasks\n'
                          '\n'
                          '    def list_tasks(self):\n'
                          '        return self._tasks\n'
                          '\n'
                          '    def select_tasks(self, is_done=None, sort_desc=False, limit=None):\n'
                          '        items = self.list_tasks()\n'
                          '        if is_done is not None:\n'
                          '            items = [task for task in items if task.is_done is '
                          'is_done]\n'
                          '        items = sorted(items, key=lambda task: task.id, '
                          'reverse=sort_desc)\n'
                          '        if limit is not None:\n'
                          '            items = items[:limit]\n'
                          '        return items\n'
                          '\n'
                          '\n'
                          'def solve(tasks, is_done=None, sort_desc=False, limit=None):\n'
                          '    planner = PlannerService([Task(item["id"], item["is_done"]) for '
                          'item in tasks])\n'
                          '    selected = planner.select_tasks(is_done, sort_desc, limit)\n'
                          '    return {\n'
                          '        "selected": [{"id": task.id, "is_done": task.is_done} for task '
                          'in selected],\n'
                          '        "original": [{"id": task.id, "is_done": task.is_done} for task '
                          'in planner.list_tasks()],\n'
                          '    }\n'}
    ]
}

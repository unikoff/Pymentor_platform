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


FOUNDATIONS_CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    1: [
        _script(
            "Порядок строк",
            "Напишите программу из трёх `print()`. Она должна вывести строки в порядке: `Старт`, `Проверяю план`, `Готово`.",
            'print("Старт")\n# Добавьте ещё две строки\n',
            "Старт\nПроверяю план\nГотово",
            'print("Старт")\nprint("Проверяю план")\nprint("Готово")\n',
        ),
        _script(
            "Чтение сверху вниз",
            "Выведите название программы, затем слово `запущена`. Используйте две отдельные команды `print()`.",
            'print("Console Planner")\n# Напишите вторую строку\n',
            "Console Planner\nзапущена",
            'print("Console Planner")\nprint("запущена")\n',
        ),
    ],
    4: [
        _script(
            "Данные одной задачи",
            "Создайте переменные `title`, `priority`, `is_done` со значениями `Сделать README`, `2`, `False`. Выведите их по одной в этом порядке.",
            "# Создайте три переменные\n", "Сделать README\n2\nFalse",
            'title = "Сделать README"\npriority = 2\nis_done = False\nprint(title)\nprint(priority)\nprint(is_done)\n',
        ),
        _script(
            "Обновите приоритет",
            "Создайте `priority = 1`, выведите значение, затем измените его на 3 и снова выведите.",
            "priority = 1\nprint(priority)\n# Измените значение\n", "1\n3",
            "priority = 1\nprint(priority)\npriority = 3\nprint(priority)\n",
        ),
    ],
    5: [
        _script(
            "Минуты из текста",
            "Создайте `raw_hours = '3'`, преобразуйте строку через `int()` и выведите число минут.",
            "raw_hours = '3'\n# Напечатайте минуты\n", "180",
            "raw_hours = '3'\nhours = int(raw_hours)\nprint(hours * 60)\n",
        ),
        _script(
            "Среднее время",
            "Создайте `first = 20` и `second = 40`. Выведите сумму и среднее значение, каждое с новой строки.",
            "first = 20\nsecond = 40\n# Напишите расчёты\n", "60\n30.0",
            "first = 20\nsecond = 40\nprint(first + second)\nprint((first + second) / 2)\n",
        ),
    ],
    6: [
        _script(
            "Карточка через f-строку",
            "Создайте `title = 'Купить хлеб'` и `priority = 1`. Через f-строку выведите `Задача: Купить хлеб | приоритет: 1`.",
            "title = 'Купить хлеб'\npriority = 1\n# Используйте f-строку\n", "Задача: Купить хлеб | приоритет: 1",
            "title = 'Купить хлеб'\npriority = 1\nprint(f'Задача: {title} | приоритет: {priority}')\n",
        ),
        _script(
            "Очистите заголовок",
            "Создайте строку `'  сделать README  '`. Уберите пробелы по краям, приведите текст к нижнему регистру и выведите результат.",
            "raw_title = '  сделать README  '\n# Подготовьте строку\n", "сделать readme",
            "raw_title = '  сделать README  '\nclean_title = raw_title.strip().lower()\nprint(clean_title)\n",
        ),
    ],
    7: [
        _script(
            "Срочная задача",
            "Создайте `days_left = 3`. Выведите результат проверки: дней осталось не больше трёх.",
            "days_left = 3\n# Напечатайте bool-выражение\n", "True",
            "days_left = 3\nprint(days_left <= 3)\n",
        ),
        _script(
            "Два условия",
            "Создайте `is_important = True` и `is_today = False`. Выведите результат `or`, затем результат `and`.",
            "is_important = True\nis_today = False\n# Напечатайте два выражения\n", "True\nFalse",
            "is_important = True\nis_today = False\nprint(is_important or is_today)\nprint(is_important and is_today)\n",
        ),
    ],
    8: [
        _script(
            "Текстовый приоритет",
            "Создайте `priority = 1`. Через `if / elif / else` выведите `высокий` для 1, `обычный` для 2 и `низкий` для остальных значений.",
            "priority = 1\n# Напишите ветвление\n", "высокий",
            "priority = 1\nif priority == 1:\n    print('высокий')\nelif priority == 2:\n    print('обычный')\nelse:\n    print('низкий')\n",
        ),
        _script(
            "Статус задачи",
            "Создайте `is_done = False`. Если задача выполнена, печатайте `Закрыта`, иначе — `В работе`.",
            "is_done = False\n# Напишите условие\n", "В работе",
            "is_done = False\nif is_done:\n    print('Закрыта')\nelse:\n    print('В работе')\n",
        ),
    ],
    9: [
        _script(
            "Выведите список",
            "Создайте список `['Код', 'Тесты', 'README']` и циклом `for` напечатайте каждый элемент с новой строки.",
            "tasks = ['Код', 'Тесты', 'README']\n# Напишите цикл\n", "Код\nТесты\nREADME",
            "tasks = ['Код', 'Тесты', 'README']\nfor task in tasks:\n    print(task)\n",
        ),
        _script(
            "Номера от 1 до 3",
            "Используйте `range()`, чтобы вывести числа 1, 2 и 3 каждое с новой строки.",
            "# Напишите цикл с range\n", "1\n2\n3",
            "for number in range(1, 4):\n    print(number)\n",
        ),
    ],
    10: [
        _script(
            "Счётчик до трёх",
            "Создайте `completed = 0`. Циклом `while` увеличивайте счётчик и выводите значения 1, 2, 3.",
            "completed = 0\n# Напишите while\n", "1\n2\n3",
            "completed = 0\nwhile completed < 3:\n    completed += 1\n    print(completed)\n",
        ),
        _script(
            "Остановка по команде",
            "Создайте `command = ''`. Внутри `while` замените её на `'exit'`, затем после цикла выведите `Завершено`.",
            "command = ''\n# Завершите цикл через команду exit\n", "Завершено",
            "command = ''\nwhile command != 'exit':\n    command = 'exit'\nprint('Завершено')\n",
        ),
    ],
    11: [
        _script(
            "Добавьте задачу",
            "Создайте список `['Код', 'Тесты']`, добавьте в конец `README` и выведите итоговый список.",
            "tasks = ['Код', 'Тесты']\n# Добавьте README\n", "['Код', 'Тесты', 'README']",
            "tasks = ['Код', 'Тесты']\ntasks.append('README')\nprint(tasks)\n",
        ),
        _script(
            "Уникальные теги",
            "Создайте множество тегов из `['python', 'git', 'python']` и выведите его длину.",
            "tags = ['python', 'git', 'python']\n# Создайте множество\n", "2",
            "tags = ['python', 'git', 'python']\nunique_tags = set(tags)\nprint(len(unique_tags))\n",
        ),
    ],
    12: [
        _script(
            "Словарь задачи",
            "Создайте словарь с ключами `title`, `priority`, `done`, значениями `Код`, `1`, `False`. Выведите значение по ключу `title`.",
            "# Создайте словарь task\n", "Код",
            "task = {'title': 'Код', 'priority': 1, 'done': False}\nprint(task['title'])\n",
        ),
        _script(
            "Измените статус",
            "Создайте `task = {'title': 'README', 'done': False}`, измените `done` на `True` и выведите это значение.",
            "task = {'title': 'README', 'done': False}\n# Измените статус\n", "True",
            "task = {'title': 'README', 'done': False}\ntask['done'] = True\nprint(task['done'])\n",
        ),
    ],
    13: [
        _solve("Формат задачи", "Напишите `solve(title, priority)`, возвращающую строку `Задача: <title> | приоритет: <priority>`.", "def solve(title, priority):\n    pass\n", [{"name": "обычная задача", "args": ["Код", 1], "expected": "Задача: Код | приоритет: 1"}, {"name": "другая задача", "args": ["README", 3], "expected": "Задача: README | приоритет: 3"}], "def solve(title, priority):\n    return f'Задача: {title} | приоритет: {priority}'\n"),
        _solve("Срочность по дням", "Напишите `solve(days_left)`, возвращающую `True`, если дней осталось не больше трёх.", "def solve(days_left):\n    pass\n", [{"name": "пять дней", "args": [5], "expected": False}, {"name": "три дня", "args": [3], "expected": True}, {"name": "сегодня", "args": [0], "expected": True}], "def solve(days_left):\n    return days_left <= 3\n"),
    ],
    14: [
        _solve("Чистый заголовок", "Напишите `solve(title)`, которая убирает пробелы по краям и приводит каждое слово к заглавной букве.", "def solve(title):\n    pass\n", [{"name": "лишние пробелы", "args": ["  сделать readme  "], "expected": "Сделать Readme"}, {"name": "одно слово", "args": ["код"], "expected": "Код"}], "def solve(title):\n    return title.strip().title()\n"),
        _solve("Открытые задачи", "Напишите `solve(tasks)`, возвращающую число словарей, у которых `done` равно `False`.", "def solve(tasks):\n    pass\n", [{"name": "две открытые", "args": [[{"done": False}, {"done": True}, {"done": False}]], "expected": 2}, {"name": "пустой список", "args": [[]], "expected": 0}], "def solve(tasks):\n    count = 0\n    for task in tasks:\n        if not task['done']:\n            count += 1\n    return count\n"),
    ],
    15: [
        _script("Исправьте имя", "Исправьте код так, чтобы он вывел заголовок в верхнем регистре. Не создавайте новую переменную с другим именем.", "task_title = 'сделать readme'\nprint(task_titel.upper())\n", "СДЕЛАТЬ README", "task_title = 'сделать readme'\nprint(task_title.upper())\n"),
        _script("Исправьте тип", "Преобразуйте строку `'7'` в число и выведите результат сложения с 1.", "raw_priority = '7'\nprint(raw_priority + 1)\n", "8", "raw_priority = '7'\nprint(int(raw_priority) + 1)\n"),
    ],
    16: [
        _script("Команда меню", "Создайте `command = 'list'`. Через `if / elif / else` выведите `Показать задачи` для `list`, `Добавить задачу` для `add`, иначе `Неизвестная команда`.", "command = 'list'\n# Напишите обработчик\n", "Показать задачи", "command = 'list'\nif command == 'list':\n    print('Показать задачи')\nelif command == 'add':\n    print('Добавить задачу')\nelse:\n    print('Неизвестная команда')\n"),
        _script("Пустой заголовок", "Создайте `title = '   '`. После `strip()` выведите `Ошибка: пустой заголовок`, если текста нет.", "title = '   '\n# Проверьте заголовок\n", "Ошибка: пустой заголовок", "title = '   '\nif title.strip() == '':\n    print('Ошибка: пустой заголовок')\nelse:\n    print('Задача добавлена')\n"),
    ],
    17: [
        _solve("Создайте модели задач", "Напишите `solve(titles)`, возвращающую список словарей вида `{'title': ..., 'done': False}` для каждого заголовка.", "def solve(titles):\n    pass\n", [{"name": "две задачи", "args": [["Код", "README"]], "expected": [{"title": "Код", "done": False}, {"title": "README", "done": False}]}, {"name": "нет задач", "args": [[]], "expected": []}], "def solve(titles):\n    result = []\n    for title in titles:\n        result.append({'title': title, 'done': False})\n    return result\n"),
        _solve("Покажите заголовки", "Напишите `solve(tasks)`, возвращающую список заголовков из списка словарей задач.", "def solve(tasks):\n    pass\n", [{"name": "два заголовка", "args": [[{"title": "Код"}, {"title": "Тесты"}]], "expected": ["Код", "Тесты"]}, {"name": "пустой список", "args": [[]], "expected": []}], "def solve(tasks):\n    titles = []\n    for task in tasks:\n        titles.append(task['title'])\n    return titles\n"),
    ],
    18: [
        _solve("Поиск по заголовку", "Напишите `solve(tasks, query)`, возвращающую заголовки задач, в которых есть `query` без учёта регистра.", "def solve(tasks, query):\n    pass\n", [{"name": "одно совпадение", "args": [[{"title": "Сделать README"}, {"title": "Написать тесты"}], "readme"], "expected": ["Сделать README"]}, {"name": "нет совпадений", "args": [[{"title": "Код"}], "git"], "expected": []}], "def solve(tasks, query):\n    found = []\n    for task in tasks:\n        if query.lower() in task['title'].lower():\n            found.append(task['title'])\n    return found\n"),
        _solve("Статистика статусов", "Напишите `solve(tasks)`, возвращающую список `[открытые, выполненные]`.", "def solve(tasks):\n    pass\n", [{"name": "смешанный список", "args": [[{"done": False}, {"done": True}, {"done": False}]], "expected": [2, 1]}, {"name": "нет задач", "args": [[]], "expected": [0, 0]}], "def solve(tasks):\n    open_count = 0\n    done_count = 0\n    for task in tasks:\n        if task['done']:\n            done_count += 1\n        else:\n            open_count += 1\n    return [open_count, done_count]\n"),
    ],
}


DEEPER_CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    22: [
        _solve("Контракт заголовка", "Напишите `solve(title)`, возвращающую `True`, если после `strip()` заголовок не пустой.", "def solve(title):\n    pass\n", [{"name": "обычный заголовок", "args": ["Купить хлеб"], "expected": True}, {"name": "пробелы", "args": ["   "], "expected": False}], "def solve(title):\n    return title.strip() != ''\n"),
        _solve("Контракт приоритета", "Напишите `solve(priority)`, возвращающую `True` только для целых приоритетов от 1 до 3 включительно.", "def solve(priority):\n    pass\n", [{"name": "нижняя граница", "args": [1], "expected": True}, {"name": "верхняя граница", "args": [3], "expected": True}, {"name": "слишком большой", "args": [4], "expected": False}], "def solve(priority):\n    return priority >= 1 and priority <= 3\n"),
    ],
    23: [
        _solve("Значение по умолчанию", "Напишите `solve(title, priority=2, done=False)`, возвращающую словарь с этими тремя полями.", "def solve(title, priority=2, done=False):\n    pass\n", [{"name": "только обязательный аргумент", "args": ["Код"], "expected": {"title": "Код", "priority": 2, "done": False}}, {"name": "все значения", "args": ["README", 1, True], "expected": {"title": "README", "priority": 1, "done": True}}], "def solve(title, priority=2, done=False):\n    return {'title': title, 'priority': priority, 'done': done}\n"),
        _solve("Именованные настройки", "Напишите `solve(title, priority=2, done=False)`. Автопроверка вызовет её с именованными аргументами; верните строку `<title>:<priority>:<done>`.", "def solve(title, priority=2, done=False):\n    pass\n", [{"name": "именованный вызов", "kwargs": {"title": "Тесты", "done": True, "priority": 3}, "expected": "Тесты:3:True"}, {"name": "значения по умолчанию", "kwargs": {"title": "Код"}, "expected": "Код:2:False"}], "def solve(title, priority=2, done=False):\n    return f'{title}:{priority}:{done}'\n"),
    ],
    24: [
        _solve("Локальное не меняет внешнее", "Напишите `solve(status)`: внутри создайте `local_status = 'done'`, а верните список из исходного `status` и локального значения.", "def solve(status):\n    pass\n", [{"name": "исходный статус", "args": ["new"], "expected": ["new", "done"]}, {"name": "другой статус", "args": ["in_progress"], "expected": ["in_progress", "done"]}], "def solve(status):\n    local_status = 'done'\n    return [status, local_status]\n"),
        _solve("Изменяемый список", "Напишите `solve(tasks, title)`: добавьте `title` в переданный список и верните этот же список.", "def solve(tasks, title):\n    pass\n", [{"name": "добавление", "args": [["Код"], "Тесты"], "expected": ["Код", "Тесты"]}, {"name": "пустой список", "args": [[], "README"], "expected": ["README"]}], "def solve(tasks, title):\n    tasks.append(title)\n    return tasks\n"),
    ],
    25: [
        _solve("Сумма *args", "Напишите `solve(*durations)`, возвращающую сумму всех переданных длительностей.", "def solve(*durations):\n    pass\n", [{"name": "две длительности", "args": [15, 45], "expected": 60}, {"name": "четыре длительности", "args": [5, 10, 15, 20], "expected": 50}], "def solve(*durations):\n    return sum(durations)\n"),
        _solve("Словарь **kwargs", "Напишите `solve(**settings)`, возвращающую значения `priority` и `owner` в списке именно в таком порядке.", "def solve(**settings):\n    pass\n", [{"name": "две настройки", "kwargs": {"priority": 1, "owner": "Анна"}, "expected": [1, "Анна"]}, {"name": "другие значения", "kwargs": {"owner": "Илья", "priority": 3}, "expected": [3, "Илья"]}], "def solve(**settings):\n    return [settings['priority'], settings['owner']]\n"),
    ],
    26: [
        _solve("Правило как функция", "Напишите `solve(numbers)`. Внутри создайте функцию `is_even(number)` и верните только чётные числа из входного списка.", "def solve(numbers):\n    pass\n", [{"name": "смешанные числа", "args": [[1, 2, 3, 4]], "expected": [2, 4]}, {"name": "нет чётных", "args": [[1, 3]], "expected": []}], "def solve(numbers):\n    def is_even(number):\n        return number % 2 == 0\n\n    result = []\n    for number in numbers:\n        if is_even(number):\n            result.append(number)\n    return result\n"),
        _solve("Замыкание с префиксом", "Напишите `solve(prefix, text)`. Внутри создайте `make_prefix(prefix)`, верните из неё внутреннюю функцию и примените её к `text`.", "def solve(prefix, text):\n    pass\n", [{"name": "todo", "args": ["[TODO] ", "Код"], "expected": "[TODO] Код"}, {"name": "done", "args": ["[DONE] ", "README"], "expected": "[DONE] README"}], "def solve(prefix, text):\n    def make_prefix(prefix):\n        def add_prefix(value):\n            return prefix + value\n        return add_prefix\n\n    formatter = make_prefix(prefix)\n    return formatter(text)\n"),
    ],
    27: [
        _solve("Декоратор до и после", "Напишите декоратор `announce`, который печатает `Старт` до вызова и `Готово` после. Оберните им `solve(title)`, возвращающую `title.upper()`.", "def solve(title):\n    pass\n", [{"name": "значение функции", "args": ["код"], "expected": "КОД"}, {"name": "другая строка", "args": ["тесты"], "expected": "ТЕСТЫ"}], "def announce(func):\n    def wrapper(*args, **kwargs):\n        print('Старт')\n        result = func(*args, **kwargs)\n        print('Готово')\n        return result\n    return wrapper\n\n@announce\ndef solve(title):\n    return title.upper()\n"),
        _solve("Параметры не потерялись", "Напишите декоратор `keep_args`, в `wrapper` используйте `*args, **kwargs`. Оберните `solve(first, second)`, возвращающую их сумму.", "def solve(first, second):\n    pass\n", [{"name": "два числа", "args": [4, 6], "expected": 10}, {"name": "ноль", "args": [0, 5], "expected": 5}], "def keep_args(func):\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper\n\n@keep_args\ndef solve(first, second):\n    return first + second\n"),
    ],
    29: [
        _solve("Безопасный int", "Напишите `solve(raw)`: верните `int(raw)`, а при `ValueError` верните `None`.", "def solve(raw):\n    pass\n", [{"name": "число", "args": ["12"], "expected": 12}, {"name": "текст", "args": ["двенадцать"], "expected": None}], "def solve(raw):\n    try:\n        return int(raw)\n    except ValueError:\n        return None\n"),
        _solve("Деление без падения", "Напишите `solve(total, count)`: верните результат деления, а при делении на ноль верните строку `нельзя делить на ноль`.", "def solve(total, count):\n    pass\n", [{"name": "обычное деление", "args": [9, 3], "expected": 3.0}, {"name": "ноль", "args": [9, 0], "expected": "нельзя делить на ноль"}], "def solve(total, count):\n    try:\n        return total / count\n    except ZeroDivisionError:\n        return 'нельзя делить на ноль'\n"),
    ],
    30: [
        _solve("else после успеха", "Напишите `solve(raw)`: в `try` преобразуйте строку в число, при `ValueError` верните `некорректный возраст`, в `else` верните `Возраст: <число>`. Добавьте `finally` с `pass`.", "def solve(raw):\n    pass\n", [{"name": "корректный возраст", "args": ["18"], "expected": "Возраст: 18"}, {"name": "некорректный возраст", "args": ["восемнадцать"], "expected": "некорректный возраст"}], "def solve(raw):\n    try:\n        age = int(raw)\n    except ValueError:\n        return 'некорректный возраст'\n    else:\n        return f'Возраст: {age}'\n    finally:\n        pass\n"),
        _solve("Своя ошибка команды", "Создайте `InvalidCommand(Exception)`. В `solve(command)` разрешите только `add` и `list`; для другой команды вызовите и поймайте свою ошибку, вернув её текст.", "def solve(command):\n    pass\n", [{"name": "разрешённая команда", "args": ["list"], "expected": "ok"}, {"name": "неизвестная команда", "args": ["remove"], "expected": "Неизвестная команда: remove"}], "class InvalidCommand(Exception):\n    pass\n\ndef solve(command):\n    try:\n        if command != 'add' and command != 'list':\n            raise InvalidCommand(f'Неизвестная команда: {command}')\n        return 'ok'\n    except InvalidCommand as error:\n        return str(error)\n"),
    ],
    36: [
        _script("Первый объект", "Создайте класс `Task` с `__init__(self, title, priority)`. Создайте объект с `Код`, 1 и выведите его `title`, затем `priority`.", "# Опишите класс Task\n", "Код\n1", "class Task:\n    def __init__(self, title, priority):\n        self.title = title\n        self.priority = priority\n\ntask = Task('Код', 1)\nprint(task.title)\nprint(task.priority)\n"),
        _script("Метод меняет объект", "Добавьте классу `Task` поле `done = False` и метод `mark_done`. После вызова метода выведите `task.done`.", "# Опишите класс и метод\n", "True", "class Task:\n    def __init__(self):\n        self.done = False\n\n    def mark_done(self):\n        self.done = True\n\ntask = Task()\ntask.mark_done()\nprint(task.done)\n"),
    ],
    37: [
        _script("Читаемый print", "Создайте класс `Task` с `title` и методом `__str__`, возвращающим `Задача: <title>`. Напечатайте `Task('README')`.", "# Опишите Task и __str__\n", "Задача: README", "class Task:\n    def __init__(self, title):\n        self.title = title\n\n    def __str__(self):\n        return f'Задача: {self.title}'\n\nprint(Task('README'))\n"),
        _script("Переименование методом", "Создайте класс `Task` с методом `rename(new_title)`. Создайте `Task('Код')`, переименуйте в `Тесты` и выведите title.", "# Опишите Task и rename\n", "Тесты", "class Task:\n    def __init__(self, title):\n        self.title = title\n\n    def rename(self, new_title):\n        self.title = new_title\n\ntask = Task('Код')\ntask.rename('Тесты')\nprint(task.title)\n"),
    ],
    38: [
        _script("Свойство priority", "Создайте класс `Task` с `_priority`, getter и setter `priority`. Setter должен разрешать значения от 1 до 3. Создайте объект с 1, присвойте 3 и выведите priority.", "# Опишите Task с property\n", "3", "class Task:\n    def __init__(self, priority):\n        self._priority = priority\n\n    @property\n    def priority(self):\n        return self._priority\n\n    @priority.setter\n    def priority(self, value):\n        if value < 1 or value > 3:\n            raise ValueError('Неверный приоритет')\n        self._priority = value\n\ntask = Task(1)\ntask.priority = 3\nprint(task.priority)\n"),
        _script("Ошибка в setter", "Используйте класс `Task` с проверяющим setter. Попробуйте присвоить 4 в `try / except ValueError` и выведите строку `Неверный приоритет`.", "# Опишите Task с property и обработайте ValueError\n", "Неверный приоритет", "class Task:\n    def __init__(self, priority):\n        self._priority = priority\n\n    @property\n    def priority(self):\n        return self._priority\n\n    @priority.setter\n    def priority(self, value):\n        if value < 1 or value > 3:\n            raise ValueError('Неверный приоритет')\n        self._priority = value\n\ntask = Task(1)\ntry:\n    task.priority = 4\nexcept ValueError as error:\n    print(error)\n"),
    ],
}



# Обычные программы получают разные значения из скрытых тестов. Это не даёт
# пройти задание фиксированным print и требует использовать алгоритм.
F = FOUNDATIONS_CODE_TASKS

_dynamic_script(
    F[4][0],
    given="Интерпретатор уже создал title, priority и is_done с разными значениями.",
    todo="Не создавайте эти переменные заново. Напечатайте их по очереди: заголовок, приоритет, статус.",
    starter_code="# title, priority и is_done уже готовы\n# Напечатайте три значения\n",
    tests=[
        {"name": "первая задача", "namespace": {"title": "Код", "priority": 1, "is_done": False}, "expected": "Код\n1\nFalse", "assert": "stdout"},
        {"name": "другая задача", "namespace": {"title": "Тесты", "priority": 3, "is_done": True}, "expected": "Тесты\n3\nTrue", "assert": "stdout"},
    ],
    reference_code="print(title)\nprint(priority)\nprint(is_done)\n",
    requirements={"items": ["используйте title, priority и is_done"], "names": ["title", "priority", "is_done"], "calls": ["print"]},
)
_dynamic_script(
    F[4][1],
    given="Интерпретатор уже создал priority и increase.",
    todo="Прибавьте increase к priority, сохраните новое значение в priority и напечатайте его.",
    starter_code="# priority и increase уже готовы\n# Обновите priority\n",
    tests=[
        {"name": "увеличение на два", "namespace": {"priority": 1, "increase": 2}, "expected": "3", "assert": "stdout"},
        {"name": "увеличение на один", "namespace": {"priority": 3, "increase": 1}, "expected": "4", "assert": "stdout"},
    ],
    reference_code="priority = priority + increase\nprint(priority)\n",
    requirements={"items": ["измените priority", "используйте increase"], "names": ["priority", "increase"], "calls": ["print"]},
)
_dynamic_script(
    F[5][0],
    given="raw_hours уже создана как строка с целым числом.",
    todo="Преобразуйте raw_hours через int и выведите количество минут.",
    starter_code="# raw_hours уже готова\n# Преобразуйте часы в минуты\n",
    tests=[
        {"name": "два часа", "namespace": {"raw_hours": "2"}, "expected": "120", "assert": "stdout"},
        {"name": "пять часов", "namespace": {"raw_hours": "5"}, "expected": "300", "assert": "stdout"},
    ],
    reference_code="hours = int(raw_hours)\nprint(hours * 60)\n",
    requirements={"items": ["преобразование int", "переменная raw_hours"], "names": ["raw_hours"], "calls": ["int"]},
)
_dynamic_script(
    F[5][1],
    given="Интерпретатор уже создал два числа: first и second.",
    todo="Выведите их сумму, затем среднее арифметическое. Каждое значение должно быть на новой строке.",
    starter_code="# first и second уже готовы\n# Напечатайте сумму и среднее\n",
    tests=[
        {"name": "десять и пятьдесят", "namespace": {"first": 10, "second": 50}, "expected": "60\n30.0", "assert": "stdout"},
        {"name": "пятнадцать и тридцать", "namespace": {"first": 15, "second": 30}, "expected": "45\n22.5", "assert": "stdout"},
    ],
    reference_code="print(first + second)\nprint((first + second) / 2)\n",
    requirements={"items": ["используйте first и second", "операции + и /"], "names": ["first", "second"]},
)
_dynamic_script(
    F[6][0],
    given="Интерпретатор уже создал title и priority.",
    todo="Через f-строку выведите карточку ровно в формате: Задача: title | приоритет: priority.",
    starter_code="# title и priority уже готовы\n# Соберите строку через f-строку\n",
    tests=[
        {"name": "первая карточка", "namespace": {"title": "Купить хлеб", "priority": 1}, "expected": "Задача: Купить хлеб | приоритет: 1", "assert": "stdout"},
        {"name": "вторая карточка", "namespace": {"title": "Написать тесты", "priority": 3}, "expected": "Задача: Написать тесты | приоритет: 3", "assert": "stdout"},
    ],
    reference_code="print(f'Задача: {title} | приоритет: {priority}')\n",
    requirements={"items": ["f-строка", "переменные title и priority"], "names": ["title", "priority"], "nodes": ["JoinedStr"]},
)
_dynamic_script(
    F[6][1],
    given="raw_title уже создана со случайными пробелами и регистром.",
    todo="Уберите пробелы по краям через strip, приведите текст к нижнему регистру через lower и выведите результат.",
    starter_code="# raw_title уже готова\n# Очистите и нормализуйте строку\n",
    tests=[
        {"name": "пробелы и регистр", "namespace": {"raw_title": "  Сделать README  "}, "expected": "сделать readme", "assert": "stdout"},
        {"name": "другая строка", "namespace": {"raw_title": "  PYTHON  "}, "expected": "python", "assert": "stdout"},
    ],
    reference_code="clean_title = raw_title.strip().lower()\nprint(clean_title)\n",
    requirements={"items": ["методы strip и lower", "переменная raw_title"], "names": ["raw_title"], "attributes": ["strip", "lower"]},
)
_dynamic_script(
    F[7][0],
    given="days_left уже создана как целое число.",
    todo="Выведите True, если до дедлайна осталось не больше трёх дней. Иначе выведите False.",
    starter_code="# days_left уже готова\n# Напечатайте результат сравнения\n",
    tests=[
        {"name": "срочный дедлайн", "namespace": {"days_left": 3}, "expected": "True", "assert": "stdout"},
        {"name": "не срочно", "namespace": {"days_left": 6}, "expected": "False", "assert": "stdout"},
    ],
    reference_code="print(days_left <= 3)\n",
    requirements={"items": ["сравнение с числом 3", "переменная days_left"], "names": ["days_left"]},
)
_dynamic_script(
    F[7][1],
    given="Интерпретатор уже создал is_important и is_today.",
    todo="Сначала выведите is_important or is_today, затем is_important and is_today.",
    starter_code="# is_important и is_today уже готовы\n# Напишите два логических выражения\n",
    tests=[
        {"name": "важная задача", "namespace": {"is_important": True, "is_today": False}, "expected": "True\nFalse", "assert": "stdout"},
        {"name": "сегодняшняя задача", "namespace": {"is_important": False, "is_today": True}, "expected": "True\nFalse", "assert": "stdout"},
    ],
    reference_code="print(is_important or is_today)\nprint(is_important and is_today)\n",
    requirements={"items": ["операторы or и and"], "names": ["is_important", "is_today"], "nodes": ["BoolOp"]},
)
_dynamic_script(
    F[8][0],
    given="priority уже создана и может быть равна 1, 2 или 3.",
    todo="Через if, elif, else выведите: для 1 высокий, для 2 обычный, для 3 низкий.",
    starter_code="# priority уже готова\n# Напишите if / elif / else\n",
    tests=[
        {"name": "высокий", "namespace": {"priority": 1}, "expected": "высокий", "assert": "stdout"},
        {"name": "обычный", "namespace": {"priority": 2}, "expected": "обычный", "assert": "stdout"},
        {"name": "низкий", "namespace": {"priority": 3}, "expected": "низкий", "assert": "stdout"},
    ],
    reference_code="if priority == 1:\n    print('высокий')\nelif priority == 2:\n    print('обычный')\nelse:\n    print('низкий')\n",
    requirements={"items": ["ветвление if / elif / else", "переменная priority"], "names": ["priority"], "nodes": ["If"]},
)
_dynamic_script(
    F[8][1],
    given="is_done уже создана как булево значение.",
    todo="Если is_done истинно, выведите Закрыта. Иначе выведите В работе.",
    starter_code="# is_done уже готова\n# Напишите if / else\n",
    tests=[
        {"name": "готовая задача", "namespace": {"is_done": True}, "expected": "Закрыта", "assert": "stdout"},
        {"name": "открытая задача", "namespace": {"is_done": False}, "expected": "В работе", "assert": "stdout"},
    ],
    reference_code="if is_done:\n    print('Закрыта')\nelse:\n    print('В работе')\n",
    requirements={"items": ["ветвление if / else", "переменная is_done"], "names": ["is_done"], "nodes": ["If"]},
)
_dynamic_script(
    F[9][0],
    given="Интерпретатор уже создал список строк tasks разной длины.",
    todo="Не переопределяйте tasks. Циклом for напечатайте каждый заголовок с новой строки в исходном порядке.",
    starter_code="# tasks уже готов\n# Напишите цикл for\n",
    tests=[
        {"name": "две задачи", "namespace": {"tasks": ["Код", "Тесты"]}, "expected": "Код\nТесты", "assert": "stdout"},
        {"name": "три задачи", "namespace": {"tasks": ["README", "Git", "Релиз"]}, "expected": "README\nGit\nРелиз", "assert": "stdout"},
    ],
    reference_code="for task in tasks:\n    print(task)\n",
    requirements={"items": ["цикл for", "переменная tasks", "вывод через print"], "names": ["tasks"], "nodes": ["For"], "calls": ["print"]},
)
_dynamic_script(
    F[9][1],
    given="Интерпретатор уже создал границы start и stop.",
    todo="Циклом for и range выведите все целые числа от start до stop включительно.",
    starter_code="# start и stop уже готовы\n# Используйте for и range\n",
    tests=[
        {"name": "малый диапазон", "namespace": {"start": 1, "stop": 3}, "expected": "1\n2\n3", "assert": "stdout"},
        {"name": "другой диапазон", "namespace": {"start": 4, "stop": 6}, "expected": "4\n5\n6", "assert": "stdout"},
    ],
    reference_code="for number in range(start, stop + 1):\n    print(number)\n",
    requirements={"items": ["цикл for", "range", "границы start и stop"], "names": ["start", "stop"], "nodes": ["For"], "calls": ["range"]},
)
_dynamic_script(
    F[10][0],
    given="completed и target уже созданы; completed всегда меньше target.",
    todo="Циклом while увеличивайте completed на 1 и печатайте новое значение, пока не достигнете target.",
    starter_code="# completed и target уже готовы\n# Напишите while\n",
    tests=[
        {"name": "от нуля до трёх", "namespace": {"completed": 0, "target": 3}, "expected": "1\n2\n3", "assert": "stdout"},
        {"name": "от двух до пяти", "namespace": {"completed": 2, "target": 5}, "expected": "3\n4\n5", "assert": "stdout"},
    ],
    reference_code="while completed < target:\n    completed += 1\n    print(completed)\n",
    requirements={"items": ["цикл while", "completed и target"], "names": ["completed", "target"], "nodes": ["While"]},
)
_dynamic_script(
    F[10][1],
    given="command создана как пустая строка, exit_command содержит команду выхода.",
    todo="Циклом while меняйте command на exit_command, пока они не совпадут. После цикла выведите command.",
    starter_code="# command и exit_command уже готовы\n# Завершите цикл через exit_command\n",
    tests=[
        {"name": "exit", "namespace": {"command": "", "exit_command": "exit"}, "expected": "exit", "assert": "stdout"},
        {"name": "stop", "namespace": {"command": "", "exit_command": "stop"}, "expected": "stop", "assert": "stdout"},
    ],
    reference_code="while command != exit_command:\n    command = exit_command\nprint(command)\n",
    requirements={"items": ["цикл while", "command и exit_command"], "names": ["command", "exit_command"], "nodes": ["While"]},
)
_dynamic_script(
    F[11][0],
    given="Интерпретатор уже создал список tasks и строку new_task.",
    todo="Добавьте new_task в конец tasks через append. Выведите длину списка после добавления.",
    starter_code="# tasks и new_task уже готовы\n# Добавьте задачу и выведите len(tasks)\n",
    tests=[
        {"name": "два элемента", "namespace": {"tasks": ["Код"], "new_task": "Тесты"}, "expected": "2", "assert": "stdout"},
        {"name": "четыре элемента", "namespace": {"tasks": ["Код", "Git", "README"], "new_task": "Релиз"}, "expected": "4", "assert": "stdout"},
    ],
    reference_code="tasks.append(new_task)\nprint(len(tasks))\n",
    requirements={"items": ["метод append", "переменные tasks и new_task"], "names": ["tasks", "new_task"], "attributes": ["append"]},
)
_dynamic_script(
    F[11][1],
    given="Интерпретатор уже создал список tags, в котором есть повторы.",
    todo="Создайте множество из tags и выведите количество уникальных тегов.",
    starter_code="# tags уже готов\n# Используйте set и len\n",
    tests=[
        {"name": "один повтор", "namespace": {"tags": ["python", "git", "python"]}, "expected": "2", "assert": "stdout"},
        {"name": "несколько повторов", "namespace": {"tags": ["api", "api", "test", "git"]}, "expected": "3", "assert": "stdout"},
    ],
    reference_code="unique_tags = set(tags)\nprint(len(unique_tags))\n",
    requirements={"items": ["set", "len", "переменная tags"], "names": ["tags"], "calls": ["set", "len"]},
)
_dynamic_script(
    F[12][0],
    given="Интерпретатор уже создал словарь task с ключом title.",
    todo="Выведите значение task по ключу title.",
    starter_code="# task уже готов\n# Выведите task['title']\n",
    tests=[
        {"name": "первая задача", "namespace": {"task": {"title": "Код", "done": False}}, "expected": "Код", "assert": "stdout"},
        {"name": "вторая задача", "namespace": {"task": {"title": "README", "done": True}}, "expected": "README", "assert": "stdout"},
    ],
    reference_code="print(task['title'])\n",
    requirements={"items": ["словарь task", "ключ title"], "names": ["task"]},
)
_dynamic_script(
    F[12][1],
    given="Интерпретатор уже создал словарь task и булево значение new_done.",
    todo="Измените task по ключу done на new_done и выведите новый статус.",
    starter_code="# task и new_done уже готовы\n# Обновите task['done']\n",
    tests=[
        {"name": "закрыть задачу", "namespace": {"task": {"title": "Код", "done": False}, "new_done": True}, "expected": "True", "assert": "stdout"},
        {"name": "открыть задачу", "namespace": {"task": {"title": "README", "done": True}, "new_done": False}, "expected": "False", "assert": "stdout"},
    ],
    reference_code="task['done'] = new_done\nprint(task['done'])\n",
    requirements={"items": ["словарь task", "переменная new_done"], "names": ["task", "new_done"]},
)


_dynamic_script(
    F[15][0],
    given="Интерпретатор уже создал строку title в разном регистре.",
    todo="Выведите title в верхнем регистре через upper.",
    starter_code="# title уже готова\n# Напечатайте title.upper()\n",
    tests=[
        {"name": "русский текст", "namespace": {"title": "сделать readme"}, "expected": "СДЕЛАТЬ README", "assert": "stdout"},
        {"name": "латиница", "namespace": {"title": "python"}, "expected": "PYTHON", "assert": "stdout"},
    ],
    reference_code="print(title.upper())\n",
    requirements={"items": ["метод upper", "переменная title"], "names": ["title"], "attributes": ["upper"]},
)
_dynamic_script(
    F[15][1],
    given="raw_priority уже создана как строка с числом.",
    todo="Преобразуйте raw_priority в int и выведите результат сложения с 1.",
    starter_code="# raw_priority уже готова\n# Исправьте тип перед сложением\n",
    tests=[
        {"name": "семь", "namespace": {"raw_priority": "7"}, "expected": "8", "assert": "stdout"},
        {"name": "двенадцать", "namespace": {"raw_priority": "12"}, "expected": "13", "assert": "stdout"},
    ],
    reference_code="print(int(raw_priority) + 1)\n",
    requirements={"items": ["преобразование int", "переменная raw_priority"], "names": ["raw_priority"], "calls": ["int"]},
)
_dynamic_script(
    F[16][0],
    given="Интерпретатор уже создал command: list, add или другую строку.",
    todo="Через if, elif, else выведите: для list Показать задачи, для add Добавить задачу, иначе Неизвестная команда.",
    starter_code="# command уже готова\n# Напишите обработчик команды\n",
    tests=[
        {"name": "список", "namespace": {"command": "list"}, "expected": "Показать задачи", "assert": "stdout"},
        {"name": "добавление", "namespace": {"command": "add"}, "expected": "Добавить задачу", "assert": "stdout"},
        {"name": "неизвестная команда", "namespace": {"command": "remove"}, "expected": "Неизвестная команда", "assert": "stdout"},
    ],
    reference_code="if command == 'list':\n    print('Показать задачи')\nelif command == 'add':\n    print('Добавить задачу')\nelse:\n    print('Неизвестная команда')\n",
    requirements={"items": ["ветвление if / elif / else", "переменная command"], "names": ["command"], "nodes": ["If"]},
)
_dynamic_script(
    F[16][1],
    given="Интерпретатор уже создал title: она может быть пустой, состоять из пробелов или содержать текст.",
    todo="Сначала примените strip. Если после очистки строка пуста, выведите Ошибка: пустой заголовок, иначе Задача добавлена.",
    starter_code="# title уже готова\n# Проверьте title после strip\n",
    tests=[
        {"name": "только пробелы", "namespace": {"title": "   "}, "expected": "Ошибка: пустой заголовок", "assert": "stdout"},
        {"name": "корректный заголовок", "namespace": {"title": "  Код  "}, "expected": "Задача добавлена", "assert": "stdout"},
    ],
    reference_code="if title.strip() == '':\n    print('Ошибка: пустой заголовок')\nelse:\n    print('Задача добавлена')\n",
    requirements={"items": ["метод strip", "ветвление if / else"], "names": ["title"], "nodes": ["If"], "attributes": ["strip"]},
)

D = DEEPER_CODE_TASKS
_dynamic_script(
    D[36][0],
    given="Интерпретатор уже создал task_title и task_priority.",
    todo="Создайте класс Task с __init__(title, priority). Создайте объект из task_title и task_priority, затем выведите title и priority с новой строки.",
    starter_code="# task_title и task_priority уже готовы\n# Опишите класс Task и создайте объект\n",
    tests=[
        {"name": "первая задача", "namespace": {"task_title": "Код", "task_priority": 1}, "expected": "Код\n1", "assert": "stdout"},
        {"name": "вторая задача", "namespace": {"task_title": "Тесты", "task_priority": 3}, "expected": "Тесты\n3", "assert": "stdout"},
    ],
    reference_code="class Task:\n    def __init__(self, title, priority):\n        self.title = title\n        self.priority = priority\n\ntask = Task(task_title, task_priority)\nprint(task.title)\nprint(task.priority)\n",
    requirements={"items": ["класс Task", "метод __init__", "task_title и task_priority"], "names": ["task_title", "task_priority"], "nodes": ["ClassDef"]},
)
_dynamic_script(
    D[36][1],
    given="Интерпретатор уже создал булеву переменную should_complete.",
    todo="Создайте Task с done = False и методом mark_done. Если should_complete истинно, вызовите метод. Выведите task.done.",
    starter_code="# should_complete уже готова\n# Опишите Task, mark_done и условие\n",
    tests=[
        {"name": "не завершать", "namespace": {"should_complete": False}, "expected": "False", "assert": "stdout"},
        {"name": "завершить", "namespace": {"should_complete": True}, "expected": "True", "assert": "stdout"},
    ],
    reference_code="class Task:\n    def __init__(self):\n        self.done = False\n\n    def mark_done(self):\n        self.done = True\n\ntask = Task()\nif should_complete:\n    task.mark_done()\nprint(task.done)\n",
    requirements={"items": ["класс Task", "метод mark_done", "условие if"], "names": ["should_complete"], "nodes": ["ClassDef", "If"]},
)
_dynamic_script(
    D[37][0],
    given="Интерпретатор уже создал строку title.",
    todo="Создайте Task с __init__(title) и __str, который возвращает строку Задача: title. Напечатайте созданный объект.",
    starter_code="# title уже готова\n# Опишите Task с __str__\n",
    tests=[
        {"name": "README", "namespace": {"title": "README"}, "expected": "Задача: README", "assert": "stdout"},
        {"name": "код", "namespace": {"title": "Код"}, "expected": "Задача: Код", "assert": "stdout"},
    ],
    reference_code="class Task:\n    def __init__(self, title):\n        self.title = title\n\n    def __str__(self):\n        return f'Задача: {self.title}'\n\nprint(Task(title))\n",
    requirements={"items": ["класс Task", "метод __str__", "переменная title"], "names": ["title"], "nodes": ["ClassDef"]},
)
_dynamic_script(
    D[37][1],
    given="Интерпретатор уже создал строки first_title и next_title.",
    todo="Создайте Task с методом rename(new_title). Создайте объект из first_title, переименуйте в next_title и выведите task.title.",
    starter_code="# first_title и next_title уже готовы\n# Опишите Task и rename\n",
    tests=[
        {"name": "первое переименование", "namespace": {"first_title": "Код", "next_title": "Тесты"}, "expected": "Тесты", "assert": "stdout"},
        {"name": "второе переименование", "namespace": {"first_title": "README", "next_title": "Релиз"}, "expected": "Релиз", "assert": "stdout"},
    ],
    reference_code="class Task:\n    def __init__(self, title):\n        self.title = title\n\n    def rename(self, new_title):\n        self.title = new_title\n\ntask = Task(first_title)\ntask.rename(next_title)\nprint(task.title)\n",
    requirements={"items": ["класс Task", "метод rename", "first_title и next_title"], "names": ["first_title", "next_title"], "nodes": ["ClassDef"]},
)
_dynamic_script(
    D[38][0],
    given="Интерпретатор уже создал корректные initial_priority и next_priority от 1 до 3.",
    todo="Создайте Task с _priority, property priority и setter. Setter разрешает только 1-3. Создайте объект из initial_priority, присвойте next_priority и выведите priority.",
    starter_code="# initial_priority и next_priority уже готовы\n# Опишите Task с property и setter\n",
    tests=[
        {"name": "из одного в три", "namespace": {"initial_priority": 1, "next_priority": 3}, "expected": "3", "assert": "stdout"},
        {"name": "из трёх в два", "namespace": {"initial_priority": 3, "next_priority": 2}, "expected": "2", "assert": "stdout"},
    ],
    reference_code="class Task:\n    def __init__(self, priority):\n        self._priority = priority\n\n    @property\n    def priority(self):\n        return self._priority\n\n    @priority.setter\n    def priority(self, value):\n        if value < 1 or value > 3:\n            raise ValueError('Неверный приоритет')\n        self._priority = value\n\ntask = Task(initial_priority)\ntask.priority = next_priority\nprint(task.priority)\n",
    requirements={"items": ["класс Task", "property и setter", "проверка границ 1-3"], "names": ["initial_priority", "next_priority", "property"], "nodes": ["ClassDef", "If"]},
)
_dynamic_script(
    D[38][1],
    given="Интерпретатор уже создал initial_priority и некорректный invalid_priority.",
    todo="В Task реализуйте проверяющий setter priority. Попробуйте присвоить invalid_priority в try / except ValueError. После ошибки выведите сохранённый task.priority.",
    starter_code="# initial_priority и invalid_priority уже готовы\n# Опишите Task, обработайте ValueError и выведите priority\n",
    tests=[
        {"name": "слишком большой", "namespace": {"initial_priority": 1, "invalid_priority": 4}, "expected": "1", "assert": "stdout"},
        {"name": "слишком маленький", "namespace": {"initial_priority": 3, "invalid_priority": 0}, "expected": "3", "assert": "stdout"},
    ],
    reference_code="class Task:\n    def __init__(self, priority):\n        self._priority = priority\n\n    @property\n    def priority(self):\n        return self._priority\n\n    @priority.setter\n    def priority(self, value):\n        if value < 1 or value > 3:\n            raise ValueError('Неверный приоритет')\n        self._priority = value\n\ntask = Task(initial_priority)\ntry:\n    task.priority = invalid_priority\nexcept ValueError:\n    pass\nprint(task.priority)\n",
    requirements={"items": ["класс Task", "property и setter", "try / except ValueError"], "names": ["initial_priority", "invalid_priority", "property"], "nodes": ["ClassDef", "Try", "If"]},
)


F[1][0]["contract"] = _contract(
    "В первом уроке данные ещё не передаются: тренируем порядок выполнения строк.",
    "Напишите три команды print в точном порядке из условия.",
    "Сверим весь вывод и порядок строк.",
)
F[1][0]["requirements"] = {"items": ["три команды print в заданном порядке"], "calls": ["print"]}
F[1][1]["contract"] = _contract(
    "В первом уроке данные ещё не передаются: тренируем порядок выполнения строк.",
    "Напишите две команды print в точном порядке из условия.",
    "Сверим весь вывод и порядок строк.",
)
F[1][1]["requirements"] = {"items": ["две команды print в заданном порядке"], "calls": ["print"]}

def get_code_tasks(track_id: str, filename: str) -> list[dict[str, Any]]:
    """Возвращает задачи редактора только для тем, проверяемых без доступа к ОС."""
    match = re.match(r"^(\d{2})\s+-\s+", filename)
    if match is None:
        return []

    lesson_number = int(match.group(1))
    tasks_by_track = {
        FOUNDATIONS_TRACK: FOUNDATIONS_CODE_TASKS,
        DEEPER_TRACK: DEEPER_CODE_TASKS,
    }.get(track_id, {})
    return tasks_by_track.get(lesson_number, [])

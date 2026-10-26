from typing import Any

# Add interpreter/code tasks for each lesson after authoring its concept-based material.
CODE_TASKS: dict[int | str, list[dict[str, Any]]] = {number: [] for number in (11, "11.1", "11.2", 12, "12.1", 13, "13.1", "13.2", 14, "14.1", "14.2", 15, "15.1")}

CODE_TASKS["11.1"] = [
    {
        "title": "Проследим два вызова и сохраним результат",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт числа minutes, first_part, second_part и extra. Определите функцию add_pause(minutes, extra), вызовите её для обеих частей и сохраните результаты под разными внешними именами. Выведите два результата по порядку, затем выведите исходное внешнее minutes.",
        "contract": {
            "given": "Платформа задаёт целые числа minutes, first_part, second_part и extra. Внешнее minutes имеет то же написание, что и параметр функции.",
            "given_items": [
                "first_part и second_part содержат разные значения для двух вызовов.",
                "extra содержит число, которое добавляется к каждому аргументу.",
                "Внешнее minutes нужно вывести после результатов вызовов.",
            ],
            "todo": "Определим add_pause(minutes, extra), вернём сумму параметров и сохраним ответы двух вызовов раздельно.",
            "todo_items": [
                "Вызовем функцию сначала с first_part и extra, затем с second_part и extra.",
                "Сохраним результаты вызовов под именами first_total и second_total.",
                "Выведем first_total, second_total и внешнее minutes в указанном порядке.",
            ],
            "check": "Данные меняются между тестами. Оба результата должны соответствовать своим аргументам, а внешнее minutes должно остаться прежним.",
        },
        "requirements": {
            "items": [
                "Функция add_pause принимает minutes и extra и передаёт их сумму через return.",
                "Два вызова получают first_part и second_part по отдельности.",
                "Оба возвращённых значения сохраняются под разными внешними именами.",
                "После вызовов выводятся оба результата и неизменённое внешнее minutes.",
            ],
            "names": ["add_pause", "minutes", "extra", "first_part", "second_part", "first_total", "second_total"],
            "nodes": ["FunctionDef", "Return", "Assign", "Call"],
            "calls": ["add_pause", "print"],
        },
        "hints": [
            "Внутри add_pause имя minutes обозначает параметр этого вызова. Внешнее имя с таким написанием останется отдельным.",
            "Чтобы передать результат наружу, используем return. Затем присваивание рядом с вызовом сохранит его под внешним именем.",
            "Проверим два результата и только после них выведем исходное minutes.",
        ],
        "starter_code": (
            "# Платформа задаёт minutes, first_part, second_part и extra.\n"
            "# Определите add_pause(minutes, extra).\n"
            "# Вызовите функцию дважды, сохраните ответы и выведите их вместе с minutes.\n"
        ),
        "tests": [
            {
                "name": "Два независимых вызова",
                "namespace": {"minutes": 12, "first_part": 20, "second_part": 35, "extra": 5},
                "expected": "25\n40\n12",
                "assert": "stdout",
            },
            {
                "name": "Изменённые числа",
                "namespace": {"minutes": 30, "first_part": 3, "second_part": 9, "extra": 2},
                "expected": "5\n11\n30",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "def add_pause(minutes, extra):\n"
            "    total = minutes + extra\n"
            "    return total\n"
            "\n"
            "first_total = add_pause(first_part, extra)\n"
            "second_total = add_pause(second_part, extra)\n"
            "print(first_total)\n"
            "print(second_total)\n"
            "print(minutes)\n"
        ),
    },
    {
        "title": "Шаг 1 из 4. Перепривяжем параметр",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт список replace_source и строку replacement_topic. Определите replace_local(items, new_topic), чтобы внутри функции локальное имя items стало обозначать новый список с new_topic. Верните новый список, сохраните ответ вызова в replacement_result и выведите replace_source, затем replacement_result, каждое значение с новой строки.",
        "contract": {
            "given": "Платформа задаёт replace_source, отдельный список строк, и replacement_topic, новую строку.",
            "todo": "Функция replace_local перепривязывает локальный параметр к новому списку и возвращает его вызывающему коду.",
            "check": "При разных данных replace_source остаётся прежним, а replacement_result содержит только replacement_topic.",
        },
        "requirements": {
            "items": [
                "Функция заменяет связь локального items новым списком с replacement_topic.",
                "Внешний код сохраняет возвращённый список в replacement_result.",
                "Сначала печатается replace_source, затем replacement_result, по одному списку на строке.",
            ],
            "names": ["replace_local", "items", "new_topic", "replace_source", "replacement_topic", "replacement_result"],
            "nodes": ["FunctionDef", "Assign", "Return", "Call"],
            "calls": ["replace_local", "print"],
        },
        "hints": [
            "Присваивание новому списку меняет локальную связь items, но не имя replace_source снаружи.",
            "Верните локальное items, затем отдельно сохраните результат вызова.",
            "Сравните два списка выводом: сначала исходный, затем возвращённый.",
        ],
        "starter_code": (
            "# Платформа задаёт replace_source и replacement_topic.\n"
            "# Определите replace_local(items, new_topic), вызовите её и выведите оба списка.\n"
        ),
        "tests": [
            {
                "name": "Исходный список сохраняется",
                "namespace": {
                    "replace_source": ["Роман", "Стих"],
                    "replacement_topic": "Очерк",
                },
                "expected": "['Роман', 'Стих']\n['Очерк']",
                "assert": "stdout",
            },
            {
                "name": "Пустой исходный список",
                "namespace": {"replace_source": [], "replacement_topic": "Очерк"},
                "expected": "[]\n['Очерк']",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "def replace_local(items, new_topic):\n"
            "    items = [new_topic]\n"
            "    return items\n"
            "\n"
            "replacement_result = replace_local(replace_source, replacement_topic)\n"
            "print(replace_source)\n"
            "print(replacement_result)\n"
        ),
    },
    {
        "title": "Шаг 2 из 4. Изменим переданный список",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт список shared_source и строку shared_topic. Определите append_shared(items, new_topic), чтобы функция добавила новую строку в переданный список методом append. Вызовите функцию и выведите изменённый shared_source.",
        "contract": {
            "given": "Платформа задаёт shared_source, список строк, и shared_topic, новую строку.",
            "todo": "Вызов append_shared добавляет shared_topic в переданный список.",
            "check": "Тестовые данные меняются; после вызова shared_source содержит прежние элементы и shared_topic в конце.",
        },
        "requirements": {
            "items": [
                "Функция append_shared изменяет переданный список методом append.",
                "После вызова печатается shared_source, включая добавленную строку.",
            ],
            "names": ["append_shared", "items", "new_topic", "shared_source", "shared_topic"],
            "nodes": ["FunctionDef", "Call"],
            "calls": ["append_shared", "print"],
            "attributes": ["append"],
        },
        "hints": [
            "В этой функции меняется сам объект списка, который уже обозначает shared_source.",
            "Вызовите append_shared с исходным списком и новой строкой, затем выведите исходное имя.",
        ],
        "starter_code": (
            "# Платформа задаёт shared_source и shared_topic.\n"
            "# Определите append_shared(items, new_topic), вызовите её и выведите shared_source.\n"
        ),
        "tests": [
            {
                "name": "Добавляем к двум элементам",
                "namespace": {"shared_source": ["Роман", "Стих"], "shared_topic": "Рассказ"},
                "expected": "['Роман', 'Стих', 'Рассказ']",
                "assert": "stdout",
            },
            {
                "name": "Добавляем в пустой список",
                "namespace": {"shared_source": [], "shared_topic": "Рисунок"},
                "expected": "['Рисунок']",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "def append_shared(items, new_topic):\n"
            "    items.append(new_topic)\n"
            "\n"
            "append_shared(shared_source, shared_topic)\n"
            "print(shared_source)\n"
        ),
    },
    {
        "title": "Шаг 3 из 4. Создадим отдельную копию",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт список copy_source и строку copy_topic. Определите make_variant(items, new_topic), чтобы функция скопировала список, добавила строку в копию и вернула её. Сохраните ответ вызова в copy_result и выведите copy_source, затем copy_result, каждое значение с новой строки.",
        "contract": {
            "given": "Платформа задаёт copy_source, список строк, и copy_topic, новую строку.",
            "todo": "Функция make_variant возвращает отдельную копию с добавленным copy_topic.",
            "check": "На разных входах copy_source сохраняет прежние элементы, а copy_result содержит те же элементы и новую строку в конце.",
        },
        "requirements": {
            "items": [
                "Функция создаёт копию внешнего списка методом copy и добавляет строку в копию методом append.",
                "Функция возвращает копию, а внешний код сохраняет её в copy_result.",
                "Сначала печатается неизменённый copy_source, затем copy_result.",
            ],
            "names": ["make_variant", "items", "new_topic", "variant", "copy_source", "copy_topic", "copy_result"],
            "nodes": ["FunctionDef", "Assign", "Return", "Call"],
            "calls": ["make_variant", "print"],
            "attributes": ["copy", "append"],
        },
        "hints": [
            "Сначала свяжите новое локальное имя с копией items.",
            "Добавьте строку в копию, верните её и сохраните результат вызова отдельно от copy_source.",
        ],
        "starter_code": (
            "# Платформа задаёт copy_source и copy_topic.\n"
            "# Определите make_variant(items, new_topic), вызовите её и выведите оба списка.\n"
        ),
        "tests": [
            {
                "name": "Исходник и копия",
                "namespace": {"copy_source": ["Эскиз", "Краски"], "copy_topic": "Плакат"},
                "expected": "['Эскиз', 'Краски']\n['Эскиз', 'Краски', 'Плакат']",
                "assert": "stdout",
            },
            {
                "name": "Копируем пустой список",
                "namespace": {"copy_source": [], "copy_topic": "Портрет"},
                "expected": "[]\n['Портрет']",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "def make_variant(items, new_topic):\n"
            "    variant = items.copy()\n"
            "    variant.append(new_topic)\n"
            "    return variant\n"
            "\n"
            "copy_result = make_variant(copy_source, copy_topic)\n"
            "print(copy_source)\n"
            "print(copy_result)\n"
        ),
    },
    {
        "title": "Шаг 4 из 4. Сравним результаты",
        "level": "easy",
        "mode": "script",
        "prompt": (
            "Заготовка содержит три функции из предыдущих шагов. Платформа задаёт три независимых списка с одинаковыми начальными элементами и три новые строки. "
            "Вызовите каждую функцию со своим списком и выведите три строки сравнения: пару replace_source и replacement_result, shared_source после изменения, затем пару copy_source и copy_result. "
            "В паре списки печатаются через один пробел. Пример вывода:\n"
            "['Роман', 'Стих'] ['Очерк']\n"
            "['Роман', 'Стих', 'Рассказ']\n"
            "['Роман', 'Стих'] ['Роман', 'Стих', 'Сказка']"
        ),
        "contract": {
            "given": "Заготовка содержит replace_local, append_shared и make_variant. Платформа задаёт отдельные replace_source, shared_source и copy_source с одинаковыми начальными элементами, а также replacement_topic, shared_topic и copy_topic.",
            "todo": "Вызовем каждую функцию на своём списке и выведем три строки, чтобы сопоставить перепривязку, изменение исходного объекта и работу с копией.",
            "todo_items": [
                "Сохраним ответы replace_local и make_variant, а append_shared вызовем для shared_source.",
                "Напечатаем три строки с парами и порядком, указанными в условии.",
            ],
            "check": "Тесты меняют все начальные элементы и новые строки. replace_source и copy_source остаются прежними, shared_source получает новую строку, а copy_result содержит её вместе с прежними элементами.",
        },
        "requirements": {
            "items": [
                "Каждая готовая функция вызывается со своим списком и соответствующей строкой.",
                "Результат перепривязки сохраняется отдельно, а результат копирования не изменяет copy_source.",
                "Три строки выводятся в формате и порядке из условия.",
            ],
            "names": [
                "replace_local",
                "append_shared",
                "make_variant",
                "replace_source",
                "replacement_topic",
                "replacement_result",
                "shared_source",
                "shared_topic",
                "copy_source",
                "copy_topic",
                "copy_result",
            ],
            "nodes": ["FunctionDef", "Assign", "Return", "Call"],
            "calls": ["replace_local", "append_shared", "make_variant", "print"],
            "attributes": ["append", "copy"],
        },
        "hints": [
            "Сохраните возвращаемые списки только для replace_local и make_variant.",
            "Напечатайте пары исходника и результата рядом, а список после append выведите отдельной строкой.",
        ],
        "starter_code": (
            "def replace_local(items, new_topic):\n"
            "    items = [new_topic]\n"
            "    return items\n"
            "\n"
            "def append_shared(items, new_topic):\n"
            "    items.append(new_topic)\n"
            "\n"
            "def make_variant(items, new_topic):\n"
            "    variant = items.copy()\n"
            "    variant.append(new_topic)\n"
            "    return variant\n"
            "\n"
            "# Платформа задаёт три исходных списка и три новые строки.\n"
            "# В парной строке print(first_list, second_list) разделяет списки пробелом.\n"
            "# Вызовите функции и выведите три строки сравнения по условию.\n"
        ),
        "tests": [
            {
                "name": "Сравниваем списки тем",
                "namespace": {
                    "replace_source": ["Роман", "Стих"],
                    "shared_source": ["Роман", "Стих"],
                    "copy_source": ["Роман", "Стих"],
                    "replacement_topic": "Очерк",
                    "shared_topic": "Рассказ",
                    "copy_topic": "Сказка",
                },
                "expected": "['Роман', 'Стих'] ['Очерк']\n['Роман', 'Стих', 'Рассказ']\n['Роман', 'Стих'] ['Роман', 'Стих', 'Сказка']",
                "assert": "stdout",
            },
            {
                "name": "Сравниваем другие значения",
                "namespace": {
                    "replace_source": ["Эскиз", "Краски"],
                    "shared_source": ["Эскиз", "Краски"],
                    "copy_source": ["Эскиз", "Краски"],
                    "replacement_topic": "Плакат",
                    "shared_topic": "Рисунок",
                    "copy_topic": "Портрет",
                },
                "expected": "['Эскиз', 'Краски'] ['Плакат']\n['Эскиз', 'Краски', 'Рисунок']\n['Эскиз', 'Краски'] ['Эскиз', 'Краски', 'Портрет']",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "def replace_local(items, new_topic):\n"
            "    items = [new_topic]\n"
            "    return items\n"
            "\n"
            "def append_shared(items, new_topic):\n"
            "    items.append(new_topic)\n"
            "\n"
            "def make_variant(items, new_topic):\n"
            "    variant = items.copy()\n"
            "    variant.append(new_topic)\n"
            "    return variant\n"
            "\n"
            "replacement_result = replace_local(replace_source, replacement_topic)\n"
            "append_shared(shared_source, shared_topic)\n"
            "copy_result = make_variant(copy_source, copy_topic)\n"
            "print(replace_source, replacement_result)\n"
            "print(shared_source)\n"
            "print(copy_source, copy_result)\n"
        ),
    },
]

CODE_TASKS["11.2"] = [
    {
        "title": "Исправляем ключ в созданной записи",
        "level": "easy",
        "mode": "script",
        "prompt": "В первом вызове запись читается правильно, затем появляется KeyError. Сверим подготовленную трассу с исходником и исправим источник записи, чтобы все три чтения завершились.",
        "contract": {
            "given": "read_points получает готовую запись и две записи от make_points. В каждой должен быть обязательный ключ points.",
            "todo": "Исправим причину KeyError, сохранив чтение готовой записи и два новых значения.",
            "check": "Вывод содержит 4, 8 и 0 по одному числу на строке.",
        },
        "requirements": {"nodes": ["FunctionDef"], "calls": ["print"]},
        "starter_code": (
            "def make_points(value):\n"
            "    return {\"poitns\": value}\n"
            "\n"
            "def read_points(record):\n"
            "    return record[\"points\"]\n"
            "\n"
            "print(read_points({\"points\": 4}))\n"
            "print(read_points(make_points(8)))\n"
            "print(read_points(make_points(0)))\n"
        ),
        "hints": [
            "Сравним имя ключа, которое читает read_points, с именем в записи от make_points.",
            "Строка чтения показывает место проявления. Проверим, где словарь получает свои поля.",
            "После минимальной правки снова запустим все три вызова, включая уже рабочий.",
        ],
        "tests": [
            {
                "name": "Правильная запись и два новых значения",
                "expected": "4\n8\n0",
                "assert": "stdout",
            }
        ],
        "reference_code": (
            "def make_points(value):\n"
            "    return {\"points\": value}\n"
            "\n"
            "def read_points(record):\n"
            "    return record[\"points\"]\n"
            "\n"
            "print(read_points({\"points\": 4}))\n"
            "print(read_points(make_points(8)))\n"
            "print(read_points(make_points(0)))\n"
        ),
    },
    {
        "title": "Восстанавливаем результат функции",
        "level": "easy",
        "mode": "script",
        "prompt": "Программа печатает правильный результат для положительного числа, но останавливается на следующем вызове. Найдём первопричину и исправим только её, не меняя вычисление в show_total.",
        "contract": {
            "given": "show_total добавляет 1 к результату add_bonus. Для значений 4 и 0 ожидаются числа 8 и 4.",
            "todo": "Найдём первопричину остановки и внесём минимальную правку, сохранив оба вычисления.",
            "check": "После запуска появляются 8 и 4 по порядку, без ошибки выполнения.",
        },
        "requirements": {"nodes": ["FunctionDef"], "calls": ["print"]},
        "starter_code": (
            "def add_bonus(value):\n"
            "    if value > 0:\n"
            "        return value + 3\n"
            "    total = value + 3\n"
            "\n"
            "def show_total(value):\n"
            "    updated_total = add_bonus(value)\n"
            "    print(updated_total + 1)\n"
            "\n"
            "show_total(4)\n"
            "show_total(0)\n"
        ),
        "hints": [
            "Сверим, какое значение получает updated_total во втором вызове.",
            "Сравним, что add_bonus вычисляет на каждом пути и что передаёт наружу.",
            "После изменения проверим положительное число и ноль.",
        ],
        "tests": [
            {
                "name": "Оба пути передают число вызывающему коду",
                "expected": "8\n4",
                "assert": "stdout",
            }
        ],
        "reference_code": (
            "def add_bonus(value):\n"
            "    if value > 0:\n"
            "        return value + 3\n"
            "    total = value + 3\n"
            "    return total\n"
            "\n"
            "def show_total(value):\n"
            "    updated_total = add_bonus(value)\n"
            "    print(updated_total + 1)\n"
            "\n"
            "show_total(4)\n"
            "show_total(0)\n"
        ),
    },
    {
        "title": "Считаем только длинные занятия",
        "level": "easy",
        "mode": "script",
        "prompt": "Для каждой длительности от 20 минут нужно посчитать один элемент. Сверим фактический вывод с правилом, найдём причину расхождения и проверим обычный, пустой и безрезультатный случаи.",
        "contract": {
            "given": "Функция перебирает список длительностей и накапливает количество. Подходят значения не меньше 20.",
            "todo": "Изменим проверку одного значения, сохранив цикл, счётчик и четыре вызова.",
            "check": "Результаты по порядку: 2, 0, 2 и 0, включая граничное значение 20.",
        },
        "requirements": {"nodes": ["FunctionDef", "For", "If"], "calls": ["print"]},
        "starter_code": (
            "def count_long_sessions(durations):\n"
            "    count = 0\n"
            "    for minutes in durations:\n"
            "        if minutes > 0:\n"
            "            count = count + 1\n"
            "    return count\n"
            "\n"
            "print(count_long_sessions([8, 22, 0, 31]))\n"
            "print(count_long_sessions([0, 14, 19]))\n"
            "print(count_long_sessions([20, 27]))\n"
            "print(count_long_sessions([]))\n"
        ),
        "hints": [
            "Сформулируем порог словами и проверим каждое значение относительно 20.",
            "Сверим отдельно значение ниже порога и само граничное значение.",
            "Запустим вызов без подходящих значений и пустой список.",
        ],
        "tests": [
            {
                "name": "Обычный, пустой, граничный и безрезультатный случаи",
                "expected": "2\n0\n2\n0",
                "assert": "stdout",
            }
        ],
        "reference_code": (
            "def count_long_sessions(durations):\n"
            "    count = 0\n"
            "    for minutes in durations:\n"
            "        if minutes >= 20:\n"
            "            count = count + 1\n"
            "    return count\n"
            "\n"
            "print(count_long_sessions([8, 22, 0, 31]))\n"
            "print(count_long_sessions([0, 14, 19]))\n"
            "print(count_long_sessions([20, 27]))\n"
            "print(count_long_sessions([]))\n"
        ),
    },
    {'title': 'Самостоятельная диагностика отчёта',
     'level': 'medium',
     'mode': 'script',
     'prompt': 'Отчёт должен показать три строки: число доступных книг, сумму страниц доступных книг и сумму '
               'страниц всех книг. Программа завершается, но на некоторых входах отчёт неверен. Самостоятельно '
               'найдите первопричину, внесите минимальную правку и сохраните смысл обоих действий: отбор по '
               'доступности и сумма переданного набора. До правки запишите ожидание, факт, предположение и '
               'проверку. Например, для доступной книги на 12 страниц и недоступной на 90 нужны строки 1, 12, 102.',
     'contract': {'given': 'books — список записей с pages (неотрицательный int) и available (bool). Исходный '
                           'список не меняется.',
                  'todo': 'Отчёт должен показать три строки: число доступных книг, сумму страниц доступных книг и '
                          'сумму страниц всех книг. Программа завершается, но на некоторых входах отчёт неверен. '
                          'Самостоятельно найдите первопричину, внесите минимальную правку и сохраните смысл обоих '
                          'действий: отбор по доступности и сумма переданного набора. До правки запишите ожидание, '
                          'факт, предположение и проверку. Например, для доступной книги на 12 страниц и '
                          'недоступной на 90 нужны строки 1, 12, 102.',
                  'check': 'Проверяется весь вывод на разных данных, включая граничные случаи. Исходные данные '
                           'заданы платформой.'},
     'requirements': {'nodes': ['FunctionDef', 'For'], 'calls': ['print']},
     'starter_code': 'def available_books(books):\n'
                     '    selected = []\n'
                     '    for book in books:\n'
                     '        if book["available"]:\n'
                     '            selected.append(book)\n'
                     '    return selected\n'
                     '\n'
                     'def total_pages(books):\n'
                     '    total = 0\n'
                     '    for book in books:\n'
                     '        total += book["pages"]\n'
                     '    return total\n'
                     '\n'
                     'selected = available_books(books)\n'
                     'print(len(selected))\n'
                     'print(total_pages(books))\n'
                     'print(total_pages(books))\n',
     'hints': ['Найдите самый ранний результат, который отличается от ожидаемого. Запишите фактические входы '
               'функций, не меняя код наугад.',
               'Сравните, какие записи нужны для каждого показателя и какие реально получает вычисление. Проверьте '
               'также случай, где все книги доступны.',
               'Для второй строки суммируются отобранные книги, для третьей — все. Исправьте соответствующий '
               'аргумент вызова, сохранив общую функцию суммы.'],
     'tests': [{'name': 'Разные наборы',
                'namespace': {'books': [{'pages': 12, 'available': True},
                                        {'pages': 90, 'available': False},
                                        {'pages': 8, 'available': True}]},
                'expected': '2\n20\n110',
                'assert': 'stdout'},
               {'name': 'Нет доступных',
                'namespace': {'books': [{'pages': 7, 'available': False}]},
                'expected': '0\n0\n7',
                'assert': 'stdout'},
               {'name': 'Все доступны',
                'namespace': {'books': [{'pages': 3, 'available': True}, {'pages': 5, 'available': True}]},
                'expected': '2\n8\n8',
                'assert': 'stdout'},
               {'name': 'Пусто', 'namespace': {'books': []}, 'expected': '0\n0\n0', 'assert': 'stdout'},
               {'name': 'Один поздний доступный',
                'namespace': {'books': [{'pages': 0, 'available': False}, {'pages': 14, 'available': True}]},
                'expected': '1\n14\n14',
                'assert': 'stdout'}],
     'reference_code': 'def available_books(books):\n'
                       '    selected = []\n'
                       '    for book in books:\n'
                       '        if book["available"]:\n'
                       '            selected.append(book)\n'
                       '    return selected\n'
                       '\n'
                       'def total_pages(books):\n'
                       '    total = 0\n'
                       '    for book in books:\n'
                       '        total += book["pages"]\n'
                       '    return total\n'
                       '\n'
                       'selected = available_books(books)\n'
                       'print(len(selected))\n'
                       'print(total_pages(selected))\n'
                       'print(total_pages(books))\n'},
]

CODE_TASKS[11] = [
    {
        "title": "Назовём и вызовем повторяемое действие",
        "level": "easy",
        "mode": "script",
        "prompt": "Функция open_plan выводит заданную строку при каждом вызове.",
        "contract": {
            "given": "Отдельный ввод не нужен. Мы работаем с коротким script на платформе.",
            "todo": "Определение функции само не запускает её тело; два вызова выводят сообщение два раза.",
            "todo_items": [
                "Функция open_plan определена без параметров; её тело содержит print(\"Открываем план\").",
                "После определения располагаются два вызова open_plan().",
            ],
            "check": "Проверка сравнит две одинаковые строки в ожидаемом порядке.",
        },
        "requirements": {
            "items": [
                "Определение находится выше обоих вызовов.",
                "Команда print расположена в теле функции.",
            ],
            "names": ["open_plan"],
            "nodes": ["FunctionDef"],
            "calls": ["open_plan", "print"],
        },
        "hints": [
            "Сначала мы записываем def, имя open_plan, пустые скобки и двоеточие.",
            "Далее мы переносим print внутрь тела отступом, а вызовы располагаем ниже определения.",
            "Мы сверяем сообщение в теле и два вызова с двумя одинаковыми строками вывода.",
        ],
        "starter_code": (
            "# Здесь мы задаём open_plan без параметров\n"
            "# В теле появляется сообщение Открываем план\n"
            "# После определения располагаются два вызова\n"
        ),
        "tests": [
            {
                "name": "Два вызова",
                "expected": "Открываем план\nОткрываем план",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "def open_plan():\n"
            "    print(\"Открываем план\")\n"
            "\n"
            "open_plan()\n"
            "open_plan()\n"
        ),
    },
    {
        "title": "Передадим входы и используем ответ",
        "level": "easy",
        "mode": "script",
        "prompt": "Функция minutes_left возвращает оставшееся время, а внешний script показывает его после вызова.",
        "contract": {
            "given": "Платформа задаёт total_minutes и used_minutes. Первое значение означает всё доступное время, второе уже прошедшее.",
            "given_items": [
                "total_minutes не меньше used_minutes.",
                "Значения меняются между проверками.",
            ],
            "todo": "Результат содержит метку и разность total_minutes - used_minutes.",
            "todo_items": [
                "Функция minutes_left объявляет параметры total_minutes и used_minutes в указанном порядке и возвращает total_minutes - used_minutes.",
                "Вызов функции с заданными значениями сохраняется в remaining.",
                "Вывод содержит Осталось: и значение remaining.",
            ],
            "check": "Проверка сравнит результат на двух парах значений, которые дают разные ответы при перестановке.",
        },
        "requirements": {
            "items": [
                "Вычисление возвращается из функции, а не печатается внутри неё.",
                "Внешняя команда использует значение, полученное от вызова.",
            ],
            "names": ["total_minutes", "used_minutes", "remaining"],
            "nodes": ["FunctionDef", "Return"],
            "calls": ["minutes_left", "print"],
        },
        "hints": [
            "Сначала мы сверяем порядок двух входных значений с именами в определении.",
            "Мы вычитаем прошедшее время из общего и возвращаем полученное число.",
            "Затем мы сохраняем ответ вызова в remaining и выводим метку вместе с этим значением.",
        ],
        "starter_code": (
            "# total_minutes и used_minutes заданы платформой\n"
            "# Здесь мы определяем функцию и возвращаем оставшееся время\n"
            "# Внешняя команда сохраняет результат вызова и выводит его\n"
        ),
        "tests": [
            {
                "name": "90 минут, прошло 25",
                "namespace": {"total_minutes": 90, "used_minutes": 25},
                "expected": "Осталось: 65",
                "assert": "stdout",
            },
            {
                "name": "48 минут, прошло 13",
                "namespace": {"total_minutes": 48, "used_minutes": 13},
                "expected": "Осталось: 35",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "def minutes_left(total_minutes, used_minutes):\n"
            "    return total_minutes - used_minutes\n"
            "\n"
            "remaining = minutes_left(total_minutes, used_minutes)\n"
            "print(\"Осталось:\", remaining)\n"
        ),
    },
    {
        "title": "Вернём сумму вызывающему коду",
        "level": "easy",
        "mode": "script",
        "prompt": "Функция double_points передаёт удвоенное значение наружу, а внешний print показывает его один раз.",
        "contract": {
            "given": "Платформа задаёт число value. Функция уже вычисляет его удвоенное значение.",
            "todo": "После исправления answer содержит результат вызова, а вывод состоит из одной строки После вызова: и этого числа.",
            "check": "Проверка обнаружит лишний вывод из тела и значение None вместо ответа.",
        },
        "requirements": {
            "items": [
                "Функция возвращает удвоенное значение.",
                "Внешний код сохраняет результат и печатает его после вызова.",
            ],
            "names": ["value", "answer"],
            "nodes": ["FunctionDef", "Return"],
            "calls": ["double_points", "print"],
        },
        "hints": [
            "Мы сопоставляем вывод на экране и значение, которое должно попасть в answer.",
            "Print внутри функции показывает сумму, но не передаёт её вызывающему коду.",
            "Мы заменяем внутренний вывод передачей вычисленного значения. Внешняя строка уже показывает answer.",
        ],
        "starter_code": (
            "# value задан платформой\n"
            "def double_points(value):\n"
            "    print(value * 2)\n"
            "\n"
            "answer = double_points(value)\n"
            "print(\"После вызова:\", answer)\n"
        ),
        "tests": [
            {
                "name": "Удваиваем 7",
                "namespace": {"value": 7},
                "expected": "После вызова: 14",
                "assert": "stdout",
            },
            {
                "name": "Удваиваем 10",
                "namespace": {"value": 10},
                "expected": "После вызова: 20",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "def double_points(value):\n"
            "    return value * 2\n"
            "\n"
            "answer = double_points(value)\n"
            "print(\"После вызова:\", answer)\n"
        ),
    },
    {
        "title": "Вернём значение в каждой ветви",
        "level": "easy",
        "mode": "script",
        "prompt": "Функция pause_minutes возвращает число для обоих значений is_weekend.",
        "contract": {
            "given": "Платформа задаёт is_weekend как True или False. В готовой функции один путь доходит до конца без возврата.",
            "todo": "Для выходного результат равен 15, для обычного дня равен 8.",
            "check": "Проверка пройдёт по обоим путям и сравнит значение, которое получил внешний код.",
        },
        "requirements": {
            "items": [
                "Каждая ветвь передаёт выбранное число через return.",
                "Результат вызова сохраняется и выводится после завершения функции.",
            ],
            "names": ["is_weekend", "weekday_pause"],
            "nodes": ["FunctionDef", "If", "Return"],
            "calls": ["pause_minutes", "print"],
        },
        "hints": [
            "Мы прослеживаем is_weekend=False и отмечаем, до какой строки доходит эта ветвь.",
            "Число 8 записано как выражение, но ещё не стало ответом функции.",
            "Мы повторяем показанную правку и передаём число из второй ветви тем же способом, что и из первой.",
        ],
        "starter_code": (
            "# is_weekend задан платформой\n"
            "def pause_minutes(is_weekend):\n"
            "    if is_weekend:\n"
            "        return 15\n"
            "    else:\n"
            "        8\n"
            "\n"
            "weekday_pause = pause_minutes(is_weekend)\n"
            "print(weekday_pause)\n"
        ),
        "tests": [
            {
                "name": "Обычный день",
                "namespace": {"is_weekend": False},
                "expected": "8",
                "assert": "stdout",
            },
            {
                "name": "Выходной",
                "namespace": {"is_weekend": True},
                "expected": "15",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "def pause_minutes(is_weekend):\n"
            "    if is_weekend:\n"
            "        return 15\n"
            "    else:\n"
            "        return 8\n"
            "\n"
            "weekday_pause = pause_minutes(is_weekend)\n"
            "print(weekday_pause)\n"
        ),
    },
    {
        "title": "Передадим все обязательные аргументы",
        "level": "easy",
        "mode": "script",
        "prompt": "Вызов total_after_break передаёт оба значения в порядке параметров.",
        "contract": {
            "given": "Платформа задаёт total_minutes и break_minutes. Функция принимает оба значения и печатает сообщение только после начала тела.",
            "todo": "Внешний код передаёт общее и прошедшее время, сохраняет разницу и выводит её после сообщения из тела.",
            "check": "Если аргументов недостаточно, тело не запускается. Проверка сравнит вывод на двух парах значений.",
        },
        "requirements": {
            "items": [
                "Вызов передаёт total_minutes и break_minutes в свои позиции.",
                "После запуска функции внешний код выводит сохранённую разницу.",
            ],
            "names": ["total_minutes", "break_minutes", "remaining"],
            "nodes": ["FunctionDef", "Return"],
            "calls": ["total_after_break", "print"],
        },
        "hints": [
            "Мы сравниваем два параметра в определении с аргументами в вызове.",
            "Сейчас вызов передаёт только total_minutes, хотя функции нужны два значения.",
            "Мы добавляем break_minutes вторым аргументом и сверяем оба теста по сообщению из тела и разнице.",
        ],
        "starter_code": (
            "# total_minutes и break_minutes заданы платформой\n"
            "def total_after_break(total_minutes, break_minutes):\n"
            "    print(\"Тело началось\")\n"
            "    return total_minutes - break_minutes\n"
            "\n"
            "remaining = total_after_break(total_minutes)\n"
            "print(remaining)\n"
        ),
        "tests": [
            {
                "name": "40 минут и 10 минут перерыва",
                "namespace": {"total_minutes": 40, "break_minutes": 10},
                "expected": "Тело началось\n30",
                "assert": "stdout",
            },
            {
                "name": "25 минут и 7 минут перерыва",
                "namespace": {"total_minutes": 25, "break_minutes": 7},
                "expected": "Тело началось\n18",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "def total_after_break(total_minutes, break_minutes):\n"
            "    print(\"Тело началось\")\n"
            "    return total_minutes - break_minutes\n"
            "\n"
            "remaining = total_after_break(total_minutes, break_minutes)\n"
            "print(remaining)\n"
        ),
    },
]

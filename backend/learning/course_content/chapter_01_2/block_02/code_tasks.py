from typing import Any

# Add interpreter/code tasks for each lesson after authoring its concept-based material.
CODE_TASKS: dict[int, list[dict[str, Any]]] = {number: [] for number in range(11, 23)}

CODE_TASKS[12] = [
    {
        "title": "Прочитаем и заменим элемент списка",
        "level": "easy",
        "mode": "script",
        "prompt": "Покажем старое значение, заменим элемент на той же позиции и проверим список.",
        "contract": {
            "given": "Платформа задаёт готовые значения:",
            "given_items": [
                "materials: список строк.",
                "position: индекс существующего элемента, начиная с 0.",
                "replacement: строка для замены.",
            ],
            "todo": "Покажите прежнее значение, замените его и выведите список.",
            "todo_items": [
                "Выведите materials[position].",
                "Запишите replacement в materials[position].",
                "Выведите materials.",
            ],
            "check": "Позиция всегда указывает на существующий элемент. Проверка сравнит старое значение и весь список после замены.",
        },
        "requirements": {
            "items": [
                "Старый элемент читается до замены.",
                "Значение меняется только на указанной позиции.",
                "После замены выводится весь список.",
            ],
            "names": ["materials", "position", "replacement"],
            "nodes": ["Subscript", "Assign"],
            "calls": ["print"],
        },
        "hints": [
            "position внутри квадратных скобок указывает на нужный элемент.",
            "Чтобы заменить его, напишите слева от знака равенства materials[position].",
            "После замены выведите materials и сравните его с исходным списком.",
        ],
        "starter_code": (
            "print(materials[position])\n"
            "# Теперь замените элемент и выведите список\n"
        ),
        "tests": [
            {
                "name": "Замена второго элемента",
                "namespace": {"materials": ["Карта", "Вода"], "position": 1, "replacement": "Термос"},
                "expected": "Вода\n['Карта', 'Термос']",
                "assert": "stdout",
            },
            {
                "name": "Замена первого элемента",
                "namespace": {"materials": ["Плед", "Книга", "Фонарь"], "position": 0, "replacement": "Карта"},
                "expected": "Плед\n['Карта', 'Книга', 'Фонарь']",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "print(materials[position])\n"
            "materials[position] = replacement\n"
            "print(materials)\n"
        ),
    },
    {
        "title": "Добавим одну строку через append",
        "level": "easy",
        "mode": "script",
        "prompt": "Добавим одну строку и посмотрим, как изменился список и что вернул append.",
        "contract": {
            "given": "Платформа задаёт готовые значения:",
            "given_items": [
                "materials: список строк.",
                "new_material: одна строка, которую нужно добавить.",
            ],
            "todo": "Покажите список до и после добавления, затем выведите ответ метода.",
            "todo_items": [
                "Выведите materials до изменения.",
                "Сохраните ответ вызова materials.append(new_material) в method_result.",
                "Выведите изменённый materials, затем method_result.",
            ],
            "check": "Проверка сравнит состояние до и после добавления и отдельно проверит возвращаемое значение `None`.",
        },
        "requirements": {
            "items": [
                "До изменения выводится исходный список.",
                "В конец добавляется одно значение вызовом append.",
                "После вызова отдельно выводятся изменённый список и результат метода.",
            ],
            "names": ["materials", "new_material", "method_result"],
            "nodes": ["Call", "Assign"],
            "calls": ["print"],
            "attributes": ["append"],
        },
        "hints": [
            "Сначала выведите materials, чтобы увидеть список до изменения.",
            "Вызовите materials.append(new_material) и сохраните его ответ в method_result.",
            "После вызова выведите materials и method_result. Ответ append равен None.",
        ],
        "starter_code": (
            "print(materials)\n"
            "# Добавьте строку, которая меняет список, и покажите оба результата\n"
        ),
        "tests": [
            {
                "name": "Добавление к непустому списку",
                "namespace": {"materials": ["Карта", "Вода"], "new_material": "Фонарь"},
                "expected": "['Карта', 'Вода']\n['Карта', 'Вода', 'Фонарь']\nNone",
                "assert": "stdout",
            },
            {
                "name": "Добавление к списку из одного элемента",
                "namespace": {"materials": ["Книга"], "new_material": "Карандаш"},
                "expected": "['Книга']\n['Книга', 'Карандаш']\nNone",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "print(materials)\n"
            "method_result = materials.append(new_material)\n"
            "print(materials)\n"
            "print(method_result)\n"
        ),
    },
    {
        "title": "Удалим элемент через pop и сохраним его",
        "level": "easy",
        "mode": "script",
        "prompt": "Удалим элемент по позиции и покажем его значение и оставшийся список.",
        "contract": {
            "given": "Платформа задаёт готовые значения:",
            "given_items": [
                "materials: непустой список строк.",
                "position: индекс существующего элемента, начиная с 0.",
            ],
            "todo": "Удалите элемент через pop. Покажите удалённое значение и новый список.",
            "todo_items": [
                "Сохраните ответ вызова materials.pop(position) в removed.",
                "Выведите removed.",
                "Выведите materials после удаления.",
            ],
            "check": "Проверка сравнит удалённую строку и порядок оставшихся элементов для разных позиций.",
        },
        "requirements": {
            "items": [
                "Удаление выполняется по заданной позиции методом pop.",
                "Возвращённое значение сохраняется отдельно.",
                "Вывод показывает удалённый элемент и новый список.",
            ],
            "names": ["materials", "position", "removed"],
            "nodes": ["Call", "Assign"],
            "calls": ["print"],
            "attributes": ["pop"],
        },
        "hints": [
            "Вызовите materials.pop(position) и сохраните ответ в removed.",
            "Выведите сначала removed, затем materials.",
            "После удаления список становится короче на один элемент.",
        ],
        "starter_code": (
            "# Удалите элемент, сохраните его и покажите оба результата\n"
        ),
        "tests": [
            {
                "name": "Удаление из середины",
                "namespace": {"materials": ["Карта", "Вода", "Перекус"], "position": 1},
                "expected": "Вода\n['Карта', 'Перекус']",
                "assert": "stdout",
            },
            {
                "name": "Удаление первого элемента",
                "namespace": {"materials": ["Плед", "Книга"], "position": 0},
                "expected": "Плед\n['Книга']",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "removed = materials.pop(position)\n"
            "print(removed)\n"
            "print(materials)\n"
        ),
    },
    {
        "title": "Сравним добавление одного и нескольких элементов",
        "level": "easy",
        "mode": "script",
        "prompt": "Сравним добавление одной строки и добавление нескольких строк.",
        "contract": {
            "given": "Платформа задаёт значения для двух списков:",
            "given_items": [
                "first_material и second_material: первые две строки обоих списков.",
                "one_new_material: одна строка для append.",
                "more_materials: несколько строк для extend.",
            ],
            "todo": "Создайте два одинаковых списка. Добавьте в первый одну строку, во второй несколько, затем выведите оба.",
            "todo_items": [
                "Создайте one_item и several_items с первыми двумя значениями.",
                "Добавьте one_new_material через append, а more_materials через extend.",
                "Выведите one_item и several_items.",
            ],
            "check": "Проверка сравнит отдельное добавление одной строки и добавление нескольких строк по элементам.",
        },
        "requirements": {
            "items": [
                "Оба списка начинаются с одинаковых значений.",
                "append добавляет одну строку, а extend добавляет элементы последовательности.",
                "После операций выводятся оба списка.",
            ],
            "names": ["first_material", "second_material", "one_new_material", "more_materials"],
            "nodes": ["List", "Call"],
            "calls": ["print"],
            "attributes": ["append", "extend"],
        },
        "hints": [
            "Создайте оба списка из first_material и second_material.",
            "Для one_item вызовите append с one_new_material.",
            "Для several_items передайте весь список more_materials в extend.",
        ],
        "starter_code": (
            "one_item = [first_material, second_material]\n"
            "several_items = [first_material, second_material]\n"
            "# Добавьте одно значение и последовательность\n"
            "print(one_item)\n"
            "print(several_items)\n"
        ),
        "tests": [
            {
                "name": "Два новых материала",
                "namespace": {
                    "first_material": "Карта",
                    "second_material": "Вода",
                    "one_new_material": "Фонарь",
                    "more_materials": ["Фонарь", "Перекус"],
                },
                "expected": "['Карта', 'Вода', 'Фонарь']\n['Карта', 'Вода', 'Фонарь', 'Перекус']",
                "assert": "stdout",
            },
            {
                "name": "Другая последовательность",
                "namespace": {
                    "first_material": "Книга",
                    "second_material": "Карандаш",
                    "one_new_material": "Закладка",
                    "more_materials": ["Ластик", "Линейка", "Папка"],
                },
                "expected": "['Книга', 'Карандаш', 'Закладка']\n['Книга', 'Карандаш', 'Ластик', 'Линейка', 'Папка']",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "one_item = [first_material, second_material]\n"
            "several_items = [first_material, second_material]\n"
            "one_item.append(one_new_material)\n"
            "several_items.extend(more_materials)\n"
            "print(one_item)\n"
            "print(several_items)\n"
        ),
    },
    {
        "title": "Проверим позицию до чтения",
        "level": "easy",
        "mode": "script",
        "prompt": "Проверим заданную позицию перед чтением элемента.",
        "contract": {
            "given": "Платформа задаёт список и неотрицательную позицию:",
            "given_items": [
                "materials: список строк, он может быть пустым.",
                "position: неотрицательное целое число. Оно может указывать на элемент или быть равно длине списка.",
            ],
            "todo": "Если элемент по этой позиции есть, выведите его. Иначе выведите сообщение об отсутствии.",
            "todo_items": [
                "Сначала проверьте position < len(materials).",
                "При истинном условии выведите materials[position].",
                "Иначе выведите Нет элемента в этой позиции.",
            ],
            "check": "Проверка охватывает существующую позицию, позицию на границе длины и пустой список.",
        },
        "requirements": {
            "items": [
                "Перед чтением проверяется условие position < len(materials).",
                "Элемент читается только в истинной ветви.",
                "При отсутствии позиции выводится заданное сообщение.",
            ],
            "names": ["materials", "position"],
            "nodes": ["If", "Compare", "Subscript"],
            "calls": ["len", "print"],
        },
        "hints": [
            "len(materials) сообщает количество элементов. Сравните его с position.",
            "Поместите print(materials[position]) внутрь первой ветви if.",
            "Если условие ложно, ветка else должна вывести Нет элемента в этой позиции.",
        ],
        "starter_code": (
            "# Проверьте position до чтения materials[position]\n"
            "# Выведите элемент или сообщение об отсутствии позиции\n"
        ),
        "tests": [
            {
                "name": "Доступная позиция",
                "namespace": {"materials": ["Карта", "Вода"], "position": 1},
                "expected": "Вода",
                "assert": "stdout",
            },
            {
                "name": "Позиция равна длине",
                "namespace": {"materials": ["Карта", "Вода"], "position": 2},
                "expected": "Нет элемента в этой позиции",
                "assert": "stdout",
            },
            {
                "name": "Пустой список",
                "namespace": {"materials": [], "position": 0},
                "expected": "Нет элемента в этой позиции",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "if position < len(materials):\n"
            "    print(materials[position])\n"
            "else:\n"
            "    print(\"Нет элемента в этой позиции\")\n"
        ),
    },
    {
        "title": "Исправим присваивание результата append",
        "level": "easy",
        "mode": "script",
        "prompt": "Исправим строку с append и сохраним список под именем materials.",
        "contract": {
            "given": "Платформа задаёт список и строку для добавления:",
            "given_items": [
                "materials: список строк.",
                "new_material: новая строка.",
                "В заготовке ответ append ошибочно записывается обратно в materials.",
            ],
            "todo": "Исправьте строку так, чтобы materials остался списком, затем выведите его.",
            "todo_items": [
                "Вызовите materials.append(new_material) без присваивания ответа.",
                "Выведите materials.",
            ],
            "check": "Проверка запускает исправленную программу для нескольких начальных списков и новых значений.",
        },
        "requirements": {
            "items": [
                "Вызов append изменяет список без присваивания его результата имени materials.",
                "После вызова materials остаётся списком.",
                "Вывод показывает начальные и добавленные значения в прежнем порядке.",
            ],
            "names": ["materials", "new_material"],
            "nodes": ["Call"],
            "calls": ["print"],
            "attributes": ["append"],
        },
        "hints": [
            "append меняет список, но возвращает None.",
            "Уберите присваивание ответа имени materials.",
            "Вызовите append отдельной строкой, затем выведите materials.",
        ],
        "starter_code": (
            "materials = materials.append(new_material)\n"
            "print(materials)\n"
        ),
        "tests": [
            {
                "name": "Список материалов",
                "namespace": {"materials": ["Карта", "Вода"], "new_material": "Фонарь"},
                "expected": "['Карта', 'Вода', 'Фонарь']",
                "assert": "stdout",
            },
            {
                "name": "Список из одного элемента",
                "namespace": {"materials": ["Книга"], "new_material": "Карандаш"},
                "expected": "['Книга', 'Карандаш']",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "materials.append(new_material)\n"
            "print(materials)\n"
        ),
    },
]

CODE_TASKS[11] = [
    {
        "title": "Выберем один из двух путей",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт has_pass как True или False. Запишем if и else, чтобы для каждого значения вывести нужное сообщение.",
        "contract": {
            "given": "Платформа уже задаёт has_pass как True или False. Вводить это значение не нужно.",
            "todo": "Напишем if и else. Выведем одно сообщение для каждого случая:",
            "todo_items": [
                "Если has_pass равно True, выведем «Можно войти».",
                "Если has_pass равно False, выведем «Сначала проверим условие».",
            ],
            "check": "Оба значения проверяются отдельно.",
        },
        "requirements": {
            "items": [
                "Проверяется готовое имя has_pass.",
                "Для True выводится «Можно войти».",
                "Для False выводится «Сначала проверим условие».",
                "На каждом запуске появляется ровно одно сообщение.",
            ],
            "names": ["has_pass"],
            "nodes": ["If"],
            "calls": ["print"],
        },
        "hints": [
            "Сначала запишем условие с именем has_pass и двоеточием.",
            "Отступом выделим сообщение для истинного случая.",
            "После else добавим сообщение для оставшегося случая.",
        ],
        "starter_code": (
            "if has_pass:\n"
            "    print(\"Замените сообщение для True\")\n"
            "else:\n"
            "    print(\"Замените сообщение для False\")\n"
        ),
        "tests": [
            {"name": "Пропуск есть", "namespace": {"has_pass": True}, "expected": "Можно войти", "assert": "stdout"},
            {"name": "Пропуска нет", "namespace": {"has_pass": False}, "expected": "Сначала проверим условие", "assert": "stdout"},
        ],
        "reference_code": (
            "if has_pass:\n"
            "    print(\"Можно войти\")\n"
            "else:\n"
            "    print(\"Сначала проверим условие\")\n"
        ),
    },
    {
        "title": "Расположим числовые условия по порядку",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт целое число minutes. Исправим порядок проверок и выведем категорию по заданным границам.",
        "contract": {
            "given": "Платформа уже задаёт целое число minutes. Вводить его не нужно.",
            "todo": "Исправим порядок в одной цепочке if, elif, else. Выведем одну подходящую подпись:",
            "todo_items": [
                "Если minutes меньше 10, выведем «Короткий».",
                "Если minutes от 10 до 29 включительно, выведем «Средний».",
                "Если minutes равно 30 или больше, выведем «Длинный».",
            ],
            "check": "Проверяются оба края каждой границы и значения между ними.",
        },
        "requirements": {
            "items": [
                "Используется одна цепочка if, elif, else.",
                "Сначала проверяется minutes >= 30, затем minutes >= 10.",
                "Границы 10 и 30 относятся к следующим категориям.",
            ],
            "names": ["minutes"],
            "nodes": ["If"],
            "calls": ["print"],
        },
        "hints": [
            "Проверка minutes >= 10 перехватила бы и длинные значения, если поставить её первой.",
            "Сначала проверим более строгую границу 30.",
            "После неё значение не меньше 10 относится к средней категории.",
        ],
        "starter_code": (
            "if minutes >= 10:\n"
            "    print(\"Средний или длинный\")\n"
            "elif minutes >= 30:\n"
            "    print(\"Длинный\")\n"
            "else:\n"
            "    print(\"Короткий\")\n"
        ),
        "tests": [
            {"name": "Ниже первой границы", "namespace": {"minutes": 9}, "expected": "Короткий", "assert": "stdout"},
            {"name": "Ровно 10", "namespace": {"minutes": 10}, "expected": "Средний", "assert": "stdout"},
            {"name": "Внутри средней категории", "namespace": {"minutes": 25}, "expected": "Средний", "assert": "stdout"},
            {"name": "Последнее среднее значение", "namespace": {"minutes": 29}, "expected": "Средний", "assert": "stdout"},
            {"name": "Ровно 30", "namespace": {"minutes": 30}, "expected": "Длинный", "assert": "stdout"},
        ],
        "reference_code": (
            "if minutes >= 30:\n"
            "    print(\"Длинный\")\n"
            "elif minutes >= 10:\n"
            "    print(\"Средний\")\n"
            "else:\n"
            "    print(\"Короткий\")\n"
        ),
    },
    {
        "title": "Найдём точный заголовок или его часть",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт строку title. Запишем одну цепочку условий, чтобы отличить точное название от строки с его частью.",
        "contract": {
            "given": "Платформа уже задаёт строку title. Вводить её не нужно. Заглавная P и строчные буквы должны совпасть с написанием Python.",
            "todo": "Напишем одну цепочку if, elif, else и выведем подпись для каждого случая:",
            "todo_items": [
                "Если вся строка равна Python, выведем «Точное название».",
                "Если Python находится внутри более длинной строки, выведем «Содержит Python».",
                "Если точного совпадения и фрагмента нет, выведем «Нет Python».",
            ],
            "check": "Проверяются точное совпадение, дополнительный текст и другой регистр.",
        },
        "requirements": {
            "items": [
                "Полное совпадение проверяется оператором ==.",
                "Более длинный текст проверяется оператором in для строки.",
                "Порядок позволяет сначала распознать точное название.",
                "Проверка учитывает регистр.",
            ],
            "names": ["title"],
            "nodes": ["If"],
            "calls": ["print"],
        },
        "hints": [
            "Сначала спросим, равна ли вся строка слову Python.",
            "Затем найдём это слово внутри более длинной строки.",
            "Оператор in не меняет регистр автоматически.",
        ],
        "starter_code": (
            "if title == \"Python\":\n"
            "    print(\"Точное название\")\n"
            "elif \"Python\" in title:\n"
            "    print(\"Замените сообщение для совпадения\")\n"
            "else:\n"
            "    print(\"Замените сообщение для отсутствия\")\n"
        ),
        "tests": [
            {"name": "Полное совпадение", "namespace": {"title": "Python"}, "expected": "Точное название", "assert": "stdout"},
            {"name": "Дополнительный текст", "namespace": {"title": "Python основы"}, "expected": "Содержит Python", "assert": "stdout"},
            {"name": "Другой регистр", "namespace": {"title": "python основы"}, "expected": "Нет Python", "assert": "stdout"},
        ],
        "reference_code": (
            "if title == \"Python\":\n"
            "    print(\"Точное название\")\n"
            "elif \"Python\" in title:\n"
            "    print(\"Содержит Python\")\n"
            "else:\n"
            "    print(\"Нет Python\")\n"
        ),
    },
    {
        "title": "Напишем ветвление без заготовки",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт целое число points. Самостоятельно запишем if и else: для points не меньше 15 выведем «Результат подходит», иначе выведем «Проверим ещё раз».",
        "contract": {
            "given": "Платформа уже задаёт целое число points. Не изменяйте его и не вводите новое значение.",
            "todo": "Напишите ветвление полностью: добавьте заголовки условий, двоеточия, отступы и команды вывода.",
            "todo_items": [
                "При points >= 15 выведите «Результат подходит».",
                "Во всех остальных случаях выведите «Проверим ещё раз».",
            ],
            "check": "Проверка сравнит значения по обе стороны от 15 и само граничное значение.",
        },
        "requirements": {
            "items": [
                "Целое значение points не переопределяется.",
                "Условие points >= 15 записано в заголовке if.",
                "Команды двух веток имеют правильный отступ.",
                "На каждом запуске печатается ровно одна ожидаемая строка.",
            ],
            "names": ["points"],
            "nodes": ["If", "Compare"],
            "calls": ["print"],
        },
        "hints": [
            "Начните с новой строки и сами запишите if points >= 15:.",
            "Команду для True поставьте на один уровень глубже. Затем добавьте else на уровне if и его команду с отступом.",
            "Сверьте отступы: else стоит на одном уровне с if, а команды внутри обеих веток расположены одинаково глубже.",
        ],
        "starter_code": "# points уже задано платформой\n",
        "tests": [
            {"name": "На границе", "namespace": {"points": 15}, "expected": "Результат подходит", "assert": "stdout"},
            {"name": "Ниже границы", "namespace": {"points": 14}, "expected": "Проверим ещё раз", "assert": "stdout"},
            {"name": "Выше границы", "namespace": {"points": 27}, "expected": "Результат подходит", "assert": "stdout"},
        ],
        "reference_code": (
            "if points >= 15:\n"
            "    print(\"Результат подходит\")\n"
            "else:\n"
            "    print(\"Проверим ещё раз\")\n"
        ),
    },
]

CODE_TASKS[18] = [
    {
        "title": "Пройдём по значениям списка",
        "level": "easy",
        "mode": "script",
        "prompt": "В списке хранятся названия. Напечатайте каждое название по очереди, в том числе повторы.",
        "contract": {
            "given": "Платформа задаёт список `values`. Он может быть пустым, с одним названием или с несколькими.",
            "todo": "Напишите цикл, который получает названия по одному. Внутри цикла напечатайте текущее название. В заготовке `pass` ничего не делает и временно занимает место тела. Замените его своей командой.",
            "check": "Проверка подставит пустой список, один элемент и список с повтором.",
        },
        "requirements": {
            "items": [
                "Цикл for проходит по исходному списку напрямую.",
                "Каждое значение выводится внутри тела цикла.",
                "Повторяющиеся значения обрабатываются в своих проходах.",
            ],
            "names": ["values"],
            "nodes": ["For"],
            "calls": ["print"],
        },
        "hints": [
            "После for выберите имя для одного текущего названия, затем укажите список после in.",
            "Команду print поставьте с отступом, чтобы она выполнилась для каждого названия.",
            "Удалите pass и замените его командой, которая печатает текущее значение.",
        ],
        "starter_code": (
            "for value in values:\n"
            "    # Выведите текущее значение\n"
            "    pass\n"
        ),
        "tests": [
            {"name": "Три значения и повтор", "namespace": {"values": ["Лес", "Парк", "Лес"]}, "expected": "Лес\nПарк\nЛес", "assert": "stdout"},
            {"name": "Один элемент", "namespace": {"values": ["Берег"]}, "expected": "Берег", "assert": "stdout"},
            {"name": "Пустой список", "namespace": {"values": []}, "expected": "", "assert": "stdout"},
        ],
        "reference_code": (
            "for value in values:\n"
            "    print(value)\n"
        ),
    },
    {
        "title": "Выполним заданное число шагов",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт число шагов. Напечатайте номера шагов, начиная с нуля.",
        "contract": {
            "given": "Платформа задаёт `step_count`: сколько шагов нужно выполнить. Это число может быть 0, 1 или больше.",
            "todo": "Цикл уже записан. Внутри него напечатайте текущий номер шага.",
            "check": "Проверка подставит 0, 1 и несколько шагов. При 0 тело цикла не запускается.",
        },
        "requirements": {
            "items": [
                "Цикл использует range(step_count).",
            "Номер текущего шага выводится внутри тела цикла.",
                "Граница step_count не включается в последовательность.",
            ],
            "names": ["step_count"],
            "nodes": ["For"],
            "calls": ["range", "print"],
        },
        "hints": [
            "range(step_count) даёт числа, начиная с 0.",
            "Последнее число меньше step_count. Само step_count не входит в последовательность.",
            "При нуле шагов список чисел пуст, и тело не выполняется.",
        ],
        "starter_code": (
            "for step in range(step_count):\n"
            "    # Выведите номер текущего шага\n"
            "    pass\n"
        ),
        "tests": [
            {"name": "Три шага", "namespace": {"step_count": 3}, "expected": "0\n1\n2", "assert": "stdout"},
            {"name": "Один шаг", "namespace": {"step_count": 1}, "expected": "0", "assert": "stdout"},
            {"name": "Нет шагов", "namespace": {"step_count": 0}, "expected": "", "assert": "stdout"},
        ],
        "reference_code": (
            "for step in range(step_count):\n"
            "    print(step)\n"
        ),
    },
    {
        "title": "Прочитаем значения по позициям",
        "level": "easy",
        "mode": "script",
        "prompt": "Для каждого числа выведите его место в списке и само число.",
        "contract": {
            "given": "Платформа задаёт список чисел `values`. Он может быть пустым или содержать несколько чисел.",
            "todo": "Цикл уже записан. Для каждого `position` напечатайте позицию и число, которое лежит в `values[position]`.",
            "check": "Проверка подставит пустой список, повторы и разные числа. Позиции начинаются с 0.",
        },
        "requirements": {
            "items": [
                "Числа позиций создаются через range(len(values)).",
                "Значение читается из списка по текущей позиции.",
                "Позиция и значение выводятся на каждом проходе.",
            ],
            "names": ["values", "position"],
            "nodes": ["For"],
            "calls": ["range", "len", "print"],
        },
        "hints": [
            "len(values) сообщает, сколько чисел в списке.",
            "range создаёт позиции от 0 до последней позиции. Число элементов в диапазон не входит.",
            "Напечатайте position и значение values[position]. Это разные вещи: место и число на нём.",
        ],
        "starter_code": (
            "for position in range(len(values)):\n"
            "    # Выведите позицию и значение на ней\n"
            "    pass\n"
        ),
        "tests": [
            {"name": "Три элемента", "namespace": {"values": [10, 30, 50]}, "expected": "0 10\n1 30\n2 50", "assert": "stdout"},
            {"name": "Повторяющиеся значения", "namespace": {"values": [7, 7]}, "expected": "0 7\n1 7", "assert": "stdout"},
            {"name": "Пустой список", "namespace": {"values": []}, "expected": "", "assert": "stdout"},
        ],
        "reference_code": (
            "for position in range(len(values)):\n"
            "    print(position, values[position])\n"
        ),
    },
    {
        "title": "Выберем прямой проход или позиции",
        "level": "easy",
        "mode": "script",
        "prompt": "Нужно показать каждое число вместе с его местом. Выберите подходящий вид цикла и напишите заголовок и тело целиком.",
        "contract": {
            "given": "Платформа задаёт список чисел `values`. В нём может не быть чисел, а значения могут повторяться.",
            "todo": "Решите, достаточно ли прямого прохода или нужно получить позиции. Напишите цикл целиком и выведите позицию вместе с числом на ней.",
            "check": "Проверка подставит пустой список, повторяющиеся числа и список с разными числами.",
        },
        "requirements": {
            "items": [
                "Самостоятельно написан заголовок цикла for.",
                "Для получения позиции используется длина списка.",
                "На каждой строке выводятся позиция и значение на ней.",
            ],
            "names": ["values", "position"],
            "nodes": ["For"],
            "calls": ["range", "len", "print"],
        },
        "hints": [
            "Спросите себя: нужно вывести только число или ещё и место, где оно находится? Здесь нужны оба.",
            "Прямой проход даёт сами значения. Чтобы получить места, используйте другой источник чисел.",
            "После получения position прочитайте число по этой позиции и выведите их вместе.",
        ],
        "starter_code": "# Напишите заголовок цикла for и его тело\n",
        "tests": [
            {"name": "Три разных числа", "namespace": {"values": [10, 30, 50]}, "expected": "0 10\n1 30\n2 50", "assert": "stdout"},
            {"name": "Одинаковые числа стоят на разных местах", "namespace": {"values": [7, 7]}, "expected": "0 7\n1 7", "assert": "stdout"},
            {"name": "Пустой список", "namespace": {"values": []}, "expected": "", "assert": "stdout"},
        ],
        "reference_code": (
            "for position in range(len(values)):\n"
            "    print(position, values[position])\n"
        ),
    },
    {
        "title": "Выведем пары ключ и значение",
        "level": "easy",
        "mode": "script",
        "prompt": "У записи есть поля и значения. Выведите каждое имя поля рядом с его значением.",
        "contract": {
            "given": "Платформа задаёт словарь `route_info`. В нём может быть одно поле или несколько.",
            "todo": "Заголовок цикла уже дан. На каждом проходе напечатайте имя поля `key` и его значение `value`.",
            "check": "Проверка подставит записи с разным числом полей.",
        },
        "requirements": {
            "items": [
                "Источник цикла создаётся через route_info.items().",
                "Каждая пара распаковывается в ключ и значение.",
                "Ключ и соответствующее значение выводятся вместе.",
            ],
            "names": ["route_info", "key", "value"],
            "nodes": ["For"],
            "calls": ["print"],
            "attributes": ["items"],
        },
        "hints": [
            "Здесь нужны и имена полей, и значения. Поэтому цикл использует items().",
            "Каждая пара состоит из двух частей: сначала key, затем value.",
            "Поставьте print с отступом, чтобы напечатать каждую пару.",
        ],
        "starter_code": (
            "for key, value in route_info.items():\n"
            "    # Выведите ключ и его значение\n"
            "    pass\n"
        ),
        "tests": [
            {"name": "Два поля", "namespace": {"route_info": {"title": "Лес", "minutes": 12}}, "expected": "title Лес\nminutes 12", "assert": "stdout"},
            {"name": "Одно поле", "namespace": {"route_info": {"visited": True}}, "expected": "visited True", "assert": "stdout"},
        ],
        "reference_code": (
            "for key, value in route_info.items():\n"
            "    print(key, value)\n"
        ),
    },
    {
        "title": "Пройдём по списку записей",
        "level": "easy",
        "mode": "script",
        "prompt": "В списке лежат записи о маршрутах. Напечатайте название каждой записи по очереди.",
        "contract": {
            "given": "Платформа задаёт список `routes`. В каждой записи есть текстовое поле `title`. Список может быть пустым.",
            "todo": "Цикл уже записан. Для текущей записи `route` напечатайте значение поля `title`.",
            "check": "Проверка подставит пустой список, одну запись и несколько записей.",
        },
        "requirements": {
            "items": [
                "Цикл получает по одной записи из routes.",
                "Поле title читается у текущего словаря.",
                "Название выводится для каждой записи.",
            ],
            "names": ["routes", "route"],
            "nodes": ["For"],
            "calls": ["print"],
        },
        "hints": [
            "На каждом проходе route получает одну целую запись.",
            "Поле title читается как route[\"title\"].",
            "Поставьте чтение и print с отступом внутри цикла.",
        ],
        "starter_code": (
            "for route in routes:\n"
            "    # Выведите название текущей записи\n"
            "    pass\n"
        ),
        "tests": [
            {"name": "Две записи", "namespace": {"routes": [{"title": "Лес"}, {"title": "Берег"}]}, "expected": "Лес\nБерег", "assert": "stdout"},
            {"name": "Одна запись", "namespace": {"routes": [{"title": "Парк"}]}, "expected": "Парк", "assert": "stdout"},
            {"name": "Нет записей", "namespace": {"routes": []}, "expected": "", "assert": "stdout"},
        ],
        "reference_code": (
            "for route in routes:\n"
            "    print(route[\"title\"])\n"
        ),
    },
]

CODE_TASKS[17] = [
    {
        "title": "Прочитаем поле выбранной записи",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт список записей и допустимую позицию. Получим выбранный словарь в отдельное имя и выведем его поле title.",
        "contract": {
            "given": "Платформа задаёт список `records` и позицию выбранной записи.",
            "given_items": [
                "В списке два словаря. В каждом есть поля `code` и `title`.",
                "`selected_position` равен 0 или 1.",
            ],
            "todo": "Найдём выбранный словарь и выведем его название.",
            "todo_items": [
                "Сохраним `records[selected_position]` в переменную `selected_record`.",
                "Выведем значение `selected_record[\"title\"]`.",
            ],
            "check": "Проверка выберет обе позиции и сравнит вывод с соответствующим полем. Значение code не используется как позиция.",
        },
        "requirements": {"names": ["records", "selected_position", "selected_record"], "nodes": ["Subscript"], "calls": ["print"]},
        "hints": [
            "Сначала выберем словарь по позиции и сохраним его в отдельное имя.",
            "Затем прочитаем у этого имени поле через строковый ключ title.",
            "Позиция выбирает элемент списка, а значение поля code само по себе позицию не задаёт.",
        ],
        "starter_code": "# records и selected_position уже заданы\n# Получите запись и выведите её поле title\n",
        "tests": [
            {"name": "Первая запись", "namespace": {"records": [{"code": "R8", "title": "Лесная тропа"}, {"code": "A2", "title": "Маршрут у озера"}], "selected_position": 0}, "expected": "Лесная тропа", "assert": "stdout"},
            {"name": "Вторая запись", "namespace": {"records": [{"code": "R8", "title": "Лесная тропа"}, {"code": "A2", "title": "Маршрут у озера"}], "selected_position": 1}, "expected": "Маршрут у озера", "assert": "stdout"},
        ],
        "reference_code": "selected_record = records[selected_position]\nprint(selected_record[\"title\"])\n",
    },
    {
        "title": "Изменим выбранную запись без копии",
        "level": "easy",
        "mode": "script",
        "prompt": "Получим выбранный словарь по позиции, заменим его поле title и выведем новое поле вместе с полем соседа.",
        "contract": {
            "given": "Платформа задаёт две записи и новое название.",
            "given_items": [
                "В каждой записи есть поля `code` и `title`.",
                "`selected_position` и `neighbor_position` равны 0 или 1, но указывают на разные записи.",
                "`new_title` содержит текст для выбранной записи.",
            ],
            "todo": "Заменим название выбранной записи без копирования и проверим соседа.",
            "todo_items": [
                "Сохраним словарь из `records[selected_position]` в `selected_record`.",
                "Запишем `new_title` в поле `selected_record[\"title\"]`, не вызывая `copy()`.",
                "Выведем новое поле выбранной записи, затем поле записи-соседа.",
            ],
            "check": "Тесты выбирают разные позиции и названия. Изменяется только title выбранной записи, сосед остаётся прежним.",
        },
        "requirements": {"names": ["records", "selected_position", "neighbor_position", "selected_record", "new_title"], "nodes": ["Subscript"], "calls": ["print"]},
        "hints": [
            "Сохраните словарь из выбранной позиции в selected_record.",
            "Замените поле title у selected_record, не создавая копию.",
            "Прочитайте оба результата через исходный список.",
        ],
        "starter_code": "selected_record = records[selected_position]\n# Измените title выбранной записи\nprint(records[selected_position][\"title\"])\nprint(records[neighbor_position][\"title\"])\n",
        "tests": [
            {"name": "Изменена первая запись", "namespace": {"records": [{"code": "X3", "title": "Северный берег"}, {"code": "M7", "title": "Сад у реки"}], "selected_position": 0, "neighbor_position": 1, "new_title": "Тропа на холме"}, "expected": "Тропа на холме\nСад у реки", "assert": "stdout"},
            {"name": "Изменена вторая запись", "namespace": {"records": [{"code": "X3", "title": "Северный берег"}, {"code": "M7", "title": "Сад у реки"}], "selected_position": 1, "neighbor_position": 0, "new_title": "Площадь у музея"}, "expected": "Площадь у музея\nСеверный берег", "assert": "stdout"},
        ],
        "reference_code": "selected_record = records[selected_position]\nselected_record[\"title\"] = new_title\nprint(records[selected_position][\"title\"])\nprint(records[neighbor_position][\"title\"])\n",
    },
    {
        "title": "Проверим общие записи после копии списка",
        "level": "easy",
        "mode": "script",
        "prompt": "Создадим поверхностную копию списка, изменим поле вложенной записи через копию и сравним оба списка.",
        "contract": {
            "given": "Платформа задаёт список записей, позицию и новое название.",
            "given_items": [
                "`records` содержит два словаря с полями `code` и `title`.",
                "`selected_position` равен 0 или 1.",
                "`new_title` содержит текст для выбранной записи.",
            ],
            "todo": "Скопируем список и проверим, что его словарь на выбранной позиции общий.",
            "todo_items": [
                "Создадим `records_copy` вызовом `records.copy()`.",
                "Через `records_copy[selected_position]` заменим значение поля `title` на `new_title`.",
                "Выведем поле выбранной записи через оба списка.",
                "Выведем проверки `records is records_copy` и `records[selected_position] is records_copy[selected_position]`.",
            ],
            "check": "Для обеих позиций после изменения оба списка показывают новое название; идентичность даёт False для списков и True для словарей.",
        },
        "requirements": {"names": ["records", "records_copy", "selected_position", "new_title"], "attributes": ["copy"], "nodes": ["Subscript"], "calls": ["print"]},
        "hints": [
            "Сначала вызовите copy у внешнего списка и сохраните результат.",
            "В копии на выбранной позиции пока находится тот же словарь. Замените его title.",
            "Проверьте is отдельно для двух списков и для словарей на выбранной позиции.",
        ],
        "starter_code": "records_copy = records.copy()\n# Измените title словаря на выбранной позиции в копии\nprint(records[selected_position][\"title\"])\nprint(records_copy[selected_position][\"title\"])\nprint(records is records_copy)\nprint(records[selected_position] is records_copy[selected_position])\n",
        "tests": [
            {"name": "Общий словарь на первой позиции", "namespace": {"records": [{"code": "C1", "title": "Парк у школы"}, {"code": "C2", "title": "Мост через ручей"}], "selected_position": 0, "new_title": "Сквер у библиотеки"}, "expected": "Сквер у библиотеки\nСквер у библиотеки\nFalse\nTrue", "assert": "stdout"},
            {"name": "Общий словарь на второй позиции", "namespace": {"records": [{"code": "C1", "title": "Парк у школы"}, {"code": "C2", "title": "Мост через ручей"}], "selected_position": 1, "new_title": "Тропа вдоль канала"}, "expected": "Тропа вдоль канала\nТропа вдоль канала\nFalse\nTrue", "assert": "stdout"},
        ],
        "reference_code": "records_copy = records.copy()\nrecords_copy[selected_position][\"title\"] = new_title\nprint(records[selected_position][\"title\"])\nprint(records_copy[selected_position][\"title\"])\nprint(records is records_copy)\nprint(records[selected_position] is records_copy[selected_position])\n",
    },
    {
        "title": "Поместим отдельную запись во второй список",
        "level": "easy",
        "mode": "script",
        "prompt": "Скопируем внешний список и выбранный плоский словарь. Поместим копию словаря в ту же позицию второго списка, изменим её title и проверим исходную запись и соседа.",
        "contract": {
            "given": "Платформа задаёт две записи, выбранную позицию, позицию соседа и новое название.",
            "given_items": [
                "В каждой записи есть поля `code` и `title`.",
                "`selected_position` и `neighbor_position` равны 0 или 1, но указывают на разные записи.",
                "`new_title` содержит текст для отдельной копии записи.",
            ],
            "todo": "Создадим отдельную копию выбранного словаря и заменим ею запись во втором списке.",
            "todo_items": [
                "Создадим `records_copy` методом `records.copy()`.",
                "Сохраним выбранный словарь в `selected_record` и создадим `record_copy` методом `copy()`.",
                "Выполним `records_copy[selected_position] = record_copy`, чтобы поместить её на эту позицию.",
                "Изменим поле `record_copy[\"title\"]` на `new_title`.",
                "Выведем исходное поле, поле копии, проверку `is` для записей и поле соседа.",
            ],
            "check": "Проверяются обе позиции, разные новые названия, исходная запись и неизменность соседа.",
        },
        "requirements": {"names": ["records", "records_copy", "selected_position", "neighbor_position", "selected_record", "record_copy", "new_title"], "attributes": ["copy"], "nodes": ["Subscript"], "calls": ["print"]},
        "hints": [
            "Создайте records_copy отдельно от records.",
            "Получите selected_record по выбранной позиции и вызовите copy у словаря.",
            "Присвойте record_copy элементу records_copy[selected_position], затем измените его title.",
            "Сравните исходное поле, новое поле, идентичность записей и запись-соседа.",
        ],
        "starter_code": "records_copy = records.copy()\nselected_record = records[selected_position]\nrecord_copy = selected_record.copy()\n# Поместите record_copy в нужную позицию второго списка\n# Измените title отдельной записи\nprint(records[selected_position][\"title\"])\nprint(records_copy[selected_position][\"title\"])\nprint(records[selected_position] is records_copy[selected_position])\nprint(records_copy[neighbor_position][\"title\"])\n",
        "tests": [
            {"name": "Копия первой записи", "namespace": {"records": [{"code": "P5", "title": "Сосновая аллея"}, {"code": "P8", "title": "Площадка у ручья"}], "selected_position": 0, "neighbor_position": 1, "new_title": "Берёзовая роща"}, "expected": "Сосновая аллея\nБерёзовая роща\nFalse\nПлощадка у ручья", "assert": "stdout"},
            {"name": "Копия второй записи", "namespace": {"records": [{"code": "P5", "title": "Сосновая аллея"}, {"code": "P8", "title": "Площадка у ручья"}], "selected_position": 1, "neighbor_position": 0, "new_title": "Площадь у вокзала"}, "expected": "Площадка у ручья\nПлощадь у вокзала\nFalse\nСосновая аллея", "assert": "stdout"},
        ],
        "reference_code": "records_copy = records.copy()\nselected_record = records[selected_position]\nrecord_copy = selected_record.copy()\nrecords_copy[selected_position] = record_copy\nrecord_copy[\"title\"] = new_title\nprint(records[selected_position][\"title\"])\nprint(records_copy[selected_position][\"title\"])\nprint(records[selected_position] is records_copy[selected_position])\nprint(records_copy[neighbor_position][\"title\"])\n",
    },
]

CODE_TASKS[19] = [
    {
        "title": "Сложим длительность маршрутов",
        "level": "easy",
        "mode": "script",
        "prompt": "Складываем длительности маршрутов.",
        "contract": {
            "given": "В `route_minutes` уже лежит список длительностей маршрутов в минутах. Список может быть пустым.",
            "todo": "Цикл `for` складывает минуты в `total_minutes`, а после цикла программа выводит сумму одной строкой.",
            "check": "Автопроверка сверяет вывод для нескольких маршрутов, нулевого значения и пустого списка.",
        },
        "requirements": {
            "items": [
                "Начальное состояние суммы задано до цикла.",
                "Каждое значение добавляется к прежнему итогу.",
                "После прохода выводится общий итог.",
            ],
            "names": ["route_minutes", "total_minutes"],
            "nodes": ["For"],
            "calls": ["print"],
        },
        "hints": [
            "Сначала вспомним начальное состояние: `total_minutes` равно нулю до цикла.",
            "На каждом проходе прибавим минуты текущего маршрута к уже сохранённой сумме.",
            "Оставим `print` после цикла. Если список пуст, сумма останется равна нулю.",
        ],
        "starter_code": (
            "total_minutes = 0\n"
            "for minutes in route_minutes:\n"
            "    # Прибавим текущие минуты к прежней сумме\n"
            "    pass\n"
            "print(total_minutes)\n"
        ),
        "tests": [
            {"name": "Два участка", "namespace": {"route_minutes": [12, 5]}, "expected": "17", "assert": "stdout"},
            {"name": "Один участок", "namespace": {"route_minutes": [9]}, "expected": "9", "assert": "stdout"},
            {"name": "Нулевое и положительное значение", "namespace": {"route_minutes": [0, 7]}, "expected": "7", "assert": "stdout"},
            {"name": "Пустой список", "namespace": {"route_minutes": []}, "expected": "0", "assert": "stdout"},
        ],
        "reference_code": (
            "total_minutes = 0\n"
            "for minutes in route_minutes:\n"
            "    total_minutes += minutes\n"
            "print(total_minutes)\n"
        ),
    },
    {
        "title": "Посчитаем названия маршрутов",
        "level": "easy",
        "mode": "script",
        "prompt": "Считаем названия в списке, не складывая сами слова.",
        "contract": {
            "given": "В `route_names` уже лежит список названий. Список может быть пустым.",
            "todo": "Цикл `for` увеличивает `route_count` на один для каждого названия. После цикла программа выводит это количество одной строкой.",
            "check": "Автопроверка сверяет число названий в пустом, одноэлементном и заполненном списках.",
        },
        "requirements": {
            "items": [
                "Счётчик начинается с нуля до прохода.",
                "На каждом проходе счётчик увеличивается на единицу.",
                "Итог выводится после прохода.",
            ],
            "names": ["route_names", "route_count"],
            "nodes": ["For"],
            "calls": ["print"],
        },
        "hints": [
            "Текст названий не складывается. На каждом проходе считаем одно название.",
            "Начнём с `route_count = 0` до цикла. На каждом проходе добавим к счёту ещё одну единицу.",
            "Если список пуст, тело цикла не запустится и счётчик останется равен нулю.",
        ],
        "starter_code": (
            "route_count = 0\n"
            "for route_name in route_names:\n"
            "    # Увеличим счётчик на один\n"
            "    pass\n"
            "print(route_count)\n"
        ),
        "tests": [
            {"name": "Три названия", "namespace": {"route_names": ["Лес", "Берег", "Парк"]}, "expected": "3", "assert": "stdout"},
            {"name": "Одно название", "namespace": {"route_names": ["Сад"]}, "expected": "1", "assert": "stdout"},
            {"name": "Нет записей", "namespace": {"route_names": []}, "expected": "0", "assert": "stdout"},
        ],
        "reference_code": (
            "route_count = 0\n"
            "for route_name in route_names:\n"
            "    route_count += 1\n"
            "print(route_count)\n"
        ),
    },
    {
        "title": "Посчитаем завершённые маршруты",
        "level": "easy",
        "mode": "script",
        "prompt": "Считаем маршруты, у которых поле `completed` равно `True`.",
        "contract": {
            "given": "Платформа заранее передаёт список `routes`. Список может быть пустым.",
            "given_items": [
                "В каждой записи есть поле `completed`: `True`, если маршрут завершён, и `False`, если ещё нет.",
            ],
            "todo": "Цикл `for` проходит по маршрутам, а условие `if` учитывает только завершённые. `completed_count` хранит их число, и программа выводит его одной строкой.",
            "check": "Автопроверка сверяет вывод, когда завершённых маршрутов нет, есть один или есть несколько.",
            "check_items": [
                "Отдельно проверяется пустой список маршрутов.",
            ],
        },
        "requirements": {
            "items": [
                "Цикл проходит по каждой записи.",
                "Значение счётчика меняется только для завершённого маршрута.",
                "Вывод показывает количество подходящих записей.",
            ],
            "names": ["routes", "completed_count"],
            "nodes": ["For", "If"],
            "calls": ["print"],
        },
        "hints": [
            "Начнём с `completed_count = 0` до цикла. Переменная `route` обозначает текущую запись.",
            "Через `if` проверим `route[\"completed\"]`. Счётчик увеличится, только если там `True`.",
            "После цикла программа выводит счётчик. Если завершённых маршрутов нет, он равен нулю.",
        ],
        "starter_code": (
            "completed_count = 0\n"
            "for route in routes:\n"
            "    # Проверим, завершён ли текущий маршрут\n"
            "    pass\n"
            "print(completed_count)\n"
        ),
        "tests": [
            {"name": "Ни один маршрут не завершён", "namespace": {"routes": [{"completed": False}, {"completed": False}]}, "expected": "0", "assert": "stdout"},
            {"name": "Один маршрут завершён", "namespace": {"routes": [{"completed": True}, {"completed": False}]}, "expected": "1", "assert": "stdout"},
            {"name": "Завершены два маршрута", "namespace": {"routes": [{"completed": True}, {"completed": True}, {"completed": False}]}, "expected": "2", "assert": "stdout"},
            {"name": "Маршрутов нет", "namespace": {"routes": []}, "expected": "0", "assert": "stdout"},
        ],
        "reference_code": (
            "completed_count = 0\n"
            "for route in routes:\n"
            "    if route[\"completed\"]:\n"
            "        completed_count += 1\n"
            "print(completed_count)\n"
        ),
    },
    {
        "title": "Получим три итога за один проход",
        "level": "easy",
        "mode": "script",
        "prompt": "Получаем три независимых итога по одному списку маршрутов.",
        "contract": {
            "given": "Платформа заранее передаёт список `routes`. Список может быть пустым.",
            "given_items": [
                "Поле `minutes` хранит длительность маршрута в минутах.",
                "Поле `completed` равно `True` для завершённого маршрута и `False` для незавершённого.",
            ],
            "todo": "Один цикл `for` проходит маршруты и формирует три результата:",
            "todo_items": [
                "`total_minutes` хранит сумму минут всех маршрутов.",
                "`route_count` хранит число всех маршрутов.",
                "Условие `if` увеличивает `completed_count` только для завершённого маршрута. Программа выводит эти три числа по одному в строке: сумма, все маршруты, завершённые маршруты.",
            ],
            "check": "Автопроверка сверяет все три строки на заполненном и пустом списках.",
        },
        "requirements": {
            "items": [
                "Сумма и оба счётчика начинаются с нуля до цикла.",
                "Общая сумма и количество обновляются для каждой записи.",
                "Условный счётчик обновляется только для завершённого маршрута.",
                "Три значения выводятся в установленном порядке.",
            ],
            "names": ["routes", "total_minutes", "route_count", "completed_count"],
            "nodes": ["For", "If"],
            "calls": ["print"],
        },
        "hints": [
            "Сначала заведём три переменные: для минут, всех маршрутов и завершённых.",
            "В каждом проходе добавим минуты и увеличим число всех маршрутов на один.",
            "Отдельный `if` увеличивает число завершённых маршрутов только при `completed == True`.",
        ],
        "starter_code": (
            "total_minutes = 0\n"
            "route_count = 0\n"
            "completed_count = 0\n"
            "for route in routes:\n"
            "    # Здесь обновим сумму и число всех маршрутов\n"
            "    # Отдельно посчитаем завершённые маршруты\n"
            "    pass\n"
            "print(total_minutes)\n"
            "print(route_count)\n"
            "print(completed_count)\n"
        ),
        "tests": [
            {
                "name": "Два маршрута, один завершён",
                "namespace": {"routes": [{"minutes": 12, "completed": False}, {"minutes": 8, "completed": True}]},
                "expected": "20\n2\n1",
                "assert": "stdout",
            },
            {
                "name": "Маршрут с нулевой длительностью тоже считается",
                "namespace": {"routes": [{"minutes": 0, "completed": True}]},
                "expected": "0\n1\n1",
                "assert": "stdout",
            },
            {"name": "Пустой список", "namespace": {"routes": []}, "expected": "0\n0\n0", "assert": "stdout"},
        ],
        "reference_code": (
            "total_minutes = 0\n"
            "route_count = 0\n"
            "completed_count = 0\n"
            "for route in routes:\n"
            "    total_minutes += route[\"minutes\"]\n"
            "    route_count += 1\n"
            "    if route[\"completed\"]:\n"
            "        completed_count += 1\n"
            "print(total_minutes)\n"
            "print(route_count)\n"
            "print(completed_count)\n"
        ),
    },
    {
        "title": "Найдём максимум, в том числе среди отрицательных чисел",
        "level": "easy",
        "mode": "script",
        "prompt": "Находим самое большое число, даже если все числа отрицательные.",
        "contract": {
            "given": "Платформа заранее передаёт список чисел `measurements`.",
            "given_items": [
                "Чисел может не быть вовсе.",
                "Числа могут быть отрицательными и расположены в любом порядке.",
            ],
            "todo": "Цикл `for` находит и выводит наибольшее число. Если список пуст, в `best` остаётся `None`.",
            "todo_items": [
                "Если `best` равен `None`, условие `if` сохраняет первое число как кандидата.",
                "`elif` заменяет кандидата, только если следующее число больше.",
                "Программа выводит `best` после цикла.",
            ],
            "check": "Автопроверка сверяет положительные и отрицательные числа, разный порядок и пустой список.",
        },
        "requirements": {
            "items": [
                "До цикла отсутствие кандидата записано как None.",
                "Первое число становится кандидатом без сравнения с None.",
                "Следующее число заменяет кандидата только при большем значении.",
                "После цикла выводится кандидат или None.",
            ],
            "names": ["measurements", "best"],
            "nodes": ["For", "If"],
            "calls": ["print"],
        },
        "hints": [
            "Сначала проверим, есть ли уже число в `best`. `None` означает, что кандидата пока нет.",
            "Первое число станет кандидатом. Для следующих чисел сравним его с новым значением через `elif`.",
            "Не будем начинать с нуля: все числа могут быть меньше него. В пустом списке `best` останется равен `None`.",
        ],
        "starter_code": (
            "best = None\n"
            "for value in measurements:\n"
            "    # Сначала обработаем отсутствие кандидата\n"
            "    # Затем сравним числа, если кандидат уже есть\n"
            "    pass\n"
            "print(best)\n"
        ),
        "tests": [
            {"name": "Неупорядоченные положительные значения", "namespace": {"measurements": [4, 9, 6]}, "expected": "9", "assert": "stdout"},
            {"name": "Все значения отрицательные", "namespace": {"measurements": [-8, -3, -6]}, "expected": "-3", "assert": "stdout"},
            {"name": "Единственное значение", "namespace": {"measurements": [-4]}, "expected": "-4", "assert": "stdout"},
            {"name": "Пустой список", "namespace": {"measurements": []}, "expected": "None", "assert": "stdout"},
        ],
        "reference_code": (
            "best = None\n"
            "for value in measurements:\n"
            "    if best is None:\n"
            "        best = value\n"
            "    elif value > best:\n"
            "        best = value\n"
            "print(best)\n"
        ),
    },
    {
        "title": "Исправим состояние суммы",
        "level": "easy",
        "mode": "script",
        "prompt": "Исправляем строку, которая стирает прежнюю сумму.",
        "contract": {
            "given": "Платформа заранее передаёт список чисел `measurements`, возможно пустой. В стартовом коде сумма начинается с нуля, но строка внутри цикла заменяет её текущим числом.",
            "todo": "В цикле `for` программа сохраняет сумму всех чисел, а после цикла выводит её одной строкой.",
            "check": "Автопроверка сверяет сумму для нескольких последовательностей и пустого списка.",
        },
        "requirements": {
            "items": [
                "Цикл проходит по каждому значению.",
                "Итог продолжает прежнее состояние, добавляя текущее число.",
                "Общий результат выводится после цикла.",
            ],
            "names": ["measurements", "total"],
            "nodes": ["For"],
            "calls": ["print"],
        },
        "hints": [
            "Сравним строку внутри цикла с правилом суммы: новый итог использует прежнюю сумму.",
            "Начальное значение и итоговый `print` уже стоят на своих местах.",
            "На двух списках проверим, что прежние значения не теряются. Для пустого списка тело не запускается.",
        ],
        "starter_code": (
            "total = 0\n"
            "for value in measurements:\n"
            "    total = value\n"
            "print(total)\n"
        ),
        "tests": [
            {"name": "Несколько значений", "namespace": {"measurements": [3, 8, 2]}, "expected": "13", "assert": "stdout"},
            {"name": "Другая последовательность", "namespace": {"measurements": [5, 2]}, "expected": "7", "assert": "stdout"},
            {"name": "Пустой список", "namespace": {"measurements": []}, "expected": "0", "assert": "stdout"},
        ],
        "reference_code": (
            "total = 0\n"
            "for value in measurements:\n"
            "    total += value\n"
            "print(total)\n"
        ),
    },
]

CODE_TASKS[20] = [
    {
        "title": "Пропустим значение и остановим проход",
        "level": "easy",
        "mode": "script",
        "prompt": "Пройдём список измерений по порядку: ноль пропустим, на числе 8 или больше остановимся, остальные числа выведем. После цикла напечатаем одну строку о завершении.",
        "contract": {
            "given": "Платформа передаст список `stops`. Пройдём его числа по порядку.",
            "given_items": [
                "Ноль означает пустое измерение.",
                "Число 8 или больше отмечает границу: на нём цикл остановится.",
            ],
            "todo": "Обработаем каждое число по очереди.",
            "todo_items": [
                "Ноль пропустим и перейдём к следующему числу.",
                "На числе 8 или больше остановим цикл. Это число и следующие не выведем.",
                "Каждое ненулевое число меньше 8 выведем отдельной строкой.",
                "После цикла один раз выведем `Проверили все доступные значения`.",
            ],
            "check": "Проверка использует ноль, значение на границе, элементы после границы и пустой список.",
        },
        "requirements": {
            "items": [
                "Цикл проверяет значения по порядку.",
                "continue пропускает только ноль и переводит for к следующему элементу.",
                "break завершает цикл при значении 8 или больше.",
                "Строка после цикла выводится ровно один раз.",
            ],
            "names": ["stops"],
            "nodes": ["For", "If", "Continue", "Break"],
            "calls": ["print"],
        },
        "hints": [
            "В начале цикла проверим, равен ли `stop` нулю. Если да, `continue` сразу перейдёт к следующему числу.",
            "Следом сравним `stop` с 8. Если число достигло границы, `break` закончит цикл.",
            "Общую фразу поставим после цикла. Тогда она появится и после `break`, и при пустом списке.",
        ],
        "starter_code": (
            "for stop in stops:\n"
            "    # Пропустите нулевое измерение\n"
            "    # Остановите цикл на границе\n"
            "    print(stop)\n"
            "print(\"Проверили все доступные значения\")\n"
        ),
        "tests": [
            {
                "name": "Ноль и значение на границе",
                "namespace": {"stops": [3, 0, 5, 8, 2]},
                "expected": "3\n5\nПроверили все доступные значения",
                "assert": "stdout",
            },
            {
                "name": "До границы дошли не сразу",
                "namespace": {"stops": [0, 2, 7]},
                "expected": "2\n7\nПроверили все доступные значения",
                "assert": "stdout",
            },
            {
                "name": "Граница встретилась первой",
                "namespace": {"stops": [9, 4]},
                "expected": "Проверили все доступные значения",
                "assert": "stdout",
            },
            {
                "name": "Нет значений",
                "namespace": {"stops": []},
                "expected": "Проверили все доступные значения",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "for stop in stops:\n"
            "    if stop == 0:\n"
            "        continue\n"
            "    if stop >= 8:\n"
            "        break\n"
            "    print(stop)\n"
            "print(\"Проверили все доступные значения\")\n"
        ),
    },
    {
        "title": "Найдём первую запись по коду",
        "level": "easy",
        "mode": "script",
        "prompt": "Найдём первую запись с нужным кодом. Если совпадения нет, выведем `Запись не найдена`; иначе выведем её название.",
        "contract": {
            "given": "Платформа передаст список записей `entries` и код для поиска `wanted_code`.",
            "given_items": [
                "В каждой записи есть код `code` и название `title`.",
                "Нужного кода может не быть. Он также может встретиться несколько раз.",
            ],
            "todo": "Будем искать записи по порядку.",
            "todo_items": [
                "До цикла зададим `found_entry = None`: пока запись не найдена.",
                "При первом совпадении сохраним всю запись и остановим цикл.",
                "Если запись не найдена, выведем `Запись не найдена`.",
                "Иначе выведем её название из поля `title`.",
            ],
            "check": "Проверка включает пустой список, отсутствующий код и несколько записей с одинаковым кодом.",
        },
        "requirements": {
            "items": [
                "Поиск начинается со значения None.",
                "Совпадение проверяется по ключу code текущей записи.",
                "При первом совпадении сохраняется исходный словарь и завершается ближайший цикл.",
                "Перед чтением title проверяется, остался ли результат равен None.",
            ],
            "names": ["entries", "wanted_code", "found_entry"],
            "nodes": ["For", "If", "Break", "Is"],
            "calls": ["print"],
        },
        "hints": [
            "До цикла запишем в `found_entry` значение `None`. Оно будет означать, что совпадения пока нет.",
            "В цикле сравним `entry[\"code\"]` с `wanted_code`. При совпадении сохраним весь словарь и выполним `break`.",
            "После цикла проверим, остался ли `found_entry` равен `None`. Только если запись найдена, прочитаем её `title`.",
        ],
        "starter_code": (
            "found_entry = None\n"
            "for entry in entries:\n"
            "    # Сравните код текущей записи с wanted_code\n"
            "    pass\n"
            "\n"
            "if found_entry is None:\n"
            "    print(\"Запись не найдена\")\n"
            "else:\n"
            "    print(found_entry[\"title\"])\n"
        ),
        "tests": [
            {
                "name": "Код отсутствует",
                "namespace": {
                    "entries": [{"code": "N1", "title": "Северный зал"}],
                    "wanted_code": "X9",
                },
                "expected": "Запись не найдена",
                "assert": "stdout",
            },
            {
                "name": "Одно совпадение",
                "namespace": {
                    "entries": [
                        {"code": "N1", "title": "Северный зал"},
                        {"code": "S2", "title": "Южный зал"},
                    ],
                    "wanted_code": "S2",
                },
                "expected": "Южный зал",
                "assert": "stdout",
            },
            {
                "name": "Повторяющийся код",
                "namespace": {
                    "entries": [
                        {"code": "A2", "title": "Первая площадка"},
                        {"code": "B4", "title": "Другая площадка"},
                        {"code": "A2", "title": "Поздняя площадка"},
                    ],
                    "wanted_code": "A2",
                },
                "expected": "Первая площадка",
                "assert": "stdout",
            },
            {
                "name": "Пустой список",
                "namespace": {"entries": [], "wanted_code": "N1"},
                "expected": "Запись не найдена",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "found_entry = None\n"
            "for entry in entries:\n"
            "    if entry[\"code\"] == wanted_code:\n"
            "        found_entry = entry\n"
            "        break\n"
            "if found_entry is None:\n"
            "    print(\"Запись не найдена\")\n"
            "else:\n"
            "    print(found_entry[\"title\"])\n"
        ),
    },
    {
        "title": "Соберём все активные записи",
        "level": "easy",
        "mode": "script",
        "prompt": "Соберём все записи с отметкой `is_active` и выведем их названия по порядку. В конце выведем и исходные отметки, чтобы проверить, что они не изменились.",
        "contract": {
            "given": "Платформа передаст список записей `records`.",
            "given_items": [
                "У каждой записи есть название `title` и отметка `is_active`.",
                "`True` означает, что запись активна; `False` означает, что она не активна.",
            ],
            "todo": "Соберём подходящие записи в новый список `active_records`.",
            "todo_items": [
                "До цикла создадим пустой `active_records`.",
                "Добавим в него каждую запись с `is_active == True`, сохраняя порядок исходного списка.",
                "Выведем количество и названия найденных записей.",
                "Затем выведем отметки исходных записей, чтобы проверить, что мы их не изменили.",
            ],
            "check": "Проверка сравнивает пустой результат, несколько совпадений и сохранность исходного порядка и отметок.",
        },
        "requirements": {
            "items": [
                "Список результата создаётся до обхода.",
                "Каждая запись с истинной отметкой добавляется в новый список.",
                "Обход продолжается после совпадения и сохраняет исходный порядок.",
                "После отбора исходные отметки читаются без изменения.",
            ],
            "names": ["records", "active_records"],
            "nodes": ["For", "If"],
            "calls": ["print", "len"],
            "attributes": ["append"],
        },
        "hints": [
            "Создадим пустой `active_records` до цикла, чтобы собирать в нём результаты.",
            "Внутри цикла проверим `record[\"is_active\"]`. Если там `True`, добавим запись через `append`.",
            "Нужно проверить весь список, поэтому не будем останавливать цикл после первой находки. После него выведем результат и исходные отметки.",
        ],
        "starter_code": (
            "active_records = []\n"
            "for record in records:\n"
            "    # Добавьте каждую запись с отметкой is_active\n"
            "    pass\n"
            "print(len(active_records))\n"
            "for record in active_records:\n"
            "    print(record[\"title\"])\n"
            "print(\"Исходные отметки:\")\n"
            "for record in records:\n"
            "    print(record[\"title\"], record[\"is_active\"])\n"
        ),
        "tests": [
            {
                "name": "Две подходящие записи",
                "namespace": {
                    "records": [
                        {"code": "N1", "title": "Северный зал", "is_active": True},
                        {"code": "S2", "title": "Южный зал", "is_active": False},
                        {"code": "P3", "title": "Летний двор", "is_active": True},
                    ]
                },
                "expected": "2\nСеверный зал\nЛетний двор\nИсходные отметки:\nСеверный зал True\nЮжный зал False\nЛетний двор True",
                "assert": "stdout",
            },
            {
                "name": "Нет активных записей",
                "namespace": {
                    "records": [
                        {"code": "N1", "title": "Северный зал", "is_active": False},
                        {"code": "S2", "title": "Южный зал", "is_active": False},
                    ]
                },
                "expected": "0\nИсходные отметки:\nСеверный зал False\nЮжный зал False",
                "assert": "stdout",
            },
            {
                "name": "Одна подходящая запись",
                "namespace": {
                    "records": [
                        {"code": "P3", "title": "Летний двор", "is_active": True},
                    ]
                },
                "expected": "1\nЛетний двор\nИсходные отметки:\nЛетний двор True",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "active_records = []\n"
            "for record in records:\n"
            "    if record[\"is_active\"]:\n"
            "        active_records.append(record)\n"
            "print(len(active_records))\n"
            "for record in active_records:\n"
            "    print(record[\"title\"])\n"
            "print(\"Исходные отметки:\")\n"
            "for record in records:\n"
            "    print(record[\"title\"], record[\"is_active\"])\n"
        ),
    },
    {
        "title": "Найдём все названия, где есть запрос",
        "level": "easy",
        "mode": "script",
        "prompt": "Уберём пробелы до и после запроса. Найдём все названия, где встречается этот текст, даже если заглавные и строчные буквы отличаются. Пустой запрос даст ноль совпадений.",
        "contract": {
            "given": "Платформа передаст список записей `entries` и текст для поиска `raw_query`.",
            "given_items": [
                "В каждой записи есть название `title`.",
                "В запросе и названиях могут быть пробелы по краям и заглавные буквы.",
            ],
            "todo": "Найдём все названия, в которых встречается запрос.",
            "todo_items": [
                "Уберём пробелы по краям и запишем запрос в нижнем регистре в `query`.",
                "Создадим пустой список `matches`. Если `query` пустой, оставим список пустым.",
                "Иначе проверим каждую запись и добавим все совпадения по порядку.",
                "Выведем количество совпадений и названия в том виде, как они записаны в исходном списке.",
            ],
            "check": "Проверка использует пробелы по краям, разный регистр, пустой запрос и отсутствие совпадений. Исходные названия сохраняют свой регистр.",
        },
        "requirements": {
            "items": [
                "Запрос очищается методом strip и сравнивается в нижнем регистре.",
                "Пустой запрос не запускает поиск и оставляет пустой список.",
                "Проверяются все записи, а continue пропускает только неподходящую запись.",
                "Совпадения сохраняют порядок, а исходные названия не переписываются.",
            ],
            "names": ["entries", "raw_query", "query", "matches"],
            "nodes": ["For", "If", "Continue"],
            "calls": ["print", "len"],
            "attributes": ["strip", "lower", "append"],
        },
        "hints": [
            "Для `query` соединим две операции: `raw_query.strip().lower()`. Они уберут крайние пробелы и приведут буквы к нижнему регистру.",
            "До цикла проверим, что `query` не пустой. Иначе пустой текст подошёл бы к каждому названию.",
            "Сравним `query` с `entry[\"title\"].lower()`. Если текст не найден, перейдём к следующей записи; если найден, добавим запись в `matches`.",
        ],
        "starter_code": (
            "query = raw_query\n"
            "matches = []\n"
            "if query != \"\":\n"
            "    for entry in entries:\n"
            "        if query not in entry[\"title\"].lower():\n"
            "            # Перейдите к следующей записи\n"
            "            pass\n"
            "        # Добавьте все совпавшие записи\n"
            "        pass\n"
            "print(len(matches))\n"
            "for entry in matches:\n"
            "    print(entry[\"title\"])\n"
        ),
        "tests": [
            {
                "name": "Крайние пробелы и другой регистр",
                "namespace": {
                    "entries": [
                        {"code": "S1", "title": "Летний спорт"},
                        {"code": "R2", "title": "Рисование"},
                        {"code": "S3", "title": "Спорт для всех"},
                    ],
                    "raw_query": "  СПОРТ ",
                },
                "expected": "2\nЛетний спорт\nСпорт для всех",
                "assert": "stdout",
            },
            {
                "name": "Пустой запрос",
                "namespace": {
                    "entries": [
                        {"code": "S1", "title": "Летний спорт"},
                        {"code": "R2", "title": "Рисование"},
                    ],
                    "raw_query": "   ",
                },
                "expected": "0",
                "assert": "stdout",
            },
            {
                "name": "Нет совпадений",
                "namespace": {
                    "entries": [
                        {"code": "S1", "title": "Летний спорт"},
                        {"code": "R2", "title": "Рисование"},
                    ],
                    "raw_query": "горы",
                },
                "expected": "0",
                "assert": "stdout",
            },
            {
                "name": "Одно совпадение и сохранение регистра",
                "namespace": {
                    "entries": [
                        {"code": "S1", "title": "Летний спорт"},
                        {"code": "R2", "title": "Лесная тропа"},
                    ],
                    "raw_query": "  лЕс  ",
                },
                "expected": "1\nЛесная тропа",
                "assert": "stdout",
            },
            {
                "name": "Полностью пустая строка",
                "namespace": {
                    "entries": [
                        {"code": "S1", "title": "Летний спорт"},
                        {"code": "R2", "title": "Рисование"},
                    ],
                    "raw_query": "",
                },
                "expected": "0",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "query = raw_query.strip().lower()\n"
            "matches = []\n"
            "if query != \"\":\n"
            "    for entry in entries:\n"
            "        if query not in entry[\"title\"].lower():\n"
            "            continue\n"
            "        matches.append(entry)\n"
            "print(len(matches))\n"
            "for entry in matches:\n"
            "    print(entry[\"title\"])\n"
        ),
    },
]

CODE_TASKS[22] = [
    {
        "title": "Найдём и отметим одну запись",
        "level": "easy",
        "mode": "script",
        "prompt": "Найдём запись по её коду, отметим её завершённой и проверим весь список.",
        "contract": {
            "given": "Перед запуском платформа задаёт данные. Вводить значения не нужно.",
            "given_items": [
                "records содержит записи с полями code, title, minutes и is_done. Код каждой записи уникален.",
                "target_code равен коду одной записи или коду, которого нет в списке.",
            ],
            "todo": "Найдём запись по target_code и изменим только её состояние.",
            "todo_items": [
                "Найдём запись с совпавшим code и прекратим поиск.",
                "Если запись найдена, зададим её полю is_done значение True. Если кода нет, список останется без изменений.",
                "Напечатаем весь список records одной командой print(records).",
            ],
            "check": "Проверка сравнит весь список для найденного кода, уже завершённой записи и отсутствующего кода.",
        },
        "requirements": {
            "items": [
                "До прохода найденная запись обозначена значением None.",
                "Поиск сравнивает code каждой записи с target_code и прекращается после совпадения.",
                "Поле is_done читается или меняется только после проверки, что запись найдена.",
                "В конце печатается records, чтобы увидеть сохранность соседних данных.",
            ],
            "names": ["records", "target_code", "record", "found"],
            "nodes": ["For", "If", "Break", "IsNot"],
            "calls": ["print"],
            "attributes": [],
        },
        "hints": [
            "До цикла запишем found = None. Это означает, что нужная запись пока не найдена.",
            "Сравним code каждой записи с target_code. При совпадении сохраним запись в found и остановим поиск.",
            "После цикла сначала проверим found, затем при необходимости изменим поле. В конце покажем records.",
        ],
        "starter_code": (
            "# records и target_code подготовлены платформой\n"
            "found = None\n"
            "for record in records:\n"
            "    # Если code совпал, сохраним запись и прекратим поиск\n"
            "    pass\n"
            "\n"
            "# Только после проверки found можно читать его поля\n"
            "if found is not None:\n"
            "    # Отметим найденную запись завершённой\n"
            "    pass\n"
            "\n"
            "print(records)\n"
        ),
        "tests": [
            {
                "name": "Найдена открытая запись",
                "namespace": {
                    "records": [
                        {"code": "M-1", "title": "Заметки", "minutes": 20, "is_done": False},
                        {"code": "M-2", "title": "Таблицы", "minutes": 35, "is_done": False},
                        {"code": "M-3", "title": "Повтор", "minutes": 15, "is_done": True},
                    ],
                    "target_code": "M-2",
                },
                "expected": "[{'code': 'M-1', 'title': 'Заметки', 'minutes': 20, 'is_done': False}, {'code': 'M-2', 'title': 'Таблицы', 'minutes': 35, 'is_done': True}, {'code': 'M-3', 'title': 'Повтор', 'minutes': 15, 'is_done': True}]",
                "assert": "stdout",
            },
            {
                "name": "Запись уже завершена",
                "namespace": {
                    "records": [{"code": "M-4", "title": "Архив", "minutes": 10, "is_done": True}],
                    "target_code": "M-4",
                },
                "expected": "[{'code': 'M-4', 'title': 'Архив', 'minutes': 10, 'is_done': True}]",
                "assert": "stdout",
            },
            {
                "name": "Код отсутствует",
                "namespace": {
                    "records": [
                        {"code": "M-1", "title": "Заметки", "minutes": 20, "is_done": False},
                        {"code": "M-3", "title": "Повтор", "minutes": 15, "is_done": True},
                    ],
                    "target_code": "M-9",
                },
                "expected": "[{'code': 'M-1', 'title': 'Заметки', 'minutes': 20, 'is_done': False}, {'code': 'M-3', 'title': 'Повтор', 'minutes': 15, 'is_done': True}]",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "found = None\n"
            "for record in records:\n"
            "    if record[\"code\"] == target_code:\n"
            "        found = record\n"
            "        break\n"
            "if found is not None:\n"
            "    found[\"is_done\"] = True\n"
            "print(records)\n"
        ),
    },
    {
        "title": "Отберём записи и посчитаем итоги",
        "level": "easy",
        "mode": "script",
        "prompt": "Отберём все записи по части названия, посчитаем три итога и покажем исходный список.",
        "contract": {
            "given": "Перед запуском платформа задаёт записи и поисковый текст. Вводить их не нужно.",
            "given_items": [
                "records содержит словари с полями title и minutes.",
                "fragment может содержать пробелы по краям, быть в другом регистре или оказаться пустым.",
            ],
            "todo": "Соберём совпадения и вычислим количество, сумму минут и максимум только по ним.",
            "todo_items": [
                "Очистим fragment от пробелов по краям, сравним названия без учёта регистра и сохраним все совпадения в matches.",
                "По matches рассчитаем count, total и best. Для пустого результата получим 0, 0 и None.",
                "Напечатаем title и minutes каждой записи по строке, затем count, total, best и исходный records, каждый отдельной строкой.",
            ],
            "check": "Проверка включает разный регистр, несколько совпадений, пустой фрагмент и отсутствие совпадений. Исходные записи должны остаться прежними.",
        },
        "requirements": {
            "items": [
                "Поисковый текст очищается от внешних пробелов и приводится к нижнему регистру.",
                "Пустой поисковый текст не выбирает все записи; проход без break собирает каждое совпадение.",
                "count и total начинаются до прохода по matches и обновляются для совпавших записей.",
                "best начинается с None, первый элемент становится кандидатом без сравнения с числом.",
                "Результаты и исходный records выводятся после расчётов.",
            ],
            "names": ["records", "fragment", "matches", "record", "count", "total", "best"],
            "nodes": ["For", "If", "BoolOp", "And", "Is", "AugAssign"],
            "calls": ["print"],
            "attributes": ["strip", "lower", "append"],
        },
        "hints": [
            "Уберём пробелы по краям fragment и приведём буквы к нижнему регистру. Пустая строка не должна выбирать все записи.",
            "Сначала соберём подходящие записи в matches. Потом пройдём только этот список: count и total начнём с нуля, best с None.",
        ],
        "starter_code": (
            "# records и fragment подготовлены платформой\n"
            "normalized_fragment = fragment.strip().lower()\n"
            "matches = []\n"
            "for record in records:\n"
            "    # Добавим запись, если очищенный фрагмент есть в названии\n"
            "    pass\n"
            "\n"
            "count = 0\n"
            "total = 0\n"
            "best = None\n"
            "for record in matches:\n"
            "    # Обновим количество, сумму и максимум\n"
            "    pass\n"
            "\n"
            "for record in matches:\n"
            "    print(record[\"title\"], record[\"minutes\"])\n"
            "print(count)\n"
            "print(total)\n"
            "print(best)\n"
            "print(records)\n"
        ),
        "tests": [
            {
                "name": "Несколько названий с разным регистром",
                "namespace": {
                    "records": [
                        {"title": "Python основы", "minutes": 12},
                        {"title": "Заметки по чтению", "minutes": 7},
                        {"title": "PYTHON циклы", "minutes": 20},
                    ],
                    "fragment": " python ",
                },
                "expected": "Python основы 12\nPYTHON циклы 20\n2\n32\n20\n[{'title': 'Python основы', 'minutes': 12}, {'title': 'Заметки по чтению', 'minutes': 7}, {'title': 'PYTHON циклы', 'minutes': 20}]",
                "assert": "stdout",
            },
            {
                "name": "Нет совпадений",
                "namespace": {
                    "records": [
                        {"title": "Сад", "minutes": 5},
                        {"title": "Парк", "minutes": 9},
                    ],
                    "fragment": "музей",
                },
                "expected": "0\n0\nNone\n[{'title': 'Сад', 'minutes': 5}, {'title': 'Парк', 'minutes': 9}]",
                "assert": "stdout",
            },
            {
                "name": "Пустой поисковый текст и пустой список",
                "namespace": {"records": [], "fragment": "   "},
                "expected": "0\n0\nNone\n[]",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "normalized_fragment = fragment.strip().lower()\n"
            "matches = []\n"
            "for record in records:\n"
            "    if normalized_fragment != \"\" and normalized_fragment in record[\"title\"].lower():\n"
            "        matches.append(record)\n"
            "count = 0\n"
            "total = 0\n"
            "best = None\n"
            "for record in matches:\n"
            "    count += 1\n"
            "    total += record[\"minutes\"]\n"
            "    if best is None:\n"
            "        best = record[\"minutes\"]\n"
            "    elif record[\"minutes\"] > best:\n"
            "        best = record[\"minutes\"]\n"
            "for record in matches:\n"
            "    print(record[\"title\"], record[\"minutes\"])\n"
            "print(count)\n"
            "print(total)\n"
            "print(best)\n"
            "print(records)\n"
        ),
    },
    {
        "title": "Обработаем конечный список сигналов",
        "level": "easy",
        "mode": "script",
        "prompt": "Обработаем конечный список сигналов: сохраним next, пропустим skip и остановимся на stop или в конце списка.",
        "contract": {
            "given": "Платформа задаёт signals. Заготовка уже начинает с index = 0 и пустого списка handled.",
            "given_items": [
                "signals содержит только next, skip и stop. Список может быть пустым.",
            ],
            "todo": "Пройдём по сигналам до stop или конца списка.",
            "todo_items": [
                "Проверим границу списка до чтения signals[index].",
                "После чтения увеличим index до проверок stop и skip. Обычный сигнал добавим в handled.",
                "Напечатаем handled, затем index, каждый результат с новой строки.",
            ],
            "check": "Проверка включает пустой список, пропуск, остановку и сигналы после stop. Порядок проверок stop и skip не влияет на ответ.",
        },
        "requirements": {
            "items": [
                "Условие while проверяет границу до чтения signals[index].",
                "После чтения index увеличивается до ветвей break и continue.",
                "stop завершает цикл, skip пропускает добавление, другой сигнал добавляется в handled.",
                "После цикла печатаются handled и index.",
            ],
            "names": ["signals", "index", "signal", "handled"],
            "nodes": ["While", "If", "Break", "Continue", "AugAssign"],
            "calls": ["len", "print"],
            "attributes": ["append"],
        },
        "hints": [
            "Перед чтением проверим, что index меньше длины signals.",
            "Сразу после чтения передвинем index. Тогда continue перейдёт к следующему сигналу.",
            "Stop завершает цикл, skip пропускает добавление, а next попадает в handled.",
        ],
        "starter_code": (
            "# signals подготовлены платформой\n"
            "index = 0\n"
            "handled = []\n"
            "while index < len(signals):\n"
            "    signal = signals[index]\n"
            "    # Продвинем указатель до возможного continue\n"
            "    pass\n"
            "    if signal == \"stop\":\n"
            "        break\n"
            "    if signal == \"skip\":\n"
            "        continue\n"
            "    # Сохраним обычный сигнал\n"
            "    pass\n"
            "print(handled)\n"
            "print(index)\n"
        ),
        "tests": [
            {
                "name": "Пропуск и остановка",
                "namespace": {"signals": ["next", "skip", "stop", "next"]},
                "expected": "['next']\n3",
                "assert": "stdout",
            },
            {
                "name": "Пустой список",
                "namespace": {"signals": []},
                "expected": "[]\n0",
                "assert": "stdout",
            },
            {
                "name": "Продолжаем после skip до конца списка",
                "namespace": {"signals": ["skip", "next"]},
                "expected": "['next']\n2",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "index = 0\n"
            "handled = []\n"
            "while index < len(signals):\n"
            "    signal = signals[index]\n"
            "    index += 1\n"
            "    if signal == \"stop\":\n"
            "        break\n"
            "    if signal == \"skip\":\n"
            "        continue\n"
            "    handled.append(signal)\n"
            "print(handled)\n"
            "print(index)\n"
        ),
    },
]

CODE_TASKS[16] = [
    {
        "title": "Создадим словарь материала",
        "level": "easy",
        "mode": "script",
        "prompt": "Создадим небольшую запись материала и прочитаем её заголовок по ключу.",
        "contract": {
            "given": "Платформа задаёт `material_code`, `material_title` и `material_minutes`. Значения могут отличаться в проверке.",
            "todo": "Создадим словарь `material` с ключами `code`, `title` и `minutes`. Затем выведем значение поля `title`.",
            "todo_items": [
                "Поля `code`, `title` и `minutes` заполнены соответствующими исходными значениями.",
                "Значение поля `title` прочитано по ключу в квадратных скобках.",
            ],
            "check": "Проверка сравнит выведенный заголовок для двух разных записей.",
        },
        "requirements": {
            "items": [
            "Словарь `material` содержит `code`, `title` и `minutes`.",
            "Выводится значение `material` по ключу `title`.",
            ],
            "names": ["material_code", "material_title", "material_minutes", "material"],
            "nodes": ["Dict", "Subscript"],
            "calls": ["print"],
        },
        "hints": [
            "Сопоставим `material_code` с ключом `code`, `material_title` с `title`, а `material_minutes` с `minutes`.",
            "Чтобы прочитать заголовок, используем `material[\"title\"]`.",
        ],
        "starter_code": (
            "# Создайте словарь material с ключами code, title и minutes\n"
            "\n"
            "# Выведите значение поля title\n"
        ),
        "tests": [
            {
                "name": "Запись о коллекциях",
                "namespace": {
                    "material_code": "PY-16",
                    "material_title": "Коллекции",
                    "material_minutes": 30,
                },
                "expected": "Коллекции",
                "assert": "stdout",
            },
            {
                "name": "Другая запись",
                "namespace": {
                    "material_code": "PY-42",
                    "material_title": "Условия",
                    "material_minutes": 18,
                },
                "expected": "Условия",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            'material = {"code": material_code, "title": material_title, "minutes": material_minutes}\n'
            'print(material["title"])\n'
        ),
    },
    {
        "title": "Изменим несколько полей записи",
        "level": "easy",
        "mode": "script",
        "prompt": "Заменим заголовок, добавим формат и обновим длительность вместе с уровнем.",
        "contract": {
            "given": "Платформа задаёт готовый словарь `material` с ключами `code`, `title` и `minutes`, а также `new_title`, `material_format`, `updated_minutes` и `material_level`. Значения могут отличаться в проверке.",
            "todo": "Заменим `title`, добавим `format`, а через `update` заменим `minutes` и добавим `level`. Выведем пять полей по одному в строке.",
            "todo_items": [
                "Значение `title` заменено на `new_title`, ключ `format` добавлен.",
                "`update` заменяет `minutes` и добавляет `level`, остальные поля сохранены.",
                "Пять значений выведены в порядке `code`, `title`, `minutes`, `format`, `level`.",
            ],
            "check": "Проверка сравнит весь вывод для двух наборов данных и убедится, что code исходной записи сохранился.",
        },
        "requirements": {
            "items": [
                "Существующий ключ title получает new_title, а format добавляется.",
                "Метод update меняет minutes и добавляет level без потери других полей.",
                "Вывод содержит пять полей в указанном порядке.",
            ],
            "names": ["material", "new_title", "material_format", "updated_minutes", "material_level"],
            "nodes": ["Subscript"],
            "calls": ["print"],
            "attributes": ["update"],
        },
        "hints": [
            "Квадратные скобки меняют существующее поле title и создают новую пару format.",
            "Передайте в update пары minutes и level. Не присваивайте результат update словарю.",
            "После изменений выведите code, title, minutes, format и level именно в этом порядке.",
        ],
        "starter_code": (
            "# Замените title и добавьте format\n"
            "\n"
            "# Обновите minutes и добавьте level через update\n"
            "\n"
            "# Выведите code, title, minutes, format и level по одному в строке\n"
        ),
        "tests": [
            {
                "name": "Первый набор",
                "namespace": {
                    "material": {"code": "PY-16", "title": "Коллекции", "minutes": 30},
                    "new_title": "Словари",
                    "material_format": "script",
                    "updated_minutes": 35,
                    "material_level": "базовый",
                },
                "expected": "PY-16\nСловари\n35\nscript\nбазовый",
                "assert": "stdout",
            },
            {
                "name": "Другой набор",
                "namespace": {
                    "material": {"code": "PY-42", "title": "Условия", "minutes": 18},
                    "new_title": "Записи",
                    "material_format": "разбор",
                    "updated_minutes": 22,
                    "material_level": "средний",
                },
                "expected": "PY-42\nЗаписи\n22\nразбор\nсредний",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            'material["title"] = new_title\n'
            'material["format"] = material_format\n'
            'material.update({"minutes": updated_minutes, "level": material_level})\n'
            'print(material["code"])\n'
            'print(material["title"])\n'
            'print(material["minutes"])\n'
            'print(material["format"])\n'
            'print(material["level"])\n'
        ),
    },
    {
        "title": "Выберем чтение обязательного и необязательного поля",
        "level": "easy",
        "mode": "script",
        "prompt": "Прочитаем обязательный title через квадратные скобки и необязательные поля через get, не подменяя сохранённые None, 0 и False.",
        "contract": {
            "given": "Платформа задаёт словарь material. В нём всегда есть title, duration равен 0 и available равен False; subtitle может отсутствовать или присутствовать со значением None.",
            "todo": "Выведем title, subtitle с текстом по умолчанию, duration с запасным числом 60 и available с запасным значением True.",
            "todo_items": [
                "title читается как обязательное поле.",
                "Для отсутствующего subtitle напечатан default, а для сохранённого None напечатан None.",
                "Сохранённые 0 и False не заменены запасными значениями.",
            ],
            "check": "Проверка сравнит точный вывод для subtitle без ключа и subtitle со значением None.",
        },
        "requirements": {
            "items": [
                "Обязательное поле читается по ключу в квадратных скобках.",
                "Необязательные поля читаются методом get с указанным default.",
                "Результат сохраняет None, 0 и False, если такие значения уже записаны.",
                "Каждое значение выводится на отдельной строке в установленном порядке.",
            ],
            "names": ["material", "print"],
            "nodes": ["Subscript"],
            "calls": ["print"],
            "attributes": ["get"],
        },
        "hints": [
            "Сначала определим, какое поле обязательно, а какое допускает отсутствие.",
            "get использует default только когда ключа нет. Если ключ содержит None, 0 или False, вернётся это значение.",
            "Не заменяйте квадратные скобки на get для обязательного title.",
        ],
        "starter_code": (
            "# Выведите обязательный title\n"
            "# Для subtitle укажите текст по умолчанию: подзаголовок не указан\n"
            "# Для duration задайте запасное значение 60\n"
            "# Для available задайте запасное значение True\n"
        ),
        "tests": [
            {
                "name": "Необязательный ключ отсутствует",
                "namespace": {
                    "material": {"title": "Словари", "duration": 0, "available": False},
                },
                "expected": "Словари\nподзаголовок не указан\n0\nFalse",
                "assert": "stdout",
            },
            {
                "name": "Необязательный ключ хранит None",
                "namespace": {
                    "material": {"title": "Записи", "subtitle": None, "duration": 0, "available": False},
                },
                "expected": "Записи\nNone\n0\nFalse",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            'print(material["title"])\n'
            'print(material.get("subtitle", "подзаголовок не указан"))\n'
            'print(material.get("duration", 60))\n'
            'print(material.get("available", True))\n'
        ),
    },
    {
        "title": "Удалим поле и сохраним результат pop",
        "level": "easy",
        "mode": "script",
        "prompt": "Удалим необязательное поле через pop и прочитаем его прежнее значение, затем удалим только известное поле через del.",
        "contract": {
            "given": "Словарь material содержит title, subtitle со значением None и available со значением False. Ключ format отсутствует.",
            "todo": "Удалим subtitle через pop, запросим отсутствующий format с default и удалим available через del. Выведем возвращённые значения и проверим наличие двух ключей.",
            "todo_items": [
                "pop возвращает сохранённый None и удаляет subtitle.",
                "pop для отсутствующего format возвращает заданный default.",
                "del удаляет available без получения его значения.",
                "Проверки in показывают, что subtitle и available отсутствуют.",
            ],
            "check": "Проверка сверит возвращённые значения и итоговое наличие ключей.",
        },
        "requirements": {
            "items": [
                "Для существующего ключа subtitle pop возвращает его значение и удаляет пару.",
                "Для отсутствующего format pop использует default.",
                "Ключ available удаляется оператором del.",
                "Состояние двух ключей проверяется через in.",
            ],
            "names": ["material", "removed_subtitle", "missing_format", "print"],
            "nodes": ["Subscript", "Delete", "Compare", "In"],
            "calls": ["print"],
            "attributes": ["pop"],
        },
        "hints": [
            "Сохраним результат pop в отдельные имена, чтобы напечатать прежние значения.",
            "Проверьте, что None является сохранённым значением subtitle, а format действительно отсутствует.",
            "del убирает available. Для проверки оставшихся ключей пригодится выражение key in material.",
        ],
        "starter_code": (
            "# Удалите subtitle через pop и сохраните возвращённое значение\n"
            "# Удалите отсутствующий format через pop с default: формат не задан\n"
            "# Удалите available оператором del\n"
            "# Выведите оба результата и проверки наличия subtitle и available\n"
        ),
        "tests": [
            {
                "name": "Попробуем удалить существующий None и отсутствующий ключ",
                "namespace": {
                    "material": {"title": "Словари", "subtitle": None, "available": False},
                },
                "expected": "None\nформат не задан\nFalse\nFalse",
                "assert": "stdout",
            },
            {
                "name": "Удалим поле со строковым значением",
                "namespace": {
                    "material": {"title": "Записи", "subtitle": "Короткое описание", "available": False},
                },
                "expected": "Короткое описание\nформат не задан\nFalse\nFalse",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            'removed_subtitle = material.pop("subtitle")\n'
            'missing_format = material.pop("format", "формат не задан")\n'
            'del material["available"]\n'
            'print(removed_subtitle)\n'
            'print(missing_format)\n'
            'print("subtitle" in material)\n'
            'print("available" in material)\n'
        ),
    },
    {
        "title": "Посмотрим на представления и отдельную копию",
        "level": "easy",
        "mode": "script",
        "prompt": "Получим ключи, значения и пары записи material, затем изменим title только в её копии.",
        "contract": {
            "given": "Платформа задаёт словарь material с ключами code, title и minutes, а также новое значение new_title.",
            "todo": "Выведем представления ключей, значений и пар, скопируем словарь, заменим title в копии и выведем исходный и новый title.",
            "todo_items": [
                "Выведены результаты keys(), values() и items() для исходной записи.",
                "items показывает пары ключ–значение.",
                "Копия хранит новое значение title, исходный словарь сохраняет прежнее.",
            ],
            "check": "Проверка сравнит всё представление и оба значения title на двух исходных записях.",
        },
        "requirements": {
            "items": [
                "Использованы методы keys, values, items и copy.",
                "Словарь копируется до изменения title.",
                "Значение исходного material не меняется.",
                "Печатаются три представления и оба заголовка по одному на строке.",
            ],
            "names": ["material", "material_copy", "new_title", "print"],
            "nodes": ["Call", "Subscript"],
            "calls": ["print"],
            "attributes": ["keys", "values", "items", "copy"],
        },
        "hints": [
            "Посмотрим на ключи, значения и связанные пары разными вызовами метода.",
            "Сохраним copy() в отдельное имя до присваивания нового title.",
            "Последние две строки должны прочитать одно поле из исходного словаря и из его копии.",
        ],
        "starter_code": (
            "# Выведите ключи, значения и пары словаря material\n"
            "# Создайте отдельную копию\n"
            "# Измените title только в копии\n"
            "# Выведите title исходного словаря и копии\n"
        ),
        "tests": [
            {
                "name": "Полевой справочник",
                "namespace": {
                    "material": {"code": "PY-16", "title": "Списки", "minutes": 35},
                    "new_title": "Словари",
                },
                "expected": "dict_keys(['code', 'title', 'minutes'])\ndict_values(['PY-16', 'Списки', 35])\ndict_items([('code', 'PY-16'), ('title', 'Списки'), ('minutes', 35)])\nСписки\nСловари",
                "assert": "stdout",
            },
            {
                "name": "Другая запись",
                "namespace": {
                    "material": {"code": "PY-22", "title": "Условия", "minutes": 20},
                    "new_title": "Циклы",
                },
                "expected": "dict_keys(['code', 'title', 'minutes'])\ndict_values(['PY-22', 'Условия', 20])\ndict_items([('code', 'PY-22'), ('title', 'Условия'), ('minutes', 20)])\nУсловия\nЦиклы",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            'print(material.keys())\n'
            'print(material.values())\n'
            'print(material.items())\n'
            'material_copy = material.copy()\n'
            'material_copy["title"] = new_title\n'
            'print(material["title"])\n'
            'print(material_copy["title"])\n'
        ),
    },
]

CODE_TASKS[21] = [
    {
        "title": "Напишем конечный счётчик",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт целые числа `start` и `limit`. Выведем числа от start до limit, не включая limit.",
        "contract": {
            "given": "Перед запуском платформа передаёт два целых числа:",
            "given_items": [
                "`start` задаёт первое число для вывода.",
                "`limit` задаёт границу. Это число в вывод не входит.",
            ],
            "todo": "Код выводит числа от `start` до `limit`, не включая границу.",
            "todo_items": [
                "Счётчик `count` начинается со значения `start`.",
                "Пока `count` меньше `limit`, программа выводит его отдельной строкой.",
                "После вывода `count` увеличивается на 1.",
            ],
            "check": "При start = 1 и limit = 4 программа выводит 1, 2 и 3, каждое на своей строке. Если start равно limit или больше limit, вывода нет.",
        },
        "requirements": {
            "items": [
                "Начальное состояние счётчика задано до цикла.",
                "Условие допускает значения до limit, не включая limit.",
                "На каждом проходе выводится текущее число, затем счётчик увеличивается на единицу.",
            ],
            "names": ["start", "limit", "count"],
            "nodes": ["While"],
            "calls": ["print"],
        },
        "hints": [
            "Сначала запишем `start` в `count`, чтобы первый проход начинался с нужного числа.",
            "Условие проверяется до тела. Если `count` уже равен `limit`, цикл сразу закончится.",
            "После вывода прибавим к `count` единицу. Тогда он дойдёт до границы, и условие станет ложным.",
        ],
        "starter_code": (
            "count = start\n"
            "while count < limit:\n"
            "    # Выведите текущее число\n"
            "    count += 1\n"
        ),
        "tests": [
            {"name": "Три числа", "namespace": {"start": 1, "limit": 4}, "expected": "1\n2\n3", "assert": "stdout"},
            {"name": "Один проход", "namespace": {"start": 3, "limit": 4}, "expected": "3", "assert": "stdout"},
            {"name": "Начало уже на границе", "namespace": {"start": 4, "limit": 4}, "expected": "", "assert": "stdout"},
            {"name": "Начало за границей", "namespace": {"start": 5, "limit": 4}, "expected": "", "assert": "stdout"},
            {"name": "Счёт от отрицательного значения", "namespace": {"start": -1, "limit": 1}, "expected": "-1\n0", "assert": "stdout"},
        ],
        "reference_code": (
            "count = start\n"
            "while count < limit:\n"
            "    print(count)\n"
            "    count += 1\n"
        ),
    },
    {
        "title": "Прочитаем список по указателю",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт список `items`. Покажем все названия по одному разу и в исходном порядке.",
        "contract": {
            "given": "Перед запуском платформа передаёт список названий `items`:",
            "given_items": [
                "Список может быть пустым.",
                "Исходный порядок названий нужно сохранить.",
            ],
            "todo": "Код выводит каждое название отдельной строкой и сохраняет исходный порядок.",
            "todo_items": [
                "Указатель `index` начинается с позиции `0`.",
                "Перед чтением `items[index]` код проверяет, что `index` меньше длины списка.",
                "После вывода `index` увеличивается на 1.",
            ],
            "check": "Проверка использует пустой, одноэлементный и трёхэлементный списки. Все названия выводятся по одному разу, в исходном порядке; чтения за границей нет.",
        },
        "requirements": {
            "items": [
                "Индекс начинается с позиции 0 до первой проверки.",
                "Цикл проверяет, что индекс меньше длины списка, до чтения элемента.",
                "Каждый прочитанный элемент выводится, а индекс увеличивается на каждом проходе.",
            ],
            "names": ["items", "index"],
            "nodes": ["While"],
            "calls": ["len", "print"],
        },
        "hints": [
            "Первый элемент находится на позиции `0`. Эту позицию сохраним в `index`.",
            "До чтения `items[index]` сравним `index` с длиной списка. Для пустого списка условие сразу ложно.",
            "После вывода увеличим `index` на 1. Когда он дойдёт до длины списка, цикл остановится.",
        ],
        "starter_code": (
            "index = 0\n"
            "while index < len(items):\n"
            "    # Прочитайте и выведите существующий элемент\n"
            "    index += 1\n"
        ),
        "tests": [
            {"name": "Пустой список", "namespace": {"items": []}, "expected": "", "assert": "stdout"},
            {"name": "Один элемент", "namespace": {"items": ["Берег"]}, "expected": "Берег", "assert": "stdout"},
            {"name": "Три элемента", "namespace": {"items": ["Лес", "Парк", "Сад"]}, "expected": "Лес\nПарк\nСад", "assert": "stdout"},
        ],
        "reference_code": (
            "index = 0\n"
            "while index < len(items):\n"
            "    print(items[index])\n"
            "    index += 1\n"
        ),
    },
    {
        "title": "Обработаем сигналы и безопасно пропустим элемент",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт список `signals` со значениями next, skip и stop. Выведем next до первого stop или до конца списка.",
        "contract": {
            "given": "Перед запуском платформа передаёт готовый список `signals`:",
            "given_items": [
                "В списке встречаются только `next`, `skip` и `stop`.",
                "Список может быть пустым или закончиться до сигнала `stop`.",
            ],
            "todo": "Код выводит каждый сигнал `next` до первого `stop` или до конца списка.",
            "todo_items": [
                "Перед чтением `signals[index]` код проверяет, что `index` меньше длины списка.",
                "Сигнал `stop` завершает цикл через `break`. Сам сигнал и следующие элементы не выводятся.",
                "Сигнал `skip` не выводится. Перед `continue` индекс увеличивается на 1.",
                "Сигнал `next` выводится отдельной строкой, затем индекс увеличивается на 1.",
            ],
            "check": "Проверка сверяет отдельные строки next, пропуск skip, выход на stop и завершение у конца списка без stop.",
        },
        "requirements": {
            "items": [
                "Граница списка проверяется до чтения текущего сигнала.",
                "Сигнал stop завершает цикл через break без чтения следующих элементов.",
                "В ветви skip индекс увеличивается до continue.",
                "Сигнал next выводится, а индекс увеличивается перед следующей проверкой.",
            ],
            "names": ["signals", "index", "signal"],
            "nodes": ["While", "If", "Break", "Continue"],
            "calls": ["len", "print"],
        },
        "hints": [
            "Сначала сравним `index` с длиной. Только после успешной проверки прочитаем `signals[index]`.",
            "Для `stop` используем `break`. Для `skip` сначала увеличим `index`, потом выполним `continue`.",
            "Для `next` выведем сигнал и увеличим `index`. Отдельно представим список, в котором `stop` не встретился: тогда цикл закончится у его границы.",
        ],
        "starter_code": (
            "index = 0\n"
            "while index < len(signals):\n"
            "    signal = signals[index]\n"
            "    if signal == \"stop\":\n"
            "        break\n"
            "    # Обработайте next и пропустите skip\n"
            "    index += 1\n"
        ),
        "tests": [
            {"name": "Skip и конец списка", "namespace": {"signals": ["next", "skip", "next"]}, "expected": "next\nnext", "assert": "stdout"},
            {"name": "Stop раньше конца", "namespace": {"signals": ["skip", "next", "stop", "next"]}, "expected": "next", "assert": "stdout"},
            {"name": "Stop первым", "namespace": {"signals": ["stop", "next"]}, "expected": "", "assert": "stdout"},
            {"name": "Пустой список", "namespace": {"signals": []}, "expected": "", "assert": "stdout"},
        ],
        "reference_code": (
            "index = 0\n"
            "while index < len(signals):\n"
            "    signal = signals[index]\n"
            "    if signal == \"stop\":\n"
            "        break\n"
            "    if signal == \"skip\":\n"
            "        index += 1\n"
            "        continue\n"
            "    print(signal)\n"
            "    index += 1\n"
        ),
    },
]

CODE_TASKS[14] = [
    {
        "title": "Сравним два способа разделить строку",
        "level": "easy",
        "mode": "script",
        "prompt": (
            "Платформа задаёт строку source_text. Получи список слов через split() без аргумента и список полей "
            "через split(\" \"), затем выведи оба списка. Не удаляй пробелы из исходной строки вручную."
        ),
        "contract": {
            "given": "Платформа задаёт строку `source_text`.",
            "given_items": [
                "В строке могут быть пробелы в начале и в конце, а также несколько пробелов подряд.",
                "Строка может быть пустой.",
            ],
            "todo": "Сравни два способа разделить строку и покажи оба списка: сначала `words`, затем `fields`.",
            "todo_items": [
                "Сохрани результат `source_text.split()` в `words`.",
                "Сохрани результат `source_text.split(\" \")` в `fields`.",
            ],
            "check": "Проверка подставит строки с разным количеством пробелов, обычную строку и пустую строку.",
        },
        "requirements": {
            "items": [
                "split() вызван без аргумента, его результат сохранён отдельно.",
                "split(\" \") вызывается с одним точным пробелом.",
                "Сначала выводится words, затем fields.",
            ],
            "names": ["source_text", "words", "fields"],
            "attributes": ["split"],
            "calls": ["print"],
        },
        "hints": [
            "Для words вызови `source_text.split()` без аргумента.",
            "Для fields передай в split один пробел: `source_text.split(\" \")`.",
            "Оставь пустые строки в fields: они показывают место повторных пробелов.",
        ],
        "starter_code": (
            "# Платформа задаёт source_text.\n"
            "words = source_text\n"
            "fields = source_text\n"
            "print(words)\n"
            "print(fields)\n"
        ),
        "tests": [
            {
                "name": "Повторные и крайние пробелы",
                "namespace": {"source_text": "  лес   берег  "},
                "expected": "['лес', 'берег']\n['', '', 'лес', '', '', 'берег', '', '']",
                "assert": "stdout",
            },
            {
                "name": "Один пробел между словами",
                "namespace": {"source_text": "лес берег"},
                "expected": "['лес', 'берег']\n['лес', 'берег']",
                "assert": "stdout",
            },
            {
                "name": "Пустая строка",
                "namespace": {"source_text": ""},
                "expected": "[]\n['']",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "words = source_text.split()\n"
            "fields = source_text.split(\" \")\n"
            "print(words)\n"
            "print(fields)\n"
        ),
    },
    {
        "title": "Изменим часть сообщения и соберём новое",
        "level": "easy",
        "mode": "script",
        "prompt": (
            "Платформа задаёт source_text из трёх или более слов и строку replacement. Раздели сообщение через split(), "
            "замени известный второй элемент и собери новый текст с разделителем \" / \". Выведи исходное сообщение, "
            "изменённый список и новую строку."
        ),
        "contract": {
            "given": "Платформа задаёт исходное сообщение `source_text` и строку `replacement`.",
            "given_items": [
                "В `source_text` не меньше трёх слов, поэтому второй элемент списка существует.",
                "`replacement` задаёт новое значение для второго слова.",
            ],
            "todo": "Создай список частей, замени второе слово и собери новое сообщение с разделителем `\" / \"`. Покажи исходное сообщение, список и результат.",
            "todo_items": [
                "Сохрани результат `source_text.split()` в `parts`.",
                "Замени `parts[1]` на `replacement`.",
                "Сохрани вызов `\" / \".join(parts)` в `new_message`.",
                "Выведи `source_text`, `parts` и `new_message` по одному значению на строке.",
            ],
            "check": "Проверка подставит другие слова и замену. Исходная строка должна остаться прежней.",
        },
        "requirements": {
            "items": [
                "Список частей создаётся из source_text методом split().",
                "Меняется только заранее известный элемент с индексом 1.",
                "Новая строка собирается вызовом join у строки-разделителя.",
                "Исходное сообщение, изменённый список и новая строка показаны отдельно.",
            ],
            "names": ["source_text", "replacement", "parts", "new_message"],
            "attributes": ["split", "join"],
            "nodes": ["Subscript"],
            "calls": ["print"],
        },
        "hints": [
            "Сначала создай список: `parts = source_text.split()`.",
            "Индекс `1` означает второй элемент. Замени `parts[1]` на `replacement`.",
            "Собери результат так: `new_message = \" / \".join(parts)`. Вызов `join` не меняет `parts`.",
        ],
        "starter_code": (
            "# Платформа задаёт source_text и replacement.\n"
            "parts = source_text\n"
            "parts[1] = replacement\n"
            "new_message = parts\n"
            "print(source_text)\n"
            "print(parts)\n"
            "print(new_message)\n"
        ),
        "tests": [
            {
                "name": "Три части",
                "namespace": {"source_text": "лето поезд город", "replacement": "велосипед"},
                "expected": "лето поезд город\n['лето', 'велосипед', 'город']\nлето / велосипед / город",
                "assert": "stdout",
            },
            {
                "name": "Повторные пробелы в исходнике",
                "namespace": {"source_text": "утро  лес   берег", "replacement": "парк"},
                "expected": "утро  лес   берег\n['утро', 'парк', 'берег']\nутро / парк / берег",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "parts = source_text.split()\n"
            "parts[1] = replacement\n"
            "new_message = \" / \".join(parts)\n"
            "print(source_text)\n"
            "print(parts)\n"
            "print(new_message)\n"
        ),
    },
    {
        "title": "Подготовим число для join",
        "level": "easy",
        "mode": "script",
        "prompt": (
            "В списке parts есть число минут. Найди две причины, по которым заготовка не подходит: join вызван у списка, "
            "а один элемент не является строкой. Создай отдельную строку для сообщения с явным str() и правильным "
            "вызовом join. Не меняй parts и не используй цикл. Выведи исходный список, затем сообщение."
        ),
        "contract": {
            "given": "Платформа задаёт целое число `minutes`. Заготовка собирает из него список `parts = [\"маршрут\", minutes, \"минут\"]`.",
            "given_items": [
                "Первая и третья части `parts` являются строками.",
                "Вторая часть `parts` содержит число, его нужно явно подготовить для сообщения.",
            ],
            "todo": "Подготовь отдельный список из строк, соедини его одним пробелом и покажи исходный `parts` и сообщение.",
            "todo_items": [
                "Преобразуй `parts[1]` в строку с помощью `str(...)`.",
                "Собери отдельный список для соединения, не меняя `parts`.",
                "Вызови `\" \".join(...)` и сохрани результат в `message`.",
                "Выведи сначала `parts`, затем `message`.",
            ],
            "check": "Проверка подставит несколько значений minutes. Исходный список должен сохранить число и прежний порядок.",
        },
        "requirements": {
            "items": [
                "join вызван у строкового разделителя, а не у списка.",
                "Известное число преобразовано функцией str до соединения.",
                "Исходный список parts не изменён.",
                "Сначала выведен исходный список, затем собранная строка.",
            ],
            "names": ["parts", "minutes", "message"],
            "attributes": ["join"],
            "nodes": ["Subscript", "List"],
            "calls": ["str", "print"],
        },
        "hints": [
            "Строка-разделитель стоит перед точкой: `\" \".join(...)`.",
            "Преобразуй только вторую часть: `str(parts[1])`.",
            "Собери отдельный список для сообщения, чтобы число в `parts` осталось числом.",
        ],
        "starter_code": (
            "# Платформа задаёт целое число minutes.\n"
            "parts = [\"маршрут\", minutes, \"минут\"]\n"
            "message = parts.join(\" \")\n"
            "print(parts)\n"
            "print(message)\n"
        ),
        "tests": [
            {
                "name": "Обычная длительность",
                "namespace": {"minutes": 12},
                "expected": "['маршрут', 12, 'минут']\nмаршрут 12 минут",
                "assert": "stdout",
            },
            {
                "name": "Нулевая длительность",
                "namespace": {"minutes": 0},
                "expected": "['маршрут', 0, 'минут']\nмаршрут 0 минут",
                "assert": "stdout",
            },
            {
                "name": "Другая длительность",
                "namespace": {"minutes": 45},
                "expected": "['маршрут', 45, 'минут']\nмаршрут 45 минут",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "parts = [\"маршрут\", minutes, \"минут\"]\n"
            "message = \" \".join([\"маршрут\", str(parts[1]), \"минут\"])\n"
            "print(parts)\n"
            "print(message)\n"
        ),
    },
]

CODE_TASKS[13] = [
    {
        "title": "Проследим общую ссылку и новое присваивание",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт topics, extra_topic и draft_topic. Script показывает два состояния списка и результаты is до и после перепривязывания только второго имени. Элемент, добавленный через общее имя, виден в обоих связанных именах.",
        "contract": {
            "given": "Платформа задаёт плоский список строк topics, а также строки extra_topic и draft_topic.",
            "todo": "Script связывает main_list и second_name с одним списком и добавляет extra_topic через second_name. Затем он назначает second_name новый список с draft_topic и выводит оба списка вместе с проверкой их идентичности до и после перепривязывания.",
            "check": "Проверка использует несколько исходных списков, включая пустой. Элемент, добавленный через общую ссылку, должен появиться в main_list. После нового присваивания списки должны иметь разные связи.",
        },
        "requirements": {
            "items": [
                "main_list и second_name сначала обозначают один список.",
                "append через second_name меняет общий список.",
                "Новое присваивание меняет только связь second_name.",
                "Проверка is показывает общую ссылку до и разные списки после перепривязывания.",
            ],
            "names": ["topics", "extra_topic", "draft_topic", "main_list", "second_name"],
            "nodes": ["Is"],
            "calls": ["print"],
            "attributes": ["append"],
        },
        "hints": [
            "Сначала свяжем main_list с topics, а затем назначим second_name уже существующее имя.",
            "Добавление через second_name меняет общий список. Выведем обе переменные до перепривязывания.",
            "После создания нового списка для second_name повторно проверим main_list is second_name.",
        ],
        "starter_code": (
            "main_list = topics\n"
            "# Создайте второе имя для того же списка.\n"
            "# Добавьте extra_topic через второе имя.\n"
            "# Выведите оба списка и результат is до перепривязывания.\n"
            "# Назначьте second_name новый список с draft_topic.\n"
            "# Снова выведите оба списка и результат is.\n"
        ),
        "tests": [
            {
                "name": "Два исходных элемента",
                "namespace": {"topics": ["Чтение", "Практика"], "extra_topic": "Повторение", "draft_topic": "Черновик"},
                "expected": "['Чтение', 'Практика', 'Повторение']\n['Чтение', 'Практика', 'Повторение']\nTrue\n['Чтение', 'Практика', 'Повторение']\n['Черновик']\nFalse",
                "assert": "stdout",
            },
            {
                "name": "Пустой исходный список",
                "namespace": {"topics": [], "extra_topic": "Старт", "draft_topic": "План"},
                "expected": "['Старт']\n['Старт']\nTrue\n['Старт']\n['План']\nFalse",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "main_list = topics\n"
            "second_name = main_list\n"
            "second_name.append(extra_topic)\n"
            "print(main_list)\n"
            "print(second_name)\n"
            "print(main_list is second_name)\n"
            "second_name = [draft_topic]\n"
            "print(main_list)\n"
            "print(second_name)\n"
            "print(main_list is second_name)\n"
        ),
    },
    {
        "title": "Создадим отдельную копию плоского списка",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт source_items и new_item. Script создаёт отдельный внешний список, показывает равенство содержимого и проверяет is. После добавления new_item исходный список сохраняется, а копия содержит новую строку.",
        "contract": {
            "given": "source_items содержит плоский список строк. new_item содержит строку, которой пока нет в списке.",
            "todo": "Script создаёт draft_items как копию source_items. До изменения он выводит source_items == draft_items и source_items is draft_items, добавляет new_item только в draft_items, затем показывает оба списка.",
            "check": "Проверка повторит запуск на нескольких плоских списках. Содержимое копии сначала равно исходному, но это отдельный список. Добавление в копию не меняет исходник.",
        },
        "requirements": {
            "items": [
                "Копия создаётся из source_items и не заменяет исходный список.",
                "До изменения содержимое списков сравнивается через ==.",
                "Идентичность двух списков проверяется через is.",
                "Новый элемент добавляется только в draft_items.",
            ],
            "names": ["source_items", "new_item", "draft_items"],
            "nodes": ["Eq", "Is"],
            "calls": ["print"],
            "attributes": ["append"],
        },
        "hints": [
            "Для независимого внешнего списка применим source_items.copy(). Полный срез source_items[:] создаёт такой же внешний договор.",
            "Сначала проверим равенство содержимого и идентичность до изменения.",
            "Добавим new_item только в draft_items, после чего выведем исходник и копию.",
        ],
        "starter_code": (
            "# Создайте отдельный список draft_items на основе source_items.\n"
            "# Сравните содержимое и идентичность до изменения.\n"
            "# Добавьте new_item только в копию.\n"
            "# Покажите исходный список и копию после изменения.\n"
        ),
        "tests": [
            {
                "name": "Список из двух строк",
                "namespace": {"source_items": ["Заметка", "План"], "new_item": "Итог"},
                "expected": "True\nFalse\n['Заметка', 'План']\n['Заметка', 'План', 'Итог']",
                "assert": "stdout",
            },
            {
                "name": "Один элемент",
                "namespace": {"source_items": ["Книга"], "new_item": "Курс"},
                "expected": "True\nFalse\n['Книга']\n['Книга', 'Курс']",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "draft_items = source_items.copy()\n"
            "print(source_items == draft_items)\n"
            "print(source_items is draft_items)\n"
            "draft_items.append(new_item)\n"
            "print(source_items)\n"
            "print(draft_items)\n"
        ),
    },
    {
        "title": "Выберем общую связь или копию по условию",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт source_items, shared_addition и independent_addition. Script сохраняет одну общую связь с исходным списком и создаёт независимую копию. Вывод показывает, что общая строка меняет исходник, а отдельная строка появляется только в копии.",
        "contract": {
            "given": "Платформа задаёт плоский список source_items, строку shared_addition и строку independent_addition.",
            "todo": "Script связывает shared_view с source_items и создаёт independent_view как копию до изменений. Он добавляет shared_addition через общую ссылку, а independent_addition только в копию. Вывод показывает исходный список, обе проверки is и независимый вариант.",
            "check": "На новых данных общая ссылка должна изменить исходный список, а копия должна сохранить собственный набор элементов. Проверка сравнит пустой и непустой исходные списки.",
        },
        "requirements": {
            "items": [
                "shared_view связан с source_items без создания копии.",
                "independent_view создаётся как отдельный внешний список до мутации.",
                "Добавления к двум вариантам выполняются независимо.",
                "Идентичность проверяется отдельно для общей ссылки и копии.",
            ],
            "names": ["source_items", "shared_addition", "independent_addition", "shared_view", "independent_view"],
            "nodes": ["Is"],
            "calls": ["print"],
            "attributes": ["append"],
        },
        "hints": [
            "Сначала сформулируем договор для каждого имени: одно должно быть общим, другое самостоятельным.",
            "Создадим копию до изменения исходного списка.",
            "Проверим source_items is shared_view и source_items is independent_view после двух добавлений.",
        ],
        "starter_code": (
            "# Свяжите shared_view с исходным списком.\n"
            "# Создайте отдельный список independent_view.\n"
            "# Добавьте разные строки в общий и независимый варианты.\n"
            "# Выведите source_items, две проверки is и independent_view.\n"
        ),
        "tests": [
            {
                "name": "Два исходных элемента",
                "namespace": {"source_items": ["Список", "Текст"], "shared_addition": "Общее", "independent_addition": "Отдельное"},
                "expected": "['Список', 'Текст', 'Общее']\nTrue\nFalse\n['Список', 'Текст', 'Отдельное']",
                "assert": "stdout",
            },
            {
                "name": "Пустой исходный список",
                "namespace": {"source_items": [], "shared_addition": "Общее", "independent_addition": "Отдельное"},
                "expected": "['Общее']\nTrue\nFalse\n['Отдельное']",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "shared_view = source_items\n"
            "independent_view = source_items.copy()\n"
            "shared_view.append(shared_addition)\n"
            "independent_view.append(independent_addition)\n"
            "print(source_items)\n"
            "print(source_items is shared_view)\n"
            "print(source_items is independent_view)\n"
            "print(independent_view)\n"
        ),
    },
]

CODE_TASKS[15] = [
    {
        "title": "Создадим и распакуем пару",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт два места и одно название. Сохраним места как упорядоченную пару, распакуем их в отдельные имена и сравним группировку скобками с tuple из одного значения.",
        "contract": {
            "given": "Переменные start_place, end_place и single_place содержат готовые строки.",
            "given_items": [
                "start_place содержит начало маршрута.",
                "end_place содержит конец маршрута.",
                "single_place содержит одно отдельное название.",
            ],
            "todo": "Создадим tuple route, распакуем его в start и finish, затем получим обычную строку grouped и одноэлементный tuple single.",
            "todo_items": [
                "Соберите route в порядке start_place, затем end_place.",
                "Распакуйте route в имена start и finish.",
                "Создайте grouped со скобками без запятой и single с запятой.",
                "Выведите route, start, finish, grouped и single.",
            ],
            "check": "Проверка сравнит порядок пары, соответствие двух имён и различие скобок без запятой и tuple с запятой.",
        },
        "requirements": {
            "items": [
                "Пара содержит start_place перед end_place.",
                "Два имени получают значения по соответствующим позициям.",
                "Одно значение без запятой остаётся строкой, а завершающая запятая создаёт tuple.",
                "Печатаются пара, распакованные значения, строка и одноэлементный tuple.",
            ],
            "names": ["start_place", "end_place", "single_place", "route", "start", "finish", "grouped", "single"],
            "calls": ["print"],
        },
        "hints": [
            "Tuple из двух значений записывается через запятую. Имена слева при распаковке тоже перечисляются в порядке значений.",
            "Скобки вокруг одного значения его не меняют. Чтобы создать tuple из одного элемента, оставим запятую перед закрывающей скобкой.",
            "Печатаем каждый результат, чтобы сравнить строку с tuple, не опираясь на объяснение.",
        ],
        "starter_code": (
            "route = (start_place, start_place)  # Исправьте: вторым должно быть end_place\n"
            "start, finish = route\n"
            "grouped = (single_place,)  # Исправьте: для строки уберите запятую\n"
            "single = (single_place)  # Исправьте: для tuple добавьте запятую\n"
            "print(route)\n"
            "print(start)\n"
            "print(finish)\n"
            "print(grouped)\n"
            "print(single)\n"
        ),
        "tests": [
            {
                "name": "Два разных места",
                "namespace": {"start_place": "Парк", "end_place": "Берег", "single_place": "Маяк"},
                "expected": "('Парк', 'Берег')\nПарк\nБерег\nМаяк\n('Маяк',)",
                "assert": "stdout",
            },
            {
                "name": "Новые исходные строки",
                "namespace": {"start_place": "Север", "end_place": "Юг", "single_place": "Площадь"},
                "expected": "('Север', 'Юг')\nСевер\nЮг\nПлощадь\n('Площадь',)",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "route = (start_place, end_place)\n"
            "start, finish = route\n"
            "grouped = (single_place)\n"
            "single = (single_place,)\n"
            "print(route)\n"
            "print(start)\n"
            "print(finish)\n"
            "print(grouped)\n"
            "print(single)\n"
        ),
    },
    {
        "title": "Оставим только уникальные названия",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт список названий с возможными повторами. Получим множество разных названий и проверим наличие двух значений, не полагаясь на порядок печати.",
        "contract": {
            "given": "Переменные place_names, wanted_place и missing_place содержат готовые значения. Список может быть пустым.",
            "given_items": [
                "place_names содержит названия, в том числе возможные повторы.",
                "wanted_place есть в списке, если он не пустой.",
                "missing_place отсутствует в списке.",
            ],
            "todo": "Сохраним множество в unique_places, затем выведем число уникальных названий и результаты двух проверок принадлежности.",
            "todo_items": [
                "Создайте unique_places из place_names.",
                "Выведите количество уникальных названий.",
                "Проверьте через in, есть ли wanted_place и missing_place.",
            ],
            "check": "Проверка использует повторы, пустой и одноэлементный список. Критерий сравнивает число и членство, а не печатный порядок set.",
        },
        "requirements": {
            "items": [
                "Set создаётся из исходного списка.",
                "Повторные строки представлены одним значением.",
                "Проверяются присутствующее и отсутствующее значения.",
            ],
            "names": ["place_names", "wanted_place", "missing_place", "unique_places"],
            "calls": ["set", "len", "print"],
        },
        "hints": [
            "Вызов set получает исходную последовательность и создаёт коллекцию уникальных значений.",
            "Для количества используем знакомую len. Для двух вопросов о наличии применяем in.",
            "Не печатаем set для точного сравнения строк: проверка оценивает состав и членство.",
        ],
        "starter_code": (
            "unique_places = set()  # Проверим, как получить множество из исходного списка\n"
            "print(len(unique_places))\n"
            "print(wanted_place in unique_places)\n"
            "print(missing_place in unique_places)\n"
        ),
        "tests": [
            {
                "name": "Повторные и разные названия",
                "namespace": {
                    "place_names": ["Парк", "Берег", "Парк", "Маяк"],
                    "wanted_place": "Берег",
                    "missing_place": "Сад",
                },
                "expected": "3\nTrue\nFalse",
                "assert": "stdout",
            },
            {
                "name": "Пустой список",
                "namespace": {"place_names": [], "wanted_place": "Берег", "missing_place": "Сад"},
                "expected": "0\nFalse\nFalse",
                "assert": "stdout",
            },
            {
                "name": "Один повторяющийся вид",
                "namespace": {
                    "place_names": ["Площадь", "Площадь", "Площадь"],
                    "wanted_place": "Площадь",
                    "missing_place": "Мост",
                },
                "expected": "1\nTrue\nFalse",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "unique_places = set(place_names)\n"
            "print(len(unique_places))\n"
            "print(wanted_place in unique_places)\n"
            "print(missing_place in unique_places)\n"
        ),
    },
    {
        "title": "Изменим множество по заданному правилу",
        "level": "easy",
        "mode": "script",
        "prompt": "Платформа задаёт исходный список и три названия для изменения. Добавим одно значение, удалим присутствующее и допустим отсутствие для discard.",
        "contract": {
            "given": "initial_places содержит исходные названия; add_place и remove_place заданы так, чтобы удаляемое значение присутствовало; optional_place может быть в множестве или отсутствовать.",
            "given_items": [
                "initial_places содержит исходные названия, иногда с повторами.",
                "remove_place точно есть в начальном множестве.",
                "optional_place может быть или не быть в множестве.",
            ],
            "todo": "Создадим places, применим add, remove и discard, затем выведем членство трёх значений и итоговое количество уникальных элементов.",
            "todo_items": [
                "Создайте множество places из initial_places.",
                "Добавьте add_place, удалите remove_place, затем вызовите discard для optional_place.",
                "Выведите проверки членства этих трёх значений и длину places.",
            ],
            "check": "Проверка охватывает новое и уже существующее добавление, присутствующее и отсутствующее значение для discard, а также повторы в исходном списке.",
        },
        "requirements": {
            "items": [
                "Исходный список преобразуется в set.",
                "Все три изменения применяются к одному множеству.",
                "Удаляемое значение присутствует до вызова remove.",
                "Результат проверяется через принадлежность и количество.",
            ],
            "names": ["initial_places", "add_place", "remove_place", "optional_place", "places"],
            "calls": ["set", "print", "len"],
            "attributes": ["add", "remove", "discard"],
        },
        "hints": [
            "Сначала создаём set, чтобы исходный список остался доступен без изменений.",
            "Добавляем новое или уже присутствующее значение, затем вызываем remove только для заданного присутствующего.",
            "Значение для discard может отсутствовать. Проверяем итог через in и len, а не по порядку печати.",
        ],
        "starter_code": (
            "places = set(initial_places)\n"
            "places.add(add_place)\n"
            "# Здесь мы удалим remove_place и отдельно обработаем optional_place\n"
            "print(add_place in places)\n"
            "print(remove_place in places)\n"
            "print(optional_place in places)\n"
            "print(len(places))\n"
        ),
        "tests": [
            {
                "name": "Добавляем, удаляем и пропускаем отсутствующее",
                "namespace": {
                    "initial_places": ["Парк", "Берег", "Берег"],
                    "add_place": "Маяк",
                    "remove_place": "Берег",
                    "optional_place": "Сад",
                },
                "expected": "True\nFalse\nFalse\n2",
                "assert": "stdout",
            },
            {
                "name": "Повторное добавление и удаление присутствующего",
                "namespace": {
                    "initial_places": ["Парк", "Парк", "Сад", "Маяк"],
                    "add_place": "Парк",
                    "remove_place": "Сад",
                    "optional_place": "Маяк",
                },
                "expected": "True\nFalse\nFalse\n1",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "places = set(initial_places)\n"
            "places.add(add_place)\n"
            "places.remove(remove_place)\n"
            "places.discard(optional_place)\n"
            "print(add_place in places)\n"
            "print(remove_place in places)\n"
            "print(optional_place in places)\n"
            "print(len(places))\n"
        ),
    },
    {
        "title": "Сравним разность в двух направлениях",
        "level": "easy",
        "mode": "script",
        "prompt": "Два готовых списка описывают разные маршруты. Найдём, какие названия есть только в первом и только во втором.",
        "contract": {
            "given": "first_places и second_places содержат названия с возможными повторами. Платформа задаёт ожидаемые множества для каждого направления разности.",
            "given_items": [
                "first_places и second_places содержат остановки двух маршрутов.",
                "Платформа задаёт ожидаемые множества expected_first_only и expected_second_only.",
            ],
            "todo": "Создадим множества маршрутов, найдём значения только первого и только второго, затем сравним обе разности с ожидаемым составом.",
            "todo_items": [
                "Создайте множества first и second.",
                "Получите first_only и second_only разностями в двух направлениях.",
                "Сравните результаты с expected_first_only и expected_second_only, затем выведите два ответа.",
            ],
            "check": "Проверка использует разные пересечения, повторы и пустые наборы. Порядок элементов не является частью результата.",
        },
        "requirements": {
            "items": [
                "Оба исходных списка преобразуются в множества.",
                "Разность сохраняет значения первого набора, которых нет во втором.",
                "Обратная разность сохраняет значения второго набора, которых нет в первом.",
                "Обе разности сравниваются с ожидаемыми множествами.",
            ],
            "names": [
                "first_places",
                "second_places",
                "expected_first_only",
                "expected_second_only",
                "first_only",
                "second_only",
            ],
            "calls": ["set", "print"],
        },
        "hints": [
            "Сначала преобразуем оба списка: повторения не должны влиять на наборы.",
            "first - second оставляет только значения первого набора. Для второго направления поменяем наборы местами.",
            "Сравниваем set с ожидаемым set. Не сортируем ответ и не проверяем порядок печати.",
        ],
        "starter_code": (
            "first = set(first_places)\n"
            "second = set(second_places)\n"
            "first_only = first  # Исправьте: оставьте значения first, которых нет в second\n"
            "second_only = second  # Исправьте: оставьте значения second, которых нет в first\n"
            "print(first_only == expected_first_only)\n"
            "print(second_only == expected_second_only)\n"
        ),
        "tests": [
            {
                "name": "Два маршрута с одной общей остановкой",
                "namespace": {
                    "first_places": ["Парк", "Берег", "Парк"],
                    "second_places": ["Берег", "Маяк"],
                    "expected_first_only": {"Парк"},
                    "expected_second_only": {"Маяк"},
                },
                "expected": "True\nTrue",
                "assert": "stdout",
            },
            {
                "name": "Нет общих остановок",
                "namespace": {
                    "first_places": ["Север", "Юг"],
                    "second_places": ["Восток"],
                    "expected_first_only": {"Север", "Юг"},
                    "expected_second_only": {"Восток"},
                },
                "expected": "True\nTrue",
                "assert": "stdout",
            },
            {
                "name": "Пустой первый маршрут",
                "namespace": {
                    "first_places": [],
                    "second_places": ["Маяк", "Маяк"],
                    "expected_first_only": set(),
                    "expected_second_only": {"Маяк"},
                },
                "expected": "True\nTrue",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "first = set(first_places)\n"
            "second = set(second_places)\n"
            "first_only = first - second\n"
            "second_only = second - first\n"
            "print(first_only == expected_first_only)\n"
            "print(second_only == expected_second_only)\n"
        ),
    },
    {
        "title": "Выберем коллекцию для двух требований",
        "level": "easy",
        "mode": "script",
        "prompt": "Для одного результата важно сохранить начало перед концом. Для другого важны только разные названия. Подберём структуру под каждое требование.",
        "contract": {
            "given": "Платформа задаёт first_stop, last_stop, список place_names, ожидаемую пару expected_route и ожидаемое множество expected_unique.",
            "given_items": [
                "first_stop и last_stop задают начало и конец маршрута.",
                "place_names содержит названия с возможными повторами.",
                "Платформа задаёт ожидаемые route и unique-множество.",
            ],
            "todo": "Сохраним первую пару в route_pair, а уникальные названия в unique_places, затем сравним оба результата по составу и порядку, когда он важен.",
            "todo_items": [
                "Создайте tuple route_pair, сохранив first_stop перед last_stop.",
                "Создайте unique_places, оставив в нём по одному экземпляру каждого названия.",
                "Сравните оба результата с ожидаемыми значениями и выведите ответы.",
            ],
            "check": "Проверка меняет исходные строки и повторы. Пара сравнивается как tuple, множество как set.",
        },
        "requirements": {
            "items": [
                "Tuple хранит первое значение перед вторым.",
                "Set оставляет только уникальные названия.",
                "Оба результата сравниваются со значениями платформы.",
            ],
            "names": [
                "first_stop",
                "last_stop",
                "place_names",
                "expected_route",
                "expected_unique",
                "route_pair",
                "unique_places",
            ],
            "calls": ["set", "print"],
        },
        "hints": [
            "Сначала читаем условие пары: порядок двух ролей важен, поэтому сохраняем оба значения как tuple.",
            "Для списка, в котором нужны только разные названия, получаем set.",
            "Пара и ожидаемый tuple сравниваем с учётом позиций; множества сравниваем по уникальному составу.",
        ],
        "starter_code": (
            "route_pair = (last_stop, first_stop)  # Исправьте: сначала должно быть начало\n"
            "unique_places = place_names  # Преобразуйте список в set, чтобы убрать повторы\n"
            "print(route_pair == expected_route)\n"
            "print(unique_places == expected_unique)\n"
        ),
        "tests": [
            {
                "name": "Пара и повторы в списке",
                "namespace": {
                    "first_stop": "Парк",
                    "last_stop": "Берег",
                    "place_names": ["Парк", "Маяк", "Парк"],
                    "expected_route": ("Парк", "Берег"),
                    "expected_unique": {"Парк", "Маяк"},
                },
                "expected": "True\nTrue",
                "assert": "stdout",
            },
            {
                "name": "Другой маршрут",
                "namespace": {
                    "first_stop": "Север",
                    "last_stop": "Юг",
                    "place_names": ["Мост", "Сад", "Мост", "Площадь"],
                    "expected_route": ("Север", "Юг"),
                    "expected_unique": {"Мост", "Сад", "Площадь"},
                },
                "expected": "True\nTrue",
                "assert": "stdout",
            },
        ],
        "reference_code": (
            "route_pair = (first_stop, last_stop)\n"
            "unique_places = set(place_names)\n"
            "print(route_pair == expected_route)\n"
            "print(unique_places == expected_unique)\n"
        ),
    },
]

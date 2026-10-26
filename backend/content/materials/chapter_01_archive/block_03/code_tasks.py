from typing import Any

CODE_TASKS: dict[int | str, list[dict[str, Any]]] = {
    11: [
        {
            "title": "Изменяем список и читаем результат pop",
            "level": "easy",
            "mode": "script",
            "prompt": (
                "В программе заданы values, replacement, added, target и absent. Добавим added одним элементом, "
                "заменим позицию 0, сохраним результат pop(1), а remove вызовем только после проверки наличия target. "
                "Выведем изменённый список, удалённое значение, длину списка и проверку отсутствия absent."
            ),
            "contract": {
                "given": "values содержит не менее трёх целых чисел; added является отдельным списком. Остальные имена содержат значения для операций и проверки.",
                "todo": "Последовательно добавим один объект, заменим существующую позицию, удалим элемент по индексу и безопасно удалим первое совпадение target.",
                "check": "Два набора данных проверяют повторяющееся значение и отсутствующее target. Вывод показывает конечное состояние и результат pop.",
            },
            "requirements": {
                "items": [
                    "Список получает added одним элементом, позиция 0 заменяется, а результат pop(1) сохраняется в removed",
                    "remove применяется только при наличии target и удаляет первое совпадение",
                    "В конце выводятся values, removed, длина списка и результат проверки absent not in values",
                ],
                "calls": ["print", "len"],
                "attributes": ["append", "pop", "remove"],
                "nodes": ["If"],
            },
            "hints": [
                "Сохраним порядок операций: добавление, замена, pop, затем условное удаление.",
                "append добавляет объект целиком; здесь added сам является списком.",
                "Для последнего значения сравним результат проверки absent not in values с True.",
            ],
            "starter_code": (
                "# values, replacement, added, target и absent уже заданы\n"
                "# Выполним операции и выведем их результат\n"
            ),
            "tests": [
                {
                    "name": "повторы и удаление первого совпадения",
                    "namespace": {
                        "values": [1, 15, 15, 15, 40],
                        "replacement": 2,
                        "added": [25, 35],
                        "target": 15,
                        "absent": 99,
                    },
                    "expected": "[2, 15, 40, [25, 35]]\n15\n4\nTrue",
                    "assert": "stdout",
                },
                {
                    "name": "target отсутствует",
                    "namespace": {
                        "values": [8, 2, 9],
                        "replacement": 4,
                        "added": ["extra"],
                        "target": 12,
                        "absent": 2,
                    },
                    "expected": "[4, 9, ['extra']]\n2\n3\nTrue",
                    "assert": "stdout",
                },
            ],
            "reference_code": (
                "values.append(added)\n"
                "values[0] = replacement\n"
                "removed = values.pop(1)\n"
                "if target in values:\n"
                "    values.remove(target)\n"
                "print(values)\n"
                "print(removed)\n"
                "print(len(values))\n"
                "print(absent not in values)\n"
            ),
        }
    ],
    "11.1": [
        {
            "title": "Сравниваем кортеж и множество",
            "level": "easy",
            "mode": "script",
            "prompt": (
                "Программа получает список values с повторяющимся значением. Вывод показывает упорядоченный результат, число уникальных значений, наличие 7 и исходный список после преобразования."
            ),
            "contract": {
                "given": "В редакторе подготовлен список values = [7, 2, 7, 4].",
                "todo": "Программа показывает оба представления, результаты проверок и исходный список.",
                "check": "Проверка подтверждает порядок и повторы в ordered, количество разных значений, наличие 7 и сохранность values.",
            },
            "requirements": {
                "items": [
                    "ordered получается из values вызовом tuple.",
                    "unique получается из values вызовом set.",
                    "Наличие 7 проверяется оператором in.",
                ],
                "calls": ["tuple", "set", "len", "print"],
            },
            "hints": [
                "Сначала назовём свойства исходного списка: порядок, повторы и возможность изменения.",
                "Для сравнения используем порядок кортежа, а уникальность множества проверим длиной и принадлежностью.",
                "Отдельно выведем исходный список после преобразований.",
            ],
            "starter_code": (
                "values = [7, 2, 7, 4]\n"
                "\n"
                "# Создадим ordered и unique, затем выведем результаты проверок\n"
            ),
            "tests": [
                {
                    "name": "повтор и исходный список",
                    "expected": "(7, 2, 7, 4)\n3\nTrue\n[7, 2, 7, 4]",
                    "assert": "stdout",
                }
            ],
            "reference_code": (
                "values = [7, 2, 7, 4]\n"
                "ordered = tuple(values)\n"
                "unique = set(values)\n"
                "print(ordered)\n"
                "print(len(unique))\n"
                "print(7 in unique)\n"
                "print(values)\n"
            ),
        },
        {
            "title": "Исправляем выбор операции",
            "level": "easy",
            "mode": "script",
            "prompt": (
                "В завершённой программе ordered допускает замену значения по позиции, а unique сохраняет только разные значения. Вывод показывает новое упорядоченное содержимое, размер множества и наличие 20."
            ),
            "contract": {
                "given": "Изначально ordered содержит кортеж (12, 18), а unique множество {12, 18}.",
                "todo": "После исправления первое значение ordered равно 20, а unique содержит 20.",
                "check": "Программа выводит [20, 18], число 3 и True. Проверка не зависит от порядка вывода множества.",
            },
            "requirements": {
                "items": [
                    "Для замены позиции используется изменяемый список.",
                    "Новое уникальное значение добавляется методом множества add.",
                    "Порядок элементов множества не входит в результат.",
                ],
                "calls": ["len", "print"],
            },
            "hints": [
                "Сопоставим каждую операцию с требованием: заменить позицию или добавить уникальное значение.",
                "Первое исправление должно дать возможность замены по индексу, второе использует метод множества.",
                "Запустим ещё раз после первой ошибки, чтобы увидеть и проверить следующую операцию.",
            ],
            "starter_code": (
                "ordered = (12, 18)\n"
                "ordered[0] = 20\n"
                "\n"
                "unique = {12, 18}\n"
                "unique[0] = 20\n"
                "\n"
                "print(ordered)\n"
                "print(len(unique))\n"
                "print(20 in unique)\n"
            ),
            "tests": [
                {
                    "name": "замена и добавление",
                    "expected": "[20, 18]\n3\nTrue",
                    "assert": "stdout",
                }
            ],
            "reference_code": (
                "ordered = [12, 18]\n"
                "ordered[0] = 20\n"
                "\n"
                "unique = {12, 18}\n"
                "unique.add(20)\n"
                "\n"
                "print(ordered)\n"
                "print(len(unique))\n"
                "print(20 in unique)\n"
            ),
        },
        {
            "title": "Разделяем и соединяем строки",
            "level": "easy",
            "mode": "script",
            "prompt": (
                "Программа получает строки text и raw_fields. Она разделяет text по группам пробелов, raw_fields по символу | и соединяет слова строкой-разделителем \" / \". Пустой результат отображается как <empty>."
            ),
            "contract": {
                "given": "Редактор передаёт строки text и raw_fields; они могут быть пустыми, пробельными или содержать соседние разделители.",
                "todo": "Вывод содержит два результата разбиения и соединённую строку.",
                "check": "Результаты показывают нормализацию пробелов, сохранение пустых полей у явного разделителя и обработку пустого joined.",
            },
            "requirements": {
                "items": [
                    "Для пробельной строки используется split без аргумента.",
                    "Для raw_fields задан явный разделитель |.",
                    "Слова соединяются строкой-разделителем \" / \".",
                ],
                "calls": ["print"],
                "attributes": ["split", "join"],
            },
            "hints": [
                "Для пробельного текста начнём с split без аргумента.",
                "Для raw_fields передадим символ | явно, тогда соседние разделители сохранят пустое поле.",
                "Строка-разделитель вызывает join; пустое соединение сравним с пустой строкой.",
            ],
            "starter_code": (
                "# text и raw_fields уже созданы\n"
                "# Разделим строки, соединим words и выведем результаты\n"
            ),
            "tests": [
                {
                    "name": "пробелы и пустые поля",
                    "namespace": {"text": "  code   review  ", "raw_fields": "python|sql||"},
                    "expected": "['code', 'review']\n['python', 'sql', '', '']\ncode / review",
                    "assert": "stdout",
                },
                {
                    "name": "пустой текст и соседние разделители",
                    "namespace": {"text": "   ", "raw_fields": "a||b"},
                    "expected": "[]\n['a', '', 'b']\n<empty>",
                    "assert": "stdout",
                },
                {
                    "name": "пустые строки",
                    "namespace": {"text": "", "raw_fields": ""},
                    "expected": "[]\n['']\n<empty>",
                    "assert": "stdout",
                },
            ],
            "reference_code": (
                "words = text.split()\n"
                "fields = raw_fields.split('|')\n"
                "joined = ' / '.join(words)\n"
                "print(words)\n"
                "print(fields)\n"
                "if joined != '':\n"
                "    print(joined)\n"
                "else:\n"
                "    print('<empty>')\n"
            ),
        },
        {
            "title": "Распаковываем последовательность пар",
            "level": "easy",
            "mode": "script",
            "prompt": (
                "Каждая запись pairs содержит название и целое число минут. Программа выводит одну строку вида \"Python: 25 мин.\" для каждой пары; пустой список не даёт строк."
            ),
            "contract": {
                "given": "Каждый элемент pairs содержит ровно два значения: строку и целое число.",
                "todo": "Для каждой исходной записи появляется одна строка, порядок остаётся прежним.",
                "check": "Проверяются повторные названия, пустой список и отдельная пара.",
            },
            "requirements": {
                "items": [
                    "Два значения каждой записи распаковываются в заголовке одного цикла for.",
                    "В выводе используются оба значения текущей пары.",
                ],
                "nodes": ["For"],
            },
            "hints": [
                "В каждом элементе pairs значения идут в одном и том же порядке.",
                "Запишем два имени в заголовке одного цикла for.",
                "Проверим одну пару и пустой список: пустое тело цикла не печатает строк.",
            ],
            "starter_code": (
                "# pairs уже создан\n"
                "# Пройдём пары одним циклом и выведем их значения\n"
            ),
            "tests": [
                {
                    "name": "пары с повтором",
                    "namespace": {"pairs": [("Python", 25), ("Python", 25), ("SQL", 30)]},
                    "expected": "Python: 25 мин.\nPython: 25 мин.\nSQL: 30 мин.",
                    "assert": "stdout",
                },
                {
                    "name": "пустой список",
                    "namespace": {"pairs": []},
                    "expected": "",
                    "assert": "stdout",
                },
                {
                    "name": "одна пара",
                    "namespace": {"pairs": [("Git", 15)]},
                    "expected": "Git: 15 мин.",
                    "assert": "stdout",
                },
            ],
            "reference_code": (
                "for title, minutes in pairs:\n"
                "    print(f'{title}: {minutes} мин.')\n"
            ),
        },
        {
            "title": "Диагностируем длину пары",
            "level": "easy",
            "mode": "script",
            "prompt": (
                "В списке pairs есть запись SQL с длительностью 30 и лишним третьим значением. В согласованном варианте запись соответствует двум полям, а программа выводит SQL: 30 мин.; причина ошибки устранена в данных, а не скрыта."
            ),
            "contract": {
                "given": "В исходных данных одна учебная запись содержит название SQL, число 30 и лишнее значение.",
                "todo": "В итоговом pairs каждая запись соответствует договору «название и длительность».",
                "check": "После исправления появляется одна строка SQL: 30 мин.; ошибка распаковки не скрывается.",
            },
            "requirements": {
                "items": [
                    "Причина определяется сравнением числа значений и имён.",
                    "Исправляется запись в источнике данных.",
                    "Для диагностики не используется try/except.",
                ],
                "calls": ["print"],
                "nodes": ["For"],
            },
            "hints": [
                "Сравним число значений в кортеже с числом имён в заголовке цикла.",
                "Уберём из данных лишнее значение, которое не входит в договор пары.",
                "После исправления снова запустим тот же цикл и проверим строку результата.",
            ],
            "starter_code": (
                "pairs = [(\"SQL\", 30, \"лишнее значение\")]\n"
                "for title, minutes in pairs:\n"
                "    print(f'{title}: {minutes} мин.')\n"
            ),
            "tests": [
                {
                    "name": "исправленная пара",
                    "expected": "SQL: 30 мин.",
                    "assert": "stdout",
                }
            ],
            "reference_code": (
                "pairs = [(\"SQL\", 30)]\n"
                "for title, minutes in pairs:\n"
                "    print(f'{title}: {minutes} мин.')\n"
            ),
        },
        {
            "title": "Сопоставляем позицию и элемент",
            "level": "easy",
            "mode": "script",
            "prompt": (
                "Программа печатает позицию каждого topic начиная с 1 и его значение. Повторы получают разные позиции, пустой список не даёт строк, а номер используется только для этого вывода."
            ),
            "contract": {
                "given": "Редактор передаёт topics с повторами, одним элементом или без элементов.",
                "todo": "Строки показывают каждую тему вместе с отображаемым номером от 1.",
                "check": "Проверяются позиции с 1 для повторов и одного элемента, а пустой список даёт пустой вывод.",
            },
            "requirements": {
                "items": [
                    "Пара позиции и значения формируется через enumerate(topics, start=1).",
                    "position выводится рядом с текущим topic.",
                    "Позиция относится к текущему обходу и не становится id задачи.",
                ],
                "calls": ["enumerate", "print"],
            },
            "hints": [
                "Сопоставим ручной счётчик и текущий элемент с двумя значениями каждой пары.",
                "Позицию запишем первой, название второй, а начало зададим равным 1.",
                "После проверки пустого и повторного списка проверим две независимые сессии прежнего calc.",
            ],
            "starter_code": (
                "# topics уже создан\n"
                "counter = 1\n"
                "for topic in topics:\n"
                "    print(counter, topic)\n"
                "    counter += 1\n"
            ),
            "tests": [
                {
                    "name": "повторяющиеся элементы",
                    "namespace": {"topics": ["Python", "Python", "SQL"]},
                    "expected": "1: Python\n2: Python\n3: SQL",
                    "assert": "stdout",
                },
                {
                    "name": "один элемент",
                    "namespace": {"topics": ["Git"]},
                    "expected": "1: Git",
                    "assert": "stdout",
                },
                {
                    "name": "пустой список",
                    "namespace": {"topics": []},
                    "expected": "",
                    "assert": "stdout",
                },
            ],
            "reference_code": (
                "for position, topic in enumerate(topics, start=1):\n"
                "    print(f'{position}: {topic}')\n"
            ),
        },
    ],
    12: [
        {
            "title": "Полная запись одной задачи",
            "level": "easy",
            "mode": "script",
            "prompt": (
                "task содержит четыре обязательных поля; два последовательных вывода показывают исходное и новое состояние is_done."
            ),
            "contract": {
                "given": "Платформа задаёт положительный task_id, непустую строку title, priority от 1 до 5 и bool new_done.",
                "todo": "Созданная запись содержит полный договор полей, а присваивание new_done меняет только is_done.",
                "todo_items": [
                    "task содержит id, title, priority и is_done=False.",
                    "Первый блок вывода показывает значения четырёх полей по порядку.",
                    "После присваивания new_done второй блок показывает новое is_done; id, title и priority сохраняются.",
                ],
                "check": "Тесты проверяют начальное состояние и состояние после присваивания new_done на двух наборах данных; id, title и priority остаются прежними.",
            },
            "requirements": {
                "names": ["task_id", "title", "priority", "new_done", "task"],
                "calls": ["print"],
                "nodes": ["Dict"],
            },
            "hints": [
                "Сопоставим имена ключей договора с переменными из стартового кода.",
                "Прочитаем task по четырём обязательным ключам в указанном порядке.",
                "После первого вывода заменим значение только в поле is_done и повторим те же чтения.",
            ],
            "starter_code": (
                "# task_id, title, priority и new_done уже заданы\n"
                "# Создадим запись и выведем её поля до и после изменения is_done\n"
            ),
            "tests": [
                {
                    "name": "флаг становится True",
                    "namespace": {
                        "task_id": 10,
                        "title": "Проверить план",
                        "priority": 3,
                        "new_done": True,
                    },
                    "expected": (
                        "10\nПроверить план\n3\nFalse\n"
                        "10\nПроверить план\n3\nTrue"
                    ),
                    "assert": "stdout",
                },
                {
                    "name": "флаг остаётся False",
                    "namespace": {
                        "task_id": 22,
                        "title": "Записать вывод",
                        "priority": 1,
                        "new_done": False,
                    },
                    "expected": (
                        "22\nЗаписать вывод\n1\nFalse\n"
                        "22\nЗаписать вывод\n1\nFalse"
                    ),
                    "assert": "stdout",
                },
            ],
            "reference_code": (
                "task = {'id': task_id, 'title': title, 'priority': priority, 'is_done': False}\n"
                "print(task['id'])\n"
                "print(task['title'])\n"
                "print(task['priority'])\n"
                "print(task['is_done'])\n"
                "task['is_done'] = new_done\n"
                "print(task['id'])\n"
                "print(task['title'])\n"
                "print(task['priority'])\n"
                "print(task['is_done'])\n"
            ),
        },
        {
            "title": "Повторный ключ и проверка принадлежности",
            "level": "easy",
            "mode": "script",
            "prompt": (
                "settings хранит последнее значение повторно заданного ключа; in проверяет наличие ключа, а не значения."
            ),
            "contract": {
                "given": "В словаре settings ключ theme записан со значениями light и dark.",
                "todo": "settings содержит последнее значение theme, а два результата in показывают проверку ключа и значения.",
                "todo_items": [
                    "После повторной записи theme словарь содержит одно значение dark.",
                    "Вывод settings показывает итоговый словарь; проверки theme in settings и dark in settings дают True и False.",
                ],
                "check": "Проверяется вывод {'theme': 'dark'}, затем True для ключа theme и False для значения dark.",
            },
            "requirements": {
                "calls": ["print"],
                "nodes": ["Dict"],
            },
            "hints": [
                "Повторный ключ не создаёт второе поле; перед запуском оставим в прогнозе последнее значение.",
                "Оператор in для словаря проверяет ключи, поэтому проверим и ключ, и строку-значение.",
            ],
            "starter_code": (
                "# Создадим словарь с повторным ключом и проверим его содержимое\n"
            ),
            "tests": [
                {
                    "name": "повторный ключ и in",
                    "expected": "{'theme': 'dark'}\nTrue\nFalse",
                    "assert": "stdout",
                }
            ],
            "reference_code": (
                "settings = {'theme': 'light', 'theme': 'dark'}\n"
                "print(settings)\n"
                "print('theme' in settings)\n"
                "print('dark' in settings)\n"
            ),
        },
        {
            "title": "Обязательный ключ и KeyError",
            "level": "easy",
            "mode": "script",
            "prompt": (
                "Чтение created['title'] успешно после исправления опечатки в обязательном ключе при создании записи."
            ),
            "contract": {
                "given": "В created ключ title записан с опечаткой titel.",
                "todo": "Ключ created совпадает с обязательным именем title, поэтому чтение через [] выводит значение поля.",
                "todo_items": [
                    "created содержит точный ключ title, который запрашивает программа.",
                    "Чтение created['title'] выводит значение Проверить план.",
                ],
                "check": "Единственная строка вывода — Проверить план.",
            },
            "requirements": {
                "calls": ["print"],
                "nodes": ["Dict"],
            },
            "hints": [
                "Сопоставим точное написание ключа в created с именем, которое запрашивает чтение.",
                "Обязательный ключ исправим в месте создания записи.",
            ],
            "starter_code": (
                "created = {'titel': 'Проверить план'}\n"
                "print(created['title'])\n"
            ),
            "tests": [
                {
                    "name": "ключ после исправления producer",
                    "expected": "Проверить план",
                    "assert": "stdout",
                }
            ],
            "reference_code": (
                "created = {'title': 'Проверить план'}\n"
                "print(created['title'])\n"
            ),
        },
        {
            "title": "Чтение существующей и отсутствующей настройки",
            "level": "easy",
            "mode": "script",
            "prompt": (
                "settings содержит notifications=False и не содержит theme; [] и get() показывают различие между сохранённым False и отсутствующим ключом."
            ),
            "contract": {
                "given": "В settings есть notifications=False и нет theme.",
                "todo": "Ключ notifications хранит False, а theme отсутствует; запасное значение для theme появляется только в результате чтения через get().",
                "todo_items": [
                    "settings['notifications'] и settings.get('notifications', True) возвращают False.",
                    "settings.get('theme') возвращает None, а settings.get('theme', 'system') возвращает system.",
                    "Проверка 'theme' in settings возвращает False; исходный settings остаётся без изменений.",
                ],
                "check": "Тест проверяет вывод False, False, None, system, False и неизменный settings={'notifications': False}.",
            },
            "requirements": {
                "calls": ["print"],
                "attributes": ["get"],
                "nodes": ["Dict"],
            },
            "hints": [
                "Для существующего ключа get() возвращает записанное False, даже если передан default=True.",
                "Для отсутствующего theme сравним get() без default и с default.",
                "В конце проверим in и напечатаем исходный словарь.",
            ],
            "starter_code": (
                "settings = {'notifications': False}\n"
                "# Прочитаем существующее и отсутствующее значения, затем выведем словарь\n"
            ),
            "tests": [
                {
                    "name": "значение False и отсутствующее поле",
                    "expected": "False\nFalse\nNone\nsystem\nFalse\n{'notifications': False}",
                    "assert": "stdout",
                }
            ],
            "reference_code": (
                "settings = {'notifications': False}\n"
                "print(settings['notifications'])\n"
                "print(settings.get('notifications', True))\n"
                "print(settings.get('theme'))\n"
                "print(settings.get('theme', 'system'))\n"
                "print('theme' in settings)\n"
                "print(settings)\n"
            ),
        },
        {
            "title": "Общая ссылка и копия задачи",
            "level": "easy",
            "mode": "script",
            "prompt": (
                "Изменение draft влияет только на копию задачи; alias остаётся общей ссылкой на исходный словарь."
            ),
            "contract": {
                "given": "Создадим полную задачу с id=10, title=Проверить план, priority=3 и is_done=False.",
                "todo": "task и alias сохраняют False, draft получает True; проверка is различает общий объект и копию.",
                "todo_items": [
                    "alias и task указывают на один словарь, а draft создан через task.copy().",
                    "У draft поле is_done равно True, а исходное поле остаётся False.",
                    "Вывод флагов равен False False True, а task is alias и task is draft дают True и False.",
                ],
                "check": "Тест проверяет вывод False False True и результаты идентичности True False.",
            },
            "requirements": {
                "calls": ["print"],
                "attributes": ["copy"],
                "nodes": ["Dict"],
            },
            "hints": [
                "Перед изменением сохраним исходный словарь под двумя именами и отдельно вызовем copy().",
                "После изменения прочитаем is_done через task, alias и draft.",
            ],
            "starter_code": (
                "# Создадим полную запись, alias и копию, затем сравним их состояние\n"
            ),
            "tests": [
                {
                    "name": "независимость верхней копии",
                    "expected": "False False True\nTrue False",
                    "assert": "stdout",
                }
            ],
            "reference_code": (
                "task = {'id': 10, 'title': 'Проверить план', 'priority': 3, 'is_done': False}\n"
                "alias = task\n"
                "draft = task.copy()\n"
                "draft['is_done'] = True\n"
                "print(task['is_done'], alias['is_done'], draft['is_done'])\n"
                "print(task is alias, task is draft)\n"
            ),
        }
    ],
    13: [
        {
            "title": "Форматируем полную задачу",
            "level": "easy",
            "mode": "solve",
            "prompt": (
                "format_task(task) возвращает строку [<id>] <title> | приоритет: <priority> | <состояние> для "
                "полной модели задачи. Значение is_done определяет текст состояния, а id берётся из словаря, не из "
                "позиции списка. Адаптер solve(task) уже вызывает предметную функцию для проверки."
            ),
            "contract": {
                "given": (
                    "Автопроверка передаёт solve(task) полный словарь с ключами id, title, priority и is_done. "
                    "В стартовом коде solve(task) уже вызывает format_task(task)."
                ),
                "todo": (
                    "Функция format_task(task) возвращает строку вида "
                    "[10] Изучить SQL | приоритет: 3 | открыта по полям id, title, priority и is_done. "
                    "Исходный словарь остаётся прежним, а текст выводит вызывающий код."
                ),
                "check": (
                    "Проверяются оба значения is_done, приоритеты 1 и 5, точный id из словаря, неизменность входа "
                    "и отсутствие вывода из функции. solve(task) остаётся адаптером проверки."
                ),
            },
            "requirements": {
                "items": [
                    "format_task(task) возвращает строку через return, используя все четыре ключа",
                    "if/else и f-строка дают текст состояния и включают id, title и priority",
                    "formatter не вызывает print(), не меняет вход, а solve(task) остаётся только адаптером",
                ],
                "names": ["task", "format_task"],
                "calls": ["format_task"],
                "nodes": ["FunctionDef", "JoinedStr", "If"],
            },
            "hints": [
                "Сначала выберем по ключу is_done одно из двух текстовых состояний в локальную переменную.",
                "В f-строке возьмём id, title и priority по ключам словаря. Позиция записи здесь не нужна.",
                "Вернём строку из format_task: её проверит адаптер solve(task), а print останется снаружи.",
            ],
            "starter_code": (
                "def format_task(task):\n"
                "    pass\n"
                "\n"
                "def solve(task):\n"
                "    return format_task(task)\n"
            ),
            "tests": [
                {
                    "name": "открытая задача с минимальным приоритетом",
                    "args": [{"id": 21, "title": "Повторить цикл", "priority": 1, "is_done": False}],
                    "expected": "[21] Повторить цикл | приоритет: 1 | открыта",
                    "preserve_inputs": True,
                    "no_stdout": True,
                },
                {
                    "name": "выполненная задача с максимальным приоритетом",
                    "args": [{"id": 42, "title": "Изучить типы", "priority": 5, "is_done": True}],
                    "expected": "[42] Изучить типы | приоритет: 5 | выполнена",
                    "preserve_inputs": True,
                    "no_stdout": True,
                },
            ],
            "reference_code": (
                "def format_task(task):\n"
                "    if task['is_done']:\n"
                "        state = 'выполнена'\n"
                "    else:\n"
                "        state = 'открыта'\n"
                "    return f\"[{task['id']}] {task['title']} | приоритет: {task['priority']} | {state}\"\n"
                "\n"
                "def solve(task):\n"
                "    return format_task(task)\n"
            ),
        },
        {
            "title": "Восстановим обязательное поле у создателя записи",
            "level": "easy",
            "mode": "script",
            "prompt": (
                "Разберём traceback форматирования неполной записи. Установим, какая функция создала неверную модель, "
                "и восстановим обязательное поле там. Функция format_task должна читать согласованную модель напрямую, "
                "а не заменять пропуск запасным значением."
            ),
            "contract": {
                "given": (
                    "make_task возвращает словарь, который сразу передаётся в format_task. Модель задачи содержит "
                    "id, title, priority и is_done."
                ),
                "todo": "Вернём все обязательные поля из make_task и сохраним форматирование и исходные правила модели.",
                "check": "Функция выводит [7] Изучить SQL | приоритет: 3 | открыта.",
            },
            "requirements": {
                "items": [
                    "В traceback найдены строка проявления и кадры цепочки вызовов",
                    "Причина исправлена в make_task, который создаёт запись",
                    "format_task продолжает читать обязательное поле напрямую",
                    "Созданная запись содержит ровно id, title, priority и is_done",
                ],
                "names": ["make_task", "format_task", "task"],
                "calls": ["print"],
            },
            "hints": [
                "Начнём с последней строки traceback, затем найдём вызов format_task и источник task.",
                "Проверим ключи фактического словаря перед форматированием.",
                "Если поле обязательно по модели, вернём его в словарь, который создаётся раньше.",
            ],
            "starter_code": (
                "def make_task():\n"
                "    return {\n"
                "        'id': 7,\n"
                "        'title': 'Изучить SQL',\n"
                "        'is_done': False,\n"
                "    }\n"
                "\n"
                "def format_task(task):\n"
                "    if task['is_done']:\n"
                "        state = 'выполнена'\n"
                "    else:\n"
                "        state = 'открыта'\n"
                "    return f\"[{task['id']}] {task['title']} | приоритет: {task['priority']} | {state}\"\n"
                "\n"
                "def show_task():\n"
                "    task = make_task()\n"
                "    print(task)\n"
                "    print(format_task(task))\n"
                "\n"
                "show_task()\n"
            ),
            "tests": [
                {
                    "name": "полная модель форматируется",
                    "expected": (
                        "{'id': 7, 'title': 'Изучить SQL', 'priority': 3, 'is_done': False}\n"
                        "[7] Изучить SQL | приоритет: 3 | открыта"
                    ),
                    "assert": "stdout",
                }
            ],
            "reference_code": (
                "def make_task():\n"
                "    return {\n"
                "        'id': 7,\n"
                "        'title': 'Изучить SQL',\n"
                "        'priority': 3,\n"
                "        'is_done': False,\n"
                "    }\n"
                "\n"
                "def format_task(task):\n"
                "    if task['is_done']:\n"
                "        state = 'выполнена'\n"
                "    else:\n"
                "        state = 'открыта'\n"
                "    return f\"[{task['id']}] {task['title']} | приоритет: {task['priority']} | {state}\"\n"
                "\n"
                "def show_task():\n"
                "    task = make_task()\n"
                "    print(task)\n"
                "    print(format_task(task))\n"
                "\n"
                "show_task()\n"
            ),
        },
        {
            "title": "Не читаем локальное имя снаружи функции",
            "level": "easy",
            "mode": "script",
            "prompt": (
                "Функция создаёт локальное имя result, а следующая строка пытается прочитать его снаружи. "
                "Передадим значение по контракту функции и используем результат её вызова."
            ),
            "contract": {
                "given": "double получает целое число и вычисляет удвоенное значение в локальном имени result.",
                "todo": "Передадим число из функции и покажем результат вызова снаружи.",
                "check": "Для входа 4 программа печатает 8 без чтения локального имени за пределами функции.",
            },
            "requirements": {
                "items": [
                    "Локальное имя result не читается напрямую за пределами double",
                    "Функция возвращает вычисленное значение оператором return",
                    "Вызывающая строка получает значение через вызов функции",
                ],
                "names": ["double", "value", "result"],
                "calls": ["print"],
            },
            "hints": [
                "Локальное имя существует только внутри вызова, где оно присвоено.",
                "Функция может передать вычисленное значение через return.",
                "Снаружи печатаем результат вызова, а не локальное имя.",
            ],
            "starter_code": (
                "def double(value):\n"
                "    result = value * 2\n"
                "\n"
                "print(result)\n"
            ),
            "tests": [{"name": "функция передаёт значение наружу", "expected": "8", "assert": "stdout"}],
            "reference_code": (
                "def double(value):\n"
                "    result = value * 2\n"
                "    return result\n"
                "\n"
                "print(double(4))\n"
            ),
        },
        {
            "title": "Вернём сумму, а не None",
            "level": "easy",
            "mode": "script",
            "prompt": (
                "Сумма вычисляется, но calculate_study_minutes не передаёт её вызывающему коду. Проверим результат "
                "обычного и пустого входа, добавим возвращаемое значение и убедимся, что исходный список не меняется."
            ),
            "contract": {
                "given": "Функция получает последовательность длительностей и складывает её в локальном total.",
                "todo": "Сделаем вычисленную сумму результатом функции, включая пустой список.",
                "check": "Для [20, 35] напечатается 55, для [] напечатается 0, исходный список останется прежним.",
            },
            "requirements": {
                "items": [
                    "Вычисленная сумма возвращается из calculate_study_minutes",
                    "Пустой список даёт 0 внутри правила суммы, а не через подстановку вместо None",
                    "Список длительностей не меняется после вызова",
                ],
                "names": ["calculate_study_minutes", "durations", "total"],
                "calls": ["print"],
            },
            "hints": [
                "Если программа печатает None, проверим не только цикл, но и значение вызова функции.",
                "Проследим, на каком уровне закончился цикл и когда можно вернуть total.",
                "Сравним исходный список до и после вычисления.",
            ],
            "starter_code": (
                "def calculate_study_minutes(durations):\n"
                "    total = 0\n"
                "    for duration in durations:\n"
                "        total = total + duration\n"
                "\n"
                "durations = [20, 35]\n"
                "print(calculate_study_minutes(durations))\n"
                "print(calculate_study_minutes([]))\n"
                "print(durations)\n"
            ),
            "tests": [
                {
                    "name": "сумма, пустой список и сохранность входа",
                    "expected": "55\n0\n[20, 35]",
                    "assert": "stdout",
                }
            ],
            "reference_code": (
                "def calculate_study_minutes(durations):\n"
                "    total = 0\n"
                "    for duration in durations:\n"
                "        total = total + duration\n"
                "    return total\n"
                "\n"
                "durations = [20, 35]\n"
                "print(calculate_study_minutes(durations))\n"
                "print(calculate_study_minutes([]))\n"
                "print(durations)\n"
            ),
        },
        {
            "title": "Проверим обещание вернуть отдельную копию",
            "level": "medium",
            "mode": "script",
            "prompt": (
                "Функция with_new_title обещает вернуть обновлённую задачу, оставив исходную без изменений. "
                "Исправим именно это поведение и отдельно проверим исходное значение, новую запись и идентичность объектов."
            ),
            "contract": {
                "given": (
                    "В with_new_title передаётся плоский словарь с четырьмя полями. Сейчас функция изменяет его "
                    "на месте и возвращает тот же объект."
                ),
                "todo": (
                    "Вернём новый словарь с новым title и проверим отдельно исходное значение, возвращённое значение "
                    "и идентичность объектов."
                ),
                "check": (
                    "Исходная запись останется прежней, новая сохранит остальные три поля и будет отдельным объектом."
                ),
            },
            "requirements": {
                "items": [
                    "Исходная задача не изменяется функцией with_new_title",
                    "Возвращённая копия содержит все четыре поля, включая новый title",
                    "Исходный и возвращённый словари не являются одним объектом",
                ],
                "names": ["with_new_title", "task", "updated"],
                "calls": ["print"],
            },
            "hints": [
                "Сначала сравним title исходной записи до и после вызова.",
                "Проверим поля новой записи и выражение original is updated.",
            ],
            "starter_code": (
                "def with_new_title(task, title):\n"
                "    task['title'] = title\n"
                "    return task\n"
                "\n"
                "original = {\n"
                "    'id': 21,\n"
                "    'title': 'Повторить цикл',\n"
                "    'priority': 2,\n"
                "    'is_done': False,\n"
                "}\n"
                "updated = with_new_title(original, 'Черновик')\n"
                "print(original)\n"
                "print(updated)\n"
                "print(original is updated)\n"
            ),
            "tests": [
                {
                    "name": "исходная запись сохранена, копия отдельная",
                    "expected": (
                        "{'id': 21, 'title': 'Повторить цикл', 'priority': 2, 'is_done': False}\n"
                        "{'id': 21, 'title': 'Черновик', 'priority': 2, 'is_done': False}\n"
                        "False"
                    ),
                    "assert": "stdout",
                }
            ],
            "reference_code": (
                "def with_new_title(task, title):\n"
                "    updated = task.copy()\n"
                "    updated['title'] = title\n"
                "    return updated\n"
                "\n"
                "original = {\n"
                "    'id': 21,\n"
                "    'title': 'Повторить цикл',\n"
                "    'priority': 2,\n"
                "    'is_done': False,\n"
                "}\n"
                "updated = with_new_title(original, 'Черновик')\n"
                "print(original)\n"
                "print(updated)\n"
                "print(original is updated)\n"
            ),
        },
    ]
}

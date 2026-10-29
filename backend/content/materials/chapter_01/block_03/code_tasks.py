from typing import Any

# Add interpreter/code tasks for each lesson after authoring its concept-based material.
CODE_TASKS: dict[int | str, list[dict[str, Any]]] = {number: [] for number in (11, "11.1", "11.2", 12, "12.1", 13, "13.1", "13.2", 14, "14.1", "14.2", 15, "15.1")}

CODE_TASKS["11.1"] = [{'title': 'Два вызова: внешнее и локальное cost',
  'level': 'easy',
  'mode': 'script',
  'prompt': 'В заготовке уже есть функция ride_total с локальным cost. Платформа задаёт внешнее '
            'cost, числа first_km, second_km и rate. Перед запуском спрогнозируем три строки '
            'вывода. Сохраните результаты двух разных вызовов под именами first_fare и '
            'second_fare. Выведите first_fare, затем second_fare, затем исходное внешнее cost. '
            'Функцию изменять не нужно.',
  'contract': {'given': 'В заготовке определена функция ride_total(km, rate), которая вычисляет '
                        'локальное cost и возвращает стоимость поездки. Платформа задаёт внешнее '
                        'cost и числа first_km, second_km, rate.',
               'todo': 'Во внешнем script дважды вызывается готовая функция с разными '
                       'расстояниями. Каждый возвращённый результат сохраняется отдельно; в конце '
                       'выводится исходное внешнее cost.',
               'check': 'Вывод содержит стоимость каждой поездки по своим аргументам и неизменное '
                        'внешнее cost. Между тестами входные значения меняются.'},
  'requirements': {'items': ['Готовая функция ride_total используется для двух независимых вызовов '
                             'с first_km и second_km.',
                             'Результаты сохраняются во внешние имена first_fare и second_fare.',
                             'Выводятся first_fare, second_fare и cost именно в этом порядке.'],
                   'names': ['ride_total',
                             'cost',
                             'first_km',
                             'second_km',
                             'rate',
                             'first_fare',
                             'second_fare'],
                   'nodes': ['FunctionDef', 'Return', 'Assign', 'Call'],
                   'calls': ['ride_total', 'print']},
  'hints': ['Готовая функция получает km и rate. Внутри неё cost локальное, а снаружи есть своё '
            'cost.',
            'Каждый вызов возвращает значение, которое можно сохранить в отдельное внешнее имя.',
            'Сравним третий print с внешним cost: функция не присваивала ему новое значение.'],
  'starter_code': 'def ride_total(km, rate):\n'
                  '    cost = km * rate\n'
                  '    return cost\n'
                  '\n'
                  '# Платформа задаёт cost, first_km, second_km и rate.\n'
                  '# Сохраните два результата вызова и выведите три значения в нужном порядке.\n',
  'tests': [{'name': 'Две поездки',
             'namespace': {'cost': 90, 'first_km': 3, 'second_km': 5, 'rate': 8},
             'expected': '24\n40\n90',
             'assert': 'stdout'},
            {'name': 'Другие расстояния и внешний cost',
             'namespace': {'cost': 150, 'first_km': 1, 'second_km': 4, 'rate': 12},
             'expected': '12\n48\n150',
             'assert': 'stdout'}],
  'reference_code': 'def ride_total(km, rate):\n'
                    '    cost = km * rate\n'
                    '    return cost\n'
                    '\n'
                    'first_fare = ride_total(first_km, rate)\n'
                    'second_fare = ride_total(second_km, rate)\n'
                    'print(first_fare)\n'
                    'print(second_fare)\n'
                    'print(cost)\n'},
 {'title': 'Исправим чтение локального subtotal снаружи',
  'level': 'easy',
  'mode': 'script',
  'prompt': 'В заготовке функция calculate_total вычисляет subtotal, но после вызова script '
            'пытается напечатать это локальное имя снаружи. Исправьте функцию так, чтобы она '
            'возвращала subtotal, сохраните результат вызова в отдельное внешнее имя saved_total и '
            'выведите saved_total. Платформа задаёт base и fee. Ожидается ровно одна строка с их '
            'суммой.',
  'contract': {'given': 'В заготовке есть calculate_total(base, fee) с локальной subtotal, '
                        'ошибочный внешний print(subtotal), а платформа задаёт base и fee.',
               'todo': 'Функция явно возвращает вычисленное значение; вызывающий код сохраняет '
                       'ответ под внешним именем saved_total и выводит его без обращения к '
                       'локальному subtotal.',
               'check': 'Script не обращается к subtotal снаружи и выводит правильную сумму при '
                        'изменении аргументов. Перенос print внутрь функции без return не решает '
                        'задачу.'},
  'requirements': {'items': ['calculate_total передаёт локальную сумму наружу через return.',
                             'Вызывающий код сохраняет возвращённое число в saved_total.',
                             'Внешний вывод использует saved_total, а не локальное subtotal.'],
                   'names': ['calculate_total', 'base', 'fee', 'subtotal', 'saved_total'],
                   'nodes': ['FunctionDef', 'Return', 'Assign', 'Call'],
                   'calls': ['calculate_total', 'print']},
  'hints': ['subtotal появляется при выполнении тела функции. Снаружи такого имени нет.',
            'Один шаг нужен внутри функции, чтобы отдать вычисленное значение, другой шаг нужен '
            'снаружи, чтобы сохранить ответ вызова.',
            'После исправления проверьте, какое именно имя использует внешний print. Оно должно '
            'существовать на этом уровне.'],
  'starter_code': 'def calculate_total(base, fee):\n'
                  '    subtotal = base + fee\n'
                  '    # Здесь ещё не передаём результат вызова наружу.\n'
                  '\n'
                  'calculate_total(base, fee)\n'
                  'print(subtotal)  # Это имя локальное: исправьте строку.\n',
  'tests': [{'name': 'Сумма двух чисел',
             'namespace': {'base': 14, 'fee': 3},
             'expected': '17',
             'assert': 'stdout'},
            {'name': 'Нулевой основной аргумент',
             'namespace': {'base': 0, 'fee': 7},
             'expected': '7',
             'assert': 'stdout'},
            {'name': 'Нулевые аргументы',
             'namespace': {'base': 0, 'fee': 0},
             'expected': '0',
             'assert': 'stdout'}],
  'reference_code': 'def calculate_total(base, fee):\n'
                    '    subtotal = base + fee\n'
                    '    return subtotal\n'
                    '\n'
                    'saved_total = calculate_total(base, fee)\n'
                    'print(saved_total)\n'},
 {'title': 'Шаг 1 из 4. Перепривяжем параметр',
  'level': 'easy',
  'mode': 'script',
  'prompt': 'Платформа задаёт список replace_source и строку replacement_topic. Определите '
            'replace_local(items, new_topic), чтобы внутри функции локальное имя items стало '
            'обозначать новый список с new_topic. Верните новый список, сохраните ответ вызова в '
            'replacement_result и выведите replace_source, затем replacement_result, каждое '
            'значение с новой строки.',
  'contract': {'given': 'Платформа задаёт replace_source, отдельный список строк, и '
                        'replacement_topic, новую строку.',
               'todo': 'Функция replace_local перепривязывает локальный параметр к новому списку и '
                       'возвращает его вызывающему коду.',
               'check': 'При разных данных replace_source остаётся прежним, а replacement_result '
                        'содержит только replacement_topic.'},
  'requirements': {'items': ['Функция заменяет связь локального items новым списком с '
                             'replacement_topic.',
                             'Внешний код сохраняет возвращённый список в replacement_result.',
                             'Сначала печатается replace_source, затем replacement_result, по '
                             'одному списку на строке.'],
                   'names': ['replace_local',
                             'items',
                             'new_topic',
                             'replace_source',
                             'replacement_topic',
                             'replacement_result'],
                   'nodes': ['FunctionDef', 'Assign', 'Return', 'Call'],
                   'calls': ['replace_local', 'print']},
  'hints': ['Присваивание новому списку меняет локальную связь items, но не имя replace_source '
            'снаружи.',
            'Верните локальное items, затем отдельно сохраните результат вызова.',
            'Сравните два списка выводом: сначала исходный, затем возвращённый.'],
  'starter_code': '# Платформа задаёт replace_source и replacement_topic.\n'
                  '# Определите replace_local(items, new_topic), вызовите её и выведите оба '
                  'списка.\n',
  'tests': [{'name': 'Исходный список сохраняется',
             'namespace': {'replace_source': ['Роман', 'Стих'], 'replacement_topic': 'Очерк'},
             'expected': "['Роман', 'Стих']\n['Очерк']",
             'assert': 'stdout'},
            {'name': 'Пустой исходный список',
             'namespace': {'replace_source': [], 'replacement_topic': 'Очерк'},
             'expected': "[]\n['Очерк']",
             'assert': 'stdout'}],
  'reference_code': 'def replace_local(items, new_topic):\n'
                    '    items = [new_topic]\n'
                    '    return items\n'
                    '\n'
                    'replacement_result = replace_local(replace_source, replacement_topic)\n'
                    'print(replace_source)\n'
                    'print(replacement_result)\n'},
 {'title': 'Шаг 2 из 4. Изменим переданный список',
  'level': 'easy',
  'mode': 'script',
  'prompt': 'Платформа задаёт список shared_source и строку shared_topic. Определите '
            'append_shared(items, new_topic), чтобы функция добавляла строку в переданный список '
            'методом append без явного return. Сохраните результат вызова в append_result. '
            'Выведите изменённый shared_source, затем append_result с новой строки. Так мы '
            'проверим отдельно изменение объекта и значение, возвращённое вызовом.',
  'contract': {'given': 'Платформа задаёт shared_source, список строк, и shared_topic, новую '
                        'строку.',
               'todo': 'Функция append_shared изменяет переданный список, а вызывающий код '
                       'отдельно печатает список после вызова и возвращённое значение None.',
               'check': 'После вызова общий список дополнен, а append_result равен None при каждом '
                        'наборе входов.'},
  'requirements': {'items': ['Функция append_shared изменяет переданный список методом append и не '
                             'возвращает явного значения.',
                             'Внешний код сохраняет результат вызова в append_result.',
                             'Сначала печатается изменённый shared_source, затем None.'],
                   'names': ['append_shared',
                             'items',
                             'new_topic',
                             'shared_source',
                             'shared_topic',
                             'append_result'],
                   'nodes': ['FunctionDef', 'Call'],
                   'calls': ['append_shared', 'print'],
                   'attributes': ['append']},
  'hints': ['Метод append меняет общий объект, поэтому shared_source изменится независимо от '
            'return.',
            'Присваивание append_result = append_shared(...) сохраняет результат вызова. Какое '
            'значение возвращает функция без return?',
            'Напечатайте исходное имя списка и результат вызова на двух разных строках.'],
  'starter_code': '# Платформа задаёт shared_source и shared_topic.\n'
                  '# Определите append_shared(items, new_topic) без return.\n'
                  '# Сохраните результат вызова и напечатайте изменённый список, затем '
                  'результат.\n',
  'tests': [{'name': 'Добавляем к двум элементам',
             'namespace': {'shared_source': ['Роман', 'Стих'], 'shared_topic': 'Рассказ'},
             'expected': "['Роман', 'Стих', 'Рассказ']\nNone",
             'assert': 'stdout'},
            {'name': 'Добавляем в пустой список',
             'namespace': {'shared_source': [], 'shared_topic': 'Рисунок'},
             'expected': "['Рисунок']\nNone",
             'assert': 'stdout'}],
  'reference_code': 'def append_shared(items, new_topic):\n'
                    '    items.append(new_topic)\n'
                    '\n'
                    'append_result = append_shared(shared_source, shared_topic)\n'
                    'print(shared_source)\n'
                    'print(append_result)\n'},
 {'title': 'Шаг 3 из 4. Создадим отдельную копию',
  'level': 'easy',
  'mode': 'script',
  'prompt': 'Платформа задаёт список copy_source и строку copy_topic. Определите '
            'make_variant(items, new_topic), чтобы функция скопировала список, добавила строку в '
            'копию и вернула её. Сохраните ответ вызова в copy_result и выведите copy_source, '
            'затем copy_result, каждое значение с новой строки.',
  'contract': {'given': 'Платформа задаёт copy_source, список строк, и copy_topic, новую строку.',
               'todo': 'Функция make_variant возвращает отдельную копию с добавленным copy_topic.',
               'check': 'На разных входах copy_source сохраняет прежние элементы, а copy_result '
                        'содержит те же элементы и новую строку в конце.'},
  'requirements': {'items': ['Функция создаёт копию внешнего списка методом copy и добавляет '
                             'строку в копию методом append.',
                             'Функция возвращает копию, а внешний код сохраняет её в copy_result.',
                             'Сначала печатается неизменённый copy_source, затем copy_result.'],
                   'names': ['make_variant',
                             'items',
                             'new_topic',
                             'variant',
                             'copy_source',
                             'copy_topic',
                             'copy_result'],
                   'nodes': ['FunctionDef', 'Assign', 'Return', 'Call'],
                   'calls': ['make_variant', 'print'],
                   'attributes': ['copy', 'append']},
  'hints': ['Сначала свяжите новое локальное имя с копией items.',
            'Добавьте строку в копию, верните её и сохраните результат вызова отдельно от '
            'copy_source.'],
  'starter_code': '# Платформа задаёт copy_source и copy_topic.\n'
                  '# Определите make_variant(items, new_topic), вызовите её и выведите оба '
                  'списка.\n',
  'tests': [{'name': 'Исходник и копия',
             'namespace': {'copy_source': ['Эскиз', 'Краски'], 'copy_topic': 'Плакат'},
             'expected': "['Эскиз', 'Краски']\n['Эскиз', 'Краски', 'Плакат']",
             'assert': 'stdout'},
            {'name': 'Копируем пустой список',
             'namespace': {'copy_source': [], 'copy_topic': 'Портрет'},
             'expected': "[]\n['Портрет']",
             'assert': 'stdout'}],
  'reference_code': 'def make_variant(items, new_topic):\n'
                    '    variant = items.copy()\n'
                    '    variant.append(new_topic)\n'
                    '    return variant\n'
                    '\n'
                    'copy_result = make_variant(copy_source, copy_topic)\n'
                    'print(copy_source)\n'
                    'print(copy_result)\n'},
 {'title': 'Шаг 4 из 4. Сравним результаты',
  'level': 'easy',
  'mode': 'script',
  'prompt': 'Заготовка содержит три функции из предыдущих шагов. Платформа задаёт три независимых '
            'списка с одинаковыми начальными элементами и три новые строки. Вызовите каждую '
            'функцию со своим списком и выведите три строки сравнения: пару replace_source и '
            'replacement_result, shared_source после изменения, затем пару copy_source и '
            'copy_result. В паре списки печатаются через один пробел. Пример вывода:\n'
            "['Роман', 'Стих'] ['Очерк']\n"
            "['Роман', 'Стих', 'Рассказ']\n"
            "['Роман', 'Стих'] ['Роман', 'Стих', 'Сказка']",
  'contract': {'given': 'Заготовка содержит replace_local, append_shared и make_variant. Платформа '
                        'задаёт отдельные replace_source, shared_source и copy_source с '
                        'одинаковыми начальными элементами, а также replacement_topic, '
                        'shared_topic и copy_topic.',
               'todo': 'Вызовем каждую функцию на своём списке и выведем три строки, чтобы '
                       'сопоставить перепривязку, изменение исходного объекта и работу с копией.',
               'todo_items': ['Сохраним ответы replace_local и make_variant, а append_shared '
                              'вызовем для shared_source.',
                              'Напечатаем три строки с парами и порядком, указанными в условии.'],
               'check': 'Тесты меняют все начальные элементы и новые строки. replace_source и '
                        'copy_source остаются прежними, shared_source получает новую строку, а '
                        'copy_result содержит её вместе с прежними элементами.'},
  'requirements': {'items': ['Каждая готовая функция вызывается со своим списком и соответствующей '
                             'строкой.',
                             'Результат перепривязки сохраняется отдельно, а результат копирования '
                             'не изменяет copy_source.',
                             'Три строки выводятся в формате и порядке из условия.'],
                   'names': ['replace_local',
                             'append_shared',
                             'make_variant',
                             'replace_source',
                             'replacement_topic',
                             'replacement_result',
                             'shared_source',
                             'shared_topic',
                             'copy_source',
                             'copy_topic',
                             'copy_result'],
                   'nodes': ['FunctionDef', 'Assign', 'Return', 'Call'],
                   'calls': ['replace_local', 'append_shared', 'make_variant', 'print'],
                   'attributes': ['append', 'copy']},
  'hints': ['Сохраните возвращаемые списки только для replace_local и make_variant.',
            'Напечатайте пары исходника и результата рядом, а список после append выведите '
            'отдельной строкой.'],
  'starter_code': 'def replace_local(items, new_topic):\n'
                  '    items = [new_topic]\n'
                  '    return items\n'
                  '\n'
                  'def append_shared(items, new_topic):\n'
                  '    items.append(new_topic)\n'
                  '\n'
                  'def make_variant(items, new_topic):\n'
                  '    variant = items.copy()\n'
                  '    variant.append(new_topic)\n'
                  '    return variant\n'
                  '\n'
                  '# Платформа задаёт три исходных списка и три новые строки.\n'
                  '# В парной строке print(first_list, second_list) разделяет списки пробелом.\n'
                  '# Вызовите функции и выведите три строки сравнения по условию.\n',
  'tests': [{'name': 'Сравниваем списки тем',
             'namespace': {'replace_source': ['Роман', 'Стих'],
                           'shared_source': ['Роман', 'Стих'],
                           'copy_source': ['Роман', 'Стих'],
                           'replacement_topic': 'Очерк',
                           'shared_topic': 'Рассказ',
                           'copy_topic': 'Сказка'},
             'expected': "['Роман', 'Стих'] ['Очерк']\n"
                         "['Роман', 'Стих', 'Рассказ']\n"
                         "['Роман', 'Стих'] ['Роман', 'Стих', 'Сказка']",
             'assert': 'stdout'},
            {'name': 'Сравниваем другие значения',
             'namespace': {'replace_source': ['Эскиз', 'Краски'],
                           'shared_source': ['Эскиз', 'Краски'],
                           'copy_source': ['Эскиз', 'Краски'],
                           'replacement_topic': 'Плакат',
                           'shared_topic': 'Рисунок',
                           'copy_topic': 'Портрет'},
             'expected': "['Эскиз', 'Краски'] ['Плакат']\n"
                         "['Эскиз', 'Краски', 'Рисунок']\n"
                         "['Эскиз', 'Краски'] ['Эскиз', 'Краски', 'Портрет']",
             'assert': 'stdout'}],
  'reference_code': 'def replace_local(items, new_topic):\n'
                    '    items = [new_topic]\n'
                    '    return items\n'
                    '\n'
                    'def append_shared(items, new_topic):\n'
                    '    items.append(new_topic)\n'
                    '\n'
                    'def make_variant(items, new_topic):\n'
                    '    variant = items.copy()\n'
                    '    variant.append(new_topic)\n'
                    '    return variant\n'
                    '\n'
                    'replacement_result = replace_local(replace_source, replacement_topic)\n'
                    'append_shared(shared_source, shared_topic)\n'
                    'copy_result = make_variant(copy_source, copy_topic)\n'
                    'print(replace_source, replacement_result)\n'
                    'print(shared_source)\n'
                    'print(copy_source, copy_result)\n'}]

CODE_TASKS["11.2"] = [{'title': 'Исправляем ключ в созданной записи',
  'level': 'easy',
  'mode': 'script',
  'prompt': 'Одна готовая запись читается правильно, но следующий вызов останавливается с '
            'KeyError. Сначала запустим код и назовём строку проявления и фактические ключи '
            'созданного словаря. Затем найдём причину, исправим её и сохраним все три чтения.',
  'contract': {'given': 'read_points получает готовую запись и две записи от make_points. В каждой '
                        'должен быть обязательный ключ points.',
               'todo': 'Воспроизведём KeyError, сравним состав записи с обязательным полем, '
                       'исправим источник несоответствия и снова проверим все вызовы.',
               'check': 'Вывод содержит 4, 8 и 0 по одному числу на строке.'},
  'requirements': {'nodes': ['FunctionDef'], 'calls': ['print']},
  'starter_code': 'def make_points(value):\n'
                  '    return {"poitns": value}\n'
                  '\n'
                  'def read_points(record):\n'
                  '    return record["points"]\n'
                  '\n'
                  'print(read_points({"points": 4}))\n'
                  'print(read_points(make_points(8)))\n'
                  'print(read_points(make_points(0)))\n',
  'hints': ['В какой строке остановилось чтение? Сравним запрошенный ключ и ключи словаря, который '
            'дошёл до этой строки.',
            'Где сформировали именно тот словарь, который читает функция? Проверим договор на '
            'стороне создателя.',
            'После минимальной правки сверим все три результата, включая ранее рабочую запись.'],
  'tests': [{'name': 'Правильная запись и два новых значения',
             'expected': '4\n8\n0',
             'assert': 'stdout'}],
  'reference_code': 'def make_points(value):\n'
                    '    return {"points": value}\n'
                    '\n'
                    'def read_points(record):\n'
                    '    return record["points"]\n'
                    '\n'
                    'print(read_points({"points": 4}))\n'
                    'print(read_points(make_points(8)))\n'
                    'print(read_points(make_points(0)))\n'},
 {'title': 'Восстанавливаем результат функции',
  'level': 'easy',
  'mode': 'script',
  'prompt': 'Первый вызов завершился правильным числом, а следующий остановился. Запустим script, '
            'выпишем строку остановки и сравним, какое значение вычисляется и какое действительно '
            'получает вызывающая функция. Исправим одну причину, затем проверим оба пути.',
  'contract': {'given': 'show_total добавляет 1 к результату add_bonus. Для значений 4 и 0 '
                        'ожидаются числа 8 и 4.',
               'todo': 'Проследим значения в двух вызовах, объясним отсутствие результата в одном '
                       'пути и проверим минимальную причинную правку.',
               'check': 'После запуска появляются 8 и 4 по порядку, без ошибки выполнения.'},
  'requirements': {'nodes': ['FunctionDef'], 'calls': ['print']},
  'starter_code': 'def add_bonus(value):\n'
                  '    if value > 0:\n'
                  '        return value + 3\n'
                  '    total = value + 3\n'
                  '\n'
                  'def show_total(value):\n'
                  '    updated_total = add_bonus(value)\n'
                  '    print(updated_total + 1)\n'
                  '\n'
                  'show_total(4)\n'
                  'show_total(0)\n',
  'hints': ['Сверим, какое значение получает updated_total во втором вызове.',
            'Сравним, что add_bonus вычисляет на каждом пути и что передаёт наружу.',
            'После изменения проверим положительное число и ноль.'],
  'tests': [{'name': 'Оба пути передают число вызывающему коду',
             'expected': '8\n4',
             'assert': 'stdout'}],
  'reference_code': 'def add_bonus(value):\n'
                    '    if value > 0:\n'
                    '        return value + 3\n'
                    '    total = value + 3\n'
                    '    return total\n'
                    '\n'
                    'def show_total(value):\n'
                    '    updated_total = add_bonus(value)\n'
                    '    print(updated_total + 1)\n'
                    '\n'
                    'show_total(4)\n'
                    'show_total(0)\n'},
 {'title': 'Считаем только длинные занятия',
  'level': 'easy',
  'mode': 'script',
  'prompt': 'Программа завершает подсчёт, но некоторые ответы не соответствуют правилу: считаются '
            'занятия длительностью от 20 минут включительно. Сравним ожидание и факт для значений '
            'ниже, на границе и выше неё, исправим причину и проверим четыре вызова.',
  'contract': {'given': 'Функция перебирает список длительностей и накапливает количество. '
                        'Подходят значения не меньше 20.',
               'todo': 'Определим первое расхождение правила с условием, исправим минимальное '
                       'место и проверим обычные и граничные входы.',
               'check': 'Результаты по порядку: 2, 0, 2 и 0, включая граничное значение 20.'},
  'requirements': {'nodes': ['FunctionDef', 'For', 'If'], 'calls': ['print']},
  'starter_code': 'def count_long_sessions(durations):\n'
                  '    count = 0\n'
                  '    for minutes in durations:\n'
                  '        if minutes > 0:\n'
                  '            count = count + 1\n'
                  '    return count\n'
                  '\n'
                  'print(count_long_sessions([8, 22, 0, 31]))\n'
                  'print(count_long_sessions([0, 14, 19]))\n'
                  'print(count_long_sessions([20, 27]))\n'
                  'print(count_long_sessions([]))\n',
  'hints': ['Сформулируем порог словами и проверим каждое значение относительно 20.',
            'Сверим отдельно значение ниже порога и само граничное значение.',
            'Запустим вызов без подходящих значений и пустой список.'],
  'tests': [{'name': 'Обычный, пустой, граничный и безрезультатный случаи',
             'expected': '2\n0\n2\n0',
             'assert': 'stdout'}],
  'reference_code': 'def count_long_sessions(durations):\n'
                    '    count = 0\n'
                    '    for minutes in durations:\n'
                    '        if minutes >= 20:\n'
                    '            count = count + 1\n'
                    '    return count\n'
                    '\n'
                    'print(count_long_sessions([8, 22, 0, 31]))\n'
                    'print(count_long_sessions([0, 14, 19]))\n'
                    'print(count_long_sessions([20, 27]))\n'
                    'print(count_long_sessions([]))\n'},
 {'title': 'Самостоятельная диагностика отчёта',
  'level': 'medium',
  'mode': 'script',
  'prompt': 'Отчёт по книгам печатает три строки: число доступных книг, страницы доступных книг и '
            'страницы всех книг. Для доступной книги на 12 страниц и недоступной на 90 ожидаются '
            '1, 12 и 102, но на некоторых входах вывод неверен. Самостоятельно запишем ожидание, '
            'факт, гипотезу и способ её проверить, затем внесём минимальную правку с сохранением '
            'смысла обоих действий.',
  'contract': {'given': 'books: список записей с pages (неотрицательный int) и available (bool). '
                        'Исходный список не меняется.',
               'todo': 'Самостоятельно выясним источник неверного отчёта: сначала сравним три '
                       'показателя и данные, затем проверим гипотезу на разных наборах и исправим '
                       'минимальное место.',
               'check': 'Три строки по договору для нескольких наборов, включая смесь доступных и '
                        'недоступных, все доступные, ни одной доступной и пустой список. Исходные '
                        'книги не меняются.'},
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
  'hints': ['Выпишем первую неверную строку, её ожидаемый результат и фактические аргументы '
            'вызовов. Какая проверка поможет обнаружить расхождение?',
            'Сравним на двух разных наборах, какие именно книги должны участвовать в каждом '
            'показателе отчёта.',
            'Проследим, что реально передано каждому вычислению, не изменяя готовые функции до '
            'подтверждения причины. Затем проверим прежний рабочий набор.'],
  'tests': [{'name': 'Доступная и недоступная',
             'namespace': {'books': [{'pages': 12, 'available': True},
                                     {'pages': 90, 'available': False}]},
             'expected': '1\n12\n102',
             'assert': 'stdout'},
            {'name': 'Разные наборы',
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
             'namespace': {'books': [{'pages': 3, 'available': True},
                                     {'pages': 5, 'available': True}]},
             'expected': '2\n8\n8',
             'assert': 'stdout'},
            {'name': 'Пусто',
             'namespace': {'books': []},
             'expected': '0\n0\n0',
             'assert': 'stdout'},
            {'name': 'Один поздний доступный',
             'namespace': {'books': [{'pages': 0, 'available': False},
                                     {'pages': 14, 'available': True}]},
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
                    'print(total_pages(books))\n'}]

CODE_TASKS[11] = [{'title': 'Назовём и вызовем повторяемое действие',
  'level': 'easy',
  'mode': 'script',
  'prompt': 'Напишем функцию без параметров, чтобы одно сообщение появилось после каждого из двух '
            'вызовов.',
  'contract': {'given': 'Отдельный ввод не нужен. Мы работаем с коротким script на платформе.',
               'todo': 'Самостоятельно определите open_plan без параметров и вызовите её дважды '
                       'ниже определения.',
               'todo_items': ['Функция open_plan определена без параметров; её тело содержит '
                              'print("Открываем план").',
                              'После определения располагаются два вызова open_plan().'],
               'check': 'В выводе должны появиться ровно две строки Открываем план. Если убрать '
                        'один вызов, останется одна; одно определение не печатает ничего.'},
  'requirements': {'items': ['Определение находится выше обоих вызовов.',
                             'Команда print расположена в теле функции.'],
                   'names': ['open_plan'],
                   'nodes': ['FunctionDef'],
                   'calls': ['open_plan', 'print']},
  'hints': ['Сначала мы записываем def, имя open_plan, пустые скобки и двоеточие.',
            'Далее мы переносим print внутрь тела отступом, а вызовы располагаем ниже определения.',
            'Мы сверяем сообщение в теле и два вызова с двумя одинаковыми строками вывода.'],
  'starter_code': '# Определите open_plan без параметров; её тело должно показать сообщение\n'
                  '# Открываем план\n'
                  '# После определения запишите два вызова функции\n',
  'tests': [{'name': 'Два вызова',
             'expected': 'Открываем план\nОткрываем план',
             'assert': 'stdout'}],
  'reference_code': 'def open_plan():\n    print("Открываем план")\n\nopen_plan()\nopen_plan()\n'},
 {'title': 'Передадим входы и используем ответ',
  'level': 'easy',
  'mode': 'script',
  'prompt': 'Создадим функцию, которая возвращает оставшиеся минуты; полученное число используем '
            'во внешнем script.',
  'contract': {'given': 'Платформа задаёт total_minutes и used_minutes. Первое значение означает '
                        'всё доступное время, второе уже прошедшее.',
               'given_items': ['total_minutes не меньше used_minutes.',
                               'Значения меняются между проверками.'],
               'todo': 'Напишите minutes_left с двумя позиционными параметрами, сохраните '
                       'возвращённую разность в remaining и выведите Осталось: вместе с этим '
                       'числом.',
               'todo_items': ['Функция minutes_left объявляет параметры total_minutes и '
                              'used_minutes в указанном порядке и возвращает total_minutes - '
                              'used_minutes.',
                              'Вызов функции с заданными значениями сохраняется в remaining.',
                              'Вывод содержит Осталось: и значение remaining.'],
               'check': 'При данных (90, 25) вывод равен Осталось: 65, при (48, 13) равен '
                        'Осталось: 35; также проверьте случай, когда использовано всё время.'},
  'requirements': {'items': ['Вычисление возвращается из функции, а не печатается внутри неё.',
                             'Внешняя команда использует значение, полученное от вызова.'],
                   'names': ['total_minutes', 'used_minutes', 'remaining'],
                   'nodes': ['FunctionDef', 'Return'],
                   'calls': ['minutes_left', 'print']},
  'hints': ['Сначала мы сверяем порядок двух входных значений с именами в определении.',
            'Мы вычитаем прошедшее время из общего и возвращаем полученное число.',
            'Затем мы сохраняем ответ вызова в remaining и выводим метку вместе с этим значением.'],
  'starter_code': '# total_minutes и used_minutes заданы платформой\n'
                  '# Здесь мы определяем функцию и возвращаем оставшееся время\n'
                  '# Внешняя команда сохраняет результат вызова и выводит его\n',
  'tests': [{'name': '90 минут, прошло 25',
             'namespace': {'total_minutes': 90, 'used_minutes': 25},
             'expected': 'Осталось: 65',
             'assert': 'stdout'},
            {'name': '48 минут, прошло 13',
             'namespace': {'total_minutes': 48, 'used_minutes': 13},
             'expected': 'Осталось: 35',
             'assert': 'stdout'},
            {'name': 'Все минуты использованы',
             'namespace': {'total_minutes': 17, 'used_minutes': 17},
             'expected': 'Осталось: 0',
             'assert': 'stdout'}],
  'reference_code': 'def minutes_left(total_minutes, used_minutes):\n'
                    '    return total_minutes - used_minutes\n'
                    '\n'
                    'remaining = minutes_left(total_minutes, used_minutes)\n'
                    'print("Осталось:", remaining)\n'},
 {'title': 'Вернём удвоенное значение вызывающему коду',
  'level': 'easy',
  'mode': 'script',
  'prompt': 'В готовом script удвоенное число печатается внутри функции, а ответ вызова равен '
            'None. Исправим передачу результата.',
  'contract': {'given': 'Платформа задаёт число value. Функция уже вычисляет его удвоенное '
                        'значение.',
               'todo': 'Замените внутренний print на return, чтобы answer получил число и внешняя '
                       'команда показала одну строку без лишнего вывода.',
               'check': 'Для value=7 вывод После вызова: 14, для value=10 вывод После вызова: 20, '
                        'для value=0 вывод После вызова: 0. Лишних строк нет.'},
  'requirements': {'items': ['Функция возвращает удвоенное значение.',
                             'Внешний код сохраняет результат и печатает его после вызова.'],
                   'names': ['value', 'answer'],
                   'nodes': ['FunctionDef', 'Return'],
                   'calls': ['double_points', 'print']},
  'hints': ['Мы сопоставляем вывод на экране и значение, которое должно попасть в answer.',
            'Вызов double_points печатает число, но пока доходит до конца без return. Поэтому '
            'answer получает None.',
            'Мы заменяем внутренний вывод передачей вычисленного значения. Внешняя строка уже '
            'показывает answer.'],
  'starter_code': '# value задан платформой\n'
                  'def double_points(value):\n'
                  '    print(value * 2)\n'
                  '\n'
                  'answer = double_points(value)\n'
                  'print("После вызова:", answer)\n',
  'tests': [{'name': 'Удваиваем 7',
             'namespace': {'value': 7},
             'expected': 'После вызова: 14',
             'assert': 'stdout'},
            {'name': 'Удваиваем 10',
             'namespace': {'value': 10},
             'expected': 'После вызова: 20',
             'assert': 'stdout'},
            {'name': 'Нулевое значение',
             'namespace': {'value': 0},
             'expected': 'После вызова: 0',
             'assert': 'stdout'}],
  'reference_code': 'def double_points(value):\n'
                    '    return value * 2\n'
                    '\n'
                    'answer = double_points(value)\n'
                    'print("После вызова:", answer)\n'},
 {'title': 'Вернём значение в каждой ветви',
  'level': 'easy',
  'mode': 'script',
  'prompt': 'В готовой функции выходной возвращает 15 минут, а обычный день заканчивается без '
            'return. Исправим недостающий возврат.',
  'contract': {'given': 'Платформа задаёт is_weekend как True или False. В готовой функции один '
                        'путь доходит до конца без возврата.',
               'todo': 'В ветви else передайте число 8 через return. Сохраните внешний вывод и '
                       'проверьте True и False отдельно.',
               'check': 'При is_weekend=False будет одна строка 8, при True одна строка 15, без '
                        'None.'},
  'requirements': {'items': ['Каждая ветвь передаёт выбранное число через return.',
                             'Результат вызова сохраняется и выводится после завершения функции.'],
                   'names': ['is_weekend', 'weekday_pause'],
                   'nodes': ['FunctionDef', 'If', 'Return'],
                   'calls': ['pause_minutes', 'print']},
  'hints': ['Мы прослеживаем is_weekend=False и отмечаем, до какой строки доходит эта ветвь.',
            'Число 8 записано как выражение, но ещё не стало ответом функции.',
            'Мы повторяем показанную правку и передаём число из второй ветви тем же способом, что '
            'и из первой.'],
  'starter_code': '# is_weekend задан платформой\n'
                  'def pause_minutes(is_weekend):\n'
                  '    if is_weekend:\n'
                  '        return 15\n'
                  '    else:\n'
                  '        8\n'
                  '\n'
                  'weekday_pause = pause_minutes(is_weekend)\n'
                  'print(weekday_pause)\n',
  'tests': [{'name': 'Обычный день',
             'namespace': {'is_weekend': False},
             'expected': '8',
             'assert': 'stdout'},
            {'name': 'Выходной',
             'namespace': {'is_weekend': True},
             'expected': '15',
             'assert': 'stdout'}],
  'reference_code': 'def pause_minutes(is_weekend):\n'
                    '    if is_weekend:\n'
                    '        return 15\n'
                    '    else:\n'
                    '        return 8\n'
                    '\n'
                    'weekday_pause = pause_minutes(is_weekend)\n'
                    'print(weekday_pause)\n'},
 {'title': 'Передадим все обязательные аргументы',
  'level': 'easy',
  'mode': 'script',
  'prompt': 'Вызов функции с двумя обязательными параметрами пока передаёт одно значение. Исправим '
            'число аргументов.',
  'contract': {'given': 'Платформа задаёт весь запас времени total_minutes и длительность перерыва '
                        'break_minutes. Сообщение Тело началось печатается только при успешном '
                        'входе в тело функции.',
               'todo': 'Передайте total_minutes и break_minutes в указанном порядке, сохранив '
                       'возвращённую разность и внешний вывод.',
               'check': 'При (40, 10) увидим строки Тело началось и 30, при (25, 7) строки Тело '
                        'началось и 18; при нулевом перерыве разность равна всему запасу.'},
  'requirements': {'items': ['Вызов передаёт total_minutes и break_minutes в свои позиции.',
                             'После запуска функции внешний код выводит сохранённую разницу.'],
                   'names': ['total_minutes', 'break_minutes', 'remaining'],
                   'nodes': ['FunctionDef', 'Return'],
                   'calls': ['total_after_break', 'print']},
  'hints': ['Мы сравниваем два параметра в определении с аргументами в вызове.',
            'Сейчас вызов передаёт только total_minutes, хотя функции нужны два значения.',
            'Мы добавляем break_minutes вторым аргументом и сверяем оба теста по сообщению из тела '
            'и разнице.'],
  'starter_code': '# total_minutes и break_minutes заданы платформой\n'
                  'def total_after_break(total_minutes, break_minutes):\n'
                  '    print("Тело началось")\n'
                  '    return total_minutes - break_minutes\n'
                  '\n'
                  'remaining = total_after_break(total_minutes)\n'
                  'print(remaining)\n',
  'tests': [{'name': '40 минут и 10 минут перерыва',
             'namespace': {'total_minutes': 40, 'break_minutes': 10},
             'expected': 'Тело началось\n30',
             'assert': 'stdout'},
            {'name': '25 минут и 7 минут перерыва',
             'namespace': {'total_minutes': 25, 'break_minutes': 7},
             'expected': 'Тело началось\n18',
             'assert': 'stdout'},
            {'name': 'Перерыв ноль минут',
             'namespace': {'total_minutes': 15, 'break_minutes': 0},
             'expected': 'Тело началось\n15',
             'assert': 'stdout'}],
  'reference_code': 'def total_after_break(total_minutes, break_minutes):\n'
                    '    print("Тело началось")\n'
                    '    return total_minutes - break_minutes\n'
                    '\n'
                    'remaining = total_after_break(total_minutes, break_minutes)\n'
                    'print(remaining)\n'}]

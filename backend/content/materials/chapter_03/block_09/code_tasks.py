"""Учебная практика блока. Редактируйте задания здесь."""

from __future__ import annotations

from typing import Any


CODE_TASKS: dict[int | str, list[dict[str, Any]]] = {
    41: [
        {
            "title": "Method и path в учебном запросе",
            "level": "easy",
            "mode": "solve",
            "prompt": "Функция получает готовые method и path и возвращает учебную пару в виде словаря. Метод уже выбран внешней программой; запрос по сети не отправляется.",
            "hints": [
                "Подготовим словарь с двумя требуемыми ключами.",
                "Метод строки upper возвращает новое значение. Применяем его только к method.",
                "Path возвращаем как есть. Результат передаём через return, не через print.",
            ],
            "contract": {
                "given": "Автопроверка вызывает solve(method, path). method является одной из строк get, post или patch в нижнем регистре. path является готовой строкой адресной части API. Входные значения не требуется выбирать или разбирать.",
                "todo": "Функция возвращает словарь ровно с ключами method и path. Значение method записано в верхнем регистре, path сохранён без изменения. Функция не меняет входные значения и ничего не выводит.",
                "check": "Несколько сценариев проверяют get, post и patch с разными path. Сравнивается точный словарь, сохранность входов и отсутствие вывода в консоль.",
            },
            "requirements": {
                "items": [
                    "Результат содержит ровно ключи 'method' и 'path'",
                    "Значение method приводится к верхнему регистру",
                    "Значение path возвращается без изменения",
                    "Функция возвращает результат и ничего не печатает",
                ],
                "names": ["method", "path"],
                "nodes": ["FunctionDef"],
                "attributes": ["upper"],
            },
            "starter_code": (
                "def solve(method, path):\n"
                "    # Здесь мы подготовим пару method и path\n"
                "    # Здесь мы вернём учебный результат\n"
                "    pass\n"
            ),
            "tests": [
                {
                    "name": "GET и путь к одной задаче",
                    "args": ["get", "/tasks/12"],
                    "preserve_inputs": True,
                    "no_stdout": True,
                    "expected": {"method": "GET", "path": "/tasks/12"},
                },
                {
                    "name": "POST и путь к другому ресурсу",
                    "args": ["post", "/tasks/9"],
                    "preserve_inputs": True,
                    "no_stdout": True,
                    "expected": {"method": "POST", "path": "/tasks/9"},
                },
                {
                    "name": "PATCH и отдельный path",
                    "args": ["patch", "/tasks/3"],
                    "preserve_inputs": True,
                    "no_stdout": True,
                    "expected": {"method": "PATCH", "path": "/tasks/3"},
                },
            ],
            "reference_code": (
                "def solve(method, path):\n"
                "    return {\n"
                "        \"method\": method.upper(),\n"
                "        \"path\": path,\n"
                "    }\n"
            ),
        }
    ],
    "41.1": [
        {
            "title": "Заголовки и тело модели request",
            "level": "easy",
            "mode": "solve",
            "prompt": "Функция возвращает учебное описание request из готовых значений. Сеть не отправляется.",
            "hints": [
                "Accept и Planner-Client-Version входят в headers при любом body.",
                "Пустой словарь является переданным телом. Для Content-Type проверяется body is not None.",
                "Method приводится к верхнему регистру, path и body возвращаются без изменения.",
            ],
            "contract": {
                "given": "Автопроверка вызывает solve(method, path, client_version, body). method, path и client_version являются строками; body является словарём или None. Method и path уже подготовлены, выбирать метод по действию не нужно.",
                "todo": "Функция возвращает ровно четыре ключа: method, path, headers и body. Method приводится к верхнему регистру. Headers всегда содержит Accept: application/json и Planner-Client-Version со значением client_version. Content-Type: application/json добавляется только при body is not None. Path и body сохраняются без изменения. Входы не меняются, результат не выводится.",
                "check": "Точное сравнение проверяет запрос без body, пустой объект и несколько заполненных тел на новых значениях. Дополнительно проверяются сохранность входов и отсутствие вывода.",
            },
            "requirements": {
                "items": [
                    "headers содержит Accept и Planner-Client-Version",
                    "Content-Type добавляется только для переданного body",
                    "method приведён к верхнему регистру, path и body сохранены",
                    "результат содержит ровно четыре предусмотренных ключа",
                ],
                "names": ["method", "path", "client_version", "body"],
                "nodes": ["FunctionDef"],
                "attributes": ["upper"],
            },
            "starter_code": (
                "def solve(method, path, client_version, body):\n"
                "    headers = {}\n"
                "    # Здесь соберём заголовки сообщения\n"
                "    # Затем вернём четыре части request\n"
                "    pass\n"
            ),
            "tests": [
                {
                    "name": "GET item без body",
                    "args": ["get", "/tasks/4", "2.4", None],
                    "preserve_inputs": True,
                    "no_stdout": True,
                    "expected": {
                        "method": "GET",
                        "path": "/tasks/4",
                        "headers": {
                            "Accept": "application/json",
                            "Planner-Client-Version": "2.4",
                        },
                        "body": None,
                    },
                },
                {
                    "name": "PATCH с пустым объектом",
                    "args": ["patch", "/tasks/7", "3.0", {}],
                    "preserve_inputs": True,
                    "no_stdout": True,
                    "expected": {
                        "method": "PATCH",
                        "path": "/tasks/7",
                        "headers": {
                            "Accept": "application/json",
                            "Planner-Client-Version": "3.0",
                            "Content-Type": "application/json",
                        },
                        "body": {},
                    },
                },
                {
                    "name": "PATCH с изменённым полем",
                    "args": ["patch", "/tasks/7", "3.1", {"is_done": False}],
                    "preserve_inputs": True,
                    "no_stdout": True,
                    "expected": {
                        "method": "PATCH",
                        "path": "/tasks/7",
                        "headers": {
                            "Accept": "application/json",
                            "Planner-Client-Version": "3.1",
                            "Content-Type": "application/json",
                        },
                        "body": {"is_done": False},
                    },
                },
                {
                    "name": "POST с новыми данными",
                    "args": [
                        "post",
                        "/tasks",
                        "4.0",
                        {"title": "Разобрать запрос", "priority": 5},
                    ],
                    "preserve_inputs": True,
                    "no_stdout": True,
                    "expected": {
                        "method": "POST",
                        "path": "/tasks",
                        "headers": {
                            "Accept": "application/json",
                            "Planner-Client-Version": "4.0",
                            "Content-Type": "application/json",
                        },
                        "body": {"title": "Разобрать запрос", "priority": 5},
                    },
                },
            ],
            "reference_code": (
                "def solve(method, path, client_version, body):\n"
                "    headers = {\n"
                '        "Accept": "application/json",\n'
                '        "Planner-Client-Version": client_version,\n'
                "    }\n"
                "    if body is not None:\n"
                '        headers["Content-Type"] = "application/json"\n'
                "    return {\n"
                '        "method": method.upper(),\n'
                '        "path": path,\n'
                '        "headers": headers,\n'
                '        "body": body,\n'
                "    }\n"
            ),
        }
    ],
    42: [
        {
            "title": "Выбираем status по исходу обработки",
            "level": "easy",
            "mode": "solve",
            "prompt": "Функция возвращает целое значение HTTP status для переданной метки исхода.",
            "hints": [
                "Сначала назовём, что произошло: успешное чтение, создание, завершение без содержимого или причина отказа.",
                "Три успешных исхода имеют разный смысл. Обычное чтение, создание ресурса и завершение без содержимого нельзя объединять в один результат.",
                "Проверим контекст ошибки: пустая прочитанная коллекция не означает отсутствие ресурса, а внутренняя проблема сервера отличается от проблемы запроса.",
            ],
            "contract": {
                "given": "Автопроверка вызывает solve(outcome). Метка outcome обозначает уже известный исход обработки: read_ok означает успешное чтение, created означает создание нового ресурса, deleted означает успешное удаление без содержимого, bad_request означает запрос, который нельзя обработать в присланном виде, not_found означает отсутствие запрошенного ресурса, server_error означает внутреннюю проблему при обработке на сервере. Неизвестные метки не входят в контракт.",
                "todo": "Функция возвращает соответствующее целое значение status для каждой из шести допустимых меток. Функция не выводит код через print() и не строит остальные части HTTP response.",
                "check": "Проверяется точное значение для всех шести допустимых исходов. Разные проверки различают успешное чтение пустой коллекции и отсутствие запрошенного ресурса. Любой вывод в консоль считается ошибкой.",
            },
            "requirements": {
                "items": [
                    "целое значение status соответствует смыслу исхода",
                    "все шесть предусмотренных меток обрабатываются",
                    "пустое успешное чтение отличается от отсутствующего ресурса",
                    "функция возвращает результат без вывода",
                ],
                "names": ["outcome"],
                "nodes": ["FunctionDef"],
            },
            "starter_code": (
                "def solve(outcome):\n"
                "    # Здесь сопоставим исход с кодом status\n"
                "    pass\n"
            ),
            "tests": [
                {
                    "name": "успешное чтение пустой коллекции",
                    "args": ["read_ok"],
                    "no_stdout": True,
                    "expected": 200,
                },
                {
                    "name": "создан новый ресурс",
                    "args": ["created"],
                    "no_stdout": True,
                    "expected": 201,
                },
                {
                    "name": "успех без содержимого",
                    "args": ["deleted"],
                    "no_stdout": True,
                    "expected": 204,
                },
                {
                    "name": "запрос не удалось обработать",
                    "args": ["bad_request"],
                    "no_stdout": True,
                    "expected": 400,
                },
                {
                    "name": "запрошенный ресурс отсутствует",
                    "args": ["not_found"],
                    "no_stdout": True,
                    "expected": 404,
                },
                {
                    "name": "внутренняя ошибка сервера",
                    "args": ["server_error"],
                    "no_stdout": True,
                    "expected": 500,
                },
            ],
            "reference_code": (
                "def solve(outcome):\n"
                "    status_by_outcome = {\n"
                '        "read_ok": 200,\n'
                '        "created": 201,\n'
                '        "deleted": 204,\n'
                '        "bad_request": 400,\n'
                '        "not_found": 404,\n'
                '        "server_error": 500,\n'
                "    }\n"
                "    return status_by_outcome[outcome]\n"
            ),
        }
    ],
    "42.1": [
        {
            "title": "Response-модель сохраняет status и body",
            "level": "easy",
            "mode": "solve",
            "prompt": "Функция возвращает учебную модель готового HTTP response из переданных status, body и request_id.",
            "hints": [
                "request_id относится к обмену между клиентом и сервером и становится значением X-Request-ID.",
                "В этом упражнении None означает отсутствие body. Пустой словарь {} всё ещё является существующим JSON-телом.",
                "Сначала сформируйте заголовки по наличию body, затем верните response с переданными status и body.",
            ],
            "contract": {
                "given": "Интерпретатор вызывает solve(status, body, request_id). Согласованные status и body, а также request_id уже переданы.",
                "given_items": [
                    "status: готовое целое значение HTTP-статуса, выбирать его не нужно.",
                    "body: готовый словарь Python, представляющий JSON-объект, или None; сериализовать и отправлять запрос не нужно.",
                    "request_id: готовая строка идентификатора обращения.",
                ],
                "todo": "Соберите и верните учебную модель response.",
                "todo_items": [
                    "Верните словарь ровно с ключами status, headers и body; сохраните переданные status и body.",
                    "Всегда добавьте в headers X-Request-ID со значением request_id. Добавьте Content-Type: application/json только при body, не равном None. Не изменяйте входы и ничего не выводите.",
                    "После автопроверки устно разберите изменённый случай: status=404, body={\"detail\": \"Книга с номером 58 не найдена\"}, request_id=\"req-505\". Объясните, что передаёт каждая часть response и почему здесь нужен JSON Content-Type.",
                ],
                "check": "Весь результат сравнивается для status 200 и 201 с JSON-телом, 404 с JSON-телом ошибки, 204 без body и пустого JSON-объекта. Также проверяются сохранность входов и отсутствие вывода в консоль.",
            },
            "requirements": {
                "items": [
                    "результат содержит ровно status, headers и body",
                    "переданные status и body сохраняются без подмены",
                    "X-Request-ID получает переданный request_id",
                    "Content-Type присутствует для словаря, включая {}, и отсутствует для None",
                    "входные значения не меняются и результат не выводится через print()",
                ],
                "names": ["status", "body", "request_id"],
                "nodes": ["FunctionDef"],
            },
            "starter_code": "def solve(status, body, request_id):\n    # Соберите учебную модель response\n    pass\n",
            "tests": [
                {
                    "name": "успешный JSON-ответ",
                    "args": [200, {"id": 12, "title": "Разобрать response", "is_done": False}, "req-401"],
                    "preserve_inputs": True,
                    "no_stdout": True,
                    "expected": {
                        "status": 200,
                        "headers": {"X-Request-ID": "req-401", "Content-Type": "application/json"},
                        "body": {"id": 12, "title": "Разобрать response", "is_done": False},
                    },
                },
                {
                    "name": "создание ресурса",
                    "args": [201, {"id": 13, "title": "Проверить Content-Type", "is_done": False}, "req-402"],
                    "preserve_inputs": True,
                    "no_stdout": True,
                    "expected": {
                        "status": 201,
                        "headers": {"X-Request-ID": "req-402", "Content-Type": "application/json"},
                        "body": {"id": 13, "title": "Проверить Content-Type", "is_done": False},
                    },
                },
                {
                    "name": "JSON-ошибка not found",
                    "args": [404, {"detail": "Задача с номером 58 не найдена"}, "req-403"],
                    "preserve_inputs": True,
                    "no_stdout": True,
                    "expected": {
                        "status": 404,
                        "headers": {"X-Request-ID": "req-403", "Content-Type": "application/json"},
                        "body": {"detail": "Задача с номером 58 не найдена"},
                    },
                },
                {
                    "name": "ответ без body",
                    "args": [204, None, "req-404"],
                    "preserve_inputs": True,
                    "no_stdout": True,
                    "expected": {"status": 204, "headers": {"X-Request-ID": "req-404"}, "body": None},
                },
                {
                    "name": "пустой JSON-объект",
                    "args": [200, {}, "req-405"],
                    "preserve_inputs": True,
                    "no_stdout": True,
                    "expected": {
                        "status": 200,
                        "headers": {"X-Request-ID": "req-405", "Content-Type": "application/json"},
                        "body": {},
                    },
                },
            ],
            "reference_code": (
                "def solve(status, body, request_id):\n"
                '    headers = {"X-Request-ID": request_id}\n'
                "    if body is not None:\n"
                '        headers["Content-Type"] = "application/json"\n'
                '    return {"status": status, "headers": headers, "body": body}\n'
            ),
        }
    ],
    46: [{'title': 'Модель HTTP request',
       'level': 'easy',
       'mode': 'solve',
        'prompt': 'Результат — учебное описание HTTP request в виде словаря, собранное из готовых значений.',
       'hints': ['Обязательные заголовки отличаются от заголовка формата body. Отсутствие тела обозначает None.',
                 'Пустой словарь всё ещё переданное тело. Отсутствие тела определяется сравнением с None.',
                  'Короткую запись method нужно привести к верхнему регистру. Остальные входные значения сохраняются без изменений.'],
       'contract': {'given': 'Автопроверка вызывает solve(method, path, client_version, body). method принимает get, '
                              'post или patch в нижнем регистре; path и client_version являются строками, body '
                              'является словарём или None. Сеть отправлять не нужно.',
                    'todo': 'Собираем словарь с ключами method, path, headers и body. Метод приводим к верхнему '
                            'регистру. В headers всегда добавляем Accept: application/json и '
                            'Planner-Client-Version со значением client_version. Content-Type добавляем только '
                            'когда body не равен None. Path и body возвращаем без изменения. Исходный body и '
                            'другие входные аргументы не меняем. Ничего не выводим.',
                     'check': 'Точное сравнение результата проверяет ключ headers и его содержимое для GET без тела, '
                              'POST с пустым и заполненным словарём, а также короткой записи patch с другим path. '
                              'Тесты сравнивают входные аргументы до и после вызова. Функция не должна ничего выводить.'},
       'requirements': {'items': ["ключ 'headers' с нужными заголовками в результате",
                                  'условное добавление Content-Type',
                                  'method.upper()',
                                  'четыре точных ключа результата'],
                        'names': ['method', 'path', 'client_version', 'body'],
                        'nodes': ['FunctionDef'],
                        'attributes': ['upper']},
       'starter_code': 'def solve(method, path, client_version, body):\n'
                       '    # Здесь формируются headers\n'
                       '    # Здесь возвращаются четыре части request\n'
                       '    pass\n',
       'tests': [{'name': 'GET без body',
                  'args': ['get', '/tasks', '1.0', None],
                  'preserve_inputs': True,
                  'no_stdout': True,
                  'expected': {'method': 'GET',
                               'path': '/tasks',
                               'headers': {'Accept': 'application/json', 'Planner-Client-Version': '1.0'},
                               'body': None}},
                 {'name': 'POST с пустым JSON-объектом',
                  'args': ['post', '/tasks', '1.0', {}],
                  'preserve_inputs': True,
                  'no_stdout': True,
                  'expected': {'method': 'POST',
                               'path': '/tasks',
                               'headers': {'Accept': 'application/json',
                                           'Planner-Client-Version': '1.0',
                                           'Content-Type': 'application/json'},
                               'body': {}}},
                 {'name': 'POST с заполненным JSON',
                  'args': ['post', '/tasks', '1.1', {'title': 'HTTP', 'priority': 4}],
                  'preserve_inputs': True,
                  'no_stdout': True,
                  'expected': {'method': 'POST',
                               'path': '/tasks',
                               'headers': {'Accept': 'application/json',
                                           'Planner-Client-Version': '1.1',
                                           'Content-Type': 'application/json'},
                               'body': {'title': 'HTTP', 'priority': 4}}},
                  {'name': 'Короткая запись метода и другой path',
                  'args': ['patch', '/tasks/7', '2.0', {'is_done': True}],
                  'preserve_inputs': True,
                  'no_stdout': True,
                  'expected': {'method': 'PATCH',
                               'path': '/tasks/7',
                               'headers': {'Accept': 'application/json',
                                           'Planner-Client-Version': '2.0',
                                           'Content-Type': 'application/json'},
                               'body': {'is_done': True}}}],
       'reference_code': 'def solve(method, path, client_version, body):\n'
                         '    headers = {\n'
                         '        "Accept": "application/json",\n'
                         '        "Planner-Client-Version": client_version,\n'
                         '    }\n'
                         '    if body is not None:\n'
                         '        headers["Content-Type"] = "application/json"\n'
                         '    return {\n'
                         '        "method": method.upper(),\n'
                         '        "path": path,\n'
                         '        "headers": headers,\n'
                         '        "body": body,\n'
                         '    }\n'}],
    47: [{'title': 'HTTP response-модель',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Функция возвращает словарь с полями status, headers и body. В headers передаётся готовый request_id; '
                 'Content-Type добавляется только при наличии body.',
       'hints': ['request_id уже содержит идентификатор обмена; его значение становится значением X-Request-ID.',
                 'body=None обозначает отсутствие тела. Пустой словарь {} остаётся существующим JSON body.',
                 'Status и body сохраняются без изменений. Функция не выводит результат через print().'],
       'contract': {'given': 'Автопроверка вызывает solve(status, body, request_id). status: целое число '
                              'HTTP-статуса, body: словарь Python, представляющий JSON-объект, или None, request_id: строка. Нужно представить готовый '
                              'response обычным словарём Python. Пары status и body уже согласованы, выбирать статус '
                              'или проверять смысл операции не нужно.',
                    'todo': 'Формируем response из status, headers и body. В headers добавляем X-Request-ID со значением '
                            'request_id. Если body не равен None, добавляем Content-Type: application/json. Результат '
                            'содержит ровно ключи status, headers и body. Входные аргументы не изменяем и ничего не выводим.',
                    'check': 'Сравнивается весь результат для 200 и 201 с JSON body, 404 с JSON body, 204 без body и пустого '
                             'JSON-объекта. Это проверяет ключ headers и его значения. Тесты также сравнивают входные '
                             'аргументы до и после вызова; print() приводит к ошибке автопроверки.'},
       'requirements': {'items': ["ключ headers в результате содержит X-Request-ID и нужный Content-Type",
                                  'Content-Type только для body',
                                  'пустой словарь считается существующим body',
                                  'точные ключи результата status, headers, body',
                                  'status и body без подмены'],
                        'names': ['status', 'body', 'request_id'],
                        'nodes': ['FunctionDef']},
       'starter_code': 'def solve(status, body, request_id):\n    # Здесь формируются headers и response\n    pass\n',
       'tests': [{'name': 'успешный JSON',
                  'args': [200, {'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False}, 'req-101'],
                  'preserve_inputs': True,
                  'no_stdout': True,
                  'expected': {'status': 200,
                               'headers': {'X-Request-ID': 'req-101', 'Content-Type': 'application/json'},
                               'body': {'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False}}},
                 {'name': 'созданный ресурс',
                  'args': [201, {'id': 2, 'title': 'Planner', 'priority': 2, 'is_done': False}, 'req-102'],
                  'preserve_inputs': True,
                  'no_stdout': True,
                  'expected': {'status': 201,
                               'headers': {'X-Request-ID': 'req-102', 'Content-Type': 'application/json'},
                               'body': {'id': 2, 'title': 'Planner', 'priority': 2, 'is_done': False}}},
                 {'name': 'ошибка not found',
                 'args': [404, {'detail': 'Task not found'}, 'req-202'],
                  'preserve_inputs': True,
                  'no_stdout': True,
                  'expected': {'status': 404,
                               'headers': {'X-Request-ID': 'req-202', 'Content-Type': 'application/json'},
                               'body': {'detail': 'Task not found'}}},
                 {'name': 'успех без body',
                 'args': [204, None, 'req-303'],
                  'preserve_inputs': True,
                  'no_stdout': True,
                  'expected': {'status': 204, 'headers': {'X-Request-ID': 'req-303'}, 'body': None}},
                 {'name': 'пустой JSON-объект',
                 'args': [200, {}, 'req-404'],
                  'preserve_inputs': True,
                  'no_stdout': True,
                  'expected': {'status': 200,
                               'headers': {'X-Request-ID': 'req-404', 'Content-Type': 'application/json'},
                               'body': {}}}],
       'reference_code': 'def solve(status, body, request_id):\n'
                         '    headers = {"X-Request-ID": request_id}\n'
                         '    if body is not None:\n'
                         '        headers["Content-Type"] = "application/json"\n'
                         '    return {"status": status, "headers": headers, "body": body}\n'}],
    43: [{'title': 'Подбираем HTTP-метод по действию',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Реализуем solve(action): функция возвращает HTTP-метод для действия над задачами Planner.',
       'contract': {'given': 'action принимает одно из значений: list, get, create, replace, update, delete. '
                             'list и get означают чтение. replace означает полную замену, update изменяет только переданные поля.',
                    'todo': 'Создаём словарь methods для шести действий. Функция возвращает метод для action строкой '
                            'в верхнем регистре. Вывод не нужен.',
                    'check': 'Проверяются все шесть действий. Сеть, адреса и обработка неизвестного action не нужны.'},
       'hints': ['Чтение списка и одной задачи имеет один смысл, хотя объектов разное количество.',
                 'Для replace вспоминаем полную форму PUT; update меняет лишь поля, переданные клиентом.'],
       'requirements': {'names': ['action', 'methods'],
                        'nodes': ['FunctionDef']},
       'starter_code': 'def solve(action):\n    pass\n',
       'tests': [{'name': 'чтение списка', 'args': ['list'], 'expected': 'GET', 'no_stdout': True},
                 {'name': 'чтение одной задачи', 'args': ['get'], 'expected': 'GET', 'no_stdout': True},
                 {'name': 'создание задачи', 'args': ['create'], 'expected': 'POST', 'no_stdout': True},
                 {'name': 'полная замена', 'args': ['replace'], 'expected': 'PUT', 'no_stdout': True},
                 {'name': 'частичное изменение', 'args': ['update'], 'expected': 'PATCH', 'no_stdout': True},
                 {'name': 'удаление задачи', 'args': ['delete'], 'expected': 'DELETE', 'no_stdout': True}],
       'reference_code': 'def solve(action):\n'
                         '    methods = {\n'
                         '        "list": "GET",\n'
                         '        "get": "GET",\n'
                         '        "create": "POST",\n'
                         '        "replace": "PUT",\n'
                         '        "update": "PATCH",\n'
                         '        "delete": "DELETE",\n'
                         '    }\n'
                         '    return methods[action]\n'}],
    44: [{
        'title': 'Пары method и path для восьми действий Planner',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Функция solve(action, task_id) возвращает method и path для известного действия Planner API.',
        'contract': {
            'given': 'action принимает одно из значений: list, get, create, replace, update, delete, health, stats. task_id является целым id для get, replace, update и delete. Для остальных действий task_id равен None. Таблица methods уже дана в заготовке.',
            'todo': 'Функция берёт method из methods[action], выбирает path по области операции и возвращает словарь только с ключами method и path без печати в консоль. Для действий get, replace, update и delete функция подставляет переданный task_id в path.',
            'check': 'Проверяются все восемь действий и несколько id для каждого item-действия, чтобы подтвердить использование task_id. Не нужно проверять существование задачи, отправлять запрос или обрабатывать неизвестное action.'
        },
        'hints': [
            'Сначала разделяем действия на три группы: collection, выбранный item и технические маршруты.',
            'list и create используют /tasks. get, replace, update и delete добавляют переданный id к /tasks/.',
            'health и stats используют свои path. Таблица methods уже связывает каждое действие с методом.'
        ],
        'requirements': {
            'names': ['action', 'task_id', 'methods'],
            'nodes': ['FunctionDef']
        },
        'starter_code': 'methods = {\n'
                        '    "list": "GET",\n'
                        '    "get": "GET",\n'
                        '    "create": "POST",\n'
                        '    "replace": "PUT",\n'
                        '    "update": "PATCH",\n'
                        '    "delete": "DELETE",\n'
                        '    "health": "GET",\n'
                        '    "stats": "GET",\n'
                        '}\n'
                        '\n'
                        'def solve(action, task_id):\n'
                        '    pass\n',
        'tests': [
            {'name': 'чтение collection', 'args': ['list', None],
             'expected': {'method': 'GET', 'path': '/tasks'}, 'no_stdout': True},
            {'name': 'создание в collection', 'args': ['create', None],
             'expected': {'method': 'POST', 'path': '/tasks'}, 'no_stdout': True},
            {'name': 'чтение item', 'args': ['get', 7],
             'expected': {'method': 'GET', 'path': '/tasks/7'}, 'no_stdout': True},
            {'name': 'чтение другого item', 'args': ['get', 34],
             'expected': {'method': 'GET', 'path': '/tasks/34'}, 'no_stdout': True},
            {'name': 'полная замена item', 'args': ['replace', 12],
             'expected': {'method': 'PUT', 'path': '/tasks/12'}, 'no_stdout': True},
            {'name': 'полная замена другого item', 'args': ['replace', 3],
             'expected': {'method': 'PUT', 'path': '/tasks/3'}, 'no_stdout': True},
            {'name': 'частичное изменение item', 'args': ['update', 42],
             'expected': {'method': 'PATCH', 'path': '/tasks/42'}, 'no_stdout': True},
            {'name': 'частичное изменение другого item', 'args': ['update', 88],
             'expected': {'method': 'PATCH', 'path': '/tasks/88'}, 'no_stdout': True},
            {'name': 'удаление item', 'args': ['delete', 91],
             'expected': {'method': 'DELETE', 'path': '/tasks/91'}, 'no_stdout': True},
            {'name': 'удаление другого item', 'args': ['delete', 5],
             'expected': {'method': 'DELETE', 'path': '/tasks/5'}, 'no_stdout': True},
            {'name': 'техническая проверка', 'args': ['health', None],
             'expected': {'method': 'GET', 'path': '/health'}, 'no_stdout': True},
            {'name': 'агрегаты по задачам', 'args': ['stats', None],
             'expected': {'method': 'GET', 'path': '/stats'}, 'no_stdout': True}
        ],
        'reference_code': 'methods = {\n'
                          '    "list": "GET",\n'
                          '    "get": "GET",\n'
                          '    "create": "POST",\n'
                          '    "replace": "PUT",\n'
                          '    "update": "PATCH",\n'
                          '    "delete": "DELETE",\n'
                          '    "health": "GET",\n'
                          '    "stats": "GET",\n'
                          '}\n'
                          '\n'
                          'def solve(action, task_id):\n'
                          '    if action == "list" or action == "create":\n'
                          '        path = "/tasks"\n'
                          '    elif action == "health":\n'
                          '        path = "/health"\n'
                          '    elif action == "stats":\n'
                          '        path = "/stats"\n'
                          '    else:\n'
                          '        path = f"/tasks/{task_id}"\n'
                          '    return {"method": methods[action], "path": path}\n'
    }],
    50: [{
        'title': 'Распределите значения по частям запроса',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'solve(action, task_id, values) собирает учебную модель запроса Planner API. Готовая route_for уже выбирает method и path.',
        'contract': {
            'given': 'action принимает list, create, get, replace, update, delete, health или stats. task_id задан для get, replace, update и delete, в остальных случаях равен None. values содержит допустимые значения операции, без неизвестных полей и явного None.',
            'todo': 'Собираем словарь с точными ключами method, path, query и body. Для list переносим в query только переданные is_done, sort_desc и limit. Для create формируем body из title и priority. Для replace и update копируем переданные значения в body. Для остальных действий оставляем query пустым, а body равным None.',
            'check': 'Проверяются отсутствие выдуманных query-defaults, сохранение явного False, состав body и готовые method/path. values остаётся неизменным. Запрос не отправляем, существование задачи не проверяем.'
        },
        'hints': [
            'Сначала определяем действия, которым нужны query или body. Для остальных частей запроса оставляем значения по умолчанию.',
            'Для list переносим только ключи, которые уже есть в values. False тоже является переданным значением.',
            'Для create создаём новый словарь только с title и priority. Для replace и update копируем values, чтобы не менять вход.',
            'Для PATCH переносим все переданные поля. Одно поле и несколько обрабатываются одинаково; False тоже сохраняем как переданное значение.'
        ],
        'requirements': {
            'items': [
                'результат содержит method, path, query и body',
                'query всегда словарь, даже когда параметров нет',
                'отсутствующие query не подменяются defaults сервера',
                'create body содержит только title и priority',
                'replace и update сохраняют переданные поля',
                'values остаётся неизменным'
            ],
            'names': ['action', 'task_id', 'values', 'route_for'],
            'nodes': ['FunctionDef']
        },
        'starter_code': 'methods = {\n'
                        '    "list": "GET",\n'
                        '    "get": "GET",\n'
                        '    "create": "POST",\n'
                        '    "replace": "PUT",\n'
                        '    "update": "PATCH",\n'
                        '    "delete": "DELETE",\n'
                        '    "health": "GET",\n'
                        '    "stats": "GET",\n'
                        '}\n'
                        '\n'
                        'def route_for(action, task_id):\n'
                        '    if action == "health":\n'
                        '        path = "/health"\n'
                        '    elif action == "stats":\n'
                        '        path = "/stats"\n'
                        '    elif action == "list" or action == "create":\n'
                        '        path = "/tasks"\n'
                        '    else:\n'
                        '        path = f"/tasks/{task_id}"\n'
                        '    return {"method": methods[action], "path": path}\n'
                        '\n'
                        'def solve(action, task_id, values):\n'
                        '    # Распределяем входные значения по query и body\n'
                        '    pass\n',
        'tests': [
            {'name': 'список без фильтров', 'args': ['list', None, {}], 'expected': {'method': 'GET', 'path': '/tasks', 'query': {}, 'body': None}, 'preserve_inputs': True},
            {'name': 'список с False и настройками', 'args': ['list', None, {'is_done': False, 'sort_desc': True, 'limit': 5}], 'expected': {'method': 'GET', 'path': '/tasks', 'query': {'is_done': False, 'sort_desc': True, 'limit': 5}, 'body': None}, 'preserve_inputs': True},
            {'name': 'отдельный фильтр True', 'args': ['list', None, {'is_done': True}], 'expected': {'method': 'GET', 'path': '/tasks', 'query': {'is_done': True}, 'body': None}, 'preserve_inputs': True},
            {'name': 'отдельный limit', 'args': ['list', None, {'limit': 8}], 'expected': {'method': 'GET', 'path': '/tasks', 'query': {'limit': 8}, 'body': None}, 'preserve_inputs': True},
            {'name': 'явный sort_desc False', 'args': ['list', None, {'sort_desc': False}], 'expected': {'method': 'GET', 'path': '/tasks', 'query': {'sort_desc': False}, 'body': None}, 'preserve_inputs': True},
            {'name': 'создание без серверных полей', 'args': ['create', None, {'title': 'Изучить HTTP', 'priority': 4}], 'expected': {'method': 'POST', 'path': '/tasks', 'query': {}, 'body': {'title': 'Изучить HTTP', 'priority': 4}}, 'preserve_inputs': True},
            {'name': 'полная замена', 'args': ['replace', 12, {'title': 'Planner API', 'priority': 3, 'is_done': True}], 'expected': {'method': 'PUT', 'path': '/tasks/12', 'query': {}, 'body': {'title': 'Planner API', 'priority': 3, 'is_done': True}}, 'preserve_inputs': True},
            {'name': 'частичное изменение с False', 'args': ['update', 7, {'is_done': False}], 'expected': {'method': 'PATCH', 'path': '/tasks/7', 'query': {}, 'body': {'is_done': False}}, 'preserve_inputs': True},
            {'name': 'PATCH одного title', 'args': ['update', 9, {'title': 'Новый заголовок'}], 'expected': {'method': 'PATCH', 'path': '/tasks/9', 'query': {}, 'body': {'title': 'Новый заголовок'}}, 'preserve_inputs': True},
            {'name': 'PATCH только priority', 'args': ['update', 10, {'priority': 5}], 'expected': {'method': 'PATCH', 'path': '/tasks/10', 'query': {}, 'body': {'priority': 5}}, 'preserve_inputs': True},
            {'name': 'PATCH нескольких полей', 'args': ['update', 11, {'priority': 5, 'is_done': False}], 'expected': {'method': 'PATCH', 'path': '/tasks/11', 'query': {}, 'body': {'priority': 5, 'is_done': False}}, 'preserve_inputs': True},
            {'name': 'чтение item', 'args': ['get', 7, {}], 'expected': {'method': 'GET', 'path': '/tasks/7', 'query': {}, 'body': None}},
            {'name': 'удаление item', 'args': ['delete', 7, {}], 'expected': {'method': 'DELETE', 'path': '/tasks/7', 'query': {}, 'body': None}},
            {'name': 'health отдельно от tasks', 'args': ['health', None, {}], 'expected': {'method': 'GET', 'path': '/health', 'query': {}, 'body': None}},
            {'name': 'stats отдельно от фильтра списка', 'args': ['stats', None, {}], 'expected': {'method': 'GET', 'path': '/stats', 'query': {}, 'body': None}}
        ],
        'reference_code': 'methods = {\n'
                          '    "list": "GET",\n'
                          '    "get": "GET",\n'
                          '    "create": "POST",\n'
                          '    "replace": "PUT",\n'
                          '    "update": "PATCH",\n'
                          '    "delete": "DELETE",\n'
                          '    "health": "GET",\n'
                          '    "stats": "GET",\n'
                          '}\n'
                          '\n'
                          'def route_for(action, task_id):\n'
                          '    if action == "health":\n'
                          '        path = "/health"\n'
                          '    elif action == "stats":\n'
                          '        path = "/stats"\n'
                          '    elif action == "list" or action == "create":\n'
                          '        path = "/tasks"\n'
                          '    else:\n'
                          '        path = f"/tasks/{task_id}"\n'
                          '    return {"method": methods[action], "path": path}\n'
                          '\n'
                          'def solve(action, task_id, values):\n'
                          '    route = route_for(action, task_id)\n'
                          '    query = {}\n'
                          '    body = None\n'
                          '    if action == "list":\n'
                          '        for key in ("is_done", "sort_desc", "limit"):\n'
                          '            if key in values:\n'
                          '                query[key] = values[key]\n'
                          '    elif action == "create":\n'
                          '        body = {"title": values["title"], "priority": values["priority"]}\n'
                          '    elif action == "replace" or action == "update":\n'
                          '        body = values.copy()\n'
                          '    return {"method": route["method"], "path": route["path"], "query": query, "body": body}\n'
    }],
}

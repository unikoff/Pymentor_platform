"""Учебная практика блока. Редактируйте задания здесь."""

from __future__ import annotations

from typing import Any


CODE_TASKS: dict[int, list[dict[str, Any]]] = {
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
                    'todo': 'Верните словарь с ключами method, path, headers и body. Метод приведите к верхнему '
                            'регистру. В headers всегда добавьте Accept: application/json и '
                            'Planner-Client-Version со значением client_version. Добавляйте Content-Type: '
                            'application/json, только когда body не равен None. Path и body сохраняются без изменений. Ничего не печатайте.',
                     'check': 'Сравнивается весь результат для GET без тела, POST с пустым и заполненным словарём, '
                              'а также короткой записи patch с другим path. Функция не должна ничего выводить.'},
       'requirements': {'items': ['словарь headers',
                                  'условное добавление Content-Type',
                                  'method.upper()',
                                  'четыре точных ключа результата'],
                        'names': ['method', 'path', 'client_version', 'body', 'headers'],
                        'nodes': ['FunctionDef', 'If'],
                        'attributes': ['upper']},
       'starter_code': 'def solve(method, path, client_version, body):\n'
                       '    # Здесь формируются headers\n'
                       '    # Здесь возвращаются четыре части request\n'
                       '    pass\n',
       'tests': [{'name': 'GET без body',
                  'args': ['get', '/tasks', '1.0', None],
                  'no_stdout': True,
                  'expected': {'method': 'GET',
                               'path': '/tasks',
                               'headers': {'Accept': 'application/json', 'Planner-Client-Version': '1.0'},
                               'body': None}},
                 {'name': 'POST с пустым JSON-объектом',
                  'args': ['post', '/tasks', '1.0', {}],
                  'no_stdout': True,
                  'expected': {'method': 'POST',
                               'path': '/tasks',
                               'headers': {'Accept': 'application/json',
                                           'Planner-Client-Version': '1.0',
                                           'Content-Type': 'application/json'},
                               'body': {}}},
                 {'name': 'POST с заполненным JSON',
                  'args': ['post', '/tasks', '1.1', {'title': 'HTTP', 'priority': 4}],
                  'no_stdout': True,
                  'expected': {'method': 'POST',
                               'path': '/tasks',
                               'headers': {'Accept': 'application/json',
                                           'Planner-Client-Version': '1.1',
                                           'Content-Type': 'application/json'},
                               'body': {'title': 'HTTP', 'priority': 4}}},
                  {'name': 'Короткая запись метода и другой path',
                  'args': ['patch', '/tasks/7', '2.0', {'is_done': True}],
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
                    'todo': 'Функция формирует headers с X-Request-ID, значение берётся из request_id. При body, не равном '
                            'None, в headers добавляется Content-Type: application/json. Результат содержит ровно ключи '
                            'status, headers, body; входные status и body сохраняются. Вывода через print() нет.',
                    'check': 'Проверяются ответы 200 и 201 с JSON body, ошибка 404 с JSON body, ответ 204 без body и пустой '
                             'JSON-объект как существующее body. Для 204 Content-Type не добавляется; print() приводит к '
                             'ошибке автопроверки.'},
       'requirements': {'items': ['словарь headers с полем X-Request-ID со значением request_id',
                                  'Content-Type только для body',
                                  'пустой словарь считается существующим body',
                                  'точные ключи результата status, headers, body',
                                  'status и body без подмены'],
                        'names': ['status', 'body', 'request_id', 'headers'],
                        'nodes': ['FunctionDef', 'If']},
       'starter_code': 'def solve(status, body, request_id):\n    # Здесь формируются headers и response\n    pass\n',
       'tests': [{'name': 'успешный JSON',
                  'args': [200, {'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False}, 'req-101'],
                  'no_stdout': True,
                  'expected': {'status': 200,
                               'headers': {'X-Request-ID': 'req-101', 'Content-Type': 'application/json'},
                               'body': {'id': 1, 'title': 'HTTP', 'priority': 4, 'is_done': False}}},
                 {'name': 'созданный ресурс',
                  'args': [201, {'id': 2, 'title': 'Planner', 'priority': 2, 'is_done': False}, 'req-102'],
                  'no_stdout': True,
                  'expected': {'status': 201,
                               'headers': {'X-Request-ID': 'req-102', 'Content-Type': 'application/json'},
                               'body': {'id': 2, 'title': 'Planner', 'priority': 2, 'is_done': False}}},
                 {'name': 'ошибка not found',
                 'args': [404, {'detail': 'Task not found'}, 'req-202'],
                  'no_stdout': True,
                  'expected': {'status': 404,
                               'headers': {'X-Request-ID': 'req-202', 'Content-Type': 'application/json'},
                               'body': {'detail': 'Task not found'}}},
                 {'name': 'успех без body',
                 'args': [204, None, 'req-303'],
                  'no_stdout': True,
                  'expected': {'status': 204, 'headers': {'X-Request-ID': 'req-303'}, 'body': None}},
                 {'name': 'пустой JSON-объект',
                 'args': [200, {}, 'req-404'],
                  'no_stdout': True,
                  'expected': {'status': 200,
                               'headers': {'X-Request-ID': 'req-404', 'Content-Type': 'application/json'},
                               'body': {}}}],
       'reference_code': 'def solve(status, body, request_id):\n'
                         '    headers = {"X-Request-ID": request_id}\n'
                         '    if body is not None:\n'
                         '        headers["Content-Type"] = "application/json"\n'
                         '    return {"status": status, "headers": headers, "body": body}\n'}],
    48: [{'title': 'Выберите HTTP-метод по действию',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Напишите solve(action), которая возвращает HTTP-метод для действия над задачами Planner.',
       'contract': {'given': 'action принимает одно из значений: list, get, create, replace, update, delete. '
                             'list и get означают чтение. replace означает полную замену, update изменяет только переданные поля.',
                    'todo': 'Создайте словарь methods для шести действий. Верните метод для action строкой '
                            'в верхнем регистре, не печатая его.',
                    'check': 'Проверяются все шесть действий. Сеть, адреса и обработка неизвестного action не нужны.'},
       'hints': ['Чтение списка и одной задачи имеет один смысл, хотя объектов разное количество.',
                 'Для replace вспомните полную форму PUT; update меняет лишь поля, переданные клиентом.'],
       'requirements': {'names': ['action', 'methods'],
                        'nodes': ['FunctionDef', 'Dict']},
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
    49: [{
        'title': 'Соберите адрес операции Planner API',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Функция solve(action, task_id) возвращает method и path для известного действия Planner API.',
        'contract': {
            'given': 'action принимает одно из значений: list, get, create, replace, update, delete, health, stats. task_id является целым id для get, replace, update и delete. Для остальных действий task_id равен None. Таблица methods уже дана в заготовке.',
            'todo': 'Выберите path по области операции и верните словарь с ключами method и path. Метод возьмите из methods[action], а для item используйте переданный task_id.',
            'check': 'Проверяются все восемь действий и несколько id для каждого item-действия, чтобы подтвердить использование task_id. Не нужно проверять существование задачи, отправлять запрос или обрабатывать неизвестное action.'
        },
        'hints': [
            'Сначала разделите действия на три группы: collection, конкретный item и технические проверки.',
            'list и create обращаются к collection. get, replace, update и delete требуют адреса выбранного item.',
            'Для item добавьте переданный id к общей основе /tasks/. Таблица methods уже связывает действие с HTTP-методом.'
        ],
        'requirements': {
            'names': ['action', 'task_id', 'methods', 'path'],
            'nodes': ['FunctionDef', 'If']
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
                          '    if action == "health":\n'
                          '        path = "/health"\n'
                          '    elif action == "stats":\n'
                          '        path = "/stats"\n'
                          '    elif action == "list" or action == "create":\n'
                          '        path = "/tasks"\n'
                          '    else:\n'
                          '        path = "/tasks/" + str(task_id)\n'
                          '    return {"method": methods[action], "path": path}\n'
    }],
    50: [{
        'title': 'Распределите значения по частям запроса',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'solve(action, task_id, values) собирает учебную модель запроса Planner API. Готовая route_for уже выбирает method и path.',
        'contract': {
            'given': 'action принимает list, create, get, replace, update, delete, health или stats. task_id задан для get, replace, update и delete, в остальных случаях равен None. values содержит допустимые значения операции, без неизвестных полей и явного None.',
            'todo': 'Верните словарь с точными ключами method, path, query и body. Для list перенесите только переданные is_done, sort_desc и limit в query. Для create сформируйте body из title и priority. Для replace и update скопируйте переданные значения в body. Для остальных действий оставьте query пустым, а body равным None.',
            'check': 'Проверяются отсутствие выдуманных query-defaults, сохранение явного False, состав body и готовые method/path. values не должен меняться. Не отправляйте запрос и не проверяйте задачу.'
        },
        'hints': [
            'Сначала определите действия, которым нужны query или body. Для остальных частей запроса оставьте значения по умолчанию.',
            'Для list переносите только ключи, которые уже есть в values. False тоже является переданным значением.',
            'Для create создайте новый словарь только с title и priority. Для replace и update скопируйте values, чтобы не менять вход.',
            'Для PATCH одного поля проверяется наличие ключа, а не истинность значения. Пример: if "is_done" in values: body["is_done"] = values["is_done"].'
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
            'names': ['action', 'task_id', 'values', 'route_for', 'query', 'body'],
            'nodes': ['FunctionDef', 'If', 'Dict']
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
                        '    # Разместите переданные значения в query или body\n'
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

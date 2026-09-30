from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    69: [{'title': 'Маршрут HTTP-запроса',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Создайте список steps и последовательно смоделируйте путь запроса. Всегда сначала добавьте '
                 'middleware_before и route_matching. Если route не найден, верните status 404 после '
                 'middleware_after. Если route найден, добавьте validation. При невалидных данных верните 422 после '
                 'middleware_after. При валидных данных добавьте dependencies. Если dependency завершилась ошибкой, '
                 'верните 403 после middleware_after. При успешной dependency добавьте endpoint, serialization и '
                 'middleware_after, затем верните status 200. Результат solve — словарь с ключами status и steps.',
       'contract': {'given': 'Автопроверка вызывает solve(route_found, input_valid, dependency_ok). Все три '
                             'аргумента имеют тип bool. Они описывают три последовательные проверки FastAPI: найден '
                             'ли route, прошла ли валидация входных данных и успешно ли выполнилась dependency.',
                    'todo': 'Создайте список steps и последовательно смоделируйте путь запроса. Всегда сначала '
                            'добавьте middleware_before и route_matching. Если route не найден, верните status 404 '
                            'после middleware_after. Если route найден, добавьте validation. При невалидных данных '
                            'верните 422 после middleware_after. При валидных данных добавьте dependencies. Если '
                            'dependency завершилась ошибкой, верните 403 после middleware_after. При успешной '
                            'dependency добавьте endpoint, serialization и middleware_after, затем верните status '
                            '200. Результат solve — словарь с ключами status и steps.',
                    'check': 'Платформа проверит четыре пути: неизвестный route, ошибка валидации, ошибка dependency '
                             'и успешный request. Сравниваются status и полный порядок steps. Этапы после возникшей '
                             'ошибки не должны выполняться.'},
       'requirements': {'items': ['список steps',
                                  'ветки 404, 422, 403 и 200',
                                  'ранний return после ошибки',
                                  'middleware_after в каждом результате'],
                        'names': ['route_found', 'input_valid', 'dependency_ok', 'steps'],
                        'nodes': ['FunctionDef', 'If'],
                        'attributes': ['append']},
       'starter_code': 'def solve(route_found, input_valid, dependency_ok):\n'
                       '    steps = []\n'
                       '    # Добавьте этапы в фактическом порядке\n'
                       '    # Верните словарь status и steps\n'
                       '    pass\n',
       'tests': [{'name': 'route не найден',
                  'args': [False, True, True],
                  'expected': {'status': 404, 'steps': ['middleware_before', 'route_matching', 'middleware_after']}},
                 {'name': 'ошибка валидации',
                  'args': [True, False, True],
                  'expected': {'status': 422,
                               'steps': ['middleware_before', 'route_matching', 'validation', 'middleware_after']}},
                 {'name': 'ошибка dependency',
                  'args': [True, True, False],
                  'expected': {'status': 403,
                               'steps': ['middleware_before',
                                         'route_matching',
                                         'validation',
                                         'dependencies',
                                         'middleware_after']}},
                 {'name': 'успешный request',
                  'args': [True, True, True],
                  'expected': {'status': 200,
                               'steps': ['middleware_before',
                                         'route_matching',
                                         'validation',
                                         'dependencies',
                                         'endpoint',
                                         'serialization',
                                         'middleware_after']}}],
       'reference_code': 'def solve(route_found, input_valid, dependency_ok):\n'
                         "    steps = ['middleware_before', 'route_matching']\n"
                         '    if not route_found:\n'
                         "        steps.append('middleware_after')\n"
                         "        return {'status': 404, 'steps': steps}\n"
                         "    steps.append('validation')\n"
                         '    if not input_valid:\n'
                         "        steps.append('middleware_after')\n"
                         "        return {'status': 422, 'steps': steps}\n"
                         "    steps.append('dependencies')\n"
                         '    if not dependency_ok:\n'
                         "        steps.append('middleware_after')\n"
                         "        return {'status': 403, 'steps': steps}\n"
                         "    steps.append('endpoint')\n"
                         "    steps.append('serialization')\n"
                         "    steps.append('middleware_after')\n"
                         "    return {'status': 200, 'steps': steps}\n"}],
    70: [{'title': 'Одна функция подготовки для двух обработчиков',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Создайте отдельную функцию get_client_name(headers, default_name). Она получает значение через '
                 'headers.get, убирает пробелы через strip и возвращает default_name, если результат пуст. В solve '
                 'вызовите get_client_name ровно как общий источник данных и верните словарь с двумя ключами: '
                 'profile и summary. Значение каждого ключа — словарь client_name с одинаковым подготовленным '
                 'именем.',
       'contract': {'given': 'Автопроверка вызывает solve(headers, default_name). headers — словарь HTTP-заголовков. '
                             'Имя клиента может находиться по ключу X-Client-Name. default_name — строка, которую '
                             'нужно использовать при отсутствующем или пустом заголовке.',
                    'todo': 'Создайте отдельную функцию get_client_name(headers, default_name). Она получает '
                            'значение через headers.get, убирает пробелы через strip и возвращает default_name, если '
                            'результат пуст. В solve вызовите get_client_name ровно как общий источник данных и '
                            'верните словарь с двумя ключами: profile и summary. Значение каждого ключа — словарь '
                            'client_name с одинаковым подготовленным именем.',
                    'check': 'Проверяются переданный заголовок, строка с пробелами, пустая строка и отсутствие '
                             'ключа. Сравнивается структура для двух условных endpoints. Также проверяется отдельная '
                             'функция get_client_name и её вызов из solve.'},
       'requirements': {'items': ['функция get_client_name',
                                  'headers.get',
                                  'очистка через strip',
                                  'один подготовленный результат для profile и summary'],
                        'names': ['headers', 'default_name', 'client_name'],
                        'nodes': ['FunctionDef', 'If'],
                        'calls': ['get_client_name'],
                        'attributes': ['get', 'strip']},
       'starter_code': 'def get_client_name(headers, default_name):\n'
                       '    # Прочитайте и очистите заголовок\n'
                       '    pass\n'
                       '\n'
                       '\n'
                       'def solve(headers, default_name):\n'
                       '    # Получите имя через get_client_name\n'
                       '    # Верните ответы profile и summary\n'
                       '    pass\n',
       'tests': [{'name': 'заголовок передан',
                  'args': [{'X-Client-Name': '  Nikita  '}, 'anonymous'],
                  'expected': {'profile': {'client_name': 'Nikita'}, 'summary': {'client_name': 'Nikita'}}},
                 {'name': 'пустой заголовок',
                  'args': [{'X-Client-Name': '   '}, 'anonymous'],
                  'expected': {'profile': {'client_name': 'anonymous'}, 'summary': {'client_name': 'anonymous'}}},
                 {'name': 'заголовок отсутствует',
                  'args': [{}, 'guest'],
                  'expected': {'profile': {'client_name': 'guest'}, 'summary': {'client_name': 'guest'}}}],
       'reference_code': 'def get_client_name(headers, default_name):\n'
                         "    raw_name = headers.get('X-Client-Name', '')\n"
                         '    clean_name = raw_name.strip()\n'
                         "    if clean_name == '':\n"
                         '        return default_name\n'
                         '    return clean_name\n'
                         '\n'
                         '\n'
                         'def solve(headers, default_name):\n'
                         '    client_name = get_client_name(headers, default_name)\n'
                         '    return {\n'
                         "        'profile': {'client_name': client_name},\n"
                         "        'summary': {'client_name': client_name},\n"
                         '    }\n'}],
    71: [{'title': 'Цепочка получения текущего клиента',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Создайте get_token(headers), которая возвращает token из строки Bearer token или None при другом '
                 'формате. Создайте get_current_client(token, clients), которая возвращает clients.get(token) или '
                 'None. В solve вызовите обе функции по порядку и верните словарь order и client. order всегда '
                 'должен содержать get_token, затем get_current_client.',
       'contract': {'given': 'Автопроверка вызывает solve(headers, clients). headers — словарь заголовков. '
                             'Authorization может иметь формат Bearer token. clients — словарь, где token является '
                             'ключом, а значение содержит данные клиента.',
                    'todo': 'Создайте get_token(headers), которая возвращает token из строки Bearer token или None '
                            'при другом формате. Создайте get_current_client(token, clients), которая возвращает '
                            'clients.get(token) или None. В solve вызовите обе функции по порядку и верните словарь '
                            'order и client. order всегда должен содержать get_token, затем get_current_client.',
                    'check': 'Проверяется корректный token, неизвестный token, отсутствующий header и неверная схема '
                             'Authorization. Сравниваются порядок цепочки и итоговый client. Автопроверка требует '
                             'вызовы обеих вспомогательных функций.'},
       'requirements': {'items': ['get_token',
                                  'get_current_client',
                                  'порядок двух dependencies',
                                  'None для отсутствующего клиента'],
                        'names': ['headers', 'clients', 'order', 'token', 'client'],
                        'nodes': ['FunctionDef', 'If'],
                        'calls': ['get_token', 'get_current_client', 'len'],
                        'attributes': ['get', 'split', 'append']},
       'starter_code': 'def get_token(headers):\n'
                       '    # Верните token или None\n'
                       '    pass\n'
                       '\n'
                       '\n'
                       'def get_current_client(token, clients):\n'
                       '    # Верните клиента или None\n'
                       '    pass\n'
                       '\n'
                       '\n'
                       'def solve(headers, clients):\n'
                       '    order = []\n'
                       '    # Вызовите dependencies по порядку\n'
                       '    pass\n',
       'tests': [{'name': 'клиент найден',
                  'args': [{'Authorization': 'Bearer token-1'}, {'token-1': {'id': 7, 'name': 'Nikita'}}],
                  'expected': {'order': ['get_token', 'get_current_client'], 'client': {'id': 7, 'name': 'Nikita'}}},
                 {'name': 'неизвестный token',
                  'args': [{'Authorization': 'Bearer missing'}, {'token-1': {'id': 7, 'name': 'Nikita'}}],
                  'expected': {'order': ['get_token', 'get_current_client'], 'client': None}},
                 {'name': 'header отсутствует',
                  'args': [{}, {'token-1': {'id': 7, 'name': 'Nikita'}}],
                  'expected': {'order': ['get_token', 'get_current_client'], 'client': None}},
                 {'name': 'неверная схема',
                  'args': [{'Authorization': 'Basic token-1'}, {'token-1': {'id': 7, 'name': 'Nikita'}}],
                  'expected': {'order': ['get_token', 'get_current_client'], 'client': None}}],
       'reference_code': 'def get_token(headers):\n'
                         "    authorization = headers.get('Authorization', '')\n"
                         '    parts = authorization.split()\n'
                         '    if len(parts) != 2:\n'
                         '        return None\n'
                         "    if parts[0] != 'Bearer':\n"
                         '        return None\n'
                         '    return parts[1]\n'
                         '\n'
                         '\n'
                         'def get_current_client(token, clients):\n'
                         '    return clients.get(token)\n'
                         '\n'
                         '\n'
                         'def solve(headers, clients):\n'
                         '    order = []\n'
                         "    order.append('get_token')\n"
                         '    token = get_token(headers)\n'
                         "    order.append('get_current_client')\n"
                         '    client = get_current_client(token, clients)\n'
                         "    return {'order': order, 'client': client}\n"}],
    72: [{'title': 'Безопасный preview настроек',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Создайте parse_debug(value). Она возвращает True для строк 1, true, yes, on без учёта регистра, '
                 'False для остальных строк и сохраняет готовые bool. В solve получите APP_NAME и DEBUG сначала из '
                 'env, затем из defaults. DATABASE_URL можно прочитать для внутренней конфигурации, но запрещено '
                 'возвращать его клиенту. Верните только словарь app_name и debug.',
       'contract': {'given': 'Автопроверка вызывает solve(env, defaults). Оба аргумента — словари. Возможные ключи: '
                             'APP_NAME, DEBUG и DATABASE_URL. Значения env должны иметь приоритет над defaults. '
                             'DEBUG может быть bool или строкой.',
                    'todo': 'Создайте parse_debug(value). Она возвращает True для строк 1, true, yes, on без учёта '
                            'регистра, False для остальных строк и сохраняет готовые bool. В solve получите APP_NAME '
                            'и DEBUG сначала из env, затем из defaults. DATABASE_URL можно прочитать для внутренней '
                            'конфигурации, но запрещено возвращать его клиенту. Верните только словарь app_name и '
                            'debug.',
                    'check': 'Проверяются значения по умолчанию, переопределение через env и разные записи DEBUG. В '
                             'результате не должно быть DATABASE_URL. Также проверяется отдельная функция '
                             'parse_debug.'},
       'requirements': {'items': ['функция parse_debug',
                                  'приоритет env',
                                  'преобразование DEBUG',
                                  'DATABASE_URL отсутствует в результате'],
                        'names': ['env', 'defaults', 'app_name', 'raw_debug', 'debug'],
                        'nodes': ['FunctionDef', 'If'],
                        'calls': ['parse_debug', 'str'],
                        'attributes': ['get', 'strip', 'lower']},
       'starter_code': 'def parse_debug(value):\n'
                       '    # Верните bool\n'
                       '    pass\n'
                       '\n'
                       '\n'
                       'def solve(env, defaults):\n'
                       '    # Примените приоритет env над defaults\n'
                       '    # Не возвращайте DATABASE_URL\n'
                       '    pass\n',
       'tests': [{'name': 'только defaults',
                  'args': [{}, {'APP_NAME': 'StudyHub', 'DEBUG': False, 'DATABASE_URL': 'sqlite:///default.db'}],
                  'expected': {'app_name': 'StudyHub', 'debug': False}},
                 {'name': 'env переопределяет значения',
                  'args': [{'APP_NAME': 'StudyHub Dev', 'DEBUG': 'yes', 'DATABASE_URL': 'sqlite:///secret.db'},
                           {'APP_NAME': 'StudyHub', 'DEBUG': False, 'DATABASE_URL': 'sqlite:///default.db'}],
                  'expected': {'app_name': 'StudyHub Dev', 'debug': True}},
                 {'name': 'строковый false',
                  'args': [{'DEBUG': 'off'},
                           {'APP_NAME': 'StudyHub', 'DEBUG': True, 'DATABASE_URL': 'sqlite:///default.db'}],
                  'expected': {'app_name': 'StudyHub', 'debug': False}}],
       'reference_code': 'def parse_debug(value):\n'
                         '    if value is True:\n'
                         '        return True\n'
                         '    if value is False:\n'
                         '        return False\n'
                         '    normalized = str(value).strip().lower()\n'
                         "    return normalized in ('1', 'true', 'yes', 'on')\n"
                         '\n'
                         '\n'
                         'def solve(env, defaults):\n'
                         "    app_name = env.get('APP_NAME', defaults.get('APP_NAME', 'StudyHub'))\n"
                         "    raw_debug = env.get('DEBUG', defaults.get('DEBUG', False))\n"
                         "    database_url = env.get('DATABASE_URL', defaults.get('DATABASE_URL', ''))\n"
                         '    debug = parse_debug(raw_debug)\n'
                         "    return {'app_name': app_name, 'debug': debug}\n"}]
}

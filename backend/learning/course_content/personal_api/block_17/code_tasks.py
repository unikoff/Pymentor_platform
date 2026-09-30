from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    93: [{'title': 'Три проверки доступа',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Верните словарь stage и status. Если user_id равен None, верните stage identification и status '
                 '401. Если credentials_valid равно False, верните stage authentication и status 401. Если '
                 'permission_granted равно False, верните stage authorization и status 403. Во всех остальных '
                 'случаях верните stage access и status 200. Проверки выполняйте именно в этом порядке.',
       'contract': {'given': 'Автопроверка вызывает solve(user_id, credentials_valid, permission_granted). user_id — '
                             'идентификатор пользователя или None. credentials_valid и permission_granted имеют тип '
                             'bool.',
                    'todo': 'Верните словарь stage и status. Если user_id равен None, верните stage identification и '
                            'status 401. Если credentials_valid равно False, верните stage authentication и status '
                            '401. Если permission_granted равно False, верните stage authorization и status 403. Во '
                            'всех остальных случаях верните stage access и status 200. Проверки выполняйте именно в '
                            'этом порядке.',
                    'check': 'Платформа проверит отсутствие личности, неверные credentials, недостаток права и '
                             'успешный доступ. Сравниваются оба поля результата. Сценарий без подтверждённой '
                             'личности не должен доходить до проверки разрешения.'},
       'requirements': {'items': ['проверка отсутствующего user_id',
                                  'отдельная проверка credentials',
                                  'отдельная проверка permission',
                                  'различие status 401 и 403'],
                        'names': ['user_id', 'credentials_valid', 'permission_granted'],
                        'nodes': ['FunctionDef', 'If']},
       'starter_code': 'def solve(user_id, credentials_valid, permission_granted):\n'
                       '    # Выполните три проверки по порядку\n'
                       '    pass\n',
       'tests': [{'name': 'личность не определена',
                  'args': [None, True, True],
                  'expected': {'stage': 'identification', 'status': 401}},
                 {'name': 'credentials неверны',
                  'args': [7, False, True],
                  'expected': {'stage': 'authentication', 'status': 401}},
                 {'name': 'право отсутствует',
                  'args': [7, True, False],
                  'expected': {'stage': 'authorization', 'status': 403}},
                 {'name': 'доступ разрешён',
                  'args': [7, True, True],
                  'expected': {'stage': 'access', 'status': 200}}],
       'reference_code': 'def solve(user_id, credentials_valid, permission_granted):\n'
                         '    if user_id is None:\n'
                         "        return {'stage': 'identification', 'status': 401}\n"
                         '    if not credentials_valid:\n'
                         "        return {'stage': 'authentication', 'status': 401}\n"
                         '    if not permission_granted:\n'
                         "        return {'stage': 'authorization', 'status': 403}\n"
                         "    return {'stage': 'access', 'status': 200}\n"}],
    94: [{'title': 'Сравнительная карта способов входа',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Для каждого method верните словарь transport, state и logout. Для http_basic: transport '
                 'Authorization: Basic, state credentials_each_request, logout client_forgets_credentials. Для '
                 'api_key: transport X-API-Key, state server_key_record, logout revoke_key. Для cookie_session: '
                 'transport Cookie: session_id, state server_session, logout revoke_session. Для jwt_access_refresh: '
                 'transport Authorization: Bearer, state access_token_and_refresh_record, logout revoke_refresh. Для '
                 'неизвестного method верните None.',
       'contract': {'given': 'Автопроверка вызывает solve(method). method принимает одно из четырёх значений: '
                             'http_basic, api_key, cookie_session или jwt_access_refresh.',
                    'todo': 'Для каждого method верните словарь transport, state и logout. Для http_basic: transport '
                            'Authorization: Basic, state credentials_each_request, logout '
                            'client_forgets_credentials. Для api_key: transport X-API-Key, state server_key_record, '
                            'logout revoke_key. Для cookie_session: transport Cookie: session_id, state '
                            'server_session, logout revoke_session. Для jwt_access_refresh: transport Authorization: '
                            'Bearer, state access_token_and_refresh_record, logout revoke_refresh. Для неизвестного '
                            'method верните None.',
                    'check': 'Платформа проверит все четыре способа и неизвестное значение. Сравнивается точная '
                             'карта свойств. Задание не выбирает один универсально лучший способ: оно фиксирует '
                             'различия транспорта, состояния и logout.'},
       'requirements': {'items': ['четыре явные ветки',
                                  'transport',
                                  'state',
                                  'logout',
                                  'None для неизвестного способа'],
                        'names': ['method'],
                        'nodes': ['FunctionDef', 'If']},
       'starter_code': 'def solve(method):\n    # Верните карту свойств выбранного способа\n    pass\n',
       'tests': [{'name': 'HTTP Basic',
                  'args': ['http_basic'],
                  'expected': {'transport': 'Authorization: Basic',
                               'state': 'credentials_each_request',
                               'logout': 'client_forgets_credentials'}},
                 {'name': 'API key',
                  'args': ['api_key'],
                  'expected': {'transport': 'X-API-Key', 'state': 'server_key_record', 'logout': 'revoke_key'}},
                 {'name': 'cookie session',
                  'args': ['cookie_session'],
                  'expected': {'transport': 'Cookie: session_id',
                               'state': 'server_session',
                               'logout': 'revoke_session'}},
                 {'name': 'JWT access и refresh',
                  'args': ['jwt_access_refresh'],
                  'expected': {'transport': 'Authorization: Bearer',
                               'state': 'access_token_and_refresh_record',
                               'logout': 'revoke_refresh'}},
                 {'name': 'неизвестный способ', 'args': ['magic_link'], 'expected': None}],
       'reference_code': 'def solve(method):\n'
                         "    if method == 'http_basic':\n"
                         '        return {\n'
                         "            'transport': 'Authorization: Basic',\n"
                         "            'state': 'credentials_each_request',\n"
                         "            'logout': 'client_forgets_credentials',\n"
                         '        }\n'
                         "    if method == 'api_key':\n"
                         '        return {\n'
                         "            'transport': 'X-API-Key',\n"
                         "            'state': 'server_key_record',\n"
                         "            'logout': 'revoke_key',\n"
                         '        }\n'
                         "    if method == 'cookie_session':\n"
                         '        return {\n'
                         "            'transport': 'Cookie: session_id',\n"
                         "            'state': 'server_session',\n"
                         "            'logout': 'revoke_session',\n"
                         '        }\n'
                         "    if method == 'jwt_access_refresh':\n"
                         '        return {\n'
                         "            'transport': 'Authorization: Bearer',\n"
                         "            'state': 'access_token_and_refresh_record',\n"
                         "            'logout': 'revoke_refresh',\n"
                         '        }\n'
                         '    return None\n'}],
    98: [{'title': 'Безопасная проверка credentials',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Если user равен None, password_matches равно False или user is_active равно False, верните None. '
                 'При успехе верните безопасный словарь только с ключами id, email и role. Не возвращайте '
                 'password_hash и не сообщайте наружу, какая именно проверка не прошла.',
       'contract': {'given': 'Автопроверка вызывает solve(user, password_matches). user равен None или словарю с '
                             'ключами id, email, password_hash, is_active и role. password_matches — результат '
                             'работы настоящего password service.',
                    'todo': 'Если user равен None, password_matches равно False или user is_active равно False, '
                            'верните None. При успехе верните безопасный словарь только с ключами id, email и role. '
                            'Не возвращайте password_hash и не сообщайте наружу, какая именно проверка не прошла.',
                    'check': 'Проверяются отсутствующий пользователь, неверный пароль, неактивный пользователь и '
                             'успешный вход. Все три ошибки должны возвращать одинаковый результат None. Успешный '
                             'ответ не должен содержать password_hash.'},
       'requirements': {'items': ['одинаковый результат для ошибок credentials',
                                  'проверка is_active',
                                  'безопасный словарь',
                                  'password_hash не возвращается'],
                        'names': ['user', 'password_matches'],
                        'nodes': ['FunctionDef', 'If']},
       'starter_code': 'def solve(user, password_matches):\n'
                       '    # Верните безопасные данные пользователя или None\n'
                       '    pass\n',
       'tests': [{'name': 'пользователь отсутствует', 'args': [None, False], 'expected': None},
                 {'name': 'пароль неверный',
                  'args': [{'id': 1,
                            'email': 'student@example.com',
                            'password_hash': 'stored-hash',
                            'is_active': True,
                            'role': 'user'},
                           False],
                  'expected': None},
                 {'name': 'пользователь неактивен',
                  'args': [{'id': 1,
                            'email': 'student@example.com',
                            'password_hash': 'stored-hash',
                            'is_active': False,
                            'role': 'user'},
                           True],
                  'expected': None},
                 {'name': 'успешная проверка',
                  'args': [{'id': 1,
                            'email': 'student@example.com',
                            'password_hash': 'stored-hash',
                            'is_active': True,
                            'role': 'user'},
                           True],
                  'expected': {'id': 1, 'email': 'student@example.com', 'role': 'user'}}],
       'reference_code': 'def solve(user, password_matches):\n'
                         '    if user is None:\n'
                         '        return None\n'
                         '    if not password_matches:\n'
                         '        return None\n'
                         "    if not user['is_active']:\n"
                         '        return None\n'
                         '    return {\n'
                         "        'id': user['id'],\n"
                         "        'email': user['email'],\n"
                         "        'role': user['role'],\n"
                         '    }\n'}]
}

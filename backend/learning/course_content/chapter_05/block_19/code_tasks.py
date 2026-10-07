from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    106: [{'title': 'Claims access token',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Создайте claims с ключами sub, type, iat и exp. sub должен быть строкой user_id, type равен '
                  'access, iat равен issued_at, exp равен issued_at + ttl_seconds. valid равно True только когда '
                  'issued_at не больше now и now строго меньше exp. Верните словарь claims и valid.',
        'contract': {'given': 'Автопроверка вызывает solve(user_id, issued_at, ttl_seconds, now). Все значения '
                              'времени — целые секунды. Задание моделирует только claims; подпись JWT должна '
                              'выполняться готовой библиотекой в проектной практике.',
                     'todo': 'Создайте claims с ключами sub, type, iat и exp. sub должен быть строкой user_id, type '
                             'равен access, iat равен issued_at, exp равен issued_at + ttl_seconds. valid равно True '
                             'только когда issued_at не больше now и now строго меньше exp. Верните словарь claims и '
                             'valid.',
                     'check': 'Проверяется действующий token, точная граница expiration и время раньше iat. '
                              'Сравниваются claims и valid. Задание не реализует собственную подпись и не выдаёт '
                              'этот словарь за готовый JWT.'},
        'requirements': {'items': ['sub как строка', 'type access', 'iat и exp', 'строгая проверка expiration'],
                         'names': ['user_id', 'issued_at', 'ttl_seconds', 'now', 'claims', 'valid'],
                         'nodes': ['FunctionDef'],
                         'calls': ['str']},
        'starter_code': 'def solve(user_id, issued_at, ttl_seconds, now):\n'
                        '    # Соберите claims и вычислите valid\n'
                        '    pass\n',
        'tests': [{'name': 'token действует',
                   'args': [7, 1000, 300, 1200],
                   'expected': {'claims': {'sub': '7', 'type': 'access', 'iat': 1000, 'exp': 1300}, 'valid': True}},
                  {'name': 'token истёк на границе',
                   'args': [7, 1000, 300, 1300],
                   'expected': {'claims': {'sub': '7', 'type': 'access', 'iat': 1000, 'exp': 1300}, 'valid': False}},
                  {'name': 'token ещё не выпущен',
                   'args': [12, 2000, 60, 1999],
                   'expected': {'claims': {'sub': '12', 'type': 'access', 'iat': 2000, 'exp': 2060},
                                'valid': False}}],
        'reference_code': 'def solve(user_id, issued_at, ttl_seconds, now):\n'
                          '    claims = {\n'
                          "        'sub': str(user_id),\n"
                          "        'type': 'access',\n"
                          "        'iat': issued_at,\n"
                          "        'exp': issued_at + ttl_seconds,\n"
                          '    }\n'
                          "    valid = issued_at <= now and now < claims['exp']\n"
                          "    return {'claims': claims, 'valid': valid}\n"}],
    109: [{'title': 'Rotation и повторное использование refresh token',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Найдите record по presented_jti. Если record отсутствует, верните status 401, reuse_detected '
                  'False и пустой revoked_ids. Если token истёк, отзовите его и верните 401. Если token уже revoked '
                  'и replaced_by не равен None, считайте это повторным использованием: отзовите все ещё активные '
                  'records того же user_id и верните reuse_detected True. Если token действующий, отзовите его, '
                  'запишите replaced_by=new_jti, добавьте новый active record с тем же user_id и new_expires_at, '
                  'затем верните status 200 и issued_jti.',
        'contract': {'given': 'Автопроверка вызывает solve(records, presented_jti, now, new_jti, new_expires_at). '
                              'records — список словарей jti, user_id, expires_at, revoked и replaced_by.',
                     'todo': 'Найдите record по presented_jti. Если record отсутствует, верните status 401, '
                             'reuse_detected False и пустой revoked_ids. Если token истёк, отзовите его и верните '
                             '401. Если token уже revoked и replaced_by не равен None, считайте это повторным '
                             'использованием: отзовите все ещё активные records того же user_id и верните '
                             'reuse_detected True. Если token действующий, отзовите его, запишите '
                             'replaced_by=new_jti, добавьте новый active record с тем же user_id и new_expires_at, '
                             'затем верните status 200 и issued_jti.',
                     'check': 'Проверяется обычная rotation, reuse старого token, expired token и неизвестный jti. '
                              'Сравниваются изменённые records, revoked_ids и issued_jti. Порядок records '
                              'сохраняется, новый record добавляется в конец.'},
        'requirements': {'items': ['поиск presented_jti',
                                   'expiration',
                                   'rotation с replaced_by',
                                   'reuse detection',
                                   'отзыв token family'],
                         'names': ['records', 'presented_jti', 'now', 'new_jti', 'new_expires_at'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['append']},
        'starter_code': 'def solve(records, presented_jti, now, new_jti, new_expires_at):\n'
                        '    # Реализуйте rotation и reuse detection\n'
                        '    pass\n',
        'tests': [{'name': 'обычная rotation',
                   'args': [[{'jti': 'r1', 'user_id': 7, 'expires_at': 500, 'revoked': False, 'replaced_by': None}],
                            'r1',
                            100,
                            'r2',
                            600],
                   'expected': {'status': 200,
                                'reuse_detected': False,
                                'revoked_ids': ['r1'],
                                'issued_jti': 'r2',
                                'records': [{'jti': 'r1',
                                             'user_id': 7,
                                             'expires_at': 500,
                                             'revoked': True,
                                             'replaced_by': 'r2'},
                                            {'jti': 'r2',
                                             'user_id': 7,
                                             'expires_at': 600,
                                             'revoked': False,
                                             'replaced_by': None}]}},
                  {'name': 'reuse старого token',
                   'args': [[{'jti': 'r1', 'user_id': 7, 'expires_at': 500, 'revoked': True, 'replaced_by': 'r2'},
                             {'jti': 'r2', 'user_id': 7, 'expires_at': 600, 'revoked': False, 'replaced_by': None},
                             {'jti': 'x1', 'user_id': 8, 'expires_at': 600, 'revoked': False, 'replaced_by': None}],
                            'r1',
                            200,
                            'r3',
                            700],
                   'expected': {'status': 401,
                                'reuse_detected': True,
                                'revoked_ids': ['r2'],
                                'issued_jti': None,
                                'records': [{'jti': 'r1',
                                             'user_id': 7,
                                             'expires_at': 500,
                                             'revoked': True,
                                             'replaced_by': 'r2'},
                                            {'jti': 'r2',
                                             'user_id': 7,
                                             'expires_at': 600,
                                             'revoked': True,
                                             'replaced_by': None},
                                            {'jti': 'x1',
                                             'user_id': 8,
                                             'expires_at': 600,
                                             'revoked': False,
                                             'replaced_by': None}]}},
                  {'name': 'refresh истёк',
                   'args': [[{'jti': 'r1', 'user_id': 7, 'expires_at': 100, 'revoked': False, 'replaced_by': None}],
                            'r1',
                            100,
                            'r2',
                            600],
                   'expected': {'status': 401,
                                'reuse_detected': False,
                                'revoked_ids': ['r1'],
                                'issued_jti': None,
                                'records': [{'jti': 'r1',
                                             'user_id': 7,
                                             'expires_at': 100,
                                             'revoked': True,
                                             'replaced_by': None}]}},
                  {'name': 'jti отсутствует',
                   'args': [[], 'missing', 100, 'r2', 600],
                   'expected': {'status': 401, 'reuse_detected': False, 'revoked_ids': [], 'issued_jti': None}}],
        'reference_code': 'def solve(records, presented_jti, now, new_jti, new_expires_at):\n'
                          '    current = None\n'
                          '    for record in records:\n'
                          "        if record['jti'] == presented_jti:\n"
                          '            current = record\n'
                          '            break\n'
                          '    if current is None:\n'
                          '        return {\n'
                          "            'status': 401,\n"
                          "            'reuse_detected': False,\n"
                          "            'revoked_ids': [],\n"
                          "            'issued_jti': None,\n"
                          '        }\n'
                          "    if current['expires_at'] <= now:\n"
                          "        current['revoked'] = True\n"
                          '        return {\n'
                          "            'status': 401,\n"
                          "            'reuse_detected': False,\n"
                          "            'revoked_ids': [current['jti']],\n"
                          "            'issued_jti': None,\n"
                          "            'records': records,\n"
                          '        }\n'
                          "    if current['revoked']:\n"
                          '        revoked_ids = []\n'
                          "        reuse_detected = current['replaced_by'] is not None\n"
                          '        if reuse_detected:\n'
                          '            for record in records:\n'
                          "                same_user = record['user_id'] == current['user_id']\n"
                          "                if same_user and not record['revoked']:\n"
                          "                    record['revoked'] = True\n"
                          "                    revoked_ids.append(record['jti'])\n"
                          '        return {\n'
                          "            'status': 401,\n"
                          "            'reuse_detected': reuse_detected,\n"
                          "            'revoked_ids': revoked_ids,\n"
                          "            'issued_jti': None,\n"
                          "            'records': records,\n"
                          '        }\n'
                          "    current['revoked'] = True\n"
                          "    current['replaced_by'] = new_jti\n"
                          '    new_record = {\n'
                          "        'jti': new_jti,\n"
                          "        'user_id': current['user_id'],\n"
                          "        'expires_at': new_expires_at,\n"
                          "        'revoked': False,\n"
                          "        'replaced_by': None,\n"
                          '    }\n'
                          '    records.append(new_record)\n'
                          '    return {\n'
                          "        'status': 200,\n"
                          "        'reuse_detected': False,\n"
                          "        'revoked_ids': [current['jti']],\n"
                          "        'issued_jti': new_jti,\n"
                          "        'records': records,\n"
                          '    }\n'}],
    110: [{'title': 'Решение 401, 403 или доступ',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Если user равен None или user is_active равно False, верните status 401 и decision '
                  'unauthenticated. Активный admin получает status 200 для любого известного action. Активный user '
                  'может выполнить create_task без resource. Для read_task, update_task и delete_task сначала '
                  'верните 404, если resource равен None. Владелец resource получает 200, другой пользователь '
                  'получает 403. Для admin_users обычный user получает 403. Неизвестный action также возвращает 403.',
        'contract': {'given': 'Автопроверка вызывает solve(user, resource, action). user равен None или словарю id, '
                              'role и is_active. resource равен None или словарю id и user_id. action равен '
                              'create_task, read_task, update_task, delete_task или admin_users.',
                     'todo': 'Если user равен None или user is_active равно False, верните status 401 и decision '
                             'unauthenticated. Активный admin получает status 200 для любого известного action. '
                             'Активный user может выполнить create_task без resource. Для read_task, update_task и '
                             'delete_task сначала верните 404, если resource равен None. Владелец resource получает '
                             '200, другой пользователь получает 403. Для admin_users обычный user получает 403. '
                             'Неизвестный action также возвращает 403.',
                     'check': 'Проверяется отсутствие личности, неактивный пользователь, owner, чужой resource, '
                              'admin и admin-only endpoint. Сравниваются status и decision.'},
        'requirements': {'items': ['401 без активной личности',
                                   'admin bypass',
                                   'owner check',
                                   '403 при отсутствии права',
                                   '404 при отсутствующем resource'],
                         'names': ['user', 'resource', 'action', 'known_actions'],
                         'nodes': ['FunctionDef', 'If']},
        'starter_code': 'def solve(user, resource, action):\n    # Верните status и decision\n    pass\n',
        'tests': [{'name': 'нет пользователя',
                   'args': [None, None, 'create_task'],
                   'expected': {'status': 401, 'decision': 'unauthenticated'}},
                  {'name': 'неактивный пользователь',
                   'args': [{'id': 7, 'role': 'user', 'is_active': False}, None, 'create_task'],
                   'expected': {'status': 401, 'decision': 'unauthenticated'}},
                  {'name': 'создание своей будущей задачи',
                   'args': [{'id': 7, 'role': 'user', 'is_active': True}, None, 'create_task'],
                   'expected': {'status': 200, 'decision': 'allowed'}},
                  {'name': 'владелец обновляет задачу',
                   'args': [{'id': 7, 'role': 'user', 'is_active': True}, {'id': 4, 'user_id': 7}, 'update_task'],
                   'expected': {'status': 200, 'decision': 'owner'}},
                  {'name': 'чужая задача',
                   'args': [{'id': 7, 'role': 'user', 'is_active': True}, {'id': 4, 'user_id': 8}, 'delete_task'],
                   'expected': {'status': 403, 'decision': 'forbidden'}},
                  {'name': 'resource отсутствует',
                   'args': [{'id': 7, 'role': 'user', 'is_active': True}, None, 'read_task'],
                   'expected': {'status': 404, 'decision': 'not_found'}},
                  {'name': 'обычный user в admin endpoint',
                   'args': [{'id': 7, 'role': 'user', 'is_active': True}, None, 'admin_users'],
                   'expected': {'status': 403, 'decision': 'forbidden'}},
                  {'name': 'admin',
                   'args': [{'id': 1, 'role': 'admin', 'is_active': True}, {'id': 4, 'user_id': 8}, 'delete_task'],
                   'expected': {'status': 200, 'decision': 'admin'}}],
        'reference_code': 'def solve(user, resource, action):\n'
                          "    if user is None or not user['is_active']:\n"
                          "        return {'status': 401, 'decision': 'unauthenticated'}\n"
                          '    known_actions = (\n'
                          "        'create_task',\n"
                          "        'read_task',\n"
                          "        'update_task',\n"
                          "        'delete_task',\n"
                          "        'admin_users',\n"
                          '    )\n'
                          '    if action not in known_actions:\n'
                          "        return {'status': 403, 'decision': 'forbidden'}\n"
                          "    if user['role'] == 'admin':\n"
                          "        return {'status': 200, 'decision': 'admin'}\n"
                          "    if action == 'create_task':\n"
                          "        return {'status': 200, 'decision': 'allowed'}\n"
                          "    if action == 'admin_users':\n"
                          "        return {'status': 403, 'decision': 'forbidden'}\n"
                          '    if resource is None:\n'
                          "        return {'status': 404, 'decision': 'not_found'}\n"
                          "    if resource['user_id'] == user['id']:\n"
                          "        return {'status': 200, 'decision': 'owner'}\n"
                          "    return {'status': 403, 'decision': 'forbidden'}\n"}]
}

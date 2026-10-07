from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    103: [{'title': 'Отзыв одной или всех sessions',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Найдите current session. Если она отсутствует, уже revoked или expires_at не больше now, верните '
                  'status 401, delete_cookie True и пустой revoked_ids. При logout_all=False отзовите только current '
                  'session. При logout_all=True отзовите все ещё активные sessions того же user_id. Верните status '
                  '204, delete_cookie True, revoked_ids в порядке списка и обновлённый sessions.',
        'contract': {'given': 'Автопроверка вызывает solve(sessions, current_session_id, now, logout_all). sessions '
                              '— список словарей id, user_id, expires_at и revoked. now — текущее целое время, '
                              'logout_all — bool.',
                     'todo': 'Найдите current session. Если она отсутствует, уже revoked или expires_at не больше '
                             'now, верните status 401, delete_cookie True и пустой revoked_ids. При logout_all=False '
                             'отзовите только current session. При logout_all=True отзовите все ещё активные '
                             'sessions того же user_id. Верните status 204, delete_cookie True, revoked_ids в '
                             'порядке списка и обновлённый sessions.',
                     'check': 'Проверяется logout одного устройства, logout всех устройств, просроченная session и '
                              'неизвестный session id. Сравнивается полный список отозванных id и новые значения '
                              'revoked.'},
        'requirements': {'items': ['поиск current session',
                                   'проверка expiration и revoked',
                                   'logout одного устройства',
                                   'logout всех устройств пользователя'],
                         'names': ['sessions', 'current_session_id', 'now', 'logout_all'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['append']},
        'starter_code': 'def solve(sessions, current_session_id, now, logout_all):\n'
                        '    # Найдите текущую session\n'
                        '    # Отзовите одну или все sessions пользователя\n'
                        '    pass\n',
        'tests': [{'name': 'logout одного устройства',
                   'args': [[{'id': 's1', 'user_id': 7, 'expires_at': 200, 'revoked': False},
                             {'id': 's2', 'user_id': 7, 'expires_at': 200, 'revoked': False},
                             {'id': 's3', 'user_id': 8, 'expires_at': 200, 'revoked': False}],
                            's1',
                            100,
                            False],
                   'expected': {'status': 204,
                                'delete_cookie': True,
                                'revoked_ids': ['s1'],
                                'sessions': [{'id': 's1', 'user_id': 7, 'expires_at': 200, 'revoked': True},
                                             {'id': 's2', 'user_id': 7, 'expires_at': 200, 'revoked': False},
                                             {'id': 's3', 'user_id': 8, 'expires_at': 200, 'revoked': False}]}},
                  {'name': 'logout всех устройств',
                   'args': [[{'id': 's1', 'user_id': 7, 'expires_at': 200, 'revoked': False},
                             {'id': 's2', 'user_id': 7, 'expires_at': 200, 'revoked': False},
                             {'id': 's3', 'user_id': 8, 'expires_at': 200, 'revoked': False}],
                            's1',
                            100,
                            True],
                   'expected': {'status': 204,
                                'delete_cookie': True,
                                'revoked_ids': ['s1', 's2'],
                                'sessions': [{'id': 's1', 'user_id': 7, 'expires_at': 200, 'revoked': True},
                                             {'id': 's2', 'user_id': 7, 'expires_at': 200, 'revoked': True},
                                             {'id': 's3', 'user_id': 8, 'expires_at': 200, 'revoked': False}]}},
                  {'name': 'session просрочена',
                   'args': [[{'id': 's1', 'user_id': 7, 'expires_at': 100, 'revoked': False}], 's1', 100, False],
                   'expected': {'status': 401, 'delete_cookie': True, 'revoked_ids': []}},
                  {'name': 'session не найдена',
                   'args': [[{'id': 's1', 'user_id': 7, 'expires_at': 200, 'revoked': False}], 'missing', 100, False],
                   'expected': {'status': 401, 'delete_cookie': True, 'revoked_ids': []}}],
        'reference_code': 'def solve(sessions, current_session_id, now, logout_all):\n'
                          '    current = None\n'
                          '    for session in sessions:\n'
                          "        if session['id'] == current_session_id:\n"
                          '            current = session\n'
                          '            break\n'
                          '    if current is None:\n'
                          "        return {'status': 401, 'delete_cookie': True, 'revoked_ids': []}\n"
                          "    if current['revoked'] or current['expires_at'] <= now:\n"
                          "        return {'status': 401, 'delete_cookie': True, 'revoked_ids': []}\n"
                          '    revoked_ids = []\n'
                          '    for session in sessions:\n'
                          "        same_user = session['user_id'] == current['user_id']\n"
                          "        should_revoke = session['id'] == current_session_id\n"
                          '        if logout_all and same_user:\n'
                          '            should_revoke = True\n'
                          "        if should_revoke and not session['revoked']:\n"
                          "            session['revoked'] = True\n"
                          "            revoked_ids.append(session['id'])\n"
                          '    return {\n'
                          "        'status': 204,\n"
                          "        'delete_cookie': True,\n"
                          "        'revoked_ids': revoked_ids,\n"
                          "        'sessions': sessions,\n"
                          '    }\n'}],
    104: [{'title': 'Изоляция задач по владельцу',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Для action list верните status 200 и ids только задач current_user_id в исходном порядке. Для get '
                  'и update найдите задачу одновременно по id и user_id; при успехе верните status 200 и её id. Для '
                  'delete при успехе верните status 204 и её id. Если задача не принадлежит current user или '
                  'отсутствует, верните status 404 и id None. Не возвращайте 403 для чужой задачи: этот контракт не '
                  'раскрывает существование чужого id.',
        'contract': {'given': 'Автопроверка вызывает solve(tasks, current_user_id, action, task_id). tasks — список '
                              'словарей id, user_id и title. action равен list, get, update или delete. Для list '
                              'значение task_id равно None.',
                     'todo': 'Для action list верните status 200 и ids только задач current_user_id в исходном '
                             'порядке. Для get и update найдите задачу одновременно по id и user_id; при успехе '
                             'верните status 200 и её id. Для delete при успехе верните status 204 и её id. Если '
                             'задача не принадлежит current user или отсутствует, верните status 404 и id None. Не '
                             'возвращайте 403 для чужой задачи: этот контракт не раскрывает существование чужого id.',
                     'check': 'Проверяется список двух пользователей, собственная задача, чужая задача и неизвестный '
                              'id. Сравниваются status и ids либо id.'},
        'requirements': {'items': ['фильтрация list по current_user_id',
                                   'поиск одновременно по id и user_id',
                                   '404 для чужого id',
                                   '204 для успешного delete'],
                         'names': ['tasks', 'current_user_id', 'action', 'task_id'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['append']},
        'starter_code': 'def solve(tasks, current_user_id, action, task_id):\n'
                        '    # Ограничьте данные владельцем\n'
                        '    pass\n',
        'tests': [{'name': 'список только своих задач',
                   'args': [[{'id': 1, 'user_id': 7, 'title': 'Python'},
                             {'id': 2, 'user_id': 8, 'title': 'Чужая'},
                             {'id': 3, 'user_id': 7, 'title': 'README'}],
                            7,
                            'list',
                            None],
                   'expected': {'status': 200, 'ids': [1, 3]}},
                  {'name': 'собственная задача',
                   'args': [[{'id': 1, 'user_id': 7, 'title': 'Python'}, {'id': 2, 'user_id': 8, 'title': 'Чужая'}],
                            7,
                            'update',
                            1],
                   'expected': {'status': 200, 'id': 1}},
                  {'name': 'чужая задача скрыта',
                   'args': [[{'id': 1, 'user_id': 7, 'title': 'Python'}, {'id': 2, 'user_id': 8, 'title': 'Чужая'}],
                            7,
                            'delete',
                            2],
                   'expected': {'status': 404, 'id': None}},
                  {'name': 'собственная задача удаляется',
                   'args': [[{'id': 1, 'user_id': 7, 'title': 'Python'}], 7, 'delete', 1],
                   'expected': {'status': 204, 'id': 1}},
                  {'name': 'id отсутствует',
                   'args': [[{'id': 1, 'user_id': 7, 'title': 'Python'}], 7, 'get', 99],
                   'expected': {'status': 404, 'id': None}}],
        'reference_code': 'def solve(tasks, current_user_id, action, task_id):\n'
                          "    if action == 'list':\n"
                          '        ids = []\n'
                          '        for task in tasks:\n'
                          "            if task['user_id'] == current_user_id:\n"
                          "                ids.append(task['id'])\n"
                          "        return {'status': 200, 'ids': ids}\n"
                          '    for task in tasks:\n'
                          "        same_id = task['id'] == task_id\n"
                          "        same_owner = task['user_id'] == current_user_id\n"
                          '        if same_id and same_owner:\n'
                          "            if action == 'delete':\n"
                          "                return {'status': 204, 'id': task['id']}\n"
                          "            return {'status': 200, 'id': task['id']}\n"
                          "    return {'status': 404, 'id': None}\n"}]
}

from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    166: [{'title': 'Диагностика process и port',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Найдите running process, который слушает target_port. Если process не найден, верните status '
                  'free, pid None и shutdown graceful=False. Если найден, верните status occupied и его pid. Для '
                  "SIGINT и SIGTERM shutdown graceful=True и final_state='stopped'. Для SIGKILL shutdown "
                  "graceful=False и final_state='killed'. Не изменяйте входной список.",
        'contract': {'given': 'Автопроверка вызывает solve(processes, target_port, signal). processes — список '
                              'словарей pid, name, port и state. signal равен SIGINT, SIGTERM или SIGKILL.',
                     'todo': 'Найдите running process, который слушает target_port. Если process не найден, верните '
                             'status free, pid None и shutdown graceful=False. Если найден, верните status occupied '
                             "и его pid. Для SIGINT и SIGTERM shutdown graceful=True и final_state='stopped'. Для "
                             "SIGKILL shutdown graceful=False и final_state='killed'. Не изменяйте входной список.",
                     'check': 'Платформа проверит свободный port, занятый port, корректный SIGTERM и принудительный '
                              'SIGKILL. Stopped process не должен считаться слушающим.'},
        'requirements': {'items': ['поиск только running process',
                                   'сопоставление target_port',
                                   'SIGINT и SIGTERM как graceful',
                                   'SIGKILL как forced'],
                         'names': ['processes', 'target_port', 'signal', 'found', 'graceful', 'final_state'],
                         'nodes': ['FunctionDef', 'For', 'If']},
        'starter_code': 'def solve(processes, target_port, signal):\n'
                        '    # Найдите process и определите результат сигнала\n'
                        '    pass\n',
        'tests': [{'name': 'port свободен',
                   'args': [[{'pid': 10, 'name': 'uvicorn', 'port': 8000, 'state': 'stopped'}], 8000, 'SIGTERM'],
                   'expected': {'status': 'free', 'pid': None, 'graceful': False, 'final_state': None}},
                  {'name': 'graceful SIGTERM',
                   'args': [[{'pid': 11, 'name': 'uvicorn', 'port': 8000, 'state': 'running'},
                             {'pid': 12, 'name': 'worker', 'port': 9000, 'state': 'running'}],
                            8000,
                            'SIGTERM'],
                   'expected': {'status': 'occupied', 'pid': 11, 'graceful': True, 'final_state': 'stopped'}},
                  {'name': 'принудительный SIGKILL',
                   'args': [[{'pid': 21, 'name': 'uvicorn', 'port': 8080, 'state': 'running'}], 8080, 'SIGKILL'],
                   'expected': {'status': 'occupied', 'pid': 21, 'graceful': False, 'final_state': 'killed'}}],
        'reference_code': 'def solve(processes, target_port, signal):\n'
                          '    found = None\n'
                          '    for process in processes:\n'
                          "        if process['state'] == 'running' and process['port'] == target_port:\n"
                          '            found = process\n'
                          '            break\n'
                          '    if found is None:\n'
                          '        return {\n'
                          "            'status': 'free',\n"
                          "            'pid': None,\n"
                          "            'graceful': False,\n"
                          "            'final_state': None,\n"
                          '        }\n'
                          "    graceful = signal in ('SIGINT', 'SIGTERM')\n"
                          "    final_state = 'stopped' if graceful else 'killed'\n"
                          '    return {\n'
                          "        'status': 'occupied',\n"
                          "        'pid': found['pid'],\n"
                          "        'graceful': graceful,\n"
                          "        'final_state': final_state,\n"
                          '    }\n'}],
    167: [{'title': 'Сборка Settings из environment',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Соберите config: значения env имеют приоритет над defaults. Пустая строка после strip считается '
                  'отсутствующим значением. Верните config, missing и safe_preview. missing содержит обязательные '
                  'ключи без значения в порядке required. safe_preview содержит APP_ENV, LOG_LEVEL и DATABASE_URL, '
                  "но DATABASE_URL нужно заменить строкой 'configured', если значение есть, иначе 'missing'. "
                  'SECRET_KEY запрещено включать в safe_preview.',
        'contract': {'given': 'Автопроверка вызывает solve(env, defaults, required). env и defaults — словари '
                              'строковых значений. required — список обязательных ключей.',
                     'todo': 'Соберите config: значения env имеют приоритет над defaults. Пустая строка после strip '
                             'считается отсутствующим значением. Верните config, missing и safe_preview. missing '
                             'содержит обязательные ключи без значения в порядке required. safe_preview содержит '
                             'APP_ENV, LOG_LEVEL и DATABASE_URL, но DATABASE_URL нужно заменить строкой '
                             "'configured', если значение есть, иначе 'missing'. SECRET_KEY запрещено включать в "
                             'safe_preview.',
                     'check': 'Проверяются default values, environment override, пустая строка и отсутствующий '
                              'SECRET_KEY. Секрет не должен появиться в preview.'},
        'requirements': {'items': ['environment имеет приоритет',
                                   'пустые строки удаляются',
                                   'missing сохраняет порядок required',
                                   'SECRET_KEY отсутствует в preview'],
                         'names': ['env', 'defaults', 'required', 'config', 'missing', 'safe_preview'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['str'],
                         'attributes': ['items', 'strip', 'pop', 'append', 'get']},
        'starter_code': 'def solve(env, defaults, required):\n'
                        '    # Соберите config, missing и безопасный preview\n'
                        '    pass\n',
        'tests': [{'name': 'env переопределяет defaults',
                   'args': [{'APP_ENV': 'production', 'DATABASE_URL': 'postgresql://prod', 'SECRET_KEY': 'secret'},
                            {'APP_ENV': 'development', 'LOG_LEVEL': 'INFO'},
                            ['DATABASE_URL', 'SECRET_KEY']],
                   'expected': {'config': {'APP_ENV': 'production',
                                           'LOG_LEVEL': 'INFO',
                                           'DATABASE_URL': 'postgresql://prod',
                                           'SECRET_KEY': 'secret'},
                                'missing': [],
                                'safe_preview': {'APP_ENV': 'production',
                                                 'LOG_LEVEL': 'INFO',
                                                 'DATABASE_URL': 'configured'}}},
                  {'name': 'пустой secret',
                   'args': [{'SECRET_KEY': '   '},
                            {'APP_ENV': 'test', 'LOG_LEVEL': 'DEBUG', 'DATABASE_URL': 'postgresql://test'},
                            ['DATABASE_URL', 'SECRET_KEY']],
                   'expected': {'config': {'APP_ENV': 'test',
                                           'LOG_LEVEL': 'DEBUG',
                                           'DATABASE_URL': 'postgresql://test'},
                                'missing': ['SECRET_KEY'],
                                'safe_preview': {'APP_ENV': 'test',
                                                 'LOG_LEVEL': 'DEBUG',
                                                 'DATABASE_URL': 'configured'}}}],
        'reference_code': 'def solve(env, defaults, required):\n'
                          '    config = {}\n'
                          '    for key, value in defaults.items():\n'
                          "        if str(value).strip() != '':\n"
                          '            config[key] = value\n'
                          '    for key, value in env.items():\n'
                          "        if str(value).strip() == '':\n"
                          '            config.pop(key, None)\n'
                          '        else:\n'
                          '            config[key] = value\n'
                          '    missing = []\n'
                          '    for key in required:\n'
                          '        if key not in config:\n'
                          '            missing.append(key)\n'
                          "    database_state = 'configured' if 'DATABASE_URL' in config else 'missing'\n"
                          '    safe_preview = {\n'
                          "        'APP_ENV': config.get('APP_ENV'),\n"
                          "        'LOG_LEVEL': config.get('LOG_LEVEL'),\n"
                          "        'DATABASE_URL': database_state,\n"
                          '    }\n'
                          '    return {\n'
                          "        'config': config,\n"
                          "        'missing': missing,\n"
                          "        'safe_preview': safe_preview,\n"
                          '    }\n'}],
    168: [{'title': 'Безопасное структурированное событие',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните словарь level, message и context. level приведите к верхнему регистру. Из context '
                  'исключите все секретные ключи. Оставшиеся ключи отсортируйте по алфавиту и сохраните значения без '
                  'изменения. message не должна содержать traceback или секреты из удалённых полей.',
        'contract': {'given': 'Автопроверка вызывает solve(level, message, context). context — словарь произвольных '
                              'полей request. Секретными считаются password, token, access_token, refresh_token, '
                              'secret_key и authorization без учёта регистра.',
                     'todo': 'Верните словарь level, message и context. level приведите к верхнему регистру. Из '
                             'context исключите все секретные ключи. Оставшиеся ключи отсортируйте по алфавиту и '
                             'сохраните значения без изменения. message не должна содержать traceback или секреты из '
                             'удалённых полей.',
                     'check': 'Проверяются обычный request, несколько secret fields и регистр ключей. Сравнивается '
                              'точное безопасное событие.'},
        'requirements': {'items': ['уровень в верхнем регистре',
                                   'secret keys без учёта регистра',
                                   'стабильный порядок context',
                                   'безопасное событие'],
                         'names': ['level', 'message', 'context', 'secret_keys', 'safe_context'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['sorted'],
                         'attributes': ['lower', 'upper']},
        'starter_code': 'def solve(level, message, context):\n    # Удалите секреты и соберите log event\n    pass\n',
        'tests': [{'name': 'request event',
                   'args': ['info',
                            'request_completed',
                            {'request_id': 'req-7', 'path': '/tasks', 'status': 200, 'user_id': 4}],
                   'expected': {'level': 'INFO',
                                'message': 'request_completed',
                                'context': {'path': '/tasks', 'request_id': 'req-7', 'status': 200, 'user_id': 4}}},
                  {'name': 'секреты удалены',
                   'args': ['error',
                            'login_failed',
                            {'Request_ID': 'req-8',
                             'password': 'plain',
                             'Authorization': 'Bearer token',
                             'refresh_token': 'hidden',
                             'email': 'user@example.com'}],
                   'expected': {'level': 'ERROR',
                                'message': 'login_failed',
                                'context': {'Request_ID': 'req-8', 'email': 'user@example.com'}}}],
        'reference_code': 'def solve(level, message, context):\n'
                          '    secret_keys = {\n'
                          "        'password',\n"
                          "        'token',\n"
                          "        'access_token',\n"
                          "        'refresh_token',\n"
                          "        'secret_key',\n"
                          "        'authorization',\n"
                          '    }\n'
                          '    safe_context = {}\n'
                          '    for key in sorted(context):\n'
                          '        if key.lower() not in secret_keys:\n'
                          '            safe_context[key] = context[key]\n'
                          '    return {\n'
                          "        'level': level.upper(),\n"
                          "        'message': message,\n"
                          "        'context': safe_context,\n"
                          '    }\n'}],
    169: [{'title': 'Liveness, readiness и draining',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните health_status, ready_status и state. health_status равен 200, если process_running=True, '
                  'иначе 503. ready_status равен 200 только когда process работает, startup завершён, database '
                  'доступна и draining=False; иначе 503. state выбирается в порядке: stopped, starting, draining, '
                  'dependency_failed, ready.',
        'contract': {'given': 'Автопроверка вызывает solve(process_running, startup_complete, database_ok, '
                              'draining). Все аргументы имеют тип bool.',
                     'todo': 'Верните health_status, ready_status и state. health_status равен 200, если '
                             'process_running=True, иначе 503. ready_status равен 200 только когда process работает, '
                             'startup завершён, database доступна и draining=False; иначе 503. state выбирается в '
                             'порядке: stopped, starting, draining, dependency_failed, ready.',
                     'check': 'Проверяются stopped, startup, недоступная database, draining и ready. Health может '
                              'быть 200, когда readiness уже 503.'},
        'requirements': {'items': ['health зависит только от process',
                                   'readiness зависит от startup и database',
                                   'draining выключает readiness',
                                   'явный lifecycle state'],
                         'names': ['process_running',
                                   'startup_complete',
                                   'database_ok',
                                   'draining',
                                   'health_status',
                                   'ready_status',
                                   'state'],
                         'nodes': ['FunctionDef', 'If']},
        'starter_code': 'def solve(process_running, startup_complete, database_ok, draining):\n'
                        '    # Определите liveness, readiness и lifecycle state\n'
                        '    pass\n',
        'tests': [{'name': 'process остановлен',
                   'args': [False, False, False, False],
                   'expected': {'health_status': 503, 'ready_status': 503, 'state': 'stopped'}},
                  {'name': 'startup',
                   'args': [True, False, True, False],
                   'expected': {'health_status': 200, 'ready_status': 503, 'state': 'starting'}},
                  {'name': 'database недоступна',
                   'args': [True, True, False, False],
                   'expected': {'health_status': 200, 'ready_status': 503, 'state': 'dependency_failed'}},
                  {'name': 'graceful draining',
                   'args': [True, True, True, True],
                   'expected': {'health_status': 200, 'ready_status': 503, 'state': 'draining'}},
                  {'name': 'готов',
                   'args': [True, True, True, False],
                   'expected': {'health_status': 200, 'ready_status': 200, 'state': 'ready'}}],
        'reference_code': 'def solve(process_running, startup_complete, database_ok, draining):\n'
                          '    health_status = 200 if process_running else 503\n'
                          '    ready = process_running and startup_complete and database_ok and not draining\n'
                          '    ready_status = 200 if ready else 503\n'
                          '    if not process_running:\n'
                          "        state = 'stopped'\n"
                          '    elif not startup_complete:\n'
                          "        state = 'starting'\n"
                          '    elif draining:\n'
                          "        state = 'draining'\n"
                          '    elif not database_ok:\n'
                          "        state = 'dependency_failed'\n"
                          '    else:\n'
                          "        state = 'ready'\n"
                          '    return {\n'
                          "        'health_status': health_status,\n"
                          "        'ready_status': ready_status,\n"
                          "        'state': state,\n"
                          '    }\n'}]
}

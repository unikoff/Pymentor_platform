from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    153: [{'title': 'Выбор def или async def',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните endpoint_style, execution_place и reason. awaitable + io → async def, event_loop, '
                  'awaitable_io. blocking + io → def, threadpool, blocking_library. Любой cpu → def, '
                  'process_or_worker, cpu_bound. Не выбирайте async def только по названию endpoint.',
        'contract': {'given': 'Автопроверка вызывает solve(library_kind, work_kind). library_kind равен blocking или '
                              'awaitable. work_kind равен io или cpu.',
                     'todo': 'Верните endpoint_style, execution_place и reason. awaitable + io → async def, '
                             'event_loop, awaitable_io. blocking + io → def, threadpool, blocking_library. Любой cpu '
                             '→ def, process_or_worker, cpu_bound. Не выбирайте async def только по названию '
                             'endpoint.',
                     'check': 'Проверяются awaitable network client, blocking library и CPU-heavy calculation. '
                              'Сравниваются все три поля.'},
        'requirements': {'items': ['CPU boundary имеет приоритет',
                                   'async def только для awaitable I/O',
                                   'blocking I/O остаётся def',
                                   'явное место выполнения'],
                         'names': ['library_kind', 'work_kind'],
                         'nodes': ['FunctionDef', 'If']},
        'starter_code': 'def solve(library_kind, work_kind):\n'
                        '    # Выберите форму endpoint по типу работы\n'
                        '    pass\n',
        'tests': [{'name': 'awaitable I/O',
                   'args': ['awaitable', 'io'],
                   'expected': {'endpoint_style': 'async def',
                                'execution_place': 'event_loop',
                                'reason': 'awaitable_io'}},
                  {'name': 'blocking I/O',
                   'args': ['blocking', 'io'],
                   'expected': {'endpoint_style': 'def',
                                'execution_place': 'threadpool',
                                'reason': 'blocking_library'}},
                  {'name': 'CPU work',
                   'args': ['awaitable', 'cpu'],
                   'expected': {'endpoint_style': 'def',
                                'execution_place': 'process_or_worker',
                                'reason': 'cpu_bound'}}],
        'reference_code': 'def solve(library_kind, work_kind):\n'
                          "    if work_kind == 'cpu':\n"
                          '        return {\n'
                          "            'endpoint_style': 'def',\n"
                          "            'execution_place': 'process_or_worker',\n"
                          "            'reason': 'cpu_bound',\n"
                          '        }\n'
                          "    if library_kind == 'awaitable':\n"
                          '        return {\n'
                          "            'endpoint_style': 'async def',\n"
                          "            'execution_place': 'event_loop',\n"
                          "            'reason': 'awaitable_io',\n"
                          '        }\n'
                          '    return {\n'
                          "        'endpoint_style': 'def',\n"
                          "        'execution_place': 'threadpool',\n"
                          "        'reason': 'blocking_library',\n"
                          '    }\n'}],
    155: [{'title': 'Карта сетевых ошибок в HTTP',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните status, code и retryable. success → 200, ok, False. connect_timeout и read_timeout → 504, '
                  'upstream_timeout, True. connection_error → 503, upstream_unavailable, True. http_error со status '
                  '404 → 502, upstream_not_found, False. Остальной http_error → 502, upstream_error, upstream_status '
                  'не меньше 500. Не возвращайте traceback.',
        'contract': {'given': 'Автопроверка вызывает solve(outcome, upstream_status). outcome равен success, '
                              'connect_timeout, read_timeout, connection_error или http_error. upstream_status — '
                              'целое число или None.',
                     'todo': 'Верните status, code и retryable. success → 200, ok, False. connect_timeout и '
                             'read_timeout → 504, upstream_timeout, True. connection_error → 503, '
                             'upstream_unavailable, True. http_error со status 404 → 502, upstream_not_found, False. '
                             'Остальной http_error → 502, upstream_error, upstream_status не меньше 500. Не '
                             'возвращайте traceback.',
                     'check': 'Проверяются все виды outcome и upstream statuses 404, 422 и 503. Сравниваются '
                              'безопасный status, code и retryable.'},
        'requirements': {'items': ['504 для timeout',
                                   '503 для недоступной сети',
                                   '502 для upstream HTTP error',
                                   'retryable зависит от вида сбоя'],
                         'names': ['outcome', 'upstream_status'],
                         'nodes': ['FunctionDef', 'If']},
        'starter_code': 'def solve(outcome, upstream_status):\n'
                        '    # Преобразуйте upstream outcome в StudyHub contract\n'
                        '    pass\n',
        'tests': [{'name': 'success',
                   'args': ['success', 200],
                   'expected': {'status': 200, 'code': 'ok', 'retryable': False}},
                  {'name': 'read timeout',
                   'args': ['read_timeout', None],
                   'expected': {'status': 504, 'code': 'upstream_timeout', 'retryable': True}},
                  {'name': 'connection error',
                   'args': ['connection_error', None],
                   'expected': {'status': 503, 'code': 'upstream_unavailable', 'retryable': True}},
                  {'name': 'upstream 404',
                   'args': ['http_error', 404],
                   'expected': {'status': 502, 'code': 'upstream_not_found', 'retryable': False}},
                  {'name': 'upstream 503',
                   'args': ['http_error', 503],
                   'expected': {'status': 502, 'code': 'upstream_error', 'retryable': True}}],
        'reference_code': 'def solve(outcome, upstream_status):\n'
                          "    if outcome == 'success':\n"
                          "        return {'status': 200, 'code': 'ok', 'retryable': False}\n"
                          "    if outcome in ('connect_timeout', 'read_timeout'):\n"
                          '        return {\n'
                          "            'status': 504,\n"
                          "            'code': 'upstream_timeout',\n"
                          "            'retryable': True,\n"
                          '        }\n'
                          "    if outcome == 'connection_error':\n"
                          '        return {\n'
                          "            'status': 503,\n"
                          "            'code': 'upstream_unavailable',\n"
                          "            'retryable': True,\n"
                          '        }\n'
                          '    if upstream_status == 404:\n'
                          '        return {\n'
                          "            'status': 502,\n"
                          "            'code': 'upstream_not_found',\n"
                          "            'retryable': False,\n"
                          '        }\n'
                          '    return {\n'
                          "        'status': 502,\n"
                          "        'code': 'upstream_error',\n"
                          "        'retryable': upstream_status is not None and upstream_status >= 500,\n"
                          '    }\n'}]
}

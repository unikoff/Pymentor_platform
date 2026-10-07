from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    201: [{'title': 'Проследите TTL временного Redis key',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Начальное время равно 0. set содержит key, value и ttl и сохраняет expires_at=current_time+ttl. '
                  'advance содержит seconds и увеличивает текущее время. get возвращает hit только если key '
                  'существует и current_time строго меньше expires_at; иначе key удаляется и возвращается miss. '
                  'delete удаляет один key, flush удаляет все Redis keys. Верните reads, final_keys и '
                  'postgresql_unchanged=True. Каждый read содержит key, status, value и ttl_remaining.',
        'contract': {'given': 'Автопроверка вызывает solve(events). events — список словарей op и дополнительных '
                              'полей. op равен set, get, advance, delete или flush.',
                     'todo': 'Начальное время равно 0. set содержит key, value и ttl и сохраняет '
                             'expires_at=current_time+ttl. advance содержит seconds и увеличивает текущее время. get '
                             'возвращает hit только если key существует и current_time строго меньше expires_at; '
                             'иначе key удаляется и возвращается miss. delete удаляет один key, flush удаляет все '
                             'Redis keys. Верните reads, final_keys и postgresql_unchanged=True. Каждый read '
                             'содержит key, status, value и ttl_remaining.',
                     'check': 'Проверяются hit, expiration на точной границе, delete и flush. Удаление Redis data не '
                              'должно обозначать потерю PostgreSQL data.'},
        'requirements': {'items': ['TTL имеет точную границу',
                                   'expired key удаляется',
                                   'delete и flush влияют только на Redis',
                                   'final keys сортируются'],
                         'names': ['events', 'current_time', 'store', 'reads'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['sorted'],
                         'attributes': ['get', 'pop', 'clear', 'append']},
        'starter_code': 'def solve(events):\n'
                        '    current_time = 0\n'
                        '    store = {}\n'
                        '    reads = []\n'
                        '    # Выполните Redis-like события\n'
                        '    pass\n',
        'tests': [{'name': 'hit и expiration',
                   'args': [[{'op': 'set', 'key': 'catalog:v1', 'value': 'A', 'ttl': 10},
                             {'op': 'get', 'key': 'catalog:v1'},
                             {'op': 'advance', 'seconds': 10},
                             {'op': 'get', 'key': 'catalog:v1'}]],
                   'expected': {'reads': [{'key': 'catalog:v1', 'status': 'hit', 'value': 'A', 'ttl_remaining': 10},
                                          {'key': 'catalog:v1', 'status': 'miss', 'value': None, 'ttl_remaining': 0}],
                                'final_keys': [],
                                'postgresql_unchanged': True}},
                  {'name': 'delete и flush',
                   'args': [[{'op': 'set', 'key': 'a', 'value': 1, 'ttl': 30},
                             {'op': 'set', 'key': 'b', 'value': 2, 'ttl': 30},
                             {'op': 'delete', 'key': 'a'},
                             {'op': 'get', 'key': 'a'},
                             {'op': 'flush'}]],
                   'expected': {'reads': [{'key': 'a', 'status': 'miss', 'value': None, 'ttl_remaining': 0}],
                                'final_keys': [],
                                'postgresql_unchanged': True}}],
        'reference_code': 'def solve(events):\n'
                          '    current_time = 0\n'
                          '    store = {}\n'
                          '    reads = []\n'
                          '    for event in events:\n'
                          "        op = event['op']\n"
                          "        if op == 'set':\n"
                          "            store[event['key']] = {\n"
                          "                'value': event['value'],\n"
                          "                'expires_at': current_time + event['ttl'],\n"
                          '            }\n'
                          "        elif op == 'advance':\n"
                          "            current_time += event['seconds']\n"
                          "        elif op == 'delete':\n"
                          "            store.pop(event['key'], None)\n"
                          "        elif op == 'flush':\n"
                          '            store.clear()\n'
                          "        elif op == 'get':\n"
                          "            item = store.get(event['key'])\n"
                          "            if item is None or current_time >= item['expires_at']:\n"
                          "                store.pop(event['key'], None)\n"
                          '                reads.append({\n'
                          "                    'key': event['key'],\n"
                          "                    'status': 'miss',\n"
                          "                    'value': None,\n"
                          "                    'ttl_remaining': 0,\n"
                          '                })\n'
                          '            else:\n'
                          '                reads.append({\n'
                          "                    'key': event['key'],\n"
                          "                    'status': 'hit',\n"
                          "                    'value': item['value'],\n"
                          "                    'ttl_remaining': item['expires_at'] - current_time,\n"
                          '                })\n'
                          '    return {\n'
                          "        'reads': reads,\n"
                          "        'final_keys': sorted(store),\n"
                          "        'postgresql_unchanged': True,\n"
                          '    }\n'}],
    202: [{'title': 'Выполните cache-aside для каталога',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Соберите cache_key. Начало ключа: catalog:v1. Затем добавьте page и size, после них filters по '
                  'алфавиту ключей в формате key=value, разделяя части двоеточием. Если redis_available=True и '
                  'cached_value не None, верните source redis, db_queries 0, cache_write False и cached_value. Во '
                  'всех остальных случаях верните source postgresql, db_queries 1 и database_value. cache_write=True '
                  'только когда Redis доступен.',
        'contract': {'given': 'Автопроверка вызывает solve(filters, page, page_size, cached_value, redis_available, '
                              'database_value). filters — словарь строковых значений. cached_value равен None или '
                              'готовому response.',
                     'todo': 'Соберите cache_key. Начало ключа: catalog:v1. Затем добавьте page и size, после них '
                             'filters по алфавиту ключей в формате key=value, разделяя части двоеточием. Если '
                             'redis_available=True и cached_value не None, верните source redis, db_queries 0, '
                             'cache_write False и cached_value. Во всех остальных случаях верните source postgresql, '
                             'db_queries 1 и database_value. cache_write=True только когда Redis доступен.',
                     'check': 'Проверяются cache hit, cache miss, Redis unavailable и разный порядок filters. '
                              'Одинаковые параметры должны формировать одинаковый key.'},
        'requirements': {'items': ['cache key содержит pagination',
                                   'filters сортируются',
                                   'hit не выполняет SQL',
                                   'Redis failure даёт PostgreSQL fallback'],
                         'names': ['filters',
                                   'page',
                                   'page_size',
                                   'cached_value',
                                   'redis_available',
                                   'database_value',
                                   'parts',
                                   'cache_key'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['sorted'],
                         'attributes': ['append', 'join']},
        'starter_code': 'def solve(filters, page, page_size, cached_value, redis_available, database_value):\n'
                        '    # Соберите key и выполните cache-aside decision\n'
                        '    pass\n',
        'tests': [{'name': 'cache hit',
                   'args': [{'status': 'published', 'teacher': 'alice'},
                            2,
                            20,
                            {'items': ['cached']},
                            True,
                            {'items': ['database']}],
                   'expected': {'cache_key': 'catalog:v1:page=2:size=20:status=published:teacher=alice',
                                'source': 'redis',
                                'db_queries': 0,
                                'cache_write': False,
                                'response': {'items': ['cached']}}},
                  {'name': 'cache miss',
                   'args': [{'teacher': 'alice', 'status': 'published'}, 2, 20, None, True, {'items': ['database']}],
                   'expected': {'cache_key': 'catalog:v1:page=2:size=20:status=published:teacher=alice',
                                'source': 'postgresql',
                                'db_queries': 1,
                                'cache_write': True,
                                'response': {'items': ['database']}}},
                  {'name': 'Redis недоступен',
                   'args': [{}, 1, 10, {'items': ['stale']}, False, {'items': ['fresh']}],
                   'expected': {'cache_key': 'catalog:v1:page=1:size=10',
                                'source': 'postgresql',
                                'db_queries': 1,
                                'cache_write': False,
                                'response': {'items': ['fresh']}}}],
        'reference_code': 'def solve(filters, page, page_size, cached_value, redis_available, database_value):\n'
                          '    parts = [\n'
                          "        'catalog:v1',\n"
                          "        f'page={page}',\n"
                          "        f'size={page_size}',\n"
                          '    ]\n'
                          '    for key in sorted(filters):\n'
                          "        parts.append(f'{key}={filters[key]}')\n"
                          "    cache_key = ':'.join(parts)\n"
                          '    if redis_available and cached_value is not None:\n'
                          '        return {\n'
                          "            'cache_key': cache_key,\n"
                          "            'source': 'redis',\n"
                          "            'db_queries': 0,\n"
                          "            'cache_write': False,\n"
                          "            'response': cached_value,\n"
                          '        }\n'
                          '    return {\n'
                          "        'cache_key': cache_key,\n"
                          "        'source': 'postgresql',\n"
                          "        'db_queries': 1,\n"
                          "        'cache_write': redis_available,\n"
                          "        'response': database_value,\n"
                          '    }\n'}],
    203: [{'title': 'Проследите invalidation после commit',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Начально database хранит initial_database_title, cache — initial_cache_title. begin_update '
                  'создаёт pending new_title. commit переносит pending в database. rollback удаляет pending. '
                  'invalidate очищает cache. request читает cache при наличии; при miss читает database и заполняет '
                  'cache. Каждый request добавляет source, value и stale, где stale=True, если value не равен '
                  'текущему database title. Верните database_title, cache_title и responses.',
        'contract': {'given': 'Автопроверка вызывает solve(initial_database_title, initial_cache_title, new_title, '
                              'events). events — список строк begin_update, commit, rollback, invalidate и request.',
                     'todo': 'Начально database хранит initial_database_title, cache — initial_cache_title. '
                             'begin_update создаёт pending new_title. commit переносит pending в database. rollback '
                             'удаляет pending. invalidate очищает cache. request читает cache при наличии; при miss '
                             'читает database и заполняет cache. Каждый request добавляет source, value и stale, где '
                             'stale=True, если value не равен текущему database title. Верните database_title, '
                             'cache_title и responses.',
                     'check': 'Проверяются правильный порядок commit → invalidate, опасный порядок invalidate → '
                              'request → commit и rollback. Задание показывает конкретный stale scenario.'},
        'requirements': {'items': ['pending update отделён от database',
                                   'commit меняет source of truth',
                                   'invalidation очищает cache',
                                   'response отмечает stale data'],
                         'names': ['initial_database_title',
                                   'initial_cache_title',
                                   'new_title',
                                   'events',
                                   'database_title',
                                   'cache_title',
                                   'pending_title',
                                   'responses'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['append']},
        'starter_code': 'def solve(initial_database_title, initial_cache_title, new_title, events):\n'
                        '    # Выполните timeline database и cache\n'
                        '    pass\n',
        'tests': [{'name': 'правильный порядок',
                   'args': ['Old', 'Old', 'New', ['begin_update', 'commit', 'invalidate', 'request']],
                   'expected': {'database_title': 'New',
                                'cache_title': 'New',
                                'responses': [{'source': 'postgresql', 'value': 'New', 'stale': False}]}},
                  {'name': 'invalidation слишком рано',
                   'args': ['Old', 'Old', 'New', ['begin_update', 'invalidate', 'request', 'commit', 'request']],
                   'expected': {'database_title': 'New',
                                'cache_title': 'Old',
                                'responses': [{'source': 'postgresql', 'value': 'Old', 'stale': False},
                                              {'source': 'redis', 'value': 'Old', 'stale': True}]}},
                  {'name': 'rollback',
                   'args': ['Old', 'Old', 'New', ['begin_update', 'invalidate', 'rollback', 'request']],
                   'expected': {'database_title': 'Old',
                                'cache_title': 'Old',
                                'responses': [{'source': 'postgresql', 'value': 'Old', 'stale': False}]}}],
        'reference_code': 'def solve(initial_database_title, initial_cache_title, new_title, events):\n'
                          '    database_title = initial_database_title\n'
                          '    cache_title = initial_cache_title\n'
                          '    pending_title = None\n'
                          '    responses = []\n'
                          '    for event in events:\n'
                          "        if event == 'begin_update':\n"
                          '            pending_title = new_title\n'
                          "        elif event == 'commit' and pending_title is not None:\n"
                          '            database_title = pending_title\n'
                          '            pending_title = None\n'
                          "        elif event == 'rollback':\n"
                          '            pending_title = None\n'
                          "        elif event == 'invalidate':\n"
                          '            cache_title = None\n'
                          "        elif event == 'request':\n"
                          '            if cache_title is None:\n'
                          "                source = 'postgresql'\n"
                          '                value = database_title\n'
                          '                cache_title = database_title\n'
                          '            else:\n'
                          "                source = 'redis'\n"
                          '                value = cache_title\n'
                          '            responses.append({\n'
                          "                'source': source,\n"
                          "                'value': value,\n"
                          "                'stale': value != database_title,\n"
                          '            })\n'
                          '    return {\n'
                          "        'database_title': database_title,\n"
                          "        'cache_title': cache_title,\n"
                          "        'responses': responses,\n"
                          '    }\n'}],
    204: [{'title': 'Ограничьте requests в фиксированном окне',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Используйте fixed windows: window_start равен timestamp // window_seconds * window_seconds. Для '
                  'каждого request храните отдельный counter его окна. Пока counter меньше limit, верните status '
                  '200, allowed=True, remaining после принятия и retry_after 0. После достижения limit верните '
                  'status 429, allowed=False, remaining 0 и retry_after до конца текущего окна. Blocked request не '
                  'увеличивает counter.',
        'contract': {'given': 'Автопроверка вызывает solve(request_times, limit, window_seconds). request_times — '
                              'список целых timestamps в неубывающем порядке.',
                     'todo': 'Используйте fixed windows: window_start равен timestamp // window_seconds * '
                             'window_seconds. Для каждого request храните отдельный counter его окна. Пока counter '
                             'меньше limit, верните status 200, allowed=True, remaining после принятия и retry_after '
                             '0. После достижения limit верните status 429, allowed=False, remaining 0 и retry_after '
                             'до конца текущего окна. Blocked request не увеличивает counter.',
                     'check': 'Проверяются разрешённые requests, блокировка, точный переход в новое окно и '
                              'независимые окна. Порядок decisions совпадает с request_times.'},
        'requirements': {'items': ['fixed window вычисляется по timestamp',
                                   'counter отдельный для каждого окна',
                                   'blocked request не увеличивает counter',
                                   'Retry-After до конца окна'],
                         'names': ['request_times', 'limit', 'window_seconds', 'counters', 'decisions'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['get', 'append']},
        'starter_code': 'def solve(request_times, limit, window_seconds):\n'
                        '    # Посчитайте решения rate limit\n'
                        '    pass\n',
        'tests': [{'name': 'блокировка и сброс',
                   'args': [[0, 10, 20, 30, 60], 3, 60],
                   'expected': [{'time': 0, 'status': 200, 'allowed': True, 'remaining': 2, 'retry_after': 0},
                                {'time': 10, 'status': 200, 'allowed': True, 'remaining': 1, 'retry_after': 0},
                                {'time': 20, 'status': 200, 'allowed': True, 'remaining': 0, 'retry_after': 0},
                                {'time': 30, 'status': 429, 'allowed': False, 'remaining': 0, 'retry_after': 30},
                                {'time': 60, 'status': 200, 'allowed': True, 'remaining': 2, 'retry_after': 0}]},
                  {'name': 'limit один',
                   'args': [[59, 59, 60], 1, 60],
                   'expected': [{'time': 59, 'status': 200, 'allowed': True, 'remaining': 0, 'retry_after': 0},
                                {'time': 59, 'status': 429, 'allowed': False, 'remaining': 0, 'retry_after': 1},
                                {'time': 60, 'status': 200, 'allowed': True, 'remaining': 0, 'retry_after': 0}]}],
        'reference_code': 'def solve(request_times, limit, window_seconds):\n'
                          '    counters = {}\n'
                          '    decisions = []\n'
                          '    for timestamp in request_times:\n'
                          '        window_start = timestamp // window_seconds * window_seconds\n'
                          '        current = counters.get(window_start, 0)\n'
                          '        if current < limit:\n'
                          '            current += 1\n'
                          '            counters[window_start] = current\n'
                          '            decisions.append({\n'
                          "                'time': timestamp,\n"
                          "                'status': 200,\n"
                          "                'allowed': True,\n"
                          "                'remaining': limit - current,\n"
                          "                'retry_after': 0,\n"
                          '            })\n'
                          '        else:\n'
                          '            window_end = window_start + window_seconds\n'
                          '            decisions.append({\n'
                          "                'time': timestamp,\n"
                          "                'status': 429,\n"
                          "                'allowed': False,\n"
                          "                'remaining': 0,\n"
                          "                'retry_after': window_end - timestamp,\n"
                          '            })\n'
                          '    return decisions\n'}],
    205: [{'title': 'Выберите механизм после response',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Если commit_ok=False, верните http_status 409, mechanism none, scheduled False и operation_status '
                  'not_run. Если commit успешен, HTTP response считается отправленным сразу и response_delay_ms '
                  'равен 0. Короткая некритичная operation с duration_ms не больше 1000 использует mechanism '
                  'background_tasks и scheduled=True. Её operation_status равен completed или failed по '
                  'operation_fails, но HTTP status остаётся 201. Критичная либо более долгая operation использует '
                  'mechanism external_queue, scheduled=False и operation_status delegated.',
        'contract': {'given': 'Автопроверка вызывает solve(commit_ok, operation_critical, duration_ms, '
                              'operation_fails). Все аргументы кроме duration_ms имеют тип bool.',
                     'todo': 'Если commit_ok=False, верните http_status 409, mechanism none, scheduled False и '
                             'operation_status not_run. Если commit успешен, HTTP response считается отправленным '
                             'сразу и response_delay_ms равен 0. Короткая некритичная operation с duration_ms не '
                             'больше 1000 использует mechanism background_tasks и scheduled=True. Её '
                             'operation_status равен completed или failed по operation_fails, но HTTP status '
                             'остаётся 201. Критичная либо более долгая operation использует mechanism '
                             'external_queue, scheduled=False и operation_status delegated.',
                     'check': 'Проверяются failed commit, короткое mock-уведомление, ошибка background operation и '
                              'работа, требующая внешней очереди. Фоновая ошибка не должна менять уже отправленный '
                              'HTTP response.'},
        'requirements': {'items': ['background добавляется только после commit',
                                   'долгая или критичная работа требует queue',
                                   'response не ждёт operation',
                                   'background failure не меняет HTTP status'],
                         'names': ['commit_ok', 'operation_critical', 'duration_ms', 'operation_fails'],
                         'nodes': ['FunctionDef', 'If']},
        'starter_code': 'def solve(commit_ok, operation_critical, duration_ms, operation_fails):\n'
                        '    # Выберите допустимый механизм\n'
                        '    pass\n',
        'tests': [{'name': 'commit failed',
                   'args': [False, False, 50, False],
                   'expected': {'http_status': 409,
                                'response_delay_ms': 0,
                                'mechanism': 'none',
                                'scheduled': False,
                                'operation_status': 'not_run'}},
                  {'name': 'короткое уведомление',
                   'args': [True, False, 120, False],
                   'expected': {'http_status': 201,
                                'response_delay_ms': 0,
                                'mechanism': 'background_tasks',
                                'scheduled': True,
                                'operation_status': 'completed'}},
                  {'name': 'background operation failed',
                   'args': [True, False, 300, True],
                   'expected': {'http_status': 201,
                                'response_delay_ms': 0,
                                'mechanism': 'background_tasks',
                                'scheduled': True,
                                'operation_status': 'failed'}},
                  {'name': 'нужна внешняя очередь',
                   'args': [True, True, 5000, False],
                   'expected': {'http_status': 201,
                                'response_delay_ms': 0,
                                'mechanism': 'external_queue',
                                'scheduled': False,
                                'operation_status': 'delegated'}}],
        'reference_code': 'def solve(commit_ok, operation_critical, duration_ms, operation_fails):\n'
                          '    if not commit_ok:\n'
                          '        return {\n'
                          "            'http_status': 409,\n"
                          "            'response_delay_ms': 0,\n"
                          "            'mechanism': 'none',\n"
                          "            'scheduled': False,\n"
                          "            'operation_status': 'not_run',\n"
                          '        }\n'
                          '    if operation_critical or duration_ms > 1000:\n'
                          '        return {\n'
                          "            'http_status': 201,\n"
                          "            'response_delay_ms': 0,\n"
                          "            'mechanism': 'external_queue',\n"
                          "            'scheduled': False,\n"
                          "            'operation_status': 'delegated',\n"
                          '        }\n'
                          '    return {\n'
                          "        'http_status': 201,\n"
                          "        'response_delay_ms': 0,\n"
                          "        'mechanism': 'background_tasks',\n"
                          "        'scheduled': True,\n"
                          "        'operation_status': 'failed' if operation_fails else 'completed',\n"
                          '    }\n'}]
}

from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    162: [{'title': 'Async transaction без частичного commit',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Создайте copies входных данных. В transaction измените is_done на True и добавьте audit event '
                  'task_completed. При fail_audit_insert верните исходные данные, status rolled_back, '
                  'committed=False и rollback_awaited=True. При успехе верните оба изменения, status committed, '
                  'committed=True и rollback_awaited=False.',
        'contract': {'given': 'Автопроверка вызывает solve(task, audit_events, fail_audit_insert). task — словарь id '
                              'и is_done. audit_events — список словарей. fail_audit_insert моделирует '
                              'IntegrityError второго database statement.',
                     'todo': 'Создайте copies входных данных. В transaction измените is_done на True и добавьте '
                             'audit event task_completed. При fail_audit_insert верните исходные данные, status '
                             'rolled_back, committed=False и rollback_awaited=True. При успехе верните оба '
                             'изменения, status committed, committed=True и rollback_awaited=False.',
                     'check': 'Проверяется успешный transaction и ошибка второго statement. Асинхронный способ '
                              'выполнения не отменяет атомарность: при ошибке не должно оставаться частично '
                              'изменённой Task.'},
        'requirements': {'items': ['copies входных данных',
                                   'два связанных изменения',
                                   'полный rollback',
                                   'явный rollback_awaited'],
                         'names': ['task', 'audit_events', 'fail_audit_insert'],
                         'nodes': ['FunctionDef', 'If'],
                         'calls': ['dict', 'list'],
                         'attributes': ['append']},
        'starter_code': 'def solve(task, audit_events, fail_audit_insert):\n'
                        '    # Смоделируйте transaction boundary\n'
                        '    pass\n',
        'tests': [{'name': 'commit',
                   'args': [{'id': 5, 'is_done': False}, [], False],
                   'expected': {'status': 'committed',
                                'committed': True,
                                'rollback_awaited': False,
                                'task': {'id': 5, 'is_done': True},
                                'audit_events': [{'task_id': 5, 'event': 'task_completed'}]}},
                  {'name': 'rollback',
                   'args': [{'id': 5, 'is_done': False}, [], True],
                   'expected': {'status': 'rolled_back',
                                'committed': False,
                                'rollback_awaited': True,
                                'task': {'id': 5, 'is_done': False},
                                'audit_events': []}}],
        'reference_code': 'def solve(task, audit_events, fail_audit_insert):\n'
                          '    original_task = dict(task)\n'
                          '    original_events = list(audit_events)\n'
                          '    working_task = dict(task)\n'
                          '    working_events = list(audit_events)\n'
                          "    working_task['is_done'] = True\n"
                          '    if fail_audit_insert:\n'
                          '        return {\n'
                          "            'status': 'rolled_back',\n"
                          "            'committed': False,\n"
                          "            'rollback_awaited': True,\n"
                          "            'task': original_task,\n"
                          "            'audit_events': original_events,\n"
                          '        }\n'
                          '    working_events.append({\n'
                          "        'task_id': working_task['id'],\n"
                          "        'event': 'task_completed',\n"
                          '    })\n'
                          '    return {\n'
                          "        'status': 'committed',\n"
                          "        'committed': True,\n"
                          "        'rollback_awaited': False,\n"
                          "        'task': working_task,\n"
                          "        'audit_events': working_events,\n"
                          '    }\n'}],
    163: [{'title': 'N+1 и давление на connection pool',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Рассчитайте sql_queries: для lazy это 1 + parent_count, для selectin это 1 при parent_count=0, '
                  'иначе 2. active_connections равно min(concurrent_requests, pool_size). queued_requests равно '
                  'max(concurrent_requests - pool_size, 0). Верните sql_queries, active_connections, queued_requests '
                  'и n_plus_one, который True только для lazy и parent_count > 0.',
        'contract': {'given': 'Автопроверка вызывает solve(parent_count, loading_strategy, concurrent_requests, '
                              'pool_size). loading_strategy равен lazy или selectin.',
                     'todo': 'Рассчитайте sql_queries: для lazy это 1 + parent_count, для selectin это 1 при '
                             'parent_count=0, иначе 2. active_connections равно min(concurrent_requests, pool_size). '
                             'queued_requests равно max(concurrent_requests - pool_size, 0). Верните sql_queries, '
                             'active_connections, queued_requests и n_plus_one, который True только для lazy и '
                             'parent_count > 0.',
                     'check': 'Проверяются lazy/selectin, пустой список и pool pressure. Async не должен скрывать '
                              'N+1 и не создаёт бесконечный connection pool.'},
        'requirements': {'items': ['lazy query count',
                                   'selectin query count',
                                   'pool size ограничивает active connections',
                                   'остальные requests ждут в очереди'],
                         'names': ['parent_count',
                                   'loading_strategy',
                                   'concurrent_requests',
                                   'pool_size',
                                   'sql_queries',
                                   'active_connections',
                                   'queued_requests',
                                   'n_plus_one'],
                         'nodes': ['FunctionDef', 'If'],
                         'calls': ['min', 'max']},
        'starter_code': 'def solve(parent_count, loading_strategy, concurrent_requests, pool_size):\n'
                        '    # Посчитайте SQL и состояние pool\n'
                        '    pass\n',
        'tests': [{'name': 'lazy и очередь',
                   'args': [5, 'lazy', 12, 4],
                   'expected': {'sql_queries': 6, 'active_connections': 4, 'queued_requests': 8, 'n_plus_one': True}},
                  {'name': 'selectin',
                   'args': [5, 'selectin', 3, 10],
                   'expected': {'sql_queries': 2,
                                'active_connections': 3,
                                'queued_requests': 0,
                                'n_plus_one': False}},
                  {'name': 'нет parents',
                   'args': [0, 'selectin', 0, 5],
                   'expected': {'sql_queries': 1,
                                'active_connections': 0,
                                'queued_requests': 0,
                                'n_plus_one': False}}],
        'reference_code': 'def solve(parent_count, loading_strategy, concurrent_requests, pool_size):\n'
                          "    if loading_strategy == 'lazy':\n"
                          '        sql_queries = 1 + parent_count\n'
                          '    else:\n'
                          '        sql_queries = 2 if parent_count > 0 else 1\n'
                          '    active_connections = min(concurrent_requests, pool_size)\n'
                          '    queued_requests = max(concurrent_requests - pool_size, 0)\n'
                          "    n_plus_one = loading_strategy == 'lazy' and parent_count > 0\n"
                          '    return {\n'
                          "        'sql_queries': sql_queries,\n"
                          "        'active_connections': active_connections,\n"
                          "        'queued_requests': queued_requests,\n"
                          "        'n_plus_one': n_plus_one,\n"
                          '    }\n'}]
}

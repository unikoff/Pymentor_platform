from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    147: [{'title': 'Жизненный цикл Task',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Начальное state равно new, result равно None, cleanup=False. create переводит new → scheduled. '
                  'loop_tick переводит scheduled → running. await_io переводит running → waiting. io_ready переводит '
                  'waiting → running. cancel из scheduled, running или waiting переводит state в cancelled и '
                  "cleanup=True. collect из running переводит state в done и result='success'. События после done "
                  'или cancelled не меняют результат. Верните state, result и cleanup.',
        'contract': {'given': 'Автопроверка вызывает solve(events). events — список строк create, loop_tick, '
                              'await_io, io_ready, cancel, collect.',
                     'todo': 'Начальное state равно new, result равно None, cleanup=False. create переводит new → '
                             'scheduled. loop_tick переводит scheduled → running. await_io переводит running → '
                             'waiting. io_ready переводит waiting → running. cancel из scheduled, running или '
                             'waiting переводит state в cancelled и cleanup=True. collect из running переводит state '
                             "в done и result='success'. События после done или cancelled не меняют результат. "
                             'Верните state, result и cleanup.',
                     'check': 'Проверяются успешный Task, Task в ожидании, отмена во время I/O и события после '
                              'завершения. Отмена должна включать cleanup и не создавать success.'},
        'requirements': {'items': ['states scheduled/running/waiting',
                                   'cancelled terminal state',
                                   'cleanup при cancellation',
                                   'success только после collect'],
                         'names': ['events', 'state', 'result', 'cleanup'],
                         'nodes': ['FunctionDef', 'For', 'If']},
        'starter_code': 'def solve(events):\n'
                        "    state = 'new'\n"
                        '    result = None\n'
                        '    cleanup = False\n'
                        '    # Выполните переходы состояний\n'
                        '    pass\n',
        'tests': [{'name': 'успешный Task',
                   'args': [['create', 'loop_tick', 'await_io', 'io_ready', 'collect']],
                   'expected': {'state': 'done', 'result': 'success', 'cleanup': False}},
                  {'name': 'ожидает I/O',
                   'args': [['create', 'loop_tick', 'await_io']],
                   'expected': {'state': 'waiting', 'result': None, 'cleanup': False}},
                  {'name': 'отменён во время ожидания',
                   'args': [['create', 'loop_tick', 'await_io', 'cancel', 'io_ready', 'collect']],
                   'expected': {'state': 'cancelled', 'result': None, 'cleanup': True}}],
        'reference_code': 'def solve(events):\n'
                          "    state = 'new'\n"
                          '    result = None\n'
                          '    cleanup = False\n'
                          '    for event in events:\n'
                          "        if state in ('done', 'cancelled'):\n"
                          '            continue\n'
                          "        if event == 'create' and state == 'new':\n"
                          "            state = 'scheduled'\n"
                          "        elif event == 'loop_tick' and state == 'scheduled':\n"
                          "            state = 'running'\n"
                          "        elif event == 'await_io' and state == 'running':\n"
                          "            state = 'waiting'\n"
                          "        elif event == 'io_ready' and state == 'waiting':\n"
                          "            state = 'running'\n"
                          "        elif event == 'cancel' and state in ('scheduled', 'running', 'waiting'):\n"
                          "            state = 'cancelled'\n"
                          '            cleanup = True\n'
                          "        elif event == 'collect' and state == 'running':\n"
                          "            state = 'done'\n"
                          "            result = 'success'\n"
                          "    return {'state': state, 'result': result, 'cleanup': cleanup}\n"}],
    148: [{'title': 'Порядок результатов gather',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните completion_order и gathered_results. completion_order — names по возрастанию duration_ms; '
                  'при равной duration сохраняйте исходный порядок. gathered_results — values result в исходном '
                  'порядке jobs, независимо от времени завершения. Также верните total_ms как максимальную duration '
                  'или 0.',
        'contract': {'given': 'Автопроверка вызывает solve(jobs). jobs — список словарей name, duration_ms и result. '
                              'Все jobs запускаются одновременно.',
                     'todo': 'Верните completion_order и gathered_results. completion_order — names по возрастанию '
                             'duration_ms; при равной duration сохраняйте исходный порядок. gathered_results — '
                             'values result в исходном порядке jobs, независимо от времени завершения. Также верните '
                             'total_ms как максимальную duration или 0.',
                     'check': 'Проверяется различающийся порядок завершения, одинаковая duration и пустой список. '
                              'Главная проверка: gather сохраняет порядок входных awaitables, а не completion '
                              'order.'},
        'requirements': {'items': ['completion order по duration',
                                   'стабильность при равной duration',
                                   'gather result в исходном порядке',
                                   'total как максимум'],
                         'names': ['jobs', 'completion_order', 'gathered_results', 'total_ms'],
                         'nodes': ['FunctionDef', 'For'],
                         'calls': ['enumerate', 'max'],
                         'attributes': ['append', 'sort']},
        'starter_code': 'def solve(jobs):\n    # Верните два разных порядка и total_ms\n    pass\n',
        'tests': [{'name': 'разный порядок',
                   'args': [[{'name': 'profile', 'duration_ms': 80, 'result': 'P'},
                             {'name': 'stats', 'duration_ms': 20, 'result': 'S'},
                             {'name': 'recommendations', 'duration_ms': 50, 'result': 'R'}]],
                   'expected': {'completion_order': ['stats', 'recommendations', 'profile'],
                                'gathered_results': ['P', 'S', 'R'],
                                'total_ms': 80}},
                  {'name': 'равная duration',
                   'args': [[{'name': 'a', 'duration_ms': 10, 'result': 1},
                             {'name': 'b', 'duration_ms': 10, 'result': 2}]],
                   'expected': {'completion_order': ['a', 'b'], 'gathered_results': [1, 2], 'total_ms': 10}},
                  {'name': 'пустой',
                   'args': [[]],
                   'expected': {'completion_order': [], 'gathered_results': [], 'total_ms': 0}}],
        'reference_code': 'def solve(jobs):\n'
                          '    indexed_jobs = []\n'
                          '    for index, job in enumerate(jobs):\n'
                          "        indexed_jobs.append((job['duration_ms'], index, job))\n"
                          '    indexed_jobs.sort(key=lambda item: (item[0], item[1]))\n'
                          '    completion_order = []\n'
                          '    for _, _, job in indexed_jobs:\n'
                          "        completion_order.append(job['name'])\n"
                          '    gathered_results = []\n'
                          '    for job in jobs:\n'
                          "        gathered_results.append(job['result'])\n"
                          "    total_ms = max([job['duration_ms'] for job in jobs]) if jobs else 0\n"
                          '    return {\n'
                          "        'completion_order': completion_order,\n"
                          "        'gathered_results': gathered_results,\n"
                          "        'total_ms': total_ms,\n"
                          '    }\n'}],
    149: [{'title': 'Timeout как отдельный исход',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Для каждой operation верните словарь name, status и value. Если duration_ms строго меньше '
                  "timeout_ms, status='success', value получает result. Если duration_ms не меньше timeout_ms, "
                  "status='timeout', value=None. Верните results в исходном порядке, success_count и timeout_count. "
                  'Timeout не является retry: не запускайте operation второй раз.',
        'contract': {'given': 'Автопроверка вызывает solve(operations, timeout_ms). operations — список словарей '
                              'name, duration_ms и result.',
                     'todo': 'Для каждой operation верните словарь name, status и value. Если duration_ms строго '
                             "меньше timeout_ms, status='success', value получает result. Если duration_ms не меньше "
                             "timeout_ms, status='timeout', value=None. Верните results в исходном порядке, "
                             'success_count и timeout_count. Timeout не является retry: не запускайте operation '
                             'второй раз.',
                     'check': 'Проверяется success, точная граница timeout, несколько operations и пустой список. '
                              'Operation на границе duration_ms == timeout_ms считается timeout.'},
        'requirements': {'items': ['строгая граница duration < timeout',
                                   'success и timeout как разные statuses',
                                   'value None для timeout',
                                   'два счётчика'],
                         'names': ['operations', 'timeout_ms', 'results', 'success_count', 'timeout_count'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['append']},
        'starter_code': 'def solve(operations, timeout_ms):\n'
                        '    results = []\n'
                        '    success_count = 0\n'
                        '    timeout_count = 0\n'
                        '    # Классифицируйте каждую operation\n'
                        '    pass\n',
        'tests': [{'name': 'смешанный результат',
                   'args': [[{'name': 'fast', 'duration_ms': 20, 'result': 'ok'},
                             {'name': 'edge', 'duration_ms': 50, 'result': 'late'},
                             {'name': 'slow', 'duration_ms': 90, 'result': 'very late'}],
                            50],
                   'expected': {'results': [{'name': 'fast', 'status': 'success', 'value': 'ok'},
                                            {'name': 'edge', 'status': 'timeout', 'value': None},
                                            {'name': 'slow', 'status': 'timeout', 'value': None}],
                                'success_count': 1,
                                'timeout_count': 2}},
                  {'name': 'все успешны',
                   'args': [[{'name': 'a', 'duration_ms': 1, 'result': 1},
                             {'name': 'b', 'duration_ms': 2, 'result': 2}],
                            10],
                   'expected': {'results': [{'name': 'a', 'status': 'success', 'value': 1},
                                            {'name': 'b', 'status': 'success', 'value': 2}],
                                'success_count': 2,
                                'timeout_count': 0}}],
        'reference_code': 'def solve(operations, timeout_ms):\n'
                          '    results = []\n'
                          '    success_count = 0\n'
                          '    timeout_count = 0\n'
                          '    for operation in operations:\n'
                          "        if operation['duration_ms'] < timeout_ms:\n"
                          '            results.append({\n'
                          "                'name': operation['name'],\n"
                          "                'status': 'success',\n"
                          "                'value': operation['result'],\n"
                          '            })\n'
                          '            success_count += 1\n'
                          '        else:\n'
                          '            results.append({\n'
                          "                'name': operation['name'],\n"
                          "                'status': 'timeout',\n"
                          "                'value': None,\n"
                          '            })\n'
                          '            timeout_count += 1\n'
                          '    return {\n'
                          "        'results': results,\n"
                          "        'success_count': success_count,\n"
                          "        'timeout_count': timeout_count,\n"
                          '    }\n'}],
    151: [{'title': 'Ограниченная concurrency',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Смоделируйте выполнение по batches. Каждый batch содержит не больше limit operations и длится '
                  'столько, сколько самая медленная operation в batch. Верните batches как список исходных '
                  'durations, total_ms как сумму длительностей batches и max_active как min(limit, количество '
                  'operations). При пустом списке max_active и total_ms равны 0.',
        'contract': {'given': 'Автопроверка вызывает solve(durations_ms, limit). durations_ms — список длительностей '
                              'независимых operations, limit — максимальное число одновременно активных operations.',
                     'todo': 'Смоделируйте выполнение по batches. Каждый batch содержит не больше limit operations и '
                             'длится столько, сколько самая медленная operation в batch. Верните batches как список '
                             'исходных durations, total_ms как сумму длительностей batches и max_active как '
                             'min(limit, количество operations). При пустом списке max_active и total_ms равны 0.',
                     'check': 'Проверяется limit 1, limit 2, limit больше числа operations и пустой список. Решение '
                              'должно показать, что меньший semaphore limit уменьшает одновременную нагрузку, но '
                              'может увеличить общее время.'},
        'requirements': {'items': ['не больше limit в batch',
                                   'batch duration как maximum',
                                   'total как сумма batches',
                                   'max_active'],
                         'names': ['durations_ms', 'limit', 'batches', 'total_ms', 'max_active'],
                         'nodes': ['FunctionDef', 'While'],
                         'calls': ['len', 'max', 'min'],
                         'attributes': ['append']},
        'starter_code': 'def solve(durations_ms, limit):\n'
                        '    batches = []\n'
                        '    # Разбейте операции на ограниченные batches\n'
                        '    pass\n',
        'tests': [{'name': 'limit два',
                   'args': [[40, 70, 20, 50, 10], 2],
                   'expected': {'batches': [[40, 70], [20, 50], [10]], 'total_ms': 130, 'max_active': 2}},
                  {'name': 'последовательно',
                   'args': [[40, 70, 20], 1],
                   'expected': {'batches': [[40], [70], [20]], 'total_ms': 130, 'max_active': 1}},
                  {'name': 'limit больше списка',
                   'args': [[40, 70, 20], 10],
                   'expected': {'batches': [[40, 70, 20]], 'total_ms': 70, 'max_active': 3}},
                  {'name': 'пустой', 'args': [[], 3], 'expected': {'batches': [], 'total_ms': 0, 'max_active': 0}}],
        'reference_code': 'def solve(durations_ms, limit):\n'
                          '    batches = []\n'
                          '    total_ms = 0\n'
                          '    index = 0\n'
                          '    while index < len(durations_ms):\n'
                          '        batch = durations_ms[index:index + limit]\n'
                          '        batches.append(batch)\n'
                          '        total_ms += max(batch)\n'
                          '        index += limit\n'
                          '    max_active = min(limit, len(durations_ms)) if durations_ms else 0\n'
                          '    return {\n'
                          "        'batches': batches,\n"
                          "        'total_ms': total_ms,\n"
                          "        'max_active': max_active,\n"
                          '    }\n'}],
    152: [{'title': 'Структурированный частичный результат',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Верните items, summary и overall_status. Для success сохраните value. Для error и timeout '
                  'установите value=None. summary содержит counts success, error и timeout. overall_status равен '
                  'success, если все operations успешны; partial, если есть хотя бы один success и хотя бы один '
                  'failure; failed, если success нет. Пустой список считается failed.',
        'contract': {'given': 'Автопроверка вызывает solve(operations). operations — список словарей name, outcome и '
                              'value. outcome равен success, error или timeout.',
                     'todo': 'Верните items, summary и overall_status. Для success сохраните value. Для error и '
                             'timeout установите value=None. summary содержит counts success, error и timeout. '
                             'overall_status равен success, если все operations успешны; partial, если есть хотя бы '
                             'один success и хотя бы один failure; failed, если success нет. Пустой список считается '
                             'failed.',
                     'check': 'Проверяются полный успех, partial response, полный failure и пустой список. Порядок '
                              'items сохраняется.'},
        'requirements': {'items': ['три явных status',
                                   'value только для success',
                                   'summary counts',
                                   'overall success/partial/failed'],
                         'names': ['operations', 'items', 'summary', 'overall_status'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['len'],
                         'attributes': ['append']},
        'starter_code': 'def solve(operations):\n'
                        '    items = []\n'
                        "    summary = {'success': 0, 'error': 0, 'timeout': 0}\n"
                        '    # Соберите структурированный итог\n'
                        '    pass\n',
        'tests': [{'name': 'partial',
                   'args': [[{'name': 'profile', 'outcome': 'success', 'value': {'id': 7}},
                             {'name': 'stats', 'outcome': 'timeout', 'value': {'count': 4}},
                             {'name': 'recommendations', 'outcome': 'error', 'value': ['x']}]],
                   'expected': {'items': [{'name': 'profile', 'status': 'success', 'value': {'id': 7}},
                                          {'name': 'stats', 'status': 'timeout', 'value': None},
                                          {'name': 'recommendations', 'status': 'error', 'value': None}],
                                'summary': {'success': 1, 'error': 1, 'timeout': 1},
                                'overall_status': 'partial'}},
                  {'name': 'всё успешно',
                   'args': [[{'name': 'a', 'outcome': 'success', 'value': 1},
                             {'name': 'b', 'outcome': 'success', 'value': 2}]],
                   'expected': {'items': [{'name': 'a', 'status': 'success', 'value': 1},
                                          {'name': 'b', 'status': 'success', 'value': 2}],
                                'summary': {'success': 2, 'error': 0, 'timeout': 0},
                                'overall_status': 'success'}},
                  {'name': 'нет успехов',
                   'args': [[{'name': 'a', 'outcome': 'error', 'value': 1},
                             {'name': 'b', 'outcome': 'timeout', 'value': 2}]],
                   'expected': {'items': [{'name': 'a', 'status': 'error', 'value': None},
                                          {'name': 'b', 'status': 'timeout', 'value': None}],
                                'summary': {'success': 0, 'error': 1, 'timeout': 1},
                                'overall_status': 'failed'}}],
        'reference_code': 'def solve(operations):\n'
                          '    items = []\n'
                          "    summary = {'success': 0, 'error': 0, 'timeout': 0}\n"
                          '    for operation in operations:\n'
                          "        status = operation['outcome']\n"
                          '        summary[status] += 1\n'
                          "        value = operation['value'] if status == 'success' else None\n"
                          '        items.append({\n'
                          "            'name': operation['name'],\n"
                          "            'status': status,\n"
                          "            'value': value,\n"
                          '        })\n'
                          "    failures = summary['error'] + summary['timeout']\n"
                          "    if summary['success'] == len(operations) and operations:\n"
                          "        overall_status = 'success'\n"
                          "    elif summary['success'] > 0 and failures > 0:\n"
                          "        overall_status = 'partial'\n"
                          '    else:\n'
                          "        overall_status = 'failed'\n"
                          '    return {\n'
                          "        'items': items,\n"
                          "        'summary': summary,\n"
                          "        'overall_status': overall_status,\n"
                          '    }\n'}]
}

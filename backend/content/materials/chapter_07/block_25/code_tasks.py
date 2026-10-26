from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    141: [{'title': 'Разделите работу и ожидание',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните словарь cpu_ms, io_wait_ms, blocking_total_ms и async_opportunity_ms. cpu_ms — сумма '
                  'duration_ms всех cpu operations. io_wait_ms — сумма duration_ms всех io operations. '
                  'blocking_total_ms — сумма всех durations. async_opportunity_ms — только io_wait_ms, потому что '
                  'await сам по себе не ускоряет CPU work.',
        'contract': {'given': 'Автопроверка вызывает solve(operations). operations — список словарей name, kind и '
                              'duration_ms. kind равен cpu или io.',
                     'todo': 'Верните словарь cpu_ms, io_wait_ms, blocking_total_ms и async_opportunity_ms. cpu_ms — '
                             'сумма duration_ms всех cpu operations. io_wait_ms — сумма duration_ms всех io '
                             'operations. blocking_total_ms — сумма всех durations. async_opportunity_ms — только '
                             'io_wait_ms, потому что await сам по себе не ускоряет CPU work.',
                     'check': 'Проверяются смешанный список, только CPU, только I/O и пустой список. Сравниваются '
                              'четыре итоговых числа. CPU duration не должна попадать в async_opportunity_ms.'},
        'requirements': {'items': ['отдельная сумма CPU work',
                                   'отдельная сумма I/O wait',
                                   'blocking total',
                                   'async opportunity содержит только I/O'],
                         'names': ['operations', 'cpu_ms', 'io_wait_ms'],
                         'nodes': ['FunctionDef', 'For', 'If']},
        'starter_code': 'def solve(operations):\n'
                        '    cpu_ms = 0\n'
                        '    io_wait_ms = 0\n'
                        '    # Просуммируйте два вида операций\n'
                        '    pass\n',
        'tests': [{'name': 'смешанный flow',
                   'args': [[{'name': 'validate', 'kind': 'cpu', 'duration_ms': 5},
                             {'name': 'postgres', 'kind': 'io', 'duration_ms': 40},
                             {'name': 'serialize', 'kind': 'cpu', 'duration_ms': 3},
                             {'name': 'http', 'kind': 'io', 'duration_ms': 60}]],
                   'expected': {'cpu_ms': 8,
                                'io_wait_ms': 100,
                                'blocking_total_ms': 108,
                                'async_opportunity_ms': 100}},
                  {'name': 'только CPU',
                   'args': [[{'name': 'hash', 'kind': 'cpu', 'duration_ms': 50},
                             {'name': 'sort', 'kind': 'cpu', 'duration_ms': 20}]],
                   'expected': {'cpu_ms': 70, 'io_wait_ms': 0, 'blocking_total_ms': 70, 'async_opportunity_ms': 0}},
                  {'name': 'пустой flow',
                   'args': [[]],
                   'expected': {'cpu_ms': 0, 'io_wait_ms': 0, 'blocking_total_ms': 0, 'async_opportunity_ms': 0}}],
        'reference_code': 'def solve(operations):\n'
                          '    cpu_ms = 0\n'
                          '    io_wait_ms = 0\n'
                          '    for operation in operations:\n'
                          "        if operation['kind'] == 'cpu':\n"
                          "            cpu_ms += operation['duration_ms']\n"
                          '        else:\n'
                          "            io_wait_ms += operation['duration_ms']\n"
                          '    return {\n'
                          "        'cpu_ms': cpu_ms,\n"
                          "        'io_wait_ms': io_wait_ms,\n"
                          "        'blocking_total_ms': cpu_ms + io_wait_ms,\n"
                          "        'async_opportunity_ms': io_wait_ms,\n"
                          '    }\n'}],
    142: [{'title': 'Состояния coroutine до и после запуска',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Начальные значения: coroutine_created=False, scheduled=False, body_started=False, done=False, '
                  'result_ready=False. call_async_function создаёт coroutine object, но не запускает body. '
                  'await_coroutine создаёт coroutine при необходимости, планирует её и запускает body. create_task '
                  'создаёт coroutine при необходимости и делает scheduled=True, но body_started меняется только '
                  'после event_loop_tick. event_loop_tick запускает scheduled coroutine. collect_result делает '
                  'done=True и result_ready=True только если body_started=True. Верните все пять flags.',
        'contract': {'given': 'Автопроверка вызывает solve(events). events — список строк call_async_function, '
                              'await_coroutine, create_task, event_loop_tick и collect_result.',
                     'todo': 'Начальные значения: coroutine_created=False, scheduled=False, body_started=False, '
                             'done=False, result_ready=False. call_async_function создаёт coroutine object, но не '
                             'запускает body. await_coroutine создаёт coroutine при необходимости, планирует её и '
                             'запускает body. create_task создаёт coroutine при необходимости и делает '
                             'scheduled=True, но body_started меняется только после event_loop_tick. event_loop_tick '
                             'запускает scheduled coroutine. collect_result делает done=True и result_ready=True '
                             'только если body_started=True. Верните все пять flags.',
                     'check': 'Проверяется простой вызов без запуска, прямой await, create_task до tick и полный '
                              'lifecycle Task. Обычный вызов async function не должен обозначаться как выполненное '
                              'тело.'},
        'requirements': {'items': ['coroutine object не запускает body',
                                   'await запускает coroutine',
                                   'Task ждёт event loop tick',
                                   'result готов только после body'],
                         'names': ['events',
                                   'coroutine_created',
                                   'scheduled',
                                   'body_started',
                                   'done',
                                   'result_ready'],
                         'nodes': ['FunctionDef', 'For', 'If']},
        'starter_code': 'def solve(events):\n'
                        '    coroutine_created = False\n'
                        '    scheduled = False\n'
                        '    body_started = False\n'
                        '    done = False\n'
                        '    result_ready = False\n'
                        '    # Обработайте события по порядку\n'
                        '    pass\n',
        'tests': [{'name': 'только создан object',
                   'args': [['call_async_function']],
                   'expected': {'coroutine_created': True,
                                'scheduled': False,
                                'body_started': False,
                                'done': False,
                                'result_ready': False}},
                  {'name': 'прямой await',
                   'args': [['await_coroutine', 'collect_result']],
                   'expected': {'coroutine_created': True,
                                'scheduled': True,
                                'body_started': True,
                                'done': True,
                                'result_ready': True}},
                  {'name': 'Task ещё не получил tick',
                   'args': [['create_task']],
                   'expected': {'coroutine_created': True,
                                'scheduled': True,
                                'body_started': False,
                                'done': False,
                                'result_ready': False}},
                  {'name': 'полный Task lifecycle',
                   'args': [['create_task', 'event_loop_tick', 'collect_result']],
                   'expected': {'coroutine_created': True,
                                'scheduled': True,
                                'body_started': True,
                                'done': True,
                                'result_ready': True}}],
        'reference_code': 'def solve(events):\n'
                          '    coroutine_created = False\n'
                          '    scheduled = False\n'
                          '    body_started = False\n'
                          '    done = False\n'
                          '    result_ready = False\n'
                          '    for event in events:\n'
                          "        if event == 'call_async_function':\n"
                          '            coroutine_created = True\n'
                          "        elif event == 'await_coroutine':\n"
                          '            coroutine_created = True\n'
                          '            scheduled = True\n'
                          '            body_started = True\n'
                          "        elif event == 'create_task':\n"
                          '            coroutine_created = True\n'
                          '            scheduled = True\n'
                          "        elif event == 'event_loop_tick' and scheduled:\n"
                          '            body_started = True\n'
                          "        elif event == 'collect_result' and body_started:\n"
                          '            done = True\n'
                          '            result_ready = True\n'
                          '    return {\n'
                          "        'coroutine_created': coroutine_created,\n"
                          "        'scheduled': scheduled,\n"
                          "        'body_started': body_started,\n"
                          "        'done': done,\n"
                          "        'result_ready': result_ready,\n"
                          '    }\n'}],
    144: [{'title': 'Последовательное и конкурентное ожидание',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните total_ms и timeline. В sequential total_ms равен сумме delays; timeline содержит словари '
                  'operation, start_ms и finish_ms, где каждая operation начинается после предыдущей. В concurrent '
                  'все operations стартуют в 0, finish_ms равен собственной delay, а total_ms равен максимальной '
                  'delay или 0 для пустого списка. Порядок timeline соответствует delays_ms.',
        'contract': {'given': 'Автопроверка вызывает solve(delays_ms, mode). delays_ms — список длительностей '
                              'независимых I/O operations. mode равен sequential или concurrent.',
                     'todo': 'Верните total_ms и timeline. В sequential total_ms равен сумме delays; timeline '
                             'содержит словари operation, start_ms и finish_ms, где каждая operation начинается '
                             'после предыдущей. В concurrent все operations стартуют в 0, finish_ms равен '
                             'собственной delay, а total_ms равен максимальной delay или 0 для пустого списка. '
                             'Порядок timeline соответствует delays_ms.',
                     'check': 'Платформа сравнит одинаковый набор delays в двух modes, одну operation и пустой '
                              'список. Два последовательных await должны давать сумму ожиданий, а конкурентный '
                              'запуск — максимум.'},
        'requirements': {'items': ['sequential total как сумма',
                                   'concurrent total как максимум',
                                   'явные start и finish',
                                   'пустой список'],
                         'names': ['delays_ms', 'mode', 'timeline'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['enumerate', 'max'],
                         'attributes': ['append']},
        'starter_code': 'def solve(delays_ms, mode):\n'
                        '    timeline = []\n'
                        '    # Постройте timeline и total_ms\n'
                        '    pass\n',
        'tests': [{'name': 'sequential',
                   'args': [[40, 70, 20], 'sequential'],
                   'expected': {'total_ms': 130,
                                'timeline': [{'operation': 1, 'start_ms': 0, 'finish_ms': 40},
                                             {'operation': 2, 'start_ms': 40, 'finish_ms': 110},
                                             {'operation': 3, 'start_ms': 110, 'finish_ms': 130}]}},
                  {'name': 'concurrent',
                   'args': [[40, 70, 20], 'concurrent'],
                   'expected': {'total_ms': 70,
                                'timeline': [{'operation': 1, 'start_ms': 0, 'finish_ms': 40},
                                             {'operation': 2, 'start_ms': 0, 'finish_ms': 70},
                                             {'operation': 3, 'start_ms': 0, 'finish_ms': 20}]}},
                  {'name': 'пустой', 'args': [[], 'concurrent'], 'expected': {'total_ms': 0, 'timeline': []}}],
        'reference_code': 'def solve(delays_ms, mode):\n'
                          '    timeline = []\n'
                          "    if mode == 'sequential':\n"
                          '        current_ms = 0\n'
                          '        for index, delay in enumerate(delays_ms, start=1):\n'
                          '            finish_ms = current_ms + delay\n'
                          '            timeline.append({\n'
                          "                'operation': index,\n"
                          "                'start_ms': current_ms,\n"
                          "                'finish_ms': finish_ms,\n"
                          '            })\n'
                          '            current_ms = finish_ms\n'
                          "        return {'total_ms': current_ms, 'timeline': timeline}\n"
                          '    for index, delay in enumerate(delays_ms, start=1):\n'
                          '        timeline.append({\n'
                          "            'operation': index,\n"
                          "            'start_ms': 0,\n"
                          "            'finish_ms': delay,\n"
                          '        })\n'
                          '    total_ms = max(delays_ms) if delays_ms else 0\n'
                          "    return {'total_ms': total_ms, 'timeline': timeline}\n"}]
}

from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    177: [{'title': 'Service DNS внутри Compose',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Если source_service или target_service отсутствует, верните reachable=False и url=None. Если оба '
                  'существуют, внутренний URL равен target_service:target_port и не использует host published port. '
                  'Верните reachable=True, internal_url и host_url. host_url существует только когда target_service '
                  'есть в published_ports и имеет вид localhost:host_port.',
        'contract': {'given': 'Автопроверка вызывает solve(services, source_service, target_service, target_port, '
                              'published_ports). services — список имён Compose services. published_ports — словарь '
                              'service → host port.',
                     'todo': 'Если source_service или target_service отсутствует, верните reachable=False и '
                             'url=None. Если оба существуют, внутренний URL равен target_service:target_port и не '
                             'использует host published port. Верните reachable=True, internal_url и host_url. '
                             'host_url существует только когда target_service есть в published_ports и имеет вид '
                             'localhost:host_port.',
                     'check': 'Проверяются API → db, API → redis, unpublished internal service и неизвестное имя. '
                              'Внутренний URL запрещено строить через localhost.'},
        'requirements': {'items': ['проверка существования двух services',
                                   'service name как hostname',
                                   'container port внутри сети',
                                   'published port только для host'],
                         'names': ['services',
                                   'source_service',
                                   'target_service',
                                   'target_port',
                                   'published_ports',
                                   'service_names',
                                   'internal_url',
                                   'host_url'],
                         'nodes': ['FunctionDef', 'If'],
                         'calls': ['set']},
        'starter_code': 'def solve(services, source_service, target_service, target_port, published_ports):\n'
                        '    # Соберите внутренний и host URL\n'
                        '    pass\n',
        'tests': [{'name': 'API подключается к db',
                   'args': [['api', 'db', 'redis'], 'api', 'db', 5432, {'api': 8000}],
                   'expected': {'reachable': True, 'internal_url': 'db:5432', 'host_url': None}},
                  {'name': 'API опубликован на host',
                   'args': [['api', 'db'], 'db', 'api', 8000, {'api': 8080}],
                   'expected': {'reachable': True, 'internal_url': 'api:8000', 'host_url': 'localhost:8080'}},
                  {'name': 'service отсутствует',
                   'args': [['api', 'db'], 'api', 'redis', 6379, {'api': 8000}],
                   'expected': {'reachable': False, 'internal_url': None, 'host_url': None}}],
        'reference_code': 'def solve(services, source_service, target_service, target_port, published_ports):\n'
                          '    service_names = set(services)\n'
                          '    if source_service not in service_names or target_service not in service_names:\n'
                          '        return {\n'
                          "            'reachable': False,\n"
                          "            'internal_url': None,\n"
                          "            'host_url': None,\n"
                          '        }\n'
                          "    internal_url = f'{target_service}:{target_port}'\n"
                          '    host_url = None\n'
                          '    if target_service in published_ports:\n'
                          '        host_url = f"localhost:{published_ports[target_service]}"\n'
                          '    return {\n'
                          "        'reachable': True,\n"
                          "        'internal_url': internal_url,\n"
                          "        'host_url': host_url,\n"
                          '    }\n'}],
    179: [{'title': 'Lifecycle container и named volume',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Начальные flags: volume_exists=False, container_exists=False, database_running=False, '
                  'row_exists=False. create_volume создаёт volume. start_db создаёт container и запускает database; '
                  'если volume уже существует, row state сохраняется. write_row возможно только при running database '
                  'и существующем volume. stop выключает database. remove_container и compose_down удаляют '
                  'container, но сохраняют volume и row. compose_down_v удаляет container, volume и row. Верните '
                  'четыре flags.',
        'contract': {'given': 'Автопроверка вызывает solve(events). events — список строк create_volume, start_db, '
                              'write_row, stop, remove_container, compose_down и compose_down_v.',
                     'todo': 'Начальные flags: volume_exists=False, container_exists=False, database_running=False, '
                             'row_exists=False. create_volume создаёт volume. start_db создаёт container и запускает '
                             'database; если volume уже существует, row state сохраняется. write_row возможно только '
                             'при running database и существующем volume. stop выключает database. remove_container '
                             'и compose_down удаляют container, но сохраняют volume и row. compose_down_v удаляет '
                             'container, volume и row. Верните четыре flags.',
                     'check': 'Проверяются recreate с сохранением данных и полный reset через down -v. Named volume '
                              'не считается backup.'},
        'requirements': {'items': ['container lifecycle отдельно от volume',
                                   'compose down сохраняет data',
                                   'down -v удаляет volume',
                                   'row живёт вместе с volume'],
                         'names': ['events', 'volume_exists', 'container_exists', 'database_running', 'row_exists'],
                         'nodes': ['FunctionDef', 'For', 'If']},
        'starter_code': 'def solve(events):\n'
                        '    volume_exists = False\n'
                        '    container_exists = False\n'
                        '    database_running = False\n'
                        '    row_exists = False\n'
                        '    # Выполните lifecycle\n'
                        '    pass\n',
        'tests': [{'name': 'данные переживают recreate',
                   'args': [['create_volume', 'start_db', 'write_row', 'stop', 'remove_container', 'start_db']],
                   'expected': {'volume_exists': True,
                                'container_exists': True,
                                'database_running': True,
                                'row_exists': True}},
                  {'name': 'down сохраняет volume',
                   'args': [['create_volume', 'start_db', 'write_row', 'compose_down']],
                   'expected': {'volume_exists': True,
                                'container_exists': False,
                                'database_running': False,
                                'row_exists': True}},
                  {'name': 'down v удаляет данные',
                   'args': [['create_volume', 'start_db', 'write_row', 'compose_down_v']],
                   'expected': {'volume_exists': False,
                                'container_exists': False,
                                'database_running': False,
                                'row_exists': False}}],
        'reference_code': 'def solve(events):\n'
                          '    volume_exists = False\n'
                          '    container_exists = False\n'
                          '    database_running = False\n'
                          '    row_exists = False\n'
                          '    for event in events:\n'
                          "        if event == 'create_volume':\n"
                          '            volume_exists = True\n'
                          "        elif event == 'start_db':\n"
                          '            container_exists = True\n'
                          '            database_running = True\n'
                          "        elif event == 'write_row' and database_running and volume_exists:\n"
                          '            row_exists = True\n'
                          "        elif event == 'stop':\n"
                          '            database_running = False\n'
                          "        elif event in ('remove_container', 'compose_down'):\n"
                          '            container_exists = False\n'
                          '            database_running = False\n'
                          "        elif event == 'compose_down_v':\n"
                          '            container_exists = False\n'
                          '            database_running = False\n'
                          '            volume_exists = False\n'
                          '            row_exists = False\n'
                          '    return {\n'
                          "        'volume_exists': volume_exists,\n"
                          "        'container_exists': container_exists,\n"
                          "        'database_running': database_running,\n"
                          "        'row_exists': row_exists,\n"
                          '    }\n'}],
    180: [{'title': 'Порядок db, migrations и API',
        'level': 'easy',
        'mode': 'solve',
        'prompt': "Верните allowed_step и stack_ready. Если db не started, allowed_step='start_db'. Если db started, "
                  "но не healthy, allowed_step='wait_db'. Если migration pending, allowed_step='run_migrations'. "
                  "Если migration failed, allowed_step='stop_deployment'. Если migration success и API не started, "
                  "allowed_step='start_api'. Иначе allowed_step='serve_traffic'. stack_ready=True только в последнем "
                  'случае.',
        'contract': {'given': 'Автопроверка вызывает solve(db_started, db_healthy, migration_status, api_started). '
                              'migration_status равен pending, success или failed.',
                     'todo': "Верните allowed_step и stack_ready. Если db не started, allowed_step='start_db'. Если "
                             "db started, но не healthy, allowed_step='wait_db'. Если migration pending, "
                             "allowed_step='run_migrations'. Если migration failed, allowed_step='stop_deployment'. "
                             "Если migration success и API не started, allowed_step='start_api'. Иначе "
                             "allowed_step='serve_traffic'. stack_ready=True только в последнем случае.",
                     'check': 'Проверяется каждый этап startup timeline. API нельзя считать готовым до успешных '
                              'migrations.'},
        'requirements': {'items': ['database сначала запускается',
                                   'healthcheck до migrations',
                                   'failed migration блокирует deploy',
                                   'traffic только после API'],
                         'names': ['db_started', 'db_healthy', 'migration_status', 'api_started', 'allowed_step'],
                         'nodes': ['FunctionDef', 'If']},
        'starter_code': 'def solve(db_started, db_healthy, migration_status, api_started):\n'
                        '    # Определите следующий допустимый шаг\n'
                        '    pass\n',
        'tests': [{'name': 'database не запущена',
                   'args': [False, False, 'pending', False],
                   'expected': {'allowed_step': 'start_db', 'stack_ready': False}},
                  {'name': 'ожидание healthcheck',
                   'args': [True, False, 'pending', False],
                   'expected': {'allowed_step': 'wait_db', 'stack_ready': False}},
                  {'name': 'нужны migrations',
                   'args': [True, True, 'pending', False],
                   'expected': {'allowed_step': 'run_migrations', 'stack_ready': False}},
                  {'name': 'migration failed',
                   'args': [True, True, 'failed', False],
                   'expected': {'allowed_step': 'stop_deployment', 'stack_ready': False}},
                  {'name': 'stack готов',
                   'args': [True, True, 'success', True],
                   'expected': {'allowed_step': 'serve_traffic', 'stack_ready': True}}],
        'reference_code': 'def solve(db_started, db_healthy, migration_status, api_started):\n'
                          '    if not db_started:\n'
                          "        allowed_step = 'start_db'\n"
                          '    elif not db_healthy:\n'
                          "        allowed_step = 'wait_db'\n"
                          "    elif migration_status == 'pending':\n"
                          "        allowed_step = 'run_migrations'\n"
                          "    elif migration_status == 'failed':\n"
                          "        allowed_step = 'stop_deployment'\n"
                          '    elif not api_started:\n'
                          "        allowed_step = 'start_api'\n"
                          '    else:\n'
                          "        allowed_step = 'serve_traffic'\n"
                          '    return {\n'
                          "        'allowed_step': allowed_step,\n"
                          "        'stack_ready': allowed_step == 'serve_traffic',\n"
                          '    }\n'}]
}

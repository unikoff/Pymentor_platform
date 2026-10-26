from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    123: [{'title': 'Маршрут подключения к PostgreSQL',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Соберите connection_url в формате postgresql+psycopg://role:password@host:port/database. Верните '
                  'также layers в точном порядке: client, driver, server, database, schema. Добавьте target со '
                  'значениями server=host:port, database, schema и role. Не включайте password в target.',
        'contract': {'given': 'Автопроверка вызывает solve(role, password, host, port, database, schema). Все '
                              'аргументы кроме port — строки, port — целое число.',
                     'todo': 'Соберите connection_url в формате '
                             'postgresql+psycopg://role:password@host:port/database. Верните также layers в точном '
                             'порядке: client, driver, server, database, schema. Добавьте target со значениями '
                             'server=host:port, database, schema и role. Не включайте password в target.',
                     'check': 'Проверяются разные host, port, database и role. Сравниваются URL, порядок layers и '
                              'безопасный target без password.'},
        'requirements': {'items': ['postgresql+psycopg URL',
                                   'явный host и port',
                                   'пять уровней подключения',
                                   'password отсутствует в target'],
                         'names': ['role',
                                   'password',
                                   'host',
                                   'port',
                                   'database',
                                   'schema',
                                   'connection_url',
                                   'layers',
                                   'target'],
                         'nodes': ['FunctionDef']},
        'starter_code': 'def solve(role, password, host, port, database, schema):\n'
                        '    # Соберите URL и карту уровней подключения\n'
                        '    pass\n',
        'tests': [{'name': 'локальная база',
                   'args': ['studyhub_app', 'secret', 'localhost', 5432, 'studyhub_dev', 'public'],
                   'expected': {'connection_url': 'postgresql+psycopg://studyhub_app:secret@localhost:5432/studyhub_dev',
                                'layers': ['client', 'driver', 'server', 'database', 'schema'],
                                'target': {'server': 'localhost:5432',
                                           'database': 'studyhub_dev',
                                           'schema': 'public',
                                           'role': 'studyhub_app'}}},
                  {'name': 'другой server',
                   'args': ['app_test', 'testpass', 'db.internal', 5544, 'studyhub_test', 'app'],
                   'expected': {'connection_url': 'postgresql+psycopg://app_test:testpass@db.internal:5544/studyhub_test',
                                'layers': ['client', 'driver', 'server', 'database', 'schema'],
                                'target': {'server': 'db.internal:5544',
                                           'database': 'studyhub_test',
                                           'schema': 'app',
                                           'role': 'app_test'}}}],
        'reference_code': 'def solve(role, password, host, port, database, schema):\n'
                          '    connection_url = (\n'
                          "        f'postgresql+psycopg://{role}:{password}'\n"
                          "        f'@{host}:{port}/{database}'\n"
                          '    )\n'
                          "    layers = ['client', 'driver', 'server', 'database', 'schema']\n"
                          '    target = {\n'
                          "        'server': f'{host}:{port}',\n"
                          "        'database': database,\n"
                          "        'schema': schema,\n"
                          "        'role': role,\n"
                          '    }\n'
                          '    return {\n'
                          "        'connection_url': connection_url,\n"
                          "        'layers': layers,\n"
                          "        'target': target,\n"
                          '    }\n'}]
}

from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    171: [{'title': 'Image, container и process',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Начальные значения image_exists=False, container_exists=False, process_running=False, '
                  'runtime_file=False. build_image создаёт image. create_container возможно только при image_exists. '
                  'start запускает process только внутри существующего container. write_file создаёт runtime_file '
                  'только при running process. stop останавливает process. remove_container удаляет container и '
                  'runtime_file, но image сохраняется. create_from_same_image создаёт новый container без '
                  'runtime_file, если image существует. Верните все четыре flags.',
        'contract': {'given': 'Автопроверка вызывает solve(events). events — список строк build_image, '
                              'create_container, start, write_file, stop, remove_container и create_from_same_image.',
                     'todo': 'Начальные значения image_exists=False, container_exists=False, process_running=False, '
                             'runtime_file=False. build_image создаёт image. create_container возможно только при '
                             'image_exists. start запускает process только внутри существующего container. '
                             'write_file создаёт runtime_file только при running process. stop останавливает '
                             'process. remove_container удаляет container и runtime_file, но image сохраняется. '
                             'create_from_same_image создаёт новый container без runtime_file, если image '
                             'существует. Верните все четыре flags.',
                     'check': 'Проверяется сборка без запуска, полный lifecycle и пересоздание из того же image. '
                              'Файл, созданный только внутри container, не должен пережить remove.'},
        'requirements': {'items': ['image живёт отдельно от container',
                                   'process запускается внутри container',
                                   'runtime file принадлежит container',
                                   'remove не удаляет image'],
                         'names': ['events', 'image_exists', 'container_exists', 'process_running', 'runtime_file'],
                         'nodes': ['FunctionDef', 'For', 'If']},
        'starter_code': 'def solve(events):\n'
                        '    image_exists = False\n'
                        '    container_exists = False\n'
                        '    process_running = False\n'
                        '    runtime_file = False\n'
                        '    # Выполните lifecycle Docker objects\n'
                        '    pass\n',
        'tests': [{'name': 'только image',
                   'args': [['build_image']],
                   'expected': {'image_exists': True,
                                'container_exists': False,
                                'process_running': False,
                                'runtime_file': False}},
                  {'name': 'container запущен',
                   'args': [['build_image', 'create_container', 'start', 'write_file']],
                   'expected': {'image_exists': True,
                                'container_exists': True,
                                'process_running': True,
                                'runtime_file': True}},
                  {'name': 'пересоздание теряет runtime file',
                   'args': [['build_image',
                             'create_container',
                             'start',
                             'write_file',
                             'stop',
                             'remove_container',
                             'create_from_same_image',
                             'start']],
                   'expected': {'image_exists': True,
                                'container_exists': True,
                                'process_running': True,
                                'runtime_file': False}}],
        'reference_code': 'def solve(events):\n'
                          '    image_exists = False\n'
                          '    container_exists = False\n'
                          '    process_running = False\n'
                          '    runtime_file = False\n'
                          '    for event in events:\n'
                          "        if event == 'build_image':\n"
                          '            image_exists = True\n'
                          "        elif event in ('create_container', 'create_from_same_image') and image_exists:\n"
                          '            container_exists = True\n'
                          '            process_running = False\n'
                          '            runtime_file = False\n'
                          "        elif event == 'start' and container_exists:\n"
                          '            process_running = True\n'
                          "        elif event == 'write_file' and process_running:\n"
                          '            runtime_file = True\n'
                          "        elif event == 'stop':\n"
                          '            process_running = False\n'
                          "        elif event == 'remove_container':\n"
                          '            container_exists = False\n'
                          '            process_running = False\n'
                          '            runtime_file = False\n'
                          '    return {\n'
                          "        'image_exists': image_exists,\n"
                          "        'container_exists': container_exists,\n"
                          "        'process_running': process_running,\n"
                          "        'runtime_file': runtime_file,\n"
                          '    }\n'}],
    173: [{'title': 'Инвалидация Docker layers',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Идите по layers сверху вниз. Первый layer, чей inputs пересекается с changed_inputs, становится '
                  'cache miss. Все последующие layers тоже miss, даже если их собственные inputs не менялись. '
                  'Предыдущие layers остаются hit. Верните список словарей name и cache.',
        'contract': {'given': 'Автопроверка вызывает solve(layers, changed_inputs). layers — список словарей name и '
                              'inputs. changed_inputs — список изменённых файлов или значений.',
                     'todo': 'Идите по layers сверху вниз. Первый layer, чей inputs пересекается с changed_inputs, '
                             'становится cache miss. Все последующие layers тоже miss, даже если их собственные '
                             'inputs не менялись. Предыдущие layers остаются hit. Верните список словарей name и '
                             'cache.',
                     'check': 'Проверяются изменение source, dependency-файла, отсутствие изменений и изменение '
                              'раннего base input. Порядок layers сохраняется.'},
        'requirements': {'items': ['первое изменение инвалидирует layer',
                                   'все следующие layers miss',
                                   'предыдущие layers hit',
                                   'порядок сохраняется'],
                         'names': ['layers', 'changed_inputs', 'changed', 'invalidated', 'result'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['set'],
                         'attributes': ['intersection', 'append']},
        'starter_code': 'def solve(layers, changed_inputs):\n'
                        '    # Определите cache hit и miss по порядку layers\n'
                        '    pass\n',
        'tests': [{'name': 'изменился source',
                   'args': [[{'name': 'base', 'inputs': ['python:3.12-slim']},
                             {'name': 'dependencies', 'inputs': ['requirements.txt']},
                             {'name': 'source', 'inputs': ['app/']},
                             {'name': 'user', 'inputs': ['Dockerfile:USER']}],
                            ['app/']],
                   'expected': [{'name': 'base', 'cache': 'hit'},
                                {'name': 'dependencies', 'cache': 'hit'},
                                {'name': 'source', 'cache': 'miss'},
                                {'name': 'user', 'cache': 'miss'}]},
                  {'name': 'изменились dependencies',
                   'args': [[{'name': 'base', 'inputs': ['python:3.12-slim']},
                             {'name': 'dependencies', 'inputs': ['requirements.txt']},
                             {'name': 'source', 'inputs': ['app/']}],
                            ['requirements.txt']],
                   'expected': [{'name': 'base', 'cache': 'hit'},
                                {'name': 'dependencies', 'cache': 'miss'},
                                {'name': 'source', 'cache': 'miss'}]},
                  {'name': 'ничего не изменилось',
                   'args': [[{'name': 'base', 'inputs': ['python:3.12-slim']},
                             {'name': 'source', 'inputs': ['app/']}],
                            []],
                   'expected': [{'name': 'base', 'cache': 'hit'}, {'name': 'source', 'cache': 'hit'}]}],
        'reference_code': 'def solve(layers, changed_inputs):\n'
                          '    changed = set(changed_inputs)\n'
                          '    invalidated = False\n'
                          '    result = []\n'
                          '    for layer in layers:\n'
                          "        if not invalidated and changed.intersection(layer['inputs']):\n"
                          '            invalidated = True\n'
                          '        result.append({\n'
                          "            'name': layer['name'],\n"
                          "            'cache': 'miss' if invalidated else 'hit',\n"
                          '        })\n'
                          '    return result\n'}]
}

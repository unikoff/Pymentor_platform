from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    117: [{'title': 'Сопоставление ORM-полей и колонок',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Сравните поля по имени. Верните словарь matched и differences. В matched добавляйте имена, для '
                  'которых type и nullable совпадают. В differences добавляйте словари field и problem. problem '
                  'равен missing_column, если колонки нет; type_mismatch, если отличается type; nullable_mismatch, '
                  'если отличается nullable. Сохраняйте порядок model_fields.',
        'contract': {'given': 'Автопроверка вызывает solve(model_fields, table_columns). Оба аргумента — списки '
                              'словарей с ключами name, type и nullable. model_fields описывает ORM-модель, '
                              'table_columns — фактическую таблицу.',
                     'todo': 'Сравните поля по имени. Верните словарь matched и differences. В matched добавляйте '
                             'имена, для которых type и nullable совпадают. В differences добавляйте словари field и '
                             'problem. problem равен missing_column, если колонки нет; type_mismatch, если '
                             'отличается type; nullable_mismatch, если отличается nullable. Сохраняйте порядок '
                             'model_fields.',
                     'check': 'Платформа проверит полное совпадение, отсутствующую колонку и два вида несовпадений. '
                              'Сравниваются порядок matched и точные словари differences.'},
        'requirements': {'items': ['индекс колонок по name',
                                   'проверка missing_column',
                                   'проверка type_mismatch',
                                   'проверка nullable_mismatch'],
                         'names': ['model_fields', 'table_columns', 'matched', 'differences'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['get', 'append']},
        'starter_code': 'def solve(model_fields, table_columns):\n'
                        '    matched = []\n'
                        '    differences = []\n'
                        '    # Сопоставьте ORM-поля и колонки\n'
                        '    pass\n',
        'tests': [{'name': 'полное совпадение',
                   'args': [[{'name': 'id', 'type': 'INTEGER', 'nullable': False},
                             {'name': 'title', 'type': 'VARCHAR', 'nullable': False}],
                            [{'name': 'id', 'type': 'INTEGER', 'nullable': False},
                             {'name': 'title', 'type': 'VARCHAR', 'nullable': False}]],
                   'expected': {'matched': ['id', 'title'], 'differences': []}},
                  {'name': 'отсутствующая колонка',
                   'args': [[{'name': 'id', 'type': 'INTEGER', 'nullable': False},
                             {'name': 'priority', 'type': 'INTEGER', 'nullable': False}],
                            [{'name': 'id', 'type': 'INTEGER', 'nullable': False}]],
                   'expected': {'matched': ['id'],
                                'differences': [{'field': 'priority', 'problem': 'missing_column'}]}},
                  {'name': 'тип и nullable отличаются',
                   'args': [[{'name': 'id', 'type': 'INTEGER', 'nullable': False},
                             {'name': 'title', 'type': 'VARCHAR', 'nullable': False},
                             {'name': 'description', 'type': 'VARCHAR', 'nullable': True}],
                            [{'name': 'id', 'type': 'BIGINT', 'nullable': False},
                             {'name': 'title', 'type': 'VARCHAR', 'nullable': True},
                             {'name': 'description', 'type': 'VARCHAR', 'nullable': True}]],
                   'expected': {'matched': ['description'],
                                'differences': [{'field': 'id', 'problem': 'type_mismatch'},
                                                {'field': 'title', 'problem': 'nullable_mismatch'}]}}],
        'reference_code': 'def solve(model_fields, table_columns):\n'
                          '    matched = []\n'
                          '    differences = []\n'
                          '    columns_by_name = {}\n'
                          '    for column in table_columns:\n'
                          "        columns_by_name[column['name']] = column\n"
                          '    for field in model_fields:\n'
                          "        column = columns_by_name.get(field['name'])\n"
                          '        if column is None:\n'
                          '            differences.append({\n'
                          "                'field': field['name'],\n"
                          "                'problem': 'missing_column',\n"
                          '            })\n'
                          "        elif column['type'] != field['type']:\n"
                          '            differences.append({\n'
                          "                'field': field['name'],\n"
                          "                'problem': 'type_mismatch',\n"
                          '            })\n'
                          "        elif column['nullable'] != field['nullable']:\n"
                          '            differences.append({\n'
                          "                'field': field['name'],\n"
                          "                'problem': 'nullable_mismatch',\n"
                          '            })\n'
                          '        else:\n'
                          "            matched.append(field['name'])\n"
                          "    return {'matched': matched, 'differences': differences}\n"}],
    119: [{'title': 'INSERT отдельно от значений',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните словарь statement и params. statement должен быть постоянной строкой INSERT INTO tasks '
                  '(title, priority, is_done) VALUES (:title, :priority, :is_done) RETURNING id. params должен '
                  'содержать переданные значения по ключам title, priority и is_done. Не вставляйте пользовательский '
                  'title внутрь SQL-строки.',
        'contract': {'given': 'Автопроверка вызывает solve(title, priority, is_done). title — пользовательская '
                              'строка, priority — целое число, is_done — bool.',
                     'todo': 'Верните словарь statement и params. statement должен быть постоянной строкой INSERT '
                             'INTO tasks (title, priority, is_done) VALUES (:title, :priority, :is_done) RETURNING '
                             'id. params должен содержать переданные значения по ключам title, priority и is_done. '
                             'Не вставляйте пользовательский title внутрь SQL-строки.',
                     'check': 'Платформа вызовет solve с обычным текстом, кавычкой и фрагментом, похожим на SQL '
                              'injection. Во всех случаях statement должен остаться одинаковым, а пользовательские '
                              'значения должны находиться только в params.'},
        'requirements': {'items': ['постоянный SQL statement',
                                   'именованные placeholders',
                                   'отдельный params',
                                   'пользовательский title не склеивается с SQL'],
                         'names': ['title', 'priority', 'is_done', 'statement', 'params'],
                         'nodes': ['FunctionDef']},
        'starter_code': 'def solve(title, priority, is_done):\n'
                        '    # Верните parameterized statement и params\n'
                        '    pass\n',
        'tests': [{'name': 'обычная задача',
                   'args': ['Изучить SQL', 3, False],
                   'expected': {'statement': 'INSERT INTO tasks (title, priority, is_done) VALUES (:title, '
                                             ':priority, :is_done) RETURNING id',
                                'params': {'title': 'Изучить SQL', 'priority': 3, 'is_done': False}}},
                  {'name': 'кавычка в заголовке',
                   'args': ["Авторская задача O'Reilly", 2, False],
                   'expected': {'statement': 'INSERT INTO tasks (title, priority, is_done) VALUES (:title, '
                                             ':priority, :is_done) RETURNING id',
                                'params': {'title': "Авторская задача O'Reilly", 'priority': 2, 'is_done': False}}},
                  {'name': 'опасный текст остаётся значением',
                   'args': ["x'); DELETE FROM tasks; --", 5, True],
                   'expected': {'statement': 'INSERT INTO tasks (title, priority, is_done) VALUES (:title, '
                                             ':priority, :is_done) RETURNING id',
                                'params': {'title': "x'); DELETE FROM tasks; --", 'priority': 5, 'is_done': True}}}],
        'reference_code': 'def solve(title, priority, is_done):\n'
                          '    statement = (\n'
                          "        'INSERT INTO tasks (title, priority, is_done) '\n"
                          "        'VALUES (:title, :priority, :is_done) RETURNING id'\n"
                          '    )\n'
                          '    params = {\n'
                          "        'title': title,\n"
                          "        'priority': priority,\n"
                          "        'is_done': is_done,\n"
                          '    }\n'
                          "    return {'statement': statement, 'params': params}\n"}],
    120: [{'title': 'SELECT из последовательных частей',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Начните со строки SELECT id, title, priority, is_done FROM tasks. Если is_done не None, добавьте '
                  'условие is_done = :is_done. Если min_priority не None, добавьте priority >= :min_priority. Если '
                  'условий два, соедините их через AND. Добавьте ORDER BY priority DESC, id ASC при descending=True, '
                  'иначе ORDER BY priority ASC, id ASC. В конце добавьте LIMIT :limit OFFSET :offset. Верните '
                  'statement и params только с реально используемыми filters, а также limit и offset.',
        'contract': {'given': 'Автопроверка вызывает solve(is_done, min_priority, descending, limit, offset). '
                              'is_done равен True, False или None. min_priority равен целому числу или None. '
                              'descending — bool, limit и offset — целые числа.',
                     'todo': 'Начните со строки SELECT id, title, priority, is_done FROM tasks. Если is_done не '
                             'None, добавьте условие is_done = :is_done. Если min_priority не None, добавьте '
                             'priority >= :min_priority. Если условий два, соедините их через AND. Добавьте ORDER BY '
                             'priority DESC, id ASC при descending=True, иначе ORDER BY priority ASC, id ASC. В '
                             'конце добавьте LIMIT :limit OFFSET :offset. Верните statement и params только с '
                             'реально используемыми filters, а также limit и offset.',
                     'check': 'Проверяется запрос без filters, с одним и с двумя filters. Сравниваются точная '
                              'SQL-строка и params. Порядок частей должен быть FROM → WHERE → ORDER BY → LIMIT → '
                              'OFFSET.'},
        'requirements': {'items': ['динамический список conditions',
                                   'AND только между существующими filters',
                                   'стабильный tie-breaker id ASC',
                                   'limit и offset в params'],
                         'names': ['is_done',
                                   'min_priority',
                                   'descending',
                                   'limit',
                                   'offset',
                                   'conditions',
                                   'params',
                                   'statement'],
                         'nodes': ['FunctionDef', 'If'],
                         'attributes': ['append', 'join']},
        'starter_code': 'def solve(is_done, min_priority, descending, limit, offset):\n'
                        '    conditions = []\n'
                        '    params = {}\n'
                        '    # Соберите SELECT по этапам\n'
                        '    pass\n',
        'tests': [{'name': 'без filters',
                   'args': [None, None, False, 20, 0],
                   'expected': {'statement': 'SELECT id, title, priority, is_done FROM tasks ORDER BY priority ASC, '
                                             'id ASC LIMIT :limit OFFSET :offset',
                                'params': {'limit': 20, 'offset': 0}}},
                  {'name': 'один filter',
                   'args': [False, None, True, 10, 20],
                   'expected': {'statement': 'SELECT id, title, priority, is_done FROM tasks WHERE is_done = '
                                             ':is_done ORDER BY priority DESC, id ASC LIMIT :limit OFFSET :offset',
                                'params': {'is_done': False, 'limit': 10, 'offset': 20}}},
                  {'name': 'два filters',
                   'args': [True, 3, False, 5, 0],
                   'expected': {'statement': 'SELECT id, title, priority, is_done FROM tasks WHERE is_done = '
                                             ':is_done AND priority >= :min_priority ORDER BY priority ASC, id ASC '
                                             'LIMIT :limit OFFSET :offset',
                                'params': {'is_done': True, 'min_priority': 3, 'limit': 5, 'offset': 0}}}],
        'reference_code': 'def solve(is_done, min_priority, descending, limit, offset):\n'
                          '    conditions = []\n'
                          '    params = {}\n'
                          '    if is_done is not None:\n'
                          "        conditions.append('is_done = :is_done')\n"
                          "        params['is_done'] = is_done\n"
                          '    if min_priority is not None:\n'
                          "        conditions.append('priority >= :min_priority')\n"
                          "        params['min_priority'] = min_priority\n"
                          "    statement = 'SELECT id, title, priority, is_done FROM tasks'\n"
                          '    if conditions:\n'
                          "        statement += ' WHERE ' + ' AND '.join(conditions)\n"
                          '    if descending:\n'
                          "        statement += ' ORDER BY priority DESC, id ASC'\n"
                          '    else:\n'
                          "        statement += ' ORDER BY priority ASC, id ASC'\n"
                          "    statement += ' LIMIT :limit OFFSET :offset'\n"
                          "    params['limit'] = limit\n"
                          "    params['offset'] = offset\n"
                          "    return {'statement': statement, 'params': params}\n"}],
    121: [{'title': 'Защита UPDATE и DELETE',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Если has_where равно False или task_id равно None, верните decision blocked, status 400 и '
                  'statement None. Если matched_count равно 0, верните decision not_found, status 404 и statement '
                  'None. Если matched_count больше 1, верните decision suspicious, status 409 и statement None. Для '
                  'безопасного update верните status 200 и statement UPDATE tasks SET is_done = :is_done WHERE id = '
                  ':task_id RETURNING id. Для безопасного delete верните status 204 и statement DELETE FROM tasks '
                  'WHERE id = :task_id RETURNING id. В успешном результате добавьте params с task_id.',
        'contract': {'given': 'Автопроверка вызывает solve(operation, task_id, has_where, matched_count). operation '
                              'равен update или delete. task_id — целое число или None. has_where — bool, '
                              'matched_count — число строк, которые затронула бы операция.',
                     'todo': 'Если has_where равно False или task_id равно None, верните decision blocked, status '
                             '400 и statement None. Если matched_count равно 0, верните decision not_found, status '
                             '404 и statement None. Если matched_count больше 1, верните decision suspicious, status '
                             '409 и statement None. Для безопасного update верните status 200 и statement UPDATE '
                             'tasks SET is_done = :is_done WHERE id = :task_id RETURNING id. Для безопасного delete '
                             'верните status 204 и statement DELETE FROM tasks WHERE id = :task_id RETURNING id. В '
                             'успешном результате добавьте params с task_id.',
                     'check': 'Проверяется запрос без WHERE, отсутствующий id, 0/1/несколько совпадений и обе '
                              'операции. Любая неоднозначная mutation должна блокироваться до выполнения.'},
        'requirements': {'items': ['блокировка без WHERE',
                                   'различие 0/1/много строк',
                                   'parameterized UPDATE',
                                   'parameterized DELETE'],
                         'names': ['operation', 'task_id', 'has_where', 'matched_count'],
                         'nodes': ['FunctionDef', 'If']},
        'starter_code': 'def solve(operation, task_id, has_where, matched_count):\n'
                        '    # Проверьте безопасность mutation\n'
                        '    pass\n',
        'tests': [{'name': 'нет WHERE',
                   'args': ['delete', 7, False, 20],
                   'expected': {'decision': 'blocked', 'status': 400, 'statement': None}},
                  {'name': 'строка не найдена',
                   'args': ['update', 99, True, 0],
                   'expected': {'decision': 'not_found', 'status': 404, 'statement': None}},
                  {'name': 'слишком много строк',
                   'args': ['delete', 7, True, 3],
                   'expected': {'decision': 'suspicious', 'status': 409, 'statement': None}},
                  {'name': 'безопасный UPDATE',
                   'args': ['update', 7, True, 1],
                   'expected': {'decision': 'allowed',
                                'status': 200,
                                'statement': 'UPDATE tasks SET is_done = :is_done WHERE id = :task_id RETURNING id',
                                'params': {'task_id': 7}}},
                  {'name': 'безопасный DELETE',
                   'args': ['delete', 5, True, 1],
                   'expected': {'decision': 'allowed',
                                'status': 204,
                                'statement': 'DELETE FROM tasks WHERE id = :task_id RETURNING id',
                                'params': {'task_id': 5}}}],
        'reference_code': 'def solve(operation, task_id, has_where, matched_count):\n'
                          '    if not has_where or task_id is None:\n'
                          '        return {\n'
                          "            'decision': 'blocked',\n"
                          "            'status': 400,\n"
                          "            'statement': None,\n"
                          '        }\n'
                          '    if matched_count == 0:\n'
                          '        return {\n'
                          "            'decision': 'not_found',\n"
                          "            'status': 404,\n"
                          "            'statement': None,\n"
                          '        }\n'
                          '    if matched_count > 1:\n'
                          '        return {\n'
                          "            'decision': 'suspicious',\n"
                          "            'status': 409,\n"
                          "            'statement': None,\n"
                          '        }\n'
                          "    if operation == 'update':\n"
                          '        return {\n'
                          "            'decision': 'allowed',\n"
                          "            'status': 200,\n"
                          "            'statement': (\n"
                          "                'UPDATE tasks SET is_done = :is_done '\n"
                          "                'WHERE id = :task_id RETURNING id'\n"
                          '            ),\n'
                          "            'params': {'task_id': task_id},\n"
                          '        }\n'
                          '    return {\n'
                          "        'decision': 'allowed',\n"
                          "        'status': 204,\n"
                          "        'statement': 'DELETE FROM tasks WHERE id = :task_id RETURNING id',\n"
                          "        'params': {'task_id': task_id},\n"
                          '    }\n'}]
}

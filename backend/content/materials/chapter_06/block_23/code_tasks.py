from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    129: [{'title': 'INNER JOIN трёх наборов',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Соберите результат INNER JOIN. Включайте только task, для которой найдены и user, и category. '
                  'Каждая строка результата содержит task_id, title, username и category_name. Сохраняйте порядок '
                  'tasks.',
        'contract': {'given': 'Автопроверка вызывает solve(tasks, users, categories). tasks содержит id, title, '
                              'user_id и category_id. users содержит id и username. categories содержит id и name.',
                     'todo': 'Соберите результат INNER JOIN. Включайте только task, для которой найдены и user, и '
                             'category. Каждая строка результата содержит task_id, title, username и category_name. '
                             'Сохраняйте порядок tasks.',
                     'check': 'Проверяются полные связи, отсутствующий user и отсутствующая category. Строка с любой '
                              'отсутствующей правой связью не должна попасть в INNER JOIN result.'},
        'requirements': {'items': ['индексы users и categories по id',
                                   'две foreign-key проверки',
                                   'строка только при обеих найденных связях',
                                   'порядок tasks'],
                         'names': ['tasks', 'users', 'categories', 'rows'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['get', 'append']},
        'starter_code': 'def solve(tasks, users, categories):\n'
                        '    rows = []\n'
                        '    # Соедините три набора по foreign keys\n'
                        '    pass\n',
        'tests': [{'name': 'все связи найдены',
                   'args': [[{'id': 1, 'title': 'SQL', 'user_id': 7, 'category_id': 10},
                             {'id': 2, 'title': 'JOIN', 'user_id': 8, 'category_id': 11}],
                            [{'id': 7, 'username': 'alice'}, {'id': 8, 'username': 'bob'}],
                            [{'id': 10, 'name': 'database'}, {'id': 11, 'name': 'backend'}]],
                   'expected': [{'task_id': 1, 'title': 'SQL', 'username': 'alice', 'category_name': 'database'},
                                {'task_id': 2, 'title': 'JOIN', 'username': 'bob', 'category_name': 'backend'}]},
                  {'name': 'часть связей отсутствует',
                   'args': [[{'id': 1, 'title': 'SQL', 'user_id': 7, 'category_id': 10},
                             {'id': 2, 'title': 'No user', 'user_id': 99, 'category_id': 10},
                             {'id': 3, 'title': 'No category', 'user_id': 7, 'category_id': 77}],
                            [{'id': 7, 'username': 'alice'}],
                            [{'id': 10, 'name': 'database'}]],
                   'expected': [{'task_id': 1, 'title': 'SQL', 'username': 'alice', 'category_name': 'database'}]}],
        'reference_code': 'def solve(tasks, users, categories):\n'
                          '    users_by_id = {}\n'
                          '    for user in users:\n'
                          "        users_by_id[user['id']] = user\n"
                          '    categories_by_id = {}\n'
                          '    for category in categories:\n'
                          "        categories_by_id[category['id']] = category\n"
                          '    rows = []\n'
                          '    for task in tasks:\n'
                          "        user = users_by_id.get(task['user_id'])\n"
                          "        category = categories_by_id.get(task['category_id'])\n"
                          '        if user is not None and category is not None:\n'
                          '            rows.append({\n'
                          "                'task_id': task['id'],\n"
                          "                'title': task['title'],\n"
                          "                'username': user['username'],\n"
                          "                'category_name': category['name'],\n"
                          '            })\n'
                          '    return rows\n'}],
    130: [{'title': 'LEFT JOIN и отсутствующие связи',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Для каждой task верните строку task_id, title и category_name. Если category не найдена или '
                  'category_id равен None, category_name должен быть None. Также верните users_without_tasks — id '
                  'пользователей, на которых не ссылается ни одна task. Сохраняйте порядок tasks и users.',
        'contract': {'given': 'Автопроверка вызывает solve(tasks, users, categories). category_id у task может быть '
                              'None. Нужно сохранить все tasks и отдельно найти users без задач.',
                     'todo': 'Для каждой task верните строку task_id, title и category_name. Если category не '
                             'найдена или category_id равен None, category_name должен быть None. Также верните '
                             'users_without_tasks — id пользователей, на которых не ссылается ни одна task. '
                             'Сохраняйте порядок tasks и users.',
                     'check': 'Проверяются task без category, неизвестная category и user без tasks. В отличие от '
                              'INNER JOIN ни одна task не должна исчезнуть.'},
        'requirements': {'items': ['все tasks остаются в result',
                                   'None для отсутствующей category',
                                   'множество used_user_ids',
                                   'users_without_tasks в исходном порядке'],
                         'names': ['tasks', 'users', 'categories', 'task_rows', 'users_without_tasks'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['set'],
                         'attributes': ['get', 'add', 'append']},
        'starter_code': 'def solve(tasks, users, categories):\n'
                        '    task_rows = []\n'
                        '    users_without_tasks = []\n'
                        '    # Смоделируйте два LEFT JOIN сценария\n'
                        '    pass\n',
        'tests': [{'name': 'nullable category и user без задач',
                   'args': [[{'id': 1, 'title': 'SQL', 'user_id': 7, 'category_id': 10},
                             {'id': 2, 'title': 'Без категории', 'user_id': 7, 'category_id': None}],
                            [{'id': 7, 'username': 'alice'}, {'id': 8, 'username': 'bob'}],
                            [{'id': 10, 'name': 'database'}]],
                   'expected': {'task_rows': [{'task_id': 1, 'title': 'SQL', 'category_name': 'database'},
                                              {'task_id': 2, 'title': 'Без категории', 'category_name': None}],
                                'users_without_tasks': [8]}},
                  {'name': 'неизвестная category',
                   'args': [[{'id': 3, 'title': 'Broken link', 'user_id': 9, 'category_id': 99}],
                            [{'id': 9, 'username': 'carol'}],
                            []],
                   'expected': {'task_rows': [{'task_id': 3, 'title': 'Broken link', 'category_name': None}],
                                'users_without_tasks': []}}],
        'reference_code': 'def solve(tasks, users, categories):\n'
                          '    categories_by_id = {}\n'
                          '    for category in categories:\n'
                          "        categories_by_id[category['id']] = category\n"
                          '    task_rows = []\n'
                          '    used_user_ids = set()\n'
                          '    for task in tasks:\n'
                          "        used_user_ids.add(task['user_id'])\n"
                          "        category = categories_by_id.get(task['category_id'])\n"
                          '        category_name = None\n'
                          '        if category is not None:\n'
                          "            category_name = category['name']\n"
                          '        task_rows.append({\n'
                          "            'task_id': task['id'],\n"
                          "            'title': task['title'],\n"
                          "            'category_name': category_name,\n"
                          '        })\n'
                          '    users_without_tasks = []\n'
                          '    for user in users:\n'
                          "        if user['id'] not in used_user_ids:\n"
                          "            users_without_tasks.append(user['id'])\n"
                          '    return {\n'
                          "        'task_rows': task_rows,\n"
                          "        'users_without_tasks': users_without_tasks,\n"
                          '    }\n'}],
    132: [{'title': 'GROUP BY и агрегаты StudyHub',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Верните by_user и avg_priority_by_category. by_user — список по возрастанию user_id со значениями '
                  'user_id, total и done. avg_priority_by_category — список по возрастанию category_id со значениями '
                  'category_id и average, округлённым round(..., 2). Каждая task участвует ровно в одной группе '
                  'пользователя и одной группе категории.',
        'contract': {'given': 'Автопроверка вызывает solve(tasks). Каждая task содержит user_id, category_id, '
                              'priority и is_done. Списки могут быть пустыми.',
                     'todo': 'Верните by_user и avg_priority_by_category. by_user — список по возрастанию user_id со '
                             'значениями user_id, total и done. avg_priority_by_category — список по возрастанию '
                             'category_id со значениями category_id и average, округлённым round(..., 2). Каждая '
                             'task участвует ровно в одной группе пользователя и одной группе категории.',
                     'check': 'Проверяются несколько групп, одна группа и пустой список. Сравниваются counts, '
                              'averages и стабильный порядок групп.'},
        'requirements': {'items': ['группировка по user_id',
                                   'COUNT total и done',
                                   'группировка по category_id',
                                   'AVG priority'],
                         'names': ['tasks', 'users', 'categories', 'by_user', 'avg_priority_by_category'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['sorted', 'round'],
                         'attributes': ['append']},
        'starter_code': 'def solve(tasks):\n    # Соберите две группировки\n    pass\n',
        'tests': [{'name': 'несколько групп',
                   'args': [[{'user_id': 7, 'category_id': 10, 'priority': 2, 'is_done': True},
                             {'user_id': 7, 'category_id': 10, 'priority': 4, 'is_done': False},
                             {'user_id': 8, 'category_id': 11, 'priority': 5, 'is_done': True}]],
                   'expected': {'by_user': [{'user_id': 7, 'total': 2, 'done': 1},
                                            {'user_id': 8, 'total': 1, 'done': 1}],
                                'avg_priority_by_category': [{'category_id': 10, 'average': 3.0},
                                                             {'category_id': 11, 'average': 5.0}]}},
                  {'name': 'пустой список',
                   'args': [[]],
                   'expected': {'by_user': [], 'avg_priority_by_category': []}}],
        'reference_code': 'def solve(tasks):\n'
                          '    users = {}\n'
                          '    categories = {}\n'
                          '    for task in tasks:\n'
                          "        user_id = task['user_id']\n"
                          '        if user_id not in users:\n'
                          "            users[user_id] = {'total': 0, 'done': 0}\n"
                          "        users[user_id]['total'] += 1\n"
                          "        if task['is_done']:\n"
                          "            users[user_id]['done'] += 1\n"
                          "        category_id = task['category_id']\n"
                          '        if category_id not in categories:\n'
                          "            categories[category_id] = {'sum': 0, 'count': 0}\n"
                          "        categories[category_id]['sum'] += task['priority']\n"
                          "        categories[category_id]['count'] += 1\n"
                          '    by_user = []\n'
                          '    for user_id in sorted(users):\n'
                          '        by_user.append({\n'
                          "            'user_id': user_id,\n"
                          "            'total': users[user_id]['total'],\n"
                          "            'done': users[user_id]['done'],\n"
                          '        })\n'
                          '    avg_priority_by_category = []\n'
                          '    for category_id in sorted(categories):\n'
                          '        values = categories[category_id]\n'
                          "        average = round(values['sum'] / values['count'], 2)\n"
                          '        avg_priority_by_category.append({\n'
                          "            'category_id': category_id,\n"
                          "            'average': average,\n"
                          '        })\n'
                          '    return {\n'
                          "        'by_user': by_user,\n"
                          "        'avg_priority_by_category': avg_priority_by_category,\n"
                          '    }\n'}],
    133: [{'title': 'WHERE, HAVING и EXISTS',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Верните три результата. users_with_min_tasks — id пользователей, у которых COUNT(tasks) не меньше '
                  'min_tasks; это модель HAVING после GROUP BY. categories_without_active — id категорий, для '
                  'которых не существует task с is_done=False; это модель NOT EXISTS. email_exists — True, если '
                  'существует user с email без учёта регистра. Сохраняйте порядок users и categories.',
        'contract': {'given': 'Автопроверка вызывает solve(users, tasks, categories, min_tasks, email). users '
                              'содержит id и email. tasks содержит user_id, category_id и is_done. categories '
                              'содержит id.',
                     'todo': 'Верните три результата. users_with_min_tasks — id пользователей, у которых '
                             'COUNT(tasks) не меньше min_tasks; это модель HAVING после GROUP BY. '
                             'categories_without_active — id категорий, для которых не существует task с '
                             'is_done=False; это модель NOT EXISTS. email_exists — True, если существует user с '
                             'email без учёта регистра. Сохраняйте порядок users и categories.',
                     'check': 'Проверяются группы выше и ниже порога, пустая category, category только с '
                              'завершёнными tasks и поиск email в другом регистре.'},
        'requirements': {'items': ['COUNT по user_id',
                                   'фильтр групп по min_tasks',
                                   'NOT EXISTS активной task',
                                   'EXISTS email без учёта регистра'],
                         'names': ['users', 'tasks', 'categories', 'min_tasks', 'email'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['get', 'append', 'lower']},
        'starter_code': 'def solve(users, tasks, categories, min_tasks, email):\n'
                        '    # Реализуйте HAVING и два EXISTS-подобных вопроса\n'
                        '    pass\n',
        'tests': [{'name': 'полный сценарий',
                   'args': [[{'id': 7, 'email': 'alice@example.com'},
                             {'id': 8, 'email': 'bob@example.com'},
                             {'id': 9, 'email': 'carol@example.com'}],
                            [{'user_id': 7, 'category_id': 10, 'is_done': False},
                             {'user_id': 7, 'category_id': 10, 'is_done': True},
                             {'user_id': 7, 'category_id': 11, 'is_done': True},
                             {'user_id': 8, 'category_id': 11, 'is_done': True}],
                            [{'id': 10}, {'id': 11}, {'id': 12}],
                            2,
                            'ALICE@EXAMPLE.COM'],
                   'expected': {'users_with_min_tasks': [7],
                                'categories_without_active': [11, 12],
                                'email_exists': True}},
                  {'name': 'ничего не найдено',
                   'args': [[{'id': 1, 'email': 'one@example.com'}], [], [{'id': 5}], 1, 'missing@example.com'],
                   'expected': {'users_with_min_tasks': [],
                                'categories_without_active': [5],
                                'email_exists': False}}],
        'reference_code': 'def solve(users, tasks, categories, min_tasks, email):\n'
                          '    counts = {}\n'
                          '    for task in tasks:\n'
                          "        user_id = task['user_id']\n"
                          '        counts[user_id] = counts.get(user_id, 0) + 1\n'
                          '    users_with_min_tasks = []\n'
                          '    for user in users:\n'
                          "        if counts.get(user['id'], 0) >= min_tasks:\n"
                          "            users_with_min_tasks.append(user['id'])\n"
                          '    categories_without_active = []\n'
                          '    for category in categories:\n'
                          '        active_exists = False\n'
                          '        for task in tasks:\n'
                          "            same_category = task['category_id'] == category['id']\n"
                          "            if same_category and not task['is_done']:\n"
                          '                active_exists = True\n'
                          '                break\n'
                          '        if not active_exists:\n'
                          "            categories_without_active.append(category['id'])\n"
                          '    normalized_email = email.lower()\n'
                          '    email_exists = False\n'
                          '    for user in users:\n'
                          "        if user['email'].lower() == normalized_email:\n"
                          '            email_exists = True\n'
                          '            break\n'
                          '    return {\n'
                          "        'users_with_min_tasks': users_with_min_tasks,\n"
                          "        'categories_without_active': categories_without_active,\n"
                          "        'email_exists': email_exists,\n"
                          '    }\n'}],
    134: [{'title': 'Атомарное завершение задачи',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Смоделируйте одну transaction: изменить task is_done на True и добавить progress event с task_id '
                  "и event='completed'. Если fail_event_insert равно True, верните исходные task и progress_events "
                  'без частичного изменения, status rolled_back и committed False. Иначе верните оба изменения, '
                  'status committed и committed True. Не изменяйте входные объекты напрямую: сначала создайте '
                  'copies.',
        'contract': {'given': 'Автопроверка вызывает solve(task, progress_events, fail_event_insert). task — словарь '
                              'id и is_done. progress_events — список словарей. fail_event_insert моделирует ошибку '
                              'второго SQL statement.',
                     'todo': 'Смоделируйте одну transaction: изменить task is_done на True и добавить progress event '
                             "с task_id и event='completed'. Если fail_event_insert равно True, верните исходные "
                             'task и progress_events без частичного изменения, status rolled_back и committed False. '
                             'Иначе верните оба изменения, status committed и committed True. Не изменяйте входные '
                             'объекты напрямую: сначала создайте copies.',
                     'check': 'Платформа проверит успешный commit и ошибку второго шага. При rollback task должна '
                              'остаться незавершённой, а event не должен появиться.'},
        'requirements': {'items': ['copies входных данных',
                                   'два связанных изменения',
                                   'полный rollback при ошибке',
                                   'commit только после обоих шагов'],
                         'names': ['task', 'progress_events', 'fail_event_insert'],
                         'nodes': ['FunctionDef', 'If'],
                         'calls': ['dict', 'list'],
                         'attributes': ['append']},
        'starter_code': 'def solve(task, progress_events, fail_event_insert):\n'
                        '    # Выполните оба изменения атомарно\n'
                        '    pass\n',
        'tests': [{'name': 'успешная transaction',
                   'args': [{'id': 5, 'is_done': False}, [], False],
                   'expected': {'status': 'committed',
                                'committed': True,
                                'task': {'id': 5, 'is_done': True},
                                'progress_events': [{'task_id': 5, 'event': 'completed'}]}},
                  {'name': 'ошибка второго шага',
                   'args': [{'id': 5, 'is_done': False}, [], True],
                   'expected': {'status': 'rolled_back',
                                'committed': False,
                                'task': {'id': 5, 'is_done': False},
                                'progress_events': []}},
                  {'name': 'сохраняются прежние events',
                   'args': [{'id': 8, 'is_done': False}, [{'task_id': 3, 'event': 'completed'}], False],
                   'expected': {'status': 'committed',
                                'committed': True,
                                'task': {'id': 8, 'is_done': True},
                                'progress_events': [{'task_id': 3, 'event': 'completed'},
                                                    {'task_id': 8, 'event': 'completed'}]}}],
        'reference_code': 'def solve(task, progress_events, fail_event_insert):\n'
                          '    original_task = dict(task)\n'
                          '    original_events = list(progress_events)\n'
                          '    working_task = dict(task)\n'
                          '    working_events = list(progress_events)\n'
                          "    working_task['is_done'] = True\n"
                          '    if fail_event_insert:\n'
                          '        return {\n'
                          "            'status': 'rolled_back',\n"
                          "            'committed': False,\n"
                          "            'task': original_task,\n"
                          "            'progress_events': original_events,\n"
                          '        }\n'
                          '    working_events.append({\n'
                          "        'task_id': working_task['id'],\n"
                          "        'event': 'completed',\n"
                          '    })\n'
                          '    return {\n'
                          "        'status': 'committed',\n"
                          "        'committed': True,\n"
                          "        'task': working_task,\n"
                          "        'progress_events': working_events,\n"
                          '    }\n'}]
}

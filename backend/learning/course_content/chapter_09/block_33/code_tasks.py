from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    189: [{'title': 'Отберите требования финального MVP',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Разделите требования на mvp и out_of_scope. В mvp добавляйте name только когда '
                  'supports_core_flow=True и external_scope=False. Остальные требования добавляйте в out_of_scope '
                  'как словари name и reason. reason равен external_dependency, если external_scope=True, иначе '
                  'not_required_for_core_flow. Сохраняйте исходный порядок.',
        'contract': {'given': 'Автопроверка вызывает solve(requirements). requirements — список словарей name, '
                              'supports_core_flow и external_scope. supports_core_flow и external_scope имеют тип '
                              'bool.',
                     'todo': 'Разделите требования на mvp и out_of_scope. В mvp добавляйте name только когда '
                             'supports_core_flow=True и external_scope=False. Остальные требования добавляйте в '
                             'out_of_scope как словари name и reason. reason равен external_dependency, если '
                             'external_scope=True, иначе not_required_for_core_flow. Сохраняйте исходный порядок.',
                     'check': 'Платформа проверит обязательный teacher/student flow, необязательные функции и '
                              'внешнюю инфраструктуру. Сравниваются точные списки и причины исключения.'},
        'requirements': {'items': ['MVP требует core flow',
                                   'external scope исключается',
                                   'причина исключения явная',
                                   'порядок requirements сохраняется'],
                         'names': ['requirements', 'mvp', 'out_of_scope', 'reason'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['append']},
        'starter_code': 'def solve(requirements):\n'
                        '    mvp = []\n'
                        '    out_of_scope = []\n'
                        '    # Разделите требования по правилам MVP\n'
                        '    pass\n',
        'tests': [{'name': 'ядро и лишние функции',
                   'args': [[{'name': 'teacher creates course', 'supports_core_flow': True, 'external_scope': False},
                             {'name': 'student completes lesson',
                              'supports_core_flow': True,
                              'external_scope': False},
                             {'name': 'video hosting', 'supports_core_flow': False, 'external_scope': True},
                             {'name': 'certificates', 'supports_core_flow': False, 'external_scope': False}]],
                   'expected': {'mvp': ['teacher creates course', 'student completes lesson'],
                                'out_of_scope': [{'name': 'video hosting', 'reason': 'external_dependency'},
                                                 {'name': 'certificates', 'reason': 'not_required_for_core_flow'}]}},
                  {'name': 'пустой список', 'args': [[]], 'expected': {'mvp': [], 'out_of_scope': []}}],
        'reference_code': 'def solve(requirements):\n'
                          '    mvp = []\n'
                          '    out_of_scope = []\n'
                          '    for requirement in requirements:\n'
                          "        if requirement['supports_core_flow'] and not requirement['external_scope']:\n"
                          "            mvp.append(requirement['name'])\n"
                          '        else:\n'
                          '            reason = (\n'
                          "                'external_dependency'\n"
                          "                if requirement['external_scope']\n"
                          "                else 'not_required_for_core_flow'\n"
                          '            )\n'
                          '            out_of_scope.append({\n'
                          "                'name': requirement['name'],\n"
                          "                'reason': reason,\n"
                          '            })\n'
                          "    return {'mvp': mvp, 'out_of_scope': out_of_scope}\n"}],
    190: [{'title': 'Проверьте дерево Course → Module → Lesson',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Проверьте структуру. Module должен ссылаться на course_id, иметь position не меньше 1 и '
                  'уникальную position внутри course. Lesson должен ссылаться на родительский module, иметь position '
                  'не меньше 1 и уникальную position внутри module. Верните valid, errors, module_order и '
                  'lessons_by_module. errors содержит словари entity, id и problem в порядке обхода. module_order — '
                  'ids modules по position. lessons_by_module — список словарей module_id и lesson_ids по position.',
        'contract': {'given': 'Автопроверка вызывает solve(course_id, modules). Каждый module содержит id, '
                              'course_id, position и lessons. Каждый lesson содержит id, module_id и position.',
                     'todo': 'Проверьте структуру. Module должен ссылаться на course_id, иметь position не меньше 1 '
                             'и уникальную position внутри course. Lesson должен ссылаться на родительский module, '
                             'иметь position не меньше 1 и уникальную position внутри module. Верните valid, errors, '
                             'module_order и lessons_by_module. errors содержит словари entity, id и problem в '
                             'порядке обхода. module_order — ids modules по position. lessons_by_module — список '
                             'словарей module_id и lesson_ids по position.',
                     'check': 'Проверяются корректное дерево, неверные foreign keys, position=0 и duplicate '
                              'positions. Сравниваются ошибки и устойчивый порядок.'},
        'requirements': {'items': ['foreign keys проверяются',
                                   'position начинается с 1',
                                   'positions уникальны внутри parent',
                                   'результат сортируется по position'],
                         'names': ['course_id', 'modules', 'errors', 'module_positions', 'lessons_by_module'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['set', 'sorted'],
                         'attributes': ['append', 'add']},
        'starter_code': 'def solve(course_id, modules):\n'
                        '    errors = []\n'
                        '    # Проверьте связи и positions\n'
                        '    pass\n',
        'tests': [{'name': 'корректное дерево',
                   'args': [5,
                            [{'id': 10,
                              'course_id': 5,
                              'position': 2,
                              'lessons': [{'id': 101, 'module_id': 10, 'position': 2},
                                          {'id': 100, 'module_id': 10, 'position': 1}]},
                             {'id': 9, 'course_id': 5, 'position': 1, 'lessons': []}]],
                   'expected': {'valid': True,
                                'errors': [],
                                'module_order': [9, 10],
                                'lessons_by_module': [{'module_id': 9, 'lesson_ids': []},
                                                      {'module_id': 10, 'lesson_ids': [100, 101]}]}},
                  {'name': 'ошибки структуры',
                   'args': [5,
                            [{'id': 10,
                              'course_id': 8,
                              'position': 1,
                              'lessons': [{'id': 100, 'module_id': 99, 'position': 1},
                                          {'id': 101, 'module_id': 10, 'position': 1}]},
                             {'id': 11,
                              'course_id': 5,
                              'position': 1,
                              'lessons': [{'id': 102, 'module_id': 11, 'position': 0}]}]],
                   'expected': {'valid': False,
                                'errors': [{'entity': 'module', 'id': 10, 'problem': 'foreign_key'},
                                           {'entity': 'lesson', 'id': 100, 'problem': 'foreign_key'},
                                           {'entity': 'lesson', 'id': 101, 'problem': 'duplicate_position'},
                                           {'entity': 'module', 'id': 11, 'problem': 'duplicate_position'},
                                           {'entity': 'lesson', 'id': 102, 'problem': 'invalid_position'}],
                                'module_order': [10, 11],
                                'lessons_by_module': [{'module_id': 10, 'lesson_ids': [100, 101]},
                                                      {'module_id': 11, 'lesson_ids': [102]}]}}],
        'reference_code': 'def solve(course_id, modules):\n'
                          '    errors = []\n'
                          '    module_positions = set()\n'
                          '    for module in modules:\n'
                          "        if module['course_id'] != course_id:\n"
                          '            errors.append({\n'
                          "                'entity': 'module',\n"
                          "                'id': module['id'],\n"
                          "                'problem': 'foreign_key',\n"
                          '            })\n'
                          "        if module['position'] < 1:\n"
                          '            errors.append({\n'
                          "                'entity': 'module',\n"
                          "                'id': module['id'],\n"
                          "                'problem': 'invalid_position',\n"
                          '            })\n'
                          "        elif module['position'] in module_positions:\n"
                          '            errors.append({\n'
                          "                'entity': 'module',\n"
                          "                'id': module['id'],\n"
                          "                'problem': 'duplicate_position',\n"
                          '            })\n'
                          '        else:\n'
                          "            module_positions.add(module['position'])\n"
                          '        lesson_positions = set()\n'
                          "        for lesson in module['lessons']:\n"
                          "            if lesson['module_id'] != module['id']:\n"
                          '                errors.append({\n'
                          "                    'entity': 'lesson',\n"
                          "                    'id': lesson['id'],\n"
                          "                    'problem': 'foreign_key',\n"
                          '                })\n'
                          "            if lesson['position'] < 1:\n"
                          '                errors.append({\n'
                          "                    'entity': 'lesson',\n"
                          "                    'id': lesson['id'],\n"
                          "                    'problem': 'invalid_position',\n"
                          '                })\n'
                          "            elif lesson['position'] in lesson_positions:\n"
                          '                errors.append({\n'
                          "                    'entity': 'lesson',\n"
                          "                    'id': lesson['id'],\n"
                          "                    'problem': 'duplicate_position',\n"
                          '                })\n'
                          '            else:\n'
                          "                lesson_positions.add(lesson['position'])\n"
                          "    ordered_modules = sorted(modules, key=lambda item: item['position'])\n"
                          '    lessons_by_module = []\n'
                          '    for module in ordered_modules:\n'
                          '        ordered_lessons = sorted(\n'
                          "            module['lessons'],\n"
                          "            key=lambda item: item['position'],\n"
                          '        )\n'
                          '        lessons_by_module.append({\n'
                          "            'module_id': module['id'],\n"
                          "            'lesson_ids': [lesson['id'] for lesson in ordered_lessons],\n"
                          '        })\n'
                          '    return {\n'
                          "        'valid': not errors,\n"
                          "        'errors': errors,\n"
                          "        'module_order': [module['id'] for module in ordered_modules],\n"
                          "        'lessons_by_module': lessons_by_module,\n"
                          '    }\n'}],
    191: [{'title': 'Идемпотентная запись на Course',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Не изменяйте входной список. Если course_published=False, верните status 409, action rejected и '
                  'исходные enrollments. Если пара student_id/course_id уже имеет active или completed enrollment, '
                  'верните status 200 и action existing. Если запись withdrawn, измените её status на active и '
                  'верните action reactivated. Если пары нет, создайте enrollment с id на единицу больше '
                  'максимального id, status active и action created. В успешном результате добавьте enrollment_id и '
                  'обновлённый список.',
        'contract': {'given': 'Автопроверка вызывает solve(enrollments, student_id, course_id, course_published). '
                              'enrollments — список словарей id, student_id, course_id и status. status равен '
                              'active, withdrawn или completed.',
                     'todo': 'Не изменяйте входной список. Если course_published=False, верните status 409, action '
                             'rejected и исходные enrollments. Если пара student_id/course_id уже имеет active или '
                             'completed enrollment, верните status 200 и action existing. Если запись withdrawn, '
                             'измените её status на active и верните action reactivated. Если пары нет, создайте '
                             'enrollment с id на единицу больше максимального id, status active и action created. В '
                             'успешном результате добавьте enrollment_id и обновлённый список.',
                     'check': 'Проверяются unpublished course, первый request, повторный request и повторная '
                              'активация withdrawn enrollment. Дубликат пары не создаётся.'},
        'requirements': {'items': ['unpublished course отклоняется',
                                   'unique pair не дублируется',
                                   'withdrawn enrollment реактивируется',
                                   'входной список не изменяется'],
                         'names': ['enrollments', 'student_id', 'course_id', 'course_published', 'updated'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['dict', 'max'],
                         'attributes': ['append']},
        'starter_code': 'def solve(enrollments, student_id, course_id, course_published):\n'
                        '    # Верните идемпотентный результат\n'
                        '    pass\n',
        'tests': [{'name': 'course не опубликован',
                   'args': [[], 7, 3, False],
                   'expected': {'status': 409, 'action': 'rejected', 'enrollment_id': None, 'enrollments': []}},
                  {'name': 'первая запись',
                   'args': [[{'id': 4, 'student_id': 8, 'course_id': 3, 'status': 'active'}], 7, 3, True],
                   'expected': {'status': 201,
                                'action': 'created',
                                'enrollment_id': 5,
                                'enrollments': [{'id': 4, 'student_id': 8, 'course_id': 3, 'status': 'active'},
                                                {'id': 5, 'student_id': 7, 'course_id': 3, 'status': 'active'}]}},
                  {'name': 'повторная запись',
                   'args': [[{'id': 5, 'student_id': 7, 'course_id': 3, 'status': 'active'}], 7, 3, True],
                   'expected': {'status': 200,
                                'action': 'existing',
                                'enrollment_id': 5,
                                'enrollments': [{'id': 5, 'student_id': 7, 'course_id': 3, 'status': 'active'}]}},
                  {'name': 'реактивация',
                   'args': [[{'id': 5, 'student_id': 7, 'course_id': 3, 'status': 'withdrawn'}], 7, 3, True],
                   'expected': {'status': 200,
                                'action': 'reactivated',
                                'enrollment_id': 5,
                                'enrollments': [{'id': 5, 'student_id': 7, 'course_id': 3, 'status': 'active'}]}}],
        'reference_code': 'def solve(enrollments, student_id, course_id, course_published):\n'
                          '    updated = [dict(enrollment) for enrollment in enrollments]\n'
                          '    if not course_published:\n'
                          '        return {\n'
                          "            'status': 409,\n"
                          "            'action': 'rejected',\n"
                          "            'enrollment_id': None,\n"
                          "            'enrollments': updated,\n"
                          '        }\n'
                          '    for enrollment in updated:\n'
                          '        same_pair = (\n'
                          "            enrollment['student_id'] == student_id\n"
                          "            and enrollment['course_id'] == course_id\n"
                          '        )\n'
                          '        if same_pair:\n'
                          "            if enrollment['status'] == 'withdrawn':\n"
                          "                enrollment['status'] = 'active'\n"
                          "                action = 'reactivated'\n"
                          '            else:\n'
                          "                action = 'existing'\n"
                          '            return {\n'
                          "                'status': 200,\n"
                          "                'action': action,\n"
                          "                'enrollment_id': enrollment['id'],\n"
                          "                'enrollments': updated,\n"
                          '            }\n'
                          "    next_id = max([item['id'] for item in updated], default=0) + 1\n"
                          '    new_enrollment = {\n'
                          "        'id': next_id,\n"
                          "        'student_id': student_id,\n"
                          "        'course_id': course_id,\n"
                          "        'status': 'active',\n"
                          '    }\n'
                          '    updated.append(new_enrollment)\n'
                          '    return {\n'
                          "        'status': 201,\n"
                          "        'action': 'created',\n"
                          "        'enrollment_id': next_id,\n"
                          "        'enrollments': updated,\n"
                          '    }\n'}],
    192: [{'title': 'Рассчитайте Progress из фактов Completion',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Если enrolled=False, верните status 403, total 0, completed 0, percent 0.0 и '
                  'ignored_completion_ids пустым списком. При enrolled=True учитывайте только уникальные published '
                  'lessons. Completion засчитывается один раз и только когда lesson опубликован. '
                  'ignored_completion_ids содержит уникальные ids completion, которых нет среди published lessons, в '
                  'порядке первого появления. percent равен completed / total * 100 с округлением до двух знаков; '
                  'при total=0 верните 0.0.',
        'contract': {'given': 'Автопроверка вызывает solve(published_lesson_ids, completed_lesson_ids, enrolled). '
                              'Списки могут содержать повторы. enrolled имеет тип bool.',
                     'todo': 'Если enrolled=False, верните status 403, total 0, completed 0, percent 0.0 и '
                             'ignored_completion_ids пустым списком. При enrolled=True учитывайте только уникальные '
                             'published lessons. Completion засчитывается один раз и только когда lesson '
                             'опубликован. ignored_completion_ids содержит уникальные ids completion, которых нет '
                             'среди published lessons, в порядке первого появления. percent равен completed / total '
                             '* 100 с округлением до двух знаков; при total=0 верните 0.0.',
                     'check': 'Проверяются 0%, частичный и 100% progress, duplicate completion, foreign lesson и '
                              'отсутствие enrollment. Процент нельзя принимать из request.'},
        'requirements': {'items': ['enrollment обязателен',
                                   'published lessons уникализируются',
                                   'completion считается один раз',
                                   'foreign completion игнорируется и фиксируется'],
                         'names': ['published_lesson_ids',
                                   'completed_lesson_ids',
                                   'enrolled',
                                   'published',
                                   'completed_seen',
                                   'ignored',
                                   'percent'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['set', 'len', 'round'],
                         'attributes': ['add', 'append']},
        'starter_code': 'def solve(published_lesson_ids, completed_lesson_ids, enrolled):\n'
                        '    # Рассчитайте progress только из фактов\n'
                        '    pass\n',
        'tests': [{'name': 'нет enrollment',
                   'args': [[1, 2], [1], False],
                   'expected': {'status': 403,
                                'total': 0,
                                'completed': 0,
                                'percent': 0.0,
                                'ignored_completion_ids': []}},
                  {'name': 'частичный progress и повторы',
                   'args': [[1, 2, 3, 3], [1, 1, 9, 2], True],
                   'expected': {'status': 200,
                                'total': 3,
                                'completed': 2,
                                'percent': 66.67,
                                'ignored_completion_ids': [9]}},
                  {'name': 'полное завершение',
                   'args': [[4, 5], [5, 4], True],
                   'expected': {'status': 200,
                                'total': 2,
                                'completed': 2,
                                'percent': 100.0,
                                'ignored_completion_ids': []}},
                  {'name': 'нет опубликованных lessons',
                   'args': [[], [1], True],
                   'expected': {'status': 200,
                                'total': 0,
                                'completed': 0,
                                'percent': 0.0,
                                'ignored_completion_ids': [1]}}],
        'reference_code': 'def solve(published_lesson_ids, completed_lesson_ids, enrolled):\n'
                          '    if not enrolled:\n'
                          '        return {\n'
                          "            'status': 403,\n"
                          "            'total': 0,\n"
                          "            'completed': 0,\n"
                          "            'percent': 0.0,\n"
                          "            'ignored_completion_ids': [],\n"
                          '        }\n'
                          '    published = []\n'
                          '    published_seen = set()\n'
                          '    for lesson_id in published_lesson_ids:\n'
                          '        if lesson_id not in published_seen:\n'
                          '            published_seen.add(lesson_id)\n'
                          '            published.append(lesson_id)\n'
                          '    completed_seen = set()\n'
                          '    ignored_seen = set()\n'
                          '    ignored = []\n'
                          '    for lesson_id in completed_lesson_ids:\n'
                          '        if lesson_id in published_seen:\n'
                          '            completed_seen.add(lesson_id)\n'
                          '        elif lesson_id not in ignored_seen:\n'
                          '            ignored_seen.add(lesson_id)\n'
                          '            ignored.append(lesson_id)\n'
                          '    total = len(published)\n'
                          '    completed = len(completed_seen)\n'
                          '    percent = round(completed / total * 100, 2) if total else 0.0\n'
                          '    return {\n'
                          "        'status': 200,\n"
                          "        'total': total,\n"
                          "        'completed': completed,\n"
                          "        'percent': percent,\n"
                          "        'ignored_completion_ids': ignored,\n"
                          '    }\n'}],
    193: [{'title': 'Примените permissions matrix',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Если user отсутствует или неактивен, верните status 401 и decision unauthenticated. Admin '
                  'получает 200 для любого известного action. Teacher может create_course. Для update_course и '
                  'publish_course teacher должен быть owner; чужой resource возвращает 404. view_course разрешён для '
                  'published resource, а также owner-teacher для draft; иначе 404. enroll разрешён только student и '
                  'только published resource; draft возвращает 404. complete_lesson разрешён только student с '
                  'enrolled=True. Остальные запреты возвращают 403. Верните status и decision.',
        'contract': {'given': 'Автопроверка вызывает solve(user, action, resource, enrolled). user равен None или '
                              'словарю id, role и is_active. resource равен None или словарю owner_id и published. '
                              'action принимает create_course, update_course, publish_course, view_course, enroll, '
                              'complete_lesson или admin_audit.',
                     'todo': 'Если user отсутствует или неактивен, верните status 401 и decision unauthenticated. '
                             'Admin получает 200 для любого известного action. Teacher может create_course. Для '
                             'update_course и publish_course teacher должен быть owner; чужой resource возвращает '
                             '404. view_course разрешён для published resource, а также owner-teacher для draft; '
                             'иначе 404. enroll разрешён только student и только published resource; draft '
                             'возвращает 404. complete_lesson разрешён только student с enrolled=True. Остальные '
                             'запреты возвращают 403. Верните status и decision.',
                     'check': 'Проверяются anonymous, teacher owner, чужой teacher, draft visibility, enrollment, '
                              'completion и admin override. Identity не берётся из request body.'},
        'requirements': {'items': ['401 без active user',
                                   'teacher ownership',
                                   'draft скрывается',
                                   'student access через enrollment',
                                   'admin override'],
                         'names': ['user', 'action', 'resource', 'enrolled', 'known_actions'],
                         'nodes': ['FunctionDef', 'If']},
        'starter_code': 'def solve(user, action, resource, enrolled):\n'
                        '    # Примените правила role, ownership и enrollment\n'
                        '    pass\n',
        'tests': [{'name': 'anonymous',
                   'args': [None, 'view_course', {'owner_id': 5, 'published': True}, False],
                   'expected': {'status': 401, 'decision': 'unauthenticated'}},
                  {'name': 'teacher создаёт course',
                   'args': [{'id': 5, 'role': 'teacher', 'is_active': True}, 'create_course', None, False],
                   'expected': {'status': 200, 'decision': 'allowed'}},
                  {'name': 'owner обновляет course',
                   'args': [{'id': 5, 'role': 'teacher', 'is_active': True},
                            'update_course',
                            {'owner_id': 5, 'published': False},
                            False],
                   'expected': {'status': 200, 'decision': 'owner'}},
                  {'name': 'чужой teacher',
                   'args': [{'id': 6, 'role': 'teacher', 'is_active': True},
                            'publish_course',
                            {'owner_id': 5, 'published': False},
                            False],
                   'expected': {'status': 404, 'decision': 'not_found'}},
                  {'name': 'student не видит draft',
                   'args': [{'id': 7, 'role': 'student', 'is_active': True},
                            'view_course',
                            {'owner_id': 5, 'published': False},
                            False],
                   'expected': {'status': 404, 'decision': 'not_found'}},
                  {'name': 'student записывается',
                   'args': [{'id': 7, 'role': 'student', 'is_active': True},
                            'enroll',
                            {'owner_id': 5, 'published': True},
                            False],
                   'expected': {'status': 200, 'decision': 'allowed'}},
                  {'name': 'completion без enrollment',
                   'args': [{'id': 7, 'role': 'student', 'is_active': True},
                            'complete_lesson',
                            {'owner_id': 5, 'published': True},
                            False],
                   'expected': {'status': 403, 'decision': 'forbidden'}},
                  {'name': 'admin override',
                   'args': [{'id': 1, 'role': 'admin', 'is_active': True}, 'admin_audit', None, False],
                   'expected': {'status': 200, 'decision': 'admin'}}],
        'reference_code': 'def solve(user, action, resource, enrolled):\n'
                          "    if user is None or not user['is_active']:\n"
                          "        return {'status': 401, 'decision': 'unauthenticated'}\n"
                          '    known_actions = {\n'
                          "        'create_course',\n"
                          "        'update_course',\n"
                          "        'publish_course',\n"
                          "        'view_course',\n"
                          "        'enroll',\n"
                          "        'complete_lesson',\n"
                          "        'admin_audit',\n"
                          '    }\n'
                          '    if action not in known_actions:\n'
                          "        return {'status': 403, 'decision': 'forbidden'}\n"
                          "    if user['role'] == 'admin':\n"
                          "        return {'status': 200, 'decision': 'admin'}\n"
                          "    if action == 'create_course':\n"
                          "        if user['role'] == 'teacher':\n"
                          "            return {'status': 200, 'decision': 'allowed'}\n"
                          "        return {'status': 403, 'decision': 'forbidden'}\n"
                          "    if action in ('update_course', 'publish_course'):\n"
                          "        if user['role'] != 'teacher':\n"
                          "            return {'status': 403, 'decision': 'forbidden'}\n"
                          "        if resource is None or resource['owner_id'] != user['id']:\n"
                          "            return {'status': 404, 'decision': 'not_found'}\n"
                          "        return {'status': 200, 'decision': 'owner'}\n"
                          "    if action == 'view_course':\n"
                          '        if resource is None:\n'
                          "            return {'status': 404, 'decision': 'not_found'}\n"
                          "        if resource['published']:\n"
                          "            return {'status': 200, 'decision': 'allowed'}\n"
                          "        if user['role'] == 'teacher' and resource['owner_id'] == user['id']:\n"
                          "            return {'status': 200, 'decision': 'owner_preview'}\n"
                          "        return {'status': 404, 'decision': 'not_found'}\n"
                          "    if action == 'enroll':\n"
                          "        if user['role'] != 'student':\n"
                          "            return {'status': 403, 'decision': 'forbidden'}\n"
                          "        if resource is None or not resource['published']:\n"
                          "            return {'status': 404, 'decision': 'not_found'}\n"
                          "        return {'status': 200, 'decision': 'allowed'}\n"
                          "    if action == 'complete_lesson':\n"
                          "        if user['role'] == 'student' and enrolled:\n"
                          "            return {'status': 200, 'decision': 'allowed'}\n"
                          "        return {'status': 403, 'decision': 'forbidden'}\n"
                          "    return {'status': 403, 'decision': 'forbidden'}\n"}],
    194: [{'title': 'Проверьте безопасный migration plan',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Ожидаемый порядок: create_lms_tables, add_nullable_relations, backfill_existing_rows, '
                  'add_constraints, seed_demo_data, enable_lms_routes. Идите по steps по порядку. При первом шаге, '
                  'который не совпадает с ожидаемым, верните status blocked, blocked_at, expected_step и completed '
                  'до ошибки. Если steps образуют корректный prefix, верните status in_progress и next_step. Если '
                  'выполнены все шесть шагов, верните status ready и next_step=None.',
        'contract': {'given': 'Автопроверка вызывает solve(steps). steps — список названий выполненных '
                              'migration-шагов.',
                     'todo': 'Ожидаемый порядок: create_lms_tables, add_nullable_relations, backfill_existing_rows, '
                             'add_constraints, seed_demo_data, enable_lms_routes. Идите по steps по порядку. При '
                             'первом шаге, который не совпадает с ожидаемым, верните status blocked, blocked_at, '
                             'expected_step и completed до ошибки. Если steps образуют корректный prefix, верните '
                             'status in_progress и next_step. Если выполнены все шесть шагов, верните status ready и '
                             'next_step=None.',
                     'check': 'Проверяются пустой plan, корректный prefix, попытка добавить constraints до backfill '
                              'и полный plan. Большое изменение не должно маскироваться одним giant step.'},
        'requirements': {'items': ['фиксированный безопасный порядок',
                                   'ошибка блокирует plan',
                                   'completed сохраняет успешный prefix',
                                   'ready только после всех шагов'],
                         'names': ['steps', 'expected', 'completed'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['enumerate', 'len'],
                         'attributes': ['append']},
        'starter_code': 'def solve(steps):\n'
                        '    expected = []\n'
                        '    # Проверьте последовательность migration plan\n'
                        '    pass\n',
        'tests': [{'name': 'ещё не начато',
                   'args': [[]],
                   'expected': {'status': 'in_progress', 'completed': [], 'next_step': 'create_lms_tables'}},
                  {'name': 'корректный prefix',
                   'args': [['create_lms_tables', 'add_nullable_relations', 'backfill_existing_rows']],
                   'expected': {'status': 'in_progress',
                                'completed': ['create_lms_tables',
                                              'add_nullable_relations',
                                              'backfill_existing_rows'],
                                'next_step': 'add_constraints'}},
                  {'name': 'constraint слишком рано',
                   'args': [['create_lms_tables', 'add_nullable_relations', 'add_constraints']],
                   'expected': {'status': 'blocked',
                                'completed': ['create_lms_tables', 'add_nullable_relations'],
                                'blocked_at': 'add_constraints',
                                'expected_step': 'backfill_existing_rows'}},
                  {'name': 'готово',
                   'args': [['create_lms_tables',
                             'add_nullable_relations',
                             'backfill_existing_rows',
                             'add_constraints',
                             'seed_demo_data',
                             'enable_lms_routes']],
                   'expected': {'status': 'ready',
                                'completed': ['create_lms_tables',
                                              'add_nullable_relations',
                                              'backfill_existing_rows',
                                              'add_constraints',
                                              'seed_demo_data',
                                              'enable_lms_routes'],
                                'next_step': None}}],
        'reference_code': 'def solve(steps):\n'
                          '    expected = [\n'
                          "        'create_lms_tables',\n"
                          "        'add_nullable_relations',\n"
                          "        'backfill_existing_rows',\n"
                          "        'add_constraints',\n"
                          "        'seed_demo_data',\n"
                          "        'enable_lms_routes',\n"
                          '    ]\n'
                          '    completed = []\n'
                          '    for index, step in enumerate(steps):\n'
                          '        if index >= len(expected) or step != expected[index]:\n'
                          '            expected_step = expected[index] if index < len(expected) else None\n'
                          '            return {\n'
                          "                'status': 'blocked',\n"
                          "                'completed': completed,\n"
                          "                'blocked_at': step,\n"
                          "                'expected_step': expected_step,\n"
                          '            }\n'
                          '        completed.append(step)\n'
                          '    if len(completed) == len(expected):\n'
                          '        return {\n'
                          "            'status': 'ready',\n"
                          "            'completed': completed,\n"
                          "            'next_step': None,\n"
                          '        }\n'
                          '    return {\n'
                          "        'status': 'in_progress',\n"
                          "        'completed': completed,\n"
                          "        'next_step': expected[len(completed)],\n"
                          '    }\n'}]
}

from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    197: [{'title': 'Проверьте готовность Course к публикации',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Если user неактивен, верните status 401 и decision unauthenticated. Если user не admin и не '
                  'owner-teacher, верните 404 и decision not_found. Если course уже published, верните 200 и '
                  'decision already_published. Для draft соберите missing: title, slug, module или lesson. module '
                  'отсутствует, когда modules пуст. lesson отсутствует, если хотя бы у одного module lesson_count '
                  'меньше 1. При missing верните 409 и decision not_ready. Иначе верните 200, decision published и '
                  'копию course со status published.',
        'contract': {'given': 'Автопроверка вызывает solve(course, user, modules). course содержит status, owner_id, '
                              'title и slug. user содержит id, role и is_active. modules — список словарей id и '
                              'lesson_count.',
                     'todo': 'Если user неактивен, верните status 401 и decision unauthenticated. Если user не admin '
                             'и не owner-teacher, верните 404 и decision not_found. Если course уже published, '
                             'верните 200 и decision already_published. Для draft соберите missing: title, slug, '
                             'module или lesson. module отсутствует, когда modules пуст. lesson отсутствует, если '
                             'хотя бы у одного module lesson_count меньше 1. При missing верните 409 и decision '
                             'not_ready. Иначе верните 200, decision published и копию course со status published.',
                     'check': 'Проверяются ownership, пустой course, module без lesson, повторная публикация и '
                              'успешный переход. Исходный course не должен изменяться.'},
        'requirements': {'items': ['owner или admin',
                                   'идемпотентная повторная публикация',
                                   'явные publication preconditions',
                                   'копия course вместо изменения input'],
                         'names': ['course', 'user', 'modules', 'missing', 'published_course'],
                         'nodes': ['FunctionDef', 'If'],
                         'calls': ['dict', 'any'],
                         'attributes': ['strip', 'append']},
        'starter_code': 'def solve(course, user, modules):\n'
                        '    # Проверьте permission и publication preconditions\n'
                        '    pass\n',
        'tests': [{'name': 'чужой teacher',
                   'args': [{'status': 'draft', 'owner_id': 5, 'title': 'Python', 'slug': 'python'},
                            {'id': 6, 'role': 'teacher', 'is_active': True},
                            [{'id': 1, 'lesson_count': 1}]],
                   'expected': {'status': 404, 'decision': 'not_found', 'missing': [], 'course': None}},
                  {'name': 'course не готов',
                   'args': [{'status': 'draft', 'owner_id': 5, 'title': '', 'slug': ''},
                            {'id': 5, 'role': 'teacher', 'is_active': True},
                            []],
                   'expected': {'status': 409,
                                'decision': 'not_ready',
                                'missing': ['title', 'slug', 'module'],
                                'course': None}},
                  {'name': 'module без lesson',
                   'args': [{'status': 'draft', 'owner_id': 5, 'title': 'Python', 'slug': 'python'},
                            {'id': 5, 'role': 'teacher', 'is_active': True},
                            [{'id': 1, 'lesson_count': 0}]],
                   'expected': {'status': 409, 'decision': 'not_ready', 'missing': ['lesson'], 'course': None}},
                  {'name': 'успешная публикация',
                   'args': [{'status': 'draft', 'owner_id': 5, 'title': 'Python', 'slug': 'python'},
                            {'id': 5, 'role': 'teacher', 'is_active': True},
                            [{'id': 1, 'lesson_count': 2}, {'id': 2, 'lesson_count': 1}]],
                   'expected': {'status': 200,
                                'decision': 'published',
                                'missing': [],
                                'course': {'status': 'published',
                                           'owner_id': 5,
                                           'title': 'Python',
                                           'slug': 'python'}}},
                  {'name': 'повторная публикация',
                   'args': [{'status': 'published', 'owner_id': 5, 'title': 'Python', 'slug': 'python'},
                            {'id': 5, 'role': 'teacher', 'is_active': True},
                            [{'id': 1, 'lesson_count': 1}]],
                   'expected': {'status': 200,
                                'decision': 'already_published',
                                'missing': [],
                                'course': {'status': 'published',
                                           'owner_id': 5,
                                           'title': 'Python',
                                           'slug': 'python'}}}],
        'reference_code': 'def solve(course, user, modules):\n'
                          "    if not user['is_active']:\n"
                          '        return {\n'
                          "            'status': 401,\n"
                          "            'decision': 'unauthenticated',\n"
                          "            'missing': [],\n"
                          "            'course': None,\n"
                          '        }\n'
                          "    is_admin = user['role'] == 'admin'\n"
                          '    is_owner_teacher = (\n'
                          "        user['role'] == 'teacher'\n"
                          "        and user['id'] == course['owner_id']\n"
                          '    )\n'
                          '    if not is_admin and not is_owner_teacher:\n'
                          '        return {\n'
                          "            'status': 404,\n"
                          "            'decision': 'not_found',\n"
                          "            'missing': [],\n"
                          "            'course': None,\n"
                          '        }\n'
                          "    if course['status'] == 'published':\n"
                          '        return {\n'
                          "            'status': 200,\n"
                          "            'decision': 'already_published',\n"
                          "            'missing': [],\n"
                          "            'course': dict(course),\n"
                          '        }\n'
                          '    missing = []\n'
                          "    if not course['title'].strip():\n"
                          "        missing.append('title')\n"
                          "    if not course['slug'].strip():\n"
                          "        missing.append('slug')\n"
                          '    if not modules:\n'
                          "        missing.append('module')\n"
                          "    elif any(module['lesson_count'] < 1 for module in modules):\n"
                          "        missing.append('lesson')\n"
                          '    if missing:\n'
                          '        return {\n'
                          "            'status': 409,\n"
                          "            'decision': 'not_ready',\n"
                          "            'missing': missing,\n"
                          "            'course': None,\n"
                          '        }\n'
                          '    published_course = dict(course)\n'
                          "    published_course['status'] = 'published'\n"
                          '    return {\n'
                          "        'status': 200,\n"
                          "        'decision': 'published',\n"
                          "        'missing': [],\n"
                          "        'course': published_course,\n"
                          '    }\n'}]
}

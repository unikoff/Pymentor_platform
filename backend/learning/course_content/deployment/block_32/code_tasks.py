from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    183: [{'title': 'Quality gates для commit',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Верните status, stopped_at и executed. Идите по gates по порядку и добавляйте name в executed. '
                  "При первом passed=False остановитесь, status='failed', stopped_at получает name. Если все gates "
                  "прошли, status='passed', stopped_at=None. Steps после первого failure не выполняются.",
        'contract': {'given': 'Автопроверка вызывает solve(gates). gates — список словарей name и passed в '
                              'фактическом порядке pipeline.',
                     'todo': 'Верните status, stopped_at и executed. Идите по gates по порядку и добавляйте name в '
                             "executed. При первом passed=False остановитесь, status='failed', stopped_at получает "
                             "name. Если все gates прошли, status='passed', stopped_at=None. Steps после первого "
                             'failure не выполняются.',
                     'check': 'Проверяются полный success, format failure, test failure и пустой pipeline. '
                              'Сравнивается точный executed order.'},
        'requirements': {'items': ['gates выполняются по порядку',
                                   'остановка на первом failure',
                                   'последующие steps не выполняются',
                                   'полный success'],
                         'names': ['gates', 'executed'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['append']},
        'starter_code': 'def solve(gates):\n    executed = []\n    # Выполните gates до первого failure\n    pass\n',
        'tests': [{'name': 'зелёный pipeline',
                   'args': [[{'name': 'format', 'passed': True},
                             {'name': 'lint', 'passed': True},
                             {'name': 'tests', 'passed': True},
                             {'name': 'image', 'passed': True}]],
                   'expected': {'status': 'passed',
                                'stopped_at': None,
                                'executed': ['format', 'lint', 'tests', 'image']}},
                  {'name': 'format failure',
                   'args': [[{'name': 'format', 'passed': False},
                             {'name': 'lint', 'passed': True},
                             {'name': 'tests', 'passed': True}]],
                   'expected': {'status': 'failed', 'stopped_at': 'format', 'executed': ['format']}},
                  {'name': 'tests failure',
                   'args': [[{'name': 'format', 'passed': True},
                             {'name': 'lint', 'passed': True},
                             {'name': 'tests', 'passed': False},
                             {'name': 'image', 'passed': True}]],
                   'expected': {'status': 'failed', 'stopped_at': 'tests', 'executed': ['format', 'lint', 'tests']}}],
        'reference_code': 'def solve(gates):\n'
                          '    executed = []\n'
                          '    for gate in gates:\n'
                          "        executed.append(gate['name'])\n"
                          "        if not gate['passed']:\n"
                          '            return {\n'
                          "                'status': 'failed',\n"
                          "                'stopped_at': gate['name'],\n"
                          "                'executed': executed,\n"
                          '            }\n'
                          '    return {\n'
                          "        'status': 'passed',\n"
                          "        'stopped_at': None,\n"
                          "        'executed': executed,\n"
                          '    }\n'}],
    186: [{'title': 'Прослеживаемый image tag',
        'level': 'easy',
        'mode': 'solve',
        'prompt': 'Если tests_passed=False, верните publish=False и пустой tags. Иначе всегда добавьте tag '
                  'sha-<первые 12 символов commit_sha>. Для branch main добавьте tag main. Если release_tag не None '
                  'и начинается с v, добавьте его последним. latest не добавляйте. Верните publish=True, tags и '
                  'traceable_to=commit_sha.',
        'contract': {'given': 'Автопроверка вызывает solve(commit_sha, release_tag, branch, tests_passed). '
                              'commit_sha — полная строка SHA, release_tag — строка или None, branch — имя branch.',
                     'todo': 'Если tests_passed=False, верните publish=False и пустой tags. Иначе всегда добавьте '
                             'tag sha-<первые 12 символов commit_sha>. Для branch main добавьте tag main. Если '
                             'release_tag не None и начинается с v, добавьте его последним. latest не добавляйте. '
                             'Верните publish=True, tags и traceable_to=commit_sha.',
                     'check': 'Проверяются feature branch, main, release tag и failed tests. Каждый опубликованный '
                              'image должен ссылаться на конкретный commit.'},
        'requirements': {'items': ['публикация только после tests',
                                   'SHA tag обязателен',
                                   'release tag добавляется явно',
                                   'latest не используется'],
                         'names': ['commit_sha', 'release_tag', 'branch', 'tests_passed', 'tags'],
                         'nodes': ['FunctionDef', 'If'],
                         'attributes': ['append', 'startswith']},
        'starter_code': 'def solve(commit_sha, release_tag, branch, tests_passed):\n'
                        '    # Соберите список безопасных image tags\n'
                        '    pass\n',
        'tests': [{'name': 'feature branch',
                   'args': ['abcdef1234567890', None, 'feature/logs', True],
                   'expected': {'publish': True, 'tags': ['sha-abcdef123456'], 'traceable_to': 'abcdef1234567890'}},
                  {'name': 'main release',
                   'args': ['1234567890abcdef', 'v6.0.0', 'main', True],
                   'expected': {'publish': True,
                                'tags': ['sha-1234567890ab', 'main', 'v6.0.0'],
                                'traceable_to': '1234567890abcdef'}},
                  {'name': 'tests failed',
                   'args': ['abcdef1234567890', 'v6.0.0', 'main', False],
                   'expected': {'publish': False, 'tags': [], 'traceable_to': None}}],
        'reference_code': 'def solve(commit_sha, release_tag, branch, tests_passed):\n'
                          '    if not tests_passed:\n'
                          '        return {\n'
                          "            'publish': False,\n"
                          "            'tags': [],\n"
                          "            'traceable_to': None,\n"
                          '        }\n'
                          '    tags = [f"sha-{commit_sha[:12]}"]\n'
                          "    if branch == 'main':\n"
                          "        tags.append('main')\n"
                          "    if release_tag is not None and release_tag.startswith('v'):\n"
                          '        tags.append(release_tag)\n'
                          '    return {\n'
                          "        'publish': True,\n"
                          "        'tags': tags,\n"
                          "        'traceable_to': commit_sha,\n"
                          '    }\n'}],
    188: [{'title': 'Решение после smoke test',
        'level': 'medium',
        'mode': 'solve',
        'prompt': "Если все четыре проверки True, верните action='keep', active_tag=current_tag и incident=False. "
                  "Если любая проверка False и previous_tag существует, верните action='rollback', "
                  'active_tag=previous_tag и incident=True. Если previous_tag отсутствует, верните '
                  "action='stop_traffic', active_tag=None и incident=True. Добавьте failed_checks в порядке health, "
                  'readiness, migration, key_scenario.',
        'contract': {'given': 'Автопроверка вызывает solve(current_tag, previous_tag, health_ok, readiness_ok, '
                              'migration_ok, key_scenario_ok). Tags — строки или None, остальные аргументы — bool.',
                     'todo': "Если все четыре проверки True, верните action='keep', active_tag=current_tag и "
                             'incident=False. Если любая проверка False и previous_tag существует, верните '
                             "action='rollback', active_tag=previous_tag и incident=True. Если previous_tag "
                             "отсутствует, верните action='stop_traffic', active_tag=None и incident=True. Добавьте "
                             'failed_checks в порядке health, readiness, migration, key_scenario.',
                     'check': 'Проверяются успешный deploy, один failure, несколько failures и отсутствие предыдущей '
                              'версии. Rollback должен указывать конкретный known-good tag.'},
        'requirements': {'items': ['четыре smoke checks',
                                   'known-good previous tag',
                                   'rollback при failure',
                                   'stop traffic без previous version'],
                         'names': ['current_tag',
                                   'previous_tag',
                                   'health_ok',
                                   'readiness_ok',
                                   'migration_ok',
                                   'key_scenario_ok',
                                   'checks',
                                   'failed_checks'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'attributes': ['append']},
        'starter_code': 'def solve(current_tag, previous_tag, health_ok, readiness_ok, migration_ok, '
                        'key_scenario_ok):\n'
                        '    # Определите keep, rollback или stop_traffic\n'
                        '    pass\n',
        'tests': [{'name': 'deploy успешен',
                   'args': ['v6.0.0', 'v5.0.0', True, True, True, True],
                   'expected': {'action': 'keep', 'active_tag': 'v6.0.0', 'incident': False, 'failed_checks': []}},
                  {'name': 'rollback',
                   'args': ['v6.0.1', 'v6.0.0', True, True, True, False],
                   'expected': {'action': 'rollback',
                                'active_tag': 'v6.0.0',
                                'incident': True,
                                'failed_checks': ['key_scenario']}},
                  {'name': 'несколько failures',
                   'args': ['v6.0.1', 'v6.0.0', False, False, True, False],
                   'expected': {'action': 'rollback',
                                'active_tag': 'v6.0.0',
                                'incident': True,
                                'failed_checks': ['health', 'readiness', 'key_scenario']}},
                  {'name': 'нет previous tag',
                   'args': ['v1.0.0', None, False, False, False, False],
                   'expected': {'action': 'stop_traffic',
                                'active_tag': None,
                                'incident': True,
                                'failed_checks': ['health', 'readiness', 'migration', 'key_scenario']}}],
        'reference_code': 'def solve(current_tag, previous_tag, health_ok, readiness_ok, migration_ok, '
                          'key_scenario_ok):\n'
                          '    checks = [\n'
                          "        ('health', health_ok),\n"
                          "        ('readiness', readiness_ok),\n"
                          "        ('migration', migration_ok),\n"
                          "        ('key_scenario', key_scenario_ok),\n"
                          '    ]\n'
                          '    failed_checks = []\n'
                          '    for name, passed in checks:\n'
                          '        if not passed:\n'
                          '            failed_checks.append(name)\n'
                          '    if not failed_checks:\n'
                          '        return {\n'
                          "            'action': 'keep',\n"
                          "            'active_tag': current_tag,\n"
                          "            'incident': False,\n"
                          "            'failed_checks': [],\n"
                          '        }\n'
                          '    if previous_tag is not None:\n'
                          "        action = 'rollback'\n"
                          '        active_tag = previous_tag\n'
                          '    else:\n'
                          "        action = 'stop_traffic'\n"
                          '        active_tag = None\n'
                          '    return {\n'
                          "        'action': action,\n"
                          "        'active_tag': active_tag,\n"
                          "        'incident': True,\n"
                          "        'failed_checks': failed_checks,\n"
                          '    }\n'}]
}

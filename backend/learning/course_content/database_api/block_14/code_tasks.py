from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    75: [{'title': 'Аудит временного хранилища',
       'level': 'easy',
       'mode': 'solve',
       'prompt': 'Определите три свойства. persists равно True, если непустое состояние after_restart совпадает с '
                 'before_restart. shared_state равно True, если worker_a и worker_b видят одинаковые данные. '
                 'has_duplicates равно True, если после strip и lower встречаются одинаковые titles. Соберите '
                 'requirements: добавьте persistence, если persists равно False; shared_state, если shared_state '
                 'равно False; uniqueness, если has_duplicates равно True. Верните словарь с четырьмя ключами '
                 'persists, shared_state, has_duplicates и requirements.',
       'contract': {'given': 'Автопроверка вызывает solve(before_restart, after_restart, worker_a, worker_b, '
                             'titles). Первые четыре аргумента — списки идентификаторов задач. titles — список '
                             'заголовков, в котором могут быть дубликаты с разным регистром и пробелами.',
                    'todo': 'Определите три свойства. persists равно True, если непустое состояние after_restart '
                            'совпадает с before_restart. shared_state равно True, если worker_a и worker_b видят '
                            'одинаковые данные. has_duplicates равно True, если после strip и lower встречаются '
                            'одинаковые titles. Соберите requirements: добавьте persistence, если persists равно '
                            'False; shared_state, если shared_state равно False; uniqueness, если has_duplicates '
                            'равно True. Верните словарь с четырьмя ключами persists, shared_state, has_duplicates и '
                            'requirements.',
                    'check': 'Проверяются потеря данных после restart, расхождение двух workers, дубли и полностью '
                             'устойчивый сценарий. Порядок requirements должен быть persistence, shared_state, '
                             'uniqueness.'},
       'requirements': {'items': ['сравнение состояния до и после restart',
                                  'сравнение workers',
                                  'нормализация titles',
                                  'список requirements'],
                        'names': ['before_restart',
                                  'after_restart',
                                  'worker_a',
                                  'worker_b',
                                  'titles',
                                  'requirements'],
                        'nodes': ['FunctionDef', 'For', 'If'],
                        'calls': ['len', 'set'],
                        'attributes': ['append', 'strip', 'lower']},
       'starter_code': 'def solve(before_restart, after_restart, worker_a, worker_b, titles):\n'
                       '    requirements = []\n'
                       '    # Рассчитайте три свойства\n'
                       '    # Добавьте требования в установленном порядке\n'
                       '    pass\n',
       'tests': [{'name': 'все ограничения памяти',
                  'args': [[1, 2], [], [1, 2], [1], ['  README', 'readme  ']],
                  'expected': {'persists': False,
                               'shared_state': False,
                               'has_duplicates': True,
                               'requirements': ['persistence', 'shared_state', 'uniqueness']}},
                 {'name': 'только persistence',
                  'args': [[1], [], [1], [1], ['Код', 'README']],
                  'expected': {'persists': False,
                               'shared_state': True,
                               'has_duplicates': False,
                               'requirements': ['persistence']}},
                 {'name': 'устойчивый сценарий',
                  'args': [[1, 2], [1, 2], [1, 2], [1, 2], ['Код', 'README']],
                  'expected': {'persists': True, 'shared_state': True, 'has_duplicates': False, 'requirements': []}}],
       'reference_code': 'def solve(before_restart, after_restart, worker_a, worker_b, titles):\n'
                         '    persists = len(after_restart) > 0 and before_restart == after_restart\n'
                         '    shared_state = worker_a == worker_b\n'
                         '    normalized_titles = []\n'
                         '    for title in titles:\n'
                         '        normalized_titles.append(title.strip().lower())\n'
                         '    has_duplicates = len(set(normalized_titles)) != len(normalized_titles)\n'
                         '    requirements = []\n'
                         '    if not persists:\n'
                         "        requirements.append('persistence')\n"
                         '    if not shared_state:\n'
                         "        requirements.append('shared_state')\n"
                         '    if has_duplicates:\n'
                         "        requirements.append('uniqueness')\n"
                         '    return {\n'
                         "        'persists': persists,\n"
                         "        'shared_state': shared_state,\n"
                         "        'has_duplicates': has_duplicates,\n"
                         "        'requirements': requirements,\n"
                         '    }\n'}],
    79: [{'title': 'Состояния Session',
       'level': 'medium',
       'mode': 'solve',
       'prompt': 'Начальные значения: dirty=False, persisted=False, usable=True, closed=False, log=[]. add при '
                 'usable и незакрытой Session делает dirty=True и добавляет pending. commit при usable и dirty '
                 'делает persisted=True, dirty=False и добавляет committed. commit_error делает usable=False и '
                 'добавляет failed. refresh при usable и persisted добавляет refreshed. rollback делает usable=True, '
                 'dirty=False и добавляет rolled_back. close делает closed=True, usable=False и добавляет closed. '
                 'Операция add или commit при unusable либо closed добавляет blocked. Верните все пять состояний.',
       'contract': {'given': 'Автопроверка вызывает solve(events). events — список строк add, commit, commit_error, '
                             'refresh, rollback и close. Нужно смоделировать только учебный lifecycle, без '
                             'SQLAlchemy imports.',
                    'todo': 'Начальные значения: dirty=False, persisted=False, usable=True, closed=False, log=[]. '
                            'add при usable и незакрытой Session делает dirty=True и добавляет pending. commit при '
                            'usable и dirty делает persisted=True, dirty=False и добавляет committed. commit_error '
                            'делает usable=False и добавляет failed. refresh при usable и persisted добавляет '
                            'refreshed. rollback делает usable=True, dirty=False и добавляет rolled_back. close '
                            'делает closed=True, usable=False и добавляет closed. Операция add или commit при '
                            'unusable либо closed добавляет blocked. Верните все пять состояний.',
                    'check': 'Проверяется успешная transaction, ошибка с rollback и попытка продолжить работу без '
                             'rollback. Сравнивается полный log и итоговые flags.'},
       'requirements': {'items': ['обработка events циклом',
                                  'commit_error блокирует Session',
                                  'rollback восстанавливает Session',
                                  'close завершает lifecycle'],
                        'names': ['events', 'dirty', 'persisted', 'usable', 'closed', 'log'],
                        'nodes': ['FunctionDef', 'For', 'If'],
                        'attributes': ['append']},
       'starter_code': 'def solve(events):\n'
                       '    dirty = False\n'
                       '    persisted = False\n'
                       '    usable = True\n'
                       '    closed = False\n'
                       '    log = []\n'
                       '    # Обработайте events по порядку\n'
                       '    pass\n',
       'tests': [{'name': 'успешный lifecycle',
                  'args': [['add', 'commit', 'refresh', 'close']],
                  'expected': {'dirty': False,
                               'persisted': True,
                               'usable': False,
                               'closed': True,
                               'log': ['pending', 'committed', 'refreshed', 'closed']}},
                 {'name': 'ошибка и rollback',
                  'args': [['add', 'commit_error', 'rollback', 'add', 'commit', 'close']],
                  'expected': {'dirty': False,
                               'persisted': True,
                               'usable': False,
                               'closed': True,
                               'log': ['pending', 'failed', 'rolled_back', 'pending', 'committed', 'closed']}},
                 {'name': 'без rollback',
                  'args': [['add', 'commit_error', 'add', 'commit', 'close']],
                  'expected': {'dirty': True,
                               'persisted': False,
                               'usable': False,
                               'closed': True,
                               'log': ['pending', 'failed', 'blocked', 'blocked', 'closed']}}],
       'reference_code': 'def solve(events):\n'
                         '    dirty = False\n'
                         '    persisted = False\n'
                         '    usable = True\n'
                         '    closed = False\n'
                         '    log = []\n'
                         '    for event in events:\n'
                         "        if event == 'add':\n"
                         '            if usable and not closed:\n'
                         '                dirty = True\n'
                         "                log.append('pending')\n"
                         '            else:\n'
                         "                log.append('blocked')\n"
                         "        elif event == 'commit':\n"
                         '            if usable and not closed and dirty:\n'
                         '                persisted = True\n'
                         '                dirty = False\n'
                         "                log.append('committed')\n"
                         '            else:\n'
                         "                log.append('blocked')\n"
                         "        elif event == 'commit_error':\n"
                         '            usable = False\n'
                         "            log.append('failed')\n"
                         "        elif event == 'refresh':\n"
                         '            if usable and persisted and not closed:\n'
                         "                log.append('refreshed')\n"
                         '            else:\n'
                         "                log.append('blocked')\n"
                         "        elif event == 'rollback':\n"
                         '            usable = True\n'
                         '            dirty = False\n'
                         "            log.append('rolled_back')\n"
                         "        elif event == 'close':\n"
                         '            closed = True\n'
                         '            usable = False\n'
                         "            log.append('closed')\n"
                         '    return {\n'
                         "        'dirty': dirty,\n"
                         "        'persisted': persisted,\n"
                         "        'usable': usable,\n"
                         "        'closed': closed,\n"
                         "        'log': log,\n"
                         '    }\n'}]
}

from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    136: [{'title': 'Leftmost prefix составного индекса',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Определите usable_prefix по правилу leftmost prefix. Идите по index_columns слева направо. '
                  'Колонка входит в prefix, если она есть в equality_filters. Первая колонка range_column также '
                  'входит и завершает prefix. При первой колонке без equality/range остановитесь. supports_order '
                  'равно True, если order_by — следующая колонка после equality prefix или уже последняя колонка '
                  'usable_prefix как range/order column. Верните usable_prefix и supports_order.',
        'contract': {'given': 'Автопроверка вызывает solve(index_columns, equality_filters, range_column, order_by). '
                              'index_columns — порядок колонок составного индекса. equality_filters — список колонок '
                              'с условием равенства. range_column и order_by — строка или None.',
                     'todo': 'Определите usable_prefix по правилу leftmost prefix. Идите по index_columns слева '
                             'направо. Колонка входит в prefix, если она есть в equality_filters. Первая колонка '
                             'range_column также входит и завершает prefix. При первой колонке без equality/range '
                             'остановитесь. supports_order равно True, если order_by — следующая колонка после '
                             'equality prefix или уже последняя колонка usable_prefix как range/order column. '
                             'Верните usable_prefix и supports_order.',
                     'check': 'Проверяется полный prefix, пропуск первой колонки, range после equality и сортировка '
                              'по следующей колонке. Индекс не должен считаться полезным только потому, что filter '
                              'содержит правую колонку.'},
        'requirements': {'items': ['left-to-right обход index_columns',
                                   'stop на первой дырке',
                                   'range завершает prefix',
                                   'order_by после equality prefix'],
                         'names': ['index_columns',
                                   'equality_filters',
                                   'range_column',
                                   'order_by',
                                   'usable_prefix',
                                   'supports_order'],
                         'nodes': ['FunctionDef', 'For', 'If'],
                         'calls': ['set', 'len'],
                         'attributes': ['append']},
        'starter_code': 'def solve(index_columns, equality_filters, range_column, order_by):\n'
                        '    usable_prefix = []\n'
                        '    # Примените leftmost-prefix rule\n'
                        '    pass\n',
        'tests': [{'name': 'полный equality prefix',
                   'args': [['owner_id', 'is_done', 'created_at'], ['owner_id', 'is_done'], None, 'created_at'],
                   'expected': {'usable_prefix': ['owner_id', 'is_done'], 'supports_order': True}},
                  {'name': 'пропущена первая колонка',
                   'args': [['owner_id', 'is_done', 'created_at'], ['is_done'], None, 'created_at'],
                   'expected': {'usable_prefix': [], 'supports_order': False}},
                  {'name': 'range завершает prefix',
                   'args': [['owner_id', 'is_done', 'created_at'], ['owner_id'], 'is_done', 'created_at'],
                   'expected': {'usable_prefix': ['owner_id', 'is_done'], 'supports_order': False}},
                  {'name': 'order по первой колонке',
                   'args': [['owner_id', 'is_done', 'created_at'], [], None, 'owner_id'],
                   'expected': {'usable_prefix': [], 'supports_order': True}}],
        'reference_code': 'def solve(index_columns, equality_filters, range_column, order_by):\n'
                          '    equality_set = set(equality_filters)\n'
                          '    usable_prefix = []\n'
                          '    stopped_by_range = False\n'
                          '    for column in index_columns:\n'
                          '        if column in equality_set:\n'
                          '            usable_prefix.append(column)\n'
                          '        elif column == range_column:\n'
                          '            usable_prefix.append(column)\n'
                          '            stopped_by_range = True\n'
                          '            break\n'
                          '        else:\n'
                          '            break\n'
                          '    supports_order = False\n'
                          '    if order_by is not None and not stopped_by_range:\n'
                          '        next_index = len(usable_prefix)\n'
                          '        if next_index < len(index_columns):\n'
                          '            supports_order = index_columns[next_index] == order_by\n'
                          '    if stopped_by_range and usable_prefix:\n'
                          '        supports_order = usable_prefix[-1] == order_by\n'
                          '    return {\n'
                          "        'usable_prefix': usable_prefix,\n"
                          "        'supports_order': supports_order,\n"
                          '    }\n'}]
}

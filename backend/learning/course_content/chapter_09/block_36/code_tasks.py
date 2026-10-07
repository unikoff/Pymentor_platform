from typing import Any

CODE_TASKS: dict[int, list[dict[str, Any]]] = {
    207: [{'title': 'Соберите единый API error contract',
        'level': 'medium',
        'mode': 'solve',
        'prompt': 'Верните словарь error с ключами code, message, details и request_id. validation всегда даёт '
                  'status 422, code validation_error и message Request validation failed. auth использует status 401 '
                  'или 403 и code unauthenticated либо forbidden. domain сохраняет status и получает code '
                  'bad_request для 400, not_found для 404, conflict для 409, иначе domain_error. rate_limit всегда '
                  'даёт 429 и code rate_limited. unexpected всегда даёт 500, code internal_error, message Internal '
                  'server error и details=None. Для остальных sources message берётся из public_message.',
        'contract': {'given': 'Автопроверка вызывает solve(source, status, public_message, details, request_id). '
                              'source равен validation, auth, domain, rate_limit или unexpected.',
                     'todo': 'Верните словарь error с ключами code, message, details и request_id. validation всегда '
                             'даёт status 422, code validation_error и message Request validation failed. auth '
                             'использует status 401 или 403 и code unauthenticated либо forbidden. domain сохраняет '
                             'status и получает code bad_request для 400, not_found для 404, conflict для 409, иначе '
                             'domain_error. rate_limit всегда даёт 429 и code rate_limited. unexpected всегда даёт '
                             '500, code internal_error, message Internal server error и details=None. Для остальных '
                             'sources message берётся из public_message.',
                     'check': 'Проверяются validation, 401, 403, domain 404/409, rate limit и unexpected exception. '
                              'Внутренний traceback не должен попадать в unexpected response.'},
        'requirements': {'items': ['validation всегда 422',
                                   '401 и 403 различаются',
                                   'domain status получает стабильный code',
                                   'unexpected скрывает внутренние details'],
                         'names': ['source', 'status', 'public_message', 'details', 'request_id', 'code', 'message'],
                         'nodes': ['FunctionDef', 'If'],
                         'attributes': ['get']},
        'starter_code': 'def solve(source, status, public_message, details, request_id):\n'
                        '    # Нормализуйте ошибку\n'
                        '    pass\n',
        'tests': [{'name': 'validation',
                   'args': ['validation', 400, 'ignored', {'field': 'title'}, 'req-1'],
                   'expected': {'status': 422,
                                'error': {'code': 'validation_error',
                                          'message': 'Request validation failed',
                                          'details': {'field': 'title'},
                                          'request_id': 'req-1'}}},
                  {'name': 'unauthenticated',
                   'args': ['auth', 401, 'Not authenticated', None, 'req-2'],
                   'expected': {'status': 401,
                                'error': {'code': 'unauthenticated',
                                          'message': 'Not authenticated',
                                          'details': None,
                                          'request_id': 'req-2'}}},
                  {'name': 'domain not found',
                   'args': ['domain', 404, 'Course not found', None, 'req-3'],
                   'expected': {'status': 404,
                                'error': {'code': 'not_found',
                                          'message': 'Course not found',
                                          'details': None,
                                          'request_id': 'req-3'}}},
                  {'name': 'rate limit',
                   'args': ['rate_limit', 400, 'Too many requests', {'retry_after': 30}, 'req-4'],
                   'expected': {'status': 429,
                                'error': {'code': 'rate_limited',
                                          'message': 'Too many requests',
                                          'details': {'retry_after': 30},
                                          'request_id': 'req-4'}}},
                  {'name': 'unexpected',
                   'args': ['unexpected', 418, 'database password leaked', {'traceback': 'secret'}, 'req-5'],
                   'expected': {'status': 500,
                                'error': {'code': 'internal_error',
                                          'message': 'Internal server error',
                                          'details': None,
                                          'request_id': 'req-5'}}}],
        'reference_code': 'def solve(source, status, public_message, details, request_id):\n'
                          "    if source == 'validation':\n"
                          '        status = 422\n'
                          "        code = 'validation_error'\n"
                          "        message = 'Request validation failed'\n"
                          "    elif source == 'auth':\n"
                          '        status = 401 if status == 401 else 403\n'
                          "        code = 'unauthenticated' if status == 401 else 'forbidden'\n"
                          '        message = public_message\n'
                          "    elif source == 'rate_limit':\n"
                          '        status = 429\n'
                          "        code = 'rate_limited'\n"
                          '        message = public_message\n'
                          "    elif source == 'unexpected':\n"
                          '        status = 500\n'
                          "        code = 'internal_error'\n"
                          "        message = 'Internal server error'\n"
                          '        details = None\n'
                          '    else:\n'
                          '        codes = {\n'
                          "            400: 'bad_request',\n"
                          "            404: 'not_found',\n"
                          "            409: 'conflict',\n"
                          '        }\n'
                          "        code = codes.get(status, 'domain_error')\n"
                          '        message = public_message\n'
                          '    return {\n'
                          "        'status': status,\n"
                          "        'error': {\n"
                          "            'code': code,\n"
                          "            'message': message,\n"
                          "            'details': details,\n"
                          "            'request_id': request_id,\n"
                          '        },\n'
                          '    }\n'}]
}

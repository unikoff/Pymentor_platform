from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    105: [{'title': 'Разберите JWT и докажите роль подписи',
        'task': 'Создайте отдельный учебный script, который показывает header, payload и signature JWT. '
                'Декодирование без проверки подписи используется только для демонстрации и запрещено для '
                'authorization.',
        'steps': ['Создайте scripts/inspect_jwt.py.',
                  'Возьмите учебный JWT без реальных secrets и разделите строку по точкам на три части.',
                  'Через PyJWT прочитайте header и payload без проверки signature только в этом script.',
                  'Выведите список ключей payload, но не печатайте реальные tokens из application logs.',
                  'Проверьте, что payload содержит только sub, type, iat и exp.',
                  'Создайте второй token с изменённым sub, не пересчитывая корректную signature.',
                  'Попробуйте проверить оба tokens настоящим secret: исходный проходит, изменённый вызывает '
                  'InvalidTokenError.',
                  'Запишите в docs/jwt-observation.md: payload читаем, signature обнаруживает изменение, JWT не '
                  'шифрует секреты.',
                  'Добавьте test, запрещающий claims password, password_hash, api_key и secret.'],
        'result': 'Готово, если ученик показывает три части JWT, читает безопасные claims, доказывает отказ '
                  'изменённой подписи и не использует decode без verification в application code.'}],
    107: [{'title': 'Создайте access-token endpoint',
        'task': 'Реализуйте POST /api/v1/auth/token через OAuth2PasswordRequestForm, подпишите короткоживущий JWT и '
                'подключите Swagger Authorize.',
        'steps': ['Добавьте PyJWT и python-multipart в зависимости проекта.',
                  "Добавьте SECRET_KEY, JWT_ALGORITHM='HS256' и ACCESS_TOKEN_EXPIRE_MINUTES в settings и "
                  '.env.example без реального secret.',
                  'Создайте app/services/tokens.py.',
                  "Реализуйте create_access_token: копия data, claims sub, type='access', iat и exp, затем "
                  'jwt.encode.',
                  'Реализуйте decode_token с jwt.decode и единым преобразованием InvalidTokenError в authentication '
                  'error.',
                  "Создайте OAuth2PasswordBearer с tokenUrl='/api/v1/auth/token'.",
                  'Создайте POST /api/v1/auth/token с OAuth2PasswordRequestForm.',
                  'Используйте form.username как email и вызовите authenticate_user.',
                  "При ошибке верните 401, detail='Invalid credentials' и header WWW-Authenticate: Bearer.",
                  "При успехе верните access_token и token_type='bearer'.",
                  'Добавьте tests успешного token endpoint, неверного password и неизвестного email.',
                  'Декодируйте выданный token в test и проверьте sub, type, iat и exp.',
                  'Откройте Swagger, нажмите Authorize и выполните один защищённый request.'],
        'result': 'Готово, если endpoint принимает form-data, выдаёт подписанный access token, ошибки credentials '
                  'единообразны, Swagger Authorize работает, а real SECRET_KEY не попал в Git.'}],
    108: [{'title': 'Получите current user из access token',
        'task': 'Создайте dependency get_current_user_from_token и переведите protected CRUD на identity из JWT. '
                'user_id из body или query запрещено использовать как источник владельца.',
        'steps': ['Получите token через OAuth2PasswordBearer.',
                  'Вызовите decode_token с проверкой signature и expiration.',
                  "Проверьте claim type='access'. Refresh token не должен проходить как access.",
                  'Прочитайте sub, преобразуйте в user id и обработайте неверный формат единым 401.',
                  'Загрузите User из database и проверьте is_active.',
                  'Верните current User из dependency.',
                  'В POST /tasks устанавливайте user_id только из current_user.id.',
                  'В list/get/update/delete ограничивайте query current_user.id.',
                  'Игнорируйте либо запретите user_id в request schemas.',
                  'Добавьте tests: нет Authorization, неверная signature, expired token, refresh вместо access, '
                  'unknown user, inactive user и успешный request.',
                  'Добавьте test, где body содержит user_id другого человека; созданная Task всё равно принадлежит '
                  'current user.',
                  'Добавьте test, что пользователь не видит и не изменяет чужую Task.'],
        'result': 'Готово, если identity берётся только из проверенного access token, все invalid tokens дают 401, а '
                  'защищённый CRUD использует current_user.id и не доверяет клиентскому user_id.'}]
}

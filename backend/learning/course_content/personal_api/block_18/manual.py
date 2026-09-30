from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    99: [{'title': 'Проверьте полный lifecycle учебной cookie',
       'task': 'До server-side sessions создайте три изолированных endpoints, чтобы увидеть установку, '
               'автоматическую отправку и удаление cookie без хранения credentials.',
       'steps': ['Добавьте setting COOKIE_SECURE с отдельными значениями для development и production.',
                 'Создайте POST /api/v1/auth/cookie-demo.',
                 'Установите cookie studyhub_demo со случайным opaque value, max_age=900, httponly=True, '
                 "samesite='lax', secure из settings и path='/'.",
                 'Не помещайте user id, password, role или email в cookie value.',
                 'Создайте GET /api/v1/auth/cookie-demo, который читает Cookie studyhub_demo и возвращает только '
                 'present: true или false.',
                 'Создайте DELETE /api/v1/auth/cookie-demo и удалите cookie с тем же name и path.',
                 'Через один TestClient вызовите POST, затем GET без ручной передачи Cookie и проверьте '
                 'present=true.',
                 'Проверьте Set-Cookie: HttpOnly, SameSite=lax, Path=/ и Max-Age.',
                 'После DELETE повторите GET и проверьте present=false.',
                 'Добавьте test, что JSON endpoints не возвращает cookie value.',
                 'Удалите demo endpoints или явно пометьте их как учебные перед финальным проектом.'],
       'result': 'Готово, если TestClient автоматически переносит cookie между requests, DELETE очищает её, security '
                 'flags присутствуют, а value не содержит пользовательские данные и не возвращается в JSON.'}],
    100: [{'title': 'Создайте server-side AuthSession',
        'task': 'Добавьте database-модель session, в которой browser хранит только случайный session id, а user, '
                'expiration и revocation находятся на сервере.',
        'steps': ['Создайте app/models/auth_session.py.',
                  'Добавьте id: Mapped[str] как primary key для случайного token_urlsafe значения.',
                  "Добавьте user_id как ForeignKey('users.id'), nullable=False и index=True.",
                  'Добавьте created_at, expires_at и revoked_at, где revoked_at nullable.',
                  'Добавьте relationship user и обратную коллекцию sessions в User.',
                  'Создайте функцию generate_session_id через secrets.token_urlsafe(32).',
                  'Создайте factory create_session_record(user_id, now, lifetime_seconds), которая вычисляет '
                  'expires_at.',
                  'Создайте Alembic revision add auth sessions и примените её.',
                  'Проверьте columns, foreign key и indexes в SQLite.',
                  'Добавьте tests: два вызова generate_session_id дают разные непустые строки; expires_at позже '
                  'created_at; foreign key не принимает неизвестного user_id.',
                  'Не выводите session id в logs и не возвращайте его в обычной response schema.'],
        'result': 'Готово, если AuthSession хранит owner, expiration и revocation, migration воспроизводима, session '
                  'ids случайны и уникальны, а browser ещё не получает password или user data.'}],
    101: [{'title': 'Реализуйте session login',
        'task': 'Создайте POST /api/v1/auth/session/login. Endpoint проверяет credentials, создаёт новую AuthSession '
                'и устанавливает HttpOnly cookie.',
        'steps': ['Создайте SessionLogin с email и password.',
                  'Нормализуйте email и вызовите authenticate_user.',
                  "Для любой ошибки credentials верните одинаковый HTTP 401 с detail='Invalid credentials'.",
                  'При успехе создайте новый session id и AuthSession с установленным lifetime.',
                  'Выполните commit до установки успешной cookie.',
                  "Установите cookie studyhub_session с session id, httponly=True, samesite='lax', secure из "
                  "settings, max_age и path='/'.",
                  "Верните безопасный UserRead либо JSON message='Logged in'.",
                  'Повторный login того же пользователя должен создать вторую session row, а не переиспользовать '
                  'предыдущую.',
                  'Добавьте test 200/201 успешного login и проверьте запись AuthSession.',
                  'Добавьте tests неверного password и неизвестного email; status и detail должны совпадать.',
                  'Проверьте Set-Cookie flags и отсутствие session id в JSON.',
                  'Добавьте test двух последовательных login и убедитесь, что session ids различаются.'],
        'result': 'Готово, если правильные credentials создают новую server-side session и безопасную cookie, ошибки '
                  'не позволяют перечислять email, а повторный login создаёт отдельное устройство.'}],
    102: [{'title': 'Получите current user из session cookie',
        'task': 'Создайте dependency get_current_user_from_session и защитите GET /api/v1/users/me. Dependency '
                'должна проверять cookie, session row, expiration, revocation и active User.',
        'steps': ['Создайте отдельную dependency utc_now, чтобы tests могли управлять временем.',
                  'Прочитайте cookie studyhub_session через Cookie(default=None).',
                  "Если cookie отсутствует, верните HTTP 401 с detail='Not authenticated'.",
                  'Найдите AuthSession по id вместе с User.',
                  'Если row отсутствует, revoked_at не None или expires_at не позже now, верните тот же 401.',
                  'Если User is_active=False, верните тот же 401.',
                  'Верните ORM User из dependency.',
                  'Создайте GET /api/v1/users/me с response_model=UserRead.',
                  'Добавьте test без cookie.',
                  'Добавьте test valid session и проверьте безопасный UserRead.',
                  'Добавьте tests unknown session id, expired session, revoked session и inactive user.',
                  'Через dependency override подменяйте utc_now, а не используйте sleep.',
                  'Проверьте, что password_hash и session id отсутствуют в response и error detail.'],
        'result': 'Готово, если /users/me доступен только через действующую session, все invalid cases дают один '
                  '401, время контролируется test dependency, а секретные поля не выдаются.'}]
}

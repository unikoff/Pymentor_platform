from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    95: [{'title': 'Добавьте User, безопасные schemas и первую связь с Task',
       'task': 'Расширьте database schema пользователем. Входная схема принимает password, ORM хранит только '
               'password_hash, а response schema никогда не содержит ни password, ни password_hash.',
       'steps': ['Создайте app/models/user.py и объявите User с таблицей users.',
                 'Добавьте id как primary key, email с String(320), unique=True и index=True, username с String(80), '
                 "password_hash с nullable=False, is_active с default=True и role с default='user'.",
                 'Добавьте created_at с server_default=func.now().',
                 "В Task добавьте nullable user_id с ForeignKey('users.id') и relationship owner. Nullable "
                 'сохраняется временно, чтобы существующие development rows не сломали migration.',
                 'Создайте UserCreate с email, username и password. Добавьте минимальную длину password 8 символов.',
                 'Создайте UserRead с id, email, username, is_active и role. Включите from_attributes.',
                 'Не добавляйте password_hash в UserRead и не переиспользуйте ORM-модель как response_model.',
                 'Создайте Alembic revision add users and task owner, вручную проверьте upgrade и downgrade.',
                 'Выполните alembic upgrade head на development database.',
                 'Создайте ORM User с временным тестовым hash и свяжите новую Task через owner.',
                 'Добавьте test, который сериализует UserRead и проверяет отсутствие ключей password и '
                 'password_hash.',
                 'Добавьте test на уникальность email и зафиксируйте выбранный status для будущего registration '
                 'endpoint.'],
       'result': 'Готово, если users и nullable tasks.user_id существуют после migration, UserRead выдаёт только '
                 'безопасные поля, а test доказывает отсутствие password_hash в response.'}],
    96: [{'title': 'Создайте password service на готовом Argon2',
       'task': 'Реализуйте хеширование через поддерживаемую библиотеку. Свой SHA, md5, salt-конкатенация или '
               'обратимое шифрование запрещены.',
       'steps': ['Добавьте зависимость pwdlib[argon2] в файл зависимостей проекта.',
                 'Создайте app/services/passwords.py.',
                 'Создайте один PasswordHash через PasswordHash.recommended().',
                 'Реализуйте hash_password(password: str) -> str через password_hash.hash.',
                 'Реализуйте verify_password(password: str, stored_hash: str) -> bool через password_hash.verify.',
                 'Создайте DUMMY_HASH при импорте сервиса для одинакового пути проверки отсутствующего пользователя '
                 'в следующем занятии.',
                 "Напишите test: hash_password('correct horse') не равен исходному password.",
                 'Напишите test: два hash одного password могут отличаться, но оба проходят verify_password.',
                 'Напишите test: правильный password возвращает True, неправильный — False.',
                 'Проверьте, что hash, password и DUMMY_HASH не попадают в application logs.',
                 'Создайте Git-коммит feat: add Argon2 password service.'],
       'result': 'Готово, если plaintext нигде не сохраняется, два salted hash проходят проверку одного password, '
                 'неверный password отклоняется, а сервис использует готовую password library.'}],
    97: [{'title': 'Реализуйте безопасную регистрацию',
       'task': 'Создайте POST /api/v1/auth/register. Endpoint должен нормализовать email, хешировать password до ORM '
               'и возвращать только UserRead.',
       'steps': ['Создайте auth router с prefix /api/v1/auth и tag auth.',
                 'В UserCreate используйте EmailStr, username с min_length=3 и password с min_length=8.',
                 'Перед поиском и сохранением выполните email.strip().lower().',
                 'Проверьте существование email через SELECT или EXISTS.',
                 "Для существующего email верните HTTP 409 с detail='Email already registered'.",
                 'Вызовите hash_password и создайте User только с password_hash.',
                 'Выполните add, commit и refresh внутри try.',
                 'Перехватите IntegrityError, выполните rollback и также верните 409.',
                 'Верните status 201 и response_model=UserRead.',
                 'Добавьте test успешной регистрации: status 201, нормализованный email, integer id, role user.',
                 'Добавьте test, что JSON не содержит password и password_hash.',
                 'Добавьте tests на invalid email, короткий password и duplicate email.',
                 'Новой Session проверьте, что database хранит hash, а не исходный password.'],
       'result': 'Готово, если registration возвращает безопасный 201, invalid input даёт 422, duplicate email даёт '
                 '409, rollback выполняется, а plaintext password отсутствует в database и response.'}]
}

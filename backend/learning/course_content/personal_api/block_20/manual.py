from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    111: [{'title': 'Добавьте отдельные HTTP Basic и API key примеры',
        'task': 'Создайте два небольших endpoints, чтобы сравнить стандартные security schemes. Они не заменяют '
                'пользовательский session/JWT flow.',
        'steps': ['Добавьте BASIC_DEMO_USERNAME, BASIC_DEMO_PASSWORD и INTERNAL_API_KEY в settings и .env.example '
                  'без реальных production значений.',
                  'Создайте HTTPBasic dependency для GET /api/v1/examples/basic.',
                  'Сравнивайте username и password через secrets.compare_digest.',
                  'При ошибке Basic верните 401 и WWW-Authenticate: Basic.',
                  "Создайте APIKeyHeader(name='X-API-Key', auto_error=False).",
                  'Защитите POST /api/v1/internal/import-check.',
                  'При отсутствующем или неверном key верните 403 с одинаковым detail.',
                  'Не принимайте API key через query-параметр и не выводите его в logs.',
                  'Добавьте tests для отсутствующих, неверных и корректных Basic credentials.',
                  'Добавьте tests для отсутствующего, неверного и корректного X-API-Key.',
                  'Проверьте OpenAPI: обе schemes отображаются отдельно от OAuth2 bearer.',
                  'В README объясните, что Basic повторяет credentials в каждом request, API key предназначен для '
                  'служебного клиента, а user JWT остаётся основным flow.'],
        'result': 'Готово, если оба endpoints имеют отдельные OpenAPI security schemes, секреты сравниваются '
                  'безопасно и не передаются через URL, а основной auth flow проекта не изменён.'}],
    112: [{'title': 'Загрузите безопасный avatar через multipart',
        'task': 'Создайте POST /api/v1/users/me/avatar через Form и UploadFile. Файл принадлежит current user, имеет '
                'ограниченный content type и размер, а пользовательское filename не используется как путь.',
        'steps': ['Добавьте python-multipart в зависимости, если он ещё не установлен.',
                  'Создайте папку data/uploads/avatars через startup preparation или отдельную функцию storage.',
                  'Добавьте AvatarUpload ORM-модель либо поля avatar_path, avatar_content_type и avatar_size в User '
                  'через Alembic revision.',
                  'Создайте endpoint с current_user dependency, UploadFile и необязательным Form description.',
                  'Разрешите только image/jpeg и image/png.',
                  'Установите максимальный размер 2 MiB.',
                  'Читайте upload.file порциями по 64 KiB и остановите запись сразу после превышения лимита.',
                  'Генерируйте server filename через uuid и расширение из разрешённого content type.',
                  'Никогда не соединяйте uploads directory с upload.filename.',
                  'При неверном content type верните 415, при превышении размера — 413.',
                  'Сохраняйте в database только относительный path, content type, size и owner id.',
                  'Добавьте tests успешного PNG, запрещённого text/plain, файла больше лимита и filename '
                  "'../../secret.txt'.",
                  'После tests удаляйте временные files и используйте отдельную uploads directory.'],
        'result': 'Готово, если valid avatar сохраняется под server-generated именем, path traversal не влияет на '
                  'путь, invalid type даёт 415, oversized file — 413, а metadata связана с current user.'}],
    113: [{'title': 'Спроектируйте финальный Personal StudyHub API',
        'task': 'До финальной реализации зафиксируйте HTTP-контракт, database schema, trust boundaries и единый '
                'формат ошибок. Код следующих занятий должен следовать этому документу.',
        'steps': ['Создайте docs/personal-studyhub-contract.md.',
                  'Составьте таблицу endpoints для registration, session login/logout, access token, refresh, '
                  'profile, protected tasks, admin users и avatar upload.',
                  'Для каждого endpoint укажите method, path, request type, success status, response schema и '
                  'ожидаемые ошибки.',
                  'Зафиксируйте prefix /api/v1 и OpenAPI tags auth, users, tasks, admin и files.',
                  'Нарисуйте ER-схему User, Task, Category, AuthSession, RefreshToken и AvatarUpload.',
                  'Для каждой связи укажите foreign key, nullable, unique и выбранное поведение удаления.',
                  'Нарисуйте cookie-session flow и JWT access/refresh flow.',
                  'Зафиксируйте единый error JSON, например code, detail и request_id.',
                  'Составьте threat checklist: password leak, secret in Git, token in logs, user_id from client, '
                  'path traversal, missing rollback и чужая Task.',
                  'Составьте дерево app/routers, schemas, models, services, dependencies, crud, database, config и '
                  'tests.',
                  'Проведите review документа: каждый endpoint должен иметь owner или role rule.',
                  'Создайте Git-коммит docs: design Personal StudyHub API.'],
        'result': 'Готово, если по одному документу можно реализовать весь API без догадок о path, status, schema, '
                  'owner rule и error format, а threat checklist связан с конкретными tests.'}],
    114: [{'title': 'Соберите database, schemas и auth services на чистой базе',
        'task': 'Реализуйте инфраструктурную основу финального проекта без endpoint-логики. Чистая database должна '
                'подниматься только через Alembic.',
        'steps': ['Приведите settings к одному объекту: DATABASE_URL, COOKIE settings, JWT settings, API key и '
                  'uploads directory.',
                  'Проверьте .env.example и .gitignore; реальные secrets и data files не должны попадать в Git.',
                  'Соберите общий Base и models User, Task, Category, AuthSession, RefreshToken и AvatarUpload.',
                  'Добавьте все foreign keys, unique constraints и indexes из контракта.',
                  'Создайте или исправьте Alembic revisions так, чтобы upgrade head строил schema с нуля.',
                  'Создайте Pydantic schemas для auth, users, tasks, tokens, errors и uploads.',
                  'Реализуйте password service, session service и token service.',
                  'Реализуйте dependencies get_db, current user через session, current user через access token и '
                  'require_admin.',
                  'Создайте domain exceptions DuplicateEmail, InvalidCredentials, NotAuthenticated, PermissionDenied '
                  'и ResourceNotFound.',
                  'Удалите development database и выполните alembic upgrade head.',
                  'Запустите tests моделей и services без FastAPI routes.',
                  'Проверьте downgrade до base и повторный upgrade head на disposable database.',
                  'Создайте Git-коммит feat: build Personal StudyHub foundation.'],
        'result': 'Готово, если чистая база получает полную schema через migrations, services проходят unit tests, '
                  'dependencies импортируются без циклов, а secrets отсутствуют в repository.'}],
    115: [{'title': 'Соберите routes, error handlers и полный security test suite',
        'task': 'Подключите все routes к подготовленной основе и докажите безопасность через TestClient с отдельной '
                'SQLite database и dependency overrides.',
        'steps': ['Подключите auth, users, tasks, admin и files routers под /api/v1.',
                  'Реализуйте registration, session login/logout, token login, refresh, profile и protected task '
                  'CRUD.',
                  'Реализуйте admin endpoint и avatar upload по утверждённому контракту.',
                  'Добавьте exception handlers, которые переводят domain exceptions в единый error JSON.',
                  'Создайте test engine и SessionFactory для отдельного временного SQLite file.',
                  'Переопределите get_db и clock dependencies через app.dependency_overrides.',
                  'Создайте fixtures app, client, db_session, user_factory, session_login и token_login.',
                  'Напишите полный успешный сценарий registration → login → create Task → read → update → delete.',
                  'Напишите tests: duplicate email, wrong password, no cookie, expired session, invalid JWT, expired '
                  'access, refresh rotation и revoked refresh.',
                  'Напишите tests двух пользователей: Bob не читает, не изменяет и не удаляет Task Alice.',
                  'Напишите tests role: user получает 403, admin получает 200.',
                  'Напишите upload tests на type, size и unsafe filename.',
                  'Проверьте, что responses и logs не содержат password_hash, session id, refresh token, SECRET_KEY '
                  'и API key.',
                  'Запустите pytest -q два раза подряд и исправьте любую зависимость от порядка tests.'],
        'result': 'Готово, если все routes соответствуют контракту, security failures имеют точные statuses, два '
                  'последовательных запуска tests зелёные, а test database и uploads изолированы.'}],
    116: [{'title': 'Выпустите Personal StudyHub API v3.0.0',
        'task': 'Проведите финальную приёмку пятого курса из чистого clone. Новые возможности не добавляются: '
                'проверяются воспроизводимость, безопасность, документация и способность объяснить решения.',
        'steps': ['Клонируйте repository в новую временную директорию.',
                  'Создайте virtual environment и установите зависимости только по README.',
                  'Создайте .env из .env.example и сгенерируйте новые local secrets.',
                  'Выполните alembic upgrade head на пустой SQLite database.',
                  'Запустите API командой из README и откройте /docs.',
                  'Импортируйте Postman collection либо выполните эквивалентный Swagger-сценарий.',
                  'Зарегистрируйте Alice и Bob.',
                  'Проверьте session login/logout Alice и GET /users/me.',
                  'Получите access и refresh tokens Bob, выполните refresh rotation и убедитесь, что старый refresh '
                  'отклоняется.',
                  'Создайте Task Alice и докажите, что Bob не может её прочитать, обновить или удалить.',
                  'Проверьте admin endpoint обычным user и admin.',
                  'Загрузите valid avatar и проверьте ошибки 415 и 413.',
                  'Запустите pytest -q два раза.',
                  'Обновите README: архитектура, migrations, settings, session flow, JWT flow, uploads, tests и '
                  'security decisions.',
                  'Добавьте docs/security-checklist.md с фактическими результатами проверки secrets, ownership, '
                  'cookies, tokens, files и error responses.',
                  'Проверьте git status, создайте commit release: Personal StudyHub API.',
                  'Создайте tag v3.0.0 и GitHub Release с demo-сценарием и списком ограничений.',
                  'Проведите устную защиту: 401 против 403, cookie против session, access против refresh, ownership, '
                  'password hashing и test isolation.'],
        'result': 'Готово, если новый разработчик поднимает проект по README, migration создаёт schema с нуля, '
                  'session и JWT flows работают, чужие данные защищены tests, uploads безопасны, repository чист, а '
                  'Release v3.0.0 опубликован.'}]
}

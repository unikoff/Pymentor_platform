# C1.1.2 — Core regression baseline до контейнеризации

Снимок выполнен 27.10.2026 на текущем рабочем дереве после C1.1.1. Это baseline checkout, а не утверждение о deployed/production состоянии. Тест использует реальные FastAPI auth/course routers и живой каталог материалов, но создаёт собственное приложение без импорта `main.py`, `ensure_schema()`, frontend mount и app lifespan.

## Воспроизведение и границы изоляции

Из корня репозитория в PowerShell:

```powershell
$env:PYTHONPATH = (Resolve-Path backend).Path
$env:PYMENTOR_LOCAL_NOTIFICATIONS = "0"
$env:PYMENTOR_PUBLIC_RUNNER_ENABLED = "1" # только изолированный локальный тест legacy Runner
.\.venv\Scripts\python.exe -m unittest backend.tests.test_core_baseline -v
```

После C1.1.5 выполнение по умолчанию отключено. Явное включение выше необходимо только для воспроизведения исторического baseline в контролируемой среде; оно не подтверждает безопасность публичного исполнения.

Схема поднимается в отдельном SQLite `sqlite://` с `StaticPool` (только в памяти), создаётся через текущую `Base.metadata`; fixture добавляет синтетического пользователя и синтетические записи прогресса. `get_db` и `SessionLocal` course service привязаны только к этой БД. Никакие данные из `backend/test.db`, другой настроенной БД, Redis или production не читаются. Уведомительный lifecycle не запускается; переменная отключения дополнительно выставлена в команде. После теста engine закрывается.

Каталог и public IDs берутся из исходных материалов текущего checkout, а не из пользовательской БД. Выбирается один курс, содержащий смешанный урок `chapter_02/block_05` с ручной и редакторской практикой. Пользователь `Synthetic Baseline Student`, `baseline.student@example.test` и пароль в тесте вымышлены; подписка синтетически действует 30 дней. В тесте уже есть completed lesson и последняя успешная версия другой task, чтобы проверить сохранность начального прогресса.

Модели `UserLessonProgress` и `UserTaskProgress` хранят состояние завершения и последнюю зачтённую ревизию; отдельной модели/таблицы истории попыток ученика среди текущих ORM-моделей нет. Поле `attempts` имеется у `BookingNotificationOutbox` и считает retry доставки уведомления, а не отправки решения. Поэтому fixture не выдаёт `UserTaskProgress` за журнал всех отправок. Повторные/неуспешные попытки ученика как история не фиксируются этим baseline.

**Ограничение обычного sandbox:** runner пишет дочерний скрипт во временный каталог и запускает отдельный Python-процесс. Обычная среда может запрещать запись во временный каталог (`PermissionError: [Errno 13]`, `runner_io_failed errno=13`). Smoke вызывает настоящий `/learning/tasks/{task_id}/submit` и настоящий `run_python_task` с безопасным конечным решением без import/filesystem/process/network/eval; никакой исполняющий stub не используется. На 27.10.2026 smoke выполнен с разрешением sandbox: весь flow и настоящий Runner прошли. Runner также сообщил на Windows, что OS memory/CPU limits недоступны; сценарий проверяет только короткое детерминированное решение и не доказывает security sandbox или защиту от ресурсоёмкого кода.

## HTTP/OpenAPI и response fixtures

OpenAPI строится с текущих auth/course routers. Релевантный стабильный контракт сохранён в [core-baseline-openapi.json](core-baseline-openapi.json): OpenAPI version/info, операции login/me/logout, каталог, материал урока, manual-practice answer, complete, code submit и schemas их router app. Тест сравнивает этот срез целиком; `/user/refresh` отдельно проверяется как отсутствующий. Полные нецелевые endpoints сюда не входят.

Обезличенные HTTP fixtures сохранены в [core-baseline-responses.json](core-baseline-responses.json). Они включают статусы, `content-type`, форму `Set-Cookie` и стабильные тела ответов: неавторизованный `/me`, login, выбранный курс целиком в каталоге до/после, lesson, ручной разбор, реальный submit результата runner, stale revision error, явное завершение и logout. В каталожной фикстуре сохраняется выбранный курс и его навигационные записи, а не все остальные курсы. Временные значения заменены на маркеры: ID синтетического пользователя, UTC срок подписки, session cookie token и время `Expires`; public course IDs/content revision и учебные ответы остаются конкретными для сравнения.

| Запрос | Проверенный статус | Форма ответа / наблюдаемое поведение |
| --- | ---: | --- |
| `GET /openapi.json` | 200 | JSON OpenAPI; присутствуют auth login/logout, каталог, урок, manual-practice answer, code submit. `/user/refresh` отсутствует. |
| `GET /user/me` без cookie | 401 | `{"detail":"No session token found"}`. |
| `POST /user/login` | 200 | `{"message":"Login successful","user":{"id","username","email","subscription_until","subscription_plan","has_active_subscription","is_admin"}}`. Успех ставит `session` cookie с `HttpOnly`, `SameSite=Lax`, `Max-Age=2592000`; Secure не выставляется этим обработчиком. В baseline `subscription_until` сериализуется ISO 8601 с UTC `+00:00`. |
| `GET /learning/catalog` | 200 | `{"tracks":[...],"courses":{track_id:[lesson_summary...]},"default_track":...,"content_revision":...}`. Элемент урока включает навигационные поля, `is_available`, `locked_reason`, `completed`; содержимое урока не включено. |
| `GET /learning/lessons/{lesson_id}` | 200 | `{"lesson":{...}}`; материал сохраняет public lesson ID, доступную теорию/практику и признаки доступа/прогресса. |
| `GET /learning/lessons/{lesson_id}/manual-practice/0/tasks/0/answer` | 200 | `{"answer":{"explanation","steps",...}}`; разбор запрашивается явно, не включается автоматически в каталог. |
| `POST /learning/tasks/{task_id}/submit` с текущей `task_revision` | 200 | `CodeSubmitResponse`: `ok`, `score`, `tests`, `stdout` и nullable `stderr/error/traceback`. Проверка решения может вернуть `ok:false` внутри HTTP 200; устаревшая ревизия — HTTP 409. Успешная отправка смешанного урока сама по себе его не завершает. |
| `POST /learning/lessons/{lesson_id}/complete` для урока с `self_check` | 200 | `{"lesson_id":"<public-id>","completed":true}`. После этого `GET /learning/catalog` показывает `completed:true`. |
| `POST /user/logout` | 200 | `{"message":"Logout successful"}`; запись сессии удаляется, cookie очищается (`session=""`, `Max-Age=0`), следующий `/user/me` возвращает 401. |

В наблюдавшейся последовательности API ответов 3xx/redirect не было. ASGI harness сохраняет статус и headers напрямую, не следует redirect автоматически. SPA fallback и браузерная навигация в этот baseline не входят.

Ошибки, закреплённые smoke: отсутствующая сессия — 401 с `detail`; устаревшая ревизия задания — 409 с `detail` и не доходит до исполнения runner. Вызовы `/me` после logout также возвращают 401. Текущие роутеры возвращают `detail` для 404 неизвестных урока/курса и 403 закрытого урока; эти ветви не входят в response fixture.

## SQLite fixture: данные, IDs и timestamps

- Все персональные поля синтетические; адрес использует зарезервированный `.test`.
- Прогресс ссылается на public `lesson_id` и `task_id`/`task_revision` из текущего каталога; значения не генерируются из реальных аккаунтов.
- Фиксированный timestamp seed для прогресса: `2026-01-02T03:04:05+00:00`. Поля ORM используют SQLAlchemy `DateTime(timezone=True)` или SQLite `server_default=func.now()`; SQLite может вернуть сохранённый timestamp без tzinfo. При сериализации пользователя сервис нормализует подписку к UTC и выдаёт ISO 8601. Каталог не публикует `completed_at`; он возвращает boolean progress.
- Действующая подписка нужна только чтобы сценарий мог открыть premium course; это искусственное значение, не отражающее срок подписки реального пользователя.

## Smoke flow и UX ожидания

Один тест выполняет: OpenAPI/schema → неавторизованный `/me` → login и cookie → каталог → урок → запрос разбора ручной практики → безопасный code-submit с точной ревизией → явное завершение mixed-practice урока → повторный каталог и чтение SQLite progress → logout и повторный `/me`.

API-контракт задаёт ожидаемое поведение: после login доступна cookie-сессия; каталог сообщает завершение булевым полем; lesson body загружается отдельно; разбор решения запрашивается явно; code-submit отдаёт `score/tests` и отделяет `ok:false` от HTTP error; mixed manual+editor урок требует отдельного self-check действия. При logout сессия удаляется. **Browser UX не проверялся:** тексты и визуальные состояния UI, загрузки, навигация и браузерные redirects этим baseline не подтверждены.

После успешного submit для этого mixed lesson сервис намеренно не создаёт ни `UserTaskProgress`, ни `UserLessonProgress`; успешность задачи отображается в ответе, но для lesson completion требуется `/complete`. Автоматический тест зафиксировал это различие и последующую фиксацию lesson progress после explicit completion.

## Фактические проверки

Команда выше выполнена с разрешением sandbox 27.10.2026: `Ran 1 test ... OK`; настоящий runner вернул все проверки, HTTP submit и progress flow прошли. В обычном sandbox runner может завершиться EACCES до исполнения кода, поэтому эту команду для полного smoke следует запускать с разрешением записи/дочернего процесса. Полный `backend/tests` не запускался: scope baseline узкий.

Чтобы намеренно переснять response fixture после принятого изменения контракта, установить `$env:PYMENTOR_CAPTURE_CORE_FIXTURES = "1"` перед командой выше. В этом режиме test перезаписывает `core-baseline-responses.json`; OpenAPI fixture следует обновить отдельно только после review изменённого schema.

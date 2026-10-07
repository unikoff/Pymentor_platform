from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    81: [{'title': 'Реализуйте два SELECT-контракта',
       'task': 'Добавьте чтение списка и одной задачи через SQLAlchemy statements. Не загружайте все rows ради '
               'поиска одного id.',
       'steps': ['Создайте GET /tasks с response_model=list[TaskRead].',
                 'Соберите statement = select(Task).order_by(Task.id).',
                 'Получите список через session.scalars(statement).all().',
                 'Создайте GET /tasks/{task_id}.',
                 'Получите одну row через session.get(Task, task_id) либо SELECT с WHERE.',
                 "При отсутствии Task поднимите HTTPException со status 404 и detail='Task not found'.",
                 'Создайте три задачи и проверьте стабильный порядок списка.',
                 'Проверьте существующий id и отсутствующий id.',
                 'Добавьте TestClient-тесты на 200 list, 200 item и 404 item.'],
       'result': 'Готово, если список стабильно отсортирован, item endpoint делает адресный запрос, а неизвестный id '
                 'возвращает точный 404.'}],
    82: [{'title': 'Проведите Task через полный database CRUD',
       'task': 'Реализуйте create, read, update и delete поверх одной ORM-модели. Каждый endpoint должен иметь '
               'честный request и response contract.',
       'steps': ['Сохраните работающие POST, GET list и GET item.',
                 'Создайте TaskUpdate с необязательными title, priority и is_done.',
                 'Добавьте PATCH /tasks/{task_id}.',
                 'Найдите Task через session.get; при отсутствии верните 404.',
                 'Получите только переданные поля через model_dump(exclude_unset=True) и измените ORM object.',
                 'Выполните commit и refresh, затем верните TaskRead.',
                 'Добавьте DELETE /tasks/{task_id} со status 204.',
                 'После session.delete(task) выполните commit и верните Response(status_code=204).',
                 'Проверьте цепочку POST → GET → PATCH → GET → DELETE → GET 404.',
                 'Добавьте тест, что успешный DELETE не содержит JSON body.'],
       'result': 'Готово, если одна задача проходит полную CRUD-цепочку, PATCH не стирает непереданные поля, а '
                 'DELETE 204 не возвращает тело.'}],
    83: [{'title': 'Соберите динамический WHERE',
       'task': 'Расширьте GET /tasks необязательными фильтрами. Каждый WHERE должен добавляться только при реально '
               'переданном query-параметре.',
       'steps': ['Добавьте is_done: bool | None = None.',
                 'Добавьте min_priority: int | None с ограничением ge=1 и le=5.',
                 'Добавьте title_contains: str | None = None.',
                 'Начните с statement = select(Task).',
                 'При is_done is not None добавьте Task.is_done == is_done.',
                 'При min_priority is not None добавьте Task.priority >= min_priority.',
                 'При непустом title_contains добавьте case-insensitive фильтр по title.',
                 'В конце добавьте стабильный order_by(Task.id).',
                 'Создайте минимум пять rows с разными значениями.',
                 'Проверьте запрос без фильтров, каждый фильтр отдельно и комбинацию трёх фильтров.',
                 'Добавьте pytest parametrization для ожидаемых ids.'],
       'result': 'Готово, если отсутствие параметра не создаёт скрытый WHERE, каждый фильтр работает отдельно, а '
                 'комбинация возвращает пересечение условий.'}],
    84: [{'title': 'Добавьте безопасную сортировку и pagination',
       'task': 'GET /tasks должен возвращать стабильные страницы и не принимать произвольное имя SQL-column.',
       'steps': ['Добавьте sort_by со значениями id, title, priority и created_at.',
                 'Создайте явный словарь sort_columns, который сопоставляет разрешённую строку ORM-column.',
                 'Добавьте order со значениями asc и desc.',
                 'Добавьте limit с ge=1, le=50 и offset с ge=0.',
                 'Сначала добавьте выбранную сортировку, затем Task.id как tie-breaker.',
                 'После order_by примените offset и limit.',
                 'Создайте семь задач, включая одинаковые priority.',
                 'Запросите страницы offset=0, limit=3 и offset=3, limit=3 при одном sort order.',
                 'Проверьте, что ids не повторяются между страницами.',
                 'Отправьте неизвестный sort_by и limit=500; API должен вернуть 422 либо безопасный явно описанный '
                 'fallback.'],
       'result': 'Готово, если pagination воспроизводима при повторных requests, равные значения имеют tie-breaker, '
                 'а пользователь не может подставить произвольный SQL-текст.'}],
    85: [{'title': 'Получите COUNT, EXISTS и подготовьте uniqueness',
       'task': 'Добавьте database-вопросы, которые не загружают весь список ORM-объектов, и подготовьте конфликт '
               'уникального значения на disposable database.',
       'steps': ['Создайте GET /tasks/stats.',
                 'Получите count_open через select(func.count()).select_from(Task).where(Task.is_done.is_(False)).',
                 'Добавьте query-параметр title и вычислите exists_title через select(exists().where(...)).',
                 'Верните JSON count_open и exists_title.',
                 'Добавьте в Task поле slug: Mapped[str] с unique=True и nullable=False.',
                 'Так как Alembic ещё не изучен, не изменяйте рабочую database молча.',
                 'Создайте отдельную disposable SQLite database только для этого упражнения и materialize schema '
                 'через create_all.',
                 'Вставьте две rows с одинаковым slug и зафиксируйте IntegrityError.',
                 'Добавьте тест, что stats использует scalar database queries и возвращает точные значения.',
                 'Запишите в docs/schema-change-problem.md, почему рабочая существующая database не получила новую '
                 'column автоматически.'],
       'result': 'Готово, если COUNT и EXISTS возвращаются без загрузки всех Task, дубликат slug блокируется на '
                 'disposable database, а проблема изменения существующей schema сформулирована до Alembic.'}],
    86: [{'title': 'Обработайте IntegrityError и восстановите Session',
       'task': 'Превратите конфликт unique constraint в управляемый HTTP 409. После ошибки та же dependency должна '
               'завершить request корректно, а следующая операция должна работать.',
       'steps': ['В операции создания поместите session.commit() в try.',
                 'Перехватите только sqlalchemy.exc.IntegrityError.',
                 'В except обязательно выполните session.rollback().',
                 "Поднимите HTTPException(status_code=409, detail='Task slug already exists').",
                 'Не перехватывайте Exception целиком.',
                 'Создайте первую задачу со slug repeat.',
                 'Повторите POST с тем же slug и проверьте 409.',
                 'Сразу после конфликта создайте задачу с другим slug.',
                 'Проверьте, что второй корректный POST возвращает 201.',
                 'Добавьте TestClient-тест на последовательность 201 → 409 → 201.',
                 'Добавьте отдельный unit-test, который подтверждает вызов rollback при IntegrityError.'],
       'result': 'Готово, если conflict возвращает точный 409, rollback выполняется, а следующая корректная '
                 'transaction не получает PendingRollbackError.'}]
}

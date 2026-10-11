from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    100: [
        {
            "title": "Безопасная граница отказа БД",
            "task": "SQL-only Planner распознаёт выбранную недоступность SQLite, сообщает о ней безопасно в API и CLI и сохраняет прежние ответы для предметных ошибок.",
            "tasks": [
                {
                    "title": "1. Проследите путь исключения",
                    "task": "SQL-only Planner использует одну фабрику Session в API и CLI. Карта потока показывает, где открывается Session, где завершается транзакция и какой слой владеет SQL-классификацией. В ней отдельно отмечены существующие ответы для неверного ввода и отсутствующей задачи.",
                    "requirements": [
                        "Карта включает app/DBase/session.py, app/core/dependencies.py, app/main.py, app/api.py и границу команды CLI.",
                        "API и CLI используют SQLAlchemy Session для SQLite; JSON-backend и JSON-fallback отсутствуют.",
                        "Неверный HTTP-ввод сохраняет 422, отсутствующий id сохраняет 404 через TaskNotFoundError.",
                        "SQL-причина классифицируется в DBase/resource-границе; отсутствие таблицы и IntegrityError остаются отдельными случаями."
                    ],
                    "hint": "Проследите исключение от маршрута или команды к фабрике Session и обратно.",
                    "answer": {
                        "explanation": "API получает Session через get_db, CLI строит сервис в sql_service_context, а изменения используют db.begin. После занятия 99 остался TaskNotFoundError, но StorageError удалён вместе с JSON-backend.",
                        "analysis": [
                            "Неверный ввод сохраняет 422, отсутствующая задача 404.",
                            "DBase видит SQLAlchemy-обёртку и исходную ошибку драйвера.",
                            "Только SQLITE_CANTOPEN станет StorageError; прочие ошибки останутся внутренними."
                        ],
                        "steps": [
                            "Откройте app/errors.py, app/DBase/session.py и app/core/dependencies.py.",
                            "Проследите get_planner до репозитория и db.begin.",
                            "Сверьте API и CLI точки, где заканчивается Session."
                        ],
                        "checks": ["Нет общего перехвата Exception.", "JSON-fallback не возвращён."]
                    }
                },
                {
                    "title": "2. Верните StorageError и классификатор",
                    "task": "Общая SQL resource-граница закрывает Session при каждом исходе. Только OperationalError с исходным кодом SQLITE_CANTOPEN после завершения очистки становится StorageError; остальные ошибки сохраняют исходный тип.",
                    "requirements": [
                        "Классификатор читает error.orig.sqlite_errorcode, не текст исключения.",
                        "Одна sql_session_scope охватывает SELECT, flush и commit в API и CLI.",
                        "При ошибке до завершения транзакции rollback и close происходят до StorageError.",
                        "Другие ошибки пробрасываются без изменения."
                    ],
                    "hint": "Сохраним сессию открытой на время yield, а перевод StorageError выполним после finally с db.close().",
                    "answer": {
                        "explanation": "Операция сервиса выходит из db.begin до обработки исключения resource-границей. Для выбранного кода мы явно откатываем Session, закрываем её в finally и только после close поднимаем StorageError с исходной причиной.",
                        "steps": [
                            "Мы добавляем StorageError рядом с TaskNotFoundError.",
                            "Мы импортируем sqlite3, contextmanager, Iterator и OperationalError.",
                            "Затем сравниваем исходный sqlite_errorcode с sqlite3.SQLITE_CANTOPEN.",
                            "При совпадении поднимаем StorageError from error; для остальных причин сохраняем обычный raise."
                        ],
                        "code": '''@contextmanager
def sql_session_scope(session_factory) -> Iterator[Session]:
    db = session_factory()
    unavailable_error = None
    try:
        try:
            yield db
        except OperationalError as error:
            orig = getattr(error, "orig", None)
            code = getattr(orig, "sqlite_errorcode", None)
            if code != sqlite3.SQLITE_CANTOPEN:
                raise
            db.rollback()
            unavailable_error = error
    finally:
        db.close()

    if unavailable_error is not None:
        raise StorageError("Database is temporarily unavailable") from unavailable_error''',
                        "checks": ["Ошибка схемы не становится StorageError.", "Нет перехвата всех исключений."]
                    }
                },
                {
                    "title": "3. Подключите HTTP и CLI",
                    "task": "API и CLI открывают Session через sql_session_scope и получают один внутренний сигнал для выбранного отказа. FastAPI возвращает фиксированный 503 detail, а CLI печатает короткое сообщение после выхода из контекста команды и остаётся готовым принять следующую команду.",
                    "requirements": [
                        "Обработчик FastAPI зарегистрирован на существующем app и возвращает статус 503 с постоянным detail, не содержащим str(error).",
                        "CLI перехватывает StorageError вокруг одной команды после закрытия Session, выводит безопасный текст и продолжает цикл.",
                        "Неизвестные ошибки остаются внутренними 500; существующие 404 и 422 сохраняют прежние ответы."
                    ],
                    "hint": "Обработчик HTTP зарегистрируйте на app, а CLI-перехват поставьте вокруг контекста команды.",
                    "answer": {
                        "explanation": "DBase классифицирует причину; FastAPI и CLI выбирают форму сообщения после закрытия Session.",
                        "steps": ["Мы подключаем sql_session_scope в get_db и sql_service_context.", "Затем регистрируем фиксированный FastAPI 503.", "В CLI мы ловим StorageError вокруг одной команды и сохраняем возврат True для продолжения цикла."],
                        "code": '''@app.exception_handler(StorageError)
async def storage_error_handler(request, error):
    return JSONResponse(
        status_code=503,
        content={"detail": "Database is temporarily unavailable"},
    )

try:
    with service_context() as service:
        handler(service, read=read, write=write)
except StorageError:
    write("Хранилище временно недоступно")
return True''',
                        "analysis": [
                            "get_db и sql_service_context открывают общую session_scope.",
                            "CLI ловит только StorageError после выхода из service_context.",
                            "Не добавляйте общий except Exception."
                        ]
                    }
                },
                {
                    "title": "4. Проверьте матрицу SQL-ошибок",
                    "task": "Изолированные тестовые Engine используют только tmp_path. Матрица различает невозможность открыть БД, открытую БД без таблиц, нарушение ограничения и прежние предметные ответы API; CLI отдельно демонстрирует продолжение цикла.",
                    "requirements": [
                        "Недоступный путь с отсутствующим родительским каталогом воспроизводит SQLITE_CANTOPEN: API отвечает безопасным 503, CLI сообщает об отказе и принимает следующую команду.",
                        "Пустой SQLite-файл открывается, но не содержит таблицы: это внутренний 500 без технического текста; только этот сценарий использует raise_server_exceptions=False.",
                        "Flush с priority=99 вызывает IntegrityError и не становится StorageError или автоматическим 409.",
                        "Существующие проверки неизвестного id и невалидного HTTP-ввода по-прежнему дают 404 и 422."
                    ],
                    "hint": "Подменяйте app.state.session_factory только на Engine для tmp_path и закрывайте Engine.",
                    "answer": {
                        "explanation": "Отсутствующий каталог воспроизводит отказ открытия. Пустой файл открывается, но не содержит таблицу, поэтому это другая OperationalError. IntegrityError не является OperationalError.",
                        "steps": ["Проверьте недоступный путь на временном Engine в API и CLI.", "Проверьте пустую схему как 500 с отдельным TestClient.", "Вызовите flush с priority=99 и ожидайте IntegrityError.", "Повторите существующие проверки 404 и 422."],
                        "analysis": [
                            "Пустой файл проверяйте отдельным TestClient с raise_server_exceptions=False.",
                            "Ответ 500 не должен содержать путь или текст исключения.",
                            "Нарушите priority check constraint в тестовой Session и ожидайте IntegrityError при flush.",
                            "Для CLI проверьте list, затем exit: цикл должен продолжиться после отказа."
                        ]
                    }
                },
                {
                    "title": "5. Проверьте утечки и восстановление",
                    "task": "Ответ HTTP, вывод CLI и захваченные приложением записи лога не раскрывают маркеры тестовых данных или детали DBAPIError. После проверки временные подмены и Engine закрыты, исходная фабрика восстановлена, а обычная SQL-операция снова выполняется успешно.",
                    "requirements": [
                        "Публичные ответ и вывод не содержат абсолютный путь, SQL-параметры, пользовательские маркеры или текст DBAPIError.",
                        "Если приложение пишет запись об отказе, она содержит только безопасную категорию/код, без полного исключения и чувствительных значений.",
                        "Временный Engine закрыт, исходный session_factory восстановлен даже при провале проверки.",
                        "После восстановления проходит обычная SQL-операция.",
                        "Успех не объявляется доказательством состояния данных после commit."
                    ],
                    "hint": "Сохраните исходный factory перед подменой и восстановите его через monkeypatch либо finally.",
                    "answer": {
                        "explanation": "Постоянное сообщение не раскрывает driver error. Успех после восстановления подтверждает работу ресурса, но не доказывает состояние данных на каждой границе транзакции.",
                        "steps": [
                            "Сравните response, output и caplog с тестовым маркером, путём и текстом ошибки.",
                            "Если приложение не пишет такой лог, пустой caplog допустим; полный exception log не добавляйте.",
                            "Восстановите factory, закройте Engine и повторите GET /tasks или CLI list.",
                            "Передайте проверку rollback/commit занятию 101."
                        ],
                        "analysis": [
                            "Постоянное сообщение не содержит исходный текст driver exception.",
                            "Успешный следующий запрос подтверждает восстановление ресурса, но не состояние данных после каждого отказа.",
                            "Проверка границ rollback и commit передаётся занятию 101."
                        ],
                        "checks": ["Нет утечки маркеров.", "Provider восстановлен.", "JSON, автоповтор и общий перехват не добавлены."]
                    }
                }
            ],
            "result": "API возвращает безопасный 503 для SQLITE_CANTOPEN, CLI продолжает цикл, а прежние 404, 422 и внутренний 500 сохраняются.",
        }
    ],
    101: [
        {
            "title": "Границы rollback и commit проверяются раздельно",
            "task": (
                "Матрица проверок показывает состояние БД после отказа на точной границе сервисной транзакции. "
                "Она сохраняет прежние проверки failed flush, закрытия Session и ошибок отдельных SQL-команд, "
                "добавляя доказательства после успешного flush до commit и после уже успешного commit."
            ),
            "tasks": [
                {
                    "title": "1. Тестовая матрица показывает покрытие и пробел",
                    "task": (
                        "Карта тестов отделяет поведение сырой Session от поведения операции PlannerService. "
                        "В ней отмечено, какие существующие проверки уже доказывают rollback, состояние Session "
                        "и следующий запрос, а какие две границы ещё не читаются независимо."
                    ),
                    "requirements": [
                        "test_failed_second_insert_rolls_back_both_rows уже проверяет отмену допустимой первой и недопустимой второй вставки.",
                        "test_same_session_requires_rollback_before_next_query уже проверяет PendingRollbackError до rollback и успешную запись после него.",
                        "test_exception_rolls_back_and_closes_session_connection проверяет исключение после flush в сырой Session.",
                        "Тесты SQL-репозитория с trigger проверяют отклонённую команду, а не успешный flush с последующим исключением до commit.",
                        "В исходной матрице нет отдельного чтения после исключения, которое тестовая write_scope поднимает после обычной операции PlannerService и до commit, или после успешного commit."
                    ],
                    "hint": "Мы смотрим не только на тип исключения, но и на то, дошёл ли обычный метод сервиса до вызова репозитория.",
                    "answer": {
                        "explanation": (
                            "Сырые тесты Session уже показывают rollback после failed flush, необходимость восстановить тот же Session и освобождение ресурса. "
                            "Тесты с BEFORE-триггером останавливают сам UPDATE или DELETE. Они не показывают, что происходит, если SQL-изменение успешно прошло flush, "
                            "а сбой возникает позже внутри транзакционной области сервиса. Отдельно нет проверки исключения, которое поднимается после завершения commit."
                        ),
                        "steps": [
                            "В test_dbase_transactions.py отмечаем покрытие существующего ограничения priority и неактивного Session.",
                            "Различаем сырой session.begin и write_scope, который реально передан PlannerService.",
                            "В test_sql_repository.py находим trigger-тесты: SQL-команда отклоняется базой во время выполнения.",
                            "Добавляем только тесты новых границ, а тесты занятия 83 не копируем."
                        ],
                        "checks": [
                            "Существующая проверка не объявлена ошибочной или недостаточной для своей цели.",
                            "Новый тест доказывает состояние после успешного flush и исключения до commit.",
                            "Позднее исключение после commit рассматривается отдельно."
                        ]
                    }
                },
                {
                    "title": "2. Ограничение БД переводит Session в failed-состояние",
                    "task": (
                        "Тест нарушает существующее ограничение priority на отдельной SQLite-базе. После IntegrityError "
                        "запрос в той же Session завершается PendingRollbackError; явный rollback восстанавливает её, "
                        "а независимая Session подтверждает отсутствие отклонённой строки и следующую успешную запись."
                    ),
                    "requirements": [
                        "Используется существующее ограничение priority BETWEEN 1 AND 5 без изменения схемы.",
                        "Недопустимая ORM-строка отправляется через flush, исключение IntegrityError перехватывается тестом.",
                        "До rollback запрос в той же Session вызывает PendingRollbackError.",
                        "После rollback новая допустимая операция сохраняется и читается независимой Session.",
                    ],
                    "hint": "Мы обходим предметную валидацию только в тесте, создавая TaskRow с priority=6.",
                    "answer": {
                        "explanation": (
                            "Ограничение БД отклоняет flush и оставляет транзакцию SQLAlchemy неактивной. "
                            "Перехват IntegrityError не восстанавливает Session: до rollback следующий запрос "
                            "получает PendingRollbackError. Отмена очищает неудачную транзакцию; последующая "
                            "запись выполняется отдельно, а независимое чтение проверяет итог базы."
                        ),
                        "steps": [
                            "Создаём строку с priority=6, обходя прикладной валидатор ради проверки ограничения таблицы.",
                            "Ожидаем IntegrityError при flush и проверяем неактивное состояние транзакции.",
                            "Пробуем запрос в той же Session и наблюдаем PendingRollbackError.",
                            "Вызываем rollback, добавляем допустимую строку и завершаем транзакцию.",
                            "Новой Session проверяем отсутствие отклонённой строки и наличие допустимой.",
                        ],
                        "code": '''def test_constraint_failure_requires_rollback_before_recovery(sql_database):
    from sqlalchemy import select
    from sqlalchemy.exc import IntegrityError, PendingRollbackError

    _engine, session_factory = sql_database
    with session_factory() as session:
        invalid = TaskRow(
            title="Недопустимая задача",
            priority=6,
            is_done=False,
            tags=["не сохранится"],
            title_normalized="недопустимая задача",
        )
        session.add(invalid)
        with pytest.raises(IntegrityError):
            session.flush()

        assert session.is_active is False
        with pytest.raises(PendingRollbackError):
            session.scalar(select(TaskRow.id))

        session.rollback()
        assert session.is_active is True

    with session_factory() as recovered:
        valid = TaskRow(
            title="После rollback",
            priority=2,
            is_done=False,
            tags=["восстановление"],
            title_normalized="после rollback",
        )
        recovered.add(valid)
        recovered.commit()
        valid_id = valid.id

    with session_factory() as verification:
        assert verification.scalars(
            select(TaskRow).where(TaskRow.title == "Недопустимая задача")
        ).first() is None
        saved = verification.get(TaskRow, valid_id)
        assert (saved.title, saved.priority, saved.tags) == (
            "После rollback", 2, ["восстановление"]
        )''',
                        "checks": [
                            "IntegrityError вызван реальным ограничением существующей схемы.",
                            "PendingRollbackError появляется в той же Session до rollback.",
                            "После rollback допустимая запись читается, а отклонённой строки в базе нет.",
                        ],
                    },
                },                {
                    "title": "3. Rollback восстанавливает целостность после flush",
                    "task": (
                        "Сервисный тест изменяет задачу и проходит flush, затем управляемая write_scope поднимает RuntimeError "
                        "до выхода из session.begin. Новая Session сравнивает все поля целевой задачи и соседа с исходным состоянием. "
                        "Следующая независимая операция выполняется на новом ресурсе."
                    ),
                    "requirements": [
                        "Тест использует sql_database и существующие build_service, SqlTaskRepository и PlannerService.replace_task.",
                        "Проверка сравнивает id, title, priority, is_done, tags и title_normalized у целевой строки и соседа.",
                        "Исключение ожидается через pytest.raises и выходит из транзакционной области.",
                        "Следующее допустимое действие выполняется с новой Session."
                    ],
                    "hint": "Мы оборачиваем session.begin тестовым контекстным менеджером. После yield операция сервиса вернётся из репозитория, где replace уже выполнил flush.",
                    "answer": {
                        "explanation": (
                            "Сервисный replace_task открывает write_scope, читает задачу, вызывает репозиторий, который меняет ORM-строку и выполняет flush. "
                            "Контекст-обёртка поднимает ожидаемое исключение после возврата из метода репозитория, пока session.begin ещё открыт. "
                            "Контекст откатывает изменение. Проверка новой Session доказывает итог базы, а следующий сервисный вызов подтверждает, что работа продолжается на отдельном ресурсе."
                        ),
                        "steps": [
                            "Подготавливаем в тестовой базе целевую задачу и соседа с разными значениями и tags.",
                            "Внутри новой Session строим PlannerService с write_scope, который после yield поднимает RuntimeError.",
                            "Вызываем обычный replace_task и ожидаем ошибку до завершения транзакции.",
                            "Открываем новую Session и сравниваем исходные значения обеих строк.",
                            "Открываем ещё одну Session, создаём задачу через PlannerService и проверяем её отдельным чтением."
                        ],
                        "code": '''def test_service_write_scope_rolls_back_after_flush_and_next_session_recovers(sql_database):
    _engine, session_factory = sql_database
    with session_factory() as session:
        session.add_all(
            [
                TaskRow(
                    id=131,
                    title="Курс SQL",
                    priority=3,
                    is_done=True,
                    tags=["внутренний"],
                    title_normalized="курс sql",
                ),
                TaskRow(
                    id=132,
                    title="Сосед",
                    priority=2,
                    is_done=False,
                    tags=["рядом"],
                    title_normalized="сосед",
                ),
            ]
        )
        session.commit()

    with session_factory() as session:
        @contextmanager
        def fail_before_commit():
            with session.begin():
                yield
                raise RuntimeError("failure before commit")

        planner = build_service(
            repository=SqlTaskRepository(session),
            write_scope=fail_before_commit,
        )
        with pytest.raises(RuntimeError, match="failure before commit"):
            planner.replace_task(
                131,
                title="Новая версия",
                priority=1,
                is_done=False,
            )

    with session_factory() as session:
        target = session.get(TaskRow, 131)
        neighbor = session.get(TaskRow, 132)
        assert (
            target.id,
            target.title,
            target.priority,
            target.is_done,
            target.tags,
            target.title_normalized,
        ) == (131, "Курс SQL", 3, True, ["внутренний"], "курс sql")
        assert (
            neighbor.id,
            neighbor.title,
            neighbor.priority,
            neighbor.is_done,
            neighbor.tags,
            neighbor.title_normalized,
        ) == (132, "Сосед", 2, False, ["рядом"], "сосед")

    with session_factory() as session:
        planner = build_service(
            repository=SqlTaskRepository(session),
            write_scope=session.begin,
        )
        created = planner.add_task("После отказа", 2, tags=["проверка"])

    with session_factory() as session:
        saved = session.get(TaskRow, created.id)
        assert saved is not None
        assert (saved.title, saved.tags, saved.title_normalized) == (
            "После отказа",
            ["проверка"],
            "после отказа",
        )''',
                        "checks": [
                            "RuntimeError поднимается после успешного вызова репозитория, но до commit.",
                            "Новая Session видит старые значения выбранной строки и неизменного соседа.",
                            "Следующая независимая запись сохраняется и читается новым Session."
                        ]
                    }
                },
                {
                    "title": "4. Поздняя ошибка не отменяет commit",
                    "task": (
                        "Тестовый write_scope завершает штатный session.begin, а затем выбрасывает RuntimeError. "
                        "Сервис не возвращает созданную задачу вызывающему коду, но независимое чтение находит одну "
                        "подтверждённую строку со всеми ожидаемыми полями."
                    ),
                    "requirements": [
                        "Исключение возникает после выхода session.begin и успешного commit.",
                        "Создание выполняется один раз, без автоматического повтора.",
                        "Новая Session находит запись и проверяет tags и title_normalized.",
                        "Тест не объявляет управляемое исключение реальным сетевым или дисковым отказом."
                    ],
                    "hint": "Мы располагаем raise после блока with session.begin, не внутри него.",
                    "answer": {
                        "explanation": (
                            "При нормальном выходе из session.begin транзакция фиксируется. Контекстная обёртка поднимает RuntimeError уже после commit, "
                            "поэтому вызывающий код не получает результат сервиса, но новая Session видит созданную строку. Повторный create мог бы создать дубликат."
                        ),
                        "steps": [
                            "Открываем изолированную Session и создаём локальный контекстный менеджер.",
                            "Внутри менеджера yield отдаёт управление методу сервиса; выход из session.begin подтверждает INSERT.",
                            "После окончания session.begin выбрасываем контролируемый RuntimeError.",
                            "Ожидаем ошибку вокруг add_task, затем читаем целевую строку новой Session.",
                            "Проверяем, что строка существует ровно в одном экземпляре и её внутренние поля согласованы."
                        ],
                        "code": '''def test_create_remains_after_exception_following_commit(sql_database):
    _engine, session_factory = sql_database

    with session_factory() as session:
        @contextmanager
        def fail_after_commit():
            with session.begin():
                yield
            raise RuntimeError("result was not returned")

        planner = build_service(
            repository=SqlTaskRepository(session),
            write_scope=fail_after_commit,
        )
        with pytest.raises(RuntimeError, match="result was not returned"):
            planner.add_task(
                "Подтверждённая задача",
                3,
                tags=["граница"],
            )

    with session_factory() as session:
        rows = session.scalars(
            select(TaskRow).where(
                TaskRow.title == "Подтверждённая задача"
            )
        ).all()
        assert len(rows) == 1
        row = rows[0]
        assert (
            row.title,
            row.priority,
            row.is_done,
            row.tags,
            row.title_normalized,
        ) == (
            "Подтверждённая задача",
            3,
            False,
            ["граница"],
            "подтверждённая задача",
        )''',
                        "checks": [
                            "Транзакция commit завершена до выброса RuntimeError.",
                            "Новая Session видит созданную запись и её нормализованные внутренние данные.",
                            "Тест не повторяет create и не обещает exactly-once."
                        ]
                    }
                }
            ],
            "result": (
                "Практика доказывает отказ существующего ограничения, восстановление Session после rollback, "
                "отмену сервисного изменения после flush до commit и сохранение строки после позднего исключения. "
                "Внешняя политика HTTP/CLI и автоповторы здесь не оцениваются."
            )
        }
    ],
    102: [
        {
            "title": "Наблюдать SQL-запросы Planner",
            "task": (
                "На изолированной SQLite мы включаем временный сбор SQLAlchemy logging и сопоставляем знакомые операции Planner с SQL и предметным результатом. Engine скрывает параметры, обычный запуск не включает echo. "
                "После подтверждения входных checkpoint наблюдение передаётся в занятие 103 как кандидат на улучшение либо доказательство достаточности запроса."
            ),
            "tasks": [
                {
                    "title": "Подтвердить вход и границу лаборатории",
                    "task": "Checkpoint подтверждает B15 и безопасную основу занятий 100-101. Наблюдение выполняется только на SQLite в tmp_path; рабочая база не используется.",
                    "requirements": [
                        "В итоговой записи указан commit StudyHub последнего завершённого занятия, а рабочий diff зафиксирован отдельно.",
                        "Журнал и код на выбранном commit подтверждают SQL-путь B15; для B100-B101 отдельно указано, подтверждены ли отказ и восстановление.",
                        "Тестовая SQLite содержит только тестовые данные.",
                        "При неподтверждённых B100-B101 вывод ограничен настройкой logger и read-only наблюдением; проверка записи остаётся непринятой."
                    ],
                    "hint": "Мы сверяем журнал и код на одном commit. План и незакоммиченный diff не доказывают пройденный checkpoint.",
                    "answer": {
                        "explanation": "На доступном checkpoint 3ffc24f подтверждён результат занятия 99. Если журнал по-прежнему заканчивается занятием 99, входы 100 и 101 не подтверждены, поэтому зависимую проверку записи не принимаем.",
                        "steps": [
                            "Находим последнюю запись STUDYHUB_LEARNINGS.md и соответствующий commit.",
                            "На нём читаем make_engine, сервис, репозиторий, Session и тестовую фикстуру.",
                            "Подтверждаем B100-B101 в журнале и коде.",
                            "Для эксперимента выбираем временную базу, не штатное хранилище."
                        ],
                        "checks": [
                            "Commit отделён от рабочего diff.",
                            "Для каждого checkpoint есть запись обучения и код.",
                            "Неподтверждённые отказы не проверяются на рабочей базе."
                        ]
                    }
                },
                {
                    "title": "Скрыть параметры и подготовить capture",
                    "task": "make_engine сохраняет database_url и создаёт Engine с hide_parameters=True. Тест временно включает INFO для sqlalchemy.engine через caplog до открытия Session и возвращает прежний уровень после capture.",
                    "requirements": [
                        "make_engine передаёт исходный database_url в create_engine с hide_parameters=True.",
                        "Обычный запуск оставляет echo выключенным; глобальный listener и дополнительный соединительный слой отсутствуют.",
                        "Тестовый capture включает INFO для sqlalchemy.engine до первого обращения новой Session к соединению.",
                        "DEBUG выключен, URL и пользовательские значения отдельно не печатаются."
                    ],
                    "hint": "Мы включаем защиту параметров в Engine, а сбор сообщений только на время теста.",
                    "answer": {
                        "explanation": "hide_parameters=True не меняет результат SQL и не включает журнал. caplog временно принимает сообщения logger. Уровень задаётся до получения соединения, так как SQLAlchemy проверяет его при подключении.",
                        "steps": [
                            "В make_engine передаём create_engine исходный URL и hide_parameters=True.",
                            "Оставляем echo на значении по умолчанию.",
                            "Открываем capture до новой Session и выполняем одну операцию.",
                            "Проверяем SQL и отсутствие параметра в записях.",
                            "Выходим из caplog и проверяем восстановление уровня logger."
                        ],
                        "code": "def make_engine(database_url: str) -> Engine:\n    return create_engine(database_url, hide_parameters=True)",
                        "checks": [
                            "Обычный запуск не включает echo.",
                            "SQL виден внутри capture.",
                            "Параметр отсутствует в SQL-сообщении."
                        ]
                    }
                },
                {
                    "title": "Наблюдать знакомые чтения",
                    "task": "Seed завершён до capture. get, list, select, statistics и search выполняются по одному на короткую Session. Результат Planner сверяется с SQL-командой и тестовыми строками.",
                    "requirements": [
                        "В изолированной таблице находятся три строки: id 1 и 3 незавершённые, id 2 завершённая.",
                        "get_task(2) возвращает Task id 2; list_tasks возвращает id [1, 2, 3].",
                        "select_tasks(is_done=False, sort_desc=True, limit=1) возвращает id 3, SQL содержит WHERE, ORDER BY и LIMIT.",
                        "get_statistics возвращает {'all': 3, 'open': 2, 'done': 1} через агрегат без списка Task.",
                        "search_tasks(\"релиз\") находит id 3; search_tasks(\"   \") возвращает [] без SELECT.",
                        "SQL-команды приложения в capture различимы отдельно от BEGIN, DDL, seed и закрытия ресурса."
                    ],
                    "hint": "Мы сначала предсказываем результат каждой операции, затем рассматриваем отдельный capture.",
                    "answer": {
                        "explanation": "Свежая Session отправляет SELECT для get и списка. Фильтр, сортировка и limit выполняются в базе. Агрегат возвращает счётчики, поиск использует параметр, пустой запрос завершается до SQL.",
                        "steps": [
                            "Добавляем строки и завершаем seed до capture.",
                            "Для каждой операции очищаем caplog и открываем отдельную Session.",
                            "Сверяем Task и агрегаты с ожидаемыми значениями.",
                            "В SQL выделяем SELECT, а не сообщения BEGIN и ROLLBACK.",
                            "Проверяем отсутствие SELECT для пустого поиска."
                        ],
                        "code": "import logging\nfrom app.DBase.models import TaskRow\nfrom app.DBase.repositories import SqlTaskRepository\nfrom app.main import build_service\n\ndef test_read_queries_match_sql(sql_database, caplog):\n    _engine, session_factory = sql_database\n    with session_factory() as seed_session:\n        seed_session.add_all([\n            TaskRow(id=1, title=\"Настроить сборку\", priority=2, is_done=False, tags=[], title_normalized=\"настроить сборку\"),\n            TaskRow(id=2, title=\"Проверить документацию\", priority=2, is_done=True, tags=[], title_normalized=\"проверить документацию\"),\n            TaskRow(id=3, title=\"Релиз новой функции\", priority=1, is_done=False, tags=[], title_normalized=\"релиз новой функции\"),\n        ])\n        seed_session.commit()\n\n    def run_read(operation):\n        caplog.clear()\n        with caplog.at_level(logging.INFO, logger=\"sqlalchemy.engine\"):\n            with session_factory() as session:\n                planner = build_service(repository=SqlTaskRepository(session), write_scope=session.begin)\n                result = operation(planner)\n        return result, caplog.text\n\n    task, get_sql = run_read(lambda planner: planner.get_task(2))\n    items, list_sql = run_read(lambda planner: planner.list_tasks())\n    selected, select_sql = run_read(lambda planner: planner.select_tasks(is_done=False, sort_desc=True, limit=1))\n    statistics, stats_sql = run_read(lambda planner: planner.get_statistics())\n    found, search_sql = run_read(lambda planner: planner.search_tasks(\"релиз\"))\n    empty, empty_sql = run_read(lambda planner: planner.search_tasks(\"   \"))\n    assert task.id == 2\n    assert [item.id for item in items] == [1, 2, 3]\n    assert [item.id for item in selected] == [3]\n    assert all(fragment in select_sql.upper() for fragment in (\"WHERE\", \"ORDER BY\", \"LIMIT\"))\n    assert statistics == {\"all\": 3, \"open\": 2, \"done\": 1}\n    assert \"COUNT\" in stats_sql.upper()\n    assert [item.id for item in found] == [3]\n    assert empty == []\n    assert \"SELECT\" not in empty_sql.upper()",
                        "checks": [
                            "list может вернуть много Task одним SELECT.",
                            "Статистика не материализует список задач.",
                            "Пустой поиск не обращается к базе."
                        ]
                    }
                },
                {
                    "title": "Условно проверить одну запись",
                    "task": "Карточка выполняется только после подтверждения B100-B101. add_task отправляет INSERT при flush внутри write_scope. После успешного выхода новая Session видит сохранённую Task, а title и tags отсутствуют в SQL-журнале.",
                    "requirements": [
                        "Запись выполняется только при подтверждённых обработке отказа и восстановлении на checkpoint B100-B101.",
                        "Изолированный тест вызывает PlannerService.add_task на SQLite в tmp_path.",
                        "В capture виден INSERT при flush; успешное завершение write_scope отмечено отдельно.",
                        "После закрытия исходной Session новая Session читает строку и сверяет title, tags, priority и is_done.",
                        "SQL-журнал не содержит маркеров title и tags.",
                        "При неподтверждённом входе запись и полная приёмка B102 остаются пропущенными."
                    ],
                    "hint": "Мы читаем результат независимой Session после выхода из области записи.",
                    "answer": {
                        "explanation": "flush отправляет INSERT внутри транзакции. Сохранённый результат подтверждается чтением после выхода из write_scope и закрытия исходного ресурса. Зависимую проверку выполняем только на подготовленной транзакционной основе.",
                        "steps": [
                            "Открываем временную базу и новую Session.",
                            "До add_task включаем capture уровня INFO.",
                            "Вызываем add_task с уникальными маркерами title и tags.",
                            "После успешного выхода выделяем INSERT и проверяем отсутствие маркеров.",
                            "Открываем новую Session и сверяем сохранённые колонки по id Task."
                        ],
                        "code": "import logging\nfrom app.DBase.models import TaskRow\nfrom app.DBase.repositories import SqlTaskRepository\nfrom app.main import build_service\n\ndef test_add_task_logs_sql_and_persists(sql_database, caplog):\n    _engine, session_factory = sql_database\n    caplog.clear()\n    with caplog.at_level(logging.INFO, logger=\"sqlalchemy.engine\"):\n        with session_factory() as session:\n            planner = build_service(repository=SqlTaskRepository(session), write_scope=session.begin)\n            created = planner.add_task(\"marker-102\", 3, [\"private-tag-102\"])\n    log_text = caplog.text\n    assert any(record.getMessage().lstrip().upper().startswith(\"INSERT INTO TASKS\") for record in caplog.records)\n    assert \"marker-102\" not in log_text\n    assert \"private-tag-102\" not in log_text\n    with session_factory() as verify_session:\n        row = verify_session.get(TaskRow, created.id)\n        assert (row.title, row.tags, row.priority, row.is_done) == (\"marker-102\", [\"private-tag-102\"], 3, False)",
                        "checks": [
                            "SQL-журнал показывает INSERT, сервис возвращает Task с id.",
                            "Новая Session видит значения после commit.",
                            "Маркеры отсутствуют в сообщениях SQLAlchemy.",
                            "Без подтверждения входа карточка остаётся незавершённой."
                        ]
                    }
                },
                {
                    "title": "Передать свидетельство в занятие 103",
                    "task": "Итог содержит воспроизводимое действие, SQL в границе capture, предметный результат и обоснованный вывод. Временный logger восстановлен, постоянная диагностика не остаётся включённой.",
                    "requirements": [
                        "В итоговой записи указаны тестовые строки и повторяемый вызов Planner.",
                        "SQL приложения приведён отдельно от DDL, seed, BEGIN, COMMIT и закрытия ресурса.",
                        "Гипотеза о повторном чтении содержит причину и связь с ожидаемым результатом.",
                        "Вывод не объявляет несколько SELECT проблемой N+1 и не обещает ускорение без измерений.",
                        "Итог передаёт кандидата для 103 либо доказательство достаточности запроса."
                    ],
                    "hint": "Мы передаём короткое свидетельство, не длинный журнал без контекста.",
                    "answer": {
                        "explanation": "Лог подтверждает отправку SQL, но не доказывает задержку, дефект или нужду в индексе. Следующее занятие получает сценарий, результат и проверяемую гипотезу.",
                        "steps": [
                            "Записываем действие и входные данные.",
                            "Приводим SQL-команды этого вызова.",
                            "Сверяем предметный результат и ожидаемое поведение.",
                            "Обосновываем повторное чтение или достаточность запроса.",
                            "Проверяем, что capture завершён и echo не включён."
                        ],
                        "checks": [
                            "Наблюдение воспроизводится на tmp_path.",
                            "Вывод соответствует SQL и предметному результату.",
                            "Нет неподтверждённых гипотез о N+1, скорости или схеме."
                        ]
                    }
                }
            ],
            "result": "Чтения сопоставлены с результатом на изолированной SQLite. Запись и проверка восстановления принимаются только после B100-B101. В занятие 103 передан кандидат или свидетельство достаточности."
        }
    ],

    103: [
        {
            "title": "Обоснуйте достаточность запроса",
            "task": (
                "Практика связывает наблюдение SQL с поведением репозитория и проверкой SQLite. Результат содержит подтверждённый checkpoint, объяснение плана и узкую проверку одного свойства выборки. "
                "Работа ограничена изолированной тестовой базой; схема и публичный договор остаются прежними."
            ),
            "tasks": [
                {
                    "title": "Checkpoint и трасса задают основание проверки",
                    "task": "Отчёт связывает фактическую SQL-трассу занятия 102 с checkpoint проекта и предметным результатом, чтобы определить основание для точечной проверки.",
                    "requirements": [
                        "Журнал обучения и checkpoint проекта отдельно подтверждают прохождение предыдущей работы; план курса и незакоммиченный diff не являются таким подтверждением.",
                        "Запись результата содержит входные параметры, ожидаемый список задач и фактически наблюдённые SQL-команды.",
                        "Код SqlTaskRepository.select на checkpoint 3ffc24f строит один запрос с фильтром, сортировкой и limit и возвращает полный Task с tags.",
                        "При отсутствии подтверждённой записи 102 или предыдущих checkpoint трасса не считается установленной, а зависимая проверка остаётся неподтверждённой.",
                        "Совпадение достаточного запроса с ожидаемым результатом обосновывает регрессионную проверку без искусственной переделки."
                    ],
                    "hint": "Отделите три свидетельства: запись о выполненной работе, фактическую SQL-трассу и состояние кода на указанном checkpoint.",
                    "answer": {
                        "explanation": "На известном checkpoint выборка уже отправляет фильтр, порядок и limit в SQLite и преобразует полную ORM-строку в Task с tags. Это не доказывает прохождение занятия 102: вывод должен быть заново получен и записан на фактическом checkpoint ученика. При совпадающем наблюдении уместно сохранить свойство тестом, а не менять достаточный запрос.",
                        "steps": [
                            "Мы находим последнее подтверждённое занятие в журнале и соответствующую версию StudyHub.",
                            "Мы выполняем одну выборку на временной базе и отделяем её SQL от seed, DDL и закрытия ресурса.",
                            "Мы сравниваем условие, порядок, limit и полный предметный результат.",
                            "Мы фиксируем найденное расхождение либо выбираем узкий regression test для уже подходящего запроса."
                        ],
                        "checks": [
                            "Checkpoint и SQL-трасса подтверждены отдельно.",
                            "Наблюдение относится к одному вызову и тестовым данным.",
                            "Без подтверждённого вывода 102 не заявлено, что кандидат на улучшение найден."
                        ]
                    }
                },
                {
                    "title": "План SQLite описывает стратегию выборки",
                    "task": "Разбор плана SQLite описывает стратегию той же операции на изолированных тестовых данных.",
                    "requirements": [
                        "План относится к тому же смысловому запросу и набору тестовых строк, что и наблюдение.",
                        "Объяснение связывает фактический результат своей версии SQLite с условием и схемой.",
                        "SCAN сам по себе не означает дефект или измеренную медлительность.",
                        "Схема не получает индекс, колонку или миграцию ради изменения текста плана.",
                        "Весь текст плана не закреплён тестом как стабильный API."
                    ],
                    "hint": "План описывает выбранный способ доступа к строкам; он не является замером времени ответа.",
                    "answer": {
                        "explanation": "EXPLAIN QUERY PLAN для запроса выборки может показать SCAN. Это значит, что SQLite просматривает таблицу или индекс для данного плана. Само обозначение не доказывает недостаток схемы: учитываем условие, размер и состав данных. Для этой практики достаточно описать план и оставить схему без изменений.",
                        "steps": [
                            "Мы находим фактический SQL выборки и ставим EXPLAIN QUERY PLAN перед SELECT.",
                            "Мы передаём значения фильтра и limit отдельными параметрами соединения.",
                            "Мы читаем описание таблицы и операции SCAN или SEARCH в выводе.",
                            "Мы сопоставляем план с условием и не выводим из него скорость."
                        ],
                        "code": "with engine.connect() as connection:\n    plan = connection.exec_driver_sql(\n        \"EXPLAIN QUERY PLAN SELECT id, title, priority, is_done, tags, title_normalized FROM tasks WHERE is_done = ? ORDER BY id DESC LIMIT ?\",\n        (0, 1),\n    ).fetchall()",
                        "checks": [
                            "Запрос выполнен на изолированной базе.",
                            "Параметры переданы отдельно от SQL-текста.",
                            "Вывод объяснён без требования индекса и без обещания ускорения."
                        ]
                    }
                },
                {
                    "title": "Тест защищает свойство выборки",
                    "task": "Тест фиксирует один выбранный сценарий репозитория на изолированной базе.",
                    "requirements": [
                        "Фикстура sql_database предоставляет тестовые engine и session_factory.",
                        "Строки с разными id, состояниями и tags сохранены до подключения listener.",
                        "Listener before_cursor_execute во время одного вызова SqlTaskRepository.select собирает только SELECT и снимается в finally.",
                        "Результат содержит ожидаемые id, title, priority, is_done и tags; SQL содержит WHERE, ORDER BY и LIMIT.",
                        "Новая Session после capture подтверждает сохранность выбранной и соседней строк.",
                        "Проверка не фиксирует случайное число всех SQL-команд приложения и полный текст SQL."
                    ],
                    "hint": "Совместите проверку предметного результата с узким наблюдением SQL одной операции.",
                    "answer": {
                        "explanation": "Тест seed-ит данные заранее, затем слушает только SELECT, отправленный одним вызовом репозитория. Он проверяет результат и три обещанных свойства SQL. Listener снимается в finally, а независимая Session подтверждает, что чтение не меняло строки.",
                        "steps": [
                            "Мы создаём завершённую и незавершённые задачи с различающимися tags.",
                            "Мы сохраняем seed в тестовой базе до capture.",
                            "Мы подключаем listener, вызываем select с фильтром, обратной сортировкой и limit=1, затем снимаем listener в finally.",
                            "Мы сверяем поля Task и смысловые фрагменты единственного SELECT.",
                            "Мы читаем выбранную и соседнюю строки в новой Session для проверки сохранённого состояния."
                        ],
                        "code": "def test_sql_select_keeps_filter_order_and_limit_in_database(sql_database):\n    engine, session_factory = sql_database\n    with session_factory() as session:\n        session.add_all([\n            TaskRow(id=2, title=\"Done\", priority=3, is_done=True, tags=[\"keep\"], title_normalized=\"done\"),\n            TaskRow(id=5, title=\"Open 5\", priority=2, tags=[\"middle\"], title_normalized=\"open 5\"),\n            TaskRow(id=8, title=\"Open 8\", priority=4, tags=[\"internal\"], title_normalized=\"open 8\"),\n        ])\n        session.commit()\n\n    statements = []\n    def record_select(_conn, _cursor, statement, _params, _context, _many):\n        if statement.lstrip().upper().startswith(\"SELECT\"):\n            statements.append(statement)\n\n    event.listen(engine, \"before_cursor_execute\", record_select)\n    try:\n        with session_factory() as session:\n            result = SqlTaskRepository(session).select(\n                is_done=False, sort_desc=True, limit=1\n            )\n    finally:\n        event.remove(engine, \"before_cursor_execute\", record_select)\n\n    assert [(task.id, task.title, task.priority, task.is_done, task.tags) for task in result] == [(8, \"Open 8\", 4, False, [\"internal\"])]\n    assert len(statements) == 1\n    normalized = \" \".join(statements[0].upper().split())\n    assert \" WHERE \" in normalized\n    assert \" ORDER BY \" in normalized\n    assert \" LIMIT \" in normalized\n\n    with session_factory() as check:\n        row = check.get(TaskRow, 8)\n        neighbor = check.get(TaskRow, 2)\n        assert (row.title, row.priority, row.is_done, row.tags) == (\"Open 8\", 4, False, [\"internal\"])\n        assert (neighbor.title, neighbor.is_done, neighbor.tags) == (\"Done\", True, [\"keep\"])",
                        "checks": [
                            "Capture содержит SQL только вызова select.",
                            "Результат содержит полный Task с теми же tags.",
                            "Фильтр, порядок и limit остаются в SQL.",
                            "Независимая Session видит выбранную и соседнюю строки без изменений."
                        ]
                    }
                },
                {
                    "title": "Вывод отделяет доказанное от неизмеренного",
                    "task": "Итоговый вывод разделяет подтверждённое поведение, регрессионную защиту и неизмеренные эффекты.",
                    "requirements": [
                        "Проверка подтверждает влияние фильтра, сортировки и limit на результат Planner.",
                        "Результат содержит полный Task с tags, а независимая Session подтверждает сохранённое состояние.",
                        "Для уже достаточного запроса результатом является regression test, защищающий это свойство.",
                        "Появление SEARCH или уменьшение числа строк в логе не является доказательством ускорения.",
                        "Рабочая база, публичный API, схема, индексы, кэш и поведение записи остаются без изменений."
                    ],
                    "hint": "Разделите наблюдаемую корректность, выбранный план и время выполнения. В этой работе подтверждаются первые два пункта, если они действительно проверены.",
                    "answer": {
                        "explanation": "На известных данных тест подтверждает SQL-фильтр, порядок и limit, предметный результат с tags и отсутствие побочного изменения строк. Это доказательство поведения и регрессионной защиты. Без подходящей нагрузки и отдельного измерения времени вывод об ускорении делать нельзя.",
                        "steps": [
                            "Мы сопоставляем вход, SQL и Task в исходном и проверенном вариантах.",
                            "Мы записываем результат независимого чтения строки и соседней записи.",
                            "Мы называем точное свойство, которое защищает тест.",
                            "Мы отделяем неизмеренное и не меняем схему без доказанной причины."
                        ],
                        "checks": [
                            "Результат и сохранённые строки проверены отдельно.",
                            "Вывод ограничен фактическими проверками.",
                            "Не заявлены production-ускорение или изменение схемы."
                        ]
                    }
                }
            ],
            "result": "Итог содержит подтверждённый checkpoint и трассу, объяснённый план SQLite и узкую регрессионную проверку поведения выборки на изолированных данных."
        }
    ],
    104: [
        {
            "title": "Сквозная приёмка Planner через API и CLI",
            "task": (
                "Обычные API и CLI используют один отдельный SQLite-файл. Созданная через API задача "
                "находится и изменяется через CLI, сохраняет прежний HTTP-договор и читается новой Session "
                "после перезапуска. Неподтверждённые результаты 100–103 остаются непроверенными."
            ),
            "tasks": [
                {
                    "title": "Установить входную точку и подготовить изоляцию",
                    "task": (
                        "Журнал изучения и код задают проверенную ревизию проекта. Приёмочная конфигурация "
                        "указывает на отдельный временный SQLite-файл, исходная схема создаётся явно, а API "
                        "и CLI получают один DATABASE_URL."
                    ),
                    "requirements": [
                        "Проверенная ревизия подтверждена журналом и кодом, а не номером занятия.",
                        "Временная база физически отделена от рабочей; DATABASE_URL не записан в .env или Git.",
                        "Результаты 100–103 отмечены подтверждёнными или непроверенными по фактической опоре.",
                    ],
                    "hint": "Сначала сверим исходное состояние и границу данных, затем запустим приложение.",
                    "answer": {
                        "explanation": (
                            "План показывает ожидаемую точку старта, а фактическую ревизию подтверждают "
                            "журнал и код. Новый файл SQLite позволяет безопасно создать тестовые строки."
                        ),
                        "steps": [
                            "Сверяем последнюю запись STUDYHUB_LEARNINGS.md с текущей ревизией StudyHub.",
                            "Создаём уникальный SQLite-файл в системном временном каталоге.",
                            "Явно создаём схему командой проекта до запуска API.",
                            "Сохраняем выведенный DATABASE_URL и передаём это же значение всем терминалам.",
                            "Если журнал и код подтверждают только занятия до 99, отмечаем 100–103 как непроверенные.",
                        ],
                        "code": """$databasePath = Join-Path $env:TEMP ("planner-104-" + [guid]::NewGuid().ToString("N") + ".sqlite3")
$databaseUrl = "sqlite:///" + ($databasePath -replace '\\\\', '/')
$env:DATABASE_URL = $databaseUrl
.\\.venv\\Scripts\\python.exe -m app.DBase.init_db
if ($LASTEXITCODE -ne 0) { throw "Не удалось создать приёмочную схему" }
Write-Output $databaseUrl""",
                        "checks": [
                            "Инициализация завершается до старта API и CLI.",
                            "Временный URL сохранён отдельно для следующих терминалов.",
                            "Рабочая база, .env и архивный JSON остаются неизменными.",
                            "Для каждой проверки 100–103 записана фактическая опора или статус пропуска.",
                        ],
                    },
                },
                {
                    "title": "Связать создание API, поиск CLI и новое чтение",
                    "task": (
                        "POST /tasks возвращает 201 и id. CLI находит ту же задачу по id и по русскому "
                        "фрагменту с буквальными % и _, отмечает её выполненной. Последующие GET и /stats "
                        "возвращают то же состояние из общей базы."
                    ),
                    "requirements": [
                        "API и CLI запущены обычными командами с одним DATABASE_URL.",
                        "CLI search находит русское название без превращения % и _ в шаблонные символы.",
                        "CLI find и done используют id из ответа POST.",
                        "Новый API GET показывает is_done=true, а /stats содержит total=1, open=0, done=1.",
                    ],
                    "hint": "Сопоставим один id через три наблюдения: ответ API, вывод CLI и новый GET.",
                    "answer": {
                        "explanation": (
                            "Успешный POST подтверждает только создание по HTTP. Совпадающий id в CLI, "
                            "изменение статуса и чтение после команды показывают, что интерфейсы используют "
                            "один сохранённый источник."
                        ),
                        "steps": [
                            "Запускаем Uvicorn и CLI в отдельных окнах из корня StudyHub.",
                            "Создаём задачу POST-запросом и сохраняем полученный id.",
                            "В CLI вводим search, русский фрагмент названия, затем find и тот же id.",
                            "В CLI вводим done и тот же id, затем завершаем CLI командой exit.",
                            "Из того же окна отправляем новый API GET и запрос /stats.",
                            "Сверяем id, статус и счётчики с ожидаемыми total=1, open=0, done=1.",
                        ],
                        "code": """# Терминал 1, корень StudyHub
$env:DATABASE_URL = Read-Host "Введите временный SQLite URL из шага 1"
.\\.venv\\Scripts\\python.exe -m uvicorn app.api:app --host 127.0.0.1 --port 8000

# Терминал 2, тот же корень и тот же URL
$env:DATABASE_URL = Read-Host "Введите тот же временный SQLite URL"
$body = '{"title":"План 104%_Проверка","priority":3}'
$response = Invoke-WebRequest -UseBasicParsing -Method Post -Uri "http://127.0.0.1:8000/tasks" -ContentType "application/json" -Body $body
if ($response.StatusCode -ne 201) { throw "Ожидался HTTP 201" }
$created = $response.Content | ConvertFrom-Json
$taskId = [int]$created.id

.\\.venv\\Scripts\\python.exe -m app.main
# В меню вводим:
# search
# план 104%_проверка
# find
# id из $created
# done
# тот же id
# exit

$saved = Invoke-RestMethod -Uri "http://127.0.0.1:8000/tasks/$taskId"
$stats = Invoke-RestMethod -Uri "http://127.0.0.1:8000/stats"
$saved
$stats
if (-not $saved.is_done) { throw "CLI изменение не видно через API" }
if ($stats.total -ne 1 -or $stats.open -ne 0 -or $stats.done -ne 1) { throw "Статистика не совпала" }""",
                        "checks": [
                            "Ответ POST имеет статус 201 и числовой id.",
                            "Обе команды CLI показывают этот же id.",
                            "GET показывает is_done=true, статистика показывает одну выполненную задачу.",
                            "Буквальные % и _ находятся в сохранённом русском названии.",
                        ],
                    },
                },
                {
                    "title": "Проверить обновления, выборку и безопасное удаление",
                    "task": (
                        "PUT сохраняет id и внутренние tags, а title_normalized соответствует новому title. "
                        "PATCH применяет false и сохраняет состояние при null или пустом объекте. Выборка "
                        "сначала фильтрует, затем сортирует по id и ограничивает результат. DELETE отвечает "
                        "204, отдельный GET отвечает 404, соседняя задача остаётся доступной."
                    ),
                    "requirements": [
                        "PUT заменяет публичные поля и сохраняет id и заранее заданные внутренние tags.",
                        "PATCH с is_done=false устанавливает False; null и пустой объект не меняют сохранённое состояние.",
                        "Счёт SQL-записей для пустого PATCH принимается только при подтверждённой опоре занятия 102.",
                        "Фильтр is_done=false, sort_desc=true и limit=1 возвращает созданную последней открытую задачу.",
                        "DELETE даёт 204, независимый GET даёт 404, а основная задача и сосед остаются доступны.",
                        "SQL-проверка выполняется новой Session до удаления; внутренние поля не приписываются HTTP-схеме.",
                    ],
                    "hint": "Сначала подготовим различимые строки, затем сравним ответы с чтением свежей Session.",
                    "answer": {
                        "explanation": (
                            "Статус маршрута и состояние строки подтверждают разные вещи. PUT/PATCH читаются "
                            "через публичный договор, tags и title_normalized через новую Session. Для DELETE "
                            "используется одноразовая строка, поэтому основная задача остаётся для restart."
                        ),
                        "steps": [
                            "Создаём две открытые контрольные задачи и отдельную задачу для удаления.",
                            "В изолированной строке основной задачи задаём контрольную метку через SQLAlchemy.",
                            "Отправляем PUT, затем PATCH с false, null и пустым объектом.",
                            "Проверяем filter → order → limit: результатом является последняя открытая контрольная задача.",
                            "Новой Session подтверждаем id, tags и title_normalized основной задачи.",
                            "Удаляем только одноразовую строку, сверяем 204 и новый GET 404.",
                            "Новым GET подтверждаем, что основная и соседняя задачи сохранились.",
                        ],
                        "code": """$env:DATABASE_URL = Read-Host "Введите тот же временный SQLite URL"
$taskId = [int](Read-Host "Введите id основной задачи из шага 2")
$controlA = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/tasks" -ContentType "application/json" -Body '{"title":"План 104 сосед 1","priority":2}'
$controlB = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/tasks" -ContentType "application/json" -Body '{"title":"План 104 сосед 2","priority":4}'
$deleteTarget = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/tasks" -ContentType "application/json" -Body '{"title":"План 104 удалить","priority":1}'

# Контрольная метка остаётся только в изолированной приёмочной базе.
$env:PLANNER_TASK_ID = [string]$taskId
@'
import os
from sqlalchemy.orm import Session
from app.DBase.engine import make_engine
from app.DBase.models import TaskRow

engine = make_engine(os.environ["DATABASE_URL"])
try:
    with Session(engine) as session:
        row = session.get(TaskRow, int(os.environ["PLANNER_TASK_ID"]))
        assert row is not None
        row.tags = ["manual-104"]
        session.commit()
        print({"id": row.id, "tags": row.tags})
finally:
    engine.dispose()
'@ | .\\.venv\\Scripts\\python.exe -
if ($LASTEXITCODE -ne 0) { throw "Не удалось подготовить контрольное поле" }
Remove-Item Env:PLANNER_TASK_ID

$putBody = @{ title = "План 104 PUT"; priority = 4; is_done = $true } | ConvertTo-Json -Compress
$put = Invoke-RestMethod -Method Put -Uri "http://127.0.0.1:8000/tasks/$taskId" -ContentType "application/json" -Body $putBody
if ($put.id -ne $taskId) { throw "PUT изменил id" }

$falseResult = Invoke-RestMethod -Method Patch -Uri "http://127.0.0.1:8000/tasks/$taskId" -ContentType "application/json" -Body '{"is_done":false}'
$nullResult = Invoke-RestMethod -Method Patch -Uri "http://127.0.0.1:8000/tasks/$taskId" -ContentType "application/json" -Body '{"is_done":null}'
$emptyResult = Invoke-RestMethod -Method Patch -Uri "http://127.0.0.1:8000/tasks/$taskId" -ContentType "application/json" -Body '{}'
if ($falseResult.is_done -ne $false -or $nullResult.is_done -ne $false -or $emptyResult.is_done -ne $false) { throw "PATCH нарушил прежний контракт" }

$filtered = @(Invoke-RestMethod -Uri "http://127.0.0.1:8000/tasks?is_done=false&sort_desc=true&limit=1")
if ($filtered.Count -ne 1 -or $filtered[0].id -ne $deleteTarget.id) { throw "filter/order/limit вернули неожиданный id" }

$env:PLANNER_TASK_ID = [string]$taskId
@'
import os
from sqlalchemy.orm import Session
from app.DBase.engine import make_engine
from app.DBase.models import TaskRow

engine = make_engine(os.environ["DATABASE_URL"])
try:
    with Session(engine) as session:
        row = session.get(TaskRow, int(os.environ["PLANNER_TASK_ID"]))
        assert row is not None
        assert row.tags == ["manual-104"]
        assert row.title_normalized == row.title.lower()
        print({"id": row.id, "tags": row.tags, "title_normalized": row.title_normalized})
finally:
    engine.dispose()
'@ | .\\.venv\\Scripts\\python.exe -
if ($LASTEXITCODE -ne 0) { throw "PUT потерял внутренние данные" }
Remove-Item Env:PLANNER_TASK_ID

$deleteStatus = (& curl.exe -sS -o NUL -w "%{http_code}" -X DELETE "http://127.0.0.1:8000/tasks/$($deleteTarget.id)").Trim()
$missingStatus = (& curl.exe -sS -o NUL -w "%{http_code}" "http://127.0.0.1:8000/tasks/$($deleteTarget.id)").Trim()
if ($deleteStatus -ne "204" -or $missingStatus -ne "404") { throw "Удаление не подтвердилось новым GET" }

$mainAfter = Invoke-RestMethod -Uri "http://127.0.0.1:8000/tasks/$taskId"
$neighborAfter = Invoke-RestMethod -Uri "http://127.0.0.1:8000/tasks/$($controlB.id)"
if ($mainAfter.title -ne "План 104 PUT" -or $neighborAfter.title -ne "План 104 сосед 2") { throw "Затронута не та задача" }
$mainAfter
$neighborAfter""",
                        "checks": [
                            "PUT сохраняет основной id и внутреннюю метку.",
                            "PATCH false меняет состояние; null и пустой объект его не меняют.",
                            "Фильтрация, порядок и limit выбирают id последней открытой строки.",
                            "SQL-проверка подтверждает нормализованный title и tags до удаления.",
                            "204 дополнен GET 404; основная и контрольная задачи доступны.",
                            "Вывод о числе SQL-записей помечен непроверенным без checkpoint 102.",
                        ],
                    },
                },
                {
                    "title": "Повторно прочитать основную задачу после перезапуска",
                    "task": (
                        "После остановки прежних процессов новый API и новый CLI читают основную задачу "
                        "из того же SQLite-файла. Ответ задачи содержит title, priority и is_done после "
                        "изменений, а статистика соответствует трём оставшимся строкам."
                    ),
                    "requirements": [
                        "Старые API и CLI процессы завершены до нового запуска.",
                        "Новый CLI находит основную задачу с прежним id.",
                        "Новый API GET показывает title=План 104 PUT, priority=4 и is_done=false.",
                        "Новый /stats показывает total=3, open=3, done=0.",
                        "Рабочий JSON и прочие файлы не удаляются и не обновляются ради проверки.",
                    ],
                    "hint": "Сверим результат из независимого процесса и новой Session с итогом шага 3.",
                    "answer": {
                        "explanation": (
                            "Новый процесс убирает из проверки старые переменные, а новый запрос использует "
                            "свою Session. Совпадающее состояние показывает, что результат хранится по прежнему адресу."
                        ),
                        "steps": [
                            "Останавливаем API и убеждаемся, что CLI завершён.",
                            "В новом терминале задаём сохранённый DATABASE_URL и запускаем API.",
                            "Во втором новом терминале задаём тот же URL и запускаем CLI.",
                            "Командой find читаем основную задачу по id, командой stats проверяем CLI.",
                            "После выхода из CLI запрашиваем API GET и /stats.",
                            "Сверяем публичные поля с шагом 3; не запускаем импортёр или повторную инициализацию схемы.",
                        ],
                        "code": """# Терминал 1
$env:DATABASE_URL = Read-Host "Введите тот же временный SQLite URL"
.\\.venv\\Scripts\\python.exe -m uvicorn app.api:app --host 127.0.0.1 --port 8000

# Терминал 2
$env:DATABASE_URL = Read-Host "Введите тот же временный SQLite URL"
$taskId = [int](Read-Host "Введите id основной задачи")
.\\.venv\\Scripts\\python.exe -m app.main
# В CLI вводим: find, id, stats, exit

$task = Invoke-RestMethod -Uri "http://127.0.0.1:8000/tasks/$taskId"
$stats = Invoke-RestMethod -Uri "http://127.0.0.1:8000/stats"
$task
$stats
if ($task.title -ne "План 104 PUT" -or $task.priority -ne 4 -or $task.is_done) { throw "Состояние после restart не совпало" }
if ($stats.total -ne 3 -or $stats.open -ne 3 -or $stats.done -ne 0) { throw "Статистика после restart не совпала" }""",
                        "checks": [
                            "Новые процессы используют тот же путь к SQLite.",
                            "CLI и API показывают прежний id и состояние.",
                            "Статистика равна total=3, open=3, done=0.",
                            "Init, импорт JSON и изменение рабочей базы не выполняются.",
                        ],
                    },
                },
                {
                    "title": "Раздельно принять проверки по checkpoint 100–103",
                    "task": (
                        "Для каждого результата 100–103 журнал и исходный код подтверждают отдельный checkpoint. "
                        "Без подтверждения соответствующая проверка имеет статус SKIP. Подтверждённые проверки "
                        "выполняются только на изолированных данных и своими тестами."
                    ),
                    "requirements": [
                        "100–101: известный отказ, безопасный ответ, отсутствие fallback и последующее восстановление подтверждаются отдельно.",
                        "102: SQL-наблюдение ограничено выбранной проверкой, скрывает параметры и всегда восстанавливается.",
                        "103: проверка запроса соответствует подтверждённой форме выборки и не меняет внешний ответ.",
                        "Rollback относится к ошибке до commit; завершённый commit не объявляется отменённым.",
                        "Отсутствующая запись или реализация приводит к SKIP, а не к выдуманному результату или повреждению базы.",
                    ],
                    "hint": "Сверим журнал, ревизию и тесты по каждому номеру, не выводя готовность из названия ветки.",
                    "answer": {
                        "explanation": (
                            "Номер занятия и наличие похожего тестового файла не доказывают, что механизм "
                            "реализован или пройден. Каждый условный вывод соответствует фактическому коду, "
                            "записи обучения и тесту выбранной ревизии."
                        ),
                        "steps": [
                            "Для 100–101 находим запись обучения и diff известного отказа, rollback/recovery и отсутствия JSON fallback.",
                            "Для 102 находим ограниченное SQL-наблюдение и проверку восстановления listener или override.",
                            "Для 103 находим точный сценарий запроса и ожидаемое поведение.",
                            "В каждом подтверждённом checkpoint запускаем только записанные там тесты на временных данных.",
                            "Если отдельного checkpoint нет, записываем SKIP для этой части и продолжаем независимую практику.",
                            "Не создаём отказ удалением рабочей БД, блокировкой таблицы или переименованием пользовательского файла.",
                        ],
                        "code": """# Из корня проверяемого StudyHub
git rev-parse HEAD
Get-Content STUDYHUB_LEARNINGS.md -Tail 90
git log --oneline --decorate -8
rg -n "StorageError|fallback|rollback|statement|EXPLAIN|query" app tests

# Для каждого подтверждённого checkpoint запускаем указанные там тесты.
# Если запись, код или тест отсутствуют, фиксируем SKIP для этого номера.
# Не подставляем HEAD вместо проверенного checkpoint.""",
                        "checks": [
                            "Каждый номер 100–103 имеет собственное свидетельство или SKIP.",
                            "Тест-команды взяты из подтверждённого checkpoint, а не выдуманы по имени файла.",
                            "SQL-параметры и пользовательские данные не попадают в вывод наблюдателя.",
                            "Проверка отказа не затрагивает рабочую базу и после неё доступ восстановлен.",
                        ],
                    },
                },
                {
                    "title": "Принять health/preferences и оформить свидетельства",
                    "task": (
                        "Health сохраняет прежний статус доступности. Preferences возвращает прежний договор "
                        "представления и клиентской версии, а отчёт разделяет выполненные проверки и пропуски."
                    ),
                    "requirements": [
                        "GET /health возвращает 200 и прежнее тело status=ok.",
                        "GET/PUT/DELETE /preferences сохраняют прежнюю форму, заголовок и cookie-контракт.",
                        "Preferences не трактуются как login, владение задачами или проверка готовности SQLite.",
                        "Отчёт содержит ревизию, тестовую базу, id, статусы HTTP, вывод CLI, restart и тест-команды.",
                        "Каждая непроверенная часть 100–103 явно отмечена SKIP; чистый checkout остаётся занятию 105.",
                    ],
                    "hint": "Сверим каждый вывод с тем, что он действительно подтверждает, и закроем временную cookie-сессию.",
                    "answer": {
                        "explanation": (
                            "Health, preferences и запись задачи дают независимые свидетельства с разными "
                            "границами. В итог попадают только фактически выполненные команды и наблюдения."
                        ),
                        "steps": [
                            "GET /health подтверждает прежний ответ доступности.",
                            "GET /preferences читает compact и X-Planner-Version.",
                            "PUT с detailed устанавливает cookie; следующий GET в той же сессии читает detailed.",
                            "DELETE очищает cookie; новый GET снова возвращает compact.",
                            "Запускаем из корня StudyHub тесты preferences и сохраняем точные коды завершения.",
                            "Записываем ревизию, id задачи, API/CLI наблюдения, статистику, перезапуск и SKIP по checkpoint.",
                        ],
                        "code": """$env:DATABASE_URL = Read-Host "Введите тот же временный SQLite URL"
$health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/health"
if ($health.status -ne "ok") { throw "Health изменил прежний договор" }

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$headers = @{ "X-Client-Version" = "104" }
$base = "http://127.0.0.1:8000/preferences"
$initial = Invoke-WebRequest -UseBasicParsing -Uri $base -Headers $headers -WebSession $session
$initialBody = $initial.Content | ConvertFrom-Json
if ($initial.StatusCode -ne 200 -or $initialBody.view -ne "compact" -or $initial.Headers["X-Planner-Version"] -ne "1") { throw "Начальный preferences ответ не совпал" }

$changed = Invoke-WebRequest -UseBasicParsing -Method Put -Uri $base -Headers $headers -ContentType "application/json" -Body '{"view":"detailed"}' -WebSession $session
$readBack = Invoke-WebRequest -UseBasicParsing -Uri $base -Headers $headers -WebSession $session
$changedBody = $changed.Content | ConvertFrom-Json
$readBackBody = $readBack.Content | ConvertFrom-Json
if ($changed.StatusCode -ne 200 -or $changedBody.view -ne "detailed" -or $readBackBody.view -ne "detailed") { throw "Cookie не сохранила выбранный вид" }

$reset = Invoke-WebRequest -UseBasicParsing -Method Delete -Uri $base -Headers $headers -WebSession $session
$afterReset = Invoke-WebRequest -UseBasicParsing -Uri $base -Headers $headers -WebSession $session
$afterResetBody = $afterReset.Content | ConvertFrom-Json
if ($reset.StatusCode -ne 204 -or $afterResetBody.view -ne "compact") { throw "Сброс preferences не подтвердился" }

.\\.venv\\Scripts\\python.exe -m pytest -q tests/test_preferences.py""",
                        "checks": [
                            "Health отвечает прежним status=ok.",
                            "Preferences проходит compact → detailed → compact с той же cookie-сессией.",
                            "В ответах сохранён X-Planner-Version: 1 и client_version=104.",
                            "Тесты preferences завершились с записанным кодом выхода.",
                            "Отчёт отделяет выполненные пункты от SKIP и не заявляет чистую копию или deploy.",
                        ],
                    },
                },
            ],
            "result": (
                "Основная задача проходит API, CLI и новый запуск на одной временной SQLite-базе. "
                "Публичные ответы и сохранённые внутренние поля проверяются подходящими способами. "
                "Отчёт содержит реальные статусы и раздельный результат каждого checkpoint 100–103."
            ),
        }
    ],
    105: [
        {
            "title": "Передайте воспроизводимый DB Planner",
            "task": (
                "Сначала подтвердите принятую после занятия 104 ревизию и её полный SHA. Если B104 не подтверждён журналом и кодом, зафиксируйте блокер и остановите практику; checkpoint 99 не является заменой. Только после этого подготовьте README и пример настроек StudyHub Planner на чистой копии. "
                "На отдельном checkout подтверждённой ревизии создайте новую среду, "
                "подготовьте пустую SQLite, пройдите тесты и проверьте один сценарий между API и CLI. Итогом является "
                "воспроизводимый запуск и точная запись о том, что проверено и что остаётся следующей главе."
            ),
            "tasks": [
                {
                    "title": "1. Подтвердите вход A105 или зафиксируйте блокер",
                    "task": (
                        "До запуска проверьте, что B104 действительно принят и связан с конкретным commit. Если источник и соответствующий код недоступны, итог карточки: «заблокировано», карточки 2–5 не выполняются. "
                        "Отдельная рабочая копия не зависит от локальных файлов, базы и виртуальной среды."
                    ),
                    "requirements": [
                        "Источник подтверждения B104 и полный SHA указаны раздельно.",
                        "Только после подтверждения B104 проверка выполняется в новом каталоге с чистым git status.",
                        "Если B104 не подтверждён, записан блокер; SHA не угадывается и checkpoint 99 не подставляется.",
                    ],
                    "hint": "Сначала найдём принятую сдачу 104 и сверим её с кодом. Если доказательства нет, правильный результат карточки: блокер, а не запуск на более старой версии.",
                    "answer": {
                        "explanation": "План A105 прямо требует принятую B104. Номер занятия, план и самый новый доступный commit не подтверждают его. Пока журнал и код заканчиваются раньше 104, зависимые проверки были бы недостоверными; это нужно показать как блокер.",
                        "steps": [
                            "Сверяем запись о принятии B104 с фактической историей и содержимым StudyHub.",
                            "Если подтверждения нет, записываем, чего именно не хватает, прекращаем проверку и не выдаём дальнейшие шаги за выполненные.",
                            "Если подтверждение есть, фиксируем источник и полный SHA, клонируем репозиторий в отдельный каталог, переключаемся на подтверждённый SHA и сверяем git rev-parse HEAD с записью о B104 и git status --short.",
                            "Не используем старые .venv, .env, SQLite и неотслеживаемые файлы исходной папки.",
                        ],
                        "code": """# Выполнять только после подтверждения B104 журналом и кодом.
$acceptedB104 = "<FULL_SHA_FROM_CONFIRMED_B104>"
if ($acceptedB104 -notmatch '^[0-9a-fA-F]{40}$') {
    throw "B104 не подтверждён. Остановите практический прогон."
}
git clone https://github.com/unikoff/studyhub.git studyhub-105-check
Set-Location studyhub-105-check
git checkout $acceptedB104
$actual = (git rev-parse HEAD).Trim()
if ($actual -ne $acceptedB104) { throw "Checkout не совпал с принятым B104." }
git status --short""",
                        "checks": [
                            "При отсутствии подтверждённого B104 карточки 2–5 не запускаются, а зависимость названа прямо.",
                            "При наличии подтверждения его источник записан, SHA совпал с HEAD отдельного checkout, рабочее дерево чистое.",
                            "Для выполнения используются только файлы выбранного commit и явно созданная среда.",
                        ],
                    },
                },
                {
                    "title": "2. Сверьте README с настоящим проектом",
                    "task": "Инструкция запуска совпадает с файлами и командами выбранного checkpoint. Исправляются только подтверждённые расхождения в README, примере настроек или ignore.",
                    "requirements": [
                        "README задаёт Python, runtime и test-зависимости, настройки, явную инициализацию, тесты и запуск CLI/API.",
                        "Команды и имена файлов совпадают с чистой ревизией, результат каждого этапа наблюдаем.",
                        "API и CLI используют один DATABASE_URL; схема и перенос JSON не запускаются автоматически.",
                        "В .env.example нет секретов и персональных значений; локальный .env не передаётся.",
                    ],
                    "hint": "Пройдём README по порядку и сверим имена с файлами. requirements.txt и requirements-dev.txt могут содержать разные наборы пакетов.",
                    "answer": {
                        "explanation": "Решение исправляет только подтверждённые расхождения. Если инструкция уже совпадает с проектом, новый diff ради формальности не нужен.",
                        "steps": [
                            "Сверяем Python и requirements-файлы с импортами проекта и настройками тестов.",
                            "Проверяем DATABASE_URL, разрешение пути и существующую команду init_db.",
                            "Уточняем порядок установки, настройки, создания схемы, тестов и запуска обоих интерфейсов.",
                            "Оставляем импорт JSON отдельной процедурой, если она есть в проекте.",
                            "Редактируем документацию только при конкретном расхождении, затем повторяем затронутый шаг.",
                        ],
                        "checks": [
                            "Каждая команда README существует в выбранной ревизии и выполняется из указанной папки.",
                            "Тестовые зависимости установлены до тестов.",
                            "README не обещает миграции, авторизацию или production deployment.",
                        ],
                    },
                },
                {
                    "title": "3. Создайте чистую среду и новую базу",
                    "task": "Установка и настройка проходят в новой виртуальной среде и обращаются к отдельной тестовой SQLite. Схема создаётся явно, тесты не используют рабочую базу.",
                    "requirements": [
                        "Пакеты установлены Python из новой .venv по файлу зависимостей README.",
                        "DATABASE_URL указывает на новую тестовую БД, не на рабочие или архивные данные.",
                        "Схема создана штатной командой init_db до запуска приложения.",
                        "Повтор init_db на совпадающей схеме сохраняет тестовую задачу.",
                        "Полный набор тестов запускается без ручной установки недекларированных пакетов.",
                    ],
                    "hint": "Сначала создадим venv и установим объявленные зависимости, затем зададим тестовый адрес и выполним задокументированные проверки.",
                    "answer": {
                        "explanation": "Новая venv исключает глобальные пакеты, а отдельная SQLite защищает рабочие данные. Создание отсутствующих таблиц не меняет существующую схему.",
                        "steps": [
                            "Из корня checkout создаём venv и устанавливаем файл dev-зависимостей.",
                            "Копируем .env.example в локальный .env и указываем отдельный DATABASE_URL.",
                            "Сверяем команду init_db с кодом и создаём исходную схему до первого запуска приложения.",
                            "Через CLI создаём контрольную задачу, записываем её id, повторяем init_db и через CLI читаем тот же id.",
                        ],
                        "code": """py -3.12 -m venv .venv
./.venv/Scripts/python.exe -m pip install -r requirements-dev.txt
Copy-Item .env.example .env
# В .env задать DATABASE_URL=sqlite:///data/a105-test.sqlite3
./.venv/Scripts/python.exe -m app.DBase.init_db
# Запустить CLI, добавить контрольную задачу, записать id и выйти
./.venv/Scripts/python.exe -m app.main
./.venv/Scripts/python.exe -m app.DBase.init_db
# Снова запустить CLI и командой find проверить тот же id
./.venv/Scripts/python.exe -m app.main
./.venv/Scripts/python.exe -m pytest -q""",
                        "checks": [
                            "Используется Python именно из новой .venv.",
                            "Тестовый адрес отличается от рабочей базы и архивов.",
                            "После второго init_db контрольная задача остаётся в таблице.",
                            "Записан фактический результат тестов, а не исторический счётчик из README.",
                        ],
                    },
                },
                {
                    "title": "4. Проверьте общую историю API и CLI",
                    "task": "API и CLI используют одну тестовую SQLite и сохраняют результат после нового процесса. Сценарий проверяет общую базу и прежний договор.",
                    "requirements": [
                        "POST /tasks возвращает 201 и id контрольной задачи; CLI find находит именно этот id.",
                        "CLI done меняет задачу; GET /tasks/{id} возвращает is_done=true на том же DATABASE_URL, в том числе после перезапуска API.",
                        "Внутренние tags проверены отдельным чтением тестовой БД или готовой проверкой; CLI используется только если его фактический вывод содержит tags. Новый HTTP endpoint не добавляется.",
                        "Прежние API/CLI-возможности, ошибки и отсутствие JSON-fallback соответствуют принятому B104.",
                    ],
                    "hint": "Проверим одну контрольную задачу в обоих направлениях. Ответ текущего запроса не заменяет чтение после нового процесса.",
                    "answer": {
                        "explanation": "Один DATABASE_URL связывает интерфейсы с общей базой. Новое чтение доказывает сохранённый результат; внутренние tags сверяются вне публичного HTTP-ответа.",
                        "steps": [
                            "Открываем CLI и API из чистого checkout с тестовым DATABASE_URL.",
                            "Создаём задачу через API и находим её CLI-командой.",
                            "Меняем статус через CLI и проверяем GET /tasks/{id}.",
                            "Останавливаем API, запускаем новый процесс на том же DATABASE_URL и повторно читаем задачу.",
                            "Проверяем tags отдельным чтением тестовой БД или готовым тестом; используем CLI только если его фактический вывод их содержит. Повторяем прежние проверки из принятого B104.",
                        ],
                        "code": """$payload = @{ title = "A105 shared DB probe"; priority = 3 } | ConvertTo-Json
$created = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/tasks" -ContentType "application/json" -Body $payload
$taskId = $created.id  # Ожидаем HTTP 201 и сохраняем id
# В CLI выберите find, введите $taskId; затем done, введите тот же id; завершите CLI.
# Остановите и заново запустите API согласно README, сохранив DATABASE_URL.
$afterRestart = Invoke-RestMethod -Uri "http://127.0.0.1:8000/tasks/$taskId"
$afterRestart.is_done  # Ожидаем True""",
                        "checks": [
                            "API вернул 201 и id; CLI нашёл и изменил ту же запись.",
                            "После нового процесса API вернул is_done=true для того же id.",
                            "Отказ не переключает приложение на JSON или другую базу.",
                            "Тестовые процессы и overrides завершены, рабочие данные не затронуты.",
                        ],
                    },
                },
                {
                    "title": "5. Проверьте состав передачи и её границы",
                    "task": "Составьте handoff из наблюдавшихся фактов: источник и полный SHA B104, среда и команды, результаты тестов и сквозного сценария, проверка состава репозитория и ограничения. Передаваемый checkpoint содержит код и безопасные инструкции, но не локальную базу, секреты, архивы или персональные задачи.",
                    "requirements": [
                        "Проверены tracked-файлы и возможные секреты; .gitignore не считается удалением уже tracked-файла.",
                        "В handoff указаны commit, выполненные команды и фактические результаты.",
                        "SQLite, .env, архивы и персональные задачи остаются локальными и не удаляются ради проверки.",
                        "Следующей главе передана одна исходная таблица без уже изученных миграций, пользователя, владения и авторизации.",
                        "Коммит, push, публикация и развёртывание не выполняются.",
                    ],
                    "hint": "Сверим индекс Git отдельно от ignore и составим handoff из наблюдавшихся результатов. Значения .env не выводим.",
                    "answer": {
                        "explanation": "Другой человек должен повторить команды на указанной ревизии. Ограничения называются прямо, а ignore не заменяет проверку уже отслеживаемых файлов.",
                        "steps": [
                            "Сверяем tracked-файлы и правила ignore для .env, SQLite, журналов и архивов.",
                            "Проверяем tracked-пути, ignore и пример настроек; при обнаружении секрета не выводим его значение и останавливаем передачу до отдельного разбора.",
                            "Записываем SHA и источник B104, версию Python, команды и фактические результаты тестов, init_db и сквозного сценария с id задачи.",
                            "Называем границу следующей главы: изменение заполненной схемы, затем пользователь и владение задачами.",
                            "Не объявляем cookie preferences авторизацией и не обещаем будущие миграции или deployment.",
                        "Если входная карточка заблокирована, в handoff перечисляем недостающие подтверждения и не заявляем, что чистый прогон состоялся.",
                        ],
                        "checks": [
                            "В передаче указаны только фактически выполненные проверки.",
                            "Рабочие данные не попали в репозиторий и не удалялись ради проверки.",
                            "Следующая глава начинается с точной B главы, а не со старой нумерации.",
                        ],
                    },
                },
            ],
            "result": "Если B104 не подтверждён, в карточке 1 записан конкретный блокер, а карточки 2–5 не выдаются за пройденные. После подтверждения B104 чистый checkout проходит README в новой среде: исходная SQLite создаётся явно, тесты и сценарий API/CLI подтверждают состояние, а handoff содержит точный commit, факты проверки и границу следующей главы.",
        }
    ]
}

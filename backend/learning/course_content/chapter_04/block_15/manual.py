from typing import Any

MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    91: [
        {
            "title": "PUT: заменить поля и сохранить данные задачи",
            "task": "На checkpoint StudyHub 12053e2 подтверждены SQL create/list/get и транзакционная область; штатный путь остаётся JSON. SQL-версия прежнего PUT изменяет существующую задачу Planner и заменяет title, priority и is_done, сохраняя id/tags и согласованный title_normalized. Маршрут, TaskUpdate и публичный TaskRead не меняются. Результат подтверждается временной SQLite и независимым чтением новой Session.",
            "tasks": [
                {
                    "title": "Адресное SQL-обновление",
                    "task": "SqlTaskRepository.replace обновляет TaskRow с заданным id и возвращает доменную Task. Отсутствующая строка даёт None; соседние записи и внутренние tags сохраняются.",
                    "requirements": ["Строка выбирается по task_id.", "Публичные title, priority и is_done заменяются; id и копия прежних tags сохраняются.", "title_normalized равен task.title.lower().", "Репозиторий вызывает flush, но не commit или close."],
                    "hint": "Мы меняем уже загруженную строку и возвращаем обычную Task.",
                    "answer": {"explanation": "Мы адресуем одну ORM-строку по ключу. Новая проверенная Task приносит полные публичные значения, а прежние tags копируются; отсутствие строки не запускает создание. Flush отправляет UPDATE в транзакцию сервиса.", "steps": ["Мы получаем TaskRow по id и возвращаем None, если её нет.", "Заменяем публичные поля и вычисляем технический заголовок по правилу Python.", "Сохраняем id, присваиваем копию tags и выполняем flush.", "Mapping возвращает доменную Task, а Session остаётся у владельца транзакции."], "code": "def replace(self, task_id: int, task: Task) -> Task | None:\n    row = self.session.get(TaskRow, task_id)\n    if row is None:\n        return None\n    row.title = task.title\n    row.priority = task.priority\n    row.is_done = task.is_done\n    row.tags = task.tags.copy()\n    row.title_normalized = task.title.lower()\n    self.session.flush()\n    return task_from_row(row)", "checks": ["Меняется одна выбранная строка.", "id, tags и связанный заголовок согласованы.", "Репозиторий не подтверждает и не закрывает транзакцию."]}
                },
                {
                    "title": "Существующий сервисный PUT",
                    "task": "PlannerService.replace_task выполняет чтение, проверку новой Task и SQL-замену внутри write_scope. TaskUpdate, прежний маршрут и TaskRead сохраняют HTTP-договор.",
                    "requirements": ["write_scope охватывает первое чтение, проверку и запись.", "Новая Task получает id и копию tags до вызова репозитория.", "Неизвестный id сохраняет HTTP 404; неполное или невалидное тело сохраняет HTTP 422.", "Успешный ответ следует после завершения области записи."],
                    "hint": "Мы открываем область до первого SELECT, чтобы чтение и замена были одной операцией.",
                    "answer": {"explanation": "Мы оставляем предметный сценарий в сервисе. Он получает текущую Task, строит и проверяет новое состояние, затем вызывает repository.replace. Исключение до успешного выхода из write_scope не даёт вернуть ложный успех.", "steps": ["Мы входим в write_scope до get_task.", "Отсутствие задачи проходит прежним путём к TaskNotFoundError.", "Строим Task с прежними id/tags и полями полного PUT.", "Вызываем replace; HTTP-слой возвращает прежнюю публичную форму."], "code": "with self.write_scope():\n    current = self.get_task(task_id)\n    updated = Task(\n        id=current.id, title=title, priority=priority,\n        is_done=is_done, tags=current.tags.copy(),\n    )\n    saved = self.repository.replace(current.id, updated)\n    if saved is None:\n        self._raise_task_not_found(current.id)\nreturn saved", "checks": ["Чтение, проверка и запись в одной транзакции.", "404 и 422 сохраняют прежний договор.", "TaskRead не раскрывает tags и title_normalized."]}
                },
                {
                    "title": "Сохранённое состояние после PUT",
                    "task": "Временная SQLite содержит выбранную задачу с tags и соседа. PUT меняет публичные поля; новая Session видит результат, а повторяющийся title допускается.",
                    "requirements": ["Ответ 200 сохраняет прежнюю форму без внутренних полей.", "Новая Session видит прежний id/tags, новый title/priority, is_done=False и согласованный title_normalized.", "Совпадающий title не запрещён; соседняя запись остаётся прежней."],
                    "hint": "Мы читаем целевую и соседнюю строки после закрытия исходного ресурса.",
                    "answer": {"explanation": "Мы сверяем публичный ответ и внутренние колонки отдельной Session. Явное False должно сохраниться, дублирующийся заголовок не конфликтует с уникальностью, а сосед подтверждает адресность.", "steps": ["Создаём две строки на временной базе, у целевой есть непустые tags, и сохраняем снимок соседа до PUT.", "Через PUT передаём title соседа и is_done=False.", "После ответа читаем обе строки новой Session.", "Сравниваем публичный ответ, внутренние поля и сохранённый снимок соседа."], "code": "assert response.status_code == 200\nassert \"tags\" not in response.json()\nwith session_factory() as verify_session:\n    changed = verify_session.get(TaskRow, task_id)\n    neighbor = verify_session.get(TaskRow, neighbor_id)\n    assert changed.title == neighbor.title\n    assert changed.is_done is False\n    assert changed.tags == original_tags\n    assert changed.title_normalized == changed.title.lower()\n    assert (neighbor.id, neighbor.title, neighbor.priority, neighbor.is_done, neighbor.tags, neighbor.title_normalized) == original_neighbor_state", "checks": ["Независимое чтение подтверждает ответ.", "Повторяющийся title допустим.", "id/tags сохранены, сосед не изменился."]}
                },
                {
                    "title": "Ошибки и регрессия",
                    "task": "Ошибки PUT не оставляют частичную замену, SQL create/get и JSON PUT работают по прежним сценариям. SQL provider используется только в изолированной проверке.",
                    "requirements": ["Неизвестный id возвращает 404; отсутствующее обязательное поле и невалидное значение возвращают 422.", "Ошибка предметной проверки происходит до UPDATE.", "SQL-ошибка до commit откатывает запись; новая Session видит исходное состояние.", "SQL create/get и JSON PUT проходят регрессию; default не переключён."],
                    "hint": "Мы отделяем отказ проверки модели от отказа SQL-записи.",
                    "answer": {"explanation": "Мы проверяем две границы отказа. При ошибке модели репозиторий не вызывается; ошибка UPDATE выходит из транзакции и отменяет замену. После теста восстанавливаем override и подтверждаем прежний JSON путь.", "steps": ["Мы отправляем запросы с неизвестным id, неполным телом и невалидным значением.", "Считаем SQL-команды и подтверждаем отсутствие UPDATE при ошибке модели.", "До записи сохраняем исходный tuple; вызываем контролируемый отказ, затем сравниваем его с чтением новой Session.", "Повторяем create/get и JSON PUT с восстановленным dependency override."], "code": "with pytest.raises(IntegrityError):\n    planner.replace_task(task_id, title=\"Rejected\", priority=1, is_done=True)\nwith session_factory() as verify_session:\n    row = verify_session.get(TaskRow, task_id)\n    assert (row.title, row.priority, row.is_done, row.tags, row.title_normalized) == original_state", "checks": ["Ошибка валидации не вызывает UPDATE.", "После SQL-ошибки сохранено исходное состояние.", "Проверки не меняют штатный JSON-путь."]}
                }
            ],
            "result": "Существующий PUT адресно обновляет одну SQL-строку, сохраняет внутренние данные и HTTP-контракт; JSON остаётся штатным до общего переключения."
        }
    ],
    92: [
        {
            "title": "PATCH: SQL-обновление только переданных полей",
            "task": "Существующий HTTP PATCH сохраняет прежний договор: пропуск и null не меняют поле, а переданный False применяется. SQL-репозиторий обновляет выбранную строку через PlannerService; обычные API и CLI продолжают использовать JSON до общего переключения.",
            "tasks": [
                {
                    "title": "Подтвердить вход занятия",
                    "task": "Checkpoint содержит завершённые SQL create и PUT, актуальный путь SqlTaskRepository и общую область записи. Номер плана или незакоммиченный код не заменяют подтверждённое состояние StudyHub.",
                    "requirements": ["Укажите подтверждённый commit и отделите его от рабочего diff.", "Подтвердите create, PUT, list/get и область транзакции на этом checkpoint.", "Проверьте расположение репозитория и прежнюю JSON-сборку API/CLI.", "При отсутствии B90 или B91 назовите точный блокер и не считайте зависимую практику выполненной."],
                    "hint": "Мы сверяем журнал обучения и код на одном checkpoint.",
                    "answer": {"explanation": "Для работы важны реально существующие create/replace, точное расположение SQL-репозитория и область, завершающая запись до ответа. Коммит после 89 подтверждает только вход B14.", "steps": ["Сверяем commit с STUDYHUB_LEARNINGS.md.", "Проверяем create, PUT и тесты на подтверждённом состоянии.", "Проверяем путь репозитория и границу записи.", "Подтверждаем JSON как штатный источник до 98."], "code": "git log -1 --oneline\ngit status --short\nrg -n \"def create|def replace|write_scope|SqlTaskRepository\" app tests", "checks": ["Checkpoint отделён от незакоммиченных изменений.", "Путь репозитория совпадает с проверенным кодом.", "Обычный источник API/CLI остаётся JSON."]}
                },
                {
                    "title": "Добавить адресный update",
                    "task": "Метод update получает id и проверенную Task, обновляет соответствующую TaskRow и возвращает обычную Task через прежний mapping. Для отсутствующей строки возвращается None; Session остаётся у внешнего сервисного сценария.",
                    "requirements": ["Ищите строку по тому же id.", "Сохраните id, значения Task, отдельную копию tags и title.lower() в title_normalized.", "Для отсутствующей строки верните None, не создавая новую запись.", "Не добавляйте commit, close, endpoint, JSON-fallback или перезапись таблицы."],
                    "hint": "Мы меняем загруженную ORM-строку, не удаляем её для повторной вставки.",
                    "answer": {"explanation": "Репозиторий обновляет одну строку и возвращает доменный объект. Копия tags отделяет изменяемый список; title_normalized остаётся согласован с заголовком. Commit выполняет сервисная область.", "steps": ["Получаем row через session.get(TaskRow, task_id).", "При отсутствии возвращаем None.", "Присваиваем публичные значения проверенной Task и копию tags.", "Вычисляем title_normalized через Python lower().", "Возвращаем task_from_row(row) без commit или close."], "code": "def update(self, task_id: int, task: Task) -> Task | None:\n    row = self.session.get(TaskRow, task_id)\n    if row is None:\n        return None\n    row.title = task.title\n    row.priority = task.priority\n    row.is_done = task.is_done\n    row.tags = task.tags.copy()\n    row.title_normalized = task.title.lower()\n    return task_from_row(row)", "checks": ["Обновлена выбранная строка с прежним id.", "Соседняя строка не изменилась.", "Метод не подтверждает транзакцию и не закрывает Session."]}
                },
                {
                    "title": "Сохранить прежний сервисный PATCH",
                    "task": "PlannerService.patch_task сохраняет предметную проверку и прежний HTTP-договор. Одна область записи охватывает первое чтение, no-op и SQL update; маршрут и TaskPatch не содержат SQL.",
                    "requirements": ["Оставьте exclude_unset=True и exclude_none=True в API.", "Стройте Task из текущего состояния и переданных не-null значений.", "Применяйте False и пропускайте update при пустом изменении.", "Открывайте write_scope до первого SQL-чтения.", "Не добавляйте отдельный commit в репозитории или после ответа."],
                    "hint": "Мы оставляем HTTP-адаптацию на месте и используем существующую сервисную границу из 90.",
                    "answer": {"explanation": "Сервис получает текущую Task внутри write_scope. Пустой PATCH известного id возвращает её без UPDATE, а непустые значения проходят проверку новой Task до записи. Выход из области подтверждает SQL до ответа.", "steps": ["Открываем write_scope до get_task.", "Неизвестный id сохраняет прежнюю предметную ошибку.", "Для no-op возвращаем текущую Task.", "Иначе копируем tags, применяем только заданные значения и вызываем repository.update.", "Возвращаем результат после успешного выхода из контекста."], "code": "with self.write_scope():\n    current = self.get_task(task_id)\n    if title is None and priority is None and is_done is None:\n        return current\n    updated = Task(\n        id=current.id,\n        title=current.title if title is None else title,\n        priority=current.priority if priority is None else priority,\n        is_done=current.is_done if is_done is None else is_done,\n        tags=current.tags.copy(),\n    )\n    saved = self.repository.update(current.id, updated)\n    if saved is None:\n        self._raise_task_not_found(current.id)\n    return saved", "checks": ["False применён, None не очищает поле.", "Пустой PATCH не вызывает update, но проверяет id.", "Чтение, проверка и запись находятся в одной области."]}
                },
                {
                    "title": "Проверить результат и ошибки новой Session",
                    "task": "Файловая SQLite-fixture содержит целевую задачу с tags и соседнюю строку. Изменения, no-op, ошибки и сочетания PUT/PATCH проверяются повторным чтением отдельной Session.",
                    "requirements": ["Проверьте title, priority, is_done=False и смесь null/False.", "Сравните пустой PATCH для известного и неизвестного id.", "Проверьте невалидный ввод и отказ до commit.", "Сверьте id, tags, title_normalized, пропущенные поля и соседа.", "Пройдите оба порядка PUT/PATCH через существующий HTTP-маршрут и восстановите override."],
                    "hint": "Мы читаем строку после закрытия исходного ресурса, а штатный Planner отдельно проверяем на JSON.",
                    "answer": {"explanation": "Новая Session доказывает сохранённое состояние вне прежней identity map. Ожидаемое поведение сохраняет пропущенные поля, null, id и tags, применяет False, а отказ до commit оставляет прежнюю запись.", "steps": ["Создаём две записи на временной базе.", "Выполняем PATCH через прежний сервисный путь.", "Закрываем исходный ресурс и читаем id новой Session.", "Проверяем отсутствие побочной записи при no-op и отказе.", "Проверяем оба порядка PUT/PATCH и прежнюю JSON-сборку после восстановления override."], "code": "with session_factory() as verify_session:\n    row = verify_session.get(TaskRow, task_id)\n    assert row.is_done is False\n    assert row.tags == [\"urgent\"]\n    assert row.title_normalized == row.title.lower()", "checks": ["Новая Session видит ожидаемые значения.", "Известный no-op не выполняет UPDATE, неизвестный id сохраняет 404.", "После ошибки прежнее состояние и соседняя строка целы.", "Публичный ответ не содержит tags или title_normalized.", "Обычные API и CLI остаются на JSON до 98."]}
                }
            ],
            "result": "PATCH сохраняет прежний частичный договор через адресный SQL update; результат подтверждён новой Session, а штатный Planner продолжает использовать JSON."
        }
    ],
    93: [
        {
            "title": "Завершение и удаление через SQL",
            "task": (
                "Существующие сценарии StudyHub Planner выполняются через SQL на изолированной SQLite. "
                "Первый done обновляет выбранную задачу, повторный не выполняет UPDATE. DELETE удаляет только выбранную строку и возвращает None из сервиса. "
                "HTTP/CLI-договор сохраняется, commit/rollback подтверждаются новой Session, штатная сборка остаётся на JSON."
            ),
            "tasks": [
                {
                    "title": "Подтвердить вход после PATCH",
                    "task": "B90-B92 подтверждены: SQL create, replace, update, прежний PATCH-контракт и write_scope от чтения до записи. Checkpoint после занятия 92 в StudyHub соответствует commit 7c77217.",
                    "requirements": [
                        "Сверьте запись B92 в STUDYHUB_LEARNINGS.md с историей и подтвердите 7c77217 или его точный эквивалент.",
                        "На checkpoint найдите SqlTaskRepository.create/replace/update и транзакционный write_scope.",
                        "Отдельно запишите текущий git status и diff.",
                        "Подтвердите прежний PATCH-контракт и JSON как штатный источник API/CLI до занятия 98.",
                        "Если B90-B92 не подтверждены, назовите первый отсутствующий шаг и не засчитывайте зависимые изменения 93."
                    ],
                    "hint": "Мы сверяем журнал обучения и код на одном checkpoint. Более новый HEAD не подменяет историческую точку входа.",
                    "answer": {
                        "explanation": "Занятия 90-92 дают SQL create/PUT/PATCH, общий update и границу транзакции. Commit 7c77217 завершает входную работу PATCH. Незакоммиченные файлы показывают рабочее дерево, но не доказывают, что предыдущая точка пройдена.",
                        "steps": ["Сверяем запись B92 в STUDYHUB_LEARNINGS.md с git history.", "Читаем create/replace/update и write_scope из checkpoint 7c77217.", "Отдельно фиксируем git status и diff текущего дерева.", "Подтверждаем JSON default; при отсутствии B90-B92 останавливаем зависимые карточки."],
                        "code": "git show --stat --oneline 7c77217\ngit status --short\ngit show 7c77217:app/DBase/repositories.py\ngit show 7c77217:app/services.py",
                        "checks": ["Checkpoint подтверждён журналом и кодом.", "Рабочие изменения отделены от commit.", "Обычный API/CLI остаётся на JSON."]
                    }
                },
                {
                    "title": "Сохранить идемпотентность done",
                    "task": "PlannerService.mark_done использует SQL-сценарий. Первый вызов применяет Task.mark_done и общий repository.update; повторный возвращает завершённую Task без второго UPDATE.",
                    "requirements": [
                        "Откройте write_scope до первого SQL-чтения; неизвестный id сохраняет TaskNotFoundError.",
                        "Для незавершённой задачи создайте Task-копию с прежними id, title, priority и копией tags; примените Task.mark_done и общий update.",
                        "Дважды вызовите mark_done для одной задачи и подтвердите ровно один UPDATE.",
                        "Повтор не вызывает update; title_normalized не меняется, если title тот же.",
                        "Новой Session подтвердите поля цели и неизменность соседа."
                    ],
                    "hint": "Мы наблюдаем состояние Task и число SQL-команд раздельно.",
                    "answer": {
                        "explanation": "Сервис начинает транзакцию до get_task. Уже завершённая задача возвращается без update. Для первого завершения отдельная Task-копия получает предметное изменение, затем общий SQL update записывает выбранную строку.",
                        "steps": ["Создаём цель is_done=False и соседа с другими id/tags.", "Считаем UPDATE при двух вызовах mark_done.", "Проверяем, что первый меняет флаг, а второй не вызывает update.", "Закрываем исходную Session и сверяем обе записи новой Session."],
                        "code": "with self.write_scope():\n    task = self.get_task(task_id)\n    if task.is_done:\n        return task\n    updated = Task(\n        id=task.id, title=task.title, priority=task.priority,\n        is_done=task.is_done, tags=task.tags.copy(),\n    )\n    updated.mark_done()\n    saved = self.repository.update(updated.id, updated)\n    if saved is None:\n        self._raise_task_not_found(updated.id)\nreturn saved",
                        "checks": ["Повторный done не создаёт UPDATE.", "Цель сохраняет id/title/priority/tags.", "Сосед и title_normalized не меняются.", "Неизвестный id не создаёт строку."]
                    }
                },
                {
                    "title": "Удалять только выбранную ORM-строку",
                    "task": "SqlTaskRepository.delete(task_id) находит TaskRow по id, возвращает False при отсутствии, иначе вызывает Session.delete и возвращает True. Commit остаётся у write_scope.",
                    "requirements": [
                        "Получайте строку через self.session.get(TaskRow, task_id).",
                        "При отсутствии возвращайте False без записи.",
                        "Для найденной строки вызывайте self.session.delete(row) и возвращайте True.",
                        "Не добавляйте commit/close, повторную вставку или удаление таблицы целиком.",
                        "Проверьте неизвестный id и сохранность соседа."
                    ],
                    "hint": "Мы помечаем один загруженный объект; транзакцию завершает внешний контекст.",
                    "answer": {
                        "explanation": "Session.delete отмечает ORM-строку для удаления. Репозиторий не подтверждает транзакцию. False преобразуется сервисом в прежнюю ошибку отсутствия.",
                        "steps": ["Загружаем строку по id.", "Возвращаем False, если get не нашёл её.", "Передаём только найденный объект в Session.delete.", "Возвращаем True без flush/commit в репозитории."],
                        "code": "def delete(self, task_id: int) -> bool:\n    row = self.session.get(TaskRow, task_id)\n    if row is None:\n        return False\n    self.session.delete(row)\n    return True",
                        "checks": ["Удаляется только выбранный id.", "Неизвестный id возвращает False.", "Репозиторий не коммитит и не закрывает Session."]
                    }
                },
                {
                    "title": "Сохранить договор HTTP и CLI",
                    "task": "SQL-изменения подключены под прежний PlannerService. HTTP и CLI не знают о TaskRow/Session; SQL включается только через тестовую подмену.",
                    "requirements": [
                        "Завершайте задачу существующим PATCH с is_done=True, не добавляйте endpoint.",
                        "Проверьте DELETE 204 с пустым телом, затем GET 404 и повторный DELETE 404.",
                        "Вызовите существующие CLI handlers done/delete через sql_service_context и сравните сообщения.",
                        "Восстановите dependency_overrides и подтвердите штатный JSON-путь."
                    ],
                    "hint": "Мы временно подменяем источник для проверки, не переключая рабочую сборку.",
                    "answer": {
                        "explanation": "HTTP использует существующие PATCH/DELETE, CLI вызывает те же сервисные методы. Удаление возвращает None и маршрут формирует 204 без body; TaskNotFoundError остаётся причиной 404.",
                        "steps": ["Создаём SQLite-fixture и подключаем её существующим SQL provider.", "Проверяем PATCH done и DELETE.", "Проверяем пустое тело 204, затем GET и повторный DELETE 404.", "Вызываем CLI handlers внутри SQL-контекста.", "В finally восстанавливаем overrides и проверяем обычный JSON-сервис."],
                        "code": "deleted = api_client.delete(f\"/tasks/{task_id}\")\nassert deleted.status_code == 204\nassert deleted.content == b\"\"\nassert api_client.get(f\"/tasks/{task_id}\").status_code == 404\nassert api_client.delete(f\"/tasks/{task_id}\").status_code == 404",
                        "checks": ["HTTP-контракт не меняется.", "CLI-сообщения остаются прежними.", "После override API/CLI снова используют JSON."]
                    }
                },
                {
                    "title": "Подтвердить транзакцию и сохранность",
                    "task": "Временная база подтверждает commit после done/delete, rollback обоих изменений при отказе до commit и независимое чтение цели и соседа.",
                    "requirements": [
                        "Используйте только SQLite в tmp_path, не рабочую базу или JSON.",
                        "После успешных операций закройте исходный ресурс и проверьте результат новой Session.",
                        "Отдельно вызовите контролируемый отказ до commit при mark_done и delete.",
                        "После rollback done оставляет цель открытой, delete сохраняет удаляемую строку; сосед и все поля не меняются.",
                        "Убедитесь, что исключение не превращается в 204 и следующая операция после rollback работает."
                    ],
                    "hint": "Мы поднимаем исключение до успешного выхода из Session.begin и читаем базу новым ресурсом.",
                    "answer": {
                        "explanation": "write_scope охватывает чтение и изменение. Исключение до успешного выхода из Session.begin приводит к rollback. Новая Session проверяет состояние базы, а не identity map первого ресурса. В StudyHub SQL-отказ удаления отдельно проверен ограничением SQLite.",
                        "steps": ["Создаём открытую цель, удаляемую цель и соседа с разными полями в tmp_path.", "Подтверждаем успешные done/delete независимым чтением.", "В отдельных тестах после yield из write_scope поднимаем исключение до завершения Session.begin для mark_done и delete.", "Новой Session подтверждаем, что первая цель открыта, удаляемая строка на месте и сосед неизменен.", "Убираем отказ и проверяем следующую обычную операцию."],
                        "code": "@contextmanager\ndef fail_before_commit(session):\n    with session.begin():\n        yield\n        session.flush()\n        raise RuntimeError(\"controlled failure\")\n\nplanner = build_service(repository=SqlTaskRepository(session), write_scope=lambda: fail_before_commit(session))\nfor action, task_id in ((planner.mark_done, open_id), (planner.delete_task, delete_id)):\n    with pytest.raises(RuntimeError):\n        action(task_id)\n\nwith session_factory() as verify_session:\n    assert verify_session.get(TaskRow, open_id).is_done is False\n    deleted = verify_session.get(TaskRow, delete_id)\n    neighbor = verify_session.get(TaskRow, neighbor_id)\n    assert (opened.id, opened.title, opened.priority, opened.is_done, opened.tags, opened.title_normalized) == expected_open\n    assert (deleted.id, deleted.title, deleted.priority, deleted.is_done, deleted.tags, deleted.title_normalized) == expected_deleted\n    assert (neighbor.id, neighbor.title, neighbor.priority, neighbor.is_done, neighbor.tags, neighbor.title_normalized) == expected_neighbor",
                        "checks": ["Новая Session видит committed результат.", "Rollback отменяет оба изменения и сохраняет соседа.", "Сверены id, title, priority, is_done, tags и title_normalized.", "После rollback SQL-сервис работает дальше.", "Рабочие данные не использовались."]
                    }
                }
            ],
            "result": "Done обновляет выбранную SQL-строку один раз, DELETE адресно удаляет ресурс, HTTP/CLI-договор и штатный JSON-путь сохранены. Commit, rollback и соседняя запись подтверждены независимой Session."
        }
    ],
    98: [
        {
            "title": "Planner использует общий SQLite-путь",
            "task": (
                "Обычные API и CLI используют одну SQLite после допуска SQL-пути. "
                "Окончательный JSON-снимок перенесён без потери id, полей, tags и title_normalized. "
                "После переключения JSON остаётся архивом, а переходные классы удаляются отдельно."
            ),
            "tasks": [
                {
                    "title": "Допуск к переключению подтверждён",
                    "task": "Таблица допуска связывает SQL CRUD, API, CLI и импортёр с проверками на одном тестовом источнике. При недостающем доказательстве обычные настройки и рабочий JSON остаются прежними.",
                    "requirements": [
                        "Фактический код, журнал прохождения и checkpoint подтверждают критерии 97; наличие плана и незакоммиченного diff не заменяет проверку.",
                        "SQL CRUD, API с Session на запрос, CLI с ресурсом на команду и импортёр проходят общий сценарий на одной изолированной базе.",
                        "При незакрытом критерии указан конкретный блокер, а штатные API и CLI остаются на JSON."
                    ],
                    "hint": "Сверим принятую точку 97 с кодом и проверками для операций, API, CLI и репетиционного импорта.",
                    "answer": {
                        "explanation": "Переключение меняет обычный источник данных, поэтому мы начинаем его только после полного допуска. Журнал показывает, что изучено, а checkpoint и проверки подтверждают, что путь действительно работает. Перенос данных не исправляет отсутствующую SQL-операцию или незавершённый ресурс.",
                        "steps": [
                            "Сверяем журнал прохождения с сохранённым checkpoint и отделяем незакоммиченные изменения.",
                            "Подтверждаем SQL CRUD, выборку, статистику, поиск, API dependency, CLI-контекст и импортёр.",
                            "Проверяем общий сценарий на тестовой SQLite с новыми ресурсами и повторным чтением.",
                            "Если хотя бы один критерий не подтверждён, фиксируем конкретный NO-GO и не переключаем штатные сборки."
                        ],
                        "checks": [
                            "Для допуска есть конкретное доказательство по каждому критерию 97.",
                            "Наличие кода без проверки не считается успешным результатом.",
                            "При пробеле рабочий JSON и обычные сборки остаются без изменений."
                        ]
                    }
                },
                {
                    "title": "Писатели StudyHub остановлены после идентификации",
                    "task": "API и CLI StudyHub остановлены после проверки PID, ExecutablePath и CommandLine. PID владельца настроенного порта сопоставлен с API до остановки. Чужие процессы остаются работать; неясный владелец блокирует снимок.",
                    "requirements": [
                        "PowerShell показывает ProcessId, ExecutablePath и CommandLine Python-процессов.",
                        "До остановки OwningProcess настроенного порта совпадает с подтверждённым PID API; CLI установлен отдельно по командной строке и своему терминалу.",
                        "Чужой или неустановленный процесс не останавливается и не считается остановленным писателем StudyHub."
                    ],
                    "hint": "Сначала найдём процессы, затем сравним владельца настроенного порта с PID и сверим путь проекта с командной строкой.",
                    "answer": {
                        "explanation": "Порт сам по себе не говорит, к какому проекту относится Uvicorn. В проверенной копии порт 8001 принадлежал Pymentor_platform, поэтому этот процесс оставили работать и отдельно подтвердили состояние StudyHub. Останавливаем только подтверждённые процессы; при неясном владельце не переходим к снимку.",
                        "steps": [
                            "Показываем ProcessId, ExecutablePath и CommandLine командой Get-CimInstance.",
                            "Для настроенного порта API получаем OwningProcess командой Get-NetTCPConnection и сравниваем его с ProcessId.",
                            "Сверяем путь Python и точку входа в CommandLine с StudyHub; процесс другого проекта оставляем работать.",
                            "CLI подтверждаем отдельно по CommandLine и его терминалу, затем завершаем через Ctrl+C именно в этом терминале.",
                            "API останавливаем в его терминале; Stop-Process применяем только как адресный запасной вариант с подтверждённым PID.",
                            "Повторно проверяем настроенный порт и терминал CLI. Если принадлежность или остановка не подтверждена, считаем писателя активным и не копируем JSON."
                        ],
                        "code": """Get-CimInstance Win32_Process -Filter "Name='python.exe' OR Name='pythonw.exe'" |
  Select-Object ProcessId, ExecutablePath, CommandLine

Get-NetTCPConnection -State Listen -LocalPort 8001 |
  Select-Object LocalAddress, LocalPort, OwningProcess

# Заменяем 8001, если в настройках задан другой порт.
# После проверки: Stop-Process -Id <PID>""",
                        "checks": [
                            "До остановки PID слушателя совпал с подтверждённым StudyHub API; после остановки StudyHub больше не слушает настроенный порт.",
                            "StudyHub CLI завершён отдельно, а чужие процессы Python не затронуты.",
                            "При неясном владельце снимок не создаётся."
                        ]
                    }
                },
                {
                    "title": "Окончательный снимок сохранён",
                    "task": "Архивная копия содержит JSON_PATH после завершения записей API и CLI. Исходный путь, происхождение и время снимка известны для последующей сверки.",
                    "requirements": [
                        "Копирование начинается после подтверждённой остановки обоих писателей.",
                        "Источник берётся из Settings.json_path, а не угадывается по текущей папке терминала.",
                        "Копия получает отдельный путь, а её hash совпадает с исходником сразу после создания."
                    ],
                    "hint": "После остановки писателей возьмём путь из Settings, создадим отдельную копию и сверим её hash. JSON_PATH останется рабочим исходным путём до переключения.",
                    "answer": {
                        "explanation": "Копирование при работающем писателе может сохранить промежуточное состояние. После остановки API и CLI JSON становится неподвижным источником. Отдельный путь и совпадающий hash позволяют сравнить с тем же снимком после импорта.",
                        "steps": [
                            "Загружаем Settings и фиксируем settings.json_path.",
                            "Убеждаемся, что API и CLI уже остановлены и начатые операции завершились.",
                            "Создаём в data/archives отдельную копию с временем в имени.",
                            "Сравниваем hash источника и копии, затем сохраняем их пути и время снимка."
                        ],
                        "code": """from datetime import datetime
from hashlib import sha256
from shutil import copy2

from app.core.config import load_settings

settings = load_settings()
source = settings.json_path.resolve()
archive_dir = source.parent / "archives"
archive_dir.mkdir(parents=True, exist_ok=True)
timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
snapshot = archive_dir / f"{source.stem}-before-sqlite-{timestamp}{source.suffix}"
if snapshot.exists():
    raise FileExistsError(snapshot)

copy2(source, snapshot)
source_hash = sha256(source.read_bytes()).hexdigest()
snapshot_hash = sha256(snapshot.read_bytes()).hexdigest()
assert source_hash == snapshot_hash
print(source, snapshot, timestamp, snapshot_hash)""",
                        "checks": [
                            "Обе обычные точки записи остановлены до чтения источника.",
                            "Исходник и архив имеют одинаковый hash сразу после копирования.",
                            "Архив не подменяет JSON_PATH обычной сборки."
                        ]
                    }
                },
                {
                    "title": "Пустая целевая база подтверждена",
                    "task": "DATABASE_URL указывает на подготовленный файл SQLite с исходной таблицей tasks и совместимой схемой. Неизвестный адрес, несовместимая схема или непустая таблица останавливают перенос без очистки.",
                    "requirements": [
                        "DATABASE_URL разрешён из тех же Settings, которые используют обычные API и CLI.",
                        "Исходная таблица и ожидаемые колонки созданы до запуска импортёра.",
                        "Количество строк tasks равно нулю; непустая база не очищается и не перезаписывается."
                    ],
                    "hint": "Проверим точный URL, таблицу и колонки до импорта. init_db создаёт схему отдельно, импортёр её не создаёт.",
                    "answer": {
                        "explanation": "Пустая таблица и ожидаемая схема отделяют подготовленную цель от случайного файла SQLite. Если URL указывает не туда, команда может затронуть чужие данные. Поэтому сначала проверяем адрес и структуру, а затем допускаем импорт.",
                        "steps": [
                            "Разрешаем DATABASE_URL из Settings и фиксируем путь SQLite.",
                            "Проверяем наличие таблицы tasks и точный набор ожидаемых колонок.",
                            "Считаем строки новой Session и продолжаем только при нулевом результате.",
                            "При неизвестном файле, другой схеме или найденной записи останавливаемся и выясняем происхождение базы."
                        ],
                        "code": """from pathlib import Path
from sqlalchemy import func, inspect, select
from sqlalchemy.engine import make_url

from app.DBase.engine import make_engine
from app.DBase.models import TaskRow
from app.DBase.session import make_session_factory
from app.core.config import load_settings

settings = load_settings()
database_path = Path(make_url(settings.database_url).database)
if not database_path.is_file():
    raise FileNotFoundError(database_path)

engine = make_engine(settings.database_url)
try:
    inspector = inspect(engine)
    assert "tasks" in inspector.get_table_names()
    columns = [column["name"] for column in inspector.get_columns("tasks")]
    expected = ["id", "title", "priority", "is_done", "tags", "title_normalized"]
    assert columns == expected

    session_factory = make_session_factory(engine)
    with session_factory() as session:
        count = session.scalar(select(func.count()).select_from(TaskRow))
    assert count == 0
finally:
    engine.dispose()""",
                        "checks": [
                            "Проверяемый путь совпадает с целевым DATABASE_URL.",
                            "Таблица tasks уже существует с исходной схемой и title_normalized.",
                            "Проверка не очищает таблицу и не вызывает create_all."
                        ]
                    }
                },
                {
                    "title": "Импортированный снимок совпадает с источником",
                    "task": "Готовый импортёр переносит окончательную копию в пустую цель одной транзакцией. Новая Session подтверждает тот же набор id, предметных полей, tags и title_normalized.",
                    "requirements": [
                        "Используется импортёр из предыдущего шага; он получает явные пути снимка и DATABASE_URL и не запускается при старте API/CLI.",
                        "Сравниваются id, title, priority, is_done, tags и title_normalized для каждой записи.",
                        "Расхождение или ошибка импорта останавливает переключение обеих сборок."
                    ],
                    "hint": "Сначала проверим ответ импортёра, затем сравним отображения по id из новой Session; количество строк не доказывает равенство.",
                    "answer": {
                        "explanation": "Счётчик подтверждает только объём. Сопоставление по id и полям обнаруживает потерянный tag или изменённый статус. Импортёр уже пишет весь набор одной транзакцией; независимое чтение проверяет сохранённые строки после commit.",
                        "steps": [
                            "Запускаем app.DBase.import_tasks с явными source и DATABASE_URL.",
                            "Загружаем ожидаемый набор прежним валидатором снимка.",
                            "Открываем новую Session, читаем TaskRow и строим отображение по id.",
                            "Сравниваем title, priority, is_done, tags и title_normalized для каждой записи.",
                            "При любой разнице не переключаем API и CLI."
                        ],
                        "code": """import subprocess
import sys
from pathlib import Path
from sqlalchemy import select

from app.DBase.engine import make_engine
from app.DBase.import_tasks import load_snapshot
from app.DBase.models import TaskRow
from app.DBase.session import make_session_factory
from app.core.config import load_settings

settings = load_settings()
snapshot = Path(input("Путь к окончательной JSON-копии: ")).resolve()
expected_tasks = load_snapshot(snapshot)
subprocess.run(
    [
        sys.executable,
        "-m",
        "app.DBase.import_tasks",
        "--source",
        str(snapshot),
        "--database-url",
        settings.database_url,
    ],
    check=True,
)

expected = {
    task.id: (task.title, task.priority, task.is_done, list(task.tags), task.title.lower())
    for task in expected_tasks
}
engine = make_engine(settings.database_url)
try:
    session_factory = make_session_factory(engine)
    with session_factory() as session:
        rows = session.scalars(select(TaskRow).order_by(TaskRow.id)).all()
        actual = {
            row.id: (row.title, row.priority, row.is_done, list(row.tags), row.title_normalized)
            for row in rows
        }
    assert actual == expected
finally:
    engine.dispose()""",
                        "checks": [
                            "Импортёр завершился успешно и подтвердил независимое чтение.",
                            "Совпадают все id и пять значимых полей каждой задачи.",
                            "title_normalized равно title.lower(), исходный JSON не изменён."
                        ]
                    }
                },
                {
                    "title": "Обычные API и CLI используют одну SQLite",
                    "task": "Обычные API и CLI собирают SQL-сервис через собственные Engine и SessionFactory с одним DATABASE_URL. API открывает Session на запрос, CLI на распознанную команду; прежний договор и переходные классы сохраняются.",
                    "requirements": [
                        "API provider строит PlannerService с SqlTaskRepository текущей Session из get_db.",
                        "app.state хранит Settings, Engine и SessionFactory, а не живую Session или сервис, связанный с ней.",
                        "CLI использует SQL-контекст на команду и тот же DATABASE_URL.",
                        "Обычные API и CLI больше не выбирают JSON; маршруты, схемы, команды и preferences не меняются."
                    ],
                    "hint": "В API получаем db через Depends(get_db), а в CLI передаём run фабрику уже подготовленного SQL-контекста.",
                    "answer": {
                        "explanation": "Каждый процесс использует собственные Engine и SessionFactory с одним DATABASE_URL. Запрос и распознанная команда получают отдельные Session. API связывает репозиторий с db из get_db, а CLI открывает ресурс внутри sql_service_context.",
                        "steps": [
                            "При сборке API создаём Engine и SessionFactory из settings.database_url и сохраняем их в app.state.",
                            "В get_planner возвращаем PlannerService с SqlTaskRepository(db) и write_scope=db.begin.",
                            "В sql_service_context создаём сервис из фабрики CLI и закрываем Session после команды.",
                            "В обычном main создаём Engine и SessionFactory для того же DATABASE_URL, направляем run на sql_service_context и освобождаем Engine после завершения CLI.",
                            "Сохраняем прежние routes, schemas, обработчики, preferences и SQL-схему."
                        ],
                        "code": """# Фрагменты StudyHub, импорты уже находятся в своих модулях.

# app/api.py
app.state.settings = settings
app.state.engine = make_engine(settings.database_url)
app.state.session_factory = make_session_factory(app.state.engine)

# app/core/dependencies.py
from app.DBase.repositories import SqlTaskRepository

def get_planner(db: Session = Depends(get_db)) -> PlannerService:
    return PlannerService(
        repository=SqlTaskRepository(db),
        write_scope=db.begin,
    )

# app/main.py
@contextmanager
def sql_service_context(session_factory) -> Iterator[PlannerService]:
    with session_factory() as db:
        yield build_service(
            repository=SqlTaskRepository(db),
            write_scope=db.begin,
        )

engine = make_engine(settings.database_url)
session_factory = make_session_factory(engine)
try:
    return run(lambda: sql_service_context(session_factory))
except StorageError as error:
    print(f"Planner остановлен: {error}")
finally:
    engine.dispose()""",
                        "checks": [
                            "API и CLI разрешают один и тот же DATABASE_URL.",
                            "Session живёт только один запрос или одну команду и закрывается их ресурсной областью.",
                            "SQL-сервис не хранится в app.state вне времени жизни Session.",
                            "JSON default и fallback отсутствуют в обычных сборках, переходный код остаётся до следующего занятия."
                        ]
                    }
                },
                {
                    "title": "Общий источник подтверждён, архив больше не актуален",
                    "task": "API, CLI и новый запуск читают одну SQL-историю; штатные действия после переключения не меняют архив JSON. Отдельная приёмочная задача подтверждает межинтерфейсный обмен, прежний CRUD и момент устаревания снимка.",
                    "requirements": [
                        "API create → CLI find/done → новый API get/stats → CLI search проходит через обычные точки входа.",
                        "PUT, PATCH и DELETE сохраняют прежние ответы, поведение false/null и внутренние tags.",
                        "Новая Session, новая CLI-команда и повторный запуск читают подтверждённое состояние SQLite.",
                        "Hash JSON не меняется; после первой SQL-записи старый файл не включается обратно как актуальный источник."
                    ],
                    "hint": "Используем отдельную контрольную задачу, передаём её id между API и CLI и завершаем проверку новым запросом и запуском.",
                    "answer": {
                        "explanation": "API создаёт задачу, CLI читает и изменяет её, а новый API-запрос видит commit. Повторный запуск исключает случайный успех из старого объекта в памяти. После первой SQL-записи архив JSON уже отстаёт и не становится безопасным rollback одной настройкой.",
                        "steps": [
                            "Создаём отдельную контрольную задачу через API и сохраняем выданный id.",
                            "В новом CLI-контексте ищем задачу и выполняем done по этому id.",
                            "В следующем API-запросе читаем задачу и обновлённую статистику; существующей CLI-командой проверяем search.",
                            "На отдельной записи повторяем PUT, PATCH и DELETE, включая пустой PATCH, false, tags и сохранность соседа.",
                            "Перезапускаем API и CLI, затем читаем состояние новыми ресурсами.",
                            "Сравниваем hash архива с исходным значением и фиксируем границу после первой SQL-записи."
                        ],
                        "checks": [
                            "CLI видит задачу API, а новый API-запрос видит изменение CLI.",
                            "Публичные ответы и прежние правила CRUD не меняются.",
                            "Повторный запуск читает SQLite, архив JSON после переключения не изменяется.",
                            "Возврат старого JSON_PATH после SQL commit не называется rollback."
                        ]
                    }
                }
            ],
            "result": "Обычные API и CLI используют одну SQLite с точным снимком; новые ресурсы и повторный запуск подтверждают общий commit, а JSON остаётся неизменённым архивом до отдельной очистки переходного кода."
        }
    ],
    97: [
        {
            "title": "Допуск SQL-пути к переносу",
            "task": (
                "Существующие SQL-операции и API/CLI-контракты подтверждаются на одной изолированной базе. "
                "Копия прежних данных проходит репетиционный импорт, а связанный сценарий показывает сохранённое изменение через новые ресурсы. "
                "Матрица допуска опирается на выполненные проверки; обычный JSON-путь остаётся штатным."
            ),
            "tasks": [
                {
                    "title": "Подтвердить исходную точку",
                    "task": (
                        "Карта входа связывает A97 с журналом и сохранённым checkpoint B96, а накопленные SQL-возможности с существующими проверками. "
                        "Сохранённый commit отделён от незакоммиченных изменений. "
                        "При неподтверждённой возможности общий допуск остаётся закрытым до устранения точного блокера."
                    ),
                    "requirements": [
                        "Запись о прохождении B96 совпадает с checkpoint c910d1142dd85df492fbffcc8eba1c5e9784363e.",
                        "Сохранённый commit и относящиеся к занятию локальные изменения перечислены отдельно.",
                        "SQL create, PUT, PATCH, done/delete, select/stats/search и ресурс CLI связаны с имеющимися тестами.",
                        "Каждый отсутствующий результат указан как конкретный блокер; общий допуск при нём не выдан.",
                    ],
                    "hint": "Сверим запись журнала с commit и найдём проверки, которые действительно подтверждают вход.",
                    "answer": {
                        "explanation": (
                            "Контрольная точка перед B97 зафиксирована commit c910d1142dd85df492fbffcc8eba1c5e9784363e «пройдено занятие 96». "
                            "Журнал описывает семь известных CLI-команд с отдельными закрытыми Session, а историю кода сверяем с тем же commit. "
                            "Commit 94d7b73564ba3369539933b2f792f9b3f5831e3d содержит последующий readiness-тест; сам факт его наличия ещё не заменяет повторный запуск проверки."
                        ),
                        "steps": [
                            "Сверяем журнал и commit перед B97, не подменяя один источник другим.",
                            "Находим тесты накопленных операций и отдельного ресурса CLI.",
                            "Фиксируем незакоммиченные изменения отдельно от checkpoint.",
                            "Для неподтверждённой операции записываем конкретную проверку, которая ещё нужна.",
                        ],
                        "code": (
                            "# Команды запускаются из корня StudyHub.\n"
                            "git show -s --format=\"%H %s\" c910d1142dd85df492fbffcc8eba1c5e9784363e\n"
                            "rg -n -A 4 \"Занятие 96\" STUDYHUB_LEARNINGS.md\n"
                            "git status --short"
                        ),
                        "checks": [
                            "Запись B96 и исходный commit относятся к одной точке входа.",
                            "В рабочем статусе нет неучтённого изменения, выданного за сохранённый результат.",
                            "Непроверенный сценарий не включён в положительный допуск.",
                        ],
                    },
                },
                {
                    "title": "Использовать общую тестовую базу",
                    "task": (
                        "Приёмочный тест переиспользует существующую SQL-fixture с файлом в tmp_path и явно созданной схемой. "
                        "API override и CLI-контекст указывают на один Engine и фабрику, но создают отдельную Session для каждого действия. "
                        "Клиент, Engine, app.state.session_factory и dependency overrides восстанавливаются на границе теста."
                    ),
                    "requirements": [
                        "Существующая sql_database fixture создаёт файловую SQLite в tmp_path и схему до сценария.",
                        "TestClient сохраняет follow_redirects=False, а тестовый API provider и CLI-контекст используют фабрики на одном Engine.",
                        "Каждый API-запрос и распознанная CLI-команда получают и закрывают собственную Session.",
                        "Тест восстанавливает прежние app.state.session_factory и dependency_overrides; фикстуры закрывают клиент и Engine при ошибке.",
                    ],
                    "hint": "Файл живёт весь сценарий; каждый запрос и каждая команда получают отдельный короткий ресурс.",
                    "answer": {
                        "explanation": (
                            "sql_database уже создаёт файл и исходную схему, затем отдаёт Engine и фабрику. "
                            "Новая fixture с теми же обязанностями дублировала бы подготовленную опору. "
                            "API использует dependency get_db через app.state.session_factory, а CLI открывает ресурс через sql_service_context. "
                            "Тестовый override действует только внутри сценария и возвращает предыдущий state в finally."
                        ),
                        "steps": [
                            "Берём Engine и фабрику из существующей sql_database fixture.",
                            "Создаём отслеживаемую фабрику на том же Engine, не передавая Session между интерфейсами.",
                            "Временно направляем API dependency и CLI-контекст на тестовую фабрику.",
                            "После сценария восстанавливаем прежний app state и overrides; Engine закрывает исходная fixture.",
                        ],
                        "code": (
                            (
                                "# Фрагмент теста; sql_database создаёт файл и схему в tmp_path.\n"
                                "engine, session_factory = sql_database\n"
                                "created_sessions = []\n"
                                "\n"
                                "class TrackedSession(Session):\n"
                                "    def __init__(self, *args, **kwargs):\n"
                                "        super().__init__(*args, **kwargs)\n"
                                "        self.was_closed = False\n"
                                "        created_sessions.append(self)\n"
                                "\n"
                                "    def close(self):\n"
                                "        self.was_closed = True\n"
                                "        super().close()\n"
                                "\n"
                                "tracked_factory = sessionmaker(bind=engine, class_=TrackedSession)\n"
                                "assert session_factory.kw[\"bind\"] is engine\n"
                                "assert tracked_factory.kw[\"bind\"] is engine"
                            )
                        ),
                        "checks": [
                            "Импорт, API и CLI указывают на один файл SQLite; API и CLI используют общий Engine, импортёр открывает его отдельно.",
                            "Отслеживаемые Session создаются на действие и закрываются его владельцем.",
                            "После ошибки восстанавливаются прежние app state и dependency overrides.",
                        ],
                    },
                },
                {
                    "title": "Повторить импорт на копии снимка",
                    "task": (
                        "Существующий импортёр переносит побайтовую копию JSON в пустую тестовую SQLite. "
                        "Новая Session подтверждает каждую запись и вычисленный title_normalized; исходный файл и копия остаются неизменными. "
                        "Создание после импорта получает новый положительный id, а непустая цель не очищается."
                    ),
                    "requirements": [
                        "Копия снимка отделена от источника и её исходные байты доступны для сравнения.",
                        "Сопоставление включает id, title, priority, is_done и tags, в том числе пустые tags старого формата.",
                        "Для каждой строки title_normalized равен title.lower(); новая запись не повторяет импортированный id.",
                        "Повторный импорт возвращает ошибку, а уже сохранённые строки в целевой базе остаются прежними.",
                    ],
                    "hint": "Совпадение числа строк не показывает, совпало ли содержимое каждой записи.",
                    "answer": {
                        "explanation": (
                            "Проверку выполняет существующий import_snapshot, который вызывает и CLI-команда. "
                            "Ожидаемое состояние сравнивается по полному набору полей после закрытия исходного ресурса. "
                            "Непустая цель проверяется отдельно: импортёр отказывает вместо очистки или слияния данных."
                        ),
                        "steps": [
                            "Сохраняем байты источника и копируем его в tmp_path.",
                            "Строим ожидаемые значения по всем записям копии.",
                            "Запускаем существующий импортёр на пустой тестовой базе.",
                            "Сверяем результат новой Session и повторно читаем неизменённую копию.",
                            "Сравниваем целевую базу до и после отказа повторного импорта.",
                        ],
                        "code": (
                            (
                                "# Фрагмент теста; sql_database, source_path, database_url и импорты подготовлены выше.\n"
                                "source_before = source_path.read_bytes()\n"
                                "copied_snapshot = tmp_path / \"snapshot-copy.json\"\n"
                                "shutil.copyfile(source_path, copied_snapshot)\n"
                                "copy_before = copied_snapshot.read_bytes()\n"
                                "source_records = json.loads(copy_before.decode(\"utf-8\"))\n"
                                "expected_rows = {\n"
                                "    row[\"id\"]: (row[\"title\"], row[\"priority\"], row[\"is_done\"], row.get(\"tags\", []), row[\"title\"].lower())\n"
                                "    for row in source_records\n"
                                "}\n"
                                "assert import_snapshot(copied_snapshot, database_url) == len(source_records)\n"
                                "with session_factory() as session:\n"
                                "    rows = session.scalars(select(TaskRow).order_by(TaskRow.id)).all()\n"
                                "    actual_rows = {\n"
                                "        row.id: (row.title, row.priority, row.is_done, row.tags, row.title_normalized)\n"
                                "        for row in rows\n"
                                "    }\n"
                                "assert actual_rows == expected_rows\n"
                                "assert source_path.read_bytes() == source_before\n"
                                "assert copied_snapshot.read_bytes() == copy_before\n"
                                "with pytest.raises(SnapshotImportError, match=\"не пуста\"):\n"
                                "    import_snapshot(copied_snapshot, database_url)\n"
                                "with session_factory() as after_retry:\n"
                                "    rows_after_retry = after_retry.scalars(select(TaskRow).order_by(TaskRow.id)).all()\n"
                                "    assert {\n"
                                "        row.id: (row.title, row.priority, row.is_done, row.tags, row.title_normalized)\n"
                                "        for row in rows_after_retry\n"
                                "    } == expected_rows"
                            )
                        ),
                        "checks": [
                            "Словарь строк новой Session равен ожидаемому снимку по всем полям.",
                            "Байты источника и его тестовой копии не изменились.",
                            "Отказ на непустой цели не изменил уже прочитанные строки.",
                        ],
                    },
                },
                {
                    "title": "Связать контракт API и CLI",
                    "task": (
                        "Существующие контрактные проверки охватывают HTTP и команды на изолированной SQL-базе. "
                        "Сквозной сценарий создаёт задачу через API, находит её командой CLI по id, отмечает выполненной и читает новым API-запросом. "
                        "Публичный ответ, статистика, tags и соседние строки сохраняют прежние значения."
                    ),
                    "requirements": [
                        "Контрактные тесты покрывают CRUD, selection/order/limit, stats, search, preferences, health и предметные ошибки.",
                        "HTTP-проверки сохраняют первичный статус и путь при follow_redirects=False, включая пустое тело DELETE 204.",
                        "На одном DATABASE_URL API create → CLI find/done → новый API get/stats возвращает одно сохранённое состояние.",
                        "Новая Session подтверждает отдельные API и CLI ресурсы, сохранность tags и неизменность соседней строки.",
                        "Изменение остаётся тестовым override; штатные API и CLI продолжают выбирать JSON до занятия 98.",
                    ],
                    "hint": "`find` получает id задачи, а текстовый `search` остаётся отдельной прежней командой.",
                    "answer": {
                        "explanation": (
                            "Связанный сценарий вызывает существующие HTTP-маршрут и CLI handler, а не подменяет их прямыми вызовами репозитория. "
                            "API-запросы и распознанные CLI-команды получают новые Session из одной фабрики. "
                            "Число закрытых Session подтверждает границы ресурсов, а GET и stats показывают результат после CLI-команды."
                        ),
                        "steps": [
                            "Проверяем существующие контрактные тесты отдельно от межинтерфейсного сценария.",
                            "Создаём новую задачу API и сохраняем положительный id.",
                            "Передаём этот id командам CLI find и done, затем запрашиваем stats.",
                            "Новым API GET читаем ту же задачу и проверяем is_done=True.",
                            "Новой Session сверяем tags, title_normalized и одну нетронутую соседнюю запись.",
                            "Проверяем, что каждая отслеживаемая Session закрыта, а app state восстановлен.",
                        ],
                        "code": (
                            (
                                "# Фрагмент readiness-теста; фикстуры и ожидаемый снимок подготовлены выше.\n"
                                "previous_factory = getattr(app.state, \"session_factory\", None)\n"
                                "had_factory = hasattr(app.state, \"session_factory\")\n"
                                "previous_overrides = app.dependency_overrides.copy()\n"
                                "\n"
                                "def get_sql_planner(db=Depends(get_db)):\n"
                                "    return build_service(repository=SqlTaskRepository(db), write_scope=db.begin)\n"
                                "\n"
                                "app.state.session_factory = tracked_factory\n"
                                "app.dependency_overrides[get_planner] = get_sql_planner\n"
                                "output = []\n"
                                "try:\n"
                                "    created = api_client.post(\"/tasks\", json={\"title\": \"Приёмка блока 15\", \"priority\": 3})\n"
                                "    assert created.status_code == 201\n"
                                "    task_id = created.json()[\"id\"]\n"
                                "    assert task_id > 0 and task_id not in expected_rows\n"
                                "    commands = iter((\"find\", str(task_id), \"done\", str(task_id), \"stats\", \"exit\"))\n"
                                "    run(lambda: sql_service_context(tracked_factory), read=lambda _prompt: next(commands), write=output.append)\n"
                                "    fetched = api_client.get(f\"/tasks/{task_id}\")\n"
                                "    statistics = api_client.get(\"/stats\")\n"
                                "finally:\n"
                                "    app.dependency_overrides.clear()\n"
                                "    app.dependency_overrides.update(previous_overrides)\n"
                                "    if had_factory:\n"
                                "        app.state.session_factory = previous_factory\n"
                                "    else:\n"
                                "        del app.state.session_factory\n"
                                "\n"
                                "assert created.json() == {\"id\": task_id, \"title\": \"Приёмка блока 15\", \"priority\": 3, \"is_done\": False}\n"
                                "assert fetched.status_code == 200 and fetched.json()[\"is_done\"] is True\n"
                                "assert statistics.json() == {\n"
                                "    \"total\": len(source_records) + 1,\n"
                                "    \"open\": sum(not row[\"is_done\"] for row in source_records),\n"
                                "    \"done\": sum(row[\"is_done\"] for row in source_records) + 1,\n"
                                "}\n"
                                "assert any(f\"[{task_id}] Приёмка блока 15\" in line for line in output)\n"
                                "assert any(f\"Задача {task_id} выполнена\" in line for line in output)\n"
                                "assert all(session.was_closed for session in created_sessions)\n"
                                "assert len(created_sessions) == 6\n"
                                "unchanged_id = next(row[\"id\"] for row in source_records if not row[\"is_done\"])\n"
                                "with session_factory() as verify_session:\n"
                                "    completed = verify_session.get(TaskRow, task_id)\n"
                                "    neighbor = verify_session.get(TaskRow, unchanged_id)\n"
                                "    assert completed.is_done is True and completed.title_normalized == \"приёмка блока 15\"\n"
                                "    assert (neighbor.title, neighbor.priority, neighbor.is_done, neighbor.tags, neighbor.title_normalized) == expected_rows[unchanged_id]\n"
                                "assert not api_service.storage.path.exists()"
                            )
                        ),
                        "checks": [
                            "POST returns the established 201 contract and a new id.",
                            "CLI output confirms find and done for that id.",
                            "A subsequent API request sees is_done=True and updated stats.",
                            "All measured resources close and the imported neighbor remains unchanged.",
                        ],
                    },
                },
                {
                    "title": "Проверить отказ и вынести решение о допуске",
                    "task": (
                        "Контролируемая ошибка SQL до успешного commit не оставляет частичную строку; следующая независимая операция сохраняется. "
                        "Тестовый SQL-путь передаёт ошибку вызывающему коду, а штатный JSON-default не меняется. "
                        "Матрица допуска содержит только результаты выполненных проверок."
                    ),
                    "requirements": [
                        "Ограничение тестовой схемы вызывает IntegrityError до фиксации неподходящей строки.",
                        "Чтение новой Session не находит частичную запись, а следующее корректное действие проходит.",
                        "SQL override не подменяет ошибку чтением JSON или MemoryStorage; обычный JSON-default остаётся прежним.",
                        "Результат не обещает HTTP 503, классификацию всех ошибок БД или откат успешного commit.",
                    ],
                    "hint": "Мы проверим сначала отменённую транзакцию, затем отдельную успешную запись.",
                    "answer": {
                        "explanation": (
                            "Известное ограничение priority отвергает тестовую строку внутри транзакции, а IntegrityError выходит наружу. "
                            "После закрытия ресурса новая Session подтверждает пустое состояние и сохраняет корректную задачу. "
                            "Это доказывает rollback до commit и освобождение ресурса, но не задаёт универсальный HTTP-статус для любой ошибки БД."
                        ),
                        "steps": [
                            "Выполняем контролируемую вставку с priority вне допустимого диапазона только на тестовой SQLite.",
                            "Подтверждаем IntegrityError и отсутствие строки новой Session.",
                            "Создаём корректную задачу новым sql_service_context и читаем её отдельным ресурсом.",
                            "Убеждаемся, что SQL-путь не перешёл на JSON или память, а штатная сборка не переключилась.",
                            "В матрице для каждого критерия указываем точный тест и фактический статус.",
                        ],
                        "code": (
                            "# Фрагмент теста на известном CHECK priority между 1 и 5.\n"
                            "with session_factory() as session:\n"
                            "    with pytest.raises(IntegrityError):\n"
                            "        with session.begin():\n"
                            "            session.add(TaskRow(\n"
                            "                title=\"Отклонено\", priority=0, is_done=False,\n"
                            "                tags=[], title_normalized=\"отклонено\",\n"
                            "            ))\n"
                            "\n"
                            "with sql_service_context(session_factory) as service:\n"
                            "    saved = service.add_task(\"После отказа\", 2)\n"
                            "with session_factory() as verify_session:\n"
                            "    rows = verify_session.scalars(select(TaskRow)).all()\n"
                            "    assert [(row.title, row.priority) for row in rows] == [(\"После отказа\", 2)]\n"
                            "    assert verify_session.get(TaskRow, saved.id) is not None"
                        ),
                        "checks": [
                            "Невалидная транзакция заканчивается IntegrityError без сохранённой строки.",
                            "Новая SQL-операция после ошибки сохраняет корректную запись.",
                            "JSON-default и предметный договор не меняются из-за отказа тестовой базы.",
                        ],
                    },
                },
            ],
            "result": "Один SQL-путь подтверждает перенос копии, прежний контракт API/CLI и короткие ресурсы; допуск к переключению выдан только при закрытых критериях, а рабочий JSON остаётся источником до занятия 98.",
        }
    ],
    94: [
        {
            "title": "SQL-выборка и статистика Planner",
            "task": (
                "Существующие GET /tasks и /stats получают прежние результаты через SQL-репозиторий на изолированной файловой SQLite. "
                "JSON остаётся штатным источником до общего переключения. "
                "SQL create, replace, update, done и delete из предыдущих занятий уже реализованы и проверены; "
                "практика переиспользует их для выборки и статистики без добавления нового endpoint."
            ),
            "tasks": [
                {
                    "title": "Подготовить контрольные SQL-данные",
                    "task": (
                        "В пустой тестовой SQLite через готовый SQL-сервис добавлены четыре задачи с известными id и чередующимися статусами. "
                        "Первая по id задача завершена, следующая открыта, поэтому фильтр открытых задач с limit=1 выявляет обрезание до WHERE. "
                        "Подготовка использует временную базу и прежние методы Planner."
                    ),
                    "requirements": [
                        "sql_database fixture создаёт пустую файловую SQLite в tmp_path и проверяет исходную схему.",
                        "Задачи и статусы создаются через SQL Planner из завершённых занятий 90-93; TaskRow напрямую не вставляется.",
                        "Возвращённые id и ожидаемые списки для обоих статусов и направлений фиксируются.",
                        "Готовые SQL CRUD и транзакционная область из 90-93 переиспользуются без переписывания.",
                    ],
                    "hint": "Сначала проверим пустую fixture и SQL-provider. Вызовы изменения должны завершиться до чтения результата.",
                    "answer": {
                        "explanation": (
                            "Набор создаётся настоящими сценариями Planner, поэтому он проверяет уже изученный SQL CRUD и предметные правила. "
                            "Чередование статусов делает ошибочный LIMIT до фильтра заметным. Идентификаторы берём из результата создания."
                        ),
                        "steps": [
                            "Открываем временную SQLite fixture с пустой таблицей.",
                            "Создаём четыре задачи SQL-сервисом и завершаем первую и третью.",
                            "Записываем id из Task и сверяем count и статусы независимым чтением.",
                            "Если SQL-операции отсутствуют, возвращаемся к незавершённым занятиям 90-93.",
                        ],
                        "code": (                            "_engine, session_factory = sql_database\n"
                            "def call_sql(session_factory, method, *args, **kwargs):\n"
                            "    with sql_service_context(session_factory) as planner:\n"
                            "        return getattr(planner, method)(*args, **kwargs)\n\n"
                            "first = call_sql(session_factory, 'add_task', 'Done first', 2)\n"
                            "call_sql(session_factory, 'mark_done', first.id)\n"
                            "second = call_sql(session_factory, 'add_task', 'Open second', 3)\n"
                            "third = call_sql(session_factory, 'add_task', 'Done third', 1)\n"
                            "call_sql(session_factory, 'mark_done', third.id)\n"
                            "fourth = call_sql(session_factory, 'add_task', 'Open fourth', 4)\n"
                            "ids = [first.id, second.id, third.id, fourth.id]\n"
                            "assert ids == sorted(ids)\n"
                            "tasks = call_sql(session_factory, 'list_tasks')\n"
                            "assert [task.is_done for task in tasks] == [True, False, True, False]"
                        ),
                        "checks": [
                            "Рабочий JSON не содержит новых задач.",
                            "Набор имеет известный порядок id и по две задачи каждого статуса.",
                            "Записи создаются SQL-сервисом, не прямой вставкой ORM-строк.",
                        ],
                    },
                },
                {
                    "title": "Добавить выборку в SQL-репозиторий",
                    "task": (
                        "SqlTaskRepository.select строит запрос по is_done, sort_desc и limit. "
                        "None у фильтра и limit не добавляет ограничивающее условие, а False выбирает открытые строки. "
                        "Результат состоит из обычных Task в порядке id, без commit или закрытия Session."
                    ),
                    "requirements": [
                        "WHERE добавляется только когда is_done не равен None.",
                        "ORDER BY явно задаёт asc или desc по TaskRow.id.",
                        "LIMIT добавляется после фильтра и порядка только когда limit не равен None.",
                        "Каждая выбранная строка преобразуется существующей task_from_row.",
                    ],
                    "hint": "Начинаем с select(TaskRow), затем дополняем statement в порядке прежней операции.",
                    "answer": {
                        "explanation": (
                            "Условия остаются в одном SQLAlchemy statement, поэтому база возвращает только нужные строки. "
                            "Проверка is_done is not None сохраняет явное False, а limit=None оставляет запрос без LIMIT. "
                            "Mapping отделяет сервис от SQLAlchemy и Session."
                        ),
                        "steps": [
                            "Начинаем с select(TaskRow).",
                            "Условно добавляем сравнение статуса, не проверяя bool по truthiness.",
                            "Задаём устойчивый порядок по id и добавляем LIMIT, если передана граница.",
                            "Вызываем scalars(statement).all() и переводим каждую строку в Task.",
                        ],
                        "code": (
                            "def select(self, is_done=None, sort_desc=False, limit=None):\n"
                            "    statement = select(TaskRow)\n"
                            "    if is_done is not None:\n"
                            "        statement = statement.where(TaskRow.is_done == is_done)\n"
                            "    order = TaskRow.id.desc() if sort_desc else TaskRow.id.asc()\n"
                            "    statement = statement.order_by(order)\n"
                            "    if limit is not None:\n"
                            "        statement = statement.limit(limit)\n"
                            "    rows = self.session.scalars(statement).all()\n"
                            "    return [task_from_row(row) for row in rows]"
                        ),
                        "checks": [
                            "None, False и True дают ожидаемые наборы.",
                            "Оба направления сортируют по id.",
                            "Результат содержит Task; метод не вызывает commit, close или repository.list().",
                        ],
                    },
                },
                {
                    "title": "Сверить сервис и прежний GET /tasks",
                    "task": (
                        "PlannerService.select_tasks и GET /tasks используют SQL-метод при временной подмене provider. "
                        "Прямой вызов сохраняет limit=None, а HTTP сохраняет default, границы от 1 до 50 и отказ 422 для некорректного limit. "
                        "После запроса dependency overrides и Session восстанавливаются."
                    ),
                    "requirements": [
                        "Прямой вызов сервиса проверяет None, False и True, оба направления и limit=None.",
                        "Ответ GET /tasks?is_done=false&sort_desc=false&limit=1 сверяется с ожидаемым id.",
                        "HTTP сохраняет прежний default и границы limit, включая 422 для 0 и 51.",
                        "SQL-provider создаёт отдельную Session на запрос; fixture восстанавливает app state и overrides в finally.",
                    ],
                    "hint": "Подменяем только get_planner. Маршрут, get_selection, ответ TaskRead и JSON-service сохраняем.",
                    "answer": {
                        "explanation": (
                            "Набор с завершённой первой строкой проверяет, что фильтр выполняется до limit. "
                            "Проверка прямого вызова выявляет ошибочное наследование HTTP default в сервис. "
                            "Overrides дают тесту SQL-provider, не переписывая endpoint и не меняя обычный planner."
                        ),
                        "steps": [
                            "Собираем provider через Depends(get_db) и build_service(repository=SqlTaskRepository(db)).",
                            "На время проверки задаём тестовую session_factory и заменяем get_planner.",
                            "Проверяем прямой select_tasks и HTTP-ответ на контрольном наборе.",
                            "В finally восстанавливаем прежние overrides и состояние приложения.",
                        ],
                        "code": (                            "from fastapi import Depends\n"
                            "from sqlalchemy.orm import Session\n"
                            "from app.api import app\n"
                            "from app.core.dependencies import get_db, get_planner\n"
                            "from app.DBase.repositories import SqlTaskRepository\n"
                            "from app.main import build_service, sql_service_context\n"
                            "from app.services import PlannerService\n\n"
                            "def call_sql(session_factory, method, *args, **kwargs):\n"
                            "    with sql_service_context(session_factory) as planner:\n"
                            "        return getattr(planner, method)(*args, **kwargs)\n\n"
                            "_engine, session_factory = sql_database\n"
                            "first = call_sql(session_factory, 'add_task', 'Done first', 2)\n"
                            "call_sql(session_factory, 'mark_done', first.id)\n"
                            "second = call_sql(session_factory, 'add_task', 'Open second', 3)\n"
                            "third = call_sql(session_factory, 'add_task', 'Done third', 1)\n"
                            "call_sql(session_factory, 'mark_done', third.id)\n"
                            "fourth = call_sql(session_factory, 'add_task', 'Open fourth', 4)\n"
                            "with sql_service_context(session_factory) as planner:\n"
                            "    assert [task.id for task in planner.select_tasks(is_done=None, sort_desc=False, limit=None)] == [first.id, second.id, third.id, fourth.id]\n"
                            "    assert [task.id for task in planner.select_tasks(is_done=None, sort_desc=True, limit=None)] == [fourth.id, third.id, second.id, first.id]\n"
                            "    assert [task.id for task in planner.select_tasks(is_done=False, sort_desc=False, limit=None)] == [second.id, fourth.id]\n"
                            "    assert [task.id for task in planner.select_tasks(is_done=True, sort_desc=True, limit=None)] == [third.id, first.id]\n\n"
                            "previous_overrides = app.dependency_overrides.copy()\n"
                            "had_factory = hasattr(app.state, 'session_factory')\n"
                            "previous_factory = getattr(app.state, 'session_factory', None)\n"
                            "app.state.session_factory = session_factory\n\n"
                            "def get_sql_planner(db: Session = Depends(get_db)) -> PlannerService:\n"
                            "    return build_service(repository=SqlTaskRepository(db))\n\n"
                            "try:\n"
                            "    app.dependency_overrides[get_planner] = get_sql_planner\n"
                            "    response = api_client.get('/tasks', params={'is_done': False, 'sort_desc': False, 'limit': 1})\n"
                            "    assert response.status_code == 200\n"
                            "    assert [task['id'] for task in response.json()] == [second.id]\n"
                            "    assert len(api_client.get('/tasks').json()) == 4\n"
                            "    assert len(api_client.get('/tasks', params={'limit': 50}).json()) == 4\n"
                            "    assert api_client.get('/tasks', params={'limit': 0}).status_code == 422\n"
                            "    assert api_client.get('/tasks', params={'limit': 51}).status_code == 422\n"
                            "finally:\n"
                            "    app.dependency_overrides.clear()\n"
                            "    app.dependency_overrides.update(previous_overrides)\n"
                            "    if had_factory:\n"
                            "        app.state.session_factory = previous_factory\n"
                            "    else:\n"
                            "        del app.state.session_factory"
                        ),
                        "checks": [
                            "Первой open-задачей становится ожидаемая запись, а не пустой список.",
                            "HTTP сохраняет прежнюю query-валидацию и форму ответа.",
                            "После снятия provider запрос снова использует JSON planner.",
                        ],
                    },
                },
                {
                    "title": "Добавить агрегатную статистику",
                    "task": (
                        "SqlTaskRepository.statistics возвращает целочисленные all, open и done одним агрегатным запросом. "
                        "Пустая таблица даёт нули, а строки не преобразуются в Task ради подсчёта. "
                        "Метод не меняет данные и не владеет Session."
                    ),
                    "requirements": [
                        "COUNT и CASE задают общий и условные подсчёты обоих статусов.",
                        "Один statement объединяет агрегаты и возвращает одну строку скалярных результатов.",
                        "Словарь содержит прежние ключи all, open и done с целыми значениями.",
                        "Подсчёт не вызывает list() и не создаёт ORM-модели для каждой строки.",
                    ],
                    "hint": "CASE вернёт TaskRow.id для подходящей строки и NULL для остальных; COUNT не считает NULL.",
                    "answer": {
                        "explanation": (
                            "Общий COUNT считает непустые первичные ключи. Условный COUNT получает id только для своего статуса, "
                            "поэтому другие строки не увеличивают значение. Агрегат возвращает одну строку из трёх чисел, "
                            "а пустая таблица естественно даёт нули."
                        ),
                        "steps": [
                            "Создаём выражения для общего количества и условных количеств обоих статусов.",
                            "Выполняем их одной командой через текущую Session.",
                            "Связываем результаты с прежними внутренними ключами сервиса.",
                        ],
                        "code": (                            "from sqlalchemy import case, func, select\n\n"
                            "def statistics(self):\n"
                            "    statement = select(\n"
                            "        func.count(TaskRow.id),\n"
                            "        func.count(case((TaskRow.is_done.is_(False), TaskRow.id))),\n"
                            "        func.count(case((TaskRow.is_done.is_(True), TaskRow.id))),\n"
                            "    )\n"
                            "    total, opened, done = self.session.execute(statement).one()\n"
                            "    return {'all': total, 'open': opened, 'done': done}"
                        ),
                        "checks": [
                            "Пустая таблица возвращает {'all': 0, 'open': 0, 'done': 0}.",
                            "Для контрольного набора all равно четырём, open и done равны двум.",
                            "open + done равно all, значения имеют тип int.",
                        ],
                    },
                },
                {
                    "title": "Проверить GET /stats и отсутствие полной загрузки",
                    "task": (
                        "GET /stats проходит по прежнему PlannerService и возвращает total, open и done; внутренний all отображается как total. "
                        "После SQL add, done и delete статистика соответствует таблице. "
                        "Проверки подтверждают, что select и statistics работают без полной загрузки через list, а JSON default и HTTP-ответы сохраняются."
                    ),
                    "requirements": [
                        "Набор проверок включает пустую базу, смешанные статусы и результат после add, mark_done и delete.",
                        "HTTP-ответ содержит публичные ключи total/open/done и целочисленные значения.",
                        "Контролируемая замена SqlTaskRepository.list на ошибку не мешает прямым select и statistics.",
                        "Fixture восстанавливает overrides; штатный default остаётся JSON.",
                    ],
                    "hint": "Агрегат сверяем с независимым чтением и HTTP-ответом. Полный прогон производительности не нужен.",
                    "answer": {
                        "explanation": (
                            "Service делегирует выборку и статистику репозиторию, а /stats переименовывает all в total. "
                            "Если временно заменить list на функцию, которая завершает проверку ошибкой, успешные select и statistics показывают, "
                            "что они не обходят SQL-запрос через полный список."
                        ),
                        "steps": [
                            "Сверяем нули на пустой таблице и ожидаемые счётчики на смешанном наборе.",
                            "Проверяем /stats через SQL-provider и сравниваем all с HTTP total.",
                            "После существующих изменений читаем новый результат отдельной Session.",
                            "Запрещаем repository.list только в изолированной проверке select и statistics.",
                            "В finally восстанавливаем app state и overrides; штатный default не меняем.",
                        ],
                        "code": (                            "import pytest\n"
                            "from fastapi import Depends\n"
                            "from sqlalchemy.orm import Session\n"
                            "from app.api import app\n"
                            "from app.core.dependencies import get_db, get_planner\n"
                            "from app.DBase.repositories import SqlTaskRepository\n"
                            "from app.main import build_service, sql_service_context\n"
                            "from app.services import PlannerService\n\n"
                            "def call_sql(session_factory, method, *args, **kwargs):\n"
                            "    with sql_service_context(session_factory) as planner:\n"
                            "        return getattr(planner, method)(*args, **kwargs)\n\n"
                            "_engine, session_factory = sql_database\n"
                            "with session_factory() as session:\n"
                            "    assert SqlTaskRepository(session).statistics() == {'all': 0, 'open': 0, 'done': 0}\n\n"
                            "first = call_sql(session_factory, 'add_task', 'Done first', 2)\n"
                            "call_sql(session_factory, 'mark_done', first.id)\n"
                            "second = call_sql(session_factory, 'add_task', 'Open second', 3)\n"
                            "third = call_sql(session_factory, 'add_task', 'Done third', 1)\n"
                            "call_sql(session_factory, 'mark_done', third.id)\n"
                            "fourth = call_sql(session_factory, 'add_task', 'Open fourth', 4)\n\n"
                            "with session_factory() as session:\n"
                            "    repository = SqlTaskRepository(session)\n"
                            "    repository.list = lambda: pytest.fail('full list is not part of this query')\n"
                            "    assert repository.statistics() == {'all': 4, 'open': 2, 'done': 2}\n"
                            "    assert [task.id for task in repository.select(is_done=False, limit=1)] == [second.id]\n"
                            "call_sql(session_factory, 'delete_task', fourth.id)\n"
                            "with session_factory() as session:\n"
                            "    assert SqlTaskRepository(session).statistics() == {'all': 3, 'open': 1, 'done': 2}\n\n"
                            "previous_overrides = app.dependency_overrides.copy()\n"
                            "had_factory = hasattr(app.state, 'session_factory')\n"
                            "previous_factory = getattr(app.state, 'session_factory', None)\n"
                            "app.state.session_factory = session_factory\n\n"
                            "def get_sql_planner(db: Session = Depends(get_db)) -> PlannerService:\n"
                            "    return build_service(repository=SqlTaskRepository(db))\n\n"
                            "try:\n"
                            "    app.dependency_overrides[get_planner] = get_sql_planner\n"
                            "    response = api_client.get('/stats')\n"
                            "    assert response.status_code == 200\n"
                            "finally:\n"
                            "    app.dependency_overrides.clear()\n"
                            "    app.dependency_overrides.update(previous_overrides)\n"
                            "    if had_factory:\n"
                            "        app.state.session_factory = previous_factory\n"
                            "    else:\n"
                            "        del app.state.session_factory\n"
                            "assert response.json() == {'total': 3, 'open': 1, 'done': 2}"
                        ),
                        "checks": [
                            "Пустой результат и изменения отражены без ручной правки счётчиков.",
                            "HTTP сохраняет total/open/done и прежние статусы.",
                            "select и statistics не используют repository.list для обработки в Python.",
                            "Тестовый provider не переключает штатный API или CLI с JSON.",
                        ],
                    },
                },
            ],
            "result": (
                "SQL-репозиторий фильтрует, упорядочивает и ограничивает выборку, а также считает all/open/done запросами. "
                "Существующие GET и предметные ответы сохраняются; JSON остаётся штатным хранилищем до общего переключения."
            ),
        }
    ],

    90: [{'title': 'SQL-создание в прежнем Planner',
  'task': 'Существующий Planner создаёт задачи через прежний сервисный сценарий, а SQL-репозиторий '
          'поддерживает создание, список и получение по id. Новая запись получает id от SQLite, сохраняет '
          'предметные правила и внутренние tags. Проверка проходит через существующий POST на отдельной '
          'тестовой базе; штатные API и CLI продолжают использовать JSON.',
  'tasks': [{'title': 'Единый модуль SQL-репозитория',
             'task': 'SqlTaskRepository находится в app/DBase/repositories.py и остаётся единственным '
                     'SQL-репозиторием Planner. Его list возвращает упорядоченные Task, а get возвращает '
                     'Task или None. Импорты используют новый модуль, прежние методы не теряются.',
             'requirements': ['Контрольный commit 22d0229 отделён от относящихся к нему локальных '
                              'незакоммиченных изменений.',
                              'Единственный класс вместе с list/get расположен в app/DBase/repositories.py, '
                              'а потребители импортируют его оттуда.',
                              'В app/routers/tasks/crud.py нет второго определения класса или активного '
                              'импорта SQL-репозитория.'],
             'hint': 'Сначала найдём определение класса и все его импорты, затем перенесём один источник '
                     'кода.',
             'answer': {'explanation': 'В контрольном состоянии после 89 класс ещё расположен в '
                                       'app/routers/tasks/crud.py. Концепт блока задаёт '
                                       'app/DBase/repositories.py как единый путь для методов репозитория. '
                                       'Перенос сохраняет list/get и не делает незакоммиченные изменения '
                                       'StudyHub доказательством изученного результата.',
                        'steps': ['Копируем класс в DBase/repositories.py вместе с нужными импортами.',
                                  'Переводим app/main.py и тесты на новый путь импорта.',
                                  'Удаляем старое определение, чтобы класс не дублировался.',
                                  'Проверяем прежние SQL list/get на тестовой базе.'],
                        'code': 'from sqlalchemy import select\n'
                                'from sqlalchemy.orm import Session\n'
                                'from app.DBase.models import TaskRow, task_from_row\n'
                                'from app.models import Task\n'
                                '\n'
                                'class SqlTaskRepository:\n'
                                '    def __init__(self, session: Session):\n'
                                '        self.session = session\n'
                                '\n'
                                '    def list(self) -> list[Task]:\n'
                                '        statement = select(TaskRow).order_by(TaskRow.id)\n'
                                '        rows = self.session.scalars(statement).all()\n'
                                '        return [task_from_row(row) for row in rows]\n'
                                '\n'
                                '    def get(self, task_id: int) -> Task | None:\n'
                                '        row = self.session.get(TaskRow, task_id)\n'
                                '        if row is None:\n'
                                '            return None\n'
                                '        return task_from_row(row)',
                        'checks': ['Определение SqlTaskRepository осталось в одном модуле.',
                                   'list сортирует строки по id, get возвращает None для неизвестного id.',
                                   'Методы возвращают Task; репозиторий не закрывает Session.']}},
            {'title': 'Создание возвращает Task с id от SQLite',
             'task': 'SqlTaskRepository.create сохраняет Planner-задачу и возвращает предметную модель, '
                     'совместимую с результатом JSON-репозитория.',
             'requirements': ['Прежние валидаторы title, priority и tags срабатывают до SQL-записи.',
                              'TaskRow создаётся без явного id, а Task-заглушки с id=0 нет.',
                              'После flush task_from_row преобразует TaskRow в обычную Task.',
                              'id не вычисляется через max(id) + 1; прежнее разрешение одинаковых title '
                              'сохраняется.'],
             'hint': 'Task требует настоящий id. Мы проверяем отдельные поля, затем создаём Task после '
                     'flush.',
             'answer': {'explanation': 'SQLite назначает ключ при INSERT без явного id. flush выполняет '
                                       'вставку внутри текущей транзакции и делает id доступным; commit '
                                       'остаётся за сервисом. PlannerService применяет прежние валидаторы до '
                                       'входа в write_scope, а репозиторий получает проверенные значения и '
                                       'копирует tags при создании строки.',
                        'steps': ['Нормализуем title и проверяем priority и tags существующими функциями.',
                                  'Создаём TaskRow без id, с is_done=False и title_normalized из '
                                  'проверенного title.',
                                  'Добавляем строку в Session и вызываем flush.',
                                  'Создаём Task через task_from_row.'],
                        'code': 'from sqlalchemy import select\n'
                                'from sqlalchemy.orm import Session\n'
                                'from app.DBase.models import TaskRow, task_from_row\n'
                                'from app.models import Task\n'
                                'from app.validators import validate_priority, validate_tags, '
                                'validate_title\n'
                                '\n'
                                'class SqlTaskRepository:\n'
                                '    def __init__(self, session: Session):\n'
                                '        self.session = session\n'
                                '\n'
                                '    def list(self) -> list[Task]:\n'
                                '        statement = select(TaskRow).order_by(TaskRow.id)\n'
                                '        rows = self.session.scalars(statement).all()\n'
                                '        return [task_from_row(row) for row in rows]\n'
                                '\n'
                                '    def get(self, task_id: int) -> Task | None:\n'
                                '        row = self.session.get(TaskRow, task_id)\n'
                                '        if row is None:\n'
                                '            return None\n'
                                '        return task_from_row(row)\n'
                                '\n'
                                '    def create(self, title: str, priority: int, tags=None) -> Task:\n'
                                '        checked_title = validate_title(title)\n'
                                '        checked_priority = validate_priority(priority)\n'
                                '        checked_tags = validate_tags(list(tags) if tags is not None else '
                                '[])\n'
                                '        row = TaskRow(\n'
                                '            title=checked_title,\n'
                                '            priority=checked_priority,\n'
                                '            is_done=False,\n'
                                '            tags=checked_tags,\n'
                                '            title_normalized=checked_title.lower(),\n'
                                '        )\n'
                                '        self.session.add(row)\n'
                                '        self.session.flush()\n'
                                '        return task_from_row(row)',
                        'checks': ['Обычная вставка не содержит id и не выполняет SELECT max(id).',
                                   'Новая Task сохраняет проверенные поля и независимую копию tags.',
                                   'title_normalized не входит в Task или TaskRead.',
                                   'Репозиторий не вызывает commit или close.']}},
            {'title': 'Сервис завершает целый сценарий записи',
             'task': 'PlannerService.add_task выполняет repository.create внутри переданной области '
                     'изменения и возвращает Task после её завершения. SQL-сборка связывает область с '
                     'Session.begin, а JSON-сборка использует nullcontext. Репозиторий не подтверждает '
                     'отдельную часть операции.',
             'requirements': ['PlannerService хранит фабрику write_scope, а build_service передаёт её '
                              'сервису.',
                              'add_task выполняет repository.create внутри write_scope и возвращает '
                              'результат после выхода из контекста.',
                              'SQL-provider передаёт db.begin; штатная JSON-сборка использует nullcontext.',
                              'Отдельного Unit of Work нет; get_db и репозиторий не подтверждают '
                              'транзакцию.'],
             'hint': 'Сервис получает фабрику контекста и завершает действие до формирования HTTP-ответа.',
             'answer': {'explanation': 'Успешный выход из Session.begin подтверждает транзакцию, а '
                                       'исключение внутри области приводит к rollback. nullcontext сохраняет '
                                       'тот же поток кода для переходной JSON-сборки, но не делает файловую '
                                       'запись транзакционной.',
                        'steps': ['Сохраняем прежние варианты сборки сервиса.',
                                  'Передаём фабрику write_scope в PlannerService.',
                                  'add_task входит в контекст до repository.create.',
                                  'SQL-provider передаёт db.begin, JSON-сборка оставляет nullcontext.'],
                        'code': 'from contextlib import nullcontext\n'
                                'from app.core.config import load_settings\n'
                                'from app.repositories import JsonTaskRepository\n'
                                'from app.storage import JsonStorage\n'
                                '\n'
                                '# Фрагменты app/services.py; остальные методы класса сохраняются.\n'
                                'class PlannerService:\n'
                                '    def __init__(self, storage=None, repository=None, '
                                'write_scope=nullcontext):\n'
                                '        if storage is not None and repository is not None:\n'
                                '            raise ValueError("Pass either storage or repository, not '
                                'both")\n'
                                '        if storage is None and repository is None:\n'
                                '            raise ValueError("Pass storage or repository")\n'
                                '        self.storage = storage\n'
                                '        self.repository = JsonTaskRepository(storage) if repository is None '
                                'else repository\n'
                                '        self.write_scope = write_scope\n'
                                '\n'
                                '    def add_task(self, title, priority, tags=None):\n'
                                '        with self.write_scope():\n'
                                '            return self.repository.create(title, priority, tags)\n'
                                '\n'
                                '# Фрагмент app/main.py; прежние ветви сборки сохраняются.\n'
                                'def build_service(storage=None, settings=None, repository=None, '
                                'write_scope=nullcontext):\n'
                                '    if repository is not None:\n'
                                '        if storage is not None:\n'
                                '            raise ValueError("Pass either storage or repository, not '
                                'both")\n'
                                '        return PlannerService(repository=repository, '
                                'write_scope=write_scope)\n'
                                '    if storage is not None:\n'
                                '        return PlannerService(storage=storage, write_scope=write_scope)\n'
                                '    if settings is None:\n'
                                '        settings = load_settings()\n'
                                '    return PlannerService(\n'
                                '        storage=JsonStorage(settings.json_path), write_scope=write_scope\n'
                                '    )',
                        'checks': ['Обычная сборка по умолчанию сохраняет JsonStorage.',
                                   'SQL write_scope охватывает create и завершается до возврата из add_task.',
                                   'Ошибка до выхода из контекста откатывает вставку.']}},
            {'title': 'Прежний POST работает с SQL-provider',
             'task': 'POST /tasks проверяется с SQL-provider на отдельной файловой SQLite. Новая Session '
                     'подтверждает строку, а восстановленные зависимости возвращают маршрут к JSON-provider.',
             'requirements': ['Тест дополняет tests/test_sql_repository.py и использует существующие '
                              'sql_database и api_client fixtures.',
                              'Override заменяет только get_planner; SQL-provider получает Session через '
                              'get_db и передаёт db.begin в build_service.',
                              'Успешный POST возвращает 201, положительный id и ровно поля id, title, '
                              'priority, is_done; запрос без priority возвращает 422.',
                              'Новая Session сверяет title, priority, is_done=False, tags=[] и '
                              'title_normalized; HTTP-ответ не содержит внутренних полей.',
                              'Ошибка выхода из db.begin прерывает запрос без ложного 201, а новая Session '
                              'не находит отменённую строку.',
                              'finally восстанавливает overrides и прежний app.state.session_factory; '
                              'следующий POST проходит через штатный JSON-provider.'],
             'hint': 'Подменяем только provider в тесте и сохраняем прежнее состояние приложения для '
                     'finally.',
             'answer': {'explanation': 'Тест направляет тот же маршрут на SQL-сборку через существующую '
                                       'зависимость ресурса. Файловая fixture позволяет после ответа открыть '
                                       'независимую Session и подтвердить запись.',
                        'steps': ['Сохраняем исходные overrides и session_factory.',
                                  'Направляем get_planner на SQL-репозиторий с write_scope=db.begin.',
                                  'Проверяем 201, публичные поля и 422 без priority.',
                                  'Новой Session сверяем строку и title_normalized.',
                                  'Повторяем POST с контекстом, который выбрасывает ошибку при выходе, и '
                                  'проверяем отсутствие строки.',
                                  'В finally восстанавливаем зависимости и проверяем JSON POST.'],
                        'code': 'from contextlib import contextmanager\n'
                                'import pytest\n'
                                'from fastapi import Depends\n'
                                'from sqlalchemy import select\n'
                                'from sqlalchemy.orm import Session\n'
                                'from app.api import app\n'
                                'from app.core.dependencies import get_db, get_planner\n'
                                'from app.DBase.models import TaskRow\n'
                                'from app.DBase.repositories import SqlTaskRepository\n'
                                'from app.main import build_service\n'
                                'from app.services import PlannerService\n'
                                '\n'
                                'def test_sql_create_post_keeps_contract_and_restores_json(sql_database, '
                                'api_client):\n'
                                '    _engine, session_factory = sql_database\n'
                                '    previous_overrides = app.dependency_overrides.copy()\n'
                                '    had_factory = hasattr(app.state, "session_factory")\n'
                                '    previous_factory = getattr(app.state, "session_factory", None)\n'
                                '    app.state.session_factory = session_factory\n'
                                '\n'
                                '    def get_sql_planner(db: Session = Depends(get_db)) -> PlannerService:\n'
                                '        return build_service(repository=SqlTaskRepository(db), '
                                'write_scope=db.begin)\n'
                                '\n'
                                '    def get_failing_planner(db: Session = Depends(get_db)) -> '
                                'PlannerService:\n'
                                '        def fail_before_commit():\n'
                                '            @contextmanager\n'
                                '            def scope():\n'
                                '                with db.begin():\n'
                                '                    yield\n'
                                '                    raise RuntimeError("контролируемый отказ")\n'
                                '            return scope()\n'
                                '        return build_service(repository=SqlTaskRepository(db), '
                                'write_scope=fail_before_commit)\n'
                                '\n'
                                '    app.dependency_overrides[get_planner] = get_sql_planner\n'
                                '    try:\n'
                                '        response = api_client.post("/tasks", json={"title": "Новая задача", '
                                '"priority": 3})\n'
                                '        missing_priority = api_client.post("/tasks", json={"title": "Без '
                                'приоритета"})\n'
                                '        app.dependency_overrides[get_planner] = get_failing_planner\n'
                                '        with pytest.raises(RuntimeError, match="контролируемый отказ"):\n'
                                '            api_client.post("/tasks", json={"title": "Не сохранится", '
                                '"priority": 2})\n'
                                '    finally:\n'
                                '        app.dependency_overrides.clear()\n'
                                '        app.dependency_overrides.update(previous_overrides)\n'
                                '        if had_factory:\n'
                                '            app.state.session_factory = previous_factory\n'
                                '        else:\n'
                                '            del app.state.session_factory\n'
                                '\n'
                                '    assert response.status_code == 201\n'
                                '    assert set(response.json()) == {"id", "title", "priority", "is_done"}\n'
                                '    task_id = response.json()["id"]\n'
                                '    assert task_id > 0 and response.json()["is_done"] is False\n'
                                '    assert missing_priority.status_code == 422\n'
                                '    with session_factory() as verification_session:\n'
                                '        row = verification_session.get(TaskRow, task_id)\n'
                                '        assert row is not None\n'
                                '        assert (row.title, row.priority, row.is_done, row.tags, '
                                'row.title_normalized) == ("Новая задача", 3, False, [], "новая задача")\n'
                                '        failed_row = '
                                'verification_session.scalar(select(TaskRow).where(TaskRow.title == "Не '
                                'сохранится"))\n'
                                '        assert failed_row is None\n'
                                '\n'
                                '    json_response = api_client.post("/tasks", json={"title": "Обычная '
                                'JSON", "priority": 2})\n'
                                '    assert json_response.status_code == 201\n'
                                '    assert json_response.json()["title"] == "Обычная JSON"\n',
                        'checks': ['POST сохраняет прежний публичный ответ, а независимая Session '
                                   'подтверждает SQL-строку.',
                                   'Отсутствующий priority не заменяется предметным default.',
                                   'Ошибка до подтверждения не выдаёт 201 и не оставляет строку.',
                                   'После теста JSON-provider снова выполняет создание.']}},
            {'title': 'Новая Session подтверждает сохранение и rollback',
             'task': 'SQL create сохраняет данные после импорта. Отдельная Session подтверждает результат, а '
                     'ошибка до commit отменяет только текущее добавление.',
             'requirements': ['Тест дополняет tests/test_sql_repository.py и переносит одну задачу с явным '
                              'id через import_snapshot в подготовленную пустую базу.',
                              'Прямой PlannerService.add_task сохраняет непустые tags; одинаковые title '
                              'допускаются как две записи с разными id.',
                              'Новая Session находит импортированную и обе созданные строки и сверяет '
                              'предметные поля и title_normalized.',
                              'Контекст выбрасывает контролируемую ошибку после flush, но до подтверждения; '
                              'новая Session не находит отменённую запись.',
                              'Проверка не требует непрерывных id и не переключает штатные API или CLI на '
                              'SQL.'],
             'hint': 'Сверим ответ с независимым чтением, затем проверим, что незавершённая область не '
                     'оставила строку.',
             'answer': {'explanation': 'id после flush позволяет собрать Task, но независимое чтение '
                                       'подтверждает только успешно завершённую транзакцию. Внутренний вызов '
                                       'сервиса сохраняет tags без изменения HTTP-формы. Импортированные id '
                                       'не требуют, чтобы новая нумерация шла без пропусков.',
                        'steps': ['Переносим одну проверенную запись существующим import_snapshot.',
                                  'Создаём через сервис задачу с непустыми tags и ещё одну с тем же title.',
                                  'Новой Session сверяем импортированную запись, обе новые задачи и '
                                  'title_normalized.',
                                  'Вызываем добавление с ошибкой после flush и до подтверждения.',
                                  'Повторным чтением убеждаемся, что отменённой строки нет, а прежние записи '
                                  'остались.'],
                        'code': 'import json\n'
                                'from contextlib import contextmanager\n'
                                'import pytest\n'
                                'from sqlalchemy import select\n'
                                'from app.DBase.import_tasks import import_snapshot\n'
                                'from app.DBase.models import TaskRow\n'
                                'from app.DBase.repositories import SqlTaskRepository\n'
                                'from app.main import build_service\n'
                                'from app.models import Task\n'
                                '\n'
                                'def test_sql_create_preserves_tags_and_rolls_back(sql_database, tmp_path):\n'
                                '    engine, session_factory = sql_database\n'
                                '    snapshot_path = tmp_path / "snapshot.json"\n'
                                '    snapshot_path.write_text(\n'
                                '        json.dumps([Task(100, "Импорт", priority=2, '
                                'tags=["старые"]).to_dict()], ensure_ascii=False),\n'
                                '        encoding="utf-8",\n'
                                '    )\n'
                                '    database_url = engine.url.render_as_string(hide_password=False)\n'
                                '    assert import_snapshot(snapshot_path, database_url) == 1\n'
                                '\n'
                                '    with session_factory() as session:\n'
                                '        planner = build_service(repository=SqlTaskRepository(session), '
                                'write_scope=session.begin)\n'
                                '        created = planner.add_task("План", priority=4, tags=["личное"])\n'
                                '        created_id = created.id\n'
                                '        duplicate_title = planner.add_task("План", priority=2)\n'
                                '        duplicate_id = duplicate_title.id\n'
                                '    assert created_id > 0 and duplicate_id > 0\n'
                                '    assert len({100, created_id, duplicate_id}) == 3\n'
                                '\n'
                                '    with session_factory() as verification_session:\n'
                                '        imported = verification_session.get(TaskRow, 100)\n'
                                '        created_row = verification_session.get(TaskRow, created_id)\n'
                                '        duplicate_row = verification_session.get(TaskRow, '
                                'duplicate_id)\n'
                                '        assert imported is not None\n'
                                '        assert (imported.title, imported.priority, imported.is_done, '
                                'imported.tags, imported.title_normalized) == ("Импорт", 2, False, '
                                '["старые"], "импорт")\n'
                                '        assert created_row is not None\n'
                                '        assert (created_row.title, created_row.priority, '
                                'created_row.is_done, created_row.tags, created_row.title_normalized) == '
                                '("План", 4, False, ["личное"], "план")\n'
                                '        assert duplicate_row is not None\n'
                                '        assert (duplicate_row.title, duplicate_row.priority, '
                                'duplicate_row.is_done, duplicate_row.tags, duplicate_row.title_normalized) '
                                '== ("План", 2, False, [], "план")\n'
                                '\n'
                                '    with session_factory() as session:\n'
                                '        def fail_before_commit():\n'
                                '            @contextmanager\n'
                                '            def scope():\n'
                                '                with session.begin():\n'
                                '                    yield\n'
                                '                    raise RuntimeError("контролируемый отказ")\n'
                                '            return scope()\n'
                                '        planner = build_service(repository=SqlTaskRepository(session), '
                                'write_scope=fail_before_commit)\n'
                                '        with pytest.raises(RuntimeError, match="контролируемый отказ"):\n'
                                '            planner.add_task("Не сохранится", priority=2)\n'
                                '\n'
                                '    with session_factory() as verification_session:\n'
                                '        failed_row = '
                                'verification_session.scalar(select(TaskRow).where(TaskRow.title == "Не '
                                'сохранится"))\n'
                                '        assert failed_row is None\n',
                        'checks': ['Новая Session находит импортированный id и все поля обеих созданных '
                                   'записей.',
                                   'Повторный title сохраняется под отдельным id, tags остаются внутри Task '
                                   'и таблицы.',
                                   'Исключение после flush откатывает транзакцию и не возвращает успешную '
                                   'Task.',
                                   'После отказа новая Session не находит частичную запись.']}}],
  'result': 'Прежний Planner создаёт SQL-задачу с id от SQLite и проверяет её отдельной Session; '
            'HTTP-контракт и JSON default сохранены.'}],
    95: [
        {
            "title": "Переносим буквальный поиск в SQLite",
            "task": (
                "Существующий поиск Planner обрезает края запроса, применяет Python lower() и ищет буквальную подстроку. "
                "SqlTaskRepository выполняет это условие в SQLite по title_normalized и возвращает обычные Task. "
                "API и CLI по умолчанию продолжают использовать JSON, SQL-проверки работают на отдельной базе."
            ),
            "tasks": [
                {
                    "title": "Зафиксировать договор и доступную точку входа",
                    "task": (
                        "JSON-метод search() обрезает края запроса, применяет Python lower(), возвращает [] для пустого значения и сохраняет порядок списка. "
                        "Готовый JSON-сервис показывает совпадения для русского фрагмента, [] для пустой строки и пробелов, а также фактический порядок id. "
                        "SQL-операции предыдущего блока доступны, поэтому эта проверка фиксирует исходный контракт, не меняя JSON-данные."
                    ),
                    "requirements": [
                        "Контракт включает query.strip().lower() и буквальное совпадение фрагмента.",
                        "Пустой запрос и запрос из пробелов возвращают пустой список.",
                        "Фактический порядок JSON сопоставлен с порядком id исходного списка.",
                    ],
                    "hint": "Используем штатный JSON-сервис; порядок измеряем, а не предполагаем.",
                    "answer": {
                        "explanation": (
                            "Прежний репозиторий очищает только края запроса, затем ищет lower() фрагмент в lower() заголовка. "
                            "Пустой нормализованный запрос даёт пустой список. JSON сохраняет исходный порядок; SQL требует явного ORDER BY. "
                            "На наборе текущего занятия порядок сверяется с фактическим результатом JSON."
                        ),
                        "steps": [
                            "Получаем штатный JSON-сервис через build_service().",
                            "Вызываем search_tasks для непустого фрагмента, пустой строки и пробельного запроса.",
                            "Сверяем порядок возвращённых id с порядком id исходного списка.",

                        ],
                        "code": (
                            "from app.main import build_service\n\n"
                            "service = build_service()  # штатный JSON default\n"
                            "all_tasks = service.list_tasks()\n"
                            "matches = service.search_tasks(\"  ПЛАН  \")\n"
                            "assert service.search_tasks(\"\") == []\n"
                            "assert service.search_tasks(\"   \") == []\n"
                            "print([task.id for task in all_tasks])\n"
                            "print([task.id for task in matches])"
                        ),
                        "checks": [
                            "Внутренние пробелы запроса не удаляются.",
                            "Пустой запрос не совпадает со всеми строками.",
                            "Фактический порядок JSON виден по id исходного списка.",
                        ],
                    },
                },
                {
                    "title": "Сравнить регистр, LIKE и буквальный instr",
                    "task": (
                        "Опыт SQLite показывает различие Python lower() и SQLite lower() на русском и латинском тексте. "
                        "Пример сопоставляет шаблонные % и _ в LIKE с буквальным поиском instr. "
                        "Опыт использует собственные значения и не читает рабочий Planner."
                    ),
                    "requirements": [
                        "Все пользовательские значения передаются SQL отдельно от текста запроса.",
                        "Результаты показывают русские заглавные буквы и буквальное совпадение %_.",
                        "Пустой needle обрабатывается до основного SQL-поиска.",
                    ],
                    "hint": "Сравним lower() напрямую, затем передадим значения параметрами в SELECT instr(?, ?).",
                    "answer": {
                        "explanation": (
                            "Python lower() преобразует Unicode, а SQLite lower() без ICU преобразует только ASCII. "
                            "В LIKE процент и подчёркивание являются шаблонными знаками; instr ищет фрагмент буквально. "
                            "instr возвращает 1 для пустого needle, поэтому пустой поиск завершается до SQL."
                        ),
                        "steps": [
                            "Сравниваем Python результат с SELECT lower(?) на одной строке.",
                            "Передаём текст и %_ двумя параметрами в SELECT instr(?, ?).",
                            "Проверяем пустой needle и ранний return [].",
                        ],
                        "code": (
                            "import sqlite3\n\n"
                            "connection = sqlite3.connect(\":memory:\")\n"
                            "text = \"ПЛАН 20%_ готов\"\n"
                            "print(text.lower())\n"
                            "print(connection.execute(\"SELECT lower(?)\", (text,)).fetchone()[0])\n"
                            "print(connection.execute(\"SELECT ? LIKE ?\", (\"План задач\", \"%_%\")).fetchone()[0])\n"
                            "print(connection.execute(\"SELECT instr(?, ?)\", (text, \"%_\")).fetchone()[0])\n"
                            "print(connection.execute(\"SELECT instr(?, ?)\", (text, \"\")).fetchone()[0])\n"
                            "connection.close()"
                        ),
                        "checks": [
                            "Python lower() переводит русские заглавные в строчные, SQLite lower() оставляет их.",
                            "instr для %_ находит буквальный фрагмент.",
                            "Пустой needle даёт позицию 1 и не отправляется в основной поиск.",
                        ],
                    },
                },
                {
                    "title": "Добавить search() в существующий SQL-репозиторий",
                    "task": (
                        "SqlTaskRepository.search() сохраняет прежнее правило нормализации, обрабатывает пустой ввод и ищет по title_normalized через instr. "

                        "Метод преобразует ORM-строки в Task; новый репозиторий, HTTP-маршрут и SQL fallback отсутствуют."
                    ),
                    "requirements": [
                        "Используйте параметр SQLAlchemy, не f-string с пользовательским фрагментом.",
                        "Условие instr выполняется в SQL до материализации результата.",
                        "Задайте явный порядок и верните Task до закрытия Session.",
                    ],
                    "hint": "Собираем select(TaskRow).where(...).order_by(...); mapping уже применялся для SQL-чтения.",
                    "answer": {
                        "explanation": (
                            "Нормализация сохраняет прежнее правило. SQLAlchemy связывает query как значение, а instr проверяет вхождение в title_normalized. "
                            "Порядок по id задаёт явное SQL-поведение, которое сверяем с JSON на исходной fixture. "
                            "task_from_row возвращает предметные Task, не ORM-строки."
                        ),
                        "steps": [
                            "Нормализуем query и возвращаем [] до SQL, если строка пуста.",
                            "Добавляем func.instr(TaskRow.title_normalized, query) > 0 и order_by(TaskRow.id).",
                            "Получаем строки через session.scalars(statement).all().",
                            "Преобразуем каждую строку через task_from_row; Session остаётся у владельца.",
                        ],
                        "code": (
                            "from sqlalchemy import func, select\n\n"
                            "def search(self, query: str) -> list[Task]:\n"
                            "    query = query.strip().lower()\n"
                            "    if not query:\n"
                            "        return []\n\n"
                            "    statement = (\n"
                            "        select(TaskRow)\n"
                            "        .where(func.instr(TaskRow.title_normalized, query) > 0)\n"
                            "        .order_by(TaskRow.id)\n"
                            "    )\n"
                            "    rows = self.session.scalars(statement).all()\n"
                            "    return [task_from_row(row) for row in rows]"
                        ),
                        "checks": [
                            "Поиск не загружает полный list() для фильтрации в Python.",
                            "Результат содержит Task и не выдаёт title_normalized.",
                            "Читающий метод не закрывает Session и не делает commit.",
                        ],
                    },
                },
                {
                    "title": "Проверить фрагменты и пути обновления",
                    "task": (
                        "Изолированная SQLite проверяет русский и латинский регистр, кавычку, буквальные % и _, пустой запрос, одинаковые заголовки и порядок id. "
                        "Готовые SQL create, PUT/PATCH и импорт позволяют проверить title_normalized, tags и чтение через новую Session. "
                        "Публичный контракт и штатный JSON default остаются прежними."
                    ),
                    "requirements": [
                        "SQL-данные принадлежат изолированной базе.",
                        "После PUT/PATCH старый фрагмент не находит задачу, новый фрагмент находит её в новой Session.",
                        "Сохраняются id и tags; title_normalized остаётся техническим полем.",
                        "API/CLI по умолчанию остаются на JSON, новый HTTP-маршрут и миграция не добавляются.",
                    ],
                    "hint": "Сверяем список id и повторно читаем запись после закрытия исходной Session.",
                    "answer": {
                        "explanation": (
                            "Параметризация сохраняет кавычки как данные, instr считает % и _ обычными символами, а ранний выход оставляет пустой поиск пустым. "
                            "Каждый путь записи обновляет title_normalized вместе с title. Независимое чтение подтверждает сохранённое состояние и сохранность tags. "
                            "После каждого пути записи независимое чтение подтверждает согласованные title, title_normalized и tags."
                        ),
                        "steps": [
                            "Создаём тестовые строки с русским заголовком, кавычкой, % и _, затем сверяем ожидаемые id.",
                            "Сравниваем порядок SQL ORDER BY id с фактическим порядком JSON на той же fixture.",
                            "После готового SQL PUT/PATCH открываем новую Session: старый запрос пуст, новый возвращает задачу.",
                            "Повторяем поиск для импортированной копии и сверяем id, tags и title_normalized.",
                            "Подтверждаем неизменность публичных полей ответа и JSON default.",
                        ],
                        "code": (
                            "import sqlite3\n\n"
                            "connection = sqlite3.connect(\":memory:\")\n"
                            "connection.execute(\"CREATE TABLE tasks (id INTEGER PRIMARY KEY, title_normalized TEXT)\")\n"
                            "connection.executemany(\"INSERT INTO tasks(title_normalized) VALUES (?)\", [(\"план 20%_ готов\",), (\"latin o\u0027reilly\",)])\n\n"
                            "def search(query: str) -> list[int]:\n"
                            "    query = query.strip().lower()\n"
                            "    if not query:\n"
                            "        return []\n"
                            "    rows = connection.execute(\"SELECT id FROM tasks WHERE instr(title_normalized, ?) > 0 ORDER BY id\", (query,))\n"
                            "    return [row[0] for row in rows]\n\n"
                            "assert search(\"  ПЛАН  \") == [1]\n"
                            "assert search(\"%_\") == [1]\n"
                            "assert search(\"o\u0027re\") == [2]\n"
                            "assert search(\"   \") == []\n"
                            "connection.close()"
                        ),
                        "checks": [
                            "Процент и подчёркивание находятся как буквальный текст.",
                            "Результат содержит ожидаемые id в подтверждённом порядке.",
                            "Переименование видно после нового чтения; tags и публичный ответ сохранены.",
                            "Новая Session видит нормализованный заголовок и прежние tags.",
                        ],
                    },
                },
            ],
            "result": "SQL-поиск сохраняет буквальный фрагмент, правила регистра и пустого ввода, возвращает Task и не меняет штатный JSON-путь.",
        }
    ],

    96: [
        {
            "title": "CLI получает отдельный ресурс на команду",
            "task": (
                "Существующий CLI запускает прежние handlers через один цикл run. "
                "SQL-путь использует отдельный ресурсный контекст для каждой распознанной команды, а обычный main до занятия 98 продолжает использовать JSON. "
                "Сообщения, ввод, операции Planner и чтение сохранённого состояния остаются прежними."
            ),
            "tasks": [
                {
                    "title": "Подготовить общий контракт и изменить диспетчер",
                    "task": "run принимает вызываемую фабрику, которая при каждом входе возвращает контекст сервиса. execute_command открывает контекст только после распознавания существующего handler. JSON остаётся default, run не возвращает сервис с закрытой Session.",
                    "requirements": [
                        "SQL и JSON передают run один тип фабрики контекста.",
                        "exit и неизвестная команда не вызывают фабрику.",
                        "Handler получает сервис внутри with; исключение проходит наружу после очистки.",
                        "Обычный main сохраняет прежний JSON-путь до занятия 98.",
                    ],
                    "hint": "Мы сохраняем COMMAND_HANDLERS и execute_command, меняя только место, где run получает сервис.",
                    "answer": {
                        "explanation": "Сначала диспетчер нормализует ввод, обрабатывает exit и ищет handler. Только известная команда входит в ресурсную область. Обычная сборка выдаёт прежний JSON-сервис, а SQL-контекст используется для изолированной проверки.",
                        "steps": [
                            "Оборачиваем build_service(settings=settings) в JSON-контекст без смены пути.",
                            "Передаём run фабрику контекста, а SQL-тесту partial(sql_service_context, session_factory).",
                            "Оставляем exit и неизвестную команду до входа в with.",
                            "Запускаем handler внутри контекста и удаляем возврат service из run.",
                        ],
                        "code": """# Фрагменты app/main.py и app/cli.py. Их build_service, handlers и импорты уже существуют.
from contextlib import contextmanager
from functools import partial

@contextmanager
def json_service_context(settings):
    yield build_service(settings=settings)

def main():
    settings = load_settings()
    try:
        run(partial(json_service_context, settings))
    except StorageError as error:
        print(f"Planner остановлен: {error}")

def execute_command(service_context_factory, command, read=input, write=print):
    normalized = command.strip().lower()
    if normalized == "exit":
        write("Работу завершили")
        return False
    handler = COMMAND_HANDLERS.get(normalized)
    if handler is None:
        write("Неизвестная команда")
        return True
    with service_context_factory() as service:
        handler(service, read=read, write=write)
    return True

def run(service_context_factory, read=input, write=print):
    while True:
        show_menu(write)
        command = read("Команда: ")
        if not execute_command(service_context_factory, command, read, write):
            break""",
                        "checks": [
                            "Создание контекста стоит после exit и поиска handler.",
                            "Handlers, ввод и сообщения остаются прежними.",
                            "SQL Session не возвращается из run после закрытия.",
                        ],
                    },
                },
                {
                    "title": "Проверить SQL-команды на временной базе",
                    "task": "Тестовый CLI проходит семь основных действий add, list, find, done, stats, search и delete, а также повторный done, неизвестный id и неверный ввод. Каждая распознанная команда получает собственную Session; повтор ввода внутри find остаётся в том же handler. Следующая команда читает подтверждённые изменения, а unknown и exit завершаются без ресурса.",
                    "requirements": [
                        "SQLite-файл и исходная схема создаются в tmp_path.",
                        "Семь основных действий и три отдельные проверки дают десять разных Session; каждая закрывается до следующего меню.",
                        "Сценарий использует существующие handlers и реальные SQL-операции.",
                        "Повторный done, неизвестный id и неверный ввод сохраняют прежние результаты; повтор ввода внутри find остаётся в той же Session.",
                    ],
                    "hint": "Мы оборачиваем sql_service_context счётчиком, а затем читаем результат новой Session.",
                    "answer": {
                        "explanation": "Счётчик фиксирует всю ресурсную область, а session_objects удерживает реальные Session для проверки разных идентификаторов. Семь основных действий плюс повторный done, неизвестный id и неверный ввод дают десять закрытых Session; повторный ввод id внутри find не открывает новую. Статистика дополнительно подтверждает сохранённый done. Внутри по-прежнему используется sql_service_context и настоящий PlannerService.",
                        "steps": [
                            "Создаём отдельную файловую SQLite и схему.",
                            "Оборачиваем SessionFactory, сохраняем каждую Session и считаем вход/выход контекста.",
                            "Подаём команды через обычный read-fixture и run.",
                            "Проверяем десять пар open/close и десять разных Session; повторный ввод внутри find остаётся в одной области, а unknown/exit не открывают контекст.",
                            "Читаем итог через свежую Session и сверяем с выводом CLI.",
                        ],
                        "code": """import pytest
from contextlib import contextmanager
from sqlalchemy import URL
from app.DBase.engine import make_engine
from app.DBase.models import Base
from app.DBase.session import make_session_factory
from app.main import sql_service_context
from app.cli import run

def test_cli_uses_a_new_session_per_command(tmp_path):
    database_path = tmp_path / "cli.sqlite3"
    database_url = URL.create("sqlite", database=database_path.as_posix()).render_as_string(
        hide_password=False
    )
    engine = make_engine(database_url)
    try:
        Base.metadata.create_all(engine)
        base_session_factory = make_session_factory(engine)
        session_objects = []
        events = []

        def observed_session_factory():
            session = base_session_factory()
            session_objects.append(session)
            return session

        @contextmanager
        def observed_context():
            events.append("open")
            try:
                with sql_service_context(observed_session_factory) as service:
                    yield service
            finally:
                events.append("close")

        answers = iter([
            "add", "Черновик", "2", "list", "find", "1",
            "done", "1", "done", "1", "find", "999",
            "find", "not-an-int", "1", "stats", "search", "черн",
            "delete", "1", "unknown", "exit",
        ])
        messages = []
        run(observed_context, read=lambda _prompt: next(answers), write=messages.append)

        assert events == ["open", "close"] * 10
        assert len({id(session) for session in session_objects}) == 10
        assert sum("Черновик" in message for message in messages) == 5
        assert any("Выполнено: 1" in message for message in messages)
        assert any("выполнена" in message for message in messages)
        assert any("не найдена" in message.casefold() for message in messages)
        assert any("целое число" in message.casefold() for message in messages)
        assert any("Неизвестная команда" in message for message in messages)
        assert any("Работу завершили" in message for message in messages)
        with sql_service_context(base_session_factory) as service:
            assert service.list_tasks() == []
    finally:
        engine.dispose()""",
                        "checks": [
                            "Распознанные команды получают разные Session, а контексты заканчиваются до следующего меню.",
                            "Новая Session видит добавленную и изменённую задачу; после delete запись отсутствует.",
                            "unknown и exit не обращаются к базе.",
                        ],
                    },
                },
                {
                    "title": "Сохранить JSON-default и известные ошибки",
                    "task": "Обычный CLI продолжает использовать прежний JSON до переключения в 98. Ошибка во время handler не подтверждается ложным сообщением, а контекст не добавляет общую обработку SQL-исключений.",
                    "requirements": [
                        "JSON-проверка использует временный путь и подтверждает чтение новым сервисом.",
                        "Validation, not-found и повторный done сохраняют прежние сообщения и состояние.",
                        "Нет второго источника, backend-флага, широкого except или JSON-fallback из SQL.",
                    ],
                    "hint": "Мы создаём Settings для tmp_path, не меняя конфигурацию штатного запуска.",
                    "answer": {
                        "explanation": "JSON-контекст выдаёт сервис с тем же путём, который задан во временных настройках. Отказы проходят по прежнему error contract; классификация ошибок базы будет отдельной темой.",
                        "steps": [
                            "Создаём Settings с json_path внутри tmp_path.",
                            "Запускаем add и list через JSON-фабрику.",
                            "Создаём сервис через тот же контекст и перечитываем задачу из файла.",
                            "Проверяем известный отказ и отсутствие сообщения об успешном изменении.",
                            "Оставляем обычный main на JSON до занятия 98.",
                        ],
                        "code": """# Фрагмент tests/test_cli.py; FailingStorage и make_reader остаются прежними helper-функциями.
import pytest
from contextlib import contextmanager
from functools import partial
from pathlib import Path
from app.core.config import Settings
from app.cli import execute_command, run
from app.errors import StorageError
from app.main import json_service_context
from app.services import PlannerService
from app.storage import MemoryStorage

def test_json_cli_reuses_the_configured_temp_path(tmp_path):
    settings = Settings(
        json_path=tmp_path / "tasks.json",
        app_name="Test",
        database_url="sqlite:///unused.sqlite3",
    )
    answers = iter(["add", "Черновик", "2", "list", "exit"])
    messages = []
    run(
        partial(json_service_context, settings),
        read=lambda _prompt: next(answers),
        write=messages.append,
    )
    assert Path(settings.json_path).exists()
    assert any("Черновик" in message for message in messages)
    with json_service_context(settings) as service:
        assert service.list_tasks()[0].title == "Черновик"

def test_storage_error_closes_scope_without_success_message():
    storage = FailingStorage(MemoryStorage(), fail_on="save")
    events = []

    @contextmanager
    def failing_context():
        events.append("open")
        try:
            yield PlannerService(storage)
        finally:
            events.append("close")

    messages = []
    with pytest.raises(StorageError):
        execute_command(
            failing_context,
            "add",
            read=make_reader(["Набросок", "2"]),
            write=messages.append,
        )
    assert events == ["open", "close"]
    assert not any("Набросок" in message for message in messages)""",
                        "checks": [
                            "API и CLI продолжают использовать прежний JSON до занятия 98.",
                            "Чтение новым сервисом видит задачу из тестового файла.",
                            "При исключении handler контекст закрывается, исключение выходит наружу, ложного успеха нет.",
                            "Нет нового общего error handler.",
                        ],
                    },
                },
            ],
            "result": "CLI использует отдельный ресурсный контекст на команду, а обычный Planner сохраняет JSON до согласованного переключения.",
        }
    ],
    99: [
        {
            "title": "Удаление JSON-backend после перехода на SQLite",
            "task": (
                "Рабочий Planner использует одну SQLite через API и CLI; прежние операции, данные и внутренние tags сохраняются. "
                "После удаления runtime-зависимостей настройки и штатные тесты больше не требуют файлового хранилища. "
                "Ошибка базы не включает JSON или память как запасной источник, а явный импортёр продолжает переносить проверенную копию отдельно."
            ),
            "tasks": [
                {
                    "title": "Подтвердить B98 до очистки",
                    "task": (
                        "До зависимой очистки отчёт подтверждает фактическую точку B98: API и CLI работают через одну SQLite, изменения видны обоим интерфейсам и после нового запуска, перенос завершён. "
                        "Номер занятия, план или незакоммиченный diff не доказывают этот результат; при нехватке подтверждений очистка останавливается."
                    ),
                    "requirements": [
                        "Проверенный commit однозначно задаёт состояние проекта и отделён от незакоммиченных изменений.",
                        "Тестовые данные подтверждают работу обоих интерфейсов и чтение результата новым процессом.",
                        "При неподтверждённом B98 очистка не начинается; недостающий переход остаётся задачей 97–98.",
                        "Подтверждённый commit однозначно задаёт состояние B98 и отделён от незакоммиченных изменений.",
                    ],
                    "hint": "Мы сверяем журнал с реальной сборкой, ищем вызывающий код и не удаляем совпадения по слову JSON.",
                    "answer": {
                        "explanation": (
                            "B98 подтверждён, когда API и CLI используют одну базу, видят изменения друг друга и сохраняют их после нового запуска, "
                            "а перенесённый набор соответствует актуальной копии. Если любой пункт не подтверждён на одном checkpoint, зависимая очистка не начинается."
                        ),
                        "steps": [
                            "Сверяем журнал и commit; отдельно смотрим git status и diff.",
                            "На изолированной базе создаём задачу через API, читаем и меняем её CLI, затем читаем новым API-запросом и после перезапуска.",
                            "При недоказанном B98 указываем недостающую проверку и не начинаем удаление.",
                        ],
                        "code": "git log -1 --oneline\ngit status --short\n# На тестовой БД сверяем обмен API и CLI, затем чтение после нового запуска.",
                        "checks": [
                            "Незакоммиченные изменения не выдаются за подтверждённый checkpoint.",
                            "Проверка обмена данными использует тестовую базу и новый ресурс.",
                            "До дальнейших изменений подтверждены общий SQL-источник, обмен данными и повторный запуск.",
                        ],
                    },
                },
                {
                    "title": "Составить карту JSON-ссылок и потребителей",
                    "task": (
                        "Карта для каждой ссылки на старое хранилище называет потребителя, роль и действие до удаления. "
                        "Runtime-зависимости и тестовые фикстуры отделены от HTTP JSON, сериализации Task, JSON-колонки tags, архива и отдельного импортёра."
                    ),
                    "requirements": [
                        "Найдены JsonTaskRepository, JsonStorage, MemoryStorage, app/storage.py, JSON_PATH и переходный storage-параметр вместе с импортами и вызовами.",
                        "Для каждой ссылки указано, относится ли она к runtime, тестам, импортёру, архиву или публичному формату.",
                        "JSON-ответы API, сериализация Task, tags в SQLite, архив и importer не помечены как файловый runtime-backend.",
                        "Файловый runtime-источник и его тестовые потребители отмечены для удаления или перевода после проверки SQL-пути.",
                    ],
                    "hint": "Мы прослеживаем вызовы от API и CLI к фабрике сервиса и репозиторию; одного поиска по JSON недостаточно.",
                    "answer": {
                        "explanation": "Одинаковая метка формата не означает одинаковый источник данных. Решение следует из направления чтения и записи и из того, запускается ли компонент в штатном runtime.",
                        "steps": [
                            "Ищем определения классов, конфигурацию и параметры сборки.",
                            "Для каждого совпадения проверяем импортирующий модуль и вызывающий путь.",
                            "Размечаем runtime и test-only зависимости отдельно от HTTP, tags, архива и импортёра.",
                            "Перед удалением проверяем, что каждый runtime-потребитель уже использует SQL.",
                        ],
                        "code": 'rg -n "JsonTaskRepository|JsonStorage|MemoryStorage|app/storage.py|JSON_PATH|storage=|from_dict|import_tasks" app tests .env.example README.md',
                        "checks": [
                            "У каждой старой runtime-ссылки есть известный потребитель и безопасный порядок удаления.",
                            "Нужные JSON-формат, колонка, архив и импортёр остаются в своих ролях.",
                            "Неиспользуемый код не удалён по совпадению имени без проверки вызовов.",
                        ],
                    },
                },
                {
                    "title": "Убрать файловую ветку штатной сборки",
                    "task": (
                        "Фабрика Planner создаёт сервис для SQL-репозитория, а API и CLI используют общий DATABASE_URL с отдельной Session на действие. "
                        "Переходный storage-параметр, JSON_PATH, файловые классы и backend-флаги отсутствуют в runtime. "
                        "Настройки APP_NAME и COOKIE_SECURE сохраняют свои прежние роли."
                    ),
                    "requirements": [
                        "Runtime-потребители используют SQL до удаления предоставляющих их классов и настроек.",
                        "Сервис с закрытой Session не сохраняется в app.state или между итерациями CLI.",
                        "Маршруты, HTTP-схемы и команды CLI сохраняют прежний договор.",
                    ],
                    "hint": "Мы переиспользуем фабрику Session, но создаём короткую Session отдельно на запрос или команду.",
                    "answer": {
                        "explanation": (
                            "SQL-путь уже подготовлен до занятия. Здесь удаляется старая развилка сборки, а не повторно реализуется CRUD. "
                            "API provider и CLI создают SQL-сервис в своей ресурсной области; предметные правила остаются в PlannerService."
                        ),
                        "steps": [
                            "Убираем импорт JsonStorage и необязательный аргумент storage из сборки Planner.",
                            "Настройки используют DATABASE_URL; APP_NAME и COOKIE_SECURE остаются.",
                            "API и CLI передают SQL-репозиторий сервису и не разделяют живую Session.",
                            "Удаляем JsonTaskRepository, JsonStorage/MemoryStorage и app/storage.py после устранения ссылок.",
                        ],
                        "code": (
                            "def build_service(repository):\n"
                            "    return PlannerService(repository=repository)\n\n"
                            "# API и CLI передают SQL-репозиторий,\n"
                            "# созданный на время запроса или команды."
                        ),
                        "checks": [
                            "Обычная сборка не выбирает backend флагом и не открывает JSON.",
                            "Session не живёт дольше запроса или команды.",
                            "Публичные маршруты, схемы и команды не изменились.",
                        ],
                    },
                },
                {
                    "title": "Перевести тесты на договор SQL Planner",
                    "task": (
                        "Service, API и CLI проверяются с отдельной тестовой SQLite и короткими ресурсами. "
                        "Тесты сохраняют прежние операции и ошибки, а специфические проверки старого JSON относятся к импортёру. "
                        "Результат не зависит от числа вызовов удалённого JsonStorage.save."
                    ),
                    "requirements": [
                        "Проверки CRUD, выборки, поиска, статистики, ошибок и внутренних tags сохраняют прежние гарантии.",
                        "Запись подтверждается чтением после закрытия исходной Session.",
                        "Фикстуры изолированы от рабочей базы и восстанавливают временные API overrides.",
                    ],
                    "hint": "Мы проверяем пользовательский результат через свежий ресурс, а не деталь прежнего адаптера.",
                    "answer": {
                        "explanation": (
                            "Тестовые данные создаются во временной SQLite, а новый ресурс подтверждает сохранение результата. "
                            "Тесты файлового хранилища удаляются или сохраняются только у импортёра, если проверяют поддержку исторического формата."
                        ),
                        "steps": [
                            "Service/API/CLI fixtures создают временную SQLite и закрывают Session после действия.",
                            "Продуктовые тесты проверяют прежние входы, статусы, данные и ошибки.",
                            "Сохранённая задача повторно читается через отдельную Session или новый HTTP-запрос.",
                            "Проверки не считают JsonStorage.save и не используют файловый backend в обычных сервисных сценариях.",
                        ],
                        "code": (
                            "response = client.post(\"/tasks\", json=payload)\n"
                            "assert response.status_code == 201\n"
                            "created = client.get(\"/tasks/1\")\n"
                            "assert created.json()[\"title\"] == payload[\"title\"]"
                        ),
                        "checks": [
                            "Те же публичные результаты подтверждены с SQL fixtures.",
                            "Независимое чтение подтверждает запись вне исходного объекта и Session.",
                            "Старые поля, ошибки и поведение поиска остаются проверенными.",
                        ],
                    },
                },
                {
                    "title": "Проверить runtime без файла и fallback",
                    "task": (
                        "После удаления runtime-пути API и CLI сохраняют прежние операции через SQLite, в том числе после перезапуска. "
                        "Контролируемый отказ подключения не включает JSON или MemoryStorage; рабочая база и архив в проверке не участвуют."
                    ),
                    "requirements": [
                        "Дочерний процесс получает DATABASE_URL до импорта app.api; SQLite-файл расположен под отсутствующим родительским каталогом.",
                        "Запрос через TestClient завершается OperationalError подключения; тест не утверждает конкретный HTTP-статус.",
                        "TrackingSession фиксирует close() после ошибки, контрольный JSON остаётся побайтно неизменным, успешного ответа из JSON или памяти нет.",
                    ],
                    "hint": "Мы направляем проверку на временную базу и запускаем новый процесс без старого объекта сервиса.",
                    "answer": {
                        "explanation": (
                            "Родительский тест задаёт дочернему процессу DATABASE_URL для файла внутри отсутствующего каталога. "
                            "После импорта app.api первый запрос не может открыть SQLite, и TestClient с настройками по умолчанию пробрасывает OperationalError. "
                            "TrackingSession показывает, что get_db вызвал close() при исключении; родитель сравнивает контрольный JSON побайтно. "
                            "Мы проверяем отказ подключения и отсутствие fallback, не задавая новый HTTP-статус."
                        ),
                        "steps": [
                            "Создаём контрольный tasks.json и запоминаем его исходные байты.",
                            "Собираем DATABASE_URL для временного файла, родительский каталог которого отсутствует, и передаём URL через env.",
                            "В дочернем процессе импортируем app.api, подменяем session_factory на фабрику TrackingSession и отправляем GET через TestClient.",
                            "Ожидаем OperationalError, затем проверяем, что единственная созданная Session закрыта.",
                            "В родительском процессе проверяем код завершения и неизменность контрольного JSON.",
                        ],
                        "code": (
                            'import os\n'
                            'import subprocess\n'
                            'import sys\n'
                            'from pathlib import Path\n'
                            'from sqlalchemy.engine import URL\n'
                            '\n'
                            'def test_database_refusal_does_not_use_json(tmp_path):\n'
                            '    project_root = Path(__file__).resolve().parents[1]\n'
                            '    missing_db = tmp_path / "missing" / "planner.sqlite3"\n'
                            '    assert not missing_db.parent.exists()\n'
                            '    control_json = tmp_path / "tasks.json"\n'
                            '    control_json.write_text(\n'
                            '        \'[{"id": 901, "title": "Контроль", "priority": 1, "is_done": false, "tags": []}]\',\n'
                            '        encoding="utf-8",\n'
                            '    )\n'
                            '    original_json = control_json.read_bytes()\n'
                            '\n'
                            '    environment = os.environ.copy()\n'
                            '    environment["DATABASE_URL"] = URL.create(\n'
                            '        "sqlite", database=missing_db.as_posix()\n'
                            '    ).render_as_string(hide_password=False)\n'
                            '    environment["JSON_PATH"] = str(control_json)\n'
                            '    environment["PYTHONPATH"] = os.pathsep.join(\n'
                            '        filter(None, (str(project_root), environment.get("PYTHONPATH")))\n'
                            '    )\n'
                            '\n'
                            "    child_code = r'''\n"
                            'from fastapi.testclient import TestClient\n'
                            'from sqlalchemy.exc import OperationalError\n'
                            'from sqlalchemy.orm import Session, sessionmaker\n'
                            'from app.api import app\n'
                            '\n'
                            'sessions = []\n'
                            '\n'
                            'class TrackingSession(Session):\n'
                            '    def __init__(self, *args, **kwargs):\n'
                            '        super().__init__(*args, **kwargs)\n'
                            '        self.was_closed = False\n'
                            '        sessions.append(self)\n'
                            '\n'
                            '    def close(self):\n'
                            '        self.was_closed = True\n'
                            '        super().close()\n'
                            '\n'
                            'app.state.session_factory = sessionmaker(\n'
                            '    bind=app.state.engine, class_=TrackingSession\n'
                            ')\n'
                            'with TestClient(app) as client:\n'
                            '    try:\n'
                            '        client.get("/tasks")\n'
                            '    except OperationalError:\n'
                            '        pass\n'
                            '    else:\n'
                            '        raise AssertionError("SQLite connection unexpectedly succeeded")\n'
                            '\n'
                            'assert len(sessions) == 1\n'
                            'assert sessions[0].was_closed\n'
                            "'''\n"
                            '    result = subprocess.run(\n'
                            '        [sys.executable, "-c", child_code],\n'
                            '        cwd=tmp_path,\n'
                            '        env=environment,\n'
                            '        capture_output=True,\n'
                            '        text=True,\n'
                            '        timeout=15,\n'
                            '    )\n'
                            '    assert result.returncode == 0, result.stderr\n'
                            '    assert not missing_db.parent.exists()\n'
                            '    assert control_json.read_bytes() == original_json'
                        ),
                        "checks": [
                            "Дочерний процесс импортирует приложение после передачи тестового окружения и завершается только после ожидаемого отказа.",
                            "Закрытие Session наблюдается внутри того же процесса, где произошёл отказ.",
                            "Родитель подтверждает, что контрольный JSON побайтно совпадает с исходным; HTTP-статус не проверяется.",
                        ],
                    },
                },
                {
                    "title": "Оставить импортёр и архив вне runtime",
                    "task": (
                        "Явный импортёр переносит копию старого формата в пустую тестовую SQLite независимо от app/storage.py. "
                        "Он сохраняет значения и id, а повторный запуск на непустой цели безопасно отклоняется. "
                        "Runtime использует DATABASE_URL, архивная копия не участвует в сборке Planner."
                    ),
                    "requirements": [
                        "Источник и цель задаются явно, а проверка полного снимка предшествует записи.",
                        "Сохраняются id, title, priority, is_done и tags; title_normalized вычисляется прежним способом.",
                        "В примерах запуска нет JSON как штатного хранилища; полный README не переписывается.",
                    ],
                    "hint": "Мы отделяем разовый маршрут source → importer → target от runtime-маршрута API/CLI → service → SQL.",
                    "answer": {
                        "explanation": (
                            "Импортёр сохраняет возможность безопасно перенести старый снимок, но не становится частью штатной сборки. "
                            "Он явно читает источник, проверяет все записи и переносит их в пустую цель одной транзакцией."
                        ),
                        "steps": [
                            "Оставляем import_tasks.py и проверки старого формата рядом с ним.",
                            "Переносим тестовую копию в пустую тестовую базу и сверяем все данные новой Session.",
                            "Повторяем запуск против непустой цели и убеждаемся, что её прежнее содержимое осталось.",
                            "В затронутых примерах оставляем DATABASE_URL, удаляя только устаревшие JSON_PATH и файловую сборку.",
                            "Финальный поиск не находит runtime-ссылок; importer работает без app/storage.py.",
                        ],
                        "code": (
                            "python -m app.DBase.import_tasks --source tasks-copy.json "
                            "--database-url sqlite:///./tasks-import-test.db"
                        ),
                        "checks": [
                            "Импорт сохраняет прежние значения и проверяется независимым чтением.",
                            "Непустая цель не очищается и не перезаписывается.",
                            "В штатном runtime остаётся один SQL-источник, а импорт запускается явно.",
                        ],
                    },
                },
            ],
            "result": "Planner работает через SQLite без старого файлового backend и fallback; прежнее поведение и отдельный импорт старого формата сохранены.",
        }
    ]
}

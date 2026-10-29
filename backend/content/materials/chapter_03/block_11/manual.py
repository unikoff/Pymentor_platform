"""Учебная практика блока. Редактируйте задания здесь."""

from __future__ import annotations

from typing import Any


MANUAL_PRACTICE: dict[int | str, list[dict[str, Any]]] = {
    51: [
        {
            "title": "POST сохраняет title без крайних пробелов",
            "task": (
                "После подготовки входной модели в `app/api.py` есть `TaskCreate` с полями `title` и `priority`. "
                "`POST /tasks` передаёт данные в `PlannerService.add_task` и возвращает 201. Добавьте безопасную "
                "очистку только `TaskCreate.title`. Если валидатор уже есть, проверьте его по шагу 2, не дублируя. "
                "Маршрут, сервис и существующие задачи оставьте без изменений."
            ),
            "tasks": [
                {
                    "title": "POST вызывает прежний PlannerService",
                    "task": (
                        "До изменения откройте `app/api.py`. Найдите `TaskCreate` и `@app.post(\"/tasks\")`. "
                        "Проследите путь от `payload` до `add_task`. Опора: раздел 01. Код и данные не меняйте."
                    ),
                    "requirements": [
                        "В `TaskCreate` обязательны `title: str` и `priority: int`.",
                        "FastAPI проверяет тело запроса до запуска маршрута.",
                        "Маршрут вызывает `add_task` и возвращает 201 после успешного создания.",
                    ],
                    "result": (
                        "В `app/api.py` прослежен путь `TaskCreate` → POST → `add_task`; код и данные не изменены."
                    ),
                    "hint": (
                        "Сначала найдите `class TaskCreate`, затем POST. В маршруте проследите `payload` до `add_task`."
                    ),
                    "answer": {
                        "explanation": (
                            "FastAPI проверяет `TaskCreate` до запуска маршрута. Маршрут передаёт данные прежнему "
                            "PlannerService, а после создания возвращает 201."
                        ),
                        "steps": [
                            "Откройте `app/api.py`.",
                            "Проверьте поля `TaskCreate`: `title` и `priority`.",
                            "Найдите `@app.post(\"/tasks\")` и параметр `payload`.",
                            "Проследите `payload` до `add_task` и ответа 201.",
                        ],
                        "checks": [
                            "Найдена одна существующая схема, а новый endpoint не создавался.",
                            "Порядок body-проверки и вызова сервиса объяснён по коду.",
                        ],
                    },
                },
                {
                    "title": "TaskCreate очищает строку до проверки типа",
                    "task": (
                        "В `app/api.py` найдите эту схему и добавьте валидатор только для `title`. Если он уже есть, "
                        "проверьте его по требованиям и не создавайте второй. Заготовка: "
                        "```python\nclass TaskCreate(BaseModel):\n    title: str\n    priority: int\n```\n"
                        "Для строки удалите пробелы по краям. Другое значение верните без изменений. Опора: разделы 03–06."
                    ),
                    "requirements": [
                        "Импортируйте `field_validator` из Pydantic.",
                        "Свяжите валидатор только с `title` и задайте `mode=\"before\"`.",
                        "Объявите `@classmethod` с параметром `value: object`.",
                        "Для строки верните `value.strip()`, для другого типа верните `value`.",
                        "Не меняйте `priority`, POST, сервис, Task или JSON. Не добавляйте `Field`.",
                    ],
                    "result": (
                        "До маршрута `TaskCreate` очищает краевые пробелы в строковом `title`; другой тип проверяет Pydantic."
                    ),
                    "hint": (
                        "См. разделы 03–05: сначала проверьте `isinstance(value, str)`, затем вызовите `strip()`. "
                        "Для другого типа верните исходный `value`."
                    ),
                    "answer": {
                        "explanation": (
                            "`before` получает значение до проверки типа. Проверка `isinstance` защищает вызов `strip`; "
                            "возврат числа оставляет Pydantic обычную проверку поля."
                        ),
                        "steps": [
                            "Добавьте `field_validator` в импорт из Pydantic.",
                            "Над методом укажите `@field_validator(\"title\", mode=\"before\")` и `@classmethod`.",
                            "Принимайте `value: object`.",
                            "Для строки верните `value.strip()`, иначе верните `value`.",
                            "Оставьте `priority` и остальной маршрут без изменений.",
                        ],
                        "code": '''from pydantic import BaseModel, field_validator


class TaskCreate(BaseModel):
    title: str
    priority: int

    @field_validator("title", mode="before")
    @classmethod
    def clean_title(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value''',
                        "checks": [
                            "`TaskCreate(title=\"  План  \", priority=3).title` равно `\"План\"`.",
                            "Нестрочное значение не вызывает `AttributeError` внутри пользовательского валидатора.",
                            "У схемы по-прежнему только обязательные `title` и `priority`.",
                        ],
                    },
                },
                {
                    "title": "POST сохраняет очищенное название",
                    "task": (
                        "Сначала проверьте `TaskCreate` командой ниже из корня Planner и того же Python-окружения, что и API. "
                        "Затем в HTTP-клиенте отправьте на `POST /tasks` тело "
                        "`{\"title\": \"  План  на неделю  \", \"priority\": 3}`. Возьмите `id` из ответа и "
                        "прочитайте задачу через `GET /tasks/{id}`. Опора: разделы 02 и 06, подготовленная входная модель.\n"
                        "```powershell\npython -c \"from app.api import TaskCreate; print(repr(TaskCreate(title='  План  на неделю  ', priority=3).title))\"\n```"
                    ),
                    "requirements": [
                        "Команда выводит `'План  на неделю'`: края убраны, два внутренних пробела сохранены.",
                        "POST возвращает 201, очищенный `title` и `priority` 3.",
                        "GET по `id` из ответа возвращает ту же задачу.",
                        "До POST запишите текущий список и не удаляйте старые задачи.",
                    ],
                    "result": (
                        "`TaskCreate`, POST и GET показывают `План  на неделю` и `priority` 3."
                    ),
                    "hint": (
                        "`repr` показывает пробелы в выводе. Сравните это значение с ответом POST и GET по тому же `id`."
                    ),
                    "answer": {
                        "explanation": (
                            "Схема очищает `title` до запуска маршрута. POST продолжает вызывать прежний сервис; GET по "
                            "выданному `id` подтверждает, что значение сохранилось."
                        ),
                        "steps": [
                            "Запустите команду из корня проекта в окружении API.",
                            "Проверьте вывод: `'План  на неделю'`.",
                            "Сохраните текущий список через GET `/tasks`.",
                            "Отправьте JSON через POST и запишите статус 201 и `id`.",
                            "Выполните GET по этому `id`; сравните `title` и `priority`.",
                            "Убедитесь, что прежние задачи остались в списке.",
                        ],
                        "code": (
                            "POST /tasks\n"
                            '{"title": "  План  на неделю  ", "priority": 3}\n'
                            "Ожидаемый title в ответе и GET по id:\n"
                            '"План  на неделю"'
                        ),
                        "checks": [
                            "Прямая схема и HTTP-ответ показывают одинаковое очищенное значение.",
                            "Ответ содержит серверный `id`, а GET по нему возвращает ту же задачу.",
                            "Внутренние пробелы сохранились, остальные записи не изменились.",
                        ],
                    },
                },
                {
                    "title": "Два отказа не добавляют задач",
                    "task": (
                        "Сохраните результат GET `/tasks`. Затем отправьте на `POST /tasks` два тела: "
                        "`{\"title\": 42, \"priority\": 3}` и `{\"title\": \"   \", \"priority\": 3}`. "
                        "После каждого запроса снова получите список и сравните с исходным. Опора: разделы 01 и 05–06."
                    ),
                    "requirements": [
                        "Число `42` получает 422 от Pydantic до маршрута; `AttributeError` нет.",
                        "Строка из пробелов очищается до `\"\"`, затем прежнее правило Task возвращает 422 внутри маршрута.",
                        "После каждого отказа список совпадает с исходным: задача не добавлена.",
                        "Объясните, что два ответа 422 возникают на разных этапах.",
                    ],
                    "result": (
                        "Оба запроса возвращают 422 по разным причинам; список задач не меняется."
                    ),
                    "hint": (
                        "Число отклоняется при проверке типа до маршрута. Пустая после `strip()` строка проходит проверку `str` "
                        "и доходит до правила Task. Сравните список после каждого запроса."
                    ),
                    "answer": {
                        "explanation": (
                            "Валидатор возвращает число без изменений, и Pydantic отклоняет его до маршрута. Пробельная "
                            "строка очищается до пустой строки, проходит проверку типа и отклоняется прежним правилом Task "
                            "внутри `add_task`. Поэтому оба ответа 422 означают разные ошибки."
                        ),
                        "steps": [
                            "Отправьте `{'title': 42, 'priority': 3}`. Ожидайте 422 без `AttributeError`.",
                            "Получите GET `/tasks` и сравните список с исходным.",
                            "Отправьте `{'title': '   ', 'priority': 3}`. Ожидайте доменный 422.",
                            "Снова получите GET `/tasks`; список не изменился.",
                        ],
                        "code": (
                            "POST /tasks, два независимых body:\n"
                            "{\"title\": 42, \"priority\": 3}\n"
                            "{\"title\": \"   \", \"priority\": 3}\n"
                            "После каждого запроса: GET /tasks"
                        ),
                        "checks": [
                            "Неверный тип останавливается до вызова PlannerService.",
                            "Пустое после очистки название отклоняется прежней доменной проверкой.",
                            "До и после каждого ошибочного запроса в списке одинаковые задачи.",
                        ],
                    },
                },
            ],
            "result": (
                "`TaskCreate` очищает только строковый `title`, сохраняя внутренние пробелы и прежний POST. Успешная "
                "задача читается по фактическому `id`; неверный тип и доменный отказ не добавляют записей."
            ),
        }
    ],
    52: [
        {
            "title": "Схемы Planner разделяют вход и ответ",
            "task": (
                "Сначала проверь текущий checkout: найди фактические файлы и `TaskCreate`, затем запусти приложение и "
                "подтверди реальными запросами GET/POST, JSON-телом, статусами и общей записью JSON, что проектная опора "
                "действительно готова. План и исторический commit сами по себе этого не доказывают. Если нужных файлов или "
                "рабочих маршрутов нет, восстанови/приостанови проектную часть и запиши, чего именно не хватает; не переходи "
                "к изменениям схем, пока A не подтверждена.\n\n"
                "После проверки перенеси существующую `TaskCreate` в `app/schemas.py`, добавь схему ответа `TaskRead` и "
                "укажи `response_model` у трёх существующих маршрутов. Сохрани правила входа и параметры GET; проверь "
                "статусы 200/201, 404 и различие публичного ответа и полной записи JSON."
            ),
            "tasks": [
                {
                    "title": "TaskCreate сохраняет прежние правила",
                    "task": (
                        "Сначала на текущем checkout найди файлы приложения и фактическое объявление `TaskCreate`. "
                        "Запусти проект и проверь реальные GET и POST: тело запроса и JSON-ответ, статусы, а также запись "
                        "созданной задачи в том же JSON, которым пользуется проект. Если файлы, маршруты или сохранение "
                        "не подтверждаются, приостанови проектные изменения и запиши недостающую опору. Только после этого "
                        "перенеси существующую `TaskCreate` в `app/schemas.py`, сохранив правила без изменений."
                    ),
                    "requirements": [
                        "До изменений проверены текущие файлы, работающие GET/POST, реальные JSON-тело и ответы, а также сохранённая запись.",
                        "Если A отсутствует, проектная часть остановлена, а конкретно недостающие файлы/маршруты/сохранение зафиксированы; история не выдана за наблюдение.",
                        "После подтверждения A единственное объявление `TaskCreate` находится в `app/schemas.py`; `api.py` импортирует эту модель.",
                        "`strip_title` очищает строковый `title` до проверки чистой длины от 1 до 120 символов; `priority` ограничен числами от 1 до 5.",
                        "POST передаёт проверенные поля прежнему `PlannerService`; доменная `Task` и формат JSON не меняются."
                    ],
                    "hint": "Сначала сверим текущие файлы и выполним настоящий POST с последующей проверкой GET и JSON. Лишь если A подтверждена, переносим найденный класс и проверяем его импорт; при отсутствии A фиксируем пробел и останавливаем проектную часть.",
                    "answer": {
                        "explanation": (
                            "Фактический checkout и запросы: источник подтверждения A. Если она есть, меняется расположение "
                            "найденной модели и её импорт, но не поля и правила; создание по-прежнему выполняет сервис. "
                            "Если A нет, изменения схем откладываются до восстановления недостающей опоры."
                        ),
                        "steps": [
                            "Найди текущие модули приложения и фактическое объявление `TaskCreate`.",
                            "Проверь успешные реальные GET/POST, JSON-тело и ответ, статус и сохранение POST в общем JSON.",
                            "Если проверка подтверждает A, перенеси существующий класс и необходимые импорты в `app/schemas.py`, удалив прежнее определение.",
                            "Если A не подтверждена, запиши конкретный пробел и останови проектную часть; не подменяй наблюдение историей.",
                            "После переноса повтори проверку импорта и POST."
                        ],
                        "code": '''from pydantic import BaseModel, Field, field_validator


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: int = Field(ge=1, le=5)

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value


# В app/api.py:
from app.schemas import TaskCreate''',
                        "checks": [
                            "`TaskCreate` объявлена только в `app/schemas.py`, а POST импортирует её оттуда.",
                            "Валидатор и границы `Field` совпадают с исходной моделью.",
                            "`schemas.py` не импортирует FastAPI, `PlannerService` или `JsonStorage`."
                        ],
                    },
                    "result": "A подтверждена текущими файлами и реальными GET/POST/JSON: `TaskCreate` перенесена без изменения правил; либо проектная часть остановлена с записью конкретного отсутствующего подтверждения.",
                },
                {
                    "title": "TaskRead описывает четыре поля ответа",
                    "task": (
                        "В разделе 03 рассмотрели отдельную схему для публичного ответа. Создадим в `app/schemas.py` "
                        "модель `TaskRead` для одной задачи с полями `id`, `title`, `priority` и `is_done`. Поле `tags` "
                        "останется в доменной `Task` и сохранённой JSON-записи."
                    ),
                    "requirements": [
                        "`TaskRead` содержит ровно четыре поля: `id: int`, `title: str`, `priority: int`, `is_done: bool`.",
                        "`TaskRead` не содержит `tags`, необязательный `id`, значения по умолчанию или поля обновления.",
                        "Сервис, доменная `Task` и JSON-хранилище продолжают использовать прежние модели."
                    ],
                    "hint": "Сверим ответ с диаграммой из раздела 01: серверные `id` и `is_done` видны клиенту, внутренний `tags` остаётся в записи.",
                    "answer": {
                        "explanation": (
                            "`TaskRead` описывает ответ API. Поле `tags` остаётся в полной записи, даже если клиент его не получает."
                        ),
                        "steps": [
                            "Создаём отдельный класс `TaskRead` на основе `BaseModel`.",
                            "Добавляем четыре поля с типами из доменной модели.",
                            "Оставляем сервису прежнюю `Task` из `models.py`."
                        ],
                        "code": '''class TaskRead(BaseModel):
    id: int
    title: str
    priority: int
    is_done: bool''',
                        "checks": [
                            "Вход и ответ описаны отдельными схемами.",
                            "В `TaskRead` есть четыре публичных поля и нет `tags`.",
                            "Доменная модель и JSON-сериализатор не изменены."
                        ]
                    },
                    "result": "`TaskRead` находится в `app/schemas.py`; полная `Task` по-прежнему содержит `tags`."
                },
                {
                    "title": "Три маршрута задают форму ответа",
                    "task": (
                        "В разделах 04–05 разобрали объявления маршрутов и схемы успешных ответов. Добавим `response_model` "
                        "к существующим GET `/tasks`, GET `/tasks/{task_id}` и POST `/tasks`: для списка зададим "
                        "`list[TaskRead]`, для одной задачи: `TaskRead`. POST продолжит принимать `TaskCreate` и вызывать "
                        "прежний сервис; параметры списка, ответ 404 и статус 201 сохранятся."
                    ),
                    "requirements": [
                        "GET `/tasks` использует `response_model=list[TaskRead]`; GET `/tasks/{task_id}` и POST используют `response_model=TaskRead`.",
                        "POST принимает `TaskCreate`, вызывает прежний `PlannerService` и возвращает статус 201.",
                        "GET сохраняет параметры списка и статус 200; неизвестный `id` по-прежнему даёт 404.",
                        "Новые маршруты, `TaskUpdate`, прямое чтение JSON и вторая коллекция не добавляются."
                    ],
                    "hint": "Сверим две части маршрута: `payload: TaskCreate` описывает вход, а `response_model` в декораторе описывает успешный ответ.",
                    "answer": {
                        "explanation": (
                            "FastAPI использует `response_model` для успешного ответа и показывает эту форму в OpenAPI. "
                            "Создание всё так же выполняет `PlannerService`; обработка ошибок остаётся у маршрутов."
                        ),
                        "steps": [
                            "Импортируем `TaskCreate` и `TaskRead` из `app.schemas`.",
                            "Для GET списка задаём `list[TaskRead]` и сохраняем его параметры.",
                            "Для GET `/tasks/{task_id}` задаём `TaskRead` и сохраняем обработку 404.",
                            "Для POST задаём `TaskRead`, сохраняя входную модель, вызов сервиса и статус 201."
                        ],
                        "code": '''from fastapi import HTTPException, Query, status

from app.errors import TaskNotFoundError
from app.schemas import TaskCreate, TaskRead


@app.get("/tasks", response_model=list[TaskRead])
def read_tasks(
    is_done: bool | None = None,
    sort_desc: bool = False,
    limit: int = Query(default=10, ge=1, le=50),
):
    tasks = app.state.planner.select_tasks(
        is_done=is_done,
        sort_desc=sort_desc,
        limit=limit,
    )
    return [
        {
            "id": task.id,
            "title": task.title,
            "priority": task.priority,
            "is_done": task.is_done,
        }
        for task in tasks
    ]


@app.get("/tasks/{task_id}", response_model=TaskRead)
def read_task(task_id: int):
    try:
        task = app.state.planner.get_task(task_id)
    except TaskNotFoundError as error:
        raise HTTPException(status_code=404, detail="Task not found") from error
    return {
        "id": task.id,
        "title": task.title,
        "priority": task.priority,
        "is_done": task.is_done,
    }


@app.post(
    "/tasks",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
)
def create_task(payload: TaskCreate):
    try:
        task = app.state.planner.add_task(
            payload.title,
            priority=payload.priority,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error
    return {
        "id": task.id,
        "title": task.title,
        "priority": task.priority,
        "is_done": task.is_done,
    }''',
                        "checks": [
                            "OpenAPI показывает `TaskCreate` для входа POST и `TaskRead` для его успешного ответа.",
                            "GET списка описан как `list[TaskRead]`, GET `/tasks/{task_id}` как `TaskRead`.",
                            "POST возвращает 201; параметры списка и ответ 404 сохранены."
                        ]
                    },
                    "result": "Три маршрута объявляют `response_model`; GET сохраняют статус 200, параметры списка и ответ 404, POST сохраняет статус 201."
                },
                {
                    "title": "Сверяем OpenAPI, ответы и сохранённую задачу",
                    "task": (
                        "В разделе 06 разобрали проверку схем и реальных ответов. Открой `/docs` и сравни входную и выходные "
                        "схемы, затем выполни POST, GET списка и GET `/tasks/{task_id}`, подставив в последний запрос "
                        "`id` из ответа POST. Проверь ответ 404 для неизвестного `id`. Сопоставь четыре поля API с записью "
                        "той же задачи в JSON или CLI и убедись, что там по-прежнему есть `tags`."
                    ),
                    "requirements": [
                        "POST возвращает статус 201 и поля `id`, `title`, `priority`, `is_done`.",
                        "GET списка и GET `/tasks/{task_id}` по `id` из ответа возвращают публичную форму; неизвестный `id` даёт 404.",
                        "OpenAPI показывает `TaskCreate` на входе, `TaskRead` у item и POST, список `TaskRead` у GET.",
                        "В JSON или CLI полная запись сохраняет `tags`, хотя API его не публикует."
                    ],
                    "hint": "Сначала сверим схемы в `/docs`. Затем проследим одну задачу по её настоящему `id` через API и JSON или CLI.",
                    "answer": {
                        "explanation": (
                            "`/docs` показывает объявленные схемы, а реальные запросы подтверждают ответы. Полная запись "
                            "в JSON или CLI отдельно показывает, что `tags` сохранился. В примере `id: 7` условный; "
                            "для GET берём фактический `id` из ответа POST."
                        ),
                        "steps": [
                            "В `/docs` сверяем входной `TaskCreate` и успешные ответы трёх маршрутов.",
                            "Отправляем допустимый POST и записываем статус 201 и фактический `id`.",
                            "Проверяем четыре поля, GET списка и GET `/tasks/{task_id}` по этому `id`.",
                            "Проверяем ответ 404 для отсутствующего `id`.",
                            "Находим ту же задачу в JSON или CLI и проверяем поле `tags`."
                        ],
                        "code": '''# В /docs отправляем запрос:
POST /tasks
{
  "title": "Проверить схемы",
  "priority": 4
}

Ожидаем:
201 Created
{
  "id": 7,
  "title": "Проверить схемы",
  "priority": 4,
  "is_done": false
}

GET /tasks/{id из ответа} возвращает те же четыре поля.
В JSON или CLI полная запись этой Task дополнительно содержит "tags": [].''',
                        "checks": [
                            "Сверены OpenAPI и реальные ответы маршрутов.",
                            "POST сохраняет 201, список сохраняет параметры, отсутствующая задача даёт 404.",
                            "HTTP возвращает четыре поля; JSON или CLI показывает `tags`."
                        ]
                    },
                    "result": "Один POST возвращает 201 и четыре поля; GET подтверждает ответ, а JSON или CLI показывает ту же полную задачу с `tags`."
                }
            ],
            "result": (
                "TaskCreate и TaskRead находятся в app/schemas.py. Три маршрута объявляют response_model, POST сохраняет статус 201, "
                "GET сохраняет статус 200, query-параметры и 404; доменная Task, JSON и CLI продолжают хранить прежнюю запись с tags."
            )
        }
    ],
    53: [
        {
            "title": "Полная замена одной Task в сервисе",
            "task": (
                "Сначала проверь фактический checkout после проверки сохранения HTTP-схем: состояние сохранения, `PlannerService`, `JsonStorage` "
                "и наличие `replace_task`. План и старая карта работы с replace_task не доказывают, что именно сейчас есть в проекте. "
                "Если метод существует, не создавай его заново: сверь контракт и адресно подтверди только нужные инварианты. "
                "Если метода нет, добавь ровно один `replace_task` в существующий `PlannerService` и проверь его напрямую "
                "на `JsonStorage` внутри `tmp_path`. Не повторяй CRUD или HTTP; PUT подключается позже."
            ),
            "tasks": [
                {
                    "title": "Проверь или добавь replace_task для существующей Task",
                    "task": (
                        "После проверки checkout найди `PlannerService`, `load`, `_find_task`, `JsonStorage` и все имеющиеся "
                        "объявления `replace_task`. Если метод уже есть (в том числе после прежнего работы с replace_task), не создавай "
                        "второй: сопоставь его контракту и адресно проверь неподтверждённые инварианты. Если его нет, добавь "
                        "единственный метод `replace_task(task_id, *, title, priority, is_done)` в существующий класс; "
                        "он заменяет найденную Task и возвращает новую."
                    ),
                    "requirements": [
                        "До изменений проверены сохранение данных после переноса схем, состояние PlannerService и наличие/отсутствие метода; старая история не выдана за состояние checkout.",
                        "Если метод отсутствует, добавлен ровно один `replace_task` в имеющийся класс; повторные CRUD- и HTTP-операции не создаются.",
                        "Контракт проверен: новые title, priority и is_done, прежние id и tags, та же позиция и неизменный сосед; tags не разделяются с исходным списком.",
                        "Прямые проверки через `JsonStorage(tmp_path)` подтверждают возврат и сохранение после чтения тем же путём новым сервисом.",
                        "Адресно проверены отказные случаи: неизвестный id даёт TaskNotFoundError, недопустимая Task вызывает ValueError; состояние не меняется, путь не доходит до save.",
                        "Если метод уже существует и контракт соблюдён, повторная реализация не требуется; проверяются только неподтверждённые инварианты."
                    ],
                    "hint": "Сначала найди в текущем checkout все определения метода. При существующем методе сравни контракт и выбери неподтверждённую проверку; при отсутствии сначала найди load и _find_task, затем работай с новой Task отдельно от списка.",
                    "answer": {
                        "explanation": (
                            "Сначала установи по checkout, требуется ли реализация. Если replace_task уже есть, проверь его "
                            "соответствие контракту без повторного создания. Если его нет, найди Task через _find_task() "
                            "и собери замену через конструктор Task: так новые значения проверяются до изменения списка. "
                            "Копия tags сохраняет метки отдельно от исходного списка."
                        ),
                        "steps": [
                        "Проверь, подтверждён ли вход после проверки сохранения, и найди все определения replace_task в текущем сервисе.",
                            "Если метод уже есть, сверь контракт и адресно проверь сохранение, id/tags, соседа и нужные отказные случаи.",
                            "Если метода нет, загрузи список и найди Task через self._find_task(tasks, task_id).",
                            "Найди её позицию; создай Task с прежним id, новыми полями и current.tags.copy().",
                            "После успешной проверки замени только эту позицию, один раз сохрани список и верни новую Task.",
                            "Неизвестный id и ValueError должны завершаться до изменения списка и save."
                        ],
                        "code": '''def replace_task(self, task_id, *, title, priority, is_done):
    tasks = self.storage.load()
    current = self._find_task(tasks, task_id)
    index = tasks.index(current)
    updated = Task(
        id=current.id,
        title=title,
        priority=priority,
        is_done=is_done,
        tags=current.tags.copy(),
    )
    tasks[index] = updated
    self.storage.save(tasks)
    return updated''',
                        "checks": [
                            "Существует только одна реализация; если она была в checkout, повторно её не создавали.",
                            "У результата прежние id и tags; меняется только найденная позиция, сосед сохранён.",
                            "Успешное сохранение подтверждено повторным чтением того же временного JSON новым сервисом.",
                            "Отказные случаи проверены адресно и завершаются до save."
                        ]
                    },
                    "result": (
                        "Если replace_task отсутствовал, добавлен один метод; если существовал, повторно не создавался. "
                        "Контракт и выбранные invariants подтверждены прямыми проверками на временном JSON."
                    )
                },
                {
                    "title": "Проверь успешное сохранение замены",
                    "task": (
                        "На `JsonStorage(tmp_path / \"tasks.json\")` проверь успешный контракт существующего или добавленного "
                        "метода. Сохрани две Task с id 4 и 11, замени задачу 11 и прочитай тот же файл новым PlannerService. "
                        "Добавляй только отсутствующую адресную проверку в имеющийся набор; не повторяй уже подтверждённые проверки."
                    ),
                    "requirements": [
                        "Если успешное сохранение ещё не подтверждено, используй две Task с id 4 и id 11 и разными tags.",
                        "Для id 11 задай title `Проверить сохранение`, priority 5 и is_done=True.",
                        "Возвращённая Task сохраняет id 11 и прежние tags.",
                        "Новый сервис читает из того же файла обе Task: задача 4 не меняется, лишней записи нет."
                    ],
                    "hint": "Сначала проверь ответ replace_task(). Затем прочитай тот же файл новым PlannerService.",
                    "answer": {
                        "explanation": (
                            "tmp_path даёт тесту отдельный файл. Сравни ответ метода, затем перечитай полный список новым сервисом. "
                            "Так проверяются сохранение Task и неизменность соседа."
                        ),
                        "steps": [
                            "Используй отдельный JsonStorage на tmp_path / tasks.json и две Task с разными id и tags.",
                            "Замени поля задачи с id 11.",
                            "Сравни результат с ожидаемой Task: проверь поля, id и tags.",
                            "Создай сервис над тем же путём и сравни обе записи."
                        ],
                        "code": '''from app.models import Task
from app.services import PlannerService
from app.storage import JsonStorage


def test_replace_task_persists_full_task_for_new_service(tmp_path):
    path = tmp_path / "tasks.json"
    storage = JsonStorage(path)
    original = [
        Task(id=4, title="Проверить API", priority=2, tags=["api"]),
        Task(id=11, title="Прочитать JSON", priority=3, tags=["storage", "review"]),
    ]
    storage.save(original)

    service = PlannerService(storage)
    updated = service.replace_task(
        11,
        title="Проверить сохранение",
        priority=5,
        is_done=True,
    )

    expected = Task(
        id=11,
        title="Проверить сохранение",
        priority=5,
        is_done=True,
        tags=["storage", "review"],
    )
    assert updated == expected

    restored = PlannerService(JsonStorage(path)).list_tasks()
    assert restored == [original[0], expected]''',
                        "checks": [
                            "Ответ содержит новые поля, прежние id и tags.",
                            "Новый сервис читает замену из того же файла.",
                            "Задача 4 и порядок записей сохранены."
                        ]
                    },
                    "result": (
                        "Новый сервис читает задачу 11 с title `Проверить сохранение`, priority=5, is_done=True и прежними id/tags. Задача 4 не меняется."
                    )
                },
                {
                    "title": "Подтверди отказные случаи без изменения данных",
                    "task": (
                        "В отдельном `tmp_path` адресно проверь только ещё не подтверждённые отказные случаи. "
                        "Сохрани Task: id 11, title `Прочитать JSON`, priority 3, tags `keep`. "
                        "Проверь два отказа: id 404 и priority 0. После них прочитай тот же файл новым сервисом."
                    ),
                    "requirements": [
                        "До каждого отказного сценария имеется исходное состояние Task с id 11.",
                        "Для отсутствующего id 404 ожидай TaskNotFoundError.",
                        "Для id 11 с priority 0 ожидай ValueError.",
                        "Новый сервис читает исходную Task без изменений и лишних записей."
                    ],
                    "hint": "Сохрани исходный список. После двух ошибок перечитай тот же файл новым сервисом.",
                    "answer": {
                        "explanation": (
                            "TaskNotFoundError означает, что id нет в списке. ValueError означает, что новая Task не прошла проверку. "
                            "После обеих ошибок файл должен совпасть с исходным."
                        ),
                        "steps": [
                            "Сохрани Task с id 11 во временный JSON и запомни исходный список как before.",
                            "Проверь TaskNotFoundError для id 404.",
                            "Проверь ValueError для priority=0.",
                            "Прочитай тот же файл новым сервисом и сравни список с before.",
                            "По коду метода подтверди, что обе ветки отказа завершаются до вызова save; одного сравнения JSON недостаточно."
                        ],
                        "code": '''import pytest

from app.errors import TaskNotFoundError
from app.models import Task
from app.services import PlannerService
from app.storage import JsonStorage


def test_replace_task_failures_do_not_change_storage(tmp_path):
    path = tmp_path / "tasks.json"
    storage = JsonStorage(path)
    before = [Task(id=11, title="Прочитать JSON", priority=3, tags=["keep"])]
    storage.save(before)
    service = PlannerService(storage)

    with pytest.raises(TaskNotFoundError):
        service.replace_task(
            404,
            title="Не добавлять",
            priority=2,
            is_done=False,
        )

    with pytest.raises(ValueError):
        service.replace_task(
            11,
            title="Не сохранять частично",
            priority=0,
            is_done=True,
        )

    after = PlannerService(JsonStorage(path)).list_tasks()
    assert after == before''',
                        "checks": [
                            "Для id 404 получен TaskNotFoundError; новая запись не добавлена.",
                            "Для priority=0 получен ValueError.",
                            "После ошибок файл содержит исходный список."
                        ]
                    },
                    "result": (
                        "Обе ошибки не меняют JSON. Новый сервис читает исходную Task с прежними полями и tags."
                    )
                }
            ],
            "result": (
                "Текущий replace_task проверен или отсутствовавший метод добавлен ровно один раз. "
                "Прямые адресные проверки подтверждают сохранение, id/tags и соседа, а также отказ без изменения данных."
            )
        }
    ],
    "52.1": [
        {
            "title": "Проверим сохранение после переноса схем",
            "task": (
                "Мы перенесли HTTP-схемы. PlannerService и JsonStorage остались прежними. Сначала проверим "
                "готовый тест сохранения, затем ответы API. Новую операцию оставим для темы полной замены задачи."
            ),
            "tasks": [
                {
                    "title": "Проверим готовый тест сохранения",
                    "task": (
                        "В проекте StudyHub после отдельных проверок Planner откройте готовый тест "
                        "`test_added_task_uses_max_id_and_full_task_survives_new_service` в `tests/test_persistence.py`. "
                        "Он создаёт задачи с id 2 и 7, добавляет новую через "
                        "`add_task()` и читает тот же файл новым PlannerService. Сначала запишите ожидаемый id и "
                        "состав списка из трёх задач, затем запустите тест."
                    ),
                    "requirements": [
                        "Откройте `tests/test_persistence.py` и найдите указанный готовый тест.",
                        "В начале теста есть id 2 с tags=['existing'] и id 7 с is_done=True, tags=['keep'].",
                        "Новая задача получает id 8, is_done=False и tags=[].",
                        "Новый PlannerService читает тот же path. Все поля задач 2, 7 и 8 совпадают с ожидаемыми; старые tags сохранены.",
                        "Запустите тест из корня StudyHub: `python -m pytest tests/test_persistence.py::test_added_task_uses_max_id_and_full_task_survives_new_service`. Копию теста не создавайте."
                    ],
                    "hint": "Сравните максимальный id 7 с числом записей 2. Убедитесь, что второй сервис читает тот же path.",
                    "answer": {
                        "explanation": (
                            "Максимальный id равен 7, поэтому новая задача получает 8. Второй PlannerService "
                            "перечитывает тот же файл; сравнение всех полей подтверждает сохранение новой и соседних задач."
                        ),
                        "steps": [
                            "Из корня StudyHub запустите: `python -m pytest tests/test_persistence.py::test_added_task_uses_max_id_and_full_task_survives_new_service`.",
                            "Сверьте исходные задачи: id 2 и 7, их title, priority и tags.",
                            "Проверьте, что add_task() создал задачу с id 8 и is_done=False.",
                            "Убедитесь, что новый PlannerService использует тот же path и читает все три задачи целиком.",
                            "Сравните старые поля и tags с исходными. Другие проверки persistence уже есть в своих тестах."
                        ],
                        "code": '''# Фрагмент действующего теста в tests/test_persistence.py.
def test_added_task_uses_max_id_and_full_task_survives_new_service(tmp_path):
    from app.models import Task

    path = tmp_path / "tasks.json"
    storage = JsonStorage(path)
    storage.save(
        [
            Task(id=2, title="HTTP", priority=3, tags=["existing"]),
            Task(
                id=7,
                title="JSON",
                priority=4,
                is_done=True,
                tags=["keep"],
            ),
        ]
    )

    first_service = PlannerService(storage)
    created = first_service.add_task("Planner API", priority=5)

    second_service = PlannerService(JsonStorage(path))
    loaded = second_service.list_tasks()

    assert created.id == 8
    assert [
        (task.id, task.title, task.priority, task.is_done, task.tags)
        for task in loaded
    ] == [
        (2, "HTTP", 3, False, ["existing"]),
        (7, "JSON", 4, True, ["keep"]),
        (8, "Planner API", 5, False, []),
    ]''',
                        "checks": [
                            "Новый id равен максимальному id плюс один: 8, а не 3.",
                            "Новый сервис читает JSON по тому же path.",
                            "Поля и tags исходных задач 2 и 7 не изменились."
                        ]
                    },
                    "result": (
                        "Готовый тест подтверждает id 8, is_done=False и сохранение всех полей трёх задач в том же JSON."
                    ),
                },
                {
                    "title": "Проверим POST, GET и общий JSON",
                    "task": (
                        "В существующей Planner collection сохраните исходный список CLI и записи JSON с tags. "
                        "Отправьте два POST: `{\"title\": \"Проверка схемы A\", \"priority\": 4, \"id\": 999, \"is_done\": true}` "
                        "и `{\"title\": \"Проверка схемы B\", \"priority\": 2}`. Если 999 окажется следующим id, замените его "
                        "другим числом. Затем проверьте ответы "
                        "через GET, перезапустите API и найдите обе задачи через CLI. Старые записи не меняйте."
                    ),
                    "requirements": [
                        "CLI в `app/main.py` и API в `app/api.py` используют `build_service()` и один настроенный `data/tasks.json`.",
                        "До запросов сохраните список CLI и полные JSON-записи с tags.",
                        "Оба POST возвращают 201 и поля id, title, priority, is_done. В первом ответе id назначен сервером, а is_done=False.",
                        "Выполните GET по id из каждого ответа. Оба запроса возвращают 200 и четыре поля TaskRead.",
                        "После перезапуска найдите обе задачи через CLI. В JSON у них tags=[], а старые записи и tags не изменились."
                    ],
                    "hint": "Сначала сохраните исходные id и tags. Для GET возьмите id из ответов; старые записи сравните по полному JSON.",
                    "answer": {
                        "explanation": (
                            "API и CLI каждый вызывают build_service(). Функция создаёт PlannerService с "
                            "JsonStorage(DATA_PATH). Объекты разные, но путь один. Сервис "
                            "сохраняет полную Task до ответа; TaskRead показывает только четыре публичных поля. Поэтому "
                            "GET проверяет ответ, а CLI и JSON подтверждают сохранённые данные."
                        ),
                        "code": '''POST /tasks
Content-Type: application/json

{"id": 999, "title": "Проверка схемы A", "priority": 4, "is_done": true}

POST /tasks
Content-Type: application/json

{"title": "Проверка схемы B", "priority": 2}

GET /tasks/{id_из_первого_ответа}
GET /tasks/{id_из_второго_ответа}''',
                        "steps": [
                            "В `app/main.py` найдите DATA_PATH и build_service(). Убедитесь, что API тоже вызывает build_service().",
                            "До запросов сохраните список CLI и копию полных JSON-записей с tags.",
                            "Отправьте первый POST с id=999 и is_done=true. Если 999 совпал со следующим id, замените его.",
                            "Запишите статус и id ответа. Проверьте 201, серверный id, is_done=False и четыре поля TaskRead.",
                            "Отправьте второй POST. По двум фактическим id выполните GET и проверьте статус 200 и четыре поля.",
                            "Перезапустите API, затем из корня проекта запустите CLI командой `python -m app.main`.",
                            "Сравните CLI и JSON с исходным списком: обе новые задачи есть, старые поля и tags сохранены."
                        ],
                        "checks": [
                            "Каждый POST возвращает 201, а каждый GET возвращает 200 с четырьмя полями TaskRead.",
                            "Сервис задаёт новый id и is_done=False, даже если body содержит эти поля.",
                            "После перезапуска API и CLI читают один JSON; старые поля и tags сохранены."
                        ]
                    },
                    "result": (
                        "Оба POST и GET подтверждены. После перезапуска CLI находит новые задачи в том же JSON; старые записи и tags сохранены."
                    ),
                }
            ],
            "result": (
                "Готовый тест подтверждает серверный id и сохранение полной Task. POST и GET подтверждают четыре поля ответа. "
                "CLI и JSON подтверждают общий путь хранения и сохранность старых записей. На эту основу добавится replace_task."
            )
        }
    ],
    "53.1": [
        {
            "title": "Полный PUT обновляет существующую задачу",
            "task": (
                "Начинаем с готового replace_task и работающих GET/POST. Добавьте TaskUpdate, затем PUT-маршрут, "
                "который передаёт сервису title, priority и is_done. В конце проверьте ответ, ошибки и сохранность данных."
            ),
            "tasks": [
                {
                    "title": "TaskUpdate требует три поля",
                    "task": (
                        "В app/schemas.py уже есть TaskCreate и TaskRead. Добавьте TaskUpdate для полного изменения задачи. "
                        "Она содержит title, priority и is_done. Для title и priority используйте те же правила, что в TaskCreate."
                    ),
                    "requirements": [
                        "Все три поля обязательны. title очищается от пробелов по краям и содержит от 1 до 120 символов; priority находится в диапазоне от 1 до 5.",
                        "Неверный тип title даёт ошибку Pydantic, а не AttributeError. Обычное преобразование типов и правила лишних полей не меняются.",
                        "Не меняйте TaskCreate, TaskRead, доменную Task и формат JSON.",
                    ],
                    "hint": "Возьмите из TaskCreate правила для title и priority. В TaskUpdate не задавайте значения по умолчанию.",
                    "answer": {
                        "explanation": (
                            "TaskUpdate описывает тело запроса. FastAPI проверяет его до запуска маршрута, поэтому пропущенное "
                            "поле не дойдёт до replace_task. Валидатор очищает title только если это строка, затем Field "
                            "проверяет её длину. id берётся из адреса, а tags остаётся внутри Task."
                        ),
                        "steps": [
                            "Оставьте TaskCreate и её валидатор без изменений.",
                            "Добавьте в TaskUpdate обязательные title, priority и is_done.",
                            "Для title используйте валидатор mode=before и проверяйте isinstance до strip.",
                            "Задайте title длину 1–120, а priority значение от 1 до 5.",
                        ],
                        "code": '''class TaskUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: int = Field(ge=1, le=5)
    is_done: bool

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value''',
                        "checks": [
                            "Тело со всеми тремя допустимыми полями создаёт TaskUpdate.",
                            "Если убрать любое поле, Pydantic отклоняет тело до вызова сервиса.",
                            "Пробелы в начале и конце title убираются до проверки длины. id и tags не добавляются в схему.",
                        ],
                    },
                    "result": (
                        "TaskUpdate в app/schemas.py требует title, priority и is_done. title очищается и проходит проверку длины, "
                        "priority находится в диапазоне от 1 до 5. Остальные модели не изменены."
                    ),
                },
                {
                    "title": "PUT передаёт полную форму в replace_task",
                    "task": (
                        "После первой карточки TaskUpdate уже есть в app/schemas.py. В app/api.py добавьте "
                        "PUT /tasks/{task_id}. Маршрут берёт Planner из request.app.state.planner и передаёт "
                        "replace_task id из адреса и три значения из TaskUpdate."
                    ),
                    "requirements": [
                        "task_id должен быть положительным: используйте Annotated[int, Path(gt=0)]. Тело принимается как TaskUpdate.",
                        "Вызовите готовый replace_task. Только TaskNotFoundError преобразуется в HTTP 404.",
                        "При успехе маршрут возвращает 200 и TaskRead с полями id, title, priority и is_done.",
                        "Не создавайте Task и не открывайте JSON в маршруте. При неизвестном id новая запись не появляется.",
                    ],
                    "hint": "task_id берётся из адреса. title, priority и is_done берутся из проверенного payload.",
                    "answer": {
                        "explanation": (
                            "FastAPI проверяет адрес и TaskUpdate до запуска маршрута. Маршрут берёт текущий Planner из "
                            "Request и передаёт ему проверенные значения. Helper переводит только TaskNotFoundError в 404; "
                            "ошибка storage остаётся отдельной ошибкой."
                        ),
                        "steps": [
                            "Используйте импорты Request, Path, Annotated, TaskUpdate и TaskRead.",
                            "Добавьте один PUT-маршрут и укажите response_model=TaskRead.",
                            "Возьмите replace_task из request.app.state.planner. Передайте ему id из адреса и поля payload.",
                            "Обработайте TaskNotFoundError знакомым _call_with_task_not_found_as_404.",
                        ],
                        "code": '''@app.put("/tasks/{task_id}", response_model=TaskRead)
def update_task(
    task_id: Annotated[int, Path(gt=0)],
    payload: TaskUpdate,
    request: Request,
):
    return _call_with_task_not_found_as_404(
        request.app.state.planner.replace_task,
        task_id,
        title=payload.title,
        priority=payload.priority,
        is_done=payload.is_done,
    )''',
                        "checks": [
                            "Полное тело для существующего положительного id возвращает 200 и четыре публичных поля.",
                            "Неверный адрес или тело даёт 422 до изменения Task.",
                            "Отсутствующая Task даёт 404 без создания записи. StorageError не превращается в 404.",
                        ],
                    },
                    "result": (
                        "PUT принимает полный TaskUpdate, вызывает replace_task и возвращает TaskRead. Для существующей Task ответ равен 200, "
                        "для отсутствующего положительного id с правильным телом ответ равен 404."
                    ),
                },
                {
                    "title": "PUT сохраняет задачу и не создаёт отсутствующую",
                    "task": (
                        "После первых двух карточек TaskUpdate и PUT уже готовы. Откройте Swagger UI Planner API по адресу /docs "
                        "и отправьте полный запрос существующей Task. Для проверки 404 сначала убедитесь через GET или CLI, "
                        "что выбранный положительный id отсутствует. После запросов сравните данные через GET, CLI и JSON."
                    ),
                    "requirements": [
                        "Полный PUT существующей Task возвращает 200. Через GET и CLI проверьте прежний id и новые title, priority, is_done.",
                        "Неполное или неверное тело даёт 422. Исходная Task и сосед не меняются.",
                        "Правильное тело для отсутствующего положительного id даёт 404. Новая запись не появляется; адрес и тело проверяются отдельно.",
                        "После успеха id, tags и сосед сохраняются в JSON. GET списка и stats продолжают работать.",
                    ],
                    "hint": "Сначала выберите существующую Task для успеха. Затем отдельно проверьте неверное тело и отсутствующий id.",
                    "answer": {
                        "explanation": (
                            "Проверим отдельно ответ и данные. Полный запрос к существующей Task даёт 200 и сохраняет замену. "
                            "Неверное тело даёт 422, а правильный запрос к отсутствующей Task даёт 404. Повторное чтение "
                            "покажет, что отказ не изменил Task или её соседа."
                        ),
                        "steps": [
                            "Через GET или CLI выберите Task для обновления и запишите её исходные поля, tags и данные соседа.",
                            "Отправьте полный PUT. Проверьте ответ 200 и перечитайте Task через GET и CLI.",
                            "Уберите одно поле из тела. Проверьте 422 и убедитесь, что Task и сосед не изменились.",
                            "Отправьте правильное тело на подтверждённо отсутствующий положительный id. Проверьте 404 и отсутствие новой записи.",
                        ],
                        "code": '''PUT /tasks/{фактический_id}
{
  "title": "Проверить полный PUT",
  "priority": 4,
  "is_done": true
}

Успех: 200, response содержит id, title, priority, is_done
Неполный body: 422, состояние Task и соседа не изменилось
Корректный body и отсутствующий положительный id: 404, новая Task не создана''',
                        "checks": [
                            "После ответа 200 новая проверка GET и чтение через CLI показывают ту же Task.",
                            "TaskRead содержит четыре публичных поля. tags проверяется в доменной записи или JSON.",
                            "Ошибки 422 и 404 проверены отдельно. JSON и соседняя запись не изменились.",
                        ],
                    },
                    "result": (
                        "PUT изменил title, priority и is_done существующей Task. Её id и tags, сосед, GET списка и stats сохранены. "
                        "Неполное или неверное тело даёт 422 без изменения данных. Правильное тело для отсутствующего положительного id "
                        "даёт 404 и не создаёт Task."
                    ),
                },
            ],
            "result": (
                "Исходная опора: replace_task и GET/POST уже работают. Итог: PUT заменяет title, priority и is_done "
                "у существующей Task и возвращает 200 с TaskRead. Неверное тело даёт 422, правильный запрос к отсутствующему "
                "положительному id даёт 404 без создания записи. id, tags, сосед, GET, stats и CLI сохранены."
            ),
        }
    ],
    "55.1": [
        {
            "title": "Проведём ручную проверку общего пути API, CLI и JSON",
            "task": (
                "До smoke проверь фактический checkout и результаты подготовки title, схем, сохранения, PUT, PATCH и DELETE: какие версии API, PlannerService, "
                "CLI и общего JSON-хранилища сейчас находятся в проекте, запускается ли приложение и видят ли API и CLI "
                "одно состояние. Не считай прохождение по номеру, старую историю или этот план подтверждением. Если "
                "нужная опора отсутствует, проект не запускается или вместо ожидаемого общего JsonStorage используется "
                "другая конфигурация, сначала восстанови подходящее состояние либо запиши точный недостающий результат; "
                "до этого не выполняй изменяющие запросы. После подтверждения составь и проведи собственную матрицу "
                "восьми endpoint, сравни API, CLI и полный JSON до и после перезапуска, затем удали только созданную "
                "для проверки учебную запись и проверь возврат исходного состояния. Код и тестовый слой не меняй."
            ),
            "tasks": [
                {
                    "title": "Подтвердим вход и снимем исходное состояние",
                    "task": (
                        "На текущем checkout проверь фактические результаты предыдущих шагов, запуск API, доступность "
                        "CLI и настроенный путь общего JsonStorage. Убедись, что `GET /health`, список и статистика "
                        "отвечают, выбранная существующая задача читается одинаково через API, CLI и JSON, а соседняя "
                        "контрольная запись сохранена. Зафиксируй исходную статистику и полные поля обеих записей, "
                        "включая `id` и `tags`. Если любого подтверждения нет, восстанови нужную опору или запиши "
                        "конкретный пробел и остановись до изменяющего smoke."
                    ),
                    "requirements": [
                        "Фактический checkout и имеющиеся результаты подготовки title, схем, сохранения, PUT, PATCH и DELETE проверены; план и старый progress не приняты за доказательство текущего состояния.",
                        "Приложение реально запущено, API и CLI доступны и используют общий настроенный JsonStorage.",
                        "GET health, список, статистика и item проверены на реальном приложении; выбранная Task и сосед совпадают через API, CLI и полный JSON.",
                        "До изменяющих запросов записаны исходная статистика и полные поля цели и соседа, включая id и tags.",
                        "Если A отсутствует, smoke не начат; восстановление или конкретный недостающий результат зафиксированы."
                    ],
                    "hint": (
                        "Сверь не только названия файлов: запусти приложение и проверь один реальный запрос к API и ту же "
                        "запись через CLI и настроенный JSON. Сохрани исходные значения до любого изменения."
                    ),
                    "answer": {
                        "explanation": (
                            "Планы предыдущих занятий описывают ожидаемый вход, но не доказывают, что текущий checkout "
                            "ему соответствует. Smoke безопасен только после подтверждения работающего проекта и общей "
                            "точки хранения; без этой опоры сначала фиксируется пробел."
                        ),
                        "steps": [
                            "Установи, какой учебный checkout и какие модули сейчас используются.",
                            "Подтверди результаты по фактическим файлам и доступным операциям, не по номеру занятия.",
                            "Запусти API и CLI; проверь их общий настроенный JSON-путь.",
                            "Прочитай одну целевую и одну контрольную Task через API, CLI и JSON; запиши исходную статистику и все поля.",
                            "При отсутствующем результате или другой конфигурации хранения восстанови опору либо точно запиши пробел; изменяющий smoke пока не проводи."
                        ],
                        "checks": [
                            "A подтверждается фактическим checkout и реальными чтениями API/CLI/JSON.",
                            "Исходное состояние цели, соседа и статистики сохранено для последующего сравнения.",
                            "При неподтверждённой A нет изменяющих запросов."
                        ]
                    },
                    "result": (
                        "Рабочий вход и общее состояние API/CLI/JSON подтверждены и baseline зафиксирован; либо smoke "
                        "остановлен с записью конкретно отсутствующей опоры."
                    )
                },
                {
                    "title": "Составим и проведём матрицу восьми endpoint",
                    "task": (
                        "Только после подтверждения A составь свою таблицу `метод и путь → вход → ожидаемый статус и тело → "
                        "ожидаемый эффект → где сверить`. Включи все endpoint: `GET /health`, `GET /tasks`, "
                        "`GET /tasks/{task_id}`, `GET /stats`, `POST /tasks`, `PUT /tasks/{task_id}`, "
                        "`PATCH /tasks/{task_id}` и `DELETE /tasks/{task_id}`. Сам выбери безопасный порядок, используй "
                        "фактические id и заранее запиши ожидания. Зафиксируй существующую цель и соседа как baseline, "
                        "а PUT/PATCH/DELETE выполняй на отдельной учебной записи, созданной через POST. Не редактируй JSON вручную."
                    ),
                    "requirements": [
                        "В матрице есть все восемь endpoint и для каждого указаны вход, ожидаемые статус/тело, эффект и источник сверки.",
                        "POST создаёт учебную Task с назначенным сервером id; заведомо неверное тело по реальному правилу даёт 422 и не меняет список, статистику или данные.",
                        "Корректный GET `/tasks/{task_id}` для отсутствующего положительного id даёт 404 и не создаёт запись.",
                        "После POST ответ, новая запись в JSON и CLI подтверждают один фактический серверный id.",
                        "PUT на созданной учебной Task меняет заданные поля, но сохраняет прежние id и полное значение tags; сосед не меняется. Ответ сверяется с JSON и CLI.",
                        "PATCH отдельно проверяет пропуск, null и явный false: первые два сохраняют прежнее значение, false применяется; после каждого запроса ответ сверяется с JSON и CLI, id/tags и baseline-сосед сохранены.",
                        "DELETE удаляет только созданную учебную запись и возвращает пустой 204; тело не разбирается как JSON, повторные GET и DELETE подтверждают отсутствие.",
                        "После каждого отказа проверено отсутствие мутации; API, CLI и полный JSON сопоставлены, новые endpoint и тесты не добавлялись."
                    ],
                    "hint": (
                        "Для каждой строки заранее спроси себя: что именно отправляю, какой статус и ответ ожидаю, "
                        "какие данные должны измениться и каким независимым способом это увижу? Для ошибки сравни "
                        "с baseline; неизвестный дополнительный ключ не считай гарантированным нарушением схемы."
                    ),
                    "answer": {
                        "explanation": (
                            "Матрица связывает HTTP-контракт с наблюдаемым состоянием. Успешный ответ сам по себе "
                            "не доказывает запись, а 422 сам по себе не доказывает отсутствие мутации. Полный JSON "
                            "показывает внутренние tags; CLI и повторный GET позволяют сверить сохранённую Task. "
                            "204 не имеет JSON-тела."
                        ),
                        "steps": [
                            "Для всех восьми маршрутов запиши метод и путь, вход, ожидаемый статус/тело, эффект и независимые источники сверки.",
                            "Сам выбери безопасный порядок; используй фактический id созданной учебной записи и положительный id, которого нет в исходном списке.",
                            "Для каждого отказа сравни состояние с baseline; для PUT и вариантов PATCH: ожидаемые поля, id/tags и контрольного соседа.",
                            "Для DELETE проверь пустое тело и отсутствие записи повторными GET и DELETE; не пытайся читать тело 204 как JSON.",
                            "Сверь ожидаемое и фактическое наблюдение для каждого запроса по API, CLI и полному JSON."
                        ],
                        "checks": [
                            "Покрыты все восемь методов/путей и обязательные случаи 422, item 404, PUT, PATCH и DELETE 204.",
                            "Отказ 422 не изменил данные; PUT сохранил id/tags; PATCH различил пропуск, null и false.",
                            "Удалённая учебная запись отсутствует, а контрольная запись не затронута."
                        ]
                    },
                    "result": (
                        "Ручная матрица выполнена по восьми endpoint; статусы, тела и эффекты проверены на реальных "
                        "данных, отказы не изменили состояние, контрольные инварианты сохранены."
                    )
                },
                {
                    "title": "Сверим сохранение после перезапуска",
                    "task": (
                        "После запросов сравни API, CLI и полный JSON с матрицей. Удали только созданную для smoke "
                        "учебную запись, проверь пустой ответ 204 и отсутствие записи, затем перезапусти приложение. "
                        "После запуска снова сравни список, статистику, целевую и контрольную Task; зафиксируй исходное "
                        "состояние и конкретные расхождения для передачи следующему блоку."
                    ),
                    "requirements": [
                        "После нового запуска API и CLI видят один и тот же сохранённый JSON и согласованную статистику.",
                        "Исходные целевая и соседняя Task сохраняют все поля; созданная для smoke учебная запись удалена.",
                        "Повторный GET и повторный DELETE удалённой записи дают ожидаемое отсутствие; исходное состояние восстановлено.",
                        "Каждое расхождение записано как запрос, ожидаемый и фактический результат; runtime и тестовый слой не менялись."
                    ],
                    "hint": (
                        "Сначала убери только запись, созданную этой проверкой. После нового запуска проверь сохранённое "
                        "состояние независимо через API, CLI и JSON, включая соседа и статистику."
                    ),
                    "answer": {
                        "explanation": (
                            "Перезапуск проверяет, что результат пережил новый процесс, а CLI и API читают общее "
                            "хранилище. Удаление только временной учебной записи возвращает проект к baseline и "
                            "сохраняет пользовательские данные."
                        ),
                        "steps": [
                            "Удали только созданную учебную Task и проверь пустой статус 204.",
                            "Проверь её отсутствие через GET и повторный DELETE.",
                            "Перезапусти приложение и повтори чтение списка и статистики через API и CLI.",
                            "Сравни полный JSON исходных записей и соседа с baseline и запиши все найденные расхождения."
                        ],
                        "checks": [
                            "После перезапуска API, CLI и JSON согласуются.",
                            "Учебная запись удалена, исходные данные и контрольный сосед сохранены.",
                            "Сценарий остался ручным: без TestClient, HTTP-fixtures, новых endpoint и правок приложения."
                        ]
                    },
                    "result": (
                        "После перезапуска API, CLI и JSON согласуются; учебная запись удалена, исходный baseline "
                        "восстановлен, а найденные дефекты записаны для передачи в блок 12."
                    )
                }
            ],
            "result": (
                "Вход A подтверждён или smoke остановлен с точным пробелом. При готовой опоре вручную проверены все "
                "восемь endpoint, отказ 422 без мутации, item 404, PUT с сохранением id/tags, PATCH с пропуском/null/false, "
                "пустой DELETE 204 и общий JSON через API/CLI после перезапуска. Учебное состояние возвращено к baseline; "
                "TestClient и тестовый слой не добавлялись."
            )
        }
    ],
    "54.1": [
        {
            "title": "Проверим, как TaskPatch хранит переданные поля",
            "task": (
                "Сначала проверь фактический checkout: найди `TaskCreate`, `TaskUpdate`, все определения `TaskPatch` и "
                "импорты схем. Целевое постоянное место: `app/schemas.py`; наличие класса в legacy-модуле или в плане "
                "не подтверждает его наличие здесь. Если `TaskPatch` лежит только на legacy-пути, согласуй перенос или "
                "использование с целевым `app/schemas.py` без дубликата; если схемы нет: создай её по плану. Затем в той "
                "же `.venv` проверь пропуск, `null`, `False` и `model_dump` на настоящей схеме из `app.schemas`. "
                "Не добавляй editor-задачу, PATCH endpoint, сервисную логику или сохранение."
            ),
            "tasks": [
                {
                    "title": "Проверим расположение и поля TaskPatch",
                    "task": (
                        "В текущем checkout найдите `TaskCreate`, `TaskUpdate`, `TaskPatch` и места их импорта. "
                        "Сравните `TaskCreate.title`, `TaskUpdate.is_done` и `TaskPatch.title`; заполните таблицу: "
                        "`поле | тип | default | можно пропустить | можно передать null`. Целевая схема должна быть "
                        "доступна из `app/schemas.py`: если класс уже там, проверьте его; если он только в "
                        "`app/routers/tasks/schemas.py`: согласуйте перенос/использование и импорты без второго объявления; "
                        "если его нет: создайте `TaskPatch` в `app/schemas.py` по правилам плана. В конце перечислите "
                        "её поля и ограничения."
                    ),
                    "requirements": [
                        "Проверены фактическое наличие моделей, пути и импорты; ни один вариант состояния не предполагается заранее.",
                        "В `app/schemas.py` доступно ровно одно каноническое объявление TaskPatch; legacy-объявление согласовано с ним, дубликата нет.",
                        "Для каждого из трёх полей указаны тип, default, возможность пропуска и допустимость null.",
                        "Перечислены все поля TaskPatch и точные ограничения Field.",
                        "Указано, что strip_title обрезает строки до проверки Field.",
                        "Если схема отсутствовала, она создана в app/schemas.py; если уже существовала там, её не создавали повторно."
                    ],
                    "hint": (
                        "Сначала найдите тип и default. Тип показывает допустимые значения. Default показывает, "
                        "можно ли пропустить поле. Затем проверьте ограничения Field и валидатор."
                    ),
                    "answer": {
                        "explanation": (
                            "В Pydantic тип и обязательность: разные свойства. TaskCreate.title и TaskUpdate.is_done "
                            "обязательны. У TaskPatch.title есть default=None, поэтому поле можно пропустить. В "
                            "TaskPatch также входят priority и is_done; id и tags в неё не входят."
                        ),
                        "steps": [
                            "Проверьте `app/schemas.py`, legacy-путь `app/routers/tasks/schemas.py` и импорты; установите, где класс фактически объявлен.",
                            "Если класс есть только на legacy-пути, согласуйте перенос/использование с `app/schemas.py` и обновите импорты без дублирования; если его нет: создайте по плану в `app/schemas.py`.",
                            "Сравните фактические определения и запишите тип, default и ограничения Field.",
                            "Отметьте отдельно: можно ли пропустить поле и можно ли передать null.",
                            "Перечислите все поля TaskPatch и опишите работу strip_title.",
                            "Сверьте заметку с единственным каноническим классом и его импортами."
                        ],
                        "code": '''Поле                  Тип              default     пропуск   null
TaskCreate.title      str              нет         нет       нет
TaskUpdate.is_done    bool             нет         нет       нет
TaskPatch.title       str | None       None        да        да

TaskPatch:
title     длина 1–120 после strip
priority  int | None, default None, от 1 до 5
is_done   bool | None, default None

# Только если TaskPatch отсутствует: единственное объявление в app/schemas.py.
from pydantic import BaseModel, Field, field_validator

class TaskPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    priority: int | None = Field(default=None, ge=1, le=5)
    is_done: bool | None = None

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value

# Сохраните существующие импорты/совместимость; второй класс не создавайте.''',
                        "checks": [
                            "Для трёх полей указаны тип, default, пропуск и null.",
                            "Видно, какие поля обязательны, а какие можно пропустить.",
                            "Перечислены поля TaskPatch, ограничения Field и очистка в strip_title."
                        ]
                    },
                    "result": (
                        "Таблица показывает, чем обязательное поле отличается от поля, которое можно пропустить. "
                        "В ней также перечислены ограничения TaskPatch. Код не менялся."
                    ),
                },
                {
                    "title": "Проверим пропуск, null и False",
                    "task": (
                        "После проверки/подготовки схемы из предыдущего шага запустите из корня проекта в PowerShell "
                        ".\\.venv\\Scripts\\python.exe. В Python импортируйте `TaskPatch` из `app.schemas`. "
                        "Проверьте четыре входа на этой настоящей схеме: пропуск title, title=null, "
                        "title с пробелами и is_done=False. Для каждого выведите model_fields_set и результаты "
                        "model_dump с разными фильтрами. Старт: `from app.schemas import TaskPatch`, "
                        "`payloads = [{}, {\"title\": None}, {\"title\": \"  Read  \"}, {\"is_done\": False}]`. "
                        "Для каждого входа создайте `patch = TaskPatch.model_validate(payload)`."
                    ),
                    "requirements": [
                        "Команда запускается из корня StudyHub; код вводится в Python.",
                        "В той же проектной `.venv` используется настоящая каноническая TaskPatch из app.schemas.",
                        "Для каждого входа создаётся отдельная модель через model_validate.",
                        "Сравниваются обычный model_dump, exclude_unset, exclude_none и оба фильтра вместе.",
                        "Записаны ключи для пропуска, null, строки и False.",
                        "Код только читает и печатает результат. patch_task и сохранение не запускаются."
                    ],
                    "hint": (
                        "Сначала выведите model_fields_set. Так видно, какие имена пришли во входе. Затем сравните "
                        "результаты каждого model_dump."
                    ),
                    "answer": {
                        "explanation": (
                            "У пропущенного поля есть значение по умолчанию, но его имени нет в model_fields_set. "
                            "Явный null отмечен как переданный: exclude_unset оставляет его, а exclude_none удаляет. "
                            "False не равно None, поэтому остаётся в changes."
                        ),
                        "steps": [
                            "Запустите Python из корня StudyHub.",
                            "Импортируйте TaskPatch из app.schemas.",
                            "Проверьте четыре входа из условия через model_validate.",
                            "Для каждого выведите model_fields_set и четыре варианта model_dump.",
                            "Сравните ключи и значения в итоговых словарях."
                        ],
                        "code": '''from app.schemas import TaskPatch

payloads = {
    "omitted": {},
    "null": {"title": None},
    "value": {"title": "  Read  "},
    "false": {"is_done": False},
}

for label, payload in payloads.items():
    patch = TaskPatch.model_validate(payload)
    print(label, patch.model_fields_set)
    print("all:", patch.model_dump())
    print("unset:", patch.model_dump(exclude_unset=True))
    print("none:", patch.model_dump(exclude_none=True))
    print(
        "changes:",
        patch.model_dump(exclude_unset=True, exclude_none=True),
    )''',
                        "checks": [
                            "При пропуске model_fields_set и changes пусты.",
                            "При null exclude_unset оставляет ключ, а оба фильтра вместе удаляют его.",
                            "Пробелы вокруг title убраны.",
                            "В changes осталось is_done=False."
                        ]
                    },
                    "result": (
                        "Проверены четыре входа и все варианты model_dump. В итоговом changes нет null, title очищен, "
                        "а is_done=False сохранён."
                    )
                },
            ],
            "result": (
                "TaskPatch в app/schemas.py найдена, согласована или создана без дубликата; в той же `.venv` проверены "
                "пропуск, null, False и варианты model_dump на настоящей схеме. Сервис, данные и HTTP не менялись."
            )
        }
    ],
    54: [
        {
            "title": "Частичное изменение в PlannerService",
            "task": (
                "Старт A: в PlannerService уже есть replace_task, Task и JsonStorage. Добавьте рядом patch_task(task_id, *, title=None, priority=None, is_done=None). "
                "Результат B: меняются только значения, отличные от None; False применяется. Новая Task проверяется до save() и возвращается; id, tags и соседи сохраняются. "
                "Проверяйте сервис через JsonStorage(tmp_path). TaskPatch и HTTP пока не добавляйте."
            ),
            "tasks": [
                {
                    "title": "Новая Task сохраняет неуказанные поля",
                    "task": (
                        "Добавьте patch_task в PlannerService. Найдите задачу по task_id. Если title, priority и is_done равны None, верните её без save(). "
                        "Иначе создайте новую Task: для None возьмите старое значение, а остальные аргументы примените."
                    ),
                    "requirements": [
                        "Загрузите список через self.storage.load() и найдите задачу через _find_task(tasks, task_id).",
                        "Сначала выполните поиск. Пустое изменение вернёт current без save().",
                        "Проверяйте value is None. Так явное False не потеряется.",
                        "Создайте и проверьте новую Task до замены записи.",
                        "Сохраните current.id, копию current.tags и все старые значения, которых нет среди аргументов.",
                        "Замените одну позицию, один раз сохраните весь список и верните updated."
                    ],
                    "hint": "Для каждого поля выберите старое значение при None и новое во всех остальных случаях. Значение False тоже применяется.",
                    "answer": {
                        "explanation": (
                            "Не меняйте current на месте. Сначала соберите и проверьте новую Task, затем замените запись и сохраните список. "
                            "Сравнение с None сохраняет прежнее значение только при пропуске аргумента; False применяется. "
                            "Поиск до no-op оставляет TaskNotFoundError для неизвестного id."
                        ),
                        "steps": [
                            "Загрузите список и найдите Task по id.",
                            "Если все три аргумента равны None, верните current.",
                            "Для каждого поля выберите старое или переданное значение.",
                            "Создайте Task с прежним id и копией tags.",
                            "Замените одну запись, сохраните список и верните новую Task."
                        ],
                        "code": '''def patch_task(self, task_id, *, title=None, priority=None, is_done=None):
    tasks = self.storage.load()
    current = self._find_task(tasks, task_id)

    if title is None and priority is None and is_done is None:
        return current

    index = tasks.index(current)
    updated = Task(
        id=current.id,
        title=current.title if title is None else title,
        priority=current.priority if priority is None else priority,
        is_done=current.is_done if is_done is None else is_done,
        tags=current.tags.copy(),
    )
    tasks[index] = updated
    self.storage.save(tasks)
    return updated''',
                        "checks": [
                            "Поиск стоит до проверки на пустое изменение.",
                            "None сохраняет старое значение, False применяется.",
                            "Task создаётся до замены записи и save().",
                            "При no-op save() не вызывается; при изменении сохраняется весь список."
                        ]
                    },
                    "result": (
                        "patch_task сначала находит существующую Task, сохраняет поля при None и применяет явный False. "
                        "Новый объект проверяется до замены позиции и сохранения списка."
                    )
                },
                {
                    "title": "Смена title и статуса сохраняет остальные поля",
                    "task": (
                        "Создайте в tmp_path соседнюю задачу с id=4 и целевую с id=11. Измените у целевой сначала только title, затем отдельным вызовом задайте is_done=False. "
                        "Сравните обе Task целиком."
                    ),
                    "requirements": [
                        "У двух начальных задач разные tags.",
                        "После смены title у задачи 11 прежние priority, is_done, id и tags.",
                        "После is_done=False статус меняется с True на False; остальные поля прежние.",
                        "Задача с id=4 не меняется."
                    ],
                    "hint": "Сравните целиком возвращённую задачу, затем весь список. Так заметите потерю tags или соседа.",
                    "answer": {
                        "explanation": (
                            "Первый вызов меняет только title. Второй передаёт явный False. Сравнение полных объектов проверяет остальные поля, id, tags и соседа."
                        ),
                        "steps": [
                            "Создайте JsonStorage в tmp_path и сохраните две Task.",
                            "Передайте задаче 11 только новый title; сравните всю Task.",
                            "Передайте is_done=False; проверьте смену True на False.",
                            "Убедитесь, что задача 4 и остальные поля не изменились."
                        ],
                        "code": '''from app.models import Task
from app.services import PlannerService
from app.storage import JsonStorage


def test_patch_task_keeps_other_fields_and_neighbor(tmp_path):
    storage = JsonStorage(tmp_path / "tasks.json")
    first = Task(id=4, title="Проверить API", priority=2, tags=["api"])
    original = Task(
        id=11,
        title="Прочитать JSON",
        priority=3,
        is_done=True,
        tags=["storage", "review"],
    )
    storage.save([first, original])
    service = PlannerService(storage)

    renamed = service.patch_task(11, title="Проверить сохранение")
    assert renamed == Task(
        id=11,
        title="Проверить сохранение",
        priority=3,
        is_done=True,
        tags=["storage", "review"],
    )

    reopened = service.patch_task(11, is_done=False)
    assert reopened == Task(
        id=11,
        title="Проверить сохранение",
        priority=3,
        is_done=False,
        tags=["storage", "review"],
    )
    assert service.storage.load() == [first, reopened]''',
                        "checks": [
                            "Новый title не сбрасывает priority и статус.",
                            "is_done=False меняет True на False.",
                            "id, tags и соседняя Task сохранены."
                        ]
                    },
                    "result": (
                        "После title-only и is_done=False у целевой Task сохранены id, tags и остальные поля; "
                        "соседняя Task остаётся без изменений."
                    )
                },
                {
                    "title": "Пустой запрос, неизвестный id и ошибка",
                    "task": (
                        "Используйте файл с задачами id=4 и id=11. Проверьте три случая: пустой вызов для id=11; пустой вызов для отсутствующего id=99; priority=6 для id=11. "
                        "Сравните файл до и после. В коде найдите, что пустой вызов возвращается до save()."
                    ),
                    "requirements": [
                        "Для id=11 пустой вызов возвращает прежнюю Task.",
                        "Для id=99 пустой вызов поднимает TaskNotFoundError.",
                        "priority=6 поднимает ValueError до замены записи.",
                        "После каждого случая файл содержит исходные задачи.",
                        "Счётчик save() здесь не нужен; его добавим при прямой проверке сервиса."
                    ],
                    "hint": "Сравните файл до и после. Затем найдите в методе ранний return до save().",
                    "answer": {
                        "explanation": (
                            "Пустой вызов успешен только для найденной задачи. Неизвестный id даёт TaskNotFoundError. "
                            "priority=6 отклоняется до замены Task. Сравнение файла проверяет, что данные не изменились."
                        ),
                        "steps": [
                            "Сохраните две исходные Task в JsonStorage внутри tmp_path.",
                            "Вызовите patch_task(11) и проверьте прежнюю Task.",
                            "Вызовите patch_task(99) и проверьте TaskNotFoundError.",
                            "Передайте priority=6 и проверьте ValueError.",
                            "После каждого вызова перечитайте файл и сравните с исходным списком."
                        ],
                        "code": '''import pytest

from app.errors import TaskNotFoundError
from app.models import Task
from app.services import PlannerService
from app.storage import JsonStorage


def test_patch_task_noop_missing_and_invalid_leave_storage_unchanged(tmp_path):
    path = tmp_path / "tasks.json"
    storage = JsonStorage(path)
    original = [
        Task(id=4, title="Проверить API", priority=2, tags=["api"]),
        Task(
            id=11,
            title="Прочитать JSON",
            priority=3,
            is_done=True,
            tags=["storage", "review"],
        ),
    ]
    storage.save(original)
    service = PlannerService(storage)

    assert service.patch_task(11) == original[1]
    assert PlannerService(JsonStorage(path)).storage.load() == original

    with pytest.raises(TaskNotFoundError):
        service.patch_task(99)
    assert PlannerService(JsonStorage(path)).storage.load() == original

    with pytest.raises(ValueError):
        service.patch_task(11, priority=6)
    assert PlannerService(JsonStorage(path)).storage.load() == original''',
                        "checks": [
                            "patch_task(11) возвращает прежнюю Task.",
                            "patch_task(99) поднимает TaskNotFoundError.",
                            "priority=6 поднимает ValueError до save().",
                            "После каждого случая файл содержит исходный список."
                        ]
                    },
                    "result": (
                        "Ранний возврат для найденной Task расположен до save; неизвестный id даёт TaskNotFoundError, "
                        "а недопустимый priority не меняет сохранённый список."
                    )
                },
                {
                    "title": "Новый сервис читает сохранённую Task",
                    "task": (
                        "Измените title у задачи с id=11. Создайте новый PlannerService с JsonStorage того же пути и перечитайте список. "
                        "Сравните целевую Task и соседа с исходными данными."
                    ),
                    "requirements": [
                        "Используется отдельный JSON внутри tmp_path.",
                        "Новый сервис читает файл по тому же пути.",
                        "Целевая Task содержит новый title, прежние id и tags; сосед не меняется.",
                        "TestClient, TaskPatch и HTTP PATCH не используются."
                    ],
                    "hint": "Сначала сравните возвращённую Task. Затем откройте тот же файл новым сервисом.",
                    "answer": {
                        "explanation": (
                            "Возвращённый объект показывает результат вызова. Новый сервис подтверждает запись в файл. Сосед проверяет, что список сохранился целиком."
                        ),
                        "steps": [
                            "Сохраните целевую Task и соседа во временный файл.",
                            "Измените только title у задачи 11 и проверьте результат.",
                            "Создайте новый PlannerService с тем же путём JsonStorage.",
                            "Сравните перечитанный список с ожидаемыми Task."
                        ],
                        "code": '''from app.models import Task
from app.services import PlannerService
from app.storage import JsonStorage


def test_patch_task_persists_for_new_service(tmp_path):
    path = tmp_path / "tasks.json"
    storage = JsonStorage(path)
    original = [
        Task(id=4, title="Проверить API", priority=2, tags=["api"]),
        Task(
            id=11,
            title="Прочитать JSON",
            priority=3,
            is_done=True,
            tags=["storage", "review"],
        ),
    ]
    storage.save(original)

    updated = PlannerService(storage).patch_task(
        11,
        title="Проверить сохранение",
    )
    assert updated == Task(
        id=11,
        title="Проверить сохранение",
        priority=3,
        is_done=True,
        tags=["storage", "review"],
    )

    reloaded = PlannerService(JsonStorage(path)).storage.load()
    assert reloaded == [
        original[0],
        Task(
            id=11,
            title="Проверить сохранение",
            priority=3,
            is_done=True,
            tags=["storage", "review"],
        ),
    ]''',
                        "checks": [
                            "Новый сервис читает данные из того же файла.",
                            "У целевой Task сохранены id, tags и остальные поля.",
                            "Соседняя Task не изменилась."
                        ]
                    },
                    "result": (
                        "После успешного изменения новый PlannerService читает из того же пути полную целевую Task "
                        "и неизменённого соседа."
                    )
                }
            ],
            "result": (
                "patch_task ищет задачу, меняет только переданные поля и проверяет новую Task до записи. None оставляет старое значение, "
                "False применяется; id, tags и сосед сохраняются. Пустой запрос, неизвестный id и priority=6 дают разные результаты. "
                "TaskPatch и HTTP PATCH появятся в следующих занятиях."
            )
        }
    ],
    "51.1": [
        {
            'title': 'Ограничения очищенного входа Planner',
            'task': (
                'В TaskCreate уже есть безопасная очистка title. Добавьте границы Field для title и priority, проверьте POST /tasks '
                'и убедитесь, что ошибка 422 не меняет список задач.'
            ),
            'tasks': [
                {
                    'title': 'Добавляем Field к готовой TaskCreate',
                    'task': (
                        'В app/api.py найдите TaskCreate с полями title и priority. Before-validator уже очищает строковый '
                        'title. Добавьте Field: длина очищенного title от 1 до 120, priority от 1 до 5. POST /tasks '
                        'продолжает работать через прежний PlannerService.'
                    ),
                    'requirements': [
                        'title и priority остаются обязательными: значения по умолчанию не добавляются.',
                        'Before-validator вызывает strip только для строки; другой тип он передаёт на проверку Pydantic.',
                        'Field задаёт title min_length=1 и max_length=120, priority ge=1 и le=5.',
                        'Преобразование типов и дополнительные поля остаются прежними. Маршрут, PlannerService, доменная Task, '
                        'JsonStorage и формат JSON не меняются.'
                    ],
                    'hint': 'Откройте TaskCreate и найдите два объявления полей. Добавьте Field к ним; before-validator оставьте без изменений.',
                    'result': (
                        'В app/api.py TaskCreate сохраняет обязательные поля и безопасную очистку title. Field проверяет '
                        'очищенную длину от 1 до 120 и priority от 1 до 5; POST использует прежний PlannerService.'
                    ),
                    'answer': {
                        'explanation': (
                            'Before-validator очищает строковый title до проверки поля. Field получает уже очищенное значение '
                            'и проверяет его границы. Priority проходит обычное преобразование Pydantic перед проверкой ge и le.'
                        ),
                        'steps': [
                            'Откройте TaskCreate в app/api.py. Оставьте оба поля обязательными.',
                            'Добавьте к title min_length=1 и max_length=120.',
                            'Добавьте к priority ge=1 и le=5.',
                            'Сохраните before-validator и прежний POST.'
                        ],
                        'code': '''from pydantic import BaseModel, Field, field_validator


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: int = Field(ge=1, le=5)

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value''',
                        'checks': [
                            'Title длиной 1 и 120 проходит; пустой title и длина 121 отклоняются. Priority 1 и 5 проходит; 0 и 6 отклоняются.',
                            'Нестроковый title получает ошибку проверки Pydantic, а не Python-ошибку от strip.',
                            'Преобразование типов и обработка дополнительных полей остаются прежними.'
                        ]
                    }
                },
                {
                    'title': 'Проверяем границы через POST',
                    'task': (
                        'В /docs или коллекции Planner отправьте POST /tasks с полями title и priority. Проверьте границы '
                        'из списка требований. Создайте строки длиной 120 и 121 в Python-интерпретаторе и вставьте их в body. '
                        'Для каждого ответа запишите статус, а для ошибки 422 прочитайте loc и type.'
                    ),
                    'requirements': [
                        'Title длиной 1 и 120 после очистки проходит; пустая строка и длина 121 дают 422.',
                        'Строка с внешними пробелами и 120 символами проходит после strip; строка из пробелов становится пустой и даёт 422.',
                        'Внутренние пробелы остаются в title.',
                        'Priority 1 и 5 проходит, 0 и 6 даёт 422. Строка "4" преобразуется в int.',
                        'Неверный тип title и пропущенное обязательное поле дают 422 до endpoint.',
                        'В ошибке loc показывает поле, type - вид ошибки. Точный текст msg не фиксируется.'
                    ],
                    'hint': 'Меняйте одно значение за раз. Title оценивайте после strip; в ответе 422 смотрите loc и type, не сверяйте точный текст msg.',
                    'result': (
                        'POST /tasks принимает title длиной после очистки 1 и 120 и priority 1 и 5. Неверные значения дают '
                        '422 до endpoint; loc и type показывают поле и вид ошибки.'
                    ),
                    'answer': {
                        'explanation': (
                            'Before-validator убирает краевые пробелы, затем Field проверяет длину результата. Поэтому сырая '
                            'строка может быть длиннее 120, если после очистки остаётся 120 символов. Пустой результат и длина '
                            '121 отклоняются до вызова маршрута.'
                        ),
                        'steps': [
                            'Отправьте допустимый запрос с коротким title и priority=3.',
                            'Повторите запрос с title длиной 1, 120 и 121; добавьте внешние пробелы к строке длиной 120.',
                            'Отправьте пустой title, title из пробелов и priority 0 и 6.',
                            'Проверьте priority="4", неверный тип title и пропущенное поле.',
                            'Для каждого отказа запишите статус, loc и type. Точный msg не сравнивайте.'
                        ],
                        'code': '''"x"                         -> title длиной 1: проходит
"x" * 120                   -> title длиной 120: проходит
" " + "x" * 120 + " "       -> после strip длина 120: проходит
"   "                       -> после strip длина 0: 422
"x" * 121                   -> после strip длина 121: 422

priority=1 и priority=5     -> проходят
priority=0 и priority=6     -> 422
priority="4"               -> обычное преобразование в int
отсутствует priority        -> 422

# Для отказа сверяем loc и type.
# Полный текст msg не закрепляем.''',
                        'checks': [
                            'Края title и priority включены; длина title считается после удаления внешних пробелов.',
                            'Внутренние пробелы остаются в title, строка "4" преобразуется в число.',
                            'Ошибка проверки body даёт 422 до вызова endpoint.'
                        ]
                    }
                },
                {
                    'title': 'Проверяем, что ошибка не меняет Planner',
                    'task': (
                        'Перед запросами запишите ответы GET /tasks, GET /stats и содержимое рабочего JSON. После каждого POST '
                        'с ошибкой 422 повторите чтения и сравните данные. Затем отправьте допустимый POST /tasks, найдите задачу '
                        'по id через GET и CLI и повторите GET после перезапуска API.'
                    ),
                    'requirements': [
                        'После ошибки 422 список GET /tasks, счётчики GET /stats и рабочий JSON совпадают с исходными.',
                        'Допустимый POST возвращает id и очищенный title в прежнем формате ответа.',
                        'GET /tasks/{task_id} и CLI показывают задачу с этим id и очищенным title.',
                        'После перезапуска API GET по тому же id находит сохранённую задачу; прежние записи не меняются.',
                        'Ошибка происходит до endpoint, поэтому PlannerService не меняет данные.'
                    ],
                    'hint': 'Сравните список и stats до и после ошибочного POST. Для успеха используйте id из ответа, не подставляйте его вручную.',
                    'result': (
                        'После каждого ошибочного POST список, stats и рабочий JSON остаются прежними. Допустимый POST возвращает '
                        'очищенный title и id; GET и CLI находят ту же задачу, а после перезапуска API она читается по тому же id.'
                    ),
                    'answer': {
                        'explanation': (
                            'FastAPI строит TaskCreate до вызова endpoint. При ошибке проверки endpoint и PlannerService не '
                            'запускаются, поэтому список и stats остаются прежними. Допустимый запрос идёт по обычному пути; '
                            'чтение по id из ответа подтверждает сохранение.'
                        ),
                        'steps': [
                            'Запишите ответы GET /tasks, GET /stats и содержимое рабочего JSON.',
                            'После каждого невалидного body из предыдущей карточки проверьте 422 и сравните все три источника с исходным состоянием.',
                            'Отправьте допустимый title с внешними пробелами и priority=3. Запишите status, id и очищенный title.',
                            'Откройте GET /tasks/{task_id} с этим id и найдите ту же задачу через CLI.',
                            'Перезапустите API и повторите GET по этому id.'
                        ],
                        'code': '''До запроса:
GET /tasks
GET /stats

Каждый невалидный POST -> 422
После каждого GET /tasks, GET /stats и JSON -> значения прежние

POST /tasks с допустимым body -> id из ответа
GET /tasks/{task_id} и CLI -> та же задача
После перезапуска API -> GET по тому же id''',
                        'checks': [
                            'После 422 список, stats и рабочий JSON совпадают с исходными значениями.',
                            'POST, GET по id и CLI показывают один очищенный title.',
                            'После перезапуска API задача остаётся доступна по прежнему id.',
                            'Ошибка body не вызывает PlannerService.'
                        ]
                    }
                }
            ],
            'result': (
                'TaskCreate очищает строковый title, затем проверяет длину от 1 до 120 и priority от 1 до 5. Ошибка body '
                'даёт 422 до endpoint и не меняет Planner. Допустимый POST сохраняет задачу; GET и CLI находят её по id.'
            )
        }
    ],
    58: [
        {
            'title': 'Разделим HTTP-вход и публичный ответ Planner',
            'task': (
                'app/schemas.py содержит прежнюю TaskCreate со всеми правилами входа и отдельную TaskRead. '
                'Действующие GET и POST объявляют формы успешных ответов, сохраняя поведение маршрутов. '
                'PlannerService, формат JSON и CLI продолжают работать как прежде.'
            ),
            'tasks': [
                {
                    'title': 'Перенесём TaskCreate и зададим форму TaskRead',
                    'task': (
                        'TaskCreate переносится из app/api.py вместе с нормализацией title и ограничениями. '
                        'TaskRead описывает одну публичную задачу четырьмя полями.'
                    ),
                    'requirements': [
                        'TaskCreate сохраняет обязательные title и priority, безопасный before-validator и прежние Field-границы.',
                        'TaskRead содержит id: int, title: str, priority: int и is_done: bool; tags в неё не входит.',
                        'Доменная Task остаётся в models.py, а schemas.py не получает зависимость от FastAPI, сервиса или storage.'
                    ],
                    'hint': 'Сравним два направления обмена: что сообщает клиент и что сервер возвращает после создания.',
                    'answer': {
                        'explanation': (
                            'TaskCreate проверяет вход, а TaskRead задаёт публичное представление уже созданной задачи. '
                            'Перенос не меняет порядок проверки: сначала строковый title очищается, затем Field проверяет границы. '
                            'Доменная Task продолжает хранить внутренние данные Planner.'
                        ),
                        'steps': [
                            'Переносим текущую TaskCreate целиком, включая BaseModel, Field, field_validator и strip_title.',
                            'Добавляем TaskRead с типами id, title, priority и is_done.',
                            'Заменяем импорт TaskCreate в app/api.py импортом обеих схем из app.schemas.'
                        ],
                        'code': '''from pydantic import BaseModel, Field, field_validator


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: int = Field(ge=1, le=5)

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value


class TaskRead(BaseModel):
    id: int
    title: str
    priority: int
    is_done: bool''',
                        'checks': [
                            'Границы входа и нормализация совпадают с предыдущим шагом.',
                            'TaskRead содержит ровно четыре публичных поля.',
                            'TaskCreate и TaskRead не заменяют доменную Task.'
                        ]
                    }
                },
                {
                    'title': 'Объявим response_model у трёх действующих маршрутов',
                    'task': (
                        'GET списка, GET по id и POST используют публичную модель успешного ответа. '
                        'Тела функций, параметры списка и предметная логика остаются прежними.'
                    ),
                    'requirements': [
                        'GET /tasks возвращает list[TaskRead], а GET /tasks/{task_id} и успешный POST возвращают TaskRead.',
                        'POST продолжает принимать TaskCreate и отвечает статусом 201.',
                        'Query-параметры списка и 404 для отсутствующего id сохраняют прежнее поведение.'
                    ],
                    'hint': 'Изменим обещанную форму ответа в декораторе каждого существующего маршрута.',
                    'answer': {
                        'explanation': (
                            'response_model связывает успешный результат маршрута с публичной схемой. Для коллекции '
                            'указываем список TaskRead. Handler продолжает вызывать PlannerService; response_model '
                            'не создаёт второй список и не пишет JSON напрямую.'
                        ),
                        'steps': [
                            'Импортируем TaskRead рядом с TaskCreate в app/api.py.',
                            'Добавляем list[TaskRead] к существующему GET списка и TaskRead к GET по id.',
                            'Добавляем TaskRead к декоратору POST, не меняя status_code=201 и его тело.'
                        ],
                        'code': '''# Точечные замены декораторов существующих маршрутов
-@app.get("/tasks")
+@app.get("/tasks", response_model=list[TaskRead])

-@app.get("/tasks/{task_id}")
+@app.get("/tasks/{task_id}", response_model=TaskRead)

-@app.post("/tasks", status_code=201)
+@app.post("/tasks", response_model=TaskRead, status_code=201)''',
                        'checks': [
                            'Успешные GET сохраняют прежний статус, query-параметры и 404.',
                            'POST сохраняет 201 и вызывает существующий PlannerService.',
                            'Форма ответа состоит из четырёх полей TaskRead.'
                        ]
                    }
                },
                {
                    'title': 'Сопоставим OpenAPI, HTTP и полную запись',
                    'task': (
                        'Документация показывает разные схемы запроса и ответа. Один POST, последующее чтение по его id '
                        'и существующая задача с tags подтверждают, что публичный JSON не изменил внутренний формат Planner.'
                    ),
                    'requirements': [
                        'OpenAPI показывает TaskCreate у request POST, TaskRead у успешного POST и item, list[TaskRead] у списка.',
                        'POST отвечает 201 четырьмя полями; GET по фактическому id возвращает те же публичные значения.',
                        'У задачи с непустыми tags ответ API не содержит tags, но JSON и CLI сохраняют это поле.',
                        'Существующие query-параметры и 404 для отсутствующего id остаются доступными.'
                    ],
                    'hint': 'Сначала сверим объявленный договор, затем возьмём id из POST и сравним одну запись в разных представлениях.',
                    'answer': {
                        'explanation': (
                            'OpenAPI показывает контракт, HTTP подтверждает фактическую форму, а JSON и CLI показывают '
                            'сохранённую доменную запись. TaskRead исключает внутреннее поле tags, не удаляя его из Task или файла.'
                        ),
                        'steps': [
                            'В /docs проверяем request TaskCreate и response TaskRead для POST и GET по id, а также list[TaskRead] у списка.',
                            'Отправляем один допустимый POST и записываем id из ответа 201.',
                            'Читаем созданную задачу по этому id и сравниваем четыре публичных поля.',
                            'Для задачи с непустыми tags сравниваем API, JSON и CLI; затем проверяем query-параметр списка и отсутствующий id.'
                        ],
                        'code': '''POST /tasks -> 201
{"id": N, "title": "Проверить HTTP-контракт", "priority": 3, "is_done": false}

GET /tasks/N -> 200
{"id": N, "title": "Проверить HTTP-контракт", "priority": 3, "is_done": false}

У существующей задачи с tags: поле сохранено в JSON/CLI, но не входит в HTTP response.''',
                        'checks': [
                            'Фактический id берётся из POST, а не задаётся клиентом.',
                            'HTTP-ответы содержат четыре поля и не публикуют tags.',
                            'Полная запись JSON и прежний CLI по-прежнему показывают tags.'
                        ]
                    }
                }
            ],
            'result': (
                'TaskCreate сохранена без смены правил в app/schemas.py; TaskRead описывает публичные четыре поля. '
                'Три существующих маршрута используют response_model, POST сохраняет 201, а JSON и CLI сохраняют прежнюю Task с tags.'
            )
        }
    ],
    59: [
        {
            'title': 'Проверим сохранение и серверные id Planner',
            'task': (
                'Planner сохраняет созданные задачи в JSON через существующий сервис. В практике прослеживается путь POST, '
                'сверяются API и CLI, а сохранение и назначение id защищаются изолированными тестами.'
            ),
            'tasks': [
                {
                    'title': 'Путь от POST до JSON',
                    'task': (
                        'Маршрут POST передаёт проверенные title и priority существующему PlannerService.add_task(). '
                        'Сервис назначает id и сохраняет полную Task через настроенный JsonStorage до успешного ответа 201.'
                    ),
                    'requirements': [
                        'API получает сервис через существующую точку сборки, а не создаёт список задач в модуле маршрута.',
                        'id вычисляется из фактических сохранённых записей; TaskRead ограничивает ответ, не формат JSON.',
                        'Настройки CLI и API указывают на один и тот же путь файла.',
                        'Если API сохраняет собственный снимок или пишет JSON из маршрута, создание возвращается в существующий сервис.'
                    ],
                    'hint': 'Сначала найдём app.state.planner и build_service(). Затем проследим add_task до load/save у JsonStorage.',
                    'answer': {
                        'explanation': (
                            'TaskCreate проверяет поля клиента. API передаёт их существующему сервису, который применяет '
                            'правило id и сохраняет доменную Task. Только после успешного действия маршрут возвращает '
                            'TaskRead со статусом 201. CLI и API используют общий файл благодаря одинаковой настройке '
                            'JsonStorage, а не общему объекту Python между процессами.'
                        ),
                        'steps': [
                            'В build_service найдём, какой JsonStorage получает PlannerService и какой путь ему передан.',
                            'В точке сборки API проверим, что app.state.planner содержит созданный сервис, а не отдельный список.',
                            'В POST проследим передачу TaskCreate.title и priority в add_task().',
                            'В сервисе найдём загрузку актуальных Task, назначение id и вызов save() до возврата.',
                            'В JsonStorage сверим, что сериализуется полная Task; TaskRead используется на HTTP-границе.'
                        ],
                        'checks': [
                            'Маршрут не дублирует создание, вычисление id или запись JSON.',
                            'Ответ 201 следует после успешного сервиса; настройки CLI и API ведут к одному файлу.'
                        ]
                    }
                },
                {
                    'title': 'Один результат виден API и CLI',
                    'task': (
                        'Два POST с различимыми title создают две новые задачи с серверными id. GET и существующий CLI '
                        'показывают те же записи до и после перезапуска API; ранее сохранённые задачи остаются на месте.'
                    ),
                    'requirements': [
                        'Проверка использует фактические id из ответов, а не заранее выбранные номера.',
                        'В корректном body поля id и is_done не переопределяют значения сервиса; для проверки входной id отличен от ожидаемого следующего номера.',
                        'Путь JSON не меняется между CLI и API, файл не редактируется вручную.'
                    ],
                    'hint': 'В TaskCreate нет полей id и is_done. Проверим фактическую политику Pydantic для лишних полей и значение, которое создал сервис.',
                    'answer': {
                        'explanation': (
                            'Пример запроса показывает, что лишние поля не становятся командами для сервиса. При обычной '
                            'настройке Pydantic они игнорируются: сервер назначает фактический id и is_done=False. '
                            'Успешное сохранение проверяется повторным GET, чтением через CLI и после перезапуска, а не '
                            'только одним ответом POST.'
                        ),
                        'code': '''POST /tasks
Content-Type: application/json

{"id": 999, "title": "Проверка JSON A", "priority": 4, "is_done": true}''',
                        'steps': [
                            'Через GET /tasks или CLI выясним сохранённые id и вычислим следующий номер по действующему правилу Planner.',
                            'В первом корректном body укажем id, отличный от ожидаемого следующего номера, и is_done=true. Отправим POST и запишем статус 201 и фактический id.',
                            'Отправим второй POST с другим title и без дополнительных полей; сохраним его фактический id. Через GET /tasks/{id} проверим обе записи: первый id совпадает с расчётом Planner, а is_done равен false.',
                            'Откроем CLI по его существующей инструкции, найдём те же title и сохраним прежние записи.',
                            'Перезапустим API и повторим GET по фактическим id.'
                        ],
                        'checks': [
                            'Клиент не задаёт серверные id и начальный статус.',
                            'Ответ API, CLI и новый процесс показывают одни сохранённые записи.'
                        ]
                    }
                },
                {
                    'title': 'Тест сохранения через новый сервис',
                    'task': (
                        'Тест в существующем tests/test_services.py сохраняет две Task с id 2 и 7 во временный JSON, '
                        'добавляет новую задачу через PlannerService и читает файл новым экземпляром сервиса.'
                    ),
                    'requirements': [
                        'Тест использует существующие Task, PlannerService и JsonStorage, не создаёт их копии.',
                        'Новый id равен 8, хотя в JSON только две старые записи.',
                        'Повторное чтение сохраняет title, priority, is_done и tags всех трёх полных Task.'
                    ],
                    'hint': 'Создадим JsonStorage на tmp_path. Для новой проверки важны и разрыв между id, и новый PlannerService с тем же путём.',
                    'answer': {
                        'explanation': (
                            'Тест проверяет операцию приложения, а не копию алгоритма над Python-списком. Задачи 2 и 7 '
                            'показывают, почему следующий id берётся от максимального значения, а не от количества записей. '
                            'Новый сервис не имеет состояния старого объекта и заново читает JSON. Проверка tags подтверждает, '
                            'что публичная схема ответа не урезала доменную запись в хранилище.'
                        ),
                        'code': '''from app.models import Task
from app.services import PlannerService
from app.storage import JsonStorage


def test_add_task_persists_full_task_for_new_service(tmp_path):
    path = tmp_path / "tasks.json"
    storage = JsonStorage(path)
    storage.save([
        Task(id=2, title="HTTP", priority=3, tags=["existing"]),
        Task(id=7, title="JSON", priority=4, is_done=True, tags=["keep"]),
    ])

    first = PlannerService(storage)
    created = first.add_task("Planner API", priority=5)

    second = PlannerService(JsonStorage(path))
    loaded = second.list_tasks()

    assert created.id == 8
    assert [(task.id, task.title, task.priority, task.is_done, task.tags) for task in loaded] == [
        (2, "HTTP", 3, False, ["existing"]),
        (7, "JSON", 4, True, ["keep"]),
        (8, "Planner API", 5, False, []),
    ]''',
                        'checks': [
                            'Тест читает временный JSON через новый объект JsonStorage.',
                            'id=8 зависит от max([2, 7]), а поля и tags прежних записей остаются в файле.'
                        ]
                    }
                },
                {
                    'title': 'Повреждённый JSON остаётся ошибкой',
                    'task': (
                        'Нечитаемый JSON вызывает StorageError при чтении PlannerService. Исходное содержимое файла '
                        'остаётся неизменным после отказа.'
                    ),
                    'requirements': [
                        'Файл создаётся внутри tmp_path и содержит синтаксически неверный JSON.',
                        'Сервис не возвращает пустой список и не перезаписывает исходный файл.',
                        'Тест ожидает StorageError, а не 404 или 422.'
                    ],
                    'hint': 'Сохраним исходный текст, вызовем list_tasks() и сравним файл после исключения.',
                    'answer': {
                        'explanation': (
                            'StorageError сообщает, что всё хранилище нельзя корректно прочитать. Это не означает, что '
                            'внутри нет одной искомой задачи. Возврат пустого списка скрыл бы проблему и мог бы привести '
                            'к перезаписи исходных данных.'
                        ),
                        'code': '''import pytest

from app.exceptions import StorageError
from app.services import PlannerService
from app.storage import JsonStorage


def test_corrupt_json_is_not_treated_as_empty(tmp_path):
    path = tmp_path / "tasks.json"
    path.write_text("{broken", encoding="utf-8")
    original = path.read_text(encoding="utf-8")
    service = PlannerService(JsonStorage(path))

    with pytest.raises(StorageError):
        service.list_tasks()

    assert path.read_text(encoding="utf-8") == original''',
                        'steps': [
                            'Запишем в отдельный файл заведомо неверный JSON и сохраним его исходный текст.',
                            'Вызовем list_tasks() у сервиса с этим JsonStorage.',
                            'Проверим, что появляется StorageError и текст файла совпадает с исходным.'
                        ],
                        'checks': [
                            'StorageError остаётся видимой причиной отказа.',
                            'Повреждённый источник не превращается в пустой Planner и не изменяется.'
                        ]
                    }
                }
            ],
            'result': (
                'Один POST-путь использует PlannerService и общий JsonStorage. API и CLI видят фактические серверные id, '
                'сохранение полных Task подтверждено новым сервисом на tmp_path, а повреждённый JSON не скрывается.'
            )
        }
    ],
    60: [
        {
            'title': 'Оставим одно ядро Planner для CLI и API',
            'task': (
                'Проверим существующую архитектуру и закрепим её регрессионными тестами. Не создаём новый CRUD, '
                'сервис или storage.'
            ),
            'tasks': [
                {
                    'title': 'Проследите обе точки входа',
                    'task': (
                        'Найдите build_service в CLI и при сборке FastAPI. Проследите вызовы списка, поиска и статистики '
                        'до PlannerService. Исправьте найденное дублирование, не меняя внешний контракт.'
                    ),
                    'requirements': [
                        'Каждый интерфейс использует PlannerService, собранный через существующий build_service.',
                        'PlannerService не импортирует FastAPI, а HTTP-обработчик не читает JSON напрямую.',
                        'Отдельные экземпляры сервиса указывают на один настроенный файл; глобальный Python-объект не требуется.'
                    ],
                    'hint': 'Начните с build_service и app.state.planner. Затем проверьте, кто выполняет поиск и статистику внутри GET-маршрутов.',
                    'answer': {
                        'explanation': (
                            'CLI и FastAPI обычно работают в разных процессах, поэтому у них отдельные экземпляры сервиса. '
                            'Общее состояние обеспечивает одинаковая настройка JsonStorage. HTTP-слой вызывает методы '
                            'PlannerService и формирует публичный ответ, но не повторяет поиск и чтение файла.'
                        ),
                        'steps': [
                            'Найдите создание сервиса для CLI и проверьте, что оно идёт через build_service().',
                            'Найдите настройку app.state.planner при сборке API и проверьте тот же build_service().',
                            'Проследите GET списка, item и stats до соответствующих методов сервиса.',
                            'Если endpoint открывает файл или повторяет предметный поиск/подсчёт, замените этот участок вызовом уже существующего метода.',
                            'Оставьте HTTP-проекцию и перевод ожидаемого отсутствия на HTTP-границе.'
                        ],
                        'checks': [
                            'Сервис остаётся независимым от FastAPI.',
                            'Оба интерфейса используют настроенный общий JSON, даже если экземпляры PlannerService разные.'
                        ]
                    }
                },
                {
                    'title': 'Закрепите контракт выборки тестом',
                    'task': (
                        'В tests/test_services.py добавьте тест на select_tasks с временным JsonStorage. После выборки '
                        'проверьте полный список, статистику и повторно загруженные записи.'
                    ),
                    'requirements': [
                        'Подготовьте Task с id 2, 7 и 11; завершена только задача 7.',
                        'Запросите незавершённые задачи по убыванию id с limit=1 и получите id 11.',
                        'Полный список остаётся [2, 7, 11], статистика остаётся all=3, open=2, done=1.',
                        'Тест не читает и не меняет рабочий data/tasks.json.'
                    ],
                    'hint': 'Создайте JsonStorage(path) внутри tmp_path. Сохраните исходные Task, вызовите select_tasks, затем сравните отдельные чтения сервиса и файла.',
                    'answer': {
                        'explanation': (
                            'select_tasks возвращает новый список для ответа. Он не сохраняет отфильтрованную выборку. '
                            'Поэтому новый экземпляр сервиса, полный list_tasks, статистика и файл должны по-прежнему '
                            'содержать все три задачи.'
                        ),
                        'steps': [
                            'Создайте три Task на временном пути и сохраните их через JsonStorage.',
                            'Создайте PlannerService с этим хранилищем.',
                            'Получите незавершённые задачи с сортировкой по убыванию и limit=1.',
                            'Создайте новый PlannerService для того же пути и проверьте список, статистику и файл.'
                        ],
                        'code': '''from app.models import Task
from app.services import PlannerService
from app.storage import JsonStorage


def test_select_tasks_does_not_change_full_planner(tmp_path):
    path = tmp_path / "tasks.json"
    original = [
        Task(id=2, title="CLI", priority=2, is_done=False, tags=["terminal"]),
        Task(id=7, title="HTTP", priority=4, is_done=True, tags=["api"]),
        Task(id=11, title="Tests", priority=3, is_done=False, tags=["pytest"]),
    ]
    JsonStorage(path).save(original)
    service = PlannerService(JsonStorage(path))

    selected = service.select_tasks(
        is_done=False,
        sort_desc=True,
        limit=1,
    )

    reader = PlannerService(JsonStorage(path))
    assert [task.id for task in selected] == [11]
    assert [task.id for task in reader.list_tasks()] == [2, 7, 11]
    assert reader.get_statistics() == {"all": 3, "open": 2, "done": 1}
    assert JsonStorage(path).load() == original''',
                        'checks': [
                            'Выборка сортирует и ограничивает результат, не меняя полный JSON.',
                            'Статистика считает все записи, а не только текущую выборку.'
                        ]
                    }
                },
                {
                    'title': 'Не маскируйте сбой хранилища',
                    'task': (
                        'В существующих сервисных тестах проверьте, что обращение к отсутствующему id даёт '
                        'TaskNotFoundError, а ошибка чтения JSON остаётся StorageError.'
                    ),
                    'requirements': [
                        'Для отсутствующего id проверяется доменное исключение сервиса.',
                        'Для пробельного title проверяется ValueError и отсутствие частичной записи.',
                        'Для повреждённого временного JSON проверяется StorageError.',
                        'Ни одну из этих ошибок не заменяйте пустым списком или общей ошибкой 404.'
                    ],
                    'hint': 'Разведите случаи: файл читается, но записи нет; файл нельзя прочитать вовсе. Это разные входные условия.',
                    'answer': {
                        'explanation': (
                            'TaskNotFoundError относится к одному ресурсу, которого нет в корректно прочитанном Planner. '
                            'ValueError сообщает о нарушении правила Planner, а StorageError означает, что само состояние недоступно. Если обработчик ловит обе ошибки '
                            'как 404, он скрывает поломку хранилища.'
                        ),
                        'steps': [
                            'На исправном временном JSON запросите отсутствующий id и ожидайте TaskNotFoundError.',
                            'Передайте пробельный title в add_task и проверьте ValueError без изменения файла.',
                            'Создайте отдельный файл с некорректным JSON.',
                            'Вызовите чтение через PlannerService и ожидайте StorageError.',
                            'Сравните содержимое повреждённого файла до и после ошибки.'
                        ],
                        'code': '''import pytest

from app.exceptions import StorageError, TaskNotFoundError
from app.services import PlannerService
from app.storage import JsonStorage


def test_missing_task_has_domain_error(tmp_path):
    path = tmp_path / "tasks.json"
    JsonStorage(path).save([])
    service = PlannerService(JsonStorage(path))

    with pytest.raises(TaskNotFoundError):
        service.get_task(404)


def test_invalid_title_does_not_write(tmp_path):
    path = tmp_path / "tasks.json"
    JsonStorage(path).save([])
    service = PlannerService(JsonStorage(path))

    with pytest.raises(ValueError):
        service.add_task("   ", 3)
    assert JsonStorage(path).load() == []


def test_broken_json_is_not_a_missing_task(tmp_path):
    path = tmp_path / "broken.json"
    path.write_text("{broken", encoding="utf-8")
    original = path.read_text(encoding="utf-8")
    service = PlannerService(JsonStorage(path))

    with pytest.raises(StorageError):
        service.list_tasks()
    assert path.read_text(encoding="utf-8") == original''',
                        'checks': [
                            'Отсутствующий id и нечитаемый файл дают разные исключения.',
                            'Все три теста используют tmp_path и не трогают рабочие данные.'
                        ]
                    }
                },
                {
                    'title': 'Сверьте чтение через CLI и HTTP',
                    'task': (
                        'На текущих данных получите список и stats через CLI, затем вызовите GET /tasks и GET /stats. '
                        'Сравните соответствующие значения, не меняя записи.'
                    ),
                    'requirements': [
                        'Первые десять HTTP-записей совпадают с первыми десятью задачами CLI после сортировки по id.',
                        'all из сервиса соответствует total в API; open и done совпадают.',
                        'После GET список, stats и рабочий JSON остались прежними.'
                    ],
                    'hint': 'HTTP-список ограничен и не содержит tags. Сравнивайте общие публичные поля и поле all сервиса с total API.',
                    'answer': {
                        'explanation': (
                            'GET /tasks возвращает публичную проекцию и по умолчанию ограничивает список десятью записями. '
                            'Поэтому сравниваем его с первыми десятью CLI-задачами по id и только по общим полям. '
                            'Статистика берётся для всего Planner; API лишь называет all полем total.'
                        ),
                        'steps': [
                            'Получите через CLI полный список и stats, запишите значения all, open и done.',
                            'Вызовите GET /tasks и сравните порядок и общие поля с первыми десятью CLI-записями.',
                            'Вызовите GET /stats и сверьте total с all, а также open и done.',
                            'Повторите чтение CLI и убедитесь, что GET не изменил сохранённые данные.'
                        ],
                        'checks': [
                            'Не ожидайте увидеть tags в публичном HTTP-ответе.',
                            'Ограниченная выборка не меняет полный список и статистику Planner.'
                        ]
                    }
                }
            ],
            'result': (
                'CLI и API делегируют операции одному PlannerService, сервисные тесты подтверждают границы выборки и ошибок, '
                'а GET показывает данные общего JSON без изменения состояния.'
            )
        }
    ],
    61: [
        {
            'title': 'Добавим полное и частичное обновление Task',
            'task': (
                'Продолжим тот же Planner: POST создаёт задачу, GET читает её из общего JSON. Добавьте PUT для полной '
                'замены редактируемых полей и PATCH для изменения выбранных. Сохраняйте через существующие '
                'PlannerService и JsonStorage, не создавайте второй путь данных.'
            ),
            'tasks': [
                {
                    'title': 'Опишите два входных договора',
                    'task': (
                        'В существующем app/schemas.py добавьте TaskUpdate для PUT и TaskPatch для PATCH. Оставьте '
                        'уже готовые TaskCreate и TaskRead на месте.'
                    ),
                    'requirements': [
                        'TaskUpdate требует title, priority и is_done. Title очищается от краевых пробелов и остаётся длиной от 1 до 120; priority от 1 до 5.',
                        'В TaskPatch те же поля необязательны. Пропущенное поле и null означают «оставить прежнее значение».',
                        'Не добавляйте id или tags во входные схемы. Не меняйте TaskCreate и TaskRead.'
                    ],
                    'hint': 'Возьмите нормализацию title из существующей TaskCreate. Поля полной схемы не получают defaults, а поля PATCH получают None.',
                    'answer': {
                        'explanation': (
                            'TaskUpdate описывает весь редактируемый набор, поэтому у его полей нет значений по умолчанию. '
                            'TaskPatch принимает частичный набор. Нормализация и ограничения остаются такими же, как '
                            'для создания. Id выбирается URL, а tags принадлежат внутренней модели.'
                        ),
                        'steps': [
                            'Оставьте существующий TaskCreate и его validator без изменений.',
                            'Объявите TaskUpdate с тремя обязательными полями и прежними ограничениями.',
                            'Объявите TaskPatch с теми же ограничениями, но с None по умолчанию.',
                            'Добавьте before-validator для title в обе схемы, чтобы сначала убрать краевые пробелы.'
                        ],
                        'code': '''from pydantic import BaseModel, Field, field_validator


class TaskUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: int = Field(ge=1, le=5)
    is_done: bool

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value


class TaskPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    priority: int | None = Field(default=None, ge=1, le=5)
    is_done: bool | None = None

    @field_validator("title", mode="before")
    @classmethod
    def strip_title(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value''',
                        'checks': [
                            'TaskUpdate без любого из трёх полей не проходит валидацию.',
                            'TaskPatch принимает одно допустимое поле, но отвергает неверные title и priority.',
                            'id и tags отсутствуют в обеих схемах обновления.'
                        ]
                    }
                },
                {
                    'title': 'Обновите существующий PlannerService',
                    'task': (
                        'В app/services.py добавьте replace_task и patch_task. Оба метода работают с доменными Task и '
                        'загружают и сохраняют список через уже внедрённый storage.'
                    ),
                    'requirements': [
                        'replace_task находит id, создаёт новую Task с тремя значениями PUT и сохраняет прежние id и tags.',
                        'patch_task сохраняет старые значения пропущенных полей. Явное is_done=False должно применяться.',
                        'Сначала соберите и проверьте новую Task, затем замените элемент и вызовите save один раз.',
                        'Неизвестный id даёт TaskNotFoundError. Пустое изменение возвращает Task без записи в JSON.'
                    ],
                    'hint': 'Создавайте Task до изменения списка: её прежние правила проверят новое состояние. Для PATCH отличайте None от False, а tags копируйте из найденной задачи.',
                    'answer': {
                        'explanation': (
                            'Сервис не знает HTTP-статусов. Он находит объект в полном списке Planner, строит новую '
                            'корректную Task, сохраняет её и возвращает. Если создание Task завершится ошибкой, вызов '
                            'save ещё не произошёл. Проверка значения через is not None не теряет False.'
                        ),
                        'steps': [
                            'Загрузите список и найдите индекс задачи с нужным id.',
                            'До изменения списка создайте новый Task, сохранив id и копию tags.',
                            'Замените объект по найденному индексу, сохраните полный список и верните Task.',
                            'Если id не найден, поднимите существующий TaskNotFoundError.',
                            'В PATCH соберите каждое поле из нового значения, если оно не None, иначе из текущей Task.'
                        ],
                        'code': '''def replace_task(self, task_id, *, title, priority, is_done):
    tasks = self.storage.load()
    for index, current in enumerate(tasks):
        if current.id == task_id:
            updated = Task(
                id=current.id,
                title=title,
                priority=priority,
                is_done=is_done,
                tags=current.tags.copy(),
            )
            tasks[index] = updated
            self.storage.save(tasks)
            return updated
    raise TaskNotFoundError(task_id)


def patch_task(
    self, task_id, *, title=None, priority=None, is_done=None
):
    tasks = self.storage.load()
    for index, current in enumerate(tasks):
        if current.id == task_id:
            if title is None and priority is None and is_done is None:
                return current
            updated = Task(
                id=current.id,
                title=current.title if title is None else title,
                priority=current.priority if priority is None else priority,
                is_done=current.is_done if is_done is None else is_done,
                tags=current.tags.copy(),
            )
            tasks[index] = updated
            self.storage.save(tasks)
            return updated
    raise TaskNotFoundError(task_id)''',
                        'checks': [
                            'PUT меняет все три редактируемых поля, но оставляет id и tags.',
                            'PATCH с is_done=False действительно возвращает задачу в открытые.',
                            'При ошибке конструктора и при неизвестном id JSON не перезаписывается.'
                        ]
                    }
                },
                {
                    'title': 'Подключите PUT и PATCH к тем же маршрутам Planner',
                    'task': (
                        'В существующем app/api.py добавьте PUT /tasks/{task_id} и PATCH с тем же адресом. Оба маршрута '
                        'используют app.state.planner и отвечают через TaskRead.'
                    ),
                    'requirements': [
                        'PUT принимает TaskUpdate и вызывает replace_task с title, priority и is_done.',
                        'PATCH принимает TaskPatch и передаёт только model_dump(exclude_unset=True, exclude_none=True).',
                        'TaskNotFoundError переводится в HTTP 404; неверное тело получает 422 до вызова сервиса.',
                        'Не читайте JSON, не создавайте новую задачу при отсутствующем id и не ловите общую Exception.'
                    ],
                    'hint': 'Для PATCH распакуйте отобранный словарь аргументов в существующий PlannerService. Обработчик не должен формировать список Task или писать файл.',
                    'answer': {
                        'explanation': (
                            'HTTP-обработчик связывает входную схему, метод сервиса и публичную схему ответа. FastAPI '
                            'проверяет body прежде, чем запускать функцию. Сервисное отсутствие превращается в 404, '
                            'а StorageError остаётся видимой серверной проблемой.'
                        ),
                        'steps': [
                            'Импортируйте обе входные схемы, TaskRead, HTTPException и существующий TaskNotFoundError.',
                            'Добавьте маршруты на общий адрес item и задайте response_model=TaskRead.',
                            'В PUT вызовите replace_task со всеми полями TaskUpdate.',
                            'В PATCH получите changes с exclude_unset и exclude_none и передайте его в patch_task.',
                            'Поймайте только TaskNotFoundError и верните 404.'
                        ],
                        'code': '''@app.put("/tasks/{task_id}", response_model=TaskRead)
def update_task(task_id: int, payload: TaskUpdate):
    try:
        return app.state.planner.replace_task(
            task_id,
            title=payload.title,
            priority=payload.priority,
            is_done=payload.is_done,
        )
    except TaskNotFoundError:
        raise HTTPException(status_code=404, detail="Task not found")


@app.patch("/tasks/{task_id}", response_model=TaskRead)
def patch_task_endpoint(task_id: int, payload: TaskPatch):
    changes = payload.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )
    try:
        return app.state.planner.patch_task(task_id, **changes)
    except TaskNotFoundError:
        raise HTTPException(status_code=404, detail="Task not found")''',
                        'checks': [
                            'Успешные ответы проходят через TaskRead и содержат публичные поля.',
                            'Ошибка body даёт 422, корректный запрос с неизвестным id даёт 404.',
                            'Ошибка storage не превращается в 404, а отсутствие не запускает создание Task.'
                        ]
                    }
                },
                {
                    'title': 'Докажите обновление на файле и через оба интерфейса',
                    'task': (
                        'Проверьте методы PlannerService на временном JsonStorage, затем выполните цепочку запросов через '
                        '/docs. Сравните результат с новым чтением JSON и CLI.'
                    ),
                    'requirements': [
                        'PUT меняет title, priority и is_done у существующей Task; id и tags остаются прежними после нового чтения.',
                        'Неполный PUT и PATCH с пустым или пробельным title дают 422 без изменения JSON.',
                        'После завершения Task примените PATCH только is_done=false. Другие поля сохраняются, общая статистика обновляется.',
                        'PATCH с JSON-телом {} или null в поле не меняет данные; неверный тип, например priority="high", получает 422.',
                        'Корректные PUT/PATCH к отсутствующему id дают 404 и не добавляют запись.'
                    ],
                    'hint': 'Снимите значения Task и JSON до запроса. Сверьте не только ответ, но и свежий PlannerService. Для False проверьте, что ключ остался в PATCH changes.',
                    'answer': {
                        'explanation': (
                            'HTTP-ответ показывает проекцию, но только независимое чтение подтверждает сохранение. '
                            'Сервисные тесты с tmp_path отдельно доказывают, что методы работают с доменной Task и не '
                            'зависят от API. Ошибки входа и отсутствующий id не должны изменять файл.'
                        ),
                        'steps': [
                            'В тесте создайте JsonStorage на tmp_path, сохраните одну Task с тегами и создайте PlannerService.',
                            'Проверьте PUT, затем создайте новый сервис для того же пути и сверьте id, tags и три изменённых поля.',
                            'Завершите Task и выполните PATCH только с is_done=False. Проверьте title, priority, id, tags и статистику.',
                            'Сохраните исходный текст JSON, выполните ошибки валидации и запрос неизвестного id, затем сравните файл.',
                            'В /docs повторите успешную цепочку и сверьте GET, вывод CLI и чтение после перезапуска API.'
                        ],
                        'code': '''# После PUT и повторного чтения:
assert updated.id == original.id
assert updated.tags == original.tags
assert (updated.title, updated.priority, updated.is_done) == (
    "Новый заголовок", 5, False
)

# PATCH должен сохранить явный False и остальные поля:
patch = TaskPatch(is_done=False)
assert patch.model_dump(
    exclude_unset=True, exclude_none=True
) == {"is_done": False}

# Неверный body -> 422; неизвестный id с верным body -> 404.
# В обоих случаях повторное чтение JSON совпадает с исходным.''',
                        'checks': [
                            'JSON хранит полную доменную Task, включая tags, а не TaskRead.',
                            'Новый сервис для того же пути видит успешное обновление.',
                            'После PATCH is_done=False задача открыта, а статистика отражает новое состояние.'
                        ]
                    }
                }
            ],
            'result': (
                'Существующая Task обновляется через PUT или PATCH и сохраняется в общем JSON. Идентификатор и tags '
                'не теряются, PATCH сохраняет явно переданный False, а ошибки 422 и 404 не создают и не меняют записи.'
            )
        }
    ],
    62: [
        {
            'title': 'Подключим удаление к настоящему Planner API',
            'task': (
                'Одна цепочка проводит новую Task через настоящий API и общий JSON: проверенный вход, сохранение, '
                'изменения, HTTP-удаление и подтверждение отсутствия после нового чтения.'
            ),
            'tasks': [
                {
                    'title': 'DELETE-маршрут с ответом 204',
                    'task': (
                        'В app/api.py маршрут DELETE /tasks/{task_id} вызывает app.state.planner.delete_task. '
                        'Успех возвращает пустой Response со статусом 204, а известное отсутствие задачи получает 404.'
                    ),
                    'requirements': [
                        'Маршрут задаёт статус 204 и возвращает Response без response_model и тела.',
                        'Только TaskNotFoundError переводится в HTTP 404; StorageError не скрывается.',
                        'Удаление выполняет существующий сервис, а endpoint не читает JSON и не повторяет логику.'
                    ],
                    'hint': 'Мы уже знаем, что у 204 нет тела. Посмотрим, как связать его с готовой операцией и перехватить только ожидаемое отсутствие.',
                    'answer': {
                        'explanation': (
                            'Endpoint связывает path-параметр с готовой операцией. PlannerService удаляет Task и '
                            'сохраняет оставшийся список. Response со статусом 204 подтверждает HTTP-успех без '
                            'сериализации удалённой модели. Узкий except переводит только известное отсутствие ресурса.'
                        ),
                        'steps': [
                            'Мы импортируем HTTPException, Response, status и существующий TaskNotFoundError.',
                            'Мы объявляем DELETE-маршрут для item-пути и задаём ему статус 204.',
                            'Мы вызываем delete_task через app.state.planner.',
                            'Мы переводим TaskNotFoundError в 404 и возвращаем пустой Response после успеха.'
                        ],
                        'code': '''from fastapi import HTTPException, Response, status
from app.exceptions import TaskNotFoundError


@app.delete(
    "/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_task(task_id: int):
    try:
        app.state.planner.delete_task(task_id)
    except TaskNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)''',
                        'checks': [
                            'Успех возвращает именно 204 и пустое тело.',
                            'Отсутствующая Task даёт 404.',
                            'Endpoint не импортирует JsonStorage и не повторяет сервисную операцию.'
                        ]
                    }
                },
                {
                    'title': 'Пустой успех и причины отказа',
                    'task': (
                        'Проверка различает пустой успешный ответ, корректный отсутствующий ID, неверный тип path '
                        'и сбой хранения. Запросы сохраняются в прежней Planner collection.'
                    ),
                    'requirements': [
                        'Успешный DELETE получает 204 и пустое содержимое; у ответа не вызывается json().',
                        'После удаления GET и повторный DELETE для того же ID дают 404, если между запросами не создаётся новая Task.',
                        'Неизвестный целый ID, подтверждённо отсутствующий в текущем Planner, даёт 404; текст вместо int даёт 422 до вызова сервиса.'
                    ],
                    'hint': 'Мы сравним status и content отдельно. Для 404 выберем целый ID, которого нет в актуальном GET /tasks, а не предположим знакомое число.',
                    'answer': {
                        'explanation': (
                            '204 означает, что существующая Task удалена. Повторный DELETE не удаляет её ещё раз: '
                            'сервис теперь сообщает об отсутствии, и HTTP отвечает 404. Некорректный тип останавливается '
                            'раньше endpoint с 422. StorageError не относится ни к одному из этих клиентских случаев.'
                        ),
                        'steps': [
                            'Мы удаляем существующую задачу и записываем status_code и content ответа.',
                            'Мы проверяем GET этого ID и повторяем DELETE до создания других задач.',
                            'Мы выбираем целый ID, отсутствующий в текущем GET /tasks, и проверяем 404.',
                            'Мы отправляем текст вместо целого числа в path и сравниваем статус.',
                            'Мы проверяем по коду, что StorageError не превращается в 404, не вызывая сбой специально.'
                        ],
                        'code': '''# ID берём из ответа POST
DELETE /tasks/{created_id} -> 204, content == b""
GET    /tasks/{created_id} -> 404
DELETE /tasks/{created_id} -> 404

# missing_id заранее подтверждён как отсутствующий через GET /tasks
DELETE /tasks/{missing_id} -> 404
DELETE /tasks/not-an-int -> 422

# Для 204 не вызываем response.json().''',
                        'checks': [
                            '204 не содержит TaskRead, JSON null или другого тела.',
                            'GET и повторный DELETE подтверждают отсутствие без промежуточного POST.',
                            '404, 422 и ошибка storage остаются разными ситуациями.'
                        ]
                    }
                },
                {
                    'title': 'Сохранённое удаление через общий JSON',
                    'task': (
                        'Одна открытая Task проходит POST, полный PUT, PATCH с is_done=False и DELETE. '
                        'Новый load, GET и CLI подтверждают её отсутствие и сохранность соседних записей.'
                    ),
                    'requirements': [
                        'ID берётся из ответа POST; исходные ID, tags и stats сверяются с результатом.',
                        'После POST счётчики равны N+1/O+1/D; после PUT True: N+1/O/D+1; после PATCH False: N+1/O+1/D; после DELETE: N/O/D.',
                        'Новый load того же JSON не находит Task; повторные GET и DELETE дают 404 до следующего POST. Запросы остаются в прежней Planner collection.'
                    ],
                    'hint': 'Мы сначала снимем реальное состояние CLI и создадим отдельную Task. Затем проследим тот же ID через PUT, PATCH, DELETE и свежую загрузку.',
                    'answer': {
                        'explanation': (
                            'Ответ 204 подтверждает HTTP-контракт, а новый load подтверждает постоянное состояние. '
                            'PATCH возвращает учебную Task в открытое состояние, поэтому её удаление уменьшает total и open. '
                            'После удаления исходные счётчики и соседние записи должны сохраниться.'
                        ),
                        'steps': [
                            'Мы записываем исходные total/open/done и существующие ID/tags через CLI.',
                            'Мы создаём одну открытую Task через POST и используем фактически выданный ID.',
                            'Мы выполняем PUT с is_done=True, затем PATCH только с is_done=False.',
                            'Мы удаляем эту Task и фиксируем пустой ответ 204.',
                            'Не создавая новые задачи, мы проверяем GET и повторный DELETE: оба дают 404.',
                            'Мы перечитываем тот же JSON новым PlannerService или после перезапуска и сравниваем исходные stats и соседние записи.'
                        ],
                        'code': '''# До удаления: total=N, open=O, done=D
# У учебной Task после PATCH is_done=False.

DELETE /tasks/{created_id} -> 204, body пустой
GET    /tasks/{created_id} -> 404
DELETE /tasks/{created_id} -> 404

# После нового чтения того же JSON:
total == N
open == O
done == D
# Существующие ID и tags соседних Task не изменились.''',
                        'checks': [
                            'Проверяется ID, фактически выданный POST, а не индекс списка.',
                            'Новое чтение того же JSON не находит удалённую Task.',
                            'Статистика возвращается к исходным значениям, соседние записи и tags сохранены.'
                        ]
                    }
                }
            ],
            'result': (
                'DELETE возвращает пустой 204 для существующей Task. Новый load, GET и CLI подтверждают её отсутствие; '
                'повторный запрос даёт 404, статистика возвращается к исходной, а соседние записи и их tags сохраняются.'
            )
        }
    ],
    "54.2": [
        {
            "title": "Добавить PATCH для существующей задачи",
            "task": (
                "Сервис `patch_task` и схема `TaskPatch` уже готовы. Добавьте один маршрут "
                "PATCH /tasks/{task_id} в `app/api.py`. Проверьте ответ `TaskRead`, ошибки и сохранение через новый "
                "GET и прежний CLI."
            ),
            "tasks": [
                {
                    "title": "Сохранить исходное состояние задачи",
                    "task": (
                        "До PATCH сохраните исходный снимок.\n\n"
                        "1. Получите список через `GET /tasks` и счётчики через `GET /stats`.\n"
                        "2. Найдите ту же запись по ID в API и прежнем CLI. Выберите существующую задачу с положительным ID "
                        "и `is_done=true`.\n"
                        "3. Запишите `id`, `title`, `priority`, `is_done`, `tags`, счётчики и данные одного соседа, если он есть.\n"
                        "4. Если завершённых задач нет, отметьте существующую задачу готовым PUT: задайте `is_done=true` и сохраните прежние `title` и `priority`.\n"
                        "5. Если список пуст, создайте задачу готовым POST, возьмите выданный ID и задайте `is_done=true` готовым PUT.\n\n"
                        "После подготовки снова проверьте данные. Только теперь сохраните снимок."
                    ),
                    "requirements": [
                        "ID взят из GET /tasks. Задача существует, ID положительный, is_done=true.",
                        "До PATCH записаны поля задачи, её tags и данные одного соседа, если он есть.",
                        "В снимке есть total, open, done и вывод CLI из того же хранилища.",
                        "Для подготовки использованы готовые GET, POST или PUT. Соседние записи не изменены."
                    ],
                    "result": "До PATCH сохранён снимок задачи, tags, статистики и соседа, если он есть.",
                    "hint": "GET /tasks даёт ID и поля ответа. GET /stats даёт счётчики, CLI показывает tags.",
                    "answer": {
                        "explanation": (
                            "Чтобы проверить `is_done=false`, нужна завершённая задача. Если её нет, подготовьте запись готовым PUT. "
                            "Снимок сделайте после подготовки, иначе сравнение будет неверным."
                        ),
                        "steps": [
                            "Получите список задач и счётчики через GET.",
                            "Найдите выбранный ID в API и CLI. Сохраните поля, tags и данные соседа.",
                            "Если завершённых задач нет, используйте готовый PUT и оставьте прежние title и priority.",
                            "Если список пуст, создайте одну задачу готовым POST, затем завершите её готовым PUT.",
                            "Повторите GET, /stats и CLI. Сохраните эти данные как исходный снимок."
                        ],
                        "code": '''GET /tasks?limit=50
GET /stats

# По фактическому ID найдите ту же запись в CLI.
# Сохраните id, title, priority, is_done, tags,
# total/open/done и данные одного соседа, если он есть.''',
                        "checks": [
                            "Снимок сделан после возможной подготовки и до PATCH.",
                            "API и CLI относятся к одному настроенному JSON и показывают один ID.",
                            "Исходные tags и соседние данные доступны для сравнения после изменения."
                        ]
                    }
                },
                {
                    "title": "Добавить маршрут PATCH",
                    "task": (
                        "В `app/api.py` рядом с GET добавьте один маршрут `PATCH /tasks/{task_id}`. Используйте готовые "
                        "`TaskPatch`, `TaskRead`, `Request` и помощники. Путь принимает положительный ID, тело обязательно.\n\n"
                        "Соберите `changes` через `model_dump(exclude_unset=True, exclude_none=True)`. Передайте их "
                        "существующему `patch_task` через helper и верните `TaskRead`. Начальная заготовка:\n\n"
                        "```python\n@app.patch(\"/tasks/{task_id}\", response_model=TaskRead)\n"
                        "def patch_task_endpoint(\n    request: Request,\n    task_id: Annotated[int, Path(gt=0)],\n"
                        "    payload: TaskPatch,\n):\n    # Соберите изменения, вызовите сервис через помощник и верните TaskRead.\n    ...\n```"
                    ),
                    "requirements": [
                        "Маршрут использует response_model=TaskRead, Request, Path(gt=0) и обязательный payload: TaskPatch.",
                        "changes собирается через model_dump с exclude_unset и exclude_none. Явное False сохраняется.",
                        "patch_task вызывается через _call_with_task_not_found_as_404. Ответ подготовлен через _task_read_data.",
                        "Маршрут не пишет в JSON, не добавляет DELETE и не повторяет логику сервиса."
                    ],
                    "result": "В app/api.py добавлен PATCH, который передаёт изменения готовому сервису и возвращает TaskRead.",
                    "hint": "Сверьте imports и соседний GET. Порядок такой: payload, changes, patch_task, TaskRead.",
                    "answer": {
                        "explanation": (
                            "FastAPI проверяет вход. `changes` содержит только переданные не-null поля, включая False. "
                            "Сервис меняет запись, а helper переводит отсутствие задачи в 404."
                        ),
                        "steps": [
                            "Проверьте imports и найдите соседний GET в app/api.py.",
                            "Объявите PATCH с положительным ID и обязательным TaskPatch.",
                            "Соберите changes двумя флагами. Не фильтруйте значения через if.",
                            "Вызовите patch_task через helper обработки TaskNotFoundError.",
                            "Верните результат через _task_read_data и response_model=TaskRead."
                        ],
                        "code": '''@app.patch("/tasks/{task_id}", response_model=TaskRead)
def patch_task_endpoint(
    request: Request,
    task_id: Annotated[int, Path(gt=0)],
    payload: TaskPatch,
):
    changes = payload.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )
    task = _call_with_task_not_found_as_404(
        request.app.state.planner.patch_task,
        task_id,
        **changes,
    )
    return _task_read_data(task)''',
                        "checks": [
                            "В маршруте нет чтения или записи файла и нет собственного алгоритма изменения Task.",
                            "changes сохраняет is_done=False и исключает непереданные поля и null.",
                            "Ожидаемый успешный статус равен 200, а схема ответа ограничена TaskRead."
                        ]
                    }
                },
                {
                    "title": "Проверить изменения и ошибки",
                    "task": (
                        "В прежнем HTTP-клиенте используйте ID из первого снимка. Отправьте запросы по порядку:\n\n"
                        "1. PATCH с `is_done=false`.\n"
                        "2. PATCH с `{}` и с `{\"title\": null}`.\n"
                        "3. Проверьте 422. Каждый случай отправляйте отдельно:\n"
                        "   - пустой title;\n"
                        "   - запрос без тела и тело JSON `null`;\n"
                        "   - текстовый ID, ID 0 и ID -1.\n"
                        "4. Проверьте 404:\n"
                        "   - выберите положительный ID и вызовите `GET /tasks/{candidate_id}`;\n"
                        "   - при ответе 200 выберите другой ID; при 404 проверьте PATCH с полем и с `{}`.\n\n"
                        "После запросов сверьте задачу и `GET /stats` с ожидаемым состоянием после успешного PATCH с is_done=false."
                    ),
                    "requirements": [
                        "Использован положительный ID существующей задачи из первого снимка.",
                        "PATCH с is_done=false возвращает 200 и четыре поля TaskRead. total прежний, open вырос на 1, done уменьшился на 1.",
                        "Пустой объект и поле `title: null` не меняют задачу и счётчики. False не теряется.",
                        "Пустой title, отсутствие тела, JSON null, текстовый ID, 0 и -1 дают 422.",
                        "Перед проверкой 404 GET подтвердил, что положительный ID отсутствует. PATCH с полем и с {} для него возвращают 404.",
                        "После ошибочных запросов задача и счётчики не изменились. Соседи совпадают с исходным снимком."
                    ],
                    "result": "Проверены 200, no-op, 422 и 404. Ошибочные запросы не изменили данные.",
                    "hint": "Изменяйте задачу из снимка. Для 404 сначала убедитесь через GET, что положительный ID отсутствует.",
                    "answer": {
                        "explanation": (
                            "422 означает, что путь или тело не прошли проверку. 404 означает, что положительный ID "
                            "прошёл проверку, но задачи нет. Пустой PATCH всё равно ищет задачу."
                        ),
                        "steps": [
                            "Используйте ID задачи и исходный снимок из первой карточки.",
                            "Отправьте PATCH с is_done=false. Проверьте статус, четыре поля ответа и счётчики.",
                            "Отправьте PATCH с {} и с title=null. После каждого запроса проверьте задачу и статистику.",
                            "Отправьте каждый некорректный запрос отдельно. Для каждого ожидайте 422.",
                            "Для проверки 404 сначала вызовите GET для положительного ID.",
                            "При ответе 200 возьмите другой ID. При 404 отправьте два PATCH и проверьте оба ответа.",
                            "После ошибок сверьте данные с состоянием после успешного PATCH. Соседа сравните с исходным снимком."
                        ],
                        "code": '''PATCH /tasks/{existing_id}
Content-Type: application/json

{"is_done": false}

# Ожидаем 200 и TaskRead:
# id, title, priority, is_done

# {} и {"title": null} для существующей задачи не меняют поля.
# Пустое тело, JSON null, task_id=0, task_id=-1 и текстовый ID дают 422.
# Сначала подтвердите, что кандидат отсутствует:
# GET /tasks/{candidate_id} -> 404
# Затем PATCH этого ID с полем и с {} -> 404.''',
                        "checks": [
                            "Положительный контрольный ID проверен отдельным GET `/tasks/{task_id}`; непроверенное предположение не используется.",
                            "False, пустой объект и null-поле различаются ожидаемым результатом.",
                            "422 относится к неверному входу, 404 к корректному, но отсутствующему ID даже для пустого объекта."
                        ]
                    }
                },
                {
                    "title": "Подтвердить сохранение и целостность данных",
                    "task": (
                        "После успешного PATCH перечитайте тот же ID через GET и прежний CLI с тем же JSON. "
                        "Сравните новое is_done, остальные поля, tags и данные соседа с исходным снимком."
                    ),
                    "requirements": [
                        "Использован снимок, сделанный до PATCH.",
                        "После PATCH задача прочитана через GET и CLI из того же JSON.",
                        "Новое значение сохранено. Остальные поля, tags и данные соседа не изменились.",
                        "Существующий JSON не удалён, не сброшен и не переписан вручную."
                    ],
                    "result": "GET и CLI показывают is_done=false. Остальные поля, tags и сосед совпадают со снимком.",
                    "hint": "Ответ PATCH показывает TaskRead. Новый GET и CLI показывают сохранённые данные.",
                    "answer": {
                        "explanation": (
                            "TaskRead не показывает tags. Проверьте полную запись через CLI после нового GET, чтобы "
                            "подтвердить и изменение, и сохранность остальных данных."
                        ),
                        "steps": [
                            "Возьмите исходный снимок из первой карточки.",
                            "После PATCH прочитайте ту же задачу через GET и CLI.",
                            "Сравните статус, остальные поля, tags и соседа со снимком.",
                            "Убедитесь, что API и CLI читают один настроенный JSON."
                        ],
                        "code": '''# После PATCH и отдельного чтения:
assert response.status_code == 200
assert saved_task["is_done"] is False
assert saved_task["title"] == original_title
assert saved_task["priority"] == original_priority
assert full_record["tags"] == original_tags
assert neighbor_after == neighbor_before

# Сверить full_record и соседнюю запись прежним CLI,
# который читает тот же настроенный JSON.''',
                        "checks": [
                            "HTTP содержит только поля TaskRead и подтверждает успешное изменение.",
                            "GET и CLI подтверждают, что новое значение сохранилось.",
                            "Полная запись сохраняет tags, а соседняя задача не изменилась."
                        ]
                    }
                }
            ],
            "result": (
                "PATCH обновляет существующую задачу и возвращает TaskRead. Неверный ввод даёт 422, "
                "отсутствующий ID даёт 404. Новый GET и CLI подтверждают сохранение; tags и соседние данные сохранены."
            )
        }
    ],
}


MANUAL_PRACTICE[55] = [
    {
        "title": "Добавим DELETE и проверим сохранённое состояние",
        "task": (
            "PlannerService уже удаляет Task и сохраняет её через общий JsonStorage. Добавьте только HTTP DELETE. "
            "Работайте в Postman Local и не очищайте рабочий JSON."
        ),
        "tasks": [
            {
                "title": "Снимем исходные данные и создадим Task",
                "task": (
                    "До изменений сохраните ID из GET /tasks, значения GET /stats и полные старые записи с tags через CLI "
                    "или настроенный JsonStorage. Затем создайте одну Task через POST /tasks и запишите id из ответа."
                ),
                "requirements": [
                    "До POST сохранены все фактические ID из GET /tasks и значения GET /stats.",
                    "Старые записи и tags прочитаны через CLI или настроенный JsonStorage. Файл вручную не менялся.",
                    "POST /tasks отправлен с Content-Type: application/json и телом {\"title\": \"Проверка DELETE\", \"priority\": 3}; ожидаемый ответ: 201.",
                    "ID взят из ответа POST. Созданная Task открыта: is_done равно false.",
                    "Создана одна тестовая Task; ID не угадан, старые записи не изменились."
                ],
                "result": "Сохранены исходные ID, stats, записи и tags; создана одна открытая Task с фактическим id.",
                "hint": "Сначала снимите исходные данные. Ответ API может не содержать tags. Сверьте их через CLI или тот же JsonStorage. Не угадывайте id.",
                "answer": {
                    "explanation": "Одна тестовая Task даёт цель удаления. Снимок до POST покажет, сохранились ли после удаления старые записи и stats. ID берите из ответа сервиса.",
                    "steps": [
                        "Выполните GET /tasks и GET /stats. Сохраните ID и значения статистики.",
                        "Через прежний CLI или настроенный JsonStorage сохраните старые записи и tags.",
                        "Отправьте POST /tasks с указанным JSON. Проверьте ответ 201.",
                        "Сохраните id из ответа и проверьте is_done=false. До проверок 404 больше Task не создавайте."
                    ],
                    "code": '''# Сначала снимите исходное состояние:
GET /tasks
GET /stats

# Создайте одну Task:
POST /tasks
Content-Type: application/json

{"title": "Проверка DELETE", "priority": 3}

# Сохраните фактический id из ответа 201.
# Старые записи и tags сверьте прежним CLI или JsonStorage.''',
                    "checks": [
                        "ID и stats записаны до POST.",
                        "Старые записи и tags прочитаны без изменения файла.",
                        "Создана одна открытая Task; её id сохранён из ответа."
                    ]
                }
            },
            {
                "title": "Добавим маршрут DELETE",
                "task": (
                    "В app/api.py добавьте DELETE /tasks/{task_id} по образцу GET `/tasks/{task_id}`. Используйте общий Planner и готовый "
                    "helper. После успешного удаления верните пустой 204, затем удалите Task по id из первой карточки."
                ),
                "requirements": [
                    "Маршрут принимает Request и task_id: Annotated[int, Path(gt=0)].",
                    "Вызовите request.app.state.planner.delete_task через _call_with_task_not_found_as_404.",
                    "После успеха верните Response(status_code=204) без тела и без response_model.",
                    "Не ищите Task и не меняйте JsonStorage в handler.",
                    "StorageError не становится 404. Новый helper, метод сервиса и схема не нужны."
                ],
                "result": "DELETE удаляет одну Task через общий Planner и возвращает пустой 204.",
                "hint": "Возьмите Request и Path(gt=0) из GET `/tasks/{task_id}`. Передайте метод сервиса helper и верните Response после успеха.",
                "answer": {
                    "explanation": "FastAPI проверяет положительный ID до handler. Helper переводит только TaskNotFoundError в 404. Сервис сохраняет удаление, а Response возвращает 204 без тела.",
                    "steps": [
                        "Добавьте Response к импорту из fastapi. Request, Annotated и Path уже есть для GET `/tasks/{task_id}`.",
                        "Объявите DELETE /tasks/{task_id} с тем же Path(gt=0).",
                        "Вызовите общий planner.delete_task через существующий helper.",
                        "После успеха верните Response(status_code=204).",
                        "В Postman отправьте DELETE для фактического id. Проверьте status и пустой content."
                    ],
                    "code": '''from fastapi import Response  # добавьте к существующим импортам


@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(request: Request, task_id: Annotated[int, Path(gt=0)]) -> Response:
    _call_with_task_not_found_as_404(
        request.app.state.planner.delete_task,
        task_id,
    )
    return Response(status_code=204)''',
                    "checks": [
                        "Удаление вызывает общий Planner через существующий helper.",
                        "Первый DELETE возвращает 204 и пустой content.",
                        "Нет response_model, нового helper или прямого изменения JSON."
                    ]
                }
            },
            {
                "title": "Проверим 204, 404 и 422",
                "task": (
                    "Для того же id выполните GET и повторный DELETE. Затем проверьте текст, ноль и отрицательное число "
                    "в path. Не создавайте новую Task до этих проверок. Убедитесь, что StorageError не становится 404."
                ),
                "requirements": [
                    "GET /tasks/{удалённый_id} возвращает 404.",
                    "Повторный DELETE того же id возвращает 404. До этого POST не выполнялся.",
                    "/tasks/not-an-id, /tasks/0 и /tasks/-1 возвращают 422 до вызова сервиса.",
                    "Helper обрабатывает TaskNotFoundError, но не StorageError.",
                    "Первый 204 проверен отдельно от последующих 404."
                ],
                "result": "Первый DELETE даёт пустой 204; повторные запросы дают 404; неверный path даёт 422. StorageError не маскируется.",
                "hint": "До проверки 404 не выполняйте POST. Сверьте status каждого запроса и посмотрите, какое исключение ловит helper.",
                "answer": {
                    "explanation": "Первый DELETE удаляет Task. Следующий GET и повторный DELETE подтверждают её отсутствие. Path(gt=0) отклоняет текст, ноль и отрицательный ID до вызова сервиса.",
                    "steps": [
                        "Для того же id выполните GET: ожидается 404.",
                        "Не выполняя POST, повторите DELETE для этого id: ожидается 404.",
                        "Проверьте текстовый, нулевой и отрицательный ID: ожидается 422.",
                        "Убедитесь, что helper ловит только TaskNotFoundError. StorageError остаётся серверной ошибкой.",
                        "Сравните первый 204 с последующими 404: это ответы на разные запросы."
                    ],
                    "code": '''# После первого успешного DELETE:
GET    /tasks/{фактический_id} -> 404
DELETE /tasks/{фактический_id} -> 404

# Path(gt=0) останавливает неверный вход:
GET /tasks/not-an-id -> 422
GET /tasks/0         -> 422
GET /tasks/-1        -> 422

# Helper перехватывает TaskNotFoundError,
# но не StorageError.''',
                    "checks": [
                        "Первый DELETE вернул 204; GET и повторный DELETE вернули 404.",
                        "Текст, ноль и отрицательный ID вернули 422 до вызова PlannerService.",
                        "StorageError не превратился в 404."
                    ]
                }
            },
            {
                "title": "Проверим данные после перезапуска",
                "task": (
                    "После проверок перезапустите приложение обычным способом. Через API и прежний CLI проверьте удалённый "
                    "id и старые записи. Сравните tags и GET /stats с исходными данными до POST."
                ),
                "requirements": [
                    "После перезапуска GET по удалённому id возвращает 404; тестовой Task нет в списке и CLI.",
                    "Старые Task и tags совпадают с исходным снимком настроенного JsonStorage.",
                    "GET /stats совпадает с исходными значениями до POST по тем же полям.",
                    "GET /tasks, GET /stats и CLI продолжают работать. JSON не очищался и не менялся вручную.",
                    "API и CLI используют один путь JsonStorage из конфигурации."
                ],
                "result": "Удалённая Task отсутствует после перезапуска; старые записи и tags сохранены, stats совпадают с исходным снимком.",
                "hint": "TaskRead может не показывать tags. Прочитайте их через прежний CLI или тот же JsonStorage. Сравните stats до POST и после DELETE.",
                "answer": {
                    "explanation": "Перезапуск загружает общий JSON заново. Сравните его с исходным снимком: тестовая Task удалена, старые записи и tags не изменились, stats вернулись к исходным значениям.",
                    "steps": [
                        "Обычным способом перезапустите API. Не очищайте рабочие данные.",
                        "Проверьте удалённый ID и список через GET: Task нет, ответ по ID равен 404.",
                        "Через CLI или тот же JsonStorage сравните старые Task и tags с исходным снимком.",
                        "Сравните те же поля GET /stats с исходными значениями до POST.",
                        "Убедитесь, что API и CLI используют один настроенный путь и продолжают работать."
                    ],
                    "code": '''# После удаления и обычного перезапуска:
GET /tasks/{фактический_id} -> 404
GET /tasks                  -> прежние ID, без тестовой Task
GET /stats                  -> исходные значения до POST

# Через прежний CLI или тот же JsonStorage:
# тестового id нет, старые записи и tags совпадают
# со снимком до POST.''',
                    "checks": [
                        "После перезапуска удалённой записи нет.",
                        "Старые записи, tags и stats совпадают с исходным снимком.",
                        "API и CLI читают общий JsonStorage и работают."
                    ]
                }
            }
        ],
        "result": (
            "HTTP DELETE удаляет одну Task через общий Planner и возвращает пустой 204. Неверный path даёт 422, "
            "отсутствующий id даёт 404, StorageError не маскируется. После повторного чтения тестовая запись отсутствует, "
            "прежние Task и tags сохранены, а stats совпадают с исходным состоянием до POST."
        )
    }
]

"""Учебная практика блока. Редактируйте задания здесь."""

from __future__ import annotations

from typing import Any


MANUAL_PRACTICE: dict[int, list[dict[str, Any]]] = {
    63: [
        {
            'title': 'Проверьте готовый Planner API через TestClient',
            'task': (
                'tests/conftest.py создаёт отдельный JsonStorage на каждый тест и временно устанавливает его Planner в app.state.planner. '
                'tests/test_api.py проверяет все восемь HTTP-операций через настоящее приложение. '
                'Один сценарий сохраняет состояние между несколькими запросами, а рабочий data/tasks.json не меняется.'
            ),
            'tasks': [
                {
                    'title': 'Изолируйте сервис и клиент',
                    'task': (
                        'Function-scoped fixtures собирают PlannerService на tmp_path, устанавливают его для app и закрывают TestClient до восстановления прежнего сервиса.'
                    ),
                    'requirements': [
                        'Тестовый JsonStorage получает путь внутри tmp_path и собирается через прежний build_service.',
                        'Fixture клиента сохраняет app.state.planner и восстанавливает его в finally после закрытия клиента.',
                        'Каждая функция получает отдельный файл; запросы внутри одной функции используют общий сервис.',
                    ],
                    'hint': 'Сначала сохраним выбранный сервис, затем временно установим новый. Вложенный контекст TestClient должен завершиться до восстановления.',
                    'answer': {
                        'explanation': (
                            'tmp_path отделяет файл каждого теста от рабочего Planner. Fixture клиента меняет только выбранный сервис приложения и гарантирует его восстановление; очистка после каждого HTTP-запроса не нужна.'
                        ),
                        'steps': [
                            'Собираем PlannerService с JsonStorage по пути tasks.json внутри tmp_path.',
                            'Сохраняем app.state.planner до подмены тестовым сервисом.',
                            'Открываем TestClient после установки сервиса и закрываем его до teardown.',
                            'В finally возвращаем прежний сервис даже при исключении в тесте.',
                        ],
                        'code': """# tests/conftest.py
import pytest
from fastapi.testclient import TestClient

from app.api import app
from app.main import build_service
from app.storage import JsonStorage


@pytest.fixture
def planner_service(tmp_path):
    return build_service(JsonStorage(tmp_path / "tasks.json"))


@pytest.fixture
def client(planner_service):
    previous_service = app.state.planner
    app.state.planner = planner_service
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.state.planner = previous_service""",
                        'checks': [
                            'Тестовый путь находится под tmp_path, а не в data/tasks.json.',
                            'TestClient закрывается до восстановления исходного сервиса.',
                        ],
                    },
                },
                {
                    'title': 'Проверьте восемь HTTP-операций',
                    'task': (
                        'tests/test_api.py проверяет health, список, stats, чтение элемента, создание, PUT, PATCH и удаление. '
                        'Отдельная проверка неверного POST подтверждает, что отказ не меняет данные.'
                    ),
                    'requirements': [
                        'Создание проверяется по 201, четырём полям ответа и последующему GET того же ID.',
                        'PUT и PATCH проверяются отдельно; PATCH применяет явный false, DELETE отвечает пустым 204.',
                        'Каждый тест подготавливает своё состояние и не использует ID из другой функции.',
                    ],
                    'hint': 'Создавайте задачи через client и сохраняйте ID из POST-ответа. Для отказа сравните список и stats до запроса и после него.',
                    'answer': {
                        'explanation': (
                            'Функции независимы, потому что fixture сервиса создаёт новый файл. Запросы одной функции используют общий client, поэтому создание можно проверить последующим чтением.'
                        ),
                        'steps': [
                            'Проверяем начальные health, пустой список и stats на свежем сервисе.',
                            'Создаём задачу и используем серверный ID для GET, полного PUT и частичного PATCH.',
                            'Проверяем пустое тело DELETE через response.content и отсутствие ресурса через GET.',
                            'После неверного POST повторно читаем список и stats и сравниваем их с исходными.',
                            'Запускаем тесты вместе, отдельно и в ином порядке.',
                        ],
                        'code': """# tests/test_api.py
def test_health_and_empty_state(client):
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json() == {"status": "ok"}
    assert client.get("/tasks").json() == []
    assert client.get("/stats").json() == {"total": 0, "open": 0, "done": 0}


def test_create_then_read(client):
    response = client.post("/tasks", json={"title": "Read", "priority": 2})
    assert response.status_code == 201
    task = response.json()
    assert set(task) == {"id", "title", "priority", "is_done"}
    assert task["is_done"] is False
    assert client.get(f"/tasks/{task['id']}").json() == task


def test_put_then_patch_false(client):
    task_id = client.post("/tasks", json={"title": "Draft", "priority": 1}).json()["id"]
    path = f"/tasks/{task_id}"
    put = client.put(path, json={"title": "Review", "priority": 4, "is_done": True})
    assert put.status_code == 200
    assert put.json()["id"] == task_id
    patch = client.patch(path, json={"is_done": False})
    assert patch.status_code == 200
    assert patch.json()["is_done"] is False
    assert patch.json()["title"] == "Review"


def test_delete_is_empty_and_item_becomes_missing(client):
    task_id = client.post("/tasks", json={"title": "Temporary", "priority": 1}).json()["id"]
    response = client.delete(f"/tasks/{task_id}")
    assert response.status_code == 204
    assert response.content == b""
    assert client.get(f"/tasks/{task_id}").status_code == 404


def test_invalid_post_does_not_change_state(client):
    before_tasks = client.get("/tasks").json()
    before_stats = client.get("/stats").json()
    response = client.post("/tasks", json={"title": "   ", "priority": 2})
    assert response.status_code == 422
    assert client.get("/tasks").json() == before_tasks
    assert client.get("/stats").json() == before_stats""",
                        'checks': [
                            'Все восемь маршрутов проверяются по их публичным ответам.',
                            'GET и DELETE отсутствующего ID дают 404; неверное тело POST даёт 422.',
                            'После отказа список и общая статистика совпадают с исходными значениями.',
                        ],
                    },
                },
            ],
            'result': 'Восемь HTTP-операций проверяются через TestClient; каждый тест использует отдельный временный JSON, а запросы одного сценария сохраняют общее состояние.',
        }
    ],
    64: [
        {
            'title': 'Перенесите tasks-маршруты под защитой тестов',
            'task': (
                'Шесть готовых handlers находятся в routers/tasks.py и используют прежние схемы и PlannerService. '
                'app/api.py подключает router один раз и сохраняет health и stats. '
                'TestClient и сохранённые запросы подтверждают те же пути, ответы и состояние.'
            ),
            'tasks': [
                {
                    'title': 'Выделите и подключите router',
                    'task': (
                        'APIRouter группирует шесть операций ресурса tasks. Публичный collection path остаётся /tasks, а item path остаётся /tasks/{task_id}.'
                    ),
                    'requirements': [
                        'Общий prefix задан один раз; для collection используются локальные пути "", не "/".',
                        'Router получает текущий Planner через request.app.state.planner и не импортирует app из api.py.',
                        'Не остаётся дублирующих method/path; health и stats продолжают регистрироваться в app/api.py.',
                    ],
                    'hint': 'Сначала перенесём один handler и повторим его тест. Тела готовых операций можно оставить без изменений, если они уже используют app.state.planner и нужные схемы.',
                    'answer': {
                        'explanation': (
                            'APIRouter меняет регистрацию HTTP-функций, но не предметные операции. Prefix и локальный путь складываются в прежний адрес, а include_router делает группу частью приложения.'
                        ),
                        'steps': [
                            'Создаём routers/tasks.py с APIRouter(prefix="/tasks", tags=["tasks"]).',
                            'Переносим шесть готовых обработчиков по одному и удаляем прежнюю регистрацию каждого.',
                            'Для item-handler получаем выбранный Planner из request.app.state.planner; схемы и обработку TaskNotFoundError сохраняем.',
                            'В app/api.py подключаем router ровно один раз, оставляя health и stats на прежнем месте.',
                            'После каждого переноса повторяем соответствующий TestClient-запрос без follow_redirects.',
                        ],
                        'code': """# app/routers/tasks.py
from fastapi import APIRouter, HTTPException, Request

from app.exceptions import TaskNotFoundError
from app.schemas import TaskRead

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: int, request: Request):
    try:
        return request.app.state.planner.get_task(task_id)
    except TaskNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Task not found") from exc


# Готовые POST, PUT, PATCH, DELETE и collection GET
# переносятся сюда с прежними телами и схемами.


# app/api.py
from app.routers.tasks import router as tasks_router

app.include_router(tasks_router)""",
                        'checks': [
                            'GET /tasks и /tasks/{task_id} сохраняют точные пути без redirect.',
                            'Все шесть tasks handlers доступны один раз, а health и stats остаются в app/api.py.',
                            'Схемы, статусы, вызовы сервиса и наблюдаемое состояние совпадают с прежними тестами.',
                        ],
                    },
                },
            ],
            'result': 'Шесть существующих tasks-маршрутов подключены через APIRouter, сохраняют прежний HTTP-договор и проходят защищающие их тесты.',
        }
    ],
    65: [
        {
            'title': 'Проверьте границы действующего API',
            'task': (
                'Тесты tests/test_contract.py подтверждают поведение существующих маршрутов на допустимых и ошибочных '
                'входах. Они запускаются на отдельном JsonStorage для каждого теста, проверяют ответ и фактическое '
                'состояние Planner после отказа. Пути, схемы, CLI, сервис и рабочий JSON остаются прежними.'
            ),
            'tasks': [
                {
                    'title': 'Матрица body и path',
                    'task': (
                        'Проверки создания различают допустимые границы title и priority, пустое значение и значение '
                        'за пределом. Корректный отсутствующий id даёт 404, а неразбираемый path id даёт 422.'
                    ),
                    'requirements': [
                        'Для title проверены пустая строка, пробелы, длины 1, 120 и 121; пробелы по краям очищаются до проверки длины.',
                        'Для priority проверены 1, 5, 0, 6 и нечисловая строка без требования strict-конвертации.',
                        'Успех POST проверяет TaskRead и серверный is_done=False; ошибки проверяются по статусу и смысловой части loc.',
                        'Для отсутствующего integer id GET/PUT/PATCH/DELETE дают 404; некорректный path id даёт 422.',
                    ],
                    'hint': (
                        'Оставьте остальные поля допустимыми и меняйте только одно условие. Для path отдельно создайте одну задачу и возьмите отсутствующий id рядом с выданным.'
                    ),
                    'answer': {
                        'explanation': (
                            'Параметризация повторяет одну проверку для набора входов. Действительный POST возвращает TaskRead, '
                            'а ошибки распознаются по статусу и полю loc. Целочисленное отсутствие не смешивается с неверным path.'
                        ),
                        'steps': [
                            'Сначала проверяем title на длинах до и после strip, включая обе допустимые границы.',
                            'Затем проверяем priority с корректным title и не фиксируем strict-конвертацию числовых строк.',
                            'Для path создаём запись и вычисляем отсутствующий id из настоящего ответа.',
                            'Сверяем статус и поле loc, не фиксируя полный текст сообщения Pydantic.',
                        ],
                        'code': """@pytest.mark.parametrize(
    ("title", "expected_status"),
    [
        ("", 422),
        ("   ", 422),
        ("A", 201),
        ("A" * 120, 201),
        ("A" * 121, 422),
        (" " + "A" * 120 + " ", 201),
    ],
)
def test_title_boundaries(client, title, expected_status):
    response = client.post(
        "/tasks",
        json={"title": title, "priority": 1},
    )
    assert response.status_code == expected_status
    if expected_status == 201:
        assert set(response.json()) == {"id", "title", "priority", "is_done"}
        assert response.json()["title"] == title.strip()
        assert response.json()["is_done"] is False
    else:
        assert response.json()["detail"][0]["loc"][-1] == "title"


@pytest.mark.parametrize(
    ("priority", "expected_status"),
    [(1, 201), (5, 201), (0, 422), (6, 422), ("high", 422)],
)
def test_priority_boundaries(client, priority, expected_status):
    response = client.post(
        "/tasks",
        json={"title": "Read a book", "priority": priority},
    )
    assert response.status_code == expected_status
    if expected_status == 422:
        assert response.json()["detail"][0]["loc"][-1] == "priority"


def test_invalid_and_missing_path_are_different(client):
    present = client.post(
        "/tasks",
        json={"title": "Read a book", "priority": 1},
    ).json()
    missing_id = present["id"] + 1

    invalid_path = client.get("/tasks/not-an-int")
    assert invalid_path.status_code == 422
    assert invalid_path.json()["detail"][0]["loc"][-1] == "task_id"
    assert client.get(f"/tasks/{missing_id}").status_code == 404

    body = {"title": "Updated", "priority": 2, "is_done": False}
    assert client.put(f"/tasks/{missing_id}", json=body).status_code == 404
    assert client.patch(f"/tasks/{missing_id}", json={"is_done": False}).status_code == 404
    assert client.delete(f"/tasks/{missing_id}").status_code == 404""",
                        'checks': [
                            'Пробелы по краям удаляются до проверки длины.',
                            'Отсутствующий числовой id и неразбираемый path id дают разные статусы.',
                        ],
                    },
                },
                {
                    'title': 'PUT, PATCH и сохранность данных',
                    'task': (
                        'Невалидный POST, PUT или PATCH отвечает 422 без частичного изменения. Полный PUT сохраняет id, '
                        'PATCH различает пропуск, null, пустое тело и явный false.'
                    ),
                    'requirements': [
                        'После отказа сравниваются полная TaskRead и stats, а не только общее число записей.',
                        'PUT требует title, priority и is_done; PATCH с пропуском или null не меняет поле, а явный false применяется.',
                        'После каждого успешного PUT/PATCH запись проверяется повторным GET.',
                    ],
                    'hint': (
                        'Подготовьте запись и сохраните её перед ошибочным запросом. Затем проверяйте поля через новый GET, а не только status.'
                    ),
                    'answer': {
                        'explanation': (
                            'Мы сначала сравниваем состояние после каждого отказа. Затем успешный PUT подтверждает полную замену '
                            'с прежним id, а пустой, null и false PATCH показывают разницу между пропуском и явным значением.'
                        ),
                        'steps': [
                            'Создаём задачу настоящим POST и фиксируем TaskRead и stats.',
                            'Отправляем неверные POST, неполный PUT и неверный PATCH; после каждого повторно читаем состояние.',
                            'Делаем полный PUT и проверяем неизменность id.',
                            'Сравниваем пустой PATCH, PATCH с null и PATCH с false по ответу и повторному GET.',
                        ],
                        'code': """created = client.post(
    "/tasks",
    json={"title": "Read a book", "priority": 2},
).json()
path = f"/tasks/{created['id']}"
before = client.get(path).json()
stats_before = client.get("/stats").json()

responses = [
    client.post("/tasks", json={"title": "", "priority": 1}),
    client.put(path, json={"title": "Incomplete"}),
    client.patch(path, json={"title": ""}),
]
assert [response.status_code for response in responses] == [422, 422, 422]
assert client.get(path).json() == before
assert client.get("/stats").json() == stats_before

replacement = {"title": "Read twice", "priority": 3, "is_done": True}
put_response = client.put(path, json=replacement)
assert put_response.status_code == 200
assert put_response.json()["id"] == created["id"]
saved = client.get(path).json()
assert saved == put_response.json()

for payload in ({}, {"title": None}):
    response = client.patch(path, json=payload)
    assert response.status_code == 200
    assert client.get(path).json() == saved

false_response = client.patch(path, json={"is_done": False})
assert false_response.status_code == 200
assert false_response.json()["is_done"] is False
assert client.get(path).json()["title"] == saved["title"]
assert client.get(path).json()["priority"] == saved["priority"]""",
                        'checks': [
                            'Три ошибочных запроса не меняют запись и stats.',
                            'Успешный PUT оставляет id прежним и сохраняется после отдельного GET.',
                            'PATCH с false меняет is_done, но сохраняет title и priority.',
                        ],
                    },
                },
                {
                    'title': 'Query и OpenAPI описывают тот же договор',
                    'task': (
                        'GET /tasks применяет filter, сортировку по id и limit в заданном порядке; stats считает весь источник. '
                        'OpenAPI отражает обязательные поля схем и успешные статусы.'
                    ),
                    'requirements': [
                        'Проверены defaults is_done=None, sort_desc=False, limit=10; оба значения is_done и sort_desc.',
                        'Проверены допустимые limit 1 и 50, а также 0, 51 и нечисловое значение.',
                        'Ожидаемые id берутся из ответов текущего TestClient; query не мутирует список и не меняет общую stats.',
                        'TaskCreate требует title/priority, TaskUpdate требует три поля, TaskRead четыре поля, у TaskPatch нет required-полей.',
                    ],
                    'hint': (
                        'Создайте в одном тесте больше десяти задач, одну отметьте выполненной и возьмите ожидаемый порядок из сохранённых ответов.'
                    ),
                    'answer': {
                        'explanation': (
                            'Созданные этим тестом данные показывают defaults, filter, sort и limit без предположений о фиксированных id. '
                            'Отдельно проверяются неизменность источника, stats и важные поля OpenAPI.'
                        ),
                        'steps': [
                            'Создаём одиннадцать задач и завершённой делаем последнюю запись.',
                            'Без query проверяем сортировку по возрастанию и лимит по умолчанию 10.',
                            'С params проверяем фильтр, оба направления сортировки и границы limit.',
                            'Сверяем stats до и после чтения, затем required-поля схем и успешные статусы OpenAPI.',
                        ],
                        'code': """records = []
for index in range(11):
    response = client.post(
        "/tasks",
        json={"title": f"task {index}", "priority": 1},
    )
    assert response.status_code == 201
    records.append(response.json())

done = records[-1]
done_response = client.put(
    f"/tasks/{done['id']}",
    json={"title": done["title"], "priority": done["priority"], "is_done": True},
)
assert done_response.status_code == 200

all_ids = sorted(record["id"] for record in records)
stats_before = client.get("/stats").json()
default_page = client.get("/tasks").json()
assert [task["id"] for task in default_page] == all_ids[:10]

open_ids = [record["id"] for record in records[:-1]]
ascending = client.get(
    "/tasks",
    params={"is_done": False, "sort_desc": False, "limit": 50},
).json()
assert [task["id"] for task in ascending] == sorted(open_ids)

descending = client.get(
    "/tasks",
    params={"is_done": False, "sort_desc": True, "limit": 1},
).json()
assert [task["id"] for task in descending] == sorted(open_ids, reverse=True)[:1]

completed = client.get(
    "/tasks",
    params={"is_done": True, "sort_desc": False, "limit": 50},
).json()
assert [task["id"] for task in completed] == [done["id"]]

for limit in (1, 50):
    assert client.get("/tasks", params={"limit": limit}).status_code == 200
for limit in (0, 51, "many"):
    response = client.get("/tasks", params={"limit": limit})
    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"][-1] == "limit"

assert client.get("/stats").json() == stats_before
all_after = client.get("/tasks", params={"limit": 50}).json()
assert [task["id"] for task in all_after] == all_ids

document = client.get("/openapi.json").json()
schemas = document["components"]["schemas"]
assert set(schemas["TaskCreate"]["required"]) == {"title", "priority"}
assert set(schemas["TaskUpdate"]["required"]) == {"title", "priority", "is_done"}
assert set(schemas["TaskRead"]["required"]) == {"id", "title", "priority", "is_done"}
assert schemas["TaskPatch"].get("required", []) == []
assert "201" in document["paths"]["/tasks"]["post"]["responses"]
assert "204" in document["paths"]["/tasks/{task_id}"]["delete"]["responses"]""",
                        'checks': [
                            'Запрос без параметров возвращает первые десять id по возрастанию.',
                            'Фильтр, оба направления сортировки и limit совпадают с ожидаемыми id.',
                            'Stats и записи сохраняют исходное состояние после query.',
                            'OpenAPI сообщает нужные required-поля и коды успешного POST/DELETE.',
                        ],
                    },
                },
            ],
            'result': (
                'tests/test_contract.py проходит отдельно, вместе и в другом порядке; границы, отсутствие ресурса, '
                'сохранность состояния, query и OpenAPI подтверждают прежний HTTP-договор, а рабочий JSON не меняется.'
            ),
        },
    ],
    66: [{
        'title': 'Проверьте прикладное ядро и хранилище',
        'task': 'Сервисные проверки используют настоящий JsonStorage с отдельным временным путём для каждой тестовой функции. Они вызывают существующий PlannerService напрямую и подтверждают чтение без записи, полное сохранение изменений и отсутствие дублирующих правил между API, CLI и сервисом.',
        'tasks': [
            {
                'title': 'Проверьте создание и правило id',
                'task': 'Тесты PlannerService подтверждают создание задачи на пустом хранилище и в наборе с разрывами между id. Новая Task получает серверный id, is_done=False и полный доменный формат. Повторный сервис читает созданную запись из того же временного файла.',
                'requirements': [
                    'Каждая тестовая функция использует отдельный путь в tmp_path и настоящий JsonStorage через build_service.',
                    'Пустое хранилище даёт id 1, а для существующих id 2 и 7 следующая задача получает id 8.',
                    'Проверяются серверные is_done и tags, а результат подтверждается новым сервисом с тем же путём.'
                ],
                'hint': 'Подготовим один JsonStorage без записей и другой с id 2 и 7. Не задаём id в add_task и не подменяем хранилище списком.',
                'answer': {
                    'explanation': 'Точка сборки получает тестовый JsonStorage вместо рабочего файла. add_task применяет действующее правило max текущих id + 1, а новый экземпляр сервиса проверяет сохранённую Task по тому же пути.',
                    'steps': [
                        'Создадим отдельные empty.json и gapped.json внутри tmp_path.',
                        'Первую задачу добавим в пустой Planner и подтвердим id 1.',
                        'Во второе хранилище запишем Task с id 2 и 7, затем добавим новую задачу через существующий add_task.',
                        'Создадим сервис для прежнего gapped.json и проверим последний сохранённый объект.'
                    ],
                    'code': '''from app.main import build_service
from app.models import Task
from app.storage import JsonStorage


def test_add_task_uses_persisted_id_rule(tmp_path):
    empty_path = tmp_path / "empty.json"
    empty = build_service(JsonStorage(empty_path))
    first = empty.add_task("Проверить id", priority=3)

    assert first.id == 1
    assert first.is_done is False
    assert first.tags == []

    gapped_path = tmp_path / "gapped.json"
    JsonStorage(gapped_path).save([
        Task(2, "CLI", 2, tags=["terminal"]),
        Task(7, "HTTP", 4, is_done=True, tags=["api"]),
    ])
    service = build_service(JsonStorage(gapped_path))
    created = service.add_task("TestClient", priority=3)

    assert created.id == 8
    loaded = build_service(JsonStorage(gapped_path)).list_tasks()
    assert loaded[-1] == created''',
                    'checks': [
                        'Пустой и непустой случаи не читают рабочий data/tasks.json.',
                        'Новая задача получает ожидаемые серверные значения и остаётся полной доменной Task.',
                        'Создание видно после загрузки того же JSON новым сервисом.'
                    ]
                }
            },
            {
                'title': 'Подтвердите, что чтение не меняет JSON',
                'task': 'Прямые вызовы list_tasks, get_task, select_tasks и get_statistics используют один тестовый файл. Выборка возвращает ожидаемый результат, статистика считает весь источник, а байты JSON до и после чтения совпадают.',
                'requirements': [
                    'В тестовом файле есть открытые и завершённые Task с непоследовательными id.',
                    'select_tasks применяет filter, sort по id и limit к возвращаемой выборке, не записывая её.',
                    'Сервисная статистика остаётся общей для всех записей, включая те, что не вошли в выборку.'
                ],
                'hint': 'Сохраним исходные байты после подготовки данных. Затем вызовем все методы чтения и сравним тот же путь, а не только длину возвращённого списка.',
                'answer': {
                    'explanation': 'Чтение строит результат для вызывающего кода, но не делает его новым источником истины. Сравнение байтов обнаруживает даже побочную перезапись или перестановку файла, а get_statistics подтверждает, что выборка не стала статистическим источником.',
                    'steps': [
                        'Запишем три Task с открытым и завершённым состояниями через настоящий JsonStorage.',
                        'Сохраним байты файла и построим PlannerService через build_service.',
                        'Прочитаем полный список, одну задачу, выборку и статистику.',
                        'Сверим ids, общие счётчики и неизменность исходного JSON.'
                    ],
                    'code': '''from app.main import build_service
from app.models import Task
from app.storage import JsonStorage


def test_read_methods_do_not_rewrite_json(tmp_path):
    path = tmp_path / "tasks.json"
    JsonStorage(path).save([
        Task(2, "CLI", 2, tags=["terminal"]),
        Task(7, "HTTP", 4, is_done=True, tags=["api"]),
        Task(11, "Tests", 3, tags=["pytest"]),
    ])
    service = build_service(JsonStorage(path))
    before = path.read_bytes()

    assert [task.id for task in service.list_tasks()] == [2, 7, 11]
    assert service.get_task(7).tags == ["api"]
    selected = service.select_tasks(is_done=False, sort_desc=True, limit=1)
    assert [task.id for task in selected] == [11]
    assert service.get_statistics() == {"all": 3, "open": 2, "done": 1}
    assert path.read_bytes() == before''',
                    'checks': [
                        'Все методы читают актуальные записи из тестового JsonStorage.',
                        'Ограниченная выборка не удаляет остальные задачи и не меняет их порядок на диске.',
                        'Статистика соответствует полному файлу, а не selected.'
                    ]
                }
            },
            {
                'title': 'Докажите сохранение обновлённой Task',
                'task': 'Проверки replace_task и patch_task вызывают существующий PlannerService и затем повторно открывают тот же JSON. Полная и частичная запись сохраняют id и непубличные tags. Явный False применяется как значение, а не принимается за отсутствие поля.',
                'requirements': [
                    'Начальная Task и соседняя запись хранятся через JsonStorage(tmp_path).',
                    'После patch_task(is_done=False) и replace_task данные загружаются новым сервисом.',
                    'Проверяются новые значения, неизменённый id, сохранённые tags и соседняя запись.'
                ],
                'hint': 'Вызовите сервисные методы, не собирая update-словарь в router. Для проверки сохранения не используйте уже возвращённый объект: перечитайте тот же путь.',
                'answer': {
                    'explanation': 'Ответ операции может содержать обновлённую копию и при этом не подтверждать запись. Новый PlannerService читает файл независимо. Сверка id, tags и соседней записи показывает, что обновилось нужное поле, а полный доменный формат сохранился.',
                    'steps': [
                        'Сохраним основную и соседнюю Task с разными tags.',
                        'Применим PATCH с явным False и проверим файл новым сервисом.',
                        'Применим полный replace_task с новым title, priority и is_done.',
                        'Повторно загрузим весь список и проверим обе записи.'
                    ],
                    'code': '''from app.main import build_service
from app.models import Task
from app.storage import JsonStorage


def test_updates_persist_full_task_and_keep_tags(tmp_path):
    path = tmp_path / "tasks.json"
    JsonStorage(path).save([
        Task(7, "HTTP", 4, is_done=True, tags=["api"]),
        Task(11, "Соседняя", 2, tags=["keep"]),
    ])
    service = build_service(JsonStorage(path))

    service.patch_task(7, is_done=False)
    after_patch = build_service(JsonStorage(path)).list_tasks()
    updated = next(task for task in after_patch if task.id == 7)
    assert updated.is_done is False
    assert updated.tags == ["api"]

    service.replace_task(7, title="HTTP tests", priority=1, is_done=True)
    reloaded = build_service(JsonStorage(path)).list_tasks()
    updated = next(task for task in reloaded if task.id == 7)
    neighbor = next(task for task in reloaded if task.id == 11)

    assert (updated.id, updated.title, updated.priority, updated.is_done) == (
        7, "HTTP tests", 1, True
    )
    assert updated.tags == ["api"]
    assert neighbor.tags == ["keep"]''',
                    'checks': [
                        'PATCH принимает явный False и сохраняет его в полном JSON.',
                        'PUT сохраняет новые значения и прежние id/tags.',
                        'Соседняя запись остаётся в том же файле без изменений.'
                    ]
                }
            },
            {
                'title': 'Проследите направление зависимостей',
                'task': 'Реальный путь операции проходит от HTTP-router или CLI к одному PlannerService и затем к JsonStorage. Нижние модули не импортируют HTTP-слой, а маршруты не выполняют файловое сохранение вместо сервиса.',
                'requirements': [
                    'Проверяются фактические импорты и вызовы существующих модулей, а не только имена файлов.',
                    'Изменяется только найденное дублирование CRUD, состояния или HTTP-ответственности.',
                    'При корректных границах практика заканчивается добавленными проверками без искусственного переноса кода.'
                ],
                'hint': 'Проследим один вызов от router и одну CLI-команду до build_service. Затем проверим, есть ли обратная зависимость из services.py или storage.py к FastAPI.',
                'answer': {
                    'explanation': 'HTTP-router и CLI являются разными входами, но передают работу общему сервису. PlannerService владеет правилами, JsonStorage отвечает за сериализацию. Если этот путь уже соблюдён, оставляем модули на месте: сама проверка является полезным результатом.',
                    'steps': [
                        'Найдём место, где build_service выбирает реальное хранилище.',
                        'Проследим вызов API и CLI до одного и того же PlannerService.',
                        'Проверим импорты services.py и storage.py на HTTP-зависимости.',
                        'Если найдена копия операции или обратная зависимость, исправим только её и повторим соответствующие тесты.'
                    ],
                    'checks': [
                        'API отвечает только за HTTP-вход и ответ, CLI только переводит команды.',
                        'Прикладное правило имеет одну реализацию в PlannerService.',
                        'JsonStorage не зависит от router или FastAPI.',
                        'Если нарушение не обнаружено, код не перестраивался ради самой перестройки.'
                    ]
                }
            }
        ],
        'result': 'Сервисные тесты проходят отдельно и вместе на собственных JsonStorage(tmp_path): чтение не меняет файл, создание и обновления видны новому сервису, полная Task и соседние записи сохранены. API, CLI и storage используют один путь ответственности, а рабочий data/tasks.json не изменяется.'
    }],
    67: [
        {
            'title': 'Проследите одну задачу через API',
            'task': 'Автоматическая и ручная приёмка проверяют один ресурс через существующие HTTP-маршруты. Тестовый JSON сохраняет изменения между запросами сценария, а Postman использует работающий сервер и общий рабочий файл.',
            'tasks': [
                {
                    'title': 'Сквозной сценарий в TestClient',
                    'task': 'Файл tests/test_workflow.py проверяет жизненный цикл задачи через настоящее приложение. Создание, чтение, PUT, PATCH и удаление связаны одним id; контрольная запись, список и stats подтверждают общее состояние.',
                    'requirements': [
                        'Сценарий использует существующие app и client-fixture с отдельным JsonStorage(tmp_path); id берутся из ответов POST.',
                        'Две задачи создаются через API. Главная проходит GET, полный PUT, PATCH с явным false, пустой 204 и последующее отсутствие; контрольная задача остаётся прежней.',
                        'Невалидный PATCH и неполный PUT отвечают 422 без изменения списка, задачи и stats; workflow проходит отдельно и вместе с набором.',
                    ],
                    'hint': 'Начнём с двух фактических ответов POST и запомним их id. После каждого изменения повторно читаем главную и контрольную запись, а перед отказами сохраняем список и stats.',
                    'answer': {
                        'explanation': 'Один client и один тестовый файл связывают запросы в историю. Ответы подтверждают HTTP-контракт, повторные чтения подтверждают общее состояние, а контрольная задача обнаруживает случайное изменение соседа.',
                        'steps': [
                            'Создаём контрольную и главную задачи, проверяем статус 201 и сохраняем оба server id.',
                            'Читаем главную, выполняем полный PUT и проверяем новые поля, прежний id и неизменность соседа.',
                            'Отправляем невалидный PATCH и неполный PUT. После каждого ответа 422 сравниваем полный список и stats с сохранённым состоянием.',
                            'Отправляем PATCH только с is_done=False; повторный GET подтверждает остальные поля, а stats и запрос списка с is_done=false показывают две открытые задачи.',
                            'Проверяем пустой PATCH и PATCH с null, затем удаляем главную. Пустой 204, последующий 404 и прежняя контрольная запись завершают сценарий.',
                        ],
                        'code': """def test_workflow(client):
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json() == {"status": "ok"}

    control_response = client.post(
        "/tasks", json={"title": "Control", "priority": 1}
    )
    target_response = client.post(
        "/tasks", json={"title": "  Review API  ", "priority": 3}
    )
    assert control_response.status_code == 201
    assert target_response.status_code == 201

    control = control_response.json()
    target = target_response.json()
    control_id = control["id"]
    task_id = target["id"]
    path = f"/tasks/{task_id}"
    assert set(target) == {"id", "title", "priority", "is_done"}
    assert target["title"] == "Review API"
    assert target["is_done"] is False
    target_read = client.get(path)
    control_read = client.get(f"/tasks/{control_id}")
    assert target_read.status_code == 200
    assert target_read.json() == target
    assert control_read.status_code == 200
    assert control_read.json() == control
    assert client.get("/tasks").json() == [control, target]
    assert client.get("/stats").json() == {
        "total": 2, "open": 2, "done": 0
    }

    put_response = client.put(
        path,
        json={"title": "Reviewed", "priority": 5, "is_done": True},
    )
    assert put_response.status_code == 200
    target_done = {
        "id": task_id, "title": "Reviewed",
        "priority": 5, "is_done": True,
    }
    assert put_response.json() == target_done
    assert client.get(path).json() == target_done
    assert client.get(f"/tasks/{control_id}").json() == control
    assert client.get("/stats").json() == {
        "total": 2, "open": 1, "done": 1
    }

    before_tasks = client.get("/tasks").json()
    before_stats = client.get("/stats").json()
    invalid_patch = client.patch(path, json={"title": "   "})
    assert invalid_patch.status_code == 422
    assert client.get("/tasks").json() == before_tasks
    assert client.get("/stats").json() == before_stats

    incomplete_put = client.put(path, json={"title": "Incomplete"})
    assert incomplete_put.status_code == 422
    assert client.get("/tasks").json() == before_tasks
    assert client.get("/stats").json() == before_stats

    patch_response = client.patch(path, json={"is_done": False})
    assert patch_response.status_code == 200
    target_open = {
        "id": task_id, "title": "Reviewed",
        "priority": 5, "is_done": False,
    }
    assert patch_response.json() == target_open
    assert client.get(path).json() == target_open
    assert client.get(f"/tasks/{control_id}").json() == control
    assert client.get("/tasks", params={"is_done": False}).json() == [
        control, target_open
    ]
    assert client.get("/stats").json() == {
        "total": 2, "open": 2, "done": 0
    }

    empty_patch = client.patch(path, json={})
    null_patch = client.patch(path, json={"title": None})
    assert empty_patch.status_code == 200
    assert empty_patch.json() == target_open
    assert null_patch.status_code == 200
    assert null_patch.json() == target_open

    deleted = client.delete(path)
    assert deleted.status_code == 204
    assert deleted.content == b""
    assert client.get(path).status_code == 404
    assert client.delete(path).status_code == 404
    assert client.put(
        path, json={"title": "Again", "priority": 2, "is_done": False}
    ).status_code == 404
    assert client.patch(path, json={"is_done": True}).status_code == 404
    assert client.get(f"/tasks/{control_id}").json() == control
    assert client.get("/tasks").json() == [control]
    assert client.get("/stats").json() == {
        "total": 1, "open": 1, "done": 0
    }""",
                        'checks': [
                            'Каждый POST возвращает 201, а код использует id из ответов, не фиксированные номера.',
                            'PUT меняет полную запись; PATCH с false сохраняет title и priority.',
                            'После обоих ответов 422 полный список и stats остались неизменными.',
                            'DELETE возвращает пустой 204; удалённый id отвечает 404, контрольная задача сохранена.',
                        ],
                    },
                },
                {
                    'title': 'Повторите путь через Postman',
                    'task': 'Planner collection проходит тот же жизненный цикл через запущенный Uvicorn. Запросы используют фактические id и рабочий JSON, а изменения stats считаются от прочитанного baseline.',
                    'requirements': [
                        'Исходные total/open/done считываются из CLI или GET /stats; рабочий JSON не очищается.',
                        'Два POST создают контрольную и главную задачу, а все следующие запросы используют id из их ответов.',
                        'После PUT, PATCH и DELETE проверяются статусы, повторное чтение, неизменность соседа и относительные изменения stats.',
                    ],
                    'hint': 'Сначала запишем baseline N/O/D. Новые записи создаются открытыми, поэтому ожидаемые totals считаются прибавлением и вычитанием от этого исходного состояния.',
                    'answer': {
                        'explanation': 'Postman обращается к реально запущенному Uvicorn и к рабочему JSON, поэтому его baseline не обязан совпадать с пустым файлом pytest. Относительные stats и контрольная запись показывают эффект именно этого сценария.',
                        'steps': [
                            'Считываем N/O/D и создаём две задачи. Оба POST дают 201, а stats становятся N+2/O+2/D.',
                            'Сохраняем фактические id и читаем обе задачи. Полный PUT главной с is_done=true даёт 200 и stats N+2/O+1/D+1.',
                            'PATCH только с is_done=false даёт 200, сохраняет title и priority и возвращает stats к N+2/O+2/D.',
                            'DELETE главной даёт пустой 204 и stats N+1/O+1/D. GET, повторный DELETE, PUT и PATCH для её id дают 404.',
                            'Проверяем контрольную задачу через API и CLI. Перезапуск не удаляет её, потому что обе операции используют прежний JSON.',
                        ],
                        'checks': [
                            'Collection нацелена на работающий API и каждый item-запрос использует id из текущего POST.',
                            'Stats совпадают с относительными переходами от baseline, а не с выдуманными исходными числами.',
                            'После удаления остаётся контрольная запись; restart сохраняет рабочие данные.',
                        ],
                    },
                },
            ],
            'result': 'TestClient-сценарий проходит отдельно и вместе с набором, подтверждает состояние после каждого перехода и не меняет рабочий JSON. Postman повторяет HTTP-путь с фактическими id, пустым 204 и stats, рассчитанными от baseline.',
        }],
    68: [{
        'title': 'Передайте проверенный Planner API v1.0.0',
        'task': 'Чистый checkout запускает существующий Planner по README, его HTTP-договор подтверждается TestClient и Postman, а версия указывает на проверенный commit.',
        'tasks': [
            {
                'title': 'Чистая копия воспроизводит установку',
                'task': 'Из нового checkout команды README устанавливают runtime- и test-зависимости, запускают приложение и открывают его документацию.',
                'requirements': [
                    'requirements-dev.txt включает runtime-набор и нужные тестовые пакеты.',
                    'Рабочая папка и команды совпадают с README.',
                    'Личные данные, .venv и секреты не входят в копию.',
                ],
                'hint': 'Начинаем с проверки файлов зависимостей и рабочей папки, затем выполняем команды именно из README.',
                'answer': {
                    'explanation': 'Чистый checkout убирает случайную зависимость от пакетов и файлов автора. Команды python -m используют один интерпретатор, в который установлены зависимости проекта.',
                    'steps': [
                        'Клонируем репозиторий в отдельную папку и создаём новое окружение.',
                        'Активируем окружение, устанавливаем requirements-dev.txt и запускаем pytest.',
                        'Запускаем API указанной в README командой, затем открываем /docs и /openapi.json.',
                        'Если checkout ещё не содержит рабочих данных, создаём собственные задачи через готовый CLI.',
                    ],
                    'code': (
                        'python -m venv .venv\n'
                        '.\\.venv\\Scripts\\Activate.ps1\n'
                        'python -m pip install -r requirements-dev.txt\n'
                        'python -m pytest -q\n'
                        'python -m uvicorn app.api:app --reload'
                    ),
                    'checks': [
                        'Команды выполняются из новой копии без пакетов прежнего окружения.',
                        'pytest проходит, приложение запускается, /docs и /openapi.json открываются.',
                    ],
                },
            },
            {
                'title': 'TestClient сохраняет независимость тестов',
                'task': 'Каждый HTTP-тест получает собственный JSON, а запросы одного сценария видят изменения общего для них состояния.',
                'requirements': [
                    'Тестовый сервис собирается через прежний build_service и JsonStorage(tmp_path).',
                    'Тест временно подключает сервис через app.state.planner и восстанавливает прежнее состояние.',
                    'Client закрывается до завершения fixture сервиса.',
                ],
                'hint': 'Связываем fixture клиента с fixture состояния зависимостью, чтобы pytest завершил их в обратном порядке.',
                'answer': {
                    'explanation': 'Function-scoped tmp_path даёт отдельный файл каждому тесту. Зависимость client от planner задаёт порядок: сначала закрывается TestClient, затем восстанавливается прежний сервис. Повторные запросы внутри теста продолжают работать с одним файлом.',
                    'steps': [
                        'Сохраняем app.state.planner и устанавливаем сервис с путём внутри tmp_path.',
                        'В client-fixture используем контекстный менеджер TestClient и зависим от planner.',
                        'В одном workflow создаём задачу, меняем её через PUT и PATCH с явным false, затем удаляем.',
                        'Проверяем статус и состояние после каждого действия, включая пустой 204 и последующий 404.',
                        'Запускаем workflow отдельно, весь набор и выборочные тесты в другом порядке.',
                    ],
                    'code': (
                        'import pytest\n'
                        'from fastapi.testclient import TestClient\n'
                        'from app.api import app\n'
                        'from app.main import build_service\n'
                        'from app.storage import JsonStorage\n'
                        '\n'
                        '@pytest.fixture\n'
                        'def planner(tmp_path):\n'
                        '    previous = app.state.planner\n'
                        '    app.state.planner = build_service(JsonStorage(tmp_path / "tasks.json"))\n'
                        '    try:\n'
                        '        yield\n'
                        '    finally:\n'
                        '        app.state.planner = previous\n'
                        '\n'
                        '@pytest.fixture\n'
                        'def client(planner):\n'
                        '    with TestClient(app) as client:\n'
                        '        yield client\n'
                        '\n'
                        'def test_workflow(client):\n'
                        '    created = client.post("/tasks", json={"title": "API", "priority": 2})\n'
                        '    assert created.status_code == 201\n'
                        '    task_id = created.json()["id"]\n'
                        '    client.put(f"/tasks/{task_id}", json={\n'
                        '        "title": "API", "priority": 2, "is_done": True\n'
                        '    })\n'
                        '    patched = client.patch(f"/tasks/{task_id}", json={"is_done": False})\n'
                        '    assert patched.json()["is_done"] is False\n'
                        '    deleted = client.delete(f"/tasks/{task_id}")\n'
                        '    assert deleted.status_code == 204 and deleted.content == b""\n'
                        '    assert client.get(f"/tasks/{task_id}").status_code == 404'
                    ),
                    'checks': [
                        'Два теста не читают один тестовый JSON.',
                        'Запросы workflow сохраняют одно состояние и удаление не оставляет ресурс доступным.',
                    ],
                },
            },
            {
                'title': 'Postman подтверждает реальный HTTP-путь',
                'task': 'Сохранённая collection проходит операции через запущенный Uvicorn, использует фактические id и подтверждает общее состояние CLI и API.',
                'requirements': [
                    'Collection и environment нацелены на фактический base_url.',
                    'Перед изменениями записывается текущая статистика из CLI.',
                    'Рабочий JSON не очищается между запросами.',
                ],
                'hint': 'Сначала выполняем POST и сохраняем id из ответа. Каждый следующий запрос использует именно этот id.',
                'answer': {
                    'explanation': 'Postman проходит настоящий HTTP-сервер и работает с настроенным общим JSON. Baseline помогает сравнить реальные изменения, а контрольная задача показывает, что операции не затронули соседнюю запись.',
                    'steps': [
                        'Импортируем имеющиеся collection и environment, запускаем Uvicorn и указываем base_url.',
                        'Записываем total/open/done из CLI, затем создаём контрольную и основную задачу.',
                        'Берём оба id из ответов POST и выполняем GET, полный PUT, частичный PATCH с false и DELETE для основной задачи.',
                        'После каждого этапа сверяем item, соседнюю задачу и общую stats; после DELETE проверяем пустой body и GET с 404.',
                        'Перезапускаем API и убеждаемся, что оставшиеся задачи читаются из того же JSON.',
                    ],
                    'code': (
                        'GET /health                         -> 200\n'
                        'GET /tasks                          -> 200\n'
                        'POST /tasks                         -> 201, сохранить id из ответа\n'
                        'GET /tasks/{фактический_id}         -> 200\n'
                        'PUT /tasks/{фактический_id}         -> 200, полный body\n'
                        'PATCH /tasks/{фактический_id}       -> 200, применить is_done=false\n'
                        'GET /stats                          -> сверить общий источник\n'
                        'DELETE /tasks/{фактический_id}      -> 204 без body\n'
                        'GET /tasks/{удалённый_id}           -> 404'
                    ),
                    'checks': [
                        'Статусы, формы ответов и данные совпадают с текущим HTTP-договором.',
                        'Изменения видны через CLI и после restart, соседняя задача остаётся прежней.',
                    ],
                },
            },
            {
                'title': 'README и release относятся к одному commit',
                'task': 'README воспроизводит команды и ограничения текущего Planner, а тег planner-api-v1.0.0 указывает на проверенный commit.',
                'requirements': [
                    'Проверяется commit после последнего изменения кода, зависимостей и README.',
                    'В версию не попадают .venv, кэш, секреты или личный JSON.',
                    'GitHub Release создаётся из проверенного тега, если доступен репозиторий.',
                ],
                'hint': 'Тег указывает на commit, а не на незакоммиченные файлы или сам факт, что команда pytest когда-то проходила.',
                'answer': {
                    'explanation': 'README становится доказанным только после выполнения его шагов в чистой копии. Тег фиксирует точный commit; исправление после приёмки создаёт новую версию, которую требуется проверить снова.',
                    'steps': [
                        'Описываем назначение, версию Python, корень команд, установку, CLI, API, тесты, collection и ограничения JSON.',
                        'Выполняем README из чистой копии после последнего commit и повторяем pytest, запуск API и Postman-сценарий.',
                        'Если что-то исправлено, создаём новый commit и повторяем затронутые проверки.',
                        'Записываем hash проверенного commit и создаём отдельный тег Planner API.',
                        'Создаём GitHub Release из этого тега при наличии доступа; локальный тег не называем опубликованным выпуском.',
                    ],
                    'code': (
                        'python -m pytest -q\n'
                        'git rev-parse HEAD\n'
                        'git tag -a planner-api-v1.0.0 -m "Planner API v1.0.0"\n'
                        'git show --no-patch --format=%H planner-api-v1.0.0'
                    ),
                    'checks': [
                        'Hash тега совпадает с проверенным commit.',
                        'README выполняется из чистой копии, а release notes называют возможности и ограничения.',
                    ],
                },
            },
        ],
        'result': 'Новый checkout запускает Planner и его тесты по README; TestClient и Postman подтверждают HTTP-договор и сохранение JSON; тег planner-api-v1.0.0 указывает на проверенный commit.',
    }],

}

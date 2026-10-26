"""Учебная практика блока. Редактируйте задания здесь."""

from __future__ import annotations

from typing import Any


MANUAL_PRACTICE: dict[int | str, list[dict[str, Any]]] = {
    56: [
        {
            'title': 'От готового /health к первому HTTP-тесту',
            'task': (
                'Точка A: pytest, assert и tmp_path знакомы. В app/api.py уже есть FastAPI app с GET /health и ответом '
                '{"status": "ok"}; HTTP-теста ещё нет.\n\n'
                'Точка B: dev-зависимости готовы, команда записана в README, а tests/test_api.py проверяет настоящий '
                'app. Тест подтверждает статус 200 и JSON; Uvicorn и данные Planner не затрагиваются.'
            ),
            'tasks': [
                {
                    'title': 'Подготовьте dev-зависимости',
                    'task': (
                        'В requirements-dev.txt уже есть pytest==8.4.2. Подключите runtime-набор из requirements.txt, '
                        'добавьте httpx2==2.13.1 и установите dev-зависимости из корня StudyHub.'
                    ),
                    'requirements': [
                        'requirements-dev.txt включает -r requirements.txt.',
                        'В файле сохранён pytest==8.4.2 и добавлен httpx2==2.13.1.',
                        'Runtime requirements.txt не изменён.',
                        'Команда установки использует Python из .venv.',
                    ],
                    'hint': (
                        'Оставьте pytest. Добавьте строку -r requirements.txt и закреплённый httpx2, затем установите '
                        'весь набор Python из .venv.'
                    ),
                    'answer': {
                        'explanation': (
                            'Строка -r requirements.txt подключает пакеты приложения. Файл dev-зависимостей добавляет '
                            'pytest и HTTP-клиент для TestClient. Закреплённые версии делают установку повторяемой.'
                        ),
                        'steps': [
                            'Подключаем runtime-набор строкой -r requirements.txt.',
                            'Сохраняем pytest==8.4.2 и добавляем httpx2==2.13.1.',
                            'Из корня запускаем .venv\\Scripts\\python.exe -m pip install -r requirements-dev.txt.',
                        ],
                        'code': '''# requirements-dev.txt
-r requirements.txt
pytest==8.4.2
httpx2==2.13.1''',
                        'checks': [
                            'Установка завершилась без ошибки.',
                            'В dev-файле закреплены pytest и HTTP-клиент; runtime-набор подключён.',
                        ],
                    },
                    'result': (
                        'Dev-набор включает runtime-пакеты, pytest==8.4.2 и httpx2==2.13.1; пакеты доступны из .venv.'
                    ),
                },
                {
                    'title': 'Добавьте тест GET /health',
                    'task': (
                        'В корне StudyHub создайте tests/test_api.py:\n'
                        '1. Импортируйте app из app.api и TestClient из fastapi.testclient.\n'
                        '2. В test_health_returns_ok откройте TestClient(app) через with и отправьте GET /health.\n'
                        '3. Отдельно проверьте статус 200 и JSON {"status": "ok"}.'
                        '\n\nНачальная заготовка:\n\n'
                        '```python\n'
                        'from fastapi.testclient import TestClient\n'
                        'from app.api import app\n'
                        '\n\n'
                        'def test_health_returns_ok():\n'
                        '    pass\n'
                        '```'
                    ),
                    'requirements': [
                        'Тест импортирует app из app.api и TestClient из fastapi.testclient.',
                        'TestClient(app) создаётся внутри with; запрос — GET /health.',
                        'Отдельные assert проверяют status_code == 200 и JSON {"status": "ok"}.',
                        'Нет второй FastAPI app, Uvicorn, fixture, подмены сервиса или запросов на запись.',
                    ],
                    'hint': (
                        'Внутри with запросите /health через client.get. Сохраните response, затем отдельно проверьте '
                        'его статус и JSON.'
                    ),
                    'answer': {
                        'explanation': (
                            'TestClient получает app проекта и проходит через зарегистрированный маршрут. with закрывает '
                            'клиента. Два assert проверяют разные части ответа: HTTP-код и тело.'
                        ),
                        'steps': [
                            'Импортируем готовый app проекта.',
                            'Открываем TestClient(app) через with.',
                            'Запрашиваем GET /health.',
                            'Проверяем status_code, затем response.json().',
                        ],
                        'code': '''# tests/test_api.py
from fastapi.testclient import TestClient

from app.api import app


def test_health_returns_ok():
    with TestClient(app) as client:
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}''',
                        'checks': [
                            'Тест импортирует приложение, в котором зарегистрирован /health.',
                            'Два утверждения независимо проверяют статус и тело.',
                            'Запрос не меняет состояние Planner.',
                        ],
                    },
                    'result': (
                        'tests/test_api.py содержит обнаруживаемый тест, который через TestClient настоящего app '
                        'получает GET /health и утверждает статус 200 и JSON {"status": "ok"}.'
                    ),
                },
                {
                    'title': 'Запишите команду и запустите тест',
                    'task': (
                        'В README.md сохраните команду полного набора и добавьте рядом запуск tests/test_api.py. '
                        'Выполните его из корня StudyHub. Ожидаем один найденный и прошедший test_health_returns_ok.'
                    ),
                    'requirements': [
                        'Команда полного набора в README сохранена.',
                        'Рядом указана .\\.venv\\Scripts\\python.exe -m pytest -q tests/test_api.py.',
                        'Pytest находит и проходит один test_health_returns_ok.',
                        'Uvicorn не запускается, data/tasks.json не меняется.',
                    ],
                    'hint': (
                        'Запустите pytest Python из .venv и укажите точный файл. В отчёте проверьте, что найден один тест.'
                    ),
                    'answer': {
                        'explanation': (
                            'Путь к файлу ограничивает запуск новым тестом. Python из .venv использует подготовленные '
                            'dev-зависимости; Uvicorn для TestClient не нужен.'
                        ),
                        'steps': [
                            'Из корня запускаем .\\.venv\\Scripts\\python.exe -m pytest -q tests/test_api.py.',
                            'Проверяем, что найден и прошёл один test_health_returns_ok.',
                            'Сверяем команду с README.',
                        ],
                        'code': '.\\.venv\\Scripts\\python.exe -m pytest -q tests/test_api.py',
                        'checks': [
                            'Отчёт показывает один прошедший тест.',
                            'Uvicorn не запущен, data/tasks.json не изменён.',
                        ],
                    },
                    'result': (
                        'README содержит команду, а именованный запуск находит и проходит test_health_returns_ok.'
                    ),
                },
            ],
            'result': (
                'Точка B достигнута: dev-среда готова, настоящий GET /health проверяется через TestClient, а README '
                'содержит команду запуска. Один тест подтверждает статус 200 и JSON {"status": "ok"}; данные Planner не меняются.'
            ),
        }
    ],
    "56.1": [
        {
            'title': 'Изолируйте состояние HTTP-тестов',
            'task': (
                'Работаем в корне StudyHub. Старт (A): в занятии 56 TestClient проверял GET /health через настоящее app. '
                'Ранее встречались pytest, tmp_path, JsonStorage и build_service. '
                'Цель: подготовить api_service и api_client в tests/conftest.py, чтобы тесты работали с временным JSON. '
                'Результат (B): запросы одного теста видят одну задачу, следующий тест начинает с пустого списка, '
                'клиент закрывается, прежний Planner возвращается даже после ошибки, а рабочий JSON не меняется. '
                'Связь с теорией: задача 1 — раздел 02; задача 2 — разделы 01 и 03–05; задача 3 — разделы 05–06; '
                'задача 4 — разделы 02–03 и 06; задача 5 — разделы 04–07.'
            ),
            'tasks': [
                {
                    'title': 'Сервис использует временный JSON',
                    'task': (
                        'В tests/conftest.py создайте fixture api_service. Она строит PlannerService через '
                        'build_service и JsonStorage на пути tmp_path / "tasks.json".'
                    ),
                    'result': 'api_service с function scope возвращает PlannerService, который читает и записывает временный tasks.json.',
                    'requirements': [
                        'Fixture называется api_service, явно задаёт scope="function" и принимает tmp_path.',
                        'JsonStorage получает путь tmp_path / "tasks.json".',
                        'Сервис возвращает существующая build_service(storage).',
                    ],
                    'hint': 'Теория, раздел 02: tmp_path задаёт каталог, JsonStorage получает путь к файлу, build_service собирает PlannerService.',
                    'answer': {
                        'explanation': 'tmp_path даёт отдельный каталог функции. JsonStorage хранит данные в нём, а build_service возвращает PlannerService.',
                        'steps': [
                            'Добавьте fixture api_service с параметром tmp_path.',
                            'Передайте путь tmp_path / "tasks.json" в JsonStorage.',
                            'Верните результат build_service(storage).',
                        ],
                        'code': '''# tests/conftest.py
import pytest

from app.main import build_service
from app.storage import JsonStorage


@pytest.fixture(scope="function")
def api_service(tmp_path):
    storage = JsonStorage(tmp_path / "tasks.json")
    return build_service(storage)''',
                        'checks': [
                            'Каждая тестовая функция получает свой путь.',
                            'JsonStorage не использует рабочий data/tasks.json.',
                        ],
                    },
                },
                {
                    'title': 'Клиент закрывается, Planner восстанавливается',
                    'task': (
                        'В tests/conftest.py создайте fixture api_client. В tests/test_api.py добавьте test_health. '
                        'Требования к fixture и тесту указаны ниже. Запустите из корня StudyHub: '
                        '`python -m pytest tests/test_api.py::test_health`.'
                    ),
                    'result': 'GET /health возвращает 200 и JSON {"status": "ok"}; после теста app.state.planner указывает на прежний Planner.',
                    'requirements': [
                        'api_client явно задаёт scope="function" и принимает api_service.',
                        'До подмены сохраните app.state.planner, затем назначьте api_service внутри try.',
                        'Откройте TestClient(app) внутри with и выдайте его через yield.',
                        'В finally восстановите сохранённый Planner после закрытия клиента.',
                        'test_health проверяет status_code == 200 и JSON {"status": "ok"}.',
                    ],
                    'hint': 'Теория, разделы 01 и 03–05: pytest передаёт api_service по имени; with закрывает TestClient, finally возвращает прежний Planner.',
                    'answer': {
                        'explanation': 'pytest сначала создаёт api_service, затем передаёт его в api_client. TestClient обращается к настоящему app. После теста клиент закрывается, а finally восстанавливает прежний Planner.',
                        'steps': [
                            'Импортируйте app и TestClient.',
                            'Сохраните app.state.planner до подмены.',
                            'Установите api_service и выдайте клиент через yield внутри with.',
                            'Верните исходный Planner в finally.',
                            'Проверьте статус и JSON ответа /health.',
                        ],
                        'code': '''# tests/conftest.py
import pytest
from fastapi.testclient import TestClient

from app.api import app


@pytest.fixture(scope="function")
def api_client(api_service):
    previous_planner = app.state.planner
    try:
        app.state.planner = api_service
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.state.planner = previous_planner


# tests/test_api.py
def test_health(api_client):
    response = api_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}''',
                        'checks': [
                            'После теста app.state.planner снова содержит исходный объект.',
                            'GET /health проходит через существующие app и TestClient без Uvicorn.',
                        ],
                    },
                },
                {
                    'title': 'POST и GET работают с одной задачей',
                    'task': (
                        'В tests/test_api.py создайте test_create_then_read. Отправьте POST /tasks с title "Read" и priority 2. '
                        'Возьмите id из ответа и прочитайте задачу через тот же api_client. '
                        'Запустите из корня StudyHub: `python -m pytest tests/test_api.py::test_create_then_read`.'
                    ),
                    'result': 'POST возвращает 201, а следующий GET тем же клиентом возвращает созданную задачу.',
                    'requirements': [
                        'POST отправляет {"title": "Read", "priority": 2} и получает статус 201.',
                        'Тест берёт id из ответа POST.',
                        'GET использует тот же api_client; статус равен 200, JSON совпадает с ответом POST.',
                    ],
                    'hint': 'Теория, разделы 05–06: оба запроса идут через один api_client. Возьмите id из JSON ответа POST.',
                    'answer': {
                        'explanation': 'Один api_client сохраняет связь между запросами. POST записывает задачу во временный JSON, следующий GET читает её оттуда.',
                        'steps': [
                            'Отправьте POST /tasks с title и priority.',
                            'Проверьте статус 201 и сохраните JSON ответа.',
                            'Прочитайте задачу по id из ответа.',
                            'Сравните JSON GET и POST.',
                        ],
                        'code': '''def test_create_then_read(api_client):
    response = api_client.post(
        "/tasks", json={"title": "Read", "priority": 2}
    )
    assert response.status_code == 201
    created = response.json()

    result = api_client.get(f"/tasks/{created['id']}")
    assert result.status_code == 200
    assert result.json() == created''',
                        'checks': [
                            'Оба запроса выполняются в одной функции через один клиент.',
                            'Тест использует id из ответа, а не угадывает его.',
                        ],
                    },
                },
                {
                    'title': 'Новая функция получает пустой список',
                    'task': (
                        'В tests/test_api.py добавьте отдельный тест test_new_function_starts_empty. Он выполняет GET /tasks '
                        'и проверяет, что список пуст. Запустите его вместе с test_create_then_read.'
                    ),
                    'result': 'После POST→GET новый тест получает пустой список; рабочий data/tasks.json не меняется и не создаётся заново.',
                    'requirements': [
                        'test_new_function_starts_empty — отдельная функция с параметром api_client.',
                        'GET /tasks возвращает статус 200 и пустой список; тест ничего не очищает вручную.',
                        'Из корня StudyHub в PowerShell выполните `Test-Path .\\data\\tasks.json`. Если ответ True, сохраните SHA-256 командой `Get-FileHash .\\data\\tasks.json -Algorithm SHA256`; если False, запишите, что файла нет.',
                        'Из корня StudyHub запустите сначала `test_create_then_read`, затем `test_new_function_starts_empty`: `python -m pytest tests/test_api.py::test_create_then_read tests/test_api.py::test_new_function_starts_empty`.',
                        'После запуска прежний SHA-256 совпадает; если файла не было, он не появился.',
                    ],
                    'hint': 'Теория, разделы 02–03 и 06: у каждой функции свой tmp_path и PlannerService. Начните с GET /tasks.',
                    'answer': {
                        'explanation': 'Function scope создаёт новый tmp_path и PlannerService для каждого теста. Поэтому новый тест не видит запись соседнего теста.',
                        'steps': [
                            'Создайте отдельный тест с параметром api_client.',
                            'Выполните GET /tasks и проверьте статус 200 и пустой список.',
                            'Проверьте, есть ли рабочий data/tasks.json; если есть, запомните его SHA-256.',
                            'Сначала запустите test_create_then_read, затем test_new_function_starts_empty. Повторите проверку файла.',
                        ],
                        'code': '''# tests/test_api.py
def test_new_function_starts_empty(api_client):
    response = api_client.get("/tasks")

    assert response.status_code == 200
    assert response.json() == []''',
                        'checks': [
                            'Оба теста проходят вместе, порядок не влияет на пустой старт.',
                            'Рабочий JSON не изменился; отсутствующий файл не появился.',
                        ],
                    },
                },
                {
                    'title': 'Planner восстанавливается после ошибки',
                    'task': (
                        'Временно добавьте в tests/test_api.py две проверки: одна вызывает RuntimeError после получения '
                        'api_client, другая проверяет восстановление Planner. Затем удалите диагностику и запустите тесты.'
                    ),
                    'result': 'Диагностика показывает ожидаемый fail, затем pass; после удаления временного кода обычные тесты проходят без намеренных ошибок.',
                    'requirements': [
                        'Перед двумя функциями сохраните app.state.planner в переменную _original_planner.',
                        'Первая функция получает api_client и вызывает RuntimeError после yield.',
                        'Вторая функция проверяет `app.state.planner is _original_planner`.',
                        'Из корня StudyHub в PowerShell запустите обе функции командой `python -m pytest tests/test_api.py::test_00_temporary_failure_after_yield tests/test_api.py::test_01_temporary_planner_was_restored`.',
                        'Первый тест ожидаемо падает из-за RuntimeError; второй проходит.',
                        'Удалите временную переменную и функции, затем запустите `python -m pytest`.',
                    ],
                    'hint': 'Теория, разделы 04–07: сначала сохраните Planner, затем вызовите ошибку после yield; следующая функция проверит восстановление.',
                    'answer': {
                        'explanation': 'После ошибки pytest всё равно завершает fixture. with закрывает клиент, finally возвращает прежний Planner, а второй тест это проверяет.',
                        'steps': [
                            'Сохраните исходный app.state.planner в _original_planner.',
                            'В первой функции получите api_client и вызовите RuntimeError.',
                            'Во второй проверьте, что Planner восстановлен.',
                            'Запустите обе функции: ожидайте fail, затем pass.',
                            'Удалите диагностику и запустите обычный набор тестов.',
                        ],
                        'code': '''# tests/test_api.py
from app.api import app


_original_planner = app.state.planner


def test_00_temporary_failure_after_yield(api_client):
    raise RuntimeError("controlled fixture failure")


def test_01_temporary_planner_was_restored():
    assert app.state.planner is _original_planner''',
                        'checks': [
                            'Первый тест падает из-за RuntimeError.',
                            'Второй тест подтверждает восстановление Planner.',
                            'В обычном наборе нет временных тестов.',
                        ],
                    },
                },
            ],
            'result': (
                'В tests/conftest.py работают api_service и api_client с function scope, временным JsonStorage, закрытием '
                'TestClient и восстановлением app.state.planner. Один тест сохраняет данные между POST и GET, отдельный '
                'начинает с пустой коллекции; рабочий JSON не меняется, временная демонстрация ошибки удалена.'
            ),
        }
    ],
    57: [
        {
            'title': 'Базовые HTTP-гарантии остаются рабочими',
            'task': (
                'Работаем в корне StudyHub. В app/api.py уже есть /health, маршруты задач и /stats. '
                'Fixtures api_service и api_client готовы в tests/conftest.py. Добавьте базовые проверки в '
                'tests/test_api.py. Сохраните test_health_returns_ok. Не меняйте приложение, fixtures и '
                'рабочий data/tasks.json.'
            ),
            'tasks': [
                {
                    'title': 'GET проверяет список, сводку и выбранную задачу',
                    'task': (
                        'Добавьте три отдельных теста: GET /tasks, GET /stats и GET /tasks/{task_id}. '
                        'Создайте нужные записи через api_service. Запросы отправьте через api_client и '
                        'проверьте статус и данные каждого ответа.'
                    ),
                    'requirements': [
                        'Сохраните существующий test_health_returns_ok.',
                        'GET /tasks и GET item возвращают 200 и поля id, title, priority, is_done.',
                        'GET /stats возвращает 200 и ожидаемые total, open, done.',
                        'Постройте item-path из id созданной задачи. Поля tags в HTTP-ответе нет.',
                    ],
                    'hint': (
                        'В каждом тесте создайте только нужные данные через api_service. Затем отправьте GET через api_client.'
                    ),
                    'answer': {
                        'explanation': (
                            'Каждый тест создаёт свои данные через сервис, а читает их через HTTP. Проверяем статус и JSON.'
                        ),
                        'steps': [
                            'Для списка создаём одну задачу и сравниваем весь ответ.',
                            'Для stats создаём открытую и выполненную задачи, затем проверяем три счётчика.',
                            'Для item берём реальный id и проверяем четыре публичных поля.',
                            'Оставляем test_health_returns_ok без изменений.',
                        ],
                        'code': '''# tests/test_api.py
def test_list_returns_seeded_tasks(api_client, api_service):
    task = api_service.add_task("Записать вывод", 2)

    response = api_client.get("/tasks")

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": task.id,
            "title": "Записать вывод",
            "priority": 2,
            "is_done": False,
        }
    ]


def test_stats_reports_all_tasks(api_client, api_service):
    api_service.add_task("Открытая задача", 1)
    done_task = api_service.add_task("Готовая задача", 3)
    api_service.mark_done(done_task.id)

    response = api_client.get("/stats")

    assert response.status_code == 200
    assert response.json() == {"total": 2, "open": 1, "done": 1}


def test_item_returns_public_task_without_tags(api_client, api_service):
    task = api_service.add_task("Прочитать ответ", 4, tags=["внутренний"])

    response = api_client.get("/tasks/" + str(task.id))

    assert response.status_code == 200
    assert response.json() == {
        "id": task.id,
        "title": "Прочитать ответ",
        "priority": 4,
        "is_done": False,
    }''',
                        'checks': [
                            'Каждый тест использует свои данные и проходит отдельно.',
                            'Статус равен 200, данные ответа ожидаемые.',
                            'Тест /health сохранён.',
                        ],
                    },
                    'result': (
                        'В tests/test_api.py сохранён health-тест и добавлены отдельные тесты списка, stats и item.'
                    ),
                },
                {
                    'title': 'POST связывается с GET через выданный id',
                    'task': (
                        'Добавьте test_create_then_read_uses_server_id. Через api_client отправьте POST /tasks и проверьте статус 201. '
                        'Возьмите id из ответа. Затем через тот же api_client прочитайте созданную задачу.'
                    ),
                    'requirements': [
                        'POST передаёт title и priority в JSON и возвращает status 201.',
                        'Не задавайте id вручную: возьмите его из JSON ответа POST.',
                        'Выполните GET в той же функции. Он должен вернуть 200 и ту же задачу.',
                    ],
                    'hint': (
                        'Сохраните response.json() в created. Для следующего GET используйте created["id"].'
                    ),
                    'answer': {
                        'explanation': (
                            'Сервер сам выдаёт id. GET с этим id подтверждает, что задача создана и доступна.'
                        ),
                        'steps': [
                            'Отправляем POST с title и priority.',
                            'Проверяем статус 201.',
                            'Сохраняем JSON ответа в created.',
                            'Берём created["id"], отправляем GET и сравниваем ответы.',
                        ],
                        'code': '''# tests/test_api.py
def test_create_then_read_uses_server_id(api_client):
    post_response = api_client.post(
        "/tasks",
        json={"title": "Записать вывод", "priority": 2},
    )

    assert post_response.status_code == 201
    created = post_response.json()
    assert created["title"] == "Записать вывод"
    assert created["priority"] == 2
    assert created["is_done"] is False

    read_response = api_client.get("/tasks/" + str(created["id"]))

    assert read_response.status_code == 200
    assert read_response.json() == created''',
                        'checks': [
                            'Тест использует id из ответа POST.',
                            'POST возвращает 201, GET возвращает 200 и ту же задачу.',
                        ],
                    },
                    'result': (
                        'POST создаёт задачу, а GET с выданным id возвращает ту же задачу.'
                    ),
                },
                {
                    'title': 'PUT и PATCH проверяют результат обновления',
                    'task': (
                        'Добавьте два теста: test_put_replaces_task и '
                        'test_patch_applies_false_and_keeps_other_values. Создайте задачи через api_service, '
                        'отправьте запросы через api_client и проверьте ответы.'
                    ),
                    'requirements': [
                        'Для PUT передайте все обязательные поля: title, priority и is_done. Ожидайте статус 200.',
                        'Для PATCH сначала отметьте задачу выполненной, затем передайте is_done: false.',
                        'Проверьте статус 200 и все поля ответа. PATCH должен сохранить title и priority.',
                    ],
                    'hint': (
                        'Перед PATCH вызовите api_service.mark_done(task.id). Тогда тест увидит, применилось ли false.'
                    ),
                    'answer': {
                        'explanation': (
                            'PUT проверяет замену всех полей. PATCH проверяет изменение True на False и сохранение остальных полей.'
                        ),
                        'steps': [
                            'Для PUT создаём задачу и отправляем все поля: title, priority и is_done.',
                            'Проверяем статус 200 и весь ответ PUT.',
                            'Для PATCH создаём задачу и отмечаем её выполненной.',
                            'Передаём is_done: false и проверяем, что title и priority не изменились.',
                        ],
                        'code': '''# tests/test_api.py
def test_put_replaces_task(api_client, api_service):
    task = api_service.add_task("Старый заголовок", 1)
    api_service.mark_done(task.id)

    response = api_client.put(
        "/tasks/" + str(task.id),
        json={"title": "Новый заголовок", "priority": 4, "is_done": False},
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": task.id,
        "title": "Новый заголовок",
        "priority": 4,
        "is_done": False,
    }


def test_patch_applies_false_and_keeps_other_values(api_client, api_service):
    task = api_service.add_task("Сверить ответ", 3)
    api_service.mark_done(task.id)

    response = api_client.patch(
        "/tasks/" + str(task.id),
        json={"is_done": False},
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": task.id,
        "title": "Сверить ответ",
        "priority": 3,
        "is_done": False,
    }''',
                        'checks': [
                            'PUT и PATCH возвращают 200 и ожидаемые поля.',
                            'PATCH меняет is_done с true на false.',
                            'PATCH сохраняет title и priority.',
                        ],
                    },
                    'result': (
                        'Тесты подтверждают замену через PUT и изменение одного поля через PATCH.'
                    ),
                },
                {
                    'title': 'DELETE возвращает пустой 204 и удаляет item',
                    'task': (
                        'Добавьте test_delete_returns_empty_204_then_get_returns_404. Создайте задачу через '
                        'api_service. Удалите её через api_client, проверьте пустое тело и запросите тот же id ещё раз.'
                    ),
                    'requirements': [
                        'DELETE возвращает 204.',
                        'Проверьте response.content == b"". Не вызывайте response.json() для ответа 204.',
                        'Следующий GET того же id возвращает 404.',
                    ],
                    'hint': (
                        'У ответа 204 нет JSON. Проверьте пустые байты, затем статус следующего GET.'
                    ),
                    'answer': {
                        'explanation': (
                            'Код 204 подтверждает удаление без тела. GET прежнего id должен вернуть 404.'
                        ),
                        'steps': [
                            'Создаём задачу через api_service.',
                            'Удаляем её и проверяем 204 и пустое тело.',
                            'Повторяем GET с тем же id и проверяем 404.',
                        ],
                        'code': '''# tests/test_api.py
def test_delete_returns_empty_204_then_get_returns_404(api_client, api_service):
    task = api_service.add_task("Удалить задачу", 2)

    delete_response = api_client.delete("/tasks/" + str(task.id))

    assert delete_response.status_code == 204
    assert delete_response.content == b""

    read_response = api_client.get("/tasks/" + str(task.id))

    assert read_response.status_code == 404''',
                        'checks': [
                            'Тело ответа 204 пустое, JSON не разбирается.',
                            'GET того же id возвращает 404.',
                        ],
                    },
                    'result': (
                        'DELETE возвращает пустой ответ 204, а следующий GET возвращает 404.'
                    ),
                },
                {
                    'title': 'Отказной POST не меняет состояние',
                    'task': (
                        'Добавьте test_invalid_post_does_not_change_state. Создайте задачу через api_service. '
                        'До POST сохраните ответы GET /tasks и GET /stats через api_client. Отправьте POST через '
                        'api_client с title из пробелов, проверьте 422 и '
                        'сравните список и stats после запроса с сохранёнными ответами.'
                    ),
                    'requirements': [
                        'Причина отказа одна: title состоит из пробелов.',
                        'POST возвращает 422.',
                        'Список и stats после запроса совпадают с ответами до него.',
                        'Все данные создаются внутри теста.',
                    ],
                    'hint': (
                        'Перед POST сохраните оба JSON-ответа. После 422 повторите GET и сравните результаты.'
                    ),
                    'answer': {
                        'explanation': (
                            'Статус 422 показывает отказ. Сравнение списка и stats подтверждает, что данные не изменились.'
                        ),
                        'steps': [
                            'Создаём одну задачу.',
                            'Сохраняем ответы списка и stats.',
                            'Отправляем POST с пробельным title и проверяем 422.',
                            'Повторно читаем список и stats и сравниваем ответы.',
                        ],
                        'code': '''# tests/test_api.py
def test_invalid_post_does_not_change_state(api_client, api_service):
    api_service.add_task("Исходная задача", 2)
    tasks_before = api_client.get("/tasks").json()
    stats_before = api_client.get("/stats").json()

    response = api_client.post(
        "/tasks",
        json={"title": "   ", "priority": 2},
    )

    assert response.status_code == 422
    assert api_client.get("/tasks").json() == tasks_before
    assert api_client.get("/stats").json() == stats_before''',
                        'checks': [
                            'POST возвращает 422.',
                            'Список и stats не изменились.',
                            'Тест использует собственные данные.',
                        ],
                    },
                    'result': (
                        'POST возвращает 422. Список и stats до и после запроса совпадают.'
                    ),
                },
                {
                    'title': 'Запустите новые проверки отдельно и вместе',
                    'task': (
                        'Из корня StudyHub запустите каждый новый тест отдельно по node ID. Затем запустите весь '
                        'tests/test_api.py. Проверьте, что проходят новые тесты и сохранённый test_health_returns_ok.'
                    ),
                    'requirements': [
                        'Каждый новый тест проходит при отдельном запуске pytest.',
                        'Общий запуск tests/test_api.py выполняет все тесты, включая test_health_returns_ok.',
                        'Не меняйте приложение, fixtures и рабочий JSON.',
                        'Не добавляйте новые проверки границ, OpenAPI или полного workflow.',
                    ],
                    'hint': (
                        'Node ID состоит из пути к файлу, двух двоеточий и имени функции. Например: '
                        'python -m pytest -q tests/test_api.py::test_create_then_read_uses_server_id. '
                        'В конце запустите python -m pytest -q tests/test_api.py.'
                    ),
                    'answer': {
                        'explanation': (
                            'Отдельный node ID запускает один тест. Общая команда запускает весь файл и проверяет, '
                            'что тесты не мешают друг другу.'
                        ),
                        'steps': [
                            'Запускаем каждый новый тест отдельно по node ID.',
                            'Проверяем, что каждый запуск прошёл.',
                            'Запускаем весь tests/test_api.py вместе с health-тестом.',
                        ],
                        'code': '''python -m pytest -q tests/test_api.py::test_list_returns_seeded_tasks
python -m pytest -q tests/test_api.py::test_stats_reports_all_tasks
python -m pytest -q tests/test_api.py::test_item_returns_public_task_without_tags
python -m pytest -q tests/test_api.py::test_create_then_read_uses_server_id
python -m pytest -q tests/test_api.py::test_put_replaces_task
python -m pytest -q tests/test_api.py::test_patch_applies_false_and_keeps_other_values
python -m pytest -q tests/test_api.py::test_delete_returns_empty_204_then_get_returns_404
python -m pytest -q tests/test_api.py::test_invalid_post_does_not_change_state
python -m pytest -q tests/test_api.py''',
                        'checks': [
                            'Каждый отдельный запуск прошёл.',
                            'Общий запуск включает health-тест и новые проверки.',
                            'Тесты используют отдельные данные.',
                        ],
                    },
                    'result': (
                        'Все новые тесты проходят отдельно и вместе с test_health_returns_ok.'
                    ),
                },
            ],
            'result': (
                'Сохранён test_health_returns_ok. В tests/test_api.py есть проверки GET списка, stats и item, '
                'POST и GET по выданному id, PUT, PATCH, DELETE и отказа POST без изменения данных. Новые тесты '
                'проходят отдельно и вместе. Приложение и fixtures не менялись.'
            ),
        }
    ],
    "57.1": [
        {
            'title': 'Шесть маршрутов /tasks работают через один router',
            'task': (
                'Сейчас шесть handlers и два HTTP-helper зарегистрированы в app/api.py. Там же создаются FastAPI '
                'и Planner, работают /health и /stats. Перенесите handlers в app/routers/tasks.py и подключите '
                'router к прежнему app. Проверьте, что адреса, методы, схемы, статусы, ответы и Planner не изменились.'
            ),
            'tasks': [
                {
                    'title': 'Пустой router для /tasks создан',
                    'task': (
                        'В app/api.py пока находятся шесть handlers, выбранный Planner и базовые TestClient-проверки. '
                        'Создайте пакет app/routers и файл tasks.py. Объявите в нём один APIRouter. Handlers пока '
                        'оставьте в api.py: приложение должно работать как прежде.'
                    ),
                    'requirements': [
                        'Созданы app/routers/__init__.py и app/routers/tasks.py.',
                        'В tasks.py объявлен один APIRouter с prefix="/tasks" и tags=["tasks"].',
                        'Базовые TestClient-проверки проходят до переноса handlers.',
                        'Не создаются второй FastAPI, Planner, storage или fixtures.',
                    ],
                    'hint': (
                        'См. разделы 01 и 02: найдите app в api.py, затем объявите router. Prefix задаётся один раз; '
                        'путь коллекции будет пустым.'
                    ),
                    'answer': {
                        'explanation': (
                            'Пакет даёт модулю место, а APIRouter собирает маршруты. Сам router не запускает '
                            'приложение и пока не подключён к FastAPI.'
                        ),
                        'steps': [
                            'Запускаем базовые тесты на исходном app.',
                            'Создаём app/routers/__init__.py и app/routers/tasks.py.',
                            'Объявляем один router с prefix /tasks и tag tasks.',
                            'Оставляем handlers и приложение без изменений.',
                        ],
                        'code': '''# app/routers/__init__.py
"""Группы маршрутов HTTP API."""

# app/routers/tasks.py
from fastapi import APIRouter

router = APIRouter(prefix="/tasks", tags=["tasks"])''',
                        'checks': [
                            'Импортируются пакет и модуль.',
                            'Prefix /tasks задан один раз; путь коллекции пустой.',
                            'Handlers остаются в api.py, исходные HTTP-тесты проходят.',
                        ],
                    },
                    'result': (
                        'В tasks.py есть один router с prefix /tasks и tag tasks. Handlers и ответы пока остаются в api.py.'
                    ),
                },
                {
                    'title': 'Шесть обработчиков и два helper перенесены в router',
                    'task': (
                        'После карточки 1 tasks.py содержит пустой router, а handlers ещё находятся в api.py. '
                        'Перенесите в tasks.py операции GET и POST для списка, а также GET, PUT, PATCH и DELETE '
                        'для задачи по id. Перенесите вместе с ними _task_read_data и '
                        '_call_with_task_not_found_as_404. Сохраните параметры и код функций, замените декораторы '
                        'app на router и удалите старые регистрации. Router подключим в карточке 3; до этого '
                        'HTTP-тесты не запускайте.'
                    ),
                    'requirements': [
                        'Для списка используйте пустой локальный путь; для задачи по id используйте /{task_id} (раздел 02).',
                        'Каждый handler получает Request и берёт Planner из request.app.state.planner (раздел 04).',
                        'Сохраните схемы, query, status_code, ответы и вызовы сервиса.',
                        'Перенесите оба HTTP-helper и удалите старые task-регистрации из api.py.',
                        'Не импортируйте app из api.py в tasks.py.',
                    ],
                    'hint': (
                        'См. разделы 02, 04 и 05. Сохраните параметры и response_model, берите Planner через Request. '
                        'После удаления старых декораторов маршруты временно не подключены. Проверьте их после карточки 3.'
                    ),
                    'answer': {
                        'explanation': (
                            'После переноса handlers и оба helper находятся в tasks.py. Меняем только декоратор: '
                            'app на router. Planner получаем через Request, как в разделе 04. Сверьте имена импортов '
                            'с кодом проекта; остальные слои не меняй.'
                        ),
                        'steps': [
                            'Переносим оба helper без изменения их работы.',
                            'Переносим шесть handlers, сохраняя параметры, схемы, query, статусы и вызовы сервиса.',
                            'Для списка оставляем путь пустым; для задачи по id используем /{task_id}.',
                            'Меняем декораторы app на router и удаляем старые регистрации из api.py.',
                            'Не запускаем TestClient: router подключится в карточке 3.',
                        ],
                        'code': '''# app/routers/tasks.py
from typing import Annotated

from fastapi import APIRouter, HTTPException, Path, Query, Request, Response, status

from app.errors import TaskNotFoundError
from app.schemas import TaskCreate, TaskPatch, TaskRead, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _call_with_task_not_found_as_404(operation, *args, **kwargs):
    try:
        return operation(*args, **kwargs)
    except TaskNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        ) from error


def _task_read_data(task):
    return {
        "id": task.id,
        "title": task.title,
        "priority": task.priority,
        "is_done": task.is_done,
    }


@router.get("", response_model=list[TaskRead])
def read_tasks(
    request: Request,
    is_done: bool | None = None,
    sort_desc: bool = False,
    limit: int = Query(default=10, ge=1, le=50),
):
    tasks = request.app.state.planner.select_tasks(
        is_done=is_done,
        sort_desc=sort_desc,
        limit=limit,
    )
    return [_task_read_data(task) for task in tasks]


@router.get("/{task_id}", response_model=TaskRead)
def read_task(request: Request, task_id: Annotated[int, Path(gt=0)]):
    task = _call_with_task_not_found_as_404(
        request.app.state.planner.get_task, task_id
    )
    return _task_read_data(task)


@router.put("/{task_id}", response_model=TaskRead)
def update_task(
    request: Request,
    task_id: Annotated[int, Path(gt=0)],
    payload: TaskUpdate,
):
    task = _call_with_task_not_found_as_404(
        request.app.state.planner.replace_task,
        task_id,
        title=payload.title,
        priority=payload.priority,
        is_done=payload.is_done,
    )
    return _task_read_data(task)


@router.patch("/{task_id}", response_model=TaskRead)
def patch_task_endpoint(
    request: Request,
    task_id: Annotated[int, Path(gt=0)],
    payload: TaskPatch,
):
    changes = payload.model_dump(exclude_unset=True, exclude_none=True)
    task = _call_with_task_not_found_as_404(
        request.app.state.planner.patch_task, task_id, **changes
    )
    return _task_read_data(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_endpoint(request: Request, task_id: Annotated[int, Path(gt=0)]):
    _call_with_task_not_found_as_404(
        request.app.state.planner.delete_task, task_id
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=TaskRead)
def create_task(request: Request, payload: TaskCreate):
    try:
        task = request.app.state.planner.add_task(
            payload.title,
            priority=payload.priority,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error),
        ) from error

    return _task_read_data(task)''',
                        'checks': [
                            'В router есть шесть прежних method/path.',
                            'Каждый handler берёт Planner через request.app.state.planner.',
                            'Ответ и обработка HTTP 404 не изменились; неожиданные ошибки не скрыты.',
                            'Старые декораторы удалены. Router пока не подключён к app.',
                        ],
                    },
                    'result': (
                        'В tasks.py находятся шесть маршрутов и оба helper. Старые регистрации удалены из api.py. '
                        'Router пока не подключён; это временный шаг перед карточкой 3.'
                    ),
                },
                {
                    'title': 'Tasks-router подключён один раз и сохраняет договор API',
                    'task': (
                        'После карточки 2 handlers и оба helper находятся в tasks.py; старых task-регистраций в api.py нет. '
                        'Импортируйте router и подключите его к прежнему app один раз. Сохраните FastAPI, build_service, '
                        'app.state.planner, /health и /stats. Затем запустите базовые проверки, откройте OpenAPI, '
                        'отправьте запрос к /tasks без redirect и повторите сохранённые Postman-запросы.'
                    ),
                    'requirements': [
                        'В api.py остаются один FastAPI-app и выбранный Planner.',
                        'Вызов app.include_router(tasks_router) встречается один раз.',
                        '/health и /stats остаются в api.py.',
                        'В OpenAPI видны шесть разных tasks-операций; базовые тесты проходят.',
                        'Запросы к /tasks проверяются без автоматического redirect.',
                        'Сохранённые Postman-запросы работают по прежним адресам.',
                    ],
                    'hint': (
                        'См. разделы 01, 02, 03 и 05. Проверьте импорт, один вызов include_router и маршруты в OpenAPI. '
                        'Для /tasks отключите автоматический redirect, чтобы увидеть первый ответ.'
                    ),
                    'answer': {
                        'explanation': (
                            'Подключаем router к прежнему app одним вызовом include_router. Этот вызов не запускает '
                            'сервер и не создаёт новый Planner. Тестами, OpenAPI и запросом без redirect проверяем '
                            'разные части прежнего договора.'
                        ),
                        'steps': [
                            'Импортируем router из app.routers.tasks как tasks_router.',
                            'Один раз вызываем app.include_router(tasks_router) после создания app и Planner.',
                            'Оставляем /health и /stats в api.py.',
                            'Запускаем базовые TestClient-тесты и проверяем шесть операций в OpenAPI.',
                            'Отправляем GET и POST на /tasks с выключенным redirect; проверяем первый ответ.',
                            'Повторяем сохранённые Postman-запросы и сравниваем ответы Planner.',
                        ],
                        'code': '''# app/api.py
from fastapi import FastAPI

from app.main import build_service
from app.routers.tasks import router as tasks_router

app = FastAPI(title="StudyHub Planner")
app.state.planner = build_service()
app.include_router(tasks_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/stats")
def read_stats():
    statistics = app.state.planner.get_statistics()
    return {
        "total": statistics["all"],
        "open": statistics["open"],
        "done": statistics["done"],
    }''',
                        'checks': [
                            'В OpenAPI есть шесть прежних method/path без дублей.',
                            '/health и /stats отвечают через прежний app.',
                            'Базовые тесты подтверждают прежние схемы, статусы, ответы и состояние.',
                            'GET /tasks возвращает первый ответ без автоматического перехода.',
                        ],
                    },
                    'result': (
                        'В api.py остаются один FastAPI-app, прежний Planner, /health и /stats. '
                        'include_router(tasks_router) встречается один раз. В OpenAPI видны GET/POST /tasks и '
                        'GET/PUT/PATCH/DELETE /tasks/{task_id}. Без redirect GET /tasks возвращает 200 без Location; '
                        'POST /tasks с корректным телом возвращает 201; /health и /stats возвращают 200. '
                        'Базовые тесты проходят.'
                    ),
                },
            ],
            'result': (
                'Один tasks-router подключён к прежнему FastAPI-app. Все шесть маршрутов и базовые тесты сохраняют '
                'публичный договор; health, stats и Planner остаются на своих местах.'
            ),
        }
    ],
    "58.1": [
        {
            'title': 'Отказ сохраняет данные, PATCH с false меняет is_done',
            'task': (
                'Продолжите tests/test_contract.py. В файле уже есть проверки body, path и помощник _error_field(response). '
                'Используйте api_client из tests/conftest.py. Берите id из ответа POST и сравнивайте состояние Planner '
                'до и после запроса.'
            ),
            'tasks': [
                {
                    'title': 'Исходный снимок охватывает обе задачи и статистику',
                    'task': (
                        'В tests/test_contract.py добавьте помощники: один создаёт две задачи, другой читает их и /stats. '
                        'В начале теста сохраните ответы как исходный снимок.'
                    ),
                    'result': (
                        'GET по обоим id возвращает полные TaskRead. В исходном /stats: '
                        'total=2, open=2, done=0.'
                    ),
                    'requirements': [
                        'Создайте обе задачи через POST и возьмите id из ответов со статусом 201.',
                        'Сохраните полный TaskRead цели, TaskRead соседа и ответ /stats.',
                        'Начните с двух открытых задач во временном хранилище. Рабочий data/tasks.json не используйте.',
                    ],
                    'hint': (
                        'Создайте задачи в одном тесте. Фикстура api_client использует для его запросов один временный JSON.'
                    ),
                    'answer': {
                        'explanation': (
                            'Возьмите id из каждого POST-ответа. Повторный GET вернёт публичный объект задачи. Эти две '
                            'задачи и stats станут исходным снимком для следующих проверок.'
                        ),
                        'steps': [
                            'Создаём цель и соседа через POST.',
                            'Проверяем статус 201 и сохраняем ответы.',
                            'Читаем обе задачи по их id и запрашиваем /stats.',
                            'Проверяем два объекта и счётчики: две открытые задачи.',
                        ],
                        'code': '''def _create_contract_pair(api_client):
    target_response = api_client.post(
        "/tasks", json={"title": "Целевая", "priority": 2}
    )
    control_response = api_client.post(
        "/tasks", json={"title": "Контрольная", "priority": 4}
    )

    assert target_response.status_code == 201
    assert control_response.status_code == 201
    return target_response.json(), control_response.json()


def _contract_state(api_client, target_id, control_id):
    return {
        "target": api_client.get(f"/tasks/{target_id}").json(),
        "control": api_client.get(f"/tasks/{control_id}").json(),
        "stats": api_client.get("/stats").json(),
    }


def test_contract_baseline_captures_both_records(api_client):
    target, control = _create_contract_pair(api_client)
    before = _contract_state(api_client, target["id"], control["id"])

    assert before["target"] == target
    assert before["control"] == control
    assert before["stats"] == {"total": 2, "open": 2, "done": 0}''',
                        'checks': [
                            'Оба id взяты из POST-ответов; повторный GET возвращает обе задачи.',
                            'Временное хранилище содержит две открытые задачи.',
                        ],
                    },
                },
                {
                    'title': 'Ошибочные POST, PUT и PATCH сохраняют снимок',
                    'task': (
                        'Добавьте test_invalid_writes_preserve_public_state. Отправьте по очереди POST, PUT и PATCH с '
                        'неверным title. После каждого ответа проверьте цель, соседа и /stats.'
                    ),
                    'result': (
                        'Каждый запрос возвращает 422 с ошибкой title. Цель, сосед и stats остаются прежними; POST не добавляет задачу.'
                    ),
                    'requirements': [
                        'В каждом запросе неверен только title. Остальные поля и положительный id корректны.',
                        'Проверьте статус 422 и поле title в detail.',
                        'После каждого запроса перечитайте обе задачи и stats. У POST total не должен вырасти.',
                    ],
                    'hint': (
                        'Сохраните снимок до запросов. После каждого 422 создавайте новый снимок и сравнивайте его с исходным.'
                    ),
                    'answer': {
                        'explanation': (
                            'В каждом запросе неверен только title. Статус и detail подтверждают причину, а повторные GET '
                            'показывают, что цель и сосед не изменились.'
                        ),
                        'steps': [
                            'Создаём две задачи и сохраняем исходный снимок.',
                            'Отправляем POST с пробельным title.',
                            'Отправляем PUT с пустым title и PATCH с пробельным title на id цели.',
                            'После каждого 422 проверяем title в detail и сравниваем снимок.',
                        ],
                        'code': '''def test_invalid_writes_preserve_public_state(api_client):
    target, control = _create_contract_pair(api_client)
    target_path = f"/tasks/{target['id']}"
    before = _contract_state(api_client, target["id"], control["id"])

    response = api_client.post(
        "/tasks", json={"title": "   ", "priority": 2}
    )
    assert response.status_code == 422
    assert _error_field(response) == "title"
    assert _contract_state(api_client, target["id"], control["id"]) == before

    response = api_client.put(
        target_path,
        json={"title": "", "priority": 4, "is_done": True},
    )
    assert response.status_code == 422
    assert _error_field(response) == "title"
    assert _contract_state(api_client, target["id"], control["id"]) == before

    response = api_client.patch(target_path, json={"title": " "})
    assert response.status_code == 422
    assert _error_field(response) == "title"
    assert _contract_state(api_client, target["id"], control["id"]) == before''',
                        'checks': [
                            'Все три запроса получают 422 по title.',
                            'После каждого запроса цель, сосед и stats совпадают с исходным снимком.',
                        ],
                    },
                },
                {
                    'title': 'PUT отклоняет пропуск каждого обязательного поля без изменений',
                    'task': (
                        'Расширьте test_put_requires_every_editable_field. По очереди уберите из PUT одно поле: title, '
                        'priority или is_done. После каждого отказа проверьте цель, соседа и /stats.'
                    ),
                    'result': (
                        'Каждый пропуск даёт 422 с именем поля. Цель, сосед и stats не меняются.'
                    ),
                    'requirements': [
                        'Запустите три случая: в каждом пропущено ровно одно поле.',
                        'Проверьте статус 422 и имя пропущенного поля.',
                        'После каждого отказа сравните полные снимки двух задач и stats.',
                    ],
                    'hint': (
                        'Начните с корректного body. Удаляйте одно поле через pop, отправляйте PUT и читайте состояние снова.'
                    ),
                    'answer': {
                        'explanation': (
                            'PUT требует все три поля. Параметризация проверит каждый пропуск отдельно, а сравнение снимков '
                            'покажет, что отказ ничего не изменил.'
                        ),
                        'steps': [
                            'Создаём цель и соседа, сохраняем их снимок.',
                            'Собираем полный PUT-body.',
                            'Удаляем одно поле и отправляем запрос.',
                            'Проверяем ошибку и перечитываем обе задачи и stats.',
                        ],
                        'code': '''@pytest.mark.parametrize(
    "missing_field",
    ["title", "priority", "is_done"],
)
def test_put_requires_every_editable_field(
    api_client, missing_field
):
    target, control = _create_contract_pair(api_client)
    target_path = f"/tasks/{target['id']}"
    before = _contract_state(api_client, target["id"], control["id"])
    payload = {
        "title": "Обновлённая задача",
        "priority": 1,
        "is_done": True,
    }
    payload.pop(missing_field)

    response = api_client.put(target_path, json=payload)

    assert response.status_code == 422
    assert _error_field(response) == missing_field
    assert _contract_state(api_client, target["id"], control["id"]) == before''',
                        'checks': [
                            'Каждый пропуск даёт 422 с нужным полем в detail.',
                            'Обе задачи и stats остаются без изменений.',
                        ],
                    },
                },
                {
                    'title': 'PATCH сохраняет пропуск и null, но применяет false',
                    'task': (
                        'Проверьте PATCH с пустым объектом {} и с {"title": null}: они не меняют задачу. Затем '
                        'отправьте is_done: false и проверьте, что изменилось только это поле цели.'
                    ),
                    'result': (
                        'Пустой JSON-объект и поле null оставляют снимок прежним. После перехода is_done в true PATCH с false '
                        'открывает только цель; сосед и остальные поля сохраняются.'
                    ),
                    'requirements': [
                        'PATCH с {} и {"title": None} возвращает 200 и прежний TaskRead.',
                        'После каждого no-op перечитайте обе задачи и /stats: они должны совпасть с исходным снимком.',
                        'Перед проверкой false переведите цель в is_done=True корректным PUT.',
                        'После PATCH с false проверьте все поля цели, соседа и stats.',
                    ],
                    'hint': (
                        'Проверьте {} и null отдельно. Перед false сначала завершите цель, чтобы увидеть изменение.'
                    ),
                    'answer': {
                        'explanation': (
                            'В этом API пропуск и null не меняют значение. false передаётся явно, поэтому должен изменить '
                            'is_done. Полные снимки подтвердят оба результата.'
                        ),
                        'steps': [
                            'Для {} и null по очереди создаём пару задач и сохраняем снимок.',
                            'Отправляем PATCH и проверяем 200, ответ, соседа и stats.',
                            'В отдельном тесте ставим цели is_done=True через PUT.',
                            'Отправляем PATCH с false и сравниваем цель, соседа и stats.',
                        ],
                        'code': '''@pytest.mark.parametrize("payload", [{}, {"title": None}])
def test_patch_omission_and_null_keep_state(
    api_client, payload
):
    target, control = _create_contract_pair(api_client)
    target_path = f"/tasks/{target['id']}"
    before = _contract_state(api_client, target["id"], control["id"])

    response = api_client.patch(target_path, json=payload)

    assert response.status_code == 200
    assert response.json() == before["target"]
    assert _contract_state(api_client, target["id"], control["id"]) == before


def test_patch_false_changes_only_done_state(api_client):
    target, control = _create_contract_pair(api_client)
    target_path = f"/tasks/{target['id']}"
    ready = api_client.put(
        target_path,
        json={
            "title": target["title"],
            "priority": target["priority"],
            "is_done": True,
        },
    )
    assert ready.status_code == 200
    before = _contract_state(api_client, target["id"], control["id"])
    assert before["target"]["is_done"] is True

    response = api_client.patch(
        target_path, json={"is_done": False}
    )

    expected_target = {
        "id": target["id"],
        "title": before["target"]["title"],
        "priority": before["target"]["priority"],
        "is_done": False,
    }
    assert response.status_code == 200
    assert response.json() == expected_target
    after = _contract_state(api_client, target["id"], control["id"])
    assert after["target"] == expected_target
    assert after["control"] == before["control"]
    assert after["stats"] == {
        "total": before["stats"]["total"],
        "open": before["stats"]["open"] + 1,
        "done": before["stats"]["done"] - 1,
    }''',
                        'checks': [
                            '{} и null оставляют TaskRead, соседа и stats прежними.',
                            'false меняет is_done цели, но не её другие поля и не соседа.',
                            'stats показывает, что цель снова открыта.',
                        ],
                    },
                },
            ],
            'result': (
                'tests/test_contract.py проверяет отказные POST/PUT/PATCH по статусу и причине, сравнивает публичные записи '
                'и stats до и после, подтверждает полноту PUT и различает пустой/null PATCH от явного false.'
            ),
        }
    ],
    "58.2": [
        {
            'title': 'Проверим запросы списка и описание API',
            'task': (
                'В tests/test_contract.py продолжите test_query_defaults_and_filter_sort_limit_do_not_change_source. '
                'Используйте api_service для подготовки задач и api_client для запросов. Сохраните полезные проверки, '
                'а данные или ожидаемые id измените там, где тест не замечает неверный ответ. Маршруты и рабочий JSON не меняйте.'
            ),
            'tasks': [
                {
                    'title': 'Завершённая задача имеет наибольший id',
                    'task': (
                        'Тест создаёт 12 задач и завершает одну из них. Сейчас завершена задача created[2]. '
                        'Замените её на последнюю задачу из created и обновите ожидаемые id. Тогда запрос открытых задач '
                        'с сортировкой по убыванию и limit=1 покажет, что фильтр сработал первым.'
                    ),
                    'requirements': [
                        'Завершена только последняя созданная задача; её id самый большой.',
                        'Списки id для всех, открытых и завершённых задач составлены из объектов created.',
                        'Ожидаемый ответ содержит самый большой id открытой задачи; числа id не заданы вручную.',
                        'api_service и api_client продолжают использовать временный JSON этой функции теста.',
                    ],
                    'result': (
                        'Запрос открытых задач с sort_desc=True и limit=1 возвращает самый большой открытый id. '
                        'Если limit применить до фильтра, проверка обнаружит пустой ответ.'
                    ),
                    'hint': (
                        'Вместо created[2] используйте created[-1]. По списку created соберите all_ids, open_ids и done_ids.'
                    ),
                    'answer': {
                        'explanation': (
                            'Запрос сначала оставляет открытые задачи, затем сортирует их и берёт одну. Так он вернёт '
                            'самый большой открытый id. Если limit сработает раньше фильтра, останется завершённая задача, '
                            'и ответ будет пустым. Завершённая задача в середине списка такую ошибку может скрыть.'
                        ),
                        'steps': [
                            'Оставляем создание 12 задач через api_service.',
                            'Заменяем created[2] на created[-1] в вызове mark_done.',
                            'Собираем ожидаемые id из созданных объектов.',
                            'Сравниваем id из ответа api_client с ожидаемым списком.',
                        ],
                        'code': '''# В test_query_defaults_and_filter_sort_limit_do_not_change_source
# Замените прежний вызов mark_done(created[2].id) этой строкой.
api_service.mark_done(created[-1].id)
all_ids = [task.id for task in created]
assert created[-1].id == max(all_ids)
open_ids = [task.id for task in created[:-1]]
done_ids = [created[-1].id]

descending_open = api_client.get(
    "/tasks",
    params={"is_done": False, "sort_desc": True, "limit": 1},
)
assert descending_open.status_code == 200
assert [task["id"] for task in descending_open.json()] == sorted(
    open_ids, reverse=True
)[:1]

completed = api_client.get(
    "/tasks",
    params={"is_done": True, "sort_desc": False, "limit": 50},
)
assert [task["id"] for task in completed.json()] == done_ids''',
                        'checks': [
                            'Завершена задача с самым большим id.',
                            'Запрос открытых задач с обратной сортировкой и limit=1 возвращает один верный id.',
                            'Запрос is_done=True возвращает id завершённой задачи.',
                        ],
                    },
                },
                {
                    'title': 'Список соблюдает значения по умолчанию и limit',
                    'task': (
                        'В том же тесте проверьте готовые query-запросы. GET без параметров возвращает первые 10 id по '
                        'возрастанию; limit=50 без is_done возвращает все 12 задач. Запросы открытых задач проверяют оба '
                        'направления, а запрос is_done=True показывает завершённую группу. Сохраните готовые проверки limit.'
                    ),
                    'requirements': [
                        'GET без параметров возвращает первые 10 id по возрастанию.',
                        'Запрос с limit=50 без is_done возвращает все id, включая завершённую задачу.',
                        'Открытые и завершённые задачи сравниваются по точным спискам id; открытые проверяются в обоих направлениях.',
                        'Готовые проверки принимают limit 1 и 50, а для 0, 51 и many получают 422 с причиной limit.',
                    ],
                    'result': (
                        'Ожидаемые id подтверждают значения по умолчанию, оба статуса и оба направления сортировки. '
                        'Границы limit проверяются существующими тестами.'
                    ),
                    'hint': (
                        'Возьмите all_ids, open_ids и done_ids из предыдущей карточки. Сравните списки id, а для limit найдите готовый параметризованный тест.'
                    ),
                    'answer': {
                        'explanation': (
                            'Для проверки limit=10 нужны 12 задач. Запрос с limit=50 без is_done подтверждает, что '
                            'фильтр статуса по умолчанию выключен. Сравнивайте id: одинаковое число задач не гарантирует '
                            'правильный порядок. Через params TestClient отправляет обычные query-параметры.'
                        ),
                        'steps': [
                            'Сравниваем GET без параметров с первыми 10 id по возрастанию.',
                            'Проверяем, что limit=50 без is_done возвращает все задачи.',
                            'Сверяем открытые задачи по id в обоих направлениях и завершённую группу.',
                            'Оставляем существующие проверки допустимых и ошибочных limit.',
                        ],
                        'code': '''# Продолжение того же query-теста
default_page = api_client.get("/tasks")
assert default_page.status_code == 200
assert [task["id"] for task in default_page.json()] == sorted(all_ids)[:10]

all_statuses = api_client.get("/tasks", params={"limit": 50})
assert [task["id"] for task in all_statuses.json()] == sorted(all_ids)

ascending_open = api_client.get(
    "/tasks",
    params={"is_done": False, "sort_desc": False, "limit": 50},
)
descending_open = api_client.get(
    "/tasks",
    params={"is_done": False, "sort_desc": True, "limit": 50},
)
assert [task["id"] for task in ascending_open.json()] == sorted(open_ids)
assert [task["id"] for task in descending_open.json()] == sorted(
    open_ids, reverse=True
)

# Существующие проверки limit=1/50 и limit=0/51/many остаются в тестовом файле.''',
                        'checks': [
                            'GET без параметров возвращает ровно первые 10 id по возрастанию.',
                            'Запрос limit=50 без is_done возвращает все id, включая завершённую запись.',
                            'Оба направления возвращают ожидаемые списки открытых id.',
                            'Готовые тесты границ выполняются один раз и проверяют, что ошибка относится к limit.',
                        ],
                    },
                },
                {
                    'title': 'GET-запросы не меняют JSON и stats',
                    'task': (
                        'В тесте test_query_defaults_and_filter_sort_limit_do_not_change_source сохраните /stats и байты '
                        'api_service.storage.path после подготовки задач. После успешных GET сравните их с исходными. '
                        'Неверные значения limit уже проверяются отдельными тестами.'
                    ),
                    'requirements': [
                        'Сохраните /stats и байты файла после создания и завершения всех 12 задач.',
                        '/stats учитывает все 12 задач, даже если GET /tasks вернул только часть.',
                        'До и после успешных GET сравните байты api_service.storage.path.',
                        'Оставьте отдельные проверки limit=0/51/many на месте; рабочий JSON не используйте.',
                    ],
                    'result': (
                        'После успешных GET ответ /stats и байты временного JSON совпадают с исходными.'
                    ),
                    'hint': (
                        'Путь находится в api_service.storage.path. Сохраните его байты после подготовки задач и '
                        'сравните после GET. Проверки неверного limit не переносите в этот тест.'
                    ),
                    'answer': {
                        'explanation': (
                            'GET /tasks формирует ответ и не сохраняет отфильтрованный список. Поэтому /stats и JSON '
                            'остаются прежними. Равная длина двух ответов этого не докажет, а равные байты файла докажут.'
                        ),
                        'steps': [
                            'Берём путь временного файла из api_service.storage.path.',
                            'Сохраняем /stats и байты файла после подготовки задач.',
                            'Выполняем успешные GET-запросы.',
                            'Сравниваем /stats и байты файла с исходными.',
                        ],
                        'code': '''# Фрагмент test_query_defaults_and_filter_sort_limit_do_not_change_source
path = api_service.storage.path
stats_before = api_client.get("/stats").json()
bytes_before = path.read_bytes()

# Здесь выполняются успешные query-запросы из предыдущих шагов.

assert api_client.get("/stats").json() == stats_before
assert path.read_bytes() == bytes_before''',
                        'checks': [
                            '/stats до и после GET совпадает и учитывает все задачи.',
                            'Байты временного файла до и после GET совпадают.',
                            'Тест использует tmp_path, а рабочий JSON приложения не затронут.',
                        ],
                    },
                },
                {
                    'title': 'OpenAPI описывает маршруты и схемы',
                    'task': (
                        'В tests/test_contract.py расширьте test_openapi_documents_current_contract. Оставьте готовые '
                        'проверки обязательных полей четырёх схем. Добавьте проверки адресов и методов, успешных статусов, '
                        'query-параметров списка и положительного task_id.'
                    ),
                    'requirements': [
                        'Проверены четыре адреса: /health, /tasks, /tasks/{task_id} и /stats.',
                        'Проверены восемь методов и их статусы: GET возвращает 200, POST возвращает 201, PUT/PATCH возвращают 200, DELETE возвращает 204.',
                        'Для GET /tasks проверены is_done, sort_desc=False по умолчанию и limit=10 с границами 1–50.',
                        'Для task_id проверены обязательность и ограничение «больше нуля».',
                        'Проверяются нужные поля документа, а не весь JSON и его порядок.',
                    ],
                    'result': (
                        'Тест проверяет четыре адреса, восемь методов, их статусы, параметры списка и четыре схемы.'
                    ),
                    'hint': (
                        'Составьте словари путей и параметров. Статус ищите в responses метода. Готовые проверки required оставьте.'
                    ),
                    'answer': {
                        'explanation': (
                            'OpenAPI описывает адреса, методы и схемы, которые приложение сообщает клиенту. У одного адреса '
                            'может быть несколько методов: на /tasks два, а на /tasks/{task_id} четыре. Поэтому адресов четыре, '
                            'а методов восемь.'
                        ),
                        'steps': [
                            'Получаем /openapi.json через api_client и читаем document["paths"].',
                            'Проверяем четыре адреса и методы на каждом адресе.',
                            'Для каждого метода ищем успешный статус в responses.',
                            'Проверяем query-параметры, task_id и свойства схем.',
                            'Оставляем прежние проверки обязательных полей и не сравниваем весь документ.',
                        ],
                        'code': '''# Дополнение существующего OpenAPI-теста
document = api_client.get("/openapi.json").json()
paths = document["paths"]
assert set(paths) == {"/health", "/tasks", "/tasks/{task_id}", "/stats"}
assert set(paths["/health"]) == {"get"}
assert set(paths["/tasks"]) == {"get", "post"}
assert set(paths["/tasks/{task_id}"]) == {"get", "put", "patch", "delete"}
assert set(paths["/stats"]) == {"get"}

expected_statuses = {
    "/health": {"get": "200"},
    "/tasks": {"get": "200", "post": "201"},
    "/tasks/{task_id}": {
        "get": "200", "put": "200", "patch": "200", "delete": "204"
    },
    "/stats": {"get": "200"},
}
for path, methods in expected_statuses.items():
    for method, status in methods.items():
        assert status in paths[path][method]["responses"]

query = {
    item["name"]: item
    for item in paths["/tasks"]["get"]["parameters"]
}
assert query["is_done"]["required"] is False
assert query["sort_desc"]["schema"]["default"] is False
assert query["limit"]["schema"]["default"] == 10
assert query["limit"]["schema"]["minimum"] == 1
assert query["limit"]["schema"]["maximum"] == 50

item_parameters = {
    item["name"]: item
    for item in paths["/tasks/{task_id}"]["get"]["parameters"]
}
task_id = item_parameters["task_id"]
assert task_id["required"] is True
id_schema = task_id["schema"]
assert id_schema.get("minimum", 0) >= 1 or id_schema.get("exclusiveMinimum", -1) >= 0

schemas = document["components"]["schemas"]
assert set(schemas["TaskRead"]["properties"]) == {
    "id", "title", "priority", "is_done"
}
# Существующие проверки required-наборов четырёх схем сохраняются.''',
                        'checks': [
                            'В документе четыре адреса и восемь операций.',
                            'У каждой операции указан ожидаемый успешный статус.',
                            'Параметры списка и положительный task_id описаны верно.',
                            'Существующие проверки четырёх схем сохранены.',
                        ],
                    },
                },
            ],
            'result': (
                'Проверки подтверждают порядок filter → sort → limit, значения query по умолчанию и границы limit. '
                'GET не меняет stats и временный JSON. OpenAPI описывает четыре адреса, восемь операций и четыре схемы; '
                'приложение и рабочие данные остаются прежними.'
            ),
        }
    ],
    58: [
        {
            'title': 'Границы body и path проверяются отдельно',
            'task': (
                'Работайте из корня StudyHub.\n\nСтарт (A). Уже готовы:\n- fixture api_client в tests/conftest.py: она запускает настоящий app с отдельным временным хранилищем;\n- маршруты POST /tasks и PUT /tasks/{task_id} и их схемы.\n\nРезультат (B). Добавьте contract-тесты в tests/test_contract.py и проверяйте ответы API. Для каждого PUT отправляйте полный body: title, priority и is_done. Обработчики, схемы, сервис, CLI и рабочие данные не меняйте.'
            ),
            'tasks': [
                {
                    'title': 'Создайте задачу и обновите её по id',
                    'task': (
                        'Создайте tests/test_contract.py, если файла нет. Удалите pass из заготовки и допишите тест.\n\n1. Отправьте POST /tasks с title "Before" и priority 3.\n2. Возьмите id из JSON-ответа.\n3. Отправьте PUT по этому id с полным body: {"title": "After", "priority": 4, "is_done": true}.'
                    ),
                    'requirements': ['POST через api_client возвращает 201.', 'Тест получает id из ответа и проверяет, что id больше нуля.', 'Полный PUT по этому id возвращает 200.', 'Ответ содержит тот же id, title "After", priority 4 и is_done=true.'],
                    'hint': (
                        'response.json() возвращает словарь. Читайте id как response.json()["id"], а адрес соберите f-строкой: f"/tasks/{task_id}".'
                    ),
                    'answer': {
                        'explanation': (
                            'POST создаёт запись и возвращает её id. Тест проверяет положительное значение и использует тот же id для PUT. Так проверяется обновление существующей задачи.'
                        ),
                        'steps': ['Отправьте POST с допустимыми полями.', 'Прочитайте id из JSON и проверьте, что он больше нуля.', 'Отправьте полный PUT по этому id.', 'Проверьте статус, id и поля в ответе.'],
                        'code': '''# tests/test_contract.py
import pytest


def test_put_uses_positive_id(api_client):
    created = api_client.post(
        "/tasks", json={"title": "Before", "priority": 3}
    )
    assert created.status_code == 201
    task_id = created.json()["id"]
    assert task_id > 0

    response = api_client.put(
        f"/tasks/{task_id}",
        json={"title": "After", "priority": 4, "is_done": True},
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": task_id,
        "title": "After",
        "priority": 4,
        "is_done": True,
    }''',
                        'checks': ['Id берётся из ответа POST, а не задаётся заранее.', 'В body PUT есть все три поля: title, priority и is_done.'],
                    },
                    'result': (
                        'Созданная через API задача обновляется по полученному положительному id.'
                    ),
                },
                {
                    'title': 'Проверьте границы title',
                    'task': (
                        'Добавьте один параметризованный тест полного PUT. В каждом запуске создайте задачу через POST и возьмите её id. Для PUT оставьте priority=3 и is_done=false.\n\nПроверьте title: одну букву, 120 букв, 120 букв с пробелами по краям, пустую строку, строку из пробелов, 121 букву и число 123.'
                    ),
                    'requirements': ['Функция test_put_title_boundaries получает title, expected_status и expected_title.', 'Одна буква, 120 букв и 120 букв с внешними пробелами дают 200. В ответе title очищен от пробелов по краям.', 'Пустая строка, пробелы, 121 буква и число дают 422.', 'Для 422 проверьте поле title в detail.loc. Для 200 проверьте title и id.', 'Каждый вариант создаёт свою задачу через POST.'],
                    'hint': (
                        'Запишите входные значения и ожидания в список для parametrize. Создавайте задачу внутри тестовой функции: каждый вариант запускается отдельно.'
                    ),
                    'answer': {
                        'explanation': (
                            'Схема сначала убирает пробелы по краям, затем проверяет длину. Поэтому 120 букв с внешними пробелами проходят, а в ответе пробелы уже удалены. Пустое значение, 121 буква и число отклоняются.'
                        ),
                        'steps': ['Добавьте _error_field(response), чтобы получить последнее имя из detail[0]["loc"].', 'Составьте список title и ожидаемых значений.', 'В тесте создайте задачу и получите её id.', 'Отправьте полный PUT и проверьте статус.', 'При успехе проверьте очищенный title и id; при отказе поле title.'],
                        'code': '''def _error_field(response):
    return response.json()["detail"][0]["loc"][-1]


@pytest.mark.parametrize(
    ("title", "expected_status", "expected_title"),
    [
        ("A", 200, "A"),
        ("A" * 120, 200, "A" * 120),
        ("  " + "A" * 120 + "  ", 200, "A" * 120),
        ("", 422, None),
        ("   ", 422, None),
        ("A" * 121, 422, None),
        (123, 422, None),
    ],
)
def test_put_title_boundaries(
    api_client, title, expected_status, expected_title
):
    created = api_client.post(
        "/tasks", json={"title": "Before", "priority": 3}
    )
    task_id = created.json()["id"]
    response = api_client.put(
        f"/tasks/{task_id}",
        json={"title": title, "priority": 3, "is_done": False},
    )

    assert response.status_code == expected_status
    if expected_status == 200:
        assert response.json()["title"] == expected_title
        assert response.json()["id"] == task_id
    else:
        assert _error_field(response) == "title"''',
                        'checks': ['Все семь значений проверяются одной функцией и получают отдельный id.', 'Успешный ответ содержит очищенный title; отказ указывает на title.'],
                    },
                    'result': (
                        'Проверены минимальная и максимальная длина, очистка краёв и отказ для недопустимых значений.'
                    ),
                },
                {
                    'title': 'Проверьте границы priority',
                    'task': (
                        'Добавьте отдельный параметризованный тест priority. Для каждого значения создайте задачу через POST, возьмите её id и отправьте полный PUT. Оставьте title="Valid title" и is_done=false.\n\nПроверьте значения 1, 5, 0, 6 и "high".'
                    ),
                    'requirements': ['1 и 5 дают 200; ответ содержит переданный priority и id задачи.', '0, 6 и "high" дают 422.', 'При отказе detail.loc указывает на priority.', 'Не меняйте схему и правила преобразования значений.'],
                    'hint': (
                        'Оставьте title, is_done и id корректными. Тогда меняется только priority.'
                    ),
                    'answer': {
                        'explanation': (
                            'Диапазон priority включает числа от 1 до 5. Ноль и шесть не входят в него. Текст "high" нельзя преобразовать в целое число. Правила схемы остаются прежними.'
                        ),
                        'steps': ['Запишите priority и ожидаемый статус в parametrize.', 'В каждом запуске создайте задачу и возьмите id.', 'Отправьте полный PUT, изменив только priority.', 'Проверьте статус и поле ошибки либо значение в ответе.'],
                        'code': '''@pytest.mark.parametrize(
    ("priority", "expected_status"),
    [
        (1, 200),
        (5, 200),
        (0, 422),
        (6, 422),
        ("high", 422),
    ],
)
def test_put_priority_boundaries(
    api_client, priority, expected_status
):
    created = api_client.post(
        "/tasks", json={"title": "Before", "priority": 3}
    )
    task_id = created.json()["id"]
    response = api_client.put(
        f"/tasks/{task_id}",
        json={
            "title": "Valid title",
            "priority": priority,
            "is_done": False,
        },
    )

    assert response.status_code == expected_status
    if expected_status == 200:
        assert response.json()["priority"] == priority
        assert response.json()["id"] == task_id
    else:
        assert _error_field(response) == "priority"''',
                        'checks': ['1 и 5 проходят, 0 и 6 отклоняются.', 'Значение "high" отклоняется с указанием поля priority.'],
                    },
                    'result': (
                        'Тест подтверждает включённые границы priority и поле каждого отказа.'
                    ),
                },
                {
                    'title': 'Отличите неверный path от отсутствующей задачи',
                    'task': (
                        'Добавьте проверки PUT для path.\n\n1. Для not-an-integer, 0 и -1 создайте задачу через POST. Отправьте PUT с этим path и корректным полным body.\n2. Отдельно создайте задачу, вычислите другой положительный id, которого нет в хранилище, и отправьте PUT с тем же корректным body.'
                    ),
                    'requirements': ['Текст, 0 и -1 дают 422; detail.loc указывает на task_id.', 'В каждом запросе body содержит допустимые title, priority и is_done.', 'Id существующей задачи берётся из POST.', 'Отсутствующий положительный id даёт 404.', 'Успешный PUT по существующему id уже проверен в карточке 1.'],
                    'hint': (
                        'Path сначала проверяет тип и gt=0, затем сервис ищет запись. Для 404 возьмите положительный id, которого нет в новом временном хранилище.'
                    ),
                    'answer': {
                        'explanation': (
                            'Текст нельзя преобразовать в int, а 0 и -1 не проходят gt=0. Поэтому ответ 422 возникает до поиска. Положительный id проходит проверку; если задачи с ним нет, API отвечает 404.'
                        ),
                        'steps': ['Запишите три недопустимых path-значения для parametrize.', 'В каждом запуске создайте контрольную задачу.', 'Отправьте полный PUT и проверьте 422 и поле task_id.', 'Для отдельного случая получите отсутствующий положительный id.', 'Отправьте корректный PUT и проверьте 404.'],
                        'code': '''@pytest.mark.parametrize(
    "path_value",
    ["not-an-integer", 0, -1],
)
def test_put_rejects_invalid_task_id(api_client, path_value):
    created = api_client.post(
        "/tasks", json={"title": "Before", "priority": 3}
    )
    task_id = created.json()["id"]
    assert task_id > 0
    response = api_client.put(
        f"/tasks/{path_value}",
        json={"title": "Valid title", "priority": 3, "is_done": False},
    )

    assert response.status_code == 422
    assert _error_field(response) == "task_id"


def test_put_returns_404_for_missing_positive_id(api_client):
    created = api_client.post(
        "/tasks", json={"title": "Before", "priority": 3}
    )
    task_id = created.json()["id"]
    missing_id = task_id + 10
    response = api_client.put(
        f"/tasks/{missing_id}",
        json={"title": "Valid title", "priority": 3, "is_done": False},
    )

    assert missing_id > 0
    assert response.status_code == 404''',
                        'checks': ['Неверная форма и неположительные числа дают 422 с полем task_id.', 'Отсутствующий положительный id даёт 404 при корректном body.', 'Существующий положительный id даёт успешный ответ в карточке 1.'],
                    },
                    'result': (
                        'Проверки различают неверный path, существующую задачу и отсутствующий положительный id.'
                    ),
                },
            ],
            'result': (
                'В tests/test_contract.py будут проверки полного PUT: существующий положительный id, границы title и priority, неверный path и отсутствующий положительный id. Каждый тест использует готовые маршруты и не меняет приложение.'
            ),
        },
    ],

    59: [
        {
            'title': 'Добавьте два недостающих unit-теста Planner',
            'task': (
                'В корне Planner сверьте docs/test-matrix.md с тестами. Не хватает двух проверок: отдельного списка tags '
                'у каждой Task и копирования списка в MemoryStorage. Добавьте только эти тесты. Проверки сервиса, JSON, '
                'CLI и HTTP уже есть.'
            ),
            'tasks': [
                {
                    'title': 'Проверьте список tags у двух Task',
                    'task': (
                        'Создайте tests/test_models.py. Создайте две Task без аргумента tags. Добавьте метку первой и '
                        'проверьте, что список второй остался пустым. Вызывайте модель напрямую, без хранилища, CLI и HTTP.'
                    ),
                    'requirements': [
                        'Файл tests/test_models.py импортирует Task из app.models.',
                        'Тест создаёт две Task с разными id и без аргумента tags.',
                        'Добавьте "review" первой Task: её tags равен ["review"], а tags второй Task равен [].',
                        'В проверке нет обращения к JsonStorage, MemoryStorage, PlannerService или API.',
                    ],
                    'hint': (
                        'Сначала создайте обе задачи и проверьте, что оба списка пусты. Затем добавьте метку первой и сравните списки.'
                    ),
                    'answer': {
                        'explanation': (
                            'У каждой Task должен быть свой список tags. Поэтому изменение первой задачи не меняет вторую. '
                            'Прямой вызов проверяет модель без участия других слоёв.'
                        ),
                        'steps': [
                            'Импортируем Task из app.models в tests/test_models.py.',
                            'Создаём две задачи с разными id и без аргумента tags.',
                            'Добавляем review в tags первой задачи.',
                            'Проверяем tags обеих задач: ["review"] у первой и [] у второй.',
                            'Запускаем python -m pytest -q tests/test_models.py из корня проекта.',
                        ],
                        'code': '''# tests/test_models.py
from app.models import Task


def test_tasks_have_independent_default_tags():
    first = Task(id=1, title="First")
    second = Task(id=2, title="Second")

    first.tags.append("review")

    assert first.tags == ["review"]
    assert second.tags == []''',
                        'checks': [
                            'Обе задачи начинают с пустого списка tags.',
                            'Изменение первой задачи не меняет список второй.',
                            'Проверяется только гарантия модели, без повторения тестов других слоёв.',
                        ],
                    },
                    'result': (
                        'Тест tests/test_models.py проходит: изменение tags первой Task не меняет список второй.'
                    ),
                },
                {
                    'title': 'Проверьте списки и задачи в MemoryStorage',
                    'task': (
                        'Создайте tests/test_storage.py. Проверьте, что MemoryStorage копирует списки при создании, load() и save(), '
                        'но оставляет в них те же объекты Task. Очистка внешнего списка не меняет набор storage. Изменение '
                        'поля Task видно после следующего load().'
                    ),
                    'requirements': [
                        'Тест импортирует Task и MemoryStorage из app.models и app.storage.',
                        'Изменение исходного списка после создания storage не меняет список в storage.',
                        'Очистка списка из load() не меняет список в storage.',
                        'Изменение входного списка после save() не меняет сохранённый набор.',
                        'Ссылка на Task общая: изменение её поля видно при следующем load().',
                        'Тест не требует глубокой копии Task, JSON-файла или пользовательских данных.',
                    ],
                    'hint': (
                        'Разделите две проверки: изменение состава списка и изменение поля Task. Списки разные, объект Task тот же.'
                    ),
                    'answer': {
                        'explanation': (
                            'При создании, load() и save() MemoryStorage копирует список через list(tasks), но не копирует Task. '
                            'Поэтому списки независимы, а изменение общей задачи видно через обе ссылки.'
                        ),
                        'steps': [
                            'Создаём Task и передаём её в MemoryStorage.',
                            'Добавляем задачу в исходный список и проверяем, что storage не изменился.',
                            'Очищаем результат load() и проверяем, что следующий load() возвращает задачу.',
                            'Передаём список в save(), очищаем его и проверяем список в storage.',
                            'Меняем is_done у Task и проверяем это значение после нового load().',
                            'Запускаем python -m pytest -q tests/test_storage.py из корня проекта.',
                        ],
                        'code': '''# tests/test_storage.py
from app.models import Task
from app.storage import MemoryStorage


def test_memory_storage_copies_lists_but_keeps_task_references():
    first = Task(id=1, title="First")
    second = Task(id=2, title="Second")
    initial = [first]
    storage = MemoryStorage(initial)

    initial.append(second)
    assert storage.load() == [first]

    loaded = storage.load()
    loaded.clear()
    assert storage.load() == [first]

    replacement = [second]
    storage.save(replacement)
    replacement.clear()
    assert storage.load() == [second]

    second.mark_done()
    assert storage.load()[0].is_done is True''',
                        'checks': [
                        'Конструктор, load() и save() создают отдельные списки.',
                            'Состав возвращённого списка не изменяет внутренний список без save().',
                            'Объекты Task не копируются глубоко: изменение общей Task видно после нового load().',
                        ],
                    },
                    'result': (
                        'Тест tests/test_storage.py подтверждает, что списки копируются, а объекты Task остаются общими.'
                    ),
                },
                {
                    'title': 'Обновите матрицу тестов',
                    'task': (
                        'Сверьте тесты с docs/test-matrix.md. Замените строку о непокрытых unit-проверках двумя строками: '
                        'для tests/test_models.py и tests/test_storage.py. Укажите готовые тесты сервиса, CLI, JSON и HTTP. '
                        'Для этих слоёв новые тесты не нужны.'
                    ),
                    'requirements': [
                        'Независимость tags Task указана как Unit-проверка tests/test_models.py.',
                        'Поверхностная копия MemoryStorage указана как Unit-проверка tests/test_storage.py.',
                        'tests/test_services.py указывает на save_calls == 0 при чтении; tests/test_service_persistence.py указывает на повторную загрузку полной Task и сохранение соседней задачи.',
                        'Для JSON, CLI и HTTP указаны существующие tests/test_persistence.py, tests/test_cli.py, tests/test_api.py и tests/test_contract.py.',
                        'В матрице нет строки, которая объявляет уже покрытый слой непроверенным или приписывает тесту ненаблюдаемое свойство.',
                    ],
                    'hint': (
                        'Найдите сами тесты и прочитайте, что они вызывают и проверяют. Затем коротко запишите результат в матрицу.'
                    ),
                    'answer': {
                        'explanation': (
                            'В матрице укажем два новых unit-теста. Проверки сервиса уже считают вызовы save и перечитывают данные '
                            'новым сервисом. JSON, CLI и HTTP тоже уже проверяются, поэтому повторять эти тесты не нужно.'
                        ),
                        'steps': [
                            'Проверяем, что tests/test_models.py и tests/test_storage.py закрывают два нужных пробела.',
                            'Находим готовые тесты сервиса, JSON, CLI и HTTP и записываем их результаты.',
                            'В docs/test-matrix.md указываем слой, файл теста и что именно он проверяет.',
                            'Код приложения, фикстуры и готовые тесты не меняем.',
                        ],
                        'code': '''| Риск | Уровень | Проверка в проекте | Наблюдаемый результат |
|---|---|---|---|
| Список tags разделяется между экземплярами Task | Unit | `tests/test_models.py` | Изменение одной Task не меняет tags другой |
| MemoryStorage не отделяет контейнеры списка | Unit | `tests/test_storage.py` | Внешний список изолирован, но ссылки на Task общие |
| Чтение PlannerService вызывает лишний save | Unit | `tests/test_services.py` | `ObservedStorage.save_calls` остаётся 0 |
| Изменение PlannerService не видно после загрузки | Integration | `tests/test_service_persistence.py` | Новый сервис читает полную Task и сохраняет соседа |
| Ошибка JSON стирает исходные данные | Integration | `tests/test_persistence.py` | `StorageError`, прежние байты не меняются |
| CLI меняет не ту задачу или сохраняет лишний раз | CLI regression | `tests/test_cli.py` | Вывод и количество save соответствуют команде |
| Ответ API или границы запроса нарушают HTTP-договор | Contract | `tests/test_api.py`, `tests/test_contract.py` | Статусы, публичный JSON и состояние соответствуют запросу |''',
                        'checks': [
                            'Все указанные в матрице тесты существуют.',
                            'Новые гарантии добавлены один раз, в подходящем unit-файле.',
                            'Тесты сервиса, JSON, CLI и HTTP не дублируются.',
                        ],
                    },
                    'result': (
                        'Матрица ссылается на два новых unit-теста и на готовые тесты сервиса, JSON, CLI и HTTP.'
                    ),
                },
            ],
            'result': (
                'Два новых теста проверяют tags у Task и списки в MemoryStorage. Матрица указывает эти и готовые тесты '
                'сервиса, JSON, CLI и HTTP.'
            ),
        }
    ],
    "59.1": [
        {
            'title': 'Одна API-история связывает workflow-тест и Postman',
            'task': (
                'Маршруты Planner и отдельные API-тесты уже есть. В tests/conftest.py fixture api_service и api_client '
                'готовят временное хранилище для каждой тестовой функции. Файла tests/test_workflow.py пока нет. '
                'Для Postman уже есть коллекция postman/planner-api.postman_collection.json и среда '
                'postman/local.postman_environment.json. Среда Local использует http://127.0.0.1:8000. '
                'GET /stats возвращает total, open и done. В рабочем JSON могут быть исходные записи.'
            ),
            'tasks': [
                {
                    'title': 'Один тест связывает запросы по фактическим id',
                    'task': (
                        'Создайте tests/test_workflow.py. Добавьте test_task_workflow_uses_one_state(api_client): '
                        'один api_client проверяет главную задачу и контрольную запись. Порядок запросов и проверки '
                        'указаны ниже.'
                    ),
                    'requirements': [
                        'Добавьте один тест в tests/test_workflow.py. Все запросы выполняйте через один api_client.',
                        'Сохраните оба id из ответов POST. Не задавайте id вручную.',
                        'Для главной задачи выполните GET, PUT, PATCH с неверным priority, PATCH с is_done=false и DELETE.',
                        'До PATCH с неверным priority сохраните GET /tasks и GET /stats. После ответа 422 проверьте, что список, контрольная задача и stats не изменились.',
                        'После DELETE проверьте пустое тело ответа 204, ответ 404 на повторный GET и сохранность контрольной задачи.',
                        'Сравнивайте total/open/done с исходными stats. После POST изменение равно +2/+2/0; после PUT: +2/+1/+1; после PATCH false: +2/+2/0; после DELETE: +1/+1/0.',
                    ],
                    'hint': (
                        'Сначала сохраните исходные stats и создайте обе задачи. Перед PATCH с неверным priority сохраните список и stats. После 422 прочитайте их снова и сравните. Контрольную задачу проверяйте после каждого изменения главной.'
                    ),
                    'answer': {
                        'explanation': (
                            'Внутри одной функции все запросы используют общий api_service на временном JsonStorage. '
                            'Запросы связывает id из ответа POST. Ответ операции, повторный GET, контрольная задача и stats '
                            'показывают, что изменилось. После ожидаемого 422 тест продолжает работу.'
                        ),
                        'steps': [
                            'Сохраните исходный ответ GET /stats.',
                            'Создайте контрольную и главную задачи. Сохраните id из обоих ответов POST.',
                            'Прочитайте главную через GET. Затем выполните PUT с is_done=true.',
                            'Перед неверным PATCH сохраните GET /tasks и GET /stats. После 422 повторите запросы и сравните ответы; проверьте контрольную задачу.',
                            'Выполните PATCH с is_done=false. Убедитесь, что title и priority сохранились.',
                            'Удалите главную задачу. Проверьте пустой ответ 204, ответ 404 при GET и доступность контрольной задачи.',
                            'Сравните итоговые stats с исходными значениями.',
                        ],
                        'code': """# tests/test_workflow.py
def test_task_workflow_uses_one_state(api_client):
    baseline_stats = api_client.get("/stats").json()

    control_response = api_client.post(
        "/tasks", json={"title": "Control task", "priority": 1}
    )
    target_response = api_client.post(
        "/tasks", json={"title": "Workflow task", "priority": 2}
    )
    assert control_response.status_code == 201
    assert target_response.status_code == 201
    control = control_response.json()
    target = target_response.json()
    control_id = control["id"]
    target_id = target["id"]
    target_path = f"/tasks/{target_id}"

    assert control_id != target_id
    assert api_client.get("/stats").json() == {
        "total": baseline_stats["total"] + 2,
        "open": baseline_stats["open"] + 2,
        "done": baseline_stats["done"],
    }
    read = api_client.get(target_path)
    assert read.status_code == 200
    assert read.json() == target

    put = api_client.put(
        target_path,
        json={"title": "Reviewed workflow", "priority": 3, "is_done": True},
    )
    assert put.status_code == 200
    completed = put.json()
    assert completed == {
        "id": target_id,
        "title": "Reviewed workflow",
        "priority": 3,
        "is_done": True,
    }
    assert api_client.get(target_path).json() == completed
    assert api_client.get(f"/tasks/{control_id}").json() == control
    assert api_client.get("/stats").json() == {
        "total": baseline_stats["total"] + 2,
        "open": baseline_stats["open"] + 1,
        "done": baseline_stats["done"] + 1,
    }

    before_invalid_tasks = api_client.get("/tasks").json()
    before_invalid_stats = api_client.get("/stats").json()
    invalid = api_client.patch(target_path, json={"priority": 99})
    assert invalid.status_code == 422
    assert api_client.get("/tasks").json() == before_invalid_tasks
    assert api_client.get("/stats").json() == before_invalid_stats
    assert api_client.get(target_path).json() == completed
    assert api_client.get(f"/tasks/{control_id}").json() == control

    reopened = api_client.patch(target_path, json={"is_done": False})
    assert reopened.status_code == 200
    assert reopened.json() == {
        "id": target_id,
        "title": "Reviewed workflow",
        "priority": 3,
        "is_done": False,
    }
    assert api_client.get(target_path).json() == reopened.json()
    assert api_client.get("/stats").json() == {
        "total": baseline_stats["total"] + 2,
        "open": baseline_stats["open"] + 2,
        "done": baseline_stats["done"],
    }

    deleted = api_client.delete(target_path)
    assert deleted.status_code == 204
    assert deleted.content == b""
    assert api_client.get(target_path).status_code == 404
    assert api_client.get(f"/tasks/{control_id}").json() == control
    assert api_client.get("/stats").json() == {
        "total": baseline_stats["total"] + 1,
        "open": baseline_stats["open"] + 1,
        "done": baseline_stats["done"],
    }""",
                        'checks': [
                            'Все запросы используют один api_client и id из ответов POST.',
                            'После 422 главная задача, контрольная задача и stats не изменились.',
                            'PATCH с false применён; после удаления главная недоступна, контрольная осталась.',
                            'Значения total/open/done совпадают с ожидаемыми изменениями от baseline.',
                        ],
                    },
                    'result': (
                        'В tests/test_workflow.py один тест проходит POST, GET, PUT, два PATCH и DELETE через один api_client. Он использует id из ответов POST, подтверждает неизменность данных после 422 и сохраняет контрольную задачу после удаления главной.'
                    ),
                    'checks': [
                        'Тест связывает запросы одной истории и не дублирует отдельные CRUD-проверки.',
                        'Тест использует временный JSON. Рабочий файл не читается и не очищается.',
                    ],
                },
                {
                    'title': 'Postman показывает переходы от реального baseline',
                    'task': (
                        'Запустите сервер из корня StudyHub. В Postman импортируйте коллекцию и среду Local, затем проверьте GET /health. Пройдите ту же историю, что и в тесте. Порядок запросов и ожидаемые ответы перечислены ниже.'
                    ),
                    'requirements': [
                        'Запустите сервер командой python -m uvicorn app.api:app --reload из корня StudyHub.',
                        'Импортируйте postman/planner-api.postman_collection.json и postman/local.postman_environment.json. Выберите Local; base_url должен быть http://127.0.0.1:8000.',
                        'Проверьте GET /health: ожидается 200. Затем запишите исходные total/open/done из GET /stats.',
                        'Создайте контрольную задачу: {\"title\":\"Control task\",\"priority\":1}. Создайте главную: {\"title\":\"Workflow task\",\"priority\":2}. Оба POST должны вернуть 201.',
                        'Сохраните id из ответов POST. Прочитайте главную через GET, затем обновите её PUT-телом {\"title\":\"Reviewed workflow\",\"priority\":3,\"is_done\":true}. Ожидается 200.',
                        'Отправьте главной PATCH {\"priority\":99}. Ожидается 422; после ответа снова прочитайте список, обе задачи и stats. Данные должны совпасть с состоянием до отказа.',
                        'Отправьте PATCH {\"is_done\":false}. Ожидается 200; проверьте новое состояние и stats.',
                        'Удалите главную. DELETE должен вернуть пустой ответ 204, следующий GET должен вернуть 404. Контрольная задача должна открываться.',
                        'Сравнивайте stats с исходными значениями. Изменения после POST: +2/+2/0, после PUT: +2/+1/+1, после PATCH false: +2/+2/0, после DELETE: +1/+1/0. Не удаляйте исходные записи и не очищайте рабочий JSON.',
                    ],
                    'hint': (
                        'Выберите Local и проверьте GET /health. Для item-запросов копируйте id из ответов POST. Перед PATCH с priority=99 сохраните ответы GET /tasks и GET /stats.'
                    ),
                    'answer': {
                        'explanation': (
                            'Рабочий JSON может быть непустым, поэтому stats сравниваем с исходными значениями. Две новые задачи дают +2/+2/0. После PUT в done значения меняются до +2/+1/+1, после PATCH false возвращаются к +2/+2/0. Удаление главной оставляет +1/+1/0. Исходные записи и контрольную задачу сохраняем.'
                        ),
                        'steps': [
                            'Запустите сервер из корня StudyHub. Импортируйте коллекцию и среду Local; проверьте GET /health.',
                            'Выполните GET /tasks и GET /stats. Запишите baseline N/O/D и не очищайте JSON.',
                            'Создайте обе задачи через POST. Сохраните id из ответов.',
                            'Прочитайте главную задачу, выполните PUT и проверьте ответ, повторный GET и stats.',
                            'До неверного PATCH сохраните список и stats. После ответа 422 повторите чтение и сравните данные.',
                            'Выполните PATCH с is_done=false. Проверьте ответ, повторный GET и stats.',
                            'Удалите главную задачу. Проверьте пустое тело 204, ответ 404, контрольную задачу и итоговые stats.',
                        ],
                        'checks': [
                            'Все id взяты из ответов текущего сервера, а stats сравнены с baseline.',
                            'Исходные записи сохранены, контрольная задача доступна.',
                        ],
                    },
                    'result': (
                        'Postman показывает фактические id и ответы. Stats меняются ожидаемо; после 422 данные не изменились, главная задача после удаления недоступна, контрольная и исходные записи сохранены.'
                    ),
                    'checks': [
                        'Postman проходит ту же историю, что и workflow-тест.',
                        'Рабочий JSON не очищен, исходные записи не удалены.',
                    ],
                },
                {
                    'title': 'Workflow проходит отдельно и вместе с тестовым набором',
                    'task': (
                        'Запустите workflow-тест отдельно, затем весь набор pytest. Убедитесь, что оба запуска прошли и рабочий data/tasks.json не менялся.'
                    ),
                    'requirements': [
                        'Отдельно выполните pytest tests/test_workflow.py -q. Тест должен пройти.',
                        'Затем выполните pytest -q. Должен пройти весь набор.',
                        'Workflow использует временный JSON; рабочий data/tasks.json не меняется.',
                    ],
                    'hint': 'Проверьте fixture api_client: она подключает временный путь из tmp_path и после клиента возвращает прежний app.state.planner.',
                    'answer': {
                        'explanation': (
                            'Каждая тестовая функция получает свой api_service и файл из tmp_path. После закрытия TestClient api_client возвращает прежний сервис. Отдельный запуск проверяет workflow, полный набор проверяет его вместе с соседними тестами.'
                        ),
                        'steps': [
                            'Выполните pytest tests/test_workflow.py -q.',
                            'Выполните pytest -q.',
                            'Проверьте, что оба запуска прошли, а рабочий JSON не изменился.',
                        ],
                        'code': 'pytest tests/test_workflow.py -q\npytest -q',
                        'checks': [
                            'Оба запуска прошли.',
                            'Fixture использует временный JsonStorage.',
                        ],
                    },
                    'result': (
                        'Workflow-тест проходит отдельно и в полном наборе. Он использует временный JsonStorage; рабочий data/tasks.json не меняется.'
                    ),
                    'checks': [
                        'Тест проходит отдельно и вместе с набором.',
                        'Данные изолированы fixture; вручную очищать файлы не нужно.',
                    ],
                },
            ],
            'result': (
                'Добавлен один workflow-тест на готовых маршрутах и fixtures. Он связывает запросы реальными id, проверяет состояние после 422 и удаляет главную задачу, сохраняя контрольную. В Postman та же история пройдена относительно фактического baseline; рабочий JSON не очищен.'
            ),
        },
    ],
    60: [
        {
            'title': 'Проверьте запуск Planner в чистой копии',
            'task': (
                'В занятии 59.1 мы проверили готовый Planner. Теперь проверим тот же commit в новой папке: '
                'установим зависимости, запустим тесты, CLI и API, импортируем файлы Postman. '
                'Исходную папку и её данные не меняем. Код приложения не исправляем.'
            ),
            'tasks': [
                {
                    'title': 'Создайте копию на нужном commit',
                    'task': (
                        'В PowerShell создайте отдельный clone и переключите его на полный SHA результата 59.1. '
                        'Подставьте пути и SHA в шаблон из теории. Если точный SHA неизвестен или недоступен, '
                        'остановитесь и запишите это; не выбирайте другой commit. В новой папке выполните '
                        '`git status --short`, `Test-Path .venv` и `Test-Path data/tasks.json`. Исходную папку не меняйте.'
                    ),
                    'requirements': [
                        'Clone находится в отдельной папке и содержит каталог .git.',
                        'Полный SHA clone совпадает с SHA результата 59.1; неизвестный SHA отмечен как блокер.',
                        'До установки git status --short пуст.',
                        'В новой копии обе команды Test-Path возвращают False.',
                        'Исходная папка и её данные не изменены.',
                    ],
                    'hint': (
                        'Сначала сверьте SHA с результатом 59.1. После checkout сравните его с `git rev-parse HEAD`. '
                        'Если SHA не найден, остановитесь.'
                    ),
                    'answer': {
                        'explanation': (
                            'Clone копирует историю и сохранённые файлы, но не локальные изменения, .venv и '
                            'игнорируемый JSON. Detached checkout закрепляет новую копию на выбранном commit.'
                        ),
                        'steps': [
                            'Запишите полный SHA результата 59.1. Если его нет, отметьте блокер и остановитесь.',
                            'Клонируйте репозиторий в отдельную папку и перейдите в неё.',
                            'Переключитесь на записанный SHA и сравните его с `git rev-parse HEAD`.',
                            'Проверьте чистый статус и отсутствие .venv и data/tasks.json.',
                            'Убедитесь, что исходная папка осталась без изменений.',
                        ],
                        'code': r'''git -C "<SOURCE_PATH>" rev-parse HEAD
git clone "<SOURCE_PATH>" "<CLEAN_COPY_PATH>"
Set-Location "<CLEAN_COPY_PATH>"
git checkout --detach "<SHA_59_1>"
git rev-parse HEAD
git status --short
Test-Path .venv
Test-Path data/tasks.json''',
                        'checks': [
                            'SHA совпадает с результатом 59.1.',
                            'Новая папка отдельная; .venv и личного JSON в ней нет.',
                            'Рабочее дерево чистое.',
                        ],
                    },
                    'result': (
                        'Новая папка открыта на точном SHA результата 59.1; старая папка сохранена, '
                        'а старая .venv и личный JSON не попали в копию.'
                    ),
                },
                {
                    'title': 'Установите пакеты в новую .venv',
                    'task': (
                        'Из корня новой копии сверьте команды с README. Создайте .venv и установите '
                        'requirements-dev.txt через Python из этой .venv. Не используйте старое или глобальное окружение.'
                    ),
                    'requirements': [
                        'В новой копии создаётся .venv для Python 3.12.',
                        'requirements-dev.txt устанавливается Python из этой .venv.',
                        '`sys.executable` указывает на Python внутри новой .venv.',
                        'Пакеты устанавливаются только из файлов зависимостей.',
                    ],
                    'hint': (
                        'Создайте .venv командой из README. Затем запускайте pip через Python внутри этой папки.'
                    ),
                    'answer': {
                        'explanation': (
                            'Новая .venv отделяет пакеты проекта от системного Python. requirements-dev.txt '
                            'подключает пакеты приложения и инструменты проверки.'
                        ),
                        'steps': [
                            'Из корня новой копии создайте .venv по README.',
                            'Установите requirements-dev.txt Python из .venv.',
                            'Выведите `sys.executable` и проверьте путь.',
                            'Если установка упала, сохраните ошибку; не ставьте пакет глобально.',
                        ],
                        'code': r'''py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -c "import sys; print(sys.executable)"''',
                        'checks': [
                            'Установка завершилась без ошибки.',
                            'Путь Python ведёт в .venv новой копии.',
                            'Пакеты вручную не добавлялись.',
                        ],
                    },
                    'result': (
                        'Пакеты из requirements-dev.txt установлены в новой .venv; незаписанные зависимости не добавлялись.'
                    ),
                },
                {
                    'title': 'Запустите все тесты',
                    'task': (
                        'Из корня новой копии запустите полный pytest через её .venv командой из README. '
                        'Запишите итоговый вывод и код завершения. Тесты не должны менять личный JSON.'
                    ),
                    'requirements': [
                        'Полный pytest запущен Python из новой .venv.',
                        'Код завершения равен 0, все тесты прошли.',
                        'Нет ошибок импорта или отсутствующих зависимостей.',
                        'Тесты не читают и не очищают рабочий data/tasks.json.',
                    ],
                    'hint': (
                        'Убедитесь, что находитесь в корне новой копии. Запускайте pytest тем же Python, которым ставили пакеты.'
                    ),
                    'answer': {
                        'explanation': (
                            'Полный набор проверяет модель, сервис, хранилище, CLI и API. Он подтверждает '
                            'автоматические проверки, но не заменяет запуск Uvicorn и запрос к API.'
                        ),
                        'steps': [
                            'Запустите полный pytest через Python из .venv.',
                            'Запишите итог и код завершения; при ошибке сохраните имя теста и сообщение.',
                            'Проверьте, что тестовые данные отделены от data/tasks.json.',
                            'Передайте результат в последнюю задачу для сверки с README.',
                        ],
                        'code': r'''.\.venv\Scripts\python.exe -m pytest -q''',
                        'checks': [
                            'Все тесты прошли, код завершения 0.',
                            'Не было ошибок из-за отсутствующих пакетов.',
                            'Рабочие данные не очищались.',
                        ],
                    },
                    'result': (
                        'Полный pytest прошёл в новой среде; команда и результат записаны.'
                    ),
                },
                {
                    'title': 'Проверьте одну задачу через CLI и API',
                    'task': (
                        'В новой копии создайте задачу через CLI и запишите показанный Planner id. В другом '
                        'терминале запустите Uvicorn из той же копии. Прочитайте задачу через GET API, '
                        'перезапустите сервер и повторите запрос с тем же id.'
                    ),
                    'requirements': [
                        'CLI и Uvicorn запущены из одной копии.',
                        'Через `add` создана задача с приоритетом от 1 до 5.',
                        'Использован id из ответа CLI.',
                        'GET /tasks/{task_id} через /docs возвращает ту же задачу и статус 200.',
                        'После перезапуска Uvicorn тот же GET снова находит задачу.',
                        'Задача записана в JSON новой копии; исходные данные не использовались.',
                    ],
                    'hint': (
                        'В обоих терминалах перейдите в корень одной копии. Возьмите id из ответа CLI и вставьте его в /docs.'
                    ),
                    'answer': {
                        'explanation': (
                            'CLI записывает задачу в JSON через PlannerService, а API читает тот же файл. '
                            'Фактический id связывает создание и чтение. Повторный запрос после перезапуска '
                            'показывает, что задача сохранилась.'
                        ),
                        'steps': [
                            'В первом терминале запустите CLI, выберите `add`, введите название и приоритет 1–5.',
                            'Запишите id из ответа CLI.',
                            'Во втором терминале запустите Uvicorn из той же папки.',
                            'В /docs выполните GET /tasks/{task_id} с этим id и сравните ответ с CLI.',
                            'Остановите Uvicorn, запустите снова и повторите GET.',
                        ],
                        'code': r'''.\.venv\Scripts\python.exe -m app.main
Команда: add
Название задачи: clean-install-check
Приоритет от 1 до 5: 3

Во втором терминале:
.\.venv\Scripts\python.exe -m uvicorn app.api:app --reload

В Swagger UI /docs:
GET /tasks/{task_id}  -> подставить id из вывода CLI''',
                        'checks': [
                            'GET возвращает id и название задачи из CLI.',
                            'После перезапуска GET находит ту же задачу.',
                            'Запрос отправлен серверу из новой копии.',
                        ],
                    },
                    'result': (
                        'CLI и API видят задачу из одного JSON; после перезапуска она остаётся доступна.'
                    ),
                },
                {
                    'title': 'Импортируйте файлы Postman',
                    'task': (
                        'Импортируйте в Postman collection и environment из каталога `postman` новой копии. '
                        'Выберите Local и проверьте, что `base_url` указывает на запущенный локальный API. '
                        'Сценарий 59.1 повторять не нужно.'
                    ),
                    'requirements': [
                        'Импортированы оба файла Postman из новой копии.',
                        'Выбрана среда Local; `base_url` совпадает с адресом локального API.',
                        'Collection и environment видны в Postman.',
                        'Новый workflow и экспорт не создавались.',
                    ],
                    'hint': (
                        'Если коллекция видна, но запросы не настроены, выберите Local в списке сред и проверьте `base_url`.'
                    ),
                    'answer': {
                        'explanation': (
                            'Импорт подтверждает, что оба файла есть в копии и открываются в Postman. '
                            'Он не проверяет ответ API. Здесь проверяем выбранную среду и адрес сервера; '
                            'полный HTTP-сценарий уже был в 59.1.'
                        ),
                        'steps': [
                            'Импортируйте `postman/planner-api.postman_collection.json` из новой копии.',
                            'Импортируйте `postman/local.postman_environment.json` из той же копии.',
                            'Выберите Local и проверьте адрес `http://127.0.0.1:8000` в `base_url`.',
                            'Не очищайте JSON и не повторяйте workflow.',
                        ],
                        'code': r'''postman/planner-api.postman_collection.json
postman/local.postman_environment.json
base_url = http://127.0.0.1:8000''',
                        'checks': [
                            'Оба файла импортированы из новой копии.',
                            'Local выбрана и указывает на локальный сервер.',
                            'В файлах нет личных данных и секретов.',
                        ],
                    },
                    'result': (
                        'Оба файла доступны в Postman, а Local указывает на локальный API.'
                    ),
                },
                {
                    'title': 'Сверьте README и передайте результаты в 60.1',
                    'task': (
                        'Сравните с README того же commit пять шагов: clone, установку, pytest, CLI/API и импорт Postman. '
                        'Запишите команду и результат каждого шага. Если нашли подтверждённую ошибку README или '
                        'файла зависимостей, исправьте её в копии и повторите связанные проверки. Код приложения не меняйте.'
                    ),
                    'requirements': [
                        'Записан полный SHA или явно отмечено, что он не найден.',
                        'Для каждого шага сохранены команда и фактический результат.',
                        'Результаты pytest, живого API и импорта Postman указаны отдельно.',
                        'Изменены только README или requirements в новой копии.',
                        'После исправления повторены затронутые проверки.',
                        'Для 60.1 подготовлены SHA, команды, результаты и найденные расхождения.',
                    ],
                    'hint': (
                        'Сверяйте README с записанными командами и выводом. Если ошибки нет, так и запишите. '
                        'Сначала сохраните точный текст незнакомой ошибки.'
                    ),
                    'answer': {
                        'explanation': (
                            'README подтверждён, когда его команды сработали в новой среде. SHA связывает результат '
                            'с версией проекта. Если README или requirements изменились, передайте в 60.1 исходный SHA '
                            'и список изменений.'
                        ),
                        'steps': [
                            'Сверьте команды и результаты с README.',
                            'Для каждого расхождения запишите ожидаемую и выполненную команду, вывод и причину.',
                            'Исправьте только подтверждённую ошибку в README или requirements.',
                            'Повторите проверки, которых коснулось изменение.',
                            'Передайте в 60.1 SHA, команды, результаты и список изменений либо отметку «расхождений нет».',
                        ],
                        'checks': [
                            'Отчёт содержит фактический запуск и выбранный SHA.',
                            'pytest, живой API и импорт Postman не смешаны в один результат.',
                            'README выполнен либо оставшиеся расхождения записаны для 60.1.',
                        ],
                    },
                    'result': (
                        'Для 60.1 записаны SHA, команды, результаты pytest/CLI/API/Postman и подтверждённые расхождения.'
                    ),
                },
            ],
            'result': (
                'Новая копия на SHA результата 59.1 устанавливает пакеты, проходит полный pytest, запускает CLI/API '
                'на собственном JSON и импортирует файлы Postman. Команды и результаты сверены с README и подготовлены для 60.1.'
            ),
        }
    ],
    "60.1": [
        {
            'title': 'Передача проверенной версии Planner API',
            'task': (
                'Точка A: после шага 60 есть чистая копия StudyHub, SHA и результаты проверок.\n\n'
                'Точка B: README, матрица, release notes и Postman описывают тот же проверенный Planner. '
                'Локальный API-тег указывает на итоговый commit. Если подтверждений не хватает, причина записана, '
                'а тег не создан. Код и личные данные не меняются.'
            ),
            'tasks': [
                {
                    'title': 'Запись о проверке',
                    'task': (
                        'Отдельная заметка содержит результаты нового шага 60 из STUDYHUB_LEARNINGS.md. '
                        'Для каждой проверки есть свой статус. Отсутствующие результаты отмечены как неподтверждённые.'
                    ),
                    'requirements': [
                        'Указан полный SHA чистой копии или его отсутствие.',
                        'Записаны Python, команда установки, pytest, CLI и API.',
                        'Импорт Postman в шаге 60 и сценарий из 59.1 имеют отдельные статусы.',
                    ],
                    'hint': (
                        'Опора: раздел 01 теории. Мы ищем новый шаг 60, берём SHA и фактические результаты. '
                        'Сценарий, который в шаге 60 не повторяли, так и отмечаем.'
                    ),
                    'answer': {
                        'explanation': (
                            'Мы связываем каждую проверку с одним SHA. Исторические числа тестов и запуск другого клиента '
                            'не заменяют результатов нужной копии.'
                        ),
                        'steps': [
                            'Находим запись нового шага 60 в STUDYHUB_LEARNINGS.md.',
                            'Сравниваем SHA с git rev-parse HEAD в чистой копии; git status --short пуст.',
                            'Переносим фактические команды и результаты, неизвестное помечаем отдельно.',
                        ],
                        'code': '''# Шаблон заметки, не команда
SHA: <полный SHA или «не найден»>
Python и установка: <версия, команда или «не подтверждены»>
pytest: <команда, результат или «не подтверждён»>
CLI: <результат или «не подтверждён»>
API: <результат или «не подтверждён»>
Postman, импорт: <результат или «не подтверждён»>
Postman, сценарий: <результат или «не подтверждён»>''',
                        'checks': [
                            'Все подтверждённые результаты относятся к одному SHA.',
                            'Проверки без результата помечены явно.',
                        ],
                    },
                    'result': (
                        'В заметке есть SHA и статусы установки, pytest, CLI, API и Postman.'
                    ),
                },
                {
                    'title': 'README соответствует запуску',
                    'task': (
                        'README.md содержит команды, которые сработали в шаге 60. '
                        'Он правильно описывает возможности Planner и ограничения JSON-хранилища.'
                    ),
                    'requirements': [
                        'Указаны корень проекта, Python, requirements.txt и requirements-dev.txt.',
                        'Команды CLI, API, pytest и ссылки /docs, /openapi.json верны.',
                        'Описаны восемь операций API и ограничения JSON; нет обещаний SQL и авторизации.',
                    ],
                    'hint': (
                        'Опора: раздел 02 теории. Мы сравниваем каждую команду README с записью шага 60. '
                        'Пакеты сверяем с двумя файлами requirements.'
                    ),
                    'answer': {
                        'explanation': (
                            'README объясняет воспроизводимый запуск. Мы оставляем подтверждённые команды '
                            'и точное описание JSON-backed Planner.'
                        ),
                        'steps': [
                            'Сверяем папку, Python и команды установки с записью шага 60.',
                            'Проверяем команды CLI, Uvicorn и pytest, адреса документации и список операций.',
                            'Исправляем только найденные расхождения и заново проверяем затронутую команду.',
                        ],
                        'checks': [
                            'Команды согласованы с запуском и файлами проекта.',
                            'Описание не обещает несуществующих функций.',
                        ],
                    },
                    'result': (
                        'README совпадает с проверенным запуском и возможностями Planner.'
                    ),
                },
                {
                    'title': 'Матрица тестов совпадает с кодом',
                    'task': (
                        'В docs/test-matrix.md каждая гарантия связана с существующим тестом. '
                        'Формулировка описывает именно то, что тест проверяет.'
                    ),
                    'requirements': [
                        'Для каждой строки найден файл теста и проверяемое значение.',
                        'Слои модели, хранения, сервиса, CLI, HTTP и workflow не смешаны.',
                        'Нет неподтверждённых обещаний; исходные тесты не меняются.',
                    ],
                    'hint': (
                        'Опора: раздел 02 теории. Мы открываем тест из матрицы и ищем assert. '
                        'Если сравнивается лишь статус 200, нельзя обещать сохранение задачи.'
                    ),
                    'answer': {
                        'explanation': (
                            'Матрица связывает обещание с проверкой. Мы смотрим, что тест делает и сравнивает, '
                            'и уточняем только слишком широкое описание.'
                        ),
                        'steps': [
                            'Для каждой строки читаем названный тест.',
                            'Сопоставляем действие и assert с заявленной гарантией.',
                            'Уточняем строки, где проверка слабее обещания.',
                        ],
                        'checks': [
                            'У каждой гарантии есть существующая проверка.',
                            'Матрица не приписывает TestClient запуск Uvicorn.',
                        ],
                    },
                    'result': 'Матрица описывает реальные тесты и их результаты.',
                },
                {
                    'title': 'Заметки и файлы Postman согласованы',
                    'task': (
                        'docs/release-notes-draft.md описывает подтверждённые возможности и проверки Planner. '
                        'Экспорты Postman подходят друг к другу и не содержат секретов. '
                        'Непроверенные результаты отмечены; заметки остаются черновиком.'
                    ),
                    'requirements': [
                        'Заметки отражают результаты нужного SHA и ограничения JSON.',
                        'Коллекция planner-api.postman_collection.json использует среду local.postman_environment.json.',
                        'Переменная base_url ведёт к локальному API; личных секретов в JSON нет.',
                        'Импорт и запуск Postman не заявлены без отдельных подтверждений.',
                    ],
                    'hint': (
                        'Опора: раздел 03 теории. Мы сравниваем числа release notes с заметкой из первой карточки. '
                        'В Postman проверяем, что {{base_url}} совпадает с переменной Local.'
                    ),
                    'answer': {
                        'explanation': (
                            'Release notes описывают проверенную версию. Collection хранит запросы, environment задаёт адрес. '
                            'Наличие файлов не доказывает, что их импортировали и выполнили сценарий.'
                        ),
                        'steps': [
                            'Сверяем возможности, ограничения и числа в release notes с заметкой о проверке.',
                            'Открываем postman/planner-api.postman_collection.json и postman/local.postman_environment.json.',
                            'Проверяем {{base_url}}, локальный адрес и отсутствие секретов.',
                            'Отмечаем отдельно импорт и запуск; после правки экспорта повторяем затронутую проверку.',
                        ],
                        'checks': [
                            'Нет неподтверждённых заявлений о тестах или Postman.',
                            'Оба экспорта подходят друг к другу и не содержат секретов.',
                        ],
                    },
                    'result': (
                        'Заметки и экспорты согласованы с проверенной версией; пробелы записаны.'
                    ),
                },
                {
                    'title': 'Локальная версия указывает на commit',
                    'task': (
                        'Тег planner-api-v1.0.0 указывает на чистый и подтверждённый итоговый commit. '
                        'Старый CLI-тег v1.0.0 сохранён. Если проверки не завершены, записан недостающий результат '
                        'и новый тег не создан.'
                    ),
                    'requirements': [
                        'SHA шага 60 и SHA итогового commit записаны отдельно.',
                        'Правки документов сохранены в commit и перепроверены; состояние git status --short чистое.',
                        'API-тег создан или подтверждён только при наличии нужных результатов.',
                        'Теги v1.0.0 и существующий API-тег с другим SHA не изменены.',
                        'GitHub Release и push не выполнены.',
                    ],
                    'hint': (
                        'Опора: раздел 04 теории. Мы начинаем с git status --short и git rev-parse HEAD. '
                        'После правок нужен новый commit. Потом смотрим git tag --list и сравниваем SHA.'
                    ),
                    'answer': {
                        'explanation': (
                            'Сначала мы сверяем результат с исходным SHA. Изменённые документы сохраняем отдельно '
                            'и проверяем ещё раз. Только после этого привязываем свободный API-тег. '
                            'Если имя уже занято другим SHA или не хватает проверки, тег не трогаем.'
                        ),
                        'steps': [
                            'Записываем оба SHA; после исправления документов проверяем их и сохраняем новый commit.',
                            'Проверяем пустой git status --short и список существующих тегов.',
                            'Если API-тег есть, сравниваем его SHA; если свободен и проверки полны, создаём.',
                            'Сравниваем SHA тега с итоговым commit и убеждаемся, что CLI-тег сохранён.',
                        ],
                        'code': '''# Из корня чистой копии (PowerShell)
git status --short
git rev-parse HEAD
git tag --list
git rev-parse "v1.0.0^{commit}"

# ТОЛЬКО если документы менялись и исправления уже проверены:
git add README.md docs/test-matrix.md docs/release-notes-draft.md postman/planner-api.postman_collection.json postman/local.postman_environment.json
git commit -m "docs: verify Planner API handoff"
git rev-parse HEAD
git status --short

# ТОЛЬКО если API-тег уже есть: сверяем SHA и ничего не перемещаем
git rev-parse "planner-api-v1.0.0^{commit}"

# ИНАЧЕ, если имя свободно и все проверки подтверждены:
git tag -a planner-api-v1.0.0 <ИТОГОВЫЙ_SHA> -m "Planner API v1.0.0"
git rev-parse "planner-api-v1.0.0^{commit}"''',
                        'checks': [
                            'SHA API-тега совпадает с итоговым подтверждённым SHA.',
                            'Тег CLI сохранён, а конфликтующий API-тег не изменён.',
                        ],
                    },
                    'result': (
                        'API-тег указывает на проверенный commit. При неполных результатах вместо тега записан блокер.'
                    ),
                },
            ],
            'result': (
                'README, матрица, release notes и экспорты описывают одну проверенную версию Planner. '
                'API-тег указывает на итоговый commit либо записано, что мешает его создать. CLI-тег сохранён.'
            ),
        }
    ],
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




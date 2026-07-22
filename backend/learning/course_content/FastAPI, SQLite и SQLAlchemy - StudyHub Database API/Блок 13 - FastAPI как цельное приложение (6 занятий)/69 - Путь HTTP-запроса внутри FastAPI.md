# 69. Путь HTTP-запроса внутри FastAPI

## Паспорт занятия

- Этап: 4 — FastAPI, SQLite и SQLAlchemy.
- Блок: 13 — FastAPI как цельное приложение.
- Длительность: 75–100 минут.
- Предварительные знания: готовый Planner API, HTTP, APIRouter, Pydantic schemas, TestClient и обычные def-endpoints.
- Результат: ученик прослеживает POST /tasks по всем этапам, отличает работу FastAPI от предметной логики и сокращает endpoint до функции-координатора.

## Введение

Разберём FastAPI как конвейер, а не как набор decorators: request проходит через Uvicorn, поиск route, разбор параметров, Pydantic validation, dependencies, endpoint и формирование response.

## 1. Зачем видеть весь конвейер

После третьего этапа endpoint уже работает, но его легко воспринимать как магическую функцию. Перед подключением базы данных важно увидеть, какие шаги FastAPI выполняет до и после строки вашего Python-кода.

### Симптом магии

Ученик меняет decorator, schema и return одновременно, но не понимает, на каком этапе возник status 422 или 500.

### Новая модель

Request проходит последовательность независимых границ, каждая из которых отвечает на свой вопрос.

### Практическая польза

По status и traceback можно определить, дошёл ли request до endpoint и какая часть требует проверки.

### Маршрут запроса

```python
HTTP client
→ Uvicorn принимает соединение
→ FastAPI находит route
→ извлекает path, query, headers и body
→ Pydantic проверяет данные
→ FastAPI решает dependencies
→ endpoint связывает шаги
→ response data сериализуется
→ client получает status, headers и body
```


### Активная проверка

Расположите этапы от клиента до response.

Правильный порядок:
1. `клиент отправляет request`
2. `FastAPI выбирает route`
3. `параметры извлекаются и проверяются`
4. `dependencies решаются`
5. `endpoint выполняется`
6. `формируется response`

Endpoint вызывается только после успешного разбора входа и зависимостей.

> Конвейер не означает, что каждый этап нужно вручную программировать. Его нужно понимать, чтобы диагностировать и правильно размещать код.

## 2. Uvicorn принимает request, FastAPI выбирает route

Сетевой сервер и веб-фреймворк выполняют разные роли. Uvicorn слушает адрес и передаёт ASGI-сообщения приложению, а FastAPI сопоставляет method и path с зарегистрированной функцией.

### Uvicorn

Долгоживущий процесс принимает сетевые обращения на host и port.

### FastAPI app

Хранит зарегистрированные routes и общую конфигурацию приложения.

### APIRouter

Группирует endpoints, но после include_router они участвуют в общей таблице маршрутов.

### Регистрация router

```python
from fastapi import FastAPI

from app.routers.tasks import router as tasks_router

app = FastAPI()
app.include_router(tasks_router)
```

### Route

```python
from fastapi import APIRouter

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"],
)

@router.post("/", status_code=201)
def create_task(...):
    ...
```


### Активная проверка

Соедините часть системы и ответственность.

- `Uvicorn` → принять сетевой request
- `FastAPI` → выбрать зарегистрированный route
- `APIRouter` → сгруппировать endpoints одной области
- `endpoint` → связать вход с предметной операцией

Один request проходит через несколько ролей, но каждая остаётся отдельной.

> Route определяется сочетанием method и path. Одинаковый path может иметь разные handlers для GET и POST.

## 3. Разбор path, query, headers и body

После выбора route FastAPI смотрит на сигнатуру endpoint и dependencies. По имени route, типам и специальным маркерам он определяет, откуда взять каждое значение.

### Path

Имя находится в шаблоне /tasks/{task_id} и является обязательным.

### Query

Параметр отсутствует в path и имеет простой тип или Query.

### Header

Явно объявляется через Header; underscore обычно преобразуется в hyphen.

### Body

Pydantic-модель параметра читается из JSON body.

### Сигнатура

```python
from typing import Annotated
from fastapi import Header, Query

@router.get("/{task_id}")
def get_task(
    task_id: int,
    include_tags: Annotated[bool, Query()] = True,
    x_client_version: Annotated[str | None, Header()] = None,
):
    ...
```

### Post body

```python
@router.post("/", status_code=201)
def create_task(task: TaskCreate):
    ...
```


### Активная проверка

Откуда FastAPI возьмёт task_id?

```text
@router.get("/tasks/{task_id}")
def get_task(task_id: ____ ): ...
```

Варианты: `int`, `Header()`, `TaskCreate`

**Ответ:** `int`. Имя есть в path, а type hint задаёт преобразование к int.

> FastAPI не угадывает предметный смысл параметра. Источник определяется объявлением endpoint и route.

## 4. Pydantic validation происходит до endpoint

Если JSON body не соответствует TaskCreate, endpoint не получает наполовину заполненный объект. Pydantic формирует validation errors, а FastAPI возвращает 422.

### Required fields

Поле без default должно присутствовать в request body.

### Types

Вход преобразуется, когда это безопасно, либо отклоняется.

### Constraints

Field проверяет длину, диапазон и другие ограничения.

### Не предметная ошибка

Отсутствующая задача — 404 из логики приложения, а не schema validation.

### Schema

```python
from pydantic import BaseModel, Field

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: int = Field(ge=1, le=5)
```

### Невалидный body

```python
{
  "title": "",
  "priority": 9
}

→ 422 Unprocessable Entity
→ endpoint не вызван
```


### Активная проверка

```text
получить JSON body
проверить required fields
проверить types
проверить Field constraints
создать TaskCreate
вызвать endpoint
```

- `валидный body` → строка 6 → `endpoint called`
- `нет priority` → строка 2 → `422 before endpoint`
- `priority = 9` → строка 4 → `422 before endpoint`

> Если отладочный print в endpoint не сработал, сначала проверьте route, parsing, validation и dependencies.

## 5. Dependencies выполняются перед handler

Dependency — callable, результат которого требуется endpoint или другой dependency. FastAPI сначала решает дерево зависимостей и только затем вызывает handler.

### Объявление потребности

Endpoint сообщает, какой callable нужен через Depends.

### Решение

FastAPI вызывает dependency с её собственными параметрами.

### Инъекция

Возвращённое значение передаётся в аргумент endpoint.

### Ранний выход

Dependency может создать HTTPException и не допустить handler.

### Минимальная dependency

```python
from typing import Annotated
from fastapi import Depends

def get_api_mode() -> str:
    return "development"

ApiMode = Annotated[str, Depends(get_api_mode)]

@router.get("/")
def get_tasks(api_mode: ApiMode):
    return {
        "mode": api_mode,
        "items": tasks,
    }
```


### Активная проверка

```text
request
→ validate input
→ get_api_mode()
→ get_tasks(api_mode)
→ response
```

1. Строка 1: Request сопоставлен route. — request=GET /tasks
2. Строка 2: FastAPI проверяет параметры. — validation=ok
3. Строка 3: Dependency возвращает значение. — api_mode=development
4. Строка 4: Handler получает готовый аргумент. — handler=get_tasks
5. Строка 5: Return превращается в response. — status=200

> В этом занятии важно место dependency в пути request. Синтаксис Depends подробно разбирается в занятиях 70–71.

## 6. Endpoint связывает части, но не хранит всё

Хороший endpoint похож на диспетчера: принимает уже проверенный вход, вызывает предметную функцию и выбирает HTTP-ответ. Он не должен одновременно вычислять id, фильтровать список, читать настройки и формировать все ошибки вручную.

### HTTP-граница

Path, query, body, Depends, status_code и HTTPException остаются рядом с endpoint.

### Предметная операция

CRUD-функция получает обычные Python-значения и возвращает результат.

### Переиспользование

Ту же CRUD-функцию можно вызвать из теста без запуска HTTP-клиента.

### Читаемость

Сигнатура показывает контракт, тело — один сценарий.

### Перегруженный endpoint

```python
@router.post("/")
def create_task(task: TaskCreate):
    # вычисление id
    # поиск дубликата
    # изменение storage
    # формирование словаря ответа
    # обработка всех исключений
    ...
```

### Endpoint-координатор

```python
@router.post(
    "/",
    response_model=TaskRead,
    status_code=201,
)
def create_task(task: TaskCreate):
    return task_crud.create_task(
        storage=tasks,
        data=task,
    )
```


### Активная проверка

Какое тело endpoint легче объяснить?

**Вариант A — Вся логика внутри**

```text
def create_task(...):
    # 45 строк разных обязанностей
```

HTTP и предметные правила смешаны.

**Вариант B — Координация**

```text
def create_task(task):
    return task_crud.create_task(tasks, task)
```

Endpoint связывает готовые части.

**Разбор:** Предметная операция получает проверенные данные, а endpoint сохраняет HTTP-контракт.

> Короткий endpoint не является целью сам по себе. Вынесенная функция должна иметь ясную ответственность, а не скрывать весь проект под именем process().

## 7. Формирование response и путь ошибки

После return FastAPI применяет response_model, сериализует данные и добавляет status и headers. Если код создаёт HTTPException, формируется error response; непредвиденная ошибка обычно приводит к 500 и traceback в серверном логе.

### Response model

Проверяет и фильтрует публичную форму ответа.

### Serialization

Python-объекты превращаются в JSON-совместимое содержимое.

### Expected error

HTTPException описывает известный HTTP-результат.

### Unexpected error

Traceback нужен разработчику; внутренние детали не должны становиться публичным body.

### Успех

```python
return TaskRead(
    id=3,
    title="FastAPI pipeline",
    priority=4,
    is_done=False,
)

→ 200/201 + JSON
```

### Известная ошибка

```python
if task is None:
    raise HTTPException(
        status_code=404,
        detail="Task not found",
    )
```


### Активная проверка

```python
@router.get("/{task_id}")
def get_task(task_id: int):
    try:
        return task_crud.get_task(tasks, task_id)
    except Exception:
        return {"error": "something happened"}
```

Что ломает HTTP-контракт?

1. Все ошибки превращаются в успешный 200
2. FastAPI запрещает try
3. Return dict нельзя использовать

**Ответ:** 1. Неизвестные ошибки скрываются, а клиент получает неправильную категорию результата.

Исправление:

```python
@router.get("/{task_id}")
def get_task(task_id: int):
    task = task_crud.get_task(tasks, task_id)

    if task is None:
        raise HTTPException(404, "Task not found")

    return task
```

> Не оборачивайте весь endpoint в except Exception с ответом 200. Это скрывает status, traceback и причину дефекта.

## 8. Практика: трассировка POST /tasks

Закрепите блок не новым endpoint, а точным объяснением одного существующего request. Подпишите данные и ответственность на каждом переходе.

### Request

POST /tasks, Content-Type и JSON body.

### Validation

TaskCreate проверяет title и priority.

### Dependencies

Получаются настройки или режим приложения.

### Endpoint

Вызывает create_task и не знает детали будущей базы.

### Response

TaskRead и status 201 возвращаются клиенту.

### Карта для заполнения

```python
POST /tasks
→ route: __________________
→ body schema: ____________
→ dependency: _____________
→ handler: _________________
→ CRUD function: __________
→ storage: _________________
→ response model: _________
→ status: _________________
```


> Если ученик может определить, на каком этапе появились 404, 422 и 500, главная модель занятия усвоена.

## Итоговый квиз

1. **Что происходит раньше endpoint?**
   - A. `validation и dependencies`
   - B. `response serialization`
   - C. `return клиента`
   - **Ответ: A.** Handler получает уже подготовленные значения.

2. **Кто принимает сетевой request?**
   - A. `Uvicorn`
   - B. `Pydantic model`
   - C. `CRUD function`
   - **Ответ: A.** Uvicorn обслуживает сетевой процесс.

3. **Зачем endpoint оставлять координатором?**
   - A. `разделить HTTP и предметные правила`
   - B. `запретить функции`
   - C. `уменьшить JSON`
   - **Ответ: A.** Границы становятся видимыми и тестируемыми.

4. **Что обычно означает 422?**
   - A. `вход не прошёл schema validation`
   - B. `объект не найден`
   - C. `сервер выключен`
   - **Ответ: A.** Validation завершилась до handler.

## Главное из занятия

- Request проходит последовательность границ.
- Uvicorn и FastAPI выполняют разные роли.
- Route выбирается по method и path.
- Parsing и Pydantic validation происходят до endpoint.
- Dependencies решаются до handler.
- Endpoint связывает HTTP и предметную операцию.
- Response model и serialization работают после return.
- Status помогает определить этап и причину результата.

## Практика

Проследите POST /tasks в текущем Planner API, подпишите восемь этапов и сократите один перегруженный endpoint до функции-координатора.

### Критерии готовности

- Обычный успешный request проходит.
- Один ожидаемый error response проверен.
- Путь значений объясняется своими словами.
- Код не использует будущую тему без подготовки.
- Postman или Swagger показывает контракт.
- Сделан отдельный Git-коммит.

<!-- youtube: -->

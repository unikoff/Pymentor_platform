# 70. Первая зависимость через Depends

## Паспорт занятия

- Этап: 4 — FastAPI, SQLite и SQLAlchemy.
- Блок: 13 — FastAPI как цельное приложение.
- Длительность: 75–100 минут.
- Предварительные знания: путь request, функции как значения, decorators, type hints, query parameters и HTTPException.
- Результат: ученик создаёт первую dependency, получает её результат в endpoint, отличает dependency от helper и глобальной переменной и применяет её к pagination и режиму API.

## Введение

Найдём повторяющийся код в endpoints, превратим его в обычную функцию-зависимость и увидим, как FastAPI вызывает callable и передаёт возвращённое значение.

## 1. Повторяемый код становится сигналом

В нескольких endpoints Planner API повторяются одинаковые query-параметры, границы limit и сборка словаря pagination. Это не ошибка, но хороший кандидат для одного общего шага.

### Повторение видно

Одинаковая сигнатура и одинаковая подготовка встречаются в нескольких handlers.

### Не всё выносится

Однократная строка не требует dependency только ради архитектуры.

### Критерий

Шаг должен быть нужен FastAPI до endpoint и иметь понятный возвращаемый результат.

### До depends

```python
@router.get("/")
def get_tasks(
    offset: int = 0,
    limit: int = 20,
):
    ...

@router.get("/search")
def search_tasks(
    q: str,
    offset: int = 0,
    limit: int = 20,
):
    ...
```


### Активная проверка

**Вопрос:** Какой код первым стоит рассмотреть как dependency?

**Ориентир ответа:** Тот, который повторяется в нескольких endpoints и должен выполняться до handler, например общая pagination или получение настроек.

> Dependency решает повторяемую подготовку входа. Она не должна становиться складом несвязанных функций.

## 2. Dependency — это обычный callable

Первая dependency выглядит как обычная функция. Она может получать path, query, header, cookie, body или результаты других dependencies так же, как endpoint.

### Callable

Чаще всего это функция, но FastAPI способен работать и с другими вызываемыми объектами.

### Параметры

FastAPI разбирает сигнатуру dependency по тем же правилам.

### Return

Возвращённое значение может быть передано endpoint.

### Без decorator

У dependency нет @router.get, потому что она не является отдельным HTTP route.

### Первая функция

```python
from typing import Annotated
from fastapi import Query


def get_pagination(
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> dict[str, int]:
    return {
        "offset": offset,
        "limit": limit,
    }
```


### Активная проверка

Соедините элемент функции и смысл.

- `offset, limit` → вход dependency
- `Query(ge=...)` → validation query
- `return dict` → результат для endpoint
- `нет decorator` → не отдельный route

Dependency остаётся обычной Python-функцией с особым способом использования.

> Функцию можно вызвать напрямую в unit-тесте, но внутри HTTP request её вызовом управляет FastAPI.

## 3. Depends сообщает FastAPI о потребности

Endpoint не вызывает get_pagination скобками. Он передаёт сам callable в Depends, а FastAPI вызывает функцию в нужный момент.

### Не вызываем сейчас

Depends(get_pagination), а не Depends(get_pagination()).

### Аргумент endpoint

Имя pagination получит возвращённый dict.

### До handler

Validation offset и limit завершится раньше тела endpoint.

### Swagger

Query-параметры dependency появятся в документации route.

### Endpoint

```python
from fastapi import Depends

@router.get("/")
def get_tasks(
    pagination: dict[str, int] = Depends(get_pagination),
):
    offset = pagination["offset"]
    limit = pagination["limit"]

    return tasks[offset : offset + limit]
```


### Активная проверка

Что передают в Depends?

```text
pagination = Depends(____)
```

Варианты: `get_pagination`, `get_pagination()`, `pagination`

**Ответ:** `get_pagination`. Передаётся функция, а вызов выполняет FastAPI.

> Старая форма без Annotated показана только как первый шаг. В следующем занятии сигнатура станет чище.

## 4. Возвращаемое значение инъектируется в endpoint

Слово injection означает, что endpoint объявил потребность, а FastAPI подготовил и передал значение. Никакого скрытого присваивания глобальной переменной не происходит.

### Request

Клиент отправляет offset и limit.

### Dependency

Получает параметры, проверяет границы и возвращает dict.

### Endpoint

Получает готовый pagination.

### Response

Использует значения для среза.

### Путь значений

```python
GET /tasks?offset=20&limit=10
→ get_pagination(offset=20, limit=10)
→ {"offset": 20, "limit": 10}
→ get_tasks(pagination=...)
→ tasks[20:30]
```


### Активная проверка

```text
request query
→ get_pagination
→ return dict
→ endpoint argument
→ list slice
```

1. Строка 1: Из URL извлекаются query values. — offset=20, limit=10
2. Строка 2: FastAPI вызывает dependency. — call=get_pagination
3. Строка 3: Функция возвращает словарь. — pagination=dict
4. Строка 4: Значение передаётся handler. — argument=pagination
5. Строка 5: Endpoint формирует result. — slice=20:30

> Dependency не подменяет аргументы случайным образом: связь явно записана в сигнатуре endpoint.

## 5. Dependency не равна глобальной переменной

Глобальная константа подходит для действительно постоянного значения. Dependency полезна, когда значение нужно получить, проверить, заменить в тесте или связать с request.

### Global

Создаётся при импорте и доступна напрямую всему модулю.

### Dependency

Решается FastAPI для конкретного request или приложения.

### Тестирование

Dependency можно override без изменения endpoint.

### Явная потребность

Аргумент функции показывает, что handler зависит от значения.

### Глобальное чтение

```python
API_MODE = "development"

@router.get("/info")
def info():
    return {"mode": API_MODE}
```

### Dependency

```python
def get_api_mode() -> str:
    return "development"

@router.get("/info")
def info(
    api_mode: str = Depends(get_api_mode),
):
    return {"mode": api_mode}
```


### Активная проверка

Что лучше для значения, которое тест должен заменить?

**Вариант A — Прямой global**

```text
API_MODE = "development"
```

Endpoint жёстко читает значение из модуля.

**Вариант B — Dependency**

```text
api_mode = Depends(get_api_mode)
```

Тест может заменить provider.

**Разбор:** Dependency делает потребность endpoint явной и управляемой.

> Не нужно превращать каждую константу в dependency. Выбор оправдан, когда FastAPI должен управлять получением значения или его заменой.

## 6. Helper и dependency решают разные задачи

Обычный helper вызывается вашим кодом. Dependency вызывается FastAPI как часть подготовки request. Одна функция не становится dependency только потому, что вынесена из endpoint.

### Helper

normalize_title(title) вызывается там, где предметной операции нужна нормализация.

### Dependency

get_pagination() получает query и нужен до нескольких endpoints.

### Граница

Чистое предметное правило не должно импортировать Depends.

### Проверка

Спросите: кто должен управлять вызовом — мой код или FastAPI?

### Helper

```python
def normalize_title(title: str) -> str:
    cleaned = title.strip()
    if not cleaned:
        raise ValueError("empty title")
    return cleaned
```

### Dependency

```python
def get_pagination(
    offset: int = 0,
    limit: int = 20,
) -> dict[str, int]:
    return {"offset": offset, "limit": limit}
```


### Активная проверка

Кто должен вызвать функцию?

- `normalize_title` → CRUD/service code
- `calculate_next_id` → CRUD code
- `get_pagination` → FastAPI dependency system
- `get_settings` → FastAPI dependency system

Helper обслуживает предметную операцию, dependency — подготовку окружения endpoint.

> Смешивание Depends с предметными функциями делает их сложнее использовать вне HTTP.

## 7. Dependency может завершить request раньше

Dependency способна проверить условие и создать HTTPException. Это полезно для общего режима обслуживания, обязательного ключа или будущей авторизации.

### Проверка

Условие выполняется до handler.

### HTTPException

Формирует ожидаемый error response.

### Нет вызова endpoint

Предметная операция не запускается при запрещённом режиме.

### Не злоупотреблять

Условие должно быть общим для зависимых endpoints.

### Проверка режима

```python
from fastapi import HTTPException

def require_write_mode(
    api_mode: str = Depends(get_api_mode),
) -> str:
    if api_mode == "read-only":
        raise HTTPException(
            status_code=503,
            detail="Write operations are disabled",
        )

    return api_mode

@router.post("/")
def create_task(
    task: TaskCreate,
    api_mode: str = Depends(require_write_mode),
):
    ...
```


### Активная проверка

```text
получить api_mode
if api_mode == "read-only":
    raise HTTPException(503)
else:
    return api_mode
вызвать create_task
```

- `development` → строка 4 → `dependency returns mode`
- `read-only` → строка 3 → `503 before endpoint`

> Dependency не должна скрывать обычную проверку только ради короткого endpoint. Её смысл — переиспользуемое условие нескольких routes.

## 8. Практика: pagination и app mode

В Planner API достаточно двух простых dependencies: одна собирает query pagination, другая предоставляет режим приложения. Это готовит следующий урок без глубокой вложенности.

### Шаг 1

Создайте get_pagination и подключите к GET /tasks.

### Шаг 2

Создайте get_api_mode и подключите к GET /info.

### Шаг 3

Проверьте 422 для limit=0.

### Шаг 4

Добавьте require_write_mode к POST /tasks.

### Шаг 5

Убедитесь, что read-only даёт 503 до изменения storage.

### Контрольная карта

```python
GET /tasks
→ Depends(get_pagination)
→ endpoint receives dict

POST /tasks
→ Depends(require_write_mode)
→ 201 or 503
```


> На защите ученик должен объяснить, кто вызывает dependency и откуда появляется значение аргумента endpoint.

## Итоговый квиз

1. **Что передают в Depends?**
   - A. `callable без вызова`
   - B. `результат вызова обязательно`
   - C. `URL`
   - **Ответ: A.** FastAPI сам вызывает dependency.

2. **Что получает аргумент endpoint?**
   - A. `return dependency`
   - B. `имя функции строкой`
   - C. `глобальный request автоматически`
   - **Ответ: A.** Результат инъектируется в handler.

3. **Чем helper отличается от dependency?**
   - A. `helper вызывает ваш код, dependency решает FastAPI`
   - B. `ничем`
   - C. `helper всегда async`
   - **Ответ: A.** Разница в управлении вызовом и роли.

4. **Когда dependency может вернуть 503?**
   - A. `до endpoint при общем запрещающем условии`
   - B. `после отправки response`
   - C. `только в middleware`
   - **Ответ: A.** HTTPException останавливает путь до handler.

## Главное из занятия

- Depends принимает callable, а не результат вызова.
- Dependency похожа на обычную функцию без route decorator.
- FastAPI решает её параметры по тем же правилам.
- Return dependency становится аргументом endpoint.
- Dependency отличается от глобальной переменной управляемостью.
- Helper и dependency имеют разные владельцы вызова.
- Dependency может создать ожидаемый error response.
- Начинать стоит с коротких и понятных providers.

## Практика

Вынесите pagination и режим API в две dependencies, проверьте их через Swagger и добавьте сценарий read-only для POST /tasks.

### Критерии готовности

- Обычный успешный request проходит.
- Один ожидаемый error response проверен.
- Путь значений объясняется своими словами.
- Код не использует будущую тему без подготовки.
- Postman или Swagger показывает контракт.
- Сделан отдельный Git-коммит.

<!-- youtube: -->

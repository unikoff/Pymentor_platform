# 74. Middleware и CORS

## Паспорт занятия

- Этап: 4 — FastAPI, SQLite и SQLAlchemy.
- Блок: 13 — FastAPI как цельное приложение.
- Длительность: 90–115 минут.
- Предварительные знания: полный путь request, Response, headers, settings, browser/frontend и HTTP OPTIONS на уровне идеи.
- Результат: ученик пишет синхронно понятный HTTP middleware, измеряет request time, объясняет origin и настраивает CORSMiddleware без универсального wildcard при credentials.

## Введение

Добавим поведение вокруг всех requests: измерим время, поставим общий response header и разрешим локальному браузерному frontend обращаться к API через точную CORS-конфигурацию.

## 1. Middleware окружает обработку request

Некоторые действия нужны почти каждому endpoint: измерить время, добавить общий header или записать request в лог. Копировать эти строки в каждый handler неудобно.

### До endpoint

Middleware получает Request и может выполнить подготовку.

### call_next

Передаёт request дальше по цепочке к route.

### После endpoint

Получает готовый Response и может изменить metadata.

### Общий охват

Один middleware применяется ко многим routes.

### Схема

```python
client
→ middleware before
→ dependencies and endpoint
→ middleware after
→ client
```

### Минимальный middleware

```python
from fastapi import Request

@app.middleware("http")
async def add_common_header(
    request: Request,
    call_next,
):
    response = await call_next(request)
    response.headers["X-App-Name"] = "StudyHub"
    return response
```


### Активная проверка

Соедините участок и действие.

- `before call_next` → прочитать request и начать таймер
- `call_next(request)` → передать request дальше
- `after call_next` → получить и изменить response
- `return response` → отправить итог клиенту

Middleware имеет симметричную часть до и после обработки.

> Endpoints курса остаются обычными def. Функция decorator middleware в этом API использует async/await из-за интерфейса call_next; подробная асинхронность изучается позже.

## 2. Измеряем время ответа

perf_counter подходит для измерения коротких интервалов. Значение фиксируется до call_next, после response вычисляется разница и добавляется custom header.

### Start

Сохраняется перед передачей request.

### Await call_next

Включает route, validation, dependencies и handler ниже по цепочке.

### Elapsed

Разница вычисляется после получения response.

### Header

X-Process-Time помогает увидеть результат в Postman.

### Timing middleware

```python
from time import perf_counter
from fastapi import Request

@app.middleware("http")
async def add_process_time(
    request: Request,
    call_next,
):
    started_at = perf_counter()

    response = await call_next(request)

    elapsed = perf_counter() - started_at
    response.headers["X-Process-Time"] = f"{elapsed:.6f}"

    return response
```


### Активная проверка

```text
started_at = perf_counter()
response = await call_next(request)
elapsed = perf_counter() - started_at
response.headers["X-Process-Time"] = ...
return response
```

1. Строка 1: Таймер начинается до endpoint. — started_at=number
2. Строка 2: Request проходит остальную цепочку. — call_next=awaited
3. Строка 3: После response вычисляется интервал. — elapsed=seconds
4. Строка 4: Response получает header. — header=X-Process-Time
5. Строка 5: Итог возвращается клиенту. — response=sent

> Это учебное измерение, а не полноценная observability. Оно не заменяет structured logs, metrics и tracing.

## 3. Общий header и request id

Middleware может создать request id, добавить его к response и использовать в логах. Это помогает связать client error и серверную запись.

### Генерация

UUID создаётся в начале request.

### Request state

Значение можно положить в request.state для кода ниже.

### Response header

Клиент получает X-Request-ID.

### Не безопасность

Случайный id не является access token.

### Request id

```python
from uuid import uuid4

@app.middleware("http")
async def add_request_id(
    request: Request,
    call_next,
):
    request_id = str(uuid4())
    request.state.request_id = request_id

    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id

    return response
```

### Использование

```python
@router.get("/info")
def get_info(request: Request):
    return {
        "request_id": request.state.request_id,
    }
```


### Активная проверка

**Вопрос:** Зачем request id возвращать в response?

**Ориентир ответа:** Клиент может сообщить идентификатор, а разработчик найти связанные серверные logs для конкретного request.

> Если browser frontend должен читать custom response header, его понадобится добавить в CORS expose_headers.

## 4. Что не помещать в middleware

Middleware работает вокруг большого числа routes, поэтому скрытая предметная логика быстро становится опасной. CRUD задач, проверка конкретной schema и выбор task status должны оставаться ниже.

### Подходит

Общее timing, request id, logging, CORS и единая техническая metadata.

### Не подходит

Создание Task, вычисление priority и изменение storage.

### Осторожно

Глобальный except в middleware может скрыть traceback и разные error handlers.

### Цена

Каждый middleware участвует во многих requests.

### Опасный вариант

```python
@app.middleware("http")
async def task_rules(request, call_next):
    if request.url.path.startswith("/tasks"):
        # вручную читать JSON
        # проверять title
        # изменять storage
        ...
    return await call_next(request)
```

### Правильная граница

```python
middleware: timing + request id
router: HTTP contract
schema: validation
crud/service: task rules
storage: state
```


### Активная проверка

Где проверять уникальность title?

**Вариант A — Middleware**

```text
перехватывать все /tasks requests
```

Скрывает правило и вручную разбирает body.

**Вариант B — CRUD/service**

```text
check before creating task
```

Правило вызывается только в нужной operation.

**Разбор:** Middleware не заменяет предметный слой.

> Общее техническое поведение размещается глобально, предметное — рядом с предметной областью.

## 5. Origin — protocol, host и port

Браузер сравнивает origin frontend и backend. Даже localhost с разными ports считается разными origins, поэтому JavaScript-request может потребовать разрешение CORS.

### Protocol

http и https создают разные origins.

### Host

localhost и 127.0.0.1 считаются разными host names.

### Port

5173 и 8000 создают разные origins.

### Browser policy

CORS в первую очередь ограничивает JavaScript в браузере, а не Postman.

### Локальная схема

```python
frontend: http://localhost:5173
backend:  http://127.0.0.1:8000

protocol/host/port differ
→ cross-origin browser request
```

### Одинаковый origin

```python
http://localhost:5173/page
http://localhost:5173/api
→ same protocol + host + port
```


### Активная проверка

Сравните origins.

- `http://localhost:5173 и http://localhost:8000` → different: port
- `http://localhost:5173 и https://localhost:5173` → different: protocol
- `http://localhost:5173/a и http://localhost:5173/b` → same origin
- `http://localhost и http://127.0.0.1` → different: host

Origin определяется protocol, host и port, но не path.

> Postman может успешно вызвать API, пока browser frontend получает CORS error. Это не противоречие: ограничения применяет браузер.

## 6. CORSMiddleware разрешает точные origins

FastAPI подключает готовый CORSMiddleware. Для локального frontend создаётся список допустимых origins; methods, headers и credentials задаются явно.

### allow_origins

Какие browser origins могут обращаться.

### allow_methods

Какие methods разрешены cross-origin.

### allow_headers

Какие request headers может отправить frontend.

### allow_credentials

Разрешает cookies и authorization credentials.

### Конфигурация

```python
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=[
        "Content-Type",
        "X-Client-Version",
    ],
    expose_headers=[
        "X-Request-ID",
        "X-Process-Time",
    ],
)
```


### Активная проверка

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Почему настройка не подходит для cookie-based browser requests?

1. Credentials требуют явных разрешённых origins/methods/headers
2. CORS не поддерживает GET
3. FastAPI запрещает middleware

**Ответ:** 1. Wildcard не является универсальной настройкой при credentials.

Исправление:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Client-Version"],
)
```

> При allow_credentials=True origins, methods и headers должны быть указаны явно, а не универсальным ["*"].

## 7. Preflight OPTIONS проверяет разрешение заранее

Перед некоторыми cross-origin requests браузер отправляет OPTIONS с Origin и Access-Control-Request-Method. CORSMiddleware отвечает, разрешено ли настоящее обращение.

### Preflight

Предварительный вопрос браузера к backend.

### OPTIONS

Method служебного request.

### CORS headers

Response сообщает разрешённый origin, methods и headers.

### Endpoint обычно не вызывается

Middleware обрабатывает preflight до предметной operation.

### Упрощённый preflight

```python
OPTIONS /tasks HTTP/1.1
Origin: http://localhost:5173
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type,x-client-version
```

### После разрешения

```python
POST /tasks HTTP/1.1
Origin: http://localhost:5173
Content-Type: application/json
X-Client-Version: 1.4.0
```


### Активная проверка

Расположите этапы.

Правильный порядок:
1. `JavaScript готовит POST`
2. `browser отправляет OPTIONS`
3. `CORSMiddleware проверяет origin/method/headers`
4. `browser отправляет POST`
5. `FastAPI выполняет operation`

Preflight может завершить взаимодействие раньше, если origin не разрешён.

> CORS не проверяет пользователя и не заменяет authentication. Он сообщает браузеру, разрешено ли frontend-коду читать cross-origin response.

## 8. Практика: local frontend и контрольная точка блока

Закройте блок общей конфигурацией StudyHub: request id и timing применяются ко всем requests, CORS разрешает только локальный frontend, headers доступны браузеру.

### Шаг 1

Добавьте timing middleware и X-Process-Time.

### Шаг 2

Добавьте request id и X-Request-ID.

### Шаг 3

Создайте список frontend_origins в Settings.

### Шаг 4

Подключите CORSMiddleware с явными значениями.

### Шаг 5

Проверьте Postman и browser fetch.

### Шаг 6

Убедитесь, что CRUD остаётся вне middleware.

### Финальный путь

```python
browser frontend
→ CORS preflight when needed
→ request-id middleware before
→ timing middleware before
→ route + validation + dependencies
→ endpoint + CRUD
→ middleware after
→ CORS response headers
→ browser reads allowed response
```


> Результат блока 13: FastAPI-проект имеет объяснимый request pipeline, dependencies, settings, headers/cookies и общее middleware-поведение.

## Итоговый квиз

1. **Что делает call_next?**
   - A. `передаёт request дальше и возвращает response`
   - B. `создаёт database session`
   - C. `читает .env`
   - **Ответ: A.** Middleware окружает остальную цепочку.

2. **Из чего состоит origin?**
   - A. `protocol + host + port`
   - B. `method + body`
   - C. `status + header`
   - **Ответ: A.** Path не входит в origin.

3. **Кого обычно ограничивает CORS?**
   - A. `JavaScript в браузере`
   - B. `Postman всегда`
   - C. `Python function`
   - **Ответ: A.** Browser применяет CORS policy.

4. **Можно ли использовать wildcard с credentials как универсальную настройку?**
   - A. `нет, нужны явные значения`
   - B. `да всегда`
   - C. `только для DELETE`
   - **Ответ: A.** Credentialed requests требуют точной конфигурации.

## Главное из занятия

- Middleware выполняет действия до и после endpoint.
- call_next передаёт request остальной цепочке.
- Timing и request id подходят для общего технического поведения.
- Предметный CRUD не помещается в middleware.
- Origin состоит из protocol, host и port.
- CORS важен для browser frontend на другом origin.
- CORSMiddleware задаёт allowed origins, methods и headers.
- Credentials требуют явной, а не wildcard-конфигурации.

## Практика

Добавьте X-Process-Time, X-Request-ID и точный CORSMiddleware для frontend на 5173, затем проверьте preflight и обычный request.

### Критерии готовности

- Обычный успешный request проходит.
- Один ожидаемый error response проверен.
- Путь значений объясняется своими словами.
- Код не использует будущую тему без подготовки.
- Postman или Swagger показывает контракт.
- Сделан отдельный Git-коммит.

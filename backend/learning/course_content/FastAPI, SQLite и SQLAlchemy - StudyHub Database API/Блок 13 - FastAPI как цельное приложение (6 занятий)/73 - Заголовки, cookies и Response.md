# 73. Заголовки, cookies и Response

## Паспорт занятия

- Этап: 4 — FastAPI, SQLite и SQLAlchemy.
- Блок: 13 — FastAPI как цельное приложение.
- Длительность: 80–105 минут.
- Предварительные знания: HTTP headers, request/response, Annotated, dependencies и settings.
- Результат: ученик получает headers и cookies через FastAPI, изменяет временный Response, понимает hyphen conversion и не называет cookie готовой server-side session.

## Введение

Расширим HTTP-контракт за пределы JSON body: прочитаем X-Client-Version, добавим собственный response header, установим и удалим учебную cookie через объект Response.

## 1. Headers описывают request, body переносит данные

JSON body содержит поля создаваемой задачи. Header сообщает метаданные обращения: версию клиента, формат, request id или будущий Authorization.

### Body

Предметные данные ресурса: title, priority, is_done.

### Header

Служебный контекст request, который не является полем Task.

### Стандартный

Content-Type и User-Agent имеют общеизвестный смысл.

### Custom

X-Client-Version создаётся для контракта конкретного приложения.

### Request

```python
POST /tasks HTTP/1.1
Content-Type: application/json
X-Client-Version: 1.4.0

{
  "title": "Headers",
  "priority": 4
}
```


### Активная проверка

Разместите данные.

- `title` → JSON body
- `priority` → JSON body
- `X-Client-Version` → request header
- `Content-Type` → request header

Предметные поля и служебные метаданные разделены.

> Не переносите title задачи в header. Выбор части request следует из роли данных.

## 2. Чтение Header через Annotated

FastAPI предоставляет функцию Header. Параметр x_client_version в Python соответствует HTTP-header X-Client-Version благодаря автоматической замене underscore на hyphen.

### Annotated type

Итоговое значение — str или None.

### Header metadata

FastAPI читает значение из request headers.

### Default None

Header становится необязательным.

### Conversion

x_client_version ↔ X-Client-Version.

### Endpoint

```python
from typing import Annotated
from fastapi import Header

@router.get("/info")
def get_info(
    x_client_version: Annotated[
        str | None,
        Header(),
    ] = None,
):
    return {
        "client_version": x_client_version,
    }
```

### Requests

```python
GET /info
→ client_version = null

GET /info
X-Client-Version: 1.4.0
→ client_version = "1.4.0"
```


### Активная проверка

Какое имя header прочитает FastAPI?

```text
x_client_version → ____
```

Варианты: `X-Client-Version`, `x_client_version`, `client.version`

**Ответ:** `X-Client-Version`. Header автоматически преобразует underscores в hyphens.

> Имена headers регистронезависимы на уровне HTTP. В документации принято писать слова через hyphen.

## 3. Обязательный header и понятная ошибка

Если версия клиента действительно обязательна для operation, default можно не задавать. Тогда отсутствие header станет validation error 422 до endpoint.

### Optional

Подходит для аналитики или постепенного внедрения.

### Required

Подходит, когда без metadata operation нельзя выполнить.

### 422

Сообщает о missing header в detail.

### Предметное правило

Неподдерживаемая версия может дать 400 или 426 по отдельной договорённости.

### Required

```python
@router.post("/")
def create_task(
    task: TaskCreate,
    x_client_version: Annotated[
        str,
        Header(),
    ],
):
    ...
```

### Manual support check

```python
SUPPORTED_CLIENT_VERSIONS = {"1.3.0", "1.4.0"}

if x_client_version not in SUPPORTED_CLIENT_VERSIONS:
    raise HTTPException(
        status_code=400,
        detail="Unsupported client version",
    )
```


### Активная проверка

```text
получить X-Client-Version
if header отсутствует:
    validation 422
elif version не поддерживается:
    HTTPException 400
else:
    вызвать endpoint
```

- `header missing` → строка 3 → `422`
- `version 0.1.0` → строка 5 → `400`
- `version 1.4.0` → строка 7 → `handler called`

> Не делайте header обязательным только ради демонстрации. Требование должно быть частью API-контракта.

## 4. Response parameter позволяет добавить header

FastAPI может предоставить временный объект Response. Endpoint изменяет его headers, а обычный return по-прежнему проходит через response_model и JSON serialization.

### Parameter

response: Response не читается из request.

### Temporary response

FastAPI использует его metadata при создании финального ответа.

### Custom header

Например X-API-Mode или X-Process-Source.

### Body

Можно продолжать возвращать Pydantic model или dict.

### Response header

```python
from fastapi import Response

@router.get("/info")
def get_info(
    response: Response,
    settings: SettingsDep,
):
    response.headers["X-API-Mode"] = settings.api_mode

    return {
        "app_name": settings.app_name,
    }
```

### Response

```python
HTTP/1.1 200 OK
X-API-Mode: development
Content-Type: application/json

{"app_name":"StudyHub Database API"}
```


### Активная проверка

Как добавить X-API-Mode, сохранив обычный JSON return?

**Вариант A — Вернуть только Response**

```text
return Response(...)
```

Придётся вручную отвечать за serialization.

**Вариант B — Изменить parameter Response**

```text
response.headers["X-API-Mode"] = ...
return {"app_name": ...}
```

FastAPI сохранит обычную обработку body.

**Разбор:** Temporary Response подходит для metadata вокруг обычного результата.

> Custom response header и JSON body решают разные задачи. Не дублируйте все поля body в headers.

## 5. Cookie читается как отдельный источник request

Cookie приходит в header Cookie, но FastAPI предоставляет отдельную функцию Cookie. Это делает сигнатуру понятнее и отражает параметр в OpenAPI.

### Имя

studyhub_visit_id — имя cookie в браузере.

### Optional

Первый request может прийти без cookie.

### Тип

На текущем этапе используется str | None.

### Не body

Cookie автоматически отправляется клиентом по правилам браузера.

### Чтение

```python
from fastapi import Cookie

@router.get("/visits")
def get_visits(
    studyhub_visit_id: Annotated[
        str | None,
        Cookie(),
    ] = None,
):
    return {
        "visit_id": studyhub_visit_id,
    }
```

### Request

```python
GET /visits HTTP/1.1
Cookie: studyhub_visit_id=demo-123
```


### Активная проверка

**Утверждение:** Наличие cookie studyhub_visit_id автоматически означает, что пользователь аутентифицирован.

**Ответ:** ложь.

Cookie — только переданное значение; доверие и session logic требуют отдельной реализации.

> Cookie является транспортом небольшого значения. Она ещё не создаёт server-side session, пользователя или права доступа.

## 6. Установка cookie через Response

Метод response.set_cookie добавляет Set-Cookie в response. Браузер может сохранить значение и отправлять его в следующих подходящих requests.

### key/value

Имя и значение cookie.

### httponly

Запрещает JavaScript читать cookie; полезно для будущих session cookies.

### samesite

Ограничивает cross-site отправку.

### secure

Требует HTTPS; для локального HTTP обычно False.

### Установка

```python
from uuid import uuid4

@router.post("/visits")
def start_visit(response: Response):
    visit_id = str(uuid4())

    response.set_cookie(
        key="studyhub_visit_id",
        value=visit_id,
        httponly=True,
        samesite="lax",
        secure=False,
    )

    return {
        "message": "Visit started",
    }
```

### Header

```python
Set-Cookie: studyhub_visit_id=...; HttpOnly; Path=/; SameSite=lax
```


### Активная проверка

```text
POST /visits
→ endpoint creates visit_id
→ response.set_cookie
→ Set-Cookie header
→ browser stores value
→ next request sends Cookie header
```

1. Строка 1: Клиент запускает operation. — request=POST /visits
2. Строка 2: Server создаёт идентификатор. — visit_id=uuid
3. Строка 3: Response получает cookie metadata. — method=set_cookie
4. Строка 4: Клиент получает Set-Cookie. — header=present
5. Строка 5: Браузер применяет свои правила хранения. — storage=browser
6. Строка 6: Следующий request может отправить cookie. — Cookie=studyhub_visit_id=...

> В production значение secure обычно True при HTTPS. Не копируйте локальную настройку механически в развёрнутое приложение.

## 7. Удаление cookie и границы учебного примера

Удаление выполняется response.delete_cookie с тем же key и совместимыми параметрами path/domain. Клиент получает Set-Cookie, который делает старое значение недействительным.

### Не удаление на сервере

Браузеру отправляется инструкция изменить cookie.

### Совпадение key/path

Иначе можно удалить не ту область или оставить старую cookie.

### Logout позже

В server-side session потребуется также удалить запись session на сервере.

### Сейчас

Удаляем только учебный visit id.

### Удаление

```python
@router.delete("/visits", status_code=204)
def finish_visit(response: Response) -> None:
    response.delete_cookie(
        key="studyhub_visit_id",
    )
```

### Сценарий

```python
POST /visits
→ Set-Cookie
GET /visits
→ cookie read
DELETE /visits
→ cookie expired
```


### Активная проверка

Расположите действия.

Правильный порядок:
1. `server sends Set-Cookie`
2. `client stores cookie`
3. `client sends Cookie header`
4. `FastAPI extracts value`
5. `server sends deletion Set-Cookie`

Cookie живёт в обмене response и последующих requests.

> Cookie может оставаться в интерфейсе клиента до обновления, но последующие requests должны следовать новому Set-Cookie.

## 8. Практика: версия клиента и visit cookie

Добавьте к StudyHub два независимых механизма: X-Client-Version как request metadata и studyhub_visit_id как учебную cookie. Не связывайте их с user authentication.

### GET /info

Принимает optional X-Client-Version и добавляет X-API-Mode.

### POST /visits

Устанавливает HttpOnly visit cookie.

### GET /visits

Показывает наличие идентификатора.

### DELETE /visits

Удаляет cookie со status 204.

### Postman

Проверьте request headers и cookie jar.

### Контрольная карта

```python
request header
X-Client-Version: 1.4.0
→ endpoint argument

response header
X-API-Mode: development

response Set-Cookie
→ client cookie storage
→ next request Cookie
```


> Итог занятия — ясное различие body, headers, cookies и response metadata.

## Итоговый квиз

1. **Во что превращается x_client_version?**
   - A. `X-Client-Version`
   - B. `x_client_version body field`
   - C. `query x-client-version`
   - **Ответ: A.** Header конвертирует underscores в hyphens.

2. **Как добавить custom response header?**
   - A. `через parameter Response`
   - B. `через TaskCreate`
   - C. `через path`
   - **Ответ: A.** Temporary Response участвует в финальном ответе.

3. **Что делает set_cookie?**
   - A. `добавляет Set-Cookie в response`
   - B. `создаёт server-side session автоматически`
   - C. `пишет JSON`
   - **Ответ: A.** Клиент получает инструкцию сохранить cookie.

4. **Является ли cookie готовой аутентификацией?**
   - A. `нет`
   - B. `да всегда`
   - C. `только в Swagger`
   - **Ответ: A.** Нужна отдельная логика доверия и session/user data.

## Главное из занятия

- Header читает request metadata.
- Underscore в имени обычно становится hyphen.
- Required header может дать 422 до endpoint.
- Response parameter добавляет headers и cookies к обычному return.
- Cookie извлекается отдельным маркером Cookie.
- set_cookie отправляет Set-Cookie клиенту.
- delete_cookie инструктирует клиента удалить значение.
- Cookie является транспортом, а не готовой session.

## Практика

Добавьте X-Client-Version, X-API-Mode и полный жизненный цикл studyhub_visit_id, затем проверьте headers и cookies в Postman.

### Критерии готовности

- Обычный успешный request проходит.
- Один ожидаемый error response проверен.
- Путь значений объясняется своими словами.
- Код не использует будущую тему без подготовки.
- Postman или Swagger показывает контракт.
- Сделан отдельный Git-коммит.

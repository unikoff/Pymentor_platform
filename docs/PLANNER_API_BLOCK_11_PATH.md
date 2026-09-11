# Сквозной путь блока 11: валидация, состояние и CRUD, занятия 57-62

## Зачем существует блок

В блоке 10 ученик научился запускать API, отдавать первые GET responses и принимать простой request body. Но приложение ещё не защищает предметные правила, не владеет созданными задачами и не умеет пройти полный жизненный цикл ресурса.

Блок 11 строит внутреннее ядро Planner API. Он отвечает на три вопроса:

1. Какие данные сервер имеет право принять от клиента?
2. Где находится текущее состояние задач и кто выдаёт id?
3. Как одно и то же правило CRUD работает для create, read, replace, patch и delete?

Это не блок про организацию файлов, APIRouter или API-тесты. Сначала ученик должен понять корректное поведение ресурса. В следующем блоке это поведение будет вынесено в устойчивую структуру и проверено как публичный HTTP-contract.

## Исходная точка

После занятия 56 существует studyhub-api с:

- воспроизводимым запуском FastAPI и Uvicorn;
- GET /health, GET /tasks и GET /stats над временными данными;
- первой моделью TaskCreate;
- примером POST request body, который даёт 201 или 422;
- пониманием path, query, request, response и HTTP methods.

Но пока нет:

- предметных ограничений title и priority;
- ясной границы между входной схемой, response и обновлением;
- server-owned in-memory storage;
- общего правила поиска item;
- полной CRUD-цепочки;
- router package и TestClient.

## Результат блока

После занятия 62 ученик обладает точной спецификацией и тренажёром полного жизненного цикла задачи:

~~~text
клиент отправляет допустимые данные
  -> Pydantic останавливает невалидный вход
  -> storage владеет текущими task records
  -> CRUD применяет одно правило к collection или item
  -> HTTP layer позже переведёт результат в 201, 200, 204, 404 или 422
~~~

Практический результат состоит из двух связанных частей:

| Часть | Что в ней появляется | Зачем она нужна |
| --- | --- | --- |
| Реальный API-проект | Усиленный TaskCreate, response contracts и документация validation cases | Ученик видит, что вход защищён до бизнес-логики |
| Задания в интерпретаторе | Чистые операции storage и CRUD над одним форматом task dictionary | Ученик безопасно разбирает алгоритмы до их интеграции в router |

После блока нельзя обещать finished Planner API. В кодовом проекте ещё не обязаны существовать финальные файлы storage.py, crud.py и routers/tasks.py. Их создание и соединение относится к 63-67. Однако все их правила уже должны быть согласованы и готовы к переносу без переизобретения.

## Ключевое решение о схемах обновления

Полная замена и частичное изменение не могут использовать одну неясную схему.

| Контракт | Назначение | Поля |
| --- | --- | --- |
| TaskCreate | Вход для POST | title и priority обязательны; id и is_done принадлежат серверу |
| TaskRead | Выход для клиента | id, title, priority, is_done всегда присутствуют |
| TaskReplace | Вход для PUT | все изменяемые поля обязательны, потому что ресурс заменяется полностью |
| TaskPatch | Вход для PATCH | изменяемые поля optional, потому что отсутствующее поле нельзя менять |

Текущий урок 58 использует имя TaskUpdate. При точечной переработке нужно принять одно из двух ясных решений:

1. переименовать его в TaskPatch и оставить поля optional;
2. сделать его схемой полного PUT, где все изменяемые поля обязательны, а TaskPatch впервые ввести в 61.

Рекомендуемый путь: в 58 объяснить проблему разных направлений данных через TaskCreate и TaskRead, а в 61 явно ввести две разные update-схемы: TaskReplace и TaskPatch. Нельзя показывать optional TaskUpdate как схему полного PUT. Это создаёт противоречие между теорией, OpenAPI и практикой.

## Цепочка занятий

| Занятие | Центральный вопрос | Новая способность | Основная практика | Результат и мостик |
| --- | --- | --- | --- | --- |
| 57. Pydantic-валидация и 422 | Как сервер не пропускает плохие данные в прикладную логику? | Field constraints, error detail, отсутствие side effect после 422 | Ручная проектная практика | Усиленный TaskCreate и validation-cases.md |
| 58. Разные схемы | Почему один класс не должен быть одновременно входом, обновлением и ответом? | Разделять направление данных и серверные поля | Ручная проектная практика | Согласованные договоры входа и ответа |
| 59. In-memory storage и id | Как сервер создаёт новую запись, не меняя входной collection? | Копии, next_id, нормализация и server-owned state | Интерпретатор | Чистое правило add record |
| 60. Create, list и get | Как три операции используют один источник данных и одно правило поиска? | Соединять create, collection read и item read | Интерпретатор | Первая половина CRUD |
| 61. PUT и PATCH | Как не потерять поля при частичном изменении и не оставить старые поля при замене? | Полная замена, частичное изменение, разрешённые поля | Интерпретатор | Два независимых договора обновления |
| 62. DELETE, 204 и 404 | Как удаление меняет collection и становится наблюдаемым HTTP-результатом? | Удаление без мутации входа, отсутствующий item, no-content response | Интерпретатор | Завершённая алгоритмическая CRUD-цепочка |

~~~text
валидный body
  -> точные schemas
  -> создание server-owned record
  -> create, list, get
  -> replace и patch
  -> delete и путь ошибки
  -> блок 12: routers, tests и интеграция в готовый API
~~~

## Паспорта уроков

### 57. Pydantic-валидация и ошибка 422

**Роль в цепочке.** Ученик не знакомится с BaseModel заново. Он усиливает уже существующий TaskCreate и впервые проверяет, что неверный request не доходит до бизнес-логики.

**Теория должна дать.**

- отличие required field, неверного типа и нарушения предметной границы;
- Field constraints для непустого и ограниченного title, а также priority в диапазоне 1-5;
- как читать loc, type и msg внутри 422 detail;
- почему FastAPI отвечает 422 до тела endpoint;
- почему failure request не имеет права менять in-memory state;
- production смысл server-side validation, даже если клиент уже проверяет форму.

**Практика.** Ручная. Ученик добавляет constraints в TaskCreate, отправляет четыре отдельные невалидные request и один валидный граничный request. Он документирует вход, status и понятные части detail в docs/validation-cases.md. Отдельно доказывает, что число задач не меняется после каждого failure scenario.

**Не вводить.** Новые CRUD-операции, custom validators, response schemas, ручное формирование 422 и общие exception handlers.

**Мостик.** Когда вход уже стабилен, следующий урок разделяет формы create, read и update. Валидация одного TaskCreate не должна расползаться на все направления данных.

### 58. Разные схемы: create, read и update

**Роль в цепочке.** Ученик видит, что данные имеют владельца и направление. Клиент создаёт только то, чем может управлять. Сервер добавляет id и is_done. Ответ гарантирует форму, на которую сможет опереться любой клиент.

**Теория должна дать.**

- разницу между input schema и response schema;
- server-managed поля id и is_done;
- response_model как обещание внешней формы и фильтр лишних данных;
- extra fields как отдельное договорное решение, а не случайность Pydantic;
- подготовку различия PUT and PATCH без смешения их семантики;
- почему schema отвечает за форму данных, а storage и CRUD за состояние и операции.

**Практика.** Ручная. Ученик переносит schemas в отдельный модуль, создаёт TaskCreate и TaskRead, подключает response_model к существующим POST and GET routes, проверяет Swagger и фиксирует поведение лишнего id в docs/api-contract.md. Затем он отдельно записывает, какая схема в дальнейшем будет нужна для полного replace и какая для partial patch.

**Не вводить.** Генерацию id в router, запись задачи в list, PATCH implementation и final directory architecture. Этот урок определяет договоры, а не собирает систему хранения.

**Мостик.** После разделения формы данных можно безопасно определить, как сервер хранит одну запись и выдаёт идентификатор.

### 59. Хранилище в памяти и генерация идентификатора

**Роль в цепочке.** Это первая чистая операция server-owned state. Ученик больше не видит список как случайную переменную в endpoint. Он начинает видеть collection как состояние, которое нельзя незаметно изменить через входной object.

**Теория должна дать.**

- in-memory storage как состояние одного процесса;
- почему следующий id выбирает сервер, а не клиент;
- чтение и запись через копию как защита от скрытой общей мутации;
- next_id from maximum existing id, including empty collection and gaps;
- normalization of title as part of the agreed rule;
- why data still disappear after restart and why this is intentional before the database course.

**Практика.** Интерпретатор получает текущие tasks, title и priority. Он создаёт новый список копий, вычисляет next_id, очищает title, добавляет запись с is_done=False и возвращает created и items. Автопроверка покрывает пустое storage, обычную последовательность и пропуск в id.

**Граница формата.** Это чистое правило хранения. Оно не импортирует FastAPI, не возвращает Response, не читает JSON и не создаёт файл. В блоке 12 его смысл будет перенесён в storage и CRUD modules.

### 60. CRUD: создать, получить список и найти по id

**Роль в цепочке.** Ученик собирает первую половину lifecycle ресурса. Операции должны работать с одним итоговым состоянием, а поиск item не должен жить в каждой ветке отдельно.

**Теория должна дать.**

- CRUD как карта действий над одним resource;
- create returns a new server-owned record;
- list returns collection without changing storage;
- get returns copy of one record or domain absence;
- why a reusable find rule prevents different 404 behaviour;
- how POST then GET form one observable data path.

**Практика.** Интерпретатор создаёт одну task, получает обновлённый list и ищет lookup_id. Он возвращает created, items и found. Автопроверка проверяет поиск новой task, старой task, отсутствующий id и неизменность входа.

**Не вводить.** PUT, PATCH, DELETE, HTTPException and final API route code. Здесь закрепляется только create/list/get.

**Мостик.** Следующий урок не переписывает create or get. Он добавляет две разные операции изменения уже найденного resource.

### 61. PUT и PATCH: полная и частичная замена

**Роль в цепочке.** Ученик получает самую важную семантическую развилку CRUD. PUT заменяет представление целиком. PATCH применяет только явно присланные поля.

**Теория должна дать.**

- полная замена: старые изменяемые поля не сохраняются в результате PUT;
- частичное изменение: поля, отсутствующие в PATCH, остаются без изменений;
- distinction between absent field and a supplied false value;
- allowed fields title, priority and is_done;
- title normalization when it is supplied;
- why exclude_unset belongs to input boundary, while the update rule belongs to CRUD.

**Практика.** Интерпретатор получает существующую task и payload операции. Для PUT он создаёт новую запись с тем же id и только с изменяемыми полями из полного payload. Для PATCH он начинает с copy и меняет только явно переданные разрешённые поля. Автопроверка доказывает, что replace удаляет устаревшее дополнительное поле, а patch сохраняет нетронутые значения.

**Не вводить.** Database merge, optimistic locking, PATCH for nested objects, arbitrary dynamic fields and router decorators. Один resource с четырьмя полями достаточен для понимания semantics.

**Мостик.** После create и update остаётся одно действие, которое меняет collection сильнее всего: delete. Оно одновременно закрепляет 204 и путь ошибки.

### 62. DELETE, 204 и HTTPException

**Роль в цепочке.** Ученик завершает lifecycle ресурса и видит, что ошибка отсутствующего item является частью contract, а не случайным exception.

**Теория должна дать.**

- delete as a request to remove a chosen item;
- 204 No Content as a successful result without response body;
- отсутствующий корректный id как 404;
- unexpected error as a different situation from known absence;
- why one get_task_or_404 rule prevents conflicting endpoint behaviour;
- distinction between domain outcome and HTTP translation.

**Практика.** Интерпретатор создаёт новый remaining list из копий без выбранной task. Если item найден, результат содержит deleted=True и наблюдаемый исход 204. Если item отсутствует, deleted=False и наблюдаемый исход 404. Исходные records и входной list нельзя напрямую использовать в output.

**Граница архитектуры.** В реальном storage или CRUD module не должно быть import FastAPI или HTTPException. При будущей интеграции отсутствие предметного объекта становится HTTPException(404) в router, а успешный delete получает status_code=204 без body. Если editor task хранит numeric status для проверки, это учебная модель внешнего контракта, а не шаблон для storage.py.

## Правила непрерывности

1. Урок 57 расширяет TaskCreate из 56, а не создаёт вторую первую BaseModel.
2. Урок 58 не имеет права описывать optional update schema как полный PUT. Contract replace and patch must be visibly different.
3. Уроки 59-62 используют один task shape: id, title, priority and is_done.
4. Каждый code task получает входные arguments и возвращает новое value. Он не требует app files, импортов FastAPI, сети или database.
5. Copy semantics are explicit: практика либо доказывает absence of mutation, либо сама не требует copies.
6. Status 422 is input validation. Status 404 is valid request with missing resource. Status 204 is successful delete without body.
7. В блоке не появляются APIRouter, TestClient, JSON persistence, SQLAlchemy, auth or async.
8. В блоке 12 нельзя заново проектировать CRUD. Он переносит договоры блока 11 в файлы и публичные API-тесты.

## Синхронизация представлений

У ученика отображается React-код из frontend/src/lessons/planner-api/block11.tsx. Markdown, manual practice and code tasks are separate sources. При точечной переработке каждого урока нужно синхронизировать:

1. Markdown и видимый React-урок;
2. table of contracts and actual schema names;
3. manual task steps, hints and answer, or editor contract and hidden tests;
4. vocabulary in the next lesson;
5. API contract docs and Swagger examples, if they already exist.

Особое внимание уроку 58. Сейчас его ручная практика использует optional TaskUpdate, а дальнейшему PUT нужно полное представление. До реализации это противоречие нужно убрать из каждого видимого источника.

## Критерий готовности блока

Блок готов, если ученик может:

1. объяснить, почему 422 появляется до CRUD, и показать, что state не изменился;
2. назвать направление и владельца каждого поля в TaskCreate, TaskRead, TaskReplace и TaskPatch;
3. create a server-owned item with predictable next_id, including a gap in old ids;
4. провести одну task через create, list, get, replace, patch и delete;
5. explain why PUT removes stale fields and PATCH preserves absent fields;
6. отличить 404 от 422 и 204 от 200 с body;
7. transfer each pure rule into the next block without changing its observable contract;
8. name what still does not exist: router architecture, API tests and persistent database.

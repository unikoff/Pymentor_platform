import{t as e}from"./jsx-runtime-CY_jTiqj.js";import{C as t,D as n,E as r,I as i,L as a,M as o,N as s,O as c,P as l,S as u,T as d,_ as f,b as p,k as m,l as h,n as g,o as _,t as v}from"./shared-BLp3PbbW.js";import{t as y}from"./file-text-z34ItJdM.js";import{n as b}from"./sparkles-DROpfoeS.js";import{t as x}from"./CodeEditor-DqHMt3P8.js";var S=e();function C({module:e}){return(0,S.jsxs)(s,{children:[(0,S.jsx)(o,{variant:`project`,chip:e??`Блок 11 · Валидация и CRUD Planner API`,title:`Разные схемы: вход и публичный ответ`,intro:`Настоящий POST уже создаёт и сохраняет задачу. Теперь мы сохраним этот путь и отдельно опишем данные на входе и в успешном ответе.`,tags:[{icon:(0,S.jsx)(b,{size:14}),label:`направление данных`},{icon:(0,S.jsx)(y,{size:14}),label:`request и response`}]}),(0,S.jsxs)(l,{number:`00`,title:`Мы уже проверяем вход. Теперь нужно договориться об ответе`,children:[(0,S.jsx)(c,{children:`POST уже проверяет данные клиента, создаёт задачу и возвращает результат. Разберём, какие поля принадлежат клиенту, а какие появляются после работы Planner.`}),(0,S.jsx)(m,{variant:`connected`,items:[{title:`Точка старта`,description:`POST принимает проверенный TaskCreate. Существующий PlannerService создаёт Task и сохраняет её в общем JsonStorage.`},{title:`Новый вопрос`,description:`Как описать ответ клиенту, не смешивая его с входным body и полным внутренним объектом?`},{title:`Результат`,description:`Мы добавим TaskRead и подключим response_model к действующим GET и POST. Сервис, хранилище и CLI останутся прежними.`}]}),(0,S.jsx)(`p`,{children:`Мы уже очистили title и ограничили title и priority на входе настоящего POST. Теперь сохраняем эти правила без изменений и добавляем отдельный договор успешного ответа. Создание и назначение id по-прежнему выполняет существующий PlannerService, а JsonStorage остаётся источником постоянных данных.`}),(0,S.jsx)(x,{caption:`request body`,code:`{
  "title": "Разобрать response_model",
  "priority": 4
}`}),(0,S.jsx)(`p`,{children:`После создания сервер возвращает уже публичное представление существующего ресурса:`}),(0,S.jsx)(x,{caption:`успешный response`,code:`{
  "id": 7,
  "title": "Разобрать response_model",
  "priority": 4,
  "is_done": false
}`}),(0,S.jsx)(`p`,{children:`На входе было два поля. На выходе стало четыре. Внутренняя доменная Task при этом содержит поле tags, которого нет в публичном HTTP-ответе.`}),(0,S.jsx)(`p`,{children:`Request и response связаны одной операцией, но описывают разные стороны обмена. Если поручить одной схеме обе роли, станет неясно, какими полями управляет клиент, а какие принадлежат уже созданной задаче.`})]}),(0,S.jsxs)(l,{number:`01`,title:`Одна задача существует в нескольких представлениях`,children:[(0,S.jsx)(c,{children:`Слово «задача» скрывает несколько разных договоров. На каждой границе приложения нужен свой набор данных и своя ответственность.`}),(0,S.jsx)(`p`,{children:`Клиент сообщает только то, чем управляет при создании. После проверки приложение работает с доменной Task. JsonStorage сохраняет полный формат проекта. Наружу API публикует только согласованную форму.`}),(0,S.jsx)(m,{items:[{title:`TaskCreate`,description:`HTTP-вход создания: title и priority. Отвечает на вопрос, что клиент может прислать.`},{title:`Task`,description:`Доменная модель Planner: id, title, priority, is_done и tags. С ней работает прикладная логика.`},{title:`JsonStorage`,description:`Постоянное хранение полной доменной записи. Старый CLI продолжает читать тот же формат.`},{title:`TaskRead`,description:`Публичный HTTP-ответ: id, title, priority и is_done. Отвечает на вопрос, что API обещает показать клиенту.`}]}),(0,S.jsx)(`p`,{children:`Проследим обе стороны обмена и место, где задача остаётся полной внутри Planner.`}),(0,S.jsx)(v,{caption:`Одна операция разделяет вход, внутреннюю Task и публичный ответ`,children:(0,S.jsxs)(_,{label:`Путь данных Planner API`,children:[(0,S.jsx)(h,{title:`HTTP request`,shape:`process`,children:(0,S.jsx)(`p`,{children:`title, priority`})}),(0,S.jsx)(g,{label:`проверка`}),(0,S.jsx)(h,{title:`TaskCreate`,children:(0,S.jsx)(`p`,{children:`Входная схема`})}),(0,S.jsx)(g,{label:`разрешённые данные`}),(0,S.jsx)(h,{title:`PlannerService`,children:(0,S.jsx)(`p`,{children:`Создаёт задачу и назначает id`})}),(0,S.jsx)(g,{label:`доменное состояние`}),(0,S.jsx)(h,{title:`Task + JsonStorage`,shape:`database`,children:(0,S.jsx)(`p`,{children:`Полная запись, включая tags`})}),(0,S.jsx)(g,{label:`публичные поля`}),(0,S.jsx)(h,{title:`TaskRead → HTTP response`,shape:`process`,children:(0,S.jsx)(`p`,{children:`id, title, priority, is_done`})})]})}),(0,S.jsx)(`p`,{children:`Это не четыре случайные копии одной структуры. Каждая форма существует на своей границе. Если смешать роли, изменение HTTP-контракта начнёт неожиданно менять доменную модель или формат файла.`}),(0,S.jsx)(r,{tone:`info`,children:`Поле tags сохраняется внутри Task и JSON. Добавление API не должно незаметно удалить его из существующего Planner.`})]}),(0,S.jsxs)(l,{number:`02`,title:`TaskCreate остаётся схемой входа`,children:[(0,S.jsx)(c,{children:`В этом занятии мы не проектируем TaskCreate заново. Мы сохраняем все правила прошлого занятия и уточняем её ответственность.`}),(0,S.jsx)(`p`,{children:`TaskCreate описывает данные, которыми клиент управляет в операции создания. В текущем договоре это title и priority.`}),(0,S.jsx)(x,{caption:`направление TaskCreate`,code:`HTTP request body
  title
  priority
      ↓
TaskCreate
      ↓
PlannerService`}),(0,S.jsx)(`p`,{children:`В TaskCreate нет id, is_done и tags. Отсутствие этих полей не означает, что Planner их потерял: они просто не принадлежат входному договору создания.`}),(0,S.jsx)(`p`,{children:`Даже если клиент передаст дополнительный id, это не делает его серверным идентификатором:`}),(0,S.jsx)(x,{caption:`лишнее серверное поле во входе`,code:`{
  "title": "Изучить схемы",
  "priority": 4,
  "id": 999
}`}),(0,S.jsx)(`p`,{children:`Мы не вводим здесь отдельную политику запрета всех extra-полей. Без специальной настройки Pydantic дополнительный ключ не обязан давать 422. Главная гарантия другая: клиентский id не управляет настоящим id созданной Task.`}),(0,S.jsx)(p,{question:`Какая обязанность действительно принадлежит TaskCreate?`,options:[`Проверить HTTP-вход title и priority`,`Выбрать следующий id`,`Записать data/tasks.json`],correctIndex:0,explanation:`TaskCreate работает на входной HTTP-границе. Id назначает существующий сценарий создания, а сохранением занимается storage.`})]}),(0,S.jsxs)(l,{number:`03`,title:`Зачем появляется TaskRead`,children:[(0,S.jsx)(c,{children:`После успешного действия сервер уже располагает полноценной задачей. Теперь нужно явно описать стабильную форму, которую API обещает вернуть клиенту.`}),(0,S.jsx)(`p`,{children:`До этого маршрут мог вручную собрать правильный словарь из четырёх полей. Но одной такой реализации недостаточно, чтобы FastAPI знал обещанную модель ответа.`}),(0,S.jsx)(x,{caption:`явная публичная проекция уже может быть правильной`,code:`return {
    "id": task.id,
    "title": task.title,
    "priority": task.priority,
    "is_done": task.is_done,
}`}),(0,S.jsx)(`p`,{children:`TaskRead отвечает на другой вопрос, чем TaskCreate: как выглядит одна задача, когда API отдаёт её клиенту. В публичной форме есть id, title, priority и is_done.`}),(0,S.jsx)(`p`,{children:`В маршрутах этого проекта уже есть явная проекция: handler берёт четыре значения у Task и возвращает их словарём. Эта проекция выбирает поля, а TaskRead закрепляет их имена и типы как договор FastAPI. Одно дополняет другое: список выбранных полей не нужно переносить в сервис или менять внутреннюю модель.`}),(0,S.jsx)(x,{caption:`два направления HTTP-схем`,code:`TaskCreate
request → server

TaskRead
server → response`}),(0,S.jsx)(`p`,{children:`Id присутствует в TaskRead, потому что к моменту ответа ресурс уже существует и клиенту нужен идентификатор для следующих обращений. Is_done тоже входит в публичное состояние, даже если при создании клиент его не выбирал.`}),(0,S.jsx)(`p`,{children:`Tags отсутствует, потому что публичный договор курса содержит четыре поля. Это внешний срез данных, а не новая версия доменной Task.`}),(0,S.jsx)(x,{caption:`внутренняя и публичная формы`,code:`Task:
id, title, priority, is_done, tags

TaskRead:
id, title, priority, is_done`}),(0,S.jsx)(`p`,{children:`Универсальная схема с optional id и default для is_done кажется короче, но скрывает направление данных: POST начинает выглядеть так, будто клиент может прислать серверные поля.`}),(0,S.jsx)(x,{caption:`слишком универсальная схема`,code:`class TaskSchema(BaseModel):
    id: int | None = None
    title: str
    priority: int
    is_done: bool = False`}),(0,S.jsx)(r,{tone:`info`,children:`Схемы для изменения появятся вместе с соответствующей операцией. Здесь мы разделяем договоры уже существующих создания и чтения.`})]}),(0,S.jsxs)(l,{number:`04`,title:`TaskRead не заменяет доменную Task`,children:[(0,S.jsx)(c,{children:`Pydantic-схема ответа относится к HTTP. Она не должна вытеснить модель, которой уже пользуются service, CLI и JsonStorage.`}),(0,S.jsxs)(a,{children:[(0,S.jsx)(i,{badge:`домен`,title:`Task`,children:`Предметная сущность Planner. Существовала до FastAPI и остаётся частью ядра приложения.`}),(0,S.jsx)(i,{badge:`HTTP`,badgeTone:`str`,title:`TaskRead`,children:`Публичная форма response. Нужна FastAPI на внешней границе, а не сервису и storage.`})]}),(0,S.jsx)(`p`,{children:`Если сделать PlannerService зависимым от TaskRead, прикладной слой начнёт зависеть от формы конкретного интерфейса. Тогда изменение API сможет заставить нас менять сервис даже при неизменных предметных правилах.`}),(0,S.jsx)(x,{caption:`нужное направление зависимостей`,code:`HTTP request
    ↓
HTTP schema
    ↓
PlannerService
    ↓
domain Task
    ↓
JsonStorage

и обратно:

domain Task
    ↓
public projection
    ↓
HTTP response schema
    ↓
HTTP response`}),(0,S.jsx)(`p`,{children:`Это похоже на каталог магазина. Полная складская запись соответствует Task, а карточка покупателя соответствует TaskRead: она показывает id, name и price, но не supplier_code и закупочную цену. Граница сравнения: каталог объясняет разницу внутренних и публичных полей; response_model проверяет и формирует JSON, но не управляет хранилищем Planner.`}),(0,S.jsx)(d,{question:`Какой вариант сохраняет текущую архитектуру Planner и не смешивает HTTP-схему с доменной моделью?`,left:{title:`TaskRead становится моделью ядра`,code:`PlannerService → TaskRead → JsonStorage`,note:`HTTP-схема начинает определять внутреннюю модель и формат сохранения.`},right:{title:`Task остаётся в ядре`,code:`PlannerService → Task → JsonStorage
Task → projection → TaskRead → HTTP`,note:`HTTP-схема используется только на внешней границе ответа.`},preferred:`right`,explanation:`TaskRead уточняет внешний договор. Доменная Task, PlannerService и JsonStorage продолжают выполнять прежние обязанности.`})]}),(0,S.jsxs)(l,{number:`05`,title:`response_model: явный договор ответа`,children:[(0,S.jsx)(c,{children:`FastAPI позволяет отдельно объявить ожидаемую форму успешного ответа. Это центральная новая механика занятия.`}),(0,S.jsx)(`p`,{children:`Сначала разберём её на независимом примере, чтобы не выдавать готовую реализацию Planner.`}),(0,S.jsx)(x,{caption:`независимый пример response_model`,code:`from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class ArticleRead(BaseModel):
    id: int
    title: str


@app.get("/article", response_model=ArticleRead)
def get_article():
    return {
        "id": 3,
        "title": "HTTP response",
        "internal_note": "draft",
    }`}),(0,S.jsx)(`p`,{children:`Функция возвращает id, title и internal_note, но публичная модель ответа содержит только id и title. Клиент получает форму, объявленную как ArticleRead.`}),(0,S.jsx)(x,{caption:`публичный результат`,code:`{
  "id": 3,
  "title": "HTTP response"
}`}),(0,S.jsx)(m,{items:[{title:`Проверка`,description:`FastAPI ожидает, что успешный результат можно представить в форме объявленной модели ответа.`},{title:`OpenAPI`,description:`Схема response появляется в документации и показывает клиенту ожидаемую форму JSON.`},{title:`Публичная граница`,description:`Поля вне response model не должны случайно становиться частью внешнего ответа.`}]}),(0,S.jsx)(`p`,{children:`Тип параметра функции описывает request, а response_model в декораторе описывает результат path operation. Это два независимых направления одного обмена.`}),(0,S.jsx)(x,{caption:`request и response находятся по разные стороны handler`,code:`request body
    ↓
TaskCreate
    ↓
handler
    ↓
TaskRead / response_model
    ↓
response body`}),(0,S.jsx)(`p`,{children:`Для списка применяется тот же принцип, только model описывает каждый элемент коллекции:`}),(0,S.jsx)(x,{caption:`response model коллекции`,code:`@app.get("/articles", response_model=list[ArticleRead])
def list_articles():
    ...`}),(0,S.jsx)(`p`,{children:`FastAPI читает response_model в декораторе и применяет схему к успешному результату handler при подготовке ответа. Параметр TaskCreate описывает вход POST, а response_model описывает его выход. Эти модели могут различаться, потому что находятся по разные стороны одной функции. У GET по id тела запроса может не быть, но публичная форма ответа всё равно действует.`}),(0,S.jsx)(r,{tone:`info`,children:`Response model работает на границе ответа. Он не изменяет storage и не является операцией сохранения.`})]}),(0,S.jsxs)(l,{number:`06`,title:`Что происходит с tags`,children:[(0,S.jsx)(c,{children:`Поле может оставаться внутри приложения и при этом не входить в публичный HTTP response. Для Planner хороший пример: существующее tags.`}),(0,S.jsx)(x,{caption:`доменная запись`,code:`task_data = {
    "id": 12,
    "title": "FastAPI",
    "priority": 4,
    "is_done": False,
    "tags": ["backend", "api"],
}`}),(0,S.jsx)(`p`,{children:`Публичный договор TaskRead содержит id, title, priority и is_done. Tags в него не входит, поэтому клиент видит только согласованные четыре поля.`}),(0,S.jsx)(x,{caption:`публичный response`,code:`{
  "id": 12,
  "title": "FastAPI",
  "priority": 4,
  "is_done": false
}`}),(0,S.jsxs)(`p`,{children:[(0,S.jsx)(`strong`,{children:`Главное:`}),` `,`с Task и JSON ничего не произошло. Поле перестало быть видимым в конкретном HTTP response, но не исчезло из приложения.`]}),(0,S.jsx)(x,{caption:`не путайте фильтрацию ответа с изменением данных`,code:`не публиковать поле ≠ удалить поле из объекта
не публиковать поле ≠ изменить JsonStorage
не публиковать поле ≠ вызвать save()
не публиковать поле ≠ изменить формат старого Planner`}),(0,S.jsx)(`p`,{children:`В текущем проекте HTTP-слой уже собирает явную четырёхпольную проекцию Task. TaskRead добавляет проверяемую границу поверх этой проекции. Не нужно возвращать все внутренние поля только ради демонстрации фильтрации.`}),(0,S.jsx)(`p`,{children:`Перед следующим разбором смоделируем публичную проекцию обычным Python-кодом. Это не реализация FastAPI, а простой способ увидеть, какие поля остаются наружу.`}),(0,S.jsx)(f,{code:`task = {
    "id": 4,
    "title": "Schemas",
    "priority": 2,
    "is_done": True,
    "tags": ["python"],
}
public = {key: task[key] for key in ("id", "title", "priority", "is_done")}
print(public)`,output:`{'id': 4, 'title': 'Schemas', 'priority': 2, 'is_done': True}`,hint:`Сначала отметим ключи в кортеже, затем сопоставим их со значениями task.`}),(0,S.jsx)(r,{tone:`info`,children:`После HTTP-проверки нужно отдельно убедиться, что tags сохранился в доменной записи и JSON. Красивый response этого не доказывает.`})]}),(0,S.jsxs)(l,{number:`07`,title:`Неправильный response: ошибка сервера, а не 422 клиента`,children:[(0,S.jsx)(c,{children:`В прошлом занятии Pydantic останавливал неправильный request. Теперь та же библиотека помогает заметить противоположную проблему: сервер сам сформировал ответ не по договору.`}),(0,S.jsx)(x,{caption:`обещанная форма`,code:`class ArticleRead(BaseModel):
    id: int
    title: str`}),(0,S.jsx)(x,{caption:`handler нарушает собственный response contract`,code:`@app.get("/article", response_model=ArticleRead)
def get_article():
    return {
        "title": "HTTP",
    }`}),(0,S.jsx)(`p`,{children:`В response отсутствует обязательный id. Клиент ничего не сделал неправильно: он просто вызвал GET. Ошибка появилась в серверном коде, который обещал одну форму результата, а сформировал другую.`}),(0,S.jsx)(x,{caption:`два разных направления ошибки`,code:`неверный request
→ вход не прошёл TaskCreate
→ проблема клиента

неверный result handler
→ не соответствует TaskRead
→ проблема сервера`}),(0,S.jsx)(t,{code:`class ProfileRead(BaseModel):
    id: int
    username: str


@app.get("/profile", response_model=ProfileRead)
def get_profile():
    return {"username": "nikita"}`,question:`Почему этот GET нарушает договор ответа?`,options:[`Клиент забыл передать id в GET body`,`Сервер вернул результат без обязательного id`,`Pydantic должен автоматически придумать id`],correctIndex:1,explanation:`Request здесь не обязан содержать server-owned id. Его должен сформировать серверный код до проверки публичного ответа.`}),(0,S.jsx)(`p`,{children:`Важно также не приписывать response validation роль транзакции. Если service уже сохранил данные, а потом handler сформировал неправильный response, сама проверка ответа не откатывает сделанное сохранение.`}),(0,S.jsx)(x,{caption:`response validation не является rollback`,code:`service.add(...)
    ↓
JsonStorage.save(...)
    ↓
handler формирует неправильный response
    ↓
response validation error`}),(0,S.jsx)(r,{tone:`warn`,children:`422 из прошлого занятия не означает «любая Pydantic-ошибка всегда 422». Направление данных имеет значение: ошибка request относится к клиентской границе, а ошибка server response возникает в реализации сервера.`})]}),(0,S.jsxs)(l,{number:`08`,title:`Публичный ответ не является сохранением`,children:[(0,S.jsx)(c,{children:`Ответ сообщает клиенту результат операции. Запись на диск происходит в прежнем пути через PlannerService и JsonStorage.`}),(0,S.jsx)(`p`,{children:`Сравним HTTP-ответ с накладной. Она показывает покупателю согласованные сведения о посылке, но сама не отправляет её и не кладёт на склад. Так же TaskRead задаёт публичную форму уже существующей Task: схема ответа не создаёт задачу и не сохраняет её.`}),(0,S.jsx)(x,{caption:`два связанных, но разных результата`,code:`создание:
POST → PlannerService → Task → JsonStorage

ответ:
Task → TaskRead → HTTP JSON`}),(0,S.jsx)(u,{statement:(0,S.jsx)(`span`,{children:`Добавление response_model само по себе удаляет tags из JsonStorage.`}),isTrue:!1,explanation:`response_model ограничивает HTTP-представление. PlannerService и JsonStorage продолжают сохранять полную доменную Task, включая tags.`}),(0,S.jsx)(`p`,{children:`Поэтому красивого JSON недостаточно, чтобы доказать сохранение. После POST мы отдельно найдём ту же задачу по фактическому id в JSON и прежнем CLI. Это наблюдение понадобится в следующем шаге, где мы проверим серверный id и повторное чтение сохранённой записи.`})]}),(0,S.jsxs)(l,{number:`09`,title:`schemas.py: отдельное место для HTTP-схем`,children:[(0,S.jsx)(c,{children:`Когда HTTP-моделей становится несколько, их полезно вынести из точки сборки приложения. При этом мы продолжаем существующий Planner, а не создаём новый проект.`}),(0,S.jsx)(x,{caption:`структура существующего проекта`,code:`app/
├── main.py
├── api.py
├── cli.py
├── models.py
├── services.py
├── storage.py
└── schemas.py`}),(0,S.jsx)(m,{items:[{title:`models.py`,description:`Содержит доменную Task. Она существовала до API и продолжает описывать предметную сущность Planner.`},{title:`schemas.py`,description:`Содержит HTTP-схемы текущего этапа: существующую TaskCreate со всеми её правилами и новую TaskRead.`},{title:`services.py`,description:`Содержит операции PlannerService. Схемы не забирают на себя создание, поиск, id или сохранение.`},{title:`storage.py`,description:`Отвечает за постоянный JSON. Pydantic-схемы не начинают напрямую открывать файл.`},{title:`api.py`,description:`Остаётся HTTP-границей: импортирует схемы, принимает запросы и вызывает уже существующий сервис.`}]}),(0,S.jsx)(x,{caption:`направление остаётся простым`,code:`api.py
 ├─ использует schemas.py
 └─ вызывает PlannerService

PlannerService
 └─ работает с Task и storage`}),(0,S.jsx)(`p`,{children:`При переносе TaskCreate нельзя потерять нормализацию, ограничения или другой уже согласованный механизм предыдущего занятия. Мы переносим существующую схему целиком, а не создаём похожую упрощённую копию.`}),(0,S.jsx)(`p`,{children:`Схемы этого занятия описывают существующие операции создания и чтения. Сервис и хранилище сохраняют свои прежние обязанности.`}),(0,S.jsx)(r,{tone:`info`,children:`Services не начинает импортировать FastAPI только потому, что API использует Pydantic-схемы. HTTP остаётся снаружи прикладного ядра.`})]}),(0,S.jsxs)(l,{number:`10`,title:`Как TaskRead подключается к уже работающему API`,children:[(0,S.jsx)(c,{children:`К началу занятия list, item и настоящий POST уже работают через PlannerService и общий JSON. Мы не меняем их смысл, а делаем форму успешного response явной.`}),(0,S.jsx)(`p`,{children:`GET /tasks возвращает коллекцию публичных задач. Поэтому response model описывает список объектов одного типа. На независимом примере принцип выглядит так:`}),(0,S.jsx)(x,{caption:`response model коллекции`,code:`@app.get("/articles", response_model=list[ArticleRead])
def list_articles():
    ...`}),(0,S.jsx)(`p`,{children:`GET /tasks/{task_id} возвращает одну публичную задачу. Невалидный path и отсутствующий id продолжают работать по прежнему договору: добавление response_model не меняет маршрут и не отменяет 404.`}),(0,S.jsx)(`p`,{children:`Запись list[TaskRead] означает, что каждый элемент успешного ответа проверяется по одной и той же форме. Пустой список тоже соответствует этому договору: в нём нет элементов, которые могли бы нарушить схему. Для item маршрут возвращает один TaskRead. Отсутствующий ресурс остаётся отдельным исходом 404, а не пустой TaskRead.`}),(0,S.jsx)(`p`,{children:`Главный пример занятия: POST. Вход и выход одной операции описываются разными схемами:`}),(0,S.jsx)(x,{caption:`одна операция, два направления`,code:`POST request
TaskCreate

POST successful response
TaskRead`}),(0,S.jsx)(x,{caption:`полный путь настоящего создания`,code:`POST
    ↓
TaskCreate
    ↓
PlannerService.add_task
    ↓
Task
    ↓
JsonStorage
    ↓
public projection
    ↓
TaskRead
    ↓
201 response`}),(0,S.jsx)(`p`,{children:`Успешный статус остаётся 201 Created. Добавление TaskRead не должно вернуть POST к 200 и не должно превращать настоящее создание обратно в отражение входного body.`}),(0,S.jsx)(r,{tone:`info`,children:`TaskRead находится ближе к внешней границе. Она не заменяет PlannerService, Task или JsonStorage в середине пути.`})]}),(0,S.jsxs)(l,{number:`11`,title:`OpenAPI показывает направление моделей`,children:[(0,S.jsx)(c,{children:`После разделения схем направление данных становится видно прямо в /docs: request и successful response одной операции больше не выглядят как одна неопределённая «задача».`}),(0,S.jsx)(x,{caption:`POST в OpenAPI`,code:`Request body
└── TaskCreate

Successful response: 201
└── TaskRead`}),(0,S.jsx)(`p`,{children:`Для чтения документация должна показывать публичную форму результата:`}),(0,S.jsx)(x,{caption:`GET в OpenAPI`,code:`GET /tasks
→ array of TaskRead

GET /tasks/{task_id}
→ TaskRead`}),(0,S.jsx)(`p`,{children:`Query-параметры списка при этом никуда не исчезают. Схема ответа не заменяет фильтр, сортировку или limit. Она описывает только форму возвращаемых элементов.`}),(0,S.jsx)(`p`,{children:`В карточке POST /docs показывает две независимые части: request body со схемой TaskCreate и успешный ответ со схемой TaskRead и статусом 201. У GET списка документация указывает массив, у GET по id один объект. Это одна схема ответа, применённая к разным уже существующим операциям.`}),(0,S.jsx)(`p`,{children:`OpenAPI показывает только реально зарегистрированные операции и их текущие договоры.`}),(0,S.jsx)(x,{caption:`документация и поведение доказывают разное`,code:`OpenAPI
→ показывает обещанный контракт

реальный POST / GET
→ показывает фактический ответ

JSON / CLI
→ показывают, что внутренняя запись и прежний интерфейс не изменились`}),(0,S.jsx)(r,{tone:`info`,children:`Правильная схема в Swagger ещё не доказывает постоянное сохранение. После /docs всё равно нужны реальные запросы и наблюдение состояния.`})]}),(0,S.jsxs)(l,{number:`12`,title:`Проверим границы на конкретных сценариях`,children:[(0,S.jsx)(c,{children:`Перед практикой разберём, какая часть системы отвечает за типичные ситуации. Это помогает не смешивать вход, доменную операцию, response и сохранение.`}),(0,S.jsx)(m,{items:[{title:`Вход`,description:`Нет обязательного priority: TaskCreate останавливает запрос до вызова endpoint.`},{title:`Лишний id`,description:`Дополнительный ключ не обязан давать 422 и не заменяет id, который назначает Planner.`},{title:`Внутреннее поле`,description:`tags остаётся в Task и JSON, но не входит в четыре поля TaskRead.`},{title:`Ошибка ответа`,description:`Если handler не вернул обязательный id, нарушен серверный договор ответа, а не вход клиента.`},{title:`Сохранение`,description:`response_model формирует публичную форму ответа; запись полной Task выполняет прежний путь PlannerService и JsonStorage.`},{title:`Документация`,description:`OpenAPI описывает обещанный ответ, но само по себе не подтверждает сохранение записи.`}]})]}),(0,S.jsxs)(l,{number:`13`,title:`Что мы будем делать в практике`,children:[(0,S.jsx)(c,{children:`Практика не переписывает Planner, CRUD или JsonStorage. Мы отделяем HTTP-схемы и подключаем явный response contract к уже работающему приложению.`}),(0,S.jsx)(m,{variant:`connected`,items:[{title:`Схемы`,description:`Перенесём прежнюю TaskCreate без потери правил и добавим TaskRead в app/schemas.py.`},{title:`Маршруты`,description:`Подключим response_model к списку, item и настоящему POST, сохранив его 201.`},{title:`OpenAPI и ответы`,description:`Проверим объявленные схемы, прежние query-параметры и 404 для отсутствующего item.`},{title:`Состояние Planner`,description:`Сверим созданную Task по фактическому id и убедимся, что tags остался в JSON и CLI.`}]}),(0,S.jsx)(`p`,{children:`К завершению практики должны быть одновременно верны две цепочки:`}),(0,S.jsx)(x,{caption:`request`,code:`JSON → TaskCreate → PlannerService`}),(0,S.jsx)(x,{caption:`response`,code:`Task → public projection → TaskRead → HTTP JSON body`}),(0,S.jsx)(`p`,{children:`Для проверки используем один успешный POST и сопоставим его публичный ответ с той же записью в JSON и CLI. CLI и JsonStorage должны сохранить прежнюю форму данных.`})]}),(0,S.jsxs)(l,{number:`14`,title:`Главное из занятия`,children:[(0,S.jsx)(c,{children:`Мы не добавляли новую бизнес-логику. Мы сделали HTTP-границу Planner точнее и явно разделили данные по направлению.`}),(0,S.jsx)(x,{caption:`четыре разных вопроса`,code:`TaskCreate:
что клиент может отправить?

TaskRead:
что сервер обещает вернуть?

Task:
с каким объектом работает Planner?

JsonStorage:
что сохраняется между запусками?`}),(0,S.jsx)(n,{points:[(0,S.jsx)(S.Fragment,{children:`TaskCreate и TaskRead относятся к разным направлениям одного HTTP-обмена.`}),(0,S.jsx)(S.Fragment,{children:`TaskRead не заменяет доменную Task и не меняет формат JsonStorage.`}),(0,S.jsx)(S.Fragment,{children:`response_model проверяет, документирует и ограничивает внешний результат.`}),(0,S.jsx)(S.Fragment,{children:`tags может оставаться внутри Task и JSON, не входя в публичный response.`}),(0,S.jsx)(S.Fragment,{children:`Сохранение полной Task и формирование публичного ответа остаются разными этапами.`}),(0,S.jsx)(S.Fragment,{children:`Ошибка request и ошибка server response находятся по разные стороны handler.`})]}),(0,S.jsx)(x,{caption:`граница Planner после занятия`,code:`HTTP request
    ↓
TaskCreate
    ↓
PlannerService
    ↓
Task
    ↓
JsonStorage
    ↓
public projection
    ↓
TaskRead
    ↓
HTTP JSON response`}),(0,S.jsx)(`p`,{children:`Дальше мы разберём, кто назначает серверный id и какие гарантии даёт выбранное хранение. Схемы request и response, разделённые здесь, заново проектировать не потребуется.`})]})]})}export{C as Lesson58};
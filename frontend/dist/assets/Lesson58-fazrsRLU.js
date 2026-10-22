import{t as e}from"./jsx-runtime-lw2jiZar.js";import{C as t,D as n,E as r,H as i,I as a,L as o,M as s,N as c,O as l,P as u,S as d,T as f,_ as p,b as m,k as h,v as g}from"./shared-DP9JVsk0.js";import{A as _}from"./index-DLaUeCZy.js";import{t as v}from"./CodeEditor-BZlrvoTL.js";var y=`/platform/assets/lesson-58-http-schema-boundaries-kxB20tLk.svg`,b=`/platform/assets/lesson-58-http-schema-boundaries-mobile-DzA1YoL1.svg`,x=e();function S({module:e}){return(0,x.jsxs)(c,{children:[(0,x.jsx)(s,{variant:`project`,chip:e??`Блок 11 · Валидация и CRUD Planner API`,title:`58. Разные схемы: вход и публичный ответ`,intro:`TaskCreate уже защищает вход настоящего POST. Теперь отделим HTTP-вход от доменной Task, JSON-хранилища и публичного ответа, а затем сделаем форму response явной через TaskRead и response_model.`,tags:[{icon:(0,x.jsx)(i,{size:14}),label:`направление данных`},{icon:(0,x.jsx)(_,{size:14}),label:`request и response`}]}),(0,x.jsxs)(u,{number:`00`,title:`Мы уже проверяем вход. Теперь нужно договориться об ответе`,children:[(0,x.jsx)(h,{variant:`connected`,items:[{title:`Прежняя опора`,description:`POST принимает проверенный TaskCreate. Существующий PlannerService создаёт Task и сохраняет её в общем JsonStorage.`},{title:`Новый вопрос`,description:`Как описать ответ клиенту, не смешивая его с входным body и полным внутренним объектом?`},{title:`Результат`,description:`Добавим TaskRead и подключим response_model к действующим GET и POST. Сервис, хранилище и CLI останутся прежними.`}]}),(0,x.jsx)(l,{children:`Создание задачи не заканчивается проверкой входа. Сначала сервер принимает только разрешённые данные, затем создаёт ресурс и возвращает клиенту результат. Посмотрим, почему у этих двух направлений разные формы.`}),(0,x.jsx)(`p`,{children:`В предыдущем занятии TaskCreate стала проверяемым входом настоящего POST. При успехе существующий PlannerService создаёт Task, назначает серверные поля и сохраняет её через JsonStorage. Клиенту возвращается не исходный body, а результат операции.`}),(0,x.jsx)(v,{caption:`request body`,code:`{
  "title": "Разобрать response_model",
  "priority": 4
}`}),(0,x.jsx)(`p`,{children:`После создания сервер возвращает уже публичное представление существующего ресурса:`}),(0,x.jsx)(v,{caption:`успешный response`,code:`{
  "id": 7,
  "title": "Разобрать response_model",
  "priority": 4,
  "is_done": false
}`}),(0,x.jsx)(`p`,{children:`На входе было два поля. На выходе стало четыре. Внутренняя доменная Task при этом содержит поле tags, которого нет в публичном HTTP-ответе.`}),(0,x.jsx)(`p`,{children:`Request и response связаны одной операцией, но описывают разные стороны обмена. Если поручить одной схеме обе роли, станет неясно, какими полями управляет клиент, а какие принадлежат уже созданной задаче.`})]}),(0,x.jsxs)(u,{number:`01`,title:`Одна задача существует в нескольких представлениях`,children:[(0,x.jsx)(l,{children:`Слово «задача» скрывает несколько разных договоров. На каждой границе приложения нужен свой набор данных и своя ответственность.`}),(0,x.jsx)(`p`,{children:`Клиент сообщает только то, чем управляет при создании. После проверки приложение работает с доменной Task. JsonStorage сохраняет полный формат проекта. Наружу API публикует только согласованную форму.`}),(0,x.jsx)(h,{items:[{title:`TaskCreate`,description:`HTTP-вход создания: title и priority. Отвечает на вопрос, что клиент может прислать.`},{title:`Task`,description:`Доменная модель Planner: id, title, priority, is_done и tags. С ней работает прикладная логика.`},{title:`JsonStorage`,description:`Постоянное хранение полной доменной записи. Старый CLI продолжает читать тот же формат.`},{title:`TaskRead`,description:`Публичный HTTP-ответ: id, title, priority и is_done. Отвечает на вопрос, что API обещает показать клиенту.`}]}),(0,x.jsx)(`p`,{children:`Проследим обе стороны обмена и место, где задача остаётся полной внутри Planner.`}),(0,x.jsxs)(`figure`,{className:`lesson-infographic lesson-infographic--lesson58`,children:[(0,x.jsxs)(`picture`,{children:[(0,x.jsx)(`source`,{media:`(max-width: 640px)`,srcSet:b}),(0,x.jsx)(`img`,{src:y,alt:`Клиент отправляет request через TaskCreate и PlannerService. Полная Task сохраняется в JsonStorage, а TaskRead задаёт четыре поля ответа 201 тому же клиенту.`,width:1672,height:836,loading:`lazy`,decoding:`async`})]}),(0,x.jsx)(`figcaption`,{children:`Request использует TaskCreate, а response формируется из Task через TaskRead. JsonStorage сохраняет полную доменную запись с tags.`})]}),(0,x.jsx)(`p`,{children:`Это не четыре случайные копии одной структуры. Каждая форма существует на своей границе. Если смешать роли, изменение HTTP-контракта начнёт неожиданно менять доменную модель или формат файла.`}),(0,x.jsx)(r,{tone:`info`,children:`Поле tags сохраняется внутри Task и JSON. Добавление API не должно незаметно удалить его из существующего Planner.`})]}),(0,x.jsxs)(u,{number:`02`,title:`TaskCreate остаётся схемой входа`,children:[(0,x.jsx)(l,{children:`В этом занятии мы не проектируем TaskCreate заново. Мы сохраняем все правила прошлого занятия и уточняем её ответственность.`}),(0,x.jsx)(`p`,{children:`TaskCreate описывает данные, которыми клиент управляет в операции создания. В текущем договоре это title и priority.`}),(0,x.jsx)(v,{caption:`направление TaskCreate`,code:`HTTP request body
  title
  priority
      ↓
TaskCreate
      ↓
PlannerService`}),(0,x.jsx)(`p`,{children:`В TaskCreate нет id, is_done и tags. Отсутствие этих полей не означает, что Planner их потерял: они просто не принадлежат входному договору создания.`}),(0,x.jsx)(`p`,{children:`Даже если клиент передаст дополнительный id, это не делает его серверным идентификатором:`}),(0,x.jsx)(v,{caption:`лишнее серверное поле во входе`,code:`{
  "title": "Изучить схемы",
  "priority": 4,
  "id": 999
}`}),(0,x.jsx)(`p`,{children:`Мы не вводим здесь отдельную политику запрета всех extra-полей. Без специальной настройки Pydantic дополнительный ключ не обязан давать 422. Главная гарантия другая: клиентский id не управляет настоящим id созданной Task.`}),(0,x.jsx)(m,{question:`Какая обязанность действительно принадлежит TaskCreate?`,options:[`Проверить HTTP-вход title и priority`,`Выбрать следующий id`,`Записать data/tasks.json`],correctIndex:0,explanation:`TaskCreate работает на входной HTTP-границе. Id назначает существующий сценарий создания, а сохранением занимается storage.`})]}),(0,x.jsxs)(u,{number:`03`,title:`Зачем появляется TaskRead`,children:[(0,x.jsx)(l,{children:`После успешного действия сервер уже располагает полноценной задачей. Теперь нужно явно описать стабильную форму, которую API обещает вернуть клиенту.`}),(0,x.jsx)(`p`,{children:`До этого маршрут мог вручную собрать правильный словарь из четырёх полей. Но одной такой реализации недостаточно, чтобы FastAPI знал обещанную модель ответа.`}),(0,x.jsx)(v,{caption:`явная публичная проекция уже может быть правильной`,code:`return {
    "id": task.id,
    "title": task.title,
    "priority": task.priority,
    "is_done": task.is_done,
}`}),(0,x.jsx)(`p`,{children:`TaskRead отвечает на другой вопрос, чем TaskCreate: как выглядит одна задача, когда API отдаёт её клиенту. В публичной форме есть id, title, priority и is_done.`}),(0,x.jsx)(v,{caption:`два направления HTTP-схем`,code:`TaskCreate
request → server

TaskRead
server → response`}),(0,x.jsx)(`p`,{children:`Id присутствует в TaskRead, потому что к моменту ответа ресурс уже существует и клиенту нужен идентификатор для следующих обращений. Is_done тоже входит в публичное состояние, даже если при создании клиент его не выбирал.`}),(0,x.jsx)(`p`,{children:`Tags отсутствует, потому что публичный договор курса содержит четыре поля. Это внешний срез данных, а не новая версия доменной Task.`}),(0,x.jsx)(v,{caption:`внутренняя и публичная формы`,code:`Task:
id, title, priority, is_done, tags

TaskRead:
id, title, priority, is_done`}),(0,x.jsx)(`p`,{children:`Универсальная схема с optional id и default для is_done кажется короче, но скрывает направление данных: POST начинает выглядеть так, будто клиент может прислать серверные поля.`}),(0,x.jsx)(v,{caption:`слишком универсальная схема`,code:`class TaskSchema(BaseModel):
    id: int | None = None
    title: str
    priority: int
    is_done: bool = False`}),(0,x.jsx)(r,{tone:`info`,children:`Отдельная схема обновления появится тогда, когда в проекте появится реальная граница PUT/PATCH. В 58-м занятии TaskUpdate заранее не создаём.`})]}),(0,x.jsxs)(u,{number:`04`,title:`TaskRead не заменяет доменную Task`,children:[(0,x.jsx)(l,{children:`Pydantic-схема ответа относится к HTTP. Она не должна вытеснить модель, которой уже пользуются service, CLI и JsonStorage.`}),(0,x.jsxs)(o,{children:[(0,x.jsx)(a,{badge:`домен`,title:`Task`,children:`Предметная сущность Planner. Существовала до FastAPI и остаётся частью ядра приложения.`}),(0,x.jsx)(a,{badge:`HTTP`,badgeTone:`str`,title:`TaskRead`,children:`Публичная форма response. Нужна FastAPI на внешней границе, а не сервису и storage.`})]}),(0,x.jsx)(`p`,{children:`Если сделать PlannerService зависимым от TaskRead, прикладной слой начнёт зависеть от формы конкретного интерфейса. Тогда изменение API сможет заставить нас менять сервис даже при неизменных предметных правилах.`}),(0,x.jsx)(v,{caption:`нужное направление зависимостей`,code:`HTTP request
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
HTTP response`}),(0,x.jsx)(`p`,{children:`Это похоже на каталог магазина. Полная складская запись соответствует Task, а карточка покупателя соответствует TaskRead: она показывает id, name и price, но не supplier_code и закупочную цену. Граница сравнения: каталог объясняет разницу внутренних и публичных полей; response_model проверяет и формирует JSON, но не управляет хранилищем Planner.`}),(0,x.jsx)(f,{question:`Какой вариант сохраняет текущую архитектуру Planner и не смешивает HTTP-схему с доменной моделью?`,left:{title:`TaskRead становится моделью ядра`,code:`PlannerService → TaskRead → JsonStorage`,note:`HTTP-схема начинает определять внутреннюю модель и формат сохранения.`},right:{title:`Task остаётся в ядре`,code:`PlannerService → Task → JsonStorage
Task → projection → TaskRead → HTTP`,note:`HTTP-схема используется только на внешней границе ответа.`},preferred:`right`,explanation:`TaskRead уточняет внешний договор. Доменная Task, PlannerService и JsonStorage продолжают выполнять прежние обязанности.`})]}),(0,x.jsxs)(u,{number:`05`,title:`response_model: явный договор ответа`,children:[(0,x.jsx)(l,{children:`FastAPI позволяет отдельно объявить ожидаемую форму успешного ответа. Это центральная новая механика занятия.`}),(0,x.jsx)(`p`,{children:`Сначала разберём её на независимом примере, чтобы не выдавать готовую реализацию Planner.`}),(0,x.jsx)(v,{caption:`независимый пример response_model`,code:`from fastapi import FastAPI
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
    }`}),(0,x.jsx)(`p`,{children:`Функция возвращает id, title и internal_note, но публичная модель ответа содержит только id и title. Клиент получает форму, объявленную как ArticleRead.`}),(0,x.jsx)(v,{caption:`публичный результат`,code:`{
  "id": 3,
  "title": "HTTP response"
}`}),(0,x.jsx)(h,{items:[{title:`Проверка`,description:`FastAPI ожидает, что успешный результат можно представить в форме объявленной модели ответа.`},{title:`OpenAPI`,description:`Схема response появляется в документации и показывает клиенту ожидаемую форму JSON.`},{title:`Публичная граница`,description:`Поля вне response model не должны случайно становиться частью внешнего ответа.`}]}),(0,x.jsx)(`p`,{children:`Тип параметра функции описывает request, а response_model в декораторе описывает результат path operation. Это два независимых направления одного обмена.`}),(0,x.jsx)(v,{caption:`request и response находятся по разные стороны handler`,code:`request body
    ↓
TaskCreate
    ↓
handler
    ↓
TaskRead / response_model
    ↓
response body`}),(0,x.jsx)(`p`,{children:`Для списка применяется тот же принцип, только model описывает каждый элемент коллекции:`}),(0,x.jsx)(v,{caption:`response model коллекции`,code:`@app.get("/articles", response_model=list[ArticleRead])
def list_articles():
    ...`}),(0,x.jsx)(`p`,{children:`Ниже показана упрощённая модель на чистом Pydantic. Это не внутренний исходный код FastAPI, а наблюдение за тем же смыслом: результат проверяется схемой, после чего наружу формируется публичное представление.`}),(0,x.jsx)(g,{code:`result = {"id": 5, "title": "FastAPI", "internal_note": "do not publish"}
validated = ArticleRead.model_validate(result)
public = validated.model_dump()`,steps:[{line:0,note:`Handler подготовил Python-результат. В нём есть публичные поля и дополнительное внутреннее поле.`,vars:{result:`{id, title, internal_note}`}},{line:1,note:`ArticleRead проверяет обязательные id и title. Internal_note не становится полем модели ответа.`,vars:{validated:`ArticleRead(id=5, title='FastAPI')`}},{line:2,note:`Публичное представление содержит только поля объявленной модели.`,vars:{public:`{'id': 5, 'title': 'FastAPI'}`}}]}),(0,x.jsx)(r,{tone:`info`,children:`Response model работает на границе ответа. Он не изменяет storage и не является операцией сохранения.`})]}),(0,x.jsxs)(u,{number:`06`,title:`Что происходит с tags`,children:[(0,x.jsx)(l,{children:`Поле может оставаться внутри приложения и при этом не входить в публичный HTTP response. Для Planner хороший пример: существующее tags.`}),(0,x.jsx)(v,{caption:`доменная запись`,code:`task_data = {
    "id": 12,
    "title": "FastAPI",
    "priority": 4,
    "is_done": False,
    "tags": ["backend", "api"],
}`}),(0,x.jsx)(`p`,{children:`Публичный договор TaskRead содержит id, title, priority и is_done. Tags в него не входит, поэтому клиент видит только согласованные четыре поля.`}),(0,x.jsx)(v,{caption:`публичный response`,code:`{
  "id": 12,
  "title": "FastAPI",
  "priority": 4,
  "is_done": false
}`}),(0,x.jsxs)(`p`,{children:[(0,x.jsx)(`strong`,{children:`Главное:`}),` `,`с Task и JSON ничего не произошло. Поле перестало быть видимым в конкретном HTTP response, но не исчезло из приложения.`]}),(0,x.jsx)(v,{caption:`не путайте фильтрацию ответа с изменением данных`,code:`не публиковать поле ≠ удалить поле из объекта
не публиковать поле ≠ изменить JsonStorage
не публиковать поле ≠ вызвать save()
не публиковать поле ≠ изменить формат старого Planner`}),(0,x.jsx)(`p`,{children:`В текущем проекте HTTP-слой уже собирает явную четырёхпольную проекцию Task. TaskRead добавляет проверяемую границу поверх этой проекции. Не нужно возвращать все внутренние поля только ради демонстрации фильтрации.`}),(0,x.jsx)(`p`,{children:`Перед следующим разбором смоделируем публичную проекцию обычным Python-кодом. Это не реализация FastAPI, а простой способ увидеть, какие поля остаются наружу.`}),(0,x.jsx)(p,{code:`task = {
    "id": 4,
    "title": "Schemas",
    "priority": 2,
    "is_done": True,
    "tags": ["python"],
}
public = {key: task[key] for key in ("id", "title", "priority", "is_done")}
print(public)`,output:`{'id': 4, 'title': 'Schemas', 'priority': 2, 'is_done': True}`,hint:`Сначала отметим ключи в кортеже, затем сопоставим их со значениями task.`}),(0,x.jsx)(r,{tone:`info`,children:`После HTTP-проверки нужно отдельно убедиться, что tags сохранился в доменной записи и JSON. Красивый response этого не доказывает.`})]}),(0,x.jsxs)(u,{number:`07`,title:`Неправильный response: ошибка сервера, а не 422 клиента`,children:[(0,x.jsx)(l,{children:`В прошлом занятии Pydantic останавливал неправильный request. Теперь та же библиотека помогает заметить противоположную проблему: сервер сам сформировал ответ не по договору.`}),(0,x.jsx)(v,{caption:`обещанная форма`,code:`class ArticleRead(BaseModel):
    id: int
    title: str`}),(0,x.jsx)(v,{caption:`handler нарушает собственный response contract`,code:`@app.get("/article", response_model=ArticleRead)
def get_article():
    return {
        "title": "HTTP",
    }`}),(0,x.jsx)(`p`,{children:`В response отсутствует обязательный id. Клиент ничего не сделал неправильно: он просто вызвал GET. Ошибка появилась в серверном коде, который обещал одну форму результата, а сформировал другую.`}),(0,x.jsx)(v,{caption:`два разных направления ошибки`,code:`неверный request
→ вход не прошёл TaskCreate
→ проблема клиента

неверный result handler
→ не соответствует TaskRead
→ проблема сервера`}),(0,x.jsx)(t,{code:`class ProfileRead(BaseModel):
    id: int
    username: str


@app.get("/profile", response_model=ProfileRead)
def get_profile():
    return {"username": "nikita"}`,question:`Почему этот GET нарушает договор ответа?`,options:[`Клиент забыл передать id в GET body`,`Сервер вернул результат без обязательного id`,`Pydantic должен автоматически придумать id`],correctIndex:1,explanation:`Request здесь не обязан содержать server-owned id. Его должен сформировать серверный код до проверки публичного ответа.`}),(0,x.jsx)(`p`,{children:`Важно также не приписывать response validation роль транзакции. Если service уже сохранил данные, а потом handler сформировал неправильный response, сама проверка ответа не откатывает сделанное сохранение.`}),(0,x.jsx)(v,{caption:`response validation не является rollback`,code:`service.add(...)
    ↓
JsonStorage.save(...)
    ↓
handler формирует неправильный response
    ↓
response validation error`}),(0,x.jsx)(r,{tone:`warn`,children:`422 из прошлого занятия не означает «любая Pydantic-ошибка всегда 422». Направление данных имеет значение: ошибка request относится к клиентской границе, а ошибка server response возникает в реализации сервера.`})]}),(0,x.jsxs)(u,{number:`08`,title:`model_dump() не сохраняет задачу`,children:[(0,x.jsx)(l,{children:`Pydantic умеет представить модель обычными Python-данными. Это преобразование легко перепутать с настоящим действием приложения.`}),(0,x.jsx)(v,{caption:`model_dump создаёт словарь`,code:`from pydantic import BaseModel


class FeedbackInput(BaseModel):
    text: str
    rating: int


payload = FeedbackInput(text="Полезно", rating=5)
data = payload.model_dump()`}),(0,x.jsx)(v,{caption:`полученное Python-представление`,code:`{
    "text": "Полезно",
    "rating": 5,
}`}),(0,x.jsx)(`p`,{children:`Pydantic представил значения модели как словарь. Но доменная сущность не была создана, сервис не вызывался, id не назначался, JsonStorage.save() не запускался и файл не изменился.`}),(0,x.jsx)(`p`,{children:`model_dump() похож на накладную: мы переписали сведения о посылке в отдельный документ, но от этого посылка не отправилась и не появилась на складе. Здесь словарь содержит значения модели, а реальное создание и сохранение выполняют PlannerService и JsonStorage. Граница сравнения: словарь остаётся представлением данных в памяти, а не бумажным документом и не командой записи.`}),(0,x.jsx)(v,{caption:`представление и создание: разные пути`,code:`TaskCreate
    ↓ model_dump()
dict

настоящее создание:
TaskCreate
    ↓
PlannerService.add_task(...)
    ↓
Task
    ↓
JsonStorage.save(...)`}),(0,x.jsx)(d,{statement:(0,x.jsx)(`span`,{children:`model_dump() записывает Pydantic-модель в data/tasks.json.`}),isTrue:!1,explanation:`model_dump() только создаёт Python-представление. Постоянным хранением занимается JsonStorage через существующую операцию приложения.`}),(0,x.jsx)(`p`,{children:`Если endpoint просто возвращает payload.model_dump(), клиент увидит JSON, но это может быть обычный echo. Красивый response сам по себе не доказывает, что задача появилась в Planner.`}),(0,x.jsx)(r,{tone:`info`,children:`TaskRead тоже ничего не сохраняет. Создание Pydantic-модели ответа не изменяет файл без явного пути service → storage.`})]}),(0,x.jsxs)(u,{number:`09`,title:`schemas.py: отдельное место для HTTP-схем`,children:[(0,x.jsx)(l,{children:`Когда HTTP-моделей становится несколько, их полезно вынести из точки сборки приложения. При этом мы продолжаем существующий Planner, а не создаём новый проект.`}),(0,x.jsx)(v,{caption:`структура существующего проекта`,code:`app/
├── main.py
├── api.py
├── cli.py
├── models.py
├── services.py
├── storage.py
└── schemas.py`}),(0,x.jsx)(h,{items:[{title:`models.py`,description:`Содержит доменную Task. Она существовала до API и продолжает описывать предметную сущность Planner.`},{title:`schemas.py`,description:`Содержит HTTP-схемы текущего этапа: существующую TaskCreate со всеми её правилами и новую TaskRead.`},{title:`services.py`,description:`Содержит операции PlannerService. Схемы не забирают на себя создание, поиск, id или сохранение.`},{title:`storage.py`,description:`Отвечает за постоянный JSON. Pydantic-схемы не начинают напрямую открывать файл.`},{title:`api.py`,description:`Остаётся HTTP-границей: импортирует схемы, принимает запросы и вызывает уже существующий сервис.`}]}),(0,x.jsx)(v,{caption:`направление остаётся простым`,code:`api.py
 ├─ использует schemas.py
 └─ вызывает PlannerService

PlannerService
 └─ работает с Task и storage`}),(0,x.jsx)(`p`,{children:`При переносе TaskCreate нельзя потерять нормализацию, ограничения или другой уже согласованный механизм предыдущего занятия. Мы переносим существующую схему целиком, а не создаём похожую упрощённую копию.`}),(0,x.jsx)(`p`,{children:`TaskUpdate заранее не создаём. Схема появляется тогда, когда появляется реальная граница данных, которую она описывает. PUT и PATCH будут разобраны вместе с настоящими операциями обновления.`}),(0,x.jsx)(r,{tone:`info`,children:`Services не начинает импортировать FastAPI только потому, что API использует Pydantic-схемы. HTTP остаётся снаружи прикладного ядра.`})]}),(0,x.jsxs)(u,{number:`10`,title:`Как TaskRead подключается к уже работающему API`,children:[(0,x.jsx)(l,{children:`К началу занятия list, item и настоящий POST уже работают через PlannerService и общий JSON. Мы не меняем их смысл, а делаем форму успешного response явной.`}),(0,x.jsx)(`p`,{children:`GET /tasks возвращает коллекцию публичных задач. Поэтому response model описывает список объектов одного типа. На независимом примере принцип выглядит так:`}),(0,x.jsx)(v,{caption:`response model коллекции`,code:`@app.get("/articles", response_model=list[ArticleRead])
def list_articles():
    ...`}),(0,x.jsx)(`p`,{children:`GET /tasks/{task_id} возвращает одну публичную задачу. Невалидный path и отсутствующий id продолжают работать по прежнему договору: добавление response_model не меняет маршрут и не отменяет 404.`}),(0,x.jsx)(`p`,{children:`Главный пример занятия: POST. Вход и выход одной операции описываются разными схемами:`}),(0,x.jsx)(v,{caption:`одна операция, два направления`,code:`POST request
TaskCreate

POST successful response
TaskRead`}),(0,x.jsx)(v,{caption:`полный путь настоящего создания`,code:`POST
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
201 response`}),(0,x.jsx)(`p`,{children:`Успешный статус остаётся 201 Created. Добавление TaskRead не должно вернуть POST к 200 и не должно превращать настоящее создание обратно в отражение входного body.`}),(0,x.jsx)(r,{tone:`info`,children:`TaskRead находится ближе к внешней границе. Она не заменяет PlannerService, Task или JsonStorage в середине пути.`})]}),(0,x.jsxs)(u,{number:`11`,title:`OpenAPI показывает направление моделей`,children:[(0,x.jsx)(l,{children:`После разделения схем направление данных становится видно прямо в /docs: request и successful response одной операции больше не выглядят как одна неопределённая «задача».`}),(0,x.jsx)(v,{caption:`POST в OpenAPI`,code:`Request body
└── TaskCreate

Successful response: 201
└── TaskRead`}),(0,x.jsx)(`p`,{children:`Для чтения документация должна показывать публичную форму результата:`}),(0,x.jsx)(v,{caption:`GET в OpenAPI`,code:`GET /tasks
→ array of TaskRead

GET /tasks/{task_id}
→ TaskRead`}),(0,x.jsx)(`p`,{children:`Query-параметры списка при этом никуда не исчезают. Схема ответа не заменяет фильтр, сортировку или limit. Она описывает только форму возвращаемых элементов.`}),(0,x.jsx)(`p`,{children:`TaskUpdate здесь не должно быть. OpenAPI описывает реальные зарегистрированные операции, а PUT на этом этапе ещё не является новой работой занятия.`}),(0,x.jsx)(v,{caption:`документация и поведение доказывают разное`,code:`OpenAPI
→ показывает обещанный контракт

реальный POST / GET
→ показывает фактический ответ

JSON / CLI
→ показывают, что внутренняя запись и прежний интерфейс не изменились`}),(0,x.jsx)(r,{tone:`info`,children:`Правильная схема в Swagger ещё не доказывает постоянное сохранение. После /docs всё равно нужны реальные запросы и наблюдение состояния.`})]}),(0,x.jsxs)(u,{number:`12`,title:`Проверим границы на конкретных сценариях`,children:[(0,x.jsx)(l,{children:`Перед практикой разберём, какая часть системы отвечает за типичные ситуации. Это помогает не смешивать вход, доменную операцию, response и сохранение.`}),(0,x.jsx)(h,{items:[{title:`Вход`,description:`Нет обязательного priority: TaskCreate останавливает запрос до вызова endpoint.`},{title:`Лишний id`,description:`Дополнительный ключ не обязан давать 422 и не заменяет id, который назначает Planner.`},{title:`Внутреннее поле`,description:`tags остаётся в Task и JSON, но не входит в четыре поля TaskRead.`},{title:`Ошибка ответа`,description:`Если handler не вернул обязательный id, нарушен серверный договор ответа, а не вход клиента.`},{title:`Словарь модели`,description:`model_dump() создаёт Python-словарь, но не вызывает PlannerService и JsonStorage.`},{title:`Документация`,description:`OpenAPI описывает обещанный ответ, но само по себе не подтверждает сохранение записи.`}]})]}),(0,x.jsxs)(u,{number:`13`,title:`Что мы будем делать в практике`,children:[(0,x.jsx)(l,{children:`Практика не переписывает Planner, CRUD или JsonStorage. Мы отделяем HTTP-схемы и подключаем явный response contract к уже работающему приложению.`}),(0,x.jsx)(h,{variant:`connected`,items:[{title:`Схемы`,description:`Перенесём прежнюю TaskCreate без потери правил и добавим TaskRead в app/schemas.py.`},{title:`Маршруты`,description:`Подключим response_model к списку, item и настоящему POST, сохранив его 201.`},{title:`OpenAPI и ответы`,description:`Проверим объявленные схемы, прежние query-параметры и 404 для отсутствующего item.`},{title:`Состояние Planner`,description:`Сверим созданную Task по фактическому id и убедимся, что tags остался в JSON и CLI.`}]}),(0,x.jsx)(`p`,{children:`К завершению практики должны быть одновременно верны две цепочки:`}),(0,x.jsx)(v,{caption:`request`,code:`JSON → TaskCreate → PlannerService`}),(0,x.jsx)(v,{caption:`response`,code:`Task → public projection → TaskRead → HTTP JSON body`}),(0,x.jsx)(`p`,{children:`Для проверки используем один успешный POST и сопоставим его публичный ответ с той же записью в JSON и CLI. CLI и JsonStorage должны сохранить прежнюю форму данных.`})]}),(0,x.jsxs)(u,{number:`14`,title:`Главное из занятия`,children:[(0,x.jsx)(l,{children:`Мы не добавляли новую бизнес-логику. Мы сделали HTTP-границу Planner точнее и явно разделили данные по направлению.`}),(0,x.jsx)(v,{caption:`четыре разных вопроса`,code:`TaskCreate:
что клиент может отправить?

TaskRead:
что сервер обещает вернуть?

Task:
с каким объектом работает Planner?

JsonStorage:
что сохраняется между запусками?`}),(0,x.jsx)(n,{points:[(0,x.jsx)(x.Fragment,{children:`TaskCreate и TaskRead относятся к разным направлениям одного HTTP-обмена.`}),(0,x.jsx)(x.Fragment,{children:`TaskRead не заменяет доменную Task и не меняет формат JsonStorage.`}),(0,x.jsx)(x.Fragment,{children:`response_model проверяет, документирует и ограничивает внешний результат.`}),(0,x.jsx)(x.Fragment,{children:`tags может оставаться внутри Task и JSON, не входя в публичный response.`}),(0,x.jsx)(x.Fragment,{children:`model_dump() создаёт Python-представление, но сам ничего не сохраняет.`}),(0,x.jsx)(x.Fragment,{children:`Ошибка request и ошибка server response находятся по разные стороны handler.`})]}),(0,x.jsx)(v,{caption:`граница Planner после занятия`,code:`HTTP request
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
HTTP JSON response`}),(0,x.jsx)(`p`,{children:`Дальше мы разберём, кто назначает серверный id и какие гарантии даёт выбранное хранение. Схемы request и response, разделённые здесь, заново проектировать не потребуется.`})]})]})}export{S as Lesson58};
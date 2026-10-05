import { FileText, Layers } from "lucide-react";
import lesson58SchemaFlow from "./images/lesson-58-http-schema-boundaries.svg";
import lesson58SchemaFlowMobile from "./images/lesson-58-http-schema-boundaries-mobile.svg";
import { Callout, CompareSolutions, BugHunt, CodeBlock, KeyTakeaways, Lead, LinkedNotes, PredictOutput, QuizCard, StepThrough, TrueFalse, RichHero, RichLesson, Section, TypeCard, TypeCards } from "../../shared";

// 58. Разные схемы: вход и публичный ответ
export function Lesson58({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? "Блок 11 · Валидация и CRUD Planner API"}
        title={"58. Разные схемы: вход и публичный ответ"}
        intro={"TaskCreate уже защищает вход настоящего POST. Теперь отделим HTTP-вход от доменной Task, JSON-хранилища и публичного ответа, а затем сделаем форму response явной через TaskRead и response_model."}
        tags={[
          { icon: <Layers size={14} />, label: "направление данных" },
          { icon: <FileText size={14} />, label: "request и response" },
        ]}
      />
      <Section number="00" title={"Мы уже проверяем вход. Теперь нужно договориться об ответе"}>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Прежняя опора",
              description: "POST принимает проверенный TaskCreate. Существующий PlannerService создаёт Task и сохраняет её в общем JsonStorage.",
            },
            {
              title: "Новый вопрос",
              description: "Как описать ответ клиенту, не смешивая его с входным body и полным внутренним объектом?",
            },
            {
              title: "Результат",
              description: "Добавим TaskRead и подключим response_model к действующим GET и POST. Сервис, хранилище и CLI останутся прежними.",
            },
          ]}
        />

        <Lead>
          {"Создание задачи не заканчивается проверкой входа. Сначала сервер принимает только разрешённые данные, затем создаёт ресурс и возвращает клиенту результат. Посмотрим, почему у этих двух направлений разные формы."}
        </Lead>

        <p>
          {"В предыдущем занятии TaskCreate стала проверяемым входом настоящего POST. При успехе существующий PlannerService создаёт Task, назначает серверные поля и сохраняет её через JsonStorage. Клиенту возвращается не исходный body, а результат операции."}
        </p>

        <CodeBlock
          caption={"request body"}
          code={'{\n  "title": "Разобрать response_model",\n  "priority": 4\n}'}
        />

        <p>{"После создания сервер возвращает уже публичное представление существующего ресурса:"}</p>

        <CodeBlock
          caption={"успешный response"}
          code={'{\n  "id": 7,\n  "title": "Разобрать response_model",\n  "priority": 4,\n  "is_done": false\n}'}
        />

        <p>
          {"На входе было два поля. На выходе стало четыре. Внутренняя доменная Task при этом содержит поле tags, которого нет в публичном HTTP-ответе."}
        </p>
        <p>
          {"Request и response связаны одной операцией, но описывают разные стороны обмена. Если поручить одной схеме обе роли, станет неясно, какими полями управляет клиент, а какие принадлежат уже созданной задаче."}
        </p>

      </Section>

      <Section number="01" title={"Одна задача существует в нескольких представлениях"}>
        <Lead>
          {"Слово «задача» скрывает несколько разных договоров. На каждой границе приложения нужен свой набор данных и своя ответственность."}
        </Lead>

        <p>
          {"Клиент сообщает только то, чем управляет при создании. После проверки приложение работает с доменной Task. JsonStorage сохраняет полный формат проекта. Наружу API публикует только согласованную форму."}
        </p>

        <LinkedNotes
          items={[
            {
              title: "TaskCreate",
              description: "HTTP-вход создания: title и priority. Отвечает на вопрос, что клиент может прислать.",
            },
            {
              title: "Task",
              description: "Доменная модель Planner: id, title, priority, is_done и tags. С ней работает прикладная логика.",
            },
            {
              title: "JsonStorage",
              description: "Постоянное хранение полной доменной записи. Старый CLI продолжает читать тот же формат.",
            },
            {
              title: "TaskRead",
              description: "Публичный HTTP-ответ: id, title, priority и is_done. Отвечает на вопрос, что API обещает показать клиенту.",
            },
          ]}
        />

        <p>
          {"Проследим обе стороны обмена и место, где задача остаётся полной внутри Planner."}
        </p>
        <figure className="lesson-infographic lesson-infographic--lesson58">
          <picture>
            <source media="(max-width: 640px)" srcSet={lesson58SchemaFlowMobile} />
            <img
              src={lesson58SchemaFlow}
              alt="Клиент отправляет request через TaskCreate и PlannerService. Полная Task сохраняется в JsonStorage, а TaskRead задаёт четыре поля ответа 201 тому же клиенту."
              width={1672}
              height={836}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <figcaption>
            {"Request использует TaskCreate, а response формируется из Task через TaskRead. JsonStorage сохраняет полную доменную запись с tags."}
          </figcaption>
        </figure>

        <p>
          {"Это не четыре случайные копии одной структуры. Каждая форма существует на своей границе. Если смешать роли, изменение HTTP-контракта начнёт неожиданно менять доменную модель или формат файла."}
        </p>

        <Callout tone="info">
          {"Поле tags сохраняется внутри Task и JSON. Добавление API не должно незаметно удалить его из существующего Planner."}
        </Callout>
      </Section>

      <Section number="02" title={"TaskCreate остаётся схемой входа"}>
        <Lead>
          {"В этом занятии мы не проектируем TaskCreate заново. Мы сохраняем все правила прошлого занятия и уточняем её ответственность."}
        </Lead>

        <p>
          {"TaskCreate описывает данные, которыми клиент управляет в операции создания. В текущем договоре это title и priority."}
        </p>

        <CodeBlock
          caption={"направление TaskCreate"}
          code={"HTTP request body\n  title\n  priority\n      ↓\nTaskCreate\n      ↓\nPlannerService"}
        />

        <p>
          {"В TaskCreate нет id, is_done и tags. Отсутствие этих полей не означает, что Planner их потерял: они просто не принадлежат входному договору создания."}
        </p>

        <p>{"Даже если клиент передаст дополнительный id, это не делает его серверным идентификатором:"}</p>

        <CodeBlock
          caption={"лишнее серверное поле во входе"}
          code={'{\n  "title": "Изучить схемы",\n  "priority": 4,\n  "id": 999\n}'}
        />

        <p>
          {"Мы не вводим здесь отдельную политику запрета всех extra-полей. Без специальной настройки Pydantic дополнительный ключ не обязан давать 422. Главная гарантия другая: клиентский id не управляет настоящим id созданной Task."}
        </p>

        <QuizCard
          question={"Какая обязанность действительно принадлежит TaskCreate?"}
          options={[
            "Проверить HTTP-вход title и priority",
            "Выбрать следующий id",
            "Записать data/tasks.json",
          ]}
          correctIndex={0}
          explanation={"TaskCreate работает на входной HTTP-границе. Id назначает существующий сценарий создания, а сохранением занимается storage."}
        />
      </Section>

      <Section number="03" title={"Зачем появляется TaskRead"}>
        <Lead>
          {"После успешного действия сервер уже располагает полноценной задачей. Теперь нужно явно описать стабильную форму, которую API обещает вернуть клиенту."}
        </Lead>

        <p>
          {"До этого маршрут мог вручную собрать правильный словарь из четырёх полей. Но одной такой реализации недостаточно, чтобы FastAPI знал обещанную модель ответа."}
        </p>

        <CodeBlock
          caption={"явная публичная проекция уже может быть правильной"}
          code={'return {\n    "id": task.id,\n    "title": task.title,\n    "priority": task.priority,\n    "is_done": task.is_done,\n}'}
        />

        <p>
          {"TaskRead отвечает на другой вопрос, чем TaskCreate: как выглядит одна задача, когда API отдаёт её клиенту. В публичной форме есть id, title, priority и is_done."}
        </p>

        <CodeBlock
          caption={"два направления HTTP-схем"}
          code={"TaskCreate\nrequest → server\n\nTaskRead\nserver → response"}
        />

        <p>
          {"Id присутствует в TaskRead, потому что к моменту ответа ресурс уже существует и клиенту нужен идентификатор для следующих обращений. Is_done тоже входит в публичное состояние, даже если при создании клиент его не выбирал."}
        </p>
        <p>
          {"Tags отсутствует, потому что публичный договор курса содержит четыре поля. Это внешний срез данных, а не новая версия доменной Task."}
        </p>

        <CodeBlock
          caption={"внутренняя и публичная формы"}
          code={"Task:\nid, title, priority, is_done, tags\n\nTaskRead:\nid, title, priority, is_done"}
        />

        <p>
          {"Универсальная схема с optional id и default для is_done кажется короче, но скрывает направление данных: POST начинает выглядеть так, будто клиент может прислать серверные поля."}
        </p>

        <CodeBlock
          caption={"слишком универсальная схема"}
          code={"class TaskSchema(BaseModel):\n    id: int | None = None\n    title: str\n    priority: int\n    is_done: bool = False"}
        />

        <Callout tone="info">
          {"Отдельная схема обновления появится тогда, когда в проекте появится реальная граница PUT/PATCH. В 58-м занятии TaskUpdate заранее не создаём."}
        </Callout>
      </Section>

      <Section number="04" title={"TaskRead не заменяет доменную Task"}>
        <Lead>
          {"Pydantic-схема ответа относится к HTTP. Она не должна вытеснить модель, которой уже пользуются service, CLI и JsonStorage."}
        </Lead>

        <TypeCards>
          <TypeCard badge="домен" title="Task">
            {"Предметная сущность Planner. Существовала до FastAPI и остаётся частью ядра приложения."}
          </TypeCard>
          <TypeCard badge="HTTP" badgeTone="str" title="TaskRead">
            {"Публичная форма response. Нужна FastAPI на внешней границе, а не сервису и storage."}
          </TypeCard>
        </TypeCards>

        <p>
          {"Если сделать PlannerService зависимым от TaskRead, прикладной слой начнёт зависеть от формы конкретного интерфейса. Тогда изменение API сможет заставить нас менять сервис даже при неизменных предметных правилах."}
        </p>

        <CodeBlock
          caption={"нужное направление зависимостей"}
          code={"HTTP request\n    ↓\nHTTP schema\n    ↓\nPlannerService\n    ↓\ndomain Task\n    ↓\nJsonStorage\n\nи обратно:\n\ndomain Task\n    ↓\npublic projection\n    ↓\nHTTP response schema\n    ↓\nHTTP response"}
        />

        <p>
          {"Это похоже на каталог магазина. Полная складская запись соответствует Task, а карточка покупателя соответствует TaskRead: она показывает id, name и price, но не supplier_code и закупочную цену. Граница сравнения: каталог объясняет разницу внутренних и публичных полей; response_model проверяет и формирует JSON, но не управляет хранилищем Planner."}
        </p>

        <CompareSolutions
          question={"Какой вариант сохраняет текущую архитектуру Planner и не смешивает HTTP-схему с доменной моделью?"}
          left={{
            title: "TaskRead становится моделью ядра",
            code: "PlannerService → TaskRead → JsonStorage",
            note: "HTTP-схема начинает определять внутреннюю модель и формат сохранения.",
          }}
          right={{
            title: "Task остаётся в ядре",
            code: "PlannerService → Task → JsonStorage\nTask → projection → TaskRead → HTTP",
            note: "HTTP-схема используется только на внешней границе ответа.",
          }}
          preferred="right"
          explanation={"TaskRead уточняет внешний договор. Доменная Task, PlannerService и JsonStorage продолжают выполнять прежние обязанности."}
        />
      </Section>

      <Section number="05" title={"response_model: явный договор ответа"}>
        <Lead>
          {"FastAPI позволяет отдельно объявить ожидаемую форму успешного ответа. Это центральная новая механика занятия."}
        </Lead>

        <p>{"Сначала разберём её на независимом примере, чтобы не выдавать готовую реализацию Planner."}</p>

        <CodeBlock
          caption={"независимый пример response_model"}
          code={'from fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\n\nclass ArticleRead(BaseModel):\n    id: int\n    title: str\n\n\n@app.get("/article", response_model=ArticleRead)\ndef get_article():\n    return {\n        "id": 3,\n        "title": "HTTP response",\n        "internal_note": "draft",\n    }'}
        />

        <p>
          {"Функция возвращает id, title и internal_note, но публичная модель ответа содержит только id и title. Клиент получает форму, объявленную как ArticleRead."}
        </p>

        <CodeBlock
          caption={"публичный результат"}
          code={'{\n  "id": 3,\n  "title": "HTTP response"\n}'}
        />

        <LinkedNotes
          items={[
            {
              title: "Проверка",
              description: "FastAPI ожидает, что успешный результат можно представить в форме объявленной модели ответа.",
            },
            {
              title: "OpenAPI",
              description: "Схема response появляется в документации и показывает клиенту ожидаемую форму JSON.",
            },
            {
              title: "Публичная граница",
              description: "Поля вне response model не должны случайно становиться частью внешнего ответа.",
            },
          ]}
        />

        <p>
          {"Тип параметра функции описывает request, а response_model в декораторе описывает результат path operation. Это два независимых направления одного обмена."}
        </p>

        <CodeBlock
          caption={"request и response находятся по разные стороны handler"}
          code={"request body\n    ↓\nTaskCreate\n    ↓\nhandler\n    ↓\nTaskRead / response_model\n    ↓\nresponse body"}
        />

        <p>
          {"Для списка применяется тот же принцип, только model описывает каждый элемент коллекции:"}
        </p>

        <CodeBlock
          caption={"response model коллекции"}
          code={'@app.get("/articles", response_model=list[ArticleRead])\ndef list_articles():\n    ...'}
        />

        <p>
          {"Ниже показана упрощённая модель на чистом Pydantic. Это не внутренний исходный код FastAPI, а наблюдение за тем же смыслом: результат проверяется схемой, после чего наружу формируется публичное представление."}
        </p>

        <StepThrough
          code={'result = {"id": 5, "title": "FastAPI", "internal_note": "do not publish"}\nvalidated = ArticleRead.model_validate(result)\npublic = validated.model_dump()'}
          steps={[
            {
              line: 0,
              note: "Handler подготовил Python-результат. В нём есть публичные поля и дополнительное внутреннее поле.",
              vars: { result: "{id, title, internal_note}" },
            },
            {
              line: 1,
              note: "ArticleRead проверяет обязательные id и title. Internal_note не становится полем модели ответа.",
              vars: { validated: "ArticleRead(id=5, title='FastAPI')" },
            },
            {
              line: 2,
              note: "Публичное представление содержит только поля объявленной модели.",
              vars: { public: "{'id': 5, 'title': 'FastAPI'}" },
            },
          ]}
        />

        <Callout tone="info">
          {"Response model работает на границе ответа. Он не изменяет storage и не является операцией сохранения."}
        </Callout>
      </Section>

      <Section number="06" title={"Что происходит с tags"}>
        <Lead>
          {"Поле может оставаться внутри приложения и при этом не входить в публичный HTTP response. Для Planner хороший пример: существующее tags."}
        </Lead>

        <CodeBlock
          caption={"доменная запись"}
          code={'task_data = {\n    "id": 12,\n    "title": "FastAPI",\n    "priority": 4,\n    "is_done": False,\n    "tags": ["backend", "api"],\n}'}
        />

        <p>
          {"Публичный договор TaskRead содержит id, title, priority и is_done. Tags в него не входит, поэтому клиент видит только согласованные четыре поля."}
        </p>

        <CodeBlock
          caption={"публичный response"}
          code={'{\n  "id": 12,\n  "title": "FastAPI",\n  "priority": 4,\n  "is_done": false\n}'}
        />

        <p>
          <strong>{"Главное:"}</strong>{" "}
          {"с Task и JSON ничего не произошло. Поле перестало быть видимым в конкретном HTTP response, но не исчезло из приложения."}
        </p>

        <CodeBlock
          caption={"не путайте фильтрацию ответа с изменением данных"}
          code={"не публиковать поле ≠ удалить поле из объекта\nне публиковать поле ≠ изменить JsonStorage\nне публиковать поле ≠ вызвать save()\nне публиковать поле ≠ изменить формат старого Planner"}
        />

        <p>
          {"В текущем проекте HTTP-слой уже собирает явную четырёхпольную проекцию Task. TaskRead добавляет проверяемую границу поверх этой проекции. Не нужно возвращать все внутренние поля только ради демонстрации фильтрации."}
        </p>

        <p>
          {"Перед следующим разбором смоделируем публичную проекцию обычным Python-кодом. Это не реализация FastAPI, а простой способ увидеть, какие поля остаются наружу."}
        </p>

        <PredictOutput
          code={'task = {\n    "id": 4,\n    "title": "Schemas",\n    "priority": 2,\n    "is_done": True,\n    "tags": ["python"],\n}\npublic = {key: task[key] for key in ("id", "title", "priority", "is_done")}\nprint(public)'}
          output={"{'id': 4, 'title': 'Schemas', 'priority': 2, 'is_done': True}"}
          hint={"Сначала отметим ключи в кортеже, затем сопоставим их со значениями task."}
        />

        <Callout tone="info">
          {"После HTTP-проверки нужно отдельно убедиться, что tags сохранился в доменной записи и JSON. Красивый response этого не доказывает."}
        </Callout>
      </Section>

      <Section number="07" title={"Неправильный response: ошибка сервера, а не 422 клиента"}>
        <Lead>
          {"В прошлом занятии Pydantic останавливал неправильный request. Теперь та же библиотека помогает заметить противоположную проблему: сервер сам сформировал ответ не по договору."}
        </Lead>

        <CodeBlock
          caption={"обещанная форма"}
          code={"class ArticleRead(BaseModel):\n    id: int\n    title: str"}
        />

        <CodeBlock
          caption={"handler нарушает собственный response contract"}
          code={'@app.get("/article", response_model=ArticleRead)\ndef get_article():\n    return {\n        "title": "HTTP",\n    }'}
        />

        <p>
          {"В response отсутствует обязательный id. Клиент ничего не сделал неправильно: он просто вызвал GET. Ошибка появилась в серверном коде, который обещал одну форму результата, а сформировал другую."}
        </p>

        <CodeBlock
          caption={"два разных направления ошибки"}
          code={"неверный request\n→ вход не прошёл TaskCreate\n→ проблема клиента\n\nневерный result handler\n→ не соответствует TaskRead\n→ проблема сервера"}
        />

        <BugHunt
          code={'class ProfileRead(BaseModel):\n    id: int\n    username: str\n\n\n@app.get("/profile", response_model=ProfileRead)\ndef get_profile():\n    return {"username": "nikita"}'}
          question={"Почему этот GET нарушает договор ответа?"}
          options={[
            "Клиент забыл передать id в GET body",
            "Сервер вернул результат без обязательного id",
            "Pydantic должен автоматически придумать id",
          ]}
          correctIndex={1}
          explanation={"Request здесь не обязан содержать server-owned id. Его должен сформировать серверный код до проверки публичного ответа."}
        />

        <p>
          {"Важно также не приписывать response validation роль транзакции. Если service уже сохранил данные, а потом handler сформировал неправильный response, сама проверка ответа не откатывает сделанное сохранение."}
        </p>

        <CodeBlock
          caption={"response validation не является rollback"}
          code={"service.add(...)\n    ↓\nJsonStorage.save(...)\n    ↓\nhandler формирует неправильный response\n    ↓\nresponse validation error"}
        />

        <Callout tone="warn">
          {"422 из прошлого занятия не означает «любая Pydantic-ошибка всегда 422». Направление данных имеет значение: ошибка request относится к клиентской границе, а ошибка server response возникает в реализации сервера."}
        </Callout>
      </Section>

      <Section number="08" title={"model_dump() не сохраняет задачу"}>
        <Lead>
          {"Pydantic умеет представить модель обычными Python-данными. Это преобразование легко перепутать с настоящим действием приложения."}
        </Lead>

        <CodeBlock
          caption={"model_dump создаёт словарь"}
          code={'from pydantic import BaseModel\n\n\nclass FeedbackInput(BaseModel):\n    text: str\n    rating: int\n\n\npayload = FeedbackInput(text="Полезно", rating=5)\ndata = payload.model_dump()'}
        />

        <CodeBlock
          caption={"полученное Python-представление"}
          code={'{\n    "text": "Полезно",\n    "rating": 5,\n}'}
        />

        <p>
          {"Pydantic представил значения модели как словарь. Но доменная сущность не была создана, сервис не вызывался, id не назначался, JsonStorage.save() не запускался и файл не изменился."}
        </p>

        <p>
          {"model_dump() похож на накладную: мы переписали сведения о посылке в отдельный документ, но от этого посылка не отправилась и не появилась на складе. Здесь словарь содержит значения модели, а реальное создание и сохранение выполняют PlannerService и JsonStorage. Граница сравнения: словарь остаётся представлением данных в памяти, а не бумажным документом и не командой записи."}
        </p>

        <CodeBlock
          caption={"представление и создание: разные пути"}
          code={"TaskCreate\n    ↓ model_dump()\ndict\n\nнастоящее создание:\nTaskCreate\n    ↓\nPlannerService.add_task(...)\n    ↓\nTask\n    ↓\nJsonStorage.save(...)"}
        />

        <TrueFalse
          statement={<span>{"model_dump() записывает Pydantic-модель в data/tasks.json."}</span>}
          isTrue={false}
          explanation={"model_dump() только создаёт Python-представление. Постоянным хранением занимается JsonStorage через существующую операцию приложения."}
        />

        <p>
          {"Если endpoint просто возвращает payload.model_dump(), клиент увидит JSON, но это может быть обычный echo. Красивый response сам по себе не доказывает, что задача появилась в Planner."}
        </p>

        <Callout tone="info">
          {"TaskRead тоже ничего не сохраняет. Создание Pydantic-модели ответа не изменяет файл без явного пути service → storage."}
        </Callout>
      </Section>

      <Section number="09" title={"schemas.py: отдельное место для HTTP-схем"}>
        <Lead>
          {"Когда HTTP-моделей становится несколько, их полезно вынести из точки сборки приложения. При этом мы продолжаем существующий Planner, а не создаём новый проект."}
        </Lead>

        <CodeBlock
          caption={"структура существующего проекта"}
          code={"app/\n├── main.py\n├── api.py\n├── cli.py\n├── models.py\n├── services.py\n├── storage.py\n└── schemas.py"}
        />

        <LinkedNotes
          items={[
            {
              title: "models.py",
              description: "Содержит доменную Task. Она существовала до API и продолжает описывать предметную сущность Planner.",
            },
            {
              title: "schemas.py",
              description: "Содержит HTTP-схемы текущего этапа: существующую TaskCreate со всеми её правилами и новую TaskRead.",
            },
            {
              title: "services.py",
              description: "Содержит операции PlannerService. Схемы не забирают на себя создание, поиск, id или сохранение.",
            },
            {
              title: "storage.py",
              description: "Отвечает за постоянный JSON. Pydantic-схемы не начинают напрямую открывать файл.",
            },
            {
              title: "api.py",
              description: "Остаётся HTTP-границей: импортирует схемы, принимает запросы и вызывает уже существующий сервис.",
            },
          ]}
        />

        <CodeBlock
          caption={"направление остаётся простым"}
          code={"api.py\n ├─ использует schemas.py\n └─ вызывает PlannerService\n\nPlannerService\n └─ работает с Task и storage"}
        />

        <p>
          {"При переносе TaskCreate нельзя потерять нормализацию, ограничения или другой уже согласованный механизм предыдущего занятия. Мы переносим существующую схему целиком, а не создаём похожую упрощённую копию."}
        </p>
        <p>
          {"TaskUpdate заранее не создаём. Схема появляется тогда, когда появляется реальная граница данных, которую она описывает. PUT и PATCH будут разобраны вместе с настоящими операциями обновления."}
        </p>

        <Callout tone="info">
          {"Services не начинает импортировать FastAPI только потому, что API использует Pydantic-схемы. HTTP остаётся снаружи прикладного ядра."}
        </Callout>
      </Section>

      <Section number="10" title={"Как TaskRead подключается к уже работающему API"}>
        <Lead>
          {"К началу занятия list, item и настоящий POST уже работают через PlannerService и общий JSON. Мы не меняем их смысл, а делаем форму успешного response явной."}
        </Lead>

        <p>
          {"GET /tasks возвращает коллекцию публичных задач. Поэтому response model описывает список объектов одного типа. На независимом примере принцип выглядит так:"}
        </p>

        <CodeBlock
          caption={"response model коллекции"}
          code={'@app.get("/articles", response_model=list[ArticleRead])\ndef list_articles():\n    ...'}
        />

        <p>
          {"GET /tasks/{task_id} возвращает одну публичную задачу. Невалидный path и отсутствующий id продолжают работать по прежнему договору: добавление response_model не меняет маршрут и не отменяет 404."}
        </p>

        <p>
          {"Главный пример занятия: POST. Вход и выход одной операции описываются разными схемами:"}
        </p>

        <CodeBlock
          caption={"одна операция, два направления"}
          code={"POST request\nTaskCreate\n\nPOST successful response\nTaskRead"}
        />

        <CodeBlock
          caption={"полный путь настоящего создания"}
          code={"POST\n    ↓\nTaskCreate\n    ↓\nPlannerService.add_task\n    ↓\nTask\n    ↓\nJsonStorage\n    ↓\npublic projection\n    ↓\nTaskRead\n    ↓\n201 response"}
        />

        <p>
          {"Успешный статус остаётся 201 Created. Добавление TaskRead не должно вернуть POST к 200 и не должно превращать настоящее создание обратно в отражение входного body."}
        </p>

        <Callout tone="info">
          {"TaskRead находится ближе к внешней границе. Она не заменяет PlannerService, Task или JsonStorage в середине пути."}
        </Callout>
      </Section>

      <Section number="11" title={"OpenAPI показывает направление моделей"}>
        <Lead>
          {"После разделения схем направление данных становится видно прямо в /docs: request и successful response одной операции больше не выглядят как одна неопределённая «задача»."}
        </Lead>

        <CodeBlock
          caption={"POST в OpenAPI"}
          code={"Request body\n└── TaskCreate\n\nSuccessful response: 201\n└── TaskRead"}
        />

        <p>{"Для чтения документация должна показывать публичную форму результата:"}</p>

        <CodeBlock
          caption={"GET в OpenAPI"}
          code={"GET /tasks\n→ array of TaskRead\n\nGET /tasks/{task_id}\n→ TaskRead"}
        />

        <p>
          {"Query-параметры списка при этом никуда не исчезают. Схема ответа не заменяет фильтр, сортировку или limit. Она описывает только форму возвращаемых элементов."}
        </p>
        <p>
          {"TaskUpdate здесь не должно быть. OpenAPI описывает реальные зарегистрированные операции, а PUT на этом этапе ещё не является новой работой занятия."}
        </p>

        <CodeBlock
          caption={"документация и поведение доказывают разное"}
          code={"OpenAPI\n→ показывает обещанный контракт\n\nреальный POST / GET\n→ показывает фактический ответ\n\nJSON / CLI\n→ показывают, что внутренняя запись и прежний интерфейс не изменились"}
        />

        <Callout tone="info">
          {"Правильная схема в Swagger ещё не доказывает постоянное сохранение. После /docs всё равно нужны реальные запросы и наблюдение состояния."}
        </Callout>
      </Section>

      <Section number="12" title={"Проверим границы на конкретных сценариях"}>
        <Lead>
          {"Перед практикой разберём, какая часть системы отвечает за типичные ситуации. Это помогает не смешивать вход, доменную операцию, response и сохранение."}
        </Lead>

        <LinkedNotes
          items={[
            {
              title: "Вход",
              description: "Нет обязательного priority: TaskCreate останавливает запрос до вызова endpoint.",
            },
            {
              title: "Лишний id",
              description: "Дополнительный ключ не обязан давать 422 и не заменяет id, который назначает Planner.",
            },
            {
              title: "Внутреннее поле",
              description: "tags остаётся в Task и JSON, но не входит в четыре поля TaskRead.",
            },
            {
              title: "Ошибка ответа",
              description: "Если handler не вернул обязательный id, нарушен серверный договор ответа, а не вход клиента.",
            },
            {
              title: "Словарь модели",
              description: "model_dump() создаёт Python-словарь, но не вызывает PlannerService и JsonStorage.",
            },
            {
              title: "Документация",
              description: "OpenAPI описывает обещанный ответ, но само по себе не подтверждает сохранение записи.",
            },
          ]}
        />
      </Section>

      <Section number="13" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Практика не переписывает Planner, CRUD или JsonStorage. Мы отделяем HTTP-схемы и подключаем явный response contract к уже работающему приложению."}
        </Lead>

        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Схемы",
              description: "Перенесём прежнюю TaskCreate без потери правил и добавим TaskRead в app/schemas.py.",
            },
            {
              title: "Маршруты",
              description: "Подключим response_model к списку, item и настоящему POST, сохранив его 201.",
            },
            {
              title: "OpenAPI и ответы",
              description: "Проверим объявленные схемы, прежние query-параметры и 404 для отсутствующего item.",
            },
            {
              title: "Состояние Planner",
              description: "Сверим созданную Task по фактическому id и убедимся, что tags остался в JSON и CLI.",
            },
          ]}
        />

        <p>{"К завершению практики должны быть одновременно верны две цепочки:"}</p>

        <CodeBlock
          caption={"request"}
          code={"JSON → TaskCreate → PlannerService"}
        />

        <CodeBlock
          caption={"response"}
          code={"Task → public projection → TaskRead → HTTP JSON body"}
        />

        <p>
          {"Для проверки используем один успешный POST и сопоставим его публичный ответ с той же записью в JSON и CLI. CLI и JsonStorage должны сохранить прежнюю форму данных."}
        </p>

      </Section>

      <Section number="14" title={"Главное из занятия"}>
        <Lead>
          {"Мы не добавляли новую бизнес-логику. Мы сделали HTTP-границу Planner точнее и явно разделили данные по направлению."}
        </Lead>

        <CodeBlock
          caption={"четыре разных вопроса"}
          code={"TaskCreate:\nчто клиент может отправить?\n\nTaskRead:\nчто сервер обещает вернуть?\n\nTask:\nс каким объектом работает Planner?\n\nJsonStorage:\nчто сохраняется между запусками?"}
        />

        <KeyTakeaways
          points={[
            <>{"TaskCreate и TaskRead относятся к разным направлениям одного HTTP-обмена."}</>,
            <>{"TaskRead не заменяет доменную Task и не меняет формат JsonStorage."}</>,
            <>{"response_model проверяет, документирует и ограничивает внешний результат."}</>,
            <>{"tags может оставаться внутри Task и JSON, не входя в публичный response."}</>,
            <>{"model_dump() создаёт Python-представление, но сам ничего не сохраняет."}</>,
            <>{"Ошибка request и ошибка server response находятся по разные стороны handler."}</>,
          ]}
        />

        <CodeBlock
          caption={"граница Planner после занятия"}
          code={"HTTP request\n    ↓\nTaskCreate\n    ↓\nPlannerService\n    ↓\nTask\n    ↓\nJsonStorage\n    ↓\npublic projection\n    ↓\nTaskRead\n    ↓\nHTTP JSON response"}
        />

        <p>
          {"Дальше мы разберём, кто назначает серверный id и какие гарантии даёт выбранное хранение. Схемы request и response, разделённые здесь, заново проектировать не потребуется."}
        </p>
      </Section>
    </RichLesson>
  );
}

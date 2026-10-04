import {
  AlertTriangle,
  Boxes,
  Braces,
  FileText,
  GitFork,
  KeyRound,
  Layers,
  ListChecks,
  Scale,
  ShieldCheck,
  Trophy,
  Wrench,
} from "lucide-react";
import {
  Callout,
  CodeSequence,
  CompareSolutions,
  BranchExplorer,
  BugHunt,
  CodeBlock,
  KeyTakeaways,
  Lead,
  LinkedNotes,
  MatchPairs,
  PracticeCta,
  PredictOutput,
  QuizCard,
  StepThrough,
  TrueFalse,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  TypeCard,
  TypeCards,
} from "../shared";

type TheoryBridgeData = { link: string; boundary: string };

const BLOCK_TITLE = "Блок 11 · Валидация и CRUD Planner API";

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  57: {
    link: "FastAPI уже умеет принимать body. Теперь тело запроса получает точную форму, а неподходящие данные останавливаются до выполнения endpoint.",
    boundary: "Pydantic проверяет структуру и простые ограничения, но не угадывает все правила предметной области.",
  },
  58: {
    link: "TaskCreate уже проверяет body. Теперь одна модель не должна одновременно описывать создание, обновление и публичный ответ.",
    boundary: "Несколько схем нужны из-за разных контрактов, а не ради количества классов.",
  },
};

function TheoryBridge({ lesson }: { lesson: number }) {
  const bridge = THEORY_BRIDGES[lesson];
  if (!bridge) return null;

  return (
    <Callout tone="info">
      <strong>Связь с курсом.</strong> {bridge.link}{" "}
      <strong>Важно не перепутать:</strong> {bridge.boundary}
    </Callout>
  );
}

// 57. Pydantic-валидация и ошибка 422
export function Lesson57({ module }: { module?: string }) {
  const fieldExample = `class SurveyInput(BaseModel):
    comment: str = Field(min_length=2, max_length=80)
    score: int = Field(ge=1, le=5)`;

  const normalizeExample = `class RegionInput(BaseModel):
    code: str

    @field_validator("code", mode="before")
    @classmethod
    def normalize_code(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip().upper()
        return value`;

  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Pydantic-валидация и ошибка 422"}
        intro={"В прошлом занятии POST начал сохранять настоящие задачи Planner. Теперь уточним, какие данные этот маршрут принимает, и проверим, что ошибка останавливает запрос до изменения проекта."}
        tags={[
          { icon: <Braces size={14} />, label: "вход до endpoint" },
          { icon: <ShieldCheck size={14} />, label: "проверка и сохранение" },
        ]}
      />
      <TheoryBridge lesson={57} />

      <Section number="01" title={"От принятого запроса к допустимым данным"}>
        <Lead>
          {"JSON может быть синтаксически верным, но бесполезным для приложения: например, title содержит только пробелы или priority выходит за пределы правил Planner."}
        </Lead>
        <p>
          {"В предыдущем занятии TaskCreate стала входом для настоящего POST. Успешный запрос проходит через PlannerService и сохраняется в общем JSON. Теперь мы усиливаем только входную границу. Маршрут и способ создания остаются прежними."}
        </p>
        <LinkedNotes
          variant="connected"
          items={[
            { title: "Получить body", description: "FastAPI читает JSON и строит TaskCreate." },
            { title: "Проверить значения", description: "Pydantic применяет типы и ограничения до вызова маршрута." },
            { title: "Выполнить действие", description: "Только допустимый вход доходит до существующего PlannerService." },
          ]}
        />
        <Callout tone="info">
          {"Валидация не создаёт Task и не сохраняет JSON. Она решает, можно ли передать вход дальше."}
        </Callout>
      </Section>

      <Section number="02" title={"Field задаёт границы, но не исправляет данные"}>
        <Lead>
          {"Тип отвечает на вопрос «какие данные ожидаются?», а ограничения уточняют допустимые значения. Для строк и чисел Pydantic позволяет хранить простые границы рядом с полем."}
        </Lead>
        <p>
          {"В этом независимом примере комментарий должен содержать от 2 до 80 символов, а оценка лежать между 1 и 5 включительно. Field проверяет значение, но не меняет его и не удаляет пробелы."}
        </p>
        <CodeBlock caption={"ограничения значения"} code={fieldExample} />
        <QuizCard
          question={"Что произойдёт со строкой из трёх пробелов, если задано только min_length=1?"}
          options={["Она пройдёт проверку длины", "Field автоматически удалит пробелы", "Значение превратится в None"]}
          correctIndex={0}
          explanation={"Field измеряет длину строки как она есть. Чтобы проверять смысловое содержимое, значение сначала нужно нормализовать."}
        />
        <p>
          {"В Planner priority ограничивается снизу и сверху. Для title нужна ещё одна операция: сначала убрать пробелы по краям, затем проверить длину уже получившейся строки."}
        </p>
      </Section>

      <Section number="03" title={"Before-validator готовит исходное значение"}>
        <Lead>
          {"Валидатор режима before запускается до обычной проверки поля. Это место для предсказуемой нормализации, например удаления внешних пробелов или приведения к единому регистру."}
        </Lead>
        <p>
          {"Рассмотрим код региона. Нажимайте шаги и проследите, что получает валидатор и какое значение попадёт к следующей проверке."}
        </p>
        <StepThrough
          code={normalizeExample}
          steps={[
            { line: 0, note: "Pydantic начинает создавать RegionInput из исходных данных.", vars: { code: "«  nw  »" } },
            { line: 3, note: "Before-validator получает исходное значение ещё до стандартной проверки строки." },
            { line: 5, note: "Строка очищается по краям и переводится в верхний регистр.", vars: { value: "«  nw  »", result: "«NW»" } },
            { line: 8, note: "Далее Pydantic проверяет тип результата и создаёт модель.", vars: { code: "«NW»" } },
          ]}
        />
        <p>
          {"Проверка типа остаётся за Pydantic. Поэтому валидатор сначала убеждается, что значение строковое, и лишь затем вызывает строковые методы. Число проходит дальше без изменений и получает обычную ошибку типа, а не внутренний сбой программы."}
        </p>
      </Section>

      <Section number="04" title={"Порядок нормализации и ограничения"}>
        <Lead>
          {"Field должен проверять итоговое значение. Иначе краевые пробелы будут влиять на длину, хотя после очистки они не станут частью названия."}
        </Lead>
        <p>
          {"Найдите причину ошибки: этот валидатор вызывает строковый метод для любого входа. Если клиент передаст число, приложение получит непредусмотренное исключение вместо ошибки валидации."}
        </p>
        <BugHunt
          code={`class RegionInput(BaseModel):
    code: str

    @field_validator("code", mode="before")
    @classmethod
    def normalize_code(cls, value: object) -> object:
        return value.strip().upper()`}
          question={"Почему такая проверка опасна для входного поля?"}
          options={[
            "value может быть не строкой, тогда strip вызовет AttributeError",
            "mode=before запрещает возвращать строку",
            "Pydantic не поддерживает методы класса",
          ]}
          correctIndex={0}
          explanation={"Before-validator видит сырое значение до проверки типа. Сначала нужно проверить isinstance(value, str), а неподходящее значение оставить Pydantic."}
          fix={`if isinstance(value, str):
            return value.strip().upper()
        return value`}
        />
        <BranchExplorer
          code={`if isinstance(value, str):
      return value.strip()
  return value`}
          scenarios={[
            { label: "value = « API »", activeLine: 1, output: "«API» передаётся проверке Field" },
            { label: "value = 42", activeLine: 2, output: "42 остаётся без изменений; тип проверит Pydantic" },
          ]}
        />
        <Callout tone="info">
          {"Для Planner порядок такой: сначала очистить title, затем проверить длину от 1 до 120. Сама граница не должна менять вход."}
        </Callout>
      </Section>

      <Section number="05" title={"Один статус 422, разные места отказа"}>
        <Lead>
          {"422 сообщает, что запрос нельзя обработать с переданными данными. Чтобы понять причину, важно увидеть, на каком этапе сервер остановился."}
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            { title: "Валидация body", description: "TaskCreate не строится; тело endpoint не запускается." },
            { title: "Правило Planner", description: "Endpoint уже вызвал сервис, который проверяет предметный инвариант." },
            { title: "Состояние", description: "Отказ входной схемы происходит до сохранения и не меняет список задач." },
          ]}
        />
        <p>
          {"FastAPI обычно возвращает список ошибок в detail. Поле loc помогает найти участок запроса, а msg кратко описывает нарушение. Точный текст зависит от версии библиотеки. Не путайте эти данные со строковым detail, который приложение может вернуть после собственного HTTPException."}
        </p>
        <QuizCard
          question={"Как понять, что отсутствующее обязательное поле отклонено до тела endpoint?"}
          options={[
            "FastAPI вернул ошибку Pydantic с указанием body и поля",
            "В ответе POST появился новый id",
            "Stats увеличилась после запроса",
          ]}
          correctIndex={0}
          explanation={"Ошибка построения входной модели возникает до вызова функции маршрута. Поэтому сервис и сохранение не запускаются."}
        />
      </Section>

      <Section number="06" title={"Успешный путь Planner не меняется"}>
        <Lead>
          {"Допустимые данные должны пройти тот же сценарий, который мы уже построили: сервис создаёт предметную Task, назначает серверные значения и сохраняет результат."}
        </Lead>
        <CodeBlock
          caption={"маршрут продолжает использовать готовый сервис"}
          code={`@app.post("/tasks", status_code=201)
def create_task(payload: TaskCreate):
    task = app.state.planner.add_task(
        payload.title,
        priority=payload.priority,
    )
    return {
        "id": task.id,
        "title": task.title,
        "priority": task.priority,
        "is_done": task.is_done,
    }`}
        />
        <p>
          {"TaskCreate отвечает за клиентские title и priority. Она не назначает id и не записывает файл. Это делает существующий путь приложения. Если body не проходит проверку, функция не вызвана. Если проходит, endpoint по-прежнему возвращает созданную запись со статусом 201."}
        </p>
        <Callout tone="info">
          {"Словарь, полученный из входной модели, не становится Task и сам по себе ничего не сохраняет."}
        </Callout>
      </Section>

      <Section number="07" title={"Что мы сделаем в практике"}>
        <Lead>
          {"Мы не пишем новый POST и не создаём отдельное хранилище. Практика уточняет входную схему и проверяет её влияние на тот же Planner."}
        </Lead>
        <LinkedNotes
          variant="connected"
          items={[
            { title: "Уточнить правила", description: "Добавить нормализацию title и границы title/priority в текущую TaskCreate." },
            { title: "Проверить случаи", description: "Сравнить пустые и слишком длинные значения с допустимыми границами." },
            { title: "Сверить результат", description: "Доказать отсутствие изменений при отказе и чтение созданной Task после успеха." },
          ]}
        />
        <p>
          {"Практика завершена, когда ошибки входа не меняют Planner, а допустимое название очищается и проходит через существующий POST. Мы не меняем форму публичного ответа, id, CLI или формат JSON. В следующем занятии разделим модель входа и публичную форму ответа."}
        </p>
        <KeyTakeaways
          points={[
            <>{"Field ограничивает значения, но не нормализует их."}</>,
            <>{"Before-validator подготавливает сырое значение перед проверкой типа и ограничений."}</>,
            <>{"Ошибочный body не запускает endpoint и не меняет сохранённые задачи."}</>,
            <>{"Успешный POST продолжает пользоваться тем же PlannerService и JsonStorage."}</>,
          ]}
        />
      </Section>
    </RichLesson>
  );
}


// 58. Разные схемы: вход и публичный ответ
export function Lesson58({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
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
          {"Представим каталог: внутренний товар хранит supplier_code и purchase_price, но публичный API отдаёт только id, name и price. Отсутствие внутреннего поля в response не означает его удаление из доменной модели."}
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
          hint={"Посмотрите, какие ключи перечислены при сборке public."}
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
          {"Правильная схема в Swagger ещё не доказывает persistence. После /docs всё равно нужны реальные запросы и наблюдение состояния."}
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



// 59. JSON-хранилище и серверные идентификаторы
export function Lesson59({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"59. JSON-хранилище и серверные идентификаторы"}
        intro={"POST уже создаёт задачу, а TaskRead задаёт вид ответа. Теперь проследим, где задача действительно сохраняется, кто назначает её id и как проверить, что API и CLI работают с одним Planner."}
        tags={[
          { icon: <Boxes size={14} />, label: "настоящее сохранение" },
          { icon: <KeyRound size={14} />, label: "серверный id" },
        ]}
      />

      <Section number="00" title={"Успешный ответ должен соответствовать сохранённому состоянию"}>
        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Прежняя опора",
              description: "Persistent Planner уже имеет Task, PlannerService, JsonStorage и CLI. В предыдущем занятии API получило отдельные схемы входа и ответа.",
            },
            {
              title: "Новый вопрос",
              description: "Как доказать, что успешный POST изменил общий файл, а не только вернул красивый JSON?",
            },
            {
              title: "Результат",
              description: "Проследим готовый путь add_task, проверим id и подтвердим чтение той же записи новым сервисом и CLI.",
            },
          ]}
        />

        <Lead>
          {"В предыдущем занятии мы разделили вход и ответ. Но схема ответа сама ничего не сохраняет. В этом занятии не будем писать второй storage или ещё один генератор id. Проверим, как уже работающий Planner выполняет создание и где подтверждается постоянный результат."}
        </Lead>
      </Section>

      <Section number="01" title={"Один POST проходит через готовое ядро"}>
        <Lead>
          {"Разберём путь одной задачи. Здесь важно отделить HTTP-обработчик от предметного действия и от работы с файлом."}
        </Lead>

        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Вход",
              description: "FastAPI принимает проверенный TaskCreate с title и priority.",
            },
            {
              title: "Действие",
              description: "Маршрут передаёт эти значения существующему PlannerService.add_task().",
            },
            {
              title: "Состояние",
              description: "Сервис загружает Task, применяет правила Planner и назначает серверный id.",
            },
            {
              title: "Сохранение",
              description: "JsonStorage переводит Task в прежний формат JSON и записывает общий файл.",
            },
            {
              title: "Ответ",
              description: "Сервис возвращает Task, а API формирует публичный TaskRead и статус 201.",
            },
          ]}
        />

        <p>
          {"Схема request не создаёт задачу. Она только проверяет вход. Предметное действие выполняет сервис, а постоянную запись создаёт storage. Публичный ответ появляется после этого пути."}
        </p>

        <p>
          {"Посмотрим на ту же последовательность в независимом примере. Это обычный Python-фрагмент, а не код Planner."}
        </p>

        <StepThrough
          code={"def add_book(title, storage):\n    books = storage.load()\n    book = {\"title\": title}\n    books.append(book)\n    storage.save(books)\n    return book"}
          steps={[
            {
              line: 0,
              note: "Функция получает предметное значение и объект, который умеет загружать и сохранять состояние.",
            },
            {
              line: 1,
              note: "До изменения функция получает текущее состояние. Новое действие не должно начинаться с пустого списка.",
              vars: { books: "текущие записи" },
            },
            {
              line: 2,
              note: "Создаётся новая запись. В Planner такую работу выполняет доменная модель и правило сервиса.",
              vars: { book: "{'title': ...}" },
            },
            {
              line: 4,
              note: "Новое состояние передаётся storage. Если запись не удалась, следующая строка с return не будет достигнута.",
              vars: { books: "старые записи + новая запись" },
            },
            {
              line: 5,
              note: "Только после успешного save функция возвращает результат вызывающему коду.",
              vars: { result: "созданная запись" },
            },
          ]}
        />

        <Callout tone="info">
          {"Для Planner название и приоритет приходят из TaskCreate, но id назначает существующий сервис. Форму ответа затем ограничивает TaskRead. Ни одна из этих схем не заменяет save()."}
        </Callout>
      </Section>

      <Section number="02" title={"Как отличить файл от состояния одного процесса"}>
        <Lead>
          {"Список Python можно прочитать повторно, пока жив процесс. Это ещё не доказывает, что данные переживут его завершение."}
        </Lead>

        <p>
          {"В предыдущем курсе мы уже построили JsonStorage с load() и save(). Его назначение здесь не нужно изобретать заново. Нужно проверить, что точка сборки CLI и API выбирает один и тот же путь к файлу."}
        </p>

        <CodeBlock
          caption={"две точки входа, одна настроенная сборка"}
          code={"CLI → build_service() ─┐\n                       ├→ PlannerService → JsonStorage → data/tasks.json\nAPI → build_service() ─┘"}
        />

        <p>
          {"Файл задаёт общее постоянное состояние. Два отдельных процесса не делят переменные Python, но могут последовательно читать и менять один файл через одинаковую настройку."}
        </p>

        <CompareSolutions
          question={"Как проверить, что задача не осталась только в старом объекте Python?"}
          left={{
            title: "Повторно спросить тот же объект",
            code: "service.add_task(...)\nservice.list_tasks()",
            note: "Показывает, что объект видит результат. Не отделяет файл от данных, оставшихся в его памяти.",
          }}
          right={{
            title: "Создать новый service",
            code: "first = build_service()\nfirst.add_task(...)\nsecond = build_service()\nsecond.list_tasks()",
            note: "Проверяет, что новая сборка снова получает данные из настроенного постоянного источника.",
          }}
          preferred="right"
          explanation={"Для доказательства persistence важно пересечь границу объекта или процесса. В проекте новый build_service() должен использовать тот же путь JsonStorage, что и CLI и API."}
        />

        <p>
          {"Путь обычно задаётся в точке сборки приложения. Если он зависит только от текущей папки терминала, одинаковый запуск из разных мест может обратиться к разным файлам. Поэтому проверяйте фактическую настройку в существующем проекте, а не угадывайте её по имени data/tasks.json."}
        </p>

        <TrueFalse
          statement={<span>{"Если новый PlannerService использует тот же настроенный путь JsonStorage, чтение после перезапуска может восстановить сохранённые задачи."}</span>}
          isTrue={true}
          explanation={"Новый объект не хранит старые Python-переменные. Он читает файл по настроенному пути и восстанавливает из него Task."}
        />
      </Section>

      <Section number="03" title={"Сервер назначает id по реальным записям"}>
        <Lead>
          {"Правило id уже появилось в Persistent Planner. Здесь проверим, на какое состояние оно опирается и чего не обещает."}
        </Lead>

        <p>
          {"В текущем Planner следующий id рассчитывается от существующих записей: берётся наибольший сохранённый id и прибавляется единица. Поэтому количество задач и следующий id не всегда связаны."}
        </p>

        <p>{"Предскажите оба результата. В списке три задачи, но значения id идут с пропусками:"}</p>

        <PredictOutput
          code={"ids = [2, 7, 11]\nprint(len(ids) + 1, max(ids) + 1)"}
          output={"4 12"}
          hint={"Сравните число записей с наибольшим уже выданным id."}
        />

        <p>
          {"Правильное значение для действующего правила Planner зависит от максимального id. Расчёт через len() ошибся бы при пропусках. А если удалить запись с максимальным id, правило max(текущих id) + 1 может выдать это число снова. Значит, такой id уникален среди текущих задач, но не является вечным счётчиком истории."}
        </p>

        <CodeBlock
          caption={"клиент сообщает данные, сервис владеет id"}
          code={"TaskCreate: title, priority\nPlannerService: выбирает id по загруженным Task\nTaskRead: возвращает назначенный id"}
        />

        <p>
          {"Клиент не выбирает постоянную идентичность ресурса. Не подставляйте в запрос ожидаемое число вроде 10: фактический id зависит от сохранённых данных проекта."}
        </p>
      </Section>

      <Section number="04" title={"Проверка должна пересечь границу сохранения"}>
        <Lead>
          {"Один удачный ответ показывает то, что API сообщило клиенту. Чтобы проверить состояние, сравним несколько независимых наблюдений."}
        </Lead>

        <LinkedNotes
          items={[
            {
              title: "HTTP",
              description: "POST возвращает 201 и фактический id. GET проверяет, что маршрут читает созданную задачу.",
            },
            {
              title: "CLI",
              description: "Та же задача видна через старый интерфейс, который пользуется тем же Planner.",
            },
            {
              title: "Новый экземпляр",
              description: "После остановки и повторной сборки сервиса данные снова читаются из файла.",
            },
            {
              title: "Тестовый путь",
              description: "pytest использует tmp_path, чтобы проверить persistence и не менять рабочий JSON ученика.",
            },
          ]}
        />

        <p>
          {"Эти проверки отвечают на разные вопросы. 201 проверяет контракт ответа. GET показывает путь чтения API. CLI проверяет общий проектный интерфейс. Новый экземпляр или процесс отделяет постоянный файл от состояния, которое могло остаться в памяти."}
        </p>

        <TrueFalse
          statement={<span>{"Сам по себе статус 201 доказывает, что после перезапуска задача будет прочитана из JSON."}</span>}
          isTrue={false}
          explanation={"201 сообщает клиенту об успешном создании по контракту API. Persistence подтверждается чтением того же файла новым экземпляром или после перезапуска."}
        />
      </Section>

      <Section number="05" title={"Ошибка storage не означает пустой Planner"}>
        <Lead>
          {"Ранее мы различали ошибки входа, предметного поиска и хранения. Важно не смешивать их: у каждой причины своя реакция."}
        </Lead>

        <LinkedNotes
          items={[
            {
              title: "422",
              description: "Неверное тело не прошло TaskCreate. Маршрут не начал создание.",
            },
            {
              title: "404",
              description: "Запрос корректен, но сервис не нашёл задачу с таким id.",
            },
            {
              title: "StorageError",
              description: "Файл нельзя прочитать или восстановить. Это внутренняя проблема данных, не отсутствие задачи.",
            },
          ]}
        />

        <p>
          {"Если повреждённый файл превратить в пустой список, API покажет, будто Planner потерял все задачи. Следующая запись может затереть исходные данные. Ошибку формата нужно оставить заметной и не продолжать создание как будто файл был пуст."}
        </p>

        <BugHunt
          code={"def load_tasks(storage):\n    try:\n        return storage.load()\n    except StorageError:\n        return []"}
          question={"Найдите причину ошибки: почему этот обработчик опасен для существующего Planner?"}
          options={[
            "Он превращает неизвестное состояние файла в пустое и скрывает проблему, из-за чего последующая запись может затереть данные.",
            "StorageError всегда нужно заменять на HTTP 404.",
            "Метод load() не должен возвращать список.",
          ]}
          correctIndex={0}
          explanation={"Отсутствующая задача и невозможность прочитать весь файл имеют разные причины. StorageError нельзя маскировать под пустое состояние или 404."}
        />

        <CodeBlock
          caption={"ответ API не может заменить результат операции"}
          code={"ошибка TaskCreate → 422 до endpoint\nTaskNotFoundError → 404 для одного id\nStorageError → видимая ошибка чтения/записи\nуспешный POST → 201 только после успешного создания"}
        />
      </Section>

      <Section number="06" title={"Границы JSON-файла"}>
        <Lead>
          {"JsonStorage подходит текущему небольшому Planner, но файловый контракт не обещает работу базы данных."}
        </Lead>

        <p>
          {"При последовательной работе CLI и API каждый новый вызов загружает актуальное состояние и сохраняет результат. Именно такой сценарий мы проверим. Одновременные записи уже сложнее: два процесса могут прочитать один снимок, изменить его независимо, а последняя запись затрёт изменение другой."}
        </p>

        <CodeBlock
          caption={"почему две одновременные записи требуют другой защиты"}
          code={"Процесс A: load [1] → добавляет 2 → save [1, 2]\nПроцесс B: load [1] → добавляет 3 → save [1, 3]\n\nИтог при записи B последней: [1, 3]"}
        />

        <p>
          {"JSON-файл не даёт автоматически транзакции и безопасную координацию нескольких писателей. Мы не добавляем блокировки и не заменяем storage базой данных в этом занятии. Для проверки достаточно выполнять действия последовательно."}
        </p>

        <RecallCard
          question={"Два клиента почти одновременно создали задачу, но одна запись пропала. Какую границу следует проверить первой?"}
          hint={"Подумайте, что каждый процесс успел прочитать до своей записи."}
          answer={<p>{"Оба процесса могли загрузить одинаковый старый снимок. Затем каждый сохранил собственный список, и последняя запись затёрла предыдущую. Это ограничение конкурентной работы с одним JSON-файлом."}</p>}
        />
      </Section>

      <Section number="07" title={"Что мы будем делать в практике"}>
        <Lead>
          {"Практика не реализует JsonStorage или алгоритм создания заново. Мы проверим фактические части существующего Planner и добавим изолированное доказательство для файла."}
        </Lead>

        <LinkedNotes
          variant="connected"
          items={[
            {
              title: "Проследить",
              description: "Найдём настройку общего пути и путь POST через add_task до JsonStorage.save().",
            },
            {
              title: "Проверить",
              description: "Создадим две задачи запросом и сопоставим фактические id в API и CLI после перезапуска.",
            },
            {
              title: "Защитить",
              description: "Добавим тест на новый PlannerService с тем же временным JSON и проверим правило id при пропусках.",
            },
            {
              title: "Не скрыть",
              description: "Проверим, что повреждённый файл остаётся StorageError и не превращается в пустой Planner.",
            },
          ]}
        />

        <p>
          {"Результат этой работы: API и CLI читают одни сохранённые задачи, идентификаторы принадлежат сервису, а тесты проверяют persistence на временном файле, не на пользовательских данных."}
        </p>

        <KeyTakeaways
          points={[
            <>{"TaskCreate проверяет вход, PlannerService выполняет создание, JsonStorage сохраняет Task, а TaskRead задаёт HTTP-ответ."}</>,
            <>{"Новый экземпляр на том же настроенном пути проверяет, что данные пережили прежний объект и процесс."}</>,
            <>{"Следующий id зависит от сохранённых id, а не от числа записей или догадки клиента."}</>,
            <>{"Повреждённое хранилище нельзя выдавать за пустой список или отсутствие одной задачи."}</>,
            <>{"JSON подходит текущему последовательному сценарию, но сам не решает конкурентную запись."}</>,
          ]}
        />
      </Section>
    </RichLesson>
  );
}


// 60. Единый PlannerService для CLI и API
export function Lesson60({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero variant="project" chip={module ?? BLOCK_TITLE}
        title={"60. Единый PlannerService для CLI и API"}
        intro={"CLI и HTTP уже работают с одним Persistent Planner. Разберём, почему у них разные входы и ответы, но одно место для правил, данных и ошибок."}
        tags={[
          { icon: <Boxes size={14} />, label: "одно прикладное ядро" },
          { icon: <ShieldCheck size={14} />, label: "регрессия сервиса" },
        ]}
      />
      <Section number="00" title={"Один Planner, два способа обратиться"}>
        <LinkedNotes variant="connected" items={[
          { title: "Прежняя опора", description: "В предыдущем занятии POST, API и CLI проверялись на общем JsonStorage. Task и PlannerService уже выполняют предметную работу." },
          { title: "Новый вопрос", description: "Как не получить два набора правил, если к CLI добавился HTTP-интерфейс?" },
          { title: "Результат", description: "Сверим границы API, CLI, PlannerService и JsonStorage и закрепим их сервисными проверками." },
        ]} />
        <p>{"CLI принимает текстовую команду, API принимает HTTP-запрос. Это разные двери в Planner. Но за обеими должны оставаться одни правила: как получить задачи, посчитать статистику и сообщить об отсутствии id."}</p>
      </Section>

      <Section number="01" title={"Два интерфейса, одно ядро"}>
        <Lead>{"Каждый процесс создаёт свой объект сервиса. Это нормально: важно, чтобы сборка каждого объекта настроила JsonStorage на тот же файл."}</Lead>
        <p>{"Проследите две точки входа. Они не передают друг другу Python-объект, но обе используют знакомый PlannerService."}</p>
        <StepThrough
          code={"# CLI\ncli_planner = build_service()\ncli_tasks = cli_planner.list_tasks()\n\n# API при сборке приложения\napp.state.planner = build_service()\n\n# HTTP-обработчик\napi_tasks = app.state.planner.list_tasks()"}
          steps={[
            { line: 1, note: "CLI собирает сервис для команды. build_service выбирает настроенный JsonStorage.", vars: { cli_planner: "PlannerService → общий путь JSON" } },
            { line: 5, note: "API собирает отдельный объект сервиса. Путь хранилища остаётся общим.", vars: { planner: "PlannerService → тот же путь JSON" } },
            { line: 8, note: "Обработчик передаёт работу сервису. Он не открывает файл и не хранит копию списка.", vars: { api_tasks: "актуальные Task из PlannerService" } },
          ]}
        />
        <p>{"Общий источник не означает один глобальный объект в памяти. CLI и сервер обычно живут в разных процессах. Связь обеспечивает постоянный файл, а общие операции предоставляет PlannerService."}</p>
        <TrueFalse statement={<span>{"CLI и API обязаны пользоваться одним объектом PlannerService в памяти, чтобы видеть одни данные."}</span>}
          isTrue={false}
          explanation={"Процессы имеют отдельные объекты. Им достаточно собирать сервис с одинаковой настройкой JsonStorage и вызывать одни правила Planner."}
        />
      </Section>

      <Section number="02" title={"Кто за что отвечает"}>
        <Lead>{"Разделение полезно не ради количества файлов. Оно позволяет менять HTTP-ответ, не переписывая работу Planner, а хранение менять без обучения CLI читать JSON."}</Lead>
        <p>{"У этих частей разные задачи. Сопоставьте ответственность с компонентом."}</p>
        <LinkedNotes items={[
          { title: "API", description: "Принимает HTTP, использует схемы и выбирает внешний статус и формат ответа." },
          { title: "PlannerService", description: "Выполняет правила приложения и возвращает доменный результат." },
          { title: "JsonStorage", description: "Читает и сохраняет Task в настроенном файле." },
          { title: "build_service", description: "Собирает объекты и связывает сервис с хранилищем." },
        ]} />
        <MatchPairs prompt={"Сопоставьте ситуацию с компонентом, который отвечает за неё."}
          leftTitle={"Ситуация"} rightTitle={"Компонент"}
          pairs={[
            { left: "Проверить тип query до endpoint", right: "FastAPI на HTTP-границе" },
            { left: "Выполнить предметный поиск", right: "PlannerService" },
            { left: "Записать Task в JSON", right: "JsonStorage" },
            { left: "Выбрать общий путь данных", right: "build_service" },
          ]}
          explanation={"Интерфейс проверяет HTTP-вход, сервис выполняет правила, storage сохраняет данные, а build_service связывает эти части."}
        />
        <p>{"Сначала проверьте существующий код и меняйте только обнаруженное дублирование. Новый универсальный слой не нужен."}</p>
      </Section>

      <Section number="03" title={"Сервис не должен зависеть от FastAPI"}>
        <Lead>{"PlannerService можно проверить обычным pytest без запуска Uvicorn. Для этого сервис не должен импортировать HTTP-схемы или выбирать статус ответа."}</Lead>
        <p>{"Сравните варианты. Какой оставляет правила доступными CLI и API?"}</p>
        <CompareSolutions question={"Где должны жить поиск задачи и работа с хранилищем?"}
          left={{
            title: "Правило внутри endpoint",
            code: "with open('data/tasks.json') as file:\ntasks = json.load(file)\n\n# поиск повторяется здесь",
            note: "API обходит PlannerService и создаёт второй путь к данным.",
          }}
          right={{
            title: "Endpoint вызывает сервис",
            code: "@app.get('/tasks/{task_id}', response_model=TaskRead)\ndef get_task(task_id: int):\n    return app.state.planner.get_task(task_id)",
            note: "Поиск остаётся в сервисе, HTTP отвечает за проекцию и статус.",
          }}
          preferred="right"
          explanation={"Сервис использует доменную Task и зависимость хранения. FastAPI ему не нужен. Вызовы идут от интерфейса к ядру, а не наоборот."}
        />
        <p>{"Новый слой не требуется. Сервис можно вызвать из CLI и теста без HTTP-запроса."}</p>
        <p>{"В примере показан успешный путь item-маршрута. Рабочий endpoint отдельно переводит ожидаемое отсутствие в 404, но не скрывает StorageError."}</p>
      </Section>

      <Section number="04" title={"Выборка не становится новым состоянием"}>
        <Lead>{"select_tasks уже добавлен при работе с query-параметрами. Сейчас проверим его роль рядом с полным list_tasks и статистикой всего Planner."}</Lead>
        <p>{"Фильтр, сортировка и limit готовят представление для ответа. Они не удаляют задачи из файла и не сужают данные для статистики."}</p>
        <PredictOutput
          code={'tasks = [{"id": 2, "is_done": False},\n         {"id": 7, "is_done": True},\n         {"id": 11, "is_done": False}]\nselected = sorted(\n    (task for task in tasks if task["is_done"] is False),\n    key=lambda task: task["id"], reverse=True,\n)[:1]\nprint([task["id"] for task in selected])\nprint([task["id"] for task in tasks])'}
          output={"[11]\n[2, 7, 11]"}
          hint={"Сначала отберите незавершённые задачи, затем отсортируйте по убыванию и возьмите одну. Посмотрите отдельно на исходный список."}
        />
        <p>{"Выборка содержит один id, полный список остался прежним. Поэтому get_statistics считает весь проект, а не результат последнего GET. Явный False является фильтром; отсутствие фильтра обозначается None."}</p>
        <TrueFalse statement={<span>{"Если GET /tasks отфильтровал список до одной записи, get_statistics должен посчитать только её."}</span>}
          isTrue={false}
          explanation={"Выборка не меняет источник. Статистика относится ко всему состоянию Planner и сохраняет контракт all/open/done."}
        />
      </Section>

      <Section number="05" title={"Три ошибки, три причины"}>
        <Lead>{"HTTP-граница переводит ожидаемые ошибки в ответы. Если ловить всё подряд, сбой чтения файла может притвориться отсутствующей задачей."}</Lead>
        <p>{"Найдите причину ошибки. Повреждённый JSON означает, что Planner не прочитал состояние, а не то, что одного id нет."}</p>
        <BugHunt
          code={"try:\n    task = app.state.planner.get_task(task_id)\nexcept Exception:\n    raise HTTPException(404, 'Task not found')"}
          question={"Почему этот обработчик может скрыть серьёзную проблему?"}
          options={[
            "Он превращает любую ошибку, включая StorageError, в 404",
            "FastAPI запрещает try/except в endpoint",
            "404 всегда означает ошибку самого HTTP-сервера",
          ]}
          correctIndex={0}
          explanation={"404 уместен для отсутствующего Task. StorageError означает, что сервис не прочитал данные. Его нельзя выдавать за отсутствие записи или пустой список."}
          fix={"try:\n    task = app.state.planner.get_task(task_id)\nexcept TaskNotFoundError:\n    raise HTTPException(404, 'Task not found')"}
        />
        <LinkedNotes items={[
          { title: "TaskNotFoundError", description: "Сервис не нашёл запись; HTTP может ответить 404." },
          { title: "ValueError", description: "Значение не прошло правило Planner; интерфейс переводит только ожидаемый отказ." },
          { title: "StorageError", description: "Хранилище не прочитало или не записало данные; это не пустой результат." },
        ]} />
        <p>{"FastAPI отклоняет неверный тип или границы query до входа в маршрут. Это отличается от отсутствующего Task и сбоя хранилища."}</p>
      </Section>

      <Section number="06" title={"Сервисные тесты проверяют ядро отдельно"}>
        <Lead>{"Тест PlannerService не обязан запускать сервер. Временный JSON через tmp_path позволяет проверить его договор, не меняя рабочий файл."}</Lead>
        <p>{"Восстановите порядок регрессии: подготовьте состояние, вызовите операцию, проверьте ответ и источник."}</p>
        <CodeSequence title={"Порядок регрессионной проверки"}
          prompt={"Расположите шаги так, чтобы тест доказал результат выборки и сохранность Planner."}
          pieces={[
            { id: "seed", code: "сохранить три Task в JsonStorage(tmp_path)" },
            { id: "service", code: "создать PlannerService для этого JsonStorage" },
            { id: "select", code: "выбрать задачи, отсортировать и ограничить список" },
            { id: "assert", code: "проверить выборку, полный list_tasks, stats и содержимое файла" },
          ]}
          correctOrder={["seed", "service", "select", "assert"]}
          explanation={"Изолированный файл делает тест повторяемым. Полный список и stats обнаружат, если выборка стала новым состоянием."}
        />
        <p>{"Сервисные тесты проверяют предметное ядро без маршрутизации. Короткая сквозная проверка подтвердит, что CLI и API согласованы, хотя HTTP возвращает свою проекцию."}</p>
        <RecallCard question={"Почему для теста PlannerService не требуется запускать Uvicorn?"}
          hint={"Отделите предметную операцию от HTTP-входа и статуса ответа."}
          answer={<p>{"Тест создаёт сервис с временным JsonStorage и вызывает методы напрямую. Он проверяет правило Planner, а не HTTP-маршрут."}</p>}
        />
      </Section>

      <Section number="07" title={"Что мы будем делать в практике"}>
        <Lead>{"Практика закрепит общее ядро на реальном проекте. Мы не напишем второй CRUD и не добавим новое хранилище."}</Lead>
        <p>{"Сначала проследим, как CLI и API собирают PlannerService. Затем добавим изолированную регрессию для select_tasks, list_tasks, stats и ошибок. В конце сверим CLI и HTTP на текущих данных."}</p>
        <LinkedNotes variant="connected" items={[
          { title: "Проверьте сборку", description: "Убедитесь, что интерфейсы получают сервис через build_service и общий путь JsonStorage." },
          { title: "Закрепите договор", description: "Проверьте выборку, полный список, общую статистику и ожидаемую ошибку в pytest." },
          { title: "Сверьте поверхности", description: "Сравните CLI и API, учитывая HTTP-проекцию и ограниченный список." },
        ]} />
        <Callout tone="info">{"Результат: одно прикладное ядро обслуживает оба интерфейса, а выборка не меняет сохранённый Planner."}</Callout>
        <PracticeCta text={"Проверьте единый PlannerService, добавьте регрессионные сервисные тесты и сверьте ответы с реальным JSON."} />
      </Section>

      <KeyTakeaways points={[
        <>{"CLI и API могут иметь отдельные объекты сервиса, но используют один путь Planner."}</>,
        <>{"Правила принадлежат PlannerService, HTTP задаёт внешний формат и статус."}</>,
        <>{"select_tasks готовит выборку, но не заменяет полный список или JSON."}</>,
        <>{"Статистика относится ко всему состоянию проекта."}</>,
        <>{"Сервисные тесты работают на tmp_path, а не на пользовательском файле."}</>,
      ]} />
    </RichLesson>
  );
}

// 61. PUT и PATCH: полная и частичная замена
export function Lesson61({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"PUT и PATCH: полная и частичная замена"}
        intro={"Создание и чтение уже работают с настоящими задачами Planner. Теперь научимся менять найденную задачу, не теряя её идентичность и сохранённые данные."}
        tags={[
          { icon: <Scale size={14} />, label: "PUT против PATCH" },
          { icon: <Wrench size={14} />, label: "обновление ресурса" },
        ]}
      />
      <Section number="00" title={"От чтения к изменению"}>
        <LinkedNotes variant="connected" items={[
          { title: "Прежняя опора", description: "Planner уже создаёт и читает Task через API, PlannerService и общий JsonStorage." },
          { title: "Новый вопрос", description: "Как изменить одну сохранённую задачу, не создать дубликат и не потерять её внутренние данные?" },
          { title: "Результат", description: "PUT заменит все редактируемые поля, а PATCH изменит только выбранные." },
        ]} />
        <p>{"В предыдущем занятии мы проверяли, что CLI и API обращаются к одному Planner. Здесь продолжим тот же путь: найдём Task, построим её новое состояние и сохраним его через уже существующие слои. Временный список для примеров не создаём."}</p>
      </Section>

      <Section number="01" title={"Полная замена и точечная поправка"}>
        <Lead>{"Представьте карточку бронирования. Если клиент меняет все доступные ему поля, он отправляет полный набор. Если переносит только дату, он присылает одну поправку."}</Lead>
        <p>{"В HTTP это разные договорённости. PUT получает полное представление редактируемых данных. Если забыть обязательное поле, сервер не должен угадывать, оставить ли старое значение или заменить его пустым. PATCH получает только поля, которые клиент хочет изменить. Остальные значения остаются прежними."}</p>
        <CompareSolutions question={"Клиент меняет только дату бронирования. Какое тело соответствует частичному изменению?"}
          left={{
            title: "Отправить только новое значение",
            code: 'PATCH /bookings/18\n{"date": "2026-10-12"}',
            note: "Сервер понимает, что остальные поля не просили менять.",
          }}
          right={{
            title: "Отправить пустые значения вместо пропусков",
            code: 'PATCH /bookings/18\n{"date": "2026-10-12", "guest": "", "room": 0}',
            note: "Пустые значения выглядят как реальные изменения, а не как отсутствие полей.",
          }}
          preferred="left"
          explanation={"PATCH сообщает намерение изменить перечисленные поля. Пропуск здесь имеет смысл, поэтому серверу нужно отличать его от пустой строки, нуля или False."}
        />
        <p>{"Короткое тело само по себе не делает запрос PATCH. Важны HTTP-метод и его договорённость. PUT в нашем Planner заменит весь редактируемый набор title, priority и is_done. PATCH изменит только переданные значения из этого набора."}</p>
      </Section>

      <Section number="02" title={"Что именно можно заменить у Task"}>
        <Lead>{"HTTP-клиент меняет публичные свойства задачи, но не переписывает всю доменную модель."}</Lead>
        <p>{"У ресурса есть постоянная идентичность. В запросе к конкретной задаче она находится в адресе, например /tasks/18. Клиент может заменить title, priority и is_done. Существующий id остаётся тем же. Внутренние tags тоже сохраняются, потому что это занятие не даёт клиенту права переписывать их."}</p>
        <LinkedNotes items={[
          { title: "Адрес", description: "task_id выбирает существующую Task и не входит в JSON-тело обновления." },
          { title: "Редактируемая часть", description: "title, priority и is_done принимаются от клиента и проходят знакомую валидацию." },
          { title: "Состояние Planner", description: "id и tags остаются у прежней доменной Task и переживают обновление." },
        ]} />
        <p>{"Это похоже на редактирование профиля: форма позволяет поменять имя и настройки, но не должна выдавать пользователю управление внутренним номером записи. На API-границе работает TaskUpdate или TaskPatch, а PlannerService продолжает возвращать полноценный Task. TaskRead формирует уже знакомый публичный ответ."}</p>
        <TrueFalse
          statement={<span>{"Если PUT получил все три редактируемых поля, сервис должен заменить также id и tags."}</span>}
          isTrue={false}
          explanation={"Полный здесь означает все поля формы обновления, а не каждое поле доменной Task. Идентичность и tags сохраняются из найденного объекта."}
        />
      </Section>

      <Section number="03" title={"Две схемы описывают два намерения"}>
        <Lead>{"Схема входа заранее задаёт, какое обещание дал клиент: полный набор для PUT или отдельные изменения для PATCH."}</Lead>
        <p>{"TaskUpdate требует title, priority и is_done. Если одно поле пропущено, Pydantic остановит запрос с 422 до вызова сервиса. TaskPatch делает каждое редактируемое поле необязательным. Само значение при этом всё равно проверяется: переданный priority вне диапазона не становится допустимым только потому, что тело частичное."}</p>
        <CodeBlock caption={"условные схемы бронирования"} code={'from pydantic import BaseModel\n\nclass BookingUpdate(BaseModel):\n    date: str\n    guest_count: int\n    confirmed: bool\n\nclass BookingPatch(BaseModel):\n    date: str | None = None\n    guest_count: int | None = None\n    confirmed: bool | None = None'} />
        <p>{"Тип с None означает, что поле может отсутствовать или явно прийти как null. Для нашего договора null тоже означает «оставить как было». Это не способ очистить title или priority. Если продукту когда-нибудь понадобится очистка поля, это будет отдельное решение контракта."}</p>
        <p>{"Посмотрим на независимую модель настроек. Она помогает увидеть разницу между значением по умолчанию и тем, что человек действительно отправил."}</p>
        <StepThrough
          code={'from pydantic import BaseModel\n\nclass AlertsPatch(BaseModel):\n    email: bool | None = None\n    sms: bool | None = None\n\npatch = AlertsPatch(email=False)\nchanges = patch.model_dump(exclude_unset=True, exclude_none=True)'}
          steps={[
            { line: 6, note: "Клиент явно прислал email=False. Это команда выключить письма, а не пропуск поля.", vars: { email: "False, явно передано" } },
            { line: 7, note: "exclude_unset=True оставляет поля, которые были в исходном теле.", vars: { changes: "пока {'email': False}" } },
            { line: 7, note: "exclude_none=True убирает null по выбранному правилу. False не является None и остаётся.", vars: { changes: "{'email': False}" } },
          ]}
        />
        <Callout tone="info">{"Так же должен сохраниться PATCH is_done=false. Проверяйте присутствие значения, а не его истинность."}</Callout>
      </Section>

      <Section number="04" title={"Отсутствие, null и False не одно и то же"}>
        <Lead>{"Для частичного обновления важно не только значение, но и то, передавал ли его клиент."}</Lead>
        <p>{"Без параметров model_dump Pydantic может включить в словарь поля со значениями по умолчанию. Для PATCH это опасно: сервер тогда решит, что клиент попросил заменить сразу всё. exclude_unset=True сохраняет только явно переданные поля. exclude_none=True убирает явные null, потому что в нашем договоре они означают «не менять»."}</p>
        <p>{"Почему не exclude_defaults? Он сравнивает данные со значениями по умолчанию, а нам важно знать, присутствовало ли поле во входном запросе. Например, если default когда-нибудь станет False, явно переданный False нельзя будет выбросить как будто его не присылали."}</p>
        <PredictOutput
          code={'from pydantic import BaseModel\n\nclass FlagsPatch(BaseModel):\n    active: bool | None = None\n    title: str | None = None\n\nprint(FlagsPatch(active=False).model_dump(exclude_unset=True, exclude_none=True))\nprint(FlagsPatch(title=None).model_dump(exclude_unset=True, exclude_none=True))\nprint(FlagsPatch().model_dump(exclude_unset=True, exclude_none=True))'}
          output={"{'active': False}\n{}\n{}"}
          hint={"В первом теле поле передано со значением False. Во втором оно передано как null. В третьем поля вообще нет."}
        />
        <p>{"В выбранном контракте null и пропуск в итоге дают одинаковое изменение: никакое. Но это разные входы, и правило явно закреплено через обе настройки. PATCH с JSON-телом {} тоже оставляет Task прежней."}</p>
        <TrueFalse
          statement={<span>{"Условие if payload.is_done добавит is_done в изменения, когда клиент отправит false."}</span>}
          isTrue={false}
          explanation={"False является допустимым значением, но условие сочтёт его ложным. Проверяйте присутствие поля или используйте значение None как признак отсутствия после валидации."}
        />
      </Section>

      <Section number="05" title={"PlannerService меняет Task и сохраняет её"}>
        <Lead>{"Схема проверяет HTTP-вход, но не сохраняет Planner. Это по-прежнему ответственность существующего сервиса и JsonStorage."}</Lead>
        <p>{"Операция обновления читает сохранённый список, находит Task по id, строит новую корректную версию, заменяет элемент и сохраняет список. Для PUT новые title, priority и is_done берутся из полного тела. Для PATCH они накладываются на старые значения, а неотправленные поля остаются прежними."}</p>
        <p>{"Важно сначала построить Task и пройти её предметные проверки, а затем заменить запись и один раз вызвать save. Если новое значение нарушит правило модели, файл не должен получить наполовину обновлённую задачу. При создании новой версии перенесите из исходной Task её id и копию tags."}</p>
        <BugHunt
          code={'current.title = title\nstorage.save(tasks)\ncurrent.priority = priority\ncurrent.is_done = is_done'}
          question={"Найдите причину ошибки: что останется в JSON, если проверка priority завершится исключением после сохранения?"}
          options={[
            "Файл уже содержит частично обновлённую задачу",
            "JsonStorage автоматически откатит предыдущую запись",
            "TaskNotFoundError заменит ошибку проверки",
          ]}
          correctIndex={0}
          explanation={"save уже записал изменения title. Следующее действие может не выполниться, поэтому файл и объект окажутся в промежуточном состоянии. Сначала создайте и проверьте новую Task, затем замените элемент списка и сохраните один раз."}
          fix={'updated = Task(\n    id=current.id,\n    title=new_title,\n    priority=new_priority,\n    is_done=new_is_done,\n    tags=current.tags.copy(),\n)\ntasks[index] = updated\nstorage.save(tasks)'}
        />
        <p>{"Сервис не импортирует FastAPI и не выбирает 200, 404 или 422. Он знает Task, правила Planner и storage. Благодаря этому те же изменения доступны и API, и другим интерфейсам."}</p>
      </Section>

      <Section number="06" title={"HTTP связывает контракты с сервисом"}>
        <Lead>{"Оба маршрута работают с одним ресурсом и одним публичным ответом, но принимают разные схемы."}</Lead>
        <CodeBlock caption={"направление вызовов"} code={'PUT /tasks/{task_id} + TaskUpdate\n    → PlannerService.replace_task(...)\n    → TaskRead\n\nPATCH /tasks/{task_id} + TaskPatch\n    → только явно присланные поля\n    → PlannerService.patch_task(...)\n    → TaskRead'} />
        <p>{"Сервис возвращает полноценную доменную Task, а response_model=TaskRead формирует внешний ответ. Обработчик не открывает JSON и не создаёт новый список. Если сервис сообщает TaskNotFoundError, HTTP-граница превращает именно это ожидаемое отсутствие в 404. Неверное тело отсеивается раньше с 422. Ошибка чтения или записи файла не должна маскироваться как 404."}</p>
        <p>{"Сопоставьте ситуации с тем, где принимается решение. Эти ответы возникают на разных участках одного запроса."}</p>
        <LinkedNotes items={[
          { title: "422", description: "Pydantic не принял тело или FastAPI не смог преобразовать path-параметр." },
          { title: "404", description: "Корректный запрос дошёл до PlannerService, но задачи с таким id нет." },
          { title: "Ошибка storage", description: "Сервис не смог прочитать или сохранить JSON; это не отсутствие Task." },
        ]} />
        <Callout tone="info">{"Создание выполняется только через POST. PUT и PATCH не создают запись, если id отсутствует. Это обновления, не upsert."}</Callout>
      </Section>

      <Section number="07" title={"Что мы будем делать в практике"}>
        <Lead>{"Добавим два способа обновить существующую задачу в том же Planner и докажем, что изменения переживают новое чтение."}</Lead>
        <p>{"Сначала зададим входные схемы в существующем schemas.py. Затем добавим replace_task и patch_task в текущий PlannerService и подключим маршруты к нему. В конце проверим не только ответ API, но также id, tags, статистику и фактически сохранённый JSON."}</p>
        <LinkedNotes variant="connected" items={[
          { title: "Опишите намерение", description: "Полный TaskUpdate для PUT и частичный TaskPatch для PATCH." },
          { title: "Обновите общее состояние", description: "Проверенная новая Task заменяет найденную и сохраняется существующим JsonStorage." },
          { title: "Докажите договор", description: "GET, CLI и новое чтение подтверждают результат; 422 и 404 не добавляют запись." },
        ]} />
        <p>{"Успех здесь не равен красивому HTTP-ответу. Новый PlannerService для того же JSON должен прочитать изменённые поля, прежний id и tags. PATCH с is_done=false должен вернуть задачу в открытые и отразиться в общей статистике. Ошибка валидации или неизвестный id не меняют файл."}</p>
        <Callout tone="info">{"За пределами занятия остаются удаление, новые хранилища и отдельный CRUD. Следующий шаг подключит к этому же сервису уже существующее удаление."}</Callout>
        <PracticeCta text={"Добавьте PUT и PATCH в существующий Planner, затем проверьте обновлённые задачи через JSON, GET и CLI."} />
      </Section>

      <KeyTakeaways points={[
        <>{"PUT заменяет весь редактируемый набор; PATCH только явно заданные поля."}</>,
        <>{"id и tags сохраняются, хотя PUT получает полный TaskUpdate."}</>,
        <>{"exclude_unset отличает переданное поле от пропущенного, а exclude_none задаёт смысл null."}</>,
        <>{"False является изменением и не должно теряться при проверке условия."}</>,
        <>{"PlannerService строит корректную Task и сохраняет её через общий JsonStorage."}</>,
        <>{"404 означает отсутствующий ресурс, 422 означает неверный запрос; обновление не создаёт новую запись."}</>,
      ]} />
    </RichLesson>
  );
}

// 62. DELETE, 204 и HTTPException
export function Lesson62({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"DELETE, 204 и HTTPException"}
        intro={"PUT и PATCH уже меняют существующую задачу. Теперь подключим к тому же Planner удаление и проверим, что ответ, JSON и последующее чтение согласованы."}
        tags={[
          { icon: <ListChecks size={14} />, label: "удаление ресурса" },
          { icon: <ShieldCheck size={14} />, label: "204 без тела" },
        ]}
      />

      <Section number="00" title={"От изменения к удалению"}>
        <LinkedNotes variant="connected" items={[
          { title: "Прежняя опора", description: "CLI и API создают, читают и обновляют Task через PlannerService и общий JsonStorage." },
          { title: "Новый вопрос", description: "Как подтвердить удаление, если после него серверу нечего возвращать в теле ответа?" },
          { title: "Результат", description: "DELETE вызовет готовый сервис, сохранит отсутствие Task и ответит пустым 204." },
        ]} />
        <p>{"В предыдущем занятии мы меняли поля найденной задачи. В этом занятии меняется её существование в Planner. Мы не пишем новое удаление: оно уже работает для CLI. Добавим только HTTP-маршрут к той же операции и проверим сохранённое состояние."}</p>
      </Section>

      <Section number="01" title={"Удаляем ресурс, а не позицию в списке"}>
        <Lead>{"Запрос DELETE указывает на конкретную задачу через её id. Сервис уже знает, как найти её, удалить и сохранить оставшиеся Task."}</Lead>
        <p>{"Это важно, потому что id и позиция элемента не совпадают. После удаления список сдвигается, а id других задач остаются прежними. API не должен открывать JSON или придумывать отдельный алгоритм. Он передаёт id существующему PlannerService."}</p>
        <CompareSolutions question={"Где должен выполняться поиск и удаление задачи?"}
          left={{
            title: "Через существующий сервис",
            code: "app.state.planner.delete_task(task_id)",
            note: "Сохраняются правила Planner и общий путь JsonStorage.",
          }}
          right={{
            title: "Повторить в endpoint",
            code: "open JSON → найти позицию → удалить запись",
            note: "Появляется второй путь к данным и дублируется готовая операция.",
          }}
          preferred="left"
          explanation={"Маршрут отвечает за HTTP, а PlannerService уже выполняет удаление и обращается к storage. Повторная работа с файлом в API может разойтись с CLI."}
        />
        <p>{"Сравните это с выдачей книги в библиотеке. Запрос указывает номер книги, а не номер строки на экране. Сервис находит нужную запись и выполняет операцию над ней. Если записи нет, он сообщает об этом через уже знакомый TaskNotFoundError."}</p>
      </Section>

      <Section number="02" title={"Ожидаемое отсутствие и настоящая ошибка"}>
        <Lead>{"HTTPException позволяет endpoint закончить запрос ожидаемым HTTP-ответом. Переводить нужно только ту ошибку, смысл которой понятен клиенту."}</Lead>
        <p>{"Если адрес содержит текст вместо целого task_id, FastAPI отклоняет path до вызова маршрута и возвращает 422. Если id корректен, но задачи нет, PlannerService поднимает TaskNotFoundError. Endpoint переводит его в 404. Ошибка чтения или записи JSON не означает, что задача отсутствует."}</p>
        <p>{"Найдите ошибку в обработчике. Он превращает в 404 любую проблему, включая сбой хранилища или ошибку в программе."}</p>
        <BugHunt
          code={"try:\n    app.state.planner.delete_task(task_id)\nexcept Exception:\n    raise HTTPException(status_code=404, detail=\"Task not found\")"}
          question={"Почему этот обработчик может сообщить клиенту неверную причину отказа?"}
          options={[
            "Он маскирует все исключения под отсутствие задачи",
            "FastAPI запрещает удалять через сервис",
            "404 автоматически отменяет запись JSON",
          ]}
          correctIndex={0}
          explanation={"TaskNotFoundError означает отсутствие конкретного id. StorageError означает проблему с сохранением или чтением. Если поймать Exception, клиент и журнал потеряют это различие. Перехватывайте только ожидаемое TaskNotFoundError."}
          fix={"try:\n    app.state.planner.delete_task(task_id)\nexcept TaskNotFoundError:\n    raise HTTPException(status_code=404, detail=\"Task not found\")"}
        />
        <p>{"Неверный path не доходит до try, потому что проверку типа выполняет FastAPI раньше. Ошибка storage остаётся заметной серверной ошибкой, а не притворяется успешным удалением или 404."}</p>
        <LinkedNotes items={[
          { title: "422", description: "Path не преобразовался в int; операция удаления не запускалась." },
          { title: "404", description: "Path корректен, но PlannerService не нашёл такую Task." },
          { title: "Сбой storage", description: "JSON не удалось прочитать или сохранить; это не отсутствие задачи." },
        ]} />
      </Section>

      <Section number="03" title={"204 сообщает об успехе без представления"}>
        <Lead>{"После успешного удаления клиенту не нужно присылать копию уже удалённой задачи. Для этого DELETE отвечает 204 No Content."}</Lead>
        <p>{"204 относится к успешным ответам, но у него нет тела. Поэтому маршрут не возвращает TaskRead, JSON-объект и даже JSON null. Он возвращает пустой Response со статусом 204. Клиент проверяет код и не вызывает json() для этого ответа."}</p>
        <p>{"Ниже фрагмент независимого endpoint для отмены бронирования. Сервисная операция в нём уже существует; пример показывает только границу HTTP."}</p>
        <CodeBlock caption={"фрагмент маршрута"} code={"@app.delete(\n    \"/bookings/{booking_id}\",\n    status_code=204,\n)\ndef cancel_booking(booking_id: int):\n    try:\n        booking_service.cancel(booking_id)\n    except BookingNotFoundError:\n        raise HTTPException(status_code=404)\n    return Response(status_code=204)"} />
        <p>{"Успешный ответ здесь не доказывает сохранение сам по себе. 204 говорит, что запрос выполнен по HTTP-контракту. Последующий GET, CLI или новое чтение JSON покажут, исчезла ли запись на самом деле."}</p>
        <TrueFalse
          statement={<span>{"После DELETE со статусом 204 клиент должен разобрать JSON и взять из него удалённую Task."}</span>}
          isTrue={false}
          explanation={"У 204 нет тела. Клиент проверяет статус и пустое содержимое, а затем при необходимости отдельно перечитывает список или ресурс."}
        />
        <CompareSolutions question={"Как вернуть успешный DELETE без противоречия между статусом и ответом?"}
          left={{
            title: "Вернуть удалённую модель",
            code: "return TaskRead.model_validate(deleted_task)",
            note: "Тело ответа конфликтует с договором 204 No Content.",
          }}
          right={{
            title: "Вернуть пустой Response",
            code: "return Response(status_code=204)",
            note: "HTTP подтверждает действие и не добавляет JSON-тело.",
          }}
          preferred="right"
          explanation={"Если клиенту нужен объект в теле, следует выбрать другой успешный статус и контракт ответа. В этом занятии мы сохраняем 204 и не возвращаем содержимое."}
        />
      </Section>

      <Section number="04" title={"Путь запроса до сохранённого удаления"}>
        <Lead>{"Проследим одну операцию целиком, чтобы отделить HTTP-маршрут от уже готовой работы PlannerService."}</Lead>
        <p>{"Расположите шаги по пути одного DELETE. В нём сначала определяется цель, затем срабатывает прикладная операция, и только после её успеха отправляется пустой ответ."}</p>
        <CodeSequence
          title={"Последовательность DELETE"}
          prompt={"Соберите путь запроса от адреса до ответа."}
          pieces={[
            { id: "request", code: "DELETE /tasks/{task_id} приходит в API" },
            { id: "path", code: "FastAPI преобразует task_id и проверяет его тип" },
            { id: "service", code: "app.state.planner.delete_task(task_id) удаляет и сохраняет Task" },
            { id: "response", code: "API возвращает Response со статусом 204 и пустым телом" },
          ]}
          correctOrder={["request", "path", "service", "response"]}
          explanation={"FastAPI проверяет тип path до вызова endpoint. Сервис удаляет задачу в общем Planner и сохраняет оставшийся список. Только успешное завершение операции ведёт к ответу 204."}
        />
        <p>{"Если сервис поднимает TaskNotFoundError, нормальный путь прерывается и endpoint отвечает 404. Если ошибка возникает во время сохранения, её нельзя заменять на 204: иначе клиенту сообщат об успехе, хотя постоянное состояние не подтверждено."}</p>
      </Section>

      <Section number="05" title={"Повторный запрос не возвращает удалённую запись"}>
        <Lead>{"Важно проверять не только первый ответ, но и состояние после него."}</Lead>
        <p>{"После первого DELETE сервис сохраняет список без задачи. Новый GET по этому id и повторный DELETE получают 404. HTTP-ответы разные: первая операция удалила существующий ресурс, следующая уже не находит его. При этом желаемый эффект повторяется: задачи с этим id в Planner нет."}</p>
        <LinkedNotes variant="connected" items={[
          { title: "Первый DELETE", description: "Задача существовала, сервис удалил её и сохранил список; ответ 204 пустой." },
          { title: "Повторное обращение", description: "Новая операция находит уже отсутствующий id; GET и DELETE отвечают 404." },
          { title: "Постоянное состояние", description: "Свежий load подтверждает отсутствие; остальные задачи и их tags остаются на месте." },
        ]} />
        <p>{"Не создавайте новую задачу между проверками отсутствующего id. Генератор может повторно выдать удалённый максимальный id, и GET тогда найдёт уже другую запись. Сверяйте stats с фактическим начальным состоянием: удаление открытой или завершённой Task меняет разные счётчики."}</p>
        <p>{"Повторный запрос не обязан возвращать тот же статус, чтобы состояние оставалось удалённым. Важно, что он не создаёт запись заново и не удаляет соседнюю задачу."}</p>
      </Section>

      <Section number="06" title={"Как проверить, что удалился именно этот Task"}>
        <Lead>{"Ответ 204 и содержимое файла отвечают на разные вопросы, поэтому проверьте оба."}</Lead>
        <p>{"Сначала выберите фактический id задачи, созданной через POST. После PUT или PATCH удалите именно этот id. Затем проверьте пустое тело ответа, повторный GET и CLI. Перезапустите API или соберите новый PlannerService с тем же настроенным путём, чтобы убедиться, что отсутствие не осталось только в памяти."}</p>
        <p>{"Список после удаления должен содержать остальные задачи. Их id, названия, статусы и tags не меняются. Общая статистика пересчитывается по актуальному JSON, поэтому ожидаемое изменение зависит от статуса удалённой Task."}</p>
        <CodeBlock caption={"что сравнить"} code={"до удаления: GET /tasks/{task_id} → TaskRead\nDELETE /tasks/{task_id} → 204, body пустой\nпосле: GET /tasks/{task_id} → 404\nповторный DELETE → 404"} />
        <p>{"Для проверки DELETE не запускайте json() на его ответе. Пустое содержимое подтверждают статусом и байтами ответа, а данные проверяют отдельным GET или чтением через CLI."}</p>
      </Section>

      <Section number="07" title={"Что мы будем делать в практике"}>
        <Lead>{"Подключим готовое удаление к FastAPI и проверим его на задаче из настоящего Planner."}</Lead>
        <p>{"Мы не будем удалять прежнюю пользовательскую задачу. Создадим отдельную учебную запись готовым POST и сохраним последовательность запросов в существующей Planner collection."}</p>
        <LinkedNotes variant="connected" items={[
          { title: "Подготовьте цель", description: "Создайте Task через готовый POST и запишите выданный id; используйте тот же id после PUT/PATCH." },
          { title: "Удалите через API", description: "Вызовите существующий delete_task и верните пустой 204, не меняя сервис или storage." },
          { title: "Проверьте последствия", description: "Повторный GET и DELETE покажут 404, а новый load сохранит остальные записи и stats." },
        ]} />
        <p>{"Результат достигнут, когда клиент получает пустой 204, а новое чтение того же JSON уже не находит удалённую задачу. Повторные запросы дают 404, неверный тип id даёт 422, а соседние записи и их tags остаются прежними."}</p>
        <Callout tone="info">{"Следующая работа перенесёт уже готовые маршруты в APIRouter. Она не будет переписывать DELETE или менять его HTTP-контракт."}</Callout>
        <PracticeCta text={"Подключите DELETE к существующему PlannerService и докажите сохранённое удаление через GET, CLI и JSON."} />
      </Section>

      <KeyTakeaways points={[
        <>{"DELETE работает с id ресурса, а не с позицией в списке."}</>,
        <>{"Маршрут вызывает готовый PlannerService и не открывает JSON."}</>,
        <>{"TaskNotFoundError превращается в 404; неверный path отклоняется с 422."}</>,
        <>{"204 означает успех без тела, поэтому удалённый Task не возвращается в JSON."}</>,
        <>{"StorageError нельзя маскировать под 404 или успешное удаление."}</>,
        <>{"Повторные GET и DELETE подтверждают отсутствие, а новый load доказывает сохранение."}</>,
      ]} />
    </RichLesson>
  );
}

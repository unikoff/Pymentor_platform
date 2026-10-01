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
  59: {
    link: "Схемы определяют вход и ответ, но созданной задаче ещё негде жить между HTTP-запросами.",
    boundary: "Список в памяти подходит для обучения, но очищается после перезапуска и не заменяет базу данных.",
  },
  60: {
    link: "Storage уже создаёт, перечисляет и ищет задачи. Теперь каждая операция получает HTTP-метод и путь.",
    boundary: "CRUD не требует сразу вводить роутеры, сервисы и базу данных: сначала нужен прозрачный main.py.",
  },
  61: {
    link: "API уже создаёт и читает задачи. Теперь существующий ресурс должен изменяться без случайной потери полей.",
    boundary: "PUT и PATCH различаются контрактом, а не длиной тела запроса.",
  },
  62: {
    link: "Создание, чтение и обновление работают, но проверка отсутствующего id повторяется. Финальный урок вводит helper и удаление.",
    boundary: "HTTPException нужен для ожидаемого HTTP-ответа, а не для сокрытия любого исключения.",
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

        <MatchPairs
          prompt={"Соедините каждую часть Planner с её ответственностью."}
          leftTitle={"Часть"}
          rightTitle={"Ответственность"}
          pairs={[
            { left: "TaskCreate", right: "что клиент может передать" },
            { left: "Task", right: "с чем работает прикладная логика" },
            { left: "JsonStorage", right: "что переживает перезапуск" },
            { left: "TaskRead", right: "что клиент получает наружу" },
          ]}
          explanation={"TaskCreate относится к request, Task к предметной модели, JsonStorage к сохранению, TaskRead к response."}
        />

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

        <LinkedNotes
          items={[
            {
              title: "Без id",
              description: "До создания записи сервер ещё не назначил идентификатор. Постоянным id владеет сервер, а не внешний клиент.",
            },
            {
              title: "Без is_done",
              description: "Начальное состояние задаёт существующий сценарий создания. Изменение состояния относится к другим операциям.",
            },
            {
              title: "Без tags",
              description: "Tags остаётся внутренним полем Task и JSON, но текущий HTTP API его не публикует и не принимает при создании.",
            },
          ]}
        />

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
          code={"OpenAPI\n→ показывает обещанный контракт\n\nреальный POST / GET\n→ показывает фактическое поведение\n\nCLI / restart\n→ подтверждают сохранение в существующем проекте"}
        />

        <Callout tone="info">
          {"Правильная схема в Swagger ещё не доказывает persistence. После /docs всё равно нужны реальные запросы и наблюдение состояния."}
        </Callout>
      </Section>

      <Section number="12" title={"Проверим границы на конкретных сценариях"}>
        <Lead>
          {"Перед практикой разберём, какая часть системы отвечает за типичные ситуации. Это помогает не смешивать вход, доменную операцию, response и сохранение."}
        </Lead>

        <p>
          <strong>{"1. Нет priority."}</strong>{" "}
          {"Это проблема request. TaskCreate должна остановить вход согласно действующему договору, а основная операция создания не выполняется."}
        </p>
        <p>
          <strong>{"2. Клиент передал лишний id."}</strong>{" "}
          {"Мы не требуем 422 только за extra-ключ без отдельной настройки. Важно, что это значение не становится настоящим server-owned id."}
        </p>
        <p>
          <strong>{"3. Внутренняя Task содержит tags."}</strong>{" "}
          {"Клиент получает четыре публичных поля, а после HTTP-проверки мы отдельно убеждаемся, что tags не исчез из постоянной записи."}
        </p>
        <p>
          <strong>{"4. Handler не сформировал обязательный id."}</strong>{" "}
          {"Request может быть правильным, но результат не соответствует TaskRead. Это проблема реализации сервера."}
        </p>
        <p>
          <strong>{"5. model_dump() вернул правильный словарь."}</strong>{" "}
          {"Это ещё не говорит, что данные сохранены. Нужен реальный путь через service и storage."}
        </p>
        <p>
          <strong>{"6. Swagger выглядит правильно."}</strong>{" "}
          {"Это подтверждает OpenAPI-договор, но не доказывает, что после перезапуска запись остаётся в JSON."}
        </p>

        <RecallCard
          question={"Объясните своими словами роли TaskCreate, TaskRead, доменной Task, JsonStorage, response_model и model_dump()."}
          hint={"Разделите ответ на три направления: вход HTTP, внутренняя работа Planner и выход HTTP."}
          answer={
            <p>
              {"TaskCreate проверяет вход создания. TaskRead описывает публичную форму задачи в ответе. Доменная Task представляет предметную сущность Planner. JsonStorage сохраняет её между запусками. response_model задаёт проверяемый HTTP-договор ответа. model_dump() только создаёт Python-представление Pydantic-модели и ничего не сохраняет сам."}
            </p>
          }
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
          {"При этом CLI продолжает работать, JsonStorage хранит прежний формат, tags не потерян, POST остаётся настоящим созданием с 201, а OpenAPI показывает реальные направления данных."}
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
          {"Следующий шаг курса не будет заново проектировать эти схемы. Мы сможем сосредоточиться на том, как существующий сервис назначает серверные идентификаторы и как доказать, что изменения действительно сохраняются в общем JSON."}
        </p>
      </Section>
    </RichLesson>
  );
}



// 59. Хранилище в памяти и генерация идентификатора
export function Lesson59({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Хранилище в памяти и генерация идентификатора"}
        intro={"Создадим простейшее состояние Planner API: список задач в памяти процесса, единое правило выдачи id, функции добавления и поиска, а также честно зафиксируем ограничения."}
        tags={[
          { icon: <Boxes size={14} />, label: "in-memory storage" },
          { icon: <KeyRound size={14} />, label: "серверный id" },
        ]}
      />
      <TheoryBridge lesson={59} />

      <Section number="01" title={"Состояние между запросами"}>
        <Lead>
          {"Пока процесс Uvicorn работает, глобальный список может хранить изменения между отдельными запросами."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Список создаётся один раз при импорте."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"POST добавляет запись."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"GET читает текущее состояние."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Список создаётся один раз при импорте."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"POST добавляет запись."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"GET читает текущее состояние."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"начальное состояние"}
          code={"tasks: list[dict] = []"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Состояние между запросами» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Пока процесс Uvicorn работает, глобальный список может хранить изменения между отдельными запросами."}
            </p>
          }
        />

        <Callout tone="info">
          {"Потеря данных после перезапуска здесь является известным свойством, а не неожиданной ошибкой."}
        </Callout>
      </Section>

      <Section number="02" title={"Форма хранимой записи"}>
        <Lead>
          {"Внутри списка храним обычные словари, соответствующие TaskRead."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Один dict представляет одну задачу."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Список представляет коллекцию."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Каждая запись имеет одинаковые ключи."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Один dict представляет одну задачу."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Список представляет коллекцию."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Каждая запись имеет одинаковые ключи."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"одна сохранённая задача"}
          code={"task = {\n    \"id\": 1,\n    \"title\": \"FastAPI\",\n    \"priority\": 4,\n    \"is_done\": False,\n}\ntasks.append(task)"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Форма хранимой записи» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Внутри списка храним обычные словари, соответствующие TaskRead."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не смешивайте в одном списке TaskCreate, TaskRead и случайные словари разной формы."}
        </Callout>
      </Section>

      <Section number="03" title={"Серверный счётчик id"}>
        <Lead>
          {"Для учебного проекта используем простой счётчик, который выдаёт текущее значение и увеличивается."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Клиент не управляет next_task_id."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Каждый id выдаётся один раз."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Удалённый номер не переиспользуется."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Клиент не управляет next_task_id."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Каждый id выдаётся один раз."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Удалённый номер не переиспользуется."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"генерация id"}
          code={"next_task_id = 1\n\ndef generate_task_id() -> int:\n    global next_task_id\n    task_id = next_task_id\n    next_task_id += 1\n    return task_id"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Серверный счётчик id» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Для учебного проекта используем простой счётчик, который выдаёт текущее значение и увеличивается."}
            </p>
          }
        />

        <Callout tone="info">
          {"В PostgreSQL генерацию ключа позже возьмёт на себя база данных."}
        </Callout>
      </Section>

      <Section number="04" title={"Создание хранимой записи"}>
        <Lead>
          {"Функция объединяет проверенный TaskCreate с серверными полями и только затем добавляет запись в список."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"model_dump() создаёт новый dict."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Сервер добавляет id и is_done."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Сохранённая запись возвращается endpoint."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"model_dump() создаёт новый dict."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Сервер добавляет id и is_done."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Сохранённая запись возвращается endpoint."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"операция создания"}
          code={"def create_task_record(payload: TaskCreate) -> dict:\n    task = payload.model_dump()\n    task[\"id\"] = generate_task_id()\n    task[\"is_done\"] = False\n    tasks.append(task)\n    return task"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Создание хранимой записи» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Функция объединяет проверенный TaskCreate с серверными полями и только затем добавляет запись в список."}
            </p>
          }
        />

        <Callout tone="info">
          {"Добавляйте в список уже полный ресурс, а не промежуточный словарь без id."}
        </Callout>
      </Section>

      <Section number="05" title={"Поиск по id"}>
        <Lead>
          {"Отдельная функция поиска возвращает найденный словарь или None и ничего не знает об HTTP."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Цикл сравнивает task['id']."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Совпадение завершает функцию."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"None означает обычное отсутствие."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Цикл сравнивает task['id']."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Совпадение завершает функцию."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"None означает обычное отсутствие."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"чистый поиск"}
          code={"def find_task(task_id: int) -> dict | None:\n    for task in tasks:\n        if task[\"id\"] == task_id:\n            return task\n    return None"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Поиск по id» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Отдельная функция поиска возвращает найденный словарь или None и ничего не знает об HTTP."}
            </p>
          }
        />

        <Callout tone="info">
          {"return None должен находиться после цикла, иначе поиск остановится на первом несовпадении."}
        </Callout>
      </Section>

      <Section number="06" title={"Чтение коллекции"}>
        <Lead>
          {"Функция списка возвращает отдельный верхний контейнер, чтобы вызывающий код не получил прямой доступ к tasks."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"list(tasks) создаёт новый список."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Словари внутри остаются общими."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Для текущего блока этой границы достаточно."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"list(tasks) создаёт новый список."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Словари внутри остаются общими."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Для текущего блока этой границы достаточно."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"список для чтения"}
          code={"def list_tasks() -> list[dict]:\n    return list(tasks)"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Чтение коллекции» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Функция списка возвращает отдельный верхний контейнер, чтобы вызывающий код не получил прямой доступ к tasks."}
            </p>
          }
        />

        <Callout tone="info">
          {"Это поверхностная копия, а не промышленный механизм изоляции данных."}
        </Callout>
      </Section>

      <Section number="07" title={"Ограничения in-memory"}>
        <Lead>
          {"Временное хранилище специально оставляет нерешённые проблемы, чтобы сначала освоить HTTP и CRUD."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Перезапуск очищает список."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"У разных workers своё состояние."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Счётчик не решает конкурентные записи."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Перезапуск очищает список."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"У разных workers своё состояние."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Счётчик не решает конкурентные записи."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"что произойдёт при рестарте"}
          code={"# приложение остановлено\n# новый запуск снова выполняет:\ntasks = []\nnext_task_id = 1"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Ограничения in-memory» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Временное хранилище специально оставляет нерешённые проблемы, чтобы сначала освоить HTTP и CRUD."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не исправляйте это JSON-файлом: следующий крупный этап курса посвящён PostgreSQL."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика: storage.py"}>
        <Lead>
          {"Вынесите временное состояние и четыре операции в storage.py, затем проверьте их обычными Python-вызовами."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Создайте две задачи."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Проверьте id 1 и 2."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Найдите существующий id и получите None для 999."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Создайте две задачи."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Проверьте id 1 и 2."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Найдите существующий id и получите None для 999."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"каркас модуля"}
          code={"tasks: list[dict] = []\nnext_task_id = 1\n\ndef generate_task_id() -> int: ...\ndef create_task_record(payload: TaskCreate) -> dict: ...\ndef list_tasks() -> list[dict]: ...\ndef find_task(task_id: int) -> dict | None: ..."}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Практика: storage.py» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Вынесите временное состояние и четыре операции в storage.py, затем проверьте их обычными Python-вызовами."}
            </p>
          }
        />

        <Callout tone="info">
          {"Storage пока остаётся набором простых функций, без классов и абстрактных интерфейсов."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Где живут данные?"}
            options={[
              "В памяти процесса",
              "В Swagger",
              "В браузере",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Кто создаёт id?"}
            options={[
              "Сервер",
              "TaskCreate-клиент",
              "GET",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Что возвращает find_task при отсутствии?"}
            options={[
              "None",
              "Пустую строку",
              "Первую задачу",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Что делает рестарт?"}
            options={[
              "Очищает список",
              "Пишет JSON",
              "Сохраняет счётчик",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Список хранит данные одного процесса."}</>,
            <>{"Запись соответствует TaskRead."}</>,
            <>{"Сервер выдаёт id."}</>,
            <>{"Создание добавляет серверные поля."}</>,
            <>{"Поиск возвращает dict или None."}</>,
            <>{"In-memory имеет ограничения."}</>,
          ]}
        />

        <PracticeCta text={"Реализуйте storage.py и проверьте создание двух задач, список, поиск существующего id и отсутствие id 999."} />
      </Section>

    </RichLesson>
  );
}

// 60. CRUD: создать, получить список и найти по id
export function Lesson60({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"CRUD: создать, получить список и найти по id"}
        intro={"Соединим Pydantic-схемы и хранилище с HTTP-маршрутами: реализуем POST /tasks, GET /tasks и GET /tasks/{task_id}, выберем статусы и проследим путь данных."}
        tags={[
          { icon: <GitFork size={14} />, label: "CRUD-маршруты" },
          { icon: <ListChecks size={14} />, label: "POST и GET" },
        ]}
      />
      <TheoryBridge lesson={60} />

      <Section number="01" title={"CRUD как карта операций"}>
        <Lead>
          {"CRUD объединяет Create, Read, Update и Delete. В этом уроке реализуем создание и два способа чтения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"POST создаёт ресурс."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"GET /tasks читает коллекцию."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"GET /tasks/{id} читает один ресурс."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"POST создаёт ресурс."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"GET /tasks читает коллекцию."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"GET /tasks/{id} читает один ресурс."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"карта маршрутов"}
          code={"POST /tasks\nGET  /tasks\nGET  /tasks/{task_id}"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «CRUD как карта операций» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"CRUD объединяет Create, Read, Update и Delete. В этом уроке реализуем создание и два способа чтения."}
            </p>
          }
        />

        <Callout tone="info">
          {"Путь остаётся существительным tasks, а действие выражает HTTP-метод."}
        </Callout>
      </Section>

      <Section number="02" title={"POST /tasks и 201"}>
        <Lead>
          {"POST принимает TaskCreate, вызывает storage и возвращает TaskRead со статусом 201 Created."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Body проверяется до endpoint."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Storage создаёт id."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"response_model показывает полный ресурс."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Body проверяется до endpoint."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Storage создаёт id."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"response_model показывает полный ресурс."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"маршрут создания"}
          code={"@app.post(\n    \"/tasks\",\n    response_model=TaskRead,\n    status_code=status.HTTP_201_CREATED,\n)\ndef create_task(payload: TaskCreate):\n    return create_task_record(payload)"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «POST /tasks и 201» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"POST принимает TaskCreate, вызывает storage и возвращает TaskRead со статусом 201 Created."}
            </p>
          }
        />

        <Callout tone="info">
          {"Короткий endpoint возможен, потому что каждая соседняя часть уже имеет свою ответственность."}
        </Callout>
      </Section>

      <Section number="03" title={"GET /tasks"}>
        <Lead>
          {"Маршрут коллекции не принимает body и успешно возвращает даже пустой список."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Пустая коллекция — это 200 и []."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"GET не изменяет состояние."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"response_model имеет форму list[TaskRead]."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Пустая коллекция — это 200 и []."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"GET не изменяет состояние."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"response_model имеет форму list[TaskRead]."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"маршрут списка"}
          code={"@app.get(\n    \"/tasks\",\n    response_model=list[TaskRead],\n)\ndef get_tasks():\n    return list_tasks()"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «GET /tasks» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Маршрут коллекции не принимает body и успешно возвращает даже пустой список."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не используйте 404 для пустой коллекции: сам ресурс /tasks существует."}
        </Callout>
      </Section>

      <Section number="04" title={"GET /tasks/{task_id}"}>
        <Lead>
          {"Фигурные скобки объявляют path-параметр, а тип int проверяется FastAPI."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Имя task_id совпадает в пути и функции."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"/tasks/abc получает 422."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Поиск делегируется find_task()."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Имя task_id совпадает в пути и функции."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"/tasks/abc получает 422."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Поиск делегируется find_task()."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"маршрут одной задачи"}
          code={"@app.get(\"/tasks/{task_id}\", response_model=TaskRead)\ndef get_task(task_id: int):\n    task = find_task(task_id)\n    if task is None:\n        raise HTTPException(404, \"Task not found\")\n    return task"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «GET /tasks/{task_id}» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Фигурные скобки объявляют path-параметр, а тип int проверяется FastAPI."}
            </p>
          }
        />

        <Callout tone="info">
          {"HTTPException здесь используется как мост; единый helper разберём в уроке 62."}
        </Callout>
      </Section>

      <Section number="05" title={"Один источник поиска"}>
        <Lead>
          {"Правило перебора списка не должно копироваться в каждом endpoint."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Storage знает структуру списка."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"HTTP-слой знает статус ответа."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"find_task проверяется без FastAPI."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Storage знает структуру списка."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"HTTP-слой знает статус ответа."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"find_task проверяется без FastAPI."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"разделение ролей"}
          code={"task = find_task(task_id)\n\nif task is None:\n    raise HTTPException(\n        status_code=404,\n        detail=\"Task not found\",\n    )"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Один источник поиска» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Правило перебора списка не должно копироваться в каждом endpoint."}
            </p>
          }
        />

        <Callout tone="info">
          {"Это ещё не repository pattern: обычной функции достаточно для текущего проекта."}
        </Callout>
      </Section>

      <Section number="06" title={"response_model фильтрует ответ"}>
        <Lead>
          {"Внутренняя запись может содержать служебное поле, но публичная схема остаётся стабильной."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"TaskRead перечисляет публичные поля."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Лишнее поле не обязано попасть в JSON."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Документация совпадает с контрактом."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"TaskRead перечисляет публичные поля."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Лишнее поле не обязано попасть в JSON."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Документация совпадает с контрактом."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"внутреннее поле"}
          code={"stored = {\n    \"id\": 1,\n    \"title\": \"FastAPI\",\n    \"priority\": 4,\n    \"is_done\": False,\n    \"internal_note\": \"do not expose\",\n}"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «response_model фильтрует ответ» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Внутренняя запись может содержать служебное поле, но публичная схема остаётся стабильной."}
            </p>
          }
        />

        <Callout tone="info">
          {"response_model помогает не расширить ответ случайным внутренним полем."}
        </Callout>
      </Section>

      <Section number="07" title={"Путь данных POST → GET"}>
        <Lead>
          {"Проследите одну задачу через JSON, TaskCreate, storage, TaskRead и JSON-ответ."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"JSON превращается в TaskCreate."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Storage добавляет id и сохраняет dict."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"TaskRead формирует публичный ответ."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"JSON превращается в TaskCreate."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Storage добавляет id и сохраняет dict."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"TaskRead формирует публичный ответ."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"пять границ"}
          code={"JSON body\n    -> TaskCreate\n    -> create_task_record\n    -> tasks.append\n    -> TaskRead\n    -> JSON response"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Путь данных POST → GET» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Проследите одну задачу через JSON, TaskCreate, storage, TaskRead и JSON-ответ."}
            </p>
          }
        />

        <Callout tone="info">
          {"GET одной задачи начинает путь с path-параметра, а не с request body."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика: первая половина CRUD"}>
        <Lead>
          {"Пройдите цепочку: пустой список, две созданные задачи, список из двух элементов и получение каждой по id."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"GET /tasks сначала возвращает []."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Два POST получают разные id."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"GET /tasks/999 возвращает 404."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"GET /tasks сначала возвращает []."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Два POST получают разные id."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"GET /tasks/999 возвращает 404."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"три endpoint"}
          code={"POST /tasks\nGET  /tasks\nGET  /tasks/{task_id}"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Практика: первая половина CRUD» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Пройдите цепочку: пустой список, две созданные задачи, список из двух элементов и получение каждой по id."}
            </p>
          }
        />

        <Callout tone="info">
          {"После каждого изменяющего запроса проверяйте состояние отдельным GET."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Какой метод создаёт?"}
            options={[
              "POST",
              "GET",
              "DELETE",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Что вернуть для пустого списка?"}
            options={[
              "200 и []",
              "404",
              "422",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Где находится task_id?"}
            options={[
              "В path",
              "Только в body",
              "В Content-Type",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Что делает response_model?"}
            options={[
              "Фиксирует ответ",
              "Увеличивает id",
              "Запускает цикл",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"CRUD связывает действия с ресурсом."}</>,
            <>{"POST возвращает 201."}</>,
            <>{"GET коллекции допускает []."}</>,
            <>{"GET одного использует path id."}</>,
            <>{"Storage ищет, HTTP выбирает статус."}</>,
            <>{"TaskRead фиксирует ответ."}</>,
          ]}
        />

        <PracticeCta text={"Реализуйте POST и два GET-маршрута, затем составьте таблицу из шести ручных запросов со статусами."} />
      </Section>

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
        intro={"Разделим два похожих обновления: PUT заменяет полный набор редактируемых полей, PATCH меняет только явно переданные значения."}
        tags={[
          { icon: <Scale size={14} />, label: "PUT против PATCH" },
          { icon: <Wrench size={14} />, label: "обновление ресурса" },
        ]}
      />
      <TheoryBridge lesson={61} />

      <Section number="01" title={"Два способа обновить ресурс"}>
        <Lead>
          {"PUT можно представить как новую полную карточку, а PATCH — как список конкретных исправлений."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"PUT требует полный снимок."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"PATCH принимает только изменения."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"id сохраняется в URL."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"PUT требует полный снимок."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"PATCH принимает только изменения."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"id сохраняется в URL."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"два тела"}
          code={"PUT /tasks/7\n{\"title\":\"SQL\",\"priority\":5,\"is_done\":false}\n\nPATCH /tasks/7\n{\"is_done\":true}"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Два способа обновить ресурс» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"PUT можно представить как новую полную карточку, а PATCH — как список конкретных исправлений."}
            </p>
          }
        />

        <Callout tone="info">
          {"Сначала определите смысл операции, а не выбирайте PATCH только из-за короткого JSON."}
        </Callout>
      </Section>

      <Section number="02" title={"TaskUpdate делает PUT полным"}>
        <Lead>
          {"Все поля TaskUpdate обязательны, поэтому неполный PUT получает 422."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"title приходит заново."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"priority тоже передаётся явно."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"is_done входит в полный снимок."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"title приходит заново."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"priority тоже передаётся явно."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"is_done входит в полный снимок."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"полная схема"}
          code={"class TaskUpdate(BaseModel):\n    title: str = Field(min_length=1, max_length=120)\n    priority: int = Field(ge=1, le=5)\n    is_done: bool"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «TaskUpdate делает PUT полным» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Все поля TaskUpdate обязательны, поэтому неполный PUT получает 422."}
            </p>
          }
        />

        <Callout tone="info">
          {"422 защищает договорённость полной замены от случайно неполного тела."}
        </Callout>
      </Section>

      <Section number="03" title={"Реализация PUT"}>
        <Lead>
          {"Находим позицию задачи, строим новый словарь из TaskUpdate, сохраняем прежний id и заменяем элемент."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"enumerate даёт индекс."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"model_dump() создаёт полный новый снимок."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"tasks[index] заменяет старую запись."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"enumerate даёт индекс."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"model_dump() создаёт полный новый снимок."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"tasks[index] заменяет старую запись."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"полная замена"}
          code={"def replace_task(task_id: int, payload: TaskUpdate) -> dict | None:\n    for index, task in enumerate(tasks):\n        if task[\"id\"] == task_id:\n            updated = payload.model_dump()\n            updated[\"id\"] = task_id\n            tasks[index] = updated\n            return updated\n    return None"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Реализация PUT» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Находим позицию задачи, строим новый словарь из TaskUpdate, сохраняем прежний id и заменяем элемент."}
            </p>
          }
        />

        <Callout tone="info">
          {"Для объяснения PUT новый снимок яснее, чем частичное task.update(...)."}
        </Callout>
      </Section>

      <Section number="04" title={"TaskPatch с необязательными полями"}>
        <Lead>
          {"Частичная схема разрешает отправить только одно нужное поле."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Каждое поле имеет default=None."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Переданное значение всё равно валидируется."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"id остаётся только в path."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Каждое поле имеет default=None."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Переданное значение всё равно валидируется."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"id остаётся только в path."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"частичная схема"}
          code={"class TaskPatch(BaseModel):\n    title: str | None = Field(default=None, min_length=1, max_length=120)\n    priority: int | None = Field(default=None, ge=1, le=5)\n    is_done: bool | None = None"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «TaskPatch с необязательными полями» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Частичная схема разрешает отправить только одно нужное поле."}
            </p>
          }
        />

        <Callout tone="info">
          {"Смысл явного null проектируется отдельно; в этом блоке null не очищает обязательные поля."}
        </Callout>
      </Section>

      <Section number="05" title={"exclude_unset"}>
        <Lead>
          {"PATCH должен отличать неотправленное поле от default внутри модели."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Обычный model_dump() включает defaults."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"exclude_unset оставляет отправленные ключи."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"exclude_none убирает null по нашему учебному контракту."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Обычный model_dump() включает defaults."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"exclude_unset оставляет отправленные ключи."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"exclude_none убирает null по нашему учебному контракту."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"словарь изменений"}
          code={"changes = payload.model_dump(\n    exclude_unset=True,\n    exclude_none=True,\n)"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «exclude_unset» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"PATCH должен отличать неотправленное поле от default внутри модели."}
            </p>
          }
        />

        <Callout tone="info">
          {"Именно exclude_unset защищает старые значения от случайной перезаписи."}
        </Callout>
      </Section>

      <Section number="06" title={"Применение изменений"}>
        <Lead>
          {"Найденный словарь обновляется только маленьким словарём changes."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Сначала find_task()."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Пустой changes ничего не меняет."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"dict.update сохраняет остальные ключи."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Сначала find_task()."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Пустой changes ничего не меняет."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"dict.update сохраняет остальные ключи."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"частичная операция"}
          code={"def patch_task(task_id: int, payload: TaskPatch) -> dict | None:\n    task = find_task(task_id)\n    if task is None:\n        return None\n\n    changes = payload.model_dump(\n        exclude_unset=True,\n        exclude_none=True,\n    )\n    task.update(changes)\n    return task"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Применение изменений» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Найденный словарь обновляется только маленьким словарём changes."}
            </p>
          }
        />

        <Callout tone="info">
          {"Пустой PATCH в этой версии возвращает ресурс без изменений; это поведение нужно описать."}
        </Callout>
      </Section>

      <Section number="07" title={"Маршруты рядом"}>
        <Lead>
          {"PUT и PATCH используют один путь и один TaskRead, но разные входные схемы и storage-функции."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"PUT вызывает replace_task."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"PATCH вызывает patch_task."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Оба маршрута возвращают 404 для отсутствующего id."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"PUT вызывает replace_task."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"PATCH вызывает patch_task."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Оба маршрута возвращают 404 для отсутствующего id."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"два endpoint"}
          code={"@app.put(\"/tasks/{task_id}\", response_model=TaskRead)\ndef update_task(task_id: int, payload: TaskUpdate):\n    ...\n\n@app.patch(\"/tasks/{task_id}\", response_model=TaskRead)\ndef patch_task_endpoint(task_id: int, payload: TaskPatch):\n    ..."}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Маршруты рядом» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"PUT и PATCH используют один путь и один TaskRead, но разные входные схемы и storage-функции."}
            </p>
          }
        />

        <Callout tone="info">
          {"Разные Python-имена функций упрощают traceback и документацию."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика: таблица обновлений"}>
        <Lead>
          {"Создайте задачу, выполните полный PUT, затем короткий PATCH и после каждого шага вызовите GET."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"PUT меняет все редактируемые поля."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"PATCH меняет только is_done."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"id остаётся тем же."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"PUT меняет все редактируемые поля."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"PATCH меняет только is_done."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"id остаётся тем же."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"контрольная цепочка"}
          code={"POST  /tasks\nGET   /tasks/1\nPUT   /tasks/1\nGET   /tasks/1\nPATCH /tasks/1\nGET   /tasks/1"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Практика: таблица обновлений» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Создайте задачу, выполните полный PUT, затем короткий PATCH и после каждого шага вызовите GET."}
            </p>
          }
        />

        <Callout tone="info">
          {"Таблица должна показывать изменившиеся и сохранившиеся поля."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что означает PUT?"}
            options={[
              "Полную замену",
              "Удаление",
              "Список",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Зачем defaults None в TaskPatch?"}
            options={[
              "Сделать поля необязательными",
              "Создать id",
              "Вернуть 201",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Что делает exclude_unset?"}
            options={[
              "Оставляет переданные поля",
              "Удаляет строки",
              "Создаёт 404",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Что сохраняется?"}
            options={[
              "task_id",
              "Все старые поля при PUT",
              "Статус 201",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"PUT и PATCH имеют разные контракты."}</>,
            <>{"TaskUpdate полный."}</>,
            <>{"PUT создаёт новый снимок."}</>,
            <>{"TaskPatch необязательный."}</>,
            <>{"exclude_unset выделяет изменения."}</>,
            <>{"PATCH сохраняет неотправленные поля."}</>,
          ]}
        />

        <PracticeCta text={"Реализуйте replace_task и patch_task и составьте таблицу поведения полного и частичного обновления."} />
      </Section>

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
        intro={"Завершим CRUD: единообразно сообщим 404, удалим найденную задачу, вернём 204 без тела и разделим ошибки клиента и сервера."}
        tags={[
          { icon: <AlertTriangle size={14} />, label: "ожидаемые ошибки" },
          { icon: <Trophy size={14} />, label: "полный CRUD" },
        ]}
      />
      <TheoryBridge lesson={62} />

      <Section number="01" title={"Ошибочный сценарий — часть контракта"}>
        <Lead>
          {"Клиенту нужен стабильный ответ не только при успехе, но и для отсутствующей задачи или неверного входа."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"404 означает отсутствующий ресурс."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"422 означает нарушение схемы."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"500 означает неожиданный сбой сервера."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"404 означает отсутствующий ресурс."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"422 означает нарушение схемы."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"500 означает неожиданный сбой сервера."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"три разных ситуации"}
          code={"GET /tasks/999 -> 404\nGET /tasks/abc -> 422\nunexpected KeyError -> 500"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Ошибочный сценарий — часть контракта» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Клиенту нужен стабильный ответ не только при успехе, но и для отсутствующей задачи или неверного входа."}
            </p>
          }
        />

        <Callout tone="info">
          {"Статус выбирается по установленной причине, а не по желанию сделать все ошибки одинаковыми."}
        </Callout>
      </Section>

      <Section number="02" title={"HTTPException завершает endpoint"}>
        <Lead>
          {"raise HTTPException создаёт ожидаемый ответ и прекращает обычное выполнение функции."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"status_code задаёт число."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"detail объясняет проблему."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Код после raise в этой ветке не выполняется."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"status_code задаёт число."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"detail объясняет проблему."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Код после raise в этой ветке не выполняется."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"ожидаемый 404"}
          code={"if task is None:\n    raise HTTPException(\n        status_code=status.HTTP_404_NOT_FOUND,\n        detail=\"Task not found\",\n    )"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «HTTPException завершает endpoint» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"raise HTTPException создаёт ожидаемый ответ и прекращает обычное выполнение функции."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не помещайте HTTPException внутрь широкого except Exception."}
        </Callout>
      </Section>

      <Section number="03" title={"Единый get_task_or_404"}>
        <Lead>
          {"GET, PUT, PATCH и DELETE повторяют один поиск. Маленький helper фиксирует одинаковый статус и detail."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Helper получает task_id."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Успех возвращает dict."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Отсутствие поднимает 404."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Helper получает task_id."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Успех возвращает dict."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Отсутствие поднимает 404."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"единая проверка"}
          code={"def get_task_or_404(task_id: int) -> dict:\n    task = find_task(task_id)\n    if task is None:\n        raise HTTPException(404, \"Task not found\")\n    return task"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Единый get_task_or_404» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"GET, PUT, PATCH и DELETE повторяют один поиск. Маленький helper фиксирует одинаковый статус и detail."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не превращайте helper в универсальный обработчик всех ошибок приложения."}
        </Callout>
      </Section>

      <Section number="04" title={"Удаление найденного объекта"}>
        <Lead>
          {"Storage удаляет конкретный словарь, который уже найден по id."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Сначала get_task_or_404()."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"remove удаляет найденный объект."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Повторный GET получает 404."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Сначала get_task_or_404()."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"remove удаляет найденный объект."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Повторный GET получает 404."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"операция удаления"}
          code={"def delete_task_record(task: dict) -> None:\n    tasks.remove(task)"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Удаление найденного объекта» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Storage удаляет конкретный словарь, который уже найден по id."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не используйте task_id как индекс списка: стабильный id и текущая позиция — разные понятия."}
        </Callout>
      </Section>

      <Section number="05" title={"204 No Content"}>
        <Lead>
          {"После успешного удаления клиенту не обязательно получать JSON. Статус 204 означает успех без тела."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"204 находится в группе успешных 2xx."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Body отсутствует по смыслу статуса."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Клиент проверяет статус и обновляет интерфейс."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"204 находится в группе успешных 2xx."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Body отсутствует по смыслу статуса."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Клиент проверяет статус и обновляет интерфейс."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"DELETE endpoint"}
          code={"@app.delete(\n    \"/tasks/{task_id}\",\n    status_code=status.HTTP_204_NO_CONTENT,\n)\ndef delete_task(task_id: int):\n    task = get_task_or_404(task_id)\n    delete_task_record(task)\n    return Response(\n        status_code=status.HTTP_204_NO_CONTENT,\n    )"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «204 No Content» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"После успешного удаления клиенту не обязательно получать JSON. Статус 204 означает успех без тела."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не возвращайте удалённый объект вместе с 204: для тела нужен другой успешный контракт."}
        </Callout>
      </Section>

      <Section number="06" title={"Не скрываем неожиданные ошибки"}>
        <Lead>
          {"Широкий except может превратить KeyError или NameError в ложный 404."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Ожидаемое отсутствие проверяется явно."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Валидацию обрабатывает FastAPI."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Неожиданный дефект должен оставить traceback."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Ожидаемое отсутствие проверяется явно."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Валидацию обрабатывает FastAPI."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Неожиданный дефект должен оставить traceback."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"опасный вариант"}
          code={"try:\n    ...\nexcept Exception:\n    raise HTTPException(404, \"Task not found\")"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Не скрываем неожиданные ошибки» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Широкий except может превратить KeyError или NameError в ложный 404."}
            </p>
          }
        />

        <Callout tone="info">
          {"Клиентский статус не должен маскировать ошибку программирования."}
        </Callout>
      </Section>

      <Section number="07" title={"Полная карта CRUD"}>
        <Lead>
          {"После DELETE все операции ресурса tasks можно увидеть в одной таблице."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"POST создаёт и возвращает 201."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"GET читает коллекцию или один ресурс."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"PUT, PATCH и DELETE требуют существующий id."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"POST создаёт и возвращает 201."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"GET читает коллекцию или один ресурс."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"PUT, PATCH и DELETE требуют существующий id."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"контракт маршрутов"}
          code={"POST   /tasks       -> 201 TaskRead\nGET    /tasks       -> 200 list[TaskRead]\nGET    /tasks/{id}  -> 200 or 404\nPUT    /tasks/{id}  -> 200 or 404\nPATCH  /tasks/{id}  -> 200 or 404\nDELETE /tasks/{id}  -> 204 or 404"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Полная карта CRUD» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"После DELETE все операции ресурса tasks можно увидеть в одной таблице."}
            </p>
          }
        />

        <Callout tone="info">
          {"Единый ресурс tasks используется во всех маршрутах; различия выражают методы и схемы."}
        </Callout>
      </Section>

      <Section number="08" title={"Финальная практика"}>
        <Lead>
          {"Пройдите полную CRUD-цепочку, затем повторите GET удалённой задачи и проверьте 404."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Проверьте успешный путь."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Проверьте неверный body и path."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Обновите README с таблицей маршрутов."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Проверьте успешный путь."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Проверьте неверный body и path."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Обновите README с таблицей маршрутов."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"контрольная последовательность"}
          code={"GET    /tasks\nPOST   /tasks\nGET    /tasks/1\nPUT    /tasks/1\nPATCH  /tasks/1\nDELETE /tasks/1\nGET    /tasks/1"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Финальная практика» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Пройдите полную CRUD-цепочку, затем повторите GET удалённой задачи и проверьте 404."}
            </p>
          }
        />

        <Callout tone="info">
          {"Блок завершён, когда ученик объясняет статус каждого запроса без подсказки Swagger."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Когда нужен 404?"}
            options={[
              "Ресурс не найден",
              "Список пуст",
              "POST успешен",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Что делает raise HTTPException?"}
            options={[
              "Завершает endpoint ответом",
              "Добавляет задачу",
              "Перезапускает сервер",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Что означает 204?"}
            options={[
              "Успех без body",
              "Ошибка Pydantic",
              "Неверный URL",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Почему опасен except Exception → 404?"}
            options={[
              "Скрывает дефекты",
              "HTTPException запрещён",
              "GET не ошибается",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Ошибки входят в контракт."}</>,
            <>{"HTTPException прерывает endpoint."}</>,
            <>{"Helper устраняет повтор."}</>,
            <>{"DELETE работает по id, не по индексу."}</>,
            <>{"204 не имеет body."}</>,
            <>{"404, 422 и 500 различаются."}</>,
            <>{"CRUD завершён."}</>,
          ]}
        />

        <PracticeCta text={"Завершите DELETE, добавьте get_task_or_404 и оформите README с маршрутами, статусами и ограничениями in-memory."} />
      </Section>

    </RichLesson>
  );
}

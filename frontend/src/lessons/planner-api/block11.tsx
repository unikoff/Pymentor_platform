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
  CodeBlock,
  KeyTakeaways,
  Lead,
  PracticeCta,
  QuizCard,
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
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Pydantic-валидация и ошибка 422"}
        intro={"Свяжем JSON-запрос с Python-моделью: объявим поля через Pydantic, проверим типы и ограничения, прочитаем ответ 422 и соберём надёжную входную схему задачи."}
        tags={[
          { icon: <Braces size={14} />, label: "JSON → модель" },
          { icon: <ShieldCheck size={14} />, label: "валидация до endpoint" },
        ]}
      />
      <TheoryBridge lesson={57} />

      <Section number="01" title={"Зачем проверять данные до бизнес-логики"}>
        <Lead>
          {"Клиент может прислать корректный JSON с некорректными данными. Входная схема становится фильтром между внешним запросом и кодом приложения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"JSON отвечает за синтаксис тела запроса."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Схема перечисляет поля, типы и ограничения."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Endpoint получает уже проверенный объект."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"JSON отвечает за синтаксис тела запроса."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Схема перечисляет поля, типы и ограничения."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Endpoint получает уже проверенный объект."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"JSON и схема решают разные задачи"}
          code={"{\n  \"title\": \"Изучить Pydantic\",\n  \"priority\": 4\n}"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Зачем проверять данные до бизнес-логики» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Клиент может прислать корректный JSON с некорректными данными. Входная схема становится фильтром между внешним запросом и кодом приложения."}
            </p>
          }
        />

        <Callout tone="info">
          {"Сначала проверяем форму и значения, затем запускаем операцию создания."}
        </Callout>
      </Section>

      <Section number="02" title={"Первая модель BaseModel"}>
        <Lead>
          {"Pydantic-модель похожа на чертёж объекта. Поля записываются как атрибуты класса с аннотациями типов."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"BaseModel подключает создание и проверку модели."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Аннотации задают ожидаемые типы."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Значения доступны через task.title и task.priority."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"BaseModel подключает создание и проверку модели."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Аннотации задают ожидаемые типы."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Значения доступны через task.title и task.priority."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"первая входная схема"}
          code={"from pydantic import BaseModel\n\nclass TaskCreate(BaseModel):\n    title: str\n    priority: int\n\ntask = TaskCreate(title=\"SQL\", priority=3)\nprint(task.title)"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Первая модель BaseModel» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Pydantic-модель похожа на чертёж объекта. Поля записываются как атрибуты класса с аннотациями типов."}
            </p>
          }
        />

        <Callout tone="info">
          {"Модель пока не сохраняет задачу и не создаёт id: она отвечает только за вход."}
        </Callout>
      </Section>

      <Section number="03" title={"Обязательные поля и типы"}>
        <Lead>
          {"Поле без значения по умолчанию является обязательным. Пропущенный ключ или неподходящий тип не позволяют создать модель."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Отсутствующий title нарушает контракт."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"priority должен соответствовать int."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Ошибка указывает конкретное поле."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Отсутствующий title нарушает контракт."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"priority должен соответствовать int."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Ошибка указывает конкретное поле."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"два нарушения схемы"}
          code={"class TaskCreate(BaseModel):\n    title: str\n    priority: int\n\npayload = TaskCreate(priority=\"high\")"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Обязательные поля и типы» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Поле без значения по умолчанию является обязательным. Пропущенный ключ или неподходящий тип не позволяют создать модель."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не исправляйте такой запрос случайным try/except внутри endpoint: стандартная валидация уже знает причину."}
        </Callout>
      </Section>

      <Section number="04" title={"Ограничения через Field"}>
        <Lead>
          {"Одного типа недостаточно, когда число имеет диапазон, а строка — разумную длину. Field хранит простые границы рядом с полем."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"min_length и max_length ограничивают строку."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"ge и le задают диапазон числа включительно."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Ограничения попадают в OpenAPI-документацию."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"min_length и max_length ограничивают строку."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"ge и le задают диапазон числа включительно."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Ограничения попадают в OpenAPI-документацию."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"ограниченная схема"}
          code={"from pydantic import BaseModel, Field\n\nclass TaskCreate(BaseModel):\n    title: str = Field(min_length=1, max_length=120)\n    priority: int = Field(ge=1, le=5)"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Ограничения через Field» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Одного типа недостаточно, когда число имеет диапазон, а строка — разумную длину. Field хранит простые границы рядом с полем."}
            </p>
          }
        />

        <Callout tone="info">
          {"min_length=1 отклонит пустую строку, но строка из пробелов требует отдельного правила нормализации."}
        </Callout>
      </Section>

      <Section number="05" title={"Defaults и необязательные поля"}>
        <Lead>
          {"Значение по умолчанию позволяет клиенту не отправлять поле. Тип с None разрешает отсутствие содержимого."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"priority может получить default=3."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"description может быть строкой или None."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"id не входит в TaskCreate, потому что его создаёт сервер."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"priority может получить default=3."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"description может быть строкой или None."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"id не входит в TaskCreate, потому что его создаёт сервер."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"необязательные данные"}
          code={"class TaskCreate(BaseModel):\n    title: str = Field(min_length=1, max_length=120)\n    priority: int = Field(default=3, ge=1, le=5)\n    description: str | None = None"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Defaults и необязательные поля» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Значение по умолчанию позволяет клиенту не отправлять поле. Тип с None разрешает отсутствие содержимого."}
            </p>
          }
        />

        <Callout tone="info">
          {"Необязательное поле и поле, которым клиент не должен управлять, — разные понятия."}
        </Callout>
      </Section>

      <Section number="06" title={"Модель в FastAPI endpoint"}>
        <Lead>
          {"Параметр типа TaskCreate превращает JSON-body в объект. Некорректный запрос не доходит до тела функции."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"FastAPI распознаёт Pydantic-модель как body."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"payload содержит проверенные атрибуты."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"model_dump() создаёт обычный словарь."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"FastAPI распознаёт Pydantic-модель как body."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"payload содержит проверенные атрибуты."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"model_dump() создаёт обычный словарь."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"endpoint с моделью"}
          code={"@app.post(\"/tasks\")\ndef create_task(payload: TaskCreate):\n    data = payload.model_dump()\n    return data"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Модель в FastAPI endpoint» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Параметр типа TaskCreate превращает JSON-body в объект. Некорректный запрос не доходит до тела функции."}
            </p>
          }
        />

        <Callout tone="info">
          {"В материалах блока используем актуальную форму Pydantic v2: model_dump()."}
        </Callout>
      </Section>

      <Section number="07" title={"Как читать 422"}>
        <Lead>
          {"Ответ 422 означает, что запрос понятен, но данные не соответствуют объявленной схеме. Читайте поле detail, а внутри него loc и msg."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"loc показывает путь до проблемного поля."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"msg объясняет нарушенное ожидание."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"type помогает классифицировать ошибку."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"loc показывает путь до проблемного поля."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"msg объясняет нарушенное ожидание."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"type помогает классифицировать ошибку."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"представительный ответ"}
          code={"{\n  \"detail\": [\n    {\n      \"loc\": [\"body\", \"priority\"],\n      \"msg\": \"Input should be less than or equal to 5\",\n      \"type\": \"less_than_equal\"\n    }\n  ]\n}"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Как читать 422» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Ответ 422 означает, что запрос понятен, но данные не соответствуют объявленной схеме. Читайте поле detail, а внутри него loc и msg."}
            </p>
          }
        />

        <Callout tone="info">
          {"422 относится к входу клиента, а 500 — к неожиданной проблеме внутри сервера."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика: готовая TaskCreate"}>
        <Lead>
          {"Соберите входную схему и проверьте её через Swagger: успешное тело, отсутствующий title, priority=0 и priority=6."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Сначала зафиксируйте успешный запрос."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Затем меняйте только одно поле."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Записывайте статус и причину каждого ответа."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Сначала зафиксируйте успешный запрос."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Затем меняйте только одно поле."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Записывайте статус и причину каждого ответа."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"итоговая схема"}
          code={"class TaskCreate(BaseModel):\n    title: str = Field(min_length=1, max_length=120)\n    priority: int = Field(default=3, ge=1, le=5)\n    description: str | None = None"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Практика: готовая TaskCreate» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Соберите входную схему и проверьте её через Swagger: успешное тело, отсутствующий title, priority=0 и priority=6."}
            </p>
          }
        />

        <Callout tone="info">
          {"Практика считается завершённой, когда ученик может объяснить каждый элемент ответа 422."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что подключает BaseModel?"}
            options={[
              "Проверку и создание модели",
              "Запуск Uvicorn",
              "Создание базы данных",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Когда поле обязательно?"}
            options={[
              "Когда у него нет default",
              "Когда это строка",
              "Только в GET",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Что означает ge=1?"}
            options={[
              "Значение не меньше 1",
              "Длина равна 1",
              "Поле необязательно",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Когда появляется 422?"}
            options={[
              "Вход не прошёл схему",
              "Удаление успешно",
              "Сервер запущен",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Схема задаёт форму входного JSON."}</>,
            <>{"Поля без default обязательны."}</>,
            <>{"Field добавляет ограничения."}</>,
            <>{"FastAPI валидирует body до endpoint."}</>,
            <>{"model_dump() создаёт dict."}</>,
            <>{"422 читается по loc и msg."}</>,
          ]}
        />

        <PracticeCta text={"Создайте TaskCreate и сохраните четыре запроса из Swagger вместе со статусами и кратким разбором ошибок."} />
      </Section>

    </RichLesson>
  );
}

// 58. Разные схемы: TaskCreate, TaskUpdate, TaskRead
export function Lesson58({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Разные схемы: TaskCreate, TaskUpdate, TaskRead"}
        intro={"Разделим данные по назначению: клиент создаёт задачу без id, полностью обновляет разрешённые поля, а в ответ получает серверный ресурс с идентификатором и статусом."}
        tags={[
          { icon: <Layers size={14} />, label: "разные контракты" },
          { icon: <FileText size={14} />, label: "вход и ответ" },
        ]}
      />
      <TheoryBridge lesson={58} />

      <Section number="01" title={"Почему одной схемы становится мало"}>
        <Lead>
          {"На создании клиент не должен передавать id, а в ответе id уже обязателен. Полное обновление требует ещё одного контракта."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"TaskCreate описывает намерение создать."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"TaskUpdate описывает полную замену."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"TaskRead описывает сохранённый ресурс."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"TaskCreate описывает намерение создать."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"TaskUpdate описывает полную замену."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"TaskRead описывает сохранённый ресурс."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"слишком универсальная схема"}
          code={"class Task(BaseModel):\n    id: int | None = None\n    title: str\n    priority: int"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Почему одной схемы становится мало» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"На создании клиент не должен передавать id, а в ответе id уже обязателен. Полное обновление требует ещё одного контракта."}
            </p>
          }
        />

        <Callout tone="info">
          {"Универсальная модель скрывает, какие поля принадлежат клиенту, а какие создаёт сервер."}
        </Callout>
      </Section>

      <Section number="02" title={"TaskCreate принимает только вход"}>
        <Lead>
          {"Схема создания содержит только данные, которыми клиент действительно управляет."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"title и priority приходят из body."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"description может отсутствовать."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"id и is_done задаёт сервер."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"title и priority приходят из body."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"description может отсутствовать."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"id и is_done задаёт сервер."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"схема создания"}
          code={"class TaskCreate(BaseModel):\n    title: str = Field(min_length=1, max_length=120)\n    priority: int = Field(default=3, ge=1, le=5)\n    description: str | None = None"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «TaskCreate принимает только вход» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Схема создания содержит только данные, которыми клиент действительно управляет."}
            </p>
          }
        />

        <Callout tone="info">
          {"TaskCreate описывает команду «создай», а не готовую сохранённую запись."}
        </Callout>
      </Section>

      <Section number="03" title={"TaskRead описывает ответ"}>
        <Lead>
          {"После сохранения у задачи появляются серверные поля. TaskRead фиксирует форму, которую API обещает вернуть."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"id обязателен."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"is_done имеет конкретное значение."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Все поля публичного ресурса перечислены явно."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"id обязателен."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"is_done имеет конкретное значение."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Все поля публичного ресурса перечислены явно."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"схема чтения"}
          code={"class TaskRead(BaseModel):\n    id: int\n    title: str\n    priority: int\n    description: str | None\n    is_done: bool"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «TaskRead описывает ответ» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"После сохранения у задачи появляются серверные поля. TaskRead фиксирует форму, которую API обещает вернуть."}
            </p>
          }
        />

        <Callout tone="info">
          {"Read — это внешний контракт ответа, а не отдельная таблица или отдельное хранилище."}
        </Callout>
      </Section>

      <Section number="04" title={"response_model на маршруте"}>
        <Lead>
          {"Параметр response_model сообщает FastAPI ожидаемую форму ответа, участвует в документации и фильтрует лишние поля."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Swagger показывает TaskRead."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Выход проверяется сервером."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Внутреннее поле не обязано попадать клиенту."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Swagger показывает TaskRead."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Выход проверяется сервером."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Внутреннее поле не обязано попадать клиенту."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"POST с моделью ответа"}
          code={"@app.post(\n    \"/tasks\",\n    response_model=TaskRead,\n    status_code=201,\n)\ndef create_task(payload: TaskCreate):\n    stored = payload.model_dump()\n    stored[\"id\"] = 1\n    stored[\"is_done\"] = False\n    return stored"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «response_model на маршруте» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Параметр response_model сообщает FastAPI ожидаемую форму ответа, участвует в документации и фильтрует лишние поля."}
            </p>
          }
        />

        <Callout tone="info">
          {"Тип payload относится к запросу, response_model — к ответу."}
        </Callout>
      </Section>

      <Section number="05" title={"TaskUpdate для полного PUT"}>
        <Lead>
          {"В этом курсе PUT означает полную замену редактируемых полей, поэтому все поля TaskUpdate обязательны."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"title приходит заново."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"priority и description входят в новый снимок."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"is_done передаётся явно, а id остаётся прежним."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"title приходит заново."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"priority и description входят в новый снимок."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"is_done передаётся явно, а id остаётся прежним."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"схема полного обновления"}
          code={"class TaskUpdate(BaseModel):\n    title: str = Field(min_length=1, max_length=120)\n    priority: int = Field(ge=1, le=5)\n    description: str | None\n    is_done: bool"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «TaskUpdate для полного PUT» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"В этом курсе PUT означает полную замену редактируемых полей, поэтому все поля TaskUpdate обязательны."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не используйте TaskUpdate для PATCH до разбора частичного контракта."}
        </Callout>
      </Section>

      <Section number="06" title={"Три схемы — три вопроса"}>
        <Lead>
          {"Схему выбирают по направлению и смыслу данных, а не по похожести полей."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Что клиент присылает на создание?"}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Что клиент присылает на полную замену?"}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Что сервер возвращает как ресурс?"}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Что клиент присылает на создание?"}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Что клиент присылает на полную замену?"}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Что сервер возвращает как ресурс?"}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"карта использования"}
          code={"POST /tasks body        -> TaskCreate\nPUT /tasks/7 body       -> TaskUpdate\nsuccessful API response -> TaskRead"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Три схемы — три вопроса» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Схему выбирают по направлению и смыслу данных, а не по похожести полей."}
            </p>
          }
        />

        <Callout tone="info">
          {"Одинаковое поле title встречается в нескольких схемах, но выполняет разную роль."}
        </Callout>
      </Section>

      <Section number="07" title={"Выносим схемы в schemas.py"}>
        <Lead>
          {"Когда Pydantic-классов стало несколько, один модуль schemas.py делает их легко находимыми."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"main.py хранит приложение и endpoints."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"schemas.py хранит внешние форматы API."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"schemas.py не импортирует app и не запускает сервер."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"main.py хранит приложение и endpoints."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"schemas.py хранит внешние форматы API."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"schemas.py не импортирует app и не запускает сервер."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"минимальная структура"}
          code={"planner_api/\n├── main.py\n└── schemas.py"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Выносим схемы в schemas.py» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Когда Pydantic-классов стало несколько, один модуль schemas.py делает их легко находимыми."}
            </p>
          }
        />

        <Callout tone="info">
          {"Пока не нужны routers, services и repositories: блок решает более простую задачу."}
        </Callout>
      </Section>

      <Section number="08" title={"Практика: контракт Planner API"}>
        <Lead>
          {"Соберите schemas.py и проверьте Swagger: POST без id, полный PUT и ответ TaskRead."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1. Что приходит на вход</h3>
          <p>
            {"Сверьте request body."}
          </p>

          <h3>Шаг 2. Что делает текущая часть</h3>
          <p>
            {"Сверьте response schema."}
          </p>

          <h3>Шаг 3. Где проходит граница</h3>
          <p>
            {"Удалите поле из TaskUpdate и получите 422."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge="вход" title="Исходные данные">
            {"Сверьте request body."}
          </TypeCard>
          <TypeCard badge="действие" badgeTone="float" title="Операция">
            {"Сверьте response schema."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"Удалите поле из TaskUpdate и получите 422."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"итоговый набор"}
          code={"from pydantic import BaseModel, Field\n\nclass TaskCreate(BaseModel):\n    title: str = Field(min_length=1, max_length=120)\n    priority: int = Field(default=3, ge=1, le=5)\n    description: str | None = None\n\nclass TaskUpdate(BaseModel):\n    title: str\n    priority: int\n    description: str | None\n    is_done: bool\n\nclass TaskRead(BaseModel):\n    id: int\n    title: str\n    priority: int\n    description: str | None\n    is_done: bool"}
        />

        <RecallCard
          question={"Сформулируйте основную идею раздела «Практика: контракт Planner API» без подсказки."}
          hint={"Назовите вход, действие и границу ответственности."}
          answer={
            <p>
              {"Соберите schemas.py и проверьте Swagger: POST без id, полный PUT и ответ TaskRead."}
            </p>
          }
        />

        <Callout tone="info">
          {"Ученик должен объяснить, почему id отсутствует во входных схемах."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Какая схема принимает POST body?"}
            options={[
              "TaskCreate",
              "TaskRead",
              "TaskUpdate",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Где обязателен id?"}
            options={[
              "В TaskRead",
              "В TaskCreate",
              "Во всех схемах",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Зачем response_model?"}
            options={[
              "Описать и проверить ответ",
              "Создать порт",
              "Установить Pydantic",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
          <QuizCard
            question={"Почему TaskUpdate полный?"}
            options={[
              "PUT заменяет снимок",
              "DELETE требует body",
              "GET меняет данные",
            ]}
            correctIndex={0}
            explanation={"Верный вариант соответствует контракту текущего урока."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Одна схема не обязана обслуживать все операции."}</>,
            <>{"TaskCreate не принимает id."}</>,
            <>{"TaskRead описывает ресурс."}</>,
            <>{"TaskUpdate задаёт полный PUT."}</>,
            <>{"response_model фиксирует ответ."}</>,
            <>{"schemas.py отделяет API-форматы."}</>,
          ]}
        />

        <PracticeCta text={"Создайте schemas.py, подключите TaskCreate и TaskRead к POST /tasks и проверьте схемы запроса и ответа в Swagger."} />
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
          code={"task = {\n    \"id\": 1,\n    \"title\": \"FastAPI\",\n    \"priority\": 4,\n    \"description\": None,\n    \"is_done\": False,\n}\ntasks.append(task)"}
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
          code={"stored = {\n    \"id\": 1,\n    \"title\": \"FastAPI\",\n    \"priority\": 4,\n    \"description\": None,\n    \"is_done\": False,\n    \"internal_note\": \"do not expose\",\n}"}
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
          code={"PUT /tasks/7\n{\"title\":\"SQL\",\"priority\":5,\"description\":null,\"is_done\":false}\n\nPATCH /tasks/7\n{\"is_done\":true}"}
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
            {"description передаётся явно."}
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
            {"description передаётся явно."}
          </TypeCard>
          <TypeCard badge="граница" badgeTone="str" title="Контракт">
            {"is_done входит в полный снимок."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"полная схема"}
          code={"class TaskUpdate(BaseModel):\n    title: str = Field(min_length=1, max_length=120)\n    priority: int = Field(ge=1, le=5)\n    description: str | None\n    is_done: bool"}
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
          code={"class TaskPatch(BaseModel):\n    title: str | None = Field(default=None, min_length=1, max_length=120)\n    priority: int | None = Field(default=None, ge=1, le=5)\n    description: str | None = None\n    is_done: bool | None = None"}
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

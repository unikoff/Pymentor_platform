import {
  Boxes,
  Braces,
  FileText,
  GitFork,
  HardDrive,
  KeyRound,
  Layers,
  Save,
  Wrench,
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  FillBlank,
  FlipCards,
  KeyTakeaways,
  Lead,
  MatchPairs,
  MethodGrid,
  PracticeCta,
  PredictOutput,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TerminalDemo,
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

const BLOCK_TITLE = "Блок 14 · SQLite и основы SQLAlchemy";

type TheoryBridgeData = {
  link: string;
  boundary: string;
};

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  75: {
    link: "Planner API уже умеет обрабатывать HTTP-запросы, но список tasks живёт только внутри процесса. Теперь отделяем временное состояние от постоянного хранения.",
    boundary: "SQLite является настоящей реляционной СУБД, а не просто JSON-файлом. При этом она встроенная и не требует отдельного серверного процесса.",
  },
  76: {
    link: "После выбора SQLite приложению нужна единая точка подключения. Engine хранит конфигурацию доступа и управляет пулом соединений, но не является открытой Session.",
    boundary: "Вызов create_engine обычно не выполняет запрос немедленно: фактическое соединение открывается, когда оно понадобится.",
  },
  77: {
    link: "Engine знает, куда подключаться, но ещё не знает форму таблицы tasks. Declarative mapping связывает Python-класс, таблицу и SQLAlchemy metadata.",
    boundary: "ORM-модель описывает хранение, а Pydantic-схема описывает внешний HTTP-контракт. Совпадающие поля не делают их одной сущностью.",
  },
  78: {
    link: "После регистрации модели metadata хранит описание таблицы. Теперь материализуем это описание в SQLite и проверим результат не только через Python-код.",
    boundary: "create_all создаёт отсутствующие таблицы, но не ведёт историю изменений схемы и не заменяет Alembic.",
  },
  79: {
    link: "Таблица существует, однако engine сам не отслеживает набор изменений одного сценария. Session формирует рабочий контекст и транзакционную границу.",
    boundary: "add помещает объект в Unit of Work, но не гарантирует запись на диск. Фиксация выполняется commit, а после ошибки требуется rollback.",
  },
  80: {
    link: "Мы уже умеем создать ORM-объект отдельным скриптом. Последний шаг блока — выдавать отдельную Session каждому HTTP-запросу через dependency get_db.",
    boundary: "Session не должна быть глобальной и общей для всех запросов. Dependency управляет временем жизни ресурса, а endpoint — предметным сценарием создания задачи.",
  },
};

function TheoryBridge({ lesson }: { lesson: number }) {
  const bridge = THEORY_BRIDGES[lesson];

  return (
    <Callout tone="info">
      <strong>{"Связь с курсом."}</strong> {bridge.link}{" "}
      <strong>{"Важно не перепутать:"}</strong> {bridge.boundary}
    </Callout>
  );
}

// 75. Зачем API нужна база данных
export function Lesson75({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Зачем API нужна база данных"}
        intro={"Переведём StudyHub от временного списка к постоянному хранению: разберём реляционную модель, назначение primary key и точную роль SQLite как встроенной СУБД — пока без ORM-кода и сложных запросов."}
        tags={[
          { icon: <HardDrive size={14} />, label: "постоянное хранение" },
          { icon: <KeyRound size={14} />, label: "таблицы и primary key" },
        ]}
      />
      <TheoryBridge lesson={75} />

      <Section number="01" title="Почему список перестал быть достаточным">
        <Lead>
          {"В Planner API задачи хранятся в обычном списке Python. Такой подход был правильным учебным шагом: он позволил изучить HTTP-контракт и CRUD без нового слоя сложности. Теперь появляется реальная проблема — состояние исчезает вместе с процессом приложения."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>{"Зафиксировать потерю:"}</strong> {"создать задачу, остановить сервер и увидеть пустое хранилище после запуска."}</li>
            <li><strong>{"Отделить понятия:"}</strong> {"процесс, оперативная память, файл базы и постоянное состояние."}</li>
            <li><strong>{"Выбрать следующий слой:"}</strong> {"использовать SQLite как реляционную СУБД без отдельной установки сервера."}</li>
          </ol>
          <p>{"К концу занятия ученик сможет объяснить, почему базе данных поручают хранение, а endpoint продолжает отвечать за HTTP-сценарий."}</p>
        </div>

        <TerminalDemo
          title="данные исчезают вместе с процессом"
          lines={[
            { cmd: "uvicorn app.main:app --reload" },
            { out: "POST /tasks → 201 Created, id=1" },
            { cmd: "Ctrl+C" },
            { out: "процесс остановлен, список tasks уничтожен" },
            { cmd: "uvicorn app.main:app --reload" },
            { out: "GET /tasks → []" },
          ]}
        />

        <Callout tone="info">
          {"In-memory storage не является ошибкой. Это временная реализация с известной границей: данные существуют только пока живёт конкретный процесс."}
        </Callout>
      </Section>
      <Section number="02" title="Главная модель: состояние должно переживать запрос и перезапуск">
        <Lead>
          {"Постоянное хранение означает, что данные живут дольше одного вызова функции и дольше одного процесса API. Клиент отправляет запрос, приложение проверяет правила, а слой хранения фиксирует состояние независимо от памяти сервера."}
        </Lead>

        <BranchExplorer
          code={`POST /tasks
  ↓
FastAPI endpoint
  ↓
Pydantic validation
  ↓
storage operation
  ↓
SQLite file
  ↓
201 Created`}
          scenarios={[
            { label: "обычный запрос", activeLine: 3, output: "задача передаётся слою хранения" },
            { label: "перезапуск API", activeLine: 4, output: "запись остаётся в файле SQLite" },
            { label: "повторное чтение", activeLine: 5, output: "API получает сохранённую задачу" },
          ]}
        />

        <TypeCards>
          <TypeCard badge="RAM" title="Состояние процесса" code={"tasks = []"}>
            {"Быстро доступно коду, но исчезает после завершения процесса и не предназначено для совместной долговременной работы."}
          </TypeCard>
          <TypeCard badge="disk" badgeTone="float" title="Файл SQLite" code={"studyhub.db"}>
            {"Содержит таблицы и записи на диске. Новый процесс может открыть тот же файл и продолжить работу."}
          </TypeCard>
          <TypeCard badge="contract" badgeTone="str" title="HTTP API" code={"POST /tasks"}>
            {"Не обязан знать физический формат хранения. Его контракт остаётся JSON-запросом и JSON-ответом."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question="Что именно должно пережить перезапуск приложения?"
          hint="Не Python-объект в памяти, а зафиксированные данные."
          answer={<p>{"Запись о задаче должна находиться в постоянном хранилище, которое новый процесс сможет открыть и прочитать."}</p>}
        />
      </Section>
      <Section number="03" title="Реляционная модель: таблица, строка и колонка">
        <Lead>
          {"Реляционная база организует данные в таблицах. Таблица описывает один тип сущности, колонка фиксирует смысл одного атрибута, а строка представляет конкретную запись."}
        </Lead>

        <MethodGrid
          rows={[
            [<>database</>, "контейнер для таблиц и служебной информации"],
            [<>table tasks</>, "набор записей одного согласованного типа"],
            [<>column title</>, "именованное поле с определённым назначением"],
            [<>row id=7</>, "одна сохранённая задача"],
            [<>schema</>, "структура таблиц, колонок и ограничений"],
          ]}
        />

        <CodeBlock
          caption="таблица tasks как схема"
          code={`tasks
┌────┬──────────────────┬──────────┬─────────┐
│ id │ title            │ priority │ is_done │
├────┼──────────────────┼──────────┼─────────┤
│ 1  │ Изучить SQLite   │ 4        │ false   │
│ 2  │ Создать модель   │ 3        │ true    │
└────┴──────────────────┴──────────┴─────────┘`}
        />

        <MatchPairs
          prompt="Соедините термин и конкретный элемент StudyHub."
          pairs={[
            { left: "таблица", right: "tasks" },
            { left: "строка", right: "задача с id=2" },
            { left: "колонка", right: "priority" },
            { left: "схема", right: "описание полей и ограничений" },
          ]}
          explanation="Термины описывают разные уровни одной структуры данных."
        />

        <Callout>
          {"Слово schema здесь обозначает структуру базы. Оно не равно Pydantic-схеме, хотя оба механизма описывают форму данных на разных границах."}
        </Callout>
      </Section>
      <Section number="04" title="Primary key: стабильная идентичность записи">
        <Lead>
          {"Каждой задаче нужен стабильный идентификатор. Primary key — колонка или набор колонок, значение которых однозначно определяет строку внутри таблицы."}
        </Lead>

        <CompareSolutions
          question="Почему title не подходит на роль надёжного primary key?"
          left={{
            title: "Название как идентификатор",
            code: "find_task(title=\"Изучить Python\")",
            note: "Названия могут повторяться и изменяться.",
          }}
          right={{
            title: "Отдельный id",
            code: "find_task(task_id=17)",
            note: "Идентификатор стабилен и не зависит от отображаемого текста.",
          }}
          preferred="right"
          explanation="Primary key должен однозначно адресовать строку, даже если предметные поля меняются."
        />

        <StepThrough
          code={`tasks = [
    {"id": 1, "title": "Python"},
    {"id": 2, "title": "Python"},
]

target_id = 2
task = next(item for item in tasks if item["id"] == target_id)`}
          steps={[
            { line: 0, note: "Две задачи могут иметь одинаковое название.", vars: { titles: "Python, Python" } },
            { line: 5, note: "Клиент передаёт стабильный id.", vars: { target_id: "2" } },
            { line: 6, note: "Сравнение выполняется по уникальному полю.", vars: { result: "вторая задача" } },
          ]}
        />

        <TrueFalse
          statement={<>Primary key нужен только для красивого отображения номера задачи.</>}
          isTrue={false}
          explanation="Он обеспечивает однозначную идентификацию строки и используется связями, обновлениями и удалением."
        />

        <Callout tone="info">
          {"В следующих уроках SQLite сможет генерировать числовой id. Клиент не должен самостоятельно выбирать идентификатор новой записи."}
        </Callout>
      </Section>
      <Section number="05" title="Что означает встроенная SQLite">
        <Lead>
          {"SQLite — реляционная система управления базами данных, встроенная в приложение как библиотека. Ей не нужен отдельный серверный процесс: приложение читает и изменяет файл базы напрямую через SQLite-драйвер."}
        </Lead>

        <TypeCards>
          <TypeCard badge="embedded" title="Встроенная библиотека" code={"sqlite3"}>
            {"Механизм базы работает внутри процесса приложения, а не как отдельная служба PostgreSQL."}
          </TypeCard>
          <TypeCard badge="serverless" badgeTone="float" title="Без отдельного DB-сервера" code={"studyhub.db"}>
            {"Для локального курса не нужно создавать пользователя сервера, порт и отдельный сервис базы."}
          </TypeCard>
          <TypeCard badge="SQL" badgeTone="str" title="Реляционная модель" code={"table tasks"}>
            {"SQLite поддерживает таблицы, ограничения, транзакции и SQL, несмотря на простую установку."}
          </TypeCard>
        </TypeCards>

        <CompareSolutions
          question="Как точнее описать SQLite в текущем проекте?"
          left={{
            title: "Просто файл с JSON",
            code: "open(\"studyhub.db\")",
            note: "Игнорируются таблицы, транзакции и SQL-движок.",
          }}
          right={{
            title: "Встроенная реляционная СУБД",
            code: "sqlite:///studyhub.db",
            note: "Файл обслуживается SQLite через правила базы данных.",
          }}
          preferred="right"
          explanation="Физически база часто находится в одном файле, но управляет им полноценный SQLite engine."
        />

        <FlipCards
          cards={[
            { front: <>Нужен отдельный сервер?</>, back: <>Нет. SQLite работает внутри приложения.</> },
            { front: <>Есть таблицы и транзакции?</>, back: <>Да. Это реляционная СУБД.</> },
            { front: <>Подходит для обучения ORM?</>, back: <>Да. Установка минимальна, а основные модели базы сохраняются.</> },
          ]}
        />
      </Section>
      <Section number="06" title="Сильные стороны и границы SQLite">
        <Lead>
          {"Выбор технологии профессионален только тогда, когда разработчик понимает не только преимущества, но и ограничения. SQLite удобна для локальной разработки, тестов и небольших приложений, однако не заменяет серверную СУБД во всех сценариях."}
        </Lead>

        <TypeCards>
          <TypeCard badge="+" title="Простой запуск">
            {"Один файл, отсутствие отдельной установки сервера и быстрый старт проекта."}
          </TypeCard>
          <TypeCard badge="+" badgeTone="float" title="Транзакционность">
            {"Несколько операций можно объединить в согласованную транзакцию с commit или rollback."}
          </TypeCard>
          <TypeCard badge="limit" badgeTone="str" title="Конкурирующая запись">
            {"Большое число одновременных пишущих операций — не основной сценарий SQLite."}
          </TypeCard>
        </TypeCards>

        <MethodGrid
          rows={[
            [<>локальная разработка</>, "подходит"],
            [<>автотесты</>, "часто подходит"],
            [<>настольное приложение</>, "часто подходит"],
            [<>один небольшой API</>, "может подходить после оценки нагрузки"],
            [<>много серверов с общей базой</>, "обычно требуется серверная СУБД"],
          ]}
        />

        <RecallCard
          question="Почему SQLite выбрана сейчас, если позже будет PostgreSQL?"
          answer={<p>{"Она позволяет изучить таблицы, ORM, Session и транзакции без инфраструктурного барьера. Позже знакомая модель переносится на серверную СУБД."}</p>}
        />

        <Callout>
          {"SQLite не следует называть игрушечной базой. Корректнее говорить: у неё другой операционный профиль и иная модель конкурентного доступа."}
        </Callout>
      </Section>
      <Section number="07" title="План миграции StudyHub без большого переписывания">
        <Lead>
          {"Мы не заменяем весь API одним гигантским коммитом. Сначала создаём инфраструктурную границу, затем ORM-модель и таблицу, после этого учимся записывать одну задачу. Чтение и полный CRUD появятся в следующем блоке."}
        </Lead>

        <CodeSequence
          title="Соберите безопасный маршрут блока"
          prompt="Расположите шаги так, чтобы каждая новая абстракция решала уже показанную проблему."
          pieces={[
            { id: "need", code: "зафиксировать потерю in-memory данных" },
            { id: "engine", code: "создать engine и URL подключения" },
            { id: "model", code: "описать ORM-модель TaskModel" },
            { id: "table", code: "создать и проверить таблицу tasks" },
            { id: "session", code: "записать объект через Session" },
            { id: "fastapi", code: "подключить Session через get_db" },
            { id: "future", code: "сразу добавить relationship и Alembic", note: "темы следующих блоков" },
          ]}
          correctOrder={["need", "engine", "model", "table", "session", "fastapi"]}
          explanation="Маршрут идёт от проблемы хранения к минимальной записи через HTTP."
        />

        <CodeBlock
          caption="состояние проекта после блока"
          code={`app/
├── main.py
├── database.py
├── models.py
├── schemas.py
└── routers/
    └── tasks.py

studyhub.db`}
        />

        <Callout tone="info">
          {"Намеренно отложены SELECT, фильтры, связи и миграции. Сейчас ученик должен уверенно объяснить путь одной новой задачи от JSON до строки SQLite."}
        </Callout>
      </Section>
      <Section number="08" title="Контрольная точка">
        <Lead>
          {"Соберите модель занятия целиком: назовите назначение механизма, проследите путь данных, объясните границу применения и только затем переходите к практической проверке."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что происходит с in-memory списком после остановки процесса?"}
            options={[
              "он исчезает",
              "он автоматически становится таблицей",
              "его сохраняет FastAPI",
            ]}
            correctIndex={0}
            explanation={"Список находится в памяти конкретного процесса."}
          />
          <QuizCard
            question={"Что представляет одна строка таблицы tasks?"}
            options={[
              "одну задачу",
              "одну колонку",
              "весь файл базы",
            ]}
            correctIndex={0}
            explanation={"Строка хранит одну запись сущности."}
          />
          <QuizCard
            question={"Зачем нужен primary key?"}
            options={[
              "однозначно определить строку",
              "зашифровать title",
              "запустить сервер",
            ]}
            correctIndex={0}
            explanation={"Ключ стабильно адресует конкретную запись."}
          />
          <QuizCard
            question={"Как точнее описать SQLite?"}
            options={[
              "встроенная реляционная СУБД",
              "обычный JSON-файл",
              "HTTP-фреймворк",
            ]}
            correctIndex={0}
            explanation={"SQLite управляет реляционной базой внутри приложения."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"In-memory storage живёт только вместе с процессом."}</>,
            <>{"Постоянное хранилище переживает перезапуск API."}</>,
            <>{"Реляционная таблица состоит из колонок и строк."}</>,
            <>{"Primary key однозначно определяет запись."}</>,
            <>{"SQLite является встроенной реляционной СУБД."}</>,
            <>{"Выбор SQLite имеет преимущества и эксплуатационные границы."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Критерии готовности"}</h3>
          <ul>
            <li>{"объясняете разницу между RAM и постоянным хранилищем"}</li>
            <li>{"различаете database, table, row, column и schema"}</li>
            <li>{"объясняете назначение primary key"}</li>
            <li>{"называете минимум одну сильную сторону и одну границу SQLite"}</li>
          </ul>
        </div>

        <PracticeCta text={"Воспроизведите потерю in-memory задач, затем нарисуйте схему таблицы tasks с колонками id, title, priority и is_done. Объясните словами, почему id должен быть отдельным стабильным ключом."} />
      </Section>
    </RichLesson>
  );
}

// 76. Engine, URL базы и подключение
export function Lesson76({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Engine, URL базы и подключение"}
        intro={"Создадим инфраструктурную точку доступа к SQLite: разберём database URL, роль Engine, отложенное открытие соединения, параметры драйвера и минимальную диагностику без ORM-моделей."}
        tags={[
          { icon: <HardDrive size={14} />, label: "database URL и Engine" },
          { icon: <Wrench size={14} />, label: "диагностика подключения" },
        ]}
      />
      <TheoryBridge lesson={76} />

      <Section number="01" title="От файла базы к точке подключения">
        <Lead>
          {"Мы выбрали SQLite, но приложению всё ещё нужен единый объект, который знает адрес базы, настройки драйвера и способ получать соединения. В SQLAlchemy эту инфраструктурную роль выполняет Engine."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>{"Установить инструменты:"}</strong> {"подключить SQLAlchemy 2.x и проверить версию."}</li>
            <li><strong>{"Описать адрес:"}</strong> {"собрать database URL без ручной склейки непонятных строк."}</li>
            <li><strong>{"Создать Engine:"}</strong> {"один раз на уровне модуля database.py."}</li>
            <li><strong>{"Проверить соединение:"}</strong> {"выполнить минимальный диагностический запрос."}</li>
          </ol>
          <p>{"Результат занятия — воспроизводимый database.py, который не создаёт глобальную Session и пока не знает о таблицах."}</p>
        </div>

        <TypeCards>
          <TypeCard badge="driver" title="SQLite driver" code={"sqlite3"}>
            {"Низкоуровневый механизм Python, который умеет общаться с SQLite."}
          </TypeCard>
          <TypeCard badge="toolkit" badgeTone="float" title="SQLAlchemy" code={"sqlalchemy==2.x"}>
            {"Набор Core и ORM-инструментов поверх конкретного database driver."}
          </TypeCard>
          <TypeCard badge="engine" badgeTone="str" title="Engine" code={"create_engine(...)"}>
            {"Центральный объект конфигурации соединений с выбранной базой."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Engine не является базой данных и не является Session. Он соединяет приложение с диалектом и драйвером выбранной СУБД."}
        </Callout>
      </Section>
      <Section number="02" title="Database URL как конфигурационный контракт">
        <Lead>
          {"Database URL сообщает SQLAlchemy, какой диалект использовать и где находится база. Для SQLite путь ведёт к файлу, а для серверной СУБД позже появятся host, port, user и password."}
        </Lead>

        <CodeBlock
          caption="учебная строка подключения"
          code={`DATABASE_URL = "sqlite:///./studyhub.db"`}
        />

        <MethodGrid
          rows={[
            [<>sqlite</>, "диалект SQLAlchemy"],
            [<>///</>, "локальный относительный путь к файлу"],
            [<>./studyhub.db</>, "файл базы относительно рабочей папки"],
            [<>DATABASE_URL</>, "конфигурационное имя, а не открытое соединение"],
          ]}
        />

        <BugHunt
          code={`DATABASE_URL = "sqlite://studyhub.db"`}
          question="Что потеряно в URL локального SQLite-файла?"
          options={[
            "нужное количество косых черт перед путём",
            "HTTP method",
            "имя ORM-модели",
          ]}
          correctIndex={0}
          explanation="Для относительного файла обычно используется форма sqlite:///./studyhub.db."
          fix={`DATABASE_URL = "sqlite:///./studyhub.db"`}
        />

        <Callout>
          {"Строковые URL удобны, но легко ошибиться в разделителях и специальных символах. Далее используем URL.create, чтобы собрать адрес структурированно."}
        </Callout>
      </Section>
      <Section number="03" title="Надёжный путь к файлу через pathlib и URL.create">
        <Lead>
          {"Относительный путь зависит от current working directory. Чтобы database.py работал одинаково из IDE, терминала и тестового запуска, путь строится от расположения самого модуля."}
        </Lead>

        <CodeBlock
          caption="database.py: адрес базы"
          code={`from pathlib import Path

from sqlalchemy import URL

BASE_DIR = Path(__file__).resolve().parent.parent
DB_FILE = BASE_DIR / "studyhub.db"

DATABASE_URL = URL.create(
    drivername="sqlite",
    database=str(DB_FILE),
)`}
        />

        <StepThrough
          code={`BASE_DIR = Path(__file__).resolve().parent.parent
DB_FILE = BASE_DIR / "studyhub.db"
DATABASE_URL = URL.create(
    drivername="sqlite",
    database=str(DB_FILE),
)`}
          steps={[
            { line: 0, note: "Получаем абсолютный путь к корню проекта.", vars: { BASE_DIR: "/project" } },
            { line: 1, note: "Оператор / безопасно добавляет имя файла.", vars: { DB_FILE: "/project/studyhub.db" } },
            { line: 2, note: "URL.create начинает структурированную сборку.", vars: { drivername: "sqlite" } },
            { line: 4, note: "Path превращается в строку для SQLAlchemy URL.", vars: { database: "/project/studyhub.db" } },
          ]}
        />

        <CompareSolutions
          question="Какой вариант меньше зависит от папки запуска?"
          left={{
            title: "Относительная строка",
            code: "sqlite:///./studyhub.db",
            note: "Путь считается от current working directory.",
          }}
          right={{
            title: "Path от __file__",
            code: "URL.create(drivername=\"sqlite\", database=str(DB_FILE))",
            note: "Файл привязан к структуре проекта.",
          }}
          preferred="right"
          explanation="Абсолютный путь устраняет неоднозначность рабочей директории."
        />
      </Section>
      <Section number="04" title="create_engine и отложенное соединение">
        <Lead>
          {"create_engine создаёт Engine с конфигурацией диалекта, драйвера и пула соединений. Важная профессиональная деталь: сам вызов обычно не открывает физическое соединение немедленно — оно запрашивается при первой реальной операции."}
        </Lead>

        <CodeBlock
          caption="создаём Engine один раз"
          code={`from sqlalchemy import create_engine

engine = create_engine(
    DATABASE_URL,
    echo=True,
)`}
        />

        <BranchExplorer
          code={`import database
  ↓
create_engine(...)
  ↓
Engine configured
  ↓
engine.connect()
  ↓
SQLite connection opened`}
          scenarios={[
            { label: "импорт модуля", activeLine: 2, output: "Engine настроен" },
            { label: "первый запрос", activeLine: 4, output: "драйвер открывает соединение" },
            { label: "завершение блока", activeLine: 3, output: "соединение возвращается или закрывается" },
          ]}
        />

        <TrueFalse
          statement={<>Каждый endpoint должен вызывать create_engine заново.</>}
          isTrue={false}
          explanation="Engine является долгоживущим инфраструктурным объектом и обычно создаётся один раз на процесс."
        />

        <Callout tone="info">
          {"Параметр echo=True полезен в учебной среде: SQLAlchemy выводит выполняемые SQL-команды. В production логирование настраивают осознанно."}
        </Callout>
      </Section>
      <Section number="05" title="connect_args и граница check_same_thread">
        <Lead>
          {"В стандартном SQLite-драйвере Python соединение по умолчанию связано с потоком, в котором было создано. Синхронный FastAPI может выполнять работу запроса в thread pool, поэтому в учебной интеграции часто отключают эту проверку."}
        </Lead>

        <CodeBlock
          caption="настройка SQLite для FastAPI"
          code={`engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=True,
)`}
        />

        <TypeCards>
          <TypeCard badge="arg" title="connect_args">
            {"Словарь аргументов, которые SQLAlchemy передаёт конкретному DBAPI-драйверу."}
          </TypeCard>
          <TypeCard badge="SQLite" badgeTone="float" title="check_same_thread">
            {"Проверка принадлежности соединения одному Python-потоку. Это настройка sqlite3, а не универсальный параметр SQLAlchemy."}
          </TypeCard>
          <TypeCard badge="boundary" badgeTone="str" title="Session per request">
            {"Отключение проверки не разрешает делить одну Session между запросами. Время жизни Session всё равно ограничивается."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={<>check_same_thread=False делает одну глобальную Session безопасной для всех запросов.</>}
          isTrue={false}
          explanation="Параметр относится к соединению SQLite и не отменяет правила владения Session."
        />

        <Callout>
          {"Не копируйте connect_args в проекты с PostgreSQL. Настройки драйвера зависят от конкретной СУБД и должны иметь понятную причину."}
        </Callout>
      </Section>
      <Section number="06" title="Диагностическое соединение без ORM">
        <Lead>
          {"До описания моделей полезно проверить только инфраструктуру: может ли Engine открыть соединение и выполнить минимальный SQL. Такой smoke test отделяет проблему URL от будущих ошибок mapping."}
        </Lead>

        <CodeBlock
          caption="scripts/check_database.py"
          code={`from sqlalchemy import text

from app.database import engine

with engine.connect() as connection:
    value = connection.scalar(text("SELECT 1"))

print(value)`}
        />

        <TerminalDemo
          title="проверяем подключение"
          lines={[
            { cmd: "python -m scripts.check_database" },
            { out: "BEGIN (implicit)" },
            { out: "SELECT 1" },
            { out: "1" },
            { out: "ROLLBACK" },
          ]}
        />

        <PredictOutput
          code={`with engine.connect() as connection:
    value = connection.scalar(text("SELECT 1"))

print(value)`}
          output="1"
          hint="scalar возвращает первое значение первой строки результата."
        />

        <Callout tone="info">
          {"SELECT 1 не проверяет таблицу tasks. Он подтверждает только работоспособность URL, драйвера и соединения."}
        </Callout>
      </Section>
      <Section number="07" title="Итоговый database.py и диагностика ошибок">
        <Lead>
          {"Соберём модуль без моделей и Session. Его ответственность узкая: определить путь, создать database URL и настроить один Engine."}
        </Lead>

        <CodeBlock
          caption="app/database.py"
          code={`from pathlib import Path

from sqlalchemy import URL, create_engine

BASE_DIR = Path(__file__).resolve().parent.parent
DB_FILE = BASE_DIR / "studyhub.db"

DATABASE_URL = URL.create(
    drivername="sqlite",
    database=str(DB_FILE),
)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=True,
)`}
        />

        <BugHunt
          code={`def create_task():
    engine = create_engine(DATABASE_URL)
    # работа endpoint`}
          question="Почему создание Engine внутри endpoint является плохой границей?"
          options={[
            "инфраструктура создаётся повторно для каждого запроса",
            "FastAPI запрещает функции",
            "SQLite не поддерживает Engine",
          ]}
          correctIndex={0}
          explanation="Engine должен быть долгоживущим и переиспользовать конфигурацию соединений."
          fix={`# database.py
engine = create_engine(DATABASE_URL)

# routers/tasks.py
def create_task():
    # использует Session, связанную с общим engine
    ...`}
        />

        <RecallCard
          question="Чем Engine отличается от открытого connection?"
          answer={<p>{"Engine хранит стратегию и конфигурацию доступа. Connection — конкретный выделенный канал работы с базой на ограниченное время."}</p>}
        />
      </Section>
      <Section number="08" title="Контрольная точка">
        <Lead>
          {"Соберите модель занятия целиком: назовите назначение механизма, проследите путь данных, объясните границу применения и только затем переходите к практической проверке."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что описывает database URL?"}
            options={[
              "диалект и адрес базы",
              "Pydantic-схему",
              "HTTP status",
            ]}
            correctIndex={0}
            explanation={"URL задаёт способ и место подключения."}
          />
          <QuizCard
            question={"Когда обычно открывается физическое соединение?"}
            options={[
              "при первой операции",
              "в момент объявления класса",
              "при импорте любого router",
            ]}
            correctIndex={0}
            explanation={"Engine использует lazy initialization соединения."}
          />
          <QuizCard
            question={"Где обычно создаётся Engine?"}
            options={[
              "один раз в database.py",
              "в каждом endpoint",
              "в каждой Pydantic-схеме",
            ]}
            correctIndex={0}
            explanation={"Engine является долгоживущей инфраструктурой."}
          />
          <QuizCard
            question={"Что подтверждает SELECT 1?"}
            options={[
              "работу соединения",
              "наличие всех таблиц",
              "корректность CRUD",
            ]}
            correctIndex={0}
            explanation={"Это минимальная проверка инфраструктуры подключения."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Database URL является конфигурацией доступа к СУБД."}</>,
            <>{"Path от __file__ устраняет зависимость от папки запуска."}</>,
            <>{"Engine создаётся один раз и управляет подключениями."}</>,
            <>{"create_engine обычно не открывает соединение немедленно."}</>,
            <>{"connect_args относятся к конкретному DBAPI-драйверу."}</>,
            <>{"Smoke test отделяет проблемы подключения от проблем ORM."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Критерии готовности"}</h3>
          <ul>
            <li>{"объясняете состав database URL"}</li>
            <li>{"различаете Engine и Connection"}</li>
            <li>{"не создаёте Engine внутри endpoint"}</li>
            <li>{"получаете результат SELECT 1 из SQLite"}</li>
          </ul>
        </div>

        <PracticeCta text={"Создайте app/database.py, соберите абсолютный путь к studyhub.db, настройте Engine с echo=True и выполните отдельный скрипт SELECT 1. Затем запустите его из двух разных рабочих папок."} />
      </Section>
    </RichLesson>
  );
}

// 77. Declarative Base и ORM-модель
export function Lesson77({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Declarative Base и ORM-модель"}
        intro={"Опишем реляционную форму задачи через современный declarative API SQLAlchemy 2.x: Base, metadata, Mapped, mapped_column, primary key и чёткое разделение ORM-модели с Pydantic-контрактами."}
        tags={[
          { icon: <Boxes size={14} />, label: "ORM mapping" },
          { icon: <Braces size={14} />, label: "модель и metadata" },
        ]}
      />
      <TheoryBridge lesson={77} />

      <Section number="01" title="Engine знает адрес, но не форму данных">
        <Lead>
          {"Engine умеет подключиться к SQLite, однако ещё не знает, что такое задача StudyHub. ORM-модель добавляет mapping — явное соответствие между Python-классом, таблицей и колонками."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>{"Создать базовый класс:"}</strong> {"DeclarativeBase хранит registry и metadata."}</li>
            <li><strong>{"Объявить модель:"}</strong> {"TaskModel связывается с таблицей tasks."}</li>
            <li><strong>{"Описать поля:"}</strong> {"Mapped и mapped_column задают Python-тип и параметры колонки."}</li>
            <li><strong>{"Развести контракты:"}</strong> {"ORM-модель не заменяет TaskCreate и TaskRead."}</li>
          </ol>
          <p>{"После занятия таблица ещё не обязана существовать физически. Сначала строим точное описание."}</p>
        </div>

        <TypeCards>
          <TypeCard badge="class" title="Python-объект" code={"TaskModel(title=\"SQL\")"}>
            {"Удобная форма работы внутри приложения."}
          </TypeCard>
          <TypeCard badge="table" badgeTone="float" title="Строка tasks" code={"id=1, title=SQL"}>
            {"Форма хранения в реляционной базе."}
          </TypeCard>
          <TypeCard badge="mapping" badgeTone="str" title="Соответствие">
            {"Правило, которое связывает атрибут объекта и колонку таблицы."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"ORM расшифровывается как Object-Relational Mapping. Механизм уменьшает ручное преобразование, но не отменяет понимание таблиц, транзакций и SQL."}
        </Callout>
      </Section>
      <Section number="02" title="DeclarativeBase, registry и metadata">
        <Lead>
          {"Базовый declarative-класс объединяет ORM-модели одного приложения. Через него SQLAlchemy регистрирует mappings, а metadata собирает описание таблиц, колонок и ограничений."}
        </Lead>

        <CodeBlock
          caption="app/database.py"
          code={`from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass`}
        />

        <MethodGrid
          rows={[
            [<>Base</>, "общий предок ORM-моделей приложения"],
            [<>registry</>, "реестр соответствий классов и таблиц"],
            [<>Base.metadata</>, "описание всех зарегистрированных таблиц"],
            [<>DeclarativeBase</>, "современный типизированный declarative API SQLAlchemy 2.x"],
          ]}
        />

        <StepThrough
          code={`class Base(DeclarativeBase):
    pass


class TaskModel(Base):
    __tablename__ = "tasks"
`}
          steps={[
            { line: 0, note: "Создаётся общий базовый класс.", vars: { registry: "создан" } },
            { line: 4, note: "TaskModel наследует declarative-поведение.", vars: { model: "TaskModel" } },
            { line: 5, note: "Имя таблицы попадает в mapping.", vars: { table: "tasks" } },
          ]}
        />

        <TrueFalse
          statement={<>Base.metadata уже является физическим файлом SQLite.</>}
          isTrue={false}
          explanation="Metadata — Python-описание схемы. Физические таблицы создаются отдельной операцией."
        />

        <Callout>
          {"Не создавайте отдельный Base для каждой модели одного проекта. Тогда metadata окажется раздробленной и создание схемы станет неполным."}
        </Callout>
      </Section>
      <Section number="03" title="Mapped и mapped_column: типизированное поле модели">
        <Lead>
          {"SQLAlchemy 2.x разделяет аннотацию атрибута и параметры колонки. Mapped[T] сообщает тип значения на Python-стороне, а mapped_column настраивает хранение и ограничения."}
        </Lead>

        <CodeBlock
          caption="минимальная модель"
          code={`from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TaskModel(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]`}
        />

        <MatchPairs
          prompt="Соедините элемент объявления и его роль."
          pairs={[
            { left: "id: Mapped[int]", right: "тип атрибута ORM-объекта" },
            { left: "mapped_column(...)", right: "конфигурация колонки" },
            { left: "primary_key=True", right: "уникальная идентичность строки" },
            { left: "__tablename__", right: "имя таблицы в базе" },
          ]}
          explanation="Аннотация и параметры работают вместе, но отвечают за разные аспекты mapping."
        />

        <FillBlank
          prompt="Укажите общий базовый класс ORM-модели."
          before="class TaskModel("
          after="):"
          options={["Base", "Session", "TaskCreate"]}
          answer="Base"
          explanation="Declarative-модель наследуется от общего Base."
        />

        <Callout tone="info">
          {"Mapped[str] не является Pydantic-валидацией request body. Это аннотация mapped-атрибута ORM."}
        </Callout>
      </Section>
      <Section number="04" title="Полная TaskModel: ключ, обязательность и defaults">
        <Lead>
          {"Перенесём знакомые поля Planner API в таблицу. Каждое решение должно иметь причину: id создаётся базой, title обязателен, description может отсутствовать, priority и is_done получают серверные значения по умолчанию."}
        </Lead>

        <CodeBlock
          caption="app/models.py"
          code={`from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TaskModel(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    priority: Mapped[int] = mapped_column(default=3)
    is_done: Mapped[bool] = mapped_column(default=False)`}
        />

        <TypeCards>
          <TypeCard badge="PK" title="id" code={"primary_key=True"}>
            {"Стабильный идентификатор строки. Для SQLite integer primary key генерируется при вставке."}
          </TypeCard>
          <TypeCard badge="required" badgeTone="float" title="title" code={"Mapped[str]"}>
            {"В модели поле не допускает None; длина строки ограничена выбранным типом."}
          </TypeCard>
          <TypeCard badge="optional" badgeTone="str" title="description" code={"Mapped[str | None]"}>
            {"Отсутствие описания является допустимым состоянием записи."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question="Почему id не передаётся клиентом при создании задачи?"
          answer={<p>{"Идентификатор относится к внутренней идентичности записи и назначается системой хранения, чтобы избежать конфликтов и подделки."}</p>}
        />
      </Section>
      <Section number="05" title="nullable и default отвечают на разные вопросы">
        <Lead>
          {"nullable определяет, может ли колонка хранить SQL NULL. default определяет значение, которое SQLAlchemy подставит при INSERT, если атрибут не был задан. Эти параметры нельзя считать синонимами optional-поля HTTP."}
        </Lead>

        <CompareSolutions
          question="Как описать необязательное текстовое описание?"
          left={{
            title: "Только default",
            code: "description: Mapped[str] = mapped_column(default=\"\")",
            note: "Колонка хранит пустую строку, а не отсутствие значения.",
          }}
          right={{
            title: "Допустимый NULL",
            code: "description: Mapped[str | None] = mapped_column(nullable=True)",
            note: "None явно представляет отсутствие описания.",
          }}
          preferred="right"
          explanation="Выбор зависит от доменной модели: пустая строка и отсутствие значения — разные состояния."
        />

        <BugHunt
          code={`class TaskModel(Base):
    __tablename__ = "tasks"

    title: Mapped[str | None]
`}
          question="Какой обязательный элемент модели отсутствует?"
          options={[
            "primary key",
            "HTTP method",
            "Pydantic validator",
          ]}
          correctIndex={0}
          explanation="ORM-модель таблицы должна иметь первичный ключ, чтобы SQLAlchemy идентифицировала строки."
          fix={`class TaskModel(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str | None]`}
        />

        <TrueFalse
          statement={<>default=False автоматически меняет существующие строки любой старой таблицы.</>}
          isTrue={false}
          explanation="Default участвует в новых INSERT. Изменение существующей схемы и данных позже выполняется миграцией."
        />
      </Section>
      <Section number="06" title="ORM-модель и Pydantic-схемы — разные границы">
        <Lead>
          {"TaskCreate обслуживает входной HTTP-контракт, TaskRead — выходной, а TaskModel — постоянное хранение. Профессиональная структура не смешивает пароль, служебный id и внутренние поля с тем, что разрешено клиенту."}
        </Lead>

        <CodeBlock
          caption="schemas.py и models.py"
          code={`# schemas.py
class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    priority: int = 3


class TaskRead(TaskCreate):
    id: int
    is_done: bool


# models.py
class TaskModel(Base):
    __tablename__ = "tasks"
    # mapped columns...`}
        />

        <MethodGrid
          rows={[
            [<>TaskCreate</>, "что клиент может прислать при создании"],
            [<>TaskRead</>, "что API обещает вернуть"],
            [<>TaskModel</>, "как данные представлены в ORM и таблице"],
            [<>response_model</>, "фильтрация и сериализация HTTP-ответа"],
          ]}
        />

        <CompareSolutions
          question="Почему не принимать TaskModel прямо в request body?"
          left={{
            title: "Одна модель для всего",
            code: "def create_task(payload: TaskModel): ...",
            note: "HTTP-контракт смешивается с persistence-слоем.",
          }}
          right={{
            title: "Раздельные контракты",
            code: "def create_task(payload: TaskCreate): ...",
            note: "Клиент получает только разрешённые поля.",
          }}
          preferred="right"
          explanation="Разные границы меняются по разным причинам и требуют разных правил."
        />

        <Callout tone="info">
          {"Совпадение title или priority между схемами нормально. Дублируется форма данных, но не ответственность объектов."}
        </Callout>
      </Section>
      <Section number="07" title="Регистрация модели и направление импортов">
        <Lead>
          {"Declarative mapping появляется, когда Python выполняет тело класса. Значит, модуль models должен быть импортирован до операций с Base.metadata. Это не магическое сканирование файлов."}
        </Lead>

        <BranchExplorer
          code={`import app.models
  ↓
TaskModel class body executes
  ↓
tasks Table joins Base.metadata
  ↓
Base.metadata knows "tasks"
  ↓
create_all can create table`}
          scenarios={[
            { label: "models импортирован", activeLine: 3, output: "metadata содержит tasks" },
            { label: "models не импортирован", activeLine: 2, output: "таблица не зарегистрирована" },
            { label: "следующий урок", activeLine: 4, output: "metadata материализуется в SQLite" },
          ]}
        />

        <CodeBlock
          caption="проверяем зарегистрированные таблицы"
          code={`from app import models
from app.database import Base

print(Base.metadata.tables.keys())`}
        />

        <PredictOutput
          code={`print(list(Base.metadata.tables.keys()))`}
          output="['tasks']"
          hint="Модель TaskModel уже была импортирована и зарегистрирована."
        />

        <Callout>
          {"Не исправляйте проблему случайными импортами внутри каждой функции. Определите понятную точку, где приложение загружает все модели перед созданием схемы."}
        </Callout>
      </Section>
      <Section number="08" title="Контрольная точка">
        <Lead>
          {"Соберите модель занятия целиком: назовите назначение механизма, проследите путь данных, объясните границу применения и только затем переходите к практической проверке."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что означает ORM mapping?"}
            options={[
              "соответствие класса и таблицы",
              "копирование JSON в файл",
              "запуск HTTP-сервера",
            ]}
            correctIndex={0}
            explanation={"Mapping связывает объекты и реляционную структуру."}
          />
          <QuizCard
            question={"Что хранит Base.metadata?"}
            options={[
              "описание зарегистрированных таблиц",
              "открытую Session",
              "готовые HTTP-ответы",
            ]}
            correctIndex={0}
            explanation={"Metadata является каталогом схемы на Python-стороне."}
          />
          <QuizCard
            question={"Как объявляется mapped-тип SQLAlchemy 2.x?"}
            options={[
              "Mapped[int]",
              "Field[int]",
              "Session[int]",
            ]}
            correctIndex={0}
            explanation={"Mapped используется для типизированных ORM-атрибутов."}
          />
          <QuizCard
            question={"Почему TaskCreate не заменяет TaskModel?"}
            options={[
              "они обслуживают разные границы",
              "Pydantic не работает со строками",
              "ORM не поддерживает id",
            ]}
            correctIndex={0}
            explanation={"Одна схема описывает HTTP-вход, другая модель — хранение."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"ORM mapping связывает Python-класс и реляционную таблицу."}</>,
            <>{"DeclarativeBase предоставляет общий registry и metadata."}</>,
            <>{"Mapped и mapped_column описывают атрибут и колонку."}</>,
            <>{"ORM-модель должна иметь primary key."}</>,
            <>{"nullable и default решают разные задачи."}</>,
            <>{"Pydantic-схемы и ORM-модели нельзя смешивать."}</>,
            <>{"Модель регистрируется в metadata во время импорта модуля."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Критерии готовности"}</h3>
          <ul>
            <li>{"объясняете термин ORM mapping"}</li>
            <li>{"создаёте один общий DeclarativeBase"}</li>
            <li>{"корректно используете Mapped и mapped_column"}</li>
            <li>{"различаете ORM-модель и Pydantic-схему"}</li>
          </ul>
        </div>

        <PracticeCta text={"Создайте Base и TaskModel с полями id, title, description, priority и is_done. Выведите Base.metadata.tables и отдельно выпишите, какие поля принадлежат TaskCreate, TaskRead и TaskModel."} />
      </Section>
    </RichLesson>
  );
}

// 78. Создание таблиц и просмотр SQLite
export function Lesson78({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Создание таблиц и просмотр SQLite"}
        intro={"Материализуем ORM-описание в настоящую таблицу SQLite: разберём create_all, порядок импорта моделей, DDL в echo-логах, проверку через sqlite_master и границу между первичным созданием и миграциями."}
        tags={[
          { icon: <Save size={14} />, label: "создание схемы" },
          { icon: <FileText size={14} />, label: "проверка SQLite" },
        ]}
      />
      <TheoryBridge lesson={78} />

      <Section number="01" title="Описание схемы ещё не создаёт таблицу">
        <Lead>
          {"TaskModel зарегистрировала таблицу tasks в Base.metadata, но пока это только Python-описание. Физическая таблица появляется после DDL-команды CREATE TABLE, выполненной через Engine."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>{"Проверить metadata:"}</strong> {"убедиться, что tasks зарегистрирована."}</li>
            <li><strong>{"Материализовать схему:"}</strong> {"вызвать Base.metadata.create_all(engine)."} </li>
            <li><strong>{"Посмотреть SQL:"}</strong> {"прочитать CREATE TABLE в echo-логах."}</li>
            <li><strong>{"Проверить базу извне:"}</strong> {"использовать sqlite_master и PRAGMA table_info."}</li>
          </ol>
          <p>{"Результат занятия — воспроизводимый скрипт и доказательство, что таблица существует в самом SQLite-файле."}</p>
        </div>

        <CompareSolutions
          question="Где сейчас существует схема tasks?"
          left={{
            title: "Только в metadata",
            code: "Base.metadata.tables[\"tasks\"]",
            note: "Python знает описание, но файл базы может быть пуст.",
          }}
          right={{
            title: "В SQLite",
            code: "CREATE TABLE tasks (...)",
            note: "Схема зафиксирована в каталоге базы.",
          }}
          preferred="both"
          explanation="После create_all одна и та же структура представлена и в metadata, и в физической базе."
        />

        <Callout tone="info">
          {"Metadata и database schema связаны, но не синхронизируются автоматически при каждом изменении Python-класса."}
        </Callout>
      </Section>
      <Section number="02" title="create_all: создать отсутствующие таблицы">
        <Lead>
          {"Метод create_all проходит по таблицам metadata, проверяет их наличие и отправляет DDL для отсутствующих объектов. Engine определяет, куда именно выполнять команды."}
        </Lead>

        <CodeBlock
          caption="scripts/create_tables.py"
          code={`from app import models
from app.database import Base, engine


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    create_tables()`}
        />

        <CodeSequence
          title="Соберите запуск создания схемы"
          prompt="Поставьте действия в порядке, необходимом для заполнения metadata и выполнения DDL."
          pieces={[
            { id: "models", code: "import app.models" },
            { id: "base", code: "from app.database import Base, engine" },
            { id: "call", code: "Base.metadata.create_all(bind=engine)" },
            { id: "inspect", code: "проверить таблицу в SQLite" },
            { id: "wrong", code: "создать новую Base после модели", note: "получится другая metadata" },
          ]}
          correctOrder={["models", "base", "call", "inspect"]}
          explanation="Сначала model class должна зарегистрировать Table, затем metadata может создать её через Engine."
        />

        <TrueFalse
          statement={<>create_all автоматически удалит существующую таблицу и создаст её заново.</>}
          isTrue={false}
          explanation="Метод создаёт отсутствующие таблицы и не выполняет разрушительную пересборку существующих."
        />

        <Callout>
          {"Скрипт создания схемы запускается явно. Не прячьте необратимые операции с базой в случайный import."}
        </Callout>
      </Section>
      <Section number="03" title="Почему import models обязателен">
        <Lead>
          {"Base.metadata узнаёт о таблицах только после выполнения декларативных классов. Если create_tables импортирует Base, но ни разу не импортирует TaskModel, список metadata будет пустым."}
        </Lead>

        <BugHunt
          code={`from app.database import Base, engine

Base.metadata.create_all(bind=engine)
print(Base.metadata.tables.keys())`}
          question="Почему create_all может не создать tasks?"
          options={[
            "модуль с TaskModel не был импортирован",
            "метод должен называться create_one",
            "SQLite запрещает metadata",
          ]}
          correctIndex={0}
          explanation="Класс TaskModel ещё не выполнился и не зарегистрировал таблицу."
          fix={`from app import models
from app.database import Base, engine

Base.metadata.create_all(bind=engine)
print(Base.metadata.tables.keys())`}
        />

        <StepThrough
          code={`from app import models
from app.database import Base, engine

print(Base.metadata.tables.keys())
Base.metadata.create_all(bind=engine)`}
          steps={[
            { line: 0, note: "Импорт выполняет class TaskModel.", vars: { registered: "tasks" } },
            { line: 1, note: "Получаем тот же Base и Engine.", vars: { metadata: "общая" } },
            { line: 3, note: "Проверяем каталог таблиц до DDL.", vars: { keys: "tasks" } },
            { line: 4, note: "create_all отправляет DDL через Engine.", vars: { SQLite: "CREATE TABLE" } },
          ]}
        />

        <RecallCard
          question="Почему SQLAlchemy не ищет модели по всем файлам проекта автоматически?"
          answer={<p>{"Python-модуль должен быть импортирован, чтобы определения классов выполнились. Явный импорт делает регистрацию предсказуемой."}</p>}
        />
      </Section>
      <Section number="04" title="Читаем CREATE TABLE в echo-логах">
        <Lead>
          {"Параметр echo=True превращает скрытую ORM-операцию в наблюдаемый SQL. Ученик должен уметь сопоставить mapped_column с колонкой и ограничением в CREATE TABLE."}
        </Lead>

        <TerminalDemo
          title="первый запуск create_tables"
          lines={[
            { cmd: "python -m scripts.create_tables" },
            { out: "PRAGMA main.table_info(\"tasks\")" },
            { out: "CREATE TABLE tasks (" },
            { out: "  id INTEGER NOT NULL," },
            { out: "  title VARCHAR(120) NOT NULL," },
            { out: "  description VARCHAR(500)," },
            { out: "  priority INTEGER NOT NULL," },
            { out: "  is_done BOOLEAN NOT NULL," },
            { out: "  PRIMARY KEY (id)" },
            { out: ")" },
          ]}
        />

        <MatchPairs
          prompt="Соедините ORM-объявление и фрагмент DDL."
          pairs={[
            { left: "primary_key=True", right: "PRIMARY KEY (id)" },
            { left: "String(120)", right: "VARCHAR(120)" },
            { left: "Mapped[str]", right: "NOT NULL" },
            { left: "Mapped[str | None]", right: "колонка без NOT NULL" },
          ]}
          explanation="Echo-лог позволяет проверить, как mapping превращается в реальную схему."
        />

        <Callout tone="info">
          {"Конкретный DDL немного зависит от диалекта. Мы читаем смысл ограничений, а не заучиваем точное форматирование лога."}
        </Callout>
      </Section>
      <Section number="05" title="Повторный запуск и идемпотентность create_all">
        <Lead>
          {"Скрипт можно запустить повторно: create_all сначала проверит наличие таблицы и не создаст вторую tasks. Такое поведение удобно для первого учебного старта, но не является историей миграций."}
        </Lead>

        <TerminalDemo
          title="второй запуск"
          lines={[
            { cmd: "python -m scripts.create_tables" },
            { out: "PRAGMA main.table_info(\"tasks\")" },
            { out: "таблица уже существует; CREATE TABLE не выполняется" },
          ]}
        />

        <PredictOutput
          code={`Base.metadata.create_all(bind=engine)
Base.metadata.create_all(bind=engine)

print("done")`}
          output="done"
          hint="Второй вызов проверяет существование и не создаёт дубликат таблицы."
        />

        <TrueFalse
          statement={<>Если добавить колонку due_date в TaskModel, повторный create_all гарантированно изменит старую таблицу.</>}
          isTrue={false}
          explanation="create_all не является инструментом эволюции существующей схемы."
        />

        <Callout>
          {"Идемпотентность означает, что повтор операции не меняет итог после первого успешного применения. Она не означает автоматическую миграцию."}
        </Callout>
      </Section>
      <Section number="06" title="Проверяем таблицу средствами самой SQLite">
        <Lead>
          {"Профессиональная проверка не ограничивается сообщением «скрипт не упал». SQLite хранит каталог объектов, который можно запросить через sqlite_master, а PRAGMA table_info показывает колонки."}
        </Lead>

        <CodeBlock
          caption="scripts/inspect_database.py"
          code={`from sqlalchemy import text

from app.database import engine

with engine.connect() as connection:
    table_names = connection.execute(
        text(
            "SELECT name "
            "FROM sqlite_master "
            "WHERE type = 'table' "
            "ORDER BY name"
        )
    ).scalars().all()

    columns = connection.execute(
        text("PRAGMA table_info(tasks)")
    ).mappings().all()

print(table_names)
for column in columns:
    print(column["name"], column["type"], column["notnull"])`}
        />

        <TerminalDemo
          title="структура физической таблицы"
          lines={[
            { cmd: "python -m scripts.inspect_database" },
            { out: "['tasks']" },
            { out: "id INTEGER 1" },
            { out: "title VARCHAR(120) 1" },
            { out: "description VARCHAR(500) 0" },
            { out: "priority INTEGER 1" },
            { out: "is_done BOOLEAN 1" },
          ]}
        />

        <RecallCard
          question="Что доказывает PRAGMA table_info(tasks)?"
          answer={<p>{"Команда читает структуру таблицы из каталога SQLite и подтверждает имена, типы и признаки обязательности колонок."}</p>}
        />

        <Callout tone="info">
          {"Визуальный SQLite Browser полезен, но текстовый скрипт воспроизводим и может войти в автоматическую диагностику."}
        </Callout>
      </Section>
      <Section number="07" title="Почему create_all не заменяет Alembic">
        <Lead>
          {"На старте база пустая, поэтому create_all достаточно для материализации первой схемы. Когда в базе появятся данные, изменение модели должно стать контролируемой последовательностью версий — миграцией."}
        </Lead>

        <CompareSolutions
          question="Какой инструмент отвечает на поставленный вопрос?"
          left={{
            title: "create_all",
            code: "создать отсутствующие таблицы",
            note: "Подходит для первой учебной схемы и временных баз.",
          }}
          right={{
            title: "Alembic",
            code: "versioned schema migration",
            note: "Позволяет применить и отследить изменение существующей схемы.",
          }}
          preferred="both"
          explanation="Инструменты не конкурируют напрямую: у них разные области ответственности."
        />

        <CodeBlock
          caption="изменение, которое create_all не проведёт как миграцию"
          code={`class TaskModel(Base):
    __tablename__ = "tasks"

    # ...
    due_date: Mapped[date | None]`}
        />

        <FlipCards
          cards={[
            { front: <>Создать пустую тестовую базу</>, back: <>create_all может быть уместен</> },
            { front: <>Добавить колонку в рабочую базу</>, back: <>нужна миграция Alembic</> },
            { front: <>Сохранить историю схемы</>, back: <>Alembic revision</> },
          ]}
        />

        <Callout>
          {"Alembic появится в блоке 16. Сейчас важно не применять опасный совет «удалите файл базы и создайте заново» как универсальное решение."}
        </Callout>
      </Section>
      <Section number="08" title="Контрольная точка">
        <Lead>
          {"Соберите модель занятия целиком: назовите назначение механизма, проследите путь данных, объясните границу применения и только затем переходите к практической проверке."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает create_all?"}
            options={[
              "создаёт отсутствующие таблицы",
              "обновляет любой столбец",
              "выполняет HTTP-запрос",
            ]}
            correctIndex={0}
            explanation={"Метод материализует отсутствующие объекты metadata."}
          />
          <QuizCard
            question={"Почему нужно импортировать models?"}
            options={[
              "зарегистрировать таблицы в metadata",
              "открыть браузер",
              "создать Pydantic JSON",
            ]}
            correctIndex={0}
            explanation={"Declarative classes регистрируются при выполнении модуля."}
          />
          <QuizCard
            question={"Что показывает echo=True?"}
            options={[
              "выполняемый SQL",
              "содержимое request body",
              "Git diff",
            ]}
            correctIndex={0}
            explanation={"Engine логирует SQL и параметры."}
          />
          <QuizCard
            question={"Для чего позже нужен Alembic?"}
            options={[
              "версионировать изменения схемы",
              "заменить FastAPI",
              "создавать Python-классы",
            ]}
            correctIndex={0}
            explanation={"Миграции управляют эволюцией существующей базы."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Metadata является описанием схемы на Python-стороне."}</>,
            <>{"create_all создаёт отсутствующие таблицы через Engine."}</>,
            <>{"Модели должны быть импортированы до работы с metadata."}</>,
            <>{"Echo-лог раскрывает DDL, который выполняет SQLAlchemy."}</>,
            <>{"sqlite_master и PRAGMA проверяют физическую схему."}</>,
            <>{"Повторный create_all не создаёт дубликат таблицы."}</>,
            <>{"create_all не заменяет миграции существующей схемы."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Критерии готовности"}</h3>
          <ul>
            <li>{"показываете разницу metadata и физической таблицы"}</li>
            <li>{"создаёте tasks через create_all"}</li>
            <li>{"объясняете необходимость import models"}</li>
            <li>{"проверяете схему независимо от ORM-класса"}</li>
          </ul>
        </div>

        <PracticeCta text={"Создайте scripts/create_tables.py и scripts/inspect_database.py. Запустите создание дважды, прочитайте echo-лог, затем подтвердите наличие tasks и её пяти колонок через SQLite-каталог."} />
      </Section>
    </RichLesson>
  );
}

// 79. Session: add, commit, refresh, rollback, close
export function Lesson79({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Session: add, commit, refresh, rollback, close"}
        intro={"Проследим полный жизненный цикл SQLAlchemy Session: фабрика рабочих контекстов, состояния ORM-объекта, Unit of Work, flush и commit, синхронизация через refresh, восстановление rollback и освобождение ресурсов."}
        tags={[
          { icon: <Layers size={14} />, label: "Session и Unit of Work" },
          { icon: <Save size={14} />, label: "commit и rollback" },
        ]}
      />
      <TheoryBridge lesson={79} />

      <Section number="01" title="Таблица существует, но кто управляет изменениями">
        <Lead>
          {"Engine открывает соединения, а ORM-модель описывает строки. Для прикладного сценария нужен ещё один объект: Session отслеживает ORM-объекты, собирает изменения и выполняет их в рамках транзакции."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>{"Создать фабрику:"}</strong> {"sessionmaker связывает новые Session с Engine."}</li>
            <li><strong>{"Добавить объект:"}</strong> {"add регистрирует его в Unit of Work."}</li>
            <li><strong>{"Зафиксировать:"}</strong> {"commit завершает транзакцию."}</li>
            <li><strong>{"Синхронизировать:"}</strong> {"refresh получает значения, сформированные базой."}</li>
            <li><strong>{"Завершить безопасно:"}</strong> {"rollback восстанавливает Session после ошибки, close освобождает ресурсы."}</li>
          </ol>
          <p>{"В конце занятия задача будет создана отдельным скриптом, а ученик сможет объяснить каждый переход состояния объекта."}</p>
        </div>

        <TypeCards>
          <TypeCard badge="engine" title="Engine">
            {"Инфраструктура подключений и SQL-диалекта."}
          </TypeCard>
          <TypeCard badge="session" badgeTone="float" title="Session">
            {"Рабочий контекст ORM-операции и Unit of Work."}
          </TypeCard>
          <TypeCard badge="transaction" badgeTone="str" title="Транзакция">
            {"Граница, внутри которой изменения фиксируются вместе или откатываются."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Session в SQLAlchemy не имеет отношения к пользовательской cookie-session. Здесь это объект доступа к базе и отслеживания ORM-состояния."}
        </Callout>
      </Section>
      <Section number="02" title="sessionmaker создаёт Session с общей конфигурацией">
        <Lead>
          {"Вместо ручной настройки каждой Session создаётся фабрика. Она знает Engine и выдаёт новый независимый рабочий контекст для конкретного сценария."}
        </Lead>

        <CodeBlock
          caption="app/database.py"
          code={`from sqlalchemy.orm import sessionmaker

SessionFactory = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)`}
        />

        <MethodGrid
          rows={[
            [<>SessionFactory</>, "фабрика новых Session"],
            [<>bind=engine</>, "какой Engine использовать для SQL"],
            [<>autoflush=False</>, "не выполнять автоматический flush перед некоторыми запросами"],
            [<>expire_on_commit=False</>, "не помечать все атрибуты истёкшими после commit"],
          ]}
        />

        <CompareSolutions
          question="Как организовать рабочие контексты запросов?"
          left={{
            title: "Одна глобальная Session",
            code: "session = SessionFactory()",
            note: "Состояние и ошибки разных запросов смешиваются.",
          }}
          right={{
            title: "Новая Session на сценарий",
            code: "with SessionFactory() as session:",
            note: "Жизненный цикл видим и ограничен.",
          }}
          preferred="right"
          explanation="Session содержит mutable state и должна принадлежать одному последовательному Unit of Work."
        />

        <Callout>
          {"Параметры фабрики не нужно копировать без понимания. В курсе они выбраны так, чтобы жизненный цикл был наглядным; позже сравним альтернативы."}
        </Callout>
      </Section>
      <Section number="03" title="Состояния ORM-объекта: transient, pending, persistent">
        <Lead>
          {"ORM-объект проходит несколько состояний. Сразу после конструктора он существует только в Python. После add Session начинает отслеживать его. После flush или commit строка появляется в базе и объект получает постоянную идентичность."}
        </Lead>

        <StepThrough
          code={`task = TaskModel(
    title="Изучить Session",
    priority=4,
)

session.add(task)
session.commit()
session.refresh(task)`}
          steps={[
            { line: 0, note: "Создан transient-объект вне Session.", vars: { state: "transient", id: "None" } },
            { line: 5, note: "add переводит объект в pending.", vars: { state: "pending", SQL: "ещё не обязательно выполнен" } },
            { line: 6, note: "commit вызывает flush и фиксирует транзакцию.", vars: { state: "persistent", row: "saved" } },
            { line: 7, note: "refresh перечитывает значения из базы.", vars: { id: "1" } },
          ]}
        />

        <MatchPairs
          prompt="Соедините состояние и его смысл."
          pairs={[
            { left: "transient", right: "объект создан, но Session о нём не знает" },
            { left: "pending", right: "объект добавлен в Unit of Work" },
            { left: "persistent", right: "объект связан со строкой базы" },
            { left: "detached", right: "объект больше не связан с активной Session" },
          ]}
          explanation="Названия помогают диагностировать, почему объект ещё не записан или не может лениво загрузить данные."
        />

        <RecallCard
          question="Почему task.id сначала равен None?"
          answer={<p>{"Идентификатор генерируется SQLite при INSERT. До flush или commit база ещё не назначила значение."}</p>}
        />
      </Section>
      <Section number="04" title="add, flush и commit — не одно действие">
        <Lead>
          {"add сообщает Session о новом объекте. flush синхронизирует накопленные изменения с базой внутри текущей транзакции. commit сначала выполняет необходимый flush, а затем фиксирует транзакцию."}
        </Lead>

        <CodeBlock
          caption="три уровня операции"
          code={`session.add(task)     # зарегистрировать изменение
session.flush()       # выполнить INSERT без commit
session.commit()      # зафиксировать транзакцию`}
        />

        <TypeCards>
          <TypeCard badge="add" title="Unit of Work">
            {"Session начинает отслеживать объект. Сам вызов не является обещанием долговременной записи."}
          </TypeCard>
          <TypeCard badge="flush" badgeTone="float" title="SQL внутри транзакции">
            {"INSERT отправлен, id может появиться, но rollback всё ещё способен отменить изменение."}
          </TypeCard>
          <TypeCard badge="commit" badgeTone="str" title="Фиксация">
            {"Транзакция завершается, изменение становится видимым как сохранённое состояние."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={<>После session.add(task) можно считать задачу гарантированно сохранённой на диске.</>}
          isTrue={false}
          explanation="add только регистрирует объект. Нужен успешный flush и commit."
        />

        <PredictOutput
          code={`task = TaskModel(title="SQL")
print(task.id)
session.add(task)
print(task.id)
session.flush()
print(task.id)`}
          output={`None
None
1`}
          hint="Типичный integer primary key назначается при INSERT во время flush."
        />
      </Section>
      <Section number="05" title="refresh получает состояние, которое определила база">
        <Lead>
          {"После INSERT база может назначить id, defaults или вычисляемые значения. refresh выполняет SELECT для конкретного объекта и обновляет его атрибуты текущим состоянием строки."}
        </Lead>

        <CodeBlock
          caption="создание и синхронизация"
          code={`with SessionFactory() as session:
    task = TaskModel(
        title="Проверить refresh",
        priority=4,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    print(task.id)
    print(task.is_done)`}
        />

        <BranchExplorer
          code={`TaskModel(...)
  ↓
session.add
  ↓
INSERT during commit
  ↓
SQLite assigns id
  ↓
session.refresh
  ↓
Python object has database state`}
          scenarios={[
            { label: "до commit", activeLine: 1, output: "объект ожидает INSERT" },
            { label: "после commit", activeLine: 3, output: "строка зафиксирована" },
            { label: "после refresh", activeLine: 5, output: "id и defaults доступны объекту" },
          ]}
        />

        <TrueFalse
          statement={<>refresh создаёт вторую строку tasks.</>}
          isTrue={false}
          explanation="Refresh перечитывает уже связанную строку и обновляет атрибуты объекта."
        />

        <Callout tone="info">
          {"При expire_on_commit=True SQLAlchemy может перечитать истёкшие атрибуты автоматически при доступе. В учебной конфигурации refresh делает шаг явным."}
        </Callout>
      </Section>
      <Section number="06" title="Ошибка, rollback и восстановление Session">
        <Lead>
          {"Если flush или commit завершается ошибкой ограничения, транзакция считается неуспешной. Перед следующей операцией Session должна выполнить rollback, иначе она останется в failed state."}
        </Lead>

        <BugHunt
          code={`try:
    session.add(task)
    session.commit()
except Exception:
    print("Не удалось сохранить")

next_task = TaskModel(title="Следующая")
session.add(next_task)
session.commit()`}
          question="Какой обязательный шаг пропущен после ошибки commit?"
          options={[
            "session.rollback()",
            "create_engine()",
            "Base.metadata.clear()",
          ]}
          correctIndex={0}
          explanation="Rollback завершает неуспешную транзакцию и возвращает Session в рабочее состояние."
          fix={`try:
    session.add(task)
    session.commit()
except Exception:
    session.rollback()
    raise`}
        />

        <CodeSequence
          title="Соберите безопасную транзакционную обработку"
          prompt="Расположите действия вокруг операции записи."
          pieces={[
            { id: "try", code: "try:" },
            { id: "add", code: "    session.add(task)" },
            { id: "commit", code: "    session.commit()" },
            { id: "except", code: "except Exception:" },
            { id: "rollback", code: "    session.rollback()" },
            { id: "raise", code: "    raise" },
          ]}
          correctOrder={["try", "add", "commit", "except", "rollback", "raise"]}
          explanation="Ошибка не скрывается: состояние откатывается, затем исключение передаётся уровню, который знает способ ответа."
        />

        <Callout>
          {"На этом уроке используется общий Exception только для демонстрации жизненного цикла. В CRUD-блоке появится конкретный IntegrityError и корректный HTTP-ответ."}
        </Callout>
      </Section>
      <Section number="07" title="close и контекстный менеджер">
        <Lead>
          {"Session удерживает ресурсы и внутреннее состояние. close освобождает связанные соединения и отсоединяет рабочий контекст. Контекстный менеджер гарантирует завершение даже при исключении."}
        </Lead>

        <CompareSolutions
          question="Какой вариант надёжнее завершает Session?"
          left={{
            title: "Ручной close",
            code: "session = SessionFactory()\n# операции\nsession.close()",
            note: "При исключении до последней строки close можно пропустить.",
          }}
          right={{
            title: "Контекстный менеджер",
            code: "with SessionFactory() as session:\n    # операции",
            note: "Выход из блока закрывает Session автоматически.",
          }}
          preferred="right"
          explanation="Контекстный менеджер связывает владение ресурсом с видимым блоком кода."
        />

        <CodeBlock
          caption="scripts/create_task.py"
          code={`from app.database import SessionFactory
from app.models import TaskModel

with SessionFactory() as session:
    task = TaskModel(
        title="Первая задача из ORM",
        description=None,
        priority=4,
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    print(task.id, task.title)`}
        />

        <TerminalDemo
          title="создаём первую строку"
          lines={[
            { cmd: "python -m scripts.create_task" },
            { out: "INSERT INTO tasks ..." },
            { out: "COMMIT" },
            { out: "SELECT tasks.id, ..." },
            { out: "1 Первая задача из ORM" },
          ]}
        />

        <RecallCard
          question="Что закрывает with SessionFactory() as session?"
          answer={<p>{"Он завершает рабочий объект Session и возвращает занятые соединения инфраструктуре Engine. Commit при этом выполняется только явно."}</p>}
        />
      </Section>
      <Section number="08" title="Контрольная точка">
        <Lead>
          {"Соберите модель занятия целиком: назовите назначение механизма, проследите путь данных, объясните границу применения и только затем переходите к практической проверке."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Какова основная роль Session?"}
            options={[
              "управлять ORM Unit of Work",
              "хранить cookie пользователя",
              "создавать FastAPI app",
            ]}
            correctIndex={0}
            explanation={"Session отслеживает объекты и транзакцию базы."}
          />
          <QuizCard
            question={"Что делает add?"}
            options={[
              "регистрирует объект в Session",
              "немедленно завершает транзакцию",
              "закрывает соединение",
            ]}
            correctIndex={0}
            explanation={"Объект становится pending."}
          />
          <QuizCard
            question={"Зачем нужен refresh?"}
            options={[
              "перечитать состояние строки",
              "создать таблицу",
              "удалить объект",
            ]}
            correctIndex={0}
            explanation={"Refresh синхронизирует ORM-атрибуты с базой."}
          />
          <QuizCard
            question={"Что обязательно после failed commit?"}
            options={[
              "rollback",
              "новый Base",
              "CORS middleware",
            ]}
            correctIndex={0}
            explanation={"Rollback восстанавливает транзакционный контекст."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Session является рабочим ORM-контекстом, а не пользовательской сессией."}</>,
            <>{"sessionmaker создаёт независимые Session с общей конфигурацией."}</>,
            <>{"ORM-объект проходит transient, pending и persistent состояния."}</>,
            <>{"add, flush и commit являются разными шагами."}</>,
            <>{"refresh перечитывает значения, определённые базой."}</>,
            <>{"После ошибки транзакции требуется rollback."}</>,
            <>{"Контекстный менеджер надёжно закрывает Session."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Критерии готовности"}</h3>
          <ul>
            <li>{"различаете Engine, Connection и Session"}</li>
            <li>{"объясняете add, flush, commit и refresh"}</li>
            <li>{"выполняете rollback после неуспешной транзакции"}</li>
            <li>{"закрываете Session через контекстный менеджер"}</li>
          </ul>
        </div>

        <PracticeCta text={"Создайте задачу отдельным скриптом через SessionFactory. Перед add, после add, после flush и после refresh выводите task.id. Затем намеренно вызовите ошибку, выполните rollback и докажите, что следующая корректная запись проходит."} />
      </Section>
    </RichLesson>
  );
}

// 80. get_db и первая запись из FastAPI
export function Lesson80({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"get_db и первая запись из FastAPI"}
        intro={"Свяжем FastAPI с SQLite через dependency injection: создадим Session на один запрос, преобразуем TaskCreate в TaskModel, выполним транзакцию и вернём TaskRead из ORM-атрибутов."}
        tags={[
          { icon: <GitFork size={14} />, label: "dependency lifecycle" },
          { icon: <Save size={14} />, label: "POST → SQLite" },
        ]}
      />
      <TheoryBridge lesson={80} />

      <Section number="01" title="Соединяем HTTP-конвейер и database-конвейер">
        <Lead>
          {"До этого задача создавалась отдельным Python-скриптом. Теперь вернёмся к FastAPI: request body проходит Pydantic-валидацию, dependency выдаёт Session, endpoint создаёт ORM-объект, а response model сериализует сохранённую строку."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>{"Открыть ресурс:"}</strong> {"get_db создаёт Session перед endpoint."}</li>
            <li><strong>{"Проверить вход:"}</strong> {"TaskCreate принимает только разрешённые поля."}</li>
            <li><strong>{"Преобразовать:"}</strong> {"Pydantic-данные превращаются в TaskModel."}</li>
            <li><strong>{"Зафиксировать:"}</strong> {"Session выполняет add, commit и refresh."}</li>
            <li><strong>{"Вернуть контракт:"}</strong> {"TaskRead читает ORM-атрибуты и формирует JSON."}</li>
          </ol>
          <p>{"Результат блока — POST /tasks, который сохраняет запись в SQLite и переживает перезапуск API."}</p>
        </div>

        <BranchExplorer
          code={`POST /tasks JSON
  ↓
TaskCreate validation
  ↓
get_db → Session
  ↓
TaskModel
  ↓
INSERT + COMMIT
  ↓
TaskRead
  ↓
201 JSON response`}
          scenarios={[
            { label: "невалидный body", activeLine: 1, output: "422 до endpoint" },
            { label: "валидный body", activeLine: 4, output: "строка сохранена" },
            { label: "ответ", activeLine: 6, output: "клиент получает id и is_done" },
          ]}
        />

        <Callout tone="info">
          {"Endpoint остаётся orchestration layer: связывает контракты и инфраструктуру, но не создаёт Engine и не управляет глобальным состоянием."}
        </Callout>
      </Section>
      <Section number="02" title="Dependency с yield управляет временем жизни Session">
        <Lead>
          {"FastAPI dependency может не только вернуть значение, но и выполнить завершающее действие после ответа. Код до yield подготавливает ресурс, значение yield передаётся endpoint, а выход из with закрывает Session."}
        </Lead>

        <CodeBlock
          caption="app/database.py"
          code={`from collections.abc import Generator

from sqlalchemy.orm import Session


def get_db() -> Generator[Session, None, None]:
    with SessionFactory() as session:
        yield session`}
        />

        <StepThrough
          code={`def get_db():
    with SessionFactory() as session:
        yield session


def endpoint(session = Depends(get_db)):
    return {"ok": True}`}
          steps={[
            { line: 1, note: "Dependency вызывается для запроса.", vars: { request: "started" } },
            { line: 2, note: "Создаётся отдельная Session.", vars: { session: "open" } },
            { line: 3, note: "Session передаётся endpoint.", vars: { ownership: "request" } },
            { line: 6, note: "Endpoint формирует ответ.", vars: { response: "ready" } },
            { line: 2, note: "После завершения with закрывает Session.", vars: { session: "closed" } },
          ]}
        />

        <CodeSequence
          title="Соберите жизненный цикл dependency"
          prompt="Расположите события одного HTTP-запроса."
          pieces={[
            { id: "call", code: "FastAPI вызывает get_db" },
            { id: "open", code: "SessionFactory создаёт Session" },
            { id: "yield", code: "yield передаёт Session endpoint" },
            { id: "endpoint", code: "endpoint выполняет database operation" },
            { id: "close", code: "контекстный менеджер закрывает Session" },
          ]}
          correctOrder={["call", "open", "yield", "endpoint", "close"]}
          explanation="Dependency владеет ресурсом от подготовки до завершения запроса."
        />

        <Callout>
          {"get_db не обязана выполнять commit автоматически. Транзакционная граница должна оставаться видимой в сценарии записи."}
        </Callout>
      </Section>
      <Section number="03" title="Annotated создаёт читаемый тип SessionDep">
        <Lead>
          {"Сигнатура Session вместе с Depends повторяется во многих endpoint. Annotated позволяет сохранить и Python-тип, и инструкцию FastAPI в одном переиспользуемом alias."}
        </Lead>

        <CodeBlock
          caption="app/dependencies.py"
          code={`from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db

SessionDep = Annotated[Session, Depends(get_db)]`}
        />

        <CompareSolutions
          question="Какая сигнатура яснее отделяет dependency declaration?"
          left={{
            title: "Повтор в endpoint",
            code: "session: Session = Depends(get_db)",
            note: "Работает, но повторяет связку во многих функциях.",
          }}
          right={{
            title: "Типизированный alias",
            code: "session: SessionDep",
            note: "Тип и источник зависимости определены один раз.",
          }}
          preferred="right"
          explanation="Alias уменьшает шум, не скрывая реальный тип Session."
        />

        <FillBlank
          prompt="Укажите функцию, которая создаёт Session для запроса."
          before="SessionDep = Annotated[Session, Depends("
          after=")]"
          options={["get_db", "create_engine", "TaskModel"]}
          answer="get_db"
          explanation="Depends вызывает dependency provider get_db."
        />

        <TrueFalse
          statement={<>SessionDep создаёт глобальную Session во время импорта модуля.</>}
          isTrue={false}
          explanation="Alias хранит метаданные dependency; реальная Session создаётся при обработке каждого запроса."
        />
      </Section>
      <Section number="04" title="Pydantic → ORM: явное преобразование входа">
        <Lead>
          {"TaskCreate уже прошла HTTP-валидацию. Через model_dump получаем словарь разрешённых полей и распаковываем его в конструктор TaskModel. Служебные id и is_done клиент не контролирует."}
        </Lead>

        <CodeBlock
          caption="создаём ORM-объект"
          code={`def create_task(
    payload: TaskCreate,
    session: SessionDep,
) -> TaskModel:
    task_data = payload.model_dump()
    task = TaskModel(**task_data)

    session.add(task)
    session.commit()
    session.refresh(task)

    return task`}
        />

        <StepThrough
          code={`payload = TaskCreate(
    title="SQLite из FastAPI",
    priority=4,
)
task_data = payload.model_dump()
task = TaskModel(**task_data)`}
          steps={[
            { line: 0, note: "Pydantic уже проверил значения.", vars: { payload: "TaskCreate" } },
            { line: 4, note: "model_dump создаёт словарь публичных полей.", vars: { task_data: "{title, description, priority}" } },
            { line: 5, note: "Распаковка передаёт поля ORM-конструктору.", vars: { task: "transient TaskModel" } },
          ]}
        />

        <BugHunt
          code={`task = TaskModel(
    id=payload.id,
    title=payload.title,
    is_done=payload.is_done,
)`}
          question="Почему такой контракт создания опасен?"
          options={[
            "клиент получает контроль над служебными полями id и is_done",
            "SQLAlchemy запрещает title",
            "Pydantic не поддерживает числа",
          ]}
          correctIndex={0}
          explanation="Create-schema должна разрешать только поля, которые пользователь вправе задавать."
          fix={`task = TaskModel(**payload.model_dump())`}
        />

        <Callout tone="info">
          {"Явный mapper-функционал понадобится, когда имена и структура слоёв разойдутся. Пока model_dump и конструктор сохраняют минимальную прозрачную версию."}
        </Callout>
      </Section>
      <Section number="05" title="TaskRead читает ORM-атрибуты">
        <Lead>
          {"После commit endpoint возвращает TaskModel. Pydantic должна уметь читать не словарь, а атрибуты ORM-объекта. В Pydantic v2 это включается через ConfigDict(from_attributes=True)."}
        </Lead>

        <CodeBlock
          caption="app/schemas.py"
          code={`from pydantic import BaseModel, ConfigDict, Field


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str | None = Field(
        default=None,
        max_length=500,
    )
    priority: int = Field(default=3, ge=1, le=5)


class TaskRead(TaskCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_done: bool`}
        />

        <TypeCards>
          <TypeCard badge="input" title="TaskCreate">
            {"Проверяет JSON клиента до выполнения endpoint."}
          </TypeCard>
          <TypeCard badge="ORM" badgeTone="float" title="TaskModel">
            {"Содержит mapped-атрибуты и связан со строкой SQLite."}
          </TypeCard>
          <TypeCard badge="output" badgeTone="str" title="TaskRead">
            {"Фильтрует и сериализует ответ по публичному контракту."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={<>from_attributes=True превращает Pydantic-схему в ORM-модель.</>}
          isTrue={false}
          explanation="Настройка только разрешает валидацию из атрибутов объекта; ответственности классов остаются разными."
        />

        <Callout>
          {"Response model защищает границу API. Даже если в TaskModel позже появится внутреннее поле, оно не попадёт в JSON без объявления в TaskRead."}
        </Callout>
      </Section>
      <Section number="06" title="Полный POST /tasks с кодом 201">
        <Lead>
          {"Соберём минимальный endpoint. Он принимает знакомую TaskCreate, получает Session через DI и возвращает сохранённую задачу по TaskRead."}
        </Lead>

        <CodeBlock
          caption="app/routers/tasks.py"
          code={`from fastapi import APIRouter, status

from app.dependencies import SessionDep
from app.models import TaskModel
from app.schemas import TaskCreate, TaskRead

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"],
)


@router.post(
    "",
    response_model=TaskRead,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    payload: TaskCreate,
    session: SessionDep,
) -> TaskModel:
    task = TaskModel(**payload.model_dump())

    session.add(task)
    session.commit()
    session.refresh(task)

    return task`}
        />

        <BranchExplorer
          code={`request body
  ↓
TaskCreate
  ↓
TaskModel(**model_dump())
  ↓
session.add
  ↓
session.commit
  ↓
session.refresh
  ↓
TaskRead response`}
          scenarios={[
            { label: "title пустой", activeLine: 1, output: "422, INSERT не выполняется" },
            { label: "валидная задача", activeLine: 4, output: "COMMIT фиксирует строку" },
            { label: "успешный ответ", activeLine: 6, output: "201 с id" },
          ]}
        />

        <Callout tone="info">
          {"Мы намеренно не добавляем try/except вокруг каждого вызова. Конкретные database exceptions и единый rollback-сценарий подробно появятся в блоке 15."}
        </Callout>
      </Section>
      <Section number="07" title="Доказываем постоянство и исключаем глобальную Session">
        <Lead>
          {"Готовность блока проверяется не только ответом 201. Нужно остановить API, запустить его снова и убедиться, что созданная строка осталась в SQLite. Для диагностики пока используем отдельный inspection-скрипт."}
        </Lead>

        <TerminalDemo
          title="сквозной сценарий"
          lines={[
            { cmd: "uvicorn app.main:app --reload" },
            { out: "POST /tasks → 201 {\"id\":1,\"title\":\"SQLite\",...}" },
            { cmd: "Ctrl+C" },
            { out: "процесс остановлен" },
            { cmd: "python -m scripts.inspect_tasks" },
            { out: "1 | SQLite | priority=4 | is_done=0" },
            { cmd: "uvicorn app.main:app --reload" },
            { out: "следующий POST /tasks получает id=2" },
          ]}
        />

        <BugHunt
          code={`session = SessionFactory()


@router.post("/tasks")
def create_task(payload: TaskCreate):
    # все запросы используют один session
    ...`}
          question="Какой архитектурный дефект показан?"
          options={[
            "одна mutable Session разделяется между запросами",
            "endpoint использует POST",
            "TaskCreate содержит title",
          ]}
          correctIndex={0}
          explanation="Ошибки, транзакции и identity map разных запросов будут смешиваться."
          fix={`def get_db():
    with SessionFactory() as session:
        yield session


@router.post("/tasks")
def create_task(payload: TaskCreate, session: SessionDep):
    ...`}
        />

        <RecallCard
          question="Как доказать, что API больше не использует временное in-memory storage?"
          answer={<p>{"Создать запись через HTTP, полностью остановить процесс и прочитать ту же строку из файла SQLite после нового запуска."}</p>}
        />

        <Callout>
          {"GET /tasks через ORM появится в следующем занятии блока 15. Сейчас inspection-скрипт помогает проверить хранение без преждевременного введения select."}
        </Callout>
      </Section>
      <Section number="08" title="Контрольная точка">
        <Lead>
          {"Соберите модель занятия целиком: назовите назначение механизма, проследите путь данных, объясните границу применения и только затем переходите к практической проверке."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает get_db?"}
            options={[
              "выдаёт Session на время запроса",
              "создаёт ORM-модель",
              "валидирует JSON",
            ]}
            correctIndex={0}
            explanation={"Dependency управляет жизненным циклом database Session."}
          />
          <QuizCard
            question={"Зачем используется yield?"}
            options={[
              "передать ресурс и затем завершить его",
              "создать таблицу",
              "вернуть HTTP 422",
            ]}
            correctIndex={0}
            explanation={"Код после yield/выход из context manager выполняет cleanup."}
          />
          <QuizCard
            question={"Что передаётся в TaskModel?"}
            options={[
              "payload.model_dump()",
              "response.headers",
              "Base.metadata",
            ]}
            correctIndex={0}
            explanation={"Словарь проверенных create-полей распаковывается в ORM-конструктор."}
          />
          <QuizCard
            question={"Зачем TaskRead from_attributes=True?"}
            options={[
              "читать атрибуты ORM-объекта",
              "открывать SQLite-файл",
              "выполнять commit",
            ]}
            correctIndex={0}
            explanation={"Pydantic сериализует объект по его атрибутам."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"get_db создаёт отдельную Session для одного HTTP-запроса."}</>,
            <>{"Dependency с yield связывает выдачу ресурса и cleanup."}</>,
            <>{"Annotated сохраняет тип Session и декларацию Depends."}</>,
            <>{"TaskCreate ограничивает разрешённые входные поля."}</>,
            <>{"model_dump передаёт проверенные данные ORM-модели."}</>,
            <>{"TaskRead с from_attributes сериализует ORM-объект."}</>,
            <>{"POST /tasks возвращает 201 только после успешного commit."}</>,
            <>{"Постоянство доказывается повторным чтением после перезапуска."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Критерии готовности"}</h3>
          <ul>
            <li>{"объясняете lifecycle dependency с yield"}</li>
            <li>{"получаете отдельную Session в endpoint"}</li>
            <li>{"преобразуете TaskCreate в TaskModel"}</li>
            <li>{"возвращаете TaskRead с id и is_done"}</li>
            <li>{"доказываете сохранение после перезапуска процесса"}</li>
          </ul>
        </div>

        <PracticeCta text={"Подключите get_db и SessionDep, реализуйте POST /tasks, создайте задачу через Swagger или Postman и подтвердите строку inspection-скриптом после полного перезапуска API. Зафиксируйте результат отдельным Git-коммитом."} />
      </Section>
    </RichLesson>
  );
}

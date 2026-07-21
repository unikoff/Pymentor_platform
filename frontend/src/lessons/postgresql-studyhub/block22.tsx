import {
  AlertTriangle,
  Boxes,
  FileText,
  GitBranch,
  HardDrive,
  KeyRound,
  Layers,
  ListChecks,
  ShieldCheck,
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

const BLOCK_TITLE = "Блок 22 · PostgreSQL и перенос StudyHub";

type TheoryBridgeData = {
  link: string;
  boundary: string;
};

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  123: {
    link: "В блоке 21 ученик научился читать SQL под SQLAlchemy. Теперь тот же SQL будет выполняться не внутри локального SQLite-файла, а отдельным серверным процессом PostgreSQL.",
    boundary: "PostgreSQL — не библиотека внутри FastAPI. Приложение является клиентом и подключается к отдельно работающему серверу через driver и сеть.",
  },
  124: {
    link: "Прошлый урок дал карту server, database, schema и role. Теперь каждый элемент появится в реальном терминальном сценарии.",
    boundary: "Установка PostgreSQL и установка Python-package — разные действия. psycopg не запускает server, а psql не является самой database.",
  },
  125: {
    link: "Server и psql уже работают. Теперь подключение должно выполняться не административной role postgres, а отдельной идентичностью приложения.",
    boundary: "Role с LOGIN часто называют database user, но PostgreSQL использует единый механизм roles. Ownership и granted privileges — не одно и то же.",
  },
  126: {
    link: "PostgreSQL server, database и application role готовы. Теперь Python-проект должен получить connection configuration и проверить её отдельным минимальным statement.",
    boundary: "Engine не является одним открытым connection и не устанавливает сеть при каждом импорте endpoint. Он объединяет dialect, pool и способ получения connections.",
  },
  127: {
    link: "Engine уже выполняет SELECT 1, но пустая database ещё не содержит tables. Теперь repository должен самостоятельно восстановить schema.",
    boundary: "Alembic migration history описывает изменение schema. create_all и ручное создание tables не должны становиться параллельными источниками истины.",
  },
  128: {
    link: "Пустая PostgreSQL database уже воспроизводит schema. Последний шаг — перенести data отдельно от migrations и проверить поведение приложения глазами клиента.",
    boundary: "Schema migration и data migration — разные операции. Session tokens, password secrets и случайное служебное состояние нельзя бездумно переносить вместе с demo data.",
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

// 123. PostgreSQL: сервер, база, схема и подключение
export function Lesson123({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"PostgreSQL: сервер, база, схема и подключение"}
        intro={"Разделим понятия, которые SQLite скрывал одним файлом: увидим серверный процесс PostgreSQL, отдельную базу, schema, таблицы, role и сетевое подключение клиента."}
        tags={[
          { icon: <HardDrive size={14} />, label: "server → database → schema" },
          { icon: <Layers size={14} />, label: "role · host · port" },
        ]}
      />
      <TheoryBridge lesson={123} />

      <Section number={"01"} title={"Почему SQLite-файла становится недостаточно"}>
        <Lead>
          {"SQLite помог изучить ORM и миграции без установки отдельного сервера. Следующий профессиональный шаг — увидеть инфраструктурную границу: API и база работают как разные процессы, а соединение может быть успешным или недоступным."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Почему SQLite-файла становится недостаточно»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Сохранить контракт:"}</strong> {" зафиксировать работающие endpoint и тесты до смены хранилища."}
            </li>
            <li>
              <strong>{"Разделить компоненты:"}</strong> {" увидеть FastAPI, driver, PostgreSQL server, database, schema и table."}
            </li>
            <li>
              <strong>{"Проверить соединение:"}</strong> {" изменить host или port и объяснить ожидаемую ошибку."}
            </li>
            <li>
              <strong>{"Не менять API:"}</strong> {" перенос базы не должен заставлять клиента переписывать запросы."}
            </li>
          </ol>
          <p>{"После занятия ученик рисует путь одного SQL-запроса и не называет сервер, базу и таблицу одним словом."}</p>
        </div>

        <BranchExplorer
          code={"FastAPI process\n  ↓ driver\nTCP connection\n  ↓\nPostgreSQL server\n  ↓ database\npublic schema\n  ↓\ntasks table"}
          scenarios={[
            { label: "приложение формирует запрос", activeLine: 0, output: "FastAPI передаёт работу driver" },
            { label: "устанавливается соединение", activeLine: 2, output: "host и port ведут к server process" },
            { label: "сервер ищет объект", activeLine: 6, output: "table разрешается внутри database и schema" },
          ]}
        />

        <Callout tone="info">
          {"Главная модель блока: приложение и СУБД развёрнуты отдельно, но связаны стабильным database contract."}
        </Callout>

      </Section>

      <Section number={"02"} title={"Пять уровней PostgreSQL без смешения терминов"}>
        <Lead>
          {"В разговоре словом «база» часто называют всё сразу. Для диагностики этого недостаточно: ошибка подключения к server и отсутствие table возникают на разных уровнях."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Пять уровней PostgreSQL без смешения терминов»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"server"} title={"PostgreSQL server process"} code={"postgres слушает port 5432"}>
            {"Долгоживущий процесс принимает подключения и управляет несколькими databases."}
          </TypeCard>
          <TypeCard badge={"database"} badgeTone="float" title={"Изолированное пространство"} code={"studyhub_dev"}>
            {"Клиент подключается к одной выбранной database; обычный SQL не перескакивает в другую."}
          </TypeCard>
          <TypeCard badge={"schema"} badgeTone="str" title={"Namespace объектов"} code={"public.tasks"}>
            {"Schema группирует таблицы и позволяет одинаковым именам существовать в разных пространствах."}
          </TypeCard>
          <TypeCard badge={"table"} title={"Структура строк"} code={"public.tasks"}>
            {"Table содержит колонки, ограничения и данные конкретной сущности."}
          </TypeCard>
        </TypeCards>

        <MatchPairs
          prompt={"Соедините термин с его ответственностью."}
          pairs={[
            { left: "server process", right: "принимает сетевые подключения" },
            { left: "database", right: "выбирается при подключении клиента" },
            { left: "schema", right: "задаёт namespace объектов" },
            { left: "table", right: "хранит строки и constraints" },
          ]}
          explanation={"Каждая пара связывает термин с его конкретной ролью в текущей модели."}
        />

        <Callout>
          {"В StudyHub используем default schema public. Пользовательские schemas появятся только при реальной потребности, а не ради усложнения структуры."}
        </Callout>

      </Section>

      <Section number={"03"} title={"Role, client, host и port"}>
        <Lead>
          {"К серверу подключается client. Он указывает сетевой адрес и role, от имени которой будут проверяться права. В PostgreSQL роль одновременно описывает идентичность подключения и набор привилегий."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Role, client, host и port»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>{"host"}</>, "машина или DNS-имя, где работает PostgreSQL server"],
            [<>{"port"}</>, "сетевой вход процесса; типичное значение PostgreSQL — 5432"],
            [<>{"database"}</>, "database, в контексте которой выполняются команды"],
            [<>{"role"}</>, "идентичность подключения и начальные privileges"],
            [<>{"client"}</>, "psql, GUI, SQLAlchemy или другое приложение"],
          ]}
        />

        <StepThrough
          code={"client: SQLAlchemy\nhost: localhost\nport: 5432\ndatabase: studyhub_dev\nrole: studyhub_app"}
          steps={[
            { line: 0, note: "SQLAlchemy выступает клиентом и использует DBAPI-driver.", vars: {"client": "SQLAlchemy"} },
            { line: 1, note: "Host выбирает компьютер с сервером.", vars: {"host": "localhost"} },
            { line: 2, note: "Port выбирает слушающий процесс.", vars: {"port": "5432"} },
            { line: 3, note: "После подключения выбирается database.", vars: {"database": "studyhub_dev"} },
            { line: 4, note: "Команды получают права role studyhub_app.", vars: {"role": "studyhub_app"} },
          ]}
        />

        <TrueFalse
          statement={<>{"Одна PostgreSQL role может подключаться только к одной database."}</>}
          isTrue={false}
          explanation={"Role принадлежит cluster и может получать разные privileges в разных databases. Доступ определяется настройками и grants."}
        />

      </Section>

      <Section number={"04"} title={"SQLite и PostgreSQL решают одну задачу по-разному"}>
        <Lead>
          {"Обе системы реляционные и понимают SQL, но их эксплуатационная модель различается. SQLite открывает файл внутри процесса, PostgreSQL обслуживает клиентов отдельным сервером."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «SQLite и PostgreSQL решают одну задачу по-разному»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <CompareSolutions
          question={"Какой вариант соответствует серверной модели?"}
          left={{
            title: "SQLite-файл",
            code: "sqlite:///./studyhub.db",
            note: "Процесс приложения открывает локальный файл напрямую.",
          }}
          right={{
            title: "PostgreSQL server",
            code: "postgresql+psycopg://role:password@host:5432/studyhub_dev",
            note: "Driver устанавливает сетевое соединение с отдельным процессом.",
          }}
          preferred={"right"}
          explanation={"Для блока 22 важна новая граница процесса и сети; HTTP-контракт приложения при этом сохраняется."}
        />

        <MethodGrid
          rows={[
            [<>{"deployment"}</>, "SQLite обычно файл рядом с приложением; PostgreSQL — отдельный service"],
            [<>{"concurrency"}</>, "PostgreSQL рассчитан на множество клиентских connections"],
            [<>{"permissions"}</>, "PostgreSQL имеет roles и object privileges"],
            [<>{"operations"}</>, "server нужно запускать, обновлять, резервировать и наблюдать"],
          ]}
        />

        <Callout tone="info">
          {"Это не соревнование «плохая SQLite против хорошего PostgreSQL». Выбор зависит от требований; сейчас PostgreSQL нужен как следующий учебный и production-like контекст."}
        </Callout>

      </Section>

      <Section number={"05"} title={"Connection URL как адрес подключения"}>
        <Lead>
          {"Connection URL собирает dialect, driver, credentials и сетевой адрес в одно конфигурационное значение. Его читает инфраструктурный слой, а не каждый endpoint отдельно."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Connection URL как адрес подключения»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <CodeBlock
          caption={"форма URL"}
          code={"postgresql+psycopg://studyhub_app:password@localhost:5432/studyhub_dev"}
        />

        <MethodGrid
          rows={[
            [<>{"postgresql"}</>, "SQLAlchemy dialect"],
            [<>{"psycopg"}</>, "синхронный DBAPI-driver"],
            [<>{"studyhub_app"}</>, "role для подключения"],
            [<>{"localhost:5432"}</>, "host и port PostgreSQL server"],
            [<>{"studyhub_dev"}</>, "выбранная database"],
          ]}
        />

        <FillBlank
          prompt={"Укажите database в конце URL."}
          before={"postgresql+psycopg://app:secret@localhost:5432/"}
          after={""}
          options={["studyhub_dev", "public", "tasks"]}
          answer={"studyhub_dev"}
          explanation={"После последнего slash указывается database; public является schema внутри неё."}
        />

        <Callout>
          {"Пароли со специальными символами нельзя бездумно вставлять в URL. В проекте Settings должен корректно собирать или валидировать URL, а секрет не коммитится."}
        </Callout>

      </Section>

      <Section number={"06"} title={"Путь запроса StudyHub до таблицы"}>
        <Lead>
          {"Теперь можно соединить HTTP и database flow. Endpoint не знает сетевые детали PostgreSQL: он получает Session, ORM формирует statement, Engine и driver доставляют его серверу."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Путь запроса StudyHub до таблицы»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <BranchExplorer
          code={"POST /tasks\n  ↓ Pydantic TaskCreate\nendpoint + Session\n  ↓ ORM statement\nEngine + psycopg\n  ↓ TCP\nPostgreSQL / studyhub_dev\n  ↓ public.tasks\nrow + generated id"}
          scenarios={[
            { label: "HTTP contract", activeLine: 0, output: "клиент отправляет прежний JSON" },
            { label: "database layer", activeLine: 4, output: "Engine выбирает dialect, pool и driver" },
            { label: "storage result", activeLine: 8, output: "PostgreSQL возвращает созданную row" },
          ]}
        />

        <RecallCard
          question={"Какие части маршрута должны измениться при переносе с SQLite?"}
          hint={"Сравните HTTP boundary и database infrastructure."}
          answer={
            <p>{"Меняются driver, DATABASE_URL и физическая СУБД. Paths, JSON-схемы, status codes и предметные правила должны остаться прежними."}</p>
          }
        />

        <Callout tone="info">
          {"Если смена СУБД требует переписать каждый endpoint, database infrastructure слишком сильно протекла в HTTP-слой."}
        </Callout>

      </Section>

      <Section number={"07"} title={"Четыре класса ошибок подключения"}>
        <Lead>
          {"Профессиональная диагностика начинается не с случайной правки кода, а с определения уровня сбоя: server, network address, credentials, database или schema object."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Четыре класса ошибок подключения»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <BranchExplorer
          code={"connect()\n├─ server unavailable\n├─ wrong host/port\n├─ authentication failed\n├─ database does not exist\n└─ relation does not exist"}
          scenarios={[
            { label: "connection refused", activeLine: 1, output: "проверить service, host и port" },
            { label: "password failed", activeLine: 3, output: "проверить role и secret" },
            { label: "relation missing", activeLine: 5, output: "соединение есть; проверить migrations и schema" },
          ]}
        />

        <TerminalDemo
          title={"диагностические сигналы"}
          lines={[
            { cmd: "pg_isready -h localhost -p 5432" },
            { out: "localhost:5432 - accepting connections" },
            { cmd: "psql -h localhost -U studyhub_app -d studyhub_dev -c \"select current_database();\"" },
            { out: " current_database\n------------------\n studyhub_dev" },
          ]}
        />

        <BugHunt
          code={"DATABASE_URL=postgresql+psycopg://studyhub_app:secret@localhost:5433/studyhub_dev"}
          question={"Почему исправление ORM-модели не поможет при connection refused?"}
          options={["Указан неверный port", "У таблицы нет primary key", "Pydantic не сериализует ответ"]}
          correctIndex={0}
          explanation={"Соединение не дошло до database и таблиц; сначала проверяется network address."}
          fix={"DATABASE_URL=postgresql+psycopg://studyhub_app:secret@localhost:5432/studyhub_dev"}
        />

      </Section>

      <Section number={"08"} title={"Контрольная точка: карта PostgreSQL"}>
        <Lead>
          {"Ученик должен проследить один запрос от FastAPI до public.tasks, назвать роль каждого уровня и определить, где искать причину трёх разных ошибок."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что является отдельным долгоживущим процессом?"}
            options={["PostgreSQL server", "schema public", "таблица tasks"]}
            correctIndex={0}
            explanation={"Server принимает connections и управляет databases."}
          />
          <QuizCard
            question={"Где находится schema public?"}
            options={["внутри выбранной database", "внутри FastAPI router", "внутри password"]}
            correctIndex={0}
            explanation={"Schema является namespace database objects."}
          />
          <QuizCard
            question={"Кто физически устанавливает соединение из Python?"}
            options={["DBAPI-driver", "Pydantic model", "response_model"]}
            correctIndex={0}
            explanation={"SQLAlchemy использует driver для общения с PostgreSQL."}
          />
          <QuizCard
            question={"Что должно сохраниться после миграции?"}
            options={["HTTP-контракт API", "путь к SQLite-файлу", "отсутствие network connection"]}
            correctIndex={0}
            explanation={"Клиент не должен зависеть от внутренней смены СУБД."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"PostgreSQL работает как отдельный server process."}</>,
            <>{"Client подключается по host и port от имени role."}</>,
            <>{"Database содержит schemas, а schema — tables и другие objects."}</>,
            <>{"public является default schema, а не отдельной database."}</>,
            <>{"Connection URL описывает dialect, driver, credentials и address."}</>,
            <>{"HTTP-контракт StudyHub не должен зависеть от физического хранилища."}</>,
            <>{"Диагностика начинается с уровня, на котором оборвался маршрут."}</>,
          ]}
        />

        <PracticeCta text={"Нарисуйте схему FastAPI → SQLAlchemy → psycopg → PostgreSQL server → studyhub_dev → public.tasks. Для ошибок connection refused, authentication failed и relation does not exist подпишите отдельные проверки и зафиксируйте результат коммитом docs: map postgresql connection flow."} />

      </Section>

    </RichLesson>
  );
}

// 124. Установка, psql и первая база
export function Lesson124({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Установка, psql и первая база"}
        intro={"Запустим PostgreSQL как service, подключимся через psql, создадим первую database и научимся проверять соединение и структуру без FastAPI и ORM."}
        tags={[
          { icon: <Wrench size={14} />, label: "service и pg_isready" },
          { icon: <FileText size={14} />, label: "psql · meta-commands" },
        ]}
      />
      <TheoryBridge lesson={124} />

      <Section number={"01"} title={"Сначала сервер, потом приложение"}>
        <Lead>
          {"До подключения StudyHub нужно доказать, что PostgreSQL установлен, service запущен и port принимает connections. Это отдельная инфраструктурная проверка без FastAPI."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Сначала сервер, потом приложение»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Проверить установку:"}</strong> {" убедиться, что доступны postgres tools и service."}
            </li>
            <li>
              <strong>{"Проверить readiness:"}</strong> {" использовать pg_isready для host и port."}
            </li>
            <li>
              <strong>{"Подключиться psql:"}</strong> {" явно указать host, role и database."}
            </li>
            <li>
              <strong>{"Создать database:"}</strong> {" подготовить studyhub_dev и проверить её структуру."}
            </li>
          </ol>
          <p>{"После урока ученик может повторить подключение на чистой машине и отделяет server problem от application problem."}</p>
        </div>

        <TerminalDemo
          title={"минимальная проверка server"}
          lines={[
            { cmd: "psql --version" },
            { out: "psql (PostgreSQL)" },
            { cmd: "pg_isready -h localhost -p 5432" },
            { out: "localhost:5432 - accepting connections" },
          ]}
        />

        <Callout tone="info">
          {"Команда запуска service зависит от операционной системы. Универсальная часть урока — проверить, что server принимает connections по ожидаемому адресу."}
        </Callout>

      </Section>

      <Section number={"02"} title={"pg_isready проверяет доступность server"}>
        <Lead>
          {"pg_isready выполняет узкую проверку: отвечает ли PostgreSQL на host и port. Он не подтверждает существование таблиц и не заменяет login конкретной role."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «pg_isready проверяет доступность server»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"accepting"} title={"Server отвечает"} code={"localhost:5432 - accepting connections"}>
            {"Можно переходить к проверке credentials и database."}
          </TypeCard>
          <TypeCard badge={"no response"} badgeTone="float" title={"Server недоступен"} code={"localhost:5432 - no response"}>
            {"Проверяются service, host, port и firewall."}
          </TypeCard>
          <TypeCard badge={"rejecting"} badgeTone="str" title={"Server запускается"} code={"rejecting connections"}>
            {"Процесс найден, но ещё не готов принимать обычные clients."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={<>{"Успешный pg_isready доказывает, что таблица tasks существует."}</>}
          isTrue={false}
          explanation={"Команда проверяет доступность server, но не schema state конкретной database."}
        />

        <Callout>
          {"Используйте маленькие проверки: сначала доступность процесса, затем authentication, затем database, затем tables."}
        </Callout>

      </Section>

      <Section number={"03"} title={"Первое подключение через psql"}>
        <Lead>
          {"psql — интерактивный client PostgreSQL. Параметры команды делают connection contract видимым и не зависят от догадок о текущем пользователе ОС."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Первое подключение через psql»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <CodeBlock
          caption={"явное подключение"}
          code={"psql -h localhost -p 5432 -U postgres -d postgres"}
        />

        <MethodGrid
          rows={[
            [<>{"-h localhost"}</>, "host server"],
            [<>{"-p 5432"}</>, "port процесса"],
            [<>{"-U postgres"}</>, "role подключения"],
            [<>{"-d postgres"}</>, "database для текущей session"],
            [<>{"\\q"}</>, "завершить psql session"],
          ]}
        />

        <FillBlank
          prompt={"Добавьте параметр выбора database."}
          before={"psql -h localhost -U postgres "}
          after={" studyhub_dev"}
          options={["-d", "-p", "-U"]}
          answer={"-d"}
          explanation={"Флаг -d выбирает database, к которой подключается psql."}
        />

        <Callout>
          {"Пароль вводится интерактивно или передаётся безопасным способом окружения. Не добавляйте реальный secret в историю shell и README."}
        </Callout>

      </Section>

      <Section number={"04"} title={"Meta-commands показывают контекст psql"}>
        <Lead>
          {"Команды, начинающиеся с обратного slash, обрабатывает psql client. Это не SQL statements и обычно завершаются без точки с запятой."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Meta-commands показывают контекст psql»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>{"\\conninfo"}</>, "показать текущее connection"],
            [<>{"\\l"}</>, "список databases"],
            [<>{"\\c studyhub_dev"}</>, "переключиться на database новым connection"],
            [<>{"\\dn"}</>, "список schemas"],
            [<>{"\\dt"}</>, "список tables в search path"],
            [<>{"\\d tasks"}</>, "описать columns и constraints table"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините meta-command и наблюдаемый результат."}
          pairs={[
            { left: "\\l", right: "databases" },
            { left: "\\c", right: "новое connection к database" },
            { left: "\\dt", right: "tables" },
            { left: "\\d tasks", right: "структура table tasks" },
          ]}
          explanation={"Каждая пара связывает термин с его конкретной ролью в текущей модели."}
        />

        <BugHunt
          code={"SELECT \\dt;"}
          question={"Почему эта строка ошибочна?"}
          options={["\\dt является psql meta-command, а не SQL", "SELECT нельзя писать в PostgreSQL", "Таблицы доступны только FastAPI"]}
          correctIndex={0}
          explanation={"Meta-command вводится отдельно без SELECT и semicolon."}
          fix={"\\dt"}
        />

      </Section>

      <Section number={"05"} title={"Создаём studyhub_dev осознанно"}>
        <Lead>
          {"Database создаётся административной role, после чего к ней устанавливается отдельное connection. CREATE DATABASE нельзя выполнить внутри transaction block."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Создаём studyhub_dev осознанно»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <CodeBlock
          caption={"создание первой database"}
          code={"CREATE DATABASE studyhub_dev;"}
        />

        <TerminalDemo
          title={"создание и переключение"}
          lines={[
            { cmd: "psql -h localhost -U postgres -d postgres" },
            { out: "postgres=#" },
            { cmd: "CREATE DATABASE studyhub_dev;" },
            { out: "CREATE DATABASE" },
            { cmd: "\\c studyhub_dev" },
            { out: "You are now connected to database \"studyhub_dev\"." },
          ]}
        />

        <PredictOutput
          code={"SELECT current_database();"}
          output={"studyhub_dev"}
          hint={"После \\c все следующие SQL statements выполняются в новом connection."}
        />

        <Callout>
          {"На следующем занятии database будет создаваться сразу с owner studyhub_app. Здесь цель — освоить connection и database context."}
        </Callout>

      </Section>

      <Section number={"06"} title={"Тестовая table как инструмент наблюдения"}>
        <Lead>
          {"До Alembic полезно один раз вручную создать маленькую disposable table. Она показывает, что SQL выполняется в выбранной database и schema."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Тестовая table как инструмент наблюдения»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <CodeBlock
          caption={"временная лабораторная table"}
          code={"CREATE TABLE connection_check (\n    id integer PRIMARY KEY,\n    note text NOT NULL\n);\n\nINSERT INTO connection_check (id, note)\nVALUES (1, 'psql works');"}
        />

        <TerminalDemo
          title={"проверка структуры и строки"}
          lines={[
            { cmd: "\\dt" },
            { out: "public | connection_check | table" },
            { cmd: "\\d connection_check" },
            { out: "id integer not null primary key\nnote text not null" },
            { cmd: "SELECT * FROM connection_check;" },
            { out: "1 | psql works" },
          ]}
        />

        <RecallCard
          question={"Зачем создавать временную table до подключения StudyHub?"}
          hint={"Она проверяет цепочку server → database → schema → SQL."}
          answer={
            <p>{"Лабораторная table изолирует инфраструктурный сценарий: мы подтверждаем connection, выбранную database, schema public и выполнение SQL без влияния ORM и FastAPI."}</p>
          }
        />

        <Callout tone="info">
          {"После эксперимента удалите connection_check. Реальная схема StudyHub будет восстановлена только Alembic migrations."}
        </Callout>

      </Section>

      <Section number={"07"} title={"Connection refused: диагностируем сверху вниз"}>
        <Lead>
          {"Сообщение connection refused означает, что client не установил TCP connection. Проверка password или table на этом этапе преждевременна."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Connection refused: диагностируем сверху вниз»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <CodeSequence
          title={"Соберите порядок диагностики"}
          prompt={"Расположите проверки от инфраструктуры к данным."}
          pieces={[
            { id: "ready", code: "pg_isready -h localhost -p 5432" },
            { id: "address", code: "сверить host и port" },
            { id: "login", code: "psql с явными -U и -d" },
            { id: "context", code: "\\conninfo" },
            { id: "tables", code: "\\dt" },
            { id: "orm", code: "переписывать ORM-модели", note: "не относится к connection refused" },
          ]}
          correctOrder={["ready", "address", "login", "context", "tables"]}
          explanation={"Каждая следующая проверка имеет смысл только после успеха предыдущего слоя."}
        />

        <TerminalDemo
          title={"ошибка и локализация"}
          lines={[
            { cmd: "psql -h localhost -p 5433 -U postgres -d postgres" },
            { out: "connection to server at \"localhost\", port 5433 failed: Connection refused" },
            { cmd: "pg_isready -h localhost -p 5432" },
            { out: "localhost:5432 - accepting connections" },
          ]}
        />

        <Callout>
          {"Не меняйте сразу несколько параметров. Исправьте port, повторите ровно ту же команду и зафиксируйте, какой слой стал успешным."}
        </Callout>

      </Section>

      <Section number={"08"} title={"Контрольная точка: самостоятельный psql flow"}>
        <Lead>
          {"Ученик должен с нуля проверить server, подключиться, создать database, переключить context, создать и удалить лабораторную table, а затем объяснить каждую команду."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что проверяет pg_isready?"}
            options={["доступность PostgreSQL server", "наличие всех migrations", "валидность Pydantic schema"]}
            correctIndex={0}
            explanation={"Это проверка server по host и port."}
          />
          <QuizCard
            question={"Как выбрать database в psql command?"}
            options={["-d studyhub_dev", "-p studyhub_dev", "-U studyhub_dev"]}
            correctIndex={0}
            explanation={"Флаг -d задаёт database."}
          />
          <QuizCard
            question={"Что делает \\dt?"}
            options={["показывает tables", "удаляет transaction", "меняет password"]}
            correctIndex={0}
            explanation={"Это psql meta-command списка tables."}
          />
          <QuizCard
            question={"Что проверять первым при connection refused?"}
            options={["service, host и port", "response_model", "foreign key tasks"]}
            correctIndex={0}
            explanation={"Connection ещё не дошёл до database objects."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"PostgreSQL installation создаёт server tools и service."}</>,
            <>{"pg_isready проверяет network readiness server."}</>,
            <>{"psql является client и подключается с явными host, role и database."}</>,
            <>{"Meta-commands помогают увидеть connection и objects."}</>,
            <>{"Database context меняется через новое connection."}</>,
            <>{"Disposable table полезна как изолированный infrastructure test."}</>,
            <>{"Connection refused диагностируется до credentials и schema."}</>,
          ]}
        />

        <PracticeCta text={"Создайте studyhub_dev, подключитесь через psql, выполните \\conninfo, \\dn и \\dt, создайте временную connection_check, прочитайте её через SELECT и удалите. В README добавьте runbook подключения без реального password."} />

      </Section>

    </RichLesson>
  );
}

// 125. Roles, ownership и минимальные права
export function Lesson125({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Roles, ownership и минимальные права"}
        intro={"Создадим отдельную login-role StudyHub, назначим ownership development и test databases и проверим, почему приложение не должно работать с правами PostgreSQL superuser."}
        tags={[
          { icon: <KeyRound size={14} />, label: "role · LOGIN · password" },
          { icon: <ShieldCheck size={14} />, label: "ownership и least privilege" },
        ]}
      />
      <TheoryBridge lesson={125} />

      <Section number={"01"} title={"Почему superuser опасен для приложения"}>
        <Lead>
          {"Superuser обходит обычные проверки privileges. Ошибка в endpoint или утечка credentials тогда получает намного больший blast radius, чем нужно CRUD-сервису."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Почему superuser опасен для приложения»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Создать login-role:"}</strong> {" дать приложению отдельную идентичность."}
            </li>
            <li>
              <strong>{"Запретить административные возможности:"}</strong> {" NOSUPERUSER, NOCREATEDB и NOCREATEROLE."}
            </li>
            <li>
              <strong>{"Назначить ownership:"}</strong> {" сделать role владельцем dev/test databases учебного проекта."}
            </li>
            <li>
              <strong>{"Проверить отказ:"}</strong> {" убедиться, что app role не может создать новую database."}
            </li>
          </ol>
          <p>{"StudyHub подключается своей role, а административная role используется только для инфраструктурной настройки."}</p>
        </div>

        <CompareSolutions
          question={"Какие credentials должен использовать обычный API?"}
          left={{
            title: "postgres superuser",
            code: "postgresql://postgres:secret@localhost/studyhub_dev",
            note: "Любая ошибка приложения получает административные возможности.",
          }}
          right={{
            title: "studyhub_app",
            code: "postgresql://studyhub_app:secret@localhost/studyhub_dev",
            note: "Role имеет только необходимые проекту возможности.",
          }}
          preferred={"right"}
          explanation={"Least privilege ограничивает последствия ошибки и делает ownership объектов явным."}
        />

        <Callout tone="info">
          {"В локальном обучении риски меньше, но правильная модель identities должна появиться до production-инфраструктуры."}
        </Callout>

      </Section>

      <Section number={"02"} title={"Role и LOGIN — две части модели"}>
        <Lead>
          {"Role является именованным набором атрибутов и privileges. Только role с LOGIN может использоваться как начальная identity обычного connection."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Role и LOGIN — две части модели»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"ROLE"} title={"Общая сущность доступа"} code={"CREATE ROLE studyhub_app;"}>
            {"Может владеть objects, получать grants и входить в другие roles."}
          </TypeCard>
          <TypeCard badge={"LOGIN"} badgeTone="float" title={"Разрешение подключаться"} code={"ALTER ROLE studyhub_app LOGIN;"}>
            {"Делает role пригодной для client authentication."}
          </TypeCard>
          <TypeCard badge={"PASSWORD"} badgeTone="str" title={"Secret authentication"} code={"PASSWORD 'change-me'"}>
            {"Хранится вне repository и передаётся через environment configuration."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={<>{"Каждая PostgreSQL role автоматически может подключаться к server."}</>}
          isTrue={false}
          explanation={"Для обычного password connection role должна иметь LOGIN и пройти authentication rules."}
        />

        <MatchPairs
          prompt={"Соедините атрибут и эффект."}
          pairs={[
            { left: "LOGIN", right: "разрешает использовать role при connection" },
            { left: "SUPERUSER", right: "обходит обычные privilege checks" },
            { left: "CREATEDB", right: "разрешает создавать databases" },
            { left: "CREATEROLE", right: "разрешает управлять другими roles" },
          ]}
          explanation={"Каждая пара связывает термин с его конкретной ролью в текущей модели."}
        />

      </Section>

      <Section number={"03"} title={"Создаём studyhub_app с ограниченными атрибутами"}>
        <Lead>
          {"Role приложения создаётся административной identity. Ограничения записываются явно, чтобы команда читалась как security contract."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Создаём studyhub_app с ограниченными атрибутами»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <CodeBlock
          caption={"login-role приложения"}
          code={"CREATE ROLE studyhub_app WITH\n    LOGIN\n    PASSWORD 'change-me'\n    NOSUPERUSER\n    NOCREATEDB\n    NOCREATEROLE;"}
        />

        <TerminalDemo
          title={"проверяем атрибуты"}
          lines={[
            { cmd: "\\du studyhub_app" },
            { out: "Role name   | Attributes\nstudyhub_app |" },
            { cmd: "SELECT rolname, rolsuper, rolcreatedb, rolcreaterole\nFROM pg_roles\nWHERE rolname = 'studyhub_app';" },
            { out: "studyhub_app | f | f | f" },
          ]}
        />

        <BugHunt
          code={"CREATE ROLE studyhub_app WITH LOGIN SUPERUSER PASSWORD 'secret';"}
          question={"Какой атрибут нарушает принцип минимальных прав?"}
          options={["SUPERUSER", "LOGIN", "PASSWORD"]}
          correctIndex={0}
          explanation={"Приложению не нужны глобальные административные возможности."}
          fix={"CREATE ROLE studyhub_app WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD 'change-me';"}
        />

        <Callout>
          {"Пример password является placeholder. Реальный secret генерируется отдельно, не публикуется и не хранится в учебном TSX или README."}
        </Callout>

      </Section>

      <Section number={"04"} title={"Ownership отвечает за объект"}>
        <Lead>
          {"Owner может изменять или удалять принадлежащий ему объект и обычно выдавать privileges другим roles. Grant даёт конкретное действие, но не передаёт ownership."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Ownership отвечает за объект»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>{"OWNER"}</>, "контролирует объект и может управлять его privileges"],
            [<>{"CONNECT"}</>, "разрешает подключение к database"],
            [<>{"USAGE ON SCHEMA"}</>, "разрешает обращаться к objects внутри schema"],
            [<>{"SELECT/INSERT/UPDATE/DELETE"}</>, "операции над table data"],
            [<>{"CREATE ON SCHEMA"}</>, "разрешает создавать objects в schema"],
          ]}
        />

        <CompareSolutions
          question={"Что лучше для учебной dev database?"}
          left={{
            title: "Случайный owner postgres",
            code: "CREATE DATABASE studyhub_dev;",
            note: "Миграции app role могут упереться в ownership и grants.",
          }}
          right={{
            title: "Явный owner приложения",
            code: "CREATE DATABASE studyhub_dev OWNER studyhub_app;",
            note: "Role, запускающая migrations, владеет development database.",
          }}
          preferred={"right"}
          explanation={"Для локального курса одна ограниченная app/migration role упрощает модель. Разделение runtime и migration roles откладывается до production-hardening."}
        />

        <Callout tone="info">
          {"Ownership сильнее отдельного GRANT. Не называйте эти механизмы взаимозаменяемыми."}
        </Callout>

      </Section>

      <Section number={"05"} title={"Development и test databases должны быть раздельны"}>
        <Lead>
          {"Тесты обязаны свободно очищать данные и применять migrations, не рискуя development state. Разделение начинается на уровне database names и configuration."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Development и test databases должны быть раздельны»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <CodeBlock
          caption={"две databases с одним ограниченным owner"}
          code={"CREATE DATABASE studyhub_dev OWNER studyhub_app;\nCREATE DATABASE studyhub_test OWNER studyhub_app;"}
        />

        <MethodGrid
          rows={[
            [<>{"studyhub_dev"}</>, "ручная разработка и локальные demo data"],
            [<>{"studyhub_test"}</>, "автоматические tests и controlled cleanup"],
            [<>{"DATABASE_URL"}</>, "development connection"],
            [<>{"TEST_DATABASE_URL"}</>, "test connection, не совпадающий с development"],
          ]}
        />

        <BugHunt
          code={"DATABASE_URL=.../studyhub_dev\nTEST_DATABASE_URL=.../studyhub_dev"}
          question={"Какой риск создаёт одинаковая database?"}
          options={["Тест может удалить development data", "PostgreSQL перестанет поддерживать SQL", "Pydantic потеряет validation"]}
          correctIndex={0}
          explanation={"Test fixtures часто очищают tables и должны быть изолированы."}
          fix={"DATABASE_URL=.../studyhub_dev\nTEST_DATABASE_URL=.../studyhub_test"}
        />

        <Callout>
          {"Отдельная database — более сильная граница, чем разные таблицы с префиксом test_."}
        </Callout>

      </Section>

      <Section number={"06"} title={"GRANT и REVOKE как явные изменения доступа"}>
        <Lead>
          {"Privileges назначаются на конкретные object types. Команда GRANT не делает role владельцем и не выдаёт автоматически права на будущие objects без отдельной настройки."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «GRANT и REVOKE как явные изменения доступа»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <CodeBlock
          caption={"пример доступа runtime-role к готовой schema"}
          code={"GRANT CONNECT ON DATABASE studyhub_dev TO studyhub_runtime;\nGRANT USAGE ON SCHEMA public TO studyhub_runtime;\nGRANT SELECT, INSERT, UPDATE, DELETE\nON ALL TABLES IN SCHEMA public\nTO studyhub_runtime;"}
        />

        <CodeBlock
          caption={"отзыв лишней возможности"}
          code={"REVOKE CREATE ON SCHEMA public FROM studyhub_runtime;"}
        />

        <RecallCard
          question={"Почему этот пример не заменяет ownership?"}
          hint={"Сравните право выполнить действие и контроль объекта."}
          answer={
            <p>{"GRANT выдаёт перечисленные operations. Owner сохраняет более широкий контроль объекта и возможность управлять privileges; это разные уровни доступа."}</p>
          }
        />

        <Callout tone="info">
          {"В основном проекте блока используем одну studyhub_app role для migrations и runtime. Отдельная runtime-role показана как профессиональная следующая ступень, а не обязательное усложнение сейчас."}
        </Callout>

      </Section>

      <Section number={"07"} title={"Разрешённая и запрещённая операция"}>
        <Lead>
          {"Security rule считается понятным, когда её можно проверить положительным и отрицательным сценарием. App role должна работать внутри своих databases, но не управлять cluster."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Разрешённая и запрещённая операция»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <TerminalDemo
          title={"permission experiment"}
          lines={[
            { cmd: "psql -h localhost -U studyhub_app -d studyhub_dev" },
            { out: "studyhub_dev=>" },
            { cmd: "CREATE TABLE permission_check (id integer PRIMARY KEY);" },
            { out: "CREATE TABLE" },
            { cmd: "CREATE DATABASE forbidden_database;" },
            { out: "ERROR: permission denied to create database" },
          ]}
        />

        <BranchExplorer
          code={"studyhub_app command\n├─ CREATE TABLE in owned dev database\n└─ CREATE DATABASE new_db"}
          scenarios={[
            { label: "project object", activeLine: 1, output: "разрешено владельцу development database" },
            { label: "cluster administration", activeLine: 2, output: "запрещено: NOCREATEDB" },
          ]}
        />

        <Callout>
          {"Ожидаемый permission denied является успешной security-проверкой, а не поломкой настройки."}
        </Callout>

      </Section>

      <Section number={"08"} title={"Контрольная точка: identity и права StudyHub"}>
        <Lead>
          {"Ученик создаёт studyhub_app, две databases, выполняет allowed/denied experiment и может объяснить разницу role, LOGIN, owner и privilege."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что нужно role для обычного client connection?"}
            options={["LOGIN", "SUPERUSER", "CREATEDB"]}
            correctIndex={0}
            explanation={"LOGIN разрешает использовать role при подключении."}
          />
          <QuizCard
            question={"Почему API не должен использовать superuser?"}
            options={["слишком большой blast radius", "superuser не умеет SELECT", "FastAPI запрещает roles"]}
            correctIndex={0}
            explanation={"Приложению не нужны cluster-wide privileges."}
          />
          <QuizCard
            question={"Что означает OWNER?"}
            options={["контроль конкретного object", "только право SELECT", "название host"]}
            correctIndex={0}
            explanation={"Ownership даёт контроль объекта и его privileges."}
          />
          <QuizCard
            question={"Зачем отдельная studyhub_test?"}
            options={["изолировать destructive test operations", "ускорить Pydantic", "заменить pytest"]}
            correctIndex={0}
            explanation={"Tests не должны изменять development data."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"PostgreSQL использует единый механизм roles."}</>,
            <>{"LOGIN разрешает role участвовать в authentication."}</>,
            <>{"Application role не получает SUPERUSER, CREATEDB и CREATEROLE."}</>,
            <>{"Ownership и GRANT являются разными механизмами."}</>,
            <>{"Development и test databases изолируются."}</>,
            <>{"Secrets подключения не коммитятся."}</>,
            <>{"Отрицательная permission-проверка подтверждает least privilege."}</>,
          ]}
        />

        <PracticeCta text={"Создайте studyhub_app с LOGIN и без административных атрибутов, затем studyhub_dev и studyhub_test с явным owner. Подключитесь app-role, создайте table в dev database и подтвердите отказ CREATE DATABASE. Добавьте в README таблицу разрешённых и запрещённых действий."} />

      </Section>

    </RichLesson>
  );
}

// 126. DATABASE_URL и SQLAlchemy Engine для PostgreSQL
export function Lesson126({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"DATABASE_URL и SQLAlchemy Engine для PostgreSQL"}
        intro={"Переключим database infrastructure StudyHub на PostgreSQL через Settings, psycopg и синхронный SQLAlchemy Engine, не меняя endpoint-контракты и ORM-модели без необходимости."}
        tags={[
          { icon: <Layers size={14} />, label: "Settings → Engine → Pool" },
          { icon: <HardDrive size={14} />, label: "psycopg · SELECT 1" },
        ]}
      />
      <TheoryBridge lesson={126} />

      <Section number={"01"} title={"Смена database должна начинаться с конфигурации"}>
        <Lead>
          {"Если ORM-модели описывают переносимые типы и ограничения, основной код CRUD может сохраниться. Точкой переключения становится DATABASE_URL и driver."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Смена database должна начинаться с конфигурации»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Установить driver:"}</strong> {" добавить psycopg для синхронного connection."}
            </li>
            <li>
              <strong>{"Обновить Settings:"}</strong> {" получать DATABASE_URL из environment."}
            </li>
            <li>
              <strong>{"Создать Engine:"}</strong> {" явно выбрать PostgreSQL dialect и pool behavior."}
            </li>
            <li>
              <strong>{"Проверить SELECT 1:"}</strong> {" отделить connection test от schema migrations."}
            </li>
          </ol>
          <p>{"StudyHub создаёт рабочее PostgreSQL connection из configuration, а HTTP-слой не знает пароль и host."}</p>
        </div>

        <CompareSolutions
          question={"Где должна происходить смена SQLite на PostgreSQL?"}
          left={{
            title: "Во всех endpoints",
            code: "engine = create_engine(\"...\")  # в каждом router",
            note: "Infrastructure дублируется и протекает в HTTP layer.",
          }}
          right={{
            title: "В database/config modules",
            code: "settings.database_url → create_engine(...)",
            note: "Endpoint продолжает получать Session через dependency.",
          }}
          preferred={"right"}
          explanation={"Central configuration ограничивает blast radius изменения."}
        />

        <Callout tone="info">
          {"Сначала меняется infrastructure boundary, затем запускаются migrations и regression tests. Не переписывайте CRUD заранее."}
        </Callout>

      </Section>

      <Section number={"02"} title={"Выбираем psycopg и явный dialect URL"}>
        <Lead>
          {"SQLAlchemy поддерживает разные PostgreSQL drivers. В синхронном этапе используем современный psycopg и явно указываем его в URL."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Выбираем psycopg и явный dialect URL»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <CodeBlock
          caption={"dependency проекта"}
          code={"pip install \"psycopg[binary]\""}
        />

        <CodeBlock
          caption={"явный SQLAlchemy URL"}
          code={"postgresql+psycopg://studyhub_app:secret@localhost:5432/studyhub_dev"}
        />

        <TypeCards>
          <TypeCard badge={"postgresql"} title={"Dialect"} code={"PostgreSQL-specific SQL behavior"}>
            {"SQLAlchemy выбирает правила SQL и типов PostgreSQL."}
          </TypeCard>
          <TypeCard badge={"psycopg"} badgeTone="float" title={"DBAPI-driver"} code={"Python ↔ PostgreSQL protocol"}>
            {"Driver физически открывает connection и передаёт параметры."}
          </TypeCard>
          <TypeCard badge={"Engine"} badgeTone="str" title={"Infrastructure facade"} code={"dialect + pool"}>
            {"Application запрашивает connections через единый объект."}
          </TypeCard>
        </TypeCards>

        <Callout>
          {"На этапе 7 появится async driver usage. Сейчас create_engine и обычный Session остаются синхронными."}
        </Callout>

      </Section>

      <Section number={"03"} title={"Settings является единственным источником URL"}>
        <Lead>
          {"Environment configuration позволяет запускать одинаковый код с development и test databases. .env.example документирует имена, но не содержит настоящих secrets."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Settings является единственным источником URL»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <CodeBlock
          caption={"config.py"}
          code={"from pydantic_settings import BaseSettings, SettingsConfigDict\n\n\nclass Settings(BaseSettings):\n    database_url: str\n    test_database_url: str\n\n    model_config = SettingsConfigDict(\n        env_file=\".env\",\n        extra=\"ignore\",\n    )\n\n\nsettings = Settings()"}
        />

        <CodeBlock
          caption={".env.example"}
          code={"DATABASE_URL=postgresql+psycopg://studyhub_app:CHANGE_ME@localhost:5432/studyhub_dev\nTEST_DATABASE_URL=postgresql+psycopg://studyhub_app:CHANGE_ME@localhost:5432/studyhub_test"}
        />

        <BugHunt
          code={"DATABASE_URL=postgresql+psycopg://studyhub_app:real-production-password@localhost/studyhub_dev\n# committed to Git"}
          question={"В чём основная проблема?"}
          options={["Secret попал в repository", "URL слишком длинный для Python", "PostgreSQL не поддерживает password"]}
          correctIndex={0}
          explanation={"Секрет нужно хранить вне Git и заменить при утечке."}
          fix={"DATABASE_URL=postgresql+psycopg://studyhub_app:CHANGE_ME@localhost:5432/studyhub_dev  # только .env.example"}
        />

      </Section>

      <Section number={"04"} title={"Engine объединяет dialect и connection pool"}>
        <Lead>
          {"Engine является центральной точкой SQLAlchemy. Он знает URL, dialect и pool, но Session по-прежнему задаёт unit of work для конкретной операции или request."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Engine объединяет dialect и connection pool»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <CodeBlock
          caption={"database.py"}
          code={"from sqlalchemy import create_engine\nfrom sqlalchemy.orm import sessionmaker\n\nfrom app.config import settings\n\n\nengine = create_engine(\n    settings.database_url,\n    pool_pre_ping=True,\n)\n\nSessionLocal = sessionmaker(\n    bind=engine,\n    autoflush=False,\n    expire_on_commit=False,\n)"}
        />

        <MethodGrid
          rows={[
            [<>{"Engine"}</>, "источник connections и dialect behavior"],
            [<>{"Pool"}</>, "переиспользует ограниченный набор connections"],
            [<>{"SessionLocal"}</>, "factory новых ORM Session"],
            [<>{"Session"}</>, "unit of work конкретной операции"],
            [<>{"pool_pre_ping"}</>, "проверяет connection при выдаче из pool"],
          ]}
        />

        <TrueFalse
          statement={<>{"Engine равен одной глобальной ORM Session."}</>}
          isTrue={false}
          explanation={"Engine управляет connectivity и pool; Session создаётся отдельно и имеет собственный transactional state."}
        />

      </Section>

      <Section number={"05"} title={"Connection открывается при первом реальном использовании"}>
        <Lead>
          {"Создание Engine обычно не доказывает доступность server. Минимальный connection test должен явно получить connection и выполнить statement."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Connection открывается при первом реальном использовании»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <StepThrough
          code={"engine = create_engine(url)\n\nwith engine.connect() as connection:\n    value = connection.scalar(text(\"SELECT 1\"))\n\nprint(value)"}
          steps={[
            { line: 0, note: "Создаётся Engine configuration; network connection ещё может не открыться.", vars: {"engine": "configured"} },
            { line: 2, note: "connect() получает connection из pool или открывает новое.", vars: {"connection": "checked out"} },
            { line: 3, note: "SELECT 1 проходит через dialect и psycopg на server.", vars: {"statement": "SELECT 1"} },
            { line: 5, note: "После context connection возвращается pool, а value равен 1.", vars: {"value": "1"} },
          ]}
        />

        <CodeBlock
          caption={"scripts/check_database.py"}
          code={"from sqlalchemy import text\n\nfrom app.database import engine\n\n\nwith engine.connect() as connection:\n    result = connection.scalar(text(\"SELECT 1\"))\n\nprint(f\"database check: {result}\")"}
        />

        <PredictOutput
          code={"connection.scalar(text(\"SELECT 1\"))"}
          output={"1"}
          hint={"Statement возвращает одну row с одним scalar value."}
        />

        <Callout tone="info">
          {"SELECT 1 подтверждает connection и выполнение SQL, но не доказывает наличие schema StudyHub. Это задача Alembic следующего урока."}
        </Callout>

      </Section>

      <Section number={"06"} title={"Pool переиспользует connections, а не создаёт их бесконечно"}>
        <Lead>
          {"Server connection — дорогой и ограниченный ресурс. Pool выдаёт connection на время работы и получает его обратно после close/context exit."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Pool переиспользует connections, а не создаёт их бесконечно»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <BranchExplorer
          code={"HTTP request\n  ↓ SessionLocal()\nSession requests connection\n  ↓\nEngine Pool\n├─ reuse idle connection\n└─ open new within limits\n  ↓\ncommit/rollback + close\nconnection returns to pool"}
          scenarios={[
            { label: "request starts", activeLine: 1, output: "создаётся новая ORM Session" },
            { label: "SQL needed", activeLine: 3, output: "Session получает connection через Engine" },
            { label: "request ends", activeLine: 8, output: "connection возвращается pool" },
          ]}
        />

        <RecallCard
          question={"Почему нельзя держать одну global Session для всех requests?"}
          hint={"Session содержит transactional и identity-map state."}
          answer={
            <p>{"Разные requests начнут разделять transaction state и ORM objects. Правильная граница — отдельная Session на request, использующая общий Engine/Pool."}</p>
          }
        />

        <Callout>
          {"Размеры pool и production tuning не вводим до измеримой нагрузки. Сейчас важна модель checkout → use → return."}
        </Callout>

      </Section>

      <Section number={"07"} title={"OperationalError переводим в проверяемые причины"}>
        <Lead>
          {"Один stack trace может содержать детали driver, SQLAlchemy и ОС. Сначала извлекаем стабильные признаки: refused, authentication failed, unknown host или missing database."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «OperationalError переводим в проверяемые причины»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <BranchExplorer
          code={"database check failed\n├─ could not translate host name\n├─ connection refused\n├─ password authentication failed\n└─ database does not exist"}
          scenarios={[
            { label: "DNS/host", activeLine: 1, output: "проверить имя host" },
            { label: "network/service", activeLine: 2, output: "проверить pg_isready и port" },
            { label: "credentials", activeLine: 3, output: "проверить role и secret" },
          ]}
        />

        <TerminalDemo
          title={"минимальный runbook"}
          lines={[
            { cmd: "python -m scripts.check_database" },
            { out: "sqlalchemy.exc.OperationalError: connection refused" },
            { cmd: "pg_isready -h localhost -p 5432" },
            { out: "localhost:5432 - accepting connections" },
            { cmd: "python -m scripts.check_database" },
            { out: "database check: 1" },
          ]}
        />

        <BugHunt
          code={"engine = create_engine(\"postgresql+psycopg://studyhub_app:wrong@localhost:5432/studyhub_dev\")"}
          question={"Какой слой проверяется после успешного pg_isready?"}
          options={["credentials role", "Pydantic response", "HTTP CORS"]}
          correctIndex={0}
          explanation={"Server отвечает, поэтому следующая граница — authentication конкретной role."}
          fix={"engine = create_engine(settings.database_url, pool_pre_ping=True)"}
        />

      </Section>

      <Section number={"08"} title={"Контрольная точка: Engine подключён"}>
        <Lead>
          {"Ученик устанавливает driver, создаёт Settings и Engine, выполняет SELECT 1 для dev/test URLs и объясняет разницу Engine, Pool, Connection и Session."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что обозначает psycopg в URL?"}
            options={["DBAPI-driver", "database name", "schema"]}
            correctIndex={0}
            explanation={"Driver реализует Python connection к PostgreSQL."}
          />
          <QuizCard
            question={"Когда create_engine обычно доказывает connection?"}
            options={["не обязательно при создании; при первом использовании", "до чтения URL", "после импорта router автоматически"]}
            correctIndex={0}
            explanation={"Engine создаётся lazy относительно network connection."}
          />
          <QuizCard
            question={"Что переиспользует Pool?"}
            options={["database connections", "Pydantic models", "HTTP status codes"]}
            correctIndex={0}
            explanation={"Pool управляет connections."}
          />
          <QuizCard
            question={"Что подтверждает SELECT 1?"}
            options={["connection и выполнение statement", "все migrations применены", "данные перенесены"]}
            correctIndex={0}
            explanation={"Schema проверяется отдельно."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Database switch начинается в configuration layer."}</>,
            <>{"Явный URL postgresql+psycopg выбирает dialect и driver."}</>,
            <>{"Settings читает dev/test URLs из environment."}</>,
            <>{"Engine является общей connectivity infrastructure."}</>,
            <>{"Pool выдаёт и возвращает connections."}</>,
            <>{"Каждый request получает отдельную ORM Session."}</>,
            <>{"SELECT 1 является минимальным connection test."}</>,
          ]}
        />

        <PracticeCta text={"Добавьте psycopg, Settings, PostgreSQL DATABASE_URL и TEST_DATABASE_URL. Создайте Engine с pool_pre_ping, отдельный check_database script и подтвердите SELECT 1 для обеих databases. Не меняйте HTTP endpoints; сохраните коммитом feat: connect StudyHub to PostgreSQL."} />

      </Section>

    </RichLesson>
  );
}

// 127. Alembic на чистой PostgreSQL-базе
export function Lesson127({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Alembic на чистой PostgreSQL-базе"}
        intro={"Восстановим всю schema StudyHub на пустой PostgreSQL database только из migration history и проверим revision state через current, history, heads и alembic_version."}
        tags={[
          { icon: <GitBranch size={14} />, label: "revision chain → head" },
          { icon: <FileText size={14} />, label: "clean database reproducibility" },
        ]}
      />
      <TheoryBridge lesson={127} />

      <Section number={"01"} title={"Пустая database — профессиональный тест проекта"}>
        <Lead>
          {"Работающий локальный database-файл может скрывать забытые ручные изменения. Чистая PostgreSQL database показывает, достаточно ли repository для воспроизведения schema."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Пустая database — профессиональный тест проекта»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Создать пустую test database:"}</strong> {" получить среду без tables и alembic_version."}
            </li>
            <li>
              <strong>{"Проверить history:"}</strong> {" увидеть revision chain в repository."}
            </li>
            <li>
              <strong>{"Выполнить upgrade head:"}</strong> {" последовательно применить upgrade functions."}
            </li>
            <li>
              <strong>{"Сверить objects:"}</strong> {" проверить tables, constraints и current revision."}
            </li>
          </ol>
          <p>{"Другой разработчик может создать schema StudyHub из Git без копирования старой database."}</p>
        </div>

        <BranchExplorer
          code={"empty studyhub_test\n  ↓ alembic upgrade head\nrevision 1\n  ↓\nrevision 2\n  ↓\n...\n  ↓\nhead + alembic_version"}
          scenarios={[
            { label: "before migrations", activeLine: 0, output: "нет application tables" },
            { label: "migration chain", activeLine: 3, output: "upgrade functions идут по revision order" },
            { label: "after upgrade", activeLine: 8, output: "database отмечена current head" },
          ]}
        />

        <Callout tone="info">
          {"Reproducibility важнее того, что database автора «как-то работает»."}
        </Callout>

      </Section>

      <Section number={"02"} title={"History, heads и current отвечают на разные вопросы"}>
        <Lead>
          {"Alembic разделяет состояние repository и состояние конкретной database. Это позволяет диагностировать «есть migration file» и «migration уже применена»."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «History, heads и current отвечают на разные вопросы»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>{"alembic history"}</>, "показать revision chain repository"],
            [<>{"alembic heads"}</>, "показать конечные revisions scripts"],
            [<>{"alembic current"}</>, "показать revision текущей database"],
            [<>{"alembic upgrade head"}</>, "применить недостающие upgrades до head"],
            [<>{"alembic_version"}</>, "служебная table с current revision"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините вопрос и команду."}
          pairs={[
            { left: "Какие migrations существуют?", right: "alembic history" },
            { left: "Какой revision применён здесь?", right: "alembic current" },
            { left: "Куда должна прийти цепочка?", right: "alembic heads" },
            { left: "Как применить все недостающие?", right: "alembic upgrade head" },
          ]}
          explanation={"Каждая пара связывает термин с его конкретной ролью в текущей модели."}
        />

        <TrueFalse
          statement={<>{"alembic history читает только tables текущей database."}</>}
          isTrue={false}
          explanation={"History прежде всего описывает migration scripts repository; current связывает их с database state."}
        />

      </Section>

      <Section number={"03"} title={"env.py должен использовать те же Settings и metadata"}>
        <Lead>
          {"Migration environment подключается к той database, которая указана configuration, и сравнивает или применяет operations относительно metadata ORM-моделей."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «env.py должен использовать те же Settings и metadata»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <CodeBlock
          caption={"фрагмент alembic/env.py"}
          code={"from alembic import context\n\nfrom app.config import settings\nfrom app.models.base import Base\n\nconfig = context.config\nconfig.set_main_option(\n    \"sqlalchemy.url\",\n    settings.database_url,\n)\n\ntarget_metadata = Base.metadata"}
        />

        <CompareSolutions
          question={"Какой источник URL безопаснее для проекта?"}
          left={{
            title: "Дублированный secret",
            code: "sqlalchemy.url = postgresql://real-password@localhost/studyhub_dev",
            note: "Secret живёт в alembic.ini и расходится с application config.",
          }}
          right={{
            title: "Общие Settings",
            code: "config.set_main_option(\"sqlalchemy.url\", settings.database_url)",
            note: "Application и migrations используют одну validated configuration boundary.",
          }}
          preferred={"right"}
          explanation={"Один источник configuration снижает риск миграции не той database."}
        />

        <BugHunt
          code={"target_metadata = None\n# autogenerate -- ORM models ignored"}
          question={"Что потеряет autogenerate?"}
          options={["Возможность сравнить ORM metadata со schema", "Connection к server", "psql meta-commands"]}
          correctIndex={0}
          explanation={"Без target_metadata Alembic не видит proposed ORM schema."}
          fix={"target_metadata = Base.metadata"}
        />

      </Section>

      <Section number={"04"} title={"Восстанавливаем schema на чистой database"}>
        <Lead>
          {"Упражнение выполняется на studyhub_test или отдельной disposable database. Development data не удаляется ради проверки migrations."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Восстанавливаем schema на чистой database»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <TerminalDemo
          title={"clean database drill"}
          lines={[
            { cmd: "dropdb -h localhost -U postgres --if-exists studyhub_migration_check" },
            { cmd: "createdb -h localhost -U postgres -O studyhub_app studyhub_migration_check" },
            { cmd: "DATABASE_URL=postgresql+psycopg://studyhub_app:CHANGE_ME@localhost:5432/studyhub_migration_check alembic current" },
            { out: "Current revision(s):" },
            { cmd: "DATABASE_URL=.../studyhub_migration_check alembic upgrade head" },
            { out: "Running upgrade ... -> ..." },
          ]}
        />

        <CodeSequence
          title={"Соберите воспроизводимый migration flow"}
          prompt={"Расположите шаги безопасной проверки."}
          pieces={[
            { id: "create", code: "создать пустую disposable database" },
            { id: "current0", code: "alembic current" },
            { id: "upgrade", code: "alembic upgrade head" },
            { id: "current1", code: "alembic current" },
            { id: "inspect", code: "проверить tables и constraints" },
            { id: "seed", code: "сначала копировать старые tables вручную", note: "обходит migration history" },
          ]}
          correctOrder={["create", "current0", "upgrade", "current1", "inspect"]}
          explanation={"Сначала доказывается schema reproducibility, затем отдельно переносятся data."}
        />

        <Callout>
          {"Команды dropdb/createdb являются удобными clients. То же можно выполнить административным SQL; важно использовать disposable database."}
        </Callout>

      </Section>

      <Section number={"05"} title={"alembic_version фиксирует current revision"}>
        <Lead>
          {"После upgrade Alembic создаёт служебную table. Она не хранит весь журнал SQL; она связывает database с текущей точкой revision graph."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «alembic_version фиксирует current revision»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <TerminalDemo
          title={"проверка результата"}
          lines={[
            { cmd: "psql -h localhost -U studyhub_app -d studyhub_migration_check" },
            { cmd: "\\dt" },
            { out: "public | alembic_version | table\npublic | users           | table\npublic | categories      | table\npublic | tasks           | table" },
            { cmd: "SELECT version_num FROM alembic_version;" },
            { out: "current_head_revision" },
          ]}
        />

        <RecallCard
          question={"Почему наличие application tables ещё не доказывает корректный Alembic state?"}
          hint={"Таблицы могли быть созданы вручную или create_all."}
          answer={
            <p>{"Нужно сверить current revision и migration history. Иначе schema может внешне выглядеть похожей, но Alembic не знает, какие upgrades уже применены."}</p>
          }
        />

        <Callout tone="info">
          {"Не редактируйте alembic_version вручную, чтобы скрыть ошибку. Сначала установите реальную причину расхождения."}
        </Callout>

      </Section>

      <Section number={"06"} title={"Migration failure должна оставлять понятный след"}>
        <Lead>
          {"Ошибка upgrade может возникнуть из-за существующего object, неверного SQL, missing dependency или неправильного порядка revisions. PostgreSQL обычно позволяет Alembic использовать transactional DDL, но диагностика всё равно начинается с failing revision."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Migration failure должна оставлять понятный след»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <BranchExplorer
          code={"alembic upgrade head\n├─ connection error\n├─ revision not found\n├─ SQL/constraint error\n└─ multiple heads"}
          scenarios={[
            { label: "connection", activeLine: 1, output: "проверить DATABASE_URL и server" },
            { label: "migration body", activeLine: 3, output: "прочитать revision и database error" },
            { label: "revision graph", activeLine: 4, output: "проверить heads и merge strategy" },
          ]}
        />

        <BugHunt
          code={"def upgrade():\n    op.create_table(\"tasks\", ...)\n\n# tasks already created manually"}
          question={"Почему upgrade падает на чисто выглядящем проекте?"}
          options={["Schema имеет ручной object вне согласованной history", "FastAPI не поддерживает Alembic", "psycopg не выполняет DDL"]}
          correctIndex={0}
          explanation={"Ручное создание и migrations стали двумя источниками истины."}
          fix={"# удалить disposable database и восстановить её только через\nalembic upgrade head"}
        />

        <Callout>
          {"На development database с ценными data удаление недопустимо. Сначала backup и отдельный recovery plan; destructive reset используется только для disposable среды."}
        </Callout>

      </Section>

      <Section number={"07"} title={"create_all больше не управляет schema"}>
        <Lead>
          {"Base.metadata.create_all полезен в раннем обучении, но после появления migration history он создаёт обходной путь и скрывает пропущенные revisions."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «create_all больше не управляет schema»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <CompareSolutions
          question={"Как запускать готовый StudyHub?"}
          left={{
            title: "Скрытое создание при import",
            code: "Base.metadata.create_all(bind=engine)\napp = FastAPI()",
            note: "Schema меняется вне reviewable migration chain.",
          }}
          right={{
            title: "Явная migration command",
            code: "alembic upgrade head\nuvicorn app.main:app",
            note: "Schema version обновляется отдельным контролируемым шагом.",
          }}
          preferred={"right"}
          explanation={"Migration является versioned artifact repository и может быть проверена до запуска application."}
        />

        <MethodGrid
          rows={[
            [<>{"create_all"}</>, "создаёт отсутствующие tables, но не ведёт migration history"],
            [<>{"revision file"}</>, "reviewable изменение schema"],
            [<>{"upgrade head"}</>, "применяет chain в правильном порядке"],
            [<>{"current"}</>, "показывает state конкретной database"],
          ]}
        />

        <Callout>
          {"Test fixtures тоже должны применять migrations или использовать schema, построенную из них, если цель теста — production-like reproducibility."}
        </Callout>

      </Section>

      <Section number={"08"} title={"Контрольная точка: schema из Git"}>
        <Lead>
          {"Ученик удаляет disposable database, создаёт её снова, выполняет upgrade head и доказывает совпадение tables, constraints и revision без create_all."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что показывает alembic current?"}
            options={["revision текущей database", "только список Python packages", "HTTP routes"]}
            correctIndex={0}
            explanation={"Current связывает database state с revision graph."}
          />
          <QuizCard
            question={"Что делает upgrade head?"}
            options={["применяет недостающие migrations", "копирует production data", "создаёт PostgreSQL role"]}
            correctIndex={0}
            explanation={"Команда выполняет upgrade functions до head."}
          />
          <QuizCard
            question={"Зачем target_metadata?"}
            options={["для сравнения ORM schema при autogenerate", "для password authentication", "для CORS"]}
            correctIndex={0}
            explanation={"Alembic получает SQLAlchemy metadata models."}
          />
          <QuizCard
            question={"Почему create_all убирается?"}
            options={["чтобы migrations были единым источником schema history", "потому что PostgreSQL не создаёт tables", "чтобы отключить tests"]}
            correctIndex={0}
            explanation={"Два независимых способа изменения schema создают drift."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Чистая database проверяет воспроизводимость repository."}</>,
            <>{"history и heads описывают revision graph."}</>,
            <>{"current показывает revision конкретной database."}</>,
            <>{"upgrade head применяет недостающие upgrade functions."}</>,
            <>{"env.py использует Settings и Base.metadata."}</>,
            <>{"alembic_version связывает database с current revision."}</>,
            <>{"create_all не должен конкурировать с migration history."}</>,
          ]}
        />

        <PracticeCta text={"Создайте disposable studyhub_migration_check, примените alembic upgrade head и проверьте \\dt, ключевые constraints и alembic current. Удалите create_all из startup path, добавьте migration runbook и зафиксируйте коммитом chore: verify PostgreSQL migrations from clean database."} />

      </Section>

    </RichLesson>
  );
}

// 128. Перенос данных и проверка неизменного API
export function Lesson128({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Перенос данных и проверка неизменного API"}
        intro={"Перенесём небольшой связанный dataset из SQLite в PostgreSQL, сохраним foreign-key relationships и докажем regression tests, что HTTP paths, schemas, status codes и error contract не изменились."}
        tags={[
          { icon: <Boxes size={14} />, label: "export → transform → import" },
          { icon: <ListChecks size={14} />, label: "API regression contract" },
        ]}
      />
      <TheoryBridge lesson={128} />

      <Section number={"01"} title={"Успешная миграция определяется внешним поведением"}>
        <Lead>
          {"Факт наличия строк в PostgreSQL недостаточен. Клиент должен получать те же resources, поля, status codes и ожидаемые ошибки, что до переключения database."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Успешная миграция определяется внешним поведением»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Зафиксировать baseline:"}</strong> {" запустить regression suite на SQLite version."}
            </li>
            <li>
              <strong>{"Экспортировать данные:"}</strong> {" получить переносимый и проверяемый dataset."}
            </li>
            <li>
              <strong>{"Импортировать транзакционно:"}</strong> {" соблюсти порядок foreign keys и rollback при ошибке."}
            </li>
            <li>
              <strong>{"Повторить contract tests:"}</strong> {" сравнить responses после PostgreSQL switch."}
            </li>
          </ol>
          <p>{"PostgreSQL StudyHub заменяет physical storage, но не требует изменений клиента."}</p>
        </div>

        <BranchExplorer
          code={"same HTTP request\n├─ SQLite baseline response\n└─ PostgreSQL migrated response\n      ↓\ncompare status + JSON schema + semantics"}
          scenarios={[
            { label: "before switch", activeLine: 1, output: "фиксируем baseline" },
            { label: "after switch", activeLine: 2, output: "запускаем тот же test suite" },
            { label: "contract decision", activeLine: 4, output: "responses эквивалентны по контракту" },
          ]}
        />

        <Callout tone="info">
          {"Сравнивается контракт, а не byte-for-byte порядок JSON keys или внутренние SQL statements."}
        </Callout>

      </Section>

      <Section number={"02"} title={"Выбираем переносимый dataset"}>
        <Lead>
          {"Учебная миграция должна быть небольшой, наблюдаемой и связанной. Достаточно users, categories и tasks; активные sessions и refresh tokens безопаснее инвалидировать."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Выбираем переносимый dataset»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"users"} title={"Account data"} code={"id · email · password_hash"}>
            {"Переносятся только необходимые поля; plaintext passwords не существуют."}
          </TypeCard>
          <TypeCard badge={"categories"} badgeTone="float" title={"Parent rows"} code={"id · name"}>
            {"Импортируются до tasks, которые ссылаются на category_id."}
          </TypeCard>
          <TypeCard badge={"tasks"} badgeTone="str" title={"Owned resources"} code={"user_id · category_id"}>
            {"Foreign keys должны указывать на уже существующие parent rows."}
          </TypeCard>
          <TypeCard badge={"sessions"} title={"Ephemeral auth state"} code={"token digest · expires_at"}>
            {"Для учебной миграции sessions отзываются, а пользователи входят заново."}
          </TypeCard>
        </TypeCards>

        <CompareSolutions
          question={"Что делать с active session tokens?"}
          left={{
            title: "Копировать вслепую",
            code: "export all sessions and tokens",
            note: "Можно перенести устаревшее или чувствительное состояние.",
          }}
          right={{
            title: "Инвалидировать",
            code: "do not migrate sessions; require login again",
            note: "Migration data остаётся понятной, а auth state начинается заново.",
          }}
          preferred={"right"}
          explanation={"Session является временным security state и не обязательна для сохранения предметных данных."}
        />

        <Callout>
          {"Для production migration решение может быть другим, но оно должно быть осознанным и документированным."}
        </Callout>

      </Section>

      <Section number={"03"} title={"Порядок импорта определяется foreign keys"}>
        <Lead>
          {"Parent rows создаются раньше child rows. Если identifiers генерируются заново, importer хранит mapping old_id → new_id и подставляет его в foreign keys."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Порядок импорта определяется foreign keys»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <StepThrough
          code={"import users\nimport categories\nmap old ids to new ids\nimport tasks with mapped user_id/category_id\ncommit"}
          steps={[
            { line: 0, note: "Users создаются первыми как owners задач.", vars: {"users": "inserted"} },
            { line: 1, note: "Categories создаются до ссылок task.category_id.", vars: {"categories": "inserted"} },
            { line: 2, note: "Mapping сохраняет соответствие identifiers.", vars: {"user_map": "{old: new}"} },
            { line: 3, note: "Tasks получают valid new foreign keys.", vars: {"tasks": "ready"} },
            { line: 4, note: "Один commit делает dataset видимым целиком.", vars: {"transaction": "committed"} },
          ]}
        />

        <CodeSequence
          title={"Соберите безопасный порядок импорта"}
          prompt={"Расположите сущности и transaction steps."}
          pieces={[
            { id: "begin", code: "begin transaction" },
            { id: "users", code: "insert users" },
            { id: "categories", code: "insert categories" },
            { id: "tasks", code: "insert tasks with mapped foreign keys" },
            { id: "commit", code: "commit" },
            { id: "tasks_first", code: "insert tasks before users", note: "нарушает foreign keys" },
          ]}
          correctOrder={["begin", "users", "categories", "tasks", "commit"]}
          explanation={"Child rows появляются только после parents и внутри одной transaction boundary."}
        />

        <Callout>
          {"Сохранение старых id допустимо для controlled dataset, но sequence/identity state затем нужно синхронизировать. Mapping обычно безопаснее как учебная модель."}
        </Callout>

      </Section>

      <Section number={"04"} title={"Importer должен быть идемпотентным или явно одноразовым"}>
        <Lead>
          {"Повторный запуск может создать duplicates или упасть на UNIQUE constraints. Contract скрипта должен честно определять поведение."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Importer должен быть идемпотентным или явно одноразовым»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <CodeBlock
          caption={"упрощённый transactional importer"}
          code={"def import_dataset(session, dataset):\n    try:\n        user_map = import_users(session, dataset[\"users\"])\n        category_map = import_categories(\n            session,\n            dataset[\"categories\"],\n        )\n        import_tasks(\n            session,\n            dataset[\"tasks\"],\n            user_map=user_map,\n            category_map=category_map,\n        )\n        session.commit()\n    except Exception:\n        session.rollback()\n        raise"}
        />

        <BugHunt
          code={"for row in tasks:\n    session.add(TaskModel(**row))\n    session.commit()"}
          question={"Почему commit внутри loop усложняет recovery?"}
          options={["Dataset может сохраниться частично", "PostgreSQL запретит INSERT", "Pydantic удалит id"]}
          correctIndex={0}
          explanation={"Ошибка на поздней row оставит ранние commits в database."}
          fix={"for row in tasks:\n    session.add(TaskModel(**row))\n\nsession.commit()"}
        />

        <TrueFalse
          statement={<>{"Rollback после ошибки отменяет commits, выполненные в предыдущих итерациях."}</>}
          isTrue={false}
          explanation={"Rollback действует только на текущую незавершённую transaction; поэтому dataset импортируется одним commit."}
        />

        <Callout>
          {"Для блока достаточно одноразового importer с precondition «target database empty» и явной проверкой. Production ETL требует более сложных guarantees."}
        </Callout>

      </Section>

      <Section number={"05"} title={"Development и test configuration после переключения"}>
        <Lead>
          {"Application и tests должны использовать PostgreSQL, но разные databases. Dependency override остаётся, меняется только test Engine URL и cleanup strategy."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Development и test configuration после переключения»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <CodeBlock
          caption={"две validated settings"}
          code={"DATABASE_URL=postgresql+psycopg://studyhub_app:CHANGE_ME@localhost:5432/studyhub_dev\nTEST_DATABASE_URL=postgresql+psycopg://studyhub_app:CHANGE_ME@localhost:5432/studyhub_test"}
        />

        <MethodGrid
          rows={[
            [<>{"development"}</>, "ручные requests и migrated demo data"],
            [<>{"test"}</>, "isolated fixtures, rollback или cleanup"],
            [<>{"dependency override"}</>, "подставляет test Session в FastAPI"],
            [<>{"migration setup"}</>, "upgrade head перед integration suite"],
          ]}
        />

        <BugHunt
          code={"app.dependency_overrides[get_db] = get_dev_db"}
          question={"Почему test suite становится опасным?"}
          options={["Tests подключены к development database", "FastAPI не поддерживает overrides", "PostgreSQL не имеет transactions"]}
          correctIndex={0}
          explanation={"Fixtures и cleanup могут изменить migrated development data."}
          fix={"app.dependency_overrides[get_db] = get_test_db"}
        />

        <Callout>
          {"Путь test database должен выводиться в безопасном diagnostic log без password, чтобы случайное подключение было заметно."}
        </Callout>

      </Section>

      <Section number={"06"} title={"Regression tests сравнивают HTTP-контракт"}>
        <Lead>
          {"Тесты запускаются теми же requests, что до migration. Они не должны знать, какой SQL dialect находится под endpoint."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Regression tests сравнивают HTTP-контракт»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>{"status code"}</>, "201, 200, 204, 401, 403, 404 и 422 остаются согласованными"],
            [<>{"response schema"}</>, "те же поля, типы и required values"],
            [<>{"authorization"}</>, "ownership и roles не меняются"],
            [<>{"error contract"}</>, "тот же detail или structured error shape"],
            [<>{"side effects"}</>, "создание, update и delete дают прежнее состояние"],
          ]}
        />

        <CodeBlock
          caption={"contract-level regression test"}
          code={"def test_create_task_contract(client, auth_cookie):\n    response = client.post(\n        \"/tasks\",\n        cookies=auth_cookie,\n        json={\"title\": \"PostgreSQL\", \"priority\": 4},\n    )\n\n    assert response.status_code == 201\n    assert response.json()[\"title\"] == \"PostgreSQL\"\n    assert response.json()[\"priority\"] == 4\n    assert isinstance(response.json()[\"id\"], int)"}
        />

        <RecallCard
          question={"Почему test не должен проверять строку PostgreSQL INSERT?"}
          hint={"Он защищает внешний contract endpoint."}
          answer={
            <p>{"SQL является внутренней реализацией и может меняться. Regression test фиксирует observable HTTP behavior, важное клиенту."}</p>
          }
        />

        <Callout tone="info">
          {"Отдельные repository tests могут проверять SQLAlchemy behavior, но API regression suite остаётся storage-agnostic."}
        </Callout>

      </Section>

      <Section number={"07"} title={"Migration checklist и rollback switch"}>
        <Lead>
          {"Даже учебная миграция должна иметь порядок, доказательства и способ вернуться к baseline configuration, если verification не прошла."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Назовите входные данные, границу ответственности и ожидаемый результат для модели «Migration checklist и rollback switch»."}</p>
          <h3>{"Контролируемое изменение"}</h3>
          <p>{"Измените один параметр текущего примера, заранее запишите прогноз и только затем повторите проверку."}</p>
          <h3>{"Профессиональное объяснение"}</h3>
          <p>{"Определите уровень возможной ошибки: client, network, server, database, schema, migration или HTTP contract."}</p>
        </div>

        <TerminalDemo
          title={"контрольный release flow"}
          lines={[
            { cmd: "alembic upgrade head" },
            { out: "PostgreSQL schema at head" },
            { cmd: "python -m scripts.import_sqlite_dataset export.json" },
            { out: "users=2 categories=3 tasks=8 committed" },
            { cmd: "pytest" },
            { out: "all contract tests passed" },
            { cmd: "uvicorn app.main:app" },
            { out: "StudyHub uses PostgreSQL" },
          ]}
        />

        <BranchExplorer
          code={"verification\n├─ migrations failed → stop\n├─ import failed → rollback transaction\n├─ tests failed → restore old DATABASE_URL\n└─ all passed → document release"}
          scenarios={[
            { label: "schema failure", activeLine: 1, output: "data import не начинается" },
            { label: "contract failure", activeLine: 3, output: "не выпускать switch" },
            { label: "success", activeLine: 4, output: "PostgreSQL становится active development storage" },
          ]}
        />

        <Callout>
          {"В production rollback базы сложнее, чем возврат environment variable. Здесь мы отрабатываем дисциплину gate и доказательств на локальной среде."}
        </Callout>

      </Section>

      <Section number={"08"} title={"Финал блока: PostgreSQL StudyHub"}>
        <Lead>
          {"Блок завершён, когда schema воспроизводится, demo data перенесены, API tests проходят и ученик может объяснить, какие внутренние детали изменились, а какие client contracts остались прежними."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что переносится до tasks?"}
            options={["users и categories", "active sessions обязательно", "HTTP routers"]}
            correctIndex={0}
            explanation={"Parent rows нужны для valid foreign keys."}
          />
          <QuizCard
            question={"Почему нужен один transaction commit?"}
            options={["избежать частично перенесённого dataset", "ускорить CORS", "создать role"]}
            correctIndex={0}
            explanation={"При ошибке rollback отменяет весь незавершённый import."}
          />
          <QuizCard
            question={"Что проверяет regression API suite?"}
            options={["наблюдаемый HTTP-контракт", "точный внутренний SQL", "пароль PostgreSQL"]}
            correctIndex={0}
            explanation={"Client behavior должно сохраниться."}
          />
          <QuizCard
            question={"Что делать при failing tests после switch?"}
            options={["остановить выпуск и вернуть baseline config", "игнорировать tests", "удалить error responses"]}
            correctIndex={0}
            explanation={"Migration завершается только после verification gates."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Schema migrations выполняются до data import."}</>,
            <>{"Dataset выбирается осознанно; ephemeral auth state можно инвалидировать."}</>,
            <>{"Parent rows импортируются до child rows."}</>,
            <>{"ID mapping сохраняет foreign-key relationships."}</>,
            <>{"Один transaction commit защищает от partial migration."}</>,
            <>{"Development и test PostgreSQL databases остаются раздельными."}</>,
            <>{"Regression tests доказывают неизменность HTTP-контракта."}</>,
          ]}
        />

        <PracticeCta text={"Создайте export небольшого SQLite dataset, importer для пустой PostgreSQL schema и mapping identifiers. Перенесите users, categories и tasks одной transaction, не переносите active sessions. Запустите полный API test suite и Postman collection, обновите README migration runbook и сделайте Release PostgreSQL StudyHub."} />

      </Section>

    </RichLesson>
  );
}

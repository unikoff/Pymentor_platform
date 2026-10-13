import { HardDrive, Layers } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 22 · PostgreSQL и перенос StudyHub";

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
      <TheoryBridge link={"В блоке 21 ученик научился читать SQL под SQLAlchemy. Теперь тот же SQL будет выполняться не внутри локального SQLite-файла, а отдельным серверным процессом PostgreSQL."} boundary={"PostgreSQL — не библиотека внутри FastAPI. Приложение является клиентом и подключается к отдельно работающему серверу через driver и сеть."} />

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

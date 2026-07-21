import {
  BarChart3,
  Braces,
  Database,
  FileText,
  GitBranch,
  HardDrive,
  KeyRound,
  Layers,
  ListChecks,
  Network,
  Route,
  Search,
  Server,
  ShieldCheck,
  Table2,
  Timer,
  Workflow,
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  FlipCards,
  KeyTakeaways,
  Lead,
  MatchPairs,
  MethodGrid,
  PracticeCta,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

export function LearningRoadmap() {
  return (
    <RichLesson>
      <RichHero
        variant={"project"}
        chip={"ЭТАП 6 · карта обучения"}
        title={"План обучения: этап 6"}
        intro={"За 24 занятия Personal StudyHub API превратится в PostgreSQL StudyHub: ORM станет прозрачнее через SQL, проект переедет на server database, получит JOIN, aggregates, transactions, indexes, recovery и осознанную карту хранилищ."}
        tags={[
          {
            icon: <Route size={14} />,
            label: "занятия 117–140",
          },
          {
            icon: <Database size={14} />,
            label: "PostgreSQL StudyHub",
          },
        ]}
      />

      <Section number={"01"} title={"От Personal StudyHub к PostgreSQL StudyHub"}>
        <Lead>
          {"Этап 5 завершился персональным API с пользователями, ownership, сессиями, токенами и тестами. Теперь меняется не HTTP-контракт, а глубина работы с данными: ученик увидит SQL под ORM и перенесёт проект с локального SQLite-файла на сервер PostgreSQL."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Сохранить API-контракт:"}</strong>
              {" routes, schemas, auth и permissions остаются рабочими."}
            </li>
            <li>
              <strong>{"Раскрыть ORM:"}</strong>
              {" каждый familiar statement сопоставляется с SQL и таблицей."}
            </li>
            <li>
              <strong>{"Перенести инфраструктуру:"}</strong>
              {" PostgreSQL появляется после ручного знакомства с server, database, schema и role."}
            </li>
            <li>
              <strong>{"Усложнить запросы:"}</strong>
              {" JOIN, aggregates и transaction решают реальные сценарии StudyHub."}
            </li>
            <li>
              <strong>{"Измерять до оптимизации:"}</strong>
              {" index и EXPLAIN появляются только после воспроизводимого baseline."}
            </li>
          </ol>
          <p>
            {"Главный результат этапа — не список новых команд, а способность проследить путь данных от endpoint до SQL, PostgreSQL и обратно."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"вход этапа"}</>,
              <>{"Personal StudyHub API на SQLite и SQLAlchemy"}</>,
            ],
            [
              <>{"основной проект"}</>,
              <>{"PostgreSQL StudyHub"}</>,
            ],
            [
              <>{"занятия"}</>,
              <>{"117–140"}</>,
            ],
            [
              <>{"блоки"}</>,
              <>{"21–24"}</>,
            ],
            [
              <>{"выход этапа"}</>,
              <>{"перенос, сложные запросы, измерения и выбор хранилища"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"переход проекта"}
          code={"Personal StudyHub API\n→ SQL виден под ORM\n→ PostgreSQL server\n→ JOIN и statistics\n→ transactions\n→ indexes и EXPLAIN\n→ PostgreSQL StudyHub"}
        />

        <CodeSequence
          title={"Соберите безопасный маршрут этапа"}
          prompt={"Расположите шаги так, чтобы новая технология появлялась после понятной проблемы."}
          pieces={[
            {
              id: "baseline",
              code: "зафиксировать рабочий SQLite API",
            },
            {
              id: "sql",
              code: "прочитать и написать базовый SQL",
            },
            {
              id: "server",
              code: "подключить PostgreSQL server",
            },
            {
              id: "migrate",
              code: "применить migrations и regression tests",
            },
            {
              id: "queries",
              code: "добавить JOIN, aggregates и transaction",
            },
            {
              id: "measure",
              code: "измерить запрос и только затем добавить index",
            },
          ]}
          correctOrder={[
            "baseline",
            "sql",
            "server",
            "migrate",
            "queries",
            "measure",
          ]}
          explanation={"Каждый следующий слой отвечает на наблюдаемую проблему и проверяется до дальнейшего усложнения."}
        />

        <TypeCards>
          <TypeCard
            badge={"до"}
            title={"SQLite"}
            code={"sqlite:///studyhub.db"}
          >
            {"Простая локальная база уже доказала контракт database layer."}
          </TypeCard>
          <TypeCard
            badge={"переход"}
            badgeTone={"float"}
            title={"SQL и server"}
            code={"SELECT ... / PostgreSQL"}
          >
            {"Ученик видит язык запросов и отдельный процесс базы."}
          </TypeCard>
          <TypeCard
            badge={"после"}
            badgeTone={"str"}
            title={"PostgreSQL StudyHub"}
            code={"postgresql+...://"}
          >
            {"Проект сохраняет API, но получает server database и более сильные запросы."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Зафиксировать baseline"}</h3>
          <p>
            {"Запустить tests и основные requests до изменения database URL."}
          </p>

          <h3>{"Менять один слой"}</h3>
          <p>
            {"Не смешивать перенос PostgreSQL, новую auth-логику и новый endpoint."}
          </p>

          <h3>{"Доказывать результат"}</h3>
          <p>
            {"После каждого блока сохранять SQL, test, plan или runbook."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Этап не повторяет регистрацию и JWT. Эти механизмы используются как готовая бизнес-часть, поверх которой меняется работа с данными."}
        </Callout>

        <Callout tone={"warn"}>
          {"PostgreSQL не делает приложение автоматически быстрым. Сначала требуется корректный SQL, затем измерение и только потом оптимизация."}
        </Callout>

      </Section>

      <Section number={"02"} title={"Блок 21 · SQL как язык данных"}>
        <Lead>
          {"Первый блок снимает магию ORM. Ученик связывает ORM-класс с таблицей, создаёт учебную schema, выполняет параметризованный CRUD и переводит один запрос между raw SQL и SQLAlchemy 2.x."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"117 · Реляционная модель:"}</strong>
              {" table, row, column, type и primary key под ORM-моделью."}
            </li>
            <li>
              <strong>{"118 · CREATE TABLE:"}</strong>
              {" структура и ограничения NOT NULL, UNIQUE, DEFAULT, CHECK."}
            </li>
            <li>
              <strong>{"119 · INSERT:"}</strong>
              {" явные колонки, RETURNING и безопасные parameters."}
            </li>
            <li>
              <strong>{"120 · SELECT:"}</strong>
              {" WHERE, ORDER BY, LIMIT, OFFSET и логика выборки."}
            </li>
            <li>
              <strong>{"121 · UPDATE/DELETE:"}</strong>
              {" обязательный WHERE и число затронутых rows."}
            </li>
            <li>
              <strong>{"122 · SQL ↔ SQLAlchemy:"}</strong>
              {" две записи одного запроса и проверка одинакового результата."}
            </li>
          </ol>
          <p>
            {"Блок заканчивается sql-lab: набором запросов, который можно запустить, объяснить и сопоставить с существующим ORM-кодом StudyHub."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"117"}</>,
              <>{"TaskModel → table → SQL log"}</>,
            ],
            [
              <>{"118"}</>,
              <>{"CREATE TABLE + constraints"}</>,
            ],
            [
              <>{"119"}</>,
              <>{"INSERT + parameters + RETURNING"}</>,
            ],
            [
              <>{"120"}</>,
              <>{"SELECT pipeline"}</>,
            ],
            [
              <>{"121"}</>,
              <>{"safe UPDATE/DELETE"}</>,
            ],
            [
              <>{"122"}</>,
              <>{"SQL and SQLAlchemy parity"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"карта SQL-блока"}
          code={"ORM object\n→ SQL statement\n→ parameter values\n→ database constraint\n→ rows affected\n→ Python result"}
        />

        <MatchPairs
          prompt={"Соедините занятие и главный артефакт."}
          leftTitle={"Занятие"}
          rightTitle={"Артефакт"}
          pairs={[
            {
              left: "117",
              right: "подписанная схема ORM → table",
            },
            {
              left: "118",
              right: "DDL с ограничениями",
            },
            {
              left: "119",
              right: "parameterized INSERT",
            },
            {
              left: "120",
              right: "filter/sort/page SELECT",
            },
            {
              left: "121",
              right: "safe mutation checklist",
            },
            {
              left: "122",
              right: "таблица SQL ↔ SQLAlchemy",
            },
          ]}
          explanation={"Каждый урок оставляет проверяемый результат, а не только набор терминов."}
        />

        <TypeCards>
          <TypeCard
            badge={"DDL"}
            title={"Структура"}
            code={"CREATE TABLE"}
          >
            {"Определяет форму таблицы и database guarantees."}
          </TypeCard>
          <TypeCard
            badge={"DML"}
            badgeTone={"float"}
            title={"Изменения"}
            code={"INSERT / UPDATE / DELETE"}
          >
            {"Работает со строками и всегда проверяет затронутый набор."}
          </TypeCard>
          <TypeCard
            badge={"query"}
            badgeTone={"str"}
            title={"Чтение"}
            code={"SELECT ... WHERE"}
          >
            {"Формирует требуемый набор строк, порядок и границы страницы."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Сначала прочитать"}</h3>
          <p>
            {"До запуска проговорить, какие rows должен затронуть statement."}
          </p>

          <h3>{"Затем выполнить"}</h3>
          <p>
            {"Использовать небольшую отдельную учебную таблицу или transaction."}
          </p>

          <h3>{"После сравнить"}</h3>
          <p>
            {"Найти тот же смысл в SQLAlchemy statement и API response."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Raw SQL используется как учебный инструмент и точный язык базы. Основной CRUD проекта не переписывается строками SQL без причины."}
        </Callout>

        <Callout tone={"warn"}>
          {"Склеивание пользовательских значений в SQL через f-string не является упрощением. Значения передаются parameters отдельно от statement."}
        </Callout>

      </Section>

      <Section number={"03"} title={"Блок 22 · PostgreSQL и перенос StudyHub"}>
        <Lead>
          {"После понимания SQL ученик видит, что PostgreSQL — отдельный server process. SQLite-файл заменяется связкой client → driver → server → database → schema → table, но внешний API обязан остаться прежним."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"123 · Модель PostgreSQL:"}</strong>
              {" server, database, schema, role, host, port и connection."}
            </li>
            <li>
              <strong>{"124 · psql:"}</strong>
              {" запуск server, первая database и диагностика connection refused."}
            </li>
            <li>
              <strong>{"125 · Roles:"}</strong>
              {" отдельная app-role, ownership и минимальные permissions."}
            </li>
            <li>
              <strong>{"126 · Engine:"}</strong>
              {" DATABASE_URL, driver, Settings, pool и SELECT 1."}
            </li>
            <li>
              <strong>{"127 · Alembic:"}</strong>
              {" восстановление schema на чистой PostgreSQL database."}
            </li>
            <li>
              <strong>{"128 · Перенос:"}</strong>
              {" seed/import, regression tests и неизменный HTTP contract."}
            </li>
          </ol>
          <p>
            {"Успешный перенос доказан, когда чистая PostgreSQL-база создаётся из migrations, получает demo data, а прежние API-тесты проходят без изменения response-contract."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"server"}</>,
              <>{"долгоживущий процесс PostgreSQL"}</>,
            ],
            [
              <>{"database"}</>,
              <>{"логическое пространство данных проекта"}</>,
            ],
            [
              <>{"schema"}</>,
              <>{"namespace таблиц, например public"}</>,
            ],
            [
              <>{"role"}</>,
              <>{"identity и permissions подключения"}</>,
            ],
            [
              <>{"driver"}</>,
              <>{"Python-клиент протокола PostgreSQL"}</>,
            ],
            [
              <>{"engine"}</>,
              <>{"SQLAlchemy entry point и pool connections"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"путь подключения"}
          code={"FastAPI\n→ SQLAlchemy Engine\n→ PostgreSQL driver\n→ host:port\n→ database\n→ schema.public\n→ tables"}
        />

        <BranchExplorer
          code={"DATABASE_URL\n  driver://role:password@host:port/database\n\nalembic upgrade head\npytest"}
          scenarios={[
            {
              label: "server не запущен",
              activeLine: 1,
              output: "connection refused: проверить process и port",
            },
            {
              label: "роль неверна",
              activeLine: 1,
              output: "authentication failed: проверить role/password",
            },
            {
              label: "schema пустая",
              activeLine: 3,
              output: "применить migrations до запуска API",
            },
            {
              label: "tests зелёные",
              activeLine: 4,
              output: "HTTP contract после переноса сохранён",
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"client"}
            title={"psql / приложение"}
            code={"psql -h ..."}
          >
            {"Инициирует connection и отправляет SQL."}
          </TypeCard>
          <TypeCard
            badge={"server"}
            badgeTone={"float"}
            title={"PostgreSQL process"}
            code={"host:5432"}
          >
            {"Принимает connections и управляет несколькими databases."}
          </TypeCard>
          <TypeCard
            badge={"project"}
            badgeTone={"str"}
            title={"studyhub_dev"}
            code={"public.tasks"}
          >
            {"Хранит schema и данные конкретного окружения."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Поднять пустую database"}</h3>
          <p>
            {"Не начинать перенос поверх случайной старой schema."}
          </p>

          <h3>{"Применить migrations"}</h3>
          <p>
            {"Структура восстанавливается из repository, а не ручным create_all."}
          </p>

          <h3>{"Проверить contract"}</h3>
          <p>
            {"Запустить API tests и Postman collection после смены DATABASE_URL."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Отдельная app-role уменьшает последствия ошибки. StudyHub не должен подключаться PostgreSQL-superuser."}
        </Callout>

        <Callout tone={"warn"}>
          {"Миграции восстанавливают schema, но не заменяют backup пользовательских данных."}
        </Callout>

      </Section>

      <Section number={"04"} title={"Блок 23 · JOIN, aggregates и transactions"}>
        <Lead>
          {"Перенос завершён, но простой CRUD не отвечает на вопросы по связанным данным. В этом блоке SQL объединяет users, tasks, categories и tags, строит statistics и выполняет несколько изменений как одну атомарную операцию."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"129 · INNER JOIN:"}</strong>
              {" только строки с существующей связью."}
            </li>
            <li>
              <strong>{"130 · LEFT JOIN:"}</strong>
              {" сохранить левую строку и увидеть NULL справа."}
            </li>
            <li>
              <strong>{"131 · Many-to-many:"}</strong>
              {" association table для tasks и tags."}
            </li>
            <li>
              <strong>{"132 · Aggregates:"}</strong>
              {" COUNT, SUM, AVG и GROUP BY."}
            </li>
            <li>
              <strong>{"133 · HAVING/EXISTS:"}</strong>
              {" фильтр групп и проверка существования без загрузки объектов."}
            </li>
            <li>
              <strong>{"134 · Transaction:"}</strong>
              {" несколько changes завершаются commit или полностью rollback."}
            </li>
          </ol>
          <p>
            {"Блок даёт два новых вида результата: статистический endpoint и бизнес-операцию, которая не оставляет половину состояния после ошибки."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"INNER JOIN"}</>,
              <>{"оставляет совпавшие пары"}</>,
            ],
            [
              <>{"LEFT JOIN"}</>,
              <>{"сохраняет все строки слева"}</>,
            ],
            [
              <>{"GROUP BY"}</>,
              <>{"собирает строки в группы"}</>,
            ],
            [
              <>{"HAVING"}</>,
              <>{"фильтрует уже сформированные группы"}</>,
            ],
            [
              <>{"EXISTS"}</>,
              <>{"проверяет наличие строки"}</>,
            ],
            [
              <>{"transaction"}</>,
              <>{"задаёт атомарную границу операции"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"единый запрос данных"}
          code={"users\n  JOIN tasks ON tasks.owner_id = users.id\n  LEFT JOIN categories ON categories.id = tasks.category_id\n  GROUP BY users.id\n  HAVING COUNT(tasks.id) >= 3"}
        />

        <CompareSolutions
          question={"Какой вариант сохраняет пользователя без задач?"}
          left={{
            title: "INNER JOIN",
            code: "users JOIN tasks ON ...",
            note: "Пользователь без совпавшей task исчезнет.",
          }}
          right={{
            title: "LEFT JOIN",
            code: "users LEFT JOIN tasks ON ...",
            note: "Пользователь останется, columns task будут NULL.",
          }}
          preferred={"right"}
          explanation={"Тип JOIN выбирается по требуемому набору строк, а не по привычке."}
        />

        <TypeCards>
          <TypeCard
            badge={"связь"}
            title={"JOIN"}
            code={"ON foreign_key = primary_key"}
          >
            {"Соединяет rows разных tables по явному правилу."}
          </TypeCard>
          <TypeCard
            badge={"отчёт"}
            badgeTone={"float"}
            title={"Aggregate"}
            code={"COUNT(*) GROUP BY"}
          >
            {"Сворачивает набор строк в показатели."}
          </TypeCard>
          <TypeCard
            badge={"гарантия"}
            badgeTone={"str"}
            title={"Transaction"}
            code={"BEGIN → COMMIT/ROLLBACK"}
          >
            {"Не допускает частично завершённую бизнес-операцию."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Нарисовать rows"}</h3>
          <p>
            {"До SQL показать, какие строки должны попасть в результат."}
          </p>

          <h3>{"Собрать statement"}</h3>
          <p>
            {"Добавлять JOIN, GROUP BY и filter по одному слою."}
          </p>

          <h3>{"Сломать второй шаг"}</h3>
          <p>
            {"Проверить, что transaction откатывает оба изменения."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Async не требуется для JOIN и transaction. В этапе 6 используется знакомый синхронный SQLAlchemy и обычная Session."}
        </Callout>

        <Callout tone={"warn"}>
          {"GROUP BY не является способом убрать случайные дубликаты. Он используется вместе с понятным aggregate-result."}
        </Callout>

      </Section>

      <Section number={"05"} title={"Блок 24 · Индексы, EXPLAIN и выбор хранилища"}>
        <Lead>
          {"Финальный блок начинается не с индекса, а с медленного воспроизводимого запроса. После baseline ученик создаёт обоснованный index, читает простой execution plan, проверяет backup/restore и сравнивает PostgreSQL с document и key-value моделями."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"135 · Baseline:"}</strong>
              {" данные, повторяемый запрос, время и селективность."}
            </li>
            <li>
              <strong>{"136 · Index:"}</strong>
              {" single, unique и composite index под query pattern."}
            </li>
            <li>
              <strong>{"137 · EXPLAIN:"}</strong>
              {" Seq Scan, Index Scan, estimate и actual rows."}
            </li>
            <li>
              <strong>{"138 · Recovery:"}</strong>
              {" pg_dump, pg_restore и проверка отдельной database."}
            </li>
            <li>
              <strong>{"139 · MongoDB:"}</strong>
              {" document как единица хранения и embed/reference trade-off."}
            </li>
            <li>
              <strong>{"140 · Redis:"}</strong>
              {" key/value, TTL, cache и итоговая матрица выбора."}
            </li>
          </ol>
          <p>
            {"Этап заканчивается архитектурной картой: PostgreSQL остаётся source of truth, MongoDB рассматривается как отдельная document model, Redis — как быстрое временное state."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"baseline"}</>,
              <>{"измерение до изменения"}</>,
            ],
            [
              <>{"index"}</>,
              <>{"дополнительная структура чтения"}</>,
            ],
            [
              <>{"EXPLAIN"}</>,
              <>{"объяснение выбранного plan"}</>,
            ],
            [
              <>{"backup"}</>,
              <>{"копия schema и data"}</>,
            ],
            [
              <>{"MongoDB"}</>,
              <>{"document-oriented storage"}</>,
            ],
            [
              <>{"Redis"}</>,
              <>{"in-memory key/value with TTL"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"матрица хранения"}
          code={"PostgreSQL → relations, constraints, transactions, source of truth\nMongoDB → whole document, flexible nested shape\nRedis → temporary key/value, TTL, cache or service state"}
        />

        <MatchPairs
          prompt={"Соедините задачу и наиболее естественную модель хранения."}
          leftTitle={"Сценарий"}
          rightTitle={"Хранилище"}
          pairs={[
            {
              left: "users, tasks и ownership",
              right: "PostgreSQL",
            },
            {
              left: "самодостаточный импортируемый snapshot",
              right: "MongoDB document experiment",
            },
            {
              left: "verification code на 10 минут",
              right: "Redis with TTL",
            },
            {
              left: "атомарное изменение нескольких rows",
              right: "PostgreSQL transaction",
            },
            {
              left: "повторно читаемая временная statistics",
              right: "Redis cache after measurement",
            },
          ]}
          explanation={"Выбор следует из гарантий, lifetime и формы данных, а не из популярности технологии."}
        />

        <TypeCards>
          <TypeCard
            badge={"truth"}
            title={"PostgreSQL"}
            code={"constraints + transaction"}
          >
            {"Основное постоянное состояние StudyHub."}
          </TypeCard>
          <TypeCard
            badge={"document"}
            badgeTone={"float"}
            title={"MongoDB"}
            code={"{ course: { modules: [...] } }"}
          >
            {"Учебный эксперимент с целым вложенным документом."}
          </TypeCard>
          <TypeCard
            badge={"temporary"}
            badgeTone={"str"}
            title={"Redis"}
            code={"SETEX key ttl value"}
          >
            {"Быстрое временное значение, которое можно восстановить из source of truth."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Измерить"}</h3>
          <p>
            {"Создать baseline на достаточном объёме данных."}
          </p>

          <h3>{"Объяснить"}</h3>
          <p>
            {"Прочитать plan и назвать, почему index выбран или не выбран."}
          </p>

          <h3>{"Проверить восстановление"}</h3>
          <p>
            {"Backup считается полезным только после успешного restore test."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"MongoDB и Redis не становятся обязательными постоянными базами основного проекта. Они изучаются через ограниченные эксперименты и сравнение требований."}
        </Callout>

        <Callout tone={"warn"}>
          {"Index ускоряет некоторые reads ценой места и дополнительной работы при writes. Индекс на каждую колонку — не стратегия."}
        </Callout>

      </Section>

      <Section number={"06"} title={"Как работать с каждым занятием"}>
        <Lead>
          {"Низкий порог входа сохраняется через один повторяемый ритм: сначала назвать проблему, затем увидеть таблицу или rows, предсказать результат statement, выполнить маленький experiment и только после этого встроить изменение в StudyHub."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Понять:"}</strong>
              {" какой вопрос к данным решается и почему прежнего подхода недостаточно."}
            </li>
            <li>
              <strong>{"Увидеть:"}</strong>
              {" таблицу, rows, connection route или execution plan."}
            </li>
            <li>
              <strong>{"Предсказать:"}</strong>
              {" какие строки попадут в result и какая ошибка ожидается."}
            </li>
            <li>
              <strong>{"Запустить:"}</strong>
              {" минимальный SQL/psql/SQLAlchemy example."}
            </li>
            <li>
              <strong>{"Изменить:"}</strong>
              {" один filter, constraint, JOIN type или index column."}
            </li>
            <li>
              <strong>{"Проверить:"}</strong>
              {" result rows, tests, timing или restore."}
            </li>
            <li>
              <strong>{"Объяснить:"}</strong>
              {" путь данных и границу выбранного решения."}
            </li>
          </ol>
          <p>
            {"Ученик не переходит к следующему механизму, пока не может объяснить текущий на конкретном наборе строк."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"таблица до кода"}</>,
              <>{"нарисовать исходные rows"}</>,
            ],
            [
              <>{"prediction"}</>,
              <>{"записать ожидаемый result"}</>,
            ],
            [
              <>{"terminal"}</>,
              <>{"выполнить statement вручную"}</>,
            ],
            [
              <>{"project"}</>,
              <>{"повторить через StudyHub layer"}</>,
            ],
            [
              <>{"negative path"}</>,
              <>{"нарушить constraint или connection"}</>,
            ],
            [
              <>{"evidence"}</>,
              <>{"сохранить test, plan, benchmark или runbook"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"ритм одного занятия"}
          code={"problem\n→ data picture\n→ SQL prediction\n→ manual run\n→ one change\n→ error path\n→ StudyHub integration\n→ evidence"}
        />

        <FlipCards
          cards={[
            {
              front: <>{"До запуска"}</>,
              back: <>{"Назвать expected rows и возможную ошибку."}</>,
            },
            {
              front: <>{"После запуска"}</>,
              back: <>{"Сравнить реальный result с prediction."}</>,
            },
            {
              front: <>{"После интеграции"}</>,
              back: <>{"Запустить tests и проверить API contract."}</>,
            },
            {
              front: <>{"Перед коммитом"}</>,
              back: <>{"Объяснить изменение без чтения готового ответа."}</>,
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"модель"}
            title={"Одна новая идея"}
            code={"JOIN type / constraint / index"}
          >
            {"Сцена не смешивает несколько неизвестных механизмов."}
          </TypeCard>
          <TypeCard
            badge={"ошибка"}
            badgeTone={"float"}
            title={"Контролируемый сбой"}
            code={"constraint / connection / rollback"}
          >
            {"Ошибка изучается как часть контракта, а не как случайная поломка."}
          </TypeCard>
          <TypeCard
            badge={"артефакт"}
            badgeTone={"str"}
            title={"Проверяемый результат"}
            code={"test / plan / runbook"}
          >
            {"Каждое занятие оставляет доказательство понимания."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Не читать пассивно"}</h3>
          <p>
            {"Остановиться перед output и сформулировать prediction."}
          </p>

          <h3>{"Не копировать вслепую"}</h3>
          <p>
            {"Изменить один параметр и объяснить новый result."}
          </p>

          <h3>{"Не скрывать ошибки"}</h3>
          <p>
            {"Сохранить сообщение PostgreSQL и назвать нарушенное ожидание."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Главная визуальная единица этапа — конкретные строки таблицы и их преобразование. Абстрактные определения всегда связываются с данными StudyHub."}
        </Callout>

        <Callout tone={"warn"}>
          {"Большой SQL statement нельзя вводить одним экраном. Он собирается из FROM, JOIN, WHERE, GROUP BY и HAVING по шагам."}
        </Callout>

      </Section>

      <Section number={"07"} title={"Артефакты и критерии готовности блоков"}>
        <Lead>
          {"Переход между блоками определяется не номером занятия, а готовым артефактом. Это защищает курс от движения по верхам и позволяет наставнику проверять конкретное инженерное действие."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"После блока 21:"}</strong>
              {" sql-lab и перевод SQL ↔ SQLAlchemy."}
            </li>
            <li>
              <strong>{"После блока 22:"}</strong>
              {" чистая PostgreSQL database, migrations, seed и green tests."}
            </li>
            <li>
              <strong>{"После блока 23:"}</strong>
              {" statistics endpoint и transaction failure test."}
            </li>
            <li>
              <strong>{"После блока 24:"}</strong>
              {" baseline, EXPLAIN, index rationale, restore runbook и storage matrix."}
            </li>
            <li>
              <strong>{"После этапа:"}</strong>
              {" защита PostgreSQL StudyHub и демонстрация пути одного request."}
            </li>
          </ol>
          <p>
            {"Артефакт считается готовым, если другой человек может воспроизвести его по repository и README, а ученик — объяснить причину каждого шага."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"sql-lab"}</>,
              <>{"ручные parameterized statements"}</>,
            ],
            [
              <>{"migration proof"}</>,
              <>{"alembic upgrade head on clean database"}</>,
            ],
            [
              <>{"regression suite"}</>,
              <>{"unchanged HTTP contract"}</>,
            ],
            [
              <>{"statistics"}</>,
              <>{"JOIN + GROUP BY endpoint"}</>,
            ],
            [
              <>{"transaction test"}</>,
              <>{"both changes or none"}</>,
            ],
            [
              <>{"performance note"}</>,
              <>{"baseline, plan and measured result"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"контрольная матрица"}
          code={"Block 21 → SQL readable and reproducible\nBlock 22 → PostgreSQL migration reproducible\nBlock 23 → related data and transaction correct\nBlock 24 → measured optimization and storage decision"}
        />

        <TrueFalse
          statement={
            <>
              {"Этап завершён, если API работает на PostgreSQL, даже когда migrations, tests и restore не проверены."}
            </>
          }
          isTrue={false}
          explanation={"Рабочий случай на одной машине не доказывает воспроизводимость и сохранность данных."}
        />

        <TypeCards>
          <TypeCard
            badge={"code"}
            title={"Репозиторий"}
            code={"app + migrations + sql-lab"}
          >
            {"Содержит код и историю schema."}
          </TypeCard>
          <TypeCard
            badge={"proof"}
            badgeTone={"float"}
            title={"Проверка"}
            code={"pytest + smoke + restore"}
          >
            {"Подтверждает обычный и аварийный сценарии."}
          </TypeCard>
          <TypeCard
            badge={"explain"}
            badgeTone={"str"}
            title={"Защита"}
            code={"request → SQL → PostgreSQL"}
          >
            {"Ученик объясняет систему без заученной формулировки."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Проверить чистый старт"}</h3>
          <p>
            {"Создать пустую database и применить migrations."}
          </p>

          <h3>{"Проверить данные"}</h3>
          <p>
            {"Запустить seed или import и сверить ключевые counts."}
          </p>

          <h3>{"Проверить отказ"}</h3>
          <p>
            {"Нарушить constraint, сломать второй transaction-step или остановить server."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Четвёртая неделя этапа должна содержать интеграцию, диагностику и защиту, а не только новые команды."}
        </Callout>

        <Callout tone={"warn"}>
          {"Скриншот successful query не заменяет reproducible script, migration или automated test."}
        </Callout>

      </Section>

      <Section number={"08"} title={"Контрольная точка этапа 6"}>
        <Lead>
          {"Финальная проверка связывает SQL, PostgreSQL, relationships, transactions, plans и storage choices. Ученик должен не только показать endpoints, но и объяснить, какие guarantees даёт database и где заканчивается роль каждой технологии."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"SQL:"}</strong>
              {" написать parameterized CRUD и объяснить rows affected."}
            </li>
            <li>
              <strong>{"PostgreSQL:"}</strong>
              {" развернуть чистую database, role и schema из repository."}
            </li>
            <li>
              <strong>{"Relations:"}</strong>
              {" показать INNER/LEFT JOIN и many-to-many association table."}
            </li>
            <li>
              <strong>{"Statistics:"}</strong>
              {" объяснить GROUP BY, HAVING и EXISTS на данных StudyHub."}
            </li>
            <li>
              <strong>{"Transaction:"}</strong>
              {" продемонстрировать rollback после ошибки второго шага."}
            </li>
            <li>
              <strong>{"Performance:"}</strong>
              {" сравнить baseline и plan до/после обоснованного index."}
            </li>
            <li>
              <strong>{"Recovery:"}</strong>
              {" восстановить backup в отдельную database."}
            </li>
            <li>
              <strong>{"Architecture:"}</strong>
              {" защитить выбор PostgreSQL, MongoDB experiment и Redis TTL scenario."}
            </li>
          </ol>
          <p>
            {"Готовность подтверждается полным маршрутом: request → service → SQLAlchemy → SQL → PostgreSQL → result → response, плюс воспроизводимая диагностика ошибки."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"117–122"}</>,
              <>{"SQL grammar and ORM bridge"}</>,
            ],
            [
              <>{"123–128"}</>,
              <>{"PostgreSQL migration"}</>,
            ],
            [
              <>{"129–134"}</>,
              <>{"JOIN, aggregates and transaction"}</>,
            ],
            [
              <>{"135–140"}</>,
              <>{"measurement, recovery and storage models"}</>,
            ],
            [
              <>{"project"}</>,
              <>{"PostgreSQL StudyHub"}</>,
            ],
            [
              <>{"next"}</>,
              <>{"asyncio only after stable synchronous database layer"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"финальная демонстрация"}
          code={"1. clean database\n2. alembic upgrade head\n3. seed demo data\n4. run API tests\n5. show JOIN statistics\n6. trigger rollback\n7. show EXPLAIN\n8. restore backup\n9. defend storage matrix"}
        />

        <RecallCard
          question={"Почему следующий этап начинается с asyncio вне FastAPI, а не с немедленной замены всех def на async def?"}
          hint={"Сначала должен быть устойчивый синхронный baseline и точная модель I/O."}
          answer={
            <p>
              {"Async меняет способ ожидания I/O, но не исправляет неверный SQL, transaction или schema. Сначала завершается и измеряется синхронный PostgreSQL StudyHub."}
            </p>
          }
        />

        <TypeCards>
          <TypeCard
            badge={"data"}
            title={"Целостность"}
            code={"constraints + transactions"}
          >
            {"Database защищает правила и атомарные операции."}
          </TypeCard>
          <TypeCard
            badge={"speed"}
            badgeTone={"float"}
            title={"Измерение"}
            code={"baseline + EXPLAIN"}
          >
            {"Оптимизация опирается на наблюдаемый query pattern."}
          </TypeCard>
          <TypeCard
            badge={"choice"}
            badgeTone={"str"}
            title={"Архитектура"}
            code={"truth / document / temporary"}
          >
            {"Каждое хранилище получает ограниченную понятную роль."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Демонстрация"}</h3>
          <p>
            {"Пройти девять шагов финального сценария на чистой database."}
          </p>

          <h3>{"Диагностика"}</h3>
          <p>
            {"Объяснить connection, constraint и transaction errors."}
          </p>

          <h3>{"Защита"}</h3>
          <p>
            {"Ответить, почему выбран PostgreSQL и какие темы отложены."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"После этапа ученик готов изучать event loop и AsyncSession, потому что уже понимает, какой database I/O будет ожидать."}
        </Callout>

        <Callout tone={"warn"}>
          {"Redis и MongoDB не должны появиться в основном проекте без отдельного требования, lifecycle и source-of-truth решения."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что остаётся неизменным при переносе SQLite → PostgreSQL?"}
            options={[
              "HTTP contract",
              "connection URL",
              "server process",
            ]}
            correctIndex={0}
            explanation={"Клиент не должен зависеть от замены database implementation."}
          />

          <QuizCard
            question={"Когда добавлять index?"}
            options={[
              "После baseline и query pattern",
              "На каждую column сразу",
              "До появления данных",
            ]}
            correctIndex={0}
            explanation={"Index проектируется под измеренный способ чтения."}
          />

          <QuizCard
            question={"Что гарантирует transaction?"}
            options={[
              "Все изменения или ни одного",
              "Автоматический retry",
              "Отсутствие всех ошибок",
            ]}
            correctIndex={0}
            explanation={"Atomic boundary не допускает частично записанную операцию."}
          />

          <QuizCard
            question={"Основная роль Redis в этапе 6?"}
            options={[
              "Временное key/value с TTL",
              "Главная реляционная база",
              "Замена Alembic",
            ]}
            correctIndex={0}
            explanation={"PostgreSQL остаётся source of truth."}
          />

        </div>

        <KeyTakeaways
          points={[
            <>{"ORM отображает Python-модель на таблицу, но не отменяет SQL."}</>,
            <>{"PostgreSQL состоит из server, databases, schemas, roles и connections."}</>,
            <>{"Миграции должны восстановить schema на чистой database."}</>,
            <>{"JOIN выбирается по требуемому набору rows."}</>,
            <>{"GROUP BY и HAVING решают разные этапы aggregation pipeline."}</>,
            <>{"Transaction защищает атомарность бизнес-операции."}</>,
            <>{"Index появляется после baseline и чтения plan."}</>,
            <>{"PostgreSQL остаётся source of truth StudyHub."}</>,
          ]}
        />

        <PracticeCta
          text={"Подготовьте контрольный репозиторий PostgreSQL StudyHub: clean setup, migrations, seed, regression tests, JOIN statistics, transaction failure test, EXPLAIN note, backup/restore runbook и storage decision matrix."}
        />

      </Section>

    </RichLesson>
  );
}

export function MonthTheory() {
  return (
    <RichLesson>
      <RichHero
        variant={"project"}
        chip={"ЭТАП 6 · общая теория"}
        title={"SQL, PostgreSQL и модели хранения"}
        intro={"Единая модель этапа: validated Python data превращается в parameterized SQL, Session управляет transaction, PostgreSQL применяет constraints и plan, а архитектура разделяет source of truth, documents и temporary state."}
        tags={[
          {
            icon: <Table2 size={14} />,
            label: "relations и SQL",
          },
          {
            icon: <Workflow size={14} />,
            label: "transaction и query plan",
          },
        ]}
      />

      <Section number={"01"} title={"Главная модель: данные проходят несколько представлений"}>
        <Lead>
          {"Один Task существует в нескольких формах: JSON request, Pydantic schema, ORM object, SQL parameters, row PostgreSQL и JSON response. Ошибка возникает, когда граница между этими формами не названа или одна модель начинает выполнять чужую роль."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"HTTP:"}</strong>
              {" клиент передаёт JSON по API contract."}
            </li>
            <li>
              <strong>{"Pydantic:"}</strong>
              {" validation формирует корректные Python values."}
            </li>
            <li>
              <strong>{"ORM:"}</strong>
              {" объект отображает table columns и relationships."}
            </li>
            <li>
              <strong>{"SQL:"}</strong>
              {" statement описывает операцию над rows."}
            </li>
            <li>
              <strong>{"PostgreSQL:"}</strong>
              {" constraints и transaction фиксируют durable state."}
            </li>
            <li>
              <strong>{"Response:"}</strong>
              {" schema безопасно сериализует result клиенту."}
            </li>
          </ol>
          <p>
            {"При отладке полезно спросить не «почему база сломалась», а «на какой границе текущее представление перестало соответствовать контракту»."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"TaskCreate"}</>,
              <>{"validated request data"}</>,
            ],
            [
              <>{"TaskModel"}</>,
              <>{"ORM mapping to tasks table"}</>,
            ],
            [
              <>{"INSERT/SELECT"}</>,
              <>{"database operation"}</>,
            ],
            [
              <>{"constraints"}</>,
              <>{"database-level guarantees"}</>,
            ],
            [
              <>{"Session"}</>,
              <>{"unit of database work"}</>,
            ],
            [
              <>{"TaskRead"}</>,
              <>{"safe response representation"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"путь одного объекта"}
          code={"POST JSON\n→ TaskCreate\n→ TaskModel\n→ parameterized INSERT\n→ PostgreSQL row\n→ TaskRead\n→ JSON response"}
        />

        <StepThrough
          code={"payload = TaskCreate(...)\nmodel = TaskModel(**payload.model_dump())\nsession.add(model)\nsession.commit()\nsession.refresh(model)\nreturn model"}
          steps={[
            {
              line: 0,
              note: "Pydantic проверяет входной contract.",
              vars: {
                "форма": "TaskCreate",
              },
            },
            {
              line: 1,
              note: "Создаётся ORM object для table tasks.",
              vars: {
                "форма": "TaskModel",
              },
            },
            {
              line: 2,
              note: "Object становится pending в Session.",
              vars: {
                "state": "pending",
              },
            },
            {
              line: 3,
              note: "SQL отправляется PostgreSQL и transaction фиксируется.",
              vars: {
                "state": "committed",
              },
            },
            {
              line: 4,
              note: "Server-generated values читаются обратно.",
              vars: {
                "id": "assigned",
              },
            },
            {
              line: 5,
              note: "Response schema сериализует безопасные поля.",
              vars: {
                "форма": "JSON",
              },
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"API"}
            title={"Contract"}
            code={"TaskCreate / TaskRead"}
          >
            {"Описывает вход и безопасный ответ."}
          </TypeCard>
          <TypeCard
            badge={"ORM"}
            badgeTone={"float"}
            title={"Mapping"}
            code={"TaskModel"}
          >
            {"Связывает Python attributes и table columns."}
          </TypeCard>
          <TypeCard
            badge={"DB"}
            badgeTone={"str"}
            title={"Guarantee"}
            code={"constraint + transaction"}
          >
            {"Проверяет и фиксирует постоянное состояние."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Назвать форму"}</h3>
          <p>
            {"Определить, request schema, ORM object, SQL row или response сейчас рассматривается."}
          </p>

          <h3>{"Назвать boundary"}</h3>
          <p>
            {"Понять, кто выполняет conversion и validation."}
          </p>

          <h3>{"Проверить contract"}</h3>
          <p>
            {"Сравнить expected fields, types и database constraints."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Одна универсальная модель для request, database и response кажется проще, но быстро смешивает passwords, generated fields и internal state."}
        </Callout>

        <Callout tone={"warn"}>
          {"Database constraint не заменяет Pydantic validation, а Pydantic не гарантирует целостность при обходе API."}
        </Callout>

      </Section>

      <Section number={"02"} title={"Реляционная модель, ключи и ограничения"}>
        <Lead>
          {"Реляционная таблица хранит rows одинаковой формы. Primary key даёт устойчивую identity строки, foreign key выражает связь, а constraints запрещают состояния, которые приложение не должно считать допустимыми."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Table:"}</strong>
              {" именованный набор columns и rows."}
            </li>
            <li>
              <strong>{"Primary key:"}</strong>
              {" уникально определяет одну row."}
            </li>
            <li>
              <strong>{"Foreign key:"}</strong>
              {" ссылается на key другой table."}
            </li>
            <li>
              <strong>{"NOT NULL:"}</strong>
              {" значение обязательно на уровне database."}
            </li>
            <li>
              <strong>{"UNIQUE:"}</strong>
              {" запрещает повтор определённого значения или набора."}
            </li>
            <li>
              <strong>{"CHECK:"}</strong>
              {" задаёт простое условие допустимости."}
            </li>
          </ol>
          <p>
            {"Constraint ценен тем, что действует для любого клиента базы: FastAPI, migration script, SQL console или будущего worker."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"PRIMARY KEY"}</>,
              <>{"identity and uniqueness"}</>,
            ],
            [
              <>{"FOREIGN KEY"}</>,
              <>{"referential integrity"}</>,
            ],
            [
              <>{"NOT NULL"}</>,
              <>{"required value"}</>,
            ],
            [
              <>{"UNIQUE"}</>,
              <>{"no duplicate key"}</>,
            ],
            [
              <>{"DEFAULT"}</>,
              <>{"server-generated fallback"}</>,
            ],
            [
              <>{"CHECK"}</>,
              <>{"simple row condition"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"пример schema"}
          code={"CREATE TABLE tasks (\n  id BIGSERIAL PRIMARY KEY,\n  owner_id BIGINT NOT NULL REFERENCES users(id),\n  title VARCHAR(200) NOT NULL,\n  priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),\n  is_done BOOLEAN NOT NULL DEFAULT FALSE\n);"}
        />

        <BugHunt
          code={"CREATE TABLE tasks (\n  title TEXT,\n  owner_id INTEGER,\n  priority INTEGER\n);"}
          question={"Какой главный риск у такой schema?"}
          options={[
            "Она не фиксирует identity, обязательность и диапазон",
            "PostgreSQL запрещает TEXT",
            "В table нельзя три columns",
          ]}
          correctIndex={0}
          explanation={"База разрешает пустые и неоднозначные rows, которые приложение считает некорректными."}
          fix={"CREATE TABLE tasks (\n  id BIGSERIAL PRIMARY KEY,\n  owner_id BIGINT NOT NULL REFERENCES users(id),\n  title TEXT NOT NULL,\n  priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5)\n);"}
        />

        <TypeCards>
          <TypeCard
            badge={"identity"}
            title={"Primary key"}
            code={"id"}
          >
            {"Стабильно отличает одну row от другой."}
          </TypeCard>
          <TypeCard
            badge={"relation"}
            badgeTone={"float"}
            title={"Foreign key"}
            code={"owner_id → users.id"}
          >
            {"Не позволяет ссылаться на несуществующего owner."}
          </TypeCard>
          <TypeCard
            badge={"rule"}
            badgeTone={"str"}
            title={"Constraint"}
            code={"CHECK / UNIQUE"}
          >
            {"Сохраняет инвариант независимо от пути записи."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Сформулировать правило"}</h3>
          <p>
            {"Сначала описать допустимое состояние человеческим языком."}
          </p>

          <h3>{"Выбрать уровень"}</h3>
          <p>
            {"Решить, что проверяется API, model и database."}
          </p>

          <h3>{"Нарушить constraint"}</h3>
          <p>
            {"Увидеть реальную database error и обработать transaction."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Дублирование проверки в Pydantic и database оправдано, когда оно защищает разные границы."}
        </Callout>

        <Callout tone={"warn"}>
          {"Primary key не обязан иметь предметный смысл. Его задача — надёжная identity row."}
        </Callout>

      </Section>

      <Section number={"03"} title={"SQL statement и безопасные parameters"}>
        <Lead>
          {"SQL описывает операцию, а пользовательские значения передаются отдельно. Это одновременно делает contract яснее, позволяет driver корректно кодировать types и исключает интерпретацию data как части SQL syntax."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Statement:"}</strong>
              {" неизменяемая структура SELECT/INSERT/UPDATE/DELETE."}
            </li>
            <li>
              <strong>{"Parameter:"}</strong>
              {" отдельное значение title, email, id или limit."}
            </li>
            <li>
              <strong>{"Driver:"}</strong>
              {" передаёт statement и parameters PostgreSQL."}
            </li>
            <li>
              <strong>{"Planner:"}</strong>
              {" строит plan для statement."}
            </li>
            <li>
              <strong>{"Executor:"}</strong>
              {" читает или изменяет rows."}
            </li>
            <li>
              <strong>{"Result:"}</strong>
              {" возвращает rows, row count или generated values."}
            </li>
          </ol>
          <p>
            {"Безопасность parameterization появляется не из ручного экранирования строк, а из отделения кода запроса от данных."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"SELECT"}</>,
              <>{"read rows"}</>,
            ],
            [
              <>{"INSERT"}</>,
              <>{"create rows"}</>,
            ],
            [
              <>{"UPDATE"}</>,
              <>{"change selected rows"}</>,
            ],
            [
              <>{"DELETE"}</>,
              <>{"remove selected rows"}</>,
            ],
            [
              <>{"RETURNING"}</>,
              <>{"return affected rows"}</>,
            ],
            [
              <>{"parameters"}</>,
              <>{"values outside SQL text"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"parameterized query"}
          code={"statement = text(\"SELECT * FROM tasks WHERE owner_id = :owner_id\")\nrows = session.execute(statement, {\"owner_id\": user_id})"}
        />

        <CompareSolutions
          question={"Какой вариант сохраняет разделение SQL и данных?"}
          left={{
            title: "String interpolation",
            code: "sql = f\"... WHERE title = '{title}'\"",
            note: "Data становится частью SQL text.",
          }}
          right={{
            title: "Bound parameter",
            code: "text(\"... WHERE title = :title\")\n{\"title\": title}",
            note: "Statement и value передаются отдельно.",
          }}
          preferred={"right"}
          explanation={"Parameterization защищает syntax boundary и корректно передаёт type."}
        />

        <TypeCards>
          <TypeCard
            badge={"text"}
            title={"Statement"}
            code={"WHERE id = :task_id"}
          >
            {"Описывает структуру операции."}
          </TypeCard>
          <TypeCard
            badge={"value"}
            badgeTone={"float"}
            title={"Parameters"}
            code={"{\"task_id\": 42}"}
          >
            {"Содержит данные конкретного вызова."}
          </TypeCard>
          <TypeCard
            badge={"result"}
            badgeTone={"str"}
            title={"Rows"}
            code={"scalars().all()"}
          >
            {"Возвращаются после выполнения server-side plan."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Сначала expected rows"}</h3>
          <p>
            {"До выполнения назвать точный набор, который должен вернуться."}
          </p>

          <h3>{"Затем parameters"}</h3>
          <p>
            {"Передать values отдельным mapping или SQLAlchemy expression."}
          </p>

          <h3>{"После проверить edge cases"}</h3>
          <p>
            {"Пустая строка, отсутствующий id и нулевой result."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"SQLAlchemy expressions также parameterized: значения не нужно вручную вставлять в строку SQL."}
        </Callout>

        <Callout tone={"warn"}>
          {"Использование ORM не освобождает от понимания SELECT, WHERE, JOIN и transaction boundary."}
        </Callout>

      </Section>

      <Section number={"04"} title={"PostgreSQL server, connection и Session"}>
        <Lead>
          {"SQLite скрывал database внутри файла. PostgreSQL добавляет отдельный server process, network connection, role и pool. SQLAlchemy Engine управляет connections, а Session задаёт рабочий контекст ORM-операций и transaction."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Server:"}</strong>
              {" слушает host/port и обслуживает databases."}
            </li>
            <li>
              <strong>{"Role:"}</strong>
              {" проходит authentication и получает permissions."}
            </li>
            <li>
              <strong>{"Driver:"}</strong>
              {" реализует PostgreSQL protocol для Python."}
            </li>
            <li>
              <strong>{"Engine:"}</strong>
              {" создаёт и переиспользует connections."}
            </li>
            <li>
              <strong>{"Session:"}</strong>
              {" отслеживает ORM objects и transaction."}
            </li>
            <li>
              <strong>{"Dependency:"}</strong>
              {" выдаёт одну Session на HTTP request."}
            </li>
          </ol>
          <p>
            {"Глобальная Session опасна не потому, что Python запрещает global, а потому что разные requests начинают делить transaction state и lifecycle."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"host"}</>,
              <>{"адрес server"}</>,
            ],
            [
              <>{"port"}</>,
              <>{"сетевой вход PostgreSQL"}</>,
            ],
            [
              <>{"database"}</>,
              <>{"логическое пространство проекта"}</>,
            ],
            [
              <>{"role"}</>,
              <>{"identity connection"}</>,
            ],
            [
              <>{"pool"}</>,
              <>{"набор reusable connections"}</>,
            ],
            [
              <>{"Session"}</>,
              <>{"unit of work for one request"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"lifecycle request"}
          code={"request\n→ get_db opens Session\n→ Session gets connection from pool\n→ SQL executes on PostgreSQL\n→ commit or rollback\n→ Session closes\n→ connection returns to pool"}
        />

        <StepThrough
          code={"def get_db():\n    db = SessionLocal()\n    try:\n        yield db\n    finally:\n        db.close()"}
          steps={[
            {
              line: 0,
              note: "FastAPI вызывает dependency для request.",
              vars: {
                "scope": "request",
              },
            },
            {
              line: 1,
              note: "Создаётся отдельная Session.",
              vars: {
                "session": "open",
              },
            },
            {
              line: 2,
              note: "Начинается guarded lifecycle.",
              vars: {
                "cleanup": "guaranteed",
              },
            },
            {
              line: 3,
              note: "Endpoint получает Session.",
              vars: {
                "endpoint": "uses db",
              },
            },
            {
              line: 4,
              note: "После success/error выполняется finally.",
              vars: {
                "request": "finishing",
              },
            },
            {
              line: 5,
              note: "Session закрывается, connection возвращается pool.",
              vars: {
                "session": "closed",
              },
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"engine"}
            title={"Connection factory"}
            code={"create_engine(url)"}
          >
            {"Хранит dialect, driver и pool."}
          </TypeCard>
          <TypeCard
            badge={"pool"}
            badgeTone={"float"}
            title={"Reuse"}
            code={"connections"}
          >
            {"Не открывает новое network connection для каждой строки."}
          </TypeCard>
          <TypeCard
            badge={"session"}
            badgeTone={"str"}
            title={"Unit of work"}
            code={"SessionLocal()"}
          >
            {"Объединяет ORM operations и transaction state."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Проверить server"}</h3>
          <p>
            {"До Python убедиться, что PostgreSQL process и port доступны."}
          </p>

          <h3>{"Проверить URL"}</h3>
          <p>
            {"Разобрать driver, role, host, port и database."}
          </p>

          <h3>{"Проверить lifecycle"}</h3>
          <p>
            {"Убедиться, что Session закрывается и после exception."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Engine обычно создаётся один раз на process, Session — отдельно на request или короткую операцию."}
        </Callout>

        <Callout tone={"warn"}>
          {"Pool не является кешем query results. Он переиспользует network connections."}
        </Callout>

      </Section>

      <Section number={"05"} title={"JOIN и aggregate pipeline"}>
        <Lead>
          {"SQL может превратить несколько tables в один логический result. JOIN определяет пары rows, WHERE отбирает строки до aggregation, GROUP BY создаёт группы, aggregate functions вычисляют показатели, HAVING фильтрует готовые группы."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"FROM:"}</strong>
              {" выбирает исходный relation."}
            </li>
            <li>
              <strong>{"JOIN/ON:"}</strong>
              {" добавляет rows связанной table."}
            </li>
            <li>
              <strong>{"WHERE:"}</strong>
              {" фильтрует подробные rows."}
            </li>
            <li>
              <strong>{"GROUP BY:"}</strong>
              {" формирует группы."}
            </li>
            <li>
              <strong>{"COUNT/AVG:"}</strong>
              {" вычисляет значения группы."}
            </li>
            <li>
              <strong>{"HAVING:"}</strong>
              {" фильтрует aggregate result."}
            </li>
            <li>
              <strong>{"ORDER/LIMIT:"}</strong>
              {" оформляет финальный result."}
            </li>
          </ol>
          <p>
            {"Логический порядок помогает диагностировать запрос: условие на обычную row относится к WHERE, условие на COUNT группы — к HAVING."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"INNER JOIN"}</>,
              <>{"matched rows only"}</>,
            ],
            [
              <>{"LEFT JOIN"}</>,
              <>{"all left rows"}</>,
            ],
            [
              <>{"WHERE"}</>,
              <>{"row filter"}</>,
            ],
            [
              <>{"GROUP BY"}</>,
              <>{"group creation"}</>,
            ],
            [
              <>{"COUNT"}</>,
              <>{"aggregate value"}</>,
            ],
            [
              <>{"HAVING"}</>,
              <>{"group filter"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"aggregate query"}
          code={"SELECT users.id, COUNT(tasks.id) AS task_count\nFROM users\nLEFT JOIN tasks ON tasks.owner_id = users.id\nWHERE users.is_active = TRUE\nGROUP BY users.id\nHAVING COUNT(tasks.id) >= 3\nORDER BY task_count DESC;"}
        />

        <CodeSequence
          title={"Соберите логический pipeline запроса"}
          prompt={"Расположите этапы по смыслу обработки rows."}
          pieces={[
            {
              id: "from",
              code: "FROM users",
            },
            {
              id: "join",
              code: "LEFT JOIN tasks ON ...",
            },
            {
              id: "where",
              code: "WHERE users.is_active",
            },
            {
              id: "group",
              code: "GROUP BY users.id",
            },
            {
              id: "having",
              code: "HAVING COUNT(tasks.id) >= 3",
            },
            {
              id: "order",
              code: "ORDER BY task_count DESC",
            },
          ]}
          correctOrder={[
            "from",
            "join",
            "where",
            "group",
            "having",
            "order",
          ]}
          explanation={"Сначала формируются и фильтруются rows, затем groups и aggregate conditions."}
        />

        <TypeCards>
          <TypeCard
            badge={"row"}
            title={"WHERE"}
            code={"task.is_done = false"}
          >
            {"Проверяет конкретную строку до grouping."}
          </TypeCard>
          <TypeCard
            badge={"group"}
            badgeTone={"float"}
            title={"GROUP BY"}
            code={"users.id"}
          >
            {"Собирает связанные rows по owner."}
          </TypeCard>
          <TypeCard
            badge={"metric"}
            badgeTone={"str"}
            title={"HAVING"}
            code={"COUNT(*) >= 3"}
          >
            {"Проверяет вычисленный показатель группы."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Разложить tables"}</h3>
          <p>
            {"Показать маленькие users/tasks и вручную получить JOIN rows."}
          </p>

          <h3>{"Сгруппировать руками"}</h3>
          <p>
            {"Собрать rows одного owner и посчитать COUNT."}
          </p>

          <h3>{"Только затем SQLAlchemy"}</h3>
          <p>
            {"Повторить смысл через select, join и func.count."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"COUNT(column) не считает NULL, а COUNT(*) считает rows. Это важно после LEFT JOIN."}
        </Callout>

        <Callout tone={"warn"}>
          {"Неправильное условие JOIN может создать лишние пары rows и искажённую statistics."}
        </Callout>

      </Section>

      <Section number={"06"} title={"Transaction, error и rollback"}>
        <Lead>
          {"Transaction объединяет несколько database changes в одну логическую операцию. Пока commit не выполнен, результат можно откатить. После IntegrityError Session требует rollback, прежде чем продолжать работу."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Begin:"}</strong>
              {" начинается transaction context."}
            </li>
            <li>
              <strong>{"Change A:"}</strong>
              {" например task становится completed."}
            </li>
            <li>
              <strong>{"Change B:"}</strong>
              {" создаётся progress event."}
            </li>
            <li>
              <strong>{"Success:"}</strong>
              {" commit фиксирует оба изменения."}
            </li>
            <li>
              <strong>{"Failure:"}</strong>
              {" rollback отменяет оба изменения."}
            </li>
            <li>
              <strong>{"Recovery:"}</strong>
              {" Session возвращается в usable state."}
            </li>
          </ol>
          <p>
            {"Граница transaction должна соответствовать бизнес-операции, а не случайному количеству строк кода."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"BEGIN"}</>,
              <>{"start atomic operation"}</>,
            ],
            [
              <>{"flush"}</>,
              <>{"send pending SQL without final commit"}</>,
            ],
            [
              <>{"COMMIT"}</>,
              <>{"make changes durable"}</>,
            ],
            [
              <>{"ROLLBACK"}</>,
              <>{"discard transaction changes"}</>,
            ],
            [
              <>{"IntegrityError"}</>,
              <>{"database constraint violation"}</>,
            ],
            [
              <>{"Session state"}</>,
              <>{"must recover before reuse"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"атомарный flow"}
          code={"try:\n    task.is_done = True\n    session.add(TaskEvent(task_id=task.id, kind=\"completed\"))\n    session.commit()\nexcept IntegrityError:\n    session.rollback()\n    raise"}
        />

        <BranchExplorer
          code={"BEGIN\nUPDATE tasks\nINSERT task_events\nCOMMIT\nROLLBACK"}
          scenarios={[
            {
              label: "оба statements успешны",
              activeLine: 3,
              output: "COMMIT: task и event сохранены",
            },
            {
              label: "INSERT нарушает constraint",
              activeLine: 4,
              output: "ROLLBACK: task остаётся незавершённой",
            },
            {
              label: "rollback пропущен",
              activeLine: 2,
              output: "Session остаётся failed и следующий query не выполняется",
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"all"}
            title={"Commit"}
            code={"A + B"}
          >
            {"Фиксирует целую успешную операцию."}
          </TypeCard>
          <TypeCard
            badge={"none"}
            badgeTone={"float"}
            title={"Rollback"}
            code={"0 changes"}
          >
            {"Возвращает database к состоянию до transaction."}
          </TypeCard>
          <TypeCard
            badge={"state"}
            badgeTone={"str"}
            title={"Session recovery"}
            code={"rollback()"}
          >
            {"Обязателен после database exception."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Описать инвариант"}</h3>
          <p>
            {"Например completed task всегда имеет completion event."}
          </p>

          <h3>{"Вызвать ошибку"}</h3>
          <p>
            {"Сломать второй statement контролируемым constraint."}
          </p>

          <h3>{"Проверить database"}</h3>
          <p>
            {"Убедиться, что первый change тоже не сохранился."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"HTTP response формируется после успешного commit. Нельзя сообщать клиенту успех до фиксации database state."}
        </Callout>

        <Callout tone={"warn"}>
          {"finally не должен безусловно commit transaction. Он подходит для cleanup, а не для выбора успешного исхода."}
        </Callout>

      </Section>

      <Section number={"07"} title={"Индекс, plan и измерение"}>
        <Lead>
          {"Index — дополнительная структура, которая может сократить поиск подходящих rows. PostgreSQL planner выбирает между Seq Scan и Index Scan по статистике и стоимости. Поэтому наличие index не гарантирует его использование."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Baseline:"}</strong>
              {" повторяемый query и достаточный набор data."}
            </li>
            <li>
              <strong>{"Query pattern:"}</strong>
              {" filter, sorting и columns вместе."}
            </li>
            <li>
              <strong>{"Index design:"}</strong>
              {" одна или несколько columns в определённом порядке."}
            </li>
            <li>
              <strong>{"EXPLAIN:"}</strong>
              {" estimated plan без выполнения."}
            </li>
            <li>
              <strong>{"EXPLAIN ANALYZE:"}</strong>
              {" реальное выполнение и actual rows/time."}
            </li>
            <li>
              <strong>{"Decision:"}</strong>
              {" сохранить index только при понятной пользе и цене."}
            </li>
          </ol>
          <p>
            {"Оптимизация завершается не созданием index, а сравнением измерений и письменным объяснением результата."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"Seq Scan"}</>,
              <>{"read table rows sequentially"}</>,
            ],
            [
              <>{"Index Scan"}</>,
              <>{"use index to locate rows"}</>,
            ],
            [
              <>{"estimated rows"}</>,
              <>{"planner expectation"}</>,
            ],
            [
              <>{"actual rows"}</>,
              <>{"observed execution"}</>,
            ],
            [
              <>{"composite index"}</>,
              <>{"ordered columns for query pattern"}</>,
            ],
            [
              <>{"write cost"}</>,
              <>{"index maintenance on mutations"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"query pattern and index"}
          code={"SELECT * FROM tasks\nWHERE owner_id = :owner_id\n  AND is_done = FALSE\nORDER BY created_at DESC\nLIMIT 20;\n\nINDEX (owner_id, is_done, created_at DESC)"}
        />

        <TrueFalse
          statement={
            <>
              {"Если index существует, PostgreSQL обязан использовать Index Scan."}
            </>
          }
          isTrue={false}
          explanation={"Planner может выбрать Seq Scan, например для маленькой table или низкой селективности."}
        />

        <TypeCards>
          <TypeCard
            badge={"before"}
            title={"Baseline"}
            code={"time + plan"}
          >
            {"Фиксирует исходное поведение запроса."}
          </TypeCard>
          <TypeCard
            badge={"change"}
            badgeTone={"float"}
            title={"Index"}
            code={"(owner_id, is_done, created_at)"}
          >
            {"Поддерживает конкретный filter/sort pattern."}
          </TypeCard>
          <TypeCard
            badge={"after"}
            badgeTone={"str"}
            title={"Evidence"}
            code={"actual rows + timing"}
          >
            {"Показывает эффект и trade-off."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Сгенерировать data"}</h3>
          <p>
            {"Небольшие 5 rows не показывают стоимость полного чтения."}
          </p>

          <h3>{"Снять plan"}</h3>
          <p>
            {"Записать Seq/Index Scan, rows и timing."}
          </p>

          <h3>{"Повторить одинаково"}</h3>
          <p>
            {"Сравнивать один query pattern и одинаковый dataset."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Composite index проектируется в порядке, согласованном с filters и sorting. Порядок columns имеет значение."}
        </Callout>

        <Callout tone={"warn"}>
          {"EXPLAIN ANALYZE действительно выполняет statement. Для mutation queries нужен безопасный transaction или тестовая database."}
        </Callout>

      </Section>

      <Section number={"08"} title={"Source of truth, documents и temporary state"}>
        <Lead>
          {"Финальная теория этапа разделяет три модели. PostgreSQL хранит связанное постоянное состояние и гарантии. MongoDB хранит document как естественную единицу. Redis хранит быстрые key/value с lifetime. Выбор определяется формой данных, consistency и восстановимостью."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"PostgreSQL:"}</strong>
              {" relations, constraints, transactions и durable source of truth."}
            </li>
            <li>
              <strong>{"MongoDB:"}</strong>
              {" document, nested shape, embed/reference и controlled duplication."}
            </li>
            <li>
              <strong>{"Redis:"}</strong>
              {" memory-first key/value, TTL, cache и временное service state."}
            </li>
            <li>
              <strong>{"Lifetime:"}</strong>
              {" постоянное, восстанавливаемое или временное значение."}
            </li>
            <li>
              <strong>{"Consistency:"}</strong>
              {" какая гарантия нужна между связанными данными."}
            </li>
            <li>
              <strong>{"Recovery:"}</strong>
              {" откуда восстановить значение после потери."}
            </li>
          </ol>
          <p>
            {"Основной StudyHub остаётся PostgreSQL-монолитом. Другие модели вводятся как ограниченные эксперименты, чтобы ученик умел выбирать, а не смешивать технологии."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"source of truth"}</>,
              <>{"authoritative durable state"}</>,
            ],
            [
              <>{"cache"}</>,
              <>{"derived and replaceable copy"}</>,
            ],
            [
              <>{"TTL"}</>,
              <>{"automatic expiration"}</>,
            ],
            [
              <>{"document"}</>,
              <>{"nested aggregate stored together"}</>,
            ],
            [
              <>{"embed"}</>,
              <>{"data inside document"}</>,
            ],
            [
              <>{"reference"}</>,
              <>{"link to another document"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"decision path"}
          code={"Нужны relations + transaction? → PostgreSQL\nЕстественная единица — целый nested document? → MongoDB experiment\nЗначение временное и восстанавливаемое? → Redis with TTL\nНеясно? → начать с PostgreSQL и конкретных требований"}
        />

        <RecallCard
          question={"Почему cached statistics в Redis не должна быть единственным источником данных?"}
          hint={"Что произойдёт после expiration или очистки Redis?"}
          answer={
            <p>
              {"Cache может исчезнуть и должен восстанавливаться из authoritative PostgreSQL rows. Иначе временное хранилище становится скрытой основной базой без нужных гарантий."}
            </p>
          }
        />

        <TypeCards>
          <TypeCard
            badge={"durable"}
            title={"PostgreSQL"}
            code={"users/tasks/relations"}
          >
            {"Главное состояние и business guarantees."}
          </TypeCard>
          <TypeCard
            badge={"document"}
            badgeTone={"float"}
            title={"MongoDB"}
            code={"course snapshot"}
          >
            {"Отдельный эксперимент с document-shaped data."}
          </TypeCard>
          <TypeCard
            badge={"ttl"}
            badgeTone={"str"}
            title={"Redis"}
            code={"verification:123 → 600s"}
          >
            {"Временное или производное значение."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Назвать владельца истины"}</h3>
          <p>
            {"Для каждого field определить authoritative storage."}
          </p>

          <h3>{"Назвать lifetime"}</h3>
          <p>
            {"Постоянно, до expiration или до следующего расчёта."}
          </p>

          <h3>{"Назвать recovery"}</h3>
          <p>
            {"Как восстановить value после loss."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Redis глубже применяется позже, когда в LMS появляется измеримая потребность в cache и rate limit."}
        </Callout>

        <Callout tone={"warn"}>
          {"Гибкая schema MongoDB не означает отсутствие schema. Contract всё равно существует в application и данных."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Кто остаётся source of truth StudyHub?"}
            options={[
              "PostgreSQL",
              "Redis cache",
              "Postman",
            ]}
            correctIndex={0}
            explanation={"Основное связанное состояние хранится в реляционной базе."}
          />

          <QuizCard
            question={"Что фильтрует HAVING?"}
            options={[
              "Сформированные группы",
              "Connection pool",
              "Pydantic body",
            ]}
            correctIndex={0}
            explanation={"HAVING применяется после GROUP BY и aggregate calculation."}
          />

          <QuizCard
            question={"Что делать после IntegrityError перед новым query?"}
            options={[
              "rollback",
              "создать index",
              "перезапустить браузер",
            ]}
            correctIndex={0}
            explanation={"Session должна выйти из failed transaction state."}
          />

          <QuizCard
            question={"Почему planner может выбрать Seq Scan?"}
            options={[
              "Он оценил его дешевле",
              "Index запрещён SQL",
              "SELECT не поддерживает index",
            ]}
            correctIndex={0}
            explanation={"Plan выбирается по cost, statistics и ожидаемому набору rows."}
          />

        </div>

        <KeyTakeaways
          points={[
            <>{"Один объект проходит request, schema, ORM, SQL, row и response representations."}</>,
            <>{"Constraints защищают data независимо от клиента базы."}</>,
            <>{"SQL statement отделяется от parameter values."}</>,
            <>{"Engine управляет connections, Session — unit of work и transaction state."}</>,
            <>{"WHERE фильтрует rows, HAVING — aggregate groups."}</>,
            <>{"Rollback восстанавливает атомарность и Session state."}</>,
            <>{"Index проверяется plan и измерениями."}</>,
            <>{"Temporary storage должно иметь source of truth и recovery path."}</>,
          ]}
        />

        <PracticeCta
          text={"Нарисуйте техническую карту одного endpoint StudyHub: request schema → dependency Session → SQLAlchemy statement → parameterized SQL → PostgreSQL plan/transaction → ORM result → response schema. Добавьте рядом constraint, failure path, rollback и возможный index только после baseline."}
        />

      </Section>

    </RichLesson>
  );
}

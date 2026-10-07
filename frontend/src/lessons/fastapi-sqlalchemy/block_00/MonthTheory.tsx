import { Braces, Layers } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";

export function MonthTheory() {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={"ЭТАП 4 · общая теория"}
        title={"Теория этапа 4"}
        intro={"Главная модель этапа: HTTP request получает управляемую Session через dependency, SQLAlchemy строит и выполняет statement, database transaction меняет rows, ORM-объекты превращаются в response schema, а Alembic хранит историю schema."}
        tags={[
          { icon: <Layers size={14} />, label: "FastAPI → SQLAlchemy" },
          { icon: <Braces size={14} />, label: "schema · transaction · migration" },
        ]}
      />

      <Section number="01" title={"Почему in-memory storage перестаёт подходить"}>
        <Lead>
          {"Список Python был правильным учебным хранилищем для первого API: он позволял увидеть HTTP-контракт без базы. Но после появления реального проекта его ограничения становятся частью поведения и требуют отдельного решения."}
        </Lead>

        <TypeCards>
          <TypeCard badge={"restart"} title={"Данные исчезают"} code={"tasks = []"}>
            {"Новый процесс создаёт новый пустой list."}
          </TypeCard>
          <TypeCard badge={"workers"} badgeTone={"float"} title={"Состояние расходится"} code={"worker A ≠ worker B"}>
            {"Два процесса получили бы два независимых списка."}
          </TypeCard>
          <TypeCard badge={"rules"} badgeTone={"str"} title={"Ограничения держит код"} code={"if duplicate: ..."}>
            {"Уникальность и links проверяются вручную в каждом пути."}
          </TypeCard>
        </TypeCards>

        <CompareSolutions
          question={"Какое требование уже нельзя надёжно закрыть одним list?"}
          left={{
            title: "Показать задачи",
            code: "return tasks",
            note: "Один процесс легко возвращает текущие элементы.",
          }}
          right={{
            title: "Сохранить и согласовать данные",
            code: "restart + multiple requests + constraints",
            note: "Нужно устойчивое состояние и правила на уровне database.",
          }}
          preferred={"right"}
          explanation={"База появляется тогда, когда данные должны переживать процесс и сохранять целостность."}
        />

        <CodeBlock
          caption={"новая ответственность"}
          code={
            "API contract отвечает: как клиент общается\n" +
            "Database отвечает: как данные хранятся и проверяются\n" +
            "SQLAlchemy отвечает: как Python-код формулирует работу с database\n" +
            "Alembic отвечает: как schema изменяется во времени"
          }
        />

        <Callout tone={"info"}>
          {"База не заменяет validation Pydantic. Schema request проверяет вход API, а database constraints защищают сохранённое состояние."}
        </Callout>

        <MethodGrid
          rows={[
            [
              <>{"restart"}</>,
              <>{"После остановки API rows должны остаться."}</>,
            ],
            [
              <>{"concurrent clients"}</>,
              <>{"Несколько requests должны видеть согласованное состояние."}</>,
            ],
            [
              <>{"unique value"}</>,
              <>{"Дубликат должен отклоняться независимо от endpoint."}</>,
            ],
            [
              <>{"relation"}</>,
              <>{"Task не должна ссылаться на отсутствующую category."}</>,
            ],
            [
              <>{"query"}</>,
              <>{"Filters и pagination должны выполняться без загрузки всего набора в Python."}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"требование → механизм"}
          code={
            "persistence → table rows\n" +
            "identity → primary key\n" +
            "valid relation → foreign key\n" +
            "unique title → unique constraint\n" +
            "atomic change → transaction\n" +
            "fast lookup → index\n" +
            "reproducible schema → migration"
          }
        />

      </Section>

      <Section number="02" title={"SQLite, SQLAlchemy и Alembic — разные инструменты"}>
        <Lead>
          {"Три названия часто сливаются в одно слово «база». Полезно разделить файл database, Python toolkit и историю schema."}
        </Lead>

        <TypeCards>
          <TypeCard badge={"SQLite"} title={"Database engine"} code={"studyhub.db"}>
            {"Хранит tables, rows, indexes и constraints в локальном файле."}
          </TypeCard>
          <TypeCard badge={"SQLAlchemy"} badgeTone={"float"} title={"Python toolkit и ORM"} code={"select(Task)"}>
            {"Создаёт engine, Session, models и SQL expressions."}
          </TypeCard>
          <TypeCard badge={"Alembic"} badgeTone={"str"} title={"Migration tool"} code={"alembic upgrade head"}>
            {"Хранит revisions с upgrade и downgrade."}
          </TypeCard>
        </TypeCards>

        <MatchPairs
          prompt={"Соедините проблему и инструмент."}
          leftTitle={"Задача"}
          rightTitle={"Инструмент"}
          pairs={[
            {
              left: "сохранить rows после restart",
              right: "SQLite",
            },
            {
              left: "построить SELECT из Python",
              right: "SQLAlchemy",
            },
            {
              left: "создать Session для transaction",
              right: "SQLAlchemy",
            },
            {
              left: "повторить изменение schema",
              right: "Alembic",
            },
            {
              left: "посмотреть фактические tables",
              right: "SQLite viewer",
            },
          ]}
          explanation={"Инструменты работают вместе, но не взаимозаменяют друг друга."}
        />

        <CodeBlock
          caption={"слои"}
          code={
            "FastAPI\n" +
            "  ↓ dependency\n" +
            "SQLAlchemy Session\n" +
            "  ↓ SQL\n" +
            "SQLite database file\n" +
            "\n" +
            "Alembic ── управляет изменениями schema SQLite"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Alembic хранит пользовательские задачи вместо SQLite."}
            </>
          }
          isTrue={false}
          explanation={"Alembic хранит migration scripts и version state, а rows находятся в database tables."}
        />

        <Callout>
          {"На будущем PostgreSQL SQLAlchemy и Alembic останутся, а database URL и особенности engine изменятся. Поэтому роли изучаются отдельно."}
        </Callout>

        <CodeBlock
          caption={"одна операция на трёх уровнях"}
          code={
            "SQLite: INSERT INTO tasks (...) VALUES (...)\n" +
            "SQLAlchemy: session.add(task); session.commit()\n" +
            "FastAPI: POST /tasks → 201 Created"
          }
        />

        <RecallCard
          question={"Почему эти три строки нельзя считать взаимозаменяемыми?"}
          hint={"Определите, кто является читателем каждой формы."}
          answer={
            <p>
              {"Они описывают одну операцию на разных границах: SQL database, Python persistence layer и HTTP API contract."}
            </p>
          }
        />

        <div className="lesson-practice-steps">
          <h3>SQLite отвечает на SQL</h3>
          <p>
            {"Создаёт tables, хранит rows и применяет constraints."}
          </p>

          <h3>SQLAlchemy строит работу Python</h3>
          <p>
            {"Engine и Session отправляют SQL, ORM maps rows в objects."}
          </p>

          <h3>Alembic меняет schema</h3>
          <p>
            {"Migration scripts переводят database между revisions."}
          </p>

          <h3>FastAPI связывает request</h3>
          <p>
            {"Dependency выдаёт Session, endpoint выбирает operation и response."}
          </p>

        </div>

        <TerminalDemo
          title={"одна и та же база с разных сторон"}
          lines={[
            { cmd: "sqlite3 studyhub.db \".tables\"" },
            { out: "alembic_version  categories  tasks" },
            { cmd: "alembic current" },
            { out: "<revision> (head)" },
          ]}
        />

      </Section>

      <Section number="03" title={"Таблица, строка, столбец и ключ"}>
        <Lead>
          {"ORM не отменяет реляционную модель. Перед Python-классом нужно видеть table: каждая row представляет один объект, columns хранят свойства, primary key отличает rows, foreign key связывает tables."}
        </Lead>

        <MethodGrid
          rows={[
            [
              <>{"table"}</>,
              <>{"Именованный набор rows одной формы, например tasks."}</>,
            ],
            [
              <>{"row"}</>,
              <>{"Одна сохранённая задача."}</>,
            ],
            [
              <>{"column"}</>,
              <>{"Поле каждой row: id, title, priority, is_done."}</>,
            ],
            [
              <>{"data type"}</>,
              <>{"Ограничивает вид значения: integer, text, boolean."}</>,
            ],
            [
              <>{"primary key"}</>,
              <>{"Уникально идентифицирует row."}</>,
            ],
            [
              <>{"foreign key"}</>,
              <>{"Ссылается на primary key другой table."}</>,
            ],
            [
              <>{"constraint"}</>,
              <>{"Защищает правило сохранённых данных."}</>,
            ],
            [
              <>{"index"}</>,
              <>{"Помогает database быстрее находить rows по выбранным columns."}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"tasks table"}
          code={
            "tasks\n" +
            "┌────┬──────────────────────┬──────────┬─────────┬─────────────┐\n" +
            "│ id │ title                │ priority │ is_done │ category_id │\n" +
            "├────┼──────────────────────┼──────────┼─────────┼─────────────┤\n" +
            "│ 1  │ Learn SQLAlchemy     │ 4        │ false   │ 2           │\n" +
            "│ 2  │ Create migration     │ 5        │ true    │ 1           │\n" +
            "└────┴──────────────────────┴──────────┴─────────┴─────────────┘"
          }
        />

        <FillBlank
          prompt={"Какое поле обычно является primary key задачи?"}
          before={"Task."}
          after={""}
          options={[
            "id",
            "title",
            "is_done",
          ]}
          answer={"id"}
          explanation={"Id стабильно и уникально идентифицирует row."}
        />

        <Callout>
          {"ORM attribute и database column связаны, но не являются одним и тем же объектом. Python-код работает с attribute, SQL — с column."}
        </Callout>

        <div className="lesson-practice-steps">
          <h3>Нарисовать table</h3>
          <p>
            {"Сначала записать columns и пример одной row."}
          </p>

          <h3>Выбрать primary key</h3>
          <p>
            {"Определить стабильную identity каждого объекта."}
          </p>

          <h3>Задать nullability</h3>
          <p>
            {"Решить, какие значения обязательны на уровне database."}
          </p>

          <h3>Добавить constraints</h3>
          <p>
            {"Защитить uniqueness и допустимые relations."}
          </p>

          <h3>Только затем написать ORM</h3>
          <p>
            {"Mapped attributes повторяют осознанную database schema."}
          </p>

        </div>

        <CodeBlock
          caption={"schema review"}
          code={
            "tasks.id            INTEGER PRIMARY KEY\n" +
            "tasks.title         TEXT NOT NULL\n" +
            "tasks.priority      INTEGER NOT NULL\n" +
            "tasks.is_done       BOOLEAN NOT NULL\n" +
            "tasks.category_id   INTEGER REFERENCES categories(id)"
          }
        />

      </Section>

      <Section number="04" title={"Engine, connection, Session и transaction"}>
        <Lead>
          {"SQLAlchemy разделяет несколько уровней. Engine знает, как подключаться; connection является конкретным каналом; Session организует работу ORM; transaction определяет атомарную группу изменений."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Engine:</strong>
              {" Создаётся один раз и хранит database URL и pool configuration."}
            </li>
            <li>
              <strong>Connection:</strong>
              {" Берётся engine, когда нужно фактически выполнить SQL."}
            </li>
            <li>
              <strong>Session:</strong>
              {" Отслеживает ORM-объекты и выполняет statements через connection."}
            </li>
            <li>
              <strong>Transaction:</strong>
              {" Объединяет изменения до commit или rollback."}
            </li>
            <li>
              <strong>Close:</strong>
              {" Освобождает ресурсы после request."}
            </li>
          </ol>
          <p>
            {"В endpoint обычно передаётся Session, а engine и connection остаются внутренней инфраструктурой database layer."}
          </p>
        </div>

        <CodeBlock
          caption={"жизненный цикл записи"}
          code={
            "session = SessionLocal()\n" +
            "try:\n" +
            "    task = Task(title=\"SQLAlchemy\", priority=4)\n" +
            "    session.add(task)\n" +
            "    session.commit()\n" +
            "    session.refresh(task)\n" +
            "finally:\n" +
            "    session.close()"
          }
        />

        <StepThrough
          code={
            "session.add(task)\n" +
            "session.commit()\n" +
            "session.refresh(task)\n" +
            "session.close()"
          }
          steps={[
            {
              line: 0,
              note: "Task добавляется в unit of work Session.",
              vars: {
                "state": "pending",
              },
            },
            {
              line: 1,
              note: "SQL INSERT отправляется и transaction подтверждается.",
              vars: {
                "transaction": "committed",
              },
            },
            {
              line: 2,
              note: "Объект получает значения database, например id.",
              vars: {
                "task.id": "generated",
              },
            },
            {
              line: 3,
              note: "Session освобождает ресурсы.",
              vars: {
                "session": "closed",
              },
            },
          ]}
        />

        <Callout tone={"info"}>
          {"Commit подтверждает transaction, но не закрывает Session. Rollback отменяет текущую transaction state, но Session затем можно использовать снова."}
        </Callout>

        <CompareSolutions
          question={"Где должна жить transaction boundary одного request?"}
          left={{
            title: "Разрозненные commits",
            code: "helper_a() → commit\nhelper_b() → commit",
            note: "Часть operation может сохраниться, даже если следующий шаг завершился ошибкой.",
          }}
          right={{
            title: "Одна осознанная transaction",
            code: "perform changes\n→ commit once\n→ rollback on error",
            note: "Operation подтверждается целиком или откатывается.",
          }}
          preferred={"right"}
          explanation={"Transaction boundary выбирается по смыслу operation, а не по количеству строк кода."}
        />

        <BranchExplorer
          code={
            "Session begins transaction\n" +
            "add ORM object\n" +
            "flush SQL\n" +
            "commit\n" +
            "refresh object\n" +
            "close Session\n" +
            "\n" +
            "IntegrityError\n" +
            "rollback\n" +
            "close Session"
          }
          scenarios={[
            {
              label: "успешная запись",
              activeLine: 4,
              output: "committed object with id",
            },
            {
              label: "ошибка constraint",
              activeLine: 7,
              output: "rollback before reuse",
            },
            {
              label: "request завершён",
              activeLine: 5,
              output: "Session closed",
            },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>{"add"}</>,
              <>{"Поместить object в unit of work."}</>,
            ],
            [
              <>{"flush"}</>,
              <>{"Отправить SQL внутри текущей transaction без финального подтверждения."}</>,
            ],
            [
              <>{"commit"}</>,
              <>{"Подтвердить transaction."}</>,
            ],
            [
              <>{"refresh"}</>,
              <>{"Повторно получить database-generated values."}</>,
            ],
            [
              <>{"rollback"}</>,
              <>{"Отменить failed или незавершённую transaction."}</>,
            ],
            [
              <>{"close"}</>,
              <>{"Освободить Session resources."}</>,
            ],
          ]}
        />

      </Section>

      <Section number="05" title={"ORM-модель, Pydantic-schema и response — не одно и то же"}>
        <Lead>
          {"В Database API одновременно существуют несколько представлений задачи. Они похожи по полям, но принадлежат разным границам и не должны сливаться в один универсальный класс."}
        </Lead>

        <TypeCards>
          <TypeCard badge={"ORM"} title={"Task model"} code={"class Task(Base)"}>
            {"Описывает table, columns, keys и relationships."}
          </TypeCard>
          <TypeCard badge={"input"} badgeTone={"float"} title={"TaskCreate schema"} code={"title + priority"}>
            {"Проверяет JSON body, который прислал client."}
          </TypeCard>
          <TypeCard badge={"output"} badgeTone={"str"} title={"TaskRead schema"} code={"id + title + is_done"}>
            {"Определяет безопасную форму response."}
          </TypeCard>
        </TypeCards>

        <CodeBlock
          caption={"три формы"}
          code={
            "class Task(Base):\n" +
            "    __tablename__ = \"tasks\"\n" +
            "    id: Mapped[int] = mapped_column(primary_key=True)\n" +
            "    title: Mapped[str]\n" +
            "\n" +
            "class TaskCreate(BaseModel):\n" +
            "    title: str\n" +
            "    priority: int\n" +
            "\n" +
            "class TaskRead(BaseModel):\n" +
            "    id: int\n" +
            "    title: str\n" +
            "    priority: int\n" +
            "    is_done: bool\n" +
            "\n" +
            "    model_config = ConfigDict(from_attributes=True)"
          }
        />

        <CompareSolutions
          question={"Почему не возвращать ORM-object без response schema?"}
          left={{
            title: "Случайная сериализация",
            code: "return db_task",
            note: "Форма зависит от attributes и может раскрыть внутренние поля.",
          }}
          right={{
            title: "Явный response model",
            code: "@router.get(..., response_model=TaskRead)",
            note: "Client получает стабильный документированный contract.",
          }}
          preferred={"right"}
          explanation={"ORM отвечает за persistence, Pydantic — за API boundary."}
        />

        <Callout>
          {"Похожесть полей не означает одинаковую ответственность. Разделение schemas особенно важно при password, internal flags и relationships."}
        </Callout>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Request schema:</strong>
              {" Отбирает разрешённые client fields и выполняет validation."}
            </li>
            <li>
              <strong>CRUD input:</strong>
              {" Обычная функция получает schema data и Session."}
            </li>
            <li>
              <strong>ORM model:</strong>
              {" Представляет database row внутри transaction."}
            </li>
            <li>
              <strong>Response schema:</strong>
              {" Сериализует только стабильный public contract."}
            </li>
          </ol>
          <p>
            {"Разделение предотвращает случайную передачу internal columns и делает изменение database layer менее опасным для client."}
          </p>
        </div>

        <CodeBlock
          caption={"mapping direction"}
          code={
            "JSON body\n" +
            "→ TaskCreate\n" +
            "→ model_dump()\n" +
            "→ Task ORM\n" +
            "→ INSERT row\n" +
            "→ Task ORM with id\n" +
            "→ TaskRead\n" +
            "→ JSON response"
          }
        />

      </Section>

      <Section number="06" title={"Путь request через get_db и query"}>
        <Lead>
          {"Ключевая сквозная модель этапа связывает предыдущий FastAPI pipeline с database lifecycle. Dependency создаёт Session, endpoint или CRUD-функция строит statement, database возвращает rows, response schema формирует JSON."}
        </Lead>

        <CodeBlock
          caption={"get_db dependency"}
          code={
            "def get_db():\n" +
            "    db = SessionLocal()\n" +
            "\n" +
            "    try:\n" +
            "        yield db\n" +
            "    finally:\n" +
            "        db.close()"
          }
        />

        <CodeBlock
          caption={"endpoint чтения"}
          code={
            "@router.get(\"/\", response_model=list[TaskRead])\n" +
            "def get_tasks(\n" +
            "    db: Annotated[Session, Depends(get_db)],\n" +
            "):\n" +
            "    statement = select(Task).order_by(Task.id)\n" +
            "    return db.scalars(statement).all()"
          }
        />

        <CodeSequence
          title={"Соберите путь GET /tasks"}
          prompt={"Расположите этапы request и database query."}
          pieces={[
            {
              id: "request",
              code: "client отправляет GET /tasks",
            },
            {
              id: "route",
              code: "FastAPI выбирает router endpoint",
            },
            {
              id: "dependency",
              code: "get_db создаёт Session и yield",
            },
            {
              id: "statement",
              code: "код строит select(Task)",
            },
            {
              id: "execute",
              code: "Session выполняет SQL",
            },
            {
              id: "rows",
              code: "database возвращает rows как ORM objects",
            },
            {
              id: "schema",
              code: "TaskRead сериализует attributes",
            },
            {
              id: "close",
              code: "finally закрывает Session",
            },
            {
              id: "response",
              code: "client получает 200 + JSON array",
            },
          ]}
          correctOrder={[
            "request",
            "route",
            "dependency",
            "statement",
            "execute",
            "rows",
            "schema",
            "close",
            "response",
          ]}
          explanation={"Session существует внутри request boundary и освобождается независимо от успешного или ошибочного результата."}
        />

        <Callout tone={"info"}>
          {"Yield dependency особенно важна для ресурсов: код до yield подготавливает resource, код finally гарантирует cleanup."}
        </Callout>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Создать Session:</strong>
              {" Dependency подготавливает database resource."}
            </li>
            <li>
              <strong>Выполнить operation:</strong>
              {" CRUD-функция строит statement и работает с ORM objects."}
            </li>
            <li>
              <strong>Сформировать response:</strong>
              {" Pydantic читает attributes до завершения request."}
            </li>
            <li>
              <strong>Освободить resource:</strong>
              {" Finally закрывает Session даже при HTTPException."}
            </li>
          </ol>
          <p>
            {"Lifecycle resource должен охватывать всю database operation, но не жить глобально между независимыми requests."}
          </p>
        </div>

        <StepThrough
          code={
            "db = next(get_db())\n" +
            "statement = select(Task)\n" +
            "items = db.scalars(statement).all()\n" +
            "return items"
          }
          steps={[
            {
              line: 0,
              note: "Dependency создаёт Session и передаёт её operation.",
              vars: {
                "db": "Session",
              },
            },
            {
              line: 1,
              note: "Statement описывает выборку, но ещё не содержит result rows.",
              vars: {
                "statement": "Select",
              },
            },
            {
              line: 2,
              note: "Session выполняет SQL и scalars извлекает ORM objects.",
              vars: {
                "items": "list[Task]",
              },
            },
            {
              line: 3,
              note: "Response model читает attributes и создаёт JSON.",
              vars: {
                "response": "200 array",
              },
            },
          ]}
        />

        <TerminalDemo
          title={"наблюдение SQL"}
          lines={[
            { out: "SELECT tasks.id, tasks.title, tasks.priority" },
            { out: "FROM tasks" },
            { out: "ORDER BY tasks.id" },
            { out: "LIMIT ? OFFSET ?" },
          ]}
        />

      </Section>

      <Section number="07" title={"Query, constraints и transaction errors"}>
        <Lead>
          {"Database API должен различать пустой результат, неизвестный id, невалидный request и нарушение constraint. Эти ситуации возникают на разных слоях и требуют разных реакций."}
        </Lead>

        <MethodGrid
          rows={[
            [
              <>{"422"}</>,
              <>{"Pydantic или FastAPI отклонили вход до database operation."}</>,
            ],
            [
              <>{"404"}</>,
              <>{"SELECT выполнен, но row с заданным id не найден."}</>,
            ],
            [
              <>{"200 / []"}</>,
              <>{"Collection query успешен, но подходящих rows нет."}</>,
            ],
            [
              <>{"IntegrityError"}</>,
              <>{"INSERT или UPDATE нарушили unique, foreign key или другой constraint."}</>,
            ],
            [
              <>{"rollback"}</>,
              <>{"Обязателен после failed transaction перед дальнейшей работой Session."}</>,
            ],
            [
              <>{"500"}</>,
              <>{"Непредвиденный defect, который нельзя выдавать client как traceback."}</>,
            ],
          ]}
        />

        <BugHunt
          code={
            "try:\n" +
            "    session.add(task)\n" +
            "    session.commit()\n" +
            "except IntegrityError:\n" +
            "    raise HTTPException(409, \"duplicate\")"
          }
          question={"Почему Session может остаться непригодной для следующего query?"}
          options={[
            "После IntegrityError не выполнен rollback",
            "HTTPException нельзя использовать с SQLAlchemy",
            "Commit всегда закрывает Session",
          ]}
          correctIndex={0}
          explanation={"Failed transaction должна быть явно откатана."}
          fix={"try:\n    session.add(task)\n    session.commit()\nexcept IntegrityError as error:\n    session.rollback()\n    raise HTTPException(\n        status_code=409,\n        detail=\"Task already exists\",\n    ) from error"}
        />

        <BranchExplorer
          code={
            "validate request\n" +
            "execute SELECT or INSERT\n" +
            "check empty result\n" +
            "commit transaction\n" +
            "catch IntegrityError\n" +
            "rollback\n" +
            "return response"
          }
          scenarios={[
            {
              label: "invalid body",
              activeLine: 0,
              output: "422",
            },
            {
              label: "unknown id",
              activeLine: 2,
              output: "404",
            },
            {
              label: "successful insert",
              activeLine: 3,
              output: "201",
            },
            {
              label: "duplicate unique",
              activeLine: 5,
              output: "rollback + 409",
            },
          ]}
        />

        <Callout>
          {"Rollback — не способ скрыть ошибку. Он восстанавливает transaction state Session, после чего API возвращает честный error response."}
        </Callout>

        <CodeBlock
          caption={"error responsibility matrix"}
          code={
            "request schema invalid     → 422\n" +
            "row not found              → 404\n" +
            "unique constraint conflict → rollback + 409\n" +
            "foreign key conflict       → rollback + 400/409\n" +
            "empty collection           → 200 + []\n" +
            "unexpected defect          → log + 500"
          }
        />

        <div className="lesson-practice-steps">
          <h3>Определить слой</h3>
          <p>
            {"Ошибка возникла до Session, во время SELECT, на commit или при serialization?"}
          </p>

          <h3>Сохранить причину</h3>
          <p>
            {"Использовать raise ... from error и server log без утечки traceback client."}
          </p>

          <h3>Восстановить Session</h3>
          <p>
            {"После failed commit выполнить rollback."}
          </p>

          <h3>Вернуть честный status</h3>
          <p>
            {"Client должен отличить validation, missing resource и conflict."}
          </p>

        </div>

      </Section>

      <Section number="08" title={"Relations, loading и migrations завершают модель"}>
        <Lead>
          {"Когда задачи связаны с категориями, database начинает отвечать не только за отдельные rows, но и за целостность графа данных. Alembic фиксирует изменение этого графа во времени."}
        </Lead>

        <FlipCards
          cards={[
            {
              front: <strong>{"Foreign key"}</strong>,
              back: <span>{"Database constraint: tasks.category_id должен ссылаться на существующую category."}</span>,
            },
            {
              front: <strong>{"Relationship"}</strong>,
              back: <span>{"ORM navigation: task.category и category.tasks связывают Python objects."}</span>,
            },
            {
              front: <strong>{"Lazy loading"}</strong>,
              back: <span>{"Связанные rows могут загружаться при обращении к attribute, создавая дополнительные queries."}</span>,
            },
            {
              front: <strong>{"N+1"}</strong>,
              back: <span>{"Один query получает parents, затем отдельный query выполняется для каждого набора children."}</span>,
            },
            {
              front: <strong>{"Eager loading"}</strong>,
              back: <span>{"Связи загружаются заранее выбранной стратегией, например selectinload."}</span>,
            },
            {
              front: <strong>{"Migration"}</strong>,
              back: <span>{"Versioned script переводит schema из одного состояния в другое."}</span>,
            },
          ]}
        />

        <CodeBlock
          caption={"migration как переход"}
          code={
            "revision A\n" +
            "  tasks(id, title, priority)\n" +
            "      ↓ upgrade\n" +
            "revision B\n" +
            "  tasks(id, title, priority, category_id)\n" +
            "  categories(id, name)\n" +
            "      ↓ downgrade\n" +
            "revision A"
          }
        />

        <TerminalDemo
          title={"типичный migration workflow"}
          lines={[
            { cmd: "alembic revision --autogenerate -m \"add categories\"" },
            { out: "Generating ..._add_categories.py" },
            { cmd: "alembic upgrade head" },
            { out: "Running upgrade ... -> ..." },
            { cmd: "alembic current" },
            { out: "<revision> (head)" },
          ]}
        />

        <TrueFalse
          statement={
            <>
              {"Если ORM-модель изменилась, существующая database schema обновится автоматически при обычном запуске приложения."}
            </>
          }
          isTrue={false}
          explanation={"Изменение Python-класса и изменение существующей table — разные действия; schema обновляется migration."}
        />

        <p className="lesson-emphasis">
          {"Финальная проверка общей теории:"}
        </p>

        <Callout tone={"info"}>
          {"Итоговый навык — объяснить не только код models.py, но и фактические tables, SQL queries, transaction boundaries и migration history."}
        </Callout>

        <MethodGrid
          rows={[
            [
              <>{"request boundary"}</>,
              <>{"Какие path, query, body и headers пришли от client?"}</>,
            ],
            [
              <>{"dependency boundary"}</>,
              <>{"Создалась ли Session и будет ли она закрыта?"}</>,
            ],
            [
              <>{"query boundary"}</>,
              <>{"Какой statement построен и какие rows ожидаются?"}</>,
            ],
            [
              <>{"transaction boundary"}</>,
              <>{"Где commit, где возможен IntegrityError и rollback?"}</>,
            ],
            [
              <>{"serialization boundary"}</>,
              <>{"Какая response schema читает ORM attributes?"}</>,
            ],
            [
              <>{"migration boundary"}</>,
              <>{"Соответствует ли фактическая schema текущей Alembic revision?"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"диагностический вопрос этапа"}
          code={
            "Где находится проблема?\n" +
            "\n" +
            "client input\n" +
            "FastAPI validation\n" +
            "dependency lifecycle\n" +
            "database connection\n" +
            "SQL statement\n" +
            "transaction state\n" +
            "constraint\n" +
            "relationship loading\n" +
            "response serialization\n" +
            "migration version"
          }
        />

        <div className="lesson-practice-steps">
          <h3>Изменить ORM model</h3>
          <p>
            {"Добавить column или relation осознанно."}
          </p>

          <h3>Создать revision</h3>
          <p>
            {"Проверить autogenerated operations, а не принимать их вслепую."}
          </p>

          <h3>Выполнить upgrade</h3>
          <p>
            {"Применить migration к disposable или test database."}
          </p>

          <h3>Проверить schema и data</h3>
          <p>
            {"Убедиться, что columns, constraints и rows соответствуют ожиданию."}
          </p>

          <h3>Запустить tests</h3>
          <p>
            {"API contract должен сохраниться."}
          </p>

          <h3>Проверить downgrade</h3>
          <p>
            {"Для учебного изменения подтвердить обратный переход."}
          </p>

        </div>

        <CodeBlock
          caption={"финальная сквозная формула"}
          code={
            "HTTP request\n" +
            "→ FastAPI validation\n" +
            "→ Depends(get_db)\n" +
            "→ Session\n" +
            "→ SQLAlchemy statement\n" +
            "→ SQLite transaction\n" +
            "→ ORM object\n" +
            "→ Pydantic response\n" +
            "→ HTTP response\n" +
            "\n" +
            "Schema change\n" +
            "→ Alembic revision\n" +
            "→ upgrade / downgrade"
          }
        />

        <div className="lesson-check-group">
          <QuizCard
            question={"Что хранит SQLite?"}
            options={[
              "tables и rows",
              "FastAPI decorators",
              "Postman requests",
            ]}
            correctIndex={0}
            explanation={"SQLite является database engine."}
          />
          <QuizCard
            question={"Что выдаёт get_db?"}
            options={[
              "Session на время request",
              "готовую table",
              "migration file",
            ]}
            correctIndex={0}
            explanation={"Dependency управляет lifecycle Session."}
          />
          <QuizCard
            question={"Зачем нужен rollback после IntegrityError?"}
            options={[
              "восстановить transaction state Session",
              "удалить database file",
              "создать response model",
            ]}
            correctIndex={0}
            explanation={"Failed transaction должна быть завершена откатом."}
          />
          <QuizCard
            question={"Что меняет Alembic?"}
            options={[
              "database schema по revisions",
              "Pydantic request body",
              "CORS origin",
            ]}
            correctIndex={0}
            explanation={"Migrations переводят структуру между версиями."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Database решает устойчивость и целостность сохранённых данных."}</>,
            <>{"SQLite, SQLAlchemy и Alembic выполняют разные роли."}</>,
            <>{"ORM опирается на tables, columns, keys и constraints."}</>,
            <>{"Engine, Session и transaction нельзя смешивать в одно понятие."}</>,
            <>{"Pydantic schema и ORM model принадлежат разным границам."}</>,
            <>{"Get_db связывает request lifecycle и Session lifecycle."}</>,
            <>{"IntegrityError требует rollback и понятного API response."}</>,
            <>{"Relations и migrations завершают воспроизводимую модель Database API."}</>,
          ]}
        />

        <PracticeCta text={"Возьмите любой endpoint будущего StudyHub и письменно проследите: request → dependency → Session → SQL statement → transaction → ORM object → response schema → JSON."} />
      </Section>

    </RichLesson>
  );
}

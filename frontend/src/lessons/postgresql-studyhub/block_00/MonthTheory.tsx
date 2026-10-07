import { Table2, Workflow } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TrueFalse, TypeCard, TypeCards } from "../../shared";

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

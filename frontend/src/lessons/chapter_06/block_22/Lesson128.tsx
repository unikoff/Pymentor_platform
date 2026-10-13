import { Boxes, ListChecks } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 22 · PostgreSQL и перенос StudyHub";

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
      <TheoryBridge link={"Пустая PostgreSQL database уже воспроизводит schema. Последний шаг — перенести data отдельно от migrations и проверить поведение приложения глазами клиента."} boundary={"Schema migration и data migration — разные операции. Session tokens, password secrets и случайное служебное состояние нельзя бездумно переносить вместе с demo data."} />

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

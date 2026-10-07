import { Database, Route } from "lucide-react";
import { BranchExplorer, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";

export function LearningRoadmap() {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={"ЭТАП 4 · карта обучения"}
        title={"План обучения: этап 4"}
        intro={"За 24 занятия StudyHub Planner API превратится в Database API: сначала приложение получит понятный request pipeline и зависимости, затем SQLite и SQLAlchemy, полноценные запросы, связи и воспроизводимую схему через Alembic."}
        tags={[
          { icon: <Route size={14} />, label: "занятия 69–92" },
          { icon: <Database size={14} />, label: "StudyHub Database API" },
        ]}
      />

      <Section number="01" title={"Откуда начинается этап 4"}>
        <Lead>
          {"Перед началом этапа уже существует Planner API: endpoints, Pydantic-схемы, CRUD в памяти, routers, TestClient, Swagger и Postman. Следующий шаг не переписывает проект с нуля — он заменяет временные границы на устойчивые."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Сохранить знакомый HTTP-контракт:</strong>
              {" Methods, paths, schemas, statuses и tests остаются точкой опоры."}
            </li>
            <li>
              <strong>Увидеть внутренний путь request:</strong>
              {" До базы нужно понять Depends, settings, headers, middleware и CORS."}
            </li>
            <li>
              <strong>Заменить память SQLite:</strong>
              {" Список внутри процесса уступает таблицам, engine и session."}
            </li>
            <li>
              <strong>Развить запросы:</strong>
              {" CRUD переходит к select, where, sort, pagination, count и transactions."}
            </li>
            <li>
              <strong>Зафиксировать схему:</strong>
              {" Relations и Alembic делают структуру данных воспроизводимой."}
            </li>
          </ol>
          <p>
            {"Итогом станет StudyHub Database API, который переживает перезапуск и может объяснимо развивать схему данных."}
          </p>
        </div>

        <CodeBlock
          caption={"эволюция проекта"}
          code={
            "Planner API\n" +
            "  ↓ request pipeline и Depends\n" +
            "FastAPI как цельное приложение\n" +
            "  ↓ SQLite + SQLAlchemy\n" +
            "Database-backed API\n" +
            "  ↓ CRUD queries + transactions\n" +
            "Reliable Database API\n" +
            "  ↓ relations + Alembic\n" +
            "StudyHub Database API"
          }
        />

        <CompareSolutions
          question={"Какая часть должна измениться первой?"}
          left={{
            title: "Переписать весь API",
            code: "new_project = True\nold_routes = delete_all()",
            note: "Резкий старт уничтожает знакомый контекст и смешивает много новых проблем.",
          }}
          right={{
            title: "Сохранить контракт",
            code: "same_routes = True\nstorage = SQLiteStorage()",
            note: "Клиентский договор остаётся знакомым, а способ хранения меняется постепенно.",
          }}
          preferred={"right"}
          explanation={"Плавный маршрут сохраняет endpoints и Pydantic-схемы, меняя внутренний механизм небольшими шагами."}
        />

        <Callout tone={"info"}>
          {"Этап 4 не начинается с SQL-запроса внутри случайного endpoint. Сначала приложение получает ясные зависимости и конфигурацию, чтобы база подключилась в подготовленную структуру."}
        </Callout>

        <Callout>
          {"Сквозной проект сохраняет знакомый домен задач, чтобы внимание уходило на database-механизмы, а не на новую предметную область."}
        </Callout>

        <TypeCards>
          <TypeCard badge={"сохранить"} title={"HTTP-контракт"} code={"POST /tasks → 201"}>
            {"Methods, paths, Pydantic schemas и statuses остаются знакомыми."}
          </TypeCard>
          <TypeCard badge={"заменить"} badgeTone={"float"} title={"Временное storage"} code={"list → SQLite"}>
            {"Python list постепенно заменяется Session и database rows."}
          </TypeCard>
          <TypeCard badge={"добавить"} badgeTone={"str"} title={"Schema history"} code={"revision → upgrade"}>
            {"Alembic фиксирует изменения tables и columns во времени."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>Что уже умеет ученик</h3>
          <p>
            {"Запустить FastAPI, прочитать request, проверить response и найти endpoint."}
          </p>

          <h3>Что станет новым</h3>
          <p>
            {"Проследить connection, Session, statement, transaction и migration."}
          </p>

          <h3>Что останется знакомым</h3>
          <p>
            {"Функции, type hints, exceptions, pytest и декомпозиция продолжают работать."}
          </p>

        </div>

      </Section>

      <Section number="02" title={"Четыре блока одного проекта"}>
        <Lead>
          {"Блоки 13–16 не являются независимыми мини-курсами. Каждый следующий использует результат предыдущего и отвечает на уже заметное ограничение StudyHub."}
        </Lead>

        <MethodGrid
          rows={[
            [
              <>{"Блок 13 · FastAPI как цельное приложение"}</>,
              <>{"Request pipeline, Depends, Annotated, Settings, headers, cookies, middleware и CORS."}</>,
            ],
            [
              <>{"Блок 14 · SQLite и основы SQLAlchemy"}</>,
              <>{"Причина появления базы, engine, URL, Declarative Base, ORM-модель, таблицы, Session и get_db."}</>,
            ],
            [
              <>{"Блок 15 · CRUD и запросы SQLAlchemy"}</>,
              <>{"SELECT, изменение данных, WHERE, sorting, pagination, COUNT, EXISTS, uniqueness и transactions."}</>,
            ],
            [
              <>{"Блок 16 · Связи, Alembic и Database API"}</>,
              <>{"Foreign key, one-to-many, relationship, loading, N+1, migrations и итоговая защита."}</>,
            ],
          ]}
        />

        <CodeSequence
          title={"Соберите маршрут этапа"}
          prompt={"Расположите крупные результаты в порядке появления."}
          pieces={[
            {
              id: "pipeline",
              code: "увидеть полный request pipeline",
            },
            {
              id: "deps",
              code: "вынести повторяемую подготовку в dependencies",
            },
            {
              id: "engine",
              code: "создать engine и ORM model",
            },
            {
              id: "session",
              code: "провести первую session transaction",
            },
            {
              id: "queries",
              code: "реализовать CRUD и динамические queries",
            },
            {
              id: "relations",
              code: "добавить категории и one-to-many",
            },
            {
              id: "migrations",
              code: "зафиксировать schema через Alembic",
            },
            {
              id: "release",
              code: "защитить StudyHub Database API",
            },
          ]}
          correctOrder={[
            "pipeline",
            "deps",
            "engine",
            "session",
            "queries",
            "relations",
            "migrations",
            "release",
          ]}
          explanation={"Каждый слой появляется после того, как понятна проблема, которую он решает."}
        />

        <Callout>
          {"Нельзя перескочить из in-memory списка сразу в сложный repository/service/unit-of-work набор. На этом этапе важнее увидеть engine, session, transaction и query без лишней архитектурной маскировки."}
        </Callout>

        <div className="lesson-practice-steps">
          <h3>После блока 13</h3>
          <p>
            {"Ученик показывает порядок middleware, dependencies и endpoint на одном request."}
          </p>

          <h3>После блока 14</h3>
          <p>
            {"Ученик открывает SQLite viewer и связывает ORM attribute с реальной column."}
          </p>

          <h3>После блока 15</h3>
          <p>
            {"Ученик читает statement и объясняет transaction success/error path."}
          </p>

          <h3>После блока 16</h3>
          <p>
            {"Ученик поднимает пустую database только через migrations и запускает tests."}
          </p>

        </div>

        <CodeBlock
          caption={"контрольные результаты блоков"}
          code={
            "после блока 13 → request pipeline объясняется\n" +
            "после блока 14 → первая row сохраняется в SQLite\n" +
            "после блока 15 → CRUD работает через SQLAlchemy queries\n" +
            "после блока 16 → schema воспроизводится migrations"
          }
        />

        <TypeCards>
          <TypeCard badge={"13"} title={"Подготовить приложение"}>
            {"Dependencies, Settings и middleware создают ясные инфраструктурные границы."}
          </TypeCard>
          <TypeCard badge={"14–15"} badgeTone={"float"} title={"Подключить и использовать базу"}>
            {"Engine, models, Session и statements заменяют временный список."}
          </TypeCard>
          <TypeCard badge={"16"} badgeTone={"str"} title={"Связать и выпускать"}>
            {"Relations и Alembic завершают Database API."}
          </TypeCard>
        </TypeCards>

      </Section>

      <Section number="03" title={"Блок 13: подготовка FastAPI к базе"}>
        <Lead>
          {"Перед SQLAlchemy приложение должно ясно отвечать на вопросы: как request доходит до endpoint, где живёт конфигурация, как передаётся зависимость и где размещается общее HTTP-поведение."}
        </Lead>

        <MethodGrid
          rows={[
            [
              <>{"69 · Request pipeline"}</>,
              <>{"Uvicorn → routing → parsing → validation → dependencies → endpoint → response."}</>,
            ],
            [
              <>{"70 · Первый Depends"}</>,
              <>{"Повторяемая подготовка становится отдельной функцией с понятным контрактом."}</>,
            ],
            [
              <>{"71 · Annotated и цепочки"}</>,
              <>{"Aliases и короткие sub-dependencies делают сигнатуру читаемой."}</>,
            ],
            [
              <>{"72 · Settings"}</>,
              <>{"Environment и .env отделяют конфигурацию от исходного кода."}</>,
            ],
            [
              <>{"73 · Headers, cookies, Response"}</>,
              <>{"HTTP-контракт расширяется за пределы path, query и body."}</>,
            ],
            [
              <>{"74 · Middleware и CORS"}</>,
              <>{"Общее поведение охватывает каждый request, а frontend получает точное разрешение origin."}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"путь, который станет основой get_db"}
          code={
            "client\n" +
            "→ Uvicorn\n" +
            "→ middleware before\n" +
            "→ route matching\n" +
            "→ input validation\n" +
            "→ dependencies\n" +
            "→ endpoint\n" +
            "→ response serialization\n" +
            "→ middleware after\n" +
            "→ client"
          }
        />

        <BranchExplorer
          code={
            "request пришёл\n" +
            "route найден\n" +
            "input valid\n" +
            "dependencies solved\n" +
            "endpoint called\n" +
            "response returned"
          }
          scenarios={[
            {
              label: "неверный path type",
              activeLine: 2,
              output: "422 before endpoint",
            },
            {
              label: "dependency raises 404",
              activeLine: 3,
              output: "404 before endpoint body",
            },
            {
              label: "обычный request",
              activeLine: 5,
              output: "200/201 response",
            },
          ]}
        />

        <Callout tone={"info"}>
          {"Главная подготовка к блоку 14 — понять, что get_db будет не магической командой, а dependency с управляемым жизненным циклом ресурса."}
        </Callout>

        <div className="lesson-practice-steps">
          <h3>Сначала наблюдать</h3>
          <p>
            {"Отправить request и найти его в middleware, router и endpoint."}
          </p>

          <h3>Затем вынести</h3>
          <p>
            {"Повторяемое получение configuration или resource превратить в dependency."}
          </p>

          <h3>После этого связать</h3>
          <p>
            {"Создать короткую dependency chain и проверить порядок выполнения."}
          </p>

          <h3>Только затем расширить</h3>
          <p>
            {"Добавить headers, cookies, response metadata и CORS."}
          </p>

        </div>

        <TerminalDemo
          title={"ручная проверка блока 13"}
          lines={[
            { cmd: "python -m uvicorn app.main:app --reload" },
            { out: "INFO: Application startup complete" },
            { cmd: "curl -i http://127.0.0.1:8000/health" },
            { out: "HTTP/1.1 200 OK" },
            { out: "x-request-id: ..." },
          ]}
        />

      </Section>

      <Section number="04" title={"Блок 14: SQLite и первые ORM-объекты"}>
        <Lead>
          {"После блока 13 временное состояние процесса заменяется файлом SQLite. SQLAlchemy вводится от подключения и модели к session, а не с готового многослойного шаблона."}
        </Lead>

        <TypeCards>
          <TypeCard badge={"SQLite"} title={"Файл базы"} code={"studyhub.db"}>
            {"Хранит таблицы и строки после завершения процесса."}
          </TypeCard>
          <TypeCard badge={"engine"} badgeTone={"float"} title={"Точка подключения"} code={"create_engine(...)"}>
            {"Знает database URL и создаёт соединения по необходимости."}
          </TypeCard>
          <TypeCard badge={"ORM"} badgeTone={"str"} title={"Модель таблицы"} code={"class Task(Base): ..."}>
            {"Связывает Python-класс, columns, keys и SQL-таблицу."}
          </TypeCard>
        </TypeCards>

        <MethodGrid
          rows={[
            [
              <>{"75 · Зачем база"}</>,
              <>{"Потеря данных, несколько процессов, уникальность и запросы формулируют требования."}</>,
            ],
            [
              <>{"76 · Engine и URL"}</>,
              <>{"sqlite:///./studyhub.db и connect_args становятся понятной конфигурацией."}</>,
            ],
            [
              <>{"77 · Declarative Base"}</>,
              <>{"Task получает __tablename__, mapped_column, primary key и types."}</>,
            ],
            [
              <>{"78 · Создание таблиц"}</>,
              <>{"Metadata создаёт schema, а SQLite viewer подтверждает фактический результат."}</>,
            ],
            [
              <>{"79 · Session lifecycle"}</>,
              <>{"add → commit → refresh; при ошибке rollback; в конце close."}</>,
            ],
            [
              <>{"80 · get_db"}</>,
              <>{"FastAPI dependency выдаёт Session endpoint и гарантирует освобождение ресурса."}</>,
            ],
          ]}
        />

        <CompareSolutions
          question={"Что честнее описывает данные после перезапуска?"}
          left={{
            title: "In-memory list",
            code: "tasks = []\n# process stops → data gone",
            note: "Подходит для учебного HTTP-контракта, но не обеспечивает устойчивое хранение.",
          }}
          right={{
            title: "SQLite table",
            code: "tasks table\n# process stops → rows remain",
            note: "Файл базы сохраняет состояние и поддерживает запросы.",
          }}
          preferred={"right"}
          explanation={"База появляется как решение наблюдаемой проблемы, а не как обязательный атрибут любого маленького API."}
        />

        <Callout>
          {"SQLite используется как самый спокойный первый шаг: один локальный файл позволяет изучить SQLAlchemy без отдельного сервера PostgreSQL."}
        </Callout>

        <TerminalDemo
          title={"проверка первого database milestone"}
          lines={[
            { cmd: "python -m app.create_tables" },
            { out: "tables created" },
            { cmd: "sqlite3 studyhub.db \".schema tasks\"" },
            { out: "CREATE TABLE tasks (...)" },
            { cmd: "python -m pytest -q tests/test_database.py" },
            { out: "4 passed" },
          ]}
        />

        <p className="lesson-emphasis">
          {"Критерий готовности блока 14: ученик может показать одну row одновременно как JSON response, ORM object и запись SQLite."}
        </p>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Создать database URL:</strong>
              {" Settings предоставляет строку подключения без жёсткой привязки к коду."}
            </li>
            <li>
              <strong>Создать engine:</strong>
              {" Engine знает dialect, driver и место database file."}
            </li>
            <li>
              <strong>Объявить Base и models:</strong>
              {" Metadata собирает описание tables и columns."}
            </li>
            <li>
              <strong>Создать schema:</strong>
              {" Tables появляются фактически и проверяются viewer или SQL query."}
            </li>
            <li>
              <strong>Открыть Session:</strong>
              {" Первая transaction создаёт row и возвращает generated id."}
            </li>
            <li>
              <strong>Подключить get_db:</strong>
              {" FastAPI получает Session на время одного request."}
            </li>
          </ol>
          <p>
            {"Этот маршрут выполняется последовательно; попытка начать с get_db без engine и SessionLocal оставляет dependency без ресурса."}
          </p>
        </div>

        <CodeBlock
          caption={"первая вертикальная цепочка"}
          code={
            "Settings.database_url\n" +
            "→ create_engine\n" +
            "→ SessionLocal\n" +
            "→ Base.metadata\n" +
            "→ Task ORM model\n" +
            "→ get_db\n" +
            "→ POST /tasks\n" +
            "→ INSERT + COMMIT\n" +
            "→ TaskRead response"
          }
        />

      </Section>

      <Section number="05" title={"Блок 15: CRUD, фильтры и транзакции"}>
        <Lead>
          {"Когда Session уже понятна, familiar CRUD переводится с операций списка на SQL expressions. Сначала простые SELECT и изменения, затем composable filters и только после этого ограничения и ошибки транзакции."}
        </Lead>

        <MethodGrid
          rows={[
            [
              <>{"81 · SELECT"}</>,
              <>{"Список через select(Task) и item через session.get или WHERE."}</>,
            ],
            [
              <>{"82 · Create, update, delete"}</>,
              <>{"Изменить ORM-объект, commit и refresh; удалить и подтвердить transaction."}</>,
            ],
            [
              <>{"83 · WHERE"}</>,
              <>{"Условия добавляются к statement только для переданных query-параметров."}</>,
            ],
            [
              <>{"84 · Sorting и pagination"}</>,
              <>{"order_by, limit и offset формируют предсказуемую страницу."}</>,
            ],
            [
              <>{"85 · COUNT, EXISTS, uniqueness"}</>,
              <>{"База отвечает на агрегатные вопросы и защищает уникальные значения."}</>,
            ],
            [
              <>{"86 · Transaction и IntegrityError"}</>,
              <>{"Ошибка commit требует rollback перед следующим использованием Session."}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"эволюция запроса"}
          code={
            "statement = select(Task)\n" +
            "\n" +
            "if is_done is not None:\n" +
            "    statement = statement.where(Task.is_done == is_done)\n" +
            "\n" +
            "if min_priority is not None:\n" +
            "    statement = statement.where(Task.priority >= min_priority)\n" +
            "\n" +
            "statement = statement.order_by(Task.id).offset(offset).limit(limit)\n" +
            "\n" +
            "items = session.scalars(statement).all()"
          }
        />

        <MatchPairs
          prompt={"Соедините SQLAlchemy-операцию и смысл."}
          leftTitle={"Операция"}
          rightTitle={"Роль"}
          pairs={[
            {
              left: "select(Task)",
              right: "построить запрос к задачам",
            },
            {
              left: ".where(...)",
              right: "добавить условие",
            },
            {
              left: ".order_by(...)",
              right: "задать порядок",
            },
            {
              left: ".limit(...)",
              right: "ограничить размер страницы",
            },
            {
              left: "session.commit()",
              right: "подтвердить transaction",
            },
            {
              left: "session.rollback()",
              right: "вернуть Session в рабочее состояние после ошибки",
            },
          ]}
          explanation={"Statement описывает SQL, Session выполняет его и управляет transaction."}
        />

        <Callout tone={"info"}>
          {"Главный навык блока — не запомнить цепочку методов, а уметь прочитать statement слева направо и объяснить, какой SQL-смысл добавляет каждый шаг."}
        </Callout>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>List query:</strong>
              {" Сначала получить предсказуемый список с ORDER BY."}
            </li>
            <li>
              <strong>Item query:</strong>
              {" Затем вернуть row по id или 404."}
            </li>
            <li>
              <strong>Write operations:</strong>
              {" После чтения добавить create, update и delete."}
            </li>
            <li>
              <strong>Dynamic filters:</strong>
              {" Только затем собирать statement по optional query parameters."}
            </li>
            <li>
              <strong>Aggregates:</strong>
              {" COUNT и EXISTS отвечают на отдельные database-вопросы."}
            </li>
            <li>
              <strong>Integrity path:</strong>
              {" Завершить блок конфликтом constraint и обязательным rollback."}
            </li>
          </ol>
          <p>
            {"Порядок сохраняет низкий порог входа: каждый новый query использует уже знакомую Session и statement."}
          </p>
        </div>

        <div className="lesson-practice-steps">
          <h3>Прочитать statement</h3>
          <p>
            {"Назвать SELECT target, WHERE conditions, ORDER BY и page boundaries."}
          </p>

          <h3>Предсказать rows</h3>
          <p>
            {"До запуска определить, какие задачи должны пройти filters."}
          </p>

          <h3>Посмотреть SQL</h3>
          <p>
            {"Включить echo или прочитать generated query в log."}
          </p>

          <h3>Изменить одно условие</h3>
          <p>
            {"Добавить только один optional filter или sort field."}
          </p>

          <h3>Проверить transaction</h3>
          <p>
            {"Для write operation подтвердить commit и generated values."}
          </p>

          <h3>Смоделировать ошибку</h3>
          <p>
            {"Нарушить unique constraint и убедиться, что выполнен rollback."}
          </p>

        </div>

        <TerminalDemo
          title={"контроль query-поведения"}
          lines={[
            { cmd: "pytest -q tests/test_tasks.py -k pagination" },
            { out: "3 passed" },
            { cmd: "pytest -q tests/test_tasks.py -k integrity" },
            { out: "2 passed" },
          ]}
        />

      </Section>

      <Section number="06" title={"Блок 16: связи и воспроизводимая схема"}>
        <Lead>
          {"Одна таблица задач недостаточна для StudyHub. Категория и задачи создают первую one-to-many связь, а Alembic фиксирует изменения schema как историю, которую можно повторить на другой машине."}
        </Lead>

        <TypeCards>
          <TypeCard badge={"FK"} title={"Foreign key"} code={"ForeignKey(\"categories.id\")"}>
            {"Column tasks.category_id хранит ссылку на categories.id."}
          </TypeCard>
          <TypeCard badge={"relationship"} badgeTone={"float"} title={"Связанные объекты"} code={"relationship(...)"}>
            {"Python-атрибуты category.tasks и task.category упрощают навигацию."}
          </TypeCard>
          <TypeCard badge={"Alembic"} badgeTone={"str"} title={"История schema"} code={"alembic upgrade head"}>
            {"Revision описывает upgrade и downgrade между версиями структуры."}
          </TypeCard>
        </TypeCards>

        <MethodGrid
          rows={[
            [
              <>{"87 · Foreign key"}</>,
              <>{"Category — parent, Task — child; база защищает ссылочную целостность."}</>,
            ],
            [
              <>{"88 · Relationship"}</>,
              <>{"ORM связывает объекты поверх foreign key."}</>,
            ],
            [
              <>{"89 · Loading и N+1"}</>,
              <>{"Повторяющиеся запросы замечаются по log и исправляются осознанной загрузкой."}</>,
            ],
            [
              <>{"90 · Первая migration"}</>,
              <>{"Alembic init, revision, upgrade и таблица alembic_version."}</>,
            ],
            [
              <>{"91 · Изменение schema"}</>,
              <>{"Новое поле проходит revision, upgrade, проверку и безопасный downgrade."}</>,
            ],
            [
              <>{"92 · Итоговый проект"}</>,
              <>{"Database API проходит tests, README, migrations, Postman и защиту."}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"one-to-many"}
          code={
            "Category 1 ─────────── * Task\n" +
            "\n" +
            "categories.id\n" +
            "      ↑\n" +
            "tasks.category_id"
          }
        />

        <RecallCard
          question={"Почему одного relationship недостаточно для реальной связи таблиц?"}
          hint={"Подумайте, какой механизм понимает сама SQLite без Python."}
          answer={
            <p>
              {"Relationship помогает ORM работать с объектами, но ссылочная целостность базы опирается на foreign key column."}
            </p>
          }
        />

        <Callout>
          {"Alembic не создаёт backup пользовательских данных и не заменяет внимательную migration strategy. Он хранит воспроизводимую историю изменений schema."}
        </Callout>

        <div className="lesson-practice-steps">
          <h3>Сначала foreign key</h3>
          <p>
            {"Создать реальную database-ссылку category_id → categories.id."}
          </p>

          <h3>Затем relationship</h3>
          <p>
            {"Добавить удобную навигацию между ORM-объектами."}
          </p>

          <h3>Потом наблюдать loading</h3>
          <p>
            {"Посчитать SQL queries при чтении categories и tasks."}
          </p>

          <h3>После измерения оптимизировать</h3>
          <p>
            {"Выбрать selectinload или другой подход для конкретного endpoint."}
          </p>

          <h3>Зафиксировать изменение</h3>
          <p>
            {"Создать migration revision и проверить upgrade."}
          </p>

          <h3>Проверить обратный путь</h3>
          <p>
            {"Выполнить downgrade на учебной базе и вернуть head."}
          </p>

        </div>

        <CodeBlock
          caption={"безопасный migration rehearsal"}
          code={
            "backup or disposable database\n" +
            "→ alembic current\n" +
            "→ alembic upgrade head\n" +
            "→ inspect schema\n" +
            "→ run tests\n" +
            "→ alembic downgrade -1\n" +
            "→ inspect schema\n" +
            "→ alembic upgrade head"
          }
        />

      </Section>

      <Section number="07" title={"Как будет выглядеть итоговый StudyHub"}>
        <Lead>
          {"Финальный проект этапа остаётся небольшим и объяснимым. Он не маскирует базовые операции за десятками абстракций, но уже имеет устойчивые данные, relations, migrations и проверяемый API-контракт."}
        </Lead>

        <CodeBlock
          caption={"финальная структура проекта"}
          code={
            "studyhub-database-api/\n" +
            "├── app/\n" +
            "│   ├── main.py\n" +
            "│   ├── config.py\n" +
            "│   ├── database.py\n" +
            "│   ├── models/\n" +
            "│   │   ├── task.py\n" +
            "│   │   └── category.py\n" +
            "│   ├── schemas/\n" +
            "│   │   ├── task.py\n" +
            "│   │   └── category.py\n" +
            "│   ├── routers/\n" +
            "│   │   ├── tasks.py\n" +
            "│   │   └── categories.py\n" +
            "│   └── crud/\n" +
            "│       ├── tasks.py\n" +
            "│       └── categories.py\n" +
            "├── alembic/\n" +
            "├── tests/\n" +
            "├── .env.example\n" +
            "├── alembic.ini\n" +
            "└── README.md"
          }
        />

        <TypeCards>
          <TypeCard badge={"API"} title={"Стабильный контракт"} code={"GET /tasks"}>
            {"Endpoints, schemas, statuses, headers и CORS остаются понятными клиенту."}
          </TypeCard>
          <TypeCard badge={"DB"} badgeTone={"float"} title={"Устойчивое состояние"} code={"studyhub.db"}>
            {"SQLite tables, constraints и transactions переживают restart."}
          </TypeCard>
          <TypeCard badge={"quality"} badgeTone={"str"} title={"Воспроизводимый проект"} code={"alembic upgrade head"}>
            {"Alembic, tests, README и env example позволяют повторить запуск."}
          </TypeCard>
        </TypeCards>

        <BranchExplorer
          code={
            "request\n" +
            "→ middleware\n" +
            "→ dependency get_db\n" +
            "→ router\n" +
            "→ CRUD statement\n" +
            "→ Session transaction\n" +
            "→ ORM result\n" +
            "→ response schema"
          }
          scenarios={[
            {
              label: "GET list",
              activeLine: 4,
              output: "SELECT + 200",
            },
            {
              label: "POST valid",
              activeLine: 5,
              output: "INSERT + COMMIT + 201",
            },
            {
              label: "duplicate value",
              activeLine: 5,
              output: "ROLLBACK + 409/400",
            },
            {
              label: "unknown id",
              activeLine: 4,
              output: "SELECT none + 404",
            },
          ]}
        />

        <Callout tone={"info"}>
          {"Итоговая архитектура является учебной: она показывает границы и движение данных, не превращая проект в имитацию enterprise-системы."}
        </Callout>

        <CodeBlock
          caption={"демонстрационный сценарий итогового проекта"}
          code={
            "1. alembic upgrade head\n" +
            "2. POST /categories → 201\n" +
            "3. POST /tasks with category_id → 201\n" +
            "4. GET /tasks?limit=2&offset=0 → 200\n" +
            "5. PATCH /tasks/{task_id} → 200\n" +
            "6. POST duplicate unique value → conflict + rollback\n" +
            "7. GET /categories/{category_id}/tasks → 200\n" +
            "8. restart API and repeat GET → rows remain"
          }
        />

        <RecallCard
          question={"Почему перезапуск API входит в обязательную демонстрацию?"}
          hint={"Сравните с in-memory storage третьего этапа."}
          answer={
            <p>
              {"Он доказывает, что response строится из устойчивых database rows, а не из случайного Python-состояния текущего процесса."}
            </p>
          }
        />

        <div className="lesson-practice-steps">
          <h3>Запуск с нуля</h3>
          <p>
            {"Создать .env из example, установить dependencies и выполнить migrations."}
          </p>

          <h3>Демонстрация данных</h3>
          <p>
            {"Создать category и несколько tasks, затем перезапустить server."}
          </p>

          <h3>Демонстрация queries</h3>
          <p>
            {"Показать filters, pagination, count и unknown id."}
          </p>

          <h3>Демонстрация integrity</h3>
          <p>
            {"Создать конфликт и показать rollback без поломки следующего request."}
          </p>

          <h3>Демонстрация relations</h3>
          <p>
            {"Получить category с tasks без неконтролируемого N+1."}
          </p>

          <h3>Демонстрация истории</h3>
          <p>
            {"Показать alembic history и текущую revision."}
          </p>

        </div>

        <TerminalDemo
          title={"финальная защита"}
          lines={[
            { cmd: "alembic upgrade head" },
            { out: "database schema is current" },
            { cmd: "python -m pytest -q" },
            { out: "all tests passed" },
            { cmd: "python -m uvicorn app.main:app" },
            { out: "StudyHub Database API is ready" },
          ]}
        />

      </Section>

      <Section number="08" title={"Рабочий ритм и критерии готовности"}>
        <Lead>
          {"Новый материал закрепляется не чтением, а коротким циклом: сформулировать ожидание, запустить, увидеть SQL или response, изменить одну деталь, повторить проверку и объяснить результат."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Перед кодом</h3>
          <p>
            {"Назовите проблему текущей версии и результат нового механизма."}
          </p>

          <h3>Перед запуском</h3>
          <p>
            {"Предскажите request, SQL statement, transaction state или response status."}
          </p>

          <h3>После запуска</h3>
          <p>
            {"Проверьте server log, SQL echo, SQLite viewer, Swagger или test output."}
          </p>

          <h3>После изменения</h3>
          <p>
            {"Меняйте одно условие, column или query parameter за шаг."}
          </p>

          <h3>При ошибке</h3>
          <p>
            {"Определите слой: validation, dependency, connection, statement, constraint, commit или serialization."}
          </p>

          <h3>Перед коммитом</h3>
          <p>
            {"Запустите tests и убедитесь, что migration и README соответствуют коду."}
          </p>

        </div>

        <CodeBlock
          caption={"обязательная контрольная матрица"}
          code={
            "обычный request\n" +
            "пустая collection\n" +
            "unknown id\n" +
            "invalid input\n" +
            "duplicate unique value\n" +
            "failed commit + rollback\n" +
            "relation without parent\n" +
            "pagination boundary\n" +
            "migration upgrade\n" +
            "migration downgrade"
          }
        />

        <TrueFalse
          statement={
            <>
              {"Если endpoint вернул 200 один раз, database layer уже считается проверенным."}
            </>
          }
          isTrue={false}
          explanation={"Нужны границы, ошибки constraints, rollback, restart, migrations и повторный request."}
        />

        <p className="lesson-emphasis">
          {"Финальная проверка карты обучения:"}
        </p>

        <Callout tone={"info"}>
          {"Готовность означает способность объяснить путь данных от HTTP request до row в SQLite и обратно, а не только воспроизвести готовый код."}
        </Callout>

        <MethodGrid
          rows={[
            [
              <>{"понять"}</>,
              <>{"Объяснить назначение нового механизма без кода."}</>,
            ],
            [
              <>{"увидеть"}</>,
              <>{"Найти его место в request и database pipeline."}</>,
            ],
            [
              <>{"запустить"}</>,
              <>{"Получить наблюдаемый SQL, row, status или migration result."}</>,
            ],
            [
              <>{"защитить"}</>,
              <>{"Проверить normal path, boundary и ожидаемую ошибку."}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"минимальная формула прогресса"}
          code={
            "прочитал ≠ освоил\n" +
            "запустил ≠ понял\n" +
            "изменил + проверил + объяснил = рабочий навык"
          }
        />

        <Callout tone={"info"}>
          {"Этап считается пройденным, когда ученик может восстановить пустую database, применить migrations, выполнить CRUD и объяснить transaction error без копирования готовой последовательности."}
        </Callout>

        <CodeBlock
          caption={"ритм одного занятия"}
          code={
            "понять проблему\n" +
            "→ увидеть минимальный механизм\n" +
            "→ предсказать SQL или response\n" +
            "→ запустить\n" +
            "→ изменить одну деталь\n" +
            "→ проверить normal и error path\n" +
            "→ объяснить transaction state\n" +
            "→ зафиксировать commit"
          }
        />

        <TypeCards>
          <TypeCard badge={"до"} title={"Формулировка ожидания"}>
            {"Какой SQL, status или schema change должен появиться?"}
          </TypeCard>
          <TypeCard badge={"во время"} badgeTone={"float"} title={"Наблюдение границы"}>
            {"Что происходит с Session, transaction и ORM object?"}
          </TypeCard>
          <TypeCard badge={"после"} badgeTone={"str"} title={"Объяснение и защита"}>
            {"Почему результат верен и какой test сохранит контракт?"}
          </TypeCard>
        </TypeCards>

        <div className="lesson-check-group">
          <QuizCard
            question={"Почему блок 13 идёт до SQLite?"}
            options={[
              "Сначала подготавливаются dependencies и configuration",
              "SQLite запрещена в начале файла",
              "Middleware создаёт таблицы",
            ]}
            correctIndex={0}
            explanation={"Get_db должен появиться в уже понятной модели request dependencies."}
          />
          <QuizCard
            question={"Что является главным объектом блока 14?"}
            options={[
              "engine, ORM model и Session lifecycle",
              "JWT token",
              "Redis queue",
            ]}
            correctIndex={0}
            explanation={"Блок вводит базовые части SQLAlchemy и первую запись."}
          />
          <QuizCard
            question={"Что добавляет блок 15?"}
            options={[
              "реальные queries и transaction errors",
              "только новые folders",
              "frontend components",
            ]}
            correctIndex={0}
            explanation={"CRUD развивается до filters, aggregates и rollback."}
          />
          <QuizCard
            question={"Зачем нужен Alembic?"}
            options={[
              "воспроизводить историю schema",
              "хранить API cookies",
              "заменить pytest",
            ]}
            correctIndex={0}
            explanation={"Migration revisions описывают изменения структуры базы."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Этап 4 развивает готовый Planner API, а не начинает новый проект."}</>,
            <>{"FastAPI dependencies и settings подготавливают подключение базы."}</>,
            <>{"SQLite даёт устойчивое локальное хранение без отдельного сервера."}</>,
            <>{"SQLAlchemy изучается через engine, model, Session и statement."}</>,
            <>{"CRUD дополняется filters, pagination, aggregates и transactions."}</>,
            <>{"Foreign key и relationship решают разные части связи."}</>,
            <>{"Alembic делает schema воспроизводимой."}</>,
            <>{"Итоговый проект должен объясняться от request до database row."}</>,
          ]}
        />

        <PracticeCta text={"Перед занятием 69 нарисуйте две схемы: текущий путь request в Planner API и будущий путь request через get_db, Session и SQLite."} />
      </Section>

    </RichLesson>
  );
}

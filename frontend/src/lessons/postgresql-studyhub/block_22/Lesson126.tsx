import { HardDrive, Layers } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 22 · PostgreSQL и перенос StudyHub";

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
      <TheoryBridge link={"PostgreSQL server, database и application role готовы. Теперь Python-проект должен получить connection configuration и проверить её отдельным минимальным statement."} boundary={"Engine не является одним открытым connection и не устанавливает сеть при каждом импорте endpoint. Он объединяет dialect, pool и способ получения connections."} />

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

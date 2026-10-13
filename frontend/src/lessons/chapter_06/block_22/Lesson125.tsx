import { KeyRound, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 22 · PostgreSQL и перенос StudyHub";

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
      <TheoryBridge link={"Server и psql уже работают. Теперь подключение должно выполняться не административной role postgres, а отдельной идентичностью приложения."} boundary={"Role с LOGIN часто называют database user, но PostgreSQL использует единый механизм roles. Ownership и granted privileges — не одно и то же."} />

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

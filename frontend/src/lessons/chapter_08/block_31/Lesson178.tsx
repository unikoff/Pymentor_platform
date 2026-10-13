import { Database, Network } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MatchPairs, PracticeCta, QuizCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 31 · Docker Compose: API, PostgreSQL и Redis";

export function Lesson178({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"PostgreSQL service и DATABASE_URL внутри Compose"}
        intro={
          "Добавим PostgreSQL как отдельный service, разберём connection URL по частям и подключим Async StudyHub к базе по внутреннему hostname db вместо localhost."
        }
        tags={[
          { icon: <Database size={14} />, label: "PostgreSQL service" },
          { icon: <Network size={14} />, label: "DATABASE_URL по сети" },
        ]}
      />
      <TheoryBridge link={"Предыдущий урок дал общую сеть и устойчивые service names. Теперь в эту модель входит настоящая зависимость проекта — PostgreSQL, уже знакомый по этапам SQL и Async SQLAlchemy."} boundary={"Containerized PostgreSQL для local development не является production database. На уроке важны connection contract, logs и воспроизводимость, а не администрирование сервера."} />

      <Section
        number={"01"}
        title={"Почему database становится отдельным service"}
      >
        <Lead>
          {
            "API и PostgreSQL имеют разные процессы, images и жизненные циклы. Compose не помещает базу внутрь FastAPI-container, а запускает отдельный service db и соединяет его с api через общую сеть."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Запустить db:</strong> взять официальный PostgreSQL image
              и передать начальную конфигурацию
            </li>
            <li>
              <strong>Собрать URL:</strong> заменить host localhost на service
              name db
            </li>
            <li>
              <strong>Проверить связь:</strong> дождаться startup logs и
              выполнить SELECT 1
            </li>
            <li>
              <strong>Подключить endpoint:</strong> прочитать реальные данные
              через прежний HTTP-контракт
            </li>
          </ol>
          <p>
            Результат — API использует PostgreSQL внутри Compose и не требует
            ручного запуска database на host.
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "Внутренняя сеть меняет адрес зависимости, но не меняет ответственность database-слоя приложения."
          }
        </Callout>
      </Section>

      <Section
        number={"02"}
        title={"Официальный PostgreSQL image и начальные переменные"}
      >
        <Lead>
          {
            "Официальный image создаёт database cluster при первом старте. Для local environment ему нужны имя пользователя, пароль и имя базы. Эти значения должны согласовываться с DATABASE_URL API."
          }
        </Lead>

        <CodeBlock
          caption={"service db"}
          code={`services:
          db:
            image: postgres:16-alpine
            environment:
              POSTGRES_USER: studyhub
              POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
              POSTGRES_DB: studyhub
            expose:
              - "5432"`}
        />

        <TypeCards>
          <TypeCard badge={"USER"} title={"POSTGRES_USER"} code={`studyhub`}>
            {"Создаваемая роль для подключения приложения."}
          </TypeCard>
          <TypeCard
            badge={"PASSWORD"}
            badgeTone={"float"}
            title={"POSTGRES_PASSWORD"}
            code={`\${POSTGRES_PASSWORD}`}
          >
            {"Секрет local environment, которого нет в Git."}
          </TypeCard>
          <TypeCard
            badge={"DB"}
            badgeTone={"str"}
            title={"POSTGRES_DB"}
            code={`studyhub`}
          >
            {"Начальная база проекта."}
          </TypeCard>
        </TypeCards>
      </Section>

      <Section number={"03"} title={"Разбираем DATABASE_URL по частям"}>
        <Lead>
          {
            "Connection URL является компактным контрактом подключения: dialect и driver, credentials, hostname, port и database name. Внутри Compose hostname равен db."
          }
        </Lead>

        <CodeBlock
          caption={"DATABASE_URL внутри Compose"}
          code={`postgresql+asyncpg://studyhub:secret@db:5432/studyhub`}
        />

        <MatchPairs
          prompt={"Соедините фрагмент URL с его смыслом."}
          leftTitle={"Фрагмент"}
          rightTitle={"Смысл"}
          pairs={[
            { left: "postgresql+asyncpg", right: "dialect и async driver" },
            { left: "studyhub:secret", right: "user и password" },
            { left: "db", right: "hostname service внутри сети" },
            { left: "5432", right: "внутренний port PostgreSQL" },
            { left: "/studyhub", right: "имя database" },
          ]}
          explanation={
            "URL читается слева направо как полный адрес зависимости."
          }
        />
      </Section>

      <Section number={"04"} title={"Host URL и container URL не совпадают"}>
        <Lead>
          {
            "Когда скрипт запускается на host, имя db обычно не разрешается. Когда тот же код работает внутри api service, localhost указывает на API-container. Поэтому development может иметь два разных URL, но приложение получает нужный вариант через environment."
          }
        </Lead>

        <CompareSolutions
          question={"Какой URL должен получить API-container?"}
          left={{
            title: "Host perspective",
            code: `postgresql+asyncpg://studyhub:secret@localhost:5432/studyhub`,
            note: "Подходит host-инструменту при опубликованном port.",
          }}
          right={{
            title: "Compose perspective",
            code: `postgresql+asyncpg://studyhub:secret@db:5432/studyhub`,
            note: "Подходит API внутри Compose network.",
          }}
          preferred={"right"}
          explanation={
            "Внутренний client обращается по service name db и внутреннему port 5432."
          }
        />

        <Callout>
          {
            "Не зашивайте оба адреса в Python-код. Settings получает один DATABASE_URL из конкретного окружения."
          }
        </Callout>
      </Section>

      <Section number={"05"} title={"Подключаем api к db в compose.yaml"}>
        <Lead>
          {
            "API получает URL через environment и зависит от db как от инфраструктурного service. На этом уроке depends_on задаёт только порядок создания; реальную готовность базы мы добавим отдельно в уроке 180."
          }
        </Lead>

        <CodeBlock
          caption={"API и PostgreSQL"}
          code={`services:
          api:
            build: .
            environment:
              DATABASE_URL: postgresql+asyncpg://studyhub:\${POSTGRES_PASSWORD}@db:5432/studyhub
            depends_on:
              - db
            ports:
              - "8000:8000"
        
          db:
            image: postgres:16-alpine
            environment:
              POSTGRES_USER: studyhub
              POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
              POSTGRES_DB: studyhub`}
        />

        <TrueFalse
          statement={
            <>
              {
                "depends_on в простой форме доказывает, что PostgreSQL уже принимает SQL-запросы."
              }
            </>
          }
          isTrue={false}
          explanation={
            "Он задаёт порядок запуска containers, но process базы может ещё выполнять инициализацию."
          }
        />
      </Section>

      <Section
        number={"06"}
        title={"Читаем database logs и проверяем connection"}
      >
        <Lead>
          {
            "Если API не подключается, сначала нужно разделить две гипотезы: database process не запустился или connection parameters неверны. Logs db показывают инициализацию, а короткая команда pg_isready или SELECT 1 проверяет достижимость."
          }
        </Lead>

        <TerminalDemo
          title={"диагностика PostgreSQL"}
          lines={[
            { cmd: `docker compose up -d db` },
            { cmd: `docker compose logs db --tail=20` },
            { out: `database system is ready to accept connections` },
            {
              cmd: `docker compose exec db pg_isready -U studyhub -d studyhub`,
            },
            { out: `/var/run/postgresql:5432 - accepting connections` },
            {
              cmd: `docker compose exec db psql -U studyhub -d studyhub -c "SELECT 1"`,
            },
            {
              out: ` ?column?
        ----------
                1`,
            },
          ]}
        />

        <Callout>
          {
            "Строка ready to accept connections относится к готовности database process, но ещё не подтверждает наличие таблиц StudyHub."
          }
        </Callout>
      </Section>

      <Section number={"07"} title={"Типичные ошибки connection URL"}>
        <Lead>
          {
            "Большинство первых сбоев объясняется четырьмя несовпадениями: hostname, password, database name или driver. Ошибку нужно читать вместе с фактическим URL без вывода секрета."
          }
        </Lead>

        <BugHunt
          code={`services:
          api:
            environment:
              DATABASE_URL: postgresql+asyncpg://studyhub:secret@localhost:5432/studyhub
          db:
            image: postgres:16-alpine`}
          question={"Почему API-container получает connection refused?"}
          options={[
            "localhost указывает на сам API-container",
            "PostgreSQL не поддерживает port 5432",
            "Compose запрещает environment",
          ]}
          correctIndex={0}
          explanation={
            "Database живёт в соседнем service, поэтому hostname должен быть db."
          }
          fix={`DATABASE_URL: postgresql+asyncpg://studyhub:secret@db:5432/studyhub`}
        />
      </Section>

      <Section
        number={"08"}
        title={"Контрольная точка: endpoint читает PostgreSQL"}
      >
        <Lead>
          {
            "Закрепите не команды сами по себе, а причинную модель: какой service запускается, какую dependency ожидает, где находится состояние и каким наблюдаемым сигналом подтверждается готовность."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Какой hostname использует API внутри Compose?"}
            options={["db", "localhost", "studyhub-api-1"]}
            correctIndex={0}
            explanation={"Service name db является внутренним DNS-именем."}
          />
          <QuizCard
            question={"Что означает 5432 в DATABASE_URL?"}
            options={[
              "Внутренний port PostgreSQL",
              "Host port API",
              "Версия database",
            ]}
            correctIndex={0}
            explanation={"Это port database service внутри сети."}
          />
          <QuizCard
            question={"Что подтверждает SELECT 1?"}
            options={[
              "SQL connection работает",
              "Все migrations применены",
              "Redis готов",
            ]}
            correctIndex={0}
            explanation={
              "Запрос проверяет связь и выполнение SQL, но не схему проекта."
            }
          />
          <QuizCard
            question={"Где хранить реальный пароль local environment?"}
            options={[
              "В локальном .env, исключённом из Git",
              "В README",
              "В Dockerfile",
            ]}
            correctIndex={0}
            explanation={
              "Репозиторий хранит только .env.example без реального секрета."
            }
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"PostgreSQL работает отдельным service db."}</>,
            <>
              {
                "Официальный image получает начальную конфигурацию через environment."
              }
            </>,
            <>
              {
                "DATABASE_URL описывает driver, credentials, host, port и database."
              }
            </>,
            <>{"API внутри Compose использует hostname db, а не localhost."}</>,
            <>{"depends_on без health condition не гарантирует readiness."}</>,
            <>
              {"Logs db и SELECT 1 отвечают на разные диагностические вопросы."}
            </>,
            <>
              {
                "Connection settings приходят из environment, а не из Python-кода."
              }
            </>,
          ]}
        />

        <PracticeCta
          text={
            "Добавьте service db, настройте согласованные POSTGRES_* и DATABASE_URL, выполните pg_isready и SELECT 1, затем откройте endpoint StudyHub, который читает запись из PostgreSQL. Зафиксируйте в README два URL: для host-инструмента и для API-container."
          }
        />
      </Section>
    </RichLesson>
  );
}

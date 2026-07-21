import {
  Activity,
  Boxes,
  Database,
  HardDrive,
  Network,
  RefreshCcw,
  Server,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  FillBlank,
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
  TerminalDemo,
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

const BLOCK_TITLE = "Блок 31 · Docker Compose: API, PostgreSQL и Redis";

type TheoryBridgeData = { link: string; boundary: string };

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  177: {
    link: "В блоке 30 один FastAPI-container уже собирается и отвечает на запросы. Теперь нужно воспроизводимо запускать несколько связанных процессов без длинной последовательности docker run.",
    boundary:
      "Compose не превращает containers в один процесс и не заменяет Dockerfile. Он описывает, какие отдельные services запустить и как связать их конфигурацией и сетью.",
  },
  178: {
    link: "Предыдущий урок дал общую сеть и устойчивые service names. Теперь в эту модель входит настоящая зависимость проекта — PostgreSQL, уже знакомый по этапам SQL и Async SQLAlchemy.",
    boundary:
      "Containerized PostgreSQL для local development не является production database. На уроке важны connection contract, logs и воспроизводимость, а не администрирование сервера.",
  },
  179: {
    link: "PostgreSQL уже доступен API, но без отдельного storage его состояние связано с runtime-container. Теперь данные получают собственный жизненный цикл.",
    boundary:
      "Volume повышает устойчивость local environment, но не является backup. Ошибка приложения, повреждение или команда down -v могут удалить либо испортить единственную копию.",
  },
  180: {
    link: "Database теперь имеет постоянный volume, поэтому чистый и существующий environments должны одинаково получать актуальную schema до первого request.",
    boundary:
      "Порядок создания containers не равен готовности processes. Healthcheck проверяет конкретный сигнал, а migrations должны завершаться отдельным контролируемым шагом.",
  },
  181: {
    link: "Compose stack уже умеет ждать PostgreSQL и применять migrations. Теперь добавляется ещё одна dependency, роль которой пока инфраструктурная и диагностическая.",
    boundary:
      "Наличие Redis-container не является причиной немедленно писать cache, sessions или rate limit. Бизнес-функция появится в этапе 9 после готового LMS-сценария.",
  },
  182: {
    link: "Все services уже разобраны отдельно. Финальная задача блока — доказать воспроизводимость системы с чистой директории и после намеренных ошибок.",
    boundary:
      "Это local development stack, а не production deployment. Secrets manager, registry, remote host и rollout появятся в блоке 32.",
  },
};

function TheoryBridge({ lesson }: { lesson: number }) {
  const bridge = THEORY_BRIDGES[lesson];
  if (!bridge) return null;

  return (
    <Callout tone="info">
      <strong>Связь с курсом.</strong> {bridge.link}{" "}
      <strong>Важно не перепутать:</strong> {bridge.boundary}
    </Callout>
  );
}

// 177. Compose services и внутренняя сеть
export function Lesson177({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Compose services и внутренняя сеть"}
        intro={
          "Перейдём от ручного запуска отдельных containers к декларативному local stack: опишем services в compose.yaml, разберём внутреннюю сеть и научимся отличать hostname service от localhost."
        }
        tags={[
          { icon: <Boxes size={14} />, label: "services как система" },
          { icon: <Network size={14} />, label: "внутренняя сеть" },
        ]}
      />
      <TheoryBridge lesson={177} />

      <Section number={"01"} title={"От одного container к описанию системы"}>
        <Lead>
          {
            "Когда проекту нужен только API, одной команды docker run достаточно. С появлением PostgreSQL, migrations и Redis ручные команды начинают зависеть от порядка, имён сети и переменных окружения. Compose переносит этот сценарий в проверяемый YAML-файл."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Описать:</strong> зафиксировать каждый процесс как
              отдельный service
            </li>
            <li>
              <strong>Связать:</strong> дать services общую внутреннюю сеть и
              устойчивые имена
            </li>
            <li>
              <strong>Запустить:</strong> поднять stack одной командой и увидеть
              его состояние
            </li>
            <li>
              <strong>Диагностировать:</strong> найти ошибку через ps, logs и
              exec
            </li>
          </ol>
          <p>
            Результат урока — минимальный compose.yaml для API и
            диагностического service, который подтверждает работу внутреннего
            DNS.
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "Compose-файл является декларацией желаемого local stack. Команда up сравнивает декларацию с текущим состоянием и создаёт недостающие ресурсы."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Иерархия compose.yaml без магии"}>
        <Lead>
          {
            "В корне файла находится services. Под каждым именем service описывается источник image, команда, environment, ports и другие параметры. Отступы YAML показывают вложенность так же строго, как отступы Python показывают блок кода."
          }
        </Lead>

        <CodeBlock
          caption={"первый compose.yaml"}
          code={`services:
          api:
            build: .
            command: uvicorn app.main:app --host 0.0.0.0 --port 8000
            ports:
              - "8000:8000"
        
          toolbox:
            image: busybox:1.36
            command: sleep 3600`}
        />

        <MatchPairs
          prompt={"Соедините ключ Compose с его ролью."}
          leftTitle={"Ключ"}
          rightTitle={"Роль"}
          pairs={[
            {
              left: "services",
              right: "набор запускаемых компонентов системы",
            },
            { left: "build", right: "сборка image из локального Dockerfile" },
            { left: "image", right: "готовый image из registry" },
            { left: "command", right: "команда процесса внутри container" },
            { left: "ports", right: "публикация доступа на host" },
          ]}
          explanation={"Каждый ключ отвечает за отдельную часть декларации."}
        />
      </Section>

      <Section
        number={"03"}
        title={"Service, container и process — разные уровни"}
      >
        <Lead>
          {
            "Service — запись в Compose-модели. На её основе Docker создаёт container, а внутри container запускается process. При пересоздании имя конкретного container может измениться, но service name остаётся устойчивой точкой обращения."
          }
        </Lead>

        <TypeCards>
          <TypeCard
            badge={"service"}
            title={"Описание роли"}
            code={`services:
          api:`}
          >
            {"Устойчивое имя компонента в compose.yaml и внутреннем DNS."}
          </TypeCard>
          <TypeCard
            badge={"container"}
            badgeTone={"float"}
            title={"Запущенный экземпляр"}
            code={`studyhub-api-1`}
          >
            {
              "Конкретный runtime-объект, который можно остановить и пересоздать."
            }
          </TypeCard>
          <TypeCard
            badge={"process"}
            badgeTone={"str"}
            title={"Работа внутри"}
            code={`uvicorn app.main:app`}
          >
            {"Программа, ради которой container существует."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={
            <>{"После docker compose down service исчезает из compose.yaml."}</>
          }
          isTrue={false}
          explanation={
            "down удаляет созданные containers и network, но декларация остаётся в файле проекта."
          }
        />
      </Section>

      <Section
        number={"04"}
        title={"Внутренняя сеть и service name как hostname"}
      >
        <Lead>
          {
            "Compose по умолчанию создаёт сеть проекта. Services в этой сети находят друг друга по именам api, db или redis. localhost внутри API-container обозначает сам API-container, а не host-машину и не соседний database-container."
          }
        </Lead>

        <StepThrough
          code={`host browser -> localhost:8000
        localhost:8000 -> published api port
        api container -> db:5432
        api container -> redis:6379`}
          steps={[
            {
              line: 0,
              note: "Браузер работает на host и обращается к опубликованному порту.",
              vars: { host: "localhost:8000" },
            },
            {
              line: 1,
              note: "Docker направляет traffic во внутренний port API.",
              vars: { service: "api" },
            },
            {
              line: 2,
              note: "API использует service name db как hostname.",
              vars: { "database host": "db" },
            },
            {
              line: 3,
              note: "Redis позже будет доступен по имени redis.",
              vars: { "redis host": "redis" },
            },
          ]}
        />

        <Callout>
          {
            "Запомните две перспективы: человек с host использует опубликованный port, а service внутри сети использует имя другого service и его внутренний port."
          }
        </Callout>
      </Section>

      <Section number={"05"} title={"Ports нужны не каждому service"}>
        <Lead>
          {
            "Публикация ports открывает container для host-машины. Для общения api → db публикация 5432 не обязательна: оба service уже находятся во внутренней сети. Открывать database на host стоит только при явной потребности локального GUI или psql."
          }
        </Lead>

        <CompareSolutions
          question={"Какой вариант лучше выражает минимальный local stack?"}
          left={{
            title: "Публиковать всё",
            code: `db:
          ports:
            - "5432:5432"
        redis:
          ports:
            - "6379:6379"`,
            note: "Host получает доступ ко всем инфраструктурным ports без необходимости.",
          }}
          right={{
            title: "Публиковать только вход",
            code: `api:
          ports:
            - "8000:8000"
        db:
          image: postgres:16`,
            note: "Внутренние services общаются через Compose network.",
          }}
          preferred={"right"}
          explanation={
            "Для основного сценария внешний вход нужен API, а db и redis доступны внутри сети по service names."
          }
        />
      </Section>

      <Section number={"06"} title={"Environment и подстановка значений"}>
        <Lead>
          {
            "Compose может передать переменные внутрь container. Значение можно записать прямо для учебного примера или получить из .env. Однако секреты не должны попадать в Git, поэтому репозиторий хранит только .env.example с безопасными placeholders."
          }
        </Lead>

        <CodeBlock
          caption={"environment внутри service"}
          code={`services:
          api:
            build: .
            environment:
              APP_ENV: development
              LOG_LEVEL: \${LOG_LEVEL:-INFO}
              DATABASE_URL: \${DATABASE_URL}
        
          toolbox:
            image: busybox:1.36`}
        />

        <FillBlank
          prompt={"Завершите обращение API к соседнему database-service."}
          before={"DATABASE_HOST="}
          after={""}
          options={["localhost", "db", "127.0.0.1"]}
          answer={"db"}
          explanation={"Внутренний DNS Compose разрешает имя service db."}
        />
      </Section>

      <Section
        number={"07"}
        title={"Команды жизненного цикла и первая диагностика"}
      >
        <Lead>
          {
            "Операционная модель Compose строится вокруг небольшого набора команд: up создаёт и запускает, ps показывает состояние, logs читает вывод, exec выполняет команду внутри service, down удаляет созданные containers и network."
          }
        </Lead>

        <TerminalDemo
          title={"первый запуск Compose"}
          lines={[
            { cmd: `docker compose up --build -d` },
            {
              out: `Container studyhub-api-1      Started
        Container studyhub-toolbox-1  Started`,
            },
            { cmd: `docker compose ps` },
            {
              out: `NAME                 SERVICE    STATUS
        studyhub-api-1       api        Up
        studyhub-toolbox-1   toolbox    Up`,
            },
            { cmd: `docker compose exec toolbox ping -c 1 api` },
            { out: `1 packets transmitted, 1 packets received` },
            { cmd: `docker compose down` },
          ]}
        />

        <Callout>
          {
            "Для расследования сначала смотрите состояние через ps, затем logs конкретного service. Перезапуск без чтения ошибки часто только стирает контекст."
          }
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка: сеть Compose"}>
        <Lead>
          {
            "Закрепите не команды сами по себе, а причинную модель: какой service запускается, какую dependency ожидает, где находится состояние и каким наблюдаемым сигналом подтверждается готовность."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что означает localhost внутри API-container?"}
            options={[
              "Сам API-container",
              "Database service",
              "Host во всех случаях",
            ]}
            correctIndex={0}
            explanation={
              "Loopback относится к текущему network namespace container."
            }
          />
          <QuizCard
            question={"Как API обращается к service db?"}
            options={[
              "По hostname db",
              "По имени container из docker ps",
              "Только по host IP",
            ]}
            correctIndex={0}
            explanation={
              "Service name является устойчивым DNS-именем внутри Compose network."
            }
          />
          <QuizCard
            question={"Зачем нужен ports?"}
            options={[
              "Опубликовать container port на host",
              "Создать volume",
              "Установить dependency",
            ]}
            correctIndex={0}
            explanation={"ports задаёт host-to-container mapping."}
          />
          <QuizCard
            question={"Что удаляет docker compose down?"}
            options={[
              "Containers и network проекта",
              "compose.yaml",
              "Dockerfile",
            ]}
            correctIndex={0}
            explanation={"Декларация и исходники остаются в репозитории."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Compose описывает систему из отдельных services."}</>,
            <>{"Service, container и process относятся к разным уровням."}</>,
            <>{"Внутри сети service name работает как hostname."}</>,
            <>{"localhost внутри container указывает на этот container."}</>,
            <>
              {
                "Ports нужны для доступа с host, а не для каждого внутреннего соединения."
              }
            </>,
            <>
              {"Environment передаёт конфигурацию, но секреты не коммитятся."}
            </>,
            <>{"Диагностика начинается с compose ps и compose logs."}</>,
          ]}
        />

        <PracticeCta
          text={
            "Создайте compose.yaml с api и toolbox, поднимите stack, подтвердите DNS-имя api из toolbox, откройте Swagger с host и добавьте в README схему host → published port → internal network."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 178. PostgreSQL service и DATABASE_URL внутри Compose
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
      <TheoryBridge lesson={178} />

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

// 179. Volumes и постоянные данные PostgreSQL
export function Lesson179({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Volumes и постоянные данные PostgreSQL"}
        intro={
          "Разделим жизненный цикл PostgreSQL-container и его данных: подключим named volume, проверим сохранность после пересоздания и составим безопасную процедуру полного reset без иллюзии резервного копирования."
        }
        tags={[
          { icon: <HardDrive size={14} />, label: "named volume" },
          {
            icon: <Database size={14} />,
            label: "данные переживают container",
          },
        ]}
      />
      <TheoryBridge lesson={179} />

      <Section number={"01"} title={"Два жизненных цикла вместо одного"}>
        <Lead>
          {
            "Container должен быть заменяемым: новый image или конфигурация создают новый runtime. Database data, напротив, должны переживать пересоздание. Named volume отделяет filesystem с PostgreSQL cluster от конкретного container."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Подключить:</strong> смонтировать named volume в data
              directory PostgreSQL
            </li>
            <li>
              <strong>Проверить:</strong> создать запись и пересоздать db
              container
            </li>
            <li>
              <strong>Различить:</strong> понять эффект restart, down и down -v
            </li>
            <li>
              <strong>Защитить:</strong> описать backup перед разрушительным
              reset
            </li>
          </ol>
          <p>
            Результат — воспроизводимый эксперимент, доказывающий сохранность и
            контролируемое удаление local data.
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "Container можно удалить без потери данных только тогда, когда важное состояние вынесено из его writable layer."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Named volume и точка монтирования"}>
        <Lead>
          {
            "Compose объявляет volume на верхнем уровне и подключает его к service db. PostgreSQL image хранит cluster в /var/lib/postgresql/data, поэтому именно эта директория должна смотреть на volume."
          }
        </Lead>

        <CodeBlock
          caption={"named volume PostgreSQL"}
          code={`services:
          db:
            image: postgres:16-alpine
            volumes:
              - postgres_data:/var/lib/postgresql/data
        
        volumes:
          postgres_data:`}
        />

        <FillBlank
          prompt={"Завершите стандартную точку монтирования данных PostgreSQL."}
          before={"postgres_data:"}
          after={""}
          options={["/var/lib/postgresql/data", "/app", "/tmp/postgres"]}
          answer={"/var/lib/postgresql/data"}
          explanation={
            "Официальный image хранит database cluster в этой директории."
          }
        />
      </Section>

      <Section
        number={"03"}
        title={"Что происходит при restart, down и down -v"}
      >
        <Lead>
          {
            "Команды похожи по названию, но затрагивают разные ресурсы. Restart перезапускает существующий container. Down удаляет containers и project network, сохраняя named volumes. Down -v дополнительно удаляет volumes проекта."
          }
        </Lead>

        <MethodGrid
          rows={[
            [
              "docker compose restart db",
              "process перезапускается, container и volume сохраняются",
            ],
            [
              "docker compose up -d --force-recreate db",
              "container заменяется, volume подключается снова",
            ],
            [
              "docker compose down",
              "containers и network удаляются, named volume остаётся",
            ],
            ["docker compose down -v", "удаляются также named volumes проекта"],
            ["docker volume ls", "показывает существующие volumes"],
          ]}
        />

        <TrueFalse
          statement={
            <>
              {
                "Обычный docker compose down удаляет named volume postgres_data."
              }
            </>
          }
          isTrue={false}
          explanation={
            "Volume сохраняется, пока не добавлен флаг -v или не выполнено отдельное удаление."
          }
        />
      </Section>

      <Section
        number={"04"}
        title={"Эксперимент persistence и две линии жизни"}
      >
        <Lead>
          {
            "Сохранность нужно проверять наблюдаемым сценарием: создать уникальную запись, запомнить её id, пересоздать containers и снова запросить ту же запись через API."
          }
        </Lead>

        <CodeSequence
          title={"Соберите эксперимент persistence"}
          prompt={
            "Расположите действия так, чтобы результат однозначно доказал роль volume."
          }
          pieces={[
            { id: "up", code: "docker compose up -d" },
            { id: "create", code: "POST /tasks → id=501" },
            { id: "down", code: "docker compose down" },
            { id: "up2", code: "docker compose up -d" },
            { id: "get", code: "GET /tasks/501 → 200" },
            {
              id: "wrong",
              code: "docker compose down -v",
              note: "это разрушит проверяемые данные",
            },
          ]}
          correctOrder={["up", "create", "down", "up2", "get"]}
          explanation={
            "Запись после нового container подтверждает, что data находятся в volume."
          }
        />

        <Lead>
          {
            "Полезно мыслить двумя параллельными линиями: containers создаются из images и могут часто заменяться, volume существует отдельно и подключается к новому db container."
          }
        </Lead>

        <StepThrough
          code={`image postgres:16
        create db container
        mount postgres_data
        write task 501
        remove db container
        create new db container
        mount same postgres_data
        read task 501`}
          steps={[
            {
              line: 0,
              note: "Image содержит программу PostgreSQL, но не данные StudyHub.",
              vars: { image: "immutable template" },
            },
            {
              line: 1,
              note: "Создаётся runtime-container.",
              vars: { container: "db-1" },
            },
            {
              line: 2,
              note: "Volume подключается к data directory.",
              vars: { volume: "postgres_data" },
            },
            {
              line: 3,
              note: "Новая строка записывается в volume.",
              vars: { task: "501" },
            },
            {
              line: 4,
              note: "Старый container удаляется.",
              vars: { container: "removed" },
            },
            {
              line: 5,
              note: "Создаётся новый runtime.",
              vars: { container: "db-2" },
            },
            {
              line: 6,
              note: "Подключается прежний volume.",
              vars: { volume: "same data" },
            },
            {
              line: 7,
              note: "Строка остаётся доступной.",
              vars: { GET: "200" },
            },
          ]}
        />
      </Section>

      <Section number={"05"} title={"Volume не равен backup"}>
        <Lead>
          {
            "Volume хранит рабочие данные рядом с local Docker environment. Если приложение удалит строки, они исчезнут и в volume. Backup является отдельной копией, которую можно восстановить после удаления или повреждения основного storage."
          }
        </Lead>

        <CompareSolutions
          question={"Что защищает от случайного DELETE?"}
          left={{
            title: "Только volume",
            code: `postgres_data:/var/lib/postgresql/data`,
            note: "DELETE изменит данные внутри единственной рабочей копии.",
          }}
          right={{
            title: "Отдельный dump",
            code: `pg_dump -U studyhub -d studyhub > backup.sql`,
            note: "Снимок можно хранить отдельно и использовать для восстановления.",
          }}
          preferred={"right"}
          explanation={
            "Volume решает persistence между containers, а backup решает восстановление отдельной копии."
          }
        />

        <Callout>
          {
            "На учебном проекте достаточно понять границу и сделать простой pg_dump перед разрушительным reset."
          }
        </Callout>
      </Section>

      <Section number={"06"} title={"Контролируемый reset local database"}>
        <Lead>
          {
            "Полный reset полезен, когда нужно проверить migrations на чистой базе. Он должен быть осознанной процедурой: остановить stack, при необходимости сделать dump, удалить volume, поднять db и применить schema заново."
          }
        </Lead>

        <TerminalDemo
          title={"reset development environment"}
          lines={[
            {
              cmd: `docker compose exec db pg_dump -U studyhub -d studyhub > backup-before-reset.sql`,
            },
            { cmd: `docker compose down -v` },
            { out: `Volume studyhub_postgres_data  Removed` },
            { cmd: `docker compose up -d db` },
            { cmd: `docker compose ps db` },
            { out: `studyhub-db-1   Up` },
          ]}
        />

        <Callout>
          {
            "Не добавляйте down -v в обычную команду остановки проекта. Разрушительное действие должно выделяться названием и документацией."
          }
        </Callout>
      </Section>

      <Section number={"07"} title={"Инспекция volume и типичные ошибки"}>
        <Lead>
          {
            "Когда данные неожиданно исчезли, проверьте имя project, список volumes и фактические mounts container. Новый Compose project name может создать новый пустой volume вместо подключения прежнего."
          }
        </Lead>

        <BugHunt
          code={`volumes:
          pg_data:
        
        services:
          db:
            image: postgres:16-alpine
            volumes:
              - postgres_data:/var/lib/postgresql/data`}
          question={"Почему Compose не может найти volume?"}
          options={[
            "Объявлено имя pg_data, а подключено postgres_data",
            "PostgreSQL запрещает named volumes",
            "Volume можно подключать только к API",
          ]}
          correctIndex={0}
          explanation={
            "Имена в верхнем разделе volumes и service mount должны совпадать."
          }
          fix={`volumes:
          postgres_data:
        
        services:
          db:
            volumes:
              - postgres_data:/var/lib/postgresql/data`}
        />
      </Section>

      <Section number={"08"} title={"Контрольная точка: persistence и reset"}>
        <Lead>
          {
            "Закрепите не команды сами по себе, а причинную модель: какой service запускается, какую dependency ожидает, где находится состояние и каким наблюдаемым сигналом подтверждается готовность."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что переживает docker compose down?"}
            options={["Named volume", "Container", "Project network"]}
            correctIndex={0}
            explanation={"Без -v Compose сохраняет named volumes."}
          />
          <QuizCard
            question={"Что делает down -v?"}
            options={[
              "Удаляет также volumes проекта",
              "Только перезапускает API",
              "Создаёт backup",
            ]}
            correctIndex={0}
            explanation={
              "Флаг -v делает операцию разрушительной для local data."
            }
          />
          <QuizCard
            question={"Почему volume не является backup?"}
            options={[
              "Изменения и удаления сразу попадают в него",
              "Он всегда read-only",
              "PostgreSQL его не использует",
            ]}
            correctIndex={0}
            explanation={
              "Это основное рабочее storage, а не независимая копия."
            }
          />
          <QuizCard
            question={"Куда монтируется PostgreSQL volume?"}
            options={[
              "/var/lib/postgresql/data",
              "/app/data",
              "/var/log/postgresql",
            ]}
            correctIndex={0}
            explanation={"Это стандартная data directory официального image."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Container lifecycle и data lifecycle нужно разделять."}</>,
            <>
              {
                "Named volume хранит PostgreSQL cluster вне writable layer container."
              }
            </>,
            <>{"Down сохраняет volume, а down -v удаляет его."}</>,
            <>
              {"Persistence проверяется через запись до и после пересоздания."}
            </>,
            <>
              {
                "Volume не защищает от логического удаления и не заменяет backup."
              }
            </>,
            <>{"Reset выполняется отдельной документированной процедурой."}</>,
            <>
              {
                "Имя project и имя volume влияют на то, какие данные подключены."
              }
            </>,
          ]}
        />

        <PracticeCta
          text={
            "Подключите postgres_data, создайте контрольную задачу, выполните down/up и подтвердите её сохранность. Затем сделайте pg_dump, выполните контролируемый down -v, поднимите чистую database и запишите процедуру восстановления в docs/runbook-compose.md."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 180. Readiness, healthcheck и запуск migrations
export function Lesson180({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Readiness, healthcheck и запуск migrations"}
        intro={
          "Уберём гонку старта: научим Compose отличать started от healthy, добавим pg_isready, отдельный migration service и порядок db healthy → migrations completed → API started."
        }
        tags={[
          { icon: <Activity size={14} />, label: "readiness dependency" },
          { icon: <Workflow size={14} />, label: "migrations до API" },
        ]}
      />
      <TheoryBridge lesson={180} />

      <Section number={"01"} title={"Started ещё не означает ready"}>
        <Lead>
          {
            "Docker может запустить PostgreSQL process, но несколько секунд database инициализирует cluster и ещё не принимает connections. Если API стартует немедленно, результат зависит от случайного timing."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Измерить:</strong> увидеть промежуток между container
              started и database ready
            </li>
            <li>
              <strong>Проверить:</strong> добавить pg_isready как healthcheck
            </li>
            <li>
              <strong>Применить schema:</strong> запустить Alembic отдельным
              one-shot service
            </li>
            <li>
              <strong>Открыть API:</strong> стартовать только после успешных
              migrations
            </li>
          </ol>
          <p>
            Результат — детерминированный startup чистого и повторного local
            stack.
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "Readiness — это ответ на вопрос «может ли dependency обслужить ожидаемую операцию сейчас?», а не просто «существует ли process»."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Healthcheck PostgreSQL через pg_isready"}>
        <Lead>
          {
            "Команда pg_isready проверяет, принимает ли server connections. Compose периодически запускает test и хранит health status: starting, healthy или unhealthy."
          }
        </Lead>

        <CodeBlock
          caption={"healthcheck db"}
          code={`services:
          db:
            image: postgres:16-alpine
            healthcheck:
              test: ["CMD-SHELL", "pg_isready -U studyhub -d studyhub"]
              interval: 5s
              timeout: 3s
              retries: 10
              start_period: 5s`}
        />

        <TypeCards>
          <TypeCard badge={"interval"} title={"Частота"} code={`5s`}>
            {"Как часто повторять проверку."}
          </TypeCard>
          <TypeCard
            badge={"timeout"}
            badgeTone={"float"}
            title={"Лимит попытки"}
            code={`3s`}
          >
            {"Сколько ждать один запуск test."}
          </TypeCard>
          <TypeCard
            badge={"retries"}
            badgeTone={"str"}
            title={"Порог ошибки"}
            code={`10`}
          >
            {"Сколько неудач допускается до unhealthy."}
          </TypeCard>
        </TypeCards>
      </Section>

      <Section number={"03"} title={"depends_on с условиями"}>
        <Lead>
          {
            "Compose может связать старт service с состоянием зависимости. Migrate ждёт service_healthy для db, а API — service_completed_successfully для migrate. Так декларация отражает настоящий порядок готовности."
          }
        </Lead>

        <CodeBlock
          caption={"условия запуска"}
          code={`services:
          migrate:
            build: .
            command: alembic upgrade head
            depends_on:
              db:
                condition: service_healthy
        
          api:
            build: .
            depends_on:
              migrate:
                condition: service_completed_successfully`}
        />

        <MatchPairs
          prompt={"Соедините условие с ожидаемым состоянием."}
          leftTitle={"Condition"}
          rightTitle={"Состояние"}
          pairs={[
            {
              left: "service_started",
              right: "container запущен, readiness не доказана",
            },
            {
              left: "service_healthy",
              right: "healthcheck зависимости успешен",
            },
            {
              left: "service_completed_successfully",
              right: "one-shot service завершился с code 0",
            },
          ]}
          explanation={"Условия выбираются по реальному контракту dependency."}
        />
      </Section>

      <Section number={"04"} title={"Migration service как конечная операция"}>
        <Lead>
          {
            "Migrations не являются долгоживущим server process. Service migrate использует тот же application image и DATABASE_URL, выполняет alembic upgrade head и завершается. Code 0 разрешает запуск API, ненулевой code блокирует его."
          }
        </Lead>

        <CompareSolutions
          question={"Где безопаснее фиксировать schema startup?"}
          left={{
            title: "create_all в API",
            code: `await conn.run_sync(Base.metadata.create_all)`,
            note: "Application startup незаметно изменяет schema и обходит историю Alembic.",
          }}
          right={{
            title: "Отдельный migrate service",
            code: `command: alembic upgrade head`,
            note: "История migrations применяется наблюдаемым one-shot шагом.",
          }}
          preferred={"right"}
          explanation={
            "Alembic service делает schema change явным и останавливает startup при ошибке."
          }
        />

        <Callout>
          {
            "Idempotent означает, что повторный upgrade head на уже актуальной schema завершается успешно без повторного создания изменений."
          }
        </Callout>
      </Section>

      <Section number={"05"} title={"Правильный timeline запуска stack"}>
        <Lead>
          {
            "Теперь порядок определяется не скоростью машины, а условиями. Database сначала становится healthy, затем migrations достигают head, после чего API начинает принимать traffic."
          }
        </Lead>

        <CodeSequence
          title={"Соберите startup pipeline"}
          prompt={"Расположите состояния в причинном порядке."}
          pieces={[
            { id: "db-start", code: "db container started" },
            { id: "db-health", code: "pg_isready → healthy" },
            { id: "migrate", code: "alembic upgrade head" },
            { id: "migrate-ok", code: "migrate exit code 0" },
            { id: "api", code: "api process started" },
            { id: "request", code: "GET /ready → 200" },
          ]}
          correctOrder={[
            "db-start",
            "db-health",
            "migrate",
            "migrate-ok",
            "api",
            "request",
          ]}
          explanation={
            "Каждый следующий шаг опирается на подтверждённый результат предыдущего."
          }
        />
      </Section>

      <Section number={"06"} title={"Что происходит при ошибке migration"}>
        <Lead>
          {
            "Ошибка revision, конфликт schema или неверный DATABASE_URL должны остановить startup, а не быть скрыты retry-циклом API. Logs migrate становятся первым источником диагностики."
          }
        </Lead>

        <BranchExplorer
          code={`migrate exit code == 0
          -> start api
        migrate exit code != 0
          -> keep api stopped
          -> inspect migrate logs
          -> fix migration or config
          -> rerun`}
          scenarios={[
            {
              label: "migration success",
              activeLine: 1,
              output: "API получает разрешение на старт",
            },
            {
              label: "migration failed",
              activeLine: 3,
              output: "API остаётся остановленным",
            },
            {
              label: "после исправления",
              activeLine: 5,
              output: "Compose повторяет one-shot service",
            },
          ]}
        />

        <Callout>
          {
            "Автоматический startup не должен автоматически скрывать destructive migration errors. Система останавливается и показывает место сбоя."
          }
        </Callout>
      </Section>

      <Section number={"07"} title={"Health status и диагностика Compose"}>
        <Lead>
          {
            "Для расследования нужно увидеть сразу три состояния: health db, exit code migrate и logs api. Команда ps показывает сводку, а logs раскрывает причину."
          }
        </Lead>

        <TerminalDemo
          title={"проверка готовности stack"}
          lines={[
            { cmd: `docker compose up -d --build` },
            { cmd: `docker compose ps` },
            {
              out: `db        Up (healthy)
        migrate   Exited (0)
        api       Up (healthy)`,
            },
            { cmd: `docker compose logs migrate` },
            { out: `Running upgrade -> head` },
            { cmd: `curl -f http://localhost:8000/ready` },
            { out: `{"status":"ready"}` },
          ]}
        />

        <TrueFalse
          statement={
            <>
              {"Если db healthy, таблицы StudyHub гарантированно существуют."}
            </>
          }
          isTrue={false}
          explanation={
            "Database принимает connections, но schema подтверждается успешным migrate service."
          }
        />
      </Section>

      <Section
        number={"08"}
        title={"Контрольная точка: детерминированный startup"}
      >
        <Lead>
          {
            "Закрепите не команды сами по себе, а причинную модель: какой service запускается, какую dependency ожидает, где находится состояние и каким наблюдаемым сигналом подтверждается готовность."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что проверяет pg_isready?"}
            options={[
              "Готовность PostgreSQL принимать connections",
              "Наличие всех API routes",
              "Версию Redis",
            ]}
            correctIndex={0}
            explanation={"Это database readiness probe."}
          />
          <QuizCard
            question={"Когда запускается migrate?"}
            options={[
              "После db service_healthy",
              "До создания db container",
              "После первого HTTP request",
            ]}
            correctIndex={0}
            explanation={"Migration зависит от реальной готовности базы."}
          />
          <QuizCard
            question={"Что должно произойти при migration exit code 1?"}
            options={[
              "API не запускается",
              "API игнорирует ошибку",
              "Volume удаляется автоматически",
            ]}
            correctIndex={0}
            explanation={"Неуспешная schema operation блокирует startup."}
          />
          <QuizCard
            question={"Почему create_all не заменяет Alembic?"}
            options={[
              "Не ведёт управляемую историю изменений schema",
              "Не умеет создавать таблицы",
              "Работает только с Redis",
            ]}
            correctIndex={0}
            explanation={
              "Migrations фиксируют последовательность schema revisions."
            }
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Container started и dependency ready — разные состояния."}</>,
            <>{"PostgreSQL readiness проверяется через pg_isready."}</>,
            <>
              {"Healthcheck имеет interval, timeout, retries и start_period."}
            </>,
            <>{"Migrate является отдельным one-shot service."}</>,
            <>{"API ждёт успешного завершения migrations."}</>,
            <>
              {"Ошибка migration должна остановить startup и остаться видимой."}
            </>,
            <>
              {
                "Compose ps, logs migrate и /ready образуют диагностическую цепочку."
              }
            </>,
          ]}
        />

        <PracticeCta
          text={
            "Добавьте db healthcheck, migrate service и условия depends_on. Проверьте чистый startup, повторный startup на актуальной schema и намеренно сломанную migration. Зафиксируйте ожидаемые статусы db/migrate/api в runbook."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 181. Redis service как будущая инфраструктура
export function Lesson181({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Redis service как будущая инфраструктура"}
        intro={
          "Добавим Redis в local stack, проверим ping и healthcheck, но сознательно не превратим его в источник истины и не начнём кешировать бизнес-данные до появления измеримой потребности."
        }
        tags={[
          { icon: <Server size={14} />, label: "Redis service" },
          { icon: <ShieldCheck size={14} />, label: "границы ответственности" },
        ]}
      />
      <TheoryBridge lesson={181} />

      <Section number={"01"} title={"Почему Redis появляется раньше кеша"}>
        <Lead>
          {
            "Этап 8 отвечает за воспроизводимую инфраструктуру. Redis добавляется сейчас, чтобы local, CI и будущий deployment имели одинаковую topology. Прикладное использование появится позже, когда будет понятен конкретный read-path или rate-limit scenario."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Поднять:</strong> добавить service redis и устойчивый
              hostname
            </li>
            <li>
              <strong>Проверить:</strong> выполнить ping и healthcheck
            </li>
            <li>
              <strong>Разделить роли:</strong> оставить PostgreSQL source of
              truth
            </li>
            <li>
              <strong>Зафиксировать границу:</strong> не менять HTTP-контракт и
              бизнес-данные
            </li>
          </ol>
          <p>
            Результат — Redis доступен приложению, но его отказ не уничтожает
            постоянные данные StudyHub.
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "Инфраструктура может быть готова раньше use case. Это не означает, что use case нужно изобретать ради технологии."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Service redis и внутренний URL"}>
        <Lead>
          {
            "Redis запускается отдельным process на port 6379. В Compose network API обращается к нему по hostname redis. Database number /0 является логическим пространством ключей, а не отдельным server."
          }
        </Lead>

        <CodeBlock
          caption={"Redis в Compose"}
          code={`services:
          redis:
            image: redis:7-alpine
            command: redis-server --appendonly no
            expose:
              - "6379"
        
          api:
            environment:
              REDIS_URL: redis://redis:6379/0`}
        />

        <FillBlank
          prompt={"Завершите REDIS_URL внутри Compose network."}
          before={"redis://"}
          after={":6379/0"}
          options={["localhost", "redis", "api"]}
          answer={"redis"}
          explanation={"Service name redis разрешается внутренним DNS."}
        />
      </Section>

      <Section number={"03"} title={"PING и healthcheck Redis"}>
        <Lead>
          {
            "Минимальная проверка connectivity — команда PING с ответом PONG. Healthcheck может использовать redis-cli ping и переводить service из starting в healthy."
          }
        </Lead>

        <CodeBlock
          caption={"healthcheck Redis"}
          code={`redis:
          image: redis:7-alpine
          healthcheck:
            test: ["CMD", "redis-cli", "ping"]
            interval: 5s
            timeout: 3s
            retries: 10`}
        />

        <TerminalDemo
          title={"проверка Redis"}
          lines={[
            { cmd: `docker compose up -d redis` },
            { cmd: `docker compose exec redis redis-cli ping` },
            { out: `PONG` },
            { cmd: `docker compose ps redis` },
            { out: `redis   Up (healthy)` },
          ]}
        />
      </Section>

      <Section
        number={"04"}
        title={"PostgreSQL и Redis имеют разные контракты"}
      >
        <Lead>
          {
            "PostgreSQL хранит пользователей, курсы и задачи как связанные постоянные данные. Redis предназначен для временных значений, быстрых lookups и coordination. Удаление Redis data не должно удалять продуктовые факты."
          }
        </Lead>

        <TypeCards>
          <TypeCard
            badge={"PostgreSQL"}
            title={"Source of truth"}
            code={`users, tasks, courses`}
          >
            {"Целостные постоянные данные и транзакции."}
          </TypeCard>
          <TypeCard
            badge={"Redis"}
            badgeTone={"float"}
            title={"Временная инфраструктура"}
            code={`future cache, TTL, rate limit`}
          >
            {"Значения, которые можно восстановить или потерять по контракту."}
          </TypeCard>
          <TypeCard
            badge={"HTTP"}
            badgeTone={"str"}
            title={"Контракт пока прежний"}
            code={`GET /tasks`}
          >
            {"Добавление service не меняет response API."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={
            <>
              {
                "После добавления Redis список задач можно удалить из PostgreSQL и хранить только в кеше."
              }
            </>
          }
          isTrue={false}
          explanation={
            "Кеш не заменяет source of truth; бизнес-данные остаются в PostgreSQL."
          }
        />
      </Section>

      <Section number={"05"} title={"TTL как предварительная модель"}>
        <Lead>
          {
            "TTL задаёт срок жизни key. Сейчас достаточно изолированного диагностического эксперимента: создать временный key, увидеть остаток времени и дождаться исчезновения. Прикладной cache-aside появится позже."
          }
        </Lead>

        <StepThrough
          code={`SETEX diagnostic:compose 30 ok
        TTL diagnostic:compose
        GET diagnostic:compose
        wait 30 seconds
        GET diagnostic:compose`}
          steps={[
            {
              line: 0,
              note: "Создаётся временный диагностический key.",
              vars: { value: "ok", ttl: "30s" },
            },
            {
              line: 1,
              note: "Redis показывает оставшееся время.",
              vars: { ttl: "<= 30" },
            },
            {
              line: 2,
              note: "До истечения key читается.",
              vars: { result: "ok" },
            },
            {
              line: 3,
              note: "Время жизни заканчивается.",
              vars: { key: "expired" },
            },
            {
              line: 4,
              note: "После expiration значение отсутствует.",
              vars: { result: "nil" },
            },
          ]}
        />

        <Callout>
          {
            "Эксперимент показывает механику TTL, но не вводит cache policy для StudyHub."
          }
        </Callout>
      </Section>

      <Section
        number={"06"}
        title={"Является ли Redis обязательным для readiness API"}
      >
        <Lead>
          {
            "Пока Redis не участвует в пользовательском сценарии, его недоступность не обязана делать весь API unready. Диагностический endpoint может показать degraded dependency, сохранив доступ к PostgreSQL-функциям."
          }
        </Lead>

        <BranchExplorer
          code={`postgres_ok and redis_ok
          -> ready
        postgres_failed
          -> not ready
        postgres_ok and redis_failed
          -> ready with degraded redis status`}
          scenarios={[
            { label: "всё доступно", activeLine: 1, output: "200 ready" },
            {
              label: "PostgreSQL недоступен",
              activeLine: 3,
              output: "503 not ready",
            },
            {
              label: "Redis недоступен",
              activeLine: 5,
              output: "200 ready, redis=degraded",
            },
          ]}
        />

        <Callout>
          {
            "Критичность dependency определяется текущим контрактом продукта. После появления rate limit или кеша решение может измениться."
          }
        </Callout>
      </Section>

      <Section number={"07"} title={"Конфигурация и типичные ошибки Redis"}>
        <Lead>
          {
            "Финальная декларация добавляет service, healthcheck и REDIS_URL. Application может иметь небольшой connectivity probe, но не записывает tasks, users или sessions в Redis на этом блоке."
          }
        </Lead>

        <CompareSolutions
          question={"Какое изменение соответствует границе урока?"}
          left={{
            title: "Сразу заменить database",
            code: `await redis.set(f"task:{id}", payload)`,
            note: "Постоянные данные переносятся без модели consistency.",
          }}
          right={{
            title: "Добавить инфраструктурный probe",
            code: `await redis.ping()`,
            note: "Проверяется connectivity без изменения бизнес-контракта.",
          }}
          preferred={"right"}
          explanation={
            "Цель блока — topology и диагностика, а не внедрение неготовой cache policy."
          }
        />

        <Lead>
          {
            "Ошибки похожи на database connection: localhost внутри API, неверный port, service unhealthy или клиент не закрывается. Начинайте с compose ps redis и redis-cli ping."
          }
        </Lead>

        <BugHunt
          code={`REDIS_URL=redis://localhost:6379/0
        
        # код выполняется внутри api service`}
          question={"Почему client не видит Redis?"}
          options={[
            "Нужен hostname redis",
            "Redis не поддерживает URLs",
            "Database number должен быть 5432",
          ]}
          correctIndex={0}
          explanation={"localhost относится к API-container."}
          fix={`REDIS_URL=redis://redis:6379/0`}
        />
      </Section>

      <Section
        number={"08"}
        title={"Контрольная точка: Redis без смешения ролей"}
      >
        <Lead>
          {
            "Закрепите не команды сами по себе, а причинную модель: какой service запускается, какую dependency ожидает, где находится состояние и каким наблюдаемым сигналом подтверждается готовность."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Какой hostname Redis внутри Compose?"}
            options={["redis", "localhost", "6379"]}
            correctIndex={0}
            explanation={"Service name используется внутренним DNS."}
          />
          <QuizCard
            question={"Что отвечает redis-cli ping?"}
            options={["PONG", "READY SQL", "HTTP 200"]}
            correctIndex={0}
            explanation={
              "PING является минимальной connectivity-командой Redis."
            }
          />
          <QuizCard
            question={"Где остаются задачи StudyHub?"}
            options={["В PostgreSQL", "Только в Redis", "В Docker image"]}
            correctIndex={0}
            explanation={"PostgreSQL остаётся source of truth."}
          />
          <QuizCard
            question={"Нужно ли уже реализовывать cache-aside?"}
            options={[
              "Нет, use case появится на этапе 9",
              "Да, иначе Compose не работает",
              "Да, вместо migrations",
            ]}
            correctIndex={0}
            explanation={
              "Текущий результат ограничен инфраструктурой и connectivity."
            }
          />
        </div>

        <KeyTakeaways
          points={[
            <>
              {"Redis запускается отдельным service на внутреннем port 6379."}
            </>,
            <>{"API использует REDIS_URL с hostname redis."}</>,
            <>{"PING/PONG подтверждает connectivity."}</>,
            <>{"PostgreSQL остаётся источником истины."}</>,
            <>
              {"TTL изучается на диагностическом key, а не на бизнес-данных."}
            </>,
            <>
              {"Критичность Redis для readiness зависит от текущего use case."}
            </>,
            <>{"Добавление инфраструктуры не обязано менять HTTP-контракт."}</>,
          ]}
        />

        <PracticeCta
          text={
            "Добавьте service redis и healthcheck, выполните ping из redis-container и из API-кода, проведите SETEX/TTL эксперимент и реализуйте диагностический dependency status, где PostgreSQL обязателен, а Redis пока отображается как optional/degraded."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 182. Полный local stack и сценарии восстановления
export function Lesson182({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Полный local stack и сценарии восстановления"}
        intro={
          "Соберём финальный Compose stack Deployable StudyHub: одна команда поднимает db, migrations, API и Redis, а README и runbook помогают другому разработчику проверить health, найти сбой и безопасно восстановить окружение."
        }
        tags={[
          { icon: <Workflow size={14} />, label: "единый startup route" },
          { icon: <RefreshCcw size={14} />, label: "восстановление среды" },
        ]}
      />
      <TheoryBridge lesson={182} />

      <Section number={"01"} title={"Финальная topology Deployable StudyHub"}>
        <Lead>
          {
            "Рабочий stack состоит из четырёх ролей: db хранит истину, migrate приводит schema к head, api обслуживает HTTP, redis предоставляет будущую временную инфраструктуру. Compose network и environment связывают роли, но не смешивают их обязанности."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Подготовить:</strong> скопировать .env.example и заполнить
              local values
            </li>
            <li>
              <strong>Поднять:</strong> выполнить docker compose up --build -d
            </li>
            <li>
              <strong>Проверить:</strong> прочитать ps, health, migrations и
              smoke request
            </li>
            <li>
              <strong>Восстановить:</strong> пройти runbook для типового сбоя
              или reset
            </li>
          </ol>
          <p>
            Результат — quick start, который выполняется другим человеком без
            устных инструкций автора.
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "Готовность блока доказывает не красивый YAML, а воспроизводимый путь clone → configure → up → migrate → ready → API scenario."
          }
        </Callout>
      </Section>

      <Section
        number={"02"}
        title={"Полный compose.yaml и контракт .env.example"}
      >
        <Lead>
          {
            "Финальный файл соединяет уже изученные части. Важно читать его по services и зависимостям, а не как длинный набор ключей."
          }
        </Lead>

        <CodeBlock
          caption={"финальный Compose stack"}
          code={`services:
          db:
            image: postgres:16-alpine
            env_file: .env
            volumes:
              - postgres_data:/var/lib/postgresql/data
            healthcheck:
              test: ["CMD-SHELL", "pg_isready -U studyhub -d studyhub"]
              interval: 5s
              timeout: 3s
              retries: 10
        
          migrate:
            build: .
            command: alembic upgrade head
            env_file: .env
            depends_on:
              db:
                condition: service_healthy
        
          redis:
            image: redis:7-alpine
            healthcheck:
              test: ["CMD", "redis-cli", "ping"]
              interval: 5s
              timeout: 3s
              retries: 10
        
          api:
            build: .
            env_file: .env
            ports:
              - "8000:8000"
            depends_on:
              migrate:
                condition: service_completed_successfully
            healthcheck:
              test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')"]
              interval: 10s
              timeout: 3s
              retries: 5
        
        volumes:
          postgres_data:`}
        />

        <MethodGrid
          rows={[
            ["db", "постоянные relational data и readiness"],
            ["migrate", "one-shot применение Alembic revisions"],
            ["api", "HTTP process и application health"],
            ["redis", "временная инфраструктура и connectivity"],
            ["postgres_data", "жизненный цикл data отдельно от container"],
          ]}
        />

        <Lead>
          {
            "Quick start начинается с полного списка необходимых variables. .env.example содержит названия и безопасные placeholders, а локальный .env — реальные значения и исключается через .gitignore."
          }
        </Lead>

        <CodeBlock
          caption={"контракт local config"}
          code={`# .env.example
        APP_ENV=development
        LOG_LEVEL=INFO
        POSTGRES_USER=studyhub
        POSTGRES_PASSWORD=change-me
        POSTGRES_DB=studyhub
        DATABASE_URL=postgresql+asyncpg://studyhub:change-me@db:5432/studyhub
        REDIS_URL=redis://redis:6379/0
        SECRET_KEY=replace-with-local-secret`}
        />

        <FlipCards
          cards={[
            {
              front: ".env.example",
              back: "Коммитится: имена variables и безопасные placeholders.",
            },
            {
              front: ".env",
              back: "Не коммитится: локальные passwords и secret key.",
            },
            {
              front: "compose.yaml",
              back: "Коммитится: topology, healthchecks и dependencies.",
            },
            {
              front: "postgres_data",
              back: "Не является файлом репозитория: управляется Docker volume.",
            },
          ]}
        />
      </Section>

      <Section number={"03"} title={"Quick start из чистой директории"}>
        <Lead>
          {
            "Проверка выполняется как новый разработчик: clone, создание .env, build/up, ожидание health, smoke request и чтение Swagger. Нельзя опираться на уже запущенные local processes или старый volume без явного решения."
          }
        </Lead>

        <CodeSequence
          title={"Соберите README Quick Start"}
          prompt={"Расположите команды в воспроизводимом порядке."}
          pieces={[
            { id: "clone", code: "git clone <repo> && cd studyhub" },
            { id: "env", code: "cp .env.example .env" },
            { id: "edit", code: "заполнить local secrets" },
            { id: "up", code: "docker compose up --build -d" },
            { id: "ps", code: "docker compose ps" },
            { id: "smoke", code: "curl -f http://localhost:8000/health" },
            { id: "docs", code: "открыть http://localhost:8000/docs" },
          ]}
          correctOrder={["clone", "env", "edit", "up", "ps", "smoke", "docs"]}
          explanation={
            "Quick start сначала создаёт конфигурацию, затем stack и только после health выполняет пользовательскую проверку."
          }
        />
      </Section>

      <Section
        number={"04"}
        title={"Панель состояния и logs нескольких services"}
      >
        <Lead>
          {
            "Диагностика начинается со сводной панели. Статус db healthy, migrate exited 0, redis healthy и api healthy описывает успешный startup. Любое отклонение направляет к logs конкретного service."
          }
        </Lead>

        <TerminalDemo
          title={"операционная проверка"}
          lines={[
            { cmd: `docker compose ps -a` },
            {
              out: `db        Up (healthy)
        migrate   Exited (0)
        redis     Up (healthy)
        api       Up (healthy)`,
            },
            { cmd: `docker compose logs --tail=50 db migrate api redis` },
            {
              out: `db | ready to accept connections
        migrate | upgrade complete
        redis | Ready to accept connections
        api | Application startup complete`,
            },
            { cmd: `curl -f http://localhost:8000/ready` },
            { out: `{"status":"ready","database":"ok","redis":"ok"}` },
          ]}
        />

        <Callout>
          {
            "Exited (0) для migrate является успешным конечным состоянием, а не падением long-running service."
          }
        </Callout>
      </Section>

      <Section number={"05"} title={"Диагностическое дерево типовых сбоев"}>
        <Lead>
          {
            "Runbook должен начинаться с наблюдаемого симптома. API отсутствует в ps — читайте api logs. API ждёт migrate — читайте migrate logs. Migrate ждёт db — проверяйте db health. HTTP не открывается при healthy API — проверяйте published port."
          }
        </Lead>

        <BranchExplorer
          code={`api missing or exited
          -> docker compose logs api
        api waiting for migrate
          -> docker compose logs migrate
        migrate waiting for db
          -> docker compose ps db
        all healthy, HTTP unavailable
          -> check ports and host conflict`}
          scenarios={[
            {
              label: "API exited",
              activeLine: 1,
              output: "проверить CMD, config и traceback",
            },
            {
              label: "migrate failed",
              activeLine: 3,
              output: "проверить revision и DATABASE_URL",
            },
            {
              label: "db unhealthy",
              activeLine: 5,
              output: "проверить POSTGRES_* и volume",
            },
            {
              label: "port conflict",
              activeLine: 7,
              output: "сменить host port или остановить другой process",
            },
          ]}
        />
      </Section>

      <Section
        number={"06"}
        title={"Восстановление после четырёх намеренных ошибок"}
      >
        <Lead>
          {
            "Финальная практика должна включать не только success. Воспроизведите неверный password, конфликт host port, сломанную migration и устаревший local volume с другой начальной конфигурацией."
          }
        </Lead>

        <BugHunt
          code={`POSTGRES_PASSWORD=new-password
        DATABASE_URL=postgresql+asyncpg://studyhub:new-password@db:5432/studyhub
        
        # postgres_data уже создан со старым password`}
          question={
            "Почему изменение POSTGRES_PASSWORD не меняет существующую роль?"
          }
          options={[
            "Init variables применяются при создании нового cluster, а volume уже содержит старый cluster",
            "Compose не передаёт environment в db",
            "Asyncpg всегда кеширует password навсегда",
          ]}
          correctIndex={0}
          explanation={
            "Существующий volume сохраняет созданные credentials; нужно использовать прежний password, изменить роль SQL-командой или выполнить осознанный reset."
          }
          fix={`Согласовать действующий password или сделать backup → down -v → up на чистом volume`}
        />

        <Callout>
          {
            "Не используйте down -v как универсальное лечение. Сначала установите, можно ли удалить local data, и при необходимости сделайте dump."
          }
        </Callout>
      </Section>

      <Section number={"07"} title={"README, reset и финальный smoke scenario"}>
        <Lead>
          {
            "README завершает блок конкретными командами: quick start, status, logs, stop, reset и backup. Smoke scenario проверяет создание и чтение задачи, затем restart stack и повторное чтение той же записи."
          }
        </Lead>

        <CompareSolutions
          question={"Какой README помогает новому разработчику?"}
          left={{
            title: "Только одна команда",
            code: `docker compose up`,
            note: "Не описаны config, health, migrations, stop и диагностика.",
          }}
          right={{
            title: "Проверяемая процедура",
            code: `cp .env.example .env
        docker compose up --build -d
        docker compose ps
        curl -f localhost:8000/ready`,
            note: "Есть подготовка, запуск и наблюдаемый критерий успеха.",
          }}
          preferred={"right"}
          explanation={
            "Quick start обязан сообщать не только действие, но и способ доказать успешный результат."
          }
        />

        <RecallCard
          question={
            "Как доказать, что local stack действительно воспроизводим?"
          }
          hint={
            "Нужен внешний проверяющий сценарий, а не только запуск у автора."
          }
          answer={
            <p>
              {
                "Другой человек поднимает его из чистой директории по README, получает healthy services, выполняет API smoke scenario, перезапускает stack и сохраняет database data."
              }
            </p>
          }
        />
      </Section>

      <Section
        number={"08"}
        title={"Контрольная точка: Deployable StudyHub local stack"}
      >
        <Lead>
          {
            "Закрепите не команды сами по себе, а причинную модель: какой service запускается, какую dependency ожидает, где находится состояние и каким наблюдаемым сигналом подтверждается готовность."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Какое состояние migrate является успешным?"}
            options={["Exited (0)", "Up forever", "Unhealthy"]}
            correctIndex={0}
            explanation={
              "One-shot migration service должен завершиться с code 0."
            }
          />
          <QuizCard
            question={"Что проверяют после docker compose up?"}
            options={[
              "ps, logs, health и smoke request",
              "Только наличие compose.yaml",
              "Только размер image",
            ]}
            correctIndex={0}
            explanation={
              "Воспроизводимость доказывается наблюдаемыми состояниями и сценарием API."
            }
          />
          <QuizCard
            question={"Когда допустим down -v?"}
            options={[
              "При осознанном reset после решения о данных и backup",
              "При любой ошибке connection",
              "При обычной остановке каждый вечер",
            ]}
            correctIndex={0}
            explanation={
              "Команда удаляет local database volume и должна быть явно разрушительной."
            }
          />
          <QuizCard
            question={"Что остаётся границей блока?"}
            options={[
              "Production deployment",
              "Compose network",
              "PostgreSQL healthcheck",
            ]}
            correctIndex={0}
            explanation={
              "Remote deployment и CI/CD изучаются в следующем блоке."
            }
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Финальный stack разделяет db, migrate, api и redis."}</>,
            <>
              {
                "Одна команда запуска не отменяет подготовку .env и проверку результата."
              }
            </>,
            <>{"Migrate успешно завершается с exit code 0."}</>,
            <>
              {"Compose ps и service logs образуют первую линию диагностики."}
            </>,
            <>
              {"Quick start проверяется из чистой директории другим человеком."}
            </>,
            <>{"Reset с down -v требует осознанного решения и backup."}</>,
            <>{"Production deployment остаётся задачей следующего блока."}</>,
          ]}
        />

        <PracticeCta
          text={
            "Проведите чистую проверку блока: скопируйте проект в новую директорию, создайте .env, поднимите stack одной командой, дождитесь healthy, выполните CRUD smoke scenario, перезапустите stack и подтвердите persistence. Затем воспроизведите один сбой и восстановите систему строго по runbook."
          }
        />
      </Section>
    </RichLesson>
  );
}

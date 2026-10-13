import { Boxes, Network } from "lucide-react";
import { Callout, CodeBlock, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 31 · Docker Compose: API, PostgreSQL и Redis";

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
      <TheoryBridge link={"В блоке 30 один FastAPI-container уже собирается и отвечает на запросы. Теперь нужно воспроизводимо запускать несколько связанных процессов без длинной последовательности docker run."} boundary={"Compose не превращает containers в один процесс и не заменяет Dockerfile. Он описывает, какие отдельные services запустить и как связать их конфигурацией и сетью."} />

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

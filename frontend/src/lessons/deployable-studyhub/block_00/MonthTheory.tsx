import { Container, Workflow } from "lucide-react";
import { BranchExplorer, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TrueFalse, TypeCard, TypeCards } from "../../shared";

export function MonthTheory() {
  return (
    <RichLesson>
      <RichHero
        variant={"project"}
        chip={"ЭТАП 8 · общая теория"}
        title={"Docker, CI/CD и стабильный backend-релиз"}
        intro={"Единая модель этапа: source превращается в immutable image, configuration передаётся при запуске, Compose соединяет services, CI доказывает качество commit, CD доставляет exact artifact, а probes, smoke test и rollback управляют release."}
        tags={[
          {
            icon: <Container size={14} />,
            label: "Docker и Compose",
          },
          {
            icon: <Workflow size={14} />,
            label: "CI/CD и rollback",
          },
        ]}
      />

      <Section number={"01"} title={"Единая модель: artifact, configuration и running process"}>
        <Lead>
          {"Один и тот же исходный код проходит несколько форм: repository хранит source, Docker image фиксирует runtime artifact, environment задаёт configuration, а container запускает конкретный process. Эти роли нельзя смешивать без потери воспроизводимости."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Source:"}</strong>
              {" Python-код, dependency-файлы, migrations и infrastructure descriptions в Git."}
            </li>
            <li>
              <strong>{"Build:"}</strong>
              {" Dockerfile превращает source и dependencies в immutable image."}
            </li>
            <li>
              <strong>{"Configuration:"}</strong>
              {" environment values определяют database URL, secrets и runtime mode."}
            </li>
            <li>
              <strong>{"Run:"}</strong>
              {" container создаёт process из image с конкретной configuration."}
            </li>
            <li>
              <strong>{"Observe:"}</strong>
              {" logs, health и readiness показывают состояние процесса и dependencies."}
            </li>
            <li>
              <strong>{"Release:"}</strong>
              {" traceable tag и deployment record связывают production с commit."}
            </li>
          </ol>
          <p>
            {"Профессиональная граница проста: source и Dockerfile меняют artifact; environment меняет запуск; ручное редактирование running container не меняет воспроизводимый проект."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"repository"}</>,
              <>{"история source и infrastructure definitions"}</>,
            ],
            [
              <>{"Dockerfile"}</>,
              <>{"рецепт build"}</>,
            ],
            [
              <>{"image"}</>,
              <>{"versioned immutable artifact"}</>,
            ],
            [
              <>{"environment"}</>,
              <>{"runtime configuration"}</>,
            ],
            [
              <>{"container"}</>,
              <>{"isolated running instance"}</>,
            ],
            [
              <>{"process"}</>,
              <>{"Uvicorn/FastAPI, который принимает traffic"}</>,
            ],
            [
              <>{"release"}</>,
              <>{"artifact + config + verification record"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"путь версии"}
          code={"Git commit\n→ Docker build\n→ image digest/tag\n→ registry\n→ deployment environment\n→ container\n→ Uvicorn process\n→ health/readiness\n→ HTTP traffic"}
        />

        <MatchPairs
          prompt={"Соедините сущность с тем, что в ней должно изменяться."}
          leftTitle={"Сущность"}
          rightTitle={"Что хранит"}
          pairs={[
            {
              left: "Git commit",
              right: "версию source и infrastructure files",
            },
            {
              left: "Docker image",
              right: "runtime filesystem и command",
            },
            {
              left: "Environment",
              right: "database URL, secret key и mode",
            },
            {
              left: "Container",
              right: "один запущенный экземпляр image",
            },
            {
              left: "Volume",
              right: "persistent data вне container filesystem",
            },
            {
              left: "Release record",
              right: "точный artifact и результат проверки",
            },
          ]}
          explanation={"Ясные границы позволяют менять config без rebuild и обновлять artifact без копирования secrets."}
        />

        <TypeCards>
          <TypeCard
            badge={"source"}
            title={"Commit"}
            code={"git rev-parse HEAD"}
          >
            {"Называет точное состояние repository."}
          </TypeCard>
          <TypeCard
            badge={"artifact"}
            badgeTone={"float"}
            title={"Image"}
            code={"studyhub:<sha>"}
          >
            {"Собран один раз и используется одинаково в разных environments."}
          </TypeCard>
          <TypeCard
            badge={"config"}
            badgeTone={"str"}
            title={"Environment"}
            code={"DATABASE_URL / SECRET_KEY"}
          >
            {"Передаётся при запуске и отличается между dev, test и prod."}
          </TypeCard>
          <TypeCard
            badge={"runtime"}
            title={"Container process"}
            code={"uvicorn app.main:app"}
          >
            {"Фактически обслуживает requests и оставляет logs."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Изменить config без rebuild"}</h3>
          <p>
            {"Запустить один image с двумя значениями APP_ENV."}
          </p>

          <h3>{"Изменить source"}</h3>
          <p>
            {"Собрать новый tag, не переиспользуя старое имя версии."}
          </p>

          <h3>{"Проверить digest"}</h3>
          <p>
            {"Убедиться, что deployment использует ожидаемый artifact."}
          </p>

          <h3>{"Не править container вручную"}</h3>
          <p>
            {"Все изменения переносить в source, Dockerfile или config contract."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Immutable artifact означает, что одна версия image не изменяется между environments. Меняются только runtime configuration и external services."}
        </Callout>

        <Callout tone={"warn"}>
          {"Хранение secret внутри image делает его частью layers и истории registry даже после удаления исходного файла."}
        </Callout>

      </Section>

      <Section number={"02"} title={"Linux process, signals и наблюдаемость"}>
        <Lead>
          {"FastAPI в production остаётся операционным process. Он получает environment, слушает socket, пишет в stdout/stderr и должен корректно реагировать на shutdown signal. Docker не отменяет эту модель, а только задаёт её границы."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Start:"}</strong>
              {" command создаёт process с PID и environment."}
            </li>
            <li>
              <strong>{"Listen:"}</strong>
              {" Uvicorn привязывается к host и port."}
            </li>
            <li>
              <strong>{"Serve:"}</strong>
              {" event loop принимает requests и использует dependencies."}
            </li>
            <li>
              <strong>{"Log:"}</strong>
              {" структурированные события уходят в stdout/stderr."}
            </li>
            <li>
              <strong>{"Probe:"}</strong>
              {" health/readiness сообщают внешней системе ограниченное состояние."}
            </li>
            <li>
              <strong>{"Stop:"}</strong>
              {" SIGTERM запускает graceful shutdown и закрытие resources."}
            </li>
          </ol>
          <p>
            {"Процесс считается управляемым, когда его можно однозначно запустить, наблюдать, проверить готовность и завершить без потери незавершённых операций."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"PID"}</>,
              <>{"идентификатор running instance"}</>,
            ],
            [
              <>{"socket"}</>,
              <>{"host и port для network traffic"}</>,
            ],
            [
              <>{"stdout"}</>,
              <>{"обычные application events"}</>,
            ],
            [
              <>{"stderr"}</>,
              <>{"error diagnostics и traceback"}</>,
            ],
            [
              <>{"SIGTERM"}</>,
              <>{"запрос штатного завершения"}</>,
            ],
            [
              <>{"lifespan"}</>,
              <>{"startup/shutdown resources приложения"}</>,
            ],
            [
              <>{"request id"}</>,
              <>{"корреляция событий одного request"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"жизненный цикл процесса"}
          code={"command\n→ process starts\n→ load Settings\n→ open application resources\n→ bind port\n→ readiness=true\n→ serve requests\n→ SIGTERM\n→ readiness=false\n→ finish in-flight work\n→ close resources\n→ exit code 0"}
        />

        <BranchExplorer
          code={"process start\nconfiguration valid\nport bound\nreadiness true\nSIGTERM received\nresources closed\nprocess exited"}
          scenarios={[
            {
              label: "missing secret",
              activeLine: 1,
              output: "fail fast before accepting traffic",
            },
            {
              label: "port occupied",
              activeLine: 2,
              output: "process exits with bind error",
            },
            {
              label: "database unavailable",
              activeLine: 3,
              output: "health may be live, readiness remains false",
            },
            {
              label: "normal shutdown",
              activeLine: 4,
              output: "stop traffic, close resources, exit cleanly",
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"live"}
            title={"Liveness"}
            code={"/health"}
          >
            {"Процесс отвечает и основной loop не завис."}
          </TypeCard>
          <TypeCard
            badge={"ready"}
            badgeTone={"float"}
            title={"Readiness"}
            code={"/ready"}
          >
            {"Критические dependencies доступны для meaningful traffic."}
          </TypeCard>
          <TypeCard
            badge={"trace"}
            badgeTone={"str"}
            title={"Structured log"}
            code={"request_id + operation + status"}
          >
            {"Позволяет расследовать flow без случайных print."}
          </TypeCard>
          <TypeCard
            badge={"stop"}
            title={"Graceful shutdown"}
            code={"SIGTERM → cleanup"}
          >
            {"Закрывает clients, database pool и незавершённые resources."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Сравнить health и ready"}</h3>
          <p>
            {"Смоделировать живой process с недоступной database."}
          </p>

          <h3>{"Отследить request"}</h3>
          <p>
            {"Найти все события по одному request id."}
          </p>

          <h3>{"Послать SIGTERM"}</h3>
          <p>
            {"Проверить порядок shutdown logs."}
          </p>

          <h3>{"Проверить exit code"}</h3>
          <p>
            {"Отличить controlled stop от startup failure."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Readiness может временно стать false, не завершая process. Это сигнал не направлять новый traffic, пока dependency восстанавливается."}
        </Callout>

        <Callout tone={"warn"}>
          {"Пароли, access tokens, cookies и secret keys не являются диагностическими полями и не должны появляться в logs."}
        </Callout>

      </Section>

      <Section number={"03"} title={"Docker build: context, layers и cache"}>
        <Lead>
          {"Docker build последовательно выполняет инструкции и создаёт layers. Cache зависит от текста инструкции и её inputs. Поэтому порядок COPY определяет, будет ли изменение одного Python-файла снова устанавливать все dependencies."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Context:"}</strong>
              {" Docker получает только файлы из выбранной build directory."}
            </li>
            <li>
              <strong>{"Ignore:"}</strong>
              {" .dockerignore удаляет лишнее до передачи context daemon."}
            </li>
            <li>
              <strong>{"Instruction:"}</strong>
              {" FROM, COPY, RUN и metadata создают последовательность build steps."}
            </li>
            <li>
              <strong>{"Layer:"}</strong>
              {" результат шага становится основой следующего."}
            </li>
            <li>
              <strong>{"Cache:"}</strong>
              {" неизменившаяся инструкция и inputs могут переиспользовать результат."}
            </li>
            <li>
              <strong>{"Invalidate:"}</strong>
              {" изменение раннего layer заставляет перестроить все последующие."}
            </li>
          </ol>
          <p>
            {"Эффективный Dockerfile сначала копирует редкие dependency inputs, затем устанавливает packages и только после этого копирует часто меняющийся source."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"build context"}</>,
              <>{"доступные COPY files"}</>,
            ],
            [
              <>{".dockerignore"}</>,
              <>{"исключение secrets, caches и history"}</>,
            ],
            [
              <>{"layer"}</>,
              <>{"filesystem delta отдельной инструкции"}</>,
            ],
            [
              <>{"cache hit"}</>,
              <>{"готовый layer переиспользован"}</>,
            ],
            [
              <>{"cache miss"}</>,
              <>{"инструкция выполняется заново"}</>,
            ],
            [
              <>{"RUN"}</>,
              <>{"build-time command"}</>,
            ],
            [
              <>{"CMD"}</>,
              <>{"default runtime command"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"типичный cache path"}
          code={"COPY requirements.txt\n→ RUN pip install\n→ COPY app/\n→ code changed\n→ first two layers cache hit\n→ only source layer rebuilt"}
        />

        <StepThrough
          code={"FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY app ./app\nCMD [\"uvicorn\", \"app.main:app\"]"}
          steps={[
            {
              line: 0,
              note: "Base image задаёт начальный filesystem.",
              vars: {
                "layer": "base",
              },
            },
            {
              line: 1,
              note: "WORKDIR меняет default directory следующих instructions.",
              vars: {
                "cwd": "/app",
              },
            },
            {
              line: 2,
              note: "Dependency file копируется отдельно.",
              vars: {
                "input": "requirements.txt",
              },
            },
            {
              line: 3,
              note: "Дорогая установка кешируется пока dependency file не меняется.",
              vars: {
                "cache": "reusable",
              },
            },
            {
              line: 4,
              note: "Source копируется поздним часто меняющимся layer.",
              vars: {
                "source": "changed often",
              },
            },
            {
              line: 5,
              note: "CMD не выполняется при build; это default command будущего container.",
              vars: {
                "runtime": "uvicorn",
              },
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"input"}
            title={"Context"}
            code={"docker build ."}
          >
            {"Точка означает directory, содержимое которой доступно COPY."}
          </TypeCard>
          <TypeCard
            badge={"filter"}
            badgeTone={"float"}
            title={".dockerignore"}
            code={".git / .env / __pycache__"}
          >
            {"Уменьшает context и предотвращает случайную утечку."}
          </TypeCard>
          <TypeCard
            badge={"cache"}
            badgeTone={"str"}
            title={"Stable layers first"}
            code={"dependencies before source"}
          >
            {"Сокращает время повторной сборки."}
          </TypeCard>
          <TypeCard
            badge={"runtime"}
            title={"CMD"}
            code={"JSON-array form"}
          >
            {"Определяет process, который container запускает по умолчанию."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Измерить context"}</h3>
          <p>
            {"Сравнить размер до и после .dockerignore."}
          </p>

          <h3>{"Изменить source"}</h3>
          <p>
            {"Наблюдать cache hit dependency layer."}
          </p>

          <h3>{"Изменить requirements"}</h3>
          <p>
            {"Увидеть ожидаемый cache miss install layer."}
          </p>

          <h3>{"Проверить secrets"}</h3>
          <p>
            {"Убедиться, что .env не доступен ни COPY, ни final image."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Cache является оптимизацией build, а не гарантией correctness. Dockerfile обязан собираться и с чистым cache."}
        </Callout>

        <Callout tone={"warn"}>
          {"Удаление secret в следующем RUN не удаляет его из предыдущего image layer. Secret нельзя копировать в context или image изначально."}
        </Callout>

      </Section>

      <Section number={"04"} title={"Compose networking, volumes и readiness"}>
        <Lead>
          {"Compose создаёт отдельные containers и общую internal network. Каждый service имеет собственный localhost. Для связи используется service name, persistent data выносится в volume, а readiness проверяется отдельно от порядка создания containers."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Create network:"}</strong>
              {" Compose назначает services внутренние DNS-names."}
            </li>
            <li>
              <strong>{"Start database:"}</strong>
              {" PostgreSQL слушает db:5432 внутри network."}
            </li>
            <li>
              <strong>{"Attach volume:"}</strong>
              {" database files сохраняются в named volume."}
            </li>
            <li>
              <strong>{"Run migrations:"}</strong>
              {" schema доводится до Alembic head."}
            </li>
            <li>
              <strong>{"Start API:"}</strong>
              {" DATABASE_URL указывает на hostname db."}
            </li>
            <li>
              <strong>{"Check readiness:"}</strong>
              {" traffic разрешается после database и application probes."}
            </li>
          </ol>
          <p>
            {"Compose описывает желаемую локальную систему, но приложение всё равно обязано корректно переживать временную неготовность dependencies."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"service name"}</>,
              <>{"DNS hostname внутри Compose network"}</>,
            ],
            [
              <>{"localhost"}</>,
              <>{"текущий container, а не соседний service"}</>,
            ],
            [
              <>{"container port"}</>,
              <>{"port process внутри network"}</>,
            ],
            [
              <>{"published port"}</>,
              <>{"доступ с host machine"}</>,
            ],
            [
              <>{"named volume"}</>,
              <>{"persistent filesystem для database"}</>,
            ],
            [
              <>{"healthcheck"}</>,
              <>{"наблюдаемая проверка service state"}</>,
            ],
            [
              <>{"migration job"}</>,
              <>{"одноразовый schema operation"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"адреса внутри и снаружи"}
          code={"host browser → localhost:8000 → api:8000\napi container → db:5432\napi container → redis:6379\nPostgreSQL files → named volume pgdata"}
        />

        <TrueFalse
          statement={
            <>
              {"API-container должен подключаться к PostgreSQL по localhost:5432, потому что оба services запущены одной Compose-командой."}
            </>
          }
          isTrue={false}
          explanation={"У каждого container собственный network namespace. Соседний PostgreSQL доступен по service name db."}
        />

        <TypeCards>
          <TypeCard
            badge={"dns"}
            title={"Service discovery"}
            code={"db / redis / api"}
          >
            {"Compose network разрешает имена services во внутренние addresses."}
          </TypeCard>
          <TypeCard
            badge={"storage"}
            badgeTone={"float"}
            title={"Named volume"}
            code={"pgdata:/var/lib/postgresql/data"}
          >
            {"Сохраняет database state после recreate container."}
          </TypeCard>
          <TypeCard
            badge={"probe"}
            badgeTone={"str"}
            title={"Healthcheck"}
            code={"pg_isready"}
          >
            {"Проверяет способность database принимать connections."}
          </TypeCard>
          <TypeCard
            badge={"schema"}
            title={"Migration service"}
            code={"alembic upgrade head"}
          >
            {"Отдельно обновляет schema перед использованием API."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Проверить DNS"}</h3>
          <p>
            {"Из API-container обратиться к hostname db."}
          </p>

          <h3>{"Пересоздать db-container"}</h3>
          <p>
            {"Проверить сохранение rows в named volume."}
          </p>

          <h3>{"Удалить volume"}</h3>
          <p>
            {"Осознанно получить clean database и восстановить schema migrations."}
          </p>

          <h3>{"Сломать healthcheck"}</h3>
          <p>
            {"Увидеть отличие running container и unhealthy service."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Port mapping нужен для доступа host → container. Между services используется internal container port и DNS-name."}
        </Callout>

        <Callout tone={"warn"}>
          {"Удаление Compose stack с volumes является разрушительной операцией для local data. Команда должна быть явно документирована как reset."}
        </Callout>

      </Section>

      <Section number={"05"} title={"CI pipeline как автоматический договор качества"}>
        <Lead>
          {"Continuous Integration повторяет локально понятные команды на независимом runner. Каждый gate отвечает на отдельный вопрос и прекращает pipeline при нарушении договора."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Trigger:"}</strong>
              {" push или pull_request создаёт workflow run."}
            </li>
            <li>
              <strong>{"Checkout:"}</strong>
              {" runner получает конкретный commit."}
            </li>
            <li>
              <strong>{"Setup:"}</strong>
              {" устанавливает Python и dependencies."}
            </li>
            <li>
              <strong>{"Static gates:"}</strong>
              {" formatter и linter проверяют форму и очевидные дефекты."}
            </li>
            <li>
              <strong>{"Behavior gates:"}</strong>
              {" unit и integration tests проверяют контракт."}
            </li>
            <li>
              <strong>{"Database gate:"}</strong>
              {" PostgreSQL ready, migrations применяются на clean schema."}
            </li>
            <li>
              <strong>{"Artifact gate:"}</strong>
              {" image собирается только после зелёных проверок."}
            </li>
          </ol>
          <p>
            {"Pipeline полезен, когда локальный разработчик может выполнить те же команды и получить тот же failure. YAML не должен скрывать магию."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"workflow"}</>,
              <>{"pipeline definition"}</>,
            ],
            [
              <>{"event"}</>,
              <>{"условие запуска"}</>,
            ],
            [
              <>{"runner"}</>,
              <>{"чистая execution machine"}</>,
            ],
            [
              <>{"job"}</>,
              <>{"логическая группа steps"}</>,
            ],
            [
              <>{"step"}</>,
              <>{"одна command или action"}</>,
            ],
            [
              <>{"service container"}</>,
              <>{"временная PostgreSQL для tests"}</>,
            ],
            [
              <>{"artifact"}</>,
              <>{"результат build после gates"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"quality gates"}
          code={"checkout exact commit\n→ install\n→ format --check\n→ lint\n→ unit tests\n→ PostgreSQL ready\n→ alembic upgrade head\n→ integration tests\n→ build image\n→ container smoke test"}
        />

        <CodeSequence
          title={"Соберите минимальный CI pipeline"}
          prompt={"Расположите gates от быстрых и дешёвых к более интеграционным."}
          pieces={[
            {
              id: "checkout",
              code: "checkout commit",
            },
            {
              id: "setup",
              code: "setup Python and install dependencies",
            },
            {
              id: "format",
              code: "formatter --check",
            },
            {
              id: "lint",
              code: "linter",
            },
            {
              id: "unit",
              code: "unit tests",
            },
            {
              id: "db",
              code: "start PostgreSQL and apply migrations",
            },
            {
              id: "integration",
              code: "integration tests",
            },
            {
              id: "image",
              code: "build and smoke-test image",
            },
          ]}
          correctOrder={[
            "checkout",
            "setup",
            "format",
            "lint",
            "unit",
            "db",
            "integration",
            "image",
          ]}
          explanation={"Быстрые gates раньше дают ранний feedback, а expensive integration начинается только после базовой корректности."}
        />

        <TypeCards>
          <TypeCard
            badge={"fast"}
            title={"Format check"}
            code={"ruff format --check"}
          >
            {"Быстро останавливает очевидно неоформленный commit."}
          </TypeCard>
          <TypeCard
            badge={"static"}
            badgeTone={"float"}
            title={"Lint"}
            code={"ruff check"}
          >
            {"Находит класс ошибок без запуска приложения."}
          </TypeCard>
          <TypeCard
            badge={"behavior"}
            badgeTone={"str"}
            title={"Tests"}
            code={"pytest"}
          >
            {"Проверяет контракт функций, API и database flows."}
          </TypeCard>
          <TypeCard
            badge={"artifact"}
            title={"Image build"}
            code={"docker build"}
          >
            {"Доказывает, что проверенный commit превращается в deployable runtime."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Запустить локально"}</h3>
          <p>
            {"Все команды pipeline должны быть доступны разработчику до push."}
          </p>

          <h3>{"Сломать один gate"}</h3>
          <p>
            {"Прочитать первый failure и annotations."}
          </p>

          <h3>{"Проверить clean migration"}</h3>
          <p>
            {"Не использовать уже подготовленную local database."}
          </p>

          <h3>{"Smoke-test image"}</h3>
          <p>
            {"Запустить собранный container и проверить /health."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Fail fast означает остановить pipeline на первом надёжном нарушении, а не скрыть остальные потенциальные ошибки."}
        </Callout>

        <Callout tone={"warn"}>
          {"CI не должен подключаться к production database или использовать production secrets."}
        </Callout>

      </Section>

      <Section number={"06"} title={"CD: versioned artifact, secrets и deployment"}>
        <Lead>
          {"Continuous Delivery начинается после зелёного CI. Проверенный commit превращается в immutable image, публикуется с traceable tag и разворачивается с environment-specific configuration. Production не собирает исходный код заново другим способом."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Build once:"}</strong>
              {" создать image из проверенного commit."}
            </li>
            <li>
              <strong>{"Tag:"}</strong>
              {" назначить SHA и optional release version."}
            </li>
            <li>
              <strong>{"Publish:"}</strong>
              {" отправить artifact в registry."}
            </li>
            <li>
              <strong>{"Configure:"}</strong>
              {" передать production secrets и URLs отдельно."}
            </li>
            <li>
              <strong>{"Migrate:"}</strong>
              {" обновить schema до начала meaningful traffic."}
            </li>
            <li>
              <strong>{"Deploy:"}</strong>
              {" запустить конкретный exact tag."}
            </li>
            <li>
              <strong>{"Verify:"}</strong>
              {" выполнить health, readiness и smoke scenario."}
            </li>
          </ol>
          <p>
            {"Главное свойство release — прослеживаемость: разработчик может назвать commit, image tag, migration revision, configuration environment и результат post-deploy проверки."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"registry"}</>,
              <>{"хранилище versioned images"}</>,
            ],
            [
              <>{"SHA tag"}</>,
              <>{"связь image и commit"}</>,
            ],
            [
              <>{"release tag"}</>,
              <>{"человеческая версия поверх immutable artifact"}</>,
            ],
            [
              <>{"deployment secret"}</>,
              <>{"environment-specific confidential config"}</>,
            ],
            [
              <>{"migration revision"}</>,
              <>{"состояние database schema"}</>,
            ],
            [
              <>{"deployment record"}</>,
              <>{"кто, что, куда и когда развернул"}</>,
            ],
            [
              <>{"smoke test"}</>,
              <>{"краткий proof критического flow"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"release metadata"}
          code={"commit = a1b2c3d\nimage = registry/studyhub:a1b2c3d\nmigration = 8f41_add_course_status\nenvironment = production\nhealth = ok\nsmoke = login → create task → read task\nresult = released"}
        />

        <CompareSolutions
          question={"Какой deployment легче расследовать и откатить?"}
          left={{
            title: "Mutable latest",
            code: "deploy registry/studyhub:latest",
            note: "Имя не показывает, какой commit находится внутри сейчас.",
          }}
          right={{
            title: "Exact immutable tag",
            code: "deploy registry/studyhub:a1b2c3d",
            note: "Версия однозначно связана с commit и предыдущим known-good tag.",
          }}
          preferred={"right"}
          explanation={"Traceable artifact позволяет воспроизвести release, сравнить версии и выполнить rollback."}
        />

        <TypeCards>
          <TypeCard
            badge={"build"}
            title={"Build once"}
            code={"image from green commit"}
          >
            {"Один artifact проходит дальше по pipeline без пересборки."}
          </TypeCard>
          <TypeCard
            badge={"secret"}
            badgeTone={"float"}
            title={"Runtime config"}
            code={"secret store / env"}
          >
            {"Не попадает в image, repository или public logs."}
          </TypeCard>
          <TypeCard
            badge={"schema"}
            badgeTone={"str"}
            title={"Migration state"}
            code={"alembic current"}
          >
            {"Фиксируется вместе с release и проверяется до traffic."}
          </TypeCard>
          <TypeCard
            badge={"verify"}
            title={"Post-deploy check"}
            code={"health + smoke"}
          >
            {"Подтверждает не только process, но и ключевое поведение."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Собрать exact tag"}</h3>
          <p>
            {"Не переиспользовать имя старой версии."}
          </p>

          <h3>{"Проверить registry"}</h3>
          <p>
            {"Убедиться, что tag доступен до deployment."}
          </p>

          <h3>{"Передать secrets безопасно"}</h3>
          <p>
            {"Не печатать значения в workflow logs."}
          </p>

          <h3>{"Записать release metadata"}</h3>
          <p>
            {"Commit, image, migration и test result должны быть видимы."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Build once, deploy many уменьшает расхождение environments: меняется configuration, но не содержимое artifact."}
        </Callout>

        <Callout tone={"warn"}>
          {"Production migration требует отдельной проверки. Даже зелёный unit test не доказывает, что clean schema обновляется корректно."}
        </Callout>

      </Section>

      <Section number={"07"} title={"Smoke test и rollback как два обязательных пути"}>
        <Lead>
          {"Deployment не заканчивается запуском container. Smoke test проверяет небольшой критический пользовательский сценарий. Если он не проходит, команда не импровизирует, а возвращает известный working artifact по заранее описанной процедуре."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Deploy candidate:"}</strong>
              {" запустить exact image tag."}
            </li>
            <li>
              <strong>{"Check probes:"}</strong>
              {" health и readiness должны стать зелёными."}
            </li>
            <li>
              <strong>{"Check schema:"}</strong>
              {" migration revision соответствует release."}
            </li>
            <li>
              <strong>{"Run smoke:"}</strong>
              {" выполнить короткий end-to-end flow."}
            </li>
            <li>
              <strong>{"Decide:"}</strong>
              {" release success или rollback."}
            </li>
            <li>
              <strong>{"Rollback:"}</strong>
              {" развернуть previous known-good image и проверить снова."}
            </li>
            <li>
              <strong>{"Record:"}</strong>
              {" создать incident note и исправление отдельным commit."}
            </li>
          </ol>
          <p>
            {"Rollback считается готовым не тогда, когда он записан в документе, а когда учебная команда действительно выполнила его и повторила smoke test на восстановленной версии."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"candidate tag"}</>,
              <>{"новая версия для проверки"}</>,
            ],
            [
              <>{"known-good tag"}</>,
              <>{"последняя подтверждённая версия"}</>,
            ],
            [
              <>{"smoke scenario"}</>,
              <>{"короткий критический flow"}</>,
            ],
            [
              <>{"rollback command"}</>,
              <>{"возврат previous artifact"}</>,
            ],
            [
              <>{"data compatibility"}</>,
              <>{"способность старой версии работать с current schema"}</>,
            ],
            [
              <>{"incident note"}</>,
              <>{"симптом, root cause, action и prevention"}</>,
            ],
            [
              <>{"release decision"}</>,
              <>{"явное success или reverted"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"две ветки release"}
          code={"deploy candidate\n→ probes green\n→ smoke test\n├── passed → publish release notes\n└── failed → stop traffic to candidate\n              → deploy previous tag\n              → repeat probes and smoke\n              → record incident"}
        />

        <BranchExplorer
          code={"candidate deployed\nhealth green\nready green\nmigration verified\nsmoke passed\nrelease completed\nrollback previous tag\nsmoke restored"}
          scenarios={[
            {
              label: "полный успех",
              activeLine: 4,
              output: "release notes published",
            },
            {
              label: "health failed",
              activeLine: 1,
              output: "traffic не направляется, начинается rollback",
            },
            {
              label: "smoke failed",
              activeLine: 4,
              output: "candidate отклонён несмотря на green health",
            },
            {
              label: "rollback",
              activeLine: 6,
              output: "previous tag deployed and rechecked",
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"probe"}
            title={"Health"}
            code={"process and dependencies"}
          >
            {"Быстрая техническая проверка состояния."}
          </TypeCard>
          <TypeCard
            badge={"flow"}
            badgeTone={"float"}
            title={"Smoke test"}
            code={"critical API scenario"}
          >
            {"Проверяет реальное поведение, которое probes не покрывают."}
          </TypeCard>
          <TypeCard
            badge={"fallback"}
            badgeTone={"str"}
            title={"Known-good tag"}
            code={"previous immutable image"}
          >
            {"Доступен до начала release и готов к повторному deploy."}
          </TypeCard>
          <TypeCard
            badge={"learning"}
            title={"Incident note"}
            code={"symptom → cause → prevention"}
          >
            {"Превращает сбой в улучшение pipeline и runbook."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Составить короткий smoke"}</h3>
          <p>
            {"Не превращать его в полный test suite на production."}
          </p>

          <h3>{"Проверить rollback заранее"}</h3>
          <p>
            {"Не ждать реального инцидента для первой попытки."}
          </p>

          <h3>{"Учитывать schema compatibility"}</h3>
          <p>
            {"Не делать необратимую migration без release strategy."}
          </p>

          <h3>{"Повторить проверку после отката"}</h3>
          <p>
            {"Rollback не считается успешным без probes и smoke."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Healthcheck отвечает на техническое состояние, smoke test — на минимальный пользовательский контракт. Они дополняют, а не заменяют друг друга."}
        </Callout>

        <Callout tone={"warn"}>
          {"Rollback application image может быть невозможен после несовместимой destructive migration. Поэтому schema changes проектируются вместе с release strategy."}
        </Callout>

      </Section>

      <Section number={"08"} title={"Собранная теория Deployable StudyHub"}>
        <Lead>
          {"Вся теория этапа соединяется в один контур: source превращается в immutable artifact, runtime configuration передаётся отдельно, Compose воспроизводит систему локально, CI проверяет commit, CD разворачивает exact version, а probes, smoke test и rollback управляют release."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Source contract:"}</strong>
              {" repository содержит code, migrations и infrastructure definitions."}
            </li>
            <li>
              <strong>{"Artifact contract:"}</strong>
              {" image собирается из green commit и не хранит secrets."}
            </li>
            <li>
              <strong>{"Runtime contract:"}</strong>
              {" environment, network, volumes и process lifecycle заданы явно."}
            </li>
            <li>
              <strong>{"Data contract:"}</strong>
              {" PostgreSQL volume сохраняет rows, Alembic восстанавливает schema."}
            </li>
            <li>
              <strong>{"Quality contract:"}</strong>
              {" format, lint, tests и migrations являются gates."}
            </li>
            <li>
              <strong>{"Release contract:"}</strong>
              {" exact tag, probes, smoke и rollback фиксируются."}
            </li>
            <li>
              <strong>{"Human contract:"}</strong>
              {" README и runbooks позволяют другому человеку повторить систему."}
            </li>
          </ol>
          <p>
            {"Ученик готов к финальному LMS-этапу, когда инфраструктура перестаёт быть набором локальных исключений и становится частью проверяемой архитектуры проекта."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"source"}</>,
              <>{"что изменяем и review"}</>,
            ],
            [
              <>{"artifact"}</>,
              <>{"что доставляем"}</>,
            ],
            [
              <>{"config"}</>,
              <>{"что отличается между environments"}</>,
            ],
            [
              <>{"runtime"}</>,
              <>{"что реально выполняется"}</>,
            ],
            [
              <>{"data"}</>,
              <>{"что должно пережить recreate"}</>,
            ],
            [
              <>{"evidence"}</>,
              <>{"что доказывает correctness"}</>,
            ],
            [
              <>{"recovery"}</>,
              <>{"что делаем при failure"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"единый контур"}
          code={"developer commit\n→ pull request\n→ CI gates\n→ versioned Docker image\n→ registry\n→ deployment config + secrets\n→ migrations\n→ containers and volumes\n→ health/readiness\n→ smoke test\n→ release record\n→ rollback path"}
        />

        <RecallCard
          question={"Почему Deployable StudyHub нельзя свести к наличию Dockerfile?"}
          hint={"Назовите artifact, configuration, dependencies, checks, documentation и recovery."}
          answer={
            <p>
              {"Dockerfile создаёт только application image. Воспроизводимый release также требует environment contract, persistent database, migrations, networking, probes, CI gates, traceable tag, smoke test, rollback и инструкции запуска."}
            </p>
          }
        />

        <TypeCards>
          <TypeCard
            badge={"repeat"}
            title={"Reproducibility"}
            code={"clean checkout → same result"}
          >
            {"Система не зависит от скрытых локальных действий автора."}
          </TypeCard>
          <TypeCard
            badge={"observe"}
            badgeTone={"float"}
            title={"Observability"}
            code={"logs + probes + request id"}
          >
            {"Failure можно локализовать по evidence."}
          </TypeCard>
          <TypeCard
            badge={"trace"}
            badgeTone={"str"}
            title={"Traceability"}
            code={"commit ↔ image ↔ release"}
          >
            {"Известно, какая версия работает в environment."}
          </TypeCard>
          <TypeCard
            badge={"recover"}
            title={"Recoverability"}
            code={"known-good rollback"}
          >
            {"Команда имеет проверенный путь возврата."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Объяснить request flow"}</h3>
          <p>
            {"От external client до process, database и response."}
          </p>

          <h3>{"Объяснить release flow"}</h3>
          <p>
            {"От commit до exact deployed image."}
          </p>

          <h3>{"Объяснить data flow"}</h3>
          <p>
            {"От migration до persistent volume и backup boundary."}
          </p>

          <h3>{"Объяснить failure flow"}</h3>
          <p>
            {"От failed evidence до rollback и incident note."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Цель этапа — один устойчивый монолитный release. Микросервисы и Kubernetes не являются признаком зрелости, если базовый flow ещё невоспроизводим."}
        </Callout>

        <Callout tone={"warn"}>
          {"Автоматизация плохой ручной процедуры только быстрее повторяет ошибки. Сначала процедура должна быть понятной и проверенной локально."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что меняется между development и production без rebuild image?"}
            options={[
              "Runtime configuration и external services",
              "Содержимое immutable image",
              "История Git внутри container",
            ]}
            correctIndex={0}
            explanation={"Build once предполагает одинаковый artifact и разные environment-specific config values."}
          />

          <QuizCard
            question={"Почему named volume нужен PostgreSQL?"}
            options={[
              "Чтобы database files переживали recreate container",
              "Чтобы ускорить formatter",
              "Чтобы заменить migrations",
            ]}
            correctIndex={0}
            explanation={"Container filesystem ephemeral, а database state должен жить независимо от конкретного instance."}
          />

          <QuizCard
            question={"Что отличает readiness от liveness?"}
            options={[
              "Readiness показывает готовность обслуживать traffic с critical dependencies",
              "Readiness всегда проверяет только PID",
              "Liveness применяет migrations",
            ]}
            correctIndex={0}
            explanation={"Живой process может временно быть не готовым из-за unavailable dependency."}
          />

          <QuizCard
            question={"Почему smoke test нужен после deployment, даже если CI зелёный?"}
            options={[
              "Он проверяет critical flow в реальном deployment environment",
              "Он заменяет все unit tests",
              "Он создаёт Docker layers",
            ]}
            correctIndex={0}
            explanation={"CI не видит все особенности production config, network, migrations и startup order."}
          />

        </div>

        <KeyTakeaways
          points={[
            <>{"Source, artifact, configuration и process являются разными слоями."}</>,
            <>{"Container запускает обычный управляемый Linux-process."}</>,
            <>{"Build context и layers определяют содержимое и cache image."}</>,
            <>{"Compose services общаются по внутренним DNS-именам, а не через общий localhost."}</>,
            <>{"Persistent data PostgreSQL хранятся в volume, schema восстанавливается migrations."}</>,
            <>{"CI gates проверяют commit в независимом environment."}</>,
            <>{"CD доставляет exact immutable artifact с отдельными secrets."}</>,
            <>{"Release завершается smoke test, record и проверенным rollback path."}</>,
          ]}
        />

        <PracticeCta
          text={"Выберите текущую версию Async StudyHub и составьте полный technical passport: source revision, Docker build inputs, image tag, runtime command, environment variables, network addresses, volumes, health/readiness probes, migration command, CI gates, deployment target, smoke scenario и rollback command. Затем воспроизведите этот паспорт на clean environment."}
        />

      </Section>

    </RichLesson>
  );
}

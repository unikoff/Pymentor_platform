import { Boxes, Layers } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 32 · GitHub Actions, CI/CD и первый деплой";

export function Lesson185({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"PostgreSQL service и migrations в CI"}
        intro={"Добавим к runner настоящую PostgreSQL как service container, дождёмся readiness, применим Alembic migrations на чистую test database и только затем запустим integration tests. Pipeline начнёт доказывать восстановимость схемы, а не только корректность Python-функций."}
        tags={[
          { icon: <Boxes size={14} />, label: "runner + PostgreSQL service" },
          { icon: <Layers size={14} />, label: "ready → migrate → test" },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с этапом."}</strong>
        {" Первый workflow проверяет Python-код. Теперь CI должен проверить database-specific поведение и полный путь восстановления schema. "}
        <strong>{"Важно не перепутать:"}</strong>
        {" CI использует отдельную test database с временными credentials. Production database никогда не подключается к pull request."}
      </Callout>

      <Section number="01" title="Зачем тема появляется сейчас">
        <Lead>
          {"Добавим к runner настоящую PostgreSQL как service container, дождёмся readiness, применим Alembic migrations на чистую test database и только затем запустим integration tests. Pipeline начнёт доказывать восстановимость схемы, а не только корректность Python-функций."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Поднять service: "}</strong>
              {"описать PostgreSQL image, database и health options."}
            </li>
            <li>
              <strong>{"Передать test URL: "}</strong>
              {"направить приложение только в временную CI database."}
            </li>
            <li>
              <strong>{"Применить migrations: "}</strong>
              {"восстановить schema с нуля через `alembic upgrade head`."}
            </li>
            <li>
              <strong>{"Запустить integration tests: "}</strong>
              {"проверить HTTP и SQLAlchemy на реальной PostgreSQL."}
            </li>
          </ol>
          <p>
            {"Итог занятия — проверяемое изменение Deployable StudyHub, которое другой разработчик может повторить по команде, workflow или runbook."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"service container"} title={"Временная"}>
            {"временная PostgreSQL рядом с runner"}
          </TypeCard>
          <TypeCard badge={"health check"} badgeTone={"float"} title={"Сигнал"}>
            {"сигнал реальной готовности принимать connections"}
          </TypeCard>
          <TypeCard badge={"migration gate"} badgeTone={"str"} title={"Доказательство"}>
            {"доказательство целостности истории Alembic"}
          </TypeCard>
          <TypeCard badge={"integration test"} title={"Проверка"}>
            {"проверка взаимодействия API и PostgreSQL"}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"До изменения"}</h3>
          <p>{"Зафиксируйте рабочий сценарий, текущий commit и наблюдаемый результат. Это baseline для сравнения."}</p>
          <h3>{"Во время изменения"}</h3>
          <p>{"Меняйте один инфраструктурный слой, читайте первый failed step и не исправляйте несколько независимых причин одновременно."}</p>
          <h3>{"После изменения"}</h3>
          <p>{"Повторите успешный и ошибочный путь, сохраните команду проверки и сделайте один осмысленный Git-коммит."}</p>
        </div>

        <RecallCard
          question={"Какую проблему решает занятие 185 и чем подтверждается результат?"}
          hint="Назовите исходный риск, одно изменение и воспроизводимую проверку."
          answer={
            <p>
              {"Первый workflow проверяет Python-код. Теперь CI должен проверить database-specific поведение и полный путь восстановления schema. Результат подтверждается не описанием, а зелёным gate, smoke test, log или повторяемым runbook."}
            </p>
          }
        />
      </Section>

      <Section number="02" title="Главная модель и ответственность частей">
        <Lead>
          {"Сначала разделим роли. Инфраструктура становится понятной, когда для каждого объекта можно назвать вход, результат, срок жизни и причину ошибки."}
        </Lead>

        <MethodGrid
          rows={[
            [<>"service container"</>, "временная PostgreSQL рядом с runner"],
            [<>"health check"</>, "сигнал реальной готовности принимать connections"],
            [<>"migration gate"</>, "доказательство целостности истории Alembic"],
            [<>"integration test"</>, "проверка взаимодействия API и PostgreSQL"]
          ]}
        />

        <MatchPairs
          prompt="Соедините понятие и его ответственность."
          leftTitle="Понятие"
          rightTitle="Ответственность"
          pairs={[
            { left: "service container", right: "временная PostgreSQL рядом с runner" },
            { left: "health check", right: "сигнал реальной готовности принимать connections" },
            { left: "migration gate", right: "доказательство целостности истории Alembic" },
            { left: "integration test", right: "проверка взаимодействия API и PostgreSQL" }
          ]}
          explanation="Пара считается усвоенной, когда вы можете назвать не только определение, но и момент использования в release pipeline."
        />

        <div className="lesson-practice-steps">
          <h3>{"Вход"}</h3>
          <p>{"service container получает конкретный commit, configuration или состояние предыдущего шага, а не случайные локальные файлы."}</p>
          <h3>{"Действие"}</h3>
          <p>{"Один step выполняет одну понятную команду и возвращает явный exit code."}</p>
          <h3>{"Результат"}</h3>
          <p>{"integration test фиксирует наблюдаемый итог: green check, image tag, health response или восстановленную версию."}</p>
          <h3>{"Граница"}</h3>
          <p>{"CI использует отдельную test database с временными credentials. Production database никогда не подключается к pull request."}</p>
        </div>

        <TrueFalse
          statement={<>{"Если команда работает локально один раз, автоматическая проверка exact commit больше не нужна."}</>}
          isTrue={false}
          explanation="Локальное состояние может отличаться по коду, dependencies, runtime и configuration. Pipeline устраняет эту неопределённость."
        />
      </Section>

      <Section number="03" title="Минимальный механизм по шагам">
        <Lead>
          {"Прочитайте пример сверху вниз и до запуска отметьте, где подготавливается окружение, где начинается внешняя операция и какой exit code остановит маршрут."}
        </Lead>

        <CodeBlock
          caption={"job с PostgreSQL service"}
          code={"jobs:\n  integration:\n    runs-on: ubuntu-latest\n\n    services:\n      postgres:\n        image: postgres:16-alpine\n        env:\n          POSTGRES_DB: studyhub_test\n          POSTGRES_USER: studyhub\n          POSTGRES_PASSWORD: studyhub_test_password\n        ports:\n          - 5432:5432\n        options: >-\n          --health-cmd \"pg_isready -U studyhub -d studyhub_test\"\n          --health-interval 10s\n          --health-timeout 5s\n          --health-retries 5\n\n    env:\n      APP_ENV: test\n      DATABASE_URL: postgresql+asyncpg://studyhub:studyhub_test_password@localhost:5432/studyhub_test\n\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with:\n          python-version: \"3.12\"\n          cache: pip\n      - run: python -m pip install -r requirements-dev.txt\n      - name: Apply migrations\n        run: python -m alembic upgrade head\n      - name: Run integration tests\n        run: python -m pytest -q tests/integration"}
        />

        <StepThrough
          code={"jobs:\n  integration:\n    runs-on: ubuntu-latest\n\n    services:\n      postgres:\n        image: postgres:16-alpine\n        env:\n          POSTGRES_DB: studyhub_test\n          POSTGRES_USER: studyhub\n          POSTGRES_PASSWORD: studyhub_test_password\n        ports:\n          - 5432:5432\n        options: >-\n          --health-cmd \"pg_isready -U studyhub -d studyhub_test\"\n          --health-interval 10s\n          --health-timeout 5s\n          --health-retries 5\n\n    env:\n      APP_ENV: test\n      DATABASE_URL: postgresql+asyncpg://studyhub:studyhub_test_password@localhost:5432/studyhub_test\n\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with:\n          python-version: \"3.12\"\n          cache: pip\n      - run: python -m pip install -r requirements-dev.txt\n      - name: Apply migrations\n        run: python -m alembic upgrade head\n      - name: Run integration tests\n        run: python -m pytest -q tests/integration"}
          steps={[
            { line: 4, note: "Service создаётся рядом с host runner.", vars: { "service": "postgres" } },
            { line: 6, note: "Version PostgreSQL зафиксирована для воспроизводимости.", vars: { "image": "postgres:16-alpine" } },
            { line: 13, note: "Health command проверяет готовность конкретной database.", vars: { "readiness": "pg_isready" } },
            { line: 20, note: "Test DATABASE_URL относится только к текущему job.", vars: { "environment": "test" } },
            { line: 30, note: "Alembic строит schema на чистой database.", vars: { "schema": "head" } },
            { line: 32, note: "Integration tests запускаются только после успешных migrations.", vars: { "gate": "integration" } }
          ]}
        />

        <FillBlank
          prompt="Закончите правило: обязательный step должен вернуть код ... для продолжения pipeline."
          before="exit code = "
          after=""
          options={["0", "1", "latest"]}
          answer="0"
          explanation="Нулевой exit code означает успешное выполнение команды. Ненулевой код делает обязательный step красным."
        />

        <Callout tone="info">
          {"YAML и shell здесь не являются отдельной магией. Это декларация порядка и обычные команды, которые должны воспроизводиться локально или в учебном окружении."}
        </Callout>
      </Section>

      <Section number="04" title="Сравнение решений и явный контракт">
        <Lead>
          {"Сравним две конфигурации по диагностируемости, безопасности и прослеживаемости, а не по количеству строк."}
        </Lead>

        <CompareSolutions
          question="Какой вариант лучше сохраняет воспроизводимость release pipeline?"
          left={{
            title: "Тесты на production database",
            code: "DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}",
            note: "Pull request получает доступ к живым данным и может изменить их.",
          }}
          right={{
            title: "Одноразовая test database",
            code: "services:\n  postgres:\n    image: postgres:16-alpine\nenv:\n  DATABASE_URL: postgresql+asyncpg://.../studyhub_test",
            note: "Каждый job начинает с чистого изолированного состояния.",
          }}
          preferred="right"
          explanation={"Integration tests должны быть повторяемыми и безопасными; временная service database обеспечивает обе границы."}
        />

        <FlipCards
          cards={[
            { front: <>Что должно быть явным?</>, back: <>Точный commit или image tag, команда проверки и ожидаемый результат.</> },
            { front: <>Что нельзя скрывать?</>, back: <>Первый failed gate, порядок migrations и решение о rollback.</> },
            { front: <>Что нельзя публиковать?</>, back: <>Production secrets, приватные keys и чувствительные значения configuration.</> },
            { front: <>Что фиксирует готовность?</>, back: <>Зелёный check, успешный smoke test или повторяемая команда runbook.</> },
          ]}
        />

        <Callout>
          {"Integration tests должны быть повторяемыми и безопасными; временная service database обеспечивает обе границы."}
        </Callout>
      </Section>

      <Section number="05" title="Ожидаемый сбой и диагностика">
        <Lead>
          {"Инфраструктурный навык проявляется не в идеальном первом запуске, а в способности локализовать сбой по первому красному шагу, logs и состоянию зависимостей."}
        </Lead>

        <BugHunt
          code={"steps:\n  - name: Run integration tests\n    run: python -m pytest -q tests/integration\n  - name: Apply migrations\n    run: python -m alembic upgrade head"}
          question={"Почему порядок steps нарушает контракт чистой database?"}
          options={["Tests стартуют до создания schema", "Alembic нельзя использовать в CI", "PostgreSQL не поддерживает health check"]}
          correctIndex={0}
          explanation={"Новая database пуста, поэтому таблицы должны появиться до первого integration test."}
          fix={"- name: Apply migrations\n  run: python -m alembic upgrade head\n- name: Run integration tests\n  run: python -m pytest -q tests/integration"}
        />

        <TerminalDemo
          title="воспроизводимая проверка"
          lines={[
            { cmd: "python -m alembic upgrade head" },
            { out: "INFO  Running upgrade -> a31d... create users\nINFO  Running upgrade a31d... -> c82f... add task indexes" },
            { cmd: "python -m pytest -q tests/integration" },
            { out: "36 passed in 5.91s" },
            { cmd: "python -m alembic current" },
            { out: "c82f... (head)" }
          ]}
        />

        <TypeCards>
          <TypeCard
            badge="signal"
            title="Наблюдаемый симптом"
          >
            Первый failed step, ненулевой exit code, unhealthy service или ошибочный HTTP response.
          </TypeCard>
          <TypeCard
            badge="cause"
            badgeTone="float"
            title="Проверяемая гипотеза"
          >
            Exact commit, runtime, dependency, migration revision, image tag и environment сверяются по одному.
          </TypeCard>
          <TypeCard
            badge="action"
            badgeTone="str"
            title="Минимальное действие"
          >
            Повторить одну команду, исправить одну причину и снова пройти тот же отрицательный сценарий.
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"1. Найдите первый failed step"}</h3>
          <p>{"Поздние skipped или failed steps часто являются следствием, а не новой причиной."}</p>
          <h3>{"2. Повторите точную команду"}</h3>
          <p>{"Используйте тот же commit, runtime, environment и arguments, насколько это возможно."}</p>
          <h3>{"3. Исправьте одну причину"}</h3>
          <p>{"Не смешивайте исправление workflow, application code и production config в один непрозрачный diff."}</p>
          <h3>{"4. Повторите отрицательный сценарий"}</h3>
          <p>{"Убедитесь, что gate действительно блокирует известный дефект, а не просто стал зелёным случайно."}</p>
        </div>
      </Section>

      <Section number="06" title={"Применение в Deployable StudyHub"}>
        <Lead>
          {"Теперь встроим механизм в один сквозной release pipeline и сохраним границу между source code, artifact, configuration и эксплуатационной проверкой."}
        </Lead>

        <CodeBlock
          caption={"жизненный цикл test database"}
          code={"job starts\n→ PostgreSQL container starts\n→ pg_isready reports healthy\n→ dependencies installed\n→ alembic upgrade head\n→ integration tests\n→ job ends and service disappears"}
        />

        <BranchExplorer
          code={"PostgreSQL started\n  ↓\nhealthy?\n  ├── no  → job cannot continue\n  └── yes → alembic upgrade head\n             ↓\n           migration success?\n             ├── no  → block pull request\n             └── yes → integration tests"}
          scenarios={[
            { label: "database not ready", activeLine: 3, output: "health check предотвращает раннее подключение" },
            { label: "broken migration", activeLine: 7, output: "migration gate блокирует tests и merge" },
            { label: "clean schema restored", activeLine: 9, output: "integration tests получают предсказуемую database" }
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Наблюдаемый успех"}</h3>
          <p>{"Запишите конкретный check, endpoint, tag или migration revision, который подтверждает завершение шага."}</p>
          <h3>{"Ожидаемая ошибка"}</h3>
          <p>{"Создайте безопасный учебный дефект и подтвердите, что pipeline останавливается до опасного действия."}</p>
          <h3>{"Артефакт занятия"}</h3>
          <p>{"Обновите workflow, script, README или runbook так, чтобы следующий разработчик повторил занятие 185 без устных подсказок."}</p>
        </div>

        <RecallCard
          question="Какие четыре границы нужно назвать перед изменением pipeline?"
          answer={
            <p>
              {"Вход шага, выполняемая команда, наблюдаемый критерий успеха и действие при ошибке. Для deployment дополнительно фиксируется предыдущий рабочий image tag."}
            </p>
          }
        />
      </Section>

      <Section number="07" title="Управляемая практика и Git-результат">
        <Lead>
          {"Добавьте PostgreSQL service в отдельный integration job, примените migrations на пустую database, затем намеренно сломайте одну revision и зафиксируйте, что pipeline блокирует tests до восстановления истории."}
        </Lead>

        <CodeSequence
          title="Соберите безопасный порядок"
          prompt="Расположите действия так, чтобы каждый следующий шаг использовал только проверенный результат предыдущего."
          pieces={[
            { id: "service", code: "запустить PostgreSQL service" },
            { id: "ready", code: "дождаться health check" },
            { id: "install", code: "установить project dependencies" },
            { id: "migrate", code: "выполнить alembic upgrade head" },
            { id: "test", code: "запустить integration tests" },
            { id: "prod", code: "подключить production database", note: "опасная лишняя зависимость" }
          ]}
          correctOrder={["service", "ready", "install", "migrate", "test"]}
          explanation="Порядок сохраняет fail-fast, прослеживаемость и возможность остановить release до воздействия на production."
        />

        <div className="lesson-checklist">
          <label><input type="checkbox" /> Я могу объяснить проблему без чтения определения.</label>
          <label><input type="checkbox" /> Я запустил минимальный успешный сценарий.</label>
          <label><input type="checkbox" /> Я намеренно получил ожидаемый сбой.</label>
          <label><input type="checkbox" /> Я повторил команду из failed step.</label>
          <label><input type="checkbox" /> Я обновил README, workflow или runbook.</label>
          <label><input type="checkbox" /> Я сделал один осмысленный Git-коммит.</label>
        </div>

        <Callout tone="info">
          {"Не добавляйте новый инструмент только ради усложнения. Завершённая практика должна давать один измеримый artifact и понятный способ проверки."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка занятия">
        <Lead>
          {"Ответьте без запуска кода, затем подтвердите ответы реальным workflow, command output или release record."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Зачем service container в CI?"}
            options={["Дать временную реальную PostgreSQL", "Сохранить production data", "Заменить migrations"]}
            correctIndex={0}
            explanation={"Service живёт только во время job."}
          />
          <QuizCard
            question={"Что проверяет migration gate?"}
            options={["Schema восстанавливается с нуля", "README отформатирован", "Image опубликован"]}
            correctIndex={0}
            explanation={"История revisions должна приводить чистую database к head."}
          />
          <QuizCard
            question={"Почему нужен health check?"}
            options={["Process start не равен readiness", "Он ускоряет Python", "Он создаёт tables"]}
            correctIndex={0}
            explanation={"PostgreSQL может быть запущена, но ещё не готова принимать connections."}
          />
          <QuizCard
            question={"Какой URL допустим в CI?"}
            options={["URL отдельной test database", "Production DATABASE_URL", "Личный локальный URL разработчика"]}
            correctIndex={0}
            explanation={"CI не должен касаться живых данных."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Service container существует только во время job."}</>,
            <>{"PostgreSQL version фиксируется для воспроизводимости."}</>,
            <>{"Health check отделяет process start от readiness."}</>,
            <>{"CI получает отдельный test DATABASE_URL."}</>,
            <>{"Migrations применяются до integration tests."}</>,
            <>{"Сломанная revision является блокирующим gate."}</>,
            <>{"Production database не участвует в pull request checks."}</>
          ]}
        />

        <PracticeCta text={"Добавьте PostgreSQL service в отдельный integration job, примените migrations на пустую database, затем намеренно сломайте одну revision и зафиксируйте, что pipeline блокирует tests до восстановления истории."} />
      </Section>
    </RichLesson>
  );
}

import {
  Boxes,
  Cloud,
  FileText,
  GitBranch,
  Github,
  KeyRound,
  Layers,
  Package,
  Save,
  ShieldCheck,
  Trophy,
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

const BLOCK_TITLE = "Блок 32 · GitHub Actions, CI/CD и первый деплой";

// 183. Continuous Integration и quality gates
export function Lesson183({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Continuous Integration и quality gates"}
        intro={"Построим CI как прозрачный конвейер проверки commit: форматирование, линтер и тесты останавливают неподготовленное изменение до merge. Сначала опишем контракт pipeline, затем намеренно сломаем каждый gate и прочитаем причину остановки."}
        tags={[
          { icon: <GitBranch size={14} />, label: "commit → pull request → CI" },
          { icon: <ShieldCheck size={14} />, label: "format · lint · test" },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с этапом."}</strong>
        {" Локальный Compose-stack уже воспроизводим. Теперь нужно доказать, что новый commit работает не только на компьютере автора. "}
        <strong>{"Важно не перепутать:"}</strong>
        {" CI проверяет изменение, но не разворачивает production. Deployment появится только после зелёных quality gates."}
      </Callout>

      <Section number="01" title="Зачем тема появляется сейчас">
        <Lead>
          {"Построим CI как прозрачный конвейер проверки commit: форматирование, линтер и тесты останавливают неподготовленное изменение до merge. Сначала опишем контракт pipeline, затем намеренно сломаем каждый gate и прочитаем причину остановки."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Зафиксировать контракт: "}</strong>
              {"назвать вход pipeline, проверки и условие успеха."}
            </li>
            <li>
              <strong>{"Запустить локально: "}</strong>
              {"использовать те же команды, которые позже выполнит runner."}
            </li>
            <li>
              <strong>{"Сломать один gate: "}</strong>
              {"создать formatting error, lint error или failing test и предсказать остановку."}
            </li>
            <li>
              <strong>{"Сделать результат читаемым: "}</strong>
              {"каждый step отвечает на один вопрос и имеет понятное имя."}
            </li>
          </ol>
          <p>
            {"Итог занятия — проверяемое изменение Deployable StudyHub, которое другой разработчик может повторить по команде, workflow или runbook."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"commit"} title={"Неизменяемый"}>
            {"неизменяемый снимок проверяемого кода"}
          </TypeCard>
          <TypeCard badge={"pull request"} badgeTone={"float"} title={"Место"}>
            {"место обсуждения и автоматических checks"}
          </TypeCard>
          <TypeCard badge={"quality gate"} badgeTone={"str"} title={"Условие,"}>
            {"условие, без которого merge запрещён"}
          </TypeCard>
          <TypeCard badge={"pipeline"} title={"Повторяемый"}>
            {"повторяемый порядок автоматических проверок"}
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
          question={"Какую проблему решает занятие 183 и чем подтверждается результат?"}
          hint="Назовите исходный риск, одно изменение и воспроизводимую проверку."
          answer={
            <p>
              {"Локальный Compose-stack уже воспроизводим. Теперь нужно доказать, что новый commit работает не только на компьютере автора. Результат подтверждается не описанием, а зелёным gate, smoke test, log или повторяемым runbook."}
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
            [<>"commit"</>, "неизменяемый снимок проверяемого кода"],
            [<>"pull request"</>, "место обсуждения и автоматических checks"],
            [<>"quality gate"</>, "условие, без которого merge запрещён"],
            [<>"pipeline"</>, "повторяемый порядок автоматических проверок"]
          ]}
        />

        <MatchPairs
          prompt="Соедините понятие и его ответственность."
          leftTitle="Понятие"
          rightTitle="Ответственность"
          pairs={[
            { left: "commit", right: "неизменяемый снимок проверяемого кода" },
            { left: "pull request", right: "место обсуждения и автоматических checks" },
            { left: "quality gate", right: "условие, без которого merge запрещён" },
            { left: "pipeline", right: "повторяемый порядок автоматических проверок" }
          ]}
          explanation="Пара считается усвоенной, когда вы можете назвать не только определение, но и момент использования в release pipeline."
        />

        <div className="lesson-practice-steps">
          <h3>{"Вход"}</h3>
          <p>{"commit получает конкретный commit, configuration или состояние предыдущего шага, а не случайные локальные файлы."}</p>
          <h3>{"Действие"}</h3>
          <p>{"Один step выполняет одну понятную команду и возвращает явный exit code."}</p>
          <h3>{"Результат"}</h3>
          <p>{"pipeline фиксирует наблюдаемый итог: green check, image tag, health response или восстановленную версию."}</p>
          <h3>{"Граница"}</h3>
          <p>{"CI проверяет изменение, но не разворачивает production. Deployment появится только после зелёных quality gates."}</p>
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
          caption={"локальный контракт quality gates"}
          code={"# scripts/quality.sh\nset -euo pipefail\n\necho \"[1/3] format check\"\npython -m ruff format --check .\n\necho \"[2/3] lint\"\npython -m ruff check .\n\necho \"[3/3] tests\"\npython -m pytest -q\n\necho \"All quality gates passed\""}
        />

        <StepThrough
          code={"# scripts/quality.sh\nset -euo pipefail\n\necho \"[1/3] format check\"\npython -m ruff format --check .\n\necho \"[2/3] lint\"\npython -m ruff check .\n\necho \"[3/3] tests\"\npython -m pytest -q\n\necho \"All quality gates passed\""}
          steps={[
            { line: 1, note: "Shell прекращает pipeline после первой команды с ненулевым exit code.", vars: { "режим": "fail fast" } },
            { line: 4, note: "Formatter только проверяет стиль и не изменяет файлы.", vars: { "gate": "format" } },
            { line: 7, note: "Linter ищет статические дефекты и нарушения правил.", vars: { "gate": "lint" } },
            { line: 10, note: "Tests проверяют наблюдаемое поведение StudyHub.", vars: { "gate": "tests" } },
            { line: 12, note: "Финальное сообщение появляется только после всех трёх успехов.", vars: { "status": "green" } }
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
            title: "Один непрозрачный step",
            code: "run: ./check-everything.sh",
            note: "В логе не видно, какая именно проверка упала и какую команду повторить локально.",
          }}
          right={{
            title: "Отдельные quality gates",
            code: "- name: Check formatting\n  run: python -m ruff format --check .\n- name: Run linter\n  run: python -m ruff check .\n- name: Run tests\n  run: python -m pytest -q",
            note: "Каждый step отвечает на один вопрос и даёт локально воспроизводимую команду.",
          }}
          preferred="right"
          explanation={"Маленькие steps делают причину красного run видимой и сокращают путь от сообщения до исправления."}
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
          {"Маленькие steps делают причину красного run видимой и сокращают путь от сообщения до исправления."}
        </Callout>
      </Section>

      <Section number="05" title="Ожидаемый сбой и диагностика">
        <Lead>
          {"Инфраструктурный навык проявляется не в идеальном первом запуске, а в способности локализовать сбой по первому красному шагу, logs и состоянию зависимостей."}
        </Lead>

        <BugHunt
          code={"# developer machine\npython -m pytest -q\n# 124 passed\n\n# pull request\n# CI не настроен, merge выполнен вручную"}
          question={"Почему локальный зелёный запуск не является достаточным quality gate?"}
          options={["Команды не повторяются автоматически на проверяемом commit", "pytest запрещён в CI", "Pull request не содержит Python-код"]}
          correctIndex={0}
          explanation={"Другой Python, забытая команда или непроверенный новый commit могут сделать локальный результат неактуальным."}
          fix={"pull_request\n→ checkout exact commit\n→ install locked dependencies\n→ format check\n→ lint\n→ tests\n→ merge only when green"}
        />

        <TerminalDemo
          title="воспроизводимая проверка"
          lines={[
            { cmd: "python -m ruff format --check ." },
            { out: "Would reformat: app/services/tasks.py" },
            { cmd: "python -m ruff format app/services/tasks.py" },
            { out: "1 file reformatted" },
            { cmd: "python -m ruff check ." },
            { out: "All checks passed!" },
            { cmd: "python -m pytest -q" },
            { out: "124 passed in 3.42s" }
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
          caption={"матрица проверок StudyHub"}
          code={"Gate                 Команда                         Что блокирует\nformat               ruff format --check .           несогласованный стиль\nlint                 ruff check .                    статические дефекты\nunit tests           pytest -q tests/unit            сломанное правило\nintegration tests    pytest -q tests/integration     сломанный HTTP/DB сценарий"}
        />

        <BranchExplorer
          code={"commit\n  ↓\nformat gate\n  ↓ success\nlint gate\n  ↓ success\ntest gate\n  ↓ success\npull request may merge"}
          scenarios={[
            { label: "неотформатированный файл", activeLine: 2, output: "pipeline останавливается до lint и tests" },
            { label: "неиспользуемый import", activeLine: 4, output: "lint становится красным" },
            { label: "сломанный endpoint", activeLine: 6, output: "tests блокируют merge" }
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Наблюдаемый успех"}</h3>
          <p>{"Запишите конкретный check, endpoint, tag или migration revision, который подтверждает завершение шага."}</p>
          <h3>{"Ожидаемая ошибка"}</h3>
          <p>{"Создайте безопасный учебный дефект и подтвердите, что pipeline останавливается до опасного действия."}</p>
          <h3>{"Артефакт занятия"}</h3>
          <p>{"Обновите workflow, script, README или runbook так, чтобы следующий разработчик повторил занятие 183 без устных подсказок."}</p>
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
          {"Создайте scripts/quality.sh, намеренно получите по одному красному результату на format, lint и tests, затем сохраните таблицу «gate → команда → причина отказа» в docs/ci-contract.md."}
        </Lead>

        <CodeSequence
          title="Соберите безопасный порядок"
          prompt="Расположите действия так, чтобы каждый следующий шаг использовал только проверенный результат предыдущего."
          pieces={[
            { id: "commit", code: "зафиксировать commit" },
            { id: "format", code: "проверить форматирование" },
            { id: "lint", code: "запустить линтер" },
            { id: "tests", code: "запустить тесты" },
            { id: "review", code: "разрешить review и merge" },
            { id: "deploy", code: "сразу развернуть production", note: "это уже CD и слишком ранний шаг" }
          ]}
          correctOrder={["commit", "format", "lint", "tests", "review"]}
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
            question={"Что является входом CI pipeline?"}
            options={["Конкретный commit", "Любая папка разработчика", "Production database"]}
            correctIndex={0}
            explanation={"Runner должен проверять точный снимок кода."}
          />
          <QuizCard
            question={"Зачем нужен quality gate?"}
            options={["Блокировать неподготовленное изменение", "Ускорять интернет", "Хранить секреты"]}
            correctIndex={0}
            explanation={"Gate определяет обязательное условие перехода дальше."}
          />
          <QuizCard
            question={"Что означает fail fast?"}
            options={["Остановиться после первой обязательной ошибки", "Игнорировать красные steps", "Запустить deploy раньше tests"]}
            correctIndex={0}
            explanation={"Продолжение после базового сбоя создаёт шум и тратит время."}
          />
          <QuizCard
            question={"Почему команды CI полезно запускать локально?"}
            options={["Ошибка становится воспроизводимой", "GitHub перестаёт быть нужен", "Runner использует локальные файлы"]}
            correctIndex={0}
            explanation={"Одинаковая команда сокращает диагностику."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"CI повторяемо проверяет конкретный commit."}</>,
            <>{"Pull request объединяет review и автоматические checks."}</>,
            <>{"Quality gate имеет одну ясную причину отказа."}</>,
            <>{"Formatter, linter и tests отвечают на разные вопросы."}</>,
            <>{"Fail fast останавливает бессмысленные последующие steps."}</>,
            <>{"Локальные и CI-команды должны совпадать."}</>,
            <>{"Deployment не входит в первый CI-контракт."}</>
          ]}
        />

        <PracticeCta text={"Создайте scripts/quality.sh, намеренно получите по одному красному результату на format, lint и tests, затем сохраните таблицу «gate → команда → причина отказа» в docs/ci-contract.md."} />
      </Section>
    </RichLesson>
  );
}

// 184. Первый workflow GitHub Actions
export function Lesson184({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Первый workflow GitHub Actions"}
        intro={"Перенесём локальный CI-контракт в `.github/workflows/ci.yml`: выберем события, runner, checkout, Python и отдельные steps. Затем прочитаем красный run сверху вниз и добьёмся первого зелёного pull request."}
        tags={[
          { icon: <Github size={14} />, label: "workflow · job · step" },
          { icon: <FileText size={14} />, label: "YAML без магии" },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с этапом."}</strong>
        {" Quality gates уже названы и запускаются локально. GitHub Actions должен повторить тот же контракт на чистом runner. "}
        <strong>{"Важно не перепутать:"}</strong>
        {" Не вводим matrix, reusable workflows и десятки actions. Один понятный job ценнее сложной конфигурации без потребности."}
      </Callout>

      <Section number="01" title="Зачем тема появляется сейчас">
        <Lead>
          {"Перенесём локальный CI-контракт в `.github/workflows/ci.yml`: выберем события, runner, checkout, Python и отдельные steps. Затем прочитаем красный run сверху вниз и добьёмся первого зелёного pull request."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Выбрать события: "}</strong>
              {"проверять push в main и каждый pull_request."}
            </li>
            <li>
              <strong>{"Подготовить runner: "}</strong>
              {"получить код, установить согласованную версию Python и dependencies."}
            </li>
            <li>
              <strong>{"Запустить gates: "}</strong>
              {"повторить format, lint и tests отдельными steps."}
            </li>
            <li>
              <strong>{"Прочитать run: "}</strong>
              {"найти первый красный step и повторить его команду локально."}
            </li>
          </ol>
          <p>
            {"Итог занятия — проверяемое изменение Deployable StudyHub, которое другой разработчик может повторить по команде, workflow или runbook."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"workflow"} title={"Файл"}>
            {"файл автоматизации и его события"}
          </TypeCard>
          <TypeCard badge={"job"} badgeTone={"float"} title={"Набор"}>
            {"набор steps на одном runner"}
          </TypeCard>
          <TypeCard badge={"step"} badgeTone={"str"} title={"Одно"}>
            {"одно действие или одна shell-команда"}
          </TypeCard>
          <TypeCard badge={"runner"} title={"Чистая"}>
            {"чистая машина, выполняющая job"}
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
          question={"Какую проблему решает занятие 184 и чем подтверждается результат?"}
          hint="Назовите исходный риск, одно изменение и воспроизводимую проверку."
          answer={
            <p>
              {"Quality gates уже названы и запускаются локально. GitHub Actions должен повторить тот же контракт на чистом runner. Результат подтверждается не описанием, а зелёным gate, smoke test, log или повторяемым runbook."}
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
            [<>"workflow"</>, "файл автоматизации и его события"],
            [<>"job"</>, "набор steps на одном runner"],
            [<>"step"</>, "одно действие или одна shell-команда"],
            [<>"runner"</>, "чистая машина, выполняющая job"]
          ]}
        />

        <MatchPairs
          prompt="Соедините понятие и его ответственность."
          leftTitle="Понятие"
          rightTitle="Ответственность"
          pairs={[
            { left: "workflow", right: "файл автоматизации и его события" },
            { left: "job", right: "набор steps на одном runner" },
            { left: "step", right: "одно действие или одна shell-команда" },
            { left: "runner", right: "чистая машина, выполняющая job" }
          ]}
          explanation="Пара считается усвоенной, когда вы можете назвать не только определение, но и момент использования в release pipeline."
        />

        <div className="lesson-practice-steps">
          <h3>{"Вход"}</h3>
          <p>{"workflow получает конкретный commit, configuration или состояние предыдущего шага, а не случайные локальные файлы."}</p>
          <h3>{"Действие"}</h3>
          <p>{"Один step выполняет одну понятную команду и возвращает явный exit code."}</p>
          <h3>{"Результат"}</h3>
          <p>{"runner фиксирует наблюдаемый итог: green check, image tag, health response или восстановленную версию."}</p>
          <h3>{"Граница"}</h3>
          <p>{"Не вводим matrix, reusable workflows и десятки actions. Один понятный job ценнее сложной конфигурации без потребности."}</p>
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
          caption={".github/workflows/ci.yml"}
          code={"name: CI\n\non:\n  push:\n    branches: [main]\n  pull_request:\n\njobs:\n  quality:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Checkout repository\n        uses: actions/checkout@v4\n\n      - name: Set up Python\n        uses: actions/setup-python@v5\n        with:\n          python-version: \"3.12\"\n          cache: pip\n\n      - name: Install dependencies\n        run: python -m pip install -r requirements-dev.txt\n\n      - name: Check formatting\n        run: python -m ruff format --check .\n\n      - name: Run linter\n        run: python -m ruff check .\n\n      - name: Run tests\n        run: python -m pytest -q"}
        />

        <StepThrough
          code={"name: CI\n\non:\n  push:\n    branches: [main]\n  pull_request:\n\njobs:\n  quality:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Checkout repository\n        uses: actions/checkout@v4\n\n      - name: Set up Python\n        uses: actions/setup-python@v5\n        with:\n          python-version: \"3.12\"\n          cache: pip\n\n      - name: Install dependencies\n        run: python -m pip install -r requirements-dev.txt\n\n      - name: Check formatting\n        run: python -m ruff format --check .\n\n      - name: Run linter\n        run: python -m ruff check .\n\n      - name: Run tests\n        run: python -m pytest -q"}
          steps={[
            { line: 0, note: "Имя помогает найти workflow в Actions.", vars: { "workflow": "CI" } },
            { line: 2, note: "События определяют, когда создаётся run.", vars: { "events": "push + pull_request" } },
            { line: 8, note: "Job quality получает отдельный Ubuntu runner.", vars: { "job": "quality" } },
            { line: 12, note: "Checkout помещает проверяемый commit в workspace.", vars: { "code": "available" } },
            { line: 15, note: "setup-python фиксирует runtime.", vars: { "python": "3.12" } },
            { line: 25, note: "Каждый gate повторяет локальную команду.", vars: { "result": "green or red" } }
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
            title: "Скрытая подготовка runner",
            code: "steps:\n  - run: pytest",
            note: "Неясно, откуда взялся код, какая версия Python используется и установлены ли dependencies.",
          }}
          right={{
            title: "Явный минимальный workflow",
            code: "steps:\n  - uses: actions/checkout@v4\n  - uses: actions/setup-python@v5\n    with:\n      python-version: \"3.12\"\n  - run: python -m pip install -r requirements-dev.txt\n  - run: python -m pytest -q",
            note: "Runner собирается от пустого состояния к воспроизводимой проверке.",
          }}
          preferred="right"
          explanation={"Чистый runner должен получить код, runtime и dependencies явно, иначе workflow зависит от случайного состояния."}
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
          {"Чистый runner должен получить код, runtime и dependencies явно, иначе workflow зависит от случайного состояния."}
        </Callout>
      </Section>

      <Section number="05" title="Ожидаемый сбой и диагностика">
        <Lead>
          {"Инфраструктурный навык проявляется не в идеальном первом запуске, а в способности локализовать сбой по первому красному шагу, logs и состоянию зависимостей."}
        </Lead>

        <BugHunt
          code={"jobs:\n  quality:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Run tests\n        run: python -m pytest -q"}
          question={"Какой обязательный шаг отсутствует до запуска tests?"}
          options={["Checkout repository и установка dependencies", "Создание production secret", "Публикация Docker image"]}
          correctIndex={0}
          explanation={"Новый runner не содержит репозиторий и проектные зависимости автоматически."}
          fix={"steps:\n  - uses: actions/checkout@v4\n  - uses: actions/setup-python@v5\n    with:\n      python-version: \"3.12\"\n  - run: python -m pip install -r requirements-dev.txt\n  - run: python -m pytest -q"}
        />

        <TerminalDemo
          title="воспроизводимая проверка"
          lines={[
            { cmd: "git add .github/workflows/ci.yml" },
            { cmd: "git commit -m \"ci: add quality workflow\"" },
            { out: "[feature/ci 31ac8e1] ci: add quality workflow" },
            { cmd: "git push -u origin feature/ci" },
            { out: "remote: Create a pull request for feature/ci" },
            { cmd: "python -m pytest -q" },
            { out: "124 passed in 3.38s" }
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
          caption={"иерархия workflow"}
          code={"CI workflow\n├── event: pull_request\n└── job: quality\n    ├── checkout\n    ├── setup Python\n    ├── install dependencies\n    ├── format check\n    ├── lint\n    └── tests"}
        />

        <BranchExplorer
          code={"pull request opened\n  ↓\nworkflow parsed\n  ↓\nrunner allocated\n  ↓\nsteps execute in order\n  ↓\ncheck reported to pull request"}
          scenarios={[
            { label: "ошибка YAML", activeLine: 2, output: "workflow не запускается: сначала исправить структуру файла" },
            { label: "dependency install failed", activeLine: 4, output: "следующие gates не выполняются" },
            { label: "all steps passed", activeLine: 8, output: "pull request получает зелёный check" }
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Наблюдаемый успех"}</h3>
          <p>{"Запишите конкретный check, endpoint, tag или migration revision, который подтверждает завершение шага."}</p>
          <h3>{"Ожидаемая ошибка"}</h3>
          <p>{"Создайте безопасный учебный дефект и подтвердите, что pipeline останавливается до опасного действия."}</p>
          <h3>{"Артефакт занятия"}</h3>
          <p>{"Обновите workflow, script, README или runbook так, чтобы следующий разработчик повторил занятие 184 без устных подсказок."}</p>
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
          {"Добавьте `.github/workflows/ci.yml`, откройте pull request, намеренно сломайте один test, найдите первый красный step по logs, исправьте дефект и сохраните screenshot или ссылку на зелёный run в README."}
        </Lead>

        <CodeSequence
          title="Соберите безопасный порядок"
          prompt="Расположите действия так, чтобы каждый следующий шаг использовал только проверенный результат предыдущего."
          pieces={[
            { id: "events", code: "описать on: pull_request" },
            { id: "runner", code: "выбрать runs-on" },
            { id: "checkout", code: "получить repository" },
            { id: "python", code: "установить Python" },
            { id: "deps", code: "установить dependencies" },
            { id: "gates", code: "запустить quality gates" }
          ]}
          correctOrder={["events", "runner", "checkout", "python", "deps", "gates"]}
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
            question={"Что запускает workflow?"}
            options={["Событие из секции on", "Имя файла README", "Docker volume"]}
            correctIndex={0}
            explanation={"Workflow реагирует на явно описанные events."}
          />
          <QuizCard
            question={"Зачем нужен checkout?"}
            options={["Поместить проверяемый commit на runner", "Создать PostgreSQL", "Сохранить secret"]}
            correctIndex={0}
            explanation={"Runner начинает с чистого workspace."}
          />
          <QuizCard
            question={"Что такое job?"}
            options={["Набор steps на runner", "Одна строка Python", "Git branch"]}
            correctIndex={0}
            explanation={"Job объединяет последовательность действий в одном окружении."}
          />
          <QuizCard
            question={"С чего начинать диагностику красного run?"}
            options={["С первого обязательного failed step", "С последнего зелёного commit", "С удаления workflow"]}
            correctIndex={0}
            explanation={"Первый сбой обычно объясняет все пропущенные следующие steps."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Workflow хранится в `.github/workflows`."}</>,
            <>{"Секция `on` описывает события запуска."}</>,
            <>{"Runner является чистым исполнительным окружением."}</>,
            <>{"Checkout, Python и dependencies подготавливаются явно."}</>,
            <>{"Steps выполняются последовательно внутри job."}</>,
            <>{"Красный run читают от первого failed step."}</>,
            <>{"Минимальный workflow проще расширять после реальной потребности."}</>
          ]}
        />

        <PracticeCta text={"Добавьте `.github/workflows/ci.yml`, откройте pull request, намеренно сломайте один test, найдите первый красный step по logs, исправьте дефект и сохраните screenshot или ссылку на зелёный run в README."} />
      </Section>
    </RichLesson>
  );
}

// 185. PostgreSQL service и migrations в CI
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

// 186. Автоматическая сборка и tagging Docker image
export function Lesson186({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Автоматическая сборка и tagging Docker image"}
        intro={"После зелёных checks превратим конкретный commit в неизменяемый Docker image. Свяжем commit SHA, image tag и registry, проверим container до публикации и перестанем использовать `latest` как единственный адрес версии."}
        tags={[
          { icon: <Package size={14} />, label: "commit SHA → image tag" },
          { icon: <Cloud size={14} />, label: "build · smoke · push" },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с этапом."}</strong>
        {" CI уже доказывает качество кода и migrations. Теперь тот же проверенный commit должен стать deployable artifact. "}
        <strong>{"Важно не перепутать:"}</strong>
        {" Image не содержит production secrets и не меняется после публикации. Конфигурация передаётся только при запуске."}
      </Callout>

      <Section number="01" title="Зачем тема появляется сейчас">
        <Lead>
          {"После зелёных checks превратим конкретный commit в неизменяемый Docker image. Свяжем commit SHA, image tag и registry, проверим container до публикации и перестанем использовать `latest` как единственный адрес версии."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Назвать artifact: "}</strong>
              {"получить tag из commit SHA или Git release tag."}
            </li>
            <li>
              <strong>{"Собрать один image: "}</strong>
              {"использовать уже проверенный Dockerfile и кеш buildx."}
            </li>
            <li>
              <strong>{"Проверить до push: "}</strong>
              {"запустить container и выполнить короткий smoke test."}
            </li>
            <li>
              <strong>{"Опубликовать: "}</strong>
              {"отправить тот же image в registry с прослеживаемыми tags."}
            </li>
          </ol>
          <p>
            {"Итог занятия — проверяемое изменение Deployable StudyHub, которое другой разработчик может повторить по команде, workflow или runbook."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"commit SHA"} title={"Точный"}>
            {"точный исходный код версии"}
          </TypeCard>
          <TypeCard badge={"image digest"} badgeTone={"float"} title={"Неизменяемое"}>
            {"неизменяемое содержимое artifact"}
          </TypeCard>
          <TypeCard badge={"tag"} badgeTone={"str"} title={"Читаемая"}>
            {"читаемая ссылка на image"}
          </TypeCard>
          <TypeCard badge={"registry"} title={"Хранилище"}>
            {"хранилище опубликованных images"}
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
          question={"Какую проблему решает занятие 186 и чем подтверждается результат?"}
          hint="Назовите исходный риск, одно изменение и воспроизводимую проверку."
          answer={
            <p>
              {"CI уже доказывает качество кода и migrations. Теперь тот же проверенный commit должен стать deployable artifact. Результат подтверждается не описанием, а зелёным gate, smoke test, log или повторяемым runbook."}
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
            [<>"commit SHA"</>, "точный исходный код версии"],
            [<>"image digest"</>, "неизменяемое содержимое artifact"],
            [<>"tag"</>, "читаемая ссылка на image"],
            [<>"registry"</>, "хранилище опубликованных images"]
          ]}
        />

        <MatchPairs
          prompt="Соедините понятие и его ответственность."
          leftTitle="Понятие"
          rightTitle="Ответственность"
          pairs={[
            { left: "commit SHA", right: "точный исходный код версии" },
            { left: "image digest", right: "неизменяемое содержимое artifact" },
            { left: "tag", right: "читаемая ссылка на image" },
            { left: "registry", right: "хранилище опубликованных images" }
          ]}
          explanation="Пара считается усвоенной, когда вы можете назвать не только определение, но и момент использования в release pipeline."
        />

        <div className="lesson-practice-steps">
          <h3>{"Вход"}</h3>
          <p>{"commit SHA получает конкретный commit, configuration или состояние предыдущего шага, а не случайные локальные файлы."}</p>
          <h3>{"Действие"}</h3>
          <p>{"Один step выполняет одну понятную команду и возвращает явный exit code."}</p>
          <h3>{"Результат"}</h3>
          <p>{"registry фиксирует наблюдаемый итог: green check, image tag, health response или восстановленную версию."}</p>
          <h3>{"Граница"}</h3>
          <p>{"Image не содержит production secrets и не меняется после публикации. Конфигурация передаётся только при запуске."}</p>
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
          caption={"build-and-push job"}
          code={"build_image:\n  needs: [quality, integration]\n  runs-on: ubuntu-latest\n  permissions:\n    contents: read\n    packages: write\n\n  steps:\n    - uses: actions/checkout@v4\n\n    - uses: docker/setup-buildx-action@v3\n\n    - name: Log in to GHCR\n      uses: docker/login-action@v3\n      with:\n        registry: ghcr.io\n        username: ${{ github.actor }}\n        password: ${{ secrets.GITHUB_TOKEN }}\n\n    - name: Build and push image\n      uses: docker/build-push-action@v6\n      with:\n        context: .\n        push: true\n        tags: |\n          ghcr.io/${{ github.repository }}:${{ github.sha }}\n          ghcr.io/${{ github.repository }}:main\n        cache-from: type=gha\n        cache-to: type=gha,mode=max"}
        />

        <StepThrough
          code={"build_image:\n  needs: [quality, integration]\n  runs-on: ubuntu-latest\n  permissions:\n    contents: read\n    packages: write\n\n  steps:\n    - uses: actions/checkout@v4\n\n    - uses: docker/setup-buildx-action@v3\n\n    - name: Log in to GHCR\n      uses: docker/login-action@v3\n      with:\n        registry: ghcr.io\n        username: ${{ github.actor }}\n        password: ${{ secrets.GITHUB_TOKEN }}\n\n    - name: Build and push image\n      uses: docker/build-push-action@v6\n      with:\n        context: .\n        push: true\n        tags: |\n          ghcr.io/${{ github.repository }}:${{ github.sha }}\n          ghcr.io/${{ github.repository }}:main\n        cache-from: type=gha\n        cache-to: type=gha,mode=max"}
          steps={[
            { line: 1, note: "Build ждёт оба обязательных CI jobs.", vars: { "needs": "quality + integration" } },
            { line: 5, note: "Packages write разрешает публикацию в registry.", vars: { "permission": "packages:write" } },
            { line: 10, note: "Buildx подготавливает современную Docker build-среду.", vars: { "builder": "buildx" } },
            { line: 13, note: "Login использует временный GITHUB_TOKEN, а не пароль в YAML.", vars: { "auth": "token" } },
            { line: 21, note: "build-push создаёт и публикует artifact.", vars: { "push": "true" } },
            { line: 26, note: "SHA tag связывает image с одним commit.", vars: { "tag": "github.sha" } }
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
            title: "Только latest",
            code: "docker pull ghcr.io/acme/studyhub:latest",
            note: "После следующей публикации невозможно понять, какой commit скрывается под именем.",
          }}
          right={{
            title: "Прослеживаемый tag",
            code: "docker pull ghcr.io/acme/studyhub:31ac8e1f...",
            note: "Версию можно связать с commit, release notes и rollback.",
          }}
          preferred="right"
          explanation={"Читаемый alias удобен для людей, но deployment и rollback должны хранить точный неизменяемый tag или digest."}
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
          {"Читаемый alias удобен для людей, но deployment и rollback должны хранить точный неизменяемый tag или digest."}
        </Callout>
      </Section>

      <Section number="05" title="Ожидаемый сбой и диагностика">
        <Lead>
          {"Инфраструктурный навык проявляется не в идеальном первом запуске, а в способности локализовать сбой по первому красному шагу, logs и состоянию зависимостей."}
        </Lead>

        <BugHunt
          code={"FROM python:3.12-slim\nWORKDIR /app\nCOPY . .\n# .env попал в build context и image layer\nRUN pip install -r requirements.txt"}
          question={"Почему image нельзя считать безопасным artifact?"}
          options={["Секрет из .env может остаться в layer", "Python image запрещён в registry", "WORKDIR должен быть /src"]}
          correctIndex={0}
          explanation={"Удаление файла следующей инструкцией не гарантирует исчезновение из предыдущего layer."}
          fix={"# .dockerignore\n.env\n.env.*\n!.env.example\n.git\n__pycache__/\n.pytest_cache/"}
        />

        <TerminalDemo
          title="воспроизводимая проверка"
          lines={[
            { cmd: "docker build -t studyhub:31ac8e1 ." },
            { out: "[+] Building 18.4s FINISHED" },
            { cmd: "docker run -d --name studyhub-smoke -p 8080:8000 studyhub:31ac8e1" },
            { out: "c7f9d2..." },
            { cmd: "curl --fail http://localhost:8080/health" },
            { out: "{\"status\":\"ok\"}" },
            { cmd: "docker image inspect studyhub:31ac8e1 --format \"{{.Id}}\"" },
            { out: "sha256:8c4d..." }
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
          caption={"цепочка прослеживаемости release artifact"}
          code={"commit 31ac8e1\n→ CI quality + integration green\n→ image build\n→ smoke test exact image\n→ push ghcr.io/...:31ac8e1\n→ deployment records same tag"}
        />

        <BranchExplorer
          code={"CI green\n  ↓\nbuild image\n  ↓\nlocal container smoke test\n  ├── fail → do not push\n  └── pass → authenticate registry\n               ↓\n             push exact SHA tag"}
          scenarios={[
            { label: "Docker build failed", activeLine: 3, output: "registry не получает неполный artifact" },
            { label: "container health failed", activeLine: 5, output: "image не публикуется" },
            { label: "exact image passed", activeLine: 8, output: "SHA tag отправляется в registry" }
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Наблюдаемый успех"}</h3>
          <p>{"Запишите конкретный check, endpoint, tag или migration revision, который подтверждает завершение шага."}</p>
          <h3>{"Ожидаемая ошибка"}</h3>
          <p>{"Создайте безопасный учебный дефект и подтвердите, что pipeline останавливается до опасного действия."}</p>
          <h3>{"Артефакт занятия"}</h3>
          <p>{"Обновите workflow, script, README или runbook так, чтобы следующий разработчик повторил занятие 186 без устных подсказок."}</p>
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
          {"Добавьте build job после quality и integration, соберите image с SHA tag, запустите `/health` против container, затем опубликуйте artifact в учебный registry и запишите tag/digest в release-notes черновик."}
        </Lead>

        <CodeSequence
          title="Соберите безопасный порядок"
          prompt="Расположите действия так, чтобы каждый следующий шаг использовал только проверенный результат предыдущего."
          pieces={[
            { id: "green", code: "дождаться зелёных CI jobs" },
            { id: "tag", code: "вычислить tag из commit SHA" },
            { id: "build", code: "собрать image" },
            { id: "smoke", code: "проверить container" },
            { id: "login", code: "аутентифицироваться в registry" },
            { id: "push", code: "опубликовать тот же image" }
          ]}
          correctOrder={["green", "tag", "build", "smoke", "login", "push"]}
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
            question={"Почему tag по SHA полезен?"}
            options={["Связывает image с точным commit", "Скрывает историю", "Ускоряет PostgreSQL"]}
            correctIndex={0}
            explanation={"SHA обеспечивает прослеживаемость."}
          />
          <QuizCard
            question={"Когда допустим push image?"}
            options={["После обязательных checks и smoke test", "До checkout", "После падения tests"]}
            correctIndex={0}
            explanation={"Registry должен получать проверенный artifact."}
          />
          <QuizCard
            question={"Где должны находиться production secrets?"}
            options={["В environment/runtime configuration", "В Dockerfile", "В image label"]}
            correctIndex={0}
            explanation={"Artifact не должен содержать секреты окружения."}
          />
          <QuizCard
            question={"Что неизменяемо после публикации?"}
            options={["Содержимое image digest", "Значение alias main", "Production logs"]}
            correctIndex={0}
            explanation={"Digest адресует конкретное содержимое."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Image собирается только из проверенного commit."}</>,
            <>{"SHA tag связывает artifact с исходным кодом."}</>,
            <>{"Digest точнее описывает неизменяемое содержимое."}</>,
            <>{"`latest` или `main` не должны быть единственным адресом версии."}</>,
            <>{"Container проверяется до публикации."}</>,
            <>{"Registry credentials не записываются в workflow текстом."}</>,
            <>{"Production secrets не входят в image layers."}</>
          ]}
        />

        <PracticeCta text={"Добавьте build job после quality и integration, соберите image с SHA tag, запустите `/health` против container, затем опубликуйте artifact в учебный registry и запишите tag/digest в release-notes черновик."} />
      </Section>
    </RichLesson>
  );
}

// 187. Deployment, secrets и production configuration
export function Lesson187({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Deployment, secrets и production configuration"}
        intro={"Развернём конкретный image tag на одном учебном host и отделим artifact от production configuration. Секреты попадут в защищённое environment, migrations выполнятся до открытия traffic, а первый запуск будет проверен по logs и `/health`."}
        tags={[
          { icon: <Cloud size={14} />, label: "registry → host → API" },
          { icon: <KeyRound size={14} />, label: "artifact ≠ secrets" },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с этапом."}</strong>
        {" Registry уже хранит проверенный image. Следующий шаг — запустить именно эту версию с production config, не изменяя artifact. "}
        <strong>{"Важно не перепутать:"}</strong>
        {" Платформа не объявляется единственно правильной. Kubernetes, Terraform и сложная orchestration не нужны для первого контролируемого deployment."}
      </Callout>

      <Section number="01" title="Зачем тема появляется сейчас">
        <Lead>
          {"Развернём конкретный image tag на одном учебном host и отделим artifact от production configuration. Секреты попадут в защищённое environment, migrations выполнятся до открытия traffic, а первый запуск будет проверен по logs и `/health`."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Выбрать exact image: "}</strong>
              {"deploy job получает SHA tag, созданный предыдущим job."}
            </li>
            <li>
              <strong>{"Открыть production environment: "}</strong>
              {"secrets становятся доступны только deployment job."}
            </li>
            <li>
              <strong>{"Применить migrations: "}</strong>
              {"schema обновляется контролируемой командой до запуска новой версии."}
            </li>
            <li>
              <strong>{"Проверить запуск: "}</strong>
              {"прочитать logs и открыть внешний `/health`."}
            </li>
          </ol>
          <p>
            {"Итог занятия — проверяемое изменение Deployable StudyHub, которое другой разработчик может повторить по команде, workflow или runbook."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"artifact"} title={"Одинаковый"}>
            {"одинаковый Docker image для всех environments"}
          </TypeCard>
          <TypeCard badge={"configuration"} badgeTone={"float"} title={"Несекретные"}>
            {"несекретные значения конкретной среды"}
          </TypeCard>
          <TypeCard badge={"secret"} badgeTone={"str"} title={"Чувствительное"}>
            {"чувствительное runtime-значение с ограниченным доступом"}
          </TypeCard>
          <TypeCard badge={"deployment environment"} title={"Цель"}>
            {"цель выпуска и её protection rules"}
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
          question={"Какую проблему решает занятие 187 и чем подтверждается результат?"}
          hint="Назовите исходный риск, одно изменение и воспроизводимую проверку."
          answer={
            <p>
              {"Registry уже хранит проверенный image. Следующий шаг — запустить именно эту версию с production config, не изменяя artifact. Результат подтверждается не описанием, а зелёным gate, smoke test, log или повторяемым runbook."}
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
            [<>"artifact"</>, "одинаковый Docker image для всех environments"],
            [<>"configuration"</>, "несекретные значения конкретной среды"],
            [<>"secret"</>, "чувствительное runtime-значение с ограниченным доступом"],
            [<>"deployment environment"</>, "цель выпуска и её protection rules"]
          ]}
        />

        <MatchPairs
          prompt="Соедините понятие и его ответственность."
          leftTitle="Понятие"
          rightTitle="Ответственность"
          pairs={[
            { left: "artifact", right: "одинаковый Docker image для всех environments" },
            { left: "configuration", right: "несекретные значения конкретной среды" },
            { left: "secret", right: "чувствительное runtime-значение с ограниченным доступом" },
            { left: "deployment environment", right: "цель выпуска и её protection rules" }
          ]}
          explanation="Пара считается усвоенной, когда вы можете назвать не только определение, но и момент использования в release pipeline."
        />

        <div className="lesson-practice-steps">
          <h3>{"Вход"}</h3>
          <p>{"artifact получает конкретный commit, configuration или состояние предыдущего шага, а не случайные локальные файлы."}</p>
          <h3>{"Действие"}</h3>
          <p>{"Один step выполняет одну понятную команду и возвращает явный exit code."}</p>
          <h3>{"Результат"}</h3>
          <p>{"deployment environment фиксирует наблюдаемый итог: green check, image tag, health response или восстановленную версию."}</p>
          <h3>{"Граница"}</h3>
          <p>{"Платформа не объявляется единственно правильной. Kubernetes, Terraform и сложная orchestration не нужны для первого контролируемого deployment."}</p>
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
          caption={"provider-neutral deploy job"}
          code={"deploy:\n  needs: build_image\n  runs-on: ubuntu-latest\n  environment: production\n  concurrency:\n    group: production\n    cancel-in-progress: false\n\n  steps:\n    - name: Deploy exact image tag\n      env:\n        DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}\n        DEPLOY_USER: ${{ secrets.DEPLOY_USER }}\n        DEPLOY_SSH_KEY: ${{ secrets.DEPLOY_SSH_KEY }}\n        IMAGE_TAG: ghcr.io/${{ github.repository }}:${{ github.sha }}\n      run: |\n        install -m 700 -d ~/.ssh\n        printf '%s' \"$DEPLOY_SSH_KEY\" > ~/.ssh/id_ed25519\n        chmod 600 ~/.ssh/id_ed25519\n        ssh -o StrictHostKeyChecking=yes                       \"$DEPLOY_USER@$DEPLOY_HOST\"                       \"cd /srv/studyhub && IMAGE_TAG='$IMAGE_TAG' ./scripts/deploy.sh\""}
        />

        <StepThrough
          code={"deploy:\n  needs: build_image\n  runs-on: ubuntu-latest\n  environment: production\n  concurrency:\n    group: production\n    cancel-in-progress: false\n\n  steps:\n    - name: Deploy exact image tag\n      env:\n        DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}\n        DEPLOY_USER: ${{ secrets.DEPLOY_USER }}\n        DEPLOY_SSH_KEY: ${{ secrets.DEPLOY_SSH_KEY }}\n        IMAGE_TAG: ghcr.io/${{ github.repository }}:${{ github.sha }}\n      run: |\n        install -m 700 -d ~/.ssh\n        printf '%s' \"$DEPLOY_SSH_KEY\" > ~/.ssh/id_ed25519\n        chmod 600 ~/.ssh/id_ed25519\n        ssh -o StrictHostKeyChecking=yes                       \"$DEPLOY_USER@$DEPLOY_HOST\"                       \"cd /srv/studyhub && IMAGE_TAG='$IMAGE_TAG' ./scripts/deploy.sh\""}
          steps={[
            { line: 1, note: "Deploy ждёт published image.", vars: { "needs": "build_image" } },
            { line: 3, note: "Environment отделяет production secrets и protection rules.", vars: { "environment": "production" } },
            { line: 4, note: "Concurrency не позволяет двум releases менять host одновременно.", vars: { "group": "production" } },
            { line: 12, note: "Secrets передаются только текущему step.", vars: { "scope": "runtime" } },
            { line: 15, note: "Deploy использует exact SHA tag.", vars: { "image": "github.sha" } },
            { line: 21, note: "Host-side script отвечает за понятную процедуру обновления.", vars: { "script": "deploy.sh" } }
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
            title: "Секреты в repository",
            code: "DATABASE_URL=postgresql://admin:password@db/prod\nSECRET_KEY=plain-text-secret",
            note: "Значения попадают в Git history, forks и случайные logs.",
          }}
          right={{
            title: "Secrets среды выполнения",
            code: "environment: production\nenv:\n  DATABASE_URL: ${{ secrets.DATABASE_URL }}\n  SECRET_KEY: ${{ secrets.SECRET_KEY }}",
            note: "Workflow ссылается на имена, а значения выдаются только защищённому job.",
          }}
          preferred="right"
          explanation={"Repository хранит контракт конфигурации, но реальные production values принадлежат deployment environment."}
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
          {"Repository хранит контракт конфигурации, но реальные production values принадлежат deployment environment."}
        </Callout>
      </Section>

      <Section number="05" title="Ожидаемый сбой и диагностика">
        <Lead>
          {"Инфраструктурный навык проявляется не в идеальном первом запуске, а в способности локализовать сбой по первому красному шагу, logs и состоянию зависимостей."}
        </Lead>

        <BugHunt
          code={"- name: Debug configuration\n  run: |\n    echo \"DATABASE_URL=${{ secrets.DATABASE_URL }}\"\n    echo \"SECRET_KEY=${{ secrets.SECRET_KEY }}\""}
          question={"Почему такой debug step нужно удалить?"}
          options={["Он пытается вывести чувствительные значения в logs", "GitHub Actions не поддерживает echo", "Secrets доступны только Python"]}
          correctIndex={0}
          explanation={"Маскирование не является разрешением печатать секреты; производные и преобразованные значения могут раскрыться."}
          fix={"- name: Validate configuration contract\n  run: |\n    test -n \"${DATABASE_URL:-}\"\n    test -n \"${SECRET_KEY:-}\"\n    echo \"required settings are present\""}
        />

        <TerminalDemo
          title="воспроизводимая проверка"
          lines={[
            { cmd: "IMAGE_TAG=ghcr.io/acme/studyhub:31ac8e1 ./scripts/deploy.sh" },
            { out: "Pulling image...\nMigrations: head\nContainer studyhub-api started" },
            { cmd: "docker compose logs --tail=20 api" },
            { out: "INFO application startup complete\nINFO listening on 0.0.0.0:8000" },
            { cmd: "curl --fail https://studyhub.example/health" },
            { out: "{\"status\":\"ok\",\"version\":\"31ac8e1\"}" }
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
          caption={"host-side scripts/deploy.sh"}
          code={"set -euo pipefail\n: \"${IMAGE_TAG:?IMAGE_TAG is required}\"\n\nexport STUDYHUB_IMAGE=\"$IMAGE_TAG\"\n\ndocker pull \"$STUDYHUB_IMAGE\"\ndocker compose run --rm migrations\ndocker compose up -d --no-build api\ndocker compose ps"}
        />

        <BranchExplorer
          code={"exact image exists in registry\n  ↓\nproduction approval / protection\n  ↓\nhost pulls image\n  ↓\nmigrations succeed?\n  ├── no  → stop release, keep previous API\n  └── yes → start new API\n             ↓\n           /health and logs"}
          scenarios={[
            { label: "missing secret", activeLine: 3, output: "deployment job не должен стартовать с неполным config" },
            { label: "migration failed", activeLine: 7, output: "release останавливается до переключения API" },
            { label: "new API healthy", activeLine: 10, output: "версия переходит к post-deploy smoke tests" }
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Наблюдаемый успех"}</h3>
          <p>{"Запишите конкретный check, endpoint, tag или migration revision, который подтверждает завершение шага."}</p>
          <h3>{"Ожидаемая ошибка"}</h3>
          <p>{"Создайте безопасный учебный дефект и подтвердите, что pipeline останавливается до опасного действия."}</p>
          <h3>{"Артефакт занятия"}</h3>
          <p>{"Обновите workflow, script, README или runbook так, чтобы следующий разработчик повторил занятие 187 без устных подсказок."}</p>
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
          {"Создайте production environment с тестовыми secrets, напишите `scripts/deploy.sh`, разверните exact SHA tag на учебном host, проверьте, что `.env` и значения secrets отсутствуют в Git и image, затем сохраните первые 20 строк безопасных startup logs."}
        </Lead>

        <CodeSequence
          title="Соберите безопасный порядок"
          prompt="Расположите действия так, чтобы каждый следующий шаг использовал только проверенный результат предыдущего."
          pieces={[
            { id: "artifact", code: "выбрать exact image tag" },
            { id: "approval", code: "пройти environment protection" },
            { id: "config", code: "проверить наличие production config" },
            { id: "pull", code: "получить image на host" },
            { id: "migrate", code: "применить migrations" },
            { id: "start", code: "запустить API и прочитать logs" }
          ]}
          correctOrder={["artifact", "approval", "config", "pull", "migrate", "start"]}
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
            question={"Что отделяется от Docker image?"}
            options={["Production configuration и secrets", "Python source", "Installed dependencies"]}
            correctIndex={0}
            explanation={"Один artifact запускается с разными runtime values."}
          />
          <QuizCard
            question={"Зачем environment: production?"}
            options={["Ограничить target, secrets и protection rules", "Создать Dockerfile", "Запустить pytest локально"]}
            correctIndex={0}
            explanation={"Environment описывает цель deployment."}
          />
          <QuizCard
            question={"Почему deploy использует SHA tag?"}
            options={["Чтобы точно знать выпускаемую версию", "Чтобы скрыть registry", "Чтобы изменить source code на host"]}
            correctIndex={0}
            explanation={"Release должен быть прослеживаемым."}
          />
          <QuizCard
            question={"Что делать при failed migration?"}
            options={["Остановить release до запуска новой API", "Игнорировать и продолжить", "Удалить migration history"]}
            correctIndex={0}
            explanation={"Schema gate является обязательной границей."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Artifact и production configuration имеют разные жизненные циклы."}</>,
            <>{"Secrets не сохраняются в Git или Docker image."}</>,
            <>{"Production environment ограничивает доступ к deployment values."}</>,
            <>{"Exact SHA tag определяет выпускаемую версию."}</>,
            <>{"Одновременно выполняется только один production deployment."}</>,
            <>{"Migrations завершаются до запуска новой API."}</>,
            <>{"Startup logs и `/health` подтверждают первый запуск."}</>
          ]}
        />

        <PracticeCta text={"Создайте production environment с тестовыми secrets, напишите `scripts/deploy.sh`, разверните exact SHA tag на учебном host, проверьте, что `.env` и значения secrets отсутствуют в Git и image, затем сохраните первые 20 строк безопасных startup logs."} />
      </Section>
    </RichLesson>
  );
}

// 188. Smoke test, rollback и Release StudyHub
export function Lesson188({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Smoke test, rollback и Release StudyHub"}
        intro={"Завершим этап процедурой, а не разовой удачей: после deployment проверим health, readiness, migrations и один ключевой API-сценарий. Затем намеренно выпустим дефектный tag, обнаружим его smoke test и вернём предыдущий image."}
        tags={[
          { icon: <Trophy size={14} />, label: "release checklist" },
          { icon: <Save size={14} />, label: "smoke test · rollback" },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с этапом."}</strong>
        {" Deployment уже запускает exact image с production config. Теперь release должен доказать работоспособность и иметь обратимый путь. "}
        <strong>{"Важно не перепутать:"}</strong>
        {" Blue-green, canary и zero-downtime migrations остаются дальнейшими темами. Здесь нужен один надёжный deployment и проверенный rollback."}
      </Callout>

      <Section number="01" title="Зачем тема появляется сейчас">
        <Lead>
          {"Завершим этап процедурой, а не разовой удачей: после deployment проверим health, readiness, migrations и один ключевой API-сценарий. Затем намеренно выпустим дефектный tag, обнаружим его smoke test и вернём предыдущий image."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Сохранить предыдущую версию: "}</strong>
              {"до изменений записать current image tag и migration revision."}
            </li>
            <li>
              <strong>{"Выполнить smoke tests: "}</strong>
              {"проверить быстрые признаки жизнеспособности и ключевой сценарий."}
            </li>
            <li>
              <strong>{"Принять решение: "}</strong>
              {"оставить release или немедленно запустить rollback."}
            </li>
            <li>
              <strong>{"Оформить результат: "}</strong>
              {"создать release notes, checklist и короткий incident note при сбое."}
            </li>
          </ol>
          <p>
            {"Итог занятия — проверяемое изменение Deployable StudyHub, которое другой разработчик может повторить по команде, workflow или runbook."}
          </p>
        </div>

        <TypeCards>
          <TypeCard badge={"smoke test"} title={"Быстрая"}>
            {"быстрая проверка критического пути после deploy"}
          </TypeCard>
          <TypeCard badge={"release checklist"} badgeTone={"float"} title={"Обязательный"}>
            {"обязательный порядок до и после выпуска"}
          </TypeCard>
          <TypeCard badge={"rollback"} badgeTone={"str"} title={"Возврат"}>
            {"возврат к известному рабочему image tag"}
          </TypeCard>
          <TypeCard badge={"release notes"} title={"Связь"}>
            {"связь версии, изменений, migrations и ограничений"}
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
          question={"Какую проблему решает занятие 188 и чем подтверждается результат?"}
          hint="Назовите исходный риск, одно изменение и воспроизводимую проверку."
          answer={
            <p>
              {"Deployment уже запускает exact image с production config. Теперь release должен доказать работоспособность и иметь обратимый путь. Результат подтверждается не описанием, а зелёным gate, smoke test, log или повторяемым runbook."}
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
            [<>"smoke test"</>, "быстрая проверка критического пути после deploy"],
            [<>"release checklist"</>, "обязательный порядок до и после выпуска"],
            [<>"rollback"</>, "возврат к известному рабочему image tag"],
            [<>"release notes"</>, "связь версии, изменений, migrations и ограничений"]
          ]}
        />

        <MatchPairs
          prompt="Соедините понятие и его ответственность."
          leftTitle="Понятие"
          rightTitle="Ответственность"
          pairs={[
            { left: "smoke test", right: "быстрая проверка критического пути после deploy" },
            { left: "release checklist", right: "обязательный порядок до и после выпуска" },
            { left: "rollback", right: "возврат к известному рабочему image tag" },
            { left: "release notes", right: "связь версии, изменений, migrations и ограничений" }
          ]}
          explanation="Пара считается усвоенной, когда вы можете назвать не только определение, но и момент использования в release pipeline."
        />

        <div className="lesson-practice-steps">
          <h3>{"Вход"}</h3>
          <p>{"smoke test получает конкретный commit, configuration или состояние предыдущего шага, а не случайные локальные файлы."}</p>
          <h3>{"Действие"}</h3>
          <p>{"Один step выполняет одну понятную команду и возвращает явный exit code."}</p>
          <h3>{"Результат"}</h3>
          <p>{"release notes фиксирует наблюдаемый итог: green check, image tag, health response или восстановленную версию."}</p>
          <h3>{"Граница"}</h3>
          <p>{"Blue-green, canary и zero-downtime migrations остаются дальнейшими темами. Здесь нужен один надёжный deployment и проверенный rollback."}</p>
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
          caption={"scripts/smoke.py"}
          code={"import json\nimport os\nfrom urllib.request import Request, urlopen\n\nBASE_URL = os.environ[\"BASE_URL\"].rstrip(\"/\")\n\n\ndef get_json(path: str) -> dict:\n    request = Request(BASE_URL + path, headers={\"Accept\": \"application/json\"})\n    with urlopen(request, timeout=5) as response:\n        if response.status != 200:\n            raise RuntimeError(f\"{path}: HTTP {response.status}\")\n        return json.load(response)\n\n\ndef main() -> None:\n    health = get_json(\"/health\")\n    ready = get_json(\"/ready\")\n    tasks = get_json(\"/api/v1/tasks?limit=1\")\n\n    assert health[\"status\"] == \"ok\"\n    assert ready[\"status\"] == \"ready\"\n    assert \"items\" in tasks\n\n    print(\"smoke tests passed\")\n\n\nif __name__ == \"__main__\":\n    main()"}
        />

        <StepThrough
          code={"import json\nimport os\nfrom urllib.request import Request, urlopen\n\nBASE_URL = os.environ[\"BASE_URL\"].rstrip(\"/\")\n\n\ndef get_json(path: str) -> dict:\n    request = Request(BASE_URL + path, headers={\"Accept\": \"application/json\"})\n    with urlopen(request, timeout=5) as response:\n        if response.status != 200:\n            raise RuntimeError(f\"{path}: HTTP {response.status}\")\n        return json.load(response)\n\n\ndef main() -> None:\n    health = get_json(\"/health\")\n    ready = get_json(\"/ready\")\n    tasks = get_json(\"/api/v1/tasks?limit=1\")\n\n    assert health[\"status\"] == \"ok\"\n    assert ready[\"status\"] == \"ready\"\n    assert \"items\" in tasks\n\n    print(\"smoke tests passed\")\n\n\nif __name__ == \"__main__\":\n    main()"}
          steps={[
            { line: 4, note: "BASE_URL передаётся средой deployment.", vars: { "target": "production URL" } },
            { line: 8, note: "Один helper задаёт timeout и проверяет HTTP status.", vars: { "timeout": "5s" } },
            { line: 17, note: "Health подтверждает жизнь process.", vars: { "check": "/health" } },
            { line: 18, note: "Ready подтверждает доступность критических dependencies.", vars: { "check": "/ready" } },
            { line: 19, note: "Один чтение API проверяет реальный routing и database path.", vars: { "scenario": "tasks list" } },
            { line: 25, note: "Exit code 0 появляется только при полном успехе.", vars: { "result": "release accepted" } }
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
            title: "Rollback на latest",
            code: "STUDYHUB_IMAGE=ghcr.io/acme/studyhub:latest",
            note: "Не гарантировано, что alias всё ещё указывает на предыдущую рабочую версию.",
          }}
          right={{
            title: "Rollback на сохранённый tag",
            code: "STUDYHUB_IMAGE=ghcr.io/acme/studyhub:31ac8e1",
            note: "Runbook возвращает точно проверенный artifact.",
          }}
          preferred="right"
          explanation={"Rollback требует заранее известной версии; неопределённый alias не является планом восстановления."}
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
          {"Rollback требует заранее известной версии; неопределённый alias не является планом восстановления."}
        </Callout>
      </Section>

      <Section number="05" title="Ожидаемый сбой и диагностика">
        <Lead>
          {"Инфраструктурный навык проявляется не в идеальном первом запуске, а в способности локализовать сбой по первому красному шагу, logs и состоянию зависимостей."}
        </Lead>

        <BugHunt
          code={"deploy new image\n→ /health returns 200\n→ release marked successful\n\n# но /api/v1/tasks возвращает 500 из-за несовместимой schema"}
          question={"Почему одного `/health` недостаточно для acceptance release?"}
          options={["Он может не проверять database-backed пользовательский сценарий", "HTTP 200 всегда означает ошибку", "Smoke tests должны проверять все edge cases"]}
          correctIndex={0}
          explanation={"Health должен быть быстрым, а отдельный smoke scenario подтверждает критический путь API и database."}
          fix={"/health   → process alive\n/ready    → critical dependencies ready\n/api/v1/tasks?limit=1 → routing + auth contract + database read\nmigration revision    → expected Alembic head"}
        />

        <TerminalDemo
          title="воспроизводимая проверка"
          lines={[
            { cmd: "BASE_URL=https://studyhub.example python scripts/smoke.py" },
            { out: "smoke tests passed" },
            { cmd: "docker compose logs --since=10m api > artifacts/release-logs.txt" },
            { cmd: "PREVIOUS_IMAGE=ghcr.io/acme/studyhub:31ac8e1 ./scripts/rollback.sh" },
            { out: "Pull complete\nContainer recreated\nsmoke tests passed" },
            { cmd: "git tag -a v0.8.0 -m \"Deployable StudyHub\"" }
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
          caption={"scripts/rollback.sh"}
          code={"set -euo pipefail\n: \"${PREVIOUS_IMAGE:?PREVIOUS_IMAGE is required}\"\n\nexport STUDYHUB_IMAGE=\"$PREVIOUS_IMAGE\"\ndocker pull \"$STUDYHUB_IMAGE\"\ndocker compose up -d --no-build api\n\nBASE_URL=\"${BASE_URL:?BASE_URL is required}\"               python scripts/smoke.py"}
        />

        <BranchExplorer
          code={"deploy candidate tag\n  ↓\nsmoke tests\n  ├── pass → record release notes and keep version\n  └── fail → collect logs\n             ↓\n           start rollback with previous tag\n             ↓\n           repeat smoke tests\n             ├── fail → incident remains open\n             └── pass → service restored"}
          scenarios={[
            { label: "candidate passed", activeLine: 3, output: "release фиксируется как рабочий" },
            { label: "candidate failed", activeLine: 5, output: "logs сохраняются до rollback" },
            { label: "previous tag passed", activeLine: 10, output: "доступность восстановлена и incident документируется" }
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Наблюдаемый успех"}</h3>
          <p>{"Запишите конкретный check, endpoint, tag или migration revision, который подтверждает завершение шага."}</p>
          <h3>{"Ожидаемая ошибка"}</h3>
          <p>{"Создайте безопасный учебный дефект и подтвердите, что pipeline останавливается до опасного действия."}</p>
          <h3>{"Артефакт занятия"}</h3>
          <p>{"Обновите workflow, script, README или runbook так, чтобы следующий разработчик повторил занятие 188 без устных подсказок."}</p>
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
          {"Выпустите candidate tag, сохраните previous tag, выполните `scripts/smoke.py`, намеренно сломайте один database-backed endpoint в следующей версии, соберите logs, выполните rollback и подтвердите восстановление тем же smoke suite."}
        </Lead>

        <CodeSequence
          title="Соберите безопасный порядок"
          prompt="Расположите действия так, чтобы каждый следующий шаг использовал только проверенный результат предыдущего."
          pieces={[
            { id: "record", code: "записать previous image tag" },
            { id: "deploy", code: "развернуть candidate" },
            { id: "smoke", code: "выполнить post-deploy smoke tests" },
            { id: "decision", code: "принять release или rollback" },
            { id: "verify", code: "повторить smoke test после решения" },
            { id: "notes", code: "оформить release notes и incident note" }
          ]}
          correctOrder={["record", "deploy", "smoke", "decision", "verify", "notes"]}
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
            question={"Что нужно сохранить до deployment?"}
            options={["Previous image tag", "Только latest alias", "Локальный __pycache__"]}
            correctIndex={0}
            explanation={"Rollback требует известного рабочего artifact."}
          />
          <QuizCard
            question={"Чем readiness отличается от health?"}
            options={["Проверяет готовность dependencies принимать traffic", "Всегда удаляет container", "Публикует image"]}
            correctIndex={0}
            explanation={"Живой process может быть не готов обслуживать requests."}
          />
          <QuizCard
            question={"Когда release принимается?"}
            options={["После обязательных smoke tests", "Сразу после docker pull", "После первого log line"]}
            correctIndex={0}
            explanation={"Deployment не равен проверенному release."}
          />
          <QuizCard
            question={"Что делать после rollback?"}
            options={["Повторить smoke tests и оформить incident note", "Удалить logs", "Переписать Git history"]}
            correctIndex={0}
            explanation={"Нужно доказать восстановление и сохранить факты расследования."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Deployment становится release только после проверки."}</>,
            <>{"Previous image tag сохраняется до изменения production."}</>,
            <>{"Health, readiness и ключевой API-сценарий проверяют разные границы."}</>,
            <>{"Smoke suite короткий, но затрагивает критический путь."}</>,
            <>{"Failed candidate приводит к сбору logs и rollback."}</>,
            <>{"Rollback проверяется теми же smoke tests."}</>,
            <>{"Release notes связывают version, commit, migrations и ограничения."}</>,
            <>{"Deployable StudyHub воспроизводим от pull request до восстановления."}</>
          ]}
        />

        <PracticeCta text={"Выпустите candidate tag, сохраните previous tag, выполните `scripts/smoke.py`, намеренно сломайте один database-backed endpoint в следующей версии, соберите logs, выполните rollback и подтвердите восстановление тем же smoke suite."} />
      </Section>
    </RichLesson>
  );
}

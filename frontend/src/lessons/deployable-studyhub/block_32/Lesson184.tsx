import { FileText, Github } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 32 · GitHub Actions, CI/CD и первый деплой";

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

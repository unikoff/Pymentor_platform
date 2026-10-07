import { GitBranch, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 32 · GitHub Actions, CI/CD и первый деплой";

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

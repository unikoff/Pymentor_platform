import { Save, Trophy } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 32 · GitHub Actions, CI/CD и первый деплой";

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

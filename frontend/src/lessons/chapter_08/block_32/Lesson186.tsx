import { Cloud, Package } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 32 · GitHub Actions, CI/CD и первый деплой";

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

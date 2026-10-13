import { Cloud, KeyRound } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 32 · GitHub Actions, CI/CD и первый деплой";

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

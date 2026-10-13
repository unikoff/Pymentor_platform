import { Package, Trophy } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 36 · Финальное качество, портфолио и интервью";

export function Lesson212({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"StudyHub LMS Release и финальная защита"}
        intro={"Соберём последний контролируемый выпуск StudyHub LMS: заморозим scope, пройдём quality gates и migrations, создадим immutable tag, развернём чистое окружение, покажем teacher/student/admin flow, воспроизведём failure и rollback, а затем защитим ключевые решения."}
        tags={[
          { icon: <Trophy size={14} />, label: "release · demo · rollback" },
          { icon: <Package size={14} />, label: "защита решений и следующий план" },
        ]}
      />

      <Callout tone="info">
        <strong>{"Связь с проектом."}</strong> {"Предыдущие занятия сделали контракт, качество и документацию проверяемыми. Финал соединяет код, эксплуатацию и объяснение в один воспроизводимый release, а не добавляет последнюю случайную функцию."}{" "}
        <strong>{"Важно не перепутать:"}</strong> {"Защита не является сертификатом production security и не гарантирует трудоустройство. Она подтверждает готовность показывать junior-level backend, принимать review и продолжать системную практику."}
      </Callout>

      <Section number="01" title={"Релиз — это воспроизводимая версия"}>
        <Lead>
          {"Соберём последний контролируемый выпуск StudyHub LMS: заморозим scope, пройдём quality gates и migrations, создадим immutable tag, развернём чистое окружение, покажем teacher/student/admin flow, воспроизведём failure и rollback, а затем защитим ключевые решения."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Заморозить scope"}:</strong> {"не добавлять функции после release candidate; исправлять только подтверждённые blockers."}
            </li>
            <li>
              <strong>{"Собрать evidence"}:</strong> {"quality gate, clean migrations, image digest, smoke test и release notes."}
            </li>
            <li>
              <strong>{"Провести demo"}:</strong> {"показать teacher, student и admin flow по короткому воспроизводимому сценарию."}
            </li>
            <li>
              <strong>{"Защитить решение"}:</strong> {"объяснить архитектуру, ограничения, failure/rollback и план следующих 8–12 недель."}
            </li>
          </ol>
          <p>{"Маршрут заканчивается проверяемым артефактом, а не только чтением теории."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"artifact"} title={"Immutable release"}>
            {"Git tag, Docker image по SHA и release notes обозначают одну версию."}
          </TypeCard>
          <TypeCard badge={"evidence"} badgeTone="float" title={"Проверяемое качество"}>
            {"CI, tests, migration check, health/readiness и smoke scenario."}
          </TypeCard>
          <TypeCard badge={"demo"} badgeTone="str" title={"Пользовательский результат"}>
            {"Teacher публикует, student enrolls/completes, admin проверяет доступ."}
          </TypeCard>
          <TypeCard badge={"recovery"} title={"Контролируемый сбой"}>
            {"Команда показывает лог, определяет impact и возвращает предыдущий artifact."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question={"Какой проверяемый результат должно дать это занятие?"}
          hint={"Назовите не тему, а конкретный artifact или evidence."}
          answer={<p>{"Результат должен воспроизводиться другим человеком и иметь успешный, ошибочный и диагностический сценарий."}</p>}
        />
      </Section>

      <Section number="02" title={"Release manifest и evidence"}>
        <Lead>
          {"Сначала фиксируем небольшую модель, которая помогает принимать решения. Термин ценен только тогда, когда его можно связать с наблюдаемым поведением проекта."}
        </Lead>

        <MethodGrid
          rows={[
            [<>{"source commit"}</>, "один SHA, прошедший review и quality gates"],
            [<>{"database state"}</>, "alembic current = head и проверенный backup/restore runbook"],
            [<>{"runtime artifact"}</>, "Docker image с immutable SHA tag и digest"],
            [<>{"deployment evidence"}</>, "health, readiness, smoke flow, logs и metrics"],
            [<>{"portfolio evidence"}</>, "README, diagrams, demo script, release notes и limitations"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините элемент модели с его практической ролью."}
          leftTitle={"Элемент"}
          rightTitle={"Роль"}
          pairs={[
            { left: "source commit", right: "один SHA, прошедший review и quality gates" },
            { left: "database state", right: "alembic current = head и проверенный backup/restore runbook" },
            { left: "runtime artifact", right: "Docker image с immutable SHA tag и digest" },
            { left: "deployment evidence", right: "health, readiness, smoke flow, logs и metrics" },
          ]}
          explanation={"Пары закрепляют не термин отдельно, а его место в рабочем процессе StudyHub."}
        />

        <TrueFalse
          statement={<>{"Для финального релиза достаточно, чтобы приложение успешно запускалось на компьютере автора."}</>}
          isTrue={false}
          explanation={"Release должен воспроизводиться из конкретного commit и artifact, проходить clean deployment и иметь проверяемый recovery path."}
        />

        <Callout tone="info">
          {"Модель должна сокращать область поиска решения. Если после схемы всё равно непонятно, что запускать и проверять, схема слишком абстрактна."}
        </Callout>
      </Section>

      <Section number="03" title={"Связываем commit, image и schema"}>
        <Lead>
          {"Разбираем минимальный рабочий фрагмент до интеграции. Сначала читаем контракт, затем прослеживаем значения и только после этого меняем одну деталь."}
        </Lead>

        <CodeBlock
          caption={"release manifest связывает commit, image и schema"}

          code={
            "from dataclasses import dataclass\n" +
            "\n" +
            "\n" +
            "@dataclass(frozen=True)\n" +
            "class ReleaseManifest:\n" +
            "    version: str\n" +
            "    commit_sha: str\n" +
            "    image: str\n" +
            "    migration_head: str\n" +
            "\n" +
            "\n" +
            "release = ReleaseManifest(\n" +
            "    version=\"v1.0.0\",\n" +
            "    commit_sha=\"8b1c2d3\",\n" +
            "    image=\"ghcr.io/example/studyhub:8b1c2d3\",\n" +
            "    migration_head=\"20260721_01\",\n" +
            ")"
          }
        />


        <StepThrough
          code={
            "from dataclasses import dataclass\n" +
            "\n" +
            "\n" +
            "@dataclass(frozen=True)\n" +
            "class ReleaseManifest:\n" +
            "    version: str\n" +
            "    commit_sha: str\n" +
            "    image: str\n" +
            "    migration_head: str\n" +
            "\n" +
            "\n" +
            "release = ReleaseManifest(\n" +
            "    version=\"v1.0.0\",\n" +
            "    commit_sha=\"8b1c2d3\",\n" +
            "    image=\"ghcr.io/example/studyhub:8b1c2d3\",\n" +
            "    migration_head=\"20260721_01\",\n" +
            ")"
          }
          steps={[
            { line: 4, note: "Frozen dataclass не даёт случайно изменить уже зафиксированный manifest.", vars: { "contract": "immutable" } },
            { line: 10, note: "Version удобна человеку, commit SHA связывает release с исходниками.", vars: { "version": "v1.0.0" } },
            { line: 12, note: "Image использует тот же SHA и не зависит от плавающего latest.", vars: { "artifact": "8b1c2d3" } },
            { line: 13, note: "Migration head фиксирует ожидаемое состояние database schema.", vars: { "schema": "20260721_01" } },
          ]}
        />

        <FillBlank
          prompt={"Какой tag лучше связывает runtime image с проверенным commit?"}
          before={""}
          after={""}
          options={["commit SHA", "latest", "local"]}
          answer={"commit SHA"}
          explanation={"SHA-tag позволяет однозначно определить исходный commit и повторно развернуть тот же artifact."}
        />

        <Callout tone="info">
          {"После заполнения измените одно входное значение, предскажите результат и только затем запускайте проверку."}
        </Callout>
      </Section>

      <Section number="04" title={"latest или immutable artifact"}>
        <Lead>
          {"Сравнение нужно не для выбора «красивого» кода, а для явного обсуждения контракта, риска и стоимости следующего изменения."}
        </Lead>

        <CompareSolutions
          question={"Какой release artifact проще проверить и откатить?"}
          left={{
            title: "Плавающий latest",
            code: "docker pull ghcr.io/example/studyhub:latest",
            note: "Один tag может начать указывать на другой image без изменения команды.",
          }}
          right={{
            title: "Immutable SHA",
            code: "docker pull ghcr.io/example/studyhub:8b1c2d3\n# digest: sha256:4a9...",
            note: "Commit, image и digest однозначно связаны.",
          }}
          preferred="right"
          explanation={"Rollback требует точно знать предыдущий artifact; плавающий tag не даёт такой гарантии."}
        />

        <div className="lesson-practice-steps">
          <h3>{"Сначала назовите критерий"}</h3>
          <p>{"До выбора варианта сформулируйте, какое свойство проекта нужно сохранить: совместимость, безопасность, воспроизводимость или понятность."}</p>
          <h3>{"Затем найдите evidence"}</h3>
          <p>{"Подтвердите решение тестом, логом, планом запроса, clean start или повторяемым demo-сценарием."}</p>
          <h3>{"После этого зафиксируйте границу"}</h3>
          <p>{"Укажите, при каком изменении требований выбранный вариант перестанет быть достаточным."}</p>
        </div>

        <RecallCard
          question={"Почему более сложный вариант не считается автоматически более профессиональным?"}
          answer={<p>{"Профессиональность определяется соответствием риску и требованиям. Лишний механизм увеличивает стоимость поддержки без доказанной пользы."}</p>}
        />
      </Section>

      <Section number="05" title={"Порядок deployment защищает schema"}>
        <Lead>
          {"Финальное качество проявляется в работе со сбоями. Намеренно запускаем дефектный сценарий, объясняем причину и проверяем исправление отдельным evidence."}
        </Lead>

        <BugHunt
          code={
            "docker compose pull api\n" +
            "docker compose up -d api\n" +
            "alembic upgrade head\n" +
            "curl --fail https://studyhub.example/health"
          }
          question={"Почему порядок опасен для несовместимой migration?"}
          options={[
            "Новый API получает traffic до завершения schema change",
            "curl нельзя использовать после Docker",
            "Migrations всегда выполняются автоматически",
          ]}
          correctIndex={0}
          explanation={"Новый process может начать обслуживать requests со старой schema, а failure migration оставит неоднозначное состояние."}
          fix={"docker compose pull api\n./scripts/backup.sh\ndocker compose run --rm migrations\ndocker compose up -d api\n./scripts/wait-ready.sh\n./scripts/smoke.sh"}
        />

        <div className="lesson-practice-steps">
          <h3>{"1. Воспроизведите"}</h3>
          <p>{"Сведите проблему к короткому сценарию и сохраните точный вход, команду и наблюдаемый результат."}</p>
          <h3>{"2. Найдите нарушенное ожидание"}</h3>
          <p>{"Не маскируйте симптом. Назовите контракт, который код нарушает, и слой, отвечающий за исправление."}</p>
          <h3>{"3. Защитите результат"}</h3>
          <p>{"Добавьте тест, проверку, runbook или diagnostic evidence, чтобы дефект не вернулся незаметно."}</p>
        </div>
      </Section>

      <Section number="06" title={"Проводим demo и recovery scenario"}>
        <Lead>
          {"Теперь переносим минимальную модель в StudyHub. Endpoint или infrastructure step остаётся координатором, а правило и диагностическая граница получают отдельное место."}
        </Lead>

        <CodeBlock
          caption={"финальный demo-сценарий"}

          code={
            "DEMO = [\n" +
            "    \"teacher logs in\",\n" +
            "    \"teacher creates course, module and lesson\",\n" +
            "    \"teacher publishes course\",\n" +
            "    \"student opens public catalog\",\n" +
            "    \"student enrolls\",\n" +
            "    \"student completes lesson\",\n" +
            "    \"student reads progress\",\n" +
            "    \"admin verifies audit event\",\n" +
            "    \"operator checks health, logs and cache behavior\",\n" +
            "]"
          }
        />


        <BranchExplorer
          code={
            "if smoke_status == \"passed\":\n" +
            "    publish_release_notes()\n" +
            "elif migration_status == \"failed\":\n" +
            "    stop_deployment_and_restore()\n" +
            "elif readiness_status == \"failed\":\n" +
            "    inspect_logs_and_keep_old_version()\n" +
            "else:\n" +
            "    rollback_to_previous_image()"
          }
          scenarios={[
            { label: "all checks green", activeLine: 1, output: "publish v1.0.0" },
            { label: "migration failure", activeLine: 3, output: "stop, diagnose, restore if required" },
            { label: "new API not ready", activeLine: 5, output: "old version keeps serving traffic" },
            { label: "smoke regression", activeLine: 7, output: "deploy previous SHA and verify recovery" },
          ]}
        />

        <TypeCards>
          <TypeCard badge={"01"} title={"Demo script"}>
            {"Один основной flow занимает 7–10 минут и заранее содержит ожидаемые statuses и данные."}
          </TypeCard>
          <TypeCard badge={"02"} badgeTone="float" title={"Architecture defense"}>
            {"Для каждого решения названы проблема, выбранный вариант, альтернатива и ограничение."}
          </TypeCard>
          <TypeCard badge={"03"} badgeTone="str" title={"Next plan"}>
            {"8–12 недель направлены на отклики, code review, дополнительные tasks и улучшение одного измеримого места проекта."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Интеграция считается завершённой только после проверки happy path, запрета или сбоя и возможности объяснить путь данных без чтения всего проекта."}
        </Callout>
      </Section>

      <Section number="07" title={"Выпускаем, проверяем и откатываем"}>
        <Lead>
          {"Финальный шаг урока превращает знание в воспроизводимую процедуру. Команды, ожидаемые результаты и порядок действий сохраняются в репозитории."}
        </Lead>

        <TerminalDemo
          title={"проверяем результат"}
          lines={[
            { cmd: "make release-check" },
            { out: "format ✓  lint ✓  tests 214 passed  migrations ✓  image scan ✓" },
            { cmd: "git tag -a v1.0.0 -m 'StudyHub LMS Release' && git push origin v1.0.0" },
            { cmd: "IMAGE_TAG=8b1c2d3 ./scripts/deploy.sh" },
            { out: "readiness: ok\nsmoke: teacher/student flow passed" },
            { cmd: "IMAGE_TAG=79aa110 ./scripts/rollback.sh" },
            { out: "rollback: complete\nhealth: ok\nsmoke: previous release passed" },
          ]}
        />

        <CodeSequence
          title={"Соберите рабочий порядок"}
          prompt={"Расположите шаги так, чтобы результат оставался проверяемым и обратимым."}
          pieces={[
            { id: "freeze", code: "заморозить scope и составить release candidate" },
            { id: "gate", code: "пройти tests, migrations, security и docs checks" },
            { id: "tag", code: "создать Git tag и immutable image" },
            { id: "deploy", code: "развернуть из чистого окружения" },
            { id: "smoke", code: "выполнить demo/smoke и recovery drill" },
            { id: "publish", code: "опубликовать notes, evidence и следующий план" },
          ]}
          correctOrder={["freeze", "gate", "tag", "deploy", "smoke", "publish"]}
          explanation={"Release публикуется только после воспроизводимого deployment, smoke test и проверенного recovery path."}
        />

        <div className="lesson-practice-steps">
          <h3>{"Коммит 1 — наблюдение"}</h3>
          <p>{"Зафиксируйте baseline, failing scenario или исходный документ до изменения."}</p>
          <h3>{"Коммит 2 — минимальное исправление"}</h3>
          <p>{"Измените только ответственную границу и сохраните маленький читаемый diff."}</p>
          <h3>{"Коммит 3 — evidence"}</h3>
          <p>{"Добавьте тест, документацию, diagram или runbook, который доказывает результат."}</p>
        </div>

        <RecallCard
          question={"Что должно позволить другому разработчику повторить результат?"}
          answer={<p>{"Точная последовательность команд, входные условия, ожидаемый вывод и путь диагностики отклонения."}</p>}
        />
      </Section>

      <Section number="08" title={"Контрольная точка и самостоятельная практика"}>
        <Lead>
          {"Ответьте на вопросы без запуска, затем проверьте себя. После контроля выполните проектную практику и объясните результат словами, не читая готовый текст."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что связывает deployed image с исходным кодом?"}
            options={[
              "Цвет badge",
              "Commit SHA tag и digest",
              "Имя разработчика",
            ]}
            correctIndex={1}
            explanation={"Immutable identifiers позволяют найти и повторить конкретный artifact."}
          />
          <QuizCard
            question={"Когда публиковать release notes?"}
            options={[
              "До smoke test",
              "После успешного clean deploy и smoke/recovery checks",
              "Сразу после первого commit",
            ]}
            correctIndex={1}
            explanation={"Notes должны описывать реально проверенный release."}
          />
          <QuizCard
            question={"Что показывать при failure scenario на защите?"}
            options={[
              "Только traceback",
              "Detection, impact, logs, решение и recovery verification",
              "Скрыть сбой",
            ]}
            correctIndex={1}
            explanation={"Контролируемая диагностика демонстрирует эксплуатационное мышление."}
          />
          <QuizCard
            question={"Что означает финальная защита?"}
            options={[
              "Гарантированное трудоустройство",
              "Готовность объяснять и развивать junior-level backend",
              "Enterprise certification",
            ]}
            correctIndex={1}
            explanation={"Результат курса — доказуемый проект и база для системных откликов и практики."}
          />
        </div>

        <KeyTakeaways
          points={[

            <>{"Release начинается с freeze scope и одного проверенного source commit."}</>,

            <>{"Git tag, image SHA/digest и migration head образуют воспроизводимый manifest."}</>,

            <>{"Clean deployment и smoke flow доказывают больше, чем запуск на машине автора."}</>,

            <>{"Failure/rollback scenario является частью release, а не импровизацией после аварии."}</>,

            <>{"Архитектурная защита связывает проблему, решение, альтернативу и ограничение."}</>,

            <>{"После релиза нужен конкретный 8–12-недельный план откликов, практики и улучшений."}</>,

          ]}
        />


        <PracticeCta text={"Соберите release candidate StudyHub LMS, пройдите полный gate, создайте immutable tag/image, разверните clean environment, проведите teacher/student/admin demo и один rollback drill. Подготовьте 12-минутную защиту и письменный план следующих 8–12 недель без обещаний автоматического трудоустройства."} />
      </Section>
    </RichLesson>
  );
}

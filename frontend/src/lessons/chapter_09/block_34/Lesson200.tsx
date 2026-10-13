import { Trophy, Workflow } from "lucide-react";
import { BugHunt, Callout, CodeSequence, KeyTakeaways, Lead, MatchPairs, MethodGrid, RecallCard, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 34 · Курсы, зачисление и прогресс";

export function Lesson200({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"End-to-end LMS flow и отрицательные тесты"}
        intro={"Соберём StudyHub LMS Core в единый доказуемый сценарий: teacher создаёт и публикует content, student записывается и завершает Lessons, admin проверяет систему, а test matrix защищает permissions и transactional invariants."}
        tags={[
          { icon: <Workflow size={14} />, label: "teacher + student flow" },
          { icon: <Trophy size={14} />, label: "E2E quality gate" },
        ]}
      />
      <TheoryBridge link={"Пять vertical slices уже работают отдельно. Финал блока проверяет их взаимодействие и доказывает, что успешный пользовательский путь не открывает запрещённые shortcuts."} boundary={"End-to-end test не заменяет unit и integration tests каждого use case. Он проверяет связность контракта через реальные HTTP boundaries и изолированную database."} />

      <Section number={"01"} title={"Финал блока — один пользовательский рассказ"}>
        <Lead>
          {"Хороший demo не перечисляет endpoints. Он показывает цель двух ролей: teacher публикует учебный продукт, student получает доступ и наблюдаемый progress."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Teacher lane"}</h3>
          <p>{"Create Course → add Modules/Lessons → publish."}</p>
          <h3>{"Student lane"}</h3>
          <p>{"Catalog → enrollment → completion → progress."}</p>
          <h3>{"Shared truth"}</h3>
          <p>{"PostgreSQL хранит content, permissions и факты прохождения."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Teacher:"}</strong> {" создаёт draft"}
            </li>
            <li>
              <strong>{"Content:"}</strong> {" добавляет ordered structure"}
            </li>
            <li>
              <strong>{"Publish:"}</strong> {" открывает Course"}
            </li>
            <li>
              <strong>{"Student:"}</strong> {" enrolls"}
            </li>
            <li>
              <strong>{"Learning:"}</strong> {" completes Lessons"}
            </li>
            <li>
              <strong>{"Proof:"}</strong> {" progress + database assertions"}
            </li>
          </ol>
        </div>

        <MethodGrid
          rows={[
            [<>{"Понять"}</>, "Назовите contract и boundary текущего раздела своими словами."],
            [<>{"Предсказать"}</>, "Измените один вход или роль и заранее определите status code и database effect."],
            [<>{"Проверить"}</>, "Запустите positive и negative scenario, затем перечитайте критическое состояние новой session."],
            [<>{"Объяснить"}</>, "Свяжите HTTP response, permission, transaction и invariant одной причинной цепочкой."],
          ]}
        />

        <RecallCard
          question={"Какой invariant защищает этот раздел и какой наблюдаемый факт докажет его нарушение?"}
          answer={
            <p>
              {"В этом уроке новая сущность не добавляется: качество повышается за счёт интеграции, отрицательных cases и воспроизводимости."}
            </p>
          }
        />

        <Callout tone="info">
          {"В этом уроке новая сущность не добавляется: качество повышается за счёт интеграции, отрицательных cases и воспроизводимости."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Test fixture создаёт роли, а не скрытую магию"}>
        <Lead>
          {"E2E test начинает с чистой database и явных actors. Authentication helpers возвращают headers/cookies, но не обходят настоящие permission dependencies."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Teacher fixture"}</h3>
          <p>{"User role=teacher + authenticated client."}</p>
          <h3>{"Student fixture"}</h3>
          <p>{"User role=student + отдельная identity."}</p>
          <h3>{"Admin fixture"}</h3>
          <p>{"Используется только для заявленного override scenario."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"teacher"} title={"Teacher client"} code={"Authorization: Bearer teacher-token"}>
            {"Создаёт и публикует собственный content."}
          </TypeCard>
          <TypeCard badge={"student"} badgeTone="float" title={"Student client"} code={"Authorization: Bearer student-token"}>
            {"Читает catalog, enrolls, completes."}
          </TypeCard>
          <TypeCard badge={"database"} badgeTone="str" title={"Clean DB"} code={"isolated test schema"}>
            {"Rollback/cleanup между tests."}
          </TypeCard>
        </TypeCards>

        <MethodGrid
          rows={[
            [<>{"Понять"}</>, "Назовите contract и boundary текущего раздела своими словами."],
            [<>{"Предсказать"}</>, "Измените один вход или роль и заранее определите status code и database effect."],
            [<>{"Проверить"}</>, "Запустите positive и negative scenario, затем перечитайте критическое состояние новой session."],
            [<>{"Объяснить"}</>, "Свяжите HTTP response, permission, transaction и invariant одной причинной цепочкой."],
          ]}
        />

        <RecallCard
          question={"Какой invariant защищает этот раздел и какой наблюдаемый факт докажет его нарушение?"}
          answer={
            <p>
              {"Один общий superuser client делает suite зелёным, но не проверяет реальные boundaries ролей."}
            </p>
          }
        />

        <Callout tone="info">
          {"Один общий superuser client делает suite зелёным, но не проверяет реальные boundaries ролей."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Happy path выполняется через HTTP contract"}>
        <Lead>
          {"Основной test использует status codes и response schemas так же, как внешний client, а затем проверяет ключевые rows в database."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Arrange"}</h3>
          <p>{"Создать teacher/student identities."}</p>
          <h3>{"Act"}</h3>
          <p>{"Пройти весь API flow по порядку."}</p>
          <h3>{"Assert"}</h3>
          <p>{"Проверить responses, ownership, unique rows и final percent."}</p>
        </div>

        <CodeSequence
          title={"Соберите E2E flow"}
          prompt={"Поставьте requests в пользовательском порядке."}
          pieces={[
            { id: "course", code: "teacher POST /courses" },
            { id: "module", code: "teacher POST /courses/{id}/modules" },
            { id: "lesson", code: "teacher POST /modules/{id}/lessons × 3" },
            { id: "publish", code: "teacher POST /courses/{id}/publish" },
            { id: "catalog", code: "student GET /catalog/courses" },
            { id: "enroll", code: "student POST /courses/{id}/enrollments" },
            { id: "complete", code: "student PUT completion × 3" },
            { id: "progress", code: "student GET progress" },
            { id: "wrong", code: "student publish course", note: "forbidden action" },
          ]}
          correctOrder={["course", "module", "lesson", "publish", "catalog", "enroll", "complete", "progress"]}
          explanation={"Каждый request использует id предыдущего response и формирует один непрерывный user story."}
        />

        <MethodGrid
          rows={[
            [<>{"Понять"}</>, "Назовите contract и boundary текущего раздела своими словами."],
            [<>{"Предсказать"}</>, "Измените один вход или роль и заранее определите status code и database effect."],
            [<>{"Проверить"}</>, "Запустите positive и negative scenario, затем перечитайте критическое состояние новой session."],
            [<>{"Объяснить"}</>, "Свяжите HTTP response, permission, transaction и invariant одной причинной цепочкой."],
          ]}
        />

        <RecallCard
          question={"Какой invariant защищает этот раздел и какой наблюдаемый факт докажет его нарушение?"}
          answer={
            <p>
              {"Не подставляйте id вручную из seed, если flow должен доказать, что create responses пригодны для дальнейшей работы."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не подставляйте id вручную из seed, если flow должен доказать, что create responses пригодны для дальнейшей работы."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Database assertions дополняют HTTP assertions"}>
        <Lead>
          {"200 или 201 подтверждает внешний контракт, но критические invariants нужно проверить напрямую: один Enrollment, три unique Completion, owner teacher и published status."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"HTTP layer"}</h3>
          <p>{"Status, error code, response shape."}</p>
          <h3>{"Database layer"}</h3>
          <p>{"Количество и связи rows после transaction."}</p>
          <h3>{"Fresh session"}</h3>
          <p>{"Проверка не использует stale identity map предыдущего request."}</p>
        </div>

        <StepThrough
          code={"response = student_client.get(f\"/enrollments/{enrollment_id}/progress\")\nassert response.status_code == 200\nassert response.json()[\"percent\"] == 100.0\n\nwith TestSession() as session:\n    enrollment_count = session.scalar(select(func.count(EnrollmentModel.id)))\n    completion_count = session.scalar(select(func.count(LessonCompletionModel.id)))\n    assert enrollment_count == 1\n    assert completion_count == 3"}
          steps={[
            { line: 0, note: "Client проверяет публичный progress contract.", vars: { "status": "200" } },
            { line: 2, note: "Percent достигает 100 после трёх unique facts.", vars: { "percent": "100.0" } },
            { line: 4, note: "Новая session читает committed state.", vars: { "enrollments": "1" } },
            { line: 7, note: "Duplicate completion отсутствуют.", vars: { "completions": "3" } },
          ]}
        />

        <MethodGrid
          rows={[
            [<>{"Понять"}</>, "Назовите contract и boundary текущего раздела своими словами."],
            [<>{"Предсказать"}</>, "Измените один вход или роль и заранее определите status code и database effect."],
            [<>{"Проверить"}</>, "Запустите positive и negative scenario, затем перечитайте критическое состояние новой session."],
            [<>{"Объяснить"}</>, "Свяжите HTTP response, permission, transaction и invariant одной причинной цепочкой."],
          ]}
        />

        <RecallCard
          question={"Какой invariant защищает этот раздел и какой наблюдаемый факт докажет его нарушение?"}
          answer={
            <p>
              {"Database assertions выбираются точечно. Не нужно дублировать ORM-проверкой каждое поле response."}
            </p>
          }
        />

        <Callout tone="info">
          {"Database assertions выбираются точечно. Не нужно дублировать ORM-проверкой каждое поле response."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Negative matrix покрывает роли, state и связи"}>
        <Lead>
          {"Минимум десять запрещённых действий распределяются по причинам: authentication, role, ownership, state transition, relationship boundary и uniqueness."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Identity/role"}</h3>
          <p>{"Anonymous create, student create Course."}</p>
          <h3>{"Ownership"}</h3>
          <p>{"Другой teacher PATCH/publish."}</p>
          <h3>{"State"}</h3>
          <p>{"Enroll draft, publish empty Course."}</p>
          <h3>{"Relationship"}</h3>
          <p>{"Complete Lesson другого Course."}</p>
          <h3>{"Uniqueness"}</h3>
          <p>{"Duplicate slug, enrollment и completion."}</p>
        </div>

        <MatchPairs
          prompt={"Соедините forbidden scenario и ожидаемую защиту."}
          pairs={[
            { left: "student creates Course", right: "403 role permission" },
            { left: "other teacher patches Course", right: "403 ownership" },
            { left: "student enrolls draft", right: "404/409 state contract" },
            { left: "repeat enrollment", right: "409 unique pair" },
            { left: "complete Lesson from another Course", right: "domain conflict" },
            { left: "anonymous catalog detail of draft", right: "404 visibility" },
          ]}
          explanation={"Матрица связывает каждый отказ с конкретной boundary, а не с общим «что-то запрещено»."}
        />

        <MethodGrid
          rows={[
            [<>{"Понять"}</>, "Назовите contract и boundary текущего раздела своими словами."],
            [<>{"Предсказать"}</>, "Измените один вход или роль и заранее определите status code и database effect."],
            [<>{"Проверить"}</>, "Запустите positive и negative scenario, затем перечитайте критическое состояние новой session."],
            [<>{"Объяснить"}</>, "Свяжите HTTP response, permission, transaction и invariant одной причинной цепочкой."],
          ]}
        />

        <RecallCard
          question={"Какой invariant защищает этот раздел и какой наблюдаемый факт докажет его нарушение?"}
          answer={
            <p>
              {"Для каждого case тест проверяет не только response, но и отсутствие нежелательной database mutation."}
            </p>
          }
        />

        <Callout tone="info">
          {"Для каждого case тест проверяет не только response, но и отсутствие нежелательной database mutation."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Transaction consistency проверяется намеренным сбоем"}>
        <Lead>
          {"Некоторые operations состоят из нескольких изменений. Test должен вызвать ошибку после первой mutation внутри transaction и доказать полный rollback."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Reorder failure"}</h3>
          <p>{"Позиции остаются baseline."}</p>
          <h3>{"Enrollment conflict"}</h3>
          <p>{"Не появляется вторая row."}</p>
          <h3>{"Publish guard"}</h3>
          <p>{"Status остаётся draft, published_at null."}</p>
        </div>

        <BugHunt
          code={"course.status = CourseStatus.PUBLISHED\nawait session.flush()\nraise RuntimeError(\"simulated failure\")\n# no rollback assertion"}
          question={"Чего не хватает test scenario?"}
          options={["Проверки rollback и перечитывания Course", "Второго title Course", "Удаления всех migrations"]}
          correctIndex={0}
          explanation={"Намеренный сбой полезен только если test доказывает восстановление прежнего состояния."}
          fix={"with pytest.raises(RuntimeError):\n    await publish_with_failure(...)\nawait session.rollback()\ncourse = await session.get(CourseModel, course_id)\nassert course.status is CourseStatus.DRAFT"}
        />

        <MethodGrid
          rows={[
            [<>{"Понять"}</>, "Назовите contract и boundary текущего раздела своими словами."],
            [<>{"Предсказать"}</>, "Измените один вход или роль и заранее определите status code и database effect."],
            [<>{"Проверить"}</>, "Запустите positive и negative scenario, затем перечитайте критическое состояние новой session."],
            [<>{"Объяснить"}</>, "Свяжите HTTP response, permission, transaction и invariant одной причинной цепочкой."],
          ]}
        />

        <RecallCard
          question={"Какой invariant защищает этот раздел и какой наблюдаемый факт докажет его нарушение?"}
          answer={
            <p>
              {"Test не должен оставлять session в failed transaction и затем случайно падать в unrelated assertion."}
            </p>
          }
        />

        <Callout tone="info">
          {"Test не должен оставлять session в failed transaction и затем случайно падать в unrelated assertion."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Demo, runbook и quality gate"}>
        <Lead>
          {"Другой человек должен поднять проект, применить migrations, создать demo identities и повторить teacher/student flow без устных подсказок. До добавления cache и background operations блок должен иметь зелёный LMS suite, актуальные migrations, понятный error contract и измеримый baseline каталога."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Seed"}</h3>
          <p>{"Минимальные teacher, student и admin без production secrets."}</p>
          <h3>{"Collection"}</h3>
          <p>{"Requests используют variables course_id/module_id/enrollment_id."}</p>
          <h3>{"README"}</h3>
          <p>{"Команды запуска, migrations, tests и demo order совпадают с реальностью."}</p>
          <h3>{"Automated"}</h3>
          <p>{"pytest, migration check, lint/type checks проекта."}</p>
          <h3>{"Manual"}</h3>
          <p>{"Swagger/collection happy path."}</p>
          <h3>{"Explanation"}</h3>
          <p>{"Ученик прослеживает request → permission → transaction → response."}</p>
        </div>

        <TerminalDemo
          title={"финальная проверка LMS Core"}
          lines={[
            { cmd: "alembic upgrade head" },
            { out: "Running upgrade ... -> lms_core" },
            { cmd: "pytest tests/lms -q" },
            { out: "42 passed" },
            { cmd: "python scripts/seed_demo.py" },
            { out: "teacher, student and demo course created" },
            { cmd: "python scripts/run_lms_demo.py" },
            { out: "progress: 100.0%" },
          ]}
        />

        <MethodGrid
          rows={[
            [<>{"Понять"}</>, "Назовите contract и boundary текущего раздела своими словами."],
            [<>{"Предсказать"}</>, "Измените один вход или роль и заранее определите status code и database effect."],
            [<>{"Проверить"}</>, "Запустите positive и negative scenario, затем перечитайте критическое состояние новой session."],
            [<>{"Объяснить"}</>, "Свяжите HTTP response, permission, transaction и invariant одной причинной цепочкой."],
          ]}
        />

        <RecallCard
          question={"Какой invariant защищает этот раздел и какой наблюдаемый факт докажет его нарушение?"}
          answer={
            <p>
              {"Настоящие пароли и access tokens не коммитятся вместе с demo collection; используются безопасные test values и placeholders. Redis появляется в блоке 35 как ответ на повторяющийся read-path каталога, а не как условие корректности LMS business flow."}
            </p>
          }
        />

        <Callout tone="info">
          {"Настоящие пароли и access tokens не коммитятся вместе с demo collection; используются безопасные test values и placeholders. Redis появляется в блоке 35 как ответ на повторяющийся read-path каталога, а не как условие корректности LMS business flow."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {"Соберите модель урока в один проверяемый результат: выполните основной LMS-scenario, намеренно воспроизведите ошибку, докажите отсутствие нежелательного изменения и объясните выбранный contract без чтения готового текста."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что доказывает E2E test?"}
            options={["Связность реального user flow", "Отсутствие всех возможных bugs", "Скорость Redis"]}
            correctIndex={0}
            explanation={"E2E проверяет интеграцию contracts."}
          />
          <QuizCard
            question={"Зачем отдельные actor clients?"}
            options={["Проверить реальные role/ownership boundaries", "Уменьшить число fixtures любой ценой", "Обойти authentication"]}
            correctIndex={0}
            explanation={"Identity должна различаться."}
          />
          <QuizCard
            question={"Что проверять после forbidden request?"}
            options={["Database state не изменилось", "Только длину error string", "Количество OpenAPI tags"]}
            correctIndex={0}
            explanation={"Отрицательный path не должен мутировать данные."}
          />
          <QuizCard
            question={"Почему Redis отложен?"}
            options={["Сначала нужен корректный baseline LMS", "Он несовместим с FastAPI", "Он заменяет PostgreSQL"]}
            correctIndex={0}
            explanation={"Infrastructure добавляется после готовой business logic."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"E2E flow связывает teacher и student через published Course."}</>,
            <>{"Actor fixtures сохраняют настоящие authentication dependencies."}</>,
            <>{"HTTP assertions дополняются точечными database invariants."}</>,
            <>{"Negative matrix покрывает role, ownership, state, relationship и uniqueness."}</>,
            <>{"Rollback проверяется намеренным failure scenario."}</>,
            <>{"Demo collection и README делают LMS Core воспроизводимым."}</>,
          ]}
        />

        <PracticeCta text={"Автоматизируйте полный teacher → publish → student → enrollment → completion → progress flow. Добавьте минимум 10 negative cases, database assertions, rollback scenario, demo seed, API collection и README runbook."} />
      </Section>
    </RichLesson>
  );
}

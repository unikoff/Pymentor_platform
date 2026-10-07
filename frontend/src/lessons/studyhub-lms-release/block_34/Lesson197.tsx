import { BookOpen, GitBranch } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, RecallCard, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 34 · Курсы, зачисление и прогресс";

export function Lesson197({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Draft, publish и публичный каталог курсов"}
        intro={"Превратим status Course в управляемую state machine: teacher редактирует draft, publish проверяет полноту контента, а публичный каталог возвращает только опубликованные курсы по стабильному read contract."}
        tags={[
          { icon: <GitBranch size={14} />, label: "draft → published" },
          { icon: <BookOpen size={14} />, label: "public catalog" },
        ]}
      />
      <TheoryBridge link={"Course, Module и Lesson уже сохраняются и имеют устойчивый порядок. Теперь появляется жизненный цикл контента: приватная подготовка teacher отделяется от публичного чтения student."} boundary={"Status — не декоративная строка. Каждое состояние определяет допустимые transitions, permissions и read visibility."} />

      <Section number={"01"} title={"Зачем LMS различает draft и published"}>
        <Lead>
          {"Teacher должен собирать курс постепенно, не показывая student незавершённую структуру. Publish превращает внутреннюю работу в публичное обещание."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Draft"}</h3>
          <p>{"Виден owner/admin, допускает редактирование структуры."}</p>
          <h3>{"Published"}</h3>
          <p>{"Появляется в каталоге и доступен для enrollment."}</p>
          <h3>{"Transition"}</h3>
          <p>{"Отдельная операция проверяет preconditions перед сменой status."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Teacher workspace:"}</strong> {" создание draft"}
            </li>
            <li>
              <strong>{"Content checks:"}</strong> {" module + lesson + корректный порядок"}
            </li>
            <li>
              <strong>{"Publish command:"}</strong> {" атомарная смена status"}
            </li>
            <li>
              <strong>{"Public catalog:"}</strong> {" только published rows"}
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
              {"Не делайте status обычным полем PATCH: transition имеет бизнес-правила и заслуживает отдельного endpoint/service method."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не делайте status обычным полем PATCH: transition имеет бизнес-правила и заслуживает отдельного endpoint/service method."}
        </Callout>
      </Section>

      <Section number={"02"} title={"State machine вместо свободного присваивания"}>
        <Lead>
          {"Минимальная state machine явно перечисляет допустимые переходы. Для MVP достаточно draft → published; обратный переход не добавляется без продуктового решения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Current state"}</h3>
          <p>{"Сервис загружает Course и блокирует недопустимый transition."}</p>
          <h3>{"Guard conditions"}</h3>
          <p>{"Курс содержит хотя бы один Module и один Lesson."}</p>
          <h3>{"Side effects"}</h3>
          <p>{"Записываются status и published_at одной transaction."}</p>
        </div>

        <MatchPairs
          prompt={"Соедините состояние и разрешённое действие."}
          pairs={[
            { left: "draft + owner", right: "редактировать content" },
            { left: "draft + student", right: "не видеть в public catalog" },
            { left: "published + student", right: "открыть catalog detail" },
            { left: "published + owner", right: "видеть опубликованную версию" },
          ]}
          explanation={"Visibility и mutation rules следуют из status и роли пользователя."}
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
              {"Если позже понадобится unpublish, он должен получить собственные последствия для active enrollments и cache invalidation."}
            </p>
          }
        />

        <Callout tone="info">
          {"Если позже понадобится unpublish, он должен получить собственные последствия для active enrollments и cache invalidation."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Publish preconditions проверяют содержимое"}>
        <Lead>
          {"Пустой Course технически существует, но не готов выполнять обещание каталога. Publish service проверяет структуру до UPDATE."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Ownership"}</h3>
          <p>{"Только owner или admin инициирует transition."}</p>
          <h3>{"Content"}</h3>
          <p>{"Есть Module и хотя бы один Lesson."}</p>
          <h3>{"Consistency"}</h3>
          <p>{"Позиции и foreign keys уже защищены предыдущим slice."}</p>
        </div>

        <StepThrough
          code={"async def publish_course(course, current_user, session):\n    ensure_owner_or_admin(course, current_user)\n    if course.status is CourseStatus.PUBLISHED:\n        return course\n    if not await course_has_lessons(course.id, session):\n        raise CourseNotReadyError()\n    course.status = CourseStatus.PUBLISHED\n    course.published_at = datetime.now(UTC)\n    await session.commit()\n    await session.refresh(course)\n    return course"}
          steps={[
            { line: 0, note: "Service получает уже загруженный Course.", vars: { "status": "draft" } },
            { line: 1, note: "Object permission проверяется до queries и mutation.", vars: { "actor": "owner" } },
            { line: 4, note: "Guard отклоняет пустой content.", vars: { "error": "course_not_ready" } },
            { line: 6, note: "Transition фиксирует status и timestamp.", vars: { "status": "published" } },
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
              {"Повторный publish выбран идемпотентным: уже опубликованный Course возвращается без создания нового события."}
            </p>
          }
        />

        <Callout tone="info">
          {"Повторный publish выбран идемпотентным: уже опубликованный Course возвращается без создания нового события."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Public catalog — отдельный read-path"}>
        <Lead>
          {"Каталог не использует teacher workspace query. Он фильтрует published, задаёт стабильную сортировку, pagination и компактную response schema."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Visibility filter"}</h3>
          <p>{"WHERE status = published."}</p>
          <h3>{"Ordering"}</h3>
          <p>{"published_at DESC, id DESC для стабильности."}</p>
          <h3>{"Shape"}</h3>
          <p>{"CourseCatalogItem без приватных draft-полей и тяжёлой вложенности."}</p>
        </div>

        <BranchExplorer
          code={"GET /catalog/courses\n→ filter published\n→ order published_at desc, id desc\n→ limit/offset\n→ CourseCatalogPage"}
          scenarios={[
            { label: "draft exists", activeLine: 1, output: "не попадает в result" },
            { label: "published exists", activeLine: 3, output: "возвращается student" },
            { label: "same timestamp", activeLine: 2, output: "id обеспечивает tie-breaker" },
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
              {"Фильтрация visibility выполняется в SQL, а не после загрузки всех courses в Python."}
            </p>
          }
        />

        <Callout tone="info">
          {"Фильтрация visibility выполняется в SQL, а не после загрузки всех courses в Python."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Teacher preview и public detail имеют разные permissions"}>
        <Lead>
          {"Owner должен видеть draft detail для проверки, student — только published detail. Один универсальный endpoint часто скрывает эту разницу."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Workspace endpoint"}</h3>
          <p>{"GET /teacher/courses/{id}: owner/admin."}</p>
          <h3>{"Public endpoint"}</h3>
          <p>{"GET /catalog/courses/{slug}: published only."}</p>
          <h3>{"Information boundary"}</h3>
          <p>{"Draft существование не обязано раскрываться anonymous user."}</p>
        </div>

        <CompareSolutions
          question={"Как разделить чтение?"}
          left={{
            title: "Один endpoint с множеством if",
            code: "GET /courses/{id}\nif role ... if status ...",
            note: "Контракт ответа и visibility становятся неочевидными.",
          }}
          right={{
            title: "Два ясных read-path",
            code: "/teacher/courses/{id}\n/catalog/courses/{slug}",
            note: "Каждый endpoint имеет одну аудиторию и один permission contract.",
          }}
          preferred="right"
          explanation={"Разделение workspace и catalog уменьшает неоднозначность безопасности."}
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
              {"404 для недоступного draft в public path может быть осознаннее 403, потому что не раскрывает существование resource."}
            </p>
          }
        />

        <Callout tone="info">
          {"404 для недоступного draft в public path может быть осознаннее 403, потому что не раскрывает существование resource."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Ошибочный publish не меняет Course"}>
        <Lead>
          {"Сервис должен доказать atomicity: при отсутствии Lesson status остаётся draft, published_at остаётся null, а следующий request может исправить content и повторить transition."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Expected domain error"}</h3>
          <p>{"CourseNotReadyError переводится в согласованный 409 или 422."}</p>
          <h3>{"No mutation before guard"}</h3>
          <p>{"Status меняется только после всех preconditions."}</p>
          <h3>{"Database assertion"}</h3>
          <p>{"Тест перечитывает Course новой session."}</p>
        </div>

        <BugHunt
          code={"course.status = CourseStatus.PUBLISHED\nif not await course_has_lessons(course.id, session):\n    raise CourseNotReadyError()\nawait session.commit()"}
          question={"Что опасно в порядке действий?"}
          options={["ORM-object меняется до проверки готовности", "Enum нельзя хранить в PostgreSQL", "Commit должен быть перед if"]}
          correctIndex={0}
          explanation={"Даже без commit session уже содержит dirty object; дальнейший код может случайно flush изменения."}
          fix={"if not await course_has_lessons(course.id, session):\n    raise CourseNotReadyError()\ncourse.status = CourseStatus.PUBLISHED\ncourse.published_at = datetime.now(UTC)\nawait session.commit()"}
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
              {"Лучший error path не только делает rollback, но и откладывает mutation до завершения guard checks."}
            </p>
          }
        />

        <Callout tone="info">
          {"Лучший error path не только делает rollback, но и откладывает mutation до завершения guard checks."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Тесты transitions и каталога"}>
        <Lead>
          {"Набор тестов связывает state machine и visibility: empty draft нельзя publish, готовый course публикуется, catalog скрывает drafts, а повторный publish сохраняет один timestamp по выбранному контракту."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Transition tests"}</h3>
          <p>{"draft → published и repeated publish."}</p>
          <h3>{"Permission tests"}</h3>
          <p>{"other teacher и student не публикуют."}</p>
          <h3>{"Read tests"}</h3>
          <p>{"catalog содержит только published и stable pagination."}</p>
        </div>

        <TerminalDemo
          title={"pytest: publish and catalog"}
          lines={[
            { cmd: "pytest tests/lms/test_publish.py tests/lms/test_catalog.py -q" },
            { out: "test_empty_course_cannot_publish PASSED" },
            { out: "test_owner_publishes_ready_course PASSED" },
            { out: "test_catalog_hides_drafts PASSED" },
            { out: "test_catalog_order_is_stable PASSED" },
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
              {"Каталог готов к кешированию только после того, как его SQL contract и invalidation-triggering writes стабилизированы; Redis появится в следующем блоке."}
            </p>
          }
        />

        <Callout tone="info">
          {"Каталог готов к кешированию только после того, как его SQL contract и invalidation-triggering writes стабилизированы; Redis появится в следующем блоке."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {"Соберите модель урока в один проверяемый результат: выполните основной LMS-scenario, намеренно воспроизведите ошибку, докажите отсутствие нежелательного изменения и объясните выбранный contract без чтения готового текста."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Почему publish отдельный endpoint?"}
            options={["Transition имеет guards и side effects", "PATCH не поддерживает строки", "Swagger запрещает Enum"]}
            correctIndex={0}
            explanation={"State transition является бизнес-операцией."}
          />
          <QuizCard
            question={"Что видит public catalog?"}
            options={["Только published courses", "Все drafts owner", "Любой Course с Lesson"]}
            correctIndex={0}
            explanation={"Visibility фильтруется по status."}
          />
          <QuizCard
            question={"Когда меняется status?"}
            options={["После всех preconditions", "До проверки content", "При создании Course"]}
            correctIndex={0}
            explanation={"Mutation следует за guards."}
          />
          <QuizCard
            question={"Зачем tie-breaker id?"}
            options={["Стабильная pagination при одинаковом времени", "Хешировать пароль", "Создать foreign key"]}
            correctIndex={0}
            explanation={"Сортировка должна быть детерминированной."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Draft отделяет подготовку content от публичного обещания."}</>,
            <>{"Publish является явной state transition."}</>,
            <>{"Guards выполняются до mutation."}</>,
            <>{"Public catalog фильтрует visibility на уровне SQL."}</>,
            <>{"Teacher workspace и public read-path имеют разные contracts."}</>,
            <>{"Redis намеренно не добавляется до готового каталога."}</>,
          ]}
        />

        <PracticeCta text={"Реализуйте publish endpoint, guard «есть хотя бы один Lesson», published_at, teacher preview и public catalog. Добавьте transition, permission, visibility и stable ordering tests."} />
      </Section>
    </RichLesson>
  );
}

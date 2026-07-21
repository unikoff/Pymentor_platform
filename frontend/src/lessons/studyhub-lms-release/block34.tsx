import {
  BookOpen,
  CheckCircle2,
  GitBranch,
  Layers,
  ListOrdered,
  ShieldCheck,
  Trophy,
  Users,
  Workflow,
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  KeyTakeaways,
  Lead,
  MatchPairs,
  MethodGrid,
  RecallCard,
  PracticeCta,
  QuizCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TerminalDemo,
  TypeCard,
  TypeCards,
} from "../shared";

const BLOCK_TITLE = "Блок 34 · Курсы, зачисление и прогресс";

type TheoryBridgeData = { link: string; boundary: string };
const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  195: { link: "Блок 33 уже зафиксировал Course, роли, permissions matrix и API contract. Теперь превращаем проектную схему в работающий request path без изменения согласованных границ.", boundary: "CourseCreate описывает вход клиента, CourseModel хранит состояние PostgreSQL, а CourseRead сериализует ответ. Эти три контракта нельзя сливать в один универсальный класс." },
  196: { link: "Course уже создаётся и защищён ownership. Следующий vertical slice добавляет структуру контента, не ослабляя permission: доступ к Module и Lesson проверяется через родительский Course.", boundary: "relationship помогает перемещаться между ORM-объектами, но порядок не возникает автоматически. Его нужно хранить, ограничивать и явно задавать в query или relationship order_by." },
  197: { link: "Course, Module и Lesson уже сохраняются и имеют устойчивый порядок. Теперь появляется жизненный цикл контента: приватная подготовка teacher отделяется от публичного чтения student.", boundary: "Status — не декоративная строка. Каждое состояние определяет допустимые transitions, permissions и read visibility." },
  198: { link: "Публичный каталог уже показывает published courses. Следующий естественный user action — записаться на выбранный курс, сохранив identity student и состояние связи в PostgreSQL.", boundary: "Enrollment — не список course ids внутри User и не boolean на Course. Это отдельная association entity со своим id, status, enrolled_at и constraints." },
  199: { link: "Student уже имеет Enrollment. Теперь появляется главное действие обучения: завершить Lesson и получить честный агрегированный progress по курсу.", boundary: "Completion хранит факт, а progress является вычисляемым представлением. Хранить percentage как свободно изменяемое поле опасно: оно может разойтись с completion rows." },
  200: { link: "Пять vertical slices уже работают отдельно. Финал блока проверяет их взаимодействие и доказывает, что успешный пользовательский путь не открывает запрещённые shortcuts.", boundary: "End-to-end test не заменяет unit и integration tests каждого use case. Он проверяет связность контракта через реальные HTTP boundaries и изолированную database." },
};

function TheoryBridge({ lesson }: { lesson: number }) {
  const bridge = THEORY_BRIDGES[lesson];
  return (
    <Callout tone="info">
      <strong>{"Связь с курсом."}</strong> {bridge.link}{" "}
      <strong>{"Важно не перепутать:"}</strong> {bridge.boundary}
    </Callout>
  );
}

// 195. Teacher создаёт и редактирует Course
export function Lesson195({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Teacher создаёт и редактирует Course"}
        intro={"Реализуем первый вертикальный LMS-slice: authenticated teacher создаёт Course, становится owner, редактирует разрешённые поля и получает предсказуемые ответы 201, 403, 404 и 409."}
        tags={[
          { icon: <BookOpen size={14} />, label: "Course и owner" },
          { icon: <ShieldCheck size={14} />, label: "permissions и conflicts" },
        ]}
      />
      <TheoryBridge lesson={195} />

      <Section number={"01"} title={"От API contract к первому vertical slice"}>
        <Lead>
          {"Вертикальный slice проходит через все уровни, но реализует только один законченный пользовательский результат. Teacher отправляет POST, FastAPI валидирует body, dependency возвращает current user, сервис создаёт ORM-объект, transaction фиксирует запись, response schema возвращает публичные поля."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Проблема старого подхода"}</h3>
          <p>{"Набор разрозненных моделей и routers ещё не даёт работающего teacher flow."}</p>
          <h3>{"Главная модель"}</h3>
          <p>{"Один request прослеживается от HTTP boundary до PostgreSQL и обратно."}</p>
          <h3>{"Результат занятия"}</h3>
          <p>{"Teacher создаёт и изменяет только собственный Course, а ошибки имеют явный контракт."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"1. Request:"}</strong> {" POST /courses + CourseCreate"}
            </li>
            <li>
              <strong>{"2. Identity:"}</strong> {" CurrentUser из authentication dependency"}
            </li>
            <li>
              <strong>{"3. Transaction:"}</strong> {" CourseModel(owner_id=current_user.id)"}
            </li>
            <li>
              <strong>{"4. Response:"}</strong> {" 201 + CourseRead"}
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
              {"Endpoint связывает части сценария, но не принимает owner_id из body и не прячет authorization внутри случайной ORM-операции."}
            </p>
          }
        />

        <Callout tone="info">
          {"Endpoint связывает части сценария, но не принимает owner_id из body и не прячет authorization внутри случайной ORM-операции."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Три модели одного Course"}>
        <Lead>
          {"Один и тот же предметный объект выглядит по-разному на границе HTTP, в ORM и в response. Разделение снижает риск mass assignment и делает изменение контракта наблюдаемым."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"CourseCreate"}</h3>
          <p>{"Разрешает title, slug и description, но не owner_id, status или published_at."}</p>
          <h3>{"CourseModel"}</h3>
          <p>{"Содержит primary key, owner_id, status, timestamps и database constraints."}</p>
          <h3>{"CourseRead"}</h3>
          <p>{"Возвращает клиенту только согласованные публичные поля через from_attributes."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"request"} title={"CourseCreate"} code={"title: str\nslug: str\ndescription: str | None"}>
            {"Данные, которые teacher вправе передать."}
          </TypeCard>
          <TypeCard badge={"database"} badgeTone="float" title={"CourseModel"} code={"id, owner_id, status, created_at"}>
            {"Состояние и ограничения базы."}
          </TypeCard>
          <TypeCard badge={"response"} badgeTone="str" title={"CourseRead"} code={"model_config = ConfigDict(from_attributes=True)"}>
            {"Стабильный внешний контракт."}
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
              {"Pydantic validation улучшает сообщение клиенту, но уникальность slug окончательно гарантирует constraint PostgreSQL."}
            </p>
          }
        />

        <Callout tone="info">
          {"Pydantic validation улучшает сообщение клиенту, но уникальность slug окончательно гарантирует constraint PostgreSQL."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Создание: owner приходит из current user"}>
        <Lead>
          {"Поле owner_id является security-sensitive. Сервер получает его из проверенной identity, а не доверяет значению клиента."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"До вызова endpoint"}</h3>
          <p>{"Dependency проверяет access token и загружает UserModel."}</p>
          <h3>{"Внутри transaction"}</h3>
          <p>{"CourseModel создаётся из payload и owner_id текущего teacher."}</p>
          <h3>{"После commit"}</h3>
          <p>{"refresh получает generated id и server defaults."}</p>
        </div>

        <StepThrough
          code={"async def create_course(payload, current_user, session):\n    course = CourseModel(\n        **payload.model_dump(),\n        owner_id=current_user.id,\n        status=CourseStatus.DRAFT,\n    )\n    session.add(course)\n    await session.commit()\n    await session.refresh(course)\n    return course"}
          steps={[
            { line: 0, note: "FastAPI уже передал проверенный payload и current_user.", vars: { "role": "teacher", "slug": "python-backend" } },
            { line: 1, note: "Создаётся ORM-object без id. За owner отвечает сервер.", vars: { "owner_id": "current_user.id", "status": "draft" } },
            { line: 7, note: "Commit завершает transaction.", vars: { "state": "persistent" } },
            { line: 8, note: "Refresh получает database-generated значения.", vars: { "course.id": "42" } },
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
              {"Клиент может видеть owner_id в response, но не должен выбирать его при создании."}
            </p>
          }
        />

        <Callout tone="info">
          {"Клиент может видеть owner_id в response, но не должен выбирать его при создании."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Slug: удобная проверка и строгая гарантия"}>
        <Lead>
          {"Slug участвует в URL и должен быть уникальным. Предварительный SELECT даёт понятный 409, однако только UNIQUE constraint защищает от двух конкурентных INSERT."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Application check"}</h3>
          <p>{"Быстро сообщает, что slug уже занят."}</p>
          <h3>{"Database constraint"}</h3>
          <p>{"Не допускает дубликат даже при race condition."}</p>
          <h3>{"Exception mapping"}</h3>
          <p>{"IntegrityError требует rollback и переводится в безопасный 409."}</p>
        </div>

        <CompareSolutions
          question={"Как защищать уникальность slug?"}
          left={{
            title: "Только SELECT",
            code: "if await slug_exists(slug):\n    raise HTTPException(409)",
            note: "Два concurrent request могут пройти проверку одновременно.",
          }}
          right={{
            title: "SELECT + UNIQUE",
            code: "предварительная проверка\n+ UNIQUE(slug)\n+ rollback IntegrityError",
            note: "Понятный UX и окончательная database guarantee.",
          }}
          preferred="right"
          explanation={"Проверка приложения не заменяет constraint базы данных."}
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
              {"После IntegrityError session нельзя использовать для следующей операции до rollback."}
            </p>
          }
        />

        <Callout tone="info">
          {"После IntegrityError session нельзя использовать для следующей операции до rollback."}
        </Callout>
      </Section>

      <Section number={"05"} title={"PATCH обновляет только переданные поля"}>
        <Lead>
          {"Частичное обновление означает: отсутствующее поле не меняется, переданное null обрабатывается по контракту, а системные поля остаются недоступны."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"exclude_unset"}</h3>
          <p>{"Отделяет отсутствующие поля от явно переданных."}</p>
          <h3>{"Allowlist схемы"}</h3>
          <p>{"CourseUpdate не содержит owner_id и status."}</p>
          <h3>{"Один commit"}</h3>
          <p>{"Все изменения Course фиксируются атомарно."}</p>
        </div>

        <CodeBlock
          caption={"CourseUpdate и PATCH"}
          code={"class CourseUpdate(BaseModel):\n    title: str | None = Field(default=None, min_length=3, max_length=120)\n    slug: str | None = Field(default=None, pattern=r\"^[a-z0-9-]+$\")\n    description: str | None = Field(default=None, max_length=2000)\n\nchanges = payload.model_dump(exclude_unset=True)\nfor field, value in changes.items():\n    setattr(course, field, value)\n\nawait session.commit()\nawait session.refresh(course)"}
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
              {"Универсальный setattr безопасен только потому, что список полей ограничен отдельной Pydantic-схемой."}
            </p>
          }
        />

        <Callout tone="info">
          {"Универсальный setattr безопасен только потому, что список полей ограничен отдельной Pydantic-схемой."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Object-level permission: owner или admin"}>
        <Lead>
          {"Role teacher разрешает создавать course, но редактирование конкретного объекта требует ownership. Admin получает осознанный override."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Authentication"}</h3>
          <p>{"Кто выполняет request?"}</p>
          <h3>{"Role permission"}</h3>
          <p>{"Может ли эта роль редактировать courses вообще?"}</p>
          <h3>{"Object permission"}</h3>
          <p>{"Является ли user owner именно этого course?"}</p>
        </div>

        <BranchExplorer
          code={"course = await get_course_or_404(course_id)\nif current_user.role == \"admin\":\n    allow\nelif course.owner_id == current_user.id:\n    allow\nelse:\n    deny"}
          scenarios={[
            { label: "admin", activeLine: 2, output: "редактирование разрешено" },
            { label: "owner teacher", activeLine: 4, output: "редактирование разрешено" },
            { label: "другой teacher", activeLine: 6, output: "403 Forbidden" },
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
              {"401 означает неизвестную identity, 403 — identity известна, но действие запрещено. 404 применяется к отсутствующему resource по выбранному API contract."}
            </p>
          }
        />

        <Callout tone="info">
          {"401 означает неизвестную identity, 403 — identity известна, но действие запрещено. 404 применяется к отсутствующему resource по выбранному API contract."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Интеграционные тесты проверяют контракт и состояние"}>
        <Lead>
          {"Тест endpoint должен проверять не только status code, но и строку PostgreSQL после успешного и запрещённого request."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Positive case"}</h3>
          <p>{"Teacher получает 201, owner_id совпадает с identity."}</p>
          <h3>{"Forbidden case"}</h3>
          <p>{"Другой teacher получает 403, поля Course не изменились."}</p>
          <h3>{"Conflict case"}</h3>
          <p>{"Повторный slug возвращает 409, transaction восстановлена."}</p>
        </div>

        <TerminalDemo
          title={"pytest: Course slice"}
          lines={[
            { cmd: "pytest tests/api/test_courses.py -q" },
            { out: "test_teacher_creates_course PASSED" },
            { out: "test_owner_updates_course PASSED" },
            { out: "test_other_teacher_cannot_update PASSED" },
            { out: "test_duplicate_slug_returns_409 PASSED" },
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
              {"Отрицательный тест считается сильным, когда после ошибки доказывает отсутствие побочного изменения в database."}
            </p>
          }
        />

        <Callout tone="info">
          {"Отрицательный тест считается сильным, когда после ошибки доказывает отсутствие побочного изменения в database."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {"Соберите модель урока в один проверяемый результат: выполните основной LMS-scenario, намеренно воспроизведите ошибку, докажите отсутствие нежелательного изменения и объясните выбранный contract без чтения готового текста."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Откуда сервер берёт owner_id нового Course?"}
            options={["Из current user dependency", "Из JSON body", "Из query parameter"]}
            correctIndex={0}
            explanation={"Security-sensitive ownership определяется подтверждённой identity."}
          />
          <QuizCard
            question={"Что делает exclude_unset=True?"}
            options={["Оставляет только переданные поля", "Удаляет все None", "Коммитит session"]}
            correctIndex={0}
            explanation={"PATCH не должен сбрасывать отсутствующие поля."}
          />
          <QuizCard
            question={"Зачем UNIQUE при предварительном SELECT?"}
            options={["Защитить concurrent INSERT", "Ускорить Pydantic", "Скрыть owner_id"]}
            correctIndex={0}
            explanation={"Только база окончательно гарантирует уникальность."}
          />
          <QuizCard
            question={"Когда нужен rollback?"}
            options={["После IntegrityError", "После каждого GET", "Перед refresh"]}
            correctIndex={0}
            explanation={"Ошибочная transaction должна быть явно завершена."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Vertical slice связывает HTTP, identity, service, transaction и response."}</>,
            <>{"Request, ORM и response schemas имеют разные обязанности."}</>,
            <>{"owner_id приходит только из current user."}</>,
            <>{"Предварительный SELECT не заменяет UNIQUE constraint."}</>,
            <>{"PATCH применяет только поля из CourseUpdate."}</>,
            <>{"Object-level permission проверяет конкретный Course."}</>,
          ]}
        />

        <PracticeCta text={"Реализуйте POST /courses и PATCH /courses/{course_id}, добавьте UNIQUE slug, owner/admin authorization и минимум четыре integration tests с проверкой состояния базы."} />
      </Section>
    </RichLesson>
  );
}

// 196. Modules, Lessons и устойчивый порядок
export function Lesson196({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Modules, Lessons и устойчивый порядок"}
        intro={"Добавим вложенный контент курса и сделаем порядок частью database contract: позиции уникальны внутри родителя, новые элементы добавляются в конец, а reorder выполняется одной transaction с rollback."}
        tags={[
          { icon: <Layers size={14} />, label: "Course → Module → Lesson" },
          { icon: <ListOrdered size={14} />, label: "position и reorder" },
        ]}
      />
      <TheoryBridge lesson={196} />

      <Section number={"01"} title={"Почему вложенному контенту нужен устойчивый порядок"}>
        <Lead>
          {"Module и Lesson — не просто списки Python. Их порядок должен одинаково читаться после restart, в разных requests и при concurrent изменениях."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Course"}</h3>
          <p>{"Корневая сущность и permission boundary."}</p>
          <h3>{"Module"}</h3>
          <p>{"Принадлежит одному Course и имеет position внутри курса."}</p>
          <h3>{"Lesson"}</h3>
          <p>{"Принадлежит одному Module и имеет position внутри модуля."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Course 42:"}</strong> {" проверить owner/admin"}
            </li>
            <li>
              <strong>{"Module position=1:"}</strong> {" создать внутри Course"}
            </li>
            <li>
              <strong>{"Lesson position=1:"}</strong> {" создать внутри Module"}
            </li>
            <li>
              <strong>{"Response:"}</strong> {" вернуть отсортированную структуру"}
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
              {"Идентификатор parent передаётся в path, но разрешение на действие определяется после загрузки родителя из базы."}
            </p>
          }
        />

        <Callout tone="info">
          {"Идентификатор parent передаётся в path, но разрешение на действие определяется после загрузки родителя из базы."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Foreign keys и ограничения позиции"}>
        <Lead>
          {"Foreign key гарантирует существование parent, а составной UNIQUE выражает правило «одна position внутри конкретного parent»."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"modules.course_id"}</h3>
          <p>{"Связывает Module с Course."}</p>
          <h3>{"lessons.module_id"}</h3>
          <p>{"Связывает Lesson с Module."}</p>
          <h3>{"Composite uniqueness"}</h3>
          <p>{"UNIQUE(course_id, position) и UNIQUE(module_id, position)."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"FK"} title={"Foreign key"} code={"module.course_id → courses.id"}>
            {"Запрещает ссылку на отсутствующего parent."}
          </TypeCard>
          <TypeCard badge={"UNIQUE"} badgeTone="float" title={"Position boundary"} code={"UNIQUE(course_id, position)"}>
            {"Повтор разрешён в другом parent, но не внутри одного."}
          </TypeCard>
          <TypeCard badge={"ORDER"} badgeTone="str" title={"Read contract"} code={"ORDER BY position, id"}>
            {"Query всегда содержит стабильный tie-breaker."}
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
              {"Индекс и UNIQUE constraint связаны, но объясняют разные требования: быстрый доступ и допустимость данных."}
            </p>
          }
        />

        <Callout tone="info">
          {"Индекс и UNIQUE constraint связаны, но объясняют разные требования: быстрый доступ и допустимость данных."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Nested endpoints читаются как путь к parent"}>
        <Lead>
          {"Вложенный path показывает контекст операции и уменьшает неоднозначность: module создаётся внутри конкретного course, lesson — внутри module."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"POST /courses/{course_id}/modules"}</h3>
          <p>{"Parent course загружается первым."}</p>
          <h3>{"POST /modules/{module_id}/lessons"}</h3>
          <p>{"Через module определяется course и ownership."}</p>
          <h3>{"GET structure"}</h3>
          <p>{"Результат сортируется по position на каждом уровне."}</p>
        </div>

        <BranchExplorer
          code={"POST /courses/{course_id}/modules\n→ get Course\n→ authorize owner/admin\n→ calculate next position\n→ INSERT Module"}
          scenarios={[
            { label: "course missing", activeLine: 1, output: "404" },
            { label: "other teacher", activeLine: 2, output: "403" },
            { label: "owner", activeLine: 4, output: "201 Created" },
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
              {"Не доверяйте course_id, присланному внутри body, если parent уже однозначно задан path-параметром."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не доверяйте course_id, присланному внутри body, если parent уже однозначно задан path-параметром."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Новый элемент добавляется в конец"}>
        <Lead>
          {"Для первого рабочего варианта server вычисляет next_position как max(position)+1 внутри одного parent. Этот контракт проще ручного ввода позиции клиентом."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Scope"}</h3>
          <p>{"MAX считается только для выбранного course или module."}</p>
          <h3>{"Empty parent"}</h3>
          <p>{"COALESCE возвращает 0, следующая позиция становится 1."}</p>
          <h3>{"Concurrency boundary"}</h3>
          <p>{"UNIQUE constraint остаётся последней защитой от одинакового next_position."}</p>
        </div>

        <StepThrough
          code={"stmt = select(func.coalesce(func.max(ModuleModel.position), 0)).where(\n    ModuleModel.course_id == course.id\n)\nlast_position = await session.scalar(stmt)\nmodule = ModuleModel(\n    course_id=course.id,\n    title=payload.title,\n    position=last_position + 1,\n)"}
          steps={[
            { line: 0, note: "Statement ограничен одним course.", vars: { "course.id": "42" } },
            { line: 3, note: "Scalar возвращает максимум или 0.", vars: { "last_position": "2" } },
            { line: 4, note: "Новый объект получает следующую позицию.", vars: { "position": "3" } },
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
              {"На больших нагрузках стратегия position потребует более сложного coordination, но для учебного монолита важнее сначала увидеть constraint и transaction."}
            </p>
          }
        />

        <Callout tone="info">
          {"На больших нагрузках стратегия position потребует более сложного coordination, но для учебного монолита важнее сначала увидеть constraint и transaction."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Reorder — одна атомарная операция"}>
        <Lead>
          {"Перестановка нескольких элементов должна завершиться полностью или не изменить ничего. Частично сохранённый порядок нарушает пользовательский контракт."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Validate input"}</h3>
          <p>{"IDs уникальны и принадлежат одному parent."}</p>
          <h3>{"Temporary positions"}</h3>
          <p>{"Освобождают уникальные значения перед финальным присваиванием."}</p>
          <h3>{"Commit once"}</h3>
          <p>{"Transaction фиксирует весь новый порядок или rollback возвращает старый."}</p>
        </div>

        <CodeSequence
          title={"Соберите безопасный reorder"}
          prompt={"Расположите этапы атомарного изменения позиций."}
          pieces={[
            { id: "load", code: "загрузить все элементы parent" },
            { id: "validate", code: "сравнить набор ids с request" },
            { id: "temporary", code: "назначить временные отрицательные позиции" },
            { id: "flush", code: "await session.flush()" },
            { id: "final", code: "назначить позиции 1..N" },
            { id: "commit", code: "await session.commit()" },
            { id: "bad", code: "commit после каждого элемента", note: "создаёт частичное состояние" },
          ]}
          correctOrder={["load", "validate", "temporary", "flush", "final", "commit"]}
          explanation={"Промежуточный flush освобождает старые UNIQUE-значения внутри той же transaction."}
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
              {"Алгоритм временных позиций является одним из вариантов; ключевая идея — отсутствие промежуточного commit."}
            </p>
          }
        />

        <Callout tone="info">
          {"Алгоритм временных позиций является одним из вариантов; ключевая идея — отсутствие промежуточного commit."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Ошибка reorder должна оставить прежний порядок"}>
        <Lead>
          {"Неизвестный id, duplicate id или элемент другого parent — ожидаемые ошибки. После них database state должен совпадать с baseline."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Duplicate id"}</h3>
          <p>{"Request не описывает перестановку всех уникальных элементов."}</p>
          <h3>{"Foreign element"}</h3>
          <p>{"Нельзя перемещать Lesson из другого Module скрытым побочным эффектом."}</p>
          <h3>{"Rollback"}</h3>
          <p>{"Любая начатая mutation отменяется до следующего использования session."}</p>
        </div>

        <BugHunt
          code={"requested_ids = [10, 11, 11]\nfor position, lesson_id in enumerate(requested_ids, start=1):\n    lesson = lessons_by_id[lesson_id]\n    lesson.position = position\nawait session.commit()"}
          question={"Почему такой reorder нельзя выполнять?"}
          options={["Request содержит duplicate id и не описывает полный набор", "enumerate нельзя применять к list", "position должна быть строкой"]}
          correctIndex={0}
          explanation={"Без проверки множества ids один Lesson получает последнее значение, а другой исчезает из порядка."}
          fix={"if len(requested_ids) != len(set(requested_ids)):\n    raise HTTPException(status_code=422, detail=\"lesson ids must be unique\")"}
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
              {"Validation до mutation делает ошибочный путь дешевле и снижает необходимость восстанавливать изменённые ORM-objects."}
            </p>
          }
        />

        <Callout tone="info">
          {"Validation до mutation делает ошибочный путь дешевле и снижает необходимость восстанавливать изменённые ORM-objects."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Чтение структуры: сортировка и ограничение N+1"}>
        <Lead>
          {"Публичная структура курса должна возвращать modules и lessons в согласованном порядке и не создавать отдельный query на каждый child."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Stable order"}</h3>
          <p>{"ORDER BY position, id."}</p>
          <h3>{"Eager loading"}</h3>
          <p>{"selectinload загружает коллекции контролируемым числом queries."}</p>
          <h3>{"Response shape"}</h3>
          <p>{"Вложенные schemas не включают обратные ссылки и не создают recursion."}</p>
        </div>

        <CompareSolutions
          question={"Как получить Course structure?"}
          left={{
            title: "Ленивая навигация в цикле",
            code: "for module in course.modules:\n    for lesson in module.lessons: ...",
            note: "Может породить N+1 и скрыть запросы.",
          }}
          right={{
            title: "Явный statement",
            code: "select(CourseModel).options(\n    selectinload(CourseModel.modules)\n      .selectinload(ModuleModel.lessons)\n)",
            note: "План загрузки виден рядом с use case.",
          }}
          preferred="right"
          explanation={"Read-path должен явно управлять загрузкой связанных коллекций."}
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
              {"Оптимизация не отменяет correctness: сначала проверяются ownership, фильтры и порядок, затем количество SQL statements."}
            </p>
          }
        />

        <Callout tone="info">
          {"Оптимизация не отменяет correctness: сначала проверяются ownership, фильтры и порядок, затем количество SQL statements."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {"Соберите модель урока в один проверяемый результат: выполните основной LMS-scenario, намеренно воспроизведите ошибку, докажите отсутствие нежелательного изменения и объясните выбранный contract без чтения готового текста."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Где уникальна Module.position?"}
            options={["Внутри одного Course", "Во всей базе", "Только в response"]}
            correctIndex={0}
            explanation={"Составной constraint включает course_id."}
          />
          <QuizCard
            question={"Зачем reorder одна transaction?"}
            options={["Не допустить частичный порядок", "Ускорить Pydantic", "Создать JWT"]}
            correctIndex={0}
            explanation={"Все позиции меняются атомарно."}
          />
          <QuizCard
            question={"Что проверяется до mutation?"}
            options={["Полнота и уникальность ids", "Только длина title", "HTTP method сервера"]}
            correctIndex={0}
            explanation={"Невалидный request не должен менять ORM-state."}
          />
          <QuizCard
            question={"Как избежать скрытого N+1?"}
            options={["Явно задать loading strategy", "Удалить foreign keys", "Использовать global session"]}
            correctIndex={0}
            explanation={"selectinload делает read plan наблюдаемым."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Course остаётся permission boundary для вложенного контента."}</>,
            <>{"Position хранится в базе и ограничивается внутри parent."}</>,
            <>{"Новый child добавляется в конец server-side."}</>,
            <>{"Reorder проверяет полный набор ids до mutation."}</>,
            <>{"Все позиции меняются одной transaction."}</>,
            <>{"Read-path задаёт stable ordering и loading strategy."}</>,
          ]}
        />

        <PracticeCta text={"Добавьте Module и Lesson, nested create endpoints, composite UNIQUE constraints, append-to-end и атомарный reorder. Покройте duplicate ids, foreign child, rollback и стабильную сортировку."} />
      </Section>
    </RichLesson>
  );
}

// 197. Draft, publish и публичный каталог курсов
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
      <TheoryBridge lesson={197} />

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

// 198. Enrollment и защита от повторной записи
export function Lesson198({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Enrollment и защита от повторной записи"}
        intro={"Свяжем student с опубликованным Course отдельной Enrollment-сущностью, выберем ясный 409 contract для повтора и докажем, что application check плюс UNIQUE(student_id, course_id) защищают от concurrent duplicates."}
        tags={[
          { icon: <Users size={14} />, label: "student ↔ course" },
          { icon: <ShieldCheck size={14} />, label: "unique enrollment" },
        ]}
      />
      <TheoryBridge lesson={198} />

      <Section number={"01"} title={"Enrollment хранит факт участия"}>
        <Lead>
          {"Связь многие-ко-многим получает собственную модель, потому что сама связь имеет данные и жизненный цикл."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Student"}</h3>
          <p>{"Один user может иметь несколько enrollments."}</p>
          <h3>{"Course"}</h3>
          <p>{"Один published course может иметь много students."}</p>
          <h3>{"Enrollment"}</h3>
          <p>{"Соединяет пару и хранит enrolled_at/status."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Catalog detail:"}</strong> {" student выбирает published Course"}
            </li>
            <li>
              <strong>{"POST enrollment:"}</strong> {" identity берётся из current user"}
            </li>
            <li>
              <strong>{"Database guarantee:"}</strong> {" UNIQUE student_id + course_id"}
            </li>
            <li>
              <strong>{"Response:"}</strong> {" 201 EnrollmentRead"}
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
              {"Запись создаётся для current student. Передавать произвольный student_id разрешено только отдельному admin use case, которого в этом slice нет."}
            </p>
          }
        />

        <Callout tone="info">
          {"Запись создаётся для current student. Передавать произвольный student_id разрешено только отдельному admin use case, которого в этом slice нет."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Association model и database constraints"}>
        <Lead>
          {"EnrollmentModel выражает не только foreign keys, но и запрет duplicate pair. Это основа корректности при повторных и concurrent requests."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"student_id FK"}</h3>
          <p>{"Ссылка на существующего User."}</p>
          <h3>{"course_id FK"}</h3>
          <p>{"Ссылка на существующий Course."}</p>
          <h3>{"Unique pair"}</h3>
          <p>{"Один active enrollment для пары student/course в MVP."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"entity"} title={"EnrollmentModel"} code={"id, student_id, course_id, status, enrolled_at"}>
            {"Отдельная строка связи."}
          </TypeCard>
          <TypeCard badge={"constraint"} badgeTone="float" title={"UniqueConstraint"} code={"UNIQUE(student_id, course_id)"}>
            {"Последняя защита от race condition."}
          </TypeCard>
          <TypeCard badge={"contract"} badgeTone="str" title={"EnrollmentRead"} code={"status=\"active\""}>
            {"Возвращает id и состояние связи."}
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
              {"Если позже появится повторное зачисление после withdrawal, constraint и state machine придётся пересмотреть осознанно."}
            </p>
          }
        />

        <Callout tone="info">
          {"Если позже появится повторное зачисление после withdrawal, constraint и state machine придётся пересмотреть осознанно."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Endpoint проверяет identity и published status"}>
        <Lead>
          {"Student может записаться только сам и только на опубликованный Course. Draft не становится доступным через знание id."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Authentication"}</h3>
          <p>{"current user существует и активен."}</p>
          <h3>{"Role"}</h3>
          <p>{"Для основного flow требуется student."}</p>
          <h3>{"Resource state"}</h3>
          <p>{"Course найден и имеет status=published."}</p>
        </div>

        <BranchExplorer
          code={"POST /courses/{course_id}/enrollments\n→ current student\n→ load published Course\n→ existing enrollment check\n→ INSERT Enrollment"}
          scenarios={[
            { label: "anonymous", activeLine: 1, output: "401" },
            { label: "draft course", activeLine: 2, output: "404 или domain error по contract" },
            { label: "first request", activeLine: 4, output: "201" },
            { label: "repeat", activeLine: 3, output: "409" },
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
              {"Public visibility и enrollment permission используют одно правило published, но остаются отдельными use cases."}
            </p>
          }
        />

        <Callout tone="info">
          {"Public visibility и enrollment permission используют одно правило published, но остаются отдельными use cases."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Повторный request: выбранный 409 contract"}>
        <Lead>
          {"API должен заранее решить, считать ли повтор идемпотентным возвратом существующей записи или conflict. В курсе выбираем 409, чтобы student увидел, что новая запись не создана."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"First request"}</h3>
          <p>{"Создаёт Enrollment и возвращает 201."}</p>
          <h3>{"Repeated request"}</h3>
          <p>{"Возвращает 409 enrollment_already_exists."}</p>
          <h3>{"State check"}</h3>
          <p>{"Количество rows остаётся равно одному."}</p>
        </div>

        <CompareSolutions
          question={"Как отвечать на повторную запись?"}
          left={{
            title: "201 с новым row",
            code: "Каждый POST создаёт Enrollment",
            note: "Нарушает уникальность и искажает количество участников.",
          }}
          right={{
            title: "409 без duplicate",
            code: "Проверка + UNIQUE + IntegrityError mapping",
            note: "Контракт явно сообщает conflict, база остаётся корректной.",
          }}
          preferred="right"
          explanation={"Выбранное поведение должно быть одинаково в endpoint, OpenAPI и tests."}
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
              {"Другой API мог бы вернуть existing Enrollment с 200. Важно не «единственно верное число», а последовательный контракт."}
            </p>
          }
        />

        <Callout tone="info">
          {"Другой API мог бы вернуть existing Enrollment с 200. Важно не «единственно верное число», а последовательный контракт."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Race condition: SELECT не является блокировкой"}>
        <Lead>
          {"Два requests могут одновременно не найти Enrollment и попытаться INSERT. Application check улучшает ответ, database constraint обеспечивает корректность."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Request A"}</h3>
          <p>{"SELECT → none."}</p>
          <h3>{"Request B"}</h3>
          <p>{"SELECT → none до commit A."}</p>
          <h3>{"Database"}</h3>
          <p>{"Один INSERT проходит, второй получает IntegrityError."}</p>
        </div>

        <StepThrough
          code={"try:\n    enrollment = EnrollmentModel(\n        student_id=current_user.id,\n        course_id=course.id,\n    )\n    session.add(enrollment)\n    await session.commit()\nexcept IntegrityError as exc:\n    await session.rollback()\n    raise EnrollmentAlreadyExistsError() from exc"}
          steps={[
            { line: 0, note: "Операция защищена try/except на transaction boundary.", vars: { "pair": "student=7, course=42" } },
            { line: 5, note: "Первый commit может успешно создать row.", vars: { "result": "201" } },
            { line: 6, note: "Второй concurrent commit нарушает UNIQUE.", vars: { "error": "IntegrityError" } },
            { line: 7, note: "Rollback восстанавливает session.", vars: { "state": "usable" } },
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
              {"Не возвращайте raw database error клиенту: внутреннее имя constraint не является стабильным API contract."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не возвращайте raw database error клиенту: внутреннее имя constraint не является стабильным API contract."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Список моих курсов начинается с Enrollment"}>
        <Lead>
          {"Student dashboard читает enrollments текущего user и связанные published courses. Нельзя принимать student_id из query для обычного пользователя."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Filter"}</h3>
          <p>{"WHERE enrollment.student_id = current_user.id."}</p>
          <h3>{"Join/load"}</h3>
          <p>{"Загрузить Course по явной strategy."}</p>
          <h3>{"Ordering"}</h3>
          <p>{"Например enrolled_at DESC, id DESC."}</p>
        </div>

        <CodeBlock
          caption={"Read-path «мои курсы»"}
          code={"stmt = (\n    select(EnrollmentModel)\n    .where(EnrollmentModel.student_id == current_user.id)\n    .options(selectinload(EnrollmentModel.course))\n    .order_by(EnrollmentModel.enrolled_at.desc(), EnrollmentModel.id.desc())\n)\nresult = await session.scalars(stmt)\nreturn result.all()"}
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
              {"Object-level permission здесь выражен SQL filter: чужие enrollments вообще не попадают в result set."}
            </p>
          }
        />

        <Callout tone="info">
          {"Object-level permission здесь выражен SQL filter: чужие enrollments вообще не попадают в result set."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Tests доказывают duplicate protection"}>
        <Lead>
          {"Сильный integration test выполняет first request, repeat request и по возможности два конкурентных service calls, затем считает rows в новой session."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"First"}</h3>
          <p>{"201 и правильные student/course ids."}</p>
          <h3>{"Repeat"}</h3>
          <p>{"409 и прежний enrollment id не меняется."}</p>
          <h3>{"Concurrent"}</h3>
          <p>{"В базе ровно одна row, session после rollback работает."}</p>
        </div>

        <BugHunt
          code={"existing = await find_enrollment(student_id, course_id)\nif existing is None:\n    session.add(EnrollmentModel(...))\n    await session.commit()"}
          question={"Почему только этой проверки недостаточно?"}
          options={["Между SELECT и INSERT другой transaction может создать ту же пару", "SELECT всегда удаляет row", "FastAPI не поддерживает POST"]}
          correctIndex={0}
          explanation={"Application check имеет race window."}
          fix={"# Добавьте UNIQUE(student_id, course_id), обработайте IntegrityError и выполните rollback."}
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
              {"При тестировании concurrency важнее доказать database invariant, чем получить одинаковый порядок HTTP responses."}
            </p>
          }
        />

        <Callout tone="info">
          {"При тестировании concurrency важнее доказать database invariant, чем получить одинаковый порядок HTTP responses."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {"Соберите модель урока в один проверяемый результат: выполните основной LMS-scenario, намеренно воспроизведите ошибку, докажите отсутствие нежелательного изменения и объясните выбранный contract без чтения готового текста."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что представляет Enrollment?"}
            options={["Отдельную сущность связи", "Поле title Course", "Cookie браузера"]}
            correctIndex={0}
            explanation={"Связь имеет собственные данные и ограничения."}
          />
          <QuizCard
            question={"Откуда берётся student_id?"}
            options={["Из current user", "Из body клиента", "Из slug курса"]}
            correctIndex={0}
            explanation={"Student записывает только себя."}
          />
          <QuizCard
            question={"Что окончательно защищает от duplicate?"}
            options={["UNIQUE pair", "Предварительный SELECT", "Swagger tag"]}
            correctIndex={0}
            explanation={"Constraint работает и при race condition."}
          />
          <QuizCard
            question={"Что делать после IntegrityError?"}
            options={["Rollback и domain error", "Продолжить той же transaction", "Вернуть traceback"]}
            correctIndex={0}
            explanation={"Session должна выйти из failed state."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Enrollment является association entity."}</>,
            <>{"Student identity приходит из authentication dependency."}</>,
            <>{"Запись разрешена только в published Course."}</>,
            <>{"Повторный POST имеет явный 409 contract."}</>,
            <>{"SELECT улучшает UX, UNIQUE гарантирует invariant."}</>,
            <>{"Dashboard фильтрует enrollments по current user в SQL."}</>,
          ]}
        />

        <PracticeCta text={"Создайте EnrollmentModel, POST enrollment и GET my enrollments. Добавьте UNIQUE pair, IntegrityError mapping, rollback, repeat request test и проверку ровно одной строки после concurrent попыток."} />
      </Section>
    </RichLesson>
  );
}

// 199. Завершение Lesson и расчёт Progress
export function Lesson199({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Завершение Lesson и расчёт Progress"}
        intro={"Добавим идемпотентный completion fact, проверим enrollment и принадлежность Lesson выбранному Course, а progress вычислим из PostgreSQL как completed_count / total_published_lessons вместо хранения изменяемого процента."}
        tags={[
          { icon: <CheckCircle2 size={14} />, label: "Lesson completion" },
          { icon: <Trophy size={14} />, label: "0 → 100% progress" },
        ]}
      />
      <TheoryBridge lesson={199} />

      <Section number={"01"} title={"От enrollment к наблюдаемому обучению"}>
        <Lead>
          {"Enrollment даёт право участвовать в Course, но сам по себе не показывает результат. Completion фиксирует одно завершённое Lesson конкретного enrollment."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Enrollment"}</h3>
          <p>{"Подтверждает связь student/course."}</p>
          <h3>{"LessonCompletion"}</h3>
          <p>{"Уникальный факт enrollment + lesson."}</p>
          <h3>{"Progress"}</h3>
          <p>{"Агрегат фактов относительно опубликованных lessons."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Student request:"}</strong> {" PUT completion"}
            </li>
            <li>
              <strong>{"Guards:"}</strong> {" enrollment + lesson in course"}
            </li>
            <li>
              <strong>{"Unique fact:"}</strong> {" INSERT или existing"}
            </li>
            <li>
              <strong>{"Aggregate:"}</strong> {" COUNT completed / total"}
            </li>
            <li>
              <strong>{"Response:"}</strong> {" ProgressRead"}
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
              {"Факт завершения не доказывает качество усвоения или время просмотра. Блок измеряет только agreed MVP behavior."}
            </p>
          }
        />

        <Callout tone="info">
          {"Факт завершения не доказывает качество усвоения или время просмотра. Блок измеряет только agreed MVP behavior."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Completion entity и уникальность"}>
        <Lead>
          {"Отдельная таблица хранит enrollment_id, lesson_id и completed_at. Composite UNIQUE делает repeated PUT безопасным."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Enrollment FK"}</h3>
          <p>{"Связывает факт с конкретным student/course membership."}</p>
          <h3>{"Lesson FK"}</h3>
          <p>{"Определяет завершённый content item."}</p>
          <h3>{"Unique pair"}</h3>
          <p>{"Один факт на enrollment и lesson."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"fact"} title={"LessonCompletion"} code={"enrollment_id, lesson_id, completed_at"}>
            {"Неизменяемый факт завершения."}
          </TypeCard>
          <TypeCard badge={"guard"} badgeTone="float" title={"Course boundary"} code={"lesson.module.course_id == enrollment.course_id"}>
            {"Lesson должен входить в Course enrollment."}
          </TypeCard>
          <TypeCard badge={"aggregate"} badgeTone="str" title={"ProgressRead"} code={"completed, total, percent"}>
            {"Вычисляемый результат."}
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
              {"Для повторного прохождения с историей попыток понадобилась бы другая модель; текущий MVP хранит только факт первого завершения."}
            </p>
          }
        />

        <Callout tone="info">
          {"Для повторного прохождения с историей попыток понадобилась бы другая модель; текущий MVP хранит только факт первого завершения."}
        </Callout>
      </Section>

      <Section number={"03"} title={"PUT выражает идемпотентное состояние"}>
        <Lead>
          {"Endpoint «сделать Lesson завершённым» естественно моделируется PUT: повторный одинаковый request оставляет ресурс в том же состоянии и возвращает existing completion."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"First PUT"}</h3>
          <p>{"Создаёт fact и может вернуть 201."}</p>
          <h3>{"Repeated PUT"}</h3>
          <p>{"Возвращает existing fact без duplicate."}</p>
          <h3>{"Different lesson"}</h3>
          <p>{"Создаёт другой completion row."}</p>
        </div>

        <CompareSolutions
          question={"Какой endpoint точнее?"}
          left={{
            title: "POST /completions каждый раз",
            code: "Повтор создаёт новую row",
            note: "Подходит истории попыток, но не boolean fact MVP.",
          }}
          right={{
            title: "PUT /enrollments/{id}/lessons/{lesson_id}/completion",
            code: "Повтор обеспечивает тот же state",
            note: "Ясно выражает идемпотентное завершение.",
          }}
          preferred="right"
          explanation={"HTTP method согласуется с выбранной моделью ресурса."}
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
              {"Идемпотентность не означает одинаковый status code во всех API, но итоговое database state должно совпадать."}
            </p>
          }
        />

        <Callout tone="info">
          {"Идемпотентность не означает одинаковый status code во всех API, но итоговое database state должно совпадать."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Guards выполняются до INSERT"}>
        <Lead>
          {"Service должен доказать: enrollment принадлежит current student, Lesson существует, Lesson входит именно в Course enrollment и content доступен по status."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Ownership"}</h3>
          <p>{"enrollment.student_id == current_user.id."}</p>
          <h3>{"Membership"}</h3>
          <p>{"lesson.module.course_id == enrollment.course_id."}</p>
          <h3>{"Visibility"}</h3>
          <p>{"Course/Lesson соответствуют опубликованному flow."}</p>
        </div>

        <StepThrough
          code={"enrollment = await get_owned_enrollment(enrollment_id, current_user, session)\nlesson = await get_lesson_with_course(lesson_id, session)\nif lesson.module.course_id != enrollment.course_id:\n    raise LessonOutsideEnrollmentError()\ncompletion = await find_completion(enrollment.id, lesson.id, session)\nif completion is not None:\n    return completion\ncompletion = LessonCompletionModel(\n    enrollment_id=enrollment.id,\n    lesson_id=lesson.id,\n)"}
          steps={[
            { line: 0, note: "Сначала загружается owned Enrollment.", vars: { "student": "current_user.id" } },
            { line: 1, note: "Lesson загружается вместе с parent chain.", vars: { "lesson_id": "300" } },
            { line: 2, note: "Сравниваются course boundaries.", vars: { "allowed": "true/false" } },
            { line: 4, note: "Повтор обнаруживается до INSERT.", vars: { "idempotent": "existing" } },
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
              {"Проверка одного lesson_id без parent chain позволяет завершить чужой Lesson из другого Course."}
            </p>
          }
        />

        <Callout tone="info">
          {"Проверка одного lesson_id без parent chain позволяет завершить чужой Lesson из другого Course."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Progress считается агрегатами PostgreSQL"}>
        <Lead>
          {"Total — количество опубликованных Lessons курса; completed — количество completion rows enrollment, относящихся к этому набору. Percent вычисляется из двух чисел."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Total query"}</h3>
          <p>{"COUNT Lessons по modules данного Course."}</p>
          <h3>{"Completed query"}</h3>
          <p>{"COUNT unique completions данного enrollment."}</p>
          <h3>{"Zero boundary"}</h3>
          <p>{"Если total=0, percent=0.0, хотя publish guard обычно не допускает такой Course."}</p>
        </div>

        <CodeBlock
          caption={"Вычисление ProgressRead"}
          code={"total = await count_published_lessons(enrollment.course_id, session)\ncompleted = await count_completed_lessons(enrollment.id, session)\npercent = 0.0 if total == 0 else round(completed / total * 100, 2)\n\nreturn ProgressRead(\n    enrollment_id=enrollment.id,\n    completed_lessons=completed,\n    total_lessons=total,\n    percent=percent,\n)"}
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
              {"Не суммируйте percentage по Module: сначала определите единицу прогресса и считайте факты на одном уровне."}
            </p>
          }
        />

        <Callout tone="info">
          {"Не суммируйте percentage по Module: сначала определите единицу прогресса и считайте факты на одном уровне."}
        </Callout>
      </Section>

      <Section number={"06"} title={"0%, partial и 100% — три обязательных сценария"}>
        <Lead>
          {"Progress endpoint должен быть предсказуемым до первого completion, после части Lessons и после завершения всех Lessons."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"0 of 3"}</h3>
          <p>{"0.0%."}</p>
          <h3>{"1 of 3"}</h3>
          <p>{"33.33% после согласованного округления."}</p>
          <h3>{"3 of 3"}</h3>
          <p>{"100.0%; repeated PUT не делает 4 of 3."}</p>
        </div>

        <BranchExplorer
          code={"total=3\ncompleted=0 → 0.0%\ncompleted=1 → 33.33%\ncompleted=3 → 100.0%\nrepeat lesson 3 → still 3"}
          scenarios={[
            { label: "new enrollment", activeLine: 1, output: "0%" },
            { label: "one completion", activeLine: 2, output: "33.33%" },
            { label: "all unique facts", activeLine: 3, output: "100%" },
            { label: "repeated PUT", activeLine: 4, output: "100%, row count unchanged" },
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
              {"Тесты фиксируют правило округления, иначе frontend и backend могут показывать разные числа для одного состояния."}
            </p>
          }
        />

        <Callout tone="info">
          {"Тесты фиксируют правило округления, иначе frontend и backend могут показывать разные числа для одного состояния."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Negative tests защищают чужие и несвязанные resources"}>
        <Lead>
          {"Student не завершает Lesson без enrollment, через чужой Enrollment или из другого Course. После каждого forbidden request completion count остаётся прежним."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"No enrollment"}</h3>
          <p>{"404/403 по contract, INSERT отсутствует."}</p>
          <h3>{"Foreign enrollment"}</h3>
          <p>{"Object-level authorization отклоняет request."}</p>
          <h3>{"Lesson outside course"}</h3>
          <p>{"Domain conflict, completion не создаётся."}</p>
        </div>

        <BugHunt
          code={"enrollment = await session.get(EnrollmentModel, enrollment_id)\nlesson = await session.get(LessonModel, lesson_id)\nsession.add(LessonCompletionModel(\n    enrollment_id=enrollment.id, lesson_id=lesson.id\n))"}
          question={"Какой guard отсутствует прежде всего?"}
          options={["Проверка ownership и принадлежности Lesson Course enrollment", "Проверка длины title", "Сортировка Course по slug"]}
          correctIndex={0}
          explanation={"Наличие двух rows ещё не означает допустимость их связи."}
          fix={"# Проверьте enrollment.student_id == current_user.id и lesson.module.course_id == enrollment.course_id до INSERT."}
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
              {"Негативный тест должен перечитать completion rows после response и доказать отсутствие mutation."}
            </p>
          }
        />

        <Callout tone="info">
          {"Негативный тест должен перечитать completion rows после response и доказать отсутствие mutation."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {"Соберите модель урока в один проверяемый результат: выполните основной LMS-scenario, намеренно воспроизведите ошибку, докажите отсутствие нежелательного изменения и объясните выбранный contract без чтения готового текста."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что хранит Completion?"}
            options={["Факт enrollment + lesson", "Процент всего Course", "Роль teacher"]}
            correctIndex={0}
            explanation={"Факт является источником для aggregate."}
          />
          <QuizCard
            question={"Почему PUT уместен?"}
            options={["Повтор сохраняет то же состояние", "Он всегда быстрее POST", "Он не требует auth"]}
            correctIndex={0}
            explanation={"Completion моделируется как идемпотентный ресурс."}
          />
          <QuizCard
            question={"Как считается percent?"}
            options={["completed / total * 100", "Случайным default", "Из поля Course.progress"]}
            correctIndex={0}
            explanation={"Процент выводится из фактов."}
          />
          <QuizCard
            question={"Что проверять перед INSERT?"}
            options={["Enrollment ownership и course membership Lesson", "Только lesson title", "Только current time"]}
            correctIndex={0}
            explanation={"Связь должна быть разрешена доменом."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Completion хранит факт, а progress вычисляется."}</>,
            <>{"PUT делает повторное завершение идемпотентным."}</>,
            <>{"Enrollment должен принадлежать current student."}</>,
            <>{"Lesson должен входить в тот же Course."}</>,
            <>{"UNIQUE предотвращает duplicate completion."}</>,
            <>{"Progress tests покрывают 0%, partial, 100% и repeat."}</>,
          ]}
        />

        <PracticeCta text={"Реализуйте PUT completion и GET progress, добавьте unique enrollment/lesson, guards ownership/course membership и tests для 0%, 1/3, 3/3, repeated PUT и трёх forbidden scenarios."} />
      </Section>
    </RichLesson>
  );
}

// 200. End-to-end LMS flow и отрицательные тесты
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
      <TheoryBridge lesson={200} />

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

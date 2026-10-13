import { BookOpen, ShieldCheck } from "lucide-react";
import { BranchExplorer, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MethodGrid, RecallCard, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 34 · Курсы, зачисление и прогресс";

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
      <TheoryBridge link={"Блок 33 уже зафиксировал Course, роли, permissions matrix и API contract. Теперь превращаем проектную схему в работающий request path без изменения согласованных границ."} boundary={"CourseCreate описывает вход клиента, CourseModel хранит состояние PostgreSQL, а CourseRead сериализует ответ. Эти три контракта нельзя сливать в один универсальный класс."} />

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

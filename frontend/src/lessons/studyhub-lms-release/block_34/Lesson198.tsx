import { ShieldCheck, Users } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MethodGrid, RecallCard, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 34 · Курсы, зачисление и прогресс";

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
      <TheoryBridge link={"Публичный каталог уже показывает published courses. Следующий естественный user action — записаться на выбранный курс, сохранив identity student и состояние связи в PostgreSQL."} boundary={"Enrollment — не список course ids внутри User и не boolean на Course. Это отдельная association entity со своим id, status, enrolled_at и constraints."} />

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

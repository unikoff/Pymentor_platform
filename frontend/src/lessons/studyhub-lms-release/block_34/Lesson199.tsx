import { CheckCircle2, Trophy } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MethodGrid, RecallCard, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 34 · Курсы, зачисление и прогресс";

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
      <TheoryBridge link={"Student уже имеет Enrollment. Теперь появляется главное действие обучения: завершить Lesson и получить честный агрегированный progress по курсу."} boundary={"Completion хранит факт, а progress является вычисляемым представлением. Хранить percentage как свободно изменяемое поле опасно: оно может разойтись с completion rows."} />

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

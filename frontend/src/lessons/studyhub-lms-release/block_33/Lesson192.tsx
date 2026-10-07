import { CheckCircle2, Route } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, FillBlank, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 33 · Проектирование StudyHub LMS Core";

type LessonProps = { module?: string };

export function Lesson192({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Progress и инварианты прохождения"}
        intro={"Спроектируем progress из фактов, а не из вручную изменяемого процента: LessonCompletion фиксирует завершение опубликованного урока внутри активного Enrollment, unique constraint делает действие идемпотентным, а формула корректно обрабатывает 0 lessons."}
        tags={[
          { icon: <CheckCircle2 size={14} />, label: "LessonCompletion как факт" },
          { icon: <Route size={14} />, label: "0% → 100% без рассинхронизации" },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong> {" Enrollment уже связывает student и Course. Следующий наблюдаемый шаг — завершение конкретного Lesson и вычисление общего прогресса по опубликованному контенту. "}
        <strong>{"Важно не перепутать:"}</strong> {" Progress не хранится как произвольное число и не включает баллы, экзамены, дедлайны или адаптивные траектории."}
      </Callout>

      <Section number={"01"} title={"Факт завершения важнее сохранённого процента"}>
        <Lead>
          {"Число progress=60 легко рассинхронизировать с реальными lessons. Надёжнее хранить факты completion и вычислять процент из текущего набора опубликованных уроков."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Fact"}</h3>
          <p>{"Student завершил конкретный Lesson в конкретном Enrollment."}</p>
          <h3>{"Count"}</h3>
          <p>{"Система считает уникальные completion."}</p>
          <h3>{"Derived value"}</h3>
          <p>{"Процент вычисляется при чтении или в контролируемом query."}</p>
        </div>

        <CompareSolutions
          question={"Какой источник истины устойчивее?"}
          left={{
            title: "Сохранённый процент",
            code: "enrollment.progress = 60",
            note: "Непонятно, какие lessons завершены и когда обновлять число.",
          }}
          right={{
            title: "Completion facts",
            code: "LessonCompletion(enrollment_id, lesson_id)",
            note: "Процент можно воспроизвести и проверить по фактам.",
          }}
          preferred={"right"}
          explanation={"Вычисляемое значение не должно становиться независимым источником истины без необходимости."}
        />

        <CodeBlock
          caption={"формула progress"}
          code={"completed = count(unique published lessons completed)\ntotal = count(published lessons in course)\n\nif total == 0:\n    progress = 0\nelse:\n    progress = completed / total * 100"}
        />

        <Callout tone="info">
          {"Храните события и факты, из которых можно восстановить производное значение. Это упрощает аудит и тестирование."}
        </Callout>
      </Section>

      <Section number={"02"} title={"LessonCompletion как отдельная сущность"}>
        <Lead>
          {"Completion связывает Enrollment и Lesson, добавляет completed_at и защищает уникальность пары. Через Enrollment система уже знает student и Course."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"enrollment_id"}</h3>
          <p>{"Подтверждает законную запись student на Course."}</p>
          <h3>{"lesson_id"}</h3>
          <p>{"Указывает конкретную единицу контента."}</p>
          <h3>{"completed_at"}</h3>
          <p>{"Фиксирует время завершения для истории и статистики."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"enrollment"} title={"Контекст обучения"} code={"FK -> enrollments.id"}>
            {"Не позволяет завершать lesson вне записи на курс."}
          </TypeCard>
          <TypeCard badge={"lesson"} badgeTone={"float"} title={"Завершённый объект"} code={"FK -> lessons.id"}>
            {"Должен принадлежать тому же Course."}
          </TypeCard>
          <TypeCard badge={"unique"} badgeTone={"str"} title={"Один факт"} code={"UNIQUE(enrollment_id, lesson_id)"}>
            {"Повторный запрос не создаёт вторую completion."}
          </TypeCard>
        </TypeCards>

        <MethodGrid
          rows={[
            [<>{"LessonCompletion.id"}</>, "идентификатор факта"],
            [<>{"LessonCompletion.enrollment_id"}</>, "контекст student/course"],
            [<>{"LessonCompletion.lesson_id"}</>, "завершённый Lesson"],
            [<>{"LessonCompletion.completed_at"}</>, "момент завершения"],
            [<>{"UNIQUE(enrollment_id, lesson_id)"}</>, "защита от двойного учёта"],
          ]}
        />

        <Callout tone="info">
          {"student_id и course_id не нужно дублировать в Completion, если они однозначно определяются через Enrollment."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Инвариант: student должен быть записан на Course"}>
        <Lead>
          {"Наличие Enrollment ещё недостаточно: он должен быть active, а Lesson обязан принадлежать Course этой записи. Проверка защищает от завершения чужого контента."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Actor"}</h3>
          <p>{"current_user совпадает с Enrollment.student_id."}</p>
          <h3>{"State"}</h3>
          <p>{"Enrollment.status разрешает прохождение."}</p>
          <h3>{"Target"}</h3>
          <p>{"Lesson через Module относится к Enrollment.course_id."}</p>
        </div>

        <BranchExplorer
          code={"complete lesson\n├── enrollment.student_id != current_user.id -> deny\n├── enrollment.status != active -> deny\n├── lesson.course_id != enrollment.course_id -> deny\n└── create or return completion"}
          scenarios={[
            { label: "свой active enrollment", activeLine: 4, output: "разрешённый happy path" },
            { label: "lesson другого course", activeLine: 3, output: "инвариант target нарушен" },
            { label: "withdrawn enrollment", activeLine: 2, output: "прохождение больше не разрешено" },
          ]}
        />

        <BugHunt
          code={"create_completion(enrollment_id=8, lesson_id=999)\n# lesson принадлежит другому Course"}
          question={"Какой контроль отсутствует?"}
          options={[
            "Lesson должен принадлежать Course из Enrollment",
            "Lesson id должен быть строкой",
            "Completion нельзя создавать через API",
          ]}
          correctIndex={0}
          explanation={"Оба foreign key отдельно валидны, но их сочетание нарушает бизнес-инвариант."}
          fix={"enrollment = get_owned_active_enrollment(8)\nlesson = get_lesson(999)\nassert lesson.module.course_id == enrollment.course_id"}
        />

        <Callout tone="info">
          {"Foreign keys подтверждают существование строк, но не всегда подтверждают допустимость их комбинации. Бизнес-инвариант проверяется отдельно."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Идемпотентность и unique completion"}>
        <Lead>
          {"Повторный клик, retry клиента или сетевой timeout не должны увеличить completed count. Unique pair делает факт завершения одноразовым."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"First request"}</h3>
          <p>{"Создаёт Completion и возвращает согласованный успешный ответ."}</p>
          <h3>{"Repeated request"}</h3>
          <p>{"Не создаёт дубликат."}</p>
          <h3>{"Contract choice"}</h3>
          <p>{"Можно вернуть существующий ресурс или 409 — решение фиксируется заранее."}</p>
        </div>

        <StepThrough
          code={"POST complete lesson\nINSERT completion\nnetwork timeout\nclient retries\nUNIQUE prevents duplicate"}
          steps={[
            { line: 0, note: "Клиент отправляет действие.", vars: { "request": "1" } },
            { line: 1, note: "База фиксирует первый факт.", vars: { "rows": "1" } },
            { line: 2, note: "Клиент не знает, дошёл ли ответ.", vars: { "client": "uncertain" } },
            { line: 3, note: "Retry повторяет тот же intent.", vars: { "request": "2" } },
            { line: 4, note: "Unique pair сохраняет один completion.", vars: { "rows": "1" } },
          ]}
        />

        <TrueFalse
          statement={<>{"Два одинаковых Completion допустимы, если completed_at различается."}</>}
          isTrue={false}
          explanation={"Факт «урок завершён» учитывается один раз для конкретного Enrollment."}
        />

        <Callout tone="info">
          {"Идемпотентность проектируется до реализации: команда должна заранее решить ответ на повторный запрос и закрепить его тестом."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Формула progress и случай 0 lessons"}>
        <Lead>
          {"Деление на ноль — не техническая мелочь, а продуктовый сценарий пустого или ещё не опубликованного Course. Для MVP такой Course возвращает 0%, а публикация может требовать хотя бы один Lesson."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Denominator"}</h3>
          <p>{"Только published lessons, доступные student."}</p>
          <h3>{"Numerator"}</h3>
          <p>{"Уникальные completion этих lessons."}</p>
          <h3>{"Empty course"}</h3>
          <p>{"Явное значение 0 вместо исключения."}</p>
        </div>

        <CodeBlock
          caption={"контрольные примеры"}
          code={"0 completed / 0 published -> 0%\n0 completed / 4 published -> 0%\n2 completed / 4 published -> 50%\n4 completed / 4 published -> 100%"}
        />

        <FillBlank
          prompt={"Завершите безопасную формулу."}
          before={"progress = 0 if total == 0 else "}
          after={""}
          options={[
            "completed / total * 100",
            "total / completed",
            "completed + total",
          ]}
          answer={"completed / total * 100"}
          explanation={"Числитель — завершённые уроки, знаменатель — все учитываемые опубликованные уроки."}
        />

        <Callout tone="info">
          {"Сначала определите, какие lessons входят в denominator. Иначе разные endpoints могут показывать разный progress."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Published lessons и изменение курса"}>
        <Lead>
          {"Если teacher добавляет новый published Lesson, denominator увеличивается и процент student может снизиться. Это ожидаемое следствие выбранной модели и должно быть зафиксировано в продуктовой политике."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Draft lesson"}</h3>
          <p>{"Не входит в progress student."}</p>
          <h3>{"Publish new lesson"}</h3>
          <p>{"Увеличивает total и может изменить процент."}</p>
          <h3>{"Policy"}</h3>
          <p>{"Команда принимает осознанное решение, а не скрывает эффект."}</p>
        </div>

        <CompareSolutions
          question={"Какие lessons учитывать в progress?"}
          left={{
            title: "Все, включая draft",
            code: "COUNT(all lessons)",
            note: "Student теряет progress из-за невидимого контента.",
          }}
          right={{
            title: "Только published",
            code: "COUNT(published lessons)",
            note: "Denominator соответствует доступному пути обучения.",
          }}
          preferred={"right"}
          explanation={"Progress должен опираться на контент, который student действительно может пройти."}
        />

        <PredictOutput
          code={"published lessons = 4\ncompleted = 4\nprogress = 100%\n\nteacher publishes lesson 5\ncompleted remains 4"}
          output={"progress = 80%"}
          hint={"Denominator увеличился с 4 до 5."}
        />

        <Callout tone="info">
          {"Изменение progress после публикации нового Lesson не обязательно является багом. Это следствие выбранной политики denominator."}
        </Callout>
      </Section>

      <Section number={"07"} title={"API response и test matrix Progress"}>
        <Lead>
          {"Response должен объяснять процент, а не отдавать только число. completed_lessons и total_lessons делают результат проверяемым для клиента и теста."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Response"}</h3>
          <p>{"progress_percent, completed_lessons, total_lessons."}</p>
          <h3>{"Cases"}</h3>
          <p>{"0%, частичный, 100%, empty course и повторный completion."}</p>
          <h3>{"Negative"}</h3>
          <p>{"Чужой enrollment, withdrawn status и Lesson другого Course."}</p>
        </div>

        <CodeBlock
          caption={"понятный response contract"}
          code={"{\n  \"course_id\": 17,\n  \"completed_lessons\": 2,\n  \"total_lessons\": 4,\n  \"progress_percent\": 50\n}"}
        />

        <RecallCard
          question={"Почему progress лучше вычислять из Completion?"}
          hint={"Назовите воспроизводимость, аудит и защиту от рассинхронизации."}
          answer={<p>{"Completion хранит проверяемые факты по конкретным lessons. Процент можно пересчитать после изменения контента, объяснить пользователю и проверить тестом без доверия к вручную изменяемому числу."}</p>}
        />

        <Callout tone="info">
          {"Достаточный response показывает и производное значение, и числа, из которых оно получено."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектный артефакт">
        <Lead>
          {"Завершите занятие не конспектом, а проверяемым документом docs/lms/progress-model.md. Он должен быть понятен другому разработчику без устных пояснений и связывать модель, успешный путь, ожидаемый отказ и критерии готовности."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Проверка модели"}</h3>
          <p>{"Другой разработчик может восстановить сущности, связи и источник истины по документу docs/lms/progress-model.md."}</p>
          <h3>{"Проверка поведения"}</h3>
          <p>{"Документ содержит один полный happy path и минимум один ожидаемый отказ с наблюдаемым результатом."}</p>
          <h3>{"Проверка границы"}</h3>
          <p>{"Явно перечислено, что не входит в текущий slice и какое решение переносится в следующий блок."}</p>
          <h3>{"Проверка воспроизводимости"}</h3>
          <p>{"Критерии можно превратить в migration, API или permission tests без устного уточнения автора."}</p>
        </div>

        <CodeBlock
          caption={"definition of ready"}
          code={"model is explicit\nhappy path is complete\nexpected failure is named\nboundary is protected\nnext implementation step is small"}
        />

        <div className="lesson-check-group">
          <QuizCard
            question={"Что является источником истины progress?"}
            options={[
              "LessonCompletion facts",
              "Произвольное поле percent",
              "Количество login",
            ]}
            correctIndex={0}
            explanation={"Процент воспроизводится из фактов завершения."}
          />
          <QuizCard
            question={"Что защищает от двойного учёта урока?"}
            options={[
              "UNIQUE(enrollment_id, lesson_id)",
              "Разный completed_at",
              "Название Lesson",
            ]}
            correctIndex={0}
            explanation={"Одна пара учитывается один раз."}
          />
          <QuizCard
            question={"Какие lessons входят в denominator?"}
            options={[
              "Published lessons, доступные student",
              "Все draft и deleted lessons",
              "Только первый Lesson",
            ]}
            correctIndex={0}
            explanation={"Знаменатель должен соответствовать фактическому пути обучения."}
          />
          <QuizCard
            question={"Что вернуть для Course без published lessons?"}
            options={[
              "Явно согласованные 0%",
              "Division by zero",
              "Случайное значение",
            ]}
            correctIndex={0}
            explanation={"Пустой курс — ожидаемый edge case, а не авария."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Progress вычисляется из фактов Completion."}</>,
            <>{"Completion связывает Enrollment и Lesson."}</>,
            <>{"Foreign keys не заменяют проверку принадлежности Lesson к Course."}</>,
            <>{"Unique pair делает повтор безопасным и предотвращает двойной счёт."}</>,
            <>{"Denominator включает только доступные published lessons."}</>,
            <>{"Пустой Course обрабатывается явным правилом 0%."}</>,
            <>{"Response показывает процент и исходные counts."}</>,
          ]}
        />

        <PracticeCta text={"Создайте docs/lms/progress-model.md: опишите LessonCompletion, инварианты actor/state/target, unique pair, формулу progress, политику published lessons и минимум десять тестовых сценариев. Завершите коммитом docs: design progress invariants."} />
      </Section>
    </RichLesson>
  );
}

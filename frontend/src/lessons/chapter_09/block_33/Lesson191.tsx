import { GitBranch, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 33 · Проектирование StudyHub LMS Core";

type LessonProps = { module?: string };

export function Lesson191({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Enrollment как отдельная сущность связи"}
        intro={"Разберём many-to-many без скрытой магии: student и Course связываются через Enrollment, а сама связь хранит дату, статус и уникальность пары, поддерживает запросы в обе стороны и защищает от повторной записи."}
        tags={[
          { icon: <GitBranch size={14} />, label: "User ↔ Enrollment ↔ Course" },
          { icon: <ShieldCheck size={14} />, label: "unique pair и lifecycle" },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong> {" Course tree уже спроектирован. Теперь student должен законно получить доступ к прохождению, а система — сохранить сам факт записи и его жизненный цикл. "}
        <strong>{"Важно не перепутать:"}</strong> {" Enrollment — не список course ids внутри User и не просто автоматическая secondary table. Связь имеет собственные поля, правила и ошибки."}
      </Callout>

      <Section number={"01"} title={"Почему many-to-many требует отдельной модели"}>
        <Lead>
          {"Один student может записаться на несколько courses, а один Course — иметь много students. Когда связи нужны enrolled_at и status, она становится полноценной сущностью."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"User"}</h3>
          <p>{"Существует независимо от конкретного Course."}</p>
          <h3>{"Course"}</h3>
          <p>{"Существует независимо от конкретного student."}</p>
          <h3>{"Enrollment"}</h3>
          <p>{"Фиксирует конкретную пару и её состояние."}</p>
        </div>

        <CodeBlock
          caption={"связь многие-ко-многим"}
          code={"User 1 ─── * Enrollment * ─── 1 Course\n\nEnrollment\n- id\n- student_id\n- course_id\n- status\n- enrolled_at"}
        />

        <TypeCards>
          <TypeCard badge={"student_id"} title={"Кто записан"} code={"FK -> users.id"}>
            {"Указывает пользователя с ролью student."}
          </TypeCard>
          <TypeCard badge={"course_id"} badgeTone={"float"} title={"Куда записан"} code={"FK -> courses.id"}>
            {"Указывает опубликованный Course."}
          </TypeCard>
          <TypeCard badge={"status"} badgeTone={"str"} title={"Состояние связи"} code={"active | withdrawn | completed"}>
            {"Позволяет изменять lifecycle без удаления факта."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Если связь имеет собственную дату, статус или бизнес-правило, она уже заслуживает отдельной модели и API-контракта."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Поля Enrollment и источник истины"}>
        <Lead>
          {"Enrollment хранит только данные самой связи. Title курса остаётся в Course, email студента — в User. Дублирование полей быстро создаёт расхождения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Identity"}</h3>
          <p>{"id нужен для ссылок, логов и расширения модели."}</p>
          <h3>{"Pair"}</h3>
          <p>{"student_id + course_id определяют смысл связи."}</p>
          <h3>{"Lifecycle"}</h3>
          <p>{"status и timestamps описывают развитие связи."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>{"Enrollment.id"}</>, "стабильный идентификатор связи"],
            [<>{"Enrollment.student_id"}</>, "FK на student"],
            [<>{"Enrollment.course_id"}</>, "FK на Course"],
            [<>{"Enrollment.status"}</>, "active, withdrawn или completed"],
            [<>{"Enrollment.enrolled_at"}</>, "время первой записи"],
            [<>{"Enrollment.updated_at"}</>, "время изменения lifecycle"],
          ]}
        />

        <BugHunt
          code={"Enrollment(student_id=5, course_title=\"Python\")"}
          question={"Почему course_title не должен быть источником связи?"}
          options={[
            "Название может измениться и не является foreign key",
            "Строки нельзя хранить в таблице",
            "Enrollment не может иметь поля",
          ]}
          correctIndex={0}
          explanation={"Связь должна указывать на устойчивый Course.id."}
          fix={"Enrollment(student_id=5, course_id=17)"}
        />

        <Callout tone="info">
          {"Enrollment не копирует display-поля связанных сущностей. Их получают JOIN или ORM relationship при чтении."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Unique pair блокирует повторную запись"}>
        <Lead>
          {"Проверка SELECT перед INSERT улучшает сообщение, но только constraint базы гарантирует уникальность при конкурирующих запросах."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Friendly check"}</h3>
          <p>{"Приложение может заранее проверить существующую запись."}</p>
          <h3>{"Database guarantee"}</h3>
          <p>{"UNIQUE(student_id, course_id) не допускает дубликат."}</p>
          <h3>{"Error contract"}</h3>
          <p>{"Нарушение переводится в предсказуемый 409 Conflict."}</p>
        </div>

        <CompareSolutions
          question={"Что действительно гарантирует отсутствие дублей?"}
          left={{
            title: "Только Python check",
            code: "if not exists: insert()",
            note: "Два запроса могут одновременно увидеть отсутствие записи.",
          }}
          right={{
            title: "Constraint + обработка",
            code: "UNIQUE(student_id, course_id)",
            note: "База защищает инвариант, сервис переводит ошибку в контракт API.",
          }}
          preferred={"right"}
          explanation={"Проверка приложения полезна, но гарантия должна жить в источнике истины."}
        />

        <StepThrough
          code={"request A: SELECT none\nrequest B: SELECT none\nrequest A: INSERT\nrequest B: INSERT -> unique violation"}
          steps={[
            { line: 0, note: "Первый запрос пока не видит Enrollment.", vars: { "A": "none" } },
            { line: 1, note: "Второй запрос получает тот же результат.", vars: { "B": "none" } },
            { line: 2, note: "A создаёт единственную допустимую строку.", vars: { "rows": "1" } },
            { line: 3, note: "Constraint отклоняет второй INSERT.", vars: { "response": "409" } },
          ]}
        />

        <Callout tone="info">
          {"Инвариант, важный при одновременных запросах, нельзя оставлять только на уровне предварительного SELECT."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Запросы в обе стороны"}>
        <Lead>
          {"Одна и та же модель поддерживает два пользовательских вопроса: какие courses изучает student и какие students записаны на Course."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Student view"}</h3>
          <p>{"Фильтр Enrollment.student_id и JOIN Course."}</p>
          <h3>{"Teacher view"}</h3>
          <p>{"Фильтр Enrollment.course_id и JOIN User."}</p>
          <h3>{"Status filter"}</h3>
          <p>{"Active связи отделяются от withdrawn или completed."}</p>
        </div>

        <MatchPairs
          prompt={"Соедините вопрос и направление запроса."}
          pairs={[
            { left: "Мои курсы", right: "Enrollment.student_id = current_user.id" },
            { left: "Студенты курса", right: "Enrollment.course_id = owned_course.id" },
            { left: "Активные записи", right: "Enrollment.status = active" },
            { left: "Карточка курса", right: "JOIN Course by course_id" },
          ]}
          explanation={"Одна association model поддерживает оба направления навигации."}
        />

        <CodeBlock
          caption={"концептуальные запросы"}
          code={"courses_for_student(student_id)\nstudents_for_course(course_id)\nactive_enrollment(student_id, course_id)\n\nвсе операции читают одну таблицу enrollments"}
        />

        <Callout tone="info">
          {"Teacher может читать students только для собственного Course — запрос данных и permission проверяются вместе."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Lifecycle: active, withdrawn и completed"}>
        <Lead>
          {"Удаление Enrollment стирает историю. Статус позволяет сохранить факт записи и отдельно управлять текущим доступом."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"active"}</h3>
          <p>{"Student учится и может создавать completion."}</p>
          <h3>{"withdrawn"}</h3>
          <p>{"Доступ прекращён, но история записи сохранена."}</p>
          <h3>{"completed"}</h3>
          <p>{"Курс завершён по согласованному правилу progress."}</p>
        </div>

        <BranchExplorer
          code={"new enrollment\n└── active\n    ├── withdrawn\n    └── completed"}
          scenarios={[
            { label: "first enroll", activeLine: 1, output: "создаётся active" },
            { label: "student leaves", activeLine: 2, output: "история сохраняется как withdrawn" },
            { label: "progress reaches rule", activeLine: 3, output: "может перейти в completed" },
          ]}
        />

        <TrueFalse
          statement={<>{"Withdrawn Enrollment лучше всегда физически удалить, потому что он больше не даёт доступа."}</>}
          isTrue={false}
          explanation={"Статус сохраняет историю и позволяет объяснить прошлые completion или аудит доступа."}
        />

        <Callout tone="info">
          {"Не добавляйте сложный workflow заявок. Для MVP достаточно трёх понятных состояний и явных допустимых переходов."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Ошибочные сценарии и HTTP-контракт"}>
        <Lead>
          {"Enrollment создаётся только для опубликованного Course и student-роли. Повторная запись, чужая роль и несуществующий Course должны иметь предсказуемый ответ."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"404"}</h3>
          <p>{"Course не существует или сознательно скрывается."}</p>
          <h3>{"409"}</h3>
          <p>{"Пара student/course уже существует."}</p>
          <h3>{"403"}</h3>
          <p>{"Аутентифицированный пользователь не имеет права на действие."}</p>
        </div>

        <BranchExplorer
          code={"POST /courses/{course_id}/enrollments\n├── course not found -> 404\n├── course draft -> 404 or 409 by contract\n├── role is not student -> 403\n├── pair exists -> 409\n└── create active -> 201"}
          scenarios={[
            { label: "первый enrollment", activeLine: 5, output: "201 Created" },
            { label: "повторный enrollment", activeLine: 4, output: "409 Conflict" },
            { label: "teacher tries student action", activeLine: 3, output: "403 Forbidden" },
          ]}
        />

        <FillBlank
          prompt={"Выберите статус для повторной записи на тот же Course."}
          before={"HTTP "}
          after={" Conflict"}
          options={[
            "409",
            "201",
            "204",
          ]}
          answer={"409"}
          explanation={"Ресурс уже конфликтует с unique pair."}
        />

        <Callout tone="info">
          {"HTTP-статус — часть API contract. Он должен быть одинаковым в документации, сервисе и тестах."}
        </Callout>
      </Section>

      <Section number={"07"} title={"ER-фрагмент и test matrix Enrollment"}>
        <Lead>
          {"Документ занятия объединяет структуру таблицы, переходы статусов, запросы и отрицательные тесты. Он станет входом для реализации блока 34."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Schema"}</h3>
          <p>{"Поля, FK и unique pair."}</p>
          <h3>{"Behavior"}</h3>
          <p>{"Allowed transitions и доступ по active status."}</p>
          <h3>{"Tests"}</h3>
          <p>{"Первый enroll, repeat, draft course, wrong role и ownership teacher view."}</p>
        </div>

        <CodeSequence
          title={"Соберите безопасный сценарий enrollment"}
          prompt={"Расположите проверки и изменение состояния."}
          pieces={[
            { id: "auth", code: "получить current student" },
            { id: "course", code: "загрузить published Course" },
            { id: "existing", code: "проверить существующую пару" },
            { id: "insert", code: "создать active Enrollment" },
            { id: "commit", code: "commit и вернуть 201" },
            { id: "delete", code: "удалить все старые связи", note: "не относится к сценарию" },
          ]}
          correctOrder={[
            "auth",
            "course",
            "existing",
            "insert",
            "commit",
          ]}
          explanation={"Сервис сначала подтверждает actor и target, затем защищает unique pair и фиксирует новую связь."}
        />

        <RecallCard
          question={"Почему Enrollment является сущностью, а не технической таблицей?"}
          hint={"Назовите собственные поля и lifecycle."}
          answer={<p>{"Enrollment имеет собственный id, timestamps, status, unique pair и правила доступа; он описывает бизнес-факт записи student на Course."}</p>}
        />

        <Callout tone="info">
          {"Готовая модель Enrollment должна объяснять не только INSERT, но и последующее чтение, withdrawal, completion и аудит."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектный артефакт">
        <Lead>
          {"Завершите занятие не конспектом, а проверяемым документом docs/lms/enrollment-model.md. Он должен быть понятен другому разработчику без устных пояснений и связывать модель, успешный путь, ожидаемый отказ и критерии готовности."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Проверка модели"}</h3>
          <p>{"Другой разработчик может восстановить сущности, связи и источник истины по документу docs/lms/enrollment-model.md."}</p>
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
            question={"Почему Enrollment — отдельная модель?"}
            options={[
              "Связь имеет собственные поля и lifecycle",
              "SQL требует отдельную таблицу для любого поля",
              "Чтобы увеличить число классов",
            ]}
            correctIndex={0}
            explanation={"Association model хранит бизнес-факт связи."}
          />
          <QuizCard
            question={"Что гарантирует отсутствие дублей?"}
            options={[
              "UNIQUE(student_id, course_id)",
              "Только SELECT перед INSERT",
              "Название Course",
            ]}
            correctIndex={0}
            explanation={"Constraint защищает инвариант при конкурирующих запросах."}
          />
          <QuizCard
            question={"Какой статус сохраняет факт ухода без удаления истории?"}
            options={[
              "withdrawn",
              "missing",
              "draft",
            ]}
            correctIndex={0}
            explanation={"Withdrawn прекращает активный доступ, сохраняя запись."}
          />
          <QuizCard
            question={"Что возвращать при повторном enrollment?"}
            options={[
              "409 Conflict",
              "201 Created",
              "500 Internal Server Error",
            ]}
            correctIndex={0}
            explanation={"Повтор конфликтует с уникальностью пары и является ожидаемым сценарием."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"User и Course связаны many-to-many через Enrollment."}</>,
            <>{"Enrollment хранит данные самой связи, а не копии Course и User."}</>,
            <>{"UNIQUE(student_id, course_id) гарантирует отсутствие дублей."}</>,
            <>{"Запросы работают в обе стороны через одну association model."}</>,
            <>{"Status сохраняет lifecycle без физического удаления истории."}</>,
            <>{"Ошибочные сценарии заранее фиксируются в HTTP-контракте."}</>,
            <>{"Результат занятия — schema, transitions и test matrix Enrollment."}</>,
          ]}
        />

        <PracticeCta text={"Создайте docs/lms/enrollment-model.md: опишите таблицу, FK, unique pair, lifecycle active/withdrawn/completed, два направления запросов и минимум восемь тестовых сценариев. Зафиксируйте коммит docs: design enrollment lifecycle."} />
      </Section>
    </RichLesson>
  );
}

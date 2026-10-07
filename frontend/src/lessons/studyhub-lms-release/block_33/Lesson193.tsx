import { KeyRound, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 33 · Проектирование StudyHub LMS Core";

type LessonProps = { module?: string };

export function Lesson193({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Ownership, роли и permissions matrix"}
        intro={"Соберём права до endpoint-кода: role задаёт базовый тип возможностей, ownership связывает teacher с конкретным Course, enrollment открывает student доступ к прохождению, admin получает ограниченный override, а permissions matrix превращает правила в тестируемый контракт."}
        tags={[
          { icon: <KeyRound size={14} />, label: "role + ownership + state" },
          { icon: <ShieldCheck size={14} />, label: "permissions matrix и 401/403/404" },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong> {" Сущности Course, Enrollment и Completion уже имеют ясные связи. Теперь каждый action должен получить ответ: кто может выполнить его над каким resource и при каком состоянии. "}
        <strong>{"Важно не перепутать:"}</strong> {" Блок не строит enterprise policy engine. Достаточно явной матрицы и небольшого permission service, который проверяет роль, ownership и состояние ресурса."}
      </Callout>

      <Section number={"01"} title={"Role и ownership отвечают на разные вопросы"}>
        <Lead>
          {"Role говорит, к какому типу действий относится пользователь. Ownership отвечает, может ли конкретный teacher менять конкретный Course. Одной проверки role=teacher недостаточно."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Role"}</h3>
          <p>{"Teacher в принципе может создавать Courses."}</p>
          <h3>{"Ownership"}</h3>
          <p>{"Редактировать можно только Course с teacher_id=current_user.id."}</p>
          <h3>{"State"}</h3>
          <p>{"Некоторые действия зависят от draft/published или active Enrollment."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"role"} title={"Тип полномочий"} code={"current_user.role == teacher"}>
            {"Открывает класс действий, но не любой объект."}
          </TypeCard>
          <TypeCard badge={"ownership"} badgeTone={"float"} title={"Связь с resource"} code={"course.teacher_id == current_user.id"}>
            {"Ограничивает действие собственным Course."}
          </TypeCard>
          <TypeCard badge={"state"} badgeTone={"str"} title={"Допустимое состояние"} code={"course.status == draft"}>
            {"Определяет, разрешено ли действие сейчас."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={<>{"Любой пользователь с role=teacher может редактировать любой Course."}</>}
          isTrue={false}
          explanation={"После role нужно проверить ownership конкретного resource."}
        />

        <Callout tone="info">
          {"Правило доступа удобно читать как conjunction: authenticated AND role allowed AND owns resource AND state allows action."}
        </Callout>
      </Section>

      <Section number={"02"} title={"Permissions matrix до реализации endpoints"}>
        <Lead>
          {"Матрица role × action × resource обнаруживает противоречия раньше кода. Каждая ячейка содержит allow, deny или условие ownership/enrollment."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Rows"}</h3>
          <p>{"Actions: create, read, update, publish, enroll, complete."}</p>
          <h3>{"Columns"}</h3>
          <p>{"student, teacher, admin."}</p>
          <h3>{"Conditions"}</h3>
          <p>{"own course, published course, active enrollment."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>{"student × read catalog"}</>, "allow published"],
            [<>{"student × enroll"}</>, "allow published course"],
            [<>{"student × complete lesson"}</>, "allow own active enrollment"],
            [<>{"teacher × create course"}</>, "allow"],
            [<>{"teacher × update course"}</>, "allow own"],
            [<>{"teacher × publish course"}</>, "allow own valid draft"],
            [<>{"admin × override"}</>, "allow only documented support action"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините action с условием доступа."}
          pairs={[
            { left: "teacher updates Course", right: "teacher owns Course" },
            { left: "student completes Lesson", right: "student owns active Enrollment" },
            { left: "student opens catalog", right: "Course is published" },
            { left: "admin override", right: "action is explicitly documented and audited" },
          ]}
          explanation={"Матрица связывает actor, resource и condition."}
        />

        <Callout tone="info">
          {"Пустая ячейка — неопределённое поведение. До реализации у каждого endpoint должно быть явное правило."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Teacher ownership проходит через Course"}>
        <Lead>
          {"Module и Lesson не обязаны хранить teacher_id. Ownership можно вывести через Module.course_id и Course.teacher_id, сохраняя один источник истины."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Course"}</h3>
          <p>{"Хранит teacher_id."}</p>
          <h3>{"Module"}</h3>
          <p>{"Принадлежит Course."}</p>
          <h3>{"Lesson"}</h3>
          <p>{"Принадлежит Module и наследует ownership через дерево."}</p>
        </div>

        <StepThrough
          code={"current_user.id = 9\nlesson.module_id = 30\nmodule.course_id = 12\ncourse.teacher_id = 9\nallow update lesson"}
          steps={[
            { line: 0, note: "Определяется actor.", vars: { "teacher": "9" } },
            { line: 1, note: "Lesson ведёт к Module.", vars: { "module_id": "30" } },
            { line: 2, note: "Module ведёт к Course.", vars: { "course_id": "12" } },
            { line: 3, note: "Course хранит единственный ownership source.", vars: { "teacher_id": "9" } },
            { line: 4, note: "Совпадение разрешает action.", vars: { "decision": "allow" } },
          ]}
        />

        <BugHunt
          code={"if current_user.role == \"teacher\":\n    update_any_lesson()"}
          question={"Какой контроль отсутствует?"}
          options={[
            "Ownership Course, которому принадлежит Lesson",
            "Проверка длины title",
            "Проверка Redis",
          ]}
          correctIndex={0}
          explanation={"Role teacher не разрешает менять чужой ресурс."}
          fix={"course = get_course_for_lesson(lesson_id)\nif course.teacher_id != current_user.id:\n    raise Forbidden()"}
        />

        <Callout tone="info">
          {"Не дублируйте teacher_id в каждой таблице без необходимости. Чем больше источников ownership, тем выше риск расхождения."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Student access проходит через Enrollment"}>
        <Lead>
          {"Student читает публичный каталог без Enrollment, но прохождение и progress требуют собственной active связи с Course."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Catalog"}</h3>
          <p>{"Published Course доступен для чтения."}</p>
          <h3>{"Learning"}</h3>
          <p>{"Lesson content и completion требуют active Enrollment по правилам MVP."}</p>
          <h3>{"Isolation"}</h3>
          <p>{"Student не видит progress другого student."}</p>
        </div>

        <BranchExplorer
          code={"student action\n├── browse published catalog -> allow\n├── enroll self -> allow if no pair\n├── complete lesson -> own active enrollment\n├── read own progress -> own enrollment\n└── read other progress -> deny"}
          scenarios={[
            { label: "каталог", activeLine: 1, output: "общедоступное чтение опубликованного Course" },
            { label: "completion", activeLine: 3, output: "нужна собственная active связь" },
            { label: "чужой progress", activeLine: 5, output: "object-level deny" },
          ]}
        />

        <CompareSolutions
          question={"Как проверять progress endpoint?"}
          left={{
            title: "Только role=student",
            code: "if user.role == student: return progress(enrollment_id)",
            note: "Student может подставить чужой enrollment_id.",
          }}
          right={{
            title: "Ownership Enrollment",
            code: "enrollment.student_id == current_user.id",
            note: "Resource связан с конкретным actor.",
          }}
          preferred={"right"}
          explanation={"Object-level permission проверяет принадлежность запрошенного ресурса."}
        />

        <Callout tone="info">
          {"Path parameter никогда не является доказательством права. Любой id из запроса нужно связать с current_user."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Admin override должен быть ограничен и наблюдаем"}>
        <Lead>
          {"Admin может помогать в исключительных ситуациях, но безграничный bypass скрывает ошибки продукта и усложняет аудит. Каждое override-действие должно быть названо и залогировано."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Explicit action"}</h3>
          <p>{"Например, снять ошибочную публикацию или восстановить доступ."}</p>
          <h3>{"Audit"}</h3>
          <p>{"Actor, resource, reason и result записываются."}</p>
          <h3>{"No substitution"}</h3>
          <p>{"Admin не выполняет обычный flow вместо teacher/student."}</p>
        </div>

        <FlipCards
          cards={[
            { front: <>{"Разрешено"}</>, back: <>{"Документированное support-действие с audit trail."}</> },
            { front: <>{"Запрещено"}</>, back: <>{"Использовать admin, чтобы не проектировать ownership."}</> },
            { front: <>{"Причина"}</>, back: <>{"Override принимает обязательное reason."}</> },
            { front: <>{"Проверка"}</>, back: <>{"Отрицательный тест подтверждает, что обычная роль не получила admin action."}</> },
          ]}
        />

        <RecallCard
          question={"Почему admin override нельзя считать обычным allow для всего?"}
          hint={"Подумайте об аудите и скрытых дефектах permissions."}
          answer={<p>{"Безграничный override стирает границы ролей, скрывает ошибки пользовательских сценариев и не позволяет объяснить, кто и почему изменил resource. Нужны конкретные support-actions и audit trail."}</p>}
        />

        <Callout tone="info">
          {"Admin — отдельная политика, а не короткая ветка «если admin, пропустить все проверки»."}
        </Callout>
      </Section>

      <Section number={"06"} title={"401, 403 и безопасный 404"}>
        <Lead>
          {"Коды ответа выражают разные ситуации. 401 означает отсутствие валидной аутентификации, 403 — известный actor не имеет права, 404 иногда используется, чтобы не раскрывать существование чужого resource."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"401"}</h3>
          <p>{"Нет current user или credentials недействительны."}</p>
          <h3>{"403"}</h3>
          <p>{"Actor известен, но action запрещён."}</p>
          <h3>{"404"}</h3>
          <p>{"Resource отсутствует или контракт скрывает его существование."}</p>
        </div>

        <MatchPairs
          prompt={"Соедините ситуацию и статус."}
          pairs={[
            { left: "нет access token", right: "401 Unauthorized" },
            { left: "student пытается publish Course", right: "403 Forbidden" },
            { left: "чужой private draft скрывается", right: "404 Not Found" },
            { left: "повторный enrollment", right: "409 Conflict" },
          ]}
          explanation={"Статусы отличаются причиной отказа и не должны использоваться взаимозаменяемо."}
        />

        <FillBlank
          prompt={"Выберите статус для аутентифицированного student, который пытается publish Course."}
          before={"HTTP "}
          after={" Forbidden"}
          options={[
            "403",
            "401",
            "201",
          ]}
          answer={"403"}
          explanation={"Actor известен, но его роль не разрешает действие."}
        />

        <Callout tone="info">
          {"Решение 403 или 404 для чужого resource фиксируется на уровне API contract и применяется последовательно во всех похожих endpoints."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Permission service и отрицательная test matrix"}>
        <Lead>
          {"Endpoint не должен повторять длинные проверки. Небольшой permission service получает actor и resource, применяет одно правило и возвращает решение или доменную ошибку."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Load"}</h3>
          <p>{"Сначала безопасно загрузить resource."}</p>
          <h3>{"Authorize"}</h3>
          <p>{"Проверить role, ownership и state."}</p>
          <h3>{"Act"}</h3>
          <p>{"Только после решения выполнять mutation."}</p>
        </div>

        <CodeSequence
          title={"Соберите безопасный permission flow"}
          prompt={"Расположите шаги до изменения Course."}
          pieces={[
            { id: "auth", code: "получить current_user" },
            { id: "load", code: "загрузить Course" },
            { id: "check", code: "проверить role + ownership + state" },
            { id: "mutate", code: "изменить Course" },
            { id: "commit", code: "commit и вернуть response" },
            { id: "log_secret", code: "записать access token в лог", note: "опасный шаг" },
          ]}
          correctOrder={[
            "auth",
            "load",
            "check",
            "mutate",
            "commit",
          ]}
          explanation={"Mutation начинается только после полной object-level authorization."}
        />

        <CodeBlock
          caption={"концептуальный permission service"}
          code={"can_update_course(actor, course)\ncan_publish_course(actor, course)\ncan_complete_lesson(actor, enrollment, lesson)\ncan_read_progress(actor, enrollment)\n\nкаждое правило покрыто allow и deny тестами"}
        />

        <Callout tone="info">
          {"Положительный тест доказывает happy path. Отрицательные тесты доказывают, что соседняя роль, чужой owner и неверное состояние действительно блокируются."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектный артефакт">
        <Lead>
          {"Завершите занятие не конспектом, а проверяемым документом docs/lms/permissions-matrix.md. Он должен быть понятен другому разработчику без устных пояснений и связывать модель, успешный путь, ожидаемый отказ и критерии готовности."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Проверка модели"}</h3>
          <p>{"Другой разработчик может восстановить сущности, связи и источник истины по документу docs/lms/permissions-matrix.md."}</p>
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
            question={"Почему role=teacher недостаточно для update Course?"}
            options={[
              "Нужно проверить ownership конкретного Course",
              "Teacher не может редактировать",
              "Нужен Redis",
            ]}
            correctIndex={0}
            explanation={"Role задаёт класс действий, ownership — конкретный ресурс."}
          />
          <QuizCard
            question={"Через что student получает право complete Lesson?"}
            options={[
              "Через собственный active Enrollment",
              "Через title Course",
              "Через admin",
            ]}
            correctIndex={0}
            explanation={"Enrollment связывает actor и Course."}
          />
          <QuizCard
            question={"Когда используется 401?"}
            options={[
              "Нет валидной аутентификации",
              "Actor известен, но action запрещён",
              "Повторный ресурс",
            ]}
            correctIndex={0}
            explanation={"401 относится к credentials/current user."}
          />
          <QuizCard
            question={"Что должно быть у admin override?"}
            options={[
              "Явное действие, reason и audit trail",
              "Полный bypass без логов",
              "Только красивое имя",
            ]}
            correctIndex={0}
            explanation={"Override ограничивается и наблюдается."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Role, ownership и resource state являются разными проверками."}</>,
            <>{"Permissions matrix фиксирует правило до endpoint-кода."}</>,
            <>{"Teacher ownership хранится в Course и проходит к Module/Lesson через связи."}</>,
            <>{"Student access к прохождению подтверждается own active Enrollment."}</>,
            <>{"Admin override ограничивается конкретными действиями и аудитом."}</>,
            <>{"401, 403, 404 и 409 имеют разные причины."}</>,
            <>{"Permission service проверяется положительными и отрицательными тестами."}</>,
          ]}
        />

        <PracticeCta text={"Создайте docs/lms/permissions-matrix.md: заполните role × action × resource для Course, Module, Lesson, Enrollment и Progress, добавьте условия ownership/state, политику 401/403/404 и минимум десять конфликтных сценариев. Сделайте коммит docs: define LMS permissions."} />
      </Section>
    </RichLesson>
  );
}

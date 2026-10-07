import { FileText, GitBranch } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 33 · Проектирование StudyHub LMS Core";

type LessonProps = { module?: string };

export function Lesson194({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"API contract, ER-диаграмма и migration plan"}
        intro={"Соберём результаты проектирования в реализуемый blueprint: endpoint contract связывает method, path, actor, schemas и errors; ER-диаграмма показывает источник истины; migration plan защищает существующий StudyHub; vertical slices дают маленькие проверяемые коммиты."}
        tags={[
          { icon: <FileText size={14} />, label: "API contract и schemas" },
          { icon: <GitBranch size={14} />, label: "migration plan и vertical slices" },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong> {" MVP, content tree, Enrollment, Progress и permissions уже определены отдельно. Финальное занятие проверяет, что эти решения не противоречат друг другу и могут быть реализованы безопасной последовательностью. "}
        <strong>{"Важно не перепутать:"}</strong> {" Blueprint не означает один giant commit со всеми таблицами и endpoints. Реализация начнётся только после разбиения на вертикальные пользовательские slices."}
      </Callout>

      <Section number={"01"} title={"Blueprint связывает документы в одну систему"}>
        <Lead>
          {"Отдельные схемы полезны, но финальный blueprint обязан показать единый путь request → permission → service → tables → response и перечислить решения, которые считаются утверждёнными."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Product"}</h3>
          <p>{"MVP и acceptance criteria."}</p>
          <h3>{"Data"}</h3>
          <p>{"ER-модель и constraints."}</p>
          <h3>{"Behavior"}</h3>
          <p>{"API contract, permissions и migration sequence."}</p>
        </div>

        <CodeBlock
          caption={"состав blueprint"}
          code={"product brief\n+ content model\n+ enrollment model\n+ progress model\n+ permissions matrix\n+ API contract\n+ ER diagram\n+ migration plan\n= LMS Core blueprint"}
        />

        <TypeCards>
          <TypeCard badge={"contract"} title={"Что видит клиент"} code={"method · path · schemas · errors"}>
            {"Не раскрывает внутренние детали хранения."}
          </TypeCard>
          <TypeCard badge={"ER"} badgeTone={"float"} title={"Где живут факты"} code={"tables · PK · FK · constraints"}>
            {"Показывает источник истины и связи."}
          </TypeCard>
          <TypeCard badge={"plan"} badgeTone={"str"} title={"Как безопасно внедрить"} code={"migration · seed · slices · tests"}>
            {"Ограничивает blast radius каждого изменения."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Если одно правило нельзя найти ни в contract, ни в ER, ни в permissions matrix, оно почти наверняка останется неявным в коде."}
        </Callout>
      </Section>

      <Section number={"02"} title={"API contract: method, path, actor, input, output, errors"}>
        <Lead>
          {"Строка contract описывает один endpoint без реализации. По ней frontend, backend и тест могут согласовать поведение до появления кода."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Request"}</h3>
          <p>{"Method, path params, query и body schema."}</p>
          <h3>{"Authorization"}</h3>
          <p>{"Actor и object-level condition."}</p>
          <h3>{"Response"}</h3>
          <p>{"Status, response schema и ожидаемые errors."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>{"POST /courses"}</>, "teacher | CourseCreate -> 201 CourseRead"],
            [<>{"PATCH /courses/{id}"}</>, "owner teacher | CourseUpdate -> 200"],
            [<>{"POST /courses/{id}/publish"}</>, "owner teacher + valid draft -> 200"],
            [<>{"GET /courses"}</>, "public/student | published catalog -> 200"],
            [<>{"POST /courses/{id}/enrollments"}</>, "student + published + unique -> 201/409"],
            [<>{"POST /enrollments/{id}/lessons/{lesson_id}/complete"}</>, "owner student + active -> 200"],
            [<>{"GET /enrollments/{id}/progress"}</>, "owner student -> 200"],
          ]}
        />

        <MatchPairs
          prompt={"Соедините часть contract и вопрос, на который она отвечает."}
          pairs={[
            { left: "method + path", right: "какое действие и над каким resource" },
            { left: "actor condition", right: "кто имеет право" },
            { left: "request schema", right: "какие данные принимает endpoint" },
            { left: "response schema", right: "что получает клиент" },
            { left: "errors", right: "какие ожидаемые отказы являются частью поведения" },
          ]}
          explanation={"Полный contract отвечает на вопросы клиента, безопасности и тестирования."}
        />

        <Callout tone="info">
          {"В contract не пишут «может вернуть ошибку». Перечисляют конкретные 401, 403, 404, 409 и validation errors для данного endpoint."}
        </Callout>
      </Section>

      <Section number={"03"} title={"Pydantic schemas и границы данных"}>
        <Lead>
          {"Create, Update и Read schemas решают разные задачи. Клиент не должен передавать id, teacher_id или вычисленный progress, если эти значения определяет сервер."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Create"}</h3>
          <p>{"Только поля, которые actor имеет право задать."}</p>
          <h3>{"Update"}</h3>
          <p>{"Optional-поля для частичного изменения."}</p>
          <h3>{"Read"}</h3>
          <p>{"Server fields, nested summaries и derived values."}</p>
        </div>

        <CompareSolutions
          question={"Как разделить schemas Course?"}
          left={{
            title: "Одна схема для всего",
            code: "CourseSchema(id, teacher_id, status, ...)",
            note: "Клиент может попытаться передать server-managed поля.",
          }}
          right={{
            title: "Schemas по направлению",
            code: "CourseCreate | CourseUpdate | CourseRead",
            note: "Контракт явно разделяет вход и выход.",
          }}
          preferred={"right"}
          explanation={"Разные направления данных имеют разные разрешённые поля."}
        />

        <BugHunt
          code={"CourseCreate(teacher_id=other_user_id, status=\"published\")"}
          question={"Почему такой input опасен?"}
          options={[
            "Клиент управляет ownership и publish state",
            "Pydantic не поддерживает строки",
            "Course нельзя создавать",
          ]}
          correctIndex={0}
          explanation={"teacher_id берётся из current_user, а публикация выполняется отдельным action."}
          fix={"CourseCreate(title, slug, description)\n\nteacher_id = current_user.id\nstatus = \"draft\""}
        />

        <Callout tone="info">
          {"Server-managed поле не включается во входную schema только потому, что существует в ORM-модели."}
        </Callout>
      </Section>

      <Section number={"04"} title={"Финальная ER-диаграмма и инварианты"}>
        <Lead>
          {"ER-диаграмма объединяет User, Course, Module, Lesson, Enrollment и LessonCompletion. Рядом фиксируются unique constraints и правила, которые нельзя выразить одним foreign key."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Structure"}</h3>
          <p>{"User → Course → Module → Lesson."}</p>
          <h3>{"Learning"}</h3>
          <p>{"User → Enrollment → Course."}</p>
          <h3>{"Facts"}</h3>
          <p>{"Enrollment → LessonCompletion → Lesson."}</p>
        </div>

        <CodeBlock
          caption={"ER-диаграмма LMS Core"}
          code={"User 1 ─── * Course\nCourse 1 ─── * Module\nModule 1 ─── * Lesson\n\nUser 1 ─── * Enrollment * ─── 1 Course\nEnrollment 1 ─── * LessonCompletion * ─── 1 Lesson\n\nUNIQUE(student_id, course_id)\nUNIQUE(enrollment_id, lesson_id)\nUNIQUE(course_id, module.position)\nUNIQUE(module_id, lesson.position)"}
        />

        <RecallCard
          question={"Какие инварианты не гарантируются одними foreign keys?"}
          hint={"Подумайте о совпадении Course и actor."}
          answer={<p>{"Foreign keys не доказывают, что Lesson принадлежит Course из Enrollment, current_user владеет Enrollment или Course, а published/state разрешают действие. Эти правила проверяются сервисом и permissions."}</p>}
        />

        <Callout tone="info">
          {"Диаграмма должна различать database constraints и application invariants — это разные уровни защиты одной системы."}
        </Callout>
      </Section>

      <Section number={"05"} title={"Migration sequence без giant commit"}>
        <Lead>
          {"Существующий StudyHub уже работает. Новые таблицы добавляются последовательно, миграции применяются на чистой и текущей базе, а каждый шаг имеет rollback или понятную стратегию исправления."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Additive first"}</h3>
          <p>{"Новые таблицы и nullable/default изменения без разрушения старого API."}</p>
          <h3>{"Backfill/seed"}</h3>
          <p>{"Демо-данные создаются отдельным воспроизводимым шагом."}</p>
          <h3>{"Switch behavior"}</h3>
          <p>{"Endpoints подключаются после готовых constraints и tests."}</p>
        </div>

        <CodeSequence
          title={"Соберите безопасный migration plan"}
          prompt={"Расположите шаги от схемы к работающему slice."}
          pieces={[
            { id: "models", code: "описать модели и migration" },
            { id: "fresh", code: "применить migration на пустой базе" },
            { id: "existing", code: "применить на копии текущей базы" },
            { id: "seed", code: "создать воспроизводимые demo data" },
            { id: "slice", code: "подключить один vertical slice" },
            { id: "tests", code: "запустить migration + API tests" },
            { id: "giant", code: "создать все endpoints одним commit", note: "слишком большой шаг" },
          ]}
          correctOrder={[
            "models",
            "fresh",
            "existing",
            "seed",
            "slice",
            "tests",
          ]}
          explanation={"Сначала доказывается схема и воспроизводимость, затем включается одно пользовательское поведение."}
        />

        <TrueFalse
          statement={<>{"Если migration работает на пустой базе, этого достаточно для существующего StudyHub."}</>}
          isTrue={false}
          explanation={"Нужно проверить путь обновления текущей схемы и сохранность имеющихся данных."}
        />

        <Callout tone="info">
          {"Migration plan всегда включает две базы: fresh install и upgrade существующего состояния."}
        </Callout>
      </Section>

      <Section number={"06"} title={"Seed data и обратная совместимость"}>
        <Lead>
          {"Demo data делает flow воспроизводимым: teacher, student, published Course, Enrollment и несколько lessons. Seed не должен обходить constraints или требовать ручного редактирования базы."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Deterministic"}</h3>
          <p>{"Повторный запуск не создаёт хаотичные дубли."}</p>
          <h3>{"Representative"}</h3>
          <p>{"Данные покрывают happy path и один expected failure."}</p>
          <h3>{"Compatibility"}</h3>
          <p>{"Существующие endpoints остаются рабочими или получают задокументированный migration path."}</p>
        </div>

        <TypeCards>
          <TypeCard badge={"teacher"} title={"Владелец demo Course"} code={"teacher@example.test"}>
            {"Создаёт и публикует контент."}
          </TypeCard>
          <TypeCard badge={"student"} badgeTone={"float"} title={"Участник flow"} code={"student@example.test"}>
            {"Записывается и создаёт completion."}
          </TypeCard>
          <TypeCard badge={"course"} badgeTone={"str"} title={"Проверяемый контент"} code={"2 modules · 4 lessons"}>
            {"Даёт 0%, 50% и 100% progress scenarios."}
          </TypeCard>
        </TypeCards>

        <CompareSolutions
          question={"Какой seed пригоден для команды?"}
          left={{
            title: "Ручная правка БД",
            code: "Открыть GUI и создать строки",
            note: "Невоспроизводимо и легко пропустить constraint.",
          }}
          right={{
            title: "Идемпотентный script/command",
            code: "python -m app.seed_lms",
            note: "Повторяемый результат и явная проверка ошибок.",
          }}
          preferred={"right"}
          explanation={"Другой разработчик должен получить тот же demo flow одной командой."}
        />

        <Callout tone="info">
          {"Seed — часть developer experience и демонстрации, а не скрытая ручная подготовка автора."}
        </Callout>
      </Section>

      <Section number={"07"} title={"Vertical slices и Definition of Done"}>
        <Lead>
          {"Реализация идёт не по слоям «сначала все модели, потом все routers», а по законченным пользовательским сценариям. Каждый slice включает migration, schemas, service, endpoint, permissions и tests."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Slice 1"}</h3>
          <p>{"Teacher creates and edits own draft Course."}</p>
          <h3>{"Slice 2"}</h3>
          <p>{"Teacher builds content tree and publishes."}</p>
          <h3>{"Slice 3"}</h3>
          <p>{"Student enrolls in published Course."}</p>
          <h3>{"Slice 4"}</h3>
          <p>{"Student completes Lesson and reads progress."}</p>
        </div>

        <BranchExplorer
          code={"vertical slice\n├── migration/model\n├── schemas\n├── service\n├── permission\n├── endpoint\n├── positive test\n├── negative test\n└── docs/demo"}
          scenarios={[
            { label: "Course slice", activeLine: 3, output: "одна пользовательская ценность проходит через все слои" },
            { label: "без negative test", activeLine: 6, output: "permission не доказан" },
            { label: "без docs/demo", activeLine: 8, output: "результат трудно воспроизвести другому человеку" },
          ]}
        />

        <FlipCards
          cards={[
            { front: <>{"Done"}</>, back: <>{"Happy path и expected failure проходят автоматически."}</> },
            { front: <>{"Done"}</>, back: <>{"Migration работает fresh и upgrade."}</> },
            { front: <>{"Done"}</>, back: <>{"OpenAPI и README совпадают с contract."}</> },
            { front: <>{"Not done"}</>, back: <>{"Код написан, но ownership не проверен."}</> },
          ]}
        />

        <Callout tone="info">
          {"Definition of Done описывает доказательства готовности, а не процент написанного кода."}
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектный артефакт">
        <Lead>
          {"Завершите занятие не конспектом, а проверяемым документом docs/lms/blueprint.md. Он должен быть понятен другому разработчику без устных пояснений и связывать модель, успешный путь, ожидаемый отказ и критерии готовности."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>{"Проверка модели"}</h3>
          <p>{"Другой разработчик может восстановить сущности, связи и источник истины по документу docs/lms/blueprint.md."}</p>
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
            question={"Что обязательно содержит строка API contract?"}
            options={[
              "Method/path, actor, schemas, response и errors",
              "Только имя endpoint",
              "Только SQL",
            ]}
            correctIndex={0}
            explanation={"Contract связывает запрос, права и наблюдаемый результат."}
          />
          <QuizCard
            question={"Почему CourseCreate не принимает teacher_id?"}
            options={[
              "Ownership задаётся current_user на сервере",
              "Pydantic не поддерживает id",
              "Teacher не нужен",
            ]}
            correctIndex={0}
            explanation={"Server-managed поле нельзя доверять клиенту."}
          />
          <QuizCard
            question={"Что проверяет migration plan кроме fresh database?"}
            options={[
              "Upgrade существующей схемы и сохранность данных",
              "Только длину файла",
              "Только имя revision",
            ]}
            correctIndex={0}
            explanation={"Реальный проект обновляет уже существующее состояние."}
          />
          <QuizCard
            question={"Что является vertical slice?"}
            options={[
              "Один пользовательский flow через schema, service, endpoint, permissions и tests",
              "Все ORM-модели сразу",
              "Только router",
            ]}
            correctIndex={0}
            explanation={"Slice даёт законченное проверяемое поведение."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Blueprint объединяет product, data, behavior и delivery decisions."}</>,
            <>{"API contract фиксирует actor, schemas, response и expected errors."}</>,
            <>{"Create, Update и Read schemas имеют разные направления данных."}</>,
            <>{"ER-диаграмма различает database constraints и application invariants."}</>,
            <>{"Migration проверяется на fresh и существующей базе."}</>,
            <>{"Seed data должен быть воспроизводимым и идемпотентным."}</>,
            <>{"Vertical slices уменьшают blast radius и дают законченную ценность."}</>,
          ]}
        />

        <PracticeCta text={"Соберите docs/lms/blueprint.md: включите contract 12–16 endpoints, финальную ER-диаграмму, список schemas, migration sequence, demo seed и четыре vertical slices с Definition of Done. Проведите защиту blueprint и сделайте коммит docs: approve LMS Core blueprint."} />
      </Section>
    </RichLesson>
  );
}

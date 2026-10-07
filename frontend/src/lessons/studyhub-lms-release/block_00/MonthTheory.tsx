import { Database, GraduationCap } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FlipCards, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, TrueFalse, TypeCard, TypeCards } from "../../shared";

export function MonthTheory() {
  return (
    <RichLesson>
      <RichHero
        variant={"project"}
        chip={"ЭТАП 9 · общая теория"}
        title={"LMS-домен, Redis и финальный backend-релиз"}
        intro={"Единая модель этапа: authenticated actor выполняет permitted action над resource, PostgreSQL сохраняет доменные факты, Redis ускоряет временные представления, а tests, logs, CI, documentation и release tag доказывают качество конкретной версии."}
        tags={[
          {
            icon: <GraduationCap size={14} />,
            label: "LMS и permissions",
          },
          {
            icon: <Database size={14} />,
            label: "PostgreSQL + Redis",
          },
        ]}
      />

      <Section number={"01"} title={"Главная модель LMS: роли, ресурсы и действия"}>
        <Lead>
          {"LMS — не просто набор таблиц. Система связывает роли с ресурсами и правилами: teacher создаёт и публикует контент, student получает доступ через enrollment, admin управляет исключительными случаями. Каждый endpoint является проверяемым действием над конкретным resource."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Identity:"}</strong>
              {" current user определяется authentication layer и не приходит произвольным id из body."}
            </li>
            <li>
              <strong>{"Role:"}</strong>
              {" student, teacher или admin задаёт общий класс допустимых действий."}
            </li>
            <li>
              <strong>{"Ownership:"}</strong>
              {" teacher может изменять конкретный course только при совпадении owner_id."}
            </li>
            <li>
              <strong>{"Enrollment:"}</strong>
              {" student получает право проходить опубликованный course через отдельную связь."}
            </li>
            <li>
              <strong>{"Resource state:"}</strong>
              {" draft и published меняют доступность действия."}
            </li>
            <li>
              <strong>{"Permission result:"}</strong>
              {" allow или согласованный 403/404 до изменения данных."}
            </li>
          </ol>
          <p>
            {"Точный access contract строится как функция от current user, action, resource и состояния resource."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"authentication"}</>,
              <>{"кто выполняет request"}</>,
            ],
            [
              <>{"role"}</>,
              <>{"какой общий набор действий допустим"}</>,
            ],
            [
              <>{"ownership"}</>,
              <>{"кому принадлежит конкретный resource"}</>,
            ],
            [
              <>{"enrollment"}</>,
              <>{"имеет ли student доступ к course"}</>,
            ],
            [
              <>{"state"}</>,
              <>{"draft/published/archived"}</>,
            ],
            [
              <>{"authorization"}</>,
              <>{"разрешено ли действие сейчас"}</>,
            ],
            [
              <>{"audit"}</>,
              <>{"какой результат и причина зафиксированы"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"permission equation"}
          code={"permission = f(\n    current_user,\n    action,\n    resource,\n    resource_state,\n    ownership_or_enrollment,\n)\n\nexample:\ncan_update_course = (\n    user.role in {\"teacher\", \"admin\"}\n    and (user.id == course.owner_id or user.role == \"admin\")\n)"}
        />

        <BranchExplorer
          code={"load current user\nload course\ncheck role\ncheck ownership\ncheck state\nperform action"}
          scenarios={[
            {
              label: "anonymous request",
              activeLine: 0,
              output: "401: identity отсутствует",
            },
            {
              label: "student updates course",
              activeLine: 2,
              output: "403: role не разрешает действие",
            },
            {
              label: "teacher updates foreign course",
              activeLine: 3,
              output: "403/404: ownership не совпадает",
            },
            {
              label: "owner updates draft",
              activeLine: 5,
              output: "action allowed",
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"кто"}
            title={"Identity"}
            code={"current_user"}
          >
            {"Получается из проверенного credential, а не из клиентского поля owner_id."}
          </TypeCard>
          <TypeCard
            badge={"что"}
            badgeTone={"float"}
            title={"Resource"}
            code={"course / lesson / enrollment"}
          >
            {"Конкретный объект, над которым выполняется действие."}
          </TypeCard>
          <TypeCard
            badge={"можно"}
            badgeTone={"str"}
            title={"Permission"}
            code={"allow / deny"}
          >
            {"Результат проверки role, ownership, enrollment и state."}
          </TypeCard>
          <TypeCard
            badge={"почему"}
            title={"Contract"}
            code={"401 / 403 / 404"}
          >
            {"Согласованная реакция API на отказ."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Проверить current user"}</h3>
          <p>
            {"Не читать user identity из body."}
          </p>

          <h3>{"Загрузить resource"}</h3>
          <p>
            {"Определить объект и его state."}
          </p>

          <h3>{"Применить permission rule"}</h3>
          <p>
            {"Отделить access check от предметного изменения."}
          </p>

          <h3>{"Зафиксировать отрицательный тест"}</h3>
          <p>
            {"Чужой user не должен изменить resource."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Role отвечает на общий вопрос, ownership и enrollment — на вопрос о конкретном объекте. Эти уровни нельзя смешивать."}
        </Callout>

        <Callout tone={"warn"}>
          {"Скрытие существования resource через 404 может быть осознанным security contract, но должно применяться последовательно и тестироваться."}
        </Callout>

      </Section>

      <Section number={"02"} title={"Доменная модель: контент, связь и факт прохождения"}>
        <Lead>
          {"Course, Module и Lesson описывают структуру контента. Enrollment связывает student и Course. LessonCompletion хранит факт прохождения. Разделение сущностей позволяет выразить cardinality, уникальность, порядок и ограничения на уровне database."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Course:"}</strong>
              {" владелец, title, slug, description и publication state."}
            </li>
            <li>
              <strong>{"Module:"}</strong>
              {" один Course содержит упорядоченные modules."}
            </li>
            <li>
              <strong>{"Lesson:"}</strong>
              {" один Module содержит упорядоченные lessons."}
            </li>
            <li>
              <strong>{"Enrollment:"}</strong>
              {" association entity между User и Course."}
            </li>
            <li>
              <strong>{"Completion:"}</strong>
              {" association fact между Enrollment и Lesson."}
            </li>
            <li>
              <strong>{"Progress:"}</strong>
              {" вычисляемое представление поверх completion facts."}
            </li>
          </ol>
          <p>
            {"Правильная модель хранит устойчивые факты и вычисляет производные значения, вместо дублирования состояния в нескольких местах."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"one-to-many"}</>,
              <>{"Course → Module → Lesson"}</>,
            ],
            [
              <>{"many-to-many"}</>,
              <>{"User ↔ Course через Enrollment"}</>,
            ],
            [
              <>{"association model"}</>,
              <>{"связь с собственными полями и constraints"}</>,
            ],
            [
              <>{"unique pair"}</>,
              <>{"защита от duplicate enrollment/completion"}</>,
            ],
            [
              <>{"position"}</>,
              <>{"стабильный порядок внутри родителя"}</>,
            ],
            [
              <>{"derived value"}</>,
              <>{"progress, вычисленный из фактов"}</>,
            ],
            [
              <>{"foreign key"}</>,
              <>{"целостность связи между rows"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"relation map"}
          code={"courses.id ← modules.course_id\nmodules.id ← lessons.module_id\nusers.id ← enrollments.student_id\ncourses.id ← enrollments.course_id\nenrollments.id ← lesson_completions.enrollment_id\nlessons.id ← lesson_completions.lesson_id\n\nUNIQUE(enrollments.student_id, enrollments.course_id)\nUNIQUE(lesson_completions.enrollment_id, lesson_completions.lesson_id)"}
        />

        <BugHunt
          code={"class User:\n    enrolled_course_ids: str  # \"1,4,8\"\n    progress: int  # клиент присылает 73"}
          question={"Почему такая модель ненадёжна?"}
          options={[
            "Связи и progress нельзя целостно проверить и удобно запросить",
            "Строки запрещены в PostgreSQL",
            "У User не может быть дополнительных полей",
          ]}
          correctIndex={0}
          explanation={"Список ids в строке разрушает relation model, а произвольный progress дублирует вычисляемое состояние."}
          fix={"Enrollment(student_id, course_id)\nLessonCompletion(enrollment_id, lesson_id)\nprogress = completed_lessons / total_lessons"}
        />

        <TypeCards>
          <TypeCard
            badge={"content"}
            title={"Course tree"}
            code={"Course → Module → Lesson"}
          >
            {"Хранит структуру и порядок учебного материала."}
          </TypeCard>
          <TypeCard
            badge={"access"}
            badgeTone={"float"}
            title={"Enrollment"}
            code={"student ↔ course"}
          >
            {"Отдельно хранит дату и состояние записи."}
          </TypeCard>
          <TypeCard
            badge={"fact"}
            badgeTone={"str"}
            title={"Completion"}
            code={"enrollment ↔ lesson"}
          >
            {"Фиксирует одно завершение без редактируемого процента."}
          </TypeCard>
          <TypeCard
            badge={"view"}
            title={"Progress"}
            code={"derived metric"}
          >
            {"Собирается запросом и может кешироваться как представление."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Назвать факты"}</h3>
          <p>
            {"Определить, что должно переживать перезапуск и иметь историю."}
          </p>

          <h3>{"Назвать производные значения"}</h3>
          <p>
            {"Не хранить вычисляемое без необходимости."}
          </p>

          <h3>{"Добавить database constraints"}</h3>
          <p>
            {"Защитить уникальность независимо от race conditions приложения."}
          </p>

          <h3>{"Проверить deletion rules"}</h3>
          <p>
            {"Решить судьбу modules, lessons и progress при удалении course."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Association model нужна, когда самой связи требуются поля, constraints или жизненный цикл."}
        </Callout>

        <Callout tone={"warn"}>
          {"Cascade delete — бизнес-решение. Удаление course может уничтожить историю student, поэтому поведение нельзя выбирать автоматически."}
        </Callout>

      </Section>

      <Section number={"03"} title={"Vertical slice: от HTTP-request до завершённой возможности"}>
        <Lead>
          {"Горизонтальная разработка создаёт сначала все модели, затем все repositories, затем все routers — долгое время пользовательский сценарий не работает. Vertical slice проводит одну возможность через contract, model, query, rule, response и tests."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Contract:"}</strong>
              {" method, path, role, input, output и errors."}
            </li>
            <li>
              <strong>{"Migration:"}</strong>
              {" минимальное schema change для сценария."}
            </li>
            <li>
              <strong>{"Model/query:"}</strong>
              {" только нужные поля и relations."}
            </li>
            <li>
              <strong>{"Business rule:"}</strong>
              {" ownership, uniqueness или publication readiness."}
            </li>
            <li>
              <strong>{"Endpoint:"}</strong>
              {" связывает request context и service."}
            </li>
            <li>
              <strong>{"Tests:"}</strong>
              {" happy path, forbidden path и conflict path."}
            </li>
          </ol>
          <p>
            {"Vertical slice считается готовым, когда один пользователь может завершить действие через публичный API и результат защищён tests."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"slice 1"}</>,
              <>{"teacher creates course"}</>,
            ],
            [
              <>{"slice 2"}</>,
              <>{"teacher adds first module and lesson"}</>,
            ],
            [
              <>{"slice 3"}</>,
              <>{"teacher publishes ready course"}</>,
            ],
            [
              <>{"slice 4"}</>,
              <>{"student enrolls"}</>,
            ],
            [
              <>{"slice 5"}</>,
              <>{"student completes lesson"}</>,
            ],
            [
              <>{"slice 6"}</>,
              <>{"student reads progress"}</>,
            ],
            [
              <>{"review"}</>,
              <>{"contract and tests remain consistent"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"один vertical slice"}
          code={"POST /courses\n→ authenticate current teacher\n→ validate CourseCreate\n→ create Course(owner_id=current_user.id)\n→ commit transaction\n→ map CourseRead\n→ 201 response\n\ntests:\n- teacher success\n- student forbidden\n- duplicate slug conflict"}
        />

        <CompareSolutions
          question={"Какой способ быстрее даёт проверяемую ценность?"}
          left={{
            title: "Горизонтальные слои",
            code: "all models → all services → all routers",
            note: "Много незавершённых частей и поздняя интеграция.",
          }}
          right={{
            title: "Vertical slice",
            code: "one user story → full path → tests",
            note: "После каждого шага существует законченная возможность.",
          }}
          preferred={"right"}
          explanation={"Slice уменьшает риск интеграции и позволяет рано проверять contract."}
        />

        <TypeCards>
          <TypeCard
            badge={"input"}
            title={"HTTP contract"}
            code={"POST /courses"}
          >
            {"Фиксирует наблюдаемое поведение для клиента."}
          </TypeCard>
          <TypeCard
            badge={"rule"}
            badgeTone={"float"}
            title={"Domain action"}
            code={"create course for owner"}
          >
            {"Применяет identity и предметное правило."}
          </TypeCard>
          <TypeCard
            badge={"state"}
            badgeTone={"str"}
            title={"Transaction"}
            code={"commit or rollback"}
          >
            {"Сохраняет согласованное изменение."}
          </TypeCard>
          <TypeCard
            badge={"proof"}
            title={"Tests"}
            code={"201 / 403 / 409"}
          >
            {"Защищают разрешённый и запрещённые сценарии."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Выбрать одну user story"}</h3>
          <p>
            {"Не объединять создание course и весь progress flow."}
          </p>

          <h3>{"Назвать Definition of Done"}</h3>
          <p>
            {"Endpoint, migration, tests и docs."}
          </p>

          <h3>{"Реализовать полный путь"}</h3>
          <p>
            {"Не оставлять временный bypass permissions."}
          </p>

          <h3>{"Провести review contract"}</h3>
          <p>
            {"Убедиться, что status и schema согласованы."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Vertical slice не запрещает слои приложения. Он задаёт порядок работы: слой добавляется только в объёме, нужном законченному сценарию."}
        </Callout>

        <Callout tone={"warn"}>
          {"Не создавайте generic repository или универсальный service до появления повторяемой проблемы. Финальный проект должен оставаться объяснимым."}
        </Callout>

      </Section>

      <Section number={"04"} title={"Redis как временная копия, а не новая база LMS"}>
        <Lead>
          {"Redis хранит быстро доступные временные значения. В StudyHub PostgreSQL остаётся источником истины, а Redis может хранить сериализованный каталог, счётчик rate limit или короткое служебное состояние. Потеря cache не должна уничтожать course, enrollment или progress."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Key design:"}</strong>
              {" имя включает ресурс и версию представления."}
            </li>
            <li>
              <strong>{"Serialization:"}</strong>
              {" cache хранит данные в согласованном формате."}
            </li>
            <li>
              <strong>{"TTL:"}</strong>
              {" ограничивает время жизни даже при пропущенной invalidation."}
            </li>
            <li>
              <strong>{"Cache-aside:"}</strong>
              {" приложение читает Redis, затем PostgreSQL при miss."}
            </li>
            <li>
              <strong>{"Invalidation:"}</strong>
              {" write в PostgreSQL удаляет устаревший key после commit."}
            </li>
            <li>
              <strong>{"Fallback:"}</strong>
              {" недоступный Redis не повреждает постоянное состояние."}
            </li>
          </ol>
          <p>
            {"Кеш считается корректным только при определённых key, TTL, invalidation, fallback и tests свежести данных."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"key"}</>,
              <>{"catalog:v1 или course:{id}:public"}</>,
            ],
            [
              <>{"value"}</>,
              <>{"serialized response representation"}</>,
            ],
            [
              <>{"TTL"}</>,
              <>{"максимальная длительность потенциальной устарелости"}</>,
            ],
            [
              <>{"hit"}</>,
              <>{"response получен без database read"}</>,
            ],
            [
              <>{"miss"}</>,
              <>{"database read и заполнение cache"}</>,
            ],
            [
              <>{"invalidation"}</>,
              <>{"write удаляет зависимые keys"}</>,
            ],
            [
              <>{"fallback"}</>,
              <>{"database path при Redis failure"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"cache state machine"}
          code={"request catalog\n→ GET key\n├── value exists → HIT → decode → return\n├── key absent   → MISS → query DB → SETEX → return\n└── Redis error  → DEGRADED → query DB → return\n\ncourse updated\n→ DB commit\n→ DELETE catalog:v1\n→ next request becomes MISS"}
        />

        <TrueFalse
          statement={
            <>
              {"После добавления Redis PostgreSQL можно не использовать для опубликованного каталога."}
            </>
          }
          isTrue={false}
          explanation={"Redis хранит временную копию. PostgreSQL сохраняет авторитетное состояние и восстанавливает cache после miss или потери Redis."}
        />

        <TypeCards>
          <TypeCard
            badge={"truth"}
            title={"Database"}
            code={"durable normalized state"}
          >
            {"Принимает writes и защищает constraints."}
          </TypeCard>
          <TypeCard
            badge={"copy"}
            badgeTone={"float"}
            title={"Cache"}
            code={"fast derived representation"}
          >
            {"Ускоряет чтение, но может быть удалён и восстановлен."}
          </TypeCard>
          <TypeCard
            badge={"clock"}
            badgeTone={"str"}
            title={"TTL"}
            code={"max stale window"}
          >
            {"Ограничивает последствия пропущенного invalidation."}
          </TypeCard>
          <TypeCard
            badge={"sync"}
            title={"Invalidation"}
            code={"commit → delete key"}
          >
            {"Связывает write path и свежесть следующего read."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Сначала измерить query path"}</h3>
          <p>
            {"Без baseline нельзя доказать пользу cache."}
          </p>

          <h3>{"Определить dependency graph keys"}</h3>
          <p>
            {"Какие writes делают catalog stale."}
          </p>

          <h3>{"Тестировать время и свежесть"}</h3>
          <p>
            {"Hit/miss не достаточно без invalidation test."}
          </p>

          <h3>{"Проверить Redis failure"}</h3>
          <p>
            {"Согласовать fail-open или fail-closed для каждой функции."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Cache-aside оставляет контроль у приложения и хорошо показывает начинающему путь hit, miss и invalidation."}
        </Callout>

        <Callout tone={"warn"}>
          {"Слишком длинный TTL без invalidation превращает скорость в систематическую выдачу устаревших данных."}
        </Callout>

      </Section>

      <Section number={"05"} title={"Rate limit и background work: разные задачи Redis и процесса"}>
        <Lead>
          {"Rate limit управляет частотой request, а background task откладывает небольшую работу после response. Эти механизмы не являются взаимозаменяемыми: один защищает endpoint, другой сокращает ожидание клиента при некритическом действии."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Rate key:"}</strong>
              {" связать окно с user, IP или credential по понятному правилу."}
            </li>
            <li>
              <strong>{"Counter + expiry:"}</strong>
              {" увеличить счётчик и назначить срок жизни."}
            </li>
            <li>
              <strong>{"Decision:"}</strong>
              {" allow request или вернуть 429."}
            </li>
            <li>
              <strong>{"BackgroundTasks:"}</strong>
              {" запланировать короткую работу после формирования response."}
            </li>
            <li>
              <strong>{"Failure semantics:"}</strong>
              {" решить, что произойдёт при недоступном Redis или падении process."}
            </li>
            <li>
              <strong>{"Observability:"}</strong>
              {" логировать отказ, latency и результат фоновой операции."}
            </li>
          </ol>
          <p>
            {"Механизм выбирается по требуемой гарантии: rate limit требует общего временного состояния, а критическая фоновая работа требует устойчивой очереди, которой BackgroundTasks не является."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"429"}</>,
              <>{"Too Many Requests"}</>,
            ],
            [
              <>{"window"}</>,
              <>{"временной интервал подсчёта"}</>,
            ],
            [
              <>{"counter"}</>,
              <>{"число requests в окне"}</>,
            ],
            [
              <>{"BackgroundTasks"}</>,
              <>{"in-process work after response"}</>,
            ],
            [
              <>{"best effort"}</>,
              <>{"действие может не завершиться при crash"}</>,
            ],
            [
              <>{"durable queue"}</>,
              <>{"следующая ступень для гарантированной доставки"}</>,
            ],
            [
              <>{"idempotency"}</>,
              <>{"повтор не создаёт нежелательный duplicate"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"rate-limit sketch"}
          code={"key = f\"rate:login:{client_id}\"\ncount = redis.incr(key)\nif count == 1:\n    redis.expire(key, 60)\nif count > 5:\n    raise HTTPException(status_code=429)\n\n# non-critical background work\nbackground_tasks.add_task(write_audit_snapshot, event)"}
        />

        <RecallCard
          question={"Почему отправку обязательного финансового документа нельзя доверить только BackgroundTasks?"}
          hint={"Подумайте, где хранится задача и что произойдёт при завершении process."}
          answer={
            <p>
              {"BackgroundTasks живёт внутри текущего process и не даёт durable guarantee. Для критической работы нужна устойчивая очередь, retry и idempotency."}
            </p>
          }
        />

        <TypeCards>
          <TypeCard
            badge={"limit"}
            title={"Rate limit"}
            code={"counter + expiry"}
          >
            {"Защищает endpoint от слишком частого использования."}
          </TypeCard>
          <TypeCard
            badge={"status"}
            badgeTone={"float"}
            title={"429 response"}
            code={"Retry-After"}
          >
            {"Делает отказ частью понятного HTTP-contract."}
          </TypeCard>
          <TypeCard
            badge={"later"}
            badgeTone={"str"}
            title={"BackgroundTasks"}
            code={"after response"}
          >
            {"Подходит для короткого best-effort действия."}
          </TypeCard>
          <TypeCard
            badge={"next"}
            title={"Durable queue"}
            code={"persist + retry"}
          >
            {"Нужна, когда потеря работы недопустима."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Назвать защищаемый endpoint"}</h3>
          <p>
            {"Не ставить limit на всё одинаково."}
          </p>

          <h3>{"Выбрать identity key"}</h3>
          <p>
            {"User, credential или IP с учётом proxy."}
          </p>

          <h3>{"Проверить boundary"}</h3>
          <p>
            {"Последний разрешённый и первый запрещённый request."}
          </p>

          <h3>{"Смоделировать crash"}</h3>
          <p>
            {"Честно определить, допустима ли потеря background operation."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"В финальном проекте достаточно одного понятного rate limit и одной безопасной background operation с явно описанной гарантией."}
        </Callout>

        <Callout tone={"warn"}>
          {"Не называйте in-process BackgroundTasks очередью задач: у неё нет отдельного durable broker и независимого worker."}
        </Callout>

      </Section>

      <Section number={"06"} title={"Финальный аудит как набор доказательств"}>
        <Lead>
          {"Аудит не означает перечитать код и сказать, что он выглядит хорошо. Каждая область проверяется наблюдаемым evidence: API contract — тестами, security — forbidden scenarios, performance — query count и plans, deployment — clean bootstrap, документация — прохождением инструкции новым человеком."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"API evidence:"}</strong>
              {" OpenAPI, status tests и единая error schema."}
            </li>
            <li>
              <strong>{"Security evidence:"}</strong>
              {" 401/403/404 tests, secret scan и безопасные logs."}
            </li>
            <li>
              <strong>{"Database evidence:"}</strong>
              {" migrations from zero, constraints и transaction tests."}
            </li>
            <li>
              <strong>{"Performance evidence:"}</strong>
              {" query count, N+1 test, index plan и cache metrics."}
            </li>
            <li>
              <strong>{"Delivery evidence:"}</strong>
              {" CI run, image tag, health и smoke test."}
            </li>
            <li>
              <strong>{"Documentation evidence:"}</strong>
              {" clean user follows README without hidden steps."}
            </li>
          </ol>
          <p>
            {"Замечание аудита считается полезным, если содержит риск, воспроизводимый сценарий, ожидаемое поведение и проверяемое исправление."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"risk"}</>,
              <>{"что может нарушиться или быть использовано неправильно"}</>,
            ],
            [
              <>{"reproduction"}</>,
              <>{"как увидеть проблему"}</>,
            ],
            [
              <>{"impact"}</>,
              <>{"какие данные или пользователи затронуты"}</>,
            ],
            [
              <>{"fix"}</>,
              <>{"минимальное безопасное изменение"}</>,
            ],
            [
              <>{"verification"}</>,
              <>{"test, metric, log или plan после исправления"}</>,
            ],
            [
              <>{"priority"}</>,
              <>{"critical/high/medium/low"}</>,
            ],
            [
              <>{"owner"}</>,
              <>{"кто отвечает за завершение"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"audit finding template"}
          code={"Finding: student can read foreign progress\nRisk: object-level authorization bypass\nReproduce: GET /enrollments/{foreign_id}/progress\nExpected: 403 or hidden 404\nFix: require enrollment.student_id == current_user.id\nVerify: negative integration test\nPriority: high"}
        />

        <MatchPairs
          prompt={"Соедините область аудита с наиболее сильным доказательством."}
          leftTitle={"Область"}
          rightTitle={"Evidence"}
          pairs={[
            {
              left: "permissions",
              right: "negative integration tests",
            },
            {
              left: "N+1",
              right: "SQL query count for list endpoint",
            },
            {
              left: "migrations",
              right: "upgrade from empty database",
            },
            {
              left: "cache invalidation",
              right: "write followed by fresh read test",
            },
            {
              left: "deployment",
              right: "smoke test on exact release tag",
            },
            {
              left: "README",
              right: "clean bootstrap by another person",
            },
          ]}
          explanation={"Мнение становится инженерным выводом только после воспроизводимого доказательства."}
        />

        <TypeCards>
          <TypeCard
            badge={"contract"}
            title={"API evidence"}
            code={"status + schema tests"}
          >
            {"Доказывает внешнее поведение независимо от внутренней реализации."}
          </TypeCard>
          <TypeCard
            badge={"access"}
            badgeTone={"float"}
            title={"Security evidence"}
            code={"forbidden scenarios"}
          >
            {"Показывает, что чужие resources действительно закрыты."}
          </TypeCard>
          <TypeCard
            badge={"query"}
            badgeTone={"str"}
            title={"Performance evidence"}
            code={"count + EXPLAIN"}
          >
            {"Отделяет измерение от предположения."}
          </TypeCard>
          <TypeCard
            badge={"release"}
            title={"Delivery evidence"}
            code={"tag + CI + smoke"}
          >
            {"Связывает running version с проверенным commit."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Создать audit checklist"}</h3>
          <p>
            {"Не менять код во время первого прохода."}
          </p>

          <h3>{"Собрать findings"}</h3>
          <p>
            {"Для каждого указать evidence и priority."}
          </p>

          <h3>{"Исправлять по риску"}</h3>
          <p>
            {"Не начинать с косметики при security bypass."}
          </p>

          <h3>{"Закрывать finding тестом"}</h3>
          <p>
            {"Сохранить доказательство, что дефект не вернулся."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Финальный audit report является частью портфолио: он показывает способность находить и приоритизировать инженерные риски."}
        </Callout>

        <Callout tone={"warn"}>
          {"Большой рефакторинг во время release audit может создать больше риска, чем исправляет. Предпочитайте минимальные проверяемые изменения."}
        </Callout>

      </Section>

      <Section number={"07"} title={"Портфолио и технический рассказ о проекте"}>
        <Lead>
          {"Сильный рассказ не начинается со списка библиотек. Он объясняет проблему, пользователей, ключевой flow, архитектурные решения, сложный дефект, измеримую оптимизацию, границы MVP и то, как проект воспроизводится."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Проблема:"}</strong>
              {" какую учебную работу поддерживает StudyHub."}
            </li>
            <li>
              <strong>{"Пользователи:"}</strong>
              {" student, teacher и admin с разными действиями."}
            </li>
            <li>
              <strong>{"Architecture:"}</strong>
              {" request flow, data model и infrastructure boundaries."}
            </li>
            <li>
              <strong>{"Решение:"}</strong>
              {" почему association models, computed progress и Redis cache-aside."}
            </li>
            <li>
              <strong>{"Качество:"}</strong>
              {" tests, CI, migrations, logs, audit и release process."}
            </li>
            <li>
              <strong>{"Ограничения:"}</strong>
              {" что сознательно не входит в MVP и почему."}
            </li>
          </ol>
          <p>
            {"Технический рассказ должен позволить интервьюеру задать уточняющий вопрос на каждом шаге и получить ответ, связанный с реальным кодом."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"elevator pitch"}</>,
              <>{"30 секунд о проблеме и результате"}</>,
            ],
            [
              <>{"architecture map"}</>,
              <>{"2 минуты о границах и пути request"}</>,
            ],
            [
              <>{"deep dive"}</>,
              <>{"5 минут об одном решении и компромиссах"}</>,
            ],
            [
              <>{"incident story"}</>,
              <>{"ошибка, диагностика, исправление, test"}</>,
            ],
            [
              <>{"performance story"}</>,
              <>{"baseline, change и measured result"}</>,
            ],
            [
              <>{"limitations"}</>,
              <>{"честные не реализованные возможности"}</>,
            ],
            [
              <>{"next steps"}</>,
              <>{"осмысленный backlog, а не список модных технологий"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"структура ответа на интервью"}
          code={"Context: каталог courses часто читался\nProblem: повторный JOIN увеличивал latency\nOptions: no cache / response cache / denormalization\nDecision: Redis cache-aside for public catalog\nTrade-off: invalidation complexity\nVerification: hit/miss tests + latency comparison\nBoundary: PostgreSQL remains source of truth"}
        />

        <FlipCards
          cards={[
            {
              front: <>{"Почему FastAPI?"}</>,
              back: <>{"Покажите требования проекта и удобство contracts/dependencies, а не популярность."}</>,
            },
            {
              front: <>{"Почему PostgreSQL?"}</>,
              back: <>{"Связанные данные, constraints, transactions и запросы."}</>,
            },
            {
              front: <>{"Почему Redis?"}</>,
              back: <>{"Измеримое повторное чтение и временное представление."}</>,
            },
            {
              front: <>{"Почему монолит?"}</>,
              back: <>{"Один deployable service соответствует масштабу MVP и уровню команды."}</>,
            },
            {
              front: <>{"Главный дефект?"}</>,
              back: <>{"Опишите reproduction, root cause, fix и regression test."}</>,
            },
            {
              front: <>{"Что улучшить?"}</>,
              back: <>{"Назовите приоритетный next step и критерий пользы."}</>,
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"context"}
            title={"Problem first"}
            code={"users + pain"}
          >
            {"Создаёт причину существования проекта."}
          </TypeCard>
          <TypeCard
            badge={"decision"}
            badgeTone={"float"}
            title={"Trade-off"}
            code={"options → choice"}
          >
            {"Показывает инженерное мышление, а не механическое применение stack."}
          </TypeCard>
          <TypeCard
            badge={"proof"}
            badgeTone={"str"}
            title={"Evidence"}
            code={"test / metric / log"}
          >
            {"Привязывает рассказ к проверяемому результату."}
          </TypeCard>
          <TypeCard
            badge={"limit"}
            title={"Honest boundary"}
            code={"not in MVP"}
          >
            {"Показывает умение контролировать scope."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Записать три версии рассказа"}</h3>
          <p>
            {"30 секунд, 3 минуты и 10 минут."}
          </p>

          <h3>{"Привязать утверждения к файлам"}</h3>
          <p>
            {"Каждое решение можно открыть в code, diagram или test."}
          </p>

          <h3>{"Репетировать уточнения"}</h3>
          <p>
            {"Что будет при duplicate, Redis failure, чужом resource и migration error."}
          </p>

          <h3>{"Убрать лишний jargon"}</h3>
          <p>
            {"Термин используется только если ученик может точно объяснить его роль."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Проект защищается через связку requirement → decision → implementation → evidence → limitation."}
        </Callout>

        <Callout tone={"warn"}>
          {"Не приписывайте проекту production-scale свойства, которые не измерялись и не реализованы. Честная граница повышает доверие."}
        </Callout>

      </Section>

      <Section number={"08"} title={"Единая модель StudyHub LMS Release"}>
        <Lead>
          {"Финальная теория соединяет домен и эксплуатацию в один путь: authenticated actor выполняет permitted action, transaction сохраняет авторитетные факты, response может использовать временное представление, а tests, logs, metrics и release artifact доказывают качество результата."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Request:"}</strong>
              {" клиент передаёт credential, path и validated data."}
            </li>
            <li>
              <strong>{"Identity:"}</strong>
              {" authentication dependency создаёт current user."}
            </li>
            <li>
              <strong>{"Permission:"}</strong>
              {" role, ownership, enrollment и state разрешают действие."}
            </li>
            <li>
              <strong>{"Transaction:"}</strong>
              {" PostgreSQL сохраняет domain facts или откатывает operation."}
            </li>
            <li>
              <strong>{"Representation:"}</strong>
              {" Pydantic формирует response; Redis может хранить временную копию чтения."}
            </li>
            <li>
              <strong>{"Evidence:"}</strong>
              {" tests, logs, metrics, CI и release tag связывают поведение с версией."}
            </li>
          </ol>
          <p>
            {"StudyHub LMS Release является цельным backend не из-за числа технологий, а потому что каждый слой имеет понятную ответственность и проверяемую границу."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"identity layer"}</>,
              <>{"кто выполняет действие"}</>,
            ],
            [
              <>{"permission layer"}</>,
              <>{"можно ли выполнить действие над resource"}</>,
            ],
            [
              <>{"domain layer"}</>,
              <>{"какое правило изменяет состояние"}</>,
            ],
            [
              <>{"transaction layer"}</>,
              <>{"атомарно сохраняет факты"}</>,
            ],
            [
              <>{"representation layer"}</>,
              <>{"формирует внешний contract"}</>,
            ],
            [
              <>{"cache layer"}</>,
              <>{"временно ускоряет согласованные reads"}</>,
            ],
            [
              <>{"evidence layer"}</>,
              <>{"доказывает поведение exact release"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"полный путь"}
          code={"HTTP request\n→ authentication\n→ current User\n→ authorization(role + ownership + state)\n→ domain service\n→ SQLAlchemy transaction\n→ PostgreSQL facts\n→ optional Redis invalidation/cache\n→ Pydantic response\n→ HTTP response\n→ logs + metrics + tests + CI\n→ versioned release"}
        />

        <CodeSequence
          title={"Восстановите путь изменения Course"}
          prompt={"Расположите действия от request до доказательства release."}
          pieces={[
            {
              id: "request",
              code: "validate HTTP request and credential",
            },
            {
              id: "identity",
              code: "resolve current teacher",
            },
            {
              id: "permission",
              code: "check course ownership",
            },
            {
              id: "transaction",
              code: "update PostgreSQL in transaction",
            },
            {
              id: "invalidate",
              code: "invalidate catalog cache after commit",
            },
            {
              id: "response",
              code: "return CourseRead response",
            },
            {
              id: "evidence",
              code: "record logs and pass integration test",
            },
          ]}
          correctOrder={[
            "request",
            "identity",
            "permission",
            "transaction",
            "invalidate",
            "response",
            "evidence",
          ]}
          explanation={"Cache invalidation следует после успешного commit, а evidence подтверждает весь внешний contract."}
        />

        <TypeCards>
          <TypeCard
            badge={"actor"}
            title={"Current user"}
            code={"authenticated identity"}
          >
            {"Не позволяет клиенту самостоятельно выбрать владельца действия."}
          </TypeCard>
          <TypeCard
            badge={"fact"}
            badgeTone={"float"}
            title={"PostgreSQL state"}
            code={"durable constraints"}
          >
            {"Сохраняет авторитетные данные LMS."}
          </TypeCard>
          <TypeCard
            badge={"copy"}
            badgeTone={"str"}
            title={"Redis state"}
            code={"temporary representation"}
          >
            {"Может исчезнуть и быть восстановлен из source of truth."}
          </TypeCard>
          <TypeCard
            badge={"proof"}
            title={"Release evidence"}
            code={"tests + CI + tag"}
          >
            {"Показывает, какая версия реализует описанный contract."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Проследить один write request"}</h3>
          <p>
            {"Назвать actor, permission, transaction и invalidation."}
          </p>

          <h3>{"Проследить один cached read"}</h3>
          <p>
            {"Назвать hit, miss, fallback и TTL."}
          </p>

          <h3>{"Проследить один forbidden request"}</h3>
          <p>
            {"Показать точку остановки до mutation."}
          </p>

          <h3>{"Проследить один release"}</h3>
          <p>
            {"Связать commit, CI, image, migrations и demo."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Главная компетенция выпускника — проследить путь данных и ответственности от request до durable state и обратно."}
        </Callout>

        <Callout tone={"warn"}>
          {"Не добавляйте новый слой, если невозможно назвать его вход, выход, failure mode и способ проверки."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что является source of truth для courses и progress facts?"}
            options={[
              "PostgreSQL",
              "Redis cache",
              "Frontend state",
            ]}
            correctIndex={0}
            explanation={"Redis хранит временные представления; авторитетные связи и факты защищает PostgreSQL."}
          />

          <QuizCard
            question={"Когда проверяется object-level permission?"}
            options={[
              "До изменения transaction state",
              "После успешного commit",
              "Только в README",
            ]}
            correctIndex={0}
            explanation={"Запрещённый actor не должен успеть изменить resource."}
          />

          <QuizCard
            question={"Что нужно для корректного cache?"}
            options={[
              "Key, TTL, invalidation, fallback и tests",
              "Только redis.get",
              "Только большой TTL",
            ]}
            correctIndex={0}
            explanation={"Без политики свежести и отказа cache становится источником трудно диагностируемых ошибок."}
          />

          <QuizCard
            question={"Какой рассказ о проекте сильнее?"}
            options={[
              "Problem → options → decision → evidence → limitation",
              "Длинный список библиотек",
              "Утверждение, что проект production-ready без измерений",
            ]}
            correctIndex={0}
            explanation={"Инженерный рассказ показывает причины, компромиссы и проверяемые результаты."}
          />

        </div>

        <KeyTakeaways
          points={[
            <>{"LMS contract связывает actor, action, resource и resource state."}</>,
            <>{"Association models хранят связи с собственными полями и constraints."}</>,
            <>{"Progress надёжнее вычислять из completion facts."}</>,
            <>{"Vertical slice проводит одну user story через все необходимые слои."}</>,
            <>{"Redis является временной копией или служебным состоянием, а не заменой PostgreSQL."}</>,
            <>{"Rate limit и background work решают разные задачи и имеют разные гарантии."}</>,
            <>{"Финальный аудит опирается на воспроизводимые evidence, а не на впечатление от кода."}</>,
            <>{"Release считается завершённым после clean bootstrap, tests, demo и защиты решений."}</>,
          ]}
        />

        <PracticeCta
          text={"Составьте technical passport StudyHub LMS Release: роли, основные resources, permissions matrix, ER relations, три vertical slices, transaction boundaries, Redis keys, TTL и invalidation, rate-limit contract, background-task guarantee, audit evidence, clean-bootstrap commands, demo flow, release tag и пять честных limitations. Затем проследите один write, один cached read и один forbidden request от HTTP до результата."}
        />

      </Section>

    </RichLesson>
  );
}

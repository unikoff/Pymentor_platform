import {
  BookOpen,
  Boxes,
  Brain,
  Database,
  FileCheck2,
  Gauge,
  GitBranch,
  GraduationCap,
  KeyRound,
  Layers,
  RefreshCw,
  Route,
  ShieldCheck,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  FlipCards,
  KeyTakeaways,
  Lead,
  MatchPairs,
  MethodGrid,
  PracticeCta,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TerminalDemo,
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

export function LearningRoadmap() {
  return (
    <RichLesson>
      <RichHero
        variant={"project"}
        chip={"ЭТАП 9 · карта обучения"}
        title={"План обучения: этап 9"}
        intro={"За 24 занятия Deployable StudyHub превратится в StudyHub LMS Release: ученик спроектирует LMS-домен, реализует teacher/student flow, добавит обоснованный Redis, проведёт финальный аудит и защитит проект как портфельную backend-систему."}
        tags={[
          {
            icon: <Route size={14} />,
            label: "занятия 189–212",
          },
          {
            icon: <Trophy size={14} />,
            label: "StudyHub LMS Release",
          },
        ]}
      />

      <Section number={"01"} title={"От Deployable StudyHub к финальному LMS-релизу"}>
        <Lead>
          {"Deployable StudyHub уже воспроизводимо запускается, проходит CI и имеет понятный release flow. Финальный этап отвечает на вопрос, способен ли проект показать содержательную бизнес-логику, выдержать отрицательные сценарии и быть убедительно защищён как портфельная работа."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Сначала спроектировать:"}</strong>
              {" назвать пользователей, MVP, сущности, связи, инварианты и permissions до большого изменения кода."}
            </li>
            <li>
              <strong>{"Реализовать вертикально:"}</strong>
              {" дать teacher и student законченные пользовательские сценарии вместо слоя из незавершённых моделей."}
            </li>
            <li>
              <strong>{"Добавить эксплуатационные решения:"}</strong>
              {" использовать Redis только после измеримой проблемы повторных чтений или ограничений частоты."}
            </li>
            <li>
              <strong>{"Завершить качество:"}</strong>
              {" проверить errors, security, N+1, migrations, tests, CI, Docker и документацию."}
            </li>
            <li>
              <strong>{"Подготовить доказательства:"}</strong>
              {" создать demo data, архитектурную схему, ER-диаграмму, release notes и сценарий показа."}
            </li>
            <li>
              <strong>{"Защитить решения:"}</strong>
              {" объяснить не только что сделано, но и почему выбран именно такой контракт."}
            </li>
          </ol>
          <p>
            {"Итог этапа — StudyHub LMS Release: проект с реальным доменом, проверяемым пользовательским flow, эксплуатационными границами и материалами для собеседования."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"вход этапа"}</>,
              <>{"Deployable StudyHub"}</>,
            ],
            [
              <>{"основной проект"}</>,
              <>{"StudyHub LMS Release"}</>,
            ],
            [
              <>{"занятия"}</>,
              <>{"189–212"}</>,
            ],
            [
              <>{"блоки"}</>,
              <>{"33–36"}</>,
            ],
            [
              <>{"центральный flow"}</>,
              <>{"teacher → course → student → enrollment → progress"}</>,
            ],
            [
              <>{"операционная задача"}</>,
              <>{"cache, invalidation и controlled background work"}</>,
            ],
            [
              <>{"финальное доказательство"}</>,
              <>{"release, demo, tests и защита"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"эволюция проекта"}
          code={"Deployable StudyHub\n→ LMS requirements and ER model\n→ Course / Module / Lesson\n→ Enrollment and Progress\n→ permissions and vertical slices\n→ Redis cache + invalidation\n→ background operation\n→ final audit + portfolio\n→ StudyHub LMS Release"}
        />

        <CodeSequence
          title={"Соберите порядок финального этапа"}
          prompt={"Расположите шаги так, чтобы инфраструктура и новые технологии не опережали бизнес-требования."}
          pieces={[
            {
              id: "requirements",
              code: "зафиксировать MVP, roles и user stories",
            },
            {
              id: "model",
              code: "спроектировать ER-diagram и constraints",
            },
            {
              id: "vertical",
              code: "реализовать teacher/student vertical flow",
            },
            {
              id: "measure",
              code: "измерить повторное чтение каталога",
            },
            {
              id: "redis",
              code: "добавить cache, TTL и invalidation",
            },
            {
              id: "audit",
              code: "провести security/performance/test audit",
            },
            {
              id: "release",
              code: "собрать demo, release и защиту",
            },
          ]}
          correctOrder={[
            "requirements",
            "model",
            "vertical",
            "measure",
            "redis",
            "audit",
            "release",
          ]}
          explanation={"Redis и оптимизация появляются после рабочего LMS-flow и измеримой проблемы. Портфолио собирается после технического аудита."}
        />

        <TypeCards>
          <TypeCard
            badge={"домен"}
            title={"LMS Core"}
            code={"Course → Module → Lesson"}
          >
            {"Показывает связную предметную модель вместо очередного абстрактного CRUD."}
          </TypeCard>
          <TypeCard
            badge={"сценарий"}
            badgeTone={"float"}
            title={"Vertical slice"}
            code={"request → DB → response"}
          >
            {"Каждый шаг даёт законченную возможность конкретной роли."}
          </TypeCard>
          <TypeCard
            badge={"эксплуатация"}
            badgeTone={"str"}
            title={"Redis boundary"}
            code={"cache ≠ source of truth"}
          >
            {"Ускоряет повторные чтения, но не заменяет PostgreSQL."}
          </TypeCard>
          <TypeCard
            badge={"защита"}
            title={"Portfolio evidence"}
            code={"README + diagrams + demo"}
          >
            {"Делает проект понятным без устного сопровождения автора."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Назвать проблему до технологии"}</h3>
          <p>
            {"Каждый новый слой должен отвечать на наблюдаемую потребность проекта."}
          </p>

          <h3>{"Закрывать пользовательский путь"}</h3>
          <p>
            {"Не оставлять набор ORM-моделей без работающего endpoint и теста."}
          </p>

          <h3>{"Проверять запреты"}</h3>
          <p>
            {"Для permissions важны не только разрешённые, но и запрещённые действия."}
          </p>

          <h3>{"Фиксировать решения"}</h3>
          <p>
            {"Каждый блок обновляет ER-diаграмму, contract table, README или release checklist."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Финальный этап не пытается добавить максимальное число технологий. Его цель — показать зрелое владение уже изученным стеком на содержательном проекте."}
        </Callout>

        <Callout tone={"warn"}>
          {"Публичная демонстрация не компенсирует неясный домен, отсутствующие отрицательные тесты или миграции, которые работают только на базе автора."}
        </Callout>

      </Section>

      <Section number={"02"} title={"Блок 33 · Проектирование StudyHub LMS Core"}>
        <Lead>
          {"Первый блок не начинается с ORM-классов. Ученик сначала определяет роли, пользовательские истории, границу MVP, структуру контента, enrollment, progress, ownership и API contract. Это уменьшает риск переписать проект после первых endpoints."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"189 · MVP:"}</strong>
              {" student, teacher, admin, основной flow и out-of-scope."}
            </li>
            <li>
              <strong>{"190 · Content model:"}</strong>
              {" Course, Module, Lesson, order и publication state."}
            </li>
            <li>
              <strong>{"191 · Enrollment:"}</strong>
              {" many-to-many через отдельную association model с уникальностью."}
            </li>
            <li>
              <strong>{"192 · Progress:"}</strong>
              {" факты completion, вычисляемый процент и инварианты."}
            </li>
            <li>
              <strong>{"193 · Permissions:"}</strong>
              {" ownership, roles и object-level access matrix."}
            </li>
            <li>
              <strong>{"194 · Contract:"}</strong>
              {" method/path/input/output/errors, ER-diagram и migration plan."}
            </li>
          </ol>
          <p>
            {"Блок заканчивается набором проектных документов, по которым другой разработчик может понять данные, права, endpoints и безопасный порядок реализации."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"MVP"}</>,
              <>{"минимальный законченный продуктовый сценарий"}</>,
            ],
            [
              <>{"Course"}</>,
              <>{"верхняя сущность учебного контента"}</>,
            ],
            [
              <>{"Enrollment"}</>,
              <>{"связь student и course с собственным состоянием"}</>,
            ],
            [
              <>{"Completion"}</>,
              <>{"факт завершения конкретного lesson"}</>,
            ],
            [
              <>{"ownership"}</>,
              <>{"право менять конкретный resource"}</>,
            ],
            [
              <>{"permissions matrix"}</>,
              <>{"роль × действие × ресурс"}</>,
            ],
            [
              <>{"API contract"}</>,
              <>{"внешнее обещание до реализации"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"минимальная ER-модель"}
          code={"User\n├── owns → Course\n│   └── Module\n│       └── Lesson\n└── Enrollment → Course\n    └── LessonCompletion → Lesson\n\nconstraints:\n- unique enrollment(student_id, course_id)\n- unique completion(enrollment_id, lesson_id)\n- position >= 1"}
        />

        <MatchPairs
          prompt={"Соедините сущность с правилом, которое она должна защищать."}
          leftTitle={"Сущность"}
          rightTitle={"Инвариант"}
          pairs={[
            {
              left: "Course",
              right: "имеет owner-teacher и publication state",
            },
            {
              left: "Module",
              right: "принадлежит одному course и имеет position",
            },
            {
              left: "Lesson",
              right: "принадлежит одному module и имеет position",
            },
            {
              left: "Enrollment",
              right: "один student не записывается на course дважды",
            },
            {
              left: "LessonCompletion",
              right: "один lesson не завершается повторно в том же enrollment",
            },
            {
              left: "Permissions matrix",
              right: "до реализации фиксирует разрешённые и запрещённые действия",
            },
          ]}
          explanation={"Сущность нужна не только для хранения полей: она задаёт устойчивое правило домена."}
        />

        <TypeCards>
          <TypeCard
            badge={"product"}
            title={"User story"}
            code={"teacher publishes course"}
          >
            {"Называет роль, действие и ценность до выбора endpoint."}
          </TypeCard>
          <TypeCard
            badge={"data"}
            badgeTone={"float"}
            title={"ER-diagram"}
            code={"entities + keys + relations"}
          >
            {"Показывает, где хранится факт и какие связи обязаны существовать."}
          </TypeCard>
          <TypeCard
            badge={"access"}
            badgeTone={"str"}
            title={"Permissions matrix"}
            code={"role × action × resource"}
          >
            {"Предотвращает случайные решения о правах внутри каждого endpoint."}
          </TypeCard>
          <TypeCard
            badge={"delivery"}
            title={"Migration plan"}
            code={"revision 1 → revision 2"}
          >
            {"Разбивает изменение schema на проверяемые шаги."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Сначала написать user stories"}</h3>
          <p>
            {"Сократить пожелания до одного обязательного teacher/student flow."}
          </p>

          <h3>{"Нарисовать связи"}</h3>
          <p>
            {"Проверить cardinality и место foreign keys без кода."}
          </p>

          <h3>{"Назвать constraints"}</h3>
          <p>
            {"Определить уникальность и допустимые состояния."}
          </p>

          <h3>{"Составить contract table"}</h3>
          <p>
            {"Для каждого endpoint записать role, input, output и expected errors."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Проектирование считается завершённым, когда есть решения, которые можно проверить: таблицы, ограничения, endpoints, permissions и sequence migrations."}
        </Callout>

        <Callout tone={"warn"}>
          {"Статус progress не стоит хранить произвольным процентом, если его можно надёжно вычислить из фактов завершения lesson."}
        </Callout>

      </Section>

      <Section number={"03"} title={"Блок 34 · Курсы, зачисление и прогресс"}>
        <Lead>
          {"После утверждённого contract реализация идёт вертикальными slices. Сначала teacher создаёт и структурирует course, затем публикует его. После этого student видит каталог, создаёт enrollment, завершает lesson и получает progress."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"195 · Course:"}</strong>
              {" create/read/update с ownership и teacher role."}
            </li>
            <li>
              <strong>{"196 · Structure:"}</strong>
              {" modules, lessons, positions и безопасное изменение порядка."}
            </li>
            <li>
              <strong>{"197 · Publication:"}</strong>
              {" draft/published и проверка готовности course."}
            </li>
            <li>
              <strong>{"198 · Enrollment:"}</strong>
              {" идемпотентная запись student и защита от duplicate."}
            </li>
            <li>
              <strong>{"199 · Completion:"}</strong>
              {" доступ только через active enrollment и unique completion."}
            </li>
            <li>
              <strong>{"200 · Progress:"}</strong>
              {" вычисление процента и integration tests всего flow."}
            </li>
          </ol>
          <p>
            {"Блок заканчивается демонстрацией: teacher публикует course, student записывается, завершает lessons и получает согласованный progress response."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"vertical slice"}</>,
              <>{"endpoint, service, query, response и test одного сценария"}</>,
            ],
            [
              <>{"draft"}</>,
              <>{"course ещё не доступен обычному student"}</>,
            ],
            [
              <>{"published"}</>,
              <>{"course прошёл правила готовности и виден в каталоге"}</>,
            ],
            [
              <>{"idempotency"}</>,
              <>{"повтор действия не создаёт нежелательный duplicate"}</>,
            ],
            [
              <>{"completion"}</>,
              <>{"отдельный факт завершения lesson"}</>,
            ],
            [
              <>{"progress"}</>,
              <>{"completed published lessons / all published lessons"}</>,
            ],
            [
              <>{"object permission"}</>,
              <>{"проверка доступа к конкретному course"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"основной LMS-flow"}
          code={"teacher POST /courses\n→ POST /courses/{course_id}/modules\n→ POST /modules/{module_id}/lessons\n→ POST /courses/{course_id}/publish\n\nstudent GET /catalog\n→ POST /courses/{course_id}/enrollments\n→ POST /lessons/{lesson_id}/complete\n→ GET /me/courses/{course_id}/progress"}
        />

        <BranchExplorer
          code={"create course\nadd modules\nadd lessons\npublish\nenroll\ncomplete lesson\ncalculate progress"}
          scenarios={[
            {
              label: "teacher owns draft",
              activeLine: 1,
              output: "может менять структуру course",
            },
            {
              label: "teacher публикует пустой course",
              activeLine: 3,
              output: "409: course не готов к публикации",
            },
            {
              label: "student enrolls twice",
              activeLine: 4,
              output: "возвращается существующий enrollment или согласованный 409",
            },
            {
              label: "student completes foreign lesson",
              activeLine: 5,
              output: "403/404 по принятому security contract",
            },
            {
              label: "valid flow",
              activeLine: 6,
              output: "progress вычисляется из completion rows",
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"teacher"}
            title={"Content management"}
            code={"owner_id == current_user.id"}
          >
            {"Teacher изменяет только собственный course."}
          </TypeCard>
          <TypeCard
            badge={"student"}
            badgeTone={"float"}
            title={"Enrollment"}
            code={"unique(student_id, course_id)"}
          >
            {"Связь создаётся один раз и открывает доступ к прохождению."}
          </TypeCard>
          <TypeCard
            badge={"state"}
            badgeTone={"str"}
            title={"Publication"}
            code={"draft → published"}
          >
            {"Переход выполняется только после проверки готовности структуры."}
          </TypeCard>
          <TypeCard
            badge={"metric"}
            title={"Progress"}
            code={"completed / total * 100"}
          >
            {"Вычисляется из фактов, а не редактируется клиентом."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Реализовать course slice"}</h3>
          <p>
            {"Модель, migration, schema, endpoint, service и tests."}
          </p>

          <h3>{"Добавить structure slice"}</h3>
          <p>
            {"Проверить positions, ownership и ordering."}
          </p>

          <h3>{"Закрыть student flow"}</h3>
          <p>
            {"Enrollment, completion и progress как связанный сценарий."}
          </p>

          <h3>{"Проверить отрицательные пути"}</h3>
          <p>
            {"Чужой course, draft catalog, duplicate enrollment и foreign lesson."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Вертикальный slice уменьшает незавершённость: после каждого шага существует работающая возможность, которую можно показать и протестировать."}
        </Callout>

        <Callout tone={"warn"}>
          {"Нельзя доверять student_id, owner_id или progress из request body. Identity берётся из authentication context, а вычисляемые значения формирует сервер."}
        </Callout>

      </Section>

      <Section number={"04"} title={"Блок 35 · Redis, кеш и фоновые операции"}>
        <Lead>
          {"Redis появляется только после рабочего LMS-flow. Ученик измеряет повторный каталог, формулирует cache key и TTL, сохраняет PostgreSQL как source of truth, реализует invalidation после изменения course и добавляет один небольшой rate limit и одну безопасную background operation."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"201 · Redis model:"}</strong>
              {" key/value, TTL, cache hit/miss и source of truth."}
            </li>
            <li>
              <strong>{"202 · Catalog cache:"}</strong>
              {" key design, serialization и fallback в PostgreSQL."}
            </li>
            <li>
              <strong>{"203 · Invalidation:"}</strong>
              {" изменение course удаляет или обновляет связанные cache keys."}
            </li>
            <li>
              <strong>{"204 · Rate limit:"}</strong>
              {" простое ограничение частоты для чувствительного endpoint."}
            </li>
            <li>
              <strong>{"205 · BackgroundTasks:"}</strong>
              {" короткое действие после response без критической транзакции."}
            </li>
            <li>
              <strong>{"206 · Integration:"}</strong>
              {" Compose Redis, tests, metrics и failure behavior."}
            </li>
          </ol>
          <p>
            {"Блок заканчивается одним измеримым cache и одной контролируемой фоновой операцией. Потеря Redis ухудшает скорость или отключает необязательную возможность, но не уничтожает постоянные данные LMS."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"source of truth"}</>,
              <>{"авторитетное состояние в PostgreSQL"}</>,
            ],
            [
              <>{"cache hit"}</>,
              <>{"ответ найден в Redis"}</>,
            ],
            [
              <>{"cache miss"}</>,
              <>{"данные читаются из PostgreSQL и помещаются в cache"}</>,
            ],
            [
              <>{"TTL"}</>,
              <>{"автоматический срок жизни временного значения"}</>,
            ],
            [
              <>{"invalidation"}</>,
              <>{"удаление устаревшего cache после write"}</>,
            ],
            [
              <>{"rate limit"}</>,
              <>{"контролируемое число запросов за окно"}</>,
            ],
            [
              <>{"background task"}</>,
              <>{"небольшая работа после отправки response"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"cache-aside flow"}
          code={"GET /catalog\n→ redis.get(\"catalog:v1\")\n├── hit  → deserialize → response\n└── miss → SELECT published courses\n         → serialize\n         → redis.setex(key, ttl, value)\n         → response\n\nUPDATE course\n→ PostgreSQL commit\n→ redis.delete(\"catalog:v1\")"}
        />

        <StepThrough
          code={"cached = redis.get(key)\nif cached:\n    return decode(cached)\ndata = load_catalog(db)\nredis.setex(key, ttl, encode(data))\nreturn data"}
          steps={[
            {
              line: 0,
              note: "Сначала проверяется временная копия.",
              vars: {
                "key": "catalog:v1",
              },
            },
            {
              line: 1,
              note: "При cache hit database query не выполняется.",
              vars: {
                "source": "Redis",
              },
            },
            {
              line: 3,
              note: "При miss авторитетные данные читаются из PostgreSQL.",
              vars: {
                "source": "PostgreSQL",
              },
            },
            {
              line: 4,
              note: "Сериализованная копия получает TTL.",
              vars: {
                "ttl": "60 seconds",
              },
            },
            {
              line: 5,
              note: "Клиент получает одинаковый response contract.",
              vars: {
                "contract": "stable",
              },
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"truth"}
            title={"PostgreSQL"}
            code={"authoritative state"}
          >
            {"Хранит courses, enrollments и completions независимо от cache."}
          </TypeCard>
          <TypeCard
            badge={"speed"}
            badgeTone={"float"}
            title={"Redis cache"}
            code={"key + value + TTL"}
          >
            {"Сокращает повторные чтения согласованного представления."}
          </TypeCard>
          <TypeCard
            badge={"freshness"}
            badgeTone={"str"}
            title={"Invalidation"}
            code={"write → delete cache key"}
          >
            {"Не позволяет долго отдавать устаревший catalog."}
          </TypeCard>
          <TypeCard
            badge={"delay"}
            title={"BackgroundTasks"}
            code={"response → non-critical work"}
          >
            {"Подходит для короткой необязательной операции, а не для гарантированной очереди."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Измерить baseline"}</h3>
          <p>
            {"Зафиксировать query count и latency до cache."}
          </p>

          <h3>{"Сделать hit/miss test"}</h3>
          <p>
            {"Проверить одинаковый response и различный источник данных."}
          </p>

          <h3>{"Сломать Redis"}</h3>
          <p>
            {"Убедиться, что catalog может деградировать к PostgreSQL по принятому contract."}
          </p>

          <h3>{"Проверить stale data"}</h3>
          <p>
            {"Изменить course и доказать, что invalidation обновляет следующий response."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Кеш является копией представления. Он полезен только при понятном key, TTL, invalidation и измеримом эффекте."}
        </Callout>

        <Callout tone={"warn"}>
          {"BackgroundTasks не гарантирует выполнение после аварийного завершения process. Критические платежи, migrations и обязательные письма требуют более устойчивой очереди."}
        </Callout>

      </Section>

      <Section number={"05"} title={"Блок 36 · Финальное качество, портфолио и интервью"}>
        <Lead>
          {"Последний блок не добавляет новый framework. Ученик превращает технически работающий проект в проверяемый release: выравнивает error contract, проводит security и query audit, усиливает tests, восстанавливает database с нуля, оформляет README и diagrams, репетирует demo и защищает решения в формате интервью."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"207 · API audit:"}</strong>
              {" routes, statuses, schemas, errors и backward compatibility."}
            </li>
            <li>
              <strong>{"208 · Security audit:"}</strong>
              {" auth, permissions, secrets, uploads, rate limit и sensitive logs."}
            </li>
            <li>
              <strong>{"209 · Performance audit:"}</strong>
              {" N+1, query count, indexes, cache metrics и pool usage."}
            </li>
            <li>
              <strong>{"210 · Test release:"}</strong>
              {" unit/integration/security tests, clean migrations и CI."}
            </li>
            <li>
              <strong>{"211 · Portfolio:"}</strong>
              {" README, architecture, ER-diagram, quick start, demo data и release notes."}
            </li>
            <li>
              <strong>{"212 · Defense:"}</strong>
              {" mock interview, live debugging, SQL task, code review и project presentation."}
            </li>
          </ol>
          <p>
            {"Финальная версия считается готовой, когда проект разворачивается по README, проходит tests и migrations, демонстрирует основной flow и выдерживает вопросы о границах решений."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"API contract"}</>,
              <>{"одинаковая форма success и error responses"}</>,
            ],
            [
              <>{"security checklist"}</>,
              <>{"контроль identities, permissions, secrets и input"}</>,
            ],
            [
              <>{"query audit"}</>,
              <>{"N+1, indexes, counts и cache behavior"}</>,
            ],
            [
              <>{"release test"}</>,
              <>{"чистая database, migrations, seed и integration flow"}</>,
            ],
            [
              <>{"portfolio README"}</>,
              <>{"проблема, архитектура, запуск, demo и limitations"}</>,
            ],
            [
              <>{"mock interview"}</>,
              <>{"объяснение и изменение кода под вопросами"}</>,
            ],
            [
              <>{"project defense"}</>,
              <>{"короткий доказательный рассказ с live-сценарием"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"release evidence chain"}
          code={"git clone\n→ copy .env.example\n→ docker compose up --build\n→ alembic upgrade head\n→ seed demo data\n→ pytest\n→ open API docs\n→ teacher creates and publishes course\n→ student enrolls and completes lesson\n→ progress updated\n→ inspect logs and cache metrics\n→ show release tag"}
        />

        <FlipCards
          cards={[
            {
              front: <>{"README"}</>,
              back: <>{"доказывает воспроизводимый запуск и объясняет ценность проекта"}</>,
            },
            {
              front: <>{"ER-diagram"}</>,
              back: <>{"показывает данные, keys, cardinality и association entities"}</>,
            },
            {
              front: <>{"CI run"}</>,
              back: <>{"доказывает независимую проверку commit"}</>,
            },
            {
              front: <>{"test suite"}</>,
              back: <>{"защищает success, failure и security scenarios"}</>,
            },
            {
              front: <>{"release tag"}</>,
              back: <>{"фиксирует конкретную демонстрируемую версию"}</>,
            },
            {
              front: <>{"demo script"}</>,
              back: <>{"показывает главный flow без случайной импровизации"}</>,
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"quality"}
            title={"Audit"}
            code={"evidence before opinion"}
          >
            {"Каждое замечание связано с тестом, query plan, log или воспроизводимым сценарием."}
          </TypeCard>
          <TypeCard
            badge={"story"}
            badgeTone={"float"}
            title={"Portfolio narrative"}
            code={"problem → decision → result"}
          >
            {"Объясняет эволюцию StudyHub, а не перечисляет библиотеки."}
          </TypeCard>
          <TypeCard
            badge={"interview"}
            badgeTone={"str"}
            title={"Technical defense"}
            code={"explain + debug + change"}
          >
            {"Проверяет способность работать с кодом под уточняющими вопросами."}
          </TypeCard>
          <TypeCard
            badge={"release"}
            title={"Known version"}
            code={"git tag + image tag"}
          >
            {"Связывает документацию, demo и running artifact с одной версией."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Провести аудит по checklist"}</h3>
          <p>
            {"Не исправлять всё сразу: создать приоритетный список рисков."}
          </p>

          <h3>{"Восстановить чистый environment"}</h3>
          <p>
            {"Проверить README, migrations, seed и tests с нуля."}
          </p>

          <h3>{"Записать трёхминутный demo"}</h3>
          <p>
            {"Убрать лишние действия и оставить доказательства основного flow."}
          </p>

          <h3>{"Пройти mock interview"}</h3>
          <p>
            {"Объяснить architecture, исправить defect, написать SQL и тест."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Портфолио становится сильным, когда видно инженерное мышление: проблема, варианты, принятое решение, компромисс и проверка."}
        </Callout>

        <Callout tone={"warn"}>
          {"Фраза «всё готово» без clean bootstrap, отрицательных тестов и согласованного release artifact не является техническим доказательством."}
        </Callout>

      </Section>

      <Section number={"06"} title={"Артефакты этапа и состояние репозитория"}>
        <Lead>
          {"Финальный этап должен оставить не только новые endpoints. В репозитории появляются product brief, ER-diagram, permissions matrix, contract table, Redis policy, test evidence, demo seed, architecture overview и release checklist."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"После блока 33:"}</strong>
              {" product brief, ER-diagram, permissions matrix и endpoint contract."}
            </li>
            <li>
              <strong>{"После блока 34:"}</strong>
              {" migrations, LMS models, vertical flows и integration tests."}
            </li>
            <li>
              <strong>{"После блока 35:"}</strong>
              {" Redis config, cache policy, invalidation tests и background operation."}
            </li>
            <li>
              <strong>{"После блока 36:"}</strong>
              {" audit report, diagrams, demo seed, release notes и interview lab."}
            </li>
            <li>
              <strong>{"В README:"}</strong>
              {" value proposition, architecture, quick start, demo flow, limitations и roadmap."}
            </li>
            <li>
              <strong>{"В Git history:"}</strong>
              {" небольшие reviewable commits и финальный release tag."}
            </li>
          </ol>
          <p>
            {"Artifact готов, когда его назначение понятно без разговора с автором и его можно проверить командой, тестом, diagram или live-сценарием."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"PRODUCT.md"}</>,
              <>{"MVP, roles и user stories"}</>,
            ],
            [
              <>{"ERD.md"}</>,
              <>{"entities, keys, relations и constraints"}</>,
            ],
            [
              <>{"PERMISSIONS.md"}</>,
              <>{"role/object access contract"}</>,
            ],
            [
              <>{"CACHE.md"}</>,
              <>{"keys, TTL, invalidation и fallback"}</>,
            ],
            [
              <>{"ARCHITECTURE.md"}</>,
              <>{"request flow и boundaries"}</>,
            ],
            [
              <>{"DEMO.md"}</>,
              <>{"воспроизводимый сценарий показа"}</>,
            ],
            [
              <>{"RELEASE.md"}</>,
              <>{"known version, checks и limitations"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"дерево финального результата"}
          code={"studyhub/\n├── app/\n│   ├── api/\n│   ├── models/\n│   ├── schemas/\n│   ├── services/\n│   └── core/\n├── tests/\n├── alembic/\n├── docs/\n│   ├── PRODUCT.md\n│   ├── ERD.md\n│   ├── PERMISSIONS.md\n│   ├── CACHE.md\n│   └── ARCHITECTURE.md\n├── scripts/seed_demo.py\n├── compose.yaml\n├── README.md\n├── DEMO.md\n└── RELEASE.md"}
        />

        <CompareSolutions
          question={"Какой репозиторий легче оценить работодателю или наставнику?"}
          left={{
            title: "Код без контекста",
            code: "app/ + many endpoints",
            note: "Непонятны домен, запуск, права, ограничения и доказательства качества.",
          }}
          right={{
            title: "Проверяемый release",
            code: "code + tests + diagrams + demo + tag",
            note: "Можно воспроизвести запуск, увидеть решения и проверить главный flow.",
          }}
          preferred={"right"}
          explanation={"Документация не украшает проект, а снижает стоимость его понимания и проверки."}
        />

        <TypeCards>
          <TypeCard
            badge={"product"}
            title={"Product evidence"}
            code={"stories + MVP"}
          >
            {"Объясняет, какую проблему решает LMS и для кого."}
          </TypeCard>
          <TypeCard
            badge={"architecture"}
            badgeTone={"float"}
            title={"Technical evidence"}
            code={"ERD + request flow"}
          >
            {"Показывает границы и направление данных."}
          </TypeCard>
          <TypeCard
            badge={"quality"}
            badgeTone={"str"}
            title={"Verification evidence"}
            code={"tests + CI + audit"}
          >
            {"Доказывает, что важные договорённости воспроизводимы."}
          </TypeCard>
          <TypeCard
            badge={"delivery"}
            title={"Release evidence"}
            code={"tag + demo + limitations"}
          >
            {"Фиксирует конкретную версию и честные границы."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Проверить каждую ссылку"}</h3>
          <p>
            {"README и docs не должны вести к устаревшим paths или командам."}
          </p>

          <h3>{"Сопоставить diagram с migrations"}</h3>
          <p>
            {"Название таблиц и relations совпадает с реальной schema."}
          </p>

          <h3>{"Сопоставить demo с tests"}</h3>
          <p>
            {"Главный demo-flow защищён integration test."}
          </p>

          <h3>{"Сопоставить release с Git"}</h3>
          <p>
            {"Tag, image и release notes относятся к одному commit."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Сильный artifact отвечает на конкретный вопрос: что строим, как устроено, как запустить, как проверить и где ограничения."}
        </Callout>

        <Callout tone={"warn"}>
          {"Автоматически сгенерированная документация не заменяет объяснение предметной модели и принятых инженерных решений."}
        </Callout>

      </Section>

      <Section number={"07"} title={"Ритм обучения и критерии перехода"}>
        <Lead>
          {"Финальный этап сочетает проектирование, реализацию, эксплуатацию и защиту. Чтобы не потерять качество, ученик проходит каждый блок по циклу: contract, implementation, negative tests, integration, documentation и review."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"День 1:"}</strong>
              {" прочитать модель и выписать незнакомые термины."}
            </li>
            <li>
              <strong>{"День 2:"}</strong>
              {" собрать минимальный отдельный пример или diagram."}
            </li>
            <li>
              <strong>{"День 3:"}</strong>
              {" встроить vertical slice или infrastructure change в StudyHub."}
            </li>
            <li>
              <strong>{"День 4:"}</strong>
              {" намеренно пройти forbidden, duplicate, stale или failure scenario."}
            </li>
            <li>
              <strong>{"День 5:"}</strong>
              {" добавить test, обновить docs и сделать reviewable commit."}
            </li>
            <li>
              <strong>{"Перед новым блоком:"}</strong>
              {" провести короткую защиту текущего artifact без подсказки."}
            </li>
          </ol>
          <p>
            {"Скорость прохождения не важнее доказательства. При провале контрольной точки ученик исправляет текущий блок, а не маскирует пробел следующей технологией."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"понимание"}</>,
              <>{"объяснить модель без чтения конспекта"}</>,
            ],
            [
              <>{"реализация"}</>,
              <>{"запустить happy path на clean data"}</>,
            ],
            [
              <>{"диагностика"}</>,
              <>{"объяснить один failure path"}</>,
            ],
            [
              <>{"security"}</>,
              <>{"проверить forbidden access"}</>,
            ],
            [
              <>{"tests"}</>,
              <>{"автоматизировать важную договорённость"}</>,
            ],
            [
              <>{"documentation"}</>,
              <>{"обновить diagram или contract"}</>,
            ],
            [
              <>{"Git"}</>,
              <>{"сделать узкий осмысленный commit"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"цикл одного проектного изменения"}
          code={"requirement\n→ contract\n→ model/migration\n→ endpoint/service\n→ happy-path test\n→ forbidden/error test\n→ docs\n→ review\n→ commit\n→ short defense"}
        />

        <TrueFalse
          statement={
            <>
              {"На финальном этапе можно пропускать отрицательные тесты, потому что проект уже большой и happy path работает."}
            </>
          }
          isTrue={false}
          explanation={"Чем больше ролей и связей, тем важнее проверки чужого resource, duplicate actions, stale cache и migration failures."}
        />

        <TypeCards>
          <TypeCard
            badge={"model"}
            title={"Понять"}
            code={"explain contract"}
          >
            {"Назвать вход, правило, результат и границу."}
          </TypeCard>
          <TypeCard
            badge={"build"}
            badgeTone={"float"}
            title={"Реализовать"}
            code={"vertical slice"}
          >
            {"Довести один пользовательский сценарий до рабочего response."}
          </TypeCard>
          <TypeCard
            badge={"break"}
            badgeTone={"str"}
            title={"Нарушить"}
            code={"forbidden / duplicate / stale"}
          >
            {"Найти ожидаемую реакцию системы до случайного production-сбоя."}
          </TypeCard>
          <TypeCard
            badge={"prove"}
            title={"Доказать"}
            code={"test + docs + demo"}
          >
            {"Оставить воспроизводимое подтверждение результата."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Перед coding назвать Definition of Done"}</h3>
          <p>
            {"Указать endpoint, migration, tests и docs."}
          </p>

          <h3>{"После coding провести self-review"}</h3>
          <p>
            {"Удалить debug output, проверить naming и boundaries."}
          </p>

          <h3>{"Перед merge запустить clean scenario"}</h3>
          <p>
            {"Не полагаться на состояние старой локальной database."}
          </p>

          <h3>{"После merge обновить demo state"}</h3>
          <p>
            {"Проверить, что seed и документация соответствуют новой версии."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Последний этап учит завершать работу. Незакрытый edge case или устаревшая migration важнее ещё одного дополнительного endpoint."}
        </Callout>

        <Callout tone={"warn"}>
          {"Большой финальный commit затрудняет review и скрывает источник дефекта. Продолжайте делать небольшие связанные изменения."}
        </Callout>

      </Section>

      <Section number={"08"} title={"Контрольная точка и финальная защита курса"}>
        <Lead>
          {"Этап завершён не тогда, когда написана последняя строка, а когда ученик способен воспроизвести release, показать главный LMS-flow, объяснить данные и права, диагностировать ошибку и защитить компромиссы проекта."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Развернуть:"}</strong>
              {" поднять clean environment по README и применить migrations."}
            </li>
            <li>
              <strong>{"Показать:"}</strong>
              {" teacher создаёт course, student enrolls, completes lesson и видит progress."}
            </li>
            <li>
              <strong>{"Защитить access:"}</strong>
              {" продемонстрировать forbidden action для чужого course."}
            </li>
            <li>
              <strong>{"Показать эксплуатацию:"}</strong>
              {" cache hit/miss, invalidation, logs и health."}
            </li>
            <li>
              <strong>{"Проверить качество:"}</strong>
              {" запустить test suite и показать зелёный CI release commit."}
            </li>
            <li>
              <strong>{"Объяснить решения:"}</strong>
              {" ER model, vertical slices, PostgreSQL/Redis boundary и известные limitations."}
            </li>
          </ol>
          <p>
            {"После защиты ученик имеет законченный StudyHub LMS Release и основу для уверенного разговора о backend-разработке на стажировке или junior-интервью."}
          </p>
        </div>

        <MethodGrid
          rows={[
            [
              <>{"clean bootstrap"}</>,
              <>{"clone → config → migrations → seed → start"}</>,
            ],
            [
              <>{"business demo"}</>,
              <>{"teacher/student flow работает полностью"}</>,
            ],
            [
              <>{"security proof"}</>,
              <>{"чужой resource защищён"}</>,
            ],
            [
              <>{"cache proof"}</>,
              <>{"hit, miss и invalidation наблюдаемы"}</>,
            ],
            [
              <>{"quality proof"}</>,
              <>{"tests и CI относятся к release commit"}</>,
            ],
            [
              <>{"architecture defense"}</>,
              <>{"решения объясняются через требования"}</>,
            ],
            [
              <>{"honest limits"}</>,
              <>{"названы темы, намеренно не реализованные в MVP"}</>,
            ],
          ]}
        />

        <CodeBlock
          caption={"финальный маршрут защиты"}
          code={"1. problem and users\n2. architecture and ERD\n3. clean start\n4. teacher flow\n5. student flow\n6. forbidden scenario\n7. cache and logs\n8. tests and CI\n9. trade-offs and limitations\n10. next steps"}
        />

        <TerminalDemo
          title={"финальная воспроизводимая проверка"}
          lines={[
            {
              cmd: "docker compose up --build -d",
            },
            {
              out: "api, postgres and redis are healthy",
            },
            {
              cmd: "docker compose run --rm migrate alembic upgrade head",
            },
            {
              out: "migration completed",
            },
            {
              cmd: "docker compose exec api python scripts/seed_demo.py",
            },
            {
              out: "teacher, student and demo course created",
            },
            {
              cmd: "docker compose exec api pytest",
            },
            {
              out: "all tests passed",
            },
            {
              cmd: "curl http://localhost:8000/health",
            },
            {
              out: "{\"status\":\"ok\"}",
            },
          ]}
        />

        <TypeCards>
          <TypeCard
            badge={"1"}
            title={"Reproducibility"}
            code={"clean bootstrap"}
          >
            {"Проект не зависит от скрытого состояния компьютера автора."}
          </TypeCard>
          <TypeCard
            badge={"2"}
            badgeTone={"float"}
            title={"Business completeness"}
            code={"teacher + student flow"}
          >
            {"Показана связная предметная логика, а не набор endpoints."}
          </TypeCard>
          <TypeCard
            badge={"3"}
            badgeTone={"str"}
            title={"Engineering quality"}
            code={"tests + CI + audit"}
          >
            {"Ключевые договорённости имеют автоматические доказательства."}
          </TypeCard>
          <TypeCard
            badge={"4"}
            title={"Communication"}
            code={"defense + limitations"}
          >
            {"Автор способен объяснить решение и честно назвать границы."}
          </TypeCard>
        </TypeCards>

        <div className="lesson-practice-steps">
          <h3>{"Подготовить 10-минутный сценарий"}</h3>
          <p>
            {"Убрать случайные действия и показать только load-bearing evidence."}
          </p>

          <h3>{"Провести техническую репетицию"}</h3>
          <p>
            {"Заранее проверить ports, seed, accounts и cache state."}
          </p>

          <h3>{"Подготовить вопросы к себе"}</h3>
          <p>
            {"Почему association model, почему computed progress, почему Redis, почему не microservices."}
          </p>

          <h3>{"После защиты записать backlog"}</h3>
          <p>
            {"Отделить дефекты от необязательных future improvements."}
          </p>

        </div>

        <Callout tone={"info"}>
          {"Хорошая защита следует пути данных и пользователя. Она не превращается в чтение списка технологий."}
        </Callout>

        <Callout tone={"warn"}>
          {"Перед финальной демонстрацией нельзя добавлять крупную новую функцию. Последние изменения должны снижать риск, а не расширять scope."}
        </Callout>

        <div className="lesson-check-group">
          <QuizCard
            question={"Почему Redis появляется после рабочего LMS-flow?"}
            options={[
              "Сначала нужна измеримая проблема и source of truth",
              "Redis заменяет ER-diagram",
              "Без Redis невозможно создать Course",
            ]}
            correctIndex={0}
            explanation={"Кеш отвечает на проблему повторного чтения, а не определяет предметную модель."}
          />

          <QuizCard
            question={"Что означает vertical slice?"}
            options={[
              "Законченный пользовательский сценарий через все нужные слои",
              "Только новая ORM-модель",
              "Отдельный frontend-компонент",
            ]}
            correctIndex={0}
            explanation={"Slice включает contract, storage, business rule, response и tests конкретной возможности."}
          />

          <QuizCard
            question={"Какой progress надёжнее?"}
            options={[
              "Вычисляемый из completion facts",
              "Произвольное число из request body",
              "Значение в Redis без PostgreSQL",
            ]}
            correctIndex={0}
            explanation={"Факты прохождения дают воспроизводимый источник вычисления."}
          />

          <QuizCard
            question={"Что считается финальным доказательством готовности?"}
            options={[
              "Clean bootstrap, demo flow, tests, CI и защита решений",
              "Большое число endpoints",
              "Только красивый README",
            ]}
            correctIndex={0}
            explanation={"Финальный release должен быть воспроизводимым, проверяемым и объяснимым."}
          />

        </div>

        <KeyTakeaways
          points={[
            <>{"Этап 9 начинается с требований и доменной модели, а не с новой библиотеки."}</>,
            <>{"Course, Module, Lesson, Enrollment и Completion защищают разные факты."}</>,
            <>{"Permissions проектируются до реализации endpoints."}</>,
            <>{"Вертикальные slices дают законченные пользовательские сценарии."}</>,
            <>{"PostgreSQL остаётся source of truth, Redis хранит временные копии и служебное состояние."}</>,
            <>{"Cache требует key, TTL, invalidation и измерения."}</>,
            <>{"Финальный аудит проверяет API, security, queries, tests, migrations и documentation."}</>,
            <>{"Портфолио ценится за воспроизводимость и объяснённые решения, а не за список технологий."}</>,
          ]}
        />

        <PracticeCta
          text={"Создайте release-plan этапа 9: перечислите 24 занятия, четыре блоковых артефакта, основной teacher/student flow, обязательные forbidden scenarios, cache experiment, clean-bootstrap checklist, demo script и 12 вопросов для финальной защиты. Для каждого пункта укажите наблюдаемое доказательство готовности."}
        />

      </Section>

    </RichLesson>
  );
}

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

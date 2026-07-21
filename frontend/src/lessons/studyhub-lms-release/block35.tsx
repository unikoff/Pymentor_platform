import {
  Activity,
  Database,
  GitBranch,
  Mail,
  RefreshCcw,
  ShieldCheck,
  TestTube2,
  Timer,
  Workflow,
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  FillBlank,
  FlipCards,
  KeyTakeaways,
  Lead,
  MatchPairs,
  MethodGrid,
  PracticeCta,
  PredictOutput,
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

const BLOCK_TITLE = "Блок 35 · Redis, кеш и фоновые операции";

type TheoryBridgeData = { link: string; boundary: string };

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  201: {
    link: "В Compose Redis уже запущен и отвечает PONG, но приложение ещё не использует его. После готового LMS-каталога появилась первая реальная причина хранить временный результат рядом с API.",
    boundary:
      "Redis не становится второй основной базой StudyHub. Streams, pub/sub, persistence modes и устройство Redis server не входят: урок строит только модель key/value, TTL и безопасной деградации.",
  },
  202: {
    link: "Предыдущий урок дал временную модель Redis и безопасный fallback. Теперь эта модель применяется к конкретной проблеме: публичный каталог повторно выполняет одинаковый SQL и формирует одинаковый response.",
    boundary:
      "Кешируется только каталог с измеримым повторным чтением. Нельзя объявлять каждый endpoint кандидатом на кеш и нельзя хранить в Redis ORM-объекты или незавершённые transaction data.",
  },
  203: {
    link: "Cache-aside ускорил повторное чтение, но теперь Redis может продолжить отдавать старый каталог после изменения курса. Значит write-path должен сообщить кешу, что прежняя копия больше недействительна.",
    boundary:
      "Урок использует простую invalidation policy: известные keys или versioned namespace. Distributed events, tag-based invalidation и сложная согласованность нескольких сервисов не вводятся.",
  },
  204: {
    link: "Redis уже хранит временный кеш и generation. Rate limit показывает вторую оправданную задачу: общий счётчик между несколькими API processes, который должен автоматически исчезать после временного окна.",
    boundary:
      "Это учебный fixed-window limiter для одного endpoint. Global distributed algorithms, sliding window, Lua-оптимизация, защита от DDoS и инфраструктурный gateway не входят.",
  },
  205: {
    link: "Rate-limit endpoint уже защищает частый action. Теперь другой пользовательский сценарий — enrollment — получает дополнительную работу, которая полезна, но не должна задерживать основной HTTP response.",
    boundary:
      "BackgroundTasks не является durable queue. Долгие, критичные, повторяемые jobs и гарантированная доставка требуют отдельного worker/queue и остаются за рамками курса.",
  },
  206: {
    link: "Кеш, invalidation, rate limit и background action работают по отдельности. Финальный урок должен доказать их совместимость, наблюдаемость и предсказуемую деградацию без реальной внешней сети.",
    boundary:
      "Тесты не маскируют PostgreSQL failure кешем и не утверждают performance benefit по одному случайному числу. Production load testing и полноценный observability stack остаются отдельными задачами.",
  },
};

function TheoryBridge({ lesson }: { lesson: number }) {
  const bridge = THEORY_BRIDGES[lesson];
  if (!bridge) return null;

  return (
    <Callout tone="info">
      <strong>Связь с курсом.</strong> {bridge.link}{" "}
      <strong>Важно не перепутать:</strong> {bridge.boundary}
    </Callout>
  );
}

// 201. Redis key/value, TTL и source of truth
export function Lesson201({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Redis key/value, TTL и source of truth"}
        intro={
          "Разделим постоянные продуктовые данные и временное ускоряющее состояние: подключимся к Redis, запишем key/value с TTL, проследим истечение срока и докажем, что PostgreSQL остаётся источником истины StudyHub."
        }
        tags={[
          { icon: <Database size={14} />, label: "PostgreSQL — истина" },
          { icon: <Timer size={14} />, label: "Redis и TTL" },
        ]}
      />
      <TheoryBridge lesson={201} />

      <Section number={"01"} title={"Две системы с разными обязанностями"}>
        <Lead>
          {
            "PostgreSQL хранит курсы, модули, уроки и зачисления как долговечные продуктовые факты. Redis хранит значения, которые можно потерять и восстановить из источника истины. Это различие важнее скорости и синтаксиса команд."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Назвать роли:"}</strong>{" "}
              {"отделить source of truth от временной копии"}
            </li>
            <li>
              <strong>{"Записать:"}</strong>{" "}
              {"создать key/value с ограниченным сроком жизни"}
            </li>
            <li>
              <strong>{"Наблюдать:"}</strong>{" "}
              {"проверить TTL и автоматическое исчезновение"}
            </li>
            <li>
              <strong>{"Сломать безопасно:"}</strong>{" "}
              {"остановить Redis и сохранить рабочий каталог через PostgreSQL"}
            </li>
          </ol>
          <p>
            {
              "Результат урока — небольшой Redis client и диагностический сценарий, который не меняет бизнес-контракт каталога."
            }
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "Проверка простая: если очистка Redis уничтожает единственную копию курса, Redis используется не как кеш, а как ошибочно выбранный источник истины."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Key, value и namespace"}>
        <Lead>
          {
            "Redis получает строковый key и связанное value. Имена ключей должны показывать домен, назначение и версию формата, чтобы разные функции приложения не перезаписывали друг друга."
          }
        </Lead>

        <TypeCards>
          <TypeCard
            badge={"key"}
            title={"Адрес временного значения"}
            code={`studyhub:course:42:summary:v1`}
          >
            {"Namespace отделяет проект, сущность, идентификатор и версию."}
          </TypeCard>
          <TypeCard
            badge={"value"}
            badgeTone={"float"}
            title={"Сериализованные данные"}
            code={`{"id":42,"title":"SQL"}`}
          >
            {
              "Redis получает bytes или строку, поэтому Python-объект сначала сериализуется."
            }
          </TypeCard>
          <TypeCard
            badge={"TTL"}
            badgeTone={"str"}
            title={"Срок жизни"}
            code={`EX 60`}
          >
            {
              "После истечения ключ удаляется и следующий read снова идёт в PostgreSQL."
            }
          </TypeCard>
        </TypeCards>

        <MatchPairs
          prompt={"Соедините часть ключа с её смыслом."}
          leftTitle={"Фрагмент"}
          rightTitle={"Смысл"}
          pairs={[
            { left: "studyhub", right: "namespace приложения" },
            { left: "course", right: "тип ресурса" },
            { left: "42", right: "идентификатор ресурса" },
            { left: "v1", right: "версия формата value" },
          ]}
          explanation={
            "Осмысленный key помогает находить, удалять и версионировать временные данные."
          }
        />
      </Section>

      <Section number={"03"} title={"Первый async Redis client"}>
        <Lead>
          {
            "Async StudyHub использует асинхронный клиент Redis. Соединение создаётся на lifespan приложения, а endpoint или service получает уже готовую dependency вместо открытия нового клиента на каждый вызов."
          }
        </Lead>

        <CodeBlock
          caption={"минимальная запись и чтение"}
          code={`from redis.asyncio import Redis
        
        redis = Redis.from_url(
            settings.redis_url,
            decode_responses=True,
        )
        
        await redis.set(
            "studyhub:diagnostic:greeting:v1",
            "hello",
            ex=30,
        )
        
        value = await redis.get(
            "studyhub:diagnostic:greeting:v1",
        )`}
        />

        <FillBlank
          prompt={"Завершите параметр, который задаёт срок жизни в секундах."}
          before={"await redis.set(key, value, "}
          after={")"}
          options={["ex=30", "ttl=True", 'timeout="30"']}
          answer={"ex=30"}
          explanation={
            "Параметр ex устанавливает expiration в секундах вместе с записью."
          }
        />
      </Section>

      <Section number={"04"} title={"TTL как временная шкала"}>
        <Lead>
          {
            "TTL не является временем создания. Это оставшееся количество секунд до автоматического удаления. При повторной записи без сохранения TTL срок может измениться, поэтому правило обновления ключа должно быть явным."
          }
        </Lead>

        <StepThrough
          code={`SET studyhub:course:42:summary:v1 value EX 5
        TTL studyhub:course:42:summary:v1
        GET studyhub:course:42:summary:v1
        ... проходит 5 секунд ...
        GET studyhub:course:42:summary:v1`}
          steps={[
            {
              line: 0,
              note: "Value записано сразу вместе с expiration.",
              vars: { TTL: "5 секунд" },
            },
            {
              line: 1,
              note: "Команда TTL показывает оставшееся время, а не исходное значение.",
              vars: { TTL: "4 или 5" },
            },
            {
              line: 2,
              note: "До истечения key даёт cache hit.",
              vars: { result: "value" },
            },
            {
              line: 3,
              note: "Redis удаляет key после expiration.",
              vars: { key: "отсутствует" },
            },
            {
              line: 4,
              note: "GET возвращает nil, что приложение трактует как cache miss.",
              vars: { result: "None" },
            },
          ]}
        />

        <TrueFalse
          statement={
            <>
              {
                "Если TTL истёк, соответствующий курс должен исчезнуть из PostgreSQL."
              }
            </>
          }
          isTrue={false}
          explanation={
            "TTL относится только к временной копии Redis. Основная запись курса остаётся в PostgreSQL."
          }
        />
      </Section>

      <Section number={"05"} title={"Serialization и граница формата"}>
        <Lead>
          {
            "Redis не знает Pydantic-модель CourseRead. Service превращает response data в JSON перед set и восстанавливает Python-структуру после get. Версия в key позволяет изменить формат без попытки читать старое value новым кодом."
          }
        </Lead>

        <CompareSolutions
          question={"Что безопаснее хранить для каталога?"}
          left={{
            title: "Живой ORM-объект",
            code: `await redis.set(key, course_model)`,
            note: "ORM object не является переносимым форматом и связан с session.",
          }}
          right={{
            title: "Готовый response JSON",
            code: `payload = CourseRead.model_validate(course).model_dump_json()
        await redis.set(key, payload, ex=60)`,
            note: "Формат явный, сериализуемый и не зависит от database session.",
          }}
          preferred={"right"}
          explanation={
            "Кеш должен хранить стабильный сериализованный результат read-path, а не внутренний объект ORM."
          }
        />

        <Callout>
          {
            "Сериализация не делает данные истинными. Она только задаёт формат временной копии."
          }
        </Callout>
      </Section>

      <Section number={"06"} title={"Cache hit, miss и недоступный Redis"}>
        <Lead>
          {
            "GET может вернуть value, None или исключение соединения. Это три разных состояния: hit, miss и dependency failure. Для публичного каталога разумный fallback — прочитать PostgreSQL и записать warning, не превращая Redis в обязательную точку отказа."
          }
        </Lead>

        <BranchExplorer
          code={`cached = await redis.get(key)
        if cached is not None:
            return decode(cached)
        
        courses = await repository.list_published()
        try:
            await redis.set(key, encode(courses), ex=60)
        except RedisError:
            logger.warning("cache write failed")
        return courses`}
          scenarios={[
            {
              label: "cache hit",
              activeLine: 2,
              output: "ответ из Redis, SQL не выполняется",
            },
            {
              label: "cache miss",
              activeLine: 4,
              output: "чтение PostgreSQL и заполнение кеша",
            },
            {
              label: "Redis unavailable",
              activeLine: 8,
              output: "ответ из PostgreSQL + warning",
            },
          ]}
        />

        <Callout>
          {
            "Fallback выбирается по важности сценария. Для каталога fail-open допустим; для security-state такое решение могло бы быть опасным."
          }
        </Callout>
      </Section>

      <Section number={"07"} title={"Диагностический эксперимент в Compose"}>
        <Lead>
          {
            "Перед интеграцией в endpoint полезно подтвердить поведение Redis отдельными командами: PING, SET с EX, TTL, GET и очистка. После FLUSHDB каталог из PostgreSQL должен остаться доступным."
          }
        </Lead>

        <TerminalDemo
          title={"наблюдаем временное значение"}
          lines={[
            { cmd: `docker compose exec redis redis-cli PING` },
            { out: `PONG` },
            {
              cmd: `docker compose exec redis redis-cli SET studyhub:diagnostic:ttl:v1 ok EX 10`,
            },
            { out: `OK` },
            {
              cmd: `docker compose exec redis redis-cli TTL studyhub:diagnostic:ttl:v1`,
            },
            { out: `(integer) 8` },
            {
              cmd: `docker compose exec redis redis-cli GET studyhub:diagnostic:ttl:v1`,
            },
            { out: `ok` },
          ]}
        />

        <RecallCard
          question={"Как доказать, что PostgreSQL остаётся source of truth?"}
          hint={
            "Проверяйте не только успешную запись в Redis, но и потерю Redis data."
          }
          answer={
            <p>
              {
                "Удалить временные keys или остановить Redis, затем получить каталог через API и убедиться, что продуктовые данные восстановлены из PostgreSQL."
              }
            </p>
          }
        />
      </Section>

      <Section
        number={"08"}
        title={"Контрольная точка: временная модель Redis"}
      >
        <Lead>
          {
            "Проверьте не только знание команд, но и способность проследить путь данных, назвать source of truth, предсказать режим деградации и объяснить результат теста без чтения готового ответа."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что является source of truth для курсов?"}
            options={["PostgreSQL", "Redis", "HTTP client cache"]}
            correctIndex={0}
            explanation={"Курсы и их связи сохраняются в реляционной базе."}
          />
          <QuizCard
            question={"Что означает cache miss?"}
            options={[
              "Key отсутствует или истёк",
              "PostgreSQL удалён",
              "Redis всегда сломан",
            ]}
            correctIndex={0}
            explanation={
              "Miss является обычным read-сценарием и ведёт к чтению источника истины."
            }
          />
          <QuizCard
            question={"Зачем добавлять v1 в key?"}
            options={[
              "Версионировать формат value",
              "Ускорить сеть",
              "Заменить TTL",
            ]}
            correctIndex={0}
            explanation={
              "Новая версия формата может использовать новый namespace."
            }
          />
          <QuizCard
            question={
              "Что должен сделать каталог при допустимом Redis failure?"
            }
            options={[
              "Прочитать PostgreSQL и залогировать деградацию",
              "Удалить курсы",
              "Всегда вернуть 500",
            ]}
            correctIndex={0}
            explanation={
              "Временный кеш не должен делать публичный read-path недоступным."
            }
          />
        </div>

        <KeyTakeaways
          points={[
            <>
              {
                "PostgreSQL хранит продуктовые факты и остаётся source of truth."
              }
            </>,
            <>
              {"Redis key должен иметь осмысленный namespace и версию формата."}
            </>,
            <>{"Value сериализуется до записи и декодируется после чтения."}</>,
            <>
              {
                "TTL ограничивает жизнь временной копии и создаёт ожидаемый cache miss."
              }
            </>,
            <>{"Hit, miss и Redis failure являются разными состояниями."}</>,
            <>
              {
                "Публичный каталог может деградировать к PostgreSQL при ошибке Redis."
              }
            </>,
            <>{"Потеря Redis data не должна уничтожать данные LMS."}</>,
          ]}
        />

        <PracticeCta
          text={
            "Добавьте Redis client в lifespan, создайте диагностический key с TTL 30 секунд, проследите его исчезновение и задокументируйте сценарий: очистить Redis → получить тот же список курсов из PostgreSQL → увидеть warning без изменения HTTP response."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 202. Cache-aside для каталога курсов
export function Lesson202({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Cache-aside для каталога курсов"}
        intro={
          "Кешируем один повторяемый read-path по схеме cache-aside: сначала проверяем Redis, при miss читаем опубликованные курсы из PostgreSQL, сериализуем response, устанавливаем TTL и измеряем разницу первого и повторного запросов."
        }
        tags={[
          { icon: <RefreshCcw size={14} />, label: "cache-aside flow" },
          { icon: <Activity size={14} />, label: "измерение latency" },
        ]}
      />
      <TheoryBridge lesson={202} />

      <Section number={"01"} title={"Почему каталог является кандидатом"}>
        <Lead>
          {
            "Публичный список опубликованных курсов читается значительно чаще, чем меняется. У него стабильный response и нет персональных секретов. Это делает его понятным первым кандидатом, но решение подтверждается SQL logs и latency, а не предположением."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Измерить miss:"}</strong>{" "}
              {"зафиксировать SQL query и latency первого request"}
            </li>
            <li>
              <strong>{"Заполнить:"}</strong>{" "}
              {"сериализовать response и установить короткий TTL"}
            </li>
            <li>
              <strong>{"Измерить hit:"}</strong>{" "}
              {"повторить тот же request без SQL query"}
            </li>
            <li>
              <strong>{"Деградировать:"}</strong>{" "}
              {"проверить ответ при остановленном Redis"}
            </li>
          </ol>
          <p>
            {
              "Результат урока — один cache-aside service вокруг GET /courses с наблюдаемыми hit, miss и fallback."
            }
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "Кеширование без исходного измерения нельзя оценить: неизвестно, ускорило ли оно значимый сценарий и какую сложность добавило."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Алгоритм cache-aside"}>
        <Lead>
          {
            "Приложение само управляет кешем: формирует key, спрашивает Redis, при miss читает PostgreSQL, записывает value и возвращает данные. Redis не обращается к PostgreSQL самостоятельно."
          }
        </Lead>

        <StepThrough
          code={`key = build_catalog_key(filters)
        cached = await cache.get(key)
        if cached is not None:
            return decode(cached)
        
        courses = await repository.list_published(filters)
        response = [CourseRead.model_validate(item) for item in courses]
        await cache.set(key, encode(response), ttl=60)
        return response`}
          steps={[
            {
              line: 0,
              note: "Параметры request превращаются в детерминированный key.",
              vars: { key: "catalog:v1:page=1" },
            },
            {
              line: 1,
              note: "Redis проверяется до SQL query.",
              vars: { cached: "None или JSON" },
            },
            {
              line: 3,
              note: "При hit функция завершается сразу.",
              vars: { database: "не вызывается" },
            },
            {
              line: 5,
              note: "Miss приводит к чтению source of truth.",
              vars: { database: "PostgreSQL" },
            },
            {
              line: 7,
              note: "Кеш получает готовый response на ограниченное время.",
              vars: { TTL: "60" },
            },
            {
              line: 8,
              note: "Клиент получает одну и ту же форму при hit и miss.",
              vars: { contract: "CourseRead[]" },
            },
          ]}
        />
      </Section>

      <Section number={"03"} title={"Key обязан учитывать параметры"}>
        <Lead>
          {
            "Запросы page=1 и page=2, category=python и category=sql не могут разделять один key. Иначе Redis вернёт корректный JSON для другого request, что сложнее заметить, чем явную ошибку."
          }
        </Lead>

        <CodeBlock
          caption={"детерминированный cache key"}
          code={`def build_catalog_key(
            *,
            page: int,
            page_size: int,
            category: str | None,
        ) -> str:
            normalized_category = category or "all"
            return (
                "studyhub:catalog:v1:"
                f"page={page}:size={page_size}:"
                f"category={normalized_category}"
            )`}
        />

        <BugHunt
          code={`key = "studyhub:catalog:v1"
        
        # оба request используют один key
        GET /courses?page=1
        GET /courses?page=2`}
          question={"Какой дефект возникнет?"}
          options={[
            "Вторая страница может получить данные первой",
            "Redis удалит PostgreSQL",
            "FastAPI изменит URL",
          ]}
          correctIndex={0}
          explanation={
            "Key не отражает параметры, поэтому разные результаты конфликтуют."
          }
          fix={`key = build_catalog_key(
            page=page,
            page_size=page_size,
            category=category,
        )`}
        />
      </Section>

      <Section number={"04"} title={"Сериализуем response, а не внутренности"}>
        <Lead>
          {
            "Cache value должен совпадать с контрактом endpoint. Сначала ORM rows превращаются в CourseRead, затем список сериализуется. При hit декодируется тот же response shape, поэтому клиент не различает источник."
          }
        </Lead>

        <CompareSolutions
          question={"Какой слой должен формировать cache value?"}
          left={{
            title: "Repository",
            code: `return ORM objects and cache them`,
            note: "Repository смешивает SQLAlchemy session с транспортным форматом.",
          }}
          right={{
            title: "Catalog service",
            code: `rows -> CourseRead[] -> JSON -> Redis`,
            note: "Service знает read-path, response и cache policy.",
          }}
          preferred={"right"}
          explanation={
            "Repository отвечает за PostgreSQL query, а service координирует response и временный кеш."
          }
        />

        <TrueFalse
          statement={
            <>
              {
                "Cache hit может возвращать другую Pydantic-схему, потому что данные пришли не из PostgreSQL."
              }
            </>
          }
          isTrue={false}
          explanation={
            "HTTP-контракт не зависит от источника внутри приложения."
          }
        />
      </Section>

      <Section number={"05"} title={"Безопасный fallback при RedisError"}>
        <Lead>
          {
            "Ошибка GET не должна блокировать source of truth. Cache access изолируется узкой обработкой RedisError, после чего выполняется database read. Ошибка cache write также логируется, но готовый database response не теряется."
          }
        </Lead>

        <CodeBlock
          caption={"fallback без широкого except"}
          code={`async def get_catalog(...):
            key = build_catalog_key(...)
        
            try:
                cached = await redis.get(key)
            except RedisError:
                logger.warning("catalog cache read failed")
                cached = None
        
            if cached is not None:
                return decode_catalog(cached)
        
            response = await load_catalog_from_db(...)
        
            try:
                await redis.set(key, encode_catalog(response), ex=60)
            except RedisError:
                logger.warning("catalog cache write failed")
        
            return response`}
        />

        <Callout>
          {
            "Не перехватывайте Exception вокруг всего service: PostgreSQL error и ошибка сериализации не должны маскироваться как обычный cache miss."
          }
        </Callout>
      </Section>

      <Section number={"06"} title={"Измеряем hit и miss"}>
        <Lead>
          {
            "Для учебного измерения достаточно perf_counter, SQL logs и нескольких повторений. Первый request ожидаемо включает PostgreSQL и cache fill, второй с тем же key должен иметь cache hit и отсутствие SELECT в SQL log."
          }
        </Lead>

        <TerminalDemo
          title={"два одинаковых request"}
          lines={[
            {
              cmd: `curl -s -w "time=%{time_total}\n" "http://localhost:8000/courses?page=1" -o /dev/null`,
            },
            { out: `time=0.084` },
            {
              cmd: `curl -s -w "time=%{time_total}\n" "http://localhost:8000/courses?page=1" -o /dev/null`,
            },
            { out: `time=0.012` },
            { cmd: `docker compose logs api --since=30s | grep catalog_cache` },
            {
              out: `catalog_cache miss
        catalog_cache hit`,
            },
          ]}
        />

        <RecallCard
          question={
            "Какие два сигнала доказывают hit надёжнее одной быстрой цифры?"
          }
          hint={"Скорость одного request может колебаться."}
          answer={
            <p>
              {
                "Лог cache hit и отсутствие соответствующего SELECT в SQLAlchemy log. Latency зависит от среды и служит дополнительным измерением."
              }
            </p>
          }
        />
      </Section>

      <Section number={"07"} title={"Один read-path и ясная политика"}>
        <Lead>
          {
            "TTL, key builder, сериализация, fallback и метрика образуют cache policy. Их лучше держать рядом в CatalogService или небольшом CatalogCache, а не размазывать по endpoint, repository и middleware."
          }
        </Lead>

        <MethodGrid
          rows={[
            ["key builder", "учитывает version, page, size и filters"],
            ["cache read", "различает hit, miss и RedisError"],
            ["database read", "всегда остаётся источником ответа при miss"],
            ["cache write", "сохраняет сериализованный response с TTL"],
            ["observation", "логирует hit/miss и измеряет latency"],
          ]}
        />

        <Callout>
          {
            "Endpoint должен связывать dependency и service, а не содержать полный алгоритм cache-aside."
          }
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка: cache-aside каталога"}>
        <Lead>
          {
            "Проверьте не только знание команд, но и способность проследить путь данных, назвать source of truth, предсказать режим деградации и объяснить результат теста без чтения готового ответа."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Как начинается cache-aside read?"}
            options={[
              "С попытки GET по детерминированному key",
              "С DELETE PostgreSQL",
              "С background task",
            ]}
            correctIndex={0}
            explanation={"Cache проверяется до database query."}
          />
          <QuizCard
            question={"Что происходит при miss?"}
            options={[
              "PostgreSQL read → response serialization → cache set",
              "Возврат пустого списка",
              "Удаление TTL",
            ]}
            correctIndex={0}
            explanation={"Miss заполняет кеш из source of truth."}
          />
          <QuizCard
            question={"Почему page входит в key?"}
            options={[
              "Разные страницы имеют разные response",
              "Чтобы Redis работал асинхронно",
              "Чтобы заменить pagination",
            ]}
            correctIndex={0}
            explanation={
              "Key обязан однозначно описывать кешируемый результат."
            }
          />
          <QuizCard
            question={"Что подтверждает cache hit?"}
            options={[
              "Hit log и отсутствие SQL SELECT",
              "Только HTTP 200",
              "Наличие Docker container",
            ]}
            correctIndex={0}
            explanation={"HTTP status не показывает источник ответа."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>
              {"Cache-aside управляется приложением, а не Redis автоматически."}
            </>,
            <>
              {
                "Catalog key должен учитывать все параметры, влияющие на response."
              }
            </>,
            <>{"Cache value хранит сериализованный HTTP response shape."}</>,
            <>{"Miss читает PostgreSQL и заполняет Redis с TTL."}</>,
            <>
              {
                "RedisError не должен скрывать PostgreSQL или serialization errors."
              }
            </>,
            <>{"Hit подтверждается логом и отсутствием SQL query."}</>,
            <>{"Первым кешируется только один измеримый read-path."}</>,
          ]}
        />

        <PracticeCta
          text={
            "Реализуйте cache-aside для GET /courses с page, page_size и category в key. Зафиксируйте miss и hit в логах, сравните latency пяти одинаковых запросов, остановите Redis и докажите, что endpoint продолжает возвращать каталог из PostgreSQL."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 203. Cache invalidation после изменения курса
export function Lesson203({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Cache invalidation после изменения курса"}
        intro={
          "Решаем главную цену кеша — устаревшие данные. После успешных publish, update и delete удаляем затронутые catalog keys, соблюдаем порядок commit → invalidate и тестируем сценарий, в котором stale response больше не переживает изменение PostgreSQL."
        }
        tags={[
          { icon: <RefreshCcw size={14} />, label: "invalidation" },
          { icon: <GitBranch size={14} />, label: "commit → delete key" },
        ]}
      />
      <TheoryBridge lesson={203} />

      <Section
        number={"01"}
        title={"Stale data появляется после успешного ускорения"}
      >
        <Lead>
          {
            "Кеш не наблюдает PostgreSQL. Если teacher переименовал или опубликовал курс, старый JSON остаётся валидным для Redis до TTL, но уже неверным для продукта. Это состояние называется stale data."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Воспроизвести:"}</strong>{" "}
              {"заполнить кеш старым каталогом"}
            </li>
            <li>
              <strong>{"Изменить:"}</strong>{" "}
              {"успешно обновить course в PostgreSQL"}
            </li>
            <li>
              <strong>{"Инвалидировать:"}</strong>{" "}
              {"удалить keys только после commit"}
            </li>
            <li>
              <strong>{"Проверить:"}</strong>{" "}
              {"следующий GET должен стать miss и вернуть новое значение"}
            </li>
          </ol>
          <p>
            {
              "Результат урока — write-path, после которого старый каталог не остаётся незамеченным."
            }
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "TTL ограничивает максимальную длительность stale data, но не заменяет invalidation после известного изменения."
          }
        </Callout>
      </Section>

      <Section
        number={"02"}
        title={"Правильный порядок: commit, затем invalidation"}
      >
        <Lead>
          {
            "До commit изменение ещё может завершиться rollback. Если удалить cache key раньше, другой request заполнит кеш старыми database data, а текущая transaction затем может commit. Получится свежий по времени, но устаревший value."
          }
        </Lead>

        <CodeSequence
          title={"Соберите безопасный write-path"}
          prompt={
            "Расположите действия update course так, чтобы кеш отражал только подтверждённую transaction."
          }
          pieces={[
            { id: "load", code: "course = await repository.get(course_id)" },
            { id: "change", code: "course.title = payload.title" },
            { id: "commit", code: "await session.commit()" },
            { id: "refresh", code: "await session.refresh(course)" },
            { id: "invalidate", code: "await catalog_cache.invalidate()" },
            {
              id: "wrong",
              code: "await catalog_cache.invalidate()  # до commit",
              note: "создаёт окно гонки",
            },
          ]}
          correctOrder={["load", "change", "commit", "refresh", "invalidate"]}
          explanation={
            "Инвалидация выполняется только после подтверждения source of truth."
          }
        />
      </Section>

      <Section number={"03"} title={"Ошибка invalidation до commit"}>
        <Lead>
          {
            "Порядок легко перепутать, потому что delete key технически не зависит от database session. Но бизнес-смысл зависит: кеш становится недействительным только после успешного изменения основной записи."
          }
        </Lead>

        <BugHunt
          code={`await catalog_cache.invalidate()
        course.title = payload.title
        await session.commit()`}
          question={"Почему такой порядок опасен?"}
          options={[
            "Cache удалён до гарантии commit",
            "Redis запрещает DELETE",
            "Title нельзя менять",
          ]}
          correctIndex={0}
          explanation={
            "Transaction может откатиться или другой request может заполнить кеш между delete и commit."
          }
          fix={`course.title = payload.title
        await session.commit()
        await session.refresh(course)
        await catalog_cache.invalidate()`}
        />

        <Callout>
          {
            "Если invalidation после commit не удалась, database data уже изменены. Нужно логировать проблему и полагаться на короткий TTL либо повторный механизм, но нельзя откатывать успешный HTTP write только из-за временного кеша без явного контракта."
          }
        </Callout>
      </Section>

      <Section number={"04"} title={"Как удалить несколько вариантов каталога"}>
        <Lead>
          {
            "Каталог имеет keys для разных страниц и filters. Удалить один точный key недостаточно. Для учебного проекта подходят небольшой registry известных keys или versioned namespace, где смена версии делает старые entries недоступными."
          }
        </Lead>

        <TypeCards>
          <TypeCard
            badge={"known keys"}
            title={"Удалить зарегистрированные keys"}
            code={`await redis.delete(*keys)`}
          >
            {"Просто и прозрачно при небольшом конечном наборе вариантов."}
          </TypeCard>
          <TypeCard
            badge={"version"}
            badgeTone={"float"}
            title={"Поднять generation"}
            code={`catalog:version = 18`}
          >
            {
              "Новые reads формируют keys с новой generation, старые исчезают по TTL."
            }
          </TypeCard>
          <TypeCard
            badge={"SCAN"}
            badgeTone={"str"}
            title={"Осторожный поиск"}
            code={`SCAN studyhub:catalog:v1:*`}
          >
            {
              "Возможен для tooling, но не должен превращаться в KEYS на горячем production-path."
            }
          </TypeCard>
        </TypeCards>

        <CompareSolutions
          question={"Какой вариант подходит маленькому учебному каталогу?"}
          left={{
            title: "KEYS + DELETE на каждый update",
            code: `keys = await redis.keys("studyhub:catalog:*")`,
            note: "Глобальный поиск может блокировать Redis на большом keyspace.",
          }}
          right={{
            title: "Versioned generation",
            code: `key = f"catalog:g{generation}:page={page}"`,
            note: "Write увеличивает generation, старые values доживают TTL.",
          }}
          preferred={"right"}
          explanation={
            "Generation делает invalidation ограниченной операцией без полного обхода keyspace."
          }
        />
      </Section>

      <Section number={"05"} title={"Versioned namespace пошагово"}>
        <Lead>
          {
            "Отдельный key хранит текущую generation каталога. Read сначала получает generation и включает её в data key. Write после commit увеличивает generation. Следующий read не видит старый key и выполняет miss."
          }
        </Lead>

        <StepThrough
          code={`generation = await redis.get("studyhub:catalog:generation") or "1"
        key = f"studyhub:catalog:g{generation}:page=1"
        cached = await redis.get(key)
        
        # после успешного commit
        await redis.incr("studyhub:catalog:generation")`}
          steps={[
            {
              line: 0,
              note: "Read получает текущую generation.",
              vars: { generation: "17" },
            },
            {
              line: 1,
              note: "Data key привязан к generation 17.",
              vars: { key: "catalog:g17:page=1" },
            },
            {
              line: 2,
              note: "Redis может вернуть старый каталог только внутри текущей generation.",
              vars: { cache: "hit или miss" },
            },
            {
              line: 5,
              note: "После commit write повышает generation.",
              vars: { generation: "18" },
            },
            {
              line: 1,
              note: "Следующий read строит g18 и получает miss.",
              vars: { "old g17": "недоступен и истечёт по TTL" },
            },
          ]}
        />

        <TrueFalse
          statement={
            <>
              {
                "Повышение generation обязано немедленно физически удалить все старые values."
              }
            </>
          }
          isTrue={false}
          explanation={
            "Старые keys становятся недостижимыми для новых reads и удаляются по TTL."
          }
        />
      </Section>

      <Section number={"06"} title={"Fail-safe invalidation"}>
        <Lead>
          {
            "Redis может быть недоступен после database commit. Write endpoint не должен притворяться, что commit не произошёл. Service логирует invalidation failure с course_id и generation, а короткий TTL ограничивает stale window."
          }
        </Lead>

        <CodeBlock
          caption={"commit остаётся главным фактом"}
          code={`await session.commit()
        await session.refresh(course)
        
        try:
            await catalog_cache.invalidate()
        except RedisError:
            logger.error(
                "catalog invalidation failed",
                extra={"course_id": course.id},
            )
        
        return CourseRead.model_validate(course)`}
        />

        <RecallCard
          question={
            "Почему нельзя выполнить rollback после успешного commit только из-за RedisError?"
          }
          hint={"Отделите database transaction от best-effort кеша."}
          answer={
            <p>
              {
                "Commit уже изменил source of truth. Rollback новой session state не отменит зафиксированную transaction, а клиенту нужен честный контракт о результате database write."
              }
            </p>
          }
        />
      </Section>

      <Section number={"07"} title={"Тест stale scenario"}>
        <Lead>
          {
            "Полезный тест не просто проверяет вызов delete. Он воспроизводит пользовательский путь: первый GET заполняет старое значение, PATCH меняет course, второй GET возвращает новое title и выполняет database read из-за miss."
          }
        </Lead>

        <MethodGrid
          rows={[
            [
              "Arrange",
              "создать published course и сделать первый GET /courses",
            ],
            ["Assert cache", "подтвердить старое title в cache value"],
            ["Act write", "выполнить PATCH и дождаться успешного commit"],
            ["Act read", "повторить тот же GET /courses"],
            ["Assert fresh", "увидеть новое title и miss log"],
          ]}
        />

        <PredictOutput
          code={`first = await client.get("/courses")
        await client.patch("/courses/42", json={"title": "New"})
        second = await client.get("/courses")
        print(first.json()[0]["title"])
        print(second.json()[0]["title"])`}
          output={`Old
        New`}
          hint={
            "PATCH после commit инвалидирует прежнюю generation; второй GET заново читает PostgreSQL."
          }
        />
      </Section>

      <Section number={"08"} title={"Контрольная точка: cache invalidation"}>
        <Lead>
          {
            "Проверьте не только знание команд, но и способность проследить путь данных, назвать source of truth, предсказать режим деградации и объяснить результат теста без чтения готового ответа."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Когда выполнять invalidation?"}
            options={[
              "После успешного database commit",
              "До загрузки course",
              "Только при старте",
            ]}
            correctIndex={0}
            explanation={
              "Кеш становится устаревшим после подтверждённого изменения source of truth."
            }
          />
          <QuizCard
            question={"Что такое stale data?"}
            options={[
              "Кешированное значение, не соответствующее текущей базе",
              "Любой JSON",
              "Истёкший access token",
            ]}
            correctIndex={0}
            explanation={
              "Stale value формально читается, но уже неверен для продукта."
            }
          />
          <QuizCard
            question={"Зачем нужна generation?"}
            options={[
              "Сделать старые keys недоступными без полного обхода",
              "Заменить PostgreSQL id",
              "Продлить transaction",
            ]}
            correctIndex={0}
            explanation={"Read использует только текущую generation."}
          />
          <QuizCard
            question={"Что делать при RedisError после commit?"}
            options={[
              "Логировать и ограничить stale window TTL",
              "Притвориться, что database write не был выполнен",
              "Удалить PostgreSQL",
            ]}
            correctIndex={0}
            explanation={"Source of truth уже изменён."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Кеш создаёт риск stale data после любого write-path."}</>,
            <>{"Безопасный порядок — database commit, затем invalidation."}</>,
            <>
              {
                "TTL ограничивает stale window, но не заменяет известную invalidation."
              }
            </>,
            <>{"Разные filter/page keys требуют общей invalidation policy."}</>,
            <>
              {
                "Versioned generation делает старые keys недоступными новым reads."
              }
            </>,
            <>
              {"Redis failure после commit не отменяет факт database write."}
            </>,
            <>{"Интеграционный тест должен доказать Old → write → New."}</>,
          ]}
        />

        <PracticeCta
          text={
            "Добавьте invalidation после publish, update и delete course. Реализуйте versioned generation либо registry keys, воспроизведите ошибочный порядок invalidate-before-commit, затем напишите тест: первый GET возвращает Old, PATCH фиксирует New, второй GET возвращает New и логирует cache miss."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 204. Простой rate limit через Redis
export function Lesson204({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Простой rate limit через Redis"}
        intro={
          "Используем Redis как временное shared state для одного чувствительного endpoint: считаем запросы пользователя внутри короткого окна, возвращаем 429 и Retry-After после лимита, а затем проверяем автоматический reset по TTL."
        }
        tags={[
          { icon: <ShieldCheck size={14} />, label: "429 и граница доступа" },
          { icon: <Timer size={14} />, label: "окно и TTL" },
        ]}
      />
      <TheoryBridge lesson={204} />

      <Section number={"01"} title={"Один чувствительный сценарий"}>
        <Lead>
          {
            "Rate limit не добавляется ко всему API. StudyHub ограничивает отправку учебного напоминания: несколько повторов допустимы, но десятки запросов подряд создают лишнюю работу и шум. Остальные endpoints сохраняют прежний контракт."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Идентифицировать:"}</strong>{" "}
              {"выбрать user_id после authentication"}
            </li>
            <li>
              <strong>{"Посчитать:"}</strong>{" "}
              {"увеличить Redis counter для endpoint и окна"}
            </li>
            <li>
              <strong>{"Разрешить или отклонить:"}</strong>{" "}
              {"сравнить count с limit"}
            </li>
            <li>
              <strong>{"Сообщить:"}</strong>{" "}
              {"вернуть 429 и Retry-After до reset"}
            </li>
          </ol>
          <p>
            {
              "Результат урока — dependency/service, ограничивающий POST /courses/{id}/reminders и не затрагивающий чтение каталога."
            }
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "Rate limit является частью HTTP-контракта: клиент должен знать status 429, границу и время следующей попытки."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Key счётчика и идентификатор клиента"}>
        <Lead>
          {
            "Authenticated user_id обычно точнее IP для пользовательского действия: несколько людей могут разделять IP, а один человек менять сеть. Key включает endpoint, user_id и версию policy."
          }
        </Lead>

        <CodeBlock
          caption={"key одной rate-limit policy"}
          code={`def reminder_rate_key(user_id: int) -> str:
            return (
                "studyhub:rate:v1:"
                f"course-reminder:user={user_id}"
            )`}
        />

        <TypeCards>
          <TypeCard
            badge={"user_id"}
            title={"Authenticated identity"}
            code={`user=42`}
          >
            {"Подходит для действия, доступного только вошедшему пользователю."}
          </TypeCard>
          <TypeCard
            badge={"IP"}
            badgeTone={"float"}
            title={"Network identity"}
            code={`ip=203.0.113.8`}
          >
            {"Может быть дополнительным сигналом, но не равен одному человеку."}
          </TypeCard>
          <TypeCard
            badge={"policy"}
            badgeTone={"str"}
            title={"Отдельный namespace"}
            code={`course-reminder`}
          >
            {"Лимит одного действия не влияет на другие endpoints."}
          </TypeCard>
        </TypeCards>
      </Section>

      <Section number={"03"} title={"Fixed window: INCR и EXPIRE"}>
        <Lead>
          {
            "Первый request создаёт counter=1 и TTL окна. Следующие requests выполняют atomic INCR. Пока key существует, count растёт; после expiration key исчезает и новое окно начинается снова с единицы."
          }
        </Lead>

        <StepThrough
          code={`count = await redis.incr(key)
        if count == 1:
            await redis.expire(key, window_seconds)
        
        ttl = await redis.ttl(key)
        if count > limit:
            raise RateLimitExceeded(retry_after=ttl)`}
          steps={[
            {
              line: 0,
              note: "INCR атомарно создаёт key со значением 1 либо увеличивает существующий.",
              vars: { count: "1" },
            },
            {
              line: 1,
              note: "TTL устанавливается только для первого request окна.",
              vars: { window: "60 секунд" },
            },
            {
              line: 4,
              note: "Текущий TTL нужен клиенту как Retry-After.",
              vars: { ttl: "58" },
            },
            {
              line: 5,
              note: "Requests сверх limit не запускают business action.",
              vars: { status: "429" },
            },
          ]}
        />

        <Callout>
          {
            "Между INCR и EXPIRE остаётся небольшая граница отказа. Для production часто используют transaction/Lua. В учебном блоке это ограничение фиксируется явно, а не скрывается."
          }
        </Callout>
      </Section>

      <Section number={"04"} title={"Allowed, blocked и reset"}>
        <Lead>
          {
            "Поведение легче понять как три состояния. Пока count ≤ limit, request разрешён. При count > limit возвращается 429. После TTL key отсутствует, и следующий request открывает новое окно."
          }
        </Lead>

        <BranchExplorer
          code={`count = await limiter.hit(user_id=42)
        if count <= 3:
            return "allowed"
        if count > 3:
            return "blocked: 429"
        # после expiration новый INCR вернёт 1`}
          scenarios={[
            {
              label: "request 1–3",
              activeLine: 2,
              output: "allowed, action выполняется",
            },
            {
              label: "request 4",
              activeLine: 4,
              output: "429 Too Many Requests",
            },
            {
              label: "после TTL",
              activeLine: 5,
              output: "counter=1, новое окно",
            },
          ]}
        />

        <PredictOutput
          code={`limit = 3
        counts = [1, 2, 3, 4]
        for count in counts:
            print("allowed" if count <= limit else "429")`}
          output={`allowed
        allowed
        allowed
        429`}
          hint={"Первые три requests входят в policy, четвёртый блокируется."}
        />
      </Section>

      <Section number={"05"} title={"HTTP 429 и Retry-After"}>
        <Lead>
          {
            "Rate-limit service не должен возвращать случайную строку. Endpoint преобразует доменное превышение в HTTPException со status 429 и header Retry-After, округлённым до неотрицательного количества секунд."
          }
        </Lead>

        <CodeBlock
          caption={"явный HTTP-контракт"}
          code={`from fastapi import HTTPException, status
        
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "code": "rate_limit_exceeded",
                "message": "Too many reminder requests",
            },
            headers={"Retry-After": str(max(ttl, 1))},
        )`}
        />

        <MatchPairs
          prompt={"Соедините поле ответа с назначением."}
          leftTitle={"Поле"}
          rightTitle={"Назначение"}
          pairs={[
            { left: "429", right: "клиент временно превысил частоту" },
            { left: "Retry-After", right: "через сколько секунд повторить" },
            { left: "detail.code", right: "машиночитаемая причина" },
            { left: "TTL", right: "источник значения Retry-After" },
          ]}
          explanation={
            "Клиент получает предсказуемый контракт и может корректно отложить retry."
          }
        />
      </Section>

      <Section
        number={"06"}
        title={"Redis unavailable: fail-open или fail-closed"}
      >
        <Lead>
          {
            "При недоступном Redis приложение не знает текущий count. Для некритичного mock-reminder можно выбрать fail-open: выполнить действие и записать warning. Для login или оплаты решение могло бы быть fail-closed. Policy должна быть осознанной."
          }
        </Lead>

        <CompareSolutions
          question={"Какая деградация подходит учебному reminder endpoint?"}
          left={{
            title: "Fail-closed",
            code: `RedisError -> 503, reminder blocked`,
            note: "Защита сохраняется, но временная dependency блокирует некритичное действие.",
          }}
          right={{
            title: "Fail-open",
            code: `RedisError -> warning, reminder allowed`,
            note: "Доступность выше, риск краткого превышения принят.",
          }}
          preferred={"right"}
          explanation={
            "Для учебного некритичного уведомления выбран fail-open и это задокументировано."
          }
        />

        <TrueFalse
          statement={
            <>
              {"Одна стратегия fail-open подходит любому endpoint приложения."}
            </>
          }
          isTrue={false}
          explanation={
            "Решение зависит от риска конкретного действия и требований безопасности."
          }
        />
      </Section>

      <Section number={"07"} title={"Проверка окна без долгого ожидания"}>
        <Lead>
          {
            "В integration test окно задаётся коротким, например 2 секунды, или clock/limiter dependency заменяется тестовой. Проверяются первые разрешённые requests, 429, Retry-After и новый разрешённый request после expiration."
          }
        </Lead>

        <TerminalDemo
          title={"ручной сценарий лимита 3/10s"}
          lines={[
            {
              cmd: `for i in 1 2 3 4; do curl -i -X POST http://localhost:8000/courses/42/reminders; done`,
            },
            {
              out: `200
        200
        200
        HTTP/1.1 429 Too Many Requests
        Retry-After: 8`,
            },
            {
              cmd: `sleep 10 && curl -i -X POST http://localhost:8000/courses/42/reminders`,
            },
            { out: `HTTP/1.1 200 OK` },
          ]}
        />

        <RecallCard
          question={"Что обязательно проверить кроме status 429?"}
          hint={"Status без side-effect проверки не доказывает защиту."}
          answer={
            <p>
              {
                "Header Retry-After, отсутствие business action на заблокированном request и reset после TTL."
              }
            </p>
          }
        />
      </Section>

      <Section number={"08"} title={"Контрольная точка: rate limit"}>
        <Lead>
          {
            "Проверьте не только знание команд, но и способность проследить путь данных, назвать source of truth, предсказать режим деградации и объяснить результат теста без чтения готового ответа."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что хранит rate-limit key?"}
            options={[
              "Временный счётчик одного action/user",
              "Course entity",
              "JWT secret",
            ]}
            correctIndex={0}
            explanation={
              "Counter исчезает после окна и не является продуктовым фактом."
            }
          />
          <QuizCard
            question={"Какой status используется после лимита?"}
            options={["429", "201", "404"]}
            correctIndex={0}
            explanation={"429 обозначает Too Many Requests."}
          />
          <QuizCard
            question={"Откуда берётся Retry-After?"}
            options={[
              "Из оставшегося TTL окна",
              "Из course title",
              "Из PostgreSQL id",
            ]}
            correctIndex={0}
            explanation={"TTL показывает время до reset."}
          />
          <QuizCard
            question={"Что означает fail-open?"}
            options={[
              "Разрешить действие при сбое limiter и залогировать",
              "Всегда блокировать",
              "Удалить Redis volume",
            ]}
            correctIndex={0}
            explanation={
              "Availability при dependency failure выше, но риск превышения принят."
            }
          />
        </div>

        <KeyTakeaways
          points={[
            <>
              {
                "Rate limit вводится для одного конкретного чувствительного action."
              }
            </>,
            <>{"Key включает policy и authenticated user_id."}</>,
            <>{"INCR создаёт общий counter, TTL ограничивает окно."}</>,
            <>{"Requests сверх limit не запускают business action."}</>,
            <>{"HTTP-контракт использует 429 и Retry-After."}</>,
            <>{"Fail-open или fail-closed выбираются по риску сценария."}</>,
            <>{"Тест проверяет allowed, blocked, side effect и reset."}</>,
          ]}
        />

        <PracticeCta
          text={
            "Ограничьте POST /courses/{course_id}/reminders до 3 запросов за 10 секунд на пользователя. Верните 429 с Retry-After, подтвердите отсутствие mock-notification на четвёртом request, проверьте reset и задокументируйте выбранный fail-open режим при RedisError."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 205. BackgroundTasks и действие после response
export function Lesson205({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"BackgroundTasks и действие после response"}
        intro={
          "Убираем короткое некритичное уведомление из основного request path: после успешного enrollment commit возвращаем response, а FastAPI BackgroundTasks записывает mock-email в лог или файл, не меняя результат transaction."
        }
        tags={[
          { icon: <Mail size={14} />, label: "mock-уведомление" },
          { icon: <Workflow size={14} />, label: "response → background" },
        ]}
      />
      <TheoryBridge lesson={205} />

      <Section number={"01"} title={"Что не должно задерживать enrollment"}>
        <Lead>
          {
            "Главный результат POST /courses/{id}/enrollments — зафиксированная запись Enrollment. Mock-email является вторичным действием: если он занимает 300 мс, клиент не должен ждать эти 300 мс после успешной transaction."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Зафиксировать:"}</strong>{" "}
              {"создать enrollment и выполнить commit"}
            </li>
            <li>
              <strong>{"Запланировать:"}</strong>{" "}
              {"добавить короткую background function"}
            </li>
            <li>
              <strong>{"Ответить:"}</strong> {"вернуть EnrollmentRead клиенту"}
            </li>
            <li>
              <strong>{"Наблюдать:"}</strong>{" "}
              {"проверить background log и отдельную ошибку"}
            </li>
          </ol>
          <p>
            {
              "Результат урока — enrollment endpoint, где product transaction и некритичное уведомление имеют разные границы."
            }
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "Сначала должен быть успешный business result. Background task нельзя добавлять до commit, иначе уведомление может сообщить о зачислении, которого нет."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Синхронный путь против background action"}>
        <Lead>
          {
            "Обычный await send_mock_email внутри endpoint задерживает response. BackgroundTasks сохраняет callable и arguments, а FastAPI запускает действие после отправки response в рамках того же процесса."
          }
        </Lead>

        <CompareSolutions
          question={"Где выполнять некритичное уведомление?"}
          left={{
            title: "В request path",
            code: `enrollment = await create()
        await send_email(enrollment)
        return enrollment`,
            note: "Клиент ждёт завершения email operation.",
          }}
          right={{
            title: "После response",
            code: `enrollment = await create()
        background_tasks.add_task(send_email, enrollment.id)
        return enrollment`,
            note: "Основной response не зависит от длительности уведомления.",
          }}
          preferred={"right"}
          explanation={
            "Для короткого некритичного mock-email встроенный background mechanism уменьшает latency основного сценария."
          }
        />
      </Section>

      <Section number={"03"} title={"Правильный порядок transaction → task"}>
        <Lead>
          {
            "Background action получает только устойчивые идентификаторы и простые данные. Нельзя передавать открытую AsyncSession или ORM object, жизненный цикл которых связан с завершившимся request."
          }
        </Lead>

        <CodeSequence
          title={"Соберите enrollment endpoint"}
          prompt={"Расположите действия в безопасном порядке."}
          pieces={[
            {
              id: "validate",
              code: "проверить course и отсутствие enrollment",
            },
            { id: "create", code: "создать Enrollment ORM object" },
            { id: "commit", code: "await session.commit()" },
            { id: "refresh", code: "await session.refresh(enrollment)" },
            {
              id: "task",
              code: "background_tasks.add_task(write_mock_email, enrollment.id)",
            },
            {
              id: "return",
              code: "return EnrollmentRead.model_validate(enrollment)",
            },
            {
              id: "wrong",
              code: "add_task(..., session)",
              note: "request dependency уже завершится",
            },
          ]}
          correctOrder={[
            "validate",
            "create",
            "commit",
            "refresh",
            "task",
            "return",
          ]}
          explanation={
            "Task добавляется после commit и получает устойчивый enrollment_id."
          }
        />
      </Section>

      <Section number={"04"} title={"Background function и endpoint"}>
        <Lead>
          {
            "Background function должна быть небольшой и самостоятельной. Учебный вариант записывает событие в append-only log file. Function сама обрабатывает ожидаемую ошибку и не раскрывает токены или персональные данные."
          }
        </Lead>

        <CodeBlock
          caption={"короткий mock-notification"}
          code={`from pathlib import Path
        from datetime import datetime, timezone
        
        NOTIFICATION_LOG = Path("var/mock_notifications.log")
        
        
        def write_enrollment_notification(
            enrollment_id: int,
            user_email: str,
        ) -> None:
            timestamp = datetime.now(timezone.utc).isoformat()
            line = (
                f"{timestamp} enrollment={enrollment_id} "
                f"recipient={user_email}\n"
            )
            NOTIFICATION_LOG.parent.mkdir(parents=True, exist_ok=True)
            with NOTIFICATION_LOG.open("a", encoding="utf-8") as file:
                file.write(line)`}
        />

        <Callout>
          {
            "В реальном проекте email provider является внешней dependency. Здесь файл нужен только для наблюдаемого результата без новой инфраструктуры."
          }
        </Callout>

        <Lead>
          {
            "FastAPI инжектирует объект BackgroundTasks в endpoint. После commit endpoint добавляет функцию и аргументы. HTTP response возвращает enrollment независимо от того, когда именно будет записана строка."
          }
        </Lead>

        <CodeBlock
          caption={"task добавляется после service commit"}
          code={`from fastapi import BackgroundTasks
        
        @router.post("/courses/{course_id}/enrollments")
        async def enroll(
            course_id: int,
            background_tasks: BackgroundTasks,
            current_user: CurrentUser,
            session: AsyncSessionDep,
        ) -> EnrollmentRead:
            enrollment = await enrollment_service.create(
                session=session,
                course_id=course_id,
                user_id=current_user.id,
            )
        
            background_tasks.add_task(
                write_enrollment_notification,
                enrollment.id,
                current_user.email,
            )
        
            return EnrollmentRead.model_validate(enrollment)`}
        />

        <FillBlank
          prompt={
            "Какой объект передаётся endpoint для регистрации работы после response?"
          }
          before={"background_tasks: "}
          after={""}
          options={["BackgroundTasks", "AsyncSession", "Redis"]}
          answer={"BackgroundTasks"}
          explanation={"FastAPI создаёт контейнер задач для текущего response."}
        />
      </Section>

      <Section number={"05"} title={"Ошибки фоновой операции"}>
        <Lead>
          {
            "Response уже отправлен, поэтому background exception не может превратить его в HTTP 500. Ошибка должна попасть в logger с operation и enrollment_id. Клиент может получить 201, даже если mock-email затем не записался."
          }
        </Lead>

        <BugHunt
          code={`def write_notification(enrollment_id: int):
            provider.send(enrollment_id)
        
        # нет try/except и контекстного log`}
          question={"Что потеряется при ошибке provider?"}
          options={[
            "Наблюдаемая причина и идентификатор операции",
            "Enrollment автоматически откатится",
            "HTTP request станет GET",
          ]}
          correctIndex={0}
          explanation={
            "После response ошибка должна быть диагностируема по server log."
          }
          fix={`def write_notification(enrollment_id: int):
            try:
                provider.send(enrollment_id)
            except ProviderError:
                logger.exception(
                    "background notification failed",
                    extra={"enrollment_id": enrollment_id},
                )`}
        />

        <Callout>
          {
            "Не перехватывайте BaseException и не скрывайте проблему пустым except. Background failure должен быть виден в logs и tests."
          }
        </Callout>
      </Section>

      <Section number={"06"} title={"Граница встроенного механизма"}>
        <Lead>
          {
            "BackgroundTasks выполняется в процессе API. Перезапуск process может потерять незавершённое действие, нет отдельного retry broker и независимого scaling. Поэтому механизм подходит только для короткой best-effort работы."
          }
        </Lead>

        <FlipCards
          cards={[
            {
              front: "Короткий audit/mock log",
              back: "Подходит: быстро, некритично, результат наблюдаем.",
            },
            {
              front: "Отправка обязательного платежа",
              back: "Не подходит: нужна гарантированная доставка, retry и отдельный worker.",
            },
            {
              front: "Пересчёт отчёта на 20 минут",
              back: "Не подходит: долгий job конкурирует с API process.",
            },
            {
              front: "Удаление временного файла",
              back: "Может подходить, если потеря cleanup допустима и есть дополнительная уборка.",
            },
          ]}
        />

        <TrueFalse
          statement={
            <>
              {
                "BackgroundTasks гарантирует выполнение после аварийного завершения API process."
              }
            </>
          }
          isTrue={false}
          explanation={
            "Встроенный механизм не является durable queue и не переживает потерю процесса."
          }
        />
      </Section>

      <Section number={"07"} title={"Измеряем response и наблюдаем task"}>
        <Lead>
          {
            "Проверка разделяет два результата: HTTP response должен прийти быстро и содержать enrollment; затем notification log должен получить строку. Для демонстрации background function может намеренно sleep 0.3 секунды."
          }
        </Lead>

        <TerminalDemo
          title={"response раньше mock-notification"}
          lines={[
            {
              cmd: `curl -s -w "response=%{time_total}\n" -X POST http://localhost:8000/courses/42/enrollments`,
            },
            {
              out: `{"id":91,"course_id":42,"status":"active"}
        response=0.047`,
            },
            { cmd: `tail -n 1 var/mock_notifications.log` },
            {
              out: `2026-07-21T... enrollment=91 recipient=student@example.test`,
            },
          ]}
        />

        <RecallCard
          question={
            "Какой результат является главным, если background notification упала?"
          }
          hint={"Сначала определите transaction boundary."}
          answer={
            <p>
              {
                "Успешно committed Enrollment остаётся главным product result. Ошибка уведомления фиксируется отдельно и не переписывает уже отправленный response."
              }
            </p>
          }
        />
      </Section>

      <Section number={"08"} title={"Контрольная точка: BackgroundTasks"}>
        <Lead>
          {
            "Проверьте не только знание команд, но и способность проследить путь данных, назвать source of truth, предсказать режим деградации и объяснить результат теста без чтения готового ответа."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Когда добавлять notification task?"}
            options={[
              "После успешного enrollment commit",
              "До проверки course",
              "В middleware для всех requests",
            ]}
            correctIndex={0}
            explanation={
              "Task должен соответствовать существующему product fact."
            }
          />
          <QuizCard
            question={"Что передавать task вместо session?"}
            options={[
              "Устойчивый id и простые данные",
              "Открытую AsyncSession",
              "Response object",
            ]}
            correctIndex={0}
            explanation={"Request-scoped dependencies могут быть уже закрыты."}
          />
          <QuizCard
            question={
              "Может ли background exception изменить отправленный 201?"
            }
            options={["Нет", "Всегда да", "Только через Redis TTL"]}
            correctIndex={0}
            explanation={"Response уже отправлен клиенту."}
          />
          <QuizCard
            question={"Для чего BackgroundTasks не подходит?"}
            options={[
              "Для критичного durable job с retries",
              "Для короткого mock-log",
              "Для best-effort cleanup",
            ]}
            correctIndex={0}
            explanation={
              "Гарантированная работа требует внешней очереди и worker."
            }
          />
        </div>

        <KeyTakeaways
          points={[
            <>
              {
                "Product transaction завершается до регистрации background action."
              }
            </>,
            <>
              {"BackgroundTasks выполняет callable после отправки response."}
            </>,
            <>
              {
                "Task получает устойчивые ids, а не request-scoped session или ORM object."
              }
            </>,
            <>
              {
                "Background error логируется отдельно и не меняет уже отправленный response."
              }
            </>,
            <>
              {
                "Механизм подходит только для короткой некритичной best-effort работы."
              }
            </>,
            <>
              {"Перезапуск API может потерять незавершённую встроенную задачу."}
            </>,
            <>
              {
                "Проверка разделяет latency response и наблюдаемый результат task."
              }
            </>,
          ]}
        />

        <PracticeCta
          text={
            "После успешного enrollment commit добавьте BackgroundTasks, который записывает mock-email в var/mock_notifications.log. Передавайте enrollment_id и email, измерьте response latency, намеренно вызовите ProviderError и подтвердите: Enrollment сохранён, клиент получил 201, ошибка видна в server log."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 206. Тестирование кеша, rate limit и фоновых ошибок
export function Lesson206({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Тестирование кеша, rate limit и фоновых ошибок"}
        intro={
          "Финализируем блок измеримыми сценариями: проверяем cache miss/hit, invalidation, TTL, 429, Redis unavailable fallback, BackgroundTasks и ошибки уведомления так, чтобы Redis не превращал StudyHub в хрупкую систему."
        }
        tags={[
          { icon: <TestTube2 size={14} />, label: "integration tests" },
          { icon: <Activity size={14} />, label: "degradation matrix" },
        ]}
      />
      <TheoryBridge lesson={206} />

      <Section number={"01"} title={"Что именно должен доказать test suite"}>
        <Lead>
          {
            "Недостаточно проверить, что redis.get был вызван. Тесты описывают пользовательские эффекты: одинаковый response при hit/miss, свежий каталог после write, 429 без side effect, работа read-path при Redis failure и видимая background error."
          }
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Изолировать:"}</strong>{" "}
              {"заменить Redis test instance или fake dependency"}
            </li>
            <li>
              <strong>{"Наблюдать:"}</strong>{" "}
              {"считать database calls, cache events и notification results"}
            </li>
            <li>
              <strong>{"Ломать:"}</strong>{" "}
              {"инъецировать RedisError и ProviderError"}
            </li>
            <li>
              <strong>{"Сверить:"}</strong>{" "}
              {"проверить HTTP contract и logs в каждом режиме"}
            </li>
          </ol>
          <p>
            {
              "Результат урока — test matrix и повторяемый набор проверок для всех эксплуатационных функций блока."
            }
          </p>
        </div>

        <Callout tone={"info"}>
          {
            "Хороший failure test заранее фиксирует ожидаемую деградацию. Он не просто ждёт, что приложение «не упадёт»."
          }
        </Callout>
      </Section>

      <Section number={"02"} title={"Fake Redis или изолированный service"}>
        <Lead>
          {
            "Unit tests могут использовать небольшой fake с get/set/delete/incr/ttl, а integration tests — отдельную Redis database или Compose service. Главное — очищать state между tests и не зависеть от developer Redis."
          }
        </Lead>

        <CompareSolutions
          question={"Как разделить уровни проверки?"}
          left={{
            title: "Только mock вызовов",
            code: `redis.get.assert_called_once()`,
            note: "Быстро, но не проверяет TTL, counter и реальные данные.",
          }}
          right={{
            title: "Fake + integration Redis",
            code: `unit policy tests + small real integration suite`,
            note: "Policy проверяется быстро, а протокол и TTL подтверждаются отдельно.",
          }}
          preferred={"right"}
          explanation={
            "Комбинация даёт быстрый feedback и несколько проверок реального поведения Redis."
          }
        />

        <MethodGrid
          rows={[
            ["unit", "key builder, serialization, branches и exception policy"],
            ["service", "cache service с fake repository и fake Redis"],
            [
              "integration",
              "FastAPI client + PostgreSQL test DB + isolated Redis",
            ],
            ["manual", "latency/log scenario в Compose"],
          ]}
        />
      </Section>

      <Section number={"03"} title={"Cache hit, invalidation и TTL"}>
        <Lead>
          {
            "Test считает обращения repository. На первом request fake Redis пуст, repository вызывается один раз и value появляется. На втором request repository call count остаётся один, а response полностью совпадает."
          }
        </Lead>

        <CodeBlock
          caption={"repository вызывается только на miss"}
          code={`async def test_catalog_cache_miss_then_hit(
            client,
            catalog_repository,
            redis,
        ):
            first = await client.get("/courses?page=1")
            second = await client.get("/courses?page=1")
        
            assert first.status_code == 200
            assert second.json() == first.json()
            assert catalog_repository.list_calls == 1
            assert await redis.get(
                "studyhub:catalog:g1:page=1:size=20:category=all"
            ) is not None`}
        />

        <PredictOutput
          code={`repository_calls = 0
        cache = {}
        for _ in range(2):
            if "catalog" not in cache:
                repository_calls += 1
                cache["catalog"] = ["SQL"]
        print(repository_calls)`}
          output={`1`}
          hint={"Второй read использует уже заполненный cache value."}
        />

        <Lead>
          {
            "Invalidation test воспроизводит Old → PATCH → New. TTL policy удобнее проверять через fake clock или короткий isolated Redis TTL, а не ждать минуту в каждом test. Test должен оставаться быстрым и детерминированным."
          }
        </Lead>

        <CodeBlock
          caption={"stale scenario становится тестом"}
          code={`async def test_update_invalidates_catalog(client):
            old = await client.get("/courses")
        
            updated = await client.patch(
                "/courses/42",
                json={"title": "New title"},
            )
        
            fresh = await client.get("/courses")
        
            assert old.json()[0]["title"] == "Old title"
            assert updated.status_code == 200
            assert fresh.json()[0]["title"] == "New title"`}
        />

        <TrueFalse
          statement={<>{"Надёжный TTL test обязан выполнять sleep(60)."}</>}
          isTrue={false}
          explanation={
            "Можно использовать короткий TTL, fake clock или проверку expiration metadata."
          }
        />
      </Section>

      <Section
        number={"04"}
        title={"Rate limit: status и отсутствие side effect"}
      >
        <Lead>
          {
            "Тест делает limit разрешённых requests, затем ещё один. Для заблокированного вызова проверяются 429, Retry-After и неизменившийся notification call count. После reset следующий request снова разрешён."
          }
        </Lead>

        <CodeBlock
          caption={"429 не запускает действие"}
          code={`async def test_reminder_rate_limit(client, notifier):
            for _ in range(3):
                response = await client.post(
                    "/courses/42/reminders"
                )
                assert response.status_code == 200
        
            blocked = await client.post(
                "/courses/42/reminders"
            )
        
            assert blocked.status_code == 429
            assert int(blocked.headers["Retry-After"]) >= 1
            assert notifier.calls == 3`}
        />

        <BranchExplorer
          code={`if request_number <= 3:
            notifier.send()
            return 200
        else:
            return 429
        # after reset -> 200`}
          scenarios={[
            {
              label: "1–3",
              activeLine: 2,
              output: "200 и notifier.calls растёт",
            },
            {
              label: "4",
              activeLine: 5,
              output: "429, notifier.calls не меняется",
            },
            {
              label: "после reset",
              activeLine: 6,
              output: "200 и новый window",
            },
          ]}
        />
      </Section>

      <Section number={"05"} title={"Redis unavailable matrix"}>
        <Lead>
          {
            "Failure injection должен различать функции. Catalog read работает через PostgreSQL; invalidation failure логируется после успешного update; reminder limiter следует задокументированному fail-open; PostgreSQL failure по-прежнему возвращает database error и не скрывается старым кешем."
          }
        </Lead>

        <MatchPairs
          prompt={"Соедините отказ dependency и ожидаемое поведение."}
          leftTitle={"Сбой"}
          rightTitle={"Ожидаемое поведение"}
          pairs={[
            {
              left: "Redis GET error в каталоге",
              right: "PostgreSQL fallback + warning",
            },
            {
              left: "Redis invalidation error после commit",
              right:
                "write успешен + error log + TTL ограничивает stale window",
            },
            {
              left: "Redis rate-limit error",
              right: "fail-open reminder + warning",
            },
            {
              left: "PostgreSQL error",
              right: "не маскировать обычным cache miss",
            },
          ]}
          explanation={"Каждая функция имеет отдельную degradation policy."}
        />

        <BugHunt
          code={`try:
            return await get_catalog()
        except Exception:
            return decode(await redis.get("catalog"))`}
          question={"Почему fallback опасен?"}
          options={[
            "PostgreSQL и programming errors скрываются устаревшим кешем",
            "Redis нельзя читать",
            "HTTP response всегда должен быть пустым",
          ]}
          correctIndex={0}
          explanation={
            "Широкий except маскирует source-of-truth failure и дефекты кода."
          }
          fix={`try:
            cached = await redis.get(key)
        except RedisError:
            cached = None
        
        # PostgreSQL errors проходят отдельно
        return await load_from_db_if_needed(cached)`}
        />
      </Section>

      <Section number={"06"} title={"Background task: успех и ошибка"}>
        <Lead>
          {
            "TestClient обычно выполняет зарегистрированные BackgroundTasks до завершения тестового response context, поэтому можно проверить созданную строку или spy call. Для ошибки provider проверяется logger record, а enrollment остаётся сохранённым."
          }
        </Lead>

        <CodeBlock
          caption={"ошибка вторичного действия не отменяет enrollment"}
          code={`async def test_enrollment_survives_notification_error(
            client,
            failing_notifier,
            caplog,
            enrollment_repository,
        ):
            response = await client.post(
                "/courses/42/enrollments"
            )
        
            assert response.status_code == 201
            assert await enrollment_repository.exists(
                response.json()["id"]
            )
            assert "background notification failed" in caplog.text`}
        />

        <RecallCard
          question={"Какие две независимые вещи проверяет этот test?"}
          hint={"Разделите главный результат и вторичную операцию."}
          answer={
            <p>
              {
                "Product fact Enrollment сохранён, а background failure наблюдаем в logs. Одно не подменяет другое."
              }
            </p>
          }
        />
      </Section>

      <Section
        number={"07"}
        title={"Финальная dashboard сценариев и измерение"}
      >
        <Lead>
          {
            "Блок завершается таблицей сценариев и повторным измерением каталога. Ученик показывает cache hit ratio на маленьком demo, latency miss/hit, число 429 и background errors, но не делает громких выводов без нагрузки."
          }
        </Lead>

        <TerminalDemo
          title={"финальный набор проверок"}
          lines={[
            { cmd: `pytest tests/cache tests/rate_limit tests/background -q` },
            { out: `18 passed` },
            { cmd: `python scripts/measure_catalog.py --requests 20` },
            { out: `miss=1 hit=19 avg_hit_ms=11.8 avg_miss_ms=82.4` },
            {
              cmd: `docker compose logs api | grep -E "cache|rate_limit|background" | tail`,
            },
            {
              out: `catalog_cache hit
        rate_limit blocked user=42
        background notification failed enrollment=91`,
            },
          ]}
        />

        <Callout>
          {
            "Измерение описывает конкретную среду и demo dataset. Оно подтверждает механизм, но не заменяет production profiling."
          }
        </Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка: устойчивый Redis-блок"}>
        <Lead>
          {
            "Проверьте не только знание команд, но и способность проследить путь данных, назвать source of truth, предсказать режим деградации и объяснить результат теста без чтения готового ответа."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что доказывает cache hit test?"}
            options={[
              "Одинаковый response и отсутствие второго repository call",
              "Только status 200",
              "Наличие Redis image",
            ]}
            correctIndex={0}
            explanation={"Проверяется наблюдаемое поведение и источник данных."}
          />
          <QuizCard
            question={"Что проверять при 429?"}
            options={[
              "Retry-After и отсутствие side effect",
              "Только JSON title",
              "Database migration",
            ]}
            correctIndex={0}
            explanation={"Заблокированный action не должен выполняться."}
          />
          <QuizCard
            question={"Как каталог ведёт себя при Redis GET error?"}
            options={[
              "Читает PostgreSQL и логирует warning",
              "Удаляет courses",
              "Всегда возвращает 429",
            ]}
            correctIndex={0}
            explanation={"Кеш является временной оптимизацией."}
          />
          <QuizCard
            question={"Что должно остаться после background error?"}
            options={[
              "Committed enrollment и error log",
              "Откат PostgreSQL",
              "Пустой response",
            ]}
            correctIndex={0}
            explanation={"Вторичная операция не отменяет product transaction."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>
              {
                "Tests проверяют пользовательский эффект, а не только вызовы Redis methods."
              }
            </>,
            <>
              {
                "Miss/hit подтверждаются repository call count и одинаковым response."
              }
            </>,
            <>{"Invalidation test воспроизводит Old → write → New."}</>,
            <>{"TTL проверяется детерминированно без длинных ожиданий."}</>,
            <>
              {
                "Rate-limit test проверяет 429, Retry-After и отсутствие side effect."
              }
            </>,
            <>
              {
                "Redis failure имеет отдельную policy для cache, invalidation и limiter."
              }
            </>,
            <>
              {
                "Background error оставляет product transaction и создаёт наблюдаемый log."
              }
            </>,
          ]}
        />

        <PracticeCta
          text={
            "Создайте test matrix минимум из 10 сценариев: miss, hit, different filter key, invalidation, TTL, 429, reset, Redis GET failure, Redis invalidation failure, notification success и failure. Добавьте scripts/measure_catalog.py и обновите README фактическими командами и ограничениями измерения."
          }
        />
      </Section>
    </RichLesson>
  );
}

import { Activity, RefreshCcw } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 35 · Redis, кеш и фоновые операции";

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
      <TheoryBridge link={"Предыдущий урок дал временную модель Redis и безопасный fallback. Теперь эта модель применяется к конкретной проблеме: публичный каталог повторно выполняет одинаковый SQL и формирует одинаковый response."} boundary={"Кешируется только каталог с измеримым повторным чтением. Нельзя объявлять каждый endpoint кандидатом на кеш и нельзя хранить в Redis ORM-объекты или незавершённые transaction data."} />

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

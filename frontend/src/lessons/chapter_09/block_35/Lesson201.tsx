import { Database, Timer } from "lucide-react";
import { BranchExplorer, Callout, CodeBlock, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 35 · Redis, кеш и фоновые операции";

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
      <TheoryBridge link={"В Compose Redis уже запущен и отвечает PONG, но приложение ещё не использует его. После готового LMS-каталога появилась первая реальная причина хранить временный результат рядом с API."} boundary={"Redis не становится второй основной базой StudyHub. Streams, pub/sub, persistence modes и устройство Redis server не входят: урок строит только модель key/value, TTL и безопасной деградации."} />

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

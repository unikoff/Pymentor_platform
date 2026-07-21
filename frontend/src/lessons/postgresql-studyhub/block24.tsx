import {
  BarChart3,
  Boxes,
  GitFork,
  KeyRound,
  Layers,
  Save,
  Search,
  ShieldCheck,
  Trophy
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
  TypeCards
} from "../shared";

const BLOCK_TITLE =
  "Блок 24 · Индексы, планы запросов и модели хранения";

// 135. Почему запрос становится медленным
export function Lesson135({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Почему запрос становится медленным"}
        intro={"Перестанем оптимизировать по ощущению: построим воспроизводимый benchmark, отделим размер таблицы от размера ответа и зафиксируем baseline для реального запроса PostgreSQL StudyHub."}
        tags={[
          {
            icon: <Search size={14} />,
            label: "измерение до решения",
          },
          {
            icon: <BarChart3 size={14} />,
            label: "baseline и селективность",
          },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong>
        {" "}
        {"В предыдущем блоке StudyHub научился выполнять JOIN, агрегаты и транзакции. Теперь тот же корректный SQL нужно оценивать не только по результату, но и по стоимости выполнения."}
        {" "}
        <strong>{"Важно не перепутать:"}</strong>
        {" "}
        {"Медленный endpoint ещё не доказывает медленный SQL. Сначала изолируйте запрос, объём данных, число возвращаемых строк и условия повторения."}
      </Callout>
      <Section number={"01"} title={"Проблема и маршрут занятия"}>
        <Lead>
          {"Перестанем оптимизировать по ощущению: построим воспроизводимый benchmark, отделим размер таблицы от размера ответа и зафиксируем baseline для реального запроса PostgreSQL StudyHub."}
        </Lead>
        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Зафиксировать запрос."}</strong>
              {" "}
              {"не менять SQL во время измерения и записать параметры."}
            </li>
            <li>
              <strong>{"Создать реалистичный объём."}</strong>
              {" "}
              {"маленькая таблица может скрыть линейное чтение."}
            </li>
            <li>
              <strong>{"Повторить измерение."}</strong>
              {" "}
              {"один запуск зависит от кеша, фоновой нагрузки и прогрева."}
            </li>
            <li>
              <strong>{"Сохранить baseline."}</strong>
              {" "}
              {"числа до оптимизации нужны для честного сравнения после изменения."}
            </li>
          </ol>
          <p>{"Результат занятия становится частью общего аудита PostgreSQL StudyHub."}</p>
        </div>
        <TypeCards>
          <TypeCard
            badge={"симптом"}
            title={"Endpoint отвечает 900 мс"}
            code={"GET /tasks?owner_id=42"}
          >
            {"Пользователь видит задержку, но причина пока неизвестна."}
          </TypeCard>
          <TypeCard
            badge={"измерение"}
            badgeTone={"float"}
            title={"Один SQL и один набор данных"}
            code={"\\timing on"}
          >
            {"Мы уменьшаем область поиска и повторяем эксперимент."}
          </TypeCard>
          <TypeCard
            badge={"baseline"}
            badgeTone={"str"}
            title={"Таблица наблюдений"}
            code={"runs: 5 · rows: 100000"}
          >
            {"Фиксируем медиану или хотя бы несколько одинаковых запусков."}
          </TypeCard>
        </TypeCards>
        <Callout tone="info">
          {"Сначала сформулируйте наблюдаемую проблему и критерий успеха. Инструмент появляется только после этого."}
        </Callout>
      </Section>
      <Section number={"02"} title={"Главная модель и термины"}>
        <Lead>
          {"В предыдущем блоке StudyHub научился выполнять JOIN, агрегаты и транзакции. Теперь тот же корректный SQL нужно оценивать не только по результату, но и по стоимости выполнения."}
        </Lead>
        <MethodGrid
          rows={[
            [<>{"размер таблицы"}</>, "сколько строк сервер потенциально должен рассмотреть"],
            [<>{"селективность"}</>, "какая доля строк подходит под условие WHERE"],
            [<>{"размер ответа"}</>, "сколько строк и колонок нужно передать клиенту"],
            [<>{"execution time"}</>, "время выполнения SQL внутри PostgreSQL"],
            [<>{"endpoint time"}</>, "SQL плюс Python, сериализация, сеть и middleware"],
          ]}
        />
        <CodeBlock
          caption={"один запрос — разные объёмы"}
          code={[
          "SELECT id, title, created_at",
          "FROM tasks",
          "WHERE owner_id = 42",
          "  AND is_done = false",
          "ORDER BY created_at DESC",
          "LIMIT 50;",
        ] .join(String.fromCharCode(10))}
        />
        <RecallCard
          question={"Объясните главную модель этого раздела без терминов из документации."}
          hint={"Назовите вход, выполняемую работу и наблюдаемый результат."}
          answer={
            <p>{"Медленный endpoint ещё не доказывает медленный SQL. Сначала изолируйте запрос, объём данных, число возвращаемых строк и условия повторения."}</p>
          }
        />
      </Section>
      <Section number={"03"} title={"Маленькая таблица скрывает линейную работу"}>
        <Lead>
          {"На ста строках PostgreSQL может быстро просмотреть всю таблицу. После роста до ста тысяч строк тот же маршрут начинает выполнять намного больше работы, хотя текст SQL не изменился."}
        </Lead>
        <StepThrough
          code={[
          "TRUNCATE TABLE tasks RESTART IDENTITY;",
          "",
          "INSERT INTO tasks (owner_id, title, is_done, created_at)",
          "SELECT",
          "    1 + (n % 500),",
          "    'task-' || n,",
          "    n % 4 = 0,",
          "    now() - (n || ' minutes')::interval",
          "FROM generate_series(1, 100000) AS n;",
        ] .join(String.fromCharCode(10))}
          steps={[
            {
              line: 0,
              note: "Старые учебные данные удаляются, чтобы объём был воспроизводимым.",
              vars: {"rows": "0"},
            },
            {
              line: 2,
              note: "INSERT начинает создавать согласованный набор данных.",
              vars: {"target": "100000 строк"},
            },
            {
              line: 4,
              note: "owner_id распределяется между 500 владельцами.",
              vars: {"owner_id=42": "примерно 200 строк"},
            },
            {
              line: 6,
              note: "Каждая четвёртая задача завершена.",
              vars: {"is_done=false": "около 75%"},
            },
            {
              line: 8,
              note: "created_at получает различимые значения для сортировки.",
              vars: {"order": "стабильный"},
            },
          ]}
        />
        <Callout tone="info">
          {"Пошаговый разбор нужен не для запоминания вывода, а для объяснения причин каждого перехода."}
        </Callout>
        <TrueFalse
          statement={<>{"Медленный endpoint ещё не доказывает медленный SQL. Сначала изолируйте запрос, объём данных, число возвращаемых строк и условия повторения."}</>}
          isTrue={true}
          explanation={"Это ключевая граница урока: без неё инструмент легко применить механически."}
        />
      </Section>
      <Section number={"04"} title={"Селективность меняет объём подходящих строк"}>
        <Lead>
          {"Сейчас нужно не копировать готовую команду, а выбрать ветку или структуру по требованиям конкретного сценария."}
        </Lead>
        <BranchExplorer
          code={[
          "WHERE email = 'student42@example.com'",
          "WHERE owner_id = 42",
          "WHERE is_done = false",
        ] .join(String.fromCharCode(10))}
          scenarios={[
            { label: "email уникален", activeLine: 0, output: "подходит 1 строка из 100000" },
            { label: "один владелец", activeLine: 1, output: "подходит около 200 строк" },
            { label: "незавершённые", activeLine: 2, output: "подходит около 75000 строк" },
          ]}
        />
        <Callout>
          {"После выбора проговорите, какое условие изменило решение и какой альтернативный результат был бы возможен."}
        </Callout>
      </Section>
      <Section number={"05"} title={"Сравнение решений и цена выбора"}>
        <Lead>
          {"Два варианта могут быть синтаксически корректны, но только один соответствует измеряемому query pattern, модели данных или эксплуатационной процедуре."}
        </Lead>
        <CompareSolutions
          question={"Какой benchmark можно повторить и сравнить после изменения?"}
          left={{
            title: "Случайная проверка endpoint",
            code: "Открыть Swagger и один раз нажать Execute",
            note: "Не зафиксированы объём данных, параметры, число запусков и часть времени, которую занял SQL.",
          }}
          right={{
            title: "Изолированный baseline",
            code: [
          "\\timing on",
          "SELECT ... WHERE owner_id = 42 ...;",
          "-- выполнить пять раз и записать результаты",
        ] .join(String.fromCharCode(10)),
            note: "Одинаковый SQL, одинаковые параметры и одинаковый dataset дают сравнимую исходную точку.",
          }}
          preferred={"right"}
          explanation={"Оптимизация начинается с воспроизводимого исходного измерения, а не с единичного ощущения в интерфейсе."}
        />
        <TrueFalse
          statement={<>{"Корректный синтаксис сам по себе ещё не доказывает, что решение подходит проектному сценарию."}</>}
          isTrue={true}
          explanation={"Решение оценивается по query pattern, модели данных, измерению и эксплуатационной цене."}
        />
        <div className="lesson-practice-steps">
          <h3>{"Вопрос перед изменением"}</h3>
          <p>{"Какую конкретную работу перестанет выполнять система или какую гарантию добавит выбранный вариант?"}</p>
          <h3>{"Вопрос после изменения"}</h3>
          <p>{"Каким измерением, plan, smoke test или наблюдаемым сценарием подтверждается результат?"}</p>
          <h3>{"Граница"}</h3>
          <p>{"Медленный endpoint ещё не доказывает медленный SQL. Сначала изолируйте запрос, объём данных, число возвращаемых строк и условия повторения."}</p>
        </div>
      </Section>
      <Section number={"06"} title={"Baseline PostgreSQL StudyHub"}>
        <Lead>
          {"Для блока выбираем один проектный запрос: список незавершённых задач владельца, отсортированный от новых к старым. Именно под него позже будет проектироваться составной индекс."}
        </Lead>
        <CodeBlock
          caption={"sql-lab/135_baseline.sql"}
          code={[
          "\\timing on",
          "",
          "SELECT id, title, created_at",
          "FROM tasks",
          "WHERE owner_id = 42",
          "  AND is_done = false",
          "ORDER BY created_at DESC",
          "LIMIT 50;",
        ] .join(String.fromCharCode(10))}
        />
        <TerminalDemo
          title={"проверка в терминале"}
          lines={[
            { cmd: "psql \"$DATABASE_URL\" -f sql-lab/135_baseline.sql" },
            { out: "Time: 18.742 ms" },
            { out: "Time: 15.311 ms" },
            { out: "Time: 15.084 ms" },
            { cmd: "git add sql-lab/135_baseline.sql docs/query-baseline.md" },
            { cmd: "git commit -m \"perf: record tasks query baseline\"" },
          ]}
        />
        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Зафиксируйте входные данные, версию команды и ожидаемый наблюдаемый результат."}</p>
          <h3>{"После запуска"}</h3>
          <p>{"Сохраните фактический вывод, сравните его с ожиданием и объясните расхождение."}</p>
          <h3>{"Перед коммитом"}</h3>
          <p>{"Повторите успешный и ошибочный сценарий из чистого состояния."}</p>
        </div>
        <Callout tone="info">
          {"Проектный артефакт должен запускаться повторно: SQL-файл, migration, script, test или runbook сохраняется в репозитории."}
        </Callout>
      </Section>
      <Section number={"07"} title={"Диагностика ошибки и объяснение результата"}>
        <Lead>
          {"Профессиональный сценарий включает не только успех. Найдите ошибочное предположение, исправьте минимальную часть и повторите прежнюю проверку."}
        </Lead>
        <MethodGrid
          rows={[
            [<>{"наблюдение"}</>, "записать точный вывод, plan, row count или cache result"],
            [<>{"ожидание"}</>, "назвать результат, который считался правильным"],
            [<>{"расхождение"}</>, "найти первое место, где факт перестал совпадать с ожиданием"],
            [<>{"минимальное исправление"}</>, "изменить одну причину и повторить прежнюю проверку"],
          ]}
        />
        <BugHunt
          code={[
          "start = perf_counter()",
          "response = client.get(\"/tasks?owner_id=42\")",
          "print(perf_counter() - start)",
          "# вывод: 0.9 секунды",
          "# вывод: SQL медленный",
        ] .join(String.fromCharCode(10))}
          question={"Почему вывод о SQL пока необоснован?"}
          options={[
            "Измерен весь HTTP-сценарий, а не отдельный SQL",
            "perf_counter запрещён в Python",
            "FastAPI всегда медленнее PostgreSQL",
          ]}
          correctIndex={0}
          explanation={"В 0.9 секунды входят dependency, Python-код, сериализация, middleware и транспорт. SQL нужно измерить отдельно."}
          fix={[
          "-- В psql измеряем сам запрос",
          "\\timing on",
          "SELECT id, title, created_at",
          "FROM tasks",
          "WHERE owner_id = 42",
          "  AND is_done = false",
          "ORDER BY created_at DESC",
          "LIMIT 50;",
        ] .join(String.fromCharCode(10))}
        />
        <RecallCard
          question={"Почему один быстрый запуск не является доказательством?"}
          answer={
            <p>{"Он может попасть в прогретый кеш или выполняться при другой фоновой нагрузке. Нужны одинаковые условия и серия повторений."}</p>
          }
        />
        <Callout>
          {"Не скрывайте ошибку новой технологией. Сначала назовите нарушенное ожидание, затем покажите проверяемое исправление."}
        </Callout>
      </Section>
      <Section number={"08"} title={"Контрольная точка и практика"}>
        <Lead>
          {"Урок завершён, когда вы можете воспроизвести сценарий, объяснить выбранный инструмент и показать отрицательный путь без подсказки."}
        </Lead>
        <TypeCards>
          <TypeCard
            badge={"артефакт"}
            title={"Что предъявить"}
            code={"reproducible artifact"}
          >
            {"SQL, migration, script, plan, backup report или cache lab сохранены в репозитории."}
          </TypeCard>
          <TypeCard
            badge={"проверка"}
            badgeTone={"float"}
            title={"Что доказать"}
            code={"success + failure"}
          >
            {"Успешный и ошибочный сценарии дают ожидаемый наблюдаемый результат."}
          </TypeCard>
          <TypeCard
            badge={"защита"}
            badgeTone={"str"}
            title={"Что объяснить"}
            code={"decision + trade-off"}
          >
            {"Выбор связан с требованиями проекта и имеет названную цену."}
          </TypeCard>
        </TypeCards>
        <div className="lesson-check-group">
          <QuizCard
            question={"Что такое baseline?"}
            options={[
              "Исходное измерение до изменения",
              "Название индекса",
              "Копия таблицы",
            ]}
            correctIndex={0}
            explanation={"Baseline нужен для честного сравнения до и после оптимизации."}
          />
          <QuizCard
            question={"Почему маленькая таблица опасна для эксперимента?"}
            options={[
              "Она может скрыть дорогой способ чтения",
              "PostgreSQL не умеет читать маленькие таблицы",
              "LIMIT запрещён",
            ]}
            correctIndex={0}
            explanation={"На малом объёме даже полный просмотр может казаться мгновенным."}
          />
          <QuizCard
            question={"Что описывает селективность?"}
            options={[
              "Долю строк, подходящих под условие",
              "Число колонок таблицы",
              "Версию PostgreSQL",
            ]}
            correctIndex={0}
            explanation={"Чем меньше подходящих строк, тем выше селективность фильтра."}
          />
          <QuizCard
            question={"Что сначала измерять при подозрении на SQL?"}
            options={[
              "Сам воспроизводимый запрос",
              "Цвет кнопки Swagger",
              "Количество Python-файлов",
            ]}
            correctIndex={0}
            explanation={"Изоляция запроса уменьшает область поиска причины."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>{"Медленный endpoint и медленный SQL — не одно утверждение."}</>,
            <>{"Benchmark фиксирует SQL, параметры, объём данных и число повторов."}</>,
            <>{"Маленькая таблица может скрыть линейное чтение."}</>,
            <>{"Селективность показывает долю строк, подходящих под фильтр."}</>,
            <>{"Baseline сохраняется до создания индекса."}</>,
            <>{"Оптимизация должна улучшать измеримый проектный сценарий."}</>,
          ]}
        />
        <PracticeCta text={"Создайте воспроизводимые 100000 задач, измерьте проектный SELECT пять раз и запишите baseline в docs/query-baseline.md."} />
        <div className="lesson-practice-steps">
          <h3>{"Критерий готовности"}</h3>
          <p>{"Есть воспроизводимый артефакт, успешная проверка, ожидаемый сбой, объяснение результата и отдельный осмысленный Git-коммит."}</p>
        </div>
      </Section>
    </RichLesson>
  );
}

// 136. Одиночные и составные индексы
export function Lesson136({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Одиночные и составные индексы"}
        intro={"Спроектируем индекс не «на всякий случай», а под конкретный pattern: фильтрацию задач по владельцу и статусу с выдачей последних записей без лишней сортировки."}
        tags={[
          {
            icon: <Layers size={14} />,
            label: "single и composite",
          },
          {
            icon: <GitFork size={14} />,
            label: "порядок колонок",
          },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong>
        {" "}
        {"Baseline уже показывает стоимость одного запроса. Теперь можно изменить структуру хранения и проверить, какую работу PostgreSQL сможет не выполнять."}
        {" "}
        <strong>{"Важно не перепутать:"}</strong>
        {" "}
        {"Индекс ускоряет некоторые чтения ценой места и более дорогих INSERT, UPDATE и DELETE. Индекс на каждую колонку не является стратегией."}
      </Callout>
      <Section number={"01"} title={"Проблема и маршрут занятия"}>
        <Lead>
          {"Спроектируем индекс не «на всякий случай», а под конкретный pattern: фильтрацию задач по владельцу и статусу с выдачей последних записей без лишней сортировки."}
        </Lead>
        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Назвать query pattern."}</strong>
              {" "}
              {"какие фильтры, сортировка и ограничение повторяются в приложении."}
            </li>
            <li>
              <strong>{"Выбрать колонки."}</strong>
              {" "}
              {"индекс начинается с условий, которые реально ограничивают набор."}
            </li>
            <li>
              <strong>{"Учесть порядок."}</strong>
              {" "}
              {"составной индекс поддерживает не все перестановки колонок одинаково."}
            </li>
            <li>
              <strong>{"Проверить цену."}</strong>
              {" "}
              {"после миграции повторить чтение и не забыть про записи и размер индекса."}
            </li>
          </ol>
          <p>{"Результат занятия становится частью общего аудита PostgreSQL StudyHub."}</p>
        </div>
        <TypeCards>
          <TypeCard
            badge={"таблица"}
            title={"Основные данные"}
            code={"tasks"}
          >
            {"Строки tasks остаются источником истины."}
          </TypeCard>
          <TypeCard
            badge={"индекс"}
            badgeTone={"float"}
            title={"Дополнительный маршрут"}
            code={"idx_tasks_owner_done_created"}
          >
            {"Отдельная структура хранит ключи и ссылки на строки."}
          </TypeCard>
          <TypeCard
            badge={"цена"}
            badgeTone={"str"}
            title={"Запись и место"}
            code={"INSERT + index maintenance"}
          >
            {"Каждое изменение индексируемых полей обновляет и индекс."}
          </TypeCard>
        </TypeCards>
        <Callout tone="info">
          {"Сначала сформулируйте наблюдаемую проблему и критерий успеха. Инструмент появляется только после этого."}
        </Callout>
      </Section>
      <Section number={"02"} title={"Главная модель и термины"}>
        <Lead>
          {"Baseline уже показывает стоимость одного запроса. Теперь можно изменить структуру хранения и проверить, какую работу PostgreSQL сможет не выполнять."}
        </Lead>
        <MethodGrid
          rows={[
            [<>{"single-column"}</>, "поддерживает поиск или порядок по одной колонке"],
            [<>{"unique index"}</>, "ускоряет поиск и гарантирует отсутствие повторяющихся ключей"],
            [<>{"composite index"}</>, "хранит несколько колонок в заданном порядке"],
            [<>{"leftmost prefix"}</>, "индекс особенно полезен для условий, начинающихся с первых колонок"],
            [<>{"DESC в индексе"}</>, "может поддержать требуемое направление сортировки"],
          ]}
        />
        <CodeBlock
          caption={"query pattern блока"}
          code={[
          "SELECT id, title, created_at",
          "FROM tasks",
          "WHERE owner_id = 42",
          "  AND is_done = false",
          "ORDER BY created_at DESC",
          "LIMIT 50;",
        ] .join(String.fromCharCode(10))}
        />
        <RecallCard
          question={"Объясните главную модель этого раздела без терминов из документации."}
          hint={"Назовите вход, выполняемую работу и наблюдаемый результат."}
          answer={
            <p>{"Индекс ускоряет некоторые чтения ценой места и более дорогих INSERT, UPDATE и DELETE. Индекс на каждую колонку не является стратегией."}</p>
          }
        />
      </Section>
      <Section number={"03"} title={"Как порядок индекса следует за запросом"}>
        <Lead>
          {"Сначала PostgreSQL группирует записи владельца, внутри владельца — статус, затем хранит created_at в нужном порядке. Это не универсальный индекс, а маршрут для конкретного семейства запросов."}
        </Lead>
        <StepThrough
          code={[
          "CREATE INDEX idx_tasks_owner_done_created",
          "ON tasks (owner_id, is_done, created_at DESC);",
        ] .join(String.fromCharCode(10))}
          steps={[
            {
              line: 0,
              note: "Создаётся отдельная структура с понятным именем.",
              vars: {"name": "idx_tasks_owner_done_created"},
            },
            {
              line: 1,
              note: "Первая колонка поддерживает запросы конкретного владельца.",
              vars: {"prefix": "owner_id"},
            },
            {
              line: 1,
              note: "Вторая колонка уточняет статус внутри владельца.",
              vars: {"prefix": "owner_id, is_done"},
            },
            {
              line: 1,
              note: "created_at DESC совпадает с сортировкой выдачи.",
              vars: {"order": "newest first"},
            },
          ]}
        />
        <Callout tone="info">
          {"Пошаговый разбор нужен не для запоминания вывода, а для объяснения причин каждого перехода."}
        </Callout>
        <TrueFalse
          statement={<>{"Индекс ускоряет некоторые чтения ценой места и более дорогих INSERT, UPDATE и DELETE. Индекс на каждую колонку не является стратегией."}</>}
          isTrue={true}
          explanation={"Это ключевая граница урока: без неё инструмент легко применить механически."}
        />
      </Section>
      <Section number={"04"} title={"Соедините запрос и подходящий индекс"}>
        <Lead>
          {"Сейчас нужно не копировать готовую команду, а выбрать ветку или структуру по требованиям конкретного сценария."}
        </Lead>
        <MatchPairs
          prompt={"Соедините запрос и подходящий индекс"}
          pairs={[
            { left: "WHERE email = ?", right: "UNIQUE (email)" },
            { left: "WHERE owner_id = ?", right: "(owner_id)" },
            { left: "WHERE owner_id = ? AND is_done = ? ORDER BY created_at DESC", right: "(owner_id, is_done, created_at DESC)" },
            { left: "WHERE is_done = false для 75% таблицы", right: "индекс может не дать выигрыша" },
          ]}
          explanation={"Пары связывают требование с подходящей структурой или решением."}
        />
        <Callout>
          {"После выбора проговорите, какое условие изменило решение и какой альтернативный результат был бы возможен."}
        </Callout>
      </Section>
      <Section number={"05"} title={"Сравнение решений и цена выбора"}>
        <Lead>
          {"Два варианта могут быть синтаксически корректны, но только один соответствует измеряемому query pattern, модели данных или эксплуатационной процедуре."}
        </Lead>
        <CompareSolutions
          question={"Какой индекс точнее поддерживает основной запрос блока?"}
          left={{
            title: "Колонки в случайном порядке",
            code: [
          "CREATE INDEX idx_bad",
          "ON tasks (created_at, is_done, owner_id);",
        ] .join(String.fromCharCode(10)),
            note: "Запрос не ограничивает created_at первым условием, поэтому leftmost prefix не совпадает с pattern.",
          }}
          right={{
            title: "Порядок от фильтра к сортировке",
            code: [
          "CREATE INDEX idx_tasks_owner_done_created",
          "ON tasks (owner_id, is_done, created_at DESC);",
        ] .join(String.fromCharCode(10)),
            note: "Первые колонки совпадают с равенствами WHERE, последняя — с ORDER BY.",
          }}
          preferred={"right"}
          explanation={"Составной индекс проектируется по повторяющемуся запросу, а порядок колонок входит в его контракт."}
        />
        <TrueFalse
          statement={<>{"Корректный синтаксис сам по себе ещё не доказывает, что решение подходит проектному сценарию."}</>}
          isTrue={true}
          explanation={"Решение оценивается по query pattern, модели данных, измерению и эксплуатационной цене."}
        />
        <div className="lesson-practice-steps">
          <h3>{"Вопрос перед изменением"}</h3>
          <p>{"Какую конкретную работу перестанет выполнять система или какую гарантию добавит выбранный вариант?"}</p>
          <h3>{"Вопрос после изменения"}</h3>
          <p>{"Каким измерением, plan, smoke test или наблюдаемым сценарием подтверждается результат?"}</p>
          <h3>{"Граница"}</h3>
          <p>{"Индекс ускоряет некоторые чтения ценой места и более дорогих INSERT, UPDATE и DELETE. Индекс на каждую колонку не является стратегией."}</p>
        </div>
      </Section>
      <Section number={"06"} title={"Индекс через Alembic"}>
        <Lead>
          {"Структура базы должна меняться миграцией. В upgrade создаём индекс, в downgrade удаляем именно его, затем повторяем baseline из предыдущего урока."}
        </Lead>
        <CodeBlock
          caption={"alembic revision"}
          code={[
          "from alembic import op",
          "import sqlalchemy as sa",
          "",
          "",
          "def upgrade() -> None:",
          "    op.create_index(",
          "        \"idx_tasks_owner_done_created\",",
          "        \"tasks\",",
          "        [\"owner_id\", \"is_done\", sa.desc(\"created_at\")],",
          "        unique=False,",
          "    )",
          "",
          "",
          "def downgrade() -> None:",
          "    op.drop_index(",
          "        \"idx_tasks_owner_done_created\",",
          "        table_name=\"tasks\",",
          "    )",
        ] .join(String.fromCharCode(10))}
        />
        <TerminalDemo
          title={"проверка в терминале"}
          lines={[
            { cmd: "alembic revision -m \"add tasks owner status created index\"" },
            { cmd: "alembic upgrade head" },
            { cmd: "psql \"$DATABASE_URL\" -c \"\\d tasks\"" },
            { out: "Indexes: idx_tasks_owner_done_created" },
            { cmd: "psql \"$DATABASE_URL\" -f sql-lab/135_baseline.sql" },
            { out: "Time: 1.684 ms" },
          ]}
        />
        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Зафиксируйте входные данные, версию команды и ожидаемый наблюдаемый результат."}</p>
          <h3>{"После запуска"}</h3>
          <p>{"Сохраните фактический вывод, сравните его с ожиданием и объясните расхождение."}</p>
          <h3>{"Перед коммитом"}</h3>
          <p>{"Повторите успешный и ошибочный сценарий из чистого состояния."}</p>
        </div>
        <Callout tone="info">
          {"Проектный артефакт должен запускаться повторно: SQL-файл, migration, script, test или runbook сохраняется в репозитории."}
        </Callout>
      </Section>
      <Section number={"07"} title={"Диагностика ошибки и объяснение результата"}>
        <Lead>
          {"Профессиональный сценарий включает не только успех. Найдите ошибочное предположение, исправьте минимальную часть и повторите прежнюю проверку."}
        </Lead>
        <MethodGrid
          rows={[
            [<>{"наблюдение"}</>, "записать точный вывод, plan, row count или cache result"],
            [<>{"ожидание"}</>, "назвать результат, который считался правильным"],
            [<>{"расхождение"}</>, "найти первое место, где факт перестал совпадать с ожиданием"],
            [<>{"минимальное исправление"}</>, "изменить одну причину и повторить прежнюю проверку"],
          ]}
        />
        <BugHunt
          code={[
          "CREATE INDEX idx_tasks_everything",
          "ON tasks (id, title, owner_id, is_done, created_at);",
        ] .join(String.fromCharCode(10))}
          question={"Почему «добавим все колонки» — плохое решение?"}
          options={[
            "Индекс большой, дорогой при записи и не следует query pattern",
            "PostgreSQL разрешает только две колонки",
            "Индекс обязан быть UNIQUE",
          ]}
          correctIndex={0}
          explanation={"Широкий индекс занимает место и усложняет записи, но первые колонки id/title не помогают основному фильтру."}
          fix={[
          "CREATE INDEX idx_tasks_owner_done_created",
          "ON tasks (owner_id, is_done, created_at DESC);",
        ] .join(String.fromCharCode(10))}
        />
        <RecallCard
          question={"Почему два отдельных индекса owner_id и is_done не всегда заменяют один составной?"}
          answer={
            <p>{"PostgreSQL может комбинировать индексы, но составной индекс сразу хранит нужный совместный порядок и может лучше поддерживать фильтр плюс сортировку."}</p>
          }
        />
        <Callout>
          {"Не скрывайте ошибку новой технологией. Сначала назовите нарушенное ожидание, затем покажите проверяемое исправление."}
        </Callout>
      </Section>
      <Section number={"08"} title={"Контрольная точка и практика"}>
        <Lead>
          {"Урок завершён, когда вы можете воспроизвести сценарий, объяснить выбранный инструмент и показать отрицательный путь без подсказки."}
        </Lead>
        <TypeCards>
          <TypeCard
            badge={"артефакт"}
            title={"Что предъявить"}
            code={"reproducible artifact"}
          >
            {"SQL, migration, script, plan, backup report или cache lab сохранены в репозитории."}
          </TypeCard>
          <TypeCard
            badge={"проверка"}
            badgeTone={"float"}
            title={"Что доказать"}
            code={"success + failure"}
          >
            {"Успешный и ошибочный сценарии дают ожидаемый наблюдаемый результат."}
          </TypeCard>
          <TypeCard
            badge={"защита"}
            badgeTone={"str"}
            title={"Что объяснить"}
            code={"decision + trade-off"}
          >
            {"Выбор связан с требованиями проекта и имеет названную цену."}
          </TypeCard>
        </TypeCards>
        <div className="lesson-check-group">
          <QuizCard
            question={"Что является ценой индекса?"}
            options={[
              "Место и обслуживание при записи",
              "Запрет SELECT",
              "Удаление constraints",
            ]}
            correctIndex={0}
            explanation={"Индекс нужно обновлять вместе с данными."}
          />
          <QuizCard
            question={"Что означает leftmost prefix?"}
            options={[
              "Особую роль первых колонок составного индекса",
              "Первую строку таблицы",
              "Левый JOIN",
            ]}
            correctIndex={0}
            explanation={"Запрос обычно должен начинаться с первых колонок индекса."}
          />
          <QuizCard
            question={"Какой индекс поддерживает owner_id + is_done + created_at?"}
            options={[
              "(owner_id, is_done, created_at)",
              "(title)",
              "(created_at, id)",
            ]}
            correctIndex={0}
            explanation={"Порядок совпадает с фильтрами и сортировкой."}
          />
          <QuizCard
            question={"Где фиксировать индекс проекта?"}
            options={[
              "В Alembic migration",
              "Только в README",
              "В Pydantic schema",
            ]}
            correctIndex={0}
            explanation={"Изменение схемы должно быть воспроизводимым."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>{"Индекс — дополнительная структура, а не изменение самих строк."}</>,
            <>{"Single-column индекс решает узкий pattern одной колонки."}</>,
            <>{"Unique index одновременно ускоряет поиск и защищает уникальность."}</>,
            <>{"Порядок колонок составного индекса имеет значение."}</>,
            <>{"Индекс проектируется под WHERE и ORDER BY реального запроса."}</>,
            <>{"Каждый индекс увеличивает стоимость записей и занимает место."}</>,
          ]}
        />
        <PracticeCta text={"Создайте миграцию индекса (owner_id, is_done, created_at), примените её, повторите benchmark и сохраните измерения до/после."} />
        <div className="lesson-practice-steps">
          <h3>{"Критерий готовности"}</h3>
          <p>{"Есть воспроизводимый артефакт, успешная проверка, ожидаемый сбой, объяснение результата и отдельный осмысленный Git-коммит."}</p>
        </div>
      </Section>
    </RichLesson>
  );
}

// 137. EXPLAIN и EXPLAIN ANALYZE без магии
export function Lesson137({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"EXPLAIN и EXPLAIN ANALYZE без магии"}
        intro={"Научимся читать простой execution plan снизу вверх: отличать Seq Scan от Index Scan, сравнивать estimate с actual и понимать, почему planner иногда сознательно игнорирует индекс."}
        tags={[
          {
            icon: <Search size={14} />,
            label: "plan дерева",
          },
          {
            icon: <BarChart3 size={14} />,
            label: "estimate против actual",
          },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong>
        {" "}
        {"Индекс уже создан, но само его существование не доказывает использование. PostgreSQL planner выбирает план для конкретного запроса и распределения данных."}
        {" "}
        <strong>{"Важно не перепутать:"}</strong>
        {" "}
        {"EXPLAIN ANALYZE действительно выполняет запрос. Для INSERT, UPDATE и DELETE его запускают только в безопасной транзакции или на тестовой базе."}
      </Callout>
      <Section number={"01"} title={"Проблема и маршрут занятия"}>
        <Lead>
          {"Научимся читать простой execution plan снизу вверх: отличать Seq Scan от Index Scan, сравнивать estimate с actual и понимать, почему planner иногда сознательно игнорирует индекс."}
        </Lead>
        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Получить plan."}</strong>
              {" "}
              {"EXPLAIN показывает выбранные узлы без выполнения запроса."}
            </li>
            <li>
              <strong>{"Добавить actual."}</strong>
              {" "}
              {"EXPLAIN ANALYZE выполняет запрос и показывает реальные строки и время."}
            </li>
            <li>
              <strong>{"Читать снизу вверх."}</strong>
              {" "}
              {"нижний узел получает данные, верхние узлы фильтруют, сортируют и ограничивают."}
            </li>
            <li>
              <strong>{"Сравнить ожидание с фактом."}</strong>
              {" "}
              {"большой разрыв estimated/actual подсказывает проблему статистики или распределения."}
            </li>
          </ol>
          <p>{"Результат занятия становится частью общего аудита PostgreSQL StudyHub."}</p>
        </div>
        <TypeCards>
          <TypeCard
            badge={"Seq Scan"}
            title={"Последовательное чтение"}
            code={"Seq Scan on tasks"}
          >
            {"PostgreSQL рассматривает страницы таблицы по порядку."}
          </TypeCard>
          <TypeCard
            badge={"Index Scan"}
            badgeTone={"float"}
            title={"Маршрут по индексу"}
            code={"Index Scan using idx_..."}
          >
            {"Сначала находится ключ, затем нужные строки таблицы."}
          </TypeCard>
          <TypeCard
            badge={"actual"}
            badgeTone={"str"}
            title={"Факт выполнения"}
            code={"actual rows=50"}
          >
            {"Появляется только при ANALYZE."}
          </TypeCard>
        </TypeCards>
        <Callout tone="info">
          {"Сначала сформулируйте наблюдаемую проблему и критерий успеха. Инструмент появляется только после этого."}
        </Callout>
      </Section>
      <Section number={"02"} title={"Главная модель и термины"}>
        <Lead>
          {"Индекс уже создан, но само его существование не доказывает использование. PostgreSQL planner выбирает план для конкретного запроса и распределения данных."}
        </Lead>
        <MethodGrid
          rows={[
            [<>{"cost=0.00..123.45"}</>, "оценка planner, а не миллисекунды"],
            [<>{"rows=200"}</>, "ожидаемое количество строк узла"],
            [<>{"actual rows=50"}</>, "фактическое количество строк после выполнения"],
            [<>{"loops=1"}</>, "сколько раз узел был запущен родительским узлом"],
            [<>{"Planning/Execution Time"}</>, "раздельное время построения и выполнения plan"],
          ]}
        />
        <CodeBlock
          caption={"без выполнения и с выполнением"}
          code={[
          "EXPLAIN",
          "SELECT id, title",
          "FROM tasks",
          "WHERE owner_id = 42;",
          "",
          "EXPLAIN (ANALYZE, BUFFERS)",
          "SELECT id, title",
          "FROM tasks",
          "WHERE owner_id = 42;",
        ] .join(String.fromCharCode(10))}
        />
        <RecallCard
          question={"Объясните главную модель этого раздела без терминов из документации."}
          hint={"Назовите вход, выполняемую работу и наблюдаемый результат."}
          answer={
            <p>{"EXPLAIN ANALYZE действительно выполняет запрос. Для INSERT, UPDATE и DELETE его запускают только в безопасной транзакции или на тестовой базе."}</p>
          }
        />
      </Section>
      <Section number={"03"} title={"Читаем plan снизу вверх"}>
        <Lead>
          {"Нижний Index Scan получает строки конкретного владельца. Верхний Limit прекращает чтение после пятидесяти результатов. Вложенность показывает поток данных между операциями."}
        </Lead>
        <StepThrough
          code={[
          "Limit",
          "  -> Index Scan using idx_tasks_owner_done_created on tasks",
          "       Index Cond: (owner_id = 42 AND is_done = false)",
          "       actual rows=50 loops=1",
        ] .join(String.fromCharCode(10))}
          steps={[
            {
              line: 1,
              note: "Сначала выполняется нижний источник строк.",
              vars: {"node": "Index Scan"},
            },
            {
              line: 2,
              note: "Index Cond описывает часть условия, поддержанную индексом.",
              vars: {"condition": "owner_id + is_done"},
            },
            {
              line: 3,
              note: "actual rows показывает фактический поток строк.",
              vars: {"rows": "50"},
            },
            {
              line: 0,
              note: "Limit останавливает выдачу после нужного количества.",
              vars: {"output": "50 строк"},
            },
          ]}
        />
        <Callout tone="info">
          {"Пошаговый разбор нужен не для запоминания вывода, а для объяснения причин каждого перехода."}
        </Callout>
        <TrueFalse
          statement={<>{"EXPLAIN ANALYZE действительно выполняет запрос. Для INSERT, UPDATE и DELETE его запускают только в безопасной транзакции или на тестовой базе."}</>}
          isTrue={true}
          explanation={"Это ключевая граница урока: без неё инструмент легко применить механически."}
        />
      </Section>
      <Section number={"04"} title={"Почему planner выбирает разные узлы"}>
        <Lead>
          {"Сейчас нужно не копировать готовую команду, а выбрать ветку или структуру по требованиям конкретного сценария."}
        </Lead>
        <BranchExplorer
          code={[
          "if table_rows < 200:",
          "    choose(\"Seq Scan\")",
          "elif matched_fraction > 0.5:",
          "    choose(\"Seq Scan\")",
          "else:",
          "    choose(\"Index Scan\")",
        ] .join(String.fromCharCode(10))}
          scenarios={[
            { label: "маленькая таблица", activeLine: 1, output: "Seq Scan может быть дешевле" },
            { label: "подходит 75% строк", activeLine: 3, output: "Seq Scan избегает множества случайных обращений" },
            { label: "подходит 0.2% строк", activeLine: 5, output: "Index Scan сокращает объём чтения" },
          ]}
        />
        <Callout>
          {"После выбора проговорите, какое условие изменило решение и какой альтернативный результат был бы возможен."}
        </Callout>
      </Section>
      <Section number={"05"} title={"Сравнение решений и цена выбора"}>
        <Lead>
          {"Два варианта могут быть синтаксически корректны, но только один соответствует измеряемому query pattern, модели данных или эксплуатационной процедуре."}
        </Lead>
        <CompareSolutions
          question={"Какой вывод корректен после Seq Scan при существующем индексе?"}
          left={{
            title: "Индекс сломан",
            code: "Seq Scan on tasks",
            note: "Сам факт Seq Scan не доказывает проблему: таблица может быть маленькой или условие — низкоселективным.",
          }}
          right={{
            title: "Planner оценил полный просмотр дешевле",
            code: [
          "Seq Scan on tasks",
          "Filter: (is_done = false)",
        ] .join(String.fromCharCode(10)),
            note: "Нужно проверить объём, долю подходящих строк и actual, а не заставлять индекс без измерения.",
          }}
          preferred={"right"}
          explanation={"Planner сравнивает альтернативы для конкретной ситуации; Seq Scan иногда является правильным планом."}
        />
        <TrueFalse
          statement={<>{"Корректный синтаксис сам по себе ещё не доказывает, что решение подходит проектному сценарию."}</>}
          isTrue={true}
          explanation={"Решение оценивается по query pattern, модели данных, измерению и эксплуатационной цене."}
        />
        <div className="lesson-practice-steps">
          <h3>{"Вопрос перед изменением"}</h3>
          <p>{"Какую конкретную работу перестанет выполнять система или какую гарантию добавит выбранный вариант?"}</p>
          <h3>{"Вопрос после изменения"}</h3>
          <p>{"Каким измерением, plan, smoke test или наблюдаемым сценарием подтверждается результат?"}</p>
          <h3>{"Граница"}</h3>
          <p>{"EXPLAIN ANALYZE действительно выполняет запрос. Для INSERT, UPDATE и DELETE его запускают только в безопасной транзакции или на тестовой базе."}</p>
        </div>
      </Section>
      <Section number={"06"} title={"Plan до и после индекса"}>
        <Lead>
          {"Сохраняем два plan одного и того же SELECT: до миграции и после неё. Затем меняем только значение owner_id или селективность статуса и объясняем новый выбор planner."}
        </Lead>
        <CodeBlock
          caption={"sql-lab/137_explain.sql"}
          code={[
          "EXPLAIN (ANALYZE, BUFFERS)",
          "SELECT id, title, created_at",
          "FROM tasks",
          "WHERE owner_id = 42",
          "  AND is_done = false",
          "ORDER BY created_at DESC",
          "LIMIT 50;",
        ] .join(String.fromCharCode(10))}
        />
        <TerminalDemo
          title={"проверка в терминале"}
          lines={[
            { cmd: "psql \"$DATABASE_URL\" -f sql-lab/137_explain.sql" },
            { out: "Index Scan using idx_tasks_owner_done_created" },
            { out: "actual rows=50 loops=1" },
            { out: "Planning Time: 0.311 ms" },
            { out: "Execution Time: 0.892 ms" },
          ]}
        />
        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Зафиксируйте входные данные, версию команды и ожидаемый наблюдаемый результат."}</p>
          <h3>{"После запуска"}</h3>
          <p>{"Сохраните фактический вывод, сравните его с ожиданием и объясните расхождение."}</p>
          <h3>{"Перед коммитом"}</h3>
          <p>{"Повторите успешный и ошибочный сценарий из чистого состояния."}</p>
        </div>
        <Callout tone="info">
          {"Проектный артефакт должен запускаться повторно: SQL-файл, migration, script, test или runbook сохраняется в репозитории."}
        </Callout>
      </Section>
      <Section number={"07"} title={"Диагностика ошибки и объяснение результата"}>
        <Lead>
          {"Профессиональный сценарий включает не только успех. Найдите ошибочное предположение, исправьте минимальную часть и повторите прежнюю проверку."}
        </Lead>
        <MethodGrid
          rows={[
            [<>{"наблюдение"}</>, "записать точный вывод, plan, row count или cache result"],
            [<>{"ожидание"}</>, "назвать результат, который считался правильным"],
            [<>{"расхождение"}</>, "найти первое место, где факт перестал совпадать с ожиданием"],
            [<>{"минимальное исправление"}</>, "изменить одну причину и повторить прежнюю проверку"],
          ]}
        />
        <BugHunt
          code={[
          "EXPLAIN ANALYZE",
          "DELETE FROM tasks",
          "WHERE owner_id = 42;",
        ] .join(String.fromCharCode(10))}
          question={"Почему такой эксперимент опасен на рабочей базе?"}
          options={[
            "ANALYZE выполнит DELETE по-настоящему",
            "EXPLAIN запрещён для DELETE",
            "DELETE всегда делает rollback",
          ]}
          correctIndex={0}
          explanation={"EXPLAIN ANALYZE запускает statement и собирает фактические метрики."}
          fix={[
          "BEGIN;",
          "EXPLAIN ANALYZE",
          "DELETE FROM tasks",
          "WHERE owner_id = 42;",
          "ROLLBACK;",
        ] .join(String.fromCharCode(10))}
        />
        <RecallCard
          question={"Почему cost нельзя читать как миллисекунды?"}
          answer={
            <p>{"Cost — внутренняя относительная оценка planner для сравнения вариантов. Реальное время появляется в actual time при EXPLAIN ANALYZE."}</p>
          }
        />
        <Callout>
          {"Не скрывайте ошибку новой технологией. Сначала назовите нарушенное ожидание, затем покажите проверяемое исправление."}
        </Callout>
      </Section>
      <Section number={"08"} title={"Контрольная точка и практика"}>
        <Lead>
          {"Урок завершён, когда вы можете воспроизвести сценарий, объяснить выбранный инструмент и показать отрицательный путь без подсказки."}
        </Lead>
        <TypeCards>
          <TypeCard
            badge={"артефакт"}
            title={"Что предъявить"}
            code={"reproducible artifact"}
          >
            {"SQL, migration, script, plan, backup report или cache lab сохранены в репозитории."}
          </TypeCard>
          <TypeCard
            badge={"проверка"}
            badgeTone={"float"}
            title={"Что доказать"}
            code={"success + failure"}
          >
            {"Успешный и ошибочный сценарии дают ожидаемый наблюдаемый результат."}
          </TypeCard>
          <TypeCard
            badge={"защита"}
            badgeTone={"str"}
            title={"Что объяснить"}
            code={"decision + trade-off"}
          >
            {"Выбор связан с требованиями проекта и имеет названную цену."}
          </TypeCard>
        </TypeCards>
        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает обычный EXPLAIN?"}
            options={[
              "Показывает план без выполнения SELECT",
              "Создаёт индекс",
              "Удаляет статистику",
            ]}
            correctIndex={0}
            explanation={"Обычный EXPLAIN показывает оценочный план."}
          />
          <QuizCard
            question={"Что добавляет ANALYZE?"}
            options={[
              "Фактическое выполнение и actual metrics",
              "Шифрование запроса",
              "Автоматический индекс",
            ]}
            correctIndex={0}
            explanation={"Запрос выполняется и план дополняется фактическими данными."}
          />
          <QuizCard
            question={"Почему planner может выбрать Seq Scan?"}
            options={[
              "Так дешевле для маленькой таблицы или большой доли строк",
              "Индекс никогда не используется",
              "WHERE написан заглавными буквами",
            ]}
            correctIndex={0}
            explanation={"Полный просмотр иногда объективно дешевле."}
          />
          <QuizCard
            question={"Что сравнивать для качества оценки?"}
            options={[
              "estimated rows и actual rows",
              "Имена Python-модулей",
              "Версию браузера",
            ]}
            correctIndex={0}
            explanation={"Разрыв показывает неточную оценку количества строк."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>{"EXPLAIN показывает оценочный план."}</>,
            <>{"EXPLAIN ANALYZE выполняет statement и добавляет фактические метрики."}</>,
            <>{"Execution plan читается от нижних источников к верхним операциям."}</>,
            <>{"Cost — относительная оценка, а не миллисекунды."}</>,
            <>{"Estimated rows нужно сравнивать с actual rows."}</>,
            <>{"Seq Scan может быть правильным выбором planner."}</>,
          ]}
        />
        <PracticeCta text={"Сохраните plan до/после индекса, измените селективность одного фильтра и письменно объясните, почему выбран Seq Scan или Index Scan."} />
        <div className="lesson-practice-steps">
          <h3>{"Критерий готовности"}</h3>
          <p>{"Есть воспроизводимый артефакт, успешная проверка, ожидаемый сбой, объяснение результата и отдельный осмысленный Git-коммит."}</p>
        </div>
      </Section>
    </RichLesson>
  );
}

// 138. Backup, restore и проверка восстановления
export function Lesson138({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Backup, restore и проверка восстановления"}
        intro={"Построим не просто команду pg_dump, а проверяемую процедуру: создадим backup, восстановим его в отдельную базу, сверим данные и запустим smoke tests."}
        tags={[
          {
            icon: <Save size={14} />,
            label: "pg_dump и pg_restore",
          },
          {
            icon: <ShieldCheck size={14} />,
            label: "restore drill",
          },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong>
        {" "}
        {"Миграции уже воспроизводят структуру PostgreSQL StudyHub, но они не возвращают пользовательские данные. Для потери данных нужна отдельная стратегия backup и restore."}
        {" "}
        <strong>{"Важно не перепутать:"}</strong>
        {" "}
        {"Файл backup не считается надёжным, пока его не удалось восстановить и проверить. Наличие архива и работоспособное восстановление — разные факты."}
      </Callout>
      <Section number={"01"} title={"Проблема и маршрут занятия"}>
        <Lead>
          {"Построим не просто команду pg_dump, а проверяемую процедуру: создадим backup, восстановим его в отдельную базу, сверим данные и запустим smoke tests."}
        </Lead>
        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Выбрать формат."}</strong>
              {" "}
              {"plain SQL удобно читать, custom format гибче восстанавливать через pg_restore."}
            </li>
            <li>
              <strong>{"Создать backup."}</strong>
              {" "}
              {"зафиксировать команду, время и источник."}
            </li>
            <li>
              <strong>{"Восстановить отдельно."}</strong>
              {" "}
              {"не проверять процедуру поверх единственной рабочей базы."}
            </li>
            <li>
              <strong>{"Подтвердить результат."}</strong>
              {" "}
              {"сверить таблицы, row counts и ключевые API-сценарии."}
            </li>
          </ol>
          <p>{"Результат занятия становится частью общего аудита PostgreSQL StudyHub."}</p>
        </div>
        <TypeCards>
          <TypeCard
            badge={"migration"}
            title={"История схемы"}
            code={"alembic upgrade head"}
          >
            {"Создаёт таблицы и индексы, но не возвращает реальные данные."}
          </TypeCard>
          <TypeCard
            badge={"backup"}
            badgeTone={"float"}
            title={"Снимок схемы и данных"}
            code={"pg_dump -Fc"}
          >
            {"Хранит состояние базы на момент создания."}
          </TypeCard>
          <TypeCard
            badge={"restore"}
            badgeTone={"str"}
            title={"Проверка восстановления"}
            code={"studyhub_restore_test"}
          >
            {"Разворачивает снимок в отдельной database и проходит smoke tests."}
          </TypeCard>
        </TypeCards>
        <Callout tone="info">
          {"Сначала сформулируйте наблюдаемую проблему и критерий успеха. Инструмент появляется только после этого."}
        </Callout>
      </Section>
      <Section number={"02"} title={"Главная модель и термины"}>
        <Lead>
          {"Миграции уже воспроизводят структуру PostgreSQL StudyHub, но они не возвращают пользовательские данные. Для потери данных нужна отдельная стратегия backup и restore."}
        </Lead>
        <MethodGrid
          rows={[
            [<>{"plain format"}</>, "SQL-текст; восстанавливается через psql"],
            [<>{"custom format"}</>, "архив pg_dump; восстанавливается через pg_restore"],
            [<>{"schema + data"}</>, "структура и строки на момент backup"],
            [<>{"restore target"}</>, "отдельная пустая database для проверки"],
            [<>{"smoke test"}</>, "короткий набор критических сценариев после restore"],
          ]}
        />
        <CodeBlock
          caption={"custom backup без пароля в истории shell"}
          code={[
          "export PGPASSWORD=\"$POSTGRES_PASSWORD\"",
          "pg_dump   --format=custom   --file=backups/studyhub.dump   \"$DATABASE_URL\"",
        ] .join(String.fromCharCode(10))}
        />
        <RecallCard
          question={"Объясните главную модель этого раздела без терминов из документации."}
          hint={"Назовите вход, выполняемую работу и наблюдаемый результат."}
          answer={
            <p>{"Файл backup не считается надёжным, пока его не удалось восстановить и проверить. Наличие архива и работоспособное восстановление — разные факты."}</p>
          }
        />
      </Section>
      <Section number={"03"} title={"Процедура считается завершённой после restore"}>
        <Lead>
          {"Архив проходит путь от рабочей базы до отдельной восстановленной базы. Только после проверки строк и API можно считать backup пригодным."}
        </Lead>
        <StepThrough
          code={[
          "PostgreSQL StudyHub",
          "  -> pg_dump",
          "  -> backups/studyhub.dump",
          "  -> createdb studyhub_restore_test",
          "  -> pg_restore",
          "  -> row counts + smoke tests",
        ] .join(String.fromCharCode(10))}
          steps={[
            {
              line: 0,
              note: "Источник должен быть явно назван и доступен.",
              vars: {"source": "studyhub"},
            },
            {
              line: 1,
              note: "pg_dump читает согласованное состояние базы.",
              vars: {"artifact": "dump"},
            },
            {
              line: 2,
              note: "Файл backup хранится отдельно от самой database.",
              vars: {"file": "studyhub.dump"},
            },
            {
              line: 3,
              note: "Создаётся отдельная цель восстановления.",
              vars: {"target": "studyhub_restore_test"},
            },
            {
              line: 4,
              note: "pg_restore разворачивает структуру и данные.",
              vars: {"restore": "running"},
            },
            {
              line: 5,
              note: "Проверки подтверждают пригодность результата.",
              vars: {"status": "verified"},
            },
          ]}
        />
        <Callout tone="info">
          {"Пошаговый разбор нужен не для запоминания вывода, а для объяснения причин каждого перехода."}
        </Callout>
        <TrueFalse
          statement={<>{"Файл backup не считается надёжным, пока его не удалось восстановить и проверить. Наличие архива и работоспособное восстановление — разные факты."}</>}
          isTrue={true}
          explanation={"Это ключевая граница урока: без неё инструмент легко применить механически."}
        />
      </Section>
      <Section number={"04"} title={"Соберите безопасный restore drill"}>
        <Lead>
          {"Сейчас нужно не копировать готовую команду, а выбрать ветку или структуру по требованиям конкретного сценария."}
        </Lead>
        <CodeSequence
          title={"Соберите безопасный restore drill"}
          prompt={"Расположите действия в безопасном порядке."}
          pieces={[
            { id: "dump", code: "создать custom backup" },
            { id: "db", code: "создать пустую studyhub_restore_test" },
            { id: "restore", code: "выполнить pg_restore" },
            { id: "counts", code: "сверить row counts" },
            { id: "smoke", code: "запустить smoke tests" },
            { id: "prod", code: "восстановить поверх production", note: "опасный шаг" },
          ]}
          correctOrder={["dump", "db", "restore", "counts", "smoke"]}
          explanation={"Проверка идёт в отдельной базе и заканчивается наблюдаемыми проверками данных и приложения."}
        />
        <Callout>
          {"После выбора проговорите, какое условие изменило решение и какой альтернативный результат был бы возможен."}
        </Callout>
      </Section>
      <Section number={"05"} title={"Сравнение решений и цена выбора"}>
        <Lead>
          {"Два варианта могут быть синтаксически корректны, но только один соответствует измеряемому query pattern, модели данных или эксплуатационной процедуре."}
        </Lead>
        <CompareSolutions
          question={"Что подтверждает готовность к восстановлению?"}
          left={{
            title: "Файл существует",
            code: "ls -lh backups/studyhub.dump",
            note: "Мы знаем только размер и дату файла, но не знаем, читается ли он и полон ли набор данных.",
          }}
          right={{
            title: "Restore drill прошёл",
            code: [
          "pg_restore ... studyhub_restore_test",
          "pytest tests/smoke",
        ] .join(String.fromCharCode(10)),
            note: "Архив развёрнут в отдельную базу, строки сверены, критические сценарии работают.",
          }}
          preferred={"right"}
          explanation={"Надёжность backup подтверждается успешным восстановлением, а не самим фактом наличия файла."}
        />
        <TrueFalse
          statement={<>{"Корректный синтаксис сам по себе ещё не доказывает, что решение подходит проектному сценарию."}</>}
          isTrue={true}
          explanation={"Решение оценивается по query pattern, модели данных, измерению и эксплуатационной цене."}
        />
        <div className="lesson-practice-steps">
          <h3>{"Вопрос перед изменением"}</h3>
          <p>{"Какую конкретную работу перестанет выполнять система или какую гарантию добавит выбранный вариант?"}</p>
          <h3>{"Вопрос после изменения"}</h3>
          <p>{"Каким измерением, plan, smoke test или наблюдаемым сценарием подтверждается результат?"}</p>
          <h3>{"Граница"}</h3>
          <p>{"Файл backup не считается надёжным, пока его не удалось восстановить и проверить. Наличие архива и работоспособное восстановление — разные факты."}</p>
        </div>
      </Section>
      <Section number={"06"} title={"Runbook восстановления StudyHub"}>
        <Lead>
          {"Команды должны быть воспроизводимы другим разработчиком. В README фиксируем prerequisites, переменные, создание цели, restore, проверку и очистку тестовой базы."}
        </Lead>
        <CodeBlock
          caption={"scripts/restore_check.sh"}
          code={[
          "set -euo pipefail",
          "",
          "createdb studyhub_restore_test",
          "pg_restore   --no-owner   --dbname=studyhub_restore_test   backups/studyhub.dump",
          "",
          "psql studyhub_restore_test   -c \"SELECT COUNT(*) FROM tasks;\"",
          "",
          "TEST_DATABASE_URL=postgresql://localhost/studyhub_restore_test   pytest tests/smoke -q",
        ] .join(String.fromCharCode(10))}
        />
        <TerminalDemo
          title={"проверка в терминале"}
          lines={[
            { cmd: "pg_dump -Fc -f backups/studyhub.dump \"$DATABASE_URL\"" },
            { cmd: "createdb studyhub_restore_test" },
            { cmd: "pg_restore --no-owner -d studyhub_restore_test backups/studyhub.dump" },
            { cmd: "psql studyhub_restore_test -c \"SELECT COUNT(*) FROM tasks\"" },
            { out: "100000" },
            { cmd: "TEST_DATABASE_URL=postgresql://localhost/studyhub_restore_test pytest tests/smoke -q" },
            { out: "5 passed" },
          ]}
        />
        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Зафиксируйте входные данные, версию команды и ожидаемый наблюдаемый результат."}</p>
          <h3>{"После запуска"}</h3>
          <p>{"Сохраните фактический вывод, сравните его с ожиданием и объясните расхождение."}</p>
          <h3>{"Перед коммитом"}</h3>
          <p>{"Повторите успешный и ошибочный сценарий из чистого состояния."}</p>
        </div>
        <Callout tone="info">
          {"Проектный артефакт должен запускаться повторно: SQL-файл, migration, script, test или runbook сохраняется в репозитории."}
        </Callout>
      </Section>
      <Section number={"07"} title={"Диагностика ошибки и объяснение результата"}>
        <Lead>
          {"Профессиональный сценарий включает не только успех. Найдите ошибочное предположение, исправьте минимальную часть и повторите прежнюю проверку."}
        </Lead>
        <MethodGrid
          rows={[
            [<>{"наблюдение"}</>, "записать точный вывод, plan, row count или cache result"],
            [<>{"ожидание"}</>, "назвать результат, который считался правильным"],
            [<>{"расхождение"}</>, "найти первое место, где факт перестал совпадать с ожиданием"],
            [<>{"минимальное исправление"}</>, "изменить одну причину и повторить прежнюю проверку"],
          ]}
        />
        <BugHunt
          code={"pg_restore   --dbname=studyhub   backups/studyhub.dump"}
          question={"Какая главная ошибка в учебной проверке?"}
          options={[
            "Restore выполняется прямо в рабочую database",
            "pg_restore не поддерживает custom format",
            "Имя файла слишком длинное",
          ]}
          correctIndex={0}
          explanation={"Проверку нельзя проводить поверх единственной рабочей базы: ошибка может повредить или смешать данные."}
          fix={[
          "createdb studyhub_restore_test",
          "pg_restore   --no-owner   --dbname=studyhub_restore_test   backups/studyhub.dump",
        ] .join(String.fromCharCode(10))}
        />
        <RecallCard
          question={"Чем migration отличается от backup?"}
          answer={
            <p>{"Migration описывает изменение схемы между версиями. Backup хранит состояние схемы и данных на конкретный момент и нужен для восстановления после потери."}</p>
          }
        />
        <Callout>
          {"Не скрывайте ошибку новой технологией. Сначала назовите нарушенное ожидание, затем покажите проверяемое исправление."}
        </Callout>
      </Section>
      <Section number={"08"} title={"Контрольная точка и практика"}>
        <Lead>
          {"Урок завершён, когда вы можете воспроизвести сценарий, объяснить выбранный инструмент и показать отрицательный путь без подсказки."}
        </Lead>
        <TypeCards>
          <TypeCard
            badge={"артефакт"}
            title={"Что предъявить"}
            code={"reproducible artifact"}
          >
            {"SQL, migration, script, plan, backup report или cache lab сохранены в репозитории."}
          </TypeCard>
          <TypeCard
            badge={"проверка"}
            badgeTone={"float"}
            title={"Что доказать"}
            code={"success + failure"}
          >
            {"Успешный и ошибочный сценарии дают ожидаемый наблюдаемый результат."}
          </TypeCard>
          <TypeCard
            badge={"защита"}
            badgeTone={"str"}
            title={"Что объяснить"}
            code={"decision + trade-off"}
          >
            {"Выбор связан с требованиями проекта и имеет названную цену."}
          </TypeCard>
        </TypeCards>
        <div className="lesson-check-group">
          <QuizCard
            question={"Что восстанавливает Alembic migration?"}
            options={[
              "Структуру и её изменения",
              "Все пользовательские строки",
              "Файлы вложений автоматически",
            ]}
            correctIndex={0}
            explanation={"Migration воспроизводит схему, а не снимок данных."}
          />
          <QuizCard
            question={"Как проверить backup безопасно?"}
            options={[
              "В отдельной database",
              "Поверх production",
              "Только командой ls",
            ]}
            correctIndex={0}
            explanation={"Изолированная цель не рискует рабочими данными."}
          />
          <QuizCard
            question={"Чем custom format удобен?"}
            options={[
              "Гибким pg_restore",
              "Он является Python-файлом",
              "Не содержит схемы",
            ]}
            correctIndex={0}
            explanation={"Custom dump управляется через pg_restore."}
          />
          <QuizCard
            question={"Что завершает restore drill?"}
            options={[
              "Row counts и smoke tests",
              "Создание пустого файла",
              "Новый Git branch",
            ]}
            correctIndex={0}
            explanation={"Нужно подтвердить данные и ключевое поведение приложения."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>{"Миграции и backup решают разные задачи."}</>,
            <>{"Custom format создаётся pg_dump и восстанавливается pg_restore."}</>,
            <>{"Restore проверяется в отдельной database."}</>,
            <>{"Файл backup без restore drill не считается проверенным."}</>,
            <>{"После восстановления сверяются данные и критические API-сценарии."}</>,
            <>{"Runbook должен быть понятен другому разработчику."}</>,
          ]}
        />
        <PracticeCta text={"Создайте custom backup StudyHub, восстановите его в studyhub_restore_test, сверяйте минимум три row count и запустите smoke tests."} />
        <div className="lesson-practice-steps">
          <h3>{"Критерий готовности"}</h3>
          <p>{"Есть воспроизводимый артефакт, успешная проверка, ожидаемый сбой, объяснение результата и отдельный осмысленный Git-коммит."}</p>
        </div>
      </Section>
    </RichLesson>
  );
}

// 139. MongoDB и документная модель
export function Lesson139({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"MongoDB и документная модель"}
        intro={"Рассмотрим MongoDB как отдельную модель, а не замену PostgreSQL по умолчанию: сохраним snapshot курса одним документом и сравним embed/reference с нормализованными таблицами."}
        tags={[
          {
            icon: <Boxes size={14} />,
            label: "document и BSON",
          },
          {
            icon: <GitFork size={14} />,
            label: "embed или reference",
          },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong>
        {" "}
        {"PostgreSQL StudyHub остаётся реляционным источником истины. MongoDB появляется как изолированный эксперимент, чтобы научиться выбирать форму хранения по единице чтения и изменения."}
        {" "}
        <strong>{"Важно не перепутать:"}</strong>
        {" "}
        {"Гибкая схема не означает отсутствие контракта. Форму документа всё равно защищают приложение, validation rules, тесты и миграция данных при изменении формата."}
      </Callout>
      <Section number={"01"} title={"Проблема и маршрут занятия"}>
        <Lead>
          {"Рассмотрим MongoDB как отдельную модель, а не замену PostgreSQL по умолчанию: сохраним snapshot курса одним документом и сравним embed/reference с нормализованными таблицами."}
        </Lead>
        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Определить документ."}</strong>
              {" "}
              {"выбрать данные, которые обычно читаются и обновляются как единое целое."}
            </li>
            <li>
              <strong>{"Выбрать embed/reference."}</strong>
              {" "}
              {"вложить небольшую связанную часть или хранить отдельную ссылку."}
            </li>
            <li>
              <strong>{"Проверить изменение."}</strong>
              {" "}
              {"понять цену дублирования и массового обновления копий."}
            </li>
            <li>
              <strong>{"Сравнить с PostgreSQL."}</strong>
              {" "}
              {"выбор делается по требованиям, а не по отсутствию JOIN."}
            </li>
          </ol>
          <p>{"Результат занятия становится частью общего аудита PostgreSQL StudyHub."}</p>
        </div>
        <TypeCards>
          <TypeCard
            badge={"database"}
            title={"База MongoDB"}
            code={"studyhub_lab"}
          >
            {"Содержит collections."}
          </TypeCard>
          <TypeCard
            badge={"collection"}
            badgeTone={"float"}
            title={"Набор документов"}
            code={"course_snapshots"}
          >
            {"Документы похожего назначения, но не обязаны быть байт-в-байт одинаковыми."}
          </TypeCard>
          <TypeCard
            badge={"document"}
            badgeTone={"str"}
            title={"Единица чтения"}
            code={"{course_id, modules: [...]}"}
          >
            {"BSON-объект с полями, массивами и вложенными документами."}
          </TypeCard>
        </TypeCards>
        <Callout tone="info">
          {"Сначала сформулируйте наблюдаемую проблему и критерий успеха. Инструмент появляется только после этого."}
        </Callout>
      </Section>
      <Section number={"02"} title={"Главная модель и термины"}>
        <Lead>
          {"PostgreSQL StudyHub остаётся реляционным источником истины. MongoDB появляется как изолированный эксперимент, чтобы научиться выбирать форму хранения по единице чтения и изменения."}
        </Lead>
        <MethodGrid
          rows={[
            [<>{"BSON"}</>, "бинарное представление документов с типами"],
            [<>{"embed"}</>, "связанные данные вложены и читаются одним документом"],
            [<>{"reference"}</>, "документ хранит идентификатор другого документа"],
            [<>{"duplication"}</>, "часть данных копируется ради удобного чтения"],
            [<>{"flexible schema"}</>, "разные документы могут иметь разные поля, но контракт всё равно нужен"],
          ]}
        />
        <CodeBlock
          caption={"snapshot курса как документ"}
          code={[
          "{",
          "  \"course_id\": 17,",
          "  \"title\": \"PostgreSQL StudyHub\",",
          "  \"version\": 3,",
          "  \"modules\": [",
          "    {",
          "      \"position\": 1,",
          "      \"title\": \"SQL\",",
          "      \"lesson_ids\": [117, 118, 119]",
          "    }",
          "  ]",
          "}",
        ] .join(String.fromCharCode(10))}
        />
        <RecallCard
          question={"Объясните главную модель этого раздела без терминов из документации."}
          hint={"Назовите вход, выполняемую работу и наблюдаемый результат."}
          answer={
            <p>{"Гибкая схема не означает отсутствие контракта. Форму документа всё равно защищают приложение, validation rules, тесты и миграция данных при изменении формата."}</p>
          }
        />
      </Section>
      <Section number={"03"} title={"Embed или reference зависит от жизненного цикла"}>
        <Lead>
          {"Небольшой snapshot курса читается целиком и не является живой моделью прав доступа. Его удобно вложить. Пользователь, который меняется независимо и используется во многих местах, обычно остаётся отдельной сущностью."}
        </Lead>
        <StepThrough
          code={[
          "course_snapshot = {",
          "    \"course_id\": 17,",
          "    \"title\": \"PostgreSQL StudyHub\",",
          "    \"modules\": [",
          "        {\"position\": 1, \"title\": \"SQL\"},",
          "        {\"position\": 2, \"title\": \"PostgreSQL\"},",
          "    ],",
          "}",
        ] .join(String.fromCharCode(10))}
          steps={[
            {
              line: 0,
              note: "Создаётся отдельный экспортный документ.",
              vars: {"purpose": "snapshot"},
            },
            {
              line: 1,
              note: "course_id связывает snapshot с источником в PostgreSQL.",
              vars: {"source": "PostgreSQL"},
            },
            {
              line: 2,
              note: "title дублируется осознанно для автономного чтения snapshot.",
              vars: {"duplication": "accepted"},
            },
            {
              line: 3,
              note: "modules вложены, потому что snapshot читается целиком.",
              vars: {"strategy": "embed"},
            },
          ]}
        />
        <Callout tone="info">
          {"Пошаговый разбор нужен не для запоминания вывода, а для объяснения причин каждого перехода."}
        </Callout>
        <TrueFalse
          statement={<>{"Гибкая схема не означает отсутствие контракта. Форму документа всё равно защищают приложение, validation rules, тесты и миграция данных при изменении формата."}</>}
          isTrue={true}
          explanation={"Это ключевая граница урока: без неё инструмент легко применить механически."}
        />
      </Section>
      <Section number={"04"} title={"Выберите embed или reference"}>
        <Lead>
          {"Сейчас нужно не копировать готовую команду, а выбрать ветку или структуру по требованиям конкретного сценария."}
        </Lead>
        <MatchPairs
          prompt={"Выберите embed или reference"}
          pairs={[
            { left: "небольшие modules внутри неизменяемого snapshot", right: "embed" },
            { left: "author profile используется тысячами документов", right: "reference" },
            { left: "address читается только вместе с order snapshot", right: "embed" },
            { left: "permission role меняется независимо", right: "reference" },
          ]}
          explanation={"Пары связывают требование с подходящей структурой или решением."}
        />
        <Callout>
          {"После выбора проговорите, какое условие изменило решение и какой альтернативный результат был бы возможен."}
        </Callout>
      </Section>
      <Section number={"05"} title={"Сравнение решений и цена выбора"}>
        <Lead>
          {"Два варианта могут быть синтаксически корректны, но только один соответствует измеряемому query pattern, модели данных или эксплуатационной процедуре."}
        </Lead>
        <CompareSolutions
          question={"Где лучше хранить живые задачи, категории, владельцев и транзакционные ограничения StudyHub?"}
          left={{
            title: "Перенести всё в один MongoDB document",
            code: "{user, tasks: [...], categories: [...]}",
            note: "Документ растёт, конкурентные изменения затрагивают одну крупную запись, а реляционные ограничения приходится переносить в приложение.",
          }}
          right={{
            title: "Оставить PostgreSQL источником истины",
            code: "users + tasks + categories + foreign keys",
            note: "Связи, уникальность, транзакции и отчётные запросы уже естественно выражены реляционной моделью.",
          }}
          preferred={"right"}
          explanation={"MongoDB полезна для подходящей единицы документа, но не отменяет преимущества PostgreSQL для текущего домена StudyHub."}
        />
        <TrueFalse
          statement={<>{"Корректный синтаксис сам по себе ещё не доказывает, что решение подходит проектному сценарию."}</>}
          isTrue={true}
          explanation={"Решение оценивается по query pattern, модели данных, измерению и эксплуатационной цене."}
        />
        <div className="lesson-practice-steps">
          <h3>{"Вопрос перед изменением"}</h3>
          <p>{"Какую конкретную работу перестанет выполнять система или какую гарантию добавит выбранный вариант?"}</p>
          <h3>{"Вопрос после изменения"}</h3>
          <p>{"Каким измерением, plan, smoke test или наблюдаемым сценарием подтверждается результат?"}</p>
          <h3>{"Граница"}</h3>
          <p>{"Гибкая схема не означает отсутствие контракта. Форму документа всё равно защищают приложение, validation rules, тесты и миграция данных при изменении формата."}</p>
        </div>
      </Section>
      <Section number={"06"} title={"Изолированный CRUD snapshot"}>
        <Lead>
          {"Эксперимент живёт в отдельной collection course_snapshots. Он не участвует в основном API и не становится вторым источником истины для задач или пользователей."}
        </Lead>
        <CodeBlock
          caption={"mongo_lab.py"}
          code={[
          "from pymongo import MongoClient",
          "",
          "client = MongoClient(\"mongodb://localhost:27017\")",
          "collection = client.studyhub_lab.course_snapshots",
          "",
          "snapshot = {",
          "    \"course_id\": 17,",
          "    \"title\": \"PostgreSQL StudyHub\",",
          "    \"version\": 3,",
          "    \"modules\": [",
          "        {\"position\": 1, \"title\": \"SQL\"},",
          "    ],",
          "}",
          "",
          "result = collection.insert_one(snapshot)",
          "loaded = collection.find_one({\"_id\": result.inserted_id})",
          "print(loaded[\"title\"])",
        ] .join(String.fromCharCode(10))}
        />
        <TerminalDemo
          title={"проверка в терминале"}
          lines={[
            { cmd: "python mongo_lab.py" },
            { out: "PostgreSQL StudyHub" },
            { cmd: "mongosh \"mongodb://localhost:27017/studyhub_lab\"" },
            { cmd: "db.course_snapshots.findOne({course_id: 17})" },
            { out: "{ course_id: 17, title: \"PostgreSQL StudyHub\", version: 3, ... }" },
          ]}
        />
        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Зафиксируйте входные данные, версию команды и ожидаемый наблюдаемый результат."}</p>
          <h3>{"После запуска"}</h3>
          <p>{"Сохраните фактический вывод, сравните его с ожиданием и объясните расхождение."}</p>
          <h3>{"Перед коммитом"}</h3>
          <p>{"Повторите успешный и ошибочный сценарий из чистого состояния."}</p>
        </div>
        <Callout tone="info">
          {"Проектный артефакт должен запускаться повторно: SQL-файл, migration, script, test или runbook сохраняется в репозитории."}
        </Callout>
      </Section>
      <Section number={"07"} title={"Диагностика ошибки и объяснение результата"}>
        <Lead>
          {"Профессиональный сценарий включает не только успех. Найдите ошибочное предположение, исправьте минимальную часть и повторите прежнюю проверку."}
        </Lead>
        <MethodGrid
          rows={[
            [<>{"наблюдение"}</>, "записать точный вывод, plan, row count или cache result"],
            [<>{"ожидание"}</>, "назвать результат, который считался правильным"],
            [<>{"расхождение"}</>, "найти первое место, где факт перестал совпадать с ожиданием"],
            [<>{"минимальное исправление"}</>, "изменить одну причину и повторить прежнюю проверку"],
          ]}
        />
        <BugHunt
          code={[
          "collection.insert_one({",
          "    \"course_id\": 17,",
          "    \"title\": \"StudyHub\",",
          "})",
          "",
          "collection.insert_one({",
          "    \"course_id\": \"seventeen\",",
          "    \"modules\": \"SQL\",",
          "})",
        ] .join(String.fromCharCode(10))}
          question={"Что демонстрирует второй документ?"}
          options={[
            "Гибкость без валидации допускает несовместимую форму",
            "MongoDB всегда преобразует строку в число",
            "Collection запрещает разные поля",
          ]}
          correctIndex={0}
          explanation={"Без validation contract collection принимает структуру, которую код может не уметь читать."}
          fix={[
          "snapshot = CourseSnapshot.model_validate(payload)",
          "collection.insert_one(snapshot.model_dump())",
        ] .join(String.fromCharCode(10))}
        />
        <RecallCard
          question={"Когда embed становится проблемой?"}
          answer={
            <p>{"Когда вложенная сущность часто меняется независимо, используется во многих документах или приводит к большому дублированию и массовому обновлению копий."}</p>
          }
        />
        <Callout>
          {"Не скрывайте ошибку новой технологией. Сначала назовите нарушенное ожидание, затем покажите проверяемое исправление."}
        </Callout>
      </Section>
      <Section number={"08"} title={"Контрольная точка и практика"}>
        <Lead>
          {"Урок завершён, когда вы можете воспроизвести сценарий, объяснить выбранный инструмент и показать отрицательный путь без подсказки."}
        </Lead>
        <TypeCards>
          <TypeCard
            badge={"артефакт"}
            title={"Что предъявить"}
            code={"reproducible artifact"}
          >
            {"SQL, migration, script, plan, backup report или cache lab сохранены в репозитории."}
          </TypeCard>
          <TypeCard
            badge={"проверка"}
            badgeTone={"float"}
            title={"Что доказать"}
            code={"success + failure"}
          >
            {"Успешный и ошибочный сценарии дают ожидаемый наблюдаемый результат."}
          </TypeCard>
          <TypeCard
            badge={"защита"}
            badgeTone={"str"}
            title={"Что объяснить"}
            code={"decision + trade-off"}
          >
            {"Выбор связан с требованиями проекта и имеет названную цену."}
          </TypeCard>
        </TypeCards>
        <div className="lesson-check-group">
          <QuizCard
            question={"Что является единицей хранения MongoDB?"}
            options={[
              "Документ",
              "SQL-строка",
              "Python-модуль",
            ]}
            correctIndex={0}
            explanation={"Collection содержит BSON-документы."}
          />
          <QuizCard
            question={"Когда embed особенно удобен?"}
            options={[
              "Связанные данные читаются и меняются как целое",
              "Сущность используется везде независимо",
              "Нужен внешний ключ PostgreSQL",
            ]}
            correctIndex={0}
            explanation={"Вложение соответствует общей единице жизненного цикла."}
          />
          <QuizCard
            question={"Что означает flexible schema?"}
            options={[
              "Форма может различаться, но контракт всё равно нужен",
              "Типы полностью исчезают",
              "Любые данные автоматически корректны",
            ]}
            correctIndex={0}
            explanation={"Гибкость требует осознанной валидации."}
          />
          <QuizCard
            question={"Что остаётся source of truth StudyHub?"}
            options={[
              "PostgreSQL",
              "Snapshot collection",
              "README",
            ]}
            correctIndex={0}
            explanation={"MongoDB используется только для изолированного эксперимента snapshot."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>{"MongoDB хранит BSON-документы в collections."}</>,
            <>{"Документ проектируется как единица совместного чтения и изменения."}</>,
            <>{"Embed уменьшает число чтений, но может увеличить дублирование."}</>,
            <>{"Reference подходит для независимо живущей сущности."}</>,
            <>{"Flexible schema не отменяет validation contract."}</>,
            <>{"PostgreSQL остаётся источником истины PostgreSQL StudyHub."}</>,
          ]}
        />
        <PracticeCta text={"Создайте отдельный course snapshot в MongoDB, выполните insert/find/update и составьте таблицу, почему live-задачи остаются в PostgreSQL."} />
        <div className="lesson-practice-steps">
          <h3>{"Критерий готовности"}</h3>
          <p>{"Есть воспроизводимый артефакт, успешная проверка, ожидаемый сбой, объяснение результата и отдельный осмысленный Git-коммит."}</p>
        </div>
      </Section>
    </RichLesson>
  );
}

// 140. Redis, TTL и итоговый аудит хранилищ
export function Lesson140({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Redis, TTL и итоговый аудит хранилищ"}
        intro={"Завершим этап key-value моделью Redis: пройдём cache hit/miss, TTL и истечение ключа, затем защитим карту данных StudyHub с явным источником истины для каждого сценария."}
        tags={[
          {
            icon: <KeyRound size={14} />,
            label: "key/value и TTL",
          },
          {
            icon: <Trophy size={14} />,
            label: "аудит хранилищ",
          },
        ]}
      />
      <Callout tone="info">
        <strong>{"Связь с курсом."}</strong>
        {" "}
        {"PostgreSQL хранит связанные долговечные данные, MongoDB показала документ как единицу хранения. Redis добавляет быстрые временные значения, которые допустимо потерять или восстановить из источника истины."}
        {" "}
        <strong>{"Важно не перепутать:"}</strong>
        {" "}
        {"Cache не становится источником истины только потому, что отвечает быстрее. Важное состояние должно иметь надёжное основное хранение или явную стратегию потери."}
      </Callout>
      <Section number={"01"} title={"Проблема и маршрут занятия"}>
        <Lead>
          {"Завершим этап key-value моделью Redis: пройдём cache hit/miss, TTL и истечение ключа, затем защитим карту данных StudyHub с явным источником истины для каждого сценария."}
        </Lead>
        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Назвать key."}</strong>
              {" "}
              {"ключ должен включать домен, идентификатор и версию формата."}
            </li>
            <li>
              <strong>{"Определить срок жизни."}</strong>
              {" "}
              {"TTL выражает момент, после которого значение больше нельзя считать свежим."}
            </li>
            <li>
              <strong>{"Спроектировать miss."}</strong>
              {" "}
              {"при отсутствии ключа данные берутся из PostgreSQL и кеш заполняется снова."}
            </li>
            <li>
              <strong>{"Защитить карту данных."}</strong>
              {" "}
              {"для каждого объекта назвать source of truth, допустимую потерю и способ восстановления."}
            </li>
          </ol>
          <p>{"Результат занятия становится частью общего аудита PostgreSQL StudyHub."}</p>
        </div>
        <TypeCards>
          <TypeCard
            badge={"key"}
            title={"Адрес значения"}
            code={"stats:user:42:v1"}
          >
            {"Строка вроде stats:user:42:v1."}
          </TypeCard>
          <TypeCard
            badge={"value"}
            badgeTone={"float"}
            title={"Сериализованные данные"}
            code={"{\"open\": 7}"}
          >
            {"Небольшое значение, которое быстро читается."}
          </TypeCard>
          <TypeCard
            badge={"TTL"}
            badgeTone={"str"}
            title={"Срок жизни"}
            code={"EX 60"}
          >
            {"После истечения Redis удаляет ключ или считает его отсутствующим."}
          </TypeCard>
        </TypeCards>
        <Callout tone="info">
          {"Сначала сформулируйте наблюдаемую проблему и критерий успеха. Инструмент появляется только после этого."}
        </Callout>
      </Section>
      <Section number={"02"} title={"Главная модель и термины"}>
        <Lead>
          {"PostgreSQL хранит связанные долговечные данные, MongoDB показала документ как единицу хранения. Redis добавляет быстрые временные значения, которые допустимо потерять или восстановить из источника истины."}
        </Lead>
        <MethodGrid
          rows={[
            [<>{"cache hit"}</>, "ключ найден, значение возвращается без запроса к source of truth"],
            [<>{"cache miss"}</>, "ключа нет; приложение читает PostgreSQL и заново заполняет cache"],
            [<>{"TTL"}</>, "время до автоматического истечения ключа"],
            [<>{"source of truth"}</>, "основное долговечное хранилище факта"],
            [<>{"invalidation"}</>, "удаление или обновление устаревшего cache после изменения данных"],
          ]}
        />
        <CodeBlock
          caption={"cache-aside маршрут"}
          code={[
          "cached = redis.get(\"stats:user:42:v1\")",
          "if cached is not None:",
          "    return json.loads(cached)",
          "",
          "stats = load_stats_from_postgresql(user_id=42)",
          "redis.setex(",
          "    \"stats:user:42:v1\",",
          "    60,",
          "    json.dumps(stats),",
          ")",
          "return stats",
        ] .join(String.fromCharCode(10))}
        />
        <RecallCard
          question={"Объясните главную модель этого раздела без терминов из документации."}
          hint={"Назовите вход, выполняемую работу и наблюдаемый результат."}
          answer={
            <p>{"Cache не становится источником истины только потому, что отвечает быстрее. Важное состояние должно иметь надёжное основное хранение или явную стратегию потери."}</p>
          }
        />
      </Section>
      <Section number={"03"} title={"Жизненный цикл ключа с TTL"}>
        <Lead>
          {"Ключ создаётся на ограниченное время. Пока TTL положителен, чтение может быть hit. После истечения приложение обязано корректно обработать miss и восстановить значение из PostgreSQL."}
        </Lead>
        <StepThrough
          code={[
          "SETEX stats:user:42:v1 60 '{\"open\":7}'",
          "TTL stats:user:42:v1",
          "GET stats:user:42:v1",
          "# ... прошло 60 секунд ...",
          "GET stats:user:42:v1",
        ] .join(String.fromCharCode(10))}
          steps={[
            {
              line: 0,
              note: "SETEX создаёт значение и TTL одним атомарным действием.",
              vars: {"ttl": "60"},
            },
            {
              line: 1,
              note: "TTL показывает оставшееся время жизни.",
              vars: {"remaining": "59...0"},
            },
            {
              line: 2,
              note: "До истечения чтение возвращает значение.",
              vars: {"result": "cache hit"},
            },
            {
              line: 3,
              note: "Время проходит без изменения PostgreSQL.",
              vars: {"redis": "expires"},
            },
            {
              line: 4,
              note: "После истечения GET возвращает nil.",
              vars: {"result": "cache miss"},
            },
          ]}
        />
        <Callout tone="info">
          {"Пошаговый разбор нужен не для запоминания вывода, а для объяснения причин каждого перехода."}
        </Callout>
        <TrueFalse
          statement={<>{"Cache не становится источником истины только потому, что отвечает быстрее. Важное состояние должно иметь надёжное основное хранение или явную стратегию потери."}</>}
          isTrue={true}
          explanation={"Это ключевая граница урока: без неё инструмент легко применить механически."}
        />
      </Section>
      <Section number={"04"} title={"Переверните карточки хранения"}>
        <Lead>
          {"Сейчас нужно не копировать готовую команду, а выбрать ветку или структуру по требованиям конкретного сценария."}
        </Lead>
        <FlipCards
          cards={[
            {
              front: <strong>{"PostgreSQL"}</strong>,
              back: <span>{"Связанные долговечные данные, constraints, transactions и source of truth."}</span>,
            },
            {
              front: <strong>{"MongoDB"}</strong>,
              back: <span>{"Документ как единица чтения; изолированный snapshot-эксперимент."}</span>,
            },
            {
              front: <strong>{"Redis"}</strong>,
              back: <span>{"Быстрые временные значения, TTL, cache и служебное состояние."}</span>,
            },
            {
              front: <strong>{"README/runbook"}</strong>,
              back: <span>{"Не хранилище данных, а инструкция по воспроизводимой эксплуатации."}</span>,
            },
          ]}
        />
        <Callout>
          {"После выбора проговорите, какое условие изменило решение и какой альтернативный результат был бы возможен."}
        </Callout>
      </Section>
      <Section number={"05"} title={"Сравнение решений и цена выбора"}>
        <Lead>
          {"Два варианта могут быть синтаксически корректны, но только один соответствует измеряемому query pattern, модели данных или эксплуатационной процедуре."}
        </Lead>
        <CompareSolutions
          question={"Где хранить единственный факт оплаты или право доступа пользователя?"}
          left={{
            title: "Только Redis с TTL",
            code: "SETEX access:user:42 3600 granted",
            note: "После истечения или потери Redis право исчезнет без надёжной истории и восстановления.",
          }}
          right={{
            title: "PostgreSQL как источник истины",
            code: [
          "user_permissions / subscriptions tables",
          "Redis — только ускоряющий cache",
        ] .join(String.fromCharCode(10)),
            note: "Долговечный факт хранится реляционно, кеш можно удалить и построить заново.",
          }}
          preferred={"right"}
          explanation={"Критичное состояние нельзя оставлять только в временном cache без отдельного source of truth."}
        />
        <TrueFalse
          statement={<>{"Корректный синтаксис сам по себе ещё не доказывает, что решение подходит проектному сценарию."}</>}
          isTrue={true}
          explanation={"Решение оценивается по query pattern, модели данных, измерению и эксплуатационной цене."}
        />
        <div className="lesson-practice-steps">
          <h3>{"Вопрос перед изменением"}</h3>
          <p>{"Какую конкретную работу перестанет выполнять система или какую гарантию добавит выбранный вариант?"}</p>
          <h3>{"Вопрос после изменения"}</h3>
          <p>{"Каким измерением, plan, smoke test или наблюдаемым сценарием подтверждается результат?"}</p>
          <h3>{"Граница"}</h3>
          <p>{"Cache не становится источником истины только потому, что отвечает быстрее. Важное состояние должно иметь надёжное основное хранение или явную стратегию потери."}</p>
        </div>
      </Section>
      <Section number={"06"} title={"Cached stats с явным miss"}>
        <Lead>
          {"Итоговый эксперимент кеширует вычисленную статистику пользователя на 60 секунд. При обновлении задачи ключ удаляется, а при потере Redis значение снова вычисляется из PostgreSQL."}
        </Lead>
        <CodeBlock
          caption={"services/stats.py"}
          code={[
          "import json",
          "",
          "",
          "def get_user_stats(redis, session, user_id: int) -> dict:",
          "    key = f\"stats:user:{user_id}:v1\"",
          "    cached = redis.get(key)",
          "    if cached is not None:",
          "        return json.loads(cached)",
          "",
          "    stats = calculate_stats(session, user_id)",
          "    redis.setex(key, 60, json.dumps(stats))",
          "    return stats",
          "",
          "",
          "def invalidate_user_stats(redis, user_id: int) -> None:",
          "    redis.delete(f\"stats:user:{user_id}:v1\")",
        ] .join(String.fromCharCode(10))}
        />
        <TerminalDemo
          title={"проверка в терминале"}
          lines={[
            { cmd: "redis-cli SETEX verify:user:42 30 843921" },
            { out: "OK" },
            { cmd: "redis-cli TTL verify:user:42" },
            { out: "27" },
            { cmd: "redis-cli GET verify:user:42" },
            { out: "\"843921\"" },
            { cmd: "redis-cli DEL verify:user:42" },
            { out: "(integer) 1" },
          ]}
        />
        <div className="lesson-practice-steps">
          <h3>{"До запуска"}</h3>
          <p>{"Зафиксируйте входные данные, версию команды и ожидаемый наблюдаемый результат."}</p>
          <h3>{"После запуска"}</h3>
          <p>{"Сохраните фактический вывод, сравните его с ожиданием и объясните расхождение."}</p>
          <h3>{"Перед коммитом"}</h3>
          <p>{"Повторите успешный и ошибочный сценарий из чистого состояния."}</p>
        </div>
        <Callout tone="info">
          {"Проектный артефакт должен запускаться повторно: SQL-файл, migration, script, test или runbook сохраняется в репозитории."}
        </Callout>
      </Section>
      <Section number={"07"} title={"Диагностика ошибки и объяснение результата"}>
        <Lead>
          {"Профессиональный сценарий включает не только успех. Найдите ошибочное предположение, исправьте минимальную часть и повторите прежнюю проверку."}
        </Lead>
        <MethodGrid
          rows={[
            [<>{"наблюдение"}</>, "записать точный вывод, plan, row count или cache result"],
            [<>{"ожидание"}</>, "назвать результат, который считался правильным"],
            [<>{"расхождение"}</>, "найти первое место, где факт перестал совпадать с ожиданием"],
            [<>{"минимальное исправление"}</>, "изменить одну причину и повторить прежнюю проверку"],
          ]}
        />
        <BugHunt
          code={[
          "def complete_task(task_id):",
          "    update_task_in_postgresql(task_id)",
          "    return {\"status\": \"done\"}",
          "",
          "# stats:user:42:v1 остаётся прежним до TTL",
        ] .join(String.fromCharCode(10))}
          question={"Почему пользователь может увидеть устаревшую статистику?"}
          options={[
            "После изменения source of truth cache не инвалидирован",
            "PostgreSQL не поддерживает UPDATE",
            "TTL всегда равен нулю",
          ]}
          correctIndex={0}
          explanation={"Cache-aside требует удалить или обновить зависимый ключ после изменения данных."}
          fix={[
          "def complete_task(redis, task_id, user_id):",
          "    update_task_in_postgresql(task_id)",
          "    redis.delete(f\"stats:user:{user_id}:v1\")",
          "    return {\"status\": \"done\"}",
        ] .join(String.fromCharCode(10))}
        />
        <RecallCard
          question={"Что должно произойти при полной потере Redis?"}
          answer={
            <p>{"Основные данные StudyHub остаются в PostgreSQL. Первый запрос получает cache miss, пересчитывает значение и заново заполняет Redis."}</p>
          }
        />
        <Callout>
          {"Не скрывайте ошибку новой технологией. Сначала назовите нарушенное ожидание, затем покажите проверяемое исправление."}
        </Callout>
      </Section>
      <Section number={"08"} title={"Контрольная точка и практика"}>
        <Lead>
          {"Урок завершён, когда вы можете воспроизвести сценарий, объяснить выбранный инструмент и показать отрицательный путь без подсказки."}
        </Lead>
        <TypeCards>
          <TypeCard
            badge={"артефакт"}
            title={"Что предъявить"}
            code={"reproducible artifact"}
          >
            {"SQL, migration, script, plan, backup report или cache lab сохранены в репозитории."}
          </TypeCard>
          <TypeCard
            badge={"проверка"}
            badgeTone={"float"}
            title={"Что доказать"}
            code={"success + failure"}
          >
            {"Успешный и ошибочный сценарии дают ожидаемый наблюдаемый результат."}
          </TypeCard>
          <TypeCard
            badge={"защита"}
            badgeTone={"str"}
            title={"Что объяснить"}
            code={"decision + trade-off"}
          >
            {"Выбор связан с требованиями проекта и имеет названную цену."}
          </TypeCard>
        </TypeCards>
        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает TTL?"}
            options={[
              "Ограничивает время жизни ключа",
              "Создаёт SQL JOIN",
              "Шифрует value",
            ]}
            correctIndex={0}
            explanation={"После истечения ключ становится отсутствующим."}
          />
          <QuizCard
            question={"Что такое cache miss?"}
            options={[
              "Ключ не найден и данные нужно получить из source of truth",
              "Ошибка синтаксиса Python",
              "Успешный hit",
            ]}
            correctIndex={0}
            explanation={"Miss является обычной веткой cache-aside."}
          />
          <QuizCard
            question={"Где хранить критичное долговечное состояние StudyHub?"}
            options={[
              "В PostgreSQL",
              "Только в Redis",
              "Только в памяти процесса",
            ]}
            correctIndex={0}
            explanation={"PostgreSQL остаётся source of truth."}
          />
          <QuizCard
            question={"Когда нужен invalidate?"}
            options={[
              "После изменения данных, от которых зависит cache",
              "После каждого GET",
              "Только при создании индекса",
            ]}
            correctIndex={0}
            explanation={"Иначе cache может возвращать устаревший результат."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>{"Redis хранит значения по ключам и особенно полезен для временного состояния."}</>,
            <>{"TTL ограничивает срок актуальности значения."}</>,
            <>{"Cache hit возвращает готовое значение, miss идёт к source of truth."}</>,
            <>{"PostgreSQL остаётся источником истины StudyHub."}</>,
            <>{"После изменения данных зависимый cache инвалидируется."}</>,
            <>{"MongoDB и Redis выбираются по требованиям, а не добавляются ради количества технологий."}</>,
            <>{"Этап завершается защищаемой картой хранения данных."}</>,
          ]}
        />
        <PracticeCta text={"Реализуйте cached stats с TTL 60 секунд, проверьте hit/miss/invalidate и оформите итоговую матрицу PostgreSQL vs MongoDB vs Redis."} />
        <div className="lesson-practice-steps">
          <h3>{"Критерий готовности"}</h3>
          <p>{"Есть воспроизводимый артефакт, успешная проверка, ожидаемый сбой, объяснение результата и отдельный осмысленный Git-коммит."}</p>
        </div>
      </Section>
    </RichLesson>
  );
}

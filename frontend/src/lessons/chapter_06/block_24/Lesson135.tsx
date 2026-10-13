import { BarChart3, Search } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 24 · Индексы, планы запросов и модели хранения";

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

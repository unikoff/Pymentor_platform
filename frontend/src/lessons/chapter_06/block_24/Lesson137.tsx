import { BarChart3, Search } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 24 · Индексы, планы запросов и модели хранения";

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

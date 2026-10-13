import { GitFork, Layers } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
const BLOCK_TITLE = "Блок 24 · Индексы, планы запросов и модели хранения";

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

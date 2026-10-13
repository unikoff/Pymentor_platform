import { Layers, Search } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 21 · SQL как язык работы с данными";

type LessonProps = { module?: string };

export function Lesson120({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"SELECT, WHERE, ORDER BY, LIMIT и OFFSET"}
        intro={"Соберём SELECT как последовательный конвейер: выберем колонки, источник, фильтры, стабильную сортировку и страницу результата, затем повторим тот же запрос через SQLAlchemy."}
        tags={[
          { icon: <Search size={14} />, label: "SELECT и WHERE" },
          { icon: <Layers size={14} />, label: "sort · limit · offset" },
        ]}
      />
      <TheoryBridge link={"Текст SQL читается сверху вниз, но логически база сначала определяет FROM, затем WHERE, сортировку и только после этого ограничивает страницу. Эта модель помогает объяснить, почему LIMIT без ORDER BY нестабилен."} boundary={"OFFSET-пагинация подходит для учебного и небольшого API. Глубокие страницы и keyset pagination появятся только после измеримой проблемы."} />

      <Section number="01" title={"SELECT отвечает на вопрос о данных"}>
        <Lead>
          {"SELECT не изменяет таблицу. Он описывает, какие колонки и строки должны попасть в result set. Хороший запрос начинается с точного вопроса, а не с добавления всех возможных условий."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Выбрать форму результата:</strong> {"какие колонки действительно нужны"}
            </li>
            <li>
              <strong>Сузить строки:</strong> {"какие условия относятся к задаче"}
            </li>
            <li>
              <strong>Упорядочить и ограничить:</strong> {"какой порядок стабилен и какую страницу вернуть"}
            </li>
          </ol>
          <p>{"Результат — один запрос открытых задач приоритета не ниже 3 с предсказуемой страницей."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>Выбрать форму результата</>, "какие колонки действительно нужны"],
            [<>Сузить строки</>, "какие условия относятся к задаче"],
            [<>Упорядочить и ограничить</>, "какой порядок стабилен и какую страницу вернуть"],
          ]}
        />

        <TypeCards>
          <TypeCard badge={"SELECT"} title={"Колонки результата"} code={"SELECT id, title, priority"}>
            {"Определяет форму каждой строки result set."}
          </TypeCard>
          <TypeCard badge={"FROM"} badgeTone="float" title={"Источник строк"} code={"FROM tasks_sql_lab"}>
            {"Называет таблицу или другой источник."}
          </TypeCard>
          <TypeCard badge={"WHERE"} badgeTone="str" title={"Условие отбора"} code={"WHERE is_done = FALSE"}>
            {"Оставляет только строки, удовлетворяющие predicate."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"SELECT * допустим для короткого исследования, но контракт приложения лучше выражать явным списком колонок."}
        </Callout>
      </Section>

      <Section number="02" title={"WHERE фильтрует строки"}>
        <Lead>
          {"WHERE вычисляет логическое условие для каждой строки. Сравнения соединяются AND и OR, а скобки фиксируют нужную группировку."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>AND</h3>
          <p>{"Все соединённые условия должны быть истинны."}</p>
          <h3>OR</h3>
          <p>{"Достаточно одного истинного условия."}</p>
          <h3>Скобки</h3>
          <p>{"Показывают, какие части вычисляются вместе, и уменьшают двусмысленность."}</p>
        </div>

        <CodeBlock
          caption={"открытые важные задачи"}
          code={`SELECT id, title, priority
FROM tasks_sql_lab
WHERE is_done = FALSE
  AND priority >= 3;`}
        />

        <BranchExplorer
          code={`WHERE is_done = FALSE
  AND priority >= 3
  AND title LIKE :pattern`}
          scenarios={[
            { label: "открытая, priority 4, title SQL", activeLine: 2, output: "строка проходит все условия" },
            { label: "выполненная, priority 5", activeLine: 0, output: "строка исключается первым условием" },
            { label: "открытая, priority 2", activeLine: 1, output: "строка исключается по priority" },
          ]}
        />

        <Callout tone="info">
          {"Фильтр не меняет строки. Он решает, какие из них войдут в result set текущего запроса."}
        </Callout>
      </Section>

      <Section number="03" title={"NULL проверяется через IS NULL"}>
        <Lead>
          {"NULL означает отсутствие известного значения, а не пустую строку и не число 0. Сравнение = NULL не даёт ожидаемого True; для проверки используется IS NULL или IS NOT NULL."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>NULL</h3>
          <p>{"Отсутствующее или неизвестное значение."}</p>
          <h3>Пустая строка</h3>
          <p>{"Известное текстовое значение длины 0."}</p>
          <h3>IS NULL</h3>
          <p>{"Специальный SQL-предикат для проверки отсутствия."}</p>
        </div>

        <CodeBlock
          caption={"задачи без категории"}
          code={`SELECT id, title
FROM tasks_sql_lab
WHERE category_id IS NULL;`}
        />

        <BugHunt
          code={`SELECT id, title
FROM tasks_sql_lab
WHERE category_id = NULL;`}
          question={"Почему запрос не находит строки без категории?"}
          options={[
            "NULL проверяется через IS NULL",
            "category_id нельзя выбирать",
            "SELECT требует LIMIT",
          ]}
          correctIndex={0}
          explanation={"NULL не сравнивается обычным равенством как известное значение."}
          fix={`SELECT id, title
FROM tasks_sql_lab
WHERE category_id IS NULL;`}
        />

        <Callout>
          {"Не подменяйте NULL пустой строкой или специальным id = 0: это создаёт ложное значение вместо честного отсутствия связи."}
        </Callout>
      </Section>

      <Section number="04" title={"ORDER BY создаёт предсказуемый порядок"}>
        <Lead>
          {"Без ORDER BY база не обещает порядок строк. Для страницы нужен стабильный порядок; при одинаковом priority добавляем id как второй критерий."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>ASC</h3>
          <p>{"Возрастание; используется по умолчанию."}</p>
          <h3>DESC</h3>
          <p>{"Убывание, например самые важные задачи сначала."}</p>
          <h3>Tie-breaker</h3>
          <p>{"Дополнительная колонка делает порядок детерминированным при равных значениях."}</p>
        </div>

        <CodeBlock
          caption={"стабильная сортировка"}
          code={`SELECT id, title, priority
FROM tasks_sql_lab
WHERE is_done = FALSE
ORDER BY priority DESC, id ASC;`}
        />

        <CompareSolutions
          question={"Какой ORDER BY подходит для стабильной пагинации по priority?"}
          left={{
            title: "Один критерий",
            code: "ORDER BY priority DESC",
            note: "Строки с одинаковым priority могут менять относительный порядок.",
          }}
          right={{
            title: "Критерий и tie-breaker",
            code: "ORDER BY priority DESC, id ASC",
            note: "Для равных priority порядок фиксирует уникальный id.",
          }}
          preferred="right"
          explanation={"Стабильная сортировка нужна, чтобы строки не прыгали между страницами при одинаковом основном значении."}
        />

        <Callout tone="info">
          {"Primary key часто подходит как tie-breaker, но основной порядок всё равно выбирается по пользовательскому требованию."}
        </Callout>
      </Section>

      <Section number="05" title={"LIMIT и OFFSET формируют страницу"}>
        <Lead>
          {"LIMIT ограничивает количество строк, OFFSET пропускает начало отсортированного набора. Для page и page_size offset вычисляется как (page - 1) * page_size."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>page_size</h3>
          <p>{"Сколько строк максимум возвращает запрос."}</p>
          <h3>offset</h3>
          <p>{"Сколько строк отсортированного набора пропустить."}</p>
          <h3>Граница</h3>
          <p>{"page начинается с 1, а page_size имеет разумный максимум."}</p>
        </div>

        <CodeBlock
          caption={"вторая страница по 5"}
          code={`SELECT id, title, priority
FROM tasks_sql_lab
ORDER BY priority DESC, id ASC
LIMIT 5
OFFSET 5;`}
        />

        <StepThrough
          code={`page = 3
page_size = 5
offset = (page - 1) * page_size
# LIMIT 5 OFFSET 10`}
          steps={[
            { line: 0, note: "Пользователь запрашивает третью страницу.", vars: {"page": "3"} },
            { line: 1, note: "На странице должно быть не больше пяти строк.", vars: {"page_size": "5"} },
            { line: 2, note: "Две предыдущие страницы содержат 10 строк.", vars: {"offset": "10"} },
            { line: 3, note: "Запрос берёт следующие пять строк после стабильной сортировки.", vars: {"SQL": "LIMIT 5 OFFSET 10"} },
          ]}
        />

        <Callout tone="info">
          {"LIMIT без ORDER BY ограничивает неопределённый порядок и не создаёт надёжную пагинацию."}
        </Callout>
      </Section>

      <Section number="06" title={"Собираем запрос по этапам"}>
        <Lead>
          {"Читаемый SELECT строится снизу вверх как объект требований: источник, условия, сортировка и страница. В SQLAlchemy каждый метод возвращает дополненный statement."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Базовый statement</h3>
          <p>{"select нужных колонок или модели."}</p>
          <h3>Необязательные фильтры</h3>
          <p>{"where добавляется только для переданного параметра."}</p>
          <h3>Финал</h3>
          <p>{"order_by, limit и offset применяются после фильтров."}</p>
        </div>

        <CodeSequence
          title={"Соберите SQL-запрос страницы"}
          prompt={"Расположите clauses в читаемом порядке SQL."}
          pieces={[
            { id: "select", code: "SELECT id, title, priority" },
            { id: "from", code: "FROM tasks_sql_lab" },
            { id: "where", code: "WHERE is_done = FALSE" },
            { id: "order", code: "ORDER BY priority DESC, id ASC" },
            { id: "limit", code: "LIMIT :limit" },
            { id: "offset", code: "OFFSET :offset" },
            { id: "update", code: "UPDATE tasks_sql_lab", note: "Это другая операция." },
          ]}
          correctOrder={["select", "from", "where", "order", "limit", "offset"]}
          explanation={"Текст SQL читается как SELECT/FROM, затем фильтр, сортировка и ограничение страницы."}
        />

        <Callout tone="info">
          {"Логический порядок обработки и порядок записи SQL различаются. Для практики достаточно понимать, что LIMIT применяется к уже отфильтрованному и отсортированному набору."}
        </Callout>
      </Section>

      <Section number="07" title={"Повторяем через SQLAlchemy и сравниваем SQL"}>
        <Lead>
          {"SQLAlchemy statement должен выражать тот же вопрос. После выполнения сравниваем не только количество строк, но и их id в одинаковом порядке."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>where</h3>
          <p>{"TaskModel.is_done.is_(False) и priority >= min_priority."}</p>
          <h3>order_by</h3>
          <p>{"desc priority и asc id."}</p>
          <h3>limit/offset</h3>
          <p>{"Параметры страницы применяются к statement до execute."}</p>
        </div>

        <CodeBlock
          caption={"SQLAlchemy 2.x"}
          code={`statement = (
    select(TaskModel)
    .where(
        TaskModel.is_done.is_(False),
        TaskModel.priority >= min_priority,
    )
    .order_by(
        TaskModel.priority.desc(),
        TaskModel.id.asc(),
    )
    .limit(page_size)
    .offset((page - 1) * page_size)
)

tasks = session.execute(statement).scalars().all()`}
        />

        <TerminalDemo
          title={"сравнение result ids"}
          lines={[
            { cmd: "python sql-lab/select_page.py --page 2 --size 3" },
            { out: "raw SQL ids: [8, 11, 14]" },
            { out: "SQLAlchemy ids: [8, 11, 14]" },
            { out: "same result: True" },
          ]}
        />

        <Callout tone="info">
          {"Одинаковый смысл запроса подтверждается одинаковыми данными и порядком, а не визуальным сходством двух записей."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка блока"}>
        <Lead>
          {"Сформулируйте вопрос «какие задачи нужны» обычным языком, затем соберите raw SQL и SQLAlchemy statement. Проверьте пустой результат, первую и вторую страницу, одинаковые priority и задачу без category_id."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает WHERE?"}
            options={[
              "отбирает строки",
              "изменяет значения",
              "создаёт таблицу",
            ]}
            correctIndex={0}
            explanation={"WHERE формирует условие попадания строки в result set."}
          />
          <QuizCard
            question={"Как проверить отсутствие значения?"}
            options={[
              "IS NULL",
              "= NULL",
              "== None в raw SQL",
            ]}
            correctIndex={0}
            explanation={"Для NULL используется специальный предикат IS NULL."}
          />
          <QuizCard
            question={"Зачем id в ORDER BY после priority?"}
            options={[
              "стабилизировать порядок",
              "скрыть строки",
              "заменить LIMIT",
            ]}
            correctIndex={0}
            explanation={"Уникальный tie-breaker фиксирует порядок равных значений."}
          />
          <QuizCard
            question={"Как вычислить OFFSET для page=3 и size=5?"}
            options={[
              "10",
              "15",
              "8",
            ]}
            correctIndex={0}
            explanation={"(3 - 1) * 5 = 10."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"SELECT описывает форму result set."}</>,
            <>{"WHERE фильтрует, но не меняет строки."}</>,
            <>{"AND и OR требуют осознанной группировки."}</>,
            <>{"NULL проверяется через IS NULL."}</>,
            <>{"Без ORDER BY порядок не гарантирован."}</>,
            <>{"Стабильная пагинация требует tie-breaker."}</>,
            <>{"LIMIT и OFFSET применяются после фильтрации и сортировки."}</>,
          ]}
        />

        <PracticeCta text={"Создайте select_page.py с параметрами is_done, min_priority, page и page_size. Реализуйте один raw SQL statement и один SQLAlchemy statement, сравните списки id и добавьте проверки пустой страницы и двух задач с одинаковым priority."} />
      </Section>
    </RichLesson>
  );
}

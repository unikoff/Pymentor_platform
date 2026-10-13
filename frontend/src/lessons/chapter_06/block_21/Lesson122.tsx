import { GitFork, ListChecks } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 21 · SQL как язык работы с данными";

type LessonProps = { module?: string };

export function Lesson122({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"SQL и SQLAlchemy: две формы одного запроса"}
        intro={"Закрепим блок двусторонним переводом: для SELECT, INSERT, UPDATE и DELETE запишем raw SQL и SQLAlchemy 2.x, сравним параметры, результаты и выберем форму по читаемости конкретной задачи."}
        tags={[
          { icon: <GitFork size={14} />, label: "raw SQL ↔ SQLAlchemy" },
          { icon: <ListChecks size={14} />, label: "одинаковый результат" },
        ]}
      />
      <TheoryBridge link={"Raw SQL и SQLAlchemy statement не конкурируют за право быть «настоящей базой». Оба строят SQL-операцию; различаются уровень абстракции, форма результата и удобство композиции."} boundary={"Сложный raw SQL не нужно переписывать в ORM любой ценой, а простой CRUD не нужно делать строковым SQL ради ощущения контроля. Выбор подтверждается ясностью и тестом результата."} />

      <Section number="01" title={"Одна операция, два способа записи"}>
        <Lead>
          {"Для каждой пары сначала формулируем вопрос к данным, затем сравниваем structure, parameters и result. Смысл должен совпасть, даже если текст выглядит по-разному."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Назвать intent:</strong> {"какой набор строк или изменение требуется"}
            </li>
            <li>
              <strong>Записать две формы:</strong> {"raw SQL через text и SQLAlchemy expression API"}
            </li>
            <li>
              <strong>Сравнить evidence:</strong> {"одинаковые ids, значения и ошибки"}
            </li>
          </ol>
          <p>{"Результат — каталог sql-lab с четырьмя парами и тестом equivalence."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>Назвать intent</>, "какой набор строк или изменение требуется"],
            [<>Записать две формы</>, "raw SQL через text и SQLAlchemy expression API"],
            [<>Сравнить evidence</>, "одинаковые ids, значения и ошибки"],
          ]}
        />

        <TypeCards>
          <TypeCard badge={"raw SQL"} title={"Явный текст языка"} code={"text(\"SELECT ...\")"}>
            {"Удобен для точного чтения SQL, специфичных конструкций и уже готового запроса."}
          </TypeCard>
          <TypeCard badge={"Core/ORM"} badgeTone="float" title={"Python expression API"} code={"select(TaskModel).where(...)"}>
            {"Удобен для композиции условий и работы с mapped-классами."}
          </TypeCard>
          <TypeCard badge={"test"} badgeTone="str" title={"Общий арбитр"} code={"assert raw_ids == orm_ids"}>
            {"Сравнивает данные, порядок и число затронутых строк."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Критерий блока — способность перевести запрос и доказать одинаковый результат, а не выбрать один инструмент навсегда."}
        </Callout>
      </Section>

      <Section number="02" title={"SELECT: текст и expression API"}>
        <Lead>
          {"Raw SQL явно показывает clauses. SQLAlchemy связывает колонки с моделью и позволяет добавлять условия обычными выражениями Python."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Raw</h3>
          <p>{"Параметры :min_priority и :limit остаются отдельно."}</p>
          <h3>SQLAlchemy</h3>
          <p>{"where, order_by и limit составляют новый statement."}</p>
          <h3>Result</h3>
          <p>{"В raw-варианте удобно mappings(), в ORM — scalars()."}</p>
        </div>

        <CodeBlock
          caption={"raw SQL"}
          code={`raw = text("""
    SELECT id, title, priority
    FROM tasks
    WHERE priority >= :min_priority
    ORDER BY priority DESC, id ASC
    LIMIT :limit
""")`}
        />

        <CodeBlock
          caption={"SQLAlchemy"}
          code={`orm = (
    select(TaskModel)
    .where(TaskModel.priority >= min_priority)
    .order_by(
        TaskModel.priority.desc(),
        TaskModel.id.asc(),
    )
    .limit(limit)
)`}
        />

        <MatchPairs
          prompt={"Соедините raw SQL clause с методом SQLAlchemy."}
          pairs={[
            { left: "SELECT ... FROM tasks", right: "select(TaskModel)" },
            { left: "WHERE priority >= :min", right: "where(TaskModel.priority >= min_priority)" },
            { left: "ORDER BY priority DESC", right: "order_by(TaskModel.priority.desc())" },
            { left: "LIMIT :limit", right: "limit(limit)" },
          ]}
          explanation={"Expression API строит те же основные clauses через объекты Python."}
        />

        <Callout tone="info">
          {"При select отдельных колонок SQLAlchemy тоже возвращает Row, а не полноценный ORM-объект. Форма SELECT определяет форму Result."}
        </Callout>
      </Section>

      <Section number="03" title={"INSERT: text() и ORM unit of work"}>
        <Lead>
          {"Raw INSERT явно выполняется connection.execute. ORM создаёт TaskModel, добавляет его в Session и синхронизирует изменения при flush/commit."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Raw SQL</h3>
          <p>{"Statement и параметры видны напрямую, RETURNING задаётся текстом."}</p>
          <h3>ORM</h3>
          <p>{"Состояние объекта отслеживается Session."}</p>
          <h3>Server values</h3>
          <p>{"После commit/refresh объект получает id и defaults."}</p>
        </div>

        <CompareSolutions
          question={"Какая форма понятнее для обычного создания TaskModel в существующем CRUD-слое?"}
          left={{
            title: "Raw INSERT",
            code: "connection.execute(text(\"INSERT ...\"), params)",
            note: "Даёт полный контроль, но возвращает Row и обходит привычный ORM flow.",
          }}
          right={{
            title: "ORM object",
            code: "task = TaskModel(**data)\nsession.add(task)\nsession.commit()\nsession.refresh(task)",
            note: "Соответствует текущей архитектуре сервиса и response mapping.",
          }}
          preferred="right"
          explanation={"Для простого CRUD mapped-объект обычно яснее. Raw SQL остаётся допустимым, когда нужен особый statement или лабораторное изучение."}
        />

        <Callout tone="info">
          {"ORM не отменяет INSERT: при flush SQLAlchemy всё равно формирует параметризованный SQL."}
        </Callout>
      </Section>

      <Section number="04" title={"UPDATE и DELETE: loaded object или statement"}>
        <Lead>
          {"Можно загрузить объект и изменить атрибут, либо построить update/delete statement. Выбор зависит от того, нужен ли предметный объект и его правила или массовая операция по условию."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Loaded object</h3>
          <p>{"Удобен для одной сущности, ownership и предметных методов."}</p>
          <h3>Statement</h3>
          <p>{"Удобен для явной bulk-операции без загрузки каждого объекта."}</p>
          <h3>Контракт</h3>
          <p>{"В обоих случаях target и число строк должны быть понятны."}</p>
        </div>

        <CodeBlock
          caption={"ORM object"}
          code={`task = session.get(TaskModel, task_id)
if task is None:
    raise TaskNotFound(task_id)

task.is_done = True
session.commit()
session.refresh(task)`}
        />

        <CodeBlock
          caption={"SQLAlchemy update"}
          code={`statement = (
    update(TaskModel)
    .where(TaskModel.id == task_id)
    .values(is_done=True)
    .returning(TaskModel.id, TaskModel.is_done)
)`}
        />

        <StepThrough
          code={`task = session.get(TaskModel, 7)
task.is_done = True
session.flush()
session.commit()`}
          steps={[
            { line: 0, note: "SELECT загружает строку id 7 как ORM-объект.", vars: {"task": "TaskModel(id=7)"} },
            { line: 1, note: "Session замечает изменение атрибута.", vars: {"is_done": "True", "state": "dirty"} },
            { line: 2, note: "Flush формирует параметризованный UPDATE с primary key.", vars: {"SQL": "UPDATE tasks SET is_done=? WHERE id=?"} },
            { line: 3, note: "Commit фиксирует транзакцию.", vars: {"state": "persistent"} },
          ]}
        />

        <Callout tone="info">
          {"Flush отправляет SQL внутри текущей транзакции, commit завершает её. Это разные шаги unit of work."}
        </Callout>
      </Section>

      <Section number="05" title={"Параметры видны в обеих формах"}>
        <Lead>
          {"Expression API не вставляет пользовательские значения в SQL-строку. SQLAlchemy создаёт bind parameters и передаёт значения драйверу отдельно, как и при text()."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Compile</h3>
          <p>{"Можно посмотреть сгенерированный SQL без выполнения."}</p>
          <h3>Params</h3>
          <p>{"compiled.params показывает отдельные значения."}</p>
          <h3>Execute</h3>
          <p>{"Драйвер получает statement и parameters по безопасному пути."}</p>
        </div>

        <CodeBlock
          caption={"компиляция statement"}
          code={`statement = select(TaskModel).where(
    TaskModel.priority >= min_priority,
)

compiled = statement.compile(engine)
print(compiled)
print(compiled.params)`}
        />

        <CodeSequence
          title={"Проследите statement до базы"}
          prompt={"Расположите этапы выполнения SQLAlchemy-запроса."}
          pieces={[
            { id: "build", code: "построить expression statement" },
            { id: "compile", code: "скомпилировать SQL и bind parameters" },
            { id: "driver", code: "передать statement и values драйверу" },
            { id: "database", code: "выполнить операцию в базе" },
            { id: "result", code: "преобразовать Result в objects или mappings" },
            { id: "fstring", code: "встроить user input в SQL", note: "Опасный лишний шаг." },
          ]}
          correctOrder={["build", "compile", "driver", "database", "result"]}
          explanation={"SQLAlchemy строит параметризованный SQL, драйвер выполняет его, а Result преобразуется в нужную форму."}
        />

        <Callout tone="info">
          {"literal_binds полезен для учебного просмотра, но не должен превращаться в способ выполнения SQL с внешними данными."}
        </Callout>
      </Section>

      <Section number="06" title={"Когда raw SQL действительно оправдан"}>
        <Lead>
          {"Raw SQL полезен, когда запрос проще выразить и проверить на самом SQL, использует специфичную возможность СУБД или уже существует как отлаженный statement. Решение документируется, а параметры остаются отдельными."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Специфичная конструкция</h3>
          <p>{"Например, сложный отчёт или PostgreSQL-функция в следующих блоках."}</p>
          <h3>Прозрачность для SQL-review</h3>
          <p>{"Команда может читать и оптимизировать statement напрямую."}</p>
          <h3>Граница mapping</h3>
          <p>{"Результат вручную превращается в DTO или mapping, а не маскируется под ORM entity."}</p>
        </div>

        <TerminalDemo
          title={"equivalence test"}
          lines={[
            { cmd: "pytest -q sql-lab/test_equivalence.py" },
            { out: "test_select_equivalence PASSED" },
            { out: "test_insert_equivalence PASSED" },
            { out: "test_update_equivalence PASSED" },
            { out: "test_delete_equivalence PASSED" },
            { out: "4 passed" },
          ]}
        />

        <Callout tone="info">
          {"Raw SQL оправдан не потому, что ORM «медленный по определению», а потому, что конкретный statement становится яснее или требует возможности SQL."}
        </Callout>
      </Section>

      <Section number="07" title={"Типичные ошибки перевода"}>
        <Lead>
          {"Две записи могут выглядеть похожими, но отличаться по NULL, сортировке, форме результата или транзакционной границе. Перевод проверяется данными, а не только глазами."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Потерян ORDER BY</h3>
          <p>{"Набор строк тот же, порядок отличается."}</p>
          <h3>Сравнение NULL</h3>
          <p>{"== None в SQLAlchemy должно компилироваться в IS NULL; raw SQL пишет IS NULL явно."}</p>
          <h3>Разная форма result</h3>
          <p>{"ORM objects и mappings требуют разного последующего кода."}</p>
        </div>

        <BugHunt
          code={`raw_sql = """
SELECT id, title
FROM tasks
WHERE category_id IS NULL
ORDER BY id
"""

orm_statement = (
    select(TaskModel)
    .where(TaskModel.category_id == None)
)`}
          question={"Какое существенное различие осталось между запросами?"}
          options={[
            "В ORM-варианте потерян ORDER BY id",
            "SQLAlchemy не поддерживает NULL",
            "Raw SQL не выбирает title",
          ]}
          correctIndex={0}
          explanation={"Фильтр может быть эквивалентен, но без order_by порядок результата не гарантирован."}
          fix={`orm_statement = (
    select(TaskModel)
    .where(TaskModel.category_id.is_(None))
    .order_by(TaskModel.id.asc())
)`}
        />

        <Callout>
          {"Не сравнивайте только количество строк. Эквивалентность включает выбранные поля, значения, порядок и side effects."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка блока"}>
        <Lead>
          {"Для SELECT, INSERT, UPDATE и DELETE подготовьте пары raw SQL ↔ SQLAlchemy и автоматическую проверку одинакового результата. Ученик должен объяснить, где находится parameter binding и почему выбрана конкретная форма."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что общего у raw SQL и SQLAlchemy statement?"}
            options={[
              "оба приводят к SQL-операции",
              "оба хранят таблицу в памяти",
              "оба заменяют транзакции",
            ]}
            correctIndex={0}
            explanation={"Expression API компилируется в SQL и параметры."}
          />
          <QuizCard
            question={"Когда ORM-объект обычно удобнее?"}
            options={[
              "обычный CRUD одной сущности",
              "любой сложный отчёт",
              "только CREATE TABLE",
            ]}
            correctIndex={0}
            explanation={"Mapped-объект хорошо вписывается в существующий service flow."}
          />
          <QuizCard
            question={"Что подтверждает эквивалентность SELECT?"}
            options={[
              "одинаковые данные и порядок",
              "похожее число строк кода",
              "одинаковое имя переменной",
            ]}
            correctIndex={0}
            explanation={"Сравнивается наблюдаемый результат запроса."}
          />
          <QuizCard
            question={"Где остаются пользовательские значения?"}
            options={[
              "в bind parameters",
              "в имени таблицы",
              "в f-строке SQL",
            ]}
            correctIndex={0}
            explanation={"Обе безопасные формы отделяют values от структуры statement."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Raw SQL и SQLAlchemy выражают операции над одной базой."}</>,
            <>{"Expression API компилируется в SQL и bind parameters."}</>,
            <>{"Форма SELECT определяет форму Result."}</>,
            <>{"ORM unit of work отслеживает состояние объектов и формирует DML."}</>,
            <>{"Raw SQL оправдан ясностью конкретного statement, а не культом контроля."}</>,
            <>{"Эквивалентность включает поля, значения, порядок и side effects."}</>,
            <>{"Выбор формы фиксируется тестом и объяснением."}</>,
          ]}
        />

        <PracticeCta text={"Создайте sql-lab с четырьмя парами SELECT/INSERT/UPDATE/DELETE. В test_equivalence.py поднимите изолированную SQLite-базу, выполните обе формы на одинаковом seed и сравните ids, values, order и число затронутых строк. Обновите README таблицей «операция → raw SQL → SQLAlchemy → выбранная форма». "} />
      </Section>
    </RichLesson>
  );
}

import {
  Boxes,
  Braces,
  Bug,
  FileText,
  GitFork,
  Layers,
  ListChecks,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import {
  BranchExplorer,
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
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

type LessonProps = { module?: string };

const BLOCK_TITLE = "Блок 21 · SQL как язык работы с данными";

type TheoryBridgeData = { link: string; boundary: string };

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  117: {
    link: "До этого SQLAlchemy позволял работать с объектами Python. Теперь объект остаётся удобным интерфейсом, но каждую операцию мы связываем с таблицей, SQL statement и конкретными строками результата.",
    boundary: "ORM-класс не является таблицей в памяти: это описание отображения. Данные продолжают жить в базе, а Session отправляет SQL.",
  },
  118: {
    link: "Pydantic защищает HTTP-вход, но данные могут попасть в базу и другим путём: скриптом, миграцией или административной командой. Ограничения таблицы становятся последней общей границей целостности.",
    boundary: "Constraint не заменяет понятное сообщение API. База гарантирует правило, а приложение переводит техническую ошибку в безопасный ответ.",
  },
  119: {
    link: "SQL statement описывает структуру операции, а параметры передают значения отдельно. Драйвер сам кодирует данные, поэтому кавычки внутри title остаются частью значения, а не становятся фрагментом SQL.",
    boundary: "Параметризация защищает значения, но не подставляет безопасно имена таблиц, колонок или ключевые слова. Структура запроса остаётся кодом.",
  },
  120: {
    link: "Текст SQL читается сверху вниз, но логически база сначала определяет FROM, затем WHERE, сортировку и только после этого ограничивает страницу. Эта модель помогает объяснить, почему LIMIT без ORDER BY нестабилен.",
    boundary: "OFFSET-пагинация подходит для учебного и небольшого API. Глубокие страницы и keyset pagination появятся только после измеримой проблемы.",
  },
  121: {
    link: "UPDATE и DELETE отличаются от SELECT ценой ошибки: неверный фильтр меняет данные. Поэтому безопасный сценарий сначала формулирует target, затем выполняет операцию в транзакции и проверяет 0, 1 или много затронутых строк.",
    boundary: "Запрет «никогда не писать UPDATE без WHERE» не абсолютен для административных миграций, но в пользовательском CRUD отсутствие target-фильтра считается блокирующей ошибкой.",
  },
  122: {
    link: "Raw SQL и SQLAlchemy statement не конкурируют за право быть «настоящей базой». Оба строят SQL-операцию; различаются уровень абстракции, форма результата и удобство композиции.",
    boundary: "Сложный raw SQL не нужно переписывать в ORM любой ценой, а простой CRUD не нужно делать строковым SQL ради ощущения контроля. Выбор подтверждается ясностью и тестом результата.",
  },
};

function TheoryBridge({ lesson }: { lesson: number }) {
  const bridge = THEORY_BRIDGES[lesson];

  return (
    <Callout tone="info">
      <strong>Связь с курсом.</strong> {bridge.link}{" "}
      <strong>Важно не перепутать:</strong> {bridge.boundary}
    </Callout>
  );
}

// 117. Реляционная модель и SQL под ORM
export function Lesson117({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Реляционная модель и SQL под ORM"}
        intro={"Снимем первый слой магии ORM: разложим таблицу на схему и данные, сопоставим поля TaskModel с колонками, включим SQL-лог и проследим путь от select(TaskModel) до набора строк."}
        tags={[
          { icon: <Boxes size={14} />, label: "таблица · строка · колонка" },
          { icon: <Layers size={14} />, label: "ORM → SQL → результат" },
        ]}
      />
      <TheoryBridge lesson={117} />

      <Section number="01" title={"Зачем смотреть под ORM"}>
        <Lead>
          {"StudyHub уже умеет сохранять задачи через SQLAlchemy, но без чтения SQL легко воспринимать Session как магический список. В этом блоке мы не выбрасываем ORM, а учимся видеть реальную операцию, которую он строит."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Зафиксировать модель:</strong> {"отделить класс TaskModel от таблицы tasks и от конкретного объекта task"}
            </li>
            <li>
              <strong>Увидеть statement:</strong> {"сопоставить select(TaskModel) с SELECT и FROM"}
            </li>
            <li>
              <strong>Проверить результат:</strong> {"сравнить SQL-лог, строки таблицы и полученные ORM-объекты"}
            </li>
          </ol>
          <p>{"Результат занятия — схема пути TaskModel → SQL statement → таблица tasks → ORM object."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>Зафиксировать модель</>, "отделить класс TaskModel от таблицы tasks и от конкретного объекта task"],
            [<>Увидеть statement</>, "сопоставить select(TaskModel) с SELECT и FROM"],
            [<>Проверить результат</>, "сравнить SQL-лог, строки таблицы и полученные ORM-объекты"],
          ]}
        />

        <TypeCards>
          <TypeCard badge={"class"} title={"ORM-описание"} code={"class TaskModel(Base):\n    __tablename__ = \"tasks\""}>
            {"Класс называет таблицу, колонки и правила отображения. Он не содержит все строки базы."}
          </TypeCard>
          <TypeCard badge={"table"} badgeTone="float" title={"Структура хранения"} code={"tasks(id, title, priority, is_done)"}>
            {"Таблица состоит из колонок с типами и множества строк."}
          </TypeCard>
          <TypeCard badge={"object"} badgeTone="str" title={"Одна загруженная запись"} code={"task = session.get(TaskModel, 7)"}>
            {"ORM-объект представляет одну строку в пределах работы Session."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Главный вопрос блока: какой SQL и какие строки стоят за знакомой ORM-операцией?"}
        </Callout>
      </Section>

      <Section number="02" title={"Схема таблицы и данные — разные уровни"}>
        <Lead>
          {"Схема отвечает на вопрос «какие значения допустимы», а данные — «какие строки сейчас записаны». Изменение title одной задачи меняет данные, добавление новой колонки меняет схему."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Схема</h3>
          <p>{"Имена колонок, типы, nullable, default и ограничения описывают форму таблицы."}</p>
          <h3>Данные</h3>
          <p>{"Каждая строка содержит значения согласно схеме и имеет собственный primary key."}</p>
          <h3>Миграция</h3>
          <p>{"Изменение схемы проводится отдельно от обычного INSERT или UPDATE."}</p>
        </div>

        <CodeBlock
          caption={"схема и две строки"}
          code={`tasks
┌────┬──────────────────┬──────────┬─────────┐
│ id │ title            │ priority │ is_done │
├────┼──────────────────┼──────────┼─────────┤
│  1 │ Прочитать SQL    │        4 │ false   │
│  2 │ Проверить INSERT │        3 │ true    │
└────┴──────────────────┴──────────┴─────────┘`}
        />

        <MatchPairs
          prompt={"Соедините понятие с его ролью в таблице StudyHub."}
          leftTitle={"Понятие"}
          rightTitle={"Роль"}
          pairs={[
            { left: "column", right: "одно именованное свойство всех строк" },
            { left: "row", right: "одна сохранённая задача" },
            { left: "schema", right: "правила формы таблицы" },
            { left: "value", right: "конкретное содержимое ячейки" },
            { left: "primary key", right: "стабильный идентификатор строки" },
          ]}
          explanation={"Схема задаёт форму, строки содержат данные, а primary key позволяет обращаться к одной записи."}
        />

        <Callout tone="info">
          {"В разговоре «таблица tasks» может означать и структуру, и текущие строки. В техническом объяснении полезно называть уровень точно."}
        </Callout>
      </Section>

      <Section number="03" title={"Primary key связывает строку и объект"}>
        <Lead>
          {"Primary key нужен не для красивой нумерации. Он однозначно выбирает строку и позволяет Session понимать, какой ORM-объект соответствует какой записи."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Уникальность</h3>
          <p>{"Две строки не могут иметь одинаковый primary key."}</p>
          <h3>Стабильность</h3>
          <p>{"Заголовок может измениться, но id продолжает обозначать ту же задачу."}</p>
          <h3>Identity map</h3>
          <p>{"В пределах Session повторная загрузка той же строки может вернуть тот же Python-объект."}</p>
        </div>

        <CodeBlock
          caption={"ORM-модель"}
          code={`class TaskModel(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    priority: Mapped[int] = mapped_column(default=3)
    is_done: Mapped[bool] = mapped_column(default=False)`}
        />

        <StepThrough
          code={`first = session.get(TaskModel, 7)
second = session.get(TaskModel, 7)
first.title = "Читать SQL"
session.commit()`}
          steps={[
            { line: 0, note: "Session строит выборку строки с primary key 7.", vars: {"first": "TaskModel(id=7)"} },
            { line: 1, note: "Session узнаёт уже загруженную identity и связывает её с тем же объектом.", vars: {"first is second": "True"} },
            { line: 2, note: "Меняется атрибут объекта, но id остаётся прежним.", vars: {"id": "7", "title": "Читать SQL"} },
            { line: 3, note: "При commit формируется UPDATE только для строки id = 7.", vars: {"операция": "UPDATE tasks ... WHERE id = ?"} },
          ]}
        />

        <Callout tone="info">
          {"Поиск по title не заменяет primary key: названия могут повторяться и изменяться."}
        </Callout>
      </Section>

      <Section number="04" title={"Как ORM-класс отображается на таблицу"}>
        <Lead>
          {"SQLAlchemy читает __tablename__ и mapped_column, чтобы построить SQL. Python-имя атрибута обычно совпадает с колонкой, но это настраиваемое отображение, а не автоматическое превращение любого класса в таблицу."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>__tablename__</h3>
          <p>{"Определяет имя таблицы в SQL."}</p>
          <h3>Mapped[T]</h3>
          <p>{"Документирует Python-тип атрибута и участвует в declarative mapping."}</p>
          <h3>mapped_column</h3>
          <p>{"Настраивает тип, nullable, primary key, default и имя колонки."}</p>
        </div>

        <CodeBlock
          caption={"два представления"}
          code={`# Python / ORM
TaskModel.title

-- SQL / table
tasks.title`}
        />

        <CompareSolutions
          question={"Какое объяснение точнее описывает ORM-модель?"}
          left={{
            title: "Копия базы в Python",
            code: "class TaskModel хранит все задачи внутри процесса",
            note: "Смешивает описание таблицы и конкретные данные.",
          }}
          right={{
            title: "Карта между двумя представлениями",
            code: "TaskModel.title ↔ tasks.title",
            note: "Показывает, как атрибут объекта связан с колонкой.",
          }}
          preferred="right"
          explanation={"ORM-модель задаёт mapping. Строки загружаются запросом и не живут внутри определения класса."}
        />

        <Callout tone="info">
          {"Pydantic schema, ORM model и SQL table могут иметь похожие поля, но обслуживают разные границы: HTTP, Python mapping и хранение."}
        </Callout>
      </Section>

      <Section number="05" title={"select(TaskModel) превращается в SQL"}>
        <Lead>
          {"Функция select создаёт объект statement. До session.execute он только описывает запрос; выполнение начинается, когда Session передаёт statement через engine в базу."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Построение</h3>
          <p>{"statement = select(TaskModel) создаёт описание запроса."}</p>
          <h3>Выполнение</h3>
          <p>{"session.execute(statement) отправляет SQL и получает Result."}</p>
          <h3>Преобразование</h3>
          <p>{"scalars().all() извлекает ORM-объекты из строк результата."}</p>
        </div>

        <CodeBlock
          caption={"SQLAlchemy 2.x"}
          code={`from sqlalchemy import select

statement = select(TaskModel)
result = session.execute(statement)
tasks = result.scalars().all()`}
        />

        <CodeBlock
          caption={"соответствующий SQL"}
          code={`SELECT tasks.id,
       tasks.title,
       tasks.priority,
       tasks.is_done
FROM tasks;`}
        />

        <BranchExplorer
          code={`statement = select(TaskModel)
result = session.execute(statement)
rows = result.all()
objects = result.scalars().all()`}
          scenarios={[
            { label: "только statement", activeLine: 0, output: "SQL ещё не отправлен" },
            { label: "execute", activeLine: 1, output: "база выполняет SELECT" },
            { label: "all()", activeLine: 2, output: "строки Row с выбранными элементами" },
            { label: "scalars()", activeLine: 3, output: "ORM-объекты TaskModel" },
          ]}
        />

        <Callout tone="info">
          {"Statement можно дополнять where, order_by и limit до выполнения. Это обычный объект Python, описывающий будущий SQL."}
        </Callout>
      </Section>

      <Section number="06" title={"Включаем SQL-лог и читаем его спокойно"}>
        <Lead>
          {"Параметр echo=True у engine показывает отправляемые statements и параметры. Это учебный инструмент: сначала ищем SELECT, затем FROM, WHERE и отдельный набор параметров."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Найти statement</h3>
          <p>{"Не начинайте с временных меток и служебных строк — найдите сам SELECT."}</p>
          <h3>Найти параметры</h3>
          <p>{"Значения обычно выводятся отдельно от текста SQL."}</p>
          <h3>Связать с кодом</h3>
          <p>{"Определите, какая строка SQLAlchemy создала этот запрос."}</p>
        </div>

        <CodeBlock
          caption={"engine для лаборатории"}
          code={`from sqlalchemy import create_engine

engine = create_engine(
    "sqlite:///studyhub.db",
    echo=True,
)`}
        />

        <TerminalDemo
          title={"SQL-лог одного запроса"}
          lines={[
            { cmd: "python sql-lab/read_tasks.py" },
            { out: "SELECT tasks.id, tasks.title, tasks.priority, tasks.is_done" },
            { out: "FROM tasks" },
            { out: "[generated] ()" },
            { out: "Получено задач: 4" },
          ]}
        />

        <Callout tone="info">
          {"В production логирование SQL включают осознанно: параметры могут содержать чувствительные данные, а объём вывода быстро растёт."}
        </Callout>
      </Section>

      <Section number="07" title={"Ошибки модели: объект, строка и Result"}>
        <Lead>
          {"После execute разработчик работает не с обычным списком. Result нужно прочитать подходящим способом: all() возвращает строки результата, scalars() выделяет первый выбранный элемент, scalar_one_or_none() проверяет ожидание одной записи."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Result</h3>
          <p>{"Ленточный интерфейс над результатом выполнения statement."}</p>
          <h3>Row</h3>
          <p>{"Структура одной строки результата, особенно при выборе нескольких колонок."}</p>
          <h3>ORM object</h3>
          <p>{"Экземпляр TaskModel, когда используется scalars() для select(TaskModel)."}</p>
        </div>

        <BugHunt
          code={`statement = select(TaskModel)
result = session.execute(statement)
tasks = result.all()
print(tasks[0].title)`}
          question={"Почему обращение к title может быть ошибочным?"}
          options={[
            "result.all() возвращает Row, а не обязательно сам TaskModel",
            "SELECT нельзя выполнять через Session",
            "title разрешён только в Pydantic",
          ]}
          correctIndex={0}
          explanation={"Для select(TaskModel) удобнее вызвать scalars().all(), чтобы получить список ORM-объектов."}
          fix={`statement = select(TaskModel)
tasks = session.execute(statement).scalars().all()
print(tasks[0].title)`}
        />

        <Callout>
          {"Не запоминайте all и scalars как ритуал. Сначала спросите: что именно выбрано в SELECT и какую форму результата ожидает код?"}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка блока"}>
        <Lead>
          {"Проследите одну задачу через все представления: поле ORM-модели, колонку таблицы, SELECT в логе, Result и итоговый объект. Контрольная точка пройдена, когда маршрут объясняется без слова «магия»."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что описывает ORM-класс?"}
            options={[
              "mapping между объектом и таблицей",
              "все строки базы в памяти",
              "только HTTP-ответ",
            ]}
            correctIndex={0}
            explanation={"ORM-класс задаёт отображение атрибутов на таблицу."}
          />
          <QuizCard
            question={"Когда statement реально отправляется в базу?"}
            options={[
              "при session.execute",
              "при импорте select",
              "при объявлении класса",
            ]}
            correctIndex={0}
            explanation={"select создаёт описание, execute запускает операцию."}
          />
          <QuizCard
            question={"Зачем нужен primary key?"}
            options={[
              "однозначно выбрать строку",
              "отсортировать заголовки",
              "заменить NOT NULL",
            ]}
            correctIndex={0}
            explanation={"Primary key стабильно идентифицирует запись."}
          />
          <QuizCard
            question={"Что обычно даёт scalars().all() для select(TaskModel)?"}
            options={[
              "список ORM-объектов",
              "строку SQL",
              "новую таблицу",
            ]}
            correctIndex={0}
            explanation={"scalars выделяет выбранный ORM-элемент из каждой строки Result."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Схема таблицы и текущие данные — разные уровни."}</>,
            <>{"ORM-модель описывает mapping, а не хранит все строки."}</>,
            <>{"Primary key связывает объект с одной строкой."}</>,
            <>{"select создаёт statement до выполнения."}</>,
            <>{"Session.execute отправляет SQL через engine."}</>,
            <>{"SQL-лог читается как statement плюс отдельные параметры."}</>,
            <>{"Форма Result зависит от того, что выбрано в SELECT."}</>,
          ]}
        />

        <PracticeCta text={"Создайте каталог sql-lab, включите echo=True, выполните select(TaskModel), сохраните SQL-лог в notes.md и подпишите, где находятся SELECT, FROM, параметры и преобразование Result в ORM-объекты."} />
      </Section>
    </RichLesson>
  );
}

// 118. CREATE TABLE и ограничения данных
export function Lesson118({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"CREATE TABLE и ограничения данных"}
        intro={"Спроектируем учебную таблицу tasks_sql_lab вручную: выберем типы, primary key, NOT NULL, UNIQUE, DEFAULT и CHECK, затем намеренно нарушим ограничения и прочитаем сообщения базы."}
        tags={[
          { icon: <Braces size={14} />, label: "CREATE TABLE" },
          { icon: <ShieldCheck size={14} />, label: "constraints как гарантии" },
        ]}
      />
      <TheoryBridge lesson={118} />

      <Section number="01" title={"Почему проверки нужны и в приложении, и в базе"}>
        <Lead>
          {"До записи Pydantic может отклонить пустой title или неверный priority. Но таблица должна защищать себя независимо от конкретного endpoint, иначе другой путь записи сможет сохранить недопустимую строку."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Назвать инварианты:</strong> {"какие свойства обязаны быть истинными для каждой задачи"}
            </li>
            <li>
              <strong>Закрепить в DDL:</strong> {"какие правила выражаются NOT NULL, UNIQUE, DEFAULT и CHECK"}
            </li>
            <li>
              <strong>Проверить нарушением:</strong> {"какую ошибку даёт база и что после неё делает транзакция"}
            </li>
          </ol>
          <p>{"Результат — воспроизводимый CREATE TABLE и журнал трёх контролируемых ошибок."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>Назвать инварианты</>, "какие свойства обязаны быть истинными для каждой задачи"],
            [<>Закрепить в DDL</>, "какие правила выражаются NOT NULL, UNIQUE, DEFAULT и CHECK"],
            [<>Проверить нарушением</>, "какую ошибку даёт база и что после неё делает транзакция"],
          ]}
        />

        <TypeCards>
          <TypeCard badge={"Pydantic"} title={"Граница HTTP"} code={"TaskCreate(priority=9)"}>
            {"Даёт клиенту раннюю и понятную ошибку до работы с базой."}
          </TypeCard>
          <TypeCard badge={"service"} badgeTone="float" title={"Предметный сценарий"} code={"create_task(current_user, data)"}>
            {"Проверяет правила, зависящие от пользователя и контекста операции."}
          </TypeCard>
          <TypeCard badge={"constraint"} badgeTone="str" title={"Гарантия таблицы"} code={"CHECK (priority BETWEEN 1 AND 5)"}>
            {"Не допускает недопустимую строку при любом пути записи."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Одинаковое правило на двух уровнях не всегда лишнее: уровни защищают разные пути и дают разные формы ошибки."}
        </Callout>
      </Section>

      <Section number="02" title={"CREATE TABLE описывает форму хранения"}>
        <Lead>
          {"DDL-команда CREATE TABLE создаёт структуру. Внутри скобок перечисляются колонки и ограничения; данные появляются позже через INSERT."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Имя таблицы</h3>
          <p>{"Для лаборатории используем отдельную tasks_sql_lab, чтобы не повредить рабочие таблицы."}</p>
          <h3>Колонки</h3>
          <p>{"Каждая строка объявления содержит имя, тип и при необходимости ограничения."}</p>
          <h3>Табличные constraints</h3>
          <p>{"Некоторые правила относятся к комбинации колонок и записываются отдельно."}</p>
        </div>

        <CodeBlock
          caption={"минимальная лабораторная таблица"}
          code={`CREATE TABLE tasks_sql_lab (
    id INTEGER PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    priority INTEGER NOT NULL DEFAULT 3,
    is_done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (priority BETWEEN 1 AND 5)
);`}
        />

        <CodeSequence
          title={"Соберите DDL таблицы"}
          prompt={"Расположите части от заголовка CREATE TABLE до закрывающей скобки."}
          pieces={[
            { id: "create", code: "CREATE TABLE tasks_sql_lab (" },
            { id: "id", code: "    id INTEGER PRIMARY KEY," },
            { id: "title", code: "    title VARCHAR(200) NOT NULL," },
            { id: "priority", code: "    priority INTEGER NOT NULL DEFAULT 3," },
            { id: "check", code: "    CHECK (priority BETWEEN 1 AND 5)" },
            { id: "close", code: ");" },
            { id: "insert", code: "INSERT INTO tasks_sql_lab ...", note: "Это уже DML, не часть создания схемы." },
          ]}
          correctOrder={["create", "id", "title", "priority", "check", "close"]}
          explanation={"CREATE TABLE сначала называет таблицу, затем перечисляет колонки и constraints, после чего закрывается скобкой."}
        />

        <Callout tone="info">
          {"Типы SQL выражают контракт хранения. Конкретные детали и строгость типов отличаются между SQLite и PostgreSQL; различия исследуем при переносе в следующем блоке."}
        </Callout>
      </Section>

      <Section number="03" title={"Тип колонки ограничивает форму значения"}>
        <Lead>
          {"INTEGER, VARCHAR, BOOLEAN и TIMESTAMP сообщают базе и инструментам ожидаемый вид данных. Тип — не декоративная подпись: он влияет на операции, сравнения и переносимость схемы."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>INTEGER</h3>
          <p>{"Идентификаторы, приоритеты и счётчики."}</p>
          <h3>VARCHAR(n)</h3>
          <p>{"Текст с ожидаемым пределом длины."}</p>
          <h3>BOOLEAN и TIMESTAMP</h3>
          <p>{"Флаг состояния и момент создания; конкретная реализация зависит от СУБД."}</p>
        </div>

        <MatchPairs
          prompt={"Соедините поле StudyHub с подходящим типом на уровне модели данных."}
          pairs={[
            { left: "id", right: "INTEGER" },
            { left: "title", right: "VARCHAR(200)" },
            { left: "priority", right: "INTEGER" },
            { left: "is_done", right: "BOOLEAN" },
            { left: "created_at", right: "TIMESTAMP" },
          ]}
          explanation={"Тип выбирается по смыслу значений и операциям, а не по тому, как значение выглядит в одном примере."}
        />

        <Callout>
          {"Не храните priority строкой только потому, что input вернул текст. До базы значение должно пройти преобразование и валидацию."}
        </Callout>
      </Section>

      <Section number="04" title={"PRIMARY KEY, NOT NULL и UNIQUE защищают разные правила"}>
        <Lead>
          {"Ограничения нельзя заменять друг другом. PRIMARY KEY идентифицирует строку, NOT NULL запрещает отсутствие значения, UNIQUE запрещает повтор в выбранной колонке или комбинации."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>PRIMARY KEY</h3>
          <p>{"Уникален и не NULL; используется для ссылок и поиска одной строки."}</p>
          <h3>NOT NULL</h3>
          <p>{"Значение обязано присутствовать, но может повторяться."}</p>
          <h3>UNIQUE</h3>
          <p>{"Значения не повторяются по выбранному правилу; NULL ведёт себя по правилам конкретной СУБД."}</p>
        </div>

        <CodeBlock
          caption={"категория с уникальным slug"}
          code={`CREATE TABLE categories_sql_lab (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE
);`}
        />

        <CompareSolutions
          question={"Как надёжнее гарантировать уникальный slug категории?"}
          left={{
            title: "Только Python-проверка",
            code: "if not category_exists(slug):\n    insert_category(slug)",
            note: "Между проверкой и INSERT другая операция может записать тот же slug.",
          }}
          right={{
            title: "UNIQUE плюс обработка ошибки",
            code: "slug VARCHAR(100) NOT NULL UNIQUE",
            note: "База остаётся окончательной точкой гарантии.",
          }}
          preferred="right"
          explanation={"Предварительная проверка улучшает UX, но только UNIQUE защищает таблицу от любого конкурентного или обходного пути."}
        />

        <Callout tone="info">
          {"UNIQUE — гарантия данных, а ответ 409 — HTTP-решение приложения. Это два разных контракта."}
        </Callout>
      </Section>

      <Section number="05" title={"DEFAULT заполняет пропущенное, CHECK проверяет диапазон"}>
        <Lead>
          {"DEFAULT применяется, когда колонка отсутствует в INSERT. Он не исправляет явно переданное неверное значение. CHECK вычисляет условие для новой или изменяемой строки."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>DEFAULT</h3>
          <p>{"Если priority не указан, база подставляет 3."}</p>
          <h3>Явное значение</h3>
          <p>{"priority = 5 сохраняется вместо default."}</p>
          <h3>CHECK</h3>
          <p>{"priority = 9 отклоняется, даже если поле имеет default 3."}</p>
        </div>

        <CodeBlock
          caption={"правила приоритета"}
          code={`priority INTEGER NOT NULL DEFAULT 3,
CHECK (priority BETWEEN 1 AND 5)`}
        />

        <BranchExplorer
          code={`INSERT INTO tasks_sql_lab (id, title)
VALUES (1, 'SQL');

INSERT INTO tasks_sql_lab (id, title, priority)
VALUES (2, 'Constraints', 5);

INSERT INTO tasks_sql_lab (id, title, priority)
VALUES (3, 'Broken', 9);`}
          scenarios={[
            { label: "priority пропущен", activeLine: 0, output: "сохраняется default 3" },
            { label: "priority = 5", activeLine: 3, output: "сохраняется 5" },
            { label: "priority = 9", activeLine: 6, output: "CHECK отклоняет строку" },
          ]}
        />

        <Callout tone="info">
          {"Default действует на уровне базы и полезен для всех клиентов таблицы, но приложение всё равно должно явно понимать ожидаемое значение."}
        </Callout>
      </Section>

      <Section number="06" title={"Намеренно нарушаем ограничения"}>
        <Lead>
          {"Ошибку базы нужно увидеть в безопасной лаборатории. Мы выполняем по одной неверной операции, фиксируем constraint, сообщение и состояние транзакции."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Одна ошибка</h3>
          <p>{"Не запускайте сразу три нарушения: иначе первая остановит сценарий и скроет остальные."}</p>
          <h3>Техническая причина</h3>
          <p>{"Найдите имя ограничения или колонку."}</p>
          <h3>Восстановление</h3>
          <p>{"После ошибки откатите транзакцию перед следующим запросом."}</p>
        </div>

        <TerminalDemo
          title={"контролируемые нарушения"}
          lines={[
            { cmd: "python sql-lab/constraints.py --case null-title" },
            { out: "NOT NULL constraint failed: tasks_sql_lab.title" },
            { cmd: "python sql-lab/constraints.py --case bad-priority" },
            { out: "CHECK constraint failed: priority BETWEEN 1 AND 5" },
            { cmd: "python sql-lab/constraints.py --case duplicate-id" },
            { out: "UNIQUE constraint failed: tasks_sql_lab.id" },
          ]}
        />

        <Callout>
          {"Точный текст ошибок зависит от СУБД. В коде не следует строить бизнес-логику на полном совпадении длинной строки драйвера."}
        </Callout>
      </Section>

      <Section number="07" title={"Ошибка constraint и состояние транзакции"}>
        <Lead>
          {"После ошибки записи транзакция должна быть приведена в понятное состояние. В ORM-сценарии это означает rollback перед продолжением работы с Session."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Попытка записи</h3>
          <p>{"База проверяет constraints при выполнении или commit."}</p>
          <h3>Ошибка</h3>
          <p>{"Операция не становится успешной частью транзакции."}</p>
          <h3>Rollback</h3>
          <p>{"Приложение откатывает транзакцию и только потом выполняет новый statement."}</p>
        </div>

        <BugHunt
          code={`try:
    session.add(TaskModel(title=None))
    session.commit()
except IntegrityError:
    print("Не удалось сохранить")

tasks = session.execute(select(TaskModel)).scalars().all()`}
          question={"Какого обязательного шага не хватает после IntegrityError?"}
          options={[
            "session.rollback()",
            "session.refresh()",
            "engine.dispose()",
          ]}
          correctIndex={0}
          explanation={"После ошибки commit Session остаётся в состоянии неуспешной транзакции до rollback."}
          fix={`try:
    session.add(TaskModel(title=None))
    session.commit()
except IntegrityError:
    session.rollback()
    print("Не удалось сохранить")

tasks = session.execute(select(TaskModel)).scalars().all()`}
        />

        <Callout tone="info">
          {"Rollback не «чинит» неверные данные. Он очищает неуспешную транзакцию, чтобы Session снова могла работать."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка блока"}>
        <Lead>
          {"Создайте таблицу заново из одного DDL-файла, выполните успешный INSERT и три контролируемых нарушения. Для каждой ошибки назовите constraint и объясните, почему приложение всё равно сохраняет собственную валидацию."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает NOT NULL?"}
            options={[
              "запрещает отсутствие значения",
              "запрещает повторы",
              "создаёт индекс сортировки",
            ]}
            correctIndex={0}
            explanation={"NOT NULL требует значение в каждой строке."}
          />
          <QuizCard
            question={"Когда применяется DEFAULT?"}
            options={[
              "когда колонка не указана в INSERT",
              "при любом неверном значении",
              "только при SELECT",
            ]}
            correctIndex={0}
            explanation={"Явно переданное значение не заменяется default автоматически."}
          />
          <QuizCard
            question={"Какая гарантия окончательно защищает уникальность?"}
            options={[
              "UNIQUE в базе",
              "один if в endpoint",
              "подсказка в документации",
            ]}
            correctIndex={0}
            explanation={"Только constraint действует для всех путей записи."}
          />
          <QuizCard
            question={"Что сделать с Session после IntegrityError?"}
            options={[
              "rollback",
              "refresh всех объектов",
              "создать новую таблицу",
            ]}
            correctIndex={0}
            explanation={"Rollback завершает неуспешную транзакцию."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"CREATE TABLE описывает схему, а не добавляет строки."}</>,
            <>{"Типы колонок выражают форму и допустимые операции."}</>,
            <>{"PRIMARY KEY, NOT NULL и UNIQUE решают разные задачи."}</>,
            <>{"DEFAULT работает только для пропущенной колонки."}</>,
            <>{"CHECK защищает инвариант на уровне таблицы."}</>,
            <>{"Pydantic и database constraints дополняют друг друга."}</>,
            <>{"После ошибки транзакции нужен rollback."}</>,
          ]}
        />

        <PracticeCta text={"Создайте sql-lab/schema.sql с tasks_sql_lab и categories_sql_lab, добавьте NOT NULL, UNIQUE, DEFAULT и CHECK, затем подготовьте constraints.py, который по одному воспроизводит три ошибки и после каждой корректно откатывает транзакцию."} />
      </Section>
    </RichLesson>
  );
}

// 119. INSERT и безопасные параметры
export function Lesson119({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"INSERT и безопасные параметры"}
        intro={"Научимся добавлять строки без склеивания SQL с пользовательским текстом: разберём явный список колонок, server default, RETURNING, пакетную вставку и параметризованный запрос через SQLAlchemy text()."}
        tags={[
          { icon: <FileText size={14} />, label: "INSERT · VALUES · RETURNING" },
          { icon: <ShieldCheck size={14} />, label: "statement отдельно от данных" },
        ]}
      />
      <TheoryBridge lesson={119} />

      <Section number="01" title={"INSERT добавляет новую строку"}>
        <Lead>
          {"Команда INSERT INTO называет таблицу, список колонок и значения. Явный список колонок делает запрос устойчивее к порядку полей и понятнее при чтении."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Назвать колонки:</strong> {"явно указать, какие поля получает новая строка"}
            </li>
            <li>
              <strong>Передать значения:</strong> {"использовать параметры вместо сборки SQL-строки"}
            </li>
            <li>
              <strong>Проверить результат:</strong> {"получить id через RETURNING или повторный SELECT"}
            </li>
          </ol>
          <p>{"Результат — insert_task.py, который принимает данные отдельно от текста statement."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>Назвать колонки</>, "явно указать, какие поля получает новая строка"],
            [<>Передать значения</>, "использовать параметры вместо сборки SQL-строки"],
            [<>Проверить результат</>, "получить id через RETURNING или повторный SELECT"],
          ]}
        />

        <TypeCards>
          <TypeCard badge={"table"} title={"Куда записываем"} code={"INSERT INTO tasks_sql_lab"}>
            {"Имя таблицы является частью структуры statement."}
          </TypeCard>
          <TypeCard badge={"columns"} badgeTone="float" title={"Что заполняем"} code={"(title, priority, is_done)"}>
            {"Колонки перечисляются явно и в согласованном порядке."}
          </TypeCard>
          <TypeCard badge={"values"} badgeTone="str" title={"Какие данные"} code={"VALUES (:title, :priority, :is_done)"}>
            {"Значения передаются параметрами, а не конкатенацией."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Хороший INSERT можно прочитать как предложение: добавить в таблицу такие колонки, используя такие параметры."}
        </Callout>
      </Section>

      <Section number="02" title={"Явный список колонок и server default"}>
        <Lead>
          {"Если колонка имеет default и не указана в INSERT, значение выбирает база. Явное перечисление защищает от случайной зависимости от физического порядка колонок."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Минимальный INSERT</h3>
          <p>{"Передаём только title — priority и is_done получают defaults."}</p>
          <h3>Полный INSERT</h3>
          <p>{"Явно задаём поля, которые действительно отличаются от defaults."}</p>
          <h3>Не использовать VALUES без колонок</h3>
          <p>{"Такая форма требует помнить точный порядок всей таблицы."}</p>
        </div>

        <CodeBlock
          caption={"два корректных варианта"}
          code={`INSERT INTO tasks_sql_lab (title)
VALUES ('Прочитать INSERT');

INSERT INTO tasks_sql_lab (title, priority, is_done)
VALUES ('Проверить параметры', 5, FALSE);`}
        />

        <CompareSolutions
          question={"Какой INSERT легче переживёт добавление новой колонки с default?"}
          left={{
            title: "Зависимость от порядка",
            code: "INSERT INTO tasks_sql_lab VALUES (1, 'SQL', 3, FALSE, CURRENT_TIMESTAMP)",
            note: "Нужно помнить все колонки и их физический порядок.",
          }}
          right={{
            title: "Явные колонки",
            code: "INSERT INTO tasks_sql_lab (title, priority) VALUES (:title, :priority)",
            note: "Запрос называет только заполняемые поля.",
          }}
          preferred="right"
          explanation={"Явный список колонок делает контракт INSERT видимым и не зависит от порядка объявления всех полей."}
        />

        <Callout tone="info">
          {"DEFAULT — поведение базы. Если приложение должно вернуть итоговую строку, после INSERT нужно получить значения, созданные сервером."}
        </Callout>
      </Section>

      <Section number="03" title={"Параметры отделяют код запроса от данных"}>
        <Lead>
          {"Пользовательский title может содержать апостроф. При параметризации это обычный символ данных; драйвер не вставляет строку как готовый фрагмент SQL."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Statement</h3>
          <p>{"Фиксированная структура с именованными placeholders."}</p>
          <h3>Parameters</h3>
          <p>{"Отдельный словарь Python со значениями."}</p>
          <h3>Driver</h3>
          <p>{"Передаёт statement и данные базе по протоколу без ручного экранирования."}</p>
        </div>

        <CodeBlock
          caption={"SQLAlchemy text"}
          code={`from sqlalchemy import text

statement = text("""
    INSERT INTO tasks_sql_lab (title, priority)
    VALUES (:title, :priority)
""")

params = {
    "title": "Разобрать O'Reilly",
    "priority": 4,
}

connection.execute(statement, params)`}
        />

        <StepThrough
          code={`statement = text(SQL)
params = {"title": user_title, "priority": 4}
connection.execute(statement, params)
connection.commit()`}
          steps={[
            { line: 0, note: "Структура INSERT создаётся один раз и не содержит пользовательского title.", vars: {"SQL": "... VALUES (:title, :priority)"} },
            { line: 1, note: "Значения лежат в отдельном словаре.", vars: {"title": "пользовательский текст"} },
            { line: 2, note: "Драйвер связывает placeholders со значениями.", vars: {"операция": "parameter binding"} },
            { line: 3, note: "Commit делает успешную вставку постоянной.", vars: {"transaction": "committed"} },
          ]}
        />

        <Callout tone="info">
          {"Не нужно вручную заменять одинарные кавычки или добавлять обратные слеши. Это задача драйвера."}
        </Callout>
      </Section>

      <Section number="04" title={"Почему f-строка в SQL опасна"}>
        <Lead>
          {"При f-строке данные становятся частью синтаксиса. Даже без злого умысла title с кавычкой ломает statement; при специальном вводе структура запроса может измениться."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Смешение уровней</h3>
          <p>{"Код SQL и внешние данные соединяются в одну строку."}</p>
          <h3>Невозможность надёжного ручного escaping</h3>
          <p>{"Правила отличаются по драйверам и типам."}</p>
          <h3>Правильная замена</h3>
          <p>{"Фиксированный statement плюс параметры."}</p>
        </div>

        <BugHunt
          code={`title = input("Название: ")
sql = f"INSERT INTO tasks_sql_lab (title) VALUES ('{title}')"
connection.execute(text(sql))`}
          question={"В чём основная проблема такого кода?"}
          options={[
            "Пользовательское значение встроено в синтаксис SQL",
            "INSERT нельзя выполнять из Python",
            "Название таблицы слишком длинное",
          ]}
          correctIndex={0}
          explanation={"F-строка смешивает statement и данные, создавая ошибки кавычек и риск SQL injection."}
          fix={`title = input("Название: ")
statement = text("""
    INSERT INTO tasks_sql_lab (title)
    VALUES (:title)
""")
connection.execute(statement, {"title": title})`}
        />

        <Callout>
          {"Учебный вывод простой: пользовательские значения никогда не собираются с SQL через f-строку, + или format()."}
        </Callout>
      </Section>

      <Section number="05" title={"RETURNING показывает созданную строку"}>
        <Lead>
          {"После INSERT часто нужен id и server defaults. RETURNING просит базу вернуть выбранные колонки той же операцией, если используемая СУБД и конкретный сценарий это поддерживают."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Вставка</h3>
          <p>{"База создаёт строку и применяет defaults."}</p>
          <h3>Возврат</h3>
          <p>{"RETURNING id, priority, created_at возвращает итоговые значения."}</p>
          <h3>Использование</h3>
          <p>{"Приложение строит ответ без отдельного поиска по title."}</p>
        </div>

        <CodeBlock
          caption={"INSERT с RETURNING"}
          code={`INSERT INTO tasks_sql_lab (title)
VALUES (:title)
RETURNING id, title, priority, is_done, created_at;`}
        />

        <CodeSequence
          title={"Соберите безопасный INSERT с результатом"}
          prompt={"Выберите только части одной параметризованной операции."}
          pieces={[
            { id: "insert", code: "INSERT INTO tasks_sql_lab (title, priority)" },
            { id: "values", code: "VALUES (:title, :priority)" },
            { id: "returning", code: "RETURNING id, title, priority" },
            { id: "params", code: "params = {\"title\": title, \"priority\": priority}" },
            { id: "execute", code: "connection.execute(text(sql), params)" },
            { id: "fstring", code: "VALUES (f\"{title}\")", note: "Смешивает данные и SQL." },
          ]}
          correctOrder={["insert", "values", "returning", "params", "execute"]}
          explanation={"Структура statement остаётся фиксированной, значения передаются отдельно, RETURNING возвращает созданные поля."}
        />

        <Callout tone="info">
          {"В ORM похожую задачу решают add, commit и refresh. В финальном занятии блока сравним обе формы."}
        </Callout>
      </Section>

      <Section number="06" title={"Несколько строк и транзакционная граница"}>
        <Lead>
          {"Несколько INSERT можно выполнить в одной транзакции. Если одна обязательная вставка нарушает constraint, решение о commit или rollback относится ко всей операции."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>executemany</h3>
          <p>{"Один statement выполняется для списка словарей параметров."}</p>
          <h3>Атомарность сценария</h3>
          <p>{"Группа связанных вставок либо фиксируется, либо откатывается по выбранному правилу."}</p>
          <h3>Независимые записи</h3>
          <p>{"Не объединяйте случайно большой импорт в одну непрозрачную операцию без стратегии ошибок."}</p>
        </div>

        <CodeBlock
          caption={"пакет параметров"}
          code={`statement = text("""
    INSERT INTO tasks_sql_lab (title, priority)
    VALUES (:title, :priority)
""")

rows = [
    {"title": "SQL 1", "priority": 3},
    {"title": "SQL 2", "priority": 4},
]

with engine.begin() as connection:
    connection.execute(statement, rows)`}
        />

        <TerminalDemo
          title={"две строки одной операцией"}
          lines={[
            { cmd: "python sql-lab/insert_many.py" },
            { out: "BEGIN" },
            { out: "INSERT INTO tasks_sql_lab ... [2 parameter sets]" },
            { out: "COMMIT" },
            { out: "Добавлено строк: 2" },
          ]}
        />

        <Callout tone="info">
          {"engine.begin() создаёт контекст транзакции: успешный блок фиксируется, исключение приводит к rollback."}
        </Callout>
      </Section>

      <Section number="07" title={"Проверяем параметры и границы ответственности"}>
        <Lead>
          {"Параметризация не освобождает от валидации. Драйвер безопасно передаст priority = 99, а CHECK отклонит его; приложение должно раньше дать понятное сообщение пользователю."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Pydantic</h3>
          <p>{"Проверяет форму HTTP-входа."}</p>
          <h3>Parameters</h3>
          <p>{"Безопасно доставляют уже выбранные значения в statement."}</p>
          <h3>Constraint</h3>
          <p>{"Не допускает некорректную строку в таблицу."}</p>
        </div>

        <RecallCard
          question={"Почему параметризованный запрос всё равно может завершиться IntegrityError?"}
          hint={"Безопасность синтаксиса и корректность данных — разные свойства."}
          answer={
            <p>{"Параметризация не превращает неверное значение в допустимое. CHECK, NOT NULL или UNIQUE по-прежнему проверяют данные и могут отклонить операцию."}</p>
          }
        />

        <Callout tone="info">
          {"Безопасный INSERT — это три слоя вместе: понятная валидация, параметризованный statement и constraints таблицы."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка блока"}>
        <Lead>
          {"Выполните один INSERT с апострофом в title, один INSERT с server default, один RETURNING и одну пакетную вставку. В коде не должно быть ни одной f-строки, собирающей SQL."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Зачем перечислять колонки в INSERT?"}
            options={[
              "сделать контракт явным",
              "ускорить любой запрос автоматически",
              "отключить constraints",
            ]}
            correctIndex={0}
            explanation={"Явный список не зависит от полного физического порядка таблицы."}
          />
          <QuizCard
            question={"Как передавать пользовательский title?"}
            options={[
              "отдельным параметром",
              "через f-строку",
              "через ручную замену кавычек",
            ]}
            correctIndex={0}
            explanation={"Драйвер должен связывать значение с placeholder."}
          />
          <QuizCard
            question={"Что делает RETURNING?"}
            options={[
              "возвращает выбранные поля созданной строки",
              "откатывает INSERT",
              "создаёт constraint",
            ]}
            correctIndex={0}
            explanation={"RETURNING позволяет получить итоговые значения той же операцией."}
          />
          <QuizCard
            question={"Что обеспечивает engine.begin()?"}
            options={[
              "контекст транзакции",
              "новую ORM-модель",
              "HTTP-валидацию",
            ]}
            correctIndex={0}
            explanation={"Контекст фиксирует успешный блок и откатывает его при исключении."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"INSERT называет таблицу, колонки и значения."}</>,
            <>{"Колонки лучше перечислять явно."}</>,
            <>{"Server default применяется к пропущенной колонке."}</>,
            <>{"Statement и параметры передаются отдельно."}</>,
            <>{"F-строка в SQL смешивает код и данные."}</>,
            <>{"RETURNING может вернуть id и server defaults."}</>,
            <>{"Параметризация дополняет, но не заменяет валидацию и constraints."}</>,
          ]}
        />

        <PracticeCta text={"Создайте insert_task.py на SQLAlchemy text(): один именованный statement, отдельный словарь параметров, RETURNING итоговой строки и тестовый title с апострофом. Добавьте insert_many.py с двумя параметрическими наборами внутри engine.begin()."} />
      </Section>
    </RichLesson>
  );
}

// 120. SELECT, WHERE, ORDER BY, LIMIT и OFFSET
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
      <TheoryBridge lesson={120} />

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

// 121. UPDATE и DELETE без опасных ошибок
export function Lesson121({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"UPDATE и DELETE без опасных ошибок"}
        intro={"Научимся изменять и удалять только выбранные строки: сделаем WHERE обязательной частью сценария, проверим RETURNING и row count, воспроизведём запрос без условия внутри откатываемой транзакции."}
        tags={[
          { icon: <Wrench size={14} />, label: "UPDATE · SET" },
          { icon: <Bug size={14} />, label: "DELETE · WHERE · rollback" },
        ]}
      />
      <TheoryBridge lesson={121} />

      <Section number="01" title={"Сначала определить target операции"}>
        <Lead>
          {"Перед UPDATE или DELETE нужно вслух назвать множество строк: «задача с id 7 текущего пользователя», а не просто «таблица tasks». Это превращает WHERE из дополнения в часть контракта."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Назвать target:</strong> {"какие строки разрешено затронуть"}
            </li>
            <li>
              <strong>Зафиксировать transaction:</strong> {"как проверить результат до commit"}
            </li>
            <li>
              <strong>Проверить cardinality:</strong> {"ожидалось 0, 1 или несколько строк"}
            </li>
          </ol>
          <p>{"Результат — safe_mutations.py, который отказывается выполнять пользовательскую операцию без WHERE."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>Назвать target</>, "какие строки разрешено затронуть"],
            [<>Зафиксировать transaction</>, "как проверить результат до commit"],
            [<>Проверить cardinality</>, "ожидалось 0, 1 или несколько строк"],
          ]}
        />

        <TypeCards>
          <TypeCard badge={"target"} title={"Множество строк"} code={"WHERE id = :task_id AND owner_id = :user_id"}>
            {"Фильтр должен выражать id и при необходимости ownership."}
          </TypeCard>
          <TypeCard badge={"change"} badgeTone="float" title={"Новые значения"} code={"SET is_done = TRUE"}>
            {"SET содержит только разрешённые изменяемые поля."}
          </TypeCard>
          <TypeCard badge={"evidence"} badgeTone="str" title={"Результат"} code={"RETURNING id, is_done"}>
            {"RETURNING или rowcount подтверждает фактическое действие."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Без точного target операция технически корректна, но прикладно опасна."}
        </Callout>
      </Section>

      <Section number="02" title={"UPDATE меняет выбранные колонки"}>
        <Lead>
          {"UPDATE называет таблицу, SET и WHERE. Колонки, отсутствующие в SET, сохраняют прежние значения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>SET</h3>
          <p>{"Каждое присваивание задаёт новое значение выбранной колонки."}</p>
          <h3>WHERE</h3>
          <p>{"Фильтр определяет строки, к которым применяется SET."}</p>
          <h3>RETURNING</h3>
          <p>{"Позволяет увидеть изменённые поля без отдельного SELECT."}</p>
        </div>

        <CodeBlock
          caption={"завершить одну задачу"}
          code={`UPDATE tasks_sql_lab
SET is_done = TRUE
WHERE id = :task_id
RETURNING id, title, is_done;`}
        />

        <BranchExplorer
          code={`UPDATE tasks_sql_lab
SET is_done = TRUE
WHERE id = :task_id
RETURNING id;`}
          scenarios={[
            { label: "id существует", activeLine: 2, output: "одна строка обновлена и возвращена" },
            { label: "id отсутствует", activeLine: 2, output: "0 строк, это обычный not found" },
            { label: "WHERE удалён", activeLine: 1, output: "обновятся все строки — операция блокируется review" },
          ]}
        />

        <Callout tone="info">
          {"0 затронутых строк не обязательно ошибка базы. Для API это часто сценарий 404 или запрет ownership, определяемый контрактом."}
        </Callout>
      </Section>

      <Section number="03" title={"DELETE удаляет строки, а не очищает поля"}>
        <Lead>
          {"DELETE FROM удаляет целые строки, удовлетворяющие WHERE. Для мягкого удаления нужна отдельная модель состояния, например deleted_at, а не случайная замена настоящего DELETE."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Hard delete</h3>
          <p>{"Строка физически исчезает из текущего набора данных."}</p>
          <h3>Soft delete</h3>
          <p>{"UPDATE выставляет признак; все чтения обязаны учитывать его."}</p>
          <h3>Выбор</h3>
          <p>{"Принимается по требованиям восстановления, аудита и ссылок, а не по привычке."}</p>
        </div>

        <CodeBlock
          caption={"удалить тестовую строку"}
          code={`DELETE FROM tasks_sql_lab
WHERE id = :task_id
RETURNING id, title;`}
        />

        <CompareSolutions
          question={"Что точнее выражает требование «удалить лабораторную запись навсегда»?"}
          left={{
            title: "Скрыть флагом",
            code: "UPDATE tasks_sql_lab SET is_deleted = TRUE WHERE id = :id",
            note: "Добавляет soft-delete контракт, которого пока нет.",
          }}
          right={{
            title: "Удалить строку",
            code: "DELETE FROM tasks_sql_lab WHERE id = :id RETURNING id",
            note: "Соответствует явному требованию лаборатории.",
          }}
          preferred="right"
          explanation={"Soft delete полезен только при сформулированной потребности и требует изменений всех запросов чтения."}
        />

        <Callout>
          {"DELETE может нарушить foreign key или бизнес-инвариант. В блоке 23 связанные операции будут собраны в транзакции."}
        </Callout>
      </Section>

      <Section number="04" title={"Запрос без WHERE — блокирующая ошибка"}>
        <Lead>
          {"Самый опасный дефект выглядит синтаксически просто: UPDATE или DELETE без фильтра применяются ко всей таблице. Защита строится не на внимательности одного человека, а на процедуре."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Review rule</h3>
          <p>{"Для пользовательского CRUD statement без WHERE не принимается."}</p>
          <h3>Лаборатория</h3>
          <p>{"Опасный пример выполняется только на копии данных внутри rollback."}</p>
          <h3>Backup и migration</h3>
          <p>{"Массовые изменения имеют отдельный план, проверку и восстановление."}</p>
        </div>

        <BugHunt
          code={`def delete_task(connection, task_id):
    statement = text("DELETE FROM tasks_sql_lab")
    connection.execute(statement, {"task_id": task_id})`}
          question={"Почему task_id не защищает данные?"}
          options={[
            "Placeholder вообще не используется в SQL",
            "DELETE не принимает параметры",
            "text() удаляет WHERE автоматически",
          ]}
          correctIndex={0}
          explanation={"Переданный словарь не влияет на statement, если :task_id отсутствует в тексте SQL."}
          fix={`def delete_task(connection, task_id):
    statement = text("""
        DELETE FROM tasks_sql_lab
        WHERE id = :task_id
        RETURNING id
    """)
    return connection.execute(
        statement,
        {"task_id": task_id},
    ).first()`}
        />

        <Callout>
          {"Наличие параметра в Python не означает наличие фильтра в SQL. Проверяется финальный statement."}
        </Callout>
      </Section>

      <Section number="05" title={"RETURNING и row count подтверждают результат"}>
        <Lead>
          {"После mutation код должен различать 0, 1 и много строк. RETURNING даёт данные затронутых строк, row count — количество, но точное поведение зависит от драйвера и операции."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>0 строк</h3>
          <p>{"Target не найден или не доступен."}</p>
          <h3>1 строка</h3>
          <p>{"Ожидаемый CRUD-сценарий по primary key."}</p>
          <h3>Много строк</h3>
          <p>{"Допустимо только для явно массовой операции."}</p>
        </div>

        <StepThrough
          code={`result = connection.execute(statement, params)
row = result.mappings().one_or_none()
if row is None:
    raise TaskNotFound(task_id)
connection.commit()`}
          steps={[
            { line: 0, note: "База выполняет UPDATE или DELETE с WHERE.", vars: {"result": "Result"} },
            { line: 1, note: "Ожидается не больше одной строки RETURNING.", vars: {"row": "mapping | None"} },
            { line: 2, note: "Отсутствие строки превращается в понятный прикладной сценарий.", vars: {"outcome": "not found"} },
            { line: 4, note: "Commit выполняется только после проверки результата.", vars: {"transaction": "committed"} },
          ]}
        />

        <Callout tone="info">
          {"Не выполняйте commit до проверки, если сценарий требует подтвердить ровно одну затронутую строку."}
        </Callout>
      </Section>

      <Section number="06" title={"Учебный rollback для опасного сценария"}>
        <Lead>
          {"Чтобы увидеть последствия массовой операции без потери данных, создаём отдельную лабораторную таблицу, начинаем транзакцию, считаем строки до и после, затем делаем rollback."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Baseline</h3>
          <p>{"COUNT до изменения фиксирует исходное состояние."}</p>
          <h3>Experiment</h3>
          <p>{"Выполняется намеренно опасный statement."}</p>
          <h3>Rollback</h3>
          <p>{"Транзакция откатывается, повторный COUNT должен совпасть с baseline."}</p>
        </div>

        <TerminalDemo
          title={"массовый UPDATE без сохранения"}
          lines={[
            { cmd: "python sql-lab/dangerous_update_demo.py" },
            { out: "before: 12 open tasks" },
            { out: "after UPDATE without WHERE: 0 open tasks" },
            { out: "ROLLBACK" },
            { out: "after rollback: 12 open tasks" },
          ]}
        />

        <Callout>
          {"Такой эксперимент проводится только на лабораторной таблице. Рабочая база не является площадкой для демонстрации опасного запроса."}
        </Callout>
      </Section>

      <Section number="07" title={"Безопасная функция mutation"}>
        <Lead>
          {"Функция должна принимать target и новые данные отдельно, использовать фиксированный parameterized statement, проверять результат и управлять транзакцией на понятной границе."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Inputs</h3>
          <p>{"task_id и новое значение передаются как параметры."}</p>
          <h3>Statement</h3>
          <p>{"WHERE присутствует в статическом тексте."}</p>
          <h3>Outcome</h3>
          <p>{"Функция возвращает изменённую строку или явный not found."}</p>
        </div>

        <CodeBlock
          caption={"закрыть задачу безопасно"}
          code={`def mark_done(connection, task_id: int):
    statement = text("""
        UPDATE tasks_sql_lab
        SET is_done = TRUE
        WHERE id = :task_id
        RETURNING id, title, is_done
    """)

    row = connection.execute(
        statement,
        {"task_id": task_id},
    ).mappings().one_or_none()

    if row is None:
        raise TaskNotFound(task_id)

    return dict(row)`}
        />

        <TrueFalse
          statement={<>{"Передача task_id в execute автоматически ограничивает UPDATE одной строкой, даже если WHERE отсутствует."}</>}
          isTrue={false}
          explanation={"Параметр влияет только на placeholders, которые реально присутствуют в statement."}
        />

        <Callout tone="info">
          {"Транзакционная граница может находиться выше функции, если один пользовательский сценарий объединяет несколько операций. Важно, чтобы решение было явным."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка блока"}>
        <Lead>
          {"Выполните успешный UPDATE, not found, безопасный DELETE и лабораторный запрос без WHERE с обязательным rollback. Для каждого сценария зафиксируйте число затронутых строк и состояние данных после завершения."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что обязательно определяет WHERE в mutation?"}
            options={[
              "target строк",
              "новые колонки",
              "формат HTTP-ответа",
            ]}
            correctIndex={0}
            explanation={"WHERE задаёт множество изменяемых или удаляемых строк."}
          />
          <QuizCard
            question={"Что означает 0 строк после UPDATE по id?"}
            options={[
              "target не найден",
              "таблица удалена",
              "constraint отключён",
            ]}
            correctIndex={0}
            explanation={"Операция корректна технически, но строка не выбрана."}
          />
          <QuizCard
            question={"Когда commit безопаснее выполнять?"}
            options={[
              "после проверки ожидаемого результата",
              "до execute",
              "внутри текста SQL",
            ]}
            correctIndex={0}
            explanation={"Сначала подтверждается outcome операции."}
          />
          <QuizCard
            question={"Зачем демонстрации rollback?"}
            options={[
              "увидеть эффект без сохранения",
              "ускорить DELETE",
              "создать primary key",
            ]}
            correctIndex={0}
            explanation={"Rollback возвращает лабораторные данные к baseline."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"UPDATE использует SET и обязательный target-фильтр."}</>,
            <>{"DELETE удаляет строки, а soft delete является отдельным контрактом."}</>,
            <>{"Параметр в Python не создаёт WHERE автоматически."}</>,
            <>{"RETURNING помогает проверить фактический outcome."}</>,
            <>{"0, 1 и много строк — разные прикладные сценарии."}</>,
            <>{"Опасные statements исследуются только в лаборатории."}</>,
            <>{"Commit выполняется после проверки, rollback возвращает транзакцию к исходному состоянию."}</>,
          ]}
        />

        <PracticeCta text={"Создайте safe_mutations.py с mark_done и delete_task: статические parameterized statements, WHERE по id, RETURNING, one_or_none и явный TaskNotFound. Добавьте dangerous_update_demo.py, который выполняет массовый UPDATE только внутри rollback и доказывает восстановление COUNT."} />
      </Section>
    </RichLesson>
  );
}

// 122. SQL и SQLAlchemy: две формы одного запроса
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
      <TheoryBridge lesson={122} />

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

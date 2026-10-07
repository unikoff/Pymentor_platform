import { Boxes, Layers } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 21 · SQL как язык работы с данными";

type LessonProps = { module?: string };

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
      <TheoryBridge link={"До этого SQLAlchemy позволял работать с объектами Python. Теперь объект остаётся удобным интерфейсом, но каждую операцию мы связываем с таблицей, SQL statement и конкретными строками результата."} boundary={"ORM-класс не является таблицей в памяти: это описание отображения. Данные продолжают жить в базе, а Session отправляет SQL."} />

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

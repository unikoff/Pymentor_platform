import { GitFork, Search } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 23 · JOIN, агрегаты и транзакции";

export function Lesson129({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title="INNER JOIN и связанные строки"
        intro="Соединим задачи с пользователями и категориями по foreign key, разберём условие ON и научимся объяснять происхождение каждой колонки результата — сначала в SQL, затем в SQLAlchemy."
        tags={[
          { icon: <GitFork size={14} />, label: "связи по foreign key" },
          { icon: <Search size={14} />, label: "SQL → строки результата" },
        ]}
      />
      <TheoryBridge link={"После переноса StudyHub на PostgreSQL отдельные таблицы уже надёжно хранят данные. Теперь нужно собрать связанный ответ, не дублируя username и category name внутри каждой задачи."} boundary={"INNER JOIN оставляет только пары, для которых условие ON истинно. Отсутствующая связь означает отсутствие всей строки в результате."} />

      <Section number="01" title="Зачем соединять таблицы">
        <Lead>
          {
            "Нормализованная база хранит пользователя, задачу и категорию отдельно. Это защищает данные от повторения, но для ответа API нужно собрать значения обратно в одну строку результата."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Проблема</h3>
          <p>
            {
              "В tasks лежат user_id и category_id, но клиенту нужны username и название категории."
            }
          </p>
          <h3>Главная модель</h3>
          <p>{"JOIN сопоставляет строки двух источников по явному условию."}</p>
          <h3>Результат</h3>
          <p>
            {
              "Одна строка ответа показывает задачу и найденные связанные данные."
            }
          </p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Взять строку tasks:"}</strong> {"прочитать foreign key"}
            </li>
            <li>
              <strong>{"Найти связанную строку:"}</strong>{" "}
              {"проверить условие ON"}
            </li>
            <li>
              <strong>{"Собрать проекцию:"}</strong> {"вернуть нужные колонки"}
            </li>
          </ol>
          <p>
            {
              "JOIN не копирует данные между таблицами. Он формирует временный результат конкретного запроса."
            }
          </p>
        </div>

        <Callout tone="info">
          {
            "JOIN не копирует данные между таблицами. Он формирует временный результат конкретного запроса."
          }
        </Callout>
      </Section>

      <Section number="02" title="Primary key и foreign key создают маршрут">
        <Lead>
          {
            "Связь начинается не с ключевого слова JOIN, а с пары колонок. Primary key однозначно определяет родительскую строку, а foreign key хранит ссылку на неё."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>users.id</h3>
          <p>{"Уникальный идентификатор пользователя."}</p>
          <h3>tasks.user_id</h3>
          <p>{"Ссылка задачи на владельца."}</p>
          <h3>Условие</h3>
          <p>{"tasks.user_id = users.id соединяет подходящие строки."}</p>
        </div>

        <TypeCards>
          <TypeCard badge="PK" title="users.id" code={`id = 7`}>
            {"Однозначно определяет строку пользователя."}
          </TypeCard>
          <TypeCard
            badge="FK"
            badgeTone="float"
            title="tasks.user_id"
            code={`user_id = 7`}
          >
            {"Указывает, какого пользователя искать."}
          </TypeCard>
          <TypeCard
            badge="ON"
            badgeTone="str"
            title="Условие связи"
            code={`tasks.user_id = users.id`}
          >
            {"Сравнивает ключи для каждой потенциальной пары."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question="Что хранится в tasks.user_id?"
          answer={
            <p>
              {
                "Не объект User и не username, а значение ключа, по которому база может найти строку users."
              }
            </p>
          }
        />

        <Callout tone="info">
          {
            "Foreign key описывает допустимую ссылку. JOIN использует эту ссылку, чтобы построить результат чтения."
          }
        </Callout>
      </Section>

      <Section number="03" title="Как INNER JOIN строит пары строк">
        <Lead>
          {
            "База рассматривает строки двух источников и оставляет только те пары, где условие ON истинно. Полезно один раз пройти этот процесс вручную."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Task #10</h3>
          <p>{"user_id = 2."}</p>
          <h3>Users</h3>
          <p>{"Проверяем id по очереди."}</p>
          <h3>Совпадение</h3>
          <p>{"Строка user id = 2 присоединяется к задаче."}</p>
        </div>

        <StepThrough
          code={`tasks:  (10, "SQL JOIN", user_id=2)
users: (1, "anna"), (2, "max")

ON tasks.user_id = users.id`}
          steps={[
            {
              line: 0,
              note: "Берём задачу с user_id = 2.",
              vars: { task: "#10", user_id: "2" },
            },
            {
              line: 1,
              note: "Проверяем users.id = 1: условие ложно.",
              vars: { "2 = 1": "False" },
            },
            {
              line: 1,
              note: "Проверяем users.id = 2: условие истинно.",
              vars: { "2 = 2": "True" },
            },
            {
              line: 3,
              note: "В результат попадает одна объединённая строка.",
              vars: { result: "#10 + max" },
            },
          ]}
        />

        <PredictOutput
          code={`SELECT tasks.id, tasks.title, users.username
FROM tasks
INNER JOIN users ON tasks.user_id = users.id
ORDER BY tasks.id;`}
          output={`10 | SQL JOIN | max`}
          hint="Сначала предскажите результат, затем подтвердите его на минимальном наборе данных."
        />

        <Callout tone="info">
          {
            "В реальной СУБД оптимизатор не обязан буквально перебирать строки в таком порядке, но логический результат остаётся тем же."
          }
        </Callout>
      </Section>

      <Section number="04" title="ON, qualified columns и aliases">
        <Lead>
          {
            "После JOIN одинаковые имена вроде id встречаются в нескольких таблицах. Квалифицированное имя показывает источник колонки, а alias делает длинный запрос читаемее."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Qualified name</h3>
          <p>{"tasks.id явно указывает таблицу."}</p>
          <h3>Alias</h3>
          <p>{"t и u сокращают повторяющиеся имена."}</p>
          <h3>Проекция</h3>
          <p>{"AS owner_name задаёт имя колонки результата."}</p>
        </div>

        <CompareSolutions
          question="Какой вариант точнее сохраняет требуемый контракт?"
          left={{
            title: "Неясный запрос",
            code: `SELECT id, title, username
FROM tasks
JOIN users ON user_id = id;`,
            note: "Не видно, какой id участвует в SELECT и ON.",
          }}
          right={{
            title: "Явные источники",
            code: `SELECT t.id, t.title, u.username AS owner_name
FROM tasks AS t
JOIN users AS u ON t.user_id = u.id;`,
            note: "Каждая колонка имеет понятный источник.",
          }}
          preferred="right"
          explanation="Предпочтительный вариант делает источник данных, границу операции и наблюдаемый результат явными."
        />

        <FillBlank
          prompt="Дополните условие связи задач с пользователями."
          before={`JOIN users AS u ON t.user_id `}
          after={``}
          options={["= u.id", "= t.id", "IS NULL"]}
          answer="= u.id"
          explanation="Foreign key задачи сравнивается с primary key пользователя."
        />

        <Callout tone="info">
          {
            "Alias действует только внутри текущего запроса и не переименовывает таблицу в базе."
          }
        </Callout>
      </Section>

      <Section number="05" title="Почему родитель повторяется в результате">
        <Lead>
          {
            "Один пользователь может владеть несколькими задачами. JOIN возвращает строку на каждое совпадение, поэтому username закономерно повторяется рядом с разными задачами."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>One-to-many</h3>
          <p>{"Один users.id встречается во многих tasks.user_id."}</p>
          <h3>Result row</h3>
          <p>{"Каждая задача сохраняет отдельную строку результата."}</p>
          <h3>Не ошибка</h3>
          <p>
            {"Повтор username отражает форму связи, а не дублирование users."}
          </p>
        </div>

        <BranchExplorer
          code={`task #10 → user_id 2 → max
task #11 → user_id 2 → max
task #12 → user_id 3 → ira`}
          scenarios={[
            {
              label: "task #10",
              activeLine: 0,
              output: "#10 | SQL JOIN | max",
            },
            {
              label: "task #11",
              activeLine: 1,
              output: "#11 | PostgreSQL | max",
            },
            { label: "task #12", activeLine: 2, output: "#12 | Tests | ira" },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>один user → много tasks</>,
              "username повторяется в нескольких строках результата",
            ],
            [
              <>одна task → один owner</>,
              "каждая задача получает не более одного владельца",
            ],
            [
              <>SELECT DISTINCT user</>,
              "меняет вопрос: вернуть пользователей, а не задачи",
            ],
          ]}
        />

        <Callout tone="info">
          {
            "Не добавляйте DISTINCT автоматически. Сначала сформулируйте, какую сущность представляет одна строка результата."
          }
        </Callout>
      </Section>

      <Section number="06" title="Три таблицы и SQLAlchemy statement">
        <Lead>
          {
            "После понятного SQL тот же запрос собирается выражениями SQLAlchemy 2.x. Statement остаётся описанием запроса, а Session выполняет его и возвращает строки выбранной проекции."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>select</h3>
          <p>{"Определяет колонки результата."}</p>
          <h3>join</h3>
          <p>{"Добавляет источник и условие связи."}</p>
          <h3>execute</h3>
          <p>{"Отправляет statement в PostgreSQL."}</p>
        </div>

        <CodeSequence
          prompt="Соберите SQLAlchemy statement для задачи, владельца и категории."
          pieces={[
            {
              id: "select",
              code: "stmt = select(TaskModel.id, TaskModel.title, UserModel.username, CategoryModel.name)",
            },
            {
              id: "user",
              code: "stmt = stmt.join(UserModel, TaskModel.user_id == UserModel.id)",
            },
            {
              id: "category",
              code: "stmt = stmt.join(CategoryModel, TaskModel.category_id == CategoryModel.id)",
            },
            { id: "order", code: "stmt = stmt.order_by(TaskModel.id)" },
            { id: "execute", code: "rows = session.execute(stmt).all()" },
          ]}
          correctOrder={["select", "user", "category", "order", "execute"]}
          explanation="Порядок отражает путь от описания запроса или операции к её выполнению и проверке."
        />

        <TerminalDemo
          title="воспроизводимая проверка"
          lines={[
            { cmd: `python -m app.sql_lab.join_tasks` },
            {
              out: `(10, 'SQL JOIN', 'max', 'database')
(11, 'PostgreSQL', 'max', 'database')`,
            },
          ]}
        />

        <Callout tone="info">
          {
            "Если select перечисляет отдельные колонки, результатом будут Row-подобные записи, а не TaskModel из scalars()."
          }
        </Callout>
      </Section>

      <Section
        number="07"
        title="Ошибка условия соединения и проектный endpoint"
      >
        <Lead>
          {
            "Неверный ON может вернуть пустой набор или огромное количество ложных пар. Перед подключением к endpoint запрос нужно проверить на маленьком известном наборе данных."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Симптом</h3>
          <p>{"Строк слишком много или связи выглядят случайными."}</p>
          <h3>Диагностика</h3>
          <p>{"Проверить обе стороны каждого равенства в ON."}</p>
          <h3>Контракт API</h3>
          <p>{"GET /reports/tasks-with-owner возвращает устойчивую схему."}</p>
        </div>

        <BugHunt
          code={`SELECT t.id, u.username
FROM tasks AS t
JOIN users AS u ON t.id = u.id;`}
          question="Почему условие не описывает владельца задачи?"
          options={[
            "Сравниваются независимые primary key",
            "JOIN запрещён для id",
            "Нужно удалить FROM",
          ]}
          correctIndex={0}
          explanation="Связь хранится в t.user_id, поэтому сравнивать нужно t.user_id = u.id."
          fix={`SELECT t.id, u.username
FROM tasks AS t
JOIN users AS u ON t.user_id = u.id;`}
        />

        <CodeBlock
          caption="рабочая версия для StudyHub"
          code={`def list_tasks_with_owner(session: Session):
    stmt = (
        select(
            TaskModel.id,
            TaskModel.title,
            UserModel.username.label("owner"),
        )
        .join(UserModel, TaskModel.user_id == UserModel.id)
        .order_by(TaskModel.id)
    )
    return session.execute(stmt).mappings().all()`}
        />

        <Callout tone="info">
          {
            "Сначала сравните количество строк и несколько известных связей, затем подключайте запрос к HTTP-ответу."
          }
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {
            "Ученик строит INNER JOIN задач, пользователей и категорий и объясняет происхождение каждой колонки результата. Перед переходом дальше нужно объяснить успешный путь, ожидаемую ошибку и связь ручного SQL с SQLAlchemy."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Что определяет условие ON?"
            options={[
              "Какие строки образуют пару",
              "Какие колонки удалить",
              "Когда сделать commit",
            ]}
            correctIndex={0}
            explanation="ON формулирует правило сопоставления строк."
          />
          <QuizCard
            question="Почему username может повторяться?"
            options={[
              "У пользователя несколько задач",
              "PRIMARY KEY сломан",
              "JOIN всегда дублирует всё",
            ]}
            correctIndex={0}
            explanation="One-to-many даёт одну строку результата на каждую задачу."
          />
          <QuizCard
            question="Как явно указать источник id?"
            options={["tasks.id", "id.tasks", "tasks->id"]}
            correctIndex={0}
            explanation="Квалифицированное имя записывается table.column."
          />
          <QuizCard
            question="Что вернёт scalars() при select(Task.id, User.username)?"
            options={[
              "Только первый элемент каждой строки, поэтому это неподходящий выбор для полной проекции",
              "Два ORM-объекта",
              "Автоматический dict",
            ]}
            correctIndex={0}
            explanation="Для нескольких колонок удобнее rows, mappings или явная схема результата."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"JOIN соединяет строки по явному условию."}</>,
            <>{"Foreign key задачи сравнивается с primary key владельца."}</>,
            <>{"INNER JOIN оставляет только совпавшие пары."}</>,
            <>{"Qualified columns устраняют неоднозначность."}</>,
            <>{"Повтор родительских значений отражает one-to-many."}</>,
            <>{"SQLAlchemy строит тот же запрос через select и join."}</>,
            <>{"Неверный ON проверяется на маленьком известном наборе."}</>,
          ]}
        />

        <PracticeCta text="Добавьте отчёт задач с владельцем и категорией: сначала сохраните raw SQL в sql-lab, затем реализуйте SQLAlchemy statement, endpoint и тест на правильное происхождение полей." />
      </Section>
    </RichLesson>
  );
}

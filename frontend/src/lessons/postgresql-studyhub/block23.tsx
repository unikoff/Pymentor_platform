import {
  AlertTriangle,
  BarChart3,
  Braces,
  GitFork,
  KeyRound,
  Layers,
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
  FillBlank,
  KeyTakeaways,
  Lead,
  MethodGrid,
  PracticeCta,
  PredictOutput,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  StepThrough,
  TerminalDemo,
  TypeCard,
  TypeCards,
} from "../shared";

type TheoryBridgeData = { link: string; boundary: string };

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  129: {
    link: "После переноса StudyHub на PostgreSQL отдельные таблицы уже надёжно хранят данные. Теперь нужно собрать связанный ответ, не дублируя username и category name внутри каждой задачи.",
    boundary:
      "INNER JOIN оставляет только пары, для которых условие ON истинно. Отсутствующая связь означает отсутствие всей строки в результате.",
  },
  130: {
    link: "INNER JOIN уже собирает существующие связи. Теперь отчёт должен показывать и задачи без категории, и пользователей без задач — отсутствие связи становится содержательным результатом.",
    boundary:
      "Условие на правую таблицу в WHERE после LEFT JOIN может удалить строки с NULL и незаметно превратить результат в аналог INNER JOIN.",
  },
  131: {
    link: "One-to-many уже связывает задачу с одним владельцем и одной категорией. Теги требуют другой модели: у задачи много тегов, и один тег принадлежит многим задачам.",
    boundary:
      "Список tag_id в одной колонке скрывает связи от ограничений и JOIN. В реляционной модели каждая пара хранится отдельной строкой таблицы связи.",
  },
  132: {
    link: "JOIN уже создаёт связанный набор строк. Теперь отчёт должен не перечислять каждую задачу, а сжимать набор в понятные показатели по пользователям и категориям.",
    boundary:
      "GROUP BY меняет единицу результата: одна строка представляет группу. Любая выбранная неагрегированная колонка должна согласоваться с группировкой.",
  },
  133: {
    link: "GROUP BY уже строит статистические строки. Теперь нужно выбирать только значимые группы и отвечать на вопросы «существует ли хотя бы одна строка» без загрузки полного списка.",
    boundary:
      "WHERE фильтрует исходные строки до группировки, HAVING — готовые группы после агрегата. Подмена одного другим меняет набор данных.",
  },
  134: {
    link: "Отдельный CRUD уже использовал commit. Теперь одна пользовательская команда меняет несколько таблиц, поэтому граница транзакции должна совпасть с границей бизнес-операции.",
    boundary:
      "Два последовательных commit создают две независимые транзакции. Ошибка второго шага уже не может отменить первый сохранённый результат.",
  },
};

function TheoryBridge({ lesson }: { lesson: number }) {
  const bridge = THEORY_BRIDGES[lesson];

  if (!bridge) {
    return null;
  }

  return (
    <Callout tone="info">
      <strong>Связь с курсом.</strong> {bridge.link}{" "}
      <strong>Важно не перепутать:</strong> {bridge.boundary}
    </Callout>
  );
}

const BLOCK_TITLE = "Блок 23 · JOIN, агрегаты и транзакции";

// 129. INNER JOIN и связанные строки
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
      <TheoryBridge lesson={129} />

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

// 130. LEFT JOIN и отсутствующие связи
export function Lesson130({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title="LEFT JOIN и отсутствующие связи"
        intro="Научимся сохранять строки левой таблицы, даже когда связанного объекта нет: разберём NULL справа, различие ON и WHERE, пользователей без задач и outer join в SQLAlchemy."
        tags={[
          { icon: <Layers size={14} />, label: "INNER против LEFT" },
          {
            icon: <AlertTriangle size={14} />,
            label: "NULL и отсутствующая связь",
          },
        ]}
      />
      <TheoryBridge lesson={130} />

      <Section number="01" title="Когда совпадения может не быть">
        <Lead>
          {
            "Категория у задачи необязательна, а новый пользователь может ещё не создать ни одной задачи. Если отчёт должен сохранить такие сущности, INNER JOIN недостаточен."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Левая таблица</h3>
          <p>{"Определяет строки, которые обязаны остаться."}</p>
          <h3>Правая таблица</h3>
          <p>{"Добавляет найденные значения или NULL."}</p>
          <h3>Вопрос</h3>
          <p>{"Нужны только совпадения или весь левый набор?"}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Выбрать главный набор:"}</strong>{" "}
              {"FROM определяет левую сторону"}
            </li>
            <li>
              <strong>{"Попробовать найти связь:"}</strong>{" "}
              {"ON проверяет совпадение"}
            </li>
            <li>
              <strong>{"Сохранить отсутствие:"}</strong>{" "}
              {"справа появляются NULL"}
            </li>
          </ol>
          <p>
            {
              "LEFT относится к положению таблицы в запросе, а не к её важности в предметной области."
            }
          </p>
        </div>

        <Callout tone="info">
          {
            "LEFT относится к положению таблицы в запросе, а не к её важности в предметной области."
          }
        </Callout>
      </Section>

      <Section
        number="02"
        title="INNER JOIN и LEFT JOIN отвечают на разные вопросы"
      >
        <Lead>
          {
            "INNER JOIN спрашивает «какие пары существуют», LEFT JOIN — «покажи все строки слева и всё, что удалось найти справа»."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>INNER</h3>
          <p>{"Только задачи с категорией."}</p>
          <h3>LEFT</h3>
          <p>{"Все задачи, включая category_id IS NULL."}</p>
          <h3>Выбор</h3>
          <p>{"Определяется контрактом отчёта."}</p>
        </div>

        <TypeCards>
          <TypeCard
            badge="INNER"
            title="Только совпадения"
            code={`tasks JOIN categories`}
          >
            {"Задача без категории исчезает."}
          </TypeCard>
          <TypeCard
            badge="LEFT"
            badgeTone="float"
            title="Сохранить tasks"
            code={`tasks LEFT JOIN categories`}
          >
            {"Задача остаётся, category columns становятся NULL."}
          </TypeCard>
          <TypeCard
            badge="RIGHT?"
            badgeTone="str"
            title="Не нужен для модели"
            code={`categories LEFT JOIN tasks`}
          >
            {"Ту же задачу проще выразить перестановкой источников."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question="Какая таблица гарантированно сохраняется при LEFT JOIN?"
          answer={
            <p>
              {
                "Таблица, записанная слева от LEFT JOIN, то есть источник после FROM."
              }
            </p>
          }
        />

        <Callout tone="info">
          {
            "Перед выбором JOIN сформулируйте, что должна представлять одна строка результата."
          }
        </Callout>
      </Section>

      <Section number="03" title="NULL справа — ожидаемый результат">
        <Lead>
          {
            "Если совпадение не найдено, колонки правой таблицы получают NULL. Это не ошибка запроса, а точное описание отсутствующей связи."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Task #20</h3>
          <p>{"category_id = NULL."}</p>
          <h3>LEFT JOIN</h3>
          <p>{"Задача сохраняется."}</p>
          <h3>Result</h3>
          <p>{"category_name = NULL."}</p>
        </div>

        <StepThrough
          code={`tasks:      (20, "Без категории", category_id=NULL)
categories: (1, "database"), (2, "python")

LEFT JOIN categories ON tasks.category_id = categories.id`}
          steps={[
            {
              line: 0,
              note: "Берём задачу #20 из левого набора.",
              vars: { task: "#20" },
            },
            {
              line: 1,
              note: "Ни одна category не соответствует NULL.",
              vars: { match: "нет" },
            },
            {
              line: 3,
              note: "Левая строка всё равно сохраняется.",
              vars: { task: "#20", category: "NULL" },
            },
            {
              line: 3,
              note: "Response schema должна разрешать null.",
              vars: { category_name: "str | None" },
            },
          ]}
        />

        <PredictOutput
          code={`SELECT t.id, t.title, c.name
FROM tasks AS t
LEFT JOIN categories AS c ON t.category_id = c.id;`}
          output={`20 | Без категории | NULL`}
          hint="Сначала предскажите результат, затем подтвердите его на минимальном наборе данных."
        />

        <Callout tone="info">
          {
            "Если Pydantic-схема требует обязательную строку, корректный SQL-результат с NULL превратится в ошибку сериализации."
          }
        </Callout>
      </Section>

      <Section number="04" title="Условие в ON и условие в WHERE">
        <Lead>
          {
            "Место фильтра меняет смысл запроса. Условие в ON решает, какая правая строка присоединяется; WHERE фильтрует уже построенный результат."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>ON</h3>
          <p>{"Ограничивает допустимое совпадение."}</p>
          <h3>WHERE</h3>
          <p>{"Удаляет готовые строки результата."}</p>
          <h3>NULL</h3>
          <p>{"Сравнение в WHERE не становится True и строка исчезает."}</p>
        </div>

        <CompareSolutions
          question="Какой вариант точнее сохраняет требуемый контракт?"
          left={{
            title: "Фильтр после JOIN",
            code: `FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
WHERE c.is_active = TRUE`,
            note: "Задачи без категории исчезают.",
          }}
          right={{
            title: "Фильтр внутри ON",
            code: `FROM tasks t
LEFT JOIN categories c
  ON t.category_id = c.id
 AND c.is_active = TRUE`,
            note: "Все задачи остаются; неактивная категория не присоединяется.",
          }}
          preferred="right"
          explanation="Предпочтительный вариант делает источник данных, границу операции и наблюдаемый результат явными."
        />

        <FillBlank
          prompt="Сохраните задачи без категории."
          before={`LEFT JOIN categories AS c `}
          after={` t.category_id = c.id`}
          options={["ON", "WHERE", "HAVING"]}
          answer="ON"
          explanation="Условие связи начинается с ON."
        />

        <Callout tone="info">
          {
            "Нельзя назвать один вариант всегда правильным. Выбор зависит от того, должны ли строки без подходящей категории остаться."
          }
        </Callout>
      </Section>

      <Section number="05" title="Пользователи без задач как anti-join">
        <Lead>
          {
            "LEFT JOIN удобно использовать для поиска отсутствия: сохраняем всех пользователей, присоединяем задачи и оставляем строки, где справа ничего не найдено."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>FROM users</h3>
          <p>{"Сохраняем всех пользователей."}</p>
          <h3>LEFT JOIN tasks</h3>
          <p>{"Пробуем найти задачи владельца."}</p>
          <h3>WHERE tasks.id IS NULL</h3>
          <p>{"Оставляем только пользователей без совпадений."}</p>
        </div>

        <BranchExplorer
          code={`user anna → task #1 → tasks.id = 1
user max  → task #2 → tasks.id = 2
user ira  → no task → tasks.id = NULL`}
          scenarios={[
            {
              label: "anna",
              activeLine: 0,
              output: "не проходит WHERE tasks.id IS NULL",
            },
            {
              label: "max",
              activeLine: 1,
              output: "не проходит WHERE tasks.id IS NULL",
            },
            { label: "ira", activeLine: 2, output: "остаётся в результате" },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>LEFT JOIN + IS NULL</>,
              "понятный anti-join для поиска отсутствия",
            ],
            [
              <>NOT EXISTS</>,
              "альтернативная форма, которую разберём в уроке 133",
            ],
            [
              <>COUNT = 0</>,
              "возможен после GROUP BY, но решает более широкую задачу",
            ],
          ]}
        />

        <Callout tone="info">
          {
            "Проверяйте NULL по non-nullable ключу правой таблицы, например tasks.id, а не по полю, которое и само может быть NULL."
          }
        </Callout>
      </Section>

      <Section number="06" title="outerjoin в SQLAlchemy">
        <Lead>
          {
            "В SQLAlchemy 2.x LEFT JOIN выражается через join(..., isouter=True) или outerjoin. Условие и направление остаются теми же, что в ручном SQL."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Источник</h3>
          <p>{"select начинается с левой сущности."}</p>
          <h3>isouter=True</h3>
          <p>{"Меняет INNER на LEFT."}</p>
          <h3>Result mapping</h3>
          <p>{"Nullable field явно отражается в схеме."}</p>
        </div>

        <CodeSequence
          prompt="Соберите statement всех задач с необязательной категорией."
          pieces={[
            {
              id: "select",
              code: "stmt = select(TaskModel.id, TaskModel.title, CategoryModel.name)",
            },
            {
              id: "join",
              code: "stmt = stmt.join(CategoryModel, TaskModel.category_id == CategoryModel.id, isouter=True)",
            },
            { id: "order", code: "stmt = stmt.order_by(TaskModel.id)" },
            {
              id: "execute",
              code: "rows = session.execute(stmt).mappings().all()",
            },
          ]}
          correctOrder={["select", "join", "order", "execute"]}
          explanation="Порядок отражает путь от описания запроса или операции к её выполнению и проверке."
        />

        <TerminalDemo
          title="воспроизводимая проверка"
          lines={[
            { cmd: `python -m app.sql_lab.left_join` },
            { out: `{"id": 20, "title": "Без категории", "name": null}` },
          ]}
        />

        <Callout tone="info">
          {
            "Название Python-метода не меняет модель SQL: по-прежнему важно видеть левый источник и условие ON."
          }
        </Callout>
      </Section>

      <Section number="07" title="Ошибка, которая превращает LEFT в INNER">
        <Lead>
          {
            "Самая частая ошибка появляется не в ключевом слове JOIN, а в последующем WHERE. Проверка правой колонки удаляет строки с NULL."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Симптом</h3>
          <p>{"Строк без категории нет."}</p>
          <h3>Причина</h3>
          <p>{"WHERE требует значение правой таблицы."}</p>
          <h3>Исправление</h3>
          <p>{"Перенести условие в ON или явно разрешить NULL."}</p>
        </div>

        <BugHunt
          code={`SELECT t.id, c.name
FROM tasks AS t
LEFT JOIN categories AS c ON t.category_id = c.id
WHERE c.is_active = TRUE;`}
          question="Почему задача без категории исчезла?"
          options={[
            "WHERE удалил строку с NULL справа",
            "LEFT JOIN не поддерживает boolean",
            "Нужно заменить SELECT на INSERT",
          ]}
          correctIndex={0}
          explanation="Для строки без категории c.is_active имеет NULL, а WHERE оставляет только True."
          fix={`SELECT t.id, c.name
FROM tasks AS t
LEFT JOIN categories AS c
  ON t.category_id = c.id
 AND c.is_active = TRUE;`}
        />

        <CodeBlock
          caption="рабочая версия для StudyHub"
          code={`class TaskWithCategory(BaseModel):
    id: int
    title: str
    category_name: str | None`}
        />

        <Callout tone="info">
          {
            "Добавьте тест с задачей без категории. Он защищает смысл LEFT JOIN лучше, чем проверка только запроса с полными данными."
          }
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {
            "Ученик выбирает INNER или LEFT JOIN по требуемому набору и сохраняет отсутствующие связи в отчёте. Перед переходом дальше нужно объяснить успешный путь, ожидаемую ошибку и связь ручного SQL с SQLAlchemy."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Что сохраняет LEFT JOIN?"
            options={[
              "Все строки левого источника",
              "Все строки правого источника",
              "Только совпадения",
            ]}
            correctIndex={0}
            explanation="Левый набор сохраняется даже без совпадения."
          />
          <QuizCard
            question="Что появляется справа без совпадения?"
            options={["NULL", "Пустая строка автоматически", "Ноль"]}
            correctIndex={0}
            explanation="Колонки правой таблицы получают NULL."
          />
          <QuizCard
            question="Как найти пользователей без задач?"
            options={[
              "LEFT JOIN tasks и WHERE tasks.id IS NULL",
              "INNER JOIN tasks",
              "ORDER BY tasks.id",
            ]}
            correctIndex={0}
            explanation="Anti-join сохраняет пользователей и выбирает отсутствие справа."
          />
          <QuizCard
            question="Где фильтровать активную категорию, чтобы сохранить задачи без категории?"
            options={["В ON", "Только в LIMIT", "После COMMIT"]}
            correctIndex={0}
            explanation="Условие в ON ограничивает совпадение, не удаляя левую строку."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"LEFT JOIN сохраняет весь левый набор."}</>,
            <>{"Отсутствующая связь представляется NULL справа."}</>,
            <>{"INNER и LEFT отвечают на разные вопросы."}</>,
            <>{"Фильтр в WHERE может удалить строки с NULL."}</>,
            <>{"Anti-join находит родителей без детей."}</>,
            <>{"outerjoin повторяет ту же SQL-модель."}</>,
            <>{"Nullable response field входит в контракт отчёта."}</>,
          ]}
        />

        <PracticeCta text="Добавьте два отчёта: все задачи с необязательной категорией и пользователи без задач. Зафиксируйте тесты на NULL и на ошибочный фильтр в WHERE." />
      </Section>
    </RichLesson>
  );
}

// 131. Many-to-many через таблицу связи
export function Lesson131({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title="Many-to-many через таблицу связи"
        intro="Построим отношение многие-ко-многим для тегов задач: спроектируем task_tags, защитим пару составным ключом, выполним JOIN в обе стороны и настроим relationship secondary без скрытой магии."
        tags={[
          { icon: <KeyRound size={14} />, label: "составной ключ" },
          { icon: <GitFork size={14} />, label: "task ↔ task_tags ↔ tag" },
        ]}
      />
      <TheoryBridge lesson={131} />

      <Section number="01" title="Почему одного foreign key недостаточно">
        <Lead>
          {
            "Если добавить tag_id в tasks, одна задача сможет ссылаться только на один тег. Если добавить task_id в tags, один тег сможет относиться только к одной задаче. Нужна отдельная сущность пары."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Task</h3>
          <p>{"Может иметь python, sql и backend."}</p>
          <h3>Tag</h3>
          <p>{"Может встречаться у многих задач."}</p>
          <h3>Связь</h3>
          <p>{"Каждая пара task_id + tag_id хранится отдельно."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Создать task:"}</strong> {"самостоятельная строка"}
            </li>
            <li>
              <strong>{"Создать tag:"}</strong> {"самостоятельная строка"}
            </li>
            <li>
              <strong>{"Добавить пару:"}</strong>{" "}
              {"строка task_tags связывает ключи"}
            </li>
          </ol>
          <p>
            {
              "Many-to-many — это две one-to-many связи через промежуточную таблицу."
            }
          </p>
        </div>

        <Callout tone="info">
          {
            "Many-to-many — это две one-to-many связи через промежуточную таблицу."
          }
        </Callout>
      </Section>

      <Section number="02" title="Association table хранит пары ключей">
        <Lead>
          {
            "Минимальная таблица связи содержит два foreign key. Каждая строка отвечает на один вопрос: связан ли конкретный task с конкретным tag."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>task_id</h3>
          <p>{"Ссылается на tasks.id."}</p>
          <h3>tag_id</h3>
          <p>{"Ссылается на tags.id."}</p>
          <h3>Строка</h3>
          <p>{"Например (10, 3) означает tag #3 у task #10."}</p>
        </div>

        <TypeCards>
          <TypeCard badge="tasks" title="Сущность задачи" code={`id | title`}>
            {"Не хранит массив тегов."}
          </TypeCard>
          <TypeCard
            badge="task_tags"
            badgeTone="float"
            title="Таблица связи"
            code={`task_id | tag_id`}
          >
            {"Хранит только пары и возможные свойства связи."}
          </TypeCard>
          <TypeCard
            badge="tags"
            badgeTone="str"
            title="Справочник тегов"
            code={`id | name`}
          >
            {"Имя тега хранится один раз."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question="Что представляет одна строка task_tags?"
          answer={
            <p>
              {"Один факт связи между конкретной задачей и конкретным тегом."}
            </p>
          }
        />

        <Callout tone="info">
          {
            "Таблица связи может получить собственные поля, например assigned_at или source, если эти данные относятся именно к связи."
          }
        </Callout>
      </Section>

      <Section number="03" title="Составной primary key запрещает дубли">
        <Lead>
          {
            "Одна и та же пара task_id + tag_id не должна появляться дважды. Составной primary key делает комбинацию уникальной на уровне базы."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>PRIMARY KEY</h3>
          <p>{"Может состоять из нескольких колонок."}</p>
          <h3>Уникальность пары</h3>
          <p>{"Повторное назначение того же тега блокируется."}</p>
          <h3>Целостность</h3>
          <p>{"Оба foreign key должны ссылаться на существующие строки."}</p>
        </div>

        <StepThrough
          code={`CREATE TABLE task_tags (
    task_id BIGINT REFERENCES tasks(id),
    tag_id BIGINT REFERENCES tags(id),
    PRIMARY KEY (task_id, tag_id)
);`}
          steps={[
            {
              line: 0,
              note: "Создаётся отдельная таблица связи.",
              vars: { table: "task_tags" },
            },
            {
              line: 1,
              note: "task_id допускает только существующую задачу.",
              vars: { FK: "tasks.id" },
            },
            {
              line: 2,
              note: "tag_id допускает только существующий тег.",
              vars: { FK: "tags.id" },
            },
            {
              line: 3,
              note: "Пара становится уникальным идентификатором строки.",
              vars: { PK: "(task_id, tag_id)" },
            },
          ]}
        />

        <PredictOutput
          code={`INSERT INTO task_tags (task_id, tag_id) VALUES (10, 3);
INSERT INTO task_tags (task_id, tag_id) VALUES (10, 3);`}
          output={`Вторая вставка завершается ошибкой уникальности primary key.`}
          hint="Сначала предскажите результат, затем подтвердите его на минимальном наборе данных."
        />

        <Callout tone="info">
          {
            "Python-проверка «такой пары ещё нет» полезна для понятного ответа, но окончательную защиту даёт constraint базы."
          }
        </Callout>
      </Section>

      <Section number="04" title="Почему массив id в колонке ухудшает модель">
        <Lead>
          {
            'Запись tag_ids = "1,3,8" кажется короткой, но база перестаёт видеть отдельные ссылки. Нельзя надёжно применить foreign key, уникальность пары и обычный JOIN.'
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Строка или JSON</h3>
          <p>{"Скрывает элементы внутри одного значения."}</p>
          <h3>Ограничения</h3>
          <p>{"Не проверяют каждый id отдельно."}</p>
          <h3>Запросы</h3>
          <p>{"Требуют разбора содержимого вместо реляционного JOIN."}</p>
        </div>

        <CompareSolutions
          question="Какой вариант точнее сохраняет требуемый контракт?"
          left={{
            title: "Список внутри tasks",
            code: `tasks.tag_ids = "1,3,8"`,
            note: "Ссылки скрыты, дубли и несуществующие id проходят легче.",
          }}
          right={{
            title: "Отдельные пары",
            code: `task_tags
10 | 1
10 | 3
10 | 8`,
            note: "Каждая связь видима constraints и JOIN.",
          }}
          preferred="right"
          explanation="Предпочтительный вариант делает источник данных, границу операции и наблюдаемый результат явными."
        />

        <FillBlank
          prompt="Завершите составной ключ."
          before={`PRIMARY KEY (task_id, `}
          after={`)`}
          options={["tag_id", "tag_name", "tasks"]}
          answer="tag_id"
          explanation="Уникальной должна быть комбинация двух foreign key."
        />

        <Callout tone="info">
          {
            "JSON-массив может быть оправдан для документа, но не заменяет нормальную many-to-many связь основного реляционного домена."
          }
        </Callout>
      </Section>

      <Section number="05" title="JOIN через таблицу связи в обе стороны">
        <Lead>
          {
            "Чтобы получить теги задачи, запрос проходит tasks → task_tags → tags. Чтобы получить задачи тега, направление чтения меняется, но таблица связи остаётся центром маршрута."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Task → tags</h3>
          <p>{"Фильтр по task_id."}</p>
          <h3>Tag → tasks</h3>
          <p>{"Фильтр по tag_id."}</p>
          <h3>Projection</h3>
          <p>{"Возвращаем данные сущности, а не только ключи пары."}</p>
        </div>

        <BranchExplorer
          code={`task #10
  → task_tags (10, 1) → tag python
  → task_tags (10, 3) → tag sql

tag #3
  → task_tags (10, 3) → task #10
  → task_tags (12, 3) → task #12`}
          scenarios={[
            { label: "теги task #10", activeLine: 1, output: "python, sql" },
            { label: "задачи tag #3", activeLine: 4, output: "#10, #12" },
            { label: "неизвестный tag", activeLine: 5, output: "пустой набор" },
          ]}
        />

        <MethodGrid
          rows={[
            [<>tasks → task_tags</>, "tasks.id = task_tags.task_id"],
            [<>task_tags → tags</>, "task_tags.tag_id = tags.id"],
            [
              <>WHERE tasks.id = :task_id</>,
              "ограничивает маршрут одной задачей",
            ],
          ]}
        />

        <Callout tone="info">
          {
            "Два JOIN не означают две независимые связи. Они описывают один маршрут через промежуточные пары."
          }
        </Callout>
      </Section>

      <Section number="06" title="secondary relationship в SQLAlchemy">
        <Lead>
          {
            "SQLAlchemy может предоставить task.tags и tag.tasks, но relationship не создаёт новую модель данных. Под ним остаются task_tags, два foreign key и JOIN."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Table</h3>
          <p>{"task_tags объявляется как association table."}</p>
          <h3>secondary</h3>
          <p>{"Указывает промежуточную таблицу."}</p>
          <h3>back_populates</h3>
          <p>{"Связывает две стороны Python-навигации."}</p>
        </div>

        <CodeSequence
          prompt="Соберите минимальное объявление many-to-many."
          pieces={[
            {
              id: "table",
              code: 'task_tags = Table("task_tags", Base.metadata, ...)',
            },
            {
              id: "task",
              code: 'TaskModel.tags = relationship(secondary=task_tags, back_populates="tasks")',
            },
            {
              id: "tag",
              code: 'TagModel.tasks = relationship(secondary=task_tags, back_populates="tags")',
            },
            { id: "use", code: "task.tags.append(tag)" },
            { id: "commit", code: "session.commit()" },
          ]}
          correctOrder={["table", "task", "tag", "use", "commit"]}
          explanation="Порядок отражает путь от описания запроса или операции к её выполнению и проверке."
        />

        <TerminalDemo
          title="воспроизводимая проверка"
          lines={[
            { cmd: `python -m app.sql_lab.tags` },
            {
              out: `task #10 tags: python, sql
tag sql tasks: #10, #12`,
            },
          ]}
        />

        <Callout tone="info">
          {
            "Для связи с собственными важными полями вместо простой secondary-table обычно нужна association object model."
          }
        </Callout>
      </Section>

      <Section number="07" title="Cascade и безопасное удаление связи">
        <Lead>
          {
            "Удаление пары task_tags и удаление самого Tag — разные операции. Cascade проектируется явно, чтобы очистка связи не уничтожила общий справочник неожиданно."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Убрать тег у задачи</h3>
          <p>{"Удалить одну строку task_tags."}</p>
          <h3>Удалить задачу</h3>
          <p>{"Удалить её пары по согласованному cascade."}</p>
          <h3>Удалить tag</h3>
          <p>{"Сначала определить, допустимо ли удалять общий справочник."}</p>
        </div>

        <BugHunt
          code={`def remove_tag(task: TaskModel, tag: TagModel, session: Session):
    session.delete(tag)
    session.commit()`}
          question="Почему функция делает слишком широкое изменение?"
          options={[
            "Она удаляет сам общий Tag, а не только связь",
            "relationship нельзя менять",
            "commit запрещён после delete",
          ]}
          correctIndex={0}
          explanation="Чтобы убрать тег у одной задачи, достаточно удалить связь через task.tags.remove(tag)."
          fix={`def remove_tag(task: TaskModel, tag: TagModel, session: Session):
    task.tags.remove(tag)
    session.commit()`}
        />

        <CodeBlock
          caption="рабочая версия для StudyHub"
          code={`DELETE FROM task_tags
WHERE task_id = :task_id
  AND tag_id = :tag_id
RETURNING task_id, tag_id;`}
        />

        <Callout tone="info">
          {
            "Тест должен проверить, что tag остаётся доступен другим задачам после удаления одной связи."
          }
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {
            "Ученик проектирует task_tags, получает теги задачи и задачи тега и понимает роль secondary relationship. Перед переходом дальше нужно объяснить успешный путь, ожидаемую ошибку и связь ручного SQL с SQLAlchemy."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Зачем нужна task_tags?"
            options={[
              "Хранить пары task и tag",
              "Заменить таблицу tasks",
              "Хранить пароль",
            ]}
            correctIndex={0}
            explanation="Промежуточная таблица представляет many-to-many связь."
          />
          <QuizCard
            question="Что защищает PRIMARY KEY (task_id, tag_id)?"
            options={[
              "Уникальность пары",
              "Уникальность названия задачи",
              "Порядок тегов",
            ]}
            correctIndex={0}
            explanation="Одна связь не может быть записана дважды."
          />
          <QuizCard
            question="Сколько JOIN нужно для tags одной task?"
            options={["Два", "Ноль", "Всегда четыре"]}
            correctIndex={0}
            explanation="Маршрут проходит через task_tags к tags."
          />
          <QuizCard
            question="Как убрать tag только у одной task?"
            options={[
              "Удалить строку связи",
              "Удалить весь Tag",
              "Очистить таблицу tasks",
            ]}
            correctIndex={0}
            explanation="Сущность тега может использоваться другими задачами."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Many-to-many раскладывается на две one-to-many связи."}</>,
            <>{"task_tags хранит отдельные пары ключей."}</>,
            <>{"Составной primary key защищает от дубля пары."}</>,
            <>{"Foreign key сохраняют ссылочную целостность."}</>,
            <>{"JOIN проходит через промежуточную таблицу."}</>,
            <>{"secondary relationship не отменяет SQL-модель."}</>,
            <>{"Cascade проектируется отдельно для связи и сущности."}</>,
          ]}
        />

        <PracticeCta text="Добавьте tags и task_tags, endpoint назначения тега, чтение тегов задачи и задач тега. Покройте тестом повторную пару и удаление только связи." />
      </Section>
    </RichLesson>
  );
}

// 132. COUNT, GROUP BY и статистика StudyHub
export function Lesson132({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title="COUNT, GROUP BY и статистика StudyHub"
        intro="Перейдём от списков строк к показателям: разберём COUNT, SUM, AVG, GROUP BY, нулевые значения после LEFT JOIN и соберём первый статистический endpoint StudyHub."
        tags={[
          { icon: <BarChart3 size={14} />, label: "агрегаты и метрики" },
          { icon: <Layers size={14} />, label: "GROUP BY" },
        ]}
      />
      <TheoryBridge lesson={132} />

      <Section number="01" title="От списка объектов к показателю">
        <Lead>
          {
            "GET /tasks отвечает «какие задачи существуют». Статистика отвечает на другой вопрос: сколько их, сколько завершено и как значения распределены по владельцам или категориям."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Строки</h3>
          <p>{"Детальные объекты для просмотра."}</p>
          <h3>Агрегат</h3>
          <p>{"Одно вычисленное значение для набора."}</p>
          <h3>Группа</h3>
          <p>{"Отдельный показатель для каждого ключа."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Выбрать строки:"}</strong>{" "}
              {"FROM, JOIN и WHERE формируют набор"}
            </li>
            <li>
              <strong>{"Разделить на группы:"}</strong> {"GROUP BY задаёт ключ"}
            </li>
            <li>
              <strong>{"Вычислить показатель:"}</strong> {"COUNT, SUM или AVG"}
            </li>
          </ol>
          <p>
            {
              "Агрегат не хранит новое значение автоматически. Это результат запроса в момент чтения."
            }
          </p>
        </div>

        <Callout tone="info">
          {
            "Агрегат не хранит новое значение автоматически. Это результат запроса в момент чтения."
          }
        </Callout>
      </Section>

      <Section number="02" title="COUNT(*) и COUNT(column)">
        <Lead>
          {
            "COUNT(*) считает строки группы, а COUNT(column) — только строки, где выбранная колонка не NULL. После LEFT JOIN это различие принципиально."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>COUNT(*)</h3>
          <p>{"Считает каждую строку результата."}</p>
          <h3>COUNT(tasks.id)</h3>
          <p>{"Не считает NULL справа."}</p>
          <h3>Alias</h3>
          <p>{"AS task_count делает смысл результата явным."}</p>
        </div>

        <TypeCards>
          <TypeCard badge="COUNT(*)" title="Количество строк" code={`COUNT(*)`}>
            {"Включает строки независимо от NULL в отдельных колонках."}
          </TypeCard>
          <TypeCard
            badge="COUNT(column)"
            badgeTone="float"
            title="Количество известных значений"
            code={`COUNT(t.completed_at)`}
          >
            {"Пропускает NULL в выбранной колонке."}
          </TypeCard>
          <TypeCard
            badge="COUNT(DISTINCT)"
            badgeTone="str"
            title="Уникальные значения"
            code={`COUNT(DISTINCT t.user_id)`}
          >
            {"Убирает повторы только по явному требованию."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question="Почему для пользователей без задач после LEFT JOIN нужен COUNT(tasks.id), а не COUNT(*)?"
          answer={
            <p>
              {
                "LEFT JOIN создаёт строку пользователя даже без задачи. COUNT(*) посчитает её как 1, а COUNT(tasks.id) пропустит NULL и вернёт 0."
              }
            </p>
          }
        />

        <Callout tone="info">
          {
            "Всегда называйте, что именно считает COUNT: строки, непустые значения или уникальные значения."
          }
        </Callout>
      </Section>

      <Section number="03" title="GROUP BY меняет форму результата">
        <Lead>
          {
            "Без GROUP BY агрегат сворачивает весь набор в одну строку. GROUP BY создаёт отдельную корзину для каждого значения ключа и вычисляет агрегат внутри каждой корзины."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Ключ группы</h3>
          <p>{"Например users.id."}</p>
          <h3>Строки группы</h3>
          <p>{"Все tasks этого пользователя."}</p>
          <h3>Одна строка результата</h3>
          <p>{"username + task_count."}</p>
        </div>

        <StepThrough
          code={`tasks
user_id | id
1       | 10
1       | 11
2       | 12

GROUP BY user_id`}
          steps={[
            {
              line: 0,
              note: "Исходный набор содержит три задачи.",
              vars: { rows: "3" },
            },
            {
              line: 1,
              note: "Строки с user_id = 1 попадают в одну группу.",
              vars: { "group 1": "#10, #11" },
            },
            {
              line: 3,
              note: "Строка user_id = 2 образует вторую группу.",
              vars: { "group 2": "#12" },
            },
            {
              line: 5,
              note: "COUNT(*) вычисляется отдельно для каждой группы.",
              vars: { "1": "2", "2": "1" },
            },
          ]}
        />

        <PredictOutput
          code={`SELECT user_id, COUNT(*) AS task_count
FROM tasks
GROUP BY user_id
ORDER BY user_id;`}
          output={`1 | 2
2 | 1`}
          hint="Сначала предскажите результат, затем подтвердите его на минимальном наборе данных."
        />

        <Callout tone="info">
          {
            "После GROUP BY нельзя случайно выбрать tasks.title: внутри одной группы может быть несколько разных title."
          }
        </Callout>
      </Section>

      <Section number="04" title="COUNT, SUM и условная статистика">
        <Lead>
          {
            "Количество завершённых задач можно получить через SUM по условному 1/0. Так один GROUP BY возвращает и общее число, и число завершений."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>COUNT</h3>
          <p>{"Все задачи пользователя."}</p>
          <h3>CASE</h3>
          <p>{"Преобразует выполненную задачу в 1."}</p>
          <h3>SUM</h3>
          <p>{"Складывает единицы внутри группы."}</p>
        </div>

        <CompareSolutions
          question="Какой вариант точнее сохраняет требуемый контракт?"
          left={{
            title: "Два отдельных запроса",
            code: `SELECT COUNT(*) ...;
SELECT COUNT(*) WHERE is_done = TRUE ...;`,
            note: "База дважды строит похожий набор.",
          }}
          right={{
            title: "Одна группировка",
            code: `SELECT user_id,
       COUNT(*) AS total,
       SUM(CASE WHEN is_done THEN 1 ELSE 0 END) AS done
FROM tasks
GROUP BY user_id;`,
            note: "Один набор даёт две метрики.",
          }}
          preferred="right"
          explanation="Предпочтительный вариант делает источник данных, границу операции и наблюдаемый результат явными."
        />

        <FillBlank
          prompt="Завершите агрегат выполненных задач."
          before={`SUM(CASE WHEN is_done THEN `}
          after={` ELSE 0 END)`}
          options={["1", "NULL", "COUNT"]}
          answer="1"
          explanation="Каждая выполненная строка добавляет единицу к сумме."
        />

        <Callout tone="info">
          {
            "В PostgreSQL также доступен FILTER, но CASE показывает переносимую и прозрачную модель условного агрегата."
          }
        </Callout>
      </Section>

      <Section number="05" title="AVG, MIN и MAX по категории">
        <Lead>
          {
            "Агрегаты могут считать не только количество. AVG показывает средний приоритет, MIN и MAX — границы значений внутри каждой категории."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>AVG(priority)</h3>
          <p>{"Среднее числовое значение."}</p>
          <h3>MIN/MAX</h3>
          <p>{"Наименьшее и наибольшее."}</p>
          <h3>NULL</h3>
          <p>{"Большинство агрегатов пропускает отсутствующие значения."}</p>
        </div>

        <BranchExplorer
          code={`database: priorities 5, 3, 4
python:   priorities 2, 4
empty:    no tasks`}
          scenarios={[
            {
              label: "database",
              activeLine: 0,
              output: "AVG = 4.0, MIN = 3, MAX = 5",
            },
            {
              label: "python",
              activeLine: 1,
              output: "AVG = 3.0, MIN = 2, MAX = 4",
            },
            {
              label: "empty category",
              activeLine: 2,
              output: "COUNT = 0, AVG = NULL",
            },
          ]}
        />

        <MethodGrid
          rows={[
            [<>AVG(t.priority)</>, "средний приоритет непустых значений"],
            [
              <>COALESCE(AVG(...), 0)</>,
              "явно заменяет NULL только если контракт требует 0",
            ],
            [
              <>ROUND(..., 2)</>,
              "форматирует точность результата на уровне SQL",
            ],
          ]}
        />

        <Callout tone="info">
          {
            "Не заменяйте NULL на 0 автоматически: «нет данных» и «среднее равно нулю» могут означать разные состояния."
          }
        </Callout>
      </Section>

      <Section number="06" title="LEFT JOIN сохраняет нулевые группы">
        <Lead>
          {
            "Обычный INNER JOIN не вернёт пользователя без задач. Чтобы статистика показывала zero, начинаем с users, применяем LEFT JOIN и считаем tasks.id."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Все users</h3>
          <p>{"Левая таблица сохраняется."}</p>
          <h3>NULL task</h3>
          <p>{"Отсутствующая задача не считается."}</p>
          <h3>GROUP BY user</h3>
          <p>{"Каждый пользователь получает отдельную строку."}</p>
        </div>

        <CodeSequence
          prompt="Соберите запрос количества задач для всех пользователей."
          pieces={[
            {
              id: "select",
              code: "SELECT u.id, u.username, COUNT(t.id) AS task_count",
            },
            { id: "from", code: "FROM users AS u" },
            { id: "join", code: "LEFT JOIN tasks AS t ON t.user_id = u.id" },
            { id: "group", code: "GROUP BY u.id, u.username" },
            { id: "order", code: "ORDER BY u.id;" },
          ]}
          correctOrder={["select", "from", "join", "group", "order"]}
          explanation="Порядок отражает путь от описания запроса или операции к её выполнению и проверке."
        />

        <TerminalDemo
          title="воспроизводимая проверка"
          lines={[
            { cmd: `psql "$DATABASE_URL" -f sql-lab/user_stats.sql` },
            {
              out: `anna | 2
max  | 1
ira  | 0`,
            },
          ]}
        />

        <Callout tone="info">
          {
            "Группируйте по устойчивому ключу пользователя; username можно добавить в GROUP BY для явной SQL-модели."
          }
        </Callout>
      </Section>

      <Section number="07" title="SQLAlchemy func и статистический endpoint">
        <Lead>
          {
            "SQLAlchemy предоставляет func.count, func.sum и func.avg, но запрос остаётся тем же: выбрать ключи, присоединить данные, сгруппировать и подписать вычисления."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>func</h3>
          <p>{"Создаёт SQL-функцию в statement."}</p>
          <h3>label</h3>
          <p>{"Даёт вычислению стабильное имя."}</p>
          <h3>Response schema</h3>
          <p>{"Фиксирует типы total, done и average."}</p>
        </div>

        <BugHunt
          code={`stmt = select(
    UserModel.username,
    TaskModel.title,
    func.count(TaskModel.id),
).join(TaskModel).group_by(UserModel.id)`}
          question="Почему TaskModel.title нельзя выбрать в такой группировке?"
          options={[
            "В группе несколько title, а колонка не агрегирована",
            "COUNT запрещён с JOIN",
            "username должен быть числом",
          ]}
          correctIndex={0}
          explanation="Каждая строка результата представляет пользователя, но у него может быть много разных title."
          fix={`stmt = (
    select(
        UserModel.id,
        UserModel.username,
        func.count(TaskModel.id).label("task_count"),
    )
    .join(TaskModel, isouter=True)
    .group_by(UserModel.id, UserModel.username)
)`}
        />

        <CodeBlock
          caption="рабочая версия для StudyHub"
          code={`@router.get("/reports/users", response_model=list[UserStats])
def user_stats(session: SessionDep):
    return session.execute(build_user_stats()).mappings().all()`}
        />

        <Callout tone="info">
          {
            "Тестируйте пользователя с двумя задачами и пользователя без задач — иначе ошибка COUNT(*) может остаться незаметной."
          }
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {
            "Ученик считает задачи и завершения по пользователю, средний приоритет по категории и реализует статистический endpoint. Перед переходом дальше нужно объяснить успешный путь, ожидаемую ошибку и связь ручного SQL с SQLAlchemy."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Что считает COUNT(column)?"
            options={[
              "Непустые значения колонки",
              "Все строки всегда",
              "Только уникальные таблицы",
            ]}
            correctIndex={0}
            explanation="NULL в выбранной колонке не учитывается."
          />
          <QuizCard
            question="Что делает GROUP BY?"
            options={[
              "Создаёт группы для отдельных агрегатов",
              "Сортирует строки",
              "Начинает транзакцию",
            ]}
            correctIndex={0}
            explanation="Агрегат вычисляется отдельно внутри каждой группы."
          />
          <QuizCard
            question="Как сохранить пользователя без задач?"
            options={[
              "LEFT JOIN и COUNT(tasks.id)",
              "INNER JOIN и COUNT(*)",
              "DELETE tasks",
            ]}
            correctIndex={0}
            explanation="LEFT JOIN сохраняет пользователя, COUNT(tasks.id) даёт 0."
          />
          <QuizCard
            question="Почему title нельзя выбрать при GROUP BY user?"
            options={[
              "В группе может быть много title",
              "Строки запрещены в SELECT",
              "AVG требует title",
            ]}
            correctIndex={0}
            explanation="Неагрегированная колонка должна однозначно определяться ключом группы."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Агрегат сворачивает набор строк в показатель."}</>,
            <>{"COUNT(*) и COUNT(column) имеют разный смысл."}</>,
            <>{"GROUP BY задаёт единицу одной строки результата."}</>,
            <>{"CASE + SUM считает условные события."}</>,
            <>{"AVG, MIN и MAX работают внутри группы."}</>,
            <>{"LEFT JOIN сохраняет нулевые группы."}</>,
            <>{"func и label переводят SQL-агрегаты в SQLAlchemy."}</>,
          ]}
        />

        <PracticeCta text="Создайте GET /reports/users со total_tasks и done_tasks и GET /reports/categories со средним приоритетом. Добавьте пользователя и категорию без задач в тестовые данные." />
      </Section>
    </RichLesson>
  );
}

// 133. HAVING, EXISTS и подзапросы
export function Lesson133({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title="HAVING, EXISTS и подзапросы"
        intro="Научимся фильтровать группы после COUNT, проверять существование без загрузки объектов и читать коррелированные и scalar-подзапросы без лишней вложенности."
        tags={[
          { icon: <Search size={14} />, label: "WHERE и HAVING" },
          { icon: <Braces size={14} />, label: "EXISTS и subquery" },
        ]}
      />
      <TheoryBridge lesson={133} />

      <Section number="01" title="Три уровня вопроса к данным">
        <Lead>
          {
            "Запрос может фильтровать отдельные строки, сформированные группы или проверять сам факт существования совпадения. Эти задачи похожи по словам, но выполняются на разных этапах."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>WHERE</h3>
          <p>{"Какие исходные строки участвуют?"}</p>
          <h3>HAVING</h3>
          <p>{"Какие готовые группы оставить?"}</p>
          <h3>EXISTS</h3>
          <p>{"Есть ли хотя бы одно совпадение?"}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"WHERE:"}</strong> {"ограничить строки до GROUP BY"}
            </li>
            <li>
              <strong>{"GROUP BY:"}</strong> {"создать статистические группы"}
            </li>
            <li>
              <strong>{"HAVING / EXISTS:"}</strong>{" "}
              {"отфильтровать группы или проверить факт"}
            </li>
          </ol>
          <p>
            {
              "Сначала сформулируйте единицу фильтра: одна task, одна группа user или логический ответ."
            }
          </p>
        </div>

        <Callout tone="info">
          {
            "Сначала сформулируйте единицу фильтра: одна task, одна группа user или логический ответ."
          }
        </Callout>
      </Section>

      <Section number="02" title="WHERE и HAVING нельзя менять местами">
        <Lead>
          {
            "WHERE применяется до группировки и не может напрямую проверять COUNT группы. HAVING выполняется после GROUP BY и умеет сравнивать агрегаты."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>WHERE is_done</h3>
          <p>{"В группу попадут только завершённые tasks."}</p>
          <h3>HAVING COUNT</h3>
          <p>{"Оставит пользователей с нужным размером группы."}</p>
          <h3>Оба</h3>
          <p>{"Можно сочетать, если нужны оба ограничения."}</p>
        </div>

        <TypeCards>
          <TypeCard
            badge="WHERE"
            title="Фильтр строк"
            code={`WHERE t.is_done = TRUE`}
          >
            {"Работает до группировки."}
          </TypeCard>
          <TypeCard
            badge="GROUP BY"
            badgeTone="float"
            title="Создание групп"
            code={`GROUP BY u.id`}
          >
            {"Определяет одну строку результата."}
          </TypeCard>
          <TypeCard
            badge="HAVING"
            badgeTone="str"
            title="Фильтр групп"
            code={`HAVING COUNT(t.id) >= 3`}
          >
            {"Работает после агрегата."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question="Где проверить «у пользователя минимум три задачи»?"
          answer={
            <p>
              {
                "В HAVING COUNT(tasks.id) >= 3, потому что условие относится к размеру готовой группы."
              }
            </p>
          }
        />

        <Callout tone="info">
          {
            "Alias агрегата не во всех СУБД доступен в HAVING одинаково; явное COUNT(...) делает запрос переносимее."
          }
        </Callout>
      </Section>

      <Section number="03" title="HAVING фильтрует статистические группы">
        <Lead>
          {
            "Пользователи с тремя и более задачами появляются после группировки. Пошаговая модель помогает увидеть, почему WHERE здесь слишком рано."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Rows</h3>
          <p>{"Сначала выбираются задачи."}</p>
          <h3>Groups</h3>
          <p>{"Строки собираются по user_id."}</p>
          <h3>HAVING</h3>
          <p>{"Проверяется COUNT каждой группы."}</p>
        </div>

        <StepThrough
          code={`SELECT user_id, COUNT(*) AS task_count
FROM tasks
GROUP BY user_id
HAVING COUNT(*) >= 3;`}
          steps={[
            {
              line: 0,
              note: "SELECT задаёт ключ и агрегат результата.",
              vars: { columns: "user_id, count" },
            },
            {
              line: 1,
              note: "FROM формирует исходный набор tasks.",
              vars: { source: "tasks" },
            },
            {
              line: 2,
              note: "GROUP BY создаёт группу каждого user_id.",
              vars: { groups: "по владельцу" },
            },
            {
              line: 3,
              note: "HAVING оставляет группы с count не меньше трёх.",
              vars: { condition: "count >= 3" },
            },
          ]}
        />

        <PredictOutput
          code={`user 1: 4 tasks
user 2: 2 tasks
user 3: 3 tasks

HAVING COUNT(*) >= 3`}
          output={`user 1
user 3`}
          hint="Сначала предскажите результат, затем подтвердите его на минимальном наборе данных."
        />

        <Callout tone="info">
          {
            "HAVING без GROUP BY возможен как фильтр одной общей группы, но для начинающего маршрута полезнее сначала видеть явный GROUP BY."
          }
        </Callout>
      </Section>

      <Section number="04" title="EXISTS отвечает только да или нет">
        <Lead>
          {
            "Если нужен факт наличия email или активной задачи, загрузка всей строки и тем более всего списка избыточна. EXISTS завершается логическим ответом при найденном совпадении."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Подзапрос</h3>
          <p>{"Описывает подходящие строки."}</p>
          <h3>EXISTS</h3>
          <p>{"Проверяет наличие хотя бы одной."}</p>
          <h3>Projection</h3>
          <p>{"Конкретные колонки подзапроса не важны для факта."}</p>
        </div>

        <CompareSolutions
          question="Какой вариант точнее сохраняет требуемый контракт?"
          left={{
            title: "Загрузить список",
            code: `SELECT * FROM users WHERE email = :email;`,
            note: "Приложение получает строки, хотя нужен только bool.",
          }}
          right={{
            title: "Проверить факт",
            code: `SELECT EXISTS (
  SELECT 1 FROM users WHERE email = :email
);`,
            note: "Результат сразу соответствует вопросу.",
          }}
          preferred="right"
          explanation="Предпочтительный вариант делает источник данных, границу операции и наблюдаемый результат явными."
        />

        <FillBlank
          prompt="Дополните проверку отсутствия."
          before={`SELECT `}
          after={` (SELECT 1 FROM tasks WHERE user_id = :user_id);`}
          options={["NOT EXISTS", "GROUP", "OFFSET"]}
          answer="NOT EXISTS"
          explanation="NOT EXISTS истинно, когда подзапрос не нашёл строк."
        />

        <Callout tone="info">
          {
            "EXISTS не заменяет уникальный constraint email. Он помогает построить сценарий и понятный ответ, а база защищает гонку."
          }
        </Callout>
      </Section>

      <Section number="05" title="NOT EXISTS находит отсутствие связи">
        <Lead>
          {
            "Категории без активных задач удобно искать коррелированным NOT EXISTS: подзапрос проверяется для каждой category и ссылается на её id."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Outer row</h3>
          <p>{"Текущая category."}</p>
          <h3>Correlated subquery</h3>
          <p>{"Ищет active task именно этой category."}</p>
          <h3>NOT EXISTS</h3>
          <p>{"Оставляет category без совпадений."}</p>
        </div>

        <BranchExplorer
          code={`category database → active task exists → NOT EXISTS = false
category python   → only done tasks    → NOT EXISTS = true
category empty    → no tasks           → NOT EXISTS = true`}
          scenarios={[
            { label: "database", activeLine: 0, output: "категория исключена" },
            { label: "python", activeLine: 1, output: "категория возвращена" },
            { label: "empty", activeLine: 2, output: "категория возвращена" },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>t.category_id = c.id</>,
              "корреляция подзапроса с текущей category",
            ],
            [<>t.is_done = FALSE</>, "определяет active task"],
            [
              <>NOT EXISTS (...)</>,
              "оставляет категории без подходящей строки",
            ],
          ]}
        />

        <Callout tone="info">
          {
            "Без связи t.category_id = c.id подзапрос проверит активную задачу во всей базе и даст одинаковый ответ для каждой category."
          }
        </Callout>
      </Section>

      <Section number="06" title="Scalar subquery возвращает одно значение">
        <Lead>
          {
            "Подзапрос может быть частью SELECT, если гарантированно возвращает одно значение. Например, общий count задач рядом с каждой строкой отчёта."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Scalar</h3>
          <p>{"Ровно одно значение."}</p>
          <h3>Aggregate</h3>
          <p>{"COUNT естественно гарантирует одну строку."}</p>
          <h3>Граница</h3>
          <p>{"Многострочный подзапрос нельзя использовать как scalar."}</p>
        </div>

        <CodeSequence
          prompt="Соберите запрос пользователя и общего числа задач."
          pieces={[
            { id: "select", code: "SELECT u.id, u.username," },
            {
              id: "sub",
              code: "       (SELECT COUNT(*) FROM tasks) AS all_tasks",
            },
            { id: "from", code: "FROM users AS u" },
            { id: "order", code: "ORDER BY u.id;" },
          ]}
          correctOrder={["select", "sub", "from", "order"]}
          explanation="Порядок отражает путь от описания запроса или операции к её выполнению и проверке."
        />

        <TerminalDemo
          title="воспроизводимая проверка"
          lines={[
            { cmd: `psql "$DATABASE_URL" -f sql-lab/scalar_subquery.sql` },
            {
              out: `1 | anna | 12
2 | max  | 12`,
            },
          ]}
        />

        <Callout tone="info">
          {
            "Если одно и то же значение повторяется для каждой строки, подумайте, действительно ли оно нужно в каждой строке HTTP-ответа."
          }
        </Callout>
      </Section>

      <Section number="07" title="exists() в SQLAlchemy и граница вложенности">
        <Lead>
          {
            "SQLAlchemy повторяет ту же структуру: exists(select(...).where(...)). Сложный statement полезно разбивать на именованные части, чтобы корреляция и назначение оставались видимыми."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Subquery</h3>
          <p>{"Отдельно описывает подходящие tasks."}</p>
          <h3>exists()</h3>
          <p>{"Оборачивает его в логическую проверку."}</p>
          <h3>where(~exists)</h3>
          <p>{"Выбирает outer rows без совпадений."}</p>
        </div>

        <BugHunt
          code={`active_task = select(TaskModel.id).where(TaskModel.is_done.is_(False))
stmt = select(CategoryModel).where(~exists(active_task))`}
          question="Почему результат одинаков для всех категорий?"
          options={[
            "Подзапрос не связан с CategoryModel.id",
            "exists нельзя использовать в where",
            "is_(False) удаляет id",
          ]}
          correctIndex={0}
          explanation="Нужно добавить TaskModel.category_id == CategoryModel.id."
          fix={`active_task = select(TaskModel.id).where(
    TaskModel.category_id == CategoryModel.id,
    TaskModel.is_done.is_(False),
)
stmt = select(CategoryModel).where(~exists(active_task))`}
        />

        <CodeBlock
          caption="рабочая версия для StudyHub"
          code={`email_exists = session.scalar(
    select(exists().where(UserModel.email == email))
)`}
        />

        <Callout tone="info">
          {
            "Если вложенность мешает объяснить запрос одним маршрутом, вынесите subquery в переменную или используйте более прямой JOIN."
          }
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {
            "Ученик различает WHERE и HAVING, использует EXISTS/NOT EXISTS и строит ограниченные подзапросы в SQLAlchemy. Перед переходом дальше нужно объяснить успешный путь, ожидаемую ошибку и связь ручного SQL с SQLAlchemy."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Что фильтрует WHERE?"
            options={["Исходные строки", "Готовые группы", "Только aliases"]}
            correctIndex={0}
            explanation="WHERE работает до GROUP BY."
          />
          <QuizCard
            question="Где проверить COUNT >= 3?"
            options={["HAVING", "ORDER BY", "OFFSET"]}
            correctIndex={0}
            explanation="Условие относится к агрегату группы."
          />
          <QuizCard
            question="Что возвращает EXISTS?"
            options={[
              "Логический факт наличия",
              "Все найденные ORM-объекты",
              "Количество колонок",
            ]}
            correctIndex={0}
            explanation="EXISTS отвечает на вопрос о наличии хотя бы одной строки."
          />
          <QuizCard
            question="Что делает подзапрос коррелированным?"
            options={[
              "Ссылка на колонку внешнего запроса",
              "Наличие SELECT 1",
              "Использование LIMIT",
            ]}
            correctIndex={0}
            explanation="Корреляция связывает subquery с текущей outer row."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"WHERE фильтрует строки до группировки."}</>,
            <>{"HAVING фильтрует группы после агрегата."}</>,
            <>{"EXISTS отвечает только на факт наличия."}</>,
            <>{"NOT EXISTS выражает отсутствие связанной строки."}</>,
            <>{"Коррелированный подзапрос ссылается на outer row."}</>,
            <>{"Scalar subquery обязан возвращать одно значение."}</>,
            <>{"Вложенность ограничивается читаемостью и необходимостью."}</>,
          ]}
        />

        <PracticeCta text="Реализуйте отчёт пользователей с 3+ задачами, категории без активных задач и функцию проверки email через EXISTS. Добавьте тест на потерянную корреляцию." />
      </Section>
    </RichLesson>
  );
}

// 134. Транзакция из нескольких изменений
export function Lesson134({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title="Транзакция из нескольких изменений"
        intro="Сделаем бизнес-операцию атомарной: завершение задачи и запись progress event либо сохраняются вместе, либо полностью откатываются при ошибке второго шага."
        tags={[
          { icon: <ShieldCheck size={14} />, label: "атомарность операции" },
          {
            icon: <Wrench size={14} />,
            label: "rollback и восстановление Session",
          },
        ]}
      />
      <TheoryBridge lesson={134} />

      <Section number="01" title="Одна команда пользователя — одна граница">
        <Lead>
          {
            "Команда «завершить задачу» теперь должна изменить tasks.is_done и создать запись progress_events. Половина результата противоречит бизнес-смыслу."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1</h3>
          <p>{"Изменить состояние Task."}</p>
          <h3>Шаг 2</h3>
          <p>{"Добавить ProgressEvent."}</p>
          <h3>Гарантия</h3>
          <p>{"Оба изменения сохраняются или ни одно."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"BEGIN:"}</strong> {"открыть рабочую границу"}
            </li>
            <li>
              <strong>{"Изменить две сущности:"}</strong>{" "}
              {"не фиксировать половину"}
            </li>
            <li>
              <strong>{"COMMIT или ROLLBACK:"}</strong>{" "}
              {"единый исход операции"}
            </li>
          </ol>
          <p>
            {
              "Транзакция определяется не количеством SQL-команд, а единством прикладного результата."
            }
          </p>
        </div>

        <Callout tone="info">
          {
            "Транзакция определяется не количеством SQL-команд, а единством прикладного результата."
          }
        </Callout>
      </Section>

      <Section number="02" title="BEGIN, COMMIT и ROLLBACK">
        <Lead>
          {
            "BEGIN открывает транзакцию, COMMIT делает все изменения видимыми как единый результат, ROLLBACK отменяет изменения текущей транзакции."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>BEGIN</h3>
          <p>{"Начало атомарной работы."}</p>
          <h3>COMMIT</h3>
          <p>{"Подтверждение всех шагов."}</p>
          <h3>ROLLBACK</h3>
          <p>{"Возврат к состоянию до BEGIN."}</p>
        </div>

        <TypeCards>
          <TypeCard badge="BEGIN" title="Открыть транзакцию" code={`BEGIN;`}>
            {"Следующие изменения принадлежат одной границе."}
          </TypeCard>
          <TypeCard
            badge="COMMIT"
            badgeTone="float"
            title="Подтвердить"
            code={`COMMIT;`}
          >
            {"Все успешные шаги сохраняются."}
          </TypeCard>
          <TypeCard
            badge="ROLLBACK"
            badgeTone="str"
            title="Отменить"
            code={`ROLLBACK;`}
          >
            {"Ни один незакоммиченный шаг не остаётся."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question="Что именно отменяет ROLLBACK?"
          answer={
            <p>
              {
                "Изменения текущей незавершённой транзакции. Он не отменяет данные, которые уже были подтверждены предыдущим commit."
              }
            </p>
          }
        />

        <Callout tone="info">
          {
            "Session SQLAlchemy управляет транзакцией, но база остаётся источником атомарной гарантии."
          }
        </Callout>
      </Section>

      <Section number="03" title="Два изменения внутри одной транзакции">
        <Lead>
          {
            "Сначала загружаем task, меняем is_done, затем добавляем event. Единственный commit располагается после обоих успешных шагов."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Load</h3>
          <p>{"Найти задачу и проверить право."}</p>
          <h3>Mutate</h3>
          <p>{"Изменить task и добавить event."}</p>
          <h3>Commit</h3>
          <p>{"Подтвердить оба изменения в конце."}</p>
        </div>

        <StepThrough
          code={`BEGIN;
UPDATE tasks SET is_done = TRUE WHERE id = 10;
INSERT INTO progress_events(task_id, kind) VALUES (10, 'task_done');
COMMIT;`}
          steps={[
            {
              line: 0,
              note: "Открывается единая транзакция.",
              vars: { tx: "active" },
            },
            {
              line: 1,
              note: "Изменение task пока не подтверждено.",
              vars: { "task #10": "done (pending)" },
            },
            {
              line: 2,
              note: "Event добавляется в ту же транзакцию.",
              vars: { event: "pending" },
            },
            {
              line: 3,
              note: "COMMIT делает оба результата постоянными.",
              vars: { task: "done", event: "saved" },
            },
          ]}
        />

        <PredictOutput
          code={`BEGIN;
UPDATE tasks SET is_done = TRUE WHERE id = 10;
INSERT INTO progress_events(task_id, kind) VALUES (10, 'task_done');
ROLLBACK;`}
          output={`После rollback task остаётся незавершённой, progress event отсутствует.`}
          hint="Сначала предскажите результат, затем подтвердите его на минимальном наборе данных."
        />

        <Callout tone="info">
          {
            "flush может отправить SQL раньше commit, но изменения всё ещё принадлежат текущей транзакции и могут быть откатаны."
          }
        </Callout>
      </Section>

      <Section number="04" title="Почему два commit ломают атомарность">
        <Lead>
          {
            "Если подтвердить task до создания event, первый шаг уже станет отдельным завершённым фактом. Ошибка второй операции оставит половину бизнес-сценария."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Commit #1</h3>
          <p>{"Task сохранена окончательно."}</p>
          <h3>Ошибка</h3>
          <p>{"Event не создаётся."}</p>
          <h3>Итог</h3>
          <p>{"Система сообщает сбой, но состояние уже изменено."}</p>
        </div>

        <CompareSolutions
          question="Какой вариант точнее сохраняет требуемый контракт?"
          left={{
            title: "Два независимых commit",
            code: `task.is_done = True
session.commit()

session.add(event)
session.commit()`,
            note: "Ошибка event не отменит первый commit.",
          }}
          right={{
            title: "Один commit",
            code: `task.is_done = True
session.add(event)
session.commit()`,
            note: "Оба изменения имеют единый исход.",
          }}
          preferred="right"
          explanation="Предпочтительный вариант делает источник данных, границу операции и наблюдаемый результат явными."
        />

        <FillBlank
          prompt="Какая команда должна быть единственной в конце успешной операции?"
          before={`session.`}
          after={`()`}
          options={["commit", "close", "refresh"]}
          answer="commit"
          explanation="Commit подтверждает все накопленные изменения одной транзакции."
        />

        <Callout tone="info">
          {
            "Refresh нужен для чтения данных после записи, но не является границей атомарности."
          }
        </Callout>
      </Section>

      <Section number="05" title="Ошибка между шагами и обязательный rollback">
        <Lead>
          {
            "Constraint progress_events может отклонить дублирующее событие. После IntegrityError транзакция считается неуспешной, а Session требует rollback перед дальнейшей работой."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>IntegrityError</h3>
          <p>{"База отклонила ограничение."}</p>
          <h3>Failed transaction</h3>
          <p>
            {
              "Следующие команды нельзя выполнять как будто ничего не произошло."
            }
          </p>
          <h3>Rollback</h3>
          <p>
            {
              "Очищает неуспешную транзакцию и возвращает Session в рабочее состояние."
            }
          </p>
        </div>

        <BranchExplorer
          code={`update task → flush ok
insert event → unique violation
except IntegrityError → rollback
next SELECT → session works`}
          scenarios={[
            { label: "успех", activeLine: 0, output: "commit task + event" },
            {
              label: "ошибка event",
              activeLine: 1,
              output: "перейти в except",
            },
            {
              label: "rollback",
              activeLine: 2,
              output: "оба pending-изменения отменены",
            },
            {
              label: "повторный запрос",
              activeLine: 3,
              output: "Session снова готова",
            },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>except IntegrityError</>,
              "перехватывает ожидаемую ошибку ограничения",
            ],
            [
              <>session.rollback()</>,
              "восстанавливает транзакционное состояние Session",
            ],
            [
              <>raise ConflictError</>,
              "переводит инфраструктурную ошибку в прикладной контракт",
            ],
          ]}
        />

        <Callout tone="info">
          {
            "Нельзя продолжать использовать Session после failed commit без rollback: она хранит состояние неуспешной транзакции."
          }
        </Callout>
      </Section>

      <Section number="06" title="Transaction context управляет исходом">
        <Lead>
          {
            "Контекст session.begin() фиксирует общий шаблон: при нормальном выходе commit, при исключении rollback. Внутри остаётся только бизнес-последовательность."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>with session.begin()</h3>
          <p>{"Открывает управляемую транзакцию."}</p>
          <h3>Успех</h3>
          <p>{"Контекст подтверждает изменения."}</p>
          <h3>Exception</h3>
          <p>{"Контекст откатывает и пробрасывает ошибку."}</p>
        </div>

        <CodeSequence
          prompt="Соберите атомарный service flow."
          pieces={[
            { id: "begin", code: "with session.begin():" },
            { id: "load", code: "    task = session.get(TaskModel, task_id)" },
            { id: "change", code: "    task.is_done = True" },
            {
              id: "event",
              code: '    session.add(ProgressEvent(task_id=task.id, kind="task_done"))',
            },
            { id: "return", code: "return task" },
          ]}
          correctOrder={["begin", "load", "change", "event", "return"]}
          explanation="Порядок отражает путь от описания запроса или операции к её выполнению и проверке."
        />

        <TerminalDemo
          title="воспроизводимая проверка"
          lines={[
            { cmd: `pytest tests/test_complete_task.py -q` },
            {
              out: `test_complete_task_saves_both ........ PASSED
test_event_error_rolls_back_task ..... PASSED`,
            },
          ]}
        />

        <Callout tone="info">
          {
            "Не смешивайте автоматический begin-контекст с дополнительным commit внутри него без ясной причины."
          }
        </Callout>
      </Section>

      <Section number="07" title="Service, endpoint и тест атомарности">
        <Lead>
          {
            "Endpoint получает команду и переводит прикладные ошибки в HTTP. Service определяет транзакционную границу, а тест намеренно ломает второй шаг и проверяет состояние обеих таблиц."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Endpoint</h3>
          <p>{"Проверяет transport contract."}</p>
          <h3>Service</h3>
          <p>{"Оркестрирует task + event."}</p>
          <h3>Test</h3>
          <p>{"Доказывает отсутствие половины операции."}</p>
        </div>

        <BugHunt
          code={`def complete_task(session, task_id):
    task = session.get(TaskModel, task_id)
    task.is_done = True
    session.commit()
    session.add(ProgressEvent(task_id=task_id, kind="task_done"))
    session.commit()`}
          question="Где нарушена граница операции?"
          options={[
            "Первый commit подтверждает половину сценария",
            "session.get нельзя использовать",
            "Event нужно создать до task",
          ]}
          correctIndex={0}
          explanation="Task уже сохранена до попытки создать event."
          fix={`def complete_task(session, task_id):
    with session.begin():
        task = session.get(TaskModel, task_id)
        task.is_done = True
        session.add(ProgressEvent(task_id=task_id, kind="task_done"))
    return task`}
        />

        <CodeBlock
          caption="рабочая версия для StudyHub"
          code={`def test_event_error_rolls_back_task(session):
    seed_duplicate_event(session, task_id=10)

    with pytest.raises(TaskAlreadyCompletedError):
        complete_task(session, task_id=10)

    session.expire_all()
    assert session.get(TaskModel, 10).is_done is False`}
        />

        <Callout tone="info">
          {
            "Тест проверяет базу после ошибки, а не только факт исключения. Именно состояние доказывает атомарность."
          }
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {
            "Ученик реализует атомарное завершение задачи и запись progress event, обрабатывает IntegrityError и проверяет rollback тестом. Перед переходом дальше нужно объяснить успешный путь, ожидаемую ошибку и связь ручного SQL с SQLAlchemy."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Что означает атомарность?"
            options={[
              "Все шаги сохраняются вместе или откатываются вместе",
              "Каждый шаг имеет отдельный commit",
              "Запрос выполняется без Session",
            ]}
            correctIndex={0}
            explanation="Операция не оставляет частичный результат."
          />
          <QuizCard
            question="Почему два commit опасны?"
            options={[
              "Первый нельзя отменить ошибкой второго",
              "Commit удаляет таблицу",
              "Второй commit всегда игнорируется",
            ]}
            correctIndex={0}
            explanation="Каждый commit завершает отдельную транзакцию."
          />
          <QuizCard
            question="Что делать после IntegrityError?"
            options={[
              "Rollback текущей Session",
              "Продолжить SELECT без действий",
              "Удалить engine",
            ]}
            correctIndex={0}
            explanation="Rollback восстанавливает рабочее транзакционное состояние."
          />
          <QuizCard
            question="Что должен проверить тест rollback?"
            options={[
              "Состояние обеих таблиц после ошибки",
              "Только текст exception",
              "Количество строк кода",
            ]}
            correctIndex={0}
            explanation="Атомарность доказывается отсутствием частичного изменения."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Транзакционная граница совпадает с бизнес-операцией."}</>,
            <>{"BEGIN объединяет несколько SQL-изменений."}</>,
            <>{"Один commit подтверждает весь успешный сценарий."}</>,
            <>{"Rollback отменяет текущие незакоммиченные изменения."}</>,
            <>{"IntegrityError требует восстановления Session."}</>,
            <>{"session.begin() выражает commit/rollback контекстом."}</>,
            <>{"Тест проверяет состояние после намеренного сбоя."}</>,
          ]}
        />

        <PracticeCta text="Реализуйте complete_task: обновление task и создание progress event в одной транзакции. Добавьте тест успешного пути, дублирующего event и пригодности Session после rollback." />
      </Section>
    </RichLesson>
  );
}

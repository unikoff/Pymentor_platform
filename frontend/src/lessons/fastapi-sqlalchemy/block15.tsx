import {
  ArrowUpDown,
  BadgeCheck,
  Database,
  Filter,
  Hash,
  ListChecks,
  Pencil,
  RotateCcw,
  Rows3,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Trash2,
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
  MatchPairs,
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
  TrueFalse,
  TypeCard,
  TypeCards,
} from "../shared";

const BLOCK_TITLE = "Блок 15 · CRUD и запросы SQLAlchemy";

type TheoryBridgeData = { link: string; boundary: string };

const THEORY_BRIDGES: Record<number, TheoryBridgeData> = {
  81: {
    link: "Блок продолжает первую запись из FastAPI: теперь StudyHub читает, изменяет, фильтрует и защищает данные через синхронную Session.",
    boundary:
      "Endpoint связывает HTTP и слой данных, но не превращается в склад всей логики и не использует глобальную Session.",
  },
  82: {
    link: "Блок продолжает первую запись из FastAPI: теперь StudyHub читает, изменяет, фильтрует и защищает данные через синхронную Session.",
    boundary:
      "Endpoint связывает HTTP и слой данных, но не превращается в склад всей логики и не использует глобальную Session.",
  },
  83: {
    link: "Блок продолжает первую запись из FastAPI: теперь StudyHub читает, изменяет, фильтрует и защищает данные через синхронную Session.",
    boundary:
      "Endpoint связывает HTTP и слой данных, но не превращается в склад всей логики и не использует глобальную Session.",
  },
  84: {
    link: "Блок продолжает первую запись из FastAPI: теперь StudyHub читает, изменяет, фильтрует и защищает данные через синхронную Session.",
    boundary:
      "Endpoint связывает HTTP и слой данных, но не превращается в склад всей логики и не использует глобальную Session.",
  },
  85: {
    link: "Блок продолжает первую запись из FastAPI: теперь StudyHub читает, изменяет, фильтрует и защищает данные через синхронную Session.",
    boundary:
      "Endpoint связывает HTTP и слой данных, но не превращается в склад всей логики и не использует глобальную Session.",
  },
  86: {
    link: "Блок продолжает первую запись из FastAPI: теперь StudyHub читает, изменяет, фильтрует и защищает данные через синхронную Session.",
    boundary:
      "Endpoint связывает HTTP и слой данных, но не превращается в склад всей логики и не использует глобальную Session.",
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

// 81. SELECT: список и объект по id
export function Lesson81({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"SELECT: список и объект по id"}
        intro={
          "Научимся читать данные из SQLite через SQLAlchemy: сначала получим список задач, затем найдём одну запись по id и превратим отсутствие результата в понятный HTTP-ответ."
        }
        tags={[
          { icon: <Search size={14} />, label: "select и scalars" },
          { icon: <ListChecks size={14} />, label: "404 и one_or_none" },
        ]}
      />
      <TheoryBridge lesson={81} />

      <Section
        number="01"
        title="Зачем отделять чтение списка от чтения одной записи"
      >
        <Lead>
          {
            "После первой записи через FastAPI проект умеет сохранять задачу, но клиенту нужно получить данные обратно. Список и один объект похожи только внешне: у них разные запросы, результаты и сценарии отсутствия."
          }
        </Lead>
        <div className="lesson-route">
          <ol>
            <li>
              <strong>Понять:</strong> сформулировать, какой вопрос к данным
              решает операция урока.
            </li>
            <li>
              <strong>Увидеть:</strong> отделить построение SQL-выражения от его
              выполнения через Session.
            </li>
            <li>
              <strong>Проверить:</strong> пройти успешный сценарий, пустой
              результат и ошибочный вход.
            </li>
            <li>
              <strong>Объяснить:</strong> назвать контракт endpoint и состояние
              базы после операции.
            </li>
          </ol>
          <p>
            Результат занятия становится частью общего CRUD слоя StudyHub
            Database API.
          </p>
        </div>
        <Callout tone="info">
          Запрос к базе начинается с ясного вопроса. Синтаксис SQLAlchemy —
          только способ выразить этот вопрос.
        </Callout>
      </Section>

      <Section number="02" title="select строит объект запроса">
        <Lead>
          {
            "Функция select не обращается к базе немедленно. Она создаёт описание будущего SQL-запроса, которое Session выполнит позже."
          }
        </Lead>
        <TypeCards>
          <TypeCard
            badge="expression"
            title="Описание запроса"
            code={"statement = select(TaskModel)"}
          >
            SQLAlchemy строит выражение и пока не обращается к SQLite.
          </TypeCard>
          <TypeCard
            badge="session"
            badgeTone="float"
            title="Выполнение"
            code={"result = db.execute(statement)"}
          >
            Session отправляет выражение через engine и получает Result.
          </TypeCard>
          <TypeCard
            badge="value"
            badgeTone="str"
            title="Прикладной результат"
            code={"items = result.scalars().all()"}
          >
            Результат преобразуется в ORM-объекты, число или bool.
          </TypeCard>
        </TypeCards>
        <MatchPairs
          prompt="Соедините слой и его ответственность."
          pairs={[
            {
              left: "FastAPI endpoint",
              right: "получает HTTP-данные и формирует ответ",
            },
            {
              left: "SQLAlchemy statement",
              right: "описывает запрос к таблице",
            },
            {
              left: "Session",
              right: "выполняет запрос и управляет транзакцией",
            },
            { left: "SQLite", right: "хранит строки и проверяет ограничения" },
          ]}
          explanation="Каждая часть отвечает только за свою границу."
        />
      </Section>

      <Section number="03" title="Session.execute выполняет запрос">
        <Lead>
          {
            "Сессия отправляет выражение в базу и получает Result. Result содержит строки результата, а не готовый список ORM-объектов."
          }
        </Lead>
        <CodeBlock
          caption="основной механизм"
          code={
            "statement = select(TaskModel).order_by(TaskModel.id)\nresult = db.execute(statement)\ntasks = result.scalars().all()\nreturn tasks"
          }
        />
        <StepThrough
          code={
            "statement = select(TaskModel).order_by(TaskModel.id)\nresult = db.execute(statement)\ntasks = result.scalars().all()\nreturn tasks"
          }
          steps={[
            {
              line: 0,
              note: "Выполняется шаг: statement = select(TaskModel).order_by(TaskModel.id)",
              vars: { этап: "1" },
            },
            {
              line: 1,
              note: "Выполняется шаг: result = db.execute(statement)",
              vars: { этап: "2" },
            },
            {
              line: 2,
              note: "Выполняется шаг: tasks = result.scalars().all()",
              vars: { этап: "3" },
            },
            {
              line: 3,
              note: "Выполняется шаг: return tasks",
              vars: { этап: "4" },
            },
          ]}
        />
        <Callout tone="info">
          Следите за моментом обращения к базе: построение statement и
          выполнение statement — разные действия.
        </Callout>
      </Section>

      <Section number="04" title="scalars и all возвращают модели">
        <Lead>
          {
            "Метод scalars извлекает из каждой строки первый ORM-объект, а all собирает все найденные объекты в список."
          }
        </Lead>
        <PredictOutput
          code={
            "statement = select(TaskModel).order_by(TaskModel.id)\nresult = db.execute(statement)\ntasks = result.scalars().all()\nreturn tasks"
          }
          output={
            "Результат зависит от строк в SQLite, а форма ответа определяется методом извлечения."
          }
          hint="Сначала определите тип результата: ORM-объект, список, число или bool."
        />
        <MethodGrid
          rows={[
            [<>select(...)</>, "создать SQL-выражение"],
            [<>db.execute(...)</>, "выполнить выражение"],
            [<>db.scalar(...)</>, "получить одно скалярное значение"],
            [<>db.scalars(...)</>, "получить поток ORM-объектов"],
          ]}
        />
      </Section>

      <Section number="05" title="Один объект через where">
        <Lead>
          {
            "Для поиска по id к select добавляется where. Выражение TaskModel.id == task_id превращается в SQL-условие, а значение передаётся безопасным параметром."
          }
        </Lead>
        <BranchExplorer
          code={
            "if value is None:\n    пропустить условие\nelif value корректно:\n    добавить условие или выполнить операцию\nelse:\n    вернуть ошибку"
          }
          scenarios={[
            {
              label: "параметр не передан",
              activeLine: 1,
              output: "запрос остаётся без этого условия",
            },
            {
              label: "валидное значение",
              activeLine: 3,
              output: "операция добавляется в маршрут",
            },
            {
              label: "некорректное значение",
              activeLine: 5,
              output: "клиент получает контролируемую ошибку",
            },
          ]}
        />
        <CodeBlock
          caption="проектный фрагмент"
          code={
            'statement = select(TaskModel).where(TaskModel.id == task_id)\ntask = db.execute(statement).scalar_one_or_none()\n\nif task is None:\n    raise HTTPException(status_code=404, detail="Task not found")\n\nreturn task'
          }
        />
      </Section>

      <Section number="06" title="first и one_or_none">
        <Lead>
          {
            "first возвращает первый объект или None. one_or_none требует не больше одной строки и лучше выражает ожидание уникального primary key."
          }
        </Lead>
        <CompareSolutions
          question="Какой вариант точнее сохраняет контракт и состояние Session?"
          left={{
            title: "Скрытая граница",
            code: "task = db.execute(select(TaskModel)).first()\nreturn task.title",
            note: "Важный шаг отсутствует или результат имеет неожиданную форму.",
          }}
          right={{
            title: "Явный маршрут",
            code: 'task = db.execute(\n    select(TaskModel).where(TaskModel.id == task_id)\n).scalar_one_or_none()\n\nif task is None:\n    raise HTTPException(404, "Task not found")\n\nreturn task',
            note: "Проверка, изменение состояния и ответ видны отдельно.",
          }}
          preferred="right"
          explanation="Явный вариант легче проверить через успешный, пустой и ошибочный сценарии."
        />
        <RecallCard
          question="Какой инвариант Session нужно сохранить?"
          answer={
            <p>
              После успешной операции состояние зафиксировано, а после ошибки
              транзакция откатана и Session снова пригодна для работы.
            </p>
          }
        />
      </Section>

      <Section number="07" title="404 как часть HTTP-контракта">
        <Lead>
          {
            "Отсутствие строки в базе является ожидаемым сценарием. Endpoint преобразует None в HTTPException со статусом 404, а не обращается к полям несуществующего объекта."
          }
        </Lead>
        <BugHunt
          code={
            "task = db.execute(select(TaskModel)).first()\nreturn task.title"
          }
          question="Какая проблема нарушает контракт операции?"
          options={[
            "Пропущена проверка результата или управление транзакцией",
            "Имя модели слишком длинное",
            "FastAPI требует async def",
          ]}
          correctIndex={0}
          explanation="Синхронный код корректен; ошибка находится в маршруте данных или состоянии Session."
          fix={
            'task = db.execute(\n    select(TaskModel).where(TaskModel.id == task_id)\n).scalar_one_or_none()\n\nif task is None:\n    raise HTTPException(404, "Task not found")\n\nreturn task'
          }
        />
        <TrueFalse
          statement={
            <>
              Session автоматически восстанавливается после любой ошибки commit
              без rollback.
            </>
          }
          isTrue={false}
          explanation="После ошибки транзакции обычно нужен явный rollback."
        />
      </Section>

      <Section number="08" title="Практика StudyHub и контроль">
        <Lead>
          {
            "Добавьте GET /tasks и GET /tasks/{task_id}. Проверьте пустой список, существующий id и отсутствующий id."
          }
        </Lead>
        <CodeSequence
          title="Соберите безопасный маршрут"
          prompt="Расположите действия от входа endpoint до ответа клиенту."
          pieces={[
            { id: "validate", code: "получить и проверить HTTP-параметры" },
            { id: "statement", code: "построить SQLAlchemy statement" },
            { id: "execute", code: "выполнить через Session" },
            { id: "check", code: "проверить пустой результат или ошибку" },
            { id: "response", code: "вернуть response schema" },
          ]}
          correctOrder={[
            "validate",
            "statement",
            "execute",
            "check",
            "response",
          ]}
          explanation="Endpoint связывает слои в видимом порядке."
        />
        <TerminalDemo
          title="ручная проверка API"
          lines={[
            { cmd: "uvicorn app.main:app --reload" },
            { out: "Application startup complete" },
            { cmd: "pytest -q" },
            { out: "tests passed" },
          ]}
        />
        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает select(TaskModel)?"}
            options={[
              "создаёт описание запроса",
              "сразу возвращает список",
              "создаёт таблицу",
            ]}
            correctIndex={0}
            explanation={"select строит SQL-выражение, но не выполняет его."}
          />
          <QuizCard
            question={"Зачем нужен scalars()?"}
            options={[
              "извлечь ORM-объекты",
              "сохранить изменения",
              "закрыть session",
            ]}
            correctIndex={0}
            explanation={
              "Result может содержать строки из нескольких колонок; scalars берёт первый элемент каждой строки."
            }
          />
          <QuizCard
            question={"Что возвращает scalar_one_or_none()?"}
            options={[
              "один объект или None",
              "только список",
              "всегда исключение",
            ]}
            correctIndex={0}
            explanation={"Метод выражает ожидание нуля или одной строки."}
          />
          <QuizCard
            question={"Когда endpoint возвращает 404?"}
            options={["запись не найдена", "список пуст", "commit успешен"]}
            correctIndex={0}
            explanation={
              "Для конкретного id отсутствие ресурса превращается в 404."
            }
          />
        </div>
        <KeyTakeaways
          points={[
            <>SQLAlchemy statement описывает будущий SQL-запрос.</>,
            <>Session выполняет запросы и управляет транзакцией.</>,
            <>
              Пустой результат является частью контракта, а не неожиданностью.
            </>,
            <>HTTP-ответ скрывает внутренние детали базы.</>,
            <>Каждая операция проверяется успешным и граничным сценарием.</>,
            <>
              CRUD StudyHub развивается без асинхронности и без смены проекта.
            </>,
          ]}
        />
        <PracticeCta
          text={
            "Реализуйте тему занятия в StudyHub Database API, добавьте минимум три проверки и объясните путь данных от HTTP-запроса до SQLite."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 82. Создание, обновление и удаление
export function Lesson82({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Создание, обновление и удаление"}
        intro={
          "Соберём полный жизненный цикл задачи: создадим ORM-объект, изменим только переданные поля, удалим запись и будем фиксировать каждую операцию через commit."
        }
        tags={[
          { icon: <Pencil size={14} />, label: "полный CRUD" },
          { icon: <Trash2 size={14} />, label: "PATCH и delete" },
        ]}
      />
      <TheoryBridge lesson={82} />

      <Section number="01" title="CRUD как четыре разных контракта">
        <Lead>
          {
            "Create, Read, Update и Delete работают с одной таблицей, но получают разные данные и обещают разные результаты. Не стоит прятать их в одну универсальную функцию."
          }
        </Lead>
        <div className="lesson-route">
          <ol>
            <li>
              <strong>Понять:</strong> сформулировать, какой вопрос к данным
              решает операция урока.
            </li>
            <li>
              <strong>Увидеть:</strong> отделить построение SQL-выражения от его
              выполнения через Session.
            </li>
            <li>
              <strong>Проверить:</strong> пройти успешный сценарий, пустой
              результат и ошибочный вход.
            </li>
            <li>
              <strong>Объяснить:</strong> назвать контракт endpoint и состояние
              базы после операции.
            </li>
          </ol>
          <p>
            Результат занятия становится частью общего CRUD слоя StudyHub
            Database API.
          </p>
        </div>
        <Callout tone="info">
          Запрос к базе начинается с ясного вопроса. Синтаксис SQLAlchemy —
          только способ выразить этот вопрос.
        </Callout>
      </Section>

      <Section number="02" title="Создание ORM-объекта из схемы">
        <Lead>
          {
            "Pydantic-схема уже проверила вход. Теперь из её данных создаётся TaskModel, который Session отслеживает до commit."
          }
        </Lead>
        <TypeCards>
          <TypeCard
            badge="expression"
            title="Описание запроса"
            code={"statement = select(TaskModel)"}
          >
            SQLAlchemy строит выражение и пока не обращается к SQLite.
          </TypeCard>
          <TypeCard
            badge="session"
            badgeTone="float"
            title="Выполнение"
            code={"result = db.execute(statement)"}
          >
            Session отправляет выражение через engine и получает Result.
          </TypeCard>
          <TypeCard
            badge="value"
            badgeTone="str"
            title="Прикладной результат"
            code={"items = result.scalars().all()"}
          >
            Результат преобразуется в ORM-объекты, число или bool.
          </TypeCard>
        </TypeCards>
        <MatchPairs
          prompt="Соедините слой и его ответственность."
          pairs={[
            {
              left: "FastAPI endpoint",
              right: "получает HTTP-данные и формирует ответ",
            },
            {
              left: "SQLAlchemy statement",
              right: "описывает запрос к таблице",
            },
            {
              left: "Session",
              right: "выполняет запрос и управляет транзакцией",
            },
            { left: "SQLite", right: "хранит строки и проверяет ограничения" },
          ]}
          explanation="Каждая часть отвечает только за свою границу."
        />
      </Section>

      <Section number="03" title="add, commit и refresh">
        <Lead>
          {
            "add помещает объект в текущую единицу работы, commit фиксирует транзакцию, refresh повторно читает строку и получает сгенерированный id."
          }
        </Lead>
        <CodeBlock
          caption="основной механизм"
          code={
            "task = TaskModel(**payload.model_dump())\ndb.add(task)\ndb.commit()\ndb.refresh(task)\nreturn task"
          }
        />
        <StepThrough
          code={
            "task = TaskModel(**payload.model_dump())\ndb.add(task)\ndb.commit()\ndb.refresh(task)\nreturn task"
          }
          steps={[
            {
              line: 0,
              note: "Выполняется шаг: task = TaskModel(**payload.model_dump())",
              vars: { этап: "1" },
            },
            {
              line: 1,
              note: "Выполняется шаг: db.add(task)",
              vars: { этап: "2" },
            },
            {
              line: 2,
              note: "Выполняется шаг: db.commit()",
              vars: { этап: "3" },
            },
            {
              line: 3,
              note: "Выполняется шаг: db.refresh(task)",
              vars: { этап: "4" },
            },
            {
              line: 4,
              note: "Выполняется шаг: return task",
              vars: { этап: "5" },
            },
          ]}
        />
        <Callout tone="info">
          Следите за моментом обращения к базе: построение statement и
          выполнение statement — разные действия.
        </Callout>
      </Section>

      <Section number="04" title="Полное и частичное обновление">
        <Lead>
          {
            "PUT обычно описывает замену представления, PATCH — изменение только переданных полей. В StudyHub используем TaskUpdate с необязательными полями."
          }
        </Lead>
        <CompareSolutions
          question="Какой вариант точнее сохраняет контракт и состояние Session?"
          left={{
            title: "Скрытая граница",
            code: "for field, value in payload.model_dump().items():\n    setattr(task, field, value)\n# commit отсутствует",
            note: "Важный шаг отсутствует или результат имеет неожиданную форму.",
          }}
          right={{
            title: "Явный маршрут",
            code: "changes = payload.model_dump(exclude_unset=True)\nfor field, value in changes.items():\n    setattr(task, field, value)\n\ndb.commit()\ndb.refresh(task)",
            note: "Проверка, изменение состояния и ответ видны отдельно.",
          }}
          preferred="right"
          explanation="Явный вариант легче проверить через успешный, пустой и ошибочный сценарии."
        />
        <RecallCard
          question="Какой инвариант Session нужно сохранить?"
          answer={
            <p>
              После успешной операции состояние зафиксировано, а после ошибки
              транзакция откатана и Session снова пригодна для работы.
            </p>
          }
        />
      </Section>

      <Section number="05" title="model_dump exclude_unset">
        <Lead>
          {
            "Pydantic v2 умеет вернуть только поля, которые клиент действительно прислал. Это защищает старые значения от случайной замены на None."
          }
        </Lead>
        <PredictOutput
          code={
            "task = TaskModel(**payload.model_dump())\ndb.add(task)\ndb.commit()\ndb.refresh(task)\nreturn task"
          }
          output={
            "Результат зависит от строк в SQLite, а форма ответа определяется методом извлечения."
          }
          hint="Сначала определите тип результата: ORM-объект, список, число или bool."
        />
        <MethodGrid
          rows={[
            [<>select(...)</>, "создать SQL-выражение"],
            [<>db.execute(...)</>, "выполнить выражение"],
            [<>db.scalar(...)</>, "получить одно скалярное значение"],
            [<>db.scalars(...)</>, "получить поток ORM-объектов"],
          ]}
        />
      </Section>

      <Section number="06" title="Удаление загруженного объекта">
        <Lead>
          {
            "Сначала запись ищется по id, затем db.delete(task) отмечает её на удаление, а commit фиксирует изменение."
          }
        </Lead>
        <BranchExplorer
          code={
            "if value is None:\n    пропустить условие\nelif value корректно:\n    добавить условие или выполнить операцию\nelse:\n    вернуть ошибку"
          }
          scenarios={[
            {
              label: "параметр не передан",
              activeLine: 1,
              output: "запрос остаётся без этого условия",
            },
            {
              label: "валидное значение",
              activeLine: 3,
              output: "операция добавляется в маршрут",
            },
            {
              label: "некорректное значение",
              activeLine: 5,
              output: "клиент получает контролируемую ошибку",
            },
          ]}
        />
        <CodeBlock
          caption="проектный фрагмент"
          code={
            "changes = payload.model_dump(exclude_unset=True)\nfor field, value in changes.items():\n    setattr(task, field, value)\n\ndb.commit()\ndb.refresh(task)\nreturn task"
          }
        />
      </Section>

      <Section number="07" title="Типичные ошибки CRUD">
        <Lead>
          {
            "Нельзя забывать 404, commit или проверку пустого PATCH. После удаления нельзя продолжать использовать объект как существующий ресурс."
          }
        </Lead>
        <BugHunt
          code={
            "for field, value in payload.model_dump().items():\n    setattr(task, field, value)\n# commit отсутствует"
          }
          question="Какая проблема нарушает контракт операции?"
          options={[
            "Пропущена проверка результата или управление транзакцией",
            "Имя модели слишком длинное",
            "FastAPI требует async def",
          ]}
          correctIndex={0}
          explanation="Синхронный код корректен; ошибка находится в маршруте данных или состоянии Session."
          fix={
            "changes = payload.model_dump(exclude_unset=True)\nfor field, value in changes.items():\n    setattr(task, field, value)\n\ndb.commit()\ndb.refresh(task)"
          }
        />
        <TrueFalse
          statement={
            <>
              Session автоматически восстанавливается после любой ошибки commit
              без rollback.
            </>
          }
          isTrue={false}
          explanation="После ошибки транзакции обычно нужен явный rollback."
        />
      </Section>

      <Section number="08" title="Полный маршрут StudyHub">
        <Lead>
          {
            "Реализуйте POST, PATCH и DELETE рядом с уже готовыми GET. Пройдите жизненный цикл одной задачи от создания до 404 после удаления."
          }
        </Lead>
        <CodeSequence
          title="Соберите безопасный маршрут"
          prompt="Расположите действия от входа endpoint до ответа клиенту."
          pieces={[
            { id: "validate", code: "получить и проверить HTTP-параметры" },
            { id: "statement", code: "построить SQLAlchemy statement" },
            { id: "execute", code: "выполнить через Session" },
            { id: "check", code: "проверить пустой результат или ошибку" },
            { id: "response", code: "вернуть response schema" },
          ]}
          correctOrder={[
            "validate",
            "statement",
            "execute",
            "check",
            "response",
          ]}
          explanation="Endpoint связывает слои в видимом порядке."
        />
        <TerminalDemo
          title="ручная проверка API"
          lines={[
            { cmd: "uvicorn app.main:app --reload" },
            { out: "Application startup complete" },
            { cmd: "pytest -q" },
            { out: "tests passed" },
          ]}
        />
        <div className="lesson-check-group">
          <QuizCard
            question={"Что фиксирует изменение в базе?"}
            options={["commit", "add", "refresh"]}
            correctIndex={0}
            explanation={"Commit завершает транзакцию."}
          />
          <QuizCard
            question={"Зачем exclude_unset=True?"}
            options={[
              "оставить только присланные поля",
              "удалить все None",
              "закрыть session",
            ]}
            correctIndex={0}
            explanation={
              "PATCH не должен затирать поля, которых не было в запросе."
            }
          />
          <QuizCard
            question={"Что делает db.delete(task)?"}
            options={[
              "помечает объект на удаление",
              "сразу удаляет файл базы",
              "возвращает 404",
            ]}
            correctIndex={0}
            explanation={"Удаление фиксируется только после commit."}
          />
          <QuizCard
            question={"Зачем refresh после создания?"}
            options={[
              "получить значения из базы",
              "отменить транзакцию",
              "создать схему",
            ]}
            correctIndex={0}
            explanation={"База может сгенерировать id и defaults."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>SQLAlchemy statement описывает будущий SQL-запрос.</>,
            <>Session выполняет запросы и управляет транзакцией.</>,
            <>
              Пустой результат является частью контракта, а не неожиданностью.
            </>,
            <>HTTP-ответ скрывает внутренние детали базы.</>,
            <>Каждая операция проверяется успешным и граничным сценарием.</>,
            <>
              CRUD StudyHub развивается без асинхронности и без смены проекта.
            </>,
          ]}
        />
        <PracticeCta
          text={
            "Реализуйте тему занятия в StudyHub Database API, добавьте минимум три проверки и объясните путь данных от HTTP-запроса до SQLite."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 83. WHERE и динамические фильтры
export function Lesson83({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"WHERE и динамические фильтры"}
        intro={
          "Научим GET /tasks собирать запрос по фактическим параметрам клиента: статус, минимальный приоритет и поиск по части названия будут добавляться независимо."
        }
        tags={[
          { icon: <Filter size={14} />, label: "where по условиям" },
          { icon: <SlidersHorizontal size={14} />, label: "query-параметры" },
        ]}
      />
      <TheoryBridge lesson={83} />

      <Section number="01" title="Почему один фиксированный запрос уже мал">
        <Lead>
          {
            "Когда задач становится много, клиенту не нужен весь набор. Фильтр переносит отбор в базу, чтобы она возвращала только подходящие строки."
          }
        </Lead>
        <div className="lesson-route">
          <ol>
            <li>
              <strong>Понять:</strong> сформулировать, какой вопрос к данным
              решает операция урока.
            </li>
            <li>
              <strong>Увидеть:</strong> отделить построение SQL-выражения от его
              выполнения через Session.
            </li>
            <li>
              <strong>Проверить:</strong> пройти успешный сценарий, пустой
              результат и ошибочный вход.
            </li>
            <li>
              <strong>Объяснить:</strong> назвать контракт endpoint и состояние
              базы после операции.
            </li>
          </ol>
          <p>
            Результат занятия становится частью общего CRUD слоя StudyHub
            Database API.
          </p>
        </div>
        <Callout tone="info">
          Запрос к базе начинается с ясного вопроса. Синтаксис SQLAlchemy —
          только способ выразить этот вопрос.
        </Callout>
      </Section>

      <Section number="02" title="where получает SQL-выражение">
        <Lead>
          {
            "Сравнение TaskModel.is_done == is_done не вычисляется как обычный bool. SQLAlchemy строит выражение для будущего WHERE."
          }
        </Lead>
        <TypeCards>
          <TypeCard
            badge="expression"
            title="Описание запроса"
            code={"statement = select(TaskModel)"}
          >
            SQLAlchemy строит выражение и пока не обращается к SQLite.
          </TypeCard>
          <TypeCard
            badge="session"
            badgeTone="float"
            title="Выполнение"
            code={"result = db.execute(statement)"}
          >
            Session отправляет выражение через engine и получает Result.
          </TypeCard>
          <TypeCard
            badge="value"
            badgeTone="str"
            title="Прикладной результат"
            code={"items = result.scalars().all()"}
          >
            Результат преобразуется в ORM-объекты, число или bool.
          </TypeCard>
        </TypeCards>
        <MatchPairs
          prompt="Соедините слой и его ответственность."
          pairs={[
            {
              left: "FastAPI endpoint",
              right: "получает HTTP-данные и формирует ответ",
            },
            {
              left: "SQLAlchemy statement",
              right: "описывает запрос к таблице",
            },
            {
              left: "Session",
              right: "выполняет запрос и управляет транзакцией",
            },
            { left: "SQLite", right: "хранит строки и проверяет ограничения" },
          ]}
          explanation="Каждая часть отвечает только за свою границу."
        />
      </Section>

      <Section number="03" title="Несколько условий соединяются">
        <Lead>
          {
            "Каждый вызов where добавляет ещё одно условие AND. Запрос удобно собирать по шагам, сохраняя его в той же переменной."
          }
        </Lead>
        <CodeBlock
          caption="основной механизм"
          code={
            'statement = select(TaskModel)\n\nif is_done is not None:\n    statement = statement.where(TaskModel.is_done == is_done)\n\nif priority_min is not None:\n    statement = statement.where(TaskModel.priority >= priority_min)\n\nif search:\n    statement = statement.where(TaskModel.title.ilike(f"%{search}%"))'
          }
        />
        <StepThrough
          code={
            'statement = select(TaskModel)\n\nif is_done is not None:\n    statement = statement.where(TaskModel.is_done == is_done)\n\nif priority_min is not None:\n    statement = statement.where(TaskModel.priority >= priority_min)\n\nif search:\n    statement = statement.where(TaskModel.title.ilike(f"%{search}%"))'
          }
          steps={[
            {
              line: 0,
              note: "Выполняется шаг: statement = select(TaskModel)",
              vars: { этап: "1" },
            },
            { line: 1, note: "Выполняется шаг: ", vars: { этап: "2" } },
            {
              line: 2,
              note: "Выполняется шаг: if is_done is not None:",
              vars: { этап: "3" },
            },
            {
              line: 3,
              note: "Выполняется шаг: statement = statement.where(TaskModel.is_done == is_done)",
              vars: { этап: "4" },
            },
            { line: 4, note: "Выполняется шаг: ", vars: { этап: "5" } },
            {
              line: 5,
              note: "Выполняется шаг: if priority_min is not None:",
              vars: { этап: "6" },
            },
          ]}
        />
        <Callout tone="info">
          Следите за моментом обращения к базе: построение statement и
          выполнение statement — разные действия.
        </Callout>
      </Section>

      <Section number="04" title="Необязательные query-параметры">
        <Lead>
          {
            "Значение None означает, что клиент фильтр не задавал. Важно отличать None от False, потому что False является полноценным условием."
          }
        </Lead>
        <BugHunt
          code={
            "if is_done:\n    statement = statement.where(TaskModel.is_done == is_done)"
          }
          question="Какая проблема нарушает контракт операции?"
          options={[
            "Пропущена проверка результата или управление транзакцией",
            "Имя модели слишком длинное",
            "FastAPI требует async def",
          ]}
          correctIndex={0}
          explanation="Синхронный код корректен; ошибка находится в маршруте данных или состоянии Session."
          fix={
            "if is_done is not None:\n    statement = statement.where(TaskModel.is_done == is_done)"
          }
        />
        <TrueFalse
          statement={
            <>
              Session автоматически восстанавливается после любой ошибки commit
              без rollback.
            </>
          }
          isTrue={false}
          explanation="После ошибки транзакции обычно нужен явный rollback."
        />
      </Section>

      <Section number="05" title="Диапазон приоритета">
        <Lead>
          {
            "priority_min и priority_max превращаются в >= и <=. FastAPI может заранее ограничить допустимый диапазон через Query."
          }
        </Lead>
        <PredictOutput
          code={
            'statement = select(TaskModel)\n\nif is_done is not None:\n    statement = statement.where(TaskModel.is_done == is_done)\n\nif priority_min is not None:\n    statement = statement.where(TaskModel.priority >= priority_min)\n\nif search:\n    statement = statement.where(TaskModel.title.ilike(f"%{search}%"))'
          }
          output={
            "Результат зависит от строк в SQLite, а форма ответа определяется методом извлечения."
          }
          hint="Сначала определите тип результата: ORM-объект, список, число или bool."
        />
        <MethodGrid
          rows={[
            [<>select(...)</>, "создать SQL-выражение"],
            [<>db.execute(...)</>, "выполнить выражение"],
            [<>db.scalar(...)</>, "получить одно скалярное значение"],
            [<>db.scalars(...)</>, "получить поток ORM-объектов"],
          ]}
        />
      </Section>

      <Section number="06" title="Поиск по части названия">
        <Lead>
          {
            "contains строит LIKE-условие. Для учебного SQLite используем ilike как удобную форму нечувствительного к регистру поиска."
          }
        </Lead>
        <CompareSolutions
          question="Какой вариант точнее сохраняет контракт и состояние Session?"
          left={{
            title: "Скрытая граница",
            code: "if is_done:\n    statement = statement.where(TaskModel.is_done == is_done)",
            note: "Важный шаг отсутствует или результат имеет неожиданную форму.",
          }}
          right={{
            title: "Явный маршрут",
            code: "if is_done is not None:\n    statement = statement.where(TaskModel.is_done == is_done)",
            note: "Проверка, изменение состояния и ответ видны отдельно.",
          }}
          preferred="right"
          explanation="Явный вариант легче проверить через успешный, пустой и ошибочный сценарии."
        />
        <RecallCard
          question="Какой инвариант Session нужно сохранить?"
          answer={
            <p>
              После успешной операции состояние зафиксировано, а после ошибки
              транзакция откатана и Session снова пригодна для работы.
            </p>
          }
        />
      </Section>

      <Section number="07" title="Порядок сборки и безопасность">
        <Lead>
          {
            "Параметры не склеиваются в SQL-строку вручную. SQLAlchemy передаёт значения отдельно, снижая риск SQL-инъекции."
          }
        </Lead>
        <BranchExplorer
          code={
            "if value is None:\n    пропустить условие\nelif value корректно:\n    добавить условие или выполнить операцию\nelse:\n    вернуть ошибку"
          }
          scenarios={[
            {
              label: "параметр не передан",
              activeLine: 1,
              output: "запрос остаётся без этого условия",
            },
            {
              label: "валидное значение",
              activeLine: 3,
              output: "операция добавляется в маршрут",
            },
            {
              label: "некорректное значение",
              activeLine: 5,
              output: "клиент получает контролируемую ошибку",
            },
          ]}
        />
        <CodeBlock
          caption="проектный фрагмент"
          code={
            '@router.get("/tasks")\ndef list_tasks(\n    is_done: bool | None = None,\n    priority_min: int | None = Query(None, ge=1, le=5),\n    search: str | None = None,\n    db: Session = Depends(get_db),\n):\n    ...'
          }
        />
      </Section>

      <Section number="08" title="Практика фильтров StudyHub">
        <Lead>
          {
            "Добавьте is_done, priority_min и search. Проверьте каждый фильтр отдельно, затем их сочетание и запрос без параметров."
          }
        </Lead>
        <CodeSequence
          title="Соберите безопасный маршрут"
          prompt="Расположите действия от входа endpoint до ответа клиенту."
          pieces={[
            { id: "validate", code: "получить и проверить HTTP-параметры" },
            { id: "statement", code: "построить SQLAlchemy statement" },
            { id: "execute", code: "выполнить через Session" },
            { id: "check", code: "проверить пустой результат или ошибку" },
            { id: "response", code: "вернуть response schema" },
          ]}
          correctOrder={[
            "validate",
            "statement",
            "execute",
            "check",
            "response",
          ]}
          explanation="Endpoint связывает слои в видимом порядке."
        />
        <TerminalDemo
          title="ручная проверка API"
          lines={[
            { cmd: "uvicorn app.main:app --reload" },
            { out: "Application startup complete" },
            { cmd: "pytest -q" },
            { out: "tests passed" },
          ]}
        />
        <div className="lesson-check-group">
          <QuizCard
            question={"Почему нельзя писать if is_done?"}
            options={[
              "False будет пропущен",
              "True станет строкой",
              "Session закроется",
            ]}
            correctIndex={0}
            explanation={
              "False является нужным фильтром, а не отсутствием значения."
            }
          />
          <QuizCard
            question={"Что делает второй where?"}
            options={[
              "добавляет условие AND",
              "заменяет таблицу",
              "выполняет commit",
            ]}
            correctIndex={0}
            explanation={"Условия накапливаются в выражении."}
          />
          <QuizCard
            question={"Где лучше фильтровать большой набор?"}
            options={["в SQL-запросе", "после all в Python", "в README"]}
            correctIndex={0}
            explanation={
              "База возвращает меньше строк и выполняет отбор ближе к данным."
            }
          />
          <QuizCard
            question={"Почему не склеиваем SQL вручную?"}
            options={[
              "параметры безопаснее и понятнее",
              "SQLAlchemy запрещает строки",
              "иначе нельзя использовать GET",
            ]}
            correctIndex={0}
            explanation={"Параметризованный запрос отделяет код от значений."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>SQLAlchemy statement описывает будущий SQL-запрос.</>,
            <>Session выполняет запросы и управляет транзакцией.</>,
            <>
              Пустой результат является частью контракта, а не неожиданностью.
            </>,
            <>HTTP-ответ скрывает внутренние детали базы.</>,
            <>Каждая операция проверяется успешным и граничным сценарием.</>,
            <>
              CRUD StudyHub развивается без асинхронности и без смены проекта.
            </>,
          ]}
        />
        <PracticeCta
          text={
            "Реализуйте тему занятия в StudyHub Database API, добавьте минимум три проверки и объясните путь данных от HTTP-запроса до SQLite."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 84. Сортировка, limit, offset и пагинация
export function Lesson84({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Сортировка, limit, offset и пагинация"}
        intro={
          "Ограничим размер ответа и сделаем порядок предсказуемым: добавим сортировку, limit, offset и метаданные страницы, чтобы клиент мог листать задачи без гигантского JSON."
        }
        tags={[
          { icon: <ArrowUpDown size={14} />, label: "order_by и страницы" },
          { icon: <Rows3 size={14} />, label: "стабильный порядок" },
        ]}
      />
      <TheoryBridge lesson={84} />

      <Section
        number="01"
        title="Почему весь список нельзя отдавать бесконечно"
      >
        <Lead>
          {
            "Пока записей мало, GET /tasks кажется дешёвым. Но размер ответа, память и время растут вместе с таблицей. Пагинация задаёт контролируемое окно данных."
          }
        </Lead>
        <div className="lesson-route">
          <ol>
            <li>
              <strong>Понять:</strong> сформулировать, какой вопрос к данным
              решает операция урока.
            </li>
            <li>
              <strong>Увидеть:</strong> отделить построение SQL-выражения от его
              выполнения через Session.
            </li>
            <li>
              <strong>Проверить:</strong> пройти успешный сценарий, пустой
              результат и ошибочный вход.
            </li>
            <li>
              <strong>Объяснить:</strong> назвать контракт endpoint и состояние
              базы после операции.
            </li>
          </ol>
          <p>
            Результат занятия становится частью общего CRUD слоя StudyHub
            Database API.
          </p>
        </div>
        <Callout tone="info">
          Запрос к базе начинается с ясного вопроса. Синтаксис SQLAlchemy —
          только способ выразить этот вопрос.
        </Callout>
      </Section>

      <Section number="02" title="order_by задаёт порядок">
        <Lead>
          {
            "Без order_by база не обещает устойчивый порядок. Для страниц это критично: одинаковый запрос должен возвращать ожидаемую последовательность."
          }
        </Lead>
        <TypeCards>
          <TypeCard
            badge="expression"
            title="Описание запроса"
            code={"statement = select(TaskModel)"}
          >
            SQLAlchemy строит выражение и пока не обращается к SQLite.
          </TypeCard>
          <TypeCard
            badge="session"
            badgeTone="float"
            title="Выполнение"
            code={"result = db.execute(statement)"}
          >
            Session отправляет выражение через engine и получает Result.
          </TypeCard>
          <TypeCard
            badge="value"
            badgeTone="str"
            title="Прикладной результат"
            code={"items = result.scalars().all()"}
          >
            Результат преобразуется в ORM-объекты, число или bool.
          </TypeCard>
        </TypeCards>
        <MatchPairs
          prompt="Соедините слой и его ответственность."
          pairs={[
            {
              left: "FastAPI endpoint",
              right: "получает HTTP-данные и формирует ответ",
            },
            {
              left: "SQLAlchemy statement",
              right: "описывает запрос к таблице",
            },
            {
              left: "Session",
              right: "выполняет запрос и управляет транзакцией",
            },
            { left: "SQLite", right: "хранит строки и проверяет ограничения" },
          ]}
          explanation="Каждая часть отвечает только за свою границу."
        />
      </Section>

      <Section number="03" title="limit ограничивает количество">
        <Lead>
          {
            "limit говорит базе вернуть не больше N строк. FastAPI ограничивает page_size сверху, чтобы клиент не запросил миллион записей."
          }
        </Lead>
        <PredictOutput
          code={
            "offset = (page - 1) * page_size\nstatement = (\n    select(TaskModel)\n    .order_by(TaskModel.priority.desc(), TaskModel.id.asc())\n    .limit(page_size)\n    .offset(offset)\n)"
          }
          output={
            "Результат зависит от строк в SQLite, а форма ответа определяется методом извлечения."
          }
          hint="Сначала определите тип результата: ORM-объект, список, число или bool."
        />
        <MethodGrid
          rows={[
            [<>select(...)</>, "создать SQL-выражение"],
            [<>db.execute(...)</>, "выполнить выражение"],
            [<>db.scalar(...)</>, "получить одно скалярное значение"],
            [<>db.scalars(...)</>, "получить поток ORM-объектов"],
          ]}
        />
      </Section>

      <Section number="04" title="offset пропускает начало">
        <Lead>
          {
            "Для страницы page вычисляем offset = (page - 1) * page_size. Первая страница пропускает ноль строк."
          }
        </Lead>
        <CodeBlock
          caption="основной механизм"
          code={
            "offset = (page - 1) * page_size\nstatement = (\n    select(TaskModel)\n    .order_by(TaskModel.priority.desc(), TaskModel.id.asc())\n    .limit(page_size)\n    .offset(offset)\n)"
          }
        />
        <StepThrough
          code={
            "offset = (page - 1) * page_size\nstatement = (\n    select(TaskModel)\n    .order_by(TaskModel.priority.desc(), TaskModel.id.asc())\n    .limit(page_size)\n    .offset(offset)\n)"
          }
          steps={[
            {
              line: 0,
              note: "Выполняется шаг: offset = (page - 1) * page_size",
              vars: { этап: "1" },
            },
            {
              line: 1,
              note: "Выполняется шаг: statement = (",
              vars: { этап: "2" },
            },
            {
              line: 2,
              note: "Выполняется шаг: select(TaskModel)",
              vars: { этап: "3" },
            },
            {
              line: 3,
              note: "Выполняется шаг: .order_by(TaskModel.priority.desc(), TaskModel.id.asc())",
              vars: { этап: "4" },
            },
            {
              line: 4,
              note: "Выполняется шаг: .limit(page_size)",
              vars: { этап: "5" },
            },
            {
              line: 5,
              note: "Выполняется шаг: .offset(offset)",
              vars: { этап: "6" },
            },
          ]}
        />
        <Callout tone="info">
          Следите за моментом обращения к базе: построение statement и
          выполнение statement — разные действия.
        </Callout>
      </Section>

      <Section number="05" title="Стабильная сортировка">
        <Lead>
          {
            "Если несколько задач имеют одинаковый priority, добавляем id вторым ключом. Иначе строки могут менять взаимный порядок между запросами."
          }
        </Lead>
        <CompareSolutions
          question="Какой вариант точнее сохраняет контракт и состояние Session?"
          left={{
            title: "Скрытая граница",
            code: "statement = select(TaskModel).limit(page_size).offset(page)",
            note: "Важный шаг отсутствует или результат имеет неожиданную форму.",
          }}
          right={{
            title: "Явный маршрут",
            code: "offset = (page - 1) * page_size\nstatement = select(TaskModel).limit(page_size).offset(offset)",
            note: "Проверка, изменение состояния и ответ видны отдельно.",
          }}
          preferred="right"
          explanation="Явный вариант легче проверить через успешный, пустой и ошибочный сценарии."
        />
        <RecallCard
          question="Какой инвариант Session нужно сохранить?"
          answer={
            <p>
              После успешной операции состояние зафиксировано, а после ошибки
              транзакция откатана и Session снова пригодна для работы.
            </p>
          }
        />
      </Section>

      <Section number="06" title="Выбор поля и направления">
        <Lead>
          {
            "Нельзя передавать имя колонки напрямую в SQL. Разрешённые варианты связываются с выражениями модели через словарь."
          }
        </Lead>
        <BranchExplorer
          code={
            "if value is None:\n    пропустить условие\nelif value корректно:\n    добавить условие или выполнить операцию\nelse:\n    вернуть ошибку"
          }
          scenarios={[
            {
              label: "параметр не передан",
              activeLine: 1,
              output: "запрос остаётся без этого условия",
            },
            {
              label: "валидное значение",
              activeLine: 3,
              output: "операция добавляется в маршрут",
            },
            {
              label: "некорректное значение",
              activeLine: 5,
              output: "клиент получает контролируемую ошибку",
            },
          ]}
        />
        <CodeBlock
          caption="проектный фрагмент"
          code={
            'SORT_FIELDS = {\n    "id": TaskModel.id,\n    "priority": TaskModel.priority,\n    "title": TaskModel.title,\n}\ncolumn = SORT_FIELDS[sort_by]\nordering = column.desc() if order == "desc" else column.asc()'
          }
        />
      </Section>

      <Section number="07" title="Метаданные страницы">
        <Lead>
          {
            "Ответ удобно возвращать как items, page, page_size и total. Клиент понимает, сколько данных существует и какую страницу показывает."
          }
        </Lead>
        <BugHunt
          code={"statement = select(TaskModel).limit(page_size).offset(page)"}
          question="Какая проблема нарушает контракт операции?"
          options={[
            "Пропущена проверка результата или управление транзакцией",
            "Имя модели слишком длинное",
            "FastAPI требует async def",
          ]}
          correctIndex={0}
          explanation="Синхронный код корректен; ошибка находится в маршруте данных или состоянии Session."
          fix={
            "offset = (page - 1) * page_size\nstatement = select(TaskModel).limit(page_size).offset(offset)"
          }
        />
        <TrueFalse
          statement={
            <>
              Session автоматически восстанавливается после любой ошибки commit
              без rollback.
            </>
          }
          isTrue={false}
          explanation="После ошибки транзакции обычно нужен явный rollback."
        />
      </Section>

      <Section number="08" title="Практика пагинации">
        <Lead>
          {
            "Добавьте page, page_size, sort_by и order. Создайте 12 задач и проверьте три страницы, границы размера и одинаковые приоритеты."
          }
        </Lead>
        <CodeSequence
          title="Соберите безопасный маршрут"
          prompt="Расположите действия от входа endpoint до ответа клиенту."
          pieces={[
            { id: "validate", code: "получить и проверить HTTP-параметры" },
            { id: "statement", code: "построить SQLAlchemy statement" },
            { id: "execute", code: "выполнить через Session" },
            { id: "check", code: "проверить пустой результат или ошибку" },
            { id: "response", code: "вернуть response schema" },
          ]}
          correctOrder={[
            "validate",
            "statement",
            "execute",
            "check",
            "response",
          ]}
          explanation="Endpoint связывает слои в видимом порядке."
        />
        <TerminalDemo
          title="ручная проверка API"
          lines={[
            { cmd: "uvicorn app.main:app --reload" },
            { out: "Application startup complete" },
            { cmd: "pytest -q" },
            { out: "tests passed" },
          ]}
        />
        <div className="lesson-check-group">
          <QuizCard
            question={"Зачем нужен order_by при пагинации?"}
            options={[
              "обеспечить предсказуемый порядок",
              "создать таблицу",
              "сделать commit",
            ]}
            correctIndex={0}
            explanation={
              "Страницы должны строиться поверх устойчивой последовательности."
            }
          />
          <QuizCard
            question={"Как вычислить offset для page=3, size=10?"}
            options={["20", "30", "3"]}
            correctIndex={0}
            explanation={"Пропускаются две полные предыдущие страницы."}
          />
          <QuizCard
            question={"Почему page_size ограничивают сверху?"}
            options={[
              "защитить API от огромного ответа",
              "SQL запрещает большие числа",
              "иначе id исчезнет",
            ]}
            correctIndex={0}
            explanation={"Сервер сохраняет контроль над объёмом работы."}
          />
          <QuizCard
            question={"Зачем второй ключ id?"}
            options={[
              "стабилизировать равные значения",
              "ускорить commit",
              "заменить primary key",
            ]}
            correctIndex={0}
            explanation={
              "При одинаковом первом ключе id задаёт однозначный порядок."
            }
          />
        </div>
        <KeyTakeaways
          points={[
            <>SQLAlchemy statement описывает будущий SQL-запрос.</>,
            <>Session выполняет запросы и управляет транзакцией.</>,
            <>
              Пустой результат является частью контракта, а не неожиданностью.
            </>,
            <>HTTP-ответ скрывает внутренние детали базы.</>,
            <>Каждая операция проверяется успешным и граничным сценарием.</>,
            <>
              CRUD StudyHub развивается без асинхронности и без смены проекта.
            </>,
          ]}
        />
        <PracticeCta
          text={
            "Реализуйте тему занятия в StudyHub Database API, добавьте минимум три проверки и объясните путь данных от HTTP-запроса до SQLite."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 85. COUNT, EXISTS и уникальность
export function Lesson85({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"COUNT, EXISTS и уникальность"}
        intro={
          "Добавим запросы, которые отвечают не списком объектов, а числом или фактом: посчитаем задачи, проверим существование категории и защитим уникальное имя ограничением базы."
        }
        tags={[
          { icon: <Hash size={14} />, label: "агрегаты и exists" },
          { icon: <BadgeCheck size={14} />, label: "unique и 409" },
        ]}
      />
      <TheoryBridge lesson={85} />

      <Section number="01" title="Запрос не всегда возвращает модели">
        <Lead>
          {
            "Иногда клиенту нужен ответ «сколько?» или «существует ли?». Загружать все строки ради len или поиска в Python неэффективно и скрывает намерение."
          }
        </Lead>
        <div className="lesson-route">
          <ol>
            <li>
              <strong>Понять:</strong> сформулировать, какой вопрос к данным
              решает операция урока.
            </li>
            <li>
              <strong>Увидеть:</strong> отделить построение SQL-выражения от его
              выполнения через Session.
            </li>
            <li>
              <strong>Проверить:</strong> пройти успешный сценарий, пустой
              результат и ошибочный вход.
            </li>
            <li>
              <strong>Объяснить:</strong> назвать контракт endpoint и состояние
              базы после операции.
            </li>
          </ol>
          <p>
            Результат занятия становится частью общего CRUD слоя StudyHub
            Database API.
          </p>
        </div>
        <Callout tone="info">
          Запрос к базе начинается с ясного вопроса. Синтаксис SQLAlchemy —
          только способ выразить этот вопрос.
        </Callout>
      </Section>

      <Section number="02" title="COUNT считает строки в базе">
        <Lead>
          {
            "func.count строит агрегатный SQL-запрос. scalar_one возвращает одно числовое значение."
          }
        </Lead>
        <TypeCards>
          <TypeCard
            badge="expression"
            title="Описание запроса"
            code={"statement = select(TaskModel)"}
          >
            SQLAlchemy строит выражение и пока не обращается к SQLite.
          </TypeCard>
          <TypeCard
            badge="session"
            badgeTone="float"
            title="Выполнение"
            code={"result = db.execute(statement)"}
          >
            Session отправляет выражение через engine и получает Result.
          </TypeCard>
          <TypeCard
            badge="value"
            badgeTone="str"
            title="Прикладной результат"
            code={"items = result.scalars().all()"}
          >
            Результат преобразуется в ORM-объекты, число или bool.
          </TypeCard>
        </TypeCards>
        <MatchPairs
          prompt="Соедините слой и его ответственность."
          pairs={[
            {
              left: "FastAPI endpoint",
              right: "получает HTTP-данные и формирует ответ",
            },
            {
              left: "SQLAlchemy statement",
              right: "описывает запрос к таблице",
            },
            {
              left: "Session",
              right: "выполняет запрос и управляет транзакцией",
            },
            { left: "SQLite", right: "хранит строки и проверяет ограничения" },
          ]}
          explanation="Каждая часть отвечает только за свою границу."
        />
      </Section>

      <Section number="03" title="EXISTS отвечает булевым значением">
        <Lead>
          {
            "exists позволяет базе остановиться после первого совпадения. Это точнее, чем загружать объект, если его поля не нужны."
          }
        </Lead>
        <PredictOutput
          code={
            "total = db.scalar(select(func.count(TaskModel.id)))\ncompleted = db.scalar(\n    select(func.count(TaskModel.id)).where(TaskModel.is_done.is_(True))\n)"
          }
          output={
            "Результат зависит от строк в SQLite, а форма ответа определяется методом извлечения."
          }
          hint="Сначала определите тип результата: ORM-объект, список, число или bool."
        />
        <MethodGrid
          rows={[
            [<>select(...)</>, "создать SQL-выражение"],
            [<>db.execute(...)</>, "выполнить выражение"],
            [<>db.scalar(...)</>, "получить одно скалярное значение"],
            [<>db.scalars(...)</>, "получить поток ORM-объектов"],
          ]}
        />
      </Section>

      <Section number="04" title="Python-проверка и ограничение базы">
        <Lead>
          {
            "Проверка SELECT перед INSERT улучшает сообщение, но не гарантирует уникальность при двух одновременных запросах. Гарантию даёт UNIQUE."
          }
        </Lead>
        <CompareSolutions
          question="Какой вариант точнее сохраняет контракт и состояние Session?"
          left={{
            title: "Скрытая граница",
            code: "if name not in [category.name for category in db.scalars(select(CategoryModel)).all()]:\n    ...",
            note: "Важный шаг отсутствует или результат имеет неожиданную форму.",
          }}
          right={{
            title: "Явный маршрут",
            code: 'is_taken = db.scalar(\n    select(exists().where(CategoryModel.name == name))\n)\nif is_taken:\n    raise HTTPException(409, "Category already exists")',
            note: "Проверка, изменение состояния и ответ видны отдельно.",
          }}
          preferred="right"
          explanation="Явный вариант легче проверить через успешный, пустой и ошибочный сценарии."
        />
        <RecallCard
          question="Какой инвариант Session нужно сохранить?"
          answer={
            <p>
              После успешной операции состояние зафиксировано, а после ошибки
              транзакция откатана и Session снова пригодна для работы.
            </p>
          }
        />
      </Section>

      <Section number="05" title="unique=True в ORM-модели">
        <Lead>
          {
            "Ограничение становится частью схемы таблицы. Для существующей базы оно добавляется миграцией, а не простым изменением класса."
          }
        </Lead>
        <CodeBlock
          caption="основной механизм"
          code={
            "total = db.scalar(select(func.count(TaskModel.id)))\ncompleted = db.scalar(\n    select(func.count(TaskModel.id)).where(TaskModel.is_done.is_(True))\n)"
          }
        />
        <StepThrough
          code={
            "total = db.scalar(select(func.count(TaskModel.id)))\ncompleted = db.scalar(\n    select(func.count(TaskModel.id)).where(TaskModel.is_done.is_(True))\n)"
          }
          steps={[
            {
              line: 0,
              note: "Выполняется шаг: total = db.scalar(select(func.count(TaskModel.id)))",
              vars: { этап: "1" },
            },
            {
              line: 1,
              note: "Выполняется шаг: completed = db.scalar(",
              vars: { этап: "2" },
            },
            {
              line: 2,
              note: "Выполняется шаг: select(func.count(TaskModel.id)).where(TaskModel.is_done.is_(True))",
              vars: { этап: "3" },
            },
            { line: 3, note: "Выполняется шаг: )", vars: { этап: "4" } },
          ]}
        />
        <Callout tone="info">
          Следите за моментом обращения к базе: построение statement и
          выполнение statement — разные действия.
        </Callout>
      </Section>

      <Section number="06" title="409 Conflict">
        <Lead>
          {
            "Когда клиент создаёт ресурс с уже занятым уникальным значением, ответ 409 точнее, чем 400 или 500."
          }
        </Lead>
        <BranchExplorer
          code={
            "if value is None:\n    пропустить условие\nelif value корректно:\n    добавить условие или выполнить операцию\nelse:\n    вернуть ошибку"
          }
          scenarios={[
            {
              label: "параметр не передан",
              activeLine: 1,
              output: "запрос остаётся без этого условия",
            },
            {
              label: "валидное значение",
              activeLine: 3,
              output: "операция добавляется в маршрут",
            },
            {
              label: "некорректное значение",
              activeLine: 5,
              output: "клиент получает контролируемую ошибку",
            },
          ]}
        />
        <CodeBlock
          caption="проектный фрагмент"
          code={
            "statement = select(\n    exists().where(CategoryModel.name == name)\n)\nis_taken = db.scalar(statement)"
          }
        />
      </Section>

      <Section number="07" title="Статистика StudyHub">
        <Lead>
          {
            "Соберите total, completed и active через отдельные COUNT-запросы или условные агрегаты. На этом этапе важнее ясность, чем один сложный SQL."
          }
        </Lead>
        <BugHunt
          code={
            "if name not in [category.name for category in db.scalars(select(CategoryModel)).all()]:\n    ..."
          }
          question="Какая проблема нарушает контракт операции?"
          options={[
            "Пропущена проверка результата или управление транзакцией",
            "Имя модели слишком длинное",
            "FastAPI требует async def",
          ]}
          correctIndex={0}
          explanation="Синхронный код корректен; ошибка находится в маршруте данных или состоянии Session."
          fix={
            'is_taken = db.scalar(\n    select(exists().where(CategoryModel.name == name))\n)\nif is_taken:\n    raise HTTPException(409, "Category already exists")'
          }
        />
        <TrueFalse
          statement={
            <>
              Session автоматически восстанавливается после любой ошибки commit
              без rollback.
            </>
          }
          isTrue={false}
          explanation="После ошибки транзакции обычно нужен явный rollback."
        />
      </Section>

      <Section number="08" title="Практика категорий">
        <Lead>
          {
            "Добавьте уникальное поле name категории, проверку exists и endpoint статистики задач. Проверьте повторное имя в другом регистре как осознанное ограничение."
          }
        </Lead>
        <CodeSequence
          title="Соберите безопасный маршрут"
          prompt="Расположите действия от входа endpoint до ответа клиенту."
          pieces={[
            { id: "validate", code: "получить и проверить HTTP-параметры" },
            { id: "statement", code: "построить SQLAlchemy statement" },
            { id: "execute", code: "выполнить через Session" },
            { id: "check", code: "проверить пустой результат или ошибку" },
            { id: "response", code: "вернуть response schema" },
          ]}
          correctOrder={[
            "validate",
            "statement",
            "execute",
            "check",
            "response",
          ]}
          explanation="Endpoint связывает слои в видимом порядке."
        />
        <TerminalDemo
          title="ручная проверка API"
          lines={[
            { cmd: "uvicorn app.main:app --reload" },
            { out: "Application startup complete" },
            { cmd: "pytest -q" },
            { out: "tests passed" },
          ]}
        />
        <div className="lesson-check-group">
          <QuizCard
            question={"Что возвращает COUNT?"}
            options={["число строк", "список моделей", "новую таблицу"]}
            correctIndex={0}
            explanation={"COUNT является агрегатом."}
          />
          <QuizCard
            question={"Когда полезен EXISTS?"}
            options={[
              "нужен только факт совпадения",
              "нужно обновить все поля",
              "нужно закрыть session",
            ]}
            correctIndex={0}
            explanation={"EXISTS выражает булевый вопрос."}
          />
          <QuizCard
            question={"Что действительно гарантирует уникальность?"}
            options={[
              "UNIQUE в базе",
              "предварительный if",
              "описание в README",
            ]}
            correctIndex={0}
            explanation={
              "Только ограничение базы защищает при конкурирующих операциях."
            }
          />
          <QuizCard
            question={"Какой статус подходит для дубликата?"}
            options={["409", "201", "404"]}
            correctIndex={0}
            explanation={
              "Конфликт с текущим состоянием ресурса выражается через 409."
            }
          />
        </div>
        <KeyTakeaways
          points={[
            <>SQLAlchemy statement описывает будущий SQL-запрос.</>,
            <>Session выполняет запросы и управляет транзакцией.</>,
            <>
              Пустой результат является частью контракта, а не неожиданностью.
            </>,
            <>HTTP-ответ скрывает внутренние детали базы.</>,
            <>Каждая операция проверяется успешным и граничным сценарием.</>,
            <>
              CRUD StudyHub развивается без асинхронности и без смены проекта.
            </>,
          ]}
        />
        <PracticeCta
          text={
            "Реализуйте тему занятия в StudyHub Database API, добавьте минимум три проверки и объясните путь данных от HTTP-запроса до SQLite."
          }
        />
      </Section>
    </RichLesson>
  );
}

// 86. Транзакция, IntegrityError и rollback
export function Lesson86({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Транзакция, IntegrityError и rollback"}
        intro={
          "Разберём отказоустойчивую запись: commit может завершиться IntegrityError, после чего Session нужно явно откатить, а клиенту вернуть безопасный 409 вместо внутренней ошибки базы."
        }
        tags={[
          { icon: <ShieldAlert size={14} />, label: "граница транзакции" },
          { icon: <RotateCcw size={14} />, label: "rollback после ошибки" },
        ]}
      />
      <TheoryBridge lesson={86} />

      <Section number="01" title="Commit — граница операции">
        <Lead>
          {
            "До commit изменения существуют в текущей Session. Commit просит базу проверить ограничения и зафиксировать все изменения как одну транзакцию."
          }
        </Lead>
        <div className="lesson-route">
          <ol>
            <li>
              <strong>Понять:</strong> сформулировать, какой вопрос к данным
              решает операция урока.
            </li>
            <li>
              <strong>Увидеть:</strong> отделить построение SQL-выражения от его
              выполнения через Session.
            </li>
            <li>
              <strong>Проверить:</strong> пройти успешный сценарий, пустой
              результат и ошибочный вход.
            </li>
            <li>
              <strong>Объяснить:</strong> назвать контракт endpoint и состояние
              базы после операции.
            </li>
          </ol>
          <p>
            Результат занятия становится частью общего CRUD слоя StudyHub
            Database API.
          </p>
        </div>
        <Callout tone="info">
          Запрос к базе начинается с ясного вопроса. Синтаксис SQLAlchemy —
          только способ выразить этот вопрос.
        </Callout>
      </Section>

      <Section number="02" title="Транзакция: всё или ничего">
        <Lead>
          {
            "Несколько изменений внутри одной транзакции либо фиксируются вместе, либо откатываются. Это защищает данные от частично выполненной операции."
          }
        </Lead>
        <TypeCards>
          <TypeCard
            badge="expression"
            title="Описание запроса"
            code={"statement = select(TaskModel)"}
          >
            SQLAlchemy строит выражение и пока не обращается к SQLite.
          </TypeCard>
          <TypeCard
            badge="session"
            badgeTone="float"
            title="Выполнение"
            code={"result = db.execute(statement)"}
          >
            Session отправляет выражение через engine и получает Result.
          </TypeCard>
          <TypeCard
            badge="value"
            badgeTone="str"
            title="Прикладной результат"
            code={"items = result.scalars().all()"}
          >
            Результат преобразуется в ORM-объекты, число или bool.
          </TypeCard>
        </TypeCards>
        <MatchPairs
          prompt="Соедините слой и его ответственность."
          pairs={[
            {
              left: "FastAPI endpoint",
              right: "получает HTTP-данные и формирует ответ",
            },
            {
              left: "SQLAlchemy statement",
              right: "описывает запрос к таблице",
            },
            {
              left: "Session",
              right: "выполняет запрос и управляет транзакцией",
            },
            { left: "SQLite", right: "хранит строки и проверяет ограничения" },
          ]}
          explanation="Каждая часть отвечает только за свою границу."
        />
      </Section>

      <Section number="03" title="Где возникает IntegrityError">
        <Lead>
          {
            "Ошибка уникальности появляется не обязательно на add. Обычно база проверяет ограничение во время flush или commit."
          }
        </Lead>
        <CodeBlock
          caption="основной механизм"
          code={
            'try:\n    db.add(category)\n    db.commit()\n    db.refresh(category)\nexcept IntegrityError:\n    db.rollback()\n    raise HTTPException(\n        status_code=409,\n        detail="Category already exists",\n    )'
          }
        />
        <StepThrough
          code={
            'try:\n    db.add(category)\n    db.commit()\n    db.refresh(category)\nexcept IntegrityError:\n    db.rollback()\n    raise HTTPException(\n        status_code=409,\n        detail="Category already exists",\n    )'
          }
          steps={[
            { line: 0, note: "Выполняется шаг: try:", vars: { этап: "1" } },
            {
              line: 1,
              note: "Выполняется шаг: db.add(category)",
              vars: { этап: "2" },
            },
            {
              line: 2,
              note: "Выполняется шаг: db.commit()",
              vars: { этап: "3" },
            },
            {
              line: 3,
              note: "Выполняется шаг: db.refresh(category)",
              vars: { этап: "4" },
            },
            {
              line: 4,
              note: "Выполняется шаг: except IntegrityError:",
              vars: { этап: "5" },
            },
            {
              line: 5,
              note: "Выполняется шаг: db.rollback()",
              vars: { этап: "6" },
            },
          ]}
        />
        <Callout tone="info">
          Следите за моментом обращения к базе: построение statement и
          выполнение statement — разные действия.
        </Callout>
      </Section>

      <Section number="04" title="Session после неудачного commit">
        <Lead>
          {
            "После ошибки транзакция помечена как failed. Любой следующий запрос без rollback приводит к PendingRollbackError."
          }
        </Lead>
        <BugHunt
          code={
            'try:\n    db.commit()\nexcept IntegrityError:\n    raise HTTPException(409, "Conflict")\n\nreturn db.scalars(select(CategoryModel)).all()'
          }
          question="Какая проблема нарушает контракт операции?"
          options={[
            "Пропущена проверка результата или управление транзакцией",
            "Имя модели слишком длинное",
            "FastAPI требует async def",
          ]}
          correctIndex={0}
          explanation="Синхронный код корректен; ошибка находится в маршруте данных или состоянии Session."
          fix={
            'try:\n    db.commit()\nexcept IntegrityError:\n    db.rollback()\n    raise HTTPException(409, "Conflict")'
          }
        />
        <TrueFalse
          statement={
            <>
              Session автоматически восстанавливается после любой ошибки commit
              без rollback.
            </>
          }
          isTrue={false}
          explanation="После ошибки транзакции обычно нужен явный rollback."
        />
      </Section>

      <Section number="05" title="try, except и rollback">
        <Lead>
          {
            "Рискованный commit помещается в try. В except IntegrityError сначала вызывается rollback, затем формируется контролируемый HTTP-ответ."
          }
        </Lead>
        <CompareSolutions
          question="Какой вариант точнее сохраняет контракт и состояние Session?"
          left={{
            title: "Скрытая граница",
            code: 'try:\n    db.commit()\nexcept IntegrityError:\n    raise HTTPException(409, "Conflict")\n\nreturn db.scalars(select(CategoryModel)).all()',
            note: "Важный шаг отсутствует или результат имеет неожиданную форму.",
          }}
          right={{
            title: "Явный маршрут",
            code: 'try:\n    db.commit()\nexcept IntegrityError:\n    db.rollback()\n    raise HTTPException(409, "Conflict")',
            note: "Проверка, изменение состояния и ответ видны отдельно.",
          }}
          preferred="right"
          explanation="Явный вариант легче проверить через успешный, пустой и ошибочный сценарии."
        />
        <RecallCard
          question="Какой инвариант Session нужно сохранить?"
          answer={
            <p>
              После успешной операции состояние зафиксировано, а после ошибки
              транзакция откатана и Session снова пригодна для работы.
            </p>
          }
        />
      </Section>

      <Section number="06" title="Не показываем детали базы клиенту">
        <Lead>
          {
            "Текст SQL, имена таблиц и traceback полезны в логах, но не должны уходить в публичный detail. Клиент получает стабильное предметное сообщение."
          }
        </Lead>
        <BranchExplorer
          code={
            "if value is None:\n    пропустить условие\nelif value корректно:\n    добавить условие или выполнить операцию\nelse:\n    вернуть ошибку"
          }
          scenarios={[
            {
              label: "параметр не передан",
              activeLine: 1,
              output: "запрос остаётся без этого условия",
            },
            {
              label: "валидное значение",
              activeLine: 3,
              output: "операция добавляется в маршрут",
            },
            {
              label: "некорректное значение",
              activeLine: 5,
              output: "клиент получает контролируемую ошибку",
            },
          ]}
        />
        <CodeBlock
          caption="проектный фрагмент"
          code={
            'category = CategoryModel(name=payload.name)\n\ntry:\n    db.add(category)\n    db.commit()\nexcept IntegrityError as error:\n    db.rollback()\n    logger.warning("category conflict", exc_info=error)\n    raise HTTPException(409, "Category already exists")'
          }
        />
      </Section>

      <Section number="07" title="Повторная работа Session">
        <Lead>
          {
            "После rollback сессия снова готова к запросам. Это нужно проверить отдельным сценарием: дубликат, затем чтение списка или создание другого объекта."
          }
        </Lead>
        <PredictOutput
          code={
            'try:\n    db.add(category)\n    db.commit()\n    db.refresh(category)\nexcept IntegrityError:\n    db.rollback()\n    raise HTTPException(\n        status_code=409,\n        detail="Category already exists",\n    )'
          }
          output={
            "Результат зависит от строк в SQLite, а форма ответа определяется методом извлечения."
          }
          hint="Сначала определите тип результата: ORM-объект, список, число или bool."
        />
        <MethodGrid
          rows={[
            [<>select(...)</>, "создать SQL-выражение"],
            [<>db.execute(...)</>, "выполнить выражение"],
            [<>db.scalar(...)</>, "получить одно скалярное значение"],
            [<>db.scalars(...)</>, "получить поток ORM-объектов"],
          ]}
        />
      </Section>

      <Section number="08" title="Финальная контрольная точка блока">
        <Lead>
          {
            "Соберите безопасное создание категории, полный CRUD задач, фильтры и пагинацию. Проверьте, что ошибка уникальности не ломает следующий запрос."
          }
        </Lead>
        <CodeSequence
          title="Соберите безопасный маршрут"
          prompt="Расположите действия от входа endpoint до ответа клиенту."
          pieces={[
            { id: "validate", code: "получить и проверить HTTP-параметры" },
            { id: "statement", code: "построить SQLAlchemy statement" },
            { id: "execute", code: "выполнить через Session" },
            { id: "check", code: "проверить пустой результат или ошибку" },
            { id: "response", code: "вернуть response schema" },
          ]}
          correctOrder={[
            "validate",
            "statement",
            "execute",
            "check",
            "response",
          ]}
          explanation="Endpoint связывает слои в видимом порядке."
        />
        <TerminalDemo
          title="ручная проверка API"
          lines={[
            { cmd: "uvicorn app.main:app --reload" },
            { out: "Application startup complete" },
            { cmd: "pytest -q" },
            { out: "tests passed" },
          ]}
        />
        <div className="lesson-check-group">
          <QuizCard
            question={"Когда база обычно проверяет UNIQUE?"}
            options={[
              "во время flush или commit",
              "при создании класса",
              "при импорте FastAPI",
            ]}
            correctIndex={0}
            explanation={"add только прикрепляет объект к Session."}
          />
          <QuizCard
            question={"Что обязательно после IntegrityError?"}
            options={["rollback", "refresh", "create_all"]}
            correctIndex={0}
            explanation={"Сессия остаётся в failed-состоянии до отката."}
          />
          <QuizCard
            question={"Что гарантирует транзакция?"}
            options={[
              "все изменения вместе или ни одного",
              "автоматический 404",
              "сортировку по id",
            ]}
            correctIndex={0}
            explanation={"Транзакция защищает атомарность операции."}
          />
          <QuizCard
            question={"Что отправлять клиенту?"}
            options={[
              "стабильное предметное сообщение",
              "полный traceback",
              "сырой SQL",
            ]}
            correctIndex={0}
            explanation={"Внутренние детали остаются в логах."}
          />
        </div>
        <KeyTakeaways
          points={[
            <>SQLAlchemy statement описывает будущий SQL-запрос.</>,
            <>Session выполняет запросы и управляет транзакцией.</>,
            <>
              Пустой результат является частью контракта, а не неожиданностью.
            </>,
            <>HTTP-ответ скрывает внутренние детали базы.</>,
            <>Каждая операция проверяется успешным и граничным сценарием.</>,
            <>
              CRUD StudyHub развивается без асинхронности и без смены проекта.
            </>,
          ]}
        />
        <PracticeCta
          text={
            "Реализуйте тему занятия в StudyHub Database API, добавьте минимум три проверки и объясните путь данных от HTTP-запроса до SQLite."
          }
        />
      </Section>
    </RichLesson>
  );
}

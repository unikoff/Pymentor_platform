import { ListChecks, Search } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 15 · CRUD и запросы SQLAlchemy";

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
      <TheoryBridge link={"Блок продолжает первую запись из FastAPI: теперь StudyHub читает, изменяет, фильтрует и защищает данные через синхронную Session."} boundary={"Endpoint связывает HTTP и слой данных, но не превращается в склад всей логики и не использует глобальную Session."} />

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

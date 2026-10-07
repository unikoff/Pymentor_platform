import { Pencil, Trash2 } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 15 · CRUD и запросы SQLAlchemy";

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
      <TheoryBridge link={"Блок продолжает первую запись из FastAPI: теперь StudyHub читает, изменяет, фильтрует и защищает данные через синхронную Session."} boundary={"Endpoint связывает HTTP и слой данных, но не превращается в склад всей логики и не использует глобальную Session."} />

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

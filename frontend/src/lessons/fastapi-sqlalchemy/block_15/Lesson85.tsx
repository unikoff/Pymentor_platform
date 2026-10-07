import { BadgeCheck, Hash } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 15 · CRUD и запросы SQLAlchemy";

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
      <TheoryBridge link={"Блок продолжает первую запись из FastAPI: теперь StudyHub читает, изменяет, фильтрует и защищает данные через синхронную Session."} boundary={"Endpoint связывает HTTP и слой данных, но не превращается в склад всей логики и не использует глобальную Session."} />

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

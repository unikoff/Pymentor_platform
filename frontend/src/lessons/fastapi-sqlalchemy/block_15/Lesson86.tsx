import { RotateCcw, ShieldAlert } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 15 · CRUD и запросы SQLAlchemy";

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
      <TheoryBridge link={"Блок продолжает первую запись из FastAPI: теперь StudyHub читает, изменяет, фильтрует и защищает данные через синхронную Session."} boundary={"Endpoint связывает HTTP и слой данных, но не превращается в склад всей логики и не использует глобальную Session."} />

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

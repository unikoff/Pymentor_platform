import { Filter, SlidersHorizontal } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 15 · CRUD и запросы SQLAlchemy";

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
      <TheoryBridge link={"Блок продолжает первую запись из FastAPI: теперь StudyHub читает, изменяет, фильтрует и защищает данные через синхронную Session."} boundary={"Endpoint связывает HTTP и слой данных, но не превращается в склад всей логики и не использует глобальную Session."} />

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

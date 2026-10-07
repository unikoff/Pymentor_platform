import { ArrowUpDown, Rows3 } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 15 · CRUD и запросы SQLAlchemy";

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
      <TheoryBridge link={"Блок продолжает первую запись из FastAPI: теперь StudyHub читает, изменяет, фильтрует и защищает данные через синхронную Session."} boundary={"Endpoint связывает HTTP и слой данных, но не превращается в склад всей логики и не использует глобальную Session."} />

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

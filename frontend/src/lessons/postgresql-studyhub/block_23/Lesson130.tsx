import { AlertTriangle, Layers } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 23 · JOIN, агрегаты и транзакции";

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
      <TheoryBridge link={"INNER JOIN уже собирает существующие связи. Теперь отчёт должен показывать и задачи без категории, и пользователей без задач — отсутствие связи становится содержательным результатом."} boundary={"Условие на правую таблицу в WHERE после LEFT JOIN может удалить строки с NULL и незаметно превратить результат в аналог INNER JOIN."} />

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

import { Braces, Search } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 23 · JOIN, агрегаты и транзакции";

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
      <TheoryBridge link={"GROUP BY уже строит статистические строки. Теперь нужно выбирать только значимые группы и отвечать на вопросы «существует ли хотя бы одна строка» без загрузки полного списка."} boundary={"WHERE фильтрует исходные строки до группировки, HAVING — готовые группы после агрегата. Подмена одного другим меняет набор данных."} />

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

import { BarChart3, Layers } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 23 · JOIN, агрегаты и транзакции";

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
      <TheoryBridge link={"JOIN уже создаёт связанный набор строк. Теперь отчёт должен не перечислять каждую задачу, а сжимать набор в понятные показатели по пользователям и категориям."} boundary={"GROUP BY меняет единицу результата: одна строка представляет группу. Любая выбранная неагрегированная колонка должна согласоваться с группировкой."} />

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

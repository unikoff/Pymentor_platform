import { GitFork, KeyRound } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 23 · JOIN, агрегаты и транзакции";

export function Lesson131({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title="Many-to-many через таблицу связи"
        intro="Построим отношение многие-ко-многим для тегов задач: спроектируем task_tags, защитим пару составным ключом, выполним JOIN в обе стороны и настроим relationship secondary без скрытой магии."
        tags={[
          { icon: <KeyRound size={14} />, label: "составной ключ" },
          { icon: <GitFork size={14} />, label: "task ↔ task_tags ↔ tag" },
        ]}
      />
      <TheoryBridge link={"One-to-many уже связывает задачу с одним владельцем и одной категорией. Теги требуют другой модели: у задачи много тегов, и один тег принадлежит многим задачам."} boundary={"Список tag_id в одной колонке скрывает связи от ограничений и JOIN. В реляционной модели каждая пара хранится отдельной строкой таблицы связи."} />

      <Section number="01" title="Почему одного foreign key недостаточно">
        <Lead>
          {
            "Если добавить tag_id в tasks, одна задача сможет ссылаться только на один тег. Если добавить task_id в tags, один тег сможет относиться только к одной задаче. Нужна отдельная сущность пары."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Task</h3>
          <p>{"Может иметь python, sql и backend."}</p>
          <h3>Tag</h3>
          <p>{"Может встречаться у многих задач."}</p>
          <h3>Связь</h3>
          <p>{"Каждая пара task_id + tag_id хранится отдельно."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"Создать task:"}</strong> {"самостоятельная строка"}
            </li>
            <li>
              <strong>{"Создать tag:"}</strong> {"самостоятельная строка"}
            </li>
            <li>
              <strong>{"Добавить пару:"}</strong>{" "}
              {"строка task_tags связывает ключи"}
            </li>
          </ol>
          <p>
            {
              "Many-to-many — это две one-to-many связи через промежуточную таблицу."
            }
          </p>
        </div>

        <Callout tone="info">
          {
            "Many-to-many — это две one-to-many связи через промежуточную таблицу."
          }
        </Callout>
      </Section>

      <Section number="02" title="Association table хранит пары ключей">
        <Lead>
          {
            "Минимальная таблица связи содержит два foreign key. Каждая строка отвечает на один вопрос: связан ли конкретный task с конкретным tag."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>task_id</h3>
          <p>{"Ссылается на tasks.id."}</p>
          <h3>tag_id</h3>
          <p>{"Ссылается на tags.id."}</p>
          <h3>Строка</h3>
          <p>{"Например (10, 3) означает tag #3 у task #10."}</p>
        </div>

        <TypeCards>
          <TypeCard badge="tasks" title="Сущность задачи" code={`id | title`}>
            {"Не хранит массив тегов."}
          </TypeCard>
          <TypeCard
            badge="task_tags"
            badgeTone="float"
            title="Таблица связи"
            code={`task_id | tag_id`}
          >
            {"Хранит только пары и возможные свойства связи."}
          </TypeCard>
          <TypeCard
            badge="tags"
            badgeTone="str"
            title="Справочник тегов"
            code={`id | name`}
          >
            {"Имя тега хранится один раз."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question="Что представляет одна строка task_tags?"
          answer={
            <p>
              {"Один факт связи между конкретной задачей и конкретным тегом."}
            </p>
          }
        />

        <Callout tone="info">
          {
            "Таблица связи может получить собственные поля, например assigned_at или source, если эти данные относятся именно к связи."
          }
        </Callout>
      </Section>

      <Section number="03" title="Составной primary key запрещает дубли">
        <Lead>
          {
            "Одна и та же пара task_id + tag_id не должна появляться дважды. Составной primary key делает комбинацию уникальной на уровне базы."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>PRIMARY KEY</h3>
          <p>{"Может состоять из нескольких колонок."}</p>
          <h3>Уникальность пары</h3>
          <p>{"Повторное назначение того же тега блокируется."}</p>
          <h3>Целостность</h3>
          <p>{"Оба foreign key должны ссылаться на существующие строки."}</p>
        </div>

        <StepThrough
          code={`CREATE TABLE task_tags (
    task_id BIGINT REFERENCES tasks(id),
    tag_id BIGINT REFERENCES tags(id),
    PRIMARY KEY (task_id, tag_id)
);`}
          steps={[
            {
              line: 0,
              note: "Создаётся отдельная таблица связи.",
              vars: { table: "task_tags" },
            },
            {
              line: 1,
              note: "task_id допускает только существующую задачу.",
              vars: { FK: "tasks.id" },
            },
            {
              line: 2,
              note: "tag_id допускает только существующий тег.",
              vars: { FK: "tags.id" },
            },
            {
              line: 3,
              note: "Пара становится уникальным идентификатором строки.",
              vars: { PK: "(task_id, tag_id)" },
            },
          ]}
        />

        <PredictOutput
          code={`INSERT INTO task_tags (task_id, tag_id) VALUES (10, 3);
INSERT INTO task_tags (task_id, tag_id) VALUES (10, 3);`}
          output={`Вторая вставка завершается ошибкой уникальности primary key.`}
          hint="Сначала предскажите результат, затем подтвердите его на минимальном наборе данных."
        />

        <Callout tone="info">
          {
            "Python-проверка «такой пары ещё нет» полезна для понятного ответа, но окончательную защиту даёт constraint базы."
          }
        </Callout>
      </Section>

      <Section number="04" title="Почему массив id в колонке ухудшает модель">
        <Lead>
          {
            'Запись tag_ids = "1,3,8" кажется короткой, но база перестаёт видеть отдельные ссылки. Нельзя надёжно применить foreign key, уникальность пары и обычный JOIN.'
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Строка или JSON</h3>
          <p>{"Скрывает элементы внутри одного значения."}</p>
          <h3>Ограничения</h3>
          <p>{"Не проверяют каждый id отдельно."}</p>
          <h3>Запросы</h3>
          <p>{"Требуют разбора содержимого вместо реляционного JOIN."}</p>
        </div>

        <CompareSolutions
          question="Какой вариант точнее сохраняет требуемый контракт?"
          left={{
            title: "Список внутри tasks",
            code: `tasks.tag_ids = "1,3,8"`,
            note: "Ссылки скрыты, дубли и несуществующие id проходят легче.",
          }}
          right={{
            title: "Отдельные пары",
            code: `task_tags
10 | 1
10 | 3
10 | 8`,
            note: "Каждая связь видима constraints и JOIN.",
          }}
          preferred="right"
          explanation="Предпочтительный вариант делает источник данных, границу операции и наблюдаемый результат явными."
        />

        <FillBlank
          prompt="Завершите составной ключ."
          before={`PRIMARY KEY (task_id, `}
          after={`)`}
          options={["tag_id", "tag_name", "tasks"]}
          answer="tag_id"
          explanation="Уникальной должна быть комбинация двух foreign key."
        />

        <Callout tone="info">
          {
            "JSON-массив может быть оправдан для документа, но не заменяет нормальную many-to-many связь основного реляционного домена."
          }
        </Callout>
      </Section>

      <Section number="05" title="JOIN через таблицу связи в обе стороны">
        <Lead>
          {
            "Чтобы получить теги задачи, запрос проходит tasks → task_tags → tags. Чтобы получить задачи тега, направление чтения меняется, но таблица связи остаётся центром маршрута."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Task → tags</h3>
          <p>{"Фильтр по task_id."}</p>
          <h3>Tag → tasks</h3>
          <p>{"Фильтр по tag_id."}</p>
          <h3>Projection</h3>
          <p>{"Возвращаем данные сущности, а не только ключи пары."}</p>
        </div>

        <BranchExplorer
          code={`task #10
  → task_tags (10, 1) → tag python
  → task_tags (10, 3) → tag sql

tag #3
  → task_tags (10, 3) → task #10
  → task_tags (12, 3) → task #12`}
          scenarios={[
            { label: "теги task #10", activeLine: 1, output: "python, sql" },
            { label: "задачи tag #3", activeLine: 4, output: "#10, #12" },
            { label: "неизвестный tag", activeLine: 5, output: "пустой набор" },
          ]}
        />

        <MethodGrid
          rows={[
            [<>tasks → task_tags</>, "tasks.id = task_tags.task_id"],
            [<>task_tags → tags</>, "task_tags.tag_id = tags.id"],
            [
              <>WHERE tasks.id = :task_id</>,
              "ограничивает маршрут одной задачей",
            ],
          ]}
        />

        <Callout tone="info">
          {
            "Два JOIN не означают две независимые связи. Они описывают один маршрут через промежуточные пары."
          }
        </Callout>
      </Section>

      <Section number="06" title="secondary relationship в SQLAlchemy">
        <Lead>
          {
            "SQLAlchemy может предоставить task.tags и tag.tasks, но relationship не создаёт новую модель данных. Под ним остаются task_tags, два foreign key и JOIN."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Table</h3>
          <p>{"task_tags объявляется как association table."}</p>
          <h3>secondary</h3>
          <p>{"Указывает промежуточную таблицу."}</p>
          <h3>back_populates</h3>
          <p>{"Связывает две стороны Python-навигации."}</p>
        </div>

        <CodeSequence
          prompt="Соберите минимальное объявление many-to-many."
          pieces={[
            {
              id: "table",
              code: 'task_tags = Table("task_tags", Base.metadata, ...)',
            },
            {
              id: "task",
              code: 'TaskModel.tags = relationship(secondary=task_tags, back_populates="tasks")',
            },
            {
              id: "tag",
              code: 'TagModel.tasks = relationship(secondary=task_tags, back_populates="tags")',
            },
            { id: "use", code: "task.tags.append(tag)" },
            { id: "commit", code: "session.commit()" },
          ]}
          correctOrder={["table", "task", "tag", "use", "commit"]}
          explanation="Порядок отражает путь от описания запроса или операции к её выполнению и проверке."
        />

        <TerminalDemo
          title="воспроизводимая проверка"
          lines={[
            { cmd: `python -m app.sql_lab.tags` },
            {
              out: `task #10 tags: python, sql
tag sql tasks: #10, #12`,
            },
          ]}
        />

        <Callout tone="info">
          {
            "Для связи с собственными важными полями вместо простой secondary-table обычно нужна association object model."
          }
        </Callout>
      </Section>

      <Section number="07" title="Cascade и безопасное удаление связи">
        <Lead>
          {
            "Удаление пары task_tags и удаление самого Tag — разные операции. Cascade проектируется явно, чтобы очистка связи не уничтожила общий справочник неожиданно."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Убрать тег у задачи</h3>
          <p>{"Удалить одну строку task_tags."}</p>
          <h3>Удалить задачу</h3>
          <p>{"Удалить её пары по согласованному cascade."}</p>
          <h3>Удалить tag</h3>
          <p>{"Сначала определить, допустимо ли удалять общий справочник."}</p>
        </div>

        <BugHunt
          code={`def remove_tag(task: TaskModel, tag: TagModel, session: Session):
    session.delete(tag)
    session.commit()`}
          question="Почему функция делает слишком широкое изменение?"
          options={[
            "Она удаляет сам общий Tag, а не только связь",
            "relationship нельзя менять",
            "commit запрещён после delete",
          ]}
          correctIndex={0}
          explanation="Чтобы убрать тег у одной задачи, достаточно удалить связь через task.tags.remove(tag)."
          fix={`def remove_tag(task: TaskModel, tag: TagModel, session: Session):
    task.tags.remove(tag)
    session.commit()`}
        />

        <CodeBlock
          caption="рабочая версия для StudyHub"
          code={`DELETE FROM task_tags
WHERE task_id = :task_id
  AND tag_id = :tag_id
RETURNING task_id, tag_id;`}
        />

        <Callout tone="info">
          {
            "Тест должен проверить, что tag остаётся доступен другим задачам после удаления одной связи."
          }
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {
            "Ученик проектирует task_tags, получает теги задачи и задачи тега и понимает роль secondary relationship. Перед переходом дальше нужно объяснить успешный путь, ожидаемую ошибку и связь ручного SQL с SQLAlchemy."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Зачем нужна task_tags?"
            options={[
              "Хранить пары task и tag",
              "Заменить таблицу tasks",
              "Хранить пароль",
            ]}
            correctIndex={0}
            explanation="Промежуточная таблица представляет many-to-many связь."
          />
          <QuizCard
            question="Что защищает PRIMARY KEY (task_id, tag_id)?"
            options={[
              "Уникальность пары",
              "Уникальность названия задачи",
              "Порядок тегов",
            ]}
            correctIndex={0}
            explanation="Одна связь не может быть записана дважды."
          />
          <QuizCard
            question="Сколько JOIN нужно для tags одной task?"
            options={["Два", "Ноль", "Всегда четыре"]}
            correctIndex={0}
            explanation="Маршрут проходит через task_tags к tags."
          />
          <QuizCard
            question="Как убрать tag только у одной task?"
            options={[
              "Удалить строку связи",
              "Удалить весь Tag",
              "Очистить таблицу tasks",
            ]}
            correctIndex={0}
            explanation="Сущность тега может использоваться другими задачами."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Many-to-many раскладывается на две one-to-many связи."}</>,
            <>{"task_tags хранит отдельные пары ключей."}</>,
            <>{"Составной primary key защищает от дубля пары."}</>,
            <>{"Foreign key сохраняют ссылочную целостность."}</>,
            <>{"JOIN проходит через промежуточную таблицу."}</>,
            <>{"secondary relationship не отменяет SQL-модель."}</>,
            <>{"Cascade проектируется отдельно для связи и сущности."}</>,
          ]}
        />

        <PracticeCta text="Добавьте tags и task_tags, endpoint назначения тега, чтение тегов задачи и задач тега. Покройте тестом повторную пару и удаление только связи." />
      </Section>
    </RichLesson>
  );
}

import { Braces, ShieldCheck } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, QuizCard, RichHero, RichLesson, Section, TerminalDemo, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 21 · SQL как язык работы с данными";

type LessonProps = { module?: string };

export function Lesson118({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"CREATE TABLE и ограничения данных"}
        intro={"Спроектируем учебную таблицу tasks_sql_lab вручную: выберем типы, primary key, NOT NULL, UNIQUE, DEFAULT и CHECK, затем намеренно нарушим ограничения и прочитаем сообщения базы."}
        tags={[
          { icon: <Braces size={14} />, label: "CREATE TABLE" },
          { icon: <ShieldCheck size={14} />, label: "constraints как гарантии" },
        ]}
      />
      <TheoryBridge link={"Pydantic защищает HTTP-вход, но данные могут попасть в базу и другим путём: скриптом, миграцией или административной командой. Ограничения таблицы становятся последней общей границей целостности."} boundary={"Constraint не заменяет понятное сообщение API. База гарантирует правило, а приложение переводит техническую ошибку в безопасный ответ."} />

      <Section number="01" title={"Почему проверки нужны и в приложении, и в базе"}>
        <Lead>
          {"До записи Pydantic может отклонить пустой title или неверный priority. Но таблица должна защищать себя независимо от конкретного endpoint, иначе другой путь записи сможет сохранить недопустимую строку."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Назвать инварианты:</strong> {"какие свойства обязаны быть истинными для каждой задачи"}
            </li>
            <li>
              <strong>Закрепить в DDL:</strong> {"какие правила выражаются NOT NULL, UNIQUE, DEFAULT и CHECK"}
            </li>
            <li>
              <strong>Проверить нарушением:</strong> {"какую ошибку даёт база и что после неё делает транзакция"}
            </li>
          </ol>
          <p>{"Результат — воспроизводимый CREATE TABLE и журнал трёх контролируемых ошибок."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>Назвать инварианты</>, "какие свойства обязаны быть истинными для каждой задачи"],
            [<>Закрепить в DDL</>, "какие правила выражаются NOT NULL, UNIQUE, DEFAULT и CHECK"],
            [<>Проверить нарушением</>, "какую ошибку даёт база и что после неё делает транзакция"],
          ]}
        />

        <TypeCards>
          <TypeCard badge={"Pydantic"} title={"Граница HTTP"} code={"TaskCreate(priority=9)"}>
            {"Даёт клиенту раннюю и понятную ошибку до работы с базой."}
          </TypeCard>
          <TypeCard badge={"service"} badgeTone="float" title={"Предметный сценарий"} code={"create_task(current_user, data)"}>
            {"Проверяет правила, зависящие от пользователя и контекста операции."}
          </TypeCard>
          <TypeCard badge={"constraint"} badgeTone="str" title={"Гарантия таблицы"} code={"CHECK (priority BETWEEN 1 AND 5)"}>
            {"Не допускает недопустимую строку при любом пути записи."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Одинаковое правило на двух уровнях не всегда лишнее: уровни защищают разные пути и дают разные формы ошибки."}
        </Callout>
      </Section>

      <Section number="02" title={"CREATE TABLE описывает форму хранения"}>
        <Lead>
          {"DDL-команда CREATE TABLE создаёт структуру. Внутри скобок перечисляются колонки и ограничения; данные появляются позже через INSERT."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Имя таблицы</h3>
          <p>{"Для лаборатории используем отдельную tasks_sql_lab, чтобы не повредить рабочие таблицы."}</p>
          <h3>Колонки</h3>
          <p>{"Каждая строка объявления содержит имя, тип и при необходимости ограничения."}</p>
          <h3>Табличные constraints</h3>
          <p>{"Некоторые правила относятся к комбинации колонок и записываются отдельно."}</p>
        </div>

        <CodeBlock
          caption={"минимальная лабораторная таблица"}
          code={`CREATE TABLE tasks_sql_lab (
    id INTEGER PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    priority INTEGER NOT NULL DEFAULT 3,
    is_done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (priority BETWEEN 1 AND 5)
);`}
        />

        <CodeSequence
          title={"Соберите DDL таблицы"}
          prompt={"Расположите части от заголовка CREATE TABLE до закрывающей скобки."}
          pieces={[
            { id: "create", code: "CREATE TABLE tasks_sql_lab (" },
            { id: "id", code: "    id INTEGER PRIMARY KEY," },
            { id: "title", code: "    title VARCHAR(200) NOT NULL," },
            { id: "priority", code: "    priority INTEGER NOT NULL DEFAULT 3," },
            { id: "check", code: "    CHECK (priority BETWEEN 1 AND 5)" },
            { id: "close", code: ");" },
            { id: "insert", code: "INSERT INTO tasks_sql_lab ...", note: "Это уже DML, не часть создания схемы." },
          ]}
          correctOrder={["create", "id", "title", "priority", "check", "close"]}
          explanation={"CREATE TABLE сначала называет таблицу, затем перечисляет колонки и constraints, после чего закрывается скобкой."}
        />

        <Callout tone="info">
          {"Типы SQL выражают контракт хранения. Конкретные детали и строгость типов отличаются между SQLite и PostgreSQL; различия исследуем при переносе в следующем блоке."}
        </Callout>
      </Section>

      <Section number="03" title={"Тип колонки ограничивает форму значения"}>
        <Lead>
          {"INTEGER, VARCHAR, BOOLEAN и TIMESTAMP сообщают базе и инструментам ожидаемый вид данных. Тип — не декоративная подпись: он влияет на операции, сравнения и переносимость схемы."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>INTEGER</h3>
          <p>{"Идентификаторы, приоритеты и счётчики."}</p>
          <h3>VARCHAR(n)</h3>
          <p>{"Текст с ожидаемым пределом длины."}</p>
          <h3>BOOLEAN и TIMESTAMP</h3>
          <p>{"Флаг состояния и момент создания; конкретная реализация зависит от СУБД."}</p>
        </div>

        <MatchPairs
          prompt={"Соедините поле StudyHub с подходящим типом на уровне модели данных."}
          pairs={[
            { left: "id", right: "INTEGER" },
            { left: "title", right: "VARCHAR(200)" },
            { left: "priority", right: "INTEGER" },
            { left: "is_done", right: "BOOLEAN" },
            { left: "created_at", right: "TIMESTAMP" },
          ]}
          explanation={"Тип выбирается по смыслу значений и операциям, а не по тому, как значение выглядит в одном примере."}
        />

        <Callout>
          {"Не храните priority строкой только потому, что input вернул текст. До базы значение должно пройти преобразование и валидацию."}
        </Callout>
      </Section>

      <Section number="04" title={"PRIMARY KEY, NOT NULL и UNIQUE защищают разные правила"}>
        <Lead>
          {"Ограничения нельзя заменять друг другом. PRIMARY KEY идентифицирует строку, NOT NULL запрещает отсутствие значения, UNIQUE запрещает повтор в выбранной колонке или комбинации."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>PRIMARY KEY</h3>
          <p>{"Уникален и не NULL; используется для ссылок и поиска одной строки."}</p>
          <h3>NOT NULL</h3>
          <p>{"Значение обязано присутствовать, но может повторяться."}</p>
          <h3>UNIQUE</h3>
          <p>{"Значения не повторяются по выбранному правилу; NULL ведёт себя по правилам конкретной СУБД."}</p>
        </div>

        <CodeBlock
          caption={"категория с уникальным slug"}
          code={`CREATE TABLE categories_sql_lab (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE
);`}
        />

        <CompareSolutions
          question={"Как надёжнее гарантировать уникальный slug категории?"}
          left={{
            title: "Только Python-проверка",
            code: "if not category_exists(slug):\n    insert_category(slug)",
            note: "Между проверкой и INSERT другая операция может записать тот же slug.",
          }}
          right={{
            title: "UNIQUE плюс обработка ошибки",
            code: "slug VARCHAR(100) NOT NULL UNIQUE",
            note: "База остаётся окончательной точкой гарантии.",
          }}
          preferred="right"
          explanation={"Предварительная проверка улучшает UX, но только UNIQUE защищает таблицу от любого конкурентного или обходного пути."}
        />

        <Callout tone="info">
          {"UNIQUE — гарантия данных, а ответ 409 — HTTP-решение приложения. Это два разных контракта."}
        </Callout>
      </Section>

      <Section number="05" title={"DEFAULT заполняет пропущенное, CHECK проверяет диапазон"}>
        <Lead>
          {"DEFAULT применяется, когда колонка отсутствует в INSERT. Он не исправляет явно переданное неверное значение. CHECK вычисляет условие для новой или изменяемой строки."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>DEFAULT</h3>
          <p>{"Если priority не указан, база подставляет 3."}</p>
          <h3>Явное значение</h3>
          <p>{"priority = 5 сохраняется вместо default."}</p>
          <h3>CHECK</h3>
          <p>{"priority = 9 отклоняется, даже если поле имеет default 3."}</p>
        </div>

        <CodeBlock
          caption={"правила приоритета"}
          code={`priority INTEGER NOT NULL DEFAULT 3,
CHECK (priority BETWEEN 1 AND 5)`}
        />

        <BranchExplorer
          code={`INSERT INTO tasks_sql_lab (id, title)
VALUES (1, 'SQL');

INSERT INTO tasks_sql_lab (id, title, priority)
VALUES (2, 'Constraints', 5);

INSERT INTO tasks_sql_lab (id, title, priority)
VALUES (3, 'Broken', 9);`}
          scenarios={[
            { label: "priority пропущен", activeLine: 0, output: "сохраняется default 3" },
            { label: "priority = 5", activeLine: 3, output: "сохраняется 5" },
            { label: "priority = 9", activeLine: 6, output: "CHECK отклоняет строку" },
          ]}
        />

        <Callout tone="info">
          {"Default действует на уровне базы и полезен для всех клиентов таблицы, но приложение всё равно должно явно понимать ожидаемое значение."}
        </Callout>
      </Section>

      <Section number="06" title={"Намеренно нарушаем ограничения"}>
        <Lead>
          {"Ошибку базы нужно увидеть в безопасной лаборатории. Мы выполняем по одной неверной операции, фиксируем constraint, сообщение и состояние транзакции."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Одна ошибка</h3>
          <p>{"Не запускайте сразу три нарушения: иначе первая остановит сценарий и скроет остальные."}</p>
          <h3>Техническая причина</h3>
          <p>{"Найдите имя ограничения или колонку."}</p>
          <h3>Восстановление</h3>
          <p>{"После ошибки откатите транзакцию перед следующим запросом."}</p>
        </div>

        <TerminalDemo
          title={"контролируемые нарушения"}
          lines={[
            { cmd: "python sql-lab/constraints.py --case null-title" },
            { out: "NOT NULL constraint failed: tasks_sql_lab.title" },
            { cmd: "python sql-lab/constraints.py --case bad-priority" },
            { out: "CHECK constraint failed: priority BETWEEN 1 AND 5" },
            { cmd: "python sql-lab/constraints.py --case duplicate-id" },
            { out: "UNIQUE constraint failed: tasks_sql_lab.id" },
          ]}
        />

        <Callout>
          {"Точный текст ошибок зависит от СУБД. В коде не следует строить бизнес-логику на полном совпадении длинной строки драйвера."}
        </Callout>
      </Section>

      <Section number="07" title={"Ошибка constraint и состояние транзакции"}>
        <Lead>
          {"После ошибки записи транзакция должна быть приведена в понятное состояние. В ORM-сценарии это означает rollback перед продолжением работы с Session."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Попытка записи</h3>
          <p>{"База проверяет constraints при выполнении или commit."}</p>
          <h3>Ошибка</h3>
          <p>{"Операция не становится успешной частью транзакции."}</p>
          <h3>Rollback</h3>
          <p>{"Приложение откатывает транзакцию и только потом выполняет новый statement."}</p>
        </div>

        <BugHunt
          code={`try:
    session.add(TaskModel(title=None))
    session.commit()
except IntegrityError:
    print("Не удалось сохранить")

tasks = session.execute(select(TaskModel)).scalars().all()`}
          question={"Какого обязательного шага не хватает после IntegrityError?"}
          options={[
            "session.rollback()",
            "session.refresh()",
            "engine.dispose()",
          ]}
          correctIndex={0}
          explanation={"После ошибки commit Session остаётся в состоянии неуспешной транзакции до rollback."}
          fix={`try:
    session.add(TaskModel(title=None))
    session.commit()
except IntegrityError:
    session.rollback()
    print("Не удалось сохранить")

tasks = session.execute(select(TaskModel)).scalars().all()`}
        />

        <Callout tone="info">
          {"Rollback не «чинит» неверные данные. Он очищает неуспешную транзакцию, чтобы Session снова могла работать."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка блока"}>
        <Lead>
          {"Создайте таблицу заново из одного DDL-файла, выполните успешный INSERT и три контролируемых нарушения. Для каждой ошибки назовите constraint и объясните, почему приложение всё равно сохраняет собственную валидацию."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает NOT NULL?"}
            options={[
              "запрещает отсутствие значения",
              "запрещает повторы",
              "создаёт индекс сортировки",
            ]}
            correctIndex={0}
            explanation={"NOT NULL требует значение в каждой строке."}
          />
          <QuizCard
            question={"Когда применяется DEFAULT?"}
            options={[
              "когда колонка не указана в INSERT",
              "при любом неверном значении",
              "только при SELECT",
            ]}
            correctIndex={0}
            explanation={"Явно переданное значение не заменяется default автоматически."}
          />
          <QuizCard
            question={"Какая гарантия окончательно защищает уникальность?"}
            options={[
              "UNIQUE в базе",
              "один if в endpoint",
              "подсказка в документации",
            ]}
            correctIndex={0}
            explanation={"Только constraint действует для всех путей записи."}
          />
          <QuizCard
            question={"Что сделать с Session после IntegrityError?"}
            options={[
              "rollback",
              "refresh всех объектов",
              "создать новую таблицу",
            ]}
            correctIndex={0}
            explanation={"Rollback завершает неуспешную транзакцию."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"CREATE TABLE описывает схему, а не добавляет строки."}</>,
            <>{"Типы колонок выражают форму и допустимые операции."}</>,
            <>{"PRIMARY KEY, NOT NULL и UNIQUE решают разные задачи."}</>,
            <>{"DEFAULT работает только для пропущенной колонки."}</>,
            <>{"CHECK защищает инвариант на уровне таблицы."}</>,
            <>{"Pydantic и database constraints дополняют друг друга."}</>,
            <>{"После ошибки транзакции нужен rollback."}</>,
          ]}
        />

        <PracticeCta text={"Создайте sql-lab/schema.sql с tasks_sql_lab и categories_sql_lab, добавьте NOT NULL, UNIQUE, DEFAULT и CHECK, затем подготовьте constraints.py, который по одному воспроизводит три ошибки и после каждой корректно откатывает транзакцию."} />
      </Section>
    </RichLesson>
  );
}

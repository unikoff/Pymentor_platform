import { Bug, Wrench } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 21 · SQL как язык работы с данными";

type LessonProps = { module?: string };

export function Lesson121({ module }: LessonProps) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"UPDATE и DELETE без опасных ошибок"}
        intro={"Научимся изменять и удалять только выбранные строки: сделаем WHERE обязательной частью сценария, проверим RETURNING и row count, воспроизведём запрос без условия внутри откатываемой транзакции."}
        tags={[
          { icon: <Wrench size={14} />, label: "UPDATE · SET" },
          { icon: <Bug size={14} />, label: "DELETE · WHERE · rollback" },
        ]}
      />
      <TheoryBridge link={"UPDATE и DELETE отличаются от SELECT ценой ошибки: неверный фильтр меняет данные. Поэтому безопасный сценарий сначала формулирует target, затем выполняет операцию в транзакции и проверяет 0, 1 или много затронутых строк."} boundary={"Запрет «никогда не писать UPDATE без WHERE» не абсолютен для административных миграций, но в пользовательском CRUD отсутствие target-фильтра считается блокирующей ошибкой."} />

      <Section number="01" title={"Сначала определить target операции"}>
        <Lead>
          {"Перед UPDATE или DELETE нужно вслух назвать множество строк: «задача с id 7 текущего пользователя», а не просто «таблица tasks». Это превращает WHERE из дополнения в часть контракта."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>Назвать target:</strong> {"какие строки разрешено затронуть"}
            </li>
            <li>
              <strong>Зафиксировать transaction:</strong> {"как проверить результат до commit"}
            </li>
            <li>
              <strong>Проверить cardinality:</strong> {"ожидалось 0, 1 или несколько строк"}
            </li>
          </ol>
          <p>{"Результат — safe_mutations.py, который отказывается выполнять пользовательскую операцию без WHERE."}</p>
        </div>

        <MethodGrid
          rows={[
            [<>Назвать target</>, "какие строки разрешено затронуть"],
            [<>Зафиксировать transaction</>, "как проверить результат до commit"],
            [<>Проверить cardinality</>, "ожидалось 0, 1 или несколько строк"],
          ]}
        />

        <TypeCards>
          <TypeCard badge={"target"} title={"Множество строк"} code={"WHERE id = :task_id AND owner_id = :user_id"}>
            {"Фильтр должен выражать id и при необходимости ownership."}
          </TypeCard>
          <TypeCard badge={"change"} badgeTone="float" title={"Новые значения"} code={"SET is_done = TRUE"}>
            {"SET содержит только разрешённые изменяемые поля."}
          </TypeCard>
          <TypeCard badge={"evidence"} badgeTone="str" title={"Результат"} code={"RETURNING id, is_done"}>
            {"RETURNING или rowcount подтверждает фактическое действие."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Без точного target операция технически корректна, но прикладно опасна."}
        </Callout>
      </Section>

      <Section number="02" title={"UPDATE меняет выбранные колонки"}>
        <Lead>
          {"UPDATE называет таблицу, SET и WHERE. Колонки, отсутствующие в SET, сохраняют прежние значения."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>SET</h3>
          <p>{"Каждое присваивание задаёт новое значение выбранной колонки."}</p>
          <h3>WHERE</h3>
          <p>{"Фильтр определяет строки, к которым применяется SET."}</p>
          <h3>RETURNING</h3>
          <p>{"Позволяет увидеть изменённые поля без отдельного SELECT."}</p>
        </div>

        <CodeBlock
          caption={"завершить одну задачу"}
          code={`UPDATE tasks_sql_lab
SET is_done = TRUE
WHERE id = :task_id
RETURNING id, title, is_done;`}
        />

        <BranchExplorer
          code={`UPDATE tasks_sql_lab
SET is_done = TRUE
WHERE id = :task_id
RETURNING id;`}
          scenarios={[
            { label: "id существует", activeLine: 2, output: "одна строка обновлена и возвращена" },
            { label: "id отсутствует", activeLine: 2, output: "0 строк, это обычный not found" },
            { label: "WHERE удалён", activeLine: 1, output: "обновятся все строки — операция блокируется review" },
          ]}
        />

        <Callout tone="info">
          {"0 затронутых строк не обязательно ошибка базы. Для API это часто сценарий 404 или запрет ownership, определяемый контрактом."}
        </Callout>
      </Section>

      <Section number="03" title={"DELETE удаляет строки, а не очищает поля"}>
        <Lead>
          {"DELETE FROM удаляет целые строки, удовлетворяющие WHERE. Для мягкого удаления нужна отдельная модель состояния, например deleted_at, а не случайная замена настоящего DELETE."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Hard delete</h3>
          <p>{"Строка физически исчезает из текущего набора данных."}</p>
          <h3>Soft delete</h3>
          <p>{"UPDATE выставляет признак; все чтения обязаны учитывать его."}</p>
          <h3>Выбор</h3>
          <p>{"Принимается по требованиям восстановления, аудита и ссылок, а не по привычке."}</p>
        </div>

        <CodeBlock
          caption={"удалить тестовую строку"}
          code={`DELETE FROM tasks_sql_lab
WHERE id = :task_id
RETURNING id, title;`}
        />

        <CompareSolutions
          question={"Что точнее выражает требование «удалить лабораторную запись навсегда»?"}
          left={{
            title: "Скрыть флагом",
            code: "UPDATE tasks_sql_lab SET is_deleted = TRUE WHERE id = :id",
            note: "Добавляет soft-delete контракт, которого пока нет.",
          }}
          right={{
            title: "Удалить строку",
            code: "DELETE FROM tasks_sql_lab WHERE id = :id RETURNING id",
            note: "Соответствует явному требованию лаборатории.",
          }}
          preferred="right"
          explanation={"Soft delete полезен только при сформулированной потребности и требует изменений всех запросов чтения."}
        />

        <Callout>
          {"DELETE может нарушить foreign key или бизнес-инвариант. В блоке 23 связанные операции будут собраны в транзакции."}
        </Callout>
      </Section>

      <Section number="04" title={"Запрос без WHERE — блокирующая ошибка"}>
        <Lead>
          {"Самый опасный дефект выглядит синтаксически просто: UPDATE или DELETE без фильтра применяются ко всей таблице. Защита строится не на внимательности одного человека, а на процедуре."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Review rule</h3>
          <p>{"Для пользовательского CRUD statement без WHERE не принимается."}</p>
          <h3>Лаборатория</h3>
          <p>{"Опасный пример выполняется только на копии данных внутри rollback."}</p>
          <h3>Backup и migration</h3>
          <p>{"Массовые изменения имеют отдельный план, проверку и восстановление."}</p>
        </div>

        <BugHunt
          code={`def delete_task(connection, task_id):
    statement = text("DELETE FROM tasks_sql_lab")
    connection.execute(statement, {"task_id": task_id})`}
          question={"Почему task_id не защищает данные?"}
          options={[
            "Placeholder вообще не используется в SQL",
            "DELETE не принимает параметры",
            "text() удаляет WHERE автоматически",
          ]}
          correctIndex={0}
          explanation={"Переданный словарь не влияет на statement, если :task_id отсутствует в тексте SQL."}
          fix={`def delete_task(connection, task_id):
    statement = text("""
        DELETE FROM tasks_sql_lab
        WHERE id = :task_id
        RETURNING id
    """)
    return connection.execute(
        statement,
        {"task_id": task_id},
    ).first()`}
        />

        <Callout>
          {"Наличие параметра в Python не означает наличие фильтра в SQL. Проверяется финальный statement."}
        </Callout>
      </Section>

      <Section number="05" title={"RETURNING и row count подтверждают результат"}>
        <Lead>
          {"После mutation код должен различать 0, 1 и много строк. RETURNING даёт данные затронутых строк, row count — количество, но точное поведение зависит от драйвера и операции."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>0 строк</h3>
          <p>{"Target не найден или не доступен."}</p>
          <h3>1 строка</h3>
          <p>{"Ожидаемый CRUD-сценарий по primary key."}</p>
          <h3>Много строк</h3>
          <p>{"Допустимо только для явно массовой операции."}</p>
        </div>

        <StepThrough
          code={`result = connection.execute(statement, params)
row = result.mappings().one_or_none()
if row is None:
    raise TaskNotFound(task_id)
connection.commit()`}
          steps={[
            { line: 0, note: "База выполняет UPDATE или DELETE с WHERE.", vars: {"result": "Result"} },
            { line: 1, note: "Ожидается не больше одной строки RETURNING.", vars: {"row": "mapping | None"} },
            { line: 2, note: "Отсутствие строки превращается в понятный прикладной сценарий.", vars: {"outcome": "not found"} },
            { line: 4, note: "Commit выполняется только после проверки результата.", vars: {"transaction": "committed"} },
          ]}
        />

        <Callout tone="info">
          {"Не выполняйте commit до проверки, если сценарий требует подтвердить ровно одну затронутую строку."}
        </Callout>
      </Section>

      <Section number="06" title={"Учебный rollback для опасного сценария"}>
        <Lead>
          {"Чтобы увидеть последствия массовой операции без потери данных, создаём отдельную лабораторную таблицу, начинаем транзакцию, считаем строки до и после, затем делаем rollback."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Baseline</h3>
          <p>{"COUNT до изменения фиксирует исходное состояние."}</p>
          <h3>Experiment</h3>
          <p>{"Выполняется намеренно опасный statement."}</p>
          <h3>Rollback</h3>
          <p>{"Транзакция откатывается, повторный COUNT должен совпасть с baseline."}</p>
        </div>

        <TerminalDemo
          title={"массовый UPDATE без сохранения"}
          lines={[
            { cmd: "python sql-lab/dangerous_update_demo.py" },
            { out: "before: 12 open tasks" },
            { out: "after UPDATE without WHERE: 0 open tasks" },
            { out: "ROLLBACK" },
            { out: "after rollback: 12 open tasks" },
          ]}
        />

        <Callout>
          {"Такой эксперимент проводится только на лабораторной таблице. Рабочая база не является площадкой для демонстрации опасного запроса."}
        </Callout>
      </Section>

      <Section number="07" title={"Безопасная функция mutation"}>
        <Lead>
          {"Функция должна принимать target и новые данные отдельно, использовать фиксированный parameterized statement, проверять результат и управлять транзакцией на понятной границе."}
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Inputs</h3>
          <p>{"task_id и новое значение передаются как параметры."}</p>
          <h3>Statement</h3>
          <p>{"WHERE присутствует в статическом тексте."}</p>
          <h3>Outcome</h3>
          <p>{"Функция возвращает изменённую строку или явный not found."}</p>
        </div>

        <CodeBlock
          caption={"закрыть задачу безопасно"}
          code={`def mark_done(connection, task_id: int):
    statement = text("""
        UPDATE tasks_sql_lab
        SET is_done = TRUE
        WHERE id = :task_id
        RETURNING id, title, is_done
    """)

    row = connection.execute(
        statement,
        {"task_id": task_id},
    ).mappings().one_or_none()

    if row is None:
        raise TaskNotFound(task_id)

    return dict(row)`}
        />

        <TrueFalse
          statement={<>{"Передача task_id в execute автоматически ограничивает UPDATE одной строкой, даже если WHERE отсутствует."}</>}
          isTrue={false}
          explanation={"Параметр влияет только на placeholders, которые реально присутствуют в statement."}
        />

        <Callout tone="info">
          {"Транзакционная граница может находиться выше функции, если один пользовательский сценарий объединяет несколько операций. Важно, чтобы решение было явным."}
        </Callout>
      </Section>

      <Section number="08" title={"Контрольная точка блока"}>
        <Lead>
          {"Выполните успешный UPDATE, not found, безопасный DELETE и лабораторный запрос без WHERE с обязательным rollback. Для каждого сценария зафиксируйте число затронутых строк и состояние данных после завершения."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что обязательно определяет WHERE в mutation?"}
            options={[
              "target строк",
              "новые колонки",
              "формат HTTP-ответа",
            ]}
            correctIndex={0}
            explanation={"WHERE задаёт множество изменяемых или удаляемых строк."}
          />
          <QuizCard
            question={"Что означает 0 строк после UPDATE по id?"}
            options={[
              "target не найден",
              "таблица удалена",
              "constraint отключён",
            ]}
            correctIndex={0}
            explanation={"Операция корректна технически, но строка не выбрана."}
          />
          <QuizCard
            question={"Когда commit безопаснее выполнять?"}
            options={[
              "после проверки ожидаемого результата",
              "до execute",
              "внутри текста SQL",
            ]}
            correctIndex={0}
            explanation={"Сначала подтверждается outcome операции."}
          />
          <QuizCard
            question={"Зачем демонстрации rollback?"}
            options={[
              "увидеть эффект без сохранения",
              "ускорить DELETE",
              "создать primary key",
            ]}
            correctIndex={0}
            explanation={"Rollback возвращает лабораторные данные к baseline."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"UPDATE использует SET и обязательный target-фильтр."}</>,
            <>{"DELETE удаляет строки, а soft delete является отдельным контрактом."}</>,
            <>{"Параметр в Python не создаёт WHERE автоматически."}</>,
            <>{"RETURNING помогает проверить фактический outcome."}</>,
            <>{"0, 1 и много строк — разные прикладные сценарии."}</>,
            <>{"Опасные statements исследуются только в лаборатории."}</>,
            <>{"Commit выполняется после проверки, rollback возвращает транзакцию к исходному состоянию."}</>,
          ]}
        />

        <PracticeCta text={"Создайте safe_mutations.py с mark_done и delete_task: статические parameterized statements, WHERE по id, RETURNING, one_or_none и явный TaskNotFound. Добавьте dangerous_update_demo.py, который выполняет массовый UPDATE только внутри rollback и доказывает восстановление COUNT."} />
      </Section>
    </RichLesson>
  );
}

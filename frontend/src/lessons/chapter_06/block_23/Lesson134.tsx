import { ShieldCheck, Wrench } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FillBlank, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 23 · JOIN, агрегаты и транзакции";

export function Lesson134({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title="Транзакция из нескольких изменений"
        intro="Сделаем бизнес-операцию атомарной: завершение задачи и запись progress event либо сохраняются вместе, либо полностью откатываются при ошибке второго шага."
        tags={[
          { icon: <ShieldCheck size={14} />, label: "атомарность операции" },
          {
            icon: <Wrench size={14} />,
            label: "rollback и восстановление Session",
          },
        ]}
      />
      <TheoryBridge link={"Отдельный CRUD уже использовал commit. Теперь одна пользовательская команда меняет несколько таблиц, поэтому граница транзакции должна совпасть с границей бизнес-операции."} boundary={"Два последовательных commit создают две независимые транзакции. Ошибка второго шага уже не может отменить первый сохранённый результат."} />

      <Section number="01" title="Одна команда пользователя — одна граница">
        <Lead>
          {
            "Команда «завершить задачу» теперь должна изменить tasks.is_done и создать запись progress_events. Половина результата противоречит бизнес-смыслу."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Шаг 1</h3>
          <p>{"Изменить состояние Task."}</p>
          <h3>Шаг 2</h3>
          <p>{"Добавить ProgressEvent."}</p>
          <h3>Гарантия</h3>
          <p>{"Оба изменения сохраняются или ни одно."}</p>
        </div>

        <div className="lesson-route">
          <ol>
            <li>
              <strong>{"BEGIN:"}</strong> {"открыть рабочую границу"}
            </li>
            <li>
              <strong>{"Изменить две сущности:"}</strong>{" "}
              {"не фиксировать половину"}
            </li>
            <li>
              <strong>{"COMMIT или ROLLBACK:"}</strong>{" "}
              {"единый исход операции"}
            </li>
          </ol>
          <p>
            {
              "Транзакция определяется не количеством SQL-команд, а единством прикладного результата."
            }
          </p>
        </div>

        <Callout tone="info">
          {
            "Транзакция определяется не количеством SQL-команд, а единством прикладного результата."
          }
        </Callout>
      </Section>

      <Section number="02" title="BEGIN, COMMIT и ROLLBACK">
        <Lead>
          {
            "BEGIN открывает транзакцию, COMMIT делает все изменения видимыми как единый результат, ROLLBACK отменяет изменения текущей транзакции."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>BEGIN</h3>
          <p>{"Начало атомарной работы."}</p>
          <h3>COMMIT</h3>
          <p>{"Подтверждение всех шагов."}</p>
          <h3>ROLLBACK</h3>
          <p>{"Возврат к состоянию до BEGIN."}</p>
        </div>

        <TypeCards>
          <TypeCard badge="BEGIN" title="Открыть транзакцию" code={`BEGIN;`}>
            {"Следующие изменения принадлежат одной границе."}
          </TypeCard>
          <TypeCard
            badge="COMMIT"
            badgeTone="float"
            title="Подтвердить"
            code={`COMMIT;`}
          >
            {"Все успешные шаги сохраняются."}
          </TypeCard>
          <TypeCard
            badge="ROLLBACK"
            badgeTone="str"
            title="Отменить"
            code={`ROLLBACK;`}
          >
            {"Ни один незакоммиченный шаг не остаётся."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question="Что именно отменяет ROLLBACK?"
          answer={
            <p>
              {
                "Изменения текущей незавершённой транзакции. Он не отменяет данные, которые уже были подтверждены предыдущим commit."
              }
            </p>
          }
        />

        <Callout tone="info">
          {
            "Session SQLAlchemy управляет транзакцией, но база остаётся источником атомарной гарантии."
          }
        </Callout>
      </Section>

      <Section number="03" title="Два изменения внутри одной транзакции">
        <Lead>
          {
            "Сначала загружаем task, меняем is_done, затем добавляем event. Единственный commit располагается после обоих успешных шагов."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Load</h3>
          <p>{"Найти задачу и проверить право."}</p>
          <h3>Mutate</h3>
          <p>{"Изменить task и добавить event."}</p>
          <h3>Commit</h3>
          <p>{"Подтвердить оба изменения в конце."}</p>
        </div>

        <StepThrough
          code={`BEGIN;
UPDATE tasks SET is_done = TRUE WHERE id = 10;
INSERT INTO progress_events(task_id, kind) VALUES (10, 'task_done');
COMMIT;`}
          steps={[
            {
              line: 0,
              note: "Открывается единая транзакция.",
              vars: { tx: "active" },
            },
            {
              line: 1,
              note: "Изменение task пока не подтверждено.",
              vars: { "task #10": "done (pending)" },
            },
            {
              line: 2,
              note: "Event добавляется в ту же транзакцию.",
              vars: { event: "pending" },
            },
            {
              line: 3,
              note: "COMMIT делает оба результата постоянными.",
              vars: { task: "done", event: "saved" },
            },
          ]}
        />

        <PredictOutput
          code={`BEGIN;
UPDATE tasks SET is_done = TRUE WHERE id = 10;
INSERT INTO progress_events(task_id, kind) VALUES (10, 'task_done');
ROLLBACK;`}
          output={`После rollback task остаётся незавершённой, progress event отсутствует.`}
          hint="Сначала предскажите результат, затем подтвердите его на минимальном наборе данных."
        />

        <Callout tone="info">
          {
            "flush может отправить SQL раньше commit, но изменения всё ещё принадлежат текущей транзакции и могут быть откатаны."
          }
        </Callout>
      </Section>

      <Section number="04" title="Почему два commit ломают атомарность">
        <Lead>
          {
            "Если подтвердить task до создания event, первый шаг уже станет отдельным завершённым фактом. Ошибка второй операции оставит половину бизнес-сценария."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Commit #1</h3>
          <p>{"Task сохранена окончательно."}</p>
          <h3>Ошибка</h3>
          <p>{"Event не создаётся."}</p>
          <h3>Итог</h3>
          <p>{"Система сообщает сбой, но состояние уже изменено."}</p>
        </div>

        <CompareSolutions
          question="Какой вариант точнее сохраняет требуемый контракт?"
          left={{
            title: "Два независимых commit",
            code: `task.is_done = True
session.commit()

session.add(event)
session.commit()`,
            note: "Ошибка event не отменит первый commit.",
          }}
          right={{
            title: "Один commit",
            code: `task.is_done = True
session.add(event)
session.commit()`,
            note: "Оба изменения имеют единый исход.",
          }}
          preferred="right"
          explanation="Предпочтительный вариант делает источник данных, границу операции и наблюдаемый результат явными."
        />

        <FillBlank
          prompt="Какая команда должна быть единственной в конце успешной операции?"
          before={`session.`}
          after={`()`}
          options={["commit", "close", "refresh"]}
          answer="commit"
          explanation="Commit подтверждает все накопленные изменения одной транзакции."
        />

        <Callout tone="info">
          {
            "Refresh нужен для чтения данных после записи, но не является границей атомарности."
          }
        </Callout>
      </Section>

      <Section number="05" title="Ошибка между шагами и обязательный rollback">
        <Lead>
          {
            "Constraint progress_events может отклонить дублирующее событие. После IntegrityError транзакция считается неуспешной, а Session требует rollback перед дальнейшей работой."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>IntegrityError</h3>
          <p>{"База отклонила ограничение."}</p>
          <h3>Failed transaction</h3>
          <p>
            {
              "Следующие команды нельзя выполнять как будто ничего не произошло."
            }
          </p>
          <h3>Rollback</h3>
          <p>
            {
              "Очищает неуспешную транзакцию и возвращает Session в рабочее состояние."
            }
          </p>
        </div>

        <BranchExplorer
          code={`update task → flush ok
insert event → unique violation
except IntegrityError → rollback
next SELECT → session works`}
          scenarios={[
            { label: "успех", activeLine: 0, output: "commit task + event" },
            {
              label: "ошибка event",
              activeLine: 1,
              output: "перейти в except",
            },
            {
              label: "rollback",
              activeLine: 2,
              output: "оба pending-изменения отменены",
            },
            {
              label: "повторный запрос",
              activeLine: 3,
              output: "Session снова готова",
            },
          ]}
        />

        <MethodGrid
          rows={[
            [
              <>except IntegrityError</>,
              "перехватывает ожидаемую ошибку ограничения",
            ],
            [
              <>session.rollback()</>,
              "восстанавливает транзакционное состояние Session",
            ],
            [
              <>raise ConflictError</>,
              "переводит инфраструктурную ошибку в прикладной контракт",
            ],
          ]}
        />

        <Callout tone="info">
          {
            "Нельзя продолжать использовать Session после failed commit без rollback: она хранит состояние неуспешной транзакции."
          }
        </Callout>
      </Section>

      <Section number="06" title="Transaction context управляет исходом">
        <Lead>
          {
            "Контекст session.begin() фиксирует общий шаблон: при нормальном выходе commit, при исключении rollback. Внутри остаётся только бизнес-последовательность."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>with session.begin()</h3>
          <p>{"Открывает управляемую транзакцию."}</p>
          <h3>Успех</h3>
          <p>{"Контекст подтверждает изменения."}</p>
          <h3>Exception</h3>
          <p>{"Контекст откатывает и пробрасывает ошибку."}</p>
        </div>

        <CodeSequence
          prompt="Соберите атомарный service flow."
          pieces={[
            { id: "begin", code: "with session.begin():" },
            { id: "load", code: "    task = session.get(TaskModel, task_id)" },
            { id: "change", code: "    task.is_done = True" },
            {
              id: "event",
              code: '    session.add(ProgressEvent(task_id=task.id, kind="task_done"))',
            },
            { id: "return", code: "return task" },
          ]}
          correctOrder={["begin", "load", "change", "event", "return"]}
          explanation="Порядок отражает путь от описания запроса или операции к её выполнению и проверке."
        />

        <TerminalDemo
          title="воспроизводимая проверка"
          lines={[
            { cmd: `pytest tests/test_complete_task.py -q` },
            {
              out: `test_complete_task_saves_both ........ PASSED
test_event_error_rolls_back_task ..... PASSED`,
            },
          ]}
        />

        <Callout tone="info">
          {
            "Не смешивайте автоматический begin-контекст с дополнительным commit внутри него без ясной причины."
          }
        </Callout>
      </Section>

      <Section number="07" title="Service, endpoint и тест атомарности">
        <Lead>
          {
            "Endpoint получает команду и переводит прикладные ошибки в HTTP. Service определяет транзакционную границу, а тест намеренно ломает второй шаг и проверяет состояние обеих таблиц."
          }
        </Lead>

        <div className="lesson-practice-steps">
          <h3>Endpoint</h3>
          <p>{"Проверяет transport contract."}</p>
          <h3>Service</h3>
          <p>{"Оркестрирует task + event."}</p>
          <h3>Test</h3>
          <p>{"Доказывает отсутствие половины операции."}</p>
        </div>

        <BugHunt
          code={`def complete_task(session, task_id):
    task = session.get(TaskModel, task_id)
    task.is_done = True
    session.commit()
    session.add(ProgressEvent(task_id=task_id, kind="task_done"))
    session.commit()`}
          question="Где нарушена граница операции?"
          options={[
            "Первый commit подтверждает половину сценария",
            "session.get нельзя использовать",
            "Event нужно создать до task",
          ]}
          correctIndex={0}
          explanation="Task уже сохранена до попытки создать event."
          fix={`def complete_task(session, task_id):
    with session.begin():
        task = session.get(TaskModel, task_id)
        task.is_done = True
        session.add(ProgressEvent(task_id=task_id, kind="task_done"))
    return task`}
        />

        <CodeBlock
          caption="рабочая версия для StudyHub"
          code={`def test_event_error_rolls_back_task(session):
    seed_duplicate_event(session, task_id=10)

    with pytest.raises(TaskAlreadyCompletedError):
        complete_task(session, task_id=10)

    session.expire_all()
    assert session.get(TaskModel, 10).is_done is False`}
        />

        <Callout tone="info">
          {
            "Тест проверяет базу после ошибки, а не только факт исключения. Именно состояние доказывает атомарность."
          }
        </Callout>
      </Section>

      <Section number="08" title="Контрольная точка и проектная практика">
        <Lead>
          {
            "Ученик реализует атомарное завершение задачи и запись progress event, обрабатывает IntegrityError и проверяет rollback тестом. Перед переходом дальше нужно объяснить успешный путь, ожидаемую ошибку и связь ручного SQL с SQLAlchemy."
          }
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question="Что означает атомарность?"
            options={[
              "Все шаги сохраняются вместе или откатываются вместе",
              "Каждый шаг имеет отдельный commit",
              "Запрос выполняется без Session",
            ]}
            correctIndex={0}
            explanation="Операция не оставляет частичный результат."
          />
          <QuizCard
            question="Почему два commit опасны?"
            options={[
              "Первый нельзя отменить ошибкой второго",
              "Commit удаляет таблицу",
              "Второй commit всегда игнорируется",
            ]}
            correctIndex={0}
            explanation="Каждый commit завершает отдельную транзакцию."
          />
          <QuizCard
            question="Что делать после IntegrityError?"
            options={[
              "Rollback текущей Session",
              "Продолжить SELECT без действий",
              "Удалить engine",
            ]}
            correctIndex={0}
            explanation="Rollback восстанавливает рабочее транзакционное состояние."
          />
          <QuizCard
            question="Что должен проверить тест rollback?"
            options={[
              "Состояние обеих таблиц после ошибки",
              "Только текст exception",
              "Количество строк кода",
            ]}
            correctIndex={0}
            explanation="Атомарность доказывается отсутствием частичного изменения."
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Транзакционная граница совпадает с бизнес-операцией."}</>,
            <>{"BEGIN объединяет несколько SQL-изменений."}</>,
            <>{"Один commit подтверждает весь успешный сценарий."}</>,
            <>{"Rollback отменяет текущие незакоммиченные изменения."}</>,
            <>{"IntegrityError требует восстановления Session."}</>,
            <>{"session.begin() выражает commit/rollback контекстом."}</>,
            <>{"Тест проверяет состояние после намеренного сбоя."}</>,
          ]}
        />

        <PracticeCta text="Реализуйте complete_task: обновление task и создание progress event в одной транзакции. Добавьте тест успешного пути, дублирующего event и пригодности Session после rollback." />
      </Section>
    </RichLesson>
  );
}

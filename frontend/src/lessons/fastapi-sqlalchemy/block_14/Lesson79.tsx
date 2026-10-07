import { Layers, Save } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 14 · SQLite и основы SQLAlchemy";

export function Lesson79({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Session: add, commit, refresh, rollback, close"}
        intro={"Проследим полный жизненный цикл SQLAlchemy Session: фабрика рабочих контекстов, состояния ORM-объекта, Unit of Work, flush и commit, синхронизация через refresh, восстановление rollback и освобождение ресурсов."}
        tags={[
          { icon: <Layers size={14} />, label: "Session и Unit of Work" },
          { icon: <Save size={14} />, label: "commit и rollback" },
        ]}
      />
      <TheoryBridge link={"Таблица существует, однако engine сам не отслеживает набор изменений одного сценария. Session формирует рабочий контекст и транзакционную границу."} boundary={"add помещает объект в Unit of Work, но не гарантирует запись на диск. Фиксация выполняется commit, а после ошибки требуется rollback."} />

      <Section number="01" title="Таблица существует, но кто управляет изменениями">
        <Lead>
          {"Engine открывает соединения, а ORM-модель описывает строки. Для прикладного сценария нужен ещё один объект: Session отслеживает ORM-объекты, собирает изменения и выполняет их в рамках транзакции."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>{"Создать фабрику:"}</strong> {"sessionmaker связывает новые Session с Engine."}</li>
            <li><strong>{"Добавить объект:"}</strong> {"add регистрирует его в Unit of Work."}</li>
            <li><strong>{"Зафиксировать:"}</strong> {"commit завершает транзакцию."}</li>
            <li><strong>{"Синхронизировать:"}</strong> {"refresh получает значения, сформированные базой."}</li>
            <li><strong>{"Завершить безопасно:"}</strong> {"rollback восстанавливает Session после ошибки, close освобождает ресурсы."}</li>
          </ol>
          <p>{"В конце занятия задача будет создана отдельным скриптом, а ученик сможет объяснить каждый переход состояния объекта."}</p>
        </div>

        <TypeCards>
          <TypeCard badge="engine" title="Engine">
            {"Инфраструктура подключений и SQL-диалекта."}
          </TypeCard>
          <TypeCard badge="session" badgeTone="float" title="Session">
            {"Рабочий контекст ORM-операции и Unit of Work."}
          </TypeCard>
          <TypeCard badge="transaction" badgeTone="str" title="Транзакция">
            {"Граница, внутри которой изменения фиксируются вместе или откатываются."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Session в SQLAlchemy не имеет отношения к пользовательской cookie-session. Здесь это объект доступа к базе и отслеживания ORM-состояния."}
        </Callout>
      </Section>
      <Section number="02" title="sessionmaker создаёт Session с общей конфигурацией">
        <Lead>
          {"Вместо ручной настройки каждой Session создаётся фабрика. Она знает Engine и выдаёт новый независимый рабочий контекст для конкретного сценария."}
        </Lead>

        <CodeBlock
          caption="app/database.py"
          code={`from sqlalchemy.orm import sessionmaker

SessionFactory = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)`}
        />

        <MethodGrid
          rows={[
            [<>SessionFactory</>, "фабрика новых Session"],
            [<>bind=engine</>, "какой Engine использовать для SQL"],
            [<>autoflush=False</>, "не выполнять автоматический flush перед некоторыми запросами"],
            [<>expire_on_commit=False</>, "не помечать все атрибуты истёкшими после commit"],
          ]}
        />

        <CompareSolutions
          question="Как организовать рабочие контексты запросов?"
          left={{
            title: "Одна глобальная Session",
            code: "session = SessionFactory()",
            note: "Состояние и ошибки разных запросов смешиваются.",
          }}
          right={{
            title: "Новая Session на сценарий",
            code: "with SessionFactory() as session:",
            note: "Жизненный цикл видим и ограничен.",
          }}
          preferred="right"
          explanation="Session содержит mutable state и должна принадлежать одному последовательному Unit of Work."
        />

        <Callout>
          {"Параметры фабрики не нужно копировать без понимания. В курсе они выбраны так, чтобы жизненный цикл был наглядным; позже сравним альтернативы."}
        </Callout>
      </Section>
      <Section number="03" title="Состояния ORM-объекта: transient, pending, persistent">
        <Lead>
          {"ORM-объект проходит несколько состояний. Сразу после конструктора он существует только в Python. После add Session начинает отслеживать его. После flush или commit строка появляется в базе и объект получает постоянную идентичность."}
        </Lead>

        <StepThrough
          code={`task = TaskModel(
    title="Изучить Session",
    priority=4,
)

session.add(task)
session.commit()
session.refresh(task)`}
          steps={[
            { line: 0, note: "Создан transient-объект вне Session.", vars: { state: "transient", id: "None" } },
            { line: 5, note: "add переводит объект в pending.", vars: { state: "pending", SQL: "ещё не обязательно выполнен" } },
            { line: 6, note: "commit вызывает flush и фиксирует транзакцию.", vars: { state: "persistent", row: "saved" } },
            { line: 7, note: "refresh перечитывает значения из базы.", vars: { id: "1" } },
          ]}
        />

        <MatchPairs
          prompt="Соедините состояние и его смысл."
          pairs={[
            { left: "transient", right: "объект создан, но Session о нём не знает" },
            { left: "pending", right: "объект добавлен в Unit of Work" },
            { left: "persistent", right: "объект связан со строкой базы" },
            { left: "detached", right: "объект больше не связан с активной Session" },
          ]}
          explanation="Названия помогают диагностировать, почему объект ещё не записан или не может лениво загрузить данные."
        />

        <RecallCard
          question="Почему task.id сначала равен None?"
          answer={<p>{"Идентификатор генерируется SQLite при INSERT. До flush или commit база ещё не назначила значение."}</p>}
        />
      </Section>
      <Section number="04" title="add, flush и commit — не одно действие">
        <Lead>
          {"add сообщает Session о новом объекте. flush синхронизирует накопленные изменения с базой внутри текущей транзакции. commit сначала выполняет необходимый flush, а затем фиксирует транзакцию."}
        </Lead>

        <CodeBlock
          caption="три уровня операции"
          code={`session.add(task)     # зарегистрировать изменение
session.flush()       # выполнить INSERT без commit
session.commit()      # зафиксировать транзакцию`}
        />

        <TypeCards>
          <TypeCard badge="add" title="Unit of Work">
            {"Session начинает отслеживать объект. Сам вызов не является обещанием долговременной записи."}
          </TypeCard>
          <TypeCard badge="flush" badgeTone="float" title="SQL внутри транзакции">
            {"INSERT отправлен, id может появиться, но rollback всё ещё способен отменить изменение."}
          </TypeCard>
          <TypeCard badge="commit" badgeTone="str" title="Фиксация">
            {"Транзакция завершается, изменение становится видимым как сохранённое состояние."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={<>После session.add(task) можно считать задачу гарантированно сохранённой на диске.</>}
          isTrue={false}
          explanation="add только регистрирует объект. Нужен успешный flush и commit."
        />

        <PredictOutput
          code={`task = TaskModel(title="SQL")
print(task.id)
session.add(task)
print(task.id)
session.flush()
print(task.id)`}
          output={`None
None
1`}
          hint="Типичный integer primary key назначается при INSERT во время flush."
        />
      </Section>
      <Section number="05" title="refresh получает состояние, которое определила база">
        <Lead>
          {"После INSERT база может назначить id, defaults или вычисляемые значения. refresh выполняет SELECT для конкретного объекта и обновляет его атрибуты текущим состоянием строки."}
        </Lead>

        <CodeBlock
          caption="создание и синхронизация"
          code={`with SessionFactory() as session:
    task = TaskModel(
        title="Проверить refresh",
        priority=4,
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    print(task.id)
    print(task.is_done)`}
        />

        <BranchExplorer
          code={`TaskModel(...)
  ↓
session.add
  ↓
INSERT during commit
  ↓
SQLite assigns id
  ↓
session.refresh
  ↓
Python object has database state`}
          scenarios={[
            { label: "до commit", activeLine: 1, output: "объект ожидает INSERT" },
            { label: "после commit", activeLine: 3, output: "строка зафиксирована" },
            { label: "после refresh", activeLine: 5, output: "id и defaults доступны объекту" },
          ]}
        />

        <TrueFalse
          statement={<>refresh создаёт вторую строку tasks.</>}
          isTrue={false}
          explanation="Refresh перечитывает уже связанную строку и обновляет атрибуты объекта."
        />

        <Callout tone="info">
          {"При expire_on_commit=True SQLAlchemy может перечитать истёкшие атрибуты автоматически при доступе. В учебной конфигурации refresh делает шаг явным."}
        </Callout>
      </Section>
      <Section number="06" title="Ошибка, rollback и восстановление Session">
        <Lead>
          {"Если flush или commit завершается ошибкой ограничения, транзакция считается неуспешной. Перед следующей операцией Session должна выполнить rollback, иначе она останется в failed state."}
        </Lead>

        <BugHunt
          code={`try:
    session.add(task)
    session.commit()
except Exception:
    print("Не удалось сохранить")

next_task = TaskModel(title="Следующая")
session.add(next_task)
session.commit()`}
          question="Какой обязательный шаг пропущен после ошибки commit?"
          options={[
            "session.rollback()",
            "create_engine()",
            "Base.metadata.clear()",
          ]}
          correctIndex={0}
          explanation="Rollback завершает неуспешную транзакцию и возвращает Session в рабочее состояние."
          fix={`try:
    session.add(task)
    session.commit()
except Exception:
    session.rollback()
    raise`}
        />

        <CodeSequence
          title="Соберите безопасную транзакционную обработку"
          prompt="Расположите действия вокруг операции записи."
          pieces={[
            { id: "try", code: "try:" },
            { id: "add", code: "    session.add(task)" },
            { id: "commit", code: "    session.commit()" },
            { id: "except", code: "except Exception:" },
            { id: "rollback", code: "    session.rollback()" },
            { id: "raise", code: "    raise" },
          ]}
          correctOrder={["try", "add", "commit", "except", "rollback", "raise"]}
          explanation="Ошибка не скрывается: состояние откатывается, затем исключение передаётся уровню, который знает способ ответа."
        />

        <Callout>
          {"На этом уроке используется общий Exception только для демонстрации жизненного цикла. В CRUD-блоке появится конкретный IntegrityError и корректный HTTP-ответ."}
        </Callout>
      </Section>
      <Section number="07" title="close и контекстный менеджер">
        <Lead>
          {"Session удерживает ресурсы и внутреннее состояние. close освобождает связанные соединения и отсоединяет рабочий контекст. Контекстный менеджер гарантирует завершение даже при исключении."}
        </Lead>

        <CompareSolutions
          question="Какой вариант надёжнее завершает Session?"
          left={{
            title: "Ручной close",
            code: "session = SessionFactory()\n# операции\nsession.close()",
            note: "При исключении до последней строки close можно пропустить.",
          }}
          right={{
            title: "Контекстный менеджер",
            code: "with SessionFactory() as session:\n    # операции",
            note: "Выход из блока закрывает Session автоматически.",
          }}
          preferred="right"
          explanation="Контекстный менеджер связывает владение ресурсом с видимым блоком кода."
        />

        <CodeBlock
          caption="scripts/create_task.py"
          code={`from app.database import SessionFactory
from app.models import TaskModel

with SessionFactory() as session:
    task = TaskModel(
        title="Первая задача из ORM",
        description=None,
        priority=4,
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    print(task.id, task.title)`}
        />

        <TerminalDemo
          title="создаём первую строку"
          lines={[
            { cmd: "python -m scripts.create_task" },
            { out: "INSERT INTO tasks ..." },
            { out: "COMMIT" },
            { out: "SELECT tasks.id, ..." },
            { out: "1 Первая задача из ORM" },
          ]}
        />

        <RecallCard
          question="Что закрывает with SessionFactory() as session?"
          answer={<p>{"Он завершает рабочий объект Session и возвращает занятые соединения инфраструктуре Engine. Commit при этом выполняется только явно."}</p>}
        />
      </Section>
      <Section number="08" title="Контрольная точка">
        <Lead>
          {"Соберите модель занятия целиком: назовите назначение механизма, проследите путь данных, объясните границу применения и только затем переходите к практической проверке."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Какова основная роль Session?"}
            options={[
              "управлять ORM Unit of Work",
              "хранить cookie пользователя",
              "создавать FastAPI app",
            ]}
            correctIndex={0}
            explanation={"Session отслеживает объекты и транзакцию базы."}
          />
          <QuizCard
            question={"Что делает add?"}
            options={[
              "регистрирует объект в Session",
              "немедленно завершает транзакцию",
              "закрывает соединение",
            ]}
            correctIndex={0}
            explanation={"Объект становится pending."}
          />
          <QuizCard
            question={"Зачем нужен refresh?"}
            options={[
              "перечитать состояние строки",
              "создать таблицу",
              "удалить объект",
            ]}
            correctIndex={0}
            explanation={"Refresh синхронизирует ORM-атрибуты с базой."}
          />
          <QuizCard
            question={"Что обязательно после failed commit?"}
            options={[
              "rollback",
              "новый Base",
              "CORS middleware",
            ]}
            correctIndex={0}
            explanation={"Rollback восстанавливает транзакционный контекст."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Session является рабочим ORM-контекстом, а не пользовательской сессией."}</>,
            <>{"sessionmaker создаёт независимые Session с общей конфигурацией."}</>,
            <>{"ORM-объект проходит transient, pending и persistent состояния."}</>,
            <>{"add, flush и commit являются разными шагами."}</>,
            <>{"refresh перечитывает значения, определённые базой."}</>,
            <>{"После ошибки транзакции требуется rollback."}</>,
            <>{"Контекстный менеджер надёжно закрывает Session."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Критерии готовности"}</h3>
          <ul>
            <li>{"различаете Engine, Connection и Session"}</li>
            <li>{"объясняете add, flush, commit и refresh"}</li>
            <li>{"выполняете rollback после неуспешной транзакции"}</li>
            <li>{"закрываете Session через контекстный менеджер"}</li>
          </ul>
        </div>

        <PracticeCta text={"Создайте задачу отдельным скриптом через SessionFactory. Перед add, после add, после flush и после refresh выводите task.id. Затем намеренно вызовите ошибку, выполните rollback и докажите, что следующая корректная запись проходит."} />
      </Section>
    </RichLesson>
  );
}

import { FileText, Wrench } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 16 · Связи, Alembic и Database API";

export function Lesson91({
  module,
}: {
  module?: string;
}) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Изменение схемы и downgrade"}
        intro={"Проведём второе изменение базы без переписывания истории: добавим description и created_at новой revision, разберём nullable и server_default, выполним upgrade/downgrade и отделим изменение схемы от преобразования данных."}
        tags={[
          { icon: <Wrench size={14} />, label: "upgrade и downgrade" },
          { icon: <FileText size={14} />, label: "новая колонка" }
        ]}
      />

      <TheoryBridge link={"Первая migration уже создаёт текущую схему. Теперь база содержит данные, а проект должен развиваться новым шагом поверх head."} boundary={"Применённую migration не редактируют как черновик. Иначе новые и уже обновлённые базы получают разные истории."} />

      <div className="lesson-route">
        <ol>
          <li>
            <strong>{"Шаг 1."}</strong>
            {"Изменить orm-модель."}
          </li>
          <li>
            <strong>{"Шаг 2."}</strong>
            {"Создать следующий revision."}
          </li>
          <li>
            <strong>{"Шаг 3."}</strong>
            {"Проверить данные и defaults."}
          </li>
          <li>
            <strong>{"Шаг 4."}</strong>
            {"Прогнать upgrade/downgrade."}
          </li>
        </ol>
        <p>
          {"Маршрут заканчивается проверяемым изменением StudyHub, а не изолированным примером."}
        </p>
      </div>

      <TypeCards>
        <TypeCard badge={"до"} title={"Состояние до урока"} code={`StudyHub Database API`}>
          {"первая migration применена"}
        </TypeCard>
        <TypeCard badge={"+"} badgeTone={"float"} title={"Что добавляем"} code={`Изменение схемы и downgrade`}>
          {"новый revision и downgrade"}
        </TypeCard>
        <TypeCard badge={"после"} badgeTone={"str"} title={"Состояние после"} code={`готовый проектный результат`}>
          {"эволюция схемы без переписывания"}
        </TypeCard>
      </TypeCards>

      <div className="lesson-practice-steps">
        <h3>{"Главная модель"}</h3>
        <p>{"Applied revision не переписывается; история растёт новым шагом."}</p>

        <h3>{"Граничный сценарий"}</h3>
        <p>{"Downgrade может уничтожить данные и требует совместимой версии приложения."}</p>

        <h3>{"Проектный результат"}</h3>
        <p>{"Вторая migration проходит цикл в обоих направлениях."}</p>
      </div>

      <Callout tone={"info"}>
  {"Граница урока: zero-downtime migrations отложены."}
</Callout>

      <Section number={"01"} title={"Новый revision вместо переписывания прошлого"}>
        <Lead>
  {"Если первая migration уже применена у команды, изменение её текста не выполнится повторно. Каждое новое изменение модели оформляется следующей revision."}
</Lead>

<CompareSolutions
          question={"Как добавить поле?"}
          left={{
            title: "Изменить старый файл",
            code: `# edit first_revision.py`,
            note: "У уже обновлённых баз код не запустится.",
          }}
          right={{
            title: "Создать новый revision",
            code: `alembic revision --autogenerate -m "add task details"`,
            note: "Все базы выполнят одинаковый следующий шаг.",
          }}
          preferred={"right"}
          explanation={"Applied revision считается опубликованной историей."}
        />

<MethodGrid
          rows={[
            [<>{"revision"}</>, "идентификатор текущего шага"],
            [<>{"down_revision"}</>, "предыдущий шаг цепочки"],
            [<>{"head"}</>, "последний доступный revision"],
            [<>{"alembic_version"}</>, "выполненный шаг конкретной базы"]
          ]}
        />

<TrueFalse
          statement={<>{"Изменение старой migration автоматически обновляет базы команды."}</>}
          isTrue={false}
          explanation={"Alembic видит revision как уже выполненный."}
        />

<Callout tone={"info"}>
  {"История растёт вперёд. Исправление прошлого оформляется новым явным шагом."}
</Callout>
      </Section>

      <Section number={"02"} title={"Nullable description для существующих строк"}>
        <Lead>
  {"Старые задачи не имеют description. Плавный первый шаг — nullable колонка: существующие строки получают NULL, а API постепенно начинает работать с новым полем."}
</Lead>

<CodeBlock
          caption={"изменение TaskModel"}
          code={`class TaskModel(Base):
            __tablename__ = "tasks"

            id: Mapped[int] = mapped_column(
                primary_key=True,
            )
            title: Mapped[str] = mapped_column(
                String(200),
            )
            description: Mapped[str | None] = mapped_column(
                String(1000),
                nullable=True,
            )`}
        />

<TerminalDemo
          title={"autogenerate"}
          lines={[
            { cmd: "alembic revision --autogenerate -m \"add task description\"" },
{ out: "Detected added column tasks.description" },
{ out: "Generating ..._add_task_description.py" }
          ]}
        />

<CodeBlock
          caption={"ожидаемый diff"}
          code={`def upgrade() -> None:
            op.add_column(
                "tasks",
                sa.Column(
                    "description",
                    sa.String(length=1000),
                    nullable=True,
                ),
            )


        def downgrade() -> None:
            op.drop_column(
                "tasks",
                "description",
            )`}
        />

<TrueFalse
          statement={<>{"nullable=True требует немедленно заполнить каждую старую строку."}</>}
          isTrue={false}
          explanation={"Существующие записи могут содержать NULL."}
        />

<Callout tone={"info"}>
  {"Nullable может быть переходным состоянием, если позже поле станет обязательным."}
</Callout>
      </Section>

      <Section number={"03"} title={"default и server_default"}>
        <Lead>
  {"default применяется ORM при создании Python-объекта. server_default хранится в схеме и выполняется самой базой. Старые строки не проходят через новый ORM-конструктор."}
</Lead>

<TypeCards>
          <TypeCard badge={"default"} title={"Python default"} code={`mapped_column(default="")`}>
            {"ORM подставляет значение до INSERT."}
          </TypeCard>
          <TypeCard badge={"server"} badgeTone={"float"} title={"Server default"} code={`server_default=text("CURRENT_TIMESTAMP")`}>
            {"СУБД вычисляет значение при INSERT."}
          </TypeCard>
          <TypeCard badge={"data"} badgeTone={"str"} title={"Существующие строки"} code={`UPDATE tasks SET ...`}>
            {"Требуют отдельного плана заполнения."}
          </TypeCard>
        </TypeCards>

<CodeBlock
          caption={"created_at на уровне базы"}
          code={`from datetime import datetime

        from sqlalchemy import DateTime, text

        created_at: Mapped[datetime] = mapped_column(
            DateTime(),
            nullable=False,
            server_default=text(
                "CURRENT_TIMESTAMP"
            ),
        )`}
        />

<RecallCard
          question={"Почему Python default не исправит старые строки?"}
          answer={<p>{"Они уже находятся в таблице и не создаются новым вызовом TaskModel."}</p>}
        />

<TrueFalse
          statement={<>{"Autogenerate знает, какое бизнес-значение записать в старые строки."}</>}
          isTrue={false}
          explanation={"Он видит структуру, но не предметное правило данных."}
        />

<Callout tone={"info"}>
  {"Server default выбирают осознанно и проверяют на конкретной СУБД."}
</Callout>
      </Section>

      <Section number={"04"} title={"Upgrade и downgrade как цикл"}>
        <Lead>
  {"Downgrade описывает обратный структурный шаг, но может уничтожить данные. Перед запуском нужно понимать, какие колонки или таблицы будут удалены."}
</Lead>

<TerminalDemo
          title={"проверка обоих направлений"}
          lines={[
            { cmd: "alembic upgrade head" },
{ out: "Running upgrade a1b2c3 -> d4e5f6" },
{ cmd: "alembic current" },
{ out: "d4e5f6 (head)" },
{ cmd: "alembic downgrade -1" },
{ out: "Running downgrade d4e5f6 -> a1b2c3" },
{ cmd: "alembic upgrade head" },
{ out: "Running upgrade a1b2c3 -> d4e5f6" }
          ]}
        />

<CompareSolutions
          question={"Как откатывать безопаснее?"}
          left={{
            title: "Слепо",
            code: `alembic downgrade -1`,
            note: "Неясно, какие данные исчезнут.",
          }}
          right={{
            title: "Осознанно",
            code: `прочитать downgrade → backup → выполнить`,
            note: "Известна цена обратной операции.",
          }}
          preferred={"right"}
          explanation={"В production иногда безопаснее новая исправляющая migration."}
        />

<PredictOutput
          code={`columns_before = 5
        columns_after_downgrade = 4
        print(columns_before - columns_after_downgrade)`}
          output={`1`}
          hint={"Downgrade удалил одну новую колонку."}
        />

<Callout tone={"info"}>
  {"Откат базы должен соответствовать версии приложения, иначе код продолжит ожидать удалённое поле."}
</Callout>
      </Section>

      <Section number={"05"} title={"Schema migration и data migration"}>
        <Lead>
  {"Добавить колонку — изменение схемы. Заполнить её для существующих задач — изменение данных. Эти операции могут находиться в одном файле, но требуют разных решений."}
</Lead>

<CodeBlock
          caption={"двухшаговое обязательное поле"}
          code={`def upgrade() -> None:
            op.add_column(
                "tasks",
                sa.Column(
                    "description",
                    sa.String(1000),
                    nullable=True,
                ),
            )

            op.execute(
                "UPDATE tasks "
                "SET description = '' "
                "WHERE description IS NULL"
            )

            op.alter_column(
                "tasks",
                "description",
                nullable=False,
            )`}
        />

<MethodGrid
          rows={[
            [<>{"op.add_column"}</>, "изменяет структуру"],
            [<>{"op.execute UPDATE"}</>, "преобразует существующие строки"],
            [<>{"op.alter_column"}</>, "усиливает ограничение после заполнения"],
            [<>{"downgrade"}</>, "называет цену обратимости"]
          ]}
        />

<TrueFalse
          statement={<>{"Autogenerate сам напишет UPDATE по бизнес-правилу."}</>}
          isTrue={false}
          explanation={"Преобразование данных проектирует разработчик."}
        />

<Callout tone={"info"}>
  {"Для обязательной практики достаточно nullable description; сложный пример показывает общий безопасный паттерн."}
</Callout>
      </Section>

      <Section number={"06"} title={"SQLite и реальное выполнение migration"}>
        <Lead>
  {"Поддержка ALTER TABLE зависит от версии SQLite. Alembic может использовать batch mode, поэтому migration нужно запускать на той же среде, а не только читать."}
</Lead>

<CodeBlock
          caption={"batch mode при необходимости"}
          code={`def upgrade() -> None:
            with op.batch_alter_table(
                "tasks"
            ) as batch_op:
                batch_op.add_column(
                    sa.Column(
                        "description",
                        sa.String(1000),
                        nullable=True,
                    )
                )


        def downgrade() -> None:
            with op.batch_alter_table(
                "tasks"
            ) as batch_op:
                batch_op.drop_column(
                    "description"
                )`}
        />

<CompareSolutions
          question={"Как проверить migration?"}
          left={{
            title: "Только review",
            code: `# файл выглядит правильно`,
            note: "Не подтверждает выполнение DDL.",
          }}
          right={{
            title: "Тестовая база",
            code: `upgrade → tests → downgrade → upgrade`,
            note: "Проверяет реальное поведение.",
          }}
          preferred={"right"}
          explanation={"Migration является исполняемым кодом и требует запуска."}
        />

<TerminalDemo
          title={"проверка схемы"}
          lines={[
            { cmd: "sqlite3 studyhub.db \".schema tasks\"" },
{ out: "CREATE TABLE tasks (... description VARCHAR(1000) ...);" },
{ cmd: "alembic current" },
{ out: "d4e5f6 (head)" }
          ]}
        />

<Callout tone={"info"}>
  {"Batch mode — инструмент совместимости, а не обязательная обёртка каждой операции."}
</Callout>
      </Section>

      <Section number={"07"} title={"Ошибки истории и порядок проверки"}>
        <Lead>
  {"Опасные ошибки: переписать applied revision, добавить NOT NULL без значения старым строкам или считать downgrade безрисковым."}
</Lead>

<BugHunt
          code={`# Первая migration применена у команды.
        # Разработчик добавил description прямо в неё.`}
          question={"Почему колонка не появится у коллег?"}
          options={["Первая revision уже записана как выполненная", "SQLite запрещает description", "Нужен relationship"]}
          correctIndex={0}
          explanation={"Alembic не запускает старый upgrade повторно."}
          fix={`# Создать следующий revision:
        # alembic revision --autogenerate #   -m "add description"`}
        />

<CodeSequence
          title={"Соберите проверку"}
          prompt={"Расположите шаги второй migration."}
          pieces={[
            { id: "model", code: `изменить TaskModel` },
{ id: "revision", code: `создать новый revision` },
{ id: "review", code: `проверить upgrade и downgrade` },
{ id: "copy", code: `использовать тестовую базу` },
{ id: "upgrade", code: `upgrade head` },
{ id: "tests", code: `запустить тесты` },
{ id: "cycle", code: `downgrade -1 и снова upgrade` },
{ id: "old", code: `переписать первую migration`, note: "история разойдётся" }
          ]}
          correctOrder={["model", "revision", "review", "copy", "upgrade", "tests", "cycle"]}
          explanation={"Новый шаг проверяется на изолированной базе в обоих направлениях."}
        />

<RecallCard
          question={"Какие риски назвать перед downgrade?"}
          answer={<p>{"Потеря данных удаляемых колонок, несовместимость версии приложения и неполная обратимость data migration."}</p>}
        />

<Callout tone={"info"}>
  {"Schema и приложение выпускаются согласованно; один только откат базы не гарантирует рабочую систему."}
</Callout>
      </Section>

      <Section number={"08"} title={"Контрольная точка и практика"}>
        <Lead>
  {"Соберите модель урока в один маршрут, ответьте на четыре вопроса и выполните проектное задание без добавления будущих тем."}
</Lead>

<div className="lesson-practice-steps">
          <h3>{"Техническая готовность"}</h3>
          <p>{"Код запускается, основной сценарий работает, а ошибки имеют понятный контракт."}</p>

          <h3>{"Диагностическая готовность"}</h3>
          <p>{"Ученик может показать запрос, состояние Session или revision, от которого зависит результат."}</p>

          <h3>{"Объяснение"}</h3>
          <p>{"Главная модель урока объясняется своими словами без чтения готового определения."}</p>
        </div>

<div className="lesson-check-group">
          <QuizCard
            question={"Что делать после изменения модели?"}
            options={["создать новую revision", "переписать старую", "удалить alembic_version"]}
            correctIndex={0}
            explanation={"История растёт новыми шагами."}
          />

          <QuizCard
            question={"Чем server_default отличается?"}
            options={["работает в базе", "создаёт relationship", "отключает nullable"]}
            correctIndex={0}
            explanation={"Значение подставляет СУБД."}
          />

          <QuizCard
            question={"Что теряется при drop_column?"}
            options={["данные колонки", "Python-файл", "HTTP method"]}
            correctIndex={0}
            explanation={"DDL удаляет значения."}
          />

          <QuizCard
            question={"Понимает ли autogenerate data migration?"}
            options={["нет", "да всегда", "только SQLite"]}
            correctIndex={0}
            explanation={"Предметное преобразование пишется вручную."}
          />
        </div>

<KeyTakeaways
          points={[
            <>{"Applied migrations не переписывают."}</>,
            <>{"Каждое изменение получает новый revision."}</>,
            <>{"Nullable упрощает добавление поля."}</>,
            <>{"default и server_default работают на разных уровнях."}</>,
            <>{"Schema и data migration решают разные задачи."}</>,
            <>{"Downgrade может уничтожить данные."}</>,
            <>{"Migration проверяют на тестовой базе в обоих направлениях."}</>
          ]}
        />

<PracticeCta text={"Добавьте description и created_at новой migration. Выполните upgrade, downgrade -1 и повторный upgrade; зафиксируйте риски отката в README."} />
      </Section>
    </RichLesson>
  );
}

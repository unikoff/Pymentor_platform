import { FolderGit2, Save } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 16 · Связи, Alembic и Database API";

export function Lesson90({
  module,
}: {
  module?: string;
}) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Alembic: первая миграция"}
        intro={"Переведём схему базы из скрытого create_all в управляемую историю: инициализируем Alembic, подключим metadata, создадим первую revision и проверим upgrade."}
        tags={[
          { icon: <FolderGit2 size={14} />, label: "история схемы" },
          { icon: <Save size={14} />, label: "revision и upgrade" }
        ]}
      />

      <TheoryBridge link={"ORM-модели уже описывают tasks и categories. Alembic должен превратить текущую схему в воспроизводимую последовательность изменений."} boundary={"Autogenerate предлагает структурный diff, но не понимает намерение проекта. Каждый migration-файл читают до применения."} />

      <div className="lesson-route">
        <ol>
          <li>
            <strong>{"Шаг 1."}</strong>
            {"Инициализировать alembic."}
          </li>
          <li>
            <strong>{"Шаг 2."}</strong>
            {"Подключить base.metadata."}
          </li>
          <li>
            <strong>{"Шаг 3."}</strong>
            {"Проверить autogenerate."}
          </li>
          <li>
            <strong>{"Шаг 4."}</strong>
            {"Применить upgrade head."}
          </li>
        </ol>
        <p>
          {"Маршрут заканчивается проверяемым изменением StudyHub, а не изолированным примером."}
        </p>
      </div>

      <TypeCards>
        <TypeCard badge={"до"} title={"Состояние до урока"} code={`StudyHub Database API`}>
          {"ORM-схема существует"}
        </TypeCard>
        <TypeCard badge={"+"} badgeTone={"float"} title={"Что добавляем"} code={`Alembic: первая миграция`}>
          {"первая история Alembic"}
        </TypeCard>
        <TypeCard badge={"после"} badgeTone={"str"} title={"Состояние после"} code={`готовый проектный результат`}>
          {"чистая база через upgrade head"}
        </TypeCard>
      </TypeCards>

      <div className="lesson-practice-steps">
        <h3>{"Главная модель"}</h3>
        <p>{"Migration — версионируемый шаг изменения схемы."}</p>

        <h3>{"Граничный сценарий"}</h3>
        <p>{"Пустой autogenerate требует проверки metadata, а не ручного угадывания."}</p>

        <h3>{"Проектный результат"}</h3>
        <p>{"Чистая база создаётся через upgrade head."}</p>
      </div>

      <Callout tone={"info"}>
  {"Граница урока: сложные ветки revisions отложены."}
</Callout>

      <Section number={"01"} title={"Почему create_all недостаточно"}>
        <Lead>
  {"create_all создаёт отсутствующие таблицы, но не хранит историю и не объясняет, как обновить существующую базу. Команде нужен одинаковый путь от пустой схемы к текущей."}
</Lead>

<CompareSolutions
          question={"Какой процесс воспроизводим?"}
          left={{
            title: "create_all",
            code: `Base.metadata.create_all(engine)`,
            note: "Создаёт недостающее, но не версионирует изменения.",
          }}
          right={{
            title: "Alembic",
            code: `alembic upgrade head`,
            note: "Применяет последовательность revisions.",
          }}
          preferred={"right"}
          explanation={"Migration-файлы находятся в Git и одинаково выполняются в разных средах."}
        />

<MethodGrid
          rows={[
            [<>{"revision"}</>, "один шаг изменения схемы"],
            [<>{"upgrade"}</>, "движение вперёд"],
            [<>{"downgrade"}</>, "обратный структурный шаг"],
            [<>{"head"}</>, "последняя migration"],
            [<>{"alembic_version"}</>, "текущий revision базы"]
          ]}
        />

<Callout tone={"info"}>
  {"Миграция является кодом проекта и коммитится вместе с моделью, которая ожидает новую схему."}
</Callout>
      </Section>

      <Section number={"02"} title={"Инициализация и структура Alembic"}>
        <Lead>
  {"alembic init создаёт конфигурацию, env.py и каталог versions. Важно понимать роли файлов, а не заучивать шаблон."}
</Lead>

<TerminalDemo
          title={"создание каркаса"}
          lines={[
            { cmd: "alembic init migrations" },
{ out: "Creating directory migrations" },
{ out: "Creating directory migrations/versions" },
{ out: "Generating alembic.ini" },
{ out: "Generating migrations/env.py" }
          ]}
        />

<TypeCards>
          <TypeCard badge={"ini"} title={"alembic.ini"} code={`script_location = migrations`}>
            {"Общая конфигурация и script_location."}
          </TypeCard>
          <TypeCard badge={"env"} badgeTone={"float"} title={"migrations/env.py"} code={`target_metadata = Base.metadata`}>
            {"Подключает URL и metadata."}
          </TypeCard>
          <TypeCard badge={"versions"} badgeTone={"str"} title={"versions/"} code={`a1b2_create_tables.py`}>
            {"Хранит цепочку revision-файлов."}
          </TypeCard>
        </TypeCards>

<RecallCard
          question={"Что хранит таблица alembic_version?"}
          answer={<p>{"Идентификатор migration, до которой обновлена конкретная база."}</p>}
        />

<Callout tone={"info"}>
  {"Название каталога может отличаться, но должно совпадать с script_location."}
</Callout>
      </Section>

      <Section number={"03"} title={"target_metadata и импорт моделей"}>
        <Lead>
  {"Autogenerate сравнивает базу с Base.metadata. Таблицы появляются в metadata только после импорта соответствующих ORM-моделей."}
</Lead>

<CodeBlock
          caption={"migrations/env.py"}
          code={`from app.config import settings
        from app.database import Base
        from app.models.category import CategoryModel
        from app.models.task import TaskModel

        config.set_main_option(
            "sqlalchemy.url",
            settings.database_url,
        )

        target_metadata = Base.metadata`}
        />

<BugHunt
          code={`from app.database import Base

        target_metadata = Base.metadata
        # модели не импортированы`}
          question={"Почему revision может оказаться пустой?"}
          options={["metadata не знает о таблицах", "SQLite не поддерживает Alembic", "Нужен session.commit"]}
          correctIndex={0}
          explanation={"ORM-классы регистрируют таблицы при импорте."}
          fix={`from app.database import Base
        from app.models.category import CategoryModel
        from app.models.task import TaskModel

        target_metadata = Base.metadata`}
        />

<TrueFalse
          statement={<>{"Импорт модели в env.py создаёт строки таблицы."}</>}
          isTrue={false}
          explanation={"Он только регистрирует Table в metadata."}
        />

<Callout tone={"info"}>
  {"Пустая migration — сигнал проверить импорты, target_metadata и URL сравниваемой базы."}
</Callout>
      </Section>

      <Section number={"04"} title={"revision --autogenerate и проверка"}>
        <Lead>
  {"Команда создаёт кандидата migration. До upgrade проверяются имена таблиц, типы, nullable, unique, ForeignKey и порядок downgrade."}
</Lead>

<TerminalDemo
          title={"создание первой revision"}
          lines={[
            { cmd: "alembic revision --autogenerate -m \"create tasks and categories\"" },
{ out: "Detected added table categories" },
{ out: "Detected added table tasks" },
{ out: "Generating ..._create_tasks_and_categories.py" }
          ]}
        />

<CodeBlock
          caption={"основные операции"}
          code={`def upgrade() -> None:
            op.create_table(
                "categories",
                sa.Column("id", sa.Integer(), nullable=False),
                sa.Column("name", sa.String(80), nullable=False),
                sa.PrimaryKeyConstraint("id"),
                sa.UniqueConstraint("name"),
            )
            op.create_table(
                "tasks",
                sa.Column("id", sa.Integer(), nullable=False),
                sa.Column("title", sa.String(200), nullable=False),
                sa.Column("category_id", sa.Integer(), nullable=True),
                sa.ForeignKeyConstraint(
                    ["category_id"],
                    ["categories.id"],
                ),
                sa.PrimaryKeyConstraint("id"),
            )


        def downgrade() -> None:
            op.drop_table("tasks")
            op.drop_table("categories")`}
        />

<RecallCard
          question={"Почему tasks удаляется раньше categories?"}
          answer={<p>{"Дочерняя таблица зависит от родителя через ForeignKey."}</p>}
        />

<TrueFalse
          statement={<>{"Сгенерированный файл можно применять не читая."}</>}
          isTrue={false}
          explanation={"Autogenerate не знает бизнес-смысл и может неверно трактовать переименование."}
        />

<Callout tone={"info"}>
  {"Review migration-файла является обязательным шагом workflow."}
</Callout>
      </Section>

      <Section number={"05"} title={"upgrade head, current и history"}>
        <Lead>
  {"После проверки migration применяется. Alembic создаёт таблицы и записывает revision в alembic_version."}
</Lead>

<TerminalDemo
          title={"применение и диагностика"}
          lines={[
            { cmd: "alembic upgrade head" },
{ out: "Running upgrade -> a1b2c3, create tasks and categories" },
{ cmd: "alembic current" },
{ out: "a1b2c3 (head)" },
{ cmd: "alembic history" },
{ out: "<base> -> a1b2c3 (head)" }
          ]}
        />

<CodeBlock
          caption={"startup без create_all"}
          code={`from fastapi import FastAPI

        from app.routers import categories, tasks

        app = FastAPI(
            title="StudyHub Database API",
        )
        app.include_router(tasks.router)
        app.include_router(categories.router)`}
        />

<TrueFalse
          statement={<>{"Приложение должно молча создавать таблицы при каждом startup."}</>}
          isTrue={false}
          explanation={"Подготовка схемы выполняется отдельной явной командой Alembic."}
        />

<Callout tone={"info"}>
  {"Ошибка отсутствующей таблицы полезна: она показывает, что upgrade head не был выполнен."}
</Callout>
      </Section>

      <Section number={"06"} title={"Одна история для разных баз"}>
        <Lead>
  {"Локальная, тестовая и будущая серверная база используют одну цепочку revisions. Меняется DATABASE_URL, но не история."}
</Lead>

<TypeCards>
          <TypeCard badge={"dev"} title={"Локальная"} code={`sqlite:///./studyhub.db`}>
            {"Файловая SQLite-база разработчика."}
          </TypeCard>
          <TypeCard badge={"test"} badgeTone={"float"} title={"Тестовая"} code={`sqlite:///./test_migrations.db`}>
            {"Изолированная база для проверки migrations."}
          </TypeCard>
          <TypeCard badge={"future"} badgeTone={"str"} title={"Будущая"} code={`DATABASE_URL из окружения`}>
            {"Та же история с другим драйвером."}
          </TypeCard>
        </TypeCards>

<CompareSolutions
          question={"Как проверить чистую схему?"}
          left={{
            title: "Только create_all",
            code: `Base.metadata.create_all(test_engine)`,
            note: "Может скрыть ошибку migration.",
          }}
          right={{
            title: "upgrade head",
            code: `alembic upgrade head`,
            note: "Проверяет реальный путь схемы.",
          }}
          preferred={"right"}
          explanation={"Быстрые API-тесты могут использовать create_all, но отдельный migration-test обязан прогнать Alembic."}
        />

<RecallCard
          question={"Почему файл studyhub.db не заменяет migrations?"}
          answer={<p>{"Он содержит состояние одной машины, а revisions описывают воспроизводимый путь для любой чистой базы."}</p>}
        />

<Callout tone={"info"}>
  {"В Git хранятся models, migrations и инструкции, а не рабочая база как источник истины."}
</Callout>
      </Section>

      <Section number={"07"} title={"Безопасный workflow Alembic"}>
        <Lead>
  {"Сначала проверяются модели и metadata, затем создаётся revision, файл читается, применяется и подтверждается current."}
</Lead>

<CodeSequence
          title={"Соберите workflow"}
          prompt={"Расположите шаги первой migration."}
          pieces={[
            { id: "models", code: `проверить модели и импорты` },
{ id: "revision", code: `alembic revision --autogenerate -m "..."` },
{ id: "review", code: `прочитать upgrade и downgrade` },
{ id: "upgrade", code: `alembic upgrade head` },
{ id: "current", code: `alembic current` },
{ id: "tests", code: `запустить API и тесты` },
{ id: "blind", code: `сразу применить неоткрытый файл`, note: "нет review" }
          ]}
          correctOrder={["models", "revision", "review", "upgrade", "current", "tests"]}
          explanation={"Migration сначала проверяется как обычный код."}
        />

<BugHunt
          code={`def upgrade():
            pass

        def downgrade():
            pass`}
          question={"Что проверить при пустой первой migration?"}
          options={["target_metadata и импорты моделей", "response_model", "HTTP headers"]}
          correctIndex={0}
          explanation={"Autogenerate не увидел ожидаемые Table."}
          fix={`from app.database import Base
        from app.models import CategoryModel, TaskModel

        target_metadata = Base.metadata`}
        />

<RecallCard
          question={"Что проверить в create_table?"}
          answer={<p>{"Имена, типы, nullable, primary key, unique, ForeignKey и обратный порядок удаления."}</p>}
        />

<Callout tone={"info"}>
  {"Не заполняйте пустую migration вручную, пока не найдена причина пустой metadata."}
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
            question={"Зачем target_metadata?"}
            options={["сравнить ORM-схему с базой", "хранить headers", "commit Session"]}
            correctIndex={0}
            explanation={"Autogenerate строит diff по metadata."}
          />

          <QuizCard
            question={"Что создаёт --autogenerate?"}
            options={["кандидат migration", "гарантированно правильный файл", "сервер"]}
            correctIndex={0}
            explanation={"Файл требует review."}
          />

          <QuizCard
            question={"Что показывает current?"}
            options={["revision базы", "все модели", "endpoint"]}
            correctIndex={0}
            explanation={"Команда читает alembic_version."}
          />

          <QuizCard
            question={"Почему create_all не заменяет Alembic?"}
            options={["нет истории изменений", "не создаёт таблицы", "только PostgreSQL"]}
            correctIndex={0}
            explanation={"Он не описывает последовательные преобразования."}
          />
        </div>

<KeyTakeaways
          points={[
            <>{"Migration — версионируемый код схемы."}</>,
            <>{"Alembic хранит revisions и текущую версию базы."}</>,
            <>{"Autogenerate зависит от metadata и импортов."}</>,
            <>{"Сгенерированный файл всегда проверяется."}</>,
            <>{"upgrade двигает схему вперёд."}</>,
            <>{"create_all не является историей."}</>,
            <>{"Чистая база воспроизводится через upgrade head."}</>
          ]}
        />

<PracticeCta text={"Инициализируйте Alembic, создайте первую migration tasks/categories, удалите локальную БД и подтвердите upgrade head, current и history."} />
      </Section>
    </RichLesson>
  );
}

import {
  Boxes,
  Braces,
  FileText,
  FolderGit2,
  GitFork,
  Layers,
  Link2,
  Save,
  Search,
  ShieldCheck,
  Trophy,
  Wrench
} from "lucide-react";
import {
  BugHunt,
  Callout,
  CodeBlock,
  CodeSequence,
  CompareSolutions,
  KeyTakeaways,
  Lead,
  MethodGrid,
  PracticeCta,
  PredictOutput,
  QuizCard,
  RecallCard,
  RichHero,
  RichLesson,
  Section,
  TerminalDemo,
  TrueFalse,
  TypeCard,
  TypeCards
} from "../shared";

type TheoryBridgeData = {
  link: string;
  boundary: string;
};

const BLOCK_TITLE =
  "Блок 16 · Связи, Alembic и Database API";

const THEORY_BRIDGES: Record<
  number,
  TheoryBridgeData
> = {
  87: {
    link: "CRUD задач и категорий уже работает через Session. Теперь база должна хранить проверяемую связь между строками, а не повторяющийся текст категории.",
    boundary: "Foreign key хранит идентификатор и защищает ссылку. Он не загружает объект Category и не заменяет relationship.",
  },
  88: {
    link: "ForeignKey уже хранит category_id и защищает ссылку. Теперь та же связь должна стать удобной для Python-кода и API-ответа.",
    boundary: "relationship не создаёт колонку и не заменяет ForeignKey. Он описывает навигацию ORM-объектов и стратегию их загрузки.",
  },
  89: {
    link: "relationship уже даёт task.category. Теперь нужно понять, что удобный атрибут может выполнить дополнительный SQL-запрос.",
    boundary: "N+1 — конкретный шаблон: один запрос списка плюс дополнительные запросы связанных данных, а не название любого медленного endpoint.",
  },
  90: {
    link: "ORM-модели уже описывают tasks и categories. Alembic должен превратить текущую схему в воспроизводимую последовательность изменений.",
    boundary: "Autogenerate предлагает структурный diff, но не понимает намерение проекта. Каждый migration-файл читают до применения.",
  },
  91: {
    link: "Первая migration уже создаёт текущую схему. Теперь база содержит данные, а проект должен развиваться новым шагом поверх head.",
    boundary: "Применённую migration не редактируют как черновик. Иначе новые и уже обновлённые базы получают разные истории.",
  },
  92: {
    link: "Предыдущие блоки дали отдельные механизмы FastAPI, SQLAlchemy и Alembic. Теперь они должны образовать один объяснимый путь запроса.",
    boundary: "Финальный проект не добавляет пользователей, JWT или async. Эти темы относятся к следующему этапу.",
  }
};

function TheoryBridge({
  lesson,
}: {
  lesson: number;
}) {
  const bridge = THEORY_BRIDGES[lesson];

  if (!bridge) {
    return null;
  }

  return (
    <Callout tone="info">
      <strong>Связь с курсом.</strong>
      {" "}
      {bridge.link}
      {" "}
      <strong>Важно не перепутать:</strong>
      {" "}
      {bridge.boundary}
    </Callout>
  );
}

// 87. Foreign key и one-to-many
export function Lesson87({
  module,
}: {
  module?: string;
}) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Foreign key и one-to-many"}
        intro={"Свяжем категории и задачи в реляционной модели: добавим category_id, разберём one-to-many, допустим задачу без категории и заранее выберем поведение при удалении родителя."}
        tags={[
          { icon: <Boxes size={14} />, label: "две связанные таблицы" },
          { icon: <GitFork size={14} />, label: "one-to-many" }
        ]}
      />

      <TheoryBridge lesson={87} />

      <div className="lesson-route">
        <ol>
          <li>
            <strong>{"Шаг 1."}</strong>
            {"Выделить родителя и ребёнка."}
          </li>
          <li>
            <strong>{"Шаг 2."}</strong>
            {"Добавить nullable category_id."}
          </li>
          <li>
            <strong>{"Шаг 3."}</strong>
            {"Проверить существование родителя."}
          </li>
          <li>
            <strong>{"Шаг 4."}</strong>
            {"Зафиксировать политику удаления."}
          </li>
        </ol>
        <p>
          {"Маршрут заканчивается проверяемым изменением StudyHub, а не изолированным примером."}
        </p>
      </div>

      <TypeCards>
        <TypeCard badge={"до"} title={"Состояние до урока"} code={`StudyHub Database API`}>
          {"CRUD отдельных таблиц"}
        </TypeCard>
        <TypeCard badge={"+"} badgeTone={"float"} title={"Что добавляем"} code={`Foreign key и one-to-many`}>
          {"ForeignKey и one-to-many"}
        </TypeCard>
        <TypeCard badge={"после"} badgeTone={"str"} title={"Состояние после"} code={`готовый проектный результат`}>
          {"проверяемая связь Category → Task"}
        </TypeCard>
      </TypeCards>

      <div className="lesson-practice-steps">
        <h3>{"Главная модель"}</h3>
        <p>{"Родительская строка имеет primary key, дочерняя хранит foreign key."}</p>

        <h3>{"Граничный сценарий"}</h3>
        <p>{"None допустим, неизвестный integer превращается в 404."}</p>

        <h3>{"Проектный результат"}</h3>
        <p>{"Категории и задачи сохраняются с выбранной политикой удаления."}</p>
      </div>

      <Callout tone={"info"}>
  {"Граница урока: relationship откладывается до урока 88."}
</Callout>

      <Section number={"01"} title={"Почему одной таблицы стало мало"}>
        <Lead>
  {"Если хранить название категории внутри каждой задачи, переименование Python в Python Core придётся повторить во многих строках. Отдельная таблица categories создаёт единый источник истины, а tasks хранит только ссылку."}
</Lead>

<TypeCards>
          <TypeCard badge={"parent"} title={"Категория"} code={`categories: id, name`}>
            {"Одна родительская запись может объединять много задач."}
          </TypeCard>
          <TypeCard badge={"child"} badgeTone={"float"} title={"Задача"} code={`tasks: id, title, category_id`}>
            {"Каждая задача относится максимум к одной категории."}
          </TypeCard>
          <TypeCard badge={"FK"} badgeTone={"str"} title={"Проверяемая ссылка"} code={`ForeignKey("categories.id")`}>
            {"База отклоняет ссылку на несуществующий categories.id."}
          </TypeCard>
        </TypeCards>

<MethodGrid
          rows={[
            [<>{"categories.id"}</>, "primary key родительской строки"],
            [<>{"tasks.category_id"}</>, "foreign key дочерней строки"],
            [<>{"one"}</>, "одна категория"],
            [<>{"many"}</>, "несколько связанных задач"],
            [<>{"nullable"}</>, "задача может временно не иметь категории"]
          ]}
        />

<Callout tone={"info"}>
  {"Связь строится по стабильным id. Название категории остаётся обычным изменяемым полем родителя."}
</Callout>
      </Section>

      <Section number={"02"} title={"Модель one-to-many до кода"}>
        <Lead>
  {"One-to-many читается от родителя к детям: одна Category связана со многими Task. В обратную сторону конкретная Task знает максимум одну Category."}
</Lead>

<CodeBlock
          caption={"схема таблиц"}
          code={`categories
        ┌────┬────────┐
        │ id │ name   │
        ├────┼────────┤
        │ 1  │ Python │
        └────┴────────┘
               ▲
               │ tasks.category_id
               │
        tasks
        ┌────┬──────────────┬─────────────┐
        │ id │ title        │ category_id │
        ├────┼──────────────┼─────────────┤
        │ 7  │ SQLAlchemy   │ 1           │
        └────┴──────────────┴─────────────┘`}
        />

<TrueFalse
          statement={<>{"Один integer category_id может хранить сразу несколько категорий."}</>}
          isTrue={false}
          explanation={"Одна колонка хранит одно значение. Many-to-many потребует отдельной таблицы связи и изучается позже."}
        />

<RecallCard
          question={"Почему связь не строят по category.name?"}
          answer={<p>{"Название можно переименовать, оно длиннее и может повторяться. Первичный ключ предназначен для стабильной идентификации строки."}</p>}
        />

<Callout tone={"info"}>
  {"One и many описывают количество связанных строк, а не общий размер таблиц."}
</Callout>
      </Section>

      <Section number={"03"} title={"ORM-модели и ForeignKey"}>
        <Lead>
  {"Сначала описываем только структуру хранения. CategoryModel получает primary key, TaskModel — nullable category_id с ForeignKey. Навигация по объектам появится в следующем уроке."}
</Lead>

<CodeBlock
          caption={"models/category.py и models/task.py"}
          code={`from sqlalchemy import ForeignKey, String
        from sqlalchemy.orm import Mapped, mapped_column

        from app.database import Base


        class CategoryModel(Base):
            __tablename__ = "categories"

            id: Mapped[int] = mapped_column(primary_key=True)
            name: Mapped[str] = mapped_column(
                String(80),
                unique=True,
                nullable=False,
            )


        class TaskModel(Base):
            __tablename__ = "tasks"

            id: Mapped[int] = mapped_column(primary_key=True)
            title: Mapped[str] = mapped_column(String(200))
            category_id: Mapped[int | None] = mapped_column(
                ForeignKey("categories.id"),
                nullable=True,
            )`}
        />

<PredictOutput
          code={`category = CategoryModel(id=4, name="SQL")
        task = TaskModel(title="Foreign key", category_id=category.id)
        print(task.category_id)`}
          output={`4`}
          hint={"TaskModel хранит числовой id родителя, а не весь объект."}
        />

<TrueFalse
          statement={<>{"Строка ForeignKey(\"categories.id\") использует имя класса CategoryModel."}</>}
          isTrue={false}
          explanation={"Она использует имя таблицы из __tablename__ и имя колонки базы."}
        />

<Callout tone={"info"}>
  {"Тип int | None и nullable=True должны обещать одно и то же: категория необязательна."}
</Callout>
      </Section>

      <Section number={"04"} title={"Проверка родителя до INSERT"}>
        <Lead>
  {"Nullable разрешает None, но не разрешает произвольный integer. Если клиент передал category_id, прикладной код проверяет существование категории и возвращает понятный 404 до commit."}
</Lead>

<CompareSolutions
          question={"Какой вариант формирует ясный контракт?"}
          left={{
            title: "Слепое создание",
            code: `task = TaskModel(**data.model_dump())`,
            note: "Неизвестный category_id доберётся до ограничения базы.",
          }}
          right={{
            title: "Явная проверка",
            code: `if data.category_id is not None:
            category = session.get(CategoryModel, data.category_id)
            if category is None:
                raise HTTPException(404, "Category not found")`,
            note: "Клиент получает понятный ожидаемый ответ.",
          }}
          preferred={"right"}
          explanation={"ForeignKey остаётся последней гарантией целостности, но endpoint заранее сообщает смысл ошибки."}
        />

<CodeBlock
          caption={"вспомогательная функция"}
          code={`def ensure_category_exists(
            session: Session,
            category_id: int | None,
        ) -> None:
            if category_id is None:
                return

            if session.get(CategoryModel, category_id) is None:
                raise HTTPException(
                    status_code=404,
                    detail="Category not found",
                )`}
        />

<RecallCard
          question={"Чем None отличается от category_id=999?"}
          answer={<p>{"None означает согласованное отсутствие категории. Число 999 обещает ссылку на конкретную категорию, поэтому оно должно быть проверено."}</p>}
        />

<Callout tone={"info"}>
  {"Ошибка отсутствующего родителя является обычным пользовательским сценарием, а не внутренней аварией сервера."}
</Callout>
      </Section>

      <Section number={"05"} title={"Политика удаления родителя"}>
        <Lead>
  {"Удаление категории затрагивает связанные задачи. Нужно заранее выбрать предметный контракт: запретить удаление, отвязать задачи или удалить их вместе с категорией."}
</Lead>

<TypeCards>
          <TypeCard badge={"RESTRICT"} title={"Запретить"} code={`409 Category is in use`}>
            {"Категория не удаляется, пока используется задачами."}
          </TypeCard>
          <TypeCard badge={"SET NULL"} badgeTone={"float"} title={"Сохранить задачи"} code={`ondelete="SET NULL"`}>
            {"category_id становится None, учебная задача остаётся."}
          </TypeCard>
          <TypeCard badge={"CASCADE"} badgeTone={"str"} title={"Удалить всё"} code={`ondelete="CASCADE"`}>
            {"Удаление категории уничтожает дочерние задачи."}
          </TypeCard>
        </TypeCards>

<CompareSolutions
          question={"Что подходит StudyHub?"}
          left={{
            title: "CASCADE",
            code: `delete category -> delete tasks`,
            note: "Категория ошибочно владеет жизненным циклом задач.",
          }}
          right={{
            title: "SET NULL",
            code: `delete category -> task.category_id = None`,
            note: "Организация исчезает, но учебная работа сохраняется.",
          }}
          preferred={"right"}
          explanation={"Категория является способом группировки, поэтому удаление не должно уничтожать задачи."}
        />

<TrueFalse
          statement={<>{"Политику удаления достаточно описать только словами в README."}</>}
          isTrue={false}
          explanation={"Модель, migration, CRUD и тесты должны реализовать одинаковое поведение."}
        />

<Callout tone={"info"}>
  {"Для SQLite дополнительно проверяют включённый PRAGMA foreign_keys=ON."}
</Callout>
      </Section>

      <Section number={"06"} title={"Создание связанных записей в StudyHub"}>
        <Lead>
  {"Практический сценарий состоит из двух операций: сначала создаётся категория и получает id, затем задача сохраняет этот id. Один commit может включать обе записи, если используется flush."}
</Lead>

<CodeBlock
          caption={"CRUD-функции"}
          code={`def create_category(
            session: Session,
            name: str,
        ) -> CategoryModel:
            category = CategoryModel(name=name.strip())
            session.add(category)
            session.commit()
            session.refresh(category)
            return category


        def create_task(
            session: Session,
            data: TaskCreate,
        ) -> TaskModel:
            ensure_category_exists(session, data.category_id)

            task = TaskModel(**data.model_dump())
            session.add(task)
            session.commit()
            session.refresh(task)
            return task`}
        />

<TerminalDemo
          title={"ручная проверка"}
          lines={[
            { cmd: "http POST :8000/categories name=Python" },
{ out: "{\"id\": 1, \"name\": \"Python\"}" },
{ cmd: "http POST :8000/tasks title=\"Foreign key\" category_id:=1" },
{ out: "{\"id\": 1, \"title\": \"Foreign key\", \"category_id\": 1}" },
{ cmd: "http POST :8000/tasks title=\"Ошибка\" category_id:=999" },
{ out: "HTTP/1.1 404 Not Found" }
          ]}
        />

<PredictOutput
          code={`task = TaskModel(title="Без категории")
        print(task.category_id)`}
          output={`None`}
          hint={"Значение по умолчанию согласовано с nullable-связью."}
        />

<Callout tone={"info"}>
  {"Проверьте три сценария отдельно: None, существующий id и неизвестный id."}
</Callout>
      </Section>

      <Section number={"07"} title={"Ошибки порядка и flush"}>
        <Lead>
  {"Новая Category не получает id в момент создания Python-объекта. Ключ назначает база при flush или commit. Поэтому дочернюю запись нельзя строить на category.id слишком рано."}
</Lead>

<BugHunt
          code={`category = CategoryModel(name="Python")
        session.add(category)

        task = TaskModel(
            title="Связи",
            category_id=category.id,
        )`}
          question={"Почему category_id может стать None?"}
          options={["Категория ещё не была отправлена в базу", "ForeignKey всегда строка", "Нужно вызвать relationship"]}
          correctIndex={0}
          explanation={"До flush база не назначила первичный ключ."}
          fix={`category = CategoryModel(name="Python")
        session.add(category)
        session.flush()

        task = TaskModel(
            title="Связи",
            category_id=category.id,
        )`}
        />

<CodeSequence
          title={"Соберите создание связи"}
          prompt={"Расположите операции так, чтобы category.id появился до TaskModel."}
          pieces={[
            { id: "category", code: `category = CategoryModel(name="Python")` },
{ id: "add", code: `session.add(category)` },
{ id: "flush", code: `session.flush()`, note: "получить id без завершения транзакции" },
{ id: "task", code: `task = TaskModel(title="FK", category_id=category.id)` },
{ id: "add_task", code: `session.add(task)` },
{ id: "commit", code: `session.commit()` },
{ id: "manual", code: `category.id = 1`, note: "не назначайте ключ вручную" }
          ]}
          correctOrder={["category", "add", "flush", "task", "add_task", "commit"]}
          explanation={"flush отправляет INSERT и позволяет использовать сгенерированный id в той же транзакции."}
        />

<TrueFalse
          statement={<>{"ForeignKey автоматически превращает ошибку базы в HTTP 404."}</>}
          isTrue={false}
          explanation={"HTTP-ответ формирует FastAPI-код. Ограничение базы само по себе даёт SQL-ошибку."}
        />

<Callout tone={"info"}>
  {"Сначала диагностируйте порядок действий, затем ограничения базы, и только потом HTTP-слой."}
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
            question={"Что хранит tasks.category_id?"}
            options={["id категории", "название категории", "весь объект"]}
            correctIndex={0}
            explanation={"В колонке находится первичный ключ родителя."}
          />

          <QuizCard
            question={"Что разрешает nullable=True?"}
            options={["None", "любой id", "отсутствие колонки"]}
            correctIndex={0}
            explanation={"Ссылка может отсутствовать, но число обязано существовать."}
          />

          <QuizCard
            question={"Какое отношение построено?"}
            options={["one-to-many", "many-to-many", "one-to-one"]}
            correctIndex={0}
            explanation={"Одна категория объединяет много задач."}
          />

          <QuizCard
            question={"Почему CASCADE не выбран?"}
            options={["может удалить задачи", "ломает SELECT", "запрещён SQLite"]}
            correctIndex={0}
            explanation={"Категория не должна владеть жизненным циклом задачи."}
          />
        </div>

<KeyTakeaways
          points={[
            <>{"Primary key идентифицирует строку своей таблицы."}</>,
            <>{"Foreign key хранит проверяемую ссылку на родителя."}</>,
            <>{"One-to-many связывает одну категорию со многими задачами."}</>,
            <>{"Nullable разрешает задачу без категории."}</>,
            <>{"Переданный id проверяется до INSERT."}</>,
            <>{"Политика удаления является частью контракта."}</>,
            <>{"flush позволяет получить id внутри транзакции."}</>
          ]}
        />

<PracticeCta text={"Добавьте CategoryModel, nullable category_id и три теста: задача без категории, задача с существующей категорией и 404 для неизвестного category_id."} />
      </Section>
    </RichLesson>
  );
}


// 88. relationship и связанные объекты
export function Lesson88({
  module,
}: {
  module?: string;
}) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"relationship и связанные объекты"}
        intro={"Добавим ORM-навигацию поверх внешнего ключа: настроим relationship и back_populates, получим task.category и category.tasks, а затем спроектируем вложенные Pydantic-схемы без бесконечной рекурсии."}
        tags={[
          { icon: <Link2 size={14} />, label: "ORM-навигация" },
          { icon: <Braces size={14} />, label: "вложенный JSON" }
        ]}
      />

      <TheoryBridge lesson={88} />

      <div className="lesson-route">
        <ol>
          <li>
            <strong>{"Шаг 1."}</strong>
            {"Соединить orm-атрибуты."}
          </li>
          <li>
            <strong>{"Шаг 2."}</strong>
            {"Синхронизировать объект и id."}
          </li>
          <li>
            <strong>{"Шаг 3."}</strong>
            {"Спроектировать краткую вложенную схему."}
          </li>
          <li>
            <strong>{"Шаг 4."}</strong>
            {"Проверить обе стороны связи."}
          </li>
        </ol>
        <p>
          {"Маршрут заканчивается проверяемым изменением StudyHub, а не изолированным примером."}
        </p>
      </div>

      <TypeCards>
        <TypeCard badge={"до"} title={"Состояние до урока"} code={`StudyHub Database API`}>
          {"category_id уже хранится"}
        </TypeCard>
        <TypeCard badge={"+"} badgeTone={"float"} title={"Что добавляем"} code={`relationship и связанные объекты`}>
          {"relationship и response schemas"}
        </TypeCard>
        <TypeCard badge={"после"} badgeTone={"str"} title={"Состояние после"} code={`готовый проектный результат`}>
          {"объектная навигация без рекурсии"}
        </TypeCard>
      </TypeCards>

      <div className="lesson-practice-steps">
        <h3>{"Главная модель"}</h3>
        <p>{"ForeignKey защищает базу, relationship даёт навигацию объектов."}</p>

        <h3>{"Граничный сценарий"}</h3>
        <p>{"Вложенные схемы должны иметь конечную точку и поддерживать null."}</p>

        <h3>{"Проектный результат"}</h3>
        <p>{"Task возвращается с CategoryBrief, а category.tasks доступен отдельно."}</p>
      </div>

      <Callout tone={"info"}>
  {"Граница урока: стоимость загрузки откладывается до урока 89."}
</Callout>

      <Section number={"01"} title={"Три уровня одной связи"}>
        <Lead>
  {"В базе Task хранит число category_id. В Python разработчик хочет читать task.category.name. В HTTP-контракте клиенту нужен конечный JSON. Эти три уровня связаны, но каждый решает отдельную задачу."}
</Lead>

<TypeCards>
          <TypeCard badge={"FK"} title={"Уровень базы"} code={`ForeignKey("categories.id")`}>
            {"Ограничивает допустимые значения category_id."}
          </TypeCard>
          <TypeCard badge={"rel"} badgeTone={"float"} title={"Уровень ORM"} code={`task.category`}>
            {"Возвращает связанный CategoryModel."}
          </TypeCard>
          <TypeCard badge={"schema"} badgeTone={"str"} title={"Уровень API"} code={`TaskReadWithCategory`}>
            {"Выбирает поля публичного ответа."}
          </TypeCard>
        </TypeCards>

<MethodGrid
          rows={[
            [<>{"category_id"}</>, "числовая ссылка в таблице"],
            [<>{"task.category"}</>, "родительский ORM-объект или None"],
            [<>{"category.tasks"}</>, "коллекция дочерних ORM-объектов"],
            [<>{"response_model"}</>, "контролируемая форма JSON"]
          ]}
        />

<Callout tone={"info"}>
  {"Ошибка возникает, когда от relationship ожидают целостность базы или от ForeignKey — готовый вложенный JSON."}
</Callout>
      </Section>

      <Section number={"02"} title={"back_populates с двух сторон"}>
        <Lead>
  {"back_populates связывает встречные атрибуты одной связи. Имя в строке должно точно совпасть с атрибутом другого ORM-класса."}
</Lead>

<CodeBlock
          caption={"двусторонняя навигация"}
          code={`from __future__ import annotations

        from sqlalchemy.orm import Mapped, relationship


        class CategoryModel(Base):
            __tablename__ = "categories"

            # id и name опущены только в этом фрагменте
            tasks: Mapped[list[TaskModel]] = relationship(
                back_populates="category",
            )


        class TaskModel(Base):
            __tablename__ = "tasks"

            # id, title и category_id уже объявлены
            category: Mapped[CategoryModel | None] = relationship(
                back_populates="tasks",
            )`}
        />

<PredictOutput
          code={`category = CategoryModel(name="Python")
        task = TaskModel(title="ORM")
        task.category = category
        print(task.category.name)`}
          output={`Python`}
          hint={"Task хранит ссылку на созданный объект CategoryModel."}
        />

<TrueFalse
          statement={<>{"back_populates=\"tasks\" означает имя таблицы tasks."}</>}
          isTrue={false}
          explanation={"Это имя встречного Python-атрибута CategoryModel.tasks."}
        />

<Callout tone={"info"}>
  {"future annotations позволяет ссылаться на класс, объявленный ниже, без раннего импорта типа."}
</Callout>
      </Section>

      <Section number={"03"} title={"Назначение объекта и синхронизация id"}>
        <Lead>
  {"Связь можно установить числом category_id или объектом category. После flush SQLAlchemy синхронизирует внешний ключ. В базе всё равно сохраняется integer."}
</Lead>

<CompareSolutions
          question={"Как создать связанную задачу?"}
          left={{
            title: "Через id",
            code: `TaskModel(title="SQL", category_id=category.id)`,
            note: "Удобно для уже проверенных HTTP-данных.",
          }}
          right={{
            title: "Через объект",
            code: `TaskModel(title="SQL", category=category)`,
            note: "Удобно, когда CategoryModel уже загружен.",
          }}
          preferred={"both"}
          explanation={"Оба варианта корректны. Важно не передавать одновременно противоречащие значения."}
        />

<CodeBlock
          caption={"одна транзакция"}
          code={`category = CategoryModel(name="Python")
        task = TaskModel(
            title="Relationship",
            category=category,
        )

        session.add(task)
        session.commit()
        session.refresh(task)

        print(task.category_id)
        print(task.category.name)`}
        />

<RecallCard
          question={"Что находится в строке таблицы tasks?"}
          answer={<p>{"Только category_id. Объект CategoryModel существует в identity map и ORM-навигации, но не записывается внутрь одной колонки."}</p>}
        />

<Callout tone={"info"}>
  {"Объектная модель делает код выразительнее, не меняя реляционный формат хранения."}
</Callout>
      </Section>

      <Section number={"04"} title={"Вложенные response schemas без рекурсии"}>
        <Lead>
  {"Полные схемы Task и Category нельзя бесконечно вкладывать друг в друга. Для вложения создаётся краткая CategoryBrief, а обратный список использует TaskRead без повторной category."}
</Lead>

<CodeBlock
          caption={"конечные схемы ответа"}
          code={`from pydantic import BaseModel, ConfigDict


        class CategoryBrief(BaseModel):
            model_config = ConfigDict(from_attributes=True)

            id: int
            name: str


        class TaskRead(BaseModel):
            model_config = ConfigDict(from_attributes=True)

            id: int
            title: str
            category_id: int | None


        class TaskReadWithCategory(TaskRead):
            category: CategoryBrief | None


        class CategoryReadWithTasks(CategoryBrief):
            tasks: list[TaskRead]`}
        />

<CompareSolutions
          question={"Какая структура безопасна?"}
          left={{
            title: "Полная рекурсия",
            code: `TaskFull -> CategoryFull -> list[TaskFull]`,
            note: "Ответ не имеет естественной точки остановки.",
          }}
          right={{
            title: "Краткое вложение",
            code: `TaskReadWithCategory -> CategoryBrief`,
            note: "Ответ заканчивается на id и name.",
          }}
          preferred={"right"}
          explanation={"Публичная схема должна отражать сценарий, а не весь граф ORM."}
        />

<TrueFalse
          statement={<>{"response_model обязан содержать каждый relationship модели."}</>}
          isTrue={false}
          explanation={"API выбирает только нужные клиенту поля."}
        />

<Callout tone={"info"}>
  {"from_attributes=True разрешает Pydantic читать атрибуты ORM-объекта."}
</Callout>
      </Section>

      <Section number={"05"} title={"GET задачи со связанной категорией"}>
        <Lead>
  {"Endpoint получает TaskModel и возвращает его по TaskReadWithCategory. Если category_id равен None, вложенное поле становится null."}
</Lead>

<CodeBlock
          caption={"endpoint задачи"}
          code={`@router.get(
            "/{task_id}",
            response_model=TaskReadWithCategory,
        )
        def get_task(
            task_id: int,
            session: Annotated[Session, Depends(get_db)],
        ):
            task = session.get(TaskModel, task_id)

            if task is None:
                raise HTTPException(
                    status_code=404,
                    detail="Task not found",
                )

            return task`}
        />

<TerminalDemo
          title={"ответ API"}
          lines={[
            { cmd: "http GET :8000/tasks/1" },
{ out: "{" },
{ out: "  \"id\": 1," },
{ out: "  \"title\": \"Relationship\"," },
{ out: "  \"category_id\": 2," },
{ out: "  \"category\": {\"id\": 2, \"name\": \"SQL\"}" },
{ out: "}" }
          ]}
        />

<PredictOutput
          code={`task = TaskModel(id=1, title="Без категории", category_id=None)
        print(task.category)`}
          output={`None`}
          hint={"Nullable relationship возвращает None."}
        />

<Callout tone={"info"}>
  {"Следующий урок разберёт, когда чтение task.category выполняет SQL."}
</Callout>
      </Section>

      <Section number={"06"} title={"Обратная коллекция category.tasks"}>
        <Lead>
  {"Список задач категории полезен, но может быть большим. Поэтому он выдаётся отдельным endpoint, а базовая карточка категории остаётся компактной."}
</Lead>

<CodeBlock
          caption={"отдельный связанный ресурс"}
          code={`@router.get(
            "/{category_id}/tasks",
            response_model=list[TaskRead],
        )
        def get_category_tasks(
            category_id: int,
            session: Annotated[Session, Depends(get_db)],
        ):
            category = session.get(CategoryModel, category_id)

            if category is None:
                raise HTTPException(
                    status_code=404,
                    detail="Category not found",
                )

            return category.tasks`}
        />

<MethodGrid
          rows={[
            [<>{"GET /categories"}</>, "компактный список категорий"],
            [<>{"GET /categories/{category_id}"}</>, "карточка без большой коллекции"],
            [<>{"GET /categories/{category_id}/tasks"}</>, "самостоятельный список задач"],
            [<>{"TaskRead"}</>, "не содержит обратную CategoryBrief"]
          ]}
        />

<RecallCard
          question={"Почему список задач вынесен отдельно?"}
          answer={<p>{"Коллекции требуют отдельной загрузки, могут расти и позже получают пагинацию. Это самостоятельный контракт ответа."}</p>}
        />

<Callout tone={"info"}>
  {"Разделение endpoint не мешает использовать category.tasks внутри CRUD-функции."}
</Callout>
      </Section>

      <Section number={"07"} title={"Типичные ошибки relationship"}>
        <Lead>
  {"Чаще всего ломаются имена back_populates или сериализация полного графа. Диагностику ведут по слоям: ForeignKey, оба relationship, затем Pydantic-схема."}
</Lead>

<BugHunt
          code={`class CategoryModel(Base):
            tasks = relationship(back_populates="category")


        class TaskModel(Base):
            category = relationship(back_populates="items")`}
          question={"Почему mapper не может настроить связь?"}
          options={["У CategoryModel нет атрибута items", "relationship требует SQL JOIN вручную", "TaskModel нельзя связывать"]}
          correctIndex={0}
          explanation={"TaskModel.category указывает на несуществующий встречный атрибут."}
          fix={`class CategoryModel(Base):
            tasks = relationship(back_populates="category")


        class TaskModel(Base):
            category = relationship(back_populates="tasks")`}
        />

<CodeSequence
          title={"Соберите путь ответа"}
          prompt={"Расположите уровни от строки базы до JSON."}
          pieces={[
            { id: "fk", code: `tasks.category_id хранит id` },
{ id: "rel", code: `TaskModel.category получает объект` },
{ id: "schema", code: `TaskReadWithCategory выбирает поля` },
{ id: "json", code: `FastAPI сериализует JSON` },
{ id: "wrong", code: `JSON создаёт ForeignKey`, note: "направление перепутано" }
          ]}
          correctOrder={["fk", "rel", "schema", "json"]}
          explanation={"База хранит ссылку, ORM предоставляет объект, Pydantic ограничивает форму."}
        />

<TrueFalse
          statement={<>{"relationship гарантирует целостность даже без ForeignKey."}</>}
          isTrue={false}
          explanation={"Целостность схемы задаёт ограничение базы."}
        />

<Callout tone={"info"}>
  {"Не лечите ошибку mapper случайной заменой имён. Нарисуйте две стороны связи и подпишите встречные атрибуты."}
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
            question={"Что делает relationship?"}
            options={["создаёт ORM-навигацию", "заменяет ForeignKey", "создаёт route"]}
            correctIndex={0}
            explanation={"Relationship предоставляет связанные объекты."}
          />

          <QuizCard
            question={"На что указывает back_populates?"}
            options={["на встречный атрибут", "на имя базы", "на response schema"]}
            correctIndex={0}
            explanation={"Имя должно существовать в другом классе."}
          />

          <QuizCard
            question={"Зачем CategoryBrief?"}
            options={["остановить вложение", "создать таблицу", "выполнить commit"]}
            correctIndex={0}
            explanation={"Краткая схема делает ответ конечным."}
          />

          <QuizCard
            question={"Что вернёт task.category без связи?"}
            options={["None", "пустой dict", "ошибку всегда"]}
            correctIndex={0}
            explanation={"Nullable relationship допускает отсутствие родителя."}
          />
        </div>

<KeyTakeaways
          points={[
            <>{"ForeignKey и relationship решают разные задачи."}</>,
            <>{"back_populates связывает встречные ORM-атрибуты."}</>,
            <>{"TaskModel.category возвращает объект или None."}</>,
            <>{"CategoryModel.tasks возвращает коллекцию."}</>,
            <>{"Pydantic читает ORM через from_attributes."}</>,
            <>{"Краткие схемы останавливают рекурсию."}</>,
            <>{"Большие коллекции лучше выдавать отдельным endpoint."}</>
          ]}
        />

<PracticeCta text={"Добавьте двусторонний relationship, TaskReadWithCategory и GET /categories/{category_id}/tasks. Проверьте связанную и несвязанную задачу."} />
      </Section>
    </RichLesson>
  );
}


// 89. Загрузка связей и первое N+1
export function Lesson89({
  module,
}: {
  module?: string;
}) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Загрузка связей и первое N+1"}
        intro={"Увидим скрытую стоимость relationship: включим SQL-логи, воспроизведём N+1 на списке задач и исправим его через selectinload, не превращая оптимизацию в преждевременную магию."}
        tags={[
          { icon: <Search size={14} />, label: "читаем SQL-логи" },
          { icon: <Layers size={14} />, label: "selectinload" }
        ]}
      />

      <TheoryBridge lesson={89} />

      <div className="lesson-route">
        <ol>
          <li>
            <strong>{"Шаг 1."}</strong>
            {"Увидеть повторяющиеся select."}
          </li>
          <li>
            <strong>{"Шаг 2."}</strong>
            {"Зафиксировать исходный лог."}
          </li>
          <li>
            <strong>{"Шаг 3."}</strong>
            {"Добавить selectinload в нужный запрос."}
          </li>
          <li>
            <strong>{"Шаг 4."}</strong>
            {"Повторить тот же сценарий."}
          </li>
        </ol>
        <p>
          {"Маршрут заканчивается проверяемым изменением StudyHub, а не изолированным примером."}
        </p>
      </div>

      <TypeCards>
        <TypeCard badge={"до"} title={"Состояние до урока"} code={`StudyHub Database API`}>
          {"relationship работает"}
        </TypeCard>
        <TypeCard badge={"+"} badgeTone={"float"} title={"Что добавляем"} code={`Загрузка связей и первое N+1`}>
          {"SQL-лог и selectinload"}
        </TypeCard>
        <TypeCard badge={"после"} badgeTone={"str"} title={"Состояние после"} code={`готовый проектный результат`}>
          {"контролируемые два запроса"}
        </TypeCard>
      </TypeCards>

      <div className="lesson-practice-steps">
        <h3>{"Главная модель"}</h3>
        <p>{"N+1 — один SELECT списка и повторные SELECT связей."}</p>

        <h3>{"Граничный сценарий"}</h3>
        <p>{"Eager loading не добавляется запросу, который не читает relationship."}</p>

        <h3>{"Проектный результат"}</h3>
        <p>{"Список с категориями выполняет два наблюдаемых запроса."}</p>
      </div>

      <Callout tone={"info"}>
  {"Граница урока: глубокий профайлинг не требуется."}
</Callout>

      <Section number={"01"} title={"Удобный атрибут может скрывать SQL"}>
        <Lead>
  {"task.category.name выглядит как чтение обычного атрибута. Если category не загружена, SQLAlchemy может обратиться к базе. На одной записи это незаметно, а на списке превращается в поток запросов."}
</Lead>

<TypeCards>
          <TypeCard badge={"1"} title={"Основной SELECT"} code={`SELECT ... FROM tasks`}>
            {"Получает список TaskModel."}
          </TypeCard>
          <TypeCard badge={"+N"} badgeTone={"float"} title={"Скрытые SELECT"} code={`SELECT ... FROM categories WHERE id = ?`}>
            {"Возникают при чтении category у каждой задачи."}
          </TypeCard>
          <TypeCard badge={"2"} badgeTone={"str"} title={"selectinload"} code={`WHERE categories.id IN (...)`}>
            {"Один запрос tasks и один набор categories."}
          </TypeCard>
        </TypeCards>

<MethodGrid
          rows={[
            [<>{"lazy/default"}</>, "загрузка relationship при первом обращении"],
            [<>{"N"}</>, "количество основных объектов"],
            [<>{"response schema"}</>, "может неявно прочитать category"],
            [<>{"SQL log"}</>, "показывает реальное число запросов"]
          ]}
        />

<Callout tone={"info"}>
  {"Оптимизация начинается с наблюдения. Если ответ не читает category, дополнительная загрузка не нужна."}
</Callout>
      </Section>

      <Section number={"02"} title={"Как возникает 1 + N"}>
        <Lead>
  {"Сначала выполняется один SELECT задач. Затем цикл или сериализация обращается к category каждой задачи. В худшем случае это N дополнительных SELECT."}
</Lead>

<CodeBlock
          caption={"проблемный сценарий"}
          code={`statement = select(TaskModel)
        tasks = session.scalars(statement).all()

        for task in tasks:
            print(task.category.name)`}
        />

<PredictOutput
          code={`# Четыре задачи относятся к четырём разным категориям.
        # Связи загружаются лениво.
        print(1 + 4)`}
          output={`5`}
          hint={"Один основной запрос плюс четыре загрузки категорий."}
        />

<TrueFalse
          statement={<>{"N+1 определяется количеством строк Python-кода."}</>}
          isTrue={false}
          explanation={"Это шаблон количества SQL-запросов."}
        />

<RecallCard
          question={"Почему реальное число иногда меньше N?"}
          answer={<p>{"Session хранит identity map. Повторное обращение к уже загруженной категории может не выполнить новый SELECT, но скрытый шаблон остаётся."}</p>}
        />

<Callout tone={"info"}>
  {"Один правильный JSON может быть собран десятками запросов. Корректность ответа и стоимость загрузки проверяются отдельно."}
</Callout>
      </Section>

      <Section number={"03"} title={"SQL-логи вместо догадок"}>
        <Lead>
  {"echo=True выводит SQLAlchemy-запросы в терминал. На учебном проекте этого достаточно, чтобы увидеть повторяющиеся SELECT categories."}
</Lead>

<CodeBlock
          caption={"engine с диагностикой"}
          code={`engine = create_engine(
            settings.database_url,
            echo=True,
        )`}
        />

<TerminalDemo
          title={"лог до оптимизации"}
          lines={[
            { out: "SELECT tasks.id, tasks.title, tasks.category_id FROM tasks" },
{ out: "SELECT categories.id, categories.name FROM categories WHERE categories.id = 1" },
{ out: "SELECT categories.id, categories.name FROM categories WHERE categories.id = 2" },
{ out: "SELECT categories.id, categories.name FROM categories WHERE categories.id = 3" }
          ]}
        />

<RecallCard
          question={"Что искать в логе?"}
          answer={<p>{"Один основной SELECT и серию похожих SELECT к связанной таблице. Особое внимание — запросам, которые появляются во время сериализации."}</p>}
        />

<TrueFalse
          statement={<>{"echo=True безопасно и полезно всегда оставлять в production."}</>}
          isTrue={false}
          explanation={"SQL-лог шумный и может содержать параметры. Production-логирование настраивается отдельно."}
        />

<Callout tone={"info"}>
  {"После диагностики echo можно выключить. Понимание стратегии загрузки остаётся в коде запроса."}
</Callout>
      </Section>

      <Section number={"04"} title={"selectinload: два предсказуемых запроса"}>
        <Lead>
  {"selectinload сначала загружает задачи, собирает category_id и отдельным SELECT получает все нужные категории через IN."}
</Lead>

<CodeBlock
          caption={"явная стратегия загрузки"}
          code={`from sqlalchemy import select
        from sqlalchemy.orm import selectinload


        def list_tasks_with_categories(
            session: Session,
        ) -> list[TaskModel]:
            statement = (
                select(TaskModel)
                .options(
                    selectinload(TaskModel.category)
                )
                .order_by(TaskModel.id)
            )
            return session.scalars(statement).all()`}
        />

<TerminalDemo
          title={"лог после selectinload"}
          lines={[
            { out: "SELECT tasks.id, tasks.title, tasks.category_id FROM tasks ORDER BY tasks.id" },
{ out: "SELECT categories.id, categories.name FROM categories" },
{ out: "WHERE categories.id IN (?, ?, ?)" }
          ]}
        />

<PredictOutput
          code={`queries_before = 6
        queries_after = 2
        print(queries_before - queries_after)`}
          output={`4`}
          hint={"В демонстрации устранены четыре лишних запроса."}
        />

<Callout tone={"info"}>
  {"selectinload не меняет форму результата. Он меняет способ предварительной загрузки relationship."}
</Callout>
      </Section>

      <Section number={"05"} title={"selectinload против joinedload"}>
        <Lead>
  {"joinedload делает JOIN в основном SELECT, selectinload — отдельный запрос. Универсального победителя нет. Для первого списка StudyHub selectinload проще наблюдать."}
</Lead>

<CompareSolutions
          question={"Что выбрать для списка задач с категорией?"}
          left={{
            title: "joinedload",
            code: `select(TaskModel).options(joinedload(TaskModel.category))`,
            note: "Один SQL с JOIN; коллекции могут дублировать строки.",
          }}
          right={{
            title: "selectinload",
            code: `select(TaskModel).options(selectinload(TaskModel.category))`,
            note: "Два ясных запроса и отдельный IN.",
          }}
          preferred={"right"}
          explanation={"Это учебный выбор для текущей формы данных, а не закон для всех проектов."}
        />

<MethodGrid
          rows={[
            [<>{"plain select"}</>, "когда ответу достаточно category_id"],
            [<>{"selectinload"}</>, "когда нужен связанный объект у списка"],
            [<>{"joinedload"}</>, "когда измерения подтверждают удобство JOIN"],
            [<>{"eager everywhere"}</>, "антипаттерн загрузки на всякий случай"]
          ]}
        />

<TrueFalse
          statement={<>{"selectinload всегда быстрее joinedload."}</>}
          isTrue={false}
          explanation={"Результат зависит от данных, индексов, СУБД и формы запроса."}
        />

<Callout tone={"info"}>
  {"Стратегия загрузки является частью конкретного SELECT, а не глобальной привычкой."}
</Callout>
      </Section>

      <Section number={"06"} title={"Endpoint списка без скрытых запросов"}>
        <Lead>
  {"response_model читает category, поэтому CRUD-функция обязана вернуть задачи с подготовленной связью. Стратегия находится рядом с select."}
</Lead>

<CodeBlock
          caption={"GET /tasks"}
          code={`@router.get(
            "",
            response_model=list[TaskReadWithCategory],
        )
        def list_tasks(
            session: Annotated[
                Session,
                Depends(get_db),
            ],
        ):
            statement = (
                select(TaskModel)
                .options(
                    selectinload(TaskModel.category)
                )
                .order_by(TaskModel.id)
            )
            return session.scalars(statement).all()`}
        />

<TerminalDemo
          title={"ручная проверка"}
          lines={[
            { cmd: "uvicorn app.main:app --reload" },
{ cmd: "http GET :8000/tasks" },
{ out: "SQL 1: SELECT ... FROM tasks" },
{ out: "SQL 2: SELECT ... FROM categories WHERE id IN (...)" },
{ out: "дополнительных SELECT при сериализации нет" }
          ]}
        />

<RecallCard
          question={"Почему order_by(TaskModel.id) полезен?"}
          answer={<p>{"Стабильный порядок упрощает тестирование и сравнение результата до и после оптимизации."}</p>}
        />

<Callout tone={"info"}>
  {"Не оптимизируйте endpoint карточки по шаблону списка: у него другая форма результата и другая стоимость."}
</Callout>
      </Section>

      <Section number={"07"} title={"Диагностика и исправление N+1"}>
        <Lead>
  {"API-тест формы ответа не гарантирует разумное число SQL-запросов. На обязательном уровне достаточно повторяемого сценария с echo и сравнением лога."}
</Lead>

<BugHunt
          code={`def list_tasks(session):
            tasks = session.scalars(
                select(TaskModel)
            ).all()

            return [
                {
                    "id": task.id,
                    "category": task.category.name,
                }
                for task in tasks
            ]`}
          question={"Где возникает риск N+1?"}
          options={["В task.category внутри обхода", "В task.id", "В фигурных скобках"]}
          correctIndex={0}
          explanation={"Relationship читается для каждого элемента после обычного SELECT."}
          fix={`def list_tasks(session):
            statement = select(TaskModel).options(
                selectinload(TaskModel.category)
            )
            return session.scalars(statement).all()`}
        />

<CodeSequence
          title={"Соберите диагностику"}
          prompt={"Расположите путь от наблюдения к проверенному исправлению."}
          pieces={[
            { id: "echo", code: `включить SQL-лог` },
{ id: "request", code: `выполнить тот же GET /tasks` },
{ id: "count", code: `найти повторяющиеся SELECT categories` },
{ id: "option", code: `добавить selectinload` },
{ id: "repeat", code: `повторить запрос` },
{ id: "confirm", code: `подтвердить два SELECT` },
{ id: "guess", code: `оптимизировать без запуска`, note: "нет исходного наблюдения" }
          ]}
          correctOrder={["echo", "request", "count", "option", "repeat", "confirm"]}
          explanation={"Сначала проблема фиксируется, затем применяется минимальное изменение и повторяется тот же сценарий."}
        />

<TrueFalse
          statement={<>{"Правильный JSON доказывает отсутствие N+1."}</>}
          isTrue={false}
          explanation={"Он доказывает корректность данных, но не стоимость получения."}
        />

<Callout tone={"info"}>
  {"Для блока не нужен сложный профилировщик: ученик должен объяснить изменение 1+N → 2."}
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
            question={"Что означает 1 в N+1?"}
            options={["основной SELECT", "одна модель", "одна колонка"]}
            correctIndex={0}
            explanation={"Сначала загружается основной набор."}
          />

          <QuizCard
            question={"Где проявляется N+1?"}
            options={["при чтении relationship в цикле", "при объявлении Base", "в .env"]}
            correctIndex={0}
            explanation={"Повторная ленивая загрузка создаёт SELECT."}
          />

          <QuizCard
            question={"Что делает selectinload?"}
            options={["загружает связи отдельным IN", "удаляет ForeignKey", "создаёт migration"]}
            correctIndex={0}
            explanation={"Связанные строки приходят одним набором."}
          />

          <QuizCard
            question={"Нужно ли eager loading каждому SELECT?"}
            options={["нет", "да", "только INSERT"]}
            correctIndex={0}
            explanation={"Он нужен только для конкретного контракта ответа."}
          />
        </div>

<KeyTakeaways
          points={[
            <>{"Relationship может выполнить SQL при чтении."}</>,
            <>{"N+1 — основной запрос плюс повторяющиеся загрузки."}</>,
            <>{"SQL-лог показывает реальное поведение ORM."}</>,
            <>{"selectinload обычно превращает 1+N в два запроса."}</>,
            <>{"Стратегия загрузки задаётся рядом с select."}</>,
            <>{"Response schema может неявно читать relationship."}</>,
            <>{"Оптимизацию проверяют тем же сценарием."}</>
          ]}
        />

<PracticeCta text={"Включите echo, воспроизведите N+1 в GET /tasks, добавьте selectinload и сохраните в README фрагменты лога до и после."} />
      </Section>
    </RichLesson>
  );
}


// 90. Alembic: первая миграция
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

      <TheoryBridge lesson={90} />

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


// 91. Изменение схемы и downgrade
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

      <TheoryBridge lesson={91} />

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


// 92. Итоговый проект этапа 4
export function Lesson92({
  module,
}: {
  module?: string;
}) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Итоговый проект этапа 4"}
        intro={"Соберём StudyHub Database API как законченный синхронный сервис: сведём роутеры, схемы, ORM-модели, CRUD, связи и Alembic, подключим отдельную тестовую SQLite-базу и подготовим проект к защите."}
        tags={[
          { icon: <Trophy size={14} />, label: "Database API" },
          { icon: <ShieldCheck size={14} />, label: "тесты и проверка" }
        ]}
      />

      <TheoryBridge lesson={92} />

      <div className="lesson-route">
        <ol>
          <li>
            <strong>{"Шаг 1."}</strong>
            {"Создать схему с нуля."}
          </li>
          <li>
            <strong>{"Шаг 2."}</strong>
            {"Запустить тесты отдельно от рабочей бд."}
          </li>
          <li>
            <strong>{"Шаг 3."}</strong>
            {"Показать связанный http-сценарий."}
          </li>
          <li>
            <strong>{"Шаг 4."}</strong>
            {"Защитить архитектурные решения."}
          </li>
        </ol>
        <p>
          {"Маршрут заканчивается проверяемым изменением StudyHub, а не изолированным примером."}
        </p>
      </div>

      <TypeCards>
        <TypeCard badge={"до"} title={"Состояние до урока"} code={`StudyHub Database API`}>
          {"механизмы изучены отдельно"}
        </TypeCard>
        <TypeCard badge={"+"} badgeTone={"float"} title={"Что добавляем"} code={`Итоговый проект этапа 4`}>
          {"сборка и тестовая база"}
        </TypeCard>
        <TypeCard badge={"после"} badgeTone={"str"} title={"Состояние после"} code={`готовый проектный результат`}>
          {"воспроизводимый Database API"}
        </TypeCard>
      </TypeCards>

      <div className="lesson-practice-steps">
        <h3>{"Главная модель"}</h3>
        <p>{"Готовность API измеряется воспроизводимостью и объяснимым путём данных."}</p>

        <h3>{"Граничный сценарий"}</h3>
        <p>{"Тесты не используют рабочую базу, а будущие темы не смешиваются с релизом."}</p>

        <h3>{"Проектный результат"}</h3>
        <p>{"Migrations, tests, HTTP-сценарий и README работают с чистого состояния."}</p>
      </div>

      <Callout tone={"info"}>
  {"Граница урока: users, JWT и async — следующий этап."}
</Callout>

      <Section number={"01"} title={"Что считается завершённым API"}>
        <Lead>
  {"Новый разработчик должен клонировать репозиторий, применить migrations, запустить тесты и увидеть одинаковое поведение. Однократный запуск у автора не является готовностью."}
</Lead>

<TypeCards>
          <TypeCard badge={"API"} title={"HTTP-контракт"} code={`routers + schemas`}>
            {"FastAPI, Pydantic, статусы и OpenAPI."}
          </TypeCard>
          <TypeCard badge={"DB"} badgeTone={"float"} title={"Постоянные данные"} code={`models + crud`}>
            {"SQLite, Session, CRUD и связи."}
          </TypeCard>
          <TypeCard badge={"ops"} badgeTone={"str"} title={"Воспроизводимость"} code={`migrations + tests`}>
            {"Alembic, tests и README."}
          </TypeCard>
        </TypeCards>

<MethodGrid
          rows={[
            [<>{"alembic upgrade head"}</>, "создаёт схему с нуля"],
            [<>{"pytest"}</>, "проверяет ключевые контракты"],
            [<>{"uvicorn"}</>, "запускает приложение"],
            [<>{"README"}</>, "объясняет повторяемый workflow"]
          ]}
        />

<Callout tone={"info"}>
  {"Готовность определяется чистым воспроизводимым сценарием, а не количеством написанных файлов."}
</Callout>
      </Section>

      <Section number={"02"} title={"Структура и ответственности"}>
        <Lead>
  {"Папки разделены по причинам изменения. Новая абстракция добавляется только при реальной необходимости, а не ради архитектурного декора."}
</Lead>

<CodeBlock
          caption={"итоговое дерево"}
          code={`studyhub/
        ├── alembic.ini
        ├── migrations/
        │   ├── env.py
        │   └── versions/
        ├── app/
        │   ├── main.py
        │   ├── config.py
        │   ├── database.py
        │   ├── models/
        │   ├── schemas/
        │   ├── crud/
        │   └── routers/
        ├── tests/
        │   ├── conftest.py
        │   ├── test_categories.py
        │   └── test_tasks.py
        ├── .env.example
        ├── pyproject.toml
        └── README.md`}
        />

<MethodGrid
          rows={[
            [<>{"routers"}</>, "HTTP-параметры, Depends и статусы"],
            [<>{"schemas"}</>, "валидация и публичная форма ответа"],
            [<>{"models"}</>, "таблицы, ForeignKey и relationship"],
            [<>{"crud"}</>, "select, commit, rollback и загрузка"],
            [<>{"database"}</>, "engine, sessionmaker и get_db"],
            [<>{"migrations"}</>, "история схемы"]
          ]}
        />

<RecallCard
          question={"Почему не добавляется service layer автоматически?"}
          answer={<p>{"Для текущего размера CRUD-функции уже ясно выражают операции базы. Новый слой без новой ответственности только усложнит маршрут."}</p>}
        />

<Callout tone={"info"}>
  {"Структура считается хорошей, когда место изменения можно предсказать по причине изменения."}
</Callout>
      </Section>

      <Section number={"03"} title={"Полный путь POST /tasks"}>
        <Lead>
  {"Ученик должен объяснить запрос от JSON до строки базы и обратно, не читая все файлы подряд."}
</Lead>

<CodeBlock
          caption={"тонкий endpoint"}
          code={`@router.post(
            "",
            response_model=TaskReadWithCategory,
            status_code=201,
        )
        def create_task_endpoint(
            data: TaskCreate,
            session: Annotated[
                Session,
                Depends(get_db),
            ],
        ):
            return tasks_crud.create_task(
                session,
                data,
            )`}
        />

<MethodGrid
          rows={[
            [<>{"request"}</>, "клиент отправляет JSON"],
            [<>{"TaskCreate"}</>, "Pydantic проверяет вход"],
            [<>{"get_db"}</>, "выдаёт Session на запрос"],
            [<>{"CRUD"}</>, "проверяет category и создаёт ORM-объект"],
            [<>{"commit"}</>, "фиксирует транзакцию"],
            [<>{"refresh"}</>, "получает id и server defaults"],
            [<>{"response_model"}</>, "строит конечный JSON"]
          ]}
        />

<PredictOutput
          code={`steps = [
            "validation",
            "session",
            "crud",
            "commit",
            "response",
        ]
        print(len(steps))`}
          output={`5`}
          hint={"Путь запроса разделён на пять крупных этапов."}
        />

<Callout tone={"info"}>
  {"Тонкий endpoint отвечает за HTTP-контракт, но не содержит SQL и транзакционные детали."}
</Callout>
      </Section>

      <Section number={"04"} title={"Отдельная тестовая SQLite-база"}>
        <Lead>
  {"Тесты не должны читать или менять рабочий studyhub.db. get_db подменяется, а in-memory SQLite использует StaticPool, чтобы приложение и TestClient видели одно подключение."}
</Lead>

<CodeBlock
          caption={"tests/conftest.py"}
          code={`import pytest
        from fastapi.testclient import TestClient
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        from sqlalchemy.pool import StaticPool

        from app.database import Base, get_db
        from app.main import app

        engine = create_engine(
            "sqlite://",
            connect_args={
                "check_same_thread": False,
            },
            poolclass=StaticPool,
        )

        TestingSessionLocal = sessionmaker(
            bind=engine,
            expire_on_commit=False,
        )


        @pytest.fixture
        def client():
            Base.metadata.create_all(engine)

            def override_get_db():
                with TestingSessionLocal() as session:
                    yield session

            app.dependency_overrides[
                get_db
            ] = override_get_db

            with TestClient(app) as test_client:
                yield test_client

            app.dependency_overrides.clear()
            Base.metadata.drop_all(engine)`}
        />

<CompareSolutions
          question={"Зачем StaticPool?"}
          left={{
            title: "Обычный pool",
            code: `create_engine("sqlite://")`,
            note: "Разные подключения могут увидеть разные in-memory базы.",
          }}
          right={{
            title: "StaticPool",
            code: `poolclass=StaticPool`,
            note: "TestClient и dependency используют одну базу.",
          }}
          preferred={"right"}
          explanation={"In-memory SQLite существует внутри подключения."}
        />

<TrueFalse
          statement={<>{"dependency_overrides изменяет production-функцию навсегда."}</>}
          isTrue={false}
          explanation={"Override очищается после fixture."}
        />

<Callout tone={"info"}>
  {"Быстрые API-тесты используют create_all, а отдельный migration-test проверяет Alembic на файловой базе."}
</Callout>
      </Section>

      <Section number={"05"} title={"Матрица обязательных тестов"}>
        <Lead>
  {"Тесты выбираются по рискам: успешные сценарии, границы данных, связи, конфликты и восстановление Session."}
</Lead>

<MethodGrid
          rows={[
            [<>{"POST /categories"}</>, "201 и 409 для duplicate name"],
            [<>{"POST /tasks"}</>, "None, существующая и неизвестная category"],
            [<>{"GET /tasks"}</>, "фильтры, сортировка, pagination и category"],
            [<>{"PATCH /tasks/{task_id}"}</>, "частичное обновление и 404"],
            [<>{"DELETE category"}</>, "выбранная политика связи"],
            [<>{"IntegrityError"}</>, "rollback и следующий рабочий запрос"],
            [<>{"Alembic"}</>, "upgrade head на чистой базе"]
          ]}
        />

<CodeBlock
          caption={"тест связанной задачи"}
          code={`def test_create_task_with_category(client):
            category_response = client.post(
                "/categories",
                json={"name": "Python"},
            )
            category_id = (
                category_response.json()["id"]
            )

            response = client.post(
                "/tasks",
                json={
                    "title": "Relationships",
                    "category_id": category_id,
                },
            )

            assert response.status_code == 201
            assert (
                response.json()["category"]["name"]
                == "Python"
            )`}
        />

<RecallCard
          question={"Почему после IntegrityError нужен ещё один запрос?"}
          answer={<p>{"Он доказывает, что rollback вернул Session в рабочее состояние, а тест проверяет не только статус 409."}</p>}
        />

<TrueFalse
          statement={<>{"Чем больше тестов, тем автоматически лучше проект."}</>}
          isTrue={false}
          explanation={"Важнее покрыть значимые риски и контракты."}
        />

<Callout tone={"info"}>
  {"Тест должен проверять наблюдаемое поведение, а не повторять внутренние строки реализации."}
</Callout>
      </Section>

      <Section number={"06"} title={"README и запуск с чистого состояния"}>
        <Lead>
  {"README является исполняемой инструкцией: установка, .env, migrations, тесты, сервер и примеры запросов."}
</Lead>

<CodeBlock
          caption={"раздел запуска"}
          code={`## Запуск

        python -m venv .venv
        source .venv/bin/activate
        pip install -r requirements.txt
        cp .env.example .env
        alembic upgrade head
        uvicorn app.main:app --reload

        ## Проверка

        pytest
        alembic current`}
        />

<TerminalDemo
          title={"чистый прогон"}
          lines={[
            { cmd: "rm -f studyhub.db" },
{ cmd: "alembic upgrade head" },
{ cmd: "pytest" },
{ out: "all tests passed" },
{ cmd: "uvicorn app.main:app --reload" },
{ out: "Application startup complete" }
          ]}
        />

<TypeCards>
          <TypeCard badge={"setup"} title={"Установка"} code={`python -m venv .venv`}>
            {"Версия Python и зависимости."}
          </TypeCard>
          <TypeCard badge={"db"} badgeTone={"float"} title={"Подготовка базы"} code={`cp .env.example .env`}>
            {"DATABASE_URL и upgrade head."}
          </TypeCard>
          <TypeCard badge={"demo"} badgeTone={"str"} title={"Проверка"} code={`http GET :8000/tasks`}>
            {"pytest, docs и HTTP-примеры."}
          </TypeCard>
        </TypeCards>

<Callout tone={"info"}>
  {"README проверяется другим человеком или чистым окружением, а не только автором проекта."}
</Callout>
      </Section>

      <Section number={"07"} title={"Защита и границы следующего этапа"}>
        <Lead>
  {"На защите ученик показывает воспроизводимость, связанный сценарий и объясняет ключевые пары понятий. Новые технологии не добавляются в последний момент."}
</Lead>

<CodeSequence
          title={"Соберите защиту"}
          prompt={"Расположите демонстрацию от чистой базы до объяснения."}
          pieces={[
            { id: "clean", code: `удалить demo-базу` },
{ id: "migrate", code: `alembic upgrade head` },
{ id: "tests", code: `pytest` },
{ id: "run", code: `запустить FastAPI` },
{ id: "category", code: `создать категорию` },
{ id: "task", code: `создать связанную задачу` },
{ id: "explain", code: `объяснить request → Session → ORM → response` },
{ id: "jwt", code: `добавить JWT на защите`, note: "следующий этап" }
          ]}
          correctOrder={["clean", "migrate", "tests", "run", "category", "task", "explain"]}
          explanation={"Защита доказывает воспроизводимость, корректность и понимание."}
        />

<BugHunt
          code={`@pytest.fixture
        def client():
            return TestClient(app)

        # get_db использует рабочий DATABASE_URL`}
          question={"Почему тест опасен?"}
          options={["Он меняет локальную базу", "TestClient запрещён", "Fixture должна называться db"]}
          correctIndex={0}
          explanation={"Без override приложение открывает обычную Session."}
          fix={`@pytest.fixture
        def client():
            app.dependency_overrides[get_db] = override_get_db

            with TestClient(app) as test_client:
                yield test_client

            app.dependency_overrides.clear()`}
        />

<MethodGrid
          rows={[
            [<>{"Pydantic vs ORM"}</>, "контракт данных против отображения таблицы"],
            [<>{"Engine vs Session"}</>, "подключения против единицы работы"],
            [<>{"ForeignKey vs relationship"}</>, "целостность против навигации"],
            [<>{"rollback"}</>, "восстановление Session после ошибки"],
            [<>{"Alembic"}</>, "версионирование схемы"],
            [<>{"следующий этап"}</>, "users, authentication, authorization"]
          ]}
        />

<Callout tone={"info"}>
  {"JWT, пользователи, Docker и async намеренно не входят в финальный commit этапа 4."}
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
            question={"Что создаёт схему на чистой базе?"}
            options={["alembic upgrade head", "первый endpoint", "response_model"]}
            correctIndex={0}
            explanation={"Migration history является путём схемы."}
          />

          <QuizCard
            question={"Зачем override get_db?"}
            options={["дать тестовую Session", "изменить method", "создать relationship"]}
            correctIndex={0}
            explanation={"Тесты изолируются от рабочей базы."}
          />

          <QuizCard
            question={"Где находится SQL списка?"}
            options={["crud", "schema", "README"]}
            correctIndex={0}
            explanation={"CRUD управляет Session и select."}
          />

          <QuizCard
            question={"Что отложено?"}
            options={["пользователи и authentication", "ForeignKey", "Alembic"]}
            correctIndex={0}
            explanation={"Безопасность начинается в следующем этапе."}
          />
        </div>

<KeyTakeaways
          points={[
            <>{"StudyHub Database API является цельным синхронным приложением."}</>,
            <>{"Слои разделены по причинам изменения."}</>,
            <>{"Session создаётся на запрос и подменяется в тестах."}</>,
            <>{"Связи защищены ForeignKey и доступны через relationship."}</>,
            <>{"N+1 диагностируется логом и исправляется явной загрузкой."}</>,
            <>{"Alembic воспроизводит и развивает схему."}</>,
            <>{"README и тесты делают проект проверяемым."}</>
          ]}
        />

<PracticeCta text={"Соберите финальный StudyHub Database API, прогоните его с чистой базы и подготовьте семиминутную защиту: migrations, tests, связанный POST/GET и объяснение архитектуры."} />
      </Section>
    </RichLesson>
  );
}

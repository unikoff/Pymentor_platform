import { Boxes, GitFork } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 16 · Связи, Alembic и Database API";

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

      <TheoryBridge link={"CRUD задач и категорий уже работает через Session. Теперь база должна хранить проверяемую связь между строками, а не повторяющийся текст категории."} boundary={"Foreign key хранит идентификатор и защищает ссылку. Он не загружает объект Category и не заменяет relationship."} />

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

import { Braces, Link2 } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 16 · Связи, Alembic и Database API";

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

      <TheoryBridge link={"ForeignKey уже хранит category_id и защищает ссылку. Теперь та же связь должна стать удобной для Python-кода и API-ответа."} boundary={"relationship не создаёт колонку и не заменяет ForeignKey. Он описывает навигацию ORM-объектов и стратегию их загрузки."} />

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

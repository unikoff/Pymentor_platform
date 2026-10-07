import { Layers, Search } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 16 · Связи, Alembic и Database API";

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

      <TheoryBridge link={"relationship уже даёт task.category. Теперь нужно понять, что удобный атрибут может выполнить дополнительный SQL-запрос."} boundary={"N+1 — конкретный шаблон: один запрос списка плюс дополнительные запросы связанных данных, а не название любого медленного endpoint."} />

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

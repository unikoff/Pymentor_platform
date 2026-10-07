import { Boxes, Braces } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, FillBlank, KeyTakeaways, Lead, MatchPairs, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 14 · SQLite и основы SQLAlchemy";

export function Lesson77({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Declarative Base и ORM-модель"}
        intro={"Опишем реляционную форму задачи через современный declarative API SQLAlchemy 2.x: Base, metadata, Mapped, mapped_column, primary key и чёткое разделение ORM-модели с Pydantic-контрактами."}
        tags={[
          { icon: <Boxes size={14} />, label: "ORM mapping" },
          { icon: <Braces size={14} />, label: "модель и metadata" },
        ]}
      />
      <TheoryBridge link={"Engine знает, куда подключаться, но ещё не знает форму таблицы tasks. Declarative mapping связывает Python-класс, таблицу и SQLAlchemy metadata."} boundary={"ORM-модель описывает хранение, а Pydantic-схема описывает внешний HTTP-контракт. Совпадающие поля не делают их одной сущностью."} />

      <Section number="01" title="Engine знает адрес, но не форму данных">
        <Lead>
          {"Engine умеет подключиться к SQLite, однако ещё не знает, что такое задача StudyHub. ORM-модель добавляет mapping — явное соответствие между Python-классом, таблицей и колонками."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>{"Создать базовый класс:"}</strong> {"DeclarativeBase хранит registry и metadata."}</li>
            <li><strong>{"Объявить модель:"}</strong> {"TaskModel связывается с таблицей tasks."}</li>
            <li><strong>{"Описать поля:"}</strong> {"Mapped и mapped_column задают Python-тип и параметры колонки."}</li>
            <li><strong>{"Развести контракты:"}</strong> {"ORM-модель не заменяет TaskCreate и TaskRead."}</li>
          </ol>
          <p>{"После занятия таблица ещё не обязана существовать физически. Сначала строим точное описание."}</p>
        </div>

        <TypeCards>
          <TypeCard badge="class" title="Python-объект" code={"TaskModel(title=\"SQL\")"}>
            {"Удобная форма работы внутри приложения."}
          </TypeCard>
          <TypeCard badge="table" badgeTone="float" title="Строка tasks" code={"id=1, title=SQL"}>
            {"Форма хранения в реляционной базе."}
          </TypeCard>
          <TypeCard badge="mapping" badgeTone="str" title="Соответствие">
            {"Правило, которое связывает атрибут объекта и колонку таблицы."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"ORM расшифровывается как Object-Relational Mapping. Механизм уменьшает ручное преобразование, но не отменяет понимание таблиц, транзакций и SQL."}
        </Callout>
      </Section>
      <Section number="02" title="DeclarativeBase, registry и metadata">
        <Lead>
          {"Базовый declarative-класс объединяет ORM-модели одного приложения. Через него SQLAlchemy регистрирует mappings, а metadata собирает описание таблиц, колонок и ограничений."}
        </Lead>

        <CodeBlock
          caption="app/database.py"
          code={`from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass`}
        />

        <MethodGrid
          rows={[
            [<>Base</>, "общий предок ORM-моделей приложения"],
            [<>registry</>, "реестр соответствий классов и таблиц"],
            [<>Base.metadata</>, "описание всех зарегистрированных таблиц"],
            [<>DeclarativeBase</>, "современный типизированный declarative API SQLAlchemy 2.x"],
          ]}
        />

        <StepThrough
          code={`class Base(DeclarativeBase):
    pass


class TaskModel(Base):
    __tablename__ = "tasks"
`}
          steps={[
            { line: 0, note: "Создаётся общий базовый класс.", vars: { registry: "создан" } },
            { line: 4, note: "TaskModel наследует declarative-поведение.", vars: { model: "TaskModel" } },
            { line: 5, note: "Имя таблицы попадает в mapping.", vars: { table: "tasks" } },
          ]}
        />

        <TrueFalse
          statement={<>Base.metadata уже является физическим файлом SQLite.</>}
          isTrue={false}
          explanation="Metadata — Python-описание схемы. Физические таблицы создаются отдельной операцией."
        />

        <Callout>
          {"Не создавайте отдельный Base для каждой модели одного проекта. Тогда metadata окажется раздробленной и создание схемы станет неполным."}
        </Callout>
      </Section>
      <Section number="03" title="Mapped и mapped_column: типизированное поле модели">
        <Lead>
          {"SQLAlchemy 2.x разделяет аннотацию атрибута и параметры колонки. Mapped[T] сообщает тип значения на Python-стороне, а mapped_column настраивает хранение и ограничения."}
        </Lead>

        <CodeBlock
          caption="минимальная модель"
          code={`from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TaskModel(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]`}
        />

        <MatchPairs
          prompt="Соедините элемент объявления и его роль."
          pairs={[
            { left: "id: Mapped[int]", right: "тип атрибута ORM-объекта" },
            { left: "mapped_column(...)", right: "конфигурация колонки" },
            { left: "primary_key=True", right: "уникальная идентичность строки" },
            { left: "__tablename__", right: "имя таблицы в базе" },
          ]}
          explanation="Аннотация и параметры работают вместе, но отвечают за разные аспекты mapping."
        />

        <FillBlank
          prompt="Укажите общий базовый класс ORM-модели."
          before="class TaskModel("
          after="):"
          options={["Base", "Session", "TaskCreate"]}
          answer="Base"
          explanation="Declarative-модель наследуется от общего Base."
        />

        <Callout tone="info">
          {"Mapped[str] не является Pydantic-валидацией request body. Это аннотация mapped-атрибута ORM."}
        </Callout>
      </Section>
      <Section number="04" title="Полная TaskModel: ключ, обязательность и defaults">
        <Lead>
          {"Перенесём знакомые поля Planner API в таблицу. Каждое решение должно иметь причину: id создаётся базой, title обязателен, description может отсутствовать, priority и is_done получают серверные значения по умолчанию."}
        </Lead>

        <CodeBlock
          caption="app/models.py"
          code={`from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TaskModel(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    priority: Mapped[int] = mapped_column(default=3)
    is_done: Mapped[bool] = mapped_column(default=False)`}
        />

        <TypeCards>
          <TypeCard badge="PK" title="id" code={"primary_key=True"}>
            {"Стабильный идентификатор строки. Для SQLite integer primary key генерируется при вставке."}
          </TypeCard>
          <TypeCard badge="required" badgeTone="float" title="title" code={"Mapped[str]"}>
            {"В модели поле не допускает None; длина строки ограничена выбранным типом."}
          </TypeCard>
          <TypeCard badge="optional" badgeTone="str" title="description" code={"Mapped[str | None]"}>
            {"Отсутствие описания является допустимым состоянием записи."}
          </TypeCard>
        </TypeCards>

        <RecallCard
          question="Почему id не передаётся клиентом при создании задачи?"
          answer={<p>{"Идентификатор относится к внутренней идентичности записи и назначается системой хранения, чтобы избежать конфликтов и подделки."}</p>}
        />
      </Section>
      <Section number="05" title="nullable и default отвечают на разные вопросы">
        <Lead>
          {"nullable определяет, может ли колонка хранить SQL NULL. default определяет значение, которое SQLAlchemy подставит при INSERT, если атрибут не был задан. Эти параметры нельзя считать синонимами optional-поля HTTP."}
        </Lead>

        <CompareSolutions
          question="Как описать необязательное текстовое описание?"
          left={{
            title: "Только default",
            code: "description: Mapped[str] = mapped_column(default=\"\")",
            note: "Колонка хранит пустую строку, а не отсутствие значения.",
          }}
          right={{
            title: "Допустимый NULL",
            code: "description: Mapped[str | None] = mapped_column(nullable=True)",
            note: "None явно представляет отсутствие описания.",
          }}
          preferred="right"
          explanation="Выбор зависит от доменной модели: пустая строка и отсутствие значения — разные состояния."
        />

        <BugHunt
          code={`class TaskModel(Base):
    __tablename__ = "tasks"

    title: Mapped[str | None]
`}
          question="Какой обязательный элемент модели отсутствует?"
          options={[
            "primary key",
            "HTTP method",
            "Pydantic validator",
          ]}
          correctIndex={0}
          explanation="ORM-модель таблицы должна иметь первичный ключ, чтобы SQLAlchemy идентифицировала строки."
          fix={`class TaskModel(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str | None]`}
        />

        <TrueFalse
          statement={<>default=False автоматически меняет существующие строки любой старой таблицы.</>}
          isTrue={false}
          explanation="Default участвует в новых INSERT. Изменение существующей схемы и данных позже выполняется миграцией."
        />
      </Section>
      <Section number="06" title="ORM-модель и Pydantic-схемы — разные границы">
        <Lead>
          {"TaskCreate обслуживает входной HTTP-контракт, TaskRead — выходной, а TaskModel — постоянное хранение. Профессиональная структура не смешивает пароль, служебный id и внутренние поля с тем, что разрешено клиенту."}
        </Lead>

        <CodeBlock
          caption="schemas.py и models.py"
          code={`# schemas.py
class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    priority: int = 3


class TaskRead(TaskCreate):
    id: int
    is_done: bool


# models.py
class TaskModel(Base):
    __tablename__ = "tasks"
    # mapped columns...`}
        />

        <MethodGrid
          rows={[
            [<>TaskCreate</>, "что клиент может прислать при создании"],
            [<>TaskRead</>, "что API обещает вернуть"],
            [<>TaskModel</>, "как данные представлены в ORM и таблице"],
            [<>response_model</>, "фильтрация и сериализация HTTP-ответа"],
          ]}
        />

        <CompareSolutions
          question="Почему не принимать TaskModel прямо в request body?"
          left={{
            title: "Одна модель для всего",
            code: "def create_task(payload: TaskModel): ...",
            note: "HTTP-контракт смешивается с persistence-слоем.",
          }}
          right={{
            title: "Раздельные контракты",
            code: "def create_task(payload: TaskCreate): ...",
            note: "Клиент получает только разрешённые поля.",
          }}
          preferred="right"
          explanation="Разные границы меняются по разным причинам и требуют разных правил."
        />

        <Callout tone="info">
          {"Совпадение title или priority между схемами нормально. Дублируется форма данных, но не ответственность объектов."}
        </Callout>
      </Section>
      <Section number="07" title="Регистрация модели и направление импортов">
        <Lead>
          {"Declarative mapping появляется, когда Python выполняет тело класса. Значит, модуль models должен быть импортирован до операций с Base.metadata. Это не магическое сканирование файлов."}
        </Lead>

        <BranchExplorer
          code={`import app.models
  ↓
TaskModel class body executes
  ↓
tasks Table joins Base.metadata
  ↓
Base.metadata knows "tasks"
  ↓
create_all can create table`}
          scenarios={[
            { label: "models импортирован", activeLine: 3, output: "metadata содержит tasks" },
            { label: "models не импортирован", activeLine: 2, output: "таблица не зарегистрирована" },
            { label: "следующий урок", activeLine: 4, output: "metadata материализуется в SQLite" },
          ]}
        />

        <CodeBlock
          caption="проверяем зарегистрированные таблицы"
          code={`from app import models
from app.database import Base

print(Base.metadata.tables.keys())`}
        />

        <PredictOutput
          code={`print(list(Base.metadata.tables.keys()))`}
          output="['tasks']"
          hint="Модель TaskModel уже была импортирована и зарегистрирована."
        />

        <Callout>
          {"Не исправляйте проблему случайными импортами внутри каждой функции. Определите понятную точку, где приложение загружает все модели перед созданием схемы."}
        </Callout>
      </Section>
      <Section number="08" title="Контрольная точка">
        <Lead>
          {"Соберите модель занятия целиком: назовите назначение механизма, проследите путь данных, объясните границу применения и только затем переходите к практической проверке."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что означает ORM mapping?"}
            options={[
              "соответствие класса и таблицы",
              "копирование JSON в файл",
              "запуск HTTP-сервера",
            ]}
            correctIndex={0}
            explanation={"Mapping связывает объекты и реляционную структуру."}
          />
          <QuizCard
            question={"Что хранит Base.metadata?"}
            options={[
              "описание зарегистрированных таблиц",
              "открытую Session",
              "готовые HTTP-ответы",
            ]}
            correctIndex={0}
            explanation={"Metadata является каталогом схемы на Python-стороне."}
          />
          <QuizCard
            question={"Как объявляется mapped-тип SQLAlchemy 2.x?"}
            options={[
              "Mapped[int]",
              "Field[int]",
              "Session[int]",
            ]}
            correctIndex={0}
            explanation={"Mapped используется для типизированных ORM-атрибутов."}
          />
          <QuizCard
            question={"Почему TaskCreate не заменяет TaskModel?"}
            options={[
              "они обслуживают разные границы",
              "Pydantic не работает со строками",
              "ORM не поддерживает id",
            ]}
            correctIndex={0}
            explanation={"Одна схема описывает HTTP-вход, другая модель — хранение."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"ORM mapping связывает Python-класс и реляционную таблицу."}</>,
            <>{"DeclarativeBase предоставляет общий registry и metadata."}</>,
            <>{"Mapped и mapped_column описывают атрибут и колонку."}</>,
            <>{"ORM-модель должна иметь primary key."}</>,
            <>{"nullable и default решают разные задачи."}</>,
            <>{"Pydantic-схемы и ORM-модели нельзя смешивать."}</>,
            <>{"Модель регистрируется в metadata во время импорта модуля."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Критерии готовности"}</h3>
          <ul>
            <li>{"объясняете термин ORM mapping"}</li>
            <li>{"создаёте один общий DeclarativeBase"}</li>
            <li>{"корректно используете Mapped и mapped_column"}</li>
            <li>{"различаете ORM-модель и Pydantic-схему"}</li>
          </ul>
        </div>

        <PracticeCta text={"Создайте Base и TaskModel с полями id, title, description, priority и is_done. Выведите Base.metadata.tables и отдельно выпишите, какие поля принадлежат TaskCreate, TaskRead и TaskModel."} />
      </Section>
    </RichLesson>
  );
}

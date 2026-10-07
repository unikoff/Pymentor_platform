import { FileText, Save } from "lucide-react";
import { BugHunt, Callout, CodeBlock, CodeSequence, CompareSolutions, FlipCards, KeyTakeaways, Lead, MatchPairs, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 14 · SQLite и основы SQLAlchemy";

export function Lesson78({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Создание таблиц и просмотр SQLite"}
        intro={"Материализуем ORM-описание в настоящую таблицу SQLite: разберём create_all, порядок импорта моделей, DDL в echo-логах, проверку через sqlite_master и границу между первичным созданием и миграциями."}
        tags={[
          { icon: <Save size={14} />, label: "создание схемы" },
          { icon: <FileText size={14} />, label: "проверка SQLite" },
        ]}
      />
      <TheoryBridge link={"После регистрации модели metadata хранит описание таблицы. Теперь материализуем это описание в SQLite и проверим результат не только через Python-код."} boundary={"create_all создаёт отсутствующие таблицы, но не ведёт историю изменений схемы и не заменяет Alembic."} />

      <Section number="01" title="Описание схемы ещё не создаёт таблицу">
        <Lead>
          {"TaskModel зарегистрировала таблицу tasks в Base.metadata, но пока это только Python-описание. Физическая таблица появляется после DDL-команды CREATE TABLE, выполненной через Engine."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>{"Проверить metadata:"}</strong> {"убедиться, что tasks зарегистрирована."}</li>
            <li><strong>{"Материализовать схему:"}</strong> {"вызвать Base.metadata.create_all(engine)."} </li>
            <li><strong>{"Посмотреть SQL:"}</strong> {"прочитать CREATE TABLE в echo-логах."}</li>
            <li><strong>{"Проверить базу извне:"}</strong> {"использовать sqlite_master и PRAGMA table_info."}</li>
          </ol>
          <p>{"Результат занятия — воспроизводимый скрипт и доказательство, что таблица существует в самом SQLite-файле."}</p>
        </div>

        <CompareSolutions
          question="Где сейчас существует схема tasks?"
          left={{
            title: "Только в metadata",
            code: "Base.metadata.tables[\"tasks\"]",
            note: "Python знает описание, но файл базы может быть пуст.",
          }}
          right={{
            title: "В SQLite",
            code: "CREATE TABLE tasks (...)",
            note: "Схема зафиксирована в каталоге базы.",
          }}
          preferred="both"
          explanation="После create_all одна и та же структура представлена и в metadata, и в физической базе."
        />

        <Callout tone="info">
          {"Metadata и database schema связаны, но не синхронизируются автоматически при каждом изменении Python-класса."}
        </Callout>
      </Section>
      <Section number="02" title="create_all: создать отсутствующие таблицы">
        <Lead>
          {"Метод create_all проходит по таблицам metadata, проверяет их наличие и отправляет DDL для отсутствующих объектов. Engine определяет, куда именно выполнять команды."}
        </Lead>

        <CodeBlock
          caption="scripts/create_tables.py"
          code={`from app import models
from app.database import Base, engine


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    create_tables()`}
        />

        <CodeSequence
          title="Соберите запуск создания схемы"
          prompt="Поставьте действия в порядке, необходимом для заполнения metadata и выполнения DDL."
          pieces={[
            { id: "models", code: "import app.models" },
            { id: "base", code: "from app.database import Base, engine" },
            { id: "call", code: "Base.metadata.create_all(bind=engine)" },
            { id: "inspect", code: "проверить таблицу в SQLite" },
            { id: "wrong", code: "создать новую Base после модели", note: "получится другая metadata" },
          ]}
          correctOrder={["models", "base", "call", "inspect"]}
          explanation="Сначала model class должна зарегистрировать Table, затем metadata может создать её через Engine."
        />

        <TrueFalse
          statement={<>create_all автоматически удалит существующую таблицу и создаст её заново.</>}
          isTrue={false}
          explanation="Метод создаёт отсутствующие таблицы и не выполняет разрушительную пересборку существующих."
        />

        <Callout>
          {"Скрипт создания схемы запускается явно. Не прячьте необратимые операции с базой в случайный import."}
        </Callout>
      </Section>
      <Section number="03" title="Почему import models обязателен">
        <Lead>
          {"Base.metadata узнаёт о таблицах только после выполнения декларативных классов. Если create_tables импортирует Base, но ни разу не импортирует TaskModel, список metadata будет пустым."}
        </Lead>

        <BugHunt
          code={`from app.database import Base, engine

Base.metadata.create_all(bind=engine)
print(Base.metadata.tables.keys())`}
          question="Почему create_all может не создать tasks?"
          options={[
            "модуль с TaskModel не был импортирован",
            "метод должен называться create_one",
            "SQLite запрещает metadata",
          ]}
          correctIndex={0}
          explanation="Класс TaskModel ещё не выполнился и не зарегистрировал таблицу."
          fix={`from app import models
from app.database import Base, engine

Base.metadata.create_all(bind=engine)
print(Base.metadata.tables.keys())`}
        />

        <StepThrough
          code={`from app import models
from app.database import Base, engine

print(Base.metadata.tables.keys())
Base.metadata.create_all(bind=engine)`}
          steps={[
            { line: 0, note: "Импорт выполняет class TaskModel.", vars: { registered: "tasks" } },
            { line: 1, note: "Получаем тот же Base и Engine.", vars: { metadata: "общая" } },
            { line: 3, note: "Проверяем каталог таблиц до DDL.", vars: { keys: "tasks" } },
            { line: 4, note: "create_all отправляет DDL через Engine.", vars: { SQLite: "CREATE TABLE" } },
          ]}
        />

        <RecallCard
          question="Почему SQLAlchemy не ищет модели по всем файлам проекта автоматически?"
          answer={<p>{"Python-модуль должен быть импортирован, чтобы определения классов выполнились. Явный импорт делает регистрацию предсказуемой."}</p>}
        />
      </Section>
      <Section number="04" title="Читаем CREATE TABLE в echo-логах">
        <Lead>
          {"Параметр echo=True превращает скрытую ORM-операцию в наблюдаемый SQL. Ученик должен уметь сопоставить mapped_column с колонкой и ограничением в CREATE TABLE."}
        </Lead>

        <TerminalDemo
          title="первый запуск create_tables"
          lines={[
            { cmd: "python -m scripts.create_tables" },
            { out: "PRAGMA main.table_info(\"tasks\")" },
            { out: "CREATE TABLE tasks (" },
            { out: "  id INTEGER NOT NULL," },
            { out: "  title VARCHAR(120) NOT NULL," },
            { out: "  description VARCHAR(500)," },
            { out: "  priority INTEGER NOT NULL," },
            { out: "  is_done BOOLEAN NOT NULL," },
            { out: "  PRIMARY KEY (id)" },
            { out: ")" },
          ]}
        />

        <MatchPairs
          prompt="Соедините ORM-объявление и фрагмент DDL."
          pairs={[
            { left: "primary_key=True", right: "PRIMARY KEY (id)" },
            { left: "String(120)", right: "VARCHAR(120)" },
            { left: "Mapped[str]", right: "NOT NULL" },
            { left: "Mapped[str | None]", right: "колонка без NOT NULL" },
          ]}
          explanation="Echo-лог позволяет проверить, как mapping превращается в реальную схему."
        />

        <Callout tone="info">
          {"Конкретный DDL немного зависит от диалекта. Мы читаем смысл ограничений, а не заучиваем точное форматирование лога."}
        </Callout>
      </Section>
      <Section number="05" title="Повторный запуск и идемпотентность create_all">
        <Lead>
          {"Скрипт можно запустить повторно: create_all сначала проверит наличие таблицы и не создаст вторую tasks. Такое поведение удобно для первого учебного старта, но не является историей миграций."}
        </Lead>

        <TerminalDemo
          title="второй запуск"
          lines={[
            { cmd: "python -m scripts.create_tables" },
            { out: "PRAGMA main.table_info(\"tasks\")" },
            { out: "таблица уже существует; CREATE TABLE не выполняется" },
          ]}
        />

        <PredictOutput
          code={`Base.metadata.create_all(bind=engine)
Base.metadata.create_all(bind=engine)

print("done")`}
          output="done"
          hint="Второй вызов проверяет существование и не создаёт дубликат таблицы."
        />

        <TrueFalse
          statement={<>Если добавить колонку due_date в TaskModel, повторный create_all гарантированно изменит старую таблицу.</>}
          isTrue={false}
          explanation="create_all не является инструментом эволюции существующей схемы."
        />

        <Callout>
          {"Идемпотентность означает, что повтор операции не меняет итог после первого успешного применения. Она не означает автоматическую миграцию."}
        </Callout>
      </Section>
      <Section number="06" title="Проверяем таблицу средствами самой SQLite">
        <Lead>
          {"Профессиональная проверка не ограничивается сообщением «скрипт не упал». SQLite хранит каталог объектов, который можно запросить через sqlite_master, а PRAGMA table_info показывает колонки."}
        </Lead>

        <CodeBlock
          caption="scripts/inspect_database.py"
          code={`from sqlalchemy import text

from app.database import engine

with engine.connect() as connection:
    table_names = connection.execute(
        text(
            "SELECT name "
            "FROM sqlite_master "
            "WHERE type = 'table' "
            "ORDER BY name"
        )
    ).scalars().all()

    columns = connection.execute(
        text("PRAGMA table_info(tasks)")
    ).mappings().all()

print(table_names)
for column in columns:
    print(column["name"], column["type"], column["notnull"])`}
        />

        <TerminalDemo
          title="структура физической таблицы"
          lines={[
            { cmd: "python -m scripts.inspect_database" },
            { out: "['tasks']" },
            { out: "id INTEGER 1" },
            { out: "title VARCHAR(120) 1" },
            { out: "description VARCHAR(500) 0" },
            { out: "priority INTEGER 1" },
            { out: "is_done BOOLEAN 1" },
          ]}
        />

        <RecallCard
          question="Что доказывает PRAGMA table_info(tasks)?"
          answer={<p>{"Команда читает структуру таблицы из каталога SQLite и подтверждает имена, типы и признаки обязательности колонок."}</p>}
        />

        <Callout tone="info">
          {"Визуальный SQLite Browser полезен, но текстовый скрипт воспроизводим и может войти в автоматическую диагностику."}
        </Callout>
      </Section>
      <Section number="07" title="Почему create_all не заменяет Alembic">
        <Lead>
          {"На старте база пустая, поэтому create_all достаточно для материализации первой схемы. Когда в базе появятся данные, изменение модели должно стать контролируемой последовательностью версий — миграцией."}
        </Lead>

        <CompareSolutions
          question="Какой инструмент отвечает на поставленный вопрос?"
          left={{
            title: "create_all",
            code: "создать отсутствующие таблицы",
            note: "Подходит для первой учебной схемы и временных баз.",
          }}
          right={{
            title: "Alembic",
            code: "versioned schema migration",
            note: "Позволяет применить и отследить изменение существующей схемы.",
          }}
          preferred="both"
          explanation="Инструменты не конкурируют напрямую: у них разные области ответственности."
        />

        <CodeBlock
          caption="изменение, которое create_all не проведёт как миграцию"
          code={`class TaskModel(Base):
    __tablename__ = "tasks"

    # ...
    due_date: Mapped[date | None]`}
        />

        <FlipCards
          cards={[
            { front: <>Создать пустую тестовую базу</>, back: <>create_all может быть уместен</> },
            { front: <>Добавить колонку в рабочую базу</>, back: <>нужна миграция Alembic</> },
            { front: <>Сохранить историю схемы</>, back: <>Alembic revision</> },
          ]}
        />

        <Callout>
          {"Alembic появится в блоке 16. Сейчас важно не применять опасный совет «удалите файл базы и создайте заново» как универсальное решение."}
        </Callout>
      </Section>
      <Section number="08" title="Контрольная точка">
        <Lead>
          {"Соберите модель занятия целиком: назовите назначение механизма, проследите путь данных, объясните границу применения и только затем переходите к практической проверке."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что делает create_all?"}
            options={[
              "создаёт отсутствующие таблицы",
              "обновляет любой столбец",
              "выполняет HTTP-запрос",
            ]}
            correctIndex={0}
            explanation={"Метод материализует отсутствующие объекты metadata."}
          />
          <QuizCard
            question={"Почему нужно импортировать models?"}
            options={[
              "зарегистрировать таблицы в metadata",
              "открыть браузер",
              "создать Pydantic JSON",
            ]}
            correctIndex={0}
            explanation={"Declarative classes регистрируются при выполнении модуля."}
          />
          <QuizCard
            question={"Что показывает echo=True?"}
            options={[
              "выполняемый SQL",
              "содержимое request body",
              "Git diff",
            ]}
            correctIndex={0}
            explanation={"Engine логирует SQL и параметры."}
          />
          <QuizCard
            question={"Для чего позже нужен Alembic?"}
            options={[
              "версионировать изменения схемы",
              "заменить FastAPI",
              "создавать Python-классы",
            ]}
            correctIndex={0}
            explanation={"Миграции управляют эволюцией существующей базы."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Metadata является описанием схемы на Python-стороне."}</>,
            <>{"create_all создаёт отсутствующие таблицы через Engine."}</>,
            <>{"Модели должны быть импортированы до работы с metadata."}</>,
            <>{"Echo-лог раскрывает DDL, который выполняет SQLAlchemy."}</>,
            <>{"sqlite_master и PRAGMA проверяют физическую схему."}</>,
            <>{"Повторный create_all не создаёт дубликат таблицы."}</>,
            <>{"create_all не заменяет миграции существующей схемы."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Критерии готовности"}</h3>
          <ul>
            <li>{"показываете разницу metadata и физической таблицы"}</li>
            <li>{"создаёте tasks через create_all"}</li>
            <li>{"объясняете необходимость import models"}</li>
            <li>{"проверяете схему независимо от ORM-класса"}</li>
          </ul>
        </div>

        <PracticeCta text={"Создайте scripts/create_tables.py и scripts/inspect_database.py. Запустите создание дважды, прочитайте echo-лог, затем подтвердите наличие tasks и её пяти колонок через SQLite-каталог."} />
      </Section>
    </RichLesson>
  );
}

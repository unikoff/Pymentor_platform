import { HardDrive, Wrench } from "lucide-react";
import { BranchExplorer, BugHunt, Callout, CodeBlock, CompareSolutions, KeyTakeaways, Lead, MethodGrid, PracticeCta, PredictOutput, QuizCard, RecallCard, RichHero, RichLesson, Section, StepThrough, TerminalDemo, TrueFalse, TypeCard, TypeCards } from "../../shared";
import { TheoryBridge } from "../../shared";
const BLOCK_TITLE = "Блок 14 · SQLite и основы SQLAlchemy";

export function Lesson76({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero
        variant="project"
        chip={module ?? BLOCK_TITLE}
        title={"Engine, URL базы и подключение"}
        intro={"Создадим инфраструктурную точку доступа к SQLite: разберём database URL, роль Engine, отложенное открытие соединения, параметры драйвера и минимальную диагностику без ORM-моделей."}
        tags={[
          { icon: <HardDrive size={14} />, label: "database URL и Engine" },
          { icon: <Wrench size={14} />, label: "диагностика подключения" },
        ]}
      />
      <TheoryBridge link={"После выбора SQLite приложению нужна единая точка подключения. Engine хранит конфигурацию доступа и управляет пулом соединений, но не является открытой Session."} boundary={"Вызов create_engine обычно не выполняет запрос немедленно: фактическое соединение открывается, когда оно понадобится."} />

      <Section number="01" title="От файла базы к точке подключения">
        <Lead>
          {"Мы выбрали SQLite, но приложению всё ещё нужен единый объект, который знает адрес базы, настройки драйвера и способ получать соединения. В SQLAlchemy эту инфраструктурную роль выполняет Engine."}
        </Lead>

        <div className="lesson-route">
          <ol>
            <li><strong>{"Установить инструменты:"}</strong> {"подключить SQLAlchemy 2.x и проверить версию."}</li>
            <li><strong>{"Описать адрес:"}</strong> {"собрать database URL без ручной склейки непонятных строк."}</li>
            <li><strong>{"Создать Engine:"}</strong> {"один раз на уровне модуля database.py."}</li>
            <li><strong>{"Проверить соединение:"}</strong> {"выполнить минимальный диагностический запрос."}</li>
          </ol>
          <p>{"Результат занятия — воспроизводимый database.py, который не создаёт глобальную Session и пока не знает о таблицах."}</p>
        </div>

        <TypeCards>
          <TypeCard badge="driver" title="SQLite driver" code={"sqlite3"}>
            {"Низкоуровневый механизм Python, который умеет общаться с SQLite."}
          </TypeCard>
          <TypeCard badge="toolkit" badgeTone="float" title="SQLAlchemy" code={"sqlalchemy==2.x"}>
            {"Набор Core и ORM-инструментов поверх конкретного database driver."}
          </TypeCard>
          <TypeCard badge="engine" badgeTone="str" title="Engine" code={"create_engine(...)"}>
            {"Центральный объект конфигурации соединений с выбранной базой."}
          </TypeCard>
        </TypeCards>

        <Callout tone="info">
          {"Engine не является базой данных и не является Session. Он соединяет приложение с диалектом и драйвером выбранной СУБД."}
        </Callout>
      </Section>
      <Section number="02" title="Database URL как конфигурационный контракт">
        <Lead>
          {"Database URL сообщает SQLAlchemy, какой диалект использовать и где находится база. Для SQLite путь ведёт к файлу, а для серверной СУБД позже появятся host, port, user и password."}
        </Lead>

        <CodeBlock
          caption="учебная строка подключения"
          code={`DATABASE_URL = "sqlite:///./studyhub.db"`}
        />

        <MethodGrid
          rows={[
            [<>sqlite</>, "диалект SQLAlchemy"],
            [<>///</>, "локальный относительный путь к файлу"],
            [<>./studyhub.db</>, "файл базы относительно рабочей папки"],
            [<>DATABASE_URL</>, "конфигурационное имя, а не открытое соединение"],
          ]}
        />

        <BugHunt
          code={`DATABASE_URL = "sqlite://studyhub.db"`}
          question="Что потеряно в URL локального SQLite-файла?"
          options={[
            "нужное количество косых черт перед путём",
            "HTTP method",
            "имя ORM-модели",
          ]}
          correctIndex={0}
          explanation="Для относительного файла обычно используется форма sqlite:///./studyhub.db."
          fix={`DATABASE_URL = "sqlite:///./studyhub.db"`}
        />

        <Callout>
          {"Строковые URL удобны, но легко ошибиться в разделителях и специальных символах. Далее используем URL.create, чтобы собрать адрес структурированно."}
        </Callout>
      </Section>
      <Section number="03" title="Надёжный путь к файлу через pathlib и URL.create">
        <Lead>
          {"Относительный путь зависит от current working directory. Чтобы database.py работал одинаково из IDE, терминала и тестового запуска, путь строится от расположения самого модуля."}
        </Lead>

        <CodeBlock
          caption="database.py: адрес базы"
          code={`from pathlib import Path

from sqlalchemy import URL

BASE_DIR = Path(__file__).resolve().parent.parent
DB_FILE = BASE_DIR / "studyhub.db"

DATABASE_URL = URL.create(
    drivername="sqlite",
    database=str(DB_FILE),
)`}
        />

        <StepThrough
          code={`BASE_DIR = Path(__file__).resolve().parent.parent
DB_FILE = BASE_DIR / "studyhub.db"
DATABASE_URL = URL.create(
    drivername="sqlite",
    database=str(DB_FILE),
)`}
          steps={[
            { line: 0, note: "Получаем абсолютный путь к корню проекта.", vars: { BASE_DIR: "/project" } },
            { line: 1, note: "Оператор / безопасно добавляет имя файла.", vars: { DB_FILE: "/project/studyhub.db" } },
            { line: 2, note: "URL.create начинает структурированную сборку.", vars: { drivername: "sqlite" } },
            { line: 4, note: "Path превращается в строку для SQLAlchemy URL.", vars: { database: "/project/studyhub.db" } },
          ]}
        />

        <CompareSolutions
          question="Какой вариант меньше зависит от папки запуска?"
          left={{
            title: "Относительная строка",
            code: "sqlite:///./studyhub.db",
            note: "Путь считается от current working directory.",
          }}
          right={{
            title: "Path от __file__",
            code: "URL.create(drivername=\"sqlite\", database=str(DB_FILE))",
            note: "Файл привязан к структуре проекта.",
          }}
          preferred="right"
          explanation="Абсолютный путь устраняет неоднозначность рабочей директории."
        />
      </Section>
      <Section number="04" title="create_engine и отложенное соединение">
        <Lead>
          {"create_engine создаёт Engine с конфигурацией диалекта, драйвера и пула соединений. Важная профессиональная деталь: сам вызов обычно не открывает физическое соединение немедленно — оно запрашивается при первой реальной операции."}
        </Lead>

        <CodeBlock
          caption="создаём Engine один раз"
          code={`from sqlalchemy import create_engine

engine = create_engine(
    DATABASE_URL,
    echo=True,
)`}
        />

        <BranchExplorer
          code={`import database
  ↓
create_engine(...)
  ↓
Engine configured
  ↓
engine.connect()
  ↓
SQLite connection opened`}
          scenarios={[
            { label: "импорт модуля", activeLine: 2, output: "Engine настроен" },
            { label: "первый запрос", activeLine: 4, output: "драйвер открывает соединение" },
            { label: "завершение блока", activeLine: 3, output: "соединение возвращается или закрывается" },
          ]}
        />

        <TrueFalse
          statement={<>Каждый endpoint должен вызывать create_engine заново.</>}
          isTrue={false}
          explanation="Engine является долгоживущим инфраструктурным объектом и обычно создаётся один раз на процесс."
        />

        <Callout tone="info">
          {"Параметр echo=True полезен в учебной среде: SQLAlchemy выводит выполняемые SQL-команды. В production логирование настраивают осознанно."}
        </Callout>
      </Section>
      <Section number="05" title="connect_args и граница check_same_thread">
        <Lead>
          {"В стандартном SQLite-драйвере Python соединение по умолчанию связано с потоком, в котором было создано. Синхронный FastAPI может выполнять работу запроса в thread pool, поэтому в учебной интеграции часто отключают эту проверку."}
        </Lead>

        <CodeBlock
          caption="настройка SQLite для FastAPI"
          code={`engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=True,
)`}
        />

        <TypeCards>
          <TypeCard badge="arg" title="connect_args">
            {"Словарь аргументов, которые SQLAlchemy передаёт конкретному DBAPI-драйверу."}
          </TypeCard>
          <TypeCard badge="SQLite" badgeTone="float" title="check_same_thread">
            {"Проверка принадлежности соединения одному Python-потоку. Это настройка sqlite3, а не универсальный параметр SQLAlchemy."}
          </TypeCard>
          <TypeCard badge="boundary" badgeTone="str" title="Session per request">
            {"Отключение проверки не разрешает делить одну Session между запросами. Время жизни Session всё равно ограничивается."}
          </TypeCard>
        </TypeCards>

        <TrueFalse
          statement={<>check_same_thread=False делает одну глобальную Session безопасной для всех запросов.</>}
          isTrue={false}
          explanation="Параметр относится к соединению SQLite и не отменяет правила владения Session."
        />

        <Callout>
          {"Не копируйте connect_args в проекты с PostgreSQL. Настройки драйвера зависят от конкретной СУБД и должны иметь понятную причину."}
        </Callout>
      </Section>
      <Section number="06" title="Диагностическое соединение без ORM">
        <Lead>
          {"До описания моделей полезно проверить только инфраструктуру: может ли Engine открыть соединение и выполнить минимальный SQL. Такой smoke test отделяет проблему URL от будущих ошибок mapping."}
        </Lead>

        <CodeBlock
          caption="scripts/check_database.py"
          code={`from sqlalchemy import text

from app.database import engine

with engine.connect() as connection:
    value = connection.scalar(text("SELECT 1"))

print(value)`}
        />

        <TerminalDemo
          title="проверяем подключение"
          lines={[
            { cmd: "python -m scripts.check_database" },
            { out: "BEGIN (implicit)" },
            { out: "SELECT 1" },
            { out: "1" },
            { out: "ROLLBACK" },
          ]}
        />

        <PredictOutput
          code={`with engine.connect() as connection:
    value = connection.scalar(text("SELECT 1"))

print(value)`}
          output="1"
          hint="scalar возвращает первое значение первой строки результата."
        />

        <Callout tone="info">
          {"SELECT 1 не проверяет таблицу tasks. Он подтверждает только работоспособность URL, драйвера и соединения."}
        </Callout>
      </Section>
      <Section number="07" title="Итоговый database.py и диагностика ошибок">
        <Lead>
          {"Соберём модуль без моделей и Session. Его ответственность узкая: определить путь, создать database URL и настроить один Engine."}
        </Lead>

        <CodeBlock
          caption="app/database.py"
          code={`from pathlib import Path

from sqlalchemy import URL, create_engine

BASE_DIR = Path(__file__).resolve().parent.parent
DB_FILE = BASE_DIR / "studyhub.db"

DATABASE_URL = URL.create(
    drivername="sqlite",
    database=str(DB_FILE),
)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=True,
)`}
        />

        <BugHunt
          code={`def create_task():
    engine = create_engine(DATABASE_URL)
    # работа endpoint`}
          question="Почему создание Engine внутри endpoint является плохой границей?"
          options={[
            "инфраструктура создаётся повторно для каждого запроса",
            "FastAPI запрещает функции",
            "SQLite не поддерживает Engine",
          ]}
          correctIndex={0}
          explanation="Engine должен быть долгоживущим и переиспользовать конфигурацию соединений."
          fix={`# database.py
engine = create_engine(DATABASE_URL)

# routers/tasks.py
def create_task():
    # использует Session, связанную с общим engine
    ...`}
        />

        <RecallCard
          question="Чем Engine отличается от открытого connection?"
          answer={<p>{"Engine хранит стратегию и конфигурацию доступа. Connection — конкретный выделенный канал работы с базой на ограниченное время."}</p>}
        />
      </Section>
      <Section number="08" title="Контрольная точка">
        <Lead>
          {"Соберите модель занятия целиком: назовите назначение механизма, проследите путь данных, объясните границу применения и только затем переходите к практической проверке."}
        </Lead>

        <div className="lesson-check-group">
          <QuizCard
            question={"Что описывает database URL?"}
            options={[
              "диалект и адрес базы",
              "Pydantic-схему",
              "HTTP status",
            ]}
            correctIndex={0}
            explanation={"URL задаёт способ и место подключения."}
          />
          <QuizCard
            question={"Когда обычно открывается физическое соединение?"}
            options={[
              "при первой операции",
              "в момент объявления класса",
              "при импорте любого router",
            ]}
            correctIndex={0}
            explanation={"Engine использует lazy initialization соединения."}
          />
          <QuizCard
            question={"Где обычно создаётся Engine?"}
            options={[
              "один раз в database.py",
              "в каждом endpoint",
              "в каждой Pydantic-схеме",
            ]}
            correctIndex={0}
            explanation={"Engine является долгоживущей инфраструктурой."}
          />
          <QuizCard
            question={"Что подтверждает SELECT 1?"}
            options={[
              "работу соединения",
              "наличие всех таблиц",
              "корректность CRUD",
            ]}
            correctIndex={0}
            explanation={"Это минимальная проверка инфраструктуры подключения."}
          />
        </div>

        <KeyTakeaways
          points={[
            <>{"Database URL является конфигурацией доступа к СУБД."}</>,
            <>{"Path от __file__ устраняет зависимость от папки запуска."}</>,
            <>{"Engine создаётся один раз и управляет подключениями."}</>,
            <>{"create_engine обычно не открывает соединение немедленно."}</>,
            <>{"connect_args относятся к конкретному DBAPI-драйверу."}</>,
            <>{"Smoke test отделяет проблемы подключения от проблем ORM."}</>,
          ]}
        />

        <div className="lesson-practice-steps">
          <h3>{"Критерии готовности"}</h3>
          <ul>
            <li>{"объясняете состав database URL"}</li>
            <li>{"различаете Engine и Connection"}</li>
            <li>{"не создаёте Engine внутри endpoint"}</li>
            <li>{"получаете результат SELECT 1 из SQLite"}</li>
          </ul>
        </div>

        <PracticeCta text={"Создайте app/database.py, соберите абсолютный путь к studyhub.db, настройте Engine с echo=True и выполните отдельный скрипт SELECT 1. Затем запустите его из двух разных рабочих папок."} />
      </Section>
    </RichLesson>
  );
}

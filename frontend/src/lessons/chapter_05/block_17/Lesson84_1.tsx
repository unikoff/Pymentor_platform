import { CodeBlock, Lead, LinkedNotes, RichHero, RichLesson, Section } from "../../shared";

const metadataExample = `from sqlalchemy import Integer, String, create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class Book(Base):
    __tablename__ = "books"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    note: Mapped[str | None] = mapped_column(String, nullable=True)

engine = create_engine("sqlite:///:memory:")
with engine.begin() as connection:
    connection.execute(text("CREATE TABLE books (id INTEGER PRIMARY KEY)"))
    connection.execute(text("INSERT INTO books (id) VALUES (1)"))
Base.metadata.create_all(engine)
print(list(Base.metadata.tables["books"].columns.keys()))
print(str(Book.__table__.c.note.type), Book.__table__.c.note.nullable)
print([column["name"] for column in inspect(engine).get_columns("books")])
engine.dispose()`;

const labModel = `from sqlalchemy import Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    pass

class Book(Base):
    __tablename__ = "books"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)`;

const labCommands = `# Из project/, PowerShell; lab_books создаём только для примера.
New-Item -ItemType Directory -Path lab_books
Set-Location lab_books
../.venv/Scripts/python.exe -m alembic init migrations
# Настройте alembic.ini и migrations/env.py, как описано ниже.
../.venv/Scripts/python.exe -m alembic revision -m "books baseline"
# Заполните созданный файл baseline показанными операциями.
../.venv/Scripts/python.exe -m alembic upgrade head
../.venv/Scripts/python.exe -m alembic current
../.venv/Scripts/python.exe -m alembic heads`;

const labRevision = `# Оставляем сгенерированные revision, down_revision и остальные идентификаторы.
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table("books",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(), nullable=False))

def downgrade():
    op.drop_table("books")`;

const labData = `from contextlib import closing
from pathlib import Path
import sqlite3

path = Path("books.sqlite3").resolve(strict=True)
with closing(sqlite3.connect(path.as_uri() + "?mode=rw", uri=True)) as db:
    with db:
        db.execute("INSERT INTO books (id, title) VALUES (?, ?)", (1, "Atlas"))
        db.execute("INSERT INTO books (id, title) VALUES (?, ?)", (2, "Map"))
        print(db.execute("SELECT id, title FROM books ORDER BY id").fetchall())`;

const labInspect = `from contextlib import closing
from pathlib import Path
import sqlite3

path = Path("books.sqlite3").resolve(strict=True)
with closing(sqlite3.connect(path.as_uri() + "?mode=ro", uri=True)) as db:
    print(db.execute("PRAGMA table_info(books)").fetchall())
    print(db.execute("SELECT id, title, note FROM books ORDER BY id").fetchall())`;

const labUpdate = `from contextlib import closing
from pathlib import Path
import sqlite3

path = Path("books.sqlite3").resolve(strict=True)
with closing(sqlite3.connect(path.as_uri() + "?mode=rw", uri=True)) as db:
    with db:
        cursor = db.execute("UPDATE books SET note = ? WHERE id = ?", ("черновик", 1))
        print("изменено:", cursor.rowcount)
        print(db.execute("SELECT id, note FROM books ORDER BY id").fetchall())`;

export function Lesson84_1({ module }: { module?: string }) {
  return (
    <RichLesson>
      <RichHero chip={module ?? "Изменение заполненной схемы"} title="Готовим и применяем расширение схемы" intro="Добавим необязательное поле так, чтобы существующие данные и привычные интерфейсы сохранились." variant="project" />
      <Section number="00" title="От проверенного baseline к изменению">
        <Lead>Схема заполненной копии уже сопоставлена с исходной ревизией. Теперь изменим схему, сохраняя возможность проверить каждый переход.</Lead>
        <LinkedNotes variant="connected" items={[
          { title: "Опора", description: "Есть проверенный резерв, восстановленная база и отдельная заполненная копия с известной исходной ревизией." },
          { title: "Вопрос", description: "Как добавить поле и убедиться, что реальные таблицы и существующие записи соответствуют новой модели?" },
          { title: "Результат", description: "Проверим отдельную ревизию на новой и заполненной учебных базах и сохраним прежний контракт приложения." },
        ]} />
        <p>Метка ревизии говорит, что записано в истории базы, но сама по себе не доказывает соответствие таблиц. До изменения проверяем путь, резерв, структуру и данные. Новую модель не запускаем против базы до её обновления.</p>
      </Section>
      <Section number="01" title="Модель, metadata и настоящая таблица">
        <Lead>Описание таблицы в Python и схема в файле базы живут отдельно. Изменение одного не переписывает другое.</Lead>
        <p>SQLAlchemy собирает описание объявленных таблиц в metadata. Аннотация `Mapped[str | None]` разрешает в Python строку или отсутствие значения; `nullable=True` явно задаёт допустимость SQL NULL в столбце. NULL означает отсутствие значения и отличается от пустой строки.</p>
        <p>Посмотрим на независимый пример каталога книг. Таблица в памяти содержит только идентификатор, а модель дополнительно описывает необязательную заметку. Соединение в `engine.begin()` выполняет создание и вставку в транзакции. После выхода из блока изменения подтверждаются.</p>
        <CodeBlock code={metadataExample} caption="Самостоятельный пример с SQLite в памяти" />
        <p>Первая строка вывода: `['id', 'note']`; следующая: `VARCHAR True`, последняя: `['id']`. Через `Book.__table__.c.note` мы прочитали тип и разрешение NULL из metadata. Список через `inspect` показывает фактическую таблицу. `create_all` создаёт отсутствующие таблицы, но не добавляет столбцы в существующую. Поэтому после изменения модели нужна отдельная миграция. Если добавить ещё одно поле только в класс, оно не появится в существующей таблице.</p>
      </Section>
      <Section number="02" title="Ревизия как предложение изменения">
        <p>Alembic хранит изменения в файлах истории. `revision` определяет новую ревизию, `down_revision` указывает её родителя, `upgrade` выполняет переход вперёд, а `downgrade` описывает обратный переход. Удаление столбца при откате может уничтожить значения, поэтому обратный путь схемы не заменяет резерв данных.</p>
        <p>Автогенерация сравнивает выбранную фактическую базу с metadata и создаёт только кандидат. В файле кандидата необходимо проверить родителя и каждую операцию: посторонние изменения или пропущенные отличия нельзя считать правильными только потому, что инструмент создал файл.</p>
        <p>Проведём отдельную пробу на каталоге книг, не меняя Planner. Из папки `project/` в PowerShell создаём новый каталог `lab_books` и переходим в него. Команда `python -m alembic` запускает установленный модуль тем же интерпретатором проекта; путь ниже относится к Windows. `init` создаёт конфигурацию и каталог истории, `revision -m` создаёт файл с описанием, а `upgrade head` применяет ещё не выполненные ревизии до вершины истории. Если каталог уже существует, не перезаписываем его: выбираем новое имя и используем его последовательно.</p>
        <CodeBlock code={labCommands} caption="Порядок подготовки независимой истории" />
        <p>В новом `lab_books/model.py` сохраняем модель ниже. В `alembic.ini` задаём `sqlalchemy.url = sqlite:///books.sqlite3`. В `migrations/env.py` добавляем `from model import Base` и заменяем `target_metadata = None` на `target_metadata = Base.metadata`. Теперь команды из `lab_books/` используют только расположенный здесь файл `books.sqlite3`. Для учебного примера это собственная настройка; история Planner использует явно заданный `DATABASE_URL`.</p>
        <CodeBlock code={labModel} caption="Начальная metadata каталога книг" />
        <p>После `revision -m` открываем созданный файл в `migrations/versions/`, сохраняем сгенерированные идентификаторы и заменяем функции следующими. `create_table` создаёт исходную таблицу, `drop_table` удалил бы её при откате. Для исходной ревизии родитель равен `None`. Код ниже дополняет сохранённые строки идентификаторов файла, не заменяет их.</p>
        <CodeBlock code={labRevision} caption="Операции исходной ревизии" />
        <p>После `upgrade head` добавим две строки. Сохраним пример как `lab_books/seed.py` и запустим из `lab_books/` командой `../.venv/Scripts/python.exe seed.py`. Знаки `?` передают значения отдельно от SQL. `resolve(strict=True)` требует существующий файл, а URI с `mode=rw` открывает его для записи без создания нового. Внутренний `with db` подтверждает транзакцию при успехе или откатывает при ошибке; внешний `closing` закрывает соединение. Ожидаем `[(1, 'Atlas'), (2, 'Map')]`.</p>
        <CodeBlock code={labData} caption="Две синтетические книги" />
        <p>Теперь добавим в класс `Book` строку `note: Mapped[str | None] = mapped_column(String, nullable=True)`, сохраним модель и из `lab_books/` выполним `../.venv/Scripts/python.exe -m alembic revision --autogenerate -m "book note"`. Ключ `--autogenerate` просит сравнить текущую базу с metadata; `-m` задаёт название файла. Откроем созданный файл: родитель должен совпасть с исходной ревизией, `upgrade` содержать добавление только `books.note`, а `downgrade` его удаление. Реальные идентификаторы берём из собственных файлов. Если предложено лишнее, исправляем кандидат и выясняем причину до применения.</p>
        <p>Первая проба: до применения найдите в кандидате идентификатор родителя и предскажите, какие значения будут у старых книг. Наличие новой строки в модели ещё не изменило таблицу.</p>
      </Section>
      <Section number="03" title="Применение и повтор">
        <p>После проверки файла применяем историю сначала к пустой учебной базе, затем к отдельной заполненной копии. Для каждой базы проверяем адрес, текущую ревизию и фактическую структуру. У старых строк нового необязательного столбца без значения по умолчанию ожидается NULL. Повторный upgrade до уже достигнутого head не должен добавлять столбец снова.</p>
        <p>SQLite поддерживает простое добавление столбца с ограничениями, зависящими от операции и версии. Для более сложных изменений может потребоваться перенос таблицы через batch: при этом отдельно проверяют ограничения CHECK, индексы и внешние ключи. Для добавления простого nullable столбца перестроение обычно не требуется.</p>
        <p>В примере из `lab_books/` выполним `../.venv/Scripts/python.exe -m alembic upgrade head`, затем команды `current` и `heads` тем же способом. Сохраним следующий код как `inspect_books.py` и запустим `../.venv/Scripts/python.exe inspect_books.py`. `PRAGMA table_info` показывает состав фактической таблицы; в строке `note` значение признака notnull равно 0. Выборка вернёт `[(1, 'Atlas', None), (2, 'Map', None)]`: Python отображает SQL NULL как `None`.</p>
        <CodeBlock code={labInspect} caption="Проверяем фактическую схему и старые строки" />
        <p>Повторим `upgrade head`, потом `inspect_books.py`. Строки и столбцы остаются прежними: история уже достигла head. Ошибка или неожиданный результат означает остановку и диагностику, а не повтор команды вслепую или принудительную отметку ревизии.</p>
      </Section>
      <Section number="04" title="Расширение и данные">
        <p>Сначала добавляем необязательное поле, затем при необходимости отдельно заполняем данные и проверяем их. Ужесточение до обязательного поля является отдельным решением: оно требует проверить каждую строку и подготовить данные. В этом упражнении обязательность не вводим.</p>
        <p>SQL-изменение выполняется в транзакции на явно выбранной учебной копии. После подтверждения проверяем две разные строки: одна содержит непустой текст, другая NULL. Затем повторяем upgrade и сравниваем те же значения, идентификаторы и остальные поля.</p>
        <p>Для пробы сохраним код как `lab_books/update_books.py` и запустим его из `lab_books/`. Условие `WHERE id = ?` ограничивает изменение одной книгой. `execute` возвращает курсор, а `cursor.rowcount` показывает число изменённых строк: ожидаем 1. Вторая сохраняет NULL. После выхода из внутреннего блока запись подтверждена, внешний закрывает соединение; повторный запуск `inspect_books.py` покажет текст и `None`. Повторный `upgrade head` не должен изменить их.</p>
        <CodeBlock code={labUpdate} caption="Обновление одной синтетической записи" />
      </Section>
      <Section number="05" title="Явный вход в историю">
        <p>Создание таблиц через актуальную metadata без записи истории может оставить новую базу без понятной ревизии. Для пустой базы нужен явный маршрут через историю; для заполненной копии сначала проверяется соответствие известному baseline. При неизвестной схеме останавливаемся и выясняем состояние. Запуск API или CLI не должен незаметно выполнять upgrade.</p>
        <p>Безопасный отказ может завершить старую команду `raise SystemExit("Используйте явную миграцию; неизвестную схему сначала проверьте")`. Это не выполняет миграцию и оставляет решение человеку. Для новой базы выбираем новый файл и запускаем всю историю; для проверенной копии используем её подтверждённую текущую ревизию. При неизвестной базе не используем `stamp` ради устранения ошибки.</p>
        <p>Вернувшись в `project/` командой `Set-Location ..`, применим эти принципы к Planner. Исходный файл и ранний резерв не меняем. Ранее созданный инструмент согласованного снимка пригодится после проверки расширенной заполненной базы: при остановленных процессах он создаст новый `data/block17/post-expand.sqlite3`, который потребуется для последующего опыта восстановления.</p>
      </Section>
    </RichLesson>
  );
}

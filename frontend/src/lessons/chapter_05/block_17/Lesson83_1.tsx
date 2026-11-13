import { CodeBlock, LinkedNotes, RichLesson, Section } from "../../shared";

const miniatureModel = `# project/demo_model.py
from sqlalchemy import CheckConstraint, Column, Integer, MetaData, Table

metadata = MetaData()
books = Table(
    "books", metadata,
    Column("id", Integer, primary_key=True, nullable=False),
    Column("copies", Integer, nullable=False),
    CheckConstraint("copies >= 0", name="ck_books_copies"),
)`;

const miniGuard = `# Добавляем рядом с config = context.config в demo_history/env.py
import os
from pathlib import Path
from sqlalchemy.engine import make_url
raw = os.environ.get("DATABASE_URL")
if not raw:
    raise ValueError("Явно задайте DATABASE_URL")
from app.core.config import load_settings
from demo_model import metadata

url = load_settings(environment={"DATABASE_URL": raw}).database_url
if make_url(url).query:
    raise ValueError("Параметры URL не разрешены")
root = Path(__file__).resolve().parents[1]
allowed = {
    (root / "data/block17/books-generate.sqlite3").resolve(),
    (root / "data/block17/books-apply.sqlite3").resolve(),
}
if Path(make_url(url).database).resolve() not in allowed:
    raise ValueError("Для опыта выберите отдельную учебную базу книг")
config.set_main_option("sqlalchemy.url", url.replace("%", "%%"))
target_metadata = metadata`;

const miniCommands = `# PowerShell, из project/, один подготовленный интерпретатор
.venv/Scripts/python.exe -m alembic -c books.ini init books_history
# В books_history/env.py настройте target_metadata и проверку адреса, как описано выше.
$env:DATABASE_URL = 'sqlite:///data/block17/books-generate.sqlite3'
.venv/Scripts/python.exe -m alembic -c books.ini revision --autogenerate -m "create books"
# Откройте новый файл в books_history/versions и проверьте его до применения.
$env:DATABASE_URL = 'sqlite:///data/block17/books-apply.sqlite3'
.venv/Scripts/python.exe -m alembic -c books.ini upgrade <ID_ИЗ_ФАЙЛА>
.venv/Scripts/python.exe -m alembic -c books.ini current
.venv/Scripts/python.exe -m alembic -c books.ini history --verbose`;

const revisionExample = `# Пример содержимого исторической ревизии книг, ID для иллюстрации
from alembic import op
import sqlalchemy as sa

revision = "example_book_revision"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "books",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("copies", sa.Integer(), nullable=False),
        sa.CheckConstraint("copies >= 0", name="ck_books_copies"),
        sa.PrimaryKeyConstraint("id"),
    )

def downgrade():
    op.drop_table("books")`;

const defaultsExample = `# Отдельный пример, выполняется выбранным Python; база только в памяти
from sqlalchemy import Column, Integer, MetaData, Table, create_engine, text
from sqlalchemy.exc import IntegrityError

engine = create_engine("sqlite://")
metadata = MetaData()
books = Table(
    "books", metadata,
    Column("id", Integer, primary_key=True),
    Column("copies", Integer, nullable=False, default=2),
    Column("shelf", Integer, nullable=False, server_default=text("7")),
)
metadata.create_all(engine)
with engine.begin() as conn:
    conn.execute(books.insert().values(id=1))
    print(conn.execute(text("SELECT id, copies, shelf FROM books")).all())
    print(conn.execute(text("SELECT sql FROM sqlite_master WHERE name='books'")).scalar_one())
with engine.connect() as conn:
    try:
        conn.execute(text("INSERT INTO books (id) VALUES (2)"))
        conn.commit()
    except IntegrityError:
        conn.rollback()
        print("copies обязателен при прямом SQL")
    print(conn.execute(text("SELECT id FROM books ORDER BY id")).all())
engine.dispose()`;

const inspectExample = `# Из project/, после применения примера к books-apply.sqlite3
import sqlite3

con = sqlite3.connect("data/block17/books-apply.sqlite3")
try:
    print(con.execute("PRAGMA table_info(books)").fetchall())
    print(con.execute("SELECT sql FROM sqlite_master WHERE name = ?", ("books",)).fetchone())
    print(con.execute("PRAGMA index_list(books)").fetchall())
    print(con.execute("PRAGMA foreign_key_list(books)").fetchall())
    print(con.execute("SELECT type, name, sql FROM sqlite_master "
                      "WHERE type IN ('view', 'trigger') ORDER BY type, name").fetchall())
    con.execute("INSERT INTO books (id, copies) VALUES (?, ?)", (1, 3))
    con.commit()
    try:
        con.execute("INSERT INTO books (id, copies) VALUES (?, ?)", (2, -1))
        con.commit()
    except sqlite3.IntegrityError as error:
        con.rollback()
        print("Ожидаемый отказ:", error)
    print(con.execute("SELECT id, copies FROM books ORDER BY id").fetchall())
finally:
    con.close()`;

const testExample = `# project/tests/test_books_migration.py
import os
import shutil
import sqlite3
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]

def test_books_history_on_empty_database(tmp_path):
    # Копируем только пример и настройки в новый временный project/.
    shutil.copytree(ROOT / "books_history", tmp_path / "books_history",
                    ignore=shutil.ignore_patterns("__pycache__"))
    shutil.copytree(ROOT / "app", tmp_path / "app",
                    ignore=shutil.ignore_patterns("__pycache__"))
    shutil.copy2(ROOT / "books.ini", tmp_path / "books.ini")
    shutil.copy2(ROOT / "demo_model.py", tmp_path / "demo_model.py")
    (tmp_path / "data/block17").mkdir(parents=True)
    env = os.environ.copy()
    env["DATABASE_URL"] = "sqlite:///data/block17/books-apply.sqlite3"

    def alembic(*args):
        return subprocess.run(
            [sys.executable, "-m", "alembic", "-c", "books.ini", *args],
            cwd=tmp_path, env=env, check=True, capture_output=True, text=True,
        )

    heads = alembic("heads").stdout
    alembic("upgrade", "head")
    with sqlite3.connect(tmp_path / "data/block17/books-apply.sqlite3") as con:
        ddl = con.execute("SELECT sql FROM sqlite_master WHERE name='books'").fetchone()[0]
        revision = con.execute("SELECT version_num FROM alembic_version").fetchone()[0]
        assert revision in heads
        assert "ck_books_copies" in ddl and "copies >= 0" in ddl
        con.execute("INSERT INTO books VALUES (1, 3)")
        con.commit()
        with pytest.raises(sqlite3.IntegrityError):
            con.execute("INSERT INTO books VALUES (2, -1)")
        con.rollback()
        assert con.execute("SELECT * FROM books").fetchall() == [(1, 3)]
    alembic("upgrade", revision)
    with sqlite3.connect(tmp_path / "data/block17/books-apply.sqlite3") as con:
        assert con.execute("SELECT * FROM books").fetchall() == [(1, 3)]
        assert con.execute("SELECT version_num FROM alembic_version").fetchone()[0] == revision`;

export function Lesson83_1() {
  return (
    <RichLesson>
      <h1>Создаём baseline для новой базы</h1>
      <Section number="00" title="От истории к воспроизводимой схеме">
        <LinkedNotes variant="connected" items={[
          { title: "Уже подготовлено", description: "У нас есть опись схемы, проверенная копия данных и настроенная история Alembic с пустым каталогом ревизий." },
          { title: "Новый вопрос", description: "Как из пустой базы получить именно исходную схему, даже если модель проекта потом изменится?" },
          { title: "Результат", description: "Создадим и проверим начальную ревизию, затем воспроизведём её на двух независимых пустых учебных базах." },
        ]} />
        <p>Baseline здесь означает исходную точку истории: файл с операциями, создающими согласованную начальную схему. Модель описывает её в коде сегодня, ревизия сохраняет конкретные операции, фактическая схема находится в SQLite, а отметка версии сообщает Alembic, какие ревизии применены. Это четыре разных свидетельства.</p>
      </Section>
      <Section number="01" title="Ревизия создаёт схему">
        <p>У каждой ревизии есть идентификатор revision и ссылка down_revision на предшественника. У первой ссылки нет: None. В upgrade записываем действия вперёд. Alembic выполняет их по порядку и сохраняет идентификатор в служебной таблице alembic_version. Наличие отметки само по себе не доказывает, что таблицы соответствуют ожиданиям.</p>
        <p>Посмотрим на отдельный каталог книг. Здесь ограничение разрешает ноль и положительное число экземпляров. Это полный пример формы ревизии, не файл Planner. Настоящий идентификатор будет сгенерирован инструментом.</p>
        <CodeBlock code={revisionExample} />
        <p>Операции явно называют столбцы и ограничение. Вызов текущей Base.metadata.create_all внутри старой ревизии использовать нельзя: при изменении модели он создаст уже другую схему, а история должна воспроизводить исходную. downgrade показан для понимания структуры файла; возможность безопасного отката данных нужно оценивать отдельно.</p>
      </Section>
      <Section number="02" title="Кандидат автогенерации">
        <p>Автогенерация сравнивает metadata модели с выбранной базой и предлагает файл ревизии. Это кандидат, а не сертификат соответствия: сравнение зависит от возможностей версии и диалекта. Проверяем имена и выражения CHECK, типы, обязательность и остальные объекты по исходной описи, затем при необходимости правим операции вручную до применения.</p>
        <p>Например, если в кандидате для книг стоит copies &gt; 0, а договор допускает ноль, нужно заменить условие на copies &gt;= 0. Сама отметка версии эту ошибку не исправит.</p>
        <h3>Первая проба на отдельной модели</h3>
        <p>Создадим файл project/demo_model.py. Он не меняет модель Planner:</p>
        <CodeBlock code={miniatureModel} />
        <p>Для опыта используем отдельную историю книг, а не каталог миграций Planner. Из project/ запустим первую команду ниже. В созданном books_history/env.py найдём строку config = context.config и добавим после неё следующий код. Заменим существующее target_metadata = None на target_metadata = metadata, чтобы позднее присваивание не отменило настройку. Имя books_history в примере настройки означает созданный каталог.</p>
        <CodeBlock code={miniGuard.replace("demo_history/env.py", "books_history/env.py")} />
        <p>Переменную текущего процесса читаем до импорта app.core.config: этот модуль умеет загружать .env, а нам нужна явно заданная цель. Передаём её в load_settings, которая нормализует относительный URL; параметры URL и чужие пути отклоняем до подключения. Для демонстрации оба файла книг должны быть новыми; не выбираем исходник, снимок или восстановленную копию. Убедимся, что data/block17 существует. В созданном env.py настройки online и offline используют config; если там уже есть другое присваивание URL, уберём его конфликт до опыта.</p>
        <CodeBlock code={miniCommands} />
        <p>Вместо записи в угловых скобках подставляем реальный revision из созданного файла, без скобок. --autogenerate просит сравнение, -m задаёт подпись, -c выбирает отдельный конфигурационный файл, upgrade применяет ревизию, current показывает отметку базы, history --verbose показывает граф и родителя. Команды выполняем только после проверки адреса. После генерации проверяем, что down_revision равен None; затем сверяем операции с моделью книг и применяем проверенный файл ко второму новому пути.</p>
      </Section>
      <Section number="03" title="Значение Python и SQL DEFAULT">
        <p>default в модели может подставляться SQLAlchemy при формировании INSERT. server_default записывается в DDL, то есть в определение таблицы, и применяется самой базой при пропуске поля. Это не одно и то же. Посмотрим на независимый пример с базой в памяти:</p>
        <CodeBlock code={defaultsExample} />
        <p>Первая строка содержит (1, 2, 7): SQLAlchemy передал copies=2, а SQLite подставил shelf=7. В DDL виден DEFAULT для shelf, но не для copies. Прямой SQL не использует Python default, поэтому вторая вставка нарушает NOT NULL; rollback отменяет неудачную транзакцию, и остаётся только id=1. Для Planner сравниваем фактический SQL DEFAULT с описью, не добавляя его из одного лишь наличия default в модели.</p>
      </Section>
      <Section number="04" title="Проверяем схему и поведение">
        <p>PRAGMA table_info показывает имена, типы, NOT NULL, SQL default и PK. Текст CHECK ищем в SQL создания таблицы в sqlite_master: table_info его не показывает. Индексы, внешние ключи, представления и триггеры тоже сравниваем с описью, а служебную alembic_version учитываем отдельно.</p>
        <p>Следующий независимый файл можно сохранить как project/inspect_books.py и запустить из project/ выбранным Python после применения ревизии книг. Он записывает только синтетические данные в books-apply.sqlite3; для повторной пробы нужен новый пустой путь или предварительная уборка своей строки.</p>
        <CodeBlock code={inspectExample} />
        <p>Ожидаем именованное ограничение в SQL, отказ для -1 и строку [(1, 3)] после rollback. При повторном upgrade к той же revision данные и схема должны остаться прежними. Запишем их до повтора, вызовем upgrade ещё раз и сравним. Затем удалим только свою учебную строку и убедимся, что таблица пуста.</p>
        <p>Проверка одной metadata не запускает историю. Для первой пробы сохраним следующий тест в project/tests/test_books_migration.py. tmp_path даёт отдельную временную папку; туда копируются только учебная история книг и необходимые ей настройки проекта. Проверка путей в скопированном env.py теперь разрешает файлы внутри этой временной папки, а не произвольную базу.</p>
        <CodeBlock code={testExample} />
        <p>Из project/ запустим .venv/Scripts/python.exe -m pytest -q tests/test_books_migration.py. subprocess.run с check=True останавливает тест при ошибке команды; sys.executable выбирает тот же Python, что выполняет pytest. Проверяются настоящий upgrade, DDL, версия, отказ CHECK и сохранность строки после повтора. Сам тест не обращается к исходной базе Planner.</p>
      </Section>
      <Section number="05" title="Применяем способ к Planner">
        <p>В своём project/ сначала сверим адреса и сохранённую опись с app/DBase/models.py и исходным DDL. В ранее созданном alembic/env.py точная проверка допускает только history-probe.sqlite3. Для новой работы изменяем именно разрешённые пути: после нормализации сравниваем путь с двумя заранее выбранными свежими файлами, сохраняя проверку отсутствия параметров и требование явного DATABASE_URL. Как и в примере книг, проверка должна сработать до подключения. Путь будущей копии для upgrade и все заполненные базы в разрешённый набор не входят.</p>
        <p>Для генерации и двух применений выбираем только новые учебные пути. Ревизию читаем и проверяем до запуска, затем сравниваем фактическую схему и поведение каждой базы с исходным договором. Несовпадение или неясный адрес останавливает работу.</p>
        <p>Заполненная восстановленная копия пока остаётся без новой отметки. В следующей теме сравним её фактическую схему с созданным baseline до решения о включении в историю.</p>
      </Section>
    </RichLesson>
  );
}

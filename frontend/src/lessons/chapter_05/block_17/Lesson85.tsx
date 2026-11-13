import { Callout, CodeBlock, Lead, LinkedNotes, RichHero, RichLesson, Section } from "../../shared";

const failureExample = `# failure_demo.py: самостоятельный пример вне Planner
from pathlib import Path
import sqlite3
from alembic import command
from alembic.config import Config

root = Path("data/block17/products-demo")
if root.exists():
    raise SystemExit("Каталог пробы уже существует")
root.mkdir(parents=True)
history = root / "history"
versions = history / "versions"
versions.mkdir(parents=True)
database = root / "products.sqlite3"
(history / "env.py").write_text('''
from alembic import context
from sqlalchemy import create_engine
url = context.config.attributes["url"]
engine = create_engine(url)
with engine.connect() as connection:
    context.configure(connection=connection)
    with context.begin_transaction():
        context.run_migrations()
engine.dispose()
''', encoding="utf-8")
(versions / "base.py").write_text('''
from alembic import op
import sqlalchemy as sa
revision = "base_demo"
down_revision = None
branch_labels = None
depends_on = None
def upgrade():
    op.create_table("products", sa.Column("id", sa.Integer, primary_key=True),
                    sa.Column("name", sa.String, nullable=False))
def downgrade():
    op.drop_table("products")
''', encoding="utf-8")
cfg = Config()
cfg.set_main_option("script_location", str(history))
cfg.attributes["url"] = "sqlite:///" + database.as_posix()
command.upgrade(cfg, "base_demo")
db = sqlite3.connect(database)
try:
    db.execute("INSERT INTO products (id, name) VALUES (1, 'чай')")
    db.commit()
finally:
    db.close()
(versions / "failure.py").write_text('''
from alembic import op
import sqlalchemy as sa
revision = "failure_demo"
down_revision = "base_demo"
branch_labels = None
depends_on = None
def upgrade():
    op.add_column("products", sa.Column("note", sa.String, nullable=True))
    raise RuntimeError("учебный отказ после изменения")
def downgrade():
    op.drop_column("products", "note")
''', encoding="utf-8")
try:
    command.upgrade(cfg, "head")
except RuntimeError as error:
    print("Отказ:", error)
db = sqlite3.connect(database)
try:
    print("Версия:", db.execute("SELECT version_num FROM alembic_version").fetchall())
    print("Столбцы:", db.execute("PRAGMA table_info(products)").fetchall())
    print("Данные:", db.execute("SELECT id, name FROM products").fetchall())
finally:
    db.close()
`;

const inspectionExample = `import sqlite3

db = sqlite3.connect(":memory:")
try:
    db.executescript("""
        CREATE TABLE shelves (id INTEGER PRIMARY KEY);
        CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL,
            shelf_id INTEGER REFERENCES shelves(id), CHECK(length(title) > 0));
        CREATE INDEX ix_books_title ON books(title);
        INSERT INTO shelves VALUES (1);
        INSERT INTO books VALUES (7, 'Python', 1);
    """)
    for query in (
        "SELECT type, name, tbl_name, sql FROM sqlite_schema WHERE sql IS NOT NULL ORDER BY type, name",
        "PRAGMA table_info(books)", "PRAGMA index_list(books)",
        "PRAGMA foreign_key_list(books)", "PRAGMA foreign_keys",
        "PRAGMA foreign_key_check", "SELECT id, title, shelf_id FROM books ORDER BY id",
    ):
        print(query, db.execute(query).fetchall())
finally:
    db.close()`;

const recoveryExample = `# из project/, после закрытия соединений; все три имени новые учебные
.venv/Scripts/python.exe backup_lab/snapshot.py --source data/block17/books-snapshot.sqlite3 --destination data/block17/books-restored.sqlite3 --root data/block17
$LASTEXITCODE`;

const booksExample = `# books_demo.py, запустить из project/ подготовленным Python
from pathlib import Path
import sqlite3
root = Path("data/block17")
root.mkdir(parents=True, exist_ok=True)
source = root / "books-snapshot.sqlite3"
if source.exists():
    raise SystemExit("Имя снимка занято: не перезаписываем")
db = sqlite3.connect(source)
try:
    db.execute("CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT NOT NULL)")
    db.executemany("INSERT INTO books VALUES (?, ?)", [(1, "Путь"), (2, "Лес")])
    db.commit()
finally:
    db.close()
print("Создано:", source.resolve())`;

const compareBooks = `# compare_books.py, из project/
from pathlib import Path
import sqlite3

def inventory(path):
    path = Path(path)
    if not path.is_file():
        raise FileNotFoundError(path)
    db = sqlite3.connect(path.resolve().as_uri() + "?mode=ro", uri=True)
    try:
        schema = db.execute("SELECT type, name, tbl_name, sql FROM sqlite_schema "
                            "WHERE sql IS NOT NULL ORDER BY type, name").fetchall()
        rows = db.execute("SELECT id, title FROM books ORDER BY id").fetchall()
        return schema, rows
    finally:
        db.close()

original = inventory("data/block17/books-snapshot.sqlite3")
restored = inventory("data/block17/books-restored.sqlite3")
expected = [(1, "Путь"), (2, "Другое")]
print("Совпадают схема и строки:", original == restored)
print("Совпадает отдельная опись:", restored[1] == expected)`;

const isolatedHistory = `# Из project/: первый запуск, все назначения должны быть свободны
.venv/Scripts/python.exe -c "from pathlib import Path; import shutil; src=Path('alembic'); dst=Path('failure_history'); ini=Path('failure.ini'); assert src.is_dir() and not dst.exists() and not ini.exists(); shutil.copytree(src, dst, ignore=shutil.ignore_patterns('__pycache__', '*.pyc')); shutil.copyfile('alembic.ini', ini)"
$LASTEXITCODE
# В failure.ini изменить только script_location на failure_history.
# В failure_history/env.py явно разрешить только выбранный failure.sqlite3.
$env:DATABASE_URL = 'sqlite:///data/block17/failure.sqlite3'
.venv/Scripts/python.exe -m alembic -c failure.ini current
$LASTEXITCODE
.venv/Scripts/python.exe -m alembic -c failure.ini revision -m "controlled failure"
$LASTEXITCODE`;

const inventoryTool = `# planner_inventory.py; из project/: Python planner_inventory.py путь/к/базе
from pathlib import Path
import json
import sqlite3
import sys

path = Path(sys.argv[1]).resolve()
if not path.is_file():
    raise SystemExit("База не найдена: " + str(path))
db = sqlite3.connect(path.as_uri() + "?mode=ro", uri=True)
try:
    schema = db.execute("SELECT type, name, tbl_name, sql FROM sqlite_schema "
                        "WHERE sql IS NOT NULL ORDER BY type, name").fetchall()
    names = {row[1] for row in schema}
    version = (db.execute("SELECT version_num FROM alembic_version ORDER BY version_num").fetchall()
               if "alembic_version" in names else None)
    report = {
        "schema": schema,
        "columns": db.execute("PRAGMA table_info(tasks)").fetchall(),
        "indexes": db.execute("PRAGMA index_list(tasks)").fetchall(),
        "foreign_keys": db.execute("PRAGMA foreign_key_list(tasks)").fetchall(),
        "fk_setting": db.execute("PRAGMA foreign_keys").fetchone(),
        "fk_errors": db.execute("PRAGMA foreign_key_check").fetchall(),
        "version": version,
        "rows": db.execute("SELECT id, title, priority, is_done, tags, "
                           "title_normalized, description FROM tasks ORDER BY id").fetchall(),
    }
    print(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True))
finally:
    db.close()`;

export function Lesson85() {
  return (
    <RichLesson>
      <RichHero chip="Базы данных" title="Ошибка миграции и безопасное восстановление" intro="Разберём, как исследовать последствия отказа и вернуться к проверенному состоянию данных." />
      <Section number="00" title="От расширения к отказу">
        <LinkedNotes variant="connected" items={[{ title: `Опора`, description: `Мы сохранили согласованный снимок и проверили версию расширенной схемы. Ранний резерв до расширения сохраняем отдельно.` }, { title: `Теперь`, description: `На одноразовой копии изучим последствия отказа, а затем восстановим снимок в новый файл и сверим результат.` }]} />
        <Lead>
          {"Ошибка процесса сообщает, что операция не завершилась. Но по одному сообщению нельзя определить, какие изменения успели сохраниться."}
        </Lead>
      </Section>
      <Section number="01" title="Какие следы оставляет ошибка">
        <p>
          {"Миграция состоит из действий над схемой и иногда над данными. Если после первого действия возникает исключение, процесс завершится с ненулевым кодом и покажет traceback: последовательность вызовов и сообщение об ошибке. Это свидетельство отказа, но не опись базы."}
        </p>
        <p>
          {"Проверим независимо три вещи: запись текущей ревизии Alembic, реальную структуру таблиц и содержимое строк. Например, новый столбец может уже присутствовать, хотя таблица версий ещё указывает на прежнюю ревизию. Возможен и другой результат: это зависит от конфигурации транзакций, драйвера и порядка команд."}
        </p>
        <p>
          {"Commit сохраняет завершённую транзакцию; rollback отменяет изменения в незавершённой транзакции. Нельзя по traceback угадать, где проходила её граница. В SQLite и драйвере Python поведение операций изменения схемы зависит от настроек, поэтому последствия проверяют новым соединением."}
        </p>
        <p>
          {"Проведём независимую пробу с товарами. Сохраним код в failure_demo.py и запустим из project/ тем же Python, в котором установлен Alembic: "}
          <code>
            {".venv/Scripts/python.exe failure_demo.py"}
          </code>
          {". Для пробы создаётся отдельный новый каталог data/block17/products-demo; если имя занято, программа останавливается до записи. Config задаёт расположение истории, а attributes передаёт адрес явно в env.py. Это программный способ вызвать тот же upgrade; ни одна база Planner не открывается."}
        </p>
        <CodeBlock code={failureExample} caption="Полная управляемая проба на отдельной учебной базе" />
        <p>
          {"Первая ревизия создаёт таблицу, затем отдельно подтверждается вставка товара. Вторая добавляет необязательный столбец и вызывает исключение. Обработчик печатает сообщение, после чего новое соединение показывает версию, фактические столбцы и строку. В зависимости от режима транзакции столбец note может сохраниться или отсутствовать. Само сообщение не доказывает ни один из этих исходов. В этой демонстрации исключение перехвачено ради чтения следов; при обычном запуске CLI ошибочная команда вернёт ненулевой код."}
        </p>
        <p>
          {"Попробуем перед запуском предположить, что будет с товаром, вставленным и подтверждённым до опыта. После запуска сравним предположение с данными и отдельно посмотрим отметку и столбцы. Если сценарий завершился ошибкой раньше учебного исключения, сначала устраняем ошибку окружения; это не результат опыта."}
        </p>
        <p>
          {"В проекте мы не добавляем эксперимент в принятую историю. Создадим её отдельную копию: copytree копирует каталог и отказывает, если назначение уже существует, copyfile копирует ini. Параметр ignore исключает __pycache__ и файлы .pyc: иначе копия может использовать устаревший скомпилированный env.py после изменения проверки пути. Команда ниже сначала проверяет свободные имена. Если копирование прервалось, не запускаем его поверх частично созданного каталога; разбираемся с результатом отдельно. Копия env.py по-прежнему находится непосредственно внутри project/, поэтому её относительный корень проекта остаётся прежним."}
        </p>
        <CodeBlock code={isolatedHistory} caption="Отдельная история и настройка для опыта" />
        <p>
          {"Опция "}
          <code>
            {"-c failure.ini"}
          </code>
          {" выбирает отдельную конфигурацию Alembic. В ней script_location выбирает скопированные файлы истории. В копии env.py сохраняем проверку URL до подключения, но разрешаем только абсолютный путь одноразовой копии failure.sqlite3; исходник и резервы должны отклоняться. Current читает выбранную базу, revision создаёт файл после текущего head файлов истории. В новом файле сохраняем созданные revision и down_revision: родитель должен совпасть с записанным head снимка. В upgrade можно добавить nullable столбец через op.add_column и затем вызвать RuntimeError, как в опыте с товарами. Для реального запуска "}
          <code>
            {"upgrade head"}
          </code>
          {" всегда используем ту же отдельную конфигурацию; сразу записываем $LASTEXITCODE и сообщение."}
        </p>
        <p>
          {"Проверьте защиту отдельно: задайте DATABASE_URL с другим новым именем и выполните current через failure.ini. Ожидаем ненулевой код и отсутствие нового файла. После пробы верните адрес одноразовой копии. Если имя ревизии неизвестно или проверка пропускает исходник, запуск отказа запрещён до исправления настройки."}
        </p>
        <Callout>
          {"Не запускайте повтор и не меняйте метку версии, пока фактическое состояние неизвестно. Сначала сохраните наблюдения и выберите проверенный снимок."}
        </Callout>
      </Section>
      <Section number="02" title="Структура, данные и восстановление">
        <p>
          {"SQLite хранит определения объектов в sqlite_schema. PRAGMA table_info показывает столбцы, index_list перечисляет индексы, а foreign_key_list описывает ссылки. foreign_keys показывает настройку текущего соединения, а foreign_key_check отдельно ищет нарушения в данных. Пустой список нарушений не означает, что нужные ограничения вообще существуют: их определения тоже нужно сравнить."}
        </p>
        <p>
          {"При перестроении таблицы инструмент может создать новую таблицу, перенести строки и заменить старую. Поэтому сравниваем также ограничения CHECK, внешние ключи и индексы. Для версии проверяем таблицу alembic_version; её отсутствие тоже наблюдение."}
        </p>
        <p>
          {"Следующий полный пример создаёт отдельную базу в памяти, печатает определения схемы, столбцы, индексы, связи и строки, затем закрывает соединение. Сохраним его как inspect_demo.py и выполним из project/ через "}
          <code>
            {".venv/Scripts/python.exe inspect_demo.py"}
          </code>
          {". Настройка foreign_keys относится именно к этому соединению; менять её внутри открытой транзакции нельзя. Наличие связи в схеме и её проверка на строках отвечают на разные вопросы."}
        </p>
        <CodeBlock code={inspectionExample} caption="Опись независимой схемы книг" />
        <p>
          {"В выводе есть индекс ix_books_title, ссылка на shelves и строка с id 7. Попробуем сравнить его с описью без индекса: список индексов выявит пропуск, хотя количество книг совпало. Затем найдём значение foreign_keys: оно относится только к соединению примера, а не ко всем будущим соединениям."}
        </p>
        <p>
          {"Для переноса на Planner сохраним следующую программу как planner_inventory.py в project/. Она принимает путь первым аргументом, проверяет существование файла и открывает его только для чтения. JSON сохраняет структуру и все семь полей строк. Поле version равно null, если служебной таблицы нет; это не то же самое, что подтверждённая ревизия. fk_setting относится к этому соединению, а fk_errors содержит обнаруженные нарушения."}
        </p>
        <CodeBlock code={inventoryTool} caption="Опись конкретной базы Planner" />
        <p>
          {"Например, команда "}
          <code>
            {".venv/Scripts/python.exe planner_inventory.py data/block17/upgrade.sqlite3"}
          </code>
          {" печатает опись. Для сохранения в PowerShell можно добавить "}
          <code>
            {"> data/block17/upgrade-inventory.json"}
          </code>
          {" после проверки, что имя файла описи свободно. Сравниваем содержимое описи со снимком и восстановленными копиями, а не только числа строк. Если структура или запрос отличается от ожидаемого, это повод остановиться и выяснить причину."}
        </p>
        <p>
          {"Исходная база, резерв и рабочая копия имеют разные роли. Снимок после расширения содержит новую схему и значения description; ранний резерв сохраняет состояние до расширения. Не подменяйте один другим."}
        </p>
        <p>
          {"Остановите записи и закройте соединения. Восстанавливайте известный проверенный снимок только в ещё не существующий путь. Затем новым соединением сравните схему, ограничения, индексы, revision и все поля каждой строки, включая NULL. Проверьте, что приложение читает именно восстановленный адрес."}
        </p>
        <p>
          {"Попробуем на другом наборе. Сохраним код как books_demo.py и выполним из project/. Он создаёт новый учебный снимок с двумя книгами и отказывается занимать существующее имя. Затем из project/ запускаем уже подготовленный snapshot.py: он читает источник и создаёт новое назначение, не перезаписывая занятый файл. Если путь уже занят, остановимся и выберем другое новое имя внутри учебного каталога."}
        </p>
        <CodeBlock code={booksExample} caption="Создаём отдельный набор книг" />
        <CodeBlock code={recoveryExample} caption="Восстанавливаем в новый путь" />
        <p>
          {"Флаг --source задаёт снимок, --destination новое назначение, --root разрешённую область. Сразу после команды $LASTEXITCODE в PowerShell показывает её код: 0 означает успешное завершение, ненулевой код означает остановку. Он ещё не доказывает совпадение содержимого."}
        </p>
        <CodeBlock code={compareBooks} caption="Сравниваем снимок и восстановленный файл" />
        <p>
          {"Сохраним сравнение как compare_books.py и запустим из project/. Ожидаем True для сравнения схемы и строк, но False для отдельной описи: в ней намеренно указано другое название второй книги. Изменять снимок ради совпадения нельзя: нужно выяснить источник различия. Для Planner дополнительно сравниваем версию, индексы, ограничения и все поля задач."}
        </p>
        <p>
          {"Команда stamp меняет отметку версии, но не восстанавливает таблицы или данные. Downgrade может изменить схему, но не гарантирует возвращение потерянных значений. Если снимок или восстановленная копия не совпадает с описью, остановитесь и сохраните результаты проверки."}
        </p>
        <p>
          {"Чтобы убедиться, что Planner обращается именно к восстановленной базе, из project/ задаём в PowerShell "}
          <code>
            {"$env:DATABASE_URL = 'sqlite:///data/block17/recovered.sqlite3'"}
          </code>
          {" и смотрим нормализованный адрес через "}
          <code>
            {".venv/Scripts/python.exe -c \"from app.core.config import load_settings; print(load_settings().database_url)\""}
          </code>
          {". Только убедившись, что путь совпадает с проверенным recovered.sqlite3, запускаем "}
          <code>
            {".venv/Scripts/python.exe -m app.main"}
          </code>
          {", вводим знакомую команду "}
          <code>
            {"list"}
          </code>
          {", сверяем задачи и выходим командой "}
          <code>
            {"exit"}
          </code>
          {". Обычный CLI не показывает служебные tags и description: для них остаётся проверка полной описи."}
        </p>
        <p>
          {"Для повтора штатной истории создадим ещё одну копию alembic в retry_history и отдельную копию alembic.ini в retry.ini точно так же, как создавали failure_history и failure.ini. Исключим __pycache__ и *.pyc. В retry.ini укажем script_location = retry_history, а в retry_history/env.py разрешим до соединения только retry.sqlite3. Ревизии при этом остаются идентичны принятой истории; экспериментальный файл в неё не попадает. Версии среды запишем из project/: .venv/Scripts/python.exe --version, затем .venv/Scripts/python.exe -m alembic --version; SQLite и SQLAlchemy покажет .venv/Scripts/python.exe -c \"import sqlite3, sqlalchemy; print(sqlite3.sqlite_version, sqlalchemy.__version__)\". После каждого изменения env.py перед первой командой убедимся по неверному адресу, что защита действительно отказывает до создания файла. Затем используем -c retry.ini для current, heads и каждого upgrade."}
        </p>
      </Section>
    </RichLesson>
  );
}
